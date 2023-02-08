varying vec2 vUv;
varying vec4 vPosition;
// varying vec3 vPosition;
uniform vec2 pixels;
uniform float iTime;

attribute float aRandom;
// attribute float aRandom;

void main() {

  vUv = uv;
  vec3 pos = position;
  // pos.x += aRandom * sin((uv.y + uv.x + iTime) * 10.0 ) * 0.5;
  pos += aRandom * (0.5*sin(iTime)+0.5) * normal;
  // vUv = uv;
  vec4 mvPosition = modelViewMatrix * vec4( pos, 1. );
  // gl_PointSize = 10. * ( 1. / - mvPosition.z );
  gl_Position = projectionMatrix * mvPosition;

}