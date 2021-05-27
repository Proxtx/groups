var genString = require("../../modules/genString");
genString = new genString();
var key = require("../../modules/key");
key = new key();

class channelModule {
  initChannel = async function (db, users, title, Key) {
    var auth = await key.getKey(db, Key);
    if (auth.success) {
      for (var i in users) {
        if (users[i] == auth.userId) {
          var channelId = await genString.returnString(
            db,
            "chats",
            {},
            "channelId"
          );
          await db.collection("channels").insertOne({
            title: title,
            users: users,
            channelId: channelId,
            time: Date.now(),
            img: "default",
          });
          return { success: true, channelId: channelId };
        }
      }
      return { success: false, code: 2 };
    } else {
      return auth;
    }
  };
  getChannelInfo = async function (db, Key, channelId) {
    var channelOwn = await this.channelOwn(db, Key, channelId);
    if (channelOwn.success) {
      return {
        success: true,
        chat: (
          await db
            .collection("channels")
            .find({ channelId: channelId })
            .project({ _id: 0, title: 1, users: 1, img: 1, time: 1 })
            .toArray()
        )[0],
      };
    } else {
      return channelOwn;
    }
  };

  setChannelTitle = async function (db, Key, channelId, title) {
    var channelOwn = await this.channelOwn(db, Key, channelId);
    if (channelOwn.success) {
      await db
        .collection("channels")
        .updateOne({ channelId: channelId }, { $set: { title: title } });
      return { success: true };
    } else {
      return channelOwn;
    }
  };

  leaveChannel = async function (db, Key, channelId, userId) {
    var channelOwn = await this.channelOwn(db, Key, channelId);
    if (channelOwn.success) {
      if (channelOwn.auth.userId == userId) {
        await db
          .collection("channels")
          .updateOne({ channelId: channelId }, { $pull: { users: userId } });
        return { success: true };
      } else {
        return { success: false, error: 2 };
      }
    } else {
      return channelOwn;
    }
  };

  addMember = async function (db, Key, channelId, users) {
    var channelOwn = await this.channelOwn(db, Key, channelId);
    if (channelOwn.success) {
      var add = [];
      for (var i in users) {
        if (
          (await db.collection("user").find({ userId: users[i] }).count()) >
            0 &&
          !(
            (
              await db
                .collection("channels")
                .find({ channelId: channelId, users: users[i] })
            ).count < 0
          )
        ) {
          add.push(users[i]);
        } else {
          return { success: false, error: 6 };
        }
      }
      await db
        .collection("channels")
        .updateOne(
          { channelId: channelId },
          { $push: { users: { $each: add } } }
        );
      return { success: true };
    } else {
      return channelOwn;
    }
  };

  channelOwn = async function (db, Key, channelId) {
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

module.exports = channelModule;
