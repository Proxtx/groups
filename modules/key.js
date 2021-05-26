var genString = require("./genString");
genString = new genString();

class key {
  genKey = async function (db, userId) {
    var string = await genString.returnString(db, "keys", {}, "key");
    await db.collection("keys").insertOne({ key: string, userId: userId });
    return string;
  };
  getKey = async function (db, key) {
    var result = await db.collection("keys").find({ key: key }).toArray();
    if (result.length > 0) {
      var user = await db
        .collection("user")
        .find({ userId: result[0].userId })
        .toArray();
      if (user[0].verifyMail && user[0].verifyTel) {
        return {
          success: true,
          userId: user[0].userId,
          email: user[0].email,
        };
      } else {
        return { success: false, error: 3, text: "Verify error" };
      }
    } else {
      return { success: false, error: 1 };
    }
  };
}

module.exports = key;