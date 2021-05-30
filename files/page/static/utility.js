var utilityNodes = {};
var nodeClassNames = [
  "uInput",
  "uBoxSmall",
  "uBoxBig",
  "uButtonMain",
  "uButtonSecondary",
  "uUserDisplay",
  "uScreenFull",
  "uAreaBorderTopBottom",
  "uAreaBorderBottom",
  "uTextBackgroundInline",
  "uImage",
  "uHTML",
];

var processNodeFunctions = {
  uBoxBig: function (node, obj) {
    return this.uBox(node, obj);
  },
  uBoxSmall: function (node, obj) {
    return this.uBox(node, obj);
  },
  uBox: function (node, obj) {
    node.children[0].innerHTML = obj.title;
    node.style.left = obj.left;
    node.style.top = obj.top;
    node.style.width = obj.width;
    node.style.height = obj.height;
    return processNodeObj(node, obj.nodes);
  },
  uScreenFull: function (node, obj) {
    return this.uScreen(node, obj);
  },
  uAreaBorderTopBottom: function (node, obj) {
    return this.uScreen(node, obj);
  },
  uAreaBorderBottom: function (node, obj) {
    return this.uScreen(node, obj);
  },
  uScreen: function (node, obj) {
    return processNodeObj(node, obj.nodes);
  },
  uButtonSecondary: function (node, obj) {
    this.uButton(node, obj);
  },
  uButtonMain: function (node, obj) {
    this.uButton(node, obj);
  },
  uButton: function (node, obj) {
    node.innerHTML = obj.text;
    if (obj.click) {
      node.addEventListener("click", obj.click);
    }
  },
  uInput: function (node, obj) {
    if (obj.value) {
      node.value = obj.value;
    }
    if (obj.placeholder) {
      node.placeholder = obj.placeholder;
    }
  },
  uUserDisplay: function (node, obj) {
    node.children[0].src = obj.img;
    node.children[1].innerHTML = obj.author;
  },
  uTextBackgroundInline: function (node, obj) {
    if (obj.strong) {
      node.innerHTML = "<strong>" + obj.text + "</strong>";
    } else {
      node.innerHTML = obj.text;
    }
  },
  uImage: function (node, obj) {
    node.src = obj.src;
    if (obj.width) {
      node.style.width = obj.width;
    }
    if (obj.height) {
      node.style.height = obj.height;
    }
  },
  uHTML: function (node, obj) {
    node.innerHTML = obj.html;
  },
};

function processNodeObj(parentObj, nodes) {
  var nodeId = {};
  for (var i in nodes) {
    var node = createElement(nodes[i].name, parentObj);
    nodeId[nodes[i].id] = node;
    if (nodes[i].id) {
      node.id = nodes[i].id;
    }
    if (processNodeFunctions[nodes[i].name]) {
      var nodesSub = processNodeFunctions[nodes[i].name](node, nodes[i]);
    }
    applyAdditionalStyles(node, nodes[i].styles);
    if (nodesSub) {
      for (var x in Object.keys(nodesSub)) {
        nodeId[Object.keys(nodesSub)[x]] = nodesSub[Object.keys(nodesSub)[x]];
      }
    }
  }
  return nodeId;
}

function applyAdditionalStyles(node, styles) {
  for (var i in styles) {
    node.style[styles[i][0]] = styles[i][1];
  }
}

function createElement(name, parentObj) {
  if (utilityNodes[name]) {
    var node = utilityNodes[name].cloneNode(true);
    parentObj.appendChild(node);
    return node;
  } else {
    console.log("Node: " + name + " not found! In utility.js");
    return;
  }
}

async function loadAllUtilityNodes(display = false) {
  var txt = await (
    await fetch("/static/utility.html", {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    })
  ).text();
  const insert = document.createRange().createContextualFragment(txt);
  var he = document.createElement("div");
  he.appendChild(insert);
  if (!display) {
    he.style.display = "none";
  }
  document.body.appendChild(he);

  for (var i in nodeClassNames) {
    addNodeToList(nodeClassNames[i]);
  }
}

function addNodeToList(className) {
  utilityNodes[className] = document
    .getElementsByClassName(className)[0]
    .cloneNode(true);
}
