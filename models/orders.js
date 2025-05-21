const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const orderSchema = new Schema(
  {
    orderNumber: {
      type: Number,
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
    downPyament: {
      type: Number,
      default: 0,
    },
    rescuePrice: {
      type: Number,
    },
    paymentStatus: {
      type: String,
    },
    paymentMethod: {
      type: String,
    },
    orderStatus: [{ state: { type: String }, date: { type: Date } }], //[pending, accepted, received, transporting, delivered or rejected, canceled]
    orderDate: {
      type: Date,
    },
    companyName: {
      type: String,
      default: "",
    },
    clientConsent: {
      type: Boolean,
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
    distancePerKm: {
      type: Number,
    },
  },
  { timestamps: true, strictPopulate: false }
);

module.exports = mongoose.model("order", orderSchema);
