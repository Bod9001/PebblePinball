# PebblePinball
A Pinball Watch app for pebble smartwatch, With customisations allowing custom maps to be loaded from phone 

```
      N SillyBounce
      P 6,0.35,0.995,0.8,10,10
      S 2,2,40,16,Bitham-Black,30,255,85,170,85,255,255
      G GAME OVER,0.43,0.5,160,40,Bitham-Black,30,255,255,255
      H NEW\\nHIGH SCORE,HIGH SCORE\\n,0.46,0.68,180,60,Bitham-Black,30,85,255,255
      K 85,0,85
      B 0.94,0.30,0,0,255,0,85
      U 0.3,0.3,8,10,0,0,170,0,170,255,6
      U 0.5,0.25,8,10,0,0,170,0,170,255,6
      U 0.7,0.3,8,10,0,0,170,0,170,255,6
      U 0.4,0.45,8,10,0,0,170,0,170,255,6
      U 0.6,0.45,8,10,0,0,170,0,170,255,6
      U 0.18,0.18,6,40,170,0,170,255,85,255,3
      U 0.08,0.07,6,40,170,0,170,255,85,255,3
      U 0.075,0.265,6,40,170,0,170,255,85,255,3
      W -0.9,0.3,0.25,0.9,wall,255,255,255
      W 1.9,0.3,0.75,0.9,wall,255,255,255
      W 0.9,0.0,0.99,0.15,wall,255,255,255
      W -0.2,0.001,1.2,0.001,wall,255,255,255
      W 0.001,-0.2,0.001,0.758,wall,255,255,255
      W 0.999,-0.2,0.999,0.758,wall,255,255,255
      W 0.10,0.6,0.25,0.75,bonker,255,170,0,3
      W 0.1,0.6,0.1,0.75,wall,255,255,255
      W 0.9,0.6,0.75,0.75,bonker,255,170,0,3
      W 0.9,0.13,0.9,0.80,wall,255,255,255
      W 0.35,0.1,0.1,0.4,wall,255,255,255
      D left,0.25,0.9,0.2,0.45,-0.45,0.3,0,255,0
      D right,0.75,0.9,0.2,2.6916,3.5832,0.3,0,255,0
      V 0,255,0
```

This is an example of a raw map, Here it is now with some comments to help show what each bit means

      N SillyBounce"; //map name
      
      P 6,0.35,0.995,0.8,10,10"; //ballRadius,gravity,friction,wallBouncy, maxSpeed, maxLaunch    //Physic settings
     
      S 2,2,40,16,Bitham-Black,30,255,85,170,85,255,255"; //x,y,Width, height, font, fontSize, R,G,B (Normal Colour),R,G,B (High score Colour),  //score Text location
      
      G GAME OVER,0.43,0.5,160,40,Bitham-Black,30,255,255,255"; //gameOverText, x,y,Width, height, font, fontSize, R,G,B //High Score text
     
      H NEW\\nHIGH SCORE,HIGH SCORE\\n,0.46,0.68,180,60,Bitham-Black,30,85,255,255"; //highScoreText, Fail highScoreText, x,y,Width, height, font, fontSize, R,G,B //High Score text
     
      K 85,0,85";  //R,G,B //Background colour
      
      B 0.94,0.30,0,0,255,0,85"; // startX, startY, vx (Technically overrridden), vy  (Technically overrridden), r,g,b  //ball
      
      U 0.3,0.3,8,10,0,0,170,0,170,255,6"; //x, y,Radius , hit score, (Centre colour) r,g,b, (Ring colour) r,g,b //Top Left cluster bumper
     
      U 0.5,0.25,8,10,0,0,170,0,170,255,6"; //x, y,Radius , hit score, (Centre colour) r,g,b, (Ring colour) r,g,b //Top Middle cluster bumper
     
      U 0.7,0.3,8,10,0,0,170,0,170,255,6"; //x, y,Radius , hit score, (Centre colour) r,g,b, (Ring colour) r,g,b //Top right cluster bumper
     
      U 0.4,0.45,8,10,0,0,170,0,170,255,6"; //x, y,Radius , hit score, (Centre colour) r,g,b, (Ring colour) r,g,b //Bottom Left cluster bumper
     
      U 0.6,0.45,8,10,0,0,170,0,170,255,6"; //x, y,Radius , hit score, (Centre colour) r,g,b, (Ring colour) r,g,b //Bottom right cluster bumper
     
      U 0.18,0.18,6,40,170,0,170,255,85,255,3"; //x, y,Radius , hit score, (Centre colour) r,g,b, (Ring colour) r,g,b //Bottom right hard access bumper
     
      U 0.08,0.07,6,40,170,0,170,255,85,255,3"; //x, y,Radius , hit score, (Centre colour) r,g,b, (Ring colour) r,g,b //Top left hard access bumper
     
      U 0.075,0.265,6,40,170,0,170,255,85,255,3"; //x, y,Radius , hit score, (Centre colour) r,g,b, (Ring colour) r,g,b //Bottom left hard access bumper
    
      W -0.9,0.3,0.25,0.9,wall,255,255,255"; //x1, y1, x2, y2, behavior, r,g,b //Left slope Paddle //These need to come first so when it does hit collisions it does the Slope wall first
     
      W 1.9,0.3,0.75,0.9,wall,255,255,255"; //x1, y1, x2, y2, behavior, r,g,b //Right slope Paddle //These need to come first so when it does hit collisions it does the Slope wall first  
     
      W 0.9,0.0,0.99,0.15,wall,255,255,255";   //x1, y1, x2, y2, behavior, r,g,b  //Right ball shoot Corner piece
    
      W -0.2,0.001,1.2,0.001,wall,255,255,255"; //x1, y1, x2, y2, behavior, r,g,b //top wall
    
      W 0.001,-0.2,0.001,0.758,wall,255,255,255"; //x1, y1, x2, y2, behavior, r,g,b //Left wall
     
      W 0.999,-0.2,0.999,0.758,wall,255,255,255"; //x1, y1, x2, y2, behavior, r,g,b //Right wall
     
      W 0.10,0.6,0.25,0.75,bonker,255,170,0,3";  //x1, y1, x2, y2, behavior, r,g,b //Left bonker 
    
      W 0.1,0.6,0.1,0.75,wall,255,255,255";  //x1, y1, x2, y2, behavior, r,g,b //Left bonker back
     
      W 0.9,0.6,0.75,0.75,bonker,255,170,0,3"; //x1, y1, x2, y2, behavior, r,g,b //Right bonker 
    
      W 0.9,0.13,0.9,0.80,wall,255,255,255"; //x1, y1, x2, y2, behavior, r,g,b  //Right ball shoot /Right bonker back
     
      W 0.35,0.1,0.1,0.4,wall,255,255,255"; //x1, y1, x2, y2, behavior, r,g,b  //Topless bunker wall left
     
      D left,0.25,0.9,0.2,0.45,-0.45,0.3,0,255,0"; //side, pivotX, pivotY:, length:, restAngle:, activeAngle:, angularSpeed,  r,g,b //Paddle left
     
      D right,0.75,0.9,0.2,2.6916,3.5832,0.3,0,255,0"; //side, pivotX, pivotY:, length:, restAngle:, activeAngle:, angularSpeed,  r,g,b //Paddle Right  // do Length 0.5 For debugging
     
      V 0,255,0"; //r,g,b // Velocity line colour

      Q 0.95,0.50,6,100,170,  0,  0,255, 0, 0,6"; //x, y,Radius , hit score, (Inactive colour) r,g,b, (Active colour) r,g,b //Middle right pressure plate Psion

Good way to look at it is

V = Velocity line colour

D = paddles

W = wall

U = Bumper

B = ball

G = Game over text

H = High Score text

S = Current Score text  

P = Physics settings

N = Map name

Q = Pressure plate

Note: AI was partially used to help write the Application
