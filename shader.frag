precision mediump float;

uniform float time;

uniform vec2 iResolution;

uniform mat4 camera;

float torus(vec3 p, vec2 t) {
  vec2 q = vec2(length(p.xz)-t.x,p.y);
  return length(q)-t.y;
}

float opTwist(vec3 p, float offsetPosition) {
  float c = cos(sin(offsetPosition + time)*20.0*p.y);
  float s = sin(sin(offsetPosition + time)*20.0*p.y);
  mat2  m = mat2(c,-s,s,c);
  vec3  q = vec3(m*p.xz,p.y);
  return torus(q, vec2(0.2));
}

float map(vec3 p) {
  vec3 c = vec3(2.0);
  vec3 q = mod(p, c)-0.5*c;

  return opTwist(q, p.x+p.y);
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

  uv.x *= iResolution.x/iResolution.y;

  vec3 r = normalize(vec3(uv, 1.0));

  float the = time * 0.25;
  r.xz *= mat2(cos(the), -sin(the), sin(the), cos(the));

  vec3 o = vec3(0.0, 0.0, time);

  float t = trace(o, r);

  float fog = 1.0 / (1.0 + t * t * 0.1);

  vec3 fc = vec3(fog) * vec3(0.1, 0.8, 0.9);

  gl_FragColor = vec4(fc, 1.0);
}
