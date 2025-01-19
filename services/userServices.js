const User = require("../models/user");
const ServiceCenter = require("../models/service_center");
const Category = require("../models/category");
const SubCategory = require("../models/subCategory");
const Visit = require("../models/visit");
const ContactUs = require("../models/contact_us");
const Car = require("../models/car");
const Maintenance = require("../models/maintenance");
const Booking = require("../models/booking");
const CanceledBooking = require("../models/canceledBookings");
const Favorite = require("../models/favorite");
const utilities = require("../utils/utilities");

exports.carsBrands = async () => {
  try {
    const brands = await Car.find({}, { models: 0 });
    return brands;
  } catch (err) {
    throw err;
  }
};

exports.carModels = async (brandId) => {
  try {
    const models = await Car.findById(brandId);
    return models;
  } catch (err) {
    throw err;
  }
};

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

exports.addUserCar = async (userId, carData) => {
  try {
    const user = await this.findUserById(userId);
    await user.addUserCar(carData);
  } catch (err) {
    throw err;
  }
};

exports.removeUserCar = async (userId, carId) => {
  try {
    const user = await this.findUserById(userId);
    await user.removeUserCar(carId);
  } catch (err) {
    throw err;
  }
};

exports.setUserDefaultCar = async (userId, carId) => {
  try {
    const user = await this.findUserById(userId);
    await user.setDefaultCar(carId);
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
    }).sort({ isPremium: 1 });
    return nearestCenters;
  } catch (err) {
    throw err;
  }
};

exports.filterCenters = async (filter) => {
  try {
    const serviceCenters = await ServiceCenter.find(filter).sort({
      isPremium: 1,
    });
    return serviceCenters;
  } catch (err) {
    throw err;
  }
};

exports.servicesCategories = async () => {
  try {
    const categories = await Category.find();
    return categories;
  } catch (err) {
    throw err;
  }
};

exports.subCategories = async (categoryId) => {
  try {
    const subCategories = await SubCategory.find({
      mainCategoryId: categoryId,
    });
    return subCategories;
  } catch (err) {
    throw err;
  }
};

exports.findServiceCenters = async (serviceName) => {
  try {
    const serviceCenters = await ServiceCenter.find(
      {
        serviceTypes: { $elemMatch: { $regex: new RegExp(serviceName, "i") } },
        isActive: true,
        isApproved: true,
      },
      { username: 0, password: 0 }
    );
    return serviceCenters;
  } catch (err) {
    throw err;
  }
};

exports.createVisit = async (visitData) => {
  try {
    const visit = await Visit(visitData);
    await visit.save();
    return visit;
  } catch (err) {
    throw err;
  }
};

exports.contactUs = async (contactUsData) => {
  try {
    const contactUs = new ContactUs(contactUsData);
    await contactUs.save();
    return contactUs;
  } catch (err) {
    throw err;
  }
};

exports.addCarMaintenance = async (userId, maintenanceData) => {
  try {
    let maintenance = await Maintenance.findOne({ userId });
    if (maintenance) {
      maintenance.maintenanceTable.push(maintenanceData);
      await maintenance.save();
      return maintenance;
    } else {
      maintenance = new Maintenance({
        userId,
        maintenanceTable: [maintenanceData],
      });
      await maintenance.save();
      return maintenance;
    }
  } catch (err) {
    throw err;
  }
};

exports.carMaintenances = async (userId, carId) => {
  try {
    const maintenance = await Maintenance.findOne({ userId });
    const carMaintenance = [];
    for (let m of maintenance.maintenanceTable) {
      if (m.carId.toString() === carId.toString()) {
        carMaintenance.push(m);
      }
    }
    const sortedMaintenance = carMaintenance.sort((a, b) => {
      return a.date < b.date;
    });
    return sortedMaintenance;
  } catch (err) {
    throw err;
  }
};

exports.removeCarMaintenance = async (userId, maintenanceId) => {
  try {
    const maintenance = await Maintenance.findOne({ userId });
    await maintenance.removeMaintenance(maintenanceId);
  } catch (err) {
    throw err;
  }
};

exports.getBookedDays = async (serviceCenterId, serviceId, currentDate) => {
  try {
    const futureDate = utilities.getFutureDate(currentDate, 7);
    const bookings = await Booking.find({
      serviceCenterId,
      serviceId,
      "calendar.date": { $gte: currentDate, $lte: futureDate },
    });
    return bookings;
  } catch (err) {
    throw err;
  }
};

exports.bookVisit = async (bookingData) => {
  try {
    const bookingCalendar = await Booking.findOne({
      serviceCenterId: bookingData.serviceCenterId,
      serviceId: bookingData.serviceId,
    });
    let booking;
    if (!bookingCalendar) {
      booking = new Booking({
        serviceCenterId: bookingData.serviceCenterId,
        serviceId: bookingData.serviceId,
        serviceName: bookingData.serviceName,
        calendar: [
          {
            date: bookingData.date,
            slots: [
              {
                time: bookingData.time,
                clients: [
                  {
                    clientId: bookingData.clientId,
                    clientName: bookingData.clientName,
                    phone: bookingData.phone,
                    carBrand: bookingData.carBrand,
                    carModel: bookingData.carModel,
                  },
                ],
                slotIsFull: false,
              },
            ],
          },
        ],
      });
      await booking.save();
      return booking;
    } else {
      booking = await bookingCalendar.createBooking(bookingData);
    }
    return booking;
  } catch (err) {
    throw err;
  }
};

exports.removeBooking = async (oldBookingData) => {
  try {
    const bookingCalendar = await Booking.findOne({
      serviceCenterId: oldBookingData.serviceCenterId,
      serviceId: oldBookingData.serviceId,
    });
    const booking = await bookingCalendar.removeBooking(oldBookingData);
    if (booking) {
      return true;
    } else {
      return false;
    }
  } catch (err) {
    throw err;
  }
};

exports.userBookings = async (userId) => {
  try {
    const user = await User.findById(userId);
    return user.myBookings;
  } catch (err) {
    throw err;
  }
};

exports.addCanceledBooking = async (bookingData) => {
  try {
    const canceledBooking = new CanceledBooking({
      serviceCenterId: bookingData.serviceCenterId,
      serviceName: bookingData.serviceName,
      date: bookingData.date,
      time: bookingData.time,
      clientName: bookingData.clientName,
      phone: bookingData.phone,
      canceledBy: bookingData.canceledBy,
    });
    await canceledBooking.save();
    return canceledBooking;
  } catch (err) {
    throw err;
  }
};

exports.removeBookingByServiceCenter = async (bookingData) => {
  try {
    const user = await User.findById(bookingData.clientId);
    const newBookings = user.myBookings.filter((booking) => {
      return booking.date !== bookingData.date;
    });
    user.myBookings = newBookings;
    await user.save();
    return user;
  } catch (err) {
    throw err;
  }
};

exports.addFavorite = async (userId, serviceCenterId) => {
  try {
    let userFavorites = await Favorite.findOne({ userId: userId });
    if (!userFavorites) {
      userFavorites = new Favorite({
        userId,
        serviceCenters: [serviceCenterId],
      });
      await userFavorites.save();
    } else {
      userFavorites.serviceCenters.push(serviceCenterId);
      await userFavorites.save();
    }
    return userFavorites;
  } catch (err) {
    throw err;
  }
};

exports.myFavorites = async (userId) => {
  try {
    const myFavorites = await Favorite.findOne({ userId }).populate(
      "serviceCenters"
    );
    return myFavorites;
  } catch (err) {
    throw err;
  }
};

exports.removeFromFavorites = async (userId, serviceCenterId) => {
  try {
    const favorites = await Favorite.findOne({ userId });
    const newFavorites = favorites.serviceCenters.filter((id) => {
      return id.toString() !== serviceCenterId.toString();
    });
    favorites.serviceCenters = newFavorites;
    await favorites.save();
  } catch (err) {
    throw err;
  }
};
