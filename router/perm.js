const express = require("express");

var perm = require("../modules/perm");

const router = express.Router();

router.post("/get", async (req, res) => {
  res
    .status(200)
    .send({
      success: true,
      state: await perm.get(
        req.app.locals.db,
        req.body.id,
        req.body.perm,
        req.body.userId
      ),
    });
});

module.exports = router;
