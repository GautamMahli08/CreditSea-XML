import dotenv from 'dotenv';
dotenv.config();

export const env = {
  port: process.env.PORT || 4000,
  mongoUri: process.env.MONGO_URI,
  clientOrigin: process.env.CLIENT_ORIGIN || '*',
  maxUploadMB: Number(process.env.MAX_UPLOAD_MB || 5),
  nodeEnv: process.env.NODE_ENV || 'development'
};
