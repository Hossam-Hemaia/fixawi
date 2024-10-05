const ServiceCenter = require("../models/service_center");
const ServiceCategory = require("../models/service_types");
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
