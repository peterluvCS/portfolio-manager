import express from 'express';
import { handleBuyTrade, executeSellTrade } from '../controllers/tradeController.js';

const router = express.Router();

router.post('/buy', handleBuyTrade);
router.post('/sell', executeSellTrade);

export default router;
