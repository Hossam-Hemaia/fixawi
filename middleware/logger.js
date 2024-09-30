const path = require("path");
const { createLogger, transports, format } = require("winston");

const logger = createLogger({
  level: "error",
  format: format.combine(
    format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    format.errors({ stack: true }),
    format.json()
  ),
  transports: [
    new transports.File({
      filename: path.join(__dirname, "logs", "error.log"),
    }),
  ],
});

module.exports = logger;
