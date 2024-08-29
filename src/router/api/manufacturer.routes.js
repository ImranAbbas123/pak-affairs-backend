const express = require("express");
var bcrypt = require("bcryptjs");
const checkLogin = require("../../middleware/checkLogin");
const Manufacturer = require("../../models/Manufacturer");
const HandlingTools = require("../../models/HandlingTools");
const Types = require("../../models/Types");
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
      let fileName ;
      if (req.file) {
         fileName = await imageSave("manufacturer", req.file);
        // userImg = "manufacturer/" + fileName;
      }
      const tools_slug = req.body.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")   // Remove all special characters except spaces and hyphens
      .replace(/\s+/g, "-")       // Replace multiple spaces with a single hyphen
      .replace(/-+/g, "-"); 
      //  let deleteimage= deleteImage('users/1716879896069.png');
      let manufacturer = await Manufacturer.create({
        tool_id: req.body.tool,
        type_id: req.body.type,
        name: req.body.name,
        slug: tools_slug,
        keywords: req.body.keywords,
        title: req.body.title ? req.body.title : "",
        description: req.body.description ? req.body.description : "",
        image: fileName,
      });
      success = true;
      const data = {
        manufacturer,
      };
      const response = {
        data,
        message: "Manufacturer created successfully",
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
// update single manufacturer
router.put("/update", upload.single("file"), async (req, res) => {
  try {
    //let findUser  = await Users.findOne({_id:req.body.id});
    let success = false;
    let id = req.body._id;
    const manufacturer = await Manufacturer.findOne({ _id: id });
    let fileName;
    let userImg;
    if (req.file) {
      // If a new file is provided, delete the current file
      // if (manufacturer?.image) {
      //   deleteImage(manufacturer?.image);
      // }
       fileName = await imageSave("manufacturer", req.file);
      // userImg = "manufacturer/" + fileName;
    } else {
      fileName = manufacturer?.image;
    }
    const tools_slug = req.body.name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")   // Remove all special characters except spaces and hyphens
    .replace(/\s+/g, "-")       // Replace multiple spaces with a single hyphen
    .replace(/-+/g, "-"); 
    await Manufacturer.updateOne(
      { _id: id },
      {
        $set: {
          tool_id: req.body.tool_id,
          type_id: req.body.type_id,
          name: req.body.name,
          slug: tools_slug,
          title: req.body.title ? req.body.title : "",
          keywords:req.body.keywords ? req.body.keywords : "",
          description: req.body.description ? req.body.description : "",
          image: fileName,
        },
      }
    );
    const updatedManufacturer = await Manufacturer.findOne({ _id: id });
    success = true;
    const data = {
      manufacturer: updatedManufacturer,
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
// get single manufacturer
router.get("/get/manufacturer/:id", async (req, res) => {
  try {
    let id = req.params.id;

    const manufacturer = await Manufacturer.findById(id);
    if (manufacturer) {
      const data = {
        manufacturer,
      };
      const response = {
        data,
        message: "Manufacturer find successfully.",
        success: true,
      };
      return res.json(response);
    } else {
      return res.json({
        success: false,
        message: "Manufacturer not found.Some thing went wrong!",
      });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});
// delete manufacturer
router.delete("/delete/:id", checkLogin, async (req, res) => {
  const Id = req.params.id;
  //const user = Users.findByIdAndDelete(userId);
  Manufacturer.deleteOne({ _id: Id })
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
// get tool type manufacturer
router.get("/get/:tool/:type", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const name = req.query.title || "";
    const tool_slug = req.params.tool;
    const type_slug = req.params.type;
    const tool = await HandlingTools.findOne({ slug: tool_slug });
    if (!tool || tool.length === 0) {
      return res.json({
        success: false,
        message: "Tool not found",
        totalPages: 0,
      });
    }
    const type = await Types.findOne({ slug: type_slug ,tool_id:tool._id});
    if (!type || type.length === 0) {
      return res.json({
        success: false,
        message: "Type not found",
        totalPages: 0,
      });
    }

    const searchQuery = {};
    if (name !== "") {
      searchQuery.name = { $regex: new RegExp(name, "i") };
    }
    // if (tool) {
    //   searchQuery.tool_id = tool._id;
    // }
    // if (type) {
    //   searchQuery.type_id = type._id;
    // }

    const totalItems = await Manufacturer.countDocuments(searchQuery);
    const manufacturers = await Manufacturer.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    // if (!manufacturers || manufacturers.length === 0) {
    //   return res.json({
    //     success: false,
    //     message: "No Result found",
    //     manufacturers: [],
    //     totalPages: 0,
    //   });
    // }

    const data = {
      tool,
      type,
      manufacturers,
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
// get all manufcturer
router.get("/get/all", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const name = req.query.title || "";
    const tool = req.query.tool;
    const type = req.query.type;

    const searchQuery = {};
    if (name !== "") {
      searchQuery.name = { $regex: new RegExp(name, "i") };
    }
    if (tool) {
      searchQuery.tool_id = tool;
    }
    if (type) {
      searchQuery.type_id = type;
    }
    const totalItems = await Manufacturer.countDocuments(searchQuery);

    const manufacturers = await Manufacturer.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    if (!manufacturers || manufacturers.length === 0) {
      return res.json({
        success: false,
        message: "No Result found",
        manufacturers: [],
        totalPages: 0,
      });
    }

    const data = {
      manufacturers,
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
// get all tool type manufacturer
router.get("/get/tool_types/manufacturer/:id/:type", async (req, res) => {
  try {
    const id = req.params.id;
    const type_id = req.params.type;
    const manufacturer = await Manufacturer.find({
      // tool_id: id,
      // type_id: type_id,
    });
    const data = {
      manufacturer,
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
