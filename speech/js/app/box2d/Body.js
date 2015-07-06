//
// Helper class for managing and drawing simple box2d entities
// Uses PIXI to render

var Body = window.Body = function(world, details) {
    this.details = details = details || {};
    this.font = details.font || "40px Helvetica";
    this.fontHeight = 24;
    this.drawBg = false;
    var borderx2 = -2;

    // PIXI
    this.graphics = new PIXI.Sprite();
    this.graphics.anchor.x = 0.5;
    this.graphics.anchor.y = 0.5;

    // BOX2D
    // Create the definition
    this.definition = new b2BodyDef();
    // Set up the definition
    for (var k in this.definitionDefaults) {
        this.definition[k] = details[k] || this.definitionDefaults[k];
    }
    this.definition.position = new b2Vec2(details.x || 0, details.y || 0);
    this.definition.linearVelocity = new b2Vec2(details.vx || 0, details.vy || 0);
    this.definition.userData = this;
    this.definition.type = details.type == "static" ? b2Body.b2_staticBody : b2Body.b2_dynamicBody;
    // Create the Body
    this.body = world.CreateBody(this.definition);
    // Create the fixture
    this.fixtureDef = new b2FixtureDef();
    for (var l in this.fixtureDefaults) {
        this.fixtureDef[l] = details[l] || this.fixtureDefaults[l];
    }
    details.shape = details.shape || this.defaults.shape;

    if (details.label) {
        // get text metrics
        // char label
        var style = {
            font: this.font,
            align: 'center',
            fill: details.colour,
            wordWrap: true,
            wordWrapWidth: 500
        };
        this.graphicsLabel = new PIXI.Text(details.label || "X", style);
        this.graphicsLabel.anchor.x = 0.5;
        this.graphicsLabel.anchor.y = 0.5;
        // bg
        var w = this.graphicsLabel.width; //details.width*30;
        var h = this.graphicsLabel.height * 0.5; //details.height*30
        this.bg = new PIXI.Graphics();
        this.bg.beginFill(0xdddddd);
        this.bg.drawRect(-w / 2, -h / 2, w, h);
        this.bg.endFill;
        // add
        stage.addChild(this.graphics);
        // this.graphics.addChild(this.bg);
        this.graphics.addChild(this.graphicsLabel);
        // box2d shape
        details.width = w * WORLD_SCALE;
        details.height = h * WORLD_SCALE;
        this.fixtureDef.shape = new b2PolygonShape();
        this.fixtureDef.shape.SetAsBox(details.width / 2, details.height / 2);
    } else {
        switch (details.shape) {
            case "circle":
                details.radius = details.radius || this.defaults.radius;
                this.fixtureDef.shape = new b2CircleShape(details.radius);
                break;
            case "polygon":
                this.fixtureDef.shape = new b2PolygonShape();
                this.fixtureDef.shape.SetAsArray(details.points, details.points.length);
                break;
            case "block":
            default:
                details.width = details.width;
                details.height = details.height;
                this.fixtureDef.shape = new b2PolygonShape();
                this.fixtureDef.shape.SetAsBox(details.width / 2, details.height / 2);
                break;
        }
    }

    this.body.CreateFixture(this.fixtureDef);

};

Body.prototype.defaults = {
    shape: "block",
    width: 5,
    height: 5,
    radius: 2.5
};

Body.prototype.fixtureDefaults = {
    density: 2,
    friction: 0.2,
    restitution: 0.2
};

Body.prototype.definitionDefaults = {
    active: true,
    allowSleep: true,
    angle: 0,
    angularVelocity: 0,
    awake: true,
    bullet: false,
    fixedRotation: false
};

Body.prototype.draw = function(context) {
    var pos = this.body.GetPosition();
    var angle = this.body.GetAngle();
    this.graphics.position.x = pos.x * WORLD_SCALE_INV;
    this.graphics.position.y = pos.y * WORLD_SCALE_INV;
    this.graphics.rotation = angle;
};