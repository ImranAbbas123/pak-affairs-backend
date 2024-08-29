const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;
const AppSchema = new Schema(
  {
    doctor: {
      type: String,
    },
    hospital: {
      type: String,
    },
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    cnic: {
      type: String,
    },
    phone: {
      type: String,
    },
    disease: {
      type: String,
    },
    image: {
      type: String,
    },
    appointment_number: {
      type: String,
      default: "0",
    },
    date: {
      type: Date,
    },
  },
  { timestamps: true }
);
const UserApp = mongoose.model("appointment", AppSchema);
// User.createIndexes();
module.exports = UserApp;
