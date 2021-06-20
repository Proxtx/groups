var pageScreen = new screen();

var perms = {};

var url = "/main";
var subUrl = "/page";

pageScreen.init("pageScreen");

async function main() {
  await loadAllUtilityNodes();
  pageScreen.loadScreen("/apps/main");
}

function showLogin() {
  pageScreen.loadScreen("/page/screens/login");
}
main();
