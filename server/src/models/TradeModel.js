import pool from '../../config/db.js';

export async function executeBuyTrade(ticker, quantity, userPrice) {
  // 获取市场价格
  const [priceRows] = await pool.execute(
    `SELECT price FROM stock_currency WHERE ticker = ? ORDER BY datetime DESC LIMIT 1`,
    [ticker]
  );

  if (priceRows.length === 0) {
    throw { status: 400, message: 'Asset not found or no price data' };
  }

  const marketPrice = priceRows[0].price;

  if (userPrice < marketPrice) {
    throw {
      status: 400,
      message: `Your price (${userPrice}) is below market price (${marketPrice}). Cannot execute buy order.`,
      marketPrice,
    };
  }

  const executionPrice = marketPrice;
  const totalCost = quantity * executionPrice;

  // 检查现金是否足够
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

  // 扣除现金
  const newCash = cashAvailable - totalCost;
  await pool.execute(
    `UPDATE portfolio SET quantity = ? WHERE ticker = ?`,
    [newCash, 'CASH']
  );

  // 更新/创建持仓
  const [existingRows] = await pool.execute(
    `SELECT * FROM portfolio WHERE ticker = ?`,
    [ticker]
  );

  if (existingRows.length === 0) {
    await pool.execute(
      `INSERT INTO portfolio (ticker, quantity, avg_price, asset_type)
       VALUES (?, ?, ?, ?)`,
      [ticker, quantity, executionPrice, 'stock']
    );
  } else {
    const holding = existingRows[0];
    const newQuantity = holding.quantity + quantity;
    const newAvgPrice = ((holding.quantity * holding.avg_price) + (quantity * executionPrice)) / newQuantity;

    await pool.execute(
      `UPDATE portfolio SET quantity = ?, avg_price = ? WHERE ticker = ?`,
      [newQuantity, newAvgPrice, ticker]
    );
  }

  // 插入订单记录
  await pool.execute(
    `INSERT INTO orders (ticker, type, quantity, price, asset_type)
     VALUES (?, 'BUY', ?, ?, ?)`,
    [ticker, quantity, executionPrice, 'stock']
  );

  return {
    executionPrice,
    marketPrice,
    requestedPrice: userPrice,
    totalCost,
    remainingCash: newCash,
  };
}
