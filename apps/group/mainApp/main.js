var groupId;

var groupMainScreen = new screen();

groupMainScreen.init("groupMainAppScreen");

async function main() {
  displayGroups(
    (
      await Fetch("/apps/group/listGroups", {
        key: window.localStorage.getItem("key"),
      })
    ).groups
  );
}

function newGroupSlector(name, img, isAdmin, groupId) {
  var node = document
    .getElementsByClassName("groupSelector")[0]
    .cloneNode(true);
  node.children[0].src = "/file/get/" + img;
  node.children[1].innerHTML = name;
  node.addEventListener(
    "click",
    function () {
      loadGroup(this.groupId);
    }.bind({ groupId: groupId })
  );
  document.getElementById("groupList").appendChild(node);
}

function displayGroups(groups) {
  for (var i in groups) {
    newGroupSlector(
      groups[i].name,
      groups[i].img,
      groups[i].admin,
      groups[i].groupId
    );
  }
}

async function loadGroup(GroupId) {
  groupId = GroupId;
  await groupMainScreen.loadScreen("/apps/group/groupEmbed");
  document.getElementById("groupMainApp").style.height = "0";
  document.getElementById("groupMainAppScreen").style.display = "unset";
}

function unloadGroup() {
  document.getElementById("groupMainApp").style.height = "calc(100% - 30px)";
  document.getElementById("groupMainAppScreen").style.display = "none";
}

main();
