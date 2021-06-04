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
          var f = this.createPopUp.bind(this, e);
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
          var f = this.createPopUp.bind(this, e);
          f();
        }.bind(this)
      );
    }
  };

  createPopUp = async function (e) {
    var promise = new Promise((resolve) => {
      this.promote = resolve;
    });

    var optionArray = [];
    for (var i in this.options) {
      optionArray.push({
        name: "uButtonSecondary",
        text: this.options[i].name,
        styles: [
          ["marginTop", "2px"],
          ["marginBottom", "2px"],
          ["width", "100%"],
        ],
        click: this.promote.bind(this, this.options[i].name),
      });
      optionArray.push({ name: "uHTML", html: "<br>" });
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
    addToPopUpCloseList(document.getElementById(id));
    if (e.pageX > window.innerWidth / 2) {
      document.getElementById(id).style.transform = "translateX(-100%)";
    }
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
  }, 50);
}
