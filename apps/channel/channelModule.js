var genString = require("../../modules/genString");
genString = new genString();
var key = require("../../modules/key");
key = new key();

class channelModule {
  initChannel = async function (db, title, Key, groupId) {
    var auth = await key.getKey(db, Key);
    if (auth.success) {
      var channelId = await genString.returnString(
        db,
        "channels",
        {},
        "channelId"
      );
      await db.collection("channels").insertOne({
        title: title,
        groupId: groupId,
        channelId: channelId,
        time: Date.now(),
      });
      return { success: true, channelId: channelId };
    } else {
      return auth;
    }
  };
  getChannelInfo = async function (db, Key, channelId) {
    var channelOwn = await this.channelOwn(db, Key, channelId);
    if (channelOwn.success) {
      var channel = (
        await db
          .collection("channels")
          .find({ channelId: channelId })
          .project({ _id: 0, title: 1, time: 1, groupId: 1 })
          .toArray()
      )[0];
      var group = (
        await db
          .collection("groups")
          .find({ groupId: channel.groupId })
          .project({ users: 1, img: 1 })
          .toArray()
      )[0];
      var info = {
        title: channel.title,
        time: channel.time,
        users: group.users,
        img: group.img,
      };
      return {
        success: true,
        channel: info,
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

  channelOwn = async function (db, Key, channelId) {
    var auth = await key.getKey(db, Key);
    if (auth.success) {
      var groupId = await db
        .collection("channels")
        .find({ channelId: channelId })
        .project({ groupId: 1 })
        .toArray();
      if (groupId.length > 0) {
        groupId = groupId[0].groupId;
        var group = await db
          .collection("groups")
          .find({ groupId: groupId, users: auth.userId });
        if ((await group.count()) > 0) {
          return { success: true, auth: auth };
        } else {
          return { success: false, error: 6 };
        }
      } else {
        return { success: false, error: 6 };
      }
    } else {
      return auth;
    }
  };
}

module.exports = channelModule;
