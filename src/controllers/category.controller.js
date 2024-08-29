const express = require("express");
const checkLogin = require("../middleware/checkLogin");
var bcrypt = require("bcryptjs");
const Categories = require("../models/Categories");
const { ObjectId } = require("mongodb");
const sendEmail = require("../../config/sendEmail");
const { body, validationResult } = require("express-validator");
const router = express.Router();
// get all main categories
const getMainCategories = async (req, res) => {
  try {
    let success = false;
    let data = {};
    let response = {};
    const categories = await Categories.find({ type: "main" });
    if (categories) {
      data = {
        categories,
      };
      response = {
        data,
        message: "Main categories founded successfully.",
        success: true,
      };
      return res.json(response);
    } else {
      response = {
        data,
        message: "Main categories not found",
        success: true,
      };
      return res.json(response);
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
// get all sub categories
const getSubCategories = async (req, res) => {
  try {
    let success = false;
    let data = {};
    let response = {};
    const main = req.params.id;
    const categories = await Categories.find({ type: "sub", main_id: main });
    if (categories) {
      data = {
        categories,
      };
      response = {
        data,
        message: "Sub categories founded successfully.",
        success: true,
      };
      return res.json(response);
    } else {
      response = {
        data,
        message: "Sub categories not founded.",
        success: true,
      };
      return res.json(response);
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
module.exports = {
  getMainCategories,
  getSubCategories,
};
