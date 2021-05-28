var fs = require("fs");

const path = "files/files/";
const defaultFile = "default";

class file {
  createUploadPerm = async function (db, path, name, fileTypeId) {
    var success = false;
    var fileId = "";
    while (!success) {
      fileId = this.genKeyString(15);
      var result = await db.collection("files").find({ fileId: fileId });
      if ((await result.count()) < 1) {
        success = true;
      }
    }

    success = false;
    var permKey = "";
    while (!success) {
      permKey = this.genKeyString(10);
      var result = await db
        .collection("fileUploadAccess")
        .find({ permKey: permKey });
      if ((await result.count()) < 1) {
        success = true;
      }
    }
    await db.collection("fileUploadAccess").insertOne({
      path: path,
      name: name,
      permKey: permKey,
      time: Date.now() + 1 * 60 * 1000,
      fileId: fileId,
      fileTypeId: fileTypeId,
    });

    return { success: true, permKey: permKey, fileId: fileId };
  };

  saveFile = async function (db, file, permKey) {
    await this.deleteOldPerms(db);
    var data = await db
      .collection("fileUploadAccess")
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
        .collection("files")
        .deleteMany({ fileTypeId: data[0].fileTypeId });
      await db.collection("files").insertOne({
        path: filePath,
        fileId: data[0].fileId,
        fileTypeId: data[0].fileTypeId,
      });
      await db
        .collection("fileUploadAccess")
        .deleteMany({ fileTypeId: data[0].fileTypeId });
      return { success: true };
    } else {
      return { success: false, code: 6 };
    }
  };

  getFile = async function (db, fileId) {
    var result = await db
      .collection("files")
      .find({ fileId: fileId })
      .toArray();
    if (result.length > 0) {
      return { success: true, path: path + result[0].path, found: true };
    } else {
      if (fileId == defaultFile) {
        console.log(
          "Error: The Default file coun't be located in the database. Please enter the 'files' collection and add the missing database entry. This entry can be found at doc.md."
        );
        return { success: false, error: 6 };
      }
      return await this.getFile(db, defaultFile);
    }
  };

  deleteFile = async function (db, fileTypeId) {
    var result = await db
      .collection("files")
      .find({ fileTypeId: fileTypeId })
      .toArray();
    if (result.length > 0) {
      try {
        await fs.unlink(result.path);
        await db.collection("files").deleteMany({ fileTypeId: fileTypeId });
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
      .collection("fileUploadAccess")
      .deleteMany({ time: { $lt: Date.now() } });
  };
}

module.exports = file;
