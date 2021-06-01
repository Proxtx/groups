var channelModule = require("../channel/channelModule");
var file = require("../../modules/file");

var fileModule = {
  uploadFile: async function (db, Key, channelId, fileName) {
    var channelOwn = await channelModule.channelOwn(db, Key, channelId);
    if (channelOwn.success) {
      var randomFileNumber = Math.floor(Math.random() * 100000);
      var fileTypeId =
        "channel." + channelId + ".channelFile." + randomFileNumber;
      var upload = await file.createUploadPerm(
        db,
        "channelFiles/" + channelId,
        "channelFile" + randomFileNumber,
        fileTypeId
      );
      await db.collection("channelFiles").insertOne({
        channelId: channelId,
        fileId: upload.fileId,
        fileTypeId: fileTypeId,
        fileName: fileName,
        time: Date.now(),
      });
      return { success: true, permKey: upload.permKey };
    } else {
      return channelOwn;
    }
  },

  listFiles: async function (db, Key, channelId) {
    var channelOwn = await channelModule.channelOwn(db, Key, channelId);
    if (channelOwn.success) {
      return {
        success: true,
        files: await db
          .collection("channelFiles")
          .find({ channelId: channelId })
          .sort({ time: -1 })
          .project({ fileName: 1, fileId: 1, time: 1 })
          .toArray(),
      };
    } else {
      return channelOwn;
    }
  },

  deleteFile: async function (db, Key, channelId, fileId) {
    var channelOwn = await channelModule.channelOwn(db, Key, channelId);
    if (channelOwn.success) {
      await db.collection("channelFiles").deleteMany({ fileId: fileId });
      return { success: true };
    } else {
      return channelOwn;
    }
  },
};

module.exports = fileModule;
