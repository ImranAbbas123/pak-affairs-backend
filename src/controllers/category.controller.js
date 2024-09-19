const express = require("express");
const checkLogin = require("../middleware/checkLogin");
var bcrypt = require("bcryptjs");
const Categories = require("../models/Categories");
const { ObjectId } = require("mongodb");
const sendEmail = require("../../config/sendEmail");
const { body, validationResult } = require("express-validator");
const router = express.Router();

const getAllCategories = async (req, res) => {
  try {
    let success = false;
    let data = {};
    let response = {};
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filterName = req.query.title || "";
    const type = req.query.type || "all";
    const searchQuery = {};
    if (filterName) {
      searchQuery.title = { $regex: new RegExp(filterName, "i") }; // Case-insensitive search on the 'name' field
    }
    let categories;
    categories = await Categories.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    const categoriesCount = await Categories.countDocuments(searchQuery);
    if (categories) {
      data = {
        categories,
      };

      response = {
        data,
        categoriesCount,
        currentPage: page,
        totalPages: Math.ceil(categoriesCount / limit),
        message: "Categories founded successfully.",
        success: true,
      };
      return res.json(response);
    } else {
      response = {
        data,
        message: "Categories not found",
        categories: [],
        totalPages: 0,
        success: false,
      };
      return res.json(response);
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
// get all main categories
const getMainCategories = async (req, res) => {
  try {
    let success = false;
    let data = {};
    let response = {};
    // const categories = await Categories.find({ type: "main" });
    const categories = await Categories.aggregate([
      {
        $lookup: {
          from: "blogs", // Lookup the blogs collection
          let: { categoryId: "$_id" }, // Pass the category _id
          pipeline: [
            {
              $match: {
                $expr: {
                  $or: [
                    { $eq: ["$category", "$$categoryId"] }, // Match blogs with main category
                    { $eq: ["$sub_category", "$$categoryId"] }, // Match blogs with subcategory
                  ],
                },
              },
            },
          ],
          as: "blogs", // Attach the found blogs to the category
        },
      },
      {
        $addFields: {
          blogCount: { $size: "$blogs" }, // Add a field with the count of blogs
        },
      },
      {
        $project: {
          name: 1, // Include the category name
          description: 1, // Include the description
          image: 1, // Include the image
          slug: 1, // Include the slug
          type: 1, // Include the type
          blogCount: 1, // Include the blog count
        },
      },
    ]);

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
// get all sub categories
const getSingleCategory = async (req, res) => {
  try {
    let success = false;
    let data = {};
    let response = {};
    const category = await Categories.findById(req.params.id);
    if (category) {
      data = {
        category,
      };
      response = {
        data,
        message: "Category founded successfully.",
        success: true,
      };
      return res.json(response);
    } else {
      response = {
        data,
        message: "Category not founded.",
        success: false,
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
  getAllCategories,
  getSingleCategory,
};
