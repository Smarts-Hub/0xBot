import mongoose from "mongoose";

const WarnsSchema = new mongoose.Schema({
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
    }
});

export default mongoose.model("Warns", WarnsSchema);