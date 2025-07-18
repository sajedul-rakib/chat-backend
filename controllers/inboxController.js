//user seassion : check the user now active in her conversation
const userSession = {};
const userOnline = [];

//external package
const mongoose = require("mongoose");

//internal package
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const escapeKey = require("../utilities/escape");
const { sendNotification } = require("./notificationController");

//check user now online or offline
global.io.on("connection", (socket) => {
  socket.on("user_online", ({ userId }) => {
    let index = userOnline.indexOf(userId);
    if (index < 0) {
      userOnline.push(userId);
    }
    console.log(userOnline);
    global.io.emit("online_user", userOnline);
  });

  socket.on("user_offline", ({ userId }) => {
    let indexItem = userOnline.indexOf(userId);

    if (indexItem >= 0) {
      userOnline.splice(indexItem, 1);
    }
    console.log(userOnline);
    global.io.emit("online_user", userOnline);
  });
});

//for check the friend on screen either send a notification to friend his take attenstion
global.io.on("connection", (socket) => {
  socket.on("join_chat", ({ conversationId, userId }) => {
    userSession[userId] = conversationId;
  });

  socket.on("leave_chat", ({ userId }) => {
    delete userSession[userId];
  });
});

//get conversation list which only add you
async function getFriendList(req, res) {
  try {
    const response = await Conversation.find({
      $or: [
        {
          participant: req.userId,
        },
        {
          owner: req.userId,
        },
      ],
    }).populate(["owner", "participant"]);

    res.status(200).json({
      message: "Success",
      result: response,
    });
  } catch (err) {
    res.status(404).json({
      errors: {
        common: {
          msg: err.message,
        },
      },
    });
  }
}

//get users
async function getUser(req, res) {
  try {
    const user = await User.find();

    res.status(200).json({
      data: user,
      msg: "Success",
    });
  } catch (err) {
    res.status(404).json({
      errors: {
        common: {
          msg: "There was an server side error",
        },
      },
    });
  }
}

//create a conversation
async function createConversation(req, res) {
  try {
    const findTheUserExistWithTheUser = await Conversation.find({
      owner: req.userId,
      participant: req.body._id,
    });

    if (findTheUserExistWithTheUser && findTheUserExistWithTheUser.length > 0) {
      // console.log(findTheUserExistWithTheUser);

      res.status(406).json({
        errors: {
          common: {
            msg: "This user already add with you",
          },
        },
      });
    } else {
      const createConversation = new Conversation({
        owner: req.userId,
        participant: req.body._id,
      });
      const result = await createConversation.save();

      //friend user detail
      const friend = await User.findById(req.body._id);

      //send notification
      if (friend.fcmToken !== "") {
        sendNotification(
          "A new friend added",
          `${req.fullName} add with you, now you can send and recieve message`,
          friend.fcmToken
        );
      }
      await result.populate(["owner", "participant"]);

      res.status(200).json({
        msg: "Conversation was created successfully",
        data: result,
      });
    }
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: err.message,
        },
      },
    });
  }
}

//send message
async function sendMessage(req, res) {
  try {
    const conversationId = req.params.id;
    const createMessage = new Message({
      conversationId: conversationId,
      sender: req.userId,
      ...req.body,
    });
    const result = await createMessage.save();

    if (userSession[req.body.receiver] != conversationId) {
      //send push notification
      const friendUser = await User.findById(req.body.receiver);
      //send notification to friend he get a new message
      if (friendUser.fcmToken !== "") {
        sendNotification(
          `${req.fullName} send a message`,
          `Message: ${createMessage.msg}`,
          friendUser.fcmToken,
          false
        );
      }
    }
    //emit new message
    global.io.emit("new_message", {
      data: createMessage,
    });

    //update the last message
    const updateMsg = await Conversation.updateOne(
      { _id: conversationId },
      { $set: { lastMessage: result.msg } }
    );

    res.status(200).json({
      msg: "Message sent successfully",
    });
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: err.message,
        },
      },
    });
  }
}

//get message
async function getMessage(req, res) {
  try {
    const message = await Message.find({ conversationId: req.params.id }).sort(
      "-createdAt"
    );

    res.status(200).json({
      data: message,
    });
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: "Unknown error occured",
        },
      },
    });
  }
}

//search user
async function searchUser(req, res) {
  const keyword = req.body.key;

  try {
    if (!keyword || keyword.trim() === "") {
      return res.json({ msg: "You must provide some text to find user" });
    }

    const name_search_regex = new RegExp(escapeKey(keyword), "i");
    const email_search_regex = new RegExp("^" + escapeKey(keyword) + "$", "i");

    // 1. Find your friend list (conversations where you're owner or participant)
    const conversations = await Conversation.find({
      $or: [{ owner: req.userId }, { participant: req.userId }],
    });

    // 2. Extract friend user IDs from conversations
    const friendIds = conversations.map((conv) => {
      if (conv.owner.toString() === req.userId.toString()) {
        return conv.participant.toString();
      } else {
        return conv.owner.toString();
      }
    });

    // 3. Exclude yourself and your friends
    const result = await User.find({
      _id: {
        $nin: [
          req.userId,
          ...friendIds.map((id) => new mongoose.Types.ObjectId(id)),
        ],
      },
      $or: [{ fullName: name_search_regex }, { email: email_search_regex }],
    });

    res.status(200).json({
      data: result,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({
      errors: {
        common: {
          msg: "There was a server-side error",
        },
      },
    });
  }
}

module.exports = {
  getUser,
  getFriendList,
  createConversation,
  sendMessage,
  getMessage,
  searchUser,
};
