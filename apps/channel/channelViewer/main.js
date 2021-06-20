var userData = {};

var appScreen = new screen();

appScreen.init("channelViewScreen");

async function initChannel() {
  var channelInfo = (
    await Fetch(url + "/apps/channel/getChannelInfo", {
      key: window.localStorage.getItem("key"),
      channelId: channelId,
    })
  ).channel;

  document.getElementById("chatTitleText").innerHTML = channelInfo.title;
  document.getElementById("chatImage").src =
    url + "/file/get/" + channelInfo.img;

  for (var i in channelInfo.apps) {
    tabs.push({
      name: channelInfo.apps[i].name,
      link: "/apps/" + channelInfo.apps[i].app + "/channelEmbed",
      app: channelInfo.apps[i].app,
    });
  }

  for (var u in channelInfo.users) {
    await addMemberDataToList(channelInfo.users[u]);
  }
  initTabs();
}

initChannel();

async function addMemberDataToList(userId) {
  userData[userId] = {};
  userData[userId].author = (
    await Fetch(url + "/profile/data", {
      userId: userId,
      data: "username",
    })
  ).data;
  userData[userId].img =
    url +
    "/file/get/" +
    (
      await Fetch(url + "/profile/data", {
        userId: userId,
        data: "profileImage",
      })
    ).data;

  userData[userId].isGroupAdmin = (
    await Fetch(url + "/perm/get", {
      userId: userId,
      id: {
        groupId: groupId,
      },
      perm: "admin",
    })
  ).state;
}

var changeNameOpen = false;

function initChangeChatName() {
  if (!changeNameOpen) {
    changeNameOpen = true;
    processNodeObj(document.getElementById("channelViewScreen"), [
      {
        name: "uBoxSmall",
        title: "Channel Name",
        left: "0px",
        top: "0px",
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
        await Fetch(url + "/apps/channel/setChannelTitle", {
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
        id: "userDisplay_" + i,
      });
    }

    nA.push({
      name: "uButtonMain",
      text: "Close",
      id: "groupMemberClose",
      click: closeMembersPopUpBox,
    });
    if (isGroupAdmin) {
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
    }
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
    if (isGroupAdmin) {
      for (var x in userData) {
        var options;
        if (userChat) {
          options = [
            {
              name: "Kick",
              job: leaveGroup.bind(this, x),
            },
          ];
        } else {
          options = [
            {
              name: "Kick",
              job: leaveGroup.bind(this, x),
            },
            {
              name: "Make Admin",
              job: addAdmin.bind(this, x),
            },
          ];
        }
        if (userData[x].isGroupAdmin && !userChat) {
          options[1] = {
            name: "Remove Admin",
            job: removeAdmin.bind(this, x),
          };
        }
        var p = new popUp();
        p.addPopUp(options, document.getElementById("userDisplay_" + x), {
          right: true,
        });
      }
    }
  }
}

function closeMembersPopUpBox() {
  document.getElementById("groupMemberBox").remove();
  showMembersOpen = false;
}

async function leaveGroup(userId = userId) {
  await Fetch(url + "/apps/group/leaveGroup", {
    groupId: groupId,
    key: window.localStorage.getItem("key"),
    userId: userId,
  });
  closeMembersPopUpBox();
}

async function addAdmin(userId) {
  await Fetch(url + "/apps/group/addAdmin", {
    key: window.localStorage.getItem("key"),
    userId: userId,
    groupId: groupId,
  });
  closeMembersPopUpBox();
}

async function removeAdmin(userId) {
  await Fetch(url + "/apps/group/removeAdmin", {
    key: window.localStorage.getItem("key"),
    userId: userId,
    groupId: groupId,
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
        await Fetch(url + "/profile/data", {
          email: users[i],
          data: "userId",
        })
      ).data
    );
  }

  var result = await Fetch(url + "/apps/group/addMember", {
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

var tabs = [];

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
    if (isGroupAdmin) {
      node.addEventListener(
        "contextmenu",
        function (e) {
          if (currentChannelAppOptionsNode) {
            currentChannelAppOptionsNode.remove();
          }
          showChannelAppOptions(this.app);
          e.preventDefault();
        }.bind({ app: tabs[i].app }),
        false
      );
    }
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

var currentChannelAppOptionsNode;

function showChannelAppOptions(app) {
  processNodeObj(document.body, [
    {
      name: "uBoxSmall",
      title: "",
      top: y + "px",
      left: x + "px",
      id: "channelAppOptionsPopUp",
      styles: [
        ["padding", "5px"],
        ["zIndex", "3"],
      ],
      nodes: [
        {
          name: "uButtonSecondary",
          text: "Delete",
          styles: [["margin", "0px"]],
          click: deleteApp.bind({ this: this, app: app }),
        },
      ],
    },
  ]);
  window.setTimeout(function () {
    currentChannelAppOptionsNode = document.getElementById(
      "channelAppOptionsPopUp"
    );
  }, 100);
}

document.addEventListener("click", function () {
  if (currentChannelAppOptionsNode) {
    currentChannelAppOptionsNode.remove();
  }
});

async function deleteApp() {
  await Fetch(url + "/apps/channel/deleteApp", {
    channelId: channelId,
    app: this.app,
    key: window.localStorage.getItem("key"),
  });
}

var PopUp = new popUp();

/* PopUp.addPopUp([{ name: "Add" }], document.getElementById("addAppToChannel"), {
  left: true,
  right: false,
}); */
document
  .getElementById("addAppToChannel")
  .addEventListener("click", addAppPopUp);
function addAppPopUp() {
  processNodeObj(document.body, [
    {
      name: "uBoxSmall",
      title: "App Name",
      left: x + "px",
      top: y + "px",
      width: "350px",
      id: "addAppPopUp",
      styles: [["zIndex", 2]],
      nodes: [
        {
          name: "uInput",
          id: "addAppInput",
          value: "",
        },
        { name: "uButtonMain", text: "Ok", id: "addAppConfirm", click: addApp },
        { name: "uButtonSecondary", text: "Cancel", click: deleteAddAppPopUp },
      ],
    },
  ]);
}

function deleteAddAppPopUp() {
  document.getElementById("addAppPopUp").remove();
}

async function addApp() {
  await Fetch(url + "/apps/channel/addApp", {
    channelId: channelId,
    key: window.localStorage.getItem("key"),
    app: document.getElementById("addAppInput").value,
  });
  deleteAddAppPopUp();
}
