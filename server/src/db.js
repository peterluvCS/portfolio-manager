import mysql from 'mysql2/promise';
import yahooFinance from 'yahoo-finance2';
import cron from 'node-cron';

const pool = mysql.createPool({
    host: 'localhost',
    user: 'root',
    password: 'n3u3da!',
    database: 'portfolio',
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0
  });

const tickerMap = {
  'AAPL':      { asset_type: 'stock',    realTicker: 'AAPL' },
  'MSFT':      { asset_type: 'stock',    realTicker: 'MSFT' },
  'NVDA':      { asset_type: 'stock',    realTicker: 'NVDA'},
  'AMZN':      { asset_type: 'stock',    realTicker: 'AMZN'},
  'WFC':       { asset_type: 'stock',    realTicker: 'WFC'},
  'USD/CNY':   { asset_type: 'currency', realTicker: 'USDCNY=X' },
  'USD/EUR':   { asset_type: 'currency', realTicker: 'USDEUR=X' },
  'USD/JPY':   { asset_type: 'currency', realTicker: 'USDJPY=X' }
};

async function updatePrices() {
  const db = await pool.getConnection();
  try {
    for (const [ticker, info] of Object.entries(tickerMap)) {
      try {
        const data = info.asset_type === 'stock'
          ? await yahooFinance.quoteSummary(info.realTicker, { modules: ['price'] })
          : await yahooFinance.quote(info.realTicker);

        const price = data?.price?.regularMarketPrice ?? data?.regularMarketPrice;
        const name = data?.price?.shortName ?? ticker;

        const rawTime = data?.price?.regularMarketTime ?? data?.regularMarketTime;

        if (!price) throw new Error('Empty price');

        let datetime;
        if (!rawTime) {
          datetime = new Date();
        } else if (typeof rawTime === 'number') {
          datetime = new Date(rawTime * 1000);
        } else if (rawTime instanceof Date) {
          datetime = rawTime;
        } else {
          datetime = new Date(rawTime);
        }

        const formattedTime = datetime.toISOString().slice(0, 19).replace('T', ' ');

        await db.execute(`
            INSERT IGNORE INTO stock_currency (ticker, name, price, datetime, asset_type)
            VALUES (?, ?, ?, ?, ?)
          `, [ticker, name, price, formattedTime, info.asset_type]);

        console.log(`✅ Inserted ${ticker}: ${price} (${name}) time:${formattedTime}}`);
      } catch (err) {
        console.warn(`⚠️ Get ${ticker} failure: ${err.message}`);
      }
    }
  } finally {
    db.release();
  }
}

// (async () => {
//   cron.schedule('*/1 * * * *', async () => {
//     console.log(`🕒 Scheduled task execution: ${new Date().toLocaleString()}`);
//     await updatePrices();
//   });
// })();
updatePrices();
