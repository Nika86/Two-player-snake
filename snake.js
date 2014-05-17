const empty = 0;
const wall = 1;
const up = 2;
const right = 3;
const down = 4;
const left = 5;
const fruit = 6;

const W = 80;
const H = 50;
const T = 30;
const firstPauseTime = 1000;

const maxFruitCount = 1;
const fruitDropDelay = 2;
const lengthPerFood = 6;

const snakeColours = ['#3333ff','#ffee00','#ff22aa','#331144','#00ee00'];
const snakeColourOpacities = ['0.0','1.0','1.0','1.0','1.0'];
// colours: empty, snake1, snake2, wall, fruit

const snakeNames = ['','Yellow Snake','Pink Snake'];

var board = new Array(W*H);
var moveCount = 0;
var fruitCount = 0;
var scores = [0,0,0];
var gameMode = 1;
var curLevel = 0;

/* game modes

1 - ordered levels
2 - random levels
3 - fixed level

*/

function createEmptyRect(x, y) {
  board[W*y + x] = empty;
  var unit = document.getElementById('boardWrapper').style['width'];
  unit = parseFloat(unit)/W;

  var newRect = document.createElement('div');
  newRect.setAttribute('id','cell' + (W*y + x));
  newRect.setAttribute('class','boardCell');

  newRect.style['backgroundColor'] = snakeColours[0];
  newRect.style['opacity'] = snakeColourOpacities[0];
  newRect.style['left'] = unit*x;
  newRect.style['top'] = unit*y;
  newRect.style['width'] = unit;
  newRect.style['height'] = unit;

  document.getElementById('gameBoard').appendChild(newRect);
}

function setRectColour(x, y, colourIndex) {
  document.getElementById('gameBoard').childNodes[W*y + x].style['backgroundColor'] = snakeColours[colourIndex];
  document.getElementById('gameBoard').childNodes[W*y + x].style['opacity'] = snakeColourOpacities[colourIndex];
}

function updateScores(playerIndex) {
  var oldNode = document.getElementById('snake'+playerIndex+'score').childNodes[0];
  var textNode = document.createTextNode(snakeNames[playerIndex] + ' score: ' + scores[playerIndex]);
  document.getElementById('snake'+playerIndex+'score').replaceChild(textNode,oldNode);
}

function updateSpeedDisplay(newSpeed) {
  var oldNode = document.getElementById('gamespeed').childNodes[0];
  var textNode = document.createTextNode('Game speed: ' + (newSpeed > 0?'+':'') + newSpeed);
  document.getElementById('gamespeed').replaceChild(textNode, oldNode);
}

function updateCurLevel(level) {
  var oldNode = document.getElementById('curlevel').childNodes[0];
  var textNode = document.createTextNode(' ' + (level + 1) + ' ');
  document.getElementById('curlevel').replaceChild(textNode, oldNode);
}

function xShift(dir) {
  switch (dir) {
    case right:
      return 1;
    case left:
      return -1;
    default:
      return 0;
  }
}

function yShift(dir) {
  switch (dir) {
    case down:
      return 1;
    case up:
      return -1;
    default:
      return 0;
  }
}

function GameState() {
  const maxSpeed = 5;
  const minSpeed = -5;
  this.speed = 0;
  this.speedFactor = 1.0;
  this.paused = true;
  this.resume = function() {
    document.getElementById('menu').style.display = 'none';
    this.paused = false;
    this.scheduleMove();
  }
  this.pause = function() {
    document.getElementById('menu').style.display = 'block';
    this.paused = true;
  }
  this.togglePause = function() {
    if (this.paused) {
      this.resume();
    } else {
      this.pause();
    }
  }
  this.speedUp = function() {
    if (this.speed < maxSpeed) {
      this.speed++;
    }
    this.speedFactor = Math.pow(10.0, this.speed/10.0);
    updateSpeedDisplay(this.speed);
  }
  this.slowDown = function() {
    if (this.speed > minSpeed) {
      this.speed--;
    }
    this.speedFactor = Math.pow(10.0, this.speed/10.0);
    updateSpeedDisplay(this.speed);
  }
  this.scheduleMove = function() {
    if (!this.paused) {
      setTimeout('move();', T/this.speedFactor);
    }
  }
}

var gameState = new GameState();

function snake(x, y, dir, length, colour) {
  this.ex = x;
  this.ey = y;
  this.g = 0; // how much more the snake needs to grow (increases with food eaten, decreases when growing)
  this.c = colour; // snake colour
  this.moved = true;
  this.sx = x + (length - 1)*xShift(dir)
  this.sy = y + (length - 1)*yShift(dir)
  for (var i = 0; i < length; i++)
  {
    var x = this.ex + i*xShift(dir);
    var y = this.ey + i*yShift(dir);
    board[W*y + x] = dir;
    setRectColour(x, y, this.c);
  }
}

snake.prototype.tailMove = function() {
  if (this.g > 0) {
    this.g--;
  } else {
    var dir = board[W*this.ey + this.ex];
    board[W*this.ey + this.ex] = empty;
    setRectColour(this.ex, this.ey, 0);
    this.ex = ((this.ex + xShift(dir)) + W) % W;
    this.ey = ((this.ey + yShift(dir)) + H) % H;
  }
}

snake.prototype.frontMove = function() {
  var x = ((this.sx + xShift(board[W*this.sy + this.sx])) + W) % W;
  var y = ((this.sy + yShift(board[W*this.sy + this.sx])) + H) % H;
  var targetType = board[W*y + x];
  switch(targetType) {
    case fruit:
      this.g += lengthPerFood;
      fruitCount--;
      scores[this.c]++;
      updateScores(this.c);
    case empty:
      board[W*y + x] = board[W*this.sy + this.sx];
      setRectColour(x, y, this.c);
      this.sx = x;
      this.sy = y;
      this.moved = true;
      return 1;
    default:
      scores[3 - this.c] += 5;
      updateScores(3 - this.c);
      alert(snakeNames[this.c] + " died\n\n" + snakeNames[1] + " score:" + scores[1] + "\n" + snakeNames[2] + " score:" + scores[2]);
      return 0;
  }
}

const keyCodeArray = [38,40,37,39,87,83,65,68,80,77,27,32,173,189,61,187];

function keyHandler(event) {
  if (event.keyCode in keyCodeArray)
    event.preventDefault();
  switch (event.keyCode) {
    case 38: /* up */
      if (board[W*snake2.sy + snake2.sx] != down && snake2.moved) { board[W*snake2.sy + snake2.sx] = up; snake2.moved = false; }
      break;
    case 40: /* down */
      if (board[W*snake2.sy + snake2.sx] != up && snake2.moved) { board[W*snake2.sy + snake2.sx] = down; snake2.moved = false; }
      break;
    case 37: /* left */
      if (board[W*snake2.sy + snake2.sx] != right && snake2.moved) { board[W*snake2.sy + snake2.sx] = left; snake2.moved = false; }
      break;
    case 39: /* right */
      if (board[W*snake2.sy + snake2.sx] != left && snake2.moved) { board[W*snake2.sy + snake2.sx] = right; snake2.moved = false; }
      break;
    case 87: /* W */
      if (board[W*snake1.sy + snake1.sx] != down && snake1.moved) { board[W*snake1.sy + snake1.sx] = up; snake1.moved = false; }
      break;
    case 83: /* S */
      if (board[W*snake1.sy + snake1.sx] != up && snake1.moved) { board[W*snake1.sy + snake1.sx] = down; snake1.moved = false; }
      break;
    case 65: /* A */
      if (board[W*snake1.sy + snake1.sx] != right && snake1.moved) { board[W*snake1.sy + snake1.sx] = left; snake1.moved = false; }
      break;
    case 68: /* D */
      if (board[W*snake1.sy + snake1.sx] != left && snake1.moved) { board[W*snake1.sy + snake1.sx] = right; snake1.moved = false; }
      break;
    case 80: /* P */
    case 77: /* M */
    case 27: /* Esc */
    case 32: /* Space */
      gameState.togglePause();
      break;
    case 173: /* - char code (for firefox) */
    case 189: /* - */
      gameState.slowDown();
      break;
    case 61: /* = char code (for firefox) */
    case 187: /* + */
      gameState.speedUp();
      break;
  }
}

function dropFruit()
{
  var x;
  var y;
  while (true) {
    x = Math.floor(W*Math.random());
    y = Math.floor(H*Math.random());
    if (board[W*y + x] == empty) {
      board[W*y + x] = fruit;
      setRectColour(x, y, 4);
      fruitCount++;
      return 0;
    }
  }
}

function move() {
  if (moveCount % 2 == 0) {
    snake1.tailMove()
    if (snake1.frontMove() == 1) gameState.scheduleMove();
    else newGame();
  } else {
    snake2.tailMove()
    if (snake2.frontMove() == 1) gameState.scheduleMove();
    else newGame();
  }

  moveCount++;

  if (moveCount % fruitDropDelay == 0 && fruitCount < maxFruitCount) dropFruit();
}

function makeWalls(levelIndex) {
  var wallDescription = levelWalls[levelIndex];

  for (var strIndex = 0; wallDescription[strIndex] != 0; strIndex += 8) {
    
    var dir = wallDescription[strIndex] - '0';
    
    var i = 10*(wallDescription[strIndex + 1] - '0') + (wallDescription[strIndex + 2] - '0');
    var j = 10*(wallDescription[strIndex + 3] - '0') + (wallDescription[strIndex + 4] - '0');

    var Length = 10*(wallDescription[strIndex + 5] - '0') + (wallDescription[strIndex + 6] - '0');
    for (var l = 0; l < Length; l++) {
      var x = (i + l*xShift(dir)) % W;
      var y = (j + l*yShift(dir)) % H;
      board[W*y + x] = wall;
      setRectColour(x, y, 3);
    }
  }
}

function newGame()
{
  // clean up the board
  for (var y = 0; y < H; y++)
    for (var x = 0; x < W; x++) {
      board[W*y + x] = empty;
      setRectColour(x, y, 0);
    }

  switch (gameMode) {
    case 1: /* Ordered Levels */
      makeWalls(curLevel);
      curLevel += 1;
      curLevel %= levelWalls.length;
    break;
    case 2: /* Random Levels */
      makeWalls(Math.floor(Math.random()*levelWalls.length));
    break;
    case 3: /* Fixed Level */
      makeWalls(curLevel);
    break;
  }
  updateCurLevel(curLevel);

  snake1 = new snake(14, 8, down, 2, 1);
  snake2 = new snake(W - 14, H - 8, up, 2, 2);

  // randomize the starting player (also randomizes player dying in heads on collision)
  moveCount = Math.floor(Math.random()*2);
  
  fruitCount = 0;

  gameState.moveMethod = move;
  updateScores(1);
  updateScores(2);
  setTimeout(gameState.resume(), firstPauseTime);
}

function init()
{
  // setup game board
  for (var y = 0; y < H; y++)
    for (var x = 0; x < W; x++)
      createEmptyRect(x, y);

  // setup menu button functions
  document.getElementById('ordered_button').onclick = function() {
    gameMode = 1;
    curLevel = 0;
    scores = [0,0,0];
    newGame();
  }

  document.getElementById('random_button').onclick = function() {
    gameMode = 2;
    scores = [0,0,0];
    newGame();
  }

  document.getElementById('fixed_button').onclick = function() {
    gameMode = 3;
    scores = [0,0,0];
    newGame();
  }  
  document.getElementById('upLevel_button').onclick = function() {
    curLevel += 1;
    curLevel %= levelWalls.length;
    updateCurLevel(curLevel);
  }
  document.getElementById('downLevel_button').onclick = function() {
    curLevel += levelWalls.length - 1;
    curLevel %= levelWalls.length;
    updateCurLevel(curLevel);
  }

  document.getElementById('resume_button').onclick = function() {
    gameState.resume();
  }

  document.documentElement.addEventListener('keydown',keyHandler,false);

  newGame();
}