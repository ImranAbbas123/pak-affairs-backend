const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;
const CategorySchema = new Schema(
  {
    tool_id: {
      type: String,
    },
    type_id: {
      type: String,
    },
    manufacturer_id: {
      type: String,
    },
    model_id: {
      type: String,
    },
    name: {
      type: String,
      default: null,
    },
    title: {
      type: String,
    },
    keywords:{
      type: String,
    },
    description: {
      type: String,
    },
    content: {
      type: String,
    },
    status: {
      type: String,
      default: "inactive",
    },
  },
  { timestamps: true }
);
const CatSchemApp = mongoose.model("results", CategorySchema);
// User.createIndexes();
module.exports = CatSchemApp;
