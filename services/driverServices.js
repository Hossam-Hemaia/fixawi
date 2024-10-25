const Driver = require("../models/driver");
const DriverLog = require("../models/driverLog");
const utilities = require("../utils/utilities");

exports.getDriverByUsername = async (username) => {
  try {
    const driver = await Driver.findOne({ phoneNumber: username });
    if (!driver) {
      throw new Error("Incorrect username");
    }
    return driver;
  } catch (err) {
    throw err;
  }
};

exports.findDriver = async (driverId) => {
  try {
    const driver = await Driver.findById(driverId);
    return driver;
  } catch (err) {
    throw err;
  }
};

exports.findDriverLog = async (driverId) => {
  try {
    const driverLog = await DriverLog.findOne({ driverId });
    if (!driverLog) {
      return { hasLog: false };
    } else {
      return { hasLog: true };
    }
  } catch (err) {
    throw new Error(err);
  }
};

exports.createDriverLog = async (driverData) => {
  try {
    const driverLog = new DriverLog(driverData);
    await driverLog.save();
    const driver = await this.findDriver(driverData.driverId);
    driver.driverLogId = driverLog._id;
    await driver.save();
    return driverLog;
  } catch (err) {
    throw new Error(err);
  }
};

exports.updateDriverLog = async (driverData) => {
  try {
    const filter = { driverId: driverData.driverId };
    const updateData = {};
    for (let key in driverData) {
      if (driverData[key] !== "" && key !== "driverId") {
        updateData[key] = driverData[key];
      }
    }
    await DriverLog.updateOne(filter, updateData);
  } catch (err) {
    throw new Error(err);
  }
};

exports.findClosestDriver = async (coords) => {
  try {
    const nearestDrivers = await DriverLog.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: coords,
          },
        },
      },
      hasOrder: false,
      driverOnline: true,
    });
    return nearestDrivers;
  } catch (err) {
    throw err;
  }
};

exports.sendOrder = async (username, order) => {
  try {
    const io = require("../socket").getIo();
    const driverSocket = await utilities.getSocketId(username);
    io.to(driverSocket).emit("order_assigned", order);
  } catch (err) {
    throw err;
  }
};

exports.assignDriver = async (driverId) => {
  try {
    const driverLog = await DriverLog.findOne({ driverId });
    driverLog.hasOrder = true;
    await driverLog.save();
  } catch (err) {
    throw new Error(err);
  }
};

exports.suspendDriver = async (driverId) => {
  try {
    const driverLog = await DriverLog.findOne({ driverId: driverId });
    driverLog.driverSuspended = true;
    await driverLog.save();
    setTimeout(async () => {
      const driverLog = await DriverLog.findOne({ driverId: driverId });
      driverLog.driverSuspended = false;
      await driverLog.save();
    }, 60 * 1000);
  } catch (err) {
    throw err;
  }
};
