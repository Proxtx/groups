var pageScreen = new screen();

pageScreen.init("pageScreen");

async function main() {
  await loadAllUtilityNodes();
  pageScreen.loadScreen("/apps/main");
}
main();
