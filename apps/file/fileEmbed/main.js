var imagePath = "/apps/file/file.png";

var filesUiTest = processNodeObj(document.getElementById("fileDisplay"), [
  {
    name: "uScreenFull",
    nodes: [
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
      {
        name: "uAreaBorderBottom",
        styles: [
          ["position", "relative"],
          ["cursor", "pointer"],
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
            text: "Test img",
            styles: [
              ["line-height", "35px"],
              ["fontSize", "80%"],
            ],
          },
        ],
      },
      {
        name: "uAreaBorderBottom",
        styles: [
          ["position", "relative"],
          ["cursor", "pointer"],
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
            text: "aghafvafdf",
            styles: [
              ["line-height", "35px"],
              ["fontSize", "80%"],
            ],
          },
        ],
      },
    ],
  },
]);

function showUploadPopUp() {
  processNodeObj(document.getElementById("fileDisplay"), [
    {
      name: "uBoxBig",
      title: "Upload",
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
  var result = await Fetch("/apps/file/upload", {
    key: window.localStorage.getItem("key"),
    channelId: channelId,
  });
  uploadPerm = result.permKey;
  uploadFile(document.getElementById("fileUpload"), () => {
    alert("hhhhhhh");
  });
}
