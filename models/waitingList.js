const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const waitingSchema = new Schema(
  {
    username: {
      type: String,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    chatId: {
      type: Schema.Types.ObjectId,
      ref: "chat",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("waiting", waitingSchema);
