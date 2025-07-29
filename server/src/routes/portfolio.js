import express from 'express';
import { PortfolioController } from '../controllers/portfolioController.js';

const router = express.Router();
const portfolioController = new PortfolioController();

/**
 * GET /api/portfolio
 * 获取投资组合概览
 */
router.get('/', async (req, res) => {
    await portfolioController.getPortfolio(req, res);
});
/**
 * POST /api/portfolio/charge
 * 充值现金
 */
router.post('/charge', async (req, res) => {
    await portfolioController.chargeCash(req, res);
});

/**
 * POST /api/portfolio/withdraw
 * 提现现金
 */
router.post('/withdraw', async (req, res) => {
    await portfolioController.withdrawCash(req, res);
});

export default router; 