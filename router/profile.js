const express = require("express");

const router = express.Router();

var profile = require("../modules/profile");

profile = new profile();

router.post("/data", async (req, res) => {
  res
    .status(200)
    .send(
      await profile.getData(
        req.app.locals.db,
        req.body.data,
        req.body.key,
        req.body.userId,
        req.body.password
      )
    );
});

module.exports = router;
