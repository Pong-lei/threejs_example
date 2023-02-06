uniform vec4 iResolution;
uniform vec2 iMouse;
uniform float iTime;

varying vec2 vUv;

void mainImage( out vec4 fragColor, in vec2 fragCoord )
{
	// vec2 uv = 1.5*(2.0*fragCoord.xy - iResolution.xy) / iResolution.y;
  // vec2 mouse = 1.5*(2.0*iMouse.xy - iResolution.xy) / iResolution.y;
  // float x = iMouse.x * 1.0;
  // float y = iMouse.y * 1.0;
	// vec2 offset = vec2(cos(iTime/2.0)*x,sin(iTime/2.0)*y);

	vec3 light_color = vec3(0.9, 0.65, 0.5);
	// float light = 0.1 / distance(normalize(vUv), vUv);
	float light = step(distance(vec2(0.5,0.5), vUv),0.01);
	
	// if(length(vUv) < 1.0){
	// 	light *= 0.1 / distance(normalize(vUv-offset), vUv-offset);
	// }

	fragColor = vec4(light,0.0,0.0, 1.0);
}
void main()	{
  mainImage(gl_FragColor, gl_FragCoord.xy);
  // gl_FragColor = vec4(1.0,.0,.0,1.);
  // gl_FragColor = vec4(vUv,1.,1.);
}