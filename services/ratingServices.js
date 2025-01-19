const Rating = require("../models/rating");
const DriverRating = require("../models/driverRating");
const ServiceCenter = require("../models/service_center");
const Driver = require("../models/driver");

exports.createRating = async (ratingData) => {
  try {
    const rating = new Rating({
      serviceCenterId: ratingData.serviceCenterId,
      reviews: [
        {
          userId: ratingData.userId,
          userName: ratingData.userName,
          rating: ratingData.rating,
          review: ratingData.review,
        },
      ],
    });
    await rating.save();
    const serviceCenter = await ServiceCenter.findById(
      ratingData.serviceCenterId
    );
    serviceCenter.ratingId = rating._id;
    serviceCenter.ratings += ratingData.rating;
    serviceCenter.reviewers += 1;
    serviceCenter.averageRating =
      serviceCenter.ratings / serviceCenter.reviewers;
    await serviceCenter.save();
    return rating;
  } catch (err) {
    throw err;
  }
};

exports.setRating = async (ratingData) => {
  try {
    const rating = await Rating.findById(ratingData.ratingId);
    const serviceCenter = await ServiceCenter.findById(
      ratingData.serviceCenterId
    );
    const ratingIndex = rating.reviews.findIndex((rev) => {
      return rev.userId.toString() === ratingData.userId.toString();
    });
    if (ratingIndex > -1) {
      const previousRating = rating.reviews[ratingIndex];
      serviceCenter.ratings -= previousRating.rating;
      serviceCenter.averageRating =
        serviceCenter.ratings / serviceCenter.reviewers;
      serviceCenter.ratings += ratingData.rating;
      serviceCenter.averageRating =
        serviceCenter.ratings / serviceCenter.reviewers;
      rating.reviews[ratingIndex] = {
        userId: ratingData.userId,
        userName: ratingData.userName,
        rating: ratingData.rating,
        review: ratingData.review,
      };
      await serviceCenter.save();
      await rating.save();
      return true;
    } else {
      serviceCenter.ratings += ratingData.rating;
      serviceCenter.reviewers += 1;
      serviceCenter.averageRating =
        serviceCenter.ratings / serviceCenter.reviewers;
      rating.reviews.push({
        userId: ratingData.userId,
        userName: ratingData.userName,
        rating: ratingData.rating,
        review: ratingData.review,
      });
      await serviceCenter.save();
      await rating.save();
      return true;
    }
  } catch (err) {
    throw err;
  }
};

exports.findRatings = async (serviceCenterId) => {
  try {
    const ratings = await Rating.findOne({ serviceCenterId });
    if (!ratings) {
      return false;
    }
    return ratings;
  } catch (err) {
    throw err;
  }
};

exports.getRatings = async (ratingId) => {
  try {
    const ratings = await Rating.findById(ratingId);
    if (!ratings || ratings.reviews.length <= 0) {
      const error = new Error("No ratings yet for this service center!");
      error.statusCode = 204;
      throw error;
    }
    return ratings;
  } catch (err) {
    throw err;
  }
};
/******************************************************/

exports.createDriverRating = async (ratingData) => {
  try {
    const rating = new DriverRating({
      driverId: ratingData.driverId,
      reviews: [
        {
          userId: ratingData.userId,
          userName: ratingData.userName,
          rating: ratingData.rating,
          review: ratingData.review,
        },
      ],
    });
    await rating.save();
    const driver = await Driver.findById(ratingData.driverId);
    driver.ratingId = rating._id;
    driver.ratings += ratingData.rating;
    driver.reviewers += 1;
    driver.averageRating = driver.ratings / driver.reviewers;
    await driver.save();
    return rating;
  } catch (err) {
    throw err;
  }
};

exports.setDriverRating = async (ratingData) => {
  try {
    const rating = await DriverRating.findById(ratingData.ratingId);
    const driver = await ServiceCenter.findById(ratingData.driverId);
    const ratingIndex = rating.reviews.findIndex((rev) => {
      return rev.userId.toString() === ratingData.userId.toString();
    });
    if (ratingIndex > -1) {
      const previousRating = rating.reviews[ratingIndex];
      driver.ratings -= previousRating.rating;
      driver.averageRating = driver.ratings / driver.reviewers;
      driver.ratings += ratingData.rating;
      driver.averageRating = driver.ratings / driver.reviewers;
      rating.reviews[ratingIndex] = {
        userId: ratingData.userId,
        userName: ratingData.userName,
        rating: ratingData.rating,
        review: ratingData.review,
      };
      await driver.save();
      await rating.save();
      return true;
    } else {
      driver.ratings += ratingData.rating;
      driver.reviewers += 1;
      driver.averageRating = driver.ratings / driver.reviewers;
      rating.reviews.push({
        userId: ratingData.userId,
        userName: ratingData.userName,
        rating: ratingData.rating,
        review: ratingData.review,
      });
      await driver.save();
      await rating.save();
      return true;
    }
  } catch (err) {
    throw err;
  }
};

exports.findDriverRatings = async (driverId) => {
  try {
    const ratings = await DriverRating.findOne({ driverId });
    if (!ratings) {
      return false;
    }
    return ratings;
  } catch (err) {
    throw err;
  }
};

exports.getDriverRatings = async (ratingId) => {
  try {
    const ratings = await DriverRating.findById(ratingId);
    if (!ratings || ratings.reviews.length <= 0) {
      const error = new Error("No ratings yet for this service center!");
      error.statusCode = 204;
      throw error;
    }
    return ratings;
  } catch (err) {
    throw err;
  }
};
