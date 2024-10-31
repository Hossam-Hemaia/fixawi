const Order = require("../models/orders");
const Driver = require("../models/driver");
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

exports.updateOrderStatus = async (orderId, status)=>{
  try{
    const currentDate = utilities.getLocalDate(new Date());
    const order = await Order.findById(orderId).populate("clientId");
    order.orderStatus.push({ state: status, date: currentDate });
  }catch(err){
    throw err;
  }
}