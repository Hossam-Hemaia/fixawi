const Rating = require("../models/rating");
const ServiceCenter = require("../models/service_center");

exports.createRating = async (ratingData) => {
  try {
    const rating = new Rating({
      serviceCenterId: ratingData.serviceCenterId,
      reviews: [
        {
          userId: ratingData.userId,
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