const mongoose = require("mongoose");
const { Schema } = mongoose;
const { ObjectId } = Schema.Types;
const UserSchema = new Schema(
  {
    name: {
      type: String,
      required: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    password: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
    },
    phone2: {
      type: String,
    },
    city: {
      type: String,
    },
    distric: {
      type: String,
    },
    role: {
      type: String,
      default: "doctor",
    },
    qr_image: {
      type: String,
    },
    image: {
      type: String,
    },
    specilization: {
      type: String,
    },
    qulification: {
      type: String,
    },
    experience: {
      type: String,
    },
    address: {
      type: String,
    },
    schedule: [
      {
        date: { type: String },
        data: [
          {
            hospital: {
              type: String,
            },
            startTime: {
              type: String,
            },
            endTime: {
              type: String,
            },
            holiday: {
              type: String,
            },
            numberOfPatient:{
              type: String,
            }
          }
        ],
      },
    ],
    appointment_number: {
      type: String,
      default: "0",
    },
    date: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      default: "active",
    },
    bio: {
      type: String,
    },
    profile_updated: {
      type: String,
      default: false,
    },
  },
  { timestamps: true }
);
const User = mongoose.model("users", UserSchema);
// User.createIndexes();
module.exports = User;
