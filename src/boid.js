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

Boid.prototype.step = function(neighbours) {
  var acceleration = this.flock(neighbours).plus(this.avoidWalls());
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
  var sum = new Vector(0, 0, 0);
  var count = 0;

  for (var i = 0 ; i < neighbours.length ; i++) {
    var boid = neighbours[i];
    var d = this.position.distance(boid.position);
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
  var mean = new Vector(0, 0, 0);
  var count = 0;

  for (var i = 0 ; i < neighbours.length ; i++) {
    var boid = neighbours[i];
    var d = this.position.distance(boid.position);
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
  var mean = new Vector(0, 0, 0);
  var count = 0;

  for (var i = 0 ; i < neighbours.length ; i++) {
    var boid = neighbours[i];
    var d = this.position.distance(boid.position);
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

Boid.prototype.avoidWalls = function() {
  var acc = new Vector(0, 0, 0);

  var borders = [];
  borders.push(new Vector(this.position.x, this.position.y, Boid.minDeep));
  borders.push(new Vector(this.position.x, this.position.y, Boid.deep));

  borders.push(new Vector(this.position.x, Boid.height / 2 , this.position.z));
  borders.push(new Vector(this.position.x, -Boid.height / 2 , this.position.z));

  borders.push(new Vector(Boid.width / 2, this.position.y, this.position.z));
  borders.push(new Vector(- Boid.width / 2, this.position.y, this.position.z));

  for (var i = 0 ; i < borders.length ; i++) {
    var borderDirection = borders[i].minus(this.position);
    var d = borderDirection.magnitude();

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

  var acc = new Vector(0, 0, 0);

  for (var i = 0 ; i < this.shapes.length ; ++i) {

    var shape = this.shapes[i];

    var ext_dist = shape.distance(this.position);

    var closestPoint = ext_dist.point;
    var d = ext_dist.distance;
    var mouseDirection = closestPoint.minus(this.position);

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

Boid.prototype.render = function() {
  Boid.ctx.fillStyle = this.color.toRGBA();
  Boid.ctx.fillRect(this.projected().x,
                    this.projected().y,
                    this.size(), this.size());
};

module.exports = Boid;