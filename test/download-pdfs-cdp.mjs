import { mkdir, readdir } from "node:fs/promises";

const port = Number(process.argv[2] || 9223);
const outputDir = process.argv[3];
const targetUrl = process.argv[4] || "https://sunspheread-ship-it.github.io/vimigo-ai-transformation-demo/?qa=pdf";
if (!outputDir) throw new Error("Usage: node test/download-pdfs-cdp.mjs <port> <output-dir>");

await mkdir(outputDir, { recursive: true });

function connect(url) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url);
    const pending = new Map();
    let id = 0;
    socket.addEventListener("open", () => {
      resolve({
        send(method, params = {}) {
          return new Promise((resolveCommand, rejectCommand) => {
            const commandId = ++id;
            pending.set(commandId, { resolve: resolveCommand, reject: rejectCommand });
            socket.send(JSON.stringify({ id: commandId, method, params }));
          });
        },
        close: () => socket.close(),
      });
    });
    socket.addEventListener("message", (event) => {
      const message = JSON.parse(event.data);
      if (!message.id || !pending.has(message.id)) return;
      const callbacks = pending.get(message.id);
      pending.delete(message.id);
      if (message.error) callbacks.reject(new Error(message.error.message));
      else callbacks.resolve(message.result);
    });
    socket.addEventListener("error", reject);
  });
}

const sleep = (milliseconds) => new Promise((resolve) => setTimeout(resolve, milliseconds));
const endpoint = `http://127.0.0.1:${port}`;
let version;
for (let attempt = 0; attempt < 30; attempt += 1) {
  try {
    version = await fetch(`${endpoint}/json/version`).then((response) => response.json());
    break;
  } catch {
    await sleep(250);
  }
}
if (!version) throw new Error("Chrome DevTools endpoint did not start.");

const browser = await connect(version.webSocketDebuggerUrl);
await browser.send("Browser.setDownloadBehavior", {
  behavior: "allow",
  downloadPath: outputDir,
  eventsEnabled: true,
});

const targets = await fetch(`${endpoint}/json/list`).then((response) => response.json());
const pageTarget = targets.find((target) => target.type === "page");
if (!pageTarget) throw new Error("No page target found.");
const page = await connect(pageTarget.webSocketDebuggerUrl);
await page.send("Page.enable");
await page.send("Runtime.enable");
await page.send("Page.navigate", { url: targetUrl });

const evaluate = async (expression) => {
  const result = await page.send("Runtime.evaluate", {
    expression,
    awaitPromise: true,
    returnByValue: true,
  });
  if (result.exceptionDetails) throw new Error(result.exceptionDetails.text);
  return result.result.value;
};

for (let attempt = 0; attempt < 60; attempt += 1) {
  if (await evaluate("document.readyState === 'complete' && Boolean(document.querySelector('[data-reset]'))")) break;
  await sleep(250);
}
await evaluate("document.querySelector('[data-reset]').click(); true");
await sleep(500);
await evaluate("document.querySelector('[data-step=reports]').click(); true");
await sleep(500);

for (const reportNumber of ["01", "02", "03", "04", "05", "06"]) {
  const before = (await readdir(outputDir)).filter((name) => name.toLowerCase().endsWith(".pdf")).length;
  await evaluate(`document.querySelector('[data-download-report="${reportNumber}"]').click(); true`);
  let completed = false;
  for (let attempt = 0; attempt < 180; attempt += 1) {
    await sleep(500);
    const files = (await readdir(outputDir)).filter((name) => name.toLowerCase().endsWith(".pdf"));
    const failed = await evaluate("document.querySelector('[data-download-status]')?.textContent?.startsWith('Download failed:') || false");
    if (failed) throw new Error(await evaluate("document.querySelector('[data-download-status]').textContent"));
    if (files.length > before) {
      completed = true;
      process.stdout.write(`Downloaded report ${reportNumber}\n`);
      break;
    }
  }
  if (!completed) throw new Error(`Timed out waiting for report ${reportNumber}.`);
}

page.close();
browser.close();
