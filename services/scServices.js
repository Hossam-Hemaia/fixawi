const ServiceCenter = require("../models/service_center");
const ServiceCategory = require("../models/service_types");
const Visit = require("../models/visit");
const User = require("../models/user");
const PriceList = require("../models/priceList");
const BookingSettings = require("../models/bookingSettings");
const Booking = require("../models/booking");
const Check = require("../models/check");
const Invoice = require("../models/invoice");
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
    console.log(priceListId);
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
    }).populate(["offerId", "serviceCategoryIds"]);
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

exports.setVisitStatus = async (visitId, status) => {
  try {
    const visit = await Visit.findById(visitId);
    visit.visitStatus = status;
    await visit.save();
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

exports.createBookingSettings = async (bookingSettings) => {
  try {
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
    });
    return bookingCalendar;
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

exports.checkReports = async (date) => {
  try {
    const localDate = utilities.getLocalDate(date);
    const checkReports = await Check.find({
      createdAt: { $gte: localDate },
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
    const canceledBooking = await bookingCalendar.cancelBooking(bookingData);
    return canceledBooking;
  } catch (err) {
    throw err;
  }
};

exports.createInvoice = async (invoiceData) => {
  try {
    const invoice = new Invoice(invoiceData);
    await invoice.save();
    return invoice;
  } catch (err) {
    throw err;
  }
};
