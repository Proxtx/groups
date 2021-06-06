var channelModule = require("../channel/channelModule");
var key = require("../../modules/key");
var genString = require("../../modules/genString");
var perm = require("../../modules/perm");

var groupModule = {
  initGroup: async function (db, users, name, Key) {
    var auth = await key.getKey(db, Key);
    if (auth.success) {
      if (await perm.get(db, { system: true }, "create_groups", auth.userId)) {
        for (var i in users) {
          if (users[i] == auth.userId) {
            var groupId = await genString.returnString(
              db,
              "groups",
              {},
              "groupId"
            );
            await perm.set(
              db,
              {
                groupId: groupId,
              },
              "admin",
              auth.userId,
              true
            );
            await db.collection("groups").insertOne({
              name: name,
              users: users,
              groupId: groupId,
              time: Date.now(),
              img: "default",
              channels: [],
            });
            await this.addChannel(db, Key, groupId, "General");
            return { success: true, groupId: groupId };
          }
        }
        return { success: false, code: 4 };
      } else {
        return { success: false, error: 2 };
      }
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
          .project({ name: 1, channels: 1, img: 1 })
          .toArray()
      )[0];
      info.img = group.img;
      info.name = group.name;
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

  addAdmin: async function (db, Key, groupId, userId) {
    var groupOwn = await this.groupOwn(db, Key, groupId, "admin");
    if (groupOwn.success) {
      await perm.set(db, { groupId: groupId }, "admin", userId, true);
      return { success: true };
    } else {
      return groupOwn;
    }
  },

  removeAdmin: async function (db, Key, groupId, userId) {
    var groupOwn = await this.groupOwn(db, Key, groupId, "admin");
    if (groupOwn.success) {
      await perm.delete(db, { groupId: groupId }, "admin", userId);
      return { success: true };
    } else {
      return groupOwn;
    }
  },

  renameGroup: async function (db, Key, groupId, name) {
    var groupOwn = await this.groupOwn(db, Key, groupId, "admin");
    if (groupOwn.success) {
      await db
        .collection("groups")
        .updateOne({ groupId: groupId }, { $set: { name: name } });
      return { success: true };
    } else {
      return groupOwn;
    }
  },

  listGroups: async function (db, Key) {
    var auth = await key.getKey(db, Key);
    if (auth.success) {
      var groups = await db
        .collection("groups")
        .find({ users: auth.userId })
        .project({ name: 1, groupId: 1, img: 1 })
        .toArray();
      var rGroups = [];
      for (var i in groups) {
        var p = {
          name: groups[i].name,
          groupId: groups[i].groupId,
          img: groups[i].img,
          admin: await perm.get(
            db,
            { groupId: groups[i].groupId },
            "admin",
            auth.userId
          ),
        };
        rGroups.push(p);
      }
      return { success: true, groups: rGroups };
    } else {
      return auth;
    }
  },

  deleteGroup: async function (db, Key, groupId) {
    var groupOwn = await this.groupOwn(db, Key, groupId, "admin");
    if (groupOwn.success) {
      var channels = (
        await db
          .collection("groups")
          .find({ groupId: groupId })
          .project({ channels: 1 })
          .toArray()
      )[0].channels;
      for (var i in channels) {
        await this.deleteChannel(db, Key, groupId, channels[i]);
      }
      await perm.deleteById(db, { groupId: groupId });
      await db.collection("groups").deleteMany({ groupId: groupId });
      return { success: true };
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
