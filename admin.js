const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    username: {
      type: String,
      required: true,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      default: "admin",
    },
    serviceCenterId: {
      type: Schema.Types.ObjectId,
      ref: "service_center",
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, strictPopulate: false }
);

module.exports = mongoose.model("admin", userSchema);
