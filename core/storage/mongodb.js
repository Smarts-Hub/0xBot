import mongoose from "mongoose";
import config from '../../config/config.json' with { type: 'json' };
import logger from "../logger.js";

export async function connectMongoose() {
    if(config.storage?.enabled != true) return;
    logger.info("Connecting to MongoDB...");
    await mongoose.connect(config.storage?.mongodb, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    }).then(() => {
        logger.success("Connected to MongoDB");
    }).catch((error) => {
        logger.error("Error connecting to MongoDB:", error);
    });
}