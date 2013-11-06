var context;
var canvas;
var points = [];
var maxPoints = 60;
var mouseX, mouseY, mousePVec, isMouseDown;


function onLoad() {
	canvas = document.getElementById('canvas');
	context = canvas.getContext("2d");
	context.canvas.width = window.innerWidth;
	context.canvas.height = window.innerHeight;
	context.lineCap = 'round';
	// if (window.devicePixelRatio == 2) {
	// 	canvas.setAttribute('width', window.innerWidth*2);
	// 	canvas.setAttribute('height', window.innerHeight*2);
	// 	context.scale(.5, .5);
	// }
	update();
}


// update

function update() {
	requestAnimFrame(update);
	// stats.begin();
	draw();
	// stats.end();
}

function draw() {
	if (points.length > 0) {
		context.beginPath();
		context.moveTo(points[0].x, points[0].y);
		for (var i = points.length - 1; i >= 1; i--) {
			context.lineTo(points[i].x, points[i].y);
		}
		context.closePath();
		context.lineWidth = 0.6;
		context.strokeStyle = '#333333';
		context.stroke();
	}
}

// mouse
document.addEventListener("mousedown", function(e) {
	isMouseDown = true;
	onMouseMove(e);
	document.addEventListener("mousemove", onMouseMove, true);
}, true);

document.addEventListener("mouseup", function() {
	document.removeEventListener("mousemove", onMouseMove, true);
	isMouseDown = false;
	mouseX = undefined;
	mouseY = undefined;
}, true);

function onMouseMove(e) {
	var rect = canvas.getBoundingClientRect();
	mouseX = (e.clientX - rect.left);
	mouseY = (e.clientY - rect.top);
	points.push({
		x: mouseX,
		y: mouseY
	});
	if (points.length > maxPoints) {
		points.shift();
	}
}

window.onresize = function() {
	context.canvas.width = window.innerWidth;
	context.canvas.height = window.innerHeight;
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