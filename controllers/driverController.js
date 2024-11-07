const orderServices = require("../services/orderServices");

exports.getDriverOrders = async (req, res, next) => {
  try {
    const driverId = req.driverId;
    const orders = await orderServices.driverRescueOrders(driverId);
    res.status(200).json({ success: true, orders });
  } catch (err) {
    next(err);
  }
};
