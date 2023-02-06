// Based in Weather. By David Hoskins, May 2014. @ https://www.shadertoy.com/view/4dsXWn

// Hash without Sine
// MIT License...
/* Copyright (c)2014 David Hoskins.

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.*/

vec3 sunLight  = normalize( vec3(  0.35, 0.14,  0.3 ) );
const vec3 sunColour = vec3(1.0, .7, .55);
float gTime, cloudy;
vec3 flash;

#define DAY_SPEED 0.05
#define CLOUD_LOWER 2200.0
#define CLOUD_UPPER 4200.0
// Mind to set this carefully
#define CLOUD_ITER 16
#define WEATHER_SPEED 0.26
#define RAIN_INTENSITY 1.32
#define RAIN_SMOOTH 0.12
#define RAIN_BRIGHT 0.38

uniform vec4 iResolution;
uniform vec2 iMouse;
uniform float iTime;


float Hash( float p ){
    p = fract(p * .1031);
    p *= p + 33.33;
    p *= p + p;
    return fract(p);
}

float Hash(vec3 p3){
	p3  = fract(p3 * .1031);
    p3 += dot(p3, p3.zyx + 31.32);
    return fract((p3.x + p3.y) * p3.z);
}


float Noise( in vec2 x ){
    vec2 p = floor(x);
    vec2 f = fract(x);
    f = f*f*(3.0-2.0*f);
    float n = p.x + p.y*57.0;
    float res = mix(mix( Hash(n+  0.0), Hash(n+  1.0),f.x),
                    mix( Hash(n+ 57.0), Hash(n+ 58.0),f.x),f.y);
    return res;
}

float Noise(in vec3 p){
    vec3 i = floor(p);
	vec3 f = fract(p); 
	f *= f * (3.0-2.0*f);

    return mix(
		mix(mix(Hash(i + vec3(0.,0.,0.)), Hash(i + vec3(1.,0.,0.)),f.x),
			mix(Hash(i + vec3(0.,1.,0.)), Hash(i + vec3(1.,1.,0.)),f.x),
			f.y),
		mix(mix(Hash(i + vec3(0.,0.,1.)), Hash(i + vec3(1.,0.,1.)),f.x),
			mix(Hash(i + vec3(0.,1.,1.)), Hash(i + vec3(1.,1.,1.)),f.x),
			f.y),
		f.z);
}

const mat3 m = mat3( 0.00,  0.80,  0.60,
                    -0.80,  0.36, -0.48,
                    -0.60, -0.48,  0.64 ) * 2.345;

float FBM( vec3 p ){
	p*= .0003;
    float f;
	
	f = 0.5000 * Noise(p); p = m*p; //p.y -= gTime*.2;
	f += 0.2500 * Noise(p); p = m*p; //p.y += gTime*.06;
	f += 0.1250 * Noise(p); p = m*p;
	f += 0.0625   * Noise(p); p = m*p;
	f += 0.03125  * Noise(p); p = m*p;
	f += 0.015625 * Noise(p);
    return f;
}

float FBMSH( vec3 p ){
	p*= .1;
        
    float f;
	
	f = 0.5000 * Noise(p); p = m*p; //p.y -= gTime*.2;
	f += 0.2500 * Noise(p); p = m*p; //p.y += gTime*.06;
	f += 0.1250 * Noise(p); p = m*p;
	f += 0.0625   * Noise(p); p = m*p;
	f += 0.03125  * Noise(p); p = m*p;
	f += 0.015625 * Noise(p);
    return f;
}


float MapSH(vec3 p){
	
	float h = -(FBM(p) - cloudy - 0.6);
    h *= smoothstep(CLOUD_UPPER + 100., CLOUD_UPPER, p.y);
	return h;
}

float Map(vec3 p){
	return -(FBM(p)-cloudy-.6);
}

float GetLighting(vec3 p, vec3 s){
    float l = MapSH( p )- MapSH( p + s * 200.);
    return clamp(-l * 2., 0.05, 1.0);
}


const vec3 skyTop = vec3(.0, .05, .4);
const vec3 skyHorizon = vec3(.3, .6, .8);

vec3 GetSky(in vec3 pos,in vec3 rd, out vec2 outPos, in float cloudy){
	
    float sunAmount = max( dot( rd, sunLight), 0.0 );
    float light = cos(iTime * DAY_SPEED);
    float sunset = exp(-light * light * 72.);
    light += 0.12;
    
    light = max(0.5 + atan(26. * light)/3.1415, 0.02);
    
    vec3 skytop = light * skyTop; 
    vec3 skyhorizon = mix(skyHorizon, vec3(1.0, 0.8 - sunset * 0.25, 0.1 * sunset), sunset);
    skyhorizon = light * pow(skyhorizon, vec3(0.2 * light));
	vec3 sunc = (sunColour - sunset * vec3(0.,.8,.9));
    
    // Sky
    vec3  sky = mix(skytop, skyhorizon, 1.0 - rd.y);
	
    // Sun
    sky = sky + sunc * min(pow(sunAmount, 1500.0) * 5.0, 1.0);
	sky = sky + sunc * min(pow(sunAmount, 10.0) * .6, 1.0);
	
	// Find the start and end of the cloud layer...
	float beg = ((CLOUD_LOWER - pos.y) / rd.y);
	float end = ((CLOUD_UPPER - pos.y) / rd.y);
	
	// Start position...
	vec3 p = vec3(pos.x + rd.x * beg, 0.0, pos.z + rd.z * beg);
	outPos = p.xz * vec2( 1e-3, 1e-4);
    beg +=  Hash(p) * 150.0;

	// Trace clouds through that layer...
	float d = 0.0;
	vec3 add = rd * ((end-beg) / 55.0);
	vec2 shade;
	vec2 shadeSum = vec2(0.0, 0.0);
	shade.x = 1.0;
	// def.val 55
	for (int i = 0; i < CLOUD_ITER || shadeSum.y >= 1.0 ; i++){

		float h = Map(p);
		shade.y = max(h, 0.0); 
        shade.x = GetLighting(p, sunLight);
		shadeSum += shade * (1.0 - shadeSum.y);
		p += add;
	}
	vec3 dcloud = clamp(1.4* (light + sunset) * sunColour, 0.3, 1.0);
	vec3 clouds = clamp(light, 0.2, 0.8) * mix(dcloud * pow(shadeSum.x, .3) + 0.2, sunColour, (1.0 - shadeSum.y) * .4);
    clouds += flash * (shadeSum.y + shadeSum.x + .2) * .2;
	sky = mix(sky, min(clouds, 1.0), shadeSum.y);
	
	return clamp(sky, 0.0, 1.0);
}

vec3 CameraPath( float t ){
    //return vec3(.0, 0.0, 8800.0 * cos(.145*t+.3));
    //return vec3(4000.0 * sin(.16*137.)+12290.0, 0., 4e5 * cos(.145*t+.3));
    return vec3(4000., 0., 9e5 * cos(.145*t+.3));
} 

void mainImage( out vec4 fragColor, in vec2 fragCoord ){
	
    float m = (iMouse.x/iResolution.x) * 30.0;
	
    gTime = iTime*.5 + 75.5;
    float t= 137. * 0.5 + 75.5;
	cloudy = cos(gTime * .15 + .4) * WEATHER_SPEED;
    float lightning = 0.0;
    
    if (cloudy >= .2){
        float f = mod(gTime + 1.5, 2.5);
        if (f < .8){
            f = smoothstep(.8, .0, f) * 1.5;
        	lightning = mod( -gTime * (1.5 - Hash(gTime* 0.3) * 0.002), 1.0) * f;
        }
    }
    
    flash = clamp(vec3(1., 1.0, 1.2) * lightning, 0.0, 1.0);
       
	
    vec2 xy = fragCoord.xy / iResolution.xy;
	vec2 uv = xy * vec2(iResolution.x/iResolution.y,1.0);
	
	vec3 cameraPos = CameraPath(2.0);
	vec3 camTar	   = CameraPath(.0);
    float cSpeed = iTime * 250. * clamp(cloudy, 0.7, 1.0);
	camTar.y = cameraPos.y = 1000.0;
    cameraPos.z += cSpeed;
    camTar.z += cSpeed;
	camTar.y += 370.0;
	
	vec3 cw = normalize(camTar-cameraPos);
	vec3 cp = vec3(0., 1., 0.);
	vec3 cu = cross(cw,cp);
	vec3 cv = cross(cu,cw);
	vec3 dir = normalize(uv.x * cu + uv.y * cv + 1.3 * cw);
	mat3 camMat = mat3(cu, cv, cw);

	vec3 col;
	vec2 pos;
	col = GetSky(cameraPos, dir, pos, cloudy);
    col *= 1. - cloudy;
	float l = exp( -length(pos) * 2e-4);
	col = mix(vec3(0.6 - cloudy * 1.2 ) + flash * 0.3, col, max(l, 0.2));
	
	
	
    // Rain
    vec2 st =  (uv - 1.57) * vec2( 0.5 + (xy.y + 0.1) * 0.31, .02) + vec2(gTime*.5+xy.y*.2, gTime*.2);
	float f = Noise( st * 200.5 ) * Noise( st * 120.5 ) * RAIN_INTENSITY;
	float rain = clamp(cloudy - .15, 0.0, 1.0);
	f = clamp(pow(abs(f), 15.0) * 5.0 * (rain * rain * 125.0), 0.0, (xy.y + .05) * RAIN_SMOOTH);
	col = mix(col, vec3( RAIN_BRIGHT ) + flash, f);
	col = clamp(col, 0.0,1.0);

	//col = pow(col, vec3(.85,.96, 1.0));
    col = pow(col, vec3(.7));
	
	fragColor=vec4(col, 1.0);
}
varying vec2 vUv;
//--------------------------------------------------------------------------
void main()	{
  mainImage(gl_FragColor, gl_FragCoord.xy);
  // gl_FragColor = vec4(1.0,.0,.0,1.);
  // gl_FragColor = vec4(vUv,1.,1.);
}