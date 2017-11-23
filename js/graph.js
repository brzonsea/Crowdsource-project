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
				summary: 'Quality control are methods to ensure high quality of crowd workers contributions.',
				childNode: 'b',
			}
		}, {
			data: {
				id: 'b',
				label: 'B',
				summary: 'Quality control are methods to ensure high quality of crowd workers contributions.',
				childNode: 'c',
			}
		}, {
			data: {
				id: 'c',
				label: 'C',
				childNode: 'd',
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
				target: 'b',
				isEdge: true
			}
		}, {
			data: {
				id: 'ac',
				source: 'a',
				target: 'c',
				isEdge: true
			}
		}, {
			data: {
				id: 'ad',
				source: 'a',
				target: 'd',
				isEdge: true
			}
		}, {
			data: {
				id: 'bd',
				source: 'b',
				target: 'd',
				isEdge: true
			}
		}, {
			data: {
				id: 'bc',
				source: 'b',
				target: 'c',
				isEdge: true
			}
		}, {
			data: {
				id: 'ce',
				source: 'c',
				target: 'e',
				isEdge: true
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

var setSidebarVisible = function(setVisible) {
	var displayStyle = setVisible ? null : 'none';
	var children = document.getElementById('mySidebar').querySelectorAll('*');
	var addNodeButton = document.getElementById("addNodeButton");
	for (var i = children.length - 1; i >= 0; i--) {
		if (children[i].id != 'relationshipButton') {
			children[i].style.display = displayStyle;
		}
	}
	addNodeButton.style.display = displayStyle;
}

window.onload = function() {
	setSidebarVisible(false);
	console.log(cy.nodes());
}


cy.on('click', function(evt) {
	if (!evt.target.group) {
		setSidebarVisible(false);
		cy.activeNode = null;
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

var clickedBefore;
var clickedTimeout;
var nodeOnClick = function(event) {
	var clickedNow = event.target;
	if (clickedTimeout && clickedBefore) {
		clearTimeout(clickedTimeout);
	}
	if (clickedBefore === clickedNow) {
		clickedNow.trigger('doubleClick');
		clickedBefore = null;
	} else {
		clickedTimeout = setTimeout(function() {
			clickedBefore = null;
			nodeOnSingleClick(event);
		}, 300);
		clickedBefore = clickedNow;
	}
}
cy.nodes().on('click', nodeOnClick);

cy.nodes().on('doubleClick', function(event) {
	console.log('Node doubleclicked.');
	if (event.target.data().detailsVisible) {
		var popup = document.getElementById('node-popup-' + event.target.id());
		if (popup) {
			var anchor = popup.parentNode;
			var structureMap = document.getElementById('structure-map');

			anchor.removeChild(popup);
			structureMap.removeChild(anchor);
		}
		event.target.data().detailsVisible = false;
	} else {
		var anchor = document.createElement('div');
		anchor.className = 'anchor';

		var targetPosition = event.target.renderedPosition();
		anchor.style.left = targetPosition.x + 'px';
		anchor.style.top = (targetPosition.y + 50 * cy.zoom()) + 'px';

		document.getElementById('structure-map').appendChild(anchor);

		var div = document.createElement('div');

		div.id = 'node-popup-' + event.target.id();
		div.className = 'node-popup';
		div.innerHTML = event.target.data().summary;

		anchor.appendChild(div);

		cy.on('position', '#' + event.target.id(), function(event) {
			var targetPosition = event.target.renderedPosition();
			var popup = document.getElementById('node-popup-' + event.target.id());
			var anchor = popup.parentNode;
			anchor.style.left = targetPosition.x + 'px';
			anchor.style.top = (targetPosition.y + 50 * cy.zoom()) + 'px';
		});
		event.target.data().detailsVisible = true;
	}
});

var nodeOnSingleClick = function(evt) {
	console.log('Node clicked.');

	switch (evt.cy.definingRelationship) {
		case 0:
			setSidebarVisible(true);
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
};

// TODO own onClick function needed?
cy.edges().on('click', nodeOnSingleClick);

function addNode() {
	console.log('activeNode', cy.activeNode);
	// lock the nodes to apply layout only on new node later
	cy.nodes().lock();
	// add the new node
	var element = cy.add({
		group: "nodes",
		data: {
			label: "New Node",
		}
	});
	cy.activeNode.data('childNode', element.id());
	// add edge between new node and target
	var edge = cy.add({
		group: 'edges',
		data: {
			source: element.id(),
			target: cy.activeNode.id()
		}
	});
	// apply layout to move new node to appropriate position
	var layout = cy.layout({
		name: 'cose'
	});
	layout.run();
	// unlock all nodes so the user can move them
	cy.nodes().unlock();
	console.log(cy.nodes());
	element.on('click', nodeOnClick);
}

updateTitle = function() {
	cy.activeNode.data('label', this.value);
}
var titleInput = document.getElementById('titleInput');
titleInput.oninput = updateTitle;

updateSummary = function() {
	cy.activeNode.data('summary', this.value);
}
var summaryInput = document.getElementById('summaryInput');
summaryInput.oninput = updateSummary;

function addRelationship(evt) {
	evt.cy.add({
		group: 'edges',
		data: {
			source: evt.cy.relationshipSource,
			target: evt.target.id(),
			isEdge: false
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
	// console.log(cy.edges());
}

function deleteNode() {
	if (confirm("This will delete the current node and all its child nodes!") == true) {
		var nodesToDelete = [];
		var targetNode = cy.activeNode;
		nodesToDelete.push(targetNode.id());

		while (targetNode.data().childNode != undefined) {
			targetNode = cy.getElementById(targetNode.data().childNode);
			nodesToDelete.push(targetNode.id());
		}
		cy.nodes().forEach(function(ele) {
			if (ele.data().childNode == cy.activeNode.id()) {
				delete ele.data().childNode;
			}
		});
		for (var i = nodesToDelete.length - 1; i >= 0; i--) {
			cy.remove(cy.getElementById(nodesToDelete[i]));
		}
	} else {
		return;
	}
}

function defRelationship() {
	if (cy.definingRelationship == 0) {
		if (cy.activeNode == null) {
			// no active Node
			cy.definingRelationship = 1;
		} else {
			// active Node will automatically be source of relationship
			cy.definingRelationship = 2;
			cy.relationshipSource = cy.activeNode.id();
		}
		document.getElementById('relationshipButton').style.backgroundColor = 'lightblue';
	} else {
		if (cy.definingRelationship == 2 && cy.activeNode == null) {
			cy.getElementById(cy.relationshipSource).removeStyle();
		}
		cy.definingRelationship = 0;
		document.getElementById('relationshipButton').style = null;
	}
}

function saveMap() {
	var mapref = database.ref("maps2");

	var mapJson = cy.json();

	for (obj in mapJson) {
		if (mapJson[obj] == undefined) {
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
		cy.nodes().on('click', nodeOnClick);
	});
}
