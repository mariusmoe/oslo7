
var Node = function(data) {
    this.data = data;
    // this.id = id;
    this.parent = null;
    this.children = [];
}

var Tree = function(data) {
    var node = new Node(data);
    this._root = node;
}


Tree.prototype.traverseDF = function(callback) {

    // this is a recurse and immediately-invoking function
    (function recurse(currentNode) {
        // step 2
        for (var i = 0, length = currentNode.children.length; i < length; i++) {
            // step 3
            recurse(currentNode.children[i]);
        }

        // step 4
        callback(currentNode);

        // step 1
    })(this._root);

};


// TODO impove this function
Tree.prototype.leafNodeNames = function(callback) {
  (function recurse(currentNode) {
      if (currentNode.children.length === 0) {
        let parentString =  [];
        (function _recurse(_currentNode) {
            if (_currentNode.parent) {
                parentString.push(_currentNode.data);
                _recurse(_currentNode.parent);
            } else {
              parentString.push(_currentNode.data);
            }
        })(currentNode);
        callback( parentString.reverse())
      }
      for (var i = 0, length = currentNode.children.length; i < length; i++) {
          recurse(currentNode.children[i]);
      }
  })(this._root);
};


Tree.prototype.contains = function(callback, traversal) {
    traversal.call(this, callback);
};

Tree.prototype.add = function(data, toData, traversal) {
    var child = new Node(data),
        parent = null,
        callback = function(node) {
            if (node.data === toData) {
                parent = node;
            }
        };

    this.contains(callback, traversal);

    if (parent) {
        parent.children.push(child);
        child.parent = parent;
    } else {
        throw new Error('Cannot add node to a non-existent parent.');
    }
};


Tree.prototype.remove = function(data, fromData, traversal) {
    var tree = this,
        parent = null,
        childToRemove = null,
        index;

    var callback = function(node) {
        if (node.data === fromData) {
            parent = node;
        }
    };

    this.contains(callback, traversal);

    if (parent) {
        index = findIndex(parent.children, data);

        if (index === undefined) {
            throw new Error('Node to remove does not exist.');
        } else {
            childToRemove = parent.children.splice(index, 1);
        }
    } else {
        throw new Error('Parent does not exist.');
    }

    return childToRemove;
};

function findIndex(arr, data) {
    var index;

    for (var i = 0; i < arr.length; i++) {
        if (arr[i].data === data) {
            index = i;
        }
    }

    return index;
}

module.exports.Node = Node;
module.exports.Tree = Tree;
