const express = require("express");
const mainModule = require("./mainModule");

const router = express.Router();

global.main.addStatic("", "main");

router.post("/addApp", async (req, res) => {
  res
    .status(200)
    .send(
      await mainModule.addApp(req.app.locals.db, req.body.key, req.body.app)
    );
});

router.post("/deleteApp", async (req, res) => {
  res
    .status(200)
    .send(
      await mainModule.deleteApp(req.app.locals.db, req.body.key, req.body.app)
    );
});

router.get("/appImg/:app", async (req, res) => {
  if (global[req.params.app] && global[req.params.app].img)
    res.status(200).sendFile(global[req.params.app].img);
  else res.status(200).sendFile("../files/files/default/x.jpg");
});

router.post("/listApps", async (req, res) => {
  res
    .status(200)
    .send(await mainModule.listApps(req.app.locals.db, req.body.key));
});

module.exports = router;
