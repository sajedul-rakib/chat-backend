const admin = require("./notification/notificationSettings");

//send notification to subscriner user
async function sendNotification(req, res) {
  const { title, body, fcmToken } = req.body;
  try {
    //new notification
    const notification = {
      notification: {
        title,
        body,
      },
      fcmToken,
    };

    //notiification
    const notify = new Notification({
      title: title,
      body: body,
      fcmToken: fcmToken,
      userId: req.userId,
    });

    await admin.messaging().send(notification);
    //notification save
    await notify.save();

    res.status(200).json({ msg: "Notification send successfully" });
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
