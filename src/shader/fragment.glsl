uniform float time;
uniform float progress;
uniform sampler2D texture1;
uniform sampler2D texture2;
uniform vec4 resolution;
varying vec2 vUv;
varying vec4 vPosition;

varying float vOpacity;

void main()	{
	// vec2 newUV = (vUv - vec2(0.5))*resolution.zw + vec2(0.5);
	// gl_FragColor = vec4(vUv,0.0,1.);
	
	// gl_FragColor = vec4(1.)*vOpacity;
	vec2 cUv = 2.*vec2(gl_PointCoord.x,1. - gl_PointCoord.y) - 1.;

  vec4 color = vec4(0.08/length(cUv));

  vec3 originalColor = vec3(4./255.,10./255.,20./255.);

  color.rgb = min(vec3(10.),color.rbg); 
  color.rgb*=originalColor*120.;
  color *= vOpacity;
  color.a = min(1.,color.a)*10.;

  float disc = length(cUv);



  // float strength = distance(gl_PointCoord,vec2(0.5));
  // strength *=2.0;
  // strength = 1.0 - strength;

  // vec4 mixcolor = mix(vec4(0.0),color,strength);
  // gl_FragColor = vec4( mixcolor);
  gl_FragColor = vec4(1. - disc,0.,0.,1.)*vOpacity;
	gl_FragColor = vec4(color.rgb,color.a);
	
}