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