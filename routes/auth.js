const express = require("express");
const bcrypt = require("bcryptjs");
const User = require("../models/user");
const Driver = require("../models/driver");
const validators = require("../middleware/validators");
const authController = require("../controllers/authController");

const router = express.Router();

router.post(
  "/create/user",
  [
    validators.validateFullName,
    validators.validatePhoneNumber.custom(async (value, { req }) => {
      if (req.url === "/create/user" && req.body.authMethod === "phone") {
        const user = await User.findOne({ phoneNumber: value });
        if (user) {
          const error = new Error("Phone number is already registered!");
          error.statusCode = 422;
          throw error;
        }
      }
    }),
    validators.validateEmail.custom(async (value, { req }) => {
      if (req.url === "/create/user" && req.body.authMethod === "email") {
        const user = await User.findOne({ email: value });
        if (user) {
          const error = new Error("Email is already registered!");
          error.statusCode = 422;
          throw error;
        }
      }
    }),
    validators.validatePassword.custom(async (value, { req }) => {
      if (req.url === "/create/user") {
        if (value !== req.body.confirmPassword) {
          const error = new Error("password does not match!");
          error.statusCode = 422;
          throw error;
        }
      }
    }),
  ],
  authController.postCreateUser
);

router.post(
  "/login",
  [
    validators.validateLoginMethod.custom(async (value, { req }) => {
      if (req.url === "/login") {
        let user;
        if (value === "email") {
          user = await User.findOne({ email: req.body.username });
          if (!user) {
            const error = new Error("incorrect email!");
            error.statusCode = 422;
            throw error;
          } else if (user.isBlocked) {
            const error = new Error("User is blocked!");
            error.statusCode = 422;
            throw error;
          }
        } else if (value === "phone") {
          user = await User.findOne({ phoneNumber: req.body.username });
          if (!user) {
            const error = new Error("incorrect phone number!");
            error.statusCode = 422;
            throw error;
          } else if (user.isBlocked) {
            const error = new Error("User is blocked!");
            error.statusCode = 422;
            throw error;
          }
        }
        const doMatch = await bcrypt.compare(req.body.password, user.password);
        if (!doMatch) {
          const error = new Error("incorrect password!");
          error.statusCode = 422;
          throw error;
        } else {
          req.user = user;
        }
      }
    }),
  ],
  authController.postLogin
);

router.post("/create/admin", authController.postCreateAdmin);

router.post("/admin/login", authController.postAdminLogin);

router.post("/driver/login", authController.postDriverLogin);

router.post("/generate/access/token", authController.postGenerateAccessToken);

router.post("/verify/account", authController.postverifyAccount);

router.get("/resend/verification/code", authController.getNewVerificationCode);

router.post(
  "/reset/password",
  [
    validators.validatePassword.custom((value, { req }) => {
      if (req.url === "/reset/password") {
        if (value !== req.body.confirmPassword) {
          throw new Error("Password does not match!");
        }
      }
    }),
  ],
  authController.postResetPassword
);

router.get("/auth/google", authController.getGoogleUrl);

router.get("/auth/google/callback", authController.postGoogleAuth);

module.exports = router;
