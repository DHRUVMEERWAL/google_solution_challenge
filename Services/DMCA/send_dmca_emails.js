require("dotenv").config();
const fs = require("fs");
const nodemailer = require("nodemailer");
const { GoogleGenerativeAI } = require("@google/generative-ai");

// 1. Load input data
const data = JSON.parse(fs.readFileSync("classified_results.json", "utf-8"));

// 2. Gemini setup
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-pro-preview-06-05" });

// 3. SMTP setup
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: Number(process.env.SMTP_PORT),
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS
  }
});

// 4. Generate DMCA email with Gemini
async function generateDMCAEmail({ title, url, provider, text }) {
  const prompt = `
Write a formal DMCA takedown email for the following content:

Title: ${title}
Piracy Link: ${url}
Provider: ${provider}
Original Message: "${text}"

Do not include comments. Only return the email body.
  `;

  const result = await model.generateContent(prompt);
  return result.response.text().trim();
}

// 5. Send email
async function sendEmail({ to, subject, body }) {
  const mailOptions = {
    from: process.env.FROM_EMAIL,
    to,
    subject,
    text: body
  };

  try {
    const info = await transporter.sendMail(mailOptions);
    console.log(`📤 Sent: ${subject} → ${to}`);
  } catch (err) {
    console.error("❌ Email failed:", err.message);
  }
}

// 6. Process messages
(async () => {
  for (const entry of data) {
    for (const channel of entry.channels) {
      for (const msg of channel.messages) {
        if (msg.classification === "piracy" && msg.links.length > 0) {
          for (const link of msg.links) {
            let provider;
            try {
              provider = new URL(link).hostname;
            } catch {
              provider = "unknown";
            }

            const emailBody = await generateDMCAEmail({
              title: entry.title,
              url: link,
              provider,
              text: msg.text
            });

            await sendEmail({
              to: "dhruvmeerwal18@gmail.com",
              subject: `DMCA Takedown: ${entry.title}`,
              body: emailBody
            });
          }
        }
      }
    }
  }

  console.log("✅ All demo emails sent.");
})();
