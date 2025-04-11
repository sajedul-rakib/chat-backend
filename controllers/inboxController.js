//user seassion : check the user now active in her conversation
const userSession = {};
const userOnline = {};

//internal package
const Conversation = require("../models/Conversation");
const Message = require("../models/Message");
const User = require("../models/User");
const escapeKey = require("../utilities/escape");
const { sendNotification } = require("./notificationController");

//check user now online or offline
global.io.on("connection", (socket) => {
  socket.on("user_online", ({ userId, isOnline }) => {
    userOnline[userId] = isOnline;
    global.io.emit("online_user", userOnline);
  });

  socket.on("user_offline", ({ userId }) => {
    console.log(userId);
    delete userOnline[userId];
    global.io.emit("online_user", userOnline);
  });
});

//for check the friend on sceen either send a notification to friend his take attenstion
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
      $or: [
        {
          owner: req.body._id,
        },
        {
          participant: req.body._id,
        },
      ],
    });

    if (findTheUserExistWithTheUser && findTheUserExistWithTheUser.length > 0) {
      res.status(200).json({
        msg: "The user already add with you",
      });
    } else {
      const createConversation = new Conversation({
        owner: req.userId,
        participant: req.body._id,
      });
      const result = await createConversation.save();

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
  console.log(userSession);

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
    if (keyword === "" || keyword === undefined) {
      res.json({ msg: "You must provide some text to find user" });
    } else {
      const name_search_regex = new RegExp(escapeKey(keyword), "i");
      const email_search_regex = new RegExp(
        "^" + escapeKey(keyword) + "$",
        "i"
      );
      const result = await User.find({
        $or: [{ fullName: name_search_regex }, { email: email_search_regex }],
      });

      res.status(200).json({
        data: result,
      });
    }
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: "There was an server side error",
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
