const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const userSchema = new Schema(
  {
    fullName: {
      type: String,
      required: true,
    },
    email: {
      type: String,
    },
    phoneNumber: {
      type: String,
    },
    authMethod: {
      type: String,
      enum: ["Google", "Facebook", "email", "phone"],
      default: "phone",
    },
    userCars: [
      {
        carNumber: {
          type: String,
        },
        carBrand: {
          type: String,
        },
        carModel: {
          type: String,
        },
        modelYear: {
          type: String,
        },
        isDefaultCar: {
          type: Boolean,
          default: false,
        },
      },
    ],
    isActive: {
      type: Boolean,
      default: false,
    },
    hasProfile: {
      type: Boolean,
      default: false,
    },
    verificationCode: {
      type: String,
    },
    codeExpiry: {
      type: Date,
    },
    password: {
      type: String,
    },
    role: {
      type: String,
      default: "user",
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
    myBookings: [
      {
        date: { type: Date },
        time: { type: Number },
        turn: { type: Number }, // slot index + 1
        carBrand: { type: String },
        carModel: { type: String },
        malfunction: { type: String },
        service: { type: String },
        serviceId: { type: Schema.Types.ObjectId },
        serviceCenter: { type: String },
        serviceCenterId: { type: Schema.Types.ObjectId },
      },
    ],
  },
  { timestamps: true }
);

userSchema.methods.addUserCar = function (carData) {
  try {
    const userCars = this.userCars;
    if (carData.isDefaultCar) {
      for (let car of this.userCars) {
        car.isDefaultCar = false;
      }
    }
    userCars.push(carData);
    this.userCars = userCars;
    this.save();
  } catch (err) {
    throw err;
  }
};

userSchema.methods.removeUserCar = function (carId) {
  try {
    const userCars = this.userCars;
    const newUserCars = userCars.filter((car) => {
      return car._id.toString() !== carId.toString();
    });
    let isDefaultCarSet;
    for (let car of newUserCars) {
      if (car.isDefaultCar) {
        isDefaultCarSet = true;
      }
    }
    if (!isDefaultCarSet) {
      this.userCars[0].isDefaultCar = true;
    }
    this.userCars = newUserCars;
    this.save();
  } catch (err) {
    throw err;
  }
};

userSchema.methods.setDefaultCar = function (carId) {
  try {
    for (let car of this.userCars) {
      if (car._id.toString() === carId.toString()) {
        car.isDefaultCar = true;
      } else {
        car.isDefaultCar = false;
      }
    }
    this.save();
  } catch (err) {
    throw err;
  }
};

userSchema.methods.deleteBooking = function (bookingId) {
  try {
    const bookings = this.myBookings;
    const filteredBookings = bookings.filter((book) => {
      return book._id.toString() !== bookingId.toString();
    });
    this.myBookings = filteredBookings;
  } catch (err) {
    throw err;
  }
};

module.exports = mongoose.model("user", userSchema);
