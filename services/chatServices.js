const Queue = require("../models/queue");
const Settings = require("../models/settings");
const WaitingList = require("../models/waitingList");
const Admin = require("../models/admin");
const User = require("../models/user");
const Chat = require("../models/chat");

exports.createQueue = async (userData) => {
  try {
    const settings = await Settings.findOne();
    const queueData = {
      callAgentId: userData.callAgentId,
      username: userData.username,
      maxQueue: settings.chatQueue,
    };
    let queue = await Queue.findOne({ callAgentId: queueData.callAgentId });
    if (!queue) {
      queue = new Queue(queueData);
      await queue.save();
    }
    return queue;
  } catch (err) {
    throw err;
  }
};

exports.getAvailableAgent = async () => {
  try {
    const settings = await Settings.findOne();
    const agent = await Queue.findOne({
      currentChats: { $lt: settings.chatQueue },
    }).populate("callAgentId");
    if (!agent) {
      return false;
    } else {
      return agent;
    }
  } catch (err) {
    throw err;
  }
};

exports.createWaiting = async (waitingData) => {
  try {
    const isWaiting = await WaitingList.findOne({ userId: waitingData.userId });
    if (!isWaiting) {
      const waitingUser = new WaitingList(waitingData);
      await waitingUser.save();
      const waitingCount = await WaitingList.countDocuments();
      return waitingCount;
    } else {
      const waitingCount = await WaitingList.countDocuments();
      return waitingCount;
    }
  } catch (err) {
    throw err;
  }
};

exports.getWelcomMsg = async (userId) => {
  try {
    const settings = await Settings.findOne();
    const user = await User.findById(userId);
    return { welcoming: settings.chatWelcomingMsg, fullName: user.fullName };
  } catch (err) {
    throw err;
  }
};

exports.createChat = async (isNewChat, chatData) => {
  try {
    let chat;
    if (!isNewChat) {
      chat = await Chat.findOne({ userId: chatData.userId }).sort({
        createdAt: -1,
      });
    } else {
      chat = new Chat(chatData);
      await chat.save();
    }
    return chat;
  } catch (err) {
    throw err;
  }
};

exports.addClientToAgentQueue = async (queueId, clientId) => {
  try {
    const agentQueue = await Queue.findById(queueId);
    let clientExist = agentQueue.clients.find((client) => {
      return client.toString() === clientId.toString();
    });
    if (clientExist) {
      return false;
    } else {
      agentQueue.currentChats += 1;
      agentQueue.clients.push(clientId.toString());
      await agentQueue.save();
      return true;
    }
  } catch (err) {
    throw err;
  }
};

exports.addToChatHistory = async (chatId, msgInfo) => {
  try {
    const chat = await Chat.findById(chatId);
    chat.messages.push(msgInfo);
    await chat.save();
    return chat;
  } catch (err) {
    throw err;
  }
};

exports.getFirstAgentMsg = async (chatId) => {
  try {
    const chat = await Chat.findById(chatId);
    let msg;
    for (let m of chat.messages) {
      if (m.sender === "agent") {
        msg = m;
        break;
      }
    }
    return msg?.timestamp || "";
  } catch (err) {
    throw err;
  }
};

exports.closeChat = async (agentId, chatId, chatData) => {
  try {
    const chat = await Chat.findById(chatId);
    await Chat.findByIdAndUpdate(chatId, chatData);
    const queue = await Queue.findOne({ callAgentId: agentId });
    queue.currentChats -= 1;
    const updatedClients = queue.clients;
    const filteredClients = updatedClients.filter((client) => {
      return client.toString() !== chat.userId.toString();
    });
    queue.clients = filteredClients;
    await queue.save();
  } catch (err) {
    throw err;
  }
};

exports.getAgentData = async (agentId) => {
  try {
    const agent = await Admin.findById(agentId);
    if (!agent) {
      throw new Error("this agent does not exist");
    }
    return agent;
  } catch (err) {
    throw err;
  }
};

exports.currentChats = async (agentId) => {
  try {
    const agentQueue = await Queue.findOne({ callAgentId: agentId });
    const chats = [];
    for (let clientId of agentQueue.clients) {
      let chat = await Chat.findOne({
        userId: clientId,
        agentId: agentId,
      }).sort({ createdAt: -1 });
      let client = await User.findById(clientId);
      if (chat) {
        let chatData = {
          chatId: chat._id,
          clientName: client.fullName,
          userId: client._id,
          chatHistory: chat.messages,
        };
        chats.push(chatData);
      }
    }
    return chats;
  } catch (err) {
    throw err;
  }
};

exports.nextChat = async () => {
  try {
    const chat = await WaitingList.findOne();
    const user = await User.findById(chat.userId);
    if (!chat || !user) {
      return false;
    } else {
      return { chat, user };
    }
  } catch (err) {
    throw err;
  }
};

exports.updateChat = async (chatId, chatData) => {
  try {
    await Chat.findByIdAndUpdate(chatId, chatData);
  } catch (err) {
    throw err;
  }
};

exports.removeFromWaiting = async (waitingId) => {
  try {
    await WaitingList.findByIdAndDelete(waitingId);
    const waitingCount = await WaitingList.countDocuments();
    return waitingCount;
  } catch (err) {
    throw err;
  }
};

exports.addToAgentQueue = async (agentId, clientId) => {
  try {
    const queue = await Queue.findOne({ callAgentId: agentId });
    let clientExist = queue.clients.find((client) => {
      return client.toString() === clientId.toString();
    });
    if (clientExist) {
      return false;
    } else {
      queue.currentChats += 1;
      queue.clients.push(clientId.toString());
      await queue.save();
      return true;
    }
  } catch (err) {
    throw err;
  }
};

exports.chatHistory = async (userId) => {
  try {
    const chats = await Chat.find({ userId }).sort({ createdAt: -1 });
    const histories = [];
    for (let chat of chats) {
      histories.push(...chat.messages);
    }
    return histories;
  } catch (err) {
    throw err;
  }
};

exports.allChats = async (startDate, endDate) => {
  try {
    const chats = await Chat.find({
      createdAt: { $gte: startDate, $lte: endDate },
    }).populate(["agentId", "userId"]);
    return chats;
  } catch (err) {
    throw err;
  }
};

exports.userChats = async (userId) => {
  try {
    const userChats = await Chat.find({ userId });
    return userChats;
  } catch (err) {
    throw err;
  }
};
