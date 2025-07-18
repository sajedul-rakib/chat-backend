const admin = require("./notification/notificationSettings");

const Notification = require("../models/Notification");

//send notification to subscriner user
async function sendNotification(title, body, fcmToken, isSave) {
  try {
    //new notification
    const notification = {
      notification: {
        title,
        body,
      },
      token: fcmToken,
    };

    await admin.messaging().send(notification);

    if (isSave) {
      //notification save
      const notify = new Notification({
        title: title,
        body: body,
        fcmToken: fcmToken,
        userId: req.userId,
      });
      await notify.save();
    }

    // res.status(200).json({ msg: "Notification send successfully" });
  } catch (err) {
    // res.status(500).json({
    //   errors: {
    //     common: {
    //       msg: err,
    //     },
    //   },
    // });
    console.log("notification error", err);
  }
}

async function getNotification(req, res) {
  try {
  } catch (err) {
    res.status(500).json({
      errors: {
        common: {
          msg: err,
        },
      },
    });
  }
}

module.exports = {
  sendNotification,
  getNotification,
};
