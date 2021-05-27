const express = require("express");
var groupModule = require("./groupModule");
groupModule = new groupModule();

const router = express.Router();

global.group.addStatic("", "groupViewer");
global.group.addStatic("testTab", "testTab");

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

router.post("/getGroupInfo", async (req, res) => {
  res
    .status(200)
    .send(
      await groupModule.getGroupInfo(
        req.app.locals.db,
        req.body.key,
        req.body.groupId
      )
    );
});

router.post("/setGroupTitle", async (req, res) => {
  res
    .status(200)
    .send(
      await groupModule.setGroupTitle(
        req.app.locals.db,
        req.body.key,
        req.body.groupId,
        req.body.title
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

module.exports = router;
