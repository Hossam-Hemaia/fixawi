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

router.post("/add/user/car", isAuth.userIsAuth, userController.postAddUserCar);

router.delete(
  "/remove/user/car",
  isAuth.userIsAuth,
  userController.deleteUserCar
);

router.patch(
  "/set/user/default/car",
  isAuth.userIsAuth,
  userController.patchSetDefaultCar
);

router.get("/user/cars/brands", userController.getCarsBrands);

router.get("/user/car/models", userController.getCarModels);

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

router.get(
  "/main/categories",
  isAuth.userIsAuth,
  userController.getMainCategories
);

router.get(
  "/user/service/sub/categories",
  isAuth.userIsAuth,
  userController.getSubCategories
);

router.get(
  "/categorized/service/centers",
  isAuth.userIsAuth,
  userController.getCategorizedServiceCenters
);

router.post("/contact/us", userController.postContactUs);

router.post(
  "/add/car/maintenance",
  isAuth.userIsAuth,
  userController.postAddCarMaintenance
);

router.get(
  "/user/car/maintenance",
  isAuth.userIsAuth,
  userController.getUserCarMaintenance
);

router.delete(
  "/remove/car/maintenance",
  isAuth.userIsAuth,
  userController.deleteCarMaintenance
);

/*****************************************
 * Winch Service Routes
 *****************************************/
router.get("/delivery/data", isAuth.userIsAuth, userController.getDeliveryData);

router.post(
  "/create/rescue/order",
  isAuth.userIsAuth,
  userController.postCreateRescueOrder
);

router.get(
  "/user/rescue/orders",
  isAuth.userIsAuth,
  userController.getUserRescueOrders
);

/*****************************************
 * Booking Routes
 *****************************************/
router.get(
  "/show/booking/calendar",
  isAuth.userIsAuth,
  userController.getUserBookingCalendar
);

router.post(
  "/create/new/booking",
  isAuth.userIsAuth,
  userController.postCreateBooking
);

router.put(
  "/edit/user/booking",
  isAuth.userIsAuth,
  userController.putEditUserBooking
);

module.exports = router;
