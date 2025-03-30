const { validationResult } = require("express-validator");
const bcrypt = require("bcryptjs");
const scServices = require("../services/scServices");
const adminServices = require("../services/adminServices");
const userServices = require("../services/userServices");
const utilities = require("../utils/utilities");

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
      closingDay,
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
      closingDay,
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
    const serviceCenterId = req.sc.serviceCenterId;
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
      closingDay,
      username,
      password,
      requireBookingFees,
    } = req.body;
    const serviceCenterId = req.sc.serviceCenterId;
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
    const serviceCategories = JSON.parse(serviceCategoryIds);
    const brands = JSON.parse(carBrands);
    const serviceCenterData = {
      serviceCenterTitle,
      serviceCenterTitleEn,
      address,
      area,
      location,
      serviceCategoryIds: serviceCategories,
      visitType,
      openAt,
      closeAt,
      contacts,
      email,
      website,
      carBrands: brands,
      image: imageUrl,
      isApproved: false,
      closingDay: JSON.parse(closingDay),
      username,
      password: hashedPassword,
      requireBookingFees,
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
    await adminServices.updateAdmin(req.sc._id, scData);
    res.status(201).json({
      success: true,
      message: "Service Center Updated",
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
    //admin should be notified
    const priceList = req.body.priceList;
    const serviceCenterId = req.sc.serviceCenterId;
    const list = await adminServices.createList(serviceCenterId, priceList);
    await scServices.setPriceListDisapproved(list._id);
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

/**********************************************************
 * Visits
 **********************************************************/
exports.getVisits = async (req, res, next) => {
  try {
    let date = req.query.date;
    if (!date) {
      date = new Date();
    }
    const serviceCenterId = req.sc.serviceCenterId;
    const visits = await scServices.visits(date, serviceCenterId);
    const bookingsCalendar = await scServices.bookingsCalendar(
      serviceCenterId,
      date
    );
    const bookingClients = [];
    if (bookingsCalendar) {
      for (let bookingMap of bookingsCalendar) {
        if (bookingMap.calendar.length > 0) {
          for (let calDate of bookingMap.calendar) {
            if (calDate.date === utilities.getLocalDate(date)) {
              for (let slot of calDate.slots) {
                bookingClients.push(...slot.clients);
              }
            }
          }
        }
      }
    }
    res.status(200).json({ success: true, visits, bookings: bookingClients });
  } catch (err) {
    next(err);
  }
};

exports.getVisitorDetails = async (req, res, next) => {
  try {
    const userId = req.query.userId;
    const visitId = req.query.visitId;
    const user = await scServices.visitorDetails(userId);
    await scServices.setVisitStatus(visitId, "visited");
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

exports.postCancelVisit = async (req, res, next) => {
  try {
    const visitId = req.body.visitId;
    const status = "canceled";
    await scServices.setVisitStatus(visitId, status);
    res.status(201).json({ success: true, message: "Visit canceled!" });
  } catch (err) {
    next(err);
  }
};

/**********************************************************
 * Promotions
 **********************************************************/

exports.postCreatePromotion = async (req, res, next) => {
  try {
    const {
      promotionTitle,
      promotionDetails,
      promotionConditions,
      expiryDate,
    } = req.body;
    const serviceCenterId = req.sc.serviceCenterId;
    const promotionData = {
      promotionTitle,
      promotionDetails,
      promotionConditions,
      expiryDate: utilities.getLocalDate(expiryDate),
      serviceCenterId,
    };
    const promotion = await scServices.createPromotion(promotionData);
    if (promotion) {
      return res.status(201).json({
        success: true,
        message: "Promotion created, waiting for admin approval",
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.getAllPromotions = async (req, res, next) => {
  try {
    const serviceCenterId = req.sc.serviceCenterId;
    const promotions = await scServices.allPromotions(serviceCenterId);
    res.status(200).json({ success: true, promotions });
  } catch (err) {
    next(err);
  }
};

exports.getPromotionDetails = async (req, res, next) => {
  try {
    const promotionId = req.query.promotionId;
    const promotion = await scServices.promotionDetails(promotionId);
    res.status(200).json({ success: true, promotion });
  } catch (err) {
    next(err);
  }
};

exports.putUpdatePromotion = async (req, res, next) => {
  try {
    const {
      promotionTitle,
      promotionDetails,
      promotionConditions,
      expiryDate,
      promotionId,
    } = req.body;
    const serviceCenterId = req.sc.serviceCenterId;
    const promotionData = {
      promotionTitle,
      promotionDetails,
      promotionConditions,
      expiryDate: utilities.getLocalDate(expiryDate),
      serviceCenterId,
    };
    const promotion = await scServices.updatePromotion(
      promotionId,
      promotionData
    );
    if (promotion) {
      return res
        .status(201)
        .json({ success: true, message: "Promotion Updated" });
    }
  } catch (err) {
    next(err);
  }
};

exports.deletePromotion = async (req, res, next) => {
  try {
    const promotionId = req.query.promotionId;
    await scServices.removePromotion(promotionId);
    res.status(200).json({ success: true, message: "Promotion deleted" });
  } catch (err) {
    next(err);
  }
};

/**********************************************************
 * Booking Settings
 **********************************************************/
exports.getServicesDetails = async (req, res, next) => {
  try {
    const serviceCenterId = req.sc.serviceCenterId;
    const serviceCenter = await scServices.getUserServiceCenter(
      serviceCenterId
    );
    res.status(200).json({ success: true, serviceCenter });
  } catch (err) {
    next(err);
  }
};

exports.postCreateBookingSettings = async (req, res, next) => {
  try {
    const { services } = req.body;
    const serviceCenterId = req.sc.serviceCenterId;
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
    const serviceCenterId = req.sc.serviceCenterId;
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
exports.getBookingsCalendar = async (req, res, next) => {
  try {
    const serviceCenterId = req.sc.serviceCenterId;
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

exports.deleteClientBooking = async (req, res, next) => {
  try {
    const serviceCenterId = req.sc.serviceCenterId;
    const serviceId = req.query.serviceId;
    const slotId = req.query.slotId;
    const phone = req.query.phone;
    const date = req.query.date;
    const clientId = req.query.clientId;
    const localDate = utilities.getLocalDate(date);
    const bookingData = {
      serviceCenterId,
      serviceId,
      slotId,
      date: localDate,
      phone,
      userId: clientId,
      canceledBy: "service center",
    };
    const bookingDeleted = await scServices.cancelClientBooking(bookingData);
    if (bookingDeleted) {
      await userServices.removeBookingByServiceCenter(bookingData);
      await userServices.addCanceledBooking(bookingData);
      return res
        .status(200)
        .json({ success: true, message: "Booking Canceled" });
    }
  } catch (err) {
    next(err);
  }
};
/**********************************************************
 * Check Report
 **********************************************************/

exports.postCreateCheckReport = async (req, res, next) => {
  try {
    const {
      userId,
      clientName,
      phoneNumber,
      carBrand,
      carModel,
      date,
      visitId,
      checkDetails,
      total,
    } = req.body;
    const serviceCenterId = req.sc.serviceCenterId;
    let clientId = userId;
    if (!userId) {
      user = await userServices.getUserByUsername(phoneNumber);
      if (!user) {
        throw new Error(
          "User is not registered, please create new account and try again"
        );
      }
      clientId = user._id;
    }
    const checkData = {
      serviceCenterId,
      userId: clientId,
      clientName,
      phoneNumber,
      carBrand,
      carModel,
      date: utilities.getNowLocalDate(date),
      checkDetails,
      total,
    };
    const checkReport = await scServices.createCheckReport(checkData);
    if (visitId) {
      await scServices.setVisitStatus(visitId, "done");
    }
    const pushToken = await utilities.getFirebaseToken(clientId);
    await utilities.sendPushNotification(
      pushToken,
      "تقرير فحص",
      "لديك تقرير فحص من مركز " + req.sc.fullName
    );
    res.status(200).json({ success: true, checkReport });
  } catch (err) {
    next(err);
  }
};

exports.getCheckReports = async (req, res, next) => {
  try {
    const date = req.query.date;
    const checkReports = await scServices.checkReports(date);
    res.status(200).json({ success: true, checkReports });
  } catch (err) {
    next(err);
  }
};

exports.getCheckReport = async (req, res, next) => {
  try {
    const checkReportId = req.query.checkReportId;
    const checkReport = await scServices.checkReportDetails(checkReportId);
    const serviceCenter = await scServices.getServiceCenter(
      checkReport.serviceCenterId
    );
    res.status(200).json({
      success: true,
      checkReport,
      fixawiFareType: serviceCenter.fixawiFareType,
      fareValue: serviceCenter.fareValue,
      salesTaxEnabled: serviceCenter.salesTaxesEnabled,
      salesTaxRate: serviceCenter.salesTaxRate,
    });
  } catch (err) {
    next(err);
  }
};

exports.deleteCheckReport = async (req, res, next) => {
  try {
    const checkReportId = req.query.checkReportId;
    await scServices.removeCheckReport(checkReportId);
    res.status(200).json({ success: true, message: "check report deleted!" });
  } catch (err) {
    next(err);
  }
};

/**********************************************************
 * Invoice
 **********************************************************/

exports.getServiceCenterFees = async (req, res, next) => {
  try {
    const serviceCenterId = req.sc.serviceCenterId;
    const serviceCenter = await scServices.getServiceCenter(serviceCenterId);
    res.status(200).json({
      success: true,
      fixawiFareType: serviceCenter.fixawiFareType,
      fareValue: serviceCenter.fareValue,
      salesTaxEnabled: serviceCenter.salesTaxesEnabled,
      salesTaxRate: serviceCenter.salesTaxRate,
    });
  } catch (err) {
    next(err);
  }
};

exports.postCreateInvoice = async (req, res, next) => {
  try {
    const {
      userId,
      clientName,
      phoneNumber,
      carBrand,
      carModel,
      date,
      invoiceDetails,
      subTotal,
      checkId,
    } = req.body;
    const serviceCenterId = req.sc.serviceCenterId;
    const serviceCenter = await scServices.getServiceCenter(serviceCenterId);
    let fixawiFare;
    if (serviceCenter.fixawiFareType === "fixed amount") {
      fixawiFare = serviceCenter.fareValue;
    } else if (serviceCenter.fixawiFareType === "ratio") {
      fixawiFare = subTotal * serviceCenter.fareValue;
    } else if (serviceCenter.fixawiFareType === "subscription") {
      fixawiFare = 0;
    }
    let salesTaxAmount = serviceCenter.salesTaxesEnabled
      ? serviceCenter.salesTaxRate * subTotal
      : 0;
    let invoiceTotal = subTotal + fixawiFare + salesTaxAmount;
    const invoiceData = {
      serviceCenterId,
      userId,
      clientName,
      phoneNumber,
      carBrand,
      carModel,
      date: utilities.getNowLocalDate(date),
      invoiceDetails,
      subTotal,
      fixawiFare,
      salesTaxAmount,
      invoiceTotal,
      checkId,
    };
    const invoice = await scServices.createInvoice(invoiceData);
    const pushToken = await utilities.getFirebaseToken(userId);
    await utilities.sendPushNotification(
      pushToken,
      "فاتورة صيانه",
      "لديك فاتورة صيانه من مركز " + req.sc.fullName
    );
    res.status(200).json({ success: true, invoice });
  } catch (err) {
    next(err);
  }
};

exports.getServiceCenterInvoices = async (req, res, next) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const serviceCenterId = req.sc.serviceCenterId;
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

exports.getInvoiceDetails = async (req, res, next) => {
  try {
    const invoiceId = req.query.invoiceId;
    const invoice = await scServices.invoiceDetails(invoiceId);
    res.status(200).json({ success: true, invoice });
  } catch (err) {
    next(err);
  }
};

exports.putEditInvoice = async (req, res, next) => {
  try {
    const {
      invoiceId,
      userId,
      clientName,
      phoneNumber,
      carBrand,
      carModel,
      date,
      invoiceDetails,
      subTotal,
    } = req.body;
    const oldInvoice = await scServices.invoiceDetails(invoiceId);
    if (oldInvoice.paymentStatus === "paid") {
      throw new Error("Editing paid invoice is not premitted");
    }
    const serviceCenterId = req.sc.serviceCenterId;
    const serviceCenter = await scServices.getServiceCenter(serviceCenterId);
    let fixawiFare;
    if (serviceCenter.fixawiFareType === "fixed amount") {
      fixawiFare = serviceCenter.fareValue;
    } else if (serviceCenter.fixawiFareType === "ratio") {
      fixawiFare = subTotal * serviceCenter.fareValue;
    } else if (serviceCenter.fixawiFareType === "subscription") {
      fixawiFare = 0;
    }
    let salesTaxAmount = serviceCenter.salesTaxesEnabled
      ? serviceCenter.salesTaxRate * subTotal
      : 0;
    let invoiceTotal = subTotal + fixawiFare + salesTaxAmount;
    const invoiceData = {
      invoiceId,
      serviceCenterId,
      userId,
      clientName,
      phoneNumber,
      carBrand,
      carModel,
      date: utilities.getNowLocalDate(date),
      invoiceDetails,
      subTotal,
      fixawiFare,
      salesTaxAmount,
      invoiceTotal,
    };
    await scServices.editInvoice(invoiceData);
    res.status(200).json({ success: true, message: "invoice updated" });
  } catch (err) {
    next(err);
  }
};

exports.getShowBalance = async (req, res, next) => {
  try {
    const serviceCenterId = req.sc.serviceCenterId;
    const wallet = await scServices.getWallet(serviceCenterId);
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
