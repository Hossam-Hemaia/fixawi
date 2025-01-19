const express = require("express");
const scController = require("../controllers/scController");
const adminController = require("../controllers/adminController");
const isAuth = require("../middleware/isAuth");
const validators = require("../middleware/validators");

const router = express.Router();

router.get("/service/categories", scController.getServicesCategories);

router.post("/join/request", scController.postJoinRequest);

router.get(
  "/service/center/profile",
  isAuth.scIsAuth,
  scController.getServiceCenterProfile
);

router.put(
  "/update/profile",
  [
    validators.validatePassword.custom((value, { req }) => {
      if (req.url === "/update/profile") {
        if (value !== "" && value !== req.body.confirmPassword) {
          throw new Error("Passowrd does not match!");
        }
      }
    }),
  ],
  isAuth.scIsAuth,
  scController.putUpdateServiceCenterProfile
);

/**********************************************************
 * Service Centers
 **********************************************************/
router.post(
  "/service/center/price/list",
  isAuth.scIsAuth,
  scController.postCreatePriceList
);

router.get(
  "/service/center/price/list",
  isAuth.scIsAuth,
  scController.getPriceList
);

router.get(
  "/service/sub/categories",
  isAuth.scIsAuth,
  adminController.getAllSubCategories
);

router.put(
  "/edit/service/center/price/list",
  isAuth.scIsAuth,
  scController.putEditServiceCenterPriceList
);

/**********************************************************
 * Visits
 **********************************************************/
router.get("/service/center/visits", isAuth.scIsAuth, scController.getVisits);

router.get("/visitor/details", isAuth.scIsAuth, scController.getVisitorDetails);

router.post("/cancel/visit", isAuth.scIsAuth, scController.postCancelVisit);

/**********************************************************
 * Booking Settings
 **********************************************************/
router.get(
  "/services/details",
  isAuth.scIsAuth,
  scController.getServicesDetails
);

router.post(
  "/create/booking/plan",
  isAuth.scIsAuth,
  scController.postCreateBookingSettings
);

router.get(
  "/booking/settings",
  isAuth.scIsAuth,
  scController.getBookingSettings
);

router.put(
  "/update/booking/settings",
  isAuth.scIsAuth,
  scController.putUpdateBookingSettings
);

/**********************************************************
 * Bookings
 **********************************************************/
router.get(
  "/bookings/calendar",
  isAuth.scIsAuth,
  scController.getBookingsCalendar
);

router.delete(
  "/cancel/booking",
  isAuth.scIsAuth,
  scController.deleteClientBooking
);

/**********************************************************
 * Check Reports
 **********************************************************/
router.post(
  "/create/check/report",
  isAuth.scIsAuth,
  scController.postCreateCheckReport
);

router.get("/check/reports", isAuth.scIsAuth, scController.getCheckReports);

router.get(
  "/check/report/details",
  isAuth.scIsAuth,
  scController.getCheckReport
);

router.delete(
  "/delete/check/report",
  isAuth.scIsAuth,
  scController.deleteCheckReport
);

module.exports = router;
