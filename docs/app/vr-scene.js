// Izuki in VR, the 3D room: built from vr-scene.src.js by tools/build-vr.cjs. Includes three.js (MIT, notice at the end).
var Yu=0,nh=1,Zu=2;var Sa=1,$u=2,Er=3,xs=0,Sn=1,Yn=2,Di=0,vs=1,en=2,ih=3,sh=4,Ju=5;var Os=100,Ku=101,ju=102,Qu=103,td=104,ed=200,nd=201,id=202,sd=203,rh=204,ah=205,rd=206,ad=207,od=208,ld=209,cd=210,hd=211,ud=212,dd=213,fd=214,Ao=0,Eo=1,Co=2,pr=3,Ro=4,Po=5,Io=6,Lo=7,pl=0,pd=1,md=2,Si=0,oh=1,lh=2,ch=3,hh=4,uh=5,dh=6,fh=7;var ph=300,ys=301,Bs=302,ml=303,gl=304,ba=306,Do=1e3,Ri=1001,No=1002,Mn=1003,gd=1004;var wa=1005;var Cn=1006,_l=1007;var Ms=1008;var Zn=1009,mh=1010,gh=1011,Cr=1012,xl=1013,bi=1014,wi=1015,Ti=1016,vl=1017,yl=1018,Rr=1020,_h=35902,xh=35899,vh=1021,yh=1022,di=1023,Pi=1026,Ss=1027,Mh=1028,Ml=1029,bs=1030,Sl=1031;var bl=1033,Ta=33776,Aa=33777,Ea=33778,Ca=33779,wl=35840,Tl=35841,Al=35842,El=35843,Cl=36196,Rl=37492,Pl=37496,Il=37488,Ll=37489,Ra=37490,Dl=37491,Nl=37808,Ul=37809,Fl=37810,Ol=37811,Bl=37812,zl=37813,kl=37814,Vl=37815,Gl=37816,Hl=37817,Wl=37818,Xl=37819,ql=37820,Yl=37821,Zl=36492,$l=36494,Jl=36495,Kl=36283,jl=36284,Pa=36285,Ql=36286;var jr=2300,Uo=2301,bo=2302,qc=2303,Yc=2400,Zc=2401,$c=2402;var _d=3200;var tc=0,xd=1,Zi="",mn="srgb",Qr="srgb-linear",ta="linear",De="srgb";var wo=7680;var vd=519,yd=512,Md=513,Sd=514,ec=515,bd=516,wd=517,nc=518,Td=519,Sh=35044;var bh="300 es",xi=2e3,mr=2001;function tp(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function ep(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function gr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Ad(){let i=gr("canvas");return i.style.display="block",i}var uu={},_r=null;function ea(...i){let t="THREE."+i.shift();_r?_r("log",t,...i):console.log(t,...i)}function Ed(i){let t=i[0];if(typeof t=="string"&&t.startsWith("TSL:")){let e=i[1];e&&e.isStackTrace?i[0]+=" "+e.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Qt(...i){i=Ed(i);let t="THREE."+i.shift();if(_r)_r("warn",t,...i);else{let e=i[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...i)}}function te(...i){i=Ed(i);let t="THREE."+i.shift();if(_r)_r("error",t,...i);else{let e=i[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...i)}}function Is(...i){let t=i.join(" ");t in uu||(uu[t]=!0,Qt(...i))}function Cd(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}var Rd={[Ao]:Eo,[Co]:Io,[Ro]:Lo,[pr]:Po,[Eo]:Ao,[Io]:Co,[Lo]:Ro,[Po]:pr},Ii=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){let n=this._listeners;return n===void 0?!1:n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){let n=this._listeners;if(n===void 0)return;let s=n[t];if(s!==void 0){let r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let n=e[t.type];if(n!==void 0){t.target=this;let s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,t);t.target=null}}},In=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var xc=Math.PI/180,Fo=180/Math.PI;function rs(){let i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(In[i&255]+In[i>>8&255]+In[i>>16&255]+In[i>>24&255]+"-"+In[t&255]+In[t>>8&255]+"-"+In[t>>16&15|64]+In[t>>24&255]+"-"+In[e&63|128]+In[e>>8&255]+"-"+In[e>>16&255]+In[e>>24&255]+In[n&255]+In[n>>8&255]+In[n>>16&255]+In[n>>24&255]).toLowerCase()}function be(i,t,e){return Math.max(t,Math.min(e,i))}function np(i,t){return(i%t+t)%t}function vc(i,t,e){return(1-e)*i+e*t}function Ci(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:case Uint8ClampedArray:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function Oe(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var Rh=class Rh{constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=be(this.x,t.x,e.x),this.y=be(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=be(this.x,t,e),this.y=be(this.y,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(be(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(be(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,a=this.y-t.y;return this.x=r*n-a*s+t.x,this.y=r*s+a*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};Rh.prototype.isVector2=!0;var Bt=Rh,ci=class{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,a,o){let l=n[s+0],c=n[s+1],d=n[s+2],m=n[s+3],u=r[a+0],f=r[a+1],M=r[a+2],T=r[a+3];if(m!==T||l!==u||c!==f||d!==M){let x=l*u+c*f+d*M+m*T;x<0&&(u=-u,f=-f,M=-M,T=-T,x=-x);let p=1-o;if(x<.9995){let C=Math.acos(x),D=Math.sin(C);p=Math.sin(p*C)/D,o=Math.sin(o*C)/D,l=l*p+u*o,c=c*p+f*o,d=d*p+M*o,m=m*p+T*o}else{l=l*p+u*o,c=c*p+f*o,d=d*p+M*o,m=m*p+T*o;let C=1/Math.sqrt(l*l+c*c+d*d+m*m);l*=C,c*=C,d*=C,m*=C}}t[e]=l,t[e+1]=c,t[e+2]=d,t[e+3]=m}static multiplyQuaternionsFlat(t,e,n,s,r,a){let o=n[s],l=n[s+1],c=n[s+2],d=n[s+3],m=r[a],u=r[a+1],f=r[a+2],M=r[a+3];return t[e]=o*M+d*m+l*f-c*u,t[e+1]=l*M+d*u+c*m-o*f,t[e+2]=c*M+d*f+o*u-l*m,t[e+3]=d*M-o*m-l*u-c*f,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let n=t._x,s=t._y,r=t._z,a=t._order,o=Math.cos,l=Math.sin,c=o(n/2),d=o(s/2),m=o(r/2),u=l(n/2),f=l(s/2),M=l(r/2);switch(a){case"XYZ":this._x=u*d*m+c*f*M,this._y=c*f*m-u*d*M,this._z=c*d*M+u*f*m,this._w=c*d*m-u*f*M;break;case"YXZ":this._x=u*d*m+c*f*M,this._y=c*f*m-u*d*M,this._z=c*d*M-u*f*m,this._w=c*d*m+u*f*M;break;case"ZXY":this._x=u*d*m-c*f*M,this._y=c*f*m+u*d*M,this._z=c*d*M+u*f*m,this._w=c*d*m-u*f*M;break;case"ZYX":this._x=u*d*m-c*f*M,this._y=c*f*m+u*d*M,this._z=c*d*M-u*f*m,this._w=c*d*m+u*f*M;break;case"YZX":this._x=u*d*m+c*f*M,this._y=c*f*m+u*d*M,this._z=c*d*M-u*f*m,this._w=c*d*m-u*f*M;break;case"XZY":this._x=u*d*m-c*f*M,this._y=c*f*m-u*d*M,this._z=c*d*M+u*f*m,this._w=c*d*m+u*f*M;break;default:Qt("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,n=e[0],s=e[4],r=e[8],a=e[1],o=e[5],l=e[9],c=e[2],d=e[6],m=e[10],u=n+o+m;if(u>0){let f=.5/Math.sqrt(u+1);this._w=.25/f,this._x=(d-l)*f,this._y=(r-c)*f,this._z=(a-s)*f}else if(n>o&&n>m){let f=2*Math.sqrt(1+n-o-m);this._w=(d-l)/f,this._x=.25*f,this._y=(s+a)/f,this._z=(r+c)/f}else if(o>m){let f=2*Math.sqrt(1+o-n-m);this._w=(r-c)/f,this._x=(s+a)/f,this._y=.25*f,this._z=(l+d)/f}else{let f=2*Math.sqrt(1+m-n-o);this._w=(a-s)/f,this._x=(r+c)/f,this._y=(l+d)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<1e-8?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(be(this.dot(t),-1,1)))}rotateTowards(t,e){let n=this.angleTo(t);if(n===0)return this;let s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let n=t._x,s=t._y,r=t._z,a=t._w,o=e._x,l=e._y,c=e._z,d=e._w;return this._x=n*d+a*o+s*c-r*l,this._y=s*d+a*l+r*o-n*c,this._z=r*d+a*c+n*l-s*o,this._w=a*d-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(t,e){let n=t._x,s=t._y,r=t._z,a=t._w,o=this.dot(t);o<0&&(n=-n,s=-s,r=-r,a=-a,o=-o);let l=1-e;if(o<.9995){let c=Math.acos(o),d=Math.sin(c);l=Math.sin(l*c)/d,e=Math.sin(e*c)/d,this._x=this._x*l+n*e,this._y=this._y*l+s*e,this._z=this._z*l+r*e,this._w=this._w*l+a*e,this._onChangeCallback()}else this._x=this._x*l+n*e,this._y=this._y*l+s*e,this._z=this._z*l+r*e,this._w=this._w*l+a*e,this.normalize();return this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},Ph=class Ph{constructor(t=0,e=0,n=0){this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(du.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(du.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=t.elements,a=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(t){let e=this.x,n=this.y,s=this.z,r=t.x,a=t.y,o=t.z,l=t.w,c=2*(a*s-o*n),d=2*(o*e-r*s),m=2*(r*n-a*e);return this.x=e+l*c+a*m-o*d,this.y=n+l*d+o*c-r*m,this.z=s+l*m+r*d-a*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=be(this.x,t.x,e.x),this.y=be(this.y,t.y,e.y),this.z=be(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=be(this.x,t,e),this.y=be(this.y,t,e),this.z=be(this.z,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(be(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let n=t.x,s=t.y,r=t.z,a=e.x,o=e.y,l=e.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return yc.copy(this).projectOnVector(t),this.sub(yc)}reflect(t){return this.sub(yc.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(be(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){let s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};Ph.prototype.isVector3=!0;var N=Ph,yc=new N,du=new ci,Ih=class Ih{constructor(t,e,n,s,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,l,c)}set(t,e,n,s,r,a,o,l,c){let d=this.elements;return d[0]=t,d[1]=s,d[2]=o,d[3]=e,d[4]=r,d[5]=l,d[6]=n,d[7]=a,d[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],d=n[4],m=n[7],u=n[2],f=n[5],M=n[8],T=s[0],x=s[3],p=s[6],C=s[1],D=s[4],A=s[7],P=s[2],R=s[5],U=s[8];return r[0]=a*T+o*C+l*P,r[3]=a*x+o*D+l*R,r[6]=a*p+o*A+l*U,r[1]=c*T+d*C+m*P,r[4]=c*x+d*D+m*R,r[7]=c*p+d*A+m*U,r[2]=u*T+f*C+M*P,r[5]=u*x+f*D+M*R,r[8]=u*p+f*A+M*U,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],d=t[8];return e*a*d-e*o*c-n*r*d+n*o*l+s*r*c-s*a*l}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],d=t[8],m=d*a-o*c,u=o*l-d*r,f=c*r-a*l,M=e*m+n*u+s*f;if(M===0)return this.set(0,0,0,0,0,0,0,0,0);let T=1/M;return t[0]=m*T,t[1]=(s*c-d*n)*T,t[2]=(o*n-s*a)*T,t[3]=u*T,t[4]=(d*e-s*l)*T,t[5]=(s*r-o*e)*T,t[6]=f*T,t[7]=(n*l-c*e)*T,t[8]=(a*e-n*r)*T,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,a,o){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+t,-s*c,s*l,-s*(-c*a+l*o)+o+e,0,0,1),this}scale(t,e){return Is("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Mc.makeScale(t,e)),this}rotate(t){return Is("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Mc.makeRotation(-t)),this}translate(t,e){return Is("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Mc.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}};Ih.prototype.isMatrix3=!0;var ae=Ih,Mc=new ae,fu=new ae().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),pu=new ae().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function ip(){let i={enabled:!0,workingColorSpace:Qr,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===De&&(s.r=Wi(s.r),s.g=Wi(s.g),s.b=Wi(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===De&&(s.r=fr(s.r),s.g=fr(s.g),s.b=fr(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Zi?ta:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Is("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Is("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[Qr]:{primaries:t,whitePoint:n,transfer:ta,toXYZ:fu,fromXYZ:pu,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:mn},outputColorSpaceConfig:{drawingBufferColorSpace:mn}},[mn]:{primaries:t,whitePoint:n,transfer:De,toXYZ:fu,fromXYZ:pu,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:mn}}}),i}var we=ip();function Wi(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function fr(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var $s,Oo=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let n;if(t instanceof HTMLCanvasElement)n=t;else{$s===void 0&&($s=gr("canvas")),$s.width=t.width,$s.height=t.height;let s=$s.getContext("2d");t instanceof ImageData?s.putImageData(t,0,0):s.drawImage(t,0,0,t.width,t.height),n=$s}return n.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=gr("canvas");e.width=t.width,e.height=t.height;let n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);let s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=Wi(r[a]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){let e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(Wi(e[n]/255)*255):e[n]=Wi(e[n]);return{data:e,width:t.width,height:t.height}}else return Qt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},sp=0,xr=class{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:sp++}),this.uuid=rs(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Sc(s[a].image)):r.push(Sc(s[a]))}else r=Sc(s);n.url=r}return e||(t.images[this.uuid]=n),n}};function Sc(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Oo.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Qt("Texture: Unable to serialize Texture."),{})}var rp=0,bc=new N,Nn=class i extends Ii{constructor(t=i.DEFAULT_IMAGE,e=i.DEFAULT_MAPPING,n=Ri,s=Ri,r=Cn,a=Ms,o=di,l=Zn,c=i.DEFAULT_ANISOTROPY,d=Zi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:rp++}),this.uuid=rs(),this.name="",this.source=new xr(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Bt(0,0),this.repeat=new Bt(1,1),this.center=new Bt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ae,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=d,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(bc).x}get height(){return this.source.getSize(bc).y}get depth(){return this.source.getSize(bc).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let n=t[e];if(n===void 0){Qt(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){Qt(`Texture.setValues(): property '${e}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==ph)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Do:t.x=t.x-Math.floor(t.x);break;case Ri:t.x=t.x<0?0:1;break;case No:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Do:t.y=t.y-Math.floor(t.y);break;case Ri:t.y=t.y<0?0:1;break;case No:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};Nn.DEFAULT_IMAGE=null;Nn.DEFAULT_MAPPING=ph;Nn.DEFAULT_ANISOTROPY=1;var Lh=class Lh{constructor(t=0,e=0,n=0,s=1){this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=this.w,a=t.elements;return this.x=a[0]*e+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*e+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*e+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*e+a[7]*n+a[11]*s+a[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r,l=t.elements,c=l[0],d=l[4],m=l[8],u=l[1],f=l[5],M=l[9],T=l[2],x=l[6],p=l[10];if(Math.abs(d-u)<.01&&Math.abs(m-T)<.01&&Math.abs(M-x)<.01){if(Math.abs(d+u)<.1&&Math.abs(m+T)<.1&&Math.abs(M+x)<.1&&Math.abs(c+f+p-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let D=(c+1)/2,A=(f+1)/2,P=(p+1)/2,R=(d+u)/4,U=(m+T)/4,y=(M+x)/4;return D>A&&D>P?D<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(D),s=R/n,r=U/n):A>P?A<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(A),n=R/s,r=y/s):P<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(P),n=U/r,s=y/r),this.set(n,s,r,e),this}let C=Math.sqrt((x-M)*(x-M)+(m-T)*(m-T)+(u-d)*(u-d));return Math.abs(C)<.001&&(C=1),this.x=(x-M)/C,this.y=(m-T)/C,this.z=(u-d)/C,this.w=Math.acos((c+f+p-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=be(this.x,t.x,e.x),this.y=be(this.y,t.y,e.y),this.z=be(this.z,t.z,e.z),this.w=be(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=be(this.x,t,e),this.y=be(this.y,t,e),this.z=be(this.z,t,e),this.w=be(this.w,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(be(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Lh.prototype.isVector4=!0;var Je=Lh,Bo=class extends Ii{constructor(t=1,e=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Cn,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=n.depth,this.scissor=new Je(0,0,t,e),this.scissorTest=!1,this.viewport=new Je(0,0,t,e),this.textures=[];let s={width:t,height:e,depth:n.depth},r=new Nn(s),a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(t={}){let e={minFilter:Cn,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,n=t.textures.length;e<n;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let s=Object.assign({},t.textures[e].image);this.textures[e].source=new xr(s)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){let e=t.depthTexture.clone();e.renderTarget=null,this.depthTexture=e}else this.depthTexture=t.depthTexture;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},qn=class extends Bo{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}},na=class extends Nn{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=Mn,this.minFilter=Mn,this.wrapR=Ri,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var zo=class extends Nn{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=Mn,this.minFilter=Mn,this.wrapR=Ri,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}};var fl=class fl{constructor(t,e,n,s,r,a,o,l,c,d,m,u,f,M,T,x){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,l,c,d,m,u,f,M,T,x)}set(t,e,n,s,r,a,o,l,c,d,m,u,f,M,T,x){let p=this.elements;return p[0]=t,p[4]=e,p[8]=n,p[12]=s,p[1]=r,p[5]=a,p[9]=o,p[13]=l,p[2]=c,p[6]=d,p[10]=m,p[14]=u,p[3]=f,p[7]=M,p[11]=T,p[15]=x,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new fl().fromArray(this.elements)}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){let e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),n.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let e=this.elements,n=t.elements,s=1/Js.setFromMatrixColumn(t,0).length(),r=1/Js.setFromMatrixColumn(t,1).length(),a=1/Js.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*a,e[9]=n[9]*a,e[10]=n[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,n=t.x,s=t.y,r=t.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),d=Math.cos(r),m=Math.sin(r);if(t.order==="XYZ"){let u=a*d,f=a*m,M=o*d,T=o*m;e[0]=l*d,e[4]=-l*m,e[8]=c,e[1]=f+M*c,e[5]=u-T*c,e[9]=-o*l,e[2]=T-u*c,e[6]=M+f*c,e[10]=a*l}else if(t.order==="YXZ"){let u=l*d,f=l*m,M=c*d,T=c*m;e[0]=u+T*o,e[4]=M*o-f,e[8]=a*c,e[1]=a*m,e[5]=a*d,e[9]=-o,e[2]=f*o-M,e[6]=T+u*o,e[10]=a*l}else if(t.order==="ZXY"){let u=l*d,f=l*m,M=c*d,T=c*m;e[0]=u-T*o,e[4]=-a*m,e[8]=M+f*o,e[1]=f+M*o,e[5]=a*d,e[9]=T-u*o,e[2]=-a*c,e[6]=o,e[10]=a*l}else if(t.order==="ZYX"){let u=a*d,f=a*m,M=o*d,T=o*m;e[0]=l*d,e[4]=M*c-f,e[8]=u*c+T,e[1]=l*m,e[5]=T*c+u,e[9]=f*c-M,e[2]=-c,e[6]=o*l,e[10]=a*l}else if(t.order==="YZX"){let u=a*l,f=a*c,M=o*l,T=o*c;e[0]=l*d,e[4]=T-u*m,e[8]=M*m+f,e[1]=m,e[5]=a*d,e[9]=-o*d,e[2]=-c*d,e[6]=f*m+M,e[10]=u-T*m}else if(t.order==="XZY"){let u=a*l,f=a*c,M=o*l,T=o*c;e[0]=l*d,e[4]=-m,e[8]=c*d,e[1]=u*m+T,e[5]=a*d,e[9]=f*m-M,e[2]=M*m-f,e[6]=o*d,e[10]=T*m+u}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(ap,t,op)}lookAt(t,e,n){let s=this.elements;return ti.subVectors(t,e),ti.lengthSq()===0&&(ti.z=1),ti.normalize(),ts.crossVectors(n,ti),ts.lengthSq()===0&&(Math.abs(n.z)===1?ti.x+=1e-4:ti.z+=1e-4,ti.normalize(),ts.crossVectors(n,ti)),ts.normalize(),Ja.crossVectors(ti,ts),s[0]=ts.x,s[4]=Ja.x,s[8]=ti.x,s[1]=ts.y,s[5]=Ja.y,s[9]=ti.y,s[2]=ts.z,s[6]=Ja.z,s[10]=ti.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],d=n[1],m=n[5],u=n[9],f=n[13],M=n[2],T=n[6],x=n[10],p=n[14],C=n[3],D=n[7],A=n[11],P=n[15],R=s[0],U=s[4],y=s[8],I=s[12],F=s[1],H=s[5],q=s[9],Q=s[13],k=s[2],et=s[6],lt=s[10],rt=s[14],J=s[3],st=s[7],mt=s[11],yt=s[15];return r[0]=a*R+o*F+l*k+c*J,r[4]=a*U+o*H+l*et+c*st,r[8]=a*y+o*q+l*lt+c*mt,r[12]=a*I+o*Q+l*rt+c*yt,r[1]=d*R+m*F+u*k+f*J,r[5]=d*U+m*H+u*et+f*st,r[9]=d*y+m*q+u*lt+f*mt,r[13]=d*I+m*Q+u*rt+f*yt,r[2]=M*R+T*F+x*k+p*J,r[6]=M*U+T*H+x*et+p*st,r[10]=M*y+T*q+x*lt+p*mt,r[14]=M*I+T*Q+x*rt+p*yt,r[3]=C*R+D*F+A*k+P*J,r[7]=C*U+D*H+A*et+P*st,r[11]=C*y+D*q+A*lt+P*mt,r[15]=C*I+D*Q+A*rt+P*yt,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],a=t[1],o=t[5],l=t[9],c=t[13],d=t[2],m=t[6],u=t[10],f=t[14],M=t[3],T=t[7],x=t[11],p=t[15],C=l*f-c*u,D=o*f-c*m,A=o*u-l*m,P=a*f-c*d,R=a*u-l*d,U=a*m-o*d;return e*(T*C-x*D+p*A)-n*(M*C-x*P+p*R)+s*(M*D-T*P+p*U)-r*(M*A-T*R+x*U)}determinantAffine(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[1],a=t[5],o=t[9],l=t[2],c=t[6],d=t[10];return e*(a*d-o*c)-n*(r*d-o*l)+s*(r*c-a*l)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){let s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],d=t[8],m=t[9],u=t[10],f=t[11],M=t[12],T=t[13],x=t[14],p=t[15],C=e*o-n*a,D=e*l-s*a,A=e*c-r*a,P=n*l-s*o,R=n*c-r*o,U=s*c-r*l,y=d*T-m*M,I=d*x-u*M,F=d*p-f*M,H=m*x-u*T,q=m*p-f*T,Q=u*p-f*x,k=C*Q-D*q+A*H+P*F-R*I+U*y;if(k===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let et=1/k;return t[0]=(o*Q-l*q+c*H)*et,t[1]=(s*q-n*Q-r*H)*et,t[2]=(T*U-x*R+p*P)*et,t[3]=(u*R-m*U-f*P)*et,t[4]=(l*F-a*Q-c*I)*et,t[5]=(e*Q-s*F+r*I)*et,t[6]=(x*A-M*U-p*D)*et,t[7]=(d*U-u*A+f*D)*et,t[8]=(a*q-o*F+c*y)*et,t[9]=(n*F-e*q-r*y)*et,t[10]=(M*R-T*A+p*C)*et,t[11]=(m*A-d*R-f*C)*et,t[12]=(o*I-a*H-l*y)*et,t[13]=(e*H-n*I+s*y)*et,t[14]=(T*D-M*P-x*C)*et,t[15]=(d*P-m*D+u*C)*et,this}scale(t){let e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let n=Math.cos(e),s=Math.sin(e),r=1-n,a=t.x,o=t.y,l=t.z,c=r*a,d=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,d*o+n,d*l-s*a,0,c*l-s*o,d*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,a){return this.set(1,n,r,0,t,1,a,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){let s=this.elements,r=e._x,a=e._y,o=e._z,l=e._w,c=r+r,d=a+a,m=o+o,u=r*c,f=r*d,M=r*m,T=a*d,x=a*m,p=o*m,C=l*c,D=l*d,A=l*m,P=n.x,R=n.y,U=n.z;return s[0]=(1-(T+p))*P,s[1]=(f+A)*P,s[2]=(M-D)*P,s[3]=0,s[4]=(f-A)*R,s[5]=(1-(u+p))*R,s[6]=(x+C)*R,s[7]=0,s[8]=(M+D)*U,s[9]=(x-C)*U,s[10]=(1-(u+T))*U,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){let s=this.elements;t.x=s[12],t.y=s[13],t.z=s[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),e.identity(),this;let a=Js.set(s[0],s[1],s[2]).length(),o=Js.set(s[4],s[5],s[6]).length(),l=Js.set(s[8],s[9],s[10]).length();r<0&&(a=-a),pi.copy(this);let c=1/a,d=1/o,m=1/l;return pi.elements[0]*=c,pi.elements[1]*=c,pi.elements[2]*=c,pi.elements[4]*=d,pi.elements[5]*=d,pi.elements[6]*=d,pi.elements[8]*=m,pi.elements[9]*=m,pi.elements[10]*=m,e.setFromRotationMatrix(pi),n.x=a,n.y=o,n.z=l,this}makePerspective(t,e,n,s,r,a,o=xi,l=!1){let c=this.elements,d=2*r/(e-t),m=2*r/(n-s),u=(e+t)/(e-t),f=(n+s)/(n-s),M,T;if(l)M=r/(a-r),T=a*r/(a-r);else if(o===xi)M=-(a+r)/(a-r),T=-2*a*r/(a-r);else if(o===mr)M=-a/(a-r),T=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=d,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=m,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=M,c[14]=T,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,n,s,r,a,o=xi,l=!1){let c=this.elements,d=2/(e-t),m=2/(n-s),u=-(e+t)/(e-t),f=-(n+s)/(n-s),M,T;if(l)M=1/(a-r),T=a/(a-r);else if(o===xi)M=-2/(a-r),T=-(a+r)/(a-r);else if(o===mr)M=-1/(a-r),T=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=d,c[4]=0,c[8]=0,c[12]=u,c[1]=0,c[5]=m,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=M,c[14]=T,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}};fl.prototype.isMatrix4=!0;var Be=fl,Js=new N,pi=new Be,ap=new N(0,0,0),op=new N(1,1,1),ts=new N,Ja=new N,ti=new N,mu=new Be,gu=new ci,Xi=class i{constructor(t=0,e=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){let s=t.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],d=s[9],m=s[2],u=s[6],f=s[10];switch(e){case"XYZ":this._y=Math.asin(be(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-d,f),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-be(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-m,r),this._z=0);break;case"ZXY":this._x=Math.asin(be(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-m,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-be(m,-1,1)),Math.abs(m)<.9999999?(this._x=Math.atan2(u,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(be(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-d,c),this._y=Math.atan2(-m,r)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-be(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-d,f),this._y=0);break;default:Qt("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return mu.makeRotationFromQuaternion(t),this.setFromRotationMatrix(mu,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return gu.setFromEuler(this),this.setFromQuaternion(gu,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Xi.DEFAULT_ORDER="XYZ";var vr=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},lp=0,_u=new N,Ks=new ci,Bi=new Be,Ka=new N,Gr=new N,cp=new N,hp=new ci,xu=new N(1,0,0),vu=new N(0,1,0),yu=new N(0,0,1),Mu={type:"added"},up={type:"removed"},js={type:"childadded",child:null},wc={type:"childremoved",child:null},gn=class i extends Ii{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:lp++}),this.uuid=rs(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let t=new N,e=new Xi,n=new ci,s=new N(1,1,1);function r(){n.setFromEuler(e,!1)}function a(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Be},normalMatrix:{value:new ae}}),this.matrix=new Be,this.matrixWorld=new Be,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new vr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Ks.setFromAxisAngle(t,e),this.quaternion.multiply(Ks),this}rotateOnWorldAxis(t,e){return Ks.setFromAxisAngle(t,e),this.quaternion.premultiply(Ks),this}rotateX(t){return this.rotateOnAxis(xu,t)}rotateY(t){return this.rotateOnAxis(vu,t)}rotateZ(t){return this.rotateOnAxis(yu,t)}translateOnAxis(t,e){return _u.copy(t).applyQuaternion(this.quaternion),this.position.add(_u.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(xu,t)}translateY(t){return this.translateOnAxis(vu,t)}translateZ(t){return this.translateOnAxis(yu,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Bi.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?Ka.copy(t):Ka.set(t,e,n);let s=this.parent;this.updateWorldMatrix(!0,!1),Gr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Bi.lookAt(Gr,Ka,this.up):Bi.lookAt(Ka,Gr,this.up),this.quaternion.setFromRotationMatrix(Bi),s&&(Bi.extractRotation(s.matrixWorld),Ks.setFromRotationMatrix(Bi),this.quaternion.premultiply(Ks.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(te("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Mu),js.child=t,this.dispatchEvent(js),js.child=null):te("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(up),wc.child=t,this.dispatchEvent(wc),wc.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Bi.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Bi.multiply(t.parent.matrixWorld)),t.applyMatrix4(Bi),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Mu),js.child=t,this.dispatchEvent(js),js.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){let a=this.children[n].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Gr,t,cp),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Gr,hp,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(t){t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let e=t.x,n=t.y,s=t.z,r=this.matrix.elements;r[12]+=e-r[0]*e-r[4]*n-r[8]*s,r[13]+=n-r[1]*e-r[5]*n-r[9]*s,r[14]+=s-r[2]*e-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e,n=!1){let s=this.parent;if(t===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),e===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,n)}}toJSON(t){let e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,d=l.length;c<d;c++){let m=l[c];r(t.shapes,m)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(t.materials,this.material[l]));s.material=o}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];s.animations.push(r(t.animations,l))}}if(e){let o=a(t.geometries),l=a(t.materials),c=a(t.textures),d=a(t.images),m=a(t.shapes),u=a(t.skeletons),f=a(t.animations),M=a(t.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),d.length>0&&(n.images=d),m.length>0&&(n.shapes=m),u.length>0&&(n.skeletons=u),f.length>0&&(n.animations=f),M.length>0&&(n.nodes=M)}return n.object=s,n;function a(o){let l=[];for(let c in o){let d=o[c];delete d.metadata,l.push(d)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){let s=t.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};gn.DEFAULT_UP=new N(0,1,0);gn.DEFAULT_MATRIX_AUTO_UPDATE=!0;gn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Ye=class extends gn{constructor(){super(),this.isGroup=!0,this.type="Group"}},dp={type:"move"},yr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ye,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ye,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new N,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new N),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ye,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new N,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new N,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){a=!0;for(let T of t.hand.values()){let x=e.getJointPose(T,n),p=this._getHandJoint(c,T);x!==null&&(p.matrix.fromArray(x.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=x.radius),p.visible=x!==null}let d=c.joints["index-finger-tip"],m=c.joints["thumb-tip"],u=d.position.distanceTo(m.position),f=.02,M=.005;c.inputState.pinching&&u>f+M?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&u<=f-M&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:t,target:this})));o!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(dp)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let n=new Ye;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}},Pd={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},es={h:0,s:0,l:0},ja={h:0,s:0,l:0};function Tc(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}var jt=class{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){let s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=mn){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,we.colorSpaceToWorking(this,e),this}setRGB(t,e,n,s=we.workingColorSpace){return this.r=t,this.g=e,this.b=n,we.colorSpaceToWorking(this,s),this}setHSL(t,e,n,s=we.workingColorSpace){if(t=np(t,1),e=be(e,0,1),n=be(n,0,1),e===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+e):n+e-n*e,a=2*n-r;this.r=Tc(a,r,t+1/3),this.g=Tc(a,r,t),this.b=Tc(a,r,t-1/3)}return we.colorSpaceToWorking(this,s),this}setStyle(t,e=mn){function n(r){r!==void 0&&parseFloat(r)<1&&Qt("Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:Qt("Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(r,16),e);Qt("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=mn){let n=Pd[t.toLowerCase()];return n!==void 0?this.setHex(n,e):Qt("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Wi(t.r),this.g=Wi(t.g),this.b=Wi(t.b),this}copyLinearToSRGB(t){return this.r=fr(t.r),this.g=fr(t.g),this.b=fr(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=mn){return we.workingToColorSpace(Ln.copy(this),t),Math.round(be(Ln.r*255,0,255))*65536+Math.round(be(Ln.g*255,0,255))*256+Math.round(be(Ln.b*255,0,255))}getHexString(t=mn){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=we.workingColorSpace){we.workingToColorSpace(Ln.copy(this),e);let n=Ln.r,s=Ln.g,r=Ln.b,a=Math.max(n,s,r),o=Math.min(n,s,r),l,c,d=(o+a)/2;if(o===a)l=0,c=0;else{let m=a-o;switch(c=d<=.5?m/(a+o):m/(2-a-o),a){case n:l=(s-r)/m+(s<r?6:0);break;case s:l=(r-n)/m+2;break;case r:l=(n-s)/m+4;break}l/=6}return t.h=l,t.s=c,t.l=d,t}getRGB(t,e=we.workingColorSpace){return we.workingToColorSpace(Ln.copy(this),e),t.r=Ln.r,t.g=Ln.g,t.b=Ln.b,t}getStyle(t=mn){we.workingToColorSpace(Ln.copy(this),t);let e=Ln.r,n=Ln.g,s=Ln.b;return t!==mn?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(es),this.setHSL(es.h+t,es.s+e,es.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(es),t.getHSL(ja);let n=vc(es.h,ja.h,e),s=vc(es.s,ja.s,e),r=vc(es.l,ja.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Ln=new jt;jt.NAMES=Pd;var ia=class extends gn{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Xi,this.environmentIntensity=1,this.environmentRotation=new Xi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),e.object.backgroundBlurriness=this.backgroundBlurriness,e.object.backgroundIntensity=this.backgroundIntensity,e.object.backgroundRotation=this.backgroundRotation.toArray(),e.object.environmentIntensity=this.environmentIntensity,e.object.environmentRotation=this.environmentRotation.toArray(),e}},mi=new N,zi=new N,Ac=new N,ki=new N,Qs=new N,tr=new N,Su=new N,Ec=new N,Cc=new N,Rc=new N,Pc=new Je,Ic=new Je,Lc=new Je,Hi=class i{constructor(t=new N,e=new N,n=new N){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),mi.subVectors(t,e),s.cross(mi);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){mi.subVectors(s,e),zi.subVectors(n,e),Ac.subVectors(t,e);let a=mi.dot(mi),o=mi.dot(zi),l=mi.dot(Ac),c=zi.dot(zi),d=zi.dot(Ac),m=a*c-o*o;if(m===0)return r.set(0,0,0),null;let u=1/m,f=(c*l-o*d)*u,M=(a*d-o*l)*u;return r.set(1-f-M,M,f)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,ki)===null?!1:ki.x>=0&&ki.y>=0&&ki.x+ki.y<=1}static getInterpolation(t,e,n,s,r,a,o,l){return this.getBarycoord(t,e,n,s,ki)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,ki.x),l.addScaledVector(a,ki.y),l.addScaledVector(o,ki.z),l)}static getInterpolatedAttribute(t,e,n,s,r,a){return Pc.setScalar(0),Ic.setScalar(0),Lc.setScalar(0),Pc.fromBufferAttribute(t,e),Ic.fromBufferAttribute(t,n),Lc.fromBufferAttribute(t,s),a.setScalar(0),a.addScaledVector(Pc,r.x),a.addScaledVector(Ic,r.y),a.addScaledVector(Lc,r.z),a}static isFrontFacing(t,e,n,s){return mi.subVectors(n,e),zi.subVectors(t,e),mi.cross(zi).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return mi.subVectors(this.c,this.b),zi.subVectors(this.a,this.b),mi.cross(zi).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return i.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return i.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return i.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return i.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return i.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let n=this.a,s=this.b,r=this.c,a,o;Qs.subVectors(s,n),tr.subVectors(r,n),Ec.subVectors(t,n);let l=Qs.dot(Ec),c=tr.dot(Ec);if(l<=0&&c<=0)return e.copy(n);Cc.subVectors(t,s);let d=Qs.dot(Cc),m=tr.dot(Cc);if(d>=0&&m<=d)return e.copy(s);let u=l*m-d*c;if(u<=0&&l>=0&&d<=0)return a=l/(l-d),e.copy(n).addScaledVector(Qs,a);Rc.subVectors(t,r);let f=Qs.dot(Rc),M=tr.dot(Rc);if(M>=0&&f<=M)return e.copy(r);let T=f*c-l*M;if(T<=0&&c>=0&&M<=0)return o=c/(c-M),e.copy(n).addScaledVector(tr,o);let x=d*M-f*m;if(x<=0&&m-d>=0&&f-M>=0)return Su.subVectors(r,s),o=(m-d)/(m-d+(f-M)),e.copy(s).addScaledVector(Su,o);let p=1/(x+T+u);return a=T*p,o=u*p,e.copy(n).addScaledVector(Qs,a).addScaledVector(tr,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},as=class{constructor(t=new N(1/0,1/0,1/0),e=new N(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(gi.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(gi.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let n=gi.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let n=t.geometry;if(n!==void 0){let r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)t.isMesh===!0?t.getVertexPosition(a,gi):gi.fromBufferAttribute(r,a),gi.applyMatrix4(t.matrixWorld),this.expandByPoint(gi);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Qa.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Qa.copy(n.boundingBox)),Qa.applyMatrix4(t.matrixWorld),this.union(Qa)}let s=t.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,gi),gi.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Hr),to.subVectors(this.max,Hr),er.subVectors(t.a,Hr),nr.subVectors(t.b,Hr),ir.subVectors(t.c,Hr),ns.subVectors(nr,er),is.subVectors(ir,nr),Es.subVectors(er,ir);let e=[0,-ns.z,ns.y,0,-is.z,is.y,0,-Es.z,Es.y,ns.z,0,-ns.x,is.z,0,-is.x,Es.z,0,-Es.x,-ns.y,ns.x,0,-is.y,is.x,0,-Es.y,Es.x,0];return!Dc(e,er,nr,ir,to)||(e=[1,0,0,0,1,0,0,0,1],!Dc(e,er,nr,ir,to))?!1:(eo.crossVectors(ns,is),e=[eo.x,eo.y,eo.z],Dc(e,er,nr,ir,to))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,gi).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(gi).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Vi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Vi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Vi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Vi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Vi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Vi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Vi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Vi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Vi),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},Vi=[new N,new N,new N,new N,new N,new N,new N,new N],gi=new N,Qa=new as,er=new N,nr=new N,ir=new N,ns=new N,is=new N,Es=new N,Hr=new N,to=new N,eo=new N,Cs=new N;function Dc(i,t,e,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){Cs.fromArray(i,r);let o=s.x*Math.abs(Cs.x)+s.y*Math.abs(Cs.y)+s.z*Math.abs(Cs.z),l=t.dot(Cs),c=e.dot(Cs),d=n.dot(Cs);if(Math.max(-Math.max(l,c,d),Math.min(l,c,d))>o)return!1}return!0}var un=new N,no=new Bt,fp=0,ni=class extends Ii{constructor(t,e,n=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:fp++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=Sh,this.updateRanges=[],this.gpuType=wi,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)no.fromBufferAttribute(this,e),no.applyMatrix3(t),this.setXY(e,no.x,no.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)un.fromBufferAttribute(this,e),un.applyMatrix3(t),this.setXYZ(e,un.x,un.y,un.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)un.fromBufferAttribute(this,e),un.applyMatrix4(t),this.setXYZ(e,un.x,un.y,un.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)un.fromBufferAttribute(this,e),un.applyNormalMatrix(t),this.setXYZ(e,un.x,un.y,un.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)un.fromBufferAttribute(this,e),un.transformDirection(t),this.setXYZ(e,un.x,un.y,un.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=Ci(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=Oe(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=Ci(e,this.array)),e}setX(t,e){return this.normalized&&(e=Oe(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=Ci(e,this.array)),e}setY(t,e){return this.normalized&&(e=Oe(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=Ci(e,this.array)),e}setZ(t,e){return this.normalized&&(e=Oe(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=Ci(e,this.array)),e}setW(t,e){return this.normalized&&(e=Oe(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=Oe(e,this.array),n=Oe(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=Oe(e,this.array),n=Oe(n,this.array),s=Oe(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=Oe(e,this.array),n=Oe(n,this.array),s=Oe(s,this.array),r=Oe(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}};var sa=class extends ni{constructor(t,e,n){super(new Uint16Array(t),e,n)}};var ra=class extends ni{constructor(t,e,n){super(new Uint32Array(t),e,n)}};var ne=class extends ni{constructor(t,e,n){super(new Float32Array(t),e,n)}},pp=new as,Wr=new N,Nc=new N,os=class{constructor(t=new N,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let n=this.center;e!==void 0?n.copy(e):pp.setFromPoints(t).getCenter(n);let s=0;for(let r=0,a=t.length;r<a;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Wr.subVectors(t,this.center);let e=Wr.lengthSq();if(e>this.radius*this.radius){let n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(Wr,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Nc.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Wr.copy(t.center).add(Nc)),this.expandByPoint(Wr.copy(t.center).sub(Nc))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},mp=0,li=new Be,Uc=new gn,sr=new N,ei=new as,Xr=new as,yn=new N,Le=class i extends Ii{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:mp++}),this.uuid=rs(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(tp(t)?ra:sa)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new ae().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return li.makeRotationFromQuaternion(t),this.applyMatrix4(li),this}rotateX(t){return li.makeRotationX(t),this.applyMatrix4(li),this}rotateY(t){return li.makeRotationY(t),this.applyMatrix4(li),this}rotateZ(t){return li.makeRotationZ(t),this.applyMatrix4(li),this}translate(t,e,n){return li.makeTranslation(t,e,n),this.applyMatrix4(li),this}scale(t,e,n){return li.makeScale(t,e,n),this.applyMatrix4(li),this}lookAt(t){return Uc.lookAt(t),Uc.updateMatrix(),this.applyMatrix4(Uc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(sr).negate(),this.translate(sr.x,sr.y,sr.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let n=[];for(let s=0,r=t.length;s<r;s++){let a=t[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new ne(n,3))}else{let n=Math.min(t.length,e.count);for(let s=0;s<n;s++){let r=t[s];e.setXYZ(s,r.x,r.y,r.z||0)}t.length>e.count&&Qt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new as);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){te("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new N(-1/0,-1/0,-1/0),new N(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){let r=e[n];ei.setFromBufferAttribute(r),this.morphTargetsRelative?(yn.addVectors(this.boundingBox.min,ei.min),this.boundingBox.expandByPoint(yn),yn.addVectors(this.boundingBox.max,ei.max),this.boundingBox.expandByPoint(yn)):(this.boundingBox.expandByPoint(ei.min),this.boundingBox.expandByPoint(ei.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&te('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new os);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){te("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new N,1/0);return}if(t){let n=this.boundingSphere.center;if(ei.setFromBufferAttribute(t),e)for(let r=0,a=e.length;r<a;r++){let o=e[r];Xr.setFromBufferAttribute(o),this.morphTargetsRelative?(yn.addVectors(ei.min,Xr.min),ei.expandByPoint(yn),yn.addVectors(ei.max,Xr.max),ei.expandByPoint(yn)):(ei.expandByPoint(Xr.min),ei.expandByPoint(Xr.max))}ei.getCenter(n);let s=0;for(let r=0,a=t.count;r<a;r++)yn.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(yn));if(e)for(let r=0,a=e.length;r<a;r++){let o=e[r],l=this.morphTargetsRelative;for(let c=0,d=o.count;c<d;c++)yn.fromBufferAttribute(o,c),l&&(sr.fromBufferAttribute(t,c),yn.add(sr)),s=Math.max(s,n.distanceToSquared(yn))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&te('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){te("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=e.position,s=e.normal,r=e.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new ni(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));let o=[],l=[];for(let y=0;y<n.count;y++)o[y]=new N,l[y]=new N;let c=new N,d=new N,m=new N,u=new Bt,f=new Bt,M=new Bt,T=new N,x=new N;function p(y,I,F){c.fromBufferAttribute(n,y),d.fromBufferAttribute(n,I),m.fromBufferAttribute(n,F),u.fromBufferAttribute(r,y),f.fromBufferAttribute(r,I),M.fromBufferAttribute(r,F),d.sub(c),m.sub(c),f.sub(u),M.sub(u);let H=1/(f.x*M.y-M.x*f.y);isFinite(H)&&(T.copy(d).multiplyScalar(M.y).addScaledVector(m,-f.y).multiplyScalar(H),x.copy(m).multiplyScalar(f.x).addScaledVector(d,-M.x).multiplyScalar(H),o[y].add(T),o[I].add(T),o[F].add(T),l[y].add(x),l[I].add(x),l[F].add(x))}let C=this.groups;C.length===0&&(C=[{start:0,count:t.count}]);for(let y=0,I=C.length;y<I;++y){let F=C[y],H=F.start,q=F.count;for(let Q=H,k=H+q;Q<k;Q+=3)p(t.getX(Q+0),t.getX(Q+1),t.getX(Q+2))}let D=new N,A=new N,P=new N,R=new N;function U(y){P.fromBufferAttribute(s,y),R.copy(P);let I=o[y];D.copy(I),D.sub(P.multiplyScalar(P.dot(I))).normalize(),A.crossVectors(R,I);let H=A.dot(l[y])<0?-1:1;a.setXYZW(y,D.x,D.y,D.z,H)}for(let y=0,I=C.length;y<I;++y){let F=C[y],H=F.start,q=F.count;for(let Q=H,k=H+q;Q<k;Q+=3)U(t.getX(Q+0)),U(t.getX(Q+1)),U(t.getX(Q+2))}this._transformed=!0}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==e.count)n=new ni(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let u=0,f=n.count;u<f;u++)n.setXYZ(u,0,0,0);let s=new N,r=new N,a=new N,o=new N,l=new N,c=new N,d=new N,m=new N;if(t)for(let u=0,f=t.count;u<f;u+=3){let M=t.getX(u+0),T=t.getX(u+1),x=t.getX(u+2);s.fromBufferAttribute(e,M),r.fromBufferAttribute(e,T),a.fromBufferAttribute(e,x),d.subVectors(a,r),m.subVectors(s,r),d.cross(m),o.fromBufferAttribute(n,M),l.fromBufferAttribute(n,T),c.fromBufferAttribute(n,x),o.add(d),l.add(d),c.add(d),n.setXYZ(M,o.x,o.y,o.z),n.setXYZ(T,l.x,l.y,l.z),n.setXYZ(x,c.x,c.y,c.z)}else for(let u=0,f=e.count;u<f;u+=3)s.fromBufferAttribute(e,u+0),r.fromBufferAttribute(e,u+1),a.fromBufferAttribute(e,u+2),d.subVectors(a,r),m.subVectors(s,r),d.cross(m),n.setXYZ(u+0,d.x,d.y,d.z),n.setXYZ(u+1,d.x,d.y,d.z),n.setXYZ(u+2,d.x,d.y,d.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)yn.fromBufferAttribute(t,e),yn.normalize(),t.setXYZ(e,yn.x,yn.y,yn.z)}toNonIndexed(){function t(o,l){let c=o.array,d=o.itemSize,m=o.normalized,u=new c.constructor(l.length*d),f=0,M=0;for(let T=0,x=l.length;T<x;T++){o.isInterleavedBufferAttribute?f=l[T]*o.data.stride+o.offset:f=l[T]*d;for(let p=0;p<d;p++)u[M++]=c[f++]}return new ni(u,d,m)}if(this.index===null)return Qt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new i,n=this.index.array,s=this.attributes;for(let o in s){let l=s[o],c=t(l,n);e.setAttribute(o,c)}let r=this.morphAttributes;for(let o in r){let l=[],c=r[o];for(let d=0,m=c.length;d<m;d++){let u=c[d],f=t(u,n);l.push(f)}e.morphAttributes[o]=l}e.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let n=this.attributes;for(let l in n){let c=n[l];t.data.attributes[l]=c.toJSON(t.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],d=[];for(let m=0,u=c.length;m<u;m++){let f=c[m];d.push(f.toJSON(t.data))}d.length>0&&(s[l]=d,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(t.data.boundingSphere=o.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let n=t.index;n!==null&&this.setIndex(n.clone());let s=t.attributes;for(let c in s){let d=s[c];this.setAttribute(c,d.clone(e))}let r=t.morphAttributes;for(let c in r){let d=[],m=r[c];for(let u=0,f=m.length;u<f;u++)d.push(m[u].clone(e));this.morphAttributes[c]=d}this.morphTargetsRelative=t.morphTargetsRelative;let a=t.groups;for(let c=0,d=a.length;c<d;c++){let m=a[c];this.addGroup(m.start,m.count,m.materialIndex)}let o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},ko=class{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=Sh,this.updateRanges=[],this.version=0,this.uuid=rs()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,n){t*=this.stride,n*=e.stride;for(let s=0,r=this.stride;s<r;s++)this.array[t+s]=e.array[n+s];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=rs()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let e=new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(e,this.stride);return n.setUsage(this.usage),n}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=rs()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer)));let e={uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride};return e.usage=this.usage,e}},zn=new N,aa=class i{constructor(t,e,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,n=this.data.count;e<n;e++)zn.fromBufferAttribute(this,e),zn.applyMatrix4(t),this.setXYZ(e,zn.x,zn.y,zn.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)zn.fromBufferAttribute(this,e),zn.applyNormalMatrix(t),this.setXYZ(e,zn.x,zn.y,zn.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)zn.fromBufferAttribute(this,e),zn.transformDirection(t),this.setXYZ(e,zn.x,zn.y,zn.z);return this}getComponent(t,e){let n=this.array[t*this.data.stride+this.offset+e];return this.normalized&&(n=Ci(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=Oe(n,this.array)),this.data.array[t*this.data.stride+this.offset+e]=n,this}setX(t,e){return this.normalized&&(e=Oe(e,this.array)),this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){return this.normalized&&(e=Oe(e,this.array)),this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){return this.normalized&&(e=Oe(e,this.array)),this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){return this.normalized&&(e=Oe(e,this.array)),this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(e=Ci(e,this.array)),e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(e=Ci(e,this.array)),e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(e=Ci(e,this.array)),e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(e=Ci(e,this.array)),e}setXY(t,e,n){return t=t*this.data.stride+this.offset,this.normalized&&(e=Oe(e,this.array),n=Oe(n,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this}setXYZ(t,e,n,s){return t=t*this.data.stride+this.offset,this.normalized&&(e=Oe(e,this.array),n=Oe(n,this.array),s=Oe(s,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t=t*this.data.stride+this.offset,this.normalized&&(e=Oe(e,this.array),n=Oe(n,this.array),s=Oe(s,this.array),r=Oe(r,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=s,this.data.array[t+3]=r,this}clone(t){if(t===void 0){ea("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return new ni(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new i(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){ea("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},Fc=new N,gp=new N,_p=new ae,_i=class{constructor(t=new N(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){let s=Fc.subVectors(n,e).cross(gp.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,n=!0){let s=t.delta(Fc),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let a=-(t.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:e.copy(t.start).addScaledVector(s,a)}intersectsLine(t){let e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let n=e||_p.getNormalMatrix(t),s=this.coplanarPoint(Fc).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}},xp=0,vi=class extends Ii{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:xp++}),this.uuid=rs(),this.name="",this.type="Material",this.blending=vs,this.side=xs,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=rh,this.blendDst=ah,this.blendEquation=Os,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new jt(0,0,0),this.blendAlpha=0,this.depthFunc=pr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=vd,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=wo,this.stencilZFail=wo,this.stencilZPass=wo,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let n=t[e];if(n===void 0){Qt(`Material: parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){Qt(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let a=[];for(let o in r){let l=r[o];delete l.metadata,a.push(l)}return a}if(e){let r=s(t.textures),a=s(t.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}fromJSON(t,e){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new jt().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=t.iridescenceThicknessRange),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(n=>new _i().fromJSON(n))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=e[t.map]||null),t.matcap!==void 0&&(this.matcap=e[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=e[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=e[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=e[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let n=t.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new Bt().fromArray(n)}return t.displacementMap!==void 0&&(this.displacementMap=e[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=e[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=e[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=e[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=e[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=e[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=e[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=e[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=e[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=e[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=e[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=e[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Bt().fromArray(t.clearcoatNormalScale)),t.iridescenceMap!==void 0&&(this.iridescenceMap=e[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=e[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=e[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=e[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=e[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,n=null;if(e!==null){let s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}},hi=class extends vi{constructor(t){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new jt(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.rotation=t.rotation,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},rr,qr=new N,ar=new N,or=new N,lr=new Bt,Yr=new Bt,Id=new Be,io=new N,Zr=new N,so=new N,bu=new Bt,Oc=new Bt,wu=new Bt,yi=class extends gn{constructor(t=new hi){if(super(),this.isSprite=!0,this.type="Sprite",rr===void 0){rr=new Le;let e=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new ko(e,5);rr.setIndex([0,1,2,0,2,3]),rr.setAttribute("position",new aa(n,3,0,!1)),rr.setAttribute("uv",new aa(n,2,3,!1))}this.geometry=rr,this.material=t,this.center=new Bt(.5,.5),this.count=1}intersectsFrustum(t){return t.intersectsSprite(this)}raycast(t,e){t.camera===null&&te('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),ar.setFromMatrixScale(this.matrixWorld),Id.copy(t.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse,this.matrixWorld),or.setFromMatrixPosition(this.modelViewMatrix),t.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&ar.multiplyScalar(-or.z);let n=this.material.rotation,s,r;n!==0&&(r=Math.cos(n),s=Math.sin(n));let a=this.center;ro(io.set(-.5,-.5,0),or,a,ar,s,r),ro(Zr.set(.5,-.5,0),or,a,ar,s,r),ro(so.set(.5,.5,0),or,a,ar,s,r),bu.set(0,0),Oc.set(1,0),wu.set(1,1);let o=t.ray.intersectTriangle(io,Zr,so,!1,qr);if(o===null&&(ro(Zr.set(-.5,.5,0),or,a,ar,s,r),Oc.set(0,1),o=t.ray.intersectTriangle(io,so,Zr,!1,qr),o===null))return;let l=t.ray.origin.distanceTo(qr);l<t.near||l>t.far||e.push({distance:l,point:qr.clone(),uv:Hi.getInterpolation(qr,io,Zr,so,bu,Oc,wu,new Bt),face:null,object:this})}copy(t,e){return super.copy(t,e),t.center!==void 0&&this.center.copy(t.center),this.material=t.material,this}};function ro(i,t,e,n,s,r){lr.subVectors(i,e).addScalar(.5).multiply(n),s!==void 0?(Yr.x=r*lr.x-s*lr.y,Yr.y=s*lr.x+r*lr.y):Yr.copy(lr),i.copy(t),i.x+=Yr.x,i.y+=Yr.y,i.applyMatrix4(Id)}var Gi=new N,Bc=new N,ao=new N,oo=new N,Ls=class{constructor(t=new N,e=new N(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Gi)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=Gi.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Gi.copy(this.origin).addScaledVector(this.direction,e),Gi.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){Bc.copy(t).add(e).multiplyScalar(.5),ao.copy(e).sub(t).normalize(),oo.copy(this.origin).sub(Bc);let r=t.distanceTo(e)*.5,a=-this.direction.dot(ao),o=oo.dot(this.direction),l=-oo.dot(ao),c=oo.lengthSq(),d=Math.abs(1-a*a),m,u,f,M;if(d>0)if(m=a*l-o,u=a*o-l,M=r*d,m>=0)if(u>=-M)if(u<=M){let T=1/d;m*=T,u*=T,f=m*(m+a*u+2*o)+u*(a*m+u+2*l)+c}else u=r,m=Math.max(0,-(a*u+o)),f=-m*m+u*(u+2*l)+c;else u=-r,m=Math.max(0,-(a*u+o)),f=-m*m+u*(u+2*l)+c;else u<=-M?(m=Math.max(0,-(-a*r+o)),u=m>0?-r:Math.min(Math.max(-r,-l),r),f=-m*m+u*(u+2*l)+c):u<=M?(m=0,u=Math.min(Math.max(-r,-l),r),f=u*(u+2*l)+c):(m=Math.max(0,-(a*r+o)),u=m>0?r:Math.min(Math.max(-r,-l),r),f=-m*m+u*(u+2*l)+c);else u=a>0?-r:r,m=Math.max(0,-(a*u+o)),f=-m*m+u*(u+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,m),s&&s.copy(Bc).addScaledVector(ao,u),f}intersectSphere(t,e){if(t.radius<0)return null;Gi.subVectors(t.center,this.origin);let n=Gi.dot(this.direction),s=Gi.dot(Gi)-n*n,r=t.radius*t.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,e):this.at(o,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){let n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,a,o,l,c=1/this.direction.x,d=1/this.direction.y,m=1/this.direction.z,u=this.origin;return c>=0?(n=(t.min.x-u.x)*c,s=(t.max.x-u.x)*c):(n=(t.max.x-u.x)*c,s=(t.min.x-u.x)*c),d>=0?(r=(t.min.y-u.y)*d,a=(t.max.y-u.y)*d):(r=(t.max.y-u.y)*d,a=(t.min.y-u.y)*d),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),m>=0?(o=(t.min.z-u.z)*m,l=(t.max.z-u.z)*m):(o=(t.max.z-u.z)*m,l=(t.min.z-u.z)*m),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,Gi)!==null}intersectTriangle(t,e,n,s,r){let a=this.origin,o=this.direction,l=o.x,c=o.y,d=o.z,m=t.x-a.x,u=t.y-a.y,f=t.z-a.z,M=e.x-a.x,T=e.y-a.y,x=e.z-a.z,p=n.x-a.x,C=n.y-a.y,D=n.z-a.z,A=Math.abs(l),P=Math.abs(c),R=Math.abs(d),U,y,I,F,H,q,Q,k,et,lt,rt,J;if(A>=P&&A>=R?(I=l,q=m,et=M,J=p,l>=0?(U=c,y=d,F=u,H=f,Q=T,k=x,lt=C,rt=D):(U=d,y=c,F=f,H=u,Q=x,k=T,lt=D,rt=C)):P>=R?(I=c,q=u,et=T,J=C,c>=0?(U=d,y=l,F=f,H=m,Q=x,k=M,lt=D,rt=p):(U=l,y=d,F=m,H=f,Q=M,k=x,lt=p,rt=D)):(I=d,q=f,et=x,J=D,d>=0?(U=l,y=c,F=m,H=u,Q=M,k=T,lt=p,rt=C):(U=c,y=l,F=u,H=m,Q=T,k=M,lt=C,rt=p)),I===0)return null;let st=U/I,mt=y/I,yt=1/I,$t=F-st*q,Wt=H-mt*q,Ae=Q-st*et,_e=k-mt*et,fe=lt-st*J,ct=rt-mt*J,gt=fe*_e-ct*Ae,St=$t*ct-Wt*fe,Kt=Ae*Wt-_e*$t;if(s){if(gt<0||St<0||Kt<0)return null}else if((gt<0||St<0||Kt<0)&&(gt>0||St>0||Kt>0))return null;let Ot=gt+St+Kt;if(Ot===0)return null;let ie=yt*(gt*q+St*et+Kt*J);return(Ot>0?ie<0:ie>0)?null:this.at(ie/Ot,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},rn=class extends vi{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new jt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Xi,this.combine=pl,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},Tu=new Be,Rs=new Ls,lo=new os,Au=new N,co=new N,ho=new N,uo=new N,zc=new N,fo=new N,Eu=new N,po=new N,ce=class extends gn{constructor(t=new Le,e=new rn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(t,e){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;e.fromBufferAttribute(s,t);let o=this.morphTargetInfluences;if(r&&o){fo.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let d=o[l],m=r[l];d!==0&&(zc.fromBufferAttribute(m,t),a?fo.addScaledVector(zc,d):fo.addScaledVector(zc.sub(e),d))}e.add(fo)}return e}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),lo.copy(n.boundingSphere),lo.applyMatrix4(r),Rs.copy(t.ray).recast(t.near),!(lo.containsPoint(Rs.origin)===!1&&(Rs.intersectSphere(lo,Au)===null||Rs.origin.distanceToSquared(Au)>(t.far-t.near)**2))&&(Tu.copy(r).invert(),Rs.copy(t.ray).applyMatrix4(Tu),!(n.boundingBox!==null&&Rs.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,Rs)))}_computeIntersections(t,e,n){let s,r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,d=r.attributes.uv1,m=r.attributes.normal,u=r.groups,f=r.drawRange;if(o!==null)if(Array.isArray(a))for(let M=0,T=u.length;M<T;M++){let x=u[M],p=a[x.materialIndex],C=Math.max(x.start,f.start),D=Math.min(o.count,Math.min(x.start+x.count,f.start+f.count));for(let A=C,P=D;A<P;A+=3){let R=o.getX(A),U=o.getX(A+1),y=o.getX(A+2);s=mo(this,p,t,n,c,d,m,R,U,y),s&&(s.faceIndex=Math.floor(A/3),s.face.materialIndex=x.materialIndex,e.push(s))}}else{let M=Math.max(0,f.start),T=Math.min(o.count,f.start+f.count);for(let x=M,p=T;x<p;x+=3){let C=o.getX(x),D=o.getX(x+1),A=o.getX(x+2);s=mo(this,a,t,n,c,d,m,C,D,A),s&&(s.faceIndex=Math.floor(x/3),e.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let M=0,T=u.length;M<T;M++){let x=u[M],p=a[x.materialIndex],C=Math.max(x.start,f.start),D=Math.min(l.count,Math.min(x.start+x.count,f.start+f.count));for(let A=C,P=D;A<P;A+=3){let R=A,U=A+1,y=A+2;s=mo(this,p,t,n,c,d,m,R,U,y),s&&(s.faceIndex=Math.floor(A/3),s.face.materialIndex=x.materialIndex,e.push(s))}}else{let M=Math.max(0,f.start),T=Math.min(l.count,f.start+f.count);for(let x=M,p=T;x<p;x+=3){let C=x,D=x+1,A=x+2;s=mo(this,a,t,n,c,d,m,C,D,A),s&&(s.faceIndex=Math.floor(x/3),e.push(s))}}}};function vp(i,t,e,n,s,r,a,o){let l;if(t.side===Sn?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,t.side===xs,o),l===null)return null;po.copy(o),po.applyMatrix4(i.matrixWorld);let c=e.ray.origin.distanceTo(po);return c<e.near||c>e.far?null:{distance:c,point:po.clone(),object:i}}function mo(i,t,e,n,s,r,a,o,l,c){i.getVertexPosition(o,co),i.getVertexPosition(l,ho),i.getVertexPosition(c,uo);let d=vp(i,t,e,n,co,ho,uo,Eu);if(d){let m=new N;Hi.getBarycoord(Eu,co,ho,uo,m),s&&(d.uv=Hi.getInterpolatedAttribute(s,o,l,c,m,new Bt)),r&&(d.uv1=Hi.getInterpolatedAttribute(r,o,l,c,m,new Bt)),a&&(d.normal=Hi.getInterpolatedAttribute(a,o,l,c,m,new N),d.normal.dot(n.direction)>0&&d.normal.multiplyScalar(-1));let u={a:o,b:l,c,normal:new N,materialIndex:0};Hi.getNormal(co,ho,uo,u.normal),d.face=u,d.barycoord=m}return d}var Vo=class extends Nn{constructor(t=null,e=1,n=1,s,r,a,o,l,c=Mn,d=Mn,m,u){super(null,a,o,l,c,d,s,r,m,u),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Ps=new os,yp=new Bt(.5,.5),go=new N,Mr=class{constructor(t=new _i,e=new _i,n=new _i,s=new _i,r=new _i,a=new _i){this.planes=[t,e,n,s,r,a]}set(t,e,n,s,r,a){let o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(t){let e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=xi,n=!1){let s=this.planes,r=t.elements,a=r[0],o=r[1],l=r[2],c=r[3],d=r[4],m=r[5],u=r[6],f=r[7],M=r[8],T=r[9],x=r[10],p=r[11],C=r[12],D=r[13],A=r[14],P=r[15];if(s[0].setComponents(c-a,f-d,p-M,P-C).normalize(),s[1].setComponents(c+a,f+d,p+M,P+C).normalize(),s[2].setComponents(c+o,f+m,p+T,P+D).normalize(),s[3].setComponents(c-o,f-m,p-T,P-D).normalize(),n)s[4].setComponents(l,u,x,A).normalize(),s[5].setComponents(c-l,f-u,p-x,P-A).normalize();else if(s[4].setComponents(c-l,f-u,p-x,P-A).normalize(),e===xi)s[5].setComponents(c+l,f+u,p+x,P+A).normalize();else if(e===mr)s[5].setComponents(l,u,x,A).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),Ps.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),Ps.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Ps)}intersectsSprite(t){Ps.center.set(0,0,0);let e=yp.distanceTo(t.center);return Ps.radius=.7071067811865476+e,Ps.applyMatrix4(t.matrixWorld),this.intersectsSphere(Ps)}intersectsSphere(t){let e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){let e=this.planes;for(let n=0;n<6;n++){let s=e[n];if(go.x=s.normal.x>0?t.max.x:t.min.x,go.y=s.normal.y>0?t.max.y:t.min.y,go.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(go)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var ii=class extends vi{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new jt(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}},Go=new N,Ho=new N,Cu=new Be,$r=new Ls,_o=new os,kc=new N,Ru=new N,Li=class extends gn{constructor(t=new Le,e=new ii){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,n=[0];for(let s=1,r=e.count;s<r;s++)Go.fromBufferAttribute(e,s-1),Ho.fromBufferAttribute(e,s),n[s]=n[s-1],n[s]+=Go.distanceTo(Ho);t.setAttribute("lineDistance",new ne(n,1))}else Qt("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let n=this.geometry,s=this.matrixWorld,r=t.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),_o.copy(n.boundingSphere),_o.applyMatrix4(s),_o.radius+=r,t.ray.intersectsSphere(_o)===!1)return;Cu.copy(s).invert(),$r.copy(t.ray).applyMatrix4(Cu);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,d=n.index,u=n.attributes.position;if(d!==null){let f=Math.max(0,a.start),M=Math.min(d.count,a.start+a.count);for(let T=f,x=M-1;T<x;T+=c){let p=d.getX(T),C=d.getX(T+1),D=xo(this,t,$r,l,p,C,T);D&&e.push(D)}if(this.isLineLoop){let T=d.getX(M-1),x=d.getX(f),p=xo(this,t,$r,l,T,x,M-1);p&&e.push(p)}}else{let f=Math.max(0,a.start),M=Math.min(u.count,a.start+a.count);for(let T=f,x=M-1;T<x;T+=c){let p=xo(this,t,$r,l,T,T+1,T);p&&e.push(p)}if(this.isLineLoop){let T=xo(this,t,$r,l,M-1,f,M-1);T&&e.push(T)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function xo(i,t,e,n,s,r,a){let o=i.geometry.attributes.position;if(Go.fromBufferAttribute(o,s),Ho.fromBufferAttribute(o,r),e.distanceSqToSegment(Go,Ho,kc,Ru)>n)return;kc.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(kc);if(!(c<t.near||c>t.far))return{distance:c,point:Ru.clone().applyMatrix4(i.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:i}}var Pu=new N,Iu=new N,Ds=class extends Li{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,n=[];for(let s=0,r=e.count;s<r;s+=2)Pu.fromBufferAttribute(e,s),Iu.fromBufferAttribute(e,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+Pu.distanceTo(Iu);t.setAttribute("lineDistance",new ne(n,1))}else Qt("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}};var ls=class extends vi{constructor(t){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new jt(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},Lu=new Be,Jc=new Ls,vo=new os,yo=new N,Ns=class extends gn{constructor(t=new Le,e=new ls){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let n=this.geometry,s=this.matrixWorld,r=t.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),vo.copy(n.boundingSphere),vo.applyMatrix4(s),vo.radius+=r,t.ray.intersectsSphere(vo)===!1)return;Lu.copy(s).invert(),Jc.copy(t.ray).applyMatrix4(Lu);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=n.index,m=n.attributes.position;if(c!==null){let u=Math.max(0,a.start),f=Math.min(c.count,a.start+a.count);for(let M=u,T=f;M<T;M++){let x=c.getX(M);yo.fromBufferAttribute(m,x),Du(yo,x,l,s,t,e,this)}}else{let u=Math.max(0,a.start),f=Math.min(m.count,a.start+a.count);for(let M=u,T=f;M<T;M++)yo.fromBufferAttribute(m,M),Du(yo,M,l,s,t,e,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function Du(i,t,e,n,s,r,a){let o=Jc.distanceSqToPoint(i);if(o<e){let l=new N;Jc.closestPointToPoint(i,l),l.applyMatrix4(n);let c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:t,face:null,faceIndex:null,barycoord:null,object:a})}}var oa=class extends Nn{constructor(t=[],e=ys,n,s,r,a,o,l,c,d){super(t,e,n,s,r,a,o,l,c,d),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},Us=class extends Nn{constructor(t,e,n,s,r,a,o,l,c){super(t,e,n,s,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var cs=class extends Nn{constructor(t,e,n=bi,s,r,a,o=Mn,l=Mn,c,d=Pi,m=1){if(d!==Pi&&d!==Ss)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let u={width:t,height:e,depth:m};super(u,s,r,a,o,l,d,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new xr(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return e.compareFunction=this.compareFunction,e}},Wo=class extends cs{constructor(t,e=bi,n=ys,s,r,a=Mn,o=Mn,l,c=Pi){let d={width:t,height:t,depth:1},m=[d,d,d,d,d,d];super(t,t,e,n,s,r,a,o,l,c),this.image=m,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},la=class extends Nn{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},Mi=class i extends Le{constructor(t=1,e=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let l=[],c=[],d=[],m=[],u=0,f=0;M("z","y","x",-1,-1,n,e,t,a,r,0),M("z","y","x",1,-1,n,e,-t,a,r,1),M("x","z","y",1,1,t,n,e,s,a,2),M("x","z","y",1,-1,t,n,-e,s,a,3),M("x","y","z",1,-1,t,e,n,s,r,4),M("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new ne(c,3)),this.setAttribute("normal",new ne(d,3)),this.setAttribute("uv",new ne(m,2));function M(T,x,p,C,D,A,P,R,U,y,I){let F=A/U,H=P/y,q=A/2,Q=P/2,k=R/2,et=U+1,lt=y+1,rt=0,J=0,st=new N;for(let mt=0;mt<lt;mt++){let yt=mt*H-Q;for(let $t=0;$t<et;$t++){let Wt=$t*F-q;st[T]=Wt*C,st[x]=yt*D,st[p]=k,c.push(st.x,st.y,st.z),st[T]=0,st[x]=0,st[p]=R>0?1:-1,d.push(st.x,st.y,st.z),m.push($t/U),m.push(1-mt/y),rt+=1}}for(let mt=0;mt<y;mt++)for(let yt=0;yt<U;yt++){let $t=u+yt+et*mt,Wt=u+yt+et*(mt+1),Ae=u+(yt+1)+et*(mt+1),_e=u+(yt+1)+et*mt;l.push($t,Wt,_e),l.push(Wt,Ae,_e),J+=6}o.addGroup(f,J,I),f+=J,u+=rt}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};var Fs=class i extends Le{constructor(t=1,e=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:n,thetaLength:s},e=Math.max(3,e);let r=[],a=[],o=[],l=[],c=new N,d=new Bt;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let m=0,u=3;m<=e;m++,u+=3){let f=n+m/e*s;c.x=t*Math.cos(f),c.y=t*Math.sin(f),a.push(c.x,c.y,c.z),o.push(0,0,1),d.x=(a[u]/t+1)/2,d.y=(a[u+1]/t+1)/2,l.push(d.x,d.y)}for(let m=1;m<=e;m++)r.push(m,m+1,0);this.setIndex(r),this.setAttribute("position",new ne(a,3)),this.setAttribute("normal",new ne(o,3)),this.setAttribute("uv",new ne(l,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.segments,t.thetaStart,t.thetaLength)}},ui=class i extends Le{constructor(t=1,e=1,n=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let d=[],m=[],u=[],f=[],M=0,T=[],x=n/2,p=0;C(),a===!1&&(t>0&&D(!0),e>0&&D(!1)),this.setIndex(d),this.setAttribute("position",new ne(m,3)),this.setAttribute("normal",new ne(u,3)),this.setAttribute("uv",new ne(f,2));function C(){let A=new N,P=new N,R=0,U=(e-t)/n;for(let y=0;y<=r;y++){let I=[],F=y/r,H=F*(e-t)+t;for(let q=0;q<=s;q++){let Q=q/s,k=Q*l+o,et=Math.sin(k),lt=Math.cos(k);P.x=H*et,P.y=-F*n+x,P.z=H*lt,m.push(P.x,P.y,P.z),A.set(et,U,lt).normalize(),u.push(A.x,A.y,A.z),f.push(Q,1-F),I.push(M++)}T.push(I)}for(let y=0;y<s;y++)for(let I=0;I<r;I++){let F=T[I][y],H=T[I+1][y],q=T[I+1][y+1],Q=T[I][y+1];(t>0||I!==0)&&(d.push(F,H,Q),R+=3),(e>0||I!==r-1)&&(d.push(H,q,Q),R+=3)}c.addGroup(p,R,0),p+=R}function D(A){let P=M,R=new Bt,U=new N,y=0,I=A===!0?t:e,F=A===!0?1:-1;for(let q=1;q<=s;q++)m.push(0,x*F,0),u.push(0,F,0),f.push(.5,.5),M++;let H=M;for(let q=0;q<=s;q++){let k=q/s*l+o,et=Math.cos(k),lt=Math.sin(k);U.x=I*lt,U.y=x*F,U.z=I*et,m.push(U.x,U.y,U.z),u.push(0,F,0),R.x=et*.5+.5,R.y=lt*.5*F+.5,f.push(R.x,R.y),M++}for(let q=0;q<s;q++){let Q=P+q,k=H+q;A===!0?d.push(k,k+1,Q):d.push(k+1,k,Q),y+=3}c.addGroup(p,y,A===!0?1:2),p+=y}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},hs=class i extends ui{constructor(t=1,e=1,n=32,s=1,r=!1,a=0,o=Math.PI*2){super(0,t,e,n,s,r,a,o),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(t){return new i(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Sr=class i extends Le{constructor(t=[],e=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:n,detail:s};let r=[],a=[];o(s),c(n),d(),this.setAttribute("position",new ne(r,3)),this.setAttribute("normal",new ne(r.slice(),3)),this.setAttribute("uv",new ne(a,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function o(C){let D=new N,A=new N,P=new N;for(let R=0;R<e.length;R+=3)f(e[R+0],D),f(e[R+1],A),f(e[R+2],P),l(D,A,P,C)}function l(C,D,A,P){let R=P+1,U=[];for(let y=0;y<=R;y++){U[y]=[];let I=C.clone().lerp(A,y/R),F=D.clone().lerp(A,y/R),H=R-y;for(let q=0;q<=H;q++)q===0&&y===R?U[y][q]=I:U[y][q]=I.clone().lerp(F,q/H)}for(let y=0;y<R;y++)for(let I=0;I<2*(R-y)-1;I++){let F=Math.floor(I/2);I%2===0?(u(U[y][F+1]),u(U[y+1][F]),u(U[y][F])):(u(U[y][F+1]),u(U[y+1][F+1]),u(U[y+1][F]))}}function c(C){let D=new N;for(let A=0;A<r.length;A+=3)D.x=r[A+0],D.y=r[A+1],D.z=r[A+2],D.normalize().multiplyScalar(C),r[A+0]=D.x,r[A+1]=D.y,r[A+2]=D.z}function d(){let C=new N;for(let D=0;D<r.length;D+=3){C.x=r[D+0],C.y=r[D+1],C.z=r[D+2];let A=x(C)/2/Math.PI+.5,P=p(C)/Math.PI+.5;a.push(A,1-P)}M(),m()}function m(){for(let C=0;C<a.length;C+=6){let D=a[C+0],A=a[C+2],P=a[C+4],R=Math.max(D,A,P),U=Math.min(D,A,P);R>.9&&U<.1&&(D<.2&&(a[C+0]+=1),A<.2&&(a[C+2]+=1),P<.2&&(a[C+4]+=1))}}function u(C){r.push(C.x,C.y,C.z)}function f(C,D){let A=C*3;D.x=t[A+0],D.y=t[A+1],D.z=t[A+2]}function M(){let C=new N,D=new N,A=new N,P=new N,R=new Bt,U=new Bt,y=new Bt;for(let I=0,F=0;I<r.length;I+=9,F+=6){C.set(r[I+0],r[I+1],r[I+2]),D.set(r[I+3],r[I+4],r[I+5]),A.set(r[I+6],r[I+7],r[I+8]),R.set(a[F+0],a[F+1]),U.set(a[F+2],a[F+3]),y.set(a[F+4],a[F+5]),P.copy(C).add(D).add(A).divideScalar(3);let H=x(P);T(R,F+0,C,H),T(U,F+2,D,H),T(y,F+4,A,H)}}function T(C,D,A,P){P<0&&C.x===1&&(a[D]=C.x-1),A.x===0&&A.z===0&&(a[D]=P/2/Math.PI+.5)}function x(C){return Math.atan2(C.z,-C.x)}function p(C){return Math.atan2(-C.y,Math.sqrt(C.x*C.x+C.z*C.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.vertices,t.indices,t.radius,t.detail)}},ca=class i extends Sr{constructor(t=1,e=0){let n=(1+Math.sqrt(5))/2,s=1/n,r=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-s,-n,0,-s,n,0,s,-n,0,s,n,-s,-n,0,-s,n,0,s,-n,0,s,n,0,-n,0,-s,n,0,-s,-n,0,s,n,0,s],a=[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9];super(r,a,t,e),this.type="DodecahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new i(t.radius,t.detail)}};var si=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Qt("Curve: .getPoint() not implemented.")}getPointAt(t,e){let n=this.getUtoTmapping(t);return this.getPoint(n,e)}getPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return e}getSpacedPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPointAt(n/t));return e}getLength(){let t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let e=[],n,s=this.getPoint(0),r=0;e.push(0);for(let a=1;a<=t;a++)n=this.getPoint(a/t),r+=n.distanceTo(s),e.push(r),s=n;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e=null){let n=this.getLengths(),s=0,r=n.length,a;e?a=e:a=t*n[r-1];let o=0,l=r-1,c;for(;o<=l;)if(s=Math.floor(o+(l-o)/2),c=n[s]-a,c<0)o=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,n[s]===a)return s/(r-1);let d=n[s],u=n[s+1]-d,f=(a-d)/u;return(s+f)/(r-1)}getTangent(t,e){let s=t-1e-4,r=t+1e-4;s<0&&(s=0),r>1&&(r=1);let a=this.getPoint(s),o=this.getPoint(r),l=e||(a.isVector2?new Bt:new N);return l.copy(o).sub(a).normalize(),l}getTangentAt(t,e){let n=this.getUtoTmapping(t);return this.getTangent(n,e)}computeFrenetFrames(t,e=!1){let n=new N,s=[],r=[],a=[],o=new N,l=new Be;for(let f=0;f<=t;f++){let M=f/t;s[f]=this.getTangentAt(M,new N)}r[0]=new N,a[0]=new N;let c=Number.MAX_VALUE,d=Math.abs(s[0].x),m=Math.abs(s[0].y),u=Math.abs(s[0].z);d<=c&&(c=d,n.set(1,0,0)),m<=c&&(c=m,n.set(0,1,0)),u<=c&&n.set(0,0,1),o.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],o),a[0].crossVectors(s[0],r[0]);for(let f=1;f<=t;f++){if(r[f]=r[f-1].clone(),a[f]=a[f-1].clone(),o.crossVectors(s[f-1],s[f]),o.length()>Number.EPSILON){o.normalize();let M=Math.acos(be(s[f-1].dot(s[f]),-1,1));r[f].applyMatrix4(l.makeRotationAxis(o,M))}a[f].crossVectors(s[f],r[f])}if(e===!0){let f=Math.acos(be(r[0].dot(r[t]),-1,1));f/=t,s[0].dot(o.crossVectors(r[0],r[t]))>0&&(f=-f);for(let M=1;M<=t;M++)r[M].applyMatrix4(l.makeRotationAxis(s[M],f*M)),a[M].crossVectors(s[M],r[M])}return{tangents:s,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){let t={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}},ha=class extends si{constructor(t=0,e=0,n=1,s=1,r=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(t,e=new Bt){let n=e,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(a?r=0:r=s),this.aClockwise===!0&&!a&&(r===s?r=-s:r=r-s);let o=this.aStartAngle+t*r,l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let d=Math.cos(this.aRotation),m=Math.sin(this.aRotation),u=l-this.aX,f=c-this.aY;l=u*d-f*m+this.aX,c=u*m+f*d+this.aY}return n.set(l,c)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){let t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}},Xo=class extends ha{constructor(t,e,n,s,r,a){super(t,e,n,n,s,r,a),this.isArcCurve=!0,this.type="ArcCurve"}};function wh(){let i=0,t=0,e=0,n=0;function s(r,a,o,l){i=r,t=o,e=-3*r+3*a-2*o-l,n=2*r-2*a+o+l}return{initCatmullRom:function(r,a,o,l,c){s(a,o,c*(o-r),c*(l-a))},initNonuniformCatmullRom:function(r,a,o,l,c,d,m){let u=(a-r)/c-(o-r)/(c+d)+(o-a)/d,f=(o-a)/d-(l-a)/(d+m)+(l-o)/m;u*=d,f*=d,s(a,o,u,f)},calc:function(r){let a=r*r,o=a*r;return i+t*r+e*a+n*o}}}var Nu=new N,Uu=new N,Vc=new wh,Gc=new wh,Hc=new wh,us=class extends si{constructor(t=[],e=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=n,this.tension=s}getPoint(t,e=new N){let n=e,s=this.points,r=s.length,a=(r-(this.closed?0:1))*t,o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:l===0&&o===r-1&&(o=r-2,l=1);let c,d;this.closed||o>0?c=s[(o-1)%r]:(Uu.subVectors(s[0],s[1]).add(s[0]),c=Uu);let m=s[o%r],u=s[(o+1)%r];if(this.closed||o+2<r?d=s[(o+2)%r]:(Nu.subVectors(s[r-1],s[r-2]).add(s[r-1]),d=Nu),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,M=Math.pow(c.distanceToSquared(m),f),T=Math.pow(m.distanceToSquared(u),f),x=Math.pow(u.distanceToSquared(d),f);T<1e-4&&(T=1),M<1e-4&&(M=T),x<1e-4&&(x=T),Vc.initNonuniformCatmullRom(c.x,m.x,u.x,d.x,M,T,x),Gc.initNonuniformCatmullRom(c.y,m.y,u.y,d.y,M,T,x),Hc.initNonuniformCatmullRom(c.z,m.z,u.z,d.z,M,T,x)}else this.curveType==="catmullrom"&&(Vc.initCatmullRom(c.x,m.x,u.x,d.x,this.tension),Gc.initCatmullRom(c.y,m.y,u.y,d.y,this.tension),Hc.initCatmullRom(c.z,m.z,u.z,d.z,this.tension));return n.set(Vc.calc(l),Gc.calc(l),Hc.calc(l)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(s.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let s=this.points[e];t.points.push(s.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(new N().fromArray(s))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}};function Fu(i,t,e,n,s){let r=(n-t)*.5,a=(s-e)*.5,o=i*i,l=i*o;return(2*e-2*n+r+a)*l+(-3*e+3*n-2*r-a)*o+r*i+e}function Mp(i,t){let e=1-i;return e*e*t}function Sp(i,t){return 2*(1-i)*i*t}function bp(i,t){return i*i*t}function Jr(i,t,e,n){return Mp(i,t)+Sp(i,e)+bp(i,n)}function wp(i,t){let e=1-i;return e*e*e*t}function Tp(i,t){let e=1-i;return 3*e*e*i*t}function Ap(i,t){return 3*(1-i)*i*i*t}function Ep(i,t){return i*i*i*t}function Kr(i,t,e,n,s){return wp(i,t)+Tp(i,e)+Ap(i,n)+Ep(i,s)}var qo=class extends si{constructor(t=new Bt,e=new Bt,n=new Bt,s=new Bt){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new Bt){let n=e,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(Kr(t,s.x,r.x,a.x,o.x),Kr(t,s.y,r.y,a.y,o.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},Yo=class extends si{constructor(t=new N,e=new N,n=new N,s=new N){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new N){let n=e,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(Kr(t,s.x,r.x,a.x,o.x),Kr(t,s.y,r.y,a.y,o.y),Kr(t,s.z,r.z,a.z,o.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},Zo=class extends si{constructor(t=new Bt,e=new Bt){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new Bt){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new Bt){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},br=class extends si{constructor(t=new N,e=new N){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new N){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new N){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},$o=class extends si{constructor(t=new Bt,e=new Bt,n=new Bt){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new Bt){let n=e,s=this.v0,r=this.v1,a=this.v2;return n.set(Jr(t,s.x,r.x,a.x),Jr(t,s.y,r.y,a.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},ua=class extends si{constructor(t=new N,e=new N,n=new N){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new N){let n=e,s=this.v0,r=this.v1,a=this.v2;return n.set(Jr(t,s.x,r.x,a.x),Jr(t,s.y,r.y,a.y),Jr(t,s.z,r.z,a.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Jo=class extends si{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new Bt){let n=e,s=this.points,r=(s.length-1)*t,a=Math.floor(r),o=r-a,l=s[a===0?a:a-1],c=s[a],d=s[a>s.length-2?s.length-1:a+1],m=s[a>s.length-3?s.length-1:a+2];return n.set(Fu(o,l.x,c.x,d.x,m.x),Fu(o,l.y,c.y,d.y,m.y)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let s=this.points[e];t.points.push(s.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(new Bt().fromArray(s))}return this}},Kc=Object.freeze({__proto__:null,ArcCurve:Xo,CatmullRomCurve3:us,CubicBezierCurve:qo,CubicBezierCurve3:Yo,EllipseCurve:ha,LineCurve:Zo,LineCurve3:br,QuadraticBezierCurve:$o,QuadraticBezierCurve3:ua,SplineCurve:Jo}),da=class extends si{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){let t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){let n=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Kc[n](e,t))}return this}getPoint(t,e){let n=t*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=n){let a=s[r]-n,o=this.curves[r],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,e)}r++}return null}getLength(){let t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let t=[],e=0;for(let n=0,s=this.curves.length;n<s;n++)e+=this.curves[n].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){let e=[],n;for(let s=0,r=this.curves;s<r.length;s++){let a=r[s],o=a.isEllipseCurve?t*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?t*a.points.length:t,l=a.getPoints(o);for(let c=0;c<l.length;c++){let d=l[c];n&&n.equals(d)||(e.push(d),n=d)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let s=t.curves[e];this.curves.push(s.clone())}return this.autoClose=t.autoClose,this}toJSON(){let t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,n=this.curves.length;e<n;e++){let s=this.curves[e];t.curves.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let s=t.curves[e];this.curves.push(new Kc[s.type]().fromJSON(s))}return this}};var ds=class i extends Sr{constructor(t=1,e=0){let n=(1+Math.sqrt(5))/2,s=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,t,e),this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new i(t.radius,t.detail)}};var fa=class i extends Sr{constructor(t=1,e=0){let n=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],s=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(n,s,t,e),this.type="OctahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new i(t.radius,t.detail)}},qi=class i extends Le{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};let r=t/2,a=e/2,o=Math.floor(n),l=Math.floor(s),c=o+1,d=l+1,m=t/o,u=e/l,f=[],M=[],T=[],x=[];for(let p=0;p<d;p++){let C=p*u-a;for(let D=0;D<c;D++){let A=D*m-r;M.push(A,-C,0),T.push(0,0,1),x.push(D/o),x.push(1-p/l)}}for(let p=0;p<l;p++)for(let C=0;C<o;C++){let D=C+c*p,A=C+c*(p+1),P=C+1+c*(p+1),R=C+1+c*p;f.push(D,A,R),f.push(A,P,R)}this.setIndex(f),this.setAttribute("position",new ne(M,3)),this.setAttribute("normal",new ne(T,3)),this.setAttribute("uv",new ne(x,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.widthSegments,t.heightSegments)}},fs=class i extends Le{constructor(t=.5,e=1,n=32,s=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:e,thetaSegments:n,phiSegments:s,thetaStart:r,thetaLength:a},n=Math.max(3,n),s=Math.max(1,s);let o=[],l=[],c=[],d=[],m=t,u=(e-t)/s,f=new N,M=new Bt;for(let T=0;T<=s;T++){for(let x=0;x<=n;x++){let p=r+x/n*a;f.x=m*Math.cos(p),f.y=m*Math.sin(p),l.push(f.x,f.y,f.z),c.push(0,0,1),M.x=(f.x/e+1)/2,M.y=(f.y/e+1)/2,d.push(M.x,M.y)}m+=u}for(let T=0;T<s;T++){let x=T*(n+1);for(let p=0;p<n;p++){let C=p+x,D=C,A=C+n+1,P=C+n+2,R=C+1;o.push(D,A,R),o.push(A,P,R)}}this.setIndex(o),this.setAttribute("position",new ne(l,3)),this.setAttribute("normal",new ne(c,3)),this.setAttribute("uv",new ne(d,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}};var Un=class i extends Le{constructor(t=1,e=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));let l=Math.min(a+o,Math.PI),c=0,d=[],m=new N,u=new N,f=[],M=[],T=[],x=[];for(let p=0;p<=n;p++){let C=[],D=p/n,A=a+D*o,P=t*Math.cos(A),R=Math.sqrt(t*t-P*P),U=0;p===0&&a===0?U=.5/e:p===n&&l===Math.PI&&(U=-.5/e);for(let y=0;y<=e;y++){let I=y/e,F=s+I*r;m.x=-R*Math.cos(F),m.y=P,m.z=R*Math.sin(F),M.push(m.x,m.y,m.z),u.copy(m).normalize(),T.push(u.x,u.y,u.z),x.push(I+U,1-D),C.push(c++)}d.push(C)}for(let p=0;p<n;p++)for(let C=0;C<e;C++){let D=d[p][C+1],A=d[p][C],P=d[p+1][C],R=d[p+1][C+1];(p!==0||a>0)&&f.push(D,A,R),(p!==n-1||l<Math.PI)&&f.push(A,P,R)}this.setIndex(f),this.setAttribute("position",new ne(M,3)),this.setAttribute("normal",new ne(T,3)),this.setAttribute("uv",new ne(x,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};var ps=class i extends Le{constructor(t=1,e=.4,n=12,s=48,r=Math.PI*2,a=0,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:n,tubularSegments:s,arc:r,thetaStart:a,thetaLength:o},n=Math.floor(n),s=Math.floor(s);let l=[],c=[],d=[],m=[],u=new N,f=new N,M=new N;for(let T=0;T<=n;T++){let x=a+T/n*o;for(let p=0;p<=s;p++){let C=p/s*r;f.x=(t+e*Math.cos(x))*Math.cos(C),f.y=(t+e*Math.cos(x))*Math.sin(C),f.z=e*Math.sin(x),c.push(f.x,f.y,f.z),u.x=t*Math.cos(C),u.y=t*Math.sin(C),M.subVectors(f,u).normalize(),d.push(M.x,M.y,M.z),m.push(p/s),m.push(T/n)}}for(let T=1;T<=n;T++)for(let x=1;x<=s;x++){let p=(s+1)*T+x-1,C=(s+1)*(T-1)+x-1,D=(s+1)*(T-1)+x,A=(s+1)*T+x;l.push(p,C,A),l.push(C,D,A)}this.setIndex(l),this.setAttribute("position",new ne(c,3)),this.setAttribute("normal",new ne(d,3)),this.setAttribute("uv",new ne(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}};var pa=class i extends Le{constructor(t=new ua(new N(-1,-1,0),new N(-1,1,0),new N(1,1,0)),e=64,n=1,s=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:t,tubularSegments:e,radius:n,radialSegments:s,closed:r};let a=t.computeFrenetFrames(e,r);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;let o=new N,l=new N,c=new Bt,d=new N,m=[],u=[],f=[],M=[];T(),this.setIndex(M),this.setAttribute("position",new ne(m,3)),this.setAttribute("normal",new ne(u,3)),this.setAttribute("uv",new ne(f,2));function T(){for(let D=0;D<e;D++)x(D);x(r===!1?e:0),C(),p()}function x(D){d=t.getPointAt(D/e,d);let A=a.normals[D],P=a.binormals[D];for(let R=0;R<=s;R++){let U=R/s*Math.PI*2,y=Math.sin(U),I=-Math.cos(U);l.x=I*A.x+y*P.x,l.y=I*A.y+y*P.y,l.z=I*A.z+y*P.z,l.normalize(),u.push(l.x,l.y,l.z),o.x=d.x+n*l.x,o.y=d.y+n*l.y,o.z=d.z+n*l.z,m.push(o.x,o.y,o.z)}}function p(){for(let D=1;D<=e;D++)for(let A=1;A<=s;A++){let P=(s+1)*(D-1)+(A-1),R=(s+1)*D+(A-1),U=(s+1)*D+A,y=(s+1)*(D-1)+A;M.push(P,R,y),M.push(R,U,y)}}function C(){for(let D=0;D<=e;D++)for(let A=0;A<=s;A++)c.x=D/e,c.y=A/s,f.push(c.x,c.y)}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON();return t.path=this.parameters.path.toJSON(),t}static fromJSON(t){return new i(new Kc[t.path.type]().fromJSON(t.path),t.tubularSegments,t.radius,t.radialSegments,t.closed)}},wr=class extends Le{constructor(t=null){if(super(),this.type="WireframeGeometry",this.parameters={geometry:t},t!==null){let e=[],n=new Set,s=new N,r=new N;if(t.index!==null){let a=t.attributes.position,o=t.index,l=t.groups;l.length===0&&(l=[{start:0,count:o.count,materialIndex:0}]);for(let c=0,d=l.length;c<d;++c){let m=l[c],u=m.start,f=m.count;for(let M=u,T=u+f;M<T;M+=3)for(let x=0;x<3;x++){let p=o.getX(M+x),C=o.getX(M+(x+1)%3);s.fromBufferAttribute(a,p),r.fromBufferAttribute(a,C),Ou(s,r,n)===!0&&(e.push(s.x,s.y,s.z),e.push(r.x,r.y,r.z))}}}else{let a=t.attributes.position;for(let o=0,l=a.count/3;o<l;o++)for(let c=0;c<3;c++){let d=3*o+c,m=3*o+(c+1)%3;s.fromBufferAttribute(a,d),r.fromBufferAttribute(a,m),Ou(s,r,n)===!0&&(e.push(s.x,s.y,s.z),e.push(r.x,r.y,r.z))}}this.setAttribute("position",new ne(e,3))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}};function Ou(i,t,e){let n=`${i.x},${i.y},${i.z}-${t.x},${t.y},${t.z}`,s=`${t.x},${t.y},${t.z}-${i.x},${i.y},${i.z}`;return e.has(n)===!0||e.has(s)===!0?!1:(e.add(n),e.add(s),!0)}function zs(i){let t={};for(let e in i){t[e]={};for(let n in i[e]){let s=i[e][n];if(Bu(s))s.isRenderTargetTexture?(Qt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone();else if(Array.isArray(s))if(Bu(s[0])){let r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();t[e][n]=r}else t[e][n]=s.slice();else t[e][n]=s}}return t}function Fn(i){let t={};for(let e=0;e<i.length;e++){let n=zs(i[e]);for(let s in n)t[s]=n[s]}return t}function Bu(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function Cp(i){let t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function Th(i){let t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:we.workingColorSpace}var Ld={clone:zs,merge:Fn},Rp=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Pp=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,_n=class extends vi{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Rp,this.fragmentShader=Pp,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=zs(t.uniforms),this.uniformsGroups=Cp(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?e.uniforms[s]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[s]={type:"m4",value:a.toArray()}:e.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(let n in t.uniforms){let s=t.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=e[s.value]||null;break;case"c":this.uniforms[n].value=new jt().setHex(s.value);break;case"v2":this.uniforms[n].value=new Bt().fromArray(s.value);break;case"v3":this.uniforms[n].value=new N().fromArray(s.value);break;case"v4":this.uniforms[n].value=new Je().fromArray(s.value);break;case"m3":this.uniforms[n].value=new ae().fromArray(s.value);break;case"m4":this.uniforms[n].value=new Be().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(let n in t.extensions)this.extensions[n]=t.extensions[n];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}},Ko=class extends _n{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}};var Yi=class extends vi{constructor(t){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new jt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new jt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=tc,this.normalScale=new Bt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Xi,this.combine=pl,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.envMapIntensity=t.envMapIntensity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},jo=class extends vi{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=_d,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},Qo=class extends vi{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function cr(i,t){return!i||i.constructor===t?i:typeof t.BYTES_PER_ELEMENT=="number"?new t(i):Array.prototype.slice.call(i)}function Wc(i){return i!==void 0&&i.inTangents!==void 0&&i.outTangents!==void 0}var ms=class{constructor(t,e,n,s){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new e.constructor(n),this.sampleValues=e,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,n=this._cachedIndex,s=e[n],r=e[n-1];n:{t:{let a;e:{i:if(!(t<s)){for(let o=n+2;;){if(s===void 0){if(t<r)break i;return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=s,s=e[++n],t<s)break t}a=e.length;break e}if(!(t>=r)){let o=e[1];t<o&&(n=2,r=o);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=e[--n-1],t>=r)break t}a=n,n=0;break e}break n}for(;n<a;){let o=n+a>>>1;t<e[o]?a=o:n=o+1}if(s=e[n],r=e[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,t,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=t*s;for(let a=0;a!==s;++a)e[a]=n[r+a];return e}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},tl=class extends ms{constructor(t,e,n,s){super(t,e,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Yc,endingEnd:Yc}}intervalChanged_(t,e,n){let s=this.parameterPositions,r=t-2,a=t+1,o=s[r],l=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case Zc:r=t,o=2*e-n;break;case $c:r=s.length-2,o=e+s[r]-s[r+1];break;default:r=t,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Zc:a=t,l=2*n-e;break;case $c:a=1,l=n+s[1]-s[0];break;default:a=t-1,l=e}let c=(n-e)*.5,d=this.valueSize;this._weightPrev=c/(e-o),this._weightNext=c/(l-n),this._offsetPrev=r*d,this._offsetNext=a*d}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,d=this._offsetPrev,m=this._offsetNext,u=this._weightPrev,f=this._weightNext,M=(n-e)/(s-e),T=M*M,x=T*M,p=-u*x+2*u*T-u*M,C=(1+u)*x+(-1.5-2*u)*T+(-.5+u)*M+1,D=(-1-f)*x+(1.5+f)*T+.5*M,A=f*x-f*T;for(let P=0;P!==o;++P)r[P]=p*a[d+P]+C*a[c+P]+D*a[l+P]+A*a[m+P];return r}},el=class extends ms{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,d=(n-e)/(s-e),m=1-d;for(let u=0;u!==o;++u)r[u]=a[c+u]*m+a[l+u]*d;return r}},nl=class extends ms{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t){return this.copySampleValue_(t-1)}},il=class extends ms{interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,d=this.inTangents,m=this.outTangents;if(!d||!m){let M=(n-e)/(s-e),T=1-M;for(let x=0;x!==o;++x)r[x]=a[c+x]*T+a[l+x]*M;return r}let u=o*2,f=t-1;for(let M=0;M!==o;++M){let T=a[c+M],x=a[l+M],p=f*u+M*2,C=m[p],D=m[p+1],A=t*u+M*2,P=d[A],R=d[A+1],U=Lp(n,e,C,P,s);r[M]=Dd(U,T,D,R,x)}return r}};function Dd(i,t,e,n,s){let r=1-i;return r*r*r*t+3*r*r*i*e+3*r*i*i*n+i*i*i*s}function Ip(i,t,e,n,s){let r=1-i;return 3*r*r*(e-t)+6*r*i*(n-e)+3*i*i*(s-n)}function Lp(i,t,e,n,s){let r=(i-t)/(s-t);for(let a=0;a<8;a++){let o=Dd(r,t,e,n,s)-i;if(Math.abs(o)<1e-10)break;let l=Ip(r,t,e,n,s);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-o/l))}return r}var ri=class{constructor(t,e,n,s){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=cr(e,this.TimeBufferType),this.values=cr(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,n;if(e.toJSON!==this.toJSON)n=e.toJSON(t);else{n={name:t.name,times:cr(t.times,Array),values:cr(t.values,Array)};let s=t.getInterpolation();s!==t.DefaultInterpolation&&(n.interpolation=s),Wc(t.settings)&&(n.settings={inTangents:cr(t.settings.inTangents,Array),outTangents:cr(t.settings.outTangents,Array)})}return n.type=t.ValueTypeName,n}InterpolantFactoryMethodDiscrete(t){return new nl(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new el(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new tl(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let e=new il(this.times,this.values,this.getValueSize(),t);return this.settings&&(e.inTangents=this.settings.inTangents,e.outTangents=this.settings.outTangents),e}setInterpolation(t){let e;switch(t){case jr:e=this.InterpolantFactoryMethodDiscrete;break;case Uo:e=this.InterpolantFactoryMethodLinear;break;case bo:e=this.InterpolantFactoryMethodSmooth;break;case qc:e=this.InterpolantFactoryMethodBezier;break}if(e===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Qt("KeyframeTrack:",n),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return jr;case this.InterpolantFactoryMethodLinear:return Uo;case this.InterpolantFactoryMethodSmooth:return bo;case this.InterpolantFactoryMethodBezier:return qc}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]*=t;Wc(this.settings)&&(zu(this.settings.inTangents,t),zu(this.settings.outTangents,t))}return this}trim(t,e){let n=this.times,s=n.length,r=0,a=s-1;for(;r!==s&&n[r]<t;)++r;for(;a!==-1&&n[a]>e;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(te("KeyframeTrack: Invalid value size in track.",this),t=!1);let n=this.times,s=this.values,r=n.length;r===0&&(te("KeyframeTrack: Track is empty.",this),t=!1);let a=null;for(let o=0;o!==r;o++){let l=n[o];if(typeof l=="number"&&isNaN(l)){te("KeyframeTrack: Time is not a valid number.",this,o,l),t=!1;break}if(a!==null&&a>l){te("KeyframeTrack: Out of order keys.",this,o,l,a),t=!1;break}a=l}if(s!==void 0&&ep(s))for(let o=0,l=s.length;o!==l;++o){let c=s[o];if(isNaN(c)){te("KeyframeTrack: Value is not a valid number.",this,o,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===bo,r=t.length-1,a=1;for(let o=1;o<r;++o){let l=!1,c=t[o],d=t[o+1];if(c!==d&&(o!==1||c!==t[0]))if(s)l=!0;else{let m=o*n,u=m-n,f=m+n;for(let M=0;M!==n;++M){let T=e[m+M];if(T!==e[u+M]||T!==e[f+M]){l=!0;break}}}if(l){if(o!==a){t[a]=t[o];let m=o*n,u=a*n;for(let f=0;f!==n;++f)e[u+f]=e[m+f]}++a}}if(r>0){t[a]=t[r];for(let o=r*n,l=a*n,c=0;c!==n;++c)e[l+c]=e[o+c];++a}return a!==t.length?(this.times=t.slice(0,a),this.values=e.slice(0,a*n)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),n=this.constructor,s=new n(this.name,t,e);return s.createInterpolant=this.createInterpolant,Wc(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function zu(i,t){for(let e=0,n=i.length;e!==n;e+=2)i[e]*=t}ri.prototype.ValueTypeName="";ri.prototype.TimeBufferType=Float32Array;ri.prototype.ValueBufferType=Float32Array;ri.prototype.DefaultInterpolation=Uo;var gs=class extends ri{constructor(t,e,n){super(t,e,n)}};gs.prototype.ValueTypeName="bool";gs.prototype.ValueBufferType=Array;gs.prototype.DefaultInterpolation=jr;gs.prototype.InterpolantFactoryMethodLinear=void 0;gs.prototype.InterpolantFactoryMethodSmooth=void 0;var sl=class extends ri{constructor(t,e,n,s){super(t,e,n,s)}};sl.prototype.ValueTypeName="color";var rl=class extends ri{constructor(t,e,n,s){super(t,e,n,s)}};rl.prototype.ValueTypeName="number";var al=class extends ms{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-e)/(s-e),c=t*o;for(let d=c+o;c!==d;c+=4)ci.slerpFlat(r,0,a,c-o,a,c,l);return r}},ma=class extends ri{constructor(t,e,n,s){super(t,e,n,s)}InterpolantFactoryMethodLinear(t){return new al(this.times,this.values,this.getValueSize(),t)}};ma.prototype.ValueTypeName="quaternion";ma.prototype.InterpolantFactoryMethodSmooth=void 0;var _s=class extends ri{constructor(t,e,n){super(t,e,n)}};_s.prototype.ValueTypeName="string";_s.prototype.ValueBufferType=Array;_s.prototype.DefaultInterpolation=jr;_s.prototype.InterpolantFactoryMethodLinear=void 0;_s.prototype.InterpolantFactoryMethodSmooth=void 0;var ol=class extends ri{constructor(t,e,n,s){super(t,e,n,s)}};ol.prototype.ValueTypeName="vector";var To={enabled:!1,files:{},add:function(i,t){this.enabled!==!1&&(ku(i)||(this.files[i]=t))},get:function(i){if(this.enabled!==!1&&!ku(i))return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}};function ku(i){try{let t=i.slice(i.indexOf(":")+1);return new URL(t).protocol==="blob:"}catch{return!1}}var ll=class{constructor(t,e,n){let s=this,r=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this._abortController=null,this.itemStart=function(d){o++,r===!1&&s.onStart!==void 0&&s.onStart(d,a,o),r=!0},this.itemEnd=function(d){a++,s.onProgress!==void 0&&s.onProgress(d,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(d){s.onError!==void 0&&s.onError(d)},this.resolveURL=function(d){return d=d.normalize("NFC"),l?l(d):d},this.setURLModifier=function(d){return l=d,this},this.addHandler=function(d,m){return c.push(d,m),this},this.removeHandler=function(d){let m=c.indexOf(d);return m!==-1&&c.splice(m,2),this},this.getHandler=function(d){for(let m=0,u=c.length;m<u;m+=2){let f=c[m],M=c[m+1];if(f.global&&(f.lastIndex=0),f.test(d))return M}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Nd=new ll,Tr=class{constructor(t){this.manager=t!==void 0?t:Nd,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,e){let n=this;return new Promise(function(s,r){n.load(t,s,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}};Tr.DEFAULT_MATERIAL_NAME="__DEFAULT";var hr=new WeakMap,cl=class extends Tr{constructor(t){super(t)}load(t,e,n,s){this.path!==void 0&&(t=this.path+t),t=this.manager.resolveURL(t);let r=this,a=To.get(`image:${t}`);if(a!==void 0){if(a.complete===!0)r.manager.itemStart(t),setTimeout(function(){e&&e(a),r.manager.itemEnd(t)},0);else{let m=hr.get(a);m===void 0&&(m=[],hr.set(a,m)),m.push({onLoad:e,onError:s})}return a}let o=gr("img");function l(){d(),e&&e(this);let m=hr.get(this)||[];for(let u=0;u<m.length;u++){let f=m[u];f.onLoad&&f.onLoad(this)}hr.delete(this),r.manager.itemEnd(t)}function c(m){d(),s&&s(m),To.remove(`image:${t}`);let u=hr.get(this)||[];for(let f=0;f<u.length;f++){let M=u[f];M.onError&&M.onError(m)}hr.delete(this),r.manager.itemError(t),r.manager.itemEnd(t)}function d(){o.removeEventListener("load",l,!1),o.removeEventListener("error",c,!1)}return o.addEventListener("load",l,!1),o.addEventListener("error",c,!1),t.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),To.add(`image:${t}`,o),r.manager.itemStart(t),o.src=t,o}};var ga=class extends Tr{constructor(t){super(t)}load(t,e,n,s){let r=new Nn,a=new cl(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(t,function(o){r.image=o,r.needsUpdate=!0,e!==void 0&&e(r)},n,s),r}},_a=class extends gn{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new jt(t),this.intensity=e}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}},xa=class extends _a{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(gn.DEFAULT_UP),this.updateMatrix(),this.groundColor=new jt(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){let e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}},Xc=new Be,Vu=new N,Gu=new N,hl=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Bt(512,512),this.mapType=Zn,this.map=null,this.mapPass=null,this.matrix=new Be,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Mr,this._frameExtents=new Bt(1,1),this._viewportCount=1,this._viewports=[new Je(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera;Vu.setFromMatrixPosition(t.matrixWorld),e.position.copy(Vu),Gu.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(Gu),e.updateMatrixWorld(),this._updateMatrix(e,this.matrix,this._frustum)}_updateMatrix(t,e,n,s){Xc.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),n.setFromProjectionMatrix(Xc,t.coordinateSystem,t.reversedDepth);let r=this._frameExtents,a=s?s.z/r.x:1,o=s?s.w/r.y:1,l=s?s.x/r.x:0,c=s?s.y/r.y:0;t.coordinateSystem===mr||t.reversedDepth?e.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):e.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),e.multiply(Xc)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},Mo=new N,So=new ci,Ei=new N,va=class extends gn{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Be,this.projectionMatrix=new Be,this.projectionMatrixInverse=new Be,this.coordinateSystem=xi,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(Mo,So,Ei),Ei.x===1&&Ei.y===1&&Ei.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Mo,So,Ei.set(1,1,1)).invert()}updateWorldMatrix(t,e,n=!1){super.updateWorldMatrix(t,e,n),this.matrixWorld.decompose(Mo,So,Ei),Ei.x===1&&Ei.y===1&&Ei.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Mo,So,Ei.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},ss=new N,Hu=new Bt,Wu=new Bt,Dn=class extends va{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=Fo*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(xc*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Fo*2*Math.atan(Math.tan(xc*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){ss.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(ss.x,ss.y).multiplyScalar(-t/ss.z),ss.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(ss.x,ss.y).multiplyScalar(-t/ss.z)}getViewSize(t,e){return this.getViewBounds(t,Hu,Wu),e.subVectors(Wu,Hu)}setViewOffset(t,e,n,s,r,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(xc*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,e-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}let o=this.filmOffset;o!==0&&(r+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}};var Ar=class extends va{constructor(t=-1,e=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-t,a=n+t,o=s+e,l=s-e;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,d=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=d*this.view.offsetY,l=o-d*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},jc=class extends hl{constructor(){super(new Ar(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},ya=class extends _a{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(gn.DEFAULT_UP),this.updateMatrix(),this.target=new gn,this.shadow=new jc}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}};var ur=-90,dr=1,ul=class extends gn{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Dn(ur,dr,t,e);s.layers=this.layers,this.add(s);let r=new Dn(ur,dr,t,e);r.layers=this.layers,this.add(r);let a=new Dn(ur,dr,t,e);a.layers=this.layers,this.add(a);let o=new Dn(ur,dr,t,e);o.layers=this.layers,this.add(o);let l=new Dn(ur,dr,t,e);l.layers=this.layers,this.add(l);let c=new Dn(ur,dr,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[n,s,r,a,o,l]=e;for(let c of e)this.remove(c);if(t===xi)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===mr)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,l,c,d]=this.children,m=t.getRenderTarget(),u=t.getActiveCubeFace(),f=t.getActiveMipmapLevel(),M=t.xr.enabled;t.xr.enabled=!1;let T=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let x=!1;t.isWebGLRenderer===!0?x=t.state.buffers.depth.getReversed():x=t.reversedDepthBuffer,t.setRenderTarget(n,0,s),x&&t.autoClear===!1&&t.clearDepth(),t.render(e,r),t.setRenderTarget(n,1,s),x&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(n,2,s),x&&t.autoClear===!1&&t.clearDepth(),t.render(e,o),t.setRenderTarget(n,3,s),x&&t.autoClear===!1&&t.clearDepth(),t.render(e,l),t.setRenderTarget(n,4,s),x&&t.autoClear===!1&&t.clearDepth(),t.render(e,c),n.texture.generateMipmaps=T,t.setRenderTarget(n,5,s),x&&t.autoClear===!1&&t.clearDepth(),t.render(e,d),t.setRenderTarget(m,u,f),t.xr.enabled=M,n.texture.needsPMREMUpdate=!0}},dl=class extends Dn{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}};var Ah="\\[\\]\\.:\\/",Dp=new RegExp("["+Ah+"]","g"),Eh="[^"+Ah+"]",Np="[^"+Ah.replace("\\.","")+"]",Up=/((?:WC+[\/:])*)/.source.replace("WC",Eh),Fp=/(WCOD+)?/.source.replace("WCOD",Np),Op=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Eh),Bp=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Eh),zp=new RegExp("^"+Up+Fp+Op+Bp+"$"),kp=["material","materials","bones","map"],Qc=class{constructor(t,e,n){let s=n||qe.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,s)}getValue(t,e){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(t,e)}setValue(t,e){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].unbind()}},qe=class i{constructor(t,e,n){this.path=e,this.parsedPath=n||i.parseTrackName(e),this.node=i.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,n){return t&&t.isAnimationObjectGroup?new i.Composite(t,e,n):new i(t,e,n)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(Dp,"")}static parseTrackName(t){let e=zp.exec(t);if(e===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let n={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);kp.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return n}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let n=t.skeleton.getBoneByName(e);if(n!==void 0)return n}if(t.children){let n=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===e||o.uuid===e)return o;let l=n(o.children);if(l)return l}return null},s=n(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)t[e++]=n[s]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,n=e.objectName,s=e.propertyName,r=e.propertyIndex;if(t||(t=i.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){Qt("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=e.objectIndex;switch(n){case"materials":if(!t.material){te("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){te("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){te("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let d=0;d<t.length;d++)if(t[d].name===c){c=d;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){te("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){te("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[n]===void 0){te("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[n]}if(c!==void 0){if(t[c]===void 0){te("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let a=t[s];if(a===void 0){let c=e.nodeName;te("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",t);return}let o=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?o=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){te("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){te("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};qe.Composite=Qc;qe.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};qe.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};qe.prototype.GetterByBindingType=[qe.prototype._getValue_direct,qe.prototype._getValue_array,qe.prototype._getValue_arrayElement,qe.prototype._getValue_toArray];qe.prototype.SetterByBindingTypeAndVersioning=[[qe.prototype._setValue_direct,qe.prototype._setValue_direct_setNeedsUpdate,qe.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[qe.prototype._setValue_array,qe.prototype._setValue_array_setNeedsUpdate,qe.prototype._setValue_array_setMatrixWorldNeedsUpdate],[qe.prototype._setValue_arrayElement,qe.prototype._setValue_arrayElement_setNeedsUpdate,qe.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[qe.prototype._setValue_fromArray,qe.prototype._setValue_fromArray_setNeedsUpdate,qe.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Bx=new Float32Array(1);var Xu=new Be,Ma=class{constructor(t,e,n=0,s=1/0){this.ray=new Ls(t,e),this.near=n,this.far=s,this.camera=null,this.layers=new vr,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,e.projectionMatrix.elements[14]).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):te("Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return Xu.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Xu),this}intersectObject(t,e=!0,n=[]){return th(t,this,n,e),n.sort(qu),n}intersectObjects(t,e=!0,n=[]){for(let s=0,r=t.length;s<r;s++)th(t[s],this,n,e);return n.sort(qu),n}};function qu(i,t){return i.distance-t.distance}function th(i,t,e,n){let s=!0;if(i.layers.test(t.layers)&&i.raycast(t,e)===!1&&(s=!1),s===!0&&n===!0){let r=i.children;for(let a=0,o=r.length;a<o;a++)th(r[a],t,e,!0)}}var Dh=class Dh{constructor(t,e,n,s){this.elements=[1,0,0,1],t!==void 0&&this.set(t,e,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let n=0;n<4;n++)this.elements[n]=t[n+e];return this}set(t,e,n,s){let r=this.elements;return r[0]=t,r[2]=e,r[1]=n,r[3]=s,this}};Dh.prototype.isMatrix2=!0;var eh=Dh;function Ch(i,t,e,n){let s=Vp(n);switch(e){case vh:return i*t;case Mh:return i*t/s.components*s.byteLength;case Ml:return i*t/s.components*s.byteLength;case bs:return i*t*2/s.components*s.byteLength;case Sl:return i*t*2/s.components*s.byteLength;case yh:return i*t*3/s.components*s.byteLength;case di:return i*t*4/s.components*s.byteLength;case bl:return i*t*4/s.components*s.byteLength;case Ta:case Aa:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Ea:case Ca:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Tl:case El:return Math.max(i,16)*Math.max(t,8)/4;case wl:case Al:return Math.max(i,8)*Math.max(t,8)/2;case Cl:case Rl:case Il:case Ll:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Pl:case Ra:case Dl:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Nl:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Ul:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case Fl:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case Ol:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case Bl:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case zl:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case kl:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case Vl:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case Gl:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case Hl:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case Wl:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case Xl:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case ql:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case Yl:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case Zl:case $l:case Jl:return Math.ceil(i/4)*Math.ceil(t/4)*16;case Kl:case jl:return Math.ceil(i/4)*Math.ceil(t/4)*8;case Pa:case Ql:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function Vp(i){switch(i){case Zn:case mh:return{byteLength:1,components:1};case Cr:case gh:case Ti:return{byteLength:2,components:1};case vl:case yl:return{byteLength:2,components:4};case bi:case xl:case wi:return{byteLength:4,components:1};case _h:case xh:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?Qt("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function nf(){let i=null,t=!1,e=null,n=null;function s(r,a){n=i.requestAnimationFrame(s),e(r,a)}return{start:function(){t!==!0&&e!==null&&i!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function Hp(i){let t=new WeakMap;function e(o,l){let c=o.array,d=o.usage,m=c.byteLength,u=i.createBuffer();i.bindBuffer(l,u),i.bufferData(l,c,d),o.onUploadCallback();let f;if(c instanceof Float32Array)f=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=i.SHORT;else if(c instanceof Uint32Array)f=i.UNSIGNED_INT;else if(c instanceof Int32Array)f=i.INT;else if(c instanceof Int8Array)f=i.BYTE;else if(c instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:u,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:m}}function n(o,l,c){let d=l.array,m=l.updateRanges;if(i.bindBuffer(c,o),m.length===0)i.bufferSubData(c,0,d);else{m.sort((f,M)=>f.start-M.start);let u=0;for(let f=1;f<m.length;f++){let M=m[u],T=m[f];T.start<=M.start+M.count+1?M.count=Math.max(M.count,T.start+T.count-M.start):(++u,m[u]=T)}m.length=u+1;for(let f=0,M=m.length;f<M;f++){let T=m[f];i.bufferSubData(c,T.start*d.BYTES_PER_ELEMENT,d,T.start,T.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=t.get(o);l&&(i.deleteBuffer(l.buffer),t.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let d=t.get(o);(!d||d.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=t.get(o);if(c===void 0)t.set(o,e(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var Wp=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Xp=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,qp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Yp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Zp=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,$p=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Jp=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,Kp=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,jp=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec4 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 );
	}
#endif`,Qp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,tm=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,em=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,nm=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,im=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,sm=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,rm=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,am=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,om=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,lm=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,cm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,hm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,um=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,dm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec4( 1.0 );
#endif
#ifdef USE_COLOR_ALPHA
	vColor *= color;
#elif defined( USE_COLOR )
	vColor.rgb *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.rgb *= instanceColor.rgb;
#endif
#ifdef USE_BATCHING_COLOR
	vColor *= getBatchingColor( getIndirectIndex( gl_DrawID ) );
#endif`,fm=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
#define inverseTransformDirection transformDirectionByInverseViewMatrix
vec3 transformNormalByInverseViewMatrix( in vec3 normal, in mat4 viewMatrix ) {
	return normalize( ( vec4( normal, 0.0 ) * viewMatrix ).xyz );
}
vec3 transformDirectionByInverseViewMatrix( in vec3 dir, in mat4 viewMatrix ) {
	return normalize( ( vec4( dir, 0.0 ) * viewMatrix ).xyz );
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,pm=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,mm=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
#endif`,gm=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,_m=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,xm=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,vm=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,ym="gl_FragColor = linearToOutputTexel( gl_FragColor );",Mm=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Sm=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * reflectVec );
		#ifdef ENVMAP_BLENDING_MULTIPLY
			outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_MIX )
			outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
		#elif defined( ENVMAP_BLENDING_ADD )
			outgoingLight += envColor.xyz * specularStrength * reflectivity;
		#endif
	#endif
#endif`,bm=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,wm=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Tm=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Am=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Em=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Cm=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Rm=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Pm=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Im=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Lm=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Dm=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Nm=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Um=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_SUN_LIGHTS > 0
	struct SunLight {
		vec3 direction;
		vec3 color;
	};
	uniform SunLight sunLights[ NUM_SUN_LIGHTS ];
	void getSunLightInfo( const in SunLight sunLight, out IncidentLight light ) {
		light.color = sunLight.color;
		light.direction = sunLight.direction;
		light.visible = true;
	}
#endif
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif
#include <lightprobes_pars_fragment>`,Fm=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = transformNormalByInverseViewMatrix( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, pow4( roughness ) ) );
			reflectVec = transformDirectionByInverseViewMatrix( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_RETROREFLECTION
		vec3 getIBLRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 retroVec = normalize( mix( viewDir, normal, pow4( roughness ) ) );
				retroVec = transformDirectionByInverseViewMatrix( retroVec, viewMatrix );
				vec4 envMapColor = textureCubeUV( envMap, envMapRotation * retroVec, roughness );
				return envMapColor.rgb * envMapIntensity;
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
		#ifdef USE_RETROREFLECTION
			vec3 getIBLAnisotropyRetroRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
				#ifdef ENVMAP_TYPE_CUBE_UV
					vec3 bentNormal = cross( bitangent, viewDir );
					bentNormal = normalize( cross( bentNormal, bitangent ) );
					bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
					return getIBLRetroRadiance( viewDir, bentNormal, roughness );
				#else
					return vec3( 0.0 );
				#endif
			}
		#endif
	#endif
#endif`,Om=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Bm=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,zm=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,km=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Vm=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.diffuseContribution = diffuseColor.rgb * ( 1.0 - metalnessFactor );
material.metalness = metalnessFactor;
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor;
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = vec3( 0.04 );
	material.specularColorBlended = mix( material.specularColor, diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_RETROREFLECTION
	material.retroreflectivity = retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.0001, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Gm=`uniform sampler2D dfgLUT;
struct PhysicalMaterial {
	vec3 diffuseColor;
	vec3 diffuseContribution;
	vec3 specularColor;
	vec3 specularColorBlended;
	float roughness;
	float metalness;
	float specularF90;
	float dispersion;
	vec2 dfg;
	vec3 multiScatteringCompensation;
	#ifdef USE_RETROREFLECTION
		float retroreflectivity;
	#endif
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0Dielectric;
		vec3 iridescenceF0Metallic;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		return 0.5 / max( gv + gl, EPSILON );
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColorBlended;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transpose( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float rInv = 1.0 / ( roughness + 0.1 );
	float a = -1.9362 + 1.0678 * roughness + 0.4573 * r2 - 0.8469 * rInv;
	float b = -0.6014 + 0.5538 * roughness - 0.4670 * r2 - 0.1255 * rInv;
	float DG = exp( a * dotNV + b );
	return saturate( DG );
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	vec2 fab = texture2D( dfgLUT, vec2( roughness, dotNV ) ).rg;
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec2 fab, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec2 fab, const in vec3 specularColor, const in float specularF90, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColorBlended * t2.x + ( material.specularF90 - material.specularColorBlended ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseContribution * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
		#ifdef USE_CLEARCOAT
			vec3 Ncc = geometryClearcoatNormal;
			vec2 uvClearcoat = LTC_Uv( Ncc, viewDir, material.clearcoatRoughness );
			vec4 t1Clearcoat = texture2D( ltc_1, uvClearcoat );
			vec4 t2Clearcoat = texture2D( ltc_2, uvClearcoat );
			mat3 mInvClearcoat = mat3(
				vec3( t1Clearcoat.x, 0, t1Clearcoat.y ),
				vec3(             0, 1,             0 ),
				vec3( t1Clearcoat.z, 0, t1Clearcoat.w )
			);
			vec3 fresnelClearcoat = material.clearcoatF0 * t2Clearcoat.x + ( material.clearcoatF90 - material.clearcoatF0 ) * t2Clearcoat.y;
			clearcoatSpecularDirect += lightColor * fresnelClearcoat * LTC_Evaluate( Ncc, viewDir, position, mInvClearcoat, rectCoords );
		#endif
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
 
 		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
 
 		float sheenAlbedoV = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
 		float sheenAlbedoL = IBLSheenBRDF( geometryNormal, directLight.direction, material.sheenRoughness );
 
 		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * max( sheenAlbedoV, sheenAlbedoL );
 
 		irradiance *= sheenEnergyComp;
 
 	#endif
	vec3 specularBRDF = BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	#ifdef USE_RETROREFLECTION
		vec3 retroViewDir = reflect( - geometryViewDir, geometryNormal );
		vec3 retroSpecularBRDF = BRDF_GGX( directLight.direction, retroViewDir, geometryNormal, material );
		specularBRDF = mix( specularBRDF, retroSpecularBRDF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directSpecular += irradiance * specularBRDF * material.multiScatteringCompensation;
	vec3 halfDir = normalize( directLight.direction + geometryViewDir );
	float dotVH = saturate( dot( geometryViewDir, halfDir ) );
	vec3 F = F_Schlick( material.specularColor, material.specularF90, dotVH );
	#ifdef USE_RETROREFLECTION
		vec3 retroHalfDir = normalize( directLight.direction + retroViewDir );
		float dotRetroVH = saturate( dot( retroViewDir, retroHalfDir ) );
		vec3 retroF = F_Schlick( material.specularColor, material.specularF90, dotRetroVH );
		F = mix( F, retroF, saturate( material.retroreflectivity ) );
	#endif
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - F );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScattering, multiScattering );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScattering, multiScattering );
	#endif
	vec3 diffuse = irradiance * BRDF_Lambert( material.diffuseContribution ) * ( 1.0 - singleScattering - multiScattering );
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		sheenSpecularIndirect += irradiance * material.sheenColor * sheenAlbedo * RECIPROCAL_PI;
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		diffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectDiffuse += diffuse;
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness ) * RECIPROCAL_PI;
 	#endif
	vec3 singleScatteringDielectric = vec3( 0.0 );
	vec3 multiScatteringDielectric = vec3( 0.0 );
	vec3 singleScatteringMetallic = vec3( 0.0 );
	vec3 multiScatteringMetallic = vec3( 0.0 );
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( material.dfg, material.specularColor, material.specularF90, material.iridescence, material.iridescenceF0Dielectric, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscatteringIridescence( material.dfg, material.diffuseColor, material.specularF90, material.iridescence, material.iridescenceF0Metallic, singleScatteringMetallic, multiScatteringMetallic );
	#else
		computeMultiscattering( material.dfg, material.specularColor, material.specularF90, singleScatteringDielectric, multiScatteringDielectric );
		computeMultiscattering( material.dfg, material.diffuseColor, material.specularF90, singleScatteringMetallic, multiScatteringMetallic );
	#endif
	vec3 singleScattering = mix( singleScatteringDielectric, singleScatteringMetallic, material.metalness );
	vec3 multiScattering = mix( multiScatteringDielectric, multiScatteringMetallic, material.metalness );
	vec3 totalScatteringDielectric = singleScatteringDielectric + multiScatteringDielectric;
	vec3 diffuse = material.diffuseContribution * ( 1.0 - totalScatteringDielectric );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	vec3 indirectSpecular = radiance * singleScattering;
	indirectSpecular += multiScattering * cosineWeightedIrradiance;
	vec3 indirectDiffuse = diffuse * cosineWeightedIrradiance;
	#ifdef USE_SHEEN
		float sheenAlbedo = IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
		float sheenEnergyComp = 1.0 - max3( material.sheenColor ) * sheenAlbedo;
		indirectSpecular *= sheenEnergyComp;
		indirectDiffuse *= sheenEnergyComp;
	#endif
	reflectedLight.indirectSpecular += indirectSpecular;
	reflectedLight.indirectDiffuse += indirectDiffuse;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,Hm=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		vec3 iridescenceFresnelDielectric = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		vec3 iridescenceFresnelMetallic = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.diffuseColor );
		material.iridescenceFresnel = mix( iridescenceFresnelDielectric, iridescenceFresnelMetallic, material.metalness );
		material.iridescenceF0Dielectric = Schlick_to_F0( iridescenceFresnelDielectric, 1.0, dotNVi );
		material.iridescenceF0Metallic = Schlick_to_F0( iridescenceFresnelMetallic, 1.0, dotNVi );
	}
#endif
#ifdef STANDARD
	float dotNVms = saturate( dot( geometryNormal, geometryViewDir ) );
	material.dfg = texture2D( dfgLUT, vec2( material.roughness, dotNVms ) ).rg;
	#if ( NUM_SUN_LIGHTS > 0 || NUM_DIR_LIGHTS > 0 || NUM_POINT_LIGHTS > 0 || NUM_SPOT_LIGHTS > 0 )
		float EssMs = material.dfg.x + material.dfg.y;
		material.multiScatteringCompensation = 1.0 + material.specularColorBlended * ( 1.0 / EssMs - 1.0 );
	#endif
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS ) && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SUN_LIGHTS > 0 ) && defined( RE_Direct )
	SunLight sunLight;
	#if defined( USE_SHADOWMAP ) && NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHTS; i ++ ) {
		sunLight = sunLights[ i ];
		getSunLightInfo( sunLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SUN_LIGHT_SHADOWS )
		sunLightShadow = sunLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getSunShadow( sunShadowMap[ i ], sunLightShadow, UNROLLED_LOOP_INDEX ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
	#ifdef USE_LIGHT_PROBES_GRID
		vec3 probeWorldPos = ( ( vec4( geometryPosition, 1.0 ) - viewMatrix[ 3 ] ) * viewMatrix ).xyz;
		vec3 probeWorldNormal = transformNormalByInverseViewMatrix( geometryNormal, viewMatrix );
		irradiance += getLightProbeGridIrradiance( probeWorldPos, probeWorldNormal );
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Wm=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( ENVMAP_TYPE_CUBE_UV )
		#if defined( STANDARD ) || defined( LAMBERT ) || defined( PHONG )
			iblIrradiance += getIBLIrradiance( geometryNormal );
		#endif
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		vec3 iblRadiance = getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		vec3 iblRadiance = getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_RETROREFLECTION
		#ifdef USE_ANISOTROPY
			vec3 retroIBLRadiance = getIBLAnisotropyRetroRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
		#else
			vec3 retroIBLRadiance = getIBLRetroRadiance( geometryViewDir, geometryNormal, material.roughness );
		#endif
		iblRadiance = mix( iblRadiance, retroIBLRadiance, saturate( material.retroreflectivity ) );
	#endif
	radiance += iblRadiance;
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,Xm=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,qm=`#ifdef USE_LIGHT_PROBES_GRID
uniform highp sampler3D probesSH;
uniform vec3 probesMin;
uniform vec3 probesMax;
uniform vec3 probesResolution;
vec3 getLightProbeGridIrradiance( vec3 worldPos, vec3 worldNormal ) {
	vec3 res = probesResolution;
	vec3 gridRange = probesMax - probesMin;
	vec3 resMinusOne = res - 1.0;
	vec3 probeSpacing = gridRange / resMinusOne;
	vec3 samplePos = worldPos + worldNormal * probeSpacing * 0.5;
	vec3 uvw = clamp( ( samplePos - probesMin ) / gridRange, 0.0, 1.0 );
	uvw = uvw * resMinusOne / res + 0.5 / res;
	float nz          = res.z;
	float paddedSlices = nz + 2.0;
	float atlasDepth  = 7.0 * paddedSlices;
	float uvZBase     = uvw.z * nz + 1.0;
	vec4 s0 = texture( probesSH, vec3( uvw.xy, ( uvZBase                       ) / atlasDepth ) );
	vec4 s1 = texture( probesSH, vec3( uvw.xy, ( uvZBase +       paddedSlices   ) / atlasDepth ) );
	vec4 s2 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 2.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s3 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 3.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s4 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 4.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s5 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 5.0 * paddedSlices   ) / atlasDepth ) );
	vec4 s6 = texture( probesSH, vec3( uvw.xy, ( uvZBase + 6.0 * paddedSlices   ) / atlasDepth ) );
	vec3 c0 = s0.xyz;
	vec3 c1 = vec3( s0.w, s1.xy );
	vec3 c2 = vec3( s1.zw, s2.x );
	vec3 c3 = s2.yzw;
	vec3 c4 = s3.xyz;
	vec3 c5 = vec3( s3.w, s4.xy );
	vec3 c6 = vec3( s4.zw, s5.x );
	vec3 c7 = s5.yzw;
	vec3 c8 = s6.xyz;
	float x = worldNormal.x, y = worldNormal.y, z = worldNormal.z;
	vec3 result = c0 * 0.886227;
	result += c1 * 2.0 * 0.511664 * y;
	result += c2 * 2.0 * 0.511664 * z;
	result += c3 * 2.0 * 0.511664 * x;
	result += c4 * 2.0 * 0.429043 * x * y;
	result += c5 * 2.0 * 0.429043 * y * z;
	result += c6 * ( 0.743125 * z * z - 0.247708 );
	result += c7 * 2.0 * 0.429043 * x * z;
	result += c8 * 0.429043 * ( x * x - y * y );
	return max( result, vec3( 0.0 ) );
}
#endif`,Ym=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Zm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,$m=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Jm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Km=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,jm=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Qm=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,t0=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,e0=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,n0=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,i0=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,s0=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,r0=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,a0=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,o0=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,l0=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#ifdef DOUBLE_SIDED
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#ifdef DOUBLE_SIDED
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,c0=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#if defined( USE_PACKED_NORMALMAP )
		mapN = vec3( mapN.xy, sqrt( saturate( 1.0 - dot( mapN.xy, mapN.xy ) ) ) );
	#endif
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,h0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,u0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,d0=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,f0=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,p0=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,m0=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,g0=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,_0=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,x0=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,v0=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	#ifdef USE_REVERSED_DEPTH_BUFFER
	
		return depth * ( far - near ) - far;
	#else
		return depth * ( near - far ) - near;
	#endif
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	
	#ifdef USE_REVERSED_DEPTH_BUFFER
		return ( near * far ) / ( ( near - far ) * depth - near );
	#else
		return ( near * far ) / ( ( far - near ) * depth - far );
	#endif
}`,y0=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,M0=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,S0=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,b0=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,w0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,T0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,A0=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		#define SUN_LIGHT_CASCADES 2
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#else
			uniform sampler2D sunShadowMap[ NUM_SUN_LIGHT_SHADOWS ];
		#endif
		uniform mat4 sunShadowMatrix[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		uniform vec4 sunShadowCascade[ NUM_SUN_LIGHT_SHADOWS * SUN_LIGHT_CASCADES ];
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
		struct SunLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SunLightShadow sunLightShadows[ NUM_SUN_LIGHT_SHADOWS ];
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#else
			uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		#endif
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform sampler2DShadow spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#else
			uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		#endif
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#if defined( SHADOWMAP_TYPE_PCF )
			uniform samplerCubeShadow pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#elif defined( SHADOWMAP_TYPE_BASIC )
			uniform samplerCube pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		#endif
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float interleavedGradientNoise( vec2 position ) {
			return fract( 52.9829189 * fract( dot( position, vec2( 0.06711056, 0.00583715 ) ) ) );
		}
		vec2 vogelDiskSample( int sampleIndex, int samplesCount, float phi ) {
			const float goldenAngle = 2.399963229728653;
			float r = sqrt( ( float( sampleIndex ) + 0.5 ) / float( samplesCount ) );
			float theta = float( sampleIndex ) * goldenAngle + phi;
			return vec2( cos( theta ), sin( theta ) ) * r;
		}
	#endif
	#if defined( SHADOWMAP_TYPE_PCF )
		float getShadow( sampler2DShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			shadowCoord.z += shadowBias;
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
				float radius = shadowRadius * texelSize.x;
				float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
				shadow = (
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 0, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 1, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 2, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 3, 5, phi ) * radius, shadowCoord.z ) ) +
					texture( shadowMap, vec3( shadowCoord.xy + vogelDiskSample( 4, 5, phi ) * radius, shadowCoord.z ) )
				) * 0.2;
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#elif defined( SHADOWMAP_TYPE_VSM )
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				vec2 distribution = texture2D( shadowMap, shadowCoord.xy ).rg;
				float mean = distribution.x;
				float variance = distribution.y * distribution.y;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					float hard_shadow = step( mean, shadowCoord.z );
				#else
					float hard_shadow = step( shadowCoord.z, mean );
				#endif
				
				if ( hard_shadow == 1.0 ) {
					shadow = 1.0;
				} else {
					variance = max( variance, 0.0000001 );
					float d = shadowCoord.z - mean;
					float p_max = variance / ( variance + d * d );
					p_max = clamp( ( p_max - 0.3 ) / 0.65, 0.0, 1.0 );
					shadow = max( hard_shadow, p_max );
				}
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#else
		float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
			float shadow = 1.0;
			shadowCoord.xyz /= shadowCoord.w;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				shadowCoord.z -= shadowBias;
			#else
				shadowCoord.z += shadowBias;
			#endif
			bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
			bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
			if ( frustumTest ) {
				float depth = texture2D( shadowMap, shadowCoord.xy ).r;
				#ifdef USE_REVERSED_DEPTH_BUFFER
					shadow = step( depth, shadowCoord.z );
				#else
					shadow = step( shadowCoord.z, depth );
				#endif
			}
			return mix( 1.0, shadow, shadowIntensity );
		}
	#endif
	#if NUM_SUN_LIGHT_SHADOWS > 0
		float getSunShadow(
			#if defined( SHADOWMAP_TYPE_PCF )
				sampler2DShadow shadowMap,
			#else
				sampler2D shadowMap,
			#endif
			SunLightShadow sunLightShadow,
			int shadowIndex
		) {
			vec4 shadowWorldPosition = vec4( vSunShadowWorldPosition.xyz + vSunShadowWorldNormal * sunLightShadow.shadowNormalBias, 1.0 );
			float viewDepth = vSunShadowWorldPosition.w;
			int cascadeOffset = shadowIndex * SUN_LIGHT_CASCADES;
			float shadow = 1.0;
			for ( int i = SUN_LIGHT_CASCADES - 1; i >= 0; i -- ) {
				vec4 cascade = sunShadowCascade[ cascadeOffset + i ];
				if ( viewDepth >= cascade.x && viewDepth < cascade.y ) {
					float cascadeShadow = getShadow(
						shadowMap,
						sunLightShadow.shadowMapSize,
						sunLightShadow.shadowIntensity,
						sunLightShadow.shadowBias,
						sunLightShadow.shadowRadius,
						sunShadowMatrix[ cascadeOffset + i ] * shadowWorldPosition
					);
					shadow = mix( cascadeShadow, shadow, smoothstep( cascade.z, cascade.y, viewDepth ) );
				}
			}
			return shadow;
		}
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	#if defined( SHADOWMAP_TYPE_PCF )
	float getPointShadow( samplerCubeShadow shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 bd3D = normalize( lightToPosition );
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			#ifdef USE_REVERSED_DEPTH_BUFFER
				float dp = ( shadowCameraNear * ( shadowCameraFar - viewSpaceZ ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp -= shadowBias;
			#else
				float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
				dp += shadowBias;
			#endif
			float texelSize = shadowRadius / shadowMapSize.x;
			vec3 absDir = abs( bd3D );
			vec3 tangent = absDir.x > absDir.z ? vec3( 0.0, 1.0, 0.0 ) : vec3( 1.0, 0.0, 0.0 );
			tangent = normalize( cross( bd3D, tangent ) );
			vec3 bitangent = cross( bd3D, tangent );
			float phi = interleavedGradientNoise( gl_FragCoord.xy ) * PI2;
			vec2 sample0 = vogelDiskSample( 0, 5, phi );
			vec2 sample1 = vogelDiskSample( 1, 5, phi );
			vec2 sample2 = vogelDiskSample( 2, 5, phi );
			vec2 sample3 = vogelDiskSample( 3, 5, phi );
			vec2 sample4 = vogelDiskSample( 4, 5, phi );
			shadow = (
				texture( shadowMap, vec4( bd3D + ( tangent * sample0.x + bitangent * sample0.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample1.x + bitangent * sample1.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample2.x + bitangent * sample2.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample3.x + bitangent * sample3.y ) * texelSize, dp ) ) +
				texture( shadowMap, vec4( bd3D + ( tangent * sample4.x + bitangent * sample4.y ) * texelSize, dp ) )
			) * 0.2;
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#elif defined( SHADOWMAP_TYPE_BASIC )
	float getPointShadow( samplerCube shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		vec3 absVec = abs( lightToPosition );
		float viewSpaceZ = max( max( absVec.x, absVec.y ), absVec.z );
		if ( viewSpaceZ - shadowCameraFar <= 0.0 && viewSpaceZ - shadowCameraNear >= 0.0 ) {
			float dp = ( shadowCameraFar * ( viewSpaceZ - shadowCameraNear ) ) / ( viewSpaceZ * ( shadowCameraFar - shadowCameraNear ) );
			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			float depth = textureCube( shadowMap, bd3D ).r;
			#ifdef USE_REVERSED_DEPTH_BUFFER
				depth = 1.0 - depth;
			#endif
			shadow = step( dp, depth );
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	#endif
	#endif
#endif`,E0=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
		varying vec4 vSunShadowWorldPosition;
		varying vec3 vSunShadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,C0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	#ifdef HAS_NORMAL
		vec3 shadowWorldNormal = transformNormalByInverseViewMatrix( transformedNormal, viewMatrix );
	#else
		vec3 shadowWorldNormal = vec3( 0.0 );
	#endif
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_SUN_LIGHT_SHADOWS > 0
		vSunShadowWorldPosition = vec4( worldPosition.xyz, - mvPosition.z );
		vSunShadowWorldNormal = shadowWorldNormal;
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,R0=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_SUN_LIGHT_SHADOWS > 0
	SunLightShadow sunLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SUN_LIGHT_SHADOWS; i ++ ) {
		sunLight = sunLightShadows[ i ];
		shadow *= receiveShadow ? getSunShadow( sunShadowMap[ i ], sunLight, UNROLLED_LOOP_INDEX ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0 && ( defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_BASIC ) )
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,P0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,I0=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,L0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,D0=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,N0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,U0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,F0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,O0=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,B0=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = transformNormalByInverseViewMatrix( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseContribution, material.specularColorBlended, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,z0=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,k0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,V0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,G0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,H0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,W0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,X0=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,q0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Y0=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vWorldDirection );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Z0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,$0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,J0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,K0=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,j0=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Q0=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = vec4( dist, 0.0, 0.0, 1.0 );
}`,tg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,eg=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,ng=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,ig=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,sg=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,rg=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ag=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,og=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,lg=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,cg=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,hg=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,ug=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( normalize( normal ) * 0.5 + 0.5, diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,dg=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,fg=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,pg=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,mg=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_RETROREFLECTION
	uniform float retroreflectivity;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
 
		outgoingLight = outgoingLight + sheenSpecularDirect + sheenSpecularIndirect;
 
 	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,gg=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,_g=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,xg=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,vg=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,yg=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Mg=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Sg=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,bg=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,ge={alphahash_fragment:Wp,alphahash_pars_fragment:Xp,alphamap_fragment:qp,alphamap_pars_fragment:Yp,alphatest_fragment:Zp,alphatest_pars_fragment:$p,aomap_fragment:Jp,aomap_pars_fragment:Kp,batching_pars_vertex:jp,batching_vertex:Qp,begin_vertex:tm,beginnormal_vertex:em,bsdfs:nm,iridescence_fragment:im,bumpmap_pars_fragment:sm,clipping_planes_fragment:rm,clipping_planes_pars_fragment:am,clipping_planes_pars_vertex:om,clipping_planes_vertex:lm,color_fragment:cm,color_pars_fragment:hm,color_pars_vertex:um,color_vertex:dm,common:fm,cube_uv_reflection_fragment:pm,defaultnormal_vertex:mm,displacementmap_pars_vertex:gm,displacementmap_vertex:_m,emissivemap_fragment:xm,emissivemap_pars_fragment:vm,colorspace_fragment:ym,colorspace_pars_fragment:Mm,envmap_fragment:Sm,envmap_common_pars_fragment:bm,envmap_pars_fragment:wm,envmap_pars_vertex:Tm,envmap_physical_pars_fragment:Fm,envmap_vertex:Am,fog_vertex:Em,fog_pars_vertex:Cm,fog_fragment:Rm,fog_pars_fragment:Pm,gradientmap_pars_fragment:Im,lightmap_pars_fragment:Lm,lights_lambert_fragment:Dm,lights_lambert_pars_fragment:Nm,lights_pars_begin:Um,lights_toon_fragment:Om,lights_toon_pars_fragment:Bm,lights_phong_fragment:zm,lights_phong_pars_fragment:km,lights_physical_fragment:Vm,lights_physical_pars_fragment:Gm,lights_fragment_begin:Hm,lights_fragment_maps:Wm,lights_fragment_end:Xm,lightprobes_pars_fragment:qm,logdepthbuf_fragment:Ym,logdepthbuf_pars_fragment:Zm,logdepthbuf_pars_vertex:$m,logdepthbuf_vertex:Jm,map_fragment:Km,map_pars_fragment:jm,map_particle_fragment:Qm,map_particle_pars_fragment:t0,metalnessmap_fragment:e0,metalnessmap_pars_fragment:n0,morphinstance_vertex:i0,morphcolor_vertex:s0,morphnormal_vertex:r0,morphtarget_pars_vertex:a0,morphtarget_vertex:o0,normal_fragment_begin:l0,normal_fragment_maps:c0,normal_pars_fragment:h0,normal_pars_vertex:u0,normal_vertex:d0,normalmap_pars_fragment:f0,clearcoat_normal_fragment_begin:p0,clearcoat_normal_fragment_maps:m0,clearcoat_pars_fragment:g0,iridescence_pars_fragment:_0,opaque_fragment:x0,packing:v0,premultiplied_alpha_fragment:y0,project_vertex:M0,dithering_fragment:S0,dithering_pars_fragment:b0,roughnessmap_fragment:w0,roughnessmap_pars_fragment:T0,shadowmap_pars_fragment:A0,shadowmap_pars_vertex:E0,shadowmap_vertex:C0,shadowmask_pars_fragment:R0,skinbase_vertex:P0,skinning_pars_vertex:I0,skinning_vertex:L0,skinnormal_vertex:D0,specularmap_fragment:N0,specularmap_pars_fragment:U0,tonemapping_fragment:F0,tonemapping_pars_fragment:O0,transmission_fragment:B0,transmission_pars_fragment:z0,uv_pars_fragment:k0,uv_pars_vertex:V0,uv_vertex:G0,worldpos_vertex:H0,background_vert:W0,background_frag:X0,backgroundCube_vert:q0,backgroundCube_frag:Y0,cube_vert:Z0,cube_frag:$0,depth_vert:J0,depth_frag:K0,distance_vert:j0,distance_frag:Q0,equirect_vert:tg,equirect_frag:eg,linedashed_vert:ng,linedashed_frag:ig,meshbasic_vert:sg,meshbasic_frag:rg,meshlambert_vert:ag,meshlambert_frag:og,meshmatcap_vert:lg,meshmatcap_frag:cg,meshnormal_vert:hg,meshnormal_frag:ug,meshphong_vert:dg,meshphong_frag:fg,meshphysical_vert:pg,meshphysical_frag:mg,meshtoon_vert:gg,meshtoon_frag:_g,points_vert:xg,points_frag:vg,shadow_vert:yg,shadow_frag:Mg,sprite_vert:Sg,sprite_frag:bg},Lt={common:{diffuse:{value:new jt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ae},alphaMap:{value:null},alphaMapTransform:{value:new ae},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ae}},envmap:{envMap:{value:null},envMapRotation:{value:new ae},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ae}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ae}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ae},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ae},normalScale:{value:new Bt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ae},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ae}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ae}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ae}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new jt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new N},probesMax:{value:new N},probesResolution:{value:new N}},points:{diffuse:{value:new jt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ae},alphaTest:{value:0},uvTransform:{value:new ae}},sprite:{diffuse:{value:new jt(16777215)},opacity:{value:1},center:{value:new Bt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ae},alphaMap:{value:null},alphaMapTransform:{value:new ae},alphaTest:{value:0}}},Ui={basic:{uniforms:Fn([Lt.common,Lt.specularmap,Lt.envmap,Lt.aomap,Lt.lightmap,Lt.fog]),vertexShader:ge.meshbasic_vert,fragmentShader:ge.meshbasic_frag},lambert:{uniforms:Fn([Lt.common,Lt.specularmap,Lt.envmap,Lt.aomap,Lt.lightmap,Lt.emissivemap,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,Lt.fog,Lt.lights,{emissive:{value:new jt(0)},envMapIntensity:{value:1}}]),vertexShader:ge.meshlambert_vert,fragmentShader:ge.meshlambert_frag},phong:{uniforms:Fn([Lt.common,Lt.specularmap,Lt.envmap,Lt.aomap,Lt.lightmap,Lt.emissivemap,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,Lt.fog,Lt.lights,{emissive:{value:new jt(0)},specular:{value:new jt(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:ge.meshphong_vert,fragmentShader:ge.meshphong_frag},standard:{uniforms:Fn([Lt.common,Lt.envmap,Lt.aomap,Lt.lightmap,Lt.emissivemap,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,Lt.roughnessmap,Lt.metalnessmap,Lt.fog,Lt.lights,{emissive:{value:new jt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ge.meshphysical_vert,fragmentShader:ge.meshphysical_frag},toon:{uniforms:Fn([Lt.common,Lt.aomap,Lt.lightmap,Lt.emissivemap,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,Lt.gradientmap,Lt.fog,Lt.lights,{emissive:{value:new jt(0)}}]),vertexShader:ge.meshtoon_vert,fragmentShader:ge.meshtoon_frag},matcap:{uniforms:Fn([Lt.common,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,Lt.fog,{matcap:{value:null}}]),vertexShader:ge.meshmatcap_vert,fragmentShader:ge.meshmatcap_frag},points:{uniforms:Fn([Lt.points,Lt.fog]),vertexShader:ge.points_vert,fragmentShader:ge.points_frag},dashed:{uniforms:Fn([Lt.common,Lt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ge.linedashed_vert,fragmentShader:ge.linedashed_frag},depth:{uniforms:Fn([Lt.common,Lt.displacementmap]),vertexShader:ge.depth_vert,fragmentShader:ge.depth_frag},normal:{uniforms:Fn([Lt.common,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,{opacity:{value:1}}]),vertexShader:ge.meshnormal_vert,fragmentShader:ge.meshnormal_frag},sprite:{uniforms:Fn([Lt.sprite,Lt.fog]),vertexShader:ge.sprite_vert,fragmentShader:ge.sprite_frag},background:{uniforms:{uvTransform:{value:new ae},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ge.background_vert,fragmentShader:ge.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ae}},vertexShader:ge.backgroundCube_vert,fragmentShader:ge.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ge.cube_vert,fragmentShader:ge.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ge.equirect_vert,fragmentShader:ge.equirect_frag},distance:{uniforms:Fn([Lt.common,Lt.displacementmap,{referencePosition:{value:new N},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ge.distance_vert,fragmentShader:ge.distance_frag},shadow:{uniforms:Fn([Lt.lights,Lt.fog,{color:{value:new jt(0)},opacity:{value:1}}]),vertexShader:ge.shadow_vert,fragmentShader:ge.shadow_frag}};Ui.physical={uniforms:Fn([Ui.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ae},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ae},clearcoatNormalScale:{value:new Bt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ae},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ae},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ae},sheen:{value:0},sheenColor:{value:new jt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ae},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ae},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ae},transmissionSamplerSize:{value:new Bt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ae},attenuationDistance:{value:0},attenuationColor:{value:new jt(0)},specularColor:{value:new jt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ae},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ae},anisotropyVector:{value:new Bt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ae}}]),vertexShader:ge.meshphysical_vert,fragmentShader:ge.meshphysical_frag};var ic={r:0,b:0,g:0},wg=new Be,sf=new ae;sf.set(-1,0,0,0,1,0,0,0,1);function Tg(i,t,e,n,s,r){let a=new jt(0),o=s===!0?0:1,l,c,d=null,m=0,u=null;function f(C){let D=C.isScene===!0?C.background:null;if(D&&D.isTexture){let A=C.backgroundBlurriness>0;D=t.get(D,A)}return D}function M(C){let D=!1,A=f(C);A===null?x(a,o):A&&A.isColor&&(x(A,1),D=!0);let P=i.xr.getEnvironmentBlendMode();P==="additive"?e.buffers.color.setClear(0,0,0,1,r):P==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,r),(i.autoClear||D)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function T(C,D){let A=f(D);A&&(A.isCubeTexture||A.mapping===ba)?(c===void 0&&(c=new ce(new Mi(1,1,1),new _n({name:"BackgroundCubeMaterial",uniforms:zs(Ui.backgroundCube.uniforms),vertexShader:Ui.backgroundCube.vertexShader,fragmentShader:Ui.backgroundCube.fragmentShader,side:Sn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(P,R,U){this.matrixWorld.copyPosition(U.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=A,c.material.uniforms.backgroundBlurriness.value=D.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=D.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(wg.makeRotationFromEuler(D.backgroundRotation)).transpose(),A.isCubeTexture&&A.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(sf),c.material.toneMapped=we.getTransfer(A.colorSpace)!==De,(d!==A||m!==A.version||u!==i.toneMapping)&&(c.material.needsUpdate=!0,d=A,m=A.version,u=i.toneMapping),c.layers.enableAll(),C.unshift(c,c.geometry,c.material,0,0,null)):A&&A.isTexture&&(l===void 0&&(l=new ce(new qi(2,2),new _n({name:"BackgroundMaterial",uniforms:zs(Ui.background.uniforms),vertexShader:Ui.background.vertexShader,fragmentShader:Ui.background.fragmentShader,side:xs,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=A,l.material.uniforms.backgroundIntensity.value=D.backgroundIntensity,l.material.toneMapped=we.getTransfer(A.colorSpace)!==De,A.matrixAutoUpdate===!0&&A.updateMatrix(),l.material.uniforms.uvTransform.value.copy(A.matrix),(d!==A||m!==A.version||u!==i.toneMapping)&&(l.material.needsUpdate=!0,d=A,m=A.version,u=i.toneMapping),l.layers.enableAll(),C.unshift(l,l.geometry,l.material,0,0,null))}function x(C,D){C.getRGB(ic,Th(i)),e.buffers.color.setClear(ic.r,ic.g,ic.b,D,r)}function p(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(C,D=1){a.set(C),o=D,x(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(C){o=C,x(a,o)},render:M,addToRenderList:T,dispose:p}}function Ag(i,t){let e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=u(null),r=s,a=!1;function o(H,q,Q,k,et){let lt=!1,rt=m(H,k,Q,q);r!==rt&&(r=rt,c(r.object)),lt=f(H,k,Q,et),lt&&M(H,k,Q,et),et!==null&&t.update(et,i.ELEMENT_ARRAY_BUFFER),(lt||a)&&(a=!1,A(H,q,Q,k),et!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(et).buffer))}function l(){return i.createVertexArray()}function c(H){return i.bindVertexArray(H)}function d(H){return i.deleteVertexArray(H)}function m(H,q,Q,k){let et=k.wireframe===!0,lt=n[q.id];lt===void 0&&(lt={},n[q.id]=lt);let rt=H.isInstancedMesh===!0?H.id:0,J=lt[rt];J===void 0&&(J={},lt[rt]=J);let st=J[Q.id];st===void 0&&(st={},J[Q.id]=st);let mt=st[et];return mt===void 0&&(mt=u(l()),st[et]=mt),mt}function u(H){let q=[],Q=[],k=[];for(let et=0;et<e;et++)q[et]=0,Q[et]=0,k[et]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:q,enabledAttributes:Q,attributeDivisors:k,object:H,attributes:{},index:null}}function f(H,q,Q,k){let et=r.attributes,lt=q.attributes,rt=0,J=Q.getAttributes();for(let st in J)if(J[st].location>=0){let yt=et[st],$t=lt[st];if($t===void 0&&(st==="instanceMatrix"&&H.instanceMatrix&&($t=H.instanceMatrix),st==="instanceColor"&&H.instanceColor&&($t=H.instanceColor)),yt===void 0||yt.attribute!==$t||$t&&yt.data!==$t.data)return!0;rt++}return r.attributesNum!==rt||r.index!==k}function M(H,q,Q,k){let et={},lt=q.attributes,rt=0,J=Q.getAttributes();for(let st in J)if(J[st].location>=0){let yt=lt[st];yt===void 0&&(st==="instanceMatrix"&&H.instanceMatrix&&(yt=H.instanceMatrix),st==="instanceColor"&&H.instanceColor&&(yt=H.instanceColor));let $t={};$t.attribute=yt,yt&&yt.data&&($t.data=yt.data),et[st]=$t,rt++}r.attributes=et,r.attributesNum=rt,r.index=k}function T(){let H=r.newAttributes;for(let q=0,Q=H.length;q<Q;q++)H[q]=0}function x(H){p(H,0)}function p(H,q){let Q=r.newAttributes,k=r.enabledAttributes,et=r.attributeDivisors;Q[H]=1,k[H]===0&&(i.enableVertexAttribArray(H),k[H]=1),et[H]!==q&&(i.vertexAttribDivisor(H,q),et[H]=q)}function C(){let H=r.newAttributes,q=r.enabledAttributes;for(let Q=0,k=q.length;Q<k;Q++)q[Q]!==H[Q]&&(i.disableVertexAttribArray(Q),q[Q]=0)}function D(H,q,Q,k,et,lt,rt){rt===!0?i.vertexAttribIPointer(H,q,Q,et,lt):i.vertexAttribPointer(H,q,Q,k,et,lt)}function A(H,q,Q,k){T();let et=k.attributes,lt=Q.getAttributes(),rt=q.defaultAttributeValues;for(let J in lt){let st=lt[J];if(st.location>=0){let mt=et[J];if(mt===void 0&&(J==="instanceMatrix"&&H.instanceMatrix&&(mt=H.instanceMatrix),J==="instanceColor"&&H.instanceColor&&(mt=H.instanceColor)),mt!==void 0){let yt=mt.normalized,$t=mt.itemSize,Wt=t.get(mt);if(Wt===void 0)continue;let Ae=Wt.buffer,_e=Wt.type,fe=Wt.bytesPerElement,ct=_e===i.INT||_e===i.UNSIGNED_INT||mt.gpuType===xl;if(mt.isInterleavedBufferAttribute){let gt=mt.data,St=gt.stride,Kt=mt.offset;if(gt.isInstancedInterleavedBuffer){for(let Ot=0;Ot<st.locationSize;Ot++)p(st.location+Ot,gt.meshPerAttribute);H.isInstancedMesh!==!0&&k._maxInstanceCount===void 0&&(k._maxInstanceCount=gt.meshPerAttribute*gt.count)}else for(let Ot=0;Ot<st.locationSize;Ot++)x(st.location+Ot);i.bindBuffer(i.ARRAY_BUFFER,Ae);for(let Ot=0;Ot<st.locationSize;Ot++)D(st.location+Ot,$t/st.locationSize,_e,yt,St*fe,(Kt+$t/st.locationSize*Ot)*fe,ct)}else{if(mt.isInstancedBufferAttribute){for(let gt=0;gt<st.locationSize;gt++)p(st.location+gt,mt.meshPerAttribute);H.isInstancedMesh!==!0&&k._maxInstanceCount===void 0&&(k._maxInstanceCount=mt.meshPerAttribute*mt.count)}else for(let gt=0;gt<st.locationSize;gt++)x(st.location+gt);i.bindBuffer(i.ARRAY_BUFFER,Ae);for(let gt=0;gt<st.locationSize;gt++)D(st.location+gt,$t/st.locationSize,_e,yt,$t*fe,$t/st.locationSize*gt*fe,ct)}}else if(rt!==void 0){let yt=rt[J];if(yt!==void 0)switch(yt.length){case 2:i.vertexAttrib2fv(st.location,yt);break;case 3:i.vertexAttrib3fv(st.location,yt);break;case 4:i.vertexAttrib4fv(st.location,yt);break;default:i.vertexAttrib1fv(st.location,yt)}}}}C()}function P(){I();for(let H in n){let q=n[H];for(let Q in q){let k=q[Q];for(let et in k){let lt=k[et];for(let rt in lt)d(lt[rt].object),delete lt[rt];delete k[et]}}delete n[H]}}function R(H){if(n[H.id]===void 0)return;let q=n[H.id];for(let Q in q){let k=q[Q];for(let et in k){let lt=k[et];for(let rt in lt)d(lt[rt].object),delete lt[rt];delete k[et]}}delete n[H.id]}function U(H){for(let q in n){let Q=n[q];for(let k in Q){let et=Q[k];if(et[H.id]===void 0)continue;let lt=et[H.id];for(let rt in lt)d(lt[rt].object),delete lt[rt];delete et[H.id]}}}function y(H){for(let q in n){let Q=n[q],k=H.isInstancedMesh===!0?H.id:0,et=Q[k];if(et!==void 0){for(let lt in et){let rt=et[lt];for(let J in rt)d(rt[J].object),delete rt[J];delete et[lt]}delete Q[k],Object.keys(Q).length===0&&delete n[q]}}}function I(){F(),a=!0,r!==s&&(r=s,c(r.object))}function F(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:I,resetDefaultState:F,dispose:P,releaseStatesOfGeometry:R,releaseStatesOfObject:y,releaseStatesOfProgram:U,initAttributes:T,enableAttribute:x,disableUnusedAttributes:C}}function Eg(i,t,e){let n;function s(l){n=l}function r(l,c){i.drawArrays(n,l,c),e.update(c,n,1)}function a(l,c,d){d!==0&&(i.drawArraysInstanced(n,l,c,d),e.update(c,n,d))}function o(l,c,d){if(d===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,d);let u=0;for(let f=0;f<d;f++)u+=c[f];e.update(u,n,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function Cg(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){let U=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(U.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(U){return!(U!==di&&n.convert(U)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(U){let y=U===Ti&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(U!==Zn&&U!==wi&&!y&&n.convert(U)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function l(U){if(U==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";U="mediump"}return U==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp",d=l(c);d!==c&&(Qt("WebGLRenderer:",c,"not supported, using",d,"instead."),c=d);let m=e.logarithmicDepthBuffer===!0,u=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control");e.reversedDepthBuffer===!0&&u===!1&&Qt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),M=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),T=i.getParameter(i.MAX_TEXTURE_SIZE),x=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),p=i.getParameter(i.MAX_VERTEX_ATTRIBS),C=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),D=i.getParameter(i.MAX_VARYING_VECTORS),A=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),P=i.getParameter(i.MAX_SAMPLES),R=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:m,reversedDepthBuffer:u,maxTextures:f,maxVertexTextures:M,maxTextureSize:T,maxCubemapSize:x,maxAttributes:p,maxVertexUniforms:C,maxVaryings:D,maxFragmentUniforms:A,maxSamples:P,samples:R}}function Rg(i){let t=this,e=null,n=0,s=!1,r=!1,a=new _i,o=new ae,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(m,u){let f=m.length!==0||u||n!==0||s;return s=u,n=m.length,f},this.beginShadows=function(){r=!0,d(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(m,u){e=d(m,u,0)},this.setState=function(m,u,f){let M=m.clippingPlanes,T=m.clipIntersection,x=m.clipShadows,p=i.get(m);if(!s||M===null||M.length===0||r&&!x)r?d(null):c();else{let C=r?0:n,D=C*4,A=p.clippingState||null;l.value=A,A=d(M,u,D,f);for(let P=0;P!==D;++P)A[P]=e[P];p.clippingState=A,this.numIntersection=T?this.numPlanes:0,this.numPlanes+=C}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function d(m,u,f,M){let T=m!==null?m.length:0,x=null;if(T!==0){if(x=l.value,M!==!0||x===null){let p=f+T*4,C=u.matrixWorldInverse;o.getNormalMatrix(C),(x===null||x.length<p)&&(x=new Float32Array(p));for(let D=0,A=f;D!==T;++D,A+=4)a.copy(m[D]).applyMatrix4(C,o),a.normal.toArray(x,A),x[A+3]=a.constant}l.value=x,l.needsUpdate=!0}return t.numPlanes=T,t.numIntersection=0,x}}var Ir=4,Pg=6,Ig=20,Lg=256,Ia=new Ar,Ud=new jt,Nh=null,Uh=0,Fh=0,Oh=!1,Dg=new N,ks=new N,rc=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,e=0,n=.1,s=100,r={}){let{size:a=256,position:o=Dg}=r;Nh=this._renderer.getRenderTarget(),Uh=this._renderer.getActiveCubeFace(),Fh=this._renderer.getActiveMipmapLevel(),Oh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(t,n,s,l,o),e>0&&this._blur(l,0,0,e),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Bd(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Od(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(Nh,Uh,Fh),this._renderer.xr.enabled=Oh,t.scissorTest=!1,Pr(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===ys||t.mapping===Bs?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),Nh=this._renderer.getRenderTarget(),Uh=this._renderer.getActiveCubeFace(),Fh=this._renderer.getActiveMipmapLevel(),Oh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:Cn,minFilter:Cn,generateMipmaps:!1,type:Ti,format:di,colorSpace:Qr,depthBuffer:!1},s=Fd(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Fd(t,e,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=Ng(r)),this._blurMaterial=Fg(r,t,e),this._ggxMaterial=Ug(r,t,e)}return s}_compileMaterial(t){let e=new ce(new Le,t);this._renderer.compile(e,Ia)}_sceneToCubeUV(t,e,n,s,r){let l=new Dn(90,1,e,n),c=[1,-1,1,1,1,1],d=[1,1,1,-1,-1,-1],m=this._renderer,u=m.autoClear,f=m.toneMapping;m.getClearColor(Ud),m.toneMapping=Si,m.autoClear=!1,m.state.buffers.depth.getReversed()&&(m.setRenderTarget(s),m.clearDepth(),m.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new ce(new Mi,new rn({name:"PMREM.Background",side:Sn,depthWrite:!1,depthTest:!1})));let T=this._backgroundBox,x=T.material,p=!1,C=t.background;C?C.isColor&&(x.color.copy(C),t.background=null,p=!0):(x.color.copy(Ud),p=!0);for(let D=0;D<6;D++){let A=D%3;A===0?(l.up.set(0,c[D],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+d[D],r.y,r.z)):A===1?(l.up.set(0,0,c[D]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+d[D],r.z)):(l.up.set(0,c[D],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+d[D]));let P=this._cubeSize;Pr(s,A*P,D>2?P:0,P,P),m.setRenderTarget(s),p&&m.render(T,l),m.render(t,l)}m.toneMapping=f,m.autoClear=u,t.background=C}_textureToCubeUV(t,e){let n=this._renderer,s=t.mapping===ys||t.mapping===Bs;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Bd()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Od());let r=s?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;let o=r.uniforms;o.envMap.value=t;let l=this._cubeSize;Pr(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(a,Ia)}_applyPMREM(t){let e=this._renderer,n=e.autoClear;e.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(t,r-1,r);e.autoClear=n}_applyGGXFilter(t,e,n){let s=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let l=a.uniforms,c=n/(this._lodMeshes.length-1),d=e/(this._lodMeshes.length-1),m=Math.sqrt(c*c-d*d),u=c*1.25,f=m*u,{_lodMax:M}=this,T=this._sizeLods[n],x=3*T*(n>M-Ir?n-M+Ir:0),p=4*(this._cubeSize-T);l.envMap.value=t.texture,l.roughness.value=f,l.mipInt.value=M-e,Pr(r,x,p,3*T,2*T),s.setRenderTarget(r),s.render(o,Ia),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=M-n,Pr(t,x,p,3*T,2*T),s.setRenderTarget(t),s.render(o,Ia)}_blur(t,e,n,s){let r=this._pingPongRenderTarget,a=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(t,r,e,n,a),this._blurPass(r,t,n,n,a)}_blurPass(t,e,n,s,r){let a=this._renderer,o=this._blurMaterial,l=this._lodMeshes[s];l.material=o;let c=o.uniforms;c.envMap.value=t.texture,c.sigma.value=r,c.mipInt.value=this._lodMax-n;let d=this._sizeLods[s],m=3*d*(s>this._lodMax-Ir?s-this._lodMax+Ir:0),u=4*(this._cubeSize-d);Pr(e,m,u,3*d,2*d),a.setRenderTarget(e),a.render(l,Ia)}};function Ng(i){let t=[],e=[],n=i,s=i-Ir+1+Pg;for(let r=0;r<s;r++){let a=Math.pow(2,n);t.push(a);let o=1/(a-2),l=-o,c=1+o,d=[l,l,c,l,c,c,l,l,c,c,l,c],m=6,u=6,f=3,M=new Float32Array(f*u*m),T=new Float32Array(f*u*m);for(let p=0;p<m;p++){let C=p%3*2/3-1,D=p>2?0:-1,A=[C,D,0,C+2/3,D,0,C+2/3,D+1,0,C,D,0,C+2/3,D+1,0,C,D+1,0];M.set(A,f*u*p);for(let P=0;P<u;P++){let R=d[P*2]*2-1,U=d[P*2+1]*2-1;p===0?ks.set(1,U,R):p===1?ks.set(-R,1,-U):p===2?ks.set(-R,U,1):p===3?ks.set(-1,U,-R):p===4?ks.set(-R,-1,U):ks.set(R,U,-1),ks.toArray(T,(p*u+P)*f)}}let x=new Le;x.setAttribute("position",new ni(M,f)),x.setAttribute("outputDirection",new ni(T,f)),e.push(new ce(x,null)),n>Ir&&n--}return{lodMeshes:e,sizeLods:t}}function Fd(i,t,e){let n=new qn(i,t,e);return n.texture.mapping=ba,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Pr(i,t,e,n,s){i.viewport.set(t,e,n,s),i.scissor.set(t,e,n,s)}function Ug(i,t,e){return new _n({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:Lg,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:lc(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float roughness;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359

			// Van der Corput radical inverse
			float radicalInverse_VdC(uint bits) {
				bits = (bits << 16u) | (bits >> 16u);
				bits = ((bits & 0x55555555u) << 1u) | ((bits & 0xAAAAAAAAu) >> 1u);
				bits = ((bits & 0x33333333u) << 2u) | ((bits & 0xCCCCCCCCu) >> 2u);
				bits = ((bits & 0x0F0F0F0Fu) << 4u) | ((bits & 0xF0F0F0F0u) >> 4u);
				bits = ((bits & 0x00FF00FFu) << 8u) | ((bits & 0xFF00FF00u) >> 8u);
				return float(bits) * 2.3283064365386963e-10; // / 0x100000000
			}

			// Hammersley sequence
			vec2 hammersley(uint i, uint N) {
				return vec2(float(i) / float(N), radicalInverse_VdC(i));
			}

			// GGX VNDF importance sampling (Eric Heitz 2018)
			// "Sampling the GGX Distribution of Visible Normals"
			// https://jcgt.org/published/0007/04/01/
			vec3 importanceSampleGGX_VNDF(vec2 Xi, vec3 V, float roughness) {
				float alpha = roughness * roughness;

				// Section 4.1: Orthonormal basis
				vec3 T1 = vec3(1.0, 0.0, 0.0);
				vec3 T2 = cross(V, T1);

				// Section 4.2: Parameterization of projected area
				float r = sqrt(Xi.x);
				float phi = 2.0 * PI * Xi.y;
				float t1 = r * cos(phi);
				float t2 = r * sin(phi);
				float s = 0.5 * (1.0 + V.z);
				t2 = (1.0 - s) * sqrt(1.0 - t1 * t1) + s * t2;

				// Section 4.3: Reprojection onto hemisphere
				vec3 Nh = t1 * T1 + t2 * T2 + sqrt(max(0.0, 1.0 - t1 * t1 - t2 * t2)) * V;

				// Section 3.4: Transform back to ellipsoid configuration
				return normalize(vec3(alpha * Nh.x, alpha * Nh.y, max(0.0, Nh.z)));
			}

			void main() {
				vec3 N = normalize(vOutputDirection);
				vec3 V = N; // Assume view direction equals normal for pre-filtering

				vec3 prefilteredColor = vec3(0.0);
				float totalWeight = 0.0;

				// For very low roughness, just sample the environment directly
				if (roughness < 0.001) {
					gl_FragColor = vec4(bilinearCubeUV(envMap, N, mipInt), 1.0);
					return;
				}

				// Tangent space basis for VNDF sampling
				vec3 up = abs(N.z) < 0.999 ? vec3(0.0, 0.0, 1.0) : vec3(1.0, 0.0, 0.0);
				vec3 tangent = normalize(cross(up, N));
				vec3 bitangent = cross(N, tangent);

				for(uint i = 0u; i < uint(GGX_SAMPLES); i++) {
					vec2 Xi = hammersley(i, uint(GGX_SAMPLES));

					// For PMREM, V = N, so in tangent space V is always (0, 0, 1)
					vec3 H_tangent = importanceSampleGGX_VNDF(Xi, vec3(0.0, 0.0, 1.0), roughness);

					// Transform H back to world space
					vec3 H = normalize(tangent * H_tangent.x + bitangent * H_tangent.y + N * H_tangent.z);
					vec3 L = normalize(2.0 * dot(V, H) * H - V);

					float NdotL = max(dot(N, L), 0.0);

					if(NdotL > 0.0) {
						// Sample environment at fixed mip level
						// VNDF importance sampling handles the distribution filtering
						vec3 sampleColor = bilinearCubeUV(envMap, L, mipInt);

						// Weight by NdotL for the split-sum approximation
						// VNDF PDF naturally accounts for the visible microfacet distribution
						prefilteredColor += sampleColor * NdotL;
						totalWeight += NdotL;
					}
				}

				if (totalWeight > 0.0) {
					prefilteredColor = prefilteredColor / totalWeight;
				}

				gl_FragColor = vec4(prefilteredColor, 1.0);
			}
		`,blending:Di,depthTest:!1,depthWrite:!1})}function Fg(i,t,e){return new _n({name:"SphericalGaussianBlur",defines:{SAMPLES:Ig,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:lc(),fragmentShader:`

			precision highp float;
			precision highp int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform float sigma;
			uniform float mipInt;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			#define PI 3.14159265359
			#define GOLDEN_ANGLE 2.39996322973

			void main() {

				if ( sigma == 0.0 ) {

					gl_FragColor = vec4( bilinearCubeUV( envMap, vOutputDirection, mipInt ), 1.0 );
					return;

				}

				vec3 outputDirection = normalize( vOutputDirection );

				vec3 up = abs( outputDirection.z ) < 0.999 ? vec3( 0.0, 0.0, 1.0 ) : vec3( 1.0, 0.0, 0.0 );
				vec3 tangent = normalize( cross( up, outputDirection ) );
				vec3 bitangent = cross( outputDirection, tangent );

				// Truncate the kernel at three standard deviations or at the antipode.
				float thetaMax = min( 3.0 * sigma, PI );
				float truncation = 1.0 - exp( - 0.5 * thetaMax * thetaMax / ( sigma * sigma ) );

				vec3 accumColor = vec3( 0.0 );
				float accumWeight = 0.0;

				for ( int i = 0; i < SAMPLES; i ++ ) {

					// Stratified inverse-CDF sampling of the Gaussian, placed on a golden-angle spiral.
					float stratum = ( float( i ) + 0.5 ) / float( SAMPLES );
					float theta = sigma * sqrt( - 2.0 * log( 1.0 - stratum * truncation ) );
					float phi = float( i ) * GOLDEN_ANGLE;

					vec3 offset = cos( phi ) * tangent + sin( phi ) * bitangent;
					vec3 sampleDirection = cos( theta ) * outputDirection + sin( theta ) * offset;

					// Correct the planar sample density to solid angle.
					float weight = sin( theta ) / theta;

					accumColor += weight * bilinearCubeUV( envMap, sampleDirection, mipInt );
					accumWeight += weight;

				}

				gl_FragColor = vec4( accumColor / accumWeight, 1.0 );

			}
		`,blending:Di,depthTest:!1,depthWrite:!1})}function Od(){return new _n({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:lc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Di,depthTest:!1,depthWrite:!1})}function Bd(){return new _n({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:lc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Di,depthTest:!1,depthWrite:!1})}function lc(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var ac=class extends qn{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new oa(s),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new Mi(5,5,5),r=new _n({name:"CubemapFromEquirect",uniforms:zs(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Sn,blending:Di});r.uniforms.tEquirect.value=e;let a=new ce(s,r),o=e.minFilter;return e.minFilter===Ms&&(e.minFilter=Cn),new ul(1,10,this).update(t,a),e.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(t,e=!0,n=!0,s=!0){let r=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,n,s);t.setRenderTarget(r)}};function Og(i){let t=new WeakMap,e=new WeakMap,n=null;function s(u,f=!1){return u==null?null:f?a(u):r(u)}function r(u){if(u&&u.isTexture){let f=u.mapping;if(f===ml||f===gl)if(t.has(u)){let M=t.get(u).texture;return o(M,u.mapping)}else{let M=u.image;if(M&&M.height>0){let T=new ac(M.height);return T.fromEquirectangularTexture(i,u),t.set(u,T),u.addEventListener("dispose",c),o(T.texture,u.mapping)}else return null}}return u}function a(u){if(u&&u.isTexture){let f=u.mapping,M=f===ml||f===gl,T=f===ys||f===Bs;if(M||T){let x=e.get(u),p=x!==void 0?x.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==p)return n===null&&(n=new rc(i)),x=M?n.fromEquirectangular(u,x):n.fromCubemap(u,x),x.texture.pmremVersion=u.pmremVersion,e.set(u,x),x.texture;if(x!==void 0)return x.texture;{let C=u.image;return M&&C&&C.height>0||T&&C&&l(C)?(n===null&&(n=new rc(i)),x=M?n.fromEquirectangular(u):n.fromCubemap(u),x.texture.pmremVersion=u.pmremVersion,e.set(u,x),u.addEventListener("dispose",d),x.texture):null}}}return u}function o(u,f){return f===ml?u.mapping=ys:f===gl&&(u.mapping=Bs),u}function l(u){let f=0,M=6;for(let T=0;T<M;T++)u[T]!==void 0&&f++;return f===M}function c(u){let f=u.target;f.removeEventListener("dispose",c);let M=t.get(f);M!==void 0&&(t.delete(f),M.dispose())}function d(u){let f=u.target;f.removeEventListener("dispose",d);let M=e.get(f);M!==void 0&&(e.delete(f),M.dispose())}function m(){t=new WeakMap,e=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:m}}function Bg(i){let t={};function e(n){if(t[n]!==void 0)return t[n];let s=i.getExtension(n);return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){let s=e(n);return s===null&&Is("WebGLRenderer: "+n+" extension not supported."),s}}}function zg(i,t,e,n){let s={},r=new WeakMap;function a(m){let u=m.target;u.index!==null&&t.remove(u.index);for(let M in u.attributes)t.remove(u.attributes[M]);u.removeEventListener("dispose",a),delete s[u.id];let f=r.get(u);f&&(t.remove(f),r.delete(u)),n.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,e.memory.geometries--}function o(m,u){return s[u.id]===!0||(u.addEventListener("dispose",a),s[u.id]=!0,e.memory.geometries++),u}function l(m){let u=m.attributes;for(let f in u)t.update(u[f],i.ARRAY_BUFFER)}function c(m){let u=[],f=m.index,M=m.attributes.position,T=0;if(M===void 0)return;if(f!==null){let C=f.array;T=f.version;for(let D=0,A=C.length;D<A;D+=3){let P=C[D+0],R=C[D+1],U=C[D+2];u.push(P,R,R,U,U,P)}}else{let C=M.array;T=M.version;for(let D=0,A=C.length/3-1;D<A;D+=3){let P=D+0,R=D+1,U=D+2;u.push(P,R,R,U,U,P)}}let x=new(M.count>=65535?ra:sa)(u,1);x.version=T;let p=r.get(m);p&&t.remove(p),r.set(m,x)}function d(m){let u=r.get(m);if(u){let f=m.index;f!==null&&u.version<f.version&&c(m)}else c(m);return r.get(m)}return{get:o,update:l,getWireframeAttribute:d}}function kg(i,t,e){let n;function s(m){n=m}let r,a;function o(m){r=m.type,a=m.bytesPerElement}function l(m,u){i.drawElements(n,u,r,m*a),e.update(u,n,1)}function c(m,u,f){f!==0&&(i.drawElementsInstanced(n,u,r,m*a,f),e.update(u,n,f))}function d(m,u,f){if(f===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,u,0,r,m,0,f);let T=0;for(let x=0;x<f;x++)T+=u[x];e.update(T,n,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=d}function Vg(i){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(e.calls++,a){case i.TRIANGLES:e.triangles+=o*(r/3);break;case i.LINES:e.lines+=o*(r/2);break;case i.LINE_STRIP:e.lines+=o*(r-1);break;case i.LINE_LOOP:e.lines+=o*r;break;case i.POINTS:e.points+=o*r;break;default:te("WebGLInfo: Unknown draw mode:",a);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function Gg(i,t,e){let n=new WeakMap,s=new Je;function r(a,o,l){let c=a.morphTargetInfluences,d=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,m=d!==void 0?d.length:0,u=n.get(o);if(u===void 0||u.count!==m){let I=function(){U.dispose(),n.delete(o),o.removeEventListener("dispose",I)};u!==void 0&&u.texture.dispose();let f=o.morphAttributes.position!==void 0,M=o.morphAttributes.normal!==void 0,T=o.morphAttributes.color!==void 0,x=o.morphAttributes.position||[],p=o.morphAttributes.normal||[],C=o.morphAttributes.color||[],D=0;f===!0&&(D=1),M===!0&&(D=2),T===!0&&(D=3);let A=o.attributes.position.count*D,P=1;A>t.maxTextureSize&&(P=Math.ceil(A/t.maxTextureSize),A=t.maxTextureSize);let R=new Float32Array(A*P*4*m),U=new na(R,A,P,m);U.type=wi,U.needsUpdate=!0;let y=D*4;for(let F=0;F<m;F++){let H=x[F],q=p[F],Q=C[F],k=A*P*4*F;for(let et=0;et<H.count;et++){let lt=et*y;f===!0&&(s.fromBufferAttribute(H,et),R[k+lt+0]=s.x,R[k+lt+1]=s.y,R[k+lt+2]=s.z,R[k+lt+3]=0),M===!0&&(s.fromBufferAttribute(q,et),R[k+lt+4]=s.x,R[k+lt+5]=s.y,R[k+lt+6]=s.z,R[k+lt+7]=0),T===!0&&(s.fromBufferAttribute(Q,et),R[k+lt+8]=s.x,R[k+lt+9]=s.y,R[k+lt+10]=s.z,R[k+lt+11]=Q.itemSize===4?s.w:1)}}u={count:m,texture:U,size:new Bt(A,P)},n.set(o,u),o.addEventListener("dispose",I)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,e);else{let f=0;for(let T=0;T<c.length;T++)f+=c[T];let M=o.morphTargetsRelative?1:1-f;l.getUniforms().setValue(i,"morphTargetBaseInfluence",M),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",u.texture,e),l.getUniforms().setValue(i,"morphTargetsTextureSize",u.size)}return{update:r}}function Hg(i,t,e,n,s){let r=new WeakMap;function a(c){let d=s.render.frame,m=c.geometry,u=t.get(c,m);if(r.get(u)!==d&&(t.update(u),r.set(u,d)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==d&&(e.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&e.update(c.instanceColor,i.ARRAY_BUFFER),r.set(c,d))),c.isSkinnedMesh){let f=c.skeleton;r.get(f)!==d&&(f.update(),r.set(f,d))}return u}function o(){r=new WeakMap}function l(c){let d=c.target;d.removeEventListener("dispose",l),n.releaseStatesOfObject(d),e.remove(d.instanceMatrix),d.instanceColor!==null&&e.remove(d.instanceColor)}return{update:a,dispose:o}}var Wg={[oh]:"LINEAR_TONE_MAPPING",[lh]:"REINHARD_TONE_MAPPING",[ch]:"CINEON_TONE_MAPPING",[hh]:"ACES_FILMIC_TONE_MAPPING",[dh]:"AGX_TONE_MAPPING",[fh]:"NEUTRAL_TONE_MAPPING",[uh]:"CUSTOM_TONE_MAPPING"};function Xg(i,t,e,n,s,r){let a=new qn(t,e,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,l=null,c=new Le;c.setAttribute("position",new ne([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new ne([0,2,0,0,2,0],2));let d=new Ko({uniforms:{tDiffuse:{value:null}},vertexShader:`
			precision highp float;

			uniform mat4 modelViewMatrix;
			uniform mat4 projectionMatrix;

			attribute vec3 position;
			attribute vec2 uv;

			varying vec2 vUv;

			void main() {
				vUv = uv;
				gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
			}`,fragmentShader:`
			precision highp float;

			uniform sampler2D tDiffuse;

			varying vec2 vUv;

			#include <tonemapping_pars_fragment>
			#include <colorspace_pars_fragment>

			void main() {
				gl_FragColor = texture2D( tDiffuse, vUv );

				#ifdef LINEAR_TONE_MAPPING
					gl_FragColor.rgb = LinearToneMapping( gl_FragColor.rgb );
				#elif defined( REINHARD_TONE_MAPPING )
					gl_FragColor.rgb = ReinhardToneMapping( gl_FragColor.rgb );
				#elif defined( CINEON_TONE_MAPPING )
					gl_FragColor.rgb = CineonToneMapping( gl_FragColor.rgb );
				#elif defined( ACES_FILMIC_TONE_MAPPING )
					gl_FragColor.rgb = ACESFilmicToneMapping( gl_FragColor.rgb );
				#elif defined( AGX_TONE_MAPPING )
					gl_FragColor.rgb = AgXToneMapping( gl_FragColor.rgb );
				#elif defined( NEUTRAL_TONE_MAPPING )
					gl_FragColor.rgb = NeutralToneMapping( gl_FragColor.rgb );
				#elif defined( CUSTOM_TONE_MAPPING )
					gl_FragColor.rgb = CustomToneMapping( gl_FragColor.rgb );
				#endif

				#ifdef SRGB_TRANSFER
					gl_FragColor = sRGBTransferOETF( gl_FragColor );
				#endif
			}`,depthTest:!1,depthWrite:!1}),m=new ce(c,d),u=new Ar(-1,1,1,-1,0,1),f=null,M=null,T=!1,x,p=null,C=[],D=!1;this.setSize=function(A,P){a.setSize(A,P),o!==null&&o.setSize(A,P),l!==null&&l.setSize(A,P);for(let R=0;R<C.length;R++){let U=C[R];U.setSize&&U.setSize(A,P)}},this.setEffects=function(A){C=A,D=C.length>0&&C[0].isRenderPass===!0;let P=a.width,R=a.height;C.length>0&&o===null&&(o=new qn(P,R,{type:Ti,depthBuffer:!1,stencilBuffer:!1}),l=new qn(P,R,{type:Ti,depthBuffer:!1,stencilBuffer:!1}));for(let U=0;U<C.length;U++){let y=C[U];y.setSize&&y.setSize(P,R)}},this.begin=function(A,P){if(T||A.toneMapping===Si&&C.length===0)return!1;if(p=P,P!==null){let R=P.width,U=P.height;(a.width!==R||a.height!==U)&&this.setSize(R,U)}return D===!1&&A.setRenderTarget(a),x=A.toneMapping,A.toneMapping=Si,!0},this.hasRenderPass=function(){return D},this.end=function(A,P){A.toneMapping=x,T=!0;let R=a,U=o;for(let y=0;y<C.length;y++){let I=C[y];I.enabled!==!1&&(I.render(A,U,R,P),I.needsSwap!==!1&&(R=U,U=U===o?l:o))}if(f!==A.outputColorSpace||M!==A.toneMapping){f=A.outputColorSpace,M=A.toneMapping,d.defines={},we.getTransfer(f)===De&&(d.defines.SRGB_TRANSFER="");let y=Wg[M];y&&(d.defines[y]=""),d.needsUpdate=!0}d.uniforms.tDiffuse.value=R.texture,A.setRenderTarget(p),A.render(m,u),p=null,T=!1},this.isCompositing=function(){return T},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),c.dispose(),d.dispose()}}var rf=new Nn,kh=new cs(1,1),af=new na,of=new zo,lf=new oa,zd=[],kd=[],Vd=new Float32Array(16),Gd=new Float32Array(9),Hd=new Float32Array(4);function Dr(i,t,e){let n=i[0];if(n<=0||n>0)return i;let s=t*e,r=zd[s];if(r===void 0&&(r=new Float32Array(s),zd[s]=r),t!==0){n.toArray(r,0);for(let a=1,o=0;a!==t;++a)o+=e,i[a].toArray(r,o)}return r}function xn(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function vn(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function cc(i,t){let e=kd[t];e===void 0&&(e=new Int32Array(t),kd[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function qg(i,t){let e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function Yg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(xn(e,t))return;i.uniform2fv(this.addr,t),vn(e,t)}}function Zg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(xn(e,t))return;i.uniform3fv(this.addr,t),vn(e,t)}}function $g(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(xn(e,t))return;i.uniform4fv(this.addr,t),vn(e,t)}}function Jg(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(xn(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),vn(e,t)}else{if(xn(e,n))return;Hd.set(n),i.uniformMatrix2fv(this.addr,!1,Hd),vn(e,n)}}function Kg(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(xn(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),vn(e,t)}else{if(xn(e,n))return;Gd.set(n),i.uniformMatrix3fv(this.addr,!1,Gd),vn(e,n)}}function jg(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(xn(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),vn(e,t)}else{if(xn(e,n))return;Vd.set(n),i.uniformMatrix4fv(this.addr,!1,Vd),vn(e,n)}}function Qg(i,t){let e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function t_(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(xn(e,t))return;i.uniform2iv(this.addr,t),vn(e,t)}}function e_(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(xn(e,t))return;i.uniform3iv(this.addr,t),vn(e,t)}}function n_(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(xn(e,t))return;i.uniform4iv(this.addr,t),vn(e,t)}}function i_(i,t){let e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function s_(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(xn(e,t))return;i.uniform2uiv(this.addr,t),vn(e,t)}}function r_(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(xn(e,t))return;i.uniform3uiv(this.addr,t),vn(e,t)}}function a_(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(xn(e,t))return;i.uniform4uiv(this.addr,t),vn(e,t)}}function o_(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(kh.compareFunction=e.isReversedDepthBuffer()?nc:ec,r=kh):r=rf,e.setTexture2D(t||r,s)}function l_(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||of,s)}function c_(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTextureCube(t||lf,s)}function h_(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||af,s)}function u_(i){switch(i){case 5126:return qg;case 35664:return Yg;case 35665:return Zg;case 35666:return $g;case 35674:return Jg;case 35675:return Kg;case 35676:return jg;case 5124:case 35670:return Qg;case 35667:case 35671:return t_;case 35668:case 35672:return e_;case 35669:case 35673:return n_;case 5125:return i_;case 36294:return s_;case 36295:return r_;case 36296:return a_;case 35678:case 36198:case 36298:case 36306:case 35682:return o_;case 35679:case 36299:case 36307:return l_;case 35680:case 36300:case 36308:case 36293:return c_;case 36289:case 36303:case 36311:case 36292:return h_}}function d_(i,t){i.uniform1fv(this.addr,t)}function f_(i,t){let e=Dr(t,this.size,2);i.uniform2fv(this.addr,e)}function p_(i,t){let e=Dr(t,this.size,3);i.uniform3fv(this.addr,e)}function m_(i,t){let e=Dr(t,this.size,4);i.uniform4fv(this.addr,e)}function g_(i,t){let e=Dr(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function __(i,t){let e=Dr(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function x_(i,t){let e=Dr(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function v_(i,t){i.uniform1iv(this.addr,t)}function y_(i,t){i.uniform2iv(this.addr,t)}function M_(i,t){i.uniform3iv(this.addr,t)}function S_(i,t){i.uniform4iv(this.addr,t)}function b_(i,t){i.uniform1uiv(this.addr,t)}function w_(i,t){i.uniform2uiv(this.addr,t)}function T_(i,t){i.uniform3uiv(this.addr,t)}function A_(i,t){i.uniform4uiv(this.addr,t)}function E_(i,t,e){let n=this.cache,s=t.length,r=cc(e,s);xn(n,r)||(i.uniform1iv(this.addr,r),vn(n,r));let a;this.type===i.SAMPLER_2D_SHADOW?a=kh:a=rf;for(let o=0;o!==s;++o)e.setTexture2D(t[o]||a,r[o])}function C_(i,t,e){let n=this.cache,s=t.length,r=cc(e,s);xn(n,r)||(i.uniform1iv(this.addr,r),vn(n,r));for(let a=0;a!==s;++a)e.setTexture3D(t[a]||of,r[a])}function R_(i,t,e){let n=this.cache,s=t.length,r=cc(e,s);xn(n,r)||(i.uniform1iv(this.addr,r),vn(n,r));for(let a=0;a!==s;++a)e.setTextureCube(t[a]||lf,r[a])}function P_(i,t,e){let n=this.cache,s=t.length,r=cc(e,s);xn(n,r)||(i.uniform1iv(this.addr,r),vn(n,r));for(let a=0;a!==s;++a)e.setTexture2DArray(t[a]||af,r[a])}function I_(i){switch(i){case 5126:return d_;case 35664:return f_;case 35665:return p_;case 35666:return m_;case 35674:return g_;case 35675:return __;case 35676:return x_;case 5124:case 35670:return v_;case 35667:case 35671:return y_;case 35668:case 35672:return M_;case 35669:case 35673:return S_;case 5125:return b_;case 36294:return w_;case 36295:return T_;case 36296:return A_;case 35678:case 36198:case 36298:case 36306:case 35682:return E_;case 35679:case 36299:case 36307:return C_;case 35680:case 36300:case 36308:case 36293:return R_;case 36289:case 36303:case 36311:case 36292:return P_}}var Vh=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=u_(e.type)}},Gh=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=I_(e.type)}},Hh=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(t,e[o.id],n)}}},Bh=/(\w+)(\])?(\[|\.)?/g;function Wd(i,t){i.seq.push(t),i.map[t.id]=t}function L_(i,t,e){let n=i.name,s=n.length;for(Bh.lastIndex=0;;){let r=Bh.exec(n),a=Bh.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){Wd(e,c===void 0?new Vh(o,i,t):new Gh(o,i,t));break}else{let m=e.map[o];m===void 0&&(m=new Hh(o),Wd(e,m)),e=m}}}var Lr=class{constructor(t,e){this.seq=[],this.map={};let n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){let o=t.getActiveUniform(e,a),l=t.getUniformLocation(e,o.name);L_(o,l,this)}let s=[],r=[];for(let a of this.seq)a.type===t.SAMPLER_2D_SHADOW||a.type===t.SAMPLER_CUBE_SHADOW||a.type===t.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(t,e,n,s){let r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){let s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,a=e.length;r!==a;++r){let o=e[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(t,l.value,s)}}static seqWithValue(t,e){let n=[];for(let s=0,r=t.length;s!==r;++s){let a=t[s];a.id in e&&n.push(a)}return n}};function Xd(i,t,e){let n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}var D_=37297,N_=0;function U_(i,t){let e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let a=s;a<r;a++){let o=a+1;n.push(`${o===t?">":" "} ${o}: ${e[a]}`)}return n.join(`
`)}var qd=new ae;function F_(i){we._getMatrix(qd,we.workingColorSpace,i);let t=`mat3( ${qd.elements.map(e=>e.toFixed(4))} )`;switch(we.getTransfer(i)){case ta:return[t,"LinearTransferOETF"];case De:return[t,"sRGBTransferOETF"];default:return Qt("WebGLProgram: Unsupported color space: ",i),[t,"LinearTransferOETF"]}}function Yd(i,t,e){let n=i.getShaderParameter(t,i.COMPILE_STATUS),r=(i.getShaderInfoLog(t)||"").trim();if(n&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return e.toUpperCase()+`

`+r+`

`+U_(i.getShaderSource(t),o)}else return r}function O_(i,t){let e=F_(t);return[`vec4 ${i}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}var B_={[oh]:"Linear",[lh]:"Reinhard",[ch]:"Cineon",[hh]:"ACESFilmic",[dh]:"AgX",[fh]:"Neutral",[uh]:"Custom"};function z_(i,t){let e=B_[t];return e===void 0?(Qt("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var sc=new N;function k_(){we.getLuminanceCoefficients(sc);let i=sc.x.toFixed(4),t=sc.y.toFixed(4),e=sc.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function V_(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Da).join(`
`)}function G_(i){let t=[];for(let e in i){let n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function H_(i,t){let e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(t,s),a=r.name,o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),e[a]={type:r.type,location:i.getAttribLocation(t,a),locationSize:o}}return e}function Da(i){return i!==""}function Zd(i,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function $d(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var W_=/^[ \t]*#include +<([\w\d./]+)>/gm;function Wh(i){return i.replace(W_,q_)}var X_=new Map;function q_(i,t){let e=ge[t];if(e===void 0){let n=X_.get(t);if(n!==void 0)e=ge[n],Qt('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return Wh(e)}var Y_=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Jd(i){return i.replace(Y_,Z_)}function Z_(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Kd(i){let t=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?t+=`
#define HIGH_PRECISION`:i.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}var $_={[Sa]:"SHADOWMAP_TYPE_PCF",[Er]:"SHADOWMAP_TYPE_VSM"};function J_(i){return $_[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var K_={[ys]:"ENVMAP_TYPE_CUBE",[Bs]:"ENVMAP_TYPE_CUBE",[ba]:"ENVMAP_TYPE_CUBE_UV"};function j_(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":K_[i.envMapMode]||"ENVMAP_TYPE_CUBE"}var Q_={[Bs]:"ENVMAP_MODE_REFRACTION"};function tx(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":Q_[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var ex={[pl]:"ENVMAP_BLENDING_MULTIPLY",[pd]:"ENVMAP_BLENDING_MIX",[md]:"ENVMAP_BLENDING_ADD"};function nx(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":ex[i.combine]||"ENVMAP_BLENDING_NONE"}function ix(i){let t=i.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:n,maxMip:e}}function sx(i,t,e,n){let s=i.getContext(),r=e.defines,a=e.vertexShader,o=e.fragmentShader,l=J_(e),c=j_(e),d=tx(e),m=nx(e),u=ix(e),f=V_(e),M=G_(r),T=s.createProgram(),x,p,C=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(x=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,M].filter(Da).join(`
`),x.length>0&&(x+=`
`),p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,M].filter(Da).join(`
`),p.length>0&&(p+=`
`)):(x=[Kd(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,M,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+d:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Da).join(`
`),p=[Kd(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,M,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+d:"",e.envMap?"#define "+m:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.retroreflection?"#define USE_RETROREFLECTION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Si?"#define TONE_MAPPING":"",e.toneMapping!==Si?ge.tonemapping_pars_fragment:"",e.toneMapping!==Si?z_("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",ge.colorspace_pars_fragment,O_("linearToOutputTexel",e.outputColorSpace),k_(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Da).join(`
`)),a=Wh(a),a=Zd(a,e),a=$d(a,e),o=Wh(o),o=Zd(o,e),o=$d(o,e),a=Jd(a),o=Jd(o),e.isRawShaderMaterial!==!0&&(C=`#version 300 es
`,x=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+x,p=["#define varying in",e.glslVersion===bh?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===bh?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let D=C+x+a,A=C+p+o,P=Xd(s,s.VERTEX_SHADER,D),R=Xd(s,s.FRAGMENT_SHADER,A);s.attachShader(T,P),s.attachShader(T,R),e.index0AttributeName!==void 0?s.bindAttribLocation(T,0,e.index0AttributeName):e.hasPositionAttribute===!0&&s.bindAttribLocation(T,0,"position"),s.linkProgram(T);function U(H){if(i.debug.checkShaderErrors){let q=s.getProgramInfoLog(T)||"",Q=s.getShaderInfoLog(P)||"",k=s.getShaderInfoLog(R)||"",et=q.trim(),lt=Q.trim(),rt=k.trim(),J=!0,st=!0;if(s.getProgramParameter(T,s.LINK_STATUS)===!1)if(J=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,T,P,R);else{let mt=Yd(s,P,"vertex"),yt=Yd(s,R,"fragment");te("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(T,s.VALIDATE_STATUS)+`

Material Name: `+H.name+`
Material Type: `+H.type+`

Program Info Log: `+et+`
`+mt+`
`+yt)}else et!==""?Qt("WebGLProgram: Program Info Log:",et):(lt===""||rt==="")&&(st=!1);st&&(H.diagnostics={runnable:J,programLog:et,vertexShader:{log:lt,prefix:x},fragmentShader:{log:rt,prefix:p}})}s.deleteShader(P),s.deleteShader(R),y=new Lr(s,T),I=H_(s,T)}let y;this.getUniforms=function(){return y===void 0&&U(this),y};let I;this.getAttributes=function(){return I===void 0&&U(this),I};let F=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return F===!1&&(F=s.getProgramParameter(T,D_)),F},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(T),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=N_++,this.cacheKey=t,this.usedTimes=1,this.program=T,this.vertexShader=P,this.fragmentShader=R,this}var rx=0,Xh=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,n){let s=this._getShaderCacheForMaterial(t);return s.has(e)===!1&&(s.add(e),e.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){let e=this.shaderCache,n=e.get(t);return n===void 0&&(n=new qh(t),e.set(t,n)),n}},qh=class{constructor(t){this.id=rx++,this.code=t,this.usedTimes=0}};function ax(i){return i===bs||i===Ra||i===Pa}function ox(i,t,e,n,s,r){let a=new vr,o=new Xh,l=new Set,c=[],d=new Map,m=n.logarithmicDepthBuffer,u=n.precision,f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function M(y){return l.add(y),y===0?"uv":`uv${y}`}function T(y,I,F,H,q,Q){let k=H.fog,et=q.geometry,lt=y.isMeshStandardMaterial||y.isMeshLambertMaterial||y.isMeshPhongMaterial?H.environment:null,rt=y.isMeshStandardMaterial||y.isMeshLambertMaterial&&!y.envMap||y.isMeshPhongMaterial&&!y.envMap,J=t.get(y.envMap||lt,rt),st=J&&J.mapping===ba?J.image.height:null,mt=f[y.type];y.precision!==null&&(u=n.getMaxPrecision(y.precision),u!==y.precision&&Qt("WebGLProgram.getParameters:",y.precision,"not supported, using",u,"instead."));let yt=et.morphAttributes.position||et.morphAttributes.normal||et.morphAttributes.color,$t=yt!==void 0?yt.length:0,Wt=0;et.morphAttributes.position!==void 0&&(Wt=1),et.morphAttributes.normal!==void 0&&(Wt=2),et.morphAttributes.color!==void 0&&(Wt=3);let Ae,_e,fe,ct;if(mt){let Ue=Ui[mt];Ae=Ue.vertexShader,_e=Ue.fragmentShader}else{Ae=y.vertexShader,_e=y.fragmentShader;let Ue=o.getVertexShaderStage(y),Ce=o.getFragmentShaderStage(y);o.update(y,Ue,Ce),fe=Ue.id,ct=Ce.id}let gt=i.getRenderTarget(),St=i.state.buffers.depth.getReversed(),Kt=q.isInstancedMesh===!0,Ot=q.isBatchedMesh===!0,ie=!!y.map,Jt=!!y.matcap,oe=!!J,ye=!!y.aoMap,le=!!y.lightMap,he=!!y.bumpMap&&y.wireframe===!1,Ge=!!y.normalMap,ln=!!y.displacementMap,bn=!!y.emissiveMap,ke=!!y.metalnessMap,Ze=!!y.roughnessMap,B=y.anisotropy>0,cn=y.clearcoat>0,ve=y.dispersion>0,L=y.retroreflectivity>0,S=y.iridescence>0,Y=y.sheen>0,K=y.transmission>0,ot=B&&!!y.anisotropyMap,Mt=cn&&!!y.clearcoatMap,Tt=cn&&!!y.clearcoatNormalMap,ht=cn&&!!y.clearcoatRoughnessMap,pt=S&&!!y.iridescenceMap,Ct=S&&!!y.iridescenceThicknessMap,zt=Y&&!!y.sheenColorMap,At=Y&&!!y.sheenRoughnessMap,Et=!!y.specularMap,Xt=!!y.specularColorMap,Zt=!!y.specularIntensityMap,se=K&&!!y.transmissionMap,V=K&&!!y.thicknessMap,bt=!!y.gradientMap,ft=!!y.alphaMap,Rt=y.alphaTest>0,Dt=!!y.alphaHash,vt=!!y.extensions,qt=Si;y.toneMapped&&(gt===null||gt.isXRRenderTarget===!0)&&(qt=i.toneMapping);let Gt={shaderID:mt,shaderType:y.type,shaderName:y.name,vertexShader:Ae,fragmentShader:_e,defines:y.defines,customVertexShaderID:fe,customFragmentShaderID:ct,isRawShaderMaterial:y.isRawShaderMaterial===!0,glslVersion:y.glslVersion,precision:u,batching:Ot,batchingColor:Ot&&q._colorsTexture!==null,instancing:Kt,instancingColor:Kt&&q.instanceColor!==null,instancingMorph:Kt&&q.morphTexture!==null,outputColorSpace:gt===null?i.outputColorSpace:gt.isXRRenderTarget===!0?gt.texture.colorSpace:we.workingColorSpace,alphaToCoverage:!!y.alphaToCoverage,map:ie,matcap:Jt,envMap:oe,envMapMode:oe&&J.mapping,envMapCubeUVHeight:st,aoMap:ye,lightMap:le,bumpMap:he,normalMap:Ge,displacementMap:ln,emissiveMap:bn,normalMapObjectSpace:Ge&&y.normalMapType===xd,normalMapTangentSpace:Ge&&y.normalMapType===tc,packedNormalMap:Ge&&y.normalMapType===tc&&ax(y.normalMap.format),metalnessMap:ke,roughnessMap:Ze,anisotropy:B,anisotropyMap:ot,clearcoat:cn,clearcoatMap:Mt,clearcoatNormalMap:Tt,clearcoatRoughnessMap:ht,dispersion:ve,retroreflection:L,iridescence:S,iridescenceMap:pt,iridescenceThicknessMap:Ct,sheen:Y,sheenColorMap:zt,sheenRoughnessMap:At,specularMap:Et,specularColorMap:Xt,specularIntensityMap:Zt,transmission:K,transmissionMap:se,thicknessMap:V,gradientMap:bt,opaque:y.transparent===!1&&y.blending===vs&&y.alphaToCoverage===!1,alphaMap:ft,alphaTest:Rt,alphaHash:Dt,combine:y.combine,mapUv:ie&&M(y.map.channel),aoMapUv:ye&&M(y.aoMap.channel),lightMapUv:le&&M(y.lightMap.channel),bumpMapUv:he&&M(y.bumpMap.channel),normalMapUv:Ge&&M(y.normalMap.channel),displacementMapUv:ln&&M(y.displacementMap.channel),emissiveMapUv:bn&&M(y.emissiveMap.channel),metalnessMapUv:ke&&M(y.metalnessMap.channel),roughnessMapUv:Ze&&M(y.roughnessMap.channel),anisotropyMapUv:ot&&M(y.anisotropyMap.channel),clearcoatMapUv:Mt&&M(y.clearcoatMap.channel),clearcoatNormalMapUv:Tt&&M(y.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ht&&M(y.clearcoatRoughnessMap.channel),iridescenceMapUv:pt&&M(y.iridescenceMap.channel),iridescenceThicknessMapUv:Ct&&M(y.iridescenceThicknessMap.channel),sheenColorMapUv:zt&&M(y.sheenColorMap.channel),sheenRoughnessMapUv:At&&M(y.sheenRoughnessMap.channel),specularMapUv:Et&&M(y.specularMap.channel),specularColorMapUv:Xt&&M(y.specularColorMap.channel),specularIntensityMapUv:Zt&&M(y.specularIntensityMap.channel),transmissionMapUv:se&&M(y.transmissionMap.channel),thicknessMapUv:V&&M(y.thicknessMap.channel),alphaMapUv:ft&&M(y.alphaMap.channel),vertexTangents:!!et.attributes.tangent&&(Ge||B),vertexNormals:!!et.attributes.normal,vertexColors:y.vertexColors,vertexAlphas:y.vertexColors===!0&&!!et.attributes.color&&et.attributes.color.itemSize===4,pointsUvs:q.isPoints===!0&&!!et.attributes.uv&&(ie||ft),fog:!!k,useFog:y.fog===!0,fogExp2:!!k&&k.isFogExp2,flatShading:y.wireframe===!1&&(y.flatShading===!0||et.attributes.normal===void 0&&Ge===!1&&(y.isMeshLambertMaterial||y.isMeshPhongMaterial||y.isMeshStandardMaterial||y.isMeshPhysicalMaterial)),sizeAttenuation:y.sizeAttenuation===!0,logarithmicDepthBuffer:m,reversedDepthBuffer:St,skinning:q.isSkinnedMesh===!0,hasPositionAttribute:et.attributes.position!==void 0,morphTargets:et.morphAttributes.position!==void 0,morphNormals:et.morphAttributes.normal!==void 0,morphColors:et.morphAttributes.color!==void 0,morphTargetsCount:$t,morphTextureStride:Wt,numSunLights:I.sun.length,numDirLights:I.directional.length,numPointLights:I.point.length,numSpotLights:I.spot.length,numSpotLightMaps:I.spotLightMap.length,numRectAreaLights:I.rectArea.length,numHemiLights:I.hemi.length,numSunLightShadows:I.sunShadowMap.length,numDirLightShadows:I.directionalShadowMap.length,numPointLightShadows:I.pointShadowMap.length,numSpotLightShadows:I.spotShadowMap.length,numSpotLightShadowsWithMaps:I.numSpotLightShadowsWithMaps,numLightProbes:I.numLightProbes,numLightProbeGrids:Q.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:y.dithering,shadowMapEnabled:i.shadowMap.enabled&&F.length>0,shadowMapType:i.shadowMap.type,toneMapping:qt,decodeVideoTexture:ie&&y.map.isVideoTexture===!0&&we.getTransfer(y.map.colorSpace)===De,decodeVideoTextureEmissive:bn&&y.emissiveMap.isVideoTexture===!0&&we.getTransfer(y.emissiveMap.colorSpace)===De,premultipliedAlpha:y.premultipliedAlpha,doubleSided:y.side===Yn,flipSided:y.side===Sn,useDepthPacking:y.depthPacking>=0,depthPacking:y.depthPacking||0,index0AttributeName:y.index0AttributeName,extensionClipCullDistance:vt&&y.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(vt&&y.extensions.multiDraw===!0||Ot)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:y.customProgramCacheKey()};return Gt.vertexUv1s=l.has(1),Gt.vertexUv2s=l.has(2),Gt.vertexUv3s=l.has(3),l.clear(),Gt}function x(y){let I=[];if(y.shaderID?I.push(y.shaderID):(I.push(y.customVertexShaderID),I.push(y.customFragmentShaderID)),y.defines!==void 0)for(let F in y.defines)I.push(F),I.push(y.defines[F]);return y.isRawShaderMaterial===!1&&(p(I,y),C(I,y),I.push(i.outputColorSpace)),I.push(y.customProgramCacheKey),I.join()}function p(y,I){y.push(I.precision),y.push(I.outputColorSpace),y.push(I.envMapMode),y.push(I.envMapCubeUVHeight),y.push(I.mapUv),y.push(I.alphaMapUv),y.push(I.lightMapUv),y.push(I.aoMapUv),y.push(I.bumpMapUv),y.push(I.normalMapUv),y.push(I.displacementMapUv),y.push(I.emissiveMapUv),y.push(I.metalnessMapUv),y.push(I.roughnessMapUv),y.push(I.anisotropyMapUv),y.push(I.clearcoatMapUv),y.push(I.clearcoatNormalMapUv),y.push(I.clearcoatRoughnessMapUv),y.push(I.iridescenceMapUv),y.push(I.iridescenceThicknessMapUv),y.push(I.sheenColorMapUv),y.push(I.sheenRoughnessMapUv),y.push(I.specularMapUv),y.push(I.specularColorMapUv),y.push(I.specularIntensityMapUv),y.push(I.transmissionMapUv),y.push(I.thicknessMapUv),y.push(I.combine),y.push(I.fogExp2),y.push(I.sizeAttenuation),y.push(I.morphTargetsCount),y.push(I.morphAttributeCount),y.push(I.numSunLights),y.push(I.numDirLights),y.push(I.numPointLights),y.push(I.numSpotLights),y.push(I.numSpotLightMaps),y.push(I.numHemiLights),y.push(I.numRectAreaLights),y.push(I.numSunLightShadows),y.push(I.numDirLightShadows),y.push(I.numPointLightShadows),y.push(I.numSpotLightShadows),y.push(I.numSpotLightShadowsWithMaps),y.push(I.numLightProbes),y.push(I.shadowMapType),y.push(I.toneMapping),y.push(I.numClippingPlanes),y.push(I.numClipIntersection),y.push(I.depthPacking)}function C(y,I){a.disableAll(),I.instancing&&a.enable(0),I.instancingColor&&a.enable(1),I.instancingMorph&&a.enable(2),I.matcap&&a.enable(3),I.envMap&&a.enable(4),I.normalMapObjectSpace&&a.enable(5),I.normalMapTangentSpace&&a.enable(6),I.clearcoat&&a.enable(7),I.iridescence&&a.enable(8),I.alphaTest&&a.enable(9),I.vertexColors&&a.enable(10),I.vertexAlphas&&a.enable(11),I.vertexUv1s&&a.enable(12),I.vertexUv2s&&a.enable(13),I.vertexUv3s&&a.enable(14),I.vertexTangents&&a.enable(15),I.anisotropy&&a.enable(16),I.alphaHash&&a.enable(17),I.batching&&a.enable(18),I.dispersion&&a.enable(19),I.retroreflection&&a.enable(24),I.batchingColor&&a.enable(20),I.gradientMap&&a.enable(21),I.packedNormalMap&&a.enable(22),I.vertexNormals&&a.enable(23),y.push(a.mask),a.disableAll(),I.fog&&a.enable(0),I.useFog&&a.enable(1),I.flatShading&&a.enable(2),I.logarithmicDepthBuffer&&a.enable(3),I.reversedDepthBuffer&&a.enable(4),I.skinning&&a.enable(5),I.morphTargets&&a.enable(6),I.morphNormals&&a.enable(7),I.morphColors&&a.enable(8),I.premultipliedAlpha&&a.enable(9),I.shadowMapEnabled&&a.enable(10),I.doubleSided&&a.enable(11),I.flipSided&&a.enable(12),I.useDepthPacking&&a.enable(13),I.dithering&&a.enable(14),I.transmission&&a.enable(15),I.sheen&&a.enable(16),I.opaque&&a.enable(17),I.pointsUvs&&a.enable(18),I.decodeVideoTexture&&a.enable(19),I.decodeVideoTextureEmissive&&a.enable(20),I.alphaToCoverage&&a.enable(21),I.numLightProbeGrids>0&&a.enable(22),I.hasPositionAttribute&&a.enable(23),y.push(a.mask)}function D(y){let I=f[y.type],F;if(I){let H=Ui[I];F=Ld.clone(H.uniforms)}else F=y.uniforms;return F}function A(y,I){let F=d.get(I);return F!==void 0?++F.usedTimes:(F=new sx(i,I,y,s),c.push(F),d.set(I,F)),F}function P(y){if(--y.usedTimes===0){let I=c.indexOf(y);c[I]=c[c.length-1],c.pop(),d.delete(y.cacheKey),y.destroy()}}function R(y){o.remove(y)}function U(){o.dispose()}return{getParameters:T,getProgramCacheKey:x,getUniforms:D,acquireProgram:A,releaseProgram:P,releaseShaderCache:R,programs:c,dispose:U}}function lx(){let i=new WeakMap;function t(a){return i.has(a)}function e(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:r}}function cx(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.materialVariant!==t.materialVariant?i.materialVariant-t.materialVariant:i.z!==t.z?i.z-t.z:i.id-t.id}function jd(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function Qd(){let i=[],t=0,e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function a(u){let f=0;return u.isInstancedMesh&&(f+=2),u.isSkinnedMesh&&(f+=1),f}function o(u,f,M,T,x,p){let C=i[t];return C===void 0?(C={id:u.id,object:u,geometry:f,material:M,materialVariant:a(u),groupOrder:T,renderOrder:u.renderOrder,z:x,group:p},i[t]=C):(C.id=u.id,C.object=u,C.geometry=f,C.material=M,C.materialVariant=a(u),C.groupOrder=T,C.renderOrder=u.renderOrder,C.z=x,C.group=p),t++,C}function l(u,f,M,T,x,p,C){C.reversedDepth===!0&&(x=-x);let D=o(u,f,M,T,x,p);M.transmission>0?n.push(D):M.transparent===!0?s.push(D):e.push(D)}function c(u,f,M,T,x,p){let C=o(u,f,M,T,x,p);M.transmission>0?n.unshift(C):M.transparent===!0?s.unshift(C):e.unshift(C)}function d(u,f){e.length>1&&e.sort(u||cx),n.length>1&&n.sort(f||jd),s.length>1&&s.sort(f||jd)}function m(){for(let u=t,f=i.length;u<f;u++){let M=i[u];if(M.id===null)break;M.id=null,M.object=null,M.geometry=null,M.material=null,M.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:l,unshift:c,finish:m,sort:d}}function hx(){let i=new WeakMap;function t(n,s){let r=i.get(n),a;return r===void 0?(a=new Qd,i.set(n,[a])):s>=r.length?(a=new Qd,r.push(a)):a=r[s],a}function e(){i=new WeakMap}return{get:t,dispose:e}}function ux(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={direction:new N,color:new jt};break;case"SpotLight":e={position:new N,direction:new N,color:new jt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new N,color:new jt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new N,skyColor:new jt,groundColor:new jt};break;case"RectAreaLight":e={color:new jt,position:new N,halfWidth:new N,halfHeight:new N};break}return i[t.id]=e,e}}}function dx(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Bt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Bt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Bt,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}var fx=0;function px(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function mx(i){let t=new ux,e=dx(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new N);let s=new N,r=new Be,a=new Be;function o(c){let d=0,m=0,u=0;for(let q=0;q<9;q++)n.probe[q].set(0,0,0);let f=0,M=0,T=0,x=0,p=0,C=0,D=0,A=0,P=0,R=0,U=0,y=0,I=0,F=0;c.sort(px);for(let q=0,Q=c.length;q<Q;q++){let k=c[q],et=k.color,lt=k.intensity,rt=k.distance,J=null;if(k.shadow&&k.shadow.map&&(k.shadow.map.texture.format===bs?J=k.shadow.map.texture:J=k.shadow.map.depthTexture||k.shadow.map.texture),k.isAmbientLight)d+=et.r*lt,m+=et.g*lt,u+=et.b*lt;else if(k.isLightProbe){for(let st=0;st<9;st++)n.probe[st].addScaledVector(k.sh.coefficients[st],lt);F++}else if(k.isSunLight){let st=t.get(k);if(st.color.copy(k.color).multiplyScalar(k.intensity),k.castShadow){let mt=k.shadow,yt=e.get(k);yt.shadowIntensity=mt.intensity,yt.shadowBias=mt.bias,yt.shadowNormalBias=mt.normalBias,yt.shadowRadius=mt.radius,yt.shadowMapSize.copy(mt.mapSize).multiply(mt.getFrameExtents()),n.sunShadow[M]=yt,n.sunShadowMap[M]=J;let $t=mt.getViewportCount();for(let Wt=0;Wt<$t;Wt++)n.sunShadowMatrix[T+Wt]=mt.getMatrix(Wt),n.sunShadowCascade[T+Wt]=mt._cascadeData[Wt];T+=$t,M++}n.sun[f]=st,f++}else if(k.isDirectionalLight){let st=t.get(k);if(st.color.copy(k.color).multiplyScalar(k.intensity),k.castShadow){let mt=k.shadow,yt=e.get(k);yt.shadowIntensity=mt.intensity,yt.shadowBias=mt.bias,yt.shadowNormalBias=mt.normalBias,yt.shadowRadius=mt.radius,yt.shadowMapSize=mt.mapSize,n.directionalShadow[x]=yt,n.directionalShadowMap[x]=J,n.directionalShadowMatrix[x]=k.shadow.matrix,P++}n.directional[x]=st,x++}else if(k.isSpotLight){let st=t.get(k);st.position.setFromMatrixPosition(k.matrixWorld),st.color.copy(et).multiplyScalar(lt),st.distance=rt,st.coneCos=Math.cos(k.angle),st.penumbraCos=Math.cos(k.angle*(1-k.penumbra)),st.decay=k.decay,n.spot[C]=st;let mt=k.shadow;if(k.map&&(n.spotLightMap[y]=k.map,y++,mt.updateMatrices(k),k.castShadow&&I++),n.spotLightMatrix[C]=mt.matrix,k.castShadow){let yt=e.get(k);yt.shadowIntensity=mt.intensity,yt.shadowBias=mt.bias,yt.shadowNormalBias=mt.normalBias,yt.shadowRadius=mt.radius,yt.shadowMapSize=mt.mapSize,n.spotShadow[C]=yt,n.spotShadowMap[C]=J,U++}C++}else if(k.isRectAreaLight){let st=t.get(k);st.color.copy(et).multiplyScalar(lt),st.halfWidth.set(k.width*.5,0,0),st.halfHeight.set(0,k.height*.5,0),n.rectArea[D]=st,D++}else if(k.isPointLight){let st=t.get(k);if(st.color.copy(k.color).multiplyScalar(k.intensity),st.distance=k.distance,st.decay=k.decay,k.castShadow){let mt=k.shadow,yt=e.get(k);yt.shadowIntensity=mt.intensity,yt.shadowBias=mt.bias,yt.shadowNormalBias=mt.normalBias,yt.shadowRadius=mt.radius,yt.shadowMapSize=mt.mapSize,yt.shadowCameraNear=mt.camera.near,yt.shadowCameraFar=mt.camera.far,n.pointShadow[p]=yt,n.pointShadowMap[p]=J,n.pointShadowMatrix[p]=k.shadow.matrix,R++}n.point[p]=st,p++}else if(k.isHemisphereLight){let st=t.get(k);st.skyColor.copy(k.color).multiplyScalar(lt),st.groundColor.copy(k.groundColor).multiplyScalar(lt),n.hemi[A]=st,A++}}D>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=Lt.LTC_FLOAT_1,n.rectAreaLTC2=Lt.LTC_FLOAT_2):(n.rectAreaLTC1=Lt.LTC_HALF_1,n.rectAreaLTC2=Lt.LTC_HALF_2)),n.ambient[0]=d,n.ambient[1]=m,n.ambient[2]=u;let H=n.hash;(H.sunLength!==f||H.directionalLength!==x||H.pointLength!==p||H.spotLength!==C||H.rectAreaLength!==D||H.hemiLength!==A||H.numSunShadows!==M||H.numDirectionalShadows!==P||H.numPointShadows!==R||H.numSpotShadows!==U||H.numSpotMaps!==y||H.numLightProbes!==F)&&(n.sun.length=f,n.directional.length=x,n.spot.length=C,n.rectArea.length=D,n.point.length=p,n.hemi.length=A,n.sunShadow.length=M,n.sunShadowMap.length=M,n.sunShadowMatrix.length=T,n.sunShadowCascade.length=T,n.directionalShadow.length=P,n.directionalShadowMap.length=P,n.directionalShadowMatrix.length=P,n.pointShadow.length=R,n.pointShadowMap.length=R,n.pointShadowMatrix.length=R,n.spotShadow.length=U,n.spotShadowMap.length=U,n.spotLightMatrix.length=U+y-I,n.spotLightMap.length=y,n.numSpotLightShadowsWithMaps=I,n.numLightProbes=F,H.sunLength=f,H.directionalLength=x,H.pointLength=p,H.spotLength=C,H.rectAreaLength=D,H.hemiLength=A,H.numSunShadows=M,H.numDirectionalShadows=P,H.numPointShadows=R,H.numSpotShadows=U,H.numSpotMaps=y,H.numLightProbes=F,n.version=fx++)}function l(c,d){let m=0,u=0,f=0,M=0,T=0,x=0,p=d.matrixWorldInverse;for(let C=0,D=c.length;C<D;C++){let A=c[C];if(A.isSunLight){let P=n.sun[m];P.direction.setFromMatrixPosition(A.matrixWorld),P.direction.transformDirection(p),m++}else if(A.isDirectionalLight){let P=n.directional[u];P.direction.setFromMatrixPosition(A.matrixWorld),s.setFromMatrixPosition(A.target.matrixWorld),P.direction.sub(s),P.direction.transformDirection(p),u++}else if(A.isSpotLight){let P=n.spot[M];P.position.setFromMatrixPosition(A.matrixWorld),P.position.applyMatrix4(p),P.direction.setFromMatrixPosition(A.matrixWorld),s.setFromMatrixPosition(A.target.matrixWorld),P.direction.sub(s),P.direction.transformDirection(p),M++}else if(A.isRectAreaLight){let P=n.rectArea[T];P.position.setFromMatrixPosition(A.matrixWorld),P.position.applyMatrix4(p),a.identity(),r.copy(A.matrixWorld),r.premultiply(p),a.extractRotation(r),P.halfWidth.set(A.width*.5,0,0),P.halfHeight.set(0,A.height*.5,0),P.halfWidth.applyMatrix4(a),P.halfHeight.applyMatrix4(a),T++}else if(A.isPointLight){let P=n.point[f];P.position.setFromMatrixPosition(A.matrixWorld),P.position.applyMatrix4(p),f++}else if(A.isHemisphereLight){let P=n.hemi[x];P.direction.setFromMatrixPosition(A.matrixWorld),P.direction.transformDirection(p),x++}}}return{setup:o,setupView:l,state:n}}function tf(i){let t=new mx(i),e=[],n=[],s=[];function r(u){m.camera=u,e.length=0,n.length=0,s.length=0}function a(u){e.push(u)}function o(u){n.push(u)}function l(u){s.push(u)}function c(){t.setup(e)}function d(u){t.setupView(e,u)}let m={lightsArray:e,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:m,setupLights:c,setupLightsView:d,pushLight:a,pushShadow:o,pushLightProbeGrid:l}}function gx(i){let t=new WeakMap;function e(s,r=0){let a=t.get(s),o;return a===void 0?(o=new tf(i),t.set(s,[o])):r>=a.length?(o=new tf(i),a.push(o)):o=a[r],o}function n(){t=new WeakMap}return{get:e,dispose:n}}var _x=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,xx=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ).rg;
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ).r;
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( max( 0.0, squared_mean - mean * mean ) );
	gl_FragColor = vec4( mean, std_dev, 0.0, 1.0 );
}`,vx=[new N(1,0,0),new N(-1,0,0),new N(0,1,0),new N(0,-1,0),new N(0,0,1),new N(0,0,-1)],yx=[new N(0,-1,0),new N(0,-1,0),new N(0,0,1),new N(0,0,-1),new N(0,-1,0),new N(0,-1,0)],ef=new Be,La=new N,zh=new N;function Mx(i,t,e){let n=new Mr,s=new Bt,r=new Bt,a=new Je,o=new jo,l=new Qo,c={},d=e.maxTextureSize,m={[xs]:Sn,[Sn]:xs,[Yn]:Yn},u=new _n({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Bt},radius:{value:4}},vertexShader:_x,fragmentShader:xx}),f=u.clone();f.defines.HORIZONTAL_PASS=1;let M=new Le;M.setAttribute("position",new ni(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let T=new ce(M,u),x=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Sa;let p=this.type;this.render=function(R,U,y){if(x.enabled===!1||x.autoUpdate===!1&&x.needsUpdate===!1||R.length===0)return;this.type===$u&&(Qt("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Sa);let I=i.getRenderTarget(),F=i.getActiveCubeFace(),H=i.getActiveMipmapLevel(),q=i.state;q.setBlending(Di),q.buffers.depth.getReversed()===!0?q.buffers.color.setClear(0,0,0,0):q.buffers.color.setClear(1,1,1,1),q.buffers.depth.setTest(!0),q.setScissorTest(!1);let Q=p!==this.type;Q&&U.traverse(function(k){k.material&&(Array.isArray(k.material)?k.material.forEach(et=>et.needsUpdate=!0):k.material.needsUpdate=!0)});for(let k=0,et=R.length;k<et;k++){let lt=R[k],rt=lt.shadow;if(rt===void 0){Qt("WebGLShadowMap:",lt,"has no shadow.");continue}if(rt.autoUpdate===!1&&rt.needsUpdate===!1)continue;s.copy(rt.mapSize);let J=rt.getFrameExtents();s.multiply(J),r.copy(rt.mapSize),(s.x>d||s.y>d)&&(s.x>d&&(r.x=Math.floor(d/J.x),s.x=r.x*J.x,rt.mapSize.x=r.x),s.y>d&&(r.y=Math.floor(d/J.y),s.y=r.y*J.y,rt.mapSize.y=r.y));let st=i.state.buffers.depth.getReversed();if(rt.camera._reversedDepth=st,rt.map===null||Q===!0){if(rt.map!==null&&(rt.map.depthTexture!==null&&(rt.map.depthTexture.dispose(),rt.map.depthTexture=null),rt.map.dispose()),this.type===Er){if(lt.isPointLight){Qt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}rt.map=new qn(s.x,s.y,{format:bs,type:Ti,minFilter:Cn,magFilter:Cn,generateMipmaps:!1}),rt.map.texture.name=lt.name+".shadowMap",rt.map.depthTexture=new cs(s.x,s.y,wi),rt.map.depthTexture.name=lt.name+".shadowMapDepth",rt.map.depthTexture.format=Pi,rt.map.depthTexture.compareFunction=null,rt.map.depthTexture.minFilter=Mn,rt.map.depthTexture.magFilter=Mn}else lt.isPointLight?(rt.map=new ac(s.x),rt.map.depthTexture=new Wo(s.x,bi)):(rt.map=new qn(s.x,s.y),rt.map.depthTexture=new cs(s.x,s.y,bi)),rt.map.depthTexture.name=lt.name+".shadowMap",rt.map.depthTexture.format=Pi,this.type===Sa?(rt.map.depthTexture.compareFunction=st?nc:ec,rt.map.depthTexture.minFilter=Cn,rt.map.depthTexture.magFilter=Cn):(rt.map.depthTexture.compareFunction=null,rt.map.depthTexture.minFilter=Mn,rt.map.depthTexture.magFilter=Mn);rt.camera.updateProjectionMatrix()}rt.map.isWebGLCubeRenderTarget!==!0&&(rt.map.width!==s.x||rt.map.height!==s.y)&&rt.map.setSize(s.x,s.y);let mt=rt.map.isWebGLCubeRenderTarget?6:rt.getViewportCount();lt.isPointLight!==!0&&rt.updateMatrices(lt,y);for(let yt=0;yt<mt;yt++){let $t=rt.getCamera(yt);if(lt.isPointLight){let Wt=rt.camera,Ae=rt.matrix,_e=lt.distance||Wt.far;_e!==Wt.far&&(Wt.far=_e,Wt.updateProjectionMatrix()),La.setFromMatrixPosition(lt.matrixWorld),Wt.position.copy(La),zh.copy(Wt.position),zh.add(vx[yt]),Wt.up.copy(yx[yt]),Wt.lookAt(zh),Wt.updateMatrixWorld(),Ae.makeTranslation(-La.x,-La.y,-La.z),ef.multiplyMatrices(Wt.projectionMatrix,Wt.matrixWorldInverse),rt._frustum.setFromProjectionMatrix(ef,Wt.coordinateSystem,Wt.reversedDepth)}if(rt.map.isWebGLCubeRenderTarget)i.setRenderTarget(rt.map,yt),i.clear();else{yt===0&&(i.setRenderTarget(rt.map),i.clear());let Wt=rt.getViewport(yt);a.set(r.x*Wt.x,r.y*Wt.y,r.x*Wt.z,r.y*Wt.w),q.viewport(a)}n=rt.getFrustum(yt),A(U,y,$t,lt,this.type)}rt.isPointLightShadow!==!0&&this.type===Er&&C(rt,y),rt.needsUpdate=!1}p=this.type,x.needsUpdate=!1,i.setRenderTarget(I,F,H)};function C(R,U){let y=t.update(T);u.defines.VSM_SAMPLES!==R.blurSamples&&(u.defines.VSM_SAMPLES=R.blurSamples,f.defines.VSM_SAMPLES=R.blurSamples,u.needsUpdate=!0,f.needsUpdate=!0),R.mapPass===null?R.mapPass=new qn(s.x,s.y,{format:bs,type:Ti}):(R.mapPass.width!==R.map.width||R.mapPass.height!==R.map.height)&&R.mapPass.setSize(R.map.width,R.map.height),u.uniforms.shadow_pass.value=R.map.depthTexture,u.uniforms.resolution.value.set(R.map.width,R.map.height),u.uniforms.radius.value=R.radius,i.setRenderTarget(R.mapPass),i.clear(),i.renderBufferDirect(U,null,y,u,T,null),f.uniforms.shadow_pass.value=R.mapPass.texture,f.uniforms.resolution.value.set(R.map.width,R.map.height),f.uniforms.radius.value=R.radius,i.setRenderTarget(R.map),i.clear(),i.renderBufferDirect(U,null,y,f,T,null)}function D(R,U,y,I){let F=null,H=y.isPointLight===!0?R.customDistanceMaterial:R.customDepthMaterial;if(H!==void 0)F=H;else if(F=y.isPointLight===!0?l:o,i.localClippingEnabled&&U.clipShadows===!0&&Array.isArray(U.clippingPlanes)&&U.clippingPlanes.length!==0||U.displacementMap&&U.displacementScale!==0||U.alphaMap&&U.alphaTest>0||U.map&&U.alphaTest>0||U.alphaToCoverage===!0){let q=F.uuid,Q=U.uuid,k=c[q];k===void 0&&(k={},c[q]=k);let et=k[Q];et===void 0&&(et=F.clone(),k[Q]=et,U.addEventListener("dispose",P)),F=et}if(F.visible=U.visible,F.wireframe=U.wireframe,I===Er?F.side=U.shadowSide!==null?U.shadowSide:U.side:F.side=U.shadowSide!==null?U.shadowSide:m[U.side],F.alphaMap=U.alphaMap,F.alphaTest=U.alphaToCoverage===!0?.5:U.alphaTest,F.map=U.map,F.clipShadows=U.clipShadows,F.clippingPlanes=U.clippingPlanes,F.clipIntersection=U.clipIntersection,F.displacementMap=U.displacementMap,F.displacementScale=U.displacementScale,F.displacementBias=U.displacementBias,F.wireframeLinewidth=U.wireframeLinewidth,F.linewidth=U.linewidth,y.isPointLight===!0&&F.isMeshDistanceMaterial===!0){let q=i.properties.get(F);q.light=y}return F}function A(R,U,y,I,F){if(R.visible===!1)return;if(R.layers.test(U.layers)&&(R.isMesh||R.isLine||R.isPoints)&&(R.castShadow||R.receiveShadow&&F===Er)&&(!R.frustumCulled||R.intersectsFrustum(n))){R.modelViewMatrix.multiplyMatrices(y.matrixWorldInverse,R.matrixWorld);let Q=t.update(R),k=R.material;if(Array.isArray(k)){let et=Q.groups;for(let lt=0,rt=et.length;lt<rt;lt++){let J=et[lt],st=k[J.materialIndex];if(st&&st.visible){let mt=D(R,st,I,F);R.onBeforeShadow(i,R,U,y,Q,mt,J),i.renderBufferDirect(y,null,Q,mt,R,J),R.onAfterShadow(i,R,U,y,Q,mt,J)}}}else if(k.visible){let et=D(R,k,I,F);R.onBeforeShadow(i,R,U,y,Q,et,null),i.renderBufferDirect(y,null,Q,et,R,null),R.onAfterShadow(i,R,U,y,Q,et,null)}}let q=R.children;for(let Q=0,k=q.length;Q<k;Q++)A(q[Q],U,y,I,F)}function P(R){R.target.removeEventListener("dispose",P);for(let y in c){let I=c[y],F=R.target.uuid;F in I&&(I[F].dispose(),delete I[F])}}}function Sx(i,t){function e(){let V=!1,bt=new Je,ft=null,Rt=new Je(0,0,0,0);return{setMask:function(Dt){ft!==Dt&&!V&&(i.colorMask(Dt,Dt,Dt,Dt),ft=Dt)},setLocked:function(Dt){V=Dt},setClear:function(Dt,vt,qt,Gt,Ue){Ue===!0&&(Dt*=Gt,vt*=Gt,qt*=Gt),bt.set(Dt,vt,qt,Gt),Rt.equals(bt)===!1&&(i.clearColor(Dt,vt,qt,Gt),Rt.copy(bt))},reset:function(){V=!1,ft=null,Rt.set(-1,0,0,0)}}}function n(){let V=!1,bt=!1,ft=null,Rt=null,Dt=null;return{setReversed:function(vt){if(bt!==vt){let qt=t.get("EXT_clip_control");vt?qt.clipControlEXT(qt.LOWER_LEFT_EXT,qt.ZERO_TO_ONE_EXT):qt.clipControlEXT(qt.LOWER_LEFT_EXT,qt.NEGATIVE_ONE_TO_ONE_EXT),bt=vt;let Gt=Dt;Dt=null,this.setClear(Gt)}},getReversed:function(){return bt},setTest:function(vt){vt?gt(i.DEPTH_TEST):St(i.DEPTH_TEST)},setMask:function(vt){ft!==vt&&!V&&(i.depthMask(vt),ft=vt)},setFunc:function(vt){if(bt&&(vt=Rd[vt]),Rt!==vt){switch(vt){case Ao:i.depthFunc(i.NEVER);break;case Eo:i.depthFunc(i.ALWAYS);break;case Co:i.depthFunc(i.LESS);break;case pr:i.depthFunc(i.LEQUAL);break;case Ro:i.depthFunc(i.EQUAL);break;case Po:i.depthFunc(i.GEQUAL);break;case Io:i.depthFunc(i.GREATER);break;case Lo:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}Rt=vt}},setLocked:function(vt){V=vt},setClear:function(vt){Dt!==vt&&(Dt=vt,bt&&(vt=1-vt),i.clearDepth(vt))},reset:function(){V=!1,ft=null,Rt=null,Dt=null,bt=!1}}}function s(){let V=!1,bt=null,ft=null,Rt=null,Dt=null,vt=null,qt=null,Gt=null,Ue=null;return{setTest:function(Ce){V||(Ce?gt(i.STENCIL_TEST):St(i.STENCIL_TEST))},setMask:function(Ce){bt!==Ce&&!V&&(i.stencilMask(Ce),bt=Ce)},setFunc:function(Ce,wn,kn){(ft!==Ce||Rt!==wn||Dt!==kn)&&(i.stencilFunc(Ce,wn,kn),ft=Ce,Rt=wn,Dt=kn)},setOp:function(Ce,wn,kn){(vt!==Ce||qt!==wn||Gt!==kn)&&(i.stencilOp(Ce,wn,kn),vt=Ce,qt=wn,Gt=kn)},setLocked:function(Ce){V=Ce},setClear:function(Ce){Ue!==Ce&&(i.clearStencil(Ce),Ue=Ce)},reset:function(){V=!1,bt=null,ft=null,Rt=null,Dt=null,vt=null,qt=null,Gt=null,Ue=null}}}let r=new e,a=new n,o=new s,l=new WeakMap,c=new WeakMap,d={},m={},u={},f=new WeakMap,M=[],T=null,x=!1,p=null,C=null,D=null,A=null,P=null,R=null,U=null,y=new jt(0,0,0),I=0,F=!1,H=null,q=null,Q=null,k=null,et=null,lt=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),rt=!1,J=0,st=i.getParameter(i.VERSION);st.indexOf("WebGL")!==-1?(J=parseFloat(/^WebGL (\d)/.exec(st)[1]),rt=J>=1):st.indexOf("OpenGL ES")!==-1&&(J=parseFloat(/^OpenGL ES (\d)/.exec(st)[1]),rt=J>=2);let mt=null,yt={},$t=i.getParameter(i.SCISSOR_BOX),Wt=i.getParameter(i.VIEWPORT),Ae=new Je().fromArray($t),_e=new Je().fromArray(Wt);function fe(V,bt,ft,Rt){let Dt=new Uint8Array(4),vt=i.createTexture();i.bindTexture(V,vt),i.texParameteri(V,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(V,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let qt=0;qt<ft;qt++)V===i.TEXTURE_3D||V===i.TEXTURE_2D_ARRAY?i.texImage3D(bt,0,i.RGBA,1,1,Rt,0,i.RGBA,i.UNSIGNED_BYTE,Dt):i.texImage2D(bt+qt,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,Dt);return vt}let ct={};ct[i.TEXTURE_2D]=fe(i.TEXTURE_2D,i.TEXTURE_2D,1),ct[i.TEXTURE_CUBE_MAP]=fe(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),ct[i.TEXTURE_2D_ARRAY]=fe(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),ct[i.TEXTURE_3D]=fe(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),gt(i.DEPTH_TEST),a.setFunc(pr),he(!1),Ge(nh),gt(i.CULL_FACE),ye(Di);function gt(V){d[V]!==!0&&(i.enable(V),d[V]=!0)}function St(V){d[V]!==!1&&(i.disable(V),d[V]=!1)}function Kt(V,bt){return u[V]!==bt?(i.bindFramebuffer(V,bt),u[V]=bt,V===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=bt),V===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=bt),!0):!1}function Ot(V,bt){let ft=M,Rt=!1;if(V){ft=f.get(bt),ft===void 0&&(ft=[],f.set(bt,ft));let Dt=V.textures;if(ft.length!==Dt.length||ft[0]!==i.COLOR_ATTACHMENT0){for(let vt=0,qt=Dt.length;vt<qt;vt++)ft[vt]=i.COLOR_ATTACHMENT0+vt;ft.length=Dt.length,Rt=!0}}else ft[0]!==i.BACK&&(ft[0]=i.BACK,Rt=!0);Rt&&i.drawBuffers(ft)}function ie(V){return T!==V?(i.useProgram(V),T=V,!0):!1}let Jt={[Os]:i.FUNC_ADD,[Ku]:i.FUNC_SUBTRACT,[ju]:i.FUNC_REVERSE_SUBTRACT};Jt[Qu]=i.MIN,Jt[td]=i.MAX;let oe={[ed]:i.ZERO,[nd]:i.ONE,[id]:i.SRC_COLOR,[rh]:i.SRC_ALPHA,[cd]:i.SRC_ALPHA_SATURATE,[od]:i.DST_COLOR,[rd]:i.DST_ALPHA,[sd]:i.ONE_MINUS_SRC_COLOR,[ah]:i.ONE_MINUS_SRC_ALPHA,[ld]:i.ONE_MINUS_DST_COLOR,[ad]:i.ONE_MINUS_DST_ALPHA,[hd]:i.CONSTANT_COLOR,[ud]:i.ONE_MINUS_CONSTANT_COLOR,[dd]:i.CONSTANT_ALPHA,[fd]:i.ONE_MINUS_CONSTANT_ALPHA};function ye(V,bt,ft,Rt,Dt,vt,qt,Gt,Ue,Ce){if(V===Di){x===!0&&(St(i.BLEND),x=!1);return}if(x===!1&&(gt(i.BLEND),x=!0),V!==Ju){if(V!==p||Ce!==F){if((C!==Os||P!==Os)&&(i.blendEquation(i.FUNC_ADD),C=Os,P=Os),Ce)switch(V){case vs:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case en:i.blendFunc(i.ONE,i.ONE);break;case ih:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case sh:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:te("WebGLState: Invalid blending: ",V);break}else switch(V){case vs:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case en:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case ih:te("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case sh:te("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:te("WebGLState: Invalid blending: ",V);break}D=null,A=null,R=null,U=null,y.set(0,0,0),I=0,p=V,F=Ce}return}Dt=Dt||bt,vt=vt||ft,qt=qt||Rt,(bt!==C||Dt!==P)&&(i.blendEquationSeparate(Jt[bt],Jt[Dt]),C=bt,P=Dt),(ft!==D||Rt!==A||vt!==R||qt!==U)&&(i.blendFuncSeparate(oe[ft],oe[Rt],oe[vt],oe[qt]),D=ft,A=Rt,R=vt,U=qt),(Gt.equals(y)===!1||Ue!==I)&&(i.blendColor(Gt.r,Gt.g,Gt.b,Ue),y.copy(Gt),I=Ue),p=V,F=!1}function le(V,bt){V.side===Yn?St(i.CULL_FACE):gt(i.CULL_FACE);let ft=V.side===Sn;bt&&(ft=!ft),he(ft),V.blending===vs&&V.transparent===!1?ye(Di):ye(V.blending,V.blendEquation,V.blendSrc,V.blendDst,V.blendEquationAlpha,V.blendSrcAlpha,V.blendDstAlpha,V.blendColor,V.blendAlpha,V.premultipliedAlpha),a.setFunc(V.depthFunc),a.setTest(V.depthTest),a.setMask(V.depthWrite),r.setMask(V.colorWrite);let Rt=V.stencilWrite;o.setTest(Rt),Rt&&(o.setMask(V.stencilWriteMask),o.setFunc(V.stencilFunc,V.stencilRef,V.stencilFuncMask),o.setOp(V.stencilFail,V.stencilZFail,V.stencilZPass)),bn(V.polygonOffset,V.polygonOffsetFactor,V.polygonOffsetUnits),V.alphaToCoverage===!0?gt(i.SAMPLE_ALPHA_TO_COVERAGE):St(i.SAMPLE_ALPHA_TO_COVERAGE)}function he(V){H!==V&&(V?i.frontFace(i.CW):i.frontFace(i.CCW),H=V)}function Ge(V){V!==Yu?(gt(i.CULL_FACE),V!==q&&(V===nh?i.cullFace(i.BACK):V===Zu?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):St(i.CULL_FACE),q=V}function ln(V){V!==Q&&(rt&&i.lineWidth(V),Q=V)}function bn(V,bt,ft){V?(gt(i.POLYGON_OFFSET_FILL),(k!==bt||et!==ft)&&(k=bt,et=ft,a.getReversed()&&(bt=-bt),i.polygonOffset(bt,ft))):St(i.POLYGON_OFFSET_FILL)}function ke(V){V?gt(i.SCISSOR_TEST):St(i.SCISSOR_TEST)}function Ze(V){V===void 0&&(V=i.TEXTURE0+lt-1),mt!==V&&(i.activeTexture(V),mt=V)}function B(V,bt,ft){ft===void 0&&(mt===null?ft=i.TEXTURE0+lt-1:ft=mt);let Rt=yt[ft];Rt===void 0&&(Rt={type:void 0,texture:void 0},yt[ft]=Rt),(Rt.type!==V||Rt.texture!==bt)&&(mt!==ft&&(i.activeTexture(ft),mt=ft),i.bindTexture(V,bt||ct[V]),Rt.type=V,Rt.texture=bt)}function cn(){let V=yt[mt];V!==void 0&&V.type!==void 0&&(i.bindTexture(V.type,null),V.type=void 0,V.texture=void 0)}function ve(){try{i.compressedTexImage2D(...arguments)}catch(V){te("WebGLState:",V)}}function L(){try{i.compressedTexImage3D(...arguments)}catch(V){te("WebGLState:",V)}}function S(){try{i.texSubImage2D(...arguments)}catch(V){te("WebGLState:",V)}}function Y(){try{i.texSubImage3D(...arguments)}catch(V){te("WebGLState:",V)}}function K(){try{i.compressedTexSubImage2D(...arguments)}catch(V){te("WebGLState:",V)}}function ot(){try{i.compressedTexSubImage3D(...arguments)}catch(V){te("WebGLState:",V)}}function Mt(){try{i.texStorage2D(...arguments)}catch(V){te("WebGLState:",V)}}function Tt(){try{i.texStorage3D(...arguments)}catch(V){te("WebGLState:",V)}}function ht(){try{i.texImage2D(...arguments)}catch(V){te("WebGLState:",V)}}function pt(){try{i.texImage3D(...arguments)}catch(V){te("WebGLState:",V)}}function Ct(V){return m[V]!==void 0?m[V]:i.getParameter(V)}function zt(V,bt){m[V]!==bt&&(i.pixelStorei(V,bt),m[V]=bt)}function At(V){Ae.equals(V)===!1&&(i.scissor(V.x,V.y,V.z,V.w),Ae.copy(V))}function Et(V){_e.equals(V)===!1&&(i.viewport(V.x,V.y,V.z,V.w),_e.copy(V))}function Xt(V,bt){let ft=c.get(bt);ft===void 0&&(ft=new WeakMap,c.set(bt,ft));let Rt=ft.get(V);Rt===void 0&&(Rt=i.getUniformBlockIndex(bt,V.name),ft.set(V,Rt))}function Zt(V,bt){let Rt=c.get(bt).get(V);l.get(bt)!==Rt&&(i.uniformBlockBinding(bt,Rt,V.__bindingPointIndex),l.set(bt,Rt))}function se(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),d={},m={},mt=null,yt={},u={},f=new WeakMap,M=[],T=null,x=!1,p=null,C=null,D=null,A=null,P=null,R=null,U=null,y=new jt(0,0,0),I=0,F=!1,H=null,q=null,Q=null,k=null,et=null,Ae.set(0,0,i.canvas.width,i.canvas.height),_e.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:gt,disable:St,bindFramebuffer:Kt,drawBuffers:Ot,useProgram:ie,setBlending:ye,setMaterial:le,setFlipSided:he,setCullFace:Ge,setLineWidth:ln,setPolygonOffset:bn,setScissorTest:ke,activeTexture:Ze,bindTexture:B,unbindTexture:cn,compressedTexImage2D:ve,compressedTexImage3D:L,texImage2D:ht,texImage3D:pt,pixelStorei:zt,getParameter:Ct,updateUBOMapping:Xt,uniformBlockBinding:Zt,texStorage2D:Mt,texStorage3D:Tt,texSubImage2D:S,texSubImage3D:Y,compressedTexSubImage2D:K,compressedTexSubImage3D:ot,scissor:At,viewport:Et,reset:se}}function bx(i,t,e,n,s,r,a){let o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Bt,d=new WeakMap,m=new Set,u,f=new WeakMap,M=!1;try{M=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function T(L,S){return M?new OffscreenCanvas(L,S):gr("canvas")}function x(L,S,Y){let K=1,ot=ve(L);if((ot.width>Y||ot.height>Y)&&(K=Y/Math.max(ot.width,ot.height)),K<1)if(typeof HTMLImageElement<"u"&&L instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&L instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&L instanceof ImageBitmap||typeof VideoFrame<"u"&&L instanceof VideoFrame){let Mt=Math.floor(K*ot.width),Tt=Math.floor(K*ot.height);u===void 0&&(u=T(Mt,Tt));let ht=S?T(Mt,Tt):u;return ht.width=Mt,ht.height=Tt,ht.getContext("2d").drawImage(L,0,0,Mt,Tt),Qt("WebGLRenderer: Texture has been resized from ("+ot.width+"x"+ot.height+") to ("+Mt+"x"+Tt+")."),ht}else return"data"in L&&Qt("WebGLRenderer: Image in DataTexture is too big ("+ot.width+"x"+ot.height+")."),L;return L}function p(L){return L.generateMipmaps}function C(L){i.generateMipmap(L)}function D(L){return L.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:L.isWebGL3DRenderTarget?i.TEXTURE_3D:L.isWebGLArrayRenderTarget||L.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function A(L,S,Y,K,ot,Mt=!1){if(L!==null){if(i[L]!==void 0)return i[L];Qt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+L+"'")}let Tt;K&&(Tt=t.get("EXT_texture_norm16"),Tt||Qt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let ht=S;if(S===i.RED&&(Y===i.FLOAT&&(ht=i.R32F),Y===i.HALF_FLOAT&&(ht=i.R16F),Y===i.UNSIGNED_BYTE&&(ht=i.R8),Y===i.UNSIGNED_SHORT&&Tt&&(ht=Tt.R16_EXT),Y===i.SHORT&&Tt&&(ht=Tt.R16_SNORM_EXT)),S===i.RED_INTEGER&&(Y===i.UNSIGNED_BYTE&&(ht=i.R8UI),Y===i.UNSIGNED_SHORT&&(ht=i.R16UI),Y===i.UNSIGNED_INT&&(ht=i.R32UI),Y===i.BYTE&&(ht=i.R8I),Y===i.SHORT&&(ht=i.R16I),Y===i.INT&&(ht=i.R32I)),S===i.RG&&(Y===i.FLOAT&&(ht=i.RG32F),Y===i.HALF_FLOAT&&(ht=i.RG16F),Y===i.UNSIGNED_BYTE&&(ht=i.RG8),Y===i.UNSIGNED_SHORT&&Tt&&(ht=Tt.RG16_EXT),Y===i.SHORT&&Tt&&(ht=Tt.RG16_SNORM_EXT)),S===i.RG_INTEGER&&(Y===i.UNSIGNED_BYTE&&(ht=i.RG8UI),Y===i.UNSIGNED_SHORT&&(ht=i.RG16UI),Y===i.UNSIGNED_INT&&(ht=i.RG32UI),Y===i.BYTE&&(ht=i.RG8I),Y===i.SHORT&&(ht=i.RG16I),Y===i.INT&&(ht=i.RG32I)),S===i.RGB_INTEGER&&(Y===i.UNSIGNED_BYTE&&(ht=i.RGB8UI),Y===i.UNSIGNED_SHORT&&(ht=i.RGB16UI),Y===i.UNSIGNED_INT&&(ht=i.RGB32UI),Y===i.BYTE&&(ht=i.RGB8I),Y===i.SHORT&&(ht=i.RGB16I),Y===i.INT&&(ht=i.RGB32I)),S===i.RGBA_INTEGER&&(Y===i.UNSIGNED_BYTE&&(ht=i.RGBA8UI),Y===i.UNSIGNED_SHORT&&(ht=i.RGBA16UI),Y===i.UNSIGNED_INT&&(ht=i.RGBA32UI),Y===i.BYTE&&(ht=i.RGBA8I),Y===i.SHORT&&(ht=i.RGBA16I),Y===i.INT&&(ht=i.RGBA32I)),S===i.RGB&&(Y===i.UNSIGNED_SHORT&&Tt&&(ht=Tt.RGB16_EXT),Y===i.SHORT&&Tt&&(ht=Tt.RGB16_SNORM_EXT),Y===i.UNSIGNED_INT_5_9_9_9_REV&&(ht=i.RGB9_E5),Y===i.UNSIGNED_INT_10F_11F_11F_REV&&(ht=i.R11F_G11F_B10F)),S===i.RGBA){let pt=Mt?ta:we.getTransfer(ot);Y===i.FLOAT&&(ht=i.RGBA32F),Y===i.HALF_FLOAT&&(ht=i.RGBA16F),Y===i.UNSIGNED_BYTE&&(ht=pt===De?i.SRGB8_ALPHA8:i.RGBA8),Y===i.UNSIGNED_SHORT&&Tt&&(ht=Tt.RGBA16_EXT),Y===i.SHORT&&Tt&&(ht=Tt.RGBA16_SNORM_EXT),Y===i.UNSIGNED_SHORT_4_4_4_4&&(ht=i.RGBA4),Y===i.UNSIGNED_SHORT_5_5_5_1&&(ht=i.RGB5_A1)}return(ht===i.R16F||ht===i.R32F||ht===i.RG16F||ht===i.RG32F||ht===i.RGBA16F||ht===i.RGBA32F)&&t.get("EXT_color_buffer_float"),ht}function P(L,S){let Y;return L?S===null||S===bi||S===Rr?Y=i.DEPTH24_STENCIL8:S===wi?Y=i.DEPTH32F_STENCIL8:S===Cr&&(Y=i.DEPTH24_STENCIL8,Qt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):S===null||S===bi||S===Rr?Y=i.DEPTH_COMPONENT24:S===wi?Y=i.DEPTH_COMPONENT32F:S===Cr&&(Y=i.DEPTH_COMPONENT16),Y}function R(L,S){return p(L)===!0||L.isFramebufferTexture&&L.minFilter!==Mn&&L.minFilter!==Cn?Math.log2(Math.max(S.width,S.height))+1:L.mipmaps!==void 0&&L.mipmaps.length>0?L.mipmaps.length:L.isCompressedTexture&&Array.isArray(L.image)?S.mipmaps.length:1}function U(L){let S=L.target;S.removeEventListener("dispose",U),I(S),S.isVideoTexture&&d.delete(S),S.isHTMLTexture&&m.delete(S)}function y(L){let S=L.target;S.removeEventListener("dispose",y),H(S)}function I(L){let S=n.get(L);if(S.__webglInit===void 0)return;let Y=L.source,K=f.get(Y);if(K){let ot=K[S.__cacheKey];ot.usedTimes--,ot.usedTimes===0&&F(L),Object.keys(K).length===0&&f.delete(Y)}n.remove(L)}function F(L){let S=n.get(L);i.deleteTexture(S.__webglTexture);let Y=L.source,K=f.get(Y);delete K[S.__cacheKey],a.memory.textures--}function H(L){let S=n.get(L);if(L.depthTexture&&(L.depthTexture.dispose(),n.remove(L.depthTexture)),L.isWebGLCubeRenderTarget)for(let K=0;K<6;K++){if(Array.isArray(S.__webglFramebuffer[K]))for(let ot=0;ot<S.__webglFramebuffer[K].length;ot++)i.deleteFramebuffer(S.__webglFramebuffer[K][ot]);else i.deleteFramebuffer(S.__webglFramebuffer[K]);S.__webglDepthbuffer&&i.deleteRenderbuffer(S.__webglDepthbuffer[K])}else{if(Array.isArray(S.__webglFramebuffer))for(let K=0;K<S.__webglFramebuffer.length;K++)i.deleteFramebuffer(S.__webglFramebuffer[K]);else i.deleteFramebuffer(S.__webglFramebuffer);if(S.__webglDepthbuffer&&i.deleteRenderbuffer(S.__webglDepthbuffer),S.__webglMultisampledFramebuffer&&i.deleteFramebuffer(S.__webglMultisampledFramebuffer),S.__webglColorRenderbuffer)for(let K=0;K<S.__webglColorRenderbuffer.length;K++)S.__webglColorRenderbuffer[K]&&i.deleteRenderbuffer(S.__webglColorRenderbuffer[K]);S.__webglDepthRenderbuffer&&i.deleteRenderbuffer(S.__webglDepthRenderbuffer)}let Y=L.textures;for(let K=0,ot=Y.length;K<ot;K++){let Mt=n.get(Y[K]);Mt.__webglTexture&&(i.deleteTexture(Mt.__webglTexture),a.memory.textures--),n.remove(Y[K])}n.remove(L)}let q=0;function Q(){q=0}function k(){return q}function et(L){q=L}function lt(){let L=q;return L>=s.maxTextures&&Qt("WebGLTextures: Trying to use "+(L+1)+" texture units while this GPU supports only "+s.maxTextures),q+=1,L}function rt(L){let S=[];return S.push(L.wrapS),S.push(L.wrapT),S.push(L.wrapR||0),S.push(L.magFilter),S.push(L.minFilter),S.push(L.anisotropy),S.push(L.internalFormat),S.push(L.format),S.push(L.type),S.push(L.generateMipmaps),S.push(L.premultiplyAlpha),S.push(L.flipY),S.push(L.unpackAlignment),S.push(L.colorSpace),S.join()}function J(L,S){let Y=n.get(L);if(L.isVideoTexture&&B(L),L.isRenderTargetTexture===!1&&L.isExternalTexture!==!0&&L.version>0&&Y.__version!==L.version){let K=L.image;if(K===null)Qt("WebGLRenderer: Texture marked for update but no image data found.");else if(K.complete===!1)Qt("WebGLRenderer: Texture marked for update but image is incomplete");else{St(Y,L,S);return}}else L.isExternalTexture&&(Y.__webglTexture=L.sourceTexture?L.sourceTexture:null);e.bindTexture(i.TEXTURE_2D,Y.__webglTexture,i.TEXTURE0+S)}function st(L,S){let Y=n.get(L);if(L.isRenderTargetTexture===!1&&L.version>0&&Y.__version!==L.version){St(Y,L,S);return}else L.isExternalTexture&&(Y.__webglTexture=L.sourceTexture?L.sourceTexture:null);e.bindTexture(i.TEXTURE_2D_ARRAY,Y.__webglTexture,i.TEXTURE0+S)}function mt(L,S){let Y=n.get(L);if(L.isRenderTargetTexture===!1&&L.version>0&&Y.__version!==L.version){St(Y,L,S);return}e.bindTexture(i.TEXTURE_3D,Y.__webglTexture,i.TEXTURE0+S)}function yt(L,S){let Y=n.get(L);if(L.isCubeDepthTexture!==!0&&L.version>0&&Y.__version!==L.version){Kt(Y,L,S);return}e.bindTexture(i.TEXTURE_CUBE_MAP,Y.__webglTexture,i.TEXTURE0+S)}let $t={[Do]:i.REPEAT,[Ri]:i.CLAMP_TO_EDGE,[No]:i.MIRRORED_REPEAT},Wt={[Mn]:i.NEAREST,[gd]:i.NEAREST_MIPMAP_NEAREST,[wa]:i.NEAREST_MIPMAP_LINEAR,[Cn]:i.LINEAR,[_l]:i.LINEAR_MIPMAP_NEAREST,[Ms]:i.LINEAR_MIPMAP_LINEAR},Ae={[yd]:i.NEVER,[Td]:i.ALWAYS,[Md]:i.LESS,[ec]:i.LEQUAL,[Sd]:i.EQUAL,[nc]:i.GEQUAL,[bd]:i.GREATER,[wd]:i.NOTEQUAL};function _e(L,S){if(S.type===wi&&t.has("OES_texture_float_linear")===!1&&(S.magFilter===Cn||S.magFilter===_l||S.magFilter===wa||S.magFilter===Ms||S.minFilter===Cn||S.minFilter===_l||S.minFilter===wa||S.minFilter===Ms)&&Qt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(L,i.TEXTURE_WRAP_S,$t[S.wrapS]),i.texParameteri(L,i.TEXTURE_WRAP_T,$t[S.wrapT]),(L===i.TEXTURE_3D||L===i.TEXTURE_2D_ARRAY)&&i.texParameteri(L,i.TEXTURE_WRAP_R,$t[S.wrapR]),i.texParameteri(L,i.TEXTURE_MAG_FILTER,Wt[S.magFilter]),i.texParameteri(L,i.TEXTURE_MIN_FILTER,Wt[S.minFilter]),S.compareFunction&&(i.texParameteri(L,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(L,i.TEXTURE_COMPARE_FUNC,Ae[S.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(S.magFilter===Mn||S.minFilter!==wa&&S.minFilter!==Ms||S.type===wi&&t.has("OES_texture_float_linear")===!1)return;if(S.anisotropy>1||n.get(S).__currentAnisotropy){let Y=t.get("EXT_texture_filter_anisotropic");i.texParameterf(L,Y.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(S.anisotropy,s.getMaxAnisotropy())),n.get(S).__currentAnisotropy=S.anisotropy}}}function fe(L,S){let Y=!1;L.__webglInit===void 0&&(L.__webglInit=!0,S.addEventListener("dispose",U));let K=S.source,ot=f.get(K);ot===void 0&&(ot={},f.set(K,ot));let Mt=rt(S);if(Mt!==L.__cacheKey){ot[Mt]===void 0&&(ot[Mt]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,Y=!0),ot[Mt].usedTimes++;let Tt=ot[L.__cacheKey];Tt!==void 0&&(ot[L.__cacheKey].usedTimes--,Tt.usedTimes===0&&F(S)),L.__cacheKey=Mt,L.__webglTexture=ot[Mt].texture}return Y}function ct(L,S,Y){return Math.floor(Math.floor(L/Y)/S)}function gt(L,S,Y,K){let Mt=L.updateRanges;if(Mt.length===0)e.texSubImage2D(i.TEXTURE_2D,0,0,0,S.width,S.height,Y,K,S.data);else{Mt.sort((zt,At)=>zt.start-At.start);let Tt=0;for(let zt=1;zt<Mt.length;zt++){let At=Mt[Tt],Et=Mt[zt],Xt=At.start+At.count,Zt=ct(Et.start,S.width,4),se=ct(At.start,S.width,4);Et.start<=Xt+1&&Zt===se&&ct(Et.start+Et.count-1,S.width,4)===Zt?At.count=Math.max(At.count,Et.start+Et.count-At.start):(++Tt,Mt[Tt]=Et)}Mt.length=Tt+1;let ht=e.getParameter(i.UNPACK_ROW_LENGTH),pt=e.getParameter(i.UNPACK_SKIP_PIXELS),Ct=e.getParameter(i.UNPACK_SKIP_ROWS);e.pixelStorei(i.UNPACK_ROW_LENGTH,S.width);for(let zt=0,At=Mt.length;zt<At;zt++){let Et=Mt[zt],Xt=Math.floor(Et.start/4),Zt=Math.ceil(Et.count/4),se=Xt%S.width,V=Math.floor(Xt/S.width),bt=Zt,ft=1;e.pixelStorei(i.UNPACK_SKIP_PIXELS,se),e.pixelStorei(i.UNPACK_SKIP_ROWS,V),e.texSubImage2D(i.TEXTURE_2D,0,se,V,bt,ft,Y,K,S.data)}L.clearUpdateRanges(),e.pixelStorei(i.UNPACK_ROW_LENGTH,ht),e.pixelStorei(i.UNPACK_SKIP_PIXELS,pt),e.pixelStorei(i.UNPACK_SKIP_ROWS,Ct)}}function St(L,S,Y){let K=i.TEXTURE_2D;(S.isDataArrayTexture||S.isCompressedArrayTexture)&&(K=i.TEXTURE_2D_ARRAY),S.isData3DTexture&&(K=i.TEXTURE_3D);let ot=fe(L,S),Mt=S.source;e.bindTexture(K,L.__webglTexture,i.TEXTURE0+Y);let Tt=n.get(Mt);if(Mt.version!==Tt.__version||ot===!0){if(e.activeTexture(i.TEXTURE0+Y),(typeof ImageBitmap<"u"&&S.image instanceof ImageBitmap)===!1){let ft=we.getPrimaries(we.workingColorSpace),Rt=S.colorSpace===Zi?null:we.getPrimaries(S.colorSpace),Dt=S.colorSpace===Zi||ft===Rt?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,S.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Dt)}e.pixelStorei(i.UNPACK_ALIGNMENT,S.unpackAlignment);let pt=x(S.image,!1,s.maxTextureSize);pt=cn(S,pt);let Ct=r.convert(S.format,S.colorSpace),zt=r.convert(S.type),At=A(S.internalFormat,Ct,zt,S.normalized,S.colorSpace,S.isVideoTexture);_e(K,S);let Et,Xt=S.mipmaps,Zt=S.isVideoTexture!==!0,se=Tt.__version===void 0||ot===!0,V=Mt.dataReady,bt=R(S,pt);if(S.isDepthTexture)At=P(S.format===Ss,S.type),se&&(Zt?e.texStorage2D(i.TEXTURE_2D,1,At,pt.width,pt.height):e.texImage2D(i.TEXTURE_2D,0,At,pt.width,pt.height,0,Ct,zt,null));else if(S.isDataTexture)if(Xt.length>0){Zt&&se&&e.texStorage2D(i.TEXTURE_2D,bt,At,Xt[0].width,Xt[0].height);for(let ft=0,Rt=Xt.length;ft<Rt;ft++)Et=Xt[ft],Zt?V&&e.texSubImage2D(i.TEXTURE_2D,ft,0,0,Et.width,Et.height,Ct,zt,Et.data):e.texImage2D(i.TEXTURE_2D,ft,At,Et.width,Et.height,0,Ct,zt,Et.data);S.generateMipmaps=!1}else Zt?(se&&e.texStorage2D(i.TEXTURE_2D,bt,At,pt.width,pt.height),V&&gt(S,pt,Ct,zt)):e.texImage2D(i.TEXTURE_2D,0,At,pt.width,pt.height,0,Ct,zt,pt.data);else if(S.isCompressedTexture)if(S.isCompressedArrayTexture){Zt&&se&&e.texStorage3D(i.TEXTURE_2D_ARRAY,bt,At,Xt[0].width,Xt[0].height,pt.depth);for(let ft=0,Rt=Xt.length;ft<Rt;ft++)if(Et=Xt[ft],S.format!==di)if(Ct!==null)if(Zt){if(V)if(S.layerUpdates.size>0){let Dt=Ch(Et.width,Et.height,S.format,S.type);for(let vt of S.layerUpdates){let qt=Et.data.subarray(vt*Dt/Et.data.BYTES_PER_ELEMENT,(vt+1)*Dt/Et.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ft,0,0,vt,Et.width,Et.height,1,Ct,qt)}}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ft,0,0,0,Et.width,Et.height,pt.depth,Ct,Et.data)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,ft,At,Et.width,Et.height,pt.depth,0,Et.data,0,0);else Qt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Zt?V&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,ft,0,0,0,Et.width,Et.height,pt.depth,Ct,zt,Et.data):e.texImage3D(i.TEXTURE_2D_ARRAY,ft,At,Et.width,Et.height,pt.depth,0,Ct,zt,Et.data);S.layerUpdates.size>0&&S.clearLayerUpdates()}else{Zt&&se&&e.texStorage2D(i.TEXTURE_2D,bt,At,Xt[0].width,Xt[0].height);for(let ft=0,Rt=Xt.length;ft<Rt;ft++)Et=Xt[ft],S.format!==di?Ct!==null?Zt?V&&e.compressedTexSubImage2D(i.TEXTURE_2D,ft,0,0,Et.width,Et.height,Ct,Et.data):e.compressedTexImage2D(i.TEXTURE_2D,ft,At,Et.width,Et.height,0,Et.data):Qt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Zt?V&&e.texSubImage2D(i.TEXTURE_2D,ft,0,0,Et.width,Et.height,Ct,zt,Et.data):e.texImage2D(i.TEXTURE_2D,ft,At,Et.width,Et.height,0,Ct,zt,Et.data)}else if(S.isDataArrayTexture)if(Zt){if(se&&e.texStorage3D(i.TEXTURE_2D_ARRAY,bt,At,pt.width,pt.height,pt.depth),V)if(S.layerUpdates.size>0){let ft=Ch(pt.width,pt.height,S.format,S.type);for(let Rt of S.layerUpdates){let Dt=pt.data.subarray(Rt*ft/pt.data.BYTES_PER_ELEMENT,(Rt+1)*ft/pt.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Rt,pt.width,pt.height,1,Ct,zt,Dt)}S.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,pt.width,pt.height,pt.depth,Ct,zt,pt.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,At,pt.width,pt.height,pt.depth,0,Ct,zt,pt.data);else if(S.isData3DTexture)Zt?(se&&e.texStorage3D(i.TEXTURE_3D,bt,At,pt.width,pt.height,pt.depth),V&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,pt.width,pt.height,pt.depth,Ct,zt,pt.data)):e.texImage3D(i.TEXTURE_3D,0,At,pt.width,pt.height,pt.depth,0,Ct,zt,pt.data);else if(S.isFramebufferTexture){if(se)if(Zt)e.texStorage2D(i.TEXTURE_2D,bt,At,pt.width,pt.height);else{let ft=pt.width,Rt=pt.height;for(let Dt=0;Dt<bt;Dt++)e.texImage2D(i.TEXTURE_2D,Dt,At,ft,Rt,0,Ct,zt,null),ft>>=1,Rt>>=1}}else if(S.isHTMLTexture){if("texElementImage2D"in i){let ft=i.canvas;if(ft.hasAttribute("layoutsubtree")||ft.setAttribute("layoutsubtree","true"),pt.parentNode!==ft){ft.appendChild(pt),m.add(S),ft.onpaint=Rt=>{let Dt=Rt.changedElements;for(let vt of m)Dt.includes(vt.image)&&(vt.needsUpdate=!0)},ft.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,pt);else{let Dt=i.RGBA,vt=i.RGBA,qt=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,Dt,vt,qt,pt)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(Xt.length>0){if(Zt&&se){let ft=ve(Xt[0]);e.texStorage2D(i.TEXTURE_2D,bt,At,ft.width,ft.height)}for(let ft=0,Rt=Xt.length;ft<Rt;ft++)Et=Xt[ft],Zt?V&&e.texSubImage2D(i.TEXTURE_2D,ft,0,0,Ct,zt,Et):e.texImage2D(i.TEXTURE_2D,ft,At,Ct,zt,Et);S.generateMipmaps=!1}else if(Zt){if(se){let ft=ve(pt);e.texStorage2D(i.TEXTURE_2D,bt,At,ft.width,ft.height)}V&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,Ct,zt,pt)}else e.texImage2D(i.TEXTURE_2D,0,At,Ct,zt,pt);p(S)&&C(K),Tt.__version=Mt.version,S.onUpdate&&S.onUpdate(S)}L.__version=S.version}function Kt(L,S,Y){if(S.image.length!==6)return;let K=fe(L,S),ot=S.source;e.bindTexture(i.TEXTURE_CUBE_MAP,L.__webglTexture,i.TEXTURE0+Y);let Mt=n.get(ot);if(ot.version!==Mt.__version||K===!0){e.activeTexture(i.TEXTURE0+Y);let Tt=we.getPrimaries(we.workingColorSpace),ht=S.colorSpace===Zi?null:we.getPrimaries(S.colorSpace),pt=S.colorSpace===Zi||Tt===ht?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,S.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),e.pixelStorei(i.UNPACK_ALIGNMENT,S.unpackAlignment),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,pt);let Ct=S.isCompressedTexture||S.image[0].isCompressedTexture,zt=S.image[0]&&S.image[0].isDataTexture,At=[];for(let vt=0;vt<6;vt++)!Ct&&!zt?At[vt]=x(S.image[vt],!0,s.maxCubemapSize):At[vt]=zt?S.image[vt].image:S.image[vt],At[vt]=cn(S,At[vt]);let Et=At[0],Xt=r.convert(S.format,S.colorSpace),Zt=r.convert(S.type),se=A(S.internalFormat,Xt,Zt,S.normalized,S.colorSpace),V=S.isVideoTexture!==!0,bt=Mt.__version===void 0||K===!0,ft=ot.dataReady,Rt=R(S,Et);_e(i.TEXTURE_CUBE_MAP,S);let Dt;if(Ct){V&&bt&&e.texStorage2D(i.TEXTURE_CUBE_MAP,Rt,se,Et.width,Et.height);for(let vt=0;vt<6;vt++){Dt=At[vt].mipmaps;for(let qt=0;qt<Dt.length;qt++){let Gt=Dt[qt];S.format!==di?Xt!==null?V?ft&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+vt,qt,0,0,Gt.width,Gt.height,Xt,Gt.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+vt,qt,se,Gt.width,Gt.height,0,Gt.data):Qt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):V?ft&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+vt,qt,0,0,Gt.width,Gt.height,Xt,Zt,Gt.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+vt,qt,se,Gt.width,Gt.height,0,Xt,Zt,Gt.data)}}}else{if(Dt=S.mipmaps,V&&bt){Dt.length>0&&Rt++;let vt=ve(At[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,Rt,se,vt.width,vt.height)}for(let vt=0;vt<6;vt++)if(zt){V?ft&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+vt,0,0,0,At[vt].width,At[vt].height,Xt,Zt,At[vt].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+vt,0,se,At[vt].width,At[vt].height,0,Xt,Zt,At[vt].data);for(let qt=0;qt<Dt.length;qt++){let Ue=Dt[qt].image[vt].image;V?ft&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+vt,qt+1,0,0,Ue.width,Ue.height,Xt,Zt,Ue.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+vt,qt+1,se,Ue.width,Ue.height,0,Xt,Zt,Ue.data)}}else{V?ft&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+vt,0,0,0,Xt,Zt,At[vt]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+vt,0,se,Xt,Zt,At[vt]);for(let qt=0;qt<Dt.length;qt++){let Gt=Dt[qt];V?ft&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+vt,qt+1,0,0,Xt,Zt,Gt.image[vt]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+vt,qt+1,se,Xt,Zt,Gt.image[vt])}}}p(S)&&C(i.TEXTURE_CUBE_MAP),Mt.__version=ot.version,S.onUpdate&&S.onUpdate(S)}L.__version=S.version}function Ot(L,S,Y,K,ot,Mt){let Tt=r.convert(Y.format,Y.colorSpace),ht=r.convert(Y.type),pt=A(Y.internalFormat,Tt,ht,Y.normalized,Y.colorSpace),Ct=n.get(S),zt=n.get(Y);if(zt.__renderTarget=S,!Ct.__hasExternalTextures){let At=Math.max(1,S.width>>Mt),Et=Math.max(1,S.height>>Mt);ot===i.TEXTURE_3D||ot===i.TEXTURE_2D_ARRAY?e.texImage3D(ot,Mt,pt,At,Et,S.depth,0,Tt,ht,null):e.texImage2D(ot,Mt,pt,At,Et,0,Tt,ht,null)}e.bindFramebuffer(i.FRAMEBUFFER,L),Ze(S)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,K,ot,zt.__webglTexture,0,ke(S)):(ot===i.TEXTURE_2D||ot>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&ot<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,K,ot,zt.__webglTexture,Mt),e.bindFramebuffer(i.FRAMEBUFFER,null)}function ie(L,S,Y){if(i.bindRenderbuffer(i.RENDERBUFFER,L),S.depthBuffer){let K=S.depthTexture,ot=K&&K.isDepthTexture?K.type:null,Mt=P(S.stencilBuffer,ot),Tt=S.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;Ze(S)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ke(S),Mt,S.width,S.height):Y?i.renderbufferStorageMultisample(i.RENDERBUFFER,ke(S),Mt,S.width,S.height):i.renderbufferStorage(i.RENDERBUFFER,Mt,S.width,S.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,Tt,i.RENDERBUFFER,L)}else{let K=S.textures;for(let ot=0;ot<K.length;ot++){let Mt=K[ot],Tt=r.convert(Mt.format,Mt.colorSpace),ht=r.convert(Mt.type),pt=A(Mt.internalFormat,Tt,ht,Mt.normalized,Mt.colorSpace);Ze(S)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,ke(S),pt,S.width,S.height):Y?i.renderbufferStorageMultisample(i.RENDERBUFFER,ke(S),pt,S.width,S.height):i.renderbufferStorage(i.RENDERBUFFER,pt,S.width,S.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Jt(L,S,Y){let K=S.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(i.FRAMEBUFFER,L),!(S.depthTexture&&S.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let ot=n.get(S.depthTexture);if(ot.__renderTarget=S,(!ot.__webglTexture||S.depthTexture.image.width!==S.width||S.depthTexture.image.height!==S.height)&&(S.depthTexture.image.width=S.width,S.depthTexture.image.height=S.height,S.depthTexture.needsUpdate=!0),K){if(ot.__webglInit===void 0&&(ot.__webglInit=!0,S.depthTexture.addEventListener("dispose",U)),ot.__webglTexture===void 0){ot.__webglTexture=i.createTexture(),e.bindTexture(i.TEXTURE_CUBE_MAP,ot.__webglTexture),_e(i.TEXTURE_CUBE_MAP,S.depthTexture);let Ct=r.convert(S.depthTexture.format),zt=r.convert(S.depthTexture.type),At;S.depthTexture.format===Pi?At=i.DEPTH_COMPONENT24:S.depthTexture.format===Ss&&(At=i.DEPTH24_STENCIL8);for(let Et=0;Et<6;Et++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Et,0,At,S.width,S.height,0,Ct,zt,null)}}else J(S.depthTexture,0);let Mt=ot.__webglTexture,Tt=ke(S),ht=K?i.TEXTURE_CUBE_MAP_POSITIVE_X+Y:i.TEXTURE_2D,pt=S.depthTexture.format===Ss?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(S.depthTexture.format===Pi)Ze(S)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,pt,ht,Mt,0,Tt):i.framebufferTexture2D(i.FRAMEBUFFER,pt,ht,Mt,0);else if(S.depthTexture.format===Ss)Ze(S)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,pt,ht,Mt,0,Tt):i.framebufferTexture2D(i.FRAMEBUFFER,pt,ht,Mt,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function oe(L){let S=n.get(L),Y=L.isWebGLCubeRenderTarget===!0;if(S.__boundDepthTexture!==L.depthTexture){let K=L.depthTexture;if(S.__depthDisposeCallback&&S.__depthDisposeCallback(),K){let ot=()=>{delete S.__boundDepthTexture,delete S.__depthDisposeCallback,K.removeEventListener("dispose",ot)};K.addEventListener("dispose",ot),S.__depthDisposeCallback=ot}S.__boundDepthTexture=K}if(L.depthTexture&&!S.__autoAllocateDepthBuffer)if(Y)for(let K=0;K<6;K++)Jt(S.__webglFramebuffer[K],L,K);else{let K=L.texture.mipmaps;K&&K.length>0?Jt(S.__webglFramebuffer[0],L,0):Jt(S.__webglFramebuffer,L,0)}else if(Y){S.__webglDepthbuffer=[];for(let K=0;K<6;K++)if(e.bindFramebuffer(i.FRAMEBUFFER,S.__webglFramebuffer[K]),S.__webglDepthbuffer[K]===void 0)S.__webglDepthbuffer[K]=i.createRenderbuffer(),ie(S.__webglDepthbuffer[K],L,!1);else{let ot=L.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Mt=S.__webglDepthbuffer[K];i.bindRenderbuffer(i.RENDERBUFFER,Mt),i.framebufferRenderbuffer(i.FRAMEBUFFER,ot,i.RENDERBUFFER,Mt)}}else{let K=L.texture.mipmaps;if(K&&K.length>0?e.bindFramebuffer(i.FRAMEBUFFER,S.__webglFramebuffer[0]):e.bindFramebuffer(i.FRAMEBUFFER,S.__webglFramebuffer),S.__webglDepthbuffer===void 0)S.__webglDepthbuffer=i.createRenderbuffer(),ie(S.__webglDepthbuffer,L,!1);else{let ot=L.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Mt=S.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,Mt),i.framebufferRenderbuffer(i.FRAMEBUFFER,ot,i.RENDERBUFFER,Mt)}}e.bindFramebuffer(i.FRAMEBUFFER,null)}function ye(L,S,Y){let K=n.get(L);S!==void 0&&Ot(K.__webglFramebuffer,L,L.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),Y!==void 0&&oe(L)}function le(L){let S=L.texture,Y=n.get(L),K=n.get(S);L.addEventListener("dispose",y);let ot=L.textures,Mt=L.isWebGLCubeRenderTarget===!0,Tt=ot.length>1;if(Tt||(K.__webglTexture===void 0&&(K.__webglTexture=i.createTexture()),K.__version=S.version,a.memory.textures++),Mt){Y.__webglFramebuffer=[];for(let ht=0;ht<6;ht++)if(S.mipmaps&&S.mipmaps.length>0){Y.__webglFramebuffer[ht]=[];for(let pt=0;pt<S.mipmaps.length;pt++)Y.__webglFramebuffer[ht][pt]=i.createFramebuffer()}else Y.__webglFramebuffer[ht]=i.createFramebuffer()}else{if(S.mipmaps&&S.mipmaps.length>0){Y.__webglFramebuffer=[];for(let ht=0;ht<S.mipmaps.length;ht++)Y.__webglFramebuffer[ht]=i.createFramebuffer()}else Y.__webglFramebuffer=i.createFramebuffer();if(Tt)for(let ht=0,pt=ot.length;ht<pt;ht++){let Ct=n.get(ot[ht]);Ct.__webglTexture===void 0&&(Ct.__webglTexture=i.createTexture(),a.memory.textures++)}if(L.samples>0&&Ze(L)===!1){Y.__webglMultisampledFramebuffer=i.createFramebuffer(),Y.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,Y.__webglMultisampledFramebuffer);for(let ht=0;ht<ot.length;ht++){let pt=ot[ht];Y.__webglColorRenderbuffer[ht]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,Y.__webglColorRenderbuffer[ht]);let Ct=r.convert(pt.format,pt.colorSpace),zt=r.convert(pt.type),At=A(pt.internalFormat,Ct,zt,pt.normalized,pt.colorSpace,L.isXRRenderTarget===!0),Et=ke(L);i.renderbufferStorageMultisample(i.RENDERBUFFER,Et,At,L.width,L.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ht,i.RENDERBUFFER,Y.__webglColorRenderbuffer[ht])}i.bindRenderbuffer(i.RENDERBUFFER,null),L.depthBuffer&&(Y.__webglDepthRenderbuffer=i.createRenderbuffer(),ie(Y.__webglDepthRenderbuffer,L,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(Mt){e.bindTexture(i.TEXTURE_CUBE_MAP,K.__webglTexture),_e(i.TEXTURE_CUBE_MAP,S);for(let ht=0;ht<6;ht++)if(S.mipmaps&&S.mipmaps.length>0)for(let pt=0;pt<S.mipmaps.length;pt++)Ot(Y.__webglFramebuffer[ht][pt],L,S,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,pt);else Ot(Y.__webglFramebuffer[ht],L,S,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ht,0);p(S)&&C(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(Tt){for(let ht=0,pt=ot.length;ht<pt;ht++){let Ct=ot[ht],zt=n.get(Ct),At=i.TEXTURE_2D;(L.isWebGL3DRenderTarget||L.isWebGLArrayRenderTarget)&&(At=L.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(At,zt.__webglTexture),_e(At,Ct),Ot(Y.__webglFramebuffer,L,Ct,i.COLOR_ATTACHMENT0+ht,At,0),p(Ct)&&C(At)}e.unbindTexture()}else{let ht=i.TEXTURE_2D;if((L.isWebGL3DRenderTarget||L.isWebGLArrayRenderTarget)&&(ht=L.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(ht,K.__webglTexture),_e(ht,S),S.mipmaps&&S.mipmaps.length>0)for(let pt=0;pt<S.mipmaps.length;pt++)Ot(Y.__webglFramebuffer[pt],L,S,i.COLOR_ATTACHMENT0,ht,pt);else Ot(Y.__webglFramebuffer,L,S,i.COLOR_ATTACHMENT0,ht,0);p(S)&&C(ht),e.unbindTexture()}L.depthBuffer&&oe(L)}function he(L){let S=L.textures;for(let Y=0,K=S.length;Y<K;Y++){let ot=S[Y];if(p(ot)){let Mt=D(L),Tt=n.get(ot).__webglTexture;e.bindTexture(Mt,Tt),C(Mt),e.unbindTexture()}}}let Ge=[],ln=[];function bn(L){if(L.samples>0){if(Ze(L)===!1){let S=L.textures,Y=L.width,K=L.height,ot=i.COLOR_BUFFER_BIT,Mt=L.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Tt=n.get(L),ht=S.length>1;if(ht)for(let Ct=0;Ct<S.length;Ct++)e.bindFramebuffer(i.FRAMEBUFFER,Tt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ct,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,Tt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ct,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,Tt.__webglMultisampledFramebuffer);let pt=L.texture.mipmaps;pt&&pt.length>0?e.bindFramebuffer(i.DRAW_FRAMEBUFFER,Tt.__webglFramebuffer[0]):e.bindFramebuffer(i.DRAW_FRAMEBUFFER,Tt.__webglFramebuffer);for(let Ct=0;Ct<S.length;Ct++){if(L.resolveDepthBuffer&&(L.depthBuffer&&(ot|=i.DEPTH_BUFFER_BIT),L.stencilBuffer&&L.resolveStencilBuffer&&(ot|=i.STENCIL_BUFFER_BIT)),ht){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,Tt.__webglColorRenderbuffer[Ct]);let zt=n.get(S[Ct]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,zt,0)}i.blitFramebuffer(0,0,Y,K,0,0,Y,K,ot,i.NEAREST),l===!0&&(Ge.length=0,ln.length=0,Ge.push(i.COLOR_ATTACHMENT0+Ct),L.depthBuffer&&L.storeMultisampledDepthBuffer===!1&&(Ge.push(Mt),ln.push(Mt),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,ln)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Ge))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),ht)for(let Ct=0;Ct<S.length;Ct++){e.bindFramebuffer(i.FRAMEBUFFER,Tt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ct,i.RENDERBUFFER,Tt.__webglColorRenderbuffer[Ct]);let zt=n.get(S[Ct]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,Tt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ct,i.TEXTURE_2D,zt,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,Tt.__webglMultisampledFramebuffer)}else if(L.depthBuffer&&L.storeMultisampledDepthBuffer===!1&&l){let S=L.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[S])}}}function ke(L){return Math.min(s.maxSamples,L.samples)}function Ze(L){let S=n.get(L);return L.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&S.__useRenderToTexture!==!1}function B(L){let S=a.render.frame;d.get(L)!==S&&(d.set(L,S),L.update())}function cn(L,S){let Y=L.colorSpace,K=L.format,ot=L.type;return L.isCompressedTexture===!0||L.isVideoTexture===!0||Y!==Qr&&Y!==Zi&&(we.getTransfer(Y)===De?(K!==di||ot!==Zn)&&Qt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):te("WebGLTextures: Unsupported texture color space:",Y)),S}function ve(L){return typeof HTMLImageElement<"u"&&L instanceof HTMLImageElement?(c.width=L.naturalWidth||L.width,c.height=L.naturalHeight||L.height):typeof VideoFrame<"u"&&L instanceof VideoFrame?(c.width=L.displayWidth,c.height=L.displayHeight):(c.width=L.width,c.height=L.height),c}this.allocateTextureUnit=lt,this.resetTextureUnits=Q,this.getTextureUnits=k,this.setTextureUnits=et,this.setTexture2D=J,this.setTexture2DArray=st,this.setTexture3D=mt,this.setTextureCube=yt,this.rebindTextures=ye,this.setupRenderTarget=le,this.updateRenderTargetMipmap=he,this.updateMultisampleRenderTarget=bn,this.setupDepthRenderbuffer=oe,this.setupFrameBufferTexture=Ot,this.useMultisampledRTT=Ze,this.isReversedDepthBuffer=function(){return e.buffers.depth.getReversed()}}function wx(i,t){function e(n,s=Zi){let r,a=we.getTransfer(s);if(n===Zn)return i.UNSIGNED_BYTE;if(n===vl)return i.UNSIGNED_SHORT_4_4_4_4;if(n===yl)return i.UNSIGNED_SHORT_5_5_5_1;if(n===_h)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===xh)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===mh)return i.BYTE;if(n===gh)return i.SHORT;if(n===Cr)return i.UNSIGNED_SHORT;if(n===xl)return i.INT;if(n===bi)return i.UNSIGNED_INT;if(n===wi)return i.FLOAT;if(n===Ti)return i.HALF_FLOAT;if(n===vh)return i.ALPHA;if(n===yh)return i.RGB;if(n===di)return i.RGBA;if(n===Pi)return i.DEPTH_COMPONENT;if(n===Ss)return i.DEPTH_STENCIL;if(n===Mh)return i.RED;if(n===Ml)return i.RED_INTEGER;if(n===bs)return i.RG;if(n===Sl)return i.RG_INTEGER;if(n===bl)return i.RGBA_INTEGER;if(n===Ta||n===Aa||n===Ea||n===Ca)if(a===De)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Ta)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Aa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Ea)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Ca)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Ta)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Aa)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Ea)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Ca)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===wl||n===Tl||n===Al||n===El)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===wl)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Tl)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Al)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===El)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Cl||n===Rl||n===Pl||n===Il||n===Ll||n===Ra||n===Dl)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Cl||n===Rl)return a===De?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Pl)return a===De?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===Il)return r.COMPRESSED_R11_EAC;if(n===Ll)return r.COMPRESSED_SIGNED_R11_EAC;if(n===Ra)return r.COMPRESSED_RG11_EAC;if(n===Dl)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Nl||n===Ul||n===Fl||n===Ol||n===Bl||n===zl||n===kl||n===Vl||n===Gl||n===Hl||n===Wl||n===Xl||n===ql||n===Yl)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Nl)return a===De?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Ul)return a===De?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Fl)return a===De?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Ol)return a===De?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Bl)return a===De?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===zl)return a===De?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===kl)return a===De?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Vl)return a===De?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Gl)return a===De?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Hl)return a===De?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Wl)return a===De?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Xl)return a===De?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===ql)return a===De?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Yl)return a===De?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Zl||n===$l||n===Jl)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===Zl)return a===De?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===$l)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Jl)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Kl||n===jl||n===Pa||n===Ql)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===Kl)return r.COMPRESSED_RED_RGTC1_EXT;if(n===jl)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Pa)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Ql)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Rr?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}var Tx=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Ax=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Yh=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let n=new la(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=n}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,n=new _n({vertexShader:Tx,fragmentShader:Ax,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new ce(new qi(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Zh=class extends Ii{constructor(t,e){super();let n=this,s=null,r=1,a=null,o="local-floor",l=1,c=null,d=null,m=null,u=null,f=null,M=null,T=typeof XRWebGLBinding<"u",x=new Yh,p={},C=e.getContextAttributes(),D=null,A=null,P=[],R=[],U=new Bt,y=null,I=null,F=new Dn;F.viewport=new Je;let H=new Dn;H.viewport=new Je;let q=[F,H],Q=new dl,k=null,et=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(ct){let gt=P[ct];return gt===void 0&&(gt=new yr,P[ct]=gt),gt.getTargetRaySpace()},this.getControllerGrip=function(ct){let gt=P[ct];return gt===void 0&&(gt=new yr,P[ct]=gt),gt.getGripSpace()},this.getHand=function(ct){let gt=P[ct];return gt===void 0&&(gt=new yr,P[ct]=gt),gt.getHandSpace()};function lt(ct){let gt=R.indexOf(ct.inputSource);if(gt===-1)return;let St=P[gt];St!==void 0&&(St.update(ct.inputSource,ct.frame,c||a),St.dispatchEvent({type:ct.type,data:ct.inputSource}))}function rt(){s.removeEventListener("select",lt),s.removeEventListener("selectstart",lt),s.removeEventListener("selectend",lt),s.removeEventListener("squeeze",lt),s.removeEventListener("squeezestart",lt),s.removeEventListener("squeezeend",lt),s.removeEventListener("end",rt),s.removeEventListener("inputsourceschange",J);for(let ct=0;ct<P.length;ct++){let gt=R[ct];gt!==null&&(R[ct]=null,P[ct].disconnect(gt))}k=null,et=null,x.reset();for(let ct in p)delete p[ct];if(t.setRenderTarget(D),f=null,u=null,m=null,s=null,A=null,fe.stop(),n.isPresenting=!1,t.setPixelRatio(y),t.setSize(U.width,U.height,!1),I!==null){let ct=I.camera;ct.fov=I.fov,ct.zoom=I.zoom,ct.updateProjectionMatrix(),I=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(ct){r=ct,n.isPresenting===!0&&Qt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(ct){o=ct,n.isPresenting===!0&&Qt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(ct){c=ct},this.getBaseLayer=function(){return u!==null?u:f},this.getBinding=function(){return m===null&&T&&(m=new XRWebGLBinding(s,e)),m},this.getFrame=function(){return M},this.getSession=function(){return s},this.setSession=async function(ct){if(s=ct,s!==null){if(D=t.getRenderTarget(),s.addEventListener("select",lt),s.addEventListener("selectstart",lt),s.addEventListener("selectend",lt),s.addEventListener("squeeze",lt),s.addEventListener("squeezestart",lt),s.addEventListener("squeezeend",lt),s.addEventListener("end",rt),s.addEventListener("inputsourceschange",J),C.xrCompatible!==!0&&await e.makeXRCompatible(),y=t.getPixelRatio(),t.getSize(U),T&&"createProjectionLayer"in XRWebGLBinding.prototype){let St=null,Kt=null,Ot=null;C.depth&&(Ot=C.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,St=C.stencil?Ss:Pi,Kt=C.stencil?Rr:bi);let ie={colorFormat:e.RGBA8,depthFormat:Ot,scaleFactor:r};m=this.getBinding(),u=m.createProjectionLayer(ie),s.updateRenderState({layers:[u]}),t.setPixelRatio(1),t.setSize(u.textureWidth,u.textureHeight,!1),A=new qn(u.textureWidth,u.textureHeight,{format:di,type:Zn,depthTexture:new cs(u.textureWidth,u.textureHeight,Kt,void 0,void 0,void 0,void 0,void 0,void 0,St),stencilBuffer:C.stencil,colorSpace:t.outputColorSpace,samples:C.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1,storeMultisampledDepthBuffer:u.ignoreDepthValues===!1,storeMultisampledStencilBuffer:u.ignoreDepthValues===!1})}else{let St={antialias:C.antialias,alpha:!0,depth:C.depth,stencil:C.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,e,St),s.updateRenderState({baseLayer:f}),t.setPixelRatio(1),t.setSize(f.framebufferWidth,f.framebufferHeight,!1),A=new qn(f.framebufferWidth,f.framebufferHeight,{format:di,type:Zn,colorSpace:t.outputColorSpace,stencilBuffer:C.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}A.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),fe.setContext(s),fe.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return x.getDepthTexture()};function J(ct){for(let gt=0;gt<ct.removed.length;gt++){let St=ct.removed[gt],Kt=R.indexOf(St);Kt>=0&&(R[Kt]=null,P[Kt].disconnect(St))}for(let gt=0;gt<ct.added.length;gt++){let St=ct.added[gt],Kt=R.indexOf(St);if(Kt===-1){for(let ie=0;ie<P.length;ie++)if(ie>=R.length){R.push(St),Kt=ie;break}else if(R[ie]===null){R[ie]=St,Kt=ie;break}if(Kt===-1)break}let Ot=P[Kt];Ot&&Ot.connect(St)}}let st=new N,mt=new N;function yt(ct,gt,St){st.setFromMatrixPosition(gt.matrixWorld),mt.setFromMatrixPosition(St.matrixWorld);let Kt=st.distanceTo(mt),Ot=gt.projectionMatrix.elements,ie=St.projectionMatrix.elements,Jt=Ot[14]/(Ot[10]-1),oe=Ot[14]/(Ot[10]+1),ye=(Ot[9]+1)/Ot[5],le=(Ot[9]-1)/Ot[5],he=(Ot[8]-1)/Ot[0],Ge=(ie[8]+1)/ie[0],ln=Jt*he,bn=Jt*Ge,ke=Kt/(-he+Ge),Ze=ke*-he;if(gt.matrixWorld.decompose(ct.position,ct.quaternion,ct.scale),ct.translateX(Ze),ct.translateZ(ke),ct.matrixWorld.compose(ct.position,ct.quaternion,ct.scale),ct.matrixWorldInverse.copy(ct.matrixWorld).invert(),Ot[10]===-1)ct.projectionMatrix.copy(gt.projectionMatrix),ct.projectionMatrixInverse.copy(gt.projectionMatrixInverse);else{let B=Jt+ke,cn=oe+ke,ve=ln-Ze,L=bn+(Kt-Ze),S=ye*oe/cn*B,Y=le*oe/cn*B;ct.projectionMatrix.makePerspective(ve,L,S,Y,B,cn),ct.projectionMatrixInverse.copy(ct.projectionMatrix).invert()}}function $t(ct,gt){gt===null?ct.matrixWorld.copy(ct.matrix):ct.matrixWorld.multiplyMatrices(gt.matrixWorld,ct.matrix),ct.matrixWorldInverse.copy(ct.matrixWorld).invert()}this.updateCamera=function(ct){if(s===null)return;let gt=ct.near,St=ct.far;x.texture!==null&&(x.depthNear>0&&(gt=x.depthNear),x.depthFar>0&&(St=x.depthFar)),Q.near=H.near=F.near=gt,Q.far=H.far=F.far=St,(k!==Q.near||et!==Q.far)&&(s.updateRenderState({depthNear:Q.near,depthFar:Q.far}),k=Q.near,et=Q.far),Q.layers.mask=ct.layers.mask|6,F.layers.mask=Q.layers.mask&-5,H.layers.mask=Q.layers.mask&-3;let Kt=ct.parent,Ot=Q.cameras;$t(Q,Kt);for(let ie=0;ie<Ot.length;ie++)$t(Ot[ie],Kt);Ot.length===2?yt(Q,F,H):Q.projectionMatrix.copy(F.projectionMatrix),I===null&&ct.isPerspectiveCamera&&(I={camera:ct,fov:ct.fov,zoom:ct.zoom}),Wt(ct,Q,Kt)};function Wt(ct,gt,St){St===null?ct.matrix.copy(gt.matrixWorld):(ct.matrix.copy(St.matrixWorld),ct.matrix.invert(),ct.matrix.multiply(gt.matrixWorld)),ct.matrix.decompose(ct.position,ct.quaternion,ct.scale),ct.updateMatrixWorld(!0),ct.projectionMatrix.copy(gt.projectionMatrix),ct.projectionMatrixInverse.copy(gt.projectionMatrixInverse),ct.isPerspectiveCamera&&(ct.fov=Fo*2*Math.atan(1/ct.projectionMatrix.elements[5]),ct.zoom=1)}this.getCamera=function(){return Q},this.getFoveation=function(){if(!(u===null&&f===null))return l},this.setFoveation=function(ct){l=ct,u!==null&&(u.fixedFoveation=ct),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=ct)},this.hasDepthSensing=function(){return x.texture!==null},this.getDepthSensingMesh=function(){return x.getMesh(Q)},this.getCameraTexture=function(ct){return p[ct]};let Ae=null;function _e(ct,gt){if(d=gt.getViewerPose(c||a),M=gt,d!==null){let St=d.views;f!==null&&(t.setRenderTargetFramebuffer(A,f.framebuffer),t.setRenderTarget(A));let Kt=!1;St.length!==Q.cameras.length&&(Q.cameras.length=0,Kt=!0);for(let oe=0;oe<St.length;oe++){let ye=St[oe],le=null;if(f!==null)le=f.getViewport(ye);else{let Ge=m.getViewSubImage(u,ye);le=Ge.viewport,oe===0&&(t.setRenderTargetTextures(A,Ge.colorTexture,Ge.depthStencilTexture),t.setRenderTarget(A))}let he=q[oe];he===void 0&&(he=new Dn,he.layers.enable(oe),he.viewport=new Je,q[oe]=he),he.matrix.fromArray(ye.transform.matrix),he.matrix.decompose(he.position,he.quaternion,he.scale),he.projectionMatrix.fromArray(ye.projectionMatrix),he.projectionMatrixInverse.copy(he.projectionMatrix).invert(),he.viewport.set(le.x,le.y,le.width,le.height),oe===0&&(Q.matrix.copy(he.matrix),Q.matrix.decompose(Q.position,Q.quaternion,Q.scale)),Kt===!0&&Q.cameras.push(he)}let Ot=s.enabledFeatures;if(Ot&&Ot.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&T){m=n.getBinding();let oe=m.getDepthInformation(St[0]);oe&&oe.isValid&&oe.texture&&x.init(oe,s.renderState)}if(Ot&&Ot.includes("camera-access")&&T){t.state.unbindTexture(),m=n.getBinding();for(let oe=0;oe<St.length;oe++){let ye=St[oe].camera;if(ye){let le=p[ye];le||(le=new la,p[ye]=le);let he=m.getCameraImage(ye);le.sourceTexture=he}}}}for(let St=0;St<P.length;St++){let Kt=R[St],Ot=P[St];Kt!==null&&Ot!==void 0&&Ot.update(Kt,gt,c||a)}Ae&&Ae(ct,gt),gt.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:gt}),M=null}let fe=new nf;fe.setAnimationLoop(_e),this.setAnimationLoop=function(ct){Ae=ct},this.dispose=function(){}}},Ex=new Be,cf=new ae;cf.set(-1,0,0,0,1,0,0,0,1);function Cx(i,t){function e(x,p){x.matrixAutoUpdate===!0&&x.updateMatrix(),p.value.copy(x.matrix)}function n(x,p){p.color.getRGB(x.fogColor.value,Th(i)),p.isFog?(x.fogNear.value=p.near,x.fogFar.value=p.far):p.isFogExp2&&(x.fogDensity.value=p.density)}function s(x,p,C,D,A){p.isNodeMaterial?p.uniformsNeedUpdate=!1:p.isMeshBasicMaterial?r(x,p):p.isMeshLambertMaterial?(r(x,p),p.envMap&&(x.envMapIntensity.value=p.envMapIntensity)):p.isMeshToonMaterial?(r(x,p),m(x,p)):p.isMeshPhongMaterial?(r(x,p),d(x,p),p.envMap&&(x.envMapIntensity.value=p.envMapIntensity)):p.isMeshStandardMaterial?(r(x,p),u(x,p),p.isMeshPhysicalMaterial&&f(x,p,A)):p.isMeshMatcapMaterial?(r(x,p),M(x,p)):p.isMeshDepthMaterial?r(x,p):p.isMeshDistanceMaterial?(r(x,p),T(x,p)):p.isMeshNormalMaterial?r(x,p):p.isLineBasicMaterial?(a(x,p),p.isLineDashedMaterial&&o(x,p)):p.isPointsMaterial?l(x,p,C,D):p.isSpriteMaterial?c(x,p):p.isShadowMaterial?(x.color.value.copy(p.color),x.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(x,p){x.opacity.value=p.opacity,p.color&&x.diffuse.value.copy(p.color),p.emissive&&x.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(x.map.value=p.map,e(p.map,x.mapTransform)),p.alphaMap&&(x.alphaMap.value=p.alphaMap,e(p.alphaMap,x.alphaMapTransform)),p.bumpMap&&(x.bumpMap.value=p.bumpMap,e(p.bumpMap,x.bumpMapTransform),x.bumpScale.value=p.bumpScale,p.side===Sn&&(x.bumpScale.value*=-1)),p.normalMap&&(x.normalMap.value=p.normalMap,e(p.normalMap,x.normalMapTransform),x.normalScale.value.copy(p.normalScale),p.side===Sn&&x.normalScale.value.negate()),p.displacementMap&&(x.displacementMap.value=p.displacementMap,e(p.displacementMap,x.displacementMapTransform),x.displacementScale.value=p.displacementScale,x.displacementBias.value=p.displacementBias),p.emissiveMap&&(x.emissiveMap.value=p.emissiveMap,e(p.emissiveMap,x.emissiveMapTransform)),p.specularMap&&(x.specularMap.value=p.specularMap,e(p.specularMap,x.specularMapTransform)),p.alphaTest>0&&(x.alphaTest.value=p.alphaTest);let C=t.get(p),D=C.envMap,A=C.envMapRotation;D&&(x.envMap.value=D,x.envMapRotation.value.setFromMatrix4(Ex.makeRotationFromEuler(A)).transpose(),D.isCubeTexture&&D.isRenderTargetTexture===!1&&x.envMapRotation.value.premultiply(cf),x.reflectivity.value=p.reflectivity,x.ior.value=p.ior,x.refractionRatio.value=p.refractionRatio),p.lightMap&&(x.lightMap.value=p.lightMap,x.lightMapIntensity.value=p.lightMapIntensity,e(p.lightMap,x.lightMapTransform)),p.aoMap&&(x.aoMap.value=p.aoMap,x.aoMapIntensity.value=p.aoMapIntensity,e(p.aoMap,x.aoMapTransform))}function a(x,p){x.diffuse.value.copy(p.color),x.opacity.value=p.opacity,p.map&&(x.map.value=p.map,e(p.map,x.mapTransform))}function o(x,p){x.dashSize.value=p.dashSize,x.totalSize.value=p.dashSize+p.gapSize,x.scale.value=p.scale}function l(x,p,C,D){x.diffuse.value.copy(p.color),x.opacity.value=p.opacity,x.size.value=p.size*C,x.scale.value=D*.5,p.map&&(x.map.value=p.map,e(p.map,x.uvTransform)),p.alphaMap&&(x.alphaMap.value=p.alphaMap,e(p.alphaMap,x.alphaMapTransform)),p.alphaTest>0&&(x.alphaTest.value=p.alphaTest)}function c(x,p){x.diffuse.value.copy(p.color),x.opacity.value=p.opacity,x.rotation.value=p.rotation,p.map&&(x.map.value=p.map,e(p.map,x.mapTransform)),p.alphaMap&&(x.alphaMap.value=p.alphaMap,e(p.alphaMap,x.alphaMapTransform)),p.alphaTest>0&&(x.alphaTest.value=p.alphaTest)}function d(x,p){x.specular.value.copy(p.specular),x.shininess.value=Math.max(p.shininess,1e-4)}function m(x,p){p.gradientMap&&(x.gradientMap.value=p.gradientMap)}function u(x,p){x.metalness.value=p.metalness,p.metalnessMap&&(x.metalnessMap.value=p.metalnessMap,e(p.metalnessMap,x.metalnessMapTransform)),x.roughness.value=p.roughness,p.roughnessMap&&(x.roughnessMap.value=p.roughnessMap,e(p.roughnessMap,x.roughnessMapTransform)),p.envMap&&(x.envMapIntensity.value=p.envMapIntensity)}function f(x,p,C){x.ior.value=p.ior,p.sheen>0&&(x.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),x.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(x.sheenColorMap.value=p.sheenColorMap,e(p.sheenColorMap,x.sheenColorMapTransform)),p.sheenRoughnessMap&&(x.sheenRoughnessMap.value=p.sheenRoughnessMap,e(p.sheenRoughnessMap,x.sheenRoughnessMapTransform))),p.clearcoat>0&&(x.clearcoat.value=p.clearcoat,x.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(x.clearcoatMap.value=p.clearcoatMap,e(p.clearcoatMap,x.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(x.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,e(p.clearcoatRoughnessMap,x.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(x.clearcoatNormalMap.value=p.clearcoatNormalMap,e(p.clearcoatNormalMap,x.clearcoatNormalMapTransform),x.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===Sn&&x.clearcoatNormalScale.value.negate())),p.dispersion>0&&(x.dispersion.value=p.dispersion),p.retroreflectivity>0&&(x.retroreflectivity.value=p.retroreflectivity),p.iridescence>0&&(x.iridescence.value=p.iridescence,x.iridescenceIOR.value=p.iridescenceIOR,x.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],x.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(x.iridescenceMap.value=p.iridescenceMap,e(p.iridescenceMap,x.iridescenceMapTransform)),p.iridescenceThicknessMap&&(x.iridescenceThicknessMap.value=p.iridescenceThicknessMap,e(p.iridescenceThicknessMap,x.iridescenceThicknessMapTransform))),p.transmission>0&&(x.transmission.value=p.transmission,x.transmissionSamplerMap.value=C.texture,x.transmissionSamplerSize.value.set(C.width,C.height),p.transmissionMap&&(x.transmissionMap.value=p.transmissionMap,e(p.transmissionMap,x.transmissionMapTransform)),x.thickness.value=p.thickness,p.thicknessMap&&(x.thicknessMap.value=p.thicknessMap,e(p.thicknessMap,x.thicknessMapTransform)),x.attenuationDistance.value=p.attenuationDistance,x.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(x.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(x.anisotropyMap.value=p.anisotropyMap,e(p.anisotropyMap,x.anisotropyMapTransform))),x.specularIntensity.value=p.specularIntensity,x.specularColor.value.copy(p.specularColor),p.specularColorMap&&(x.specularColorMap.value=p.specularColorMap,e(p.specularColorMap,x.specularColorMapTransform)),p.specularIntensityMap&&(x.specularIntensityMap.value=p.specularIntensityMap,e(p.specularIntensityMap,x.specularIntensityMapTransform))}function M(x,p){p.matcap&&(x.matcap.value=p.matcap)}function T(x,p){let C=t.get(p).light;x.referencePosition.value.setFromMatrixPosition(C.matrixWorld),x.nearDistance.value=C.shadow.camera.near,x.farDistance.value=C.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function Rx(i,t,e,n){let s={},r={},a=[],o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(A,P){let R=P.program;n.uniformBlockBinding(A,R)}function c(A,P){let R=s[A.id];R===void 0&&(x(A),R=d(A),s[A.id]=R,A.addEventListener("dispose",C));let U=P.program;n.updateUBOMapping(A,U);let y=t.render.frame;r[A.id]!==y&&(u(A),r[A.id]=y)}function d(A){let P=m();A.__bindingPointIndex=P;let R=i.createBuffer(),U=A.__size,y=A.usage;return i.bindBuffer(i.UNIFORM_BUFFER,R),i.bufferData(i.UNIFORM_BUFFER,U,y),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,P,R),R}function m(){for(let A=0;A<o;A++)if(a.indexOf(A)===-1)return a.push(A),A;return te("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(A){let P=s[A.id],R=A.uniforms,U=A.__cache;i.bindBuffer(i.UNIFORM_BUFFER,P);for(let y=0,I=R.length;y<I;y++){let F=R[y];if(Array.isArray(F))for(let H=0,q=F.length;H<q;H++)f(F[H],y,H,U);else f(F,y,0,U)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(A,P,R,U){if(T(A,P,R,U)===!0){let y=A.__offset,I=A.value;if(Array.isArray(I)){let F=0;for(let H=0;H<I.length;H++){let q=I[H],Q=p(q);M(q,A.__data,F),typeof q!="number"&&typeof q!="boolean"&&!q.isMatrix3&&!ArrayBuffer.isView(q)&&(F+=Q.storage/Float32Array.BYTES_PER_ELEMENT)}}else M(I,A.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,y,A.__data)}}function M(A,P,R){typeof A=="number"||typeof A=="boolean"?P[0]=A:A.isMatrix3?(P[0]=A.elements[0],P[1]=A.elements[1],P[2]=A.elements[2],P[3]=0,P[4]=A.elements[3],P[5]=A.elements[4],P[6]=A.elements[5],P[7]=0,P[8]=A.elements[6],P[9]=A.elements[7],P[10]=A.elements[8],P[11]=0):ArrayBuffer.isView(A)?P.set(new A.constructor(A.buffer,A.byteOffset,P.length)):A.toArray(P,R)}function T(A,P,R,U){let y=A.value,I=P+"_"+R;if(U[I]===void 0)return typeof y=="number"||typeof y=="boolean"?U[I]=y:ArrayBuffer.isView(y)?U[I]=y.slice():U[I]=y.clone(),!0;{let F=U[I];if(typeof y=="number"||typeof y=="boolean"){if(F!==y)return U[I]=y,!0}else{if(ArrayBuffer.isView(y))return!0;if(F.equals(y)===!1)return F.copy(y),!0}}return!1}function x(A){let P=A.uniforms,R=0,U=16;for(let I=0,F=P.length;I<F;I++){let H=Array.isArray(P[I])?P[I]:[P[I]];for(let q=0,Q=H.length;q<Q;q++){let k=H[q],et=Array.isArray(k.value)?k.value:[k.value];for(let lt=0,rt=et.length;lt<rt;lt++){let J=et[lt],st=p(J),mt=R%U,yt=mt%st.boundary,$t=mt+yt;R+=yt,$t!==0&&U-$t<st.storage&&(R+=U-$t),k.__data=new Float32Array(st.storage/Float32Array.BYTES_PER_ELEMENT),k.__offset=R,R+=st.storage}}}let y=R%U;return y>0&&(R+=U-y),A.__size=R,A.__cache={},this}function p(A){let P={boundary:0,storage:0};return typeof A=="number"||typeof A=="boolean"?(P.boundary=4,P.storage=4):A.isVector2?(P.boundary=8,P.storage=8):A.isVector3||A.isColor?(P.boundary=16,P.storage=12):A.isVector4?(P.boundary=16,P.storage=16):A.isMatrix3?(P.boundary=48,P.storage=48):A.isMatrix4?(P.boundary=64,P.storage=64):A.isTexture?Qt("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(A)?(P.boundary=16,P.storage=A.byteLength):Qt("WebGLRenderer: Unsupported uniform value type.",A),P}function C(A){let P=A.target;P.removeEventListener("dispose",C);let R=a.indexOf(P.__bindingPointIndex);a.splice(R,1),i.deleteBuffer(s[P.id]),delete s[P.id],delete r[P.id]}function D(){for(let A in s)i.deleteBuffer(s[A]);a=[],s={},r={}}return{bind:l,update:c,dispose:D}}var Px=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Ni=null;function Ix(){return Ni===null&&(Ni=new Vo(Px,16,16,bs,Ti),Ni.name="DFG_LUT",Ni.minFilter=Cn,Ni.magFilter=Cn,Ni.wrapS=Ri,Ni.wrapT=Ri,Ni.generateMipmaps=!1,Ni.needsUpdate=!0),Ni}var oc=class{constructor(t={}){let{canvas:e=Ad(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:d="default",failIfMajorPerformanceCaveat:m=!1,reversedDepthBuffer:u=!1,outputBufferType:f=Zn}=t;this.isWebGLRenderer=!0;let M;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");M=n.getContextAttributes().alpha}else M=a;let T=f,x=new Set([bl,Sl,Ml]),p=new Set([Zn,bi,Cr,Rr,vl,yl]),C=new Uint32Array(4),D=new Int32Array(4),A=new N,P=null,R=null,U=[],y=[],I=null;this.domElement=e,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Si,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let F=this,H=!1,q=null,Q=null,k=null,et=null;this._outputColorSpace=mn;let lt=0,rt=0,J=null,st=-1,mt=null,yt=new Je,$t=new Je,Wt=null,Ae=new jt(0),_e=0,fe=e.width,ct=e.height,gt=1,St=null,Kt=null,Ot=new Je(0,0,fe,ct),ie=new Je(0,0,fe,ct),Jt=!1,oe=new Mr,ye=!1,le=!1,he=new Be,Ge=new N,ln=new Je,bn={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},ke=!1;function Ze(){return J===null?gt:1}let B=n;function cn(w,z){return e.getContext(w,z)}let ve,L,S,Y,K,ot,Mt,Tt,ht,pt,Ct,zt,At,Et,Xt,Zt,se,V,bt,ft,Rt,Dt,vt;try{let w={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:d,failIfMajorPerformanceCaveat:m};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${"186"}`),e.addEventListener("webglcontextlost",Ue,!1),e.addEventListener("webglcontextrestored",Ce,!1),e.addEventListener("webglcontextcreationerror",wn,!1),B===null){let z="webgl2";if(B=cn(z,w),B===null)throw cn(z)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}qt()}catch(w){throw e.removeEventListener("webglcontextlost",Ue,!1),e.removeEventListener("webglcontextrestored",Ce,!1),e.removeEventListener("webglcontextcreationerror",wn,!1),te("WebGLRenderer: "+w.message),w}function qt(){ve=new Bg(B),ve.init(),Rt=new wx(B,ve),L=new Cg(B,ve,t,Rt),S=new Sx(B,ve),L.reversedDepthBuffer&&u&&S.buffers.depth.setReversed(!0),Q=B.createFramebuffer(),k=B.createFramebuffer(),et=B.createFramebuffer(),Y=new Vg(B),K=new lx,ot=new bx(B,ve,S,K,L,Rt,Y),Mt=new Og(F),Tt=new Hp(B),Dt=new Ag(B,Tt),ht=new zg(B,Tt,Y,Dt),pt=new Hg(B,ht,Tt,Dt,Y),V=new Gg(B,L,ot),Xt=new Rg(K),Ct=new ox(F,Mt,ve,L,Dt,Xt),zt=new Cx(F,K),At=new hx,Et=new gx(ve),se=new Tg(F,Mt,S,pt,M,l),Zt=new Mx(F,pt,L),vt=new Rx(B,Y,L,S),bt=new Eg(B,ve,Y),ft=new kg(B,ve,Y),Y.programs=Ct.programs,F.capabilities=L,F.extensions=ve,F.properties=K,F.renderLists=At,F.shadowMap=Zt,F.state=S,F.info=Y}T!==Zn&&(I=new Xg(T,e.width,e.height,o,s,r));let Gt=new Zh(F,B);this.xr=Gt,this.getContext=function(){return B},this.getContextAttributes=function(){return B.getContextAttributes()},this.forceContextLoss=function(){let w=ve.get("WEBGL_lose_context");w&&w.loseContext()},this.forceContextRestore=function(){let w=ve.get("WEBGL_lose_context");w&&w.restoreContext()},this.getPixelRatio=function(){return gt},this.setPixelRatio=function(w){w!==void 0&&(gt=w,this.setSize(fe,ct,!1))},this.getSize=function(w){return w.set(fe,ct)},this.setSize=function(w,z,it=!0){if(Gt.isPresenting){Qt("WebGLRenderer: Can't change size while VR device is presenting.");return}fe=w,ct=z,e.width=Math.floor(w*gt),e.height=Math.floor(z*gt),it===!0&&(e.style.width=w+"px",e.style.height=z+"px"),I!==null&&I.setSize(e.width,e.height),this.setViewport(0,0,w,z)},this.getDrawingBufferSize=function(w){return w.set(fe*gt,ct*gt).floor()},this.setDrawingBufferSize=function(w,z,it){fe=w,ct=z,gt=it,e.width=Math.floor(w*it),e.height=Math.floor(z*it),this.setViewport(0,0,w,z)},this.setEffects=function(w){if(T===Zn){te("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(w){for(let z=0;z<w.length;z++)if(w[z].isOutputPass===!0){Qt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}I.setEffects(w||[])},this.getCurrentViewport=function(w){return w.copy(yt)},this.getViewport=function(w){return w.copy(Ot)},this.setViewport=function(w,z,it,j){w.isVector4?Ot.set(w.x,w.y,w.z,w.w):Ot.set(w,z,it,j),S.viewport(yt.copy(Ot).multiplyScalar(gt).round())},this.getScissor=function(w){return w.copy(ie)},this.setScissor=function(w,z,it,j){w.isVector4?ie.set(w.x,w.y,w.z,w.w):ie.set(w,z,it,j),S.scissor($t.copy(ie).multiplyScalar(gt).round())},this.getScissorTest=function(){return Jt},this.setScissorTest=function(w){S.setScissorTest(Jt=w)},this.setOpaqueSort=function(w){St=w},this.setTransparentSort=function(w){Kt=w},this.getClearColor=function(w){return w.copy(se.getClearColor())},this.setClearColor=function(){se.setClearColor(...arguments)},this.getClearAlpha=function(){return se.getClearAlpha()},this.setClearAlpha=function(){se.setClearAlpha(...arguments)},this.clear=function(w=!0,z=!0,it=!0){let j=0;if(w){let $=!1;if(J!==null){let It=J.texture.format;$=x.has(It)}if($){let It=J.texture.type,Ft=p.has(It),Pt=se.getClearColor(),tt=se.getClearAlpha(),Vt=Pt.r,re=Pt.g,pe=Pt.b;Ft?(C[0]=Vt,C[1]=re,C[2]=pe,C[3]=tt,B.clearBufferuiv(B.COLOR,0,C)):(D[0]=Vt,D[1]=re,D[2]=pe,D[3]=tt,B.clearBufferiv(B.COLOR,0,D))}else j|=B.COLOR_BUFFER_BIT}z&&(j|=B.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),it&&(j|=B.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),j!==0&&B.clear(j)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(w){w.setRenderer(this),q=w},this.dispose=function(){e.removeEventListener("webglcontextlost",Ue,!1),e.removeEventListener("webglcontextrestored",Ce,!1),e.removeEventListener("webglcontextcreationerror",wn,!1),se.dispose(),At.dispose(),Et.dispose(),K.dispose(),Mt.dispose(),pt.dispose(),Dt.dispose(),vt.dispose(),Ct.dispose(),Gt.dispose(),Gt.removeEventListener("sessionstart",Nr),Gt.removeEventListener("sessionend",za),Fi.stop()};function Ue(w){w.preventDefault(),ea("WebGLRenderer: Context Lost."),H=!0}function Ce(){ea("WebGLRenderer: Context Restored."),H=!1;let w=Y.autoReset,z=Zt.enabled,it=Zt.autoUpdate,j=Zt.needsUpdate,$=Zt.type;qt(),Y.autoReset=w,Zt.enabled=z,Zt.autoUpdate=it,Zt.needsUpdate=j,Zt.type=$}function wn(w){te("WebGLRenderer: A WebGL context could not be created. Reason: ",w.statusMessage)}function kn(w){let z=w.target;z.removeEventListener("dispose",kn),Vs(z)}function Vs(w){Fa(w),K.remove(w)}function Fa(w){let z=K.get(w).programs;z!==void 0&&(z.forEach(function(it){Ct.releaseProgram(it)}),w.isShaderMaterial&&Ct.releaseShaderCache(w))}this.renderBufferDirect=function(w,z,it,j,$,It){z===null&&(z=bn);let Ft=$.isMesh&&$.matrixWorld.determinantAffine()<0,Pt=Ga(w,z,it,j,$);S.setMaterial(j,Ft);let tt=it.index,Vt=1;if(j.wireframe===!0){if(tt=ht.getWireframeAttribute(it),tt===void 0)return;Vt=2}let re=it.drawRange,pe=it.attributes.position,kt=re.start*Vt,me=(re.start+re.count)*Vt;It!==null&&(kt=Math.max(kt,It.start*Vt),me=Math.min(me,(It.start+It.count)*Vt)),tt!==null?(kt=Math.max(kt,0),me=Math.min(me,tt.count)):pe!=null&&(kt=Math.max(kt,0),me=Math.min(me,pe.count));let We=me-kt;if(We<0||We===1/0)return;Dt.setup($,j,Pt,it,tt);let Fe,Ee=bt;if(tt!==null&&(Fe=Tt.get(tt),Ee=ft,Ee.setIndex(Fe)),$.isMesh)j.wireframe===!0?(S.setLineWidth(j.wireframeLinewidth*Ze()),Ee.setMode(B.LINES)):Ee.setMode(B.TRIANGLES);else if($.isLine){let dn=j.linewidth;dn===void 0&&(dn=1),S.setLineWidth(dn*Ze()),$.isLineSegments?Ee.setMode(B.LINES):$.isLineLoop?Ee.setMode(B.LINE_LOOP):Ee.setMode(B.LINE_STRIP)}else $.isPoints?Ee.setMode(B.POINTS):$.isSprite&&Ee.setMode(B.TRIANGLES);if($.isBatchedMesh)if(ve.get("WEBGL_multi_draw"))Ee.renderMultiDraw($._multiDrawStarts,$._multiDrawCounts,$._multiDrawCount);else{let dn=$._multiDrawStarts,Ut=$._multiDrawCounts,fn=$._multiDrawCount,Me=tt?Tt.get(tt).bytesPerElement:1,Tn=K.get(j).currentProgram.getUniforms();for(let Kn=0;Kn<fn;Kn++)Tn.setValue(B,"_gl_DrawID",Kn),Ee.render(dn[Kn]/Me,Ut[Kn])}else if($.isInstancedMesh)Ee.renderInstances(kt,We,$.count);else if(it.isInstancedBufferGeometry){let dn=it._maxInstanceCount!==void 0?it._maxInstanceCount:1/0,Ut=Math.min(it.instanceCount,dn);Ee.renderInstances(kt,We,Ut)}else Ee.render(kt,We)};function Oa(w,z,it,j){q!==null&&w.isNodeMaterial&&q.setObject(j,w),ye===!0&&Xt.setState(w,it,!1),w.transparent===!0&&w.side===Yn&&w.forceSinglePass===!1?(w.side=Sn,w.needsUpdate=!0,Jn(w,z,j),w.side=xs,w.needsUpdate=!0,Jn(w,z,j),w.side=Yn):Jn(w,z,j)}this.compile=function(w,z,it=null){it===null&&(it=w),q!==null&&q.renderStart(w,z,it),R=Et.get(it),R.init(z),y.push(R),it.traverseVisible(function($){$.isLight&&$.layers.test(z.layers)&&(R.pushLight($),$.castShadow&&R.pushShadow($))}),w!==it&&w.traverseVisible(function($){$.isLight&&$.layers.test(z.layers)&&(R.pushLight($),$.castShadow&&R.pushShadow($))}),R.setupLights(),q!==null&&q.updateLights(R.state.lightsArray),le=this.localClippingEnabled,ye=Xt.init(this.clippingPlanes,le),ye===!0&&Xt.setGlobalState(this.clippingPlanes,z),q!==null&&Zt.render(R.state.shadowsArray,it,z);let j=new Set;return w.traverse(function($){if(!($.isMesh||$.isPoints||$.isLine||$.isSprite))return;let It=$.material;if(It)if(Array.isArray(It))for(let Ft=0;Ft<It.length;Ft++){let Pt=It[Ft];Oa(Pt,it,z,$),j.add(Pt)}else Oa(It,it,z,$),j.add(It)}),R=y.pop(),q!==null&&q.renderEnd(),j},this.compileAsync=function(w,z,it=null){let j=this.compile(w,z,it);return new Promise($=>{function It(){if(j.forEach(function(Ft){let tt=K.get(Ft).currentProgram;(tt===void 0||tt.isReady())&&j.delete(Ft)}),j.size===0){$(w);return}setTimeout(It,10)}ve.get("KHR_parallel_shader_compile")!==null?It():setTimeout(It,10)})};let Nt=null;function Ba(w){Nt&&Nt(w)}function Nr(){Fi.stop()}function za(){Fi.start()}let Fi=new nf;Fi.setAnimationLoop(Ba),typeof self<"u"&&Fi.setContext(self),this.setAnimationLoop=function(w){Nt=w,Gt.setAnimationLoop(w),w===null?Fi.stop():Fi.start()},Gt.addEventListener("sessionstart",Nr),Gt.addEventListener("sessionend",za),this.render=function(w,z){if(z!==void 0&&z.isCamera!==!0){te("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(H===!0)return;q!==null&&q.renderStart(w,z);let it=Gt.enabled===!0&&Gt.isPresenting===!0,j=I!==null&&(J===null||it)&&I.begin(F,J);if(w.matrixWorldAutoUpdate===!0&&w.updateMatrixWorld(),z.parent===null&&z.matrixWorldAutoUpdate===!0&&z.updateMatrixWorld(),Gt.enabled===!0&&Gt.isPresenting===!0&&(I===null||I.isCompositing()===!1)&&(Gt.cameraAutoUpdate===!0&&Gt.updateCamera(z),z=Gt.getCamera()),w.isScene===!0&&w.onBeforeRender(F,w,z,J),R=Et.get(w,y.length),R.init(z),R.state.textureUnits=ot.getTextureUnits(),y.push(R),he.multiplyMatrices(z.projectionMatrix,z.matrixWorldInverse),oe.setFromProjectionMatrix(he,xi,z.reversedDepth),le=this.localClippingEnabled,ye=Xt.init(this.clippingPlanes,le),P=At.get(w,U.length),P.init(),U.push(P),Gt.enabled===!0&&Gt.isPresenting===!0){let Ft=F.xr.getDepthSensingMesh();Ft!==null&&Ur(Ft,z,-1/0,F.sortObjects)}Ur(w,z,0,F.sortObjects),P.finish(),q!==null&&q.updateLights(R.state.lightsArray),F.sortObjects===!0&&P.sort(St,Kt),ke=Gt.enabled===!1||Gt.isPresenting===!1||Gt.hasDepthSensing()===!1,ke&&se.addToRenderList(P,w),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),ye===!0&&Xt.beginShadows();let $=R.state.shadowsArray;if(Zt.render($,w,z),ye===!0&&Xt.endShadows(),(j&&I.hasRenderPass())===!1){let Ft=P.opaque,Pt=P.transmissive;if(R.setupLights(),z.isArrayCamera){let tt=z.cameras;if(Pt.length>0)for(let Vt=0,re=tt.length;Vt<re;Vt++){let pe=tt[Vt];Fr(Ft,Pt,w,pe)}ke&&se.render(w);for(let Vt=0,re=tt.length;Vt<re;Vt++){let pe=tt[Vt];_t(P,w,pe,pe.viewport)}}else Pt.length>0&&Fr(Ft,Pt,w,z),ke&&se.render(w),_t(P,w,z)}J!==null&&rt===0&&(ot.updateMultisampleRenderTarget(J),ot.updateRenderTargetMipmap(J)),j&&I.end(F),w.isScene===!0&&w.onAfterRender(F,w,z),Dt.resetDefaultState(),st=-1,mt=null,y.pop(),y.length>0?(R=y[y.length-1],ot.setTextureUnits(R.state.textureUnits),ye===!0&&Xt.setGlobalState(F.clippingPlanes,R.state.camera)):R=null,U.pop(),U.length>0?P=U[U.length-1]:P=null,q!==null&&q.renderEnd()};function Ur(w,z,it,j){if(w.visible===!1)return;if(w.layers.test(z.layers)){if(w.isGroup)it=w.renderOrder;else if(w.isLOD)w.autoUpdate===!0&&w.update(z);else if(w.isLightProbeGrid)R.pushLightProbeGrid(w);else if(w.isLight)R.pushLight(w),w.castShadow&&R.pushShadow(w);else if(w.isSprite){if(!w.frustumCulled||w.intersectsFrustum(oe)){j&&ln.setFromMatrixPosition(w.matrixWorld).applyMatrix4(he);let Ft=pt.update(w),Pt=w.material;Pt.visible&&P.push(w,Ft,Pt,it,ln.z,null,z)}}else if((w.isMesh||w.isLine||w.isPoints)&&(!w.frustumCulled||w.intersectsFrustum(oe))){let Ft=pt.update(w),Pt=w.material;if(j&&(w.boundingSphere!==void 0?(w.boundingSphere===null&&w.computeBoundingSphere(),ln.copy(w.boundingSphere.center)):(Ft.boundingSphere===null&&Ft.computeBoundingSphere(),ln.copy(Ft.boundingSphere.center)),ln.applyMatrix4(w.matrixWorld).applyMatrix4(he)),Array.isArray(Pt)){let tt=Ft.groups;for(let Vt=0,re=tt.length;Vt<re;Vt++){let pe=tt[Vt],kt=Pt[pe.materialIndex];kt&&kt.visible&&P.push(w,Ft,kt,it,ln.z,pe,z)}}else Pt.visible&&P.push(w,Ft,Pt,it,ln.z,null,z)}}let It=w.children;for(let Ft=0,Pt=It.length;Ft<Pt;Ft++)Ur(It[Ft],z,it,j)}function _t(w,z,it,j){let{opaque:$,transmissive:It,transparent:Ft}=w;R.setupLightsView(it),ye===!0&&Xt.setGlobalState(F.clippingPlanes,it),j&&S.viewport(yt.copy(j)),$.length>0&&$i($,z,it),It.length>0&&$i(It,z,it),Ft.length>0&&$i(Ft,z,it),S.buffers.depth.setTest(!0),S.buffers.depth.setMask(!0),S.buffers.color.setMask(!0),S.setPolygonOffset(!1)}function Fr(w,z,it,j){if((it.isScene===!0?it.overrideMaterial:null)!==null)return;if(R.state.transmissionRenderTarget[j.id]===void 0){let kt=ve.has("EXT_color_buffer_half_float")||ve.has("EXT_color_buffer_float");R.state.transmissionRenderTarget[j.id]=new qn(1,1,{generateMipmaps:!0,type:kt?Ti:Zn,minFilter:Ms,samples:Math.max(4,L.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:we.workingColorSpace})}let It=R.state.transmissionRenderTarget[j.id],Ft=j.viewport||yt;It.setSize(Ft.z*F.transmissionResolutionScale,Ft.w*F.transmissionResolutionScale);let Pt=F.getRenderTarget(),tt=F.getActiveCubeFace(),Vt=F.getActiveMipmapLevel();F.setRenderTarget(It),F.getClearColor(Ae),_e=F.getClearAlpha(),_e<1&&F.setClearColor(16777215,.5),F.clear(),ke&&se.render(it);let re=F.toneMapping;F.toneMapping=Si;let pe=j.viewport;if(j.viewport!==void 0&&(j.viewport=void 0),R.setupLightsView(j),ye===!0&&Xt.setGlobalState(F.clippingPlanes,j),$i(w,it,j),ot.updateMultisampleRenderTarget(It),ot.updateRenderTargetMipmap(It),ve.has("WEBGL_multisampled_render_to_texture")===!1){let kt=!1;for(let me=0,We=z.length;me<We;me++){let Fe=z[me],{object:Ee,geometry:dn,material:Ut,group:fn}=Fe;if(Ut.side===Yn&&Ee.layers.test(j.layers)){let Me=Ut.side;Ut.side=Sn,Ut.needsUpdate=!0,ka(Ee,it,j,dn,Ut,fn),Ut.side=Me,Ut.needsUpdate=!0,kt=!0}}kt===!0&&(ot.updateMultisampleRenderTarget(It),ot.updateRenderTargetMipmap(It))}F.setRenderTarget(Pt,tt,Vt),F.setClearColor(Ae,_e),pe!==void 0&&(j.viewport=pe),F.toneMapping=re}function $i(w,z,it){let j=z.isScene===!0?z.overrideMaterial:null;for(let $=0,It=w.length;$<It;$++){let Ft=w[$],{object:Pt,geometry:tt,group:Vt}=Ft,re=Ft.material;re.allowOverride===!0&&j!==null&&(re=j),Pt.layers.test(it.layers)&&ka(Pt,z,it,tt,re,Vt)}}function ka(w,z,it,j,$,It){q!==null&&$.isNodeMaterial&&q.setObject(w,$),w.onBeforeRender(F,z,it,j,$,It),w.modelViewMatrix.multiplyMatrices(it.matrixWorldInverse,w.matrixWorld),w.normalMatrix.getNormalMatrix(w.modelViewMatrix),$.onBeforeRender(F,z,it,j,w,It),$.transparent===!0&&$.side===Yn&&$.forceSinglePass===!1?($.side=Sn,$.needsUpdate=!0,F.renderBufferDirect(it,z,j,$,w,It),$.side=xs,$.needsUpdate=!0,F.renderBufferDirect(it,z,j,$,w,It),$.side=Yn):F.renderBufferDirect(it,z,j,$,w,It),w.onAfterRender(F,z,it,j,$,It)}function Jn(w,z,it){z.isScene!==!0&&(z=bn);let j=K.get(w),$=R.state.lights,It=R.state.shadowsArray,Ft=$.state.version,Pt=Ct.getParameters(w,$.state,It,z,it,R.state.lightProbeGridArray),tt=Ct.getProgramCacheKey(Pt),Vt=j.programs;j.environment=w.isMeshStandardMaterial||w.isMeshLambertMaterial||w.isMeshPhongMaterial?z.environment:null,j.fog=z.fog;let re=w.isMeshStandardMaterial||w.isMeshLambertMaterial&&!w.envMap||w.isMeshPhongMaterial&&!w.envMap;j.envMap=Mt.get(w.envMap||j.environment,re),j.envMapRotation=j.environment!==null&&w.envMap===null?z.environmentRotation:w.envMapRotation,Vt===void 0&&(w.addEventListener("dispose",kn),Vt=new Map,j.programs=Vt);let pe=Vt.get(tt);if(pe!==void 0){if(j.currentProgram===pe&&j.lightsStateVersion===Ft)return Va(w,Pt),pe}else Pt.uniforms=Ct.getUniforms(w),q!==null&&w.isNodeMaterial&&q.build(w,it,Pt),w.onBeforeCompile(Pt,F),pe=Ct.acquireProgram(Pt,tt),Vt.set(tt,pe),j.uniforms=Pt.uniforms;let kt=j.uniforms;return(!w.isShaderMaterial&&!w.isRawShaderMaterial||w.clipping===!0)&&(kt.clippingPlanes=Xt.uniform),Va(w,Pt),j.needsLights=ai(w),j.lightsStateVersion=Ft,j.needsLights&&(kt.ambientLightColor.value=$.state.ambient,kt.lightProbe.value=$.state.probe,kt.sunLights.value=$.state.sun,kt.sunLightShadows.value=$.state.sunShadow,kt.directionalLights.value=$.state.directional,kt.directionalLightShadows.value=$.state.directionalShadow,kt.spotLights.value=$.state.spot,kt.spotLightShadows.value=$.state.spotShadow,kt.rectAreaLights.value=$.state.rectArea,kt.ltc_1.value=$.state.rectAreaLTC1,kt.ltc_2.value=$.state.rectAreaLTC2,kt.pointLights.value=$.state.point,kt.pointLightShadows.value=$.state.pointShadow,kt.hemisphereLights.value=$.state.hemi,kt.sunShadowMatrix.value=$.state.sunShadowMatrix,kt.sunShadowCascade.value=$.state.sunShadowCascade,kt.directionalShadowMatrix.value=$.state.directionalShadowMatrix,kt.spotLightMatrix.value=$.state.spotLightMatrix,kt.spotLightMap.value=$.state.spotLightMap,kt.pointShadowMatrix.value=$.state.pointShadowMatrix),j.lightProbeGrid=R.state.lightProbeGridArray.length>0,j.currentProgram=pe,j.uniformsList=null,pe}function Or(w){if(w.uniformsList===null){let z=w.currentProgram.getUniforms();w.uniformsList=Lr.seqWithValue(z.seq,w.uniforms)}return w.uniformsList}function Va(w,z){let it=K.get(w);it.outputColorSpace=z.outputColorSpace,it.batching=z.batching,it.batchingColor=z.batchingColor,it.instancing=z.instancing,it.instancingColor=z.instancingColor,it.instancingMorph=z.instancingMorph,it.skinning=z.skinning,it.morphTargets=z.morphTargets,it.morphNormals=z.morphNormals,it.morphColors=z.morphColors,it.morphTargetsCount=z.morphTargetsCount,it.numClippingPlanes=z.numClippingPlanes,it.numIntersection=z.numClipIntersection,it.vertexAlphas=z.vertexAlphas,it.vertexTangents=z.vertexTangents,it.toneMapping=z.toneMapping}function hc(w,z){if(w.length===0)return null;if(w.length===1)return w[0].texture!==null?w[0]:null;A.setFromMatrixPosition(z.matrixWorld);for(let it=0,j=w.length;it<j;it++){let $=w[it];if($.texture!==null&&$.boundingBox.containsPoint(A))return $}return null}function Ga(w,z,it,j,$){z.isScene!==!0&&(z=bn),ot.resetTextureUnits();let It=z.fog,Ft=j.isMeshStandardMaterial||j.isMeshLambertMaterial||j.isMeshPhongMaterial?z.environment:null,Pt=J===null?F.outputColorSpace:J.isXRRenderTarget===!0?J.texture.colorSpace:we.workingColorSpace,tt=j.isMeshStandardMaterial||j.isMeshLambertMaterial&&!j.envMap||j.isMeshPhongMaterial&&!j.envMap,Vt=Mt.get(j.envMap||Ft,tt),re=j.vertexColors===!0&&!!it.attributes.color&&it.attributes.color.itemSize===4,pe=!!it.attributes.tangent&&(!!j.normalMap||j.anisotropy>0),kt=!!it.morphAttributes.position,me=!!it.morphAttributes.normal,We=!!it.morphAttributes.color,Fe=Si;j.toneMapped&&(J===null||J.isXRRenderTarget===!0)&&(Fe=F.toneMapping);let Ee=it.morphAttributes.position||it.morphAttributes.normal||it.morphAttributes.color,dn=Ee!==void 0?Ee.length:0,Ut=K.get(j),fn=R.state.lights;if(ye===!0&&(le===!0||w!==mt)){let Ne=w===mt&&j.id===st;Xt.setState(j,w,Ne)}let Me=!1;j.version===Ut.__version?(Ut.needsLights&&Ut.lightsStateVersion!==fn.state.version||Ut.outputColorSpace!==Pt||$.isBatchedMesh&&Ut.batching===!1||!$.isBatchedMesh&&Ut.batching===!0||$.isBatchedMesh&&Ut.batchingColor===!0&&$._colorsTexture===null||$.isBatchedMesh&&Ut.batchingColor===!1&&$._colorsTexture!==null||$.isInstancedMesh&&Ut.instancing===!1||!$.isInstancedMesh&&Ut.instancing===!0||$.isSkinnedMesh&&Ut.skinning===!1||!$.isSkinnedMesh&&Ut.skinning===!0||$.isInstancedMesh&&Ut.instancingColor===!0&&$.instanceColor===null||$.isInstancedMesh&&Ut.instancingColor===!1&&$.instanceColor!==null||$.isInstancedMesh&&Ut.instancingMorph===!0&&$.morphTexture===null||$.isInstancedMesh&&Ut.instancingMorph===!1&&$.morphTexture!==null||Ut.envMap!==Vt||j.fog===!0&&Ut.fog!==It||Ut.numClippingPlanes!==void 0&&(Ut.numClippingPlanes!==Xt.numPlanes||Ut.numIntersection!==Xt.numIntersection)||Ut.vertexAlphas!==re||Ut.vertexTangents!==pe||Ut.morphTargets!==kt||Ut.morphNormals!==me||Ut.morphColors!==We||Ut.toneMapping!==Fe||Ut.morphTargetsCount!==dn||!!Ut.lightProbeGrid!=R.state.lightProbeGridArray.length>0)&&(Me=!0):(Me=!0,Ut.__version=j.version);let Tn=Ut.currentProgram;Me===!0&&(Tn=Jn(j,z,$),q&&j.isNodeMaterial&&q.onUpdateProgram(j,Tn,Ut));let Kn=!1,xt=!1,Oi=!1,Re=Tn.getUniforms(),$e=Ut.uniforms;if(S.useProgram(Tn.program)&&(Kn=!0,xt=!0,Oi=!0),j.id!==st&&(st=j.id,xt=!0),Ut.needsLights){let Ne=hc(R.state.lightProbeGridArray,$);Ut.lightProbeGrid!==Ne&&(Ut.lightProbeGrid=Ne,xt=!0)}if(Kn||mt!==w){S.buffers.depth.getReversed()&&w.reversedDepth!==!0&&(w._reversedDepth=!0,w.updateProjectionMatrix()),Re.setValue(B,"projectionMatrix",w.projectionMatrix),Re.setValue(B,"viewMatrix",w.matrixWorldInverse);let Vn=Re.map.cameraPosition;Vn!==void 0&&Vn.setValue(B,Ge.setFromMatrixPosition(w.matrixWorld)),L.logarithmicDepthBuffer&&Re.setValue(B,"logDepthBufFC",2/(Math.log(w.far+1)/Math.LN2)),(j.isMeshPhongMaterial||j.isMeshToonMaterial||j.isMeshLambertMaterial||j.isMeshBasicMaterial||j.isMeshStandardMaterial||j.isShaderMaterial)&&Re.setValue(B,"isOrthographic",w.isOrthographicCamera===!0),mt!==w&&(mt=w,xt=!0,Oi=!0)}if(Ut.needsLights&&(fn.state.sunShadowMap.length>0&&Re.setValue(B,"sunShadowMap",fn.state.sunShadowMap,ot),fn.state.directionalShadowMap.length>0&&Re.setValue(B,"directionalShadowMap",fn.state.directionalShadowMap,ot),fn.state.spotShadowMap.length>0&&Re.setValue(B,"spotShadowMap",fn.state.spotShadowMap,ot),fn.state.pointShadowMap.length>0&&Re.setValue(B,"pointShadowMap",fn.state.pointShadowMap,ot)),$.isSkinnedMesh){Re.setOptional(B,$,"bindMatrix"),Re.setOptional(B,$,"bindMatrixInverse");let Ne=$.skeleton;Ne&&(Ne.boneTexture===null&&Ne.computeBoneTexture(),Re.setValue(B,"boneTexture",Ne.boneTexture,ot))}$.isBatchedMesh&&(Re.setOptional(B,$,"batchingTexture"),Re.setValue(B,"batchingTexture",$._matricesTexture,ot),Re.setOptional(B,$,"batchingIdTexture"),Re.setValue(B,"batchingIdTexture",$._indirectTexture,ot),Re.setOptional(B,$,"batchingColorTexture"),$._colorsTexture!==null&&Re.setValue(B,"batchingColorTexture",$._colorsTexture,ot));let An=it.morphAttributes;if((An.position!==void 0||An.normal!==void 0||An.color!==void 0)&&V.update($,it,Tn),(xt||Ut.receiveShadow!==$.receiveShadow)&&(Ut.receiveShadow=$.receiveShadow,Re.setValue(B,"receiveShadow",$.receiveShadow)),(j.isMeshStandardMaterial||j.isMeshLambertMaterial||j.isMeshPhongMaterial)&&j.envMap===null&&z.environment!==null&&($e.envMapIntensity.value=z.environmentIntensity),$e.dfgLUT!==void 0&&($e.dfgLUT.value=Ix()),xt){if(Re.setValue(B,"toneMappingExposure",F.toneMappingExposure),Ut.needsLights&&Gs($e,Oi),It&&j.fog===!0&&zt.refreshFogUniforms($e,It),zt.refreshMaterialUniforms($e,j,gt,ct,R.state.transmissionRenderTarget[w.id]),Ut.needsLights&&Ut.lightProbeGrid){let Ne=Ut.lightProbeGrid;$e.probesSH.value=Ne.texture,$e.probesMin.value.copy(Ne.boundingBox.min),$e.probesMax.value.copy(Ne.boundingBox.max),$e.probesResolution.value.copy(Ne.resolution)}Lr.upload(B,Or(Ut),$e,ot)}if(j.isShaderMaterial&&j.uniformsNeedUpdate===!0&&(Lr.upload(B,Or(Ut),$e,ot),j.uniformsNeedUpdate=!1),j.isSpriteMaterial&&Re.setValue(B,"center",$.center),Re.setValue(B,"modelViewMatrix",$.modelViewMatrix),Re.setValue(B,"normalMatrix",$.normalMatrix),Re.setValue(B,"modelMatrix",$.matrixWorld),j.uniformsGroups!==void 0){let Ne=j.uniformsGroups;for(let Vn=0,Ji=Ne.length;Vn<Ji;Vn++){let Ha=Ne[Vn];vt.update(Ha,Tn),vt.bind(Ha,Tn)}}return Tn}function Gs(w,z){w.ambientLightColor.needsUpdate=z,w.lightProbe.needsUpdate=z,w.sunLights.needsUpdate=z,w.sunLightShadows.needsUpdate=z,w.directionalLights.needsUpdate=z,w.directionalLightShadows.needsUpdate=z,w.pointLights.needsUpdate=z,w.pointLightShadows.needsUpdate=z,w.spotLights.needsUpdate=z,w.spotLightShadows.needsUpdate=z,w.rectAreaLights.needsUpdate=z,w.hemisphereLights.needsUpdate=z}function ai(w){return w.isMeshLambertMaterial||w.isMeshToonMaterial||w.isMeshPhongMaterial||w.isMeshStandardMaterial||w.isShadowMaterial||w.isShaderMaterial&&w.lights===!0}this.getActiveCubeFace=function(){return lt},this.getActiveMipmapLevel=function(){return rt},this.getRenderTarget=function(){return J},this.setRenderTargetTextures=function(w,z,it){let j=K.get(w);j.__autoAllocateDepthBuffer=w.resolveDepthBuffer===!1,j.__autoAllocateDepthBuffer===!1&&(j.__useRenderToTexture=!1),K.get(w.texture).__webglTexture=z,K.get(w.depthTexture).__webglTexture=j.__autoAllocateDepthBuffer?void 0:it,j.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(w,z){let it=K.get(w);it.__webglFramebuffer=z,it.__useDefaultFramebuffer=z===void 0},this.setRenderTarget=function(w,z=0,it=0){J=w,lt=z,rt=it;let j=null,$=!1,It=!1;if(w){let Pt=K.get(w);if(Pt.__useDefaultFramebuffer!==void 0){S.bindFramebuffer(B.FRAMEBUFFER,Pt.__webglFramebuffer),yt.copy(w.viewport),$t.copy(w.scissor),Wt=w.scissorTest,S.viewport(yt),S.scissor($t),S.setScissorTest(Wt),st=-1;return}else if(Pt.__webglFramebuffer===void 0)ot.setupRenderTarget(w);else if(Pt.__hasExternalTextures)ot.rebindTextures(w,K.get(w.texture).__webglTexture,K.get(w.depthTexture).__webglTexture);else if(w.depthBuffer){let re=w.depthTexture;if(Pt.__boundDepthTexture!==re){if(re!==null&&K.has(re)&&(w.width!==re.image.width||w.height!==re.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");ot.setupDepthRenderbuffer(w)}}let tt=w.texture;(tt.isData3DTexture||tt.isDataArrayTexture||tt.isCompressedArrayTexture)&&(It=!0);let Vt=K.get(w).__webglFramebuffer;w.isWebGLCubeRenderTarget?(Array.isArray(Vt[z])?j=Vt[z][it]:j=Vt[z],$=!0):w.samples>0&&ot.useMultisampledRTT(w)===!1?j=K.get(w).__webglMultisampledFramebuffer:Array.isArray(Vt)?j=Vt[it]:j=Vt,yt.copy(w.viewport),$t.copy(w.scissor),Wt=w.scissorTest}else yt.copy(Ot).multiplyScalar(gt).floor(),$t.copy(ie).multiplyScalar(gt).floor(),Wt=Jt;if(it!==0&&(j=Q),S.bindFramebuffer(B.FRAMEBUFFER,j)&&S.drawBuffers(w,j),S.viewport(yt),S.scissor($t),S.setScissorTest(Wt),$){let Pt=K.get(w.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_CUBE_MAP_POSITIVE_X+z,Pt.__webglTexture,it)}else if(It){let Pt=z;for(let tt=0;tt<w.textures.length;tt++){let Vt=K.get(w.textures[tt]);B.framebufferTextureLayer(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0+tt,Vt.__webglTexture,it,Pt)}}else if(w!==null&&it!==0){let Pt=K.get(w.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,Pt.__webglTexture,it)}st=-1};function ws(w){let z=K.get(w);return(z.__readFormat!==w.format||z.__readType!==w.type)&&(z.__readFormat=w.format,z.__readType=w.type,z.__formatReadable=L.textureFormatReadable(w.format),z.__typeReadable=L.textureTypeReadable(w.type)),z}this.readRenderTargetPixels=function(w,z,it,j,$,It,Ft,Pt=0){if(!(w&&w.isWebGLRenderTarget)){te("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let tt=K.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&Ft!==void 0&&(tt=tt[Ft]),tt){S.bindFramebuffer(B.FRAMEBUFFER,tt);try{let Vt=w.textures[Pt],re=Vt.format,pe=Vt.type;w.textures.length>1&&B.readBuffer(B.COLOR_ATTACHMENT0+Pt);let kt=ws(Vt);if(kt.__formatReadable===!1){te("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(kt.__typeReadable===!1){te("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}z>=0&&z<=w.width-j&&it>=0&&it<=w.height-$&&B.readPixels(z,it,j,$,Rt.convert(re),Rt.convert(pe),It)}finally{let Vt=J!==null?K.get(J).__webglFramebuffer:null;S.bindFramebuffer(B.FRAMEBUFFER,Vt)}}},this.readRenderTargetPixelsAsync=async function(w,z,it,j,$,It,Ft,Pt=0){if(!(w&&w.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let tt=K.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&Ft!==void 0&&(tt=tt[Ft]),tt)if(z>=0&&z<=w.width-j&&it>=0&&it<=w.height-$){S.bindFramebuffer(B.FRAMEBUFFER,tt);let Vt=w.textures[Pt],re=Vt.format,pe=Vt.type;w.textures.length>1&&B.readBuffer(B.COLOR_ATTACHMENT0+Pt);let kt=ws(Vt);if(kt.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(kt.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let me=B.createBuffer();B.bindBuffer(B.PIXEL_PACK_BUFFER,me),B.bufferData(B.PIXEL_PACK_BUFFER,It.byteLength,B.STREAM_READ),B.readPixels(z,it,j,$,Rt.convert(re),Rt.convert(pe),0),B.bindBuffer(B.PIXEL_PACK_BUFFER,null);let We=J!==null?K.get(J).__webglFramebuffer:null;S.bindFramebuffer(B.FRAMEBUFFER,We);let Fe=B.fenceSync(B.SYNC_GPU_COMMANDS_COMPLETE,0);return B.flush(),await Cd(B,Fe,4),B.bindBuffer(B.PIXEL_PACK_BUFFER,me),B.getBufferSubData(B.PIXEL_PACK_BUFFER,0,It),B.bindBuffer(B.PIXEL_PACK_BUFFER,null),B.deleteBuffer(me),B.deleteSync(Fe),It}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(w,z=null,it=0){let j=Math.pow(2,-it),$=Math.floor(w.image.width*j),It=Math.floor(w.image.height*j),Ft=z!==null?z.x:0,Pt=z!==null?z.y:0;ot.setTexture2D(w,0),B.copyTexSubImage2D(B.TEXTURE_2D,it,0,0,Ft,Pt,$,It),S.unbindTexture()},this.copyTextureToTexture=function(w,z,it=null,j=null,$=0,It=0){let Ft,Pt,tt,Vt,re,pe,kt,me,We,Fe=w.isCompressedTexture?w.mipmaps[It]:w.image;if(it!==null)Ft=it.max.x-it.min.x,Pt=it.max.y-it.min.y,tt=it.isBox3?it.max.z-it.min.z:1,Vt=it.min.x,re=it.min.y,pe=it.isBox3?it.min.z:0;else{let $e=Math.pow(2,-$);Ft=Math.floor(Fe.width*$e),Pt=Math.floor(Fe.height*$e),w.isDataArrayTexture?tt=Fe.depth:w.isData3DTexture?tt=Math.floor(Fe.depth*$e):tt=1,Vt=0,re=0,pe=0}j!==null?(kt=j.x,me=j.y,We=j.z):(kt=0,me=0,We=0);let Ee=Rt.convert(z.format),dn=Rt.convert(z.type),Ut;z.isData3DTexture?(ot.setTexture3D(z,0),Ut=B.TEXTURE_3D):z.isDataArrayTexture||z.isCompressedArrayTexture?(ot.setTexture2DArray(z,0),Ut=B.TEXTURE_2D_ARRAY):(ot.setTexture2D(z,0),Ut=B.TEXTURE_2D),S.activeTexture(B.TEXTURE0),S.pixelStorei(B.UNPACK_FLIP_Y_WEBGL,z.flipY),S.pixelStorei(B.UNPACK_PREMULTIPLY_ALPHA_WEBGL,z.premultiplyAlpha),S.pixelStorei(B.UNPACK_ALIGNMENT,z.unpackAlignment);let fn=S.getParameter(B.UNPACK_ROW_LENGTH),Me=S.getParameter(B.UNPACK_IMAGE_HEIGHT),Tn=S.getParameter(B.UNPACK_SKIP_PIXELS),Kn=S.getParameter(B.UNPACK_SKIP_ROWS),xt=S.getParameter(B.UNPACK_SKIP_IMAGES);S.pixelStorei(B.UNPACK_ROW_LENGTH,Fe.width),S.pixelStorei(B.UNPACK_IMAGE_HEIGHT,Fe.height),S.pixelStorei(B.UNPACK_SKIP_PIXELS,Vt),S.pixelStorei(B.UNPACK_SKIP_ROWS,re),S.pixelStorei(B.UNPACK_SKIP_IMAGES,pe);let Oi=w.isDataArrayTexture||w.isData3DTexture,Re=z.isDataArrayTexture||z.isData3DTexture;if(w.isDepthTexture){let $e=K.get(w),An=K.get(z),Ne=K.get($e.__renderTarget),Vn=K.get(An.__renderTarget);S.bindFramebuffer(B.READ_FRAMEBUFFER,Ne.__webglFramebuffer),S.bindFramebuffer(B.DRAW_FRAMEBUFFER,Vn.__webglFramebuffer);for(let Ji=0;Ji<tt;Ji++)Oi&&(B.framebufferTextureLayer(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,K.get(w).__webglTexture,$,pe+Ji),B.framebufferTextureLayer(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,K.get(z).__webglTexture,It,We+Ji)),B.blitFramebuffer(Vt,re,Ft,Pt,kt,me,Ft,Pt,B.DEPTH_BUFFER_BIT,B.NEAREST);S.bindFramebuffer(B.READ_FRAMEBUFFER,null),S.bindFramebuffer(B.DRAW_FRAMEBUFFER,null)}else if($!==0||w.isRenderTargetTexture||K.has(w)){let $e=K.get(w),An=K.get(z);S.bindFramebuffer(B.READ_FRAMEBUFFER,k),S.bindFramebuffer(B.DRAW_FRAMEBUFFER,et);for(let Ne=0;Ne<tt;Ne++)Oi?B.framebufferTextureLayer(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,$e.__webglTexture,$,pe+Ne):B.framebufferTexture2D(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,$e.__webglTexture,$),Re?B.framebufferTextureLayer(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,An.__webglTexture,It,We+Ne):B.framebufferTexture2D(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,An.__webglTexture,It),$!==0?B.blitFramebuffer(Vt,re,Ft,Pt,kt,me,Ft,Pt,B.COLOR_BUFFER_BIT,B.NEAREST):Re?B.copyTexSubImage3D(Ut,It,kt,me,We+Ne,Vt,re,Ft,Pt):B.copyTexSubImage2D(Ut,It,kt,me,Vt,re,Ft,Pt);S.bindFramebuffer(B.READ_FRAMEBUFFER,null),S.bindFramebuffer(B.DRAW_FRAMEBUFFER,null)}else Re?w.isDataTexture||w.isData3DTexture?B.texSubImage3D(Ut,It,kt,me,We,Ft,Pt,tt,Ee,dn,Fe.data):z.isCompressedArrayTexture?B.compressedTexSubImage3D(Ut,It,kt,me,We,Ft,Pt,tt,Ee,Fe.data):B.texSubImage3D(Ut,It,kt,me,We,Ft,Pt,tt,Ee,dn,Fe):w.isDataTexture?B.texSubImage2D(B.TEXTURE_2D,It,kt,me,Ft,Pt,Ee,dn,Fe.data):w.isCompressedTexture?B.compressedTexSubImage2D(B.TEXTURE_2D,It,kt,me,Fe.width,Fe.height,Ee,Fe.data):B.texSubImage2D(B.TEXTURE_2D,It,kt,me,Ft,Pt,Ee,dn,Fe);S.pixelStorei(B.UNPACK_ROW_LENGTH,fn),S.pixelStorei(B.UNPACK_IMAGE_HEIGHT,Me),S.pixelStorei(B.UNPACK_SKIP_PIXELS,Tn),S.pixelStorei(B.UNPACK_SKIP_ROWS,Kn),S.pixelStorei(B.UNPACK_SKIP_IMAGES,xt),It===0&&z.generateMipmaps&&B.generateMipmap(Ut),S.unbindTexture()},this.initRenderTarget=function(w){K.get(w).__webglFramebuffer===void 0&&ot.setupRenderTarget(w)},this.initTexture=function(w){w.isCubeTexture?ot.setTextureCube(w,0):w.isData3DTexture?ot.setTexture3D(w,0):w.isDataArrayTexture||w.isCompressedArrayTexture?ot.setTexture2DArray(w,0):ot.setTexture2D(w,0),S.unbindTexture()},this.resetState=function(){lt=0,rt=0,J=null,S.reset(),Dt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return xi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=we._getDrawingBufferColorSpace(t),e.unpackColorSpace=we._getUnpackColorSpace()}};var He='"Sora", "Manrope", system-ui, sans-serif',an='"Manrope", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',ze="#F4F6FA",nn="#A7B0C0",Rn="#5EEAD4",Na="#FBBF24",Lx={listening:"Listening",thinking:"Thinking"},$h=1;async function Dx(){if(typeof FontFace>"u"||!document.fonts)return;let i=[new FontFace("Sora","url(../fonts/sora.woff2)",{weight:"300 800"}),new FontFace("Manrope","url(../fonts/manrope.woff2)",{weight:"400 700"})],t=Promise.all(i.map(async e=>{await e.load(),document.fonts.add(e)}));await Promise.race([t,new Promise(e=>setTimeout(e,2500))]).catch(()=>{})}var df=`
float hash3(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise3(vec3 x) {
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash3(i), hash3(i + vec3(1.0, 0.0, 0.0)), f.x), mix(hash3(i + vec3(0.0, 1.0, 0.0)), hash3(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
             mix(mix(hash3(i + vec3(0.0, 0.0, 1.0)), hash3(i + vec3(1.0, 0.0, 1.0)), f.x), mix(hash3(i + vec3(0.0, 1.0, 1.0)), hash3(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);
}`,Nx=`
uniform float uTime; uniform float uEnergy;
varying vec3 vN; varying vec3 vV; varying vec3 vP;
${df}
void main() {
  vec3 p = position;
  float d = noise3(p * 22.0 + vec3(0.0, uTime * 0.9, uTime * 0.6));
  p += normal * (d - 0.5) * (0.004 + uEnergy * 0.016);
  vP = p * 11.0;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`,Ux=`
uniform float uTime; uniform float uEnergy; uniform float uThink;
uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform vec3 uGlow;
varying vec3 vN; varying vec3 vV; varying vec3 vP;
${df}
void main() {
  vec3 n = normalize(vN); vec3 v = normalize(vV);
  float facing = max(dot(n, v), 0.0);
  float fres = pow(1.0 - facing, 2.4);
  float t = uTime * (0.22 + uThink * 0.9 + uEnergy * 0.4);
  vec3 q = vP * 0.9 + vec3(0.0, t, -t * 0.6);
  float w = noise3(q * 1.6 + vec3(t));
  float f1 = noise3(q + w * 1.8);
  float f2 = noise3(q * 1.4 - vec3(t * 0.7, -t * 0.4, 0.0) + w);
  vec3 col = mix(uA, uB, smoothstep(0.3, 0.7, f1));
  col = mix(col, uC, smoothstep(0.45, 0.85, f2) * 0.8);
  float core = pow(facing, 3.5);
  col *= 0.55 + 0.6 * core;
  col += uGlow * core * (0.16 + uEnergy * 0.8);
  col += fres * vec3(0.78, 0.92, 1.0) * (0.85 + uEnergy * 0.8);
  vec3 l = normalize(vec3(-0.4, 0.7, 0.6));
  col += pow(max(dot(reflect(-l, n), v), 0.0), 40.0) * 0.55;
  gl_FragColor = vec4(col, 0.9 + fres * 0.1);
}`;function Ke(i,t,e=2400){let n=document.createElement("canvas");n.width=Math.max(8,Math.round(i*e)),n.height=Math.max(8,Math.round(t*e));let s=n.getContext("2d"),r=new Us(n);r.colorSpace=mn,r.anisotropy=$h;let a=new rn({map:r,transparent:!0,depthWrite:!1}),o=new ce(new qi(i,t),a);return{canvas:n,ctx:s,tex:r,mesh:o,w:n.width,h:n.height,update(){r.needsUpdate=!0}}}function $n(i,t,e,n,s,r){r=Math.min(r,n/2,s/2),i.beginPath(),i.moveTo(t+r,e),i.arcTo(t+n,e,t+n,e+s,r),i.arcTo(t+n,e+s,t,e+s,r),i.arcTo(t,e+s,t,e,r),i.arcTo(t,e,t+n,e,r),i.closePath()}function On(i,t,e,n,s={}){i.clearRect(0,0,t,e);let r=3,a=r;$n(i,a,a,t-a*2,e-a*2,n);let o=i.createLinearGradient(0,0,0,e);if(o.addColorStop(0,s.fill0||"rgba(24, 27, 36, 0.94)"),o.addColorStop(1,s.fill1||"rgba(13, 15, 21, 0.95)"),i.fillStyle=o,i.fill(),i.lineWidth=s.hot?r*1.6:r,i.strokeStyle=s.hot?"rgba(94, 234, 212, 0.9)":"rgba(255, 255, 255, 0.13)",i.stroke(),!s.hot){let l=i.createLinearGradient(a+n,0,t-a-n,0);l.addColorStop(0,"rgba(255,255,255,0)"),l.addColorStop(.5,"rgba(255,255,255,0.34)"),l.addColorStop(1,"rgba(255,255,255,0)"),i.fillStyle=l,i.fillRect(a+n,a-r/2,t-2*(a+n),r)}}function xe(i,t,e,n,s,r,a=500,o="left",l=an,c="0px"){i.font=`${a} ${s}px ${l}`,i.fillStyle=r,i.textAlign=o,i.textBaseline="alphabetic","letterSpacing"in i&&(i.letterSpacing=c),i.fillText(t,e,n),"letterSpacing"in i&&(i.letterSpacing="0px")}function Pn(i,t,e){if(t=String(t||""),i.measureText(t).width<=e)return t;for(;t&&i.measureText(t+"\u2026").width>e;)t=t.slice(0,-1);return t+"\u2026"}function hf(){let i=document.createElement("canvas");i.width=i.height=128;let t=i.getContext("2d"),e=t.createRadialGradient(64,64,0,64,64,64);e.addColorStop(0,"rgba(255,255,255,0.9)"),e.addColorStop(.35,"rgba(255,255,255,0.32)"),e.addColorStop(1,"rgba(255,255,255,0)"),t.fillStyle=e,t.fillRect(0,0,128,128);let n=new Us(i);return n.colorSpace=mn,n}var Fx={mic(i){i.beginPath(),$n(i,39,16,22,42,11),i.stroke(),i.beginPath(),i.arc(50,48,22,.12*Math.PI,.88*Math.PI),i.stroke(),i.beginPath(),i.moveTo(50,70),i.lineTo(50,84),i.stroke()},done(i){i.beginPath(),i.moveTo(27,52),i.lineTo(43,68),i.lineTo(74,35),i.stroke()},quiet(i){i.beginPath(),$n(i,32,32,36,36,7),i.stroke()},end(i){i.beginPath(),i.moveTo(20,60),i.quadraticCurveTo(50,32,80,60),i.lineTo(72,69),i.lineTo(61,61),i.lineTo(61,53),i.quadraticCurveTo(50,48,39,53),i.lineTo(39,61),i.lineTo(28,69),i.closePath(),i.stroke()},eye(i){i.beginPath(),i.moveTo(14,50),i.quadraticCurveTo(50,16,86,50),i.quadraticCurveTo(50,84,14,50),i.stroke(),i.beginPath(),i.arc(50,50,11,0,Math.PI*2),i.stroke()},pc(i){i.beginPath(),$n(i,16,22,68,44,6),i.stroke(),i.beginPath(),i.moveTo(36,82),i.lineTo(64,82),i.moveTo(50,66),i.lineTo(50,82),i.stroke()},pin(i){i.beginPath(),i.moveTo(50,86),i.lineTo(50,62),i.stroke(),i.beginPath(),i.moveTo(31,62),i.lineTo(69,62),i.lineTo(62,46),i.lineTo(62,20),i.lineTo(38,20),i.lineTo(38,46),i.closePath(),i.stroke()},leave(i){i.beginPath(),i.moveTo(32,32),i.lineTo(68,68),i.moveTo(68,32),i.lineTo(32,68),i.stroke()},think(i){for(let t=0;t<3;t++)i.beginPath(),i.arc(30+t*20,50,4.5,0,Math.PI*2),i.stroke()},photos(i){i.beginPath(),$n(i,16,24,68,52,8),i.stroke(),i.beginPath(),i.moveTo(23,69),i.lineTo(42,49),i.lineTo(56,62),i.lineTo(65,54),i.lineTo(78,69),i.stroke(),i.beginPath(),i.arc(64,38,5,0,Math.PI*2),i.stroke()},style(i){let t=(e,n,s)=>{i.beginPath(),i.moveTo(e,n-s),i.quadraticCurveTo(e,n,e+s,n),i.quadraticCurveTo(e,n,e,n+s),i.quadraticCurveTo(e,n,e-s,n),i.quadraticCurveTo(e,n,e,n-s),i.stroke()};t(44,56,26),t(74,28,12)},folder(i){i.beginPath(),i.moveTo(14,30),i.lineTo(40,30),i.lineTo(48,38),i.lineTo(86,38),i.lineTo(86,78),i.lineTo(14,78),i.closePath(),i.stroke()},doc(i){i.beginPath(),i.moveTo(28,14),i.lineTo(60,14),i.lineTo(76,30),i.lineTo(76,86),i.lineTo(28,86),i.closePath(),i.stroke(),i.beginPath(),i.moveTo(38,50),i.lineTo(66,50),i.moveTo(38,62),i.lineTo(66,62),i.moveTo(38,74),i.lineTo(56,74),i.stroke()},close(i){i.beginPath(),i.moveTo(34,34),i.lineTo(66,66),i.moveTo(66,34),i.lineTo(34,66),i.stroke()},back(i){i.beginPath(),i.moveTo(58,30),i.lineTo(38,50),i.lineTo(58,70),i.stroke()},next(i){i.beginPath(),i.moveTo(42,30),i.lineTo(62,50),i.lineTo(42,70),i.stroke()},up(i){i.beginPath(),i.moveTo(30,56),i.lineTo(50,36),i.lineTo(70,56),i.moveTo(50,36),i.lineTo(50,74),i.stroke()},search(i){i.beginPath(),i.arc(44,44,20,0,Math.PI*2),i.stroke(),i.beginPath(),i.moveTo(59,59),i.lineTo(76,76),i.stroke()},pause(i){i.beginPath(),i.moveTo(40,32),i.lineTo(40,68),i.moveTo(60,32),i.lineTo(60,68),i.stroke()},holo(i){i.beginPath(),i.moveTo(50,22),i.lineTo(76,36),i.lineTo(76,64),i.lineTo(50,78),i.lineTo(24,64),i.lineTo(24,36),i.closePath(),i.stroke(),i.beginPath(),i.moveTo(24,36),i.lineTo(50,50),i.lineTo(76,36),i.moveTo(50,50),i.lineTo(50,78),i.stroke()}};function uf(i,t){let{ctx:e,w:n,h:s}=i;e.clearRect(0,0,n,s),e.beginPath(),e.arc(n/2,s/2,n/2-4,0,Math.PI*2),e.fillStyle="rgba(20, 23, 31, 0.95)",e.fill(),e.lineWidth=3,e.strokeStyle="rgba(255,255,255,0.18)",e.stroke(),Ai(e,t,n/2,s/2,n*.62,ze,7),i.update()}function Ai(i,t,e,n,s,r=ze,a=6){i.save();let o=s/100;i.translate(e-50*o,n-50*o),i.scale(o,o),i.strokeStyle=r,i.fillStyle=r,i.lineWidth=a,i.lineCap="round",i.lineJoin="round",Fx[t]?.(i),i.restore()}async function GM({mode:i,session:t,api:e,tint:n}){let s=i==="flat",r=i==="immersive-ar",a=e.util;await Dx();let o=new oc({antialias:!0,alpha:!0,powerPreference:"high-performance"});o.setClearColor(0,0),o.outputColorSpace=mn,o.setPixelRatio(s?Math.min(2,window.devicePixelRatio||1):1),$h=Math.max(1,o.capabilities.getMaxAnisotropy?.()||1),o.setSize(window.innerWidth,window.innerHeight);let l=o.domElement;Object.assign(l.style,{position:"fixed",inset:"0",width:"100vw",height:"100vh",zIndex:"2147483000",touchAction:"none",display:s?"block":"none"}),document.body.appendChild(l);let c=new ia,d=new Dn(70,window.innerWidth/window.innerHeight,.01,100);d.position.set(0,1.6,0),c.add(d);let m=[],u=h=>(m.push(h),h),f=[],M=0,T=(()=>{try{return matchMedia("(prefers-reduced-motion: reduce)").matches}catch{return!1}})(),x=h=>1-Math.pow(1-Math.min(1,Math.max(0,h)),4),p=!1,C={a:new jt,b:new jt,c:new jt},D=0,A=8246268,P=!1;try{D=Math.max(0,Ua.findIndex(h=>h.name===localStorage.getItem("izuki.vr.theme")))}catch{}function R(h){let v=Ua[h];if(C.a.setRGB(...v.orb[0]),C.b.setRGB(...v.orb[1]),C.c.setRGB(...v.orb[2]),h===0&&n){let b=parseInt(n.slice(1),16),g=new jt((b>>16&255)/255,(b>>8&255)/255,(b&255)/255);C.a.lerp(g,.6),C.b.lerp(g,.35),C.c.lerp(g,.45)}A=v.halo,pt?.set(v);let _=!!v.light&&!!pt;if(_!==P){P=_;for(let b of _e)b.draw()}}function U(){D=(D+1)%Ua.length,R(D);try{localStorage.setItem("izuki.vr.theme",Ua[D].name)}catch{}return"This is "+Ua[D].name+(r?".":", with its own sky.")+" Say \u201Cchange your look\u201D again for the next one."}let y=new Ye;y.visible=!1,c.add(y);let I=u(new _n({uniforms:{uTime:{value:0},uEnergy:{value:0},uThink:{value:0},uA:{value:C.a},uB:{value:C.b},uC:{value:C.c},uGlow:{value:new jt(.82,.95,1)}},vertexShader:Nx,fragmentShader:Ux,transparent:!0})),F=new ce(u(new Un(.085,64,48)),I);F.renderOrder=2;let H=u(new hi({map:u(hf()),color:6220500,transparent:!0,blending:en,depthWrite:!1,opacity:.3})),q=new yi(H);q.scale.setScalar(.42),q.renderOrder=1;let Q=u(new rn({color:6220500,transparent:!0,opacity:0,blending:en,depthWrite:!1})),k=new ce(u(new ps(.118,.003,8,120,Math.PI*1.4)),Q),et=u(new rn({color:6220500,transparent:!0,opacity:0,blending:en,depthWrite:!1})),lt=new ce(u(new ps(.1,.0016,8,160)),et);lt.visible=!1,y.add(q,F,k,lt);let rt=Ke(.56,.19);rt.mesh.position.set(0,-.2,.01),y.add(rt.mesh),u(rt.tex),u(rt.mesh.material),u(rt.mesh.geometry),f.push(rt.mesh.material);let J={state:"",you:"",reply:"",stage:"",mic:0,energy:0,think:0,hovered:!1,hint:s?"Click the orb to talk. Drag to look around.":"Point at the orb and pull the trigger (or pinch) to talk."};function st(){let{ctx:h,w:v,h:_}=rt;On(h,v,_,52);let b=56,g=30,E=Lx[J.state]||J.stage||"";E?(h.beginPath(),h.arc(b+9,g+34,9,0,Math.PI*2),h.fillStyle=Rn,h.fill(),h.font=`600 30px ${He}`,xe(h,Pn(h,E,v-b*2-40),b+34,g+45,30,Rn,600,"left",He,"0.02em"),g+=62):g+=14,J.you&&(h.font=`500 34px ${an}`,xe(h,Pn(h,J.you,v-b*2),b,g+=40,34,nn,500),g+=10);let W=J.reply||(J.you?"":J.hint),O=(X,nt)=>(h.font=`500 ${nt}px ${an}`,h.measureText(X).width),Z=J.notice?a.fitLines(J.notice,v-b*2,2,30,26,O):null,G=Z?Z.lines.length*Z.size*1.3+22:0;if(W){let X=_-g-36-G,nt=Math.max(1,Math.floor(X/(32*1.32))),ut=a.fitLines(W,v-b*2,Math.min(nt,5),50,32,O),wt=ut.size*1.32;g+=6;for(let dt of ut.lines)xe(h,dt,b,g+=wt,ut.size,J.reply?ze:nn,500)}if($t(J.notice||J.reply),Z){let X=_-32-(Z.lines.length-1)*Z.size*1.3;for(let nt of Z.lines)xe(h,nt,b,X,Z.size,J.noticeWarn?Na:nn,500),X+=Z.size*1.3}rt.update()}let mt=null,yt=!1,$t=h=>{yt&&mt&&h&&mt.textContent!==h&&(mt.textContent=h)},Wt=0;function Ae(h,v=12e3,_=!1){J.notice=String(h||""),J.noticeWarn=!!_,clearTimeout(Wt),Wt=setTimeout(()=>{J.notice="",st()},v),st()}let _e=[];function fe(h,v,_){let b=Ke(.088,.112,2400);u(b.tex),u(b.mesh.material),u(b.mesh.geometry),f.push(b.mesh.material);let g={c:b,icon:h,label:v,hot:!1,on:!1,shown:!0};return g.draw=()=>{let{ctx:E,w:W,h:O}=b;E.clearRect(0,0,W,O);let Z=W*.38,G=W/2,X=Z+10;E.beginPath(),E.arc(G,X,Z,0,Math.PI*2);let nt=E.createLinearGradient(0,X-Z,0,X+Z);nt.addColorStop(0,g.hot?"rgba(44, 50, 64, 0.97)":"rgba(26, 29, 38, 0.95)"),nt.addColorStop(1,g.hot?"rgba(26, 30, 40, 0.97)":"rgba(14, 16, 22, 0.95)"),E.fillStyle=nt,E.fill(),E.lineWidth=g.hot||g.on?5:3,E.strokeStyle=g.on?Rn:g.hot?"rgba(255,255,255,0.55)":"rgba(255,255,255,0.16)",E.stroke(),Ai(E,g.icon,G,X,Z*1.05,g.on?Rn:ze,6.5);let ut=P?{on:"#0F766E",hot:"#11151C",rest:"#2A303B"}:{on:Rn,hot:ze,rest:nn};xe(E,g.label,G,O-12,30,g.on?ut.on:g.hot?ut.hot:ut.rest,600,"center",He,"0.01em"),b.update()},g.set=(E,W)=>{E===g.icon&&W===g.label||(g.icon=E,g.label=W,g.draw())},g.setOn=E=>{!!E!==g.on&&(g.on=!!E,g.draw())},g.draw(),St(b.mesh,{tap:_,hover:E=>{g.hot=E,g.draw(),b.mesh.position.z=E?.026:.02}}),y.add(b.mesh),_e.push(g),g}function ct(){let h=_e.filter(_=>_.shown),v=h.length>6?.088:.1;h.forEach((_,b)=>{_.c.mesh.visible=!0,_.c.mesh.position.set((b-(h.length-1)/2)*v,-.375,.02)});for(let _ of _e)_.shown||(_.c.mesh.visible=!1)}let gt=[];function St(h,v){return h.userData.ui=v,gt.push(h),h}function Kt(h){let v=gt.indexOf(h);v>=0&&gt.splice(v,1)}let Ot=h=>{for(let v=h;v;v=v.parent)if(!v.visible)return!1;return!0},ie=new Ma;ie.far=10;let Jt=new N,oe=new N,ye=new ci,le=0,he=[],Ge=u(new Fs(.006,20)),ln=u(new Le().setAttribute("position",new ne([0,0,0,0,0,-1],3)));function bn(h,v){let _={kind:h,ctrl:v,source:null,hit:null,hover:null,press:null,origin:new N,dir:new N,buttons:[],scrollAt:0};return _.dot=new ce(Ge,u(new rn({color:16777215,transparent:!0,opacity:.9,depthTest:!1}))),_.dot.renderOrder=999,_.dot.visible=!1,c.add(_.dot),v&&(_.line=new Li(ln,u(new ii({color:10482666,transparent:!0,opacity:.5}))),_.line.visible=!1,v.add(_.line)),he.push(_),_}let ke=(h,v=.25,_=16)=>{try{h.source?.gamepad?.hapticActuators?.[0]?.pulse?.(v,_)}catch{}};function Ze(h,v=!1){if(!h.hit)return;let _=h.hit.object.userData.ui,b=_.drag?_.drag():null;if(h.press={u:_,obj:h.hit.object,hit:h.hit,drag:b,grabOnly:v,dist:h.hit.distance,start:h.hit.point.clone(),offset:b?b.position.clone().sub(h.hit.point):null,moved:!1,t0:performance.now()},ke(h,.35,20),!v)try{_.down?.(h)}catch(g){console.warn("vr down",g)}}let B=new N,cn=new N,ve=new N;function L(h,v){let _=h.source?.hand?o.xr.getHand(h.index):null,b=_?.joints?.["index-finger-tip"],g=_?.joints?.["thumb-tip"];return b&&g?(b.getWorldPosition(v),g.getWorldPosition(cn),v.add(cn).multiplyScalar(.5)):h.ctrl.getWorldPosition(v)}function S(h){if(s||!h.source)return!1;L(h,B);let v=null,_=1/0;for(let g of gt){let E=g.userData.ui;if(!(E.drag||E.grab)||!Ot(g))continue;let W=g.geometry;W.boundingBox||W.computeBoundingBox(),g.updateWorldMatrix(!0,!1),ve.copy(B),g.worldToLocal(ve);let O=W.boundingBox,Z=g.getWorldScale(cn),G=(g===F?.07:.03)/Math.max(.001,Z.x),X=Math.max(O.min.x-ve.x,0,ve.x-O.max.x),nt=Math.max(O.min.y-ve.y,0,ve.y-O.max.y),ut=Math.max(O.min.z-ve.z,0,ve.z-O.max.z);if(X>G||nt>G||ut>G+.05/Math.max(.001,Z.x))continue;let wt=Math.hypot(X,nt,ut);wt<_&&(_=wt,v={m:g,u:E})}if(!v)return!1;let b=(v.u.drag||v.u.grab)();return b?(h.press={u:v.u,obj:v.m,hit:null,drag:b,direct:!0,grabOnly:!1,offset:b.position.clone().sub(B),start:B.clone(),moved:!1,t0:performance.now()},ke(h,.5,28),!0):!1}function Y(h,v=!0){let _=h.press;if(h.press=null,!!_){if(!_.grabOnly)try{_.u.up?.(performance.now()-_.t0,v&&!_.moved)}catch(b){console.warn("vr up",b)}if(_.moved){_.u.dropped?.();return}if(_.direct){if(!v)return;let b=null,g=_.obj.geometry?.parameters;if(g?.width&&g?.height){L(h,B);let E=_.obj.worldToLocal(B.clone());b={uv:{x:Math.max(0,Math.min(1,E.x/g.width+.5)),y:Math.max(0,Math.min(1,E.y/g.height+.5))},point:B.clone()}}try{_.u.tap?.(b,h)}catch(E){console.warn("vr tap",E)}return}if(!(_.grabOnly||!v)&&!(!h.hit||h.hit.object!==_.obj))try{_.u.tap?.(h.hit,h)}catch(b){console.warn("vr tap",b)}}}function K(h){h.lookAt(Jt.x,h.position.y,Jt.z)}let ot=[],Mt=(h,v,_,b)=>{h.addEventListener(v,_,b),ot.push(()=>h.removeEventListener(v,_,b))},Tt=null;if(!s){for(let h=0;h<2;h++){let v=o.xr.getController(h);c.add(v);let _=bn("xr",v);_.index=h,Mt(v,"connected",b=>{_.source=b.data,_.line.visible=!0}),Mt(v,"disconnected",()=>{_.source=null,_.line.visible=!1,_.dot.visible=!1,_.press=null}),Mt(v,"selectstart",()=>{_.selected=!1,!S(_)&&(Zt(_),Ze(_))}),Mt(v,"select",()=>{_.selected=!0}),Mt(v,"selectend",()=>{Zt(_),Y(_,_.selected),_.selected=!1}),Mt(v,"squeezestart",()=>{S(_)||(Zt(_),Ze(_,!0))}),Mt(v,"squeezeend",()=>Y(_,!1))}for(let h=0;h<2;h++)c.add(o.xr.getHand(h));if(!r){let h=u(new Un(.006,8,6)),v=u(new rn({color:13496317,transparent:!0,opacity:.85}));Tt={jointGeo:h,jointMat:v}}}let ht=0;if(!s)try{o.xr.enabled=!0;let h=t.enabledFeatures,v=!h||h.includes("local-floor")?"local-floor":"local";v==="local"&&(ht=-1.6),o.xr.setReferenceSpaceType(v);try{o.xr.setFramebufferScaleFactor(1.25)}catch{}await o.xr.setSession(t);try{o.xr.setFoveation(.2)}catch{}let _=[...t.inputSources||[]].filter(b=>!he.some(g=>g.source===b));if(_.length){let b=new Event("inputsourceschange");Object.assign(b,{session:t,added:_,removed:[]}),t.dispatchEvent(b)}}catch(h){for(let v of ot)try{v()}catch{}l.remove(),o.dispose();try{await t.end()}catch{}throw h}let pt=r?null:Ox(c,ht);R(D);let Ct=new Bt,zt=s?bn("mouse",null):null,At=null,Et=-.2,Xt=0;if(s){zt.source={};let h=v=>{Ct.set(v.clientX/window.innerWidth*2-1,-(v.clientY/window.innerHeight)*2+1)};Mt(l,"pointermove",v=>{h(v),At&&(Xt-=(v.clientX-At.x)*.004,Et-=(v.clientY-At.y)*.004,Et=Math.max(-1.2,Math.min(1.2,Et)),At={x:v.clientX,y:v.clientY})}),Mt(l,"pointerdown",v=>{h(v),Zt(zt),zt.hit?Ze(zt):At={x:v.clientX,y:v.clientY},l.setPointerCapture?.(v.pointerId)}),Mt(l,"pointerup",v=>{h(v),At=null,Zt(zt),Y(zt)}),Mt(l,"pointercancel",()=>{At=null,zt.press=null}),Mt(l,"wheel",v=>{let _=zt.hit?.object.userData.ui;_?.scroll&&(v.preventDefault(),_.scroll(Math.sign(v.deltaY)*Math.min(5,Math.ceil(Math.abs(v.deltaY)/60))))},{passive:!1}),Mt(window,"keydown",v=>{v.key==="Escape"?Vr():v.key===" "&&v.target===document.body&&(v.preventDefault(),e.tapOrb())}),Mt(window,"resize",()=>{d.aspect=window.innerWidth/window.innerHeight,d.updateProjectionMatrix(),o.setSize(window.innerWidth,window.innerHeight)})}function Zt(h){if(h.kind==="mouse")ie.setFromCamera(Ct,d),h.origin.copy(ie.ray.origin),h.dir.copy(ie.ray.direction);else{if(!h.source)return!1;h.ctrl.getWorldPosition(h.origin),h.ctrl.getWorldQuaternion(ye),h.dir.set(0,0,-1).applyQuaternion(ye)}ie.set(h.origin,h.dir);let v=ie.intersectObjects(gt,!1);return h.hit=v.find(_=>Ot(_.object))||null,!0}function se(h){h.holdAt=performance.now(),h.holdListening=J.state==="listening",h.holdListening||e.tapOrb()}function V(h,v){let _=h.holdListening;h.holdListening=!1,(_||v>600)&&e.tapOrb()}St(F,{tap:()=>e.tapOrb(),drag:()=>y,dropped:()=>{y.userData.placed=!0},hover:h=>{J.hovered=h}}),St(rt.mesh,{drag:()=>y,dropped:()=>{y.userData.placed=!0}});let bt=fe("mic","Talk",null);Object.assign(bt.c.mesh.userData.ui,{tap:null,down:()=>se(bt),up:(h,v)=>{v&&V(bt,h)}});let ft=fe("pause","Pause",()=>e.hangUp()),Rt=fe("eye","Look",()=>{Fi(),e.look()}),Dt=()=>{_t.open?Gs():Ga().then(h=>{h&&e.speak(h)})},vt=()=>{let h=e.lastReply();h?nu(h):e.speak("There's nothing to pin yet. Ask me something first.")},qt=()=>{if(tt.open)return Ut();if(!e.pc.current())return Ae("Your photos are on your PC: pair this headset with it once (leave the room, Remote, Pair).",12e3,!0);dn("Pictures").then(h=>{h&&Ae(h,12e3,!0)})},Gt=()=>Ae(U(),5e3),Ue=fe("photos","Photos",qt),Ce=fe("pc","My PC",Dt);fe("pin","Pin",vt),fe("style","Style",Gt),fe("leave","Leave",()=>Vr()),ft.shown=!1,Rt.shown=!1,ct();let wn=[];function kn(h,v,_){let b=Ke(.205,.054,2400);u(b.tex),u(b.mesh.material),u(b.mesh.geometry),p||f.push(b.mesh.material);let g={c:b,hot:!1};return g.draw=()=>{let{ctx:E,w:W,h:O}=b;On(E,W,O,(O-6)/2,{hot:g.hot}),Ai(E,h,58,O/2,50,Rn,7),E.font=`500 37px ${an}`,xe(E,Pn(E,v,W-124),98,O/2+13,37,ze,500),b.update()},g.draw(),St(b.mesh,{tap:()=>{Fa(),e.ask(_)},hover:E=>{g.hot=E,g.draw()}}),y.add(b.mesh),wn.push(g),g}let Vs=!1;try{Vs=localStorage.getItem("izuki.vr.tried")!=="1"}catch{}function Fa(){Vs=!1;for(let h of wn)h.c.mesh.visible=!1;try{localStorage.setItem("izuki.vr.tried","1")}catch{}}function Oa(){wn.forEach((h,v)=>{h.c.mesh.position.set((v-(wn.length-1)/2)*.218,.17,.01)}),gc()}e.hasCamera().then(h=>{Rt.shown=!!h,ct(),kn(h?"eye":"mic",h?"\u201CWhat's this?\u201D":"\u201CWhat can you do?\u201D",h?"What's this?":"What can you do?"),kn("photos","\u201CShow my photos\u201D","Show my photos"),kn("style","\u201CChange your look\u201D","Change your look"),Oa()});let Nt={group:new Ye,photo:null,text:Ke(.5,.15),img:null,url:"",want:"",closed:"",seq:0,marks:[],say:"",t0:0,anim:!1,close:Ke(.05,.05)};Nt.group.visible=!1,c.add(Nt.group),St(Nt.text.mesh,{drag:()=>Nt.group}),u(Nt.text.tex),u(Nt.close.tex),Nt.group.add(Nt.text.mesh,Nt.close.mesh),uf(Nt.close,"close"),St(Nt.close.mesh,{tap:()=>{Nt.seq++,Nt.closed=Nt.want,Nt.group.visible=!1}});function Ba(){let{ctx:h,w:v,h:_}=Nt.text;On(h,v,_,44);let b=(W,O)=>(h.font=`500 ${O}px ${an}`,h.measureText(W).width),g=a.fitLines(Nt.say,v-96,4,38,26,b),E=22;for(let W of g.lines)xe(h,W,48,E+=g.size*1.32,g.size,ze,500);Nt.text.update(),$t(Nt.say)}function Nr(h){let v=Nt.photo;if(!v||!Nt.img)return;let{ctx:_,w:b,h:g}=v;_.clearRect(0,0,b,g),_.save(),$n(_,0,0,b,g,28),_.clip(),_.drawImage(Nt.img,0,0,b,g),_.restore();let E=Nt.marks.length,W=b*(Nt.steps?.03:.065),O=Z=>({x:Z.x/1e3*b,y:Z.y/1e3*g});Nt.marks.forEach((Z,G)=>{let X=Math.max(0,Math.min(1,h*E-G));if(X<=0)return;let{x:nt,y:ut}=O(Z);if(Nt.steps&&G>0&&za(_,O(Nt.marks[G-1]),{x:nt,y:ut},W,Math.min(1,X*2)),_.save(),_.shadowColor="rgba(0,0,0,0.55)",_.shadowBlur=10,_.shadowOffsetY=3,_.strokeStyle=Rn,_.lineWidth=6,_.lineCap="round",_.beginPath(),_.arc(nt,ut,W,-Math.PI/2,-Math.PI/2+Math.PI*2*X),_.stroke(),_.restore(),Nt.steps&&E>1&&X>.3){let wt=Math.min(b-26,Math.max(26,nt-W*.75)),dt=Math.min(g-26,Math.max(26,ut-W*.75));_.save(),_.shadowColor="rgba(0,0,0,0.5)",_.shadowBlur=8,_.fillStyle=Rn,_.beginPath(),_.arc(wt,dt,22,0,Math.PI*2),_.fill(),_.restore(),_.font=`700 26px ${an}`;let Yt=String(G+1);xe(_,Yt,wt-_.measureText(Yt).width/2,dt+9,26,"#0b1016",700)}if(X>.85&&Z.label){_.font=`600 28px ${an}`;let wt=_.measureText(Z.label).width,dt=Math.min(b-wt-40,Math.max(10,nt-wt/2-16)),Yt=ut+W+12>g-50?ut-W-56:ut+W+12;Nt.steps&&(dt=nt+W+16+wt+32<=b-10?nt+W+16:Math.max(10,nt-W-16-wt-32),Yt=Math.min(g-54,Math.max(10,ut-22))),$n(_,dt,Yt,wt+32,44,22),_.fillStyle="rgba(14,16,22,0.88)",_.fill(),xe(_,Z.label,dt+16,Yt+31,28,ze,600)}}),v.update()}function za(h,v,_,b,g){let E=_.x-v.x,W=_.y-v.y,O=Math.hypot(E,W);if(O<=2*b+12)return;let Z=E/O,G=W/O,X=v.x+Z*(b+6),nt=v.y+G*(b+6),ut=(O-2*b-12)*g,wt=X+Z*ut,dt=nt+G*ut;if(h.save(),h.shadowColor="rgba(0,0,0,0.5)",h.shadowBlur=8,h.strokeStyle=Rn,h.lineWidth=5,h.lineCap="round",h.setLineDash([16,12]),h.beginPath(),h.moveTo(X,nt),h.lineTo(wt,dt),h.stroke(),h.setLineDash([]),g>=1){let ee=-G,ue=Z;h.fillStyle=Rn,h.beginPath(),h.moveTo(wt+Z*4,dt+G*4),h.lineTo(wt-Z*18+ee*18*.6,dt-G*18+ue*18*.6),h.lineTo(wt-Z*18-ee*18*.6,dt-G*18-ue*18*.6),h.closePath(),h.fill()}h.restore()}function Fi(){Nt.group.visible&&(Nt.say="Looking\u2026",Ba())}async function Ur({url:h,w:v,h:_,marks:b,say:g,picked:E,steps:W}){if(E)Nt.closed="";else if(h===Nt.closed)return;let O=++Nt.seq;if(Nt.want=h,h!==Nt.url){let Z=new Image;Z.src=h;try{await Z.decode()}catch{return}if(O!==Nt.seq)return;Nt.img=Z,Nt.url=h;let G=_/Math.max(1,v),X=Math.min(.42,.5*G),nt=X/G;Nt.photo&&(Kt(Nt.photo.mesh),Nt.group.remove(Nt.photo.mesh),Nt.photo.tex.dispose(),Nt.photo.mesh.geometry.dispose(),Nt.photo.mesh.material.dispose()),Nt.photo=Ke(nt,X,2048),Nt.group.add(Nt.photo.mesh),St(Nt.photo.mesh,{drag:()=>Nt.group}),Nt.photo.mesh.position.set(0,.1,0),Nt.text.mesh.position.set(0,.1-X/2-.09,0),Nt.close.mesh.position.set(nt/2-.01,.1+X/2-.01,.005)}if(Nt.marks=Array.isArray(b)?b:[],Nt.steps=!!W,Nt.say=String(g||""),Nt.t0=performance.now(),Nt.anim=Nt.marks.length>0,!Nt.group.visible){let Z=le-.6,G=.85;Nt.group.position.set(Jt.x-Math.sin(Z)*G,Jt.y-.08,Jt.z-Math.cos(Z)*G),K(Nt.group)}Nt.group.visible=!0,Nr(Nt.anim?0:1),Ba()}let _t={group:new Ye,open:!1,live:!1,gen:0,target:null,err:"",clicks:Promise.resolve(),doing:"",busy:!1,screen:null,bar:Ke(1.6,.09),handle:Ke(.32,.035),aspect:9/16};_t.group.visible=!1,c.add(_t.group),u(_t.bar.tex),u(_t.handle.tex);function Fr(h,v){_t.screen&&(Kt(_t.screen.mesh),_t.group.remove(_t.screen.mesh),_t.screen.tex.dispose(),_t.screen.mesh.geometry.dispose(),_t.screen.mesh.material.dispose());let _=v/h,b=Math.min(1.6,1.1/_),g=Ke(b,b*_,h/b);g.mesh.material.transparent=!1,g.mesh.material.depthWrite=!0,_t.screen=g,_t.aspect=_,_t.group.add(g.mesh);let E=b*_/2;return _t.bar.mesh.position.set(0,-E-.06,0),_t.handle.mesh.position.set(0,E+.04,0),St(g.mesh,{tap:W=>{if(!W?.uv||!_t.live)return;let{nx:O,ny:Z}=a.pcPoint(W.uv.x,W.uv.y),G=_t.gen;z(W.point);let X=()=>_t.open&&G===_t.gen&&_t.live;_t.clicks=_t.clicks.then(async()=>{if(!X())return;let nt=await e.pc.send({op:"point",nx:O,ny:Z},_t.target);if(nt?.ok===!1){G===_t.gen&&(_t.err=nt.error||"",Jn());return}X()&&await e.pc.send({op:"click",button:"left"},_t.target)}).catch(()=>{})},scroll:W=>{_t.live&&e.pc.send({op:"scroll",dy:W},_t.target)}}),g}Fr(1280,720),_t.group.add(_t.bar.mesh,_t.handle.mesh);{let{ctx:h,w:v,h:_}=_t.handle;h.clearRect(0,0,v,_),$n(h,4,4,v-8,_-8,(_-8)/2),h.fillStyle="rgba(255,255,255,0.34)",h.fill(),_t.handle.update()}St(_t.handle.mesh,{drag:()=>_t.group});function $i(h){_t.live=!1;let v=_t.screen,{ctx:_,w:b,h:g}=v;On(_,b,g,24),_.font=`500 ${Math.round(g*.05)}px ${an}`;let E=a.wrapLines(h,b*.7,W=>_.measureText(W).width);E.forEach((W,O)=>xe(_,W,b/2,g/2+(O-(E.length-1)/2)*g*.075,Math.round(g*.05),nn,500,"center")),v.update()}function ka(h){(Math.abs(h.height/h.width-_t.aspect)>.01||_t.screen.w!==h.width)&&Fr(h.width,h.height);let v=_t.screen;v.ctx.drawImage(h,0,0,v.w,v.h),v.update(),_t.live=!0}function Jn(){let{ctx:h,w:v,h:_}=_t.bar;On(h,v,_,48),h.beginPath(),h.arc(72,_/2,13,0,Math.PI*2),h.fillStyle=_t.err?Na:Rn,h.fill();let b=_t.err||(_t.doing?"Izuki: "+_t.doing:(_t.target?.name||e.pc.name())+" \xB7 point and click, thumbstick to scroll");h.font=`500 60px ${an}`,xe(h,Pn(h,b,v-800),116,_/2+21,60,_t.err?Na:ze,500);let g=(E,W,O)=>{$n(h,E,30,280,_-60,(_-60)/2),h.fillStyle=O?"rgba(220, 38, 38, 0.82)":"rgba(255, 255, 255, 0.07)",h.fill(),O||(h.lineWidth=3,h.strokeStyle="rgba(255,255,255,0.16)",h.stroke()),xe(h,W,E+140,_/2+19,52,ze,600,"center",He,"0.02em")};_t.busy&&g(v-620,"Stop",!0),g(v-310,"Close",!1),_t.bar.update()}St(_t.bar.mesh,{tap:h=>{let v=(h?.uv?.x??0)*_t.bar.w;if(v>_t.bar.w-320)Gs();else if(_t.busy&&v>_t.bar.w-630){let _=_t.gen;e.pc.send({op:"stop"},_t.target).then(b=>{!_t.open||_!==_t.gen||(b?.ok===!1?_t.err=b.error||"Your PC didn't confirm it stopped.":(_t.busy=!1,_t.err=""),Jn())})}},drag:()=>_t.group});let Or=h=>new Promise(v=>setTimeout(v,h));async function Va(h){for(;_t.open&&h===_t.gen;){let v=performance.now(),_=await e.pc.shot(1280,_t.target);if(!_t.open||h!==_t.gen)break;if(_.blob){let b=()=>_t.open&&h===_t.gen,g=null;try{g=await createImageBitmap(_.blob),b()&&(ka(g),_t.err&&(_t.err="",Jn()))}catch{b()&&(_t.err="A picture from your PC didn't come through.",$i(_t.err),Jn())}finally{g?.close?.()}}else _t.err=_.error||"Your PC didn't answer.",$i(_t.err),Jn();await Or(_.blob?Math.max(120,320-(performance.now()-v)):3e3)}}async function hc(h){for(;_t.open&&h===_t.gen;){let v=await e.pc.status(_t.target);if(!_t.open||h!==_t.gen)break;v.error||(_t.doing=v.doing,_t.busy=v.busy,Jn()),await Or(3e3)}}async function Ga(){if(!e.pc.current())return"This headset isn't paired with your PC yet. Leave VR, open Remote in Izuki and pair your PC once.";let h=1.55;_t.group.position.set(Jt.x-Math.sin(le)*h,Jt.y-.02,Jt.z-Math.cos(le)*h),K(_t.group),_t.group.visible=!0,_t.open=!0,_t.err="",_t.target=e.pc.current(),ai("pc");let v=++_t.gen;return $i("Connecting to "+(_t.target?.name||e.pc.name())+"\u2026"),Jn(),Va(v),hc(v),""}function Gs(){_t.open=!1,_t.gen++,_t.group.visible=!1,y.userData.placed==="pc"&&(tt?.open?y.userData.placed="files":xt?.open?y.userData.placed="web":at?.open?y.userData.placed="holo":Ys())}function ai(h){if(y.userData.placed!==!0){if(!y.userData.placed){let v=le+.7;Qn={x:Jt.x-Math.sin(v)*.7,y:Jt.y-.17,z:Jt.z-Math.cos(v)*.7}}y.userData.placed=h}}let ws=[],w=u(new fs(.012,.018,32));function z(h){let v=new ce(w,new rn({color:6220500,transparent:!0,opacity:.9,depthTest:!1}));v.position.copy(h),v.lookAt(Jt),v.renderOrder=998,c.add(v),ws.push({m:v,t0:performance.now()})}let it=1,j=.74,$=4,It=3,Ft=$*It,Pt=.12,tt={group:new Ye,card:Ke(it,j),handle:Ke(.3,.035),open:!1,gen:0,path:"",up:"",items:[],page:0,title:"",err:"",loading:!1,thumbs:new Map,pending:new Set,btns:[]};tt.group.visible=!1,c.add(tt.group),tt.group.add(tt.card.mesh,tt.handle.mesh),tt.handle.mesh.position.set(0,j/2+.035,0),u(tt.card.tex),u(tt.handle.tex);{let{ctx:h,w:v,h:_}=tt.handle;$n(h,4,4,v-8,_-8,(_-8)/2),h.fillStyle="rgba(255,255,255,0.34)",h.fill(),tt.handle.update()}St(tt.handle.mesh,{drag:()=>tt.group});let Vt=()=>tt.items.slice(tt.page*Ft,tt.page*Ft+Ft),re=()=>Math.max(1,Math.ceil(tt.items.length/Ft)),pe=h=>tt.path+"|"+h.name;function kt(h){let{w:v,h:_}=tt.card,b=_*Pt,g=v*.018,E=(v-g*($+1))/$,W=(_-b-g*(It+1))/It;return{x:g+h%$*(E+g),y:b+g+Math.floor(h/$)*(W+g),w:E,h:W}}function me(){let{ctx:h,w:v,h:_}=tt.card;On(h,v,_,56);let b=_*Pt;tt.btns=[];let g=b*.62,E=b*.56,W=v-44,O=(G,X)=>{let nt=W-g/2;h.beginPath(),h.arc(nt,E,g/2,0,Math.PI*2),h.fillStyle="rgba(255,255,255,0.06)",h.fill(),h.lineWidth=3,h.strokeStyle="rgba(255,255,255,0.16)",h.stroke(),Ai(h,G,nt,E,g*.62,ze,7),tt.btns.push({x0:W-g,x1:W,act:X}),W-=g+20};O("close",()=>Ut()),tt.page+1<re()&&O("next",()=>{tt.page++,me(),We(tt.gen)}),tt.page>0&&O("back",()=>{tt.page--,me(),We(tt.gen)}),tt.path&&O("up",()=>{Ee(tt.up,"")}),h.font=`600 50px ${He}`;let Z=Pn(h,tt.title||"Your folders",W-220);if(xe(h,Z,56,E+18,50,ze,600,"left",He,"-0.01em"),re()>1){h.font=`600 50px ${He}`;let G=h.measureText(Z).width;xe(h,`${tt.page+1} / ${re()}`,56+G+28,E+16,34,nn,500)}if(tt.loading||tt.err||!tt.items.length){let G=tt.loading?"Opening\u2026":tt.err||"This folder is empty.";h.font=`500 46px ${an}`;let X=a.wrapLines(G,v*.7,nt=>h.measureText(nt).width);X.forEach((nt,ut)=>xe(h,nt,v/2,_*.55+(ut-(X.length-1)/2)*64,46,tt.err?Na:nn,500,"center")),tt.card.update();return}Vt().forEach((G,X)=>{let nt=kt(X);h.save(),$n(h,nt.x,nt.y,nt.w,nt.h,26),h.fillStyle="rgba(255,255,255,0.045)",h.fill(),h.clip();let ut=tt.thumbs.get(pe(G));if(ut){let dt=Math.max(nt.w/ut.width,nt.h/ut.height);h.drawImage(ut,nt.x+(nt.w-ut.width*dt)/2,nt.y+(nt.h-ut.height*dt)/2,ut.width*dt,ut.height*dt)}else Ai(h,G.dir?"folder":e.isPicture(G.name)?"photos":"doc",nt.x+nt.w/2,nt.y+nt.h*.42,Math.min(nt.w,nt.h)*.4,G.dir?ze:nn,4);let wt=h.createLinearGradient(0,nt.y+nt.h-92,0,nt.y+nt.h);wt.addColorStop(0,"rgba(10,12,18,0)"),wt.addColorStop(1,"rgba(10,12,18,0.86)"),h.fillStyle=wt,h.fillRect(nt.x,nt.y+nt.h-92,nt.w,92),h.font=`500 30px ${an}`,xe(h,Pn(h,G.name,nt.w-36),nt.x+18,nt.y+nt.h-20,30,ze,500),h.restore()}),tt.card.update()}async function We(h){for(let v of Vt()){if(h!==tt.gen||!tt.open)return;let _=pe(v);if(v.dir||!e.isPicture(v.name)||tt.thumbs.has(_)||tt.pending.has(_))continue;tt.pending.add(_);let b=null;try{b=await e.thumb(tt.path,v)}finally{h===tt.gen&&tt.pending.delete(_)}if(h!==tt.gen||!tt.open){b?.close?.();return}if(tt.thumbs.has(_)){b?.close?.();continue}tt.thumbs.set(_,b||null),b&&me()}}function Fe(){for(let h of tt.thumbs.values())h?.close?.();tt.thumbs.clear(),tt.pending.clear()}async function Ee(h,v){let _=++tt.gen;Fe(),Object.assign(tt,{loading:!0,err:"",items:[],page:0,title:v||tt.title}),me();let b;if(h)b=await e.pc.list(h);else{let g=await e.pc.roots();b=g.error?g:{path:"",up:"",items:g.roots.map(E=>({name:E.name,dir:!0,at:E.path}))}}return _!==tt.gen||!tt.open?"":(tt.loading=!1,b.error?(tt.err=b.error,me(),b.error):(Object.assign(tt,{path:b.path,up:b.up,items:b.items}),v||(tt.title=b.path?String(b.path).split(/[\\/]/).filter(Boolean).slice(-2).join(" \u203A "):"Your folders"),me(),We(_),""))}St(tt.card.mesh,{tap:h=>{if(!h?.uv)return;let{w:v,h:_}=tt.card,b=h.uv.x*v,g=(1-h.uv.y)*_;if(g<_*Pt){tt.btns.find(O=>b>=O.x0&&b<=O.x1)?.act();return}if(tt.loading)return;let E=Vt().findIndex((O,Z)=>{let G=kt(Z);return b>=G.x&&b<=G.x+G.w&&g>=G.y&&g<=G.y+G.h}),W=Vt()[E];W&&(W.dir?Ee(W.at||e.joinPath(tt.path,W.name),W.name):e.openPhoto(tt.path,W).then(O=>{O&&Ae(O,12e3,!0)}))},scroll:h=>{let v=Math.max(0,Math.min(re()-1,tt.page+Math.sign(h)));v!==tt.page&&(tt.page=v,me(),We(tt.gen))}});async function dn(h){if(!tt.open){let g=le-(_t.open?.85:.05),E=1.15;tt.group.position.set(Jt.x-Math.sin(g)*E,Jt.y-.04,Jt.z-Math.cos(g)*E),K(tt.group),ai("files")}if(tt.open=!0,tt.group.visible=!0,!h)return Ee("","Your folders");let v=++tt.gen;Object.assign(tt,{loading:!0,err:""}),me();let _=await e.pc.roots();if(!tt.open||v!==tt.gen)return"";if(_.error)return tt.loading=!1,tt.err=_.error,me(),_.error;let b=_.roots.find(g=>String(g.name).toLowerCase()===h.toLowerCase());return b?Ee(b.path,b.name):(await Ee("","Your folders"),"I couldn't find a "+h+" folder on your PC, so here are all your folders.")}function Ut(){tt.open=!1,tt.gen++,tt.group.visible=!1,Fe(),y.userData.placed==="files"&&(_t.open?y.userData.placed="pc":xt.open?y.userData.placed="web":at.open?y.userData.placed="holo":Ys())}let fn=1,Me=.1,Tn=.62,Kn=5,xt={group:new Ye,head:Ke(fn,Me),body:Ke(fn,Tn),handle:Ke(.3,.035),open:!1,gen:0,q:"",typed:"",mode:"",results:[],page:null,title:"",paras:[],first:0,more:!1,err:"",btns:[],rows:[]};xt.group.visible=!1,c.add(xt.group),xt.group.add(xt.head.mesh,xt.body.mesh,xt.handle.mesh),xt.head.mesh.position.set(0,Tn/2+.008+Me/2,0),xt.handle.mesh.position.set(0,Tn/2+.016+Me+.02,0),u(xt.head.tex),u(xt.body.tex),u(xt.handle.tex);{let{ctx:h,w:v,h:_}=xt.handle;$n(h,4,4,v-8,_-8,(_-8)/2),h.fillStyle="rgba(255,255,255,0.34)",h.fill(),xt.handle.update()}St(xt.handle.mesh,{drag:()=>xt.group});let Oi=()=>xt.mode==="reading"||xt.mode==="page-loading"||xt.mode==="page-error";function Re(){let{ctx:h,w:v,h:_}=xt.head;On(h,v,_,48);let b=_/2,g=_*.6;xt.btns=[];let E=v-36,W=(wt,dt)=>{let Yt=E-g/2;h.beginPath(),h.arc(Yt,b,g/2,0,Math.PI*2),h.fillStyle="rgba(255,255,255,0.06)",h.fill(),h.lineWidth=3,h.strokeStyle="rgba(255,255,255,0.16)",h.stroke(),Ai(h,wt,Yt,b,g*.62,ze,7),xt.btns.push({x0:E-g,x1:E,act:dt}),E-=g+18};W("close",()=>uc()),Oi()&&W("back",()=>{xt.gen++,xt.mode="results",An()});let O=30,Z=E-12-O,G=_*.66;$n(h,O,b-G/2,Z,G,G/2),h.fillStyle="rgba(255,255,255,0.06)",h.fill(),h.lineWidth=3,h.strokeStyle=xt.mode==="typing"||xt.mode==="searching"?"rgba(94,234,212,0.75)":"rgba(255,255,255,0.16)",h.stroke(),Ai(h,"search",O+G*.58,b,G*.6,nn,7);let X=Oi()?xt.page?.site||"":xt.typed;h.font=`500 40px ${an}`;let nt=Pn(h,X||"Search Google",Z-G*1.4-24),ut=O+G*1.1;xe(h,nt,ut,b+14,40,X?ze:nn,500),xt.mode==="typing"&&(h.font=`500 40px ${an}`,h.fillStyle=Rn,h.fillRect(ut+(X?h.measureText(nt).width:0)+6,b-22,4,44)),xt.head.update()}function $e(){let{ctx:h,w:v,h:_}=xt.body;On(h,v,_,48),xt.rows=[];let b=56,g=(W,O=nn)=>{h.font=`500 44px ${an}`;let Z=a.wrapLines(W,v*.76,G=>h.measureText(G).width);Z.forEach((G,X)=>xe(h,G,v/2,_*.5+(X-(Z.length-1)/2)*62,44,O,500,"center"))},E=xt.mode;if(E==="")g("Say \u201Csearch the web for\u2026\u201D and anything you want to know. I'll look it up right here.");else if(E==="typing")g("");else if(E==="searching")g("Searching Google\u2026");else if(E==="error"||E==="page-error")g(xt.err,Na);else if(E==="page-loading")g("Reading "+(xt.page?.site||"the page")+"\u2026");else if(E==="results"){xt.results.length||g("Google didn't return any pages for that. Try other words.");let W=(_-40)/Kn;xt.results.slice(0,Kn).forEach((O,Z)=>{let G=20+Z*W;Z&&(h.fillStyle="rgba(255,255,255,0.08)",h.fillRect(b,G,v-b*2,2)),h.font=`600 40px ${He}`,xe(h,Pn(h,O.site,v-b*2),b,G+66,40,Rn,600,"left",He),h.font=`500 34px ${an}`;let X=a.wrapLines(O.snippet||"Tap to read this page.",v-b*2,nt=>h.measureText(nt).width).slice(0,2);X.length===2&&(O.snippet||"").length>0&&a.wrapLines(O.snippet,v-b*2,ut=>h.measureText(ut).width).length>2&&(X[1]=Pn(h,X[1]+" \u2026",v-b*2)),X.forEach((nt,ut)=>xe(h,nt,b,G+122+ut*46,34,nn,500)),xt.rows.push({y0:G,y1:G+W,r:O})})}else if(E==="reading"){h.font=`600 46px ${He}`;let W=a.wrapLines(xt.title,v-b*2,X=>h.measureText(X).width).slice(0,2),O=30;for(let X of W)xe(h,X,b,O+=60,46,ze,600,"left",He);O+=30,h.font=`500 36px ${an}`;let Z=_-70;xt.more=!1;for(let X=xt.first;X<xt.paras.length;X++){let nt=a.wrapLines(xt.paras[X],v-b*2,ut=>h.measureText(ut).width);if(O+nt.length*50>Z&&X>xt.first){xt.more=!0;break}for(let ut of nt){if((O+=50)>Z){xt.more=!0;break}xe(h,ut,b,O,36,ze,500)}O+=20}let G=`${xt.first+1} / ${xt.paras.length}`+(xt.more?"  \xB7  thumbstick or tap for more":"");xe(h,G,v-b,_-28,26,nn,500,"right")}xt.body.update()}function An(){Re(),$e()}St(xt.head.mesh,{tap:h=>{if(!h?.uv)return;let v=h.uv.x*xt.head.w;xt.btns.find(_=>v>=_.x0&&v<=_.x1)?.act()},grab:()=>xt.group}),St(xt.body.mesh,{tap:h=>{if(!h?.uv)return;let v=(1-h.uv.y)*xt.body.h;if(xt.mode==="results"){let _=xt.rows.find(b=>v>=b.y0&&v<b.y1);_&&mf(_.r)}else xt.mode==="reading"&&Ne(1)},scroll:h=>Ne(h),grab:()=>xt.group});function Ne(h){if(xt.mode!=="reading")return;let v=Math.max(0,Math.min(xt.paras.length-1,xt.first+Math.sign(h)));v===xt.first||h>0&&!xt.more||(xt.first=v,$e())}let Vn=new N;function Ji(){y.userData.placed!==!0&&(xt.group.updateWorldMatrix(!0,!1),Vn.set(-fn/2-.36,Tn/2-.02,.06),xt.group.localToWorld(Vn),Qn={x:Vn.x,y:Vn.y,z:Vn.z},y.userData.placed="web")}function Ha(){if(!xt.open){let h=le-(_t.open||tt.open?.85:.08),v=1.2;xt.group.position.set(Jt.x-Math.sin(h)*v,Jt.y-.02,Jt.z-Math.cos(h)*v),K(xt.group)}xt.open=!0,xt.group.visible=!0}function ff(h,v){return T?(xt.typed=h,Re(),Promise.resolve()):new Promise(_=>{let b=0,g=()=>{if(v!==xt.gen||!xt.open)return _();if(b=Math.min(h.length,b+(h.length>36?2:1)),xt.typed=h.slice(0,b),Re(),b>=h.length)return setTimeout(_,220);setTimeout(g,45+Math.random()*35)};g()})}async function pf(h){h=String(h||"").trim(),Ha();let v=++xt.gen;if(Object.assign(xt,{q:h,typed:"",results:[],page:null,err:"",mode:h?"typing":""}),An(),!h)return"What should I search for? Say search the web for, and what you want to know.";if(Ji(),await ff(h,v),v!==xt.gen||!xt.open)return"";xt.mode="searching",An();let _;try{_=await e.search(h)}catch(b){_={error:String(b?.message||b)}}return v!==xt.gen||!xt.open?"":!_||_.error?(Object.assign(xt,{mode:"error",err:_?.error||"The search didn't work."}),An(),xt.err):(Object.assign(xt,{mode:"results",results:Array.isArray(_.results)?_.results:[]}),An(),_.answer||(xt.results.length?"Here's what Google found. Point at one and I'll read it to you.":"Google didn't find anything for that."))}async function mf(h){let v=++xt.gen;Object.assign(xt,{mode:"page-loading",page:h,paras:[],first:0,title:"",err:""}),An();let _;try{_=await e.read(h,xt.q)}catch(b){_={error:String(b?.message||b)}}if(!(v!==xt.gen||!xt.open)){if(!_||_.error){Object.assign(xt,{mode:"page-error",err:_?.error||"I couldn't read that page."}),An();return}Object.assign(xt,{mode:"reading",title:_.title||h.site,paras:Array.isArray(_.paras)&&_.paras.length?_.paras:["That page gave me nothing to read."]}),An(),e.speak?.(xt.paras[0])}}function uc(){xt.open=!1,xt.gen++,xt.group.visible=!1,y.userData.placed==="web"&&(_t.open?(y.userData.placed=!1,ai("pc")):at.open?(y.userData.placed=!1,ai("holo")):Ys())}let on={teal:6220500,sky:8246268,violet:12891645,rose:16622767,amber:16569165,lime:12513892,white:15331063},gf=h=>"#"+(on[h]??on.teal).toString(16).padStart(6,"0"),at={group:new Ye,stage:new Ye,open:!1,spec:null,nodes:[],links:[],bar:Ke(.86,.1),t0:0,focus:null,step:-1,building:null,btns:[]};at.group.visible=!1,at.group.add(at.stage,at.bar.mesh),at.bar.mesh.position.set(0,-.42,.02),c.add(at.group),u(at.bar.tex);let Hs=u(hf()),_f=u(new Un(1,32,24)),xf=u(new Mi(1,1,1)),vf=(()=>{let h=new ds(1,1),v=u(new wr(h));return h.dispose(),v})(),Jh={value:0};function Ws(h){return new _n({uniforms:{color:{value:new jt(h)},opacity:{value:.82},time:Jh},vertexShader:`varying vec3 vN; varying vec3 vV; varying float vY;
void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
  vY = (modelMatrix * vec4(position, 1.0)).y; gl_Position = projectionMatrix * mv; }`,fragmentShader:`uniform vec3 color; uniform float opacity; uniform float time; varying vec3 vN; varying vec3 vV; varying float vY;
void main(){ float rim = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.0);
  float lines = 0.8 + 0.2 * step(0.5, fract(vY * 150.0 - time * 0.9));
  gl_FragColor = vec4(color * (0.5 + rim * 1.5) * lines, opacity * (0.45 + rim * 0.55));
  #include <colorspace_fragment>
}`,transparent:!0,depthWrite:!1})}let Te={group:new Ye,rings:[],beam:null,dots:null,scan:null,scanT0:-1,speed:[]};{let h=b=>new rn({color:on.teal,transparent:!0,opacity:b,blending:en,depthWrite:!1,side:Yn});for(let[b,g,E,W,O]of[[.985,1,.32,96,.25],[.7,.71,.24,96,-.4],[.4,.44,.14,6,.6]]){let Z=new ce(u(new fs(b,g,W)),u(h(E)));Z.rotation.x=-Math.PI/2,Te.group.add(Z),Te.rings.push(Z),Te.speed.push(O)}Te.beam=new ce(u(new ui(.85,1,1,48,1,!0)),u(new _n({uniforms:{color:{value:new jt(on.teal)},strength:{value:.14}},vertexShader:"varying float vY; void main(){ vY = position.y + 0.5; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`uniform vec3 color; uniform float strength; varying float vY;
void main(){ float a = strength * pow(1.0 - vY, 2.2); gl_FragColor = vec4(color * a, a);
  #include <colorspace_fragment>
}`,transparent:!0,blending:en,depthWrite:!1,side:Yn}))),Te.beam.position.y=.5,Te.group.add(Te.beam);let v=70,_=new Float32Array(v*3);Te.rise=[];for(let b=0;b<v;b++){let g=Math.random()*Math.PI*2,E=Math.sqrt(Math.random())*.88;_.set([Math.cos(g)*E,Math.random(),Math.sin(g)*E],b*3),Te.rise.push(.05+Math.random()*.1)}Te.dots=new Ns(u(new Le().setAttribute("position",new ne(_,3))),u(new ls({color:on.teal,size:.006,transparent:!0,opacity:.75,blending:en,depthWrite:!1}))),Te.group.add(Te.dots),Te.scan=new ce(u(new fs(.95,1,96)),u(h(0))),Te.scan.rotation.x=-Math.PI/2,Te.group.add(Te.scan),Te.group.visible=!1,at.group.add(Te.group)}function Br(h,v){let _=Math.max(.24,Math.min(.7,h));Te.group.scale.set(_,.68,_),Te.group.position.set(0,-.34,0),Te.group.visible=!0,Te.scanT0=v&&!T?performance.now():-1,Te.scan.material.opacity=0}function yf(h,v){if(!Te.group.visible||T)return;Te.rings.forEach((b,g)=>{b.rotation.z+=h*Te.speed[g]});let _=Te.dots.geometry.attributes.position;for(let b=0;b<_.count;b++){let g=_.getY(b)+h*Te.rise[b];g>1&&(g-=1),_.setY(b,g)}if(_.needsUpdate=!0,Te.scanT0>=0){let b=(v-Te.scanT0)/1100;b>=1?(Te.scanT0=-1,Te.scan.material.opacity=0):(Te.scan.position.y=b,Te.scan.material.opacity=.9*Math.sin(Math.PI*b))}}function zr(){for(let h of at.nodes){for(let v of[h.mat,h.glow.material,h.label.mesh.material])v.dispose();h.label.tex.dispose(),h.label.mesh.geometry.dispose(),h.ring?.geometry.dispose(),h.ring?.material.dispose(),h.shell?.material.dispose(),Kt(h.body),Kt(h.label.mesh)}for(let h of at.links)h.line.geometry.dispose(),h.line.material.dispose(),h.pulse?.material.dispose();at.building&&(at.building.geometry.dispose(),at.building.material.dispose()),Tf(),Rf(),Df(),at.stage.clear(),at.nodes=[],at.links=[],at.building=null}function Wa(){let h=le-(_t.open?.9:0),v=1.35;at.group.position.set(Jt.x-Math.sin(h)*v,Jt.y+.02,Jt.z-Math.cos(h)*v),K(at.group)}function Xs(h){let{ctx:v,w:_,h:b}=at.bar;On(v,_,b,48);let g=b/2,E=b*.6;at.btns=[];let W=_-36,O=(nt,ut)=>{let wt=W-E/2;v.beginPath(),v.arc(wt,g,E/2,0,Math.PI*2),v.fillStyle="rgba(255,255,255,0.06)",v.fill(),v.lineWidth=3,v.strokeStyle="rgba(255,255,255,0.16)",v.stroke(),Ai(v,nt,wt,g,E*.62,ze,7),at.btns.push({x0:W-E,x1:W,act:ut}),W-=E+18};O("close",()=>dc());let Z=at.spec,G=Z?.steps?.length||0;Z&&G&&(at.step<G-1&&O("next",()=>e.holoStep?.(1)),at.step>0&&O("back",()=>e.holoStep?.(-1))),Ai(v,"holo",30+E/2,g,E*.7,Rn,6);let X=30+E+16;if(v.font=`600 38px ${He}`,v.font=`600 44px ${He}`,xe(v,Pn(v,h||Z?.title||"",W-X-190),X,g+15,44,ze,600,"left",He),Z&&G){let nt=at.step<0?`${G} steps \xB7 say next`:`Step ${at.step+1} of ${G}`;xe(v,nt,W-8,g+12,32,nn,500,"right")}at.bar.update()}St(at.bar.mesh,{tap:h=>{if(!h?.uv)return;let v=h.uv.x*at.bar.w;at.btns.find(_=>v>=_.x0&&v<=_.x1)?.act()},drag:()=>at.group});function Mf(h){zr(),at.spec=null,at.step=-1,at.focus=null,at.open||Wa(),at.open=!0,at.group.visible=!0;let v=new ce(new ps(.16,.0025,8,96),new rn({color:on.teal,transparent:!0,opacity:.7,depthWrite:!1}));at.stage.add(v),at.building=v,Br(.3,!1),Xs("Building "+(h?"\u201C"+String(h).slice(0,48)+"\u201D":"a hologram")+"\u2026"),ai("holo")}function Sf(h,v,_,b){let g=on[h.color]??on.teal,E=new Ye,W=_==="chart"?new rn({color:g,transparent:!0,opacity:.82,depthWrite:!0}):Ws(g),O,Z;_==="chart"?(O=new ce(xf,W),Z=.04):(Z=_==="model"?.022+h.size*.016:_==="map"&&v===0?.055:.03,O=new ce(_f,W),O.scale.setScalar(Z));let G=new yi(new hi({map:Hs,color:g,transparent:!0,opacity:.5,blending:en,depthWrite:!1}));G.scale.setScalar(Z*(_==="chart"?3:5.5));let X=_==="steps"||_==="map"&&v===0,nt=_==="model",ut=Ke(nt?.15:X?.26:.24,nt?.05:X?.13:.085);{let{ctx:ee,w:ue,h:Pe}=ut;On(ee,ue,Pe,30,{fill0:"rgba(16,19,27,0.82)",fill1:"rgba(10,12,18,0.86)"});let tn=nt?-2:16,Ht=nt?"":_==="timeline"&&h.when?h.when:_==="steps"?String(v+1):_==="chart"&&Number.isFinite(h.value)?String(h.value)+(b.unit?" "+b.unit:""):"";if(Ht&&(xe(ee,Ht,26,tn+=34,30,gf(h.color),700,"left",He),tn+=4),ee.font=`600 36px ${He}`,xe(ee,Pn(ee,h.label,ue-52),26,tn+=40,36,ze,600,"left",He),h.note&&!nt){ee.font=`500 26px ${an}`;let de=a.wrapLines(h.note,ue-52,Ve=>ee.measureText(Ve).width).slice(0,X?3:1);for(let Ve of de)xe(ee,Ve,26,tn+=34,26,nn,500)}ut.update()}ut.mesh.material.opacity=1,E.add(O,G,ut.mesh);let wt=null;_!=="chart"&&(wt=new Ds(vf,new ii({color:g,transparent:!0,opacity:.3,blending:en,depthWrite:!1})),wt.scale.setScalar(Z*1.45),wt.rotation.set(v*.7,v*1.3,0),E.add(wt));let dt={it:h,i:v,g:E,body:O,mat:W,glow:G,label:ut,shell:wt,r:Z,kind:_,base:new N,angle:0,speed:0,orbitR:0,parent:null,shown:0,emph:1},Yt=()=>e.ask?.(`Tell me more about ${h.label}`+(b.title?`, in ${b.title}`:"")+".");return St(O,{tap:Yt,hover:ee=>{dt.hot=ee}}),St(ut.mesh,{tap:Yt,hover:ee=>{dt.hot=ee}}),dt}function bf(h,v){let _=v.length,b=(E,W)=>_>1?(E/(_-1)-.5)*W:0;if(h.kind==="model"){let E=v.filter(O=>O.it.orbit<0);E.forEach((O,Z)=>{O.base.set(E.length>1?(Z/(E.length-1)-.5)*Math.min(.95,.32*E.length):0,.02,0)});let W=new Map;for(let O of v)if(O.it.orbit>=0){let Z=v[O.it.orbit],G=W.get(Z)||0;W.set(Z,G+1),O.parent=Z,O.orbitR=Z.r+O.r+.07+G*.075,O.angle=G*2.1+.6,O.speed=.45/(1+G*.55);let X=[];for(let nt=0;nt<=64;nt++){let ut=nt/64*Math.PI*2;X.push(Math.cos(ut)*O.orbitR,Math.sin(ut)*O.orbitR*.22,Math.sin(ut)*O.orbitR*.85)}O.ring=new Li(new Le().setAttribute("position",new ne(X,3)),new ii({color:on[Z.it.color]??on.teal,transparent:!0,opacity:.28,depthWrite:!1})),at.stage.add(O.ring)}for(let O of v)O.label.mesh.position.set(0,-(O.r+.06),.01)}else if(h.kind==="map"){v[0].base.set(0,.02,0),v[0].label.mesh.position.set(0,-.14,.01);let E=v.slice(1);E.forEach((W,O)=>{let Z=-Math.PI/2+(O+.5)/E.length*Math.PI*2;W.base.set(Math.cos(Z)*.46,Math.sin(Z)*.27+.02,.03+O%2*.05),W.label.mesh.position.set(0,-.075,.01)})}else if(h.kind==="steps")v.forEach((E,W)=>{let O=b(W,Math.min(1.1,.28*_));E.base.set(O,.13,.16*(1-(O/.6)**2)),E.label.mesh.position.set(0,-.12,.01)});else if(h.kind==="timeline"){v.forEach((O,Z)=>{O.base.set(b(Z,Math.min(1.15,.27*_)),0,0),O.label.mesh.position.set(0,Z%2?-.1:.1,.01)});let E=[-.62,0,0,.62,0,0],W=new Li(new Le().setAttribute("position",new ne(E,3)),new ii({color:on.white,transparent:!0,opacity:.35,depthWrite:!1}));at.stage.add(W),at.links.push({line:W,a:null,b:null})}else if(h.kind==="chart"){let E=Math.max(...v.map(G=>Math.abs(G.it.value)||0),1e-9),W=v.some(G=>G.it.value<0),O=W?-.02:-.26,Z=W?.24:.46;v.forEach((G,X)=>{let nt=Number.isFinite(G.it.value)?G.it.value:0,ut=Math.max(.01,Z*Math.abs(nt)/E),wt=nt<0;G.body.scale.set(.075,ut,.075),G.base.set(b(X,Math.min(1.05,.22*_)),O+(wt?-ut/2:ut/2),0),G.glow.position.set(0,wt?-ut/2:ut/2,0),G.label.mesh.position.set(0,wt?ut/2+.06:-ut/2-.06,.05)})}let g=[];for(let E of v)for(let W of E.it.link)v[W]&&W!==E.i&&g.push([E,v[W]]);if(h.kind==="map"&&!g.length)for(let E of v.slice(1))g.push([v[0],E]);if(h.kind==="steps")for(let E=1;E<_;E++)g.push([v[E-1],v[E]]);for(let[E,W]of g){let O=new Li(new Le().setAttribute("position",new ne([0,0,0,0,0,0],3)),new ii({color:on.teal,transparent:!0,opacity:0,depthWrite:!1}));at.stage.add(O);let Z=new yi(new hi({map:Hs,color:on[W.it.color]??on.teal,transparent:!0,opacity:0,blending:en,depthWrite:!1}));Z.scale.setScalar(.05),at.stage.add(Z),at.links.push({line:O,a:E,b:W,pulse:Z,off:at.links.length*.37})}}function wf(h){if(zr(),kr(),at.spec=h,at.step=-1,at.focus=null,at.t0=performance.now(),at.open||Wa(),at.open=!0,at.group.visible=!0,h.kind==="sketch"){Br(Af(h)+.06,!0),Xs(),ai("holo");return}at.nodes=h.items.map((_,b)=>Sf(_,b,h.kind,h));for(let _ of at.nodes)at.stage.add(_.g);bf(h,at.nodes);for(let _ of at.nodes)_.g.position.copy(_.base),_.g.scale.setScalar(T?1:.001);let v=Math.max(.2,...at.nodes.map(_=>Math.abs(_.base.x)+_.r+(_.parent?_.orbitR+Math.abs(_.parent.base.x):0)));at.reach=v,Br(v+.06,!0),Xs(),ai("holo")}let sn=.32,Ts={parts:[],made:[]};function Tf(){for(let h of Ts.made)try{h.dispose()}catch{}Ts.parts=[],Ts.made=[]}function Af(h){let v=E=>(Ts.made.push(E),E),_=E=>new N(E[0]*sn,E[1]*sn+.04,E[2]*sn),b=(E,W)=>{W==="x"?E.rotation.z=-Math.PI/2:W==="z"&&(E.rotation.x=Math.PI/2)},g=.2;return h.shapes.forEach((E,W)=>{let O=on[E.color]??on.teal,Z=new Ye,G=v(new rn({color:O,transparent:!0,opacity:.95,blending:en,depthWrite:!1})),X=null,nt=null,ut=null,wt=(Ht,de=!1)=>{let Ve=v(new pa(Ht,96,.0045,6,de));nt=new ce(Ve,G),Z.add(nt),X=Ht},dt=_(E.center),Yt=(Ht,de,Ve,Se=48)=>{let hn=[];for(let Ie=0;Ie<Se;Ie++){let fi=Ie/Se*Math.PI*2,Wn=Math.cos(fi)*de,Xn=Math.sin(fi)*de;hn.push(Ve==="y"?new N(Ht.x+Wn,Ht.y,Ht.z+Xn):Ve==="x"?new N(Ht.x,Ht.y+Wn,Ht.z+Xn):new N(Ht.x+Wn,Ht.y+Xn,Ht.z))}return new us(hn,!0)};if(E.type==="line"||E.type==="arrow"){let Ht=new da;for(let de=1;de<E.points.length;de++)Ht.add(new br(_(E.points[de-1]),_(E.points[de])));if(wt(Ht),E.type==="arrow"){let de=_(E.points[E.points.length-1]),Ve=_(E.points[E.points.length-2]),Se=new ce(v(new hs(.016,.04,10)),G);Se.position.copy(de),Se.quaternion.setFromUnitVectors(new N(0,1,0),de.clone().sub(Ve).normalize()),Z.add(Se)}}else if(E.type==="curve")wt(new us(E.points.map(_)));else if(E.type==="circle")wt(Yt(dt,E.radius*sn,E.axis),!0);else if(E.type==="spiral"||E.type==="wave"){let Ht=[];for(let Ve=0;Ve<=120;Ve++){let Se=Ve/120;if(E.type==="spiral"){let hn=Se*E.turns*Math.PI*2,Ie=(Se-.5)*E.height*sn,fi=Math.cos(hn)*E.radius*sn,Wn=Math.sin(hn)*E.radius*sn;Ht.push(E.axis==="x"?new N(dt.x+Ie,dt.y+fi,dt.z+Wn):E.axis==="z"?new N(dt.x+fi,dt.y+Wn,dt.z+Ie):new N(dt.x+fi,dt.y+Ie,dt.z+Wn))}else{let hn=(Se-.5)*2*E.radius*sn*2,Ie=Math.sin(Se*Math.PI*2*E.turns)*E.height*sn*.25;Ht.push(new N(dt.x+hn,dt.y+Ie,dt.z))}}wt(new us(Ht))}else{let Ht;E.type==="sphere"?Ht=new Un(E.radius*sn,20,14):E.type==="cone"?Ht=new hs(E.radius*sn,E.height*sn,20,1,!0):E.type==="cylinder"?Ht=new ui(E.radius*sn,E.radius*sn,E.height*sn,20,1,!0):Ht=new Mi(E.size[0]*sn,E.size[1]*sn,E.size[2]*sn),v(Ht);let de=new ce(Ht,v(Ws(O)));de.material.uniforms.opacity.value=.35;let Ve=new Ds(v(new wr(Ht)),v(new ii({color:O,transparent:!0,opacity:.55,blending:en,depthWrite:!1}))),Se=new Ye;Se.add(de,Ve),ut={body:de.material,wire:Ve.material},b(Se,E.axis),Se.position.copy(dt),Z.add(Se),E.flow&&(X=Yt(dt,(E.type==="box"?Math.max(E.size[0],E.size[2])/2:E.radius)*sn*1.08,E.axis==="y"?"y":E.axis==="x"?"x":"z"))}let ee=[];if(E.flow&&X)for(let Ht=0;Ht<6;Ht++){let de=new yi(v(new hi({map:Hs,color:O,transparent:!0,opacity:0,blending:en,depthWrite:!1})));de.scale.setScalar(.04),Z.add(de),ee.push({sp:de,off:Ht/6})}let ue=null;if(E.label){ue=Ke(.16,.045),v(ue.tex),v(ue.mesh.geometry),v(ue.mesh.material);let{ctx:Ht,w:de,h:Ve}=ue;On(Ht,de,Ve,26,{fill0:"rgba(16,19,27,0.82)",fill1:"rgba(10,12,18,0.86)"}),Ht.font=`600 34px ${He}`,xe(Ht,Pn(Ht,E.label,de-40),20,Ve/2+12,34,ze,600,"left",He),ue.update();let Se=X&&(E.type==="line"||E.type==="curve"||E.type==="arrow"||E.type==="spiral"||E.type==="wave")?X.getPointAt(.55,new N):dt.clone().add(new N((E.type==="box"?E.size[0]/2:E.radius)*sn*.7,0,0)),hn=W%2?-1:1;ue.mesh.position.set(Se.x+hn*.1,Se.y,Se.z+.03),Z.add(ue.mesh),St(ue.mesh,{tap:()=>e.ask?.(`Tell me more about the ${E.label}`+(h.title?`, in ${h.title}`:"")+".")})}Z.visible=T,at.stage.add(Z);let Pe=nt?nt.geometry.index.count:0;nt&&!T&&nt.geometry.setDrawRange(0,0),Ts.parts.push({s:E,i:W,g:Z,tube:nt,count:Pe,path:X,flows:ee,label:ue,lineMat:G,solid:ut,emph:1});let tn=E.points.length?E.points:[E.center];for(let Ht of tn)g=Math.max(g,Math.abs(Ht[0]*sn)+(E.type==="line"||E.type==="curve"||E.type==="arrow"?0:E.radius*sn))}),g}let Kh=new N;function Ef(h,v){let _=v-at.t0,b=Ts.parts.length;Ts.parts.forEach(g=>{let E=T?1:Math.max(0,Math.min(1,(_-250-g.i*(1600/Math.max(1,b)))/700));E>0&&(g.g.visible=!0),g.tube&&g.count&&g.tube.geometry.setDrawRange(0,Math.floor(g.count*E/3)*3),g.tube||g.g.scale.setScalar(Math.max(.001,1-(1-E)**3));let W=at.focus?at.focus.has(g.i)?1.15:.25:1;g.emph+=(W-g.emph)*Math.min(1,h*6);let O=g.s.pulse&&!T?.75+.25*Math.sin(v/380+g.i):1;if(g.lineMat.opacity=.95*Math.min(1,g.emph)*O,g.solid&&(g.solid.body.uniforms.opacity.value=.35*Math.min(1,g.emph)*O,g.solid.wire.opacity=.55*Math.min(1,g.emph)*O),g.label&&(g.label.mesh.material.opacity=Math.max(.3,Math.min(1,g.emph))),g.s.spin&&!T&&(g.g.rotation.y+=h*.35),g.path&&g.flows.length)for(let Z of g.flows){let G=T?Z.off:(v/2400+Z.off)%1;g.path.getPointAt(G,Kh),Z.sp.position.copy(Kh),Z.sp.material.opacity=E>=1?.9*Math.min(1,g.emph)*(T?.6:Math.sin(Math.PI*G)*.6+.4):0}})}let Ki={card:null};function kr(){Ki.card&&(Kt(Ki.card.mesh),at.group.remove(Ki.card.mesh),Ki.card.tex.dispose(),Ki.card.mesh.geometry.dispose(),Ki.card.mesh.material.dispose(),Ki.card=null)}async function Cf({url:h,title:v,note:_}){if(!at.open)return;let b=new Image;b.crossOrigin="anonymous",b.src=h;try{await b.decode()}catch{return}if(!at.open)return;kr();let g=Ke(.34,.3,1024),{ctx:E,w:W,h:O}=g;On(E,W,O,36);let Z=W-40,G=O-150,X=b.width/b.height,nt=Z/G,ut=X>nt?b.height*nt:b.width,wt=X>nt?b.height:b.width/nt;E.save(),$n(E,20,20,Z,G,22),E.clip(),E.drawImage(b,(b.width-ut)/2,(b.height-wt)/2,ut,wt,20,20,Z,G),E.restore(),E.font=`600 40px ${He}`,xe(E,Pn(E,v,W-60),30,O-82,40,ze,600,"left",He),E.font=`500 26px ${an}`,xe(E,Pn(E,(_?_+" \xB7 ":"")+"Photo: Wikipedia",W-60),30,O-36,26,nn,500),g.update(),g.mesh.position.set(Math.max(.62,(at.reach||.4)+.26),.06,.04),g.mesh.rotation.y=-.35,at.group.add(g.mesh),Ki.card=g,St(g.mesh,{tap:()=>e.ask?.(`Tell me more about ${v}.`),drag:()=>at.group})}let En={mesh:null,mark:null,made:[],credit:null};function Rf(){for(let h of En.made)try{h.dispose()}catch{}En.credit&&Kt(En.credit.mesh),Object.assign(En,{mesh:null,mark:null,made:[],credit:null})}function Pf({title:h,map:v,rings:_,glow:b}){zr(),kr(),at.spec={title:h,kind:"globe",steps:[],items:[]},at.step=-1,at.focus=null,at.t0=performance.now(),at.open||Wa(),at.open=!0,at.group.visible=!0;let g=X=>(En.made.push(X),X),E=g(new ga().setCrossOrigin("anonymous").load(v));E.colorSpace=mn,E.anisotropy=4;let W=.2,O=new ce(g(new Un(W,64,40)),g(new rn({map:E})));O.position.set(0,.12,0),O.rotation.x=.41,at.stage.add(O);let Z=new yi(g(new hi({map:Hs,color:b?16757575:10475775,transparent:!0,opacity:b?.9:.35,blending:en,depthWrite:!1})));if(Z.scale.setScalar(W*(b?4.2:2.7)),Z.position.copy(O.position),at.stage.add(Z),_){let X=new ce(g(new fs(W*1.25,W*2.1,96)),g(new rn({color:14272416,transparent:!0,opacity:.55,side:Yn,depthWrite:!1})));X.rotation.x=-Math.PI/2+.45,X.position.copy(O.position),at.stage.add(X)}let G=Ke(.26,.04);g(G.tex),g(G.mesh.geometry),g(G.mesh.material);{let{ctx:X,w:nt,h:ut}=G;On(X,nt,ut,22,{fill0:"rgba(16,19,27,0.7)",fill1:"rgba(10,12,18,0.75)"}),xe(X,"Map: Solar System Scope \xB7 CC BY 4.0",20,ut/2+9,26,nn,500),G.update()}G.mesh.position.set(0,-.15,.05),at.stage.add(G.mesh),En.mesh=O,En.credit=G,at.reach=W*(_?2.1:1.3),Br(at.reach+.06,!0),Xs(),ai("holo")}function If(h,v){if(!En.mesh)return;let _=.2*1.01,b=(Number(v)+180)/360*Math.PI*2,g=(90-Number(h))/180*Math.PI;if(!En.mark){let E=new yi(new hi({map:Hs,color:16734810,transparent:!0,opacity:1,blending:en,depthWrite:!1}));En.made.push(E.material),E.scale.setScalar(.08),En.mesh.add(E),En.mark=E}En.mark.position.set(-_*Math.cos(b)*Math.sin(g),_*Math.cos(g),_*Math.sin(b)*Math.sin(g))}function Lf(h,v){En.mesh&&(T||(En.mesh.rotation.y+=h*.12),En.mark&&!T&&En.mark.scale.setScalar(.07+.03*Math.abs(Math.sin(v/300))))}let Gn=-.22,ji=.36,Hn=.34,je={spec:null,made:[],st:null,card:null,readAt:0,parts:null};function Df(){for(let h of je.made)try{h.dispose()}catch{}je.card&&Kt(je.card.mesh),Object.assign(je,{spec:null,made:[],st:null,card:null,readAt:0,parts:null})}let pn=h=>(je.made.push(h),h);function Qi(h,v){let _=new Ye,b=new ce(pn(new Un(v,20,14)),pn(Ws(h)));b.material.uniforms.opacity.value=.95;let g=new yi(pn(new hi({map:Hs,color:h,transparent:!0,opacity:.8,blending:en,depthWrite:!1})));return g.scale.setScalar(v*5),_.add(b,g),_}function oi(h,v,_=.9){let b=pn(new Le().setAttribute("position",new ne(new Float32Array(h*3),3))),g=b.attributes.position.array;b.setDrawRange(0,0);let E=new Li(b,pn(new ii({color:v,transparent:!0,opacity:_,blending:en,depthWrite:!1})));return E.frustumCulled=!1,{line:E,pos:g,geo:b,n:h,used:0,set(W,O,Z,G=0){g[W*3]=O,g[W*3+1]=Z,g[W*3+2]=G},draw(W){this.used=W,b.setDrawRange(0,W),b.attributes.position.needsUpdate=!0},push(W,O,Z=0){this.used>=h&&(g.copyWithin(0,3),this.used=h-1),this.set(this.used,W,O,Z),this.draw(this.used+1)},clear(){this.draw(0)}}}function Xa(h){let v=oi(2,on.white,.35);if(v.set(0,-Hn,Gn),v.set(1,Hn,Gn),v.draw(2),at.stage.add(v.line),!h)return;let _=Ke(.16,.036);pn(_.tex),pn(_.mesh.geometry),pn(_.mesh.material),xe(_.ctx,h,_.w-8,_.h/2+10,30,nn,500,"right"),_.update(),_.mesh.position.set(Hn-.08,Gn-.025,.01),at.stage.add(_.mesh)}let Qe=(h,v)=>Number.isFinite(h)?(Math.abs(h)>=100?Math.round(h):Math.abs(h)>=10?h.toFixed(1):h.toFixed(2))+(v?" "+v:""):"\u2014";function jh(h){let v=je.card;if(!v)return;let{ctx:_,w:b,h:g}=v;On(_,b,g,30,{fill0:"rgba(16,19,27,0.86)",fill1:"rgba(10,12,18,0.9)"}),xe(_,Pn(_,h[0],b-60),30,58,40,Rn,600,"left",He),_.font=`500 34px ${an}`,xe(_,Pn(_,h[1]||"",b-60),30,112,34,ze,500),v.update()}function Nf(h,v){zr(),kr(),at.spec={title:h.title,kind:"sim",steps:[],items:[]},at.step=-1,at.focus=null,at.t0=performance.now(),at.open||Wa(),at.open=!0,at.group.visible=!0,je.spec=h;let _=Ke(.6,.06);pn(_.tex),pn(_.mesh.geometry),pn(_.mesh.material),_.mesh.position.set(0,Gn-.085,.04),at.stage.add(_.mesh),je.card=_,St(_.mesh,{tap:()=>e.ask?.("Explain why the "+h.type+" moves like that, simply.")});let b=h.g,g=on.teal,E=on.amber,W=on.sky,O=on.white,Z={};if(h.type==="pendulum"){let G=new N(0,ji,0),X=ji-Gn-.08,nt=new ce(pn(new ui(.0032,.0032,1,8)),pn(new rn({color:O,transparent:!0,opacity:.85,blending:en,depthWrite:!1}))),ut=oi(90,g,.55),wt=oi(49,O,.18),dt=h.angle*Math.PI/180;for(let ue=0;ue<=48;ue++){let Pe=-dt+2*dt*ue/48;wt.set(ue,Math.sin(Pe)*X,ji-Math.cos(Pe)*X)}wt.draw(49);let Yt=Qi(g,.026),ee=Qi(O,.008);ee.position.copy(G),at.stage.add(nt,ut.line,wt.line,Yt,ee),Object.assign(Z,{pivot:G,Ld:X,bar:nt,trail:ut,bob:Yt}),je.st={th:dt,w:0,t:0,lastCross:-1,period:NaN,dir:0},Xa("")}else if(h.type==="projectile"){let G=h.angle*Math.PI/180,X=h.speed,nt=b>0?X*X*Math.sin(2*G)/b:X*3,ut=b>0?X*X*Math.sin(G)**2/(2*b):X*3*Math.sin(G),wt=0,dt=0;if(v?.type==="projectile"&&v.g>0){let Se=v.angle*Math.PI/180;wt=v.speed**2*Math.sin(2*Se)/v.g,dt=v.speed**2*Math.sin(Se)**2/(2*v.g)}let Yt=Math.min((2*Hn-.04)/Math.max(nt,wt,.5),(ji-Gn-.04)/Math.max(ut,dt,.25)),ee=-Hn+.02,ue=(Se,hn,Ie)=>{let fi=Se.g>0?2*Se.speed*Math.sin(Se.angle*Math.PI/180)/Se.g:3;for(let Wn=0;Wn<Ie;Wn++){let Xn=fi*Wn/(Ie-1),Zs=Se.angle*Math.PI/180;hn.set(Wn,ee+Se.speed*Math.cos(Zs)*Xn*Yt,Gn+(Se.speed*Math.sin(Zs)*Xn-Se.g*Xn*Xn/2)*Yt)}hn.draw(Ie)},Pe=oi(64,O,.16);if(ue(h,Pe,64),at.stage.add(Pe.line),wt){let Se=oi(64,W,.28);ue(v,Se,64),at.stage.add(Se.line)}let tn=Qi(E,.016),Ht=oi(200,E,.85),de=oi(2,g,.9),Ve=Qi(g,.009);Ve.visible=!1,at.stage.add(tn,Ht.line,de.line,Ve),Object.assign(Z,{scale:Yt,x0:ee,th:G,v:X,ball:tn,trail:Ht,arrow:de,mark:Ve,R:nt}),je.st={t:0,rest:0},Xa(Qe(2*Hn/Yt,"m"))}else if(h.type==="drop"){let G=(ji-Gn-.04)/h.length,X=Gn+h.length*G,nt=Qi(E,.02);nt.position.set(h.feather?-.09:0,X,0),at.stage.add(nt);let ut=null;if(h.feather){ut=new Ye;let dt=new ce(pn(new Un(1,16,10)),pn(Ws(O)));dt.scale.set(.011,.034,.004),ut.add(dt),ut.position.set(.09,X,0),at.stage.add(ut)}let wt=oi(2,O,.25);wt.set(0,-Hn+.03,Gn),wt.set(1,-Hn+.03,X),wt.draw(2),at.stage.add(wt.line),Object.assign(Z,{scale:G,top:X,hammer:nt,feather:ut}),je.st={t:0,y:h.length,v:0,fy:h.length,fv:0,landed:-1,fLanded:-1,rest:0},Xa(Qe(h.length,"m")+" drop")}else if(h.type==="orbit"){let G=new ce(pn(new Un(.05,32,20)),pn(Ws(W)));G.position.set(0,.07,0);let X=.13,nt=6,ut=2*Math.PI*X/nt,wt=ut*ut*X,dt=Qi(O,.014),Yt=oi(420,g,.6);at.stage.add(G,dt,Yt.line),Object.assign(Z,{planet:G,moon:dt,trail:Yt,GM:wt,r0:X}),je.st={x:X,y:0,vx:0,vy:ut*h.rate,t:0,rest:0}}else if(h.type==="spring"){let G=ji,X=.06,nt=oi(160,g,.85),ut=oi(2,O,.6);ut.set(0,-.06,G),ut.set(1,.06,G),ut.draw(2);let wt=new ce(pn(new Mi(.06,.05,.06)),pn(Ws(E)));at.stage.add(nt.line,ut.line,wt);let dt=20,Yt=Math.sqrt(dt/h.mass);Object.assign(Z,{top:G,rest:X,coil:nt,box:wt,omega:Yt}),je.st={t:0},Xa("")}else if(h.type==="wave"){let X=oi(96,g,.9),nt=[];for(let wt=0;wt<16;wt++){let dt=Qi(wt===7?E:O,wt===7?.011:.006);nt.push(dt),at.stage.add(dt)}let ut=Qi(g,.012);at.stage.add(X.line,ut),Object.assign(Z,{n:96,line:X,beads:nt,crest:ut,perM:2*Hn/2}),je.st={t:0}}je.parts=Z,at.reach=Hn,Br(Hn+.06,!0),Xs(),ai("holo"),jh([h.title,"\u2026"])}function Uf(h,v){let _=je.spec,b=je.parts,g=je.st;if(!_||!b||!g)return;h=Math.min(h,.05);let E=_.g,W=null;if(_.type==="pendulum"){let O=_.length;for(let X=0;X<4;X++){let nt=h/4,ut=g.th;g.w+=-(E/O)*Math.sin(g.th)*nt,g.th+=g.w*nt,g.t+=nt,ut<0&&g.th>=0&&(g.lastCross>=0&&(g.period=g.t-g.lastCross),g.lastCross=g.t)}let Z=Math.sin(g.th)*b.Ld,G=ji-Math.cos(g.th)*b.Ld;b.bob.position.set(Z,G,0),b.bar.position.set(Z/2,(ji+G)/2,0),b.bar.scale.set(1,b.Ld,1),b.bar.rotation.z=g.th,b.trail.push(Z,G),b.trail.used>40&&(b.trail.pos.copyWithin(0,3),b.trail.draw(40)),W=()=>[E>0?"T = 2\u03C0\u221A(L/g) \u2248 "+Qe(2*Math.PI*Math.sqrt(O/E),"s"):"No gravity: no swing","angle "+Math.round(g.th*180/Math.PI)+"\xB0   speed "+Qe(Math.abs(g.w)*O,"m/s")+"   measured swing "+(Number.isFinite(g.period)?Qe(g.period,"s"):"\u2026")]}else if(_.type==="projectile"){if(g.rest>0)g.rest-=h,g.rest<=0&&(g.t=0,b.trail.clear(),b.mark.visible=!1);else{g.t+=h;let O=b.v*Math.cos(b.th)*g.t,Z=b.v*Math.sin(b.th)*g.t-E*g.t*g.t/2,G=E>0?2*b.v*Math.sin(b.th)/E:3;g.t>=G&&(g.t=G,O=b.v*Math.cos(b.th)*G,Z=E>0?0:Z,g.rest=1.6,b.mark.visible=E>0,b.mark.position.set(b.x0+O*b.scale,Gn,0)),b.ball.position.set(b.x0+O*b.scale,Gn+Math.max(0,Z)*b.scale,0),b.trail.push(b.ball.position.x,b.ball.position.y);let X=b.v*Math.cos(b.th),nt=b.v*Math.sin(b.th)-E*g.t,ut=.06/Math.max(1,b.v);b.arrow.set(0,b.ball.position.x,b.ball.position.y),b.arrow.set(1,b.ball.position.x+X*ut,b.ball.position.y+nt*ut),b.arrow.draw(2),g.x=O,g.y=Math.max(0,Z),g.sp=Math.hypot(X,nt)}W=()=>["range = v\xB2\xB7sin 2\u03B8 / g = "+Qe(b.R,"m"),"time "+Qe(g.t,"s")+"   height "+Qe(g.y??0,"m")+"   distance "+Qe(g.x??0,"m")+"   speed "+Qe(g.sp??_.speed,"m/s")]}else if(_.type==="drop")g.rest>0?(g.rest-=h,g.rest<=0&&Object.assign(g,{t:0,y:_.length,v:0,fy:_.length,fv:0,landed:-1,fLanded:-1})):E>0&&(g.t+=h,g.landed<0&&(g.v+=E*h,g.y-=g.v*h,g.y<=0&&(g.y=0,g.landed=g.t)),b.feather&&g.fLanded<0&&(g.fv+=(_.air?E*(1-g.fv*g.fv/(.5*.5)):E)*h,g.fy-=g.fv*h,g.fy<=0&&(g.fy=0,g.fLanded=g.t)),g.landed>=0&&(!b.feather||g.fLanded>=0||g.t-g.landed>6)&&(g.rest=2)),b.hammer.position.y=Gn+g.y*b.scale+.02,b.feather&&(b.feather.position.y=Gn+g.fy*b.scale+.02,b.feather.position.x=.09+(_.air&&g.fLanded<0?Math.sin(g.t*3)*.02:0),b.feather.rotation.z=_.air&&g.fLanded<0?Math.sin(g.t*3)*.5:0),W=()=>[E>0?"t = \u221A(2h/g) = "+Qe(Math.sqrt(2*_.length/E),"s"):"No gravity: nothing falls","time "+Qe(g.landed>=0?g.landed:g.t,"s")+"   fallen "+Qe(_.length-g.y,"m")+"   speed "+Qe(g.landed>=0?Math.sqrt(2*E*_.length):g.v,"m/s")+(b.feather?"   feather "+(g.fLanded>=0?"landed at "+Qe(g.fLanded,"s"):Qe(_.length-g.fy,"m")+" down"):"")];else if(_.type==="orbit"){if(g.rest>0)g.rest-=h,g.rest<=0&&(Object.assign(g,{x:b.r0,y:0,vx:0,vy:Math.sqrt(b.GM/b.r0)*_.rate,t:0}),b.trail.clear(),b.moon.visible=!0);else{for(let Z=0;Z<8;Z++){let G=h/8,X=Math.hypot(g.x,g.y),nt=-b.GM/(X*X*X);g.vx+=.5*nt*g.x*G,g.vy+=.5*nt*g.y*G,g.x+=g.vx*G,g.y+=g.vy*G;let ut=Math.hypot(g.x,g.y),wt=-b.GM/(ut*ut*ut);g.vx+=.5*wt*g.x*G,g.vy+=.5*wt*g.y*G}g.t+=h;let O=Math.hypot(g.x,g.y);(O<.055||O>.9)&&(g.rest=1.2,b.moon.visible=!1),b.moon.position.set(g.x,.07+g.y,0),b.trail.push(g.x,.07+g.y)}W=()=>{let O=Math.hypot(g.x,g.y),Z=Math.hypot(g.vx,g.vy),G=Math.sqrt(2*b.GM/Math.max(O,.001));return["gravity pulls in \xB7 speed carries it round","speed "+Qe(_.rate,"\xD7")+" a circle's   "+(Z>=G?"escaping":_.rate>1.02||_.rate<.98?"an ellipse":"a circle")+"   distance "+Qe(O/b.r0,"\xD7")]}}else if(_.type==="spring"){g.t+=h;let O=.07,Z=b.top-.2,G=Z+O*Math.cos(b.omega*g.t);b.box.position.set(0,G-.025,0);let X=b.coil.n,nt=12;for(let ut=0;ut<X;ut++){let wt=ut/(X-1),dt=wt*nt*Math.PI*2,Yt=b.top+(G-b.top)*wt,ee=wt<.04||wt>.96?0:1;b.coil.set(ut,Math.cos(dt)*.025*ee,Yt,Math.sin(dt)*.025*ee)}b.coil.draw(X),W=()=>["T = 2\u03C0\u221A(m/k) = "+Qe(2*Math.PI/b.omega,"s"),"mass "+Qe(_.mass,"kg")+"   spring 20 N/m   speed "+Qe(Math.abs(O*b.omega*Math.sin(b.omega*g.t))*1,"m/s")+"   gravity doesn't change the pace"]}else if(_.type==="wave"){g.t+=h;let O=_.rate,Z=1/O,G=2*Math.PI/Z,X=2*Math.PI*O,nt=.06,ut=.07;for(let dt=0;dt<b.n;dt++){let Yt=dt/(b.n-1)*2;b.line.set(dt,-Hn+Yt*b.perM,ut+nt*Math.sin(G*Yt-X*g.t))}b.line.draw(b.n),b.beads.forEach((dt,Yt)=>{let ee=Yt/15*2;dt.position.set(-Hn+ee*b.perM,ut+nt*Math.sin(G*ee-X*g.t),0)});let wt=((X*g.t/G+Z/4)%2+2)%2;b.crest.position.set(-Hn+wt*b.perM,ut+nt+.02,0),W=()=>["speed = frequency \xD7 wavelength = 1 m/s","frequency "+Qe(O,"Hz")+"   wavelength "+Qe(Z,"m")+"   the gold bead only moves up and down"]}W&&v-je.readAt>160&&(je.readAt=v,jh(W()))}function Ff(h,v){at.step=v??at.step,at.focus=Array.isArray(h)&&h.length?new Set(h):null,Xs()}function dc(){zr(),kr(),Te.group.visible=!1,at.open=!1,at.spec=null,at.group.visible=!1,e.holoClosed?.(),y.userData.placed==="holo"&&(_t.open?(y.userData.placed=!1,ai("pc")):Ys())}let Bn={group:null,sky:null,parts:null,dots:null,kind:"none",made:[],t0:0,spec:null};function fc(){if(!Bn.group)return!1;c.remove(Bn.group);for(let h of Bn.made)try{h.dispose()}catch{}return Object.assign(Bn,{group:null,sky:null,parts:null,dots:null,made:[],spec:null}),!0}function Of(h){fc();let v=dt=>(Bn.made.push(dt),dt),_=dt=>new jt(dt),b=new Ye;b.position.set(Jt.x,ht,Jt.z),b.rotation.y=le;let g=new ce(v(new Un(36,48,24)),v(new _n({side:Sn,transparent:!0,depthWrite:!0,uniforms:{top:{value:_(h.sky.top)},mid:{value:_(h.sky.horizon)},low:{value:_(h.sky.bottom)},fade:{value:T?1:0}},vertexShader:"varying vec3 vW; void main(){ vW = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`uniform vec3 top; uniform vec3 mid; uniform vec3 low; uniform float fade; varying vec3 vW;
void main(){ float h = vW.y; vec3 c = h < 0.0 ? mix(mid, low, clamp(-h * 3.0, 0.0, 1.0)) : mix(mid, top, clamp(pow(h, 0.7) * 1.3, 0.0, 1.0));
  gl_FragColor = vec4(c, fade);
  #include <colorspace_fragment>
}`})));g.renderOrder=-9,b.add(g);let E=new xa(_(h.sky.top),_(h.ground.color),1.1),W=new ya(_(h.light),1.4);W.position.set(6,10,4),b.add(E,W);let O=h.ground.kind;if(O!=="none"){let dt;if(O==="dunes"||O==="rock"||O==="snow"){dt=new qi(68,68,64,64);let ue=dt.attributes.position;for(let Pe=0;Pe<ue.count;Pe++){let tn=ue.getX(Pe),Ht=ue.getY(Pe),de=Math.hypot(tn,Ht),Ve=O==="dunes"?.55:O==="rock"?.35:.2;ue.setZ(Pe,de<3?0:Ve*Math.min(1,(de-3)/6)*(Math.sin(tn*.45)*Math.cos(Ht*.38)+.5*Math.sin((tn+Ht)*.9)))}dt.computeVertexNormals()}else dt=new Fs(34,72);v(dt);let Yt=v(O==="water"?new Yi({color:_(h.ground.color),transparent:!0,opacity:.92,emissive:_(h.ground.color),emissiveIntensity:.25}):O==="clouds"?new Yi({color:_(h.ground.color),transparent:!0,opacity:.85}):new Yi({color:_(h.ground.color),flatShading:O!=="grass"&&O!=="grid"})),ee=new ce(dt,Yt);if(ee.rotation.x=-Math.PI/2,ee.position.y=O==="clouds"?-.4:.002,ee.renderOrder=-8,b.add(ee),O==="grid"){let ue=[];for(let Pe=-30;Pe<=30;Pe+=1.5)ue.push(Pe,.01,-30,Pe,.01,30,-30,.01,Pe,30,.01,Pe);b.add(new Ds(v(new Le().setAttribute("position",new ne(ue,3))),v(new ii({color:_(h.light),transparent:!0,opacity:.55}))))}}let Z=new Ye,G={},X=(dt,Yt)=>G[dt]||(G[dt]=v(Yt())),nt={near:[4,9],mid:[9,17],far:[18,30]};for(let dt of h.shapes){let Yt=v(new Yi({color:_(dt.color),flatShading:!0})),ee=v(new rn({color:_(dt.color)})),ue=v(new Yi({color:_(dt.color).multiplyScalar(.35),flatShading:!0})),Pe=dt.kind==="mountain"?nt.far:dt.kind==="planet"||dt.kind==="moon"?[22,30]:nt[dt.spread];for(let tn=0;tn<dt.count;tn++){let Ht=tn/dt.count*Math.PI*2+Math.random()*.9,de=Pe[0]+Math.random()*(Pe[1]-Pe[0]);Math.abs(Math.atan2(Math.sin(Ht),Math.cos(Ht)))<.65&&de<12&&dt.kind!=="lantern"&&(de+=7);let Se=dt.size*(.75+Math.random()*.5),hn=new Ye,Ie=(Xn,Zs,_c=0,Kf=1,jf=1,Qf=1)=>{let $a=new ce(Xn,Zs);return $a.position.y=_c,$a.scale.set(Kf,jf,Qf),hn.add($a),$a};if(dt.kind==="tree")Ie(X("trunk",()=>new ui(.06,.09,.7,6)),ue,.35),Ie(X("blob",()=>new ds(.45,0)),Yt,.95);else if(dt.kind==="pine")Ie(X("trunk",()=>new ui(.06,.09,.7,6)),ue,.3),Ie(X("cone",()=>new hs(.42,1.3,7)),Yt,1.05);else if(dt.kind==="palm")Ie(X("stem",()=>new ui(.04,.07,1.9,6)),ue,.95),Ie(X("blob",()=>new ds(.45,0)),Yt,1.95,1.4,.35,1.4);else if(dt.kind==="rock")Ie(X("rock",()=>new ca(.4,0)),Yt,.15,1,.6,1);else if(dt.kind==="crystal")Ie(X("crystal",()=>new fa(.3,0)),ee,.7,.8,2.3,.8);else if(dt.kind==="pillar")Ie(X("pillar",()=>new ui(.25,.3,3,10)),Yt,1.5);else if(dt.kind==="tower")Ie(X("tower",()=>new Mi(1,6,1)),Yt,3);else if(dt.kind==="mountain")Ie(X("mountain",()=>new hs(6,8,7)),Yt,4);else if(dt.kind==="arch")Ie(X("arch",()=>new ps(1.2,.15,8,24,Math.PI)),Yt,0);else if(dt.kind==="lantern")Ie(X("lantern",()=>new Un(.12,12,8)),ee,1.3);else if(dt.kind==="cloud"){let Xn=X("puff",()=>new ds(.7,1));Ie(Xn,Yt,0,1.4,.8,1);let Zs=Ie(Xn,Yt,.15,1,.7,1);Zs.position.x=.9;let _c=Ie(Xn,Yt,.1,1.1,.75,1);_c.position.x=-.9}else(dt.kind==="planet"||dt.kind==="moon")&&Ie(X(dt.kind,()=>new Un(dt.kind==="planet"?3:1.5,32,20)),dt.kind==="moon"?ee:Yt,0);hn.scale.setScalar(Se);let fi=dt.kind==="planet"||dt.kind==="moon"?10+Math.random()*10:dt.kind==="cloud"?6+Math.random()*5:0,Wn=dt.float&&fi===0?.8+Math.random()*2.5:0;hn.position.set(Math.sin(Ht)*de,fi+Wn,-Math.cos(Ht)*de),hn.rotation.y=Math.random()*Math.PI*2,hn.userData={bob:dt.float||dt.kind==="cloud"||dt.kind==="lantern"?Math.random()*6:-1,y:hn.position.y},Z.add(hn)}}T||Z.scale.setScalar(.001),b.add(Z);let ut=h.particles.kind,wt=null;if(ut!=="none"){let dt=Math.round(ut==="stars"?500+700*h.particles.amount:150+900*h.particles.amount),Yt=new Float32Array(dt*3),ee=new Float32Array(dt);for(let Pe=0;Pe<dt;Pe++){if(ut==="stars"){let tn=Math.random()*Math.PI*2,Ht=Math.random()*.9+.08,de=33;Yt.set([Math.cos(tn)*Math.sqrt(1-Ht*Ht)*de,Ht*de,Math.sin(tn)*Math.sqrt(1-Ht*Ht)*de],Pe*3)}else{let tn=Math.random()*Math.PI*2,Ht=1.2+Math.sqrt(Math.random())*13;Yt.set([Math.cos(tn)*Ht,Math.random()*9,Math.sin(tn)*Ht],Pe*3)}ee[Pe]=Math.random()*100}let ue={stars:.09,snow:.05,rain:.03,fireflies:.07,embers:.05,bubbles:.08,petals:.06,dust:.03}[ut];wt=new Ns(v(new Le().setAttribute("position",new ne(Yt,3))),v(new ls({color:_(h.particles.color),size:ue,transparent:!0,opacity:ut==="dust"?.5:.9,depthWrite:!1,blending:ut==="fireflies"||ut==="embers"||ut==="stars"?en:vs}))),wt.userData.seed=ee,b.add(wt)}c.add(b),Object.assign(Bn,{group:b,sky:g,parts:Z,dots:wt,kind:ut,t0:performance.now(),spec:h}),Ae(h.title,5e3)}function Bf(h,v){if(!Bn.group)return;let _=(v-Bn.t0)/1e3;if(!T){Bn.sky.material.uniforms.fade.value=Math.min(1,_/1.2);let G=Math.max(0,Math.min(1,(_-.5)/1.4));Bn.parts.scale.setScalar(Math.max(.001,1-(1-G)**3));for(let X of Bn.parts.children)X.userData.bob>=0&&(X.position.y=X.userData.y+Math.sin(v/1600+X.userData.bob)*.15)}let b=Bn.dots;if(!b||T||Bn.kind==="stars")return;let g=b.geometry.attributes.position,E=b.userData.seed,W=Bn.kind,O=v/1e3,Z={snow:-.5,rain:-7,fireflies:0,embers:.7,bubbles:.45,petals:-.35,dust:.03}[W]??0;for(let G=0;G<g.count;G++){let X=g.getY(G)+Z*h*(.7+E[G]%1*.6);if(X<0?X+=9:X>9&&(X-=9),g.setY(G,X),W!=="rain"){let nt=E[G];g.setX(G,g.getX(G)+Math.sin(O*.6+nt)*h*(W==="fireflies"?.35:.12)),g.setZ(G,g.getZ(G)+Math.cos(O*.5+nt*1.3)*h*(W==="fireflies"?.35:.12))}}g.needsUpdate=!0,W==="fireflies"&&(b.material.opacity=.6+.35*Math.sin(O*2.1))}let Xe={card:Ke(.2,.09),until:0,total:0,words:"",shown:"",doneAt:0};Xe.card.mesh.visible=!1,Xe.card.mesh.position.set(.36,.1,.01),y.add(Xe.card.mesh),u(Xe.card.tex);function pc(h){let{ctx:v,w:_,h:b}=Xe.card,g=h<=0;On(v,_,b,40,g?{hot:!0}:{});let E=Math.max(0,Math.ceil(h/1e3)),W=Math.floor(E/3600),O=Math.floor(E%3600/60),Z=E%60,G=g?"Time's up":(W?W+":"+String(O).padStart(2,"0"):String(O))+":"+String(Z).padStart(2,"0");xe(v,"Timer \xB7 "+Xe.words,34,56,26,nn,600,"left",He,"0.02em"),xe(v,G,34,b-40,g?56:72,g?Rn:ze,600,"left",He);let X=Xe.total?Math.max(0,Math.min(1,h/Xe.total)):0;v.fillStyle="rgba(255,255,255,0.1)",v.fillRect(34,b-22,_-68,4),v.fillStyle=Rn,v.fillRect(34,b-22,(_-68)*X,4),Ai(v,"close",_-52,52,40,nn,7),Xe.card.update()}function zf(h,v){Object.assign(Xe,{until:performance.now()+h,total:h,words:v||"",shown:"",doneAt:0}),Xe.card.mesh.visible=!0,pc(h)}function mc(){let h=Xe.until>0;return Xe.until=0,Xe.doneAt=0,Xe.card.mesh.visible=!1,h}St(Xe.card.mesh,{tap:()=>mc(),drag:()=>y,dropped:()=>{y.userData.placed=!0}});function kf(h){if(!Xe.until)return;let v=Xe.until-h;if(v>0){let _=String(Math.ceil(v/1e3));_!==Xe.shown&&(Xe.shown=_,pc(v));return}Xe.doneAt?h-Xe.doneAt>15e3&&mc():(Xe.doneAt=h,pc(0),Ae("Time's up: your "+Xe.words+" timer.",12e3),e.speak?.("Time's up! Your "+Xe.words+" timer is done."))}let qa=[["Breathe in\u2026",4e3],["Hold\u2026",4e3],["Breathe out\u2026",6e3]],jn={on:!1,t0:0,rounds:0,phase:-1,grow:0};function Vf(h=4){Object.assign(jn,{on:!0,t0:performance.now(),rounds:h,phase:-1})}function Qh(h){jn.on&&(jn.on=!1,J.reply=h||"",st())}function Gf(h){if(!jn.on){jn.grow+=(0-jn.grow)*.08;return}let v=14e3,_=h-jn.t0,b=Math.floor(_/v);if(b>=jn.rounds){Qh("Nicely done. How do you feel?"),e.speak?.("Nicely done. How do you feel?");return}let g=_%v,E=0;for(;g>qa[E][1];)g-=qa[E][1],E++;let W=g/qa[E][1],O=G=>.5-Math.cos(Math.PI*G)/2;jn.grow=E===0?O(W):E===1?1:1-O(W);let Z=b*3+E;Z!==jn.phase&&(jn.phase=Z,J.reply=qa[E][0]+"  "+(b+1)+" of "+jn.rounds,J.stage="",st())}let tu=new N;function Hf(h,v){if(!at.open)return;if(yf(h,v),Jh.value=v/1e3,at.building){at.building.rotation.y+=h*1.4,at.building.rotation.x=.5;return}if(at.spec?.kind==="sketch"){Ef(h,v);return}if(at.spec?.kind==="globe"){Lf(h,v);return}if(at.spec?.kind==="sim"){Uf(h,v);return}let _=v-at.t0;for(let g of at.nodes){let E=T?1:Math.max(0,Math.min(1,(_-g.i*110)/520));g.shown=T?1:1-(1-E)**3,g.parent?(T||(g.angle+=h*g.speed),tu.set(Math.cos(g.angle)*g.orbitR,Math.sin(g.angle)*g.orbitR*.22,Math.sin(g.angle)*g.orbitR*.85),g.g.position.copy(g.parent.g.position).add(tu),g.ring.position.copy(g.parent.g.position)):T||g.g.position.set(g.base.x,g.base.y+Math.sin(v/1400+g.i)*.004,g.base.z);let W=at.focus?at.focus.has(g.i)?1.18:.32:g.hot?1.1:1;g.emph+=(W-g.emph)*Math.min(1,h*6);let O=Math.min(1,g.emph);g.g.scale.setScalar(Math.max(.001,g.shown*(g.emph>1?g.emph:1))),g.mat.uniforms?g.mat.uniforms.opacity.value=.82*O:g.mat.opacity=.82*O,g.shell&&(g.shell.material.opacity=.3*O*(g.hot?1.6:1),T||(g.shell.rotation.y+=h*.5,g.shell.rotation.x+=h*.17)),g.glow.material.opacity=.5*O*(g.hot?1.4:1),g.label.mesh.material.opacity=Math.max(.25,O)}let b=T?1:Math.max(0,Math.min(1,(_-at.nodes.length*110)/500));for(let g of at.links){if(!g.a)continue;let E=g.line.geometry.attributes.position;E.setXYZ(0,g.a.g.position.x,g.a.g.position.y,g.a.g.position.z),E.setXYZ(1,g.b.g.position.x,g.b.g.position.y,g.b.g.position.z),E.needsUpdate=!0;let W=at.focus?at.focus.has(g.a.i)&&at.focus.has(g.b.i)?.7:.12:.45;if(g.line.material.opacity=W*b,g.pulse){let O=T?.5:(v/1200+g.off)%1;g.pulse.position.lerpVectors(g.a.g.position,g.b.g.position,O);let Z=at.focus?W>.5?1:.1:.55;g.pulse.material.opacity=(T?.4:Math.sin(Math.PI*O))*Z*b,g.pulse.scale.setScalar(at.focus&&W>.5?.075:.05)}}}function Wf(){if(!_t.open||!_t.live)return null;let h=_t.screen,v=Math.min(1,1600/Math.max(h.w,h.h)),_=document.createElement("canvas");_.width=Math.max(1,Math.round(h.w*v)),_.height=Math.max(1,Math.round(h.h*v)),_.getContext("2d").drawImage(h.canvas,0,0,_.width,_.height);let b=_.toDataURL("image/jpeg",.85);return{b64:b.slice(b.indexOf(",")+1),url:b,w:_.width,h:_.height}}let qs=[];function eu(h){Kt(h.c.mesh),Kt(h.x.mesh),c.remove(h.group);for(let _ of[h.c,h.x])_.tex.dispose(),_.mesh.geometry.dispose(),_.mesh.material.dispose();let v=qs.indexOf(h);v>=0&&qs.splice(v,1)}function nu(h,v,_=!1,b=""){if(!_){let X=e.notes.add(h,b);v=X[X.length-1]?.at??Date.now();let nt=new Set(X.map(ut=>ut.at));for(let ut of[...qs])nt.has(ut.at)||eu(ut)}let g=new Ye,E=Ke(.3,.19),W=Ke(.04,.04);{let{ctx:X,w:nt,h:ut}=E;On(X,nt,ut,44),Ai(X,"pin",62,66,34,nn,7),X.font=`600 28px ${He}`,xe(X,b?Pn(X,"Pinned \xB7 "+b,nt-140):"Pinned",88,76,28,nn,600,"left",He,"0.02em");let wt=(ee,ue)=>(X.font=`500 ${ue}px ${an}`,X.measureText(ee).width),dt=a.fitLines(h,nt-96,6,34,22,wt),Yt=92;for(let ee of dt.lines)xe(X,ee,48,Yt+=dt.size*1.32,dt.size,ze,500);E.update(),uf(W,"close")}W.mesh.position.set(.135,.08,.004),g.add(E.mesh,W.mesh),c.add(g);let O=new Set(qs.map(X=>X.slot)),Z=0;for(;O.has(Z);)Z++;let G={group:g,c:E,x:W,at:v,text:h,slot:Z};qs.push(G),St(E.mesh,{tap:()=>e.resume?e.resume({text:h,ask:b}):e.speak(h),drag:()=>g}),St(W.mesh,{tap:()=>{eu(G),e.notes.remove(v)}}),Ya?iu(G):g.visible=!1}function iu(h){let v=h.slot,_=le-1.1-v%4*.42,b=.95,g=Math.floor(v/4);h.group.position.set(Jt.x-Math.sin(_)*b,Jt.y-.05+g*.24-v%2*.05,Jt.z-Math.cos(_)*b),K(h.group),h.group.visible=!0}let Ya=!1;function Xf(){let h=s?d:o.xr.getCamera();Jt.setFromMatrixPosition(h.matrixWorld),ye.setFromRotationMatrix(h.matrixWorld),oe.set(0,0,-1).applyQuaternion(ye),Math.hypot(oe.x,oe.z)>.15&&(le=Math.atan2(-oe.x,-oe.z))}function qf(){y.position.set(Jt.x-Math.sin(le)*.75,Jt.y-.1,Jt.z-Math.cos(le)*.75),K(y),y.visible=!0,Ya=!0,M=performance.now(),qs.forEach(iu)}function Yf(h){if(!M||p)return;let v=T?1:x((h-M)/1100),_=T?1:x((h-M-350)/600);F.scale.multiplyScalar(.3+.7*v),H.opacity+=(1-v)*.45;let b=T?1:Math.min(1,(h-M)/1500);lt.visible=b<1,b<1&&(et.opacity=.8*(1-b)*(1-b),lt.scale.setScalar(.9+x(b)*1.6));for(let g of f)g.opacity=_;v>=1&&_>=1&&b>=1&&(p=!0)}let Qn=null;function Zf(h){if(he.some(v=>v.press?.drag===y)){Qn=null;return}if(!y.userData.placed){let v=a.followTarget({x:Jt.x,y:Jt.y,z:Jt.z,yaw:le},y.position);v&&(Qn=v)}if(Qn){let v=1-Math.exp(-h*2.6);y.position.x+=(Qn.x-y.position.x)*v,y.position.y+=(Qn.y-y.position.y)*v,y.position.z+=(Qn.z-y.position.z)*v,Math.hypot(Qn.x-y.position.x,Qn.y-y.position.y,Qn.z-y.position.z)<.02&&(Qn=null)}K(y)}function Ys(){y.userData.placed=!1,Qn={x:Jt.x-Math.sin(le)*.75,y:Jt.y-.1,z:Jt.z-Math.cos(le)*.75}}let su={listening:6220500,thinking:10980346,speaking:16020150};function $f(h,v){let _=.06+Math.sin(v*1.4)*.02;J.state==="listening"?_=Math.max(.12,J.mic):J.state==="thinking"?_=.28:J.state==="speaking"&&(_=.34+.36*Math.abs(Math.sin(v*7.3)*Math.sin(v*3.1+1))),J.energy+=(_-J.energy)*Math.min(1,h*8),J.think+=((J.state==="thinking"?1:0)-J.think)*Math.min(1,h*3),I.uniforms.uTime.value=v,I.uniforms.uEnergy.value=J.energy,I.uniforms.uThink.value=J.think;let b=(1+Math.sin(v*1.7)*.012+J.energy*.1)*(J.hovered?1.06:1)*(1+jn.grow*.45);F.scale.setScalar(b),H.opacity=.1+J.energy*.36,H.color.setHex(su[J.state]||A),q.scale.setScalar(.4+J.energy*.12);let g=J.state==="listening"||J.state==="thinking";Q.opacity+=((g?.6:0)-Q.opacity)*Math.min(1,h*6),Q.color.setHex(su[J.state]||6220500),k.rotation.z-=h*(J.state==="thinking"?4:.8),k.scale.setScalar(1+(J.state==="listening"?J.mic*.25:0)),Jf(h,v)}let Za=(()=>{let h=u(new qi(.008,1)),v=u(new rn({color:6220500,transparent:!0,opacity:0,depthWrite:!1,blending:en})),_=[];for(let b of[-1,1])for(let g=0;g<4;g++){let E=new ce(h,v);E.position.set(b*(.142+g*.016),0,.01),E.userData={k:g,phase:Math.random()*6,h:.004},E.scale.y=.004,y.add(E),_.push(E)}return{bars:_,mat:v}})();function Jf(h,v){let _=J.state==="listening";if(Za.mat.opacity+=((_?.9:0)-Za.mat.opacity)*Math.min(1,h*8),!(Za.mat.opacity<.01))for(let b of Za.bars){let{k:g,phase:E}=b.userData,W=T?.6:.55+.45*Math.abs(Math.sin(v*(7+g*1.7)+E)),O=_?.006+J.mic*.07*(1-g*.18)*W:.004;b.userData.h+=(O-b.userData.h)*Math.min(1,h*14),b.scale.y=Math.max(.004,b.userData.h)}}function gc(){let h=J.state;h==="listening"?bt.set("done","Done"):h==="speaking"?bt.set("quiet","Quiet"):h==="thinking"?bt.set("think","Working"):bt.set("mic","Talk");let v=!!e.calling?.();v!==ft.shown&&(ft.shown=v,ct()),Ue.setOn(tt.open),Ce.setOn(_t.open);let _=Vs&&(h===""||h==="listening")&&!!e.ready?.();for(let b of wn)b.c.mesh.visible=_}let ru=performance.now(),au=0,ou=0,lu=!1,cu=0,hu=new Map;o.setAnimationLoop(()=>{let h=performance.now(),v=Math.min(.05,(h-ru)/1e3);ru=h,au+=v,ou++,s&&(d.rotation.set(Et,Xt,0,"YXZ"),d.updateMatrixWorld()),Xf(),!Ya&&ou>3&&qf(),Ya&&Zf(v),$f(v,au),Yf(h),Hf(v,h),Bf(v,h),kf(h),Gf(h);for(let _ of he){if(!Zt(_))continue;let b=_.hit,g=b?.object.userData.ui||null;g!==_.hover&&(_.hover?.hover?.(!1),g?.hover?.(!0),g&&ke(_,.12,10),_.hover=g),_.dot.visible=!!b,b&&(_.dot.position.copy(b.point).addScaledVector(_.dir,-.003),_.dot.lookAt(_.origin)),_.line&&(_.line.scale.z=b?b.distance:1.2);let E=_.press;if(E?.direct)L(_,B),!E.moved&&B.distanceTo(E.start)>.012&&(E.moved=!0),E.moved&&(E.drag.position.copy(B).add(E.offset),K(E.drag));else if(E?.drag){let O=_.origin.clone().addScaledVector(_.dir,E.dist);!E.moved&&O.distanceTo(E.start)>.03&&(E.moved=!0),E.moved&&(E.drag.position.copy(O).add(E.offset),K(E.drag))}let W=_.source?.gamepad;if(W){let O=W.axes[3]??0;Math.abs(O)>.45&&g?.scroll&&h-_.scrollAt>140&&(g.scroll(Math.sign(O)*(Math.abs(O)>.85?3:1)),_.scrollAt=h);let Z=hu.get(_)||[],G=!!W.buttons[4]?.pressed,X=!!W.buttons[5]?.pressed;G&&!Z[0]&&se(_),!G&&Z[0]&&V(_,h-(_.holdAt||h)),X&&!Z[1]&&Ys(),hu.set(_,[G,X])}}if(Tt)for(let _=0;_<2;_++){let b=o.xr.getHand(_);for(let g of Object.values(b.joints||{}))if(!g.userData.dot){let E=new ce(Tt.jointGeo,Tt.jointMat);g.add(E),g.userData.dot=E}}if(Nt.anim){let _=(h-Nt.t0)/(650*Math.max(1,Nt.marks.length));Nr(Math.min(1,_)),_>=1&&(Nt.anim=!1)}for(let _=ws.length-1;_>=0;_--){let b=ws[_],g=(h-b.t0)/350;b.m.scale.setScalar(1+g*1.6),b.m.material.opacity=Math.max(0,.9*(1-g)),g>=1&&(c.remove(b.m),b.m.material.dispose(),ws.splice(_,1))}h-cu>200&&(cu=h,gc()),o.render(c,d)});let As=null;if(s){yt=!0,As=document.createElement("div"),As.setAttribute("role","status"),Object.assign(As.style,{position:"fixed",top:"max(12px, env(safe-area-inset-top))",left:"50%",transform:"translateX(-50%)",zIndex:"2147483001",display:"flex",flexWrap:"wrap",justifyContent:"center",gap:"8px 10px",alignItems:"center",padding:"8px 8px 8px 16px",borderRadius:"24px",background:"rgba(18,20,27,.9)",color:ze,font:`500 14px ${an}`,border:"1px solid rgba(255,255,255,.14)",width:"max-content",maxWidth:"calc(100vw - 32px)",boxSizing:"border-box"});let h=document.createElement("span");h.textContent="3D preview \xB7 click the orb to talk, drag to look",Object.assign(h.style,{color:nn,textAlign:"center",flex:"1 1 auto"});let v=(_,b)=>{let g=document.createElement("button");return g.type="button",g.textContent=_,Object.assign(g.style,{font:`600 14px ${an}`,color:ze,background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.12)",borderRadius:"999px",padding:"8px 14px",cursor:"pointer",whiteSpace:"nowrap"}),g.onclick=b,g};As.append(h,v("Talk",()=>e.tapOrb()),v("Photos",qt),v("My PC",Dt),v("Pin",vt),v("Style",Gt),v("Leave",()=>Vr())),mt=document.createElement("span"),mt.setAttribute("aria-live","polite"),Object.assign(mt.style,{position:"absolute",width:"1px",height:"1px",overflow:"hidden",clip:"rect(0 0 0 0)",whiteSpace:"nowrap"}),As.append(mt),document.body.appendChild(As)}else Mt(t,"end",()=>Vr());function Vr(){if(!lu){if(lu=!0,Gs(),Ut(),uc(),dc(),fc(),clearTimeout(Wt),o.setAnimationLoop(null),!s)try{t.end()}catch{}for(let h of ot)try{h()}catch{}As?.remove(),l.remove(),c.traverse(h=>{h.geometry?.dispose?.();let v=h.material;if(v)for(let _ of Array.isArray(v)?v:[v])_.map?.dispose?.(),_.dispose?.()});for(let h of m)try{h.dispose?.()}catch{}o.dispose(),e.exited()}}return st(),Jn(),{orb(h){let v=h||"";v!==J.state&&(J.state=v,v==="listening"&&(J.hint="",J.stage=""),v===""&&(J.stage=""),st(),gc())},heard(h){let v=String(h||"");v!==J.you&&(J.you=v,v&&v!=="\u2026"&&(J.reply=""),J.hint="",st())},said(h){let v=String(h||"");!v||v===J.reply||(J.reply=v,J.stage="",st())},line(h,v,_){let b=String(v||"");b&&(h==="me"?(J.you=b,J.reply="",J.hint="",Vs&&Fa()):h==="izuki"&&(_?.thinking?J.stage=b:(J.reply=b,J.stage="")),st())},level(h){J.mic=Math.max(0,Math.min(1,Number(h)||0))},showLook:Ur,lookShown:()=>Nt.group.visible,pin:nu,comeHere:Ys,pcOpen:Ga,pcTarget:()=>_t.open?_t.target:null,pcClose:Gs,pcShown:()=>_t.open,pcFrame:Wf,filesOpen:dn,filesClose:Ut,webSearch:pf,webClose:uc,webShown:()=>xt.open,holoBuilding:Mf,holoShow:wf,holoFocus:Ff,holoClose:dc,holoShown:()=>at.open,holoPhoto:Cf,globeShow:Pf,globeMark:If,simShow:Nf,simShown:()=>at.open&&at.spec?.kind==="sim",simProbe:()=>je.st?{...je.st,type:je.spec?.type}:null,dreamShow:Of,dreamClose:fc,dreamShown:()=>!!Bn.group,timerStart:zf,timerStop:mc,breathe:Vf,breatheStop:()=>Qh(""),nextTheme:U,notice:Ae,stop:Vr}}function Ox(i,t){let e={uLow:{value:new jt},uMid:{value:new jt},uTop:{value:new jt},uBand:{value:new jt},uBandAmt:{value:0}},n=new ce(new Un(40,48,24),new _n({side:Sn,depthWrite:!1,uniforms:e,vertexShader:"varying vec3 vW; void main(){ vW = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`varying vec3 vW;
      uniform vec3 uLow; uniform vec3 uMid; uniform vec3 uTop; uniform vec3 uBand; uniform float uBandAmt;
      void main(){
        float h = vW.y;
        vec3 c = h < 0.0 ? mix(uMid, uLow, clamp(-h * 2.5, 0.0, 1.0)) : mix(uMid, uTop, clamp(h * 1.6, 0.0, 1.0));
        // The horizon glow: brightest at eye level, fading up and down.
        c += uBand * exp(-abs(h) * 7.0) * uBandAmt;
        gl_FragColor = vec4(c, 1.0);
      }`}));n.renderOrder=-10,i.add(n);let s=320,r=new Float32Array(s*3);for(let M=0;M<s;M++){let T=Math.random()*Math.PI*2,x=Math.random()*.85+.12,p=30;r[M*3]=Math.cos(T)*Math.sqrt(1-x*x)*p,r[M*3+1]=x*p,r[M*3+2]=Math.sin(T)*Math.sqrt(1-x*x)*p}let a=new Ns(new Le().setAttribute("position",new ne(r,3)),new ls({color:14674165,size:.05,transparent:!0,opacity:.5,depthWrite:!1}));i.add(a);let o=document.createElement("canvas");o.width=o.height=2048;let l=o.getContext("2d"),c=1024,d=1024/3.2,m=l.createRadialGradient(c,c,0,c,c,1024);m.addColorStop(0,"rgba(255,255,255,0.10)"),m.addColorStop(.5,"rgba(255,255,255,0.03)"),m.addColorStop(1,"rgba(255,255,255,0)"),l.fillStyle=m,l.fillRect(0,0,2048,2048);for(let M=.4;M<=3.2+1e-6;M+=.4){let T=M/3.2;l.beginPath(),l.arc(c,c,M*d,0,Math.PI*2),l.lineWidth=2.2-T,l.strokeStyle=`rgba(255,255,255,${(.34*(1-T)+.04).toFixed(3)})`,l.stroke()}let u=new Us(o);u.colorSpace=mn,u.anisotropy=$h;let f=new ce(new Fs(3.2,128),new rn({map:u,transparent:!0,depthWrite:!1}));return f.rotation.x=-Math.PI/2,f.position.y=t,i.add(f),{set(M){e.uLow.value.setRGB(...M.low),e.uMid.value.setRGB(...M.mid),e.uTop.value.setRGB(...M.top),e.uBand.value.setRGB(...M.band),e.uBandAmt.value=M.bandAmt,a.material.opacity=M.stars,a.visible=M.stars>.02,f.material.color.setRGB(...M.floor)}}}var Ua=[{name:"Nova",orb:[[.18,.83,.75],[.55,.36,.96],[.96,.45,.71]],halo:8246268,low:[.008,.01,.014],mid:[.03,.036,.05],top:[.012,.014,.022],band:[.08,.2,.2],bandAmt:.55,stars:.5,floor:[.6,1,.95]},{name:"Midnight",orb:[[.25,.5,1],[.4,.75,1],[.75,.85,1]],halo:9684477,low:[.006,.01,.02],mid:[.02,.04,.08],top:[.008,.014,.03],band:[.1,.16,.32],bandAmt:.6,stars:.6,floor:[.7,.82,1]},{name:"Aurora",orb:[[.25,.92,.6],[.2,.75,.9],[.55,.45,.95]],halo:7268279,low:[.006,.012,.012],mid:[.02,.045,.045],top:[.01,.018,.022],band:[.08,.3,.18],bandAmt:.7,stars:.5,floor:[.6,1,.8]},{name:"Dawn",orb:[[1,.7,.52],[.92,.55,.62],[1,.86,.66]],halo:16701354,low:[.012,.009,.01],mid:[.06,.04,.045],top:[.02,.016,.026],band:[.32,.16,.1],bandAmt:.55,stars:.2,floor:[1,.85,.75]},{name:"Pearl",light:!0,orb:[[.86,.88,.96],[.7,.76,.92],[.94,.88,.92]],halo:14870768,low:[.42,.44,.48],mid:[.66,.68,.73],top:[.8,.81,.85],band:[.06,.06,.07],bandAmt:.4,stars:0,floor:[.2,.22,.28]}];export{GM as start};
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2026 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
/* three.js
The MIT License

Copyright © 2010-2026 three.js authors

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in
all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
THE SOFTWARE.
*/
