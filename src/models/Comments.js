const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;
const CategorySchema = new Schema(
  {
    name: {
      type: String,
      default: null,
    },
    slug: {
      type: String,
      required: true,
    },
    text: {
      type: String,
    },
  },
  { timestamps: true }
);
const CatSchemApp = mongoose.model("comments", CategorySchema);
// User.createIndexes();
module.exports = CatSchemApp;
