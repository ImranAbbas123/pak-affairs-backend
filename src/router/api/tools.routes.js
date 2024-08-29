const express = require("express");
var bcrypt = require("bcryptjs");
const checkLogin = require("../../middleware/checkLogin");
const HandlingTools = require("../../models/HandlingTools");
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const upload = multer();
const router = express.Router();
const sendEmail = require("../../../config/sendEmail");
const { imageSave, deleteImage } = require("../../../config/image.save");

// add main and sub categories
router.post(
  "/add",
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
      if (req.file) {
        fileName = await imageSave("tools", req.file);
      }
      const tools_slug = req.body.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")   // Remove all special characters except spaces and hyphens
      .replace(/\s+/g, "-")       // Replace multiple spaces with a single hyphen
      .replace(/-+/g, "-"); 
      //  let deleteimage= deleteImage('users/1716879896069.png');
      let tools = await HandlingTools.create({
        name: req.body.name,
        slug: tools_slug,
        title: req.body.title,
        keywords: req.body.keywords,
        description: req.body.description ? req.body.description : "",
        image: fileName,
      });
      success = true;
      const data = {
        tools,
      };
      const response = {
        data,
        message: "Tools created successfully",
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
// update single tool
router.put("/update", upload.single("file"), async (req, res) => {
  try {
    //let findUser  = await Users.findOne({_id:req.body.id});
    let success = false;
    let id = req.body._id;
    const tools = await HandlingTools.findOne({ _id: id });
    const tool = await HandlingTools.findOne({
      name: req.body.name,
      _id: { $ne: id },
    });

    if (tools && tool !== "" && tool !== null) {
      return res.status(400).json({
        message: "Sorry a tool already exist with this name.",
        success,
      });
    }
    let fileName;
    let userImg;
    if (req.file) {
       fileName = await imageSave("tools", req.file);
    } else {
      fileName = tools?.image;
    }
    const tools_slug = req.body.name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")   // Remove all special characters except spaces and hyphens
    .replace(/\s+/g, "-")       // Replace multiple spaces with a single hyphen
    .replace(/-+/g, "-"); 
    await HandlingTools.updateOne(
      { _id: id },
      {
        $set: {
          name: req.body.name,
          slug: tools_slug,
          title: req.body.title,
          keywords: req.body.keywords ? req.body.keywords : "",
          description: req.body.description ? req.body.description : "",
          image: fileName,
        },
      }
    );
    const updatedTool = await HandlingTools.findOne({ _id: id });
    success = true;
    const data = {
      tool: updatedTool,
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
// get single tool
router.get("/get/tool/:id", async (req, res) => {
  try {
    let id = req.params.id;

    const tool = await HandlingTools.findById(id);
    if (tool) {
      const data = {
        tool,
      };
      const response = {
        data,
        message: "Tool find successfully.",
        success: true,
      };
      return res.json(response);
    } else {
      return res.json({
        success: false,
        message: "Tool not found.Some thing went wrong!",
      });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});
// delete tool
router.delete("/delete/:id", checkLogin, async (req, res) => {
  const userId = req.params.id;
  //const user = Users.findByIdAndDelete(userId);
  HandlingTools.deleteOne({ _id: userId })
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
});
// get all tools
router.get("/get/all/tools", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const name = req.query.title || "";
    const searchQuery = {};
    if (name !== "") {
      searchQuery.name = { $regex: new RegExp(name, "i") };
    }

    const totalItems = await HandlingTools.countDocuments(searchQuery);
    const tools = await HandlingTools.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    if (!tools || tools.length === 0) {
      return res.json({
        success: false,
        message: "No Result found",
        tools: [],
        totalPages: 0,
      });
    }

    const data = {
      tools,
    };
    const response = {
      data,
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      message: "Result founded successfully.",
      success: true,
    };
    return res.json(response);
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
});
// get all tools
router.get("/get/all/data", async (req, res) => {
  try {
    const tools = await HandlingTools.find({});
    if (!tools || tools.length === 0) {
      return res.json({
        success: false,
        message: "No Result found",
        tools: [],
        totalPages: 0,
      });
    }

    const data = {
      tools,
    };
    const response = {
      data,
      message: "Result founded successfully.",
      success: true,
    };
    return res.json(response);
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
});
module.exports = router;
