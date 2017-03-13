//---------//
// Imports //
//---------//

const curry = require('lodash.curry')
  , flip = require('./flip')
  , map = require('./map')
  ;

const { getAtPath, pReflect } = require('./utils');


//------//
// Main //
//------//

const concat = curry((arrLeft, arrRight) => arrLeft.concat(arrRight))
  , frontmostResolvedPromise = getfrontmostResolvedPromise()
  , mAppend = curry((el, arr) => { arr.push(el); return arr; })
  , mAppendAll = getMAppendAll()
  , mAppendAllTo = flip(mAppendAll)
  , mAppendTo = flip(mAppend)
  , mModifyAt = curry((fn, idx, arr) => { arr[idx] = fn(arr[idx], idx, arr); return arr; })
  , mPrepend = curry((el, arr) => { arr.unshift(el); return arr; })
  , mPrependAll = getMPrependAll()
  , mPrependAllTo = flip(mPrependAll)
  , mPrependTo = flip(mPrepend)
  , mRemoveAt = curry((idx, arr) => { arr.splice(idx, 1); return arr; })
  ;


//-------------//
// Helper Fxns //
//-------------//

function getMAppendAll() {
  return curry(
    (appendThese, toThisArray) => {
      Array.prototype.push.apply(toThisArray, appendThese);
      return toThisArray;
    }
  );
}

function getMPrependAll() {
  return curry(
    (prependThese, toThisArray) => {
      Array.prototype.unshift.apply(toThisArray, prependThese);
      return toThisArray;
    }
  );
}

function getfrontmostResolvedPromise() {
  return arr => {
    return new Promise((resolve, reject) => {
      let settledArr;
      try {
        if (!arr.length) return resolve(undefined);

        settledArr = new Array(arr.length);
        map(attachFrontmostHandler, arr);
      } catch (e) {
        reject(e);
      }

      function attachFrontmostHandler(el, idx) {
        return pReflect(Promise.resolve(el))
          .then(res => {
            settledArr[idx] = res;

            let i = 0
              , aStatus
              ;

            do {
              aStatus = getAtPath([i, 'status'], settledArr);
              i += 1;
            } while (
              aStatus !== undefined
              && aStatus === 'rejected'
              && i <= settledArr.length
            );

            if (aStatus === 'resolved') {
              resolve(settledArr[i - 1].value);
            } else if (i === settledArr.length && aStatus === 'rejected') {
              resolve(undefined);
            }
          });
      }
    });
  };
}


//---------//
// Exports //
//---------//

module.exports = {
  concat, frontmostResolvedPromise, mAppend, mAppendAll, mAppendAllTo
  , mAppendTo, mModifyAt, mPrepend, mPrependAll, mPrependAllTo, mPrependTo
  , mRemoveAt
};
