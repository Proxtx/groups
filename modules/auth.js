var genString = require("./genString");
var key = require("./key");
var perm = require("./perm");
var config = require("./config");

var auth = {
  signin: async function (db, email, password) {
    var result = await db.collection("user").find({ email: email });
    result = await result.toArray();
    if (result.length > 0) {
      if (result[0].password == password) {
        if (result[0].verifyMail && result[0].verifyTel) {
          return {
            success: true,
            username: result[0].username,
            userId: result[0].userId,
          };
        } else {
          return { success: false, error: 3, text: "Verify error" };
        }
      } else {
        return { success: false, error: 1, text: "Not Found" };
      }
    } else {
      return { success: false, error: 1, text: "Not Found" };
    }
  },
  register: async function (db, email, password, username, tel) {
    var user = await db.collection("user").find({ email: email }).toArray();
    if (user.length > 0) {
      return { success: false, error: 5, text: "Already Exists" };
    } else {
      if (email && username && password && tel) {
        var cfg = await config.getConfig();
        var userId = await genString.returnString(db, "user", {}, "userId");
        await db.collection("user").insertOne({
          email: email,
          password: password,
          username: username,
          tel: tel,
          verifyTel: true,
          verifyMail: true,
          userId: userId,
          profileImage: "default",
        });
        await db
          .collection("userApps")
          .insertOne({ userId: userId, apps: cfg.newUser.apps });
        for (var i in cfg.newUser.perms) {
          await perm.set(
            db,
            { system: true },
            cfg.newUser.perms[i],
            userId,
            true
          );
        }
        return { success: true, userId: userId };
      } else {
        return { success: false, error: 4, text: "Missing Data" };
      }
    }
  },
  getEmail: async function (db, email) {
    var user = await db.collection("user").find({ email: email });
    if ((await user.count()) > 0) {
      return { success: true, userId: (await user.toArray())[0].userId };
    } else {
      return { success: false, error: 6 };
    }
  },
  deleteUser: async function (db, Key, userId) {
    var auth = await key.getKey(db, Key);
    if (auth.success) {
      if (await perm.get(db, { system: true }, "manage_users", auth.userId)) {
        await db.collection("user").deleteMany({ userId: userId });
        await db.collection("keys").deleteMany({ userId: userId });
        await db.collection("userApps").deleteMany({ userId: userId });
        await db.collection("perms").deleteMany({ userId: userId });
        return { success: true };
      } else {
        return { success: false, error: 2 };
      }
    } else {
      return auth;
    }
  },
};

module.exports = auth;
