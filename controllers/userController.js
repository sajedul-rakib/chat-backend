//external package
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const { unlink } = require("fs");

//internal package
const User = require("../models/User");

//sign up controller
async function singUpController(req, res) {
  try {
    const { fullName, email, password, gender } = req.body;
    // const profilePic =
    //   req.files.length > 0
    //     ? `${process.env.APP_URL}/public/uploads/avatars/${req.files[0].filename}`
    //     : "";

    const profilePic =
      req.files.length > 0
        ? `/public/uploads/avatars/${req.files[0].filename}`
        : "";

    //hashing password
    const hashPassword = await bcrypt.hash(password, 10);

    //create new user
    const user = new User({
      fullName,
      email,
      gender,
      password: hashPassword,
      profilePic: profilePic,
    });

    //save the user
    await user.save();

    res.status(200).json({
      message: "Sign up successfully",
    });
  } catch (err) {
    if (req.files) {
      const filename = req.files[0].filename;
      unlink(path.join(__dirname, "../public/uploads/avatars", filename));
    }
    console.log(err);

    res.status(401).json({
      errors: {
        common: {
          error: err,
          msg: err.message,
        },
      },
    });
  }
}

//sign in controller
async function signInController(req, res) {
  try {
    const { email, password, fcmToken } = req.body;
    //find user by email
    const findUser = await User.find({ email: email });
    if (findUser && findUser.length > 0) {
      //compare the paswword
      const isMatchPassword = await bcrypt.compare(
        password,
        findUser[0].password
      );

      if (isMatchPassword) {
        //json web token
        const token = jwt.sign(
          {
            id: findUser[0]._id,
            fullName: findUser[0].fullName,
            email: findUser[0].email,
          },
          process.env.JWT_SECRET_KEY,
          {
            algorithm: "HS256",
          }
        );
        //save user device toke while we want to send notification we can use this token [FCMTOKEN]
        await User.updateOne({ email: email }, { fcmToken: fcmToken });

        //response
        res.status(200).json({
          message: "Log In successfull",
          token,
          id: findUser[0]._id,
        });
      } else {
        res.status(401).json({
          errors: {
            common: {
              msg: "Authentication failed",
            },
          },
        });
      }
    } else {
      res.status(404).json({
        errors: {
          common: {
            msg: "User not found",
          },
        },
      });
    }
  } catch (err) {
    console.log(err);
    res.status(401).json({
      errors: {
        common: {
          msg: err,
        },
      },
    });
  }
}

//get user data
async function getUserDataController(req, res) {
  try {
    const findUser = await User.findById(req.body.id);

    res.status(200).json({
      data: findUser,
    });
  } catch (err) {
    res.status(400).json({
      errors: {
        common: {
          msg: err,
        },
      },
    });
  }
}
module.exports = {
  singUpController,
  signInController,
  getUserDataController,
};
