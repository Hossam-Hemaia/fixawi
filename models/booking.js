const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const bookingSchema = new Schema(
  {
    serviceCenterId: {
      type: Schema.Types.ObjectId,
      ref: "service_center",
    },
    calendar: [
      {
        date: { type: Date },
        time: { type: String },
        clients: [
          {
            clientName: { type: String },
            phone: { type: String },
            carBrand: { type: String },
            carModel: { type: String },
          },
        ],
        slotIsFull: { type: Boolean, default: false },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("booking", bookingSchema);
