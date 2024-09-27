const { body } = require("express-validator");

module.exports = {
  validateFullName: body("fullName")
    .isString()
    .notEmpty()
    .withMessage("your full name is required!"),
  validatePhoneNumber: body("phoneNumber")
    .trim()
    .isString()
    .notEmpty()
    .isLength({ min: 8, max: 11 })
    .withMessage("Phone Number is required, and must be valid phone number!"),
  validateEmail: body("email")
    .trim()
    .isEmail()
    .withMessage("Please enter valid email!"),
  validatePassword: body("password")
    .trim()
    .notEmpty()
    .isLength({ min: 8 })
    .withMessage("invalid password requirements"),
  validateLoginMethod: body("authMethod"),
};
