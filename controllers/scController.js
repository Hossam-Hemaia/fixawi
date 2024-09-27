const scServices = require("../services/scServices");
const adminServices = require("../services/adminServices");

exports.postJoinRequest = async (req, res, next) => {
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
    } = req.body;
    const location = {
      lat,
      lng,
    };
    const serviceCenterData = {
      serviceCenterTitle,
      serviceCenterTitleEn,
      address,
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
