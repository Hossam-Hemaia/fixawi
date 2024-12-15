const orderServices = require("../services/orderServices");

exports.getDriverOrders = async (req, res, next) => {
  try {
    const driverId = req.driverId;
    const orders = await orderServices.driverRescueOrders(driverId);
    let totalPaid = 0;
    for (let order of orders) {
      totalPaid += order.rescuePrice;
    }
    res.status(200).json({ success: true, orders, totalPaid });
  } catch (err) {
    next(err);
  }
};
