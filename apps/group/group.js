const express = require("express");
var groupModule = require("./groupModule");

const router = express.Router();

global.group.addStatic("groupEmbed", "groupViewer");
global.group.addStatic("mainApp", "mainApp");

router.post("/initGroup", async (req, res) => {
  res
    .status(200)
    .send(
      await groupModule.initGroup(
        req.app.locals.db,
        req.body.users,
        req.body.name,
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

router.post("/deleteChannel", async (req, res) => {
  res
    .status(200)
    .send(
      await groupModule.deleteChannel(
        req.app.locals.db,
        req.body.key,
        req.body.groupId,
        req.body.channelId
      )
    );
});

router.post("/addAdmin", async (req, res) => {
  res
    .status(200)
    .send(
      await groupModule.addAdmin(
        req.app.locals.db,
        req.body.key,
        req.body.groupId,
        req.body.userId
      )
    );
});

router.post("/removeAdmin", async (req, res) => {
  res
    .status(200)
    .send(
      await groupModule.removeAdmin(
        req.app.locals.db,
        req.body.key,
        req.body.groupId,
        req.body.userId
      )
    );
});

router.post("/renameGroup", async (req, res) => {
  res
    .status(200)
    .send(
      await groupModule.renameGroup(
        req.app.locals.db,
        req.body.key,
        req.body.groupId,
        req.body.name
      )
    );
});

router.post("/deleteGroup", async (req, res) => {
  res
    .status(200)
    .send(
      await groupModule.deleteGroup(
        req.app.locals.db,
        req.body.key,
        req.body.groupId
      )
    );
});

router.post("/listGroups", async (req, res) => {
  res
    .status(200)
    .send(await groupModule.listGroups(req.app.locals.db, req.body.key));
});

module.exports = router;
