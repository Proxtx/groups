var chatScreen = new screen();

chatScreen.init("screenChat");

async function main() {
  await loadAllUtilityNodes();
  chatScreen.loadScreen("/apps/group");
}
main();
