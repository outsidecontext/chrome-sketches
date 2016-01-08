///////////////////////////////////////////////////////////////////////////////
// variables
/////////////////////////////////////////////////////////////////////////////

// Threejs scene and renderer
var scene, camera, renderer, effect, controls;
var element, container;
var stats;
var isCardboard;
var isMouseDown = false;

// rooms
var rooms = [];
var backZ = 0;
var speed = 0.5;
var roomDepth = 200;
var spacer = roomDepth + 0.2;

// lights
var lightProps = {
    intensity: 0.3,
    distance: 100.0,
    decay: 1.0,
    shininess: 30,
    zOffset: 0
};
var ambientLight;
var ambientLightColour = "#dddddd";
var fogColour = "#F55DB3";

// desktop camera control
var pitchObject;
var yawObject;
var PI_2 = Math.PI / 2;
var camRotXTarget = 0;
var camRotYTarget = 0;
var isMouseControl = false;


///////////////////////////////////////////////////////////////////////////////
// core functions
/////////////////////////////////////////////////////////////////////////////

function setup() {
    // just setup camera initially
    // this is used by setOrientationControls()
    // which in turn calls setupScene()
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);

    // mouse and key listeners
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('mousedown', onMousePress, false);
    window.addEventListener('mouseup', onMouseRelease, false);
    window.addEventListener('touchstart', onMousePress, false);
    window.addEventListener('touchend', onMouseRelease, false);
    window.addEventListener('keyup', onKeyPress, false);

    // carboard/mobile device events
    window.addEventListener('deviceorientation', setOrientationControls, true);
    window.addEventListener('resize', onWindowResize, false);
}

function setupScene() {

    // scene with fog
    scene = new THREE.Scene();
    scene.fog = new THREE.Fog(fogColour, 0, roomDepth * 2);

    // clear colour is same as fog, supports retina displays
    renderer = new THREE.WebGLRenderer({
        antialias: false
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(fogColour);
    renderer.setSize(window.innerWidth, window.innerHeight);
    element = renderer.domElement;
    container = document.getElementById('holder');
    container.appendChild(renderer.domElement);

    // setup differently for cardboard vr
    // assuming device orientation support = cardboard
    if (isCardboard) {
        effect = new THREE.StereoEffect(renderer);
        effect.eyeSeparation = 0;
        effect.setSize(window.innerWidth, window.innerHeight);
        element.addEventListener('click', fullscreen, false);
    } else {
        pitchObject = new THREE.Object3D();
        pitchObject.add(camera);
        yawObject = new THREE.Object3D();
        yawObject.add(pitchObject);
        scene.add(yawObject);
        setupGui();
    }

    // setup some rooms here
    // a room is a hollow space with an aperture at either end
    // and a point light
    for (var i = 0; i < 3; i++) {
        var props = {
            z: -i * spacer,
            depth: roomDepth
        }
        var room = new Room(props);
        room.light.intensity = lightProps.intensity;
        room.light.distance = lightProps.distance;
        room.light.decay = lightProps.decay;
        room.roomMesh.material.shininess = lightProps.shininess;
        room.lightZOffset = lightProps.zOffset
        scene.add(room.roomMesh);
        scene.add(room.light);
        rooms.push(room);
    };

    // ambient light in case we want to avoid black areas
    ambientLight = new THREE.AmbientLight(ambientLightColour);
    scene.add(ambientLight);

    // stats?
    stats = new Stats();
    // container.appendChild( stats.domElement );

    // start render loop
    render();
}

function update() {
    if (!isCardboard) {
        yawObject.rotation.y += (camRotYTarget - yawObject.rotation.y) * 0.04;
        pitchObject.rotation.x += (camRotXTarget - pitchObject.rotation.x) * 0.04;
    }

    backZ = 999;
    for (var i = 0; i < rooms.length; i++) {
        var room = rooms[i];
        room.speed = speed;
        room.light.intensity = lightProps.intensity;
        room.light.distance = lightProps.distance;
        room.light.decay = lightProps.decay;
        room.roomMesh.material.shininess = lightProps.shininess;
        room.lightZOffset = lightProps.zOffset;
        room.update();
        if (room.getZ() < backZ) backZ = room.getZ();
    }

    for (var i = 0; i < rooms.length; i++) {
        var room = rooms[i];
        if (room.getZ() > spacer * 1.5) {
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
        effect.render(scene, camera);
    } else {
        renderer.render(scene, camera);
    }
}


///////////////////////////////////////////////////////////////////////////////
// GUI setup
/////////////////////////////////////////////////////////////////////////////

function setupGui() {

    var gui = new dat.GUI();
    gui.add(this, 'isMouseControl').onChange(function(e) {
        if (!isMouseControl) {
            camRotXTarget = 0;
            camRotYTarget = 0;
        };
    });
    gui.add(this, 'speed', 0.0, 5.0).listen();
    gui.addColor(this, 'fogColour').onChange(function(e) {
        scene.fog.color = new THREE.Color(fogColour);
        renderer.setClearColor(fogColour);
    });

    var guiLighting = gui.addFolder('Lighting');
    guiLighting.add(lightProps, 'intensity', 0, 4).listen();
    guiLighting.add(lightProps, 'distance', 0, 400).listen();
    guiLighting.add(lightProps, 'decay', 0.0, 1.0).listen();
    guiLighting.add(lightProps, 'shininess', 0.0, 120.0).listen();
    guiLighting.add(lightProps, 'zOffset', 0.0, 120.0).listen();
    guiLighting.addColor(this, 'ambientLightColour').onChange(function(e) {
        ambientLight.color = new THREE.Color(ambientLightColour);
    });

}


///////////////////////////////////////////////////////////////////////////////
// listeners
/////////////////////////////////////////////////////////////////////////////

function onMouseMove(event) {
    if (!isCardboard && isMouseControl) {
        camRotXTarget = ((window.innerHeight / 2) - event.pageY) * 0.001;
        camRotYTarget = ((window.innerWidth / 2) - event.pageX) * 0.001;
    }
}

function onMousePress(event) {
    isMouseDown = true;
}

function onMouseRelease(event) {
    isMouseDown = false;
}

function onKeyPress(event) {}

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