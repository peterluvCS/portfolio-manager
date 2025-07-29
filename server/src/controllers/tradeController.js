import { executeBuyTrade, handleSellTrade } from '../models/TradeModel.js';

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

export const executeSellTrade = async (req, res) => {
    try {
        const result = await handleSellTrade(req.body);
        res.status(200).json(result);
    } catch (error) {
        if (error.type === 'validation') {
            res.status(400).json(error.details);
        } else {
            res.status(500).json({ error: error.message });
        }
    }
};
