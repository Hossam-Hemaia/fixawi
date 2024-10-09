const connectRedis = require("../config/redisConnect");
const userServices = require("../services/userServices");
const scServices = require("../services/scServices");
const ratingServices = require("../services/ratingServices");
const utilities = require("../utils/utilities");

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
    const userId = req.userId;
    const userData = {
      fullName,
      email,
      phoneNumber,
      carBrand,
      carModel,
    };
    await userServices.updateProfile(userId, userData);
    res.status(200).json({ success: true, message: "User profile updated" });
  } catch (err) {
    next(err);
  }
};

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
    const { lat, lng, maxDistance, carBrand, serviceType } = req.query;
    if (!lat || !lng || lat === "" || lng === "") {
      const error = new Error("Location coordenates are required!");
      error.statusCode = 422;
      throw error;
    }
    const distance = maxDistance || 5000;
    const coords = [lng, lat];
    const filter = {
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: coords,
          },
          $maxDistance: distance,
        },
      },
    };
    if (carBrand && carBrand !== "") {
      filter.carBrands = { $elemMatch: { $regex: new RegExp(carBrand, "i") } };
    }
    if (serviceType && serviceType !== "") {
      filter.serviceType = serviceType;
    }
    const filteredCenters = await userServices.filterCenters(filter);
    res.status(200).json({ success: true, serviceCenters: filteredCenters });
  } catch (err) {
    next(err);
  }
};

exports.postReviewServiceCenter = async (req, res, next) => {
  try {
    const serviceCenterId = req.body.serviceCenterId;
    const rating = +req.body.rating;
    const review = req.body.review;
    const userId = req.userId;
    const ratingId = req.body.ratingId;
    const ratingData = {
      serviceCenterId,
      rating,
      review,
      userId,
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

exports.getServicesCategories = async (req, res, next) => {
  try {
    const categories = await userServices.servicesCategories();
    res.status(200).json({ success: true, categories });
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
    // Create a Visit transaction and let it appear on the service center visits page
    // and the user app - with the ability to cancel the visit from the user side
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
