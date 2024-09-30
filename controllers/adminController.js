const bcrypt = require("bcryptjs");
const adminServices = require("../services/adminServices");
const { validationResult } = require("express-validator");

/**********************************************************
 * Service Centers
 **********************************************************/
exports.postCreateServiceCenter = async (req, res, next) => {
  try {
    const {
      serviceCenterTitle,
      serviceCenterTitleEn,
      address,
      lat,
      lng,
      serviceType,
      openAt,
      closeAt,
      contacts,
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
      lat,
      lng,
    };
    const hashedPassword = await bcrypt.hash(password, 12);
    const brands = JSON.parse(carBrands);
    const serviceCenterData = {
      serviceCenterTitle,
      serviceCenterTitleEn,
      address,
      location,
      serviceType,
      openAt,
      closeAt,
      contacts,
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
      lat,
      lng,
      serviceType,
      openAt,
      closeAt,
      contacts,
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
      lat,
      lng,
    };
    const hashedPassword =
      password !== "" ? await bcrypt.hash(password, 12) : "";
    const brands = JSON.parse(carBrands);
    const serviceCenterData = {
      serviceCenterTitle,
      serviceCenterTitleEn,
      address,
      location,
      serviceType,
      openAt,
      closeAt,
      contacts,
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
 * Service Centers Categories
 **********************************************************/
exports.postCreateCategory = async (req, res, next) => {
  try {
    const { categoryTitle, categoryDescription } = req.body;
    const categoryData = {
      categoryTitle,
      categoryDescription,
    };
    const category = await adminServices.createCategory(categoryData);
    if (!category) {
      const error = new Error("faild to create category!");
      error.statusCode = 422;
      throw error;
    }
    res.status(201).json({ success: true, message: "New Category Created" });
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

exports.deleteCategory = async (req, res, next) => {
  try {
    const categoryId = req.query.categoryId;
    await adminServices.removeCategory(categoryId);
    res
      .status(200)
      .json({ success: true, message: "Category has been deleted!" });
  } catch (err) {
    next(err);
  }
};

exports.putSetCategoryStatus = async (req, res, next) => {
  try {
    const categoryId = req.body.categoryId;
    const isAvailable = req.body.status;
    await adminServices.setCategoryStatus(categoryId, isAvailable);
    res.status(200).json({
      success: true,
      message: `Category has been ${isAvailable ? "enabled" : "blocked"}`,
    });
  } catch (err) {
    next(err);
  }
};
