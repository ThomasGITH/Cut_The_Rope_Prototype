const canvas = document.getElementById('canvas');
const context = canvas.getContext('2d');
canvas.width = window.innerWidth;
canvas.height = window.innerHeight;

const renderer = new PIXI.Renderer({
	width: window.innerWidth,
	height: window.innerHeight,
	backgroundColor: 0xd6a40f
});

document.body.appendChild(renderer.view);

var stage = new PIXI.Container();
var graphics = new PIXI.Graphics();
stage.addChild(graphics);

const ticker = new PIXI.Ticker();
ticker.add(animate);
ticker.start();

var Engine = Matter.Engine,
	World = Matter.World,
	Bodies = Matter.Bodies,
	Composite = Matter.Composite,
	Composites = Matter.Composites,
	Constraint = Matter.Constraint,
	Detector = Matter.Detector,
	Mouse = Matter.Mouse;
	
var engine = Engine.create();
var world = engine.world;

class Rope
{
	constructor(x,y)
	{
		var m = Matter.Composites.stack(x, y, 8, 1, 10, 10, function(x, y) {
			return Matter.Bodies.rectangle(x, y, 30, 20);
		});
		
		Matter.Composites.chain(m, 0.5, 0, -0.5, 0, { stiffness: 0.8, length: 2, render: { type: 'line' } });
			Matter.Composite.add(m, Matter.Constraint.create({ 
			bodyB: m.bodies[0],
			pointB: { x: -25, y: 0 },
			pointA: { x: m.bodies[0].position.x, y: m.bodies[0].position.y },
			stiffness: 0.5
		}));
		
		this.main = m;
		this.isActive = true;
	}
}

//Ropes
let ropeList = [
	new Rope(window.innerWidth/2 - 310, window.innerHeight/2),
	new Rope(window.innerWidth/2 + 310, window.innerHeight/2),
	new Rope(window.innerWidth/2, 40),
	new Rope(window.innerWidth/2, 790)
];

for(var i = 0; i < 4; i++)
{
	World.add(world, ropeList[i].main);
}

//Swinging ball
var ball = Bodies.circle(window.innerWidth/2,window.innerHeight/2,5);
World.add(world, ball);

//Ball constraints
let constraintList = [];

for(var i = 0; i < 4; i++)
{
	var props = {
		bodyA: ropeList[i].main.bodies[7],
		bodyB: ball,
		length: 15,
		damping: 0.1
	};
	
	var constr = Constraint.create(props);
	constraintList[i] = constr;
	World.add(world, constraintList[i]);
}
	
Engine.run(engine);

//Handle mouse input & mouse/rope collision
var mouseX, mouseY;
function getMousePos(canvas, evt) {
	var rect = canvas.getBoundingClientRect();
        return {
          x: evt.clientX - rect.left,
          y: evt.clientY - rect.top
        };
}

canvas.addEventListener('mousemove', function(evt) {
    var mousePos = getMousePos(canvas, evt);
			
		for(var i = 0; i < 4; i++)
		{
			for(var j = 0; j < 8; j++)
			{
				if(mousePos.x >= ropeList[i].main.bodies[j].position.x - 20 && mousePos.x <= ropeList[i].main.bodies[j].position.x + 20 &&
				mousePos.y >= ropeList[i].main.bodies[j].position.y - 20 && mousePos.y <= ropeList[i].main.bodies[j].position.y + 20)
				{
					World.remove(world, constraintList[i]);
					World.remove(world, ropeList[i].main);
					ropeList[i].isActive = false;
					console.log('colliding');
				}
			}
		}
		
}, false);
	  	  
//Eating monster
const mTexture = PIXI.Texture.from('monster2.gif');
const monster = new PIXI.Sprite(mTexture);
monster.anchor.x = 0.5;
monster.anchor.y = 0.5;
monster.position.x = 260;
monster.position.y = 650;
monster.scale.x = 0.6;
monster.scale.y = 0.6;
stage.addChild(monster);

//Button/hanger sprites
const bTexture = PIXI.Texture.from('button.png');

let buttonList = 
[
	new PIXI.Sprite(bTexture),
	new PIXI.Sprite(bTexture),
	new PIXI.Sprite(bTexture),
	new PIXI.Sprite(bTexture)
];

for(var i = 0; i < 4; i++)
{
	buttonList[i].anchor.x = 0.5;
	buttonList[i].anchor.y = 0.5;
	buttonList[i].scale.x = 0.6;
	buttonList[i].scale.y = 0.6;
	buttonList[i].position.x = ropeList[i].main.bodies[0].position.x;
	buttonList[i].position.y = ropeList[i].main.bodies[0].position.y;
	stage.addChild(buttonList[i]);
}

var ballActive = true;

function animate() {
	
	graphics.clear();
	
	graphics.lineStyle(5, 0x785018, 1);

	//Display ropes
	for(i = 0; i < 4; i++)
	{
		for(j = 0; j < 8; j++)
		{
			if(j < 7)
			{
				if(ropeList[i].isActive)
				{
					graphics.moveTo(ropeList[i].main.bodies[j].position.x, ropeList[i].main.bodies[j].position.y);
					graphics.lineTo(ropeList[i].main.bodies[j + 1].position.x, ropeList[i].main.bodies[j + 1].position.y);	
				}
			}
		}
	}
	
	graphics.endFill();
	
	if(ball.position.x >= monster.position.x - 60 && ball.position.x <= monster.position.x + 60 &&
	ball.position.y >= monster.position.y - 60 && ball.position.y <= monster.position.y + 60)
	{
		World.remove(world, ball);
		ballActive = false;
	}

	if(ballActive)
	{
		graphics.beginFill(0x595c5a);
		graphics.lineStyle(5, 0x595c5a, 1);
		graphics.drawCircle(ball.position.x, ball.position.y, 35);	
		graphics.endFill();
	}
	
    renderer.render(stage);
}