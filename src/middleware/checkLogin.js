var jwt = require('jsonwebtoken');
const JWT_SECRET = 'docinfo';
const checkLogin = (req, res, next) => {
  // get user from the jwt token add to id to  req
  const token = req.header('auth-token');

  if (!token) {
    res.status(401).json({ errors: 'Please authenticate using valid token.' });
  }
  try {
    const data = jwt.verify(token, JWT_SECRET);

    req.user = data.user;
    next();
  } catch (error) {
    res.status(401).json({ errors: 'Please authenticate using valid token.' });
  }
};

module.exports = checkLogin;
