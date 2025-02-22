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
      await chatServices.removeFromWaiting(nextChat.chat._id);
      await chatServices.addClientToAgentQueue(agentId);
      return res.status(200).json({
        success: true,
        chatId: nextChat.chat.chatId,
        clientName: nextChat.user.fullName,
      });
    } else {
      return res.status(200).json({ success: true, message: "Empty queue" });
    }
  } catch (err) {
    next(err);
  }
};
