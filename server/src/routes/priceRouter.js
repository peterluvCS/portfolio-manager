import express from 'express';
import { Router } from 'express';
import * as PriceController from '../controllers/PriceController.js';

const priceRouter = Router();

priceRouter.get('/batch', PriceController.getBatchPrices);
priceRouter.post('/price/update-all', PriceController.updateAllPrices);

export default priceRouter; 