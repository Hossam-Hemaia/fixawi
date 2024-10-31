const rdsClient = require("../config/redisConnect");
const orderServices = require("../services/orderServices");
const driverServices = require("../services/driverServices");
const userServices = require("../services/userServices");
const utilities = require("../utils/utilities");

exports.updateSocket = async (socket) => {
  try {
    const cacheDB = rdsClient.getRedisConnection();
    socket.on("update_socket", async (event) => {
      socket.username = event.username;
      const username = event.username;
      await cacheDB.hSet(`${username}-s`, "socket", JSON.stringify(socket.id));
    });
  } catch (err) {
    console.log(err);
  }
};

exports.driverAccepted = async (socket) => {
  socket.on("driver_accepted", async (event) => {
    const io = require("../socket").getIo();
    const { driverId, orderId } = event;
    const order = await orderServices.findOrder(orderId);
    const user = await userServices.findUserById(order.clientId);
    const userSocket = await utilities.getSocketId(user.phoneNumber);
    if (order.orderStatus[order.orderStatus.length - 1].state !== "canceled") {
      await driverServices.assignDriver(driverId);
      await orderServices.assignOrder(orderId, driverId);
      io.to(userSocket).emit("driver_assigned", { order });
    } else {
      socket.emit("order_canceled", { order });
    }
  });
};

exports.driverDeclined = async (socket) => {
  try {
    socket.on("driver_declined", async (event) => {
      const io = require("../socket").getIo();
      const { driverId, orderId, reason } = event;
      const driver = await driverServices.findDriver(driverId);
      const order = await orderServices.findOrder(orderId);
      const user = await userServices.findUserById(order.clientId);
      const userSocket = await utilities.getSocketId(user.phoneNumber);
      driver.declinedOrders.push({ orderId, reason });
      await driver.save();
      await driverServices.suspendDriver(driverId);
      io.to(userSocket).emit("driver_refused", {
        orderId: orderId,
        message: "driver refused to receive the order",
      });
    });
  } catch (err) {
    throw new Error(err);
  }
};

exports.driverCurrentLocation = async (socket) => {
  try {
    const io = require("../socket").getIo();
    socket.on("current_location", async (event) => {
      const { clientPhoneNumber, location } = event;
      const userSocket = await utilities.getSocketId(clientPhoneNumber);
      io.to(userSocket).emit("driver_location", { location });
    });
  } catch (err) {
    throw err;
  }
};

exports.driverDeliveredOrder = async (socket) => {
  try {
    const io = require("../socket").getIo();
    socket.on("order_finish", async (event) => {
      const { orderId, driverId, status } = event;
      await orderServices.updateOrderStatus(orderId, status);
      if (status === "delivered") {
        const order = await orderServices.findOrder(orderId);
        await driverServices.releaseDriver(driverId);
        const userSocket = await utilities.getSocketId(order.phoneNumber);
        io.to(userSocket).emit("order_delivered", { order });
      }
    });
  } catch (err) {
    console.log(err);
  }
};

exports.disconnected = async (socket) => {
  try {
    socket.on("disconnect", async () => {
      const username = socket.username;
      const driver = await driverServices.getDriverByUsername(username);
      const driverData = {
        courierId: driver._id,
        driverOnline: false,
      };
      await driverServices.updateDriverLog(driverData);
    });
  } catch (err) {
    throw new Error(err);
  }
};
