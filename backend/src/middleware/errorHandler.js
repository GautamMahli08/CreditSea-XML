import { logger } from '../config/logger.js';

export function notFound (req, res, next) {
  res.status(404).json({ error: 'Not Found' });
}

export function errorHandler (err, req, res, next) {
  const status = err.status || 500;
  const body = {
    error: err.publicMessage || 'Internal Server Error'
  };
  if (status >= 500) logger.error({ err }, 'Unhandled error');
  if (status < 500) logger.warn({ err }, 'Handled error');
  res.status(status).json(body);
}
