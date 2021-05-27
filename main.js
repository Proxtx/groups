const express = require("express");
var config = require("./modules/config");
var MongoClient = require("mongodb").MongoClient;
config = new config();

const app = express();

const http = require("http");
const { Server } = require("socket.io");
const server = http.createServer(app);
const io = new Server(server);

app.use("/app", express.static("files/page/app"));
app.use("/page", express.static("files/page/page"));
app.use("/admin", express.static("files/page/admin"));
app.use("/images", express.static("files/images"));
app.use("/static", express.static("files/page/static"));
app.use(express.json());

const auth = require("./router/auth");
const profile = require("./router/profile");
const verify = require("./router/verify");
const image = require("./router/image");
const settings = require("./router/settings");

var apps = require("./modules/apps");
apps = new apps();
var socketHandler = require("./modules/socketHandler");
socketHandler = new socketHandler();

app.use("/auth", auth);
app.use("/profile", profile);
app.use("/verify", verify);
app.use("/image", image);
app.use("/settings", settings);

async function main() {
  console.log("Loading config...");
  config = await config.getConfig();
  console.log("Connecting to Database...");
  MongoClient.connect(
    "mongodb+srv://" + config.dbUser + ":" + config.dbPwd + "@" + config.dbUrl,
    { useNewUrlParser: true, useUnifiedTopology: true },
    async function (err, client) {
      if (err) {
        throw err;
      }
      console.log("Connected to Database!");
      console.log("Selecting collection!");
      var db = client.db("groups");
      app.locals.db = db;
      console.log("Loading Apps...");
      await apps.loadApps(app, express);
      console.log("All Apps loaded...");
      socketHandler.init(app.locals.db, io);
      global.socketHandler = socketHandler;
      console.log("Started Socket Handler");
      console.log("Starting Server...");
      server.listen(config.host);
      console.log("\x1b[41m\x1b[37m\x1b[4m\x1b[5m\x1b[1m", "Server Started");
      console.log("\x1b[0m", "");
    }
  );
}
main();
