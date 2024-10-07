const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    fullName: {
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
      default: "phone",
    },
    carNumber: {
      type: String,
    },
    carBrand: {
      type: String,
    },
    carModel: {
      type: String,
    },
    modelYear: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: false,
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
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("user", userSchema);
