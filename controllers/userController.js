const userServices = require("../services/userServices");

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
