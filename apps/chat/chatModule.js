var genString = require("../../modules/genString");
genString = new genString();
var key = require("../../modules/key");
key = new key();
var scrollview = require("../../modules/scrollview");
scrollview = new scrollview();
var config = require("../../modules/config");
config = new config();

class chatModule {
  initChat = async function (db, users, title, Key) {
    var auth = await key.getKey(db, Key);
    if (auth.success) {
      for (var i in users) {
        if (users[i] == auth.userId) {
          var chatId = await genString.returnString(db, "chats", {}, "chatId");
          await db.collection("chats").insertOne({
            title: title,
            users: users,
            chatId: chatId,
            time: Date.now(),
          });
          return { success: true, chatId: chatId };
        }
      }
      return { success: false, code: 2 };
    } else {
      return auth;
    }
  };
  sendMessage = async function (db, Key, text, chatId) {
    var chatOwn = await this.chatOwn(db, Key, chatId);
    if (chatOwn.success) {
      var data = {
        userId: chatOwn.auth.userId,
        time: Date.now(),
        message: { type: "text", text: text },
        chatId: chatId,
      };
      await db.collection("chatMessages").insertOne(data);
      for (var i in global.socketHandler.subs.chat[chatId]) {
        global.socketHandler.sendMessage("chat", chatId, i, data);
      }
      return { success: true };
    } else {
      return chatOwn;
    }
  };

  getMessages = async function (db, Key, chatId, start, amount) {
    var chatOwn = await this.chatOwn(db, Key, chatId);
    if (chatOwn.success) {
      return await scrollview.getScrollviewContent(
        db
          .collection("chatMessages")
          .find({ chatId: chatId })
          .sort({ time: -1 })
          .project({ time: 1, _id: 0, message: 1, userId: 1 }),
        start,
        amount
      );
    } else {
      return chatOwn;
    }
  };

  chatOwn = async function (db, Key, chatId) {
    var auth = await key.getKey(db, Key);
    if (auth.success) {
      var chat = await db
        .collection("chats")
        .find({ chatId: chatId, users: auth.userId });
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
