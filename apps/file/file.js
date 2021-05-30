const express = require("express");
var fileModule = require("./fileModule");
fileModule = new fileModule();

const router = express.Router();

global.file.addStatic("", "fileEmbed");

router.post("/upload", async (req, res) => {
  res
    .status(200)
    .send(
      await fileModule.uploadFile(
        req.app.locals.db,
        req.body.key,
        req.body.channelId
      )
    );
});

module.exports = router;
