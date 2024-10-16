const ServiceCenter = require("../models/service_center");
const ServiceCategory = require("../models/service_types");
const Visit = require("../models/visit");
const PriceList = require("../models/priceList");

exports.servicesCategories = async () => {
  try {
    const categories = await ServiceCategory.find({ isAvailable: true });
    return categories;
  } catch (err) {
    throw err;
  }
};

exports.setPriceListDisapproved = async (priceListId) => {
  try {
    const priceList = await PriceList.findById(priceListId);
    priceList.priceListApporved = false;
    await priceList.save();
  } catch (err) {
    throw err;
  }
};

exports.getServiceCenter = async (serviceCenterId) => {
  try {
    const serviceCenter = await ServiceCenter.findById(serviceCenterId);
    return serviceCenter;
  } catch (err) {
    next(err);
  }
};

exports.getUserServiceCenter = async (serviceCenterId) => {
  try {
    const serviceCenter = await ServiceCenter.findById(serviceCenterId, {
      username: 0,
      password: 0,
      createdAt: 0,
      updatedAt: 0,
    }).populate(["ratingId", "offerId"]);
    return serviceCenter;
  } catch (err) {
    throw err;
  }
};

exports.visits = async (serviceCenterId) => {
  try {
    const visits = await Visit.find({ serviceCenterId }).populate([
      "userId",
      "serviceCenterId",
    ]);
    return visits;
  } catch (err) {
    throw err;
  }
};
