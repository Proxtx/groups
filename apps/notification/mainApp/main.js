var notScv = new scrollview();

async function main() {
  notScv.amount = 10;
  notScv.initScrollview(
    document.getElementById("notificationList"),
    async function (start, amount) {
      return await Fetch(url + "/apps/notification/listNotifications", {
        key: window.localStorage.getItem("key"),
        start: start,
        amount: amount,
      });
    },
    async function (data) {
      data = data.result;
      for (var i in data) {
        addNewNotification(
          url + "/file/get/" + data[i].profileImage,
          data[i].userName,
          data[i].channel,
          data[i].message.text,
          data[i].groupId,
          data[i].channelId
        );
      }
    }
  );
}

function addNewNotification(img, author, channel, text, groupId, channelId) {
  var node = document
    .getElementsByClassName("notificationListEntry")[0]
    .cloneNode(true);
  node.children[0].children[0].src = img;
  node.children[1].children[0].innerText = author;
  node.children[1].children[2].innerText = channel;
  node.children[1].children[4].innerText = text;

  node.addEventListener(
    "click",
    function () {
      resolveLink(["group", this.groupId, this.channelId]);
    }.bind({ groupId: groupId, channelId, channelId })
  );

  document.getElementById("notificationList").appendChild(node);
}

main();
