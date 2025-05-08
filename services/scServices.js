const ServiceCenter = require("../models/service_center");
const ServiceCategory = require("../models/service_types");
const Visit = require("../models/visit");
const User = require("../models/user");
const PriceList = require("../models/priceList");
const Promotion = require("../models/promotion");
const BookingSettings = require("../models/bookingSettings");
const Booking = require("../models/booking");
const Check = require("../models/check");
const Invoice = require("../models/invoice");
const Wallet = require("../models/wallet");
const Movement = require("../models/movement");
const Settings = require("../models/settings");
const utilities = require("../utils/utilities");

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
    throw err;
  }
};

exports.getUserServiceCenter = async (serviceCenterId) => {
  try {
    const serviceCenter = await ServiceCenter.findById(serviceCenterId, {
      username: 0,
      password: 0,
      createdAt: 0,
      updatedAt: 0,
    }).populate(["offerId", "serviceCategoryIds", "priceListId"]);
    return serviceCenter;
  } catch (err) {
    throw err;
  }
};

exports.visits = async (date, serviceCenterId) => {
  try {
    const localDate = utilities.getLocalDate(date);
    const visits = await Visit.find({
      visitDate: { $gte: localDate },
      serviceCenterId: serviceCenterId,
    })
      .populate([{ path: "userId", select: "-myBookings" }])
      .sort({ createdAt: -1 });
    return visits;
  } catch (err) {
    throw err;
  }
};

exports.setVisitStatus = async (visitId, checkReportId, status) => {
  try {
    const visit = await Visit.findById(visitId);
    if (visit) {
      if (checkReportId && checkReportId !== "") {
        visit.checkReportId = checkReportId;
      }
      visit.visitStatus = status;
      await visit.save();
    }
  } catch (err) {
    throw err;
  }
};

exports.visitorDetails = async (userId) => {
  try {
    const user = await User.findById(userId, {
      fullName: 1,
      phoneNumber: 1,
      userCars: 1,
    });
    return user;
  } catch (err) {
    throw err;
  }
};

exports.createPromotion = async (promotionData) => {
  try {
    const promotion = new Promotion(promotionData);
    await promotion.save();
    return promotion;
  } catch (err) {
    throw err;
  }
};

exports.allPromotions = async (serviceCenterId) => {
  try {
    const promotions = await Promotion.find({ serviceCenterId });
    return promotions;
  } catch (err) {
    throw err;
  }
};

exports.promotionDetails = async (promotionId) => {
  try {
    const promotion = await Promotion.findById(promotionId);
    return promotion;
  } catch (err) {
    throw err;
  }
};

exports.updatePromotion = async (promotionId, promotionData) => {
  try {
    const updateData = {};
    for (let key in promotionData) {
      if (promotionData[key] !== "") {
        updateData[key] = promotionData[key];
      }
    }
    const updatedPromotion = await Promotion.findByIdAndUpdate(
      promotionId,
      updateData
    );
    if (updatedPromotion.approved) {
      updatedPromotion.approved = false;
      await updatedPromotion.save();
    }
    return updatedPromotion;
  } catch (err) {
    throw err;
  }
};

exports.removePromotion = async (promotionId) => {
  try {
    await Promotion.findByIdAndDelete(promotionId);
    return true;
  } catch (err) {
    next(err);
  }
};

exports.createBookingSettings = async (bookingSettings) => {
  try {
    const oldBookingSettings = await BookingSettings.findOne({
      serviceCenterId: bookingSettings.serviceCenterId,
    });
    if (oldBookingSettings) {
      throw new Error(
        "You already created booking settings, please update it instead"
      );
    }
    const booking = new BookingSettings(bookingSettings);
    booking.save();
    return booking;
  } catch (err) {
    throw err;
  }
};

exports.bookingSettings = async (serviceCenterId) => {
  try {
    const bookingSettings = await BookingSettings.findOne({
      serviceCenterId,
    }).populate({ path: "services.serviceId" });
    return bookingSettings;
  } catch (err) {
    throw err;
  }
};

exports.updateBookingSettings = async (bookingSettingsId, bookingData) => {
  try {
    const bookingSettings = await BookingSettings.findById(bookingSettingsId);
    bookingSettings.services = bookingData.services;
    bookingSettings.maximumCapacity = bookingData.maximumCapacity;
    await bookingSettings.save();
    return bookingSettings;
  } catch (err) {
    throw err;
  }
};

exports.bookingsCalendar = async (serviceCenterId, date) => {
  try {
    const localDate = utilities.getLocalDate(date);
    const futureDate = utilities.getFutureDate(date, 7);
    const bookingCalendar = await Booking.find({
      serviceCenterId,
      "calendar.date": { $gte: localDate, $lte: futureDate },
    }).lean();
    return bookingCalendar;
  } catch (err) {
    throw err;
  }
};

exports.setBookingStatus = async (
  checkReportId,
  bookingId,
  visitId,
  date,
  time,
  bookingStatus
) => {
  try {
    const bookingData = {
      checkReportId,
      visitId,
      date: utilities.convertToStartOfDay(date),
      time,
      status: bookingStatus,
    };
    const bookingCalendar = await Booking.findById(bookingId);
    const booking = await bookingCalendar.updateBooking(bookingData);
    if (booking) {
      return true;
    }
  } catch (err) {
    throw err;
  }
};

exports.createCheckReport = async (checkData) => {
  try {
    const checkReport = new Check(checkData);
    await checkReport.save();
    return checkReport;
  } catch (err) {
    throw err;
  }
};

exports.checkReports = async (date, serviceCenterId) => {
  try {
    const localDate = utilities.getLocalDate(date);
    const checkReports = await Check.find({
      serviceCenterId,
      date: { $gte: localDate },
    }).sort({ createdAt: -1 });
    return checkReports;
  } catch (err) {
    throw err;
  }
};

exports.checkReportDetails = async (checkReportId) => {
  try {
    const checkReport = await Check.findById(checkReportId);
    return checkReport;
  } catch (err) {
    throw err;
  }
};

exports.removeCheckReport = async (checkReportId) => {
  try {
    await Check.findByIdAndDelete(checkReportId);
  } catch (err) {
    throw err;
  }
};

exports.cancelClientBooking = async (bookingData) => {
  try {
    const bookingCalendar = await Booking.findOne({
      serviceCenterId: bookingData.serviceCenterId,
      serviceId: bookingData.serviceId,
    });
    const settings = await Settings.findOne();
    bookingData.allowedCancelHours = settings.CancelBookingHours;
    const canceledBooking = await bookingCalendar.cancelBooking(bookingData);
    return canceledBooking;
  } catch (err) {
    throw err;
  }
};

exports.createInvoice = async (invoiceData) => {
  try {
    const today = new Date();
    const datePrefix = `${today.getFullYear()}${(today.getMonth() + 1)
      .toString()
      .padStart(2, "0")}${today.getDate().toString().padStart(2, "0")}`;
    // Count invoices created
    const count = await Invoice.countDocuments({
      serviceCenterId: invoiceData.serviceCenterId,
    });
    // Increment count for the new invoice
    const invoiceNumber = `${datePrefix}${count + 1}`;
    const invoice = new Invoice(invoiceData);
    invoice.invoiceNumber = invoiceNumber;
    await invoice.save();
    const checkReport = await Check.findById(invoiceData.checkId);
    if (checkReport) {
      checkReport.reportStatus = "invoiced";
      await checkReport.save();
    }
    if (checkReport.isBooking) {
      await this.setBookingStatus(
        checkReport._id,
        checkReport.bookingCalendarId,
        checkReport.slotId,
        checkReport.date,
        checkReport.bookingTime,
        "invoiced"
      );
    }
    return invoice;
  } catch (err) {
    throw err;
  }
};

exports.serviceCenterInvoices = async (dateFrom, dateTo, serviceCenterId) => {
  try {
    const localStartDate = utilities.getLocalDate(dateFrom);
    const localEndDate = utilities.getEndLocalDate(dateTo);
    const invoices = await Invoice.find({
      createdAt: { $gte: localStartDate, $lte: localEndDate },
      serviceCenterId: serviceCenterId,
    });
    return invoices;
  } catch (err) {
    throw err;
  }
};

exports.invoiceDetails = async (invoiceId) => {
  try {
    const invoice = await Invoice.findById(invoiceId);
    return invoice;
  } catch (err) {
    throw err;
  }
};

exports.editInvoice = async (invoiceData) => {
  try {
    const updateData = {};
    for (let key in invoiceData) {
      if (invoiceData[key] !== "") {
        updateData[key] = invoiceData[key];
      }
    }
    const invoice = await Invoice.findByIdAndUpdate(
      invoiceData.invoiceId,
      updateData
    );
    return invoice;
  } catch (err) {
    throw err;
  }
};

exports.getWallet = async (serviceCenterId) => {
  try {
    const serviceCenter = await ServiceCenter.findById(serviceCenterId);
    const wallet = await Wallet.findById(serviceCenter.walletId);
    return wallet;
  } catch (err) {
    throw err;
  }
};

exports.balanceMovement = async (walletId, dateFrom, dateTo) => {
  try {
    const movements = await Movement.find({
      walletId: walletId,
      movementDate: { $gte: dateFrom, $lte: dateTo },
    }).sort({ createdAt: -1 });
    return movements;
  } catch (err) {
    throw err;
  }
};
