import express from 'express';
const priceRouter = express.Router();
import PriceController from '../controllers/PriceController.js';

priceRouter.get('/batch', PriceController.getBatchPrices);

export default priceRouter;