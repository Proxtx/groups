var groupId = "xiyoch1qmsmo7lp27";

var groupScreen = new screen();

groupScreen.init("groupViewScreen");

var groupInfo = {};

async function main() {
  groupInfo = await Fetch("/apps/group/info", {
    groupId: groupId,
    key: window.localStorage.getItem("key"),
  });
  document.getElementById("groupTitle").children[0].innerHTML =
    groupInfo.group.title;
  document.getElementById("groupImage").src =
    "/file/get/" + groupInfo.group.img;

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
main();

function newChannelListEntry(title, ChannelId) {
  var node = document
    .getElementsByClassName("channelListEntry")[0]
    .cloneNode(true);
  node.innerHTML = title;
  node.addEventListener(
    "click",
    loadChannel.bind({ node: node, channelId: ChannelId })
  );
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

function showGroupOptions() {
  processNodeObj(document.body, [
    {
      name: "uBoxSmall",
      title: "",
      top: y + "px",
      left: x + "px",
      id: "groupOptionsPopUp",
      styles: [["padding", "5px"]],
      nodes: [
        {
          name: "uButtonSecondary",
          text: "Add Channel",
          styles: [["margin", "0px"]],
          click: showAddChannelTitleInput,
        },
      ],
    },
  ]);
  window.setTimeout(function () {
    currentGroupOptionsNode = document.getElementById("groupOptionsPopUp");
  }, 100);
}

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
  await Fetch("/apps/group/addChannel", {
    groupId: groupId,
    key: window.localStorage.getItem("key"),
    title: document.getElementById("addChannelTitle").value,
  });
  cancelAddChannelTitleInput();
}
