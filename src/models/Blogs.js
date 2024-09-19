const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;
const CategorySchema = new Schema(
  {
    user: {
      type: String,
      default: null,
    },
    slug: {
      type: String,
      default: null,
    },
    
    category: {
      type: Schema.Types.ObjectId, // Reference to the subcategory
      ref: "categories", // Assuming subcategories are in the same "categories" collection
    },
    sub_category: {
      type: Schema.Types.ObjectId, // Reference to the subcategory
      ref: "categories", // Assuming subcategories are in the same "categories" collection
      default:null
    },

    title: {
      type: String,
      required: true,
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
    trending:{
      type:Number,
      default:0,
    }
    ,
    image: {
      type: String,
    },
    status: {
      type: String,
      default: "inactive",
    },
  },
  { timestamps: true }
);
const CatSchemApp = mongoose.model("blogs", CategorySchema);
// User.createIndexes();
module.exports = CatSchemApp;
