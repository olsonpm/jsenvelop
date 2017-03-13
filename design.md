## Assumptions

#### Module resolution
 - require calls cannot be dynamic


## Steps

#### Create the dependency graph
 - take entry file
 - use babylon to create the ast
 - create entry module
   : module-id is the full path of the entry file
 - parse for dependencies
 - each require and import runs through a resolver
   - default resolvers  
     server: `[node, server-fs]`  
     browser: `[browser-fs]`
 - resolvers return an object with properties `id` and `code` which get passed
   through babylon to create the ast
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
