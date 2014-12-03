/*
Boid class
*/

'use strict';

var randInt = require('./utils').randInt;
var randFloat = require('./utils').randFloat;
var Vector = require('./vector');
var Color = require('./color');

var Boid = function(position, shapes) {
  this.position = position.copy();
  this.velocity = new Vector(randFloat(-1, 1), randFloat(-1, 1));
  this.acceleration = new Vector(0, 0);
  this.r = 2;
  this.shapes = shapes;
  this.color = new Color(randInt(0, 255), randInt(0, 255), randInt(0, 255));
};

/**/
/* Some defaults */
/**/
Boid.height = 500;
Boid.width = 500;
Boid.max_speed = 2;
Boid.max_force = 0.05;
Boid.neighbour_radius = 45;
Boid.desired_separation = 5;
Boid.gravity = 26;

Boid.prototype.step = function(neighbours) {
  var acceleration = this.flock(neighbours).plus(this.avoidWalls());
  // Limit the maximum speed at which a boid can go
  this.velocity = this.velocity.plus(acceleration).limit(Boid.max_speed);
  this.position = this.position.plus(this.velocity);
  this._wrapIfNeeded();
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
    if ((d > 0) && (d < Boid.neighbour_radius)) {
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
    // 1 -- based on distance,
    // 2 -- maxspeed
    if (d < 100.0) {
      // This damping is arbitrary
      desired = desired.scale(Boid.max_speed * (d / 100));
    } else {
      desired = desired.scale(Boid.max_speed);
    }
    // Steering = Desired minus Velocity
    // Limit to maximum steering force
    return desired.minus(this.velocity).limit(Boid.max_force);
  } else {
    return new Vector(0,0);
  }
};

Boid.prototype.align = function(neighbours) {
  // Alignment component for the frame's acceleration
  var mean = new Vector(0, 0);
  var count = 0;

  for (var i = 0 ; i < neighbours.length ; i++) {
    var boid = neighbours[i];
    var d = this.position.distance(boid.position);
    if ((d > 0) && (d < Boid.neighbour_radius)) {
      mean = mean.plus(boid.velocity);
      count++;
    }
  }

  if (count > 0) {
    mean = mean.scale(1/count);
  }
  mean = mean.limit(Boid.max_force);

  return mean;
};

Boid.prototype.separate = function(neighbours) {
  //Separation component for the frame's acceleration
  var mean = new Vector(0, 0);
  var count = 0;

  for (var i = 0 ; i < neighbours.length ; i++) {
    var boid = neighbours[i];
    var d = this.position.distance(boid.position);
    if ((d > 0) && (d < Boid.desired_separation)) {
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

  var acc = new Vector(0, 0);

  for (var i = 0 ; i < this.shapes.length ; ++i) {

    var shape = this.shapes[i];

    var ext_dist = shape.distance(this.position);

    var closestPoint = ext_dist.point;
    var d = ext_dist.distance;
    var mouseDirection = closestPoint.minus(this.position);

    if (d < 0) {
      d = 0.01;
    }
    if (d > 0 && d < Boid.neighbour_radius * 5) {
      acc = acc.plus(mouseDirection.normalize().scale( -1 / ( d * d )));
    }
  }

  return acc.scale(Boid.gravity);

};

Boid.prototype._wrapIfNeeded = function() {
  if (this.position.x < 0) {
    this.position.x = Boid.width;
  } else if (this.position.x > Boid.width) {
    this.position.x = 0;
  }
  if (this.position.y < 0) {
    this.position.y = Boid.height;
  } else if (this.position.y > Boid.height) {
    this.position.y = 0;
  }
};

Boid.prototype.render = function() {
  Boid.ctx.fillStyle = this.color.toRGBA();
  Boid.ctx.fillRect(this.position.x, this.position.y, 4, 4);
};

module.exports = Boid;