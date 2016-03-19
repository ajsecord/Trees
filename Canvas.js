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

// Do two disks overlap?
function disk_overlap(center1, size1, center2, size2) {
  var d = Math.hypot(center1.x - center2.x, center1.y - center2.y);
  return d < (size1 + size2) / 2;
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
      if (disk_overlap(center, size, disks[i].center, disks[i].size)) {
        overlap = true;
        break;
      }
    } 
  } while(overlap);
  
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
  this.trees = new Array();
} 

World.prototype.initialize = function(num_trees) {
  this.trees = new Array();
  for (var i = 0; i < num_trees; ++i) {
    var disk = this.gen.generate(this.trees);
    this.trees.push(new Tree(disk.center, disk.size));
  }
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

// Globals
var canvas;
var context;
var world;
var timerIntervalID;

function createRadioButton(name, text, onClick) {
  var label = document.createElement("label");
  var radio = document.createElement("input");
  radio.type = "radio";
  radio.name = name;
  radio.onclick = onClick;

  label.appendChild(radio);
  label.appendChild(document.createTextNode(text));

  return label;
}

function initWorld() {
  var size = { width: 800, height: 500 };

  // Canvas and context
  canvas = document.createElement("canvas"),
  canvas.width = size.width;
  canvas.height = size.height;
  document.body.insertBefore(canvas, document.body.childNodes[0]);

  context = canvas.getContext("2d");

  // Options
  var button = document.createElement("button");
  button.onclick = function() { pauseButtonClicked(button); }
  button.textContent = "Pause";
  document.body.appendChild(button);

  document.body.appendChild(
      createRadioButton("disk-generator",
                        "Random",
                        function() { updateDiskGenerator(RandomDiskGenerator); }));
                                         
  document.body.appendChild(
      createRadioButton("disk-generator",
                        "Avoid",
                        function() { updateDiskGenerator(AvoidDiskGenerator); }));

  world = new World(size, 400);
 
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
  var size_params = { min : 0, max : 50 };
  var center_params = {
    min : new Point(0, 0), 
    max : new Point(canvas.width, canvas.height),
    func : uniform_random_in_range_2d
  };
  world.gen = new generator(center_params, size_params);
  world.initialize(400);
}
