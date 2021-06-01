var fs = require("fs");
var genString = require("./genString");

const path = "files/files/";
const defaultFile = "default";

var file = {
  createUploadPerm: async function (db, path, name, fileTypeId) {
    var fileId = await genString.returnString(db, "files", {}, fileId);

    var permKey = await genString.returnString(
      db,
      "fileUploadAccess",
      {},
      permKey
    );
    await db.collection("fileUploadAccess").insertOne({
      path: path,
      name: name,
      permKey: permKey,
      time: Date.now() + 1 * 60 * 1000,
      fileId: fileId,
      fileTypeId: fileTypeId,
    });

    return { success: true, permKey: permKey, fileId: fileId };
  },

  saveFile: async function (db, file, permKey) {
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
  },

  getFile: async function (db, fileId) {
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
  },

  deleteFile: async function (db, fileTypeId, isFileId = false) {
    var result;
    if (isFileId) {
      result = await db
        .collection("files")
        .find({ fileId: fileTypeId })
        .toArray();
    } else {
      result = await db
        .collection("files")
        .find({ fileTypeId: fileTypeId })
        .toArray();
    }
    if (result.length > 0) {
      try {
        result = result[0];
        await fs.unlinkSync(path + result.path);
        await db
          .collection("files")
          .deleteMany({ fileTypeId: result.fileTypeId });
        return { success: true };
      } catch (e) {
        return { success: false, error: 6 };
      }
    } else {
      return { success: false, error: 6 };
    }
  },

  deleteOldPerms: async function (db) {
    await db
      .collection("fileUploadAccess")
      .deleteMany({ time: { $lt: Date.now() } });
  },
};

module.exports = file;
