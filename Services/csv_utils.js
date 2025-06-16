const fs = require('fs');
const csv = require('csv-parser');

function getHighRiskTitles(csvPath, threshold = 0.8) {
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
}

module.exports = { getHighRiskTitles };
