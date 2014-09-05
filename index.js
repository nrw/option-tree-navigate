module.exports = OptionTree

function OptionTree (tree, opts) {
  opts = opts || {}
  opts.optionField = opts.optionField || 'options'

  return {
    // traverse by property
    nearestWith: nearestWith.bind(null, tree, opts),
    prevWith: prevWith.bind(null, tree, opts),
    nextWith: nextWith.bind(null, tree, opts),

    // traverse nodes
    nextNode: nextNode.bind(null, tree, opts),
    prevNode: prevNode.bind(null, tree, opts),

    lastNode: lastNode.bind(null, tree, opts),

    // return nodes
    readPath: readPath.bind(null, tree, opts),
    read: readPath.bind(null, tree, opts), // alias
    childNodes: childNodes.bind(null, tree, opts),
    children: childNodes.bind(null, tree, opts), // alias

    // query nodes
    has: has.bind(null, tree, opts),

    // for plugins
    _tree: tree
  }
}

// traverse nodes
function nextNode (obj, opts, path) {
  if (!obj || !obj.length) {
    return null
  }

  if (!path || !path.length || !isValidPath(path)) {
    return [0]
  }

  if (hasChildren(obj, opts, path)) {
    return path.concat([0])
  }

  var sibling = nextSiblingPath(path)
  if (readPath(obj, opts, sibling)) {
    return sibling
  }

  var parent = path
  while ((parent = nextParentPath(parent))) {
    if (readPath(obj, opts, parent)) {
      return parent
    }
  }

  if (readPath(obj, opts, parent)) {
    return parent
  }

  return null
}

function prevNode (obj, opts, path) {
  if (!obj || !obj.length) {
    return null
  }

  if (!path || !path.length) {
    return lastNode(obj, opts, [obj.length - 1])
  }

  var sibling = lastNode(obj, opts, prevSiblingPath(path))
  if (readPath(obj, opts, sibling)) {
    return sibling
  }

  var parent = parentPath(path)

  while (parent && !readPath(obj, opts, parent)) {
    parent = parentPath(parent)
  }

  if (parent) {
    return parent
  }

  if (!isValid(path[0])) {
    return nextNode(obj, opts)
  }

  if (path[0] > obj.length - 1) {
    return lastNode(obj, opts, [obj.length - 1])
  }

  return null
}

function lastNode (obj, opts, path) {
  if (!path || !readPath(obj, opts, path)) {
    return null
  }

  var base = path.slice(0), current = base

  while (
    (path = nextNode(obj, opts, path)) &&
    (isEqual(base, path.slice(0, base.length)))
  ) {
    current = path
  }
  return validPath(current)
}

// traverse options
function prevWith (obj, opts, prop, path) {
  if (!path || has(obj, opts, prop, path)) {
    path = prevNode(obj, opts, path)
  }

  while (path && !has(obj, opts, prop, path)) {
    path = prevNode(obj, opts, path)
  }
  return path
}

function nextWith (obj, opts, prop, path) {
  if (!path || has(obj, opts, prop, path)) {
    path = nextNode(obj, opts, path)
  }

  while (path && !has(obj, opts, prop, path)) {
    path = nextNode(obj, opts, path)
  }
  return path
}

function nearestWith (obj, opts, prop, orig) {
  var path

  if (!obj || !obj.length) {
    return null
  }

  if (!orig) {
    orig = nextNode(obj, opts, orig)
  }

  path = orig.slice(0)

  while (path && !has(obj, opts, prop, path)) {
    path = nextNode(obj, opts, path)
  }

  if (!path) {
    path = orig
    while (path && !has(obj, opts, prop, path)) {
      path = prevNode(obj, opts, path)
    }
  }

  return path
}

// get paths - siblings
function prevSiblingPath (path) {
  if (!path) {
    return null
  }

  path = path.slice(0)
  path[path.length - 1]--
  return validPath(path)
}

function nextSiblingPath (path) {
  if (!path) {
    return null
  }

  path = path.slice(0)
  path[path.length - 1]++
  return path
}

// get paths - parents
function parentPath (path) {
  if (path.length === 1) {
    return null
  }

  return validPath(path.slice(0, path.length - 1))
}

function prevParentPath (path) {
  if (path.length === 1) {
    return validPath([path[0] - 1])
  }

  path = path.slice(0, path.length - 1)
  path[path.length - 1]--
  return validPath(path)
}

function nextParentPath (path) {
  if (path.length === 1) {
    return null
  }

  path = path.slice(0, path.length - 1)
  path[path.length - 1]++
  return path
}

// returning nodes
function readPath (obj, opts, path) {
  if (!path || !obj) {
    return null
  }

  if (!isValid(path[0])) {
    return null
  }

  var node = obj[path[0]]
  for (var i = 1; i < path.length; i++) {
    if (!isValid(path[i])) {
      return null
    }

    if (node) {
      node = node[opts.optionField][path[i]]
    }
  }
  return node || null
}

function childNodes (obj, opts, path, nodes) {
  // return all children
  if (!path) {
    nodes = []
    for (var i = 0; i < obj.length; i++) {
      childNodes(obj, opts, [i], nodes)
    }
    return nodes
  }

  // passed a path that pointed nowhere
  if (!readPath(obj, opts, path)) {
    return null
  }

  var node, base = path.slice(0), current = base
  nodes = nodes || []

  while (
    (path = nextNode(obj, opts, path)) &&
    (isEqual(base, path.slice(0, base.length)))
  ) {
    node = readPath(obj, opts, path)
    nodes.push(node)
  }
  return nodes
}

// node queries
function hasChildren (obj, opts, path) {
  var node = readPath(obj, opts, path)
  return node && node[opts.optionField] && node[opts.optionField].length
}

function has (obj, opts, prop, path) {
  var node = readPath(obj, opts, path)
  return node && node[prop]
}

// validation
function validPath (path) {
  if (isValidPath(path)) {
    return path
  }

  return null
}

function isValidPath (path) {
  for (var i = path.length - 1; i >= 0; i--) {
    if (!isValid(path[i])) {
      return false
    }
  }
  return true
}

function isValid (point) {
  return point >= 0
}

// comparison
function isEqual (a, b) {
  if (!a || !b) {
    return false
  }

  for (var i = a.length - 1; i >= 0; i--) {
    if (a[i] !== b[i]) {
      return false
    }
  }
  return true
}
