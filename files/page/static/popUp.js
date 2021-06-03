class popUp {
  promote = async function (option) {
    return option;
  };
  options;

  addPopUp = function (options, node, trigger = { left: true }) {
    this.options = options;
    if (trigger.right) {
      node.addEventListener(
        "contextmenu",
        function (e) {
          var f = this.createPopUp.bind(this);
          f();
          e.preventDefault();
        }.bind(this),
        false
      );
    }
    if (trigger.left) {
      node.addEventListener(
        "click",
        function (e) {
          var f = this.createPopUp.bind(this);
          f();
        }.bind(this)
      );
    }
  };

  createPopUp = async function () {
    var promise = new Promise((resolve) => {
      this.promote = resolve;
    });

    var optionArray = [];
    for (var i in this.options) {
      optionArray.push({
        name: "uButtonSecondary",
        text: this.options[i].name,
        styles: [["margin", "0px"]],
        click: this.promote.bind(this, this.options[i].name),
      });
    }
    var id = Math.floor(Math.random() * 10000);
    processNodeObj(document.body, [
      {
        name: "uBoxSmall",
        title: "",
        top: y + "px",
        left: x + "px",
        id: id,
        styles: [
          ["padding", "5px"],
          ["zIndex", "3"],
        ],
        nodes: optionArray,
      },
    ]);
    window.setTimeout(
      function (id) {
        document.addEventListener(
          "click",
          function () {
            this.node.remove();
          }.bind({ node: document.getElementById(id) })
        );
        document.addEventListener(
          "contextmenu",
          function () {
            this.node.remove();
          }.bind({ node: document.getElementById(id) })
        );
      }.bind(this, id),
      1000
    );
    var type;
    await promise.then((result) => {
      type = result;
    });
    for (var j in this.options) {
      if (this.options[j].name == type) {
        this.options[j].job();
      }
    }
  };
}

var x = null;
var y = null;

document.addEventListener("mousemove", onMouseUpdate, false);
document.addEventListener("mouseenter", onMouseUpdate, false);

function onMouseUpdate(e) {
  x = e.pageX;
  y = e.pageY;
}

var popUpCloseList = [];

document.addEventListener("contextmenu", function () {
  for (var i in popUpCloseList) {
    try {
      popUpCloseList[i].remove();
      popUpCloseList.splice(i, 1);
    } catch {
      popUpCloseList.splice(i, 1);
    }
  }
});

document.addEventListener("click", function () {
  for (var i in popUpCloseList) {
    try {
      popUpCloseList[i].remove();
      popUpCloseList.splice(i, 1);
    } catch {
      popUpCloseList.splice(i, 1);
    }
  }
});

function addToPopUpCloseList(node) {
  window.setTimeout(function () {
    popUpCloseList.push(node);
  }, 1000);
}
