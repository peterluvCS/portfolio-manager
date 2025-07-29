import pool from '../../config/db.js';

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
}

export default Price;