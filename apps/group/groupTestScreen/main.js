var chatScreen = new screen();

chatScreen.init("testScreenGroup");

async function main() {
  await loadAllUtilityNodes();
  chatScreen.loadScreen("/apps/group/groupEmbed");
}
main();
