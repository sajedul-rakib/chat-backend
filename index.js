//external package
const { log } = require("console");
const express = require("express");
const { createServer } = require("http");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cors = require("cors");

//internal package
const {
  notFoundError,
  defalutErrorHandler,
} = require("./middlewares/common/errorMiddleware");
const path = require("path");

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
app.use("/public", express.static(path.join(__dirname, "public")));

//router
const userRouter = require("./handlers/userHandler");
const inboxRouter = require("./handlers/inboxHandler");
const notificationRouter = require("./handlers/notifcationHandler");

//routing setup
app.use("/", userRouter);
app.use("/", inboxRouter);
app.use("/", notificationRouter);

//404 - not found error handler
app.use(notFoundError);

//default error handler
app.use(defalutErrorHandler);

const PORT = process.env.PORT || 3000;

// io.on("connection", (socket) => {
//   socket.on("join_chat", ({ conversationId, userId }) => {
//     userSession[userId] = conversationId;
//   });

//   socket.on("leave_chat", ({ userId }) => {
//     console.log(userId);
//   });
// });

server.listen(PORT, () => {
  log(`the server running on ${PORT} port`);
});
