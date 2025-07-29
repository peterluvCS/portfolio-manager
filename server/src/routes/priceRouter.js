import express from 'express';
import { Router } from 'express';
import PriceController from '../controllers/PriceController.js';

const priceRouter = Router();

priceRouter.get('/batch', PriceController.getBatchPrices);
priceRouter.post('/update-all', PriceController.updateAllPrices);

export default priceRouter; 
