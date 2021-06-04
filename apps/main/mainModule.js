var key = require("../../modules/key");

var mainModule = {
  addApp: async function (db, Key, app) {
    var auth = await key.getKey(db, Key);
    if (auth.success) {
      var apps = await db
        .collection("userApps")
        .find({ userId: auth.userId, app: app });
      if (apps.count() < 1) {
        if (global.apps[app] && global.apps[app].user) {
          var App = require("../" + app + "/" + global.apps[app].user);
          if (App.initUserApp) {
            App.initUserApp(db, auth.userId, Key);
          }
          await db
            .collection("userApps")
            .updateOne({ userId: auth.userId }, { $push: { apps: app } });
          return { success: true };
        } else {
          return { success: false, error: 6 };
        }
      } else {
        return { success: false, error: 5 };
      }
    } else {
      return auth;
    }
  },
  deleteApp: async function (db, Key, app) {
    var auth = await key.getKey(db, Key);
    if (auth.success) {
      var apps = await db
        .collection("userApps")
        .find({ userId: auth.userId, app: app });
      if (apps.count() > 0) {
        var App = require("../" + app + "/" + global.apps[app].user);
        if (App.deleteUserApp) {
          App.deleteUserApp(db, auth.userId, Key);
        }
        await db
          .collection("userApps")
          .updateOne({ userId: auth.userId }, { $pull: { apps: app } });
        return { success: true };
      } else {
        return { success: false, error: 6 };
      }
    } else {
      return auth;
    }
  },

  listApps: async function (db, Key) {
    var auth = await key.getKey(db, Key);
    if (auth.success) {
      var apps = (
        await db.collection("userApps").find({ userId: auth.userId }).toArray()
      )[0].apps;
      var appData = [];
      for (var i in apps) {
        appData.push({ app: apps[i], name: global.apps[apps[i]].appName });
      }
      return { success: true, apps: appData };
    } else {
      return auth;
    }
  },
};

module.exports = mainModule;
