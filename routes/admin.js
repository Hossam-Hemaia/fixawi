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
        if (value !== req.body.confirmPassword) {
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

router.patch(
  "/approve/modified/service",
  isAuth.adminIsAuth,
  adminController.patchApproveModifiedList
);

module.exports = router;
