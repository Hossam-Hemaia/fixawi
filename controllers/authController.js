const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { validationResult } = require("express-validator");
const { google } = require("googleapis");
const { OAuth2Client } = require("google-auth-library");
const adminServices = require("../services/adminServices");
const userServices = require("../services/userServices");
const driverServices = require("../services/driverServices");
const utilities = require("../utils/utilities");

exports.postCreateUser = async (req, res, next) => {
  try {
    const { fullName, phoneNumber, email, authMethod, userCars, password } =
      req.body;
    const error = validationResult(req);
    if (!error.isEmpty() && error.array()[0].msg !== "Invalid value") {
      const errorMsg = new Error(error.array()[0].msg);
      errorMsg.statusCode = 422;
      throw errorMsg;
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const userData = {
      fullName,
      phoneNumber,
      email,
      authMethod,
      userCars,
      password: hashedPassword,
    };
    const user = await userServices.createUser(userData);
    if (user) {
      if (user.authMethod === "email") {
        utilities.emailSender(email, user.verificationCode, "confirmation");
      } else if (user.authMethod === "phone") {
        user.isActive = true;
        await user.save();
      }
      res.status(200).json({
        success: true,
        message: "Welcom aboard!, your account has been created successfully",
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.postCreateAdmin = async (req, res, next) => {
  try {
    const { fullName, username, password } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    const adminData = {
      fullName,
      username,
      password: hashedPassword,
    };
    const admin = await adminServices.createAdmin(adminData);
    if (admin) {
      return res
        .status(201)
        .json({ success: true, message: "New admin created" });
    }
  } catch (err) {
    next(err);
  }
};

exports.postAdminLogin = async (req, res, next) => {
  try {
    const { username, password } = req.body;
    const admin = await adminServices.getAdminByUsername(username);
    const passMatch = bcrypt.compare(password, admin.password);
    if (!passMatch) {
      throw new Error("Incorrect password!");
    }
    const token = jwt.sign(
      {
        adminId: admin._id,
        role: admin.role,
      },
      process.env.SECRET,
      { expiresIn: "1y" }
    );
    res.status(201).json({ success: true, token, admin });
  } catch (err) {
    next(err);
  }
};

exports.postLogin = async (req, res, next) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty() && error.array()[0].msg !== "Invalid value") {
      const errorMsg = new Error(error.array()[0].msg);
      errorMsg.statusCode = 422;
      throw errorMsg;
    }
    const user = req.user;
    if (!user.isActive) {
      const error = new Error(
        "Your account is suspended!, please contact system administrator"
      );
      error.statusCode = 422;
      throw error;
    } else {
      const token = jwt.sign(
        { userId: user._id.toString(), role: user.role },
        process.env.SECRET,
        { expiresIn: "30d" }
      );
      const refreshToken = jwt.sign({}, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "1y",
        audience: user._id.toString(),
      });
      res.status(201).json({ success: true, user, token, refreshToken });
    }
  } catch (err) {
    next(err);
  }
};

exports.postDriverLogin = async (req, res, next) => {
  try {
    const { phoneNumber, location, password } = req.body;
    const driver = await driverServices.getDriverByUsername(phoneNumber);
    const passwordMatch = bcrypt.compare(password, driver.password);
    if (!passwordMatch) {
      throw new Error("Incorrect password!");
    }
    if (!driver.isActive) {
      throw new Error(
        "Driver account is not active, contact system administrator"
      );
    }
    let driverData;
    const coords = {
      type: "Point",
      coordinates: [location.lat, location.lng],
    };
    const { hasLog } = await driverServices.findDriverLog(driver._id);
    if (hasLog) {
      driverData = {
        driverId: driver._id,
        location: coords,
        openDate: new Date(),
        driverOnline: true,
      };
      await driverServices.updateDriverLog(driverData);
    } else {
      driverData = {
        driverId: driver._id,
        phoneNumber: driver.phoneNumber,
        driverName: driver.driverName,
        location: coords,
        driverOnline: true,
      };
      await driverServices.createDriverLog(driverData);
    }
    const token = jwt.sign(
      { driverId: driver._id.toString(), role: driver.role },
      process.env.SECRET,
      { expiresIn: "30d" }
    );
    const refreshToken = jwt.sign({}, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "1y",
      audience: driver._id.toString(),
    });
    res.status(201).json({ success: true, driver, token, refreshToken });
  } catch (err) {
    next(err);
  }
};

exports.postverifyAccount = async (req, res, next) => {
  try {
    const { username, code } = req.body;
    const user = await userServices.getUserByUsername(username);
    const date = Date.now();
    if (
      date <= Date.parse(user.codeExpiry) &&
      `${code}` === user.verificationCode
    ) {
      const token = jwt.sign(
        {
          userId: user._id,
          verified: user.verified,
          role: "user",
        },
        process.env.SECRET,
        { expiresIn: "30d" }
      );
      const refreshToken = jwt.sign({}, process.env.REFRESH_TOKEN_SECRET, {
        expiresIn: "1y",
        audience: user._id.toString(),
      });
      await userServices.setUserActive(user._id, true);
      return res.status(200).json({
        success: true,
        message: "code verification successful!",
        token,
        refreshToken,
      });
    } else {
      return res
        .status(422)
        .json({ success: false, message: "invalid code or code expired!" });
    }
  } catch (err) {
    next(err);
  }
};

exports.getNewVerificationCode = async (req, res, next) => {
  try {
    const username = req.query.username;
    const user = await userServices.resendCode(username);
    if (user.authMethod === "email") {
      await utilities.emailSender(
        user.email,
        user.verificationCode,
        "confirmation"
      );
    } else if (user.authMethod === "phone") {
      // use otp api here to send code
    }
    res.status(200).json({
      success: true,
      message: `Code sent to your ${
        user.authMethod === "email" ? "email address" : "phone number"
      }`,
    });
  } catch (err) {
    next(err);
  }
};

exports.postGenerateAccessToken = async (req, res, next) => {
  try {
    const refreshToken = req.body.refreshToken;
    const verifiedToken = jwt.verify(
      refreshToken,
      process.env.REFRESH_TOKEN_SECRET
    );
    const user = await userServices.findUserById(verifiedToken.aud);
    if (!user) {
      throw new Error("Invalid user id!");
    }
    const token = jwt.sign(
      {
        userId: user._id,
        role: user.role,
      },
      process.env.SECRET,
      { expiresIn: "30d" }
    );
    const newRefreshToken = jwt.sign({}, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "1y",
      audience: user._id.toString(),
    });
    res
      .status(201)
      .json({ success: true, token, refreshToken: newRefreshToken });
  } catch (err) {
    next(err);
  }
};

exports.postResetPassword = async (req, res, next) => {
  try {
    const error = validationResult(req);
    if (!error.isEmpty() && error.array()[0].msg !== "Invalid value") {
      const errorMsg = new Error(error.array()[0].msg);
      errorMsg.statusCode = 422;
      throw errorMsg;
    }
    const { phoneNumber, code, password } = req.body;
    const user = await userServices.getUserByUsername(phoneNumber);
    const date = Date.now();
    if (
      date <= Date.parse(user.codeExpiry) &&
      `${code}` === user.verificationCode
    ) {
      const hashedPassword = await bcrypt.hash(password, 12);
      user.password = hashedPassword;
      await user.save();
      return res
        .status(201)
        .json({ success: true, message: "Your password has been reset" });
    }
  } catch (err) {
    next(err);
  }
};

exports.getGoogleUrl = async (req, res, next) => {
  try {
    const googleClient = new OAuth2Client(
      process.env.GOOGLE_CLIENT_ID,
      process.env.GOOGLE_SECRET,
      process.env.REDIRECT_URI
    );
    const url = googleClient.generateAuthUrl({
      access_type: "offline",
      scope: ["profile", "email"],
    });
    res.status(200).json({ success: true, authUrl: url });
  } catch (err) {
    next(err);
  }
};

exports.postGoogleAuth = async (req, res, next) => {
  const googleClient = new OAuth2Client(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_SECRET,
    process.env.REDIRECT_URI
  );
  const code = req.query.code;
  try {
    const { tokens } = await googleClient.getToken(code);
    googleClient.setCredentials(tokens);
    const { data } = await google
      .oauth2("v2")
      .userinfo.get({ auth: googleClient });
    let user = await userServices.getUserByUsername(data.email);
    if (!user) {
      const userData = {
        fullName: data.name,
        email: data.email,
        authMethod: "Google",
        isActive: true,
      };
      user = await userServices.createUser(userData);
    }
    const token = jwt.sign(
      {
        userId: user._id,
        verified: user.verified,
        role: "user",
      },
      process.env.SECRET,
      { expiresIn: "30d" }
    );
    const refreshToken = jwt.sign({}, process.env.REFRESH_TOKEN_SECRET, {
      expiresIn: "1y",
      audience: user._id.toString(),
    });
    res
      .status(200)
      .redirect(
        `http://localhost:5001?token=${token}&refreshToken=${refreshToken}&userId=${user._id}&hasProfile=${user.hasProfile}`
      );
  } catch (err) {
    next(err);
  }
};
