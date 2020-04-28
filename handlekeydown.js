function handlekeydown(e) {
    if(e.keyCode==87) angleX+=1.0; //W
    if(e.keyCode==83) angleX-=1.0; //S
    if(e.keyCode==68) angleY+=1.0; //D
    if(e.keyCode==65) angleY-=1.0; //A
    if(e.keyCode==81) angleZ+=1.0; //Q
    if(e.keyCode==69) angleZ-=1.0; //E
    if(e.keyCode==73) tz +=0.5; //I
    if(e.keyCode==75) tz -=0.5; //K
    if(e.keyCode==74) tx +=0.5; //J
    if(e.keyCode==76) tx -=0.5; //L
    if(e.keyCode==79) ty +=0.1; //O
    if(e.keyCode==85) ty -=0.1; //U
}