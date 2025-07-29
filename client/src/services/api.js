import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 价格API
export const priceAPI = {
  getBatchPrices: () => api.get('/price/batch'),
  updateAllPrices: () => api.post('/price/update-all'),
};

// 交易API
export const tradeAPI = {
  buy: (data) => api.post('/trade/buy', data),
  sell: (data) => api.post('/trade/sell', data),
  getHistory: () => api.get('/trade/history'),
};

// 投资组合API
export const portfolioAPI = {
  getPortfolio: () => api.get('/portfolio'),
  charge: (amount) => api.post('/portfolio/charge', { amount }),
  withdraw: (amount) => api.post('/portfolio/withdraw', { amount }),
};

export default api; 