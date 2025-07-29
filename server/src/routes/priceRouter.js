const express = require('express');
const priceRouter = express.Router();
const PriceController = require('../controllers/PriceController');

priceRouter.get('/batch', PriceController.getBatchPrices);
priceRouter.post('/price/update-all', PriceController.updateAllPrices);

export default priceRouter;