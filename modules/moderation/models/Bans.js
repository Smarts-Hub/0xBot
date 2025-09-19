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
    deleteMessageDays: {
        type: Number, // (0-7)
        default: 0
    }
});

export default mongoose.models.Bans || mongoose.model("Bans", BansSchema);
