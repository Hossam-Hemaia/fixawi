const rdsClient = require("../config/redisConnect");
const orderServices = require("../services/orderServices");
const driverServices = require("../services/driverServices");
const userServices = require("../services/userServices");
const chatServices = require("../services/chatServices");
const utilities = require("../utils/utilities");

exports.updateSocket = async (socket) => {
  try {
    const cacheDB = rdsClient.getRedisConnection();
    socket.on("update_socket", async (event) => {
      socket.username = event.username;
      const username = event.username;
      const role = event.role;
      await cacheDB.hSet(`${username}-s`, "socket", JSON.stringify(socket.id));
      console.log("Updating Socket...");
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
      if (role === "call center") {
        console.log("adding agent to queue");
        const callAgentId = event.userId;
        const queueData = {
          callAgentId,
          username,
        };
        await chatServices.createQueue(queueData);
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
      console.log("driver accepted");
      await driverServices.assignDriver(driverId);
      await orderServices.assignOrder(orderId, driverId);
      const driver = await driverServices.findDriver(driverId);
      io.to(userSocket).emit("driver_assigned", { order, driver });
      const token = await utilities.getFirebaseToken(order.clientId);
      if (token) {
        await utilities.sendPushNotification(
          token,
          "rescue driver on the way",
          "driver accepted your rescue order request, please be patient"
        );
      }
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
      const { clientPhoneNumber, location, flag, orderId, userLocation } =
        event;
      const driverData = {
        driverId: event.driverId,
        location: {
          type: "Point",
          coordinates: [location.lng, location.lat],
        },
      };
      await driverServices.updateDriverLog(driverData);
      const userSocket = await utilities.getSocketId(clientPhoneNumber);
      io.to(userSocket).emit("driver_location", { location });
      if (userLocation) {
        const coords = {
          fromPoint: { latitude: location.lat, longitude: location.lng },
          toPoint: { latitude: userLocation.lat, longitude: userLocation.lng },
        };
        let inSpot = utilities.isInSpot(coords);
        if (inSpot) {
          socket.emit("driver_in_spot", { inSpot });
        }
      }
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
      console.log(driverCache);
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
exports.userHandShake = async (socket) => {
  try {
    socket.on("hand_shake", async (event) => {
      console.log("client hand shaking: " + event);
      const callAgent = await chatServices.getAvailableAgent();
      const msg = await chatServices.getWelcomMsg(event.userId);
      const chatData = {
        userId: event.userId,
        username: event.username,
        agentId: callAgent?.callAgentId,
        agentUsername: callAgent?.username,
        queueEntryTime: utilities.getNowLocalDate(new Date()),
        messages: [
          {
            sender: "system",
            timestamp: utilities.getNowLocalDate(new Date()),
            message: msg.welcoming,
          },
        ],
        orderId: event.orderId,
      };
      const chat = await chatServices.createChat(event.isNewChat, chatData);
      if (!callAgent) {
        const waitingData = {
          username: event.username,
          userId: event.userId,
          chatId: chat._id,
        };
        let waitingCount = await chatServices.createWaiting(waitingData);
        socket.emit("welcom_message", {
          message: msg.welcoming,
          chatId: chat._id,
        });
        socket.broadcast.emit("waiting_queue", { waitingCount });
      } else {
        socket.emit("welcom_message", {
          message: msg.welcoming,
          chatId: chat._id,
        });
        const agentSocket = await utilities.getSocketId(callAgent.username);
        chat.chatStartTime = utilities.getNowLocalDate(new Date());
        let addedToChat = await chatServices.addClientToAgentQueue(
          callAgent._id,
          event.userId
        );
        if (addedToChat) {
          console.log("starting chat with: " + agentSocket);
          socket.to(agentSocket).emit("start_chat", {
            chatId: chat._id,
            clientName: msg.fullName,
            userId: chatData.userId,
            chatHistory: event.isNewChat ? [] : chat.messages,
          });
        } else {
          socket.emit("send_message", {
            message: "You can't open more than one chat in the same time",
          });
        }
        await chat.save();
      }
    });
  } catch (err) {
    throw err;
  }
};

exports.sendMessage = (socket) => {
  try {
    socket.on("send_message", async (event) => {
      console.log("sending message ", event.chatId);
      const date = new Date();
      const chatId = event.chatId;
      const msg = event.message;
      const sender = event.sender;
      const msgInfo = {
        sender,
        timestamp: utilities.getNowLocalDate(date),
        message: msg,
      };
      const chat = await chatServices.addToChatHistory(chatId, msgInfo);
      const partnerSocketId = await utilities.getSocketId(
        sender === "user" ? chat.agentUsername : chat.username
      );
      console.log("send msg to: " + partnerSocketId);
      socket.to(partnerSocketId).emit("receive_message", {
        chatId,
        message: msg,
        sender: event.sender,
      });
    });
  } catch (err) {
    throw new Error(err);
  }
};
