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