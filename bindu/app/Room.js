// A Room has:
//  - a mesh generated using constructive solid geometry
//  - a point light
// it animates towards the camera

var Room = window.Room = function(properties) {

    this.properties = properties || this.propertiesDefault;

    console.log("New room at z" + properties.z);

    // CSG Test
    //shading: THREE.FlatShading
    // var roomMaterial = new THREE.MeshNormalMaterial();
    var colours = [ 0xF55DB3, 0x7B23AD, 0x3A50C9, 0xF7E51B, 0xFA980F ];
    var colour = colours[Math.floor(Math.random() * colours.length)]
    var roomMaterial = new THREE.MeshPhongMaterial({color:colour, fog: true});

    
    // var cubeGeometry = new THREE.CubeGeometry( 100, 100, 100, 1, 1, 1 );
    // var cubeMesh = new THREE.Mesh( cubeGeometry );
    // var cubeBSP = new ThreeBSP( cubeMesh );

    var w = randomInRange(10, 20);
    var h = randomInRange(10, 20);
    var barGeometry = new THREE.CubeGeometry( w, this.properties.depth, h, 1, 1, 1 );
    var barMesh = new THREE.Mesh( barGeometry );
    var barBSP = new ThreeBSP( barMesh );
        
    var sphereGeometry = new THREE.CylinderGeometry( 32, 32, this.properties.depth, 32 );
    var sphereMesh = new THREE.Mesh( sphereGeometry );
    var sphereBSP = new ThreeBSP( sphereMesh );

    // var cylinderGeometry = new THREE.CylinderGeometry( 2, 2, 120, 32 );
    // var cylinderMesh = new THREE.Mesh( cylinderGeometry );
    // var cylinderBSP = new ThreeBSP( cylinderMesh );
    
    // Example #1 - Cube subtract Sphere
    var newBSP = sphereBSP.subtract( barBSP );
    // var newBSP = sphereBSP.subtract( cylinderBSP );

    this.roomMesh = newBSP.toMesh( roomMaterial );
    // this.roomMesh.position = this.properties.position;
    this.roomMesh.position.set( 0, 0, this.properties.z );
    this.roomMesh.rotation.x = Math.PI/2;
    this.roomMesh.material.side = THREE.BackSide;
    //scene.add( roomMesh );

    // Example #2 - Sphere subtract Cube
    // var newBSP = sphereBSP.subtract( cubeBSP );
    // var roomMesh = newBSP.toMesh( roomMaterial );
    // roomMesh.position.set(180, 60, 0);
    // scene.add( roomMesh );
    
    // Example #3 - Cube union Sphere
    // var newBSP = sphereBSP.union( cubeBSP );
    // var roomMesh = newBSP.toMesh( roomMaterial );
    // roomMesh.position.set(70, 60, -120);
    // scene.add( roomMesh );

    // Example #4 - Cube intersect Sphere
    // var newBSP = sphereBSP.intersect( cubeBSP );
    // var roomMesh = newBSP.toMesh( roomMaterial );
    // roomMesh.position.set(-70, 60, -120);
    // scene.add( roomMesh );


    // LIGHT
    this.light = new THREE.PointLight(0xffffff, 2, 200);
    // this.light.position = this.properties.position;
    this.light.position.set( 0, 0, this.properties.z );
    //scene.add(light);

};

Room.prototype.update = function() {
    this.roomMesh.translateY(this.speed);
    this.light.translateZ(this.speed);
};

Room.prototype.getZ = function() {
    return this.light.position.z;
};

Room.prototype.reset = function(z) {
    this.roomMesh.position.set( 0, 0, z );
    this.light.position.set( 0, 0, z );
};

Room.prototype.propertiesDefault = {
    z : 0
}