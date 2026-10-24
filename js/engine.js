/* EFFECT LAB — Local-only WebGL2 image processing engine. No external libraries. */
const VERT = `#version 300 es
precision highp float;
out vec2 v_uv;
void main(){
  vec2 p=vec2(float((gl_VertexID<<1)&2),float(gl_VertexID&2));
  v_uv=p;gl_Position=vec4(p*2.0-1.0,0.0,1.0);
}`;

const FRAG = `#version 300 es
precision highp float;
in vec2 v_uv;
out vec4 outColor;
uniform sampler2D u_input;
uniform sampler2D u_source;
uniform sampler2D u_second;
uniform vec2 u_res;
uniform int u_effect;
uniform int u_blend;
uniform float u_a;
uniform float u_b;
uniform float u_opacity;
uniform float u_seed;
uniform bool u_hasSecond;
const float PI=3.14159265358979323846264;
float hash(vec2 p){return fract(sin(dot(p,vec2(127.1,311.7)))*43758.5453123);}
float lum(vec3 c){return dot(c,vec3(0.2126,0.7152,0.0722));}
vec3 hsv2rgb(vec3 c){
  vec3 p=abs(fract(c.xxx+vec3(0.,2./3.,1./3.))*6.-3.);
  return c.z*mix(vec3(1.),clamp(p-1.,0.,1.),c.y);
}
vec3 rgb2hsv(vec3 c){
  vec4 K=vec4(0.,-1./3.,2./3.,-1.);
  vec4 p=mix(vec4(c.bg,K.wz),vec4(c.gb,K.xy),step(c.b,c.g));
  vec4 q=mix(vec4(p.xyw,c.r),vec4(c.r,p.yzx),step(p.x,c.r));
  float d=q.x-min(q.w,q.y); float e=1e-10;
  return vec3(abs(q.z+(q.w-q.y)/(6.*d+e)),d/(q.x+e),q.x);
}
vec2 bound(vec2 uv){return clamp(uv,vec2(.00001),vec2(.99999));}
vec4 pick(vec2 uv){return texture(u_input,bound(uv));}
vec4 origin(vec2 uv){return texture(u_source,bound(uv));}
vec4 other(vec2 uv){return u_hasSecond?texture(u_second,bound(uv)):origin(uv);}
vec3 blendColors(vec3 b,vec3 f,int m){
 if(m==1)return b*f;
 if(m==2)return 1.-(1.-b)*(1.-f);
 if(m==3)return mix(2.*b*f,1.-2.*(1.-b)*(1.-f),step(.5,b));
 if(m==4)return abs(b-f);
 if(m==5)return b+f-2.*b*f;
 if(m==6)return min(vec3(1.),b+f);
 if(m==7)return max(vec3(0.),b-f);
 if(m==8)return min(b,f);
 if(m==9)return max(b,f);
 if(m==10)return clamp(b/max(vec3(.001),1.-f),0.,1.);
 if(m==11)return clamp(1.-(1.-b)/max(vec3(.001),f),0.,1.);
 if(m==12)return mix(2.*b*f,1.-2.*(1.-b)*(1.-f),step(.5,f));
 if(m==13)return (1.-2.*f)*b*b+2.*f*b;
 if(m==14)return clamp(b/max(vec3(.001),f),0.,1.);
 return f;
}
vec4 effect(vec2 uv){
 vec4 src=pick(uv);
 vec3 c=src.rgb;
 vec2 px=1./u_res;
 vec2 p=uv*u_res;
 float l=lum(c);
 vec3 result=c;
 float sc=min(u_res.x,u_res.y)/850.;
 if(u_effect==0){ // threshold
  result=vec3(step(u_a,l));
 }else if(u_effect==1){ // posterize
  result=floor(c*(u_a-1.)+.5)/(u_a-1.);
 }else if(u_effect==2){ // halftone
  float size=max(2.,u_a*sc);vec2 cell=(floor(p/size)+.5)*size;
  vec3 local=pick(cell/u_res).rgb;float d=length((p-cell)/size);
  float dotSize=sqrt(1.-lum(local))*.68;
  result=vec3(1.-smoothstep(dotSize-.085,dotSize+.035,d));
 }else if(u_effect==3||u_effect==4){ // ordered bayer dithering
  float bayer[16]=float[16](0.,8.,2.,10.,12.,4.,14.,6.,3.,11.,1.,9.,15.,7.,13.,5.);
  ivec2 ip=ivec2(mod(floor(p/max(1.,u_b*sc)),4.));float bias=(bayer[ip.x+ip.y*4]/16.-.5)*u_a;
  if(u_effect==3){result=vec3(step(.5,l+bias));}
  else{result=floor(clamp(c+bias,0.,1.)*3.+.5)/3.;}
 }else if(u_effect==5){ // film grain
  float n=hash(floor(p)+vec2(u_seed,31.));
  result=clamp(c+(n-.5)*u_a,0.,1.);
 }else if(u_effect==6){ // gaussian blur 3x3
  vec2 q=px*u_a*sc;vec3 s=vec3(0.);
  s+=pick(uv+vec2(-q.x,-q.y)).rgb;s+=2.*pick(uv+vec2(0.,-q.y)).rgb;s+=pick(uv+vec2(q.x,-q.y)).rgb;
  s+=2.*pick(uv+vec2(-q.x,0.)).rgb;s+=4.*c;s+=2.*pick(uv+vec2(q.x,0.)).rgb;
  s+=pick(uv+vec2(-q.x,q.y)).rgb;s+=2.*pick(uv+vec2(0.,q.y)).rgb;s+=pick(uv+vec2(q.x,q.y)).rgb;
  result=s/16.;
 }else if(u_effect==7){ // motion blur
  float angle=u_b*PI/180.;vec2 d=vec2(cos(angle),sin(angle))*px*u_a*sc;
  vec3 sum=vec3(0.);for(int i=0;i<15;i++){sum+=pick(uv+d*(float(i)-7.)/7.).rgb;}result=sum/15.;
 }else if(u_effect==8){ // radial zoom blur
  vec3 sum=vec3(0.);for(int i=0;i<12;i++){
   float k=float(i)/11.*u_a;sum+=pick(mix(uv,vec2(.5),k)).rgb;
  }result=sum/12.;
 }else if(u_effect==9){ // sharpen
  vec2 q=px*u_a*sc;
  result=clamp(c*5.-pick(uv+vec2(q.x,0.)).rgb-pick(uv-vec2(q.x,0.)).rgb-pick(uv+vec2(0.,q.y)).rgb-pick(uv-vec2(0.,q.y)).rgb,0.,1.);
 }else if(u_effect==10){ // sobel edge detection
  vec2 q=px*u_a*sc;
  float a=lum(pick(uv+q*vec2(-1.,-1.)).rgb),b=lum(pick(uv+q*vec2(0.,-1.)).rgb),d=lum(pick(uv+q*vec2(1.,-1.)).rgb);
  float e=lum(pick(uv+q*vec2(-1.,0.)).rgb),f=lum(pick(uv+q*vec2(1.,0.)).rgb);
  float g=lum(pick(uv+q*vec2(-1.,1.)).rgb),h=lum(pick(uv+q*vec2(0.,1.)).rgb),i=lum(pick(uv+q*vec2(1.,1.)).rgb);
  float gx=-a-2.*e-g+d+2.*f+i,gy=-a-2.*b-d+g+2.*h+i;
  result=vec3(clamp(length(vec2(gx,gy))*u_b,0.,1.));
 }else if(u_effect==11){ // emboss
  vec2 q=px*u_a*sc;
  float e=lum(pick(uv-q).rgb)-lum(pick(uv+q).rgb);
  result=vec3(clamp(.5+e*u_b,0.,1.));
 }else if(u_effect==12){ // solarize
  result=mix(c,1.-c,step(u_a,c));
 }else if(u_effect==13){result=1.-c; // invert
 }else if(u_effect==14){ // rgb split
  vec2 q=vec2(u_a*sc,0.)*px;
  result=vec3(pick(uv+q).r,c.g,pick(uv-q).b);
 }else if(u_effect==15){ // offset channels
  vec2 q=vec2(cos(u_b*PI/180.),sin(u_b*PI/180.))*u_a*sc*px;
  result=vec3(pick(uv+q).r,pick(uv-q*.35).g,pick(uv-q).b);
 }else if(u_effect==16){ // wave
  vec2 q=uv; q.x+=sin(uv.y*u_b*PI*2.)*u_a*.0028;
  result=pick(q).rgb;
 }else if(u_effect==17){ // ripple
  vec2 d=uv-vec2(.5);float r=length(d);vec2 q=uv+normalize(d+vec2(.000001))*(sin(r*u_b*70.)*u_a*.0028);
  result=pick(q).rgb;
 }else if(u_effect==18){ // twirl
  vec2 d=uv-.5;d.x*=u_res.x/u_res.y;float r=length(d);float a=atan(d.y,d.x)+u_a*(1.-smoothstep(0.,u_b,r))*PI/180.;
  vec2 q=vec2(cos(a),sin(a))*r;q.x/=u_res.x/u_res.y;result=pick(q+.5).rgb;
 }else if(u_effect==19){ // bulge/pinch
  vec2 d=uv-.5;d.x*=u_res.x/u_res.y;float r=length(d);float radius=max(.01,u_b);float t=clamp(r/radius,0.,1.);
  float fac=1.+u_a*(1.-t)*(1.-t);vec2 q=d*fac;q.x/=u_res.x/u_res.y;result=pick(.5+q).rgb;
 }else if(u_effect==20){ // kaleidoscope
  vec2 d=uv-.5;d.x*=u_res.x/u_res.y;float r=length(d);float angle=atan(d.y,d.x);
  float section=2.*PI/u_a;angle=abs(mod(angle,section)-section*.5);
  vec2 q=vec2(cos(angle+u_b),sin(angle+u_b))*r;q.x/=u_res.x/u_res.y;result=pick(q+.5).rgb;
 }else if(u_effect==21){ // pixelate
  float size=max(2.,u_a*sc);result=pick((floor(p/size)+.5)*size/u_res).rgb;
 }else if(u_effect==22){ // mosaic
  float size=max(3.,u_a*sc);vec2 cell=floor(p/size);vec2 wobble=(vec2(hash(cell),hash(cell+41.))-.5)*u_b*size;
  result=pick(((cell+.5)*size+wobble)/u_res).rgb;
 }else if(u_effect==23){ // scanline
  float v=step(u_b,fract(p.y/max(1.,u_a*sc)));result=c*(1.-v*.85);
 }else if(u_effect==24){ // CRT
  vec2 d=uv-.5;vec2 q=.5+d*(1.+u_a*dot(d,d));
  vec3 sampled=vec3(pick(q+vec2(.0015,0.)).r,pick(q).g,pick(q-vec2(.0015,0.)).b);
  float scan=.83+.17*sin(p.y*PI/max(1.,u_b*sc));float vig=1.-.85*pow(length(d)*1.1,2.);
  result=sampled*scan*vig;
 }else if(u_effect==25){ // VHS
  float row=floor(p.y/max(1.,u_b*sc));float n=hash(vec2(row,u_seed));
  float disp=(n>.76?(n-.65)*u_a*sc:0.);vec2 q=uv+vec2(disp*px.x,0.);
  vec3 v=vec3(pick(q+vec2(.003,0.)).r,pick(q).g,pick(q-vec2(.003,0.)).b);
  result=clamp(v+(hash(p*vec2(.6,1.)+u_seed)-.5)*.06,0.,1.)*(.9+.1*sin(p.y*1.25));
 }else if(u_effect==26){ // block glitch
  vec2 block=floor(p/max(2.,u_b*sc));float n=hash(block+vec2(u_seed,17.));
  float shift=(n>.74?(n-.5)*u_a*sc:0.);vec2 q=uv+vec2(shift/u_res.x,0.);
  result=pick(q).rgb;if(n>.91)result=vec3(result.b,result.r,result.g);
 }else if(u_effect==27){ // brightness-driven directional pixel smear
  vec3 best=c;float maxL=lum(c);
  for(int i=1;i<=10;i++){
   vec3 t=pick(uv-vec2(float(i)*u_a*sc/10.*px.x,0.)).rgb;
   float ll=lum(t)+hash(floor(p.y/4.)+vec2(float(i),u_seed))*.08;
   if(ll>maxL){best=t;maxL=ll;}
  }result=mix(c,best,u_b);
 }else if(u_effect==28){ // noise displacement
  float f=max(1.,u_b);vec2 grid=uv*f;
  float nx=hash(floor(grid)),ny=hash(floor(grid)+31.);
  vec2 d=(vec2(nx,ny)-.5)*u_a*.004;result=pick(uv+d).rgb;
 }else if(u_effect==29){ // chromatic radial warp
  vec2 d=uv-.5;float k=dot(d,d)*u_a*.005;
  result=vec3(pick(uv+d*k).r,pick(uv).g,pick(uv-d*k).b);
 }else if(u_effect==30){ // xerox texture
  float n=hash(floor(p/max(1.,u_b*sc))+u_seed);float g=l+(n-.5)*.42;
  result=vec3(step(u_a,g));
 }else if(u_effect==31){ // ink outline
  vec2 q=px*u_a*sc;
  float dx=lum(pick(uv+vec2(q.x,0.)).rgb)-lum(pick(uv-vec2(q.x,0.)).rgb);
  float dy=lum(pick(uv+vec2(0.,q.y)).rgb)-lum(pick(uv-vec2(0.,q.y)).rgb);
  float edge=clamp(length(vec2(dx,dy))*u_b,0.,1.);
  result=vec3(1.-edge)*smoothstep(.05,.9,l);
 }else if(u_effect==32){ // glow
  vec2 q=px*u_a*sc;vec3 sum=vec3(0.);
  for(int i=0;i<12;i++){
    float a=float(i)/12.*PI*2.;sum+=pick(uv+vec2(cos(a),sin(a))*q).rgb;
  }sum/=12.;sum=max(sum-vec3(.43),vec3(0.))*1.75;
  result=clamp(c+sum*u_b,0.,1.);
 }else if(u_effect==33){ // fluid distortion
  vec2 q=uv;float t=u_b*PI;
  q.x+=sin(uv.y*t*2.+sin(uv.x*t))*.003*u_a;
  q.y+=cos(uv.x*t*1.7+cos(uv.y*t))*.003*u_a;
  result=pick(q).rgb;
 }else if(u_effect==34){ // dot matrix
  float s=max(2.,u_a*sc);vec2 grid=floor(p/s);vec2 center=(grid+.5)*s;
  float brightness=lum(pick(center/u_res).rgb);
  float dotSize=(1.-brightness)*.6;float dist=length((p-center)/s);
  result=vec3(step(dotSize,dist));
 }else if(u_effect==35){ // crosshatch
  float k=max(1.,u_a*sc);float d1=abs(sin((p.x+p.y)*PI/k));float d2=abs(sin((p.x-p.y)*PI/k));
  float ink=step(l,.67)*(1.-step(.18,d1)) + step(l,.4)*(1.-step(.18,d2));
  result=vec3(1.-clamp(ink,0.,1.));
 }else if(u_effect==36){ // cutout
  float levels=max(2.,u_a);float v=floor(l*levels)/levels;
  result=mix(vec3(v),floor(c*levels+.5)/levels,u_b);
 }else if(u_effect==37){ // synthetic chrome from image luminance
  float curve=sin(l*u_a*PI*2.)*.5+.5;float band=smoothstep(.4,.7,curve);
  result=mix(vec3(curve*.6),vec3(.81,.89,.99)*band,u_b);
 }else if(u_effect==38){ // mirror
  vec2 q=uv;if(u_a<.5)q.x=1.-abs(2.*q.x-1.);else if(u_a<1.5)q.y=1.-abs(2.*q.y-1.);
  else q=1.-abs(2.*q-1.);result=pick(q).rgb;
 }else if(u_effect==39){ // difference / image shift
  vec2 d=vec2(u_a,u_b)*px*sc;
  result=abs(c-other(uv+d).rgb);
 }else if(u_effect==40){ // exclusion shift
  vec2 d=vec2(u_a,u_b)*px*sc;vec3 f=other(uv+d).rgb;
  result=c+f-2.*c*f;
 }else if(u_effect==41){ // double exposure
  vec2 d=vec2(u_a,u_b)*px*sc;
  result=clamp(c*.7+other(uv+d).rgb*.7,0.,1.);
 }else if(u_effect==42){ // ghost trail
  vec2 d=vec2(u_a,u_b)*px*sc;
  result=(c+pick(uv+d).rgb*.72+pick(uv+2.*d).rgb*.44)/2.16;
 }else if(u_effect==43){ // stained glass / voronoi-like blocks
  vec2 grid=p/max(4.,u_a*sc);vec2 cell=floor(grid);
  float nearest=999.;vec2 best=cell;
  for(int x=-1;x<=1;x++)for(int y=-1;y<=1;y++){
    vec2 candidate=cell+vec2(float(x),float(y));vec2 site=candidate+(vec2(hash(candidate),hash(candidate+13.))-.5)*u_b;
    float dist=length(grid-site);if(dist<nearest){nearest=dist;best=site;}
  }result=pick(best*max(4.,u_a*sc)/u_res).rgb;
  if(nearest>.85)result*=.2;
 }else if(u_effect==44){ // print misregistration
  vec2 off=vec2(u_a*sc,0.)*px;
  vec3 left=pick(uv-off).rgb,right=pick(uv+off).rgb;
  result=vec3(c.r*.45+left.r*.6,c.g*.75,c.b*.55+right.b*.65);
 }else if(u_effect==45){ // neon contour
  vec2 q=px*u_a*sc;
  float v=length(vec2(lum(pick(uv+vec2(q.x,0.)).rgb)-lum(pick(uv-vec2(q.x,0.)).rgb),lum(pick(uv+vec2(0.,q.y)).rgb)-lum(pick(uv-vec2(0.,q.y)).rgb)));
  result=mix(vec3(0.),vec3(.25,.9,1.)*v*8.+vec3(.9,.12,.65)*v*3.,u_b);
 }else if(u_effect==46){ // blacklight
  result=pow(vec3(1.)-c,vec3(max(.1,u_a)))*vec3(.7,.45,1.);

}else if(u_effect==47){ // duotone
  vec3 dark=hsv2rgb(vec3(fract(u_a),.58,.16+.22*u_b));
  vec3 light=hsv2rgb(vec3(fract(u_a+.08+.22*u_b),.33+.35*u_b,.82+.14*u_b));
  result=mix(dark,light,pow(l,.92));
}else if(u_effect==48){ // gradient map
  vec3 c1=hsv2rgb(vec3(fract(u_a),.88,.18));
  vec3 c2=hsv2rgb(vec3(fract(u_a+.2+.45*u_b),.76,1.));
  float t=smoothstep(0.,1.,pow(l,mix(1.8,.55,u_b)));
  result=mix(c1,c2,t);
}else if(u_effect==49){ // hue shift
  vec3 hsv=rgb2hsv(c); hsv.x=fract(hsv.x+u_a); hsv.y=clamp(hsv.y*(.35+u_b*1.6),0.,1.); result=hsv2rgb(hsv);
}else if(u_effect==50){ // split tone
  vec3 sh=hsv2rgb(vec3(fract(u_a),.8,.75)); vec3 hi=hsv2rgb(vec3(fract(u_a+.5),.45,.98));
  float shadowAmt=smoothstep(.7,.05,l); float highAmt=smoothstep(.28,.95,l); vec3 base=vec3(l);
  result=mix(base,sh,shadowAmt*(.2+.6*u_b)); result=mix(result,hi,highAmt*(.18+.55*u_b));
}else if(u_effect==51){ // neon glow
  vec2 q=px*(4.+u_b*28.)*sc; vec3 sum=vec3(0.);
  for(int i=0;i<16;i++){float ang=float(i)/16.*PI*2.; sum+=pick(uv+vec2(cos(ang),sin(ang))*q).rgb;}
  sum/=16.; float g=max(lum(sum)-.3,0.)*(1.4+u_b*3.2); vec3 neon=hsv2rgb(vec3(fract(u_a),1.,1.));
  result=clamp(c*.55 + neon*g + sum*.15,0.,1.);
}else if(u_effect==52){ // paper fibers
  float scale=max(1.,u_b*24.); vec2 g=p/scale;
  float n=hash(floor(g)*1.7+u_seed)+hash(floor(g*2.3)+41.)*.55; float fibers=abs(sin(g.x*.55+g.y*1.2+n*6.2831));
  float speck=smoothstep(.82,.99,fibers)*u_a; result=clamp(c + (n-.5)*.18*u_a + vec3(speck)*.22,0.,1.);
}else if(u_effect==53){ // frosted glass
  float cell=max(2.,u_b*sc*18.); vec2 cellId=floor(p/cell);
  vec2 jitter=(vec2(hash(cellId+u_seed),hash(cellId+31.+u_seed))-.5)*u_a*.018*sc;
  vec3 s0=pick(uv+jitter).rgb; vec3 s1=pick(uv-jitter*.6).rgb; result=(s0+s1+c)*.3333;
}else if(u_effect==54){ // ink bleed
  vec2 q=px*(1.+u_a*8.)*sc; float m=l;
  m=min(m,lum(pick(uv+vec2(q.x,0.)).rgb)); m=min(m,lum(pick(uv-vec2(q.x,0.)).rgb));
  m=min(m,lum(pick(uv+vec2(0.,q.y)).rgb)); m=min(m,lum(pick(uv-vec2(0.,q.y)).rgb));
  float bleed=smoothstep(0.,.7,m); float edgeNoise=hash(floor(p/max(1.,u_b*sc*8.))+u_seed)*.16; result=mix(c,vec3(bleed-edgeNoise),.75);
}else if(u_effect==55){ // holographic sheen
  float band=sin((uv.x*.9+uv.y*.28)*(12.+u_b*30.) + l*8. + u_a*6.2831)*.5+.5;
  vec3 holo=hsv2rgb(vec3(fract(band*.7+u_a),.74,1.)); float mask=smoothstep(.12,1.,l)*(.18+.56*u_b);
  result=clamp(mix(c,holo,mask)+holo*band*.08*u_b,0.,1.);
}else if(u_effect==56){ // infrared false color
  float t=clamp(l*.95 + c.g*.35,0.,1.); vec3 cold=hsv2rgb(vec3(.62-.22*u_a,.95,.95)); vec3 mid=hsv2rgb(vec3(.94,.78,1.)); vec3 hot=hsv2rgb(vec3(.03+.12*u_b,.95,1.));
  result=(t<.5)?mix(cold,mid,t*2.):mix(mid,hot,(t-.5)*2.);
}else if(u_effect==57){ // prism split
  vec2 d=uv-.5; float rr=length(d); vec2 dir=normalize(d+vec2(.0001)); vec2 off=dir*(u_a*.006*(1.+rr*4.))*sc;
  vec3 r0=pick(uv+off).rgb, r1=pick(uv).rgb, r2=pick(uv-off).rgb; result=vec3(r0.r,r1.g,r2.b); result=mix(c,result,.35+.6*u_b);
}else if(u_effect==58){ // marble veins
  float freq=2.+u_b*10.; float t=sin((uv.x*freq+sin(uv.y*(freq*1.7))*.8+hash(floor(p/16.)+u_seed))*8.); float veins=1.-abs(t); veins=smoothstep(.72,.98,veins);
  vec3 stone=mix(c,vec3(.9,.9,.92),.26*u_a); result=mix(stone,vec3(.18,.18,.2),veins*u_a*.9);
}else if(u_effect==59){ // neon poster
  float levels=max(2.,floor(2.+u_a*8.)); vec3 post=floor(c*(levels-1.)+.5)/(levels-1.);
  vec2 q=px*(1.+u_b*6.)*sc; float e=length(vec2(lum(pick(uv+vec2(q.x,0.)).rgb)-lum(pick(uv-vec2(q.x,0.)).rgb),lum(pick(uv+vec2(0.,q.y)).rgb)-lum(pick(uv-vec2(0.,q.y)).rgb)));
  vec3 neon=hsv2rgb(vec3(fract(.58+u_b*.28),1.,1.)); result=clamp(post*.8 + neon*e*8.,0.,1.);
}else if(u_effect==60){ // chameleon shift
  float cell=max(3.,6.+u_b*34.); vec2 cellId=floor(p/cell); float n=hash(cellId+u_seed);
  vec3 hsv=rgb2hsv(c); hsv.x=fract(hsv.x + (n-.5)*u_a + sin(l*6.2831)*.08); hsv.y=clamp(hsv.y + .15 + abs(n-.5)*.55,0.,1.); hsv.z=clamp(hsv.z*(.82+.28*sin(n*6.2831)),0.,1.);
  result=hsv2rgb(hsv);
}else if(u_effect==61){ // luma melt
  float amt=u_a*.02*sc; float rowNoise=(hash(vec2(floor(p.x/max(1.,u_b*sc*7.)),u_seed))-.5);
  vec2 q=uv+vec2(rowNoise*amt*.4, -l*amt*(.5+u_b)); vec3 trail=pick(q).rgb; result=mix(c,trail,.65);
}else if(u_effect==62){ // haze wash
  vec2 q=px*(3.+u_a*22.)*sc; vec3 sum=vec3(0.);
  for(int i=0;i<8;i++){float ang=float(i)/8.*PI*2.; sum+=pick(uv+vec2(cos(ang),sin(ang))*q).rgb;} sum/=8.;
  vec3 tint=hsv2rgb(vec3(fract(.08+u_b*.18),.14,.98)); result=mix(c,sum,.35+.4*u_b); result=mix(result,tint,.08+.18*u_b);
}else if(u_effect==63){ // canvas weave
  float s=max(2.,4.+u_b*28.); vec2 g=p/s;
  float warp1=abs(sin(g.x*PI)); float warp2=abs(sin(g.y*PI));
  float weave=(warp1*warp2);
  float ridge=abs(sin((g.x+g.y)*PI*.5));
  vec3 tex=mix(vec3(.92),vec3(.72),weave*.65+ridge*.2);
  result=clamp(c*(1.-u_a*.22)+tex*u_a*.26 + vec3((weave-.5)*u_a*.18),0.,1.);
}else if(u_effect==64){ // paper grain
  float s=max(1.,3.+u_b*22.); vec2 g=floor(p/s);
  float n=hash(g+u_seed); float n2=hash(g*1.9+17.); float n3=hash(g*3.1+41.);
  float grain=(n*.55+n2*.3+n3*.15)-.5; float fleck=smoothstep(.88,1.,n3)*u_a;
  result=clamp(c + vec3(grain*.24*u_a + fleck*.18),0.,1.);
}else if(u_effect==65){ // crayon
  float levels=max(3.,floor(3.+u_b*10.)); vec3 base=floor(c*(levels-1.)+.5)/(levels-1.);
  float s=max(3.,5.+u_a*28.); vec2 g=p/s;
  float stroke=abs(sin(g.x*2.1+g.y*.35+hash(floor(g)+u_seed)*6.2831));
  float wax=smoothstep(.18,.82,stroke); vec3 tint=base*(.82+.24*wax);
  result=clamp(mix(base,tint,.65)+vec3((wax-.5)*u_a*.18),0.,1.);
}else if(u_effect==66){ // oil pastel
  float levels=max(3.,floor(3.+u_b*8.)); vec3 post=floor(c*(levels-1.)+.5)/(levels-1.);
  vec2 q=px*(2.+u_a*12.)*sc; vec3 smear=(pick(uv+q).rgb+pick(uv-q).rgb+pick(uv+vec2(q.x,-q.y)).rgb+pick(uv+vec2(-q.x,q.y)).rgb)*.25;
  float s=max(2.,4.+u_b*26.); vec2 g=p/s; float lump=hash(floor(g)+u_seed); lump=smoothstep(.25,1.,lump);
  result=clamp(mix(post,smear,.35+.35*u_a)*(0.92+0.18*lump)+vec3((lump-.5)*.1),0.,1.);
}else if(u_effect==67){ // chalk dust
  float gray=l; float s=max(2.,4.+u_b*20.); vec2 g=floor(p/s);
  float n=hash(g+u_seed); float dust=smoothstep(.65,1.,n); vec3 chalk=mix(vec3(gray),vec3(1.),.18+.22*u_a);
  result=clamp(chalk + vec3((dust-.5)*.35*u_a) - vec3(step(.92,dust)*.08*u_b),0.,1.);
}else if(u_effect==68){ // charcoal
  vec2 q=px*(1.+u_b*5.)*sc; float edge=length(vec2(lum(pick(uv+vec2(q.x,0.)).rgb)-lum(pick(uv-vec2(q.x,0.)).rgb), lum(pick(uv+vec2(0.,q.y)).rgb)-lum(pick(uv-vec2(0.,q.y)).rgb)));
  float s=max(2.,4.+u_a*22.); vec2 g=p/s; float rub=abs(sin(g.x*1.7+g.y*.9+hash(floor(g)+u_seed)*6.2831));
  float tone=clamp(l*.88 + rub*.14 - edge*(.8+u_b*3.),0.,1.); result=vec3(tone);
}else if(u_effect==69){ // dry brush
  vec2 q=px*(1.+u_a*8.)*sc; vec3 smear=pick(uv+vec2(q.x*1.7,0.)).rgb; float edge=abs(lum(smear)-l);
  float s=max(2.,4.+u_b*28.); vec2 g=p/s; float br=step(.56,abs(sin(g.x*PI*2.+hash(floor(g.yx)+u_seed)*6.2831)));
  result=clamp(mix(c,smear,.35*br)+vec3(edge*br*.8),0.,1.);
}else if(u_effect==70){ // impasto
  vec2 q=px*(1.+u_b*6.)*sc; float dx=lum(pick(uv+vec2(q.x,0.)).rgb)-lum(pick(uv-vec2(q.x,0.)).rgb); float dy=lum(pick(uv+vec2(0.,q.y)).rgb)-lum(pick(uv-vec2(0.,q.y)).rgb);
  vec3 normal=normalize(vec3(dx*u_a*8.,dy*u_a*8.,1.)); vec3 lightDir=normalize(vec3(-.5,.6,1.));
  float rel=max(dot(normal,lightDir),0.); vec2 g=p/max(2.,5.+u_b*20.); float brush=abs(sin(g.x*1.4+g.y*.8));
  result=clamp(c*(.72+.48*rel)+vec3((brush-.5)*.12*u_a),0.,1.);
}else if(u_effect==71){ // colored pencil
  float s=max(2.,4.+u_a*24.); vec2 g=p/s; float line1=abs(sin((g.x+g.y*.35)*PI*2.)); float line2=abs(sin((g.x*-.4+g.y)*PI*2.));
  float h=min(line1,line2); float shade=1.-smoothstep(.0,.75,h); vec3 base=mix(c,vec3(l),.08); result=clamp(base*(.78+.28*shade)+vec3(shade*.05),0.,1.);
}else if(u_effect==72){ // watercolor paper
  vec2 q=px*(1.+u_b*9.)*sc; vec3 bleed=(pick(uv+q).rgb+pick(uv-q).rgb+pick(uv+vec2(q.x,-q.y)).rgb+pick(uv+vec2(-q.x,q.y)).rgb)*.25;
  float s=max(2.,4.+u_a*20.); vec2 g=floor(p/s); float paper=(hash(g+u_seed)+hash(g*2.+7.)*.5)-.5;
  result=clamp(mix(c,bleed,.28+.35*u_b)+vec3(paper*.12*u_a)+vec3(.03*u_a),0.,1.);
}else if(u_effect==73){ // gouache flat
  float levels=max(3.,floor(3.+u_a*9.)); vec3 paintColor=floor(c*(levels-1.)+.5)/(levels-1.); vec2 g=floor(p/max(2.,4.+u_b*18.));
  float tooth=(hash(g+u_seed)-.5)*.12; result=clamp(mix(c,paintColor,.72)+vec3(tooth),0.,1.);
}else if(u_effect==74){ // engraving
  float density=5.+u_a*20.; vec2 d=uv-.5; float ang=atan(d.y,d.x); float rings=sin((l*density + ang*u_b*8.)*PI*4.); float lines=smoothstep(.1,.95,abs(rings));
  result=vec3(mix(l,lines,.8));
}else if(u_effect==75){ // sponge texture
  float s=max(2.,4.+u_b*28.); vec2 g=p/s; float n=hash(floor(g)+u_seed); float n2=hash(floor(g*1.7)+13.); float spot=smoothstep(.42,.92,n*n2*1.6);
  result=clamp(c*(.86+.18*spot)+vec3((spot-.5)*.22*u_a),0.,1.);
}else if(u_effect==76){ // stucco relief
  float s=max(2.,4.+u_b*24.); vec2 g=p/s; float n=hash(floor(g)+u_seed); float n2=hash(floor(g+vec2(1.,0.))+u_seed)-hash(floor(g-vec2(1.,0.))+u_seed); float n3=hash(floor(g+vec2(0.,1.))+u_seed)-hash(floor(g-vec2(0.,1.))+u_seed);
  vec3 normal=normalize(vec3(n2*8.*u_a,n3*8.*u_a,1.)); float lit=max(dot(normal,normalize(vec3(-.4,.5,1.))),0.); result=clamp(c*(.72+.4*lit)+vec3((n-.5)*.18*u_a),0.,1.);
}else if(u_effect==77){ // wax crayon
  float levels=max(3.,floor(3.+u_b*7.)); vec3 post=floor(c*(levels-1.)+.5)/(levels-1.); float s=max(2.,4.+u_a*24.); vec2 g=p/s; float streak=abs(sin(g.x*2.7+g.y*.25));
  float wax=smoothstep(.18,.9,streak); result=clamp(post*(.84+.24*wax)+vec3((wax-.5)*.16),0.,1.);
}else if(u_effect==78){ // scratchboard
  vec2 q=px*(1.+u_a*7.)*sc; float edge=length(vec2(lum(pick(uv+vec2(q.x,0.)).rgb)-lum(pick(uv-vec2(q.x,0.)).rgb),lum(pick(uv+vec2(0.,q.y)).rgb)-lum(pick(uv-vec2(0.,q.y)).rgb)));
  float s=max(2.,4.+u_b*24.); vec2 g=p/s; float scratches=step(.72,abs(sin(g.x*3.2+g.y*.18+hash(floor(g)+u_seed)*6.2831)));
  float ink=clamp(edge*6.*scratches + (1.-l)*.15,0.,1.); result=vec3(ink);
}else if(u_effect==79){ // woodcut
  float s=max(2.,4.+u_b*22.); vec2 g=p/s; float grain=abs(sin(g.x*PI*1.7 + sin(g.y*.5))); float cut=step(l,0.55 + (grain-.5)*u_a*.5);
  result=vec3(cut);
}else if(u_effect==80){ // newsprint
  float s=max(2.,4.+u_a*18.); vec2 grid=floor(p/s); vec2 center=(grid+.5)*s; float brightness=lum(pick(center/u_res).rgb);
  float dot=(1.-brightness)*(.58+.28*u_b); float dist=length((p-center)/s); float ink=1.-step(dot,dist);
  float dirty=(hash(grid+u_seed)-.5)*.18*u_b; result=clamp(vec3(1.-ink*.8+dirty)*vec3(.98,.96,.9),0.,1.);
 }
 return vec4(clamp(result,0.,1.),src.a);
}
void main(){
 vec4 base=pick(v_uv);
 if(u_effect<0){outColor=base;return;}
 vec4 fx=effect(v_uv);
 vec3 mixed=clamp(blendColors(base.rgb,fx.rgb,u_blend),0.,1.);
 float a=clamp(u_opacity,0.,1.);
 if(u_blend==15){ // dissolve, per-pixel opacity threshold
   a=step(hash(floor(gl_FragCoord.xy)+vec2(u_seed,7.)),a);mixed=fx.rgb;
 }
 outColor=vec4(mix(base.rgb,mixed,a),base.a);
}`;

class EffectEngine {
  constructor(canvas){
    this.canvas=canvas;
    const gl=canvas.getContext('webgl2',{alpha:true,premultipliedAlpha:false,preserveDrawingBuffer:true,antialias:false,powerPreference:'high-performance'});
    if(!gl)throw new Error('WebGL 2.0을 사용할 수 없습니다. 최신 Chrome, Edge, Safari를 이용해주세요.');
    this.gl=gl;
    const compile=(kind,src)=>{const sh=gl.createShader(kind);gl.shaderSource(sh,src);gl.compileShader(sh);if(!gl.getShaderParameter(sh,gl.COMPILE_STATUS))throw new Error('Shader compile error: '+gl.getShaderInfoLog(sh));return sh;};
    const vs=compile(gl.VERTEX_SHADER,VERT),fs=compile(gl.FRAGMENT_SHADER,FRAG);
    const program=gl.createProgram();gl.attachShader(program,vs);gl.attachShader(program,fs);gl.linkProgram(program);
    if(!gl.getProgramParameter(program,gl.LINK_STATUS))throw new Error('Shader link error: '+gl.getProgramInfoLog(program));
    gl.deleteShader(vs);gl.deleteShader(fs);
    this.program=program;
    this.loc={};['u_input','u_source','u_second','u_res','u_effect','u_blend','u_a','u_b','u_opacity','u_seed','u_hasSecond'].forEach(n=>{this.loc[n]=gl.getUniformLocation(program,n);});
    gl.useProgram(program);gl.uniform1i(this.loc.u_input,0);gl.uniform1i(this.loc.u_source,1);gl.uniform1i(this.loc.u_second,2);
    this.vao=gl.createVertexArray();gl.bindVertexArray(this.vao);
    this.sourceTex=this.makeTex();this.secondTex=this.makeTex();this.buffers=[this.makeTex(),this.makeTex()];
    this.fbos=[gl.createFramebuffer(),gl.createFramebuffer()];
    this.width=0;this.height=0;this.source=null;this.secondary=null;
    this.maxTexture=Math.min(gl.getParameter(gl.MAX_TEXTURE_SIZE),gl.getParameter(gl.MAX_RENDERBUFFER_SIZE));
  }
  makeTex(){const gl=this.gl;const t=gl.createTexture();gl.bindTexture(gl.TEXTURE_2D,t);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MIN_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_MAG_FILTER,gl.LINEAR);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_S,gl.CLAMP_TO_EDGE);gl.texParameteri(gl.TEXTURE_2D,gl.TEXTURE_WRAP_T,gl.CLAMP_TO_EDGE);return t;}
  uploadTexture(tex,source){const gl=this.gl;gl.bindTexture(gl.TEXTURE_2D,tex);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,true);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA,gl.RGBA,gl.UNSIGNED_BYTE,source);gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL,false);}
  setSource(image,maxDim=1400,secondary=null){this.source=image;this.secondary=secondary;this.setSize(maxDim);}
  setSecondary(secondary){this.secondary=secondary;if(this.source)this.setSize(Math.max(this.width,this.height));}
  setSize(maxDim){
    if(!this.source)return;
    const gl=this.gl;const w0=this.source.naturalWidth||this.source.width,h0=this.source.naturalHeight||this.source.height;
    const factor=Math.min(1,Math.min(maxDim,this.maxTexture)/Math.max(w0,h0));
    const w=Math.max(1,Math.round(w0*factor)),h=Math.max(1,Math.round(h0*factor));
    this.width=w;this.height=h;this.canvas.width=w;this.canvas.height=h;
    const imageCanvas=document.createElement('canvas');imageCanvas.width=w;imageCanvas.height=h;
    const ctx=imageCanvas.getContext('2d',{willReadFrequently:false});ctx.imageSmoothingQuality='high';ctx.drawImage(this.source,0,0,w,h);
    this.uploadTexture(this.sourceTex,imageCanvas);
    ctx.clearRect(0,0,w,h);if(this.secondary)ctx.drawImage(this.secondary,0,0,w,h);else ctx.drawImage(this.source,0,0,w,h);
    this.uploadTexture(this.secondTex,imageCanvas);
    for(let i=0;i<2;i++){
      gl.bindTexture(gl.TEXTURE_2D,this.buffers[i]);gl.texImage2D(gl.TEXTURE_2D,0,gl.RGBA8,w,h,0,gl.RGBA,gl.UNSIGNED_BYTE,null);
      gl.bindFramebuffer(gl.FRAMEBUFFER,this.fbos[i]);gl.framebufferTexture2D(gl.FRAMEBUFFER,gl.COLOR_ATTACHMENT0,gl.TEXTURE_2D,this.buffers[i],0);
      if(gl.checkFramebufferStatus(gl.FRAMEBUFFER)!==gl.FRAMEBUFFER_COMPLETE)throw new Error('GPU 프레임버퍼를 생성할 수 없습니다.');
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);gl.viewport(0,0,w,h);
  }
  render(layers=[],showOriginal=false){
    if(!this.source)return;
    const gl=this.gl;gl.useProgram(this.program);gl.bindVertexArray(this.vao);gl.viewport(0,0,this.width,this.height);
    gl.uniform2f(this.loc.u_res,this.width,this.height);
    gl.uniform1i(this.loc.u_hasSecond,this.secondary?1:0);
    let input=this.sourceTex,n=0;
    if(!showOriginal){
      for(const layer of layers){
        if(!layer.enabled)continue;
        const slot=n%2;
        gl.bindFramebuffer(gl.FRAMEBUFFER,this.fbos[slot]);
        this.pass(input,this.sourceTex,this.secondTex,layer.id,layer.blend,layer.a,layer.b,layer.opacity,layer.seed||1);
        input=this.buffers[slot];n++;
      }
    }
    gl.bindFramebuffer(gl.FRAMEBUFFER,null);
    this.pass(input,this.sourceTex,this.secondTex,-1,0,0,0,1,0);
  }
  pass(input,source,secondary,effect,blend,a,b,opacity,seed){
    const gl=this.gl;
    gl.activeTexture(gl.TEXTURE0);gl.bindTexture(gl.TEXTURE_2D,input);
    gl.activeTexture(gl.TEXTURE1);gl.bindTexture(gl.TEXTURE_2D,source);
    gl.activeTexture(gl.TEXTURE2);gl.bindTexture(gl.TEXTURE_2D,secondary);
    gl.uniform1i(this.loc.u_effect,effect);gl.uniform1i(this.loc.u_blend,blend);
    gl.uniform1f(this.loc.u_a,a);gl.uniform1f(this.loc.u_b,b);
    gl.uniform1f(this.loc.u_opacity,opacity/100);gl.uniform1f(this.loc.u_seed,seed);
    gl.drawArrays(gl.TRIANGLES,0,3);
  }
  destroy(){const gl=this.gl;[this.sourceTex,this.secondTex,...this.buffers].forEach(t=>gl.deleteTexture(t));this.fbos.forEach(f=>gl.deleteFramebuffer(f));gl.deleteProgram(this.program);gl.deleteVertexArray(this.vao);}
}

