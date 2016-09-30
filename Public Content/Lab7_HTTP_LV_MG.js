// Variables for HTML elements
var canvas, context, meterBar, tempValTxt;
var intervalTimer;
var host = "192.168.1.2";	// The server host running the web service
//var host = "127.0.0.1";
offSet = {};			// The offset that creates the border rom the canvas edge
offSet.x = 0;
offSet.y = 0;
var graphHeight;			// The graph height
var graphWidth;				// The graph width 
var xScale;					// T
var yScale;
var increment  = 5;
var numPoints = 60;
var nextPoint = 0;

// Drawing Area
var	canvasWidth, canvasHeight;
var canvasBkGndColor = "#eeee00"; // Red-Green-Blue color in hex RRGGBB, 00=Black, FF=White
 
// Send HTTP GET request to LabView web service to return value from the sensor
function doHttpRequestForTempSensor (){
	var reqLV = new XMLHttpRequest();  // Make object to do this HTTP request
	reqLV.onreadystatechange = cbHttpReqListenerGetTempValAndPlot;
	reqLV.open("get", "http://" + host + ":8001/WebService1/Lab5_LV_TempSensor", true);			  
	reqLV.send();
}

// Initialize the program
function init(){
	// Get elements from HTML document
	canvas = document.getElementById("mainCanvas"); // Get from html doc
	canvasWidth = canvas.width;
	canvasHeight = canvas.height;
	offSet.x = canvasWidth * 0.05;
	offSet.y = canvasHeight * 0.05;
	graphHeight = canvasHeight - offSet.y;
	graphWidth = canvasWidth - offSet.x;
	context = canvas.getContext('2d');
	context.fillStyle = canvasBkGndColor;
	context.rect(0,0,canvasWidth,canvasHeight);   // Make a drawing area, and call it context
    context.fill();  // clear drawing area so only background color
	meterBar = document.getElementById("meterBar");
	tempValText = document.getElementById("tempValTxt");
	meterBar.value = 0; 
	xScale = (graphWidth - offSet.x) / numPoints ;
	yScale = graphHeight / (meterBar.max + offSet.y);
	drawAxisLines();											// Draw the axis lines on the graph
	context.moveTo (offSet.x, graphHeight);
	// Setup timer, so will periodically get new temperature value from the LabView program.
	intervalTimer = setInterval( doHttpRequestForTempSensor, 1000);  // Each 1 sec, send XMLHttpRequest to LabView for sensor value
}
// Plot new Temperature point on the Graph
function plotNewTempPt( newTempVal ){
	++nextPoint;
	if (nextPoint <= numPoints) {
		context.lineTo(offSet.x + nextPoint * xScale, graphHeight - newTempVal * yScale);
		context.stroke();
	} else {
		clearInterval(intervalTimer);
	}
}

// Find value string from HTTP response XML text.  Pass in string variables.
//   msg is HTTP response XML text
//   varName is variable Name as a string
function findValueInResponseXML(msg, varName){
	console.log("In func msg is " + msg);
	console.log("In func varName is " + varName);
	
	var s1 = msg.slice( msg.indexOf( varName ) );
	console.log("In func s1 is " + s1);
	var sV0 = "<Value>";
	var sV1 = "</Value>";
	return( s1.slice( (s1.indexOf(sV0)) + (sV0.length), s1.indexOf(sV1) ) );
}

// Make call back function for the XMLHttpRequest
function cbHttpReqListenerGetTempValAndPlot () {
	console.log("For HTTP request, the readyState is " + this.readyState);
	
	if( this.readyState == 4 ){
		console.log("HTTP request completed.  Response text is below.");
		var msg = this.responseText;
		console.log( msg );
		var newValAsStrg = findValueInResponseXML(msg, "Temperature Slider Value");
		var newTempVal = Number( newValAsStrg );
		meterBar.value = newTempVal;
		tempValText.innerHTML = newTempVal;
		console.log("The new Temp Value is " + newTempVal );
		plotNewTempPt(newTempVal);
	}
}


function drawAxisLines () {
	// Goto origin
	context.beginPath();
	context.moveTo(offSet.x, offSet.y);
	context.lineTo(offSet.x, graphHeight);
	context.strokeStyle = "red";
	context.stroke();

	context.beginPath ();
	context.moveTo(offSet.x, graphHeight);
	context.lineTo(graphWidth, graphHeight);
	context.strokeStyle = "red";
	context.stroke();
	
	// Draw the y-axis
	for(i=0;i<=meterBar.max; i+=increment){
		context.beginPath();
		context.moveTo(offSet.x - 5, graphHeight - i * yScale);
		context.lineTo(offSet.x + 5, graphHeight - i * yScale);
		context.stroke ();
	}
	context.moveTo(offSet.x, graphHeight)
	// Draw the x-axis
	for(i=4;i< numPoints; ++i){
		context.beginPath();
		context.moveTo(i * xScale, graphHeight - 5);
		context.lineTo(i * xScale, graphHeight + 5);
		context.stroke();
	}
}

// Call init function when the web page window is finished loading
window.onload = init;
