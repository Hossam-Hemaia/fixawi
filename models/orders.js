const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    orderNumber: {
      type: String,
    },
    fromPoint: {
      lat: { type: Number },
      lng: { type: Number },
    },
    toPoint: {
      lat: { type: Number },
      lng: { type: Number },
    },
    clientName: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    rescuePrice: {
      type: Number,
    },
    paymentStatus: {
      type: String,
    },
    orderStatus: [{ state: { type: String }, date: { type: Date } }], //[pending, accepted, received, transporting, delivered or rejected, canceled]
    orderDate: {
      type: Date,
      default: new Date(),
    },
    companyName: {
      type: String,
      default: "",
    },
    clientId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    driverId: {
      type: Schema.Types.ObjectId,
      ref: "driver",
    },
  },
  { timestamps: true, strictPopulate: false }
);

module.exports = mongoose.model("order", orderSchema);
