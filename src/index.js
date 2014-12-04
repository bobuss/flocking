
'use strict';

var Vector = require('./vector');
var Line = require('./line');
var Circle = require('./circle');
var Flocking = require('./flocking');
var HEIGHT = require('./utils').HEIGHT;
var WIDTH = require('./utils').WIDTH;

document.addEventListener('DOMContentLoaded', function() {

  var canvasHeight = HEIGHT/1.4;
  var canvasWidth = WIDTH;

  var shapes = [
    new Line(3, 54),
    new Line(-0.12, 154),
    new Circle(new Vector(canvasWidth/1.8, canvasHeight/1.3), canvasWidth/13),
    new Circle(new Vector(canvasWidth/2.1, canvasHeight/2.9), canvasWidth/21),
    new Circle(new Vector(canvasWidth/3.3, canvasHeight/2.4), canvasWidth/29),
  ];

  new Flocking(document.getElementById("flocking"), {
    N: 200,                     // number of boids
    height: canvasHeight,       // height of the canvas
    width: canvasWidth,         // width  of the canvas
    max_speed: 2,               // speed limit
    max_force: 0.07,            // force limit
    neighbour_radius: WIDTH/30, // neighbourhood factor
    desired_separation: 5,      // speration parameter
    gravity: 6,                 // gravity parameter
    shapes: shapes              // shapes on scene
  });

});