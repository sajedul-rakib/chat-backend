const express = require("express");
const jwt = require("jsonwebtoken");

//internal package
const checkLogIn = require("../middlewares/checkLogin");
const {
  userValidation,
  addUserValidationHandler,
} = require("../middlewares/user/userValidation");
const {
  singUpController,
  signInController,
} = require("../controllers/userController");

//User model
const User = require("../models/User");

const userRouter = express.Router();

//SIGN UP USER
userRouter.post(
  "/signup",
  userValidation,
  addUserValidationHandler,
  singUpController
);

//SIGN IN USER
userRouter.post("/signin", signInController);

//GET USER DETAILS
userRouter.get("/userDetail", checkLogIn, async (req, res) => {
  try {
    const user = await User.findById(req.userId, { password: 0, __v: 0 });
    res.status(200).json({
      message: "Ok",
      user,
    });
  } catch (err) {
    res.json({ err });
  }
});

module.exports = {
  userRouter,
};
