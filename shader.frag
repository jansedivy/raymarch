precision mediump float;

uniform float time;

uniform vec2 iResolution;

uniform vec3 camera_position;
uniform mat4 camera;

float torus(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz)-t.x,p.y);
  return length(q)-t.y;
}

float opTwist(vec3 p, float offsetPosition) {
  float c = cos(20.0*p.y);
  float s = sin(20.0*p.y);
  mat2  m = mat2(c,-s,s,c);
  vec3  q = vec3(m*p.xz,p.y);
  return torus(q, vec2(0.3, 0.1));
}

float map(vec3 p) {
  vec3 c = vec3(2.0);
  vec3 q = mod(p, c)-0.5*c;

  return opTwist(q, p.x+p.y+p.z);
}

float trace(vec3 o, vec3 r) {
  float t = 0.0;

  for (int i=0; i<32; i++) {
    vec3 p = o + r * t;

    float d = map(p);

    t += d * 0.5;
  }

  return t;
}

void main(void) {
  mat4 test = camera;

  vec2 uv = gl_FragCoord.xy / iResolution.xy;

  uv = uv * 2.0 - 1.0;

  vec3 r = normalize(vec3(uv, 1.0));

  float the = time * 0.25;

  r = vec3(camera * vec4(r, 1.0));

  float t = trace(camera_position, r);

  float fog = 1.0 / (1.0 + t * t * 0.1);

  vec3 fc = vec3(1.0 - fog) * vec3(0.4, 0.8, 0.9);

  gl_FragColor = vec4(fc, 1.0);
}
