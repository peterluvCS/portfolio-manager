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

    static async insertPrice({ ticker, name, price, datetime, asset_type }) {
        const db = await pool.getConnection();
        try {
          await db.execute(`
            INSERT IGNORE INTO stock_currency (ticker, name, price, datetime, asset_type)
            VALUES (?, ?, ?, ?, ?)
          `, [ticker, name, price, datetime, asset_type]);
        } finally {
          db.release();
        }
    }
}

export default Price;