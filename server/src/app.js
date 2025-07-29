import express from 'express';
import bodyParser from 'body-parser';
import priceRouter from './routes/priceRouter.js'; // Adjust the import path as necessary
import cors from 'cors';

const app = express();
const PORT = process.env.PORT || 8081;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cors());

app.use('/api/price', priceRouter);


app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
