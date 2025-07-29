# 📋 Portfolio Management System 

## 🎯 项目概述
个人投资组合管理系统，支持美股和外汇交易，具有实时价格更新、盈亏计算、交易历史等功能。

**⏰ 开发时间：1天**
**🎯 核心功能：价格API、交易API、投资组合API + 三个核心页面**

## 🏗️ 系统架构设计

### 技术栈
- **后端**: Node.js + Express + MySQL
- **前端**: React + JavaScript + Create React App
- **API**: Yahoo Finance API (实时价格数据)
- **数据库**: MySQL

### 项目结构
```
portfolio-manager/
├── server/                 # 后端代码
│   ├── src/
│   │   ├── app.js         # 主服务器文件
│   │   ├── db.js          # 数据库连接
│   │   ├── models/        # 数据模型
│   │   ├── routes/        # API路由
│   │   └── controllers/   # 控制器
│   └── createTables.sql   # 数据库表结构
├── client/                 # 前端代码
│   ├── src/
│   │   ├── components/    # React组件
│   │   ├── pages/         # 页面组件
│   │   └── services/      # API服务
│   └── public/            # 静态资源
└── package.json           # 根配置文件
```

## 🗄️ 数据库设计

### 表结构（已存在）

#### 1. stock_currency表 - 资产价格表
```sql
CREATE TABLE stock_currency (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    name VARCHAR(100),
    price DECIMAL(18, 4),
    datetime DATETIME DEFAULT CURRENT_TIMESTAMP,
    asset_type ENUM('stock', 'currency') NOT NULL,
    UNIQUE KEY unique_ticker_datetime (ticker, datetime)
);
```

#### 2. orders表 - 交易记录表
```sql
CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    type ENUM('BUY', 'SELL') NOT NULL,
    quantity DECIMAL(18, 4) NOT NULL,
    price DECIMAL(18, 4) NOT NULL,
    datetime DATETIME DEFAULT CURRENT_TIMESTAMP,
    asset_type ENUM('stock', 'currency') NOT NULL
);
```

#### 3. portfolio表 - 当前持仓表
```sql
CREATE TABLE portfolio (
    ticker VARCHAR(20) PRIMARY KEY,
    quantity DECIMAL(18, 4) NOT NULL,
    avg_price DECIMAL(18, 4),
    asset_type ENUM('stock', 'currency') NOT NULL,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
);
```

## 👥 一日开发分工方案

### 后端开发（上午）

#### 三个核心API
**负责文件：**
- `server/src/routes/price.js` (价格API路由)
- `server/src/routes/trade.js` (交易API路由)
- `server/src/routes/portfolio.js` (投资组合API路由)
- `server/src/controllers/priceController.js` (价格业务逻辑)
- `server/src/controllers/tradeController.js` (交易业务逻辑)
- `server/src/controllers/portfolioController.js` (投资组合业务逻辑)
- `server/src/models/PriceModel.js` (价格数据操作)
- `server/src/models/TradeModel.js` (交易数据操作)
- `server/src/models/PortfolioModel.js` (投资组合数据操作)

**功能清单：**
- [ ] 价格API：获取单个/批量资产价格
- [ ] 交易API：买入/卖出交易，更新持仓
- [ ] 投资组合API：获取持仓列表，计算盈亏

**API端点：**
```javascript
// 价格API
GET /api/price/:ticker - 获取单个资产价格
GET /api/price/batch - 批量获取所有资产价格
POST /api/price/update-all - 更新所有资产价格

// 交易API
POST /api/trade/buy - 买入交易
POST /api/trade/sell - 卖出交易
GET /api/trade/history - 交易历史

// 投资组合API
GET /api/portfolio - 获取投资组合概览
```

### 前端开发（下午）

#### 三个核心页面
**负责文件：**
- `client/src/pages/Dashboard.js` (仪表板)
- `client/src/pages/Trading.js` (交易页面)
- `client/src/pages/Portfolio.js` (投资组合页面)
- `client/src/services/api.js` (API服务)
- `client/src/components/` (通用组件)

**功能清单：**
- [ ] 仪表板：总览卡片，快速操作
- [ ] 交易页面：资产选择，买入/卖出表单
- [ ] 投资组合页面：持仓列表，盈亏显示
- [ ] API服务层：连接后端API
- [ ] 响应式布局和美观UI



## 🔄 数据流说明

### 交易流程
```
用户输入 → 前端验证 → 交易API → 更新portfolio → 记录orders → 返回结果
```

### 投资组合计算流程
```
访问页面 → 获取portfolio数据 → 调用Yahoo API → 计算盈亏 → 返回前端
```

## 📊 开发时间安排

### 上午- 后端开发
- 价格API开发
- 交易API开发
- 投资组合API开发
- API测试和调试

### 下午- 前端开发
- 项目配置和API服务层
- 仪表板页面
- 交易页面
- 投资组合页面和UI美化

## ✅ 验收标准

### 后端验收
- [ ] 三个API正常工作
- [ ] MySQL操作正确
- [ ] Yahoo API集成成功
- [ ] 错误处理完善

### 前端验收
- [ ] 三个页面正常显示
- [ ] 数据正确展示
- [ ] 用户交互流畅
- [ ] UI美观现代

### 功能验收
- [ ] 可以执行买入/卖出交易
- [ ] 投资组合计算正确
- [ ] 实时价格更新
- [ ] 交易历史记录

## 🛠️ 快速开发环境设置

### 后端环境
```bash
# 安装依赖
cd server
npm install

# 安装额外依赖
npm install yahoo-finance2

# 配置数据库
mysql -u root -p
CREATE DATABASE portfolio;
USE portfolio;
SOURCE createTables.sql;

# 启动服务器
npm run dev
```

### 前端环境
```bash
# 安装依赖
cd client
npm install

# 安装额外依赖
npm install axios react-router-dom

# 启动开发服务器
npm start
```