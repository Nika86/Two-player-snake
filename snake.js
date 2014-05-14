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
const First_T = 1000;

const Max_Fruits = 1;
const Fruit_Delay = 2;
const Length_Per_Food = 6;

const snake_colours = ["#3333ff","#ffee00","#ff22aa","#331144","#00ee00"];
const snake_colour_opacities = ["0.5","1.0","1.0","1.0","1.0"];
// colours: empty, snake1, snake2, wall, fruit

const snake_names = ["","Yellow Snake","Pink Snake"];

var board = new Array(W*H);
var move_cnt = 0;
var fruit_cnt = 0;
var scores = [0,0,0];
var game_mode = 1;
var curLevel = 0;

/* game modes

1 - ordered levels
2 - random levels
3 - fixed level

*/

function createEmptyRect(x,y)
{
  board[W*y + x] = empty;
  var unit = document.getElementById('boardWrapper').style['width'];
  unit = parseFloat(unit)/W;

  var newRect = document.createElement('div');
  newRect.setAttribute('id','cell' + (W*y + x));
  newRect.setAttribute('class','boardCell');

  newRect.setAttribute('style','background-color: ' + snake_colours[0]);
  newRect.style['opacity'] = snake_colour_opacities[0];
  newRect.style['left'] = unit*x;
  newRect.style['top'] = unit*y;
  newRect.style['width'] = unit;
  newRect.style['height'] = unit;

  document.getElementById('gameBoard').appendChild(newRect);
}

function setRectColour(ind_x,ind_y,colourIndex)
{
  // document.getElementById("grid").childNodes[W*ind_y+ind_x].setAttributeNS(null,"fill",snake_colours[col_index]);
  // document.getElementById("grid").childNodes[W*ind_y+ind_x].setAttributeNS(null,"fill-opacity",snake_colour_opacities[col_index]);
}

// function updateScores(playerInd)
// {
//   var oldNode = document.getElementById("snake"+playerInd+"score").childNodes[0];
//   var textNode = document.createTextNode(snake_names[playerInd] + " score: " + scores[playerInd]);
//   document.getElementById("snake"+playerInd+"score").replaceChild(textNode,oldNode);
// }

// function updateSpeedDisplay(newSpeed) {
//   var oldNode = document.getElementById("gamespeed").childNodes[0];
//   var textNode = document.createTextNode("Game speed: " + (newSpeed > 0?"+":"") + newSpeed);
//   document.getElementById("gamespeed").replaceChild(textNode,oldNode);
// }

// function updateCurLevel(level) {
//   var oldNode = document.getElementById("curlevel").childNodes[0];
//   var textNode = document.createTextNode(" " + (level + 1) + " ");
//   document.getElementById("curlevel").replaceChild(textNode,oldNode);
// }

function x_shift(dir) {
  switch (dir) {
    case right:
      return 1;
    case left:
      return -1;
    default:
      return 0;
  }
}

function y_shift(dir) {
  switch (dir) {
    case down:
      return 1;
    case up:
      return -1;
    default:
      return 0;
  }
}

function GameState()
{
  const maxspeed = 5;
  const minspeed = -5;
  this.speed = 0;
  this.speedFactor = 1.0;
  this.paused = true;
  this.resume = function() {
    document.getElementById("menu").style.display="none";
    this.paused = false;
    this.scheduleMove();
  }
  this.pause = function() {
    document.getElementById("menu").style.display="block";
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
    if (this.speed < maxspeed) {
      this.speed++;
    }
    this.speedFactor = Math.pow(10.0,this.speed/10.0);
    updateSpeedDisplay(this.speed);
  }
  this.slowDown = function() {
    if (this.speed > minspeed) {
      this.speed--;
    }
    this.speedFactor = Math.pow(10.0,this.speed/10.0);
    updateSpeedDisplay(this.speed);
  }
  this.scheduleMove = function() {
    if (!this.paused) {
      setTimeout('move();',T/this.speedFactor);
    }
  }
}

var gameState = new GameState();

function snake(x,y,dir,length,col)
{
  this.ex = x;
  this.ey = y;
  this.g = 0; // how much more the snake needs to grow (increases with food eaten, decreases when growing)
  this.c = col; // snake color
  this.moved = true;
  this.sx = x + (length-1)*x_shift(dir)
  this.sy = y + (length-1)*y_shift(dir)
  var i;
  for (i=0; i<length; i++)
  {
    var cur_x = this.ex + i*x_shift(dir);
    var cur_y = this.ey + i*y_shift(dir);
    board[W*cur_y+cur_x] = dir;
    setRectColour(cur_x,cur_y,this.c);
  }
}

snake.prototype.tailmove = function()
{
  if (this.g > 0)
  {
    this.g--;
  }
  else
  {
    var temp_ex = ((this.ex + x_shift(board[W*this.ey+this.ex])) + W) % W;
    var temp_ey = ((this.ey + y_shift(board[W*this.ey+this.ex])) + H) % H;
    board[W*this.ey+this.ex] = empty;
    setRectColour(this.ex,this.ey,0);
    this.ex = temp_ex;
    this.ey = temp_ey;
  }
}

snake.prototype.frontmove = function()
{
  var targ_x = ((this.sx + x_shift(board[W*this.sy+this.sx])) + W) % W;
  var targ_y = ((this.sy + y_shift(board[W*this.sy+this.sx])) + H) % H;
  var targ_type = board[W*targ_y+targ_x];
  switch(targ_type)
  {
    case fruit:
      this.g += Length_Per_Food;
      fruit_cnt--;
      scores[this.c]++;
      updateScores(this.c);
    case empty:
      board[W*targ_y+targ_x] = board[W*this.sy+this.sx];
      setRectColour(targ_x,targ_y,this.c);
      this.sx = targ_x;
      this.sy = targ_y;
      this.moved = true;
      return 1;
    default:
      scores[3-this.c]+=5;
      updateScores(3-this.c);
      alert(snake_names[this.c]+" died\n\n"+snake_names[1]+" score:"+scores[1]+"\n"+snake_names[2]+" score:"+scores[2]);
      return 0;
  }
}

function keyHandler(event)
{

  event.preventDefault();
  switch (event.keyCode)
  {
    case 38: /* up */
      if (board[W*snake2.sy+snake2.sx] != down && snake2.moved) { board[W*snake2.sy+snake2.sx] = up; snake2.moved = false; }
      break;
    case 40: /* down */
      if (board[W*snake2.sy+snake2.sx] != up && snake2.moved) { board[W*snake2.sy+snake2.sx] = down; snake2.moved = false; }
      break;
    case 37: /* left */
      if (board[W*snake2.sy+snake2.sx] != right && snake2.moved) { board[W*snake2.sy+snake2.sx] = left; snake2.moved = false; }
      break;
    case 39: /* right */
      if (board[W*snake2.sy+snake2.sx] != left && snake2.moved) { board[W*snake2.sy+snake2.sx] = right; snake2.moved = false; }
      break;
    case 87: /* W */
      if (board[W*snake1.sy+snake1.sx] != down && snake1.moved) { board[W*snake1.sy+snake1.sx] = up; snake1.moved = false; }
      break;
    case 83: /* S */
      if (board[W*snake1.sy+snake1.sx] != up && snake1.moved) { board[W*snake1.sy+snake1.sx] = down; snake1.moved = false; }
      break;
    case 65: /* A */
      if (board[W*snake1.sy+snake1.sx] != right && snake1.moved) { board[W*snake1.sy+snake1.sx] = left; snake1.moved = false; }
      break;
    case 68: /* D */
      if (board[W*snake1.sy+snake1.sx] != left && snake1.moved) { board[W*snake1.sy+snake1.sx] = right; snake1.moved = false; }
      break;
    case 80: /* P */
    case 77: /* M */
    case 27: /* Esc */
    case 32: /* Space */
      gameState.togglePause();
      break;
    case 189: /* - */
      gameState.slowDown();
      break;
    case 187: /* + */
      gameState.speedUp();
      break;
  }
}

function dropFruit()
{
  var f_x;
  var f_y;
  while (true)
  {
    f_x = Math.floor(Math.random()*W);
    f_y = Math.floor(Math.random()*H);
    if (board[W*f_y+f_x] == empty)
    {
      board[W*f_y+f_x] = fruit;
      setRectColour(f_x,f_y,4);
      fruit_cnt++;
      return 0;
    }
  }
}

function move()
{
  if (move_cnt % 2 == 0)
  {
    snake1.tailmove()
    if (snake1.frontmove() == 1) gameState.scheduleMove();
    else new_game();
  }
  else
  {
    snake2.tailmove()
    if (snake2.frontmove() == 1) gameState.scheduleMove();
    else new_game();
  }

  move_cnt++;

  if (move_cnt % Fruit_Delay == 0 && fruit_cnt < Max_Fruits) dropFruit();
}

function makeWalls(level_ind)
{
  var i,j,dir,L,l_cnt,str_ind;
  var wall_string = level_walls[level_ind];


  for (str_ind = 0; wall_string[str_ind] != 0; str_ind += 8)
  {
    dir = wall_string[str_ind] - '0';
    i = (wall_string[str_ind+1] - '0')*10 + (wall_string[str_ind+2] - '0');
    j = (wall_string[str_ind+3] - '0')*10 + (wall_string[str_ind+4] - '0');
    L = (wall_string[str_ind+5] - '0')*10 + (wall_string[str_ind+6] - '0');
    for (l_cnt = 0; l_cnt < L; l_cnt++)
    {
      var cur_x = (i + l_cnt*x_shift(dir)) % W;
      var cur_y = (j + l_cnt*y_shift(dir)) % H;
      board[W*cur_y+cur_x] = wall;
      setRectColour(cur_x,cur_y,3);
    }
  }
}

function new_game()
{
  // clean up board
  var x,y;
  for (y = 0; y < H; y++)
    for (x = 0; x < W; x++)
    {
      board[W*y+x] = empty;
      setRectColour(x,y,0);
    }

  switch (game_mode)
  {
    case 1: /* Ordered Levels */
      makeWalls(curLevel);
      curLevel += 1;
      curLevel %= level_walls.length;
    break;
    case 2: /* Random Levels */
      makeWalls(Math.floor(Math.random()*level_walls.length));
    break;
    case 3: /* Fixed Level */
      makeWalls(curLevel);
    break;
  }
  updateCurLevel(curLevel);

  snake1 = new snake(14,8,down,2,1);
  snake2 = new snake(W-14,H-8,up,2,2);

  // randomize the starting player (also randomizes player dying in heads on collision)
  move_cnt = Math.floor(Math.random()*2);
  
  fruit_cnt = 0;

  gameState.moveMethod = move;
  updateScores(1);
  updateScores(2);
  setTimeout(gameState.resume(),First_T);
}

function init()
{
  // setup game board
  var x,y;
  for (y = 0; y < H; y++)
    for (x = 0; x < W; x++)
      createEmptyRect(x,y);

  // new_game();

  // document.documentElement.focus();

  // document.getElementById("ordered_button").onclick = function() {
  //   game_mode = 1;
  //   curLevel = 0;
  //   scores = [0,0,0];
  //   new_game();
  // }

  // document.getElementById("random_button").onclick = function() {
  //   game_mode = 2;
  //   scores = [0,0,0];
  //   new_game();
  // }

  // document.getElementById("fixed_button").onclick = function() {
  //   game_mode = 3;
  //   scores = [0,0,0];
  //   new_game();
  // }
  // document.getElementById("upLevel_button").onclick = function() {
  //   curLevel += 1;
  //   curLevel %= level_walls.length;
  //   updateCurLevel(curLevel);
  // }
  // document.getElementById("downLevel_button").onclick = function() {
  //   curLevel += level_walls.length - 1;
  //   curLevel %= level_walls.length;
  //   updateCurLevel(curLevel);
  // }

  // document.getElementById("resume_button").onclick = function() {
  //   gameState.resume();
  // }

  // document.documentElement.addEventListener("keydown",keyHandler,false);
}