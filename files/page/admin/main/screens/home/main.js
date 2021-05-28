var apps = [
  {
    image: "./screens/home/statistics.png",
    access: "AccessCode",
    link: "ScreenName",
  },
];

async function main() {
  var perm = (
    await Fetch("/auth/getPerms", {
      key: window.localStorage.getItem("key"),
    })
  ).perms;
  if (perm.adminAccess) {
    document.getElementById("username").innerHTML = (
      await Fetch("/profile/data", {
        key: window.localStorage.getItem("key"),
        data: "username",
      })
    ).data;
    document.getElementById("profileImage").src =
      "/file/get/" +
      (
        await Fetch("/profile/data", {
          key: window.localStorage.getItem("key"),
          data: "profileImage",
        })
      ).data;
    loadApps(perm);
  } else {
    alert("You dont have permission to visit this site.");
  }
}

function loadApps(perm) {
  for (var i = 0; i < apps.length; i++) {
    if (perm[apps[i].access]) {
      var el = document.getElementsByClassName("app")[0];
      elClone = el.cloneNode(true);
      elClone.addEventListener("click", loadScreen.bind(this, apps[i].link));
      elClone.children[0].src = apps[i].image;
      document.getElementById("apps").appendChild(elClone);
    }
  }
}

main();
