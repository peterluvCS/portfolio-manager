import pool from '../../config/db.js';
import yahooFinance from 'yahoo-finance2';
import tickerMap from '../../config/tickerMap.js';
import cron from 'node-cron';

class Price {
    static async getLatestPrices() {
        const [rows] = await pool.execute(`
            SELECT ticker, price, datetime , asset_type
            FROM stock_currency sc1
            WHERE datetime = (
                SELECT MAX(datetime) 
                FROM stock_currency sc2 
                WHERE sc2.ticker = sc1.ticker
            )
            ORDER BY ticker
        `);
        return rows;
    }

    static async fetchAndInsertRealTimePrices () {
      const db = await pool.getConnection();
      const results = [];
    
      try {
        for (const [ticker, info] of Object.entries(tickerMap)) {
          try {
            const data = info.asset_type === 'stock'
              ? await yahooFinance.quoteSummary(info.realTicker, { modules: ['price'] })
              : await yahooFinance.quote(info.realTicker);
    
            const price = data?.price?.regularMarketPrice ?? data?.regularMarketPrice;
            const name = data?.price?.shortName ?? ticker;
            const rawTime = data?.price?.regularMarketTime ?? data?.regularMarketTime;
    
            const datetime = new Date(
              typeof rawTime === 'number' ? rawTime * 1000 : rawTime ?? Date.now()
            );
            const formattedTime = datetime.toISOString().slice(0, 19).replace('T', ' ');
    
            await db.execute(`
              INSERT IGNORE INTO stock_currency (ticker, name, price, datetime, asset_type)
              VALUES (?, ?, ?, ?, ?)
            `, [ticker, name, price, formattedTime, info.asset_type]);
    
            results.push({ ticker, status: 'success', time: formattedTime });
          } catch (err) {
            results.push({ ticker, status: 'error', message: err.message });
          }
        }
      } finally {
        db.release();
      }
    
      return results;
    };
    
    static async fetchAndInsertHistoricalPrices(date) {
      const db = await pool.getConnection();
      const results = [];

      const period1 = new Date(date);
      const period2 = new Date(period1.getTime() +  24 * 60 * 60 * 1000); 
    
      try {
        for (const [ticker, info] of Object.entries(tickerMap)) {
          let insertCount = 0;
          try {
            const result = await yahooFinance.chart(info.realTicker, {
              period1,
              period2,
              interval: '60m'
            });
    
            const quotes = result.quotes;
            if (!quotes || quotes.length === 0) {
              throw new Error('No historical data');
            }
    
            for (const q of quotes) {
              const close = q.close;
              if (typeof close !== 'number' || isNaN(close)) {
                continue;
              }
              const dataTime = new Date(q.date);
              const formattedTime = dataTime.toISOString().slice(0, 19).replace('T', ' ');
    
              await db.execute(`
                INSERT IGNORE INTO stock_currency (ticker, name, price, datetime, asset_type)
                VALUES (?, ?, ?, ?, ?)
              `, [ticker, ticker, close, formattedTime, info.asset_type]);
              insertCount++;
            }
    
            results.push({ ticker, status: 'success', count: insertCount});
          } catch (err) {
            results.push({ ticker, status: 'error', message: err.message });
          }
        }
      } finally {
        db.release();
      }
    
      return results;
         }
     
     // 启动定时任务，每5分钟更新一次价格数据
     static startPriceUpdateCron() {
         console.log('启动价格更新定时任务...');
         
         // 每5分钟执行一次价格更新
         cron.schedule('*/5 * * * *', async () => {
             try {
                 console.log(`[${new Date().toISOString()}] 开始执行定时价格更新...`);
                 const results = await Price.fetchAndInsertRealTimePrices();
                 
                 // 统计成功和失败的数量
                 const successCount = results.filter(r => r.status === 'success').length;
                 const errorCount = results.filter(r => r.status === 'error').length;
                 
                 console.log(`[${new Date().toISOString()}] 价格更新完成 - 成功: ${successCount}, 失败: ${errorCount}`);
                 
                 // 如果有错误，打印详细信息
                 if (errorCount > 0) {
                     const errors = results.filter(r => r.status === 'error');
                     console.log('更新失败的资产:', errors.map(e => `${e.ticker}: ${e.message}`));
                 }
             } catch (error) {
                 console.error(`[${new Date().toISOString()}] 定时价格更新失败:`, error.message);
             }
         }, {
             scheduled: true,
             timezone: "Asia/Shanghai" // 使用中国时区
         });
         
         console.log('价格更新定时任务已启动，每5分钟执行一次');
     }
     
     // 停止定时任务
     static stopPriceUpdateCron() {
         console.log('停止价格更新定时任务...');
         // 这里可以添加停止逻辑，如果需要的话
     }
 }

export default Price;