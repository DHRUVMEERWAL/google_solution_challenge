const fs = require("fs");
const url = require("url");

const data = JSON.parse(fs.readFileSync("classified_results.json", "utf-8"));
const providers = JSON.parse(fs.readFileSync("dmca_providers.json", "utf-8"));

const takedownLinks = [];

for (const entry of data) {
  for (const channel of entry.channels) {
    for (const message of channel.messages) {
      if (message.classification === "piracy") {
        for (const link of message.links) {
          try {
            const hostname = new URL(link).hostname.replace("www.", "");

            if (providers[hostname]) {
              takedownLinks.push({
                title: entry.title,
                link,
                provider: hostname,
                channelIndex: channel.channelIndex,
                text: message.text,
                method: providers[hostname].type,
                target: providers[hostname].email || providers[hostname].url
              });
            }
          } catch (e) {
            console.warn(`❌ Invalid URL skipped: ${link}`);
          }
        }
      }
    }
  }
}

fs.writeFileSync("dmca_targets.json", JSON.stringify(takedownLinks, null, 2));
console.log(`✅ Found ${takedownLinks.length} piracy links. Saved to dmca_targets.json`);
