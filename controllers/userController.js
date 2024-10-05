const userServices = require("../services/userServices");
const scServices = require("../services/scServices");
const ratingServices = require("../services/ratingServices");

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
    res.status(200).json({success: true, ratings})
  } catch (err) {
    next(err);
  }
};
