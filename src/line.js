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
  context.moveTo(this.minX, this.equation(this.minX));
  for(var x = 0; x <= Line.width; x += 100) {
    context.lineTo(x, this.equation(x));
  }
  context.lineJoin = 'round';
  context.lineWidth = 2;
  context.strokeStyle = "rgba(200,200,200,1)";
  context.stroke();
};

module.exports = Line;
