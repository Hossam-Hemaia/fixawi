const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ratingSchema = new Schema(
  {
    serviceCenterId: {
      type: Schema.Types.ObjectId,
      ref: "service_center",
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

module.exports = mongoose.model("rating", ratingSchema);
