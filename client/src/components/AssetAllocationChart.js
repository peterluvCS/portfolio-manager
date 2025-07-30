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
        '#5AD8A6', // Stocks
        '#4F8CFF', // Currency
        '#FFD166'  // Cash
      ],
      borderColor: [
        '#3CA97B', // Stocks border
        '#3566B8', // Currency border
        '#C9A13B'  // Cash border
      ],
      borderWidth: 2,
      hoverBackgroundColor: [
        '#7BE3BC', // Stocks hover
        '#7CAFFF', // Currency hover
        '#FFE29A'  // Cash hover
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