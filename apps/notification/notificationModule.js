var key = require("../../modules/key");
var scrollview = require("../../modules/scrollview");

var notification = {
  listNotifications: async function (db, Key, start, amount) {
    var auth = await key.getKey(db, Key);
    if (auth.success) {
      db.collection("notification").deleteMany({
        time: { $lt: Date.now() - 5 * 86400 * 1000 },
      });
      var data = (
        await scrollview.getScrollviewContent(
          db
            .collection("notification")
            .find({ users: auth.userId })
            .sort({ time: -1 }),
          start,
          amount
        )
      ).result;
      var notifications = [];
      for (var i in data) {
        var message = (
          await db
            .collection("chatMessages")
            .find({ messageId: data[i].messageId })
            .toArray()
        )[0];
        if (!message) continue;
        var user = (
          await db
            .collection("user")
            .find({ userId: message.userId })
            .project({ profileImage: 1, username: 1 })
            .toArray()
        )[0];
        if (!user) continue;
        var channel = (
          await db
            .collection("channels")
            .find({ channelId: message.channelId })
            .project({ title: 1, groupId: 1 })
            .toArray()
        )[0];
        if (!channel) continue;
        notifications.push({
          message: message.message,
          userName: user.username,
          profileImage: user.profileImage,
          channel: channel.title,
          channelId: message.channelId,
          groupId: channel.groupId,
        });
      }
      return { success: true, result: notifications };
    } else {
      return auth;
    }
  },
};

module.exports = notification;
