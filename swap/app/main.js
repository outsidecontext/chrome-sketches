// SWAP

///////////////////////////////////////////////////////////////////////////////
// setup
/////////////////////////////////////////////////////////////////////////////
var renderer = new PIXI.autoDetectRenderer(600, 600, {
    resolution: window.devicePixelRatio || 1,
    autoResize: true
});
PIXI.RESOLUTION = window.devicePixelRatio;
document.body.appendChild(renderer.view);
renderer.backgroundColor = 0xffffff;

// display tihngs
var stage = new PIXI.Container();
stage.interactive = true;
var tops = [];
var bottoms = [];

var bg = new PIXI.Container();
bg.position.x = renderer.width / (2 * PIXI.RESOLUTION);
bg.position.y = renderer.height / (2 * PIXI.RESOLUTION);
stage.addChild(bg);

var wheel = new PIXI.Container();
wheel.position.x = renderer.width / (2 * PIXI.RESOLUTION);
wheel.position.y = renderer.height / (2 * PIXI.RESOLUTION);
stage.addChild(wheel);
var radius = 200;

var ctracker = new clm.tracker({
    stopOnConvergence: true
});
ctracker.init(pModel);
var trackerCanvas = document.getElementById('tracker');
var trackerContext = trackerCanvas.getContext('2d');

var textures = [];
var sliceYs = [];
var paths = [];
var trackerI = 0;
var elapsed = 0;
var isTracking = true;
var loader = PIXI.loader;
for (var i = 0; i < 5; i++) {
    sliceYs.push(0);
    paths.push('../common/assets/' + i + '.jpg');
    loader.add(i.toString(), '../common/assets/' + i + '.jpg');
}
loader.once('complete', onLoaderComplete);
loader.load();

function setup() {

    var wheelBg = new PIXI.Graphics();
    wheelBg.beginFill(0xeeeeeee);
    wheelBg.drawCircle(0, 0, radius);
    wheelBg.endFill;
    wheel.addChild(wheelBg);
    var count = textures.length;

    var angleChangePerPt = (Math.PI * 2) / count;
    var angle = 0;
    for (var i = 0; i < count; i++) {
        var x = (radius * Math.cos(angle));
        var y = (radius * Math.sin(angle));
        var targetWidth = 200;
        var sliceYPerc =  sliceYs[i];
        if (sliceYPerc == 0) sliceYPerc = 0.5;

        // top is the forehead, sits below the wheel
        var top = new PIXI.Container();
        top.position.x = x;
        top.position.y = y;
        var topShape = new PIXI.Graphics();
        topShape.beginFill(0xff0000);
        topShape.drawRect(0, -(targetWidth / 2), targetWidth, targetWidth);
        topShape.endFill;
        topShape.rotation = angle;
        // top.addChild(topShape);
        // top image
        // var tex = textures[Math.floor(Math.random() * textures.length)];
        var tex = textures[i];
        var topTexture = new PIXI.Texture(tex, new PIXI.Rectangle(0, 0, tex.width, tex.height * sliceYPerc));
        var topSprite = new PIXI.Sprite(topTexture);
        topSprite.anchor.x = 0.5;
        topSprite.anchor.y = 1.0;
        topSprite.scale.x = targetWidth / tex.width;
        topSprite.scale.y = topSprite.scale.x;
        topSprite.rotation = angle + Math.PI / 2;
        top.addChild(topSprite);
        bg.addChild(top);

        // bottom is jaw, sits on wheel and rotates
        var bottom = new PIXI.Container();
        bottom.position.x = x;
        bottom.position.y = y;
        var bottomShape = new PIXI.Graphics();
        bottomShape.beginFill(0x0000ff);
        bottomShape.drawRect(-targetWidth, -(targetWidth / 2), targetWidth, targetWidth);
        bottomShape.endFill;
        bottomShape.rotation = angle;
        // bottom.addChild(bottomShape);
        // bottom image
        var bottomTexture = new PIXI.Texture(tex, new PIXI.Rectangle(0, tex.height * sliceYPerc, tex.width, (tex.height * (1-sliceYPerc)) - 2 ));
        var bottomSprite = new PIXI.Sprite(bottomTexture);
        bottomSprite.anchor.x = 0.5;
        bottomSprite.anchor.y = 0;
        bottomSprite.scale.x = targetWidth / tex.width;
        bottomSprite.scale.y = bottomSprite.scale.x;
        bottomSprite.rotation = angle + Math.PI / 2;
        bottom.addChild(bottomSprite);
        wheel.addChild(bottom);

        angle += angleChangePerPt;
    };
}

function onLoaderComplete(loader, resources) {
    for (var i = 0; i < 5; i++) {
        textures.push(resources[i.toString()].texture);
    }
    lookForFace();
}

function lookForFace() {
    console.log("Looking for face " + trackerI + " / " + paths.length)
    elapsed = 0;
    var img = new Image();
    img.onload = function() {
        trackerCanvas.width = img.width;
        trackerCanvas.height = img.height;
        trackerContext.drawImage(img, 0, 0, trackerCanvas.width, trackerCanvas.height);
        ctracker.start(trackerCanvas);
    };
    img.src = paths[trackerI];
}

function nextFace() {
    elapsed = 0;
    ctracker.stop();
    if (trackerI++ < paths.length) {
        lookForFace();
        console.log(sliceYs);
    }
    else {
        console.log("Converged ALL");
        isTracking = false;
        document.getElementById("tracker").remove();
        setup();
    }
}

///////////////////////////////////////////////////////////////////////////////
// animate/update loop
/////////////////////////////////////////////////////////////////////////////
function update() {
    if (isTracking) {
        elapsed ++;
        var positions = ctracker.getCurrentPosition();
        if (positions) {
            // 62 is tip of nose, 37 is top of lip
            var y1 = positions[62][1];
            var y2 = positions[37][1];
            var height = trackerCanvas.height;
            sliceYs[trackerI] = y2 / height; //y1 + (y2 - y1) / 2;
        }
        if (elapsed > 120) {
            sliceYs[trackerI] = 0.5;
            console.log("Face track timed out ):");
            nextFace();
        }
    }
}

function animate() {
    update();
    renderer.render(stage);
    requestAnimationFrame(animate);
}
animate();

///////////////////////////////////////////////////////////////////////////////
// events
/////////////////////////////////////////////////////////////////////////////
stage.on('mousemove', onPointerMove).on('touchmove', onPointerMove);

function onPointerMove(eventData) {
    var angle = (Math.PI * 8) * (eventData.data.global.x / renderer.width);
    wheel.rotation = angle;
    angle = (Math.PI * 8) * (eventData.data.global.y / renderer.height);
    bg.rotation = angle;
}

document.addEventListener("clmtrackrConverged", function(event) {
    if (!isTracking) return;
    console.log("Converged");
    nextFace();
}, false);

// detect if tracker fails to find a face
document.addEventListener("clmtrackrNotFound", function(event) {
    // ctrack.stop();
    // alert("The tracking had problems with finding a face in this image. Try selecting the face in the image manually.")
}, false);

// detect if tracker loses tracking of face
document.addEventListener("clmtrackrLost", function(event) {
    // ctrack.stop();
    // alert("The tracking had problems converging on a face in this image. Try selecting the face in the image manually.")
}, false);

///////////////////////////////////////////////////////////////////////////////
// GUI
/////////////////////////////////////////////////////////////////////////////
// var gui = new dat.GUI();