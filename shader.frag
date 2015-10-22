precision highp float;

uniform float time;

uniform vec2 iResolution;

uniform vec3 camera_position;
uniform mat4 camera;

float torus(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz)-t.x,p.y);
  return length(q)-t.y;
}

float rand(vec3 co){
    return fract(sin(dot(co.xyz ,vec3(12.9898,78.233, 42.3432))) * 43758.5453);
}

vec3 opTwist(vec3 p) {
  float c = cos(sin(time)*10.0*p.y);
  float s = sin(sin(time)*10.0*p.y);
  mat2 m = mat2(c,-s,s,c);
  return vec3(m*p.xz,p.y);
}

float map(vec3 p) {
  vec3 c = vec3(2.0);
  vec3 q = mod(p, c)-0.5*c;

  return torus(opTwist(q), vec2(0.3, 0.1));
}

float trace(vec3 o, vec3 r) {
  float t = 0.0;

  for (int i=0; i<32; i++) {
    vec3 p = o + r * t;

    float d = map(p);

    t += d * 0.4;
  }

  return t;
}

void main(void) {
  mat4 test = camera; // @remove

  vec2 uv = gl_FragCoord.xy / iResolution.xy;

  uv = uv * 2.0 - 1.0;

  vec3 r = vec3(uv, 1.0);

  r = (camera * vec4(r, 1.0)).xyz;

  float t = trace(camera_position, r);

  float fog = 1.0 / (1.0 + t * t * 0.1);

  vec3 fc = vec3(1.0 - fog) * vec3(0.4, 0.8, 0.9);

  gl_FragColor = vec4(fc, 1.0);
}
