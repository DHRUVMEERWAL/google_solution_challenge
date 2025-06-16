const puppeteer = require("puppeteer");
const fs = require("fs");

(async () => {
  const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
  const page = await browser.newPage();
  await page.goto("https://web.telegram.org/", { waitUntil: "networkidle2" });

  console.log("📲 Waiting for QR code to appear (canvas element)...");
  await page.waitForSelector("canvas", { timeout: 30000 }).catch(() => {
    console.warn("⚠️ QR code not found — might already be logged in.");
  });

  console.log("⏳ Now waiting for chat list UI ('.chatlist-top') to load...");

  // ✅ Wait for Telegram to fully log in (chat list appears)
    await page.waitForSelector("div.chatlist-top", { timeout: 120000 });
    await new Promise(res => setTimeout(res, 5000)); // buffer delay

    const client = await page.target().createCDPSession();
    const allCookies = (await client.send("Network.getAllCookies")).cookies;
    fs.writeFileSync("cookies.json", JSON.stringify(allCookies, null, 2));

    console.log("🍪 Cookies saved to cookies.json");

  await browser.close();
})();
