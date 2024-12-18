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
      },
    ],
    total: {
      type: Number,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("check", checkSchema);
