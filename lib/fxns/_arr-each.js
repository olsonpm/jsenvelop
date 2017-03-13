module.exports = function arrEach(fn, arr) {
  //
  // shouldn't use Array.prototype.forEach because of
  //   http://stackoverflow.com/a/18884620
  //
  for (let i = 0; i < arr.length; i+=1) {
    fn(arr[i], i, arr);
  }
  return arr;
};
