const jwt = require("jsonwebtoken");
const userServices = require("../services/userServices");
const adminServices = require("../services/adminServices");
const driverServices = require("../services/driverServices");

exports.userIsAuth = async (req, res, next) => {
  let decodedToken;
  try {
    const token = req.get("Authorization").split(" ")[1];
    decodedToken = jwt.verify(token, process.env.SECRET);
  } catch (err) {
    err.statusCode = 403;
    next(err);
  }
  if (!decodedToken) {
    const error = new Error("Authorization faild!");
    error.statusCode = 401;
    next(error);
  }
  if (decodedToken.role !== "user") {
    const error = new Error("Authorization faild!");
    error.statusCode = 403;
    next(error);
  }
  const user = await userServices.findUserById(decodedToken.userId);
  if (!user || user.role !== "user" || user.isBlocked) {
    const error = new Error("Authorization faild!");
    error.statusCode = 403;
    next(error);
  }
  req.userId = decodedToken.userId;
  next();
};

exports.adminIsAuth = async (req, res, next) => {
  let decodedToken;
  try {
    const token = req.get("Authorization").split(" ")[1];
    decodedToken = jwt.verify(token, process.env.SECRET);
  } catch (err) {
    err.statusCode = 403;
    next(err);
  }
  if (!decodedToken) {
    const error = new Error("Authorization faild!");
    error.statusCode = 401;
    next(error);
  }
  if (decodedToken.role !== "admin") {
    const error = new Error("Authorization faild!");
    error.statusCode = 403;
    next(error);
  }
  const admin = await adminServices.getAdmin(decodedToken.adminId);
  if (!admin || admin.role !== "admin") {
    const error = new Error("Authorization faild!");
    error.statusCode = 403;
    next(error);
  }
  req.adminId = admin._id;
  next();
};

exports.scIsAuth = async (req, res, next) => {
  let decodedToken;
  try {
    const token = req.get("Authorization").split(" ")[1];
    decodedToken = jwt.verify(token, process.env.SECRET);
  } catch (err) {
    err.statusCode = 403;
    next(err);
  }
  if (!decodedToken) {
    const error = new Error("Authorization faild!");
    error.statusCode = 401;
    next(error);
  }
  if (decodedToken.role !== "service center") {
    const error = new Error("Authorization faild!");
    error.statusCode = 403;
    next(error);
  }
  const sc = await adminServices.getAdmin(decodedToken.adminId);
  const serviceCenter = await adminServices.serviceCenter(sc.serviceCenterId);
  console.log(serviceCenter);
  if (!sc || sc.role !== "service center" || !serviceCenter.isActive) {
    const error = new Error("Authorization faild!");
    error.statusCode = 403;
    next(error);
  }
  req.sc = sc;
  next();
};

exports.driverIsAuth = async (req, res, next) => {
  let decodedToken;
  try {
    const token = req.get("Authorization").split(" ")[1];
    decodedToken = jwt.verify(token, process.env.SECRET);
  } catch (err) {
    err.statusCode = 403;
    next(err);
  }
  if (!decodedToken) {
    const error = new Error("Authorization faild!");
    error.statusCode = 401;
    next(error);
  }
  if (decodedToken.role !== "driver") {
    const error = new Error("Authorization faild!");
    error.statusCode = 403;
    next(error);
  }
  const driver = await driverServices.findDriver(decodedToken.driverId);
  if (!driver || driver.role !== "driver" || !driver.isActive) {
    const error = new Error("Authorization faild!");
    error.statusCode = 403;
    next(error);
  }
  req.driverId = driver._id;
  next();
};
