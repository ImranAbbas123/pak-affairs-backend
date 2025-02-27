const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;
const CategorySchema = new Schema(
  {
    email: {
      type: String,
      default: null,
    },
    status: {
      type: String,
      default: "active",
    },
  },
  { timestamps: true }
);
const CatSchemApp = mongoose.model("newsletter", CategorySchema);
// User.createIndexes();
module.exports = CatSchemApp;
            