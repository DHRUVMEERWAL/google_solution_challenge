require("dotenv").config();
const fs = require("fs");
const { ChatGoogleGenerativeAI } = require("@langchain/google-genai");
const { ChatPromptTemplate } = require("@langchain/core/prompts");

const data = JSON.parse(fs.readFileSync("classified_results.json", "utf-8"));

const model = new ChatGoogleGenerativeAI({
  apiKey: process.env.GEMINI_API_KEY,
  modelName: "gemini-2.5-pro-preview-06-05",
  temperature: 0.2
});

const prompt = ChatPromptTemplate.fromMessages([
  ["system", "You are an anti-piracy bot that generates DMCA reports."],
  ["human", `{message}`]
]);

async function processMessage(title, message) {
  const input = `
A user posted the following message:

TEXT: ${message.text}
LINKS:
${message.links.join("\n")}

Analyze and return:
- Piracy-related links only
- Provider for each link
- Contact method (email or webform) for each provider
- DMCA-ready email

Reply in JSON like this:

{
  "title": "${title}",
  "piracy_links": [
    {
      "url": "https://...",
      "provider": "terabox.com",
      "dmca_method": "email",
      "target": "dmca@terabox.com",
      "dmca_email": "DMCA body text here"
    }
  ]
}
`;

  const chain = prompt.pipe(model);
  const result = await chain.invoke({ message: input });

  try {
    // Robust JSON extraction: find first '{' and last '}'
    const jsonStart = result.content.indexOf("{");
    const jsonEnd = result.content.lastIndexOf("}");
    if (jsonStart === -1 || jsonEnd === -1) throw new Error("No JSON found in LLM response");
    const jsonStr = result.content.slice(jsonStart, jsonEnd + 1);
    return JSON.parse(jsonStr);
  } catch (e) {
    console.warn("⚠️ Failed to parse LLM response:", result.content);
    return null;
  }
}

(async () => {
  const allResults = [];

  for (const entry of data) {
    for (const channel of entry.channels) {
      for (const msg of channel.messages) {
        if (msg.classification !== "piracy") continue;

        const dmcaReport = await processMessage(entry.title, msg);
        if (dmcaReport) {
          allResults.push(dmcaReport);
          console.log(`✅ Processed DMCA report for "${entry.title}"`);
        }
      }
    }
  }

  try {
    fs.writeFileSync("dmca_targets.json", JSON.stringify(allResults, null, 2));
    console.log("✅ All flagged messages processed and saved to dmca_targets.json");
  } catch (e) {
    console.error("❌ Failed to write dmca_targets.json:", e);
  }
})();
