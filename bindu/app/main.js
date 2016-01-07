///////////////////////////////////////////////////////////////////////////////
// variables
/////////////////////////////////////////////////////////////////////////////
// Threejs scene and renderer
var scene, camera, renderer, effect, controls;
var element, container;
var stats;
var isCardboard;

var isMouseDown = false;
var geometry;

var rooms = [];
var lightProps = {intensity : 0.43, distance : 260.0, decay : 1.0};
var backZ = 0;
var speed = 0.5;
var roomDepth = 200;
var spacer = roomDepth + 0.2;

///////////////////////////////////////////////////////////////////////////////
// particles
/////////////////////////////////////////////////////////////////////////////
function setup() {
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 60;
}

function setupScene() {

    scene = new THREE.Scene();
    //scene.fog = new THREE.FogExp2(0xF55DB3, 0.003);
    scene.fog = new THREE.Fog(0xF55DB3, 0, roomDepth*2);

    renderer = new THREE.WebGLRenderer({
        antialias: false
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0xF55DB3);
    renderer.setSize(window.innerWidth, window.innerHeight);
    element = renderer.domElement;
    container = document.getElementById('holder');
    container.appendChild(renderer.domElement);

    if (isCardboard) {
        console.log(controls);
        effect = new THREE.StereoEffect(renderer);
        effect.eyeSeparation = 0;
        effect.setSize(window.innerWidth, window.innerHeight);
        element.addEventListener('click', fullscreen, false);
    }
    else {
        controls = new THREE.OrbitControls(camera, renderer.domElement);
    }

    // setup some rooms here
    for (var i = 0; i < 4; i++) {
        var props = {
            z: -i * spacer,
            depth : roomDepth
        }
        var room = new Room(props);
        scene.add(room.roomMesh);
        scene.add(room.light);
        rooms.push(room);
    };

    var light = new THREE.AmbientLight( 0xdddddd ); // soft white light
    scene.add( light );

    stats = new Stats();
    container.appendChild( stats.domElement );
    setupGui();
    render();
}

function setupGui() {
    // gui
    var gui = new dat.GUI();
    gui.add(this, 'speed', 0.0, 5.0).listen();
    gui.add(lightProps, 'intensity', 0, 4).listen();
    gui.add(lightProps, 'distance', 0, 400).listen();
    gui.add(lightProps, 'decay', 0.0, 1.0).listen();
}

function update() {

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
        if (room.getZ() > spacer*2) {
            room.reset(backZ - spacer);
        }
    };

    stats.update();
}

function render() {
    requestAnimationFrame(render);
    update();
    if (isCardboard) {
        controls.update();
        //renderer.render(scene, camera);
        effect.render(scene, camera);
    } else {
        renderer.render(scene, camera);
    }
}

function onMouseMove(event) {}

function onMousePress(event) {
    isMouseDown = true;
}

function onMouseRelease(event) {
    isMouseDown = false;
}

function onKeyPress(event) {
}

function setOrientationControls(e) {
    isCardboard = e.alpha;
    if (isCardboard) {
        console.log("using DeviceOrientationControls");
        controls = new THREE.DeviceOrientationControls(camera);
        window.removeEventListener('deviceorientation', setOrientationControls, true);
    }
    setupScene();
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

// carboard/mobiled device events
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