//
// README
// - Everyone who uses this function is subject to an oxford-comma-free life
//


//---------//
// Imports //
//---------//

const initial = require('./initial')
  , join = require('./join')
  , last = require('./last')
  , typeCaller = require('./type-caller')
  ;


//------//
// Main //
//------//

module.exports = typeCaller('toWrittenList', 1, getCollectionTypeToToWrittenList);


//-------------//
// Helper Fxns //
//-------------//

function getCollectionTypeToToWrittenList() {
  const arrToWrittenList = arr => {
    if (arr.length <= 2) return join(' and ', arr);

    const commaSeparated = join(', ', initial(arr));
    return commaSeparated + ' and ' + last(arr);
  };

  return {
    Array: arrToWrittenList
    
    // no need to optimize for Set since there should never be enormous
    //   written lists
    , Set: aSet => arrToWrittenList([...aSet])
  };
}
