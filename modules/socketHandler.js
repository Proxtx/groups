var socketHandler = {
  onConnect: [function (socket) {}],

  onMessage: [
    function (msg, socket) {
      this.handleMessage(msg, socket);
    },
  ],

  handleMessage: function (msg, socket) {
    var cmdChain = msg.split("$_$");
    if (cmdChain[0] == "subscribe") {
      this.subscribe(cmdChain, socket);
    }
    if (cmdChain[0] == "confirm") {
      this.confirmSocket(cmdChain, socket);
    }
  },

  subscribe: function (cmdChain, socket) {
    if (!this.subs[cmdChain[1]]) {
      this.subs[cmdChain[1]] = {};
    }
    if (!this.subs[cmdChain[1]][cmdChain[2]]) {
      this.subs[cmdChain[1]][cmdChain[2]] = [];
    }
    this.subs[cmdChain[1]][cmdChain[2]].push({
      cmdChain: cmdChain,
      socket: socket,
    });
  },

  awaitSocketConfirm: {},

  confirmSocket: function (cmdChain, socket) {
    this.awaitSocketConfirm[socket.id] = undefined;
  },

  deleteSocket: function (socket) {
    if (this.awaitSocketConfirm[socket.id]) {
      this.subs[this.awaitSocketConfirm[socket.id].module][
        this.awaitSocketConfirm[socket.id].key
      ].splice(this.awaitSocketConfirm[socket.id].index, 1);
      this.awaitSocketConfirm[socket.id] = undefined;
    }
  },

  sendMessage: function (module, key, index, msg) {
    this.subs[module][key][index].socket.emit("message", msg);
    this.awaitSocketConfirm[this.subs[module][key][index].socket.id] = {
      module: module,
      key: key,
      index: index,
    };

    setTimeout(
      this.deleteSocket.bind(this, this.subs[module][key][index].socket),
      10000
    );
  },

  subs: {},

  init: function (db, io) {
    this.db = db;
    this.io = io;

    this.io.on(
      "connect",
      function (socket) {
        for (var i in this.onConnect) {
          this.onConnect[i](socket, this);
        }
        socket.on(
          "message",
          function (msg) {
            for (var i in this.this.onMessage) {
              var f = this.this.onMessage[i].bind(this.this);
              f(msg, this.socket);
            }
          }.bind({ this: this, socket: socket })
        );
      }.bind(this)
    );
  },
};

module.exports = socketHandler;
