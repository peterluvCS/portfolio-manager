import React, { useState, useEffect } from 'react';
import { tradeAPI, priceAPI } from '../services/api';
import './Trading.css';

const Trading = () => {
  const [tradeType, setTradeType] = useState('BUY');
  const [selectedAsset, setSelectedAsset] = useState('');
  const [quantity, setQuantity] = useState('');
  const [price, setPrice] = useState('');
  const [currentPrice, setCurrentPrice] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [assets, setAssets] = useState([]);
  const [assetsLoading, setAssetsLoading] = useState(true);

  useEffect(() => {
    fetchAssets();
  }, []);

  useEffect(() => {
    if (selectedAsset) {
      fetchCurrentPrice(selectedAsset);
    }
  }, [selectedAsset]);

  const fetchAssets = async () => {
    try {
      setAssetsLoading(true);
      const response = await priceAPI.getBatchPrices();
      // 转换数据结构，添加name字段
      const transformedAssets = response.data.prices.map(asset => ({
        ticker: asset.ticker,
        name: asset.ticker, // 暂时用ticker作为name
        price: parseFloat(asset.price)
      }));
      setAssets(transformedAssets);
    } catch (err) {
      console.error('Error fetching assets:', err);
      setMessage('Failed to load assets. Please check if the backend server is running.');
    } finally {
      setAssetsLoading(false);
    }
  };

  const fetchCurrentPrice = async (ticker) => {
    try {
      const response = await priceAPI.getBatchPrices();
      const asset = response.data.prices.find(item => item.ticker === ticker);
      if (asset) {
        setCurrentPrice(parseFloat(asset.price));
        setPrice(asset.price);
      }
    } catch (err) {
      console.error('Error fetching current price:', err);
    }
  };

  const handleTrade = async () => {
    if (!selectedAsset || !quantity || !price) {
      setMessage('Please fill in all fields');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      const tradeData = {
        ticker: selectedAsset,
        quantity: parseInt(quantity),
        price: parseFloat(price),
        type: tradeType
      };

      const response = tradeType === 'BUY' 
        ? await tradeAPI.buy(tradeData)
        : await tradeAPI.sell(tradeData);

      setMessage(`Trade executed successfully! ${response.data.message}`);
      setQuantity('');
      setPrice('');
      setSelectedAsset('');
      setCurrentPrice(null);
    } catch (err) {
      setMessage(err.response?.data?.error || 'Trade failed. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const calculateTotal = () => {
    if (quantity && price) {
      return (parseFloat(quantity) * parseFloat(price)).toFixed(2);
    }
    return '0.00';
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  return (
    <div className="trading">
      <div className="trading-header">
        <h1>Trading</h1>
        <p className="text-secondary">Buy and sell assets</p>
      </div>

      <div className="trading-container">
        <div className="card trading-form">
          <div className="form-header">
            <h2>Place Order</h2>
          </div>

          {/* 交易类型选择 */}
          <div className="trade-type-selector">
            <button
              className={`trade-type-btn ${tradeType === 'BUY' ? 'active' : ''}`}
              onClick={() => setTradeType('BUY')}
            >
              💚 Buy
            </button>
            <button
              className={`trade-type-btn ${tradeType === 'SELL' ? 'active' : ''}`}
              onClick={() => setTradeType('SELL')}
            >
              🔴 Sell
            </button>
          </div>

          {/* 资产选择 */}
          <div className="form-group">
            <label>Asset</label>
            <select
              value={selectedAsset}
              onChange={(e) => setSelectedAsset(e.target.value)}
              className="form-input"
              disabled={assetsLoading}
            >
              <option value="">Select an asset</option>
              {assets.map((asset) => (
                <option key={asset.ticker} value={asset.ticker}>
                  {asset.ticker} - {asset.name}
                </option>
              ))}
            </select>
            {assetsLoading && <p className="text-secondary">Loading assets...</p>}
          </div>

          {/* 数量输入 */}
          <div className="form-group">
            <label>Quantity</label>
            <input
              type="number"
              value={quantity}
              onChange={(e) => setQuantity(e.target.value)}
              placeholder="Enter quantity"
              min="1"
              className="form-input"
            />
          </div>

          {/* 价格输入 */}
          <div className="form-group">
            <label>Price (USD)</label>
            <input
              type="number"
              value={price}
              onChange={(e) => setPrice(e.target.value)}
              placeholder="Enter price"
              min="0"
              step="0.01"
              className="form-input"
            />
            {currentPrice && (
              <div className="current-price">
                Current Price: {formatCurrency(currentPrice)}
              </div>
            )}
          </div>

          {/* 总金额显示 */}
          <div className="total-amount">
            <label>Total Amount</label>
            <div className="total-value">{formatCurrency(calculateTotal())}</div>
          </div>

          {/* 交易按钮 */}
          <button
            className={`button ${tradeType === 'BUY' ? 'button-success' : 'button-danger'}`}
            onClick={handleTrade}
            disabled={loading || assetsLoading}
          >
            {loading ? 'Processing...' : `${tradeType} ${selectedAsset}`}
          </button>

          {/* 消息显示 */}
          {message && (
            <div className={`message ${message.includes('successfully') ? 'success' : 'error'}`}>
              {message}
            </div>
          )}
        </div>

        {/* 市场信息 */}
        <div className="card market-info">
          <div className="card-header">
            <h3>Market Information</h3>
          </div>
          {assetsLoading ? (
            <div className="market-prices">
              <p>Loading market data...</p>
            </div>
          ) : (
            <div className="market-prices">
              {assets.slice(0, 7).map((asset) => (
                <div key={asset.ticker} className="market-item">
                  <div className="market-ticker">{asset.ticker}</div>
                  <div className="market-price">{formatCurrency(asset.price)}</div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Trading; 