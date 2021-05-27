var key = require("../../modules/key");
key = new key();
var scrollview = require("../../modules/scrollview");
scrollview = new scrollview();
var config = require("../../modules/config");
config = new config();

class chatModule {
  chatMessagesListener;

  sendMessage = async function (db, Key, text, groupId) {
    var chatOwn = await this.chatOwn(db, Key, groupId);
    if (chatOwn.success) {
      var data = {
        userId: chatOwn.auth.userId,
        time: Date.now(),
        message: { type: "text", text: text },
        groupId: groupId,
      };
      await db.collection("chatMessages").insertOne(data);
      db.collection("groups").updateOne(
        { groupId: groupId },
        { $set: { time: Date.now() } }
      );
      return { success: true };
    } else {
      return chatOwn;
    }
  };

  getMessages = async function (db, Key, groupId, start, amount) {
    var chatOwn = await this.chatOwn(db, Key, groupId);
    if (chatOwn.success) {
      if (!this.chatMessagesListener) {
        this.chatMessagesListener = await db.collection("groups").watch();
        this.chatMessagesListener.on("change", async (next) => {
          var groupId = (
            await db
              .collection("groups")
              .find({ _id: next.documentKey._id })
              .project({ groupId: 1 })
              .toArray()
          )[0].groupId;
          for (var i in global.socketHandler.subs.chat[groupId]) {
            var chatOwn = await this.chatOwn(
              db,
              global.socketHandler.subs.chat[groupId][i].cmdChain[3],
              global.socketHandler.subs.chat[groupId][i].cmdChain[2]
            );
            if (chatOwn.success) {
              global.socketHandler.sendMessage(
                "chat",
                groupId,
                i,
                (
                  await db
                    .collection("chatMessages")
                    .find({ groupId: groupId })
                    .sort({ time: -1 })
                    .toArray()
                )[0]
              );
            } else {
              global.socketHandler.subs.chat[groupId].splice(i, 1);
            }
          }
        });
      }
      return await scrollview.getScrollviewContent(
        db
          .collection("chatMessages")
          .find({ groupId: groupId })
          .sort({ time: -1 })
          .project({ time: 1, _id: 0, message: 1, userId: 1 }),
        start,
        amount
      );
    } else {
      return chatOwn;
    }
  };

  chatOwn = async function (db, Key, groupId) {
    var auth = await key.getKey(db, Key);
    if (auth.success) {
      var chat = await db
        .collection("groups")
        .find({ groupId: groupId, users: auth.userId });
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
