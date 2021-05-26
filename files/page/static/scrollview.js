class scrollview {
  scrollobj;
  sendRequest;
  requestHandler;
  amount = 3;
  start = 0;
  reverse = false;

  initScrollview = async function (
    scrollObj,
    requestSender,
    handleRequest,
    reverse = false
  ) {
    this.scrollobj = scrollObj;
    this.sendRequest = requestSender;
    this.requestHandler = handleRequest;
    this.reverse = reverse;
    for (var i = 0; i < 30; i++) {
      if (
        this.scrollobj.scrollHeight - Math.abs(this.scrollobj.scrollTop) ===
        this.scrollobj.clientHeight
      ) {
        await this.handleScroll();
      } else {
        break;
      }
    }
    if (this.reverse) {
      this.scrollobj.scrollTo(0, this.scrollobj.scrollHeight);
    }
    this.scrollobj.onscroll = this.scrollHandler.bind(this);
  };

  scrollHandler = async function () {
    if (
      !this.reverse &&
      this.scrollobj.scrollHeight - Math.abs(this.scrollobj.scrollTop) ===
        this.scrollobj.clientHeight
    ) {
      await this.handleScroll();
    } else if (this.scrollobj.scrollTop <= 0) {
      var height = this.scrollobj.scrollHeight;
      await this.handleScroll();
      this.scrollobj.scrollTo(0, this.scrollobj.scrollHeight - height);
    }
  };

  handleScroll = async function () {
    await this.requestHandler(await this.sendRequest(this.start, this.amount));
    this.start += this.amount;
  };
}
