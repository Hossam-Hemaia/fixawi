const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const insuranceSchema = new Schema(
  {
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    requestId: {
      type: String,
    },
    carBrand: {
      type: String,
    },
    carModel: {
      type: String,
    },
    carModelYear: {
      type: Number,
    },
    estimatedPrice: {
      type: Number,
    },
    requestStatus: {
      type: String,
      enum: ["pending", "processing", "done"],
    },
    approvedOffer: {
      type: Schema.Types.ObjectId,
      ref: "insuranceOffer",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("insuranceRequest", insuranceSchema);
