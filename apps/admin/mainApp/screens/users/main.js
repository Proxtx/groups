var adminUserScrollview = new scrollview();

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
          },
        ]);
      }
    }
  );
}

main();
