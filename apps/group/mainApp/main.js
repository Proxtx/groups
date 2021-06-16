var groupId;

var groupMainScreen = new screen();

var userChat = false;

groupMainScreen.init("groupMainAppScreen");

async function main() {
  perms.create_groups = (
    await Fetch(url + "/perm/get", {
      id: { system: true },
      perm: "create_groups",
      userId: userId,
    })
  ).state;

  displayGroups(
    (
      await Fetch(url + "/apps/group/listGroups", {
        key: window.localStorage.getItem("key"),
      })
    ).groups
  );
}

function newGroupSlector(name, img, groupId, click = false) {
  var node = document
    .getElementsByClassName("groupSelector")[0]
    .cloneNode(true);
  node.children[0].src = img;
  node.children[1].innerHTML = name;
  if (!click) {
    node.addEventListener(
      "click",
      function () {
        loadGroup(this.groupId);
      }.bind({ groupId: groupId })
    );
  } else {
    node.addEventListener("click", click);
  }
  document.getElementById("groupList").appendChild(node);
}

function displayGroups(groups) {
  var foundLinkArgumentGroup = true;
  if (linkArguments) {
    foundLinkArgumentGroup = false;
  }
  for (var i in groups) {
    if (linkArguments && linkArguments[0] == groups[i].groupId) {
      foundLinkArgumentGroup = true;
      nextLinkSection();
      loadGroup(groups[i].groupId);
    }
    newGroupSlector(
      groups[i].name,
      url + "/file/get/" + groups[i].img,
      groups[i].groupId
    );
  }
  if (!foundLinkArgumentGroup) {
    selectApp("channel", false);
  }
  if (perms.create_groups) {
    newGroupSlector(
      "New Group",
      url + "/apps/group/mainApp/plus.png",
      1,
      async function () {
        var nG = await Fetch(url + "/apps/group/initGroup", {
          key: window.localStorage.getItem("key"),
          name: "New Group",
          users: [userId],
        });
        loadGroup(nG.groupId);
      }
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
