const mongoose = require("mongoose");

exports.connectDB = (connectionUrl) => {
  mongoose
    .set("strictQuery", false)
    .connect(connectionUrl, {
      socketTimeoutMS: 600000,
      connectTimeoutMS: 600000,
      serverSelectionTimeoutMS: 600000,
    })
    .then((result) => {
      console.log("connected to database...");
    })
    .catch((err) => {
      console.log(err);
    });
};
