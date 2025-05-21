const express = require("express");
const checkLogin = require("../../middleware/checkLogin");
const Blogs = require("../../models/Blogs");
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const upload = multer();
const router = express.Router();
const { imageSave, deleteImage } = require("../../../config/image.save");
const {
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
} = require("../../controllers/blogs.controller");
// add main and sub categories
router.post(
  "/add/blogs",
  upload.single("file"),

  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      let success = false;
      let userImg = null;
      let fileName;
      // if (req.file) {
      //   fileName = await imageSave("blogs", req.file);
      // }
      const slug = req.body.title
        .toLowerCase()
        .replace(/[^\w\s-]/g, "") // Remove all special characters except spaces and hyphens
        .replace(/\s+/g, "-") // Replace multiple spaces with a single hyphen
        .replace(/-+/g, "-");
      //  let deleteimage= deleteImage('users/1716879896069.png');
      let blogs = await Blogs.create({
        user: req.body.user,
        slug: slug,
        category: req.body.category ? req.body.category : "",
        sub_category: req.body.sub_category ? req.body.sub_category : null,
        title: req.body.title,
        description: req.body.description ? req.body.description : "",
        keywords: req.body.keywords ? req.body.keywords : "",
        content: req.body.content ? req.body.content : null,
        image: req.body.image ? req.body.image : null,
      });
      success = true;
      const data = {
        blogs,
      };
      const response = {
        data,
        message: "Blogs created successfully",
        success,
      };
      return res.json(response);
    } catch (error) {
      return res.status(400).json({
        success: false,
        message: error.message,
      });
    }
  }
);
// get all blogs sitemap
router.get("/get/all/sitemap", getAllBlogsSitemap);
// update blogs
router.put("/update", upload.single("file"), async (req, res) => {
  try {
    let success = false;
    let id = req.body._id;
    const blog = await Blogs.findOne({ _id: id });
    let fileName;
    let userImg;
    console.log(req.body);
    if (req.body.image) {
      // If a new file is provided, delete the current file
      fileName = req.body.image;
    } else {
      fileName = blog?.image;
    }
    const slug = req.body.title
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove all special characters except spaces and hyphens
      .replace(/\s+/g, "-") // Replace multiple spaces with a single hyphen
      .replace(/-+/g, "-");
    await Blogs.updateOne(
      { _id: id },
      {
        $set: {
          title: req.body.title,
          slug: slug,
          description: req.body.description ? req.body.description : "",
          keywords: req.body.keywords ? req.body.keywords : "",
          content: req.body.content ? req.body.content : null,
          image: fileName,
        },
      }
    );
    const updatedBlog = await Blogs.findOne({ _id: id });
    success = true;
    const data = {
      blog: updatedBlog,
    };
    const response = {
      data,
      message: "Record updated successfully.",
      success,
    };
    return res.json(response);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});
router.post("/upload/image", upload.single("file"), async (req, res) => {
  try {
    let success = false;
    console.log("blogs images", req.file);
    let userImg;
    if (req.file) {
      // If a new file is provided, delete the current file

      let fileName = imageSave("blogs", req.file);
      userImg = "blogs/" + fileName;
    } else {
      userImg = "";
    }

    const url = `http://localhost:5000/uploads/${fileName}`;
    res.status(200).json({
      url,
      uploaded: true,
    });
    return res.json(response);
  } catch (error) {
    return res.status(400).json({
      success: false,
      message: error.message,
    });
  }
});
// get delete blog
router.delete("/delete/:id", checkLogin, deleteBlog);
// get single blog details
router.get("/get/details/:id", getBlogDetails);
// get single blog details
router.get("/get/single/blog/details/:id", getByIDBlogDetails);

// get all main categories blogs
router.get("/get/main/categories/blogs/:id", getMainCategoriesBlogs);
// get all subcategories blogs
router.get("/get/sub/categories/blogs/:id", getSubCategoriesBlogs);
// get all blogs
router.get("/get/all", getAllBlogs);
// get all blogs
router.get("/get/all/category/:slug", getAllCategoryBlogs);
// like blogs
router.post("/like/:slug", blogLike);
// like blogs
router.post("/unlike/:slug", blogUnLike);
//blogs comments
router.post("/comments/:slug", blogComments);
router.get("/comments/list/:slug", blogCommentsList);
router.get("/all/comments/list", getAllCommentsList);
module.exports = router;
