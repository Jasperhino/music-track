let rad = [];
let angle = 0;
let n = 5;
let arc_angle;

let cx, cy;

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(26);
  arc_angle = TWO_PI / n;
  
  cx = windowWidth/2;
  cy = windowHeight/2;
}

function draw() {
  background(26, 20);

  
  noFill();
  
    rad = [
      map(sin(angle), 0, 1, 130, 180),
      map(sin(angle), 0, 1, 180, 130),
      map(cos(angle), 0, 1, 160, 200),
      map(sin(angle), 0, 1, 180, 210),
      map(cos(angle), 0, 1, 160, 130)
  ];


  
  stroke(40, 200, 80, 200);
  strokeWeight(3);
  arcs();

  
  stroke(255);
  strokeWeight(2);
  arcs();

  angle+= 0.03;
  
  push();
  translate(cx, cy)
 // line(sin(PI/3))
  //line(0,0, 30, 30);
  stroke(255,10);
  strokeWeight(1);
  line(0,0, cos((PI/2.5)*1) * (rad[0]/1.8), -sin((PI/2.5)*1) * (rad[0]/1.8));
  line(0,0, cos((PI/2.5)*2) * (rad[1]/1.8), -sin((PI/2.5)*2) * (rad[1]/1.8));
  line(0,0, cos((PI/2.5)*3) * (rad[3]/1.8), -sin((PI/2.5)*3) * (rad[3]/1.8));
  line(0,0, cos((PI/2.5)*4) * (rad[2]/1.8), -sin((PI/2.5)*4) * (rad[2]/1.8));
  line(0,0, cos((PI/2.5)*5) * (rad[4]/1.8), -sin((PI/2.5)*5) * (rad[4]/1.8));

  pop();
  
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  cx = windowWidth/2;
  cy = windowHeight/2;
}

function arcs(){
  for (let i=0; i < n; i++) {
      arc(cx, cy, rad[i] , rad[i], arc_angle * i, arc_angle * i+1);
  }
  
}