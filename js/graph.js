// Initialize Firebase
var config = {

	apiKey: "AIzaSyCtsjLF75Sz-rqZapJHoj7WkfIrkI3bAmE",
	authDomain: "adipro-5bbe6.firebaseapp.com",
	databaseURL: "https://adipro-5bbe6.firebaseio.com",
	projectId: "adipro-5bbe6",
	storageBucket: "",
	messagingSenderId: "14626937593"

};

firebase.initializeApp(config);
var database = firebase.database();

var user = {
	name: 'MisterSmart'
}

var cy = cytoscape({

	container: document.getElementById('structure-map'), // container to render in

	elements: [ // list of graph elements to start with
		{
			data: {
				id: 'a',
				label: 'A',
				summary: 'Quality control are methods to ensure high quality of crowd workers contributions.'
			}
		}, {
			data: {
				id: 'b',
				label: 'B',
				summary: 'Quality control are methods to ensure high quality of crowd workers contributions.'
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
				'background-color': 'white',
				'label': 'data(label)',
				'shape': 'ellipse',
				'width': '10em',
				'height': '5em',
				'text-halign': 'center',
				'text-valign': 'center',
				'text-max-width': '10em',
				'text-wrap': 'wrap',
			}
		},

		{
			selector: 'edge',
			style: {
				'width': 3,
				'line-color': 'grey',
			}
		}
	],

	layout: {
		name: 'cose',
	},

});

var setSidebarVisible = function(setVisible){
	var displayStyle = setVisible ? null : 'none';
	var children = document.getElementById('mySidebar').querySelectorAll('*');
	for (var i = children.length - 1; i >= 0; i--) {
		children[i].style.display = displayStyle;
	}
}

window.onload = function(){
	setSidebarVisible(false);
}

cy.on('click', function(evt){
	if (!evt.target.group) {
		setSidebarVisible(false);
	}
});

cy.activeNode = null;

/**
 * State variable, signalling if the user is currently defining a relationship
 * 0: not defining relationship
 * 1: defining relationship; start node NOT specified
 * 2: defining relationship; start node was specified
 */
cy.definingRelationship = 0;
cy.relationshipSource = null;

cy.nodes().on('click', function(evt) {
	setSidebarVisible(true);

	switch (evt.cy.definingRelationship) {
		case 0:
			cy.activeNode = evt.target;
			document.getElementById('titleInput').value = cy.activeNode.data('label');
			document.getElementById('summaryInput').value = cy.activeNode.data('summary');
			break;
		case 1:
			cy.relationshipSource = evt.target.id();
			evt.target.style('background-color', 'lightblue');
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
	anchor.style.left = targetPosition.x + 'px';
	anchor.style.top = (targetPosition.y + 50) + 'px';

	document.getElementById('structure-map').appendChild(anchor);

	var div = document.createElement('div');

	div.id = 'node-popup';
	div.innerHTML = evt.target.data().summary;

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

updateTitle = function(){
	cy.activeNode.data('label', this.value);
}
var titleInput = document.getElementById('titleInput');
titleInput.oninput = updateTitle;

updateSummary = function(){
	cy.activeNode.data('summary', this.value);
}
var summaryInput = document.getElementById('summaryInput');
summaryInput.oninput = updateSummary;

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
	evt.cy.getElementById(evt.cy.relationshipSource).removeStyle();
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

function saveMap() {
	var mapref = database.ref("maps2");

	var mapJson = cy.json();

	for (obj in mapJson) {
	 	if(mapJson[obj] == undefined) {
	 		delete mapJson[obj];
	 	}
	 }

	mapref.push({
		name: user.name,
		json: mapJson,
	});
}

function loadMap() {
	var mapref = database.ref("maps2");

	var myMap = mapref.once('value', function(maps) {
		var map;
		maps.forEach(function(child) {
			if (child.val().name == user.name) {
				map = child.val().json;
			}
		})	
		cy = cytoscape({
			container: document.getElementById('structure-map'), // container to render in
		});
		cy.json(map);
	});
}
