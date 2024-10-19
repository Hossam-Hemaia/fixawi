const express = require("express");
const adminController = require("../controllers/adminController");
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

module.exports = router;
