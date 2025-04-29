const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const settingsSchema = new Schema(
  {
    driverSuspensionTime: {
      type: Number,
    },
    rescueOrderTimeout: {
      type: Number,
    },
    rescueServiceDownPayment: {
      type: Number,
    },
    bookingDownPayment: {
      type: Number,
    },
    rescuePricingPerKm: {
      type: Number,
    },
    rescueFareSystem: {
      type: String,
      enum: ["ratio", "fixed amount"],
    },
    fixawiRescueFare: {
      type: Number,
    },
    CancelBookingHours: {
      type: Number,
    },
    chatQueue: {
      type: Number,
    },
    chatWelcomingMsg: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("setting", settingsSchema);
