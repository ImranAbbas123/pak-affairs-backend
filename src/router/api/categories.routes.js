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
  getAllCategories,
  getSingleCategory,
} = require("../../controllers/category.controller");
// add main and sub categories
router.post("/add/categories", upload.single("file"), async (req, res) => {
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
    let fileName = null;
    if (req.file) {
      fileName = await imageSave("categories", req.file);
    }
    const slug = req.body.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove all special characters except spaces and hyphens
      .replace(/\s+/g, "-") // Replace multiple spaces with a single hyphen
      .replace(/-+/g, "-");
    category = await Categories.create({
      name: req.body.name,
      slug: slug,
      type: req.body.type ? req.body.type : "",
      description: req.body.description ? req.body.description : "",
      keywords: req.body.keywords ? req.body.keywords : "",
      main_id: req.body.main ? req.body.main : null,
      image: fileName,
    });

    success = true;
    const response = {
      message: "Category created successfully",
      success,
    };
    return res.json(response);
  } catch (error) {
    return res.status(500).send("Internal Server Error!");
  }
});
// update main and sub categories
router.put("/update/categories", upload.single("file"), async (req, res) => {
  try {
    //let findUser  = await Users.findOne({_id:req.body.id});
    let success = false;
    let id = req.body._id;
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

      userImg = await imageSave("categories", req.file);
    } else {
      userImg = category?.image;
    }
    const slug = req.body.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "") // Remove all special characters except spaces and hyphens
      .replace(/\s+/g, "-") // Replace multiple spaces with a single hyphen
      .replace(/-+/g, "-");
    await Categories.updateOne(
      { _id: id },
      {
        $set: {
          name: req.body.name,
          slug: slug,
          type: req.body.type,
          description: req.body.description,
          keywords: req.body.keywords,
          main_id: req.body.main,
          image: userImg,
        },
      }
    );
    success = true;
    const response = {
      message: "Category updated successfully",
      success,
    };
    return res.json(response);
  } catch (error) {
    return res.status(500).send("Internal Server Error!");
  }
});
//single category
router.get("/get/single/category/:id", getSingleCategory);

router.get("/categories/all", getAllCategories);
// get all main categories
router.get("/get/main/categories", getMainCategories);
// get all subcategories of main category
router.get("/get/sub/categories/:id", getSubCategories);

module.exports = router;
