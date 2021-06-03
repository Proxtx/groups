var imagePath = "/apps/file/channelEmbed/file.png";

async function displayFiles() {
  var result = await Fetch("/apps/file/list", {
    key: window.localStorage.getItem("key"),
    channelId: channelId,
  });

  var fileList = [
    {
      name: "uTextBackgroundInline",
      text: "Files",
      strong: true,
      styles: [
        ["line-height", "50px"],
        ["fontSize", "130%"],
        ["marginLeft", "25px"],
      ],
    },

    {
      name: "uButtonMain",
      text: "Upload",
      click: showUploadPopUp,
      styles: [
        ["float", "unset"],
        ["display", "block"],
      ],
    },
    {
      name: "uAreaBorderBottom",
      styles: [
        ["marginTop", "30px"],
        ["position", "relative"],
        ["borderBottom", "1px solid var(--main)"],
      ],
      nodes: [
        {
          name: "uImage",
          src: imagePath,
          width: "20px",
          height: "20px",
          styles: [
            ["position", "relative"],
            ["top", "15px"],
            ["transform", "translateY(-50%)"],
            ["marginLeft", "10px"],
          ],
        },
        {
          name: "uTextBackgroundInline",
          text: "Name",
          styles: [
            ["line-height", "35px"],
            ["fontSize", "100%"],
          ],
        },
      ],
    },
  ];

  for (var i in result.files) {
    var fileJson = {
      name: "uAreaBorderBottom",
      styles: [["position", "relative"]],
      nodes: [
        {
          name: "uImage",
          src: imagePath,
          width: "20px",
          height: "20px",
          styles: [
            ["position", "relative"],
            ["top", "15px"],
            ["transform", "translateY(-50%)"],
            ["marginLeft", "10px"],
          ],
        },
        {
          name: "uTextBackgroundInline",
          text: "File",
          id: "file." + i,
          styles: [
            ["line-height", "35px"],
            ["fontSize", "90%"],
            ["cursor", "pointer"],
          ],
        },
        {
          name: "uHTML",
          html: '<svg xmlns="http://www.w3.org/2000/svg" height="24px" viewBox="0 0 24 24" width="24px" fill="#000000"><path d="M0 0h24v24H0V0z" fill="none"/><path stroke="white" d="M6 10c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm12 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2zm-6 0c-1.1 0-2 .9-2 2s.9 2 2 2 2-.9 2-2-.9-2-2-2z"/></svg>',
          id: "fileOption." + i,
          styles: [
            ["float", "right"],
            ["position", "relative"],
            ["top", "5px"],
            ["cursor", "pointer"],
          ],
        },
      ],
    };
    fileJson.nodes[1].text = result.files[i].fileName;
    fileList.push(fileJson);
  }
  document.getElementById("fileDisplay").innerHTML = "";
  processNodeObj(document.getElementById("fileDisplay"), [
    {
      name: "uScreenFull",
      nodes: fileList,
    },
  ]);

  for (var x in result.files) {
    document.getElementById("file." + x).addEventListener(
      "click",
      function () {
        window.open("/file/get/" + this.file);
      }.bind({ file: result.files[x].fileId })
    );

    document.getElementById("file." + x).classList.add("hoverUnderline");

    document
      .getElementById("fileOption." + x)
      .addEventListener(
        "click",
        showFileOptions.bind({ this: this, fileId: result.files[x].fileId })
      );
  }
}

function showUploadPopUp() {
  processNodeObj(document.getElementById("fileDisplay"), [
    {
      name: "uBoxBig",
      title: "Upload",
      id: "uploadPopUp",
      nodes: [
        {
          name: "uHTML",
          html: "<br>",
        },
        {
          name: "uHTML",
          html: '<label for="fileUpload" id="fileUploadLabel" class="uButton uButtonSecondary">Select File</label>',
        },
        {
          name: "uHTML",
          html: "<br>",
        },
        {
          name: "uButtonMain",
          text: "Upload",
          id: "uploadButton",
        },
        {
          name: "uButtonSecondary",
          text: "Cancel",
          click: hideUploadPopUp,
        },
      ],
    },
  ]);
  document
    .getElementById("uploadButton")
    .addEventListener("click", requestFileUploadPerms);
}

var uploadPerm;

function uploadFile(
  elem,
  job = function () {
    alert("Upload Successfull");
  }
) {
  var formData = new FormData();
  formData.append("web", elem.files[0]);

  var xhr = new XMLHttpRequest();
  xhr.open("POST", "/file/upload/" + uploadPerm);
  xhr.send(formData);
  xhr.onload = job;
}

async function requestFileUploadPerms() {
  var fileInput = document.getElementById("fileUpload");
  var result = await Fetch("/apps/file/upload", {
    key: window.localStorage.getItem("key"),
    channelId: channelId,
    fileName: fileInput.files[0].name,
  });
  uploadPerm = result.permKey;
  uploadFile(document.getElementById("fileUpload"), () => {
    hideUploadPopUp();
    displayFiles();
  });
}

function hideUploadPopUp() {
  document.getElementById("uploadPopUp").remove();
}

var currentFileOptionsNode;

function showFileOptions() {
  processNodeObj(document.body, [
    {
      name: "uBoxSmall",
      title: "",
      top: y + "px",
      id: "fileOptionsPopUp",
      styles: [
        ["left", "unset"],
        ["right", "0px"],
        ["padding", "5px"],
      ],
      nodes: [
        {
          name: "uButtonSecondary",
          text: "Delete",
          styles: [["margin", "0px"]],
          click: deleteFile.bind({ fileId: this.fileId }),
        },
      ],
    },
  ]);
  window.setTimeout(function () {
    currentFileOptionsNode = document.getElementById("fileOptionsPopUp");
  }, 100);
}

displayFiles();

var x = null;
var y = null;

document.addEventListener("mousemove", onMouseUpdate, false);
document.addEventListener("mouseenter", onMouseUpdate, false);
document.addEventListener("click", function () {
  hideFileOptions();
});

function onMouseUpdate(e) {
  x = e.pageX;
  y = e.pageY;
}

function hideFileOptions() {
  if (currentFileOptionsNode) currentFileOptionsNode.remove();
}

async function deleteFile() {
  await Fetch("/apps/file/delete", {
    key: window.localStorage.getItem("key"),
    channelId: channelId,
    fileId: this.fileId,
  });
  displayFiles();
}
