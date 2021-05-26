const fs = require("fs");

class apps {
  apps;
  loadApp = async function (app, express, appName) {
    console.log("Loading App: " + appName);
    global[appName] = {};
    global[appName].name = appName;
    global[appName].addStatic = function (path, filePath) {
      app.use(
        "/apps/" + this.name + "/" + path,
        express.static("apps/" + this.name + "/" + filePath)
      );
    };
    app.use(
      "/apps/" + appName,
      require("../apps/" + appName + "/" + this.apps[appName])
    );
    console.log("Loaded " + appName + " Succesfully");
  };

  loadApps = async function (app, express) {
    this.apps = JSON.parse(fs.readFileSync("apps.json", "utf-8"));
    for (var i in this.apps) {
      this.loadApp(app, express, i);
    }
  };
}

module.exports = apps;
