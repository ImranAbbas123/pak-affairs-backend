const express = require("express");
const checkLogin = require("../../middleware/checkLogin");
const Categories = require("../../models/Categories");
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const upload = multer();
const router = express.Router();
const {
  getMainCategories,
  getSubCategories,
} = require("../../controllers/category.controller");
// add main and sub categories
router.post(
  "/add/categories",
  upload.single("file"),
  checkLogin,
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    try {
      let success = false;
      let category = await Categories.findOne({ name: req.body.name });
      if (category) {
        return res.json({
          success: false,
          error: "Sorry a category already exist on this name.",
        });
      }
      category = await Categories.create({
        name: req.body.name,
        type: req.body.type ? req.body.type : "",
        main_id: req.body.main_id ? req.body.main_id : null,
        image: null,
      });

      const categoryId = category._id;
      let userImg = null;
      if (req.file) {
        let fileName = imageSave("categories", req.file);
        userImg = "categories/" + fileName;
      }

      success = true;
      return res.json({ success, category });
    } catch (error) {
      return res.status(500).send("Internal Server Error!");
    }
  }
);
// update main and sub categories
router.put(
  "/update/categories",
  upload.single("file"),
  checkLogin,
  async (req, res) => {
    try {
      //let findUser  = await Users.findOne({_id:req.body.id});
      let success = false;
      let id = req.body.id;
      let category = await Categories.findOne({ _id: id });

      let catgry = await Categories.findOne({
        name: req.body.name,
        _id: { $ne: id },
      });

      if (category && catgry !== "" && catgry !== null) {
        return res.status(400).json({
          success,
          error: "Sorry a category already exist with this name.",
        });
      }
      let userImg;
      if (req.file) {
        // If a new file is provided, delete the current file
        if (category?.image) {
          deleteImage(category?.image);
        }
        let fileName = imageSave("categories", req.file);
        userImg = "categories/" + fileName;
      } else {
        userImg = category?.image;
      }
      await Categories.updateOne(
        { _id: id },
        {
          $set: {
            name: req.body.name,
            image: userImg,
          },
        }
      );
      const updatedCategory = await Categories.findOne({ _id: id });
      success = true;
      return res.json({ success, category: updatedCategory });
    } catch (error) {
      return res.status(500).send("Internal Server Error!");
    }
  }
);
// get all main categories
router.get("/get/main/categories", getMainCategories);
// get all subcategories of main category
router.get("/get/sub/categories/:id", getSubCategories);

module.exports = router;
