//
// Basic box2d world with gravity and mouse control
//

// box2d
var WORLD_SCALE = 1 / 30;
var WORLD_SCALE_INV = 30;
var world;
var context;
var items;
var leftWall, rightWall, floor;
var stats;
var worldW, worldH;
var b2Vec2 = Box2D.Common.Math.b2Vec2,
    b2AABB = Box2D.Collision.b2AABB,
    b2BodyDef = Box2D.Dynamics.b2BodyDef,
    b2Body = Box2D.Dynamics.b2Body,
    b2FixtureDef = Box2D.Dynamics.b2FixtureDef,
    b2Fixture = Box2D.Dynamics.b2Fixture,
    b2World = Box2D.Dynamics.b2World,
    b2MassData = Box2D.Collision.Shapes.b2MassData,
    b2PolygonShape = Box2D.Collision.Shapes.b2PolygonShape,
    b2CircleShape = Box2D.Collision.Shapes.b2CircleShape,
    b2DebugDraw = Box2D.Dynamics.b2DebugDraw,
    b2MouseJointDef = Box2D.Dynamics.Joints.b2MouseJointDef;
// pixi
var renderer;
var stage;


function init(canvasId, items) {
    canvasId = canvasId || "canvas";
    var canvas = document.getElementById(canvasId);
    var width = window.innerWidth;
    var height = window.innerHeight * 0.8;
    renderer = new PIXI.autoDetectRenderer(width, height, {
        view: canvas,
        resolution: window.devicePixelRatio || 1,
        autoResize: true
    });
    PIXI.RESOLUTION = window.devicePixelRatio;
    renderer.backgroundColor = 0xffffff;
    stage = new PIXI.Container();
    worldW = (renderer.view.width / PIXI.RESOLUTION) / 30;
    worldH = (renderer.view.height / PIXI.RESOLUTION) / 30;

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
        height: 0,
        width: worldW * 2
    });
    leftWall = new Body(world, {
        type: "static",
        x: 0,
        y: worldH - 0.5,
        height: worldH * 2,
        width: 0
    });
    rightWall = new Body(world, {
        type: "static",
        x: worldW,
        y: worldH - 0.5,
        height: worldH * 2,
        width: 0
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
    world.Step(1 / 60, 10, 10);

    for (var b = this.world.GetBodyList(); b; b = b.m_next) {
        var body = b.GetUserData();
        if (body) body.draw(context);
    }

    if (isMouseDown && (!mouseJoint)) {
        var body = getBodyAtMouse();
        if (body) {
            var md = new b2MouseJointDef();
            md.bodyA = world.GetGroundBody();
            md.bodyB = body;
            md.target.Set(mouseX, mouseY);
            md.collideConnected = true;
            md.maxForce = 300.0 * body.GetMass();
            mouseJoint = world.CreateJoint(md);
            body.SetAwake(true);
        }
    }

    if (mouseJoint) {
        if (isMouseDown) {
            mouseJoint.SetTarget(new b2Vec2(mouseX, mouseY));
        } else {
            world.DestroyJoint(mouseJoint);
            mouseJoint = null;
        }
    }

    //world.DrawDebugData();
    world.ClearForces();
};

function resizeScene() {
	// console.log("resizeScene");
 //    worldW = (renderer.view.width / PIXI.RESOLUTION) / 30;
 //    worldH = (renderer.view.height / PIXI.RESOLUTION) / 30;
 //    world.DestroyBody(floor.body);
 //    floor = new Body(world, {
 //    	type: "static",
 //    	x: 0,
 //    	y: worldH,
 //    	height: 0,
 //    	width: worldW * 2
 //    });
 //    world.DestroyBody(leftWall.body);
 //    leftWall = new Body(world, {
 //    	type: "static",
 //    	x: 0,
 //    	y: worldH - 0.5,
 //    	height: worldH * 2,
 //    	width: 0
 //    });
 //    world.DestroyBody(rightWall.body);
 //    rightWall = new Body(world, {
 //    	type: "static",
 //    	x: worldW,
 //    	y: worldH - 0.5,
 //    	height: worldH * 2,
 //    	width: 0
 //    });

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