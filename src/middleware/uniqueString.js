const crypto = require("crypto");
const uniqueString = (req, res, next) => {
  // get user from the jwt token add to id to  req

  try {
    const buffer = crypto.randomBytes(10);
    return buffer.toString("hex");
  } catch (error) {
    res.status(401).json({ errors: "Please authenticate using valid token." });
  }
};

module.exports = uniqueString;
