var pageScreen = new screen();

var perms = {};

var url = "/main";

pageScreen.init("pageScreen");

async function main() {
  await loadAllUtilityNodes();
  pageScreen.loadScreen("/apps/main");
}
main();
