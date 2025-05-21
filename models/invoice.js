const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const invoiceSchema = new Schema(
  {
    invoiceNumber: {
      type: Number,
    },
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
    invoiceDetails: [
      {
        service: { type: String },
        quantity: { type: Number },
        price: { type: Number },
        amount: { type: Number },
      },
    ],
    subTotal: {
      type: Number,
    },
    fixawiFare: {
      type: Number,
    },
    salesTaxAmount: {
      type: Number,
      default: 0.14,
    },
    invoiceTotal: {
      type: Number,
    },
    paymentStatus: {
      type: String,
      enum: ["pending payment", "paid", "canceled"],
      default: "pending payment",
    },
    paymentMethod: {
      type: String,
      enum: ["cash", "card", "wallet"],
    },
    promotionId: {
      type: Schema.Types.ObjectId,
      ref: "protmotion",
    },
  },
  { timestamps: true, strictPopulate: false }
);

module.exports = mongoose.model("invoice", invoiceSchema);
