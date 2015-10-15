///////////////////////////////////////////////////////////////////////////////
// variables
/////////////////////////////////////////////////////////////////////////////
// Threejs scene and renderer
var scene, camera, renderer, effect, controls;
var element, container;
// mouse position
var mouse = new THREE.Vector3();
var mouseX = mouseY = 0;
var raycaster = new THREE.Raycaster();
var depthMaterial = new THREE.MeshDepthMaterial();
// particles
var particlesGeometry;
var particles = [];
var noise = new ClassicalNoise();
var simplexNoise = new SimplexNoise();
var useSimplex = false;
var count = 0;
var noiseIn = 0.1;
var noiseOut = 0.1;
var damping = 0.8;
var particleCount = 10000;
var isMouseDown = false;
var lockToMouse = true;
var lineFrameMod = 1;
var LINE_LENGTH = 1;
var ambientVelocity = 1;
var lockz = false;
var isPaused = false;
var isDepthVisible = false;
var nearCamPos = new THREE.Vector3(0, 0, 2);
var farCamPos = new THREE.Vector3(0, 0, 7);

///////////////////////////////////////////////////////////////////////////////
// particles
/////////////////////////////////////////////////////////////////////////////
function setup() {
    // Threejs setup
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0xffffff, 0.1);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 20);
    camera.position.z = 5;
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0xffffff);
    renderer.setSize(window.innerWidth, window.innerHeight);
    element = renderer.domElement;
    container = document.getElementById('holder');
    container.appendChild(renderer.domElement);

    // add particles
    particlesGeometry = new THREE.Geometry();
    var material = new THREE.LineBasicMaterial({
        color: 0x0000ee,
        linewidth: 1,
        fog: true
    });
    for (var i = 0; i < particleCount; i++) {
        particles.push(new createParticle());
    }
    var mesh = new THREE.Line(particlesGeometry, material, THREE.LinePieces);
    scene.add(mesh);
    console.log(particlesGeometry.vertices.length);

    // start render loop
    render();
}

function setupGui() {
    // gui
    var gui = new dat.GUI();
    gui.add(this, 'noiseIn', 0.0, 1.0);
    gui.add(this, 'noiseOut', 0.0, 0.5);
    gui.add(this, 'useSimplex');
    gui.add(this, 'damping', 0.0, 1.0);
    gui.add(this, 'ambientVelocity', 0.0, 2.0);
    // gui.add(this, 'lineFrameMod', 1, 5);
    gui.add(this, 'particleCount', 1, 30000);
    var guiDepth = gui.addFolder("depth");
    guiDepth.add(this, 'lockz');
    guiDepth.add(this, 'isDepthVisible').onChange(function(e) {
        if (e) {
            scene.overrideMaterial = depthMaterial;
            renderer.setClearColor(new THREE.Color(0x00000, 1.0));
        } else {
            scene.overrideMaterial = null;
            renderer.setClearColor(new THREE.Color(0xffffff, 1.0));
        }
    });
    var controls = {
        cameraNear: camera.near,
        cameraFar: camera.far
    }
    guiDepth.add(controls, 'cameraNear', 0, 50).onChange(function(e) {
        camera.near = e;
    });
    guiDepth.add(controls, 'cameraFar', 0, 50).onChange(function(e) {
        camera.far = e;
    });
}

function createParticle() {
    var rndPos = 3;
    this.pos = new THREE.Vector3(randomInRange(-rndPos, rndPos), randomInRange(-rndPos, rndPos), 0);
    this.vel = new THREE.Vector3(0, 0, 0);
    var maxVel = 0.1;
    this.rnd3 = new THREE.Vector3(randomInRange(-maxVel, maxVel), randomInRange(-maxVel, maxVel), randomInRange(-maxVel, maxVel));
    this.rnd = Math.random();
    this.seed = Math.random();
    this.radius = randomInRange(0.1, 0.1);
    this.count = 0;
    this.positions = [];
    // populate position history and particle geometry vertices
    for (var i = 0; i < LINE_LENGTH * 2; i++) {
        this.positions.push(this.pos.clone());
        particlesGeometry.vertices.push(this.pos.clone());
    };
    // methods
    this.addVerts = function() {
        for (var i = 0; i < LINE_LENGTH * 2; i++) {
            particlesGeometry.vertices.push(this.pos.clone());
        };
    }
    this.update = function(vel) {
        this.pos.x += vel.x;
        this.pos.y += vel.y;
        if (lockz) this.pos.z = 0;
        else this.pos.z += vel.z;
        if (this.count++ % Math.round(lineFrameMod) == 0) {
            this.positions.push(this.positions[this.positions.length - 1].clone());
            this.positions.push(new THREE.Vector3(this.pos.x, this.pos.y, this.pos.z));
            while (this.positions.length > LINE_LENGTH * 2) this.positions.splice(0, 1);
        }
    }
    this.reset = function() {
        this.pos.set(0, 0, 0);
        for (var i = 0; i < LINE_LENGTH * 2; i++) {
            this.positions.push(this.pos.clone());
            particlesGeometry.vertices.push(this.pos.clone());
        };
    }
    this.update(this.vel);
}

function update() {

    var toMouse = new THREE.Vector3();
    for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        // update velocity and position
        p.vel.x = p.rnd3.x * ambientVelocity;
        p.vel.y = p.rnd3.y * ambientVelocity;
        p.vel.z = p.rnd3.z * ambientVelocity;
        // attract to mouse
        if (isMouseDown || lockToMouse) {
            toMouse.copy(mouse);
            toMouse.sub(p.pos);
            var length = toMouse.lengthSq();
            var force = .13;
            if (isMouseDown) {
                if (length < 1) force *= -1;
                else force = 0;
            }
            toMouse.normalize();
            toMouse = toMouse.multiplyScalar(force);
            p.vel.x += toMouse.x;
            p.vel.y += toMouse.y;
            p.vel.z += toMouse.z;
        }
        // noise
        if (useSimplex) {
            p.vel.x += simplexNoise.noise(p.pos.z * noiseIn, p.pos.y * noiseIn, p.seed * noiseIn) * noiseOut;
            p.vel.y += simplexNoise.noise(p.pos.x * noiseIn, p.pos.z * noiseIn, p.seed * noiseIn) * noiseOut;
            p.vel.z += simplexNoise.noise(p.pos.y * noiseIn, p.pos.x * noiseIn, p.seed * noiseIn) * noiseOut;
        } else {
            p.vel.x += noise.noise(p.pos.z * noiseIn, p.pos.y * noiseIn, p.seed * noiseIn) * noiseOut;
            p.vel.y += noise.noise(p.pos.x * noiseIn, p.pos.z * noiseIn, p.seed * noiseIn) * noiseOut;
            p.vel.z += noise.noise(p.pos.y * noiseIn, p.pos.x * noiseIn, p.seed * noiseIn) * noiseOut;
        }
        // damp
        p.vel.x *= damping;
        p.vel.y *= damping;
        p.vel.z *= damping;
        // bounds check
        var fromCentre = p.pos.distanceTo(scene.position);
        if (fromCentre > 6) {
            var toCentre = new THREE.Vector3().subVectors(scene.position, p.pos).multiplyScalar(0.01);
            p.vel = toCentre;
            p.rnd3.add(toCentre)
        }
        p.update(p.vel);
        p.seed += p.rnd;
        // update particle geometry vertices
        if (particlesGeometry) {
            var vertI = i * LINE_LENGTH * 2;
            for (var j = 0; j < LINE_LENGTH * 2; j++) {
                particlesGeometry.vertices[vertI + j].x = p.positions[j].x;
                particlesGeometry.vertices[vertI + j].y = p.positions[j].y;
                particlesGeometry.vertices[vertI + j].z = p.positions[j].z;
            };
        }
    }
    if (particlesGeometry) particlesGeometry.verticesNeedUpdate = true;
    checkCount();
}

// Check target particle count
// add or remove particles accordingly
// refresh geometry vertices if required
function checkCount() {
    var refreshVerts = false;
    if (particles.length < Math.round(particleCount)) {
        var newCount = Math.round(particleCount) - particles.length;
        for (var i = 0; i < newCount; i++) {
            particles.push(new createParticle());
        }
        // console.log("Added " + newCount + " particles, new particles count is " + particles.length);
        refreshVerts = true;
    } else if (Math.round(particleCount) < particles.length) {
        while (particles.length > Math.round(particleCount)) {
            scene.remove(particles[0].line);
            particles.splice(0, 1);
        }
        // console.log("removed particles, new particles count is " + particles.length);
        refreshVerts = true;
    }

    if (refreshVerts) {
        particlesGeometry.vertices = [];
        particlesGeometry.dispose();
        for (var i = 0; i < particles.length; i++) {
            particles[i].addVerts();
        }
        particlesGeometry.verticesNeedUpdate = true;
        // console.log("New vertices count: " + particlesGeometry.vertices.length);
    }
}

function render() {
    requestAnimationFrame(render);
    // if we have controls, we're in cardboard mode
    if (controls) {
        controls.update();
        // animate noise for variation
        var time = Date.now() * 0.000015;
        noiseIn = Math.cos(time) * 1;
        noiseOut = Math.sin(time) * 0.5;
        // make particles flock to where we're looking
        var lookAtVector = new THREE.Vector3(0, 0, -1);
        lookAtVector.applyQuaternion(camera.quaternion);
        lookAtVector.normalize();
        lookAtVector.multiplyScalar(6);
        var pos = new THREE.Vector3().addVectors(camera.position.clone(), lookAtVector);
        mouse.copy(pos);
        // animate camera in and out based on whether we're paused
        if (isPaused) {
            camera.position.lerp(nearCamPos, 0.1);
        } else {
            camera.position.lerp(farCamPos, 0.06);
            update();
        }
        // render stereo effect
        effect.render(scene, camera);

    } else {
        // normal browser mode
        if (isPaused) {
            camera.position.x += (mouseX - camera.position.x) * 0.036;
            camera.position.y += (-(mouseY) - camera.position.y) * 0.036;
            camera.lookAt(scene.position);
        } else {
            camera.position.x += (0 - camera.position.x) * 0.036;
            camera.position.y += (0 - camera.position.y) * 0.036;
            camera.lookAt(scene.position);
            update();
        }
        renderer.render(scene, camera);
    }
}

function onMouseMove(event) {
    mouseX = (event.clientX - (window.innerWidth / 2)) / 50;
    mouseY = (event.clientY - (window.innerHeight / 2)) / 50;
    // calculate mouse position in normalized device coordinates
    // (-1 to +1) for both components
    var vector = new THREE.Vector3();
    vector.set(
        (event.clientX / window.innerWidth) * 2 - 1, -(event.clientY / window.innerHeight) * 2 + 1,
        0.5);
    vector.unproject(camera);
    var dir = vector.sub(camera.position).normalize();
    var distance = -camera.position.z / dir.z;
    var pos = camera.position.clone().add(dir.multiplyScalar(distance));
    mouse.copy(pos);
}

function onMousePress(event) {
    isMouseDown = true;
}

function onMouseRelease(event) {
    isMouseDown = false;
}

function onKeyPress(event) {
    // console.log(event.keyCode);
    if (event.keyCode == '80') isPaused = !isPaused;
    else if (event.keyCode == '38') camera.position.z -= 0.5;
    else if (event.keyCode == '40') camera.position.z += 0.5;
}

function setOrientationControls(e) {
    if (e.alpha) {
        // cardboard
        effect = new THREE.StereoEffect(renderer);
        effect.eyeSeparation = 0;
        effect.setSize(window.innerWidth, window.innerHeight);
        useSimplex = true;
        ambientVelocity = 0.2;
        particleCount = 2000;
        controls = new THREE.DeviceOrientationControls(camera, true);
        controls.connect();
        element.addEventListener('click', fullscreen, false);
        window.removeEventListener('deviceorientation', setOrientationControls, true);
    } else {
        setupGui();
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
window.addEventListener('keyup', onKeyPress, false);
window.addEventListener('deviceorientation', setOrientationControls, true);
window.addEventListener('resize', onWindowResize, false);



///////////////////////////////////////////////////////////////////////////////
// helpers
/////////////////////////////////////////////////////////////////////////////

function fullscreen() {
    isPaused = !isPaused;
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

function randomInRange($min, $max, $precision) {
    if (typeof($precision) == 'undefined') {
        $precision = 2;
    }
    return parseFloat(Math.min($min + (Math.random() * ($max - $min)), $max).toFixed($precision));
};