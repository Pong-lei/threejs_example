uniform float iTime;
uniform float progress;
uniform sampler2D texture1;
uniform sampler2D texture2;
uniform vec4 resolution;
varying vec2 vUv;
varying vec4 vPosition;

// varying float vOpacity;

void main()	{
	// vec2 newUV = (vUv - vec2(0.5))*resolution.zw + vec2(0.5);
  vec4 finalyT = texture2D(texture1,vUv);
	gl_FragColor = finalyT;
	
	// gl_FragColor = vec4(0.,0.,1.,1.);
	
}