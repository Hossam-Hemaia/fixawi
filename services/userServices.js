const User = require("../models/user");
const ServiceCenter = require("../models/service_center");
const utilities = require("../utils/utilities");

exports.createUser = async (userData) => {
  try {
    const user = new User(userData);
    const token = utilities.tokenCreator();
    user.verificationCode = token.code;
    user.codeExpiry = token.codeExpiry;
    if (user.phoneNumber !== "") {
      user.hasProfile = true;
    }
    await user.save();
    return user;
  } catch (err) {
    throw err;
  }
};

exports.findUserById = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user;
  } catch (err) {
    throw err;
  }
};

exports.getUserByUsername = async (username) => {
  try {
    const user = await User.findOne({
      $or: [{ email: username }, { phoneNumber: username }],
    });
    if (!user) {
      return false;
    } else {
      return user;
    }
  } catch (err) {
    throw err;
  }
};

exports.setUserActive = async (id, status) => {
  try {
    const user = await this.findUserById(id);
    user.isActive = status;
    await user.save();
  } catch (err) {
    throw err;
  }
};

exports.resendCode = async (username) => {
  try {
    const user = await User.findOne({
      $or: [{ email: username }, { phoneNumber: username }],
    });
    const token = utilities.tokenCreator();
    user.verificationCode = token.code;
    user.codeExpiry = token.codeExpiry;
    await user.save();
    return user;
  } catch (err) {
    throw err;
  }
};

exports.allUsers = async (page, itemsPerPage) => {
  try {
    const users = await User.find()
      .skip((page - 1) * itemsPerPage)
      .limit(itemsPerPage);
    return users;
  } catch (err) {
    throw err;
  }
};

exports.blockUser = async (userId, status) => {
  try {
    const user = await this.findUserById(userId);
    user.isBlocked = status;
    await user.save();
    return true;
  } catch (err) {
    throw err;
  }
};

exports.updateProfile = async (userId, userData) => {
  try {
    const updateData = {};
    for (let key in userData) {
      if (userData[key] !== "") {
        updateData[key] = userData[key];
      }
    }
    await User.findByIdAndUpdate(userId, updateData);
  } catch (err) {
    throw err;
  }
};

exports.nearestServiceCenters = async (coords, maxDistance) => {
  try {
    const nearestCenters = await ServiceCenter.find({
      location: {
        $near: {
          $geometry: {
            type: "Point",
            coordinates: coords,
          },
          $maxDistance: maxDistance,
        },
      },
    });
    return nearestCenters;
  } catch (err) {
    throw err;
  }
};
