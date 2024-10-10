const express = require("express");
const scController = require("../controllers/scController");
const isAuth = require("../middleware/isAuth");
const validators = require("../middleware/validators");

const router = express.Router();

router.get("/service/categories", scController.getServicesCategories);

router.post("/join/request", scController.postJoinRequest);

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

router.put(
  "/edit/service/center/price/list",
  isAuth.scIsAuth,
  scController.putEditServiceCenterPriceList
);

router.get("/service/center/visits", isAuth.scIsAuth, scController.getVisits);

module.exports = router;
