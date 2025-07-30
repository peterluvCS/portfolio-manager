import pool from '../../config/db.js';

export async function executeBuyTrade(ticker, quantity, userPrice) {
  // 1. 获取市场价格和资产类型
  const [priceRows] = await pool.execute(
    `SELECT price, asset_type FROM stock_currency WHERE ticker = ? ORDER BY datetime DESC LIMIT 1`,
    [ticker]
  );

  if (priceRows.length === 0) {
    throw { status: 400, message: 'Asset not found or no price data' };
  }

  const marketPrice = priceRows[0].price;
  const assetType = priceRows[0].asset_type;

  // 2. 检查价格合法性
  if (userPrice < marketPrice) {
    throw {
      status: 400,
      message: `Your price (${userPrice}) is below market price (${marketPrice}). Cannot execute buy order.`,
      marketPrice,
    };
  }

  const executionPrice = marketPrice;
  const totalCost = quantity * executionPrice;

  // 3. 检查现金是否足够
  const [cashRows] = await pool.execute(
    `SELECT quantity FROM portfolio WHERE ticker = ?`,
    ['CASH']
  );
  const cashAvailable = cashRows[0]?.quantity || 0;

  if (cashAvailable < totalCost) {
    throw {
      status: 400,
      message: `Insufficient cash: need $${totalCost}, but only have $${cashAvailable}`,
    };
  }

  // 4. 扣除现金
  const newCash = cashAvailable - totalCost;
  await pool.execute(
    `UPDATE portfolio SET quantity = ? WHERE ticker = ?`,
    [newCash, 'CASH']
  );

  // 5. 更新或插入持仓
  const [existingRows] = await pool.execute(
    `SELECT * FROM portfolio WHERE ticker = ?`,
    [ticker]
  );

  if (existingRows.length === 0) {
    await pool.execute(
      `INSERT INTO portfolio (ticker, quantity, avg_price, asset_type)
       VALUES (?, ?, ?, ?)`,
      [ticker, quantity, executionPrice, assetType]
    );
  } else {
    const holding = existingRows[0];
    const newQuantity = Number(holding.quantity) + Number(quantity);
    const newAvgPrice = ((holding.quantity * holding.avg_price) + (quantity * executionPrice)) / newQuantity;

    await pool.execute(
      `UPDATE portfolio SET quantity = ?, avg_price = ? WHERE ticker = ?`,
      [newQuantity, newAvgPrice, ticker]
    );
  }

  // 6. 插入订单记录
  await pool.execute(
    `INSERT INTO orders (ticker, type, quantity, price, asset_type)
     VALUES (?, 'BUY', ?, ?, ?)`,
    [ticker, quantity, executionPrice, assetType]
  );

  // 7. 返回交易信息
  return {
    executionPrice,
    marketPrice,
    requestedPrice: userPrice,
    totalCost,
    remainingCash: newCash,
  };
}

export const handleSellTrade = async ({ ticker, quantity, price }) => {
  // 1. 获取市场价格和资产类型
  const [priceRows] = await pool.execute(
    'SELECT price, asset_type FROM stock_currency WHERE ticker = ? ORDER BY datetime DESC LIMIT 1',
    [ticker]
  );

  if (priceRows.length === 0) {
    throw {
      type: 'validation',
      details: { error: 'Asset not found or no price data' }
    };
  }

  const marketPrice = priceRows[0].price;
  const assetType = priceRows[0].asset_type;

  // 2. 验证价格
  if (price > marketPrice) {
    throw {
      type: 'validation',
      details: {
        error: 'Price too high',
        message: `Your price (${price}) is above market price (${marketPrice}). Cannot execute sell order.`,
        marketPrice
      }
    };
  }

  // 3. 成交价格和总收益
  const executionPrice = marketPrice;
  const totalProceeds = quantity * executionPrice;

  // 4. 检查持仓
  const [existing] = await pool.execute(
    'SELECT * FROM portfolio WHERE ticker = ?',
    [ticker]
  );

  if (existing.length === 0 || existing[0].quantity < quantity) {
    throw { type: 'validation', details: { error: 'Insufficient holdings' } };
  }

  const holding = existing[0];
  const remainingQuantity = Number(holding.quantity) - Number(quantity);

  // 5. 更新持仓
  if (remainingQuantity === 0) {
    await pool.execute('DELETE FROM portfolio WHERE ticker = ?', [ticker]);
  } else {
    await pool.execute(
      'UPDATE portfolio SET quantity = ? WHERE ticker = ?',
      [remainingQuantity, ticker]
    );
  }

  // 6. 增加现金
  const [cashHolding] = await pool.execute(
    'SELECT quantity FROM portfolio WHERE ticker = ?',
    ['CASH']
  );

  const newCashQuantity = Number((cashHolding[0]?.quantity || 0)) + Number(totalProceeds);
  await pool.execute(
    'UPDATE portfolio SET quantity = ? WHERE ticker = ?',
    [newCashQuantity, 'CASH']
  );

  // 7. 插入交易记录（使用真实 asset_type）
  await pool.execute(
    'INSERT INTO orders (ticker, type, quantity, price, asset_type) VALUES (?, ?, ?, ?, ?)',
    [ticker, 'SELL', quantity, executionPrice, assetType]
  );

  // 8. 返回结果
  return {
    success: true,
    message: 'Sell order executed',
    executionPrice,
    marketPrice,
    requestedPrice: price,
    totalProceeds,
    newCashBalance: newCashQuantity
  };
};

/**
 * get all orders
 */
export const getAllOrders = async () => {
  const [orders] = await pool.execute('SELECT * FROM orders');
  return orders;
};