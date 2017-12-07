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
	name: getValue('username')
}

function gotoMapList() {
	window.location = 'Map_list.html?username=' + user.name;
}

function toRenderedPosition(pos) {
	return {
		x: pos.x * cy.zoom() + cy.pan().x,
		y: pos.y * cy.zoom() + cy.pan().y,
	};
}

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
				'curve-style': 'bezier', //needed so arrows are drawn
				'target-arrow-shape': 'triangle',
				'target-arrow-color': 'grey',
			}
		}
	],

	layout: {
		name: 'cose',
	},

});

cy.mapName = getValue('mapName');

// listen to map changes
var mapsref = database.ref("maps");

mapsref.once('value', function(maps) {
	maps.forEach(function(map) {
		if (map.val().name == cy.mapName) {
			cy.mapKey = map.key;
			cy.json(map.val().json);
			cy.fit();
			// if (cy.zoom() > 1) {
			// 	cy.zoom(1);
			// }
			console.log('Map initially loaded from DB.');
		}
	});
}).then(function() {

	cy.nodes().on('click', nodesOnDoubleClick);

	for (var i = 0; i < cy.edges().length; i++) {
		var edge = cy.edges()[i];
		if (edge.data("isEdge") != null && edge.data("isEdge") == false) {
			edge.on("click", nodesOnDoubleClick);
			edge.style(relationshipStyle);
		}
	}

	var firstLoad = true;

	var mapref = mapsref.child(cy.mapKey);
	mapref.on('value', function(map) {
		console.log('Change in database happened');
		if (!firstLoad) {
			if (map.val().username != user.name) {
				console.log('Updating map');
				cy.off('add remove free data');
				cy.json(map.val().json);
				cy.on('add remove free data', saveMap);
			}
		} else {
			// skip first load as we already load once in the beginning
			firstLoad = false;
		}
	}); // end mapref.on
}); // end then



function feedback() {
	//var pop_up = document.getElementById('pop_up');
	//document.getElementById('help_popup').style.display = 'None';
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
	//document.getElementById('help_popup').style.display = 'None';
}

function fitmap() {
	cy.fit();
}
