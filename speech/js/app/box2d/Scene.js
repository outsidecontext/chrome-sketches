//
// Basic box2d world with gravity and mouse control
//

var WORLD_SCALE = 1 / 30;
var WORLD_SCALE_INV = 30;
var world;
var context;
var items;
var leftWall, rightWall, floor;
var stats;
var worldW, worldH;
var b2Vec2 = Box2D.b2Vec2,
    b2AABB = Box2D.b2AABB,
    b2BodyDef = Box2D.b2BodyDef,
    b2Body = Box2D.b2Body,
    b2FixtureDef = Box2D.b2FixtureDef,
    b2Fixture = Box2D.b2Fixture,
    b2World = Box2D.b2World,
    b2MassData = Box2D.b2MassData,
    b2PolygonShape = Box2D.b2PolygonShape,
    b2CircleShape = Box2D.b2CircleShape,
    b2DebugDraw = Box2D.b2DebugDraw,
    b2MouseJointDef = Box2D.b2MouseJointDef;


///////////////////////////////////////////////////////////////////////////////
// PIXI
/////////////////////////////////////////////////////////////////////////////
var renderer = new PIXI.autoDetectRenderer(600, 600, {
    resolution: window.devicePixelRatio || 1,
    autoResize: true
});
PIXI.RESOLUTION = window.devicePixelRatio;
document.body.appendChild(renderer.view);
renderer.backgroundColor = 0xffffff;
var stage = new PIXI.Container();



function init(canvasId, items) {
    canvasId = canvasId || "canvas"
    context = document.getElementById(canvasId).getContext("2d");
    worldW = document.getElementById(canvasId).width / 30;
    worldH = document.getElementById(canvasId).height / 30;
    // stats = new Stats();
    // stats.setMode(0);
    // document.body.appendChild( stats.domElement );
    this.items = items;
    initBox2d();
    animate();
}

function initBox2d() {
    world = new b2World(new b2Vec2(0, 10), true);
    // ground and walls
    floor = new Body(world, {
    	type: "static",
    	x: 0,
    	y: worldH,
    	height: 1,
    	width: worldW * 2
    });
    leftWall = new Body(world, {
    	type: "static",
    	x: 0,
    	y: worldH - 0.5,
    	height: worldH * 2,
    	width: 1
    });
    rightWall = new Body(world, {
    	type: "static",
    	x: worldW,
    	y: worldH - 0.5,
    	height: worldH * 2,
    	width: 1
    });
    // create items (blocks and circles)
    for (var i = items.length - 1; i >= 0; i--) {
    	new Body(world, items[i]);
    };

    // setup debug draw
    // var debugDraw = new b2DebugDraw();
    // debugDraw.SetSprite(document.getElementById("canvas").getContext("2d"));
    // debugDraw.SetDrawScale(30.0);
    // debugDraw.SetFillAlpha(0.3);
    // debugDraw.SetLineThickness(1.0);
    // debugDraw.SetFlags(b2DebugDraw.e_shapeBit | b2DebugDraw.e_jointBit);
    // world.SetDebugDraw(debugDraw);
};


// mouse
var mouseX, mouseY, mousePVec, isMouseDown, selectedBody, mouseJoint;
var canvasPosition = getElementPosition(document.getElementById("canvas"));
document.addEventListener("mousedown", function(e) {
    isMouseDown = true;
    handleMouseMove(e);
    document.addEventListener("mousemove", handleMouseMove, true);
}, true);

document.addEventListener("mouseup", function() {
    document.removeEventListener("mousemove", handleMouseMove, true);
    isMouseDown = false;
    mouseX = undefined;
    mouseY = undefined;
}, true);

function handleMouseMove(e) {
    mouseX = (e.clientX - canvasPosition.x) / 30;
    mouseY = (e.clientY - canvasPosition.y) / 30;
};


// Box2d Mouse Helper methods
function getBodyAtMouse() {
    mousePVec = new b2Vec2(mouseX, mouseY);
    var aabb = new b2AABB();
    aabb.lowerBound.Set(mouseX - 0.001, mouseY - 0.001);
    aabb.upperBound.Set(mouseX + 0.001, mouseY + 0.001);
    // Query the world for overlapping shapes.
    selectedBody = null;
    world.QueryAABB(getBodyCB, aabb);
    return selectedBody;
}

function getBodyCB(fixture) {
    if (fixture.GetBody().GetType() != b2Body.b2_staticBody) {
        if (fixture.GetShape().TestPoint(fixture.GetBody().GetTransform(), mousePVec)) {
            selectedBody = fixture.GetBody();
            return false;
        }
    }
    return true;
}

// update
function animate() {
    requestAnimationFrame(animate);
    // stats.begin();
    update();
    // stats.end();
    renderer.render(stage);
}

function update() {
    world.Step(1 / 60, 2, 2);

    var scale = 30;
    //var context = document.getElementById("canvas").getContext("2d");
    context.canvas.width = window.innerWidth;
    // Just use half the screen for now
    context.canvas.height = window.innerHeight * 0.8;
    // context.clearRect(0, 0, document.getElementById("canvas").width, document.getElementById("canvas").height);
    context.save();
    // context.fillText("TEST", 10, 10);
    //context.scale(scale, scale);
    var count = 0;
    var b = this.world.GetBodyList();
    while (b.e != 0) {
        // console.log(b);
    	count ++;
        var body = b.userdata;
        var pos = b.GetPosition();
        // context.fillText("AA", pos.get_x() * 30, pos.get_y() * 30);
        if (body) {
            // context.drawCircle(b.GetPosition().x, b.GetPosition().y, 10);
            body.draw(context);
        }
        b = b.GetNext();
    }
    context.restore();

    // if (isMouseDown && (!mouseJoint)) {
    // 	var body = getBodyAtMouse();
    // 	if (body) {
    // 		var md = new b2MouseJointDef();
    // 		md.bodyA = world.GetGroundBody();
    // 		md.bodyB = body;
    // 		md.target.Set(mouseX, mouseY);
    // 		md.collideConnected = true;
    // 		md.maxForce = 300.0 * body.GetMass();
    // 		mouseJoint = world.CreateJoint(md);
    // 		body.SetAwake(true);
    // 	}
    // }

    // if (mouseJoint) {
    // 	if (isMouseDown) {
    // 		mouseJoint.SetTarget(new b2Vec2(mouseX, mouseY));
    // 	} else {
    // 		world.DestroyJoint(mouseJoint);
    // 		mouseJoint = null;
    // 	}
    // }

    //world.DrawDebugData();
    // world.ClearForces();
};

function resizeScene() {
    worldW = context.canvas.width / 30;
    worldH = context.canvas.height / 30;
    world.DestroyBody(floor.body);
    floor = new Body(world, {
    	type: "static",
    	x: 0,
    	y: worldH,
    	height: 1,
    	width: worldW * 2
    });
    world.DestroyBody(leftWall.body);
    leftWall = new Body(world, {
    	type: "static",
    	x: 0,
    	y: worldH - 0.5,
    	height: worldH * 2,
    	width: 1
    });
    world.DestroyBody(rightWall.body);
    rightWall = new Body(world, {
    	type: "static",
    	x: worldW,
    	y: worldH - 0.5,
    	height: worldH * 2,
    	width: 1
    });
}

// helpers
// http://js-tut.aardon.de/js-tut/tutorial/position.html
function getElementPosition(element) {
    var elem = element,
        tagname = "",
        x = 0,
        y = 0;
    while ((typeof(elem) == "object") && (typeof(elem.tagName) != "undefined")) {
        y += elem.offsetTop;
        x += elem.offsetLeft;
        tagname = elem.tagName.toUpperCase();
        if (tagname == "BODY") elem = 0;
        if (typeof(elem) == "object") {
            if (typeof(elem.offsetParent) == "object") elem = elem.offsetParent;
        }
    }
    return {
        x: x,
        y: y
    };
}

function getRndRestitution() {
    var max = .99;
    var min = .2;
    return Math.random() * (max - min) + min;
}