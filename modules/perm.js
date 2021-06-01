const fs = require("fs");

var perm = {
  perm: {},
  init: async function () {
    this.perm = JSON.parse(await fs.readFileSync("perm.json", "utf-8"));
  },

  get: function (type, lvl) {
    if (this.perm[type][lvl]) {
      return true;
    } else {
      return false;
    }
  },
};

module.exports = perm;
