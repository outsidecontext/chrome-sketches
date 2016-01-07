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
    this.colours = [ 0xF55DB3, 0x7B23AD, 0x3A50C9, 0xF7E51B, 0xFA980F ];
    var colour = this.colours[Math.floor(Math.random() * this.colours.length)];
    var roomMaterial = new THREE.MeshPhongMaterial({color:colour, fog: true, shininess: 30});

    
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

    var cylinderGeometry = new THREE.CylinderGeometry( 16, 16, this.properties.depth, 32 );
    var cylinderMesh = new THREE.Mesh( cylinderGeometry );
    var cylinderBSP = new ThreeBSP( cylinderMesh );
    
    // Example #1 - Cube subtract Sphere
    var newBSP = sphereBSP.subtract( barBSP );
    // var newBSP = sphereBSP.subtract( cylinderBSP );

    this.roomMesh = newBSP.toMesh( roomMaterial );
    this.roomMesh.position.set( 0, 0, this.properties.z );
    this.roomMesh.rotation.x = Math.PI/2;
    this.roomMesh.material.side = THREE.BackSide;


    // LIGHT
    this.light = new THREE.PointLight(0xffffff, 2, 200);
    this.light.position.set( 0, 0, this.properties.z );

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
    var colour = this.colours[Math.floor(Math.random() * this.colours.length)];
    this.roomMesh.material.color.setHex(colour);
};

Room.prototype.propertiesDefault = {
    z : 0
}