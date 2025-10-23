import app from './app.js';
import { env } from './config/env.js';
import { connectMongo } from './db/mongoose.js';
import { logger } from './config/logger.js';

const { port, mongoUri } = env;

async function main () {
  await connectMongo(mongoUri);
  app.listen(port, () => logger.info(`API running on http://localhost:${port}`));
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
