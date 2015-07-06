var startUp, restart;
(function() {
    var s = window.location.search.substr(1);
    var NUM = s.length > 1 ? +s : 500;

    var NUMRANGE = [];
    while (NUMRANGE.length < NUM) NUMRANGE.push(NUMRANGE.length + 1);
    var bodies = [null]; // Indexes start from 1

    // Box2D-interfacing code

    var PTM = 32;
    var canvasOffset = {
        x: 0,
        y: 0
    };

    var gravity = new Box2D.b2Vec2(0.0, -10.0);

    var world = new Box2D.b2World(gravity);

    var bd_ground = new Box2D.b2BodyDef();
    var ground = world.CreateBody(bd_ground);

    var shape0 = new Box2D.b2EdgeShape();
    shape0.Set(new Box2D.b2Vec2(-40.0, -6.0), new Box2D.b2Vec2(40.0, -6.0));
    ground.CreateFixture(shape0, 0.0);

    var size = .1;
    var shape = new Box2D.b2PolygonShape();
    shape.SetAsBox(size, size);

    var ZERO = new Box2D.b2Vec2(0.0, 0.0);
    var temp = new Box2D.b2Vec2(0.0, 0.0);

    NUMRANGE.forEach(function(i) {
        var bd = new Box2D.b2BodyDef();
        bd.set_type(Box2D.b2_dynamicBody);
        bd.set_position(ZERO);
        var body = world.CreateBody(bd);
        body.CreateFixture(shape, 5.0);

        bodies.push(body);
    });

    function resetPositions() {
        NUMRANGE.forEach(function(i) {
            var body = bodies[i];
            temp.Set(25 * (Math.random() - 0.5), 2.0 + 1.5 * i);
            body.SetTransform(temp, 0.0);
            body.SetLinearVelocity(ZERO);
            body.SetAwake(1);
            body.SetActive(1);
        });
    }

    resetPositions();

    function readObject(i, data) {
        var body = bodies[i];
        var bpos = body.GetPosition();
        data.x = bpos.get_x();
        data.y = bpos.get_y();
        data.angle = body.GetAngle();
    }

    var lastInactivity = Date.now();

    function someInactive() {
        var asleep = 0;
        for (var i = 0; i < NUM; i++) {
            if (!bodies[i + 1].IsAwake()) {
                asleep++;
                if (asleep == 3) return true;
            }
        }
        return false;
    }

    // Main demo code
    var totalTime = 0;
    var boxes = [];
    var position = [0, 0, 0];

    function simulate(dt) {
        world.Step(dt, 2, 2);

        var data = {
            x: 0,
            y: 0,
            angle: 0
        };

        // Read box2d data into JS objects
        for (var i = 0; i < NUM; i++) {
            readObject(i + 1, data);
            var renderObject = boxes[i];
            renderObject.position[0] = data.x;
            renderObject.position[1] = data.y;
            renderObject.position[2] = 0;
            renderObject.rotation = [0, 0, data.angle * 180 / Math.PI];
        }

        totalTime += dt;

        //if (someInactive() || totalTime >= 30) restart();
    }

    var fpsInfo = {
        dts: 0,
        num: 0,
        lastHUD: Date.now(),
        allNum: 0,
        all: 0,
    };

    var outElement = null;

    function showFPS(dt) {
        if (!outElement) outElement = document.getElementById('out');
        var now = Date.now();
        fpsInfo.dts += dt;
        fpsInfo.num++;
        if (now - fpsInfo.lastHUD > 500) {
            var curr = 1 / (fpsInfo.dts / fpsInfo.num);
            fpsInfo.allNum++;
            var alpha = Math.min(1, 2 / fpsInfo.allNum);
            fpsInfo.all = alpha * curr + (1 - alpha) * fpsInfo.all;
            outElement.value = Math.round(curr) + ' / ' + Math.round(fpsInfo.all);
            fpsInfo.lastHUD = now;
            fpsInfo.dts = 0;
            fpsInfo.num = 0;
        }
    }

    restart = function() {
        totalTime = 0;
        resetPositions();
    }

    var FLOOR_SIZE = 100;
    var FLOOR_HEIGHT = -56

    // draw code
    var items = [];
    var customBodies = [];

    startUp = function() {
        document.getElementById('info').innerHTML = '<b>Boxes: ' + NUM + '</b>';
        var canvas = document.getElementById("canvas");
        canvas.width = screen.width * 0.70;
        canvas.height = screen.height * 0.55;
        context = canvas.getContext('2d');
        canvasOffset.x = canvas.width / 2;
        canvasOffset.y = canvas.height / 2;

        for (var i = 0; i < NUM; i++) {
            boxes[i] = {
                rotatio: 0,
                position: [0, -10000, 0]
            };
        }

        colour = '#72BC8D'
        var scale = 1;
        items.push( { shape: "circle", x:20, y:10, radius:1, color:colour, restitution: 0.6 });
        for (var i = items.length - 1; i >= 0; i--) {
            var body = new Body(world, items[i]);
            customBodies.push(body);
        };
        console.log(world.GetBodyList());

        function onFrame() {
            requestAnimationFrame(onFrame);
            update();
        }

        function update() {
            simulate(1 / 60);
            draw();
        }

        function draw() {
            context.fillStyle = 'rgb(255,255,255)';
            context.fillRect(0, 0, canvas.width, canvas.height);

            context.save();
            context.translate(canvasOffset.x, canvasOffset.y);
            context.scale(1, -1);
            context.scale(PTM, PTM);
            context.lineWidth /= PTM;

            for (var i = 0; i < NUM; i++) {
                context.save();
                context.translate(boxes[i].position[0], boxes[i].position[1]);
                context.rotate(boxes[i].rotation);
                context.fillStyle = '#000066';
                context.fillRect(-size, -size, size * 2, size * 2);
                context.restore();
            }

            for (var i = customBodies.length - 1; i >= 0; i--) {
                customBodies[i].draw(context);
            };

            context.fillStyle = 'rgb(255,255,0)';
            world.DrawDebugData();

            context.restore();

        }

        onFrame();

    }
})();