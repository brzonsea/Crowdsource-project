var cy = cytoscape({

  container: document.getElementById('structure-map'), // container to render in

  elements: [ // list of graph elements to start with
    {
      data: {
        id: 'a',
        label: 'A',
        description: 'Quality control are methods to ensure high quality of crowd workers contributions.'
      }
    }, {
      data: {
        id: 'b',
        label: 'B',
        description: 'Quality control are methods to ensure high quality of crowd workers contributions.'
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

cy.nodes().on('mouseover', function(evt) {
  var anchor = document.createElement('div');
  anchor.className = 'anchor';
  
  var targetPosition = evt.target.renderedPosition();
  anchor.style.left = targetPosition.x  +'px';
  anchor.style.top = (targetPosition.y + 50) +'px';
  
  document.getElementById('structure-map').appendChild(anchor);
  
  var div = document.createElement('div');

  div.id = 'node-popup';
  div.innerHTML = evt.target.data().description;

  anchor.appendChild(div);
});

cy.nodes().on('mouseout', function(evt) {
  var popup = document.getElementById('node-popup');
  var anchor = popup.parentNode;
  var structureMap = document.getElementById('structure-map');

  anchor.removeChild(popup);
  structureMap.removeChild(anchor);
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