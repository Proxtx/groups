//.......................................................................................................................
//......AAAAAAA......UUUUU......UUUU...TTTTTTTTTTTTTT.HHHH......HHHH..........LLLL.......VVVVV.......VVVVV.LLLL..........
//......AAAAAAA......UUUUU......UUUU...TTTTTTTTTTTTTT.HHHH......HHHH..........LLLL.......VVVVV......VVVVVV.LLLL..........
//.....AAAAAAAA......UUUUU......UUUU...TTTTTTTTTTTTTT.HHHH......HHHH..........LLLL.......VVVVVV.....VVVVV..LLLL..........
//.....AAAAAAAAA.....UUUUU......UUUU........TTTT......HHHH......HHHH..........LLLL........VVVVV.....VVVVV..LLLL..........
//.....AAAAAAAAA.....UUUUU......UUUU........TTTT......HHHH......HHHH..........LLLL........VVVVV....VVVVVV..LLLL..........
//....AAAAAAAAAAA....UUUUU......UUUU........TTTT......HHHH......HHHH..........LLLL........VVVVVV...VVVVV...LLLL..........
//....AAAAA.AAAAA....UUUUU......UUUU........TTTT......HHHH......HHHH..........LLLL.........VVVVV...VVVVV...LLLL..........
//...AAAAAA.AAAAA....UUUUU......UUUU........TTTT......HHHHHHHHHHHHHH..........LLLL.........VVVVV..VVVVVV...LLLL..........
//...AAAAA..AAAAAA...UUUUU......UUUU........TTTT......HHHHHHHHHHHHHH..........LLLL.........VVVVVV.VVVVV....LLLL..........
//...AAAAA...AAAAA...UUUUU......UUUU........TTTT......HHHHHHHHHHHHHH..........LLLL..........VVVVV.VVVVV....LLLL..........
//..AAAAAAAAAAAAAA...UUUUU......UUUU........TTTT......HHHH......HHHH..........LLLL..........VVVVVVVVVV.....LLLL..........
//..AAAAAAAAAAAAAAA..UUUUU.....UUUUU........TTTT......HHHH......HHHH..........LLLL..........VVVVVVVVVV.....LLLL..........
//..AAAAAAAAAAAAAAA..UUUUUU....UUUUU........TTTT......HHHH......HHHH..........LLLL...........VVVVVVVVV.....LLLL..........
//.AAAAAA.....AAAAAA..UUUUUUUUUUUUUU........TTTT......HHHH......HHHH..........LLLL...........VVVVVVVV......LLLL..........
//.AAAAA......AAAAAA..UUUUUUUUUUUUUU........TTTT......HHHH......HHHH..........LLLLLLLLLLLLL..VVVVVVVV......LLLLLLLLLLLL..
//.AAAAA.......AAAAA...UUUUUUUUUUUU.........TTTT......HHHH......HHHH..........LLLLLLLLLLLLL...VVVVVVV......LLLLLLLLLLLL..
//.AAAAA.......AAAAAA...UUUUUUUUUU..........TTTT......HHHH......HHHH..........LLLLLLLLLLLLL...VVVVVV.......LLLLLLLLLLLL..
//.......................................................................................................................

var auth = require("./auth");
var key = require("./key");

key = new key();
auth = new auth();

var authlvl = {
  email: {
    lvl: 2,
  },
  username: {
    lvl: 0,
  },
  password: {
    lvl: 5,
  },
  tel: {
    lvl: 3,
  },
  verifyTel: {
    lvl: 2,
  },
  verifyMail: {
    lvl: 2,
  },
  lvl: {
    lvl: 2,
  },
  profileImage: {
    lvl: 0,
  },
  userId: {
    lvl: 0,
  },
};

class profile {
  getData = async function (
    db,
    data,
    userKey,
    userId,
    email,
    pwd,
    sysAuth,
    fullAuth = false
  ) {
    if (authlvl[data]) {
      if ((authlvl[data].lvl == 0 || fullAuth) && (userId || email)) {
        if (userId) return await fetchDataUserId(db, data, userId);
        if (email) return await fetchDataEmail(db, data, email);
      } else if (authlvl[data].lvl <= 2 && userKey) {
        var result = await key.getKey(db, userKey);
        if (result.success) {
          return await fetchDataKey(db, data, userKey);
        } else {
          return result;
        }
      } else if (authlvl[data].lvl <= 3 && userId && pwd) {
        var account = await auth.getEmail(db, userId);
        if (account.success) {
          var result = await auth.signin(db, account.email, pwd);
          if (result.success) {
            return await fetchDataUserKey(db, data, email);
          } else {
            return result;
          }
        } else {
          return account;
        }
      } else if (authlvl[data].lvl <= 4 && sysAuth) {
        return await fetchDataUserKey(db, data, email);
      } else {
        return { success: false, text: "PERMISSION ERROR", error: 2 };
      }
    } else {
      return { success: false, text: "DATA NOT FOUND", error: 6 };
    }
  };
}

fetchDataKey = async function (db, data, userKey) {
  return await fetchDataUserId(
    db,
    data,
    (
      await key.getKey(db, userKey)
    ).userId
  );
};
fetchDataUserId = async function (db, data, userId) {
  var result = await db.collection("user").find({ userId: userId }).toArray();
  if (result.length > 0) {
    return { success: true, data: result[0][data] };
  } else {
    return { success: false, error: 6 };
  }
};
fetchDataEmail = async function (db, data, email) {
  var result = await db.collection("user").find({ email: email }).toArray();
  if (result.length > 0) {
    return { success: true, data: result[0][data] };
  } else {
    return { success: false, error: 6 };
  }
};

module.exports = profile;
