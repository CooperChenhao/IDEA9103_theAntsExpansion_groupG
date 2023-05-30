(function() {
    // Constants
    const canvasWidth = 1440;
    const canvasHeight = 700;
    const gridSize = 35;
    const pathDuration = 6;
  
    // Variables
    let numAnts = 0;
    let numExitedAnts = 0;
    let ants = [];
    let terrain = [];
    let target = {};
    let speedSlider = null;
    let speedLabel = null;
    let antSpeed = 1;
  
    // Create the canvas
    const canvas = createCanvas(canvasWidth, canvasHeight);
    const context = canvas.getContext("2d");
    document.body.appendChild(canvas);
  
    // Initialize the game
    initialize();
  
    // Function to create the canvas element
    function createCanvas(width, height) {
      const canvas = document.createElement("canvas");
      canvas.width = width;
      canvas.height = height;
      canvas.style.border = "1px solid #000";
      return canvas;
    }
  
    // Function to initialize the game
    function initialize() {
      terrain = createTerrain();
      target = createTarget();
      speedSlider = createSlider();
      speedLabel = createLabel();
      canvas.addEventListener("click", handleMouseClick);
      document.addEventListener("keydown", handleKeyDown);
      updateGame();
    }
  
    // Function to handle mouse click event
    function handleMouseClick(event) {
      const rect = canvas.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
  
      if (isInsideTerrain(mouseX, mouseY) && isInsideCanvas(mouseX, mouseY)) {
        for (let i = 0; i < 10; i++) {
          ants.push({
            x: mouseX,
            y: mouseY,
            size: 5,
            color: "black",
            speed: antSpeed,
            path: []
          });
  
          numAnts++;
        }
      }
    }
  
    // Function to handle keyboard events
    function handleKeyDown(event) {
      const arrowKeys = ["ArrowUp", "ArrowDown", "ArrowLeft", "ArrowRight"];
      if (arrowKeys.includes(event.key)) {
        event.preventDefault(); // Prevent the default browser scrolling behavior
        const direction = event.key.replace("Arrow", "");
        moveAntsByKey(direction);
      }
    }
  
    // Function to move the ants based on keyboard input
    function moveAntsByKey(direction) {
      const dx = direction === "Left" ? -1 : direction === "Right" ? 1 : 0;
      const dy = direction === "Up" ? -1 : direction === "Down" ? 1 : 0;
  
      ants.forEach((ant, index) => {
        const newX = ant.x + dx * ant.speed * 5;
        const newY = ant.y + dy * ant.speed * 5;
  
        if (isInsideTerrain(newX, newY) && isInsideCanvas(newX, newY)) {
          ant.x = newX;
          ant.y = newY;
  
          ant.path.push({ x: ant.x, y: ant.y });
  
          if (ant.path.length > pathDuration) {
            ant.path.shift();
          }
  
          if (isAntAtTarget(ant)) {
            ants.splice(index, 1);
            numAnts--;
            numExitedAnts++;
          }
        }
      });
    }
  
    // Function to create the terrain
    function createTerrain() {
      const terrain = [];
  
      for (let x = 0; x < canvasWidth / gridSize; x++) {
        for (let y = 0; y < canvasHeight / gridSize; y++) {
          if (Math.random() < 0.2) {
            terrain.push({ x: x * gridSize, y: y * gridSize });
          }
        }
      }
  
      return terrain;
    }
  
    // Function to create the target
    function createTarget() {
      const x = getRandomPosition(canvasWidth);
      const y = getRandomPosition(canvasHeight);
  
      return { x, y, size: 25, color: "red" };
    }
  
    // Function to create the speed slider
    function createSlider() {
      const slider = document.createElement("input");
      slider.type = "range";
      slider.min = 1;
      slider.max = 10;
      slider.value = antSpeed;
      slider.style.marginTop = "10px";
      slider.addEventListener("input", handleSliderChange);
      document.body.appendChild(slider);
      return slider;
    }
  
    // Function to create the speed label
    function createLabel() {
      const label = document.createElement("div");
      label.textContent = "Speed: " + antSpeed;
      document.body.appendChild(label);
      return label;
    }
  
    // Function to handle slider change event
    function handleSliderChange(event) {
      antSpeed = parseInt(event.target.value);
      speedLabel.textContent = "Speed: " + antSpeed;
  
      // Update the speed of all ants
      ants.forEach(ant => {
        ant.speed = antSpeed;
      });
    }
  
    // Function to get a random position
    function getRandomPosition(max) {
      return Math.floor(Math.random() * max);
    }
  
    // Function to draw the ants
    function drawAnts() {
      ants.forEach(ant => {
        context.beginPath();
        context.arc(ant.x, ant.y, 5, 0, Math.PI * 2);
        context.fillStyle = ant.color;
        context.fill();
        context.closePath();
  
        context.beginPath();
        context.moveTo(ant.x, ant.y);
        ant.path.forEach(pathPoint => {
          context.lineTo(pathPoint.x, pathPoint.y);
        });
        context.strokeStyle = "black"; // Set the path color to black
        context.lineWidth = 2;
        context.stroke();
        context.closePath();
      });
  
      context.fillStyle = "black";
      context.font = "16px Arial";
      context.fillText("Total Ants: " + numAnts, 10, 20);
      context.fillText("Exited Ants: " + numExitedAnts, 10, 40);
    }
  
    // Function to draw the terrain
    function drawTerrain() {
      context.fillStyle = "green";
      terrain.forEach(tile => {
        context.fillRect(tile.x, tile.y, gridSize, gridSize);
      });
    }
  
    // Function to draw the target
    function drawTarget() {
      const { x, y, size, color } = target;
      context.beginPath();
      context.moveTo(x, y - size);
      context.lineTo(x + size, y);
      context.lineTo(x, y + size);
      context.lineTo(x - size, y);
      context.fillStyle = color;
      context.fill();
      context.closePath();
    }
  
    // Function to move the ants
    function moveAnts() {
      ants.forEach((ant, index) => {
        if (ant.path.length === 0) {
          ant.path.push({ x: ant.x, y: ant.y });
        }
  
        const dx = getRandomMovement();
        const dy = getRandomMovement();
  
        const newX = ant.x + dx * ant.speed * 5; // spped in x
        const newY = ant.y + dy * ant.speed * 5; // speed in y
        if (isInsideTerrain(newX, newY) && isInsideCanvas(newX, newY)) {
          ant.x = newX;
          ant.y = newY;
  
          ant.path.push({ x: ant.x, y: ant.y });
  
          if (ant.path.length > pathDuration) {
            ant.path.shift();
          }
  
          if (isAntAtTarget(ant)) {
            ants.splice(index, 1);
            numAnts--;
            numExitedAnts++;
          }
        }
      });
    }
  
    // Function to get a random movement direction
    function getRandomMovement() {
      return Math.random() > 0.5 ? 1 : -1;
    }
  
    // Function to check if a position is inside the terrain
    function isInsideTerrain(x, y) {
      return !terrain.some(tile => {
        return x >= tile.x && x < tile.x + gridSize && y >= tile.y && y < tile.y + gridSize;
      });
    }
  
    // Function to check if a position is inside the canvas
    function isInsideCanvas(x, y) {
      return x >= 0 && x <= canvasWidth && y >= 0 && y <= canvasHeight;
    }
  
    // Function to check if an ant has reached the target
    function isAntAtTarget(ant) {
      const dx = ant.x - target.x;
      const dy = ant.y - target.y;
      const distance = Math.sqrt(dx * dx + dy * dy);
      return distance < ant.size + target.size;
    }
  
    // Function to update the game state
    function updateGame() {
      context.clearRect(0, 0, canvasWidth, canvasHeight);
  
      drawTerrain();
      drawAnts();
      drawTarget();
  
      moveAnts();
  
      requestAnimationFrame(updateGame);
    }
  })();  