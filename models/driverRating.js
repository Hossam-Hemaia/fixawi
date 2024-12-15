const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ratingSchema = new Schema(
  {
    driverId: {
      type: Schema.Types.ObjectId,
      ref: "driver",
      required: true,
    },
    reviews: [
      {
        userId: { type: Schema.Types.ObjectId, ref: "user" },
        rating: { type: Number },
        review: { type: String },
      },
    ],
  },
  { timestamps: true }
);

module.exports = mongoose.model("driverRating", ratingSchema);
