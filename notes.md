GUEST
- A guest is a wrapper to a visitor.  It holds the result of an ast traversal
  for its visitor along with an id to differentiate between other guests.  It
  works together with 'travel', where travel is passed a list of guests along
  with an ast.  Travel then merges the guests' visitor objects, traverses the
  ast, and returns an object with all the keys of its guests pointing their
  corresponding result objects.  At a high level, these two constructs solve the
  problem of babel-traverse causing side-effects.
