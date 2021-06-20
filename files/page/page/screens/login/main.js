function next() {
  document.getElementById("content1").style.left = "-100%";
  document.getElementById("content2").style.left = "0%";
  document.getElementById("content3").style.left = "100%";
  document.getElementById("emailShow").innerHTML =
    document.getElementById("emailInput").value;
}

var result;

async function signIn() {
  document.getElementById("content2").style.left = "-100%";
  document.getElementById("content3").style.left = "0%";
  result = await Fetch(url + "/auth/signin", {
    email: document.getElementById("emailInput").value,
    password: document.getElementById("passwordInput").value,
  });
  window.setTimeout(resolveLogin, 2000);
}

function resolveLogin() {
  if (result.success) {
    window.localStorage.setItem("key", result.key);
    location.href = url + subUrl;
  } else reset();
}

function reset() {
  document.getElementById("content1").style.left = "0%";
  document.getElementById("content2").style.left = "100%";
  document.getElementById("content3").style.left = "100%";
  document.getElementById("passwordInput").value = "";
}

document.getElementById("emailInput").addEventListener("keyup", function (e) {
  if (e.key === "Enter" || e.keyCode === 13) {
    next();
  }
});

document
  .getElementById("passwordInput")
  .addEventListener("keyup", function (e) {
    if (e.key === "Enter" || e.keyCode === 13) {
      signIn();
    }
  });

setSrc(document.getElementById("arrow"), subUrl + "/screens/login/arrow.svg");

for (var i in document.getElementsByClassName("logoShow")) {
  srcLogo(document.getElementsByClassName("logoShow")[i]);
}
