const chatServices = require("../services/chatServices");
const utilities = require("../utils/utilities");

exports.postUploadFiles = async (req, res, next) => {
  try {
    const files = req.files;
    const attachments = [];
    if (files.length > 0) {
      for (let file of files) {
        let document = `${req.protocol}s://${req.get("host")}/${file.path}`;

        attachments.push({ doc: document, filename: file.originalname });
      }
    }
    res.status(201).json({ success: true, files: attachments });
  } catch (err) {
    next(err);
  }
};

exports.postCloseChat = async (req, res, next) => {
  try {
    const { chatId, resolutionStatus, issueCategory, satisfactionScore } =
      req.body;
    const agentId = req.agentId;
    const firstAgentMsgTime = await chatServices.getFirstAgentMsg(chatId);
    const chatData = {
      chatEndTime: utilities.getNowLocalDate(new Date()),
      resolutionStatus,
      issueCategory,
      satisfactionScore,
      firstResponseTime: firstAgentMsgTime,
    };
    await chatServices.closeChat(agentId, chatId, chatData);
    res.status(201).json({ success: true, message: "Chat closed" });
  } catch (err) {
    next(err);
  }
};

exports.getCurrentChats = async (req, res, next) => {
  try {
    const agentId = req.agentId;
    const chats = await chatServices.currentChats(agentId);
    res.status(200).json({ success: true, currentChats: chats });
  } catch (err) {
    next(err);
  }
};

exports.getNextChat = async (req, res, next) => {
  try {
    const agentId = req.agentId;
    const nextChat = await chatServices.nextChat();
    const agent = await chatServices.getAgentData(agentId);
    if (nextChat) {
      const chatData = {
        agentId,
        agentUsername: agent.username,
        chatStartTime: utilities.getNowLocalDate(new Date()),
      };
      await chatServices.updateChat(nextChat.chat.chatId, chatData);
      let waitingCount = await chatServices.removeFromWaiting(
        nextChat.chat._id
      );
      const io = require("../socket").getIo();
      io.emit("waiting_queue", { waitingCount });
      const agentSocket = await utilities.getSocketId(agent.username);
      await chatServices.addToAgentQueue(agentId, nextChat.user._id);
      io.to(agentSocket).emit("start_chat", {
        chatId: nextChat.chat.chatId,
        clientName: nextChat.user.fullName,
        userId: nextChat.user._id,
        chatHistory: [],
      });
      return res.status(200).json({
        success: true,
        chatId: nextChat.chat.chatId,
        clientName: nextChat.user.fullName,
        userId: nextChat.user._id,
        chatHistory: [],
      });
    } else {
      return res.status(200).json({ success: true, message: "Empty queue" });
    }
  } catch (err) {
    next(err);
  }
};

exports.getUserChatHistory = async (req, res, next) => {
  try {
    const userId = req.userId;
    const chat = await chatServices.chatHistory(userId);
    res.status(200).json({ success: true, chat });
  } catch (err) {
    next(err);
  }
};

exports.getAllChats = async (req, res, next) => {
  try {
    const { dateFrom, dateTo } = req.query;
    const localStartDate = utilities.getLocalDate(dateFrom);
    const localEndDate = utilities.getEndLocalDate(dateTo);
    const chats = await chatServices.allChats(localStartDate, localEndDate);
    res.status(200).json({ success: true, chats });
  } catch (err) {
    next(err);
  }
};

exports.getClientChats = async (req, res, next) => {
  try {
    const userId = req.query.userId;
    const chats = await chatServices.userChats(userId);
    res.status(200).json({ success: true, chats });
  } catch (err) {
    next(err);
  }
};

exports.getWaitingClients = async (req, res, next) => {
  try {
    const waitingList = await chatServices.waitingList();
    res.status(200).json({ success: true, waitingList });
  } catch (err) {
    next(err);
  }
};

exports.getNumberOfCurrentChats = async (req, res, next) => {
  try {
    const currentChats = await chatServices.countCurrentChats();
    res
      .status(200)
      .json({ success: true, currentChats: currentChats.currentChatsArray });
  } catch (err) {
    next(err);
  }
};

exports.getClientOrderDetails = async (req, res, next) => {
  try {
    const { orderId, userId } = req.query;
    const { user, orderDetails } = await chatServices.clientOrderDetails(
      orderId,
      userId
    );
    res.status(200).json({ success: true, user, orderDetails });
  } catch (err) {
    next(err);
  }
};
