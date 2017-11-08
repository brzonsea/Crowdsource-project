var cy = cytoscape({

  container: document.getElementById('structure-map'), // container to render in

  elements: [ // list of graph elements to start with
    {
      data: {
        id: 'a',
        label: 'A'
      }
    }, {
      data: {
        id: 'b',
        label: 'B'
      }
    }, {
      data: {
        id: 'c',
        label: 'C'
      }
    }, {
      data: {
        id: 'd',
        label: 'D'
      }
    }, {
      data: {
        id: 'e',
        label: 'E'
      }
    }, {
      data: {
        id: 'ab',
        source: 'a',
        target: 'b'
      }
    }, {
      data: {
        id: 'ac',
        source: 'a',
        target: 'c'
      }
    }, {
      data: {
        id: 'ad',
        source: 'a',
        target: 'd'
      }
    }, {
      data: {
        id: 'bd',
        source: 'b',
        target: 'd'
      }
    }, {
      data: {
        id: 'bc',
        source: 'b',
        target: 'c'
      }
    }, {
      data: {
        id: 'ce',
        source: 'c',
        target: 'e'
      }
    },
  ],

  style: [ // the style-sheet for the graph
    {
      selector: 'node',
      style: {
        'background-color': '#666',
        'label': 'data(label)'
      }
    },

    {
      selector: 'edge',
      style: {
        'width': 3,
        'line-color': '#ccc',
        'target-arrow-color': '#ccc',
        'target-arrow-shape': 'triangle'
      }
    }
  ],

  layout: {
    name: 'cose'
  }

});

var clickhandler = function(evt) {

}

cy.on('click', function(evt) {
  // lock the nodes to apply layout only on new node later
  evt.cy.nodes().lock();
  // add the new node
  var element = evt.cy.add({
    group: "nodes",
    data: {
      label: "New Node"
    }
  });
  // add edge between new node and target
  evt.cy.add({
    group: 'edges',
    data: {
      source: element.id(),
      target: evt.target.id()
    }
  });
  // apply layout to move new node to appropriate position
  var layout = cy.layout({
    name: 'cose'
  });
  layout.run();
  // unlock all nodes so the user can move them
  evt.cy.nodes().unlock();
});
