import { PortfolioModel } from '../models/PortfolioModel.js';

export class PortfolioController {
    constructor() {
        this.portfolioModel = new PortfolioModel();
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