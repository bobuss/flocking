# Focking algorithm in javascript

[http://www.tornil.net/flocking/](http://www.tornil.net/flocking/)


## Build

```shell
$ npm install
$ grunt
```

## Usage

```javascript
var flocking = new Flocking(document.getElementById("flocking"), {
    N: 150,                     // number of boids
    height: 400,                // height of the canvas
    width: 400,                 // width  of the canvas
    max_speed: 2,               // speed limit
    max_force: 0.05,            // force limit
    neighbour_radius: 45,       // neighbourhood factor
    desired_separation: 5,      // speration parameter
    gravity: 6                  // gravity parameter
});
```
