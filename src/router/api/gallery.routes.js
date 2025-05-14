const express = require("express");
const checkLogin = require("../../middleware/checkLogin");
const Gallery = require("../../models/Gallery");
const router = express.Router();

router.get("/", checkLogin, async (req, res) => {
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
        let galleries = await Gallery.find(searchQuery)
        .sort({ createdAt: -1 })
        .skip((page - 1) * limit)
        .limit(limit);
        let total = await Gallery.countDocuments(searchQuery);
        if (galleries) {
            success = true;
        }
        data = {
            galleries,
           
        };
        response = {
            data,
            total,
            success,
        };
        return res.json(response);
        } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.post("/", checkLogin, async (req, res) => {
    try {
        let success = false;
        const {     name, image, description, type, keywords } = req.body;
        const gallery = new Gallery({ name, image, description, type, keywords });
        await gallery.save();
        if (gallery) {
            success = true;
        }
        const data = {
            gallery,
        };
        const response = {
            data,
            success,
        };
        return res.json(response);
    } catch (error) {
        return res.status(500).json({ success: false, message: error.message });
    }
});

router.put("/:id", checkLogin, async (req, res) => {
  const { id } = req.params;
  try {
    let success = false;
    const { name, image, description, type, keywords } = req.body;  

    const gallery = await Gallery.findByIdAndUpdate(id, { name, image, description, type, keywords });
    if (gallery) {
        success = true;
    }
    const data = {
        gallery,
    };
    const response = {
        data,
        success,
    };
    return res.json(response);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.delete("/:id", checkLogin, async (req, res) => {
  try { 
    const { id } = req.params;
    await Gallery.findByIdAndDelete(id);
    const response = {
        success: true,
        message: "Gallery deleted",
    };
    return res.json(response);
  } catch (error) {
    return res.status(500).json({ success: false, message: error.message });
  }
});

router.get("/all", async (req, res) => {
    try { 
      const gallery = await Gallery.find();
      const data = {
        gallery,
      };
      
      const response = {
          success: true,
          data,
      };
     
      return res.json(response);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  });
  router.get("/:id", checkLogin, async (req, res) => {
    try { 
      const { id } = req.params;
      const gallery = await Gallery.findById(id);
      const data = {
        gallery,
      };
      const response = {
          success: true,
          data,
      };
      return res.json(response);
    } catch (error) {
      return res.status(500).json({ success: false, message: error.message });
    }
  });
module.exports = router;
