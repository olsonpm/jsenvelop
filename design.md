## Assumptions

#### Module resolution
 - require calls cannot be dynamic


## Steps

#### Create the dependency graph
 - take entry file
 - use babylon to create the ast
 - create module entry in hash
   : module-id is the full path of the entry file
 - parse for dependencies
   - each require and import runs through a resolver
   - default resolvers (in order) ['node-simple']  
     : the node build appends 'node-fs'  
     : the browser build appends 'browser-fs'
   - resolvers return an object with two properties
     ```js
       id: <string>
       , code: <string>
     ```
     which then gets passed through babylon to create the ast
   - *each module id must be unique, but doesn't have to be a file path*
   - each resolved module gets added to the dependency graph and then parsed
     for their dependencies


## Constructs

#### Module
```js
{
  id: <string>
  ast: <obj>
  originalCode: <string>
  dependsOn: Array of <module id>
}
```

#### Resolver
```js
{
  name: <string>
  resolve: ({
    requestString: <string>
    dependentModuleId: <string>
  }) => Promise of new Module
}
```
