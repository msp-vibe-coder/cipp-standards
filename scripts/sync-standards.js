const https = require("https");
const fs = require("fs");
const path = require("path");

const STANDARDS_URL =
  "https://raw.githubusercontent.com/KelvinTegelaar/CIPP/main/src/data/standards.json";
const OUTPUT_PATH = path.join(__dirname, "..", "src", "data", "standards.json");

function fetch(url) {
  return new Promise((resolve, reject) => {
    https
      .get(url, (res) => {
        if (res.statusCode >= 300 && res.statusCode < 400 && res.headers.location) {
          return fetch(res.headers.location).then(resolve, reject);
        }
        if (res.statusCode !== 200) {
          return reject(new Error(`HTTP ${res.statusCode}`));
        }
        const chunks = [];
        res.on("data", (chunk) => chunks.push(chunk));
        res.on("end", () => resolve(Buffer.concat(chunks).toString()));
        res.on("error", reject);
      })
      .on("error", reject);
  });
}

async function main() {
  console.log("Fetching latest standards.json from CIPP GitHub...");
  try {
    const data = await fetch(STANDARDS_URL);
    const parsed = JSON.parse(data);
    console.log(`Fetched ${parsed.length} standards.`);
    fs.writeFileSync(OUTPUT_PATH, JSON.stringify(parsed, null, 2));
    console.log(`Written to ${OUTPUT_PATH}`);
  } catch (err) {
    console.error("Failed to sync standards:", err.message);
    process.exit(1);
  }
}

main();
