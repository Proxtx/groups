const express = require("express");

const router = express.Router();

var settings = require("../modules/settings");

settings = new settings();

router.post("/changeProfilePicture", async (req, res) => {
  res
    .status(200)
    .send(await settings.changeProfilePicture(req.app.locals.db, req.body.key));
});

module.exports = router;
