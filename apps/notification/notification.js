const express = require("express");
var notificationModule = require("./notificationModule");

const router = express.Router();

global.notification.addStatic("mainApp", "mainApp");

router.post("/listNotifications", async (req, res) => {
  res
    .status(200)
    .send(
      await notificationModule.listNotifications(
        req.app.locals.db,
        req.body.key,
        req.body.start,
        req.body.amount
      )
    );
});

module.exports = router;
