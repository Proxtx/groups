const express = require("express");
var auth = require("../modules/auth");
var key = require("../modules/key");

const router = express.Router();

router.post("/signin", async (req, res) => {
  var result = await auth.signin(
    req.app.locals.db,
    req.body.email,
    req.body.password
  );
  if (result.success || result.error == 3) {
    res.status(200).send({
      success: true,
      key: await key.genKey(req.app.locals.db, result.userId),
    });
  } else {
    res.status(200).send(result);
  }
});

router.post("/register", async (req, res) => {
  var result = await auth.register(
    req.app.locals.db,
    req.body.email,
    req.body.password,
    req.body.username,
    req.body.tel
  );

  if (result.success) {
    res.status(200).send({
      success: true,
      key: await key.genKey(req.app.locals.db, result.userId),
    });
  } else {
    res.status(200).send(result);
  }
});

router.post("/key", async (req, res) => {
  res.status(200).send(await key.getKey(req.app.locals.db, req.body.key));
});

router.post("/getPerms", async (req, res) => {
  res.status(200).send(await auth.getPerms(req.app.locals.db, req.body.key));
});

module.exports = router;
