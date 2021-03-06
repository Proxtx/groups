const express = require("express");
const fileUpload = require("express-fileupload");
const path = require("path");
const fs = require("fs");

const router = express.Router();

router.use(
  fileUpload({
    createParentPath: true,
  })
);

var file = require("../modules/file");

router.post("/upload/:key", async (req, res) => {
  var web = req.files.web;
  res
    .status(200)
    .send(await file.saveFile(req.app.locals.db, web, req.params.key));
});

router.get("/get/:id", async (req, res) => {
  var p = path.resolve(
    __dirname +
      "/../" +
      (await file.getFile(req.app.locals.db, req.params.id)).path
  );

  await fs.stat(p, async (e) => {
    if (e != null) {
      res.sendFile(
        path.resolve(
          __dirname +
            "/../" +
            (await file.getFile(req.app.locals.db, "default")).path
        )
      );
    } else {
      res.sendFile(p);
    }
  });
});

module.exports = router;
