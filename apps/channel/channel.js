const express = require("express");
var channelModule = require("./channelModule");

const router = express.Router();

global.channel.addStatic("", "channelViewer");
global.channel.addStatic("mainApp", "mainApp");

router.post("/initChannel", async (req, res) => {
  res
    .status(200)
    .send(
      await channelModule.initChannel(
        req.app.locals.db,
        req.body.users,
        req.body.title,
        req.body.key
      )
    );
});

router.post("/getChannelInfo", async (req, res) => {
  res
    .status(200)
    .send(
      await channelModule.getChannelInfo(
        req.app.locals.db,
        req.body.key,
        req.body.channelId
      )
    );
});

router.post("/setChannelTitle", async (req, res) => {
  res
    .status(200)
    .send(
      await channelModule.setChannelTitle(
        req.app.locals.db,
        req.body.key,
        req.body.channelId,
        req.body.title
      )
    );
});

router.post("/addApp", async (req, res) => {
  res
    .status(200)
    .send(
      await channelModule.addApp(
        req.app.locals.db,
        req.body.key,
        req.body.channelId,
        req.body.app
      )
    );
});

router.post("/deleteApp", async (req, res) => {
  res
    .status(200)
    .send(
      await channelModule.deleteApp(
        req.app.locals.db,
        req.body.key,
        req.body.channelId,
        req.body.app
      )
    );
});

module.exports = router;
