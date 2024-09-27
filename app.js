const path = require("path");
const express = require("express");
const compression = require("compression");
const helmet = require("helmet");
const cors = require("cors-express");
const dotenv = require("dotenv");
const multer = require("multer");
const cron = require("node-cron");

const connectDB = require("./config/dbConnect");

const authRouter = require("./routes/auth");
const adminRouter = require("./routes/admin");
const scRouter = require("./routes/sc");

const fileStorage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "images");
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const options = {
  allow: {
    origin: "*",
    methods: "GET, POST, PUT, DELETE",
    headers: "Content-Type, Authorization, Cookie",
  },
  max: {
    age: null,
  },
};

dotenv.config();
const app = express();

const DB_URI = `${process.env.DB_URI}`;

app.use(cors(options));
app.use(helmet());
app.use(express.json());
app.use(compression());

app.use("/images", express.static(path.join(__dirname, "images")));
app.use("/files", express.static(path.join(__dirname, "files")));
app.use(multer({ storage: fileStorage }).array("files"));

app.use(process.env.API, authRouter);
app.use(process.env.API, adminRouter);
app.use(process.env.API, scRouter);

app.use((error, req, res, next) => {
  console.log(error);
  const status = error.statusCode || 500;
  const message = error.message;
  res.status(status).json({ success: false, message: message });
});

connectDB.connectDB(DB_URI);

const server = app.listen(process.env.PORT, "localhost", () => {
  console.log("Listening on port " + process.env.PORT);
});
