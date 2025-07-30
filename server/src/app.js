import express from 'express';
import bodyParser from 'body-parser';
import cors from 'cors';
import tradeRoutes from './routes/trade.js';
import priceRouter from './routes/priceRouter.js'; // Adjust the import path as necessary
import portfolioRoutes from './routes/portfolio.js';
import swaggerUi from 'swagger-ui-express';
import YAML from 'yamljs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';
import Price from './models/price.js';

const app = express();
const PORT = process.env.PORT || 8081;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const swaggerDocument = YAML.load(join(__dirname, '../config/swagger.yml'));
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocument));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());
app.use('/api/price', priceRouter);
app.use('/api/portfolio', portfolioRoutes);
app.use('/api/trade', tradeRoutes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
  
  // 启动定时价格更新任务
  Price.startPriceUpdateCron();
});
