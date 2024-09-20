const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const serviceCenterSchema = new Schema(
  {
    serviceCenterTitle: {
      type: String,
      required: true,
    },
    address: {
      type: String,
    },
    centerLocation: {
      lat: {
        type: String,
      },
      lng: {
        type: String,
      },
    },
    serviceType: {
      type: String,
    },
    averageRating: {
      type: Number,
    },
    openAt: {
      type: String,
    },
    closeAt: {
      type: String,
    },
    contacts: {
      type: String,
    },
    carBrands: [],
    isActive: {
      type: Boolean,
      default: true,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("service_center", serviceCenterSchema);
