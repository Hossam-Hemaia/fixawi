const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const offerSchema = new Schema(
  {
    offerTitle: {
      type: String,
      required: true,
    },
    discountType: {
      type: String,
      required: true,
    },
    discountAmount: {
      type: Number,
    },
    hasExpiry: {
      type: Boolean,
      default: false,
    },
    expiryDate: {
      type: Date,
    },
    hasUsageNumber: {
      type: Boolean,
      default: false,
    },
    usageNumber: {
      type: Number,
      default: 1,
    },
    expired: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

offerSchema.methods.applyCoupon = function () {
  try {
    this.usageNumber -= 1;
    this.expired = true;
    this.save();
    return this;
  } catch (err) {
    throw err;
  }
};

module.exports = mongoose.model("offer", offerSchema);
