// A Room has:
//  - a mesh generated using constructive solid geometry
//  - a point light
// it animates towards the camera

var Room = window.Room = function(properties) {

    this.properties = properties || this.propertiesDefault;
    var colour = COLOURS[Math.floor(Math.random() * COLOURS.length)];
    var roomMaterial = new THREE.MeshPhongMaterial({color:colour, fog: true, shininess: 80});

    // var cubeGeometry = new THREE.BoxGeometry( 100, this.properties.depth, 100, 1, 1, 1 );
    // var cubeMesh = new THREE.Mesh( cubeGeometry );
    // var cubeBSP = new ThreeBSP( cubeMesh );

    var w, h;
    if (Math.random() > 0.5) {
        w = 15; h = 8;
    }
    else {
        w = 8; h = 15;
    }
    // var barGeometry = new THREE.BoxGeometry( w, this.properties.depth, h, 1, 1, 1 );
    // var barMesh = new THREE.Mesh( barGeometry );
    // var barBSP = new ThreeBSP( barMesh );

    var cylinderGeometry = new THREE.CylinderGeometry( 32, 32, this.properties.depth, 64 );
    var cylinderMesh = new THREE.Mesh( cylinderGeometry );
    var cylinderBSP = new ThreeBSP( cylinderMesh );

    // ROUNDED
    // Rounded rectangle
    var extrudeSettings = { amount: this.properties.depth, bevelEnabled: false};
    var roundedRectShape = new THREE.Shape();
    this.roundedRect(roundedRectShape, 0, 0, w, h, 2);
    var extrusionMesh = this.getExtrudedMesh( roundedRectShape, extrudeSettings, 0xffff, -w/2, -h/2, this.properties.depth/2, Math.PI/2, 0, 0, 1 );
    var extrusionBSP = new ThreeBSP( extrusionMesh );
    // w = 32;
    // h = 32;
    // var roundedRectShape = new THREE.Shape();
    // this.roundedRect(roundedRectShape, 0, 0, w, h, 2);
    // var extrusionMesh = this.getExtrudedMesh( roundedRectShape, extrudeSettings, 0xffff, -w/2, -h/2, this.properties.depth/2, Math.PI/2, 0, 0, 1 );
    // var roomExtrusionBSP = new ThreeBSP( extrusionMesh );
    
    // subtract aperture shape from room
    var newBSP = cylinderBSP.subtract( extrusionBSP );

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
    return this.roomMesh.position.z;
};

Room.prototype.reset = function(z) {
    this.roomMesh.position.set( 0, 0, z );
    this.light.position.set( 0, 0, z - this.lightZOffset);
    // this.light.intensity = randomInRange(0.1, 0.6);
    var colour = COLOURS[Math.floor(Math.random() * COLOURS.length)];
    this.roomMesh.material.color.setHex(colour);
};

Room.prototype.roundedRect = function(ctx, x, y, width, height, radius) {

        ctx.moveTo(x, y + radius);
        ctx.lineTo(x, y + height - radius);
        ctx.quadraticCurveTo(x, y + height, x + radius, y + height);
        ctx.lineTo(x + width - radius, y + height);
        ctx.quadraticCurveTo(x + width, y + height, x + width, y + height - radius);
        ctx.lineTo(x + width, y + radius);
        ctx.quadraticCurveTo(x + width, y, x + width - radius, y);
        ctx.lineTo(x + radius, y);
        ctx.quadraticCurveTo(x, y, x, y + radius);

    }

Room.prototype.getExtrudedMesh = function(shape, extrudeSettings, color, x, y, z, rx, ry, rz, s) {
    var geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
    geometry.rotateX(rx);
    geometry.translate(x, z, y);
    geometry.verticesNeedUpdate = true;
    var mesh = new THREE.Mesh(geometry, this.roomMaterial);
    return mesh;
}

Room.prototype.propertiesDefault = {
    z : 0
}