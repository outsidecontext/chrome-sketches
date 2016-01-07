///////////////////////////////////////////////////////////////////////////////
// variables
/////////////////////////////////////////////////////////////////////////////
// Threejs scene and renderer
var scene, camera, renderer, effect, controls;
var element, container;
var isCardboard;

var isMouseDown = false;
var geometry;

var rooms = [];
// var lightProps = {intensity : 1.5, distance : 200.0, decay : 1.0};
var lightProps = {
    intensity: 1.3,
    distance: 150.0,
    decay: .6
};
var backZ = 0;
var speed = 0.5;
var spacer = 117;

// TODO: wrap CSG and light, spawn and animate, kill when at certain z

///////////////////////////////////////////////////////////////////////////////
// particles
/////////////////////////////////////////////////////////////////////////////
function setup() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xF55DB3, 0.007);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 60;
    renderer = new THREE.WebGLRenderer({
        antialias: false
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0xF55DB3);
    renderer.setSize(window.innerWidth, window.innerHeight);
    element = renderer.domElement;
    container = document.getElementById('holder');
    container.appendChild(renderer.domElement);

    // setup some rooms here
    for (var i = 0; i < 5; i++) {
        var props = {
            z: -i * spacer
        }
        var room = new Room(props);
        scene.add(room.roomMesh);
        scene.add(room.light);
        rooms.push(room);
    };

    // Rounded rectangle
    var extrudeSettings = { amount: 120, bevelEnabled: true, bevelSegments: 2, steps: 2, bevelSize: 1, bevelThickness: 1 };
    var roundedRectShape = new THREE.Shape();
    (function roundedRect(ctx, x, y, width, height, radius) {

        ctx.moveTo(x, y + radius);
        ctx.lineTo(x, y + height - radius);
        ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
        ctx.lineTo(x + width - radius, y + height);
        ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
        ctx.lineTo(x + width, y + radius);
        ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
        ctx.lineTo(x + radius, y);
        ctx.quadraticCurveTo(x, y, x, y + radius);

    })(roundedRectShape, 0, 0, 50, 50, 20);
    // addShape( roundedRectShape, extrudeSettings, 0x008000, 0,  0, 0, 0, 0, 0, 0.1 );

    setupGui();
    render();
}

function setupGui() {
    // gui
    var gui = new dat.GUI();
    gui.add(this, 'speed', 0.0, 5.0).listen();
    gui.add(lightProps, 'intensity', 0, 10).listen();
    gui.add(lightProps, 'distance', 0, 200).listen();
    gui.add(lightProps, 'decay', 0.0, 1.0).listen();
    // var guiDepth = gui.addFolder("depth");
    // var controls = {
    //     cameraNear: camera.near,
    //     cameraFar: camera.far
    // }
    // guiDepth.add(controls, 'cameraNear', 0, 50).onChange(function(e) {
    //     camera.near = e;
    // });
    // guiDepth.add(controls, 'cameraFar', 0, 50).onChange(function(e) {
    //     camera.far = e;
    // });
}

function update() {
    // if (geometry) geometry.verticesNeedUpdate = true;
    // light.intensity = lightProps.intensity;
    // light.distance = lightProps.distance;
    // light.decay = lightProps.decay;
    backZ = 999;
    for (var i = 0; i < rooms.length; i++) {
        var room = rooms[i];
        room.speed = speed;
        room.light.intensity = lightProps.intensity;
        room.light.distance = lightProps.distance;
        room.light.decay = lightProps.decay;
        room.update();
        if (room.getZ() < backZ) backZ = room.getZ();
    }

    for (var i = 0; i < rooms.length; i++) {
        var room = rooms[i];
        if (room.getZ() > 360) {
            room.reset(backZ - spacer)
        }
    };
}

function render() {
    requestAnimationFrame(render);
    update();
    if (isCardboard) {
        controls.update();
        effect.render(scene, camera);
    } else {
        renderer.render(scene, camera);
    }
}

function addShape(shape, extrudeSettings, color, x, y, z, rx, ry, rz, s) {

    var points = shape.createPointsGeometry();
    var spacedPoints = shape.createSpacedPointsGeometry(50);

    // 3d shape

    var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    var mesh = new THREE.Mesh(geometry, new THREE.MeshPhongMaterial({
        color: color
    }));
    mesh.position.set(x, y, z - 75);
    mesh.rotation.set(rx, ry, rz);
    mesh.scale.set(s, s, s);
    scene.add(mesh);

}


function onMouseMove(event) {}

function onMousePress(event) {
    // console.log("onMousePress");
    isMouseDown = true;
}

function onMouseRelease(event) {
    // console.log("onMouseRelease");
    isMouseDown = false;
}

function onKeyPress(event) {
    // console.log(event.keyCode);
    // if (event.keyCode == '80') isPaused = !isPaused;
    // else if (event.keyCode == '38') camera.position.z -= 0.5;
    // else if (event.keyCode == '40') camera.position.z += 0.5;
}

function setOrientationControls(e) {
    isCardboard = e.alpha;
    if (isCardboard) {
        // cardboard
        effect = new THREE.StereoEffect(renderer);
        effect.eyeSeparation = 0;
        effect.setSize(window.innerWidth, window.innerHeight);
        controls = new THREE.DeviceOrientationControls(camera, true);
        controls.connect();
        element.addEventListener('click', fullscreen, false);
        window.removeEventListener('deviceorientation', setOrientationControls, true);
        //renderer.antialias = false;
    } else {
        // setupGui();
        // CONTROLS
        controls = new THREE.OrbitControls(camera, renderer.domElement);
    }
}

function onWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    if (effect) effect.setSize(window.innerWidth, window.innerHeight);
}

window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('mousedown', onMousePress, false);
window.addEventListener('mouseup', onMouseRelease, false);
window.addEventListener('touchstart', onMousePress, false);
window.addEventListener('touchend', onMouseRelease, false);
window.addEventListener('keyup', onKeyPress, false);
// carboard
window.addEventListener('deviceorientation', setOrientationControls, true);
window.addEventListener('resize', onWindowResize, false);



///////////////////////////////////////////////////////////////////////////////
// helpers
/////////////////////////////////////////////////////////////////////////////

function fullscreen() {
    element.removeEventListener('click', fullscreen, false);

    if (container.requestFullscreen) {
        container.requestFullscreen();
    } else if (container.msRequestFullscreen) {
        container.msRequestFullscreen();
    } else if (container.mozRequestFullScreen) {
        container.mozRequestFullScreen();
    } else if (container.webkitRequestFullscreen) {
        container.webkitRequestFullscreen();
    }
}