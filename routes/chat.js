const express = require("express");
const isAuth = require("../middleware/isAuth");
const chatController = require("../controllers/chatController");

const router = express.Router();

router.post("/upload", isAuth.userIsAuth, chatController.postUploadFiles);

router.post("/close/chat", isAuth.agentIsAuth, chatController.postCloseChat);

router.get("/next/chat", isAuth.agentIsAuth, chatController.getNextChat);

router.get(
  "/client/chat/history",
  isAuth.userIsAuth,
  chatController.getUserChatHistory
);

router.get("/agent/chats", isAuth.agentIsAuth, chatController.getClientChats);

router.get("/all/chats", isAuth.adminIsAuth, chatController.getAllChats);

router.get(
  "/agent/current/chats",
  isAuth.agentIsAuth,
  chatController.getCurrentChats
);

router.get(
  "/show/waiting/clients",
  isAuth.adminIsAuth,
  chatController.getWaitingClients
);

router.get(
  "/current/chats/stats",
  isAuth.adminIsAuth,
  chatController.getNumberOfCurrentChats
);

router.get(
  "/client/order/details",
  isAuth.agentIsAuth,
  chatController.getClientOrderDetails
);

module.exports = router;
