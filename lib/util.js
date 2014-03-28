
function getAngle(x, y, angle, h) {
    var radians = angle * (Math.PI / 180);
    return { x: x + h * Math.cos(radians), y: y + h * Math.sin(radians) };
}

function getRandom(min, max) {
	var random = Math.floor(Math.random() * (max - min + 1)) + min;
	return random;
}

function Vec2f(x, y){
	this.x = x; this.y = y;
}