const fs = require("fs");
const path = require("path");

var apps = {
  apps,
  loadApp: async function (app, express, appName) {
    console.log("Loading App: " + appName);
    global[appName] = {};
    global[appName].name = appName;
    if (this.apps[appName].img) {
      global[appName].img = path.resolve(
        __dirname + "/../apps/" + appName + "/" + this.apps[appName].img
      );
    }
    global[appName].addStatic = function (path, filePath) {
      app.use(
        "/main/apps/" + this.name + "/" + path,
        express.static("apps/" + this.name + "/" + filePath)
      );
    };
    app.use(
      "/main/apps/" + appName,
      require("../apps/" + appName + "/" + this.apps[appName].entry)
    );
    console.log("Loaded " + appName + " Succesfully");
  },

  loadApps: async function (app, express) {
    global.apps = {};
    this.apps = JSON.parse(fs.readFileSync("apps.json", "utf-8"));
    for (var i in this.apps) {
      global.apps[i] = this.apps[i];
      this.loadApp(app, express, i);
    }
  },
};

module.exports = apps;
