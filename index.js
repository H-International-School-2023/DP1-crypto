const fs = require('fs');

const filePath = './BTCUSDT-3m-2021-12.csv';

const fileContent = fs.readFileSync(filePath, { encoding: 'UTF-8' });

// #region [ Parsing ]

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
  if (currentRow !== '') {
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
}

// #endregion

// If I buy 1 BTC on the first moment of the month and sell it on the last moment of the month, I gain
const buyPrice = opens[0];
const sellPrice = closes[closes.length - 1];
const difference = sellPrice - buyPrice;
console.log(difference);
console.log(sellPrice / buyPrice);

// #region [Computed fields]

const returns = [null];
for (let i = 1; i < closes.length; i = i + 1) {
  returns.push(closes[i] / closes[i - 1]);
}

// #endregion

const amountOfBTCToTrade = 0.1;
let BTC = 1;
let USDT = 0;
const commissionRate = 0.001;

let totalCommission = 0;
let numberOfBuy = 0;
let numberOfSell = 0;

for (let i = 0; i < returns.length; i = i + 1) {
  const currentReturn = returns[i];
  if (currentReturn > 1 && BTC >= amountOfBTCToTrade) {
    BTC = BTC - amountOfBTCToTrade;
    const price = amountOfBTCToTrade * closes[i];
    totalCommission = totalCommission + price * commissionRate;
    USDT = USDT + price;
    numberOfSell = numberOfSell + 1;
  }
  if (currentReturn < 1) {
    BTC = BTC + amountOfBTCToTrade;
    const price = amountOfBTCToTrade * closes[i];
    totalCommission = totalCommission + price * commissionRate;
    USDT = USDT - price;
    numberOfBuy = numberOfBuy + 1;
  }
}

// if (BTC > 0) {
//   USDT = USDT + BTC * closes[closes.length - 1];
//   BTC = 0;
// }

console.log('I have BTC:', BTC);
console.log('I have USDT:', USDT);
console.log('Total commision:', totalCommission);
console.log('Number of buy:', numberOfBuy);
console.log('Number of sell:', numberOfSell);