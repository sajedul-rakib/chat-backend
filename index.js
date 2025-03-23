//external package
const { log } = require("console");
const express = require("express");
const mongoose = require("mongoose");
const dotenv = require("dotenv");
const cookieParser = require("cookie-parser");

//internal package
const {
  notFoundError,
  defalutErrorHandler,
} = require("./middlewares/common/errorMiddleware");
const path = require("path");

//router
const { userRouter } = require("./handlers/userHandler");

//env configuration
dotenv.config();

//express applicaton
const app = express();

//connect database
mongoose
  .connect(process.env.MONGODB_CONNECTION_URL)
  .then((val) => {
    log("Database connect successfully");
  })
  .catch((err) => log(err));

//request parser
app.use(express.json());

//static file
app.use(express.static(path.join(__dirname, "public")));

//cookie parser
app.use(cookieParser(process.env.COOKIE_SECRET));

//routing setup
app.use("/", userRouter);

//404 - not found error handler
app.use(notFoundError);

//default error handler
app.use(defalutErrorHandler);

app.listen(process.env.PORT, () => {
  log(`the server running on ${process.env.PORT} port`);
});
