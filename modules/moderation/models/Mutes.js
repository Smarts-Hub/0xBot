import mongoose from "mongoose";

const MutesSchema = new mongoose.Schema({
    userId: {
        type: String,
        required: true,
        index: true,
    },
    reason: {
        type: String,
        default: "You got a warning!"
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
        type: Number, // In seconds. 0 = permanent
        default: 0
    }
});

export default mongoose.models.Mutes || mongoose.model("Mutes", MutesSchema);