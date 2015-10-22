precision highp float;

uniform float time;

uniform vec2 iResolution;

uniform vec3 camera_position;
uniform mat4 camera;

float map(vec3 p) {
  vec3 c = vec3(2.0);
  vec3 q = mod(p, c) -0.5 * c;

  return length(q) - 0.25;
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
  vec2 uv = gl_FragCoord.xy / iResolution.xy;

  uv = uv * 2.0 - 1.0;

  vec3 r = vec3(uv, 1.0);

  r = (camera * vec4(r, 1.0)).xyz;

  float t = trace(camera_position, r);

  float fog = 1.0 / (1.0 + t * t * 0.1);

  gl_FragColor = vec4(vec3(fog), 1.0);
}
