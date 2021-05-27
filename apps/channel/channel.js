const express = require("express");
var channelModule = require("./channelModule");
channelModule = new channelModule();

const router = express.Router();

global.channel.addStatic("", "channelViewer");
global.channel.addStatic("testTab", "testTab");

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

router.post("/leaveChannel", async (req, res) => {
  res
    .status(200)
    .send(
      await channelModule.leaveChannel(
        req.app.locals.db,
        req.body.key,
        req.body.channelId,
        req.body.userId
      )
    );
});

router.post("/addMember", async (req, res) => {
  res
    .status(200)
    .send(
      await channelModule.addMember(
        req.app.locals.db,
        req.body.key,
        req.body.channelId,
        req.body.users
      )
    );
});

module.exports = router;
