import express from 'express';
import { example } from '../controllers/index.js'; // 注意加 `.js`
import portfolioRoutes from './portfolio.js';

const router = express.Router();

router.get('/example', example);
router.use('/portfolio', portfolioRoutes);

export default router;
