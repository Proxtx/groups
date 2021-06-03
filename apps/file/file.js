const express = require("express");
var fileModule = require("./fileModule");

const router = express.Router();

global.file.addStatic("channelEmbed", "fileEmbed");

router.post("/upload", async (req, res) => {
  res
    .status(200)
    .send(
      await fileModule.uploadFile(
        req.app.locals.db,
        req.body.key,
        req.body.channelId,
        req.body.fileName
      )
    );
});

router.post("/list", async (req, res) => {
  res
    .status(200)
    .send(
      await fileModule.listFiles(
        req.app.locals.db,
        req.body.key,
        req.body.channelId
      )
    );
});

router.post("/delete", async (req, res) => {
  res
    .status(200)
    .send(
      await fileModule.deleteFile(
        req.app.locals.db,
        req.body.key,
        req.body.channelId,
        req.body.fileId
      )
    );
});

module.exports = router;
