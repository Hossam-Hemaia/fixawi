const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const movementSchema = new Schema(
  {
    orderId: { type: Schema.Types.ObjectId, ref: "order" },
    invoiceNumber: { type: String },
    reason: { type: String },
    movementDate: { type: Date },
    movementType: { type: String, enum: ["addition", "deduction"] },
    movementAmount: { type: Number },
    paymentMethod: { type: String, enum: ["cash", "card", "wallet"] },
    walletId: { type: Schema.Types.ObjectId, ref: "wallet" },
  },
  { timestamps: true, strictPopulate: false }
);

module.exports = mongoose.model("movement", movementSchema);
