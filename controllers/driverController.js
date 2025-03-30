const bcrypt = require("bcryptjs");
const orderServices = require("../services/orderServices");
const adminServices = require("../services/adminServices");
const driverServices = require("../services/driverServices");

exports.postSubmitDriverApplication = async (req, res, next) => {
  try {
    const {
      driverName,
      phoneNumber,
      licenseNumber,
      companyName,
      truckNumber,
      password,
    } = req.body;
    const hashedPassword = await bcrypt.hash(password, 12);
    const files = req.files;
    const docs = [];
    if (files.length > 0) {
      for (let file of files) {
        let docUrl = `${req.protocol}s://${req.get("host")}/${file.path}`;
        docs.push(docUrl);
      }
    }
    const driverData = {
      driverName,
      phoneNumber,
      licenseNumber,
      companyName,
      truckNumber,
      driverDocs: docs,
      password: hashedPassword,
      isActive: false,
    };
    const driver = await adminServices.createDriver(driverData);
    if (driver) {
      return res
        .status(200)
        .json({ success: true, message: "Driver created successfully" });
    }
  } catch (err) {
    throw err;
  }
};

exports.getDriverOrders = async (req, res, next) => {
  try {
    const driverId = req.driverId;
    const orders = await orderServices.driverRescueOrders(driverId);
    let totalPaid = 0;
    for (let order of orders) {
      totalPaid += order.rescuePrice;
    }
    res.status(200).json({ success: true, orders, totalPaid });
  } catch (err) {
    next(err);
  }
};

exports.setDriverConnectionStatus = async (req, res, next) => {
  try {
    const status = req.body.status;
    const driverId = req.driverId;
    await driverServices.setDriverConnStatus(driverId, status);
    res.status(201).json({
      success: true,
      message: `Driver ${status ? "online" : "offline"}`,
    });
  } catch (err) {
    next(err);
  }
};
