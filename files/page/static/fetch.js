async function Fetch(url, json, dontParse = false) {
  var result = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(json),
  });

  if (!dontParse) {
    return await parseResponse(await result.text());
  } else {
    return JSON.parse(await result.text());
  }
}

async function parseResponse(responseText) {
  try {
    var data = JSON.parse(responseText);
    if (!data.success) {
      console.log("Request Error! Error Code: " + data.error);
      console.log("Full error: " + JSON.stringify(data));
      if (data.error == 1) {
        console.log("Error has been identified as an: Auth Error");
        console.log(
          "The Programm should Logout the user ... If you see this message this programm is in a beta phase! If you are one of the devs please implement the logout screen!"
        );
        showLogin();
      } else if (data.error == 3) {
        console.log("Error has been identified as an: Verification Error");
        console.log(
          "The programm should ask the user to verify the account... If you see this message this programm is in a beta phase! If you are a dev please implement the verification screen!"
        );
      }
    }
    return data;
  } catch (err) {
    console.log("Parsing error in fetch.js " + err);
    console.log("Plain Text: " + responseText);
    return { success: false, error: -1 };
  }
}
