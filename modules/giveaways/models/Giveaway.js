// models/Giveaway.js
import mongoose from 'mongoose';

const giveawaySchema = new mongoose.Schema({
  messageId: {
    type: String,
    required: true,
    unique: true
  },
  channelId: {
    type: String,
    required: true
  },
  guildId: {
    type: String,
    required: true
  },
  prize: {
    type: String,
    required: true
  },
  description: {
    type: String,
    default: "No description provided."
  },
  winnersCount: {
    type: Number,
    required: true,
    min: 1
  },
  duration: {
    type: String,
    required: true
  },
  endTime: {
    type: Date,
    required: true
  },
  hostId: {
    type: String,
    required: true
  },
  participants: [{
    type: String // User IDs
  }],
  winners: [{
    type: String // User IDs of winners
  }],
  isActive: {
    type: Boolean,
    default: true
  },
  isEnded: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

// Index for efficient queries
giveawaySchema.index({ endTime: 1, isActive: 1 });
giveawaySchema.index({ messageId: 1 });

export default mongoose.model('Giveaway', giveawaySchema);