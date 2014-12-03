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