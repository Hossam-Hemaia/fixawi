const express = require("express");
const scController = require("../controllers/scController");

const router = express.Router();

router.post("/join/request", scController.postJoinRequest);

router.put("/update/profile");

module.exports = router;
