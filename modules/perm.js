var perm = {
  get: async function (db, id, perm, userId) {
    var result = await db
      .collection("perms")
      .find({ id: id, perm: perm, userId: userId })
      .project({ state: 1 })
      .toArray();
    if (result.length > 0) return result[0].state;
    else return false;
  },
  set: async function (db, id, perm, userId, state) {
    if (
      (
        await db
          .collection("perms")
          .updateOne(
            { id: id, perm: perm, userId: userId },
            { $set: { state: state } }
          )
      ).result.n < 1
    ) {
      await db
        .collection("perms")
        .insertOne({ id: id, perm: perm, userId: userId, state: state });
    }
    return { success: true };
  },
  delete: async function (db, id, perm, userId) {
    await db
      .collection("perms")
      .deleteMany({ id: id, perm: perm, userId: userId });
    return { success: true };
  },
  deleteById: async function (db, id) {
    await db.collection("perms").deleteMany({ id: id });
    return { success: true };
  },
};

module.exports = perm;
