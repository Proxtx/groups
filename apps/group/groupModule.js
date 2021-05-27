var genString = require("../../modules/genString");
genString = new genString();
var key = require("../../modules/key");
key = new key();

class groupModule {
  initGroup = async function (db, users, title, Key) {
    var auth = await key.getKey(db, Key);
    if (auth.success) {
      for (var i in users) {
        if (users[i] == auth.userId) {
          var groupId = await genString.returnString(
            db,
            "chats",
            {},
            "groupId"
          );
          await db.collection("groups").insertOne({
            title: title,
            users: users,
            groupId: groupId,
            time: Date.now(),
            img: "default",
          });
          return { success: true, groupId: groupId };
        }
      }
      return { success: false, code: 2 };
    } else {
      return auth;
    }
  };
  getGroupInfo = async function (db, Key, groupId) {
    var groupOwn = await this.groupOwn(db, Key, groupId);
    if (groupOwn.success) {
      return {
        success: true,
        chat: (
          await db
            .collection("groups")
            .find({ groupId: groupId })
            .project({ _id: 0, title: 1, users: 1, img: 1, time: 1 })
            .toArray()
        )[0],
      };
    } else {
      return groupOwn;
    }
  };

  setGroupTitle = async function (db, Key, groupId, title) {
    var groupOwn = await this.groupOwn(db, Key, groupId);
    if (groupOwn.success) {
      await db
        .collection("groups")
        .updateOne({ groupId: groupId }, { $set: { title: title } });
      return { success: true };
    } else {
      return groupOwn;
    }
  };

  leaveGroup = async function (db, Key, groupId, userId) {
    var groupOwn = await this.groupOwn(db, Key, groupId);
    if (groupOwn.success) {
      if (groupOwn.auth.userId == userId) {
        await db
          .collection("groups")
          .updateOne({ groupId: groupId }, { $pull: { users: userId } });
        return { success: true };
      } else {
        return { success: false, error: 2 };
      }
    } else {
      return groupOwn;
    }
  };

  addMember = async function (db, Key, groupId, users) {
    var groupOwn = await this.groupOwn(db, Key, groupId);
    if (groupOwn.success) {
      var add = [];
      for (var i in users) {
        if (
          (await db.collection("user").find({ userId: users[i] }).count()) >
            0 &&
          !(
            (
              await db
                .collection("groups")
                .find({ groupId: groupId, users: users[i] })
            ).count < 0
          )
        ) {
          add.push(users[i]);
        } else {
          return { success: false, error: 6 };
        }
      }
      await db
        .collection("groups")
        .updateOne({ groupId: groupId }, { $push: { users: { $each: add } } });
      return { success: true };
    } else {
      return groupOwn;
    }
  };

  groupOwn = async function (db, Key, groupId) {
    var auth = await key.getKey(db, Key);
    if (auth.success) {
      var chat = await db
        .collection("groups")
        .find({ groupId: groupId, users: auth.userId });
      if ((await chat.count()) > 0) {
        return { success: true, auth: auth };
      } else {
        return { success: false, error: 6 };
      }
    } else {
      return auth;
    }
  };
}

module.exports = groupModule;
