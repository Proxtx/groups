var genString = {
  returnString: async function (db, queryCollection, queryJson, queryJsonKey) {
    var string = "";
    var success = false;
    while (!success) {
      string = this.genString(17);
      var obj = queryJson;
      obj[queryJsonKey] = string;
      var result = await db.collection(queryCollection).find(obj);
      if ((await result.count()) < 1) {
        success = true;
      }
    }
    return string;
  },
  genString: function (length) {
    var string = "";
    var letters = [
      "a",
      "b",
      "c",
      "d",
      "e",
      "f",
      "g",
      "h",
      "i",
      "j",
      "k",
      "l",
      "m",
      "n",
      "o",
      "p",
      "q",
      "r",
      "s",
      "t",
      "u",
      "v",
      "w",
      "x",
      "y",
      "z",
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      0,
    ];
    for (var i = 0; i < length; i++) {
      string += letters[this.random(0, letters.length - 1)];
    }
    return string;
  },

  random: function (min, max) {
    return Math.floor(Math.random() * (max + 1 - min)) + min;
  },
};

module.exports = genString;
