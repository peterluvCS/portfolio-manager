const tickerMap = {
  'AAPL':      { asset_type: 'stock',    realTicker: 'AAPL' },
  'MSFT':      { asset_type: 'stock',    realTicker: 'MSFT' },
  'NVDA':      { asset_type: 'stock',    realTicker: 'NVDA'},
  'AMZN':      { asset_type: 'stock',    realTicker: 'AMZN'},
  'WFC':       { asset_type: 'stock',    realTicker: 'WFC'},
  'CNY/USD':   { asset_type: 'currency', realTicker: 'CNYUSD=X' },
  'EUR/USD':   { asset_type: 'currency', realTicker: 'EURUSD=X' },
  'JPY/USD':   { asset_type: 'currency', realTicker: 'JPYUSD=X' }
};

export default tickerMap;
