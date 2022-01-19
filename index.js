const fs = require('fs');

// closes, 7, 0
function movingAverage(array, span, currentIndex) {
  if (currentIndex < span - 1) {
    return null;
  }

  let sum = 0;
  for (let i = 0; i < span; i = i + 1) {
    sum = sum + array[currentIndex - i];
  }

  return sum / span;
}

function simpleStrategy(closes, returns, startingBTC, startingUSDT, amountOfBTCToTrade, commissionRate) {

  let BTC = startingBTC;
  let USDT = startingUSDT;

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

  if (BTC > 0) {
    const price = BTC * closes[closes.length - 1];
    totalCommission = totalCommission + price * commissionRate;
    USDT = USDT + price;
    BTC = 0;
    numberOfSell = numberOfSell + 1;
  }


  console.log('I have BTC:', BTC);
  console.log('I have USDT:', USDT);
  console.log('Total commision:', totalCommission);
  console.log('Net USDT:', USDT - totalCommission);
  console.log('Number of buy:', numberOfBuy);
  console.log('Number of sell:', numberOfSell);
}

function keepingStrategy(
  closes,
  returns,
  amountOfBTCToTrade,
  commissionRate,
  numberOfCandle
) {

  let BTC = 0;
  let USDT = 0;

  let totalCommission = 0;
  let numberOfBuy = 0;
  let numberOfSell = 0;

  let move = 'BUY';

  let candleCount = 0;

  for (let i = 0; i < returns.length; i = i + 1) {
    const currentReturn = returns[i];

    if (move === 'BUY') {
      if (currentReturn > 1) {
        candleCount = candleCount + 1;
        if (candleCount >= numberOfCandle) {
          const price = closes[i] * amountOfBTCToTrade;
          BTC = BTC + amountOfBTCToTrade;
          USDT = USDT - price;
          totalCommission = totalCommission + price * commissionRate;
          move = 'SELL';
          candleCount = 0;
          numberOfBuy = numberOfBuy + 1;
        }
      }
    }

    if (move === 'SELL') {
      if (currentReturn < 1) {
        candleCount = candleCount + 1;
        if (candleCount > numberOfCandle) {
          const price = closes[i] * amountOfBTCToTrade;
          BTC = BTC - amountOfBTCToTrade;
          USDT = USDT + price;
          totalCommission = totalCommission + price * commissionRate;
          move = 'BUY';
          candleCount = 0;
          numberOfSell = numberOfSell + 1;
        }
      }
    }
  }


  console.log('I have BTC:', BTC);
  console.log('I have USDT:', USDT);
  console.log('Total commision:', totalCommission);
  console.log('Net USDT:', USDT - totalCommission);
  console.log('Number of buy:', numberOfBuy);
  console.log('Number of sell:', numberOfSell);

}


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

simpleStrategy(closes, returns, 1, 0, 0.1, 0.001);
for (let i = 2; i < 10; i = i + 1) {
  console.log('----------------', i, '--------------------');
  keepingStrategy(closes, returns, 0.1, 0.001, i);
}
