

const fs = require("fs");

function logError(error, url, timestamp) {
  const log = {
    timestamp,
    url,
    error: error.message,
    stack: error.stack,
  };
  fs.writeFileSync(`logs/error_${timestamp}.json`, JSON.stringify(log, null, 2));
}

function saveDomSnapshot(html, timestamp) {
  fs.writeFileSync(`dom_snapshots/dom_${timestamp}.html`, html);
}

module.exports = { logError, saveDomSnapshot };
