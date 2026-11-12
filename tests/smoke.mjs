import puppeteer from "puppeteer-core";

const chrome =
  process.env.CHROME_PATH ??
  "C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe";

const browser = await puppeteer.launch({
  executablePath: chrome,
  headless: "new",
  args: ["--no-sandbox", "--disable-gpu"],
});
const page = await browser.newPage();
const errors = [];
page.on("pageerror", (e) => errors.push(`pageerror: ${e.message}`));
page.on("console", (m) => {
  if (m.type() === "error") errors.push(`console: ${m.text()}`);
});

await page.goto("http://localhost:8787/", { waitUntil: "networkidle0" });
await page.waitForSelector("#assets-table tbody tr", { timeout: 10_000 });
const rows = await page.$$eval("#assets-table tbody tr", (els) => els.length);
const first = await page.$eval("#assets-table tbody tr", (el) => el.textContent.trim());
await page.click("#assets-table tbody tr");
await page.waitForSelector("#drawer.open", { timeout: 5_000 });
const title = await page.$eval("#drawer-title", (el) => el.textContent.trim());
const signals = await page.$$eval("#drawer-body table.signals tbody tr", (els) => els.length);
await page.click('nav button[data-tab="methodology"]');
const weights = await page.$eval("#methodology-body", (el) => el.textContent.includes("Weights by entity"));

console.log(JSON.stringify({ rows, first, title, signals, weights, errors }, null, 2));
await browser.close();
if (rows < 10 || signals < 3 || !weights || errors.length > 0) process.exitCode = 1;
