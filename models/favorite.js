const mongoose = require("mongoose");

const Schema = mongoose.Schema;

const favoritSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "user",
      required: true,
    },
    serviceCenters: [
      {
        type: Schema.Types.ObjectId,
        ref: "service_center",
      },
    ],
  },
  { timestamps: true, strictPopulate: false }
);

module.exports = mongoose.model("favorite", favoritSchema);
