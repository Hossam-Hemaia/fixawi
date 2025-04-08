const Admin = require("../models/admin");
const PriceList = require("../models/priceList");
const Category = require("../models/category");
const SubCategory = require("../models/subCategory");
const Car = require("../models/car");
const ServiceCenter = require("../models/service_center");
const Visit = require("../models/visit");
const Offer = require("../models/offers");
const Promotion = require("../models/promotion");
const ContactUs = require("../models/contact_us");
const Driver = require("../models/driver");
const Settings = require("../models/settings");
const CanceledBooking = require("../models/canceledBookings");
const Check = require("../models/check");
const Wallet = require("../models/wallet");
const Movement = require("../models/movement");

/***************System Users*************/
exports.createAdmin = async (adminData) => {
  try {
    const adminUsername = await Admin.findOne({ username: adminData.username });
    if (adminUsername) {
      throw new error("This username is taken");
    }
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

exports.updateScUser = async (scId, adminData) => {
  try {
    const updateData = {};
    for (let key in adminData) {
      if (adminData[key] !== "") {
        updateData[key] = adminData[key];
      }
    }
    const scUser = await Admin.findOne({ serviceCenterId: scId });
    if (scUser) {
      await Admin.findByIdAndUpdate(scUser._id, updateData);
    }
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

exports.systemUsers = async () => {
  try {
    const users = await Admin.find();
    return users;
  } catch (err) {
    throw err;
  }
};

exports.systemUserDetails = async (userId) => {
  try {
    const user = await Admin.findById(userId);
    return user;
  } catch (err) {
    throw err;
  }
};

exports.updateSystemUser = async (userId, userData) => {
  try {
    const updateData = {};
    for (let key in userData) {
      if (userData[key] !== "") {
        updateData[key] = userData[key];
      }
    }
    const user = await Admin.findByIdAndUpdate(userId, updateData);
    return user;
  } catch (err) {
    throw err;
  }
};

exports.removeSystemUser = async (userId) => {
  try {
    await Admin.findByIdAndDelete(userId);
  } catch (err) {
    throw err;
  }
};
/*************Categories**************/
exports.createMainCategory = async (categoryData) => {
  try {
    const category = new Category(categoryData);
    await category.save();
    return category;
  } catch (err) {
    throw new Error(err);
  }
};

exports.editMainCategory = async (categoryData, categoryId) => {
  try {
    const updateData = {};
    for (let key in categoryData) {
      if (categoryData[key] !== "") {
        updateData[key] = categoryData[key];
      }
    }
    await Category.findByIdAndUpdate(categoryId, updateData);
  } catch (err) {
    throw new Error(err);
  }
};

exports.allCategories = async () => {
  try {
    const categories = await Category.find().populate({
      path: "subCategories",
    });
    return categories;
  } catch (err) {
    throw new Error(err);
  }
};

exports.getCategory = async (categoryId) => {
  try {
    const category = await Category.findById(categoryId);
    return category;
  } catch (err) {
    throw new Error(err);
  }
};

exports.deleteCategory = async (categoryId) => {
  try {
    const category = await Category.findById(categoryId);
    if (category.subCategories.length > 0) {
      throw new Error(
        "You cannot remove category that have sub-categories! remove sub-categories first"
      );
    }
    await Category.findByIdAndDelete(categoryId);
    return true;
  } catch (err) {
    throw new Error(err);
  }
};

exports.addSubCategoryId = async (mainCategoryId, subCategoryId) => {
  try {
    const category = await Category.findById(mainCategoryId);
    category.subCategories.push(subCategoryId);
    await category.save();
  } catch (err) {
    throw err;
  }
};

exports.removeSubCategoryId = async (mainCategoryId, subCategoryId) => {
  try {
    const category = await Category.findById(mainCategoryId);
    let newSubCategoryIds;
    if (category.subCategories.length > 0) {
      newSubCategoryIds = category.subCategories.filter((cate) => {
        return cate._id.toString() !== subCategoryId.toString();
      });
    }
    if (newSubCategoryIds) {
      category.subCategories = newSubCategoryIds;
    }
    await category.save();
    return true;
  } catch (err) {
    throw err;
  }
};

/****************Sub-Category******************/
exports.createSubCategory = async (categoryData) => {
  try {
    const subCategory = new SubCategory(categoryData);
    await subCategory.save();
    await this.addSubCategoryId(categoryData.mainCategoryId, subCategory._id);
    return true;
  } catch (err) {
    throw err;
  }
};

exports.allSubCategories = async () => {
  try {
    const subCategories = await SubCategory.find().populate(["mainCategoryId"]);
    return subCategories;
  } catch (err) {
    throw err;
  }
};

exports.getSubCategory = async (subCategoryId) => {
  try {
    const subCategory = await SubCategory.findById(subCategoryId);
    return subCategory;
  } catch (err) {
    throw err;
  }
};

exports.editSubCategory = async (subCategoryData, subCategoryId) => {
  try {
    const updateData = {};
    for (let key in subCategoryData) {
      if (subCategoryData[key] !== "" && !Array.isArray(key)) {
        updateData[key] = subCategoryData[key];
      }
    }
    await SubCategory.findByIdAndUpdate(subCategoryId, updateData);
  } catch (err) {
    throw new Error(err);
  }
};

exports.removeSubcategory = async (subCategoryId) => {
  try {
    const subCategory = await SubCategory.findById(subCategoryId);
    await this.removeSubCategoryId(subCategory.mainCategoryId, subCategoryId);
    await SubCategory.findByIdAndDelete(subCategoryId);
    return true;
  } catch (err) {
    throw err;
  }
};

/*****************Service Center*****************/
exports.createServiceCenter = async (serviceCenterData) => {
  try {
    const serviceCenter = new ServiceCenter(serviceCenterData);
    const wallet = new Wallet({
      serviceCenterId: serviceCenter._id,
    });
    await wallet.save();
    serviceCenter.walletId = wallet._id;
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
    const serviceCenter = await ServiceCenter.findById(serviceCenterId)
      .populate("serviceCategoryIds")
      .lean();
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
      } else if (
        Array.isArray(serviceCenterData[key]) &&
        serviceCenterData[key].length > 0
      ) {
        updateData[key] = serviceCenterData[key];
      }
    }
    await ServiceCenter.findByIdAndUpdate(serviceCenterId, updateData);
    const serviceCenter = await ServiceCenter.findById(serviceCenterId);
    return serviceCenter;
  } catch (err) {
    throw err;
  }
};

exports.getServicesNames = async (categories) => {
  try {
    let servicesNames = [];
    for (let cateId of categories) {
      const subCategory = await SubCategory.findById(cateId);
      servicesNames.push(
        subCategory.subCategoryName,
        subCategory.subCategoryNameEn
      );
    }
    return servicesNames;
  } catch (err) {
    throw err;
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

exports.getWallet = async (walletId) => {
  try {
    const wallet = await Wallet.findById(walletId);
    return wallet;
  } catch (err) {
    throw err;
  }
};

exports.walletMovement = async (movementData) => {
  try {
    const movement = new Movement(movementData);
    await movement.save();
    return movement;
  } catch (err) {
    throw err;
  }
};

/*********************Price List************************/
exports.createList = async (serviceCenterId, priceListData) => {
  try {
    let priceList = await PriceList.findOne({ serviceCenterId });
    if (priceList) {
      priceList.priceList = priceListData;
      await priceList.save();
    } else {
      priceList = new PriceList({
        serviceCenterId,
        priceList: priceListData,
      });
    }
    await priceList.save();
    return priceList;
  } catch (err) {
    throw err;
  }
};

exports.priceLists = async () => {
  try {
    const priceLists = await PriceList.find().populate("serviceCenterId");
    return priceLists;
  } catch (err) {
    throw err;
  }
};

exports.editList = async (serviceCenterId, priceListData) => {
  try {
    const priceList = await PriceList.findOne({ serviceCenterId });
    await priceList.modifyList(priceListData);
    return priceList;
  } catch (err) {
    throw err;
  }
};

exports.approveWholeList = async (priceListId, isApproved) => {
  try {
    const list = await PriceList.findById(priceListId);
    if (isApproved) {
      await list.approveWholeList();
    }
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

exports.modifiedLists = async () => {
  try {
    const lists = await PriceList.find({ priceListApporved: false });
    return lists;
  } catch (err) {
    throw err;
  }
};

exports.showPriceList = async (serviceCenterId) => {
  try {
    const priceList = await PriceList.findOne({ serviceCenterId });
    return priceList;
  } catch (err) {
    throw err;
  }
};

exports.removePriceList = async (priceListId) => {
  try {
    await PriceList.findByIdAndDelete(priceListId);
  } catch (err) {
    throw err;
  }
};

exports.usersVisits = async (page, itemsPerPage) => {
  try {
    const visits = await Visit.find()
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage)
      .populate(["userId", "serviceCenterId"]);
    return visits;
  } catch (err) {
    throw err;
  }
};

/***********************Cars************************/
exports.createCar = async (carData) => {
  try {
    const car = new Car(carData);
    await car.save();
    return car;
  } catch (err) {
    throw err;
  }
};

exports.allCars = async () => {
  try {
    const cars = await Car.find();
    return cars;
  } catch (err) {
    throw err;
  }
};

exports.carDetails = async (carId) => {
  try {
    const car = await Car.findById(carId);
    return car;
  } catch (err) {
    throw err;
  }
};

exports.getCarByCarName = async (carBrand) => {
  try {
    const car = await Car.findOne({ brand: carBrand });
    return car;
  } catch (err) {
    throw err;
  }
};

exports.editCar = async (carId, carData) => {
  try {
    const updateData = {};
    for (let key in carData) {
      if (carData[key] !== "") {
        updateData[key] = carData[key];
      }
    }
    // const car = await Car.findById(carId);
    // let newModels = [];
    // for (let model of carData.models) {
    //   for (let carModel of car.models) {
    //     if (model.modelName === carModel.modelName && model.modelIcon !== "") {
    //       newModels.push(model);
    //     } else if (
    //       model.modelName !== carModel.modelName &&
    //       model.modelIcon !== ""
    //     ) {
    //       newModels.push(model);
    //     } else {
    //       newModels.push(carModel);
    //     }
    //   }
    // }
    // updateData.models = newModels;
    await Car.findByIdAndUpdate(carId, updateData);
  } catch (err) {
    throw err;
  }
};

exports.deleteCar = async (carId) => {
  try {
    await Car.findByIdAndDelete(carId);
  } catch (err) {
    throw err;
  }
};

/*******************offer*******************/
exports.createOffer = async (offerData) => {
  try {
    const offer = new Offer(offerData);
    await offer.save();
    return offer;
  } catch (err) {
    throw err;
  }
};

exports.allOffers = async () => {
  try {
    const offers = await Offer.find();
    return offers;
  } catch (err) {
    throw err;
  }
};

exports.setOfferStatus = async (offerId, status) => {
  try {
    const offer = await Offer.findById(offerId);
    if (!status) {
      const serviceCenters = await ServiceCenter.find({
        hasOffer: true,
        offerId: offerId,
      });
      for (let center of serviceCenters) {
        if (center.offerId.toString() === offerId.toString()) {
          center.hasOffer = false;
          await center.save();
        }
      }
    }
    offer.expired = status;
    await offer.save();
    return offer;
  } catch (err) {
    throw err;
  }
};

exports.offerDetails = async (offerId) => {
  try {
    const offer = await Offer.findById(offerId);
    return offer;
  } catch (err) {
    throw err;
  }
};

exports.editOffer = async (offerId, offerData) => {
  try {
    const updateData = {};
    for (let key in offerData) {
      if (offerData[key] !== "") {
        updateData[key] = offerData[key];
      }
    }
    const offer = await Offer.findByIdAndUpdate(offerId, updateData);
    return offer;
  } catch (err) {
    throw err;
  }
};

exports.deleteOffer = async (offerId) => {
  try {
    const serviceCenters = await ServiceCenter.find({
      hasOffer: true,
      offerId: offerId,
    });
    for (let center of serviceCenters) {
      if (center.offerId.toString() === offerId.toString()) {
        center.hasOffer = false;
        await center.save();
      }
    }
    await Offer.findByIdAndDelete(offerId);
  } catch (err) {
    throw err;
  }
};

exports.addOffer = async (offerId, serviceCentersIds) => {
  try {
    for (let id of serviceCentersIds) {
      let serviceCenter = await ServiceCenter.findById(id);
      if (serviceCenter) {
        serviceCenter.hasOffer = true;
        serviceCenter.offerId = offerId;
        await serviceCenter.save();
      }
    }
  } catch (err) {
    throw err;
  }
};

exports.offerServiceCenters = async (offerId) => {
  try {
    const serviceCenters = await ServiceCenter.find({
      hasOffer: true,
      offerId: offerId,
    });
    return serviceCenters;
  } catch (err) {
    throw err;
  }
};

exports.removeOffer = async (offerId, serviceCentersIds) => {
  try {
    for (let id of serviceCentersIds) {
      let serviceCenter = await ServiceCenter.findById(id);
      if (
        serviceCenter &&
        serviceCenter.offerId.toString() === offerId.toString()
      ) {
        serviceCenter.hasOffer = false;
        serviceCenter.offerId = offerId;
        await serviceCenter.save();
      }
    }
  } catch (err) {
    throw err;
  }
};
/******************Promotions***************/
exports.pendingPromotions = async () => {
  try {
    const promotions = await Promotion.find({ approved: false })
      .populate("serviceCenterId")
      .sort({ createdAt: -1 });
    return promotions;
  } catch (err) {
    throw err;
  }
};

exports.setPromotionApproval = async (promotionId, status) => {
  try {
    const promotion = await Promotion.findById(promotionId);
    promotion.approved = status;
    await promotion.save();
    return promotion;
  } catch (err) {
    throw err;
  }
};

exports.promotions = async () => {
  try {
    const promotions = await Promotion.find()
      .populate("serviceCenterId")
      .sort({ createdAt: -1 });
    return promotions;
  } catch (err) {
    throw err;
  }
};

/****************Contact Us*****************/
exports.contactUsMessages = async () => {
  try {
    const messages = await ContactUs.find().sort({ createdAt: -1 });
    return messages;
  } catch (err) {
    throw err;
  }
};

exports.removeContactUsMessage = async (msgId) => {
  try {
    await ContactUs.findByIdAndDelete(msgId);
  } catch (err) {
    throw err;
  }
};

/*******************Driver*******************/
exports.driversJoinRequests = async () => {
  try {
    const driversRequests = await Driver.find({
      isActive: false,
      isApproved: false,
    }).sort({ createdAt: -1 });
    return driversRequests;
  } catch (err) {
    throw err;
  }
};

exports.createDriver = async (driverData) => {
  try {
    const driver = new Driver(driverData);
    const wallet = new Wallet({
      driverId: driver._id,
    });
    await wallet.save();
    driver.walletId = wallet._id;
    await driver.save();
    return driver;
  } catch (err) {
    throw err;
  }
};

exports.allDrivers = async () => {
  try {
    const drivers = await Driver.find();
    return drivers;
  } catch (err) {
    throw err;
  }
};

exports.driverDetails = async (driverId) => {
  try {
    const driver = await Driver.findById(driverId);
    return driver;
  } catch (err) {
    throw err;
  }
};

exports.editDriver = async (driverId, driverData) => {
  try {
    const updateData = {};
    for (let key in driverData) {
      if (driverData[key] !== "") {
        updateData[key] = driverData[key];
      }
    }
    const driver = await Driver.findByIdAndUpdate(driverId, updateData);
    return driver;
  } catch (err) {
    throw err;
  }
};

exports.deleteDriver = async (driverId) => {
  try {
    await Driver.findByIdAndDelete(driverId);
  } catch (err) {
    throw err;
  }
};
/*******************Settings******************/
exports.setAppSettings = async (settingsData) => {
  try {
    let settings = await Settings.findOne();
    if (!settings) {
      settings = new Settings(settingsData);
      await settings.save();
    } else {
      const updateData = {};
      for (let key in settingsData) {
        if (settingsData[key] !== "") {
          updateData[key] = settingsData[key];
        }
      }
      await Settings.findByIdAndUpdate(settings._id, updateData);
    }
    return settings;
  } catch (err) {
    throw err;
  }
};

exports.appSettings = async () => {
  try {
    const settings = await Settings.findOne();
    return settings;
  } catch (err) {
    throw err;
  }
};

/*******************Booking********************/
exports.allCanceledBookings = async () => {
  try {
    const canceledBookings = await CanceledBooking.find().sort({
      createdAt: -1,
    });
    return canceledBookings;
  } catch (err) {
    throw err;
  }
};

/*******************Booking********************/
exports.allCheckReports = async (startDate, endDate, page, itemsPerPage) => {
  try {
    const countDocs = await Check.countDocuments();
    const checkReports = await Check.find({
      date: { $gte: startDate, $lte: endDate },
    })
      .populate("serviceCenterId")
      .sort({ createdAt: -1 })
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage);
    return { totalDocs: countDocs, checkReports };
  } catch (err) {
    throw err;
  }
};

exports.setCheckReportStatus = async (checkReportId, status) => {
  try {
    const checkReport = await Check.findById(checkReportId);
    checkReport.reportStatus = status;
    await checkReport.save();
    return checkReport;
  } catch (err) {
    throw err;
  }
};
