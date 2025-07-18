const jwt = require("jsonwebtoken");
const User = require("../models/User");

const checkLogIn = async (req, res, next) => {
  try {
    const { authorization } = req.headers;
    const token = authorization.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY);
    const { id, fullName, email } = decoded;
    const user = await User.findById(id);
    req.user = user;
    req.userId = id;
    req.fullName = fullName;
    req.email = email;
    next();
  } catch (err) {
    next("Unauthorized user");
  }
};

module.exports = checkLogIn;
