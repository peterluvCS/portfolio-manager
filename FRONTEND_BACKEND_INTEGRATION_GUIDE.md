# 🔗 Portfolio Manager 前后端集成架构说明文档

## 📋 项目概述

Portfolio Manager 是一个基于 React + Node.js 的全栈投资组合管理系统，采用前后端分离架构，通过 RESTful API 进行数据交互。

## 🏗️ 整体架构

```
┌─────────────────┐    HTTP/JSON    ┌─────────────────┐    SQL    ┌─────────────────┐
│   React Frontend │ ◄─────────────► │  Node.js Backend │ ◄────────► │   MySQL Database │
│   (Port 3000)   │                 │   (Port 8081)   │           │                 │
└─────────────────┘                 └─────────────────┘           └─────────────────┘
         │                                   │                              │
         │                                   │                              │
         ▼                                   ▼                              ▼
┌─────────────────┐                 ┌─────────────────┐           ┌─────────────────┐
│   User Interface│                 │  Business Logic │           │  Data Storage   │
│   - Dashboard   │                 │  - Controllers  │           │  - Tables       │
│   - Portfolio   │                 │  - Models       │           │  - Relations    │
│   - Trading     │                 │  - Routes       │           │  - Indexes      │
│   - History     │                 │  - Express App  │           │                 │
└─────────────────┘                 └─────────────────┘           └─────────────────┘
```

## 📁 实际项目结构

### Backend Structure (`server/src/`)
```
src/
├── app.js              # Express application entry point
├── controllers/        # Business logic controllers
│   ├── portfolioController.js
│   ├── priceController.js
│   └── tradeController.js
├── models/            # Data model layer
│   ├── PortfolioModel.js
│   ├── TradeModel.js
│   └── price.js
└── routes/            # API route definitions
    ├── portfolio.js
    ├── priceRouter.js
    └── trade.js
```

### Frontend Structure (`client/src/`)
```
src/
├── App.js             # React application entry point
├── components/        # Reusable UI components
│   └── Layout/
├── pages/            # Page components
│   ├── Dashboard.js
│   ├── Portfolio.js
│   ├── Trading.js
│   └── History.js
└── services/        # API service layer
    └── api.js
```

## 🔌 前后端连接机制

### 1. API 基础配置

**前端配置** (`client/src/services/api.js`):
```javascript
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});
```

**后端配置** (`server/src/app.js`):
```javascript
import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';

const app = express();
app.use(cors()); // 允许跨域请求
app.use(bodyParser.json());

// 路由注册
app.use('/api/price', priceRouter);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/trade', tradeRoutes);
```

### 2. 数据流架构

```
用户操作 → 前端状态更新 → API调用 → 后端处理 → 数据库操作 → 响应数据 → 前端更新UI
```

## 📊 核心功能模块详解

### 🏠 Dashboard 模块

#### 前端实现 (`client/src/pages/Dashboard.js`)
```javascript
// 1. 状态管理
const [portfolio, setPortfolio] = useState(null);
const [loading, setLoading] = useState(true);

// 2. 数据获取
const fetchPortfolio = async () => {
  const response = await portfolioAPI.getPortfolio();
  setPortfolio(response.data);
};

// 3. 生命周期
useEffect(() => {
  fetchPortfolio();
}, []);
```

#### 后端实现 (`server/src/controllers/portfolioController.js`)
```javascript
// 1. 路由处理
static async getPortfolio(req, res) {
  try {
    const portfolioData = await PortfolioModel.calculatePortfolio();
    res.json(portfolioData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
}
```

#### 数据流过程
```
1. 用户访问Dashboard页面
2. useEffect触发fetchPortfolio()
3. 调用GET /api/portfolio
4. 后端PortfolioController处理请求
5. PortfolioModel计算投资组合数据
6. 查询数据库获取持仓和价格
7. 返回JSON数据给前端
8. 前端更新状态并重新渲染UI
```

### 💹 Trading 模块

#### 前端实现 (`client/src/pages/Trading.js`)
```javascript
// 1. 交易状态管理
const [tradeType, setTradeType] = useState('BUY');
const [selectedAsset, setSelectedAsset] = useState('');
const [quantity, setQuantity] = useState('');

// 2. 交易执行
const handleTrade = async () => {
  const tradeData = {
    ticker: selectedAsset,
    quantity: parseInt(quantity),
    price: parseFloat(price),
    type: tradeType
  };
  
  const response = tradeType === 'BUY' 
    ? await tradeAPI.buy(tradeData)
    : await tradeAPI.sell(tradeData);
};
```

#### 后端实现 (`server/src/controllers/tradeController.js`)
```javascript
// 1. 买入交易
static async handleBuyTrade(req, res) {
  const { ticker, quantity, price } = req.body;
  
  try {
    const result = await TradeModel.executeBuyTrade(ticker, quantity, price);
    res.json({ message: 'Buy order executed successfully', data: result });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
}
```

#### 数据流过程
```
1. 用户填写交易表单
2. 点击交易按钮触发handleTrade()
3. 调用POST /api/trade/buy 或 /api/trade/sell
4. 后端TradeController验证请求数据
5. TradeModel执行交易逻辑
6. 更新数据库中的持仓和现金
7. 返回交易结果给前端
8. 前端显示成功/失败消息
```

### 📈 Portfolio 模块

#### 前端实现 (`client/src/pages/Portfolio.js`)
```javascript
// 1. 存款功能
const handleDeposit = async (amount) => {
  try {
    await portfolioAPI.charge(amount);
    await fetchPortfolio(); // 重新获取数据
  } catch (error) {
    setError('Deposit failed');
  }
};

// 2. 取款功能
const handleWithdraw = async (amount) => {
  try {
    await portfolioAPI.withdraw(amount);
    await fetchPortfolio(); // 重新获取数据
  } catch (error) {
    setError('Withdrawal failed');
  }
};
```

#### 后端实现 (`server/src/models/PortfolioModel.js`)
```javascript
// 1. 存款处理
async chargeCash(amount) {
  await pool.execute(
    'UPDATE portfolio SET quantity = quantity + ? WHERE ticker = ?', 
    [amount, 'CASH']
  );
}

// 2. 取款处理
async withdrawCash(amount) {
  const [rows] = await pool.execute(
    'SELECT quantity FROM portfolio WHERE ticker = ?', 
    ['CASH']
  );
  
  if (rows[0].quantity < amount) {
    throw new Error('Insufficient cash balance');
  }
  
  await pool.execute(
    'UPDATE portfolio SET quantity = quantity - ? WHERE ticker = ?', 
    [amount, 'CASH']
  );
}
```

## 🔄 实时数据更新机制

### 1. 定时价格更新

**后端定时任务** (`server/src/models/price.js`):
```javascript
static startPriceUpdateCron() {
  cron.schedule('*/5 * * * *', async () => {
    try {
      const results = await Price.fetchAndInsertRealTimePrices();
      console.log('Price update completed:', results);
    } catch (error) {
      console.error('Price update failed:', error);
    }
  });
}
```

**数据流过程**:
```
1. 服务器启动时初始化定时任务
2. 每5分钟自动执行价格更新
3. 调用Yahoo Finance API获取最新价格
4. 将新价格插入数据库
5. 前端下次请求时自动获取最新价格
```

### 2. 前端数据刷新

**自动刷新机制**:
```javascript
// 在组件中实现数据刷新
useEffect(() => {
  const interval = setInterval(() => {
    fetchPortfolio(); // 定期刷新数据
  }, 30000); // 每30秒刷新一次
  
  return () => clearInterval(interval);
}, []);
```

## 🎨 UI 状态管理

### 1. 加载状态管理
```javascript
const [loading, setLoading] = useState(true);
const [error, setError] = useState(null);

const fetchData = async () => {
  try {
    setLoading(true);
    setError(null);
    const response = await api.getData();
    setData(response.data);
  } catch (err) {
    setError(err.message);
  } finally {
    setLoading(false);
  }
};
```

### 2. 条件渲染
```javascript
return (
  <div>
    {loading && <LoadingSpinner />}
    {error && <ErrorMessage error={error} />}
    {data && <DataDisplay data={data} />}
  </div>
);
```

## 🔧 API 接口规范

### 1. 请求格式
```javascript
// GET 请求
GET /api/portfolio
GET /api/price/batch
GET /api/trade/history

// POST 请求
POST /api/trade/buy
{
  "ticker": "AAPL",
  "quantity": 10,
  "price": 150.00
}

POST /api/portfolio/charge
{
  "amount": 1000
}
```

### 2. 响应格式
```javascript
// 成功响应
{
  "portfolio": [...],
  "summary": {
    "totalValue": 100000,
    "totalProfitLoss": 5000,
    "totalProfitLossPercent": 5.0
  }
}

// 错误响应
{
  "error": "Insufficient cash balance"
}
```

## 🛡️ 错误处理机制

### 1. 前端错误处理
```javascript
const handleApiCall = async () => {
  try {
    const response = await api.getData();
    setData(response.data);
  } catch (error) {
    if (error.response?.status === 400) {
      setError('Invalid request data');
    } else if (error.response?.status === 500) {
      setError('Server error, please try again');
    } else {
      setError('Network error, check your connection');
    }
  }
};
```

### 2. 后端错误处理
```javascript
// 全局错误处理中间件
app.use((error, req, res, next) => {
  console.error('Error:', error);
  res.status(500).json({
    error: 'Internal server error',
    message: error.message
  });
});
```




## 🚀 性能优化

### 1. 前端优化
- **代码分割**: 按路由懒加载组件
- **缓存策略**: 缓存API响应数据
- **防抖处理**: 避免频繁API调用

### 2. 后端优化
- **数据库连接池**: 复用数据库连接
- **查询优化**: 使用索引和优化SQL
- **缓存机制**: 缓存频繁查询的数据

## 📊 数据流程图

```
用户操作
    ↓
前端状态更新
    ↓
API调用 (Axios)
    ↓
后端路由处理 (Express)
    ↓
业务逻辑处理 (Controllers)
    ↓
数据访问层 (Models)
    ↓
数据库操作 (MySQL)
    ↓
返回响应数据
    ↓
前端更新UI (React)
    ↓
用户看到结果
```

## 🎯 关键集成点

### 1. 数据同步
- 前端状态与后端数据保持一致
- 实时更新价格和持仓信息
- 交易后立即刷新相关数据

### 2. 错误同步
- 前端显示后端返回的具体错误信息
- 网络错误和业务错误的区分处理
- 用户友好的错误提示

### 3. 状态同步
- 加载状态的前后端同步
- 数据验证的前后端同步
- 用户操作的前后端同步

---

*本文档详细说明了Portfolio Manager前后端集成的技术架构和实现细节，可用于系统设计和开发参考。* 