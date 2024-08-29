const express = require("express");
var bcrypt = require("bcryptjs");
const checkLogin = require("../../middleware/checkLogin");
const Result = require("../../models/Result");
const Models = require("../../models/Models");
const HandlingTools = require("../../models/HandlingTools");
const Types = require("../../models/Types");
const Manufacturer = require("../../models/Manufacturer");
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

      //  let deleteimage= deleteImage('users/1716879896069.png');
      let results = await Result.create({
        tool_id: req.body.tool,
        type_id: req.body.type,
        manufacturer_id: req.body.manufacturer,
        model_id: req.body.model,
        keywords: req.body.keywords,
        title: req.body.title,
        name: req.body.name,
        description: req.body.description ? req.body.description : "",
        content: req.body.content ? req.body.content : "",
      });
      success = true;
      const data = {
        results,
      };
      const response = {
        data,
        message: "Results created successfully",
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
// update single result
router.put("/update", upload.single("file"), async (req, res) => {
  try {
    //let findUser  = await Users.findOne({_id:req.body.id});
    let success = false;
    let id = req.body._id;

    await Result.updateOne(
      { _id: id },
      {
        $set: {
          tool_id: req.body.tool_id,
          type_id: req.body.type_id,
          manufacturer_id: req.body.manufacturer_id,
          model_id: req.body.model_id,
          keywords:req.body.keywords ? req.body.keywords : "",
          title: req.body.title,
          name: req.body.name,
          description: req.body.description ? req.body.description : "",
          content: req.body.content ? req.body.content : "",
        },
      }
    );
    const updatedResult = await Result.findOne({ _id: id });
    success = true;
    const data = {
      result: updatedResult,
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
// get single result
router.get("/get/result/:id", async (req, res) => {
  try {
    let id = req.params.id;

    const result = await Result.findById(id);
    if (result) {
      const data = {
        result,
      };
      const response = {
        data,
        message: "Result founded successfully.",
        success: true,
      };
      return res.json(response);
    } else {
      return res.json({
        success: false,
        message: "Result not found.Some thing went wrong!",
      });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});
// delete manufacturer
router.delete("/delete/:id", checkLogin, async (req, res) => {
  const Id = req.params.id;
  Result.deleteOne({ _id: Id })
    .then(() => {
      res.status(200).json({
        message: "Result deleted successfully!",
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

// get all results
// get all results
router.get("/get/all", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const filterTitle = req.query.title || "";
    const filterTool = req.query.tool || "";
    const filterType = req.query.type || "";
    const filterManufacturer = req.query.manufacturer || "";
    const filterModel = req.query.model || "";

    // Construct search query
    const searchQuery = {};
    if (filterTitle) {
      searchQuery.title = { $regex: new RegExp(filterTitle, "i") };
    }
    if (filterTool) {
      searchQuery.tool_id = filterTool;
    }
    if (filterType) {
      searchQuery.type_id = filterType;
    }
    if (filterManufacturer) {
      searchQuery.manufacturer_id = filterManufacturer;
    }
    if (filterModel) {
      searchQuery.model_id = filterModel;
    }

    // Get total item count
    const totalItems = await Result.countDocuments(searchQuery);

    // Get paginated results
    const results = await Result.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    if (!results || results.length === 0) {
      return res.json({
        success: false,
        message: "No Result found",
        results: [],
        totalItems: 0,
        totalPages: 0,
      });
    }

    // Populate results with related data
    const ResultData = await Promise.all(
      results.map(async (result) => {
        const tool = await HandlingTools.findById(result.tool_id);
        const model = await Models.findById(result.model_id);
        const type = await Types.findById(result.type_id);
        const manufacturer = await Manufacturer.findById(result.manufacturer_id);
        return {
          _id: result._id,
          title: result.title,
          status: result.status,
          description: result.description,
          tool: tool ? tool.name : "",
          model: model ? model.name : "",
          type: type ? type.name : "",
          manufacturer: manufacturer ? manufacturer.name : "",
        };
      })
    );

    const response = {
      data: { results: ResultData },
      currentPage: page,
      totalItems, // Include totalItems for pagination
      totalPages: Math.ceil(totalItems / limit),
      message: "Result found successfully.",
      success: true,
    };

    return res.json(response);
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
});

// get final result
// get tool type manufacturer
router.get("/get/:tool/:type/:manufacturer/:model", async (req, res) => {
  try {
    const tool_slug = req.params.tool;
    const type_slug = req.params.type;
    const manufacturer_slug = req.params.manufacturer;
    const model_slug = req.params.model;

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

    const model = await Models.findOne({ slug: model_slug ,tool_id:tool._id,type_id:type._id,manufacturer_id:manufacturer._id});
    if (!model || model.length === 0) {
      return res.json({
        success: false,
        message: "Model not found",
        totalPages: 0,
      });
    }
    const searchQuery = {};
    if (tool) {
      searchQuery.tool_id = tool._id;
    }
    if (type) {
      searchQuery.type_id = type._id;
    }
    if (manufacturer) {
      searchQuery.manufacturer_id = manufacturer._id;
    }
    if (model) {
      searchQuery.model_id = model._id;
    }
    
    const result = await Result.findOne(searchQuery);
    if (!result || result.length === 0) {
      return res.json({
        success: false,
        message: "No Result found",
        result: [],
        totalPages: 0,
      });
    }

    const data = {
      tool,
      type,
      manufacturer,
      model,
      result,
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
router.post(
  "/image",
  upload.single("file"),

  async (req, res) => {
    let fileName;
      if (req.file) {
        fileName = await imageSave("results", req.file);
      }
      success = true;
      const data = {
        fileName,
      };
      const response = {
        data,
        message: "Image uploaded successfully",
        success,
      };
      return res.json(response);
  });
module.exports = router;
