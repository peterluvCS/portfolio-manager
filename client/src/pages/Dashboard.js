import React, { useState, useEffect } from 'react';
import { portfolioAPI } from '../services/api';
import './Dashboard.css';

const Dashboard = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await portfolioAPI.getPortfolio();
      
      // 转换后端数据结构为前端期望的格式
      const data = response.data;
      const cashHolding = data.portfolio.find(item => item.ticker === 'CASH');
      const otherHoldings = data.portfolio.filter(item => item.ticker !== 'CASH');
      
      const transformedData = {
        totalValue: data.summary.totalValue,
        totalPnL: data.summary.totalProfitLoss,
        totalPnLPercentage: data.summary.totalProfitLossPercent,
        cashBalance: cashHolding ? cashHolding.currentValue : 0,
        holdings: otherHoldings.map(holding => ({
          ticker: holding.ticker,
          name: holding.ticker, // 暂时用ticker作为name
          quantity: parseFloat(holding.quantity),
          avgPrice: parseFloat(holding.avgPrice),
          currentPrice: parseFloat(holding.currentPrice),
          currentValue: holding.currentValue,
          pnl: holding.profitLoss,
          pnlPercentage: holding.profitLossPercent
        }))
      };
      
      setPortfolio(transformedData);
    } catch (err) {
      console.error('Error fetching portfolio:', err);
      setError('Failed to load portfolio data. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount);
  };

  const formatPercentage = (value) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`;
  };

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p className="text-secondary">Portfolio Overview</p>
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className="card">
          <h3>Loading Portfolio Data...</h3>
          <p>Please wait while we fetch your portfolio information.</p>
        </div>
      )}

      {/* 错误状态 */}
      {error && (
        <div className="card">
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button 
            className="button button-primary"
            onClick={fetchPortfolio}
          >
            Retry
          </button>
        </div>
      )}

      {/* 投资组合数据 */}
      {portfolio && !loading && !error && (
        <>
          {/* 总览卡片 */}
          <div className="overview-cards grid grid-4">
            <div className="card overview-card">
              <div className="card-header">
                <h3>Total Value</h3>
                <span className="card-icon">💰</span>
              </div>
              <div className="card-value">{formatCurrency(portfolio.totalValue)}</div>
            </div>

            <div className="card overview-card">
              <div className="card-header">
                <h3>Total P&L</h3>
                <span className="card-icon">📈</span>
              </div>
              <div className={`card-value ${portfolio.totalPnL >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatCurrency(portfolio.totalPnL)}
              </div>
              <div className={`card-subtitle ${portfolio.totalPnLPercentage >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatPercentage(portfolio.totalPnLPercentage)}
              </div>
            </div>

            <div className="card overview-card">
              <div className="card-header">
                <h3>Cash Balance</h3>
                <span className="card-icon">💵</span>
              </div>
              <div className="card-value">{formatCurrency(portfolio.cashBalance)}</div>
            </div>

            <div className="card overview-card">
              <div className="card-header">
                <h3>Total Assets</h3>
                <span className="card-icon">📊</span>
              </div>
              <div className="card-value">{portfolio.holdings.length}</div>
            </div>
          </div>

          {/* 持仓列表 */}
          <div className="card">
            <div className="card-header">
              <h2>Holdings</h2>
            </div>
            <div className="holdings-table">
              <table>
                <thead>
                  <tr>
                    <th>Asset</th>
                    <th>Quantity</th>
                    <th>Avg Price</th>
                    <th>Current Price</th>
                    <th>Current Value</th>
                    <th>P&L</th>
                    <th>P&L %</th>
                  </tr>
                </thead>
                <tbody>
                  {portfolio.holdings.map((holding) => (
                    <tr key={holding.ticker}>
                      <td>
                        <div className="asset-info">
                          <span className="asset-ticker">{holding.ticker}</span>
                          <span className="asset-name">{holding.name}</span>
                        </div>
                      </td>
                      <td>{holding.quantity}</td>
                      <td>{formatCurrency(holding.avgPrice)}</td>
                      <td>{formatCurrency(holding.currentPrice)}</td>
                      <td>{formatCurrency(holding.currentValue)}</td>
                      <td className={holding.pnl >= 0 ? 'text-success' : 'text-danger'}>
                        {formatCurrency(holding.pnl)}
                      </td>
                      <td className={holding.pnlPercentage >= 0 ? 'text-success' : 'text-danger'}>
                        {formatPercentage(holding.pnlPercentage)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {/* 测试内容（当没有数据时显示） */}
      {!portfolio && !loading && !error && (
        <div className="card">
          <h2>Welcome to Portfolio Manager</h2>
          <p>This is a test to see if the page is rendering correctly.</p>
          <p>If you can see this, the page is working!</p>
          <p>Current time: {new Date().toLocaleString()}</p>
        </div>
      )}
    </div>
  );
};

export default Dashboard; 