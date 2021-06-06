async function getProfileData(data, methode, auth1, auth2) {
  var json = {
    data: data,
  };
  if (methode == 0) {
    json.key = auth1;
  } else {
    json.userId = auth1;
    json.password = auth2;
  }

  return await Fetch(url + url + "/profile/data", json);
}

async function getDataKey(data) {
  if (window.localStorage.getItem("key")) {
    var data = await getProfileData(
      data,
      0,
      window.localStorage.getItem("key")
    );
    return data.data;
  }
}
