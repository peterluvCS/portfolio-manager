import Price from '../models/Price.js';
import yahooFinance from 'yahoo-finance2';
import tickerMap from '../../config/tickerMap.js';

class PriceController {
    static async getBatchPrices(req, res) {
        try {
            const rows = await Price.getLatestPrices();
            
            const prices = rows.map(row => ({
                ticker: row.ticker,
                price: row.price,
                lastUpdated: row.datetime
            }));
            
            res.json({ prices });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }

    static async updateAllPrices(req, res) {
        const results = [];
      
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
      
            await insertPrice({
              ticker,
              name,
              price,
              datetime: formattedTime,
              asset_type: info.asset_type
            });
      
            results.push({ ticker, status: 'success', price, time: formattedTime });
          } catch (err) {
            results.push({ ticker, status: 'error', message: err.message });
          }
        }
        res.json({ message: 'Price update finished', results });
    }
}

module.exports = PriceController;