const express = require("express");
const checkLogIn = require("../middlewares/checkLogin");
const {
  sendNotification,
  getNotification,
} = require("../controllers/notificationController");

const notificationRouter = express.Router();

//send notification
// notificationRouter.post("/send-notification", checkLogIn, sendNotification);

//get all notification
notificationRouter.get("/get-notification", checkLogIn, getNotification);

module.exports = notificationRouter;
