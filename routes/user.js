const express = require("express");
const isAuth = require("../middleware/isAuth");
const userController = require("../controllers/userController");
const router = express.Router();

router.get("/user/profile", isAuth.userIsAuth, userController.getUserProfile);

router.put(
  "/update/user/profile",
  isAuth.userIsAuth,
  userController.putUpdateProfile
);

router.get(
  "/near/service/centers",
  isAuth.userIsAuth,
  userController.getNearServiceCenters
);

router.get(
  "/filter/service/centers",
  isAuth.userIsAuth,
  userController.filterServiceCenters
);

router.post(
  "/review/service/center",
  isAuth.userIsAuth,
  userController.postReviewServiceCenter
);

router.get(
  "/service/center/ratings",
  isAuth.userIsAuth,
  userController.getServiceCenterRatings
);

module.exports = router;