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

/**
 * State variable, signalling if the user is currently defining a relationship
 */
cy.definingRelationship = 0;
cy.relationshipSource = null;

cy.nodes().on('click', function(evt) {
  switch (evt.cy.definingRelationship) {
    case 0:
      addNode(evt);
      break;
    case 1:
      cy.relationshipSource = evt.target.id();
      cy.definingRelationship += 1;
      break;
    case 2:
      addRelationship(evt);
      cy.definingRelationship = 0;
      break;
    default:
      console.log("onClick; bad switch case");
      break;

  }
});

function addNode(evt) {
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
}

function addRelationship(evt) {
  evt.cy.add({
    group: 'edges',
    data: {
      source: evt.cy.relationshipSource,
      target: evt.target.id()
    },
    style: {
      'curve-style': 'bezier', //needed so arrows are drawn
      'source-arrow-shape': 'triangle',
      'source-arrow-color': 'grey',
      'target-arrow-shape': 'triangle',
      'target-arrow-color': 'grey',
    }
  });
  document.getElementById('relationshipButton').style = null;
}

function defRelationship() {
  if (cy.definingRelationship == 0) {
    cy.definingRelationship = 1;
    document.getElementById('relationshipButton').style.backgroundColor = 'lightblue';
  } else {
    cy.definingRelationship = 0;
    document.getElementById('relationshipButton').style = null;
  }
}