
document.addEventListener('DOMContentLoaded', function() {

  var flocking = new Flocking(document.getElementById("flocking"), {
    N: 100,                     // number of boids
    height: 400,                // height of the canvas
    width: 400,                 // width  of the canvas
    max_speed: 1.5,             // speed limit
    max_force: 0.04,            // force limit
    neighbour_radius: 35,       // neighbourhood factor
    desired_separation: 10,     // speration parameter
    gravity: 2                  // gravity parameter
  });

});