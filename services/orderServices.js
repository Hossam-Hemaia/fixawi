const Order = require("../models/orders");
const Driver = require("../models/driver");
const Wallet = require("../models/wallet");
const Movement = require("../models/movement");
const utilities = require("../utils/utilities");

exports.getNextOrderNumber = async () => {
  try {
    const lastOrder = await Order.findOne().sort({ createdAt: -1 });
    if (!lastOrder) {
      return 1;
    } else {
      return lastOrder.orderNumber ? lastOrder.orderNumber + 1 : 1;
    }
  } catch (err) {
    throw err;
  }
};

exports.createOrder = async (orderData) => {
  try {
    const order = new Order(orderData);
    await order.save();
    return order;
  } catch (err) {
    throw err;
  }
};

exports.findOrder = async (orderId) => {
  try {
    const order = await Order.findById(orderId).populate([
      "clientId",
      "driverId",
    ]);
    return order;
  } catch (err) {
    throw err;
  }
};

exports.findOrderByUserId = async (userId) => {
  try {
    const order = await Order.findOne({
      clientId: userId,
      paymentStatus: "Pending Payment",
      "orderStatus.state": { $nin: ["canceled", "rejected"] },
    })
      .sort({ createdAt: -1 })
      .populate("driverId");
    return order;
  } catch (err) {
    throw err;
  }
};

exports.findLastPendingOrder = async (userId) => {
  try {
    const order = await Order.findOne({
      clientId: userId,
      paymentStatus: "Pending Payment",
      "orderStatus.state": "pending",
    })
      .sort({ createdAt: -1 })
      .populate("driverId");
    return order;
  } catch (err) {
    throw err;
  }
};

exports.assignOrder = async (orderId, driverId) => {
  try {
    const currentDate = utilities.getLocalDate(new Date());
    const order = await Order.findById(orderId).populate("clientId");
    const driver = await Driver.findById(driverId);
    order.orderStatus.push({ state: "accepted", date: currentDate });
    order.driverId = driverId;
    order.companyName = driver.companyName;
    await order.save();
    return order;
  } catch (err) {
    throw new Error(err);
  }
};

exports.setClientConsent = async (orderId, isAgreed) => {
  try {
    const order = await Order.findById(orderId);
    order.clientConsent = isAgreed;
    await order.save();
  } catch (err) {
    throw err;
  }
};

exports.updateOrderStatus = async (orderId, status) => {
  try {
    const currentDate = utilities.getLocalDate(new Date());
    const order = await Order.findById(orderId).populate([
      "clientId",
      "driverId",
    ]);
    order.orderStatus.push({ state: status, date: currentDate });
    await order.save();
    return order;
  } catch (err) {
    throw err;
  }
};

exports.userRescueOrders = async (userId) => {
  try {
    const orders = await Order.find({ clientId: userId }).sort({
      createdAt: -1,
    });
    return orders;
  } catch (err) {
    throw err;
  }
};

exports.driverRescueOrders = async (driverId) => {
  try {
    const orders = await Order.find({ driverId }).sort({ createdAt: -1 });
    return orders;
  } catch (err) {
    throw err;
  }
};

exports.payOrder = async (orderId, paymentMethod) => {
  try {
    const order = await Order.findById(orderId);
    const driver = await Driver.findById(order.driverId);
    const wallet = await Wallet.findById(driver.walletId);
    const paymentData = {
      orderId,
      reason: "Car Rescue Order Payment",
      movementDate: utilities.getLocalDate(new Date()),
      movementType: "addition",
      movementAmount: order.rescuePrice,
      movementId: "",
      paymentMethod: paymentMethod,
      walletId: wallet._id,
    };
    const movement = new Movement(paymentData);
    await movement.save();
    paymentData.movementId = movement._id;
    await wallet.addToBalance(paymentData);
    order.paymentStatus = "Paid";
    order.paymentMethod = paymentMethod;
    await order.save();
    return order;
  } catch (err) {
    throw err;
  }
};

exports.allOrders = async () => {
  try {
    const orders = await Order.find().populate(["clientId", "driverId"]);
    return orders;
  } catch (err) {
    throw err;
  }
};

exports.setPaymentStatus = async (orderId, paymentStatus) => {
  try {
    const order = await Order.findById(orderId);
    if (!order.clientConsent) {
      throw new Error("قام العميل بعدم تأكيد استلام السياره");
    }
    order.paymentStatus = paymentStatus;
    await order.save();
    return order;
  } catch (err) {
    throw err;
  }
};
