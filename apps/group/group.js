const express = require("express");
var groupModule = require("./groupModule");
groupModule = new groupModule();

const router = express.Router();

global.group.addStatic("", "groupTestScreen");

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

module.exports = router;
