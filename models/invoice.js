const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const invoiceSchema = new Schema(
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
        price: { type: Number },
      },
    ],
    subTotal: {
      type: Number,
    },
    fixawiFee: {
      type: Number,
    },
    SalesTaxAmount: {
      type: Number,
    },
    invoiceTotal: {
      type: Number,
    },
  },
  { timestamps: true, strictPopulate: false }
);

module.exports = mongoose.model("invoice", invoiceSchema);
