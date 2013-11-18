var context;
var canvas;
var ratio = 1;
var points = [];
var maxPoints = 100;
var mouse;
var isMouseDown;
var centre;
var theta;
var dThetas = [];
var maxDThetas = 30;
var stats = new Stats();
var isMouseMode = false;
var noise = new ClassicalNoise();
function Vec2f(x, y){
	this.x = x; this.y = y;
}


function onLoad() {
	// stats: 0: fps, 1: ms
	stats.setMode(0);
	// Align top-left
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.left = '0px';
	stats.domElement.style.top = '0px';
	// document.body.appendChild( stats.domElement );

	// setup canvas
	canvas = document.getElementById('canvas');
	context = canvas.getContext("2d");
	setupCanvas();
	

	// mouse tracking
	isMouseDown = true;
	mouse = new Vec2f(0,0);
	canvas.addEventListener("mousemove", onMouseMove, true);
	// start update loop
	update();
}

function setupCanvas(){
	context.canvas.width = window.innerWidth;
	context.canvas.height = window.innerHeight;
	// retinize canvas
	if(context.webkitBackingStorePixelRatio < 2)
		ratio = window.devicePixelRatio || 1;
	ratio = 2;
	var w = context.canvas.width;
	var h = context.canvas.height;
	canvas.height = h * ratio;
	canvas.width = w * ratio;
	canvas.style.height = h + 'px';
	canvas.style.width = w + 'px';
	context.scale( ratio, ratio );
	canvas.width = canvas.width;
	centre = new Vec2f(context.canvas.width*0.5, context.canvas.height*0.5);
}

// update

function getAngle(ctx, x, y, angle, h) {
    var radians = angle * (Math.PI / 180);
    return { x: x + h * Math.cos(radians), y: y + h * Math.sin(radians) };
}

function getRandom(min, max) {
	var random = Math.floor(Math.random() * (max - min + 1)) + min;
	return random;
}

function update() {
	requestAnimFrame(update);

	if (!isMouseMode){
		var currentdate = new Date(); 
		var datetime = "datetime: " + currentdate.getDate() + "/"
		+ (currentdate.getMonth()+1)  + "/" 
		+ currentdate.getFullYear() + " @ "  
		+ currentdate.getHours() + ":"  
		+ currentdate.getMinutes() + ":" 
		+ currentdate.getSeconds();
		//console.log(datetime);

		var secondsRatio = (currentdate.getSeconds() + (currentdate.getMilliseconds() * 0.001)) / 60;
		//var secondsRatio = (currentdate.getSeconds()) / 60;
		var angle = secondsRatio*360;
		var multIn = 0.001;
		var multOut = canvas.width;
		var n = noise.noise(currentdate.getSeconds() * multIn, currentdate.getSeconds() * multIn, currentdate.getSeconds() * multIn) * multOut;
		if (n < 0) n *= -1;
		console.log(n);
		var pos = getAngle(context, centre.x, centre.y, angle, n);
		points.push(pos);
		while (points.length > maxPoints) points.shift();
	}

	stats.begin();

	// angle from mouse to centre
	var x = mouse.x - centre.x;
	var y = mouse.y - centre.y;
	var theta = Math.atan2(-y, x) * (180 / Math.PI);
	var dTheta = this.theta - theta;
	dThetas.push(dTheta);
	while (dThetas.length > maxDThetas) dThetas.shift();
	this.theta = theta;

	draw();

	stats.end();
}

function draw() {
	// clear
	canvas.width = canvas.width;
	
	context.beginPath();
	var i;
	if (points.length > 0) {
		for (i = 0; i < points.length - 1; i++) {
			context.moveTo(centre.x, centre.y);
			context.lineTo(points[i].x, points[i].y);
			context.lineTo(points[i+1].x, points[i+1].y);
			context.lineTo(centre.x, centre.y);
			//context.closePath();
		}
		context.lineWidth = 1.5;
		context.strokeStyle = "rgba(100, 100, 100, 1.0)";
		context.stroke();
		//context.fillStyle = "rgba(200, 200, 200, 0.8)";
		//context.fill();
	}

	// draw centre
	//drawCircle(centre.x, centre.y, 2);

	// smooth out dtheta
	var dThetaAvg = 0;
	var count = 0;
	for (i = dThetas.length - 1; i >= 0; i--) {
		if (dThetas[i] < 10 && dThetas[i] > -10) {
			count++;
			dThetaAvg += dThetas[i];
		}
	}
	dThetaAvg /= count;
	// reduce the smoothed dtheta value
	var r = dThetaAvg * 0.1;

	// draw dtheta as a progress bar
	// context.beginPath();
	// context.moveTo(centre.x, 30);
	// context.lineTo(centre.x + (r * (context.canvas.width*0.5)), 30);
	// context.lineWidth = 3;
	// context.strokeStyle = '#333333';
	// context.stroke();
}

function drawCircle(centerX, centerY, radius){
	context.beginPath();
	context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
	context.fillStyle = '#333333';
	context.fill();
}



// Listeners
document.addEventListener("mousedown", function(e) {
	// isMouseDown = true;
	// onMouseMove(e);
	// document.addEventListener("mousemove", onMouseMove, true);
	isMouseMode = true;
}, true);

document.addEventListener("mouseup", function() {
	// document.removeEventListener("mousemove", onMouseMove, true);
	// isMouseDown = false;
	// mouse.x = undefined;
	// mouse.y = undefined;
	isMouseMode = false;
}, true);

function onMouseMove(e) {
	if (isMouseMode) {
		var rect = canvas.getBoundingClientRect();
		mouse.x = e.clientX * ratio;
		mouse.y = e.clientY * ratio;
		if (points.length === 0 || mouse.x != points[0].x)
			points.push(new Vec2f(mouse.x, mouse.y));
		while (points.length > maxPoints) points.shift();
	};
}

window.onresize = function() {
	setupCanvas();
};



// requestAnim shim layer by Paul Irish
window.requestAnimFrame = (function() {
	return window.requestAnimationFrame ||
		window.webkitRequestAnimationFrame ||
		window.mozRequestAnimationFrame ||
		window.oRequestAnimationFrame ||
		window.msRequestAnimationFrame ||
		function( /* function */ callback, /* DOMElement */ element) {
			window.setTimeout(callback, 1000 / 60);
	};
})();