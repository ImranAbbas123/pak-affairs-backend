var jwt = require("jsonwebtoken");
const JWT_SECRET = "fastlobby";
const Users = require("../models/Users");


const verifyTokenAndGetUser = async (token) => {
    try {
      const data = jwt.verify(token, JWT_SECRET);
      const userId = data.user.id;
      // Assuming you have a User model defined (e.g., with Mongoose)
      const user = await Users.findById(userId);
      return user;
    } catch (error) {
      // Token verification failed, return null or handle the error as needed
      console.error('Error verifying token:', error.message);
      return null;
    }
  };

  module.exports = verifyTokenAndGetUser;