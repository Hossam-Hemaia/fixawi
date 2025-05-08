const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const visitSchema = new Schema(
  {
    visitDate: {
      type: Date,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
    },
    serviceCenterId: {
      type: Schema.Types.ObjectId,
      ref: "service_center",
    },
    checkReportId: {
      type: Schema.Types.ObjectId,
      ref: "check",
    },
    visitStatus: {
      type: String,
      default: "pending",
    },
  },
  { timestamps: true, strictPopulate: false }
);

module.exports = mongoose.model("visit", visitSchema);
