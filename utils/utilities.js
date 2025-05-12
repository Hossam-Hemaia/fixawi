const nodemailer = require("nodemailer");
const firebaseAdmin = require("firebase-admin");
const rdsClient = require("../config/redisConnect");
const Settings = require("../models/settings");
const axios = require("axios");
const geolib = require("geolib");

exports.tokenCreator = () => {
  try {
    const resetCode = Math.floor(Math.random() * 1000000);
    const code = resetCode.toString().padStart(6, "0");
    const date = Date.now();
    const codeExpiry = date + 60 * 60 * 1000;
    return { code, codeExpiry };
  } catch (err) {
    throw new Error(err);
  }
};

exports.emailSender = async (email, verificationCode, emailType = "reset") => {
  let transporter = nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL,
      pass: process.env.EMAIL_PASS,
    },
  });
  let emailOptions;
  if (emailType === "confirmation") {
    emailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Fixawi Confirmation Email",
      text: `Welcom aboard! please use this 6 digit code to confrim your email
      Your Code is: ${verificationCode}
      `,
    };
  } else {
    emailOptions = {
      from: process.env.EMAIL,
      to: email,
      subject: "Fixawi Reset Password Confirmation",
      text: `Welcom aboard! please use this 6 digit code to confrim your email
      Your Code is: ${resetCode}
      `,
    };
  }
  const emailStatus = await transporter.sendMail(emailOptions);
};

exports.sendPushNotification = async (token, title, message) => {
  try {
    const payload = {
      notification: {
        title,
        body: message,
      },
      token,
    };
    const response = await firebaseAdmin.messaging().send(payload);
    if (response) {
      console.log(response);
    }
  } catch (err) {
    throw err;
  }
};

exports.getFirebaseToken = async (userId) => {
  try {
    const cacheDb = await rdsClient.getRedisConnection();
    const userToken = await cacheDb.hGetAll(`${userId}`);
    if (!userToken || !userToken.fbaseToken) {
      return false;
    } else {
      const token = JSON.parse(userToken?.fbaseToken || "");
      return token;
    }
  } catch (err) {
    throw err;
  }
};

exports.getDrivingRoute = async (locations, instructions) => {
  try {
    const response = await axios.post(
      `https://graphhopper.com/api/1/route?key=${process.env.GH_KEY}`,
      {
        points: [
          [locations.fromPoint.lng, locations.fromPoint.lat],
          [locations.toPoint.lng, locations.toPoint.lat],
        ],
        details: ["road_class", "surface"],
        vehicle: "car",
        locale: "en",
        instructions: instructions,
        calc_points: true,
        points_encoded: false,
      }
    );
    const data = await response.data;
    return data;
  } catch (err) {
    throw err;
  }
};

exports.getLocalDate = (date) => {
  const dateBegin = new Date(date).setHours(0, 0, 0, 0);
  const newDate = new Date(dateBegin);
  const localDate = new Date(
    newDate.getTime() - newDate.getTimezoneOffset() * 60000
  );
  return localDate;
};

exports.getEndLocalDate = (date) => {
  const dateBegin = new Date(date).setHours(23, 59, 59, 999);
  const newDate = new Date(dateBegin);
  const localDate = new Date(
    newDate.getTime() - newDate.getTimezoneOffset() * 60000
  );
  return localDate;
};

exports.getNowLocalDate = (date) => {
  const dateBegin = new Date(date);
  const newDate = new Date(dateBegin);
  const localDate = new Date(
    newDate.getTime() - newDate.getTimezoneOffset() * 60000
  );
  return localDate;
};

exports.convertToStartOfDay = (date) => {
  // If input is a string, convert to Date object
  const dateObj = typeof date === "string" ? new Date(date) : date;

  // Create new date with same year, month, day but at 00:00:00.000
  const startOfDay = new Date(
    Date.UTC(
      dateObj.getUTCFullYear(),
      dateObj.getUTCMonth(),
      dateObj.getUTCDate(),
      0,
      0,
      0,
      0
    )
  );

  return startOfDay;
};

exports.getSocketId = async (username) => {
  try {
    const cacheDB = rdsClient.getRedisConnection();
    const user = await cacheDB.hGetAll(`${username}-s`);
    const socketId = JSON.parse(user.socket);
    return socketId;
  } catch (err) {
    throw err;
  }
};

exports.getDriverCache = async (driverId) => {
  try {
    const cacheDB = await rdsClient.getRedisConnection();
    const driver = await cacheDB.hGetAll(`${driverId}-c`);
    if (!driver) {
      return {};
    }
    const driverCache = JSON.parse(driver.cache);
    return driverCache;
  } catch (err) {
    throw err;
  }
};

exports.getRescuePrice = async (distance) => {
  try {
    const settings = await Settings.findOne();
    let totalPrice = 0;
    const pricePerKm = distance * settings.rescuePricingPerKm;
    let fixawiFees = 0;
    if (settings.rescueFareSystem === "ratio") {
      fixawiFees = pricePerKm * settings.fixawiRescueFare;
      totalPrice = pricePerKm + fixawiFees;
    } else {
      totalPrice = pricePerKm + settings.fixawiRescueFare;
    }
    return { totalPrice, downPayment: settings.rescueServiceDownPayment };
  } catch (err) {
    throw err;
  }
};

exports.getFutureDate = (date, numberOfDays) => {
  try {
    const singleDay = 24 * 60 * 60 * 1000;
    let parsedCurrentDate = Date.parse(date);
    for (let i = 0; i < numberOfDays; ++i) {
      parsedCurrentDate += singleDay;
    }
    const futureDate = new Date(parsedCurrentDate);
    return futureDate;
  } catch (err) {
    throw err;
  }
};

exports.makeBookingCalendar = (timeSlot, openingHour, closingHour, date) => {
  const singleDay = 24 * 60 * 60 * 1000;
  let parsedCurrentDate = Date.parse(date);
  const calendar = [];
  for (let i = 0; i < 7; ++i) {
    let day = {
      date: new Date(parsedCurrentDate),
    };
    let slots = [];
    for (let time = openingHour; time <= closingHour; time += timeSlot) {
      let slot = {};
      slot.time = time;
      slot.clients = [];
      slot.slotIsFull = false;
      slots.push(slot);
    }
    day.slots = slots;
    calendar.push(day);
    parsedCurrentDate += singleDay;
  }
  return calendar;
};

exports.mergeBookedSlots = (bookedDays, calendar) => {
  try {
    for (let cal of calendar) {
      let dayIndex = bookedDays.findIndex((d) => {
        return d.date.toString() === cal.date.toString();
      });
      if (dayIndex > -1) {
        for (let slot of bookedDays[dayIndex].slots) {
          let slotIndex = cal.slots.findIndex((s) => {
            return s.time === slot.time;
          });
          if (slotIndex > -1) {
            cal.slots[slotIndex] = slot;
          }
        }
      }
    }
    return calendar;
  } catch (err) {
    throw err;
  }
};

exports.textLang = (str) => {
  if (!str) {
    return;
  }
  const isEnglishLetters = /^[a-zA-Z0-9,_:-]+$/.test(str.split(" ").join(""));
  if (isEnglishLetters) {
    return true;
  } else {
    return false;
  }
};

exports.isInSpot = (coords) => {
  try {
    const spotDistance = 200; // value in meter
    let inSpot = false;
    const distance = geolib.getDistance(coords.fromPoint, coords.toPoint);
    if (distance <= spotDistance) {
      inSpot = true;
    }
    return inSpot;
  } catch (err) {
    next(err);
  }
};
