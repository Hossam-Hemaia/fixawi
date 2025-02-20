const chatServices = require("../services/chatServices");

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

exports.getOlderChatHistory = async (req, res, next) => {
  try {
    const userId = req.query.userId;
    const partnerId = req.query.partnerId;
    const chatId = await chatServices.findCahtId(userId, partnerId);
    const page = req.query.page;
    const chatHistory = await chatServices.getOlderChatHistory(
      chatId,
      page,
      25
    );
    res.status(200).json({ success: true, history: chatHistory });
  } catch (err) {
    next(err);
  }
};

exports.getNotificationsCount = async (req, res, next) => {
  try {
    const userId = req.query.userId;
    const notificationsCount = await chatServices.getUnseenNotifications(
      userId
    );
    res.status(200).json({ success: true, count: notificationsCount });
  } catch (err) {
    throw err;
  }
};

exports.getNotifications = async (req, res, next) => {
  try {
    const userId = req.query.userId;
    const page = req.query.page;
    const notificationsHistory = await chatServices.getNotificationsHistory(
      userId,
      page,
      20
    );
    res.status(200).json({ success: true, history: notificationsHistory });
  } catch (err) {
    next(err);
  }
};

exports.postChangeNotificationStatus = async (req, res, next) => {
  try {
    const userId = req.body.userId;
    await chatServices.updateNotificationStatus(userId);
    res.status(201).json({ success: true });
  } catch (err) {
    throw err;
  }
};
