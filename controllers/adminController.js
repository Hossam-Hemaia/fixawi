const bcrypt = require("bcryptjs");
const adminServices = require("../services/adminServices");
const userServices = require("../services/userServices");
const { validationResult } = require("express-validator");
const utilities = require("../utils/utilities");

/*****************************************
 * Category
 *****************************************/

exports.postCreateCategory = async (req, res, next) => {
  try {
    const { categoryName, categoryNameEn } = req.body;
    const image = req.files[0];
    let cateImageUrl;
    if (image) {
      cateImageUrl = `${req.protocol}s://${req.get("host")}/${image.path}`;
    } else {
      cateImageUrl = "";
    }
    const categoryData = {
      categoryName,
      categoryNameEn,
      categoryImage: cateImageUrl,
    };
    const category = await adminServices.createMainCategory(categoryData);
    res
      .status(201)
      .json({ success: true, category, message: "Category Created!" });
  } catch (err) {
    next(err);
  }
};

exports.putEditCategory = async (req, res, next) => {
  try {
    const { categoryName, categoryNameEn, categoryId } = req.body;
    const image = req.files[0];
    let cateImageUrl;
    if (image) {
      cateImageUrl = `${req.protocol}s://${req.get("host")}/${image.path}`;
    } else {
      cateImageUrl = "";
    }
    const categoryData = {
      categoryName,
      categoryNameEn,
      categoryImage: cateImageUrl,
    };
    await adminServices.editMainCategory(categoryData, categoryId);
    res.status(200).json({ success: true, message: "Category updated!" });
  } catch (err) {
    next(err);
  }
};

exports.getAllCategories = async (req, res, next) => {
  try {
    const categories = await adminServices.allCategories();
    res.status(200).json({ success: true, categories });
  } catch (err) {
    next(err);
  }
};

exports.getCategory = async (req, res, next) => {
  try {
    const categoryId = req.query.categoryId;
    const category = await adminServices.getCategory(categoryId);
    res.status(200).json({ success: true, category });
  } catch (err) {
    next(err);
  }
};

exports.deleteCategory = async (req, res, next) => {
  try {
    const categoryId = req.query.categoryId;
    await adminServices.deleteCategory(categoryId);
    res.status(200).json({ success: true, message: "category deleted!" });
  } catch (err) {
    next(err);
  }
};

/*****************************************
 * Sub-Category
 *****************************************/

exports.postCreateSubCategory = async (req, res, next) => {
  try {
    const { subCategoryName, subCategoryNameEn, mainCategoryId } = req.body;
    const image = req.files[0];
    let subCategoryImageUrl;
    if (image) {
      subCategoryImageUrl = `${req.protocol}s://${req.get("host")}/${
        image.path
      }`;
    } else {
      subCategoryImageUrl = "";
    }
    const subCategoryData = {
      subCategoryName,
      subCategoryNameEn,
      subCategoryImage: subCategoryImageUrl,
      mainCategoryId,
    };
    await adminServices.createSubCategory(subCategoryData);
    res
      .status(201)
      .json({ success: true, message: "New Sub-category created!" });
  } catch (err) {
    next(err);
  }
};

exports.getAllSubCategories = async (req, res, next) => {
  try {
    const subCategories = await adminServices.allSubCategories();
    res.status(200).json({ success: true, subCategories });
  } catch (err) {
    next(err);
  }
};

exports.getSubCategory = async (req, res, next) => {
  try {
    const subCategoryId = req.query.subCategoryId;
    const subCategory = await adminServices.getSubCategory(subCategoryId);
    res.status(200).json({ success: true, subCategory });
  } catch (err) {
    next(err);
  }
};

exports.putEditSubCategory = async (req, res, next) => {
  try {
    const {
      subCategoryName,
      subCategoryNameEn,
      mainCategoryId,
      subCategoryId,
    } = req.body;
    const image = req.files[0];
    let imageUrl;
    if (image) {
      imageUrl = `${req.protocol}s://${req.get("host")}/${image.path}`;
    } else {
      imageUrl = "";
    }
    const subCategoryData = {
      subCategoryName,
      subCategoryNameEn,
      mainCategoryId,
      subCategoryImage: imageUrl,
    };
    await adminServices.editSubCategory(subCategoryData, subCategoryId);
    res.status(200).json({ success: true, message: "Sub-Category updated" });
  } catch (err) {
    next(err);
  }
};

exports.deleteSubcategory = async (req, res, next) => {
  try {
    const subCategoryId = req.query.subCategoryId;
    await adminServices.removeSubcategory(subCategoryId);
    res.status(200).json({ success: true, message: "Sub-Category deleted!" });
  } catch (err) {
    next(err);
  }
};

/**********************************************************
 * Service Centers
 **********************************************************/
exports.postCreateServiceCenter = async (req, res, next) => {
  try {
    const {
      serviceCenterTitle,
      serviceCenterTitleEn,
      address,
      area,
      lat,
      lng,
      serviceCategoryIds,
      visitType,
      openAt,
      closeAt,
      contacts,
      email,
      website,
      carBrands,
      username,
      password,
    } = req.body;
    const error = validationResult(req);
    if (!error.isEmpty() && error.array()[0].msg !== "Invalid value") {
      const errorMsg = new Error(error.array()[0].msg);
      errorMsg.statusCode = 422;
      throw errorMsg;
    }
    const files = req.files;
    let image;
    let imageUrl = "";
    if (files.length > 0) {
      image = files[0];
      imageUrl = `${req.protocol}s://${req.get("host")}/${image.path}`;
    }
    const location = {
      type: "Point",
      coordinates: [lat, lng],
    };
    const serviceCategories = JSON.parse(serviceCategoryIds);
    const serviceTypes = await adminServices.getServicesNames(
      serviceCategories
    );
    const hashedPassword = await bcrypt.hash(password, 12);
    const brands = JSON.parse(carBrands);
    const serviceCenterData = {
      serviceCenterTitle,
      serviceCenterTitleEn,
      address,
      area,
      location,
      serviceCategoryIds: serviceCategories,
      serviceTypes,
      visitType,
      openAt,
      closeAt,
      contacts,
      email,
      website,
      carBrands: brands,
      image: imageUrl,
      isActive: true,
      isApproved: true,
      username,
      password: hashedPassword,
    };
    const serviceCenter = await adminServices.createServiceCenter(
      serviceCenterData
    );
    if (serviceCenter) {
      const scData = {
        fullName: serviceCenter.serviceCenterTitle,
        username,
        password: hashedPassword,
        role: "service center",
        serviceCenterId: serviceCenter._id,
      };
      await adminServices.createAdmin(scData);
      return res.status(201).json({
        success: true,
        message: "Service Center Created",
        username,
        password,
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.getServiceCenters = async (req, res, next) => {
  try {
    const serviceCenters = await adminServices.allServiceCenters();
    res.status(200).json({ success: true, serviceCenters });
  } catch (err) {
    next(err);
  }
};

exports.getServiceCenter = async (req, res, next) => {
  try {
    const serviceCenterId = req.query.serviceCenterId;
    const serviceCenter = await adminServices.serviceCenter(serviceCenterId);
    if (!serviceCenter) {
      const error = new Error("Service center is not found");
      error.statusCode = 404;
      throw error;
    }
    res.status(200).json({ success: true, serviceCenter });
  } catch (err) {
    next(err);
  }
};

exports.putEditServiceCenter = async (req, res, next) => {
  try {
    const {
      serviceCenterTitle,
      serviceCenterTitleEn,
      address,
      area,
      lat,
      lng,
      serviceCategoryIds,
      visitType,
      openAt,
      closeAt,
      contacts,
      email,
      website,
      carBrands,
      isActive,
      username,
      password,
      serviceCenterId,
    } = req.body;
    const error = validationResult(req);
    if (!error.isEmpty() && error.array()[0].msg !== "Invalid value") {
      const errorMsg = new Error(error.array()[0].msg);
      errorMsg.statusCode = 422;
      throw errorMsg;
    }
    const files = req.files;
    let image;
    let imageUrl = "";
    if (files.length > 0) {
      image = files[0];
      imageUrl = `${req.protocol}s://${req.get("host")}/${image.path}`;
    }
    const location = {
      type: "Point",
      coordinates: [lat, lng],
    };
    const serviceCategories = JSON.parse(serviceCategoryIds);
    const serviceTypes = await adminServices.getServicesNames(
      serviceCategories
    );
    const hashedPassword =
      password !== "" ? await bcrypt.hash(password, 12) : "";
    const brands = JSON.parse(carBrands);
    const serviceCenterData = {
      serviceCenterTitle,
      serviceCenterTitleEn,
      address,
      area,
      location,
      serviceCategoryIds: serviceCategories,
      serviceTypes,
      visitType,
      openAt,
      closeAt,
      contacts,
      email,
      website,
      carBrands: brands,
      image: imageUrl,
      isActive,
      username,
      password: hashedPassword,
    };
    const serviceCenter = await adminServices.updateServiceCenter(
      serviceCenterId,
      serviceCenterData
    );
    const scData = {
      fullName: serviceCenter.serviceCenterTitle,
      username,
      password: hashedPassword,
      role: "service center",
    };
    await adminServices.updateAdmin(serviceCenterId, scData);
    res.status(201).json({
      success: true,
      message: "Service Center Updated",
      username,
      password,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteServiceCenter = async (req, res, next) => {
  try {
    const serviceCenterId = req.query.serviceCenterId;
    await adminServices.removeServiceCenter(serviceCenterId);
    res.status(200).json({ success: true, message: "Service center deleted" });
  } catch (err) {
    next(err);
  }
};

exports.getJoinRequests = async (req, res, next) => {
  try {
    const joinRequests = await adminServices.joinRequests();
    res.status(200).json({ success: true, joinRequests });
  } catch (err) {
    next(err);
  }
};

exports.approveServiceCenter = async (req, res, next) => {
  try {
    const { serviceCenterId, username, password, isApproved } = req.body;
    const error = validationResult(req);
    if (!error.isEmpty() && error.array()[0].msg !== "Invalid value") {
      const errorMsg = new Error(error.array()[0].msg);
      errorMsg.statusCode = 422;
      throw errorMsg;
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const serviceCenterData = {
      isActive: true,
      isApproved,
      username,
      password: hashedPassword,
    };
    const serviceCenter = await adminServices.updateServiceCenter(
      serviceCenterId,
      serviceCenterData
    );
    const scData = {
      fullName: serviceCenter.serviceCenterTitle,
      username,
      password: hashedPassword,
      role: "service center",
      serviceCenterId: serviceCenter._id,
    };
    await adminServices.createAdmin(scData);
    res.status(201).json({
      success: true,
      message: "Service Center Approved",
      username,
      password,
    });
  } catch (err) {
    next(err);
  }
};

/**********************************************************
 * Price List
 **********************************************************/
exports.postCreatePriceList = async (req, res, next) => {
  try {
    const { serviceCenterId, priceList } = req.body;
    const list = await adminServices.createList(serviceCenterId, priceList);
    if (list) {
      return res
        .status(201)
        .json({ success: true, message: "Price List Created" });
    }
  } catch (err) {
    next(err);
  }
};

exports.putEditPriceList = async (req, res, next) => {
  try {
    const { serviceCenterId, priceList } = req.body;
    await adminServices.editList(serviceCenterId, priceList);
    res.status(201).json({ success: true, message: "Price list updated" });
  } catch (err) {
    next(err);
  }
};

exports.getPriceLists = async (req, res, next) => {
  try {
    const priceLists = await adminServices.priceLists();
    res.status(200).json({ success: true, priceLists });
  } catch (err) {
    next(err);
  }
};

exports.getPriceList = async (req, res, next) => {
  try {
    const serviceCenterId = req.query.serviceCenterId;
    const priceList = await adminServices.showPriceList(serviceCenterId);
    res.status(200).json({ success: true, priceList });
  } catch (err) {
    next(err);
  }
};

exports.getModifiedPriceLists = async (req, res, next) => {
  try {
    const priceLists = await adminServices.modifiedLists();
    res.status(200).json({ success: true, priceLists });
  } catch (err) {
    next(err);
  }
};

exports.putApproveWholeList = async (req, res, next) => {
  try {
    const { priceListId, isApproved } = req.body;
    await adminServices.approveWholeList(priceListId, isApproved);
    res.status(200).json({ success: true, message: "List Approved" });
  } catch (err) {
    next(err);
  }
};

exports.patchApproveModifiedList = async (req, res, next) => {
  try {
    const { serviceId, serviceTitle, servicePrice, isApproved, priceListId } =
      req.body;
    const modifiedData = {
      serviceId,
      serviceTitle,
      servicePrice,
      isApproved,
      priceListId,
    };
    await adminServices.approveModifiedService(modifiedData);
    res.status(200).json({ success: true, message: "service updated" });
  } catch (err) {
    next(err);
  }
};
/**********************************************************
 * Cars
 **********************************************************/
exports.postCreateCar = async (req, res, next) => {
  try {
    const { brand, models } = req.body;
    const image = req.files[0];
    let carLogo;
    if (image) {
      carLogo = `${req.protocol}s://${req.get("host")}/${image.path}`;
    } else {
      carLogo = "";
    }
    const carData = {
      brand,
      models: JSON.parse(models),
      brandIcon: carLogo,
    };
    const car = await adminServices.createCar(carData);
    if (car) {
      return res
        .status(201)
        .json({ success: true, message: "New car brand added" });
    }
  } catch (err) {
    next(err);
  }
};

exports.getCars = async (req, res, next) => {
  try {
    const cars = await adminServices.allCars();
    res.status(200).json({ success: true, cars });
  } catch (err) {
    next(err);
  }
};

exports.getCarDetails = async (req, res, next) => {
  try {
    const carId = req.query.carId;
    const car = await adminServices.carDetails(carId);
    res.status(200).json({ success: true, car });
  } catch (err) {
    next(err);
  }
};

exports.putEditCar = async (req, res, next) => {
  try {
    const { brand, models, carId } = req.body;
    const image = req.files[0];
    let carLogo;
    if (image) {
      carLogo = `${req.protocol}s://${req.get("host")}/${image.path}`;
    } else {
      carLogo = "";
    }
    console.log(carLogo);
    const carData = {
      brand,
      models: JSON.parse(models),
      brandIcon: carLogo,
    };
    await adminServices.editCar(carId, carData);
    res.status(200).json({ success: true, message: "Car Updated" });
  } catch (err) {
    next(err);
  }
};

exports.deleteCar = async (req, res, next) => {
  try {
    const carId = req.query.carId;
    await adminServices.deleteCar(carId);
    res.status(200).json({ success: true, message: "car deleted" });
  } catch (err) {
    next(err);
  }
};
/**********************************************************
 * Users
 **********************************************************/
exports.getAllUsers = async (req, res, next) => {
  try {
    const page = +req.query.page;
    const ITEMS_PER_PAGE = 200;
    let totalUsers;
    const users = await userServices.allUsers(page, ITEMS_PER_PAGE);
    totalUsers = users.length;
    res.status(200).json({
      success: true,
      data: {
        users: users,
        itemsPerPage: ITEMS_PER_PAGE,
        currentPage: page,
        hasNextPage: page * ITEMS_PER_PAGE < totalUsers,
        nextPage: page + 1,
        hasPreviousPage: page > 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalUsers / ITEMS_PER_PAGE),
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.getUser = async (req, res, next) => {
  try {
    const userId = req.query.userId;
    const user = await userServices.findUserById(userId);
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

exports.putBlockUser = async (req, res, next) => {
  try {
    const { userId, status } = req.body;
    const blocked = await userServices.blockUser(userId, status);
    if (blocked) {
      return res.status(200).json({
        success: true,
        message: `User is ${status ? "blocked" : "unblocked"}`,
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.getUsersVisits = async (req, res, next) => {
  try {
    const page = +req.query.page;
    const ITEMS_PER_PAGE = 200;
    let totalVisits;
    const visits = await adminServices.usersVisits(page, ITEMS_PER_PAGE);
    totalVisits = visits.length;
    res.status(200).json({
      success: true,
      data: {
        visits: visits,
        itemsPerPage: ITEMS_PER_PAGE,
        currentPage: page,
        hasNextPage: page * ITEMS_PER_PAGE < totalVisits,
        nextPage: page + 1,
        hasPreviousPage: page > 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalVisits / ITEMS_PER_PAGE),
      },
    });
  } catch (err) {
    next(err);
  }
};

/**********************************************************
 * Users
 **********************************************************/
exports.postCreateOffer = async (req, res, next) => {
  try {
    const {
      offerTitle,
      discountType,
      discountAmount,
      hasExpiry,
      expiryDate,
      hasUsageNumber,
      usageNumber,
    } = req.body;
    const offerData = {
      offerTitle,
      discountType,
      discountAmount,
      hasExpiry,
      expiryDate: utilities.getLocalDate(expiryDate),
      hasUsageNumber,
      usageNumber: hasUsageNumber ? usageNumber : 1,
    };
    const offer = await adminServices.createOffer(offerData);
    if (offer) {
      return res
        .status(201)
        .json({ success: true, message: "New offer created" });
    }
  } catch (err) {
    next(err);
  }
};

exports.getAllOffers = async (req, res, next) => {
  try {
    const offers = await adminServices.allOffers();
    res.status(200).json({ success: true, offers });
  } catch (err) {
    next(err);
  }
};

exports.putSetExpireoffer = async (req, res, next) => {
  try {
    const offerId = req.body.offerId;
    const status = req.body.status;
    const offer = await adminServices.setOfferStatus(offerId, status);
    if (offer) {
      return res
        .status(200)
        .json({ success: true, message: "Offer status updated" });
    }
  } catch (err) {
    next(err);
  }
};

exports.putEditOffer = async (req, res, next) => {
  try {
    const {
      offerTitle,
      discountType,
      discountAmount,
      hasExpiry,
      expiryDate,
      hasUsageNumber,
      usageNumber,
      offerId,
    } = req.body;
    const offerData = {
      offerTitle,
      discountType,
      discountAmount,
      hasExpiry,
      expiryDate: utilities.getLocalDate(expiryDate),
      hasUsageNumber,
      usageNumber: hasUsageNumber ? usageNumber : 1,
    };
    const offer = await adminServices.editOffer(offerId, offerData);
    if (offer) {
      return res.status(201).json({ success: true, message: "offer updated" });
    }
  } catch (err) {
    next(err);
  }
};

exports.deleteOffer = async (req, res, next) => {
  try {
    const offerId = req.query.offerId;
    await adminServices.deleteOffer(offerId);
    res.status(200).json({ success: true, message: "offer deleted" });
  } catch (err) {
    next(err);
  }
};

exports.addServiceCenterOffer = async (req, res, next) => {
  try {
    const offerId = req.body.offerId;
    const serviceCentersIds = req.body.serviceCentersIds;
    await adminServices.addOffer(offerId, serviceCentersIds);
    res
      .status(200)
      .json({ success: true, message: "Offers Added Successfully" });
  } catch (err) {
    next(err);
  }
};

exports.getOfferServiceCenters = async (req, res, next) => {
  try {
    const offerId = req.query.offerId;
    const serviceCenters = await adminServices.offerServiceCenters(offerId);
    res.status(200).json({ success: true, serviceCenters });
  } catch (err) {
    next(err);
  }
};

exports.removeServiceCenterOffer = async (req, res, next) => {
  try {
    const offerId = req.body.offerId;
    const serviceCentersIds = req.body.serviceCentersIds;
    await adminServices.removeOffer(offerId, serviceCentersIds);
    res
      .status(200)
      .json({ success: true, message: "Offers Removed Successfully" });
  } catch (err) {
    next(err);
  }
};

/**********************************************************
 * Contact Us
 **********************************************************/
exports.getContactUsMessages = async (req, res, next) => {
  try {
    const messages = await adminServices.contactUsMessages();
    res.status(200).json({ success: true, messages });
  } catch (err) {
    next(err);
  }
};

exports.deleteContactUsMessage = async (req, res, next) => {
  try {
    const msgId = req.query.msgId;
    await adminServices.removeContactUsMessage(msgId);
    res.status(200).json({ success: true, message: "Message removed" });
  } catch (err) {
    next(err);
  }
};
