import React, { useState, useEffect } from 'react';
import { portfolioAPI } from '../services/api';
import AssetAllocationChart from '../components/AssetAllocationChart';
import './Portfolio.css';

const Portfolio = () => {
  const [portfolio, setPortfolio] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [depositAmount, setDepositAmount] = useState('');
  const [withdrawAmount, setWithdrawAmount] = useState('');
  const [showDepositModal, setShowDepositModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  useEffect(() => {
    console.log('Portfolio component mounted');
    fetchPortfolio();
  }, []);

  const fetchPortfolio = async () => {
    console.log('Fetching portfolio data...');
    try {
      setLoading(true);
      setError(null);
      const response = await portfolioAPI.getPortfolio();
      console.log('Portfolio API response:', response.data);
      
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
          assetType: holding.assetType, // 暂时默认为stock
          quantity: parseFloat(holding.quantity),
          avgPrice: parseFloat(holding.avgPrice),
          currentPrice: parseFloat(holding.currentPrice),
          currentValue: holding.currentValue,
          pnl: holding.profitLoss,
          pnlPercentage: holding.profitLossPercent
        }))
      };
      
      console.log('Transformed portfolio data:', transformedData);
      setPortfolio(transformedData);
    } catch (err) {
      console.error('Error fetching portfolio:', err);
      setError('Failed to load portfolio data. Please check if the backend server is running.');
    } finally {
      setLoading(false);
    }
  };

  const handleDeposit = async () => {
    if (!depositAmount || depositAmount <= 0) return;
    
    try {
      await portfolioAPI.charge(parseFloat(depositAmount));
      setDepositAmount('');
      setShowDepositModal(false);
      fetchPortfolio();
    } catch (err) {
      console.error('Error depositing:', err);
      alert('Failed to deposit. Please try again.');
    }
  };

  const handleWithdraw = async () => {
    if (!withdrawAmount || withdrawAmount <= 0) return;
    
    try {
      await portfolioAPI.withdraw(parseFloat(withdrawAmount));
      setWithdrawAmount('');
      setShowWithdrawModal(false);
      fetchPortfolio();
    } catch (err) {
      console.error('Error withdrawing:', err);
      alert('Failed to withdraw. Please try again.');
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

  console.log('Portfolio component rendering, loading:', loading, 'error:', error, 'portfolio:', portfolio);

  return (
    <div className="portfolio">
      <div className="portfolio-header">
        <div>
          <h1>Portfolio</h1>
          <p className="text-secondary">Detailed portfolio analysis</p>
        </div>
        <div className="portfolio-actions">
          <button 
            className="button button-success"
            onClick={() => setShowDepositModal(true)}
          >
            💰 Deposit
          </button>
          <button 
            className="button button-secondary"
            onClick={() => setShowWithdrawModal(true)}
          >
            💸 Withdraw
          </button>
        </div>
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
          {/* 投资组合统计 */}
          <div className="portfolio-stats grid grid-3">
            <div className="card stat-card">
              <div className="stat-header">
                <h3>Total Value</h3>
                <span className="stat-icon">💰</span>
              </div>
              <div className="stat-value">{formatCurrency(portfolio.totalValue)}</div>
            </div>

            <div className="card stat-card">
              <div className="stat-header">
                <h3>Total P&L</h3>
                <span className="stat-icon">📈</span>
              </div>
              <div className={`stat-value ${portfolio.totalPnL >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatCurrency(portfolio.totalPnL)}
              </div>
              <div className={`stat-subtitle ${portfolio.totalPnLPercentage >= 0 ? 'text-success' : 'text-danger'}`}>
                {formatPercentage(portfolio.totalPnLPercentage)}
              </div>
            </div>

            <div className="card stat-card">
              <div className="stat-header">
                <h3>Cash Balance</h3>
                <span className="stat-icon">💵</span>
              </div>
              <div className="stat-value">{formatCurrency(portfolio.cashBalance)}</div>
            </div>
          </div>

          {/* 图表区域 */}
          <div className="charts-section grid grid-2">
            <div className="card">
              <div className="card-header">
                <h2>Asset Allocation</h2>
              </div>
              <AssetAllocationChart portfolio={portfolio} />
            </div>
            
            <div className="card">
              <div className="card-header">
                <h2>Holdings Details</h2>
              </div>
              <div className="holdings-details">
                {portfolio.holdings.map((holding) => (
                  <div key={holding.ticker} className="holding-item">
                    <div className="holding-header">
                      <div className="holding-info">
                        <div className="holding-ticker">{holding.ticker}</div>
                        <div className="holding-name">{holding.name}</div>
                      </div>
                      <div className="holding-type">{holding.assetType}</div>
                    </div>
                    
                    <div className="holding-details grid grid-4">
                      <div className="detail-item">
                        <label>Quantity</label>
                        <span>{holding.quantity}</span>
                      </div>
                      <div className="detail-item">
                        <label>Avg Price</label>
                        <span>{formatCurrency(holding.avgPrice)}</span>
                      </div>
                      <div className="detail-item">
                        <label>Current Price</label>
                        <span>{formatCurrency(holding.currentPrice)}</span>
                      </div>
                      <div className="detail-item">
                        <label>Current Value</label>
                        <span>{formatCurrency(holding.currentValue)}</span>
                      </div>
                    </div>
                    
                    <div className="holding-pnl">
                      <div className="pnl-item">
                        <label>P&L</label>
                        <span className={holding.pnl >= 0 ? 'text-success' : 'text-danger'}>
                          {formatCurrency(holding.pnl)}
                        </span>
                      </div>
                      <div className="pnl-item">
                        <label>P&L %</label>
                        <span className={holding.pnlPercentage >= 0 ? 'text-success' : 'text-danger'}>
                          {formatPercentage(holding.pnlPercentage)}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      )}

      {/* 测试内容（当没有数据时显示） */}
      {!portfolio && !loading && !error && (
        <div className="card">
          <h2>Portfolio Test</h2>
          <p>This is the Portfolio page test content.</p>
          <p>If you can see this, the routing is working correctly.</p>
        </div>
      )}

      {/* 存款模态框 */}
      {showDepositModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Deposit Cash</h3>
              <button 
                className="modal-close"
                onClick={() => setShowDepositModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <label>Amount (USD)</label>
              <input
                type="number"
                value={depositAmount}
                onChange={(e) => setDepositAmount(e.target.value)}
                placeholder="Enter amount"
                min="0"
                step="0.01"
              />
            </div>
            <div className="modal-footer">
              <button 
                className="button button-secondary"
                onClick={() => setShowDepositModal(false)}
              >
                Cancel
              </button>
              <button 
                className="button button-success"
                onClick={handleDeposit}
              >
                Deposit
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 取款模态框 */}
      {showWithdrawModal && (
        <div className="modal-overlay">
          <div className="modal">
            <div className="modal-header">
              <h3>Withdraw Cash</h3>
              <button 
                className="modal-close"
                onClick={() => setShowWithdrawModal(false)}
              >
                ✕
              </button>
            </div>
            <div className="modal-body">
              <label>Amount (USD)</label>
              <input
                type="number"
                value={withdrawAmount}
                onChange={(e) => setWithdrawAmount(e.target.value)}
                placeholder="Enter amount"
                min="0"
                step="0.01"
              />
            </div>
            <div className="modal-footer">
              <button 
                className="button button-secondary"
                onClick={() => setShowWithdrawModal(false)}
              >
                Cancel
              </button>
              <button 
                className="button button-danger"
                onClick={handleWithdraw}
              >
                Withdraw
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Portfolio; 