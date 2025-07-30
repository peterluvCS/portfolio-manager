import React from 'react';
import { Pie } from 'react-chartjs-2';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend
} from 'chart.js';

ChartJS.register(ArcElement, Tooltip, Legend);

const AssetAllocationChart = ({ portfolio }) => {
  if (!portfolio) return null;

  const { holdings, cashBalance } = portfolio;

  // 按资产类型分组计算
  const stockValue = holdings
    .filter(h => h.assetType === 'stock')
    .reduce((sum, h) => sum + h.currentValue, 0);
    
  const currencyValue = holdings
    .filter(h => h.assetType === 'currency')
    .reduce((sum, h) => sum + h.currentValue, 0);

  const chartData = {
    labels: ['Stocks', 'Currency', 'Cash'],
    datasets: [{
      data: [stockValue, currencyValue, cashBalance],
      backgroundColor: [
        '#4CAF50', // 绿色 - 股票
        '#2196F3', // 蓝色 - 外汇
        '#FF9800'  // 橙色 - 现金
      ],
      borderColor: [
        '#388E3C',
        '#1976D2', 
        '#F57C00'
      ],
      borderWidth: 2,
      hoverBackgroundColor: [
        '#66BB6A',
        '#42A5F5',
        '#FFB74D'
      ]
    }]
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom',
        labels: {
          color: '#ffffff',
          font: {
            size: 12
          },
          usePointStyle: true,
          padding: 20
        }
      },
      tooltip: {
        backgroundColor: 'rgba(0, 0, 0, 0.8)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        callbacks: {
          label: function(context) {
            const label = context.label || '';
            const value = context.parsed;
            const total = context.dataset.data.reduce((a, b) => a + b, 0);
            const percentage = ((value / total) * 100).toFixed(1);
            return `${label}: $${value.toLocaleString()} (${percentage}%)`;
          }
        }
      }
    }
  };

  return (
    <div className="asset-allocation-chart">
      <div className="chart-container">
        <Pie data={chartData} options={options} />
      </div>
      <div className="chart-summary">
        <div className="summary-item">
          <span className="summary-label">Total Assets:</span>
          <span className="summary-value">
            ${(stockValue + currencyValue + cashBalance).toLocaleString()}
          </span>
        </div>
      </div>
    </div>
  );
};

export default AssetAllocationChart; 