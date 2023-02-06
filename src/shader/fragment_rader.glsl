// Author:
// Title:

#ifdef GL_ES
precision mediump float;
#endif

varying vec2 vUv;

#define green vec3(0.0,.3,0.6)
uniform vec2 u_resolution;
uniform vec2 u_mouse;
uniform float u_time;
vec3 RadarPing(in vec2 uv, in vec2 center, in float innerTail, 
               in float frontierBorder, in float timeResetSeconds, 
               in float radarPingSpeed, in float fadeDistance, float t)
{
    vec2 diff = center-uv;
    float r = length(diff);
    float time = mod(t, timeResetSeconds) * radarPingSpeed;
   
    float circle;
    // r is the distance to the center.
    // circle = BipCenter---//---innerTail---time---frontierBorder
    //illustration
    circle += smoothstep(time - innerTail, time, r) * smoothstep(time + frontierBorder,time, r);
	  circle *= smoothstep(fadeDistance, 0.0, r); // fade to 0 after fadeDistance
        
    return vec3(circle);
}
void mainImage( out vec4 fragColor, in vec2 fragCoord )
{	
    //normalize coordinates 
    vec2 uv = vUv;
    // uv = fragCoord.xy / u_resolution.xy; //move coordinates to 0..1
    uv = uv.xy*2.; // translate to the center
    uv += vec2(-1.0, -1.0);
    // uv.x *= u_resolution.x/u_resolution.y; //correct the aspect ratio
    // uv.y *= 3.4; //correct the aspect ratio
    
	vec3 color;
    // generate some radar pings
    float fadeDistance = 1.6;
    float resetTimeSec = 6.0;
    float radarPingSpeed = 0.4;
    vec2 greenPing = vec2(0.0, 0.0);

    color += RadarPing(uv, greenPing, 0.08, 0.00025, resetTimeSec, radarPingSpeed, fadeDistance, u_time) * green;
    color += RadarPing(uv, greenPing, 0.08, 0.00025, resetTimeSec, radarPingSpeed, fadeDistance, u_time + 1.) * green;
    color += RadarPing(uv, greenPing, 0.08, 0.00025, resetTimeSec, radarPingSpeed, fadeDistance, u_time + 2.) * green;
    color += RadarPing(uv, greenPing, 0.08, 0.00025, resetTimeSec, radarPingSpeed, fadeDistance, u_time + 3.) * green;
    color += RadarPing(uv, greenPing, 0.08, 0.00025, resetTimeSec, radarPingSpeed, fadeDistance, u_time + 4.) * green;
    color += RadarPing(uv, greenPing, 0.08, 0.00025, resetTimeSec, radarPingSpeed, fadeDistance, u_time + 5.) * green;
    //return the new color
	fragColor = vec4(color,1.0);
}
void main() {
    mainImage(gl_FragColor,gl_FragCoord.xy);
//     vec2 st = gl_FragCoord.xy/u_resolution.xy;
//     st.x *= u_resolution.x/u_resolution.y;

//     vec3 color = vec3(0.);
//     color = vec3(st.x,st.y,abs(sin(u_time)));

//     gl_FragColor = vec4(color,1.0);
}