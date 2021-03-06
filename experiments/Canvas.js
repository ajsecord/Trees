// TODO: Pass time since last update to the update function.
// TODO: Encapsulate all the parameters needed for trees into a config object. There will be more.

// Uniform random number in [min,max].
function uniform_random_in_range(min, max) {
  return min + Math.random() * (max - min);
}

function uniform_random_in_range_2d(min, max) {
  var x = uniform_random_in_range(min.x, max.x);
  var y = uniform_random_in_range(min.y, max.y);
  return new Point(x, y);
}

// Return a random variate from parameters.
function random_variate(params) {
  var min = "min" in params ? params.min : 0;
  var max = "max" in params ? params.max : 1;
  var func = "func" in params ? params.func : uniform_random_in_range;
  return func(min, max);
}

// Return true if two disks overlap.
function disk_overlap(center1, size1, center2, size2) {
  var d = Math.hypot(center1.x - center2.x, center1.y - center2.y);
  return d - (size1 + size2) / 2;
}

// Return a probability to accept an overlap between two disks.
function soft_overlap(center1, size1, center2, size2) {
  // Normalize so the first disk is at (0,0) with a radius of 1.
  // Technically, transform by M = ST where S = (1/R1) * I and 
  // T = -C1.
  var x = center2.x / size1 - center1.x / size1;
  var y = center2.y / size1 - center1.y / size1;

  // 'd' is the distance between the disk centers.
  // 'r' is the (normalized) radius of the second disk.
  var d = Math.hypot(x, y);
  var r = size2 / size1;
  
  // Probability has the following properties:
  //  * P(d = 0) = 0
  //  * P(d > 1 + r) = 1
  //  * P(r constant) = some increasing function of d.
  // Lots of models have these properties, so we'll pick a simple linear one.
  // (Well, linear in d.)
  var P = Math.min(d / (1 + r), 1);
  return P;
}

// Random disk generator.
var RandomDiskGenerator = function(center_params, size_params) {
  this.center_params = center_params;
  this.size_params = size_params;
}

RandomDiskGenerator.prototype.generate = function(disks) {
  var size = random_variate(this.size_params);
  var center = random_variate(this.center_params);
  return { size : size, center : center };
}

// Avoid disk generator.
var AvoidDiskGenerator = function(center_params, size_params) {
  this.center_params = center_params;
  this.size_params = size_params;
}

AvoidDiskGenerator.prototype.generate = function(disks) {
  var size;
  var center;
  var overlap;
  do {
    size = random_variate(this.size_params);
    center = random_variate(this.center_params);

    overlap = false; 
    for (var i = 0; i < disks.length; ++i) {
      if (disk_overlap(center, size, disks[i].center, disks[i].size) < 0) {
        overlap = true;
        break;
      }
    } 
  } while(overlap);
  
  return { size : size, center : center };
}

// Soft disk generator
var SoftDiskGenerator = function(center_params, size_params) {
  this.center_params = center_params;
  this.size_params = size_params;
}

SoftDiskGenerator.prototype.generate = function(disks) {
  var size;
  var center;
  var overlap;
  do {
    size = random_variate(this.size_params);
    center = random_variate(this.center_params);

    var p = 1;
    for (var i = 0; i < disks.length; ++i) {
      p *= soft_overlap(center, size, disks[i].center, disks[i].size);
    } 

    // Rejection sampling.
    var test = uniform_random_in_range(0, 1);
    if (test <= p) {
      break;
    }

  } while (true);
  
  return { size : size, center : center };
}

// 2D Point
var Point = function(x, y) {
  this.x = x;
  this.y = y;
}

// Tree
var Tree = function(center, size) {
  this.center = center;
  this.size = size;    
}

Tree.prototype.update = function(context) {
  //this.size += 0.2;
}

Tree.prototype.draw = function(context) {
  context.fillStyle = "rgba(5, 115, 12, 0.75)";
  context.beginPath();
  context.arc(this.center.x, this.center.y, this.size / 2, 0, 2 * Math.PI);
  context.fill();
  context.lineWidth = 1;
  context.beginPath();
  context.arc(this.center.x, this.center.y, this.size / 2, 0, 2 * Math.PI);
  context.stroke();
}

// World
var World = function(size, num_trees) {
  this.gen = null;
  this.size = size;
  this.trees = new Array(num_trees);
} 

World.prototype.initialize = function(num_trees) {
  this.create_forest(num_trees);
}

World.prototype.update = function() {
  for (var i = 0; i < this.trees.length; ++i) {
    this.trees[i].update(); 
  }
}

World.prototype.draw = function(context) {
  for (var i = 0; i < this.trees.length; ++i) {
    this.trees[i].draw(context);
  }
}

World.prototype.create_forest = function(num_trees) {
  this.trees = new Array();
  for (var i = 0; i < num_trees; ++i) {
    var disk = this.gen.generate(this.trees);
    this.trees.push(new Tree(disk.center, disk.size));
  }
}

// Globals
var canvas;
var context;
var world;
var timerIntervalID;

function createRadioButton(name, text, selected, onClick) {
  var label = document.createElement("label");
  var radio = document.createElement("input");
  radio.type = "radio";
  radio.name = name;
  radio.checked = selected;
  radio.onclick = onClick;

  label.appendChild(radio);
  label.appendChild(document.createTextNode(text));

  return label;
}

function initWorld() {
  var size = { width: 800, height: 500 };

  world = new World(size, 400);

  // Canvas and context
  canvas = document.createElement("canvas"),
  canvas.width = size.width;
  canvas.height = size.height;
  document.body.insertBefore(canvas, document.body.childNodes[0]);

  context = canvas.getContext("2d");

  // Options
  var ui = document.createElement("p");

  // Pause button
  var button = document.createElement("button");
  button.onclick = function() { pauseButtonClicked(button); }
  button.textContent = "Pause";
  ui.appendChild(button);
  ui.appendChild(document.createElement("br"));

  // Number of trees
  var num_trees = document.createElement("input");
  num_trees.type = "range";
  num_trees.min = 0;
  num_trees.max = 2000;
  num_trees.value = 400;
  num_trees.oninput = function() { world.create_forest(this.value); };
  ui.appendChild(num_trees);
  ui.appendChild(document.createElement("br"));

  // Disk generators
  ui.appendChild(
      createRadioButton("disk-generator",
                        "Random",
                        false,
                        function() { updateDiskGenerator(RandomDiskGenerator); }));
                                         
  ui.appendChild(
      createRadioButton("disk-generator",
                        "Avoid",
                        false,
                        function() { updateDiskGenerator(AvoidDiskGenerator); }));
  ui.appendChild(
      createRadioButton("disk-generator",
                        "Soft",
                        true,
                        function() { updateDiskGenerator(SoftDiskGenerator); }));
  updateDiskGenerator(SoftDiskGenerator);
  ui.appendChild(document.createElement("br"));

  document.body.appendChild(ui);
 
  toggleAnimation(); 
}

function toggleAnimation() {
  if (timerIntervalID) {
    clearInterval(timerIntervalID);
    timerIntervalID = null;
  } else {
    var refresh = 1000 / 30; // fps
    timerIntervalID = setInterval(updateAnimation, refresh);
  }

  return timerIntervalID != null;
}

function pauseButtonClicked(button) {
  var running = toggleAnimation();
  button.textContent = running ? "Pause" : "Start";
}

function updateAnimation() {
  context.clearRect(0, 0, canvas.width, canvas.height);
  world.update();
  world.draw(context);
}

function updateDiskGenerator(generator) {
  var size_params = { min : 0, max : 100 };
  var center_params = {
    min : new Point(0, 0), 
    max : new Point(canvas.width, canvas.height),
    func : uniform_random_in_range_2d
  };
  world.gen = new generator(center_params, size_params);
  world.initialize(world.trees.length);
}
