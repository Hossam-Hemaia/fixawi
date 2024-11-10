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
    area: {
      type: String,
    },
    location: {
      type: {
        type: String,
        enum: ["Point"], // 'location.type' must be 'Point'
        required: true,
        default: "Point",
      },
      coordinates: {
        type: [Number], // Array of numbers: [longitude, latitude]
        required: true,
      },
    },
    serviceCategoryIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "subCategory",
      },
    ],
    serviceTypes: [],
    visitType: {
      type: String,
    },
    averageRating: {
      type: Number,
      default: 0,
    },
    ratings: {
      type: Number,
      default: 0,
    },
    reviewers: {
      type: Number,
      default: 0,
    },
    openAt: {
      type: Number,
    },
    closeAt: {
      type: Number,
    },
    contacts: {
      type: String,
    },
    email: {
      type: String,
    },
    website: {
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
    ratingId: {
      type: Schema.Types.ObjectId,
      ref: "rating",
    },
    hasOffer: {
      type: Boolean,
      default: false,
    },
    offerId: {
      type: Schema.Types.ObjectId,
      ref: "offer",
    },
    fixawiFareType: {
      type: String,
      enum: ["ratio", "fixed amount", "subscription"],
    },
    fareValue: {
      type: Number,
    },
    closingDay: {
      type: String,
    },
  },
  { timestamps: true, autoIndex: false, strictPopulate: false }
);

serviceCenterSchema.index({ location: "2dsphere" }, { unique: true });

module.exports = mongoose.model("service_center", serviceCenterSchema);
