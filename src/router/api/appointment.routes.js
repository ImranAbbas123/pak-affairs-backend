const express = require("express");
var bcrypt = require("bcryptjs");
const checkLogin = require("../../middleware/checkLogin");
const Appointment = require("../../models/Appointment");
const path = require("path");
const fs = require("fs");
const { exec } = require("child_process");
var jwt = require("jsonwebtoken");
const mediaPath = process.env.MEDIA_PATH;
const { body, validationResult } = require("express-validator");
const multer = require("multer");
const upload = multer();
const router = express.Router();
const sendEmail = require("../../../config/sendEmail");

const {
  addAppointment,
  downLoadPdf,
} = require("../../controllers/appointment.controller");
router.post("/add/appointment", addAppointment);
router.get("/download/appointment/:id", downLoadPdf);
module.exports = router;
