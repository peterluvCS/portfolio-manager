import { executeBuyTrade } from '../models/TradeModel.js';

export const handleBuyTrade = async (req, res) => {
  try {
    const { ticker, quantity, price } = req.body;

    const result = await executeBuyTrade(ticker, quantity, price);

    res.json({
      success: true,
      message: 'Buy order executed',
      ...result,
    });
  } catch (error) {
    res.status(error.status || 500).json({
      error: error.message || 'Internal Server Error',
      ...(error.marketPrice && { marketPrice: error.marketPrice }),
    });
  }
};
