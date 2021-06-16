var userId;

var mainScreen = new screen();

mainScreen.init("mainScreen");

var apps = [];

async function main() {
  userId = (
    await Fetch(url + "/auth/key", {
      key: window.localStorage.getItem("key"),
    })
  ).userId;
  var Apps = (
    await Fetch(url + "/apps/main/listApps", {
      key: window.localStorage.getItem("key"),
    })
  ).apps;
  for (var i in Apps) {
    apps.push({
      name: Apps[i].name,
      img: url + "/apps/main/appImg/" + Apps[i].app,
      app: Apps[i].app,
    });
  }
  showApps();
  selectApp(0);
}
main();
function createMainApp(index, img, name) {
  var node = document.getElementsByClassName("mainApp")[0].cloneNode(true);
  node.children[0].src = img;
  node.children[1].innerHTML = name;
  node.addEventListener("click", function () {
    selectApp(index);
  });
  document.getElementById("appsList").appendChild(node);
  return node;
}

function showApps() {
  for (var i in apps) {
    apps[i].node = createMainApp(Number(i), apps[i].img, apps[i].name);
  }
}

var prevAppIndex = 0;

function selectApp(index, clearLinkArguments = true) {
  if (clearLinkArguments) {
    linkArguments = undefined;
  }
  deselectApp(prevAppIndex);
  var app;
  var appIndex;
  if (typeof index == "number") {
    app = apps[index];
    appIndex = index;
  } else {
    for (var i in apps) {
      if (apps[i].app == index) {
        app = apps[i];
        appIndex = i;
      }
    }
  }

  app.node.children[2].style.display = "unset";
  app.node.style.color = "var(--accentColor)";
  prevAppIndex = appIndex;
  mainScreen.loadScreen("/apps/" + app.app + "/mainApp");
}

function deselectApp(index) {
  apps[index].node.children[2].style.display = "none";
  apps[index].node.style.color = "var(--textColor)";
}
