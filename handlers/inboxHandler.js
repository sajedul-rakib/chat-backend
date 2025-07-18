//external package
const express = require("express");

//inbox router
const inboxRouter = express.Router();

const {
  getFriendList,
  createConversation,
  sendMessage,
  getMessage,
  getUser,
  searchUser,
} = require("../controllers/inboxController");

//internal package
const checkLogIn = require("../middlewares/checkLogin");
const Conversation = require("../models/Conversation");
const checkFriendExistAtFriendList = require("../middlewares/inbox/checkFriendsExist");
//get all user
inboxRouter.get("/user", checkLogIn, getUser);

//get friend list
inboxRouter.get("/conversation", checkLogIn, getFriendList);

//create conversation
inboxRouter.post(
  "/conversation",
  checkLogIn,
  checkFriendExistAtFriendList,
  createConversation
);

//send message
inboxRouter.post("/message/:id", checkLogIn, sendMessage);

//get message
inboxRouter.get("/message/:id", checkLogIn, getMessage);

//seach user through email or name
inboxRouter.post("/search", checkLogIn, searchUser);

module.exports = inboxRouter;
