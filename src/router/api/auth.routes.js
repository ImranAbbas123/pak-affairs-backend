const express = require("express");
const checkLogin = require("../../middleware/checkLogin");
var bcrypt = require("bcryptjs");
const Users = require("../../models/Users");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
var jwt = require("jsonwebtoken");
const mediaPath = process.env.MEDIA_PATH;
const { body, validationResult } = require("express-validator");
const { imageSave, deleteImage } = require("../../../config/image.save");
const multer = require("multer");
const upload = multer();
const {
  login,
  FindUser,
  deleteUser,
  addSchedule,
  editSchedule,
  getDoctors,
} = require("../../controllers/auth.controller");
const router = express.Router();
const sendEmail = require("../../../config/sendEmail");
const JWT_SECRET = "docinfo";

const generateRandomString = (length) => {
  return crypto.randomBytes(length).toString("hex");
};
// get role base user

router.post(
  "/signUp",

  async (req, res) => {
    let success = false;
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ success, message: errors.array() });
    }
    try {
      let user = await Users.findOne({ email: req.body.email });
      if (user) {
        return res.json({
          success,
          message: "Sorry a user already exist on this email.",
        });
      }
      let userImg;
      let password = req.body.password
        ? req.body.password
        : generateRandomPassword();
      const salt = await bcrypt.genSalt(10);
      const secPass = await bcrypt.hash(password, salt);
      const apiPhoneNumber = req.body.phone ? req.body.phone : "";
      const cleanedPhoneNumber = apiPhoneNumber.replace(/\s/g, "");
      user = await Users.create({
        name: req.body.name,
        email: req.body.email,
        password: secPass,
        phone: cleanedPhoneNumber,
        role: req.body.role ? req.body.role : "",
        site: req.body.site ? req.body.site : null,
        qr_image: null,
      });
      const userId = user.id;
      const pin = password;


      // const emailTemplatePath = path.join(
      //   __dirname,
      //   "..",
      //   "config",
      //   "email",
      //   "add_user.html"
      // );
      // const emailTemplate = fs.readFileSync(emailTemplatePath, "utf-8");
      // const base_url = req.body.base_url;
      // const personalizedEmailTemplate = emailTemplate
      //   .replace("{{user.name}}", user.name)
      //   .replace("{{user.email}}", user.email)
      //   .replace("{{url}}", base_url)
      //   .replace("{{password}}", password);

      // sendEmail(user.email, "Account Created", personalizedEmailTemplate);
      const data1 = {
        user: {
          id: user.id,
        },
      };
      const authToken = jwt.sign(data1, JWT_SECRET);
      success = true;
      const data = {
        user,
      };
      const response = {
        data,
        authToken,
        message:
          "Account created successfully.Please enter credentials and login.",
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
//login user
router.post(
  "/login",
  [
    body("email", "Enter Valid Email").isEmail(),
    body("password", "Password can not be blank").exists(),
  ],
  login
);



router.put(
  "/user/update",
  upload.single("file"),
  async (req, res) => {
    try {
      //let findUser  = await Users.findOne({_id:req.body.id});
      let success = false;
      let id = req.body._id;
      const user = await Users.findOne({ _id: id });

      const usr = await Users.findOne({
        email: req.body.email,
        _id: { $ne: id },
      });

      if (user && usr !== "" && usr !== null) {
        return res.status(400).json({
          message: "Sorry a user already exist with this email.",
          success,
        });
      }
      let fileName;
      let userImg;
      if (req.file) {
        // If a new file is provided, delete the current file
        fileName = await imageSave("users", req.file);
      } else {
        fileName = user?.image;
      }
      await Users.updateOne(
        { _id: id },
        {
          $set: {
            name: req.body.name,
            email: req.body.email,
            status: req.body.status,
            image: fileName,
            profile_updated: true,
            address: req.body.address,
            phone: req.body.phone,
            phone2: req.body.phone2,
            city: req.body.city,
            distric: req.body.distric,
            qulification: req.body.qulification,
            experience: req.body.experience,
            bio: req.body.bio,
          },
        }
      );
      const updatedUser = await Users.findOne({ _id: id }).select("-password");
      success = true;
      const data = {
        user: updatedUser,
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
  }
);

router.get("/user/edit/:id", FindUser);
router.delete("/user/delete/:id", checkLogin, deleteUser);
router.post("/add/schedule", checkLogin, addSchedule);
router.post("/edit/schedule", checkLogin, editSchedule);
router.get("/get/doctors", checkLogin, getDoctors);
function generateRandomPassword() {
  const length = 8;
  const charset = "0123456789";
  let password = "";

  for (let i = 0; i < length; i++) {
    const randomIndex = Math.floor(Math.random() * charset.length);
    password += charset[randomIndex];
  }

  return password;
}

module.exports = router;
