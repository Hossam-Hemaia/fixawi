const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const balanceSchema = new Schema({
  serviceCenterId: {
    type: Schema.Types.ObjectId,
    ref: "service_center",
  },
  fixawiBalance: {
    type: Number,
  },
  serviceCenterBalance: {
    type: Number,
  },
  totalFixawiDue: {
    type: Number,
  },
  totalServiceCenterDue: {
    type: Number,
  },
  netBalance: {
    type: Number,
    default: 0,
  },
  invoices: [
    {
      invoiceId: { type: Schema.Types.ObjectId, ref: "invoice" },
      paymentMethod: { type: String },
      invoiceDate: { type: Date },
      invoiceTotal: { type: Number },
      fixawiDue: { type: Number },
      serviceCenterDue: { type: Number },
    },
  ],
});
