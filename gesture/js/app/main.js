var context;
var canvas;
var ratio = 1;
var points = [];
var maxPoints = 300;
var count = 0;
var frame = 0;
var frameMod = 4;
var mouse;
var isMouseDown;
var centre;
var theta;
var dThetas = [];
var maxDThetas = 30;
var stats = new Stats();
var isMouseMode = false;
var colour = [ 200, 120, 100, 0.4 ]; // RGB with alpha
var noise = new ClassicalNoise();
var simlpex = new SimplexNoise();
function Vec2f(x, y){
	this.x = x; this.y = y;
}
function ClockPoint(pos,type){
	this.pos = pos;
	this.type = type;
	this.x = pos.x;
	this.y = pos.y;
}


function onLoad() {
	// stats: 0: fps, 1: ms
	stats.setMode(0);
	// Align top-left
	stats.domElement.style.position = 'absolute';
	stats.domElement.style.left = '0px';
	stats.domElement.style.top = '0px';
	//document.body.appendChild( stats.domElement );

	// gui
	var gui = new dat.GUI();
	gui.add(this, 'maxPoints', 3, 600);
	gui.add(this, 'frameMod', 1.0, 8.0).step(1.0);
	gui.addColor(this, 'colour');


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
	//if (angle < 360)
    var radians = angle * (Math.PI / 180);
    return { x: x + h * Math.cos(radians), y: y + h * Math.sin(radians) };
}

function getRandom(min, max) {
	var random = Math.floor(Math.random() * (max - min + 1)) + min;
	return random;
}

function update() {
	requestAnimFrame(update);
	// incrementer for noise input
	count+=0.001;
	frame++;

	if (!isMouseMode && frame%frameMod===0){
		// time
		var currentdate = new Date();
		var secondsRatio = (currentdate.getSeconds() + (currentdate.getMilliseconds() * 0.001)) / 60;
		var minutessRatio = (currentdate.getMinutes()/60) + ((currentdate.getSeconds()/60) * 0.01);
		var hoursRatio = (currentdate.getHours()/12) + ((currentdate.getMinutes()/60) * 0.01);
		// noise
		var xin,yin,zin,maxNoise;
		// line
		var angle,length,pos;


		// seconds
		angle = secondsRatio*360;
		angle -= 90;

		// ascending blocks
		// xin = currentdate.getSeconds() * 0.1;
		// yin = currentdate.getSeconds() * currentdate.getSeconds();
		// zin = currentdate.getSeconds() * 0.1;
		// maxNoise = canvas.width/2;
		// length = noise.noise(xin, yin, zin) * maxNoise;
		// if (length < 0) length *= -1;

		// round pulses
		// xin = count * 0.1;
		// yin = angle * 0.1;
		// zin = currentdate.getSeconds() * 0.1;
		// maxNoise = canvas.width/2;
		// length = noise.noise(xin, yin, zin) * maxNoise;
		// if (length < 0) length *= -1;

		// sweet curves
		xin = count;
		yin = count;//currentdate.getSeconds() * 0.01;
		maxNoise = canvas.height/4;
		length = (canvas.height/2) + (simlpex.noise(xin, yin) * maxNoise);

		// calculate position and push it
		pos = getAngle(context, centre.x, centre.y, angle, length);
		var clockPoint = new ClockPoint(pos, "S");
		points.push(clockPoint);


		// minutes
		angle = minutessRatio*360;
		angle -= 90;
		maxNoise = canvas.height/3;
		length = (canvas.height/3) + (simlpex.noise(count, count) * maxNoise);
		pos = getAngle(context, centre.x, centre.y, angle, length);
		var clockPoint = new ClockPoint(pos, "M");
		points.push(clockPoint);


		// hours
		angle = hoursRatio*360;
		angle -= 90;
		maxNoise = canvas.height/5;
		length = (canvas.height/5) + (simlpex.noise(count, count) * maxNoise);
		pos = getAngle(context, centre.x, centre.y, angle, length);
		var clockPoint = new ClockPoint(pos, "H");
		points.push(clockPoint);

		// cap points
		while (points.length > maxPoints) points.shift();
	}

	stats.begin();

	// angle from mouse to centre
	// used if drawing with the mouse
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
	context.lineWidth = 0.5;
	if (points.length > 0) {
		for (i = 0; i < points.length - 1; i++) {
			context.moveTo(centre.x, centre.y);
			context.lineTo(points[i].x, points[i].y);
			context.lineTo(points[i+1].x, points[i+1].y);
			context.lineTo(centre.x, centre.y);
			//context.closePath();
		}

		//if (points[i].type == "S") {};
		var rgba = "rgba("+Math.round(colour[0])+", "+Math.round(colour[1])+", "+Math.round(colour[2])+", "+colour[3]+")";
		context.strokeStyle = rgba;
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
	}
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