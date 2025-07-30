CREATE DATABASE IF NOT EXISTS portfolio;
USE portfolio;

CREATE TABLE stock_currency (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    name VARCHAR(100),
    price DECIMAL(18, 4) ,
    datetime DATETIME DEFAULT CURRENT_TIMESTAMP,
    asset_type ENUM('stock', 'currency', 'cash') NOT NULL,
    UNIQUE KEY unique_ticker_datetime (ticker, datetime)
);

CREATE TABLE orders (
    id INT AUTO_INCREMENT PRIMARY KEY,
    ticker VARCHAR(20) NOT NULL,
    type ENUM('BUY', 'SELL') NOT NULL,
    quantity DECIMAL(18, 4) NOT NULL,
    price DECIMAL(18, 4) NOT NULL,
    datetime DATETIME DEFAULT CURRENT_TIMESTAMP,
    asset_type ENUM('stock', 'currency', 'cash') NOT NULL
);

CREATE TABLE portfolio (
  ticker VARCHAR(20) PRIMARY KEY,   
  quantity DECIMAL(18, 4) NOT NULL, 
  avg_price DECIMAL(18, 4),   
  asset_type ENUM('stock', 'currency', 'cash') NOT NULL,
  updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP 
);

insert into portfolio (ticker, quantity, avg_price, asset_type) values
('CASH', 10000, 0, 'cash');



