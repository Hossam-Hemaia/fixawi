const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const driverLogSchema = new Schema(
  {
    driverId: {
      type: Schema.Types.ObjectId,
      ref: "driver",
    },
    phoneNumber: {
      type: String,
    },
    driverName: {
      type: String,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number], // Array of numbers: [longitude, latitude]
        required: true,
      },
    },
    hasOrder: {
      type: Boolean,
      default: false,
    },
    driverOnline: {
      type: Boolean,
      default: false,
    },
    driverSuspended: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true, autoIndex: false, strictPopulate: false }
);

driverLogSchema.index({ location: "2dsphere" });

module.exports = mongoose.model("driverLog", driverLogSchema);
