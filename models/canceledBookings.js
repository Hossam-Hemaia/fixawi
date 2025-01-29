const mongoose = require("mongoose");

const canceledBookingSchema = new mongoose.Schema(
  {
    serviceCenterId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "service_center",
    },
    serviceName: {
      type: String,
    },
    date: {
      type: Date,
    },
    time: {
      type: Number,
    },
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "user",
    },
    clientName: {
      type: String,
    },
    phone: {
      type: String,
    },
    canceledBy: {
      type: String,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("canceled_booking", canceledBookingSchema);
