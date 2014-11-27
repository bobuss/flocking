/*
Heavy inspired by http://harry.me/blog/2011/02/17/neat-algorithms-flocking/
*/

/*
Utils
*/
function randInt(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
}

function randFloat(min, max) {
  return Math.random() * (max - min) + min;
}

/*
Vector class
*/

Vector = function(x, y) {
  this.x = x;
  this.y = y;
}

Vector.prototype.copy = function() {
  return new Vector(this.x, this.y);
};

Vector.prototype.plus = function(b) {
  return new Vector(this.x + b.x, this.y + b.y);
};

Vector.prototype.minus = function(b) {
  return new Vector(this.x - b.x, this.y - b.y);
};

Vector.prototype.scale = function(s) {
  return new Vector(this.x * s, this.y * s);
};

Vector.prototype.dot = function(b) {
  return this.x * b.x + this.y * b.y;
};

Vector.prototype.magnitude = function() {
  return Math.sqrt(this.dot(this));
};

Vector.prototype.normalize = function() {
  return this.scale(1 / this.magnitude());
};

Vector.prototype.limit = function(border) {
  var magnitude = this.magnitude();
  if (magnitude > border) {
    return this.scale(border / magnitude);
  } else {
    return this
  }
};

Vector.prototype.distance = function(other) {
  return this.minus(other).magnitude();
};


/*
Color class
*/
Color = function(r, g, b) {
  this.r = r;
  this.g = g;
  this.b = b;
}

Color.prototype.toRGBA = function() {
  return 'rgba(' + this.r + ', ' + this.g + ', ' + this.b + ' , 0.8)';
};


/*
Boid class
*/

Boid = function(position, ctx, mouse) {
  this.position = position.copy();
  this.velocity = new Vector(randFloat(-1, 1), randFloat(-1, 1));
  this.acceleration = new Vector(0, 0);
  this.r = 2;
  this.ctx = ctx;
  this.mouse = mouse;
  this.color = new Color(randInt(0, 255), randInt(0, 255), randInt(0, 255));
};

Boid.prototype.step = function(neighbours) {
  var acceleration = this.flock(neighbours).plus(this.gravitate()).plus(this.avoidBorders());
  // Limit the maximum speed at which a boid can go
  this.velocity = this.velocity.plus(acceleration).limit(MAX_SPEED);
  this.position = this.position.plus(this.velocity);
};

Boid.prototype.flock = function(neighbours) {
  var separation = this.separate(neighbours);
  var alignement = this.align(neighbours);
  var cohesion = this.cohere(neighbours);

  return separation.plus(alignement).plus(cohesion);
};

Boid.prototype.cohere = function(neighbours) {
  // Called to get the cohesion component of the acceleration
  var sum = new Vector(0, 0);
  var count = 0;

  for (var i = 0 ; i < neighbours.length ; i++) {
    var boid = neighbours[i];
    var d = this.position.distance(boid.position);
    if ((d > 0) && (d < NEIGHBOUR_RADIUS)) {
      sum = sum.plus(boid.position);
      count++;
    }
  }

  if (count > 0) {
    return this.steer_to(sum.scale(1/count));
  } else {
    // Empty vector contributes nothing
    return sum;
  }
};

Boid.prototype.steer_to = function(target) {
  // A vector pointing from the position to the target
  var desired = target.minus(this.position);

  // Distance from the target is the magnitude of the vector
  var d = desired.magnitude();

  // If the distance is greater than 0, calc steering
  // (otherwise return zero vector)
  if (d > 0) {
    desired = desired.normalize();
    // Two options for desired vector magnitude
    // (1 -- based on distance, 2 -- maxspeed)
    if (d < 100.0) {
      // This damping is arbitrary
      desired = desired.scale(MAX_SPEED * (d / 100));
    } else {
      desired = desired.scale(MAX_SPEED);
    }
    // Steering = Desired minus Velocity
    // Limit to maximum steering force
    return desired.minus(this.velocity).limit(MAX_FORCE);
  } else {
    return new Vector(0,0);
  }
};

Boid.prototype.align = function(neighbours) {
  // Alignment component for the frame's acceleration
  var mean = new Vector(0, 0);
  var count = 0

  for (var i = 0 ; i < neighbours.length ; i++) {
    var boid = neighbours[i];
    var d = this.position.distance(boid.position);
    if ((d > 0) && (d < NEIGHBOUR_RADIUS)) {
      mean = mean.plus(boid.velocity);
      count++
    }
  }

  if (count > 0) {
    mean = mean.scale(1/count);
  }
  mean = mean.limit(MAX_FORCE);

  return mean;
};

Boid.prototype.separate = function(neighbours) {
  //Separation component for the frame's acceleration
  var mean = new Vector(0, 0);
  var count = 0;

  for (var i = 0 ; i < neighbours.length ; i++) {
    var boid = neighbours[i];
    var d = this.position.distance(boid.position);
    if ((d > 0) && (d < DESIRED_SEPARATION)) {
      // Normalized, weighted by distance vector pointing away from the neighbour
      mean = mean.plus(this.position.minus(boid.position).normalize().scale(1 / d));
      count++
    }
  }
  if (count > 0) {
    mean = mean.scale(1/count);
  }

  return mean
};

Boid.prototype.gravitate = function() {
  var gravity = new Vector(0, 0);

  var mouseDirection = this.mouse.minus(this.position);
  var d = mouseDirection.magnitude() - MOUSE_RADIUS;

  if (d < 0) {
    d = 0.01;
  }

  if (d > 0 && d < NEIGHBOUR_RADIUS * 5) {
    gravity = gravity.plus(mouseDirection.normalize().scale( -1 / ( d * d )))
  }
  return gravity.scale(GRAVITY);
};

Boid.prototype.avoidBorders = function() {
  var gravity = new Vector(0, 0);

  var borders = new Array();
  borders.push(new Vector(this.position.x, 0));
  borders.push(new Vector(this.position.x, HEIGHT));
  borders.push(new Vector(0, this.position.y));
  borders.push(new Vector(WIDTH, this.position.y));

  for (var i = 0 ; i < 4 ; i++) {
    var borderDirection = borders[i].minus(this.position);
    var d = borderDirection.magnitude();
    if (d < 0) {
      d = 0.01;
    }
    if (d > 0 && d < NEIGHBOUR_RADIUS * 5) {
      gravity = gravity.plus(borderDirection.normalize().scale( -1 / ( d * d )))
    }
  }

  return gravity.scale(GRAVITY);
};

Boid.prototype.render = function() {
  this.ctx.fillStyle = this.color.toRGBA()
  this.ctx.fillRect(this.position.x, this.position.y, 4, 4);
};

var canvas = document.getElementById("canvas");
var ctx = canvas.getContext("2d");

canvas.width = WIDTH = 500;
canvas.height = HEIGHT = 500;

/*
mouse management
*/
var mouse = new Vector(0, 0);

canvas.addEventListener('mousemove', function(e) {
  mouse.x = e.pageX;
  mouse.y = e.pageY;
}, false);

flock = function() {
  var start = new Vector(WIDTH / 2, HEIGHT / 2);
  var boids = new Array();

  for (var i = 0 ; i < N ; i++) {
    boids.push(new Boid(start, ctx, mouse));
  }

  function frame() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    ctx.fillRect(0, 0, WIDTH, HEIGHT);
    for (var i = 0 ; i < N ; i++) {
      var boid = boids[i];
      boid.step(boids);
      boid.render();
    }
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);
};

var N = 250;
var MAX_SPEED = 2;
var MAX_FORCE = 0.05;
var NEIGHBOUR_RADIUS = 45;
var DESIRED_SEPARATION = 5;
var MOUSE_RADIUS = 10;
var GRAVITY = 6;

flock();
