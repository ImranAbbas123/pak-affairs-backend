const express = require("express");
const checkLogin = require("../middleware/checkLogin");
var bcrypt = require("bcryptjs");
const Blogs = require("../models/Blogs");
const Comments = require("../models/Comments");
const Categories = require("../models/Categories");
const { ObjectId } = require("mongodb");
const sendEmail = require("../../config/sendEmail");
const { body, validationResult } = require("express-validator");
const router = express.Router();
// get all main categories
const getMainCategoriesBlogs = async (req, res) => {
  try {
    let success = false;
    let data = {};
    let response = {};
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filterName = req.query.title || "";
    const searchQuery = {};
    if (filterName) {
      searchQuery.title = { $regex: new RegExp(filterName, "i") }; // Case-insensitive search on the 'name' field
    }
    searchQuery.category = req.params.id;
    const blogs = await Blogs.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const blogCount = await Blogs.countDocuments(searchQuery);
    if (blogs) {
      data = {
        blogs,
        blogCount,
      };
      response = {
        data,
        message: "Main categories blogs founded successfully.",
        success: true,
      };
      return res.json(response);
    } else {
      response = {
        data,
        message: "Main categories blogs not found",
        success: false,
      };
      return res.json(response);
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
// get all sub categories
const getSubCategoriesBlogs = async (req, res) => {
  try {
    let success = false;
    let data = {};
    let response = {};
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filterName = req.query.title || "";
    const searchQuery = {};
    if (filterName) {
      searchQuery.title = { $regex: new RegExp(filterName, "i") }; // Case-insensitive search on the 'name' field
    }
    searchQuery.sub_category = req.params.id;

    const blogs = await Blogs.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const blogCount = await Blogs.countDocuments(searchQuery);
    if (blogs) {
      data = {
        blogs,
        blogCount,
      };
      response = {
        data,
        message: "Sub categories blogs founded successfully.",
        success: true,
      };
      return res.json(response);
    } else {
      response = {
        data,
        message: "Sub categories blogs not founded.",
        success: false,
      };
      return res.json(response);
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
// get all sub categories
const getBlogDetails = async (req, res) => {
  try {
    let success = false;
    let data = {};
    let response = {};
    const blog = await Blogs.findOne({ slug: req.params.id });
    blog.trending = parseInt(blog.trending) + 1;
    await blog.save();
    if (blog) {
      data = {
        blog,
      };
      response = {
        data,
        message: "Blog founded successfully.",
        success: true,
      };
      return res.json(response);
    } else {
      response = {
        data,
        message: "Blog not founded.",
        success: false,
      };
      return res.json(response);
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
// get all sub categories
const blogLike = async (req, res) => {
  try {
    let success = false;
    let data = {};
    let response = {};
    const blog = await Blogs.findOne({ slug: req.params.slug });
    blog.like = parseInt(blog.like) + 1;
    await blog.save();
    if (blog) {
      data = {
        likes: blog.like,
      };
      response = {
        data,
        message: "Blog like  successfully.",
        success: true,
      };
      return res.json(response);
    } else {
      response = {
        data,
        message: "Blog not founded.",
        success: false,
      };
      return res.json(response);
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
// get all sub categories
const blogComments = async (req, res) => {
  const { text, name } = req.body;
  const { slug } = req.params;
  try {
    let success = false;
    let data = {};
    let response = {};
    const newComment = new Comments({ slug: slug, text, name });
    await newComment.save();

    if (newComment) {
      data = {
        newComment,
      };
      response = {
        data,
        message: "Comment added  successfully.",
        success: true,
      };
      return res.json(response);
    } else {
      response = {
        data,
        message: "Blog not founded.",
        success: false,
      };
      return res.json(response);
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
// get all sub categories
const blogCommentsList = async (req, res) => {
  try {
    let success = false;
    let data = {};
    let response = {};
    const comments = await Comments.find({ slug: req.params.slug });
    if (comments) {
      data = {
        comments,
      };
      response = {
        data,
        message: "Comment fetched successfully.",
        success: true,
      };
      return res.json(response);
    } else {
      response = {
        data,
        message: "Blog not founded.",
        success: false,
      };
      return res.json(response);
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
// get all sub categories
const blogUnLike = async (req, res) => {
  try {
    let success = false;
    let data = {};
    let response = {};
    const blog = await Blogs.findOne({ slug: req.params.slug });
    blog.like = parseInt(blog.like) - 1;
    await blog.save();
    if (blog) {
      data = {
        likes: blog.like,
      };
      response = {
        data,
        message: "Blog like  successfully.",
        success: true,
      };
      return res.json(response);
    } else {
      response = {
        data,
        message: "Blog not founded.",
        success: false,
      };
      return res.json(response);
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
// get all sub categories
const getByIDBlogDetails = async (req, res) => {
  try {
    let success = false;
    let data = {};
    let response = {};
    const blog = await Blogs.findById(req.params.id);
    blog.trending = parseInt(blog.trending) + 1;
    await blog.save();
    if (blog) {
      data = {
        blog,
      };
      response = {
        data,
        message: "Blog founded successfully.",
        success: true,
      };
      return res.json(response);
    } else {
      response = {
        data,
        message: "Blog not founded.",
        success: false,
      };
      return res.json(response);
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
// delete blog
const deleteBlog = async (req, res) => {
  const blogId = req.params.id;
  //const user = Users.findByIdAndDelete(userId);
  Blogs.deleteOne({ _id: blogId })
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
// get all blogs

const getAllBlogs = async (req, res) => {
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
    let blogs;
    if (type === "trending") {
      blogs = await Blogs.find(searchQuery)
        .sort({ trending: -1, createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    } else {
      blogs = await Blogs.find(searchQuery)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
    }
    const blogCount = await Blogs.countDocuments(searchQuery);
    if (blogs) {
      data = {
        blogs,
      };
      response = {
        data,
        blogCount,
        currentPage: page,
        totalPages: Math.ceil(blogCount / limit),
        message: "Blogs founded successfully.",
        success: true,
      };
      return res.json(response);
    } else {
      response = {
        data,
        message: "Blogs not found",
        blogs: [],
        totalPages: 0,
        success: false,
      };
      return res.json(response);
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
// get all all category blogs
const getAllCategoryBlogs = async (req, res) => {
  try {
    let success = false;
    let data = {};
    let response = {};
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filterName = req.query.title || "";
    const type = req.query.type || "all";
    const searchQuery = {};
    const category = req.params.slug;

    if (filterName) {
      searchQuery.title = { $regex: new RegExp(filterName, "i") }; // Case-insensitive search on the 'name' field
    }
    let categories = await Categories.findOne({ slug: category });
    if (categories.type.toLowerCase() === "sub") {
      searchQuery.category = categories.main_id;
      searchQuery.sub_category = categories.id;
    } else {
      searchQuery.category = categories.id;
    }

    let blogs;

    blogs = await Blogs.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    const blogCount = await Blogs.countDocuments(searchQuery);

    if (blogs) {
      data = {
        blogs,
        categories,
      };
      response = {
        data,
        blogCount,
        currentPage: page,
        totalPages: Math.ceil(blogCount / limit),
        message: "Blogs founded successfully.",
        success: true,
      };

      return res.json(response);
    } else {
      response = {
        data,
        message: "Blogs not found",
        blogs: [],
        totalPages: 0,
        success: false,
      };
      return res.json(response);
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
const getAllBlogsSitemap = async (req, res) => {
  try {
    let blogs;
    let response = {};

    blogs = await Blogs.find({}).select("slug");
    console.log(blogs, "blogs");
    if (blogs) {
      response = {
        blogs,
        success: true,
      };
      return res.json(response);
    } else {
      response = {
        blogs,
        message: "Blogs not found",
        success: false,
      };
      return res.json(response);
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
const getAllCommentsList = async (req, res) => {
  try {
    let success = false;
    let data = {};
    let response = {};
    const comments = await Comments.find({});
    if (comments) {
      data = {
        comments,
      };
      response = {
        data,
        message: "Comments fetched successfully.",
        success: true,
      };
      return res.json(response);
    } else {
      response = {
        data,
        message: "Comments not found.",
        success: false,
      };
      return res.json(response);
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
};
module.exports = {
  getMainCategoriesBlogs,
  getSubCategoriesBlogs,
  getBlogDetails,
  deleteBlog,
  getAllBlogs,
  getByIDBlogDetails,
  blogLike,
  blogUnLike,
  blogComments,
  blogCommentsList,
  getAllCategoryBlogs,
  getAllBlogsSitemap,
  getAllCommentsList,
};
