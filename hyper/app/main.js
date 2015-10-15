///////////////////////////////////////////////////////////////////////////////
// variables
/////////////////////////////////////////////////////////////////////////////
// Threejs scene and renderer
var scene, camera, renderer, effect, controls;
var element, container;
// particles
var particles = [];
var particleCount = 2000;
var isMouseDown = false;
var radius = 5;
var maxRadius = 80;
var LINE_LENGTH = 2;
var damping = 0.8;
var velocity = new THREE.Vector3(0, 0, 0);
var acceleration = 0;
var maxDistance = -200;
var geometry;

///////////////////////////////////////////////////////////////////////////////
// particles
/////////////////////////////////////////////////////////////////////////////
function setup() {
    scene = new THREE.Scene();
    scene.fog = new THREE.FogExp2(0x000000, 0.01);
    camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 200);
    camera.position.z = 50;
    renderer = new THREE.WebGLRenderer({
        antialias: true
    });
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setClearColor(0x000000);
    renderer.setSize(window.innerWidth, window.innerHeight);
    element = renderer.domElement;
    container = document.getElementById('holder');
    container.appendChild(renderer.domElement);


    geometry = new THREE.Geometry();
    var material = new THREE.LineBasicMaterial({
        color: 0xffffff,
        linewidth: 1,
        fog: true
    });
    var angleChangePerPt = (Math.PI * 2) / particleCount;
    var angle = Math.PI * 0.5;
    for (var i = 0; i < particleCount; i++) {
        var p = new createParticle(angle)
        particles.push(new createParticle(angle));
        geometry.vertices.push(p.pos.clone());
        geometry.vertices.push(p.pos.clone());
        angle += angleChangePerPt;
    };
    var mesh = new THREE.Line(geometry, material, THREE.LinePieces);
    scene.add(mesh);

    render();
}

function setupGui() {
    // gui
    var gui = new dat.GUI();
    gui.add(this, 'particleCount', 1, 4000);
    gui.add(velocity, 'z', 0.0, 20.0).listen();
    var guiDepth = gui.addFolder("depth");
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

function createParticle(angle) {
    this.angle = angle;
    this.radius = radius + (Math.random() * maxRadius);
    var x = this.radius * Math.cos(angle);
    var y = this.radius * Math.sin(angle);
    var z = Math.random() * -maxDistance;
    this.pos = new THREE.Vector3(x, y, z);
    this.positions = [this.pos.clone()];
    this.update = function() {
        if (velocity.z > 10) this.angle += map(velocity.z, 10, 20, 0, 0.3);
        var x = this.radius * Math.cos(this.angle);
        var y = this.radius * Math.sin(this.angle);
        this.pos.x = x;
        this.pos.y = y;
        this.pos.z += velocity.z;
        this.positions.push(new THREE.Vector3(this.pos.x, this.pos.y, this.pos.z));
        while (this.positions.length > LINE_LENGTH) this.positions.splice(0, 1);
    }
    this.reset = function(angle) {
        if (angle) this.angle = angle
        var x = this.radius * Math.cos(this.angle);
        var y = this.radius * Math.sin(this.angle);
        var z = Math.random() * maxDistance;
        this.pos.z = z;
        this.pos.x = x;
        this.pos.y = y;
        for (var i = 0; i < this.positions.length; i++) {
            this.positions[i].x = x;
            this.positions[i].y = y;
            this.positions[i].z = z;
        }
    }
    this.update();
}

function update() {

    if (isMouseDown) acceleration += 0.01; 
    else acceleration -= 0.008;
    acceleration = clamp(acceleration, 0, 5);
    velocity.z += acceleration;
    velocity.z *= 0.8;
    velocity.z = clamp(velocity.z, 0.04, 20);

    if (velocity.z > 15) {
        var bg = 0x476AB2 * (velocity.z * Math.random())
        renderer.setClearColor(bg);
    } else {
        renderer.setClearColor(0x000000);
    }

    for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        // update velocity and position
        p.update();
        // bounds
        if (p.positions[1].z > 50) {
            p.reset();
        }
        if (geometry) {
            var vertI = i*2;
            geometry.vertices[vertI].x = p.positions[0].x;
            geometry.vertices[vertI].y = p.positions[0].y;
            geometry.vertices[vertI].z = p.positions[0].z;
            geometry.vertices[vertI + 1].x = p.positions[1].x;
            geometry.vertices[vertI + 1].y = p.positions[1].y;
            geometry.vertices[vertI + 1].z = p.positions[1].z;
        }
    }
    if (geometry) geometry.verticesNeedUpdate = true;


    if (particles.length < Math.round(particleCount)) {
        var newCount = Math.round(particleCount) - particles.length;
        for (var i = 0; i < newCount; i++) {
            particles.push(new createParticle());
        }
        positionParticles();
        console.log("added " + newCount + " particles, new particles count is " + particles.length + " scene children count is " + scene.children.length);
    } else if (Math.round(particleCount) < particles.length) {
        var i = 0;
        while (particles.length > Math.round(particleCount)) {
            scene.remove(particles[0].line);
            particles.splice(0, 1);
        }
        positionParticles();
        console.log("removed particles, new particles count is " + particles.length + " scene children count is " + scene.children.length);
    }
}

function positionParticles() {
    var angleChangePerPt = (Math.PI * 2) / particleCount;
    var angle = Math.PI * 0.5;
    for (var i = 0; i < particleCount; i++) {
        particles[i].reset(angle);
        angle += angleChangePerPt;
    };
}

function render() {
    requestAnimationFrame(render);
    update();
    if (controls) {
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
        controls = new THREE.DeviceOrientationControls(camera, true);
        controls.connect();
        element.addEventListener('click', fullscreen, false);
        window.removeEventListener('deviceorientation', setOrientationControls, true);
    } else {
        // setupGui();
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

function randomInRange($min, $max, $precision) {
    if (typeof($precision) == 'undefined') {
        $precision = 2;
    }
    return parseFloat(Math.min($min + (Math.random() * ($max - $min)), $max).toFixed($precision));
};