'use strict';

//
// README
// - This is like a more sensible `split`
//


//---------//
// Imports //
//---------//

const typeCaller = require('./type-caller');


//------//
// Main //
//------//

module.exports = typeCaller(2, getCollectionTypeToSeparate);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToSeparate() {
  return {
    String: (char, str) => {
      if (char.length !== 1) {
        throw new Error(
          "separate on a string requires the first argument to be a character"
          + "\n  arg provided: " + JSON.stringify(char, null, 2)
        );
      }
      if (!str.length) return '';

      const res = [];
      let tmp = '';

      for(let i = 0; i < str.length; i+=1) {
        if (str[i] === char) {
          if (tmp) res.push(tmp);
          tmp = '';
        } else {
          tmp += str[i];
        }
      }

      if (tmp) res.push(tmp);

      return res;
    }
    , Array: (el, arr) => {
      if (!arr.length) return [];

      const res = [];
      let tmp = [];

      for(let i = 1; i < arr.length; i+=1) {
        if (arr[i] === el) {
          if (tmp.length) res.push(tmp);
          tmp = [];
        } else {
          tmp.push(arr[i]);
        }
      }

      if (tmp.length) res.push(tmp);

      return res;
    }
  };
}
