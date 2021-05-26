var translation;
var codesToFile = JSON.parse(`{
    "de": "german"
}`);

function getTranslation(string, amount = 1) {
  return translation[string];
}

async function fetchTranslationFile() {
  var userLang = (navigator.language || navigator.userLanguage).split("-")[0];
  var lang = codesToFile[userLang];
  if (!lang) {
    lang = "english";
  }
  translation = JSON.parse(
    await (
      await fetch("./translation/" + lang + ".json", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      })
    ).text()
  );
}

function replaceTranslation(text, preset) {
  for (var name in translation) {
    text = text.replaceAll(preset + name, getTranslation(name));
  }
  return text;
}

async function main() {
  await fetchTranslationFile();
}
main();
