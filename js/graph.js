var setSidebarVisible = function(setVisible, nodeInput) {
	var nodeStyle = (setVisible && nodeInput) ? null : 'none';
	var edgeStyle = (setVisible && !nodeInput) ? null : 'none';

	document.getElementById('sidebarNodeInput').style.display = nodeStyle;
	document.getElementById('sidebarRelInput').style.display = edgeStyle;
}

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
	name: 'testname'
}

function toRenderedPosition(pos) {
	return {
		x: pos.x * cy.zoom() + cy.pan().x,
		y: pos.y * cy.zoom() + cy.pan().y,
	};
}
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
			if (event.target.isNode()) {
				nodeOnSingleClick(event);
			} else {
				edgesOnSingleClick(event);
			}
		}, 300);
		clickedBefore = clickedNow;
	}
}

var nodeOnSingleClick = function(evt) {
	switch (evt.cy.definingRelationship) {
		case 0:
			setSidebarVisible(true, true);
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
		setPopupEventListeners();
	} else {
		var anchor = document.createElement('div');
		anchor.className = 'anchor';

		var targetPosition = null;
		var yOffset = 50;
		if (event.target.isNode()) {
			targetPosition = event.target.renderedPosition();
		} else {
			targetPosition = toRenderedPosition(event.target.midpoint());
			yOffset = 0;
		}
		anchor.style.left = targetPosition.x + 'px';
		anchor.style.top = (targetPosition.y + yOffset * cy.zoom()) + 'px';

		document.getElementById('structure-map').appendChild(anchor);

		var div = document.createElement('div');

		div.id = 'node-popup-' + event.target.id();
		div.className = 'node-popup';
		div.innerHTML = event.target.data().summary;

		anchor.appendChild(div);

		if (event.target.isEdge()) {
			var selectorIDs = '#' + event.target.data('source') + ',#' + event.target.data('target');
			cy.elements(selectorIDs).on('position', updatePopupPosition.bind({
				'targetID': event.target.id()
			}));
		}

		event.target.on('position', updatePopupPosition.bind({
			'targetID': event.target.id()
		}));
		cy.on('pan zoom resize', updatePopupPosition.bind({
			'targetID': event.target.id()
		}));
		event.target.on('data', updatePopupContent.bind({
			'targetID': event.target.id()
		}));
		event.target.data().detailsVisible = true;
	}
}
var edgesOnSingleClick = function(event) {
	setSidebarVisible(true, false);
	cy.activeNode = event.target;
	document.getElementById('descrInput').value = cy.activeNode.data('summary');
}

var updatePopupPosition = function(event) {
	var target = cy.getElementById(this.targetID);
	var targetposition = null;
	var yOffset = 50;
	if (target.isNode()) {
		targetPosition = target.renderedPosition();
	} else {
		targetPosition = toRenderedPosition(target.midpoint());
		yOffset = 0;
	}
	var popup = document.getElementById('node-popup-' + target.id());
	if (popup) {
		var anchor = popup.parentNode;
		anchor.style.left = targetPosition.x + 'px';
		anchor.style.top = (targetPosition.y + yOffset * cy.zoom()) + 'px';
	}
}
var updatePopupContent = function(event) {
	var target = cy.getElementById(this.targetID);
	var popup = document.getElementById('node-popup-' + target.id());
	if (popup) {
		popup.innerHTML = target.data().summary;
	}
}
var setPopupEventListeners = function() {
	var elements = cy.elements();
	cy.off('pan zoom resize');
	elements.off('position data');

	for (var i = elements.length - 1; i >= 0; i--) {
		if (elements[i].data('detailsVisible')) {
			if (elements[i].isEdge()) {
				var selectorIDs = '#' + elements[i].data('source') + ',#' + elements[i].data('target');
				cy.elements(selectorIDs).on('position', updatePopupPosition.bind({
					'targetID': elements[i].id()
				}));
			}

			elements[i].on('position', updatePopupPosition.bind({
				'targetID': elements[i].id()
			}));
			cy.on('pan zoom resize', updatePopupPosition.bind({
				'targetID': elements[i].id()
			}));
			elements[i].on('data', updatePopupContent.bind({
				'targetID': elements[i].id()
			}));
		}
	}
}

function addNode() {
	cy.off('add remove free data');
	// console.log('activeNode', cy.activeNode);
	// lock the nodes to apply layout only on new node later
	cy.nodes().lock();
	// add the new node
	var element = cy.add({
		group: "nodes",
		data: {
			label: "New Node",
			summary: "Summary...",
			childNode: []
		}
	});
	if (!cy.activeNode.data('childNode')) {
		cy.activeNode.data('childNode', []);
	}
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
	element.on('doubleClick', nodesOnDoubleClick);
	cy.on('add remove free data', saveMap);
	saveMap(null);
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
	if (!(null == summaryTimeout)) {
		clearTimeout(summaryTimeout);
		summaryTimeout = setTimeout(updateSummary.bind(this), 300);
	} else {
		summaryTimeout = setTimeout(updateSummary.bind(this), 300);
	}
}
var summaryInput = document.getElementById('summaryInput');
var summaryTimeout = null;
summaryInput.oninput = startSummaryTimeout;

var updateDescription = function() {
	cy.activeNode.data('summary', this.value);
}
var startDescriptionTimeout = function() {
	if (!(null == descriptionTimeout)) {
		clearTimeout(descriptionTimeout);
	}
	descriptionTimeout = setTimeout(updateDescription.bind(this), 300);
}
var descriptionInput = document.getElementById('descrInput');
var descriptionTimeout = null;
descriptionInput.oninput = startDescriptionTimeout;

function addRelationship(evt) {
	var edges = cy.edges();
	for (var i = edges.length - 1; i >= 0; i--) {
		console.log(edges[i]);
		if (edges[i].data('source') == evt.cy.relationshipSource && edges[i].data('target') == evt.target.id() || edges[i].data('target') == evt.cy.relationshipSource && edges[i].data('source') == evt.target.id()) {
			evt.cy.getElementById(evt.cy.relationshipSource).removeStyle();
			document.getElementById('relationshipButton').style = null;
			return;
		}
	}
	var element = evt.cy.add({
		group: 'edges',
		data: {
			source: evt.cy.relationshipSource,
			target: evt.target.id(),
			isEdge: false,
			summary: 'Description...',
			detailsVisible: false,
		},
		style: relationshipStyle,
	});
	document.getElementById('relationshipButton').style = null;
	element.on('click', nodeOnClick);
	element.on('doubleClick', nodesOnDoubleClick);
	evt.cy.getElementById(evt.cy.relationshipSource).removeStyle();
	// console.log(cy.edges());
}

function deleteNode() {
	if (confirm("This will delete the current node and all its child nodes!") == true) {
		var nodesToDelete = [];
		var targetNode = cy.activeNode;
		nodesToDelete.push(targetNode);

		if (cy.activeNode.data().detailsVisible) {
			var event = {
				'target': cy.activeNode
			};
			nodesOnDoubleClick(event);
		}

		for (var i = 0; i < nodesToDelete.length; i++) {
			targetNode = nodesToDelete[i];
			if (targetNode.data("childNode") != null) {
				var targetChildren = targetNode.data("childNode");
				for (var j = 0; j < targetChildren.length; j++) {
					nodesToDelete.push(cy.getElementById(targetChildren[j]));
				}
			}
		}

		for (var i = nodesToDelete.length - 1; i >= 0; i--) {
			cy.remove(cy.getElementById(nodesToDelete[i].id()));
		}
		setSidebarVisible(false, false);
		cy.activeNode = null;
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

function deleteRelationship() {
	if (confirm("Do you really want to delete the relationship?") == true) {
		if (cy.activeNode.data().detailsVisible) {
			var event = {
				'target': cy.activeNode
			};
			nodesOnDoubleClick(event);
		}
		cy.remove(cy.activeNode);
		cy.activeNode = null;
		setSidebarVisible(false, false);
	}
}

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
	for (var i = mapJSON.elements.nodes.length - 1; i >= 0; i--) {
		delete mapJSON.elements.nodes[i].data.detailsVisible;
	}
	for (var i = mapJSON.elements.edges.length - 1; i >= 0; i--) {
		delete mapJSON.elements.edges[i].data.detailsVisible;
	}

	mapref.transaction(function(currentData) {
		return {
			'username': user.name,
			'name': cy.mapName,
			'json': mapJSON,
		}
	}); // end transaction
} // end saveMap

var relationshipStyle = {
	'curve-style': 'bezier', //needed so arrows are drawn
	'source-arrow-shape': 'triangle',
	'source-arrow-color': '#00519e',
	'target-arrow-shape': 'triangle',
	'target-arrow-color': '#00519e',
	'line-color': '#00519e'
};

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

cy.mapName = 'Andreas_and_the_Chocolate_Factory';
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
			cy.zoom(1);
			cy.fit();
		}
	});
}).then(function() {

	cy.on('click', function(evt) {
		if (!evt.target.group) {
			setSidebarVisible(false, false);
			cy.activeNode = null;
		}
	});

	cy.nodes().on('click', nodeOnClick);

	cy.nodes().on('doubleClick', nodesOnDoubleClick);

	for (var i = 0; i < cy.edges().length; i++) {
		var edge = cy.edges()[i];
		if (edge.data("isEdge") != null && edge.data("isEdge") == false) {
			edge.on("click", nodeOnClick);
			edge.on('doubleClick', nodesOnDoubleClick);
			edge.style(relationshipStyle);
		}
	}

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
}); // end then



function feedback() {
	//var pop_up = document.getElementById('pop_up');
	document.getElementById('popup').style.display = 'block';
}

function submit_feedback() {
	var text = document.getElementById('feedback_text').value;
	var feedref = database.ref("accounts/" + user.name + "/feedback");
	//var time = Date.now();
	if (text.value != "") {
		feedref.push({
			text: text,
			//	time: time.getSeconds() + "/" + time.getMinutes() + "/" + time.getHours() + "/" + time.getDate() + "/" + time.getMonth()
		});
		text = "";
	}
	document.getElementById('popup').style.display = "None";
}

function close_feedback() {
	document.getElementById('popup').style.display = "None";
}

function fitmap() {
	cy.fit();
}

function deletemap() {
	var ref = database.ref();
	ref.child("accounts").once("value", function(accounts) {
		accounts.forEach(function(account) {
			account.forEach(function(map) {
				if (map.val().name == cy.mapName) {
					database.ref("accounts/" + account.key + "/" + map.key).remove();
				}
			});
		});
	}).then(function() {
		ref.child("maps").once("value", function(maps) {
			maps.forEach(function(map) {
				if (map.val().name == cy.mapName) {
					database.ref("maps/" + map.key).remove();
				}
			});
		}).then(function() {
			window.location = "./Map_list.html?username=" + user.name;
		});
	});
}

function help() {
	document.getElementById('help_popup').style.display = 'block';
}

function close_help() {
	document.getElementById('help_popup').style.display = 'None';
}
