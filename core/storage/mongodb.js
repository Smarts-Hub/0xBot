import mongoose from "mongoose";
import config from '../../config/config.json' with { type: 'json' };

export async function connectMongoose() {
    if(config.storage?.enabled !== true) return;

    await mongoose.connect(config.storage?.mongodb, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    });
}