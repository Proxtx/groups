var chatChannelScreen = new screen();

chatChannelScreen.init("chatChannelScreen");

var groupId;
var userChat = true;

var chats = [];

async function main() {
  chats = (
    await Fetch(url + "/apps/group/listGroups", {
      key: window.localStorage.getItem("key"),
      userChat: true,
    })
  ).groups;

  for (var i in chats) {
    newChatSelector(
      chats[i].channelNames[0],
      url + "/file/get/" + chats[i].img,
      chats[i].groupId
    );
  }
}

function newChatSelector(name, img, groupId) {
  var p = new popUp();
  var node = document.getElementsByClassName("uUserDisplay")[0].cloneNode(true);
  node.children[0].src = img;
  node.children[1].innerHTML = name;
  node.style.cursor = "pointer";
  node.addEventListener(
    "click",
    function () {
      loadGroupChat(this.groupId);
    }.bind({ groupId: groupId })
  );
  p.addPopUp(
    [{ name: "Delete", job: deleteChat.bind({ groupId: groupId }) }],
    node,
    { left: false, right: true }
  );
  document.getElementById("chatList").appendChild(node);
}

async function deleteChat() {
  await Fetch(url + "/apps/group/deleteGroup", {
    key: window.localStorage.getItem("key"),
    groupId: this.groupId,
  });
}

async function loadGroupChat(GroupId) {
  groupId = GroupId;
  await chatChannelScreen.loadScreen("/apps/group/groupEmbed");
}

var addMemberOpen = false;

async function openAddMember() {
  if (!addMemberOpen) {
    addMemberOpen = true;
    processNodeObj(document.body, [
      {
        name: "uBoxSmall",
        title: "New Chat",
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
  var names = [];
  for (var i in users) {
    uid.push(
      (
        await Fetch(url + "/profile/data", {
          email: users[i],
          data: "userId",
        })
      ).data
    );
    names.push(
      (
        await Fetch(url + "/profile/data", {
          email: users[i],
          data: "username",
        })
      ).data
    );
  }

  console.log(names);

  uid.push(userId);

  var result = await Fetch(url + "/apps/group/initGroup", {
    groupId: groupId,
    key: window.localStorage.getItem("key"),
    users: uid,
    userChat: true,
    name: names.join(", "),
  });

  if (!result.success) {
    processNodeObj(document.body, [
      {
        name: "uBoxSmall",
        title: "One of the entered email addresses was invalid!",
        left: x + "px",
        top: "60px",
        id: "memberAddErrorBox",
        styles: [
          ["zIndex", 4],
          ["right", "0px"],
          ["left", "unset"],
        ],
        nodes: [
          {
            name: "uButtonMain",
            text: "Ok",
            click: function () {
              document.getElementById("memberAddErrorBox").remove();
            },
          },
        ],
      },
    ]);
  }

  closeAddMemberBox();
}

function closeAddMemberBox() {
  document.getElementById("memberAddBox").remove();
  addMemberOpen = false;
}

main();
