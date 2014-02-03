var context;
var canvas;
var ratio = 1;
var mouse;
var isMouseDown = false;
var triangle;
var depth = 1;
var scale = 1;

function onLoad() {
	console.log("onload");
	triangle = new Sierpinski();
	console.log(triangle);
	setInterval(function(){
		depth++;
		if (depth > 10) depth = 1;
	},500);
	setupCommon();
}

function setupCommon(){
	// gui
	//var gui = new dat.GUI();
	// setup canvas
	canvas = document.getElementById('canvas');
	context = canvas.getContext("2d");
	setupCanvas();
	// mouse tracking
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
function update() {
	requestAnimFrame(update);
	draw();
}

function draw() {
	// additive blending?
	context.globalCompositeOperation = "lighter";
	//context.globalCompositeOperation = "source-atop";
	//context.globalCompositeOperation = "xor";
	if (isMouseDown) {
		triangle.drawSierpinskiTriangle(depth, mouse, 20*scale);
	}
}

function drawCircle(centerX, centerY, radius){
	context.beginPath();
	context.arc(centerX, centerY, radius, 0, 2 * Math.PI, false);
	context.fillStyle = '#333333';
	context.fill();
}



// Listeners
document.addEventListener("mousedown", function(e) {
	isMouseDown = true;
	depth = 1;
	var rect = canvas.getBoundingClientRect();
	mouse.x = e.clientX * ratio;
	mouse.y = e.clientY * ratio;
}, true);

document.addEventListener("mouseup", function() {
	isMouseDown = false;
}, true);

document.addEventListener("keydown", function(e){
	var key = String.fromCharCode(e.keyCode)
	console.log(key);
	scale = parseInt(key);
}, true)

function onMouseMove(e) {
	var rect = canvas.getBoundingClientRect();
	mouse.x = e.clientX * ratio;
	mouse.y = e.clientY * ratio;
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