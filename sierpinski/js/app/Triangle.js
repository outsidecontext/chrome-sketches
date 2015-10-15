// Constructor which initializes the canvas widget
function Sierpinski() {
    this.w = 600;
    // Compute the height of the canvas to let an equilateral triangle
    // fit into it. Pythagoras is your friend here.
    this.h = Math.sqrt(3) / 2 * this.w;
    this.canvas = document.getElementById("canvas");
    this.context = this.canvas.getContext("2d");
    this.maxDepth = 10;
    this.canvas.width = this.w;
    this.canvas.height = this.h;
}
 
// Draw a Sierpinski Triangle with the given recursion depth
Sierpinski.prototype.drawSierpinskiTriangle = function(depth, centre, size)
{
    //this.context.clearRect(0, 0, this.w, this.h);
 
    // Initialize the coordinates of an equilateral triangle which
    // fits into the canvas
    // var x0 = 0, y0 = this.h - 1;
    // var x1 = this.w, y1 = this.h - 1;
    // var x2 = this.w/2, y2 = 0;
	
	//var size = 60;
	var x0 = centre.x - size,
		y0 = centre.y + size;
    var x1 = centre.x,
    	y1 = centre.y - size;
    var x2 = centre.x + size,
    	y2 = centre.y + size;

 
    // Draw the initial triangle (black)
    this.context.fillStyle = "#000000";
    this.drawTriangle(x0, y0, x1, y1, x2, y2);
 
    // Remove the triangle (draw white) which is defined by the 
    // midpoints of the sides of the initial triangle. Recursively
    // execute this process for the remaining 3 triangles.
    this.context.fillStyle = "#ffffff";
    if (depth > this.maxDepth) { // make sure that depth doesn't get too high
        depth = this.maxDepth;
        document.getElementById('depthStepper').value = depth;
    }
    this.removeCenterTriangle(x0, y0, x1, y1, x2, y2, depth);    
};
 
// Draw a filled triangle which is defined by the points
// (x0,y0), (x1,y1), and (x2,y2)
Sierpinski.prototype.drawTriangle = function(x0, y0, x1, y1, x2, y2) {
    this.context.beginPath();
    this.context.moveTo(x0, y0);
    this.context.lineTo(x1, y1);
    this.context.lineTo(x2, y2);
    this.context.lineTo(x0, y0);
    this.context.fill();
};
 
// Removes the center triangle which is defined by connecting the midpoints
// of each side.
Sierpinski.prototype.removeCenterTriangle = function(x0, y0, x1, y1, x2, y2, depth) {
    if (depth > 0) {
        // Midpoint coordinates
        var x01 = (x0 + x1)/2, y01 = (y0 + y1)/2;
        var x02 = (x0 + x2)/2, y02 = (y0 + y2)/2;
        var x12 = (x1 + x2)/2, y12 = (y1 + y2)/2;
        // Remove the center triangle
        this.drawTriangle(x01, y01, x02, y02, x12, y12);
        if (depth > 1) {
            // Recursively remove center triangles for the
            // remaining filled triangles
            this.removeCenterTriangle(x0, y0, x01, y01, x02, y02, depth - 1);
            this.removeCenterTriangle(x01, y01, x1, y1, x12, y12, depth - 1);
            this.removeCenterTriangle(x02, y02, x12, y12, x2, y2, depth - 1);
        }
    }
};