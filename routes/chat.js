const express = require("express");
const isAuth = require("../middleware/isAuth");
const chatController = require("../controllers/chatController");

const router = express.Router();

router.post("/upload", isAuth.userIsAuth, chatController.postUploadFiles);

router.get(
  "/old/chat/history",
  isAuth.userIsAuth,
  chatController.getOlderChatHistory
);

router.get("/notifications/count", chatController.getNotificationsCount);

router.get("/notifications/history", chatController.getNotifications);

router.post(
  "/update/notification/status",
  chatController.postChangeNotificationStatus
);

module.exports = router;
