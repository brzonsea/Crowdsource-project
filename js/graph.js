var cy = cytoscape({

  container: document.getElementById('structure-map'), // container to render in

  elements: [ // list of graph elements to start with
    { // node a
      data: { id: 'a' }
    },
    { // node a
      data: { id: 'b' }
    },
    { // node a
      data: { id: 'c' }
    },
    { // node a
      data: { id: 'd' }
    },
    { // node b
      data: { id: 'e' }
    },
    { // edge ab
      data: { id: 'ab', source: 'a', target: 'b' }
    },
    { // edge ab
      data: { id: 'ac', source: 'a', target: 'c' }
    },
    { // edge ab
      data: { id: 'ad', source: 'a', target: 'd' }
    },
    { // edge ab
      data: { id: 'bd', source: 'b', target: 'd' }
    },
    { // edge ab
      data: { id: 'bc', source: 'b', target: 'c' }
    },
    { // edge ab
      data: { id: 'ce', source: 'c', target: 'e' }
    },
  ],

  style: [ // the stylesheet for the graph
    {
      selector: 'node',
      style: {
        'background-color': '#666',
        'label': 'data(id)'
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
