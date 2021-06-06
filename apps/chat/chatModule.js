var scrollview = require("../../modules/scrollview");
var channelModule = require("../channel/channelModule");

var chatModule = {
  lastUpdateTime: 0,

  sendMessage: async function (db, Key, text, channelId) {
    var channelOwn = await channelModule.channelOwn(db, Key, channelId);
    if (channelOwn.success) {
      var data = {
        userId: channelOwn.auth.userId,
        time: Date.now(),
        message: { type: "text", text: text },
        channelId: channelId,
      };
      await db.collection("chatMessages").insertOne(data);
      db.collection("channels").updateOne(
        { channelId: channelId },
        { $set: { time: Date.now() } }
      );
      db.collection("groups").updateOne(
        { groupId: channelOwn.groupId },
        { $set: { time: Date.now() } }
      );
      return { success: true };
    } else {
      return channelOwn;
    }
  },

  getMessages: async function (db, Key, channelId, start, amount) {
    var channelOwn = await channelModule.channelOwn(db, Key, channelId);
    if (channelOwn.success) {
      if (!this.chatMessagesListener) {
        this.chatMessagesListener = await db.collection("channels").watch();
        this.chatMessagesListener.on("change", async (next) => {
          if (next.operationType == "update") {
            var channel = (
              await db
                .collection("channels")
                .find({ _id: next.documentKey._id })
                .project({ channelId: 1, time: 1 })
                .toArray()
            )[0];
            if (channel && channel.time != this.lastUpdateTime) {
              var channelId = channel.channelId;
              for (var i in global.socketHandler.subs.chat[channelId]) {
                var channelOwn = await channelModule.channelOwn(
                  db,
                  global.socketHandler.subs.chat[channelId][i].cmdChain[3],
                  global.socketHandler.subs.chat[channelId][i].cmdChain[2]
                );
                if (channelOwn.success) {
                  global.socketHandler.sendMessage(
                    "chat",
                    channelId,
                    i,
                    (
                      await db
                        .collection("chatMessages")
                        .find({ channelId: channelId })
                        .sort({ time: -1 })
                        .toArray()
                    )[0]
                  );
                } else {
                  global.socketHandler.subs.chat[channelId].splice(i, 1);
                }
              }
              this.lastUpdateTime = channel.time;
            }
          }
        });
      }
      return await scrollview.getScrollviewContent(
        db
          .collection("chatMessages")
          .find({ channelId: channelId })
          .sort({ time: -1 })
          .project({ time: 1, _id: 0, message: 1, userId: 1 }),
        start,
        amount
      );
    } else {
      return channelOwn;
    }
  },

  deleteChannelApp: async function (db, channelId) {
    await db.collection("chatMessages").deleteMany({ channelId: channelId });
    return;
  },
};

module.exports = chatModule;
