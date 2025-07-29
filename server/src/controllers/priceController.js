import Price from '../models/price.js';

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
}

export default PriceController;