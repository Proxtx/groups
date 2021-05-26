const fs = require("fs");

class config {
  getConfig = async function () {
    return JSON.parse(await fs.readFileSync("config.json", "utf-8"));
  };
}

module.exports = config;
