const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const walletSchema = new Schema(
  {
    driverId: { type: Schema.Types.ObjectId, ref: "driver" },
    serviceCenterId: { type: Schema.Types.ObjectId, ref: "service_center" },
    cashOrders: { type: Number, default: 0 },
    cardOrders: { type: Number, default: 0 },
    walletOrders: { type: Number, default: 0 },
    deductions: { type: Number, default: 0 },
    totalBalance: { type: Number, default: 0 },
    movementsIds: [{ type: Schema.Types.ObjectId, ref: "movement" }],
  },
  { timestamps: true, strictPopulate: false }
);

walletSchema.methods.addToBalance = function (balanceData) {
  try {
    console.log(balanceData);
    if (balanceData.paymentMethod === "cash") {
      this.cashOrders += balanceData.movementAmount;
    } else if (balanceData.paymentMethod === "card") {
      this.cardOrders += balanceData.movementAmount;
    } else if (balanceData.paymentMethod === "wallet") {
      this.walletOrders += balanceData.movementAmount;
    }
    this.totalBalance = this.cashOrders - this.deductions;
    this.movementsIds.push(balanceData.movementId);
    this.save();
  } catch (err) {
    throw err;
  }
};

walletSchema.methods.deductFromBalance = function (balanceData) {
  try {
    this.deductions += balanceData.movementAmount;
    this.totalBalance = this.cashOrders - this.deductions;
    this.movementsIds.push(balanceData.movementId);
    this.save();
  } catch (err) {
    throw err;
  }
};

module.exports = mongoose.model("wallet", walletSchema);
