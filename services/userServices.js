const User = require("../models/user");
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
