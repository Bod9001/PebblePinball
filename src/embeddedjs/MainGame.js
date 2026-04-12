import Button from "pebble/button";
import Poco from "commodetto/Poco";

//TODO Some type of delay things so it doesn't add drag/gravity while it is doing the multiple collision checks
//TODO Physics is still a bit buggy


let render = null;

// ─── Game State ───────────────────────────────────────────────────────────────
let bumpers = [];
let walls = [];
let paddles = [];
let ball = null;

let gameOver = false;
let NewHighScore = false;
let Score = 0;

let PreparingBall = true;
let PreparingBallStarted = false;
let PreparingBallStartedPositive = true;
let HighScore = 0;

// ─── Flat layout vars ────────────────────────────────────────────────────────
let layoutName = "";
let physBallRadius = 6;
let physGravity = 0.35;
let physFriction = 0.995;
let physWallBouncy = 0.8;
let physMaxSpeed = 10;
let physMaxLaunch = 10;

let scoreX, scoreY, scoreW, scoreH;
let scoreFont = null;
let scoreColor = null;
let scoreHighColor = null;

let goText = "", goX, goY, goW, goH;
let goFont = null;
let goColor = null;

let hsText = "", hsFailText = "", hsX, hsY, hsW, hsH;
let hsFont = null;
let hsColor = null;

let ballStartX, ballStartY, ballVX, ballVY;
let ballColor = null;
let velLineColor = null;
let bgColor = null;

// ─── Coordinate helpers ──────────────────────────────────────────────────────
function rx(f) { return f * screen.width; }
function ry(f) { return f * screen.height; }

// ─── Utility ────────────────────────────────────────────────────────────────
function clamp(num, min, max) {
  return num <= min ? min : num >= max ? max : num;
}

// ─── Layout Management ───────────────────────────────────────────────────────
function applyLine(line) {
  console.log("line", line);
  line = line.trim();
  if (line.length === 0 || line[0] === "#") return;

  const prefix = line[0];
  const rest = line.length > 2 ? line.slice(2) : "";
  const v = rest.split(",");

  switch (prefix) {
    case "N":
      console.log("N");
      layoutName = rest;
      {
        const saved = localStorage.getItem(layoutName + "_HighScore");
        HighScore = saved ? parseInt(saved) : 0;
      }
      break;

    case "P":
      console.log("P");
      physBallRadius = +v[0];
      physGravity = +v[1];
      physFriction = +v[2];
      physWallBouncy = +v[3];
      physMaxSpeed = +v[4];
      physMaxLaunch = +v[5];
      break;

    case "S":
      console.log("S");
      scoreX = +v[0];
      scoreY = +v[1];
      scoreW = +v[2];
      scoreH = +v[3];
      scoreFont = new render.Font(v[4], +v[5]);
      scoreColor = render.makeColor(+v[6], +v[7], +v[8]);
      scoreHighColor = render.makeColor(+v[9], +v[10], +v[11]);
      break;

    case "G":
      console.log("G");
      goText = v[0].replace(/\\n/g, "\n");
      goX = +v[1];
      goY = +v[2];
      goW = +v[3];
      goH = +v[4];
      goFont = new render.Font(v[5], +v[6]);
      goColor = render.makeColor(+v[7], +v[8], +v[9]);
      break;

    case "H":
      console.log("H");
      hsText = v[0].replace(/\\n/g, "\n");
      hsFailText = v[1].replace(/\\n/g, "\n");;
      hsX = +v[2];
      hsY = +v[3];
      hsW = +v[4];
      hsH = +v[5];
      hsFont = new render.Font(v[6], +v[7]);
      hsColor = render.makeColor(+v[8], +v[9], +v[10]);
      break;

    case "K":
      console.log("K");
      bgColor = render.makeColor(+v[0], +v[1], +v[2]);
      break;

    case "B":
      console.log("B");
      ballStartX = +v[0];
      ballStartY = +v[1];
      ballVX = +v[2];
      ballVY = +v[3];
      ballColor = render.makeColor(+v[4], +v[5], +v[6]);
      ball = {
        x: rx(ballStartX),
        y: ry(ballStartY),
        vx: ballVX,
        vy: ballVY
      };
      break;

    case "U":
      console.log("U");
      bumpers.push({
        cx: rx(+v[0]),
        cy: ry(+v[1]),
        radius: +v[2],
        AddScore: +v[3],
        fillColor: render.makeColor(+v[4], +v[5], +v[6]),
        ringColor: render.makeColor(+v[7], +v[8], +v[9]),
        Strength: +v[10]
      });
      break;

    case "W": {
      console.log("W");
      const wall = {
        x1: rx(+v[0]),
        y1: ry(+v[1]),
        x2: rx(+v[2]),
        y2: ry(+v[3]),
        behavior: v[4] === "bonker" ? 2 : 1,
        color: render.makeColor(+v[5], +v[6], +v[7])
      };
      if (wall.behavior === 2) wall.BonkerMagnitude = +v[8];
      walls.push(wall);
      break;
    }

    case "D": {
      console.log("D");
      const p = {
        side: v[0],
        px: rx(+v[1]),
        py: ry(+v[2]),
        pivotX: +v[1],
        pivotY: +v[2],
        length: rx(+v[3]),
        restAngle: +v[4],
        activeAngle: +v[5],
        angularSpeed: +v[6],
        color: render.makeColor(+v[7], +v[8], +v[9]),
        angle: +v[4],
        angularVelocity: 0,
        isUp: false
      };
      paddles.push(p);
      break;
    }

    case "V":
      console.log("V");
      velLineColor = render.makeColor(+v[0], +v[1], +v[2]);
      break;
  }
}

// ─── Geometry Helpers ────────────────────────────────────────────────────────
function segmentIntersection(x1, y1, x2, y2, x3, y3, x4, y4) {
  const dx1 = x2 - x1, dy1 = y2 - y1;
  const dx2 = x4 - x3, dy2 = y4 - y3;
  const denom = dx1 * dy2 - dy1 * dx2;
  if (denom === 0) return null;

  const dx3 = x3 - x1, dy3 = y3 - y1;
  const t = (dx3 * dy2 - dy3 * dx2) / denom;
  const u = (dx3 * dy1 - dy3 * dx1) / denom;
  if (t < 0 || t > 1 || u < 0 || u > 1) return null;

  return { x: x1 + t * dx1, y: y1 + t * dy1, t };
}

function triangleSegmentIntersectionWithSegment(tx1, ty1, tx2, ty2, tx3, ty3, lx1, ly1, lx2, ly2) {
  let hit = segmentIntersection(tx1, ty1, tx3, ty3, lx1, ly1, lx2, ly2);
  if (hit != null) return { ...hit, segment: { x1: tx1, y1: ty1, x2: tx3, y2: ty3 } };

  hit = segmentIntersection(tx2, ty2, tx3, ty3, lx1, ly1, lx2, ly2);
  if (hit != null) return { ...hit, segment: { x1: tx2, y1: ty2, x2: tx3, y2: ty3 } };

  hit = segmentIntersection(tx1, ty1, tx2, ty2, lx1, ly1, lx2, ly2);
  if (hit != null) return { ...hit, segment: { x1: tx1, y1: ty1, x2: tx2, y2: ty2 } };

  return null;
}

function PointInTriangle(ptx, pty, v1x, v1y, v2x, v2y, v3x, v3y) {
  const d1 = (ptx - v2x) * (v1y - v2y) - (v1x - v2x) * (pty - v2y);
  const d2 = (ptx - v3x) * (v2y - v3y) - (v2x - v3x) * (pty - v3y);
  const d3 = (ptx - v1x) * (v3y - v1y) - (v3x - v1x) * (pty - v1y);
  const has_neg = (d1 < 0) || (d2 < 0) || (d3 < 0);
  const has_pos = (d1 > 0) || (d2 > 0) || (d3 > 0);
  return !(has_neg && has_pos);
}

// ─── Collision & Physics ─────────────────────────────────────────────────────
function sweptPaddleCollision(ball, paddle, prevAngle, nextAngle) {
  const nextTipX = paddle.px + paddle.length * Math.cos(nextAngle);
  const nextTipY = paddle.py + paddle.length * Math.sin(nextAngle);
  const prevTipX = paddle.px + paddle.length * Math.cos(prevAngle);
  const prevTipY = paddle.py + paddle.length * Math.sin(prevAngle);

  const x2 = ball.x + ball.vx, y2 = ball.y + ball.vy;
  const inTri = PointInTriangle(ball.x, ball.y, paddle.px, paddle.py, prevTipX, prevTipY, nextTipX, nextTipY);
  const hit = inTri
    ? { x: ball.x, y: ball.y }
    : triangleSegmentIntersectionWithSegment(
        paddle.px, paddle.py, prevTipX, prevTipY, nextTipX, nextTipY,
        ball.x, ball.y, x2, y2
      );

  if (!hit) return;

  let nx = -(nextTipY - paddle.py), ny = nextTipX - paddle.px;
  const nLen = Math.hypot(nx, ny);
  nx /= nLen;
  ny /= nLen;

  if (nx * ball.vx + ny * ball.vy > 0) {
    nx = -nx;
    ny = -ny;
  }

  const pdx = nextTipX - paddle.px, pdy = nextTipY - paddle.py;
  const lenSq = pdx * pdx + pdy * pdy;
  const t = Math.max(0, Math.min(1, ((hit.x - paddle.px) * pdx + (hit.y - paddle.py) * pdy) / lenSq));

  const surfX = paddle.px + t * pdx, surfY = paddle.py + t * pdy;
  ball.x = surfX + nx * physBallRadius;
  ball.y = surfY + ny * physBallRadius;

  const angularVel = nextAngle - prevAngle;
  const tipSpeed = angularVel * paddle.length * t;
  const tx = -Math.sin(nextAngle), ty = Math.cos(nextAngle);
  const dot = ball.vx * nx + ball.vy * ny;

  ball.vx = (ball.vx - 2 * dot * nx) * physWallBouncy + tx * tipSpeed;
  ball.vy = (ball.vy - 2 * dot * ny) * physWallBouncy + ty * tipSpeed;
}

// ─── Game Loop ────────────────────────────────────────────────────────────────
function gameLoop() {
  //console.log("MMM?");
  try {
    //console.log("kkkkkk?");
    if (gameOver == false) {
      // console.log("gameOver == false?");
      if (PreparingBall == false) {
       // console.log("PreparingBall == false?");
        ball.vy *= physFriction;
        ball.vy += physGravity;
        ball.vx *= physFriction;
      } else {
       // console.log("PreparingBall =e= fals?");
        if (PreparingBallStarted) {
          if (PreparingBallStartedPositive) {
            ball.vy -= physGravity;
          } else {
            ball.vy += physGravity;
          }

          if (PreparingBallStartedPositive && ball.vy < -physMaxLaunch) PreparingBallStartedPositive = false;
          if (PreparingBallStartedPositive == false && ball.vy > 0) PreparingBallStartedPositive = true;
        }
      }
     //  console.log("A?");
      ball.vy = clamp(ball.vy, -physMaxSpeed, physMaxSpeed);
      ball.vx = clamp(ball.vx, -physMaxSpeed, physMaxSpeed);
     // console.log("df?");
      
      for (const paddle of paddles) {
        //console.log("aaa?");
        const target = paddle.isUp ? paddle.activeAngle : paddle.restAngle;
        if (Math.abs(paddle.angle - target) > 0.01) continue;
        //console.log("sdfsdf?");
        const tipX = paddle.px + Math.cos(paddle.angle) * paddle.length;
        //   console.log("ffff?");
        const tipY = paddle.py + Math.sin(paddle.angle) * paddle.length;
       // console.log("aaaa?");
        const x2 = ball.x + ball.vx, y2 = ball.y + ball.vy;
       //   console.log("uuuu?");
        const closest = segmentIntersection(ball.x, ball.y, x2, y2, paddle.px, paddle.py, tipX, tipY);
        // console.log("dfdfg?");
        if (closest == null) continue;
       // console.log("dfsdsfsdttttt?");
        const wx = tipX - paddle.px, wy = tipY - paddle.py;
        // console.log("mmmmm?");
        let nx = -wy, ny = wx;
         //  console.log("23?");
        const nLen = Math.hypot(nx, ny);
        nx /= nLen;
        ny /= nLen;
   // console.log("66?");
        if (nx * ball.vx + ny * ball.vy > 0) {
          nx = -nx;
          ny = -ny;
        }
// console.log("55?");
        ball.x = closest.x + nx * physBallRadius;
        ball.y = closest.y + ny * physBallRadius;
 //console.log("33?");
        const dot = ball.vx * nx + ball.vy * ny;
        ball.vx = (ball.vx - 2 * dot * nx) * physWallBouncy;
        ball.vy = (ball.vy - 2 * dot * ny) * physWallBouncy;
        // console.log("22?");
        return; //so, it can recalculate the collisions with all the new movement
      }
      //console.log("walls?");
      for (const wall of walls) {
        const x2 = ball.x + ball.vx, y2 = ball.y + ball.vy;
        const closest = segmentIntersection(ball.x, ball.y, x2, y2, wall.x1, wall.y1, wall.x2, wall.y2);
        if (closest == null) continue;

        const wx = wall.x2 - wall.x1, wy = wall.y2 - wall.y1;
        let nx = -wy, ny = wx;
        const nLen = Math.hypot(nx, ny);
        nx /= nLen;
        ny /= nLen;

        if (nx * ball.vx + ny * ball.vy > 0) {
          nx = -nx;
          ny = -ny;
        }

        ball.x = closest.x + nx * 1.01;
        ball.y = closest.y + ny  * 1.01;
        //ball.x = closest.x;
        //ball.y = closest.y;

        const dot = ball.vx * nx + ball.vy * ny;
        ball.vx = (ball.vx - 2 * dot * nx) * physWallBouncy;
        ball.vy = (ball.vy - 2 * dot * ny) * physWallBouncy;

        if (wall.behavior === 2) {
          ball.vx += nx * wall.BonkerMagnitude;
          ball.vy += ny * wall.BonkerMagnitude;
        }
        return; //so, it can recalculate the collisions with all the new movement
      }
      //console.log("bumper?");
      for (const bumper of bumpers) {
        const dx = ball.x - bumper.cx, dy = ball.y - bumper.cy;
        const dist = Math.sqrt(dx * dx + dy * dy);
        const min = physBallRadius + bumper.radius;

        if (dist < min && dist > 0) {
          const nx = dx / dist, ny = dy / dist;
          const dot = ball.vx * nx + ball.vy * ny;

          ball.vx -= 2 * dot * nx;
          ball.vy -= 2 * dot * ny;
          ball.vx *= 1.4;
          ball.vy *= 1.4;

          ball.x += nx * (min - dist) * 1.01;
          ball.y += ny * (min - dist) * 1.01;
          Score += bumper.AddScore;
          return; //so, it can recalculate the collisions with all the new movement
        }
      }
      //console.log("paddle?");
      for (const paddle of paddles) {
        const prevAngle = paddle.angle;
        const target = paddle.isUp ? paddle.activeAngle : paddle.restAngle;
        const diff = target - paddle.angle;

        if (Math.abs(diff) < 0.01) {
          paddle.angle = target;
          paddle.angularVelocity = 0;
        } else {
          const dir = Math.sign(diff);
          paddle.angularVelocity = dir * paddle.angularSpeed;
          paddle.angle += paddle.angularVelocity;

          if ((dir > 0 && paddle.angle > target) || (dir < 0 && paddle.angle < target)) {
            paddle.angle = target;
            paddle.angularVelocity = 0;
          }

          sweptPaddleCollision(ball, paddle, prevAngle, paddle.angle);
        }
         //console.log("end?");
      }
        //console.log("endPreparingBall");
      if (PreparingBall == false) {
        ball.x += ball.vx;
        ball.y += ball.vy;
      }

      if (gameOver == false && ball.y - physBallRadius > screen.height) {
        gameOver = true;
        ball.vx = 0;
        ball.vy = 0;

        if (Score > HighScore) {
          localStorage.setItem(layoutName + "_HighScore", Score);
          HighScore = Score;
          NewHighScore = true;
        }
      }
    }
    //console.log("AAAAAAAAAAA");
    render.begin();
    render.fillRectangle(bgColor, 0, 0, render.width, render.height);
    for (const w of walls) {
      const thickness = w.behavior === 1 ? 2 : 3;
      render.drawLine(
        Math.round(w.x1),
        Math.round(w.y1),
        Math.round(w.x2),
        Math.round(w.y2),
        w.color,
        thickness
      );
    }
  
    for (const b of bumpers) {
      render.drawCircle(b.ringColor, Math.round(b.cx), Math.round(b.cy), b.radius + 2, 0, 360);
      render.drawCircle(b.fillColor, Math.round(b.cx), Math.round(b.cy), b.radius, 0, 360);
    }
  
    for (const p of paddles) {
      const tipX = p.px + Math.cos(p.angle) * p.length;
      const tipY = p.py + Math.sin(p.angle) * p.length;
      render.drawLine(Math.round(p.px), Math.round(p.py), Math.round(tipX), Math.round(tipY), p.color, 4);
      render.drawCircle(p.color, Math.round(p.px), Math.round(p.py), 3, 0, 360);
    }
  
    render.drawText(
      String(Score),
      scoreFont,
      Score > HighScore ? scoreHighColor : scoreColor,
      scoreX,
      scoreY,
      scoreW,
      scoreH
    );
    
    if (gameOver || NewHighScore) {
      const hx = rx(hsX) - (hsW >> 1);
      const hy = ry(hsY) - (hsH >> 1);
      render.drawText(
        NewHighScore ? hsText : hsFailText + HighScore,
        hsFont,
        hsColor,
        hx,
        hy,
        hsW,
        hsH
      );
    }
  
    render.drawCircle(ballColor, Math.round(ball.x), Math.round(ball.y), physBallRadius, 0, 360);
    render.drawLine(ball.x, ball.y, ball.x + ball.vx, ball.y + ball.vy, velLineColor, 3);
  
    if (gameOver) {
      const gx = rx(goX) - (goW >> 1);
      const gy = ry(goY) - (goH >> 1);
      render.drawText(goText, goFont, goColor, gx, gy, goW, goH);
    }
  
    render.end();
  } catch (e) {
    //console.log("ooo?");
    console.log(e);
  }
  //console.log("AAA?");
}



// ─── GameStarter ─────────────────────────────────────────────────────────────
export const GameStarter = {
  async init(Rendering, name) {
    render = Rendering;

    bumpers = [];
    walls = [];
    paddles = [];

    gameOver = false;
    NewHighScore = false;
    Score = 0;
    PreparingBall = true;
    PreparingBallStarted = false;
    PreparingBallStartedPositive = true;

    if (name === "[Default]") {
      console.log("AAAAAAAAA");

      let line;

      line = "N SillyBounce"; //map name
      applyLine(line);

      line = "P 6,0.35,0.995,0.8,50,50"; //ballRadius,gravity,friction,wallBouncy, maxSpeed, maxLaunch    //Physic settings
      applyLine(line);

      line = "S 2,2,40,16,Bitham-Black,30,255,85,170,85,255,255"; //x,y,Width, height, font, fontSize, R,G,B (Normal Colour),R,G,B (High score Colour),  //score Text location
      applyLine(line);

      line = "G GAME OVER,0.43,0.5,160,40,Bitham-Black,30,255,255,255"; //gameOverText, x,y,Width, height, font, fontSize, R,G,B //High Score text
      applyLine(line);

      line = "H NEW\\nHIGH SCORE,HIGH SCORE\\n,0.46,0.68,180,60,Bitham-Black,30,85,255,255"; //highScoreText, Fail highScoreText, x,y,Width, height, font, fontSize, R,G,B //High Score text
      applyLine(line);

      line = "K 85,0,85";  //R,G,B //Background colour
      applyLine(line); 
  
      line = "B 0.94,0.30,0,0,255,0,85"; // startX, startY, vx (Technically overrridden), vy  (Technically overrridden), r,g,b  //ball
      applyLine(line);

      line = "U 0.3,0.3,8,50,0,0,170,0,170,255,3"; //x, y,Radius , hit score, (Centre colour) r,g,b, (Ring colour) r,g,b //Top Left cluster bumper
      applyLine(line);

      line = "U 0.5,0.25,8,50,0,0,170,0,170,255,3"; //x, y,Radius , hit score, (Centre colour) r,g,b, (Ring colour) r,g,b //Top Middle cluster bumper
      applyLine(line);

      line = "U 0.7,0.3,8,50,0,0,170,0,170,255,3"; //x, y,Radius , hit score, (Centre colour) r,g,b, (Ring colour) r,g,b //Top right cluster bumper
      applyLine(line);

      line = "U 0.4,0.45,8,50,0,0,170,0,170,255,3"; //x, y,Radius , hit score, (Centre colour) r,g,b, (Ring colour) r,g,b //Bottom Left cluster bumper
      applyLine(line);

      line = "U 0.6,0.45,8,50,0,0,170,0,170,255,3"; //x, y,Radius , hit score, (Centre colour) r,g,b, (Ring colour) r,g,b //Bottom right cluster bumper
      applyLine(line);

      line = "U 0.2,0.2,6,500,170,0,170,255,85,255,3"; //x, y,Radius , hit score, (Centre colour) r,g,b, (Ring colour) r,g,b //Bottom right hard access bumper
      applyLine(line);

      line = "U 0.08,0.07,6,500,170,0,170,255,85,255,3"; //x, y,Radius , hit score, (Centre colour) r,g,b, (Ring colour) r,g,b //Top left hard access bumper
      applyLine(line);

      line = "W -0.2,0.001,1.2,0.001,wall,255,255,255"; //x1, y1, x2, y2, behavior, r,g,b //top wall
      applyLine(line);

      line = "W 0.001,-0.2,0.001,1.2,wall,255,255,255"; //x1, y1, x2, y2, behavior, r,g,b //Left wall
      applyLine(line);

      line = "W 0.999,-0.2,0.999,1.2,wall,255,255,255"; //x1, y1, x2, y2, behavior, r,g,b //Right wall
      applyLine(line);

      line = "W -0.2,0.65,0.25,0.9,wall,255,255,255"; //x1, y1, x2, y2, behavior, r,g,b //Left slope Paddle
      applyLine(line);

      line = "W 1.2,0.65,0.75,0.9,wall,255,255,255"; //x1, y1, x2, y2, behavior, r,g,b //Right slope Paddle
      applyLine(line);

      line = "W 0.10,0.6,0.25,0.75,bonker,255,170,0,3";  //x1, y1, x2, y2, behavior, r,g,b //Left bonker 
      applyLine(line);

      line = "W 0.1,0.6,0.1,0.75,wall,255,255,255";  //x1, y1, x2, y2, behavior, r,g,b //Left bonker back
      applyLine(line);

      line = "W 0.9,0.6,0.75,0.75,bonker,255,170,0,3"; //x1, y1, x2, y2, behavior, r,g,b //Right bonker 
      applyLine(line);

      line = "W 0.9,0.13,0.9,0.80,wall,255,255,255"; //x1, y1, x2, y2, behavior, r,g,b  //Right ball shoot /Right bonker back
      applyLine(line);

      line = "W 0.35,0.1,0.1,0.4,wall,255,255,255"; //x1, y1, x2, y2, behavior, r,g,b  //Topless bunker wall left
      applyLine(line);

      line = "W 0.9,0.0,0.99,0.15,wall,255,255,255";   //x1, y1, x2, y2, behavior, r,g,b  //Right ball shoot Corner piece
      applyLine(line);

      line = "D left,0.25,0.9,0.5,0.45,-0.45,0.3,0,255,0"; //side, pivotX, pivotY:, length:, restAngle:, activeAngle:, angularSpeed,  r,g,b //Paddle left
      applyLine(line);

      line = "D right,0.75,0.9,0.5,2.6916,3.5832,0.3,0,255,0"; //side, pivotX, pivotY:, length:, restAngle:, activeAngle:, angularSpeed,  r,g,b //Paddle Right
      applyLine(line);

      line = "V 0,255,0"; //r,g,b // Velocity line colour
      applyLine(line);
    } else {
      const CHUNK_SIZE = 500;
      const file = device.files.openFile({ path: "layouts/" + name + ".txt" });
      const fileSize = file.status().size;

      let offset = 0;
      let lineBuffer = "";

      while (offset < fileSize) {
        const readSize = Math.min(CHUNK_SIZE, fileSize - offset);
        const chunk = String.fromArrayBuffer(file.read(readSize, offset));
        offset += readSize;

        for (let i = 0; i < chunk.length; i++) {
          const c = chunk[i];
          if (c === "\n") {
            applyLine(lineBuffer);
            lineBuffer = "";
          } else {
            lineBuffer += c;
          }
        }
      }

      if (lineBuffer.length > 0) applyLine(lineBuffer);
      file.close();
    }

    console.log("Button!!!");
    new Button({
      types: ["up", "down", "select"],
      onPush(down, type) {
        try {
          if (type === "up") {
            const p = paddles.find(p => p.side === "right");
            if (p) p.isUp = down;
          }

          if (type === "down") {
            const p = paddles.find(p => p.side === "left");
            if (p) p.isUp = down;
          }

          if (type === "select") {
            if (gameOver && down) {
              Score = 0;
              gameOver = false;
              ball.x = rx(ballStartX);
              ball.y = ry(ballStartY);
              ball.vx = ballVX;
              ball.vy = ballVY;
              PreparingBall = true;
              NewHighScore = false;
              return;
            }

            if (PreparingBall && down) PreparingBallStarted = true;
            if (PreparingBall && down == false && PreparingBallStarted) {
              PreparingBallStarted = false;
              PreparingBall = false;
            }
          }
        } catch (e) {
          console.log(e);
        }
      }
    });

    console.log("setInterval!!!");
    setInterval(gameLoop, 33);
    console.log("Layout applied successfully");
  }
};