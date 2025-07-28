import express from 'express';
import { example } from '../controllers/index.js'; // 注意加 `.js`

const router = express.Router();

router.get('/example', example);

export default router;
