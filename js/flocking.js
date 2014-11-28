(function(window, document){
  /* Utils */
  function randInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
  }

  function randFloat(min, max) {
    return Math.random() * (max - min) + min;
  }

  /* Vector class */
  Vector = function(x, y) {
    this.x = x;
    this.y = y;
  }

  Vector.prototype.copy = function() {
    return new Vector(this.x, this.y);
  };

  Vector.prototype.plus = function(b) {
    return new Vector(this.x + b.x, this.y + b.y);
  };

  Vector.prototype.minus = function(b) {
    return new Vector(this.x - b.x, this.y - b.y);
  };

  Vector.prototype.scale = function(s) {
    return new Vector(this.x * s, this.y * s);
  };

  Vector.prototype.dot = function(b) {
    return this.x * b.x + this.y * b.y;
  };

  Vector.prototype.magnitude = function() {
    return Math.sqrt(this.dot(this));
  };

  Vector.prototype.normalize = function() {
    return this.scale(1 / this.magnitude());
  };

  Vector.prototype.limit = function(border) {
    var magnitude = this.magnitude();
    if (magnitude > border) {
      return this.scale(border / magnitude);
    } else {
      return this
    }
  };

  Vector.prototype.distance = function(other) {
    return this.minus(other).magnitude();
  };


  /* Color class */
  Color = function(r, g, b) {
    this.r = r;
    this.g = g;
    this.b = b;
  }

  Color.prototype.toRGBA = function() {
    return 'rgba(' + this.r + ', ' + this.g + ', ' + this.b + ' , 0.8)';
  };


  /* Boid class */
  Boid = function(position, ctx) {
    this.position = position.copy();
    this.velocity = new Vector(randFloat(-1, 1), randFloat(-1, 1));
    this.acceleration = new Vector(0, 0);
    this.r = 2;
    this.ctx = ctx;
    this.color = new Color(randInt(0, 255), randInt(0, 255), randInt(0, 255));
  };

  /* Some defaults */
  Boid.height = 500;
  Boid.width = 500;
  Boid.max_speed = 2;
  Boid.max_force = 0.05;
  Boid.neighbour_radius = 45;
  Boid.desired_separation = 5;
  Boid.gravity = 26;

  Boid.prototype.step = function(neighbours) {
    var acceleration = this.flock(neighbours).plus(this.avoidBorders());
    // Limit the maximum speed at which a boid can go
    this.velocity = this.velocity.plus(acceleration).limit(Boid.max_speed);
    this.position = this.position.plus(this.velocity);
  };

  Boid.prototype.flock = function(neighbours) {
    var separation = this.separate(neighbours);
    var alignement = this.align(neighbours);
    var cohesion = this.cohere(neighbours);

    return separation.plus(alignement).plus(cohesion);
  };

  Boid.prototype.cohere = function(neighbours) {
    // Called to get the cohesion component of the acceleration
    var sum = new Vector(0, 0);
    var count = 0;

    for (var i = 0 ; i < neighbours.length ; i++) {
      var boid = neighbours[i];
      var d = this.position.distance(boid.position);
      if ((d > 0) && (d < Boid.neighbour_radius)) {
        sum = sum.plus(boid.position);
        count++;
      }
    }

    if (count > 0) {
      return this.steer_to(sum.scale(1/count));
    } else {
      // Empty vector contributes nothing
      return sum;
    }
  };

  Boid.prototype.steer_to = function(target) {
    // A vector pointing from the position to the target
    var desired = target.minus(this.position);

    // Distance from the target is the magnitude of the vector
    var d = desired.magnitude();

    // If the distance is greater than 0, calc steering
    // (otherwise return zero vector)
    if (d > 0) {
      desired = desired.normalize();
      // Two options for desired vector magnitude
      // (1 -- based on distance, 2 -- maxspeed)
      if (d < 100.0) {
        // This damping is arbitrary
        desired = desired.scale(Boid.max_speed * (d / 100));
      } else {
        desired = desired.scale(Boid.max_speed);
      }
      // Steering = Desired minus Velocity
      // Limit to maximum steering force
      return desired.minus(this.velocity).limit(Boid.max_force);
    } else {
      return new Vector(0,0);
    }
  };

  Boid.prototype.align = function(neighbours) {
    // Alignment component for the frame's acceleration
    var mean = new Vector(0, 0);
    var count = 0

    for (var i = 0 ; i < neighbours.length ; i++) {
      var boid = neighbours[i];
      var d = this.position.distance(boid.position);
      if ((d > 0) && (d < Boid.neighbour_radius)) {
        mean = mean.plus(boid.velocity);
        count++
      }
    }

    if (count > 0) {
      mean = mean.scale(1/count);
    }
    mean = mean.limit(Boid.max_force);

    return mean;
  };

  Boid.prototype.separate = function(neighbours) {
    //Separation component for the frame's acceleration
    var mean = new Vector(0, 0);
    var count = 0;

    for (var i = 0 ; i < neighbours.length ; i++) {
      var boid = neighbours[i];
      var d = this.position.distance(boid.position);
      if ((d > 0) && (d < Boid.desired_separation)) {
        // Normalized, weighted by distance vector pointing away from the neighbour
        mean = mean.plus(this.position.minus(boid.position).normalize().scale(1 / d));
        count++
      }
    }
    if (count > 0) {
      mean = mean.scale(1/count);
    }

    return mean
  };

  Boid.prototype.avoidBorders = function() {
    var gravity = new Vector(0, 0);

    var borders = new Array();
    borders.push(new Vector(this.position.x, 0));
    borders.push(new Vector(this.position.x, Boid.height));
    borders.push(new Vector(0, this.position.y));
    borders.push(new Vector(Boid.width, this.position.y));

    for (var i = 0 ; i < 4 ; i++) {
      var borderDirection = borders[i].minus(this.position);
      var d = borderDirection.magnitude();
      if (d < 0) {
        d = 0.01;
      }
      if (d > 0 && d < Boid.neighbour_radius * 5) {
        gravity = gravity.plus(borderDirection.normalize().scale( -1 / ( d * d )))
      }
    }
    return gravity.scale(Boid.gravity);
  };

  Boid.prototype.render = function() {
    this.ctx.fillStyle = this.color.toRGBA()
    this.ctx.fillRect(this.position.x, this.position.y, 4, 4);
  };

  Flocking = function(parentNode, options) {
    var canvasElement = document.createElement('canvas');
    this.ctx = canvasElement.getContext("2d");

    // parse options
    var options = options || {};
    Boid.height = this.width = canvasElement.width = options.height || 500;
    Boid.width = this.height = canvasElement.height = options.width || 500;
    Boid.max_speed = options.max_speed || 2;
    Boid.max_force = options.max_force || 0.05;
    Boid.neighbour_radius = options.neighbour_radius || 45;
    Boid.desired_separation = options.desired_separation || 5;
    Boid.gravity = options.gravity || 26;
    var N = options.N || 100;

    parentNode.appendChild(canvasElement);

    this.start = new Vector(this.width / 2, this.height / 2);
    this.boids = new Array();

    for (var i = 0 ; i < N ; i++) {
      this.addBoid();
    }
    this.reqAnimationFrame();
  };

  Flocking.prototype.addBoid = function() {
    this.boids.push(new Boid(this.start, this.ctx));
  };

  Flocking.prototype.reqAnimationFrame = function() {
    window.requestAnimationFrame(this.onComputeFrame.bind(this));
  };

  Flocking.prototype.onComputeFrame = function() {
    this.reqAnimationFrame()
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    for (var i = 0 ; i < this.boids.length ; i++) {
      var boid = this.boids[i];
      boid.step(this.boids);
      boid.render();
    }
  };

  document.Flocking = Flocking;

})(window, document);