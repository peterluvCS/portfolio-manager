import express from 'express';
import { handleBuyTrade } from '../controllers/tradeController.js';

const router = express.Router();

router.post('/buy', handleBuyTrade);

export default router;
