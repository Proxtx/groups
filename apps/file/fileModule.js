var channelModule = require("../channel/channelModule");
channelModule = new channelModule();
var file = require("../../modules/file");
file = new file();

class fileModule {
  uploadFile = async function (db, Key, channelId) {
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
      });
      return { success: true, permKey: upload.permKey };
    } else {
      return channelOwn;
    }
  };
}

module.exports = fileModule;
