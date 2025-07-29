# 📊 API计算逻辑详细说明

## 🎯 概述
本文档详细说明三个核心API的计算逻辑，包含具体的交易例子和计算过程。

## 📈 投资组合计算逻辑

### 基础概念
- **持仓数量 (quantity)**: 持有的股票/货币数量
- **平均成本 (avg_price)**: 所有买入交易的平均价格
- **当前价格 (current_price)**: 实时市场价格
- **总成本 (total_cost)**: 持仓数量 × 平均成本
- **当前价值 (current_value)**: 持仓数量 × 当前价格
- **盈亏 (profit_loss)**: 当前价值 - 总成本
- **盈亏百分比 (profit_loss_percent)**: (当前价格 - 平均成本) / 平均成本 × 100%

### 计算示例

#### 初始状态
```
用户持有：
- AAPL: 100股，平均成本 $150/股
- MSFT: 50股，平均成本 $200/股
```

#### 当前市场价格
```
- AAPL: $160/股
- MSFT: $190/股
```

#### 计算过程
```javascript
// AAPL计算
const aapl = {
    ticker: 'AAPL',
    quantity: 100,
    avg_price: 150,
    current_price: 160,
    total_cost: 100 * 150 = 15000,
    current_value: 100 * 160 = 16000,
    profit_loss: 16000 - 15000 = 1000,
    profit_loss_percent: (160 - 150) / 150 * 100 = 6.67%
};

// MSFT计算
const msft = {
    ticker: 'MSFT',
    quantity: 50,
    avg_price: 200,
    current_price: 190,
    total_cost: 50 * 200 = 10000,
    current_value: 50 * 190 = 9500,
    profit_loss: 9500 - 10000 = -500,
    profit_loss_percent: (190 - 200) / 200 * 100 = -5%
};

// 总投资组合
const portfolio = {
    total_cost: 15000 + 10000 = 25000,
    total_value: 16000 + 9500 = 25500,
    total_profit_loss: 1000 + (-500) = 500,
    total_profit_loss_percent: 500 / 25000 * 100 = 2%
};
```

## 💰 交易逻辑详解

### 买入交易逻辑

#### 场景1：首次买入
```
用户首次买入AAPL股票
- 买入数量：50股
- 买入价格：$155/股
```

#### 计算过程
```javascript
// 1. 检查是否已有持仓
const existingHolding = await pool.execute(
    'SELECT * FROM portfolio WHERE ticker = ?', 
    ['AAPL']
);

// 2. 如果没有持仓，创建新记录
if (existingHolding[0].length === 0) {
    await pool.execute(
        'INSERT INTO portfolio (ticker, quantity, avg_price, asset_type) VALUES (?, ?, ?, ?)',
        ['AAPL', 50, 155, 'stock']
    );
}

// 3. 记录交易历史
await pool.execute(
    'INSERT INTO orders (ticker, type, quantity, price, asset_type) VALUES (?, ?, ?, ?, ?)',
    ['AAPL', 'BUY', 50, 155, 'stock']
);

// 结果：
// portfolio表：AAPL - 50股，平均成本 $155
// orders表：记录买入50股，价格 $155
```

#### 场景2：追加买入
```
用户已有AAPL持仓，再次买入
- 现有持仓：50股，平均成本 $155
- 新买入：30股，价格 $160
```

#### 计算过程
```javascript
// 1. 获取现有持仓
const [existing] = await pool.execute(
    'SELECT * FROM portfolio WHERE ticker = ?', 
    ['AAPL']
);
const holding = existing[0];

// 2. 计算新的平均成本
const totalQuantity = holding.quantity + 30; // 50 + 30 = 80股
const totalCost = (holding.quantity * holding.avg_price) + (30 * 160);
const newAvgPrice = totalCost / totalQuantity;

// 计算过程：
// 原有成本：50 × $155 = $7,750
// 新增成本：30 × $160 = $4,800
// 总成本：$7,750 + $4,800 = $12,550
// 新平均成本：$12,550 ÷ 80 = $156.875

// 3. 更新持仓
await pool.execute(
    'UPDATE portfolio SET quantity = ?, avg_price = ? WHERE ticker = ?',
    [80, 156.875, 'AAPL']
);

// 4. 记录交易历史
await pool.execute(
    'INSERT INTO orders (ticker, type, quantity, price, asset_type) VALUES (?, ?, ?, ?, ?)',
    ['AAPL', 'BUY', 30, 160, 'stock']
);

// 结果：
// portfolio表：AAPL - 80股，平均成本 $156.875
// orders表：记录买入30股，价格 $160
```

### 卖出交易逻辑

#### 场景3：部分卖出
```
用户卖出部分AAPL持仓
- 现有持仓：80股，平均成本 $156.875
- 卖出：20股，价格 $165
```

#### 计算过程
```javascript
// 1. 检查持仓是否足够
const [existing] = await pool.execute(
    'SELECT * FROM portfolio WHERE ticker = ?', 
    ['AAPL']
);
const holding = existing[0];

if (holding.quantity < 20) {
    throw new Error('Insufficient holdings');
}

// 2. 计算剩余持仓
const remainingQuantity = holding.quantity - 20; // 80 - 20 = 60股
// 平均成本保持不变：$156.875

// 3. 更新持仓
await pool.execute(
    'UPDATE portfolio SET quantity = ? WHERE ticker = ?',
    [60, 'AAPL']
);

// 4. 记录交易历史
await pool.execute(
    'INSERT INTO orders (ticker, type, quantity, price, asset_type) VALUES (?, ?, ?, ?, ?)',
    ['AAPL', 'SELL', 20, 165, 'stock']
);

// 结果：
// portfolio表：AAPL - 60股，平均成本 $156.875
// orders表：记录卖出20股，价格 $165
```

#### 场景4：全部卖出
```
用户卖出全部AAPL持仓
- 现有持仓：60股，平均成本 $156.875
- 卖出：60股，价格 $170
```

#### 计算过程
```javascript
// 1. 检查持仓
const [existing] = await pool.execute(
    'SELECT * FROM portfolio WHERE ticker = ?', 
    ['AAPL']
);
const holding = existing[0];

if (holding.quantity < 60) {
    throw new Error('Insufficient holdings');
}

// 2. 删除持仓记录（全部卖出）
await pool.execute(
    'DELETE FROM portfolio WHERE ticker = ?',
    ['AAPL']
);

// 3. 记录交易历史
await pool.execute(
    'INSERT INTO orders (ticker, type, quantity, price, asset_type) VALUES (?, ?, ?, ?, ?)',
    ['AAPL', 'SELL', 60, 170, 'stock']
);

// 结果：
// portfolio表：AAPL记录被删除
// orders表：记录卖出60股，价格 $170
```

## 📊 盈亏计算示例

### 完整交易历史示例

#### 交易记录
```
1. 买入AAPL 50股，价格 $155
2. 买入AAPL 30股，价格 $160  
3. 卖出AAPL 20股，价格 $165
4. 卖出AAPL 60股，价格 $170
```

#### 盈亏计算
```javascript
// 交易1：买入50股，价格 $155
// 成本：50 × $155 = $7,750

// 交易2：买入30股，价格 $160
// 新增成本：30 × $160 = $4,800
// 总成本：$7,750 + $4,800 = $12,550
// 平均成本：$12,550 ÷ 80 = $156.875

// 交易3：卖出20股，价格 $165
// 收入：20 × $165 = $3,300
// 成本：20 × $156.875 = $3,137.5
// 盈利：$3,300 - $3,137.5 = $162.5

// 交易4：卖出60股，价格 $170
// 收入：60 × $170 = $10,200
// 成本：60 × $156.875 = $9,412.5
// 盈利：$10,200 - $9,412.5 = $787.5

// 总盈利：$162.5 + $787.5 = $950
```

## API实现逻辑

### 价格API

#### 1. 获取单个资产价格 (`GET /api/price/:ticker`)
```javascript
// 获取单个资产价格
const getPrice = async (req, res) => {
    try {
        const { ticker } = req.params;
        
        // 1. 从数据库获取最新价格
        const [rows] = await pool.execute(
            'SELECT price, datetime FROM stock_currency WHERE ticker = ? ORDER BY datetime DESC LIMIT 1',
            [ticker]
        );
        
        if (rows.length === 0) {
            return res.status(404).json({ error: 'Asset not found' });
        }
        
        // 2. 返回价格信息
        res.json({
            ticker,
            price: rows[0].price,
            lastUpdated: rows[0].datetime
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
```

#### 2. 批量获取价格 (`GET /api/price/batch`)
```javascript
// 批量获取所有资产价格
const getBatchPrices = async (req, res) => {
    try {
        // 1. 获取所有活跃资产的最新价格
        const [rows] = await pool.execute(`
            SELECT ticker, price, datetime 
            FROM stock_currency sc1
            WHERE datetime = (
                SELECT MAX(datetime) 
                FROM stock_currency sc2 
                WHERE sc2.ticker = sc1.ticker
            )
            ORDER BY ticker
        `);
        
        // 2. 格式化返回数据
        const prices = rows.map(row => ({
            ticker: row.ticker,
            price: row.price,
            lastUpdated: row.datetime
        }));
        
        res.json({ prices });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
```

#### 3. 更新所有价格 (`POST /api/price/update-all`)
```javascript
// 更新所有资产价格
const updateAllPrices = async (req, res) => {
    try {
        // 1. 获取所有需要更新的资产
        const tickerMap = {
            'AAPL': { asset_type: 'stock', realTicker: 'AAPL' },
            'MSFT': { asset_type: 'stock', realTicker: 'MSFT' },
            'NVDA': { asset_type: 'stock', realTicker: 'NVDA' },
            'AMZN': { asset_type: 'stock', realTicker: 'AMZN' },
            'WFC': { asset_type: 'stock', realTicker: 'WFC' },
            'USD/CNY': { asset_type: 'currency', realTicker: 'USDCNY=X' },
            'USD/EUR': { asset_type: 'currency', realTicker: 'USDEUR=X' },
            'USD/JPY': { asset_type: 'currency', realTicker: 'USDJPY=X' }
        };
        
        const updateResults = [];
        
        // 2. 批量更新价格
        for (const [ticker, info] of Object.entries(tickerMap)) {
            try {
                // 调用Yahoo API获取价格
                const data = info.asset_type === 'stock'
                    ? await yahooFinance.quoteSummary(info.realTicker, { modules: ['price'] })
                    : await yahooFinance.quote(info.realTicker);
                
                const price = data?.price?.regularMarketPrice ?? data?.regularMarketPrice;
                const name = data?.price?.shortName ?? ticker;
                
                if (price) {
                    // 插入新价格记录
                    await pool.execute(`
                        INSERT INTO stock_currency (ticker, name, price, datetime, asset_type)
                        VALUES (?, ?, ?, NOW(), ?)
                    `, [ticker, name, price, info.asset_type]);
                    
                    updateResults.push({
                        ticker,
                        price,
                        status: 'success'
                    });
                } else {
                    updateResults.push({
                        ticker,
                        status: 'error',
                        message: 'No price data'
                    });
                }
            } catch (error) {
                updateResults.push({
                    ticker,
                    status: 'error',
                    message: error.message
                });
            }
        }
        
        res.json({
            message: 'Price update completed',
            results: updateResults
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
```

### 交易API (`/api/trade/buy`, `/api/trade/sell`)

#### 1. 买入交易 (`POST /api/trade/buy`)
```javascript
// 买入交易
const buyTrade = async (req, res) => {
    try {
        const { ticker, quantity, price } = req.body;
        
        // 1. 获取当前市场价格
        const [priceRows] = await pool.execute(
            'SELECT price FROM stock_currency WHERE ticker = ? ORDER BY datetime DESC LIMIT 1',
            [ticker]
        );
        
        if (priceRows.length === 0) {
            return res.status(400).json({ error: 'Asset not found or no price data' });
        }
        
        const marketPrice = priceRows[0].price;
        
        // 2. 验证买入价格
        if (price < marketPrice) {
            return res.status(400).json({ 
                error: 'Price too low', 
                message: `Your price (${price}) is below market price (${marketPrice}). Cannot execute buy order.`,
                marketPrice 
            });
        }
        
        // 3. 使用市场价格成交
        const executionPrice = marketPrice;
        const totalCost = quantity * executionPrice;
        
        // 4. 检查现金是否足够
        const [cashHolding] = await pool.execute(
            'SELECT quantity FROM portfolio WHERE ticker = ?',
            ['CASH']
        );
        
        if (cashHolding.length === 0 || cashHolding[0].quantity < totalCost) {
            return res.status(400).json({ 
                error: 'Insufficient cash', 
                message: `Need $${totalCost} but only have $${cashHolding[0]?.quantity || 0}`
            });
        }
        
        // 5. 扣除现金
        const newCashQuantity = cashHolding[0].quantity - totalCost;
        await pool.execute(
            'UPDATE portfolio SET quantity = ? WHERE ticker = ?',
            [newCashQuantity, 'CASH']
        );
        
        // 6. 获取现有持仓
        const [existing] = await pool.execute(
            'SELECT * FROM portfolio WHERE ticker = ?',
            [ticker]
        );
        
        if (existing.length === 0) {
            // 首次买入
            await pool.execute(
                'INSERT INTO portfolio (ticker, quantity, avg_price, asset_type) VALUES (?, ?, ?, ?)',
                [ticker, quantity, executionPrice, 'stock']
            );
        } else {
            // 追加买入
            const holding = existing[0];
            const newQuantity = holding.quantity + quantity;
            const newAvgPrice = ((holding.quantity * holding.avg_price) + (quantity * executionPrice)) / newQuantity;
            
            await pool.execute(
                'UPDATE portfolio SET quantity = ?, avg_price = ? WHERE ticker = ?',
                [newQuantity, newAvgPrice, ticker]
            );
        }
        
        // 7. 记录交易
        await pool.execute(
            'INSERT INTO orders (ticker, type, quantity, price, asset_type) VALUES (?, ?, ?, ?, ?)',
            [ticker, 'BUY', quantity, executionPrice, 'stock']
        );
        
        res.json({ 
            success: true, 
            message: 'Buy order executed',
            executionPrice,
            marketPrice,
            requestedPrice: price,
            totalCost,
            remainingCash: newCashQuantity
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
```

#### 2. 卖出交易 (`POST /api/trade/sell`)
```javascript
// 卖出交易
const sellTrade = async (req, res) => {
    try {
        const { ticker, quantity, price } = req.body;
        
        // 1. 获取当前市场价格
        const [priceRows] = await pool.execute(
            'SELECT price FROM stock_currency WHERE ticker = ? ORDER BY datetime DESC LIMIT 1',
            [ticker]
        );
        
        if (priceRows.length === 0) {
            return res.status(400).json({ error: 'Asset not found or no price data' });
        }
        
        const marketPrice = priceRows[0].price;
        
        // 2. 验证卖出价格
        if (price > marketPrice) {
            return res.status(400).json({ 
                error: 'Price too high', 
                message: `Your price (${price}) is above market price (${marketPrice}). Cannot execute sell order.`,
                marketPrice 
            });
        }
        
        // 3. 使用市场价格成交
        const executionPrice = marketPrice;
        const totalProceeds = quantity * executionPrice;
        
        // 4. 检查持仓
        const [existing] = await pool.execute(
            'SELECT * FROM portfolio WHERE ticker = ?',
            [ticker]
        );
        
        if (existing.length === 0 || existing[0].quantity < quantity) {
            return res.status(400).json({ error: 'Insufficient holdings' });
        }
        
        const holding = existing[0];
        const remainingQuantity = holding.quantity - quantity;
        
        // 5. 更新持仓
        if (remainingQuantity === 0) {
            // 全部卖出
            await pool.execute('DELETE FROM portfolio WHERE ticker = ?', [ticker]);
        } else {
            // 部分卖出
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
        
        const newCashQuantity = (cashHolding[0]?.quantity || 0) + totalProceeds;
        await pool.execute(
            'UPDATE portfolio SET quantity = ? WHERE ticker = ?',
            [newCashQuantity, 'CASH']
        );
        
        // 7. 记录交易
        await pool.execute(
            'INSERT INTO orders (ticker, type, quantity, price, asset_type) VALUES (?, ?, ?, ?, ?)',
            [ticker, 'SELL', quantity, executionPrice, 'stock']
        );
        
        res.json({ 
            success: true, 
            message: 'Sell order executed',
            executionPrice,
            marketPrice,
            requestedPrice: price,
            totalProceeds,
            newCashBalance: newCashQuantity
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
```

#### 3. 交易历史 (`GET /api/trade/history`)
```javascript
// 获取交易历史
const getTradeHistory = async (req, res) => {
    try {
        const { page = 1, limit = 20, ticker } = req.query;
        const offset = (page - 1) * limit;
        
        let query = 'SELECT * FROM orders';
        let countQuery = 'SELECT COUNT(*) as total FROM orders';
        let params = [];
        
        // 如果指定了ticker，添加过滤条件
        if (ticker) {
            query += ' WHERE ticker = ?';
            countQuery += ' WHERE ticker = ?';
            params.push(ticker);
        }
        
        query += ' ORDER BY datetime DESC LIMIT ? OFFSET ?';
        params.push(parseInt(limit), offset);
        
        // 1. 获取交易记录
        const [orders] = await pool.execute(query, params);
        
        // 2. 获取总记录数
        const [countResult] = await pool.execute(countQuery, ticker ? [ticker] : []);
        const total = countResult[0].total;
        
        // 3. 格式化返回数据
        const history = orders.map(order => ({
            id: order.id,
            ticker: order.ticker,
            type: order.type,
            quantity: order.quantity,
            price: order.price,
            totalAmount: order.quantity * order.price,
            datetime: order.datetime,
            assetType: order.asset_type
        }));
        
        res.json({
            history,
            pagination: {
                page: parseInt(page),
                limit: parseInt(limit),
                total,
                totalPages: Math.ceil(total / limit)
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
```

### 投资组合API

#### 投资组合概览 (`GET /api/portfolio`)
```javascript
// 获取投资组合概览
const getPortfolio = async (req, res) => {
    try {
        // 1. 获取所有持仓
        const [holdings] = await pool.execute('SELECT * FROM portfolio');
        
        // 2. 获取实时价格
        const portfolio = [];
        let totalCost = 0;
        let totalValue = 0;
        
        for (const holding of holdings) {
            // 获取最新价格
            const [priceRows] = await pool.execute(
                'SELECT price FROM stock_currency WHERE ticker = ? ORDER BY datetime DESC LIMIT 1',
                [holding.ticker]
            );
            
            const currentPrice = priceRows[0]?.price || holding.avg_price;
            const currentValue = holding.quantity * currentPrice;
            const profitLoss = currentValue - (holding.quantity * holding.avg_price);
            const profitLossPercent = ((currentPrice - holding.avg_price) / holding.avg_price) * 100;
            
            portfolio.push({
                ticker: holding.ticker,
                quantity: holding.quantity,
                avgPrice: holding.avg_price,
                currentPrice,
                currentValue,
                profitLoss,
                profitLossPercent
            });
            
            totalCost += holding.quantity * holding.avg_price;
            totalValue += currentValue;
        }
        
        const totalProfitLoss = totalValue - totalCost;
        const totalProfitLossPercent = totalCost > 0 ? (totalProfitLoss / totalCost) * 100 : 0;
        
        res.json({
            portfolio,
            summary: {
                totalCost,
                totalValue,
                totalProfitLoss,
                totalProfitLossPercent
            }
        });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};
```

## 🎯 关键要点

### 平均成本计算
- **首次买入**: 平均成本 = 买入价格
- **追加买入**: 平均成本 = (原有成本 + 新增成本) ÷ 总数量
- **卖出**: 平均成本保持不变

### 盈亏计算
- **单项盈亏**: 当前价值 - 总成本
- **总盈亏**: 所有持仓盈亏之和
- **盈亏百分比**: (当前价格 - 平均成本) ÷ 平均成本 × 100%

### 数据一致性
- 每次交易都要更新portfolio表和orders表
- 使用数据库事务确保数据一致性
- 价格数据从stock_currency表获取最新记录

---
