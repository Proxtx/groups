class screen {
  screenId = "screen";
  currentlyLoading = false;
  init = function (screenId = "screen") {
    this.screenId = screenId;
  };

  loadScreen = async function (path, startFile = "index.html") {
    if (!this.currentlyLoading) {
      this.currentlyLoading = true;
      var result = await fetch(path + "/" + startFile, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      document.getElementById(this.screenId).innerHTML = "";
      var txt = (await result.text()).replaceAll("$PATH", path);
      try {
        txt = replaceTranslation(txt, "_");
      } catch (e) {
        console.log("translator.js is missing! At screen.js");
        console.log("Error: " + e);
      }
      const scriptEl = document.createRange().createContextualFragment(txt);
      document.getElementById(this.screenId).append(scriptEl);
      this.currentlyLoading = false;
    }
  };
}
