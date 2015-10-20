attribute vec2 positions;

void main(void) {
  gl_Position = vec4(positions, 0.0, 1.0);
}
