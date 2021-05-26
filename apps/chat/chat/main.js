var userId;
var chatId = "c1fe3cydekwh5q8yi";

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

async function main() {
  userId = (
    await Fetch("/auth/key", {
      key: window.localStorage.getItem("key"),
    })
  ).userId;
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
    author = (
      await Fetch("/profile/data", {
        userId: msg.userId,
        data: "username",
      })
    ).data;
    image =
      "/image/get/" +
      (
        await Fetch("/profile/data", {
          userId: msg.userId,
          data: "profileImage",
        })
      ).data;
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

var socketHandlerChat = new socketHandler();

socketHandlerChat.init();
socketHandlerChat.subscribe("chat", chatId, window.localStorage.getItem("key"));
socketHandlerChat.onMessage.push(async function (msg) {
  await makeChatBox(msg, false);
  document
    .getElementById("chatBg")
    .scrollTo(0, document.getElementById("chatBg").scrollHeight);
});
