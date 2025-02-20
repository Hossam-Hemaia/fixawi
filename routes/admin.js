const express = require("express");
const adminController = require("../controllers/adminController");
const scController = require("../controllers/scController");
const userController = require("../controllers/userController");
const isAuth = require("../middleware/isAuth");
const validators = require("../middleware/validators");

const router = express.Router();

/*****************************************
 * Category
 *****************************************/

router.post(
  "/create/category",
  isAuth.adminIsAuth,
  adminController.postCreateCategory
);

router.put(
  "/edit/category",
  isAuth.adminIsAuth,
  adminController.putEditCategory
);

router.get("/categories", isAuth.adminIsAuth, adminController.getAllCategories);

router.get("/get/category", isAuth.adminIsAuth, adminController.getCategory);

router.delete(
  "/delete/category",
  isAuth.adminIsAuth,
  adminController.deleteCategory
);

/*****************************************
 * Sub-Category
 *****************************************/

router.post(
  "/create/sub/category",
  isAuth.adminIsAuth,
  adminController.postCreateSubCategory
);

router.get(
  "/all/sub/categories",
  isAuth.adminIsAuth,
  adminController.getAllSubCategories
);

router.get("/sub/category", isAuth.adminIsAuth, adminController.getSubCategory);

router.put(
  "/edit/sub/category",
  isAuth.adminIsAuth,
  adminController.putEditSubCategory
);

router.delete(
  "/delete/sub/category",
  isAuth.adminIsAuth,
  adminController.deleteSubcategory
);

/**********************************************************
 * Service Centers
 **********************************************************/
router.post(
  "/create/service/center",
  [
    validators.validatePassword.custom((value, { req }) => {
      if (req.url === "/create/service/center") {
        if (value !== req.body.confirmPassword) {
          throw new Error("Passowrd does not match!");
        }
      }
    }),
  ],
  isAuth.adminIsAuth,
  adminController.postCreateServiceCenter
);

router.get(
  "/service/centers",
  isAuth.adminIsAuth,
  adminController.getServiceCenters
);

router.get(
  "/service/center",
  isAuth.adminIsAuth,
  adminController.getServiceCenter
);

router.put(
  "/edit/service/center",
  [
    validators.validatePassword.custom((value, { req }) => {
      if (req.url === "/create/service/center") {
        if (value !== "" && value !== req.body.confirmPassword) {
          throw new Error("Passowrd does not match!");
        }
      }
    }),
  ],
  isAuth.adminIsAuth,
  adminController.putEditServiceCenter
);

router.delete(
  "/delete/service/center",
  isAuth.adminIsAuth,
  adminController.deleteServiceCenter
);

router.get(
  "/show/join/requests",
  isAuth.adminIsAuth,
  adminController.getJoinRequests
);

router.post(
  "/approve/service/center",
  [
    validators.validatePassword.custom((value, { req }) => {
      if (req.url === "/approve/service/center") {
        if (value !== req.body.confirmPassword) {
          throw new Error("Passowrd does not match!");
        }
      }
    }),
  ],
  isAuth.adminIsAuth,
  adminController.approveServiceCenter
);

router.get("/users/visits", isAuth.adminIsAuth, adminController.getUsersVisits);

/**********************************************************
 * Booking Settings
 **********************************************************/
router.post(
  "/create/sc/booking/settings",
  isAuth.adminIsAuth,
  adminController.postCreateBookingSettings
);

router.get(
  "/sc/booking/settings",
  isAuth.adminIsAuth,
  adminController.getBookingSettings
);

router.put(
  "/sc/update/booking/settings",
  isAuth.adminIsAuth,
  adminController.putUpdateBookingSettings
);

/**********************************************************
 * Bookings
 **********************************************************/
router.get(
  "/service/center/bookings",
  isAuth.adminIsAuth,
  adminController.getServiceCenterBookings
);

router.get(
  "/all/canceled/bookings",
  isAuth.adminIsAuth,
  adminController.getAllCanceledBookings
);

router.get(
  "/admin/booking/calendar",
  isAuth.adminIsAuth,
  userController.getUserBookingCalendar
);

router.post(
  "/book/service/center/visit",
  isAuth.adminIsAuth,
  adminController.bookServiceCenterVisit
);

/**********************************************************
 * Price List
 **********************************************************/
router.post(
  "/create/price/list",
  isAuth.adminIsAuth,
  adminController.postCreatePriceList
);

router.put(
  "/edit/price/list",
  isAuth.adminIsAuth,
  adminController.putEditPriceList
);

router.get(
  "/all/service/centers/lists",
  isAuth.adminIsAuth,
  adminController.getPriceLists
);

router.put(
  "/approve/whole/list",
  isAuth.adminIsAuth,
  adminController.putApproveWholeList
);

router.patch(
  "/approve/modified/service",
  isAuth.adminIsAuth,
  adminController.patchApproveModifiedList
);

router.get(
  "/show/price/list",
  isAuth.adminIsAuth,
  adminController.getPriceList
);

router.delete(
  "/remove/price/list",
  isAuth.adminIsAuth,
  adminController.deletePriceList
);
/**********************************************************
 * Cars
 ***********************************************************/
router.post("/creat/car", isAuth.adminIsAuth, adminController.postCreateCar);

router.get("/all/cars", isAuth.adminIsAuth, adminController.getCars);

router.get("/car/details", isAuth.adminIsAuth, adminController.getCarDetails);

router.put("/edit/car", isAuth.adminIsAuth, adminController.putEditCar);

router.delete("/delete/car", isAuth.adminIsAuth, adminController.deleteCar);

/**********************************************************
 * Clients
 **********************************************************/
router.get("/all/users", isAuth.adminIsAuth, adminController.getAllUsers);

router.get("/user", isAuth.adminIsAuth, adminController.getUser);

router.put("/block/user", isAuth.adminIsAuth, adminController.putBlockUser);

router.get("/user/details", isAuth.adminIsAuth, adminController.getUserDetails);

/**********************************************************
 * Offers
 **********************************************************/
router.post(
  "/create/offer",
  isAuth.adminIsAuth,
  adminController.postCreateOffer
);

router.get("/all/offers", isAuth.adminIsAuth, adminController.getAllOffers);

router.put(
  "/set/offer/status",
  isAuth.adminIsAuth,
  adminController.putSetExpireoffer
);

router.get(
  "/offer/details",
  isAuth.adminIsAuth,
  adminController.getOfferDetails
);

router.put("/edit/offer", isAuth.adminIsAuth, adminController.putEditOffer);

router.delete("/delete/offer", isAuth.adminIsAuth, adminController.deleteOffer);

router.patch(
  "/add/service/center/offer",
  isAuth.adminIsAuth,
  adminController.addServiceCenterOffer
);

router.get(
  "/offer/service/centers",
  isAuth.adminIsAuth,
  adminController.getOfferServiceCenters
);

router.patch(
  "/remove/service/center/offer",
  isAuth.adminIsAuth,
  adminController.removeServiceCenterOffer
);

/**********************************************************
 * Promotions
 **********************************************************/
router.get(
  "/pending/promotions",
  isAuth.adminIsAuth,
  adminController.getPendingPromotions
);

router.put(
  "/set/promotion/approval",
  isAuth.adminIsAuth,
  adminController.putSetPromotionApproval
);

router.get("/promotions", isAuth.adminIsAuth, adminController.getPromotions);

router.delete(
  "/remove/promotion",
  isAuth.adminIsAuth,
  scController.deletePromotion
);

/**********************************************************
 * Contact Us
 **********************************************************/
router.get(
  "/contact/us/messages",
  isAuth.adminIsAuth,
  adminController.getContactUsMessages
);

router.delete(
  "/delete/contact/us/msg",
  isAuth.adminIsAuth,
  adminController.deleteContactUsMessage
);

/**********************************************************
 * Driver
 **********************************************************/
router.get(
  "/drivers/join/requests",
  isAuth.adminIsAuth,
  adminController.getDriversJoinRequests
);

router.post(
  "/create/truck/driver",
  isAuth.adminIsAuth,
  adminController.postCreateDriver
);

router.get("/all/drivers", isAuth.adminIsAuth, adminController.getAllDrivers);

router.get(
  "/driver/details",
  isAuth.adminIsAuth,
  adminController.getDriverDetails
);

router.put(
  "/edit/truck/driver",
  isAuth.adminIsAuth,
  adminController.putEditDriver
);

router.delete(
  "/delete/driver",
  isAuth.adminIsAuth,
  adminController.deleteDriver
);

router.get(
  "/drivers/status",
  isAuth.adminIsAuth,
  adminController.getDriversStatus
);

/**********************************************************
 * Settings
 **********************************************************/

router.post(
  "/set/app/settings",
  isAuth.adminIsAuth,
  adminController.postSetAppSettings
);

router.get("/app/settings", isAuth.adminIsAuth, adminController.getAppSettings);

/**********************************************************
 * Rescue Orders
 **********************************************************/
router.get(
  "/all/rescue/orders",
  isAuth.adminIsAuth,
  adminController.getAllRescueOrders
);

router.patch(
  "/set/order/payment/status",
  isAuth.adminIsAuth,
  adminController.patchSetOrderPayment
);

/**********************************************************
 * Check Reports
 **********************************************************/
router.get(
  "/all/check/Reports",
  isAuth.adminIsAuth,
  adminController.getAllCheckReports
);

router.post(
  "/set/check/report/status",
  isAuth.adminIsAuth,
  adminController.postSetCheckReportStatus
);

/**********************************************************
 * Invoices
 **********************************************************/

router.get(
  "/admin/service/center/invoices",
  isAuth.adminIsAuth,
  adminController.postServiceCenterInvoices
);

module.exports = router;
