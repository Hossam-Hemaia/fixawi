const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const queueSchema = new Schema(
  {
    callAgentId: {
      type: Schema.Types.ObjectId,
      ref: "admin",
    },
    username: {
      type: String,
    },
    maxQueue: {
      type: Number,
    },
    currentChats: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("queue", queueSchema);
