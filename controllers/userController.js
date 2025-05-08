const connectRedis = require("../config/redisConnect");
const adminServices = require("../services/adminServices");
const userServices = require("../services/userServices");
const scServices = require("../services/scServices");
const ratingServices = require("../services/ratingServices");
const orderServices = require("../services/orderServices");
const driverServices = require("../services/driverServices");
const utilities = require("../utils/utilities");

/**********************************************
 * User Profile
 **********************************************/

exports.getUserProfile = async (req, res, next) => {
  try {
    const userId = req.userId;
    const user = await userServices.findUserById(userId);
    res.status(200).json({ success: true, user });
  } catch (err) {
    next(err);
  }
};

exports.putUpdateProfile = async (req, res, next) => {
  try {
    const { fullName, email, phoneNumber, carBrand, carModel } = req.body;
    const file = req.files[0];
    let imgUrl = "";
    if (file) {
      let url = `${req.protocol}://${req.get("host")}/files/${file.path}`;
      imgUrl = url;
    }

    const userId = req.userId;
    const userData = {
      fullName,
      email,
      phoneNumber,
      userImage: imgUrl,
      carBrand,
      carModel,
    };
    await userServices.updateProfile(userId, userData);
    res.status(200).json({ success: true, message: "User profile updated" });
  } catch (err) {
    next(err);
  }
};

exports.getCarsBrands = async (req, res, next) => {
  try {
    const brands = await userServices.carsBrands();
    res.status(200).json({ success: true, brands });
  } catch (err) {
    next(err);
  }
};

exports.getCarModels = async (req, res, next) => {
  try {
    const brandId = req.query.brandId;
    const models = await userServices.carModels(brandId);
    res.status(200).json({ success: true, models });
  } catch (err) {
    next(err);
  }
};

exports.postAddUserCar = async (req, res, next) => {
  try {
    const userId = req.userId;
    const { carNumber, carBrand, carModel, modelYear, isDefaultCar } = req.body;
    const carData = { carNumber, carBrand, carModel, modelYear, isDefaultCar };
    await userServices.addUserCar(userId, carData);
    res.status(200).json({ success: true, message: "Car added" });
  } catch (err) {
    next(err);
  }
};

exports.deleteUserCar = async (req, res, next) => {
  try {
    const carId = req.query.carId;
    const userId = req.userId;
    await userServices.removeUserCar(userId, carId);
    res.status(200).json({ success: true, message: "Car removed" });
  } catch (err) {
    next(err);
  }
};

exports.patchSetDefaultCar = async (req, res, next) => {
  try {
    const carId = req.body.carId;
    const userId = req.userId;
    await userServices.setUserDefaultCar(userId, carId);
    res.status(200).json({ success: true, message: "Default Car Set" });
  } catch (err) {
    next(err);
  }
};

exports.postFirebaseToken = async (req, res, next) => {
  try {
    const token = req.body.firebaseToken;
    const userId = req.userId;
    const cacheDb = await connectRedis.getRedisConnection();
    await cacheDb.hSet(`${userId}`, "fbaseToken", JSON.stringify(token));
    res
      .status(201)
      .json({ success: true, message: "firebase token registered" });
  } catch (err) {
    next(err);
  }
};

/**********************************************
 * Search Filtering
 **********************************************/

exports.getNearServiceCenters = async (req, res, next) => {
  try {
    const { lat, lng, maxDistance } = req.query;
    const coords = [lng, lat];
    const nearestCenters = await userServices.nearestServiceCenters(
      coords,
      maxDistance
    );
    res.status(200).json({ success: true, serviceCenters: nearestCenters });
  } catch (err) {
    next(err);
  }
};

exports.filterServiceCenters = async (req, res, next) => {
  try {
    const { lat, lng, maxDistance, carBrand, serviceNames } = req.query;
    // if (!lat || !lng || lat === "" || lng === "") {
    //   const error = new Error("Location coordenates are required!");
    //   error.statusCode = 422;
    //   throw error;
    // }
    let services = [];
    if (serviceNames) {
      services = JSON.parse(serviceNames);
    }
    const filter = {
      isActive: true,
      isApproved: true,
    };
    let location;
    if (lat && lng && lat !== "" && lng !== "") {
      const distance = maxDistance || 20000;
      const coords = [lat, lng];
      location = {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: coords,
          },
          $maxDistance: distance,
        },
      };
      filter.location = location;
    }
    if (carBrand && carBrand !== "") {
      filter.carBrands = { $elemMatch: { $regex: new RegExp(carBrand, "i") } };
    }
    if (services && services.length > 0) {
      filter.serviceTypes = {
        $all: services.map((name) => new RegExp(name, "i")),
      };
    }
    console.log(filter);
    const filteredCenters = await userServices.filterCenters(filter);
    res.status(200).json({ success: true, serviceCenters: filteredCenters });
  } catch (err) {
    next(err);
  }
};

/**********************************************
 * Service Center
 **********************************************/

exports.postReviewServiceCenter = async (req, res, next) => {
  try {
    const serviceCenterId = req.body.serviceCenterId;
    const rating = +req.body.rating;
    const review = req.body.review;
    const userId = req.userId;
    const ratingId = req.body.ratingId;
    const user = await userServices.findUserById(userId);
    const ratingData = {
      serviceCenterId,
      rating,
      review,
      userId,
      userName: user.fullName,
      ratingId,
    };
    const serviceCenterRatings = await ratingServices.findRatings(
      serviceCenterId
    );
    let rated;
    if (serviceCenterRatings) {
      rated = await ratingServices.setRating(ratingData);
    } else {
      rated = await ratingServices.createRating(ratingData);
    }
    res
      .status(201)
      .json({ success: true, message: "Your rating has been submitted" });
  } catch (err) {
    next(err);
  }
};

exports.getServiceCenterRatings = async (req, res, next) => {
  try {
    const ratingId = req.query.ratingId;
    const ratings = await ratingServices.getRatings(ratingId);
    res.status(200).json({ success: true, ratings });
  } catch (err) {
    next(err);
  }
};

exports.getServicesCategories = async (req, res, next) => {
  try {
    const categories = await userServices.servicesCategories();
    res.status(200).json({ success: true, categories });
  } catch (err) {
    next(err);
  }
};

exports.getMainCategories = async (req, res, next) => {
  try {
    const mainCategories = await adminServices.allCategories();
    res.status(200).json({ success: true, mainCategories });
  } catch (err) {
    next(err);
  }
};

exports.getSubCategories = async (req, res, next) => {
  try {
    const categoryId = req.query.categoryId;
    const subCategories = await userServices.subCategories(categoryId);
    res.status(200).json({ success: true, subCategories });
  } catch (err) {
    next(err);
  }
};

exports.getCategorizedServiceCenters = async (req, res, next) => {
  try {
    const serviceName = req.query.serviceName;
    const serviceCenters = await userServices.findServiceCenters(serviceName);
    res.status(200).json({ success: true, serviceCenters });
  } catch (err) {
    next(err);
  }
};

exports.getServiceCenterDetails = async (req, res, next) => {
  try {
    const serviceCenterId = req.query.serviceCenterId;
    const serviceCenter = await scServices.getUserServiceCenter(
      serviceCenterId
    );
    return res.status(200).json({ success: true, serviceCenter });
  } catch (err) {
    next(err);
  }
};

exports.postVisitServiceCenter = async (req, res, next) => {
  try {
    const { serviceCenterId, lng, lat } = req.body;
    const userId = req.userId;
    const serviceCenter = await scServices.getUserServiceCenter(
      serviceCenterId
    );
    const fromPoint = {
      lat,
      lng,
    };
    const toPoint = {
      lat: serviceCenter.location.coordinates[0],
      lng: serviceCenter.location.coordinates[1],
    };
    const locations = { fromPoint, toPoint };
    const data = await utilities.getDrivingRoute(locations, false);
    const drivingRoute = data.paths[0].points;
    const distance = data.paths[0].distance / 1000;
    const estimatedTime = data.paths[0].time / 1000 / 60;
    const visitData = {
      visitDate: utilities.getLocalDate(new Date()),
      userId,
      serviceCenterId,
    };
    await userServices.createVisit(visitData);
    res.status(200).json({
      success: true,
      data: {
        route: drivingRoute,
        km: distance,
        time: estimatedTime,
      },
    });
  } catch (err) {
    next(err);
  }
};

exports.postContactUs = async (req, res, next) => {
  try {
    const { fullName, phoneNumber, email, subject, message } = req.body;
    const contactUsData = {
      fullName,
      phoneNumber,
      email,
      subject,
      message,
    };
    const msg = await userServices.contactUs(contactUsData);
    if (msg) {
      return res.status(200).json({ success: true, message: "Message sent" });
    }
  } catch (err) {
    next(err);
  }
};

exports.postAddCarMaintenance = async (req, res, next) => {
  try {
    const { carId, serviceName, notes, kilometer, date, remindingDate } =
      req.body;
    const userId = req.userId;
    const maintenanceData = {
      carId,
      serviceName,
      notes,
      kilometer,
      date: utilities.getLocalDate(date),
      remindingDate: utilities.getLocalDate(remindingDate),
    };
    const maintenance = await userServices.addCarMaintenance(
      userId,
      maintenanceData
    );
    if (maintenance) {
      return res
        .status(201)
        .json({ success: true, message: "Maintenance reminder has been set" });
    }
  } catch (err) {
    next(err);
  }
};

exports.getUserCarMaintenance = async (req, res, next) => {
  try {
    const carId = req.query.carId;
    const userId = req.userId;
    const maintenances = await userServices.carMaintenances(userId, carId);
    res.status(200).json({ success: true, maintenances });
  } catch (err) {
    next(err);
  }
};

exports.deleteCarMaintenance = async (req, res, next) => {
  try {
    const maintenanceId = req.query.maintenanceId;
    const userId = req.userId;
    await userServices.removeCarMaintenance(userId, maintenanceId);
    res.status(200).json({ success: true, message: "maintenance removed" });
  } catch (err) {
    next(err);
  }
};

/**********************************************
 * Rescue Controllers
 **********************************************/
exports.getDeliveryData = async (req, res, next) => {
  try {
    const { fromPointLat, fromPointLng, toPointLat, toPointLng, service } =
      req.query;
    const locations = {
      fromPoint: { lat: fromPointLat, lng: fromPointLng },
      toPoint: { lat: toPointLat, lng: toPointLng },
    };
    const data = await utilities.getDrivingRoute(locations, false);
    const deliveryRoute = data.paths[0].points;
    const distance = data.paths[0].distance / 1000;
    const estimatedTime = data.paths[0].time / 1000 / 60;
    let price = 0;
    let serviceDownPayment = 0;
    if (service === "rescue") {
      const { totalPrice, downPayment } = await utilities.getRescuePrice(
        distance
      );
      price = totalPrice;
      serviceDownPayment = downPayment;
    }
    res.status(200).json({
      route: deliveryRoute,
      km: distance.toFixed(2),
      time: estimatedTime + " Mnts",
      price: Number(price.toFixed(2)),
      downPayment: Number(serviceDownPayment),
    });
  } catch (err) {
    next(err);
  }
};

exports.postCreateRescueOrder = async (req, res, next) => {
  try {
    const {
      fromPointLat,
      fromPointLng,
      toPointLat,
      toPointLng,
      downPayment,
      rescuePrice,
    } = req.body;
    const user = await userServices.findUserById(req.userId);
    const fromPoint = {
      lat: fromPointLat,
      lng: fromPointLng,
    };
    const toPoint = {
      lat: toPointLat,
      lng: toPointLng,
    };
    const orderNumber = await orderServices.getNextOrderNumber();
    const orderStatus = { state: "pending", date: new Date() };
    const orderData = {
      orderNumber,
      fromPoint,
      toPoint,
      clientName: user.fullName,
      phoneNumber: user.phoneNumber,
      downPayment,
      rescuePrice,
      paymentStatus: "Pending Payment",
      orderStatus,
      clientId: user._id,
    };
    // find closest available driver
    const coords = [fromPointLng, fromPointLat];
    const drivers = await driverServices.findClosestDriver(coords);
    let order;
    if (drivers.length > 0) {
      order = await orderServices.createOrder(orderData);
      if (!order) {
        const error = new Error("creating order failed!");
        error.statusCode = 422;
        throw error;
      }
      const driver = drivers[0];
      await driverServices.sendOrder(driver.phoneNumber, order);
    } else {
      const error = new Error("No drivers available!");
      error.statusCode = 404;
      throw error;
    }
    res.status(201).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

exports.getUserRescueOrders = async (req, res, next) => {
  try {
    const userId = req.userId;
    const orders = await orderServices.userRescueOrders(userId);
    res.status(200).json({ success: true, orders });
  } catch (err) {
    next(err);
  }
};

exports.getUserRescueOrderDetails = async (req, res, next) => {
  try {
    const orderId = req.query.orderId;
    const order = await orderServices.findOrder(orderId);
    res.status(200).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

exports.postResendRescueOrder = async (req, res, next) => {
  try {
    const orderId = req.body.orderId;
    const order = await orderServices.findOrder(orderId);
    const coords = [order.fromPoint.lng, order.fromPoint.lat];
    const drivers = await driverServices.findClosestDriver(coords);
    if (drivers.length > 0) {
      const driver = drivers[0];
      await driverServices.sendOrder(driver.phoneNumber, order);
    } else {
      const error = new Error("No drivers available!");
      error.statusCode = 404;
      throw error;
    }
    res.status(201).json({ success: true, order });
  } catch (err) {
    next(err);
  }
};

exports.postCancelRescueOrder = async (req, res, next) => {
  try {
    const orderId = req.body.orderId;
    const order = await orderServices.updateOrderStatus(orderId, "canceled");
    if (order.driverId) {
      const io = require("../socket").getIo();
      const driverSocket = await utilities.getSocketId(
        order.driverId.phoneNumber
      );
      io.to(driverSocket).emit("order_canceled", order);
    }
    res.status(201).json({ success: true, message: "Order canceled" });
  } catch (err) {
    next(err);
  }
};

exports.postPayRescueOrder = async (req, res, next) => {
  try {
    const orderId = req.body.orderId;
    const paymentMethod = req.body.paymentMethod;
    const order = await orderServices.payOrder(orderId, paymentMethod);
    if (order) {
      res.status(201).json({
        success: true,
        message: order.clientConsent
          ? "Order paid successfully"
          : "Order paid, but client did not confirm car transportation",
      });
    }
  } catch (err) {
    next(err);
  }
};

exports.postReviewDriver = async (req, res, next) => {
  try {
    const driverId = req.body.driverId;
    const rating = +req.body.rating;
    const review = req.body.review;
    const userId = req.userId;
    const user = await userServices.findUserById(userId);
    const ratingId = req.body.ratingId;
    const ratingData = {
      driverId,
      rating,
      review,
      userId,
      userName: user.fullName,
    };
    const driverRatings = await ratingServices.findDriverRatings(driverId);
    let rated;
    if (driverRatings) {
      ratingData.ratingId = driverRatings._id;
      rated = await ratingServices.setDriverRating(ratingData);
    } else {
      rated = await ratingServices.createDriverRating(ratingData);
    }
    res
      .status(201)
      .json({ success: true, message: "Your rating has been submitted" });
  } catch (err) {
    next(err);
  }
};

exports.getDriverRatings = async (req, res, next) => {
  try {
    const ratingId = req.query.ratingId;
    const ratings = await ratingServices.getDriverRatings(ratingId);
    res.status(200).json({ success: true, ratings });
  } catch (err) {
    next(err);
  }
};

/**********************************************
 * Promotions
 **********************************************/

exports.getClientPromotions = async (req, res, next) => {
  try {
    const promotions = await userServices.clientPromotions();
    res.status(200).json({ success: true, promotions });
  } catch (err) {
    next(err);
  }
};

/**********************************************
 * Booking Controllers
 **********************************************/
exports.getUserBookingCalendar = async (req, res, next) => {
  try {
    const { serviceCenterId, serviceId } = req.query;
    const serviceCenter = await scServices.getServiceCenter(serviceCenterId);
    const openingHour = serviceCenter.openAt;
    const closingHour = serviceCenter.closeAt;
    const bookingSettings = await scServices.bookingSettings(serviceCenterId);
    if (!bookingSettings) {
      throw new Error("Booking plan has not been set!");
    }
    const service = bookingSettings.services.find((service) => {
      return service.serviceId._id.toString() === serviceId.toString();
    });
    const currentDate = utilities.getLocalDate(new Date());
    const calendar = utilities.makeBookingCalendar(
      service.averageTime,
      openingHour,
      closingHour,
      currentDate
    );
    const bookedDays = await userServices.getBookedDays(
      serviceCenterId,
      serviceId,
      currentDate
    );
    if (bookedDays.length <= 0) {
      return res.status(200).json({ success: true, calendar: calendar });
    } else {
      const mergedCalendar = utilities.mergeBookedSlots(
        bookedDays[0].calendar,
        calendar
      );
      return res.status(200).json({ success: true, calendar: mergedCalendar });
    }
  } catch (err) {
    next(err);
  }
};

exports.postCreateBooking = async (req, res, next) => {
  try {
    const {
      serviceCenterId,
      serviceId,
      date,
      time,
      carBrand,
      carModel,
      malfunction,
      slotNumber,
      promotionId,
    } = req.body;
    const userId = req.userId;
    const user = await userServices.findUserById(userId);
    const serviceCenter = await scServices.getUserServiceCenter(
      serviceCenterId
    );
    const bookingSettings = await scServices.bookingSettings(serviceCenterId);
    if (!bookingSettings) {
      throw new Error("Booking plan has not been set!");
    }
    const service = bookingSettings.services.find((service) => {
      return service.serviceId._id.toString() === serviceId.toString();
    });
    const bookingData = {
      serviceCenterId,
      serviceId,
      maximumCapacity: bookingSettings.maximumCapacity,
      serviceName: service.serviceId.subCategoryName,
      slotCapacity: service.capacity,
      date: utilities.getLocalDate(date),
      time,
      clientId: userId,
      clientName: user.fullName,
      phone: user.phoneNumber,
      carBrand,
      carModel,
      malfunction,
      promotionId,
    };
    const booking = await userServices.bookVisit(bookingData);
    if (booking) {
      const userBooking = {
        date: bookingData.date,
        time: bookingData.time,
        turn: slotNumber,
        carBrand,
        carModel,
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
    next(err);
  }
};

exports.putEditUserBooking = async (req, res, next) => {
  try {
    const { bookingId, date, time, slotNumber } = req.body;
    const userId = req.userId;
    const user = await userServices.findUserById(userId);
    const oldBookingData = user.myBookings.find((booking) => {
      return booking._id.toString() === bookingId.toString();
    });
    oldBookingData.phone = user.phoneNumber;
    const bookingSettings = await scServices.bookingSettings(
      oldBookingData.serviceCenterId
    );
    const service = bookingSettings.services.find((service) => {
      return (
        service.serviceId._id.toString() === oldBookingData.serviceId.toString()
      );
    });
    const bookingData = {
      serviceCenterId: oldBookingData.serviceCenterId,
      serviceId: oldBookingData.serviceId,
      serviceName: service.serviceId.subCategoryName,
      slotCapacity: service.capacity,
      date: utilities.getLocalDate(date),
      time,
      clientId: userId,
      clientName: user.fullName,
      phone: user.phoneNumber,
      carBrand: oldBookingData.carBrand,
      carModel: oldBookingData.carModel,
      malfunction: oldBookingData.malfunction,
    };
    const oldBookingRemoved = await userServices.removeBooking(oldBookingData);
    if (oldBookingRemoved) {
      const booking = await userServices.bookVisit(bookingData);
      if (booking) {
        const userBooking = {
          date: bookingData.date,
          time: bookingData.time,
          turn: slotNumber,
          carBrand: oldBookingData.carBrand,
          carModel: oldBookingData.carModel,
          malfunction: oldBookingData.malfunction,
          service: bookingData.serviceName,
          serviceId: bookingData.serviceId,
          serviceCenter: oldBookingData.serviceCenter,
          serviceCenterId: bookingData.serviceCenterId,
        };
        await user.deleteBooking(bookingId);
        user.myBookings.push(userBooking);
        await user.save();
        res
          .status(201)
          .json({ success: true, message: "Booking successful", booking });
      }
    }
  } catch (err) {
    next(err);
  }
};

exports.deleteUserBooking = async (req, res, next) => {
  try {
    const bookingId = req.query.bookingId;
    const reason = req.query.reason;
    const userId = req.userId;
    const user = await userServices.findUserById(userId);
    const oldBookingData = user.myBookings.find((booking) => {
      return booking._id.toString() === bookingId.toString();
    });
    oldBookingData.userId = userId;
    oldBookingData.clientName = user.fullName;
    oldBookingData.phone = user.phoneNumber;
    oldBookingData.canceledBy = "client";
    oldBookingData.reason = reason;
    const oldBookingRemoved = await userServices.removeBooking(oldBookingData);
    if (oldBookingRemoved) {
      await userServices.addCanceledBooking(oldBookingData);
      await user.deleteBooking(bookingId);
      await user.save();
      return res
        .status(200)
        .json({ success: true, message: "Your booking is canceled" });
    }
  } catch (err) {
    next(err);
  }
};

exports.getBookingsDetails = async (req, res, next) => {
  try {
    const userId = req.userId;
    const bookings = await userServices.userBookings(userId);
    res.status(200).json({ success: true, myBookings: bookings });
  } catch (err) {
    next(err);
  }
};

exports.getUserCanceledBookings = async (req, res, next) => {
  try {
    const userId = req.userId;
    const canceledBookings = await userServices.userCanceledBookings(userId);
    res.status(200).json({ success: true, canceledBookings });
  } catch (err) {
    next(err);
  }
};

/******************************************
 * FAVORITES
 ******************************************/

exports.postAddToFavorite = async (req, res, next) => {
  try {
    const serviceCenterId = req.body.serviceCenterId;
    const userId = req.userId;
    const userFavorites = await userServices.addFavorite(
      userId,
      serviceCenterId
    );
    if (userFavorites) {
      return res
        .status(201)
        .json({ success: true, message: "Service Center added to favorites" });
    }
  } catch (err) {
    next(err);
  }
};

exports.getMyFavorites = async (req, res, next) => {
  try {
    const userId = req.userId;
    const favorites = await userServices.myFavorites(userId);
    res.status(200).json({ success: true, favorites });
  } catch (err) {
    next(err);
  }
};

exports.removeFromFavorite = async (req, res, next) => {
  try {
    const userId = req.userId;
    const serviceCenterId = req.query.serviceCenterId;
    await userServices.removeFromFavorites(userId, serviceCenterId);
    res.status(200).json({
      success: true,
      message: "Service center removed from favorites",
    });
  } catch (err) {
    next(err);
  }
};

/******************************************
 * Check Reports
 ******************************************/
exports.getMyCheckReports = async (req, res, next) => {
  try {
    const userId = req.userId;
    const checkReports = await userServices.myCheckReports(userId);
    res.status(200).json({ success: true, checkReports });
  } catch (err) {
    next(err);
  }
};

exports.getCheckReportDetails = async (req, res, next) => {
  try {
    const checkReportId = req.query.checkReportId;
    const reportDetails = await userServices.getCheckReportDetails(
      checkReportId
    );
    res.status(200).json({ success: true, reportDetails });
  } catch (err) {
    next(err);
  }
};

exports.postConfirmCheckReport = async (req, res, next) => {
  try {
    const { checkReportId, checkDetails } = req.body;
    const updatedCheckReport = await userServices.updateCheckReport(
      checkReportId,
      checkDetails
    );
    if (updatedCheckReport.reportStatus === "confirmed") {
      return res
        .status(201)
        .json({ success: true, message: "Check Report Confirmed" });
    }
  } catch (err) {
    next(err);
  }
};

exports.postDeclineCheckReport = async (req, res, next) => {
  try {
    const checkReportId = req.body.checkReportId;
    await userServices.declineCheckReport(checkReportId);
    res.status(201).json({ success: true, message: "Check report declined" });
  } catch (err) {
    next(err);
  }
};

/******************************************
 * Invoices
 ******************************************/

exports.getMyInvoices = async (req, res, next) => {
  try {
    const userId = req.userId;
    const invoices = await userServices.myInvoices(userId);
    res.status(200).json({ success: true, invoices });
  } catch (err) {
    next(err);
  }
};

exports.postPayInvoice = async (req, res, next) => {
  try {
    const invoiceId = req.body.invoiceId;
    const paymentMethod = req.body.paymentMethod;
    const paidInvoice = await userServices.payInvoice(invoiceId, paymentMethod);
    if (paidInvoice) {
      return res
        .status(201)
        .json({ success: true, message: "Invoice paid successfully" });
    }
  } catch (err) {
    next(err);
  }
};
