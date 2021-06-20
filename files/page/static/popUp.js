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
        await this.options[j].job();
      }
    }
  };
}

class inputPopUp {
  promote = async function (type) {
    return type;
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

    var id = Math.floor(Math.random() * 10000);
    var inputId = Math.floor(Math.random() * 10000);
    var cancelId = Math.floor(Math.random() * 10000);
    var confirmId = Math.floor(Math.random() * 10000);
    processNodeObj(document.body, [
      {
        name: "uBoxSmall",
        title: this.options.title,
        top: y + "px",
        left: x + "px",
        id: id,
        nodes: [
          {
            name: "uInput",
            placeholder: this.options.placeholder,
            id: inputId,
          },
          {
            name: "uButtonMain",
            text: this.options.confirm,
            click: this.promote.bind(this, "confirm"),
            id: confirmId,
          },
          {
            name: "uButtonSecondary",
            text: "Cancel",
            click: this.promote.bind(this, "cancel"),
            id: cancelId,
          },
        ],
      },
    ]);
    if (e.pageX > window.innerWidth / 2) {
      document.getElementById(id).style.transform = "translateX(-100%)";
    }

    if (this.options.elemInit)
      this.options.elemInit(
        document.getElementById(id),
        document.getElementById(inputId),
        document.getElementById(confirmId),
        document.getElementById(cancelId)
      );

    var type;
    await promise.then((result) => {
      type = result;
    });

    if (type == "confirm") {
      if (this.options.click)
        await this.options.click(document.getElementById(inputId).value);
    }

    document.getElementById(id).remove();
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
