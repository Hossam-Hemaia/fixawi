const express = require("express");
const isAuth = require("../middleware/isAuth");
const driverController = require("../controllers/driverController");

const router = express.Router();

router.get(
  "/driver/orders",
  isAuth.driverIsAuth,
  driverController.getDriverOrders
);

module.exports = router;
