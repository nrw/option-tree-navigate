var test = require('tape')

var NavTree = require('..')
var tree

// node order:
// - depth
// - width
// [
//   id: 0
// ,
//   id: 1
//   options: [
//     id: 2
//   ,
//     id: 3
//     options: [
//       id: 4
//       options: [
//         id: 5
//       ,
//         id: 6
//       ]
//     ,
//       id: 7
//     ,
//       id: 8
//     ]
//   ,
//     id: 9
//   ]
// ,
//   id: 10
// ]

test('read path', function (t) {
  tree = NavTree([{
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

  t.equal(tree.readPath([0]).id, '1')
  t.equal(tree.readPath([0, 0]).id, 'a')
  t.equal(tree.readPath([0, 1]).id, 'b')
  t.equal(tree.readPath([1]).id, '2')
  t.equal(tree.readPath([1, 0]).id, 'c')
  t.equal(tree.readPath([1, 0, 0]).id, 'd')
  t.equal(tree.readPath([2]).id, '3')
  t.equal(tree.readPath([2, 0]).id, 'e')
  t.equal(tree.readPath([2, 1]).id, 'f')
  t.equal(tree.readPath([1, 0, 1]), null)
  t.equal(tree.readPath([6, 0, 1, 2]), null)
  t.equal(tree.readPath(null), null)
  t.end()
})

test('traverse nodes', function (t) {
  t.same(tree.lastNode([0]), [0, 1])
  t.same(tree.lastNode([1]), [1, 0, 0])
  t.same(tree.lastNode([1, 0]), [1, 0, 0])
  t.same(tree.lastNode([2]), [2, 1])
  t.same(tree.lastNode(null), null)

  // tree.nextNode(path)
  t.same(NavTree([]).nextNode(), null, 'empty tree')
  t.same(tree.nextNode(), [0])
  t.same(tree.nextNode(null), [0])
  t.same(tree.nextNode([0]), [0, 0])
  t.same(tree.nextNode([0, 0]), [0, 1])
  t.same(tree.nextNode([0, 1]), [1])
  t.same(tree.nextNode([1]), [1, 0])
  t.same(tree.nextNode([1, 0]), [1, 0, 0])
  t.same(tree.nextNode([1, 0, 0]), [2])
  t.same(tree.nextNode([2]), [2, 0])
  t.same(tree.nextNode([2, 0]), [2, 1])
  t.same(tree.nextNode([2, 1]), null)

  t.same(tree.nextNode([-20]), [0])

  // tree.prevNode(path)
  t.same(tree.prevNode(), [2, 1])
  t.same(tree.prevNode([2, 1]), [2, 0])
  t.same(tree.prevNode([2, 0]), [2])
  t.same(tree.prevNode([2]), [1, 0, 0])
  t.same(tree.prevNode([1, 0, 0]), [1, 0])
  t.same(tree.prevNode([1, 0]), [1])
  t.same(tree.prevNode([1]), [0, 1])
  t.same(tree.prevNode([0, 1]), [0, 0])
  t.same(tree.prevNode([0, 0]), [0])
  t.same(tree.prevNode([0]), null)

  t.same(tree.prevNode([3, 2, 3]), [2, 1])

  t.end()
})

test('query nodes', function (t) {
  tree = NavTree([{
    title: '1',
    options: [
      {id: 'a'},
      {id: 'b'}
    ]
  }, {
    title: '2',
    options: [{
      id: 'c',
      options: [
        {id: 'd'}
      ]
    }]
  }, {
    title: '3',
    options: [
      {id: 'e'},
      {id: 'f'}
    ]
  }])

  t.notOk(tree.has('id'))
  t.notOk(tree.has('id', [0]))
  t.ok(tree.has('id', [0, 0]))
  t.ok(tree.has('id', [0, 1]))
  t.notOk(tree.has('id', [0, 2]))
  t.notOk(tree.has('id', [1]))
  t.ok(tree.has('id', [1, 0]))
  t.ok(tree.has('id', [1, 0, 0]))
  t.notOk(tree.has('id', [1, 0, 1]))
  t.notOk(tree.has('id', [1, 1, 0]))
  t.notOk(tree.has('id', [2]))
  t.ok(tree.has('id', [2, 0]))
  t.ok(tree.has('id', [2, 1]))
  t.end()
})

test('traverse options', function (t) {
  // tree.nextWith('id', path)
  t.same(tree.nextWith('id', null), [0, 0])
  t.same(tree.nextWith('id'), [0, 0])
  t.same(tree.nextWith('id', [0]), [0, 0])
  t.same(tree.nextWith('id', [0, 0]), [0, 1])
  t.same(tree.nextWith('id', [0, 1]), [1, 0])
  t.same(tree.nextWith('id', [1, 0]), [1, 0, 0])
  t.same(tree.nextWith('id', [1, 0, 0]), [2, 0])
  t.same(tree.nextWith('id', [2, 0]), [2, 1])
  t.same(tree.nextWith('id', [2, 1]), null)

  // tree.prevWith('id', path)
  t.same(tree.prevWith('id'), [2, 1])
  t.same(tree.prevWith('id', null), [2, 1])
  t.same(tree.prevWith('id', [2, 1]), [2, 0])
  t.same(tree.prevWith('id', [2, 0]), [1, 0, 0])
  t.same(tree.prevWith('id', [1, 0, 0]), [1, 0])
  t.same(tree.prevWith('id', [1, 0]), [0, 1])
  t.same(tree.prevWith('id', [0, 1]), [0, 0])
  t.same(tree.prevWith('id', [0, 0]), null)

  // tree.nearestWith('id', path) // current, if selectable,
  //   else next if selectable else prev selectable
  t.same(tree.nearestWith('id', null), [0, 0])
  t.same(tree.nearestWith('id', [0]), [0, 0])
  t.same(tree.nearestWith('id', [1, 0, 1]), [2, 0])
  t.same(tree.nearestWith('id', [1, 1, 1]), [2, 0])
  t.same(tree.nearestWith('id', [3, 1, 1]), [2, 1])
  t.same(tree.nearestWith('id', [-10, 1, 1]), [0, 0])
  t.same(tree.nearestWith('id', [10, -20, 1]), [0, 0])

  t.end()
})

test('gets children', function (t) {
  // tree.childNodes(path)
  t.same(tree.childNodes(), [
    {id: 'a'},
    {id: 'b'},
    {id: 'c', options: [{id: 'd'}]},
    {id: 'd'},
    {id: 'e'},
    {id: 'f'}
  ])
  t.same(tree.childNodes([0]), [
    {id: 'a'},
    {id: 'b'}
  ])
  t.same(tree.childNodes([1]), [
    {id: 'c', options: [{id: 'd'}]},
    {id: 'd'}
  ])
  t.same(tree.childNodes([1, 0]), [
    {id: 'd'}
  ])
  t.same(tree.childNodes([2]), [
    {id: 'e'},
    {id: 'f'}
  ])
  t.end()
})

test('allows custom option field', function (t) {
  tree = NavTree([{
    id: 'x',
    _opts: [
      {id: 'y'},
      {id: 'z'}
    ]
  }], {optionField: '_opts'})

  t.equal(tree.readPath([0, 1]).id, 'z')
  t.end()
})
