import { pool } from '../../config/db.js';

export class PortfolioModel {
    /**
     * 充值现金
     */
    async chargeCash(amount) {
        if (amount <= 0) {
            throw new Error('Amount must be greater than zero');
        }
        try {
            await pool.execute('UPDATE portfolio SET quantity = quantity + ? WHERE ticker = ?', [amount, 'CASH']);
        } catch (error) {
            console.error('Error charging cash:', error);
        }
    }
    /**
     * 提现现金
     */
    async withdrawCash(amount) {
        if (amount <= 0) {
            throw new Error('Withdrawal amount must be greater than zero');
        }
        try {
            const [rows] = await pool.execute('SELECT quantity FROM portfolio WHERE ticker = ?', ['CASH']);
            if (rows.length === 0 || rows[0].quantity < amount) {
                throw new Error('Insufficient cash balance');
            }
            await pool.execute('UPDATE portfolio SET quantity = quantity - ? WHERE ticker = ?', [amount, 'CASH']);
        } catch (error) {
            console.error('Error withdrawing cash:', error);
        }
    }
    /**
     * 计算投资组合数据
     */
    async calculatePortfolio() {
        const [holdings] = await pool.execute('SELECT * FROM portfolio');
        const portfolio = [];
        let totalCost = 0;
        let totalValue = 0;

        for (const holding of holdings) {
            let currentPrice;
            
            if (holding.ticker === 'CASH') {
                // CASH价格固定为1.00
                currentPrice = 1.00;
            } else {
                // 获取最新价格
                const [priceRows] = await pool.execute(
                    'SELECT price FROM stock_currency WHERE ticker = ? ORDER BY datetime DESC LIMIT 1',
                    [holding.ticker]
                );
                currentPrice = priceRows[0]?.price || holding.avg_price;
            }
            
            const currentValue = holding.quantity * currentPrice;
            const profitLoss = currentValue - (holding.quantity * holding.avg_price);
            const profitLossPercent = holding.ticker === 'CASH' ? 0 : ((currentPrice - holding.avg_price) / holding.avg_price) * 100;

            portfolio.push({
                ticker: holding.ticker,
                quantity: holding.quantity,
                avgPrice: holding.avg_price,
                currentPrice,
                currentValue,
                profitLoss,
                profitLossPercent
            });

            totalCost += holding.quantity * holding.avg_price;
            totalValue += currentValue;
        }

        const totalProfitLoss = totalValue - totalCost;
        const totalProfitLossPercent = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;

        return {
            portfolio,
            summary: {
                totalCost,
                totalValue,
                totalProfitLoss,
                totalProfitLossPercent
            }
        };
    }
} 