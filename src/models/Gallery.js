const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;
const GallerySchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    type: {
      type: String,
    },
    keywords: {
      type: String,
    },
    description: {
      type: String,
    },
    image: {
      type: String,
    },
    status: {
      type: String,
      default: "active",
    },
  },
  { timestamps: true }
);
const Gallery = mongoose.model("gallery", GallerySchema);
// User.createIndexes();
module.exports = Gallery;
