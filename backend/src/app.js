import express from 'express';
import helmet from 'helmet';
import cors from 'cors';
import morgan from 'morgan';
import { env } from './config/env.js';
import reportsRouter from './routes/reports.route.js';
import { notFound, errorHandler } from './middleware/errorHandler.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.clientOrigin, credentials: true }));
app.use(express.json({ limit: '1mb' }));
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));

app.get('/health', (req, res) => res.json({ ok: true }));
app.use('/api/reports', reportsRouter);

app.use(notFound);
app.use(errorHandler);

export default app;
