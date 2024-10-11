const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const categorySchema = new Schema(
  {
    categoryName: {
      type: String,
    },
    categoryNameEn: {
      type: String,
    },
    categoryImage: {
      type: String,
    },
    subCategories: [{ type: Schema.Types.ObjectId, ref: "subCategory" }],
  },
  { timestamps: true }
);

categorySchema.pre("find", function () {
  this.populate("subCategories");
});

categorySchema.pre("findOne", function () {
  this.populate("subCategories");
});

module.exports = mongoose.model("category", categorySchema);
