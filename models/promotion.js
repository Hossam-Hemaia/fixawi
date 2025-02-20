const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const promotionSchema = new Schema(
  {
    promotionTitle: {
      type: String,
    },
    promotionDetails: [{ title: { type: String }, discount: { type: Number } }],
    promotionConditions: [{ type: String }],
    expiryDate: {
      type: Date,
    },
    approved: {
      type: Boolean,
      default: false,
    },
    serviceCenterId: {
      type: Schema.Types.ObjectId,
      ref: "service_center",
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("promotion", promotionSchema);
