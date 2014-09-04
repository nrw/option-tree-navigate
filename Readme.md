# option-tree-navigate [![build status](https://secure.travis-ci.org/nrw/option-tree-navigate.png)](http://travis-ci.org/nrw/option-tree-navigate)

Navigate an option tree.

```js

var NavTree = require('option-tree-navigate')
var assert = require('assert')

var tree = NavTree([{
  id: '1',
  options: [
    {id: 'a'},
    {id: 'b'}
  ]
}, {
  id: '2',
  options: [{
    id: 'c',
    options: [
      {id: 'd'}
    ]
  }]
}, {
  id: '3',
  options: [
    {id: 'e'},
    {id: 'f'}
  ]
}])

assert.equal(tree.readPath([1, 0, 0]).id, 'd')
assert.deepEqual(tree.nextNode([0, 1]), [1])
```

# usage

## tree = NavTree(data, options)

- `options.optionField = 'options'`: the field name to consider child nodes of a node.

## traverse nodes

### tree.nextNode(path)

returns the path of the node immediately after the node at `path`.

### tree.prevNode(path)

returns the path of the node immediately before the node at `path`.

### tree.lastNode(path)

returns the path of the last child node of `path`

## traverse nodes by property

### tree.nearestWith(prop, path)

returns the path of the nearest node with a truthy value at `prop`.
checks next, then previous.

### tree.prevWith(prop, path)

returns the path of the previous node with a truthy value at `prop`

### tree.nextWith(prop, path)

returns the path of the next node with a truthy value at `prop`

## return nodes

### tree.read(path)

alias: `readPath`

reutrns the node at path

### tree.children(path)

alias: `childNodes`

reutrns the child nodes of the node at path

## query nodes

### has(prop, path)

returns true if the node at `path` has a truthy value at `prop`.
