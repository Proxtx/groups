var groupScreen = new screen();

var isGroupAdmin = false;

groupScreen.init("groupViewScreen");

var groupInfo = {};

async function initGroupView() {
  isGroupAdmin = await getPerm({ groupId: groupId }, "admin", userId);

  applyPermStyle({ groupId: groupId }, "admin", userId, "group");

  groupInfo = await Fetch(url + "/apps/group/info", {
    groupId: groupId,
    key: window.localStorage.getItem("key"),
  });
  document.getElementById("groupName").children[0].innerHTML =
    groupInfo.group.name;
  document.getElementById("groupImage").src =
    url + "/file/get/" + groupInfo.group.img;

  for (var i in groupInfo.group.channels) {
    newChannelListEntry(
      groupInfo.group.channels[i].title,
      groupInfo.group.channels[i].channelId
    );
  }
  selectChannel(
    document.getElementById("channelList").children[0],
    groupInfo.group.channels[0].channelId
  );
}

function newChannelListEntry(title, ChannelId) {
  var node = document
    .getElementsByClassName("channelListEntry")[0]
    .cloneNode(true);
  node.innerHTML = title;
  node.addEventListener(
    "click",
    loadChannel.bind({ node: node, channelId: ChannelId })
  );
  if (isGroupAdmin) {
    var p = new popUp();
    p.addPopUp(
      [{ name: "Delete", job: deleteChannel.bind({ channelId: ChannelId }) }],
      node,
      { left: false, right: true }
    );
  }
  document.getElementById("channelList").appendChild(node);
  return node;
}

var prevChannelListNode;

function loadChannel() {
  selectChannel(this.node, this.channelId);
}

var channelId;

async function selectChannel(node, ChannelId) {
  if (prevChannelListNode) prevChannelListNode.style.backgroundColor = "unset";
  node.style.backgroundColor = "var(--bgL4)";
  prevChannelListNode = node;
  await groupScreen.loadScreen("/apps/channel");
  channelId = ChannelId;
}

var currentGroupOptionsNode;

var x = null;
var y = null;

document.addEventListener("mousemove", onMouseUpdate, false);
document.addEventListener("mouseenter", onMouseUpdate, false);
document.addEventListener("click", function () {
  hideGroupOptions();
});

function onMouseUpdate(e) {
  x = e.pageX;
  y = e.pageY;
}

function hideGroupOptions() {
  if (currentGroupOptionsNode) currentGroupOptionsNode.remove();
}

function showAddChannelTitleInput() {
  processNodeObj(document.body, [
    {
      name: "uBoxSmall",
      title: "Channel Name",
      top: y + "px",
      left: x + "px",
      id: "channelAddInputPopUp",
      nodes: [
        {
          name: "uInput",
          id: "addChannelTitle",
        },
        {
          name: "uButtonMain",
          text: "Ok",
          click: addChannel,
        },
        {
          name: "uButtonSecondary",
          text: "Cancel",
          click: cancelAddChannelTitleInput,
        },
      ],
    },
  ]);
}

async function cancelAddChannelTitleInput() {
  document.getElementById("channelAddInputPopUp").remove();
}

async function addChannel() {
  await Fetch(url + "/apps/group/addChannel", {
    groupId: groupId,
    key: window.localStorage.getItem("key"),
    title: document.getElementById("addChannelTitle").value,
  });
  cancelAddChannelTitleInput();
}

async function deleteChannel() {
  await Fetch(url + "/apps/group/deleteChannel", {
    key: window.localStorage.getItem("key"),
    groupId: groupId,
    channelId: this.channelId,
  });
}

function renameGroup() {
  processNodeObj(document.body, [
    {
      name: "uBoxSmall",
      title: "Rename Group",
      id: "renameGroupPopUp",
      top: y + "px",
      left: x + "px",
      nodes: [
        {
          name: "uInput",
          id: "renameGroupInput",
        },
        {
          name: "uButtonMain",
          text: "Ok",
          click: sendRenameGroup,
        },
        {
          name: "uButtonSecondary",
          text: "Cancel",
          click: function () {
            deleteElement("renameGroupPopUp");
          },
        },
      ],
    },
  ]);
}

function deleteElement(id) {
  document.getElementById(id).remove();
}

async function sendRenameGroup() {
  await Fetch(url + "/apps/group/renameGroup", {
    key: window.localStorage.getItem("key"),
    name: document.getElementById("renameGroupInput").value,
    groupId: groupId,
  });
  deleteElement("renameGroupPopUp");
}

function addGroupOptions() {
  var p = new popUp();
  p.addPopUp(
    [
      { name: "Add Channel", job: showAddChannelTitleInput },
      { name: "Rename Group", job: renameGroup },
      { name: "Delete Group", job: deleteGroup },
    ],
    document.getElementById("groupOptions")
  );
}

async function deleteGroup() {
  await Fetch(url + "/apps/group/deleteGroup", {
    groupId: groupId,
    key: window.localStorage.getItem("key"),
  });
  unloadGroup();
}

addGroupOptions();

initGroupView();
