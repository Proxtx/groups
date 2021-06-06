async function applyPermStyle(id, perm, userId, styleId) {
  var Perm = await getPerm(id, perm, userId);
  if (!Perm) {
    var sheet = document.createElement("style");
    sheet.innerHTML = "." + styleId + "_" + perm + " {display: none;}";
    document.body.appendChild(sheet);
  }
  return Perm;
}

async function getPerm(id, perm, userId) {
  return (
    await Fetch(url + "/perm/get", {
      id: id,
      perm: perm,
      userId: userId,
    })
  ).state;
}
