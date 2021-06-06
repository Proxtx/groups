var pageScreen = new screen();

var url = "";

pageScreen.init("pageScreen");

async function main() {
  await loadAllUtilityNodes();
  pageScreen.loadScreen("/apps/main");
}
main();
