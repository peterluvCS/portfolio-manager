USE portfolio;

-- 插入昨天的价格数据
INSERT INTO stock_currency (ticker, name, price, datetime, asset_type) VALUES
('AAPL', 'Apple Inc.', 155.00, NOW() - INTERVAL 1 DAY, 'stock'),
('MSFT', 'Microsoft Corporation', 185.00, NOW() - INTERVAL 1 DAY, 'stock'),
('NVDA', 'NVIDIA Corporation', 440.00, NOW() - INTERVAL 1 DAY, 'stock'),
('AMZN', 'Amazon.com Inc.', 130.00, NOW() - INTERVAL 1 DAY, 'stock'),
('WFC', 'Wells Fargo & Company', 44.00, NOW() - INTERVAL 1 DAY, 'stock'),
('USD/CNY', 'USD/CNY', 7.20, NOW() - INTERVAL 1 DAY, 'currency'),
('USD/EUR', 'USD/EUR', 0.90, NOW() - INTERVAL 1 DAY, 'currency'),
('USD/JPY', 'USD/JPY', 148.00, NOW() - INTERVAL 1 DAY, 'currency'),
('CASH', 'Cash', 1.00, NOW() - INTERVAL 1 DAY, 'cash');

-- 插入今天的价格数据（当前价格）
INSERT INTO stock_currency (ticker, name, price, datetime, asset_type) VALUES
('AAPL', 'Apple Inc.', 160.50, NOW(), 'stock'),
('MSFT', 'Microsoft Corporation', 190.00, NOW(), 'stock'),
('NVDA', 'NVIDIA Corporation', 450.25, NOW(), 'stock'),
('AMZN', 'Amazon.com Inc.', 135.80, NOW(), 'stock'),
('WFC', 'Wells Fargo & Company', 45.30, NOW(), 'stock'),
('USD/CNY', 'USD/CNY', 7.25, NOW(), 'currency'),
('USD/EUR', 'USD/EUR', 0.92, NOW(), 'currency'),
('USD/JPY', 'USD/JPY', 150.45, NOW(), 'currency'),
('CASH', 'Cash', 1.00, NOW(), 'cash');

-- 插入持仓数据（基于昨天的交易）
INSERT INTO portfolio (ticker, quantity, avg_price, asset_type) VALUES
('AAPL', 100, 155.00, 'stock'),
('MSFT', 50, 185.00, 'stock'),
('USD/CNY', 1000, 7.20, 'currency'),
('CASH', 50000, 1.00, 'cash');

-- 插入昨天的交易历史
INSERT INTO orders (ticker, type, quantity, price, datetime, asset_type) VALUES
('AAPL', 'BUY', 100, 155.00, NOW() - INTERVAL 1 DAY, 'stock'),
('MSFT', 'BUY', 50, 185.00, NOW() - INTERVAL 1 DAY, 'stock'),
('USD/CNY', 'BUY', 1000, 7.20, NOW() - INTERVAL 1 DAY, 'currency'); 