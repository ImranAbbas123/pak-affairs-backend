const express = require("express");
const sendEmail = require("../../../config/sendEmail");
const path = require("path");
const fs = require("fs");
const router = express.Router();
router.post("/send/mail", async (req, res) => {
  const emailTemplatePath = path.join(
    __dirname,
    "..",
    "..",
    "..",
    "config",
    "email",
    "contact-us.html"
  );
  const emailTemplate = fs.readFileSync(emailTemplatePath, "utf-8");

  const personalizedEmailTemplate = emailTemplate
    .replace("{{name}}", req.body.name)
    .replace("{{email}}", req.body.email)
    .replace("{{phone}}", req.body.phone)
    .replace("{{message}}", req.body.message);

  sendEmail(
    "imran.abbas@baramdatsol.com",
    "Contact Us",
    personalizedEmailTemplate
  );
  const response = {
    message: "Account created successfully.Please enter credentials and login.",
    success: true,
  };
  return res.json(response);
});
module.exports = router;
