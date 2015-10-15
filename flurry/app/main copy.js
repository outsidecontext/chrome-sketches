///////////////////////////////////////////////////////////////////////////////
// variables
/////////////////////////////////////////////////////////////////////////////
// Threejs scene and renderer
var scene = new THREE.Scene();
var camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 1, 3000);
var renderer = new THREE.WebGLRenderer({
    antialias: false
});
camera.position.z = 5;
renderer.setClearColor(0xffffff);
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);
// mouse position
var mouse = new THREE.Vector3();
var force = 8;
var mouseFocus = new THREE.Vector3();
var mouseX = mouseY = 0;
var raycaster = new THREE.Raycaster();
// particles
var particles = [];
var noise = new ClassicalNoise();
var simplexNoise = new SimplexNoise();
var useSimplex = false;
var count = 0;
var noiseIn = 0.1;
var noiseOut = 0.1;
var damping = 0.8;
var particleCount = 2000;
var isMouseDown = false;
var lockToMouse = true;
var lineFrameMod = 1;
var lineLength = 5;
var ambientVelocity = 1;
var lockz = false;
var isPaused = false;


var windowHalfX = window.innerWidth / 2;
var windowHalfY = window.innerHeight / 2;
var height = window.innerHeight;
var material_depth;
var postprocessing = {};
var postprocessing = {
    enabled: true
};
var shaderSettings = {
    rings: 3,
    samples: 4
};
var singleMaterial = false;
var raycaster = new THREE.Raycaster();
var distance = 100;
var target = new THREE.Vector3(0, 20, -50);
var effectController;

///////////////////////////////////////////////////////////////////////////////
// particles
/////////////////////////////////////////////////////////////////////////////
function setup() {
    // gui
    var gui = new dat.GUI();
    gui.add(this, 'noiseIn', 0.0, 10.0);
    gui.add(this, 'noiseOut', 0.0, 10.0);
    gui.add(this, 'useSimplex');
    gui.add(this, 'damping', 0.0, 1.0);
    gui.add(this, 'ambientVelocity', 0.0, 10.0);
    gui.add(this, 'force', 0.0, 10.0);
    gui.add(this, 'lockz');
    gui.add(this, 'lineFrameMod', 1, 5);
    gui.add(this, 'particleCount', 1, 4000);
    gui.add(this, 'isPaused').listen();
    // gui.close();

    for (var i = 0; i < particleCount; i++) {
        particles.push(new createParticle());
    }

    material_depth = new THREE.MeshDepthMaterial();
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.sortObjects = false;
    renderer.autoClear = false;

    initPostprocessing();

    effectController = {

        enabled: true,
        jsDepthCalculation: false,
        shaderFocus: false,

        fstop: 2.2,
        maxblur: 1.0,

        showFocus: false,
        focalDepth: 20,
        manualdof: false,
        vignetting: false,
        depthblur: false,

        threshold: 0.5,
        gain: 2.0,
        bias: 0.5,
        fringe: 0.7,

        focalLength: 35,
        noise: true,
        pentagon: false,

        dithering: 0.0001

    };
    var matChanger = function() {

        for (var e in effectController) {
            if (e in postprocessing.bokeh_uniforms)
                postprocessing.bokeh_uniforms[e].value = effectController[e];
        }

        postprocessing.enabled = effectController.enabled;
        postprocessing.bokeh_uniforms['znear'].value = camera.near;
        postprocessing.bokeh_uniforms['zfar'].value = camera.far;
        camera.setLens(effectController.focalLength);

    };

    gui.add(effectController, "enabled").onChange(matChanger);
    gui.add(effectController, "jsDepthCalculation").onChange(matChanger);
    gui.add(effectController, "shaderFocus").onChange(matChanger);
    gui.add(effectController, "focalDepth", 0.0, 80.0).listen().onChange(matChanger);

    gui.add(effectController, "fstop", 0.1, 22, 0.001).onChange(matChanger);
    gui.add(effectController, "maxblur", 0.0, 5.0, 0.025).onChange(matChanger);

    gui.add(effectController, "showFocus").onChange(matChanger);
    gui.add(effectController, "manualdof").onChange(matChanger);
    gui.add(effectController, "vignetting").onChange(matChanger);

    gui.add(effectController, "depthblur").onChange(matChanger);

    gui.add(effectController, "threshold", 0, 1, 0.001).onChange(matChanger);
    gui.add(effectController, "gain", 0, 100, 0.001).onChange(matChanger);
    gui.add(effectController, "bias", 0, 3, 0.001).onChange(matChanger);
    gui.add(effectController, "fringe", 0, 5, 0.001).onChange(matChanger);

    gui.add(effectController, "focalLength", 16, 80, 0.001).onChange(matChanger)

    gui.add(effectController, "noise").onChange(matChanger);

    gui.add(effectController, "dithering", 0, 0.001, 0.0001).onChange(matChanger);

    gui.add(effectController, "pentagon").onChange(matChanger);

    gui.add(shaderSettings, "rings", 1, 8).step(1).onChange(shaderUpdate);
    gui.add(shaderSettings, "samples", 1, 13).step(1).onChange(shaderUpdate);


    render();
}

function createParticle() {
    var rndPos = 100;
    this.pos = new THREE.Vector3(randomInRange(-rndPos, rndPos), randomInRange(-rndPos, rndPos), 0);
    this.vel = new THREE.Vector3(0, 0, 0);
    var maxVel = 4;
    this.rnd3 = new THREE.Vector3(randomInRange(-maxVel, maxVel), randomInRange(-maxVel, maxVel), randomInRange(-maxVel, maxVel));
    this.rnd = Math.random();
    this.seed = Math.random();
    this.radius = randomInRange(0.1, 0.1);
    this.count = 0;

    var geometry = new THREE.Geometry();
    geometry.vertices.push(
        this.pos.clone()
    );
    var material = new THREE.LineBasicMaterial({
        color: 0x0000ee,
        linewidth: 2
    });
    this.line = new THREE.Line(geometry, material);

    // box
    // var geometry = new THREE.BoxGeometry(10, 10, 10);
    // var material = new THREE.MeshBasicMaterial({
    //     color: 0x0000ee
    // });
    // this.cube = new THREE.Mesh(geometry, material);
    // scene.add(this.cube);

    this.update = function(vel) {
        this.pos.x += vel.x;
        this.pos.y += vel.y;
        // lock z?
        if (lockz) this.pos.z = 0;
        else this.pos.z += vel.z;
        if (this.count++ % Math.round(lineFrameMod) == 0) {
            this.line.geometry.vertices.push(new THREE.Vector3(this.pos.x, this.pos.y, this.pos.z));
            while (this.line.geometry.vertices.length > lineLength) this.line.geometry.vertices.splice(0, 1);
            this.line.geometry.verticesNeedUpdate = true;
        }
        // this.cube.position.x = this.pos.x;
        // this.cube.position.y = this.pos.y;
        // this.cube.position.z = this.pos.z;
    }
    this.update(this.vel);
    scene.add(this.line);
}

function update() {
    // draw particles
    console.log("update, isMouseDown: " +  isMouseDown + " lockToMouse: " + lockToMouse);
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
            var f = force;
            if (isMouseDown) {
                if (length < 1) f *= -1;
                else f = 0;
            }
            toMouse.normalize();
            toMouse = toMouse.multiplyScalar(f);
            p.vel.x += toMouse.x;
            p.vel.y += toMouse.y;
            p.vel.z += toMouse.z;

            // particles[i].line.material.color = 0xff0000;
            // particles[i].line.material.needsUpdate = true;
        }

        if (useSimplex) {
            p.vel.x += simplexNoise.noise(p.pos.z * noiseIn, p.pos.y * noiseIn, p.seed * noiseIn) * noiseOut;
            p.vel.y += simplexNoise.noise(p.pos.x * noiseIn, p.pos.z * noiseIn, p.seed * noiseIn) * noiseOut;
            // p.vel.z += simplexNoise.noise(p.pos.y * noiseIn, p.pos.x * noiseIn, p.seed * noiseIn) * noiseOut;
        } else {
            p.vel.x += noise.noise(p.pos.z * noiseIn, p.pos.y * noiseIn, p.seed * noiseIn) * noiseOut;
            p.vel.y += noise.noise(p.pos.x * noiseIn, p.pos.z * noiseIn, p.seed * noiseIn) * noiseOut;
            // p.vel.z += noise.noise(p.pos.y * noiseIn, p.pos.x * noiseIn, p.seed * noiseIn) * noiseOut;
        }

        p.vel.x *= damping;
        p.vel.y *= damping;
        p.vel.z *= damping;
        p.update(p.vel);

        // stay in canvas
        var limit = 500;
        if (p.pos.x < -limit) {
            p.pos.x = -limit
            p.rnd3.x *= -1;
        }
        if (p.pos.x > limit) {
            p.pos.x = limit
            p.rnd3.x *= -1;
        }
        if (p.pos.y < -limit) {
            p.pos.y = -limit
            p.rnd3.y *= -1;
        }
        if (p.pos.y > limit) {
            p.pos.y = limit
            p.rnd3.y *= -1;
        }

        p.seed += p.rnd;
    }

    count++;


    if (Math.round(particleCount) > particles.length) {
        var newCount = Math.round(particleCount) - particles.length;
        for (var i = 0; i < newCount; i++) {
            particles.push(new createParticle());
        }
        console.log("added " + newCount + " particles, new particles count is " + particles.length + " scene children count is " + scene.children.length);
    } else if (Math.round(particleCount) < particles.length) {
        var i = 0;
        while (particles.length > Math.round(particleCount)) {
            scene.remove(particles[i].line);
            particles.splice(i, 1);
            i++;
        }
        console.log("removed particles, new particles count is " + particles.length + " scene children count is " + scene.children.length);
    }
}

function render() {
    requestAnimationFrame(render);

    if (!isPaused) update();
    // renderer.render(scene, camera);

    camera.position.x += (mouseX - camera.position.x) * 0.036;
    camera.position.y += (-(mouseY) - camera.position.y) * 0.036;

    var time = Date.now() * 0.00015;
    // camera.position.x = Math.cos(time) * 400;
    camera.position.z = 400;
    // camera.position.y = Math.sin(time / 1.4) * 100;
    camera.lookAt(scene.position);
    camera.updateMatrixWorld();

    if (effectController.jsDepthCalculation) {

        raycaster.setFromCamera(mouseFocus, camera);

        var intersects = raycaster.intersectObjects(scene.children, true);
        // console.log(intersects.length);


        if (intersects.length > 0) {

            var targetDistance = intersects[0].distance;

            distance += (targetDistance - distance) * 0.03;

            var sdistance = smoothstep(camera.near, camera.far, distance);

            var ldistance = linearize(1 - sdistance);

            // (Math.random() < 0.1) && console.log('moo', targetDistance, distance, ldistance);

            postprocessing.bokeh_uniforms['focalDepth'].value = ldistance;

            effectController['focalDepth'] = ldistance;

        }

    }

    if (postprocessing.enabled) {

        renderer.clear();

        // Render scene into texture

        scene.overrideMaterial = null;
        renderer.render(scene, camera, postprocessing.rtTextureColor, true);

        // Render depth into texture

        scene.overrideMaterial = material_depth;
        renderer.render(scene, camera, postprocessing.rtTextureDepth, true);

        // Render bokeh composite

        renderer.render(postprocessing.scene, postprocessing.camera);


    } else {

        scene.overrideMaterial = null;

        renderer.clear();
        renderer.render(scene, camera);

    }
}

function onMouseMove(event) {
    mouseX = (event.clientX - (window.innerWidth / 2)) / 10;
    mouseY = (event.clientY - (window.innerHeight / 2)) / 10;
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


    // mouseFocus.x = (event.clientX - windowHalfX) / windowHalfX;
    // mouseFocus.y = -(event.clientY - windowHalfY) / windowHalfY;
    // postprocessing.bokeh_uniforms['focusCoords'].value.set(event.clientX / window.innerWidth, 1 - event.clientY / window.innerHeight);
}

function onMousePress(event) {
    isMouseDown = true;
    console.log(isMouseDown);
}

function onMouseRelease(event) {
    isMouseDown = false;
    console.log(isMouseDown);
}

function onKeyPress(event) {
    console.log(event.keyCode);
    if (event.keyCode == '80') isPaused = !isPaused;
}

window.addEventListener('mousemove', onMouseMove, false);
window.addEventListener('mousedown', onMousePress, false);
window.addEventListener('mouseup', onMouseRelease, false);
window.addEventListener('keyup', onKeyPress, false);


function initPostprocessing() {

    postprocessing.scene = new THREE.Scene();

    postprocessing.camera = new THREE.OrthographicCamera(window.innerWidth / -2, window.innerWidth / 2, window.innerHeight / 2, window.innerHeight / -2, -10000, 10000);
    postprocessing.camera.position.z = 100;

    postprocessing.scene.add(postprocessing.camera);

    var pars = {
        minFilter: THREE.LinearFilter,
        magFilter: THREE.LinearFilter,
        format: THREE.RGBFormat
    };
    postprocessing.rtTextureDepth = new THREE.WebGLRenderTarget(window.innerWidth, height, pars);
    postprocessing.rtTextureColor = new THREE.WebGLRenderTarget(window.innerWidth, height, pars);



    var bokeh_shader = THREE.BokehShader;

    postprocessing.bokeh_uniforms = THREE.UniformsUtils.clone(bokeh_shader.uniforms);

    postprocessing.bokeh_uniforms["tColor"].value = postprocessing.rtTextureColor;
    postprocessing.bokeh_uniforms["tDepth"].value = postprocessing.rtTextureDepth;

    postprocessing.bokeh_uniforms["textureWidth"].value = window.innerWidth;

    postprocessing.bokeh_uniforms["textureHeight"].value = height;

    postprocessing.materialBokeh = new THREE.ShaderMaterial({

        uniforms: postprocessing.bokeh_uniforms,
        vertexShader: bokeh_shader.vertexShader,
        fragmentShader: bokeh_shader.fragmentShader,
        defines: {
            RINGS: shaderSettings.rings,
            SAMPLES: shaderSettings.samples
        }

    });

    postprocessing.quad = new THREE.Mesh(new THREE.PlaneBufferGeometry(window.innerWidth, window.innerHeight), postprocessing.materialBokeh);
    postprocessing.quad.position.z = -500;
    postprocessing.scene.add(postprocessing.quad);

}

function shaderUpdate() {
    postprocessing.materialBokeh.defines.RINGS = shaderSettings.rings;
    postprocessing.materialBokeh.defines.SAMPLES = shaderSettings.samples;

    postprocessing.materialBokeh.needsUpdate = true;

}

function linearize(depth) {
    var zfar = camera.far;
    var znear = camera.near;
    return -zfar * znear / (depth * (zfar - znear) - zfar);
}


function smoothstep(near, far, depth) {
    var x = saturate((depth - near) / (far - near));
    return x * x * (3 - 2 * x);
}

function saturate(x) {
    return Math.max(0, Math.min(1, x));
}


///////////////////////////////////////////////////////////////////////////////
// helpers
/////////////////////////////////////////////////////////////////////////////

function randomInRange($min, $max, $precision) {
    if (typeof($precision) == 'undefined') {
        $precision = 2;
    }
    return parseFloat(Math.min($min + (Math.random() * ($max - $min)), $max).toFixed($precision));
};

// GO
setup();