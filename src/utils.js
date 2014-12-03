/*
Utils
*/

'use strict';

var INFINY = 100000000;

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
