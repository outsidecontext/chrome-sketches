///////////////////////////////////////////////////////////////////////////////
// variables
/////////////////////////////////////////////////////////////////////////////
// Threejs scene and renderer
var scene, camera, renderer, effect, controls;
var element, container;
var isCardboard;

var isMouseDown = false;
var geometry;

var lights = [];
var lightProps = {intensity : 2.0, distance : 87.0, decay : 0.01};

///////////////////////////////////////////////////////////////////////////////
// particles
/////////////////////////////////////////////////////////////////////////////
function setup() {
    scene = new THREE.Scene();
    //scene.fog = new THREE.FogExp2(0x000000, 0.01);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    camera.position.z = 500;
    renderer = new THREE.WebGLRenderer({
        antialias: false
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0xffffff);
    renderer.setSize(window.innerWidth, window.innerHeight);
    element = renderer.domElement;
    container = document.getElementById('holder');
    container.appendChild(renderer.domElement);

    // CSG Test
    //shading: THREE.FlatShading
    // var materialNormal = new THREE.MeshNormalMaterial();
    var materialNormal = new THREE.MeshPhongMaterial({color:0xffffff, overdraw: 0.5});
    
    var cubeGeometry = new THREE.CubeGeometry( 100, 100, 100, 1, 1, 1 );
    var cubeMesh = new THREE.Mesh( cubeGeometry );
    var cubeBSP = new ThreeBSP( cubeMesh );
        
    var sphereGeometry = new THREE.SphereGeometry( 60, 32, 32 );
    var sphereMesh = new THREE.Mesh( sphereGeometry );
    var sphereBSP = new ThreeBSP( sphereMesh );

    var cylinderGeometry = new THREE.CylinderGeometry( 32, 32, 120, 32 );
    var cylinderMesh = new THREE.Mesh( cylinderGeometry );
    var cylinderBSP = new ThreeBSP( cylinderMesh );
    
    // Example #1 - Cube subtract Sphere
    // var newBSP = cubeBSP.subtract( sphereBSP );
    var newBSP = cubeBSP.subtract( cylinderBSP );
    var newMesh = newBSP.toMesh( materialNormal );
    newMesh.position.set(0, 0, 0);
    newMesh.rotation.x = Math.PI/2;
    newMesh.material.side = THREE.BackSide;
    scene.add( newMesh );

    // Example #1 - Cube subtract Sphere
    var newBSP = cubeBSP.subtract( cylinderBSP );
    var newMesh = newBSP.toMesh( materialNormal );
    newMesh.position.set(0, 0, -100);
    newMesh.rotation.x = Math.PI/2;
    scene.add( newMesh );

    // Example #2 - Sphere subtract Cube
    // var newBSP = sphereBSP.subtract( cubeBSP );
    // var newMesh = newBSP.toMesh( materialNormal );
    // newMesh.position.set(180, 60, 0);
    // scene.add( newMesh );
    
    // Example #3 - Cube union Sphere
    // var newBSP = sphereBSP.union( cubeBSP );
    // var newMesh = newBSP.toMesh( materialNormal );
    // newMesh.position.set(70, 60, -120);
    // scene.add( newMesh );

    // Example #4 - Cube intersect Sphere
    // var newBSP = sphereBSP.intersect( cubeBSP );
    // var newMesh = newBSP.toMesh( materialNormal );
    // newMesh.position.set(-70, 60, -120);
    // scene.add( newMesh );


    // LIGHT
    var light = new THREE.PointLight(0xF55DB3, 2, 200);
    light.position.set(0,0,0);
    scene.add(light);
    lights.push(light);

    var light = new THREE.PointLight(0xC25DF5, 2, 200);
    light.position.set(0,0,-100);
    scene.add(light);
    lights.push(light);

    setupGui();
    render();
}

function setupGui() {
    // gui
    var gui = new dat.GUI();
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

    for (var i = 0; i < lights.length; i++) {
        lights[i].intensity = lightProps.intensity;
        lights[i].distance = lightProps.distance;
        lights[i].decay = lightProps.decay;
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
        controls = new THREE.OrbitControls( camera, renderer.domElement );
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