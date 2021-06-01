const express = require("express");

const router = express.Router();

var verify = require("../modules/verify");

router.post("/genEmail", async (req, res) => {
  res.status(200).send(await verify.genEmail(req.app.locals.db, req.body.key));
});

router.post("/verifyEmail", async (req, res) => {
  res
    .status(200)
    .send(
      await verify.verifyEmail(req.app.locals.db, req.body.key, req.body.code)
    );
});

router.post("/getStatus", async (req, res) => {
  res.status(200).send(await verify.getVerify(req.app.locals.db, req.body.key));
});

module.exports = router;
