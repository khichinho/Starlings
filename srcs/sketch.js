var flock;
var startingboids = 250;  //No. of boids in the start
var boidsize =3; //Boid triangle length
//Properties coefficients
var seperationcoeff = 1.5;
var alignmentcoeff = 1;
var cohesioncoeff = 1;
var deflectioncoeff =1.5;
var predatorcoeff = 8;

var minimumdistance = 25;
var nearbydistance = 100;

var boids = []; //array of boids
var deflectors = []; //array of deflectors
var predators = []; //array of predators

var predatorsize = 5;
var pmov = 0;
var fps;

p5.disableFriendlyErrors = true;

function setup() {
	createCanvas(windowWidth,windowHeight);
	// Initially puts some amount of boids in the system
	for (var i = 0; i < startingboids; i++) {
		//var b = new Boid(random(0,width),random(0,height));
		var b = new Boid(random(0,width),random(0,height));
		boids.push(b);
	}
}

function draw() {
	background(0);
	for (var i = 0; i < boids.length; i++) {
    	boids[i].run(boids);
	}
	for (var j = 0; j < deflectors.length; j++) {
    	deflectors[j].display();
	}
	for (var k = 0; k < predators.length; k++) {
		predators[k].display();
		predators[k].movement();
		predators[k].bounce();
	}
	fps = frameRate();
	fill(255);
	stroke(0);
	text("FPS: " + fps.toFixed(2), 10, height - 10);
}


function keyPressed() {
	if(keyCode == LEFT_ARROW){
		predators.push(new Predator(mouseX,mouseY));
	}
	if(keyCode == RIGHT_ARROW){
		deflectors.push(new Deflector(mouseX,mouseY));
	}
	// Create new boids and deflectors
	if(keyCode == UP_ARROW){
	boids.push(new Boid(mouseX,mouseY));
	}
}

function Deflector(x,y){
	this.position = createVector(x,y);
}
Deflector.prototype.display = function() {
	fill(255,255,0);
	stroke(200);
	ellipse(this.position.x, this.position.y, 10, 10);
};

function Predator(x,y){
	this.acceleration = createVector(0,0);
	this.velocity = createVector(random(-2.5,2.5),random(-2.5,2.5));
	this.position = createVector(x,y);
	this.s = predatorsize;
	this.maxspeed = 2.5;
	this.maxforce = 0.05;
}
Predator.prototype.display = function() {
	var theta = this.velocity.heading() + radians(90);
	fill(255,0,0);
	stroke(200);
	push();
	translate(this.position.x,this.position.y);
	rotate(theta);
	beginShape();
	vertex(0, -this.s*2);
  	vertex(-this.s, this.s*2);
	vertex(this.s, this.s*2);
	endShape(CLOSE);
	pop();
};
Predator.prototype.movement = function() {
	this.position.add(this.velocity);
	if (pmov%120 == 0){
		this.acceleration = createVector(random(-2.5,2.5),random(-2.5,2.5));
		this.velocity.add(this.acceleration);
		this.velocity.limit(2);
	}
	pmov++	
}
Predator.prototype.bounce = function(){
    if(this.position.x < 0 || this.position.x > width){this.velocity.x *= -1;}
    if(this.position.y < 0 || this.position.y > height){this.velocity.y *= -1;}
}

function Boid(x,y) {
	this.acceleration = createVector(0,0);
	this.velocity = createVector(random(-2.5,2.5),random(-2.5,2.5));
	this.position = createVector(x,y);
	this.s = boidsize;
	this.maxspeed = 2.5;
	this.maxforce = 0.05;
}

Boid.prototype.run = function(boids) {
	this.flock(boids);
	this.update();
	this.wrap();
	this.display();
};

Boid.prototype.applyForce = function(force) {
	this.acceleration.add(force);
};

Boid.prototype.flock = function(boids) {
	var sep = this.separate(boids);   // Separation
	var ali = this.align(boids);      // Alignment
	var coh = this.cohesion(boids);   // Cohesion
	var defl = this.deflect(deflectors); //Deflection
	var predt = this.pred(predators); //Predator away
	// Coefficients for forces
	sep.mult(seperationcoeff);
	ali.mult(alignmentcoeff);
	coh.mult(cohesioncoeff);
	defl.mult(deflectioncoeff);
	predt.mult(predatorcoeff);
	// Add the forces to acceleration
	this.applyForce(sep);
	this.applyForce(ali);
	this.applyForce(coh);
	this.applyForce(defl);
	this.applyForce(predt);
};

// Method to update location
Boid.prototype.update = function() {
	this.velocity.add(this.acceleration);
	// Limits speed
	this.velocity.limit(this.maxspeed);
	this.position.add(this.velocity);
	// Reset accelertion to 0 after each movement
	this.acceleration.mult(0);
};



Boid.prototype.display = function() {
	// Draw a triangle rotated in the direction of velocity
	var theta = this.velocity.heading() + radians(90);
	fill(64,224,208);
	stroke(200);
	push();
	translate(this.position.x,this.position.y);
	rotate(theta);
	beginShape();
	vertex(0, -this.s*2);
  	vertex(-this.s, this.s*2);
	vertex(this.s, this.s*2);
	endShape(CLOSE);
	pop();
};

// Wraparound
Boid.prototype.wrap = function() {
	if (this.position.x < -this.s)  this.position.x = width +this.s;
	if (this.position.y < -this.s)  this.position.y = height+this.s;
	if (this.position.x > width +this.s) this.position.x = -this.s;
	if (this.position.y > height+this.s) this.position.y = -this.s;
};

//Bounce
Boid.prototype.bounce = function(){
    if(this.position.x < 0 || this.position.x > width){this.velocity.x *= -1;}
    if(this.position.y < 0 || this.position.y > height){this.velocity.y *= -1;}
}

// Separation - maintains distance from neary boids
Boid.prototype.separate = function(boids) {
	var steer = createVector(0,0);
	var count = 0;
	// Apply property on nearby boids only
	for (var i = 0; i < boids.length; i++) {
		var d = p5.Vector.dist(this.position,boids[i].position);
    	if ((d > 0) && (d < minimumdistance)) {
			// Calculate vector pointing away from neighbor
    		var diff = p5.Vector.sub(this.position,boids[i].position);
			diff.normalize();
    		diff.div(d);        // Weight by distance
    		steer.add(diff);
    		count++;            // Keep track of how many
   		 }
	}
	// Average -- divide by how many
	if (count > 0) {
    	steer.div(count);
	}
	if (steer.mag() > 0) {
    	steer.normalize();
    	steer.mult(this.maxspeed);
    	steer.sub(this.velocity);
    	steer.limit(this.maxforce);
	}
	return steer;
};

// Deflect - maintains distance from nearby deflectors
Boid.prototype.deflect = function(deflectors) {
	var steer = createVector(0,0);
	var count = 0;
	// Apply property on nearby deflectors only
	for (var i = 0; i < deflectors.length; i++) {
		var d = p5.Vector.dist(this.position,deflectors[i].position);
		
    	if ((d > 0) && (d < minimumdistance*2)) {
			// Calculate vector pointing away from neighbor
    		var diff = p5.Vector.sub(this.position,deflectors[i].position);
			diff.normalize();
    		diff.div(d);        // Weight by distance
    		steer.add(diff);
    		count++;            // Keep track of how many
   		 }
	}
	// Average -- divide by how many
	if (count > 0) {
    	steer.div(count);
	}
	if (steer.mag() > 0) {
    	steer.normalize();
    	steer.mult(this.maxspeed);
    	steer.sub(this.velocity);
    	steer.limit(this.maxforce);
	}
	return steer;
};

// Pred - maintains distance from neary predators
Boid.prototype.pred = function(predators) {
	var steer = createVector(0,0);
	var count = 0;
	// Apply property on nearby deflectors only
	for (var i = 0; i < predators.length; i++) {
		var d = p5.Vector.dist(this.position,predators[i].position);
		
    	if ((d > 0) && (d < minimumdistance*1.5)) {
			// Calculate vector pointing away from neighbor
    		var diff = p5.Vector.sub(this.position,predators[i].position);
			diff.normalize();
    		diff.div(d);        // Weight by distance
    		steer.add(diff);
    		count++;            // Keep track of how many
   		 }
	}
	// Average -- divide by how many
	if (count > 0) {
    	steer.div(count);
	}
	if (steer.mag() > 0) {
    	steer.normalize();
    	steer.mult(this.maxspeed);
    	steer.sub(this.velocity);
    	steer.limit(this.maxforce);
	}
	return steer;
};


// Alignment - Maintain velocity equal to average of nearby boids
Boid.prototype.align = function(boids) {
	var vsum = createVector(0,0);
	var count = 0;
	for (var i = 0; i < boids.length; i++) {
    	var d = p5.Vector.dist(this.position,boids[i].position);
    	if ((d > 0) && (d < nearbydistance)) {
			vsum.add(boids[i].velocity);
			count++;
    	}
	}
	if (count > 0) {
    	vsum.div(count);
    	vsum.normalize();
    	vsum.mult(this.maxspeed);
    	var steer = p5.Vector.sub(vsum,this.velocity);
    	steer.limit(this.maxforce);
    	return steer;
	}
	else { return createVector(0,0);}
};

// STEER = DESIRED - CURRENT VELOCITY
Boid.prototype.move = function(target) {
	var desired = p5.Vector.sub(target,this.position);  // A vector pointing from the location to the target
	// Normalize desired and scale to maximum speed
	desired.normalize();
	desired.mult(this.maxspeed);
	// Steering = Desired - current  Velocity
	var steer = p5.Vector.sub(desired,this.velocity);
	steer.limit(this.maxforce);  // Limit to maximum steering force
	return steer;
};

// Cohesion - move towards average of nearby boids
Boid.prototype.cohesion = function(boids) {
	var nearbydistance = 50;
	var psum = createVector(0,0); 
	var count = 0;
	for (var i = 0; i < boids.length; i++) {
    	var d = p5.Vector.dist(this.position,boids[i].position);
    	if ((d > 0) && (d < nearbydistance)) {
			psum.add(boids[i].position); // Add location
			count++;
    	}
	}
	if (count > 0) {
    	psum.div(count);
    	return this.move(psum);  // Steer towards the location
	}
	else { return createVector(0,0);}
};
