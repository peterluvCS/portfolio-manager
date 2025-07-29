import express from 'express';
import portfolioRoutes from './portfolio.js';

const router = express.Router();

// router.get('/example', example);
router.use('/portfolio', portfolioRoutes);

export default router;
