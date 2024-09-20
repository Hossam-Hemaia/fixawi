const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    authMethod: {
      type: String,
      enum: ["Google", "Facebook", "email", "phone"],
    },
    carBrand: {
      type: String,
    },
    carModel: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    hasProfile: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
    },
    codeExpiry: {
      type: Date,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      default: "user",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", userSchema);
