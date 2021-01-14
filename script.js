document.body.onload = menuSetup;
document.cookie = "expires=Thu, 01 Jan 2090 00:00:00 UTC";

////////// Variables

const gameWrap = document.getElementById("GameWrap");
const scoreWrap = document.getElementById("HighscoreWrap");
const sprite = document.getElementsByClassName("GameSprite");
let fallSound = new sound("Audio/fall.wav", .2);
let blipSound = new sound("Audio/blip.wav", .1);
let gameoverSound = new sound("Audio/gameover.wav", .6);
let musicSound = new sound("Audio/music.wav", .6);

const WIDTH = 17; const HEIGHT = 25;  // Game Dimensions
let gameState = "MainMenu";           // MainMenu || Gameplay || Gameover || None
const FPS = 60;                       // Frames per second

let soundON = true;                   // Sound Flag
let musicON = true;                   // Music Flag
let menuCursor = 1;                   // Position of Menu Cursor

let topLeft = [4,1];                  // Tetrimino drawing cursor position
let fallingTetrimino = -1;            // Currently falling tetrimino (-1 - 6)
let fallingSpeed = 800;               // Speed in ms that blocks will fall
let tetriminoRotation = 1;            // Rotation of tetrimino (1 - 4)
let solidBlocks = -1;                 // Counter for GamveOver sequence
let isPaused = false;                 // Pause flag
let level = 000;                      // Total levels reached
let lines = 000;                      // Total lines cleared
let difficultyFlag = false;           // Flag to update difficulty
let totals = [00,00,00,00,00,00,00];  // Total of each block fallen

let decrement = setInterval(decrementTetrimino, fallingSpeed);

////////// Setup Functions

function menuSetup() { // Setup that runs before page loads

  if (getCookie("score") != "error")
    scoreWrap.innerHTML = "<strong>Highscore:</strong> " + getCookie("score");
  else
    scoreWrap.innerHTML = "<strong>Highscore:</strong> " + 0;
  if (getCookie("music") == "true" || getCookie("music") == "error")
    musicON = true;
  else if (getCookie("music") == "false")
    musicON = false;
  if (getCookie("sound") == "true" || getCookie("sound") == "error")
    soundON = true;
  else if (getCookie("sound") == "false")
    soundON = false;

  for (y = 0; y < HEIGHT; y++) {
    for (x = 0; x < WIDTH; x++) {
      newElem = document.createElement("div");
      newElem.className = "GameSprite";
      gameWrap.appendChild(newElem);
    }
  }

}

function gameSetup() {  // Setup that runs before game begins

  topLeft = [4,1];
  level = 001;
  lines = 000;
  tetriminoRotation = 1;
  solidBlocks = -1;

  totals = [00,00,00,00,00,00,00];

  gameState = "Gameplay";
  fallingTetrimino = getRandomTetrimino();
  nextTetrimino = getRandomTetrimino();
  clearBoard();

  totals[fallingTetrimino]++;
  if (totals[fallingTetrimino] > 99)
    totals[fallingTetrimino] = 99;

}

////////// Sound object

function sound(src, vol) {
  this.sound = document.createElement("audio");
  this.sound.src = src;
  this.sound.setAttribute("preload", "auto");
  this.sound.setAttribute("controls", "none");
  this.sound.style.display = "none";
  this.sound.volume = vol;
  document.body.appendChild(this.sound);
  this.play = function(){
    this.sound.play();
  }
  this.stop = function(){
    this.sound.pause();
  }
}

setInterval( function() {
  if (musicON)
    musicSound.play();
  else
    musicSound.stop();
}, 0)

////////// Cookie Functions

function getCookie(cname) { // Returns cookie data as string

  let cookieData;
  cookieData = document.cookie.split(';').map(cookie => cookie.split('='));
  for (i = 0; i < cookieData.length; i++) {
    if (cookieData[i][0] == " " + cname)
      return cookieData[i][1];
    if (cookieData[i][0] == cname)
      return cookieData[i][1];
    }
  return "error";

}

////////// Main Routines

///// DRAW()
setInterval(
function draw() { // Draws background onto each tile

  for (y = 0; y < HEIGHT; y++) {
    for (x = 0; x < WIDTH; x++) {
      sprite[y * WIDTH + x].style.backgroundImage = "url(" + sprites[spriteValues[y][x]] + ")";
    }
  }

  let j = 0;
  for (i = 7; i < 20; i = i += 2) {
    spriteValues[i][14] = Math.floor(totals[j] / 10);
    spriteValues[i][15] = totals[j] % 10;
    j++;
  }

  for (x = 8; x < 11; x++)

  spriteValues[22][8] = Math.floor(level / 100);
  spriteValues[22][9] = Math.floor((level - (Math.floor(level / 100) * 100)) / 10);
  spriteValues[22][10] = level % 10;

  spriteValues[23][8] = Math.floor(lines / 100);
  spriteValues[23][9] = Math.floor((lines - (Math.floor(lines / 100) * 100)) / 10);
  spriteValues[23][10] = lines % 10;


}, (1000 / FPS));

///// INPUT()
document.addEventListener("keydown",
function input(event) { // Catches and handles input

  if (event.key != "F5")
    event.preventDefault();

  fallingSpeed = 1;

  switch (event.key) {
    case "s": case "ArrowDown": ///// INPUT == 'S' || DOWN
        switch (gameState) {
          case "MainMenu":
            if (soundON) blipSound.play();
            menuCursor++;
          break;
          case "Gameplay":
            decrementTetrimino();
          break;
        }
      break;
    case "w": case "ArrowUp": ///// INPUT == 'W' || UP
        if (gameState == "MainMenu") {
            menuCursor--;
            if (soundON) blipSound.play();
          }
      break;
    case "a": case "ArrowLeft": ///// INPUT == 'A' || LEFT
        switch (gameState) {
          case "MainMenu":
          break;
          case "Gameplay":
            if (!checkHorizontalMotion("LEFT") && !isPaused) {
              clearBoard();
              topLeft[0]--;
            }
          break;
        }
      break;
    case "d": case "ArrowRight": ///// INPUT == 'D' || RIGHT
        switch (gameState) {
          case "MainMenu":
          break;
          case "Gameplay":
            if (!checkHorizontalMotion("RIGHT") && !isPaused) {
              clearBoard();
              topLeft[0]++;
            }
          break;
        }
      break;
    case "q": ///// INPUT == 'Q'
      if (gameState == "Gameplay") {
        if (fallingTetrimino != 0 && !checkRotation("LEFT") && !isPaused) {
          clearBoard();
          tetriminoRotation--;
        }
      }
    break;
    case "e": ///// INPUT == 'E'
      if (gameState == "Gameplay") {
        if (fallingTetrimino != 0 && !checkRotation("RIGHT") && !isPaused) {
          clearBoard();
          tetriminoRotation++;
        }
      }
    break;
    case "Enter": ///// INPUT == 'ENTER'
      switch (gameState) {
        case "MainMenu":
          if (menuCursor == 1)
            gameSetup();
          if (menuCursor == 2) {
            soundON = !soundON;
            document.cookie= "sound=" + soundON;
            if (soundON) blipSound.play();
          }
          if (menuCursor == 3) {
            musicON = !musicON;
            document.cookie= "music=" + musicON;
            if (soundON) blipSound.play();
          }
       break;
        case "Gameplay":
          isPaused = !isPaused;
          if (soundON) blipSound.play();
          clearBoard();
        break;
      }
      break;
      case " ": ///// INPUT == 'SPACE'
        if (gameState == "Gameplay") {
          let success = false
          while (!success) success = decrementTetrimino();
        }
      break;
    default:
      return;
  }

}, true)

///// LOGIC()
setInterval(
function logic() { // Handles logic

 if (gameState == "MainMenu" && !isPaused) { // MainMenu
   /* Menu cursor bounds */
   if (menuCursor < 1)
    menuCursor = 1;
   if (menuCursor > 3)
    menuCursor = 3;
    /* Clear cursor sprite */
   spriteValues[6][7] = 43; spriteValues[8][9] = 43; spriteValues[10][9] = 43;
    /* Draw menu cursor */
   if (menuCursor == 1)
    spriteValues[6][7] = 59;
   else if (menuCursor == 2)
    spriteValues[8][9] = 59;
   else if (menuCursor == 3)
    spriteValues[10][9] = 59;
    /* Draw sound and music toggle */
   if (soundON)
    spriteValues[8][8] = 47;
   else
    spriteValues[8][8] = 50;
    if (musicON)
     spriteValues[10][8] = 47;
    else
     spriteValues[10][8] = 50;

  }

  if (gameState == "Gameplay" && !isPaused) { // Gameplay

    drawNext();
    drawTetrimino();
    applyRotationBounds();

  }

  if (isPaused) { // Paused
    /* Draw pause text */
    spriteValues[5][3] = 25;
    spriteValues[5][4] = 10;
    spriteValues[5][5] = 30;
    spriteValues[5][6] = 28;
    spriteValues[5][7] = 14;
    spriteValues[5][8] = 13;
  }

  if (gameState == "Gameover") { // Gameover
    musicON = false;
    document.cookie = "score=" + lines;

    /* Draw GameOver animation */
    if (solidBlocks < 190 && solidBlocks >= 0)
      spriteValues[20 - Math.floor(solidBlocks / 10)][1 + solidBlocks % 10] = 46;
    else if (solidBlocks >= 190) {
    for (y = 2; y < 21; y++) for (x = 1; x < 11; x++) spriteValues[y][x] = 46;

      /* Draw "Game Over" */
      spriteValues[9][4] = 16;
      spriteValues[9][5] = 10;
      spriteValues[9][6] = 22;
      spriteValues[9][7] = 14;

      spriteValues[10][4] = 24;
      spriteValues[10][5] = 31;
      spriteValues[10][6] = 14;
      spriteValues[10][7] = 27;

      if (soundON) gameoverSound.play();
      gameState = "None";
      /* Reload page after five seconds */
      setTimeout(function() { location.reload(); }, 5000)
    }

  }
  /* Set difficulty through fallingSpeed */
  if (difficultyFlag) {
    difficultyFlag = false;
    switch (level) {
      case 0: fallingSpeed = 800; break;
      case 1: fallingSpeed = 720; break;
      case 2: fallingSpeed = 630; break;
      case 3: fallingSpeed = 550; break;
      case 4: fallingSpeed = 470; break;
      case 5: fallingSpeed = 380; break;
      case 6: fallingSpeed = 300; break;
      case 7: fallingSpeed = 220; break;
      case 8: fallingSpeed = 130; break;
      case 9: fallingSpeed = 100; break;
      case 10: case 11: case 12: fallingSpeed = 80; break;
      case 13: case 14: case 15: fallingSpeed = 70; break;
      case 16: case 17: case 18: fallingSpeed = 50; break;
      default: fallingSpeed = 30;
    }
    clearInterval(decrement);
    decrement = setInterval(decrementTetrimino, fallingSpeed);
  }

  /* Set level and line bounds */
  if (level > 999)
    level = 999;
  if (lines > 999)
    lines = 999;

  /* Set level */
  if (level != Math.floor(lines / 10)) {
    level = Math.floor(lines / 10); difficultyFlag = true;
  }

}, (1000 / FPS));

////////// Game Functions

setInterval(function drawGameOver() { // Draws GameOver animation
    if (gameState == "Gameover" && solidBlocks <= 190) solidBlocks++;
}, 20)

function getRandomTetrimino() { // Returns 0 - 6

  return Math.floor(Math.random() * Math.floor(7));

}

function drawNext() { // Draws sprite based off "nextTetrimino"

  if (fallingTetrimino >= 0) spriteValues[3][13] = 36 + nextTetrimino;
  else spriteValues[3][13] = 56;

}

function applyRotationBounds() {  // Rotation bounds check

  if (tetriminoRotation > 4) tetriminoRotation = 1;
  if (tetriminoRotation < 1) tetriminoRotation = 4;

}

function clearBoard() { // Clears inner board of data

  for (y = 2; y < 21; y++) {
    for (x = 1; x < 11; x++) {
      spriteValues[y][x] = 43;
      if (collisionValues[y][x] == 46)
        spriteValues[y][x] = 46
    }
  }

}

function drawTetrimino() {   // Draws tetrimino using "TopLeft"

  if (fallingTetrimino >= 0 && gameState != "Gameover")

    for (y = 0; y < 4; y++) {
      for (x = 0; x < 4; x++) {
          if (tetriminos[y + (fallingTetrimino * 4)][x + ((tetriminoRotation - 1) * 4)] > 0 && topLeft[1] + y > 1)
            spriteValues[topLeft[1] + y][topLeft[0] + x] = tetriminos[y + (fallingTetrimino * 4)][x + ((tetriminoRotation - 1) * 4)];
      }
   }

}

function compareArrays(value) { // Compares spriteValues to collisionValues

  for (y = 0; y < HEIGHT; y++)
    for (x = 0; x < WIDTH; x++)
      if (spriteValues[y][x] == value && collisionValues[y][x] > 0)
        return true;
  return false;

}

function resetBorder() {  // Resets the border around inner board

  for (y = 0; y < 22; y++) {
    for (x = 0; x < 13; x++) {
      if (y == 0 || x == 0 || y == 21 || x == 11) spriteValues[y][x] = 51;
      if (x == 12) spriteValues[y][x] = collisionValues[y][x]
    }
  }

}

function checkHorizontalMotion(dir) { // Checks if player can move horizontally

  let willCollide = false;

  if (dir == "LEFT") {
    topLeft[0]--;
    drawTetrimino();
    if (compareArrays(getSpriteID())) willCollide = true;
    topLeft[0]++;
  }

  if (dir == "RIGHT") {
    topLeft[0]++;
    drawTetrimino();
    if (compareArrays(getSpriteID())) willCollide = true;
    topLeft[0]--;
  }

  clearBoard(); resetBorder(); return willCollide;

}

function checkVerticalMotion() {  // Checks if player can move vertically

  let willCollide = false;

  topLeft[1]++;
  drawTetrimino();
  if (compareArrays(getSpriteID())) willCollide = true;
  topLeft[1]--;

  clearBoard(); resetBorder();
  if (willCollide) resetTetrimino();
  return willCollide;

}

function checkRotation(dir) { // Checks if player can rotate tetrimino

  let willCollide = false

  if (dir == "RIGHT") {
    tetriminoRotation++;
    applyRotationBounds();
    drawTetrimino();
    if (compareArrays(getSpriteID())) willCollide = true;
    tetriminoRotation--;
    applyRotationBounds();
  }

  if (dir == "LEFT") {
    tetriminoRotation--;
    applyRotationBounds();
    drawTetrimino();
    if (compareArrays(getSpriteID())) willCollide = true;
    tetriminoRotation++;
    applyRotationBounds();
  }

  clearBoard(); resetBorder(); return willCollide;

}

function resetTetrimino() { // Resets position and rotation of tetrimino

  if (!isPaused) {
    drawTetrimino();

    for (y = 0; y < 4; y++)
      for (x = 0; x < 4; x++)
        if (spriteValues[topLeft[1] + y][topLeft[0] + x] == getSpriteID())
        collisionValues[topLeft[1] + y][topLeft[0] + x] = 46;

    lineClearCheck(); if (soundON) fallSound.play();
    topLeft = [4,1]; clearBoard();
    fallingTetrimino = nextTetrimino;
    nextTetrimino = getRandomTetrimino(); totals[fallingTetrimino]++;
    if (totals[fallingTetrimino] > 99) totals[fallingTetrimino] = 99;
    drawTetrimino();

    if (compareArrays(getSpriteID())) {
      gameState = "Gameover";
      console.log("GAME OVER!");
    }
  }
}

function getSpriteID() {  // Returns intended value for tetrimino colors
  switch (fallingTetrimino) {
    case 0: return 52;
    case 1: return 45;
    case 2: return 49;
    case 3: return 48;
    case 4: return 44;
    case 5: return 47;
    case 6: return 50;
    default: return 43;
  }
}

function lineClearCheck() { // Checks if and clears line if possible.


  for (y = 2; y < 21; y++) {
    let foundBlocks = 0;

    for (x = 1; x < 11; x++) {
      if (collisionValues[y][x] == 46)
        foundBlocks++
    }

    if (foundBlocks == 10) {
      foundBlocks = 0; lines++;

      for (x = 1; x < 11; x++)
        collisionValues[y][x] = 0;

      for (i = y; i > 1; i--)
        for (j = 1; j < 11; j++) {
          if (i != 2) collisionValues[i][j] = collisionValues[i - 1][j];
          else collisionValues[i][j] = 0;
        }

    }

  }

  for (y = 2; y < 21; y++)
    for (x = 1; x < 11; x++)
      spriteValues[y][x] = collisionValues[y][x];

}

function decrementTetrimino() { // Decrements tetrimino by one

    if (gameState == "Gameplay" && !checkVerticalMotion() && !isPaused) {
      clearBoard(); resetBorder(); topLeft[1]++;
    }
    else return true;
    return false;

}

////////// DATA

sprites = [
  /* Letters and Numbers                            */
  "https://i.imgur.com/YzrFjO2.png", // 0 -------- 00
  "https://i.imgur.com/FQcOM7y.png", // 1 -------- 01
  "https://i.imgur.com/mKs2Pzt.png", // 2 -------- 02
  "https://i.imgur.com/eWK6Q0n.png", // 3 -------- 03
  "https://i.imgur.com/WoUNaMs.png", // 4 -------- 04
  "https://i.imgur.com/9vIMyzH.png", // 5 -------- 05
  "https://i.imgur.com/bTMDEJu.png", // 6 -------- 06
  "https://i.imgur.com/tWYH59j.png", // 7 -------- 07
  "https://i.imgur.com/aVIyTIk.png", // 8 -------- 08
  "https://i.imgur.com/9ZgUiXK.png", // 9 -------- 09
  "https://i.imgur.com/0ZRPLqa.png", // A -------- 10
  "https://i.imgur.com/QPw0wh9.png", // B -------- 11
  "https://i.imgur.com/rHIoOGf.png", // C -------- 12
  "https://i.imgur.com/Fg9Pnah.png", // D -------- 13
  "https://i.imgur.com/ea42snT.png", // E -------- 14
  "https://i.imgur.com/aMnKHsG.png", // F -------- 15
  "https://i.imgur.com/5W69s8Z.png", // G -------- 16
  "https://i.imgur.com/uQCs94o.png", // H -------- 17
  "https://i.imgur.com/jVRk766.png", // I -------- 18
  "https://i.imgur.com/V7jBbBf.png", // J -------- 19
  "https://i.imgur.com/fip8CyL.png", // K -------- 20
  "https://i.imgur.com/Hi65w1y.png", // L -------- 21
  "https://i.imgur.com/MYuu1ZX.png", // M -------- 22
  "https://i.imgur.com/QmbZIN9.png", // N -------- 23
  "https://i.imgur.com/BOVyi7x.png", // O -------- 24
  "https://i.imgur.com/L2VOogh.png", // P -------- 25
  "https://i.imgur.com/6veg9xu.png", // Q -------- 26
  "https://i.imgur.com/A5rdN1a.png", // R -------- 27
  "https://i.imgur.com/eY69UDW.png", // S -------- 28
  "https://i.imgur.com/E2PtWZi.png", // T -------- 29
  "https://i.imgur.com/Skr0Rvx.png", // U -------- 30
  "https://i.imgur.com/Sxbptgs.png", // V -------- 31
  "https://i.imgur.com/eW1i0kh.png", // W -------- 32
  "https://i.imgur.com/XdCGOXJ.png", // X -------- 33
  "https://i.imgur.com/dQUEvgc.png", // Y -------- 34
  "https://i.imgur.com/Vq2AI70.png", // Z -------- 35
  /* Tetriminoes                                   */
  "https://i.imgur.com/49Je8uT.png", // O -------- 36
  "https://i.imgur.com/nVgdz4R.png", // I -------- 37
  "https://i.imgur.com/QHcKQDM.png", // T -------- 38
  "https://i.imgur.com/oQoOn7s.png", // L -------- 39
  "https://i.imgur.com/IEmSk5Q.png", // J -------- 40
  "https://i.imgur.com/yXgNeO6.png", // S -------- 41
  "https://i.imgur.com/jSQ5R9L.png", // Z -------- 42
  /* Blocks                                        */
  "https://i.imgur.com/YItSQ7y.png", // Trsprnt -- 43
  "https://i.imgur.com/qmrseng.png", // Blue ----- 44
  "https://i.imgur.com/Y6bZASR.png", // Cyan ----- 45
  "https://i.imgur.com/yLNAnPt.png", // Gray ----- 46
  "https://i.imgur.com/BGERQCa.png", // Green ---- 47
  "https://i.imgur.com/fGN6BUC.png", // Orange --- 48
  "https://i.imgur.com/cAd00Ui.png", // Pink ----- 49
  "https://i.imgur.com/zYO3T8V.png", // Red ------ 50
  "https://i.imgur.com/6WRbNBg.png", // Silver --- 51
  "https://i.imgur.com/LtNpce8.png", // Yellow --- 52
  /* Symbols                                       */
  "https://i.imgur.com/qDLaZZj.png", // Equals --- 53
  "https://i.imgur.com/QjKrzyd.png", // Quotes --- 54
  "https://i.imgur.com/E5RZ7w9.png", // Period --- 55
  "https://i.imgur.com/OIKwgB0.png", // Question - 56
  "https://i.imgur.com/UKKsc6g.png", // Dash ----- 57
  "https://i.imgur.com/CZkZKql.png", // Colon ---- 58
  "https://i.imgur.com/E34KVuT.png", // Exclaim -- 59
  /* Other                                         */
  "https://i.imgur.com/Sa51qW9.png", // FlippedR - 60
  "https://i.imgur.com/ZlonEI6.png", // NE ------- 61
  "https://i.imgur.com/wdNrwRj.png", // XT ------- 62
];

const defaultValues = [
  [51,51,51,51,51,51,51,51,51,51,51,51,51,51,51,51,51],
  [51,51,51,51,51,51,51,51,51,51,51,51,51,51,51,51,51],
  [51,43,43,43,43,43,43,43,43,43,43,51,61,62,58,51,51],
  [51,43,43,29,14,29,60,18,28,43,43,51,43,56,43,51,51],
  [51,43,43,43,43,43,43,43,43,43,43,51,43,43,43,51,51],
  [51,43,43,43,43,43,43,43,43,43,43,51,51,51,51,51,51],
  [51,43,25,21,10,34,43,43,43,43,43,51,51,51,51,51,51],
  [51,43,43,43,43,43,43,43,43,43,43,51,36,51,00,00,51],
  [51,43,28,24,30,23,13,43,43,43,43,51,51,51,51,51,51],
  [51,43,43,43,43,43,43,43,43,43,43,51,37,51,00,00,51],
  [51,43,22,30,28,18,12,43,43,43,43,51,51,51,51,51,51],
  [51,43,43,43,43,43,43,43,43,43,43,51,38,51,00,00,51],
  [51,43,43,43,43,43,43,43,43,43,43,51,51,51,51,51,51],
  [51,43,43,43,43,43,43,43,43,43,43,51,39,51,00,00,51],
  [51,43,43,43,43,43,43,43,43,43,43,51,51,51,51,51,51],
  [51,43,43,43,43,43,43,43,43,43,43,51,40,51,00,00,51],
  [51,43,43,43,43,43,43,43,43,43,43,51,51,51,51,51,51],
  [51,43,43,43,43,43,43,43,43,43,43,51,41,51,00,00,51],
  [51,43,43,43,43,43,43,43,43,43,43,51,51,51,51,51,51],
  [51,43,43,43,43,43,43,43,43,43,43,51,42,51,00,00,51],
  [51,43,43,43,43,43,43,43,43,43,43,51,51,51,51,51,51],
  [51,51,51,51,51,51,51,51,51,51,51,51,51,51,51,51,51],
  [51,21,14,31,14,21,58,51,00,00,01,51,51,51,51,51,51],
  [51,21,18,23,14,28,58,51,00,00,00,51,51,51,51,51,51],
  [51,51,51,51,51,51,51,51,51,51,51,51,51,51,51,51,51]
];

spriteValues = defaultValues;

collisionValues = [
  [51,51,51,51,51,51,51,51,51,51,51,51,51,51,51,51,51],
  [51,51,51,51,51,51,51,51,51,51,51,51,51,51,51,51,51],
  [51,00,00,00,00,00,00,00,00,00,00,51,61,62,58,51,51],
  [51,00,00,00,00,00,00,00,00,00,00,51,43,56,43,51,51],
  [51,00,00,00,00,00,00,00,00,00,00,51,43,43,43,51,51],
  [51,00,00,00,00,00,00,00,00,00,00,51,51,51,51,51,51],
  [51,00,00,00,00,00,00,00,00,00,00,51,51,51,51,51,51],
  [51,00,00,00,00,00,00,00,00,00,00,51,36,51,00,00,51],
  [51,00,00,00,00,00,00,00,00,00,00,51,51,51,51,51,51],
  [51,00,00,00,00,00,00,00,00,00,00,51,37,51,00,00,51],
  [51,00,00,00,00,00,00,00,00,00,00,51,51,51,51,51,51],
  [51,00,00,00,00,00,00,00,00,00,00,51,38,51,00,00,51],
  [51,00,00,00,00,00,00,00,00,00,00,51,51,51,51,51,51],
  [51,00,00,00,00,00,00,00,00,00,00,51,39,51,00,00,51],
  [51,00,00,00,00,00,00,00,00,00,00,51,51,51,51,51,51],
  [51,00,00,00,00,00,00,00,00,00,00,51,40,51,00,00,51],
  [51,00,00,00,00,00,00,00,00,00,00,51,51,51,51,51,51],
  [51,00,00,00,00,00,00,00,00,00,00,51,41,51,00,00,51],
  [51,00,00,00,00,00,00,00,00,00,00,51,51,51,51,51,51],
  [51,00,00,00,00,00,00,00,00,00,00,51,42,51,00,00,51],
  [51,00,00,00,00,00,00,00,00,00,00,51,51,51,51,51,51],
  [51,51,51,51,51,51,51,51,51,51,51,51,51,51,51,51,51],
  [51,21,14,31,14,21,58,51,00,00,01,51,51,51,51,51,51],
  [51,21,18,23,14,28,58,51,00,00,00,51,51,51,51,51,51],
  [51,51,51,51,51,51,51,51,51,51,51,51,51,51,51,51,51]
];

const tetriminos = [
  [00,00,00,00,  00,00,00,00,  00,00,00,00,  00,00,00,00],
  [00,52,52,00,  00,52,52,00,  00,52,52,00,  00,52,52,00],
  [00,52,52,00,  00,52,52,00,  00,52,52,00,  00,52,52,00],
  [00,00,00,00,  00,00,00,00,  00,00,00,00,  00,00,00,00],

  [00,00,00,00,  00,00,45,00,  00,00,00,00,  00,45,00,00],
  [45,45,45,45,  00,00,45,00,  00,00,00,00,  00,45,00,00],
  [00,00,00,00,  00,00,45,00,  45,45,45,45,  00,45,00,00],
  [00,00,00,00,  00,00,45,00,  00,00,00,00,  00,45,00,00],

  [00,00,00,00,  00,00,00,00,  00,00,00,00,  00,00,00,00],
  [00,49,00,00,  00,49,00,00,  00,00,00,00,  00,49,00,00],
  [49,49,49,00,  00,49,49,00,  49,49,49,00,  49,49,00,00],
  [00,00,00,00,  00,49,00,00,  00,49,00,00,  00,49,00,00],

  [00,00,48,00,  00,48,00,00,  00,00,00,00,  48,48,00,00],
  [48,48,48,00,  00,48,00,00,  48,48,48,00,  00,48,00,00],
  [00,00,00,00,  00,48,48,00,  48,00,00,00,  00,48,00,00],
  [00,00,00,00,  00,00,00,00,  00,00,00,00,  00,00,00,00],

  [44,00,00,00,  00,44,44,00,  00,00,00,00,  00,44,00,00],
  [44,44,44,00,  00,44,00,00,  44,44,44,00,  00,44,00,00],
  [00,00,00,00,  00,44,00,00,  00,00,44,00,  44,44,00,00],
  [00,00,00,00,  00,00,00,00,  00,00,00,00,  00,00,00,00],

  [00,47,47,00,  00,47,00,00,  00,00,00,00,  47,00,00,00],
  [47,47,00,00,  00,47,47,00,  00,47,47,00,  47,47,00,00],
  [00,00,00,00,  00,00,47,00,  47,47,00,00,  00,47,00,00],
  [00,00,00,00,  00,00,00,00,  00,00,00,00,  00,00,00,00],

  [50,50,00,00,  00,00,50,00,  00,00,00,00,  00,50,00,00],
  [00,50,50,00,  00,50,50,00,  50,50,00,00,  50,50,00,00],
  [00,00,00,00,  00,50,00,00,  00,50,50,00,  50,00,00,00],
  [00,00,00,00,  00,00,00,00,  00,00,00,00,  00,00,00,00]
]
