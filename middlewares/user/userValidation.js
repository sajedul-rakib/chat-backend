const { check, validationResult } = require("express-validator");
const createError = require("http-errors");
const path = require("path");
const User = require("../../models/User");
const { unlink } = require("fs");

const userValidation = [
  check("fullName")
    .isLength({ min: 1 })
    .withMessage("Name is required and name must be atleast 4 characters")
    .isAlpha("en-US", { ignore: " -" })
    .withMessage("Name must be contain alphabet not character")
    .trim(),
  check("email")
    .isEmail()
    .withMessage("Invalid email")
    .trim()
    .custom(async (value) => {
      try {
        const findUserByEmail = await User.findOne({ email: value });
        if (findUserByEmail) throw createError("This email already exist");
      } catch (err) {
        throw createError(err.message);
      }
    }),
  check("password")
    .isStrongPassword()
    .withMessage(
      "Password must be at least 8 characters logn should contain 1 lowercase 1 upercase 1 number and 1 symbol"
    ),
  check("gender").isLength({ min: 1 }).withMessage("Enter your gender"),
];

const addUserValidationHandler = function (req, res, next) {
  const errors = validationResult(req);
  const mappedErrors = errors.mapped();
  if (Object.keys(mappedErrors).length === 0) {
    next();
  } else {
    // remove uploaded files
    if (req.files.length > 0) {
      const { filename } = req.files[0];
      unlink(
        path.join(__dirname, `../../public/uploads/avatars/${filename}`),
        (err) => {
          if (err) console.log("error from add user validation handler" + err);
        }
      );
    }

    // response the errors
    console.log(mappedErrors);

    res.status(500).json({
      errors: mappedErrors,
    });
  }
};

module.exports = {
  userValidation,
  addUserValidationHandler,
};
