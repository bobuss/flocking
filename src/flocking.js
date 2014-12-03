/*
Flocking
*/

'use strict';

var randInt = require('./utils').randInt;
var Vector = require('./vector');
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
  Boid.max_speed = options.max_speed || 2;
  Boid.max_force = options.max_force || 0.05;
  Boid.neighbour_radius = options.neighbour_radius || 45;
  Boid.desired_separation = options.desired_separation || 5;
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
  this.boids.push(new Boid(new Vector(randInt(0, this.width), randInt(0, this.height)),
                           this.shapes));
};

Flocking.prototype.reqAnimationFrame = function() {
  window.requestAnimationFrame(this.onComputeFrame.bind(this));
};

Flocking.prototype.onComputeFrame = function() {
  this.reqAnimationFrame();
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
};

module.exports = Flocking;
