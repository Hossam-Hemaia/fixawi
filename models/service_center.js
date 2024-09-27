const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const serviceCenterSchema = new Schema(
  {
    serviceCenterTitle: {
      type: String,
      required: true,
    },
    serviceCenterTitleEn: {
      type: String,
    },
    address: {
      type: String,
    },
    location: {
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
    image: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: false,
    },
    isApproved: {
      type: Boolean,
      default: false,
    },
    username: {
      type: String,
    },
    password: {
      type: String,
    },
    priceListId: {
      type: Schema.Types.ObjectId,
      ref: "price_list",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("service_center", serviceCenterSchema);
