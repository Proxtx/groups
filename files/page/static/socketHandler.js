class socketHandler {
  socket;
  init = function () {
    this.socket = io();
  };

  onMessage = [];

  enabled = true;

  subscribe = function (service) {
    var argsString = "";
    for (var i = 1; i < arguments.length; i++) {
      argsString += "$_$" + arguments[i];
    }
    this.socket.emit("message", "subscribe$_$" + service + argsString);

    this.socket.on(
      "message",
      function (msg) {
        if (!this.this.enabled) return;
        for (var i in this.this.onMessage) {
          var f = this.this.onMessage[i].bind(this.this);
          f(msg);
        }

        this.socket.emit("message", "confirm");
      }.bind({ this: this, socket: this.socket })
    );
  };
}
