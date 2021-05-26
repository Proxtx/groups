var fs = require("fs");

const path = "files/images/";
const defaultImage = "default";

class image {
  createUploadPerm = async function (db, path, name, imageTypeId) {
    var success = false;
    var imageId = "";
    while (!success) {
      imageId = this.genKeyString(15);
      var result = await db.collection("images").find({ imageId: imageId });
      if ((await result.count()) < 1) {
        success = true;
      }
    }

    success = false;
    var permKey = "";
    while (!success) {
      permKey = this.genKeyString(10);
      var result = await db
        .collection("imageUploadAccess")
        .find({ permKey: permKey });
      if ((await result.count()) < 1) {
        success = true;
      }
    }
    await db.collection("imageUploadAccess").insertOne({
      path: path,
      name: name,
      permKey: permKey,
      time: Date.now() + 1 * 60 * 1000,
      imageId: imageId,
      imageTypeId: imageTypeId,
    });

    return { success: true, permKey: permKey, imageId: imageId };
  };

  saveImage = async function (db, file, permKey) {
    await this.deleteOldPerms(db);
    var data = await db
      .collection("imageUploadAccess")
      .find({ permKey: permKey })
      .toArray();
    if (data.length == 1) {
      var filePath =
        data[0].path +
        "/" +
        data[0].name +
        "." +
        file.name.split(".")[file.name.split(".").length - 1];
      await file.mv(path + filePath);
      await db
        .collection("images")
        .deleteMany({ imageTypeId: data[0].imageTypeId });
      await db.collection("images").insertOne({
        path: filePath,
        imageId: data[0].imageId,
        imageTypeId: data[0].imageTypeId,
      });
      await db
        .collection("imageUploadAccess")
        .deleteMany({ imageTypeId: data[0].imageTypeId });
      return { success: true };
    } else {
      return { success: false, code: 6 };
    }
  };

  getImage = async function (db, imageId) {
    var result = await db
      .collection("images")
      .find({ imageId: imageId })
      .toArray();
    if (result.length > 0) {
      return { success: true, path: path + result[0].path, found: true };
    } else {
      if (imageId == defaultImage) {
        console.log(
          "ERROR DEFAULT IMAGE NOT FOUND ; ENTER THE DB AND ADD A ENTRY TO THE IMAGE COLLECTION WITH THE ID: " +
            defaultImage
        );
        return { success: false, error: 6 };
      }
      return await this.getImage(db, defaultImage);
    }
  };

  deleteImage = async function (db, imageTypeId) {
    var result = await db
      .collection("images")
      .find({ imageTypeId: imageTypeId })
      .toArray();
    if (result.length > 0) {
      try {
        await fs.unlink(result.path);
        await db.collection("images").deleteMany({ imageTypeId: imageTypeId });
        return { success: true };
      } catch (e) {
        return { success: false, error: 6 };
      }
    } else {
      return { success: false, error: 6 };
    }
  };

  deleteOldPerms = async function (db) {
    await db
      .collection("imageUploadAccess")
      .deleteMany({ time: { $lt: Date.now() } });
  };

  genKeyString = function (length) {
    var string = "";
    var letters = [
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
      "i",
      "j",
      "k",
      "l",
      "m",
      "n",
      "o",
      "p",
      "q",
      "r",
      "s",
      "t",
      "u",
      "v",
      "w",
      "x",
      "y",
      "z",
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      0,
    ];
    for (var i = 0; i < length; i++) {
      string += letters[random(0, letters.length - 1)];
    }
    return string;
  };
}

function random(min, max) {
  return Math.floor(Math.random() * (max + 1 - min)) + min;
}

module.exports = image;
