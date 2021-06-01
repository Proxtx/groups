const express = require("express");
var groupModule = require("./groupModule");

const router = express.Router();

global.group.addStatic("", "groupTestScreen");
global.group.addStatic("groupEmbed", "groupViewer");

router.post("/initGroup", async (req, res) => {
  res
    .status(200)
    .send(
      await groupModule.initGroup(
        req.app.locals.db,
        req.body.users,
        req.body.title,
        req.body.key
      )
    );
});

router.post("/leaveGroup", async (req, res) => {
  res
    .status(200)
    .send(
      await groupModule.leaveGroup(
        req.app.locals.db,
        req.body.key,
        req.body.groupId,
        req.body.userId
      )
    );
});

router.post("/addMember", async (req, res) => {
  res
    .status(200)
    .send(
      await groupModule.addMember(
        req.app.locals.db,
        req.body.key,
        req.body.groupId,
        req.body.users
      )
    );
});

router.post("/info", async (req, res) => {
  res
    .status(200)
    .send(
      await groupModule.groupInfo(
        req.app.locals.db,
        req.body.key,
        req.body.groupId
      )
    );
});

router.post("/addChannel", async (req, res) => {
  res
    .status(200)
    .send(
      await groupModule.addChannel(
        req.app.locals.db,
        req.body.key,
        req.body.groupId,
        req.body.title
      )
    );
});

module.exports = router;
