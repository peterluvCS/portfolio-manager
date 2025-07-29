import { PortfolioModel } from '../models/PortfolioModel.js';

export class PortfolioController {
    constructor() {
        this.portfolioModel = new PortfolioModel();
    }
    /**
     * 充值现金
     */
    async chargeCash(req, res) {
        const { amount } = req.body;
        try {
            await this.portfolioModel.chargeCash(amount);
            res.json({ message: 'Cash charged successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * 提现现金
     */
    async withdrawCash(req, res) {
        const { amount } = req.body;
        try {
            await this.portfolioModel.withdrawCash(amount);
            res.json({ message: 'Cash withdrawn successfully' });
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
    /**
     * 获取投资组合概览
     */
    async getPortfolio(req, res) {
        try {
            const result = await this.portfolioModel.calculatePortfolio();
            res.json(result);
        } catch (error) {
            res.status(500).json({ error: error.message });
        }
    }
} 