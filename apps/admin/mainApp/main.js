var adminPerms;
var adminScreen = new screen();

async function getPerms() {
  adminPerms = (
    await Fetch(url + "/apps/admin/getPerms", {
      key: window.localStorage.getItem("key"),
    })
  ).perms;
}

function addAdminTab(optionName, optionScreen) {
  var node = document
    .getElementsByClassName("adminListEntry")[0]
    .cloneNode(true);
  node.innerText = optionName;
  node.addEventListener(
    "click",
    function () {
      adminScreen.loadScreen(
        "/apps/admin/mainApp/screens/" + this.optionScreen
      );
    }.bind({ optionScreen: optionScreen })
  );
  document.getElementById("adminOptionsList").appendChild(node);
}

function resolvePerms() {
  if (adminPerms.manage_users || adminPerms.list_users) {
    addAdminTab("Users", "users");
  }
}

async function main() {
  adminScreen.init("adminOptionScreen");
  await getPerms();
  resolvePerms();
}

main();
