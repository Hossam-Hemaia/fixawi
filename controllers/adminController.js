const bcrypt = require("bcryptjs");
const adminServices = require("../services/adminServices");
const scServices = require("../services/scServices");
const userServices = require("../services/userServices");
const orderServices = require("../services/orderServices");
const driverServices = require("../services/driverServices");
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
    const {
      subCategoryName,
      subCategoryNameEn,
      description,
      descriptionEn,
      mainCategoryId,
    } = req.body;
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
      description,
      descriptionEn,
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
      description,
      descriptionEn,
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
      description,
      descriptionEn,
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
      fixawiFareType,
      fareValue,
      closingDay,
      username,
      password,
      requireBookingFees,
      isPremium,
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
    const documents = [];
    if (files.length > 1) {
      for (let i = 1; i < files.length; ++i) {
        let doc = files[i];
        let docUrl = `${req.protocol}s://${req.get("host")}/${doc.path}`;
        documents.push(docUrl);
      }
    }
    // if (
    //   !fixawiFareType ||
    //   fixawiFareType === "" ||
    //   !fareValue ||
    //   fareValue === ""
    // ) {
    //   const error = new Error("You must set pricing options");
    //   error.statusCode = 422;
    //   throw error;
    // }
    const location = {
      type: "Point",
      coordinates: [lat, lng],
    };
    const serviceCategories = JSON.parse(serviceCategoryIds);
    const serviceTypes = await adminServices.getServicesNames(
      serviceCategories
    );
    let hashedPassword = "";
    if (username !== "" && password !== "") {
      hashedPassword = await bcrypt.hash(password, 12);
    }
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
      documents,
      fixawiFareType,
      fareValue,
      closingDay: JSON.parse(closingDay),
      isActive: true,
      isApproved: true,
      username,
      password: hashedPassword,
      requireBookingFees,
      isPremium,
    };
    const serviceCenter = await adminServices.createServiceCenter(
      serviceCenterData
    );
    if (serviceCenter && username !== "" && password !== "") {
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
        message: "Service center created",
        username,
        password,
      });
    } else {
      return res.status(201).json({
        success: true,
        message: "Service center created without access credentials",
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
    const serviceTypes = serviceCenter.serviceTypes;
    const serviceTypesAr = [];
    const serviceTypesEn = [];
    for (let service of serviceTypes) {
      let isEnLanguage = utilities.textLang(service);
      if (isEnLanguage) {
        serviceTypesEn.push(service);
      } else {
        serviceTypesAr.push(service);
      }
    }
    serviceCenter.servicesAr = serviceTypesAr;
    serviceCenter.servicesEn = serviceTypesEn;
    const cars = [];
    for (let carBrand of serviceCenter.carBrands) {
      let car = await adminServices.getCarByCarName(carBrand);
      cars.push(car);
    }
    serviceCenter.cars = cars;
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
      fixawiFareType,
      fareValue,
      closingDay,
      username,
      password,
      requireBookingFees,
      isPremium,
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
    const documents = [];
    if (files.length > 1) {
      for (let i = 1; i < files.length; ++i) {
        let doc = files[i];
        let docUrl = `${req.protocol}s://${req.get("host")}/${doc.path}`;
        documents.push(docUrl);
      }
    }
    if (
      !fixawiFareType ||
      fixawiFareType === "" ||
      !fareValue ||
      fareValue === ""
    ) {
      const error = new Error("You must set pricing options");
      error.statusCode = 422;
      throw error;
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
      fixawiFareType,
      fareValue,
      closingDay: JSON.parse(closingDay),
      username,
      password: hashedPassword,
      requireBookingFees,
      isPremium,
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
    await adminServices.updateScUser(serviceCenterId, scData);
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

exports.getShowCenterBalance = async (req, res, next) => {
  try {
    const walletId = req.query.walletId;
    const wallet = await adminServices.getWallet(walletId);
    res.status(200).json({ success: true, wallet });
  } catch (err) {
    next(err);
  }
};

exports.getBalanceMovement = async (req, res, next) => {
  try {
    const { dateFrom, dateTo, walletId } = req.query;
    const localStartDate = utilities.getLocalDate(dateFrom);
    const localEndDate = utilities.getEndLocalDate(dateTo);
    const movements = await scServices.balanceMovement(
      walletId,
      localStartDate,
      localEndDate
    );
    res.status(200).json({ success: true, movements });
  } catch (err) {
    next(err);
  }
};

exports.postWalletTransaction = async (req, res, next) => {
  try {
    const { walletId, transactionType, reason, paymentMethod, amount } =
      req.body;
    const movementData = {
      reason,
      movementDate: utilities.getNowLocalDate(new Date()),
      movementType: transactionType === "withdraw" ? "deduction" : "addition",
      movementAmount: +amount,
      paymentMethod,
      walletId,
      movementId: "",
    };
    const movement = await adminServices.walletMovement(movementData);
    movementData.movementId = movement._id;
    const wallet = await adminServices.getWallet(walletId);
    if (transactionType === "deposite") {
      await wallet.addToBalance(movementData);
    } else if (transactionType === "withdraw") {
      await wallet.deductFromBalance(movementData);
    }
    res.status(201).json({
      success: true,
      message: "Transaction added to wallet successfully",
    });
  } catch (err) {
    next(err);
  }
};

/**********************************************************
 * Booking Settings
 **********************************************************/
exports.postCreateBookingSettings = async (req, res, next) => {
  try {
    const { serviceCenterId, services } = req.body;
    const bookingData = {
      serviceCenterId,
      services,
    };
    const bookingSettings = await scServices.createBookingSettings(bookingData);
    if (bookingSettings) {
      return res
        .status(201)
        .json({ success: true, message: "Booking Settings Created" });
    }
  } catch (err) {
    next(err);
  }
};

exports.getBookingSettings = async (req, res, next) => {
  try {
    const serviceCenterId = req.query.serviceCenterId;
    const bookingSettings = await scServices.bookingSettings(serviceCenterId);
    res.status(200).json({ success: true, bookingSettings });
  } catch (err) {
    next(err);
  }
};

exports.putUpdateBookingSettings = async (req, res, next) => {
  try {
    const { services, bookingSettingsId } = req.body;
    const bookingSettingsData = {
      services,
    };
    const bookingSettings = await scServices.updateBookingSettings(
      bookingSettingsId,
      bookingSettingsData
    );
    if (bookingSettings) {
      return res
        .status(200)
        .json({ success: true, message: "Booking Settings Updated" });
    }
  } catch (err) {
    next(err);
  }
};

/**********************************************************
 * Booking
 **********************************************************/
exports.getServiceCenterBookings = async (req, res, next) => {
  try {
    const serviceCenterId = req.query.serviceCenterId;
    const date = req.query.date;
    const bookingsCalendar = await scServices.bookingsCalendar(
      serviceCenterId,
      date
    );
    res.status(200).json({ success: true, bookings: bookingsCalendar });
  } catch (err) {
    next(err);
  }
};

exports.getAllCanceledBookings = async (req, res, next) => {
  try {
    const canceledBookings = await adminServices.allCanceledBookings();
    res.status(200).json({ success: true, canceledBookings });
  } catch (err) {
    next();
  }
};

exports.bookServiceCenterVisit = async (req, res, next) => {
  try {
    const {
      clientId,
      serviceCenterId,
      serviceId,
      date,
      time,
      carBrand,
      carModel,
      malfunction,
      slotNumber,
    } = req.body;
    const user = await userServices.findUserById(clientId);
    const serviceCenter = await scServices.getUserServiceCenter(
      serviceCenterId
    );
    const bookingSettings = await scServices.bookingSettings(serviceCenterId);
    const service = bookingSettings.services.find((service) => {
      return service.serviceId._id.toString() === serviceId.toString();
    });
    const bookingData = {
      serviceCenterId,
      serviceId,
      serviceName: service.serviceId.subCategoryName,
      slotCapacity: service.capacity,
      date: utilities.getLocalDate(date),
      time,
      clientId,
      clientName: user.fullName,
      phone: user.phoneNumber,
      carBrand,
      carModel,
      malfunction,
    };
    const booking = await userServices.bookVisit(bookingData);
    if (booking) {
      const userBooking = {
        date: bookingData.date,
        time: bookingData.time,
        turn: slotNumber,
        malfunction,
        service: bookingData.serviceName,
        serviceId: bookingData.serviceId,
        serviceCenter: serviceCenter.serviceCenterTitle,
        serviceCenterId,
      };
      user.myBookings.push(userBooking);
      await user.save();
      res
        .status(201)
        .json({ success: true, message: "Booking successful", booking });
    }
  } catch (err) {
    next();
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

exports.deletePriceList = async (req, res, next) => {
  try {
    const priceListId = req.query.priceListId;
    await adminServices.removePriceList(priceListId);
    res.status(200).json({ success: true, message: "price list removed" });
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
    const carModels = JSON.parse(models);
    // const modelsDetails = [];
    // if (req.files.length > 1) {
    //   for (let i = 1; i < req.files.length; ++i) {
    //     let modelData = {};
    //     modelData.modelName = carModels[i - 1];
    //     modelData.modelIcon = `${req.protocol}s://${req.get("host")}/${
    //       req.files[i].path
    //     }`;
    //     modelsDetails.push(modelData);
    //   }
    // }
    const carData = {
      brand,
      models: carModels,
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
    const carModels = JSON.parse(models);
    // const modelsDetails = [];
    // if (req.files.length > 1) {
    //   for (let i = 1; i < req.files.length; ++i) {
    //     let modelData = {};
    //     modelData.modelName = carModels[i - 1];
    //     modelData.modelIcon = req.files[i]
    //       ? `${req.protocol}s://${req.get("host")}/${req.files[i].path}`
    //       : "";
    //     modelsDetails.push(modelData);
    //   }
    // }
    const carData = {
      brand,
      models: carModels,
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
 * System Users
 **********************************************************/
exports.getAllSystemUsers = async (req, res, next) => {
  try {
    const systemUsers = await adminServices.systemUsers();
    res.status(200).json({ success: true, systemUsers });
  } catch (err) {
    next(err);
  }
};

exports.getSystemUserDetails = async (req, res, next) => {
  try {
    const userId = req.query.userId;
    const user = await adminServices.systemUserDetails(userId);
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

exports.putEditSystemUser = async (req, res, next) => {
  try {
    const { userId, fullName, username, password, role, isBlocked } = req.body;
    let hashedPassword;
    if (password !== "") {
      hashedPassword = await bcrypt.hash(password, 12);
    }
    const userData = {
      fullName,
      username,
      password: hashedPassword,
      role,
      isBlocked,
    };
    const updatedUser = await adminServices.updateSystemUser(userId, userData);
    if (updatedUser) {
      return res.status(200).json({ success: true, message: "User Updated" });
    }
  } catch (err) {
    next(err);
  }
};

exports.deleteSystemUser = async (req, res, next) => {
  try {
    const userId = req.query.userId;
    await adminServices.removeSystemUser(userId);
    res.status(200).json({ success: true, message: "User deleted" });
  } catch (err) {
    next(err);
  }
};
/**********************************************************
 * Clients
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

exports.getUserDetails = async (req, res, next) => {
  try {
    const phoneNumber = req.query.phoneNumber;
    const user = await userServices.getUserByUsername(phoneNumber);
    if (!user) {
      throw new Error("User is not found!, please create user account");
    }
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

/**********************************************************
 * Offers
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

exports.getOfferDetails = async (req, res, next) => {
  try {
    const offerId = req.query.offerId;
    const offer = await adminServices.offerDetails(offerId);
    res.status(200).json({ success: true, offer });
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
      status,
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
    const offerStatus = await adminServices.setOfferStatus(offerId, status);
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
 * Promotions
 **********************************************************/

exports.getPromotions = async (req, res, next) => {
  try {
    const promotions = await adminServices.promotions();
    res.status(200).json({ success: true, promotions });
  } catch (err) {
    next(err);
  }
};

exports.putSetPromotionApproval = async (req, res, next) => {
  try {
    const { promotionId, approvalStatus } = req.body;
    const promotion = await adminServices.setPromotionApproval(
      promotionId,
      approvalStatus
    );
    if (promotion) {
      return res
        .status(200)
        .json({ success: true, message: "Prmotion status updated" });
    }
  } catch (err) {
    next(err);
  }
};

exports.getPendingPromotions = async (req, res, next) => {
  try {
    const promotions = await adminServices.pendingPromotions();
    res.status(200).json({ success: true, promotions });
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

/**********************************************************
 * Driver
 **********************************************************/
exports.getDriversJoinRequests = async (req, res, next) => {
  try {
    const driversApplications = await adminServices.driversJoinRequests();
    res.status(200).json({ success: true, driversApplications });
  } catch (err) {
    next(err);
  }
};

exports.postApproveDriver = async (req, res, next) => {
  try {
    const { driverId, isActive, isApproved } = req.body;
    const driverData = {
      driverId,
      isActive,
      isApproved,
    };
    const driver = await adminServices.approveDriver(driverData);
    if (driver) {
      return res
        .status(201)
        .json({ success: true, message: "Driver status updated" });
    }
  } catch (err) {
    next(err);
  }
};

exports.postApproveDriverDocument = async (req, res, next) => {
  try {
    const { driverId, documentId, isApproved } = req.body;
    const docData = {
      driverId,
      documentId,
      isApproved,
    };
    await adminServices.approveDriverDoc(docData);
    res.status(201).json({ success: true, message: "document approved" });
  } catch (err) {
    next(err);
  }
};

exports.postCreateDriver = async (req, res, next) => {
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
        docs.push({
          docName: file.originalname,
          url: docUrl,
          isApproved: true,
        });
      }
    }
    const driverData = {
      driverName,
      phoneNumber,
      licenseNumber,
      companyName,
      truckNumber,
      driverDocs: docs,
      isApproved: true,
      isActive: true,
      password: hashedPassword,
    };
    const driver = await adminServices.createDriver(driverData);
    if (driver) {
      return res
        .status(200)
        .json({ success: true, message: "Driver created successfully" });
    }
  } catch (err) {
    next(err);
  }
};

exports.getAllDrivers = async (req, res, next) => {
  try {
    const drivers = await adminServices.allDrivers();
    res.status(200).json({ success: true, drivers });
  } catch (err) {
    next(err);
  }
};

exports.getDriverDetails = async (req, res, next) => {
  try {
    const driverId = req.query.driverId;
    const driver = await adminServices.driverDetails(driverId);
    res.status(200).json({ success: true, driver });
  } catch (err) {
    next(err);
  }
};

exports.putEditDriver = async (req, res, next) => {
  try {
    const {
      driverName,
      phoneNumber,
      licenseNumber,
      companyName,
      truckNumber,
      isApproved,
      isActive,
      password,
      driverId,
    } = req.body;
    const files = req.files;
    const docs = [];
    if (files.length > 0) {
      for (let file of files) {
        let docUrl = `${req.protocol}s://${req.get("host")}/${file.path}`;
        docs.push({
          docName: file.originalname,
          url: docUrl,
          isApproved: true,
        });
      }
    }
    const hashedPassword = await bcrypt.hash(password, 12);
    const driverData = {
      driverName,
      phoneNumber,
      licenseNumber,
      companyName,
      truckNumber,
      isApproved,
      isActive,
      driverDocs: docs.length > 0 ? docs : "",
      password: hashedPassword,
    };
    const driver = await adminServices.editDriver(driverId, driverData);
    if (driver) {
      return res
        .status(200)
        .json({ success: true, message: "Driver updated successfully" });
    }
  } catch (err) {
    next(err);
  }
};

exports.deleteDriver = async (req, res, next) => {
  try {
    const driverId = req.query.driverId;
    await adminServices.deleteDriver(driverId);
    res.status(200).json({ success: true, message: "Driver removed" });
  } catch (err) {
    next(err);
  }
};

exports.getDriversStatus = async (req, res, next) => {
  try {
    const driversLogs = await driverServices.driversLogs();
    res.status(200).json({ success: true, driversStatus: driversLogs });
  } catch (err) {
    next(err);
  }
};

/**********************************************************
 * Settings
 **********************************************************/
exports.postSetAppSettings = async (req, res, next) => {
  try {
    const {
      driverSuspensionTime,
      rescueOrderTimeout,
      rescueServiceDownPayment,
      bookingDownPayment,
      rescuePricingPerKm,
      rescueFareSystem,
      fixawiRescueFare,
      CancelBookingHours,
      chatQueue,
      chatWelcomingMsg,
    } = req.body;
    const settingsData = {
      driverSuspensionTime,
      rescueOrderTimeout,
      rescueServiceDownPayment,
      bookingDownPayment,
      rescuePricingPerKm,
      rescueFareSystem,
      fixawiRescueFare,
      CancelBookingHours,
      chatQueue,
      chatWelcomingMsg,
    };
    const settings = await adminServices.setAppSettings(settingsData);
    if (settings) {
      res
        .status(201)
        .json({ success: true, message: "settings has been saved" });
    }
  } catch (err) {
    next(err);
  }
};

exports.getAppSettings = async (req, res, next) => {
  try {
    const settings = await adminServices.appSettings();
    res.status(200).json({ success: true, settings });
  } catch (err) {
    next(err);
  }
};

/**********************************************************
 * Rescue Orders
 **********************************************************/
exports.getAllRescueOrders = async (req, res, next) => {
  try {
    const orders = await orderServices.allOrders();
    res.status(200).json({ success: true, orders });
  } catch (err) {
    next(err);
  }
};

exports.patchSetOrderPayment = async (req, res, next) => {
  try {
    const orderId = req.body.orderId;
    const paymentStatus = req.body.paymentStatus;
    const order = await orderServices.setPaymentStatus(orderId, paymentStatus);
    if (order) {
      return res
        .status(200)
        .json({ success: true, message: "Order status updated" });
    }
  } catch (err) {
    next(err);
  }
};

/**********************************************************
 * Check Reports
 **********************************************************/
exports.getAllCheckReports = async (req, res, next) => {
  try {
    const page = +req.query.page;
    const dateFrom = req.query.dateFrom;
    const dateTo = req.query.dateTo;
    const ITEMS_PER_PAGE = 50;
    const localStartDate = utilities.getLocalDate(dateFrom);
    const localEndDate = utilities.getEndLocalDate(dateTo);
    const { totalDocs, checkReports } = await adminServices.allCheckReports(
      localStartDate,
      localEndDate,
      page,
      ITEMS_PER_PAGE
    );
    res.status(200).json({
      success: true,
      data: {
        checkReports,
        itemsPerPage: ITEMS_PER_PAGE,
        currentPage: page,
        hasNextPage: page * ITEMS_PER_PAGE < totalDocs,
        nextPage: page + 1,
        hasPreviousPage: page > 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalDocs / ITEMS_PER_PAGE),
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.postSetCheckReportStatus = async (req, res, next) => {
  try {
    const checkReportId = req.body.checkReportId;
    const reportStatus = req.body.reportStatus;
    const updatedReport = await adminServices.setCheckReportStatus(
      checkReportId,
      reportStatus
    );
    if (updatedReport) {
      return res
        .status(201)
        .json({ success: true, message: "Check report status updated" });
    }
  } catch (err) {
    next(err);
  }
};

/**********************************************************
 * Invoices
 **********************************************************/

exports.postServiceCenterInvoices = async (req, res, next) => {
  try {
    const { serviceCenterId, dateFrom, dateTo } = req.query;
    const invoices = await scServices.serviceCenterInvoices(
      dateFrom,
      dateTo,
      serviceCenterId
    );
    res.status(200).json({ success: true, invoices });
  } catch (err) {
    next(err);
  }
};
