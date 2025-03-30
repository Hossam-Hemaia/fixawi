const express = require("express");
const isAuth = require("../middleware/isAuth");
const driverController = require("../controllers/driverController");
const userController = require("../controllers/userController");

const router = express.Router();

router.post(
  "/submit/driver/application",
  driverController.postSubmitDriverApplication
);

router.post(
  "/set/driver/connection/status",
  isAuth.driverIsAuth,
  driverController.setDriverConnectionStatus
);

router.get(
  "/driver/delivery/data",
  isAuth.driverIsAuth,
  userController.getDeliveryData
);

router.get(
  "/driver/orders",
  isAuth.driverIsAuth,
  driverController.getDriverOrders
);

module.exports = router;
