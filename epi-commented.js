// EPIHYPERDERPFLARDIOIDS (c) 2022 by Piter Pasma

// version with a lot of comments and not a lot of longer variable/function names

({abs,sin:s,cos:c,PI:T}=Math); // get some math definitions
T*=2; // TAU = 2 * PI
$f={}; // for collecting the features because $fxhashFeatures is so long to write

// PRNG
S=Uint32Array.of(9,7,5,3); // PRNG state
R=(a=1)=>a*(a=S[3],S[3]=S[2],S[2]=S[1],a^=a<<11,S[0]^=a^a>>>8^(S[1]=S[0])>>>19,S[0]/2**32); // PRNG function
[...fxhash+'SOURCERY'].map(c=>R(S[3]^=c.charCodeAt()*23205)); // PRNG seeding

F=(f,N=23)=>[...Array(N)].map((_,i)=>f(i/N)); // loop function

NR=a=>a*(R()-R()+R()-R()); // approx "normal" distributed random between -2 and 2

// rotating vec2 function
// f = frequency, p = phase, a = amplitude, t = time
// when t goes from 0 to 1, the vector will turn f times, offset by phase p
E=(f,p,a,t)=>[a*s(t=f*t*T+p*T),a*c(t)];

// oscillating (scalar) function
// f = frequency, p = phase, v = mid value, d = deviation, t = time
// when t goes from 0 to 1, the value will oscillate f times between v-d and v+d
O=(f,p,v,d,t)=>v+d*s(t*f*T+p*T);

A=([a,b],[c,d])=>[a+c,b+d]; // vec2 addition
L=(x,y)=>(x*x+y*y)**.5; // vec2 length (adapted from: Elements, Euclid 300 BC)

// Reumann-Witkam line simplification function
LD=([a,b],[c,d],e=c-a,f=d-b,l=L(e,f),z=c*b-d*a)=>([x,y])=>abs(f*x-e*y+z)/l; // perpendicular distance between point [x,y] and ray [a,b]->[c,d]
simplify=([o,p,...s],t,r=[o],q=p,ra=LD(o,p))=>(s.map(p=>{if(ra(p)>t){r.push(q);ra=LD(q,p)}q=p}),[...r,q]);

// this generates the two frequencies (f and g) of the main rotators, and calculates the symmetry (y) of the resulting
// figure. also see: https://piterpasma.nl/articles/rotating 
x=[];
for(;x.length<1||f%2+g%2<1||f%3+g%3<1;f=2+R(6)|0,g=1+R(f-1)|0,h=f+g,x=[2,3,5,7].filter(d=>h%d<1));
$f.symmetry=y=x[R(x.length)|0];

// calculate a whole bunch of random 0..1 values mainly for phase parameters and some others
[p0,p1,p2,p3,p4,p5,p6,p7,p8,wa,a0,bs,bp,a]=F(_=>R());

// these are modulation amounts for the phase modulation of the rotators. they get less strong with higher
// frequencies, and also have a 50% probability of being 0.
[m0,m1,m2,m3]=F(_=>R()<.5?R(1.6)/(y+2):0);

// these are the frequencies of the phase modulation, and also the "bulge" modulation.
// they have to be integer multiples of the symmetry number y, for the shape to keep its symmetry. 
[h0,h1,h2,h3,h4]=F(_=>y*(1+R(3-(y/3|0))|0));

// function to pick from a weighted list of features
pk=(...w)=>(t=0,w.map(x=>x[0]=(t+=x[0])),t=R(t),w.filter(x=>t<x[0])[0].slice(1));

// select the background style, NC = number of circles, WC = circle width
[$f.bgstyle,NC,WC]=pk(
  [9,'psychic',15,.3],
  [9,'destiny',7,1.5],
  [9,'disc',1,1.5],
  [1,'obscure',40,2.5],
  [4,'half',2,1.5],
  [3,'solid',3,6],
  [1,'zap mission',20,1.5],
  [1,'full on',90,1.5]);
WC/=NC;OC=R(3/NC);

// select the palette
[$f.pal,pal]=pk(
  [5,'cosmic power','2230008cfaefeff'],
  [9,'code','777444222000f70'],
  [9,'hack','7774442220007f0'],
  [7,'latte art','b85754321feb000'],
  [9,'broccoli','000394333000fff'],
  [9,'danger','000fd0333fff000'],
  [7,'detergent','0000af333fff000'],
  [8,'tolerance','000a00333fff000'],
  [9,'space candy','609234f80102fd0'],
  [9,'cellular','893133cc4001ffe'],
  [2,'death','fff000000fff000'],
  [2,'life','000ffffff000fff'],
  [9,'space grape','32772e214000fff'],
  [9,'original orange','000f80fc0fff000']);
[bg,c0,c1,c2,ce]=pal.match(/.{3}/g); // split the palette string into five hex-triplets

// this is how we calculate all the points of the epihyperderpflardioid
// (again see: https://piterpasma.nl/articles/rotating for more info)
pp=F(t=>
  A( // the addition of
    A( // the addition of 
      E(f,O(h0,p0,p1,m0,t),O(y,p2,1-a*.4,m1,t),t), // rotator 1
      E(-g,O(h1,p3,p4,m2,t),O(y,p5,.3+a*.4,m3,t),t)), // rotator 2
    E((y+h)*160,0,(.3+bs)*O(h4,p8,.1,.05*wa,t)*O(h2,O(h3,p6,p7,a0,t),.5,.5,t)**(2+4*bp),t) // bulges
    ),5e4); // for 50000 points

// this function generates a "spray" of small circles along the pp array 
cc=(s,c)=>pp.map(([x,y])=>(dx=NR(.5),dy=NR(.5),r=2**(-8*L(dx,dy)),R()<.14?`<circle cx="${x+dx*s}" cy="${y+dy*s}" r="${r*.13*s}" fill="#${c}" />`:``)).join``;

// now we can construct the SVG image
(im=new Image).src=`data:image/svg+xml,`+encodeURIComponent(`
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="-2 -2 4 4" width="297mm" height="297mm">
    <rect x="-3" y="-3" width="6" height="6" fill="#${bg}"/>
    <g fill="none" stroke-linecap="round" stroke-linejoin="round">
      ${
        cc(1.5,c1)
       +F(t=>`<circle cx="0" cy="0" r="${3*t+OC}" stroke="#${c0}" stroke-width="${WC}" />`,NC).join``
       +cc(.75,c2)
      }
      <path d="M ${simplify(pp,1e-5).join` `} Z" stroke="#${ce}" stroke-width=".012"/>
    </g>
  </svg>`);
document.body.append(im); // add the image to the HTML page

// and put the features in the proper variable
$fxhashFeatures=$f