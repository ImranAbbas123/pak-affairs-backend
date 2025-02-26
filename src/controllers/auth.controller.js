const express = require("express");
const checkLogin = require("../middleware/checkLogin");
var bcrypt = require("bcryptjs");
var jwt = require("jsonwebtoken");
const Users = require("../models/Users");
const { ObjectId } = require("mongodb");
const fs = require("fs");
const path = require("path");
const sendEmail = require("../../config/sendEmail");
// const PasswordReset = require("../models/PasswordReset");
const { body, validationResult } = require("express-validator");
// const { BSON } = require("realm");
// const Realm = require("realm");
const router = express.Router();
const JWT_SECRET = "docinfo";
const crypto = require("crypto");

//random password
function generateRandomPassword() {
  const length = 8;
  const charset = "0123456789";
  let password = "";
  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }
  return password;
}

// random string
function generateRandomString(length) {
  return crypto
    .randomBytes(Math.ceil(length / 2))
    .toString("hex")
    .slice(0, length);
}

// genrate qr code
const generateAndSaveQRCode = async (userId) => {
  try {
    const qrCodeData = await QRCode.toDataURL(userId);
    const qrCodeImage = qrCodeData.replace(/^data:image\/png;base64,/, "");
    const qrCodeFilePath = path.join(
      __dirname,
      `../../build/uploads/${userId}.png`
    );
    fs.writeFileSync(qrCodeFilePath, qrCodeImage, "base64");
    return true;
  } catch (error) {
    console.error("Error generating and saving QR code:", error);
    throw error;
  }
};

// login user code
const login = async (req, res) => {
  const errors = validationResult(req);
  let success = false;
  if (!errors.isEmpty()) {
    return res.status(400).json({ success, error: errors.array() });
  }
  const { email, password } = req.body;
  try {
    let user = await Users.findOne({ email });

    if (!user) {
      return res.status(400).json({
        success,
        message: "Invalid credentials. Please enter valid credentials!",
      });
    }
    const passwordCompair = await bcrypt.compare(password, user.password);
    if (!passwordCompair) {
      return res.status(400).json({
        success,
        message: "Invalid credentials. Please enter valid credentials!",
      });
    }
    const toke_data = {
      user: {
        id: user.id,
      },
    };
    const authToken = jwt.sign(toke_data, JWT_SECRET);
    success = true;
    user = await Users.findById(user.id).select("-password");

    const data = {
      user,
      authToken,
    };
    const response = {
      data,
      message: "User Login successfully",
      success,
    };
    return res.json(response);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
// forgot password
const forgotPassword = async (req, res) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ success: false, error: errors.array() });
  }
  const { email } = req.body;
  try {
    let user = await Users.findOne({ email });
    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid Email. Please enter a valid email!",
      });
    }
    let existingRequest = await PasswordReset.findOne({ email });
    if (existingRequest) {
      return res.json({
        success: false,
        error: "You already sent a password reset request",
      });
    }
    const token = generateRandomString(64);
    const currentTime = new Date();
    // Add one hour to the current time in UTC
    currentTime.setUTCHours(currentTime.getUTCHours() + 1);
    const resetRequest = await PasswordReset.create({
      email: email,
      token: token,
      expireAt: currentTime,
    });
    if (resetRequest) {
      const base_url = "https://beta.fastlobby.com";
      const url = `${base_url}/reset/password/${token}`;
      const emailTemplatePath = path.join(
        __dirname,
        "..",
        "config",
        "email",
        "reset_password.html"
      );
      const emailTemplate = fs.readFileSync(emailTemplatePath, "utf-8");
      const personalizedEmailTemplate = emailTemplate
        .replace("{{token}}", token)
        .replace("{{url}}", url)
        .replace("{{user}}", user.name);
      sendEmail(
        resetRequest.email,
        "Reset Password",
        personalizedEmailTemplate
      );
      return res.json({
        success: true,
        message: "Password reset link has been sent to your email",
      });
    }
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      error: error.message,
    });
  }
};

// Reset Password
const resetPassword = async (req, res) => {
  const { new_password, confirm_password, token } = req.body;
  if (!new_password || !confirm_password || !token) {
    return res.status(400).json({
      success: false,
      error: "new_password, confirm_password, and token are required",
    });
  }
  try {
    let existingRequest = await PasswordReset.findOne({ token });
    if (!existingRequest) {
      return res.status(400).json({
        success: false,
        error: "Token is invalid / Expired",
      });
    }
    const user = await Users.findOne({ email: existingRequest.email });
    if (!user) {
      return res.status(400).json({
        success: false,
        error: "Invalid Token..",
      });
    }
    if (new_password !== confirm_password) {
      return res.status(400).json({
        success: false,
        error:
          "New password did not match with confirm password, please try again",
      });
    }
    const salt = await bcrypt.genSalt(10);
    const hashPass = await bcrypt.hash(new_password, salt);
    // Update the user's password with the new hashed password
    user.password = hashPass;
    await user.save();
    // Delete the existing password reset request since it has been used
    await PasswordReset.findOneAndDelete({ token });
    return res.json({
      success: true,
      message:
        "Password has been reset successfully. You can now login with your new password.",
    });
  } catch (error) {
    console.error(error.message);
    res.status(500).json({
      success: false,
      error: "Internal Server Error!",
    });
  }
};

// get users
const FindUser = async (req, res) => {
  try {
    let id = req.params.id;

    const user = await Users.findById(id).select("-password");
    if (user) {
      const data = {
        user,
      };
      const response = {
        data,
        message: "User find successfully.",
        success: true,
      };

      return res.json(response);
    } else {
      return res.json({
        success: false,
        message: "User not found.Some thing went wrong!",
      });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
// delete user
const deleteUser = async (req, res) => {
  const userId = req.params.id;
  //const user = Users.findByIdAndDelete(userId);
  Users.deleteOne({ _id: userId })
    .then(() => {
      res.status(200).json({
        message: "Deleted!",
        success: true,
      });
    })
    .catch((error) => {
      res.status(400).json({
        message: error.message,
        success: false,
      });
    });
};
// add user schedule
const addSchedule = async (req, res) => {
  try {
    let id = req.body.id;
    let success = false;
    const user = await Users.findOne({ _id: id });
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();

    // Calculate the start and end of the current month
    const startOfMonth = new Date(currentYear, currentMonth, 1);
    const endOfMonth = new Date(currentYear, currentMonth + 1, 0);

    // Create sample entries for the current month
    const entries = [];
    for (let day = 1; day <= endOfMonth.getDate(); day++) {
      entries.push({
        date: new Date(currentYear, currentMonth, day).toISOString(),
        data: [
          {
            hospital: req.body.hospital ? req.body.hospital : "",
            startTime: req.body.startTime ? req.body.startTime : "",
            endTime: req.body.endTime ? req.body.endTime : "",
            holiday: req.body.holiday ? req.body.holiday : "",
            numberOfPatient: req.body.numberOfPatient
              ? req.body.numberOfPatient
              : "",
          },
        ],
      });
    }
    await Users.updateOne(
      { _id: id },
      {
        $set: {
          schedule: entries,
        },
      }
    );

    success = true;
    const updatedUser = await Users.findOne({ _id: id }).select("-password");
    const data = {
      user: updatedUser,
    };
    const response = {
      data,
      message: "User Schedule added updated successfully.",
      success,
    };
    return res.json(response);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
};
// edit schedule
const editSchedule = async (req, res) => {
  try {
    let success = false;
    let id = req.body.id;
    let eventId = req.body.event;
    let scehdule = req.body.schedule;
    const user = await Users.findOne({ _id: id });

    const eventIdObj = new ObjectId(eventId);
    if (user && user.schedule) {
      // Find the index of the event in the schedule array
      const eventIndex = user.schedule.findIndex((event) =>
        event._id.equals(eventIdObj)
      );
      // Check if the event exists in the schedule
      if (eventIndex !== -1) {
        user.schedule[eventIndex].data = scehdule;
        await user.save();
        success = true;
        const updatedUser = await Users.findOne({ _id: id }).select(
          "-password"
        );
        const data = {
          user: updatedUser,
        };
        const response = {
          data,
          message: "Event Updated successfully.",
          success,
        };
        return res.json(response);
      } else {
        // Event not found in the schedule
        return res
          .status(404)
          .json({ success: false, message: "Event not found" });
      }
    }
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};
// get tenant list
const getDoctors = async (req, res) => {
  try {
    let success = false;
    const role = req.query.role || "";
    const name = req.query.name || "";

    const city = req.query.city || "";

    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const searchQuery = {};
    if (role) {
      searchQuery.role = role;
    }
    if (name !== "") {
      searchQuery.name = { $regex: new RegExp(name, "i") };
    }
    if (city !== "") {
      searchQuery.city = { $regex: new RegExp(city, "i") };
    }
    const totalItems = await Users.countDocuments(searchQuery);
    const doctors = await Users.find(searchQuery)
      .select("-password  -role")
      .skip((page - 1) * limit)
      .limit(limit);
    let data = {};
    let response;
    if (!doctors || doctors.length === 0) {
      response = {
        data,
        message: "No User found.",
        success,
      };
      return res.json(response);
    }
    success = true;
    data = {
      doctors,
    };
    response = {
      data,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      message: "User found.",
      success,
    };
    return res.json(response);
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};
const getAuther = async (req, res) => {
  try {
    const auther = await Users.findOne({ role: "author" }).select(
      "name createdAt email role"
    );
    const data = {
      auther,
    };
    let success = false;
    const response = {
      data,
      message: "Auther found.",
      success,
    };
    return res.json(response);
  } catch (error) {
    return res.status(404).json({ success: false, message: error.message });
  }
};
module.exports = {
  login,
  forgotPassword,
  resetPassword,
  FindUser,
  deleteUser,
  addSchedule,
  editSchedule,
  getDoctors,
  getAuther,
};
