var linkArguments;
function resolveLink(linkParts) {
  for (var i in apps) {
    if (apps[i].app == linkParts[0]) {
      console.log("Resolving Link! App: " + linkParts[0]);
      linkParts.shift();
      linkArguments = linkParts;
      selectApp(Number(i), false);
      return;
    }
  }
  console.log("Resolve link failed! App not found");
}

function nextLinkSection() {
  linkArguments.shift();
}
