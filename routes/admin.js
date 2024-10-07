const express = require("express");
const adminController = require("../controllers/adminController");
const isAuth = require("../middleware/isAuth");
const validators = require("../middleware/validators");

const router = express.Router();

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
 * Service Centers Categories
 **********************************************************/
router.post(
  "/create/category",
  isAuth.adminIsAuth,
  adminController.postCreateCategory
);

router.get(
  "/all/categories",
  isAuth.adminIsAuth,
  adminController.getAllCategories
);

router.delete(
  "/delete/category",
  isAuth.adminIsAuth,
  adminController.deleteCategory
);

router.put(
  "/set/category/status",
  isAuth.adminIsAuth,
  adminController.putSetCategoryStatus
);

router.put(
  "/edit/service/category",
  isAuth.adminIsAuth,
  adminController.putEditServiceCategory
);

/**********************************************************
 * Clients
 **********************************************************/
router.get("/all/users", isAuth.adminIsAuth, adminController.getAllUsers);

router.get("/user", isAuth.adminIsAuth, adminController.getUser);

router.put("/block/user", isAuth.adminIsAuth, adminController.putBlockUser);

module.exports = router;
