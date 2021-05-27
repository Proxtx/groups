const express = require("express");
var chatModule = require("./chatModule");
chatModule = new chatModule();

const router = express.Router();

global.chat.addStatic("chatEmbed", "chat");

router.post("/sendMessage", async (req, res) => {
  res
    .status(200)
    .send(
      await chatModule.sendMessage(
        req.app.locals.db,
        req.body.key,
        req.body.text,
        req.body.channelId
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
        req.body.channelId,
        req.body.start,
        req.body.amount
      )
    );
});

module.exports = router;
