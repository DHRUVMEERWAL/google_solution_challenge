const puppeteer = require("puppeteer");
const fs = require("fs");
const csv = require("csv-parser");
const path = require("path");

const OUTPUT_FILE = "youtube_video_matches.json";

function initializeOutputFile() {
  const initialData = {
    scrapedAt: new Date().toISOString(),
    results: {},
  };
  fs.writeFileSync(OUTPUT_FILE, JSON.stringify(initialData, null, 2));
}

function appendResultToFile(movieTitle, videos) {
  const filePath = path.resolve(OUTPUT_FILE);
  const data = JSON.parse(fs.readFileSync(filePath));
  data.results[movieTitle] = videos;
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

const getHighRiskTitles = () => {
  return new Promise((resolve, reject) => {
    const titles = [];
    fs.createReadStream("high_piracy_risk_ml_movies.csv")
      .pipe(csv())
      .on("data", (row) => titles.push(row.title))
      .on("end", () => resolve(titles))
      .on("error", reject);
  });
};

async function scrapeYouTubeForMovie(page, movieTitle) {
  const query = encodeURIComponent(movieTitle + " full movie");
  await page.goto(`https://www.youtube.com/results?search_query=${query}`, {
    waitUntil: "networkidle2",
  });

  await page.waitForSelector("ytd-video-renderer", { timeout: 10000 });

  const videos = await page.evaluate(() => {
    return Array.from(document.querySelectorAll("ytd-video-renderer"))
      .slice(0, 10)
      .map((video) => {
        const titleEl = video.querySelector("#video-title");
        const viewsEl = video.querySelector("#metadata-line span:nth-child(1)");
        const channelEl = video.querySelector("#channel-name a");
        const timeEl = video.querySelector("ytd-thumbnail-overlay-time-status-renderer span");

        return {
          title: titleEl?.textContent.trim(),
          url: "https://www.youtube.com" + titleEl?.getAttribute("href"),
          views: viewsEl?.textContent.trim(),
          channel: channelEl?.textContent.trim(),
          duration: timeEl?.textContent.trim(),
        };
      });
  });

  return videos;
}

(async () => {
  try {
    const highRiskTitles = await getHighRiskTitles();
    console.log(`🎯 Loaded ${highRiskTitles.length} titles.`);
    initializeOutputFile();

    const browser = await puppeteer.launch({ headless: false });
    const page = await browser.newPage();

    for (const title of highRiskTitles) {
      console.log(`🔍 Searching YouTube for: ${title}`);
      try {
        const videos = await scrapeYouTubeForMovie(page, title);
        const matches = videos.filter(
          (video) => video.title && video.title.toLowerCase().includes(title.toLowerCase())
        );
        appendResultToFile(title, matches);
        console.log(`✅ Saved ${matches.length} matches for "${title}"`);
      } catch (err) {
        console.warn(`⚠️ Skipping "${title}" due to error: ${err.message}`);
      }
    }

    await browser.close();
    console.log("🎉 All scraping done and saved.");

  } catch (error) {
    console.error("❌ Scraping failed:", error);
  }
})();
