const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const driverSchema = new Schema(
  {
    driverName: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    licenseNumber: {
      type: String,
    },
    companyName: {
      type: String,
    },
    truckNumber: {
      type: String,
    },
    driverLogId: {
      type: Schema.Types.ObjectId,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    username: {
      type: String,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      default: "driver",
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    ratings: {
      type: Number,
      default: 0,
    },
    reviewers: {
      type: Number,
      default: 0,
    },
    ratingId: {
      type: Schema.Types.ObjectId,
      ref: "rating",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("driver", driverSchema);
