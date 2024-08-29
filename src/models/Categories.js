const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;
const CategorySchema = new Schema(
  {
    main_id: {
      type: String,
      default: null,
    },
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
    },
    keywords:{
      type: String,
    },
    description:{
      type: String,
    },
    image: {
      type: String,
    },
    status: {
      type: String,
      default:'active'
    },
  },
  { timestamps: true }
);
const CatSchemApp = mongoose.model("categories", CategorySchema);
// User.createIndexes();
module.exports = CatSchemApp;
