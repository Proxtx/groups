class scrollview {
  getScrollviewContent = async function (query, start, count) {
    return {
      success: true,
      result: await query.skip(start).limit(count).toArray(),
    };
  };
}

module.exports = scrollview;
