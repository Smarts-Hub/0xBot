import mongoose from "mongoose";

const UserLevelSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    xp: {
        type: Number,
        default: 0
    },
    level: {
        type: Number,
        default: 1
    },
    lastUpdated: {
        type: Date,
        default: Date.now
    }
});

export default mongoose.model("UserLevel", UserLevelSchema);