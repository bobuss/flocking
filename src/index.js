
'use strict';

var Vector = require('./vector');
var Line = require('./line');
var Circle = require('./circle');
var Flocking = require('./flocking');

document.addEventListener('DOMContentLoaded', function() {

  var shapes = [
    new Line(2, 54),
    new Line(-0.12, 154),
    new Circle(new Vector(250, 300), 50),
    new Circle(new Vector(300, 200), 18)
  ];

  new Flocking(document.getElementById("flocking"), {
    N: 100,                     // number of boids
    height: 400,                // height of the canvas
    width: 400,                 // width  of the canvas
    max_speed: 2,               // speed limit
    max_force: 0.07,            // force limit
    neighbour_radius: 35,       // neighbourhood factor
    desired_separation: 5,      // speration parameter
    gravity: 6,                 // gravity parameter
    shapes: shapes              // shapes on scene
  });

});