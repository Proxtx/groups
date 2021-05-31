var userId;

var userData = {};

var appScreen = new screen();

appScreen.init("channelViewScreen");

async function initChannel() {
  userId = (
    await Fetch("/auth/key", {
      key: window.localStorage.getItem("key"),
    })
  ).userId;

  var channelInfo = (
    await Fetch("/apps/channel/getChannelInfo", {
      key: window.localStorage.getItem("key"),
      channelId: channelId,
    })
  ).channel;

  document.getElementById("chatTitleText").innerHTML = channelInfo.title;
  document.getElementById("chatImage").src = "/file/get/" + channelInfo.img;

  for (var u in channelInfo.users) {
    await addMemberDataToList(channelInfo.users[u]);
  }
  initTabs();
}

initChannel();

async function addMemberDataToList(userId) {
  userData[userId] = {};
  userData[userId].author = (
    await Fetch("/profile/data", {
      userId: userId,
      data: "username",
    })
  ).data;
  userData[userId].img =
    "/file/get/" +
    (
      await Fetch("/profile/data", {
        userId: userId,
        data: "profileImage",
      })
    ).data;
}

var changeNameOpen = false;

function initChangeChatName() {
  if (!changeNameOpen) {
    changeNameOpen = true;
    processNodeObj(document.body, [
      {
        name: "uBoxSmall",
        title: "Channel Name",
        left: "0px",
        top: "60px",
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
        await Fetch("/apps/channel/setChannelTitle", {
          channelId: channelId,
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
      id: "groupMemberClose",
      click: closeMembersPopUpBox,
    });
    nA.push({
      name: "uButtonSecondary",
      text: "Add Member",
      id: "groupMemberAdd",
      click: openAddMember,
    });
    nA.push({
      name: "uButtonSecondary",
      text: "Leave Group",
      id: "groupMemberLeave",
      click: leaveGroup,
    });
    processNodeObj(document.body, [
      {
        name: "uBoxSmall",
        title: "",
        left: x + "px",
        top: "60px",
        id: "groupMemberBox",
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
  document.getElementById("groupMemberBox").remove();
  showMembersOpen = false;
}

async function leaveGroup() {
  await Fetch("/apps/group/leaveGroup", {
    groupId: groupId,
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

  var result = await Fetch("/apps/group/addMember", {
    groupId: groupId,
    key: window.localStorage.getItem("key"),
    users: uid,
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

var x = null;
var y = null;

document.addEventListener("mousemove", onMouseUpdate, false);
document.addEventListener("mouseenter", onMouseUpdate, false);

function onMouseUpdate(e) {
  x = e.pageX;
  y = e.pageY;
}

var tabs = [
  { name: "Chat", link: "/apps/chat/chatEmbed" },
  { name: "Files", link: "/apps/file/" },
];

var selectedTab = 0;

function initTabs() {
  for (var i in tabs) {
    var node = document
      .getElementsByClassName("channelSelectAppTab")[0]
      .cloneNode(true);
    node.children[0].innerHTML = tabs[i].name;
    tabs[i].node = node;
    node.addEventListener(
      "click",
      function (index) {
        selectTab(index);
      }.bind(this, i)
    );
    document.getElementById("channelSelectApp").appendChild(node);
    deselectTab(i);
  }
  selectTab(selectedTab);
}

function selectTab(index) {
  deselectTab(selectedTab);
  tabs[index].node.style.color = "var(--textColor)";
  tabs[index].node.children[1].style.display = "unset";
  selectedTab = index;
  appScreen.loadScreen(tabs[index].link);
}
function deselectTab(index) {
  tabs[index].node.style.color = "var(--secondary)";
  tabs[index].node.children[1].style.display = "none";
}
