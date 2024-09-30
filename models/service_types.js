const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const serviceTypeSchema = new Schema(
  {
    categoryTitle: {
      type: String,
    },
    categoryDescription: {
      type: String,
    },
    isAvailable: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("service_type", serviceTypeSchema);
