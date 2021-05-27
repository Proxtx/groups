var key = require("../../modules/key");
key = new key();
var scrollview = require("../../modules/scrollview");
scrollview = new scrollview();
var config = require("../../modules/config");
config = new config();

class chatModule {
  chatMessagesListener;
  lastUpdateTime = 0;

  sendMessage = async function (db, Key, text, channelId) {
    var chatOwn = await this.chatOwn(db, Key, channelId);
    if (chatOwn.success) {
      var data = {
        userId: chatOwn.auth.userId,
        time: Date.now(),
        message: { type: "text", text: text },
        channelId: channelId,
      };
      await db.collection("chatMessages").insertOne(data);
      db.collection("channels").updateOne(
        { channelId: channelId },
        { $set: { time: Date.now() } }
      );
      return { success: true };
    } else {
      return chatOwn;
    }
  };

  getMessages = async function (db, Key, channelId, start, amount) {
    var chatOwn = await this.chatOwn(db, Key, channelId);
    if (chatOwn.success) {
      if (!this.chatMessagesListener) {
        this.chatMessagesListener = await db.collection("channels").watch();
        this.chatMessagesListener.on("change", async (next) => {
          var channel = (
            await db
              .collection("channels")
              .find({ _id: next.documentKey._id })
              .project({ channelId: 1, time: 1 })
              .toArray()
          )[0];
          if (channel.time != this.lastUpdateTime) {
            var channelId = channel.channelId;
            for (var i in global.socketHandler.subs.chat[channelId]) {
              var chatOwn = await this.chatOwn(
                db,
                global.socketHandler.subs.chat[channelId][i].cmdChain[3],
                global.socketHandler.subs.chat[channelId][i].cmdChain[2]
              );
              if (chatOwn.success) {
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
      return chatOwn;
    }
  };

  chatOwn = async function (db, Key, channelId) {
    var auth = await key.getKey(db, Key);
    if (auth.success) {
      var chat = await db
        .collection("channels")
        .find({ channelId: channelId, users: auth.userId });
      if ((await chat.count()) > 0) {
        return { success: true, auth: auth };
      } else {
        return { success: false, error: 6 };
      }
    } else {
      return auth;
    }
  };
}

module.exports = chatModule;
