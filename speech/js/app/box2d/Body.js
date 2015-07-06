//
// Helper class for managing and drawing box2d entities
// Drawing methods and scaling have been altered to provide better mapping between b2d and canvas!
// See http://www.gamingthinktank.com/2013/08/12/box2d-coordinate-system-for-html5-canvas/
//
// Based on http://buildnewgames.com/box2dweb/
//

var Body = window.Body = function(world, details) {
	this.details = details = details || {};
	this.font = "30px Helvetica";
	this.fontHeight = 24;
	this.drawBg = false;
	var borderx2 = -2;


    // PIXI
    this.graphics = new PIXI.Sprite();
    this.graphics.anchor.x = 0.5;
    this.graphics.anchor.y = 0.5;
    stage.addChild(this.graphics);
    // char label
    var style = {
        font: this.font,
        align: 'center',
        fill: '#00ff00',
        wordWrap: true,
        wordWrapWidth: 500
    };
    this.graphicsLabel = new PIXI.Text(details.label || "X", style);
    this.graphicsLabel.anchor.x = 0.5;
    this.graphicsLabel.anchor.y = 0.5;
    // bg
    var w = this.graphicsLabel.width;//details.width*30;
    var h = this.graphicsLabel.height * 0.7;//details.height*30
    this.bg = new PIXI.Graphics();
    this.bg.beginFill(0xff0000);
    this.bg.drawRect(-w/2, -h/2, w, h);
    this.bg.endFill;


    // BOX
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
		// context.font = this.font;
		// details.metrics = context.measureText(details.label);
		details.width = w * WORLD_SCALE;
		details.height = h * WORLD_SCALE;
		this.fixtureDef.shape = new b2PolygonShape();
		this.fixtureDef.shape.SetAsBox(details.width / 2, details.height / 2);
	}
	else {
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


    this.graphics.addChild(this.bg);
    this.graphics.addChild(this.graphicsLabel);

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


    /*
	// Save the context
	context.save();

	// Translate and rotate
	context.translate(pos.x * WORLD_SCALE_INV, pos.y * WORLD_SCALE_INV);
	context.rotate(angle);


	if (this.details.label) {
		if (this.drawBg) {
			context.fillStyle = this.details.color;//"#ff0000";
			context.fillRect(-this.details.width * WORLD_SCALE_INV * 0.5, -this.details.height * WORLD_SCALE_INV * 0.5, this.details.width * WORLD_SCALE_INV, this.details.height * WORLD_SCALE_INV);
			context.fillStyle = "#ffffff";
		}
		else {
			context.fillStyle = this.details.color;
		}
		context.font = this.font;
		context.fillText(this.details.label, -this.details.metrics.width * 0.5, this.fontHeight * 0.3);
	}
	// If an image property is set, draw the image.
	else if (this.details.image) {
		context.drawImage(this.details.image, -this.details.width / 2, -this.details.height / 2,
			this.details.width,
			this.details.height);

	}
	// just draw a solid shape
	else if (this.details.color) {
		context.fillStyle = this.details.color;
		switch (this.details.shape) {
			case "circle":
				context.beginPath();
				context.arc(0, 0, this.details.radius * WORLD_SCALE_INV, 0, Math.PI * 2);
				context.fill();
				break;
			case "polygon":
				var points = this.details.points;
				context.beginPath();
				context.moveTo(points[0].x, points[0].y);
				for (var i = 1; i < points.length; i++) {
					context.lineTo(points[i].x, points[i].y);
				}
				context.fill();
				break;
			case "block":
				context.fillRect(-this.details.width * WORLD_SCALE_INV * 0.5, -this.details.height * WORLD_SCALE_INV * 0.5,
					this.details.width * WORLD_SCALE_INV,
					this.details.height * WORLD_SCALE_INV);
				break;
			default:
				break;
		}
	}
	context.restore();
    */
};