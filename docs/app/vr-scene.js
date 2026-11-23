// Izuki in VR, the 3D room: built from vr-scene.src.js by tools/build-vr.cjs. Includes three.js (MIT, notice at the end).
var Ju=0,nh=1,Ku=2;var Sa=1,ju=2,Er=3,vs=0,bn=1,Zn=2,Ui=0,ys=1,en=2,ih=3,sh=4,Qu=5;var Os=100,td=101,ed=102,nd=103,id=104,sd=200,rd=201,ad=202,od=203,rh=204,ah=205,ld=206,cd=207,hd=208,ud=209,dd=210,fd=211,pd=212,md=213,gd=214,Ao=0,Eo=1,Co=2,pr=3,Ro=4,Po=5,Io=6,Lo=7,pl=0,_d=1,xd=2,bi=0,oh=1,lh=2,ch=3,hh=4,uh=5,dh=6,fh=7;var ph=300,Ms=301,Bs=302,ml=303,gl=304,ba=306,Do=1e3,Ii=1001,No=1002,Sn=1003,vd=1004;var wa=1005;var Cn=1006,_l=1007;var Ss=1008;var $n=1009,mh=1010,gh=1011,Cr=1012,xl=1013,wi=1014,Ti=1015,Ai=1016,vl=1017,yl=1018,Rr=1020,_h=35902,xh=35899,vh=1021,yh=1022,fi=1023,Li=1026,bs=1027,Mh=1028,Ml=1029,ws=1030,Sl=1031;var bl=1033,Ta=33776,Aa=33777,Ea=33778,Ca=33779,wl=35840,Tl=35841,Al=35842,El=35843,Cl=36196,Rl=37492,Pl=37496,Il=37488,Ll=37489,Ra=37490,Dl=37491,Nl=37808,Ul=37809,Fl=37810,Ol=37811,Bl=37812,zl=37813,kl=37814,Vl=37815,Gl=37816,Hl=37817,Wl=37818,Xl=37819,ql=37820,Yl=37821,Zl=36492,$l=36494,Jl=36495,Kl=36283,jl=36284,Pa=36285,Ql=36286;var jr=2300,Uo=2301,bo=2302,qc=2303,Yc=2400,Zc=2401,$c=2402;var yd=3200;var tc=0,Md=1,Ji="",gn="srgb",Qr="srgb-linear",ta="linear",De="srgb";var wo=7680;var Sd=519,bd=512,wd=513,Td=514,ec=515,Ad=516,Ed=517,nc=518,Cd=519,Sh=35044;var bh="300 es",vi=2e3,mr=2001;function op(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function lp(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function gr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Rd(){let i=gr("canvas");return i.style.display="block",i}var pu={},_r=null;function ea(...i){let t="THREE."+i.shift();_r?_r("log",t,...i):console.log(t,...i)}function Pd(i){let t=i[0];if(typeof t=="string"&&t.startsWith("TSL:")){let e=i[1];e&&e.isStackTrace?i[0]+=" "+e.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Qt(...i){i=Pd(i);let t="THREE."+i.shift();if(_r)_r("warn",t,...i);else{let e=i[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...i)}}function te(...i){i=Pd(i);let t="THREE."+i.shift();if(_r)_r("error",t,...i);else{let e=i[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...i)}}function Is(...i){let t=i.join(" ");t in pu||(pu[t]=!0,Qt(...i))}function Id(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}var Ld={[Ao]:Eo,[Co]:Io,[Ro]:Lo,[pr]:Po,[Eo]:Ao,[Io]:Co,[Lo]:Ro,[Po]:pr},Di=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){let n=this._listeners;return n===void 0?!1:n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){let n=this._listeners;if(n===void 0)return;let s=n[t];if(s!==void 0){let r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let n=e[t.type];if(n!==void 0){t.target=this;let s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,t);t.target=null}}},In=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var xc=Math.PI/180,Fo=180/Math.PI;function as(){let i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(In[i&255]+In[i>>8&255]+In[i>>16&255]+In[i>>24&255]+"-"+In[t&255]+In[t>>8&255]+"-"+In[t>>16&15|64]+In[t>>24&255]+"-"+In[e&63|128]+In[e>>8&255]+"-"+In[e>>16&255]+In[e>>24&255]+In[n&255]+In[n>>8&255]+In[n>>16&255]+In[n>>24&255]).toLowerCase()}function be(i,t,e){return Math.max(t,Math.min(e,i))}function cp(i,t){return(i%t+t)%t}function vc(i,t,e){return(1-e)*i+e*t}function Pi(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:case Uint8ClampedArray:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function Be(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var Rh=class Rh{constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=be(this.x,t.x,e.x),this.y=be(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=be(this.x,t,e),this.y=be(this.y,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(be(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(be(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,a=this.y-t.y;return this.x=r*n-a*s+t.x,this.y=r*s+a*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};Rh.prototype.isVector2=!0;var Bt=Rh,hi=class{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,a,o){let c=n[s+0],h=n[s+1],d=n[s+2],_=n[s+3],u=r[a+0],m=r[a+1],S=r[a+2],T=r[a+3];if(_!==T||c!==u||h!==m||d!==S){let v=c*u+h*m+d*S+_*T;v<0&&(u=-u,m=-m,S=-S,T=-T,v=-v);let g=1-o;if(v<.9995){let C=Math.acos(v),D=Math.sin(C);g=Math.sin(g*C)/D,o=Math.sin(o*C)/D,c=c*g+u*o,h=h*g+m*o,d=d*g+S*o,_=_*g+T*o}else{c=c*g+u*o,h=h*g+m*o,d=d*g+S*o,_=_*g+T*o;let C=1/Math.sqrt(c*c+h*h+d*d+_*_);c*=C,h*=C,d*=C,_*=C}}t[e]=c,t[e+1]=h,t[e+2]=d,t[e+3]=_}static multiplyQuaternionsFlat(t,e,n,s,r,a){let o=n[s],c=n[s+1],h=n[s+2],d=n[s+3],_=r[a],u=r[a+1],m=r[a+2],S=r[a+3];return t[e]=o*S+d*_+c*m-h*u,t[e+1]=c*S+d*u+h*_-o*m,t[e+2]=h*S+d*m+o*u-c*_,t[e+3]=d*S-o*_-c*u-h*m,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let n=t._x,s=t._y,r=t._z,a=t._order,o=Math.cos,c=Math.sin,h=o(n/2),d=o(s/2),_=o(r/2),u=c(n/2),m=c(s/2),S=c(r/2);switch(a){case"XYZ":this._x=u*d*_+h*m*S,this._y=h*m*_-u*d*S,this._z=h*d*S+u*m*_,this._w=h*d*_-u*m*S;break;case"YXZ":this._x=u*d*_+h*m*S,this._y=h*m*_-u*d*S,this._z=h*d*S-u*m*_,this._w=h*d*_+u*m*S;break;case"ZXY":this._x=u*d*_-h*m*S,this._y=h*m*_+u*d*S,this._z=h*d*S+u*m*_,this._w=h*d*_-u*m*S;break;case"ZYX":this._x=u*d*_-h*m*S,this._y=h*m*_+u*d*S,this._z=h*d*S-u*m*_,this._w=h*d*_+u*m*S;break;case"YZX":this._x=u*d*_+h*m*S,this._y=h*m*_+u*d*S,this._z=h*d*S-u*m*_,this._w=h*d*_-u*m*S;break;case"XZY":this._x=u*d*_-h*m*S,this._y=h*m*_-u*d*S,this._z=h*d*S+u*m*_,this._w=h*d*_+u*m*S;break;default:Qt("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,n=e[0],s=e[4],r=e[8],a=e[1],o=e[5],c=e[9],h=e[2],d=e[6],_=e[10],u=n+o+_;if(u>0){let m=.5/Math.sqrt(u+1);this._w=.25/m,this._x=(d-c)*m,this._y=(r-h)*m,this._z=(a-s)*m}else if(n>o&&n>_){let m=2*Math.sqrt(1+n-o-_);this._w=(d-c)/m,this._x=.25*m,this._y=(s+a)/m,this._z=(r+h)/m}else if(o>_){let m=2*Math.sqrt(1+o-n-_);this._w=(r-h)/m,this._x=(s+a)/m,this._y=.25*m,this._z=(c+d)/m}else{let m=2*Math.sqrt(1+_-n-o);this._w=(a-s)/m,this._x=(r+h)/m,this._y=(c+d)/m,this._z=.25*m}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<1e-8?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(be(this.dot(t),-1,1)))}rotateTowards(t,e){let n=this.angleTo(t);if(n===0)return this;let s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let n=t._x,s=t._y,r=t._z,a=t._w,o=e._x,c=e._y,h=e._z,d=e._w;return this._x=n*d+a*o+s*h-r*c,this._y=s*d+a*c+r*o-n*h,this._z=r*d+a*h+n*c-s*o,this._w=a*d-n*o-s*c-r*h,this._onChangeCallback(),this}slerp(t,e){let n=t._x,s=t._y,r=t._z,a=t._w,o=this.dot(t);o<0&&(n=-n,s=-s,r=-r,a=-a,o=-o);let c=1-e;if(o<.9995){let h=Math.acos(o),d=Math.sin(h);c=Math.sin(c*h)/d,e=Math.sin(e*h)/d,this._x=this._x*c+n*e,this._y=this._y*c+s*e,this._z=this._z*c+r*e,this._w=this._w*c+a*e,this._onChangeCallback()}else this._x=this._x*c+n*e,this._y=this._y*c+s*e,this._z=this._z*c+r*e,this._w=this._w*c+a*e,this.normalize();return this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},Ph=class Ph{constructor(t=0,e=0,n=0){this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(mu.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(mu.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=t.elements,a=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(t){let e=this.x,n=this.y,s=this.z,r=t.x,a=t.y,o=t.z,c=t.w,h=2*(a*s-o*n),d=2*(o*e-r*s),_=2*(r*n-a*e);return this.x=e+c*h+a*_-o*d,this.y=n+c*d+o*h-r*_,this.z=s+c*_+r*d-a*h,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=be(this.x,t.x,e.x),this.y=be(this.y,t.y,e.y),this.z=be(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=be(this.x,t,e),this.y=be(this.y,t,e),this.z=be(this.z,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(be(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let n=t.x,s=t.y,r=t.z,a=e.x,o=e.y,c=e.z;return this.x=s*c-r*o,this.y=r*a-n*c,this.z=n*o-s*a,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return yc.copy(this).projectOnVector(t),this.sub(yc)}reflect(t){return this.sub(yc.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(be(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){let s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};Ph.prototype.isVector3=!0;var N=Ph,yc=new N,mu=new hi,Ih=class Ih{constructor(t,e,n,s,r,a,o,c,h){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,c,h)}set(t,e,n,s,r,a,o,c,h){let d=this.elements;return d[0]=t,d[1]=s,d[2]=o,d[3]=e,d[4]=r,d[5]=c,d[6]=n,d[7]=a,d[8]=h,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[3],c=n[6],h=n[1],d=n[4],_=n[7],u=n[2],m=n[5],S=n[8],T=s[0],v=s[3],g=s[6],C=s[1],D=s[4],E=s[7],P=s[2],R=s[5],U=s[8];return r[0]=a*T+o*C+c*P,r[3]=a*v+o*D+c*R,r[6]=a*g+o*E+c*U,r[1]=h*T+d*C+_*P,r[4]=h*v+d*D+_*R,r[7]=h*g+d*E+_*U,r[2]=u*T+m*C+S*P,r[5]=u*v+m*D+S*R,r[8]=u*g+m*E+S*U,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],c=t[6],h=t[7],d=t[8];return e*a*d-e*o*h-n*r*d+n*o*c+s*r*h-s*a*c}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],c=t[6],h=t[7],d=t[8],_=d*a-o*h,u=o*c-d*r,m=h*r-a*c,S=e*_+n*u+s*m;if(S===0)return this.set(0,0,0,0,0,0,0,0,0);let T=1/S;return t[0]=_*T,t[1]=(s*h-d*n)*T,t[2]=(o*n-s*a)*T,t[3]=u*T,t[4]=(d*e-s*c)*T,t[5]=(s*r-o*e)*T,t[6]=m*T,t[7]=(n*c-h*e)*T,t[8]=(a*e-n*r)*T,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,a,o){let c=Math.cos(r),h=Math.sin(r);return this.set(n*c,n*h,-n*(c*a+h*o)+a+t,-s*h,s*c,-s*(-h*a+c*o)+o+e,0,0,1),this}scale(t,e){return Is("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Mc.makeScale(t,e)),this}rotate(t){return Is("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Mc.makeRotation(-t)),this}translate(t,e){return Is("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Mc.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}};Ih.prototype.isMatrix3=!0;var ae=Ih,Mc=new ae,gu=new ae().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),_u=new ae().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function hp(){let i={enabled:!0,workingColorSpace:Qr,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===De&&(s.r=qi(s.r),s.g=qi(s.g),s.b=qi(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===De&&(s.r=fr(s.r),s.g=fr(s.g),s.b=fr(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Ji?ta:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Is("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Is("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[Qr]:{primaries:t,whitePoint:n,transfer:ta,toXYZ:gu,fromXYZ:_u,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:gn},outputColorSpaceConfig:{drawingBufferColorSpace:gn}},[gn]:{primaries:t,whitePoint:n,transfer:De,toXYZ:gu,fromXYZ:_u,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:gn}}}),i}var we=hp();function qi(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function fr(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var $s,Oo=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let n;if(t instanceof HTMLCanvasElement)n=t;else{$s===void 0&&($s=gr("canvas")),$s.width=t.width,$s.height=t.height;let s=$s.getContext("2d");t instanceof ImageData?s.putImageData(t,0,0):s.drawImage(t,0,0,t.width,t.height),n=$s}return n.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=gr("canvas");e.width=t.width,e.height=t.height;let n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);let s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=qi(r[a]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){let e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(qi(e[n]/255)*255):e[n]=qi(e[n]);return{data:e,width:t.width,height:t.height}}else return Qt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},up=0,xr=class{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:up++}),this.uuid=as(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Sc(s[a].image)):r.push(Sc(s[a]))}else r=Sc(s);n.url=r}return e||(t.images[this.uuid]=n),n}};function Sc(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Oo.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Qt("Texture: Unable to serialize Texture."),{})}var dp=0,bc=new N,Nn=class i extends Di{constructor(t=i.DEFAULT_IMAGE,e=i.DEFAULT_MAPPING,n=Ii,s=Ii,r=Cn,a=Ss,o=fi,c=$n,h=i.DEFAULT_ANISOTROPY,d=Ji){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:dp++}),this.uuid=as(),this.name="",this.source=new xr(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=h,this.format=o,this.internalFormat=null,this.type=c,this.offset=new Bt(0,0),this.repeat=new Bt(1,1),this.center=new Bt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ae,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=d,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(bc).x}get height(){return this.source.getSize(bc).y}get depth(){return this.source.getSize(bc).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let n=t[e];if(n===void 0){Qt(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){Qt(`Texture.setValues(): property '${e}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==ph)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Do:t.x=t.x-Math.floor(t.x);break;case Ii:t.x=t.x<0?0:1;break;case No:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Do:t.y=t.y-Math.floor(t.y);break;case Ii:t.y=t.y<0?0:1;break;case No:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};Nn.DEFAULT_IMAGE=null;Nn.DEFAULT_MAPPING=ph;Nn.DEFAULT_ANISOTROPY=1;var Lh=class Lh{constructor(t=0,e=0,n=0,s=1){this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=this.w,a=t.elements;return this.x=a[0]*e+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*e+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*e+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*e+a[7]*n+a[11]*s+a[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r,c=t.elements,h=c[0],d=c[4],_=c[8],u=c[1],m=c[5],S=c[9],T=c[2],v=c[6],g=c[10];if(Math.abs(d-u)<.01&&Math.abs(_-T)<.01&&Math.abs(S-v)<.01){if(Math.abs(d+u)<.1&&Math.abs(_+T)<.1&&Math.abs(S+v)<.1&&Math.abs(h+m+g-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let D=(h+1)/2,E=(m+1)/2,P=(g+1)/2,R=(d+u)/4,U=(_+T)/4,y=(S+v)/4;return D>E&&D>P?D<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(D),s=R/n,r=U/n):E>P?E<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(E),n=R/s,r=y/s):P<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(P),n=U/r,s=y/r),this.set(n,s,r,e),this}let C=Math.sqrt((v-S)*(v-S)+(_-T)*(_-T)+(u-d)*(u-d));return Math.abs(C)<.001&&(C=1),this.x=(v-S)/C,this.y=(_-T)/C,this.z=(u-d)/C,this.w=Math.acos((h+m+g-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=be(this.x,t.x,e.x),this.y=be(this.y,t.y,e.y),this.z=be(this.z,t.z,e.z),this.w=be(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=be(this.x,t,e),this.y=be(this.y,t,e),this.z=be(this.z,t,e),this.w=be(this.w,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(be(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Lh.prototype.isVector4=!0;var Je=Lh,Bo=class extends Di{constructor(t=1,e=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:Cn,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=n.depth,this.scissor=new Je(0,0,t,e),this.scissorTest=!1,this.viewport=new Je(0,0,t,e),this.textures=[];let s={width:t,height:e,depth:n.depth},r=new Nn(s),a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(t={}){let e={minFilter:Cn,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,n=t.textures.length;e<n;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let s=Object.assign({},t.textures[e].image);this.textures[e].source=new xr(s)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){let e=t.depthTexture.clone();e.renderTarget=null,this.depthTexture=e}else this.depthTexture=t.depthTexture;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Yn=class extends Bo{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}},na=class extends Nn{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=Sn,this.minFilter=Sn,this.wrapR=Ii,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var zo=class extends Nn{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=Sn,this.minFilter=Sn,this.wrapR=Ii,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}};var fl=class fl{constructor(t,e,n,s,r,a,o,c,h,d,_,u,m,S,T,v){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,c,h,d,_,u,m,S,T,v)}set(t,e,n,s,r,a,o,c,h,d,_,u,m,S,T,v){let g=this.elements;return g[0]=t,g[4]=e,g[8]=n,g[12]=s,g[1]=r,g[5]=a,g[9]=o,g[13]=c,g[2]=h,g[6]=d,g[10]=_,g[14]=u,g[3]=m,g[7]=S,g[11]=T,g[15]=v,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new fl().fromArray(this.elements)}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){let e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),n.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let e=this.elements,n=t.elements,s=1/Js.setFromMatrixColumn(t,0).length(),r=1/Js.setFromMatrixColumn(t,1).length(),a=1/Js.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*a,e[9]=n[9]*a,e[10]=n[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,n=t.x,s=t.y,r=t.z,a=Math.cos(n),o=Math.sin(n),c=Math.cos(s),h=Math.sin(s),d=Math.cos(r),_=Math.sin(r);if(t.order==="XYZ"){let u=a*d,m=a*_,S=o*d,T=o*_;e[0]=c*d,e[4]=-c*_,e[8]=h,e[1]=m+S*h,e[5]=u-T*h,e[9]=-o*c,e[2]=T-u*h,e[6]=S+m*h,e[10]=a*c}else if(t.order==="YXZ"){let u=c*d,m=c*_,S=h*d,T=h*_;e[0]=u+T*o,e[4]=S*o-m,e[8]=a*h,e[1]=a*_,e[5]=a*d,e[9]=-o,e[2]=m*o-S,e[6]=T+u*o,e[10]=a*c}else if(t.order==="ZXY"){let u=c*d,m=c*_,S=h*d,T=h*_;e[0]=u-T*o,e[4]=-a*_,e[8]=S+m*o,e[1]=m+S*o,e[5]=a*d,e[9]=T-u*o,e[2]=-a*h,e[6]=o,e[10]=a*c}else if(t.order==="ZYX"){let u=a*d,m=a*_,S=o*d,T=o*_;e[0]=c*d,e[4]=S*h-m,e[8]=u*h+T,e[1]=c*_,e[5]=T*h+u,e[9]=m*h-S,e[2]=-h,e[6]=o*c,e[10]=a*c}else if(t.order==="YZX"){let u=a*c,m=a*h,S=o*c,T=o*h;e[0]=c*d,e[4]=T-u*_,e[8]=S*_+m,e[1]=_,e[5]=a*d,e[9]=-o*d,e[2]=-h*d,e[6]=m*_+S,e[10]=u-T*_}else if(t.order==="XZY"){let u=a*c,m=a*h,S=o*c,T=o*h;e[0]=c*d,e[4]=-_,e[8]=h*d,e[1]=u*_+T,e[5]=a*d,e[9]=m*_-S,e[2]=S*_-m,e[6]=o*d,e[10]=T*_+u}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(fp,t,pp)}lookAt(t,e,n){let s=this.elements;return ei.subVectors(t,e),ei.lengthSq()===0&&(ei.z=1),ei.normalize(),es.crossVectors(n,ei),es.lengthSq()===0&&(Math.abs(n.z)===1?ei.x+=1e-4:ei.z+=1e-4,ei.normalize(),es.crossVectors(n,ei)),es.normalize(),Ja.crossVectors(ei,es),s[0]=es.x,s[4]=Ja.x,s[8]=ei.x,s[1]=es.y,s[5]=Ja.y,s[9]=ei.y,s[2]=es.z,s[6]=Ja.z,s[10]=ei.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[4],c=n[8],h=n[12],d=n[1],_=n[5],u=n[9],m=n[13],S=n[2],T=n[6],v=n[10],g=n[14],C=n[3],D=n[7],E=n[11],P=n[15],R=s[0],U=s[4],y=s[8],I=s[12],O=s[1],W=s[5],q=s[9],tt=s[13],k=s[2],it=s[6],ct=s[10],at=s[14],J=s[3],rt=s[7],mt=s[11],yt=s[15];return r[0]=a*R+o*O+c*k+h*J,r[4]=a*U+o*W+c*it+h*rt,r[8]=a*y+o*q+c*ct+h*mt,r[12]=a*I+o*tt+c*at+h*yt,r[1]=d*R+_*O+u*k+m*J,r[5]=d*U+_*W+u*it+m*rt,r[9]=d*y+_*q+u*ct+m*mt,r[13]=d*I+_*tt+u*at+m*yt,r[2]=S*R+T*O+v*k+g*J,r[6]=S*U+T*W+v*it+g*rt,r[10]=S*y+T*q+v*ct+g*mt,r[14]=S*I+T*tt+v*at+g*yt,r[3]=C*R+D*O+E*k+P*J,r[7]=C*U+D*W+E*it+P*rt,r[11]=C*y+D*q+E*ct+P*mt,r[15]=C*I+D*tt+E*at+P*yt,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],a=t[1],o=t[5],c=t[9],h=t[13],d=t[2],_=t[6],u=t[10],m=t[14],S=t[3],T=t[7],v=t[11],g=t[15],C=c*m-h*u,D=o*m-h*_,E=o*u-c*_,P=a*m-h*d,R=a*u-c*d,U=a*_-o*d;return e*(T*C-v*D+g*E)-n*(S*C-v*P+g*R)+s*(S*D-T*P+g*U)-r*(S*E-T*R+v*U)}determinantAffine(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[1],a=t[5],o=t[9],c=t[2],h=t[6],d=t[10];return e*(a*d-o*h)-n*(r*d-o*c)+s*(r*h-a*c)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){let s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],c=t[6],h=t[7],d=t[8],_=t[9],u=t[10],m=t[11],S=t[12],T=t[13],v=t[14],g=t[15],C=e*o-n*a,D=e*c-s*a,E=e*h-r*a,P=n*c-s*o,R=n*h-r*o,U=s*h-r*c,y=d*T-_*S,I=d*v-u*S,O=d*g-m*S,W=_*v-u*T,q=_*g-m*T,tt=u*g-m*v,k=C*tt-D*q+E*W+P*O-R*I+U*y;if(k===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let it=1/k;return t[0]=(o*tt-c*q+h*W)*it,t[1]=(s*q-n*tt-r*W)*it,t[2]=(T*U-v*R+g*P)*it,t[3]=(u*R-_*U-m*P)*it,t[4]=(c*O-a*tt-h*I)*it,t[5]=(e*tt-s*O+r*I)*it,t[6]=(v*E-S*U-g*D)*it,t[7]=(d*U-u*E+m*D)*it,t[8]=(a*q-o*O+h*y)*it,t[9]=(n*O-e*q-r*y)*it,t[10]=(S*R-T*E+g*C)*it,t[11]=(_*E-d*R-m*C)*it,t[12]=(o*I-a*W-c*y)*it,t[13]=(e*W-n*I+s*y)*it,t[14]=(T*D-S*P-v*C)*it,t[15]=(d*P-_*D+u*C)*it,this}scale(t){let e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let n=Math.cos(e),s=Math.sin(e),r=1-n,a=t.x,o=t.y,c=t.z,h=r*a,d=r*o;return this.set(h*a+n,h*o-s*c,h*c+s*o,0,h*o+s*c,d*o+n,d*c-s*a,0,h*c-s*o,d*c+s*a,r*c*c+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,a){return this.set(1,n,r,0,t,1,a,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){let s=this.elements,r=e._x,a=e._y,o=e._z,c=e._w,h=r+r,d=a+a,_=o+o,u=r*h,m=r*d,S=r*_,T=a*d,v=a*_,g=o*_,C=c*h,D=c*d,E=c*_,P=n.x,R=n.y,U=n.z;return s[0]=(1-(T+g))*P,s[1]=(m+E)*P,s[2]=(S-D)*P,s[3]=0,s[4]=(m-E)*R,s[5]=(1-(u+g))*R,s[6]=(v+C)*R,s[7]=0,s[8]=(S+D)*U,s[9]=(v-C)*U,s[10]=(1-(u+T))*U,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){let s=this.elements;t.x=s[12],t.y=s[13],t.z=s[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),e.identity(),this;let a=Js.set(s[0],s[1],s[2]).length(),o=Js.set(s[4],s[5],s[6]).length(),c=Js.set(s[8],s[9],s[10]).length();r<0&&(a=-a),mi.copy(this);let h=1/a,d=1/o,_=1/c;return mi.elements[0]*=h,mi.elements[1]*=h,mi.elements[2]*=h,mi.elements[4]*=d,mi.elements[5]*=d,mi.elements[6]*=d,mi.elements[8]*=_,mi.elements[9]*=_,mi.elements[10]*=_,e.setFromRotationMatrix(mi),n.x=a,n.y=o,n.z=c,this}makePerspective(t,e,n,s,r,a,o=vi,c=!1){let h=this.elements,d=2*r/(e-t),_=2*r/(n-s),u=(e+t)/(e-t),m=(n+s)/(n-s),S,T;if(c)S=r/(a-r),T=a*r/(a-r);else if(o===vi)S=-(a+r)/(a-r),T=-2*a*r/(a-r);else if(o===mr)S=-a/(a-r),T=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return h[0]=d,h[4]=0,h[8]=u,h[12]=0,h[1]=0,h[5]=_,h[9]=m,h[13]=0,h[2]=0,h[6]=0,h[10]=S,h[14]=T,h[3]=0,h[7]=0,h[11]=-1,h[15]=0,this}makeOrthographic(t,e,n,s,r,a,o=vi,c=!1){let h=this.elements,d=2/(e-t),_=2/(n-s),u=-(e+t)/(e-t),m=-(n+s)/(n-s),S,T;if(c)S=1/(a-r),T=a/(a-r);else if(o===vi)S=-2/(a-r),T=-(a+r)/(a-r);else if(o===mr)S=-1/(a-r),T=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return h[0]=d,h[4]=0,h[8]=0,h[12]=u,h[1]=0,h[5]=_,h[9]=0,h[13]=m,h[2]=0,h[6]=0,h[10]=S,h[14]=T,h[3]=0,h[7]=0,h[11]=0,h[15]=1,this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}};fl.prototype.isMatrix4=!0;var ze=fl,Js=new N,mi=new ze,fp=new N(0,0,0),pp=new N(1,1,1),es=new N,Ja=new N,ei=new N,xu=new ze,vu=new hi,Yi=class i{constructor(t=0,e=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){let s=t.elements,r=s[0],a=s[4],o=s[8],c=s[1],h=s[5],d=s[9],_=s[2],u=s[6],m=s[10];switch(e){case"XYZ":this._y=Math.asin(be(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-d,m),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(u,h),this._z=0);break;case"YXZ":this._x=Math.asin(-be(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(o,m),this._z=Math.atan2(c,h)):(this._y=Math.atan2(-_,r),this._z=0);break;case"ZXY":this._x=Math.asin(be(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-_,m),this._z=Math.atan2(-a,h)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-be(_,-1,1)),Math.abs(_)<.9999999?(this._x=Math.atan2(u,m),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-a,h));break;case"YZX":this._z=Math.asin(be(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-d,h),this._y=Math.atan2(-_,r)):(this._x=0,this._y=Math.atan2(o,m));break;case"XZY":this._z=Math.asin(-be(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(u,h),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-d,m),this._y=0);break;default:Qt("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return xu.makeRotationFromQuaternion(t),this.setFromRotationMatrix(xu,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return vu.setFromEuler(this),this.setFromQuaternion(vu,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Yi.DEFAULT_ORDER="XYZ";var vr=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},mp=0,yu=new N,Ks=new hi,ki=new ze,Ka=new N,Gr=new N,gp=new N,_p=new hi,Mu=new N(1,0,0),Su=new N(0,1,0),bu=new N(0,0,1),wu={type:"added"},xp={type:"removed"},js={type:"childadded",child:null},wc={type:"childremoved",child:null},_n=class i extends Di{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:mp++}),this.uuid=as(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let t=new N,e=new Yi,n=new hi,s=new N(1,1,1);function r(){n.setFromEuler(e,!1)}function a(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new ze},normalMatrix:{value:new ae}}),this.matrix=new ze,this.matrixWorld=new ze,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new vr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Ks.setFromAxisAngle(t,e),this.quaternion.multiply(Ks),this}rotateOnWorldAxis(t,e){return Ks.setFromAxisAngle(t,e),this.quaternion.premultiply(Ks),this}rotateX(t){return this.rotateOnAxis(Mu,t)}rotateY(t){return this.rotateOnAxis(Su,t)}rotateZ(t){return this.rotateOnAxis(bu,t)}translateOnAxis(t,e){return yu.copy(t).applyQuaternion(this.quaternion),this.position.add(yu.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Mu,t)}translateY(t){return this.translateOnAxis(Su,t)}translateZ(t){return this.translateOnAxis(bu,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(ki.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?Ka.copy(t):Ka.set(t,e,n);let s=this.parent;this.updateWorldMatrix(!0,!1),Gr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?ki.lookAt(Gr,Ka,this.up):ki.lookAt(Ka,Gr,this.up),this.quaternion.setFromRotationMatrix(ki),s&&(ki.extractRotation(s.matrixWorld),Ks.setFromRotationMatrix(ki),this.quaternion.premultiply(Ks.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(te("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(wu),js.child=t,this.dispatchEvent(js),js.child=null):te("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(xp),wc.child=t,this.dispatchEvent(wc),wc.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),ki.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),ki.multiply(t.parent.matrixWorld)),t.applyMatrix4(ki),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(wu),js.child=t,this.dispatchEvent(js),js.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){let a=this.children[n].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Gr,t,gp),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Gr,_p,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(t){t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let e=t.x,n=t.y,s=t.z,r=this.matrix.elements;r[12]+=e-r[0]*e-r[4]*n-r[8]*s,r[13]+=n-r[1]*e-r[5]*n-r[9]*s,r[14]+=s-r[2]*e-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e,n=!1){let s=this.parent;if(t===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),e===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,n)}}toJSON(t){let e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,c){return o[c.uuid]===void 0&&(o[c.uuid]=c.toJSON(t)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let c=o.shapes;if(Array.isArray(c))for(let h=0,d=c.length;h<d;h++){let _=c[h];r(t.shapes,_)}else r(t.shapes,c)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let c=0,h=this.material.length;c<h;c++)o.push(r(t.materials,this.material[c]));s.material=o}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let c=this.animations[o];s.animations.push(r(t.animations,c))}}if(e){let o=a(t.geometries),c=a(t.materials),h=a(t.textures),d=a(t.images),_=a(t.shapes),u=a(t.skeletons),m=a(t.animations),S=a(t.nodes);o.length>0&&(n.geometries=o),c.length>0&&(n.materials=c),h.length>0&&(n.textures=h),d.length>0&&(n.images=d),_.length>0&&(n.shapes=_),u.length>0&&(n.skeletons=u),m.length>0&&(n.animations=m),S.length>0&&(n.nodes=S)}return n.object=s,n;function a(o){let c=[];for(let h in o){let d=o[h];delete d.metadata,c.push(d)}return c}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){let s=t.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};_n.DEFAULT_UP=new N(0,1,0);_n.DEFAULT_MATRIX_AUTO_UPDATE=!0;_n.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Ye=class extends _n{constructor(){super(),this.isGroup=!0,this.type="Group"}},vp={type:"move"},yr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Ye,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Ye,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new N,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new N),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Ye,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new N,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new N,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,a=null,o=this._targetRay,c=this._grip,h=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(h&&t.hand){a=!0;for(let T of t.hand.values()){let v=e.getJointPose(T,n),g=this._getHandJoint(h,T);v!==null&&(g.matrix.fromArray(v.transform.matrix),g.matrix.decompose(g.position,g.rotation,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=v.radius),g.visible=v!==null}let d=h.joints["index-finger-tip"],_=h.joints["thumb-tip"],u=d.position.distanceTo(_.position),m=.02,S=.005;h.inputState.pinching&&u>m+S?(h.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!h.inputState.pinching&&u<=m-S&&(h.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else c!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1,c.eventsEnabled&&c.dispatchEvent({type:"gripUpdated",data:t,target:this})));o!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(vp)))}return o!==null&&(o.visible=s!==null),c!==null&&(c.visible=r!==null),h!==null&&(h.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let n=new Ye;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}},Dd={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ns={h:0,s:0,l:0},ja={h:0,s:0,l:0};function Tc(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}var jt=class{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){let s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=gn){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,we.colorSpaceToWorking(this,e),this}setRGB(t,e,n,s=we.workingColorSpace){return this.r=t,this.g=e,this.b=n,we.colorSpaceToWorking(this,s),this}setHSL(t,e,n,s=we.workingColorSpace){if(t=cp(t,1),e=be(e,0,1),n=be(n,0,1),e===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+e):n+e-n*e,a=2*n-r;this.r=Tc(a,r,t+1/3),this.g=Tc(a,r,t),this.b=Tc(a,r,t-1/3)}return we.colorSpaceToWorking(this,s),this}setStyle(t,e=gn){function n(r){r!==void 0&&parseFloat(r)<1&&Qt("Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:Qt("Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(r,16),e);Qt("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=gn){let n=Dd[t.toLowerCase()];return n!==void 0?this.setHex(n,e):Qt("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=qi(t.r),this.g=qi(t.g),this.b=qi(t.b),this}copyLinearToSRGB(t){return this.r=fr(t.r),this.g=fr(t.g),this.b=fr(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=gn){return we.workingToColorSpace(Ln.copy(this),t),Math.round(be(Ln.r*255,0,255))*65536+Math.round(be(Ln.g*255,0,255))*256+Math.round(be(Ln.b*255,0,255))}getHexString(t=gn){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=we.workingColorSpace){we.workingToColorSpace(Ln.copy(this),e);let n=Ln.r,s=Ln.g,r=Ln.b,a=Math.max(n,s,r),o=Math.min(n,s,r),c,h,d=(o+a)/2;if(o===a)c=0,h=0;else{let _=a-o;switch(h=d<=.5?_/(a+o):_/(2-a-o),a){case n:c=(s-r)/_+(s<r?6:0);break;case s:c=(r-n)/_+2;break;case r:c=(n-s)/_+4;break}c/=6}return t.h=c,t.s=h,t.l=d,t}getRGB(t,e=we.workingColorSpace){return we.workingToColorSpace(Ln.copy(this),e),t.r=Ln.r,t.g=Ln.g,t.b=Ln.b,t}getStyle(t=gn){we.workingToColorSpace(Ln.copy(this),t);let e=Ln.r,n=Ln.g,s=Ln.b;return t!==gn?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(ns),this.setHSL(ns.h+t,ns.s+e,ns.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(ns),t.getHSL(ja);let n=vc(ns.h,ja.h,e),s=vc(ns.s,ja.s,e),r=vc(ns.l,ja.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Ln=new jt;jt.NAMES=Dd;var ia=class extends _n{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Yi,this.environmentIntensity=1,this.environmentRotation=new Yi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),e.object.backgroundBlurriness=this.backgroundBlurriness,e.object.backgroundIntensity=this.backgroundIntensity,e.object.backgroundRotation=this.backgroundRotation.toArray(),e.object.environmentIntensity=this.environmentIntensity,e.object.environmentRotation=this.environmentRotation.toArray(),e}},gi=new N,Vi=new N,Ac=new N,Gi=new N,Qs=new N,tr=new N,Tu=new N,Ec=new N,Cc=new N,Rc=new N,Pc=new Je,Ic=new Je,Lc=new Je,Xi=class i{constructor(t=new N,e=new N,n=new N){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),gi.subVectors(t,e),s.cross(gi);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){gi.subVectors(s,e),Vi.subVectors(n,e),Ac.subVectors(t,e);let a=gi.dot(gi),o=gi.dot(Vi),c=gi.dot(Ac),h=Vi.dot(Vi),d=Vi.dot(Ac),_=a*h-o*o;if(_===0)return r.set(0,0,0),null;let u=1/_,m=(h*c-o*d)*u,S=(a*d-o*c)*u;return r.set(1-m-S,S,m)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,Gi)===null?!1:Gi.x>=0&&Gi.y>=0&&Gi.x+Gi.y<=1}static getInterpolation(t,e,n,s,r,a,o,c){return this.getBarycoord(t,e,n,s,Gi)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,Gi.x),c.addScaledVector(a,Gi.y),c.addScaledVector(o,Gi.z),c)}static getInterpolatedAttribute(t,e,n,s,r,a){return Pc.setScalar(0),Ic.setScalar(0),Lc.setScalar(0),Pc.fromBufferAttribute(t,e),Ic.fromBufferAttribute(t,n),Lc.fromBufferAttribute(t,s),a.setScalar(0),a.addScaledVector(Pc,r.x),a.addScaledVector(Ic,r.y),a.addScaledVector(Lc,r.z),a}static isFrontFacing(t,e,n,s){return gi.subVectors(n,e),Vi.subVectors(t,e),gi.cross(Vi).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return gi.subVectors(this.c,this.b),Vi.subVectors(this.a,this.b),gi.cross(Vi).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return i.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return i.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return i.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return i.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return i.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let n=this.a,s=this.b,r=this.c,a,o;Qs.subVectors(s,n),tr.subVectors(r,n),Ec.subVectors(t,n);let c=Qs.dot(Ec),h=tr.dot(Ec);if(c<=0&&h<=0)return e.copy(n);Cc.subVectors(t,s);let d=Qs.dot(Cc),_=tr.dot(Cc);if(d>=0&&_<=d)return e.copy(s);let u=c*_-d*h;if(u<=0&&c>=0&&d<=0)return a=c/(c-d),e.copy(n).addScaledVector(Qs,a);Rc.subVectors(t,r);let m=Qs.dot(Rc),S=tr.dot(Rc);if(S>=0&&m<=S)return e.copy(r);let T=m*h-c*S;if(T<=0&&h>=0&&S<=0)return o=h/(h-S),e.copy(n).addScaledVector(tr,o);let v=d*S-m*_;if(v<=0&&_-d>=0&&m-S>=0)return Tu.subVectors(r,s),o=(_-d)/(_-d+(m-S)),e.copy(s).addScaledVector(Tu,o);let g=1/(v+T+u);return a=T*g,o=u*g,e.copy(n).addScaledVector(Qs,a).addScaledVector(tr,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},os=class{constructor(t=new N(1/0,1/0,1/0),e=new N(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(_i.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(_i.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let n=_i.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let n=t.geometry;if(n!==void 0){let r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)t.isMesh===!0?t.getVertexPosition(a,_i):_i.fromBufferAttribute(r,a),_i.applyMatrix4(t.matrixWorld),this.expandByPoint(_i);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Qa.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Qa.copy(n.boundingBox)),Qa.applyMatrix4(t.matrixWorld),this.union(Qa)}let s=t.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,_i),_i.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Hr),to.subVectors(this.max,Hr),er.subVectors(t.a,Hr),nr.subVectors(t.b,Hr),ir.subVectors(t.c,Hr),is.subVectors(nr,er),ss.subVectors(ir,nr),Es.subVectors(er,ir);let e=[0,-is.z,is.y,0,-ss.z,ss.y,0,-Es.z,Es.y,is.z,0,-is.x,ss.z,0,-ss.x,Es.z,0,-Es.x,-is.y,is.x,0,-ss.y,ss.x,0,-Es.y,Es.x,0];return!Dc(e,er,nr,ir,to)||(e=[1,0,0,0,1,0,0,0,1],!Dc(e,er,nr,ir,to))?!1:(eo.crossVectors(is,ss),e=[eo.x,eo.y,eo.z],Dc(e,er,nr,ir,to))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,_i).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(_i).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Hi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Hi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Hi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Hi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Hi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Hi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Hi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Hi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Hi),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},Hi=[new N,new N,new N,new N,new N,new N,new N,new N],_i=new N,Qa=new os,er=new N,nr=new N,ir=new N,is=new N,ss=new N,Es=new N,Hr=new N,to=new N,eo=new N,Cs=new N;function Dc(i,t,e,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){Cs.fromArray(i,r);let o=s.x*Math.abs(Cs.x)+s.y*Math.abs(Cs.y)+s.z*Math.abs(Cs.z),c=t.dot(Cs),h=e.dot(Cs),d=n.dot(Cs);if(Math.max(-Math.max(c,h,d),Math.min(c,h,d))>o)return!1}return!0}var dn=new N,no=new Bt,yp=0,ii=class extends Di{constructor(t,e,n=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:yp++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=Sh,this.updateRanges=[],this.gpuType=Ti,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)no.fromBufferAttribute(this,e),no.applyMatrix3(t),this.setXY(e,no.x,no.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)dn.fromBufferAttribute(this,e),dn.applyMatrix3(t),this.setXYZ(e,dn.x,dn.y,dn.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)dn.fromBufferAttribute(this,e),dn.applyMatrix4(t),this.setXYZ(e,dn.x,dn.y,dn.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)dn.fromBufferAttribute(this,e),dn.applyNormalMatrix(t),this.setXYZ(e,dn.x,dn.y,dn.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)dn.fromBufferAttribute(this,e),dn.transformDirection(t),this.setXYZ(e,dn.x,dn.y,dn.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=Pi(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=Be(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=Pi(e,this.array)),e}setX(t,e){return this.normalized&&(e=Be(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=Pi(e,this.array)),e}setY(t,e){return this.normalized&&(e=Be(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=Pi(e,this.array)),e}setZ(t,e){return this.normalized&&(e=Be(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=Pi(e,this.array)),e}setW(t,e){return this.normalized&&(e=Be(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=Be(e,this.array),n=Be(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=Be(e,this.array),n=Be(n,this.array),s=Be(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=Be(e,this.array),n=Be(n,this.array),s=Be(s,this.array),r=Be(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}};var sa=class extends ii{constructor(t,e,n){super(new Uint16Array(t),e,n)}};var ra=class extends ii{constructor(t,e,n){super(new Uint32Array(t),e,n)}};var ne=class extends ii{constructor(t,e,n){super(new Float32Array(t),e,n)}},Mp=new os,Wr=new N,Nc=new N,ls=class{constructor(t=new N,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let n=this.center;e!==void 0?n.copy(e):Mp.setFromPoints(t).getCenter(n);let s=0;for(let r=0,a=t.length;r<a;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Wr.subVectors(t,this.center);let e=Wr.lengthSq();if(e>this.radius*this.radius){let n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(Wr,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Nc.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Wr.copy(t.center).add(Nc)),this.expandByPoint(Wr.copy(t.center).sub(Nc))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},Sp=0,ci=new ze,Uc=new _n,sr=new N,ni=new os,Xr=new os,Mn=new N,Le=class i extends Di{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Sp++}),this.uuid=as(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(op(t)?ra:sa)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new ae().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return ci.makeRotationFromQuaternion(t),this.applyMatrix4(ci),this}rotateX(t){return ci.makeRotationX(t),this.applyMatrix4(ci),this}rotateY(t){return ci.makeRotationY(t),this.applyMatrix4(ci),this}rotateZ(t){return ci.makeRotationZ(t),this.applyMatrix4(ci),this}translate(t,e,n){return ci.makeTranslation(t,e,n),this.applyMatrix4(ci),this}scale(t,e,n){return ci.makeScale(t,e,n),this.applyMatrix4(ci),this}lookAt(t){return Uc.lookAt(t),Uc.updateMatrix(),this.applyMatrix4(Uc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(sr).negate(),this.translate(sr.x,sr.y,sr.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let n=[];for(let s=0,r=t.length;s<r;s++){let a=t[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new ne(n,3))}else{let n=Math.min(t.length,e.count);for(let s=0;s<n;s++){let r=t[s];e.setXYZ(s,r.x,r.y,r.z||0)}t.length>e.count&&Qt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new os);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){te("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new N(-1/0,-1/0,-1/0),new N(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){let r=e[n];ni.setFromBufferAttribute(r),this.morphTargetsRelative?(Mn.addVectors(this.boundingBox.min,ni.min),this.boundingBox.expandByPoint(Mn),Mn.addVectors(this.boundingBox.max,ni.max),this.boundingBox.expandByPoint(Mn)):(this.boundingBox.expandByPoint(ni.min),this.boundingBox.expandByPoint(ni.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&te('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ls);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){te("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new N,1/0);return}if(t){let n=this.boundingSphere.center;if(ni.setFromBufferAttribute(t),e)for(let r=0,a=e.length;r<a;r++){let o=e[r];Xr.setFromBufferAttribute(o),this.morphTargetsRelative?(Mn.addVectors(ni.min,Xr.min),ni.expandByPoint(Mn),Mn.addVectors(ni.max,Xr.max),ni.expandByPoint(Mn)):(ni.expandByPoint(Xr.min),ni.expandByPoint(Xr.max))}ni.getCenter(n);let s=0;for(let r=0,a=t.count;r<a;r++)Mn.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(Mn));if(e)for(let r=0,a=e.length;r<a;r++){let o=e[r],c=this.morphTargetsRelative;for(let h=0,d=o.count;h<d;h++)Mn.fromBufferAttribute(o,h),c&&(sr.fromBufferAttribute(t,h),Mn.add(sr)),s=Math.max(s,n.distanceToSquared(Mn))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&te('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){te("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=e.position,s=e.normal,r=e.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new ii(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));let o=[],c=[];for(let y=0;y<n.count;y++)o[y]=new N,c[y]=new N;let h=new N,d=new N,_=new N,u=new Bt,m=new Bt,S=new Bt,T=new N,v=new N;function g(y,I,O){h.fromBufferAttribute(n,y),d.fromBufferAttribute(n,I),_.fromBufferAttribute(n,O),u.fromBufferAttribute(r,y),m.fromBufferAttribute(r,I),S.fromBufferAttribute(r,O),d.sub(h),_.sub(h),m.sub(u),S.sub(u);let W=1/(m.x*S.y-S.x*m.y);isFinite(W)&&(T.copy(d).multiplyScalar(S.y).addScaledVector(_,-m.y).multiplyScalar(W),v.copy(_).multiplyScalar(m.x).addScaledVector(d,-S.x).multiplyScalar(W),o[y].add(T),o[I].add(T),o[O].add(T),c[y].add(v),c[I].add(v),c[O].add(v))}let C=this.groups;C.length===0&&(C=[{start:0,count:t.count}]);for(let y=0,I=C.length;y<I;++y){let O=C[y],W=O.start,q=O.count;for(let tt=W,k=W+q;tt<k;tt+=3)g(t.getX(tt+0),t.getX(tt+1),t.getX(tt+2))}let D=new N,E=new N,P=new N,R=new N;function U(y){P.fromBufferAttribute(s,y),R.copy(P);let I=o[y];D.copy(I),D.sub(P.multiplyScalar(P.dot(I))).normalize(),E.crossVectors(R,I);let W=E.dot(c[y])<0?-1:1;a.setXYZW(y,D.x,D.y,D.z,W)}for(let y=0,I=C.length;y<I;++y){let O=C[y],W=O.start,q=O.count;for(let tt=W,k=W+q;tt<k;tt+=3)U(t.getX(tt+0)),U(t.getX(tt+1)),U(t.getX(tt+2))}this._transformed=!0}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==e.count)n=new ii(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let u=0,m=n.count;u<m;u++)n.setXYZ(u,0,0,0);let s=new N,r=new N,a=new N,o=new N,c=new N,h=new N,d=new N,_=new N;if(t)for(let u=0,m=t.count;u<m;u+=3){let S=t.getX(u+0),T=t.getX(u+1),v=t.getX(u+2);s.fromBufferAttribute(e,S),r.fromBufferAttribute(e,T),a.fromBufferAttribute(e,v),d.subVectors(a,r),_.subVectors(s,r),d.cross(_),o.fromBufferAttribute(n,S),c.fromBufferAttribute(n,T),h.fromBufferAttribute(n,v),o.add(d),c.add(d),h.add(d),n.setXYZ(S,o.x,o.y,o.z),n.setXYZ(T,c.x,c.y,c.z),n.setXYZ(v,h.x,h.y,h.z)}else for(let u=0,m=e.count;u<m;u+=3)s.fromBufferAttribute(e,u+0),r.fromBufferAttribute(e,u+1),a.fromBufferAttribute(e,u+2),d.subVectors(a,r),_.subVectors(s,r),d.cross(_),n.setXYZ(u+0,d.x,d.y,d.z),n.setXYZ(u+1,d.x,d.y,d.z),n.setXYZ(u+2,d.x,d.y,d.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)Mn.fromBufferAttribute(t,e),Mn.normalize(),t.setXYZ(e,Mn.x,Mn.y,Mn.z)}toNonIndexed(){function t(o,c){let h=o.array,d=o.itemSize,_=o.normalized,u=new h.constructor(c.length*d),m=0,S=0;for(let T=0,v=c.length;T<v;T++){o.isInterleavedBufferAttribute?m=c[T]*o.data.stride+o.offset:m=c[T]*d;for(let g=0;g<d;g++)u[S++]=h[m++]}return new ii(u,d,_)}if(this.index===null)return Qt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new i,n=this.index.array,s=this.attributes;for(let o in s){let c=s[o],h=t(c,n);e.setAttribute(o,h)}let r=this.morphAttributes;for(let o in r){let c=[],h=r[o];for(let d=0,_=h.length;d<_;d++){let u=h[d],m=t(u,n);c.push(m)}e.morphAttributes[o]=c}e.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,c=a.length;o<c;o++){let h=a[o];e.addGroup(h.start,h.count,h.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let c=this.parameters;for(let h in c)c[h]!==void 0&&(t[h]=c[h]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let n=this.attributes;for(let c in n){let h=n[c];t.data.attributes[c]=h.toJSON(t.data)}let s={},r=!1;for(let c in this.morphAttributes){let h=this.morphAttributes[c],d=[];for(let _=0,u=h.length;_<u;_++){let m=h[_];d.push(m.toJSON(t.data))}d.length>0&&(s[c]=d,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(t.data.boundingSphere=o.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let n=t.index;n!==null&&this.setIndex(n.clone());let s=t.attributes;for(let h in s){let d=s[h];this.setAttribute(h,d.clone(e))}let r=t.morphAttributes;for(let h in r){let d=[],_=r[h];for(let u=0,m=_.length;u<m;u++)d.push(_[u].clone(e));this.morphAttributes[h]=d}this.morphTargetsRelative=t.morphTargetsRelative;let a=t.groups;for(let h=0,d=a.length;h<d;h++){let _=a[h];this.addGroup(_.start,_.count,_.materialIndex)}let o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());let c=t.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},ko=class{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=Sh,this.updateRanges=[],this.version=0,this.uuid=as()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,n){t*=this.stride,n*=e.stride;for(let s=0,r=this.stride;s<r;s++)this.array[t+s]=e.array[n+s];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=as()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let e=new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(e,this.stride);return n.setUsage(this.usage),n}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=as()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer)));let e={uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride};return e.usage=this.usage,e}},zn=new N,aa=class i{constructor(t,e,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,n=this.data.count;e<n;e++)zn.fromBufferAttribute(this,e),zn.applyMatrix4(t),this.setXYZ(e,zn.x,zn.y,zn.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)zn.fromBufferAttribute(this,e),zn.applyNormalMatrix(t),this.setXYZ(e,zn.x,zn.y,zn.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)zn.fromBufferAttribute(this,e),zn.transformDirection(t),this.setXYZ(e,zn.x,zn.y,zn.z);return this}getComponent(t,e){let n=this.array[t*this.data.stride+this.offset+e];return this.normalized&&(n=Pi(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=Be(n,this.array)),this.data.array[t*this.data.stride+this.offset+e]=n,this}setX(t,e){return this.normalized&&(e=Be(e,this.array)),this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){return this.normalized&&(e=Be(e,this.array)),this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){return this.normalized&&(e=Be(e,this.array)),this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){return this.normalized&&(e=Be(e,this.array)),this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(e=Pi(e,this.array)),e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(e=Pi(e,this.array)),e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(e=Pi(e,this.array)),e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(e=Pi(e,this.array)),e}setXY(t,e,n){return t=t*this.data.stride+this.offset,this.normalized&&(e=Be(e,this.array),n=Be(n,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this}setXYZ(t,e,n,s){return t=t*this.data.stride+this.offset,this.normalized&&(e=Be(e,this.array),n=Be(n,this.array),s=Be(s,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t=t*this.data.stride+this.offset,this.normalized&&(e=Be(e,this.array),n=Be(n,this.array),s=Be(s,this.array),r=Be(r,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=s,this.data.array[t+3]=r,this}clone(t){if(t===void 0){ea("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return new ii(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new i(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){ea("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},Fc=new N,bp=new N,wp=new ae,xi=class{constructor(t=new N(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){let s=Fc.subVectors(n,e).cross(bp.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,n=!0){let s=t.delta(Fc),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let a=-(t.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:e.copy(t.start).addScaledVector(s,a)}intersectsLine(t){let e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let n=e||wp.getNormalMatrix(t),s=this.coplanarPoint(Fc).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}},Tp=0,yi=class extends Di{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Tp++}),this.uuid=as(),this.name="",this.type="Material",this.blending=ys,this.side=vs,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=rh,this.blendDst=ah,this.blendEquation=Os,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new jt(0,0,0),this.blendAlpha=0,this.depthFunc=pr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Sd,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=wo,this.stencilZFail=wo,this.stencilZPass=wo,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let n=t[e];if(n===void 0){Qt(`Material: parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){Qt(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let a=[];for(let o in r){let c=r[o];delete c.metadata,a.push(c)}return a}if(e){let r=s(t.textures),a=s(t.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}fromJSON(t,e){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new jt().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=t.iridescenceThicknessRange),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(n=>new xi().fromJSON(n))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=e[t.map]||null),t.matcap!==void 0&&(this.matcap=e[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=e[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=e[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=e[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let n=t.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new Bt().fromArray(n)}return t.displacementMap!==void 0&&(this.displacementMap=e[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=e[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=e[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=e[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=e[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=e[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=e[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=e[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=e[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=e[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=e[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=e[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Bt().fromArray(t.clearcoatNormalScale)),t.iridescenceMap!==void 0&&(this.iridescenceMap=e[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=e[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=e[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=e[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=e[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,n=null;if(e!==null){let s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}},ui=class extends yi{constructor(t){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new jt(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.rotation=t.rotation,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},rr,qr=new N,ar=new N,or=new N,lr=new Bt,Yr=new Bt,Nd=new ze,io=new N,Zr=new N,so=new N,Au=new Bt,Oc=new Bt,Eu=new Bt,Mi=class extends _n{constructor(t=new ui){if(super(),this.isSprite=!0,this.type="Sprite",rr===void 0){rr=new Le;let e=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new ko(e,5);rr.setIndex([0,1,2,0,2,3]),rr.setAttribute("position",new aa(n,3,0,!1)),rr.setAttribute("uv",new aa(n,2,3,!1))}this.geometry=rr,this.material=t,this.center=new Bt(.5,.5),this.count=1}intersectsFrustum(t){return t.intersectsSprite(this)}raycast(t,e){t.camera===null&&te('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),ar.setFromMatrixScale(this.matrixWorld),Nd.copy(t.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse,this.matrixWorld),or.setFromMatrixPosition(this.modelViewMatrix),t.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&ar.multiplyScalar(-or.z);let n=this.material.rotation,s,r;n!==0&&(r=Math.cos(n),s=Math.sin(n));let a=this.center;ro(io.set(-.5,-.5,0),or,a,ar,s,r),ro(Zr.set(.5,-.5,0),or,a,ar,s,r),ro(so.set(.5,.5,0),or,a,ar,s,r),Au.set(0,0),Oc.set(1,0),Eu.set(1,1);let o=t.ray.intersectTriangle(io,Zr,so,!1,qr);if(o===null&&(ro(Zr.set(-.5,.5,0),or,a,ar,s,r),Oc.set(0,1),o=t.ray.intersectTriangle(io,so,Zr,!1,qr),o===null))return;let c=t.ray.origin.distanceTo(qr);c<t.near||c>t.far||e.push({distance:c,point:qr.clone(),uv:Xi.getInterpolation(qr,io,Zr,so,Au,Oc,Eu,new Bt),face:null,object:this})}copy(t,e){return super.copy(t,e),t.center!==void 0&&this.center.copy(t.center),this.material=t.material,this}};function ro(i,t,e,n,s,r){lr.subVectors(i,e).addScalar(.5).multiply(n),s!==void 0?(Yr.x=r*lr.x-s*lr.y,Yr.y=s*lr.x+r*lr.y):Yr.copy(lr),i.copy(t),i.x+=Yr.x,i.y+=Yr.y,i.applyMatrix4(Nd)}var Wi=new N,Bc=new N,ao=new N,oo=new N,Ls=class{constructor(t=new N,e=new N(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Wi)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=Wi.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Wi.copy(this.origin).addScaledVector(this.direction,e),Wi.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){Bc.copy(t).add(e).multiplyScalar(.5),ao.copy(e).sub(t).normalize(),oo.copy(this.origin).sub(Bc);let r=t.distanceTo(e)*.5,a=-this.direction.dot(ao),o=oo.dot(this.direction),c=-oo.dot(ao),h=oo.lengthSq(),d=Math.abs(1-a*a),_,u,m,S;if(d>0)if(_=a*c-o,u=a*o-c,S=r*d,_>=0)if(u>=-S)if(u<=S){let T=1/d;_*=T,u*=T,m=_*(_+a*u+2*o)+u*(a*_+u+2*c)+h}else u=r,_=Math.max(0,-(a*u+o)),m=-_*_+u*(u+2*c)+h;else u=-r,_=Math.max(0,-(a*u+o)),m=-_*_+u*(u+2*c)+h;else u<=-S?(_=Math.max(0,-(-a*r+o)),u=_>0?-r:Math.min(Math.max(-r,-c),r),m=-_*_+u*(u+2*c)+h):u<=S?(_=0,u=Math.min(Math.max(-r,-c),r),m=u*(u+2*c)+h):(_=Math.max(0,-(a*r+o)),u=_>0?r:Math.min(Math.max(-r,-c),r),m=-_*_+u*(u+2*c)+h);else u=a>0?-r:r,_=Math.max(0,-(a*u+o)),m=-_*_+u*(u+2*c)+h;return n&&n.copy(this.origin).addScaledVector(this.direction,_),s&&s.copy(Bc).addScaledVector(ao,u),m}intersectSphere(t,e){if(t.radius<0)return null;Wi.subVectors(t.center,this.origin);let n=Wi.dot(this.direction),s=Wi.dot(Wi)-n*n,r=t.radius*t.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=n-a,c=n+a;return c<0?null:o<0?this.at(c,e):this.at(o,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){let n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,a,o,c,h=1/this.direction.x,d=1/this.direction.y,_=1/this.direction.z,u=this.origin;return h>=0?(n=(t.min.x-u.x)*h,s=(t.max.x-u.x)*h):(n=(t.max.x-u.x)*h,s=(t.min.x-u.x)*h),d>=0?(r=(t.min.y-u.y)*d,a=(t.max.y-u.y)*d):(r=(t.max.y-u.y)*d,a=(t.min.y-u.y)*d),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),_>=0?(o=(t.min.z-u.z)*_,c=(t.max.z-u.z)*_):(o=(t.max.z-u.z)*_,c=(t.min.z-u.z)*_),n>c||o>s)||((o>n||n!==n)&&(n=o),(c<s||s!==s)&&(s=c),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,Wi)!==null}intersectTriangle(t,e,n,s,r){let a=this.origin,o=this.direction,c=o.x,h=o.y,d=o.z,_=t.x-a.x,u=t.y-a.y,m=t.z-a.z,S=e.x-a.x,T=e.y-a.y,v=e.z-a.z,g=n.x-a.x,C=n.y-a.y,D=n.z-a.z,E=Math.abs(c),P=Math.abs(h),R=Math.abs(d),U,y,I,O,W,q,tt,k,it,ct,at,J;if(E>=P&&E>=R?(I=c,q=_,it=S,J=g,c>=0?(U=h,y=d,O=u,W=m,tt=T,k=v,ct=C,at=D):(U=d,y=h,O=m,W=u,tt=v,k=T,ct=D,at=C)):P>=R?(I=h,q=u,it=T,J=C,h>=0?(U=d,y=c,O=m,W=_,tt=v,k=S,ct=D,at=g):(U=c,y=d,O=_,W=m,tt=S,k=v,ct=g,at=D)):(I=d,q=m,it=v,J=D,d>=0?(U=c,y=h,O=_,W=u,tt=S,k=T,ct=g,at=C):(U=h,y=c,O=u,W=_,tt=T,k=S,ct=C,at=g)),I===0)return null;let rt=U/I,mt=y/I,yt=1/I,$t=O-rt*q,Wt=W-mt*q,Ae=tt-rt*it,_e=k-mt*it,fe=ct-rt*J,ht=at-mt*J,gt=fe*_e-ht*Ae,St=$t*ht-Wt*fe,Jt=Ae*Wt-_e*$t;if(s){if(gt<0||St<0||Jt<0)return null}else if((gt<0||St<0||Jt<0)&&(gt>0||St>0||Jt>0))return null;let Ot=gt+St+Jt;if(Ot===0)return null;let ie=yt*(gt*q+St*it+Jt*J);return(Ot>0?ie<0:ie>0)?null:this.at(ie/Ot,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},rn=class extends yi{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new jt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Yi,this.combine=pl,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},Cu=new ze,Rs=new Ls,lo=new ls,Ru=new N,co=new N,ho=new N,uo=new N,zc=new N,fo=new N,Pu=new N,po=new N,he=class extends _n{constructor(t=new Le,e=new rn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(t,e){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;e.fromBufferAttribute(s,t);let o=this.morphTargetInfluences;if(r&&o){fo.set(0,0,0);for(let c=0,h=r.length;c<h;c++){let d=o[c],_=r[c];d!==0&&(zc.fromBufferAttribute(_,t),a?fo.addScaledVector(zc,d):fo.addScaledVector(zc.sub(e),d))}e.add(fo)}return e}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),lo.copy(n.boundingSphere),lo.applyMatrix4(r),Rs.copy(t.ray).recast(t.near),!(lo.containsPoint(Rs.origin)===!1&&(Rs.intersectSphere(lo,Ru)===null||Rs.origin.distanceToSquared(Ru)>(t.far-t.near)**2))&&(Cu.copy(r).invert(),Rs.copy(t.ray).applyMatrix4(Cu),!(n.boundingBox!==null&&Rs.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,Rs)))}_computeIntersections(t,e,n){let s,r=this.geometry,a=this.material,o=r.index,c=r.attributes.position,h=r.attributes.uv,d=r.attributes.uv1,_=r.attributes.normal,u=r.groups,m=r.drawRange;if(o!==null)if(Array.isArray(a))for(let S=0,T=u.length;S<T;S++){let v=u[S],g=a[v.materialIndex],C=Math.max(v.start,m.start),D=Math.min(o.count,Math.min(v.start+v.count,m.start+m.count));for(let E=C,P=D;E<P;E+=3){let R=o.getX(E),U=o.getX(E+1),y=o.getX(E+2);s=mo(this,g,t,n,h,d,_,R,U,y),s&&(s.faceIndex=Math.floor(E/3),s.face.materialIndex=v.materialIndex,e.push(s))}}else{let S=Math.max(0,m.start),T=Math.min(o.count,m.start+m.count);for(let v=S,g=T;v<g;v+=3){let C=o.getX(v),D=o.getX(v+1),E=o.getX(v+2);s=mo(this,a,t,n,h,d,_,C,D,E),s&&(s.faceIndex=Math.floor(v/3),e.push(s))}}else if(c!==void 0)if(Array.isArray(a))for(let S=0,T=u.length;S<T;S++){let v=u[S],g=a[v.materialIndex],C=Math.max(v.start,m.start),D=Math.min(c.count,Math.min(v.start+v.count,m.start+m.count));for(let E=C,P=D;E<P;E+=3){let R=E,U=E+1,y=E+2;s=mo(this,g,t,n,h,d,_,R,U,y),s&&(s.faceIndex=Math.floor(E/3),s.face.materialIndex=v.materialIndex,e.push(s))}}else{let S=Math.max(0,m.start),T=Math.min(c.count,m.start+m.count);for(let v=S,g=T;v<g;v+=3){let C=v,D=v+1,E=v+2;s=mo(this,a,t,n,h,d,_,C,D,E),s&&(s.faceIndex=Math.floor(v/3),e.push(s))}}}};function Ap(i,t,e,n,s,r,a,o){let c;if(t.side===bn?c=n.intersectTriangle(a,r,s,!0,o):c=n.intersectTriangle(s,r,a,t.side===vs,o),c===null)return null;po.copy(o),po.applyMatrix4(i.matrixWorld);let h=e.ray.origin.distanceTo(po);return h<e.near||h>e.far?null:{distance:h,point:po.clone(),object:i}}function mo(i,t,e,n,s,r,a,o,c,h){i.getVertexPosition(o,co),i.getVertexPosition(c,ho),i.getVertexPosition(h,uo);let d=Ap(i,t,e,n,co,ho,uo,Pu);if(d){let _=new N;Xi.getBarycoord(Pu,co,ho,uo,_),s&&(d.uv=Xi.getInterpolatedAttribute(s,o,c,h,_,new Bt)),r&&(d.uv1=Xi.getInterpolatedAttribute(r,o,c,h,_,new Bt)),a&&(d.normal=Xi.getInterpolatedAttribute(a,o,c,h,_,new N),d.normal.dot(n.direction)>0&&d.normal.multiplyScalar(-1));let u={a:o,b:c,c:h,normal:new N,materialIndex:0};Xi.getNormal(co,ho,uo,u.normal),d.face=u,d.barycoord=_}return d}var Vo=class extends Nn{constructor(t=null,e=1,n=1,s,r,a,o,c,h=Sn,d=Sn,_,u){super(null,a,o,c,h,d,s,r,_,u),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Ps=new ls,Ep=new Bt(.5,.5),go=new N,Mr=class{constructor(t=new xi,e=new xi,n=new xi,s=new xi,r=new xi,a=new xi){this.planes=[t,e,n,s,r,a]}set(t,e,n,s,r,a){let o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(t){let e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=vi,n=!1){let s=this.planes,r=t.elements,a=r[0],o=r[1],c=r[2],h=r[3],d=r[4],_=r[5],u=r[6],m=r[7],S=r[8],T=r[9],v=r[10],g=r[11],C=r[12],D=r[13],E=r[14],P=r[15];if(s[0].setComponents(h-a,m-d,g-S,P-C).normalize(),s[1].setComponents(h+a,m+d,g+S,P+C).normalize(),s[2].setComponents(h+o,m+_,g+T,P+D).normalize(),s[3].setComponents(h-o,m-_,g-T,P-D).normalize(),n)s[4].setComponents(c,u,v,E).normalize(),s[5].setComponents(h-c,m-u,g-v,P-E).normalize();else if(s[4].setComponents(h-c,m-u,g-v,P-E).normalize(),e===vi)s[5].setComponents(h+c,m+u,g+v,P+E).normalize();else if(e===mr)s[5].setComponents(c,u,v,E).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),Ps.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),Ps.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Ps)}intersectsSprite(t){Ps.center.set(0,0,0);let e=Ep.distanceTo(t.center);return Ps.radius=.7071067811865476+e,Ps.applyMatrix4(t.matrixWorld),this.intersectsSphere(Ps)}intersectsSphere(t){let e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){let e=this.planes;for(let n=0;n<6;n++){let s=e[n];if(go.x=s.normal.x>0?t.max.x:t.min.x,go.y=s.normal.y>0?t.max.y:t.min.y,go.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(go)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var si=class extends yi{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new jt(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}},Go=new N,Ho=new N,Iu=new ze,$r=new Ls,_o=new ls,kc=new N,Lu=new N,Ni=class extends _n{constructor(t=new Le,e=new si){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,n=[0];for(let s=1,r=e.count;s<r;s++)Go.fromBufferAttribute(e,s-1),Ho.fromBufferAttribute(e,s),n[s]=n[s-1],n[s]+=Go.distanceTo(Ho);t.setAttribute("lineDistance",new ne(n,1))}else Qt("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let n=this.geometry,s=this.matrixWorld,r=t.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),_o.copy(n.boundingSphere),_o.applyMatrix4(s),_o.radius+=r,t.ray.intersectsSphere(_o)===!1)return;Iu.copy(s).invert(),$r.copy(t.ray).applyMatrix4(Iu);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,h=this.isLineSegments?2:1,d=n.index,u=n.attributes.position;if(d!==null){let m=Math.max(0,a.start),S=Math.min(d.count,a.start+a.count);for(let T=m,v=S-1;T<v;T+=h){let g=d.getX(T),C=d.getX(T+1),D=xo(this,t,$r,c,g,C,T);D&&e.push(D)}if(this.isLineLoop){let T=d.getX(S-1),v=d.getX(m),g=xo(this,t,$r,c,T,v,S-1);g&&e.push(g)}}else{let m=Math.max(0,a.start),S=Math.min(u.count,a.start+a.count);for(let T=m,v=S-1;T<v;T+=h){let g=xo(this,t,$r,c,T,T+1,T);g&&e.push(g)}if(this.isLineLoop){let T=xo(this,t,$r,c,S-1,m,S-1);T&&e.push(T)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function xo(i,t,e,n,s,r,a){let o=i.geometry.attributes.position;if(Go.fromBufferAttribute(o,s),Ho.fromBufferAttribute(o,r),e.distanceSqToSegment(Go,Ho,kc,Lu)>n)return;kc.applyMatrix4(i.matrixWorld);let h=t.ray.origin.distanceTo(kc);if(!(h<t.near||h>t.far))return{distance:h,point:Lu.clone().applyMatrix4(i.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:i}}var Du=new N,Nu=new N,Ds=class extends Ni{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,n=[];for(let s=0,r=e.count;s<r;s+=2)Du.fromBufferAttribute(e,s),Nu.fromBufferAttribute(e,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+Du.distanceTo(Nu);t.setAttribute("lineDistance",new ne(n,1))}else Qt("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}};var cs=class extends yi{constructor(t){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new jt(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},Uu=new ze,Jc=new Ls,vo=new ls,yo=new N,Ns=class extends _n{constructor(t=new Le,e=new cs){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let n=this.geometry,s=this.matrixWorld,r=t.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),vo.copy(n.boundingSphere),vo.applyMatrix4(s),vo.radius+=r,t.ray.intersectsSphere(vo)===!1)return;Uu.copy(s).invert(),Jc.copy(t.ray).applyMatrix4(Uu);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,h=n.index,_=n.attributes.position;if(h!==null){let u=Math.max(0,a.start),m=Math.min(h.count,a.start+a.count);for(let S=u,T=m;S<T;S++){let v=h.getX(S);yo.fromBufferAttribute(_,v),Fu(yo,v,c,s,t,e,this)}}else{let u=Math.max(0,a.start),m=Math.min(_.count,a.start+a.count);for(let S=u,T=m;S<T;S++)yo.fromBufferAttribute(_,S),Fu(yo,S,c,s,t,e,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function Fu(i,t,e,n,s,r,a){let o=Jc.distanceSqToPoint(i);if(o<e){let c=new N;Jc.closestPointToPoint(i,c),c.applyMatrix4(n);let h=s.ray.origin.distanceTo(c);if(h<s.near||h>s.far)return;r.push({distance:h,distanceToRay:Math.sqrt(o),point:c,index:t,face:null,faceIndex:null,barycoord:null,object:a})}}var oa=class extends Nn{constructor(t=[],e=Ms,n,s,r,a,o,c,h,d){super(t,e,n,s,r,a,o,c,h,d),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},Us=class extends Nn{constructor(t,e,n,s,r,a,o,c,h){super(t,e,n,s,r,a,o,c,h),this.isCanvasTexture=!0,this.needsUpdate=!0}};var hs=class extends Nn{constructor(t,e,n=wi,s,r,a,o=Sn,c=Sn,h,d=Li,_=1){if(d!==Li&&d!==bs)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let u={width:t,height:e,depth:_};super(u,s,r,a,o,c,d,n,h),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new xr(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return e.compareFunction=this.compareFunction,e}},Wo=class extends hs{constructor(t,e=wi,n=Ms,s,r,a=Sn,o=Sn,c,h=Li){let d={width:t,height:t,depth:1},_=[d,d,d,d,d,d];super(t,t,e,n,s,r,a,o,c,h),this.image=_,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},la=class extends Nn{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},Si=class i extends Le{constructor(t=1,e=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let c=[],h=[],d=[],_=[],u=0,m=0;S("z","y","x",-1,-1,n,e,t,a,r,0),S("z","y","x",1,-1,n,e,-t,a,r,1),S("x","z","y",1,1,t,n,e,s,a,2),S("x","z","y",1,-1,t,n,-e,s,a,3),S("x","y","z",1,-1,t,e,n,s,r,4),S("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(c),this.setAttribute("position",new ne(h,3)),this.setAttribute("normal",new ne(d,3)),this.setAttribute("uv",new ne(_,2));function S(T,v,g,C,D,E,P,R,U,y,I){let O=E/U,W=P/y,q=E/2,tt=P/2,k=R/2,it=U+1,ct=y+1,at=0,J=0,rt=new N;for(let mt=0;mt<ct;mt++){let yt=mt*W-tt;for(let $t=0;$t<it;$t++){let Wt=$t*O-q;rt[T]=Wt*C,rt[v]=yt*D,rt[g]=k,h.push(rt.x,rt.y,rt.z),rt[T]=0,rt[v]=0,rt[g]=R>0?1:-1,d.push(rt.x,rt.y,rt.z),_.push($t/U),_.push(1-mt/y),at+=1}}for(let mt=0;mt<y;mt++)for(let yt=0;yt<U;yt++){let $t=u+yt+it*mt,Wt=u+yt+it*(mt+1),Ae=u+(yt+1)+it*(mt+1),_e=u+(yt+1)+it*mt;c.push($t,Wt,_e),c.push(Wt,Ae,_e),J+=6}o.addGroup(m,J,I),m+=J,u+=at}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};var Fs=class i extends Le{constructor(t=1,e=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:n,thetaLength:s},e=Math.max(3,e);let r=[],a=[],o=[],c=[],h=new N,d=new Bt;a.push(0,0,0),o.push(0,0,1),c.push(.5,.5);for(let _=0,u=3;_<=e;_++,u+=3){let m=n+_/e*s;h.x=t*Math.cos(m),h.y=t*Math.sin(m),a.push(h.x,h.y,h.z),o.push(0,0,1),d.x=(a[u]/t+1)/2,d.y=(a[u+1]/t+1)/2,c.push(d.x,d.y)}for(let _=1;_<=e;_++)r.push(_,_+1,0);this.setIndex(r),this.setAttribute("position",new ne(a,3)),this.setAttribute("normal",new ne(o,3)),this.setAttribute("uv",new ne(c,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.segments,t.thetaStart,t.thetaLength)}},di=class i extends Le{constructor(t=1,e=1,n=1,s=32,r=1,a=!1,o=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:c};let h=this;s=Math.floor(s),r=Math.floor(r);let d=[],_=[],u=[],m=[],S=0,T=[],v=n/2,g=0;C(),a===!1&&(t>0&&D(!0),e>0&&D(!1)),this.setIndex(d),this.setAttribute("position",new ne(_,3)),this.setAttribute("normal",new ne(u,3)),this.setAttribute("uv",new ne(m,2));function C(){let E=new N,P=new N,R=0,U=(e-t)/n;for(let y=0;y<=r;y++){let I=[],O=y/r,W=O*(e-t)+t;for(let q=0;q<=s;q++){let tt=q/s,k=tt*c+o,it=Math.sin(k),ct=Math.cos(k);P.x=W*it,P.y=-O*n+v,P.z=W*ct,_.push(P.x,P.y,P.z),E.set(it,U,ct).normalize(),u.push(E.x,E.y,E.z),m.push(tt,1-O),I.push(S++)}T.push(I)}for(let y=0;y<s;y++)for(let I=0;I<r;I++){let O=T[I][y],W=T[I+1][y],q=T[I+1][y+1],tt=T[I][y+1];(t>0||I!==0)&&(d.push(O,W,tt),R+=3),(e>0||I!==r-1)&&(d.push(W,q,tt),R+=3)}h.addGroup(g,R,0),g+=R}function D(E){let P=S,R=new Bt,U=new N,y=0,I=E===!0?t:e,O=E===!0?1:-1;for(let q=1;q<=s;q++)_.push(0,v*O,0),u.push(0,O,0),m.push(.5,.5),S++;let W=S;for(let q=0;q<=s;q++){let k=q/s*c+o,it=Math.cos(k),ct=Math.sin(k);U.x=I*ct,U.y=v*O,U.z=I*it,_.push(U.x,U.y,U.z),u.push(0,O,0),R.x=it*.5+.5,R.y=ct*.5*O+.5,m.push(R.x,R.y),S++}for(let q=0;q<s;q++){let tt=P+q,k=W+q;E===!0?d.push(k,k+1,tt):d.push(k+1,k,tt),y+=3}h.addGroup(g,y,E===!0?1:2),g+=y}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},us=class i extends di{constructor(t=1,e=1,n=32,s=1,r=!1,a=0,o=Math.PI*2){super(0,t,e,n,s,r,a,o),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(t){return new i(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},Sr=class i extends Le{constructor(t=[],e=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:n,detail:s};let r=[],a=[];o(s),h(n),d(),this.setAttribute("position",new ne(r,3)),this.setAttribute("normal",new ne(r.slice(),3)),this.setAttribute("uv",new ne(a,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function o(C){let D=new N,E=new N,P=new N;for(let R=0;R<e.length;R+=3)m(e[R+0],D),m(e[R+1],E),m(e[R+2],P),c(D,E,P,C)}function c(C,D,E,P){let R=P+1,U=[];for(let y=0;y<=R;y++){U[y]=[];let I=C.clone().lerp(E,y/R),O=D.clone().lerp(E,y/R),W=R-y;for(let q=0;q<=W;q++)q===0&&y===R?U[y][q]=I:U[y][q]=I.clone().lerp(O,q/W)}for(let y=0;y<R;y++)for(let I=0;I<2*(R-y)-1;I++){let O=Math.floor(I/2);I%2===0?(u(U[y][O+1]),u(U[y+1][O]),u(U[y][O])):(u(U[y][O+1]),u(U[y+1][O+1]),u(U[y+1][O]))}}function h(C){let D=new N;for(let E=0;E<r.length;E+=3)D.x=r[E+0],D.y=r[E+1],D.z=r[E+2],D.normalize().multiplyScalar(C),r[E+0]=D.x,r[E+1]=D.y,r[E+2]=D.z}function d(){let C=new N;for(let D=0;D<r.length;D+=3){C.x=r[D+0],C.y=r[D+1],C.z=r[D+2];let E=v(C)/2/Math.PI+.5,P=g(C)/Math.PI+.5;a.push(E,1-P)}S(),_()}function _(){for(let C=0;C<a.length;C+=6){let D=a[C+0],E=a[C+2],P=a[C+4],R=Math.max(D,E,P),U=Math.min(D,E,P);R>.9&&U<.1&&(D<.2&&(a[C+0]+=1),E<.2&&(a[C+2]+=1),P<.2&&(a[C+4]+=1))}}function u(C){r.push(C.x,C.y,C.z)}function m(C,D){let E=C*3;D.x=t[E+0],D.y=t[E+1],D.z=t[E+2]}function S(){let C=new N,D=new N,E=new N,P=new N,R=new Bt,U=new Bt,y=new Bt;for(let I=0,O=0;I<r.length;I+=9,O+=6){C.set(r[I+0],r[I+1],r[I+2]),D.set(r[I+3],r[I+4],r[I+5]),E.set(r[I+6],r[I+7],r[I+8]),R.set(a[O+0],a[O+1]),U.set(a[O+2],a[O+3]),y.set(a[O+4],a[O+5]),P.copy(C).add(D).add(E).divideScalar(3);let W=v(P);T(R,O+0,C,W),T(U,O+2,D,W),T(y,O+4,E,W)}}function T(C,D,E,P){P<0&&C.x===1&&(a[D]=C.x-1),E.x===0&&E.z===0&&(a[D]=P/2/Math.PI+.5)}function v(C){return Math.atan2(C.z,-C.x)}function g(C){return Math.atan2(-C.y,Math.sqrt(C.x*C.x+C.z*C.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.vertices,t.indices,t.radius,t.detail)}},ca=class i extends Sr{constructor(t=1,e=0){let n=(1+Math.sqrt(5))/2,s=1/n,r=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-s,-n,0,-s,n,0,s,-n,0,s,n,-s,-n,0,-s,n,0,s,-n,0,s,n,0,-n,0,-s,n,0,-s,-n,0,s,n,0,s],a=[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9];super(r,a,t,e),this.type="DodecahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new i(t.radius,t.detail)}};var ri=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Qt("Curve: .getPoint() not implemented.")}getPointAt(t,e){let n=this.getUtoTmapping(t);return this.getPoint(n,e)}getPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return e}getSpacedPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPointAt(n/t));return e}getLength(){let t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let e=[],n,s=this.getPoint(0),r=0;e.push(0);for(let a=1;a<=t;a++)n=this.getPoint(a/t),r+=n.distanceTo(s),e.push(r),s=n;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e=null){let n=this.getLengths(),s=0,r=n.length,a;e?a=e:a=t*n[r-1];let o=0,c=r-1,h;for(;o<=c;)if(s=Math.floor(o+(c-o)/2),h=n[s]-a,h<0)o=s+1;else if(h>0)c=s-1;else{c=s;break}if(s=c,n[s]===a)return s/(r-1);let d=n[s],u=n[s+1]-d,m=(a-d)/u;return(s+m)/(r-1)}getTangent(t,e){let s=t-1e-4,r=t+1e-4;s<0&&(s=0),r>1&&(r=1);let a=this.getPoint(s),o=this.getPoint(r),c=e||(a.isVector2?new Bt:new N);return c.copy(o).sub(a).normalize(),c}getTangentAt(t,e){let n=this.getUtoTmapping(t);return this.getTangent(n,e)}computeFrenetFrames(t,e=!1){let n=new N,s=[],r=[],a=[],o=new N,c=new ze;for(let m=0;m<=t;m++){let S=m/t;s[m]=this.getTangentAt(S,new N)}r[0]=new N,a[0]=new N;let h=Number.MAX_VALUE,d=Math.abs(s[0].x),_=Math.abs(s[0].y),u=Math.abs(s[0].z);d<=h&&(h=d,n.set(1,0,0)),_<=h&&(h=_,n.set(0,1,0)),u<=h&&n.set(0,0,1),o.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],o),a[0].crossVectors(s[0],r[0]);for(let m=1;m<=t;m++){if(r[m]=r[m-1].clone(),a[m]=a[m-1].clone(),o.crossVectors(s[m-1],s[m]),o.length()>Number.EPSILON){o.normalize();let S=Math.acos(be(s[m-1].dot(s[m]),-1,1));r[m].applyMatrix4(c.makeRotationAxis(o,S))}a[m].crossVectors(s[m],r[m])}if(e===!0){let m=Math.acos(be(r[0].dot(r[t]),-1,1));m/=t,s[0].dot(o.crossVectors(r[0],r[t]))>0&&(m=-m);for(let S=1;S<=t;S++)r[S].applyMatrix4(c.makeRotationAxis(s[S],m*S)),a[S].crossVectors(s[S],r[S])}return{tangents:s,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){let t={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}},ha=class extends ri{constructor(t=0,e=0,n=1,s=1,r=0,a=Math.PI*2,o=!1,c=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=c}getPoint(t,e=new Bt){let n=e,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(a?r=0:r=s),this.aClockwise===!0&&!a&&(r===s?r=-s:r=r-s);let o=this.aStartAngle+t*r,c=this.aX+this.xRadius*Math.cos(o),h=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let d=Math.cos(this.aRotation),_=Math.sin(this.aRotation),u=c-this.aX,m=h-this.aY;c=u*d-m*_+this.aX,h=u*_+m*d+this.aY}return n.set(c,h)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){let t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}},Xo=class extends ha{constructor(t,e,n,s,r,a){super(t,e,n,n,s,r,a),this.isArcCurve=!0,this.type="ArcCurve"}};function wh(){let i=0,t=0,e=0,n=0;function s(r,a,o,c){i=r,t=o,e=-3*r+3*a-2*o-c,n=2*r-2*a+o+c}return{initCatmullRom:function(r,a,o,c,h){s(a,o,h*(o-r),h*(c-a))},initNonuniformCatmullRom:function(r,a,o,c,h,d,_){let u=(a-r)/h-(o-r)/(h+d)+(o-a)/d,m=(o-a)/d-(c-a)/(d+_)+(c-o)/_;u*=d,m*=d,s(a,o,u,m)},calc:function(r){let a=r*r,o=a*r;return i+t*r+e*a+n*o}}}var Ou=new N,Bu=new N,Vc=new wh,Gc=new wh,Hc=new wh,ds=class extends ri{constructor(t=[],e=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=n,this.tension=s}getPoint(t,e=new N){let n=e,s=this.points,r=s.length,a=(r-(this.closed?0:1))*t,o=Math.floor(a),c=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:c===0&&o===r-1&&(o=r-2,c=1);let h,d;this.closed||o>0?h=s[(o-1)%r]:(Bu.subVectors(s[0],s[1]).add(s[0]),h=Bu);let _=s[o%r],u=s[(o+1)%r];if(this.closed||o+2<r?d=s[(o+2)%r]:(Ou.subVectors(s[r-1],s[r-2]).add(s[r-1]),d=Ou),this.curveType==="centripetal"||this.curveType==="chordal"){let m=this.curveType==="chordal"?.5:.25,S=Math.pow(h.distanceToSquared(_),m),T=Math.pow(_.distanceToSquared(u),m),v=Math.pow(u.distanceToSquared(d),m);T<1e-4&&(T=1),S<1e-4&&(S=T),v<1e-4&&(v=T),Vc.initNonuniformCatmullRom(h.x,_.x,u.x,d.x,S,T,v),Gc.initNonuniformCatmullRom(h.y,_.y,u.y,d.y,S,T,v),Hc.initNonuniformCatmullRom(h.z,_.z,u.z,d.z,S,T,v)}else this.curveType==="catmullrom"&&(Vc.initCatmullRom(h.x,_.x,u.x,d.x,this.tension),Gc.initCatmullRom(h.y,_.y,u.y,d.y,this.tension),Hc.initCatmullRom(h.z,_.z,u.z,d.z,this.tension));return n.set(Vc.calc(c),Gc.calc(c),Hc.calc(c)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(s.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let s=this.points[e];t.points.push(s.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(new N().fromArray(s))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}};function zu(i,t,e,n,s){let r=(n-t)*.5,a=(s-e)*.5,o=i*i,c=i*o;return(2*e-2*n+r+a)*c+(-3*e+3*n-2*r-a)*o+r*i+e}function Cp(i,t){let e=1-i;return e*e*t}function Rp(i,t){return 2*(1-i)*i*t}function Pp(i,t){return i*i*t}function Jr(i,t,e,n){return Cp(i,t)+Rp(i,e)+Pp(i,n)}function Ip(i,t){let e=1-i;return e*e*e*t}function Lp(i,t){let e=1-i;return 3*e*e*i*t}function Dp(i,t){return 3*(1-i)*i*i*t}function Np(i,t){return i*i*i*t}function Kr(i,t,e,n,s){return Ip(i,t)+Lp(i,e)+Dp(i,n)+Np(i,s)}var qo=class extends ri{constructor(t=new Bt,e=new Bt,n=new Bt,s=new Bt){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new Bt){let n=e,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(Kr(t,s.x,r.x,a.x,o.x),Kr(t,s.y,r.y,a.y,o.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},Yo=class extends ri{constructor(t=new N,e=new N,n=new N,s=new N){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new N){let n=e,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(Kr(t,s.x,r.x,a.x,o.x),Kr(t,s.y,r.y,a.y,o.y),Kr(t,s.z,r.z,a.z,o.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},Zo=class extends ri{constructor(t=new Bt,e=new Bt){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new Bt){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new Bt){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},br=class extends ri{constructor(t=new N,e=new N){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new N){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new N){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},$o=class extends ri{constructor(t=new Bt,e=new Bt,n=new Bt){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new Bt){let n=e,s=this.v0,r=this.v1,a=this.v2;return n.set(Jr(t,s.x,r.x,a.x),Jr(t,s.y,r.y,a.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},ua=class extends ri{constructor(t=new N,e=new N,n=new N){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new N){let n=e,s=this.v0,r=this.v1,a=this.v2;return n.set(Jr(t,s.x,r.x,a.x),Jr(t,s.y,r.y,a.y),Jr(t,s.z,r.z,a.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Jo=class extends ri{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new Bt){let n=e,s=this.points,r=(s.length-1)*t,a=Math.floor(r),o=r-a,c=s[a===0?a:a-1],h=s[a],d=s[a>s.length-2?s.length-1:a+1],_=s[a>s.length-3?s.length-1:a+2];return n.set(zu(o,c.x,h.x,d.x,_.x),zu(o,c.y,h.y,d.y,_.y)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let s=this.points[e];t.points.push(s.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(new Bt().fromArray(s))}return this}},Kc=Object.freeze({__proto__:null,ArcCurve:Xo,CatmullRomCurve3:ds,CubicBezierCurve:qo,CubicBezierCurve3:Yo,EllipseCurve:ha,LineCurve:Zo,LineCurve3:br,QuadraticBezierCurve:$o,QuadraticBezierCurve3:ua,SplineCurve:Jo}),da=class extends ri{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){let t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){let n=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Kc[n](e,t))}return this}getPoint(t,e){let n=t*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=n){let a=s[r]-n,o=this.curves[r],c=o.getLength(),h=c===0?0:1-a/c;return o.getPointAt(h,e)}r++}return null}getLength(){let t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let t=[],e=0;for(let n=0,s=this.curves.length;n<s;n++)e+=this.curves[n].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){let e=[],n;for(let s=0,r=this.curves;s<r.length;s++){let a=r[s],o=a.isEllipseCurve?t*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?t*a.points.length:t,c=a.getPoints(o);for(let h=0;h<c.length;h++){let d=c[h];n&&n.equals(d)||(e.push(d),n=d)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let s=t.curves[e];this.curves.push(s.clone())}return this.autoClose=t.autoClose,this}toJSON(){let t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,n=this.curves.length;e<n;e++){let s=this.curves[e];t.curves.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let s=t.curves[e];this.curves.push(new Kc[s.type]().fromJSON(s))}return this}};var fs=class i extends Sr{constructor(t=1,e=0){let n=(1+Math.sqrt(5))/2,s=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,t,e),this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new i(t.radius,t.detail)}};var fa=class i extends Sr{constructor(t=1,e=0){let n=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],s=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(n,s,t,e),this.type="OctahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new i(t.radius,t.detail)}},Zi=class i extends Le{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};let r=t/2,a=e/2,o=Math.floor(n),c=Math.floor(s),h=o+1,d=c+1,_=t/o,u=e/c,m=[],S=[],T=[],v=[];for(let g=0;g<d;g++){let C=g*u-a;for(let D=0;D<h;D++){let E=D*_-r;S.push(E,-C,0),T.push(0,0,1),v.push(D/o),v.push(1-g/c)}}for(let g=0;g<c;g++)for(let C=0;C<o;C++){let D=C+h*g,E=C+h*(g+1),P=C+1+h*(g+1),R=C+1+h*g;m.push(D,E,R),m.push(E,P,R)}this.setIndex(m),this.setAttribute("position",new ne(S,3)),this.setAttribute("normal",new ne(T,3)),this.setAttribute("uv",new ne(v,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.widthSegments,t.heightSegments)}},ps=class i extends Le{constructor(t=.5,e=1,n=32,s=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:e,thetaSegments:n,phiSegments:s,thetaStart:r,thetaLength:a},n=Math.max(3,n),s=Math.max(1,s);let o=[],c=[],h=[],d=[],_=t,u=(e-t)/s,m=new N,S=new Bt;for(let T=0;T<=s;T++){for(let v=0;v<=n;v++){let g=r+v/n*a;m.x=_*Math.cos(g),m.y=_*Math.sin(g),c.push(m.x,m.y,m.z),h.push(0,0,1),S.x=(m.x/e+1)/2,S.y=(m.y/e+1)/2,d.push(S.x,S.y)}_+=u}for(let T=0;T<s;T++){let v=T*(n+1);for(let g=0;g<n;g++){let C=g+v,D=C,E=C+n+1,P=C+n+2,R=C+1;o.push(D,E,R),o.push(E,P,R)}}this.setIndex(o),this.setAttribute("position",new ne(c,3)),this.setAttribute("normal",new ne(h,3)),this.setAttribute("uv",new ne(d,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}};var Un=class i extends Le{constructor(t=1,e=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));let c=Math.min(a+o,Math.PI),h=0,d=[],_=new N,u=new N,m=[],S=[],T=[],v=[];for(let g=0;g<=n;g++){let C=[],D=g/n,E=a+D*o,P=t*Math.cos(E),R=Math.sqrt(t*t-P*P),U=0;g===0&&a===0?U=.5/e:g===n&&c===Math.PI&&(U=-.5/e);for(let y=0;y<=e;y++){let I=y/e,O=s+I*r;_.x=-R*Math.cos(O),_.y=P,_.z=R*Math.sin(O),S.push(_.x,_.y,_.z),u.copy(_).normalize(),T.push(u.x,u.y,u.z),v.push(I+U,1-D),C.push(h++)}d.push(C)}for(let g=0;g<n;g++)for(let C=0;C<e;C++){let D=d[g][C+1],E=d[g][C],P=d[g+1][C],R=d[g+1][C+1];(g!==0||a>0)&&m.push(D,E,R),(g!==n-1||c<Math.PI)&&m.push(E,P,R)}this.setIndex(m),this.setAttribute("position",new ne(S,3)),this.setAttribute("normal",new ne(T,3)),this.setAttribute("uv",new ne(v,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};var ms=class i extends Le{constructor(t=1,e=.4,n=12,s=48,r=Math.PI*2,a=0,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:n,tubularSegments:s,arc:r,thetaStart:a,thetaLength:o},n=Math.floor(n),s=Math.floor(s);let c=[],h=[],d=[],_=[],u=new N,m=new N,S=new N;for(let T=0;T<=n;T++){let v=a+T/n*o;for(let g=0;g<=s;g++){let C=g/s*r;m.x=(t+e*Math.cos(v))*Math.cos(C),m.y=(t+e*Math.cos(v))*Math.sin(C),m.z=e*Math.sin(v),h.push(m.x,m.y,m.z),u.x=t*Math.cos(C),u.y=t*Math.sin(C),S.subVectors(m,u).normalize(),d.push(S.x,S.y,S.z),_.push(g/s),_.push(T/n)}}for(let T=1;T<=n;T++)for(let v=1;v<=s;v++){let g=(s+1)*T+v-1,C=(s+1)*(T-1)+v-1,D=(s+1)*(T-1)+v,E=(s+1)*T+v;c.push(g,C,E),c.push(C,D,E)}this.setIndex(c),this.setAttribute("position",new ne(h,3)),this.setAttribute("normal",new ne(d,3)),this.setAttribute("uv",new ne(_,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}};var pa=class i extends Le{constructor(t=new ua(new N(-1,-1,0),new N(-1,1,0),new N(1,1,0)),e=64,n=1,s=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:t,tubularSegments:e,radius:n,radialSegments:s,closed:r};let a=t.computeFrenetFrames(e,r);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;let o=new N,c=new N,h=new Bt,d=new N,_=[],u=[],m=[],S=[];T(),this.setIndex(S),this.setAttribute("position",new ne(_,3)),this.setAttribute("normal",new ne(u,3)),this.setAttribute("uv",new ne(m,2));function T(){for(let D=0;D<e;D++)v(D);v(r===!1?e:0),C(),g()}function v(D){d=t.getPointAt(D/e,d);let E=a.normals[D],P=a.binormals[D];for(let R=0;R<=s;R++){let U=R/s*Math.PI*2,y=Math.sin(U),I=-Math.cos(U);c.x=I*E.x+y*P.x,c.y=I*E.y+y*P.y,c.z=I*E.z+y*P.z,c.normalize(),u.push(c.x,c.y,c.z),o.x=d.x+n*c.x,o.y=d.y+n*c.y,o.z=d.z+n*c.z,_.push(o.x,o.y,o.z)}}function g(){for(let D=1;D<=e;D++)for(let E=1;E<=s;E++){let P=(s+1)*(D-1)+(E-1),R=(s+1)*D+(E-1),U=(s+1)*D+E,y=(s+1)*(D-1)+E;S.push(P,R,y),S.push(R,U,y)}}function C(){for(let D=0;D<=e;D++)for(let E=0;E<=s;E++)h.x=D/e,h.y=E/s,m.push(h.x,h.y)}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON();return t.path=this.parameters.path.toJSON(),t}static fromJSON(t){return new i(new Kc[t.path.type]().fromJSON(t.path),t.tubularSegments,t.radius,t.radialSegments,t.closed)}},wr=class extends Le{constructor(t=null){if(super(),this.type="WireframeGeometry",this.parameters={geometry:t},t!==null){let e=[],n=new Set,s=new N,r=new N;if(t.index!==null){let a=t.attributes.position,o=t.index,c=t.groups;c.length===0&&(c=[{start:0,count:o.count,materialIndex:0}]);for(let h=0,d=c.length;h<d;++h){let _=c[h],u=_.start,m=_.count;for(let S=u,T=u+m;S<T;S+=3)for(let v=0;v<3;v++){let g=o.getX(S+v),C=o.getX(S+(v+1)%3);s.fromBufferAttribute(a,g),r.fromBufferAttribute(a,C),ku(s,r,n)===!0&&(e.push(s.x,s.y,s.z),e.push(r.x,r.y,r.z))}}}else{let a=t.attributes.position;for(let o=0,c=a.count/3;o<c;o++)for(let h=0;h<3;h++){let d=3*o+h,_=3*o+(h+1)%3;s.fromBufferAttribute(a,d),r.fromBufferAttribute(a,_),ku(s,r,n)===!0&&(e.push(s.x,s.y,s.z),e.push(r.x,r.y,r.z))}}this.setAttribute("position",new ne(e,3))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}};function ku(i,t,e){let n=`${i.x},${i.y},${i.z}-${t.x},${t.y},${t.z}`,s=`${t.x},${t.y},${t.z}-${i.x},${i.y},${i.z}`;return e.has(n)===!0||e.has(s)===!0?!1:(e.add(n),e.add(s),!0)}function zs(i){let t={};for(let e in i){t[e]={};for(let n in i[e]){let s=i[e][n];if(Vu(s))s.isRenderTargetTexture?(Qt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone();else if(Array.isArray(s))if(Vu(s[0])){let r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();t[e][n]=r}else t[e][n]=s.slice();else t[e][n]=s}}return t}function Fn(i){let t={};for(let e=0;e<i.length;e++){let n=zs(i[e]);for(let s in n)t[s]=n[s]}return t}function Vu(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function Up(i){let t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function Th(i){let t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:we.workingColorSpace}var Ud={clone:zs,merge:Fn},Fp=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Op=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,xn=class extends yi{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Fp,this.fragmentShader=Op,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=zs(t.uniforms),this.uniformsGroups=Up(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?e.uniforms[s]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[s]={type:"m4",value:a.toArray()}:e.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(let n in t.uniforms){let s=t.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=e[s.value]||null;break;case"c":this.uniforms[n].value=new jt().setHex(s.value);break;case"v2":this.uniforms[n].value=new Bt().fromArray(s.value);break;case"v3":this.uniforms[n].value=new N().fromArray(s.value);break;case"v4":this.uniforms[n].value=new Je().fromArray(s.value);break;case"m3":this.uniforms[n].value=new ae().fromArray(s.value);break;case"m4":this.uniforms[n].value=new ze().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(let n in t.extensions)this.extensions[n]=t.extensions[n];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}},Ko=class extends xn{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}};var $i=class extends yi{constructor(t){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new jt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new jt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=tc,this.normalScale=new Bt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Yi,this.combine=pl,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.envMapIntensity=t.envMapIntensity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},jo=class extends yi{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=yd,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},Qo=class extends yi{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function cr(i,t){return!i||i.constructor===t?i:typeof t.BYTES_PER_ELEMENT=="number"?new t(i):Array.prototype.slice.call(i)}function Wc(i){return i!==void 0&&i.inTangents!==void 0&&i.outTangents!==void 0}var gs=class{constructor(t,e,n,s){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new e.constructor(n),this.sampleValues=e,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,n=this._cachedIndex,s=e[n],r=e[n-1];n:{t:{let a;e:{i:if(!(t<s)){for(let o=n+2;;){if(s===void 0){if(t<r)break i;return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=s,s=e[++n],t<s)break t}a=e.length;break e}if(!(t>=r)){let o=e[1];t<o&&(n=2,r=o);for(let c=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===c)break;if(s=r,r=e[--n-1],t>=r)break t}a=n,n=0;break e}break n}for(;n<a;){let o=n+a>>>1;t<e[o]?a=o:n=o+1}if(s=e[n],r=e[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,t,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=t*s;for(let a=0;a!==s;++a)e[a]=n[r+a];return e}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},tl=class extends gs{constructor(t,e,n,s){super(t,e,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Yc,endingEnd:Yc}}intervalChanged_(t,e,n){let s=this.parameterPositions,r=t-2,a=t+1,o=s[r],c=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case Zc:r=t,o=2*e-n;break;case $c:r=s.length-2,o=e+s[r]-s[r+1];break;default:r=t,o=n}if(c===void 0)switch(this.getSettings_().endingEnd){case Zc:a=t,c=2*n-e;break;case $c:a=1,c=n+s[1]-s[0];break;default:a=t-1,c=e}let h=(n-e)*.5,d=this.valueSize;this._weightPrev=h/(e-o),this._weightNext=h/(c-n),this._offsetPrev=r*d,this._offsetNext=a*d}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=t*o,h=c-o,d=this._offsetPrev,_=this._offsetNext,u=this._weightPrev,m=this._weightNext,S=(n-e)/(s-e),T=S*S,v=T*S,g=-u*v+2*u*T-u*S,C=(1+u)*v+(-1.5-2*u)*T+(-.5+u)*S+1,D=(-1-m)*v+(1.5+m)*T+.5*S,E=m*v-m*T;for(let P=0;P!==o;++P)r[P]=g*a[d+P]+C*a[h+P]+D*a[c+P]+E*a[_+P];return r}},el=class extends gs{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=t*o,h=c-o,d=(n-e)/(s-e),_=1-d;for(let u=0;u!==o;++u)r[u]=a[h+u]*_+a[c+u]*d;return r}},nl=class extends gs{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t){return this.copySampleValue_(t-1)}},il=class extends gs{interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=t*o,h=c-o,d=this.inTangents,_=this.outTangents;if(!d||!_){let S=(n-e)/(s-e),T=1-S;for(let v=0;v!==o;++v)r[v]=a[h+v]*T+a[c+v]*S;return r}let u=o*2,m=t-1;for(let S=0;S!==o;++S){let T=a[h+S],v=a[c+S],g=m*u+S*2,C=_[g],D=_[g+1],E=t*u+S*2,P=d[E],R=d[E+1],U=zp(n,e,C,P,s);r[S]=Fd(U,T,D,R,v)}return r}};function Fd(i,t,e,n,s){let r=1-i;return r*r*r*t+3*r*r*i*e+3*r*i*i*n+i*i*i*s}function Bp(i,t,e,n,s){let r=1-i;return 3*r*r*(e-t)+6*r*i*(n-e)+3*i*i*(s-n)}function zp(i,t,e,n,s){let r=(i-t)/(s-t);for(let a=0;a<8;a++){let o=Fd(r,t,e,n,s)-i;if(Math.abs(o)<1e-10)break;let c=Bp(r,t,e,n,s);if(Math.abs(c)<1e-10)break;r=Math.max(0,Math.min(1,r-o/c))}return r}var ai=class{constructor(t,e,n,s){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=cr(e,this.TimeBufferType),this.values=cr(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,n;if(e.toJSON!==this.toJSON)n=e.toJSON(t);else{n={name:t.name,times:cr(t.times,Array),values:cr(t.values,Array)};let s=t.getInterpolation();s!==t.DefaultInterpolation&&(n.interpolation=s),Wc(t.settings)&&(n.settings={inTangents:cr(t.settings.inTangents,Array),outTangents:cr(t.settings.outTangents,Array)})}return n.type=t.ValueTypeName,n}InterpolantFactoryMethodDiscrete(t){return new nl(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new el(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new tl(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let e=new il(this.times,this.values,this.getValueSize(),t);return this.settings&&(e.inTangents=this.settings.inTangents,e.outTangents=this.settings.outTangents),e}setInterpolation(t){let e;switch(t){case jr:e=this.InterpolantFactoryMethodDiscrete;break;case Uo:e=this.InterpolantFactoryMethodLinear;break;case bo:e=this.InterpolantFactoryMethodSmooth;break;case qc:e=this.InterpolantFactoryMethodBezier;break}if(e===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Qt("KeyframeTrack:",n),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return jr;case this.InterpolantFactoryMethodLinear:return Uo;case this.InterpolantFactoryMethodSmooth:return bo;case this.InterpolantFactoryMethodBezier:return qc}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]*=t;Wc(this.settings)&&(Gu(this.settings.inTangents,t),Gu(this.settings.outTangents,t))}return this}trim(t,e){let n=this.times,s=n.length,r=0,a=s-1;for(;r!==s&&n[r]<t;)++r;for(;a!==-1&&n[a]>e;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(te("KeyframeTrack: Invalid value size in track.",this),t=!1);let n=this.times,s=this.values,r=n.length;r===0&&(te("KeyframeTrack: Track is empty.",this),t=!1);let a=null;for(let o=0;o!==r;o++){let c=n[o];if(typeof c=="number"&&isNaN(c)){te("KeyframeTrack: Time is not a valid number.",this,o,c),t=!1;break}if(a!==null&&a>c){te("KeyframeTrack: Out of order keys.",this,o,c,a),t=!1;break}a=c}if(s!==void 0&&lp(s))for(let o=0,c=s.length;o!==c;++o){let h=s[o];if(isNaN(h)){te("KeyframeTrack: Value is not a valid number.",this,o,h),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===bo,r=t.length-1,a=1;for(let o=1;o<r;++o){let c=!1,h=t[o],d=t[o+1];if(h!==d&&(o!==1||h!==t[0]))if(s)c=!0;else{let _=o*n,u=_-n,m=_+n;for(let S=0;S!==n;++S){let T=e[_+S];if(T!==e[u+S]||T!==e[m+S]){c=!0;break}}}if(c){if(o!==a){t[a]=t[o];let _=o*n,u=a*n;for(let m=0;m!==n;++m)e[u+m]=e[_+m]}++a}}if(r>0){t[a]=t[r];for(let o=r*n,c=a*n,h=0;h!==n;++h)e[c+h]=e[o+h];++a}return a!==t.length?(this.times=t.slice(0,a),this.values=e.slice(0,a*n)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),n=this.constructor,s=new n(this.name,t,e);return s.createInterpolant=this.createInterpolant,Wc(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function Gu(i,t){for(let e=0,n=i.length;e!==n;e+=2)i[e]*=t}ai.prototype.ValueTypeName="";ai.prototype.TimeBufferType=Float32Array;ai.prototype.ValueBufferType=Float32Array;ai.prototype.DefaultInterpolation=Uo;var _s=class extends ai{constructor(t,e,n){super(t,e,n)}};_s.prototype.ValueTypeName="bool";_s.prototype.ValueBufferType=Array;_s.prototype.DefaultInterpolation=jr;_s.prototype.InterpolantFactoryMethodLinear=void 0;_s.prototype.InterpolantFactoryMethodSmooth=void 0;var sl=class extends ai{constructor(t,e,n,s){super(t,e,n,s)}};sl.prototype.ValueTypeName="color";var rl=class extends ai{constructor(t,e,n,s){super(t,e,n,s)}};rl.prototype.ValueTypeName="number";var al=class extends gs{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=(n-e)/(s-e),h=t*o;for(let d=h+o;h!==d;h+=4)hi.slerpFlat(r,0,a,h-o,a,h,c);return r}},ma=class extends ai{constructor(t,e,n,s){super(t,e,n,s)}InterpolantFactoryMethodLinear(t){return new al(this.times,this.values,this.getValueSize(),t)}};ma.prototype.ValueTypeName="quaternion";ma.prototype.InterpolantFactoryMethodSmooth=void 0;var xs=class extends ai{constructor(t,e,n){super(t,e,n)}};xs.prototype.ValueTypeName="string";xs.prototype.ValueBufferType=Array;xs.prototype.DefaultInterpolation=jr;xs.prototype.InterpolantFactoryMethodLinear=void 0;xs.prototype.InterpolantFactoryMethodSmooth=void 0;var ol=class extends ai{constructor(t,e,n,s){super(t,e,n,s)}};ol.prototype.ValueTypeName="vector";var To={enabled:!1,files:{},add:function(i,t){this.enabled!==!1&&(Hu(i)||(this.files[i]=t))},get:function(i){if(this.enabled!==!1&&!Hu(i))return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}};function Hu(i){try{let t=i.slice(i.indexOf(":")+1);return new URL(t).protocol==="blob:"}catch{return!1}}var ll=class{constructor(t,e,n){let s=this,r=!1,a=0,o=0,c,h=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this._abortController=null,this.itemStart=function(d){o++,r===!1&&s.onStart!==void 0&&s.onStart(d,a,o),r=!0},this.itemEnd=function(d){a++,s.onProgress!==void 0&&s.onProgress(d,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(d){s.onError!==void 0&&s.onError(d)},this.resolveURL=function(d){return d=d.normalize("NFC"),c?c(d):d},this.setURLModifier=function(d){return c=d,this},this.addHandler=function(d,_){return h.push(d,_),this},this.removeHandler=function(d){let _=h.indexOf(d);return _!==-1&&h.splice(_,2),this},this.getHandler=function(d){for(let _=0,u=h.length;_<u;_+=2){let m=h[_],S=h[_+1];if(m.global&&(m.lastIndex=0),m.test(d))return S}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Od=new ll,Tr=class{constructor(t){this.manager=t!==void 0?t:Od,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,e){let n=this;return new Promise(function(s,r){n.load(t,s,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}};Tr.DEFAULT_MATERIAL_NAME="__DEFAULT";var hr=new WeakMap,cl=class extends Tr{constructor(t){super(t)}load(t,e,n,s){this.path!==void 0&&(t=this.path+t),t=this.manager.resolveURL(t);let r=this,a=To.get(`image:${t}`);if(a!==void 0){if(a.complete===!0)r.manager.itemStart(t),setTimeout(function(){e&&e(a),r.manager.itemEnd(t)},0);else{let _=hr.get(a);_===void 0&&(_=[],hr.set(a,_)),_.push({onLoad:e,onError:s})}return a}let o=gr("img");function c(){d(),e&&e(this);let _=hr.get(this)||[];for(let u=0;u<_.length;u++){let m=_[u];m.onLoad&&m.onLoad(this)}hr.delete(this),r.manager.itemEnd(t)}function h(_){d(),s&&s(_),To.remove(`image:${t}`);let u=hr.get(this)||[];for(let m=0;m<u.length;m++){let S=u[m];S.onError&&S.onError(_)}hr.delete(this),r.manager.itemError(t),r.manager.itemEnd(t)}function d(){o.removeEventListener("load",c,!1),o.removeEventListener("error",h,!1)}return o.addEventListener("load",c,!1),o.addEventListener("error",h,!1),t.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),To.add(`image:${t}`,o),r.manager.itemStart(t),o.src=t,o}};var ga=class extends Tr{constructor(t){super(t)}load(t,e,n,s){let r=new Nn,a=new cl(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(t,function(o){r.image=o,r.needsUpdate=!0,e!==void 0&&e(r)},n,s),r}},_a=class extends _n{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new jt(t),this.intensity=e}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}},xa=class extends _a{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(_n.DEFAULT_UP),this.updateMatrix(),this.groundColor=new jt(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){let e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}},Xc=new ze,Wu=new N,Xu=new N,hl=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Bt(512,512),this.mapType=$n,this.map=null,this.mapPass=null,this.matrix=new ze,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Mr,this._frameExtents=new Bt(1,1),this._viewportCount=1,this._viewports=[new Je(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera;Wu.setFromMatrixPosition(t.matrixWorld),e.position.copy(Wu),Xu.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(Xu),e.updateMatrixWorld(),this._updateMatrix(e,this.matrix,this._frustum)}_updateMatrix(t,e,n,s){Xc.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),n.setFromProjectionMatrix(Xc,t.coordinateSystem,t.reversedDepth);let r=this._frameExtents,a=s?s.z/r.x:1,o=s?s.w/r.y:1,c=s?s.x/r.x:0,h=s?s.y/r.y:0;t.coordinateSystem===mr||t.reversedDepth?e.set(.5*a,0,0,.5*a+c,0,.5*o,0,.5*o+h,0,0,1,0,0,0,0,1):e.set(.5*a,0,0,.5*a+c,0,.5*o,0,.5*o+h,0,0,.5,.5,0,0,0,1),e.multiply(Xc)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},Mo=new N,So=new hi,Ri=new N,va=class extends _n{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new ze,this.projectionMatrix=new ze,this.projectionMatrixInverse=new ze,this.coordinateSystem=vi,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(Mo,So,Ri),Ri.x===1&&Ri.y===1&&Ri.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Mo,So,Ri.set(1,1,1)).invert()}updateWorldMatrix(t,e,n=!1){super.updateWorldMatrix(t,e,n),this.matrixWorld.decompose(Mo,So,Ri),Ri.x===1&&Ri.y===1&&Ri.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Mo,So,Ri.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},rs=new N,qu=new Bt,Yu=new Bt,Dn=class extends va{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=Fo*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(xc*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return Fo*2*Math.atan(Math.tan(xc*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){rs.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(rs.x,rs.y).multiplyScalar(-t/rs.z),rs.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(rs.x,rs.y).multiplyScalar(-t/rs.z)}getViewSize(t,e){return this.getViewBounds(t,qu,Yu),e.subVectors(Yu,qu)}setViewOffset(t,e,n,s,r,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(xc*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let c=a.fullWidth,h=a.fullHeight;r+=a.offsetX*s/c,e-=a.offsetY*n/h,s*=a.width/c,n*=a.height/h}let o=this.filmOffset;o!==0&&(r+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}};var Ar=class extends va{constructor(t=-1,e=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-t,a=n+t,o=s+e,c=s-e;if(this.view!==null&&this.view.enabled){let h=(this.right-this.left)/this.view.fullWidth/this.zoom,d=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=h*this.view.offsetX,a=r+h*this.view.width,o-=d*this.view.offsetY,c=o-d*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},jc=class extends hl{constructor(){super(new Ar(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},ya=class extends _a{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(_n.DEFAULT_UP),this.updateMatrix(),this.target=new _n,this.shadow=new jc}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}};var ur=-90,dr=1,ul=class extends _n{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Dn(ur,dr,t,e);s.layers=this.layers,this.add(s);let r=new Dn(ur,dr,t,e);r.layers=this.layers,this.add(r);let a=new Dn(ur,dr,t,e);a.layers=this.layers,this.add(a);let o=new Dn(ur,dr,t,e);o.layers=this.layers,this.add(o);let c=new Dn(ur,dr,t,e);c.layers=this.layers,this.add(c);let h=new Dn(ur,dr,t,e);h.layers=this.layers,this.add(h)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[n,s,r,a,o,c]=e;for(let h of e)this.remove(h);if(t===vi)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(t===mr)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let h of e)this.add(h),h.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,c,h,d]=this.children,_=t.getRenderTarget(),u=t.getActiveCubeFace(),m=t.getActiveMipmapLevel(),S=t.xr.enabled;t.xr.enabled=!1;let T=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let v=!1;t.isWebGLRenderer===!0?v=t.state.buffers.depth.getReversed():v=t.reversedDepthBuffer,t.setRenderTarget(n,0,s),v&&t.autoClear===!1&&t.clearDepth(),t.render(e,r),t.setRenderTarget(n,1,s),v&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(n,2,s),v&&t.autoClear===!1&&t.clearDepth(),t.render(e,o),t.setRenderTarget(n,3,s),v&&t.autoClear===!1&&t.clearDepth(),t.render(e,c),t.setRenderTarget(n,4,s),v&&t.autoClear===!1&&t.clearDepth(),t.render(e,h),n.texture.generateMipmaps=T,t.setRenderTarget(n,5,s),v&&t.autoClear===!1&&t.clearDepth(),t.render(e,d),t.setRenderTarget(_,u,m),t.xr.enabled=S,n.texture.needsPMREMUpdate=!0}},dl=class extends Dn{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}};var Ah="\\[\\]\\.:\\/",kp=new RegExp("["+Ah+"]","g"),Eh="[^"+Ah+"]",Vp="[^"+Ah.replace("\\.","")+"]",Gp=/((?:WC+[\/:])*)/.source.replace("WC",Eh),Hp=/(WCOD+)?/.source.replace("WCOD",Vp),Wp=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Eh),Xp=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Eh),qp=new RegExp("^"+Gp+Hp+Wp+Xp+"$"),Yp=["material","materials","bones","map"],Qc=class{constructor(t,e,n){let s=n||qe.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,s)}getValue(t,e){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(t,e)}setValue(t,e){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].unbind()}},qe=class i{constructor(t,e,n){this.path=e,this.parsedPath=n||i.parseTrackName(e),this.node=i.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,n){return t&&t.isAnimationObjectGroup?new i.Composite(t,e,n):new i(t,e,n)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(kp,"")}static parseTrackName(t){let e=qp.exec(t);if(e===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let n={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);Yp.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return n}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let n=t.skeleton.getBoneByName(e);if(n!==void 0)return n}if(t.children){let n=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===e||o.uuid===e)return o;let c=n(o.children);if(c)return c}return null},s=n(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)t[e++]=n[s]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,n=e.objectName,s=e.propertyName,r=e.propertyIndex;if(t||(t=i.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){Qt("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let h=e.objectIndex;switch(n){case"materials":if(!t.material){te("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){te("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){te("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let d=0;d<t.length;d++)if(t[d].name===h){h=d;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){te("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){te("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[n]===void 0){te("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[n]}if(h!==void 0){if(t[h]===void 0){te("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[h]}}let a=t[s];if(a===void 0){let h=e.nodeName;te("PropertyBinding: Trying to update property for track: "+h+"."+s+" but it wasn't found.",t);return}let o=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?o=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){te("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){te("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}c=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(c=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};qe.Composite=Qc;qe.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};qe.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};qe.prototype.GetterByBindingType=[qe.prototype._getValue_direct,qe.prototype._getValue_array,qe.prototype._getValue_arrayElement,qe.prototype._getValue_toArray];qe.prototype.SetterByBindingTypeAndVersioning=[[qe.prototype._setValue_direct,qe.prototype._setValue_direct_setNeedsUpdate,qe.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[qe.prototype._setValue_array,qe.prototype._setValue_array_setNeedsUpdate,qe.prototype._setValue_array_setMatrixWorldNeedsUpdate],[qe.prototype._setValue_arrayElement,qe.prototype._setValue_arrayElement_setNeedsUpdate,qe.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[qe.prototype._setValue_fromArray,qe.prototype._setValue_fromArray_setNeedsUpdate,qe.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Xx=new Float32Array(1);var Zu=new ze,Ma=class{constructor(t,e,n=0,s=1/0){this.ray=new Ls(t,e),this.near=n,this.far=s,this.camera=null,this.layers=new vr,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,e.projectionMatrix.elements[14]).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):te("Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return Zu.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Zu),this}intersectObject(t,e=!0,n=[]){return th(t,this,n,e),n.sort($u),n}intersectObjects(t,e=!0,n=[]){for(let s=0,r=t.length;s<r;s++)th(t[s],this,n,e);return n.sort($u),n}};function $u(i,t){return i.distance-t.distance}function th(i,t,e,n){let s=!0;if(i.layers.test(t.layers)&&i.raycast(t,e)===!1&&(s=!1),s===!0&&n===!0){let r=i.children;for(let a=0,o=r.length;a<o;a++)th(r[a],t,e,!0)}}var Dh=class Dh{constructor(t,e,n,s){this.elements=[1,0,0,1],t!==void 0&&this.set(t,e,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let n=0;n<4;n++)this.elements[n]=t[n+e];return this}set(t,e,n,s){let r=this.elements;return r[0]=t,r[2]=e,r[1]=n,r[3]=s,this}};Dh.prototype.isMatrix2=!0;var eh=Dh;function Ch(i,t,e,n){let s=Zp(n);switch(e){case vh:return i*t;case Mh:return i*t/s.components*s.byteLength;case Ml:return i*t/s.components*s.byteLength;case ws:return i*t*2/s.components*s.byteLength;case Sl:return i*t*2/s.components*s.byteLength;case yh:return i*t*3/s.components*s.byteLength;case fi:return i*t*4/s.components*s.byteLength;case bl:return i*t*4/s.components*s.byteLength;case Ta:case Aa:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Ea:case Ca:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Tl:case El:return Math.max(i,16)*Math.max(t,8)/4;case wl:case Al:return Math.max(i,8)*Math.max(t,8)/2;case Cl:case Rl:case Il:case Ll:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Pl:case Ra:case Dl:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Nl:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Ul:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case Fl:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case Ol:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case Bl:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case zl:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case kl:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case Vl:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case Gl:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case Hl:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case Wl:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case Xl:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case ql:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case Yl:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case Zl:case $l:case Jl:return Math.ceil(i/4)*Math.ceil(t/4)*16;case Kl:case jl:return Math.ceil(i/4)*Math.ceil(t/4)*8;case Pa:case Ql:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function Zp(i){switch(i){case $n:case mh:return{byteLength:1,components:1};case Cr:case gh:case Ai:return{byteLength:2,components:1};case vl:case yl:return{byteLength:2,components:4};case wi:case xl:case Ti:return{byteLength:4,components:1};case _h:case xh:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?Qt("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function af(){let i=null,t=!1,e=null,n=null;function s(r,a){n=i.requestAnimationFrame(s),e(r,a)}return{start:function(){t!==!0&&e!==null&&i!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function Jp(i){let t=new WeakMap;function e(o,c){let h=o.array,d=o.usage,_=h.byteLength,u=i.createBuffer();i.bindBuffer(c,u),i.bufferData(c,h,d),o.onUploadCallback();let m;if(h instanceof Float32Array)m=i.FLOAT;else if(typeof Float16Array<"u"&&h instanceof Float16Array)m=i.HALF_FLOAT;else if(h instanceof Uint16Array)o.isFloat16BufferAttribute?m=i.HALF_FLOAT:m=i.UNSIGNED_SHORT;else if(h instanceof Int16Array)m=i.SHORT;else if(h instanceof Uint32Array)m=i.UNSIGNED_INT;else if(h instanceof Int32Array)m=i.INT;else if(h instanceof Int8Array)m=i.BYTE;else if(h instanceof Uint8Array)m=i.UNSIGNED_BYTE;else if(h instanceof Uint8ClampedArray)m=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+h);return{buffer:u,type:m,bytesPerElement:h.BYTES_PER_ELEMENT,version:o.version,size:_}}function n(o,c,h){let d=c.array,_=c.updateRanges;if(i.bindBuffer(h,o),_.length===0)i.bufferSubData(h,0,d);else{_.sort((m,S)=>m.start-S.start);let u=0;for(let m=1;m<_.length;m++){let S=_[u],T=_[m];T.start<=S.start+S.count+1?S.count=Math.max(S.count,T.start+T.count-S.start):(++u,_[u]=T)}_.length=u+1;for(let m=0,S=_.length;m<S;m++){let T=_[m];i.bufferSubData(h,T.start*d.BYTES_PER_ELEMENT,d,T.start,T.count)}c.clearUpdateRanges()}c.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let c=t.get(o);c&&(i.deleteBuffer(c.buffer),t.delete(o))}function a(o,c){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let d=t.get(o);(!d||d.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let h=t.get(o);if(h===void 0)t.set(o,e(o,c));else if(h.version<o.version){if(h.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(h.buffer,o,c),h.version=o.version}}return{get:s,remove:r,update:a}}var Kp=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,jp=`#ifdef USE_ALPHAHASH
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
#endif`,Qp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,tm=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,em=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,nm=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,im=`#ifdef USE_AOMAP
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
#endif`,sm=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,rm=`#ifdef USE_BATCHING
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
#endif`,am=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,om=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,lm=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,cm=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,hm=`#ifdef USE_IRIDESCENCE
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
#endif`,um=`#ifdef USE_BUMPMAP
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
#endif`,dm=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,fm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,pm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,mm=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,gm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,_m=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,xm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,vm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,ym=`#define PI 3.141592653589793
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
} // validated`,Mm=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,Sm=`vec3 transformedNormal = objectNormal;
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
#endif`,bm=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,wm=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Tm=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Am=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Em="gl_FragColor = linearToOutputTexel( gl_FragColor );",Cm=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Rm=`#ifdef USE_ENVMAP
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
#endif`,Pm=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Im=`#ifdef USE_ENVMAP
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
#endif`,Lm=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Dm=`#ifdef USE_ENVMAP
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
#endif`,Nm=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Um=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Fm=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Om=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Bm=`#ifdef USE_GRADIENTMAP
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
}`,zm=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,km=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Vm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Gm=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,Hm=`#ifdef USE_ENVMAP
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
#endif`,Wm=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Xm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,qm=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Ym=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Zm=`PhysicalMaterial material;
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
#endif`,$m=`uniform sampler2D dfgLUT;
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
}`,Jm=`
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
#endif`,Km=`#if defined( RE_IndirectDiffuse )
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
#endif`,jm=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Qm=`#ifdef USE_LIGHT_PROBES_GRID
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
#endif`,t0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,e0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,n0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,i0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,s0=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,r0=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,a0=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,o0=`#if defined( USE_POINTS_UV )
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
#endif`,l0=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,c0=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,h0=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,u0=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,d0=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,f0=`#ifdef USE_MORPHTARGETS
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
#endif`,p0=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,m0=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,g0=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,_0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,x0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,v0=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,y0=`#ifdef USE_NORMALMAP
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
#endif`,M0=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,S0=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,b0=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,w0=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,T0=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,A0=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,E0=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,C0=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,R0=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,P0=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,I0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,L0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,D0=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,N0=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,U0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,F0=`float getShadowMask() {
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
}`,O0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,B0=`#ifdef USE_SKINNING
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
#endif`,z0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,k0=`#ifdef USE_SKINNING
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
#endif`,V0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,G0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,H0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,W0=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,X0=`#ifdef USE_TRANSMISSION
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
#endif`,q0=`#ifdef USE_TRANSMISSION
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
#endif`,Y0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Z0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,$0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,J0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,K0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,j0=`uniform sampler2D t2D;
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
}`,Q0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,tg=`#ifdef ENVMAP_TYPE_CUBE
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
}`,eg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,ng=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,ig=`#include <common>
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
}`,sg=`#if DEPTH_PACKING == 3200
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
}`,rg=`#define DISTANCE
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
}`,ag=`#define DISTANCE
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
}`,og=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,lg=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,cg=`uniform float scale;
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
}`,hg=`uniform vec3 diffuse;
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
}`,ug=`#include <common>
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
}`,dg=`uniform vec3 diffuse;
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
}`,fg=`#define LAMBERT
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
}`,pg=`#define LAMBERT
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
}`,mg=`#define MATCAP
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
}`,gg=`#define MATCAP
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
}`,_g=`#define NORMAL
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
}`,xg=`#define NORMAL
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
}`,vg=`#define PHONG
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
}`,yg=`#define PHONG
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
}`,Mg=`#define STANDARD
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
}`,Sg=`#define STANDARD
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
}`,bg=`#define TOON
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
}`,wg=`#define TOON
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
}`,Tg=`uniform float size;
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
}`,Ag=`uniform vec3 diffuse;
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
}`,Eg=`#include <common>
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
}`,Cg=`uniform vec3 color;
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
}`,Rg=`uniform float rotation;
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
}`,Pg=`uniform vec3 diffuse;
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
}`,ge={alphahash_fragment:Kp,alphahash_pars_fragment:jp,alphamap_fragment:Qp,alphamap_pars_fragment:tm,alphatest_fragment:em,alphatest_pars_fragment:nm,aomap_fragment:im,aomap_pars_fragment:sm,batching_pars_vertex:rm,batching_vertex:am,begin_vertex:om,beginnormal_vertex:lm,bsdfs:cm,iridescence_fragment:hm,bumpmap_pars_fragment:um,clipping_planes_fragment:dm,clipping_planes_pars_fragment:fm,clipping_planes_pars_vertex:pm,clipping_planes_vertex:mm,color_fragment:gm,color_pars_fragment:_m,color_pars_vertex:xm,color_vertex:vm,common:ym,cube_uv_reflection_fragment:Mm,defaultnormal_vertex:Sm,displacementmap_pars_vertex:bm,displacementmap_vertex:wm,emissivemap_fragment:Tm,emissivemap_pars_fragment:Am,colorspace_fragment:Em,colorspace_pars_fragment:Cm,envmap_fragment:Rm,envmap_common_pars_fragment:Pm,envmap_pars_fragment:Im,envmap_pars_vertex:Lm,envmap_physical_pars_fragment:Hm,envmap_vertex:Dm,fog_vertex:Nm,fog_pars_vertex:Um,fog_fragment:Fm,fog_pars_fragment:Om,gradientmap_pars_fragment:Bm,lightmap_pars_fragment:zm,lights_lambert_fragment:km,lights_lambert_pars_fragment:Vm,lights_pars_begin:Gm,lights_toon_fragment:Wm,lights_toon_pars_fragment:Xm,lights_phong_fragment:qm,lights_phong_pars_fragment:Ym,lights_physical_fragment:Zm,lights_physical_pars_fragment:$m,lights_fragment_begin:Jm,lights_fragment_maps:Km,lights_fragment_end:jm,lightprobes_pars_fragment:Qm,logdepthbuf_fragment:t0,logdepthbuf_pars_fragment:e0,logdepthbuf_pars_vertex:n0,logdepthbuf_vertex:i0,map_fragment:s0,map_pars_fragment:r0,map_particle_fragment:a0,map_particle_pars_fragment:o0,metalnessmap_fragment:l0,metalnessmap_pars_fragment:c0,morphinstance_vertex:h0,morphcolor_vertex:u0,morphnormal_vertex:d0,morphtarget_pars_vertex:f0,morphtarget_vertex:p0,normal_fragment_begin:m0,normal_fragment_maps:g0,normal_pars_fragment:_0,normal_pars_vertex:x0,normal_vertex:v0,normalmap_pars_fragment:y0,clearcoat_normal_fragment_begin:M0,clearcoat_normal_fragment_maps:S0,clearcoat_pars_fragment:b0,iridescence_pars_fragment:w0,opaque_fragment:T0,packing:A0,premultiplied_alpha_fragment:E0,project_vertex:C0,dithering_fragment:R0,dithering_pars_fragment:P0,roughnessmap_fragment:I0,roughnessmap_pars_fragment:L0,shadowmap_pars_fragment:D0,shadowmap_pars_vertex:N0,shadowmap_vertex:U0,shadowmask_pars_fragment:F0,skinbase_vertex:O0,skinning_pars_vertex:B0,skinning_vertex:z0,skinnormal_vertex:k0,specularmap_fragment:V0,specularmap_pars_fragment:G0,tonemapping_fragment:H0,tonemapping_pars_fragment:W0,transmission_fragment:X0,transmission_pars_fragment:q0,uv_pars_fragment:Y0,uv_pars_vertex:Z0,uv_vertex:$0,worldpos_vertex:J0,background_vert:K0,background_frag:j0,backgroundCube_vert:Q0,backgroundCube_frag:tg,cube_vert:eg,cube_frag:ng,depth_vert:ig,depth_frag:sg,distance_vert:rg,distance_frag:ag,equirect_vert:og,equirect_frag:lg,linedashed_vert:cg,linedashed_frag:hg,meshbasic_vert:ug,meshbasic_frag:dg,meshlambert_vert:fg,meshlambert_frag:pg,meshmatcap_vert:mg,meshmatcap_frag:gg,meshnormal_vert:_g,meshnormal_frag:xg,meshphong_vert:vg,meshphong_frag:yg,meshphysical_vert:Mg,meshphysical_frag:Sg,meshtoon_vert:bg,meshtoon_frag:wg,points_vert:Tg,points_frag:Ag,shadow_vert:Eg,shadow_frag:Cg,sprite_vert:Rg,sprite_frag:Pg},Lt={common:{diffuse:{value:new jt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ae},alphaMap:{value:null},alphaMapTransform:{value:new ae},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ae}},envmap:{envMap:{value:null},envMapRotation:{value:new ae},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ae}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ae}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ae},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ae},normalScale:{value:new Bt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ae},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ae}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ae}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ae}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new jt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new N},probesMax:{value:new N},probesResolution:{value:new N}},points:{diffuse:{value:new jt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ae},alphaTest:{value:0},uvTransform:{value:new ae}},sprite:{diffuse:{value:new jt(16777215)},opacity:{value:1},center:{value:new Bt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ae},alphaMap:{value:null},alphaMapTransform:{value:new ae},alphaTest:{value:0}}},Oi={basic:{uniforms:Fn([Lt.common,Lt.specularmap,Lt.envmap,Lt.aomap,Lt.lightmap,Lt.fog]),vertexShader:ge.meshbasic_vert,fragmentShader:ge.meshbasic_frag},lambert:{uniforms:Fn([Lt.common,Lt.specularmap,Lt.envmap,Lt.aomap,Lt.lightmap,Lt.emissivemap,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,Lt.fog,Lt.lights,{emissive:{value:new jt(0)},envMapIntensity:{value:1}}]),vertexShader:ge.meshlambert_vert,fragmentShader:ge.meshlambert_frag},phong:{uniforms:Fn([Lt.common,Lt.specularmap,Lt.envmap,Lt.aomap,Lt.lightmap,Lt.emissivemap,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,Lt.fog,Lt.lights,{emissive:{value:new jt(0)},specular:{value:new jt(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:ge.meshphong_vert,fragmentShader:ge.meshphong_frag},standard:{uniforms:Fn([Lt.common,Lt.envmap,Lt.aomap,Lt.lightmap,Lt.emissivemap,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,Lt.roughnessmap,Lt.metalnessmap,Lt.fog,Lt.lights,{emissive:{value:new jt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ge.meshphysical_vert,fragmentShader:ge.meshphysical_frag},toon:{uniforms:Fn([Lt.common,Lt.aomap,Lt.lightmap,Lt.emissivemap,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,Lt.gradientmap,Lt.fog,Lt.lights,{emissive:{value:new jt(0)}}]),vertexShader:ge.meshtoon_vert,fragmentShader:ge.meshtoon_frag},matcap:{uniforms:Fn([Lt.common,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,Lt.fog,{matcap:{value:null}}]),vertexShader:ge.meshmatcap_vert,fragmentShader:ge.meshmatcap_frag},points:{uniforms:Fn([Lt.points,Lt.fog]),vertexShader:ge.points_vert,fragmentShader:ge.points_frag},dashed:{uniforms:Fn([Lt.common,Lt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ge.linedashed_vert,fragmentShader:ge.linedashed_frag},depth:{uniforms:Fn([Lt.common,Lt.displacementmap]),vertexShader:ge.depth_vert,fragmentShader:ge.depth_frag},normal:{uniforms:Fn([Lt.common,Lt.bumpmap,Lt.normalmap,Lt.displacementmap,{opacity:{value:1}}]),vertexShader:ge.meshnormal_vert,fragmentShader:ge.meshnormal_frag},sprite:{uniforms:Fn([Lt.sprite,Lt.fog]),vertexShader:ge.sprite_vert,fragmentShader:ge.sprite_frag},background:{uniforms:{uvTransform:{value:new ae},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ge.background_vert,fragmentShader:ge.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ae}},vertexShader:ge.backgroundCube_vert,fragmentShader:ge.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ge.cube_vert,fragmentShader:ge.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ge.equirect_vert,fragmentShader:ge.equirect_frag},distance:{uniforms:Fn([Lt.common,Lt.displacementmap,{referencePosition:{value:new N},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ge.distance_vert,fragmentShader:ge.distance_frag},shadow:{uniforms:Fn([Lt.lights,Lt.fog,{color:{value:new jt(0)},opacity:{value:1}}]),vertexShader:ge.shadow_vert,fragmentShader:ge.shadow_frag}};Oi.physical={uniforms:Fn([Oi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ae},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ae},clearcoatNormalScale:{value:new Bt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ae},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ae},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ae},sheen:{value:0},sheenColor:{value:new jt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ae},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ae},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ae},transmissionSamplerSize:{value:new Bt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ae},attenuationDistance:{value:0},attenuationColor:{value:new jt(0)},specularColor:{value:new jt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ae},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ae},anisotropyVector:{value:new Bt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ae}}]),vertexShader:ge.meshphysical_vert,fragmentShader:ge.meshphysical_frag};var ic={r:0,b:0,g:0},Ig=new ze,of=new ae;of.set(-1,0,0,0,1,0,0,0,1);function Lg(i,t,e,n,s,r){let a=new jt(0),o=s===!0?0:1,c,h,d=null,_=0,u=null;function m(C){let D=C.isScene===!0?C.background:null;if(D&&D.isTexture){let E=C.backgroundBlurriness>0;D=t.get(D,E)}return D}function S(C){let D=!1,E=m(C);E===null?v(a,o):E&&E.isColor&&(v(E,1),D=!0);let P=i.xr.getEnvironmentBlendMode();P==="additive"?e.buffers.color.setClear(0,0,0,1,r):P==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,r),(i.autoClear||D)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function T(C,D){let E=m(D);E&&(E.isCubeTexture||E.mapping===ba)?(h===void 0&&(h=new he(new Si(1,1,1),new xn({name:"BackgroundCubeMaterial",uniforms:zs(Oi.backgroundCube.uniforms),vertexShader:Oi.backgroundCube.vertexShader,fragmentShader:Oi.backgroundCube.fragmentShader,side:bn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(P,R,U){this.matrixWorld.copyPosition(U.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(h)),h.material.uniforms.envMap.value=E,h.material.uniforms.backgroundBlurriness.value=D.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=D.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(Ig.makeRotationFromEuler(D.backgroundRotation)).transpose(),E.isCubeTexture&&E.isRenderTargetTexture===!1&&h.material.uniforms.backgroundRotation.value.premultiply(of),h.material.toneMapped=we.getTransfer(E.colorSpace)!==De,(d!==E||_!==E.version||u!==i.toneMapping)&&(h.material.needsUpdate=!0,d=E,_=E.version,u=i.toneMapping),h.layers.enableAll(),C.unshift(h,h.geometry,h.material,0,0,null)):E&&E.isTexture&&(c===void 0&&(c=new he(new Zi(2,2),new xn({name:"BackgroundMaterial",uniforms:zs(Oi.background.uniforms),vertexShader:Oi.background.vertexShader,fragmentShader:Oi.background.fragmentShader,side:vs,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(c)),c.material.uniforms.t2D.value=E,c.material.uniforms.backgroundIntensity.value=D.backgroundIntensity,c.material.toneMapped=we.getTransfer(E.colorSpace)!==De,E.matrixAutoUpdate===!0&&E.updateMatrix(),c.material.uniforms.uvTransform.value.copy(E.matrix),(d!==E||_!==E.version||u!==i.toneMapping)&&(c.material.needsUpdate=!0,d=E,_=E.version,u=i.toneMapping),c.layers.enableAll(),C.unshift(c,c.geometry,c.material,0,0,null))}function v(C,D){C.getRGB(ic,Th(i)),e.buffers.color.setClear(ic.r,ic.g,ic.b,D,r)}function g(){h!==void 0&&(h.geometry.dispose(),h.material.dispose(),h=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return a},setClearColor:function(C,D=1){a.set(C),o=D,v(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(C){o=C,v(a,o)},render:S,addToRenderList:T,dispose:g}}function Dg(i,t){let e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=u(null),r=s,a=!1;function o(W,q,tt,k,it){let ct=!1,at=_(W,k,tt,q);r!==at&&(r=at,h(r.object)),ct=m(W,k,tt,it),ct&&S(W,k,tt,it),it!==null&&t.update(it,i.ELEMENT_ARRAY_BUFFER),(ct||a)&&(a=!1,E(W,q,tt,k),it!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(it).buffer))}function c(){return i.createVertexArray()}function h(W){return i.bindVertexArray(W)}function d(W){return i.deleteVertexArray(W)}function _(W,q,tt,k){let it=k.wireframe===!0,ct=n[q.id];ct===void 0&&(ct={},n[q.id]=ct);let at=W.isInstancedMesh===!0?W.id:0,J=ct[at];J===void 0&&(J={},ct[at]=J);let rt=J[tt.id];rt===void 0&&(rt={},J[tt.id]=rt);let mt=rt[it];return mt===void 0&&(mt=u(c()),rt[it]=mt),mt}function u(W){let q=[],tt=[],k=[];for(let it=0;it<e;it++)q[it]=0,tt[it]=0,k[it]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:q,enabledAttributes:tt,attributeDivisors:k,object:W,attributes:{},index:null}}function m(W,q,tt,k){let it=r.attributes,ct=q.attributes,at=0,J=tt.getAttributes();for(let rt in J)if(J[rt].location>=0){let yt=it[rt],$t=ct[rt];if($t===void 0&&(rt==="instanceMatrix"&&W.instanceMatrix&&($t=W.instanceMatrix),rt==="instanceColor"&&W.instanceColor&&($t=W.instanceColor)),yt===void 0||yt.attribute!==$t||$t&&yt.data!==$t.data)return!0;at++}return r.attributesNum!==at||r.index!==k}function S(W,q,tt,k){let it={},ct=q.attributes,at=0,J=tt.getAttributes();for(let rt in J)if(J[rt].location>=0){let yt=ct[rt];yt===void 0&&(rt==="instanceMatrix"&&W.instanceMatrix&&(yt=W.instanceMatrix),rt==="instanceColor"&&W.instanceColor&&(yt=W.instanceColor));let $t={};$t.attribute=yt,yt&&yt.data&&($t.data=yt.data),it[rt]=$t,at++}r.attributes=it,r.attributesNum=at,r.index=k}function T(){let W=r.newAttributes;for(let q=0,tt=W.length;q<tt;q++)W[q]=0}function v(W){g(W,0)}function g(W,q){let tt=r.newAttributes,k=r.enabledAttributes,it=r.attributeDivisors;tt[W]=1,k[W]===0&&(i.enableVertexAttribArray(W),k[W]=1),it[W]!==q&&(i.vertexAttribDivisor(W,q),it[W]=q)}function C(){let W=r.newAttributes,q=r.enabledAttributes;for(let tt=0,k=q.length;tt<k;tt++)q[tt]!==W[tt]&&(i.disableVertexAttribArray(tt),q[tt]=0)}function D(W,q,tt,k,it,ct,at){at===!0?i.vertexAttribIPointer(W,q,tt,it,ct):i.vertexAttribPointer(W,q,tt,k,it,ct)}function E(W,q,tt,k){T();let it=k.attributes,ct=tt.getAttributes(),at=q.defaultAttributeValues;for(let J in ct){let rt=ct[J];if(rt.location>=0){let mt=it[J];if(mt===void 0&&(J==="instanceMatrix"&&W.instanceMatrix&&(mt=W.instanceMatrix),J==="instanceColor"&&W.instanceColor&&(mt=W.instanceColor)),mt!==void 0){let yt=mt.normalized,$t=mt.itemSize,Wt=t.get(mt);if(Wt===void 0)continue;let Ae=Wt.buffer,_e=Wt.type,fe=Wt.bytesPerElement,ht=_e===i.INT||_e===i.UNSIGNED_INT||mt.gpuType===xl;if(mt.isInterleavedBufferAttribute){let gt=mt.data,St=gt.stride,Jt=mt.offset;if(gt.isInstancedInterleavedBuffer){for(let Ot=0;Ot<rt.locationSize;Ot++)g(rt.location+Ot,gt.meshPerAttribute);W.isInstancedMesh!==!0&&k._maxInstanceCount===void 0&&(k._maxInstanceCount=gt.meshPerAttribute*gt.count)}else for(let Ot=0;Ot<rt.locationSize;Ot++)v(rt.location+Ot);i.bindBuffer(i.ARRAY_BUFFER,Ae);for(let Ot=0;Ot<rt.locationSize;Ot++)D(rt.location+Ot,$t/rt.locationSize,_e,yt,St*fe,(Jt+$t/rt.locationSize*Ot)*fe,ht)}else{if(mt.isInstancedBufferAttribute){for(let gt=0;gt<rt.locationSize;gt++)g(rt.location+gt,mt.meshPerAttribute);W.isInstancedMesh!==!0&&k._maxInstanceCount===void 0&&(k._maxInstanceCount=mt.meshPerAttribute*mt.count)}else for(let gt=0;gt<rt.locationSize;gt++)v(rt.location+gt);i.bindBuffer(i.ARRAY_BUFFER,Ae);for(let gt=0;gt<rt.locationSize;gt++)D(rt.location+gt,$t/rt.locationSize,_e,yt,$t*fe,$t/rt.locationSize*gt*fe,ht)}}else if(at!==void 0){let yt=at[J];if(yt!==void 0)switch(yt.length){case 2:i.vertexAttrib2fv(rt.location,yt);break;case 3:i.vertexAttrib3fv(rt.location,yt);break;case 4:i.vertexAttrib4fv(rt.location,yt);break;default:i.vertexAttrib1fv(rt.location,yt)}}}}C()}function P(){I();for(let W in n){let q=n[W];for(let tt in q){let k=q[tt];for(let it in k){let ct=k[it];for(let at in ct)d(ct[at].object),delete ct[at];delete k[it]}}delete n[W]}}function R(W){if(n[W.id]===void 0)return;let q=n[W.id];for(let tt in q){let k=q[tt];for(let it in k){let ct=k[it];for(let at in ct)d(ct[at].object),delete ct[at];delete k[it]}}delete n[W.id]}function U(W){for(let q in n){let tt=n[q];for(let k in tt){let it=tt[k];if(it[W.id]===void 0)continue;let ct=it[W.id];for(let at in ct)d(ct[at].object),delete ct[at];delete it[W.id]}}}function y(W){for(let q in n){let tt=n[q],k=W.isInstancedMesh===!0?W.id:0,it=tt[k];if(it!==void 0){for(let ct in it){let at=it[ct];for(let J in at)d(at[J].object),delete at[J];delete it[ct]}delete tt[k],Object.keys(tt).length===0&&delete n[q]}}}function I(){O(),a=!0,r!==s&&(r=s,h(r.object))}function O(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:I,resetDefaultState:O,dispose:P,releaseStatesOfGeometry:R,releaseStatesOfObject:y,releaseStatesOfProgram:U,initAttributes:T,enableAttribute:v,disableUnusedAttributes:C}}function Ng(i,t,e){let n;function s(c){n=c}function r(c,h){i.drawArrays(n,c,h),e.update(h,n,1)}function a(c,h,d){d!==0&&(i.drawArraysInstanced(n,c,h,d),e.update(h,n,d))}function o(c,h,d){if(d===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,d);let u=0;for(let m=0;m<d;m++)u+=h[m];e.update(u,n,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function Ug(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){let U=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(U.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(U){return!(U!==fi&&n.convert(U)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(U){let y=U===Ai&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(U!==$n&&U!==Ti&&!y&&n.convert(U)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function c(U){if(U==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";U="mediump"}return U==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let h=e.precision!==void 0?e.precision:"highp",d=c(h);d!==h&&(Qt("WebGLRenderer:",h,"not supported, using",d,"instead."),h=d);let _=e.logarithmicDepthBuffer===!0,u=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control");e.reversedDepthBuffer===!0&&u===!1&&Qt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let m=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),S=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),T=i.getParameter(i.MAX_TEXTURE_SIZE),v=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),g=i.getParameter(i.MAX_VERTEX_ATTRIBS),C=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),D=i.getParameter(i.MAX_VARYING_VECTORS),E=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),P=i.getParameter(i.MAX_SAMPLES),R=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:a,textureTypeReadable:o,precision:h,logarithmicDepthBuffer:_,reversedDepthBuffer:u,maxTextures:m,maxVertexTextures:S,maxTextureSize:T,maxCubemapSize:v,maxAttributes:g,maxVertexUniforms:C,maxVaryings:D,maxFragmentUniforms:E,maxSamples:P,samples:R}}function Fg(i){let t=this,e=null,n=0,s=!1,r=!1,a=new xi,o=new ae,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(_,u){let m=_.length!==0||u||n!==0||s;return s=u,n=_.length,m},this.beginShadows=function(){r=!0,d(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(_,u){e=d(_,u,0)},this.setState=function(_,u,m){let S=_.clippingPlanes,T=_.clipIntersection,v=_.clipShadows,g=i.get(_);if(!s||S===null||S.length===0||r&&!v)r?d(null):h();else{let C=r?0:n,D=C*4,E=g.clippingState||null;c.value=E,E=d(S,u,D,m);for(let P=0;P!==D;++P)E[P]=e[P];g.clippingState=E,this.numIntersection=T?this.numPlanes:0,this.numPlanes+=C}};function h(){c.value!==e&&(c.value=e,c.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function d(_,u,m,S){let T=_!==null?_.length:0,v=null;if(T!==0){if(v=c.value,S!==!0||v===null){let g=m+T*4,C=u.matrixWorldInverse;o.getNormalMatrix(C),(v===null||v.length<g)&&(v=new Float32Array(g));for(let D=0,E=m;D!==T;++D,E+=4)a.copy(_[D]).applyMatrix4(C,o),a.normal.toArray(v,E),v[E+3]=a.constant}c.value=v,c.needsUpdate=!0}return t.numPlanes=T,t.numIntersection=0,v}}var Ir=4,Og=6,Bg=20,zg=256,Ia=new Ar,Bd=new jt,Nh=null,Uh=0,Fh=0,Oh=!1,kg=new N,ks=new N,rc=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,e=0,n=.1,s=100,r={}){let{size:a=256,position:o=kg}=r;Nh=this._renderer.getRenderTarget(),Uh=this._renderer.getActiveCubeFace(),Fh=this._renderer.getActiveMipmapLevel(),Oh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(t,n,s,c,o),e>0&&this._blur(c,0,0,e),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Vd(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=kd(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(Nh,Uh,Fh),this._renderer.xr.enabled=Oh,t.scissorTest=!1,Pr(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===Ms||t.mapping===Bs?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),Nh=this._renderer.getRenderTarget(),Uh=this._renderer.getActiveCubeFace(),Fh=this._renderer.getActiveMipmapLevel(),Oh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:Cn,minFilter:Cn,generateMipmaps:!1,type:Ai,format:fi,colorSpace:Qr,depthBuffer:!1},s=zd(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=zd(t,e,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=Vg(r)),this._blurMaterial=Hg(r,t,e),this._ggxMaterial=Gg(r,t,e)}return s}_compileMaterial(t){let e=new he(new Le,t);this._renderer.compile(e,Ia)}_sceneToCubeUV(t,e,n,s,r){let c=new Dn(90,1,e,n),h=[1,-1,1,1,1,1],d=[1,1,1,-1,-1,-1],_=this._renderer,u=_.autoClear,m=_.toneMapping;_.getClearColor(Bd),_.toneMapping=bi,_.autoClear=!1,_.state.buffers.depth.getReversed()&&(_.setRenderTarget(s),_.clearDepth(),_.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new he(new Si,new rn({name:"PMREM.Background",side:bn,depthWrite:!1,depthTest:!1})));let T=this._backgroundBox,v=T.material,g=!1,C=t.background;C?C.isColor&&(v.color.copy(C),t.background=null,g=!0):(v.color.copy(Bd),g=!0);for(let D=0;D<6;D++){let E=D%3;E===0?(c.up.set(0,h[D],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x+d[D],r.y,r.z)):E===1?(c.up.set(0,0,h[D]),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y+d[D],r.z)):(c.up.set(0,h[D],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y,r.z+d[D]));let P=this._cubeSize;Pr(s,E*P,D>2?P:0,P,P),_.setRenderTarget(s),g&&_.render(T,c),_.render(t,c)}_.toneMapping=m,_.autoClear=u,t.background=C}_textureToCubeUV(t,e){let n=this._renderer,s=t.mapping===Ms||t.mapping===Bs;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Vd()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=kd());let r=s?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;let o=r.uniforms;o.envMap.value=t;let c=this._cubeSize;Pr(e,0,0,3*c,2*c),n.setRenderTarget(e),n.render(a,Ia)}_applyPMREM(t){let e=this._renderer,n=e.autoClear;e.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(t,r-1,r);e.autoClear=n}_applyGGXFilter(t,e,n){let s=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let c=a.uniforms,h=n/(this._lodMeshes.length-1),d=e/(this._lodMeshes.length-1),_=Math.sqrt(h*h-d*d),u=h*1.25,m=_*u,{_lodMax:S}=this,T=this._sizeLods[n],v=3*T*(n>S-Ir?n-S+Ir:0),g=4*(this._cubeSize-T);c.envMap.value=t.texture,c.roughness.value=m,c.mipInt.value=S-e,Pr(r,v,g,3*T,2*T),s.setRenderTarget(r),s.render(o,Ia),c.envMap.value=r.texture,c.roughness.value=0,c.mipInt.value=S-n,Pr(t,v,g,3*T,2*T),s.setRenderTarget(t),s.render(o,Ia)}_blur(t,e,n,s){let r=this._pingPongRenderTarget,a=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(t,r,e,n,a),this._blurPass(r,t,n,n,a)}_blurPass(t,e,n,s,r){let a=this._renderer,o=this._blurMaterial,c=this._lodMeshes[s];c.material=o;let h=o.uniforms;h.envMap.value=t.texture,h.sigma.value=r,h.mipInt.value=this._lodMax-n;let d=this._sizeLods[s],_=3*d*(s>this._lodMax-Ir?s-this._lodMax+Ir:0),u=4*(this._cubeSize-d);Pr(e,_,u,3*d,2*d),a.setRenderTarget(e),a.render(c,Ia)}};function Vg(i){let t=[],e=[],n=i,s=i-Ir+1+Og;for(let r=0;r<s;r++){let a=Math.pow(2,n);t.push(a);let o=1/(a-2),c=-o,h=1+o,d=[c,c,h,c,h,h,c,c,h,h,c,h],_=6,u=6,m=3,S=new Float32Array(m*u*_),T=new Float32Array(m*u*_);for(let g=0;g<_;g++){let C=g%3*2/3-1,D=g>2?0:-1,E=[C,D,0,C+2/3,D,0,C+2/3,D+1,0,C,D,0,C+2/3,D+1,0,C,D+1,0];S.set(E,m*u*g);for(let P=0;P<u;P++){let R=d[P*2]*2-1,U=d[P*2+1]*2-1;g===0?ks.set(1,U,R):g===1?ks.set(-R,1,-U):g===2?ks.set(-R,U,1):g===3?ks.set(-1,U,-R):g===4?ks.set(-R,-1,U):ks.set(R,U,-1),ks.toArray(T,(g*u+P)*m)}}let v=new Le;v.setAttribute("position",new ii(S,m)),v.setAttribute("outputDirection",new ii(T,m)),e.push(new he(v,null)),n>Ir&&n--}return{lodMeshes:e,sizeLods:t}}function zd(i,t,e){let n=new Yn(i,t,e);return n.texture.mapping=ba,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Pr(i,t,e,n,s){i.viewport.set(t,e,n,s),i.scissor.set(t,e,n,s)}function Gg(i,t,e){return new xn({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:zg,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:lc(),fragmentShader:`

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
		`,blending:Ui,depthTest:!1,depthWrite:!1})}function Hg(i,t,e){return new xn({name:"SphericalGaussianBlur",defines:{SAMPLES:Bg,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:lc(),fragmentShader:`

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
		`,blending:Ui,depthTest:!1,depthWrite:!1})}function kd(){return new xn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:lc(),fragmentShader:`

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
		`,blending:Ui,depthTest:!1,depthWrite:!1})}function Vd(){return new xn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:lc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Ui,depthTest:!1,depthWrite:!1})}function lc(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var ac=class extends Yn{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new oa(s),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new Si(5,5,5),r=new xn({name:"CubemapFromEquirect",uniforms:zs(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:bn,blending:Ui});r.uniforms.tEquirect.value=e;let a=new he(s,r),o=e.minFilter;return e.minFilter===Ss&&(e.minFilter=Cn),new ul(1,10,this).update(t,a),e.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(t,e=!0,n=!0,s=!0){let r=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,n,s);t.setRenderTarget(r)}};function Wg(i){let t=new WeakMap,e=new WeakMap,n=null;function s(u,m=!1){return u==null?null:m?a(u):r(u)}function r(u){if(u&&u.isTexture){let m=u.mapping;if(m===ml||m===gl)if(t.has(u)){let S=t.get(u).texture;return o(S,u.mapping)}else{let S=u.image;if(S&&S.height>0){let T=new ac(S.height);return T.fromEquirectangularTexture(i,u),t.set(u,T),u.addEventListener("dispose",h),o(T.texture,u.mapping)}else return null}}return u}function a(u){if(u&&u.isTexture){let m=u.mapping,S=m===ml||m===gl,T=m===Ms||m===Bs;if(S||T){let v=e.get(u),g=v!==void 0?v.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==g)return n===null&&(n=new rc(i)),v=S?n.fromEquirectangular(u,v):n.fromCubemap(u,v),v.texture.pmremVersion=u.pmremVersion,e.set(u,v),v.texture;if(v!==void 0)return v.texture;{let C=u.image;return S&&C&&C.height>0||T&&C&&c(C)?(n===null&&(n=new rc(i)),v=S?n.fromEquirectangular(u):n.fromCubemap(u),v.texture.pmremVersion=u.pmremVersion,e.set(u,v),u.addEventListener("dispose",d),v.texture):null}}}return u}function o(u,m){return m===ml?u.mapping=Ms:m===gl&&(u.mapping=Bs),u}function c(u){let m=0,S=6;for(let T=0;T<S;T++)u[T]!==void 0&&m++;return m===S}function h(u){let m=u.target;m.removeEventListener("dispose",h);let S=t.get(m);S!==void 0&&(t.delete(m),S.dispose())}function d(u){let m=u.target;m.removeEventListener("dispose",d);let S=e.get(m);S!==void 0&&(e.delete(m),S.dispose())}function _(){t=new WeakMap,e=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:_}}function Xg(i){let t={};function e(n){if(t[n]!==void 0)return t[n];let s=i.getExtension(n);return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){let s=e(n);return s===null&&Is("WebGLRenderer: "+n+" extension not supported."),s}}}function qg(i,t,e,n){let s={},r=new WeakMap;function a(_){let u=_.target;u.index!==null&&t.remove(u.index);for(let S in u.attributes)t.remove(u.attributes[S]);u.removeEventListener("dispose",a),delete s[u.id];let m=r.get(u);m&&(t.remove(m),r.delete(u)),n.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,e.memory.geometries--}function o(_,u){return s[u.id]===!0||(u.addEventListener("dispose",a),s[u.id]=!0,e.memory.geometries++),u}function c(_){let u=_.attributes;for(let m in u)t.update(u[m],i.ARRAY_BUFFER)}function h(_){let u=[],m=_.index,S=_.attributes.position,T=0;if(S===void 0)return;if(m!==null){let C=m.array;T=m.version;for(let D=0,E=C.length;D<E;D+=3){let P=C[D+0],R=C[D+1],U=C[D+2];u.push(P,R,R,U,U,P)}}else{let C=S.array;T=S.version;for(let D=0,E=C.length/3-1;D<E;D+=3){let P=D+0,R=D+1,U=D+2;u.push(P,R,R,U,U,P)}}let v=new(S.count>=65535?ra:sa)(u,1);v.version=T;let g=r.get(_);g&&t.remove(g),r.set(_,v)}function d(_){let u=r.get(_);if(u){let m=_.index;m!==null&&u.version<m.version&&h(_)}else h(_);return r.get(_)}return{get:o,update:c,getWireframeAttribute:d}}function Yg(i,t,e){let n;function s(_){n=_}let r,a;function o(_){r=_.type,a=_.bytesPerElement}function c(_,u){i.drawElements(n,u,r,_*a),e.update(u,n,1)}function h(_,u,m){m!==0&&(i.drawElementsInstanced(n,u,r,_*a,m),e.update(u,n,m))}function d(_,u,m){if(m===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,u,0,r,_,0,m);let T=0;for(let v=0;v<m;v++)T+=u[v];e.update(T,n,1)}this.setMode=s,this.setIndex=o,this.render=c,this.renderInstances=h,this.renderMultiDraw=d}function Zg(i){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(e.calls++,a){case i.TRIANGLES:e.triangles+=o*(r/3);break;case i.LINES:e.lines+=o*(r/2);break;case i.LINE_STRIP:e.lines+=o*(r-1);break;case i.LINE_LOOP:e.lines+=o*r;break;case i.POINTS:e.points+=o*r;break;default:te("WebGLInfo: Unknown draw mode:",a);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function $g(i,t,e){let n=new WeakMap,s=new Je;function r(a,o,c){let h=a.morphTargetInfluences,d=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,_=d!==void 0?d.length:0,u=n.get(o);if(u===void 0||u.count!==_){let I=function(){U.dispose(),n.delete(o),o.removeEventListener("dispose",I)};u!==void 0&&u.texture.dispose();let m=o.morphAttributes.position!==void 0,S=o.morphAttributes.normal!==void 0,T=o.morphAttributes.color!==void 0,v=o.morphAttributes.position||[],g=o.morphAttributes.normal||[],C=o.morphAttributes.color||[],D=0;m===!0&&(D=1),S===!0&&(D=2),T===!0&&(D=3);let E=o.attributes.position.count*D,P=1;E>t.maxTextureSize&&(P=Math.ceil(E/t.maxTextureSize),E=t.maxTextureSize);let R=new Float32Array(E*P*4*_),U=new na(R,E,P,_);U.type=Ti,U.needsUpdate=!0;let y=D*4;for(let O=0;O<_;O++){let W=v[O],q=g[O],tt=C[O],k=E*P*4*O;for(let it=0;it<W.count;it++){let ct=it*y;m===!0&&(s.fromBufferAttribute(W,it),R[k+ct+0]=s.x,R[k+ct+1]=s.y,R[k+ct+2]=s.z,R[k+ct+3]=0),S===!0&&(s.fromBufferAttribute(q,it),R[k+ct+4]=s.x,R[k+ct+5]=s.y,R[k+ct+6]=s.z,R[k+ct+7]=0),T===!0&&(s.fromBufferAttribute(tt,it),R[k+ct+8]=s.x,R[k+ct+9]=s.y,R[k+ct+10]=s.z,R[k+ct+11]=tt.itemSize===4?s.w:1)}}u={count:_,texture:U,size:new Bt(E,P)},n.set(o,u),o.addEventListener("dispose",I)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)c.getUniforms().setValue(i,"morphTexture",a.morphTexture,e);else{let m=0;for(let T=0;T<h.length;T++)m+=h[T];let S=o.morphTargetsRelative?1:1-m;c.getUniforms().setValue(i,"morphTargetBaseInfluence",S),c.getUniforms().setValue(i,"morphTargetInfluences",h)}c.getUniforms().setValue(i,"morphTargetsTexture",u.texture,e),c.getUniforms().setValue(i,"morphTargetsTextureSize",u.size)}return{update:r}}function Jg(i,t,e,n,s){let r=new WeakMap;function a(h){let d=s.render.frame,_=h.geometry,u=t.get(h,_);if(r.get(u)!==d&&(t.update(u),r.set(u,d)),h.isInstancedMesh&&(h.hasEventListener("dispose",c)===!1&&h.addEventListener("dispose",c),r.get(h)!==d&&(e.update(h.instanceMatrix,i.ARRAY_BUFFER),h.instanceColor!==null&&e.update(h.instanceColor,i.ARRAY_BUFFER),r.set(h,d))),h.isSkinnedMesh){let m=h.skeleton;r.get(m)!==d&&(m.update(),r.set(m,d))}return u}function o(){r=new WeakMap}function c(h){let d=h.target;d.removeEventListener("dispose",c),n.releaseStatesOfObject(d),e.remove(d.instanceMatrix),d.instanceColor!==null&&e.remove(d.instanceColor)}return{update:a,dispose:o}}var Kg={[oh]:"LINEAR_TONE_MAPPING",[lh]:"REINHARD_TONE_MAPPING",[ch]:"CINEON_TONE_MAPPING",[hh]:"ACES_FILMIC_TONE_MAPPING",[dh]:"AGX_TONE_MAPPING",[fh]:"NEUTRAL_TONE_MAPPING",[uh]:"CUSTOM_TONE_MAPPING"};function jg(i,t,e,n,s,r){let a=new Yn(t,e,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,c=null,h=new Le;h.setAttribute("position",new ne([-1,3,0,-1,-1,0,3,-1,0],3)),h.setAttribute("uv",new ne([0,2,0,0,2,0],2));let d=new Ko({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),_=new he(h,d),u=new Ar(-1,1,1,-1,0,1),m=null,S=null,T=!1,v,g=null,C=[],D=!1;this.setSize=function(E,P){a.setSize(E,P),o!==null&&o.setSize(E,P),c!==null&&c.setSize(E,P);for(let R=0;R<C.length;R++){let U=C[R];U.setSize&&U.setSize(E,P)}},this.setEffects=function(E){C=E,D=C.length>0&&C[0].isRenderPass===!0;let P=a.width,R=a.height;C.length>0&&o===null&&(o=new Yn(P,R,{type:Ai,depthBuffer:!1,stencilBuffer:!1}),c=new Yn(P,R,{type:Ai,depthBuffer:!1,stencilBuffer:!1}));for(let U=0;U<C.length;U++){let y=C[U];y.setSize&&y.setSize(P,R)}},this.begin=function(E,P){if(T||E.toneMapping===bi&&C.length===0)return!1;if(g=P,P!==null){let R=P.width,U=P.height;(a.width!==R||a.height!==U)&&this.setSize(R,U)}return D===!1&&E.setRenderTarget(a),v=E.toneMapping,E.toneMapping=bi,!0},this.hasRenderPass=function(){return D},this.end=function(E,P){E.toneMapping=v,T=!0;let R=a,U=o;for(let y=0;y<C.length;y++){let I=C[y];I.enabled!==!1&&(I.render(E,U,R,P),I.needsSwap!==!1&&(R=U,U=U===o?c:o))}if(m!==E.outputColorSpace||S!==E.toneMapping){m=E.outputColorSpace,S=E.toneMapping,d.defines={},we.getTransfer(m)===De&&(d.defines.SRGB_TRANSFER="");let y=Kg[S];y&&(d.defines[y]=""),d.needsUpdate=!0}d.uniforms.tDiffuse.value=R.texture,E.setRenderTarget(g),E.render(_,u),g=null,T=!1},this.isCompositing=function(){return T},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),c!==null&&c.dispose(),h.dispose(),d.dispose()}}var lf=new Nn,kh=new hs(1,1),cf=new na,hf=new zo,uf=new oa,Gd=[],Hd=[],Wd=new Float32Array(16),Xd=new Float32Array(9),qd=new Float32Array(4);function Dr(i,t,e){let n=i[0];if(n<=0||n>0)return i;let s=t*e,r=Gd[s];if(r===void 0&&(r=new Float32Array(s),Gd[s]=r),t!==0){n.toArray(r,0);for(let a=1,o=0;a!==t;++a)o+=e,i[a].toArray(r,o)}return r}function vn(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function yn(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function cc(i,t){let e=Hd[t];e===void 0&&(e=new Int32Array(t),Hd[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function Qg(i,t){let e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function t_(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(vn(e,t))return;i.uniform2fv(this.addr,t),yn(e,t)}}function e_(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(vn(e,t))return;i.uniform3fv(this.addr,t),yn(e,t)}}function n_(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(vn(e,t))return;i.uniform4fv(this.addr,t),yn(e,t)}}function i_(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(vn(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),yn(e,t)}else{if(vn(e,n))return;qd.set(n),i.uniformMatrix2fv(this.addr,!1,qd),yn(e,n)}}function s_(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(vn(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),yn(e,t)}else{if(vn(e,n))return;Xd.set(n),i.uniformMatrix3fv(this.addr,!1,Xd),yn(e,n)}}function r_(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(vn(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),yn(e,t)}else{if(vn(e,n))return;Wd.set(n),i.uniformMatrix4fv(this.addr,!1,Wd),yn(e,n)}}function a_(i,t){let e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function o_(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(vn(e,t))return;i.uniform2iv(this.addr,t),yn(e,t)}}function l_(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(vn(e,t))return;i.uniform3iv(this.addr,t),yn(e,t)}}function c_(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(vn(e,t))return;i.uniform4iv(this.addr,t),yn(e,t)}}function h_(i,t){let e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function u_(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(vn(e,t))return;i.uniform2uiv(this.addr,t),yn(e,t)}}function d_(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(vn(e,t))return;i.uniform3uiv(this.addr,t),yn(e,t)}}function f_(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(vn(e,t))return;i.uniform4uiv(this.addr,t),yn(e,t)}}function p_(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(kh.compareFunction=e.isReversedDepthBuffer()?nc:ec,r=kh):r=lf,e.setTexture2D(t||r,s)}function m_(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||hf,s)}function g_(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTextureCube(t||uf,s)}function __(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||cf,s)}function x_(i){switch(i){case 5126:return Qg;case 35664:return t_;case 35665:return e_;case 35666:return n_;case 35674:return i_;case 35675:return s_;case 35676:return r_;case 5124:case 35670:return a_;case 35667:case 35671:return o_;case 35668:case 35672:return l_;case 35669:case 35673:return c_;case 5125:return h_;case 36294:return u_;case 36295:return d_;case 36296:return f_;case 35678:case 36198:case 36298:case 36306:case 35682:return p_;case 35679:case 36299:case 36307:return m_;case 35680:case 36300:case 36308:case 36293:return g_;case 36289:case 36303:case 36311:case 36292:return __}}function v_(i,t){i.uniform1fv(this.addr,t)}function y_(i,t){let e=Dr(t,this.size,2);i.uniform2fv(this.addr,e)}function M_(i,t){let e=Dr(t,this.size,3);i.uniform3fv(this.addr,e)}function S_(i,t){let e=Dr(t,this.size,4);i.uniform4fv(this.addr,e)}function b_(i,t){let e=Dr(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function w_(i,t){let e=Dr(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function T_(i,t){let e=Dr(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function A_(i,t){i.uniform1iv(this.addr,t)}function E_(i,t){i.uniform2iv(this.addr,t)}function C_(i,t){i.uniform3iv(this.addr,t)}function R_(i,t){i.uniform4iv(this.addr,t)}function P_(i,t){i.uniform1uiv(this.addr,t)}function I_(i,t){i.uniform2uiv(this.addr,t)}function L_(i,t){i.uniform3uiv(this.addr,t)}function D_(i,t){i.uniform4uiv(this.addr,t)}function N_(i,t,e){let n=this.cache,s=t.length,r=cc(e,s);vn(n,r)||(i.uniform1iv(this.addr,r),yn(n,r));let a;this.type===i.SAMPLER_2D_SHADOW?a=kh:a=lf;for(let o=0;o!==s;++o)e.setTexture2D(t[o]||a,r[o])}function U_(i,t,e){let n=this.cache,s=t.length,r=cc(e,s);vn(n,r)||(i.uniform1iv(this.addr,r),yn(n,r));for(let a=0;a!==s;++a)e.setTexture3D(t[a]||hf,r[a])}function F_(i,t,e){let n=this.cache,s=t.length,r=cc(e,s);vn(n,r)||(i.uniform1iv(this.addr,r),yn(n,r));for(let a=0;a!==s;++a)e.setTextureCube(t[a]||uf,r[a])}function O_(i,t,e){let n=this.cache,s=t.length,r=cc(e,s);vn(n,r)||(i.uniform1iv(this.addr,r),yn(n,r));for(let a=0;a!==s;++a)e.setTexture2DArray(t[a]||cf,r[a])}function B_(i){switch(i){case 5126:return v_;case 35664:return y_;case 35665:return M_;case 35666:return S_;case 35674:return b_;case 35675:return w_;case 35676:return T_;case 5124:case 35670:return A_;case 35667:case 35671:return E_;case 35668:case 35672:return C_;case 35669:case 35673:return R_;case 5125:return P_;case 36294:return I_;case 36295:return L_;case 36296:return D_;case 35678:case 36198:case 36298:case 36306:case 35682:return N_;case 35679:case 36299:case 36307:return U_;case 35680:case 36300:case 36308:case 36293:return F_;case 36289:case 36303:case 36311:case 36292:return O_}}var Vh=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=x_(e.type)}},Gh=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=B_(e.type)}},Hh=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(t,e[o.id],n)}}},Bh=/(\w+)(\])?(\[|\.)?/g;function Yd(i,t){i.seq.push(t),i.map[t.id]=t}function z_(i,t,e){let n=i.name,s=n.length;for(Bh.lastIndex=0;;){let r=Bh.exec(n),a=Bh.lastIndex,o=r[1],c=r[2]==="]",h=r[3];if(c&&(o=o|0),h===void 0||h==="["&&a+2===s){Yd(e,h===void 0?new Vh(o,i,t):new Gh(o,i,t));break}else{let _=e.map[o];_===void 0&&(_=new Hh(o),Yd(e,_)),e=_}}}var Lr=class{constructor(t,e){this.seq=[],this.map={};let n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){let o=t.getActiveUniform(e,a),c=t.getUniformLocation(e,o.name);z_(o,c,this)}let s=[],r=[];for(let a of this.seq)a.type===t.SAMPLER_2D_SHADOW||a.type===t.SAMPLER_CUBE_SHADOW||a.type===t.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(t,e,n,s){let r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){let s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,a=e.length;r!==a;++r){let o=e[r],c=n[o.id];c.needsUpdate!==!1&&o.setValue(t,c.value,s)}}static seqWithValue(t,e){let n=[];for(let s=0,r=t.length;s!==r;++s){let a=t[s];a.id in e&&n.push(a)}return n}};function Zd(i,t,e){let n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}var k_=37297,V_=0;function G_(i,t){let e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let a=s;a<r;a++){let o=a+1;n.push(`${o===t?">":" "} ${o}: ${e[a]}`)}return n.join(`
`)}var $d=new ae;function H_(i){we._getMatrix($d,we.workingColorSpace,i);let t=`mat3( ${$d.elements.map(e=>e.toFixed(4))} )`;switch(we.getTransfer(i)){case ta:return[t,"LinearTransferOETF"];case De:return[t,"sRGBTransferOETF"];default:return Qt("WebGLProgram: Unsupported color space: ",i),[t,"LinearTransferOETF"]}}function Jd(i,t,e){let n=i.getShaderParameter(t,i.COMPILE_STATUS),r=(i.getShaderInfoLog(t)||"").trim();if(n&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return e.toUpperCase()+`

`+r+`

`+G_(i.getShaderSource(t),o)}else return r}function W_(i,t){let e=H_(t);return[`vec4 ${i}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}var X_={[oh]:"Linear",[lh]:"Reinhard",[ch]:"Cineon",[hh]:"ACESFilmic",[dh]:"AgX",[fh]:"Neutral",[uh]:"Custom"};function q_(i,t){let e=X_[t];return e===void 0?(Qt("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var sc=new N;function Y_(){we.getLuminanceCoefficients(sc);let i=sc.x.toFixed(4),t=sc.y.toFixed(4),e=sc.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Z_(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Da).join(`
`)}function $_(i){let t=[];for(let e in i){let n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function J_(i,t){let e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(t,s),a=r.name,o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),e[a]={type:r.type,location:i.getAttribLocation(t,a),locationSize:o}}return e}function Da(i){return i!==""}function Kd(i,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function jd(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var K_=/^[ \t]*#include +<([\w\d./]+)>/gm;function Wh(i){return i.replace(K_,Q_)}var j_=new Map;function Q_(i,t){let e=ge[t];if(e===void 0){let n=j_.get(t);if(n!==void 0)e=ge[n],Qt('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return Wh(e)}var tx=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Qd(i){return i.replace(tx,ex)}function ex(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function tf(i){let t=`precision ${i.precision} float;
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
#define LOW_PRECISION`),t}var nx={[Sa]:"SHADOWMAP_TYPE_PCF",[Er]:"SHADOWMAP_TYPE_VSM"};function ix(i){return nx[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var sx={[Ms]:"ENVMAP_TYPE_CUBE",[Bs]:"ENVMAP_TYPE_CUBE",[ba]:"ENVMAP_TYPE_CUBE_UV"};function rx(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":sx[i.envMapMode]||"ENVMAP_TYPE_CUBE"}var ax={[Bs]:"ENVMAP_MODE_REFRACTION"};function ox(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":ax[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var lx={[pl]:"ENVMAP_BLENDING_MULTIPLY",[_d]:"ENVMAP_BLENDING_MIX",[xd]:"ENVMAP_BLENDING_ADD"};function cx(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":lx[i.combine]||"ENVMAP_BLENDING_NONE"}function hx(i){let t=i.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:n,maxMip:e}}function ux(i,t,e,n){let s=i.getContext(),r=e.defines,a=e.vertexShader,o=e.fragmentShader,c=ix(e),h=rx(e),d=ox(e),_=cx(e),u=hx(e),m=Z_(e),S=$_(r),T=s.createProgram(),v,g,C=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(v=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,S].filter(Da).join(`
`),v.length>0&&(v+=`
`),g=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,S].filter(Da).join(`
`),g.length>0&&(g+=`
`)):(v=[tf(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,S,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+d:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Da).join(`
`),g=[tf(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,S,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.envMap?"#define "+d:"",e.envMap?"#define "+_:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.retroreflection?"#define USE_RETROREFLECTION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==bi?"#define TONE_MAPPING":"",e.toneMapping!==bi?ge.tonemapping_pars_fragment:"",e.toneMapping!==bi?q_("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",ge.colorspace_pars_fragment,W_("linearToOutputTexel",e.outputColorSpace),Y_(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Da).join(`
`)),a=Wh(a),a=Kd(a,e),a=jd(a,e),o=Wh(o),o=Kd(o,e),o=jd(o,e),a=Qd(a),o=Qd(o),e.isRawShaderMaterial!==!0&&(C=`#version 300 es
`,v=[m,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+v,g=["#define varying in",e.glslVersion===bh?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===bh?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+g);let D=C+v+a,E=C+g+o,P=Zd(s,s.VERTEX_SHADER,D),R=Zd(s,s.FRAGMENT_SHADER,E);s.attachShader(T,P),s.attachShader(T,R),e.index0AttributeName!==void 0?s.bindAttribLocation(T,0,e.index0AttributeName):e.hasPositionAttribute===!0&&s.bindAttribLocation(T,0,"position"),s.linkProgram(T);function U(W){if(i.debug.checkShaderErrors){let q=s.getProgramInfoLog(T)||"",tt=s.getShaderInfoLog(P)||"",k=s.getShaderInfoLog(R)||"",it=q.trim(),ct=tt.trim(),at=k.trim(),J=!0,rt=!0;if(s.getProgramParameter(T,s.LINK_STATUS)===!1)if(J=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,T,P,R);else{let mt=Jd(s,P,"vertex"),yt=Jd(s,R,"fragment");te("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(T,s.VALIDATE_STATUS)+`

Material Name: `+W.name+`
Material Type: `+W.type+`

Program Info Log: `+it+`
`+mt+`
`+yt)}else it!==""?Qt("WebGLProgram: Program Info Log:",it):(ct===""||at==="")&&(rt=!1);rt&&(W.diagnostics={runnable:J,programLog:it,vertexShader:{log:ct,prefix:v},fragmentShader:{log:at,prefix:g}})}s.deleteShader(P),s.deleteShader(R),y=new Lr(s,T),I=J_(s,T)}let y;this.getUniforms=function(){return y===void 0&&U(this),y};let I;this.getAttributes=function(){return I===void 0&&U(this),I};let O=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return O===!1&&(O=s.getProgramParameter(T,k_)),O},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(T),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=V_++,this.cacheKey=t,this.usedTimes=1,this.program=T,this.vertexShader=P,this.fragmentShader=R,this}var dx=0,Xh=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,n){let s=this._getShaderCacheForMaterial(t);return s.has(e)===!1&&(s.add(e),e.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){let e=this.shaderCache,n=e.get(t);return n===void 0&&(n=new qh(t),e.set(t,n)),n}},qh=class{constructor(t){this.id=dx++,this.code=t,this.usedTimes=0}};function fx(i){return i===ws||i===Ra||i===Pa}function px(i,t,e,n,s,r){let a=new vr,o=new Xh,c=new Set,h=[],d=new Map,_=n.logarithmicDepthBuffer,u=n.precision,m={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function S(y){return c.add(y),y===0?"uv":`uv${y}`}function T(y,I,O,W,q,tt){let k=W.fog,it=q.geometry,ct=y.isMeshStandardMaterial||y.isMeshLambertMaterial||y.isMeshPhongMaterial?W.environment:null,at=y.isMeshStandardMaterial||y.isMeshLambertMaterial&&!y.envMap||y.isMeshPhongMaterial&&!y.envMap,J=t.get(y.envMap||ct,at),rt=J&&J.mapping===ba?J.image.height:null,mt=m[y.type];y.precision!==null&&(u=n.getMaxPrecision(y.precision),u!==y.precision&&Qt("WebGLProgram.getParameters:",y.precision,"not supported, using",u,"instead."));let yt=it.morphAttributes.position||it.morphAttributes.normal||it.morphAttributes.color,$t=yt!==void 0?yt.length:0,Wt=0;it.morphAttributes.position!==void 0&&(Wt=1),it.morphAttributes.normal!==void 0&&(Wt=2),it.morphAttributes.color!==void 0&&(Wt=3);let Ae,_e,fe,ht;if(mt){let Fe=Oi[mt];Ae=Fe.vertexShader,_e=Fe.fragmentShader}else{Ae=y.vertexShader,_e=y.fragmentShader;let Fe=o.getVertexShaderStage(y),Ce=o.getFragmentShaderStage(y);o.update(y,Fe,Ce),fe=Fe.id,ht=Ce.id}let gt=i.getRenderTarget(),St=i.state.buffers.depth.getReversed(),Jt=q.isInstancedMesh===!0,Ot=q.isBatchedMesh===!0,ie=!!y.map,Kt=!!y.matcap,oe=!!J,ye=!!y.aoMap,ce=!!y.lightMap,ue=!!y.bumpMap&&y.wireframe===!1,Ge=!!y.normalMap,ln=!!y.displacementMap,wn=!!y.emissiveMap,Ue=!!y.metalnessMap,Ze=!!y.roughnessMap,B=y.anisotropy>0,cn=y.clearcoat>0,ve=y.dispersion>0,L=y.retroreflectivity>0,b=y.iridescence>0,Y=y.sheen>0,K=y.transmission>0,ot=B&&!!y.anisotropyMap,Mt=cn&&!!y.clearcoatMap,Tt=cn&&!!y.clearcoatNormalMap,ut=cn&&!!y.clearcoatRoughnessMap,pt=b&&!!y.iridescenceMap,Ct=b&&!!y.iridescenceThicknessMap,zt=Y&&!!y.sheenColorMap,At=Y&&!!y.sheenRoughnessMap,Et=!!y.specularMap,Xt=!!y.specularColorMap,Zt=!!y.specularIntensityMap,se=K&&!!y.transmissionMap,V=K&&!!y.thicknessMap,bt=!!y.gradientMap,ft=!!y.alphaMap,Rt=y.alphaTest>0,Dt=!!y.alphaHash,vt=!!y.extensions,qt=bi;y.toneMapped&&(gt===null||gt.isXRRenderTarget===!0)&&(qt=i.toneMapping);let Ht={shaderID:mt,shaderType:y.type,shaderName:y.name,vertexShader:Ae,fragmentShader:_e,defines:y.defines,customVertexShaderID:fe,customFragmentShaderID:ht,isRawShaderMaterial:y.isRawShaderMaterial===!0,glslVersion:y.glslVersion,precision:u,batching:Ot,batchingColor:Ot&&q._colorsTexture!==null,instancing:Jt,instancingColor:Jt&&q.instanceColor!==null,instancingMorph:Jt&&q.morphTexture!==null,outputColorSpace:gt===null?i.outputColorSpace:gt.isXRRenderTarget===!0?gt.texture.colorSpace:we.workingColorSpace,alphaToCoverage:!!y.alphaToCoverage,map:ie,matcap:Kt,envMap:oe,envMapMode:oe&&J.mapping,envMapCubeUVHeight:rt,aoMap:ye,lightMap:ce,bumpMap:ue,normalMap:Ge,displacementMap:ln,emissiveMap:wn,normalMapObjectSpace:Ge&&y.normalMapType===Md,normalMapTangentSpace:Ge&&y.normalMapType===tc,packedNormalMap:Ge&&y.normalMapType===tc&&fx(y.normalMap.format),metalnessMap:Ue,roughnessMap:Ze,anisotropy:B,anisotropyMap:ot,clearcoat:cn,clearcoatMap:Mt,clearcoatNormalMap:Tt,clearcoatRoughnessMap:ut,dispersion:ve,retroreflection:L,iridescence:b,iridescenceMap:pt,iridescenceThicknessMap:Ct,sheen:Y,sheenColorMap:zt,sheenRoughnessMap:At,specularMap:Et,specularColorMap:Xt,specularIntensityMap:Zt,transmission:K,transmissionMap:se,thicknessMap:V,gradientMap:bt,opaque:y.transparent===!1&&y.blending===ys&&y.alphaToCoverage===!1,alphaMap:ft,alphaTest:Rt,alphaHash:Dt,combine:y.combine,mapUv:ie&&S(y.map.channel),aoMapUv:ye&&S(y.aoMap.channel),lightMapUv:ce&&S(y.lightMap.channel),bumpMapUv:ue&&S(y.bumpMap.channel),normalMapUv:Ge&&S(y.normalMap.channel),displacementMapUv:ln&&S(y.displacementMap.channel),emissiveMapUv:wn&&S(y.emissiveMap.channel),metalnessMapUv:Ue&&S(y.metalnessMap.channel),roughnessMapUv:Ze&&S(y.roughnessMap.channel),anisotropyMapUv:ot&&S(y.anisotropyMap.channel),clearcoatMapUv:Mt&&S(y.clearcoatMap.channel),clearcoatNormalMapUv:Tt&&S(y.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:ut&&S(y.clearcoatRoughnessMap.channel),iridescenceMapUv:pt&&S(y.iridescenceMap.channel),iridescenceThicknessMapUv:Ct&&S(y.iridescenceThicknessMap.channel),sheenColorMapUv:zt&&S(y.sheenColorMap.channel),sheenRoughnessMapUv:At&&S(y.sheenRoughnessMap.channel),specularMapUv:Et&&S(y.specularMap.channel),specularColorMapUv:Xt&&S(y.specularColorMap.channel),specularIntensityMapUv:Zt&&S(y.specularIntensityMap.channel),transmissionMapUv:se&&S(y.transmissionMap.channel),thicknessMapUv:V&&S(y.thicknessMap.channel),alphaMapUv:ft&&S(y.alphaMap.channel),vertexTangents:!!it.attributes.tangent&&(Ge||B),vertexNormals:!!it.attributes.normal,vertexColors:y.vertexColors,vertexAlphas:y.vertexColors===!0&&!!it.attributes.color&&it.attributes.color.itemSize===4,pointsUvs:q.isPoints===!0&&!!it.attributes.uv&&(ie||ft),fog:!!k,useFog:y.fog===!0,fogExp2:!!k&&k.isFogExp2,flatShading:y.wireframe===!1&&(y.flatShading===!0||it.attributes.normal===void 0&&Ge===!1&&(y.isMeshLambertMaterial||y.isMeshPhongMaterial||y.isMeshStandardMaterial||y.isMeshPhysicalMaterial)),sizeAttenuation:y.sizeAttenuation===!0,logarithmicDepthBuffer:_,reversedDepthBuffer:St,skinning:q.isSkinnedMesh===!0,hasPositionAttribute:it.attributes.position!==void 0,morphTargets:it.morphAttributes.position!==void 0,morphNormals:it.morphAttributes.normal!==void 0,morphColors:it.morphAttributes.color!==void 0,morphTargetsCount:$t,morphTextureStride:Wt,numSunLights:I.sun.length,numDirLights:I.directional.length,numPointLights:I.point.length,numSpotLights:I.spot.length,numSpotLightMaps:I.spotLightMap.length,numRectAreaLights:I.rectArea.length,numHemiLights:I.hemi.length,numSunLightShadows:I.sunShadowMap.length,numDirLightShadows:I.directionalShadowMap.length,numPointLightShadows:I.pointShadowMap.length,numSpotLightShadows:I.spotShadowMap.length,numSpotLightShadowsWithMaps:I.numSpotLightShadowsWithMaps,numLightProbes:I.numLightProbes,numLightProbeGrids:tt.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:y.dithering,shadowMapEnabled:i.shadowMap.enabled&&O.length>0,shadowMapType:i.shadowMap.type,toneMapping:qt,decodeVideoTexture:ie&&y.map.isVideoTexture===!0&&we.getTransfer(y.map.colorSpace)===De,decodeVideoTextureEmissive:wn&&y.emissiveMap.isVideoTexture===!0&&we.getTransfer(y.emissiveMap.colorSpace)===De,premultipliedAlpha:y.premultipliedAlpha,doubleSided:y.side===Zn,flipSided:y.side===bn,useDepthPacking:y.depthPacking>=0,depthPacking:y.depthPacking||0,index0AttributeName:y.index0AttributeName,extensionClipCullDistance:vt&&y.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(vt&&y.extensions.multiDraw===!0||Ot)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:y.customProgramCacheKey()};return Ht.vertexUv1s=c.has(1),Ht.vertexUv2s=c.has(2),Ht.vertexUv3s=c.has(3),c.clear(),Ht}function v(y){let I=[];if(y.shaderID?I.push(y.shaderID):(I.push(y.customVertexShaderID),I.push(y.customFragmentShaderID)),y.defines!==void 0)for(let O in y.defines)I.push(O),I.push(y.defines[O]);return y.isRawShaderMaterial===!1&&(g(I,y),C(I,y),I.push(i.outputColorSpace)),I.push(y.customProgramCacheKey),I.join()}function g(y,I){y.push(I.precision),y.push(I.outputColorSpace),y.push(I.envMapMode),y.push(I.envMapCubeUVHeight),y.push(I.mapUv),y.push(I.alphaMapUv),y.push(I.lightMapUv),y.push(I.aoMapUv),y.push(I.bumpMapUv),y.push(I.normalMapUv),y.push(I.displacementMapUv),y.push(I.emissiveMapUv),y.push(I.metalnessMapUv),y.push(I.roughnessMapUv),y.push(I.anisotropyMapUv),y.push(I.clearcoatMapUv),y.push(I.clearcoatNormalMapUv),y.push(I.clearcoatRoughnessMapUv),y.push(I.iridescenceMapUv),y.push(I.iridescenceThicknessMapUv),y.push(I.sheenColorMapUv),y.push(I.sheenRoughnessMapUv),y.push(I.specularMapUv),y.push(I.specularColorMapUv),y.push(I.specularIntensityMapUv),y.push(I.transmissionMapUv),y.push(I.thicknessMapUv),y.push(I.combine),y.push(I.fogExp2),y.push(I.sizeAttenuation),y.push(I.morphTargetsCount),y.push(I.morphAttributeCount),y.push(I.numSunLights),y.push(I.numDirLights),y.push(I.numPointLights),y.push(I.numSpotLights),y.push(I.numSpotLightMaps),y.push(I.numHemiLights),y.push(I.numRectAreaLights),y.push(I.numSunLightShadows),y.push(I.numDirLightShadows),y.push(I.numPointLightShadows),y.push(I.numSpotLightShadows),y.push(I.numSpotLightShadowsWithMaps),y.push(I.numLightProbes),y.push(I.shadowMapType),y.push(I.toneMapping),y.push(I.numClippingPlanes),y.push(I.numClipIntersection),y.push(I.depthPacking)}function C(y,I){a.disableAll(),I.instancing&&a.enable(0),I.instancingColor&&a.enable(1),I.instancingMorph&&a.enable(2),I.matcap&&a.enable(3),I.envMap&&a.enable(4),I.normalMapObjectSpace&&a.enable(5),I.normalMapTangentSpace&&a.enable(6),I.clearcoat&&a.enable(7),I.iridescence&&a.enable(8),I.alphaTest&&a.enable(9),I.vertexColors&&a.enable(10),I.vertexAlphas&&a.enable(11),I.vertexUv1s&&a.enable(12),I.vertexUv2s&&a.enable(13),I.vertexUv3s&&a.enable(14),I.vertexTangents&&a.enable(15),I.anisotropy&&a.enable(16),I.alphaHash&&a.enable(17),I.batching&&a.enable(18),I.dispersion&&a.enable(19),I.retroreflection&&a.enable(24),I.batchingColor&&a.enable(20),I.gradientMap&&a.enable(21),I.packedNormalMap&&a.enable(22),I.vertexNormals&&a.enable(23),y.push(a.mask),a.disableAll(),I.fog&&a.enable(0),I.useFog&&a.enable(1),I.flatShading&&a.enable(2),I.logarithmicDepthBuffer&&a.enable(3),I.reversedDepthBuffer&&a.enable(4),I.skinning&&a.enable(5),I.morphTargets&&a.enable(6),I.morphNormals&&a.enable(7),I.morphColors&&a.enable(8),I.premultipliedAlpha&&a.enable(9),I.shadowMapEnabled&&a.enable(10),I.doubleSided&&a.enable(11),I.flipSided&&a.enable(12),I.useDepthPacking&&a.enable(13),I.dithering&&a.enable(14),I.transmission&&a.enable(15),I.sheen&&a.enable(16),I.opaque&&a.enable(17),I.pointsUvs&&a.enable(18),I.decodeVideoTexture&&a.enable(19),I.decodeVideoTextureEmissive&&a.enable(20),I.alphaToCoverage&&a.enable(21),I.numLightProbeGrids>0&&a.enable(22),I.hasPositionAttribute&&a.enable(23),y.push(a.mask)}function D(y){let I=m[y.type],O;if(I){let W=Oi[I];O=Ud.clone(W.uniforms)}else O=y.uniforms;return O}function E(y,I){let O=d.get(I);return O!==void 0?++O.usedTimes:(O=new ux(i,I,y,s),h.push(O),d.set(I,O)),O}function P(y){if(--y.usedTimes===0){let I=h.indexOf(y);h[I]=h[h.length-1],h.pop(),d.delete(y.cacheKey),y.destroy()}}function R(y){o.remove(y)}function U(){o.dispose()}return{getParameters:T,getProgramCacheKey:v,getUniforms:D,acquireProgram:E,releaseProgram:P,releaseShaderCache:R,programs:h,dispose:U}}function mx(){let i=new WeakMap;function t(a){return i.has(a)}function e(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,c){i.get(a)[o]=c}function r(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:r}}function gx(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.materialVariant!==t.materialVariant?i.materialVariant-t.materialVariant:i.z!==t.z?i.z-t.z:i.id-t.id}function ef(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function nf(){let i=[],t=0,e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function a(u){let m=0;return u.isInstancedMesh&&(m+=2),u.isSkinnedMesh&&(m+=1),m}function o(u,m,S,T,v,g){let C=i[t];return C===void 0?(C={id:u.id,object:u,geometry:m,material:S,materialVariant:a(u),groupOrder:T,renderOrder:u.renderOrder,z:v,group:g},i[t]=C):(C.id=u.id,C.object=u,C.geometry=m,C.material=S,C.materialVariant=a(u),C.groupOrder=T,C.renderOrder=u.renderOrder,C.z=v,C.group=g),t++,C}function c(u,m,S,T,v,g,C){C.reversedDepth===!0&&(v=-v);let D=o(u,m,S,T,v,g);S.transmission>0?n.push(D):S.transparent===!0?s.push(D):e.push(D)}function h(u,m,S,T,v,g){let C=o(u,m,S,T,v,g);S.transmission>0?n.unshift(C):S.transparent===!0?s.unshift(C):e.unshift(C)}function d(u,m){e.length>1&&e.sort(u||gx),n.length>1&&n.sort(m||ef),s.length>1&&s.sort(m||ef)}function _(){for(let u=t,m=i.length;u<m;u++){let S=i[u];if(S.id===null)break;S.id=null,S.object=null,S.geometry=null,S.material=null,S.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:c,unshift:h,finish:_,sort:d}}function _x(){let i=new WeakMap;function t(n,s){let r=i.get(n),a;return r===void 0?(a=new nf,i.set(n,[a])):s>=r.length?(a=new nf,r.push(a)):a=r[s],a}function e(){i=new WeakMap}return{get:t,dispose:e}}function xx(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={direction:new N,color:new jt};break;case"SpotLight":e={position:new N,direction:new N,color:new jt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new N,color:new jt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new N,skyColor:new jt,groundColor:new jt};break;case"RectAreaLight":e={color:new jt,position:new N,halfWidth:new N,halfHeight:new N};break}return i[t.id]=e,e}}}function vx(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Bt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Bt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Bt,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}var yx=0;function Mx(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function Sx(i){let t=new xx,e=vx(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let h=0;h<9;h++)n.probe.push(new N);let s=new N,r=new ze,a=new ze;function o(h){let d=0,_=0,u=0;for(let q=0;q<9;q++)n.probe[q].set(0,0,0);let m=0,S=0,T=0,v=0,g=0,C=0,D=0,E=0,P=0,R=0,U=0,y=0,I=0,O=0;h.sort(Mx);for(let q=0,tt=h.length;q<tt;q++){let k=h[q],it=k.color,ct=k.intensity,at=k.distance,J=null;if(k.shadow&&k.shadow.map&&(k.shadow.map.texture.format===ws?J=k.shadow.map.texture:J=k.shadow.map.depthTexture||k.shadow.map.texture),k.isAmbientLight)d+=it.r*ct,_+=it.g*ct,u+=it.b*ct;else if(k.isLightProbe){for(let rt=0;rt<9;rt++)n.probe[rt].addScaledVector(k.sh.coefficients[rt],ct);O++}else if(k.isSunLight){let rt=t.get(k);if(rt.color.copy(k.color).multiplyScalar(k.intensity),k.castShadow){let mt=k.shadow,yt=e.get(k);yt.shadowIntensity=mt.intensity,yt.shadowBias=mt.bias,yt.shadowNormalBias=mt.normalBias,yt.shadowRadius=mt.radius,yt.shadowMapSize.copy(mt.mapSize).multiply(mt.getFrameExtents()),n.sunShadow[S]=yt,n.sunShadowMap[S]=J;let $t=mt.getViewportCount();for(let Wt=0;Wt<$t;Wt++)n.sunShadowMatrix[T+Wt]=mt.getMatrix(Wt),n.sunShadowCascade[T+Wt]=mt._cascadeData[Wt];T+=$t,S++}n.sun[m]=rt,m++}else if(k.isDirectionalLight){let rt=t.get(k);if(rt.color.copy(k.color).multiplyScalar(k.intensity),k.castShadow){let mt=k.shadow,yt=e.get(k);yt.shadowIntensity=mt.intensity,yt.shadowBias=mt.bias,yt.shadowNormalBias=mt.normalBias,yt.shadowRadius=mt.radius,yt.shadowMapSize=mt.mapSize,n.directionalShadow[v]=yt,n.directionalShadowMap[v]=J,n.directionalShadowMatrix[v]=k.shadow.matrix,P++}n.directional[v]=rt,v++}else if(k.isSpotLight){let rt=t.get(k);rt.position.setFromMatrixPosition(k.matrixWorld),rt.color.copy(it).multiplyScalar(ct),rt.distance=at,rt.coneCos=Math.cos(k.angle),rt.penumbraCos=Math.cos(k.angle*(1-k.penumbra)),rt.decay=k.decay,n.spot[C]=rt;let mt=k.shadow;if(k.map&&(n.spotLightMap[y]=k.map,y++,mt.updateMatrices(k),k.castShadow&&I++),n.spotLightMatrix[C]=mt.matrix,k.castShadow){let yt=e.get(k);yt.shadowIntensity=mt.intensity,yt.shadowBias=mt.bias,yt.shadowNormalBias=mt.normalBias,yt.shadowRadius=mt.radius,yt.shadowMapSize=mt.mapSize,n.spotShadow[C]=yt,n.spotShadowMap[C]=J,U++}C++}else if(k.isRectAreaLight){let rt=t.get(k);rt.color.copy(it).multiplyScalar(ct),rt.halfWidth.set(k.width*.5,0,0),rt.halfHeight.set(0,k.height*.5,0),n.rectArea[D]=rt,D++}else if(k.isPointLight){let rt=t.get(k);if(rt.color.copy(k.color).multiplyScalar(k.intensity),rt.distance=k.distance,rt.decay=k.decay,k.castShadow){let mt=k.shadow,yt=e.get(k);yt.shadowIntensity=mt.intensity,yt.shadowBias=mt.bias,yt.shadowNormalBias=mt.normalBias,yt.shadowRadius=mt.radius,yt.shadowMapSize=mt.mapSize,yt.shadowCameraNear=mt.camera.near,yt.shadowCameraFar=mt.camera.far,n.pointShadow[g]=yt,n.pointShadowMap[g]=J,n.pointShadowMatrix[g]=k.shadow.matrix,R++}n.point[g]=rt,g++}else if(k.isHemisphereLight){let rt=t.get(k);rt.skyColor.copy(k.color).multiplyScalar(ct),rt.groundColor.copy(k.groundColor).multiplyScalar(ct),n.hemi[E]=rt,E++}}D>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=Lt.LTC_FLOAT_1,n.rectAreaLTC2=Lt.LTC_FLOAT_2):(n.rectAreaLTC1=Lt.LTC_HALF_1,n.rectAreaLTC2=Lt.LTC_HALF_2)),n.ambient[0]=d,n.ambient[1]=_,n.ambient[2]=u;let W=n.hash;(W.sunLength!==m||W.directionalLength!==v||W.pointLength!==g||W.spotLength!==C||W.rectAreaLength!==D||W.hemiLength!==E||W.numSunShadows!==S||W.numDirectionalShadows!==P||W.numPointShadows!==R||W.numSpotShadows!==U||W.numSpotMaps!==y||W.numLightProbes!==O)&&(n.sun.length=m,n.directional.length=v,n.spot.length=C,n.rectArea.length=D,n.point.length=g,n.hemi.length=E,n.sunShadow.length=S,n.sunShadowMap.length=S,n.sunShadowMatrix.length=T,n.sunShadowCascade.length=T,n.directionalShadow.length=P,n.directionalShadowMap.length=P,n.directionalShadowMatrix.length=P,n.pointShadow.length=R,n.pointShadowMap.length=R,n.pointShadowMatrix.length=R,n.spotShadow.length=U,n.spotShadowMap.length=U,n.spotLightMatrix.length=U+y-I,n.spotLightMap.length=y,n.numSpotLightShadowsWithMaps=I,n.numLightProbes=O,W.sunLength=m,W.directionalLength=v,W.pointLength=g,W.spotLength=C,W.rectAreaLength=D,W.hemiLength=E,W.numSunShadows=S,W.numDirectionalShadows=P,W.numPointShadows=R,W.numSpotShadows=U,W.numSpotMaps=y,W.numLightProbes=O,n.version=yx++)}function c(h,d){let _=0,u=0,m=0,S=0,T=0,v=0,g=d.matrixWorldInverse;for(let C=0,D=h.length;C<D;C++){let E=h[C];if(E.isSunLight){let P=n.sun[_];P.direction.setFromMatrixPosition(E.matrixWorld),P.direction.transformDirection(g),_++}else if(E.isDirectionalLight){let P=n.directional[u];P.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),P.direction.sub(s),P.direction.transformDirection(g),u++}else if(E.isSpotLight){let P=n.spot[S];P.position.setFromMatrixPosition(E.matrixWorld),P.position.applyMatrix4(g),P.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),P.direction.sub(s),P.direction.transformDirection(g),S++}else if(E.isRectAreaLight){let P=n.rectArea[T];P.position.setFromMatrixPosition(E.matrixWorld),P.position.applyMatrix4(g),a.identity(),r.copy(E.matrixWorld),r.premultiply(g),a.extractRotation(r),P.halfWidth.set(E.width*.5,0,0),P.halfHeight.set(0,E.height*.5,0),P.halfWidth.applyMatrix4(a),P.halfHeight.applyMatrix4(a),T++}else if(E.isPointLight){let P=n.point[m];P.position.setFromMatrixPosition(E.matrixWorld),P.position.applyMatrix4(g),m++}else if(E.isHemisphereLight){let P=n.hemi[v];P.direction.setFromMatrixPosition(E.matrixWorld),P.direction.transformDirection(g),v++}}}return{setup:o,setupView:c,state:n}}function sf(i){let t=new Sx(i),e=[],n=[],s=[];function r(u){_.camera=u,e.length=0,n.length=0,s.length=0}function a(u){e.push(u)}function o(u){n.push(u)}function c(u){s.push(u)}function h(){t.setup(e)}function d(u){t.setupView(e,u)}let _={lightsArray:e,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:_,setupLights:h,setupLightsView:d,pushLight:a,pushShadow:o,pushLightProbeGrid:c}}function bx(i){let t=new WeakMap;function e(s,r=0){let a=t.get(s),o;return a===void 0?(o=new sf(i),t.set(s,[o])):r>=a.length?(o=new sf(i),a.push(o)):o=a[r],o}function n(){t=new WeakMap}return{get:e,dispose:n}}var wx=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Tx=`uniform sampler2D shadow_pass;
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
}`,Ax=[new N(1,0,0),new N(-1,0,0),new N(0,1,0),new N(0,-1,0),new N(0,0,1),new N(0,0,-1)],Ex=[new N(0,-1,0),new N(0,-1,0),new N(0,0,1),new N(0,0,-1),new N(0,-1,0),new N(0,-1,0)],rf=new ze,La=new N,zh=new N;function Cx(i,t,e){let n=new Mr,s=new Bt,r=new Bt,a=new Je,o=new jo,c=new Qo,h={},d=e.maxTextureSize,_={[vs]:bn,[bn]:vs,[Zn]:Zn},u=new xn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Bt},radius:{value:4}},vertexShader:wx,fragmentShader:Tx}),m=u.clone();m.defines.HORIZONTAL_PASS=1;let S=new Le;S.setAttribute("position",new ii(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let T=new he(S,u),v=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Sa;let g=this.type;this.render=function(R,U,y){if(v.enabled===!1||v.autoUpdate===!1&&v.needsUpdate===!1||R.length===0)return;this.type===ju&&(Qt("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Sa);let I=i.getRenderTarget(),O=i.getActiveCubeFace(),W=i.getActiveMipmapLevel(),q=i.state;q.setBlending(Ui),q.buffers.depth.getReversed()===!0?q.buffers.color.setClear(0,0,0,0):q.buffers.color.setClear(1,1,1,1),q.buffers.depth.setTest(!0),q.setScissorTest(!1);let tt=g!==this.type;tt&&U.traverse(function(k){k.material&&(Array.isArray(k.material)?k.material.forEach(it=>it.needsUpdate=!0):k.material.needsUpdate=!0)});for(let k=0,it=R.length;k<it;k++){let ct=R[k],at=ct.shadow;if(at===void 0){Qt("WebGLShadowMap:",ct,"has no shadow.");continue}if(at.autoUpdate===!1&&at.needsUpdate===!1)continue;s.copy(at.mapSize);let J=at.getFrameExtents();s.multiply(J),r.copy(at.mapSize),(s.x>d||s.y>d)&&(s.x>d&&(r.x=Math.floor(d/J.x),s.x=r.x*J.x,at.mapSize.x=r.x),s.y>d&&(r.y=Math.floor(d/J.y),s.y=r.y*J.y,at.mapSize.y=r.y));let rt=i.state.buffers.depth.getReversed();if(at.camera._reversedDepth=rt,at.map===null||tt===!0){if(at.map!==null&&(at.map.depthTexture!==null&&(at.map.depthTexture.dispose(),at.map.depthTexture=null),at.map.dispose()),this.type===Er){if(ct.isPointLight){Qt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}at.map=new Yn(s.x,s.y,{format:ws,type:Ai,minFilter:Cn,magFilter:Cn,generateMipmaps:!1}),at.map.texture.name=ct.name+".shadowMap",at.map.depthTexture=new hs(s.x,s.y,Ti),at.map.depthTexture.name=ct.name+".shadowMapDepth",at.map.depthTexture.format=Li,at.map.depthTexture.compareFunction=null,at.map.depthTexture.minFilter=Sn,at.map.depthTexture.magFilter=Sn}else ct.isPointLight?(at.map=new ac(s.x),at.map.depthTexture=new Wo(s.x,wi)):(at.map=new Yn(s.x,s.y),at.map.depthTexture=new hs(s.x,s.y,wi)),at.map.depthTexture.name=ct.name+".shadowMap",at.map.depthTexture.format=Li,this.type===Sa?(at.map.depthTexture.compareFunction=rt?nc:ec,at.map.depthTexture.minFilter=Cn,at.map.depthTexture.magFilter=Cn):(at.map.depthTexture.compareFunction=null,at.map.depthTexture.minFilter=Sn,at.map.depthTexture.magFilter=Sn);at.camera.updateProjectionMatrix()}at.map.isWebGLCubeRenderTarget!==!0&&(at.map.width!==s.x||at.map.height!==s.y)&&at.map.setSize(s.x,s.y);let mt=at.map.isWebGLCubeRenderTarget?6:at.getViewportCount();ct.isPointLight!==!0&&at.updateMatrices(ct,y);for(let yt=0;yt<mt;yt++){let $t=at.getCamera(yt);if(ct.isPointLight){let Wt=at.camera,Ae=at.matrix,_e=ct.distance||Wt.far;_e!==Wt.far&&(Wt.far=_e,Wt.updateProjectionMatrix()),La.setFromMatrixPosition(ct.matrixWorld),Wt.position.copy(La),zh.copy(Wt.position),zh.add(Ax[yt]),Wt.up.copy(Ex[yt]),Wt.lookAt(zh),Wt.updateMatrixWorld(),Ae.makeTranslation(-La.x,-La.y,-La.z),rf.multiplyMatrices(Wt.projectionMatrix,Wt.matrixWorldInverse),at._frustum.setFromProjectionMatrix(rf,Wt.coordinateSystem,Wt.reversedDepth)}if(at.map.isWebGLCubeRenderTarget)i.setRenderTarget(at.map,yt),i.clear();else{yt===0&&(i.setRenderTarget(at.map),i.clear());let Wt=at.getViewport(yt);a.set(r.x*Wt.x,r.y*Wt.y,r.x*Wt.z,r.y*Wt.w),q.viewport(a)}n=at.getFrustum(yt),E(U,y,$t,ct,this.type)}at.isPointLightShadow!==!0&&this.type===Er&&C(at,y),at.needsUpdate=!1}g=this.type,v.needsUpdate=!1,i.setRenderTarget(I,O,W)};function C(R,U){let y=t.update(T);u.defines.VSM_SAMPLES!==R.blurSamples&&(u.defines.VSM_SAMPLES=R.blurSamples,m.defines.VSM_SAMPLES=R.blurSamples,u.needsUpdate=!0,m.needsUpdate=!0),R.mapPass===null?R.mapPass=new Yn(s.x,s.y,{format:ws,type:Ai}):(R.mapPass.width!==R.map.width||R.mapPass.height!==R.map.height)&&R.mapPass.setSize(R.map.width,R.map.height),u.uniforms.shadow_pass.value=R.map.depthTexture,u.uniforms.resolution.value.set(R.map.width,R.map.height),u.uniforms.radius.value=R.radius,i.setRenderTarget(R.mapPass),i.clear(),i.renderBufferDirect(U,null,y,u,T,null),m.uniforms.shadow_pass.value=R.mapPass.texture,m.uniforms.resolution.value.set(R.map.width,R.map.height),m.uniforms.radius.value=R.radius,i.setRenderTarget(R.map),i.clear(),i.renderBufferDirect(U,null,y,m,T,null)}function D(R,U,y,I){let O=null,W=y.isPointLight===!0?R.customDistanceMaterial:R.customDepthMaterial;if(W!==void 0)O=W;else if(O=y.isPointLight===!0?c:o,i.localClippingEnabled&&U.clipShadows===!0&&Array.isArray(U.clippingPlanes)&&U.clippingPlanes.length!==0||U.displacementMap&&U.displacementScale!==0||U.alphaMap&&U.alphaTest>0||U.map&&U.alphaTest>0||U.alphaToCoverage===!0){let q=O.uuid,tt=U.uuid,k=h[q];k===void 0&&(k={},h[q]=k);let it=k[tt];it===void 0&&(it=O.clone(),k[tt]=it,U.addEventListener("dispose",P)),O=it}if(O.visible=U.visible,O.wireframe=U.wireframe,I===Er?O.side=U.shadowSide!==null?U.shadowSide:U.side:O.side=U.shadowSide!==null?U.shadowSide:_[U.side],O.alphaMap=U.alphaMap,O.alphaTest=U.alphaToCoverage===!0?.5:U.alphaTest,O.map=U.map,O.clipShadows=U.clipShadows,O.clippingPlanes=U.clippingPlanes,O.clipIntersection=U.clipIntersection,O.displacementMap=U.displacementMap,O.displacementScale=U.displacementScale,O.displacementBias=U.displacementBias,O.wireframeLinewidth=U.wireframeLinewidth,O.linewidth=U.linewidth,y.isPointLight===!0&&O.isMeshDistanceMaterial===!0){let q=i.properties.get(O);q.light=y}return O}function E(R,U,y,I,O){if(R.visible===!1)return;if(R.layers.test(U.layers)&&(R.isMesh||R.isLine||R.isPoints)&&(R.castShadow||R.receiveShadow&&O===Er)&&(!R.frustumCulled||R.intersectsFrustum(n))){R.modelViewMatrix.multiplyMatrices(y.matrixWorldInverse,R.matrixWorld);let tt=t.update(R),k=R.material;if(Array.isArray(k)){let it=tt.groups;for(let ct=0,at=it.length;ct<at;ct++){let J=it[ct],rt=k[J.materialIndex];if(rt&&rt.visible){let mt=D(R,rt,I,O);R.onBeforeShadow(i,R,U,y,tt,mt,J),i.renderBufferDirect(y,null,tt,mt,R,J),R.onAfterShadow(i,R,U,y,tt,mt,J)}}}else if(k.visible){let it=D(R,k,I,O);R.onBeforeShadow(i,R,U,y,tt,it,null),i.renderBufferDirect(y,null,tt,it,R,null),R.onAfterShadow(i,R,U,y,tt,it,null)}}let q=R.children;for(let tt=0,k=q.length;tt<k;tt++)E(q[tt],U,y,I,O)}function P(R){R.target.removeEventListener("dispose",P);for(let y in h){let I=h[y],O=R.target.uuid;O in I&&(I[O].dispose(),delete I[O])}}}function Rx(i,t){function e(){let V=!1,bt=new Je,ft=null,Rt=new Je(0,0,0,0);return{setMask:function(Dt){ft!==Dt&&!V&&(i.colorMask(Dt,Dt,Dt,Dt),ft=Dt)},setLocked:function(Dt){V=Dt},setClear:function(Dt,vt,qt,Ht,Fe){Fe===!0&&(Dt*=Ht,vt*=Ht,qt*=Ht),bt.set(Dt,vt,qt,Ht),Rt.equals(bt)===!1&&(i.clearColor(Dt,vt,qt,Ht),Rt.copy(bt))},reset:function(){V=!1,ft=null,Rt.set(-1,0,0,0)}}}function n(){let V=!1,bt=!1,ft=null,Rt=null,Dt=null;return{setReversed:function(vt){if(bt!==vt){let qt=t.get("EXT_clip_control");vt?qt.clipControlEXT(qt.LOWER_LEFT_EXT,qt.ZERO_TO_ONE_EXT):qt.clipControlEXT(qt.LOWER_LEFT_EXT,qt.NEGATIVE_ONE_TO_ONE_EXT),bt=vt;let Ht=Dt;Dt=null,this.setClear(Ht)}},getReversed:function(){return bt},setTest:function(vt){vt?gt(i.DEPTH_TEST):St(i.DEPTH_TEST)},setMask:function(vt){ft!==vt&&!V&&(i.depthMask(vt),ft=vt)},setFunc:function(vt){if(bt&&(vt=Ld[vt]),Rt!==vt){switch(vt){case Ao:i.depthFunc(i.NEVER);break;case Eo:i.depthFunc(i.ALWAYS);break;case Co:i.depthFunc(i.LESS);break;case pr:i.depthFunc(i.LEQUAL);break;case Ro:i.depthFunc(i.EQUAL);break;case Po:i.depthFunc(i.GEQUAL);break;case Io:i.depthFunc(i.GREATER);break;case Lo:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}Rt=vt}},setLocked:function(vt){V=vt},setClear:function(vt){Dt!==vt&&(Dt=vt,bt&&(vt=1-vt),i.clearDepth(vt))},reset:function(){V=!1,ft=null,Rt=null,Dt=null,bt=!1}}}function s(){let V=!1,bt=null,ft=null,Rt=null,Dt=null,vt=null,qt=null,Ht=null,Fe=null;return{setTest:function(Ce){V||(Ce?gt(i.STENCIL_TEST):St(i.STENCIL_TEST))},setMask:function(Ce){bt!==Ce&&!V&&(i.stencilMask(Ce),bt=Ce)},setFunc:function(Ce,Tn,kn){(ft!==Ce||Rt!==Tn||Dt!==kn)&&(i.stencilFunc(Ce,Tn,kn),ft=Ce,Rt=Tn,Dt=kn)},setOp:function(Ce,Tn,kn){(vt!==Ce||qt!==Tn||Ht!==kn)&&(i.stencilOp(Ce,Tn,kn),vt=Ce,qt=Tn,Ht=kn)},setLocked:function(Ce){V=Ce},setClear:function(Ce){Fe!==Ce&&(i.clearStencil(Ce),Fe=Ce)},reset:function(){V=!1,bt=null,ft=null,Rt=null,Dt=null,vt=null,qt=null,Ht=null,Fe=null}}}let r=new e,a=new n,o=new s,c=new WeakMap,h=new WeakMap,d={},_={},u={},m=new WeakMap,S=[],T=null,v=!1,g=null,C=null,D=null,E=null,P=null,R=null,U=null,y=new jt(0,0,0),I=0,O=!1,W=null,q=null,tt=null,k=null,it=null,ct=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),at=!1,J=0,rt=i.getParameter(i.VERSION);rt.indexOf("WebGL")!==-1?(J=parseFloat(/^WebGL (\d)/.exec(rt)[1]),at=J>=1):rt.indexOf("OpenGL ES")!==-1&&(J=parseFloat(/^OpenGL ES (\d)/.exec(rt)[1]),at=J>=2);let mt=null,yt={},$t=i.getParameter(i.SCISSOR_BOX),Wt=i.getParameter(i.VIEWPORT),Ae=new Je().fromArray($t),_e=new Je().fromArray(Wt);function fe(V,bt,ft,Rt){let Dt=new Uint8Array(4),vt=i.createTexture();i.bindTexture(V,vt),i.texParameteri(V,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(V,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let qt=0;qt<ft;qt++)V===i.TEXTURE_3D||V===i.TEXTURE_2D_ARRAY?i.texImage3D(bt,0,i.RGBA,1,1,Rt,0,i.RGBA,i.UNSIGNED_BYTE,Dt):i.texImage2D(bt+qt,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,Dt);return vt}let ht={};ht[i.TEXTURE_2D]=fe(i.TEXTURE_2D,i.TEXTURE_2D,1),ht[i.TEXTURE_CUBE_MAP]=fe(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),ht[i.TEXTURE_2D_ARRAY]=fe(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),ht[i.TEXTURE_3D]=fe(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),gt(i.DEPTH_TEST),a.setFunc(pr),ue(!1),Ge(nh),gt(i.CULL_FACE),ye(Ui);function gt(V){d[V]!==!0&&(i.enable(V),d[V]=!0)}function St(V){d[V]!==!1&&(i.disable(V),d[V]=!1)}function Jt(V,bt){return u[V]!==bt?(i.bindFramebuffer(V,bt),u[V]=bt,V===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=bt),V===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=bt),!0):!1}function Ot(V,bt){let ft=S,Rt=!1;if(V){ft=m.get(bt),ft===void 0&&(ft=[],m.set(bt,ft));let Dt=V.textures;if(ft.length!==Dt.length||ft[0]!==i.COLOR_ATTACHMENT0){for(let vt=0,qt=Dt.length;vt<qt;vt++)ft[vt]=i.COLOR_ATTACHMENT0+vt;ft.length=Dt.length,Rt=!0}}else ft[0]!==i.BACK&&(ft[0]=i.BACK,Rt=!0);Rt&&i.drawBuffers(ft)}function ie(V){return T!==V?(i.useProgram(V),T=V,!0):!1}let Kt={[Os]:i.FUNC_ADD,[td]:i.FUNC_SUBTRACT,[ed]:i.FUNC_REVERSE_SUBTRACT};Kt[nd]=i.MIN,Kt[id]=i.MAX;let oe={[sd]:i.ZERO,[rd]:i.ONE,[ad]:i.SRC_COLOR,[rh]:i.SRC_ALPHA,[dd]:i.SRC_ALPHA_SATURATE,[hd]:i.DST_COLOR,[ld]:i.DST_ALPHA,[od]:i.ONE_MINUS_SRC_COLOR,[ah]:i.ONE_MINUS_SRC_ALPHA,[ud]:i.ONE_MINUS_DST_COLOR,[cd]:i.ONE_MINUS_DST_ALPHA,[fd]:i.CONSTANT_COLOR,[pd]:i.ONE_MINUS_CONSTANT_COLOR,[md]:i.CONSTANT_ALPHA,[gd]:i.ONE_MINUS_CONSTANT_ALPHA};function ye(V,bt,ft,Rt,Dt,vt,qt,Ht,Fe,Ce){if(V===Ui){v===!0&&(St(i.BLEND),v=!1);return}if(v===!1&&(gt(i.BLEND),v=!0),V!==Qu){if(V!==g||Ce!==O){if((C!==Os||P!==Os)&&(i.blendEquation(i.FUNC_ADD),C=Os,P=Os),Ce)switch(V){case ys:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case en:i.blendFunc(i.ONE,i.ONE);break;case ih:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case sh:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:te("WebGLState: Invalid blending: ",V);break}else switch(V){case ys:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case en:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case ih:te("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case sh:te("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:te("WebGLState: Invalid blending: ",V);break}D=null,E=null,R=null,U=null,y.set(0,0,0),I=0,g=V,O=Ce}return}Dt=Dt||bt,vt=vt||ft,qt=qt||Rt,(bt!==C||Dt!==P)&&(i.blendEquationSeparate(Kt[bt],Kt[Dt]),C=bt,P=Dt),(ft!==D||Rt!==E||vt!==R||qt!==U)&&(i.blendFuncSeparate(oe[ft],oe[Rt],oe[vt],oe[qt]),D=ft,E=Rt,R=vt,U=qt),(Ht.equals(y)===!1||Fe!==I)&&(i.blendColor(Ht.r,Ht.g,Ht.b,Fe),y.copy(Ht),I=Fe),g=V,O=!1}function ce(V,bt){V.side===Zn?St(i.CULL_FACE):gt(i.CULL_FACE);let ft=V.side===bn;bt&&(ft=!ft),ue(ft),V.blending===ys&&V.transparent===!1?ye(Ui):ye(V.blending,V.blendEquation,V.blendSrc,V.blendDst,V.blendEquationAlpha,V.blendSrcAlpha,V.blendDstAlpha,V.blendColor,V.blendAlpha,V.premultipliedAlpha),a.setFunc(V.depthFunc),a.setTest(V.depthTest),a.setMask(V.depthWrite),r.setMask(V.colorWrite);let Rt=V.stencilWrite;o.setTest(Rt),Rt&&(o.setMask(V.stencilWriteMask),o.setFunc(V.stencilFunc,V.stencilRef,V.stencilFuncMask),o.setOp(V.stencilFail,V.stencilZFail,V.stencilZPass)),wn(V.polygonOffset,V.polygonOffsetFactor,V.polygonOffsetUnits),V.alphaToCoverage===!0?gt(i.SAMPLE_ALPHA_TO_COVERAGE):St(i.SAMPLE_ALPHA_TO_COVERAGE)}function ue(V){W!==V&&(V?i.frontFace(i.CW):i.frontFace(i.CCW),W=V)}function Ge(V){V!==Ju?(gt(i.CULL_FACE),V!==q&&(V===nh?i.cullFace(i.BACK):V===Ku?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):St(i.CULL_FACE),q=V}function ln(V){V!==tt&&(at&&i.lineWidth(V),tt=V)}function wn(V,bt,ft){V?(gt(i.POLYGON_OFFSET_FILL),(k!==bt||it!==ft)&&(k=bt,it=ft,a.getReversed()&&(bt=-bt),i.polygonOffset(bt,ft))):St(i.POLYGON_OFFSET_FILL)}function Ue(V){V?gt(i.SCISSOR_TEST):St(i.SCISSOR_TEST)}function Ze(V){V===void 0&&(V=i.TEXTURE0+ct-1),mt!==V&&(i.activeTexture(V),mt=V)}function B(V,bt,ft){ft===void 0&&(mt===null?ft=i.TEXTURE0+ct-1:ft=mt);let Rt=yt[ft];Rt===void 0&&(Rt={type:void 0,texture:void 0},yt[ft]=Rt),(Rt.type!==V||Rt.texture!==bt)&&(mt!==ft&&(i.activeTexture(ft),mt=ft),i.bindTexture(V,bt||ht[V]),Rt.type=V,Rt.texture=bt)}function cn(){let V=yt[mt];V!==void 0&&V.type!==void 0&&(i.bindTexture(V.type,null),V.type=void 0,V.texture=void 0)}function ve(){try{i.compressedTexImage2D(...arguments)}catch(V){te("WebGLState:",V)}}function L(){try{i.compressedTexImage3D(...arguments)}catch(V){te("WebGLState:",V)}}function b(){try{i.texSubImage2D(...arguments)}catch(V){te("WebGLState:",V)}}function Y(){try{i.texSubImage3D(...arguments)}catch(V){te("WebGLState:",V)}}function K(){try{i.compressedTexSubImage2D(...arguments)}catch(V){te("WebGLState:",V)}}function ot(){try{i.compressedTexSubImage3D(...arguments)}catch(V){te("WebGLState:",V)}}function Mt(){try{i.texStorage2D(...arguments)}catch(V){te("WebGLState:",V)}}function Tt(){try{i.texStorage3D(...arguments)}catch(V){te("WebGLState:",V)}}function ut(){try{i.texImage2D(...arguments)}catch(V){te("WebGLState:",V)}}function pt(){try{i.texImage3D(...arguments)}catch(V){te("WebGLState:",V)}}function Ct(V){return _[V]!==void 0?_[V]:i.getParameter(V)}function zt(V,bt){_[V]!==bt&&(i.pixelStorei(V,bt),_[V]=bt)}function At(V){Ae.equals(V)===!1&&(i.scissor(V.x,V.y,V.z,V.w),Ae.copy(V))}function Et(V){_e.equals(V)===!1&&(i.viewport(V.x,V.y,V.z,V.w),_e.copy(V))}function Xt(V,bt){let ft=h.get(bt);ft===void 0&&(ft=new WeakMap,h.set(bt,ft));let Rt=ft.get(V);Rt===void 0&&(Rt=i.getUniformBlockIndex(bt,V.name),ft.set(V,Rt))}function Zt(V,bt){let Rt=h.get(bt).get(V);c.get(bt)!==Rt&&(i.uniformBlockBinding(bt,Rt,V.__bindingPointIndex),c.set(bt,Rt))}function se(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),d={},_={},mt=null,yt={},u={},m=new WeakMap,S=[],T=null,v=!1,g=null,C=null,D=null,E=null,P=null,R=null,U=null,y=new jt(0,0,0),I=0,O=!1,W=null,q=null,tt=null,k=null,it=null,Ae.set(0,0,i.canvas.width,i.canvas.height),_e.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:gt,disable:St,bindFramebuffer:Jt,drawBuffers:Ot,useProgram:ie,setBlending:ye,setMaterial:ce,setFlipSided:ue,setCullFace:Ge,setLineWidth:ln,setPolygonOffset:wn,setScissorTest:Ue,activeTexture:Ze,bindTexture:B,unbindTexture:cn,compressedTexImage2D:ve,compressedTexImage3D:L,texImage2D:ut,texImage3D:pt,pixelStorei:zt,getParameter:Ct,updateUBOMapping:Xt,uniformBlockBinding:Zt,texStorage2D:Mt,texStorage3D:Tt,texSubImage2D:b,texSubImage3D:Y,compressedTexSubImage2D:K,compressedTexSubImage3D:ot,scissor:At,viewport:Et,reset:se}}function Px(i,t,e,n,s,r,a){let o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),h=new Bt,d=new WeakMap,_=new Set,u,m=new WeakMap,S=!1;try{S=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function T(L,b){return S?new OffscreenCanvas(L,b):gr("canvas")}function v(L,b,Y){let K=1,ot=ve(L);if((ot.width>Y||ot.height>Y)&&(K=Y/Math.max(ot.width,ot.height)),K<1)if(typeof HTMLImageElement<"u"&&L instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&L instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&L instanceof ImageBitmap||typeof VideoFrame<"u"&&L instanceof VideoFrame){let Mt=Math.floor(K*ot.width),Tt=Math.floor(K*ot.height);u===void 0&&(u=T(Mt,Tt));let ut=b?T(Mt,Tt):u;return ut.width=Mt,ut.height=Tt,ut.getContext("2d").drawImage(L,0,0,Mt,Tt),Qt("WebGLRenderer: Texture has been resized from ("+ot.width+"x"+ot.height+") to ("+Mt+"x"+Tt+")."),ut}else return"data"in L&&Qt("WebGLRenderer: Image in DataTexture is too big ("+ot.width+"x"+ot.height+")."),L;return L}function g(L){return L.generateMipmaps}function C(L){i.generateMipmap(L)}function D(L){return L.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:L.isWebGL3DRenderTarget?i.TEXTURE_3D:L.isWebGLArrayRenderTarget||L.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function E(L,b,Y,K,ot,Mt=!1){if(L!==null){if(i[L]!==void 0)return i[L];Qt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+L+"'")}let Tt;K&&(Tt=t.get("EXT_texture_norm16"),Tt||Qt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let ut=b;if(b===i.RED&&(Y===i.FLOAT&&(ut=i.R32F),Y===i.HALF_FLOAT&&(ut=i.R16F),Y===i.UNSIGNED_BYTE&&(ut=i.R8),Y===i.UNSIGNED_SHORT&&Tt&&(ut=Tt.R16_EXT),Y===i.SHORT&&Tt&&(ut=Tt.R16_SNORM_EXT)),b===i.RED_INTEGER&&(Y===i.UNSIGNED_BYTE&&(ut=i.R8UI),Y===i.UNSIGNED_SHORT&&(ut=i.R16UI),Y===i.UNSIGNED_INT&&(ut=i.R32UI),Y===i.BYTE&&(ut=i.R8I),Y===i.SHORT&&(ut=i.R16I),Y===i.INT&&(ut=i.R32I)),b===i.RG&&(Y===i.FLOAT&&(ut=i.RG32F),Y===i.HALF_FLOAT&&(ut=i.RG16F),Y===i.UNSIGNED_BYTE&&(ut=i.RG8),Y===i.UNSIGNED_SHORT&&Tt&&(ut=Tt.RG16_EXT),Y===i.SHORT&&Tt&&(ut=Tt.RG16_SNORM_EXT)),b===i.RG_INTEGER&&(Y===i.UNSIGNED_BYTE&&(ut=i.RG8UI),Y===i.UNSIGNED_SHORT&&(ut=i.RG16UI),Y===i.UNSIGNED_INT&&(ut=i.RG32UI),Y===i.BYTE&&(ut=i.RG8I),Y===i.SHORT&&(ut=i.RG16I),Y===i.INT&&(ut=i.RG32I)),b===i.RGB_INTEGER&&(Y===i.UNSIGNED_BYTE&&(ut=i.RGB8UI),Y===i.UNSIGNED_SHORT&&(ut=i.RGB16UI),Y===i.UNSIGNED_INT&&(ut=i.RGB32UI),Y===i.BYTE&&(ut=i.RGB8I),Y===i.SHORT&&(ut=i.RGB16I),Y===i.INT&&(ut=i.RGB32I)),b===i.RGBA_INTEGER&&(Y===i.UNSIGNED_BYTE&&(ut=i.RGBA8UI),Y===i.UNSIGNED_SHORT&&(ut=i.RGBA16UI),Y===i.UNSIGNED_INT&&(ut=i.RGBA32UI),Y===i.BYTE&&(ut=i.RGBA8I),Y===i.SHORT&&(ut=i.RGBA16I),Y===i.INT&&(ut=i.RGBA32I)),b===i.RGB&&(Y===i.UNSIGNED_SHORT&&Tt&&(ut=Tt.RGB16_EXT),Y===i.SHORT&&Tt&&(ut=Tt.RGB16_SNORM_EXT),Y===i.UNSIGNED_INT_5_9_9_9_REV&&(ut=i.RGB9_E5),Y===i.UNSIGNED_INT_10F_11F_11F_REV&&(ut=i.R11F_G11F_B10F)),b===i.RGBA){let pt=Mt?ta:we.getTransfer(ot);Y===i.FLOAT&&(ut=i.RGBA32F),Y===i.HALF_FLOAT&&(ut=i.RGBA16F),Y===i.UNSIGNED_BYTE&&(ut=pt===De?i.SRGB8_ALPHA8:i.RGBA8),Y===i.UNSIGNED_SHORT&&Tt&&(ut=Tt.RGBA16_EXT),Y===i.SHORT&&Tt&&(ut=Tt.RGBA16_SNORM_EXT),Y===i.UNSIGNED_SHORT_4_4_4_4&&(ut=i.RGBA4),Y===i.UNSIGNED_SHORT_5_5_5_1&&(ut=i.RGB5_A1)}return(ut===i.R16F||ut===i.R32F||ut===i.RG16F||ut===i.RG32F||ut===i.RGBA16F||ut===i.RGBA32F)&&t.get("EXT_color_buffer_float"),ut}function P(L,b){let Y;return L?b===null||b===wi||b===Rr?Y=i.DEPTH24_STENCIL8:b===Ti?Y=i.DEPTH32F_STENCIL8:b===Cr&&(Y=i.DEPTH24_STENCIL8,Qt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):b===null||b===wi||b===Rr?Y=i.DEPTH_COMPONENT24:b===Ti?Y=i.DEPTH_COMPONENT32F:b===Cr&&(Y=i.DEPTH_COMPONENT16),Y}function R(L,b){return g(L)===!0||L.isFramebufferTexture&&L.minFilter!==Sn&&L.minFilter!==Cn?Math.log2(Math.max(b.width,b.height))+1:L.mipmaps!==void 0&&L.mipmaps.length>0?L.mipmaps.length:L.isCompressedTexture&&Array.isArray(L.image)?b.mipmaps.length:1}function U(L){let b=L.target;b.removeEventListener("dispose",U),I(b),b.isVideoTexture&&d.delete(b),b.isHTMLTexture&&_.delete(b)}function y(L){let b=L.target;b.removeEventListener("dispose",y),W(b)}function I(L){let b=n.get(L);if(b.__webglInit===void 0)return;let Y=L.source,K=m.get(Y);if(K){let ot=K[b.__cacheKey];ot.usedTimes--,ot.usedTimes===0&&O(L),Object.keys(K).length===0&&m.delete(Y)}n.remove(L)}function O(L){let b=n.get(L);i.deleteTexture(b.__webglTexture);let Y=L.source,K=m.get(Y);delete K[b.__cacheKey],a.memory.textures--}function W(L){let b=n.get(L);if(L.depthTexture&&(L.depthTexture.dispose(),n.remove(L.depthTexture)),L.isWebGLCubeRenderTarget)for(let K=0;K<6;K++){if(Array.isArray(b.__webglFramebuffer[K]))for(let ot=0;ot<b.__webglFramebuffer[K].length;ot++)i.deleteFramebuffer(b.__webglFramebuffer[K][ot]);else i.deleteFramebuffer(b.__webglFramebuffer[K]);b.__webglDepthbuffer&&i.deleteRenderbuffer(b.__webglDepthbuffer[K])}else{if(Array.isArray(b.__webglFramebuffer))for(let K=0;K<b.__webglFramebuffer.length;K++)i.deleteFramebuffer(b.__webglFramebuffer[K]);else i.deleteFramebuffer(b.__webglFramebuffer);if(b.__webglDepthbuffer&&i.deleteRenderbuffer(b.__webglDepthbuffer),b.__webglMultisampledFramebuffer&&i.deleteFramebuffer(b.__webglMultisampledFramebuffer),b.__webglColorRenderbuffer)for(let K=0;K<b.__webglColorRenderbuffer.length;K++)b.__webglColorRenderbuffer[K]&&i.deleteRenderbuffer(b.__webglColorRenderbuffer[K]);b.__webglDepthRenderbuffer&&i.deleteRenderbuffer(b.__webglDepthRenderbuffer)}let Y=L.textures;for(let K=0,ot=Y.length;K<ot;K++){let Mt=n.get(Y[K]);Mt.__webglTexture&&(i.deleteTexture(Mt.__webglTexture),a.memory.textures--),n.remove(Y[K])}n.remove(L)}let q=0;function tt(){q=0}function k(){return q}function it(L){q=L}function ct(){let L=q;return L>=s.maxTextures&&Qt("WebGLTextures: Trying to use "+(L+1)+" texture units while this GPU supports only "+s.maxTextures),q+=1,L}function at(L){let b=[];return b.push(L.wrapS),b.push(L.wrapT),b.push(L.wrapR||0),b.push(L.magFilter),b.push(L.minFilter),b.push(L.anisotropy),b.push(L.internalFormat),b.push(L.format),b.push(L.type),b.push(L.generateMipmaps),b.push(L.premultiplyAlpha),b.push(L.flipY),b.push(L.unpackAlignment),b.push(L.colorSpace),b.join()}function J(L,b){let Y=n.get(L);if(L.isVideoTexture&&B(L),L.isRenderTargetTexture===!1&&L.isExternalTexture!==!0&&L.version>0&&Y.__version!==L.version){let K=L.image;if(K===null)Qt("WebGLRenderer: Texture marked for update but no image data found.");else if(K.complete===!1)Qt("WebGLRenderer: Texture marked for update but image is incomplete");else{St(Y,L,b);return}}else L.isExternalTexture&&(Y.__webglTexture=L.sourceTexture?L.sourceTexture:null);e.bindTexture(i.TEXTURE_2D,Y.__webglTexture,i.TEXTURE0+b)}function rt(L,b){let Y=n.get(L);if(L.isRenderTargetTexture===!1&&L.version>0&&Y.__version!==L.version){St(Y,L,b);return}else L.isExternalTexture&&(Y.__webglTexture=L.sourceTexture?L.sourceTexture:null);e.bindTexture(i.TEXTURE_2D_ARRAY,Y.__webglTexture,i.TEXTURE0+b)}function mt(L,b){let Y=n.get(L);if(L.isRenderTargetTexture===!1&&L.version>0&&Y.__version!==L.version){St(Y,L,b);return}e.bindTexture(i.TEXTURE_3D,Y.__webglTexture,i.TEXTURE0+b)}function yt(L,b){let Y=n.get(L);if(L.isCubeDepthTexture!==!0&&L.version>0&&Y.__version!==L.version){Jt(Y,L,b);return}e.bindTexture(i.TEXTURE_CUBE_MAP,Y.__webglTexture,i.TEXTURE0+b)}let $t={[Do]:i.REPEAT,[Ii]:i.CLAMP_TO_EDGE,[No]:i.MIRRORED_REPEAT},Wt={[Sn]:i.NEAREST,[vd]:i.NEAREST_MIPMAP_NEAREST,[wa]:i.NEAREST_MIPMAP_LINEAR,[Cn]:i.LINEAR,[_l]:i.LINEAR_MIPMAP_NEAREST,[Ss]:i.LINEAR_MIPMAP_LINEAR},Ae={[bd]:i.NEVER,[Cd]:i.ALWAYS,[wd]:i.LESS,[ec]:i.LEQUAL,[Td]:i.EQUAL,[nc]:i.GEQUAL,[Ad]:i.GREATER,[Ed]:i.NOTEQUAL};function _e(L,b){if(b.type===Ti&&t.has("OES_texture_float_linear")===!1&&(b.magFilter===Cn||b.magFilter===_l||b.magFilter===wa||b.magFilter===Ss||b.minFilter===Cn||b.minFilter===_l||b.minFilter===wa||b.minFilter===Ss)&&Qt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(L,i.TEXTURE_WRAP_S,$t[b.wrapS]),i.texParameteri(L,i.TEXTURE_WRAP_T,$t[b.wrapT]),(L===i.TEXTURE_3D||L===i.TEXTURE_2D_ARRAY)&&i.texParameteri(L,i.TEXTURE_WRAP_R,$t[b.wrapR]),i.texParameteri(L,i.TEXTURE_MAG_FILTER,Wt[b.magFilter]),i.texParameteri(L,i.TEXTURE_MIN_FILTER,Wt[b.minFilter]),b.compareFunction&&(i.texParameteri(L,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(L,i.TEXTURE_COMPARE_FUNC,Ae[b.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(b.magFilter===Sn||b.minFilter!==wa&&b.minFilter!==Ss||b.type===Ti&&t.has("OES_texture_float_linear")===!1)return;if(b.anisotropy>1||n.get(b).__currentAnisotropy){let Y=t.get("EXT_texture_filter_anisotropic");i.texParameterf(L,Y.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(b.anisotropy,s.getMaxAnisotropy())),n.get(b).__currentAnisotropy=b.anisotropy}}}function fe(L,b){let Y=!1;L.__webglInit===void 0&&(L.__webglInit=!0,b.addEventListener("dispose",U));let K=b.source,ot=m.get(K);ot===void 0&&(ot={},m.set(K,ot));let Mt=at(b);if(Mt!==L.__cacheKey){ot[Mt]===void 0&&(ot[Mt]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,Y=!0),ot[Mt].usedTimes++;let Tt=ot[L.__cacheKey];Tt!==void 0&&(ot[L.__cacheKey].usedTimes--,Tt.usedTimes===0&&O(b)),L.__cacheKey=Mt,L.__webglTexture=ot[Mt].texture}return Y}function ht(L,b,Y){return Math.floor(Math.floor(L/Y)/b)}function gt(L,b,Y,K){let Mt=L.updateRanges;if(Mt.length===0)e.texSubImage2D(i.TEXTURE_2D,0,0,0,b.width,b.height,Y,K,b.data);else{Mt.sort((zt,At)=>zt.start-At.start);let Tt=0;for(let zt=1;zt<Mt.length;zt++){let At=Mt[Tt],Et=Mt[zt],Xt=At.start+At.count,Zt=ht(Et.start,b.width,4),se=ht(At.start,b.width,4);Et.start<=Xt+1&&Zt===se&&ht(Et.start+Et.count-1,b.width,4)===Zt?At.count=Math.max(At.count,Et.start+Et.count-At.start):(++Tt,Mt[Tt]=Et)}Mt.length=Tt+1;let ut=e.getParameter(i.UNPACK_ROW_LENGTH),pt=e.getParameter(i.UNPACK_SKIP_PIXELS),Ct=e.getParameter(i.UNPACK_SKIP_ROWS);e.pixelStorei(i.UNPACK_ROW_LENGTH,b.width);for(let zt=0,At=Mt.length;zt<At;zt++){let Et=Mt[zt],Xt=Math.floor(Et.start/4),Zt=Math.ceil(Et.count/4),se=Xt%b.width,V=Math.floor(Xt/b.width),bt=Zt,ft=1;e.pixelStorei(i.UNPACK_SKIP_PIXELS,se),e.pixelStorei(i.UNPACK_SKIP_ROWS,V),e.texSubImage2D(i.TEXTURE_2D,0,se,V,bt,ft,Y,K,b.data)}L.clearUpdateRanges(),e.pixelStorei(i.UNPACK_ROW_LENGTH,ut),e.pixelStorei(i.UNPACK_SKIP_PIXELS,pt),e.pixelStorei(i.UNPACK_SKIP_ROWS,Ct)}}function St(L,b,Y){let K=i.TEXTURE_2D;(b.isDataArrayTexture||b.isCompressedArrayTexture)&&(K=i.TEXTURE_2D_ARRAY),b.isData3DTexture&&(K=i.TEXTURE_3D);let ot=fe(L,b),Mt=b.source;e.bindTexture(K,L.__webglTexture,i.TEXTURE0+Y);let Tt=n.get(Mt);if(Mt.version!==Tt.__version||ot===!0){if(e.activeTexture(i.TEXTURE0+Y),(typeof ImageBitmap<"u"&&b.image instanceof ImageBitmap)===!1){let ft=we.getPrimaries(we.workingColorSpace),Rt=b.colorSpace===Ji?null:we.getPrimaries(b.colorSpace),Dt=b.colorSpace===Ji||ft===Rt?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,b.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Dt)}e.pixelStorei(i.UNPACK_ALIGNMENT,b.unpackAlignment);let pt=v(b.image,!1,s.maxTextureSize);pt=cn(b,pt);let Ct=r.convert(b.format,b.colorSpace),zt=r.convert(b.type),At=E(b.internalFormat,Ct,zt,b.normalized,b.colorSpace,b.isVideoTexture);_e(K,b);let Et,Xt=b.mipmaps,Zt=b.isVideoTexture!==!0,se=Tt.__version===void 0||ot===!0,V=Mt.dataReady,bt=R(b,pt);if(b.isDepthTexture)At=P(b.format===bs,b.type),se&&(Zt?e.texStorage2D(i.TEXTURE_2D,1,At,pt.width,pt.height):e.texImage2D(i.TEXTURE_2D,0,At,pt.width,pt.height,0,Ct,zt,null));else if(b.isDataTexture)if(Xt.length>0){Zt&&se&&e.texStorage2D(i.TEXTURE_2D,bt,At,Xt[0].width,Xt[0].height);for(let ft=0,Rt=Xt.length;ft<Rt;ft++)Et=Xt[ft],Zt?V&&e.texSubImage2D(i.TEXTURE_2D,ft,0,0,Et.width,Et.height,Ct,zt,Et.data):e.texImage2D(i.TEXTURE_2D,ft,At,Et.width,Et.height,0,Ct,zt,Et.data);b.generateMipmaps=!1}else Zt?(se&&e.texStorage2D(i.TEXTURE_2D,bt,At,pt.width,pt.height),V&&gt(b,pt,Ct,zt)):e.texImage2D(i.TEXTURE_2D,0,At,pt.width,pt.height,0,Ct,zt,pt.data);else if(b.isCompressedTexture)if(b.isCompressedArrayTexture){Zt&&se&&e.texStorage3D(i.TEXTURE_2D_ARRAY,bt,At,Xt[0].width,Xt[0].height,pt.depth);for(let ft=0,Rt=Xt.length;ft<Rt;ft++)if(Et=Xt[ft],b.format!==fi)if(Ct!==null)if(Zt){if(V)if(b.layerUpdates.size>0){let Dt=Ch(Et.width,Et.height,b.format,b.type);for(let vt of b.layerUpdates){let qt=Et.data.subarray(vt*Dt/Et.data.BYTES_PER_ELEMENT,(vt+1)*Dt/Et.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ft,0,0,vt,Et.width,Et.height,1,Ct,qt)}}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ft,0,0,0,Et.width,Et.height,pt.depth,Ct,Et.data)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,ft,At,Et.width,Et.height,pt.depth,0,Et.data,0,0);else Qt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Zt?V&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,ft,0,0,0,Et.width,Et.height,pt.depth,Ct,zt,Et.data):e.texImage3D(i.TEXTURE_2D_ARRAY,ft,At,Et.width,Et.height,pt.depth,0,Ct,zt,Et.data);b.layerUpdates.size>0&&b.clearLayerUpdates()}else{Zt&&se&&e.texStorage2D(i.TEXTURE_2D,bt,At,Xt[0].width,Xt[0].height);for(let ft=0,Rt=Xt.length;ft<Rt;ft++)Et=Xt[ft],b.format!==fi?Ct!==null?Zt?V&&e.compressedTexSubImage2D(i.TEXTURE_2D,ft,0,0,Et.width,Et.height,Ct,Et.data):e.compressedTexImage2D(i.TEXTURE_2D,ft,At,Et.width,Et.height,0,Et.data):Qt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Zt?V&&e.texSubImage2D(i.TEXTURE_2D,ft,0,0,Et.width,Et.height,Ct,zt,Et.data):e.texImage2D(i.TEXTURE_2D,ft,At,Et.width,Et.height,0,Ct,zt,Et.data)}else if(b.isDataArrayTexture)if(Zt){if(se&&e.texStorage3D(i.TEXTURE_2D_ARRAY,bt,At,pt.width,pt.height,pt.depth),V)if(b.layerUpdates.size>0){let ft=Ch(pt.width,pt.height,b.format,b.type);for(let Rt of b.layerUpdates){let Dt=pt.data.subarray(Rt*ft/pt.data.BYTES_PER_ELEMENT,(Rt+1)*ft/pt.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Rt,pt.width,pt.height,1,Ct,zt,Dt)}b.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,pt.width,pt.height,pt.depth,Ct,zt,pt.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,At,pt.width,pt.height,pt.depth,0,Ct,zt,pt.data);else if(b.isData3DTexture)Zt?(se&&e.texStorage3D(i.TEXTURE_3D,bt,At,pt.width,pt.height,pt.depth),V&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,pt.width,pt.height,pt.depth,Ct,zt,pt.data)):e.texImage3D(i.TEXTURE_3D,0,At,pt.width,pt.height,pt.depth,0,Ct,zt,pt.data);else if(b.isFramebufferTexture){if(se)if(Zt)e.texStorage2D(i.TEXTURE_2D,bt,At,pt.width,pt.height);else{let ft=pt.width,Rt=pt.height;for(let Dt=0;Dt<bt;Dt++)e.texImage2D(i.TEXTURE_2D,Dt,At,ft,Rt,0,Ct,zt,null),ft>>=1,Rt>>=1}}else if(b.isHTMLTexture){if("texElementImage2D"in i){let ft=i.canvas;if(ft.hasAttribute("layoutsubtree")||ft.setAttribute("layoutsubtree","true"),pt.parentNode!==ft){ft.appendChild(pt),_.add(b),ft.onpaint=Rt=>{let Dt=Rt.changedElements;for(let vt of _)Dt.includes(vt.image)&&(vt.needsUpdate=!0)},ft.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,pt);else{let Dt=i.RGBA,vt=i.RGBA,qt=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,Dt,vt,qt,pt)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(Xt.length>0){if(Zt&&se){let ft=ve(Xt[0]);e.texStorage2D(i.TEXTURE_2D,bt,At,ft.width,ft.height)}for(let ft=0,Rt=Xt.length;ft<Rt;ft++)Et=Xt[ft],Zt?V&&e.texSubImage2D(i.TEXTURE_2D,ft,0,0,Ct,zt,Et):e.texImage2D(i.TEXTURE_2D,ft,At,Ct,zt,Et);b.generateMipmaps=!1}else if(Zt){if(se){let ft=ve(pt);e.texStorage2D(i.TEXTURE_2D,bt,At,ft.width,ft.height)}V&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,Ct,zt,pt)}else e.texImage2D(i.TEXTURE_2D,0,At,Ct,zt,pt);g(b)&&C(K),Tt.__version=Mt.version,b.onUpdate&&b.onUpdate(b)}L.__version=b.version}function Jt(L,b,Y){if(b.image.length!==6)return;let K=fe(L,b),ot=b.source;e.bindTexture(i.TEXTURE_CUBE_MAP,L.__webglTexture,i.TEXTURE0+Y);let Mt=n.get(ot);if(ot.version!==Mt.__version||K===!0){e.activeTexture(i.TEXTURE0+Y);let Tt=we.getPrimaries(we.workingColorSpace),ut=b.colorSpace===Ji?null:we.getPrimaries(b.colorSpace),pt=b.colorSpace===Ji||Tt===ut?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,b.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,b.premultiplyAlpha),e.pixelStorei(i.UNPACK_ALIGNMENT,b.unpackAlignment),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,pt);let Ct=b.isCompressedTexture||b.image[0].isCompressedTexture,zt=b.image[0]&&b.image[0].isDataTexture,At=[];for(let vt=0;vt<6;vt++)!Ct&&!zt?At[vt]=v(b.image[vt],!0,s.maxCubemapSize):At[vt]=zt?b.image[vt].image:b.image[vt],At[vt]=cn(b,At[vt]);let Et=At[0],Xt=r.convert(b.format,b.colorSpace),Zt=r.convert(b.type),se=E(b.internalFormat,Xt,Zt,b.normalized,b.colorSpace),V=b.isVideoTexture!==!0,bt=Mt.__version===void 0||K===!0,ft=ot.dataReady,Rt=R(b,Et);_e(i.TEXTURE_CUBE_MAP,b);let Dt;if(Ct){V&&bt&&e.texStorage2D(i.TEXTURE_CUBE_MAP,Rt,se,Et.width,Et.height);for(let vt=0;vt<6;vt++){Dt=At[vt].mipmaps;for(let qt=0;qt<Dt.length;qt++){let Ht=Dt[qt];b.format!==fi?Xt!==null?V?ft&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+vt,qt,0,0,Ht.width,Ht.height,Xt,Ht.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+vt,qt,se,Ht.width,Ht.height,0,Ht.data):Qt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):V?ft&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+vt,qt,0,0,Ht.width,Ht.height,Xt,Zt,Ht.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+vt,qt,se,Ht.width,Ht.height,0,Xt,Zt,Ht.data)}}}else{if(Dt=b.mipmaps,V&&bt){Dt.length>0&&Rt++;let vt=ve(At[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,Rt,se,vt.width,vt.height)}for(let vt=0;vt<6;vt++)if(zt){V?ft&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+vt,0,0,0,At[vt].width,At[vt].height,Xt,Zt,At[vt].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+vt,0,se,At[vt].width,At[vt].height,0,Xt,Zt,At[vt].data);for(let qt=0;qt<Dt.length;qt++){let Fe=Dt[qt].image[vt].image;V?ft&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+vt,qt+1,0,0,Fe.width,Fe.height,Xt,Zt,Fe.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+vt,qt+1,se,Fe.width,Fe.height,0,Xt,Zt,Fe.data)}}else{V?ft&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+vt,0,0,0,Xt,Zt,At[vt]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+vt,0,se,Xt,Zt,At[vt]);for(let qt=0;qt<Dt.length;qt++){let Ht=Dt[qt];V?ft&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+vt,qt+1,0,0,Xt,Zt,Ht.image[vt]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+vt,qt+1,se,Xt,Zt,Ht.image[vt])}}}g(b)&&C(i.TEXTURE_CUBE_MAP),Mt.__version=ot.version,b.onUpdate&&b.onUpdate(b)}L.__version=b.version}function Ot(L,b,Y,K,ot,Mt){let Tt=r.convert(Y.format,Y.colorSpace),ut=r.convert(Y.type),pt=E(Y.internalFormat,Tt,ut,Y.normalized,Y.colorSpace),Ct=n.get(b),zt=n.get(Y);if(zt.__renderTarget=b,!Ct.__hasExternalTextures){let At=Math.max(1,b.width>>Mt),Et=Math.max(1,b.height>>Mt);ot===i.TEXTURE_3D||ot===i.TEXTURE_2D_ARRAY?e.texImage3D(ot,Mt,pt,At,Et,b.depth,0,Tt,ut,null):e.texImage2D(ot,Mt,pt,At,Et,0,Tt,ut,null)}e.bindFramebuffer(i.FRAMEBUFFER,L),Ze(b)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,K,ot,zt.__webglTexture,0,Ue(b)):(ot===i.TEXTURE_2D||ot>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&ot<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,K,ot,zt.__webglTexture,Mt),e.bindFramebuffer(i.FRAMEBUFFER,null)}function ie(L,b,Y){if(i.bindRenderbuffer(i.RENDERBUFFER,L),b.depthBuffer){let K=b.depthTexture,ot=K&&K.isDepthTexture?K.type:null,Mt=P(b.stencilBuffer,ot),Tt=b.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;Ze(b)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Ue(b),Mt,b.width,b.height):Y?i.renderbufferStorageMultisample(i.RENDERBUFFER,Ue(b),Mt,b.width,b.height):i.renderbufferStorage(i.RENDERBUFFER,Mt,b.width,b.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,Tt,i.RENDERBUFFER,L)}else{let K=b.textures;for(let ot=0;ot<K.length;ot++){let Mt=K[ot],Tt=r.convert(Mt.format,Mt.colorSpace),ut=r.convert(Mt.type),pt=E(Mt.internalFormat,Tt,ut,Mt.normalized,Mt.colorSpace);Ze(b)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Ue(b),pt,b.width,b.height):Y?i.renderbufferStorageMultisample(i.RENDERBUFFER,Ue(b),pt,b.width,b.height):i.renderbufferStorage(i.RENDERBUFFER,pt,b.width,b.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Kt(L,b,Y){let K=b.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(i.FRAMEBUFFER,L),!(b.depthTexture&&b.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let ot=n.get(b.depthTexture);if(ot.__renderTarget=b,(!ot.__webglTexture||b.depthTexture.image.width!==b.width||b.depthTexture.image.height!==b.height)&&(b.depthTexture.image.width=b.width,b.depthTexture.image.height=b.height,b.depthTexture.needsUpdate=!0),K){if(ot.__webglInit===void 0&&(ot.__webglInit=!0,b.depthTexture.addEventListener("dispose",U)),ot.__webglTexture===void 0){ot.__webglTexture=i.createTexture(),e.bindTexture(i.TEXTURE_CUBE_MAP,ot.__webglTexture),_e(i.TEXTURE_CUBE_MAP,b.depthTexture);let Ct=r.convert(b.depthTexture.format),zt=r.convert(b.depthTexture.type),At;b.depthTexture.format===Li?At=i.DEPTH_COMPONENT24:b.depthTexture.format===bs&&(At=i.DEPTH24_STENCIL8);for(let Et=0;Et<6;Et++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Et,0,At,b.width,b.height,0,Ct,zt,null)}}else J(b.depthTexture,0);let Mt=ot.__webglTexture,Tt=Ue(b),ut=K?i.TEXTURE_CUBE_MAP_POSITIVE_X+Y:i.TEXTURE_2D,pt=b.depthTexture.format===bs?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(b.depthTexture.format===Li)Ze(b)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,pt,ut,Mt,0,Tt):i.framebufferTexture2D(i.FRAMEBUFFER,pt,ut,Mt,0);else if(b.depthTexture.format===bs)Ze(b)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,pt,ut,Mt,0,Tt):i.framebufferTexture2D(i.FRAMEBUFFER,pt,ut,Mt,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function oe(L){let b=n.get(L),Y=L.isWebGLCubeRenderTarget===!0;if(b.__boundDepthTexture!==L.depthTexture){let K=L.depthTexture;if(b.__depthDisposeCallback&&b.__depthDisposeCallback(),K){let ot=()=>{delete b.__boundDepthTexture,delete b.__depthDisposeCallback,K.removeEventListener("dispose",ot)};K.addEventListener("dispose",ot),b.__depthDisposeCallback=ot}b.__boundDepthTexture=K}if(L.depthTexture&&!b.__autoAllocateDepthBuffer)if(Y)for(let K=0;K<6;K++)Kt(b.__webglFramebuffer[K],L,K);else{let K=L.texture.mipmaps;K&&K.length>0?Kt(b.__webglFramebuffer[0],L,0):Kt(b.__webglFramebuffer,L,0)}else if(Y){b.__webglDepthbuffer=[];for(let K=0;K<6;K++)if(e.bindFramebuffer(i.FRAMEBUFFER,b.__webglFramebuffer[K]),b.__webglDepthbuffer[K]===void 0)b.__webglDepthbuffer[K]=i.createRenderbuffer(),ie(b.__webglDepthbuffer[K],L,!1);else{let ot=L.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Mt=b.__webglDepthbuffer[K];i.bindRenderbuffer(i.RENDERBUFFER,Mt),i.framebufferRenderbuffer(i.FRAMEBUFFER,ot,i.RENDERBUFFER,Mt)}}else{let K=L.texture.mipmaps;if(K&&K.length>0?e.bindFramebuffer(i.FRAMEBUFFER,b.__webglFramebuffer[0]):e.bindFramebuffer(i.FRAMEBUFFER,b.__webglFramebuffer),b.__webglDepthbuffer===void 0)b.__webglDepthbuffer=i.createRenderbuffer(),ie(b.__webglDepthbuffer,L,!1);else{let ot=L.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Mt=b.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,Mt),i.framebufferRenderbuffer(i.FRAMEBUFFER,ot,i.RENDERBUFFER,Mt)}}e.bindFramebuffer(i.FRAMEBUFFER,null)}function ye(L,b,Y){let K=n.get(L);b!==void 0&&Ot(K.__webglFramebuffer,L,L.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),Y!==void 0&&oe(L)}function ce(L){let b=L.texture,Y=n.get(L),K=n.get(b);L.addEventListener("dispose",y);let ot=L.textures,Mt=L.isWebGLCubeRenderTarget===!0,Tt=ot.length>1;if(Tt||(K.__webglTexture===void 0&&(K.__webglTexture=i.createTexture()),K.__version=b.version,a.memory.textures++),Mt){Y.__webglFramebuffer=[];for(let ut=0;ut<6;ut++)if(b.mipmaps&&b.mipmaps.length>0){Y.__webglFramebuffer[ut]=[];for(let pt=0;pt<b.mipmaps.length;pt++)Y.__webglFramebuffer[ut][pt]=i.createFramebuffer()}else Y.__webglFramebuffer[ut]=i.createFramebuffer()}else{if(b.mipmaps&&b.mipmaps.length>0){Y.__webglFramebuffer=[];for(let ut=0;ut<b.mipmaps.length;ut++)Y.__webglFramebuffer[ut]=i.createFramebuffer()}else Y.__webglFramebuffer=i.createFramebuffer();if(Tt)for(let ut=0,pt=ot.length;ut<pt;ut++){let Ct=n.get(ot[ut]);Ct.__webglTexture===void 0&&(Ct.__webglTexture=i.createTexture(),a.memory.textures++)}if(L.samples>0&&Ze(L)===!1){Y.__webglMultisampledFramebuffer=i.createFramebuffer(),Y.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,Y.__webglMultisampledFramebuffer);for(let ut=0;ut<ot.length;ut++){let pt=ot[ut];Y.__webglColorRenderbuffer[ut]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,Y.__webglColorRenderbuffer[ut]);let Ct=r.convert(pt.format,pt.colorSpace),zt=r.convert(pt.type),At=E(pt.internalFormat,Ct,zt,pt.normalized,pt.colorSpace,L.isXRRenderTarget===!0),Et=Ue(L);i.renderbufferStorageMultisample(i.RENDERBUFFER,Et,At,L.width,L.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+ut,i.RENDERBUFFER,Y.__webglColorRenderbuffer[ut])}i.bindRenderbuffer(i.RENDERBUFFER,null),L.depthBuffer&&(Y.__webglDepthRenderbuffer=i.createRenderbuffer(),ie(Y.__webglDepthRenderbuffer,L,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(Mt){e.bindTexture(i.TEXTURE_CUBE_MAP,K.__webglTexture),_e(i.TEXTURE_CUBE_MAP,b);for(let ut=0;ut<6;ut++)if(b.mipmaps&&b.mipmaps.length>0)for(let pt=0;pt<b.mipmaps.length;pt++)Ot(Y.__webglFramebuffer[ut][pt],L,b,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ut,pt);else Ot(Y.__webglFramebuffer[ut],L,b,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+ut,0);g(b)&&C(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(Tt){for(let ut=0,pt=ot.length;ut<pt;ut++){let Ct=ot[ut],zt=n.get(Ct),At=i.TEXTURE_2D;(L.isWebGL3DRenderTarget||L.isWebGLArrayRenderTarget)&&(At=L.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(At,zt.__webglTexture),_e(At,Ct),Ot(Y.__webglFramebuffer,L,Ct,i.COLOR_ATTACHMENT0+ut,At,0),g(Ct)&&C(At)}e.unbindTexture()}else{let ut=i.TEXTURE_2D;if((L.isWebGL3DRenderTarget||L.isWebGLArrayRenderTarget)&&(ut=L.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(ut,K.__webglTexture),_e(ut,b),b.mipmaps&&b.mipmaps.length>0)for(let pt=0;pt<b.mipmaps.length;pt++)Ot(Y.__webglFramebuffer[pt],L,b,i.COLOR_ATTACHMENT0,ut,pt);else Ot(Y.__webglFramebuffer,L,b,i.COLOR_ATTACHMENT0,ut,0);g(b)&&C(ut),e.unbindTexture()}L.depthBuffer&&oe(L)}function ue(L){let b=L.textures;for(let Y=0,K=b.length;Y<K;Y++){let ot=b[Y];if(g(ot)){let Mt=D(L),Tt=n.get(ot).__webglTexture;e.bindTexture(Mt,Tt),C(Mt),e.unbindTexture()}}}let Ge=[],ln=[];function wn(L){if(L.samples>0){if(Ze(L)===!1){let b=L.textures,Y=L.width,K=L.height,ot=i.COLOR_BUFFER_BIT,Mt=L.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Tt=n.get(L),ut=b.length>1;if(ut)for(let Ct=0;Ct<b.length;Ct++)e.bindFramebuffer(i.FRAMEBUFFER,Tt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ct,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,Tt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ct,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,Tt.__webglMultisampledFramebuffer);let pt=L.texture.mipmaps;pt&&pt.length>0?e.bindFramebuffer(i.DRAW_FRAMEBUFFER,Tt.__webglFramebuffer[0]):e.bindFramebuffer(i.DRAW_FRAMEBUFFER,Tt.__webglFramebuffer);for(let Ct=0;Ct<b.length;Ct++){if(L.resolveDepthBuffer&&(L.depthBuffer&&(ot|=i.DEPTH_BUFFER_BIT),L.stencilBuffer&&L.resolveStencilBuffer&&(ot|=i.STENCIL_BUFFER_BIT)),ut){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,Tt.__webglColorRenderbuffer[Ct]);let zt=n.get(b[Ct]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,zt,0)}i.blitFramebuffer(0,0,Y,K,0,0,Y,K,ot,i.NEAREST),c===!0&&(Ge.length=0,ln.length=0,Ge.push(i.COLOR_ATTACHMENT0+Ct),L.depthBuffer&&L.storeMultisampledDepthBuffer===!1&&(Ge.push(Mt),ln.push(Mt),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,ln)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Ge))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),ut)for(let Ct=0;Ct<b.length;Ct++){e.bindFramebuffer(i.FRAMEBUFFER,Tt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ct,i.RENDERBUFFER,Tt.__webglColorRenderbuffer[Ct]);let zt=n.get(b[Ct]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,Tt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ct,i.TEXTURE_2D,zt,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,Tt.__webglMultisampledFramebuffer)}else if(L.depthBuffer&&L.storeMultisampledDepthBuffer===!1&&c){let b=L.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[b])}}}function Ue(L){return Math.min(s.maxSamples,L.samples)}function Ze(L){let b=n.get(L);return L.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&b.__useRenderToTexture!==!1}function B(L){let b=a.render.frame;d.get(L)!==b&&(d.set(L,b),L.update())}function cn(L,b){let Y=L.colorSpace,K=L.format,ot=L.type;return L.isCompressedTexture===!0||L.isVideoTexture===!0||Y!==Qr&&Y!==Ji&&(we.getTransfer(Y)===De?(K!==fi||ot!==$n)&&Qt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):te("WebGLTextures: Unsupported texture color space:",Y)),b}function ve(L){return typeof HTMLImageElement<"u"&&L instanceof HTMLImageElement?(h.width=L.naturalWidth||L.width,h.height=L.naturalHeight||L.height):typeof VideoFrame<"u"&&L instanceof VideoFrame?(h.width=L.displayWidth,h.height=L.displayHeight):(h.width=L.width,h.height=L.height),h}this.allocateTextureUnit=ct,this.resetTextureUnits=tt,this.getTextureUnits=k,this.setTextureUnits=it,this.setTexture2D=J,this.setTexture2DArray=rt,this.setTexture3D=mt,this.setTextureCube=yt,this.rebindTextures=ye,this.setupRenderTarget=ce,this.updateRenderTargetMipmap=ue,this.updateMultisampleRenderTarget=wn,this.setupDepthRenderbuffer=oe,this.setupFrameBufferTexture=Ot,this.useMultisampledRTT=Ze,this.isReversedDepthBuffer=function(){return e.buffers.depth.getReversed()}}function Ix(i,t){function e(n,s=Ji){let r,a=we.getTransfer(s);if(n===$n)return i.UNSIGNED_BYTE;if(n===vl)return i.UNSIGNED_SHORT_4_4_4_4;if(n===yl)return i.UNSIGNED_SHORT_5_5_5_1;if(n===_h)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===xh)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===mh)return i.BYTE;if(n===gh)return i.SHORT;if(n===Cr)return i.UNSIGNED_SHORT;if(n===xl)return i.INT;if(n===wi)return i.UNSIGNED_INT;if(n===Ti)return i.FLOAT;if(n===Ai)return i.HALF_FLOAT;if(n===vh)return i.ALPHA;if(n===yh)return i.RGB;if(n===fi)return i.RGBA;if(n===Li)return i.DEPTH_COMPONENT;if(n===bs)return i.DEPTH_STENCIL;if(n===Mh)return i.RED;if(n===Ml)return i.RED_INTEGER;if(n===ws)return i.RG;if(n===Sl)return i.RG_INTEGER;if(n===bl)return i.RGBA_INTEGER;if(n===Ta||n===Aa||n===Ea||n===Ca)if(a===De)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Ta)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Aa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Ea)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Ca)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Ta)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Aa)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Ea)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Ca)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===wl||n===Tl||n===Al||n===El)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===wl)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Tl)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Al)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===El)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Cl||n===Rl||n===Pl||n===Il||n===Ll||n===Ra||n===Dl)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Cl||n===Rl)return a===De?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Pl)return a===De?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===Il)return r.COMPRESSED_R11_EAC;if(n===Ll)return r.COMPRESSED_SIGNED_R11_EAC;if(n===Ra)return r.COMPRESSED_RG11_EAC;if(n===Dl)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Nl||n===Ul||n===Fl||n===Ol||n===Bl||n===zl||n===kl||n===Vl||n===Gl||n===Hl||n===Wl||n===Xl||n===ql||n===Yl)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Nl)return a===De?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Ul)return a===De?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Fl)return a===De?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Ol)return a===De?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Bl)return a===De?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===zl)return a===De?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===kl)return a===De?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Vl)return a===De?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Gl)return a===De?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Hl)return a===De?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Wl)return a===De?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Xl)return a===De?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===ql)return a===De?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Yl)return a===De?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Zl||n===$l||n===Jl)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===Zl)return a===De?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===$l)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Jl)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Kl||n===jl||n===Pa||n===Ql)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===Kl)return r.COMPRESSED_RED_RGTC1_EXT;if(n===jl)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Pa)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Ql)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Rr?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}var Lx=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Dx=`
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

}`,Yh=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let n=new la(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=n}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,n=new xn({vertexShader:Lx,fragmentShader:Dx,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new he(new Zi(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Zh=class extends Di{constructor(t,e){super();let n=this,s=null,r=1,a=null,o="local-floor",c=1,h=null,d=null,_=null,u=null,m=null,S=null,T=typeof XRWebGLBinding<"u",v=new Yh,g={},C=e.getContextAttributes(),D=null,E=null,P=[],R=[],U=new Bt,y=null,I=null,O=new Dn;O.viewport=new Je;let W=new Dn;W.viewport=new Je;let q=[O,W],tt=new dl,k=null,it=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(ht){let gt=P[ht];return gt===void 0&&(gt=new yr,P[ht]=gt),gt.getTargetRaySpace()},this.getControllerGrip=function(ht){let gt=P[ht];return gt===void 0&&(gt=new yr,P[ht]=gt),gt.getGripSpace()},this.getHand=function(ht){let gt=P[ht];return gt===void 0&&(gt=new yr,P[ht]=gt),gt.getHandSpace()};function ct(ht){let gt=R.indexOf(ht.inputSource);if(gt===-1)return;let St=P[gt];St!==void 0&&(St.update(ht.inputSource,ht.frame,h||a),St.dispatchEvent({type:ht.type,data:ht.inputSource}))}function at(){s.removeEventListener("select",ct),s.removeEventListener("selectstart",ct),s.removeEventListener("selectend",ct),s.removeEventListener("squeeze",ct),s.removeEventListener("squeezestart",ct),s.removeEventListener("squeezeend",ct),s.removeEventListener("end",at),s.removeEventListener("inputsourceschange",J);for(let ht=0;ht<P.length;ht++){let gt=R[ht];gt!==null&&(R[ht]=null,P[ht].disconnect(gt))}k=null,it=null,v.reset();for(let ht in g)delete g[ht];if(t.setRenderTarget(D),m=null,u=null,_=null,s=null,E=null,fe.stop(),n.isPresenting=!1,t.setPixelRatio(y),t.setSize(U.width,U.height,!1),I!==null){let ht=I.camera;ht.fov=I.fov,ht.zoom=I.zoom,ht.updateProjectionMatrix(),I=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(ht){r=ht,n.isPresenting===!0&&Qt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(ht){o=ht,n.isPresenting===!0&&Qt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return h||a},this.setReferenceSpace=function(ht){h=ht},this.getBaseLayer=function(){return u!==null?u:m},this.getBinding=function(){return _===null&&T&&(_=new XRWebGLBinding(s,e)),_},this.getFrame=function(){return S},this.getSession=function(){return s},this.setSession=async function(ht){if(s=ht,s!==null){if(D=t.getRenderTarget(),s.addEventListener("select",ct),s.addEventListener("selectstart",ct),s.addEventListener("selectend",ct),s.addEventListener("squeeze",ct),s.addEventListener("squeezestart",ct),s.addEventListener("squeezeend",ct),s.addEventListener("end",at),s.addEventListener("inputsourceschange",J),C.xrCompatible!==!0&&await e.makeXRCompatible(),y=t.getPixelRatio(),t.getSize(U),T&&"createProjectionLayer"in XRWebGLBinding.prototype){let St=null,Jt=null,Ot=null;C.depth&&(Ot=C.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,St=C.stencil?bs:Li,Jt=C.stencil?Rr:wi);let ie={colorFormat:e.RGBA8,depthFormat:Ot,scaleFactor:r};_=this.getBinding(),u=_.createProjectionLayer(ie),s.updateRenderState({layers:[u]}),t.setPixelRatio(1),t.setSize(u.textureWidth,u.textureHeight,!1),E=new Yn(u.textureWidth,u.textureHeight,{format:fi,type:$n,depthTexture:new hs(u.textureWidth,u.textureHeight,Jt,void 0,void 0,void 0,void 0,void 0,void 0,St),stencilBuffer:C.stencil,colorSpace:t.outputColorSpace,samples:C.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1,storeMultisampledDepthBuffer:u.ignoreDepthValues===!1,storeMultisampledStencilBuffer:u.ignoreDepthValues===!1})}else{let St={antialias:C.antialias,alpha:!0,depth:C.depth,stencil:C.stencil,framebufferScaleFactor:r};m=new XRWebGLLayer(s,e,St),s.updateRenderState({baseLayer:m}),t.setPixelRatio(1),t.setSize(m.framebufferWidth,m.framebufferHeight,!1),E=new Yn(m.framebufferWidth,m.framebufferHeight,{format:fi,type:$n,colorSpace:t.outputColorSpace,stencilBuffer:C.stencil,resolveDepthBuffer:m.ignoreDepthValues===!1,resolveStencilBuffer:m.ignoreDepthValues===!1,storeMultisampledDepthBuffer:m.ignoreDepthValues===!1,storeMultisampledStencilBuffer:m.ignoreDepthValues===!1})}E.isXRRenderTarget=!0,this.setFoveation(c),h=null,a=await s.requestReferenceSpace(o),fe.setContext(s),fe.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return v.getDepthTexture()};function J(ht){for(let gt=0;gt<ht.removed.length;gt++){let St=ht.removed[gt],Jt=R.indexOf(St);Jt>=0&&(R[Jt]=null,P[Jt].disconnect(St))}for(let gt=0;gt<ht.added.length;gt++){let St=ht.added[gt],Jt=R.indexOf(St);if(Jt===-1){for(let ie=0;ie<P.length;ie++)if(ie>=R.length){R.push(St),Jt=ie;break}else if(R[ie]===null){R[ie]=St,Jt=ie;break}if(Jt===-1)break}let Ot=P[Jt];Ot&&Ot.connect(St)}}let rt=new N,mt=new N;function yt(ht,gt,St){rt.setFromMatrixPosition(gt.matrixWorld),mt.setFromMatrixPosition(St.matrixWorld);let Jt=rt.distanceTo(mt),Ot=gt.projectionMatrix.elements,ie=St.projectionMatrix.elements,Kt=Ot[14]/(Ot[10]-1),oe=Ot[14]/(Ot[10]+1),ye=(Ot[9]+1)/Ot[5],ce=(Ot[9]-1)/Ot[5],ue=(Ot[8]-1)/Ot[0],Ge=(ie[8]+1)/ie[0],ln=Kt*ue,wn=Kt*Ge,Ue=Jt/(-ue+Ge),Ze=Ue*-ue;if(gt.matrixWorld.decompose(ht.position,ht.quaternion,ht.scale),ht.translateX(Ze),ht.translateZ(Ue),ht.matrixWorld.compose(ht.position,ht.quaternion,ht.scale),ht.matrixWorldInverse.copy(ht.matrixWorld).invert(),Ot[10]===-1)ht.projectionMatrix.copy(gt.projectionMatrix),ht.projectionMatrixInverse.copy(gt.projectionMatrixInverse);else{let B=Kt+Ue,cn=oe+Ue,ve=ln-Ze,L=wn+(Jt-Ze),b=ye*oe/cn*B,Y=ce*oe/cn*B;ht.projectionMatrix.makePerspective(ve,L,b,Y,B,cn),ht.projectionMatrixInverse.copy(ht.projectionMatrix).invert()}}function $t(ht,gt){gt===null?ht.matrixWorld.copy(ht.matrix):ht.matrixWorld.multiplyMatrices(gt.matrixWorld,ht.matrix),ht.matrixWorldInverse.copy(ht.matrixWorld).invert()}this.updateCamera=function(ht){if(s===null)return;let gt=ht.near,St=ht.far;v.texture!==null&&(v.depthNear>0&&(gt=v.depthNear),v.depthFar>0&&(St=v.depthFar)),tt.near=W.near=O.near=gt,tt.far=W.far=O.far=St,(k!==tt.near||it!==tt.far)&&(s.updateRenderState({depthNear:tt.near,depthFar:tt.far}),k=tt.near,it=tt.far),tt.layers.mask=ht.layers.mask|6,O.layers.mask=tt.layers.mask&-5,W.layers.mask=tt.layers.mask&-3;let Jt=ht.parent,Ot=tt.cameras;$t(tt,Jt);for(let ie=0;ie<Ot.length;ie++)$t(Ot[ie],Jt);Ot.length===2?yt(tt,O,W):tt.projectionMatrix.copy(O.projectionMatrix),I===null&&ht.isPerspectiveCamera&&(I={camera:ht,fov:ht.fov,zoom:ht.zoom}),Wt(ht,tt,Jt)};function Wt(ht,gt,St){St===null?ht.matrix.copy(gt.matrixWorld):(ht.matrix.copy(St.matrixWorld),ht.matrix.invert(),ht.matrix.multiply(gt.matrixWorld)),ht.matrix.decompose(ht.position,ht.quaternion,ht.scale),ht.updateMatrixWorld(!0),ht.projectionMatrix.copy(gt.projectionMatrix),ht.projectionMatrixInverse.copy(gt.projectionMatrixInverse),ht.isPerspectiveCamera&&(ht.fov=Fo*2*Math.atan(1/ht.projectionMatrix.elements[5]),ht.zoom=1)}this.getCamera=function(){return tt},this.getFoveation=function(){if(!(u===null&&m===null))return c},this.setFoveation=function(ht){c=ht,u!==null&&(u.fixedFoveation=ht),m!==null&&m.fixedFoveation!==void 0&&(m.fixedFoveation=ht)},this.hasDepthSensing=function(){return v.texture!==null},this.getDepthSensingMesh=function(){return v.getMesh(tt)},this.getCameraTexture=function(ht){return g[ht]};let Ae=null;function _e(ht,gt){if(d=gt.getViewerPose(h||a),S=gt,d!==null){let St=d.views;m!==null&&(t.setRenderTargetFramebuffer(E,m.framebuffer),t.setRenderTarget(E));let Jt=!1;St.length!==tt.cameras.length&&(tt.cameras.length=0,Jt=!0);for(let oe=0;oe<St.length;oe++){let ye=St[oe],ce=null;if(m!==null)ce=m.getViewport(ye);else{let Ge=_.getViewSubImage(u,ye);ce=Ge.viewport,oe===0&&(t.setRenderTargetTextures(E,Ge.colorTexture,Ge.depthStencilTexture),t.setRenderTarget(E))}let ue=q[oe];ue===void 0&&(ue=new Dn,ue.layers.enable(oe),ue.viewport=new Je,q[oe]=ue),ue.matrix.fromArray(ye.transform.matrix),ue.matrix.decompose(ue.position,ue.quaternion,ue.scale),ue.projectionMatrix.fromArray(ye.projectionMatrix),ue.projectionMatrixInverse.copy(ue.projectionMatrix).invert(),ue.viewport.set(ce.x,ce.y,ce.width,ce.height),oe===0&&(tt.matrix.copy(ue.matrix),tt.matrix.decompose(tt.position,tt.quaternion,tt.scale)),Jt===!0&&tt.cameras.push(ue)}let Ot=s.enabledFeatures;if(Ot&&Ot.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&T){_=n.getBinding();let oe=_.getDepthInformation(St[0]);oe&&oe.isValid&&oe.texture&&v.init(oe,s.renderState)}if(Ot&&Ot.includes("camera-access")&&T){t.state.unbindTexture(),_=n.getBinding();for(let oe=0;oe<St.length;oe++){let ye=St[oe].camera;if(ye){let ce=g[ye];ce||(ce=new la,g[ye]=ce);let ue=_.getCameraImage(ye);ce.sourceTexture=ue}}}}for(let St=0;St<P.length;St++){let Jt=R[St],Ot=P[St];Jt!==null&&Ot!==void 0&&Ot.update(Jt,gt,h||a)}Ae&&Ae(ht,gt),gt.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:gt}),S=null}let fe=new af;fe.setAnimationLoop(_e),this.setAnimationLoop=function(ht){Ae=ht},this.dispose=function(){}}},Nx=new ze,df=new ae;df.set(-1,0,0,0,1,0,0,0,1);function Ux(i,t){function e(v,g){v.matrixAutoUpdate===!0&&v.updateMatrix(),g.value.copy(v.matrix)}function n(v,g){g.color.getRGB(v.fogColor.value,Th(i)),g.isFog?(v.fogNear.value=g.near,v.fogFar.value=g.far):g.isFogExp2&&(v.fogDensity.value=g.density)}function s(v,g,C,D,E){g.isNodeMaterial?g.uniformsNeedUpdate=!1:g.isMeshBasicMaterial?r(v,g):g.isMeshLambertMaterial?(r(v,g),g.envMap&&(v.envMapIntensity.value=g.envMapIntensity)):g.isMeshToonMaterial?(r(v,g),_(v,g)):g.isMeshPhongMaterial?(r(v,g),d(v,g),g.envMap&&(v.envMapIntensity.value=g.envMapIntensity)):g.isMeshStandardMaterial?(r(v,g),u(v,g),g.isMeshPhysicalMaterial&&m(v,g,E)):g.isMeshMatcapMaterial?(r(v,g),S(v,g)):g.isMeshDepthMaterial?r(v,g):g.isMeshDistanceMaterial?(r(v,g),T(v,g)):g.isMeshNormalMaterial?r(v,g):g.isLineBasicMaterial?(a(v,g),g.isLineDashedMaterial&&o(v,g)):g.isPointsMaterial?c(v,g,C,D):g.isSpriteMaterial?h(v,g):g.isShadowMaterial?(v.color.value.copy(g.color),v.opacity.value=g.opacity):g.isShaderMaterial&&(g.uniformsNeedUpdate=!1)}function r(v,g){v.opacity.value=g.opacity,g.color&&v.diffuse.value.copy(g.color),g.emissive&&v.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity),g.map&&(v.map.value=g.map,e(g.map,v.mapTransform)),g.alphaMap&&(v.alphaMap.value=g.alphaMap,e(g.alphaMap,v.alphaMapTransform)),g.bumpMap&&(v.bumpMap.value=g.bumpMap,e(g.bumpMap,v.bumpMapTransform),v.bumpScale.value=g.bumpScale,g.side===bn&&(v.bumpScale.value*=-1)),g.normalMap&&(v.normalMap.value=g.normalMap,e(g.normalMap,v.normalMapTransform),v.normalScale.value.copy(g.normalScale),g.side===bn&&v.normalScale.value.negate()),g.displacementMap&&(v.displacementMap.value=g.displacementMap,e(g.displacementMap,v.displacementMapTransform),v.displacementScale.value=g.displacementScale,v.displacementBias.value=g.displacementBias),g.emissiveMap&&(v.emissiveMap.value=g.emissiveMap,e(g.emissiveMap,v.emissiveMapTransform)),g.specularMap&&(v.specularMap.value=g.specularMap,e(g.specularMap,v.specularMapTransform)),g.alphaTest>0&&(v.alphaTest.value=g.alphaTest);let C=t.get(g),D=C.envMap,E=C.envMapRotation;D&&(v.envMap.value=D,v.envMapRotation.value.setFromMatrix4(Nx.makeRotationFromEuler(E)).transpose(),D.isCubeTexture&&D.isRenderTargetTexture===!1&&v.envMapRotation.value.premultiply(df),v.reflectivity.value=g.reflectivity,v.ior.value=g.ior,v.refractionRatio.value=g.refractionRatio),g.lightMap&&(v.lightMap.value=g.lightMap,v.lightMapIntensity.value=g.lightMapIntensity,e(g.lightMap,v.lightMapTransform)),g.aoMap&&(v.aoMap.value=g.aoMap,v.aoMapIntensity.value=g.aoMapIntensity,e(g.aoMap,v.aoMapTransform))}function a(v,g){v.diffuse.value.copy(g.color),v.opacity.value=g.opacity,g.map&&(v.map.value=g.map,e(g.map,v.mapTransform))}function o(v,g){v.dashSize.value=g.dashSize,v.totalSize.value=g.dashSize+g.gapSize,v.scale.value=g.scale}function c(v,g,C,D){v.diffuse.value.copy(g.color),v.opacity.value=g.opacity,v.size.value=g.size*C,v.scale.value=D*.5,g.map&&(v.map.value=g.map,e(g.map,v.uvTransform)),g.alphaMap&&(v.alphaMap.value=g.alphaMap,e(g.alphaMap,v.alphaMapTransform)),g.alphaTest>0&&(v.alphaTest.value=g.alphaTest)}function h(v,g){v.diffuse.value.copy(g.color),v.opacity.value=g.opacity,v.rotation.value=g.rotation,g.map&&(v.map.value=g.map,e(g.map,v.mapTransform)),g.alphaMap&&(v.alphaMap.value=g.alphaMap,e(g.alphaMap,v.alphaMapTransform)),g.alphaTest>0&&(v.alphaTest.value=g.alphaTest)}function d(v,g){v.specular.value.copy(g.specular),v.shininess.value=Math.max(g.shininess,1e-4)}function _(v,g){g.gradientMap&&(v.gradientMap.value=g.gradientMap)}function u(v,g){v.metalness.value=g.metalness,g.metalnessMap&&(v.metalnessMap.value=g.metalnessMap,e(g.metalnessMap,v.metalnessMapTransform)),v.roughness.value=g.roughness,g.roughnessMap&&(v.roughnessMap.value=g.roughnessMap,e(g.roughnessMap,v.roughnessMapTransform)),g.envMap&&(v.envMapIntensity.value=g.envMapIntensity)}function m(v,g,C){v.ior.value=g.ior,g.sheen>0&&(v.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen),v.sheenRoughness.value=g.sheenRoughness,g.sheenColorMap&&(v.sheenColorMap.value=g.sheenColorMap,e(g.sheenColorMap,v.sheenColorMapTransform)),g.sheenRoughnessMap&&(v.sheenRoughnessMap.value=g.sheenRoughnessMap,e(g.sheenRoughnessMap,v.sheenRoughnessMapTransform))),g.clearcoat>0&&(v.clearcoat.value=g.clearcoat,v.clearcoatRoughness.value=g.clearcoatRoughness,g.clearcoatMap&&(v.clearcoatMap.value=g.clearcoatMap,e(g.clearcoatMap,v.clearcoatMapTransform)),g.clearcoatRoughnessMap&&(v.clearcoatRoughnessMap.value=g.clearcoatRoughnessMap,e(g.clearcoatRoughnessMap,v.clearcoatRoughnessMapTransform)),g.clearcoatNormalMap&&(v.clearcoatNormalMap.value=g.clearcoatNormalMap,e(g.clearcoatNormalMap,v.clearcoatNormalMapTransform),v.clearcoatNormalScale.value.copy(g.clearcoatNormalScale),g.side===bn&&v.clearcoatNormalScale.value.negate())),g.dispersion>0&&(v.dispersion.value=g.dispersion),g.retroreflectivity>0&&(v.retroreflectivity.value=g.retroreflectivity),g.iridescence>0&&(v.iridescence.value=g.iridescence,v.iridescenceIOR.value=g.iridescenceIOR,v.iridescenceThicknessMinimum.value=g.iridescenceThicknessRange[0],v.iridescenceThicknessMaximum.value=g.iridescenceThicknessRange[1],g.iridescenceMap&&(v.iridescenceMap.value=g.iridescenceMap,e(g.iridescenceMap,v.iridescenceMapTransform)),g.iridescenceThicknessMap&&(v.iridescenceThicknessMap.value=g.iridescenceThicknessMap,e(g.iridescenceThicknessMap,v.iridescenceThicknessMapTransform))),g.transmission>0&&(v.transmission.value=g.transmission,v.transmissionSamplerMap.value=C.texture,v.transmissionSamplerSize.value.set(C.width,C.height),g.transmissionMap&&(v.transmissionMap.value=g.transmissionMap,e(g.transmissionMap,v.transmissionMapTransform)),v.thickness.value=g.thickness,g.thicknessMap&&(v.thicknessMap.value=g.thicknessMap,e(g.thicknessMap,v.thicknessMapTransform)),v.attenuationDistance.value=g.attenuationDistance,v.attenuationColor.value.copy(g.attenuationColor)),g.anisotropy>0&&(v.anisotropyVector.value.set(g.anisotropy*Math.cos(g.anisotropyRotation),g.anisotropy*Math.sin(g.anisotropyRotation)),g.anisotropyMap&&(v.anisotropyMap.value=g.anisotropyMap,e(g.anisotropyMap,v.anisotropyMapTransform))),v.specularIntensity.value=g.specularIntensity,v.specularColor.value.copy(g.specularColor),g.specularColorMap&&(v.specularColorMap.value=g.specularColorMap,e(g.specularColorMap,v.specularColorMapTransform)),g.specularIntensityMap&&(v.specularIntensityMap.value=g.specularIntensityMap,e(g.specularIntensityMap,v.specularIntensityMapTransform))}function S(v,g){g.matcap&&(v.matcap.value=g.matcap)}function T(v,g){let C=t.get(g).light;v.referencePosition.value.setFromMatrixPosition(C.matrixWorld),v.nearDistance.value=C.shadow.camera.near,v.farDistance.value=C.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function Fx(i,t,e,n){let s={},r={},a=[],o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function c(E,P){let R=P.program;n.uniformBlockBinding(E,R)}function h(E,P){let R=s[E.id];R===void 0&&(v(E),R=d(E),s[E.id]=R,E.addEventListener("dispose",C));let U=P.program;n.updateUBOMapping(E,U);let y=t.render.frame;r[E.id]!==y&&(u(E),r[E.id]=y)}function d(E){let P=_();E.__bindingPointIndex=P;let R=i.createBuffer(),U=E.__size,y=E.usage;return i.bindBuffer(i.UNIFORM_BUFFER,R),i.bufferData(i.UNIFORM_BUFFER,U,y),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,P,R),R}function _(){for(let E=0;E<o;E++)if(a.indexOf(E)===-1)return a.push(E),E;return te("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(E){let P=s[E.id],R=E.uniforms,U=E.__cache;i.bindBuffer(i.UNIFORM_BUFFER,P);for(let y=0,I=R.length;y<I;y++){let O=R[y];if(Array.isArray(O))for(let W=0,q=O.length;W<q;W++)m(O[W],y,W,U);else m(O,y,0,U)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function m(E,P,R,U){if(T(E,P,R,U)===!0){let y=E.__offset,I=E.value;if(Array.isArray(I)){let O=0;for(let W=0;W<I.length;W++){let q=I[W],tt=g(q);S(q,E.__data,O),typeof q!="number"&&typeof q!="boolean"&&!q.isMatrix3&&!ArrayBuffer.isView(q)&&(O+=tt.storage/Float32Array.BYTES_PER_ELEMENT)}}else S(I,E.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,y,E.__data)}}function S(E,P,R){typeof E=="number"||typeof E=="boolean"?P[0]=E:E.isMatrix3?(P[0]=E.elements[0],P[1]=E.elements[1],P[2]=E.elements[2],P[3]=0,P[4]=E.elements[3],P[5]=E.elements[4],P[6]=E.elements[5],P[7]=0,P[8]=E.elements[6],P[9]=E.elements[7],P[10]=E.elements[8],P[11]=0):ArrayBuffer.isView(E)?P.set(new E.constructor(E.buffer,E.byteOffset,P.length)):E.toArray(P,R)}function T(E,P,R,U){let y=E.value,I=P+"_"+R;if(U[I]===void 0)return typeof y=="number"||typeof y=="boolean"?U[I]=y:ArrayBuffer.isView(y)?U[I]=y.slice():U[I]=y.clone(),!0;{let O=U[I];if(typeof y=="number"||typeof y=="boolean"){if(O!==y)return U[I]=y,!0}else{if(ArrayBuffer.isView(y))return!0;if(O.equals(y)===!1)return O.copy(y),!0}}return!1}function v(E){let P=E.uniforms,R=0,U=16;for(let I=0,O=P.length;I<O;I++){let W=Array.isArray(P[I])?P[I]:[P[I]];for(let q=0,tt=W.length;q<tt;q++){let k=W[q],it=Array.isArray(k.value)?k.value:[k.value];for(let ct=0,at=it.length;ct<at;ct++){let J=it[ct],rt=g(J),mt=R%U,yt=mt%rt.boundary,$t=mt+yt;R+=yt,$t!==0&&U-$t<rt.storage&&(R+=U-$t),k.__data=new Float32Array(rt.storage/Float32Array.BYTES_PER_ELEMENT),k.__offset=R,R+=rt.storage}}}let y=R%U;return y>0&&(R+=U-y),E.__size=R,E.__cache={},this}function g(E){let P={boundary:0,storage:0};return typeof E=="number"||typeof E=="boolean"?(P.boundary=4,P.storage=4):E.isVector2?(P.boundary=8,P.storage=8):E.isVector3||E.isColor?(P.boundary=16,P.storage=12):E.isVector4?(P.boundary=16,P.storage=16):E.isMatrix3?(P.boundary=48,P.storage=48):E.isMatrix4?(P.boundary=64,P.storage=64):E.isTexture?Qt("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(E)?(P.boundary=16,P.storage=E.byteLength):Qt("WebGLRenderer: Unsupported uniform value type.",E),P}function C(E){let P=E.target;P.removeEventListener("dispose",C);let R=a.indexOf(P.__bindingPointIndex);a.splice(R,1),i.deleteBuffer(s[P.id]),delete s[P.id],delete r[P.id]}function D(){for(let E in s)i.deleteBuffer(s[E]);a=[],s={},r={}}return{bind:c,update:h,dispose:D}}var Ox=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Fi=null;function Bx(){return Fi===null&&(Fi=new Vo(Ox,16,16,ws,Ai),Fi.name="DFG_LUT",Fi.minFilter=Cn,Fi.magFilter=Cn,Fi.wrapS=Ii,Fi.wrapT=Ii,Fi.generateMipmaps=!1,Fi.needsUpdate=!0),Fi}var oc=class{constructor(t={}){let{canvas:e=Rd(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:h=!1,powerPreference:d="default",failIfMajorPerformanceCaveat:_=!1,reversedDepthBuffer:u=!1,outputBufferType:m=$n}=t;this.isWebGLRenderer=!0;let S;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");S=n.getContextAttributes().alpha}else S=a;let T=m,v=new Set([bl,Sl,Ml]),g=new Set([$n,wi,Cr,Rr,vl,yl]),C=new Uint32Array(4),D=new Int32Array(4),E=new N,P=null,R=null,U=[],y=[],I=null;this.domElement=e,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=bi,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let O=this,W=!1,q=null,tt=null,k=null,it=null;this._outputColorSpace=gn;let ct=0,at=0,J=null,rt=-1,mt=null,yt=new Je,$t=new Je,Wt=null,Ae=new jt(0),_e=0,fe=e.width,ht=e.height,gt=1,St=null,Jt=null,Ot=new Je(0,0,fe,ht),ie=new Je(0,0,fe,ht),Kt=!1,oe=new Mr,ye=!1,ce=!1,ue=new ze,Ge=new N,ln=new Je,wn={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Ue=!1;function Ze(){return J===null?gt:1}let B=n;function cn(w,z){return e.getContext(w,z)}let ve,L,b,Y,K,ot,Mt,Tt,ut,pt,Ct,zt,At,Et,Xt,Zt,se,V,bt,ft,Rt,Dt,vt;try{let w={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:c,preserveDrawingBuffer:h,powerPreference:d,failIfMajorPerformanceCaveat:_};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${"186"}`),e.addEventListener("webglcontextlost",Fe,!1),e.addEventListener("webglcontextrestored",Ce,!1),e.addEventListener("webglcontextcreationerror",Tn,!1),B===null){let z="webgl2";if(B=cn(z,w),B===null)throw cn(z)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}qt()}catch(w){throw e.removeEventListener("webglcontextlost",Fe,!1),e.removeEventListener("webglcontextrestored",Ce,!1),e.removeEventListener("webglcontextcreationerror",Tn,!1),te("WebGLRenderer: "+w.message),w}function qt(){ve=new Xg(B),ve.init(),Rt=new Ix(B,ve),L=new Ug(B,ve,t,Rt),b=new Rx(B,ve),L.reversedDepthBuffer&&u&&b.buffers.depth.setReversed(!0),tt=B.createFramebuffer(),k=B.createFramebuffer(),it=B.createFramebuffer(),Y=new Zg(B),K=new mx,ot=new Px(B,ve,b,K,L,Rt,Y),Mt=new Wg(O),Tt=new Jp(B),Dt=new Dg(B,Tt),ut=new qg(B,Tt,Y,Dt),pt=new Jg(B,ut,Tt,Dt,Y),V=new $g(B,L,ot),Xt=new Fg(K),Ct=new px(O,Mt,ve,L,Dt,Xt),zt=new Ux(O,K),At=new _x,Et=new bx(ve),se=new Lg(O,Mt,b,pt,S,c),Zt=new Cx(O,pt,L),vt=new Fx(B,Y,L,b),bt=new Ng(B,ve,Y),ft=new Yg(B,ve,Y),Y.programs=Ct.programs,O.capabilities=L,O.extensions=ve,O.properties=K,O.renderLists=At,O.shadowMap=Zt,O.state=b,O.info=Y}T!==$n&&(I=new jg(T,e.width,e.height,o,s,r));let Ht=new Zh(O,B);this.xr=Ht,this.getContext=function(){return B},this.getContextAttributes=function(){return B.getContextAttributes()},this.forceContextLoss=function(){let w=ve.get("WEBGL_lose_context");w&&w.loseContext()},this.forceContextRestore=function(){let w=ve.get("WEBGL_lose_context");w&&w.restoreContext()},this.getPixelRatio=function(){return gt},this.setPixelRatio=function(w){w!==void 0&&(gt=w,this.setSize(fe,ht,!1))},this.getSize=function(w){return w.set(fe,ht)},this.setSize=function(w,z,st=!0){if(Ht.isPresenting){Qt("WebGLRenderer: Can't change size while VR device is presenting.");return}fe=w,ht=z,e.width=Math.floor(w*gt),e.height=Math.floor(z*gt),st===!0&&(e.style.width=w+"px",e.style.height=z+"px"),I!==null&&I.setSize(e.width,e.height),this.setViewport(0,0,w,z)},this.getDrawingBufferSize=function(w){return w.set(fe*gt,ht*gt).floor()},this.setDrawingBufferSize=function(w,z,st){fe=w,ht=z,gt=st,e.width=Math.floor(w*st),e.height=Math.floor(z*st),this.setViewport(0,0,w,z)},this.setEffects=function(w){if(T===$n){te("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(w){for(let z=0;z<w.length;z++)if(w[z].isOutputPass===!0){Qt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}I.setEffects(w||[])},this.getCurrentViewport=function(w){return w.copy(yt)},this.getViewport=function(w){return w.copy(Ot)},this.setViewport=function(w,z,st,j){w.isVector4?Ot.set(w.x,w.y,w.z,w.w):Ot.set(w,z,st,j),b.viewport(yt.copy(Ot).multiplyScalar(gt).round())},this.getScissor=function(w){return w.copy(ie)},this.setScissor=function(w,z,st,j){w.isVector4?ie.set(w.x,w.y,w.z,w.w):ie.set(w,z,st,j),b.scissor($t.copy(ie).multiplyScalar(gt).round())},this.getScissorTest=function(){return Kt},this.setScissorTest=function(w){b.setScissorTest(Kt=w)},this.setOpaqueSort=function(w){St=w},this.setTransparentSort=function(w){Jt=w},this.getClearColor=function(w){return w.copy(se.getClearColor())},this.setClearColor=function(){se.setClearColor(...arguments)},this.getClearAlpha=function(){return se.getClearAlpha()},this.setClearAlpha=function(){se.setClearAlpha(...arguments)},this.clear=function(w=!0,z=!0,st=!0){let j=0;if(w){let $=!1;if(J!==null){let It=J.texture.format;$=v.has(It)}if($){let It=J.texture.type,Ft=g.has(It),Pt=se.getClearColor(),et=se.getClearAlpha(),Gt=Pt.r,re=Pt.g,pe=Pt.b;Ft?(C[0]=Gt,C[1]=re,C[2]=pe,C[3]=et,B.clearBufferuiv(B.COLOR,0,C)):(D[0]=Gt,D[1]=re,D[2]=pe,D[3]=et,B.clearBufferiv(B.COLOR,0,D))}else j|=B.COLOR_BUFFER_BIT}z&&(j|=B.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),st&&(j|=B.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),j!==0&&B.clear(j)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(w){w.setRenderer(this),q=w},this.dispose=function(){e.removeEventListener("webglcontextlost",Fe,!1),e.removeEventListener("webglcontextrestored",Ce,!1),e.removeEventListener("webglcontextcreationerror",Tn,!1),se.dispose(),At.dispose(),Et.dispose(),K.dispose(),Mt.dispose(),pt.dispose(),Dt.dispose(),vt.dispose(),Ct.dispose(),Ht.dispose(),Ht.removeEventListener("sessionstart",Nr),Ht.removeEventListener("sessionend",za),Bi.stop()};function Fe(w){w.preventDefault(),ea("WebGLRenderer: Context Lost."),W=!0}function Ce(){ea("WebGLRenderer: Context Restored."),W=!1;let w=Y.autoReset,z=Zt.enabled,st=Zt.autoUpdate,j=Zt.needsUpdate,$=Zt.type;qt(),Y.autoReset=w,Zt.enabled=z,Zt.autoUpdate=st,Zt.needsUpdate=j,Zt.type=$}function Tn(w){te("WebGLRenderer: A WebGL context could not be created. Reason: ",w.statusMessage)}function kn(w){let z=w.target;z.removeEventListener("dispose",kn),Vs(z)}function Vs(w){Fa(w),K.remove(w)}function Fa(w){let z=K.get(w).programs;z!==void 0&&(z.forEach(function(st){Ct.releaseProgram(st)}),w.isShaderMaterial&&Ct.releaseShaderCache(w))}this.renderBufferDirect=function(w,z,st,j,$,It){z===null&&(z=wn);let Ft=$.isMesh&&$.matrixWorld.determinantAffine()<0,Pt=Ga(w,z,st,j,$);b.setMaterial(j,Ft);let et=st.index,Gt=1;if(j.wireframe===!0){if(et=ut.getWireframeAttribute(st),et===void 0)return;Gt=2}let re=st.drawRange,pe=st.attributes.position,Vt=re.start*Gt,me=(re.start+re.count)*Gt;It!==null&&(Vt=Math.max(Vt,It.start*Gt),me=Math.min(me,(It.start+It.count)*Gt)),et!==null?(Vt=Math.max(Vt,0),me=Math.min(me,et.count)):pe!=null&&(Vt=Math.max(Vt,0),me=Math.min(me,pe.count));let We=me-Vt;if(We<0||We===1/0)return;Dt.setup($,j,Pt,st,et);let Oe,Ee=bt;if(et!==null&&(Oe=Tt.get(et),Ee=ft,Ee.setIndex(Oe)),$.isMesh)j.wireframe===!0?(b.setLineWidth(j.wireframeLinewidth*Ze()),Ee.setMode(B.LINES)):Ee.setMode(B.TRIANGLES);else if($.isLine){let fn=j.linewidth;fn===void 0&&(fn=1),b.setLineWidth(fn*Ze()),$.isLineSegments?Ee.setMode(B.LINES):$.isLineLoop?Ee.setMode(B.LINE_LOOP):Ee.setMode(B.LINE_STRIP)}else $.isPoints?Ee.setMode(B.POINTS):$.isSprite&&Ee.setMode(B.TRIANGLES);if($.isBatchedMesh)if(ve.get("WEBGL_multi_draw"))Ee.renderMultiDraw($._multiDrawStarts,$._multiDrawCounts,$._multiDrawCount);else{let fn=$._multiDrawStarts,Ut=$._multiDrawCounts,pn=$._multiDrawCount,Me=et?Tt.get(et).bytesPerElement:1,An=K.get(j).currentProgram.getUniforms();for(let jn=0;jn<pn;jn++)An.setValue(B,"_gl_DrawID",jn),Ee.render(fn[jn]/Me,Ut[jn])}else if($.isInstancedMesh)Ee.renderInstances(Vt,We,$.count);else if(st.isInstancedBufferGeometry){let fn=st._maxInstanceCount!==void 0?st._maxInstanceCount:1/0,Ut=Math.min(st.instanceCount,fn);Ee.renderInstances(Vt,We,Ut)}else Ee.render(Vt,We)};function Oa(w,z,st,j){q!==null&&w.isNodeMaterial&&q.setObject(j,w),ye===!0&&Xt.setState(w,st,!1),w.transparent===!0&&w.side===Zn&&w.forceSinglePass===!1?(w.side=bn,w.needsUpdate=!0,Kn(w,z,j),w.side=vs,w.needsUpdate=!0,Kn(w,z,j),w.side=Zn):Kn(w,z,j)}this.compile=function(w,z,st=null){st===null&&(st=w),q!==null&&q.renderStart(w,z,st),R=Et.get(st),R.init(z),y.push(R),st.traverseVisible(function($){$.isLight&&$.layers.test(z.layers)&&(R.pushLight($),$.castShadow&&R.pushShadow($))}),w!==st&&w.traverseVisible(function($){$.isLight&&$.layers.test(z.layers)&&(R.pushLight($),$.castShadow&&R.pushShadow($))}),R.setupLights(),q!==null&&q.updateLights(R.state.lightsArray),ce=this.localClippingEnabled,ye=Xt.init(this.clippingPlanes,ce),ye===!0&&Xt.setGlobalState(this.clippingPlanes,z),q!==null&&Zt.render(R.state.shadowsArray,st,z);let j=new Set;return w.traverse(function($){if(!($.isMesh||$.isPoints||$.isLine||$.isSprite))return;let It=$.material;if(It)if(Array.isArray(It))for(let Ft=0;Ft<It.length;Ft++){let Pt=It[Ft];Oa(Pt,st,z,$),j.add(Pt)}else Oa(It,st,z,$),j.add(It)}),R=y.pop(),q!==null&&q.renderEnd(),j},this.compileAsync=function(w,z,st=null){let j=this.compile(w,z,st);return new Promise($=>{function It(){if(j.forEach(function(Ft){let et=K.get(Ft).currentProgram;(et===void 0||et.isReady())&&j.delete(Ft)}),j.size===0){$(w);return}setTimeout(It,10)}ve.get("KHR_parallel_shader_compile")!==null?It():setTimeout(It,10)})};let Nt=null;function Ba(w){Nt&&Nt(w)}function Nr(){Bi.stop()}function za(){Bi.start()}let Bi=new af;Bi.setAnimationLoop(Ba),typeof self<"u"&&Bi.setContext(self),this.setAnimationLoop=function(w){Nt=w,Ht.setAnimationLoop(w),w===null?Bi.stop():Bi.start()},Ht.addEventListener("sessionstart",Nr),Ht.addEventListener("sessionend",za),this.render=function(w,z){if(z!==void 0&&z.isCamera!==!0){te("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(W===!0)return;q!==null&&q.renderStart(w,z);let st=Ht.enabled===!0&&Ht.isPresenting===!0,j=I!==null&&(J===null||st)&&I.begin(O,J);if(w.matrixWorldAutoUpdate===!0&&w.updateMatrixWorld(),z.parent===null&&z.matrixWorldAutoUpdate===!0&&z.updateMatrixWorld(),Ht.enabled===!0&&Ht.isPresenting===!0&&(I===null||I.isCompositing()===!1)&&(Ht.cameraAutoUpdate===!0&&Ht.updateCamera(z),z=Ht.getCamera()),w.isScene===!0&&w.onBeforeRender(O,w,z,J),R=Et.get(w,y.length),R.init(z),R.state.textureUnits=ot.getTextureUnits(),y.push(R),ue.multiplyMatrices(z.projectionMatrix,z.matrixWorldInverse),oe.setFromProjectionMatrix(ue,vi,z.reversedDepth),ce=this.localClippingEnabled,ye=Xt.init(this.clippingPlanes,ce),P=At.get(w,U.length),P.init(),U.push(P),Ht.enabled===!0&&Ht.isPresenting===!0){let Ft=O.xr.getDepthSensingMesh();Ft!==null&&Ur(Ft,z,-1/0,O.sortObjects)}Ur(w,z,0,O.sortObjects),P.finish(),q!==null&&q.updateLights(R.state.lightsArray),O.sortObjects===!0&&P.sort(St,Jt),Ue=Ht.enabled===!1||Ht.isPresenting===!1||Ht.hasDepthSensing()===!1,Ue&&se.addToRenderList(P,w),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),ye===!0&&Xt.beginShadows();let $=R.state.shadowsArray;if(Zt.render($,w,z),ye===!0&&Xt.endShadows(),(j&&I.hasRenderPass())===!1){let Ft=P.opaque,Pt=P.transmissive;if(R.setupLights(),z.isArrayCamera){let et=z.cameras;if(Pt.length>0)for(let Gt=0,re=et.length;Gt<re;Gt++){let pe=et[Gt];Fr(Ft,Pt,w,pe)}Ue&&se.render(w);for(let Gt=0,re=et.length;Gt<re;Gt++){let pe=et[Gt];_t(P,w,pe,pe.viewport)}}else Pt.length>0&&Fr(Ft,Pt,w,z),Ue&&se.render(w),_t(P,w,z)}J!==null&&at===0&&(ot.updateMultisampleRenderTarget(J),ot.updateRenderTargetMipmap(J)),j&&I.end(O),w.isScene===!0&&w.onAfterRender(O,w,z),Dt.resetDefaultState(),rt=-1,mt=null,y.pop(),y.length>0?(R=y[y.length-1],ot.setTextureUnits(R.state.textureUnits),ye===!0&&Xt.setGlobalState(O.clippingPlanes,R.state.camera)):R=null,U.pop(),U.length>0?P=U[U.length-1]:P=null,q!==null&&q.renderEnd()};function Ur(w,z,st,j){if(w.visible===!1)return;if(w.layers.test(z.layers)){if(w.isGroup)st=w.renderOrder;else if(w.isLOD)w.autoUpdate===!0&&w.update(z);else if(w.isLightProbeGrid)R.pushLightProbeGrid(w);else if(w.isLight)R.pushLight(w),w.castShadow&&R.pushShadow(w);else if(w.isSprite){if(!w.frustumCulled||w.intersectsFrustum(oe)){j&&ln.setFromMatrixPosition(w.matrixWorld).applyMatrix4(ue);let Ft=pt.update(w),Pt=w.material;Pt.visible&&P.push(w,Ft,Pt,st,ln.z,null,z)}}else if((w.isMesh||w.isLine||w.isPoints)&&(!w.frustumCulled||w.intersectsFrustum(oe))){let Ft=pt.update(w),Pt=w.material;if(j&&(w.boundingSphere!==void 0?(w.boundingSphere===null&&w.computeBoundingSphere(),ln.copy(w.boundingSphere.center)):(Ft.boundingSphere===null&&Ft.computeBoundingSphere(),ln.copy(Ft.boundingSphere.center)),ln.applyMatrix4(w.matrixWorld).applyMatrix4(ue)),Array.isArray(Pt)){let et=Ft.groups;for(let Gt=0,re=et.length;Gt<re;Gt++){let pe=et[Gt],Vt=Pt[pe.materialIndex];Vt&&Vt.visible&&P.push(w,Ft,Vt,st,ln.z,pe,z)}}else Pt.visible&&P.push(w,Ft,Pt,st,ln.z,null,z)}}let It=w.children;for(let Ft=0,Pt=It.length;Ft<Pt;Ft++)Ur(It[Ft],z,st,j)}function _t(w,z,st,j){let{opaque:$,transmissive:It,transparent:Ft}=w;R.setupLightsView(st),ye===!0&&Xt.setGlobalState(O.clippingPlanes,st),j&&b.viewport(yt.copy(j)),$.length>0&&Ki($,z,st),It.length>0&&Ki(It,z,st),Ft.length>0&&Ki(Ft,z,st),b.buffers.depth.setTest(!0),b.buffers.depth.setMask(!0),b.buffers.color.setMask(!0),b.setPolygonOffset(!1)}function Fr(w,z,st,j){if((st.isScene===!0?st.overrideMaterial:null)!==null)return;if(R.state.transmissionRenderTarget[j.id]===void 0){let Vt=ve.has("EXT_color_buffer_half_float")||ve.has("EXT_color_buffer_float");R.state.transmissionRenderTarget[j.id]=new Yn(1,1,{generateMipmaps:!0,type:Vt?Ai:$n,minFilter:Ss,samples:Math.max(4,L.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:we.workingColorSpace})}let It=R.state.transmissionRenderTarget[j.id],Ft=j.viewport||yt;It.setSize(Ft.z*O.transmissionResolutionScale,Ft.w*O.transmissionResolutionScale);let Pt=O.getRenderTarget(),et=O.getActiveCubeFace(),Gt=O.getActiveMipmapLevel();O.setRenderTarget(It),O.getClearColor(Ae),_e=O.getClearAlpha(),_e<1&&O.setClearColor(16777215,.5),O.clear(),Ue&&se.render(st);let re=O.toneMapping;O.toneMapping=bi;let pe=j.viewport;if(j.viewport!==void 0&&(j.viewport=void 0),R.setupLightsView(j),ye===!0&&Xt.setGlobalState(O.clippingPlanes,j),Ki(w,st,j),ot.updateMultisampleRenderTarget(It),ot.updateRenderTargetMipmap(It),ve.has("WEBGL_multisampled_render_to_texture")===!1){let Vt=!1;for(let me=0,We=z.length;me<We;me++){let Oe=z[me],{object:Ee,geometry:fn,material:Ut,group:pn}=Oe;if(Ut.side===Zn&&Ee.layers.test(j.layers)){let Me=Ut.side;Ut.side=bn,Ut.needsUpdate=!0,ka(Ee,st,j,fn,Ut,pn),Ut.side=Me,Ut.needsUpdate=!0,Vt=!0}}Vt===!0&&(ot.updateMultisampleRenderTarget(It),ot.updateRenderTargetMipmap(It))}O.setRenderTarget(Pt,et,Gt),O.setClearColor(Ae,_e),pe!==void 0&&(j.viewport=pe),O.toneMapping=re}function Ki(w,z,st){let j=z.isScene===!0?z.overrideMaterial:null;for(let $=0,It=w.length;$<It;$++){let Ft=w[$],{object:Pt,geometry:et,group:Gt}=Ft,re=Ft.material;re.allowOverride===!0&&j!==null&&(re=j),Pt.layers.test(st.layers)&&ka(Pt,z,st,et,re,Gt)}}function ka(w,z,st,j,$,It){q!==null&&$.isNodeMaterial&&q.setObject(w,$),w.onBeforeRender(O,z,st,j,$,It),w.modelViewMatrix.multiplyMatrices(st.matrixWorldInverse,w.matrixWorld),w.normalMatrix.getNormalMatrix(w.modelViewMatrix),$.onBeforeRender(O,z,st,j,w,It),$.transparent===!0&&$.side===Zn&&$.forceSinglePass===!1?($.side=bn,$.needsUpdate=!0,O.renderBufferDirect(st,z,j,$,w,It),$.side=vs,$.needsUpdate=!0,O.renderBufferDirect(st,z,j,$,w,It),$.side=Zn):O.renderBufferDirect(st,z,j,$,w,It),w.onAfterRender(O,z,st,j,$,It)}function Kn(w,z,st){z.isScene!==!0&&(z=wn);let j=K.get(w),$=R.state.lights,It=R.state.shadowsArray,Ft=$.state.version,Pt=Ct.getParameters(w,$.state,It,z,st,R.state.lightProbeGridArray),et=Ct.getProgramCacheKey(Pt),Gt=j.programs;j.environment=w.isMeshStandardMaterial||w.isMeshLambertMaterial||w.isMeshPhongMaterial?z.environment:null,j.fog=z.fog;let re=w.isMeshStandardMaterial||w.isMeshLambertMaterial&&!w.envMap||w.isMeshPhongMaterial&&!w.envMap;j.envMap=Mt.get(w.envMap||j.environment,re),j.envMapRotation=j.environment!==null&&w.envMap===null?z.environmentRotation:w.envMapRotation,Gt===void 0&&(w.addEventListener("dispose",kn),Gt=new Map,j.programs=Gt);let pe=Gt.get(et);if(pe!==void 0){if(j.currentProgram===pe&&j.lightsStateVersion===Ft)return Va(w,Pt),pe}else Pt.uniforms=Ct.getUniforms(w),q!==null&&w.isNodeMaterial&&q.build(w,st,Pt),w.onBeforeCompile(Pt,O),pe=Ct.acquireProgram(Pt,et),Gt.set(et,pe),j.uniforms=Pt.uniforms;let Vt=j.uniforms;return(!w.isShaderMaterial&&!w.isRawShaderMaterial||w.clipping===!0)&&(Vt.clippingPlanes=Xt.uniform),Va(w,Pt),j.needsLights=oi(w),j.lightsStateVersion=Ft,j.needsLights&&(Vt.ambientLightColor.value=$.state.ambient,Vt.lightProbe.value=$.state.probe,Vt.sunLights.value=$.state.sun,Vt.sunLightShadows.value=$.state.sunShadow,Vt.directionalLights.value=$.state.directional,Vt.directionalLightShadows.value=$.state.directionalShadow,Vt.spotLights.value=$.state.spot,Vt.spotLightShadows.value=$.state.spotShadow,Vt.rectAreaLights.value=$.state.rectArea,Vt.ltc_1.value=$.state.rectAreaLTC1,Vt.ltc_2.value=$.state.rectAreaLTC2,Vt.pointLights.value=$.state.point,Vt.pointLightShadows.value=$.state.pointShadow,Vt.hemisphereLights.value=$.state.hemi,Vt.sunShadowMatrix.value=$.state.sunShadowMatrix,Vt.sunShadowCascade.value=$.state.sunShadowCascade,Vt.directionalShadowMatrix.value=$.state.directionalShadowMatrix,Vt.spotLightMatrix.value=$.state.spotLightMatrix,Vt.spotLightMap.value=$.state.spotLightMap,Vt.pointShadowMatrix.value=$.state.pointShadowMatrix),j.lightProbeGrid=R.state.lightProbeGridArray.length>0,j.currentProgram=pe,j.uniformsList=null,pe}function Or(w){if(w.uniformsList===null){let z=w.currentProgram.getUniforms();w.uniformsList=Lr.seqWithValue(z.seq,w.uniforms)}return w.uniformsList}function Va(w,z){let st=K.get(w);st.outputColorSpace=z.outputColorSpace,st.batching=z.batching,st.batchingColor=z.batchingColor,st.instancing=z.instancing,st.instancingColor=z.instancingColor,st.instancingMorph=z.instancingMorph,st.skinning=z.skinning,st.morphTargets=z.morphTargets,st.morphNormals=z.morphNormals,st.morphColors=z.morphColors,st.morphTargetsCount=z.morphTargetsCount,st.numClippingPlanes=z.numClippingPlanes,st.numIntersection=z.numClipIntersection,st.vertexAlphas=z.vertexAlphas,st.vertexTangents=z.vertexTangents,st.toneMapping=z.toneMapping}function hc(w,z){if(w.length===0)return null;if(w.length===1)return w[0].texture!==null?w[0]:null;E.setFromMatrixPosition(z.matrixWorld);for(let st=0,j=w.length;st<j;st++){let $=w[st];if($.texture!==null&&$.boundingBox.containsPoint(E))return $}return null}function Ga(w,z,st,j,$){z.isScene!==!0&&(z=wn),ot.resetTextureUnits();let It=z.fog,Ft=j.isMeshStandardMaterial||j.isMeshLambertMaterial||j.isMeshPhongMaterial?z.environment:null,Pt=J===null?O.outputColorSpace:J.isXRRenderTarget===!0?J.texture.colorSpace:we.workingColorSpace,et=j.isMeshStandardMaterial||j.isMeshLambertMaterial&&!j.envMap||j.isMeshPhongMaterial&&!j.envMap,Gt=Mt.get(j.envMap||Ft,et),re=j.vertexColors===!0&&!!st.attributes.color&&st.attributes.color.itemSize===4,pe=!!st.attributes.tangent&&(!!j.normalMap||j.anisotropy>0),Vt=!!st.morphAttributes.position,me=!!st.morphAttributes.normal,We=!!st.morphAttributes.color,Oe=bi;j.toneMapped&&(J===null||J.isXRRenderTarget===!0)&&(Oe=O.toneMapping);let Ee=st.morphAttributes.position||st.morphAttributes.normal||st.morphAttributes.color,fn=Ee!==void 0?Ee.length:0,Ut=K.get(j),pn=R.state.lights;if(ye===!0&&(ce===!0||w!==mt)){let Ne=w===mt&&j.id===rt;Xt.setState(j,w,Ne)}let Me=!1;j.version===Ut.__version?(Ut.needsLights&&Ut.lightsStateVersion!==pn.state.version||Ut.outputColorSpace!==Pt||$.isBatchedMesh&&Ut.batching===!1||!$.isBatchedMesh&&Ut.batching===!0||$.isBatchedMesh&&Ut.batchingColor===!0&&$._colorsTexture===null||$.isBatchedMesh&&Ut.batchingColor===!1&&$._colorsTexture!==null||$.isInstancedMesh&&Ut.instancing===!1||!$.isInstancedMesh&&Ut.instancing===!0||$.isSkinnedMesh&&Ut.skinning===!1||!$.isSkinnedMesh&&Ut.skinning===!0||$.isInstancedMesh&&Ut.instancingColor===!0&&$.instanceColor===null||$.isInstancedMesh&&Ut.instancingColor===!1&&$.instanceColor!==null||$.isInstancedMesh&&Ut.instancingMorph===!0&&$.morphTexture===null||$.isInstancedMesh&&Ut.instancingMorph===!1&&$.morphTexture!==null||Ut.envMap!==Gt||j.fog===!0&&Ut.fog!==It||Ut.numClippingPlanes!==void 0&&(Ut.numClippingPlanes!==Xt.numPlanes||Ut.numIntersection!==Xt.numIntersection)||Ut.vertexAlphas!==re||Ut.vertexTangents!==pe||Ut.morphTargets!==Vt||Ut.morphNormals!==me||Ut.morphColors!==We||Ut.toneMapping!==Oe||Ut.morphTargetsCount!==fn||!!Ut.lightProbeGrid!=R.state.lightProbeGridArray.length>0)&&(Me=!0):(Me=!0,Ut.__version=j.version);let An=Ut.currentProgram;Me===!0&&(An=Kn(j,z,$),q&&j.isNodeMaterial&&q.onUpdateProgram(j,An,Ut));let jn=!1,xt=!1,zi=!1,Re=An.getUniforms(),$e=Ut.uniforms;if(b.useProgram(An.program)&&(jn=!0,xt=!0,zi=!0),j.id!==rt&&(rt=j.id,xt=!0),Ut.needsLights){let Ne=hc(R.state.lightProbeGridArray,$);Ut.lightProbeGrid!==Ne&&(Ut.lightProbeGrid=Ne,xt=!0)}if(jn||mt!==w){b.buffers.depth.getReversed()&&w.reversedDepth!==!0&&(w._reversedDepth=!0,w.updateProjectionMatrix()),Re.setValue(B,"projectionMatrix",w.projectionMatrix),Re.setValue(B,"viewMatrix",w.matrixWorldInverse);let Vn=Re.map.cameraPosition;Vn!==void 0&&Vn.setValue(B,Ge.setFromMatrixPosition(w.matrixWorld)),L.logarithmicDepthBuffer&&Re.setValue(B,"logDepthBufFC",2/(Math.log(w.far+1)/Math.LN2)),(j.isMeshPhongMaterial||j.isMeshToonMaterial||j.isMeshLambertMaterial||j.isMeshBasicMaterial||j.isMeshStandardMaterial||j.isShaderMaterial)&&Re.setValue(B,"isOrthographic",w.isOrthographicCamera===!0),mt!==w&&(mt=w,xt=!0,zi=!0)}if(Ut.needsLights&&(pn.state.sunShadowMap.length>0&&Re.setValue(B,"sunShadowMap",pn.state.sunShadowMap,ot),pn.state.directionalShadowMap.length>0&&Re.setValue(B,"directionalShadowMap",pn.state.directionalShadowMap,ot),pn.state.spotShadowMap.length>0&&Re.setValue(B,"spotShadowMap",pn.state.spotShadowMap,ot),pn.state.pointShadowMap.length>0&&Re.setValue(B,"pointShadowMap",pn.state.pointShadowMap,ot)),$.isSkinnedMesh){Re.setOptional(B,$,"bindMatrix"),Re.setOptional(B,$,"bindMatrixInverse");let Ne=$.skeleton;Ne&&(Ne.boneTexture===null&&Ne.computeBoneTexture(),Re.setValue(B,"boneTexture",Ne.boneTexture,ot))}$.isBatchedMesh&&(Re.setOptional(B,$,"batchingTexture"),Re.setValue(B,"batchingTexture",$._matricesTexture,ot),Re.setOptional(B,$,"batchingIdTexture"),Re.setValue(B,"batchingIdTexture",$._indirectTexture,ot),Re.setOptional(B,$,"batchingColorTexture"),$._colorsTexture!==null&&Re.setValue(B,"batchingColorTexture",$._colorsTexture,ot));let En=st.morphAttributes;if((En.position!==void 0||En.normal!==void 0||En.color!==void 0)&&V.update($,st,An),(xt||Ut.receiveShadow!==$.receiveShadow)&&(Ut.receiveShadow=$.receiveShadow,Re.setValue(B,"receiveShadow",$.receiveShadow)),(j.isMeshStandardMaterial||j.isMeshLambertMaterial||j.isMeshPhongMaterial)&&j.envMap===null&&z.environment!==null&&($e.envMapIntensity.value=z.environmentIntensity),$e.dfgLUT!==void 0&&($e.dfgLUT.value=Bx()),xt){if(Re.setValue(B,"toneMappingExposure",O.toneMappingExposure),Ut.needsLights&&Gs($e,zi),It&&j.fog===!0&&zt.refreshFogUniforms($e,It),zt.refreshMaterialUniforms($e,j,gt,ht,R.state.transmissionRenderTarget[w.id]),Ut.needsLights&&Ut.lightProbeGrid){let Ne=Ut.lightProbeGrid;$e.probesSH.value=Ne.texture,$e.probesMin.value.copy(Ne.boundingBox.min),$e.probesMax.value.copy(Ne.boundingBox.max),$e.probesResolution.value.copy(Ne.resolution)}Lr.upload(B,Or(Ut),$e,ot)}if(j.isShaderMaterial&&j.uniformsNeedUpdate===!0&&(Lr.upload(B,Or(Ut),$e,ot),j.uniformsNeedUpdate=!1),j.isSpriteMaterial&&Re.setValue(B,"center",$.center),Re.setValue(B,"modelViewMatrix",$.modelViewMatrix),Re.setValue(B,"normalMatrix",$.normalMatrix),Re.setValue(B,"modelMatrix",$.matrixWorld),j.uniformsGroups!==void 0){let Ne=j.uniformsGroups;for(let Vn=0,ji=Ne.length;Vn<ji;Vn++){let Ha=Ne[Vn];vt.update(Ha,An),vt.bind(Ha,An)}}return An}function Gs(w,z){w.ambientLightColor.needsUpdate=z,w.lightProbe.needsUpdate=z,w.sunLights.needsUpdate=z,w.sunLightShadows.needsUpdate=z,w.directionalLights.needsUpdate=z,w.directionalLightShadows.needsUpdate=z,w.pointLights.needsUpdate=z,w.pointLightShadows.needsUpdate=z,w.spotLights.needsUpdate=z,w.spotLightShadows.needsUpdate=z,w.rectAreaLights.needsUpdate=z,w.hemisphereLights.needsUpdate=z}function oi(w){return w.isMeshLambertMaterial||w.isMeshToonMaterial||w.isMeshPhongMaterial||w.isMeshStandardMaterial||w.isShadowMaterial||w.isShaderMaterial&&w.lights===!0}this.getActiveCubeFace=function(){return ct},this.getActiveMipmapLevel=function(){return at},this.getRenderTarget=function(){return J},this.setRenderTargetTextures=function(w,z,st){let j=K.get(w);j.__autoAllocateDepthBuffer=w.resolveDepthBuffer===!1,j.__autoAllocateDepthBuffer===!1&&(j.__useRenderToTexture=!1),K.get(w.texture).__webglTexture=z,K.get(w.depthTexture).__webglTexture=j.__autoAllocateDepthBuffer?void 0:st,j.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(w,z){let st=K.get(w);st.__webglFramebuffer=z,st.__useDefaultFramebuffer=z===void 0},this.setRenderTarget=function(w,z=0,st=0){J=w,ct=z,at=st;let j=null,$=!1,It=!1;if(w){let Pt=K.get(w);if(Pt.__useDefaultFramebuffer!==void 0){b.bindFramebuffer(B.FRAMEBUFFER,Pt.__webglFramebuffer),yt.copy(w.viewport),$t.copy(w.scissor),Wt=w.scissorTest,b.viewport(yt),b.scissor($t),b.setScissorTest(Wt),rt=-1;return}else if(Pt.__webglFramebuffer===void 0)ot.setupRenderTarget(w);else if(Pt.__hasExternalTextures)ot.rebindTextures(w,K.get(w.texture).__webglTexture,K.get(w.depthTexture).__webglTexture);else if(w.depthBuffer){let re=w.depthTexture;if(Pt.__boundDepthTexture!==re){if(re!==null&&K.has(re)&&(w.width!==re.image.width||w.height!==re.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");ot.setupDepthRenderbuffer(w)}}let et=w.texture;(et.isData3DTexture||et.isDataArrayTexture||et.isCompressedArrayTexture)&&(It=!0);let Gt=K.get(w).__webglFramebuffer;w.isWebGLCubeRenderTarget?(Array.isArray(Gt[z])?j=Gt[z][st]:j=Gt[z],$=!0):w.samples>0&&ot.useMultisampledRTT(w)===!1?j=K.get(w).__webglMultisampledFramebuffer:Array.isArray(Gt)?j=Gt[st]:j=Gt,yt.copy(w.viewport),$t.copy(w.scissor),Wt=w.scissorTest}else yt.copy(Ot).multiplyScalar(gt).floor(),$t.copy(ie).multiplyScalar(gt).floor(),Wt=Kt;if(st!==0&&(j=tt),b.bindFramebuffer(B.FRAMEBUFFER,j)&&b.drawBuffers(w,j),b.viewport(yt),b.scissor($t),b.setScissorTest(Wt),$){let Pt=K.get(w.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_CUBE_MAP_POSITIVE_X+z,Pt.__webglTexture,st)}else if(It){let Pt=z;for(let et=0;et<w.textures.length;et++){let Gt=K.get(w.textures[et]);B.framebufferTextureLayer(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0+et,Gt.__webglTexture,st,Pt)}}else if(w!==null&&st!==0){let Pt=K.get(w.texture);B.framebufferTexture2D(B.FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,Pt.__webglTexture,st)}rt=-1};function Ts(w){let z=K.get(w);return(z.__readFormat!==w.format||z.__readType!==w.type)&&(z.__readFormat=w.format,z.__readType=w.type,z.__formatReadable=L.textureFormatReadable(w.format),z.__typeReadable=L.textureTypeReadable(w.type)),z}this.readRenderTargetPixels=function(w,z,st,j,$,It,Ft,Pt=0){if(!(w&&w.isWebGLRenderTarget)){te("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let et=K.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&Ft!==void 0&&(et=et[Ft]),et){b.bindFramebuffer(B.FRAMEBUFFER,et);try{let Gt=w.textures[Pt],re=Gt.format,pe=Gt.type;w.textures.length>1&&B.readBuffer(B.COLOR_ATTACHMENT0+Pt);let Vt=Ts(Gt);if(Vt.__formatReadable===!1){te("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Vt.__typeReadable===!1){te("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}z>=0&&z<=w.width-j&&st>=0&&st<=w.height-$&&B.readPixels(z,st,j,$,Rt.convert(re),Rt.convert(pe),It)}finally{let Gt=J!==null?K.get(J).__webglFramebuffer:null;b.bindFramebuffer(B.FRAMEBUFFER,Gt)}}},this.readRenderTargetPixelsAsync=async function(w,z,st,j,$,It,Ft,Pt=0){if(!(w&&w.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let et=K.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&Ft!==void 0&&(et=et[Ft]),et)if(z>=0&&z<=w.width-j&&st>=0&&st<=w.height-$){b.bindFramebuffer(B.FRAMEBUFFER,et);let Gt=w.textures[Pt],re=Gt.format,pe=Gt.type;w.textures.length>1&&B.readBuffer(B.COLOR_ATTACHMENT0+Pt);let Vt=Ts(Gt);if(Vt.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Vt.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let me=B.createBuffer();B.bindBuffer(B.PIXEL_PACK_BUFFER,me),B.bufferData(B.PIXEL_PACK_BUFFER,It.byteLength,B.STREAM_READ),B.readPixels(z,st,j,$,Rt.convert(re),Rt.convert(pe),0),B.bindBuffer(B.PIXEL_PACK_BUFFER,null);let We=J!==null?K.get(J).__webglFramebuffer:null;b.bindFramebuffer(B.FRAMEBUFFER,We);let Oe=B.fenceSync(B.SYNC_GPU_COMMANDS_COMPLETE,0);return B.flush(),await Id(B,Oe,4),B.bindBuffer(B.PIXEL_PACK_BUFFER,me),B.getBufferSubData(B.PIXEL_PACK_BUFFER,0,It),B.bindBuffer(B.PIXEL_PACK_BUFFER,null),B.deleteBuffer(me),B.deleteSync(Oe),It}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(w,z=null,st=0){let j=Math.pow(2,-st),$=Math.floor(w.image.width*j),It=Math.floor(w.image.height*j),Ft=z!==null?z.x:0,Pt=z!==null?z.y:0;ot.setTexture2D(w,0),B.copyTexSubImage2D(B.TEXTURE_2D,st,0,0,Ft,Pt,$,It),b.unbindTexture()},this.copyTextureToTexture=function(w,z,st=null,j=null,$=0,It=0){let Ft,Pt,et,Gt,re,pe,Vt,me,We,Oe=w.isCompressedTexture?w.mipmaps[It]:w.image;if(st!==null)Ft=st.max.x-st.min.x,Pt=st.max.y-st.min.y,et=st.isBox3?st.max.z-st.min.z:1,Gt=st.min.x,re=st.min.y,pe=st.isBox3?st.min.z:0;else{let $e=Math.pow(2,-$);Ft=Math.floor(Oe.width*$e),Pt=Math.floor(Oe.height*$e),w.isDataArrayTexture?et=Oe.depth:w.isData3DTexture?et=Math.floor(Oe.depth*$e):et=1,Gt=0,re=0,pe=0}j!==null?(Vt=j.x,me=j.y,We=j.z):(Vt=0,me=0,We=0);let Ee=Rt.convert(z.format),fn=Rt.convert(z.type),Ut;z.isData3DTexture?(ot.setTexture3D(z,0),Ut=B.TEXTURE_3D):z.isDataArrayTexture||z.isCompressedArrayTexture?(ot.setTexture2DArray(z,0),Ut=B.TEXTURE_2D_ARRAY):(ot.setTexture2D(z,0),Ut=B.TEXTURE_2D),b.activeTexture(B.TEXTURE0),b.pixelStorei(B.UNPACK_FLIP_Y_WEBGL,z.flipY),b.pixelStorei(B.UNPACK_PREMULTIPLY_ALPHA_WEBGL,z.premultiplyAlpha),b.pixelStorei(B.UNPACK_ALIGNMENT,z.unpackAlignment);let pn=b.getParameter(B.UNPACK_ROW_LENGTH),Me=b.getParameter(B.UNPACK_IMAGE_HEIGHT),An=b.getParameter(B.UNPACK_SKIP_PIXELS),jn=b.getParameter(B.UNPACK_SKIP_ROWS),xt=b.getParameter(B.UNPACK_SKIP_IMAGES);b.pixelStorei(B.UNPACK_ROW_LENGTH,Oe.width),b.pixelStorei(B.UNPACK_IMAGE_HEIGHT,Oe.height),b.pixelStorei(B.UNPACK_SKIP_PIXELS,Gt),b.pixelStorei(B.UNPACK_SKIP_ROWS,re),b.pixelStorei(B.UNPACK_SKIP_IMAGES,pe);let zi=w.isDataArrayTexture||w.isData3DTexture,Re=z.isDataArrayTexture||z.isData3DTexture;if(w.isDepthTexture){let $e=K.get(w),En=K.get(z),Ne=K.get($e.__renderTarget),Vn=K.get(En.__renderTarget);b.bindFramebuffer(B.READ_FRAMEBUFFER,Ne.__webglFramebuffer),b.bindFramebuffer(B.DRAW_FRAMEBUFFER,Vn.__webglFramebuffer);for(let ji=0;ji<et;ji++)zi&&(B.framebufferTextureLayer(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,K.get(w).__webglTexture,$,pe+ji),B.framebufferTextureLayer(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,K.get(z).__webglTexture,It,We+ji)),B.blitFramebuffer(Gt,re,Ft,Pt,Vt,me,Ft,Pt,B.DEPTH_BUFFER_BIT,B.NEAREST);b.bindFramebuffer(B.READ_FRAMEBUFFER,null),b.bindFramebuffer(B.DRAW_FRAMEBUFFER,null)}else if($!==0||w.isRenderTargetTexture||K.has(w)){let $e=K.get(w),En=K.get(z);b.bindFramebuffer(B.READ_FRAMEBUFFER,k),b.bindFramebuffer(B.DRAW_FRAMEBUFFER,it);for(let Ne=0;Ne<et;Ne++)zi?B.framebufferTextureLayer(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,$e.__webglTexture,$,pe+Ne):B.framebufferTexture2D(B.READ_FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,$e.__webglTexture,$),Re?B.framebufferTextureLayer(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,En.__webglTexture,It,We+Ne):B.framebufferTexture2D(B.DRAW_FRAMEBUFFER,B.COLOR_ATTACHMENT0,B.TEXTURE_2D,En.__webglTexture,It),$!==0?B.blitFramebuffer(Gt,re,Ft,Pt,Vt,me,Ft,Pt,B.COLOR_BUFFER_BIT,B.NEAREST):Re?B.copyTexSubImage3D(Ut,It,Vt,me,We+Ne,Gt,re,Ft,Pt):B.copyTexSubImage2D(Ut,It,Vt,me,Gt,re,Ft,Pt);b.bindFramebuffer(B.READ_FRAMEBUFFER,null),b.bindFramebuffer(B.DRAW_FRAMEBUFFER,null)}else Re?w.isDataTexture||w.isData3DTexture?B.texSubImage3D(Ut,It,Vt,me,We,Ft,Pt,et,Ee,fn,Oe.data):z.isCompressedArrayTexture?B.compressedTexSubImage3D(Ut,It,Vt,me,We,Ft,Pt,et,Ee,Oe.data):B.texSubImage3D(Ut,It,Vt,me,We,Ft,Pt,et,Ee,fn,Oe):w.isDataTexture?B.texSubImage2D(B.TEXTURE_2D,It,Vt,me,Ft,Pt,Ee,fn,Oe.data):w.isCompressedTexture?B.compressedTexSubImage2D(B.TEXTURE_2D,It,Vt,me,Oe.width,Oe.height,Ee,Oe.data):B.texSubImage2D(B.TEXTURE_2D,It,Vt,me,Ft,Pt,Ee,fn,Oe);b.pixelStorei(B.UNPACK_ROW_LENGTH,pn),b.pixelStorei(B.UNPACK_IMAGE_HEIGHT,Me),b.pixelStorei(B.UNPACK_SKIP_PIXELS,An),b.pixelStorei(B.UNPACK_SKIP_ROWS,jn),b.pixelStorei(B.UNPACK_SKIP_IMAGES,xt),It===0&&z.generateMipmaps&&B.generateMipmap(Ut),b.unbindTexture()},this.initRenderTarget=function(w){K.get(w).__webglFramebuffer===void 0&&ot.setupRenderTarget(w)},this.initTexture=function(w){w.isCubeTexture?ot.setTextureCube(w,0):w.isData3DTexture?ot.setTexture3D(w,0):w.isDataArrayTexture||w.isCompressedArrayTexture?ot.setTexture2DArray(w,0):ot.setTexture2D(w,0),b.unbindTexture()},this.resetState=function(){ct=0,at=0,J=null,b.reset(),Dt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return vi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=we._getDrawingBufferColorSpace(t),e.unpackColorSpace=we._getUnpackColorSpace()}};var He='"Sora", "Manrope", system-ui, sans-serif',an='"Manrope", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',ke="#F4F6FA",nn="#A7B0C0",Rn="#5EEAD4",Na="#FBBF24",zx={listening:"Listening",thinking:"Thinking"},$h=1;async function kx(){if(typeof FontFace>"u"||!document.fonts)return;let i=[new FontFace("Sora","url(../fonts/sora.woff2)",{weight:"300 800"}),new FontFace("Manrope","url(../fonts/manrope.woff2)",{weight:"400 700"})],t=Promise.all(i.map(async e=>{await e.load(),document.fonts.add(e)}));await Promise.race([t,new Promise(e=>setTimeout(e,2500))]).catch(()=>{})}var mf=`
float hash3(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise3(vec3 x) {
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash3(i), hash3(i + vec3(1.0, 0.0, 0.0)), f.x), mix(hash3(i + vec3(0.0, 1.0, 0.0)), hash3(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
             mix(mix(hash3(i + vec3(0.0, 0.0, 1.0)), hash3(i + vec3(1.0, 0.0, 1.0)), f.x), mix(hash3(i + vec3(0.0, 1.0, 1.0)), hash3(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);
}`,Vx=`
uniform float uTime; uniform float uEnergy;
varying vec3 vN; varying vec3 vV; varying vec3 vP;
${mf}
void main() {
  vec3 p = position;
  float d = noise3(p * 22.0 + vec3(0.0, uTime * 0.9, uTime * 0.6));
  p += normal * (d - 0.5) * (0.004 + uEnergy * 0.016);
  vP = p * 11.0;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`,Gx=`
uniform float uTime; uniform float uEnergy; uniform float uThink;
uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform vec3 uGlow;
varying vec3 vN; varying vec3 vV; varying vec3 vP;
${mf}
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
}`;function Ke(i,t,e=2400){let n=document.createElement("canvas");n.width=Math.max(8,Math.round(i*e)),n.height=Math.max(8,Math.round(t*e));let s=n.getContext("2d"),r=new Us(n);r.colorSpace=gn,r.anisotropy=$h;let a=new rn({map:r,transparent:!0,depthWrite:!1}),o=new he(new Zi(i,t),a);return{canvas:n,ctx:s,tex:r,mesh:o,w:n.width,h:n.height,update(){r.needsUpdate=!0}}}function Jn(i,t,e,n,s,r){r=Math.min(r,n/2,s/2),i.beginPath(),i.moveTo(t+r,e),i.arcTo(t+n,e,t+n,e+s,r),i.arcTo(t+n,e+s,t,e+s,r),i.arcTo(t,e+s,t,e,r),i.arcTo(t,e,t+n,e,r),i.closePath()}function On(i,t,e,n,s={}){i.clearRect(0,0,t,e);let r=3,a=r;Jn(i,a,a,t-a*2,e-a*2,n);let o=i.createLinearGradient(0,0,0,e);if(o.addColorStop(0,s.fill0||"rgba(24, 27, 36, 0.94)"),o.addColorStop(1,s.fill1||"rgba(13, 15, 21, 0.95)"),i.fillStyle=o,i.fill(),i.lineWidth=s.hot?r*1.6:r,i.strokeStyle=s.hot?"rgba(94, 234, 212, 0.9)":"rgba(255, 255, 255, 0.13)",i.stroke(),!s.hot){let c=i.createLinearGradient(a+n,0,t-a-n,0);c.addColorStop(0,"rgba(255,255,255,0)"),c.addColorStop(.5,"rgba(255,255,255,0.34)"),c.addColorStop(1,"rgba(255,255,255,0)"),i.fillStyle=c,i.fillRect(a+n,a-r/2,t-2*(a+n),r)}}function xe(i,t,e,n,s,r,a=500,o="left",c=an,h="0px"){i.font=`${a} ${s}px ${c}`,i.fillStyle=r,i.textAlign=o,i.textBaseline="alphabetic","letterSpacing"in i&&(i.letterSpacing=h),i.fillText(t,e,n),"letterSpacing"in i&&(i.letterSpacing="0px")}function Pn(i,t,e){if(t=String(t||""),i.measureText(t).width<=e)return t;for(;t&&i.measureText(t+"\u2026").width>e;)t=t.slice(0,-1);return t+"\u2026"}function ff(){let i=document.createElement("canvas");i.width=i.height=128;let t=i.getContext("2d"),e=t.createRadialGradient(64,64,0,64,64,64);e.addColorStop(0,"rgba(255,255,255,0.9)"),e.addColorStop(.35,"rgba(255,255,255,0.32)"),e.addColorStop(1,"rgba(255,255,255,0)"),t.fillStyle=e,t.fillRect(0,0,128,128);let n=new Us(i);return n.colorSpace=gn,n}var Hx={mic(i){i.beginPath(),Jn(i,39,16,22,42,11),i.stroke(),i.beginPath(),i.arc(50,48,22,.12*Math.PI,.88*Math.PI),i.stroke(),i.beginPath(),i.moveTo(50,70),i.lineTo(50,84),i.stroke()},done(i){i.beginPath(),i.moveTo(27,52),i.lineTo(43,68),i.lineTo(74,35),i.stroke()},quiet(i){i.beginPath(),Jn(i,32,32,36,36,7),i.stroke()},end(i){i.beginPath(),i.moveTo(20,60),i.quadraticCurveTo(50,32,80,60),i.lineTo(72,69),i.lineTo(61,61),i.lineTo(61,53),i.quadraticCurveTo(50,48,39,53),i.lineTo(39,61),i.lineTo(28,69),i.closePath(),i.stroke()},eye(i){i.beginPath(),i.moveTo(14,50),i.quadraticCurveTo(50,16,86,50),i.quadraticCurveTo(50,84,14,50),i.stroke(),i.beginPath(),i.arc(50,50,11,0,Math.PI*2),i.stroke()},pc(i){i.beginPath(),Jn(i,16,22,68,44,6),i.stroke(),i.beginPath(),i.moveTo(36,82),i.lineTo(64,82),i.moveTo(50,66),i.lineTo(50,82),i.stroke()},pin(i){i.beginPath(),i.moveTo(50,86),i.lineTo(50,62),i.stroke(),i.beginPath(),i.moveTo(31,62),i.lineTo(69,62),i.lineTo(62,46),i.lineTo(62,20),i.lineTo(38,20),i.lineTo(38,46),i.closePath(),i.stroke()},leave(i){i.beginPath(),i.moveTo(32,32),i.lineTo(68,68),i.moveTo(68,32),i.lineTo(32,68),i.stroke()},think(i){for(let t=0;t<3;t++)i.beginPath(),i.arc(30+t*20,50,4.5,0,Math.PI*2),i.stroke()},photos(i){i.beginPath(),Jn(i,16,24,68,52,8),i.stroke(),i.beginPath(),i.moveTo(23,69),i.lineTo(42,49),i.lineTo(56,62),i.lineTo(65,54),i.lineTo(78,69),i.stroke(),i.beginPath(),i.arc(64,38,5,0,Math.PI*2),i.stroke()},style(i){let t=(e,n,s)=>{i.beginPath(),i.moveTo(e,n-s),i.quadraticCurveTo(e,n,e+s,n),i.quadraticCurveTo(e,n,e,n+s),i.quadraticCurveTo(e,n,e-s,n),i.quadraticCurveTo(e,n,e,n-s),i.stroke()};t(44,56,26),t(74,28,12)},folder(i){i.beginPath(),i.moveTo(14,30),i.lineTo(40,30),i.lineTo(48,38),i.lineTo(86,38),i.lineTo(86,78),i.lineTo(14,78),i.closePath(),i.stroke()},doc(i){i.beginPath(),i.moveTo(28,14),i.lineTo(60,14),i.lineTo(76,30),i.lineTo(76,86),i.lineTo(28,86),i.closePath(),i.stroke(),i.beginPath(),i.moveTo(38,50),i.lineTo(66,50),i.moveTo(38,62),i.lineTo(66,62),i.moveTo(38,74),i.lineTo(56,74),i.stroke()},close(i){i.beginPath(),i.moveTo(34,34),i.lineTo(66,66),i.moveTo(66,34),i.lineTo(34,66),i.stroke()},back(i){i.beginPath(),i.moveTo(58,30),i.lineTo(38,50),i.lineTo(58,70),i.stroke()},next(i){i.beginPath(),i.moveTo(42,30),i.lineTo(62,50),i.lineTo(42,70),i.stroke()},up(i){i.beginPath(),i.moveTo(30,56),i.lineTo(50,36),i.lineTo(70,56),i.moveTo(50,36),i.lineTo(50,74),i.stroke()},search(i){i.beginPath(),i.arc(44,44,20,0,Math.PI*2),i.stroke(),i.beginPath(),i.moveTo(59,59),i.lineTo(76,76),i.stroke()},pause(i){i.beginPath(),i.moveTo(40,32),i.lineTo(40,68),i.moveTo(60,32),i.lineTo(60,68),i.stroke()},holo(i){i.beginPath(),i.moveTo(50,22),i.lineTo(76,36),i.lineTo(76,64),i.lineTo(50,78),i.lineTo(24,64),i.lineTo(24,36),i.closePath(),i.stroke(),i.beginPath(),i.moveTo(24,36),i.lineTo(50,50),i.lineTo(76,36),i.moveTo(50,50),i.lineTo(50,78),i.stroke()}};function pf(i,t){let{ctx:e,w:n,h:s}=i;e.clearRect(0,0,n,s),e.beginPath(),e.arc(n/2,s/2,n/2-4,0,Math.PI*2),e.fillStyle="rgba(20, 23, 31, 0.95)",e.fill(),e.lineWidth=3,e.strokeStyle="rgba(255,255,255,0.18)",e.stroke(),Ei(e,t,n/2,s/2,n*.62,ke,7),i.update()}function Ei(i,t,e,n,s,r=ke,a=6){i.save();let o=s/100;i.translate(e-50*o,n-50*o),i.scale(o,o),i.strokeStyle=r,i.fillStyle=r,i.lineWidth=a,i.lineCap="round",i.lineJoin="round",Hx[t]?.(i),i.restore()}async function $M({mode:i,session:t,api:e,tint:n}){let s=i==="flat",r=i==="immersive-ar",a=e.util;await kx();let o=new oc({antialias:!0,alpha:!0,powerPreference:"high-performance"});o.setClearColor(0,0),o.outputColorSpace=gn,o.setPixelRatio(s?Math.min(2,window.devicePixelRatio||1):1),$h=Math.max(1,o.capabilities.getMaxAnisotropy?.()||1),o.setSize(window.innerWidth,window.innerHeight);let c=o.domElement;Object.assign(c.style,{position:"fixed",inset:"0",width:"100vw",height:"100vh",zIndex:"2147483000",touchAction:"none",display:s?"block":"none"}),document.body.appendChild(c);let h=new ia,d=new Dn(70,window.innerWidth/window.innerHeight,.01,100);d.position.set(0,1.6,0),h.add(d);let _=[],u=l=>(_.push(l),l),m=[],S=0,T=(()=>{try{return matchMedia("(prefers-reduced-motion: reduce)").matches}catch{return!1}})(),v=l=>1-Math.pow(1-Math.min(1,Math.max(0,l)),4),g=!1,C={a:new jt,b:new jt,c:new jt},D=0,E=8246268,P=!1;try{D=Math.max(0,Ua.findIndex(l=>l.name===localStorage.getItem("izuki.vr.theme")))}catch{}function R(l){let p=Ua[l];if(C.a.setRGB(...p.orb[0]),C.b.setRGB(...p.orb[1]),C.c.setRGB(...p.orb[2]),l===0&&n){let M=parseInt(n.slice(1),16),f=new jt((M>>16&255)/255,(M>>8&255)/255,(M&255)/255);C.a.lerp(f,.6),C.b.lerp(f,.35),C.c.lerp(f,.45)}E=p.halo,pt?.set(p);let x=!!p.light&&!!pt;if(x!==P){P=x;for(let M of _e)M.draw()}}function U(){D=(D+1)%Ua.length,R(D);try{localStorage.setItem("izuki.vr.theme",Ua[D].name)}catch{}return"This is "+Ua[D].name+(r?".":", with its own sky.")+" Say \u201Cchange your look\u201D again for the next one."}let y=new Ye;y.visible=!1,h.add(y);let I=u(new xn({uniforms:{uTime:{value:0},uEnergy:{value:0},uThink:{value:0},uA:{value:C.a},uB:{value:C.b},uC:{value:C.c},uGlow:{value:new jt(.82,.95,1)}},vertexShader:Vx,fragmentShader:Gx,transparent:!0})),O=new he(u(new Un(.085,64,48)),I);O.renderOrder=2;let W=u(new ui({map:u(ff()),color:6220500,transparent:!0,blending:en,depthWrite:!1,opacity:.3})),q=new Mi(W);q.scale.setScalar(.42),q.renderOrder=1;let tt=u(new rn({color:6220500,transparent:!0,opacity:0,blending:en,depthWrite:!1})),k=new he(u(new ms(.118,.003,8,120,Math.PI*1.4)),tt),it=u(new rn({color:6220500,transparent:!0,opacity:0,blending:en,depthWrite:!1})),ct=new he(u(new ms(.1,.0016,8,160)),it);ct.visible=!1,y.add(q,O,k,ct);let at=Ke(.56,.19);at.mesh.position.set(0,-.2,.01),y.add(at.mesh),u(at.tex),u(at.mesh.material),u(at.mesh.geometry),m.push(at.mesh.material);let J={state:"",you:"",reply:"",stage:"",mic:0,energy:0,think:0,hovered:!1,hint:s?"Click the orb to talk. Drag to look around.":"Point at the orb and pull the trigger (or pinch) to talk."};function rt(){let{ctx:l,w:p,h:x}=at;On(l,p,x,52);let M=56,f=30,A=zx[J.state]||J.stage||"";A?(l.beginPath(),l.arc(M+9,f+34,9,0,Math.PI*2),l.fillStyle=Rn,l.fill(),l.font=`600 30px ${He}`,xe(l,Pn(l,A,p-M*2-40),M+34,f+45,30,Rn,600,"left",He,"0.02em"),f+=62):f+=14,J.you&&(l.font=`500 34px ${an}`,xe(l,Pn(l,J.you,p-M*2),M,f+=40,34,nn,500),f+=10);let G=J.reply||(J.you?"":J.hint),F=(X,nt)=>(l.font=`500 ${nt}px ${an}`,l.measureText(X).width),Z=J.notice?a.fitLines(J.notice,p-M*2,2,30,26,F):null,H=Z?Z.lines.length*Z.size*1.3+22:0;if(G){let X=x-f-36-H,nt=Math.max(1,Math.floor(X/(32*1.32))),lt=a.fitLines(G,p-M*2,Math.min(nt,5),50,32,F),wt=lt.size*1.32;f+=6;for(let dt of lt.lines)xe(l,dt,M,f+=wt,lt.size,J.reply?ke:nn,500)}if($t(J.notice||J.reply),Z){let X=x-32-(Z.lines.length-1)*Z.size*1.3;for(let nt of Z.lines)xe(l,nt,M,X,Z.size,J.noticeWarn?Na:nn,500),X+=Z.size*1.3}at.update()}let mt=null,yt=!1,$t=l=>{yt&&mt&&l&&mt.textContent!==l&&(mt.textContent=l)},Wt=0;function Ae(l,p=12e3,x=!1){J.notice=String(l||""),J.noticeWarn=!!x,clearTimeout(Wt),Wt=setTimeout(()=>{J.notice="",rt()},p),rt()}let _e=[];function fe(l,p,x){let M=Ke(.088,.112,2400);u(M.tex),u(M.mesh.material),u(M.mesh.geometry),m.push(M.mesh.material);let f={c:M,icon:l,label:p,hot:!1,on:!1,shown:!0};return f.draw=()=>{let{ctx:A,w:G,h:F}=M;A.clearRect(0,0,G,F);let Z=G*.38,H=G/2,X=Z+10;A.beginPath(),A.arc(H,X,Z,0,Math.PI*2);let nt=A.createLinearGradient(0,X-Z,0,X+Z);nt.addColorStop(0,f.hot?"rgba(44, 50, 64, 0.97)":"rgba(26, 29, 38, 0.95)"),nt.addColorStop(1,f.hot?"rgba(26, 30, 40, 0.97)":"rgba(14, 16, 22, 0.95)"),A.fillStyle=nt,A.fill(),A.lineWidth=f.hot||f.on?5:3,A.strokeStyle=f.on?Rn:f.hot?"rgba(255,255,255,0.55)":"rgba(255,255,255,0.16)",A.stroke(),Ei(A,f.icon,H,X,Z*1.05,f.on?Rn:ke,6.5);let lt=P?{on:"#0F766E",hot:"#11151C",rest:"#2A303B"}:{on:Rn,hot:ke,rest:nn};xe(A,f.label,H,F-12,30,f.on?lt.on:f.hot?lt.hot:lt.rest,600,"center",He,"0.01em"),M.update()},f.set=(A,G)=>{A===f.icon&&G===f.label||(f.icon=A,f.label=G,f.draw())},f.setOn=A=>{!!A!==f.on&&(f.on=!!A,f.draw())},f.draw(),St(M.mesh,{tap:x,hover:A=>{f.hot=A,f.draw(),M.mesh.position.z=A?.026:.02}}),y.add(M.mesh),_e.push(f),f}function ht(){let l=_e.filter(x=>x.shown),p=l.length>6?.088:.1;l.forEach((x,M)=>{x.c.mesh.visible=!0,x.c.mesh.position.set((M-(l.length-1)/2)*p,-.375,.02)});for(let x of _e)x.shown||(x.c.mesh.visible=!1)}let gt=[];function St(l,p){return l.userData.ui=p,gt.push(l),l}function Jt(l){let p=gt.indexOf(l);p>=0&&gt.splice(p,1)}let Ot=l=>{for(let p=l;p;p=p.parent)if(!p.visible)return!1;return!0},ie=new Ma;ie.far=10;let Kt=new N,oe=new N,ye=new hi,ce=0,ue=[],Ge=u(new Fs(.006,20)),ln=u(new Le().setAttribute("position",new ne([0,0,0,0,0,-1],3)));function wn(l,p){let x={kind:l,ctrl:p,source:null,hit:null,hover:null,press:null,origin:new N,dir:new N,buttons:[],scrollAt:0};return x.dot=new he(Ge,u(new rn({color:16777215,transparent:!0,opacity:.9,depthTest:!1}))),x.dot.renderOrder=999,x.dot.visible=!1,h.add(x.dot),p&&(x.line=new Ni(ln,u(new si({color:10482666,transparent:!0,opacity:.5}))),x.line.visible=!1,p.add(x.line)),ue.push(x),x}let Ue=(l,p=.25,x=16)=>{try{l.source?.gamepad?.hapticActuators?.[0]?.pulse?.(p,x)}catch{}};function Ze(l,p=!1){if(!l.hit)return;let x=l.hit.object.userData.ui,M=x.drag?x.drag():null;if(l.press={u:x,obj:l.hit.object,hit:l.hit,drag:M,grabOnly:p,dist:l.hit.distance,start:l.hit.point.clone(),offset:M?M.position.clone().sub(l.hit.point):null,moved:!1,t0:performance.now()},!M&&x.turn&&(l.press.turn=tu(x.turn())),Ue(l,.35,20),!p)try{x.down?.(l)}catch(f){console.warn("vr down",f)}}let B=new N,cn=new N,ve=new N;function L(l,p){let x=l.source?.hand?o.xr.getHand(l.index):null,M=x?.joints?.["index-finger-tip"],f=x?.joints?.["thumb-tip"];return M&&f?(M.getWorldPosition(p),f.getWorldPosition(cn),p.add(cn).multiplyScalar(.5)):l.ctrl.getWorldPosition(p)}function b(l){if(s||!l.source)return!1;L(l,B);let p=null,x=1/0;for(let f of gt){let A=f.userData.ui;if(!(A.drag||A.grab||A.turn)||!Ot(f))continue;let G=f.geometry;G.boundingBox||G.computeBoundingBox(),f.updateWorldMatrix(!0,!1),ve.copy(B),f.worldToLocal(ve);let F=G.boundingBox,Z=f.getWorldScale(cn),H=(f===O?.07:.03)/Math.max(.001,Z.x),X=Math.max(F.min.x-ve.x,0,ve.x-F.max.x),nt=Math.max(F.min.y-ve.y,0,ve.y-F.max.y),lt=Math.max(F.min.z-ve.z,0,ve.z-F.max.z);if(X>H||nt>H||lt>H+.05/Math.max(.001,Z.x))continue;let wt=Math.hypot(X,nt,lt);wt<x&&(x=wt,p={m:f,u:A})}if(!p)return!1;if(!(p.u.drag||p.u.grab)&&p.u.turn)return l.press={u:p.u,obj:p.m,hit:null,drag:null,turn:tu(p.u.turn()),direct:!0,grabOnly:!1,start:B.clone(),moved:!1,t0:performance.now()},Ue(l,.5,28),!0;let M=(p.u.drag||p.u.grab)();return M?(l.press={u:p.u,obj:p.m,hit:null,drag:M,direct:!0,grabOnly:!1,offset:M.position.clone().sub(B),start:B.clone(),moved:!1,t0:performance.now()},Ue(l,.5,28),!0):!1}function Y(l,p=!0){let x=l.press;if(l.press=null,!!x){if(!x.grabOnly)try{x.u.up?.(performance.now()-x.t0,p&&!x.moved)}catch(M){console.warn("vr up",M)}if(x.moved&&x.turn){Q.view.spin=Math.max(-4,Math.min(4,x.turn.vel));return}if(x.moved){x.u.dropped?.();return}if(x.direct){if(!p)return;let M=null,f=x.obj.geometry?.parameters;if(f?.width&&f?.height){L(l,B);let A=x.obj.worldToLocal(B.clone());M={uv:{x:Math.max(0,Math.min(1,A.x/f.width+.5)),y:Math.max(0,Math.min(1,A.y/f.height+.5))},point:B.clone()}}try{x.u.tap?.(M,l)}catch(A){console.warn("vr tap",A)}return}if(!(x.grabOnly||!p)&&!(!l.hit||l.hit.object!==x.obj))try{x.u.tap?.(l.hit,l)}catch(M){console.warn("vr tap",M)}}}function K(l){l.lookAt(Kt.x,l.position.y,Kt.z)}let ot=[],Mt=(l,p,x,M)=>{l.addEventListener(p,x,M),ot.push(()=>l.removeEventListener(p,x,M))},Tt=null;if(!s){for(let l=0;l<2;l++){let p=o.xr.getController(l);h.add(p);let x=wn("xr",p);x.index=l,Mt(p,"connected",M=>{x.source=M.data,x.line.visible=!0}),Mt(p,"disconnected",()=>{x.source=null,x.line.visible=!1,x.dot.visible=!1,x.press=null}),Mt(p,"selectstart",()=>{x.selected=!1,!b(x)&&(Zt(x),Ze(x))}),Mt(p,"select",()=>{x.selected=!0}),Mt(p,"selectend",()=>{Zt(x),Y(x,x.selected),x.selected=!1}),Mt(p,"squeezestart",()=>{b(x)||(Zt(x),Ze(x,!0))}),Mt(p,"squeezeend",()=>Y(x,!1))}for(let l=0;l<2;l++)h.add(o.xr.getHand(l));if(!r){let l=u(new Un(.006,8,6)),p=u(new rn({color:13496317,transparent:!0,opacity:.85}));Tt={jointGeo:l,jointMat:p}}}let ut=0;if(!s)try{o.xr.enabled=!0;let l=t.enabledFeatures,p=!l||l.includes("local-floor")?"local-floor":"local";p==="local"&&(ut=-1.6),o.xr.setReferenceSpaceType(p);try{o.xr.setFramebufferScaleFactor(1.25)}catch{}await o.xr.setSession(t);try{o.xr.setFoveation(.2)}catch{}let x=[...t.inputSources||[]].filter(M=>!ue.some(f=>f.source===M));if(x.length){let M=new Event("inputsourceschange");Object.assign(M,{session:t,added:x,removed:[]}),t.dispatchEvent(M)}}catch(l){for(let p of ot)try{p()}catch{}c.remove(),o.dispose();try{await t.end()}catch{}throw l}let pt=r?null:Wx(h,ut);R(D);let Ct=new Bt,zt=s?wn("mouse",null):null,At=null,Et=-.2,Xt=0;if(s){zt.source={};let l=p=>{Ct.set(p.clientX/window.innerWidth*2-1,-(p.clientY/window.innerHeight)*2+1)};Mt(c,"pointermove",p=>{l(p),At&&(Xt-=(p.clientX-At.x)*.004,Et-=(p.clientY-At.y)*.004,Et=Math.max(-1.2,Math.min(1.2,Et)),At={x:p.clientX,y:p.clientY})}),Mt(c,"pointerdown",p=>{l(p),Zt(zt),zt.hit?Ze(zt):At={x:p.clientX,y:p.clientY},c.setPointerCapture?.(p.pointerId)}),Mt(c,"pointerup",p=>{l(p),At=null,Zt(zt),Y(zt)}),Mt(c,"pointercancel",()=>{At=null,zt.press=null}),Mt(c,"wheel",p=>{let x=zt.hit?.object.userData.ui;x?.scroll&&(p.preventDefault(),x.scroll(Math.sign(p.deltaY)*Math.min(5,Math.ceil(Math.abs(p.deltaY)/60))))},{passive:!1}),Mt(window,"keydown",p=>{p.key==="Escape"?Vr():p.key===" "&&p.target===document.body&&(p.preventDefault(),e.tapOrb())}),Mt(window,"resize",()=>{d.aspect=window.innerWidth/window.innerHeight,d.updateProjectionMatrix(),o.setSize(window.innerWidth,window.innerHeight)})}function Zt(l){if(l.kind==="mouse")ie.setFromCamera(Ct,d),l.origin.copy(ie.ray.origin),l.dir.copy(ie.ray.direction);else{if(!l.source)return!1;l.ctrl.getWorldPosition(l.origin),l.ctrl.getWorldQuaternion(ye),l.dir.set(0,0,-1).applyQuaternion(ye)}ie.set(l.origin,l.dir);let p=ie.intersectObjects(gt,!1);return l.hit=p.find(x=>Ot(x.object))||null,!0}function se(l){l.holdAt=performance.now(),l.holdListening=J.state==="listening",l.holdListening||e.tapOrb()}function V(l,p){let x=l.holdListening;l.holdListening=!1,(x||p>600)&&e.tapOrb()}St(O,{tap:()=>e.tapOrb(),drag:()=>y,dropped:()=>{y.userData.placed=!0},hover:l=>{J.hovered=l}}),St(at.mesh,{drag:()=>y,dropped:()=>{y.userData.placed=!0}});let bt=fe("mic","Talk",null);Object.assign(bt.c.mesh.userData.ui,{tap:null,down:()=>se(bt),up:(l,p)=>{p&&V(bt,l)}});let ft=fe("pause","Pause",()=>e.hangUp()),Rt=fe("eye","Look",()=>{Bi(),e.look()}),Dt=()=>{_t.open?Gs():Ga().then(l=>{l&&e.speak(l)})},vt=()=>{let l=e.lastReply();l?ru(l):e.speak("There's nothing to pin yet. Ask me something first.")},qt=()=>{if(et.open)return Ut();if(!e.pc.current())return Ae("Your photos are on your PC: pair this headset with it once (leave the room, Remote, Pair).",12e3,!0);fn("Pictures").then(l=>{l&&Ae(l,12e3,!0)})},Ht=()=>Ae(U(),5e3),Fe=fe("photos","Photos",qt),Ce=fe("pc","My PC",Dt);fe("pin","Pin",vt),fe("style","Style",Ht),fe("leave","Leave",()=>Vr()),ft.shown=!1,Rt.shown=!1,ht();let Tn=[];function kn(l,p,x){let M=Ke(.205,.054,2400);u(M.tex),u(M.mesh.material),u(M.mesh.geometry),g||m.push(M.mesh.material);let f={c:M,hot:!1};return f.draw=()=>{let{ctx:A,w:G,h:F}=M;On(A,G,F,(F-6)/2,{hot:f.hot}),Ei(A,l,58,F/2,50,Rn,7),A.font=`500 37px ${an}`,xe(A,Pn(A,p,G-124),98,F/2+13,37,ke,500),M.update()},f.draw(),St(M.mesh,{tap:()=>{Fa(),e.ask(x)},hover:A=>{f.hot=A,f.draw()}}),y.add(M.mesh),Tn.push(f),f}let Vs=!1;try{Vs=localStorage.getItem("izuki.vr.tried")!=="1"}catch{}function Fa(){Vs=!1;for(let l of Tn)l.c.mesh.visible=!1;try{localStorage.setItem("izuki.vr.tried","1")}catch{}}function Oa(){Tn.forEach((l,p)=>{l.c.mesh.position.set((p-(Tn.length-1)/2)*.218,.17,.01)}),gc()}e.hasCamera().then(l=>{Rt.shown=!!l,ht(),kn(l?"eye":"mic",l?"\u201CWhat's this?\u201D":"\u201CWhat can you do?\u201D",l?"What's this?":"What can you do?"),kn("photos","\u201CShow my photos\u201D","Show my photos"),kn("style","\u201CChange your look\u201D","Change your look"),Oa()});let Nt={group:new Ye,photo:null,text:Ke(.5,.15),img:null,url:"",want:"",closed:"",seq:0,marks:[],say:"",t0:0,anim:!1,close:Ke(.05,.05)};Nt.group.visible=!1,h.add(Nt.group),St(Nt.text.mesh,{drag:()=>Nt.group}),u(Nt.text.tex),u(Nt.close.tex),Nt.group.add(Nt.text.mesh,Nt.close.mesh),pf(Nt.close,"close"),St(Nt.close.mesh,{tap:()=>{Nt.seq++,Nt.closed=Nt.want,Nt.group.visible=!1}});function Ba(){let{ctx:l,w:p,h:x}=Nt.text;On(l,p,x,44);let M=(G,F)=>(l.font=`500 ${F}px ${an}`,l.measureText(G).width),f=a.fitLines(Nt.say,p-96,4,38,26,M),A=22;for(let G of f.lines)xe(l,G,48,A+=f.size*1.32,f.size,ke,500);Nt.text.update(),$t(Nt.say)}function Nr(l){let p=Nt.photo;if(!p||!Nt.img)return;let{ctx:x,w:M,h:f}=p;x.clearRect(0,0,M,f),x.save(),Jn(x,0,0,M,f,28),x.clip(),x.drawImage(Nt.img,0,0,M,f),x.restore();let A=Nt.marks.length,G=M*(Nt.steps?.03:.065),F=Z=>({x:Z.x/1e3*M,y:Z.y/1e3*f});Nt.marks.forEach((Z,H)=>{let X=Math.max(0,Math.min(1,l*A-H));if(X<=0)return;let{x:nt,y:lt}=F(Z);if(Nt.steps&&H>0&&za(x,F(Nt.marks[H-1]),{x:nt,y:lt},G,Math.min(1,X*2)),x.save(),x.shadowColor="rgba(0,0,0,0.55)",x.shadowBlur=10,x.shadowOffsetY=3,x.strokeStyle=Rn,x.lineWidth=6,x.lineCap="round",x.beginPath(),x.arc(nt,lt,G,-Math.PI/2,-Math.PI/2+Math.PI*2*X),x.stroke(),x.restore(),Nt.steps&&A>1&&X>.3){let wt=Math.min(M-26,Math.max(26,nt-G*.75)),dt=Math.min(f-26,Math.max(26,lt-G*.75));x.save(),x.shadowColor="rgba(0,0,0,0.5)",x.shadowBlur=8,x.fillStyle=Rn,x.beginPath(),x.arc(wt,dt,22,0,Math.PI*2),x.fill(),x.restore(),x.font=`700 26px ${an}`;let Yt=String(H+1);xe(x,Yt,wt-x.measureText(Yt).width/2,dt+9,26,"#0b1016",700)}if(X>.85&&Z.label){x.font=`600 28px ${an}`;let wt=x.measureText(Z.label).width,dt=Math.min(M-wt-40,Math.max(10,nt-wt/2-16)),Yt=lt+G+12>f-50?lt-G-56:lt+G+12;Nt.steps&&(dt=nt+G+16+wt+32<=M-10?nt+G+16:Math.max(10,nt-G-16-wt-32),Yt=Math.min(f-54,Math.max(10,lt-22))),Jn(x,dt,Yt,wt+32,44,22),x.fillStyle="rgba(14,16,22,0.88)",x.fill(),xe(x,Z.label,dt+16,Yt+31,28,ke,600)}}),p.update()}function za(l,p,x,M,f){let A=x.x-p.x,G=x.y-p.y,F=Math.hypot(A,G);if(F<=2*M+12)return;let Z=A/F,H=G/F,X=p.x+Z*(M+6),nt=p.y+H*(M+6),lt=(F-2*M-12)*f,wt=X+Z*lt,dt=nt+H*lt;if(l.save(),l.shadowColor="rgba(0,0,0,0.5)",l.shadowBlur=8,l.strokeStyle=Rn,l.lineWidth=5,l.lineCap="round",l.setLineDash([16,12]),l.beginPath(),l.moveTo(X,nt),l.lineTo(wt,dt),l.stroke(),l.setLineDash([]),f>=1){let ee=-H,de=Z;l.fillStyle=Rn,l.beginPath(),l.moveTo(wt+Z*4,dt+H*4),l.lineTo(wt-Z*18+ee*18*.6,dt-H*18+de*18*.6),l.lineTo(wt-Z*18-ee*18*.6,dt-H*18-de*18*.6),l.closePath(),l.fill()}l.restore()}function Bi(){Nt.group.visible&&(Nt.say="Looking\u2026",Ba())}async function Ur({url:l,w:p,h:x,marks:M,say:f,picked:A,steps:G}){if(A)Nt.closed="";else if(l===Nt.closed)return;let F=++Nt.seq;if(Nt.want=l,l!==Nt.url){let Z=new Image;Z.src=l;try{await Z.decode()}catch{return}if(F!==Nt.seq)return;Nt.img=Z,Nt.url=l;let H=x/Math.max(1,p),X=Math.min(.42,.5*H),nt=X/H;Nt.photo&&(Jt(Nt.photo.mesh),Nt.group.remove(Nt.photo.mesh),Nt.photo.tex.dispose(),Nt.photo.mesh.geometry.dispose(),Nt.photo.mesh.material.dispose()),Nt.photo=Ke(nt,X,2048),Nt.group.add(Nt.photo.mesh),St(Nt.photo.mesh,{drag:()=>Nt.group}),Nt.photo.mesh.position.set(0,.1,0),Nt.text.mesh.position.set(0,.1-X/2-.09,0),Nt.close.mesh.position.set(nt/2-.01,.1+X/2-.01,.005)}if(Nt.marks=Array.isArray(M)?M:[],Nt.steps=!!G,Nt.say=String(f||""),Nt.t0=performance.now(),Nt.anim=Nt.marks.length>0,!Nt.group.visible){let Z=ce-.6,H=.85;Nt.group.position.set(Kt.x-Math.sin(Z)*H,Kt.y-.08,Kt.z-Math.cos(Z)*H),K(Nt.group)}Nt.group.visible=!0,Nr(Nt.anim?0:1),Ba()}let _t={group:new Ye,open:!1,live:!1,gen:0,target:null,err:"",clicks:Promise.resolve(),doing:"",busy:!1,screen:null,bar:Ke(1.6,.09),handle:Ke(.32,.035),aspect:9/16};_t.group.visible=!1,h.add(_t.group),u(_t.bar.tex),u(_t.handle.tex);function Fr(l,p){_t.screen&&(Jt(_t.screen.mesh),_t.group.remove(_t.screen.mesh),_t.screen.tex.dispose(),_t.screen.mesh.geometry.dispose(),_t.screen.mesh.material.dispose());let x=p/l,M=Math.min(1.6,1.1/x),f=Ke(M,M*x,l/M);f.mesh.material.transparent=!1,f.mesh.material.depthWrite=!0,_t.screen=f,_t.aspect=x,_t.group.add(f.mesh);let A=M*x/2;return _t.bar.mesh.position.set(0,-A-.06,0),_t.handle.mesh.position.set(0,A+.04,0),St(f.mesh,{tap:G=>{if(!G?.uv||!_t.live)return;let{nx:F,ny:Z}=a.pcPoint(G.uv.x,G.uv.y),H=_t.gen;z(G.point);let X=()=>_t.open&&H===_t.gen&&_t.live;_t.clicks=_t.clicks.then(async()=>{if(!X())return;let nt=await e.pc.send({op:"point",nx:F,ny:Z},_t.target);if(nt?.ok===!1){H===_t.gen&&(_t.err=nt.error||"",Kn());return}X()&&await e.pc.send({op:"click",button:"left"},_t.target)}).catch(()=>{})},scroll:G=>{_t.live&&e.pc.send({op:"scroll",dy:G},_t.target)}}),f}Fr(1280,720),_t.group.add(_t.bar.mesh,_t.handle.mesh);{let{ctx:l,w:p,h:x}=_t.handle;l.clearRect(0,0,p,x),Jn(l,4,4,p-8,x-8,(x-8)/2),l.fillStyle="rgba(255,255,255,0.34)",l.fill(),_t.handle.update()}St(_t.handle.mesh,{drag:()=>_t.group});function Ki(l){_t.live=!1;let p=_t.screen,{ctx:x,w:M,h:f}=p;On(x,M,f,24),x.font=`500 ${Math.round(f*.05)}px ${an}`;let A=a.wrapLines(l,M*.7,G=>x.measureText(G).width);A.forEach((G,F)=>xe(x,G,M/2,f/2+(F-(A.length-1)/2)*f*.075,Math.round(f*.05),nn,500,"center")),p.update()}function ka(l){(Math.abs(l.height/l.width-_t.aspect)>.01||_t.screen.w!==l.width)&&Fr(l.width,l.height);let p=_t.screen;p.ctx.drawImage(l,0,0,p.w,p.h),p.update(),_t.live=!0}function Kn(){let{ctx:l,w:p,h:x}=_t.bar;On(l,p,x,48),l.beginPath(),l.arc(72,x/2,13,0,Math.PI*2),l.fillStyle=_t.err?Na:Rn,l.fill();let M=_t.err||(_t.doing?"Izuki: "+_t.doing:(_t.target?.name||e.pc.name())+" \xB7 point and click, thumbstick to scroll");l.font=`500 60px ${an}`,xe(l,Pn(l,M,p-800),116,x/2+21,60,_t.err?Na:ke,500);let f=(A,G,F)=>{Jn(l,A,30,280,x-60,(x-60)/2),l.fillStyle=F?"rgba(220, 38, 38, 0.82)":"rgba(255, 255, 255, 0.07)",l.fill(),F||(l.lineWidth=3,l.strokeStyle="rgba(255,255,255,0.16)",l.stroke()),xe(l,G,A+140,x/2+19,52,ke,600,"center",He,"0.02em")};_t.busy&&f(p-620,"Stop",!0),f(p-310,"Close",!1),_t.bar.update()}St(_t.bar.mesh,{tap:l=>{let p=(l?.uv?.x??0)*_t.bar.w;if(p>_t.bar.w-320)Gs();else if(_t.busy&&p>_t.bar.w-630){let x=_t.gen;e.pc.send({op:"stop"},_t.target).then(M=>{!_t.open||x!==_t.gen||(M?.ok===!1?_t.err=M.error||"Your PC didn't confirm it stopped.":(_t.busy=!1,_t.err=""),Kn())})}},drag:()=>_t.group});let Or=l=>new Promise(p=>setTimeout(p,l));async function Va(l){for(;_t.open&&l===_t.gen;){let p=performance.now(),x=await e.pc.shot(1280,_t.target);if(!_t.open||l!==_t.gen)break;if(x.blob){let M=()=>_t.open&&l===_t.gen,f=null;try{f=await createImageBitmap(x.blob),M()&&(ka(f),_t.err&&(_t.err="",Kn()))}catch{M()&&(_t.err="A picture from your PC didn't come through.",Ki(_t.err),Kn())}finally{f?.close?.()}}else _t.err=x.error||"Your PC didn't answer.",Ki(_t.err),Kn();await Or(x.blob?Math.max(120,320-(performance.now()-p)):3e3)}}async function hc(l){for(;_t.open&&l===_t.gen;){let p=await e.pc.status(_t.target);if(!_t.open||l!==_t.gen)break;p.error||(_t.doing=p.doing,_t.busy=p.busy,Kn()),await Or(3e3)}}async function Ga(){if(!e.pc.current())return"This headset isn't paired with your PC yet. Leave VR, open Remote in Izuki and pair your PC once.";let l=1.55;_t.group.position.set(Kt.x-Math.sin(ce)*l,Kt.y-.02,Kt.z-Math.cos(ce)*l),K(_t.group),_t.group.visible=!0,_t.open=!0,_t.err="",_t.target=e.pc.current(),oi("pc");let p=++_t.gen;return Ki("Connecting to "+(_t.target?.name||e.pc.name())+"\u2026"),Kn(),Va(p),hc(p),""}function Gs(){_t.open=!1,_t.gen++,_t.group.visible=!1,y.userData.placed==="pc"&&(et?.open?y.userData.placed="files":xt?.open?y.userData.placed="web":Q?.open?y.userData.placed="holo":Ys())}function oi(l){if(y.userData.placed!==!0){if(!y.userData.placed){let p=ce+.7;ti={x:Kt.x-Math.sin(p)*.7,y:Kt.y-.17,z:Kt.z-Math.cos(p)*.7}}y.userData.placed=l}}let Ts=[],w=u(new ps(.012,.018,32));function z(l){let p=new he(w,new rn({color:6220500,transparent:!0,opacity:.9,depthTest:!1}));p.position.copy(l),p.lookAt(Kt),p.renderOrder=998,h.add(p),Ts.push({m:p,t0:performance.now()})}let st=1,j=.74,$=4,It=3,Ft=$*It,Pt=.12,et={group:new Ye,card:Ke(st,j),handle:Ke(.3,.035),open:!1,gen:0,path:"",up:"",items:[],page:0,title:"",err:"",loading:!1,thumbs:new Map,pending:new Set,btns:[]};et.group.visible=!1,h.add(et.group),et.group.add(et.card.mesh,et.handle.mesh),et.handle.mesh.position.set(0,j/2+.035,0),u(et.card.tex),u(et.handle.tex);{let{ctx:l,w:p,h:x}=et.handle;Jn(l,4,4,p-8,x-8,(x-8)/2),l.fillStyle="rgba(255,255,255,0.34)",l.fill(),et.handle.update()}St(et.handle.mesh,{drag:()=>et.group});let Gt=()=>et.items.slice(et.page*Ft,et.page*Ft+Ft),re=()=>Math.max(1,Math.ceil(et.items.length/Ft)),pe=l=>et.path+"|"+l.name;function Vt(l){let{w:p,h:x}=et.card,M=x*Pt,f=p*.018,A=(p-f*($+1))/$,G=(x-M-f*(It+1))/It;return{x:f+l%$*(A+f),y:M+f+Math.floor(l/$)*(G+f),w:A,h:G}}function me(){let{ctx:l,w:p,h:x}=et.card;On(l,p,x,56);let M=x*Pt;et.btns=[];let f=M*.62,A=M*.56,G=p-44,F=(H,X)=>{let nt=G-f/2;l.beginPath(),l.arc(nt,A,f/2,0,Math.PI*2),l.fillStyle="rgba(255,255,255,0.06)",l.fill(),l.lineWidth=3,l.strokeStyle="rgba(255,255,255,0.16)",l.stroke(),Ei(l,H,nt,A,f*.62,ke,7),et.btns.push({x0:G-f,x1:G,act:X}),G-=f+20};F("close",()=>Ut()),et.page+1<re()&&F("next",()=>{et.page++,me(),We(et.gen)}),et.page>0&&F("back",()=>{et.page--,me(),We(et.gen)}),et.path&&F("up",()=>{Ee(et.up,"")}),l.font=`600 50px ${He}`;let Z=Pn(l,et.title||"Your folders",G-220);if(xe(l,Z,56,A+18,50,ke,600,"left",He,"-0.01em"),re()>1){l.font=`600 50px ${He}`;let H=l.measureText(Z).width;xe(l,`${et.page+1} / ${re()}`,56+H+28,A+16,34,nn,500)}if(et.loading||et.err||!et.items.length){let H=et.loading?"Opening\u2026":et.err||"This folder is empty.";l.font=`500 46px ${an}`;let X=a.wrapLines(H,p*.7,nt=>l.measureText(nt).width);X.forEach((nt,lt)=>xe(l,nt,p/2,x*.55+(lt-(X.length-1)/2)*64,46,et.err?Na:nn,500,"center")),et.card.update();return}Gt().forEach((H,X)=>{let nt=Vt(X);l.save(),Jn(l,nt.x,nt.y,nt.w,nt.h,26),l.fillStyle="rgba(255,255,255,0.045)",l.fill(),l.clip();let lt=et.thumbs.get(pe(H));if(lt){let dt=Math.max(nt.w/lt.width,nt.h/lt.height);l.drawImage(lt,nt.x+(nt.w-lt.width*dt)/2,nt.y+(nt.h-lt.height*dt)/2,lt.width*dt,lt.height*dt)}else Ei(l,H.dir?"folder":e.isPicture(H.name)?"photos":"doc",nt.x+nt.w/2,nt.y+nt.h*.42,Math.min(nt.w,nt.h)*.4,H.dir?ke:nn,4);let wt=l.createLinearGradient(0,nt.y+nt.h-92,0,nt.y+nt.h);wt.addColorStop(0,"rgba(10,12,18,0)"),wt.addColorStop(1,"rgba(10,12,18,0.86)"),l.fillStyle=wt,l.fillRect(nt.x,nt.y+nt.h-92,nt.w,92),l.font=`500 30px ${an}`,xe(l,Pn(l,H.name,nt.w-36),nt.x+18,nt.y+nt.h-20,30,ke,500),l.restore()}),et.card.update()}async function We(l){for(let p of Gt()){if(l!==et.gen||!et.open)return;let x=pe(p);if(p.dir||!e.isPicture(p.name)||et.thumbs.has(x)||et.pending.has(x))continue;et.pending.add(x);let M=null;try{M=await e.thumb(et.path,p)}finally{l===et.gen&&et.pending.delete(x)}if(l!==et.gen||!et.open){M?.close?.();return}if(et.thumbs.has(x)){M?.close?.();continue}et.thumbs.set(x,M||null),M&&me()}}function Oe(){for(let l of et.thumbs.values())l?.close?.();et.thumbs.clear(),et.pending.clear()}async function Ee(l,p){let x=++et.gen;Oe(),Object.assign(et,{loading:!0,err:"",items:[],page:0,title:p||et.title}),me();let M;if(l)M=await e.pc.list(l);else{let f=await e.pc.roots();M=f.error?f:{path:"",up:"",items:f.roots.map(A=>({name:A.name,dir:!0,at:A.path}))}}return x!==et.gen||!et.open?"":(et.loading=!1,M.error?(et.err=M.error,me(),M.error):(Object.assign(et,{path:M.path,up:M.up,items:M.items}),p||(et.title=M.path?String(M.path).split(/[\\/]/).filter(Boolean).slice(-2).join(" \u203A "):"Your folders"),me(),We(x),""))}St(et.card.mesh,{tap:l=>{if(!l?.uv)return;let{w:p,h:x}=et.card,M=l.uv.x*p,f=(1-l.uv.y)*x;if(f<x*Pt){et.btns.find(F=>M>=F.x0&&M<=F.x1)?.act();return}if(et.loading)return;let A=Gt().findIndex((F,Z)=>{let H=Vt(Z);return M>=H.x&&M<=H.x+H.w&&f>=H.y&&f<=H.y+H.h}),G=Gt()[A];G&&(G.dir?Ee(G.at||e.joinPath(et.path,G.name),G.name):e.openPhoto(et.path,G).then(F=>{F&&Ae(F,12e3,!0)}))},scroll:l=>{let p=Math.max(0,Math.min(re()-1,et.page+Math.sign(l)));p!==et.page&&(et.page=p,me(),We(et.gen))}});async function fn(l){if(!et.open){let f=ce-(_t.open?.85:.05),A=1.15;et.group.position.set(Kt.x-Math.sin(f)*A,Kt.y-.04,Kt.z-Math.cos(f)*A),K(et.group),oi("files")}if(et.open=!0,et.group.visible=!0,!l)return Ee("","Your folders");let p=++et.gen;Object.assign(et,{loading:!0,err:""}),me();let x=await e.pc.roots();if(!et.open||p!==et.gen)return"";if(x.error)return et.loading=!1,et.err=x.error,me(),x.error;let M=x.roots.find(f=>String(f.name).toLowerCase()===l.toLowerCase());return M?Ee(M.path,M.name):(await Ee("","Your folders"),"I couldn't find a "+l+" folder on your PC, so here are all your folders.")}function Ut(){et.open=!1,et.gen++,et.group.visible=!1,Oe(),y.userData.placed==="files"&&(_t.open?y.userData.placed="pc":xt.open?y.userData.placed="web":Q.open?y.userData.placed="holo":Ys())}let pn=1,Me=.1,An=.62,jn=5,xt={group:new Ye,head:Ke(pn,Me),body:Ke(pn,An),handle:Ke(.3,.035),open:!1,gen:0,q:"",typed:"",mode:"",results:[],page:null,title:"",paras:[],first:0,more:!1,err:"",btns:[],rows:[]};xt.group.visible=!1,h.add(xt.group),xt.group.add(xt.head.mesh,xt.body.mesh,xt.handle.mesh),xt.head.mesh.position.set(0,An/2+.008+Me/2,0),xt.handle.mesh.position.set(0,An/2+.016+Me+.02,0),u(xt.head.tex),u(xt.body.tex),u(xt.handle.tex);{let{ctx:l,w:p,h:x}=xt.handle;Jn(l,4,4,p-8,x-8,(x-8)/2),l.fillStyle="rgba(255,255,255,0.34)",l.fill(),xt.handle.update()}St(xt.handle.mesh,{drag:()=>xt.group});let zi=()=>xt.mode==="reading"||xt.mode==="page-loading"||xt.mode==="page-error";function Re(){let{ctx:l,w:p,h:x}=xt.head;On(l,p,x,48);let M=x/2,f=x*.6;xt.btns=[];let A=p-36,G=(wt,dt)=>{let Yt=A-f/2;l.beginPath(),l.arc(Yt,M,f/2,0,Math.PI*2),l.fillStyle="rgba(255,255,255,0.06)",l.fill(),l.lineWidth=3,l.strokeStyle="rgba(255,255,255,0.16)",l.stroke(),Ei(l,wt,Yt,M,f*.62,ke,7),xt.btns.push({x0:A-f,x1:A,act:dt}),A-=f+18};G("close",()=>uc()),zi()&&G("back",()=>{xt.gen++,xt.mode="results",En()});let F=30,Z=A-12-F,H=x*.66;Jn(l,F,M-H/2,Z,H,H/2),l.fillStyle="rgba(255,255,255,0.06)",l.fill(),l.lineWidth=3,l.strokeStyle=xt.mode==="typing"||xt.mode==="searching"?"rgba(94,234,212,0.75)":"rgba(255,255,255,0.16)",l.stroke(),Ei(l,"search",F+H*.58,M,H*.6,nn,7);let X=zi()?xt.page?.site||"":xt.typed;l.font=`500 40px ${an}`;let nt=Pn(l,X||"Search Google",Z-H*1.4-24),lt=F+H*1.1;xe(l,nt,lt,M+14,40,X?ke:nn,500),xt.mode==="typing"&&(l.font=`500 40px ${an}`,l.fillStyle=Rn,l.fillRect(lt+(X?l.measureText(nt).width:0)+6,M-22,4,44)),xt.head.update()}function $e(){let{ctx:l,w:p,h:x}=xt.body;On(l,p,x,48),xt.rows=[];let M=56,f=(G,F=nn)=>{l.font=`500 44px ${an}`;let Z=a.wrapLines(G,p*.76,H=>l.measureText(H).width);Z.forEach((H,X)=>xe(l,H,p/2,x*.5+(X-(Z.length-1)/2)*62,44,F,500,"center"))},A=xt.mode;if(A==="")f("Say \u201Csearch the web for\u2026\u201D and anything you want to know. I'll look it up right here.");else if(A==="typing")f("");else if(A==="searching")f("Searching Google\u2026");else if(A==="error"||A==="page-error")f(xt.err,Na);else if(A==="page-loading")f("Reading "+(xt.page?.site||"the page")+"\u2026");else if(A==="results"){xt.results.length||f("Google didn't return any pages for that. Try other words.");let G=(x-40)/jn;xt.results.slice(0,jn).forEach((F,Z)=>{let H=20+Z*G;Z&&(l.fillStyle="rgba(255,255,255,0.08)",l.fillRect(M,H,p-M*2,2)),l.font=`600 40px ${He}`,xe(l,Pn(l,F.site,p-M*2),M,H+66,40,Rn,600,"left",He),l.font=`500 34px ${an}`;let X=a.wrapLines(F.snippet||"Tap to read this page.",p-M*2,nt=>l.measureText(nt).width).slice(0,2);X.length===2&&(F.snippet||"").length>0&&a.wrapLines(F.snippet,p-M*2,lt=>l.measureText(lt).width).length>2&&(X[1]=Pn(l,X[1]+" \u2026",p-M*2)),X.forEach((nt,lt)=>xe(l,nt,M,H+122+lt*46,34,nn,500)),xt.rows.push({y0:H,y1:H+G,r:F})})}else if(A==="reading"){l.font=`600 46px ${He}`;let G=a.wrapLines(xt.title,p-M*2,X=>l.measureText(X).width).slice(0,2),F=30;for(let X of G)xe(l,X,M,F+=60,46,ke,600,"left",He);F+=30,l.font=`500 36px ${an}`;let Z=x-70;xt.more=!1;for(let X=xt.first;X<xt.paras.length;X++){let nt=a.wrapLines(xt.paras[X],p-M*2,lt=>l.measureText(lt).width);if(F+nt.length*50>Z&&X>xt.first){xt.more=!0;break}for(let lt of nt){if((F+=50)>Z){xt.more=!0;break}xe(l,lt,M,F,36,ke,500)}F+=20}let H=`${xt.first+1} / ${xt.paras.length}`+(xt.more?"  \xB7  thumbstick or tap for more":"");xe(l,H,p-M,x-28,26,nn,500,"right")}xt.body.update()}function En(){Re(),$e()}St(xt.head.mesh,{tap:l=>{if(!l?.uv)return;let p=l.uv.x*xt.head.w;xt.btns.find(x=>p>=x.x0&&p<=x.x1)?.act()},grab:()=>xt.group}),St(xt.body.mesh,{tap:l=>{if(!l?.uv)return;let p=(1-l.uv.y)*xt.body.h;if(xt.mode==="results"){let x=xt.rows.find(M=>p>=M.y0&&p<M.y1);x&&xf(x.r)}else xt.mode==="reading"&&Ne(1)},scroll:l=>Ne(l),grab:()=>xt.group});function Ne(l){if(xt.mode!=="reading")return;let p=Math.max(0,Math.min(xt.paras.length-1,xt.first+Math.sign(l)));p===xt.first||l>0&&!xt.more||(xt.first=p,$e())}let Vn=new N;function ji(){y.userData.placed!==!0&&(xt.group.updateWorldMatrix(!0,!1),Vn.set(-pn/2-.36,An/2-.02,.06),xt.group.localToWorld(Vn),ti={x:Vn.x,y:Vn.y,z:Vn.z},y.userData.placed="web")}function Ha(){if(!xt.open){let l=ce-(_t.open||et.open?.85:.08),p=1.2;xt.group.position.set(Kt.x-Math.sin(l)*p,Kt.y-.02,Kt.z-Math.cos(l)*p),K(xt.group)}xt.open=!0,xt.group.visible=!0}function gf(l,p){return T?(xt.typed=l,Re(),Promise.resolve()):new Promise(x=>{let M=0,f=()=>{if(p!==xt.gen||!xt.open)return x();if(M=Math.min(l.length,M+(l.length>36?2:1)),xt.typed=l.slice(0,M),Re(),M>=l.length)return setTimeout(x,220);setTimeout(f,45+Math.random()*35)};f()})}async function _f(l){l=String(l||"").trim(),Ha();let p=++xt.gen;if(Object.assign(xt,{q:l,typed:"",results:[],page:null,err:"",mode:l?"typing":""}),En(),!l)return"What should I search for? Say search the web for, and what you want to know.";if(ji(),await gf(l,p),p!==xt.gen||!xt.open)return"";xt.mode="searching",En();let x;try{x=await e.search(l)}catch(M){x={error:String(M?.message||M)}}return p!==xt.gen||!xt.open?"":!x||x.error?(Object.assign(xt,{mode:"error",err:x?.error||"The search didn't work."}),En(),xt.err):(Object.assign(xt,{mode:"results",results:Array.isArray(x.results)?x.results:[]}),En(),x.answer||(xt.results.length?"Here's what Google found. Point at one and I'll read it to you.":"Google didn't find anything for that."))}async function xf(l){let p=++xt.gen;Object.assign(xt,{mode:"page-loading",page:l,paras:[],first:0,title:"",err:""}),En();let x;try{x=await e.read(l,xt.q)}catch(M){x={error:String(M?.message||M)}}if(!(p!==xt.gen||!xt.open)){if(!x||x.error){Object.assign(xt,{mode:"page-error",err:x?.error||"I couldn't read that page."}),En();return}Object.assign(xt,{mode:"reading",title:x.title||l.site,paras:Array.isArray(x.paras)&&x.paras.length?x.paras:["That page gave me nothing to read."]}),En(),e.speak?.(xt.paras[0])}}function uc(){xt.open=!1,xt.gen++,xt.group.visible=!1,y.userData.placed==="web"&&(_t.open?(y.userData.placed=!1,oi("pc")):Q.open?(y.userData.placed=!1,oi("holo")):Ys())}let on={teal:6220500,sky:8246268,violet:12891645,rose:16622767,amber:16569165,lime:12513892,white:15331063},vf=l=>"#"+(on[l]??on.teal).toString(16).padStart(6,"0"),Q={group:new Ye,stage:new Ye,open:!1,spec:null,nodes:[],links:[],bar:Ke(.86,.1),t0:0,focus:null,step:-1,building:null,btns:[],view:null},Jh=()=>({spin:0,spinT:0,size:1,sizeT:1,turnT:null,ex:0,exT:0});Q.view=Jh(),Q.group.visible=!1,Q.group.add(Q.stage,Q.bar.mesh),Q.bar.mesh.position.set(0,-.42,.02),h.add(Q.group),u(Q.bar.tex);let Hs=u(ff()),yf=u(new Un(1,32,24)),Mf=u(new Si(1,1,1)),Sf=(()=>{let l=new fs(1,1),p=u(new wr(l));return l.dispose(),p})(),Kh={value:0};function Ws(l){return new xn({uniforms:{color:{value:new jt(l)},opacity:{value:.82},time:Kh},vertexShader:`varying vec3 vN; varying vec3 vV; varying float vY;
void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
  vY = (modelMatrix * vec4(position, 1.0)).y; gl_Position = projectionMatrix * mv; }`,fragmentShader:`uniform vec3 color; uniform float opacity; uniform float time; varying vec3 vN; varying vec3 vV; varying float vY;
void main(){ float rim = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.0);
  float lines = 0.8 + 0.2 * step(0.5, fract(vY * 150.0 - time * 0.9));
  gl_FragColor = vec4(color * (0.5 + rim * 1.5) * lines, opacity * (0.45 + rim * 0.55));
  #include <colorspace_fragment>
}`,transparent:!0,depthWrite:!1})}let Te={group:new Ye,rings:[],beam:null,dots:null,scan:null,scanT0:-1,speed:[]};{let l=M=>new rn({color:on.teal,transparent:!0,opacity:M,blending:en,depthWrite:!1,side:Zn});for(let[M,f,A,G,F]of[[.985,1,.32,96,.25],[.7,.71,.24,96,-.4],[.4,.44,.14,6,.6]]){let Z=new he(u(new ps(M,f,G)),u(l(A)));Z.rotation.x=-Math.PI/2,Te.group.add(Z),Te.rings.push(Z),Te.speed.push(F)}Te.beam=new he(u(new di(.85,1,1,48,1,!0)),u(new xn({uniforms:{color:{value:new jt(on.teal)},strength:{value:.14}},vertexShader:"varying float vY; void main(){ vY = position.y + 0.5; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`uniform vec3 color; uniform float strength; varying float vY;
void main(){ float a = strength * pow(1.0 - vY, 2.2); gl_FragColor = vec4(color * a, a);
  #include <colorspace_fragment>
}`,transparent:!0,blending:en,depthWrite:!1,side:Zn}))),Te.beam.position.y=.5,Te.group.add(Te.beam);let p=70,x=new Float32Array(p*3);Te.rise=[];for(let M=0;M<p;M++){let f=Math.random()*Math.PI*2,A=Math.sqrt(Math.random())*.88;x.set([Math.cos(f)*A,Math.random(),Math.sin(f)*A],M*3),Te.rise.push(.05+Math.random()*.1)}Te.dots=new Ns(u(new Le().setAttribute("position",new ne(x,3))),u(new cs({color:on.teal,size:.006,transparent:!0,opacity:.75,blending:en,depthWrite:!1}))),Te.group.add(Te.dots),Te.scan=new he(u(new ps(.95,1,96)),u(l(0))),Te.scan.rotation.x=-Math.PI/2,Te.group.add(Te.scan),Te.group.visible=!1,Q.group.add(Te.group)}function Br(l,p){let x=Math.max(.24,Math.min(.7,l));Te.group.scale.set(x,.68,x),Te.group.position.set(0,-.34,0),Te.group.visible=!0,Te.scanT0=p&&!T?performance.now():-1,Te.scan.material.opacity=0}function bf(l,p){if(!Te.group.visible||T)return;Te.rings.forEach((M,f)=>{M.rotation.z+=l*Te.speed[f]});let x=Te.dots.geometry.attributes.position;for(let M=0;M<x.count;M++){let f=x.getY(M)+l*Te.rise[M];f>1&&(f-=1),x.setY(M,f)}if(x.needsUpdate=!0,Te.scanT0>=0){let M=(p-Te.scanT0)/1100;M>=1?(Te.scanT0=-1,Te.scan.material.opacity=0):(Te.scan.position.y=M,Te.scan.material.opacity=.9*Math.sin(Math.PI*M))}}function zr(){for(let l of Q.nodes){for(let p of[l.mat,l.glow.material,l.label.mesh.material])p.dispose();l.label.tex.dispose(),l.label.mesh.geometry.dispose(),l.ring?.geometry.dispose(),l.ring?.material.dispose(),l.shell?.material.dispose(),Jt(l.body),Jt(l.label.mesh)}for(let l of Q.links)l.line.geometry.dispose(),l.line.material.dispose(),l.pulse?.material.dispose();Q.building&&(Q.building.geometry.dispose(),Q.building.material.dispose()),Cf(),Lf(),Ff(),Q.stage.clear(),Q.nodes=[],Q.links=[],Q.building=null,Q.view=Jh(),Q.stage.rotation.set(0,0,0),Q.stage.scale.setScalar(1),Q.stage.position.set(0,0,0)}function Wa(){let l=ce-(_t.open?.9:0),p=1.35;Q.group.position.set(Kt.x-Math.sin(l)*p,Kt.y+.02,Kt.z-Math.cos(l)*p),K(Q.group)}function Xs(l){let{ctx:p,w:x,h:M}=Q.bar;On(p,x,M,48);let f=M/2,A=M*.6;Q.btns=[];let G=x-36,F=(nt,lt)=>{let wt=G-A/2;p.beginPath(),p.arc(wt,f,A/2,0,Math.PI*2),p.fillStyle="rgba(255,255,255,0.06)",p.fill(),p.lineWidth=3,p.strokeStyle="rgba(255,255,255,0.16)",p.stroke(),Ei(p,nt,wt,f,A*.62,ke,7),Q.btns.push({x0:G-A,x1:G,act:lt}),G-=A+18};F("close",()=>dc());let Z=Q.spec,H=Z?.steps?.length||0;Z&&H&&(Q.step<H-1&&F("next",()=>e.holoStep?.(1)),Q.step>0&&F("back",()=>e.holoStep?.(-1))),Ei(p,"holo",30+A/2,f,A*.7,Rn,6);let X=30+A+16;if(p.font=`600 38px ${He}`,p.font=`600 44px ${He}`,xe(p,Pn(p,l||Z?.title||"",G-X-190),X,f+15,44,ke,600,"left",He),Z&&H){let nt=Q.step<0?`${H} steps \xB7 say next`:`Step ${Q.step+1} of ${H}`;xe(p,nt,G-8,f+12,32,nn,500,"right")}Q.bar.update()}St(Q.bar.mesh,{tap:l=>{if(!l?.uv)return;let p=l.uv.x*Q.bar.w;Q.btns.find(x=>p>=x.x0&&p<=x.x1)?.act()},drag:()=>Q.group});function wf(l){zr(),Q.spec=null,Q.step=-1,Q.focus=null,Q.open||Wa(),Q.open=!0,Q.group.visible=!0;let p=new he(new ms(.16,.0025,8,96),new rn({color:on.teal,transparent:!0,opacity:.7,depthWrite:!1}));Q.stage.add(p),Q.building=p,Br(.3,!1),Xs("Building "+(l?"\u201C"+String(l).slice(0,48)+"\u201D":"a hologram")+"\u2026"),oi("holo")}function Tf(l,p,x,M){let f=on[l.color]??on.teal,A=new Ye,G=x==="chart"?new rn({color:f,transparent:!0,opacity:.82,depthWrite:!0}):Ws(f),F,Z;x==="chart"?(F=new he(Mf,G),Z=.04):(Z=x==="model"?.022+l.size*.016:x==="map"&&p===0?.055:.03,F=new he(yf,G),F.scale.setScalar(Z));let H=new Mi(new ui({map:Hs,color:f,transparent:!0,opacity:.5,blending:en,depthWrite:!1}));H.scale.setScalar(Z*(x==="chart"?3:5.5));let X=x==="steps"||x==="map"&&p===0,nt=x==="model",lt=Ke(nt?.15:X?.26:.24,nt?.05:X?.13:.085);{let{ctx:ee,w:de,h:Pe}=lt;On(ee,de,Pe,30,{fill0:"rgba(16,19,27,0.82)",fill1:"rgba(10,12,18,0.86)"});let tn=nt?-2:16,kt=nt?"":x==="timeline"&&l.when?l.when:x==="steps"?String(p+1):x==="chart"&&Number.isFinite(l.value)?String(l.value)+(M.unit?" "+M.unit:""):"";if(kt&&(xe(ee,kt,26,tn+=34,30,vf(l.color),700,"left",He),tn+=4),ee.font=`600 36px ${He}`,xe(ee,Pn(ee,l.label,de-52),26,tn+=40,36,ke,600,"left",He),l.note&&!nt){ee.font=`500 26px ${an}`;let le=a.wrapLines(l.note,de-52,Ve=>ee.measureText(Ve).width).slice(0,X?3:1);for(let Ve of le)xe(ee,Ve,26,tn+=34,26,nn,500)}lt.update()}lt.mesh.material.opacity=1,A.add(F,H,lt.mesh);let wt=null;x!=="chart"&&(wt=new Ds(Sf,new si({color:f,transparent:!0,opacity:.3,blending:en,depthWrite:!1})),wt.scale.setScalar(Z*1.45),wt.rotation.set(p*.7,p*1.3,0),A.add(wt));let dt={it:l,i:p,g:A,body:F,mat:G,glow:H,label:lt,shell:wt,r:Z,kind:x,base:new N,angle:0,speed:0,orbitR:0,parent:null,shown:0,emph:1},Yt=()=>e.ask?.(`Tell me more about ${l.label}`+(M.title?`, in ${M.title}`:"")+".");return St(F,{tap:Yt,hover:ee=>{dt.hot=ee},turn:()=>Q.stage}),St(lt.mesh,{tap:Yt,hover:ee=>{dt.hot=ee}}),dt}function Af(l,p){let x=p.length,M=(A,G)=>x>1?(A/(x-1)-.5)*G:0;if(l.kind==="model"){let A=p.filter(F=>F.it.orbit<0);A.forEach((F,Z)=>{F.base.set(A.length>1?(Z/(A.length-1)-.5)*Math.min(.95,.32*A.length):0,.02,0)});let G=new Map;for(let F of p)if(F.it.orbit>=0){let Z=p[F.it.orbit],H=G.get(Z)||0;G.set(Z,H+1),F.parent=Z,F.orbitR=Z.r+F.r+.07+H*.075,F.angle=H*2.1+.6,F.speed=.45/(1+H*.55);let X=[];for(let nt=0;nt<=64;nt++){let lt=nt/64*Math.PI*2;X.push(Math.cos(lt)*F.orbitR,Math.sin(lt)*F.orbitR*.22,Math.sin(lt)*F.orbitR*.85)}F.ring=new Ni(new Le().setAttribute("position",new ne(X,3)),new si({color:on[Z.it.color]??on.teal,transparent:!0,opacity:.28,depthWrite:!1})),Q.stage.add(F.ring)}for(let F of p)F.label.mesh.position.set(0,-(F.r+.06),.01)}else if(l.kind==="map"){p[0].base.set(0,.02,0),p[0].label.mesh.position.set(0,-.14,.01);let A=p.slice(1);A.forEach((G,F)=>{let Z=-Math.PI/2+(F+.5)/A.length*Math.PI*2;G.base.set(Math.cos(Z)*.46,Math.sin(Z)*.27+.02,.03+F%2*.05),G.label.mesh.position.set(0,-.075,.01)})}else if(l.kind==="steps")p.forEach((A,G)=>{let F=M(G,Math.min(1.1,.28*x));A.base.set(F,.13,.16*(1-(F/.6)**2)),A.label.mesh.position.set(0,-.12,.01)});else if(l.kind==="timeline"){p.forEach((F,Z)=>{F.base.set(M(Z,Math.min(1.15,.27*x)),0,0),F.label.mesh.position.set(0,Z%2?-.1:.1,.01)});let A=[-.62,0,0,.62,0,0],G=new Ni(new Le().setAttribute("position",new ne(A,3)),new si({color:on.white,transparent:!0,opacity:.35,depthWrite:!1}));Q.stage.add(G),Q.links.push({line:G,a:null,b:null})}else if(l.kind==="chart"){let A=Math.max(...p.map(H=>Math.abs(H.it.value)||0),1e-9),G=p.some(H=>H.it.value<0),F=G?-.02:-.26,Z=G?.24:.46;p.forEach((H,X)=>{let nt=Number.isFinite(H.it.value)?H.it.value:0,lt=Math.max(.01,Z*Math.abs(nt)/A),wt=nt<0;H.body.scale.set(.075,lt,.075),H.base.set(M(X,Math.min(1.05,.22*x)),F+(wt?-lt/2:lt/2),0),H.glow.position.set(0,wt?-lt/2:lt/2,0),H.label.mesh.position.set(0,wt?lt/2+.06:-lt/2-.06,.05)})}let f=[];for(let A of p)for(let G of A.it.link)p[G]&&G!==A.i&&f.push([A,p[G]]);if(l.kind==="map"&&!f.length)for(let A of p.slice(1))f.push([p[0],A]);if(l.kind==="steps")for(let A=1;A<x;A++)f.push([p[A-1],p[A]]);for(let[A,G]of f){let F=new Ni(new Le().setAttribute("position",new ne([0,0,0,0,0,0],3)),new si({color:on.teal,transparent:!0,opacity:0,depthWrite:!1}));Q.stage.add(F);let Z=new Mi(new ui({map:Hs,color:on[G.it.color]??on.teal,transparent:!0,opacity:0,blending:en,depthWrite:!1}));Z.scale.setScalar(.05),Q.stage.add(Z),Q.links.push({line:F,a:A,b:G,pulse:Z,off:Q.links.length*.37})}}function Ef(l){if(zr(),kr(),Q.spec=l,Q.step=-1,Q.focus=null,Q.t0=performance.now(),Q.open||Wa(),Q.open=!0,Q.group.visible=!0,l.kind==="sketch"){Br(Rf(l)+.06,!0),Xs(),oi("holo");return}Q.nodes=l.items.map((x,M)=>Tf(x,M,l.kind,l));for(let x of Q.nodes)Q.stage.add(x.g);Af(l,Q.nodes);for(let x of Q.nodes)x.g.position.copy(x.base),x.g.scale.setScalar(T?1:.001);let p=Math.max(.2,...Q.nodes.map(x=>Math.abs(x.base.x)+x.r+(x.parent?x.orbitR+Math.abs(x.parent.base.x):0)));Q.reach=p,Br(p+.06,!0),Xs(),oi("holo")}let sn=.32,Gn={parts:[],made:[],turnables:[]};function Cf(){for(let l of Gn.made)try{l.dispose()}catch{}for(let l of Gn.turnables)Jt(l);Gn.parts=[],Gn.made=[],Gn.turnables=[]}function Rf(l){let p=A=>(Gn.made.push(A),A),x=A=>new N(A[0]*sn,A[1]*sn+.04,A[2]*sn),M=(A,G)=>{G==="x"?A.rotation.z=-Math.PI/2:G==="z"&&(A.rotation.x=Math.PI/2)},f=.2;return l.shapes.forEach((A,G)=>{let F=on[A.color]??on.teal,Z=new Ye,H=p(new rn({color:F,transparent:!0,opacity:.95,blending:en,depthWrite:!1})),X=null,nt=null,lt=null,wt=(kt,le=!1)=>{let Ve=p(new pa(kt,96,.0045,6,le));nt=new he(Ve,H),Z.add(nt),X=kt},dt=x(A.center),Yt=(kt,le,Ve,Se=48)=>{let un=[];for(let Ie=0;Ie<Se;Ie++){let pi=Ie/Se*Math.PI*2,Xn=Math.cos(pi)*le,qn=Math.sin(pi)*le;un.push(Ve==="y"?new N(kt.x+Xn,kt.y,kt.z+qn):Ve==="x"?new N(kt.x,kt.y+Xn,kt.z+qn):new N(kt.x+Xn,kt.y+qn,kt.z))}return new ds(un,!0)};if(A.type==="line"||A.type==="arrow"){let kt=new da;for(let le=1;le<A.points.length;le++)kt.add(new br(x(A.points[le-1]),x(A.points[le])));if(wt(kt),A.type==="arrow"){let le=x(A.points[A.points.length-1]),Ve=x(A.points[A.points.length-2]),Se=new he(p(new us(.016,.04,10)),H);Se.position.copy(le),Se.quaternion.setFromUnitVectors(new N(0,1,0),le.clone().sub(Ve).normalize()),Z.add(Se)}}else if(A.type==="curve")wt(new ds(A.points.map(x)));else if(A.type==="circle")wt(Yt(dt,A.radius*sn,A.axis),!0);else if(A.type==="spiral"||A.type==="wave"){let kt=[];for(let Ve=0;Ve<=120;Ve++){let Se=Ve/120;if(A.type==="spiral"){let un=Se*A.turns*Math.PI*2,Ie=(Se-.5)*A.height*sn,pi=Math.cos(un)*A.radius*sn,Xn=Math.sin(un)*A.radius*sn;kt.push(A.axis==="x"?new N(dt.x+Ie,dt.y+pi,dt.z+Xn):A.axis==="z"?new N(dt.x+pi,dt.y+Xn,dt.z+Ie):new N(dt.x+pi,dt.y+Ie,dt.z+Xn))}else{let un=(Se-.5)*2*A.radius*sn*2,Ie=Math.sin(Se*Math.PI*2*A.turns)*A.height*sn*.25;kt.push(new N(dt.x+un,dt.y+Ie,dt.z))}}wt(new ds(kt))}else{let kt;A.type==="sphere"?kt=new Un(A.radius*sn,20,14):A.type==="cone"?kt=new us(A.radius*sn,A.height*sn,20,1,!0):A.type==="cylinder"?kt=new di(A.radius*sn,A.radius*sn,A.height*sn,20,1,!0):kt=new Si(A.size[0]*sn,A.size[1]*sn,A.size[2]*sn),p(kt);let le=new he(kt,p(Ws(F)));le.material.uniforms.opacity.value=.35;let Ve=new Ds(p(new wr(kt)),p(new si({color:F,transparent:!0,opacity:.55,blending:en,depthWrite:!1}))),Se=new Ye;Se.add(le,Ve),lt={body:le.material,wire:Ve.material},M(Se,A.axis),Se.position.copy(dt),Z.add(Se),A.flow&&(X=Yt(dt,(A.type==="box"?Math.max(A.size[0],A.size[2])/2:A.radius)*sn*1.08,A.axis==="y"?"y":A.axis==="x"?"x":"z"))}let ee=[];if(A.flow&&X)for(let kt=0;kt<6;kt++){let le=new Mi(p(new ui({map:Hs,color:F,transparent:!0,opacity:0,blending:en,depthWrite:!1})));le.scale.setScalar(.04),Z.add(le),ee.push({sp:le,off:kt/6})}let de=null;if(A.label){de=Ke(.16,.045),p(de.tex),p(de.mesh.geometry),p(de.mesh.material);let{ctx:kt,w:le,h:Ve}=de;On(kt,le,Ve,26,{fill0:"rgba(16,19,27,0.82)",fill1:"rgba(10,12,18,0.86)"}),kt.font=`600 34px ${He}`,xe(kt,Pn(kt,A.label,le-40),20,Ve/2+12,34,ke,600,"left",He),de.update();let Se=X&&(A.type==="line"||A.type==="curve"||A.type==="arrow"||A.type==="spiral"||A.type==="wave")?X.getPointAt(.55,new N):dt.clone().add(new N((A.type==="box"?A.size[0]/2:A.radius)*sn*.7,0,0)),un=G%2?-1:1;de.mesh.position.set(Se.x+un*.1,Se.y,Se.z+.03),Z.add(de.mesh),St(de.mesh,{tap:()=>e.ask?.(`Tell me more about the ${A.label}`+(l.title?`, in ${l.title}`:"")+".")})}Z.visible=T,Q.stage.add(Z);let Pe=nt?nt.geometry.index.count:0;nt&&!T&&nt.geometry.setDrawRange(0,0),Gn.parts.push({s:A,i:G,g:Z,tube:nt,count:Pe,path:X,flows:ee,label:de,lineMat:H,solid:lt,emph:1});for(let kt of[nt,lt&&Z.children.find(le=>le.isGroup)?.children[0]])kt&&(St(kt,{turn:()=>Q.stage}),Gn.turnables.push(kt));let tn=A.points.length?A.points:[A.center];for(let kt of tn)f=Math.max(f,Math.abs(kt[0]*sn)+(A.type==="line"||A.type==="curve"||A.type==="arrow"?0:A.radius*sn))}),f}let jh=new N;function Pf(l,p){let x=p-Q.t0,M=Gn.parts.length;Gn.parts.forEach(f=>{let A=T?1:Math.max(0,Math.min(1,(x-250-f.i*(1600/Math.max(1,M)))/700));A>0&&(f.g.visible=!0),f.tube&&f.count&&f.tube.geometry.setDrawRange(0,Math.floor(f.count*A/3)*3),f.tube||f.g.scale.setScalar(Math.max(.001,1-(1-A)**3));let G=Q.focus?Q.focus.has(f.i)?1.15:.25:1;f.emph+=(G-f.emph)*Math.min(1,l*6);let F=f.s.pulse&&!T?.75+.25*Math.sin(p/380+f.i):1;if(f.lineMat.opacity=.95*Math.min(1,f.emph)*F,f.solid&&(f.solid.body.uniforms.opacity.value=.35*Math.min(1,f.emph)*F,f.solid.wire.opacity=.55*Math.min(1,f.emph)*F),f.label&&(f.label.mesh.material.opacity=Math.max(.3,Math.min(1,f.emph))),f.s.spin&&!T&&(f.g.rotation.y+=l*.35),f.path&&f.flows.length)for(let Z of f.flows){let H=T?Z.off:(p/2400+Z.off)%1;f.path.getPointAt(H,jh),Z.sp.position.copy(jh),Z.sp.material.opacity=A>=1?.9*Math.min(1,f.emph)*(T?.6:Math.sin(Math.PI*H)*.6+.4):0}})}let Ci={card:null};function kr(){Ci.card&&(Jt(Ci.card.mesh),Q.group.remove(Ci.card.mesh),Ci.card.tex.dispose(),Ci.card.mesh.geometry.dispose(),Ci.card.mesh.material.dispose(),Ci.card=null)}async function If({url:l,title:p,note:x}){if(!Q.open)return;let M=new Image;M.crossOrigin="anonymous",M.src=l;try{await M.decode()}catch{return}if(!Q.open)return;kr();let f=Ke(.34,.3,1024),{ctx:A,w:G,h:F}=f;On(A,G,F,36);let Z=G-40,H=F-150,X=M.width/M.height,nt=Z/H,lt=X>nt?M.height*nt:M.width,wt=X>nt?M.height:M.width/nt;A.save(),Jn(A,20,20,Z,H,22),A.clip(),A.drawImage(M,(M.width-lt)/2,(M.height-wt)/2,lt,wt,20,20,Z,H),A.restore(),A.font=`600 40px ${He}`,xe(A,Pn(A,p,G-60),30,F-82,40,ke,600,"left",He),A.font=`500 26px ${an}`,xe(A,Pn(A,(x?x+" \xB7 ":"")+"Photo: Wikipedia",G-60),30,F-36,26,nn,500),f.update(),f.mesh.position.set(Math.max(.62,(Q.reach||.4)+.26),.06,.04),f.mesh.rotation.y=-.35,Q.group.add(f.mesh),Ci.card=f,St(f.mesh,{tap:()=>e.ask?.(`Tell me more about ${p}.`),drag:()=>Q.group})}let hn={mesh:null,mark:null,made:[],credit:null};function Lf(){for(let l of hn.made)try{l.dispose()}catch{}hn.credit&&Jt(hn.credit.mesh),hn.turnable&&Jt(hn.turnable),Object.assign(hn,{mesh:null,mark:null,made:[],credit:null,turnable:null})}function Df({title:l,map:p,rings:x,glow:M}){zr(),kr(),Q.spec={title:l,kind:"globe",steps:[],items:[]},Q.step=-1,Q.focus=null,Q.t0=performance.now(),Q.open||Wa(),Q.open=!0,Q.group.visible=!0;let f=X=>(hn.made.push(X),X),A=f(new ga().setCrossOrigin("anonymous").load(p));A.colorSpace=gn,A.anisotropy=4;let G=.2,F=new he(f(new Un(G,64,40)),f(new rn({map:A})));F.position.set(0,.12,0),F.rotation.x=.41,Q.stage.add(F);let Z=new Mi(f(new ui({map:Hs,color:M?16757575:10475775,transparent:!0,opacity:M?.9:.35,blending:en,depthWrite:!1})));if(Z.scale.setScalar(G*(M?4.2:2.7)),Z.position.copy(F.position),Q.stage.add(Z),x){let X=new he(f(new ps(G*1.25,G*2.1,96)),f(new rn({color:14272416,transparent:!0,opacity:.55,side:Zn,depthWrite:!1})));X.rotation.x=-Math.PI/2+.45,X.position.copy(F.position),Q.stage.add(X)}let H=Ke(.26,.04);f(H.tex),f(H.mesh.geometry),f(H.mesh.material);{let{ctx:X,w:nt,h:lt}=H;On(X,nt,lt,22,{fill0:"rgba(16,19,27,0.7)",fill1:"rgba(10,12,18,0.75)"}),xe(X,"Map: Solar System Scope \xB7 CC BY 4.0",20,lt/2+9,26,nn,500),H.update()}H.mesh.position.set(0,-.15,.05),Q.stage.add(H.mesh),hn.mesh=F,hn.credit=H,St(F,{turn:()=>Q.stage,tap:()=>e.ask?.("Tell me something amazing about "+l+".")}),hn.turnable=F,Q.reach=G*(x?2.1:1.3),Br(Q.reach+.06,!0),Xs(),oi("holo")}function Nf(l,p){if(!hn.mesh)return;let x=.2*1.01,M=(Number(p)+180)/360*Math.PI*2,f=(90-Number(l))/180*Math.PI;if(!hn.mark){let A=new Mi(new ui({map:Hs,color:16734810,transparent:!0,opacity:1,blending:en,depthWrite:!1}));hn.made.push(A.material),A.scale.setScalar(.08),hn.mesh.add(A),hn.mark=A}hn.mark.position.set(-x*Math.cos(M)*Math.sin(f),x*Math.cos(f),x*Math.sin(M)*Math.sin(f))}function Uf(l,p){hn.mesh&&(T||(hn.mesh.rotation.y+=l*.12),hn.mark&&!T&&hn.mark.scale.setScalar(.07+.03*Math.abs(Math.sin(p/300))))}let Hn=-.22,Qi=.36,Wn=.34,je={spec:null,made:[],st:null,card:null,readAt:0,parts:null};function Ff(){for(let l of je.made)try{l.dispose()}catch{}je.card&&Jt(je.card.mesh),Object.assign(je,{spec:null,made:[],st:null,card:null,readAt:0,parts:null})}let mn=l=>(je.made.push(l),l);function ts(l,p){let x=new Ye,M=new he(mn(new Un(p,20,14)),mn(Ws(l)));M.material.uniforms.opacity.value=.95;let f=new Mi(mn(new ui({map:Hs,color:l,transparent:!0,opacity:.8,blending:en,depthWrite:!1})));return f.scale.setScalar(p*5),x.add(M,f),x}function li(l,p,x=.9){let M=mn(new Le().setAttribute("position",new ne(new Float32Array(l*3),3))),f=M.attributes.position.array;M.setDrawRange(0,0);let A=new Ni(M,mn(new si({color:p,transparent:!0,opacity:x,blending:en,depthWrite:!1})));return A.frustumCulled=!1,{line:A,pos:f,geo:M,n:l,used:0,set(G,F,Z,H=0){f[G*3]=F,f[G*3+1]=Z,f[G*3+2]=H},draw(G){this.used=G,M.setDrawRange(0,G),M.attributes.position.needsUpdate=!0},push(G,F,Z=0){this.used>=l&&(f.copyWithin(0,3),this.used=l-1),this.set(this.used,G,F,Z),this.draw(this.used+1)},clear(){this.draw(0)}}}function Xa(l){let p=li(2,on.white,.35);if(p.set(0,-Wn,Hn),p.set(1,Wn,Hn),p.draw(2),Q.stage.add(p.line),!l)return;let x=Ke(.16,.036);mn(x.tex),mn(x.mesh.geometry),mn(x.mesh.material),xe(x.ctx,l,x.w-8,x.h/2+10,30,nn,500,"right"),x.update(),x.mesh.position.set(Wn-.08,Hn-.025,.01),Q.stage.add(x.mesh)}let Qe=(l,p)=>Number.isFinite(l)?(Math.abs(l)>=100?Math.round(l):Math.abs(l)>=10?l.toFixed(1):l.toFixed(2))+(p?" "+p:""):"\u2014";function Qh(l){let p=je.card;if(!p)return;let{ctx:x,w:M,h:f}=p;On(x,M,f,30,{fill0:"rgba(16,19,27,0.86)",fill1:"rgba(10,12,18,0.9)"}),xe(x,Pn(x,l[0],M-60),30,58,40,Rn,600,"left",He),x.font=`500 34px ${an}`,xe(x,Pn(x,l[1]||"",M-60),30,112,34,ke,500),p.update()}function Of(l,p){zr(),kr(),Q.spec={title:l.title,kind:"sim",steps:[],items:[]},Q.step=-1,Q.focus=null,Q.t0=performance.now(),Q.open||Wa(),Q.open=!0,Q.group.visible=!0,je.spec=l;let x=Ke(.6,.06);mn(x.tex),mn(x.mesh.geometry),mn(x.mesh.material),x.mesh.position.set(0,Hn-.085,.04),Q.stage.add(x.mesh),je.card=x,St(x.mesh,{tap:()=>e.ask?.("Explain why the "+l.type+" moves like that, simply.")});let M=l.g,f=on.teal,A=on.amber,G=on.sky,F=on.white,Z={};if(l.type==="pendulum"){let H=new N(0,Qi,0),X=Qi-Hn-.08,nt=new he(mn(new di(.0032,.0032,1,8)),mn(new rn({color:F,transparent:!0,opacity:.85,blending:en,depthWrite:!1}))),lt=li(90,f,.55),wt=li(49,F,.18),dt=l.angle*Math.PI/180;for(let de=0;de<=48;de++){let Pe=-dt+2*dt*de/48;wt.set(de,Math.sin(Pe)*X,Qi-Math.cos(Pe)*X)}wt.draw(49);let Yt=ts(f,.026),ee=ts(F,.008);ee.position.copy(H),Q.stage.add(nt,lt.line,wt.line,Yt,ee),Object.assign(Z,{pivot:H,Ld:X,bar:nt,trail:lt,bob:Yt}),je.st={th:dt,w:0,t:0,lastCross:-1,period:NaN,dir:0},Xa("")}else if(l.type==="projectile"){let H=l.angle*Math.PI/180,X=l.speed,nt=M>0?X*X*Math.sin(2*H)/M:X*3,lt=M>0?X*X*Math.sin(H)**2/(2*M):X*3*Math.sin(H),wt=0,dt=0;if(p?.type==="projectile"&&p.g>0){let Se=p.angle*Math.PI/180;wt=p.speed**2*Math.sin(2*Se)/p.g,dt=p.speed**2*Math.sin(Se)**2/(2*p.g)}let Yt=Math.min((2*Wn-.04)/Math.max(nt,wt,.5),(Qi-Hn-.04)/Math.max(lt,dt,.25)),ee=-Wn+.02,de=(Se,un,Ie)=>{let pi=Se.g>0?2*Se.speed*Math.sin(Se.angle*Math.PI/180)/Se.g:3;for(let Xn=0;Xn<Ie;Xn++){let qn=pi*Xn/(Ie-1),Zs=Se.angle*Math.PI/180;un.set(Xn,ee+Se.speed*Math.cos(Zs)*qn*Yt,Hn+(Se.speed*Math.sin(Zs)*qn-Se.g*qn*qn/2)*Yt)}un.draw(Ie)},Pe=li(64,F,.16);if(de(l,Pe,64),Q.stage.add(Pe.line),wt){let Se=li(64,G,.28);de(p,Se,64),Q.stage.add(Se.line)}let tn=ts(A,.016),kt=li(200,A,.85),le=li(2,f,.9),Ve=ts(f,.009);Ve.visible=!1,Q.stage.add(tn,kt.line,le.line,Ve),Object.assign(Z,{scale:Yt,x0:ee,th:H,v:X,ball:tn,trail:kt,arrow:le,mark:Ve,R:nt}),je.st={t:0,rest:0},Xa(Qe(2*Wn/Yt,"m"))}else if(l.type==="drop"){let H=(Qi-Hn-.04)/l.length,X=Hn+l.length*H,nt=ts(A,.02);nt.position.set(l.feather?-.09:0,X,0),Q.stage.add(nt);let lt=null;if(l.feather){lt=new Ye;let dt=new he(mn(new Un(1,16,10)),mn(Ws(F)));dt.scale.set(.011,.034,.004),lt.add(dt),lt.position.set(.09,X,0),Q.stage.add(lt)}let wt=li(2,F,.25);wt.set(0,-Wn+.03,Hn),wt.set(1,-Wn+.03,X),wt.draw(2),Q.stage.add(wt.line),Object.assign(Z,{scale:H,top:X,hammer:nt,feather:lt}),je.st={t:0,y:l.length,v:0,fy:l.length,fv:0,landed:-1,fLanded:-1,rest:0},Xa(Qe(l.length,"m")+" drop")}else if(l.type==="orbit"){let H=new he(mn(new Un(.05,32,20)),mn(Ws(G)));H.position.set(0,.07,0);let X=.13,nt=6,lt=2*Math.PI*X/nt,wt=lt*lt*X,dt=ts(F,.014),Yt=li(420,f,.6);Q.stage.add(H,dt,Yt.line),Object.assign(Z,{planet:H,moon:dt,trail:Yt,GM:wt,r0:X}),je.st={x:X,y:0,vx:0,vy:lt*l.rate,t:0,rest:0}}else if(l.type==="spring"){let H=Qi,X=.06,nt=li(160,f,.85),lt=li(2,F,.6);lt.set(0,-.06,H),lt.set(1,.06,H),lt.draw(2);let wt=new he(mn(new Si(.06,.05,.06)),mn(Ws(A)));Q.stage.add(nt.line,lt.line,wt);let dt=20,Yt=Math.sqrt(dt/l.mass);Object.assign(Z,{top:H,rest:X,coil:nt,box:wt,omega:Yt}),je.st={t:0},Xa("")}else if(l.type==="wave"){let X=li(96,f,.9),nt=[];for(let wt=0;wt<16;wt++){let dt=ts(wt===7?A:F,wt===7?.011:.006);nt.push(dt),Q.stage.add(dt)}let lt=ts(f,.012);Q.stage.add(X.line,lt),Object.assign(Z,{n:96,line:X,beads:nt,crest:lt,perM:2*Wn/2}),je.st={t:0}}je.parts=Z,Q.reach=Wn,Br(Wn+.06,!0),Xs(),oi("holo"),Qh([l.title,"\u2026"])}function Bf(l,p){let x=je.spec,M=je.parts,f=je.st;if(!x||!M||!f)return;l=Math.min(l,.05);let A=x.g,G=null;if(x.type==="pendulum"){let F=x.length;for(let X=0;X<4;X++){let nt=l/4,lt=f.th;f.w+=-(A/F)*Math.sin(f.th)*nt,f.th+=f.w*nt,f.t+=nt,lt<0&&f.th>=0&&(f.lastCross>=0&&(f.period=f.t-f.lastCross),f.lastCross=f.t)}let Z=Math.sin(f.th)*M.Ld,H=Qi-Math.cos(f.th)*M.Ld;M.bob.position.set(Z,H,0),M.bar.position.set(Z/2,(Qi+H)/2,0),M.bar.scale.set(1,M.Ld,1),M.bar.rotation.z=f.th,M.trail.push(Z,H),M.trail.used>40&&(M.trail.pos.copyWithin(0,3),M.trail.draw(40)),G=()=>[A>0?"T = 2\u03C0\u221A(L/g) \u2248 "+Qe(2*Math.PI*Math.sqrt(F/A),"s"):"No gravity: no swing","angle "+Math.round(f.th*180/Math.PI)+"\xB0   speed "+Qe(Math.abs(f.w)*F,"m/s")+"   measured swing "+(Number.isFinite(f.period)?Qe(f.period,"s"):"\u2026")]}else if(x.type==="projectile"){if(f.rest>0)f.rest-=l,f.rest<=0&&(f.t=0,M.trail.clear(),M.mark.visible=!1);else{f.t+=l;let F=M.v*Math.cos(M.th)*f.t,Z=M.v*Math.sin(M.th)*f.t-A*f.t*f.t/2,H=A>0?2*M.v*Math.sin(M.th)/A:3;f.t>=H&&(f.t=H,F=M.v*Math.cos(M.th)*H,Z=A>0?0:Z,f.rest=1.6,M.mark.visible=A>0,M.mark.position.set(M.x0+F*M.scale,Hn,0)),M.ball.position.set(M.x0+F*M.scale,Hn+Math.max(0,Z)*M.scale,0),M.trail.push(M.ball.position.x,M.ball.position.y);let X=M.v*Math.cos(M.th),nt=M.v*Math.sin(M.th)-A*f.t,lt=.06/Math.max(1,M.v);M.arrow.set(0,M.ball.position.x,M.ball.position.y),M.arrow.set(1,M.ball.position.x+X*lt,M.ball.position.y+nt*lt),M.arrow.draw(2),f.x=F,f.y=Math.max(0,Z),f.sp=Math.hypot(X,nt)}G=()=>["range = v\xB2\xB7sin 2\u03B8 / g = "+Qe(M.R,"m"),"time "+Qe(f.t,"s")+"   height "+Qe(f.y??0,"m")+"   distance "+Qe(f.x??0,"m")+"   speed "+Qe(f.sp??x.speed,"m/s")]}else if(x.type==="drop")f.rest>0?(f.rest-=l,f.rest<=0&&Object.assign(f,{t:0,y:x.length,v:0,fy:x.length,fv:0,landed:-1,fLanded:-1})):A>0&&(f.t+=l,f.landed<0&&(f.v+=A*l,f.y-=f.v*l,f.y<=0&&(f.y=0,f.landed=f.t)),M.feather&&f.fLanded<0&&(f.fv+=(x.air?A*(1-f.fv*f.fv/(.5*.5)):A)*l,f.fy-=f.fv*l,f.fy<=0&&(f.fy=0,f.fLanded=f.t)),f.landed>=0&&(!M.feather||f.fLanded>=0||f.t-f.landed>6)&&(f.rest=2)),M.hammer.position.y=Hn+f.y*M.scale+.02,M.feather&&(M.feather.position.y=Hn+f.fy*M.scale+.02,M.feather.position.x=.09+(x.air&&f.fLanded<0?Math.sin(f.t*3)*.02:0),M.feather.rotation.z=x.air&&f.fLanded<0?Math.sin(f.t*3)*.5:0),G=()=>[A>0?"t = \u221A(2h/g) = "+Qe(Math.sqrt(2*x.length/A),"s"):"No gravity: nothing falls","time "+Qe(f.landed>=0?f.landed:f.t,"s")+"   fallen "+Qe(x.length-f.y,"m")+"   speed "+Qe(f.landed>=0?Math.sqrt(2*A*x.length):f.v,"m/s")+(M.feather?"   feather "+(f.fLanded>=0?"landed at "+Qe(f.fLanded,"s"):Qe(x.length-f.fy,"m")+" down"):"")];else if(x.type==="orbit"){if(f.rest>0)f.rest-=l,f.rest<=0&&(Object.assign(f,{x:M.r0,y:0,vx:0,vy:Math.sqrt(M.GM/M.r0)*x.rate,t:0}),M.trail.clear(),M.moon.visible=!0);else{for(let Z=0;Z<8;Z++){let H=l/8,X=Math.hypot(f.x,f.y),nt=-M.GM/(X*X*X);f.vx+=.5*nt*f.x*H,f.vy+=.5*nt*f.y*H,f.x+=f.vx*H,f.y+=f.vy*H;let lt=Math.hypot(f.x,f.y),wt=-M.GM/(lt*lt*lt);f.vx+=.5*wt*f.x*H,f.vy+=.5*wt*f.y*H}f.t+=l;let F=Math.hypot(f.x,f.y);(F<.055||F>.9)&&(f.rest=1.2,M.moon.visible=!1),M.moon.position.set(f.x,.07+f.y,0),M.trail.push(f.x,.07+f.y)}G=()=>{let F=Math.hypot(f.x,f.y),Z=Math.hypot(f.vx,f.vy),H=Math.sqrt(2*M.GM/Math.max(F,.001));return["gravity pulls in \xB7 speed carries it round","speed "+Qe(x.rate,"\xD7")+" a circle's   "+(Z>=H?"escaping":x.rate>1.02||x.rate<.98?"an ellipse":"a circle")+"   distance "+Qe(F/M.r0,"\xD7")]}}else if(x.type==="spring"){f.t+=l;let F=.07,Z=M.top-.2,H=Z+F*Math.cos(M.omega*f.t);M.box.position.set(0,H-.025,0);let X=M.coil.n,nt=12;for(let lt=0;lt<X;lt++){let wt=lt/(X-1),dt=wt*nt*Math.PI*2,Yt=M.top+(H-M.top)*wt,ee=wt<.04||wt>.96?0:1;M.coil.set(lt,Math.cos(dt)*.025*ee,Yt,Math.sin(dt)*.025*ee)}M.coil.draw(X),G=()=>["T = 2\u03C0\u221A(m/k) = "+Qe(2*Math.PI/M.omega,"s"),"mass "+Qe(x.mass,"kg")+"   spring 20 N/m   speed "+Qe(Math.abs(F*M.omega*Math.sin(M.omega*f.t))*1,"m/s")+"   gravity doesn't change the pace"]}else if(x.type==="wave"){f.t+=l;let F=x.rate,Z=1/F,H=2*Math.PI/Z,X=2*Math.PI*F,nt=.06,lt=.07;for(let dt=0;dt<M.n;dt++){let Yt=dt/(M.n-1)*2;M.line.set(dt,-Wn+Yt*M.perM,lt+nt*Math.sin(H*Yt-X*f.t))}M.line.draw(M.n),M.beads.forEach((dt,Yt)=>{let ee=Yt/15*2;dt.position.set(-Wn+ee*M.perM,lt+nt*Math.sin(H*ee-X*f.t),0)});let wt=((X*f.t/H+Z/4)%2+2)%2;M.crest.position.set(-Wn+wt*M.perM,lt+nt+.02,0),G=()=>["speed = frequency \xD7 wavelength = 1 m/s","frequency "+Qe(F,"Hz")+"   wavelength "+Qe(Z,"m")+"   the gold bead only moves up and down"]}G&&p-je.readAt>160&&(je.readAt=p,Qh(G()))}function tu(l){return{obj:l,yaw0:l.rotation.y,vel:0,lastYaw:l.rotation.y,lastT:performance.now()}}let eu=new N;function zf(l,p,x){let M=l.turn;eu.set(1,0,0).applyQuaternion(Q.group.quaternion);let f=M.yaw0+p.clone().sub(l.start).dot(eu)*7,A=Math.max(1,x-M.lastT)/1e3;M.vel=M.vel*.6+(f-M.lastYaw)/A*.4,M.lastYaw=f,M.lastT=x,M.obj.rotation.y=f,Q.view.spin=0,Q.view.turnT=null}function kf(l){let p=Q.view,x=Q.stage;if(p.size+=(p.sizeT-p.size)*Math.min(1,l*5),x.scale.setScalar(p.size),x.position.y=(p.size-1)*.12,p.spin+=(p.spinT-p.spin)*Math.min(1,l*1.2),Math.abs(p.spin)>.001&&(x.rotation.y+=l*p.spin),p.turnT!=null){let M=p.turnT-x.rotation.y;x.rotation.y+=M*Math.min(1,l*3.5),Math.abs(M)<.003&&(x.rotation.y=p.turnT,p.turnT=null)}p.ex+=(p.exT-p.ex)*Math.min(1,l*(T?20:3)),Ci.card&&(Ci.card.mesh.position.x=Math.max(.62,((Q.reach||.4)+p.ex*.2)*p.size+.26))}function Vf(){let l=(M,f)=>{let A=M.clone();return A.length()<.02&&A.set(Math.cos(f*2.4),.35,Math.sin(f*2.4)),A.normalize().add(new N(0,.3*Math.sin(f*2.4+1),.55*Math.cos(f*2.4))),A.y=Math.max(-.2,A.y),A.normalize()};if(Q.spec?.kind==="sketch"){if(Gn.parts.length<2)return!1;let M=new N,f=Gn.parts.map(A=>new N(...A.s.points.length?A.s.points.reduce((G,F)=>[G[0]+F[0]/A.s.points.length,G[1]+F[1]/A.s.points.length,G[2]+F[2]/A.s.points.length],[0,0,0]):A.s.center));return f.forEach(A=>M.add(A)),M.multiplyScalar(1/f.length),Gn.parts.forEach((A,G)=>{A.exDir=l(f[G].sub(M),G)}),!0}let p=Q.nodes.filter(M=>!M.parent);if(p.length<2||!["model","map"].includes(Q.spec?.kind))return!1;let x=new N;return p.forEach(M=>x.add(M.base)),x.multiplyScalar(1/p.length),p.forEach(M=>{M.exDir=l(M.base.clone().sub(x),M.i)}),!0}function Gf(l){if(!Q.open||!Q.spec)return"";let p=Q.view;return l==="spin"?(p.spinT=.7,p.turnT=null,"spin"):l==="still"?(p.spinT=0,p.spin=0,"still"):l==="around"?(p.spinT=0,p.spin=0,p.turnT=Q.stage.rotation.y+Math.PI,"around"):l==="bigger"?(p.sizeT=Math.min(2.4,p.sizeT*1.4),p.sizeT>=2.4?"biggest":"bigger"):l==="smaller"?(p.sizeT=Math.max(.45,p.sizeT/1.4),p.sizeT<=.45?"smallest":"smaller"):l==="apart"?Vf()?(p.exT=1,"apart"):"no-parts":l==="together"?(p.exT=0,"together"):""}function Hf(l,p){Q.step=p??Q.step,Q.focus=Array.isArray(l)&&l.length?new Set(l):null,Xs()}function dc(){zr(),kr(),Te.group.visible=!1,Q.open=!1,Q.spec=null,Q.group.visible=!1,e.holoClosed?.(),y.userData.placed==="holo"&&(_t.open?(y.userData.placed=!1,oi("pc")):Ys())}let Bn={group:null,sky:null,parts:null,dots:null,kind:"none",made:[],t0:0,spec:null};function fc(){if(!Bn.group)return!1;h.remove(Bn.group);for(let l of Bn.made)try{l.dispose()}catch{}return Object.assign(Bn,{group:null,sky:null,parts:null,dots:null,made:[],spec:null}),!0}function Wf(l){fc();let p=dt=>(Bn.made.push(dt),dt),x=dt=>new jt(dt),M=new Ye;M.position.set(Kt.x,ut,Kt.z),M.rotation.y=ce;let f=new he(p(new Un(36,48,24)),p(new xn({side:bn,transparent:!0,depthWrite:!0,uniforms:{top:{value:x(l.sky.top)},mid:{value:x(l.sky.horizon)},low:{value:x(l.sky.bottom)},fade:{value:T?1:0}},vertexShader:"varying vec3 vW; void main(){ vW = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`uniform vec3 top; uniform vec3 mid; uniform vec3 low; uniform float fade; varying vec3 vW;
void main(){ float h = vW.y; vec3 c = h < 0.0 ? mix(mid, low, clamp(-h * 3.0, 0.0, 1.0)) : mix(mid, top, clamp(pow(h, 0.7) * 1.3, 0.0, 1.0));
  gl_FragColor = vec4(c, fade);
  #include <colorspace_fragment>
}`})));f.renderOrder=-9,M.add(f);let A=new xa(x(l.sky.top),x(l.ground.color),1.1),G=new ya(x(l.light),1.4);G.position.set(6,10,4),M.add(A,G);let F=l.ground.kind;if(F!=="none"){let dt;if(F==="dunes"||F==="rock"||F==="snow"){dt=new Zi(68,68,64,64);let de=dt.attributes.position;for(let Pe=0;Pe<de.count;Pe++){let tn=de.getX(Pe),kt=de.getY(Pe),le=Math.hypot(tn,kt),Ve=F==="dunes"?.55:F==="rock"?.35:.2;de.setZ(Pe,le<3?0:Ve*Math.min(1,(le-3)/6)*(Math.sin(tn*.45)*Math.cos(kt*.38)+.5*Math.sin((tn+kt)*.9)))}dt.computeVertexNormals()}else dt=new Fs(34,72);p(dt);let Yt=p(F==="water"?new $i({color:x(l.ground.color),transparent:!0,opacity:.92,emissive:x(l.ground.color),emissiveIntensity:.25}):F==="clouds"?new $i({color:x(l.ground.color),transparent:!0,opacity:.85}):new $i({color:x(l.ground.color),flatShading:F!=="grass"&&F!=="grid"})),ee=new he(dt,Yt);if(ee.rotation.x=-Math.PI/2,ee.position.y=F==="clouds"?-.4:.002,ee.renderOrder=-8,M.add(ee),F==="grid"){let de=[];for(let Pe=-30;Pe<=30;Pe+=1.5)de.push(Pe,.01,-30,Pe,.01,30,-30,.01,Pe,30,.01,Pe);M.add(new Ds(p(new Le().setAttribute("position",new ne(de,3))),p(new si({color:x(l.light),transparent:!0,opacity:.55}))))}}let Z=new Ye,H={},X=(dt,Yt)=>H[dt]||(H[dt]=p(Yt())),nt={near:[4,9],mid:[9,17],far:[18,30]};for(let dt of l.shapes){let Yt=p(new $i({color:x(dt.color),flatShading:!0})),ee=p(new rn({color:x(dt.color)})),de=p(new $i({color:x(dt.color).multiplyScalar(.35),flatShading:!0})),Pe=dt.kind==="mountain"?nt.far:dt.kind==="planet"||dt.kind==="moon"?[22,30]:nt[dt.spread];for(let tn=0;tn<dt.count;tn++){let kt=tn/dt.count*Math.PI*2+Math.random()*.9,le=Pe[0]+Math.random()*(Pe[1]-Pe[0]);Math.abs(Math.atan2(Math.sin(kt),Math.cos(kt)))<.65&&le<12&&dt.kind!=="lantern"&&(le+=7);let Se=dt.size*(.75+Math.random()*.5),un=new Ye,Ie=(qn,Zs,_c=0,sp=1,rp=1,ap=1)=>{let $a=new he(qn,Zs);return $a.position.y=_c,$a.scale.set(sp,rp,ap),un.add($a),$a};if(dt.kind==="tree")Ie(X("trunk",()=>new di(.06,.09,.7,6)),de,.35),Ie(X("blob",()=>new fs(.45,0)),Yt,.95);else if(dt.kind==="pine")Ie(X("trunk",()=>new di(.06,.09,.7,6)),de,.3),Ie(X("cone",()=>new us(.42,1.3,7)),Yt,1.05);else if(dt.kind==="palm")Ie(X("stem",()=>new di(.04,.07,1.9,6)),de,.95),Ie(X("blob",()=>new fs(.45,0)),Yt,1.95,1.4,.35,1.4);else if(dt.kind==="rock")Ie(X("rock",()=>new ca(.4,0)),Yt,.15,1,.6,1);else if(dt.kind==="crystal")Ie(X("crystal",()=>new fa(.3,0)),ee,.7,.8,2.3,.8);else if(dt.kind==="pillar")Ie(X("pillar",()=>new di(.25,.3,3,10)),Yt,1.5);else if(dt.kind==="tower")Ie(X("tower",()=>new Si(1,6,1)),Yt,3);else if(dt.kind==="mountain")Ie(X("mountain",()=>new us(6,8,7)),Yt,4);else if(dt.kind==="arch")Ie(X("arch",()=>new ms(1.2,.15,8,24,Math.PI)),Yt,0);else if(dt.kind==="lantern")Ie(X("lantern",()=>new Un(.12,12,8)),ee,1.3);else if(dt.kind==="cloud"){let qn=X("puff",()=>new fs(.7,1));Ie(qn,Yt,0,1.4,.8,1);let Zs=Ie(qn,Yt,.15,1,.7,1);Zs.position.x=.9;let _c=Ie(qn,Yt,.1,1.1,.75,1);_c.position.x=-.9}else(dt.kind==="planet"||dt.kind==="moon")&&Ie(X(dt.kind,()=>new Un(dt.kind==="planet"?3:1.5,32,20)),dt.kind==="moon"?ee:Yt,0);un.scale.setScalar(Se);let pi=dt.kind==="planet"||dt.kind==="moon"?10+Math.random()*10:dt.kind==="cloud"?6+Math.random()*5:0,Xn=dt.float&&pi===0?.8+Math.random()*2.5:0;un.position.set(Math.sin(kt)*le,pi+Xn,-Math.cos(kt)*le),un.rotation.y=Math.random()*Math.PI*2,un.userData={bob:dt.float||dt.kind==="cloud"||dt.kind==="lantern"?Math.random()*6:-1,y:un.position.y},Z.add(un)}}T||Z.scale.setScalar(.001),M.add(Z);let lt=l.particles.kind,wt=null;if(lt!=="none"){let dt=Math.round(lt==="stars"?500+700*l.particles.amount:150+900*l.particles.amount),Yt=new Float32Array(dt*3),ee=new Float32Array(dt);for(let Pe=0;Pe<dt;Pe++){if(lt==="stars"){let tn=Math.random()*Math.PI*2,kt=Math.random()*.9+.08,le=33;Yt.set([Math.cos(tn)*Math.sqrt(1-kt*kt)*le,kt*le,Math.sin(tn)*Math.sqrt(1-kt*kt)*le],Pe*3)}else{let tn=Math.random()*Math.PI*2,kt=1.2+Math.sqrt(Math.random())*13;Yt.set([Math.cos(tn)*kt,Math.random()*9,Math.sin(tn)*kt],Pe*3)}ee[Pe]=Math.random()*100}let de={stars:.09,snow:.05,rain:.03,fireflies:.07,embers:.05,bubbles:.08,petals:.06,dust:.03}[lt];wt=new Ns(p(new Le().setAttribute("position",new ne(Yt,3))),p(new cs({color:x(l.particles.color),size:de,transparent:!0,opacity:lt==="dust"?.5:.9,depthWrite:!1,blending:lt==="fireflies"||lt==="embers"||lt==="stars"?en:ys}))),wt.userData.seed=ee,M.add(wt)}h.add(M),Object.assign(Bn,{group:M,sky:f,parts:Z,dots:wt,kind:lt,t0:performance.now(),spec:l}),Ae(l.title,5e3)}function Xf(l,p){if(!Bn.group)return;let x=(p-Bn.t0)/1e3;if(!T){Bn.sky.material.uniforms.fade.value=Math.min(1,x/1.2);let H=Math.max(0,Math.min(1,(x-.5)/1.4));Bn.parts.scale.setScalar(Math.max(.001,1-(1-H)**3));for(let X of Bn.parts.children)X.userData.bob>=0&&(X.position.y=X.userData.y+Math.sin(p/1600+X.userData.bob)*.15)}let M=Bn.dots;if(!M||T||Bn.kind==="stars")return;let f=M.geometry.attributes.position,A=M.userData.seed,G=Bn.kind,F=p/1e3,Z={snow:-.5,rain:-7,fireflies:0,embers:.7,bubbles:.45,petals:-.35,dust:.03}[G]??0;for(let H=0;H<f.count;H++){let X=f.getY(H)+Z*l*(.7+A[H]%1*.6);if(X<0?X+=9:X>9&&(X-=9),f.setY(H,X),G!=="rain"){let nt=A[H];f.setX(H,f.getX(H)+Math.sin(F*.6+nt)*l*(G==="fireflies"?.35:.12)),f.setZ(H,f.getZ(H)+Math.cos(F*.5+nt*1.3)*l*(G==="fireflies"?.35:.12))}}f.needsUpdate=!0,G==="fireflies"&&(M.material.opacity=.6+.35*Math.sin(F*2.1))}let Xe={card:Ke(.2,.09),until:0,total:0,words:"",shown:"",doneAt:0};Xe.card.mesh.visible=!1,Xe.card.mesh.position.set(.36,.1,.01),y.add(Xe.card.mesh),u(Xe.card.tex);function pc(l){let{ctx:p,w:x,h:M}=Xe.card,f=l<=0;On(p,x,M,40,f?{hot:!0}:{});let A=Math.max(0,Math.ceil(l/1e3)),G=Math.floor(A/3600),F=Math.floor(A%3600/60),Z=A%60,H=f?"Time's up":(G?G+":"+String(F).padStart(2,"0"):String(F))+":"+String(Z).padStart(2,"0");xe(p,"Timer \xB7 "+Xe.words,34,56,26,nn,600,"left",He,"0.02em"),xe(p,H,34,M-40,f?56:72,f?Rn:ke,600,"left",He);let X=Xe.total?Math.max(0,Math.min(1,l/Xe.total)):0;p.fillStyle="rgba(255,255,255,0.1)",p.fillRect(34,M-22,x-68,4),p.fillStyle=Rn,p.fillRect(34,M-22,(x-68)*X,4),Ei(p,"close",x-52,52,40,nn,7),Xe.card.update()}function qf(l,p){Object.assign(Xe,{until:performance.now()+l,total:l,words:p||"",shown:"",doneAt:0}),Xe.card.mesh.visible=!0,pc(l)}function mc(){let l=Xe.until>0;return Xe.until=0,Xe.doneAt=0,Xe.card.mesh.visible=!1,l}St(Xe.card.mesh,{tap:()=>mc(),drag:()=>y,dropped:()=>{y.userData.placed=!0}});function Yf(l){if(!Xe.until)return;let p=Xe.until-l;if(p>0){let x=String(Math.ceil(p/1e3));x!==Xe.shown&&(Xe.shown=x,pc(p));return}Xe.doneAt?l-Xe.doneAt>15e3&&mc():(Xe.doneAt=l,pc(0),Ae("Time's up: your "+Xe.words+" timer.",12e3),e.speak?.("Time's up! Your "+Xe.words+" timer is done."))}let qa=[["Breathe in\u2026",4e3],["Hold\u2026",4e3],["Breathe out\u2026",6e3]],Qn={on:!1,t0:0,rounds:0,phase:-1,grow:0};function Zf(l=4){Object.assign(Qn,{on:!0,t0:performance.now(),rounds:l,phase:-1})}function nu(l){Qn.on&&(Qn.on=!1,J.reply=l||"",rt())}function $f(l){if(!Qn.on){Qn.grow+=(0-Qn.grow)*.08;return}let p=14e3,x=l-Qn.t0,M=Math.floor(x/p);if(M>=Qn.rounds){nu("Nicely done. How do you feel?"),e.speak?.("Nicely done. How do you feel?");return}let f=x%p,A=0;for(;f>qa[A][1];)f-=qa[A][1],A++;let G=f/qa[A][1],F=H=>.5-Math.cos(Math.PI*H)/2;Qn.grow=A===0?F(G):A===1?1:1-F(G);let Z=M*3+A;Z!==Qn.phase&&(Qn.phase=Z,J.reply=qa[A][0]+"  "+(M+1)+" of "+Qn.rounds,J.stage="",rt())}let iu=new N;function Jf(l,p){if(!Q.open)return;if(bf(l,p),Kh.value=p/1e3,Q.building){Q.building.rotation.y+=l*1.4,Q.building.rotation.x=.5;return}if(kf(l),Q.spec?.kind==="sketch"){Pf(l,p);let f=Q.view.ex;for(let A of Gn.parts)A.exDir&&A.g.position.copy(A.exDir).multiplyScalar(f*.17);return}if(Q.spec?.kind==="globe"){Uf(l,p);return}if(Q.spec?.kind==="sim"){Bf(l,p);return}let x=p-Q.t0;for(let f of Q.nodes){let A=T?1:Math.max(0,Math.min(1,(x-f.i*110)/520));f.shown=T?1:1-(1-A)**3,f.parent?(T||(f.angle+=l*f.speed),iu.set(Math.cos(f.angle)*f.orbitR,Math.sin(f.angle)*f.orbitR*.22,Math.sin(f.angle)*f.orbitR*.85),f.g.position.copy(f.parent.g.position).add(iu),f.ring.position.copy(f.parent.g.position)):(f.g.position.set(f.base.x,f.base.y+(T?0:Math.sin(p/1400+f.i)*.004),f.base.z),f.exDir&&Q.view.ex>.001&&f.g.position.addScaledVector(f.exDir,Q.view.ex*.2));let G=Q.focus?Q.focus.has(f.i)?1.18:.32:f.hot?1.1:1;f.emph+=(G-f.emph)*Math.min(1,l*6);let F=Math.min(1,f.emph);f.g.scale.setScalar(Math.max(.001,f.shown*(f.emph>1?f.emph:1))),f.mat.uniforms?f.mat.uniforms.opacity.value=.82*F:f.mat.opacity=.82*F,f.shell&&(f.shell.material.opacity=.3*F*(f.hot?1.6:1),T||(f.shell.rotation.y+=l*.5,f.shell.rotation.x+=l*.17)),f.glow.material.opacity=.5*F*(f.hot?1.4:1),f.label.mesh.material.opacity=Math.max(.25,F)}let M=T?1:Math.max(0,Math.min(1,(x-Q.nodes.length*110)/500));for(let f of Q.links){if(!f.a)continue;let A=f.line.geometry.attributes.position;A.setXYZ(0,f.a.g.position.x,f.a.g.position.y,f.a.g.position.z),A.setXYZ(1,f.b.g.position.x,f.b.g.position.y,f.b.g.position.z),A.needsUpdate=!0;let G=Q.focus?Q.focus.has(f.a.i)&&Q.focus.has(f.b.i)?.7:.12:.45;if(f.line.material.opacity=G*M,f.pulse){let F=T?.5:(p/1200+f.off)%1;f.pulse.position.lerpVectors(f.a.g.position,f.b.g.position,F);let Z=Q.focus?G>.5?1:.1:.55;f.pulse.material.opacity=(T?.4:Math.sin(Math.PI*F))*Z*M,f.pulse.scale.setScalar(Q.focus&&G>.5?.075:.05)}}}function Kf(){if(!_t.open||!_t.live)return null;let l=_t.screen,p=Math.min(1,1600/Math.max(l.w,l.h)),x=document.createElement("canvas");x.width=Math.max(1,Math.round(l.w*p)),x.height=Math.max(1,Math.round(l.h*p)),x.getContext("2d").drawImage(l.canvas,0,0,x.width,x.height);let M=x.toDataURL("image/jpeg",.85);return{b64:M.slice(M.indexOf(",")+1),url:M,w:x.width,h:x.height}}let qs=[];function su(l){Jt(l.c.mesh),Jt(l.x.mesh),h.remove(l.group);for(let x of[l.c,l.x])x.tex.dispose(),x.mesh.geometry.dispose(),x.mesh.material.dispose();let p=qs.indexOf(l);p>=0&&qs.splice(p,1)}function ru(l,p,x=!1,M=""){if(!x){let X=e.notes.add(l,M);p=X[X.length-1]?.at??Date.now();let nt=new Set(X.map(lt=>lt.at));for(let lt of[...qs])nt.has(lt.at)||su(lt)}let f=new Ye,A=Ke(.3,.19),G=Ke(.04,.04);{let{ctx:X,w:nt,h:lt}=A;On(X,nt,lt,44),Ei(X,"pin",62,66,34,nn,7),X.font=`600 28px ${He}`,xe(X,M?Pn(X,"Pinned \xB7 "+M,nt-140):"Pinned",88,76,28,nn,600,"left",He,"0.02em");let wt=(ee,de)=>(X.font=`500 ${de}px ${an}`,X.measureText(ee).width),dt=a.fitLines(l,nt-96,6,34,22,wt),Yt=92;for(let ee of dt.lines)xe(X,ee,48,Yt+=dt.size*1.32,dt.size,ke,500);A.update(),pf(G,"close")}G.mesh.position.set(.135,.08,.004),f.add(A.mesh,G.mesh),h.add(f);let F=new Set(qs.map(X=>X.slot)),Z=0;for(;F.has(Z);)Z++;let H={group:f,c:A,x:G,at:p,text:l,slot:Z};qs.push(H),St(A.mesh,{tap:()=>e.resume?e.resume({text:l,ask:M}):e.speak(l),drag:()=>f}),St(G.mesh,{tap:()=>{su(H),e.notes.remove(p)}}),Ya?au(H):f.visible=!1}function au(l){let p=l.slot,x=ce-1.1-p%4*.42,M=.95,f=Math.floor(p/4);l.group.position.set(Kt.x-Math.sin(x)*M,Kt.y-.05+f*.24-p%2*.05,Kt.z-Math.cos(x)*M),K(l.group),l.group.visible=!0}let Ya=!1;function jf(){let l=s?d:o.xr.getCamera();Kt.setFromMatrixPosition(l.matrixWorld),ye.setFromRotationMatrix(l.matrixWorld),oe.set(0,0,-1).applyQuaternion(ye),Math.hypot(oe.x,oe.z)>.15&&(ce=Math.atan2(-oe.x,-oe.z))}function Qf(){y.position.set(Kt.x-Math.sin(ce)*.75,Kt.y-.1,Kt.z-Math.cos(ce)*.75),K(y),y.visible=!0,Ya=!0,S=performance.now(),qs.forEach(au)}function tp(l){if(!S||g)return;let p=T?1:v((l-S)/1100),x=T?1:v((l-S-350)/600);O.scale.multiplyScalar(.3+.7*p),W.opacity+=(1-p)*.45;let M=T?1:Math.min(1,(l-S)/1500);ct.visible=M<1,M<1&&(it.opacity=.8*(1-M)*(1-M),ct.scale.setScalar(.9+v(M)*1.6));for(let f of m)f.opacity=x;p>=1&&x>=1&&M>=1&&(g=!0)}let ti=null;function ep(l){if(ue.some(p=>p.press?.drag===y)){ti=null;return}if(!y.userData.placed){let p=a.followTarget({x:Kt.x,y:Kt.y,z:Kt.z,yaw:ce},y.position);p&&(ti=p)}if(ti){let p=1-Math.exp(-l*2.6);y.position.x+=(ti.x-y.position.x)*p,y.position.y+=(ti.y-y.position.y)*p,y.position.z+=(ti.z-y.position.z)*p,Math.hypot(ti.x-y.position.x,ti.y-y.position.y,ti.z-y.position.z)<.02&&(ti=null)}K(y)}function Ys(){y.userData.placed=!1,ti={x:Kt.x-Math.sin(ce)*.75,y:Kt.y-.1,z:Kt.z-Math.cos(ce)*.75}}let ou={listening:6220500,thinking:10980346,speaking:16020150};function np(l,p){let x=.06+Math.sin(p*1.4)*.02;J.state==="listening"?x=Math.max(.12,J.mic):J.state==="thinking"?x=.28:J.state==="speaking"&&(x=.34+.36*Math.abs(Math.sin(p*7.3)*Math.sin(p*3.1+1))),J.energy+=(x-J.energy)*Math.min(1,l*8),J.think+=((J.state==="thinking"?1:0)-J.think)*Math.min(1,l*3),I.uniforms.uTime.value=p,I.uniforms.uEnergy.value=J.energy,I.uniforms.uThink.value=J.think;let M=(1+Math.sin(p*1.7)*.012+J.energy*.1)*(J.hovered?1.06:1)*(1+Qn.grow*.45);O.scale.setScalar(M),W.opacity=.1+J.energy*.36,W.color.setHex(ou[J.state]||E),q.scale.setScalar(.4+J.energy*.12);let f=J.state==="listening"||J.state==="thinking";tt.opacity+=((f?.6:0)-tt.opacity)*Math.min(1,l*6),tt.color.setHex(ou[J.state]||6220500),k.rotation.z-=l*(J.state==="thinking"?4:.8),k.scale.setScalar(1+(J.state==="listening"?J.mic*.25:0)),ip(l,p)}let Za=(()=>{let l=u(new Zi(.008,1)),p=u(new rn({color:6220500,transparent:!0,opacity:0,depthWrite:!1,blending:en})),x=[];for(let M of[-1,1])for(let f=0;f<4;f++){let A=new he(l,p);A.position.set(M*(.142+f*.016),0,.01),A.userData={k:f,phase:Math.random()*6,h:.004},A.scale.y=.004,y.add(A),x.push(A)}return{bars:x,mat:p}})();function ip(l,p){let x=J.state==="listening";if(Za.mat.opacity+=((x?.9:0)-Za.mat.opacity)*Math.min(1,l*8),!(Za.mat.opacity<.01))for(let M of Za.bars){let{k:f,phase:A}=M.userData,G=T?.6:.55+.45*Math.abs(Math.sin(p*(7+f*1.7)+A)),F=x?.006+J.mic*.07*(1-f*.18)*G:.004;M.userData.h+=(F-M.userData.h)*Math.min(1,l*14),M.scale.y=Math.max(.004,M.userData.h)}}function gc(){let l=J.state;l==="listening"?bt.set("done","Done"):l==="speaking"?bt.set("quiet","Quiet"):l==="thinking"?bt.set("think","Working"):bt.set("mic","Talk");let p=!!e.calling?.();p!==ft.shown&&(ft.shown=p,ht()),Fe.setOn(et.open),Ce.setOn(_t.open);let x=Vs&&(l===""||l==="listening")&&!!e.ready?.();for(let M of Tn)M.c.mesh.visible=x}let lu=performance.now(),cu=0,hu=0,uu=!1,du=0,fu=new Map;o.setAnimationLoop(()=>{let l=performance.now(),p=Math.min(.05,(l-lu)/1e3);lu=l,cu+=p,hu++,s&&(d.rotation.set(Et,Xt,0,"YXZ"),d.updateMatrixWorld()),jf(),!Ya&&hu>3&&Qf(),Ya&&ep(p),np(p,cu),tp(l),Jf(p,l),Xf(p,l),Yf(l),$f(l);for(let x of ue){if(!Zt(x))continue;let M=x.hit,f=M?.object.userData.ui||null;f!==x.hover&&(x.hover?.hover?.(!1),f?.hover?.(!0),f&&Ue(x,.12,10),x.hover=f),x.dot.visible=!!M,M&&(x.dot.position.copy(M.point).addScaledVector(x.dir,-.003),x.dot.lookAt(x.origin)),x.line&&(x.line.scale.z=M?M.distance:1.2);let A=x.press;if(A?.turn){let F=A.direct?L(x,B):x.origin.clone().addScaledVector(x.dir,A.dist);!A.moved&&F.distanceTo(A.start)>(A.direct?.012:.03)&&(A.moved=!0),A.moved&&zf(A,F,l)}else if(A?.direct)L(x,B),!A.moved&&B.distanceTo(A.start)>.012&&(A.moved=!0),A.moved&&(A.drag.position.copy(B).add(A.offset),K(A.drag));else if(A?.drag){let F=x.origin.clone().addScaledVector(x.dir,A.dist);!A.moved&&F.distanceTo(A.start)>.03&&(A.moved=!0),A.moved&&(A.drag.position.copy(F).add(A.offset),K(A.drag))}let G=x.source?.gamepad;if(G){let F=G.axes[3]??0;Math.abs(F)>.45&&f?.scroll&&l-x.scrollAt>140&&(f.scroll(Math.sign(F)*(Math.abs(F)>.85?3:1)),x.scrollAt=l);let Z=fu.get(x)||[],H=!!G.buttons[4]?.pressed,X=!!G.buttons[5]?.pressed;H&&!Z[0]&&se(x),!H&&Z[0]&&V(x,l-(x.holdAt||l)),X&&!Z[1]&&Ys(),fu.set(x,[H,X])}}if(Tt)for(let x=0;x<2;x++){let M=o.xr.getHand(x);for(let f of Object.values(M.joints||{}))if(!f.userData.dot){let A=new he(Tt.jointGeo,Tt.jointMat);f.add(A),f.userData.dot=A}}if(Nt.anim){let x=(l-Nt.t0)/(650*Math.max(1,Nt.marks.length));Nr(Math.min(1,x)),x>=1&&(Nt.anim=!1)}for(let x=Ts.length-1;x>=0;x--){let M=Ts[x],f=(l-M.t0)/350;M.m.scale.setScalar(1+f*1.6),M.m.material.opacity=Math.max(0,.9*(1-f)),f>=1&&(h.remove(M.m),M.m.material.dispose(),Ts.splice(x,1))}l-du>200&&(du=l,gc()),o.render(h,d)});let As=null;if(s){yt=!0,As=document.createElement("div"),As.setAttribute("role","status"),Object.assign(As.style,{position:"fixed",top:"max(12px, env(safe-area-inset-top))",left:"50%",transform:"translateX(-50%)",zIndex:"2147483001",display:"flex",flexWrap:"wrap",justifyContent:"center",gap:"8px 10px",alignItems:"center",padding:"8px 8px 8px 16px",borderRadius:"24px",background:"rgba(18,20,27,.9)",color:ke,font:`500 14px ${an}`,border:"1px solid rgba(255,255,255,.14)",width:"max-content",maxWidth:"calc(100vw - 32px)",boxSizing:"border-box"});let l=document.createElement("span");l.textContent="3D preview \xB7 click the orb to talk, drag to look",Object.assign(l.style,{color:nn,textAlign:"center",flex:"1 1 auto"});let p=(x,M)=>{let f=document.createElement("button");return f.type="button",f.textContent=x,Object.assign(f.style,{font:`600 14px ${an}`,color:ke,background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.12)",borderRadius:"999px",padding:"8px 14px",cursor:"pointer",whiteSpace:"nowrap"}),f.onclick=M,f};As.append(l,p("Talk",()=>e.tapOrb()),p("Photos",qt),p("My PC",Dt),p("Pin",vt),p("Style",Ht),p("Leave",()=>Vr())),mt=document.createElement("span"),mt.setAttribute("aria-live","polite"),Object.assign(mt.style,{position:"absolute",width:"1px",height:"1px",overflow:"hidden",clip:"rect(0 0 0 0)",whiteSpace:"nowrap"}),As.append(mt),document.body.appendChild(As)}else Mt(t,"end",()=>Vr());function Vr(){if(!uu){if(uu=!0,Gs(),Ut(),uc(),dc(),fc(),clearTimeout(Wt),o.setAnimationLoop(null),!s)try{t.end()}catch{}for(let l of ot)try{l()}catch{}As?.remove(),c.remove(),h.traverse(l=>{l.geometry?.dispose?.();let p=l.material;if(p)for(let x of Array.isArray(p)?p:[p])x.map?.dispose?.(),x.dispose?.()});for(let l of _)try{l.dispose?.()}catch{}o.dispose(),e.exited()}}return rt(),Kn(),{orb(l){let p=l||"";p!==J.state&&(J.state=p,p==="listening"&&(J.hint="",J.stage=""),p===""&&(J.stage=""),rt(),gc())},heard(l){let p=String(l||"");p!==J.you&&(J.you=p,p&&p!=="\u2026"&&(J.reply=""),J.hint="",rt())},said(l){let p=String(l||"");!p||p===J.reply||(J.reply=p,J.stage="",rt())},line(l,p,x){let M=String(p||"");M&&(l==="me"?(J.you=M,J.reply="",J.hint="",Vs&&Fa()):l==="izuki"&&(x?.thinking?J.stage=M:(J.reply=M,J.stage="")),rt())},level(l){J.mic=Math.max(0,Math.min(1,Number(l)||0))},showLook:Ur,lookShown:()=>Nt.group.visible,pin:ru,comeHere:Ys,pcOpen:Ga,pcTarget:()=>_t.open?_t.target:null,pcClose:Gs,pcShown:()=>_t.open,pcFrame:Kf,filesOpen:fn,filesClose:Ut,webSearch:_f,webClose:uc,webShown:()=>xt.open,holoBuilding:wf,holoShow:Ef,holoFocus:Hf,holoClose:dc,holoShown:()=>Q.open,holoPhoto:If,globeShow:Df,globeMark:Nf,simShow:Of,holoView:Gf,holoViewNow:()=>({...Q.view,yaw:Q.stage.rotation.y}),simShown:()=>Q.open&&Q.spec?.kind==="sim",simProbe:()=>je.st?{...je.st,type:je.spec?.type}:null,dreamShow:Wf,dreamClose:fc,dreamShown:()=>!!Bn.group,timerStart:qf,timerStop:mc,breathe:Zf,breatheStop:()=>nu(""),nextTheme:U,notice:Ae,stop:Vr}}function Wx(i,t){let e={uLow:{value:new jt},uMid:{value:new jt},uTop:{value:new jt},uBand:{value:new jt},uBandAmt:{value:0}},n=new he(new Un(40,48,24),new xn({side:bn,depthWrite:!1,uniforms:e,vertexShader:"varying vec3 vW; void main(){ vW = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`varying vec3 vW;
      uniform vec3 uLow; uniform vec3 uMid; uniform vec3 uTop; uniform vec3 uBand; uniform float uBandAmt;
      void main(){
        float h = vW.y;
        vec3 c = h < 0.0 ? mix(uMid, uLow, clamp(-h * 2.5, 0.0, 1.0)) : mix(uMid, uTop, clamp(h * 1.6, 0.0, 1.0));
        // The horizon glow: brightest at eye level, fading up and down.
        c += uBand * exp(-abs(h) * 7.0) * uBandAmt;
        gl_FragColor = vec4(c, 1.0);
      }`}));n.renderOrder=-10,i.add(n);let s=320,r=new Float32Array(s*3);for(let S=0;S<s;S++){let T=Math.random()*Math.PI*2,v=Math.random()*.85+.12,g=30;r[S*3]=Math.cos(T)*Math.sqrt(1-v*v)*g,r[S*3+1]=v*g,r[S*3+2]=Math.sin(T)*Math.sqrt(1-v*v)*g}let a=new Ns(new Le().setAttribute("position",new ne(r,3)),new cs({color:14674165,size:.05,transparent:!0,opacity:.5,depthWrite:!1}));i.add(a);let o=document.createElement("canvas");o.width=o.height=2048;let c=o.getContext("2d"),h=1024,d=1024/3.2,_=c.createRadialGradient(h,h,0,h,h,1024);_.addColorStop(0,"rgba(255,255,255,0.10)"),_.addColorStop(.5,"rgba(255,255,255,0.03)"),_.addColorStop(1,"rgba(255,255,255,0)"),c.fillStyle=_,c.fillRect(0,0,2048,2048);for(let S=.4;S<=3.2+1e-6;S+=.4){let T=S/3.2;c.beginPath(),c.arc(h,h,S*d,0,Math.PI*2),c.lineWidth=2.2-T,c.strokeStyle=`rgba(255,255,255,${(.34*(1-T)+.04).toFixed(3)})`,c.stroke()}let u=new Us(o);u.colorSpace=gn,u.anisotropy=$h;let m=new he(new Fs(3.2,128),new rn({map:u,transparent:!0,depthWrite:!1}));return m.rotation.x=-Math.PI/2,m.position.y=t,i.add(m),{set(S){e.uLow.value.setRGB(...S.low),e.uMid.value.setRGB(...S.mid),e.uTop.value.setRGB(...S.top),e.uBand.value.setRGB(...S.band),e.uBandAmt.value=S.bandAmt,a.material.opacity=S.stars,a.visible=S.stars>.02,m.material.color.setRGB(...S.floor)}}}var Ua=[{name:"Nova",orb:[[.18,.83,.75],[.55,.36,.96],[.96,.45,.71]],halo:8246268,low:[.008,.01,.014],mid:[.03,.036,.05],top:[.012,.014,.022],band:[.08,.2,.2],bandAmt:.55,stars:.5,floor:[.6,1,.95]},{name:"Midnight",orb:[[.25,.5,1],[.4,.75,1],[.75,.85,1]],halo:9684477,low:[.006,.01,.02],mid:[.02,.04,.08],top:[.008,.014,.03],band:[.1,.16,.32],bandAmt:.6,stars:.6,floor:[.7,.82,1]},{name:"Aurora",orb:[[.25,.92,.6],[.2,.75,.9],[.55,.45,.95]],halo:7268279,low:[.006,.012,.012],mid:[.02,.045,.045],top:[.01,.018,.022],band:[.08,.3,.18],bandAmt:.7,stars:.5,floor:[.6,1,.8]},{name:"Dawn",orb:[[1,.7,.52],[.92,.55,.62],[1,.86,.66]],halo:16701354,low:[.012,.009,.01],mid:[.06,.04,.045],top:[.02,.016,.026],band:[.32,.16,.1],bandAmt:.55,stars:.2,floor:[1,.85,.75]},{name:"Pearl",light:!0,orb:[[.86,.88,.96],[.7,.76,.92],[.94,.88,.92]],halo:14870768,low:[.42,.44,.48],mid:[.66,.68,.73],top:[.8,.81,.85],band:[.06,.06,.07],bandAmt:.4,stars:0,floor:[.2,.22,.28]}];export{$M as start};
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
