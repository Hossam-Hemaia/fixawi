const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const adsSchema = new Schema(
  {
    carousel: [
      {
        url: { type: String },
        clickable: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("ads", adsSchema);
