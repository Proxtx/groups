const express = require("express");
const router = express.Router();

var adminModule = require("./adminModule");

global.admin.addStatic("mainApp", "mainApp");

router.post("/getPerms", async (req, res) => {
  res
    .status(200)
    .send(await adminModule.getPerms(req.app.locals.db, req.body.key));
});

router.post("/listUsers", async (req, res) => {
  res
    .status(200)
    .send(
      await adminModule.listUsers(
        req.app.locals.db,
        req.body.key,
        req.body.start,
        req.body.amount
      )
    );
});

module.exports = router;
