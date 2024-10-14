const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const carSchema = new Schema(
  {
    brand: {
      type: String,
    },
    brandIcon: {
      type: String,
    },
    models: [],
  },
  { timestamps: true }
);

module.exports = mongoose.model("car", carSchema);
