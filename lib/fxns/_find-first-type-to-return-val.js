//
// README
// - This is separated into its own module since it gets consumed by both
//   getFindFirst and getPFindFirst, which shouldn't exist in the same module
//   since pFindFirst will be required much less often.  Separating them allows
//   for bundlers to only grab those which are used.
//

module.exports = {
  // findFirstValue should return the value if the predicate returned
  //   truthy, otherwise undefined
  value: (result, value) => (result) ? value : undefined

  // findFirstResult should return the result if truthy, otherwise undefined
  , result: result => result || undefined
};
