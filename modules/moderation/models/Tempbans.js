import mongoose from "mongoose";

const BansSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true,
    },
    reason: {
        type: String,
        default: "No reason provided"
    },
    moderatorId: {
        type: String,
        required: true
    },
    timestamp: {
        type: Date,
        default: Date.now
    },
    duration: {
        type: Number, // (0-7)
        default: 1
    }
});

export default mongoose.model("Bans", BansSchema);
