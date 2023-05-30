var canvasWidth = 1200;
var canvasHeight = 1000;
var gridSize = 40;
var numAnts = 0; // Number of ants (initially 0)
var pathDuration = 50; // Path duration
var maxsize = 60; // Maximum size for ants

var canvas = document.createElement("canvas");
canvas.width = canvasWidth;
canvas.height = canvasHeight;
canvas.style.border = "1px solid #000";
document.body.appendChild(canvas);

var context = canvas.getContext("2d");

var ants = [];
var terrain = createTerrain();
var target = createTarget();

canvas.addEventListener("click", function (event) {
  var rect = canvas.getBoundingClientRect();
  var mouseX = event.clientX - rect.left;
  var mouseY = event.clientY - rect.top;

  if (isInsideTerrain(mouseX, mouseY)) {
    ants.push({
      x: mouseX,
      y: mouseY,
      size: 3, // Size of ants
      color: "black",
      speed: 1,
      path: [],
    });

    numAnts++;
  }
});

function getRandomPosition(max) {
  return Math.floor(Math.random() * max);
}

function createTerrain() {
  var terrain = [];

  for (var x = 0; x < canvasWidth / gridSize; x++) {
    for (var y = 0; y < canvasHeight / gridSize; y++) {
      if (Math.random() < 0.2) {
        terrain.push({ x: x * gridSize, y: y * gridSize, eaten: false });
      }
    }
  }

  return terrain;
}

function createTarget() {
  var x = getRandomPosition(canvasWidth);
  var y = getRandomPosition(canvasHeight);

  return { x: x, y: y, size: 15, color: "yellow" };
}

function drawAnts() {
  for (var i = 0; i < ants.length; i++) {
    var ant = ants[i];

    context.beginPath();
    context.arc(ant.x, ant.y, ant.size, 0, Math.PI * 2);
    context.fillStyle = ant.color;
    context.fill();
    context.closePath();

    // Draw the ant's path
    context.beginPath();
    context.moveTo(ant.x, ant.y);
    for (var j = 0; j < ant.path.length; j++) {
      context.lineTo(ant.path[j].x, ant.path[j].y);
    }
    context.strokeStyle = "rgba(128, 128, 128, 0.3)";
    context.lineWidth = 2;
    context.stroke();
    context.closePath();
  }
}

function drawTerrain() {
  for (var i = 0; i < terrain.length; i++) {
    var tile = terrain[i];
    if (!tile.eaten) {
      context.fillStyle = "green";
      context.fillRect(tile.x, tile.y, gridSize, gridSize);
    }
  }
}

function drawTarget() {
  context.beginPath();
  context.moveTo(target.x, target.y - target.size);
  context.lineTo(target.x + target.size, target.y);
  context.lineTo(target.x, target.y + target.size);
  context.lineTo(target.x - target.size, target.y);
  context.fillStyle = target.color;
  context.fill();
  context.closePath();
}

function moveAnts() {
  for (var i = 0; i < ants.length; i++) {
    var ant = ants[i];

    if (ant.path.length === 0) {
      ant.path.push({ x: ant.x, y: ant.y });
    }

    var dx = getRandomMovement();
    var dy = getRandomMovement();

    var newX = ant.x + dx * ant.speed;
    var newY = ant.y + dy * ant.speed;

    // Check if the new position is inside the terrain
    if (isInsideTerrain(newX, newY)) {
      ant.x = newX;
      ant.y = newY;

      // Add the current position to the path
      ant.path.push({ x: ant.x, y: ant.y });

      // Remove old path points after a longer duration
      if (ant.path.length > pathDuration) {
        ant.path.shift();
      }

      // Check if the ant reaches the target
      if (isAntAtTarget(ant)) {
        ants.splice(i, 1);
        i--;
        numAnts--;
      }

      // Check if the ant collides with terrain
      checkTerrainCollision(ant);

      // Check if the ant collides with another ant
      checkAntCollision(i);
    } else {
      // The ant hit the wall, increase its size within the maxsize limit
      if (ant.size < maxsize) {
        ant.size += 1;
      }
    }

    // Limit the ant's size to maxsize
    if (ant.size > maxsize) {
      ant.size = maxsize;
    }
  }
}

function getRandomMovement() {
  return Math.random() > 0.5 ? 1 : -1;
}

function isInsideTerrain(x, y) {
  for (var i = 0; i < terrain.length; i++) {
    var tile = terrain[i];
    if (x >= tile.x && x < tile.x + gridSize && y >= tile.y && y < tile.y + gridSize && !tile.eaten) {
      return false;
    }
  }
  return true;
}

function isAntAtTarget(ant) {
  var dx = ant.x - target.x;
  var dy = ant.y - target.y;
  var distance = Math.sqrt(dx * dx + dy * dy);
  return distance < ant.size + target.size;
}

function checkTerrainCollision(ant) {
  for (var i = 0; i < terrain.length; i++) {
    var tile = terrain[i];
    if (!tile.eaten && isColliding(ant, tile)) {
      tile.eaten = true;
      ant.size += 1; // Increase the size of the ant
      ant.color = getRandomColor(); // Change the color of the ant
    }
  }
}

function checkAntCollision(index) {
  var currentAnt = ants[index];

  for (var i = 0; i < ants.length; i++) {
    if (i === index) {
      continue;
    }

    var otherAnt = ants[i];
    var dx = currentAnt.x - otherAnt.x;
    var dy = currentAnt.y - otherAnt.y;
    var distance = Math.sqrt(dx * dx + dy * dy);

    if (distance < currentAnt.size + otherAnt.size) {
      // Ants collide
      currentAnt.color = getRandomColor(); // Change the color of the current ant
      otherAnt.color = getRandomColor(); // Change the color of the other ant

      // Move ants in opposite direction
      var angle = Math.atan2(dy, dx);
      currentAnt.x += Math.cos(angle) * currentAnt.speed;
      currentAnt.y += Math.sin(angle) * currentAnt.speed;
      otherAnt.x -= Math.cos(angle) * otherAnt.speed;
      otherAnt.y -= Math.sin(angle) * otherAnt.speed;

      // Create a new terrain tile at the point of collision
      var newTileX = (currentAnt.x + otherAnt.x) / 2;
      var newTileY = (currentAnt.y + otherAnt.y) / 2;
      terrain.push({ x: newTileX, y: newTileY, eaten: false });
    }
  }
}

function isColliding(obj1, obj2) {
  return (
    obj1.x < obj2.x + gridSize &&
    obj1.x + obj1.size > obj2.x &&
    obj1.y < obj2.y + gridSize &&
    obj1.y + obj1.size > obj2.y
  );
}

function getRandomColor() {
  var letters = "0123456789ABCDEF";
  var color = "#";
  for (var i = 0; i < 6; i++) {
    color += letters[Math.floor(Math.random() * 16)];
  }
  return color;
}

function draw() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  drawTerrain();
  drawAnts();
  drawTarget();
}

function update() {
  moveAnts();
  draw();
  requestAnimationFrame(update);
}

update();