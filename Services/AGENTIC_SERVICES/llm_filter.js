require("dotenv").config();
const fs = require("fs");
const { GoogleGenerativeAI } = require("@google/generative-ai");

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro-preview-06-05" });

const data = JSON.parse(fs.readFileSync("search_results_telegram.json", "utf-8"));
let labeledData = [];

// Try to resume from existing results
if (fs.existsSync("classified_results.json")) {
  labeledData = JSON.parse(fs.readFileSync("classified_results.json", "utf-8"));
}

async function classifyMessage(message) {
  const input = `
You are a piracy detection assistant. Analyze the following message and determine if it promotes pirated or leaked movie content.

Message Text:
"${message.text}"

Links:
${message.links.join("\n")}

Reply ONLY with one of these labels:
- piracy
- safe

Then provide a one-line justification.
`;

  const result = await model.generateContent(input);
  const output = result.response.text().trim();

  const [labelLine, ...rest] = output.split("\n");
  const label = labelLine.toLowerCase().includes("piracy") ? "piracy" : "safe";

  return {
    label,
    justification: rest.join(" ").trim()
  };
}

(async () => {
  for (const entry of data) {
    for (const channel of entry.channels) {
      let existingEntry = labeledData.find(e => e.title === entry.title);
      if (!existingEntry) {
        existingEntry = { title: entry.title, channels: [] };
        labeledData.push(existingEntry);
      }

      let existingChannel = existingEntry.channels.find(c => c.channelIndex === channel.channelIndex);
      if (!existingChannel) {
        existingChannel = { channelIndex: channel.channelIndex, messages: [] };
        existingEntry.channels.push(existingChannel);
      }

      const alreadyClassified = new Set(existingChannel.messages.map(m => m.text));

      for (const msg of channel.messages) {
        if (alreadyClassified.has(msg.text)) {
          console.log(`⏩ Skipped already classified message`);
          continue;
        }

        const result = await classifyMessage(msg);

        const labeledMsg = {
          ...msg,
          classification: result.label,
          reason: result.justification
        };

        existingChannel.messages.push(labeledMsg);

        // ✅ Save after every message
        fs.writeFileSync("classified_results.json", JSON.stringify(labeledData, null, 2));
        console.log(`📥 Saved classification: ${result.label}`);
      }
    }
  }

  console.log("✅ All messages classified and saved to classified_results.json");
})();
