//external package
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

//internal package
const User = require("../models/User");

//sign up controller
async function singUpController(req, res) {
  try {
    const { fullName, email, password, gender } = req.body;

    //hashing password
    const hashPassword = await bcrypt.hash(password, 10);

    //create new user
    const user = new User({
      fullName,
      email,
      gender,
      password: hashPassword,
    });

    //save the user
    await user.save();

    res.status(200).json({
      message: "Sign up successfully",
    });
  } catch (err) {
    res.status(401).json({
      errors: {
        common: {
          msg: err.message,
        },
      },
    });
  }
}

//sign in controller
async function signInController(req, res) {
  try {
    const { email, password } = req.body;
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
    res.status(401).json({
      errors: {
        common: {
          msg: "Authentication failed",
        },
      },
    });
  }
}

module.exports = {
  singUpController,
  signInController,
};
