//external package
const { log } = require("console");
const express = require("express");
const { createServer } = require("http");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");
const cookieParser = require("cookie-parser");

//internal package
const {
  notFoundError,
  defalutErrorHandler,
} = require("./middlewares/common/errorMiddleware");
const path = require("path");

//router
const userRouter = require("./handlers/userHandler");
const inboxRouter = require("./handlers/inboxHandler");

//express applicaton
const app = express();
const server = createServer(app);

//env configuration
dotenv.config();

//socket creation
const io = require("socket.io")(server, {
  cors: {
    origin: "*", // Allow all origins (for testing)
    methods: ["GET", "POST"],
  },
  transports: ["websocket"], // Force WebSocket
});

global.io = io;

//connect database
mongoose
  .connect(process.env.MONGODB_CONNECTION_URL)
  .then((val) => {
    log("Database connect successfully");
  })
  .catch((err) => log(err));

//request parser
app.use(express.json());
app.use(cors());

//static file
app.use(express.static(path.join(__dirname, "public")));

//cookie parser
app.use(cookieParser(process.env.COOKIE_SECRET));

//routing setup
app.use("/", userRouter);
app.use("/", inboxRouter);

//404 - not found error handler
app.use(notFoundError);

//default error handler
app.use(defalutErrorHandler);

io.on("connection", (socket) => {
  console.log(`✅ Client connected: ${socket.id}`);

  socket.on("disconnect", () => {
    console.log(`❌ Client disconnected: ${socket.id}`);
  });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, "0.0.0.0", () => {
  log(`the server running on ${PORT} port`);
});
