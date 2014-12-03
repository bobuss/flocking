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