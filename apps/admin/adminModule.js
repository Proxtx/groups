var perm = require("../../modules/perm");
var key = require("../../modules/key");
var scrollview = require("../../modules/scrollview");

var pPerms = ["list_users", "manage_users"];

var adminModule = {
  getPerms: async function (db, Key) {
    var auth = await key.getKey(db, Key);
    if (auth.success) {
      var perms = {};
      for (var i in pPerms) {
        if (await perm.get(db, { system: true }, pPerms[i], auth.userId)) {
          perms[pPerms[i]] = true;
        }
      }
      return { success: true, perms: perms };
    } else {
      return auth;
    }
  },

  listUsers: async function (db, Key, start, amount) {
    var p = await this.permCheck(db, Key, "list_users");
    if (p.success) {
      return await scrollview.getScrollviewContent(
        db
          .collection("user")
          .find({})
          .project({
            username: 1,
            profileImage: 1,
            userId: 1,
            email: 1,
            _id: 0,
          }),
        start,
        amount
      );
    } else {
      return p;
    }
  },

  permCheck: async function (db, Key, Perm) {
    var auth = await key.getKey(db, Key);
    if (auth.success) {
      var access = await perm.get(db, { system: true }, Perm, auth.userId);
      if (access === true) {
        return { success: true, auth: auth };
      } else {
        return { success: false, error: 2 };
      }
    } else {
      return auth;
    }
  },
};
module.exports = adminModule;
