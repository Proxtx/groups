var adminUserScrollview = new scrollview();

var adminActiveUserData;

var newUserData = {};

async function main() {
  adminUserScrollview.amount = 10;
  adminUserScrollview.initScrollview(
    document.getElementById("userScrollView"),
    async function (start, amount) {
      return await Fetch(url + "/apps/admin/listUsers", {
        key: window.localStorage.getItem("key"),
        start: start,
        amount: amount,
      });
    },
    function (data) {
      data = data.result;
      for (var i in data) {
        processNodeObj(document.getElementById("userScrollView"), [
          {
            name: "uUserDisplay",
            img: url + "/file/get/" + data[i].profileImage,
            author: data[i].username,
            styles: [["cursor", "pointer"]],
            click: function () {
              adminActiveUserData = this.userData;
              adminScreen.loadScreen("/apps/admin/mainApp/screens/userDisplay");
            }.bind({ userData: data[i] }),
          },
        ]);
      }
    }
  );

  var p = new inputPopUp();
  p.addPopUp(
    {
      title: "Create user",
      placeholder: "Email",
      confirm: "Next",
      click: function (text) {
        newUserData.email = text;
      },
      elemInit: function (box, input, confirm, cancel) {
        var p = new inputPopUp();
        p.addPopUp(
          {
            title: "Create user",
            placeholder: "Password",
            confirm: "Next",
            click: function (text) {
              newUserData.password = text;
            },
            elemInit: function (box, input, confirm, cancel) {
              var p = new inputPopUp();
              p.addPopUp(
                {
                  title: "Create user",
                  placeholder: "Username",
                  confirm: "Finish",
                  click: async function (text) {
                    newUserData.username = text;
                    console.log(
                      await Fetch(url + "/apps/admin/registerNewUser", {
                        key: window.localStorage.getItem("key"),
                        email: newUserData.email,
                        pwd: newUserData.password,
                        username: newUserData.username,
                      })
                    );
                  },
                },
                confirm
              );
            },
          },
          confirm
        );
      },
    },
    document.getElementById("createUserButton")
  );
}

main();
