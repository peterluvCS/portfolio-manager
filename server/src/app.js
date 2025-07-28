import express from 'express';
import bodyParser from 'body-parser';
import routes from './routes/index.js'; // 加 `.js`
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 8081;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use('/api', routes);

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
