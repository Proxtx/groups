var channelModule = require("../channel/channelModule");
var key = require("../../modules/key");
var genString = require("../../modules/genString");
var perm = require("../../modules/perm");

var groupModule = {
  initGroup: async function (db, users, title, Key) {
    var auth = await key.getKey(db, Key);
    if (auth.success) {
      for (var i in users) {
        if (users[i] == auth.userId) {
          var groupId = await genString.returnString(
            db,
            "groups",
            {},
            "groupId"
          );
          var channelId = (
            await channelModule.initChannel(db, "General", Key, groupId)
          ).channelId;
          await db.collection("groups").insertOne({
            title: title,
            users: users,
            groupId: groupId,
            time: Date.now(),
            img: "default",
            channels: [channelId],
          });
          return { success: true, groupId: groupId };
        }
      }
      return { success: false, code: 2 };
    } else {
      return auth;
    }
  },

  leaveGroup: async function (db, Key, groupId, userId) {
    var groupOwn = await this.groupOwn(db, Key, groupId, "admin");
    if (groupOwn.success) {
      await db
        .collection("groups")
        .updateOne({ groupId: groupId }, { $pull: { users: userId } });
      return { success: true };
    } else {
      return groupOwn;
    }
  },

  addMember: async function (db, Key, groupId, users) {
    var groupOwn = await this.groupOwn(db, Key, groupId, "admin");
    if (groupOwn.success) {
      var add = [];
      for (var i in users) {
        if (
          (await db.collection("user").find({ userId: users[i] }).count()) >
            0 &&
          !(
            (
              await db
                .collection("groups")
                .find({ groupId: groupId, users: users[i] })
            ).count < 0
          )
        ) {
          add.push(users[i]);
        } else {
          return { success: false, error: 6 };
        }
      }
      await db
        .collection("groups")
        .updateOne({ groupId: groupId }, { $push: { users: { $each: add } } });
      return { success: true };
    } else {
      return groupOwn;
    }
  },

  groupInfo: async function (db, Key, groupId) {
    var groupOwn = await this.groupOwn(db, Key, groupId);
    if (groupOwn.success) {
      var info = {};
      var group = (
        await db
          .collection("groups")
          .find({ groupId: groupId })
          .project({ title: 1, channels: 1, img: 1 })
          .toArray()
      )[0];
      info.img = group.img;
      info.title = group.title;
      info.channels = [];
      for (var i in group.channels) {
        info.channels.push({
          channelId: group.channels[i],
          title: (
            await db
              .collection("channels")
              .find({ channelId: group.channels[i] })
              .project({ title: 1 })
              .toArray()
          )[0].title,
        });
      }
      return {
        success: true,
        group: info,
      };
    } else {
      return groupOwn;
    }
  },

  addChannel: async function (db, Key, groupId, title) {
    var groupOwn = await this.groupOwn(db, Key, groupId, "admin");
    if (groupOwn.success) {
      var channel = await channelModule.initChannel(db, title, Key, groupId);
      var channelId = channel.channelId;
      if (channel.success) {
        await db
          .collection("groups")
          .updateOne({ groupId: groupId }, { $push: { channels: channelId } });
        return { success: true };
      } else {
        return channel;
      }
    } else {
      return groupOwn;
    }
  },

  deleteChannel: async function (db, Key, groupId, channelId) {
    var groupOwn = await this.groupOwn(db, Key, groupId, "admin");
    if (groupOwn.success) {
      var channel = await channelModule.delete(db, channelId, Key);
      if (channel.success) {
        await db
          .collection("groups")
          .updateOne({ groupId: groupId }, { $pull: { channels: channelId } });
        return { success: true };
      } else {
        return channel;
      }
    } else {
      return groupOwn;
    }
  },

  groupOwn: async function (db, Key, groupId, permS = "read") {
    var auth = await key.getKey(db, Key);
    if (auth.success) {
      groupId = groupId;
      var group = await db
        .collection("groups")
        .find({ groupId: groupId, users: auth.userId });
      if (
        (await group.count()) > 0 &&
        (permS == "read" ||
          (await perm.get(db, { groupId: groupId }, permS, auth.userId)))
      ) {
        return { success: true, auth: auth };
      } else {
        return { success: false, error: 6 };
      }
    } else {
      return auth;
    }
  },
};

module.exports = groupModule;
