var key = require("./key");
var key = new key();
var image = require("./image");
image = new image();

class settings {
  changeProfilePicture = async function (db, Key) {
    var auth = await key.getKey(db, Key);
    if (key.getKey) {
      var upload = await image.createUploadPerm(
        db,
        "user/" + auth.userId,
        "profilePicture",
        "user." + auth.userId + ".profilePicture"
      );
      await db
        .collection("user")
        .updateOne(
          { userId: auth.userId },
          { $set: { profileImage: upload.imageId } }
        );
      return { success: true, permKey: upload.permKey };
    } else {
      return auth;
    }
  };
}

module.exports = settings;
