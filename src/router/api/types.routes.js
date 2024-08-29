const express = require("express");
var bcrypt = require("bcryptjs");
const checkLogin = require("../../middleware/checkLogin");
const Types = require("../../models/Types");
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
      let fileName ;
      if (req.file) {
      fileName = await imageSave("types", req.file);
        // userImg = "types/" + fileName;
      }
      const tools_slug = req.body.name
      .toLowerCase()
      .replace(/[^\w\s-]/g, "")   // Remove all special characters except spaces and hyphens
      .replace(/\s+/g, "-")       // Replace multiple spaces with a single hyphen
      .replace(/-+/g, "-"); 
      //  let deleteimage= deleteImage('users/1716879896069.png');
      let types = await Types.create({
        tool_id: req.body.tool,
        name: req.body.name,
        title: req.body.title,
        keywords: req.body.keywords,
        slug: tools_slug,
        description: req.body.description ? req.body.description : "",
        image: fileName,
      });
      success = true;
      const data = {
        types,
      };
      const response = {
        data,
        message: "Types created successfully",
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
// update single type
router.put("/update", upload.single("file"), async (req, res) => {
  try {
    //let findUser  = await Users.findOne({_id:req.body.id});
    let success = false;
    let id = req.body._id;
    const types = await Types.findOne({ _id: id });
    let fileName;
    let userImg;
    if (req.file) {
      // If a new file is provided, delete the current file
      // if (types?.image) {
      //   deleteImage(types?.image);
      // }
       fileName = await imageSave("types", req.file);
      // userImg = "types/" + fileName;
    } else {
      fileName = types?.image;
    }
    const tools_slug = req.body.name
    .toLowerCase()
    .replace(/[^\w\s-]/g, "")   // Remove all special characters except spaces and hyphens
    .replace(/\s+/g, "-")       // Replace multiple spaces with a single hyphen
    .replace(/-+/g, "-"); 
    await Types.updateOne(
      { _id: id },
      {
        $set: {
          name: req.body.name,
          tool_id: req.body.tool_id,
          slug: tools_slug,
          title: req.body.title ? req.body.title : "",
          description: req.body.description ? req.body.description : "",
          keywords:req.body.keywords ? req.body.keywords : "",
          image: fileName,
        },
      }
    );
    const updatedTypes = await Types.findOne({ _id: id });
    success = true;
    const data = {
      types: updatedTypes,
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
// get single type
router.get("/get/type/:id", async (req, res) => {
  try {
    let id = req.params.id;

    const type = await Types.findById(id);
    if (type) {
      const data = {
        type,
      };
      const response = {
        data,
        message: "Type find successfully.",
        success: true,
      };
      return res.json(response);
    } else {
      return res.json({
        success: false,
        message: "Type not found.Some thing went wrong!",
      });
    }
  } catch (error) {
    res.json({ success: false, message: error.message });
  }
});
// delete type
router.delete("/delete/:id", checkLogin, async (req, res) => {
  const userId = req.params.id;
  //const user = Users.findByIdAndDelete(userId);
  Types.deleteOne({ _id: userId })
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
router.get("/get/:tool", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const name = req.query.title || "";
    const tool_slug = req.params.tool;
    const tool = await HandlingTools.findOne({ slug: tool_slug });
    if (!tool || tool.length === 0) {
      return res.json({
        success: false,
        message: "Tool not found",
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
    const totalItems = await Types.countDocuments(searchQuery);
    const types = await Types.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);
    // if (!types || types.length === 0) {
    //   return res.json({
    //     success: false,
    //     message: "No Result found",
    //     types: [],
    //     totalPages: 0,
    //   });
    // }

    const data = {
      tool,
      types,
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
// get all types
// Get all types
router.get("/get/all/types", async (req, res) => {
  try {
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const name = req.query.title || "";
    const tool_id = req.query.tool || "";

    // Search query
    const searchQuery = {};
    if (name) {
      searchQuery.name = { $regex: new RegExp(name, "i") };
    }
    if (tool_id) {
      searchQuery.tool_id = tool_id;
    }

    // Count total items matching the search query
    const totalItems = await Types.countDocuments(searchQuery);

    // Fetch the paginated results
    const types = await Types.find(searchQuery)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit);

    // If no results are found
    if (!types || types.length === 0) {
      return res.json({
        success: false,
        message: "No Result found",
        types: [],
        totalItems: 0,
        totalPages: 0,
      });
    }

    // Prepare the response data
    const response = {
      data: {
        types,
      },
      currentPage: page,
      totalItems, // Return the total number of items
      totalPages: Math.ceil(totalItems / limit),
      message: "Result found successfully.",
      success: true,
    };

    return res.json(response);
  } catch (error) {
    return res.json({ success: false, message: error.message });
  }
});

// get types by id
router.get("/get/tool_types/:id", async (req, res) => {
  try {
    const id = req.params.id;
    const types = await Types.find({ tool_id: id });

    const data = {
      types,
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
