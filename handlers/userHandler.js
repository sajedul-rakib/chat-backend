const express = require("express");
const jwt = require("jsonwebtoken");

//internal package
const checkLogIn = require("../middlewares/checkLogin");
const {
  userValidation,
  addUserValidationHandler,
} = require("../middlewares/user/userValidation");
const avatarUpload = require("./../middlewares/user/avaterUpload");
const {
  singUpController,
  signInController,
  getUserDataController,
} = require("../controllers/userController");

//User model
const User = require("../models/User");

//user Router
const userRouter = express.Router();

//SIGN UP USER
userRouter.post(
  "/signup",
  avatarUpload,
  userValidation,
  addUserValidationHandler,
  singUpController
);

//SIGN IN USER
userRouter.post("/signin", signInController);

//GET USER DETAILS
userRouter.post("/user-detail", checkLogIn, getUserDataController);

module.exports = userRouter;
