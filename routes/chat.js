const express = require("express");
const isAuth = require("../middleware/isAuth");
const chatController = require("../controllers/chatController");

const router = express.Router();

router.post("/upload", isAuth.userIsAuth, chatController.postUploadFiles);

router.post("/close/chat", isAuth.agentIsAuth, chatController.postCloseChat);

router.get("/next/chat", isAuth.agentIsAuth, chatController.getNextChat);


module.exports = router;
