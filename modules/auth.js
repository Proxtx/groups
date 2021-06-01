var key = require("./key");
var perm = require("./perm");
var genString = require("./genString");

perm.init();

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
        var userId = await genString.returnString(db, "user", {}, "userId");
        await db.collection("user").insertOne({
          email: email,
          password: password,
          username: username,
          tel: tel,
          verifyTel: true,
          verifyMail: true,
          userId: userId,
          lvl: 0,
          profileImage: "default",
        });
        return { success: true, userId: userId };
      } else {
        return { success: false, error: 4, text: "Missing Data" };
      }
    }
  },
  getPerms: async function (db, Key) {
    var a = await key.getKey(db, Key);
    if (a.success) {
      var result = {};
      var user = (
        await db
          .collection("user")
          .find({ userId: a.userId })
          .project({ lvl: 1, _id: 0 })
          .toArray()
      )[0];
      for (var i in perm.perm) {
        if (perm.perm[i][user.lvl]) {
          result[i] = true;
        }
      }
      return { success: true, perms: result };
    } else {
      return a;
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
};

module.exports = auth;
