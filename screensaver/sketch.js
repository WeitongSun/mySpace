function setup() {
  createCanvas(windowWidth,windowHeight,WEBGL);
}

function draw() {
  background(250, 192, 238);
  //ellipse(random(0,windowWidth),random(0,windowWidth),random(0,windowWidth));
  
  // Enable orbiting with the mouse.
  orbitControl(3, 3, 3);
  
  
  sphere(random(0,windowWidth/6))
  frameRate(random(5,24));

  for (let zAngle = 0; zAngle < 180; zAngle += 30) {
    // Rotate cubes in a full circle to create a ring of cubes
    for (let xAngle = 0; xAngle < 360; xAngle += 30) {
      push();

      // Rotate from center of sphere
      rotateZ(zAngle);
      rotateX(xAngle);

      // Then translate down 400 units
      translate(0, 400, 0);
      normalMaterial();
      box(random(0,10));
      pop();
    }
  }
}

