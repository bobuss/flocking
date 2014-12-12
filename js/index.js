(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
/*
Boid class
*/

'use strict';

var randInt = require('./utils').randInt;
var randFloat = require('./utils').randFloat;
var Vector = require('./vector3d');
var Color = require('./color');

var Boid = function(position, shapes) {
  this.position = position.copy();
  this.velocity = new Vector(randFloat(-1, 1), randFloat(-1, 1), randFloat(-1, 1));
  this.acceleration = new Vector(0, 0, 0);
  this.r = 2;
  this.shapes = shapes;
  this.color = new Color(randInt(0, 255), randInt(0, 255), randInt(0, 255));
};

/**/
/* Some defaults */
/**/
Boid.height = 500;
Boid.width = 500;
Boid.deep = 500;
Boid.minDeep = 200;
Boid.zoom = 200;
Boid.maxSpeed = 2;
Boid.maxForce = 0.05;
Boid.neighbourRadius = 45;
Boid.desiredSeparation = 5;
Boid.gravity = 26;
Boid.center = new Vector(0, 0, (Boid.deep - Boid.minDeep) / 2);

Boid.prototype.step = function(neighbours) {
  var acceleration = this.flock(neighbours).plus(this.avoidWalls())
                                           .plus(this.avoidShapes());
  // Limit the maximum speed at which a boid can go
  this.velocity = this.velocity.plus(acceleration).limit(Boid.maxSpeed);
  this.position = this.position.plus(this.velocity);
  this.wrapIfNeeded();
};

Boid.prototype.flock = function(neighbours) {
  var separation = this.separate(neighbours);
  var alignement = this.align(neighbours);
  var cohesion = this.cohere(neighbours);

  return separation.plus(alignement).plus(cohesion);
};

Boid.prototype.cohere = function(neighbours) {
  // Called to get the cohesion component of the acceleration
  var sum = new Vector(0, 0, 0),
      count = 0,
      i, boid, d;

  for (i = 0 ; i < neighbours.length ; i++) {
    boid = neighbours[i];
    d = this.position.distance(boid.position);
    if ((d > 0) && (d < Boid.neighbourRadius)) {
      sum = sum.plus(boid.position);
      count++;
    }
  }

  if (count > 0) {
    return this.steerTo(sum.scale(1/count));
  } else {
    // Empty vector contributes nothing
    return sum;
  }
};

Boid.prototype.steerTo = function(target) {
  // A vector pointing from the position to the target
  var desired = target.minus(this.position);

  // Distance from the target is the magnitude of the vector
  var d = desired.magnitude();

  // If the distance is greater than 0, calc steering
  // (otherwise return zero vector)
  if (d > 0) {
    desired = desired.normalize();
    // Two options for desired vector magnitude
    // 1 -- based on distance,
    // 2 -- maxspeed
    if (d < 100.0) {
      // This damping is arbitrary
      desired = desired.scale(Boid.maxSpeed * (d / 100));
    } else {
      desired = desired.scale(Boid.maxSpeed);
    }
    // Steering = Desired minus Velocity
    // Limit to maximum steering force
    return desired.minus(this.velocity).limit(Boid.maxForce);
  } else {
    return new Vector(0, 0, 0);
  }
};

Boid.prototype.align = function(neighbours) {
  // Alignment component for the frame's acceleration
  var mean = new Vector(0, 0, 0),
      count = 0,
      i, boid, d;

  for (i = 0 ; i < neighbours.length ; i++) {
    boid = neighbours[i];
    d = this.position.distance(boid.position);
    if ((d > 0) && (d < Boid.neighbourRadius)) {
      mean = mean.plus(boid.velocity);
      count++;
    }
  }

  if (count > 0) {
    mean = mean.scale(1/count);
  }
  mean = mean.limit(Boid.maxForce);

  return mean;
};

Boid.prototype.separate = function(neighbours) {
  //Separation component for the frame's acceleration
  var mean = new Vector(0, 0, 0),
      count = 0,
      i, boid, d;

  for (i = 0 ; i < neighbours.length ; i++) {
    boid = neighbours[i];
    d = this.position.distance(boid.position);
    if ((d > 0) && (d < Boid.desiredSeparation)) {
      // Normalized, weighted by distance vector pointing away from the neighbour
      mean = mean.plus(this.position.minus(boid.position).normalize().scale(1 / d));
      count++;
    }
  }
  if (count > 0) {
    mean = mean.scale(1/count);
  }

  return mean;
};

// aquarium : 6 planes
Boid.prototype.avoidWalls = function() {
  var acc = new Vector(0, 0, 0),
      borders = [],
      i, borderDirection, d;

  borders.push(new Vector(this.position.x, this.position.y, Boid.minDeep));
  borders.push(new Vector(this.position.x, this.position.y, Boid.deep));

  borders.push(new Vector(this.position.x, Boid.height / 2 , this.position.z));
  borders.push(new Vector(this.position.x, -Boid.height / 2 , this.position.z));

  borders.push(new Vector(Boid.width / 2, this.position.y, this.position.z));
  borders.push(new Vector(- Boid.width / 2, this.position.y, this.position.z));

  for (i = 0 ; i < borders.length ; i++) {
    borderDirection = borders[i].minus(this.position);
    d = borderDirection.magnitude();

    if (d < 0) {
      d = 0.01;
    }
    if (d > 0 && d < Boid.neighbourRadius * 5) {
      acc = acc.plus(borderDirection.normalize().scale( -1 / ( d * d )));
    }
  }
  return acc.scale(Boid.gravity);
};

Boid.prototype.avoidShapes = function() {
  var acc = new Vector(0, 0, 0),
      i, shape, extDist, closestPoint, d, mouseDirection;

  for (i = 0 ; i < this.shapes.length ; ++i) {

    shape = this.shapes[i];
    extDist = shape.distance(this.position);
    closestPoint = extDist.point;
    d = extDist.distance;
    mouseDirection = closestPoint.minus(this.position);

    if (d < 0) {
      d = 0.01;
    }
    if (d > 0 && d < Boid.neighbourRadius * 5) {
      acc = acc.plus(mouseDirection.normalize().scale( -1 / ( d * d )));
    }
  }

  return acc.scale(Boid.gravity);

};

Boid.prototype.wrapIfNeeded = function() {
  if (this.position.x < - Boid.width / 2) {
    this.position.x = Boid.width / 2;
  } else if (this.position.x > Boid.width / 2) {
    this.position.x = - Boid.width;
  }
  if (this.position.y < - Boid.height / 2) {
    this.position.y = Boid.height / 2;
  } else if (this.position.y > Boid.height / 2) {
    this.position.y = - Boid.height / 2;
  }
  if (this.position.z < Boid.minDeep) {
    this.position.z = Boid.deep;
  } else if (this.position.z > Boid.deep) {
    this.position.z = Boid.minDeep;
  }
};

Boid.prototype.projected = function() {
  return {
    'x': this.position.x / this.position.z * Boid.zoom + Boid.width / 2,
    'y': this.position.y / this.position.z * Boid.zoom + Boid.height / 2
  };
};

Boid.prototype.size = function() {
  var factor = 5;
  return factor * (1 - this.position.z / Boid.deep);
};

Boid.prototype.isVisible = function() {
  var visible = true,
      shape, i;
  for (i = 0 ; i < this.shapes.length ; ++i) {
    shape = this.shapes[i];
    visible = visible && !shape.isHiding(this.position);
  }
  return visible;
};

Boid.prototype.render = function() {
  if (this.isVisible()) {
    var proj = this.projected(),
        size = this.size();
    Boid.ctx.fillStyle = this.color.toRGBA();
    Boid.ctx.fillRect(proj.x,
                      proj.y,
                      size, size);
  }
};

module.exports = Boid;
},{"./color":3,"./utils":7,"./vector3d":9}],2:[function(require,module,exports){
/*
Circle class
*/

'use strict';

var Hit = require('./utils').Hit;

var Circle = function(center, radius) {
  this.center = center;
  this.radius = radius;
};

Circle.prototype.distance = function(point) {
  var d = point.distance(this.center) - this.radius;
  var hit = new Hit();
  hit.point = this.center;
  hit.distance = d;
  return hit;
};

Circle.prototype.render = function() {
  Circle.ctx.beginPath();
  Circle.ctx.arc(this.center.x, this.center.y, this.radius, 0, 2 * Math.PI, false);
  Circle.ctx.lineWidth = 1;
  Circle.ctx.strokeStyle = '#FF3377';
  Circle.ctx.stroke();
};

module.exports = Circle;
},{"./utils":7}],3:[function(require,module,exports){
/*
Color class
*/

'use strict';

var Color = function(r, g, b) {
  this.r = r;
  this.g = g;
  this.b = b;
};

Color.prototype.toRGBA = function() {
  return 'rgba(' + this.r + ', ' + this.g + ', ' + this.b + ' , 0.8)';
};

module.exports = Color;
},{}],4:[function(require,module,exports){
/*
Flocking
*/

'use strict';

var randInt = require('./utils').randInt;
var Vector = require('./vector3d');
var Line = require('./line');
var Circle = require('./circle');
var Boid = require('./boid');

var Flocking = function(parentNode, options) {
  var canvasElement = document.createElement('canvas');
  this.ctx = canvasElement.getContext("2d");

  // parse options
  options = options || {};
  Boid.height = this.height = canvasElement.height = options.height || 500;
  Boid.width = Line.width = this.width = canvasElement.width = options.width || 500;
  Boid.deep = 500;
  Boid.maxSpeed = options.maxSpeed || 2;
  Boid.maxForce = options.maxForce || 0.05;
  Boid.neighbourRadius = options.neighbourRadius || 45;
  Boid.desiredSeparation = options.desiredSeparation || 5;
  Boid.gravity = options.gravity || 26;
  var N = options.N || 100;
  this.shapes = options.shapes || [];

  parentNode.appendChild(canvasElement);
  this.boids = [];

  Circle.ctx = Boid.ctx = Line.ctx = this.ctx;

  for (var i = 0 ; i < N ; i++) {
    this.addBoid();
  }
  this.reqAnimationFrame();
};

Flocking.prototype.addBoid = function() {
  this.boids.push(new Boid(new Vector(randInt(0, this.width) - this.width/2,
                                      randInt(0, this.height) - this.height/2,
                                      randInt(Boid.minDeep, Boid.deep)),
                           this.shapes));
};

Flocking.prototype.reqAnimationFrame = function() {
  window.requestAnimationFrame(this.onComputeFrame.bind(this));
};

Flocking.prototype.onComputeFrame = function() {
  this.reqAnimationFrame();
  this.ctx.save(); //Freeze redraw
  this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
  this.ctx.fillRect(0, 0, this.width, this.height);
  var i;

  for (i = 0 ; i < this.shapes.length ; i++) {
    this.shapes[i].render();
  }

  for (i = 0 ; i < this.boids.length ; i++) {
    var boid = this.boids[i];
    boid.step(this.boids);
    boid.render();
  }
  this.ctx.restore();
};

module.exports = Flocking;

},{"./boid":1,"./circle":2,"./line":6,"./utils":7,"./vector3d":9}],5:[function(require,module,exports){

'use strict';

//var Vector = require('./vector3d');
//var Line = require('./line');
//var Circle = require('./circle');
var Flocking = require('./flocking');
var HEIGHT = require('./utils').HEIGHT;
var WIDTH = require('./utils').WIDTH;

document.addEventListener('DOMContentLoaded', function() {

  var canvasHeight = HEIGHT/1.4;
  var canvasWidth = WIDTH;

  var shapes = [
    // new Sphere(new Vector(0, 0, 400), 100),
    // new Line(3, 54),
    // new Line(-0.12, 154),
    // new Circle(new Vector(canvasWidth/1.8, canvasHeight/1.3), canvasWidth/13),
    // new Circle(new Vector(canvasWidth/2.1, canvasHeight/2.9), canvasWidth/21),
    // new Circle(new Vector(canvasWidth/3.3, canvasHeight/2.4), canvasWidth/29),
  ];

  new Flocking(document.getElementById("flocking"), {
    N: 220,                     // number of boids
    height: canvasHeight,       // height of the canvas
    width: canvasWidth,         // width  of the canvas
    maxSpeed: 3,                // speed limit
    maxForce: 0.02,             // force limit
    neighbourRadius: 85,        // neighbourhood factor
    desiredSeparation: 50,      // speration parameter
    gravity: 8,                 // gravity parameter
    shapes: shapes              // shapes on scene
  });

});
},{"./flocking":4,"./utils":7}],6:[function(require,module,exports){
/*
Line class
*/

'use strict';

var Hit = require('./utils').Hit;
var Vector = require('./vector');

var Line = function(m, z) {
  // y = mx + z
  this.m = m;
  this.z = z;
  // mx - y + z = 0;
  this.a = m;
  this.b = -1;
  this.c = z;
};

Line.prototype.equation = function(x) {
  return this.m * x + this.z;
};

Line.prototype.distance = function(point) {
  var norm2 = this.a * this.a + this.b * this.b;
  var orth = Math.abs(this.a * point.x + this.b * point.y + this.c) / Math.sqrt(norm2);
  var proj = new Vector(
    (this.b * this.b * point.x - this.a * this.b * point.y - this.a * this.c) / norm2,
    (-this.a * this.b * point.x + this.a * this.a * point.y - this.b * this.c) / norm2
  );

  var hit = new Hit();
  hit.point = proj;
  hit.distance = orth;
  return hit;
};

Line.prototype.render = function() {
  var context = Line.ctx;
  context.beginPath();
  context.moveTo(0, this.equation(0));
  context.lineTo(Line.width, this.equation(Line.width));
  context.lineJoin = 'round';
  context.lineWidth = 2;
  context.strokeStyle = "rgba(200,200,200,1)";
  context.stroke();
};

module.exports = Line;

},{"./utils":7,"./vector":8}],7:[function(require,module,exports){
/*
Utils
*/

'use strict';

var INFINY = 100000000;

var WIDTH = Math.max(document.documentElement.clientWidth, window.innerWidth || 0);
var HEIGHT = Math.max(document.documentElement.clientHeight, window.innerHeight || 0);

var randInt = function(min, max) {
  return Math.floor(Math.random() * (max - min)) + min;
};

var randFloat = function(min, max) {
  return Math.random() * (max - min) + min;
};

var Hit = function() {
  this.point = INFINY;
  this.distance = INFINY;
};

exports.INFINY = INFINY;
exports.randInt = randInt;
exports.randFloat = randFloat;
exports.Hit = Hit;
exports.WIDTH = WIDTH;
exports.HEIGHT = HEIGHT;

},{}],8:[function(require,module,exports){
/*
Vector class
*/

'use strict';

var Vector = function(x, y) {
  this.x = x;
  this.y = y;
};

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
    return this;
  }
};

Vector.prototype.distance = function(other) {
  return this.minus(other).magnitude();
};

module.exports = Vector;
},{}],9:[function(require,module,exports){
/*
Vector class
*/

'use strict';

var Vector3d = function(x, y, z) {
  this.x = x;
  this.y = y;
  this.z = z;
};

Vector3d.prototype.copy = function() {
  return new Vector3d(this.x, this.y, this.z);
};

Vector3d.prototype.plus = function(b) {
  return new Vector3d(this.x + b.x, this.y + b.y, this.z + b.z);
};

Vector3d.prototype.minus = function(b) {
  return new Vector3d(this.x - b.x, this.y - b.y, this.z - b.z);
};

Vector3d.prototype.scale = function(s) {
  return new Vector3d(this.x * s, this.y * s, this.z * s);
};

Vector3d.prototype.dot = function(b) {
  return this.x * b.x + this.y * b.y + this.z * b.z;
};

Vector3d.prototype.magnitude = function() {
  return Math.sqrt(this.dot(this));
};

Vector3d.prototype.normalize = function() {
  return this.scale(1 / this.magnitude());
};

Vector3d.prototype.limit = function(border) {
  var magnitude = this.magnitude();
  if (magnitude > border) {
    return this.scale(border / magnitude);
  } else {
    return this;
  }
};

Vector3d.prototype.distance = function(other) {
  return this.minus(other).magnitude();
};

Vector3d.prototype.toAngles = function() {
  return {
    theta: Math.atan2(this.z, this.x),
    phi: Math.asin(this.y / this.magnitude())
  };
};

module.exports = Vector3d;
},{}]},{},[5]);
