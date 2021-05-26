var utilityNodes = {};
var nodeClassNames = [
  "uInput",
  "uBoxSmall",
  "uBoxBig",
  "uButtonMain",
  "uButtonSecondary",
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
  uButtonSecondary: function (node, obj) {
    this.uButton(node, obj);
  },
  uButtonMain: function (node, obj) {
    this.uButton(node, obj);
  },
  uButton: function (node, obj) {
    node.innerHTML = obj.text;
  },
};

function processNodeObj(parentObj, nodes) {
  var nodeId = {};
  for (var i in nodes) {
    var node = createElement(nodes[i].name, parentObj);
    nodeId[nodes[i].id] = node;
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
