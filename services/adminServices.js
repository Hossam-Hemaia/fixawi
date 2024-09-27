const Admin = require("../models/admin");
const PriceList = require("../models/priceList");
const ServiceCenter = require("../models/service_center");
const ObjectId = require("mongoose").Types.ObjectId;

exports.createAdmin = async (adminData) => {
  try {
    const admin = new Admin(adminData);
    await admin.save();
    return admin;
  } catch (err) {
    throw err;
  }
};

exports.updateAdmin = async (adminId, adminData) => {
  try {
    const updateData = {};
    for (let key in adminData) {
      if (adminData[key] !== "") {
        updateData[key] = adminData[key];
      }
    }
    await Admin.findByIdAndUpdate(adminId, updateData);
  } catch (err) {
    throw err;
  }
};

exports.getAdminByUsername = async (username) => {
  try {
    const admin = await Admin.findOne({ username });
    return admin;
  } catch (err) {
    throw err;
  }
};

exports.getAdmin = async (adminId) => {
  try {
    const admin = await Admin.findById(adminId);
    return admin;
  } catch (err) {
    throw err;
  }
};

exports.createServiceCenter = async (serviceCenterData) => {
  try {
    const serviceCenter = new ServiceCenter(serviceCenterData);
    await serviceCenter.save();
    return serviceCenter;
  } catch (err) {
    throw err;
  }
};

exports.allServiceCenters = async () => {
  try {
    const serviceCenters = await ServiceCenter.find();
    return serviceCenters;
  } catch (err) {
    throw err;
  }
};

exports.serviceCenter = async (serviceCenterId) => {
  try {
    const serviceCenter = await ServiceCenter.findById(serviceCenterId);
    return serviceCenter;
  } catch (err) {
    throw err;
  }
};

exports.updateServiceCenter = async (serviceCenterId, serviceCenterData) => {
  try {
    const updateData = {};
    for (let key in serviceCenterData) {
      if (serviceCenterData[key] !== "") {
        updateData[key] = serviceCenterData[key];
      }
    }
    await ServiceCenter.findByIdAndUpdate(serviceCenterId, updateData);
    const serviceCenter = await ServiceCenter.findById(serviceCenterId);
    return serviceCenter;
  } catch (err) {
    next(err);
  }
};

exports.removeServiceCenter = async (serviceCenterId) => {
  try {
    await ServiceCenter.findByIdAndDelete(serviceCenterId);
    return true;
  } catch (err) {
    throw err;
  }
};

exports.joinRequests = async () => {
  try {
    const requests = await ServiceCenter.find({ isApproved: false });
    return requests;
  } catch (err) {
    throw err;
  }
};

exports.createList = async (serviceCenterId, priceListData) => {
  try {
    let priceList = await PriceList.findOne({ serviceCenterId });
    if (priceList) {
      await priceList.addToList(priceListData);
      return true;
    } else {
      priceList = new PriceList({
        serviceCenterId,
        priceList: priceListData,
      });
      await priceList.save();
      return priceList;
    }
  } catch (err) {
    throw err;
  }
};

exports.editList = async (serviceCenterId, priceListData) => {
  try {
    const priceList = await PriceList.findOne({ serviceCenterId });
    await priceList.modifyList(priceListData);
    return true;
  } catch (err) {
    throw err;
  }
};

exports.approveModifiedService = async (modifiedData) => {
  try {
    const priceList = await PriceList.findById(modifiedData.priceListId);
    if (!priceList) {
      const error = new Error("Price list does not exist!");
      error.statusCode = 404;
      throw error;
    }
    await priceList.modifyService(modifiedData);
  } catch (err) {
    throw err;
  }
};
