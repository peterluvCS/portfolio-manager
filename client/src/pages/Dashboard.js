import React, { useState, useEffect } from 'react';
import { portfolioAPI } from '../services/api';
import AssetAllocationChart from '../components/AssetAllocationChart';
import './Dashboard.css';

const Dashboard = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [updatingPrices, setUpdatingPrices] = useState(false);

  useEffect(() => {
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await portfolioAPI.getPortfolio();
      setPortfolio(response.data);
    } catch (err) {
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
        <div className="header-content">
          <div>
            <h1>Dashboard</h1>
            <p className="text-secondary">Portfolio Overview</p>
          </div>
        </div>
      </div>
      {/* Summary Cards */}
      {portfolio && (
        <div className="portfolio-stats grid grid-3">
          <div className="card stat-card">
            <div className="stat-header">
              <h3>Total Value</h3>
              <span className="stat-icon">💰</span>
            </div>
            <div className="stat-value">{formatCurrency(portfolio.summary.totalValue)}</div>
          </div>
          <div className="card stat-card">
            <div className="stat-header">
              <h3>Total P&L</h3>
              <span className="stat-icon">📈</span>
            </div>
            <div className={`stat-value ${portfolio.summary.totalProfitLoss >= 0 ? 'text-success' : 'text-danger'}`}>
              {formatCurrency(portfolio.summary.totalProfitLoss)}
            </div>
            <div className={`stat-subtitle ${portfolio.summary.totalProfitLossPercent >= 0 ? 'text-success' : 'text-danger'}`}>
              {formatPercentage(portfolio.summary.totalProfitLossPercent)}
            </div>
          </div>
          <div className="card stat-card">
            <div className="stat-header">
              <h3>Cash Balance</h3>
              <span className="stat-icon">💵</span>
            </div>
            <div className="stat-value">{formatCurrency(portfolio.portfolio.find(item => item.ticker === 'CASH')?.currentValue || 0)}</div>
          </div>
        </div>
      )}
      {/* Main Section: Pie Chart + Holdings */}
      <div className="dashboard-main-section">
        <div className="card asset-allocation-card">
          <div className="card-header">
            <h2>Asset Allocation</h2>
          </div>
          {portfolio && <AssetAllocationChart portfolio={{
            holdings: portfolio.portfolio.filter(item => item.ticker !== 'CASH'),
            cashBalance: portfolio.portfolio.find(item => item.ticker === 'CASH')?.currentValue || 0
          }} />}
        </div>
        <div className="card holdings-card">
          <div className="card-header">
            <h2>Holdings</h2>
          </div>
          {portfolio && (
            <table className="holdings-table">
              <thead>
                <tr>
                  <th>Asset</th>
                  <th>Quantity</th>
                  <th>Current Price</th>
                  <th>P&amp;L %</th>
                </tr>
              </thead>
              <tbody>
                {portfolio.portfolio.filter(item => item.ticker !== 'CASH').map((holding) => (
                  <tr key={holding.ticker}>
                    <td>{holding.ticker}</td>
                    <td>{parseFloat(holding.quantity)}</td>
                    <td>{formatCurrency(holding.currentPrice)}</td>
                    <td className={holding.profitLossPercent >= 0 ? 'text-success' : 'text-danger'}>
                      {formatPercentage(holding.profitLossPercent)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard; 