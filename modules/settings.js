var key = require("./key");
var file = require("./file");

var settings = {
  changeProfilePicture: async function (db, Key) {
    var auth = await key.getKey(db, Key);
    if (key.getKey) {
      var upload = await file.createUploadPerm(
        db,
        "user/" + auth.userId,
        "profilePicture",
        "user." + auth.userId + ".profilePicture"
      );
      await db
        .collection("user")
        .updateOne(
          { userId: auth.userId },
          { $set: { profileImage: upload.fileId } }
        );
      return { success: true, permKey: upload.permKey };
    } else {
      return auth;
    }
  },
};

module.exports = settings;
