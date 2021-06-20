async function applyUserData() {
  document.getElementById("adminUserDisplayTopBarProfileImage").src =
    url + "/file/get/" + adminActiveUserData.img;
  document.getElementById("adminUserDisplayTopBarUsername").innerText =
    adminActiveUserData.username;
  addUserInfoListEntry("Email", adminActiveUserData.email);
  addUserInfoListEntry("userId", adminActiveUserData.userId);
}

function addUserInfoListEntry(type, value) {
  var node = document
    .getElementsByClassName("adminUserDisplayUserInfoListEntry")[0]
    .cloneNode(true);
  node.children[0].innerText = type;
  node.children[1].innerText = value;
  document.getElementById("adminUserDisplayUserInfoList").appendChild(node);
  return node;
}

async function deleteUser() {
  await Fetch(url + "/auth/deleteUser", {
    key: window.localStorage.getItem("key"),
    userId: adminActiveUserData.userId,
  });
}

var iP = new inputPopUp();

iP.addPopUp(
  {
    title: "Add Perm",
    placeholder: "Permission Name (BETA)",
    confirm: "Add",
    click: async function (text) {
      await Fetch(url + "/apps/admin/addPerm", {
        key: window.localStorage.getItem("key"),
        userId: adminActiveUserData.userId,
        perm: text,
      });
    },
  },
  document.getElementById("addPerm")
);

applyUserData();
