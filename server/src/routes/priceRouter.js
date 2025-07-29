const express = require('express');
const priceRouter = express.Router();
const PriceController = require('../controllers/PriceController');

priceRouter.get('/batch', PriceController.getBatchPrices);

module.exports = priceRouter;