import Price from '../models/price.js';
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
        const { mode = 'realtime', startDate, endDate } = req.body;
        const results = [];
      
        try {
          if (mode === 'historical') {
            if (!startDate && !endDate) return res.status(400).json({ message: "Missing 'startDate' or 'endDate' for historical mode." });
      
            const r = await Price.fetchAndInsertHistoricalPrices(startDate, endDate);
            return res.json({ message: `Historical prices from ${startDate} to ${endDate} updated.`, results: r });
          }
      
          // Default: realtime
          const r = await Price.fetchAndInsertRealTimePrices();
          return res.json({ message: 'Real-time prices updated.', results: r });
      
        } catch (error) {
          console.error(error);
          return res.status(500).json({ message: 'Update failed.', error: error.message });
        }
      }

}

export default PriceController;