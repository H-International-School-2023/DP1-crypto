const fs = require('fs');

const filePath = './BTCUSDT-3m-2021-12.csv';

const fileContent = fs.readFileSync(filePath, { encoding: 'UTF-8' });

// Rows is an array of string. Each element is a row in the dataset
const rows = fileContent.split('\n');

const times = [];
const opens = [];
const highs = [];
const lows = [];
const closes = [];
const volumes = [];

for (let i = 0; i < rows.length; i = i + 1) {
  const currentRow = rows[i];

  const splitted = currentRow.split(',');

  const milliseconds = parseInt(splitted[0]);

  const time = new Date(milliseconds);
  const openPrice = parseFloat(splitted[1]);
  const highPrice = parseFloat(splitted[2]);
  const lowPrice = parseFloat(splitted[3]);
  const closePrice = parseFloat(splitted[4]);
  const volume = parseFloat(splitted[5]);

  times.push(time);
  opens.push(openPrice);
  highs.push(highPrice);
  lows.push(lowPrice);
  closes.push(closePrice);
  volumes.push(volume);
}


