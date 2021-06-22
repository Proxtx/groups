const express = require("express");
var config = require("./modules/config");
var MongoClient = require("mongodb").MongoClient;

const app = express();

const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server);

app.use("/main/app", express.static("files/page/app"));
app.use("/main/page", express.static("files/page/page"));
app.use("/main/static", express.static("files/page/static"));
app.use(express.json());

app.use(function (err, req, res, next) {
  console.error("Error");
  res.status(200).send({ success: false, error: 7 });
});

/*process.on("unhandledRejection", function (reason, p) {
  console.log("Unhandled Rejection:", reason.stack);
});*/

const auth = require("./router/auth");
const profile = require("./router/profile");
const verify = require("./router/verify");
const file = require("./router/file");
const settings = require("./router/settings");
const perm = require("./router/perm");

var apps = require("./modules/apps");
var socketHandler = require("./modules/socketHandler");

app.use("/main/auth", auth);
app.use("/main/profile", profile);
app.use("/main/verify", verify);
app.use("/main/file", file);
app.use("/main/settings", settings);
app.use("/main/perm", perm);

async function main() {
  console.log("Loading config...");
  config = await config.getConfig();
  console.log("Connecting to Cluster...");
  MongoClient.connect(
    config.clusterUrl,
    { useNewUrlParser: true, useUnifiedTopology: true },
    async function (err, client) {
      if (err) {
        throw err;
      }
      console.log("Connected to Cluster!");
      console.log("Selecting Database!");
      var db = client.db(config.database);
      app.locals.db = db;
      console.log("Loading Apps...");
      await apps.loadApps(app, express);
      console.log("All Apps loaded...");
      console.log("Starting Socket Handler");
      socketHandler.init(app.locals.db, io);
      global.socketHandler = socketHandler;
      console.log("Starting Server...");
      server.listen(config.host);
      console.log("\x1b[41m\x1b[37m\x1b[4m\x1b[5m\x1b[1m", "Server Started");
      console.log("\x1b[0m", "");
      if (config.setup) {
        console.log("Setup detected! Please only run this ONCE!");
        console.log("Creating default file... ");
        await db.collection("files").updateOne(
          { fileId: "default" },
          {
            $set: {
              path: "default/x.jpg",
              fileTypeId: "default",
            },
          },
          {
            upsert: true,
          }
        );

        console.log("Creating admin account... ");
        var authModule = require("./modules/auth");
        var userId = (
          await authModule.register(db, "admin", "admin", "admin", "000000000")
        ).userId;

        console.log("Adding admin perms... ");
        var perm = require("./modules/perm");
        await perm.set(db, { system: true }, "admin", userId, true);

        console.log(
          "Setup finished! Please set setup to false in config.json!"
        );
      }
    }
  );
}
main();
