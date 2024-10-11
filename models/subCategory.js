const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const subCategorySchema = new Schema({
  subCategoryName: {
    type: String,
  },
  subCategoryNameEn: {
    type: String,
  },
  subCategoryImage: {
    type: String,
  },
  mainCategoryId: {
    type: Schema.Types.ObjectId,
    ref: "category",
  },
});

module.exports = mongoose.model("subCategory", subCategorySchema);
