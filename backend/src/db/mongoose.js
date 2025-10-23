import mongoose from "mongoose";
import { logger } from "../config/logger.js";

export async function connectMongo(uri) {
  mongoose.set("strictQuery", true);
  await mongoose.connect(uri, { autoIndex: true });
  logger.info("Mongo connected");
}

export async function disconnectMongo() {
  await mongoose.disconnect();
}
