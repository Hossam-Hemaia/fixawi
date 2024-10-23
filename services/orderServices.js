const Order = require("../models/orders");

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
