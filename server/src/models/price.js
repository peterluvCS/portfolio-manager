import pool from '../../config/db.js';
import yahooFinance from 'yahoo-finance2';
import tickerMap from '../../config/tickerMap.js';

class Price {
    static async getLatestPrices() {
        const [rows] = await pool.execute(`
            SELECT ticker, price, datetime 
            FROM stock_currency sc1
            WHERE datetime = (
                SELECT MAX(datetime) 
                FROM stock_currency sc2 
                WHERE sc2.ticker = sc1.ticker
            )
            ORDER BY ticker
        `);
        return rows;
    }

    static async fetchAndInsertRealTimePrices () {
      const db = await pool.getConnection();
      const results = [];
    
      try {
        for (const [ticker, info] of Object.entries(tickerMap)) {
          try {
            const data = info.asset_type === 'stock'
              ? await yahooFinance.quoteSummary(info.realTicker, { modules: ['price'] })
              : await yahooFinance.quote(info.realTicker);
    
            const price = data?.price?.regularMarketPrice ?? data?.regularMarketPrice;
            const name = data?.price?.shortName ?? ticker;
            const rawTime = data?.price?.regularMarketTime ?? data?.regularMarketTime;
    
            const datetime = new Date(
              typeof rawTime === 'number' ? rawTime * 1000 : rawTime ?? Date.now()
            );
            const formattedTime = datetime.toISOString().slice(0, 19).replace('T', ' ');
    
            await db.execute(`
              INSERT IGNORE INTO stock_currency (ticker, name, price, datetime, asset_type)
              VALUES (?, ?, ?, ?, ?)
            `, [ticker, name, price, formattedTime, info.asset_type]);
    
            results.push({ ticker, status: 'success', time: formattedTime });
          } catch (err) {
            results.push({ ticker, status: 'error', message: err.message });
          }
        }
      } finally {
        db.release();
      }
    
      return results;
    };
    
    static async fetchAndInsertHistoricalPrices(date) {
      const db = await pool.getConnection();
      const results = [];

      const period1 = new Date(date);
      const period2 = new Date(period1.getTime() +  24 * 60 * 60 * 1000); 
    
      try {
        for (const [ticker, info] of Object.entries(tickerMap)) {
          let insertCount = 0;
          try {
            const result = await yahooFinance.chart(info.realTicker, {
              period1,
              period2,
              interval: '60m'
            });
    
            const quotes = result.quotes;
            if (!quotes || quotes.length === 0) {
              throw new Error('No historical data');
            }
    
            for (const q of quotes) {
              const close = q.close;
              if (typeof close !== 'number' || isNaN(close)) {
                continue;
              }
              const dataTime = new Date(q.date);
              const formattedTime = dataTime.toISOString().slice(0, 19).replace('T', ' ');
    
              await db.execute(`
                INSERT IGNORE INTO stock_currency (ticker, name, price, datetime, asset_type)
                VALUES (?, ?, ?, ?, ?)
              `, [ticker, ticker, close, formattedTime, info.asset_type]);
              insertCount++;
            }
    
            results.push({ ticker, status: 'success', count: insertCount});
          } catch (err) {
            results.push({ ticker, status: 'error', message: err.message });
          }
        }
      } finally {
        db.release();
      }
    
      return results;
    }
    
    
    
    
}

export default Price;