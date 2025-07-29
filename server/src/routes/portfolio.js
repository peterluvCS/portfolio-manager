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

export default router; 