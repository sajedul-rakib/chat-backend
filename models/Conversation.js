const mongoose = require("mongoose");

const ConversationSchema = new mongoose.Schema(
  {
    owner: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    participant: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    },
    lastMessage: { type: String, default: null },
    lastUpdate: { type: Date, default: Date.now() },
  },
  { timestamps: true }
);

const Conversation = mongoose.model("Conversation", ConversationSchema);

module.exports = Conversation;
