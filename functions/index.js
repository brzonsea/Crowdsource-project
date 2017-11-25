const functions = require('firebase-functions');

// // Create and Deploy Your First Cloud Functions
// // https://firebase.google.com/docs/functions/write-firebase-functions
//
// exports.helloWorld = functions.https.onRequest((request, response) => {
//  response.send("Hello from Firebase!");
// });

// The Firebase Admin SDK to access the Firebase Realtime Database. 
const admin = require('firebase-admin');
//const capture = require('capture');
const cy = require('cytoscape');
var cytosnap = require('cytosnap');
var snap = cytosnap();
var jsonConcat = require("json-concat");

admin.initializeApp(functions.config().firebase);

var mapname;

// Listens for new messages added to /messages/:pushId/original and creates an
// uppercase version of the message to /messages/:pushId/uppercase
exports.makeCapture = functions.database.ref('/maps/{mapname}').onWrite(event => {
    
    // Grab the current value of what was written to the Realtime Database.
    const original = event.data.val();
    console.log('Capturing', event.params.mapname, original);
    
    // var mapref = functions.database.ref("/maps/{map-name}");
    // mapref.once("value", function(snapShot){
	   //  	var cytomap = snapShot.val().json
	   //  });
	snap.start().then(function(){
	    	return snap.shot(jsonConcat(event.data.val().json, {resolvesTo: 'base64uri',
		    format: 'png',
		    width: 640,
		    height: 480,
		    background: 'transparent'}))}).then(function( img ){
		  // do whatever you want with img
		  console.log( img );
		});
    // You must return a Promise when performing asynchronous tasks inside a Functions such as
    // writing to the Firebase Realtime Database.
    // Setting an "uppercase" sibling in the Realtime Database returns a Promise.
    //return event.data.ref.parent.child('uppercase').set(uppercase);
    });

// exports.makeCapture_addedMap = Mapsref.on('childadded', function(data){
// 	snap.start().then(function(){
// 	    	return snap.shot(jsonConcat(data.val().json, {resolvesTo: 'base64uri',
// 		    format: 'png',
// 		    width: 640,
// 		    height: 480,
// 		    background: 'transparent'}))}).then(function( img ){
// 		  // do whatever you want with img
// 		  console.log( img );
// 		});
// });
