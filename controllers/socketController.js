const rdsClient = require("../config/redisConnect");

exports.updateSocket = async (socket) => {
  try {
    const cacheDB = rdsClient.getRedisConnection();
    socket.on("update_socket", async (event) => {
      socket.username = event.username;
      const username = event.username;
      await cacheDB.hSet(`${username}-s`, "socket", JSON.stringify(socket.id));
    });
  } catch (err) {
    console.log(err);
  }
};