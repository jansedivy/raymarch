var keys = {};
var mat4 = require('gl-matrix').mat4;

document.addEventListener('keydown', function(e) {
  keys[e.keyCode] = true;
});

document.addEventListener('keyup', function(e) {
  keys[e.keyCode] = false;
});

var get = function(url, callback) {
  var request = new XMLHttpRequest();
  request.open('GET', url);
  request.onload = function() {
    callback(this.responseText);
  };
  request.send(null);
};

var rad = function(value) {
  return value * (Math.PI / 180);
};

var canvas = document.querySelector('canvas');
var width = canvas.width = window.innerWidth;
var height = canvas.height = window.innerHeight;
var resolution = [width, height];

canvas.requestPointerLock = canvas.requestPointerLock || canvas.mozRequestPointerLock || canvas.webkitRequestPointerLock;

var gl = canvas.getContext('webgl');

gl.clearColor(0, 0, 0, 1);

var fs = require('fs');

var fragReady = false;
var vertReady = false;

var vertexSource = '';
var fragmentSource = '';

var program = null;

var position = [0, 10, 0];
var velocity = [0, 0.1, 0];
var rotation = [0, 0, 0];
var forward = [0, 0, 0];
var cameraMatrix = mat4.create();
var invertCameraMatrix = mat4.create();

var cameraPositionId = null;
var resolutionId = null;
var timeId = null;
var cameraId = null;

var createProgram = function() {
  if (program) {
    gl.deleteProgram(program);
    program = null;
  }

  program = gl.createProgram();
  var vertex = gl.createShader(gl.VERTEX_SHADER);
  gl.shaderSource(vertex, vertexSource);
  gl.compileShader(vertex);

  if (!gl.getShaderParameter(vertex, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(vertex));
  }

  var fragment = gl.createShader(gl.FRAGMENT_SHADER);
  gl.shaderSource(fragment, fragmentSource);
  gl.compileShader(fragment);

  if (!gl.getShaderParameter(fragment, gl.COMPILE_STATUS)) {
    console.error(gl.getShaderInfoLog(fragment));
  }

  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);

  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error('Could not initialise shaders');
  }

  gl.useProgram(program);

  resolutionId = gl.getUniformLocation(program, 'iResolution');
  timeId = gl.getUniformLocation(program, 'time');
  cameraId = gl.getUniformLocation(program, 'camera');
  cameraPositionId = gl.getUniformLocation(program, 'camera_position');
};

  var vertices = [
    -1.0, -1.0,
    1.0, -1.0,
    -1.0, 1.0,

    1.0, -1.0,
    1.0, 1.0,
    -1.0, 1.0
  ];

  var buffer = gl.createBuffer();
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(vertices), gl.STATIC_DRAW);

  var time = 0.0;

var run = function() {
  time += 0.01666;

  position[0] += velocity[0];
  position[1] += velocity[1];
  position[2] += velocity[2];

  forward[0] = Math.sin(rotation[1]) * Math.cos(rotation[0]);
  forward[1] = -Math.sin(rotation[0]);
  forward[2] = -Math.cos(rotation[1]) * Math.cos(rotation[0]);

  // if (keys[65]) { // left
  //   velocity[0] -= 0.1;
  // }
  if (keys[87]) { // up
    velocity[0] += forward[0] / 100;
    velocity[1] += forward[1] / 100;
    velocity[2] += forward[2] / 100;
  }
  // if (keys[69] || keys[68]) { // right
  //   velocity[0] += 0.1;
  // }
  if (keys[83]) { // down
    velocity[0] -= forward[0] / 100;
    velocity[1] -= forward[1] / 100;
    velocity[2] -= forward[2] / 100;
  }

  velocity[0] *= 0.86;
  velocity[1] *= 0.86;
  velocity[2] *= 0.86;


  mat4.identity(cameraMatrix);
  mat4.perspective(cameraMatrix, rad(70), width / height, 0.1, 100);

  mat4.rotateX(cameraMatrix, cameraMatrix, rotation[0]);
  mat4.rotateY(cameraMatrix, cameraMatrix, rotation[1]);
  mat4.rotateZ(cameraMatrix, cameraMatrix, rotation[2]);

  gl.useProgram(program);
  gl.enableVertexAttribArray(0);

  gl.uniform2fv(resolutionId, resolution);
  gl.uniform1f(timeId, time);

  mat4.invert(invertCameraMatrix, cameraMatrix);

  gl.uniformMatrix4fv(cameraId, false, invertCameraMatrix);
  gl.uniform3fv(cameraPositionId, position);

  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
  gl.clear(gl.COLOR_BUFFER_BIT);
  gl.drawArrays(gl.TRIANGLES, 0, 6);

  window.requestAnimationFrame(run);
};

get('shader.frag', function(source) {
  fragmentSource = source;
  fragReady = true;
  if (vertReady) {
    createProgram();
    run();
  }
});

get('shader.vert', function(source) {
  vertexSource = source;
  vertReady = true;
  if (fragReady) {
    createProgram();
    run();
  }
});


var reload = function() {
  fragReady = false;
  vertReady = false;

  get('shader.frag?cache=' + Date.now(), function(source) {
    fragmentSource = source;
    fragReady = true;
    if (vertReady) {
      createProgram();
    }
  });

  get('shader.vert?cache=' + Date.now(), function(source) {
    vertexSource = source;
    vertReady = true;
    if (fragReady) {
      createProgram();
    }
  });
};

document.addEventListener('mousedown', function(e) {
  canvas.requestPointerLock();
});

document.addEventListener('keydown', function(e) {
  if (e.keyCode === 82) { // r
    reload();
  }
});

document.addEventListener('mousemove', function(e) {
  var x = e.movementX || e.mozMovementX || e.webkitMovementX || 0;
  var y = e.movementY || e.mozMovementY || e.webkitMovementY || 0;

  rotation[0] += y / 300;
  rotation[1] += x / 300;
});
