const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const bookingSchema = new Schema(
  {
    serviceCenterId: {
      type: Schema.Types.ObjectId,
      ref: "service_center",
    },
    services: [
      {
        serviceId: {
          type: Schema.Types.ObjectId,
          ref: "subCategory",
        },
        capacity: { type: Number },
        averageTime: { type: Number },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("bookingSetting", bookingSchema);
