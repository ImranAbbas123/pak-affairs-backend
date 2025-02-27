const express = require("express");
const Newsletter = require("../../models/NewsLetter");

const router = express.Router();
router.post("/subscribe", async (req, res) => {
    try {
  const { email } = req.body;       
  const newsletter = await Newsletter.findOne({ email });
  if (newsletter) {
    return res.json({ message: "Email already exists", success: false });
  }
  const newNewsletter = new Newsletter({ email });
  await newNewsletter.save();
  const response = {
    message: "Email subscribed successfully",
    success: true,
  };
  return res.json(response);
} catch (error) {
  return res.json({ message: error.message, success: false });
}
});
module.exports = router;
