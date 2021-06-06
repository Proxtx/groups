var genString = require("../../modules/genString");
var key = require("../../modules/key");
var perm = require("../../modules/perm");

var channelModule = {
  initChannel: async function (db, title, Key, groupId) {
    var auth = await key.getKey(db, Key);
    if (auth.success) {
      if (await perm.get(db, { groupId: groupId }, "admin", auth.userId)) {
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
          apps: [],
        });
        await this.addApp(db, Key, channelId, "chat");
        await this.addApp(db, Key, channelId, "file");
        return { success: true, channelId: channelId };
      } else {
        return { success: true, error: 2 };
      }
    } else {
      return auth;
    }
  },
  getChannelInfo: async function (db, Key, channelId) {
    var channelOwn = await this.channelOwn(db, Key, channelId);
    if (channelOwn.success) {
      var channel = (
        await db
          .collection("channels")
          .find({ channelId: channelId })
          .project({ _id: 0, title: 1, time: 1, groupId: 1, apps: 1 })
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
        apps: [],
      };
      for (var i in channel.apps) {
        info.apps.push({
          app: channel.apps[i],
          name: global.apps[channel.apps[i]].appName,
        });
      }
      return {
        success: true,
        channel: info,
      };
    } else {
      return channelOwn;
    }
  },

  setChannelTitle: async function (db, Key, channelId, title) {
    var channelOwn = await this.channelOwn(db, Key, channelId, "admin");
    if (channelOwn.success) {
      await db
        .collection("channels")
        .updateOne({ channelId: channelId }, { $set: { title: title } });
      return { success: true };
    } else {
      return channelOwn;
    }
  },

  addApp: async function (db, Key, channelId, app) {
    var channelOwn = await this.channelOwn(db, Key, channelId, "admin");
    if (channelOwn.success) {
      if (
        (await db
          .collection("channels")
          .find({ channelId: channelId, apps: app })
          .count()) < 1
      ) {
        if (global.apps[app] && global.apps[app].channel) {
          var App = require("../" + app + "/" + global.apps[app].channel);
          if (App.initChannelApp) {
            App.initChannelApp(db, channelId, Key);
          }
          await db
            .collection("channels")
            .updateOne({ channelId: channelId }, { $push: { apps: app } });
          return { success: true };
        } else {
          return { success: false, error: 6 };
        }
      } else {
        return { success: false, error: 5 };
      }
    } else {
      return channelOwn;
    }
  },

  deleteApp: async function (db, Key, channelId, app) {
    var channelOwn = await this.channelOwn(db, Key, channelId, "admin");
    if (channelOwn.success) {
      if (
        (await db
          .collection("channels")
          .find({ channelId: channelId, apps: app })
          .count()) > 0
      ) {
        var App = require("../" + app + "/" + global.apps[app].channel);
        if (App.deleteChannelApp) {
          await App.deleteChannelApp(db, channelId, Key);
        }
        await db
          .collection("channels")
          .updateOne({ channelId: channelId }, { $pull: { apps: app } });
        return { success: true };
      } else {
        return { success: false, error: 6 };
      }
    } else {
      return channelOwn;
    }
  },

  delete: async function (db, channelId, Key) {
    var channelOwn = await this.channelOwn(db, Key, channelId, "admin");
    if (channelOwn.success) {
      var apps = (
        await db
          .collection("channels")
          .find({ channelId: channelId })
          .project({ apps: 1 })
          .toArray()
      )[0].apps;
      for (var i in apps) {
        await this.deleteApp(db, Key, channelId, apps[i]);
      }
      await db.collection("channels").deleteMany({ channelId: channelId });
      return { success: true };
    } else {
      return channelOwn;
    }
  },

  channelOwn: async function (db, Key, channelId, permS = "read") {
    var auth = await key.getKey(db, Key);
    if (auth.success) {
      var groupId = await db
        .collection("channels")
        .find({ channelId: channelId })
        .project({ groupId: 1 })
        .toArray();
      if (
        groupId.length > 0 &&
        (permS == "read" ||
          (await perm.get(
            db,
            { groupId: groupId[0].groupId },
            permS,
            auth.userId
          )))
      ) {
        groupId = groupId[0].groupId;
        var group = await db
          .collection("groups")
          .find({ groupId: groupId, users: auth.userId, groupId: groupId });
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
  },
};

module.exports = channelModule;
