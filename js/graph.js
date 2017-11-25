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
	name: 'MisterStupid'
}

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


setSidebarVisible(false);

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
var nodeOnSingleClick = function(evt) {

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
var nodesOnDoubleClick = function(event) {
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
}

function addNode() {
	// lock the nodes to apply layout only on new node later
	cy.nodes().lock();
	// add the new node
	var element = cy.add({
		group: "nodes",
		data: {
			label: "New Node",
			childNode: []
		}
	});
	cy.activeNode.data("childNode").push(element.id());
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
	element.on('click', nodeOnClick);
}

var updateTitle = function() {
	console.log('updating title');
	cy.activeNode.data('label', this.value);
}
var startTitleTimeout = function() {
	if (!(null == titleTimeout)) {
		clearTimeout(titleTimeout);
		titleTimeout = setTimeout(updateTitle.bind(this), 300);
	} else {
		titleTimeout = setTimeout(updateTitle.bind(this), 300);
	}
}
var titleInput = document.getElementById('titleInput');
var titleTimeout = null;
titleInput.oninput = startTitleTimeout;

var updateSummary = function() {
	cy.activeNode.data('summary', this.value);
}
var startSummaryTimeout = function() {
	if (!null == summaryTimeout) {
		clearTimeout(summaryTimeout);
		summaryTimeout = setTimeout(updateSummary.bind(this), 300);
	} else {
		summaryTimeout = setTimeout(updateSummary.bind(this), 300);
	}
}
var summaryInput = document.getElementById('summaryInput');
var summaryTimeout = null;
summaryInput.oninput = startSummaryTimeout;

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
		nodesToDelete.push(targetNode);

		for (var i = 0; i < nodesToDelete.length; i++) {
			targetNode = nodesToDelete[i];
			console.log(targetNode);
			if (targetNode.data("childNode") != null) {
				var targetChildren = targetNode.data("childNode");
				for (var j = 0; j < targetChildren.length; j++) {
					nodesToDelete.push(cy.getElementById(targetChildren[j]));
				}
			}
		}

		//for (var child in children) {
		//	console.log(child.id());
		//}

		// while (children.length !== 0) {
		// 	for (var child in targetNode.data("childNode")) {
		// 		nodesToDelete.push(child);
		// 		children.push(document.getElementById(child));
		// 	}
		// 	// targetNode = cy.getElementById(targetNode.data().childNode);
		// 	// nodesToDelete.push(targetNode.id());
		// }
		// cy.nodes().forEach(function(ele) {
		// 	if (ele.data().childNode == cy.activeNode.id()) {
		// 		delete ele.data().childNode;
		// 	}
		// });
		for (var i = nodesToDelete.length - 1; i >= 0; i--) {
			cy.remove(cy.getElementById(nodesToDelete[i].id()));
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

var cy = cytoscape({
	container: document.getElementById('structure-map'), // container to render in

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

cy.mapName = 'Crazy_Treasurehunt_Map';
cy.activeNode = null;
/**
 * State variable, signalling if the user is currently defining a relationship
 * 0: not defining relationship
 * 1: defining relationship; start node NOT specified
 * 2: defining relationship; start node was specified
 */
cy.definingRelationship = 0;
cy.relationshipSource = null;

// listen to map changes
var mapsref = database.ref("maps");

mapsref.once('value', function(maps) {
	maps.forEach(function(map) {
		if (map.val().name == cy.mapName) {
			cy.mapKey = map.key;
			cy.json(map.val().json);
		}
		console.log(cy.mapKey);
	});
}).then(function() {

	cy.on('click', function(evt) {
		if (!evt.target.group) {
			setSidebarVisible(false);
			cy.activeNode = null;
		}
	});

	cy.nodes().on('click', nodeOnClick);

	cy.nodes().on('doubleClick', nodesOnDoubleClick);

	// TODO own onClick function needed?
	cy.edges().on('click', nodeOnSingleClick);

	var mapref = mapsref.child(cy.mapKey);
	mapref.on('value', function(map) {
		console.log('Change in database happened');
		if (map.val().username != user.name) {
			console.log('updating map');
			cy.off('add remove free data');
			cy.json(map.val().json);
			cy.on('add remove free data', saveMap);
		}
	}); // end mapref.on

	// listen to all changes events on the map and save them
	cy.on('add remove free data', saveMap);

	function saveMap(evt) {
		console.log('Save Map');
		var mapref = database.ref("maps/" + cy.mapKey);

		var mapJSON = cy.json();
		for (obj in mapJSON) {
			if (mapJSON[obj] == undefined) {
				delete mapJSON[obj];
			}
		}

		console.log(mapJSON);
		delete mapJSON["zoom"];
		delete mapJSON["pan"];

		mapref.transaction(function(currentData) {
			return {
				'username': user.name,
				'name': cy.mapName,
				'json': mapJSON,
				'diff': {}
			}
		}); // end transaction
	} // end saveMap
}); // end then
