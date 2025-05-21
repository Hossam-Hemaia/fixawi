const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const checkSchema = new Schema(
  {
    serviceCenterId: {
      type: Schema.Types.ObjectId,
      ref: "service_center",
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    clientName: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    carBrand: {
      type: String,
    },
    carModel: {
      type: String,
    },
    date: {
      type: Date,
      default: new Date(),
    },
    checkDetails: [
      {
        service: { type: String },
        quantity: { type: Number },
        price: { type: Number },
        amount: { type: Number },
        clientApproved: { type: Boolean, default: false },
      },
    ],
    total: {
      type: Number,
    },
    reportStatus: {
      type: String,
      enum: ["pending confirmation", "confirmed", "invoiced", "declined"],
      default: "pending confirmation",
    },
    isBooking: {
      type: Boolean,
      default: false,
    },
    bookingCalendarId: {
      type: Schema.Types.ObjectId,
    },
    bookingTime: {
      type: String,
    },
    slotId: {
      type: Schema.Types.ObjectId,
    },
    invoiceId: {
      type: Schema.Types.ObjectId,
      ref: "invoice",
    },
    promotionId: {
      type: Schema.Types.ObjectId,
      ref: "promotion",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("check", checkSchema);
