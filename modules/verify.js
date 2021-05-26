var key = require("./key");
var profile = require("./profile");
const nodemailer = require("nodemailer");

key = new key();
profile = new profile();

var transporter = nodemailer.createTransport({
  host: "mail.web.de",
  port: 587,
  auth: {
    user: "email@email.email",
    pass: "email",
  },
  tls: {
    rejectUnauthorized: false,
  },
  rateDelta: 3000,
  rateLimit: 1,
});

class verify {
  getVerify = async function (db, Key) {
    var result = await key.getKey(db, Key);
    if (result.error == 3) {
      var user = (
        await db
          .collection("user")
          .find({
            userId: (
              await db.collection("keys").find({ key: Key }).toArray()
            )[0].userId,
          })
          .toArray()
      )[0];
      if (!user.verifyMail && !user.verifyTel) {
        return { success: true, verify: 3 };
      } else if (!user.verifyMail) {
        return { success: true, verify: 2 };
      } else if (!user.verifyTel) {
        return { success: true, verify: 1 };
      } else {
        return { success: true, verify: 0 };
      }
    } else {
      if (!result.success) {
        return result;
      } else {
        return { success: true, verify: 0 };
      }
    }
  };
  genEmail = async function (db, key) {
    var cv = await this.getVerify(db, key);
    if (cv.success && cv.verify != 0 && cv.verify != 1) {
      var user = (
        await db
          .collection("user")
          .find({
            userId: (
              await db.collection("keys").find({ key: key }).toArray()
            )[0].userId,
          })
          .toArray()
      )[0];
      var code = await this.genEmailCode(db, key);
      if (!code.success) {
        return code;
      }
      var mailOptions = {
        from: "Email@email.email",
        to: user.email,
        subject: "Verification",
        text: "Please enter the code below.\n" + code.code,
      };
      var result;
      try {
        await transporter.sendMail(mailOptions);
        result = {
          success: true,
        };
      } catch (e) {
        result = { success: false, error: 6 };
      }
      return result;
    } else {
      return { success: false, error: 3 };
    }
  };
  verifyEmail = async function (db, key, code) {
    await this.deleteOldCodes(db);
    var cv = await this.getVerify(db, key);
    if (cv.success) {
      var user = (
        await db
          .collection("user")
          .find({
            userId: (
              await db.collection("keys").find({ key: key }).toArray()
            )[0].userId,
          })
          .toArray()
      )[0];
      var result = await db
        .collection("verEmailCodes")
        .find({ code: code, userId: user.userId })
        .toArray();
      if (result.length > 0) {
        await db
          .collection("user")
          .updateOne({ userId: user.userId }, { $set: { verifyMail: true } });
        await db.collection("verEmailCodes").deleteOne({ code: code });
        return { success: true };
      } else {
        return { success: false, error: 3 };
      }
    } else {
      return cv;
    }
  };
  genEmailCode = async function (db, key) {
    var cv = await this.getVerify(db, key);
    if (cv.success) {
      var success = false;
      var code = "";
      while (!success) {
        code = this.genCode(5);
        var result = await db
          .collection("verEmailCodes")
          .find({ code: code })
          .toArray();
        if (result.length < 1) {
          success = true;
        }
      }
      var user = (
        await db
          .collection("user")
          .find({
            userId: (
              await db.collection("keys").find({ key: key }).toArray()
            )[0].userId,
          })
          .toArray()
      )[0];
      await db.collection("verEmailCodes").insertOne({
        userId: user.userId,
        code: code,
        time: Date.now() + 5 * 60 * 1000,
      });
      return { success: true, code: code };
    } else {
      return cv;
    }
  };
  genCode = function (count) {
    var code = "";
    for (var i = 0; i < count; i++) {
      code += random(0, 9) + "";
    }
    return code;
  };
  deleteOldCodes = async function (db) {
    await db
      .collection("verEmailCodes")
      .deleteMany({ time: { $lt: Date.now() } });
  };
}

function random(min, max) {
  return Math.floor(Math.random() * (max + 1 - min)) + min;
}

module.exports = verify;
