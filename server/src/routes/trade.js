import express from 'express';
import { handleBuyTrade, executeSellTrade, getAllOrdersController } from '../controllers/tradeController.js';

const router = express.Router();

router.post('/buy', handleBuyTrade);
router.post('/sell', executeSellTrade);
router.get('/history', getAllOrdersController);
export default router;
