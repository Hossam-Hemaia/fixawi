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
      const role = event.role;
      await cacheDB.hSet(`${username}-s`, "socket", JSON.stringify(socket.id));
      if (role === "driver") {
        const driver = await driverServices.getDriverByUsername(username);
        const driverLog = await driverServices.getDriverLog(driver.driverLogId);
        const driverData = {
          driverId: driver._id,
          driverOnline: true,
        };
        await driverServices.updateDriverLog(driverData);
        socket.emit("driver_state", {
          driverSuspended: driverLog.driverSuspended,
        });
      }
    });
  } catch (err) {
    console.log(err);
  }
};

exports.driverAccepted = async (socket) => {
  socket.on("driver_accepted", async (event) => {
    const io = require("../socket").getIo();
    const { driverId, orderId } = event;
    let user;
    const order = await orderServices.findOrder(orderId);
    if (order) {
      user = await userServices.findUserById(order.clientId);
    }
    const userSocket = await utilities.getSocketId(user.phoneNumber);
    if (order.orderStatus[order.orderStatus.length - 1].state !== "canceled") {
      await driverServices.assignDriver(driverId);
      await orderServices.assignOrder(orderId, driverId);
      const driver = await driverServices.findDriver(driverId);
      io.to(userSocket).emit("driver_assigned", { order, driver });
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
      const driverLog = await driverServices.suspendDriver(driverId);
      io.to(userSocket).emit("driver_refused", {
        orderId: orderId,
        message: "driver refused, sending to another driver",
      });
      socket.emit("driver_state", {
        driverSuspended: driverLog.driverSuspended,
      });
      const coords = [order.fromPoint.lng, order.fromPoint.lat];
      const drivers = await driverServices.findClosestDriver(coords);
      // send order to the driver socket
      const newDriver = drivers[0];
      await driverServices.sendOrder(newDriver.phoneNumber, order);
    });
  } catch (err) {
    throw new Error(err);
  }
};

exports.driverCurrentLocation = async (socket) => {
  try {
    const io = require("../socket").getIo();
    socket.on("current_location", async (event) => {
      const { clientPhoneNumber, location, flag, orderId } = event;
      const userSocket = await utilities.getSocketId(clientPhoneNumber);
      console.log("sending current location", userSocket);
      io.to(userSocket).emit("driver_location", { location });
      if (flag === "picking up") {
        await orderServices.updateOrderStatus(orderId, "transporting");
        io.to(userSocket).emit("transporting");
      }
    });
  } catch (err) {
    throw err;
  }
};

exports.getOrderState = async (socket) => {
  try {
    socket.on("get_order_state", async (event) => {
      const userId = event.userId;
      const order = await orderServices.findOrderByUserId(userId);
      socket.emit("order_state", { order });
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
        console.log("order_finished", userSocket);
        io.to(userSocket).emit("order_delivered", { order });
      }
    });
  } catch (err) {
    console.log(err);
  }
};

exports.updateDriverCache = async (socket) => {
  try {
    const cacheDB = await rdsClient.getRedisConnection();
    socket.on("update_cache", async (event) => {
      const driverId = event.driverId;
      await cacheDB.hSet(
        `${driverId}-c`,
        "cache",
        JSON.stringify(event.driverCache)
      );
    });
  } catch (err) {
    console.log(err);
  }
};

exports.getDriverCache = async (socket) => {
  try {
    socket.on("get_driver_cache", async (event) => {
      const driverCache = await utilities.getDriverCache(event.driverId);
      socket.emit("driver_cache", driverCache);
    });
  } catch (err) {
    console.log(err);
  }
};

exports.deleteDriverCache = async (socket) => {
  try {
    const cacheDB = await rdsClient.getRedisConnection();
    socket.on("delete_driver_cache", async (event) => {
      await cacheDB.del(`${event.driverId}-c`);
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
        driverId: driver._id,
        driverOnline: false,
      };
      await driverServices.updateDriverLog(driverData);
    });
  } catch (err) {
    throw new Error(err);
  }
};
