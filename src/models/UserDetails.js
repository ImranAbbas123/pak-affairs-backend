const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;
const CategorySchema = new Schema(
  {
    user: {
      type: String,
      default: null,
    },
    hospital: {
      type: String,
      default: null,
    },
    type: {
      type: String,
      default: null,
    },

    from: {
      type: String,
      required: true,
    },
    to: {
      type: String,
    },
    description: {
      type: String,
    },
  },
  { timestamps: true }
);
const CatSchemApp = mongoose.model("doctor_details", CategorySchema);
// User.createIndexes();
module.exports = CatSchemApp;
