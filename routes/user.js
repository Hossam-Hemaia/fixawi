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

router.get(
  "/service/center/details",
  isAuth.userIsAuth,
  userController.getServiceCenterDetails
);

router.post(
  "/visit/service/center",
  isAuth.userIsAuth,
  userController.postVisitServiceCenter
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

router.post(
  "/user/set/firebase/token",
  isAuth.userIsAuth,
  userController.postFirebaseToken
);

router.get(
  "/user/services/categories",
  isAuth.userIsAuth,
  userController.getServicesCategories
);

module.exports = router;
