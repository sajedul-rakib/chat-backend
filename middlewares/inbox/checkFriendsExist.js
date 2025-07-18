const { createHttpError } = require("http-errors");
const Conversation = require("../../models/Conversation");

async function checkFriendExistAtFriendList(req, res, next) {
  try {
    const response = await Conversation.find({
      "participant.id": req.body._id,
    });

    if (response && response.length > 0) {
      res.status(200).json({
        msg: "This user already added with you",
      });
    } else {
      next();
    }
  } catch (err) {
    next(createHttpError(500, "There was a server side error"));
  }
}

module.exports = checkFriendExistAtFriendList;
