const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const chatSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    username: {
      type: String,
    },
    agentId: {
      type: Schema.Types.ObjectId,
      ref: "admin",
    },
    agentUsername: {
      type: String,
    },
    queueEntryTime: {
      type: Date,
    },
    chatStartTime: {
      type: Date,
    },
    firstResponseTime: {
      type: Date,
    },
    messages: [
      {
        sender: { type: String },
        timestamp: { type: Date },
        message: { type: String },
      },
    ],
    resolutionTime: {
      type: Date,
    },
    chatEndTime: {
      type: Date,
    },
    chatDuration: {
      type: Number,
    },
    queueWaitTime: {
      type: Number,
    },
    labels: {
      resolutionStatus: { type: String },
      issueCategory: { type: String },
      satisfactionScore: { type: String },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("chat", chatSchema);
