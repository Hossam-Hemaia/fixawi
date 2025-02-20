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
      io.to(userSocket).emit("driver_location", { location });
      if (flag === "picking up") {
        await orderServices.updateOrderStatus(orderId, "transporting");
        io.to(userSocket).emit("transporting", { orderId });
      }
    });
  } catch (err) {
    throw err;
  }
};

exports.setUserConsent = async (socket) => {
  try {
    socket.on("user_consent", async (event) => {
      const orderId = event.orderId;
      const isAgreed = event.isAgreed;
      await orderServices.setClientConsent(orderId, isAgreed);
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

/***************Chat Sockets*****************/

exports.updateNotificationSocket = async (socket) => {
  try {
    const cacheDB = rdsClient.getRedisConnection();
    socket.on("update_socket", async (event) => {
      await cacheDB.hSet(
        `${event.userId}-sock`,
        "socket",
        JSON.stringify(socket.id)
      );
    });
  } catch (err) {
    throw err;
  }
};

exports.userHandShake = async (socket) => {
  try {
    const cacheDB = rdsClient.getRedisConnection();
    socket.on("hand_shake", async (event) => {
      console.log("shaking hands with user " + event.userId);
      await chatServices.updateUserConnectionStatus(event);
      await cacheDB.hSet(
        `${event.userId}-s`,
        "socket",
        JSON.stringify(socket.id)
      );
      socket.userData = {
        userId: event.userId,
      };
      socket.broadcast.emit("user_status", {
        userOnline: "1",
        userId: Number(event.userId),
      });
    });
  } catch (err) {
    throw err;
  }
};

exports.sendMessage = (socket) => {
  try {
    socket.on("send_message", async (event) => {
      console.log("sending message");
      const date = new Date();
      const localDate = utilities.getLocalDate(date).toLocaleString();
      let chatId;
      if (event.chatId === "" || !chatId) {
        chatId = await chatServices.findCahtId(event.userId, event.partnerId);
      } else {
        chatId = event.chatId;
      }
      const msgInfo = {
        chatId,
        fromUserId: event.userId,
        toPartnerId: event.partnerId,
        message: event.message,
        mediaUrl: event.mediaUrl,
        date: localDate,
      };
      await chatServices.addToChatHistory(msgInfo);
      const unreadCount = await chatServices.getIsReadCount(
        chatId,
        event.userId
      );
      msgInfo.unreadCount = unreadCount;
      await chatServices.updateIsRead(chatId, event.partnerId);
      const receiverSocketId = await chatServices.getUserSocket(
        event.partnerId
      );
      socket
        .to(receiverSocketId)
        .emit("message_received", msgInfo, async (ack) => {
          if (!ack) {
            const notificationSocket = await chatServices.getNotificationSocket(
              msgInfo.toPartnerId
            );
            socket.to(notificationSocket).emit("notification_sent", {
              message: "You received new chat message!",
            });
            await chatServices.saveNotification(
              msgInfo.toPartnerId,
              "You received new chat message!"
            );
          }
        });
    });
  } catch (err) {
    throw new Error(err);
  }
};

exports.userSeenMessages = (socket) => {
  try {
    socket.on("scroll_bottom", async (event) => {
      const userId = event.userId;
      const partnerId = event.partnerId;
      const chatId = await chatServices.findCahtId(userId, partnerId);
      await chatServices.updateIsRead(chatId, partnerId);
      const unreadCount = await chatServices.getIsReadCount(
        chatId,
        event.partnerId
      );
      socket.emit("messages_seen", {});
    });
  } catch (err) {
    throw err;
  }
};

exports.userDisconnect = async (socket) => {
  try {
    socket.on("disconnect", async () => {
      const data = {
        userId: Number(socket.userData.userId),
        status: 0,
      };
      await chatServices.updateUserConnectionStatus(data);
      await chatServices.deleteUserSocket(data.userId);
      socket.broadcast.emit("user_status", {
        userOnline: "0",
        userId: data.userId,
      });
    });
  } catch (err) {
    throw new Error(err);
  }
};

exports.sendNotification = async (socket) => {
  try {
    socket.on("send_notification", async (event) => {
      const userId = event.userId;
      const message = event.message;
      const notificationSocket = await chatServices.getNotificationSocket(
        userId
      );
      socket.to(notificationSocket).emit("notification_sent", { message });
      await chatServices.saveNotification(userId, message);
    });
  } catch (err) {
    throw err;
  }
};
