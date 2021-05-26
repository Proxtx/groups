const express = require("express");
var chatModule = require("./chatModule");
chatModule = new chatModule();

const router = express.Router();

global.chat.addStatic("", "public");
global.chat.addStatic("embed", "chat");

router.post("/initChat", async (req, res) => {
  res
    .status(200)
    .send(
      await chatModule.initChat(
        req.app.locals.db,
        req.body.users,
        req.body.title,
        req.body.key
      )
    );
});

router.post("/sendMessage", async (req, res) => {
  res
    .status(200)
    .send(
      await chatModule.sendMessage(
        req.app.locals.db,
        req.body.key,
        req.body.text,
        req.body.chatId
      )
    );
});

router.post("/getMessages", async (req, res) => {
  res
    .status(200)
    .send(
      await chatModule.getMessages(
        req.app.locals.db,
        req.body.key,
        req.body.chatId,
        req.body.start,
        req.body.amount
      )
    );
});

module.exports = router;
