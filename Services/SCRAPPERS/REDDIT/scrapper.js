const puppeteer = require('puppeteer-extra');
const StealthPlugin = require('puppeteer-extra-plugin-stealth');
const fs = require('fs');
const csv = require('csv-parser');

puppeteer.use(StealthPlugin());

const piracyKeywords = ['terabox', 'gofile', 'drive.google.com', 'mega.nz', '1fichier', 'streamtape'];

const getHighRiskTitles = (csvPath, threshold = 0.8) => {
  return new Promise((resolve) => {
    const titles = [];
    fs.createReadStream(csvPath)
      .pipe(csv())
      .on('data', row => {
        if (parseFloat(row.piracy_risk_pred) > threshold) {
          titles.push(row.title);
        }
      })
      .on('end', () => resolve(titles));
  });
};

const searchAndScrape = async (page, query) => {
  const searchUrl = `https://www.reddit.com/search/?q=${encodeURIComponent(query)}`;
  await page.goto(searchUrl, { waitUntil: 'domcontentloaded' });

  let posts = [];
  const seen = new Set();
  let lastHeight = await page.evaluate(() => document.body.scrollHeight);
  let scrollTries = 0;
  const maxScrolls = 10;

  while (posts.length < 10 && scrollTries < maxScrolls) {
    const newPosts = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('article')).map(post => {
        try {
          const linkEl = post.querySelector('a[slot="title"]');
          const titleEl = post.querySelector('shreddit-post');
          const authorEl = post.querySelector('a[href^="/user/"]');
          return {
            title: titleEl?.innerText || null,
            link: linkEl?.href || null,
            author: authorEl?.innerText || null
          };
        } catch {
          return null;
        }
      });
    });

    const filtered = newPosts.filter(
      p =>
        p &&
        !seen.has(p.link) &&
        piracyKeywords.some(keyword =>
          (p.title && p.title.toLowerCase().includes(keyword)) ||
          (p.link && p.link.toLowerCase().includes(keyword))
        )
    );

    filtered.forEach(p => seen.add(p.link));
    posts = [...posts, ...filtered];

    await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
    await new Promise(res => setTimeout(res, 1500));

    const newHeight = await page.evaluate(() => document.body.scrollHeight);
    if (newHeight === lastHeight) {
      scrollTries++;
    } else {
      scrollTries = 0;
      lastHeight = newHeight;
    }
  }

  return posts.slice(0, 10); // cap to 10
};

(async () => {
  const titles = await getHighRiskTitles('high_piracy_risk_ml_movies.csv');
  const browser = await puppeteer.launch({ headless: false });
  const page = await browser.newPage();

  const allResults = [];

  for (const title of titles) {
    console.log(`🔍 Searching Reddit for: ${title}`);
    const results = await searchAndScrape(page, title);

    if (results.length === 0) {
      console.log(`❌ No piracy posts found for: ${title}`);
    } else {
      console.log(`⚠️ Found ${results.length} suspicious posts for: ${title}`);
    }

    // ✅ Save each title's result (even empty)
    allResults.push({ title, results });
    fs.writeFileSync("reddit_piracy_results.json", JSON.stringify(allResults, null, 2));
    console.log(`💾 Saved results for: ${title}`);
    await new Promise(res => setTimeout(res, 1000));
  }

  await browser.close();
  console.log("✅ Scraping complete.");
})();
