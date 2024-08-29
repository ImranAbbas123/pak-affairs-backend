const express = require("express");
var bcrypt = require("bcryptjs");
const checkLogin = require("../../middleware/checkLogin");
const Models = require("../../models/Models");
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
      let fileName;
      if (req.file) {
         fileName = await imageSave("models", req.file);
      }
      const tools_slug = req.body.name
      .toLowerCase()
    .replace(/[^\w\s-]/g, "")   // Remove all special characters except spaces and hyphens
    .replace(/\s+/g, "-")       // Replace multiple spaces with a single hyphen
    .replace(/-+/g, "-"); 
      //  let deleteimage= deleteImage('users/1716879896069.png');
      let models = await Models.create({
        tool_id: req.body.tool,
        type_id: req.body.type,
        manufacturer_id: req.body.manufacturer,
        name: req.body.name,
        slug: tools_slug,
        keywords: req.body.keywords,
        title: req.body.title ? req.body.title : "",
        description: req.body.description ? req.body.description : "",
        image: fileName,
      });
      success = true;
      const data = {
        models,
      };
      const response = {
        data,
        message: "Models created successfully",
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
// update single model
router.put("/update", upload.single("file"), async (req, res) => {
  try {
    //let findUser  = await Users.findOne({_id:req.body.id});
    let success = false;
    let id = req.body._id;
    const model = await Models.findOne({ _id: id });
    let fileName;
    let userImg;
    if (req.file) {
      // If a new file is provided, delete the current file
      // if (model?.image) {
      //   deleteImage(model?.image);
      // }
       fileName = await imageSave("models", req.file);
    } else {
      fileName = model?.image;
    }
    const tools_slug = req.body.name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")   // Remove all special characters except spaces and hyphens
    .replace(/\s+/g, "-")       // Replace multiple spaces with a single hyphen
    .replace(/-+/g, "-"); 
    await Models.updateOne(
      { _id: id },
      {
        $set: {
          tool_id: req.body.tool_id,
          type_id: req.body.type_id,
          manufacturer_id: req.body.manufacturer_id,
          name: req.body.name,
          slug: tools_slug,
          keywords:req.body.keywords ? req.body.keywords : "",
          title: req.body.title ? req.body.title : "",
          description: req.body.description ? req.body.description : "",
          image: fileName,
        },
      }
    );
    const updatedModel = await Models.findOne({ _id: id });
    success = true;
    const data = {
      model: updatedModel,
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
router.get("/get/model/:id", async (req, res) => {
  try {
    let id = req.params.id;

    const model = await Models.findById(id);
    if (model) {
      const data = {
        model,
      };
      const response = {
        data,
        message: "Model find successfully.",
        success: true,
      };
      return res.json(response);
    } else {
      return res.json({
        success: false,
        message: "Model not found.Some thing went wrong!",
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
  Models.deleteOne({ _id: Id })
    .then(() => {
      res.status(200).json({
        message: "Model deleted successfully!",
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
router.get("/get/:tool/:type/:manufacturer", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const name = req.query.title || "";
    const tool_slug = req.params.tool;
    const type_slug = req.params.type;
    const manufacturer_slug = req.params.manufacturer;

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

    const manufacturer = await Manufacturer.findOne({
      slug: manufacturer_slug,
    });
    if (!manufacturer || manufacturer.length === 0) {
      return res.json({
        success: false,
        message: "Manufacturer not found",
        totalPages: 0,
      });
    }
    const searchQuery = {};
    if (name !== "") {
      searchQuery.name = { $regex: new RegExp(name, "i") };
    }
    if (tool) {
      searchQuery.tool_id = tool._id;
    }
    if (type) {
      searchQuery.type_id = type._id;
    }
    if (manufacturer) {
      searchQuery.manufacturer_id = manufacturer._id;
    }
    const totalItems = await Models.countDocuments(searchQuery);
    const models = await Models.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    // if (!models || models.length === 0) {
    //   return res.json({
    //     success: false,
    //     message: "No Result found",
    //     models: [],
    //     totalPages: 0,
    //   });
    // }

    const data = {
      tool,
      type,
      manufacturer,
      models,
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
// get tool type manufacturer
router.get("/get/all", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const name = req.query.title || "";
    const tool = req.query.tool;
    const type = req.query.type;
    const manufacturer = req.query.manufacturer;

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
    if (manufacturer) {
      searchQuery.manufacturer_id = manufacturer;
    }

    // Count the total number of items matching the query
    const totalItems = await Models.countDocuments(searchQuery);

    // Fetch the models with pagination
    const models = await Models.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit) // Correct skip calculation
      .limit(limit);

    // Check if no models were found
    if (!models || models.length === 0) {
      return res.json({
        success: false,
        message: "No Results found",
        models: [],
        totalPages: 0,
        totalItems: 0, // Add totalItems to indicate zero results
      });
    }

    // Prepare the response
    const response = {
      data: {
        models,
      },
      currentPage: page,
      totalPages: Math.ceil(totalItems / limit),
      totalItems: totalItems, // Total number of records
      message: "Results found successfully.",
      success: true,
    };

    return res.json(response);
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
});

// get all tool type manufacturer
router.get(
  "/get/tool_types/manufacturer/model/:id/:type/:manufacturer",
  async (req, res) => {
    try {
      const id = req.params.id;
      const type_id = req.params.type;
      const manufacturer = req.params.manufacturer;
      const model = await Models.find({
        tool_id: id,
        type_id: type_id,
        manufacturer_id: manufacturer,
      });
      const data = {
        model,
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
  }
);
module.exports = router;
