import Button from "pebble/button";
import Poco from "commodetto/Poco";

import Message from "pebble/message";
//import { StorageManager } from "StorageManager";

//import { Messager } from "MemoryMessages";
//import { StorageManager } from "StorageSystem";


let selectedLayoutIndex = 0;
let availableLayouts = [];
let gameState = "MENU"; // MENU, GAME
const render = new Poco(screen);
let receiveStatusText = null;

function ReceiveLoop() {

  render.begin();
  //console.log("begin ");
  render.fillRectangle(render.makeColor(0, 0, 85), 0, 0, render.width, render.height);
  //console.log("fillRectangle ");
  render.drawText("RECEIVE MAPS", new render.Font("Gothic-Bold", 28), render.makeColor(85, 255, 255), 5, 5, 200, 28);
  // console.log("CEIVE M ");

  
  // All body lines in one call — height 24*4=96 to fit 4 lines
  render.drawText(
    "Upload layouts\nfrom your phone\napp, then press\nBACK to exit.",
    new render.Font("Gothic-Bold", 24),
    render.makeColor(255, 255, 255),
    5, 45, 200, 96
  );
  // console.log("drawText M ");
  render.drawText(receiveStatusText, new render.Font("Gothic-Bold", 18), render.makeColor(255, 170, 0), 5, 158, 200, 18);
  //console.log("Gothic-Bold");
  render.end();
//console.log("end");
}



function refreshLayoutList() {
  let Index = localStorage.getItem(`layouts/index.json`);
  if (Index == null){
    localStorage.setItem(`layouts/index.json`, JSON.stringify([]));
  }
  else
  {
    availableLayouts = JSON.parse(Index);
  }
  
  // Add receive option at the end
  availableLayouts.push("[Default]");
  availableLayouts.push("[Receive Maps]");
  selectedLayoutIndex = 0;
}


async function loadSelectedLayout() {
  const layoutName = availableLayouts[selectedLayoutIndex];
  console.log("loadSelectedLayout " + layoutName);

  // Handle receive mode — no teardown needed, just switch state

  if (layoutName === "[Receive Maps]") {
    gameState = "RECEIVE";
    receiveStatusText =  "Waiting for maps...";
    clearInterval(gameLoopTimer);
    gameLoopTimer = null;
    const StorageManager = await import('StorageManager');
    try {
          new Message({
      keys: ["layoutConfig"],
      onReadable() {
          const data = this.read().get("layoutConfig");
          StorageManager.saveLayout(data);
          receiveStatusText = "Map received!";
      
        }
    });
    }
    catch (e){
       console.log(e);
    }

    setInterval(ReceiveLoop, 33);
    
     return;
    }

    clearInterval(gameLoopTimer);
    gameLoopTimer = null;
    //messageHandler = null;
    //MenuButton = null;
    //StorageManager = null;
    // Destroy message handler
    //messageHandler = null;
    gameState = "game"
    // Release large structures
    availableLayouts = null;
    //receiveStatusText = null;
    //await Promise.resolve();
    //await Promise.resolve();

    const GameStarter = await import('GameStarter');
    GameStarter.GameStarter.init(render,layoutName);
    //const GameStarter = await import('GameStarter');
    //console.log(Object.keys(GameStarter));
    //GameStarter.GameStarter.init(render,config);
    //console.log( layoutName);

}




function drawMenu() {
  render.begin();
  const menuFont = new render.Font("Bitham-Black", 30);
  const menuColor = render.makeColor(255, 85, 170);
  const smallFont = new render.Font("Bitham-Black", 30);
  const OptionFont = new render.Font("Gothic-Bold", 24);
  const warningColor = render.makeColor(255, 170, 0);
  
  render.fillRectangle(render.makeColor(85, 0, 85), 0, 0, render.width, render.height);
  render.drawText("SELECT MAP", menuFont, menuColor, 1, 20, 200, 30);
  
  const listStartY = 60;
  const itemHeight = 25;
  
  for (let i = 0; i < availableLayouts.length && i < 4; i++) {
    const y = listStartY + (i * itemHeight);
    const isSelected = (i === selectedLayoutIndex);
    const color = isSelected ? render.makeColor(85, 255, 255) : menuColor;
    const prefix = isSelected ? "> " : "  ";
    
    render.drawText(prefix + availableLayouts[i], OptionFont, color, 10, y, 200, itemHeight);
  }
  
  render.drawText("SELECT: OK", smallFont, warningColor, 10, render.height - 35, 200, 20);
  
  render.end();
}




async function HandleButton() {
  try {
    const StorageManager = await import('StorageManager');
    StorageManager.StorageManager.saveLayout(
    "N SillyBounce2\nP 6,0.35,0.995,0.8,10,10\nS 2,2,40,16,Bitham-Black,30,255,85,255,85,255,255\nG GAME OVER,0.43,0.5,160,40,Bitham-Black,30,255,255,255\nH NEW\\nHIGH SCORE,HIGH SCORE\\n,0.46,0.68,180,60,Bitham-Black,30,85,255,255\nK 85,0,85\nB 0.94,0.30,0,0,255,0,85\nU 0.2,0.2,6,500,170,0,170,255,85,170,1.1\nU 0.08,0.07,6,500,170,0,170,255,85,170,1.1\nW -0.2,0.001,1.2,0.001,wall,255,255,170\nW 0.001,-0.2,0.001,1.2,wall,255,255,170\nW 0.999,-0.2,0.999,1.2,wall,255,255,170\nW -0.2,0.65,0.25,0.9,wall,255,255,170\nW 1.2,0.65,0.75,0.9,wall,255,255,170\nW 0.1,0.6,0.25,0.75,bonker,255,170,0,3\nW 0.1,0.6,0.1,0.75,wall,255,255,170\nW 0.9,0.6,0.75,0.75,bonker,255,170,0,3\nW 0.9,0.13,0.9,0.80,wall,255,255,170\nW 0.35,0.1,0.1,0.4,wall,255,255,170\nW 0.9,0.0,0.99,0.15,wall,255,255,170\nD left,0.25,0.9,0.2,0.45,-0.45,0.3,0,255,0\nD right,0.75,0.9,0.2,2.6916,3.5916,0.3,0,255,0\nV 0,255,0"
    );
  }
  catch (e){
    console.log(e);
  }
}



// ─── Button Handling ──────────────────────────────────────────────────────────
 
let MenuButton = new Button({
  types: ["up", "down", "select"],
  onPush(down, type) {
    if (!down) return;
    if (gameState === "MENU") {
      if (type === "up") {
        selectedLayoutIndex = (selectedLayoutIndex - 1 + availableLayouts.length) % availableLayouts.length;
      } else if (type === "down") {
        selectedLayoutIndex = (selectedLayoutIndex + 1) % availableLayouts.length;
      } else if (type === "select") {
        loadSelectedLayout();
      }
    } 
    else if (gameState === "RECEIVE")
    { 
      if (type === "select") {
        HandleButton();
      }
    }
  }
});

// Initialize on startup
refreshLayoutList();

let gameLoopTimer = setInterval(MENULoop, 33);
function MENULoop() {
   drawMenu();
}
