import pool from '../../config/db.js';

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
        let totalProfitLoss = 0;
        let totalProfitLossPercent = 0;

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
            const profitLoss = holding.ticker === 'CASH' ? 0 : currentValue - (holding.quantity * holding.avg_price);
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

            // 只计算非CASH资产的总成本和总价值
            if (holding.ticker !== 'CASH') {
                totalCost += holding.quantity * holding.avg_price;
                totalValue += currentValue;
            }
        }

        // 计算总盈亏（只考虑非CASH资产）
        totalProfitLoss = totalValue - totalCost;
        totalProfitLossPercent = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;

        // 计算包含CASH的总价值（用于显示总资产价值）
        const totalValueWithCash = portfolio.reduce((sum, item) => sum + item.currentValue, 0);

        return {
            portfolio,
            summary: {
                totalCost,
                totalValue: totalValueWithCash, // 总价值包含CASH
                totalProfitLoss, // 总盈亏只计算非CASH资产
                totalProfitLossPercent
            }
        };
    }
} 