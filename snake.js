var svgNS = "http://www.w3.org/2000/svg";
var xlinkNS = "http://www.w3.org/1999/xlink";

const empty = 0;
const wall = 1;
const up = 2;
const right = 3;
const down = 4;
const left = 5;
const fruit = 6;

const W=80;
const H=50;
const T=30;
const Max_Fruits = 1;
const Fruit_Delay = 2;
const snake_colours = ["#3333ff","#ffee00","#ff22aa","#331144","#00ee00"];
// colours: empty, snake1, snake2, wall, fruit
const level_walls = [

	"0",
	"4000050 4790050 3000080 3004980 0",
	"4400050 3002580 0",
	"4044921 4204921 4364921 4524921 4684921 4123021 4283021 4443021 4603021 4763021 0",
	"3000560 3201560 3002560 3203560 3004560 4000050 4780050 0"
];

var board = new Array(W*H);
var move_cnt = 0;
var fruit_cnt = 0;
var scores = [0,0,0];

function createRect(c_x,c_y,col)
{
  board[W*c_y+c_x] = empty;
  if (col == null) col = "#ffffff";
  var newRect = document.createElementNS(svgNS,"rect");
  newRect.setAttributeNS(null,"width",10);
  newRect.setAttributeNS(null,"height",10);
  newRect.setAttributeNS(null,"x",10*c_x-0);
  newRect.setAttributeNS(null,"y",10*c_y-0);
  newRect.setAttributeNS(null,"stroke-width",0.0);
  newRect.setAttributeNS(null,"fill",col);
  document.getElementById("grid").appendChild(newRect);
}

function x_shift(dir)
{
  switch (dir)
  {
    case right:
      return 1;
    case left:
      return -1;
    default:
      return 0;
  }
}

function y_shift(dir)
{
  switch (dir)
  {
    case down:
      return 1;
    case up:
      return -1;
    default:
      return 0;
  }
}

function snake(x,y,dir,length,col)
{
  this.ex = x;
  this.ey = y;
  this.g = 0;
  this.c = col;
  this.moved = true;
  this.sx = x + (length-1)*x_shift(dir)
  this.sy = y + (length-1)*y_shift(dir)
  var i;
  for (i=0; i<length; i++)
  {
    var cur_x = this.ex + i*x_shift(dir);
    var cur_y = this.ey + i*y_shift(dir);
    board[W*cur_y+cur_x] = dir;
    document.getElementById("grid").childNodes[W*cur_y+cur_x].setAttributeNS(null,"fill",snake_colours[this.c]);
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
    document.getElementById("grid").childNodes[W*this.ey+this.ex].setAttributeNS(null,"fill",snake_colours[0]);
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
      this.g*=1;
      this.g+=6;
      fruit_cnt--;
      scores[this.c]++;
    case empty:
      board[W*targ_y+targ_x] = board[W*this.sy+this.sx];
      document.getElementById("grid").childNodes[W*targ_y+targ_x].setAttributeNS(null,"fill",snake_colours[this.c]);
      this.sx = targ_x;
      this.sy = targ_y;
      this.moved = true;
      return 1;
    default:
      scores[3-this.c]+=5;
      alert("snake "+this.c+" died\nsnake 1 score:"+scores[1]+"\nsnake 2 score:"+scores[2]);
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
      //TODO: pause game
      break;
  }
}

function dropfruit()
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
      document.getElementById("grid").childNodes[W*f_y+f_x].setAttributeNS(null,"fill",snake_colours[4]);
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
    if (snake1.frontmove() == 1) setTimeout("move();",T);
    else new_game();
  }
  else
  {
    snake2.tailmove()
    if (snake2.frontmove() == 1) setTimeout("move();",T);
    else new_game();
  }

  move_cnt++;

  if (move_cnt % Fruit_Delay == 0 && fruit_cnt < Max_Fruits) dropfruit();
}

function makewalls(level_ind)
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
      document.getElementById("grid").childNodes[W*cur_y+cur_x].setAttributeNS(null,"fill",snake_colours[3]);
    }
  }
}

function new_game()
{
  var cc_x,cc_y;
  for (cc_y=0; cc_y<H; cc_y++)
    for (cc_x=0; cc_x<W; cc_x++)
    {
      board[W*cc_y+cc_x] = empty;
      document.getElementById("grid").childNodes[W*cc_y+cc_x].setAttributeNS(null,"fill",snake_colours[0]);
    }

  makewalls(Math.floor(Math.random()*5));

  snake1 = new snake(14,8,down,2,1);
  snake2 = new snake(W-14,H-8,up,2,2);

  move_cnt = Math.floor(Math.random()*2);
  fruit_cnt = 0;

  setTimeout("move();",750);
}

function init()
{
  document.getElementById("background").childNodes[0].setAttributeNS(null,"fill",snake_colours[0]);
  var cc_x,cc_y;
  for (cc_y=0; cc_y<H; cc_y++)
    for (cc_x=0; cc_x<W; cc_x++)
      createRect(cc_x,cc_y,snake_colours[0]);

  new_game();

  document.documentElement.addEventListener("keydown",keyHandler,false);
}