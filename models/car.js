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
    models: [
      {
        modelName: { type: String },
        modelIcon: { type: String },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("car", carSchema);
