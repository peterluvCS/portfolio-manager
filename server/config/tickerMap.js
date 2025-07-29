const tickerMap = {
  'AAPL':      { asset_type: 'stock',    realTicker: 'AAPL' },
  'MSFT':      { asset_type: 'stock',    realTicker: 'MSFT' },
  'NVDA':      { asset_type: 'stock',    realTicker: 'NVDA'},
  'AMZN':      { asset_type: 'stock',    realTicker: 'AMZN'},
  'WFC':       { asset_type: 'stock',    realTicker: 'WFC'},
  'USD/CNY':   { asset_type: 'currency', realTicker: 'USDCNY=X' },
  'USD/EUR':   { asset_type: 'currency', realTicker: 'USDEUR=X' },
  'USD/JPY':   { asset_type: 'currency', realTicker: 'USDJPY=X' }
};

export default tickerMap;
