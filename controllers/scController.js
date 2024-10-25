const { validationResult } = require("express-validator");
const scServices = require("../services/scServices");
const adminServices = require("../services/adminServices");

exports.postJoinRequest = async (req, res, next) => {
  try {
    //admin should be notified
    const {
      serviceCenterTitle,
      serviceCenterTitleEn,
      address,
      area,
      lat,
      lng,
      serviceType,
      openAt,
      closeAt,
      contacts,
      carBrands,
    } = req.body;
    const location = {
      type: "Point",
      coordinates: [lat, lng],
    };
    const serviceCenterData = {
      serviceCenterTitle,
      serviceCenterTitleEn,
      address,
      area,
      location,
      serviceType,
      openAt,
      closeAt,
      contacts,
      carBrands,
    };
    await adminServices.createServiceCenter(serviceCenterData);
    res.status(201).json({
      success: true,
      message: "Your request has been submitted, We will contact you soon",
    });
  } catch (err) {
    next(err);
  }
};

exports.getServicesCategories = async (req, res, next) => {
  try {
    const categories = await scServices.servicesCategories();
    res.status(200).json({ success: true, categories });
  } catch (err) {
    next(err);
  }
};

exports.getServiceCenterProfile = async (req, res, next) => {
  try {
    const serviceCenterId = req.sc._id;
    const serviceCenter = await adminServices.serviceCenter(serviceCenterId);
    res.status(200).json({ success: true, serviceCenter });
  } catch (err) {
    next(err);
  }
};

exports.putUpdateServiceCenterProfile = async (req, res, next) => {
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
    let hashedPassword;
    if (password !== "") {
      hashedPassword = await bcrypt.hash(password, 12);
    } else {
      hashedPassword = password;
    }
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
    });
  } catch (err) {
    next(err);
  }
};

exports.postCreatePriceList = async (req, res, next) => {
  try {
    //admin should be notified
    const priceList = req.body.priceList;
    const serviceCenterId = req.sc.serviceCenterId;
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

exports.putEditServiceCenterPriceList = async (req, res, next) => {
  try {
    //admin should be notified
    const priceList = req.body.priceList;
    const serviceCenterId = req.sc.serviceCenterId;
    const list = await adminServices.editList(serviceCenterId, priceList);
    await scServices.setPriceListDisapproved(list._id);
    res.status(201).json({ success: true, message: "Price list updated" });
  } catch (err) {
    next(err);
  }
};

exports.getPriceList = async (req, res, next) => {
  try {
    const serviceCenterId = req.sc.serviceCenterId;
    const priceList = await adminServices.showPriceList(serviceCenterId);
    res.status(200).json({ success: true, priceList });
  } catch (err) {
    next(err);
  }
};

exports.getVisits = async (req, res, next) => {
  try {
    const serviceCenterId = req.sc.serviceCenterId;
    const visits = await scServices.visits(serviceCenterId);
    res.status(200).json({ success: true, visits });
  } catch (err) {
    next(err);
  }
};
