const nodemailer = require("nodemailer");
const firebaseAdmin = require("firebase-admin");
const rdsClient = require("../config/redisConnect");
const axios = require("axios");

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
  console.log(emailStatus);
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
    const token = JSON.parse(userToken.fbaseToken);
    return token;
  } catch (err) {
    next(err);
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
