import React, { useState, useEffect } from 'react';
import { tradeAPI } from '../services/api';
import './History.css';

const History = () => {
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    fetchTransactionHistory();
  }, []);

  const fetchTransactionHistory = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await tradeAPI.getHistory();
      
      // 转换后端数据结构为前端期望的格式
      const transformedTransactions = response.data.map(transaction => ({
        id: transaction.id,
        ticker: transaction.ticker,
        type: transaction.type,
        quantity: parseFloat(transaction.quantity),
        price: parseFloat(transaction.price),
        total: parseFloat(transaction.quantity) * parseFloat(transaction.price),
        date: transaction.datetime,
        status: 'COMPLETED', // 后端没有状态字段，默认为已完成
        assetType: transaction.asset_type
      }));
      
      setTransactions(transformedTransactions);
    } catch (err) {
      console.error('Error fetching transaction history:', err);
      setError('Failed to load transaction history. Please check if the backend server is running.');
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

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="history">
      <div className="history-header">
        <h1>Transaction History</h1>
        <p className="text-secondary">View all your trading activities</p>
      </div>

      {/* 加载状态 */}
      {loading && (
        <div className="card">
          <h3>Loading Transaction History...</h3>
          <p>Please wait while we fetch your transaction data.</p>
        </div>
      )}

      {/* 错误状态 */}
      {error && (
        <div className="card">
          <h3>Error Loading Data</h3>
          <p>{error}</p>
          <button 
            className="button button-primary"
            onClick={fetchTransactionHistory}
          >
            Retry
          </button>
        </div>
      )}

      {/* 交易历史数据 */}
      {transactions.length > 0 && !loading && !error && (
        <div className="card">
          <div className="card-header">
            <h2>Recent Transactions</h2>
          </div>
          <div className="transactions-table">
            <table>
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Asset</th>
                  <th>Type</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Total</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((transaction) => (
                  <tr key={transaction.id}>
                    <td>{formatDate(transaction.date)}</td>
                    <td>
                      <div className="asset-info">
                        <span className="asset-ticker">{transaction.ticker}</span>
                      </div>
                    </td>
                    <td>
                      <span className={`trade-type ${transaction.type.toLowerCase()}`}>
                        {transaction.type}
                      </span>
                    </td>
                    <td>{transaction.quantity}</td>
                    <td>{formatCurrency(transaction.price)}</td>
                    <td>{formatCurrency(transaction.total)}</td>
                    <td>
                      <span className={`status ${transaction.status.toLowerCase()}`}>
                        {transaction.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* 空状态 */}
      {transactions.length === 0 && !loading && !error && (
        <div className="card">
          <div className="empty-state">
            <h3>No Transactions Yet</h3>
            <p>You haven't made any trades yet. Start trading to see your transaction history here.</p>
          </div>
        </div>
      )}

      {/* 测试内容（当没有数据时显示） */}
      {!transactions.length && !loading && !error && (
        <div className="card">
          <h2>History Test</h2>
          <p>This is the History page test content.</p>
          <p>If you can see this, the routing is working correctly.</p>
        </div>
      )}
    </div>
  );
};

export default History; 