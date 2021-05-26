var userId;
var chatId = "c1fe3cydekwh5q8yi";

var userData = {};

var scv = new scrollview();

function genChatBox(
  image,
  author,
  text,
  showAuthor,
  showProfilePicture,
  smallMargin,
  showRight,
  appendTop
) {
  var box = document.getElementsByClassName("chatBox")[0];
  var boxClone = box.cloneNode(true);
  if (smallMargin) {
    boxClone.style.marginTop = "2.5px";
    boxClone.style.marginBottom = "2.5px";
  } else {
    boxClone.style.marginTop = "5px";
    boxClone.style.marginBottom = "5px";
  }

  var imageE = document.getElementsByClassName("chatBoxProfilePicture")[0];
  var imageClone = imageE.cloneNode(true);
  imageClone.src = image;
  boxClone.appendChild(imageClone);
  if (!showProfilePicture) {
    imageClone.style.visibility = "hidden";
  }
  var content = document.getElementsByClassName("chatBoxContent")[0];
  var contentClone = content.cloneNode(true);
  boxClone.appendChild(contentClone);
  if (showProfilePicture && showRight) {
    var imageE = document.getElementsByClassName("chatBoxProfilePicture")[0];
    var imageClone = imageE.cloneNode(true);
    imageClone.src = image;
    boxClone.appendChild(imageClone);
  }
  if (showAuthor) {
    var authorE = document.getElementsByClassName("chatBoxAuthor")[0];
    var authorClone = authorE.cloneNode(true);
    authorClone.children[0].innerHTML = author;
    contentClone.appendChild(authorClone);
  }
  if (showRight) {
    contentClone.style.float = "right";
    contentClone.style.backgroundColor = "var(--accentColorSlight)";
  }
  var textE = document.getElementsByClassName("chatBoxText")[0];
  var textClone = textE.cloneNode(true);
  textClone.innerHTML = text;
  contentClone.appendChild(textClone);
  if (appendTop) {
    document.getElementById("chat").prepend(boxClone);
  } else {
    document.getElementById("chat").appendChild(boxClone);
  }
  return boxClone;
}

async function addMemberDataToList(userId) {
  userData[userId] = {};
  userData[userId].author = (
    await Fetch("/profile/data", {
      userId: userId,
      data: "username",
    })
  ).data;
  userData[userId].img =
    "/image/get/" +
    (
      await Fetch("/profile/data", {
        userId: userId,
        data: "profileImage",
      })
    ).data;
}

async function main() {
  userId = (
    await Fetch("/auth/key", {
      key: window.localStorage.getItem("key"),
    })
  ).userId;

  var chatInfo = (
    await Fetch("/apps/chat/getChatInfo", {
      key: window.localStorage.getItem("key"),
      chatId: chatId,
    })
  ).chat;

  document.getElementById("chatTitleText").innerHTML = chatInfo.title;
  document.getElementById("chatImage").src = "/image/get/" + chatInfo.img;

  for (var u in chatInfo.users) {
    await addMemberDataToList(chatInfo.users[u]);
  }

  scv.amount = 10;
  scv.initScrollview(
    document.getElementById("chatBg"),
    async function (start, amount) {
      return await Fetch("/apps/chat/getMessages", {
        key: window.localStorage.getItem("key"),
        chatId: chatId,
        start: start,
        amount: amount,
      });
    },
    async function (chat) {
      if (!chat.success) return;
      var msgs = chat.result;
      msgs = genHideAuthor(msgs);
      for (var i in msgs) {
        await makeChatBox(msgs[i]);
      }
    },
    true
  );
}

async function makeChatBox(msg, appendTop = true) {
  var image = "/image/get/default";
  var author = "You are not supposed to see this!";
  var text = msg.message.text;
  var showAuthor = true;
  var showProfilePicture = true;
  var smallMargin = false;
  var showRight = false;
  if (msg.userId == userId) {
    showAuthor = false;
    showProfilePicture = false;
    showRight = true;
  }
  if (msg.hideAuthor) {
    smallMargin = true;
    showProfilePicture = false;
    showAuthor = false;
  }
  if (showProfilePicture && showAuthor) {
    if (!userData[msg.userId]) {
      await addMemberDataToList(msg.userId);
    }
    author = userData[msg.userId].author;
    image = userData[msg.userId].img;
  }
  genChatBox(
    image,
    author,
    text,
    showAuthor,
    showProfilePicture,
    smallMargin,
    showRight,
    appendTop
  );
}

function genHideAuthor(msg) {
  var prevAuthor = 0;
  for (var i = msg.length - 1; i >= 0; i--) {
    if (msg[i].userId == prevAuthor) {
      msg[i].hideAuthor = true;
    }
    prevAuthor = msg[i].userId;
  }
  return msg;
}

var shiftDown = false;

document
  .getElementById("inputMessage")
  .addEventListener("keyup", function (event) {
    if (!shiftDown && event.key == "Enter") {
      sendMessage();
    } else if (event.key == "Shift") {
      shiftDown = false;
    }
  });
document
  .getElementById("inputMessage")
  .addEventListener("keydown", function (e) {
    if (e.key == "Shift") {
      shiftDown = true;
    }
  });

async function sendMessage() {
  await Fetch("/apps/chat/sendMessage", {
    key: window.localStorage.getItem("key"),
    chatId: chatId,
    text: document.getElementById("inputMessage").value,
  });
  document.getElementById("inputMessage").value = "";
}

main();

var changeNameOpen = false;

function initChangeChatName() {
  if (!changeNameOpen) {
    changeNameOpen = true;
    processNodeObj(document.body, [
      {
        name: "uBoxSmall",
        title: "Groupname",
        left: x + "px",
        top: y + "px",
        width: "350px",
        id: "changeNameBox",
        styles: [["zIndex", 2]],
        nodes: [
          {
            name: "uInput",
            id: "changeChatTitleInput",
            value: document.getElementById("chatTitleText").innerHTML,
          },
          { name: "uButtonMain", text: "Save", id: "saveChatTitle" },
          {
            name: "uButtonSecondary",
            text: "Cancel",
            id: "cancelSaveChatTitle",
          },
        ],
      },
    ]);
    document
      .getElementById("saveChatTitle")
      .addEventListener("click", async function (ev) {
        await Fetch("/apps/chat/setChatTitle", {
          chatId: chatId,
          key: window.localStorage.getItem("key"),
          title: document.getElementById("changeChatTitleInput").value,
        });
        document.getElementById("chatTitleText").innerHTML =
          document.getElementById("changeChatTitleInput").value;
        closeRenamePopUpBox();
      });
  }
  document
    .getElementById("cancelSaveChatTitle")
    .addEventListener("click", closeRenamePopUpBox);
}

function closeRenamePopUpBox() {
  document.getElementById("changeNameBox").remove();
  changeNameOpen = false;
}

var showMembersOpen = false;

function initShowMembers() {
  if (!showMembersOpen) {
    showMembersOpen = true;
    var nA = [];
    for (var i in userData) {
      nA.push({
        name: "uUserDisplay",
        author: userData[i].author,
        img: userData[i].img,
      });
    }

    nA.push({
      name: "uButtonMain",
      text: "Close",
      id: "chatMemberClose",
      click: closeMembersPopUpBox,
    });
    nA.push({
      name: "uButtonSecondary",
      text: "Add Member",
      id: "chatMemberAdd",
      click: openAddMember,
    });
    nA.push({
      name: "uButtonSecondary",
      text: "Leave Group",
      id: "chatMemberLeave",
      click: leaveGroup,
    });
    processNodeObj(document.body, [
      {
        name: "uBoxSmall",
        title: "",
        left: x + "px",
        top: "60px",
        id: "chatMemberBox",
        styles: [
          ["zIndex", 2],
          ["right", "0px"],
          ["left", "unset"],
        ],
        nodes: nA,
      },
    ]);
  }
}

function closeMembersPopUpBox() {
  document.getElementById("chatMemberBox").remove();
  showMembersOpen = false;
}

async function leaveGroup() {
  await Fetch("/apps/chat/leaveGroup", {
    chatId: chatId,
    key: window.localStorage.getItem("key"),
    userId: userId,
  });
  closeMembersPopUpBox();
}

var addMemberOpen = false;

async function openAddMember() {
  if (!addMemberOpen) {
    addMemberOpen = true;
    processNodeObj(document.body, [
      {
        name: "uBoxSmall",
        title: "Add Member",
        left: x + "px",
        top: "60px",
        id: "memberAddBox",
        styles: [
          ["zIndex", 3],
          ["right", "0px"],
          ["left", "unset"],
        ],
        nodes: [
          {
            name: "uInput",
            placeholder: "Email use ';' to add multiple",
            id: "addMemberInput",
          },
          {
            name: "uButtonMain",
            text: "Add",
            click: addMember,
          },
          {
            name: "uButtonSecondary",
            text: "Cancel",
            click: closeAddMemberBox,
          },
        ],
      },
    ]);
  }
}

async function addMember() {
  var users = document.getElementById("addMemberInput").value.split(";");
  var uid = [];
  for (var i in users) {
    uid.push(
      (
        await Fetch("/profile/data", {
          email: users[i],
          data: "userId",
        })
      ).data
    );
  }

  console.log(uid);

  await Fetch("/apps/chat/addMember", {
    chatId: chatId,
    key: window.localStorage.getItem("key"),
    users: uid,
  });
  closeAddMemberBox();
}

function closeAddMemberBox() {
  document.getElementById("memberAddBox").remove();
  addMemberOpen = false;
}

var socketHandlerChat = new socketHandler();

socketHandlerChat.init();
socketHandlerChat.subscribe("chat", chatId, window.localStorage.getItem("key"));
socketHandlerChat.onMessage.push(async function (msg) {
  await makeChatBox(msg, false);
  document
    .getElementById("chatBg")
    .scrollTo(0, document.getElementById("chatBg").scrollHeight);
});

var x = null;
var y = null;

document.addEventListener("mousemove", onMouseUpdate, false);
document.addEventListener("mouseenter", onMouseUpdate, false);

function onMouseUpdate(e) {
  x = e.pageX;
  y = e.pageY;
}
