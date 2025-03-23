const { check, validationResult } = require("express-validator");
const createError = require("http-errors");
const User = require("../../models/User");

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
];

function addUserValidationHandler(req, res, next) {
  const error = validationResult(req);
  const mappedError = error.mapped();

  if (Object.keys(mappedError).length === 0) {
    next();
  } else {
    res.status(500).json({
      errors: mappedError,
    });
  }
}

module.exports = {
  userValidation,
  addUserValidationHandler,
};
