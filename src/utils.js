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
