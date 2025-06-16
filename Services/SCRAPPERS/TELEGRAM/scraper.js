// const puppeteer = require("puppeteer");
// const fs = require("fs");
// const { getSearchKeywords } = require("./utils");

// (async () => {
//   const browser = await puppeteer.launch({
//     headless: false,
//     defaultViewport: null,
//     args: ["--start-maximized"]
//   });

//   const page = await browser.newPage();
//   await page.goto("https://web.telegram.org/", { waitUntil: "networkidle2" });

//   console.log("📲 Scan the QR code in Telegram to log in...");

//   // Wait for post-login indicator (chat UI)
//   await page.waitForSelector("div[class='chatlist-top']", { timeout: 1200 });
//   console.log("✅ Login successful!");

//   // Wait briefly to ensure UI is fully loaded

//   const keywords = getSearchKeywords();

//   for (const keyword of keywords) {
//     console.log(`🔍 Searching: ${keyword}`);

//     // Wait for the search input to be available
//     await page.waitForSelector(".input-search input.input-search-input");
//     const searchInput = await page.$(".input-search input.input-search-input");

//     // Focus, clear, and type new keyword
//     await searchInput.click({ clickCount: 3 });
//     await page.keyboard.press("Backspace");
//     await searchInput.type(keyword, { delay: 100 });

//     await page.waitForTimeout(2500); // wait for search results to load

//     // TODO: Scrape search results if needed here

//     // Clear search field
//     await searchInput.click({ clickCount: 3 });
//     await page.keyboard.press("Backspace");
//     await page.waitForTimeout(1000);
//   }

//   console.log("✅ All keywords searched.");
//   await browser.close();
// })();


const fs = require("fs");
const path = require("path");
const puppeteer = require("puppeteer");
const { getHighRiskTitles } = require("../../csv_utils");
const { logError, saveDomSnapshot } = require("../../utils");

(async () => {
  const titles = await getHighRiskTitles("high_piracy_risk_ml_movies.csv");
  const results = [];

  const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
  const page = await browser.newPage();

  try {
    console.log("📲 Opening Telegram Web — please scan QR code.");
    await page.goto("https://web.telegram.org/k", { waitUntil: "networkidle2" });

    await page.waitForSelector(
      "input[class='input-field-input is-empty input-search-input with-focus-effect']" ||
      "input[id='telegram-search-input']",
      { timeout: 120000 }
    );

    console.log("✅ Logged in!");

    for (const title of titles) {
      console.log(`🔍 Searching for: ${title}`);

      await page.waitForSelector("input.input-search-input");
      const searchInput = await page.$("input.input-search-input");

      await searchInput.click({ clickCount: 3 });
      await page.keyboard.press("Backspace");
      await searchInput.type(title, { delay: 100 });

      await new Promise(res => setTimeout(res, 3000)); // wait for results to load

      const searchResults = await page.$$("a.row.no-wrap.row-with-padding.row-clickable.hover-effect.rp.chatlist-chat.chatlist-chat-abitbigger");

      const channelsData = [];


for (let i = 0; i < 5; i++) {
  try {
    console.log(`➡️ Visiting result ${i + 1} for "${title}"`);

    // ✅ Query fresh elements each time
    const channels = await page.$$("a.row.no-wrap.row-with-padding.row-clickable.hover-effect.rp.chatlist-chat.chatlist-chat-abitbigger");

    if (!channels[i]) {
      console.warn(`⚠️ Channel ${i + 1} not available.`);
      continue;
    }

    await channels[i].click();
    await new Promise(res => setTimeout(res, 3000)); // wait for channel to load

const messages = await page.evaluate(() => {
  const posts = [];
  const bubbles = document.querySelectorAll(".bubble-content-wrapper");

  bubbles.forEach(bubble => {
    const text = bubble.innerText || "";
    const links = Array.from(bubble.querySelectorAll("a.anchor-url")).map(a => a.href);
    if (text || links.length) {
      posts.push({ text, links });
    }
  });

  return posts;
});


    channelsData.push({ channelIndex: i, messages });

    await page.goBack({ waitUntil: "networkidle2" });
    await new Promise(res => setTimeout(res, 2000));
  } catch (innerErr) {
    console.warn(`⚠️ Failed to process channel ${i + 1}: ${innerErr.message}`);
  }
}


      results.push({ title, channels: channelsData });
      fs.writeFileSync("search_results_telegram.json", JSON.stringify(results, null, 2));
      console.log(`💾 Saved ${title} results to search_results_telegram.json`);

      await searchInput.click({ clickCount: 3 });
      await page.keyboard.press("Backspace");
      await new Promise(res => setTimeout(res, 1000));
    }

    console.log("✅ All movie titles processed.");
  } catch (err) {
    console.error("❌ Error:", err.message);
    const dom = await page.content();
    const timestamp = Date.now();
    saveDomSnapshot(dom, timestamp);
    logError(err, "telegram_search", timestamp);
  } finally {
    await browser.close();
  }
})();

