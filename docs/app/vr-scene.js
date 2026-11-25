// Izuki in VR, the 3D room: built from vr-scene.src.js by tools/build-vr.cjs. Includes three.js (MIT, notice at the end).
var Ju=0,nh=1,Ku=2;var ba=1,ju=2,Cr=3,vs=0,Sn=1,Xn=2,Fi=0,ys=1,Ye=2,ih=3,sh=4,Qu=5;var ks=100,td=101,ed=102,nd=103,id=104,sd=200,rd=201,ad=202,od=203,rh=204,ah=205,ld=206,cd=207,hd=208,ud=209,dd=210,fd=211,pd=212,md=213,gd=214,wo=0,To=1,Ao=2,mr=3,Eo=4,Co=5,Ro=6,Po=7,dl=0,_d=1,xd=2,Si=0,oh=1,lh=2,ch=3,hh=4,uh=5,dh=6,fh=7;var ph=300,Ms=301,zs=302,fl=303,pl=304,wa=306,Io=1e3,Ii=1001,Lo=1002,Mn=1003,vd=1004;var Ta=1005;var wn=1006,ml=1007;var Ss=1008;var qn=1009,mh=1010,gh=1011,Rr=1012,gl=1013,bi=1014,wi=1015,Ti=1016,_l=1017,xl=1018,Pr=1020,_h=35902,xh=35899,vh=1021,yh=1022,ui=1023,Li=1026,bs=1027,Mh=1028,vl=1029,ws=1030,yl=1031;var Ml=1033,Aa=33776,Ea=33777,Ca=33778,Ra=33779,Sl=35840,bl=35841,wl=35842,Tl=35843,Al=36196,El=37492,Cl=37496,Rl=37488,Pl=37489,Pa=37490,Il=37491,Ll=37808,Dl=37809,Nl=37810,Ul=37811,Fl=37812,Ol=37813,Bl=37814,kl=37815,zl=37816,Vl=37817,Gl=37818,Hl=37819,Wl=37820,Xl=37821,ql=36492,Yl=36494,Zl=36495,$l=36283,Jl=36284,Ia=36285,Kl=36286;var Qr=2300,Do=2301,Mo=2302,qc=2303,Yc=2400,Zc=2401,$c=2402;var yd=3200;var jl=0,Md=1,Ji="",mn="srgb",ta="srgb-linear",ea="linear",Le="srgb";var So=7680;var Sd=519,bd=512,wd=513,Td=514,Ql=515,Ad=516,Ed=517,tc=518,Cd=519,Sh=35044;var bh="300 es",xi=2e3,gr=2001;function dp(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function fp(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function _r(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Rd(){let i=_r("canvas");return i.style.display="block",i}var pu={},xr=null;function na(...i){let t="THREE."+i.shift();xr?xr("log",t,...i):console.log(t,...i)}function Pd(i){let t=i[0];if(typeof t=="string"&&t.startsWith("TSL:")){let e=i[1];e&&e.isStackTrace?i[0]+=" "+e.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Qt(...i){i=Pd(i);let t="THREE."+i.shift();if(xr)xr("warn",t,...i);else{let e=i[0];e&&e.isStackTrace?console.warn(e.getError(t)):console.warn(t,...i)}}function ne(...i){i=Pd(i);let t="THREE."+i.shift();if(xr)xr("error",t,...i);else{let e=i[0];e&&e.isStackTrace?console.error(e.getError(t)):console.error(t,...i)}}function Ds(...i){let t=i.join(" ");t in pu||(pu[t]=!0,Qt(...i))}function Id(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}var Ld={[wo]:To,[Ao]:Ro,[Eo]:Po,[mr]:Co,[To]:wo,[Ro]:Ao,[Po]:Eo,[Co]:mr},Di=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){let n=this._listeners;return n===void 0?!1:n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){let n=this._listeners;if(n===void 0)return;let s=n[t];if(s!==void 0){let r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let n=e[t.type];if(n!==void 0){t.target=this;let s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,t);t.target=null}}},Rn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var xc=Math.PI/180,No=180/Math.PI;function as(){let i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Rn[i&255]+Rn[i>>8&255]+Rn[i>>16&255]+Rn[i>>24&255]+"-"+Rn[t&255]+Rn[t>>8&255]+"-"+Rn[t>>16&15|64]+Rn[t>>24&255]+"-"+Rn[e&63|128]+Rn[e>>8&255]+"-"+Rn[e>>16&255]+Rn[e>>24&255]+Rn[n&255]+Rn[n>>8&255]+Rn[n>>16&255]+Rn[n>>24&255]).toLowerCase()}function Me(i,t,e){return Math.max(t,Math.min(e,i))}function pp(i,t){return(i%t+t)%t}function vc(i,t,e){return(1-e)*i+e*t}function Pi(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:case Uint8ClampedArray:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function Fe(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var Rh=class Rh{constructor(t=0,e=0){this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("THREE.Vector2: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Me(this.x,t.x,e.x),this.y=Me(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=Me(this.x,t,e),this.y=Me(this.y,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Me(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(Me(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,a=this.y-t.y;return this.x=r*n-a*s+t.x,this.y=r*s+a*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};Rh.prototype.isVector2=!0;var kt=Rh,li=class{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,a,o){let c=n[s+0],h=n[s+1],d=n[s+2],_=n[s+3],u=r[a+0],m=r[a+1],M=r[a+2],T=r[a+3];if(_!==T||c!==u||h!==m||d!==M){let v=c*u+h*m+d*M+_*T;v<0&&(u=-u,m=-m,M=-M,T=-T,v=-v);let g=1-o;if(v<.9995){let R=Math.acos(v),D=Math.sin(R);g=Math.sin(g*R)/D,o=Math.sin(o*R)/D,c=c*g+u*o,h=h*g+m*o,d=d*g+M*o,_=_*g+T*o}else{c=c*g+u*o,h=h*g+m*o,d=d*g+M*o,_=_*g+T*o;let R=1/Math.sqrt(c*c+h*h+d*d+_*_);c*=R,h*=R,d*=R,_*=R}}t[e]=c,t[e+1]=h,t[e+2]=d,t[e+3]=_}static multiplyQuaternionsFlat(t,e,n,s,r,a){let o=n[s],c=n[s+1],h=n[s+2],d=n[s+3],_=r[a],u=r[a+1],m=r[a+2],M=r[a+3];return t[e]=o*M+d*_+c*m-h*u,t[e+1]=c*M+d*u+h*_-o*m,t[e+2]=h*M+d*m+o*u-c*_,t[e+3]=d*M-o*_-c*u-h*m,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let n=t._x,s=t._y,r=t._z,a=t._order,o=Math.cos,c=Math.sin,h=o(n/2),d=o(s/2),_=o(r/2),u=c(n/2),m=c(s/2),M=c(r/2);switch(a){case"XYZ":this._x=u*d*_+h*m*M,this._y=h*m*_-u*d*M,this._z=h*d*M+u*m*_,this._w=h*d*_-u*m*M;break;case"YXZ":this._x=u*d*_+h*m*M,this._y=h*m*_-u*d*M,this._z=h*d*M-u*m*_,this._w=h*d*_+u*m*M;break;case"ZXY":this._x=u*d*_-h*m*M,this._y=h*m*_+u*d*M,this._z=h*d*M+u*m*_,this._w=h*d*_-u*m*M;break;case"ZYX":this._x=u*d*_-h*m*M,this._y=h*m*_+u*d*M,this._z=h*d*M-u*m*_,this._w=h*d*_+u*m*M;break;case"YZX":this._x=u*d*_+h*m*M,this._y=h*m*_+u*d*M,this._z=h*d*M-u*m*_,this._w=h*d*_-u*m*M;break;case"XZY":this._x=u*d*_-h*m*M,this._y=h*m*_-u*d*M,this._z=h*d*M+u*m*_,this._w=h*d*_+u*m*M;break;default:Qt("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,n=e[0],s=e[4],r=e[8],a=e[1],o=e[5],c=e[9],h=e[2],d=e[6],_=e[10],u=n+o+_;if(u>0){let m=.5/Math.sqrt(u+1);this._w=.25/m,this._x=(d-c)*m,this._y=(r-h)*m,this._z=(a-s)*m}else if(n>o&&n>_){let m=2*Math.sqrt(1+n-o-_);this._w=(d-c)/m,this._x=.25*m,this._y=(s+a)/m,this._z=(r+h)/m}else if(o>_){let m=2*Math.sqrt(1+o-n-_);this._w=(r-h)/m,this._x=(s+a)/m,this._y=.25*m,this._z=(c+d)/m}else{let m=2*Math.sqrt(1+_-n-o);this._w=(a-s)/m,this._x=(r+h)/m,this._y=(c+d)/m,this._z=.25*m}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<1e-8?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(Me(this.dot(t),-1,1)))}rotateTowards(t,e){let n=this.angleTo(t);if(n===0)return this;let s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let n=t._x,s=t._y,r=t._z,a=t._w,o=e._x,c=e._y,h=e._z,d=e._w;return this._x=n*d+a*o+s*h-r*c,this._y=s*d+a*c+r*o-n*h,this._z=r*d+a*h+n*c-s*o,this._w=a*d-n*o-s*c-r*h,this._onChangeCallback(),this}slerp(t,e){let n=t._x,s=t._y,r=t._z,a=t._w,o=this.dot(t);o<0&&(n=-n,s=-s,r=-r,a=-a,o=-o);let c=1-e;if(o<.9995){let h=Math.acos(o),d=Math.sin(h);c=Math.sin(c*h)/d,e=Math.sin(e*h)/d,this._x=this._x*c+n*e,this._y=this._y*c+s*e,this._z=this._z*c+r*e,this._w=this._w*c+a*e,this._onChangeCallback()}else this._x=this._x*c+n*e,this._y=this._y*c+s*e,this._z=this._z*c+r*e,this._w=this._w*c+a*e,this.normalize();return this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},Ph=class Ph{constructor(t=0,e=0,n=0){this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("THREE.Vector3: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(mu.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(mu.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=t.elements,a=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(t){let e=this.x,n=this.y,s=this.z,r=t.x,a=t.y,o=t.z,c=t.w,h=2*(a*s-o*n),d=2*(o*e-r*s),_=2*(r*n-a*e);return this.x=e+c*h+a*_-o*d,this.y=n+c*d+o*h-r*_,this.z=s+c*_+r*d-a*h,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Me(this.x,t.x,e.x),this.y=Me(this.y,t.y,e.y),this.z=Me(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=Me(this.x,t,e),this.y=Me(this.y,t,e),this.z=Me(this.z,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Me(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let n=t.x,s=t.y,r=t.z,a=e.x,o=e.y,c=e.z;return this.x=s*c-r*o,this.y=r*a-n*c,this.z=n*o-s*a,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return yc.copy(this).projectOnVector(t),this.sub(yc)}reflect(t){return this.sub(yc.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(Me(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){let s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};Ph.prototype.isVector3=!0;var N=Ph,yc=new N,mu=new li,Ih=class Ih{constructor(t,e,n,s,r,a,o,c,h){this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,c,h)}set(t,e,n,s,r,a,o,c,h){let d=this.elements;return d[0]=t,d[1]=s,d[2]=o,d[3]=e,d[4]=r,d[5]=c,d[6]=n,d[7]=a,d[8]=h,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[3],c=n[6],h=n[1],d=n[4],_=n[7],u=n[2],m=n[5],M=n[8],T=s[0],v=s[3],g=s[6],R=s[1],D=s[4],E=s[7],I=s[2],P=s[5],U=s[8];return r[0]=a*T+o*R+c*I,r[3]=a*v+o*D+c*P,r[6]=a*g+o*E+c*U,r[1]=h*T+d*R+_*I,r[4]=h*v+d*D+_*P,r[7]=h*g+d*E+_*U,r[2]=u*T+m*R+M*I,r[5]=u*v+m*D+M*P,r[8]=u*g+m*E+M*U,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],c=t[6],h=t[7],d=t[8];return e*a*d-e*o*h-n*r*d+n*o*c+s*r*h-s*a*c}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],c=t[6],h=t[7],d=t[8],_=d*a-o*h,u=o*c-d*r,m=h*r-a*c,M=e*_+n*u+s*m;if(M===0)return this.set(0,0,0,0,0,0,0,0,0);let T=1/M;return t[0]=_*T,t[1]=(s*h-d*n)*T,t[2]=(o*n-s*a)*T,t[3]=u*T,t[4]=(d*e-s*c)*T,t[5]=(s*r-o*e)*T,t[6]=m*T,t[7]=(n*c-h*e)*T,t[8]=(a*e-n*r)*T,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,a,o){let c=Math.cos(r),h=Math.sin(r);return this.set(n*c,n*h,-n*(c*a+h*o)+a+t,-s*h,s*c,-s*(-h*a+c*o)+o+e,0,0,1),this}scale(t,e){return Ds("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Mc.makeScale(t,e)),this}rotate(t){return Ds("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Mc.makeRotation(-t)),this}translate(t,e){return Ds("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Mc.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}};Ih.prototype.isMatrix3=!0;var ae=Ih,Mc=new ae,gu=new ae().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),_u=new ae().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function mp(){let i={enabled:!0,workingColorSpace:ta,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===Le&&(s.r=Yi(s.r),s.g=Yi(s.g),s.b=Yi(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===Le&&(s.r=pr(s.r),s.g=pr(s.g),s.b=pr(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Ji?ea:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Ds("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Ds("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[ta]:{primaries:t,whitePoint:n,transfer:ea,toXYZ:gu,fromXYZ:_u,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:mn},outputColorSpaceConfig:{drawingBufferColorSpace:mn}},[mn]:{primaries:t,whitePoint:n,transfer:Le,toXYZ:gu,fromXYZ:_u,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:mn}}}),i}var Se=mp();function Yi(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function pr(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var Js,Uo=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let n;if(t instanceof HTMLCanvasElement)n=t;else{Js===void 0&&(Js=_r("canvas")),Js.width=t.width,Js.height=t.height;let s=Js.getContext("2d");t instanceof ImageData?s.putImageData(t,0,0):s.drawImage(t,0,0,t.width,t.height),n=Js}return n.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=_r("canvas");e.width=t.width,e.height=t.height;let n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);let s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=Yi(r[a]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){let e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(Yi(e[n]/255)*255):e[n]=Yi(e[n]);return{data:e,width:t.width,height:t.height}}else return Qt("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},gp=0,vr=class{constructor(t=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:gp++}),this.uuid=as(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):typeof VideoFrame<"u"&&e instanceof VideoFrame?t.set(e.displayWidth,e.displayHeight,0):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Sc(s[a].image)):r.push(Sc(s[a]))}else r=Sc(s);n.url=r}return e||(t.images[this.uuid]=n),n}};function Sc(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Uo.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Qt("Texture: Unable to serialize Texture."),{})}var _p=0,bc=new N,Ln=class i extends Di{constructor(t=i.DEFAULT_IMAGE,e=i.DEFAULT_MAPPING,n=Ii,s=Ii,r=wn,a=Ss,o=ui,c=qn,h=i.DEFAULT_ANISOTROPY,d=Ji){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:_p++}),this.uuid=as(),this.name="",this.source=new vr(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=h,this.format=o,this.internalFormat=null,this.type=c,this.offset=new kt(0,0),this.repeat=new kt(1,1),this.center=new kt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new ae,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=d,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(bc).x}get height(){return this.source.getSize(bc).y}get depth(){return this.source.getSize(bc).z}get image(){return this.source.data}set image(t){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.normalized=t.normalized,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let n=t[e];if(n===void 0){Qt(`Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){Qt(`Texture.setValues(): property '${e}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==ph)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case Io:t.x=t.x-Math.floor(t.x);break;case Ii:t.x=t.x<0?0:1;break;case Lo:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case Io:t.y=t.y-Math.floor(t.y);break;case Ii:t.y=t.y<0?0:1;break;case Lo:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};Ln.DEFAULT_IMAGE=null;Ln.DEFAULT_MAPPING=ph;Ln.DEFAULT_ANISOTROPY=1;var Lh=class Lh{constructor(t=0,e=0,n=0,s=1){this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("THREE.Vector4: index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=this.w,a=t.elements;return this.x=a[0]*e+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*e+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*e+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*e+a[7]*n+a[11]*s+a[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r,c=t.elements,h=c[0],d=c[4],_=c[8],u=c[1],m=c[5],M=c[9],T=c[2],v=c[6],g=c[10];if(Math.abs(d-u)<.01&&Math.abs(_-T)<.01&&Math.abs(M-v)<.01){if(Math.abs(d+u)<.1&&Math.abs(_+T)<.1&&Math.abs(M+v)<.1&&Math.abs(h+m+g-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let D=(h+1)/2,E=(m+1)/2,I=(g+1)/2,P=(d+u)/4,U=(_+T)/4,b=(M+v)/4;return D>E&&D>I?D<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(D),s=P/n,r=U/n):E>I?E<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(E),n=P/s,r=b/s):I<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(I),n=U/r,s=b/r),this.set(n,s,r,e),this}let R=Math.sqrt((v-M)*(v-M)+(_-T)*(_-T)+(u-d)*(u-d));return Math.abs(R)<.001&&(R=1),this.x=(v-M)/R,this.y=(_-T)/R,this.z=(u-d)/R,this.w=Math.acos((h+m+g-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Me(this.x,t.x,e.x),this.y=Me(this.y,t.y,e.y),this.z=Me(this.z,t.z,e.z),this.w=Me(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=Me(this.x,t,e),this.y=Me(this.y,t,e),this.z=Me(this.z,t,e),this.w=Me(this.w,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Me(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Lh.prototype.isVector4=!0;var qe=Lh,Fo=class extends Di{constructor(t=1,e=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:wn,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=n.depth,this.scissor=new qe(0,0,t,e),this.scissorTest=!1,this.viewport=new qe(0,0,t,e),this.textures=[];let s={width:t,height:e,depth:n.depth},r=new Ln(s),a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(t={}){let e={minFilter:wn,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),t!==null&&t.renderTarget===null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,n=t.textures.length;e<n;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let s=Object.assign({},t.textures[e].image);this.textures[e].source=new vr(s)}if(this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveColorBuffer=t.resolveColorBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,this.storeMultisampledColorBuffer=t.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=t.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=t.storeMultisampledStencilBuffer,t.depthTexture!==null)if(t.depthTexture.renderTarget===t){let e=t.depthTexture.clone();e.renderTarget=null,this.depthTexture=e}else this.depthTexture=t.depthTexture;return this.samples=t.samples,this.multiview=t.multiview,this.useArrayDepthTexture=t.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Wn=class extends Fo{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}},ia=class extends Ln{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=Mn,this.minFilter=Mn,this.wrapR=Ii,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var Oo=class extends Ln{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=Mn,this.minFilter=Mn,this.wrapR=Ii,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(t){return super.copy(t),this.wrapR=t.wrapR,this}};var ul=class ul{constructor(t,e,n,s,r,a,o,c,h,d,_,u,m,M,T,v){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,c,h,d,_,u,m,M,T,v)}set(t,e,n,s,r,a,o,c,h,d,_,u,m,M,T,v){let g=this.elements;return g[0]=t,g[4]=e,g[8]=n,g[12]=s,g[1]=r,g[5]=a,g[9]=o,g[13]=c,g[2]=h,g[6]=d,g[10]=_,g[14]=u,g[3]=m,g[7]=M,g[11]=T,g[15]=v,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new ul().fromArray(this.elements)}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){let e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return this.determinantAffine()===0?(t.set(1,0,0),e.set(0,1,0),n.set(0,0,1),this):(t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){if(t.determinantAffine()===0)return this.identity();let e=this.elements,n=t.elements,s=1/Ks.setFromMatrixColumn(t,0).length(),r=1/Ks.setFromMatrixColumn(t,1).length(),a=1/Ks.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*a,e[9]=n[9]*a,e[10]=n[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,n=t.x,s=t.y,r=t.z,a=Math.cos(n),o=Math.sin(n),c=Math.cos(s),h=Math.sin(s),d=Math.cos(r),_=Math.sin(r);if(t.order==="XYZ"){let u=a*d,m=a*_,M=o*d,T=o*_;e[0]=c*d,e[4]=-c*_,e[8]=h,e[1]=m+M*h,e[5]=u-T*h,e[9]=-o*c,e[2]=T-u*h,e[6]=M+m*h,e[10]=a*c}else if(t.order==="YXZ"){let u=c*d,m=c*_,M=h*d,T=h*_;e[0]=u+T*o,e[4]=M*o-m,e[8]=a*h,e[1]=a*_,e[5]=a*d,e[9]=-o,e[2]=m*o-M,e[6]=T+u*o,e[10]=a*c}else if(t.order==="ZXY"){let u=c*d,m=c*_,M=h*d,T=h*_;e[0]=u-T*o,e[4]=-a*_,e[8]=M+m*o,e[1]=m+M*o,e[5]=a*d,e[9]=T-u*o,e[2]=-a*h,e[6]=o,e[10]=a*c}else if(t.order==="ZYX"){let u=a*d,m=a*_,M=o*d,T=o*_;e[0]=c*d,e[4]=M*h-m,e[8]=u*h+T,e[1]=c*_,e[5]=T*h+u,e[9]=m*h-M,e[2]=-h,e[6]=o*c,e[10]=a*c}else if(t.order==="YZX"){let u=a*c,m=a*h,M=o*c,T=o*h;e[0]=c*d,e[4]=T-u*_,e[8]=M*_+m,e[1]=_,e[5]=a*d,e[9]=-o*d,e[2]=-h*d,e[6]=m*_+M,e[10]=u-T*_}else if(t.order==="XZY"){let u=a*c,m=a*h,M=o*c,T=o*h;e[0]=c*d,e[4]=-_,e[8]=h*d,e[1]=u*_+T,e[5]=a*d,e[9]=m*_-M,e[2]=M*_-m,e[6]=o*d,e[10]=T*_+u}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(xp,t,vp)}lookAt(t,e,n){let s=this.elements;return jn.subVectors(t,e),jn.lengthSq()===0&&(jn.z=1),jn.normalize(),es.crossVectors(n,jn),es.lengthSq()===0&&(Math.abs(n.z)===1?jn.x+=1e-4:jn.z+=1e-4,jn.normalize(),es.crossVectors(n,jn)),es.normalize(),Za.crossVectors(jn,es),s[0]=es.x,s[4]=Za.x,s[8]=jn.x,s[1]=es.y,s[5]=Za.y,s[9]=jn.y,s[2]=es.z,s[6]=Za.z,s[10]=jn.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[4],c=n[8],h=n[12],d=n[1],_=n[5],u=n[9],m=n[13],M=n[2],T=n[6],v=n[10],g=n[14],R=n[3],D=n[7],E=n[11],I=n[15],P=s[0],U=s[4],b=s[8],C=s[12],O=s[1],H=s[5],Y=s[9],Q=s[13],z=s[2],tt=s[6],dt=s[10],ht=s[14],yt=s[3],rt=s[7],q=s[11],_t=s[15];return r[0]=a*P+o*O+c*z+h*yt,r[4]=a*U+o*H+c*tt+h*rt,r[8]=a*b+o*Y+c*dt+h*q,r[12]=a*C+o*Q+c*ht+h*_t,r[1]=d*P+_*O+u*z+m*yt,r[5]=d*U+_*H+u*tt+m*rt,r[9]=d*b+_*Y+u*dt+m*q,r[13]=d*C+_*Q+u*ht+m*_t,r[2]=M*P+T*O+v*z+g*yt,r[6]=M*U+T*H+v*tt+g*rt,r[10]=M*b+T*Y+v*dt+g*q,r[14]=M*C+T*Q+v*ht+g*_t,r[3]=R*P+D*O+E*z+I*yt,r[7]=R*U+D*H+E*tt+I*rt,r[11]=R*b+D*Y+E*dt+I*q,r[15]=R*C+D*Q+E*ht+I*_t,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],a=t[1],o=t[5],c=t[9],h=t[13],d=t[2],_=t[6],u=t[10],m=t[14],M=t[3],T=t[7],v=t[11],g=t[15],R=c*m-h*u,D=o*m-h*_,E=o*u-c*_,I=a*m-h*d,P=a*u-c*d,U=a*_-o*d;return e*(T*R-v*D+g*E)-n*(M*R-v*I+g*P)+s*(M*D-T*I+g*U)-r*(M*E-T*P+v*U)}determinantAffine(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[1],a=t[5],o=t[9],c=t[2],h=t[6],d=t[10];return e*(a*d-o*h)-n*(r*d-o*c)+s*(r*h-a*c)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){let s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],c=t[6],h=t[7],d=t[8],_=t[9],u=t[10],m=t[11],M=t[12],T=t[13],v=t[14],g=t[15],R=e*o-n*a,D=e*c-s*a,E=e*h-r*a,I=n*c-s*o,P=n*h-r*o,U=s*h-r*c,b=d*T-_*M,C=d*v-u*M,O=d*g-m*M,H=_*v-u*T,Y=_*g-m*T,Q=u*g-m*v,z=R*Q-D*Y+E*H+I*O-P*C+U*b;if(z===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let tt=1/z;return t[0]=(o*Q-c*Y+h*H)*tt,t[1]=(s*Y-n*Q-r*H)*tt,t[2]=(T*U-v*P+g*I)*tt,t[3]=(u*P-_*U-m*I)*tt,t[4]=(c*O-a*Q-h*C)*tt,t[5]=(e*Q-s*O+r*C)*tt,t[6]=(v*E-M*U-g*D)*tt,t[7]=(d*U-u*E+m*D)*tt,t[8]=(a*Y-o*O+h*b)*tt,t[9]=(n*O-e*Y-r*b)*tt,t[10]=(M*P-T*E+g*R)*tt,t[11]=(_*E-d*P-m*R)*tt,t[12]=(o*C-a*H-c*b)*tt,t[13]=(e*H-n*C+s*b)*tt,t[14]=(T*D-M*I-v*R)*tt,t[15]=(d*I-_*D+u*R)*tt,this}scale(t){let e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let n=Math.cos(e),s=Math.sin(e),r=1-n,a=t.x,o=t.y,c=t.z,h=r*a,d=r*o;return this.set(h*a+n,h*o-s*c,h*c+s*o,0,h*o+s*c,d*o+n,d*c-s*a,0,h*c-s*o,d*c+s*a,r*c*c+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,a){return this.set(1,n,r,0,t,1,a,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){let s=this.elements,r=e._x,a=e._y,o=e._z,c=e._w,h=r+r,d=a+a,_=o+o,u=r*h,m=r*d,M=r*_,T=a*d,v=a*_,g=o*_,R=c*h,D=c*d,E=c*_,I=n.x,P=n.y,U=n.z;return s[0]=(1-(T+g))*I,s[1]=(m+E)*I,s[2]=(M-D)*I,s[3]=0,s[4]=(m-E)*P,s[5]=(1-(u+g))*P,s[6]=(v+R)*P,s[7]=0,s[8]=(M+D)*U,s[9]=(v-R)*U,s[10]=(1-(u+T))*U,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){let s=this.elements;t.x=s[12],t.y=s[13],t.z=s[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),e.identity(),this;let a=Ks.set(s[0],s[1],s[2]).length(),o=Ks.set(s[4],s[5],s[6]).length(),c=Ks.set(s[8],s[9],s[10]).length();r<0&&(a=-a),pi.copy(this);let h=1/a,d=1/o,_=1/c;return pi.elements[0]*=h,pi.elements[1]*=h,pi.elements[2]*=h,pi.elements[4]*=d,pi.elements[5]*=d,pi.elements[6]*=d,pi.elements[8]*=_,pi.elements[9]*=_,pi.elements[10]*=_,e.setFromRotationMatrix(pi),n.x=a,n.y=o,n.z=c,this}makePerspective(t,e,n,s,r,a,o=xi,c=!1){let h=this.elements,d=2*r/(e-t),_=2*r/(n-s),u=(e+t)/(e-t),m=(n+s)/(n-s),M,T;if(c)M=r/(a-r),T=a*r/(a-r);else if(o===xi)M=-(a+r)/(a-r),T=-2*a*r/(a-r);else if(o===gr)M=-a/(a-r),T=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return h[0]=d,h[4]=0,h[8]=u,h[12]=0,h[1]=0,h[5]=_,h[9]=m,h[13]=0,h[2]=0,h[6]=0,h[10]=M,h[14]=T,h[3]=0,h[7]=0,h[11]=-1,h[15]=0,this}makeOrthographic(t,e,n,s,r,a,o=xi,c=!1){let h=this.elements,d=2/(e-t),_=2/(n-s),u=-(e+t)/(e-t),m=-(n+s)/(n-s),M,T;if(c)M=1/(a-r),T=a/(a-r);else if(o===xi)M=-2/(a-r),T=-(a+r)/(a-r);else if(o===gr)M=-1/(a-r),T=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return h[0]=d,h[4]=0,h[8]=0,h[12]=u,h[1]=0,h[5]=_,h[9]=0,h[13]=m,h[2]=0,h[6]=0,h[10]=M,h[14]=T,h[3]=0,h[7]=0,h[11]=0,h[15]=1,this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}};ul.prototype.isMatrix4=!0;var Oe=ul,Ks=new N,pi=new Oe,xp=new N(0,0,0),vp=new N(1,1,1),es=new N,Za=new N,jn=new N,xu=new Oe,vu=new li,Zi=class i{constructor(t=0,e=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){let s=t.elements,r=s[0],a=s[4],o=s[8],c=s[1],h=s[5],d=s[9],_=s[2],u=s[6],m=s[10];switch(e){case"XYZ":this._y=Math.asin(Me(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-d,m),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(u,h),this._z=0);break;case"YXZ":this._x=Math.asin(-Me(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(o,m),this._z=Math.atan2(c,h)):(this._y=Math.atan2(-_,r),this._z=0);break;case"ZXY":this._x=Math.asin(Me(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-_,m),this._z=Math.atan2(-a,h)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-Me(_,-1,1)),Math.abs(_)<.9999999?(this._x=Math.atan2(u,m),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-a,h));break;case"YZX":this._z=Math.asin(Me(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-d,h),this._y=Math.atan2(-_,r)):(this._x=0,this._y=Math.atan2(o,m));break;case"XZY":this._z=Math.asin(-Me(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(u,h),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-d,m),this._y=0);break;default:Qt("Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return xu.makeRotationFromQuaternion(t),this.setFromRotationMatrix(xu,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return vu.setFromEuler(this),this.setFromQuaternion(vu,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Zi.DEFAULT_ORDER="XYZ";var yr=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},yp=0,yu=new N,js=new li,Vi=new Oe,$a=new N,Hr=new N,Mp=new N,Sp=new li,Mu=new N(1,0,0),Su=new N(0,1,0),bu=new N(0,0,1),wu={type:"added"},bp={type:"removed"},Qs={type:"childadded",child:null},wc={type:"childremoved",child:null},gn=class i extends Di{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:yp++}),this.uuid=as(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let t=new N,e=new Zi,n=new li,s=new N(1,1,1);function r(){n.setFromEuler(e,!1)}function a(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Oe},normalMatrix:{value:new ae}}),this.matrix=new Oe,this.matrixWorld=new Oe,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new yr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return js.setFromAxisAngle(t,e),this.quaternion.multiply(js),this}rotateOnWorldAxis(t,e){return js.setFromAxisAngle(t,e),this.quaternion.premultiply(js),this}rotateX(t){return this.rotateOnAxis(Mu,t)}rotateY(t){return this.rotateOnAxis(Su,t)}rotateZ(t){return this.rotateOnAxis(bu,t)}translateOnAxis(t,e){return yu.copy(t).applyQuaternion(this.quaternion),this.position.add(yu.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(Mu,t)}translateY(t){return this.translateOnAxis(Su,t)}translateZ(t){return this.translateOnAxis(bu,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Vi.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?$a.copy(t):$a.set(t,e,n);let s=this.parent;this.updateWorldMatrix(!0,!1),Hr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Vi.lookAt(Hr,$a,this.up):Vi.lookAt($a,Hr,this.up),this.quaternion.setFromRotationMatrix(Vi),s&&(Vi.extractRotation(s.matrixWorld),js.setFromRotationMatrix(Vi),this.quaternion.premultiply(js.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(ne("Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(wu),Qs.child=t,this.dispatchEvent(Qs),Qs.child=null):ne("Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(bp),wc.child=t,this.dispatchEvent(wc),wc.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Vi.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Vi.multiply(t.parent.matrixWorld)),t.applyMatrix4(Vi),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(wu),Qs.child=t,this.dispatchEvent(Qs),Qs.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){let a=this.children[n].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Hr,t,Mp),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Hr,Sp,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(t){t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let t=this.pivot;if(t!==null){let e=t.x,n=t.y,s=t.z,r=this.matrix.elements;r[12]+=e-r[0]*e-r[4]*n-r[8]*s,r[13]+=n-r[1]*e-r[5]*n-r[9]*s,r[14]+=s-r[2]*e-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e,n=!1){let s=this.parent;if(t===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),e===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,n)}}toJSON(t){let e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,c){return o[c.uuid]===void 0&&(o[c.uuid]=c.toJSON(t)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let c=o.shapes;if(Array.isArray(c))for(let h=0,d=c.length;h<d;h++){let _=c[h];r(t.shapes,_)}else r(t.shapes,c)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let c=0,h=this.material.length;c<h;c++)o.push(r(t.materials,this.material[c]));s.material=o}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let c=this.animations[o];s.animations.push(r(t.animations,c))}}if(e){let o=a(t.geometries),c=a(t.materials),h=a(t.textures),d=a(t.images),_=a(t.shapes),u=a(t.skeletons),m=a(t.animations),M=a(t.nodes);o.length>0&&(n.geometries=o),c.length>0&&(n.materials=c),h.length>0&&(n.textures=h),d.length>0&&(n.images=d),_.length>0&&(n.shapes=_),u.length>0&&(n.skeletons=u),m.length>0&&(n.animations=m),M.length>0&&(n.nodes=M)}return n.object=s,n;function a(o){let c=[];for(let h in o){let d=o[h];delete d.metadata,c.push(d)}return c}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.pivot=t.pivot!==null?t.pivot.clone():null,this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.static=t.static,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){let s=t.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};gn.DEFAULT_UP=new N(0,1,0);gn.DEFAULT_MATRIX_AUTO_UPDATE=!0;gn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var We=class extends gn{constructor(){super(),this.isGroup=!0,this.type="Group"}},wp={type:"move"},Mr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new We,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new We,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new N,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new N),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new We,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new N,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new N,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,a=null,o=this._targetRay,c=this._grip,h=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(h&&t.hand){a=!0;for(let T of t.hand.values()){let v=e.getJointPose(T,n),g=this._getHandJoint(h,T);v!==null&&(g.matrix.fromArray(v.transform.matrix),g.matrix.decompose(g.position,g.rotation,g.scale),g.matrixWorldNeedsUpdate=!0,g.jointRadius=v.radius),g.visible=v!==null}let d=h.joints["index-finger-tip"],_=h.joints["thumb-tip"],u=d.position.distanceTo(_.position),m=.02,M=.005;h.inputState.pinching&&u>m+M?(h.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!h.inputState.pinching&&u<=m-M&&(h.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else c!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1,c.eventsEnabled&&c.dispatchEvent({type:"gripUpdated",data:t,target:this})));o!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(wp)))}return o!==null&&(o.visible=s!==null),c!==null&&(c.visible=r!==null),h!==null&&(h.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let n=new We;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}},Dd={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ns={h:0,s:0,l:0},Ja={h:0,s:0,l:0};function Tc(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}var jt=class{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){let s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=mn){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,Se.colorSpaceToWorking(this,e),this}setRGB(t,e,n,s=Se.workingColorSpace){return this.r=t,this.g=e,this.b=n,Se.colorSpaceToWorking(this,s),this}setHSL(t,e,n,s=Se.workingColorSpace){if(t=pp(t,1),e=Me(e,0,1),n=Me(n,0,1),e===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+e):n+e-n*e,a=2*n-r;this.r=Tc(a,r,t+1/3),this.g=Tc(a,r,t),this.b=Tc(a,r,t-1/3)}return Se.colorSpaceToWorking(this,s),this}setStyle(t,e=mn){function n(r){r!==void 0&&parseFloat(r)<1&&Qt("Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:Qt("Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(r,16),e);Qt("Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=mn){let n=Dd[t.toLowerCase()];return n!==void 0?this.setHex(n,e):Qt("Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=Yi(t.r),this.g=Yi(t.g),this.b=Yi(t.b),this}copyLinearToSRGB(t){return this.r=pr(t.r),this.g=pr(t.g),this.b=pr(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=mn){return Se.workingToColorSpace(Pn.copy(this),t),Math.round(Me(Pn.r*255,0,255))*65536+Math.round(Me(Pn.g*255,0,255))*256+Math.round(Me(Pn.b*255,0,255))}getHexString(t=mn){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=Se.workingColorSpace){Se.workingToColorSpace(Pn.copy(this),e);let n=Pn.r,s=Pn.g,r=Pn.b,a=Math.max(n,s,r),o=Math.min(n,s,r),c,h,d=(o+a)/2;if(o===a)c=0,h=0;else{let _=a-o;switch(h=d<=.5?_/(a+o):_/(2-a-o),a){case n:c=(s-r)/_+(s<r?6:0);break;case s:c=(r-n)/_+2;break;case r:c=(n-s)/_+4;break}c/=6}return t.h=c,t.s=h,t.l=d,t}getRGB(t,e=Se.workingColorSpace){return Se.workingToColorSpace(Pn.copy(this),e),t.r=Pn.r,t.g=Pn.g,t.b=Pn.b,t}getStyle(t=mn){Se.workingToColorSpace(Pn.copy(this),t);let e=Pn.r,n=Pn.g,s=Pn.b;return t!==mn?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(ns),this.setHSL(ns.h+t,ns.s+e,ns.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(ns),t.getHSL(Ja);let n=vc(ns.h,Ja.h,e),s=vc(ns.s,Ja.s,e),r=vc(ns.l,Ja.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Pn=new jt;jt.NAMES=Dd;var sa=class extends gn{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Zi,this.environmentIntensity=1,this.environmentRotation=new Zi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),e.object.backgroundBlurriness=this.backgroundBlurriness,e.object.backgroundIntensity=this.backgroundIntensity,e.object.backgroundRotation=this.backgroundRotation.toArray(),e.object.environmentIntensity=this.environmentIntensity,e.object.environmentRotation=this.environmentRotation.toArray(),e}},mi=new N,Gi=new N,Ac=new N,Hi=new N,tr=new N,er=new N,Tu=new N,Ec=new N,Cc=new N,Rc=new N,Pc=new qe,Ic=new qe,Lc=new qe,qi=class i{constructor(t=new N,e=new N,n=new N){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),mi.subVectors(t,e),s.cross(mi);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){mi.subVectors(s,e),Gi.subVectors(n,e),Ac.subVectors(t,e);let a=mi.dot(mi),o=mi.dot(Gi),c=mi.dot(Ac),h=Gi.dot(Gi),d=Gi.dot(Ac),_=a*h-o*o;if(_===0)return r.set(0,0,0),null;let u=1/_,m=(h*c-o*d)*u,M=(a*d-o*c)*u;return r.set(1-m-M,M,m)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,Hi)===null?!1:Hi.x>=0&&Hi.y>=0&&Hi.x+Hi.y<=1}static getInterpolation(t,e,n,s,r,a,o,c){return this.getBarycoord(t,e,n,s,Hi)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,Hi.x),c.addScaledVector(a,Hi.y),c.addScaledVector(o,Hi.z),c)}static getInterpolatedAttribute(t,e,n,s,r,a){return Pc.setScalar(0),Ic.setScalar(0),Lc.setScalar(0),Pc.fromBufferAttribute(t,e),Ic.fromBufferAttribute(t,n),Lc.fromBufferAttribute(t,s),a.setScalar(0),a.addScaledVector(Pc,r.x),a.addScaledVector(Ic,r.y),a.addScaledVector(Lc,r.z),a}static isFrontFacing(t,e,n,s){return mi.subVectors(n,e),Gi.subVectors(t,e),mi.cross(Gi).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return mi.subVectors(this.c,this.b),Gi.subVectors(this.a,this.b),mi.cross(Gi).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return i.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return i.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return i.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return i.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return i.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let n=this.a,s=this.b,r=this.c,a,o;tr.subVectors(s,n),er.subVectors(r,n),Ec.subVectors(t,n);let c=tr.dot(Ec),h=er.dot(Ec);if(c<=0&&h<=0)return e.copy(n);Cc.subVectors(t,s);let d=tr.dot(Cc),_=er.dot(Cc);if(d>=0&&_<=d)return e.copy(s);let u=c*_-d*h;if(u<=0&&c>=0&&d<=0)return a=c/(c-d),e.copy(n).addScaledVector(tr,a);Rc.subVectors(t,r);let m=tr.dot(Rc),M=er.dot(Rc);if(M>=0&&m<=M)return e.copy(r);let T=m*h-c*M;if(T<=0&&h>=0&&M<=0)return o=h/(h-M),e.copy(n).addScaledVector(er,o);let v=d*M-m*_;if(v<=0&&_-d>=0&&m-M>=0)return Tu.subVectors(r,s),o=(_-d)/(_-d+(m-M)),e.copy(s).addScaledVector(Tu,o);let g=1/(v+T+u);return a=T*g,o=u*g,e.copy(n).addScaledVector(tr,a).addScaledVector(er,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},os=class{constructor(t=new N(1/0,1/0,1/0),e=new N(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(gi.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(gi.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let n=gi.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let n=t.geometry;if(n!==void 0){let r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)t.isMesh===!0?t.getVertexPosition(a,gi):gi.fromBufferAttribute(r,a),gi.applyMatrix4(t.matrixWorld),this.expandByPoint(gi);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Ka.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Ka.copy(n.boundingBox)),Ka.applyMatrix4(t.matrixWorld),this.union(Ka)}let s=t.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,gi),gi.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Wr),ja.subVectors(this.max,Wr),nr.subVectors(t.a,Wr),ir.subVectors(t.b,Wr),sr.subVectors(t.c,Wr),is.subVectors(ir,nr),ss.subVectors(sr,ir),Rs.subVectors(nr,sr);let e=[0,-is.z,is.y,0,-ss.z,ss.y,0,-Rs.z,Rs.y,is.z,0,-is.x,ss.z,0,-ss.x,Rs.z,0,-Rs.x,-is.y,is.x,0,-ss.y,ss.x,0,-Rs.y,Rs.x,0];return!Dc(e,nr,ir,sr,ja)||(e=[1,0,0,0,1,0,0,0,1],!Dc(e,nr,ir,sr,ja))?!1:(Qa.crossVectors(is,ss),e=[Qa.x,Qa.y,Qa.z],Dc(e,nr,ir,sr,ja))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,gi).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(gi).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(Wi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),Wi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),Wi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),Wi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),Wi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),Wi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),Wi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),Wi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(Wi),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},Wi=[new N,new N,new N,new N,new N,new N,new N,new N],gi=new N,Ka=new os,nr=new N,ir=new N,sr=new N,is=new N,ss=new N,Rs=new N,Wr=new N,ja=new N,Qa=new N,Ps=new N;function Dc(i,t,e,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){Ps.fromArray(i,r);let o=s.x*Math.abs(Ps.x)+s.y*Math.abs(Ps.y)+s.z*Math.abs(Ps.z),c=t.dot(Ps),h=e.dot(Ps),d=n.dot(Ps);if(Math.max(-Math.max(c,h,d),Math.min(c,h,d))>o)return!1}return!0}var un=new N,to=new kt,Tp=0,ti=class extends Di{constructor(t,e,n=!1){if(super(),Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Tp++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=Sh,this.updateRanges=[],this.gpuType=wi,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)to.fromBufferAttribute(this,e),to.applyMatrix3(t),this.setXY(e,to.x,to.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)un.fromBufferAttribute(this,e),un.applyMatrix3(t),this.setXYZ(e,un.x,un.y,un.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)un.fromBufferAttribute(this,e),un.applyMatrix4(t),this.setXYZ(e,un.x,un.y,un.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)un.fromBufferAttribute(this,e),un.applyNormalMatrix(t),this.setXYZ(e,un.x,un.y,un.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)un.fromBufferAttribute(this,e),un.transformDirection(t),this.setXYZ(e,un.x,un.y,un.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=Pi(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=Fe(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=Pi(e,this.array)),e}setX(t,e){return this.normalized&&(e=Fe(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=Pi(e,this.array)),e}setY(t,e){return this.normalized&&(e=Fe(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=Pi(e,this.array)),e}setZ(t,e){return this.normalized&&(e=Fe(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=Pi(e,this.array)),e}setW(t,e){return this.normalized&&(e=Fe(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=Fe(e,this.array),n=Fe(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=Fe(e,this.array),n=Fe(n,this.array),s=Fe(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=Fe(e,this.array),n=Fe(n,this.array),s=Fe(s,this.array),r=Fe(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return t.name=this.name,t.usage=this.usage,t.gpuType=this.gpuType,t}dispose(){this.dispatchEvent({type:"dispose"})}};var ra=class extends ti{constructor(t,e,n){super(new Uint16Array(t),e,n)}};var aa=class extends ti{constructor(t,e,n){super(new Uint32Array(t),e,n)}};var se=class extends ti{constructor(t,e,n){super(new Float32Array(t),e,n)}},Ap=new os,Xr=new N,Nc=new N,ls=class{constructor(t=new N,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let n=this.center;e!==void 0?n.copy(e):Ap.setFromPoints(t).getCenter(n);let s=0;for(let r=0,a=t.length;r<a;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;Xr.subVectors(t,this.center);let e=Xr.lengthSq();if(e>this.radius*this.radius){let n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(Xr,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Nc.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(Xr.copy(t.center).add(Nc)),this.expandByPoint(Xr.copy(t.center).sub(Nc))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},Ep=0,oi=new Oe,Uc=new gn,rr=new N,Qn=new os,qr=new os,yn=new N,Ie=class i extends Di{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Ep++}),this.uuid=as(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(dp(t)?aa:ra)(t,1):this.index=t,this}setIndirect(t,e=0){return this.indirect=t,this.indirectOffset=e,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new ae().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(t){return oi.makeRotationFromQuaternion(t),this.applyMatrix4(oi),this}rotateX(t){return oi.makeRotationX(t),this.applyMatrix4(oi),this}rotateY(t){return oi.makeRotationY(t),this.applyMatrix4(oi),this}rotateZ(t){return oi.makeRotationZ(t),this.applyMatrix4(oi),this}translate(t,e,n){return oi.makeTranslation(t,e,n),this.applyMatrix4(oi),this}scale(t,e,n){return oi.makeScale(t,e,n),this.applyMatrix4(oi),this}lookAt(t){return Uc.lookAt(t),Uc.updateMatrix(),this.applyMatrix4(Uc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(rr).negate(),this.translate(rr.x,rr.y,rr.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let n=[];for(let s=0,r=t.length;s<r;s++){let a=t[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new se(n,3))}else{let n=Math.min(t.length,e.count);for(let s=0;s<n;s++){let r=t[s];e.setXYZ(s,r.x,r.y,r.z||0)}t.length>e.count&&Qt("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new os);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){ne("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new N(-1/0,-1/0,-1/0),new N(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){let r=e[n];Qn.setFromBufferAttribute(r),this.morphTargetsRelative?(yn.addVectors(this.boundingBox.min,Qn.min),this.boundingBox.expandByPoint(yn),yn.addVectors(this.boundingBox.max,Qn.max),this.boundingBox.expandByPoint(yn)):(this.boundingBox.expandByPoint(Qn.min),this.boundingBox.expandByPoint(Qn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&ne('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ls);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){ne("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new N,1/0);return}if(t){let n=this.boundingSphere.center;if(Qn.setFromBufferAttribute(t),e)for(let r=0,a=e.length;r<a;r++){let o=e[r];qr.setFromBufferAttribute(o),this.morphTargetsRelative?(yn.addVectors(Qn.min,qr.min),Qn.expandByPoint(yn),yn.addVectors(Qn.max,qr.max),Qn.expandByPoint(yn)):(Qn.expandByPoint(qr.min),Qn.expandByPoint(qr.max))}Qn.getCenter(n);let s=0;for(let r=0,a=t.count;r<a;r++)yn.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(yn));if(e)for(let r=0,a=e.length;r<a;r++){let o=e[r],c=this.morphTargetsRelative;for(let h=0,d=o.count;h<d;h++)yn.fromBufferAttribute(o,h),c&&(rr.fromBufferAttribute(t,h),yn.add(rr)),s=Math.max(s,n.distanceToSquared(yn))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&ne('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){ne("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=e.position,s=e.normal,r=e.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new ti(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));let o=[],c=[];for(let b=0;b<n.count;b++)o[b]=new N,c[b]=new N;let h=new N,d=new N,_=new N,u=new kt,m=new kt,M=new kt,T=new N,v=new N;function g(b,C,O){h.fromBufferAttribute(n,b),d.fromBufferAttribute(n,C),_.fromBufferAttribute(n,O),u.fromBufferAttribute(r,b),m.fromBufferAttribute(r,C),M.fromBufferAttribute(r,O),d.sub(h),_.sub(h),m.sub(u),M.sub(u);let H=1/(m.x*M.y-M.x*m.y);isFinite(H)&&(T.copy(d).multiplyScalar(M.y).addScaledVector(_,-m.y).multiplyScalar(H),v.copy(_).multiplyScalar(m.x).addScaledVector(d,-M.x).multiplyScalar(H),o[b].add(T),o[C].add(T),o[O].add(T),c[b].add(v),c[C].add(v),c[O].add(v))}let R=this.groups;R.length===0&&(R=[{start:0,count:t.count}]);for(let b=0,C=R.length;b<C;++b){let O=R[b],H=O.start,Y=O.count;for(let Q=H,z=H+Y;Q<z;Q+=3)g(t.getX(Q+0),t.getX(Q+1),t.getX(Q+2))}let D=new N,E=new N,I=new N,P=new N;function U(b){I.fromBufferAttribute(s,b),P.copy(I);let C=o[b];D.copy(C),D.sub(I.multiplyScalar(I.dot(C))).normalize(),E.crossVectors(P,C);let H=E.dot(c[b])<0?-1:1;a.setXYZW(b,D.x,D.y,D.z,H)}for(let b=0,C=R.length;b<C;++b){let O=R[b],H=O.start,Y=O.count;for(let Q=H,z=H+Y;Q<z;Q+=3)U(t.getX(Q+0)),U(t.getX(Q+1)),U(t.getX(Q+2))}this._transformed=!0}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==e.count)n=new ti(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let u=0,m=n.count;u<m;u++)n.setXYZ(u,0,0,0);let s=new N,r=new N,a=new N,o=new N,c=new N,h=new N,d=new N,_=new N;if(t)for(let u=0,m=t.count;u<m;u+=3){let M=t.getX(u+0),T=t.getX(u+1),v=t.getX(u+2);s.fromBufferAttribute(e,M),r.fromBufferAttribute(e,T),a.fromBufferAttribute(e,v),d.subVectors(a,r),_.subVectors(s,r),d.cross(_),o.fromBufferAttribute(n,M),c.fromBufferAttribute(n,T),h.fromBufferAttribute(n,v),o.add(d),c.add(d),h.add(d),n.setXYZ(M,o.x,o.y,o.z),n.setXYZ(T,c.x,c.y,c.z),n.setXYZ(v,h.x,h.y,h.z)}else for(let u=0,m=e.count;u<m;u+=3)s.fromBufferAttribute(e,u+0),r.fromBufferAttribute(e,u+1),a.fromBufferAttribute(e,u+2),d.subVectors(a,r),_.subVectors(s,r),d.cross(_),n.setXYZ(u+0,d.x,d.y,d.z),n.setXYZ(u+1,d.x,d.y,d.z),n.setXYZ(u+2,d.x,d.y,d.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)yn.fromBufferAttribute(t,e),yn.normalize(),t.setXYZ(e,yn.x,yn.y,yn.z)}toNonIndexed(){function t(o,c){let h=o.array,d=o.itemSize,_=o.normalized,u=new h.constructor(c.length*d),m=0,M=0;for(let T=0,v=c.length;T<v;T++){o.isInterleavedBufferAttribute?m=c[T]*o.data.stride+o.offset:m=c[T]*d;for(let g=0;g<d;g++)u[M++]=h[m++]}return new ti(u,d,_)}if(this.index===null)return Qt("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new i,n=this.index.array,s=this.attributes;for(let o in s){let c=s[o],h=t(c,n);e.setAttribute(o,h)}let r=this.morphAttributes;for(let o in r){let c=[],h=r[o];for(let d=0,_=h.length;d<_;d++){let u=h[d],m=t(u,n);c.push(m)}e.morphAttributes[o]=c}e.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,c=a.length;o<c;o++){let h=a[o];e.addGroup(h.start,h.count,h.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,t.name=this.name,Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let c=this.parameters;for(let h in c)c[h]!==void 0&&(t[h]=c[h]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let n=this.attributes;for(let c in n){let h=n[c];t.data.attributes[c]=h.toJSON(t.data)}let s={},r=!1;for(let c in this.morphAttributes){let h=this.morphAttributes[c],d=[];for(let _=0,u=h.length;_<u;_++){let m=h[_];d.push(m.toJSON(t.data))}d.length>0&&(s[c]=d,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(t.data.boundingSphere=o.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let n=t.index;n!==null&&this.setIndex(n.clone());let s=t.attributes;for(let h in s){let d=s[h];this.setAttribute(h,d.clone(e))}let r=t.morphAttributes;for(let h in r){let d=[],_=r[h];for(let u=0,m=_.length;u<m;u++)d.push(_[u].clone(e));this.morphAttributes[h]=d}this.morphTargetsRelative=t.morphTargetsRelative;let a=t.groups;for(let h=0,d=a.length;h<d;h++){let _=a[h];this.addGroup(_.start,_.count,_.materialIndex)}let o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());let c=t.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this._transformed=t._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},Bo=class{constructor(t,e){this.isInterleavedBuffer=!0,this.array=t,this.stride=e,this.count=t!==void 0?t.length/e:0,this.usage=Sh,this.updateRanges=[],this.version=0,this.uuid=as()}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.array=new t.array.constructor(t.array),this.count=t.count,this.stride=t.stride,this.usage=t.usage,this}copyAt(t,e,n){t*=this.stride,n*=e.stride;for(let s=0,r=this.stride;s<r;s++)this.array[t+s]=e.array[n+s];return this}set(t,e=0){return this.array.set(t,e),this}clone(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=as()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let e=new this.array.constructor(t.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(e,this.stride);return n.setUsage(this.usage),n}onUpload(t){return this.onUploadCallback=t,this}toJSON(t){t.arrayBuffers===void 0&&(t.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=as()),t.arrayBuffers[this.array.buffer._uuid]===void 0&&(t.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer)));let e={uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride};return e.usage=this.usage,e}},On=new N,oa=class i{constructor(t,e,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=t,this.itemSize=e,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(t){this.data.needsUpdate=t}applyMatrix4(t){for(let e=0,n=this.data.count;e<n;e++)On.fromBufferAttribute(this,e),On.applyMatrix4(t),this.setXYZ(e,On.x,On.y,On.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)On.fromBufferAttribute(this,e),On.applyNormalMatrix(t),this.setXYZ(e,On.x,On.y,On.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)On.fromBufferAttribute(this,e),On.transformDirection(t),this.setXYZ(e,On.x,On.y,On.z);return this}getComponent(t,e){let n=this.array[t*this.data.stride+this.offset+e];return this.normalized&&(n=Pi(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=Fe(n,this.array)),this.data.array[t*this.data.stride+this.offset+e]=n,this}setX(t,e){return this.normalized&&(e=Fe(e,this.array)),this.data.array[t*this.data.stride+this.offset]=e,this}setY(t,e){return this.normalized&&(e=Fe(e,this.array)),this.data.array[t*this.data.stride+this.offset+1]=e,this}setZ(t,e){return this.normalized&&(e=Fe(e,this.array)),this.data.array[t*this.data.stride+this.offset+2]=e,this}setW(t,e){return this.normalized&&(e=Fe(e,this.array)),this.data.array[t*this.data.stride+this.offset+3]=e,this}getX(t){let e=this.data.array[t*this.data.stride+this.offset];return this.normalized&&(e=Pi(e,this.array)),e}getY(t){let e=this.data.array[t*this.data.stride+this.offset+1];return this.normalized&&(e=Pi(e,this.array)),e}getZ(t){let e=this.data.array[t*this.data.stride+this.offset+2];return this.normalized&&(e=Pi(e,this.array)),e}getW(t){let e=this.data.array[t*this.data.stride+this.offset+3];return this.normalized&&(e=Pi(e,this.array)),e}setXY(t,e,n){return t=t*this.data.stride+this.offset,this.normalized&&(e=Fe(e,this.array),n=Fe(n,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this}setXYZ(t,e,n,s){return t=t*this.data.stride+this.offset,this.normalized&&(e=Fe(e,this.array),n=Fe(n,this.array),s=Fe(s,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t=t*this.data.stride+this.offset,this.normalized&&(e=Fe(e,this.array),n=Fe(n,this.array),s=Fe(s,this.array),r=Fe(r,this.array)),this.data.array[t+0]=e,this.data.array[t+1]=n,this.data.array[t+2]=s,this.data.array[t+3]=r,this}clone(t){if(t===void 0){na("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return new ti(new this.array.constructor(e),this.itemSize,this.normalized)}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.clone(t)),new i(t.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(t){if(t===void 0){na("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let e=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)e.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:e,normalized:this.normalized}}else return t.interleavedBuffers===void 0&&(t.interleavedBuffers={}),t.interleavedBuffers[this.data.uuid]===void 0&&(t.interleavedBuffers[this.data.uuid]=this.data.toJSON(t)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},Fc=new N,Cp=new N,Rp=new ae,_i=class{constructor(t=new N(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){let s=Fc.subVectors(n,e).cross(Cp.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e,n=!0){let s=t.delta(Fc),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let a=-(t.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:e.copy(t.start).addScaledVector(s,a)}intersectsLine(t){let e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let n=e||Rp.getNormalMatrix(t),s=this.coplanarPoint(Fc).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(t){return this.normal.fromArray(t.normal),this.constant=t.constant,this}},Pp=0,vi=class extends Di{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Pp++}),this.uuid=as(),this.name="",this.type="Material",this.blending=ys,this.side=vs,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=rh,this.blendDst=ah,this.blendEquation=ks,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new jt(0,0,0),this.blendAlpha=0,this.depthFunc=mr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Sd,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=So,this.stencilZFail=So,this.stencilZPass=So,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let n=t[e];if(n===void 0){Qt(`Material: parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){Qt(`Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let a=[];for(let o in r){let c=r[o];delete c.metadata,a.push(c)}return a}if(e){let r=s(t.textures),a=s(t.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}fromJSON(t,e){if(t.uuid!==void 0&&(this.uuid=t.uuid),t.name!==void 0&&(this.name=t.name),t.color!==void 0&&this.color!==void 0&&this.color.setHex(t.color),t.roughness!==void 0&&(this.roughness=t.roughness),t.metalness!==void 0&&(this.metalness=t.metalness),t.sheen!==void 0&&(this.sheen=t.sheen),t.sheenColor!==void 0&&(this.sheenColor=new jt().setHex(t.sheenColor)),t.sheenRoughness!==void 0&&(this.sheenRoughness=t.sheenRoughness),t.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(t.emissive),t.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(t.specular),t.specularIntensity!==void 0&&(this.specularIntensity=t.specularIntensity),t.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(t.specularColor),t.shininess!==void 0&&(this.shininess=t.shininess),t.clearcoat!==void 0&&(this.clearcoat=t.clearcoat),t.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=t.clearcoatRoughness),t.dispersion!==void 0&&(this.dispersion=t.dispersion),t.retroreflectivity!==void 0&&(this.retroreflectivity=t.retroreflectivity),t.iridescence!==void 0&&(this.iridescence=t.iridescence),t.iridescenceIOR!==void 0&&(this.iridescenceIOR=t.iridescenceIOR),t.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=t.iridescenceThicknessRange),t.transmission!==void 0&&(this.transmission=t.transmission),t.thickness!==void 0&&(this.thickness=t.thickness),t.attenuationDistance!==void 0&&(this.attenuationDistance=t.attenuationDistance),t.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(t.attenuationColor),t.anisotropy!==void 0&&(this.anisotropy=t.anisotropy),t.anisotropyRotation!==void 0&&(this.anisotropyRotation=t.anisotropyRotation),t.fog!==void 0&&(this.fog=t.fog),t.flatShading!==void 0&&(this.flatShading=t.flatShading),t.blending!==void 0&&(this.blending=t.blending),t.combine!==void 0&&(this.combine=t.combine),t.side!==void 0&&(this.side=t.side),t.shadowSide!==void 0&&(this.shadowSide=t.shadowSide),t.opacity!==void 0&&(this.opacity=t.opacity),t.transparent!==void 0&&(this.transparent=t.transparent),t.alphaTest!==void 0&&(this.alphaTest=t.alphaTest),t.alphaHash!==void 0&&(this.alphaHash=t.alphaHash),t.depthFunc!==void 0&&(this.depthFunc=t.depthFunc),t.depthTest!==void 0&&(this.depthTest=t.depthTest),t.depthWrite!==void 0&&(this.depthWrite=t.depthWrite),t.colorWrite!==void 0&&(this.colorWrite=t.colorWrite),t.clippingPlanes!==void 0&&(this.clippingPlanes=t.clippingPlanes.map(n=>new _i().fromJSON(n))),t.clipIntersection!==void 0&&(this.clipIntersection=t.clipIntersection),t.clipShadows!==void 0&&(this.clipShadows=t.clipShadows),t.depthPacking!==void 0&&(this.depthPacking=t.depthPacking),t.blendSrc!==void 0&&(this.blendSrc=t.blendSrc),t.blendDst!==void 0&&(this.blendDst=t.blendDst),t.blendEquation!==void 0&&(this.blendEquation=t.blendEquation),t.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=t.blendSrcAlpha),t.blendDstAlpha!==void 0&&(this.blendDstAlpha=t.blendDstAlpha),t.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=t.blendEquationAlpha),t.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(t.blendColor),t.blendAlpha!==void 0&&(this.blendAlpha=t.blendAlpha),t.stencilWriteMask!==void 0&&(this.stencilWriteMask=t.stencilWriteMask),t.stencilFunc!==void 0&&(this.stencilFunc=t.stencilFunc),t.stencilRef!==void 0&&(this.stencilRef=t.stencilRef),t.stencilFuncMask!==void 0&&(this.stencilFuncMask=t.stencilFuncMask),t.stencilFail!==void 0&&(this.stencilFail=t.stencilFail),t.stencilZFail!==void 0&&(this.stencilZFail=t.stencilZFail),t.stencilZPass!==void 0&&(this.stencilZPass=t.stencilZPass),t.stencilWrite!==void 0&&(this.stencilWrite=t.stencilWrite),t.wireframe!==void 0&&(this.wireframe=t.wireframe),t.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=t.wireframeLinewidth),t.wireframeLinecap!==void 0&&(this.wireframeLinecap=t.wireframeLinecap),t.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=t.wireframeLinejoin),t.rotation!==void 0&&(this.rotation=t.rotation),t.linewidth!==void 0&&(this.linewidth=t.linewidth),t.linecap!==void 0&&(this.linecap=t.linecap),t.linejoin!==void 0&&(this.linejoin=t.linejoin),t.dashSize!==void 0&&(this.dashSize=t.dashSize),t.gapSize!==void 0&&(this.gapSize=t.gapSize),t.scale!==void 0&&(this.scale=t.scale),t.polygonOffset!==void 0&&(this.polygonOffset=t.polygonOffset),t.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=t.polygonOffsetFactor),t.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=t.polygonOffsetUnits),t.dithering!==void 0&&(this.dithering=t.dithering),t.alphaToCoverage!==void 0&&(this.alphaToCoverage=t.alphaToCoverage),t.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=t.premultipliedAlpha),t.forceSinglePass!==void 0&&(this.forceSinglePass=t.forceSinglePass),t.allowOverride!==void 0&&(this.allowOverride=t.allowOverride),t.visible!==void 0&&(this.visible=t.visible),t.toneMapped!==void 0&&(this.toneMapped=t.toneMapped),t.userData!==void 0&&(this.userData=t.userData),t.vertexColors!==void 0&&(typeof t.vertexColors=="number"?this.vertexColors=t.vertexColors>0:this.vertexColors=t.vertexColors),t.size!==void 0&&(this.size=t.size),t.sizeAttenuation!==void 0&&(this.sizeAttenuation=t.sizeAttenuation),t.map!==void 0&&(this.map=e[t.map]||null),t.matcap!==void 0&&(this.matcap=e[t.matcap]||null),t.alphaMap!==void 0&&(this.alphaMap=e[t.alphaMap]||null),t.bumpMap!==void 0&&(this.bumpMap=e[t.bumpMap]||null),t.bumpScale!==void 0&&(this.bumpScale=t.bumpScale),t.normalMap!==void 0&&(this.normalMap=e[t.normalMap]||null),t.normalMapType!==void 0&&(this.normalMapType=t.normalMapType),t.normalScale!==void 0){let n=t.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new kt().fromArray(n)}return t.displacementMap!==void 0&&(this.displacementMap=e[t.displacementMap]||null),t.displacementScale!==void 0&&(this.displacementScale=t.displacementScale),t.displacementBias!==void 0&&(this.displacementBias=t.displacementBias),t.roughnessMap!==void 0&&(this.roughnessMap=e[t.roughnessMap]||null),t.metalnessMap!==void 0&&(this.metalnessMap=e[t.metalnessMap]||null),t.emissiveMap!==void 0&&(this.emissiveMap=e[t.emissiveMap]||null),t.emissiveIntensity!==void 0&&(this.emissiveIntensity=t.emissiveIntensity),t.specularMap!==void 0&&(this.specularMap=e[t.specularMap]||null),t.specularIntensityMap!==void 0&&(this.specularIntensityMap=e[t.specularIntensityMap]||null),t.specularColorMap!==void 0&&(this.specularColorMap=e[t.specularColorMap]||null),t.envMap!==void 0&&(this.envMap=e[t.envMap]||null),t.envMapRotation!==void 0&&this.envMapRotation.fromArray(t.envMapRotation),t.envMapIntensity!==void 0&&(this.envMapIntensity=t.envMapIntensity),t.reflectivity!==void 0&&(this.reflectivity=t.reflectivity),t.refractionRatio!==void 0&&(this.refractionRatio=t.refractionRatio),t.lightMap!==void 0&&(this.lightMap=e[t.lightMap]||null),t.lightMapIntensity!==void 0&&(this.lightMapIntensity=t.lightMapIntensity),t.aoMap!==void 0&&(this.aoMap=e[t.aoMap]||null),t.aoMapIntensity!==void 0&&(this.aoMapIntensity=t.aoMapIntensity),t.gradientMap!==void 0&&(this.gradientMap=e[t.gradientMap]||null),t.clearcoatMap!==void 0&&(this.clearcoatMap=e[t.clearcoatMap]||null),t.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=e[t.clearcoatRoughnessMap]||null),t.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=e[t.clearcoatNormalMap]||null),t.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new kt().fromArray(t.clearcoatNormalScale)),t.iridescenceMap!==void 0&&(this.iridescenceMap=e[t.iridescenceMap]||null),t.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=e[t.iridescenceThicknessMap]||null),t.transmissionMap!==void 0&&(this.transmissionMap=e[t.transmissionMap]||null),t.thicknessMap!==void 0&&(this.thicknessMap=e[t.thicknessMap]||null),t.anisotropyMap!==void 0&&(this.anisotropyMap=e[t.anisotropyMap]||null),t.sheenColorMap!==void 0&&(this.sheenColorMap=e[t.sheenColorMap]||null),t.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=e[t.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,n=null;if(e!==null){let s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.allowOverride=t.allowOverride,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}},ci=class extends vi{constructor(t){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new jt(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.rotation=t.rotation,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},ar,Yr=new N,or=new N,lr=new N,cr=new kt,Zr=new kt,Nd=new Oe,eo=new N,$r=new N,no=new N,Au=new kt,Oc=new kt,Eu=new kt,yi=class extends gn{constructor(t=new ci){if(super(),this.isSprite=!0,this.type="Sprite",ar===void 0){ar=new Ie;let e=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new Bo(e,5);ar.setIndex([0,1,2,0,2,3]),ar.setAttribute("position",new oa(n,3,0,!1)),ar.setAttribute("uv",new oa(n,2,3,!1))}this.geometry=ar,this.material=t,this.center=new kt(.5,.5),this.count=1}intersectsFrustum(t){return t.intersectsSprite(this)}raycast(t,e){t.camera===null&&ne('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),or.setFromMatrixScale(this.matrixWorld),Nd.copy(t.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(t.camera.matrixWorldInverse,this.matrixWorld),lr.setFromMatrixPosition(this.modelViewMatrix),t.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&or.multiplyScalar(-lr.z);let n=this.material.rotation,s,r;n!==0&&(r=Math.cos(n),s=Math.sin(n));let a=this.center;io(eo.set(-.5,-.5,0),lr,a,or,s,r),io($r.set(.5,-.5,0),lr,a,or,s,r),io(no.set(.5,.5,0),lr,a,or,s,r),Au.set(0,0),Oc.set(1,0),Eu.set(1,1);let o=t.ray.intersectTriangle(eo,$r,no,!1,Yr);if(o===null&&(io($r.set(-.5,.5,0),lr,a,or,s,r),Oc.set(0,1),o=t.ray.intersectTriangle(eo,no,$r,!1,Yr),o===null))return;let c=t.ray.origin.distanceTo(Yr);c<t.near||c>t.far||e.push({distance:c,point:Yr.clone(),uv:qi.getInterpolation(Yr,eo,$r,no,Au,Oc,Eu,new kt),face:null,object:this})}copy(t,e){return super.copy(t,e),t.center!==void 0&&this.center.copy(t.center),this.material=t.material,this}};function io(i,t,e,n,s,r){cr.subVectors(i,e).addScalar(.5).multiply(n),s!==void 0?(Zr.x=r*cr.x-s*cr.y,Zr.y=s*cr.x+r*cr.y):Zr.copy(cr),i.copy(t),i.x+=Zr.x,i.y+=Zr.y,i.applyMatrix4(Nd)}var Xi=new N,Bc=new N,so=new N,ro=new N,Ns=class{constructor(t=new N,e=new N(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Xi)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=Xi.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Xi.copy(this.origin).addScaledVector(this.direction,e),Xi.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){Bc.copy(t).add(e).multiplyScalar(.5),so.copy(e).sub(t).normalize(),ro.copy(this.origin).sub(Bc);let r=t.distanceTo(e)*.5,a=-this.direction.dot(so),o=ro.dot(this.direction),c=-ro.dot(so),h=ro.lengthSq(),d=Math.abs(1-a*a),_,u,m,M;if(d>0)if(_=a*c-o,u=a*o-c,M=r*d,_>=0)if(u>=-M)if(u<=M){let T=1/d;_*=T,u*=T,m=_*(_+a*u+2*o)+u*(a*_+u+2*c)+h}else u=r,_=Math.max(0,-(a*u+o)),m=-_*_+u*(u+2*c)+h;else u=-r,_=Math.max(0,-(a*u+o)),m=-_*_+u*(u+2*c)+h;else u<=-M?(_=Math.max(0,-(-a*r+o)),u=_>0?-r:Math.min(Math.max(-r,-c),r),m=-_*_+u*(u+2*c)+h):u<=M?(_=0,u=Math.min(Math.max(-r,-c),r),m=u*(u+2*c)+h):(_=Math.max(0,-(a*r+o)),u=_>0?r:Math.min(Math.max(-r,-c),r),m=-_*_+u*(u+2*c)+h);else u=a>0?-r:r,_=Math.max(0,-(a*u+o)),m=-_*_+u*(u+2*c)+h;return n&&n.copy(this.origin).addScaledVector(this.direction,_),s&&s.copy(Bc).addScaledVector(so,u),m}intersectSphere(t,e){if(t.radius<0)return null;Xi.subVectors(t.center,this.origin);let n=Xi.dot(this.direction),s=Xi.dot(Xi)-n*n,r=t.radius*t.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=n-a,c=n+a;return c<0?null:o<0?this.at(c,e):this.at(o,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){let n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,a,o,c,h=1/this.direction.x,d=1/this.direction.y,_=1/this.direction.z,u=this.origin;return h>=0?(n=(t.min.x-u.x)*h,s=(t.max.x-u.x)*h):(n=(t.max.x-u.x)*h,s=(t.min.x-u.x)*h),d>=0?(r=(t.min.y-u.y)*d,a=(t.max.y-u.y)*d):(r=(t.max.y-u.y)*d,a=(t.min.y-u.y)*d),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),_>=0?(o=(t.min.z-u.z)*_,c=(t.max.z-u.z)*_):(o=(t.max.z-u.z)*_,c=(t.min.z-u.z)*_),n>c||o>s)||((o>n||n!==n)&&(n=o),(c<s||s!==s)&&(s=c),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,Xi)!==null}intersectTriangle(t,e,n,s,r){let a=this.origin,o=this.direction,c=o.x,h=o.y,d=o.z,_=t.x-a.x,u=t.y-a.y,m=t.z-a.z,M=e.x-a.x,T=e.y-a.y,v=e.z-a.z,g=n.x-a.x,R=n.y-a.y,D=n.z-a.z,E=Math.abs(c),I=Math.abs(h),P=Math.abs(d),U,b,C,O,H,Y,Q,z,tt,dt,ht,yt;if(E>=I&&E>=P?(C=c,Y=_,tt=M,yt=g,c>=0?(U=h,b=d,O=u,H=m,Q=T,z=v,dt=R,ht=D):(U=d,b=h,O=m,H=u,Q=v,z=T,dt=D,ht=R)):I>=P?(C=h,Y=u,tt=T,yt=R,h>=0?(U=d,b=c,O=m,H=_,Q=v,z=M,dt=D,ht=g):(U=c,b=d,O=_,H=m,Q=M,z=v,dt=g,ht=D)):(C=d,Y=m,tt=v,yt=D,d>=0?(U=c,b=h,O=_,H=u,Q=M,z=T,dt=g,ht=R):(U=h,b=c,O=u,H=_,Q=T,z=M,dt=R,ht=g)),C===0)return null;let rt=U/C,q=b/C,_t=1/C,qt=O-rt*Y,Zt=H-q*Y,De=Q-rt*tt,xe=z-q*tt,ge=dt-rt*yt,lt=ht-q*yt,gt=ge*xe-lt*De,Bt=qt*lt-Zt*ge,te=De*Zt-xe*qt;if(s){if(gt<0||Bt<0||te<0)return null}else if((gt<0||Bt<0||te<0)&&(gt>0||Bt>0||te>0))return null;let St=gt+Bt+te;if(St===0)return null;let ee=_t*(gt*Y+Bt*tt+te*yt);return(St>0?ee<0:ee>0)?null:this.at(ee/St,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},rn=class extends vi{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new jt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Zi,this.combine=dl,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}},Cu=new Oe,Is=new Ns,ao=new ls,Ru=new N,oo=new N,lo=new N,co=new N,kc=new N,ho=new N,Pu=new N,uo=new N,ce=class extends gn{constructor(t=new Ie,e=new rn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(t,e){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;e.fromBufferAttribute(s,t);let o=this.morphTargetInfluences;if(r&&o){ho.set(0,0,0);for(let c=0,h=r.length;c<h;c++){let d=o[c],_=r[c];d!==0&&(kc.fromBufferAttribute(_,t),a?ho.addScaledVector(kc,d):ho.addScaledVector(kc.sub(e),d))}e.add(ho)}return e}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),ao.copy(n.boundingSphere),ao.applyMatrix4(r),Is.copy(t.ray).recast(t.near),!(ao.containsPoint(Is.origin)===!1&&(Is.intersectSphere(ao,Ru)===null||Is.origin.distanceToSquared(Ru)>(t.far-t.near)**2))&&(Cu.copy(r).invert(),Is.copy(t.ray).applyMatrix4(Cu),!(n.boundingBox!==null&&Is.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,Is)))}_computeIntersections(t,e,n){let s,r=this.geometry,a=this.material,o=r.index,c=r.attributes.position,h=r.attributes.uv,d=r.attributes.uv1,_=r.attributes.normal,u=r.groups,m=r.drawRange;if(o!==null)if(Array.isArray(a))for(let M=0,T=u.length;M<T;M++){let v=u[M],g=a[v.materialIndex],R=Math.max(v.start,m.start),D=Math.min(o.count,Math.min(v.start+v.count,m.start+m.count));for(let E=R,I=D;E<I;E+=3){let P=o.getX(E),U=o.getX(E+1),b=o.getX(E+2);s=fo(this,g,t,n,h,d,_,P,U,b),s&&(s.faceIndex=Math.floor(E/3),s.face.materialIndex=v.materialIndex,e.push(s))}}else{let M=Math.max(0,m.start),T=Math.min(o.count,m.start+m.count);for(let v=M,g=T;v<g;v+=3){let R=o.getX(v),D=o.getX(v+1),E=o.getX(v+2);s=fo(this,a,t,n,h,d,_,R,D,E),s&&(s.faceIndex=Math.floor(v/3),e.push(s))}}else if(c!==void 0)if(Array.isArray(a))for(let M=0,T=u.length;M<T;M++){let v=u[M],g=a[v.materialIndex],R=Math.max(v.start,m.start),D=Math.min(c.count,Math.min(v.start+v.count,m.start+m.count));for(let E=R,I=D;E<I;E+=3){let P=E,U=E+1,b=E+2;s=fo(this,g,t,n,h,d,_,P,U,b),s&&(s.faceIndex=Math.floor(E/3),s.face.materialIndex=v.materialIndex,e.push(s))}}else{let M=Math.max(0,m.start),T=Math.min(c.count,m.start+m.count);for(let v=M,g=T;v<g;v+=3){let R=v,D=v+1,E=v+2;s=fo(this,a,t,n,h,d,_,R,D,E),s&&(s.faceIndex=Math.floor(v/3),e.push(s))}}}};function Ip(i,t,e,n,s,r,a,o){let c;if(t.side===Sn?c=n.intersectTriangle(a,r,s,!0,o):c=n.intersectTriangle(s,r,a,t.side===vs,o),c===null)return null;uo.copy(o),uo.applyMatrix4(i.matrixWorld);let h=e.ray.origin.distanceTo(uo);return h<e.near||h>e.far?null:{distance:h,point:uo.clone(),object:i}}function fo(i,t,e,n,s,r,a,o,c,h){i.getVertexPosition(o,oo),i.getVertexPosition(c,lo),i.getVertexPosition(h,co);let d=Ip(i,t,e,n,oo,lo,co,Pu);if(d){let _=new N;qi.getBarycoord(Pu,oo,lo,co,_),s&&(d.uv=qi.getInterpolatedAttribute(s,o,c,h,_,new kt)),r&&(d.uv1=qi.getInterpolatedAttribute(r,o,c,h,_,new kt)),a&&(d.normal=qi.getInterpolatedAttribute(a,o,c,h,_,new N),d.normal.dot(n.direction)>0&&d.normal.multiplyScalar(-1));let u={a:o,b:c,c:h,normal:new N,materialIndex:0};qi.getNormal(oo,lo,co,u.normal),d.face=u,d.barycoord=_}return d}var ko=class extends Ln{constructor(t=null,e=1,n=1,s,r,a,o,c,h=Mn,d=Mn,_,u){super(null,a,o,c,h,d,s,r,_,u),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Ls=new ls,Lp=new kt(.5,.5),po=new N,Sr=class{constructor(t=new _i,e=new _i,n=new _i,s=new _i,r=new _i,a=new _i){this.planes=[t,e,n,s,r,a]}set(t,e,n,s,r,a){let o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(t){let e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=xi,n=!1){let s=this.planes,r=t.elements,a=r[0],o=r[1],c=r[2],h=r[3],d=r[4],_=r[5],u=r[6],m=r[7],M=r[8],T=r[9],v=r[10],g=r[11],R=r[12],D=r[13],E=r[14],I=r[15];if(s[0].setComponents(h-a,m-d,g-M,I-R).normalize(),s[1].setComponents(h+a,m+d,g+M,I+R).normalize(),s[2].setComponents(h+o,m+_,g+T,I+D).normalize(),s[3].setComponents(h-o,m-_,g-T,I-D).normalize(),n)s[4].setComponents(c,u,v,E).normalize(),s[5].setComponents(h-c,m-u,g-v,I-E).normalize();else if(s[4].setComponents(h-c,m-u,g-v,I-E).normalize(),e===xi)s[5].setComponents(h+c,m+u,g+v,I+E).normalize();else if(e===gr)s[5].setComponents(c,u,v,E).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),Ls.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),Ls.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(Ls)}intersectsSprite(t){Ls.center.set(0,0,0);let e=Lp.distanceTo(t.center);return Ls.radius=.7071067811865476+e,Ls.applyMatrix4(t.matrixWorld),this.intersectsSphere(Ls)}intersectsSphere(t){let e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){let e=this.planes;for(let n=0;n<6;n++){let s=e[n];if(po.x=s.normal.x>0?t.max.x:t.min.x,po.y=s.normal.y>0?t.max.y:t.min.y,po.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(po)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var ei=class extends vi{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new jt(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}},zo=new N,Vo=new N,Iu=new Oe,Jr=new Ns,mo=new ls,zc=new N,Lu=new N,Ni=class extends gn{constructor(t=new Ie,e=new ei){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,n=[0];for(let s=1,r=e.count;s<r;s++)zo.fromBufferAttribute(e,s-1),Vo.fromBufferAttribute(e,s),n[s]=n[s-1],n[s]+=zo.distanceTo(Vo);t.setAttribute("lineDistance",new se(n,1))}else Qt("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let n=this.geometry,s=this.matrixWorld,r=t.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),mo.copy(n.boundingSphere),mo.applyMatrix4(s),mo.radius+=r,t.ray.intersectsSphere(mo)===!1)return;Iu.copy(s).invert(),Jr.copy(t.ray).applyMatrix4(Iu);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,h=this.isLineSegments?2:1,d=n.index,u=n.attributes.position;if(d!==null){let m=Math.max(0,a.start),M=Math.min(d.count,a.start+a.count);for(let T=m,v=M-1;T<v;T+=h){let g=d.getX(T),R=d.getX(T+1),D=go(this,t,Jr,c,g,R,T);D&&e.push(D)}if(this.isLineLoop){let T=d.getX(M-1),v=d.getX(m),g=go(this,t,Jr,c,T,v,M-1);g&&e.push(g)}}else{let m=Math.max(0,a.start),M=Math.min(u.count,a.start+a.count);for(let T=m,v=M-1;T<v;T+=h){let g=go(this,t,Jr,c,T,T+1,T);g&&e.push(g)}if(this.isLineLoop){let T=go(this,t,Jr,c,M-1,m,M-1);T&&e.push(T)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function go(i,t,e,n,s,r,a){let o=i.geometry.attributes.position;if(zo.fromBufferAttribute(o,s),Vo.fromBufferAttribute(o,r),e.distanceSqToSegment(zo,Vo,zc,Lu)>n)return;zc.applyMatrix4(i.matrixWorld);let h=t.ray.origin.distanceTo(zc);if(!(h<t.near||h>t.far))return{distance:h,point:Lu.clone().applyMatrix4(i.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:i}}var Du=new N,Nu=new N,Us=class extends Ni{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,n=[];for(let s=0,r=e.count;s<r;s+=2)Du.fromBufferAttribute(e,s),Nu.fromBufferAttribute(e,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+Du.distanceTo(Nu);t.setAttribute("lineDistance",new se(n,1))}else Qt("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}};var cs=class extends vi{constructor(t){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new jt(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.alphaMap=t.alphaMap,this.size=t.size,this.sizeAttenuation=t.sizeAttenuation,this.fog=t.fog,this}},Uu=new Oe,Jc=new Ns,_o=new ls,xo=new N,Fs=class extends gn{constructor(t=new Ie,e=new cs){super(),this.isPoints=!0,this.type="Points",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}intersectsFrustum(t){return t.intersectsObject(this)}raycast(t,e){let n=this.geometry,s=this.matrixWorld,r=t.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),_o.copy(n.boundingSphere),_o.applyMatrix4(s),_o.radius+=r,t.ray.intersectsSphere(_o)===!1)return;Uu.copy(s).invert(),Jc.copy(t.ray).applyMatrix4(Uu);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,h=n.index,_=n.attributes.position;if(h!==null){let u=Math.max(0,a.start),m=Math.min(h.count,a.start+a.count);for(let M=u,T=m;M<T;M++){let v=h.getX(M);xo.fromBufferAttribute(_,v),Fu(xo,v,c,s,t,e,this)}}else{let u=Math.max(0,a.start),m=Math.min(_.count,a.start+a.count);for(let M=u,T=m;M<T;M++)xo.fromBufferAttribute(_,M),Fu(xo,M,c,s,t,e,this)}}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function Fu(i,t,e,n,s,r,a){let o=Jc.distanceSqToPoint(i);if(o<e){let c=new N;Jc.closestPointToPoint(i,c),c.applyMatrix4(n);let h=s.ray.origin.distanceTo(c);if(h<s.near||h>s.far)return;r.push({distance:h,distanceToRay:Math.sqrt(o),point:c,index:t,face:null,faceIndex:null,barycoord:null,object:a})}}var la=class extends Ln{constructor(t=[],e=Ms,n,s,r,a,o,c,h,d){super(t,e,n,s,r,a,o,c,h,d),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},Os=class extends Ln{constructor(t,e,n,s,r,a,o,c,h){super(t,e,n,s,r,a,o,c,h),this.isCanvasTexture=!0,this.needsUpdate=!0}};var hs=class extends Ln{constructor(t,e,n=bi,s,r,a,o=Mn,c=Mn,h,d=Li,_=1){if(d!==Li&&d!==bs)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let u={width:t,height:e,depth:_};super(u,s,r,a,o,c,d,n,h),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new vr(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return e.compareFunction=this.compareFunction,e}},Go=class extends hs{constructor(t,e=bi,n=Ms,s,r,a=Mn,o=Mn,c,h=Li){let d={width:t,height:t,depth:1},_=[d,d,d,d,d,d];super(t,t,e,n,s,r,a,o,c,h),this.image=_,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(t){this.image=t}},ca=class extends Ln{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}},Mi=class i extends Ie{constructor(t=1,e=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let c=[],h=[],d=[],_=[],u=0,m=0;M("z","y","x",-1,-1,n,e,t,a,r,0),M("z","y","x",1,-1,n,e,-t,a,r,1),M("x","z","y",1,1,t,n,e,s,a,2),M("x","z","y",1,-1,t,n,-e,s,a,3),M("x","y","z",1,-1,t,e,n,s,r,4),M("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(c),this.setAttribute("position",new se(h,3)),this.setAttribute("normal",new se(d,3)),this.setAttribute("uv",new se(_,2));function M(T,v,g,R,D,E,I,P,U,b,C){let O=E/U,H=I/b,Y=E/2,Q=I/2,z=P/2,tt=U+1,dt=b+1,ht=0,yt=0,rt=new N;for(let q=0;q<dt;q++){let _t=q*H-Q;for(let qt=0;qt<tt;qt++){let Zt=qt*O-Y;rt[T]=Zt*R,rt[v]=_t*D,rt[g]=z,h.push(rt.x,rt.y,rt.z),rt[T]=0,rt[v]=0,rt[g]=P>0?1:-1,d.push(rt.x,rt.y,rt.z),_.push(qt/U),_.push(1-q/b),ht+=1}}for(let q=0;q<b;q++)for(let _t=0;_t<U;_t++){let qt=u+_t+tt*q,Zt=u+_t+tt*(q+1),De=u+(_t+1)+tt*(q+1),xe=u+(_t+1)+tt*q;c.push(qt,Zt,xe),c.push(Zt,De,xe),yt+=6}o.addGroup(m,yt,C),m+=yt,u+=ht}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};var Bs=class i extends Ie{constructor(t=1,e=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:t,segments:e,thetaStart:n,thetaLength:s},e=Math.max(3,e);let r=[],a=[],o=[],c=[],h=new N,d=new kt;a.push(0,0,0),o.push(0,0,1),c.push(.5,.5);for(let _=0,u=3;_<=e;_++,u+=3){let m=n+_/e*s;h.x=t*Math.cos(m),h.y=t*Math.sin(m),a.push(h.x,h.y,h.z),o.push(0,0,1),d.x=(a[u]/t+1)/2,d.y=(a[u+1]/t+1)/2,c.push(d.x,d.y)}for(let _=1;_<=e;_++)r.push(_,_+1,0);this.setIndex(r),this.setAttribute("position",new se(a,3)),this.setAttribute("normal",new se(o,3)),this.setAttribute("uv",new se(c,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.segments,t.thetaStart,t.thetaLength)}},hi=class i extends Ie{constructor(t=1,e=1,n=1,s=32,r=1,a=!1,o=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:t,radiusBottom:e,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:c};let h=this;s=Math.floor(s),r=Math.floor(r);let d=[],_=[],u=[],m=[],M=0,T=[],v=n/2,g=0;R(),a===!1&&(t>0&&D(!0),e>0&&D(!1)),this.setIndex(d),this.setAttribute("position",new se(_,3)),this.setAttribute("normal",new se(u,3)),this.setAttribute("uv",new se(m,2));function R(){let E=new N,I=new N,P=0,U=(e-t)/n;for(let b=0;b<=r;b++){let C=[],O=b/r,H=O*(e-t)+t;for(let Y=0;Y<=s;Y++){let Q=Y/s,z=Q*c+o,tt=Math.sin(z),dt=Math.cos(z);I.x=H*tt,I.y=-O*n+v,I.z=H*dt,_.push(I.x,I.y,I.z),E.set(tt,U,dt).normalize(),u.push(E.x,E.y,E.z),m.push(Q,1-O),C.push(M++)}T.push(C)}for(let b=0;b<s;b++)for(let C=0;C<r;C++){let O=T[C][b],H=T[C+1][b],Y=T[C+1][b+1],Q=T[C][b+1];(t>0||C!==0)&&(d.push(O,H,Q),P+=3),(e>0||C!==r-1)&&(d.push(H,Y,Q),P+=3)}h.addGroup(g,P,0),g+=P}function D(E){let I=M,P=new kt,U=new N,b=0,C=E===!0?t:e,O=E===!0?1:-1;for(let Y=1;Y<=s;Y++)_.push(0,v*O,0),u.push(0,O,0),m.push(.5,.5),M++;let H=M;for(let Y=0;Y<=s;Y++){let z=Y/s*c+o,tt=Math.cos(z),dt=Math.sin(z);U.x=C*dt,U.y=v*O,U.z=C*tt,_.push(U.x,U.y,U.z),u.push(0,O,0),P.x=tt*.5+.5,P.y=dt*.5*O+.5,m.push(P.x,P.y),M++}for(let Y=0;Y<s;Y++){let Q=I+Y,z=H+Y;E===!0?d.push(z,z+1,Q):d.push(z+1,z,Q),b+=3}h.addGroup(g,b,E===!0?1:2),g+=b}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radiusTop,t.radiusBottom,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},us=class i extends hi{constructor(t=1,e=1,n=32,s=1,r=!1,a=0,o=Math.PI*2){super(0,t,e,n,s,r,a,o),this.type="ConeGeometry",this.parameters={radius:t,height:e,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(t){return new i(t.radius,t.height,t.radialSegments,t.heightSegments,t.openEnded,t.thetaStart,t.thetaLength)}},br=class i extends Ie{constructor(t=[],e=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:t,indices:e,radius:n,detail:s};let r=[],a=[];o(s),h(n),d(),this.setAttribute("position",new se(r,3)),this.setAttribute("normal",new se(r.slice(),3)),this.setAttribute("uv",new se(a,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function o(R){let D=new N,E=new N,I=new N;for(let P=0;P<e.length;P+=3)m(e[P+0],D),m(e[P+1],E),m(e[P+2],I),c(D,E,I,R)}function c(R,D,E,I){let P=I+1,U=[];for(let b=0;b<=P;b++){U[b]=[];let C=R.clone().lerp(E,b/P),O=D.clone().lerp(E,b/P),H=P-b;for(let Y=0;Y<=H;Y++)Y===0&&b===P?U[b][Y]=C:U[b][Y]=C.clone().lerp(O,Y/H)}for(let b=0;b<P;b++)for(let C=0;C<2*(P-b)-1;C++){let O=Math.floor(C/2);C%2===0?(u(U[b][O+1]),u(U[b+1][O]),u(U[b][O])):(u(U[b][O+1]),u(U[b+1][O+1]),u(U[b+1][O]))}}function h(R){let D=new N;for(let E=0;E<r.length;E+=3)D.x=r[E+0],D.y=r[E+1],D.z=r[E+2],D.normalize().multiplyScalar(R),r[E+0]=D.x,r[E+1]=D.y,r[E+2]=D.z}function d(){let R=new N;for(let D=0;D<r.length;D+=3){R.x=r[D+0],R.y=r[D+1],R.z=r[D+2];let E=v(R)/2/Math.PI+.5,I=g(R)/Math.PI+.5;a.push(E,1-I)}M(),_()}function _(){for(let R=0;R<a.length;R+=6){let D=a[R+0],E=a[R+2],I=a[R+4],P=Math.max(D,E,I),U=Math.min(D,E,I);P>.9&&U<.1&&(D<.2&&(a[R+0]+=1),E<.2&&(a[R+2]+=1),I<.2&&(a[R+4]+=1))}}function u(R){r.push(R.x,R.y,R.z)}function m(R,D){let E=R*3;D.x=t[E+0],D.y=t[E+1],D.z=t[E+2]}function M(){let R=new N,D=new N,E=new N,I=new N,P=new kt,U=new kt,b=new kt;for(let C=0,O=0;C<r.length;C+=9,O+=6){R.set(r[C+0],r[C+1],r[C+2]),D.set(r[C+3],r[C+4],r[C+5]),E.set(r[C+6],r[C+7],r[C+8]),P.set(a[O+0],a[O+1]),U.set(a[O+2],a[O+3]),b.set(a[O+4],a[O+5]),I.copy(R).add(D).add(E).divideScalar(3);let H=v(I);T(P,O+0,R,H),T(U,O+2,D,H),T(b,O+4,E,H)}}function T(R,D,E,I){I<0&&R.x===1&&(a[D]=R.x-1),E.x===0&&E.z===0&&(a[D]=I/2/Math.PI+.5)}function v(R){return Math.atan2(R.z,-R.x)}function g(R){return Math.atan2(-R.y,Math.sqrt(R.x*R.x+R.z*R.z))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.vertices,t.indices,t.radius,t.detail)}},ha=class i extends br{constructor(t=1,e=0){let n=(1+Math.sqrt(5))/2,s=1/n,r=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-s,-n,0,-s,n,0,s,-n,0,s,n,-s,-n,0,-s,n,0,s,-n,0,s,n,0,-n,0,-s,n,0,-s,-n,0,s,n,0,s],a=[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9];super(r,a,t,e),this.type="DodecahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new i(t.radius,t.detail)}};var ni=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Qt("Curve: .getPoint() not implemented.")}getPointAt(t,e){let n=this.getUtoTmapping(t);return this.getPoint(n,e)}getPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return e}getSpacedPoints(t=5){let e=[];for(let n=0;n<=t;n++)e.push(this.getPointAt(n/t));return e}getLength(){let t=this.getLengths();return t[t.length-1]}getLengths(t=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===t+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let e=[],n,s=this.getPoint(0),r=0;e.push(0);for(let a=1;a<=t;a++)n=this.getPoint(a/t),r+=n.distanceTo(s),e.push(r),s=n;return this.cacheArcLengths=e,e}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(t,e=null){let n=this.getLengths(),s=0,r=n.length,a;e?a=e:a=t*n[r-1];let o=0,c=r-1,h;for(;o<=c;)if(s=Math.floor(o+(c-o)/2),h=n[s]-a,h<0)o=s+1;else if(h>0)c=s-1;else{c=s;break}if(s=c,n[s]===a)return s/(r-1);let d=n[s],u=n[s+1]-d,m=(a-d)/u;return(s+m)/(r-1)}getTangent(t,e){let s=t-1e-4,r=t+1e-4;s<0&&(s=0),r>1&&(r=1);let a=this.getPoint(s),o=this.getPoint(r),c=e||(a.isVector2?new kt:new N);return c.copy(o).sub(a).normalize(),c}getTangentAt(t,e){let n=this.getUtoTmapping(t);return this.getTangent(n,e)}computeFrenetFrames(t,e=!1){let n=new N,s=[],r=[],a=[],o=new N,c=new Oe;for(let m=0;m<=t;m++){let M=m/t;s[m]=this.getTangentAt(M,new N)}r[0]=new N,a[0]=new N;let h=Number.MAX_VALUE,d=Math.abs(s[0].x),_=Math.abs(s[0].y),u=Math.abs(s[0].z);d<=h&&(h=d,n.set(1,0,0)),_<=h&&(h=_,n.set(0,1,0)),u<=h&&n.set(0,0,1),o.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],o),a[0].crossVectors(s[0],r[0]);for(let m=1;m<=t;m++){if(r[m]=r[m-1].clone(),a[m]=a[m-1].clone(),o.crossVectors(s[m-1],s[m]),o.length()>Number.EPSILON){o.normalize();let M=Math.acos(Me(s[m-1].dot(s[m]),-1,1));r[m].applyMatrix4(c.makeRotationAxis(o,M))}a[m].crossVectors(s[m],r[m])}if(e===!0){let m=Math.acos(Me(r[0].dot(r[t]),-1,1));m/=t,s[0].dot(o.crossVectors(r[0],r[t]))>0&&(m=-m);for(let M=1;M<=t;M++)r[M].applyMatrix4(c.makeRotationAxis(s[M],m*M)),a[M].crossVectors(s[M],r[M])}return{tangents:s,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}toJSON(){let t={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return t.arcLengthDivisions=this.arcLengthDivisions,t.type=this.type,t}fromJSON(t){return this.arcLengthDivisions=t.arcLengthDivisions,this}},ua=class extends ni{constructor(t=0,e=0,n=1,s=1,r=0,a=Math.PI*2,o=!1,c=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=t,this.aY=e,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=c}getPoint(t,e=new kt){let n=e,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(a?r=0:r=s),this.aClockwise===!0&&!a&&(r===s?r=-s:r=r-s);let o=this.aStartAngle+t*r,c=this.aX+this.xRadius*Math.cos(o),h=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let d=Math.cos(this.aRotation),_=Math.sin(this.aRotation),u=c-this.aX,m=h-this.aY;c=u*d-m*_+this.aX,h=u*_+m*d+this.aY}return n.set(c,h)}copy(t){return super.copy(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}toJSON(){let t=super.toJSON();return t.aX=this.aX,t.aY=this.aY,t.xRadius=this.xRadius,t.yRadius=this.yRadius,t.aStartAngle=this.aStartAngle,t.aEndAngle=this.aEndAngle,t.aClockwise=this.aClockwise,t.aRotation=this.aRotation,t}fromJSON(t){return super.fromJSON(t),this.aX=t.aX,this.aY=t.aY,this.xRadius=t.xRadius,this.yRadius=t.yRadius,this.aStartAngle=t.aStartAngle,this.aEndAngle=t.aEndAngle,this.aClockwise=t.aClockwise,this.aRotation=t.aRotation,this}},Ho=class extends ua{constructor(t,e,n,s,r,a){super(t,e,n,n,s,r,a),this.isArcCurve=!0,this.type="ArcCurve"}};function wh(){let i=0,t=0,e=0,n=0;function s(r,a,o,c){i=r,t=o,e=-3*r+3*a-2*o-c,n=2*r-2*a+o+c}return{initCatmullRom:function(r,a,o,c,h){s(a,o,h*(o-r),h*(c-a))},initNonuniformCatmullRom:function(r,a,o,c,h,d,_){let u=(a-r)/h-(o-r)/(h+d)+(o-a)/d,m=(o-a)/d-(c-a)/(d+_)+(c-o)/_;u*=d,m*=d,s(a,o,u,m)},calc:function(r){let a=r*r,o=a*r;return i+t*r+e*a+n*o}}}var Ou=new N,Bu=new N,Vc=new wh,Gc=new wh,Hc=new wh,ds=class extends ni{constructor(t=[],e=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=t,this.closed=e,this.curveType=n,this.tension=s}getPoint(t,e=new N){let n=e,s=this.points,r=s.length,a=(r-(this.closed?0:1))*t,o=Math.floor(a),c=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:c===0&&o===r-1&&(o=r-2,c=1);let h,d;this.closed||o>0?h=s[(o-1)%r]:(Bu.subVectors(s[0],s[1]).add(s[0]),h=Bu);let _=s[o%r],u=s[(o+1)%r];if(this.closed||o+2<r?d=s[(o+2)%r]:(Ou.subVectors(s[r-1],s[r-2]).add(s[r-1]),d=Ou),this.curveType==="centripetal"||this.curveType==="chordal"){let m=this.curveType==="chordal"?.5:.25,M=Math.pow(h.distanceToSquared(_),m),T=Math.pow(_.distanceToSquared(u),m),v=Math.pow(u.distanceToSquared(d),m);T<1e-4&&(T=1),M<1e-4&&(M=T),v<1e-4&&(v=T),Vc.initNonuniformCatmullRom(h.x,_.x,u.x,d.x,M,T,v),Gc.initNonuniformCatmullRom(h.y,_.y,u.y,d.y,M,T,v),Hc.initNonuniformCatmullRom(h.z,_.z,u.z,d.z,M,T,v)}else this.curveType==="catmullrom"&&(Vc.initCatmullRom(h.x,_.x,u.x,d.x,this.tension),Gc.initCatmullRom(h.y,_.y,u.y,d.y,this.tension),Hc.initCatmullRom(h.z,_.z,u.z,d.z,this.tension));return n.set(Vc.calc(c),Gc.calc(c),Hc.calc(c)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(s.clone())}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let s=this.points[e];t.points.push(s.toArray())}return t.closed=this.closed,t.curveType=this.curveType,t.tension=this.tension,t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(new N().fromArray(s))}return this.closed=t.closed,this.curveType=t.curveType,this.tension=t.tension,this}};function ku(i,t,e,n,s){let r=(n-t)*.5,a=(s-e)*.5,o=i*i,c=i*o;return(2*e-2*n+r+a)*c+(-3*e+3*n-2*r-a)*o+r*i+e}function Dp(i,t){let e=1-i;return e*e*t}function Np(i,t){return 2*(1-i)*i*t}function Up(i,t){return i*i*t}function Kr(i,t,e,n){return Dp(i,t)+Np(i,e)+Up(i,n)}function Fp(i,t){let e=1-i;return e*e*e*t}function Op(i,t){let e=1-i;return 3*e*e*i*t}function Bp(i,t){return 3*(1-i)*i*i*t}function kp(i,t){return i*i*i*t}function jr(i,t,e,n,s){return Fp(i,t)+Op(i,e)+Bp(i,n)+kp(i,s)}var Wo=class extends ni{constructor(t=new kt,e=new kt,n=new kt,s=new kt){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new kt){let n=e,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(jr(t,s.x,r.x,a.x,o.x),jr(t,s.y,r.y,a.y,o.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},Xo=class extends ni{constructor(t=new N,e=new N,n=new N,s=new N){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=t,this.v1=e,this.v2=n,this.v3=s}getPoint(t,e=new N){let n=e,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(jr(t,s.x,r.x,a.x,o.x),jr(t,s.y,r.y,a.y,o.y),jr(t,s.z,r.z,a.z,o.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this.v3.copy(t.v3),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t.v3=this.v3.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this.v3.fromArray(t.v3),this}},qo=class extends ni{constructor(t=new kt,e=new kt){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=t,this.v2=e}getPoint(t,e=new kt){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new kt){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},wr=class extends ni{constructor(t=new N,e=new N){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=t,this.v2=e}getPoint(t,e=new N){let n=e;return t===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(t).add(this.v1)),n}getPointAt(t,e){return this.getPoint(t,e)}getTangent(t,e=new N){return e.subVectors(this.v2,this.v1).normalize()}getTangentAt(t,e){return this.getTangent(t,e)}copy(t){return super.copy(t),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Yo=class extends ni{constructor(t=new kt,e=new kt,n=new kt){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new kt){let n=e,s=this.v0,r=this.v1,a=this.v2;return n.set(Kr(t,s.x,r.x,a.x),Kr(t,s.y,r.y,a.y)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},da=class extends ni{constructor(t=new N,e=new N,n=new N){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=t,this.v1=e,this.v2=n}getPoint(t,e=new N){let n=e,s=this.v0,r=this.v1,a=this.v2;return n.set(Kr(t,s.x,r.x,a.x),Kr(t,s.y,r.y,a.y),Kr(t,s.z,r.z,a.z)),n}copy(t){return super.copy(t),this.v0.copy(t.v0),this.v1.copy(t.v1),this.v2.copy(t.v2),this}toJSON(){let t=super.toJSON();return t.v0=this.v0.toArray(),t.v1=this.v1.toArray(),t.v2=this.v2.toArray(),t}fromJSON(t){return super.fromJSON(t),this.v0.fromArray(t.v0),this.v1.fromArray(t.v1),this.v2.fromArray(t.v2),this}},Zo=class extends ni{constructor(t=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=t}getPoint(t,e=new kt){let n=e,s=this.points,r=(s.length-1)*t,a=Math.floor(r),o=r-a,c=s[a===0?a:a-1],h=s[a],d=s[a>s.length-2?s.length-1:a+1],_=s[a>s.length-3?s.length-1:a+2];return n.set(ku(o,c.x,h.x,d.x,_.x),ku(o,c.y,h.y,d.y,_.y)),n}copy(t){super.copy(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(s.clone())}return this}toJSON(){let t=super.toJSON();t.points=[];for(let e=0,n=this.points.length;e<n;e++){let s=this.points[e];t.points.push(s.toArray())}return t}fromJSON(t){super.fromJSON(t),this.points=[];for(let e=0,n=t.points.length;e<n;e++){let s=t.points[e];this.points.push(new kt().fromArray(s))}return this}},Kc=Object.freeze({__proto__:null,ArcCurve:Ho,CatmullRomCurve3:ds,CubicBezierCurve:Wo,CubicBezierCurve3:Xo,EllipseCurve:ua,LineCurve:qo,LineCurve3:wr,QuadraticBezierCurve:Yo,QuadraticBezierCurve3:da,SplineCurve:Zo}),fa=class extends ni{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(t){this.curves.push(t)}closePath(){let t=this.curves[0].getPoint(0),e=this.curves[this.curves.length-1].getPoint(1);if(!t.equals(e)){let n=t.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Kc[n](e,t))}return this}getPoint(t,e){let n=t*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=n){let a=s[r]-n,o=this.curves[r],c=o.getLength(),h=c===0?0:1-a/c;return o.getPointAt(h,e)}r++}return null}getLength(){let t=this.getCurveLengths();return t[t.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let t=[],e=0;for(let n=0,s=this.curves.length;n<s;n++)e+=this.curves[n].getLength(),t.push(e);return this.cacheLengths=t,t}getSpacedPoints(t=40){let e=[];for(let n=0;n<=t;n++)e.push(this.getPoint(n/t));return this.autoClose&&e.push(e[0]),e}getPoints(t=12){let e=[],n;for(let s=0,r=this.curves;s<r.length;s++){let a=r[s],o=a.isEllipseCurve?t*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?t*a.points.length:t,c=a.getPoints(o);for(let h=0;h<c.length;h++){let d=c[h];n&&n.equals(d)||(e.push(d),n=d)}}return this.autoClose&&e.length>1&&!e[e.length-1].equals(e[0])&&e.push(e[0]),e}copy(t){super.copy(t),this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let s=t.curves[e];this.curves.push(s.clone())}return this.autoClose=t.autoClose,this}toJSON(){let t=super.toJSON();t.autoClose=this.autoClose,t.curves=[];for(let e=0,n=this.curves.length;e<n;e++){let s=this.curves[e];t.curves.push(s.toJSON())}return t}fromJSON(t){super.fromJSON(t),this.autoClose=t.autoClose,this.curves=[];for(let e=0,n=t.curves.length;e<n;e++){let s=t.curves[e];this.curves.push(new Kc[s.type]().fromJSON(s))}return this}};var fs=class i extends br{constructor(t=1,e=0){let n=(1+Math.sqrt(5))/2,s=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,t,e),this.type="IcosahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new i(t.radius,t.detail)}};var pa=class i extends br{constructor(t=1,e=0){let n=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],s=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(n,s,t,e),this.type="OctahedronGeometry",this.parameters={radius:t,detail:e}}static fromJSON(t){return new i(t.radius,t.detail)}},Ui=class i extends Ie{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};let r=t/2,a=e/2,o=Math.floor(n),c=Math.floor(s),h=o+1,d=c+1,_=t/o,u=e/c,m=[],M=[],T=[],v=[];for(let g=0;g<d;g++){let R=g*u-a;for(let D=0;D<h;D++){let E=D*_-r;M.push(E,-R,0),T.push(0,0,1),v.push(D/o),v.push(1-g/c)}}for(let g=0;g<c;g++)for(let R=0;R<o;R++){let D=R+h*g,E=R+h*(g+1),I=R+1+h*(g+1),P=R+1+h*g;m.push(D,E,P),m.push(E,I,P)}this.setIndex(m),this.setAttribute("position",new se(M,3)),this.setAttribute("normal",new se(T,3)),this.setAttribute("uv",new se(v,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.widthSegments,t.heightSegments)}},ps=class i extends Ie{constructor(t=.5,e=1,n=32,s=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:t,outerRadius:e,thetaSegments:n,phiSegments:s,thetaStart:r,thetaLength:a},n=Math.max(3,n),s=Math.max(1,s);let o=[],c=[],h=[],d=[],_=t,u=(e-t)/s,m=new N,M=new kt;for(let T=0;T<=s;T++){for(let v=0;v<=n;v++){let g=r+v/n*a;m.x=_*Math.cos(g),m.y=_*Math.sin(g),c.push(m.x,m.y,m.z),h.push(0,0,1),M.x=(m.x/e+1)/2,M.y=(m.y/e+1)/2,d.push(M.x,M.y)}_+=u}for(let T=0;T<s;T++){let v=T*(n+1);for(let g=0;g<n;g++){let R=g+v,D=R,E=R+n+1,I=R+n+2,P=R+1;o.push(D,E,P),o.push(E,I,P)}}this.setIndex(o),this.setAttribute("position",new se(c,3)),this.setAttribute("normal",new se(h,3)),this.setAttribute("uv",new se(d,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.innerRadius,t.outerRadius,t.thetaSegments,t.phiSegments,t.thetaStart,t.thetaLength)}};var Dn=class i extends Ie{constructor(t=1,e=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:t,widthSegments:e,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},e=Math.max(3,Math.floor(e)),n=Math.max(2,Math.floor(n));let c=Math.min(a+o,Math.PI),h=0,d=[],_=new N,u=new N,m=[],M=[],T=[],v=[];for(let g=0;g<=n;g++){let R=[],D=g/n,E=a+D*o,I=t*Math.cos(E),P=Math.sqrt(t*t-I*I),U=0;g===0&&a===0?U=.5/e:g===n&&c===Math.PI&&(U=-.5/e);for(let b=0;b<=e;b++){let C=b/e,O=s+C*r;_.x=-P*Math.cos(O),_.y=I,_.z=P*Math.sin(O),M.push(_.x,_.y,_.z),u.copy(_).normalize(),T.push(u.x,u.y,u.z),v.push(C+U,1-D),R.push(h++)}d.push(R)}for(let g=0;g<n;g++)for(let R=0;R<e;R++){let D=d[g][R+1],E=d[g][R],I=d[g+1][R],P=d[g+1][R+1];(g!==0||a>0)&&m.push(D,E,P),(g!==n-1||c<Math.PI)&&m.push(E,I,P)}this.setIndex(m),this.setAttribute("position",new se(M,3)),this.setAttribute("normal",new se(T,3)),this.setAttribute("uv",new se(v,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.widthSegments,t.heightSegments,t.phiStart,t.phiLength,t.thetaStart,t.thetaLength)}};var ms=class i extends Ie{constructor(t=1,e=.4,n=12,s=48,r=Math.PI*2,a=0,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:t,tube:e,radialSegments:n,tubularSegments:s,arc:r,thetaStart:a,thetaLength:o},n=Math.floor(n),s=Math.floor(s);let c=[],h=[],d=[],_=[],u=new N,m=new N,M=new N;for(let T=0;T<=n;T++){let v=a+T/n*o;for(let g=0;g<=s;g++){let R=g/s*r;m.x=(t+e*Math.cos(v))*Math.cos(R),m.y=(t+e*Math.cos(v))*Math.sin(R),m.z=e*Math.sin(v),h.push(m.x,m.y,m.z),u.x=t*Math.cos(R),u.y=t*Math.sin(R),M.subVectors(m,u).normalize(),d.push(M.x,M.y,M.z),_.push(g/s),_.push(T/n)}}for(let T=1;T<=n;T++)for(let v=1;v<=s;v++){let g=(s+1)*T+v-1,R=(s+1)*(T-1)+v-1,D=(s+1)*(T-1)+v,E=(s+1)*T+v;c.push(g,R,E),c.push(R,D,E)}this.setIndex(c),this.setAttribute("position",new se(h,3)),this.setAttribute("normal",new se(d,3)),this.setAttribute("uv",new se(_,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.radius,t.tube,t.radialSegments,t.tubularSegments,t.arc,t.thetaStart,t.thetaLength)}};var ma=class i extends Ie{constructor(t=new da(new N(-1,-1,0),new N(-1,1,0),new N(1,1,0)),e=64,n=1,s=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:t,tubularSegments:e,radius:n,radialSegments:s,closed:r};let a=t.computeFrenetFrames(e,r);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;let o=new N,c=new N,h=new kt,d=new N,_=[],u=[],m=[],M=[];T(),this.setIndex(M),this.setAttribute("position",new se(_,3)),this.setAttribute("normal",new se(u,3)),this.setAttribute("uv",new se(m,2));function T(){for(let D=0;D<e;D++)v(D);v(r===!1?e:0),R(),g()}function v(D){d=t.getPointAt(D/e,d);let E=a.normals[D],I=a.binormals[D];for(let P=0;P<=s;P++){let U=P/s*Math.PI*2,b=Math.sin(U),C=-Math.cos(U);c.x=C*E.x+b*I.x,c.y=C*E.y+b*I.y,c.z=C*E.z+b*I.z,c.normalize(),u.push(c.x,c.y,c.z),o.x=d.x+n*c.x,o.y=d.y+n*c.y,o.z=d.z+n*c.z,_.push(o.x,o.y,o.z)}}function g(){for(let D=1;D<=e;D++)for(let E=1;E<=s;E++){let I=(s+1)*(D-1)+(E-1),P=(s+1)*D+(E-1),U=(s+1)*D+E,b=(s+1)*(D-1)+E;M.push(I,P,b),M.push(P,U,b)}}function R(){for(let D=0;D<=e;D++)for(let E=0;E<=s;E++)h.x=D/e,h.y=E/s,m.push(h.x,h.y)}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}toJSON(){let t=super.toJSON();return t.path=this.parameters.path.toJSON(),t}static fromJSON(t){return new i(new Kc[t.path.type]().fromJSON(t.path),t.tubularSegments,t.radius,t.radialSegments,t.closed)}},Tr=class extends Ie{constructor(t=null){if(super(),this.type="WireframeGeometry",this.parameters={geometry:t},t!==null){let e=[],n=new Set,s=new N,r=new N;if(t.index!==null){let a=t.attributes.position,o=t.index,c=t.groups;c.length===0&&(c=[{start:0,count:o.count,materialIndex:0}]);for(let h=0,d=c.length;h<d;++h){let _=c[h],u=_.start,m=_.count;for(let M=u,T=u+m;M<T;M+=3)for(let v=0;v<3;v++){let g=o.getX(M+v),R=o.getX(M+(v+1)%3);s.fromBufferAttribute(a,g),r.fromBufferAttribute(a,R),zu(s,r,n)===!0&&(e.push(s.x,s.y,s.z),e.push(r.x,r.y,r.z))}}}else{let a=t.attributes.position;for(let o=0,c=a.count/3;o<c;o++)for(let h=0;h<3;h++){let d=3*o+h,_=3*o+(h+1)%3;s.fromBufferAttribute(a,d),r.fromBufferAttribute(a,_),zu(s,r,n)===!0&&(e.push(s.x,s.y,s.z),e.push(r.x,r.y,r.z))}}this.setAttribute("position",new se(e,3))}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}};function zu(i,t,e){let n=`${i.x},${i.y},${i.z}-${t.x},${t.y},${t.z}`,s=`${t.x},${t.y},${t.z}-${i.x},${i.y},${i.z}`;return e.has(n)===!0||e.has(s)===!0?!1:(e.add(n),e.add(s),!0)}function Vs(i){let t={};for(let e in i){t[e]={};for(let n in i[e]){let s=i[e][n];if(Vu(s))s.isRenderTargetTexture?(Qt("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone();else if(Array.isArray(s))if(Vu(s[0])){let r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();t[e][n]=r}else t[e][n]=s.slice();else t[e][n]=s}}return t}function Nn(i){let t={};for(let e=0;e<i.length;e++){let n=Vs(i[e]);for(let s in n)t[s]=n[s]}return t}function Vu(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function zp(i){let t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function Th(i){let t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:Se.workingColorSpace}var Ud={clone:Vs,merge:Nn},Vp=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Gp=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,dn=class extends vi{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Vp,this.fragmentShader=Gp,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Vs(t.uniforms),this.uniformsGroups=zp(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this.defaultAttributeValues=Object.assign({},t.defaultAttributeValues),this.index0AttributeName=t.index0AttributeName,this.uniformsNeedUpdate=t.uniformsNeedUpdate,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?e.uniforms[s]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[s]={type:"m4",value:a.toArray()}:e.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}fromJSON(t,e){if(super.fromJSON(t,e),t.uniforms!==void 0)for(let n in t.uniforms){let s=t.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=e[s.value]||null;break;case"c":this.uniforms[n].value=new jt().setHex(s.value);break;case"v2":this.uniforms[n].value=new kt().fromArray(s.value);break;case"v3":this.uniforms[n].value=new N().fromArray(s.value);break;case"v4":this.uniforms[n].value=new qe().fromArray(s.value);break;case"m3":this.uniforms[n].value=new ae().fromArray(s.value);break;case"m4":this.uniforms[n].value=new Oe().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(t.defines!==void 0&&(this.defines=t.defines),t.vertexShader!==void 0&&(this.vertexShader=t.vertexShader),t.fragmentShader!==void 0&&(this.fragmentShader=t.fragmentShader),t.glslVersion!==void 0&&(this.glslVersion=t.glslVersion),t.extensions!==void 0)for(let n in t.extensions)this.extensions[n]=t.extensions[n];return t.lights!==void 0&&(this.lights=t.lights),t.clipping!==void 0&&(this.clipping=t.clipping),this}},$o=class extends dn{constructor(t){super(t),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}};var $i=class extends vi{constructor(t){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new jt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new jt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=jl,this.normalScale=new kt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Zi,this.combine=dl,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.envMapIntensity=t.envMapIntensity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}},Jo=class extends vi{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=yd,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},Ko=class extends vi{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function hr(i,t){return!i||i.constructor===t?i:typeof t.BYTES_PER_ELEMENT=="number"?new t(i):Array.prototype.slice.call(i)}function Wc(i){return i!==void 0&&i.inTangents!==void 0&&i.outTangents!==void 0}var gs=class{constructor(t,e,n,s){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new e.constructor(n),this.sampleValues=e,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,n=this._cachedIndex,s=e[n],r=e[n-1];n:{t:{let a;e:{i:if(!(t<s)){for(let o=n+2;;){if(s===void 0){if(t<r)break i;return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=s,s=e[++n],t<s)break t}a=e.length;break e}if(!(t>=r)){let o=e[1];t<o&&(n=2,r=o);for(let c=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===c)break;if(s=r,r=e[--n-1],t>=r)break t}a=n,n=0;break e}break n}for(;n<a;){let o=n+a>>>1;t<e[o]?a=o:n=o+1}if(s=e[n],r=e[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,t,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=t*s;for(let a=0;a!==s;++a)e[a]=n[r+a];return e}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},jo=class extends gs{constructor(t,e,n,s){super(t,e,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Yc,endingEnd:Yc}}intervalChanged_(t,e,n){let s=this.parameterPositions,r=t-2,a=t+1,o=s[r],c=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case Zc:r=t,o=2*e-n;break;case $c:r=s.length-2,o=e+s[r]-s[r+1];break;default:r=t,o=n}if(c===void 0)switch(this.getSettings_().endingEnd){case Zc:a=t,c=2*n-e;break;case $c:a=1,c=n+s[1]-s[0];break;default:a=t-1,c=e}let h=(n-e)*.5,d=this.valueSize;this._weightPrev=h/(e-o),this._weightNext=h/(c-n),this._offsetPrev=r*d,this._offsetNext=a*d}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=t*o,h=c-o,d=this._offsetPrev,_=this._offsetNext,u=this._weightPrev,m=this._weightNext,M=(n-e)/(s-e),T=M*M,v=T*M,g=-u*v+2*u*T-u*M,R=(1+u)*v+(-1.5-2*u)*T+(-.5+u)*M+1,D=(-1-m)*v+(1.5+m)*T+.5*M,E=m*v-m*T;for(let I=0;I!==o;++I)r[I]=g*a[d+I]+R*a[h+I]+D*a[c+I]+E*a[_+I];return r}},Qo=class extends gs{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=t*o,h=c-o,d=(n-e)/(s-e),_=1-d;for(let u=0;u!==o;++u)r[u]=a[h+u]*_+a[c+u]*d;return r}},tl=class extends gs{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t){return this.copySampleValue_(t-1)}},el=class extends gs{interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=t*o,h=c-o,d=this.inTangents,_=this.outTangents;if(!d||!_){let M=(n-e)/(s-e),T=1-M;for(let v=0;v!==o;++v)r[v]=a[h+v]*T+a[c+v]*M;return r}let u=o*2,m=t-1;for(let M=0;M!==o;++M){let T=a[h+M],v=a[c+M],g=m*u+M*2,R=_[g],D=_[g+1],E=t*u+M*2,I=d[E],P=d[E+1],U=Wp(n,e,R,I,s);r[M]=Fd(U,T,D,P,v)}return r}};function Fd(i,t,e,n,s){let r=1-i;return r*r*r*t+3*r*r*i*e+3*r*i*i*n+i*i*i*s}function Hp(i,t,e,n,s){let r=1-i;return 3*r*r*(e-t)+6*r*i*(n-e)+3*i*i*(s-n)}function Wp(i,t,e,n,s){let r=(i-t)/(s-t);for(let a=0;a<8;a++){let o=Fd(r,t,e,n,s)-i;if(Math.abs(o)<1e-10)break;let c=Hp(r,t,e,n,s);if(Math.abs(c)<1e-10)break;r=Math.max(0,Math.min(1,r-o/c))}return r}var ii=class{constructor(t,e,n,s){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=hr(e,this.TimeBufferType),this.values=hr(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,n;if(e.toJSON!==this.toJSON)n=e.toJSON(t);else{n={name:t.name,times:hr(t.times,Array),values:hr(t.values,Array)};let s=t.getInterpolation();s!==t.DefaultInterpolation&&(n.interpolation=s),Wc(t.settings)&&(n.settings={inTangents:hr(t.settings.inTangents,Array),outTangents:hr(t.settings.outTangents,Array)})}return n.type=t.ValueTypeName,n}InterpolantFactoryMethodDiscrete(t){return new tl(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new Qo(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new jo(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodBezier(t){let e=new el(this.times,this.values,this.getValueSize(),t);return this.settings&&(e.inTangents=this.settings.inTangents,e.outTangents=this.settings.outTangents),e}setInterpolation(t){let e;switch(t){case Qr:e=this.InterpolantFactoryMethodDiscrete;break;case Do:e=this.InterpolantFactoryMethodLinear;break;case Mo:e=this.InterpolantFactoryMethodSmooth;break;case qc:e=this.InterpolantFactoryMethodBezier;break}if(e===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Qt("KeyframeTrack:",n),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Qr;case this.InterpolantFactoryMethodLinear:return Do;case this.InterpolantFactoryMethodSmooth:return Mo;case this.InterpolantFactoryMethodBezier:return qc}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]*=t;Wc(this.settings)&&(Gu(this.settings.inTangents,t),Gu(this.settings.outTangents,t))}return this}trim(t,e){let n=this.times,s=n.length,r=0,a=s-1;for(;r!==s&&n[r]<t;)++r;for(;a!==-1&&n[a]>e;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(ne("KeyframeTrack: Invalid value size in track.",this),t=!1);let n=this.times,s=this.values,r=n.length;r===0&&(ne("KeyframeTrack: Track is empty.",this),t=!1);let a=null;for(let o=0;o!==r;o++){let c=n[o];if(typeof c=="number"&&isNaN(c)){ne("KeyframeTrack: Time is not a valid number.",this,o,c),t=!1;break}if(a!==null&&a>c){ne("KeyframeTrack: Out of order keys.",this,o,c,a),t=!1;break}a=c}if(s!==void 0&&fp(s))for(let o=0,c=s.length;o!==c;++o){let h=s[o];if(isNaN(h)){ne("KeyframeTrack: Value is not a valid number.",this,o,h),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===Mo,r=t.length-1,a=1;for(let o=1;o<r;++o){let c=!1,h=t[o],d=t[o+1];if(h!==d&&(o!==1||h!==t[0]))if(s)c=!0;else{let _=o*n,u=_-n,m=_+n;for(let M=0;M!==n;++M){let T=e[_+M];if(T!==e[u+M]||T!==e[m+M]){c=!0;break}}}if(c){if(o!==a){t[a]=t[o];let _=o*n,u=a*n;for(let m=0;m!==n;++m)e[u+m]=e[_+m]}++a}}if(r>0){t[a]=t[r];for(let o=r*n,c=a*n,h=0;h!==n;++h)e[c+h]=e[o+h];++a}return a!==t.length?(this.times=t.slice(0,a),this.values=e.slice(0,a*n)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),n=this.constructor,s=new n(this.name,t,e);return s.createInterpolant=this.createInterpolant,Wc(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function Gu(i,t){for(let e=0,n=i.length;e!==n;e+=2)i[e]*=t}ii.prototype.ValueTypeName="";ii.prototype.TimeBufferType=Float32Array;ii.prototype.ValueBufferType=Float32Array;ii.prototype.DefaultInterpolation=Do;var _s=class extends ii{constructor(t,e,n){super(t,e,n)}};_s.prototype.ValueTypeName="bool";_s.prototype.ValueBufferType=Array;_s.prototype.DefaultInterpolation=Qr;_s.prototype.InterpolantFactoryMethodLinear=void 0;_s.prototype.InterpolantFactoryMethodSmooth=void 0;var nl=class extends ii{constructor(t,e,n,s){super(t,e,n,s)}};nl.prototype.ValueTypeName="color";var il=class extends ii{constructor(t,e,n,s){super(t,e,n,s)}};il.prototype.ValueTypeName="number";var sl=class extends gs{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=(n-e)/(s-e),h=t*o;for(let d=h+o;h!==d;h+=4)li.slerpFlat(r,0,a,h-o,a,h,c);return r}},ga=class extends ii{constructor(t,e,n,s){super(t,e,n,s)}InterpolantFactoryMethodLinear(t){return new sl(this.times,this.values,this.getValueSize(),t)}};ga.prototype.ValueTypeName="quaternion";ga.prototype.InterpolantFactoryMethodSmooth=void 0;var xs=class extends ii{constructor(t,e,n){super(t,e,n)}};xs.prototype.ValueTypeName="string";xs.prototype.ValueBufferType=Array;xs.prototype.DefaultInterpolation=Qr;xs.prototype.InterpolantFactoryMethodLinear=void 0;xs.prototype.InterpolantFactoryMethodSmooth=void 0;var rl=class extends ii{constructor(t,e,n,s){super(t,e,n,s)}};rl.prototype.ValueTypeName="vector";var bo={enabled:!1,files:{},add:function(i,t){this.enabled!==!1&&(Hu(i)||(this.files[i]=t))},get:function(i){if(this.enabled!==!1&&!Hu(i))return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}};function Hu(i){try{let t=i.slice(i.indexOf(":")+1);return new URL(t).protocol==="blob:"}catch{return!1}}var al=class{constructor(t,e,n){let s=this,r=!1,a=0,o=0,c,h=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this._abortController=null,this.itemStart=function(d){o++,r===!1&&s.onStart!==void 0&&s.onStart(d,a,o),r=!0},this.itemEnd=function(d){a++,s.onProgress!==void 0&&s.onProgress(d,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(d){s.onError!==void 0&&s.onError(d)},this.resolveURL=function(d){return d=d.normalize("NFC"),c?c(d):d},this.setURLModifier=function(d){return c=d,this},this.addHandler=function(d,_){return h.push(d,_),this},this.removeHandler=function(d){let _=h.indexOf(d);return _!==-1&&h.splice(_,2),this},this.getHandler=function(d){for(let _=0,u=h.length;_<u;_+=2){let m=h[_],M=h[_+1];if(m.global&&(m.lastIndex=0),m.test(d))return M}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Od=new al,Ar=class{constructor(t){this.manager=t!==void 0?t:Od,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(t,e){let n=this;return new Promise(function(s,r){n.load(t,s,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}};Ar.DEFAULT_MATERIAL_NAME="__DEFAULT";var ur=new WeakMap,ol=class extends Ar{constructor(t){super(t)}load(t,e,n,s){this.path!==void 0&&(t=this.path+t),t=this.manager.resolveURL(t);let r=this,a=bo.get(`image:${t}`);if(a!==void 0){if(a.complete===!0)r.manager.itemStart(t),setTimeout(function(){e&&e(a),r.manager.itemEnd(t)},0);else{let _=ur.get(a);_===void 0&&(_=[],ur.set(a,_)),_.push({onLoad:e,onError:s})}return a}let o=_r("img");function c(){d(),e&&e(this);let _=ur.get(this)||[];for(let u=0;u<_.length;u++){let m=_[u];m.onLoad&&m.onLoad(this)}ur.delete(this),r.manager.itemEnd(t)}function h(_){d(),s&&s(_),bo.remove(`image:${t}`);let u=ur.get(this)||[];for(let m=0;m<u.length;m++){let M=u[m];M.onError&&M.onError(_)}ur.delete(this),r.manager.itemError(t),r.manager.itemEnd(t)}function d(){o.removeEventListener("load",c,!1),o.removeEventListener("error",h,!1)}return o.addEventListener("load",c,!1),o.addEventListener("error",h,!1),t.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),bo.add(`image:${t}`,o),r.manager.itemStart(t),o.src=t,o}};var _a=class extends Ar{constructor(t){super(t)}load(t,e,n,s){let r=new Ln,a=new ol(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(t,function(o){r.image=o,r.needsUpdate=!0,e!==void 0&&e(r)},n,s),r}},xa=class extends gn{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new jt(t),this.intensity=e}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,e}},va=class extends xa{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(gn.DEFAULT_UP),this.updateMatrix(),this.groundColor=new jt(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}toJSON(t){let e=super.toJSON(t);return e.object.groundColor=this.groundColor.getHex(),e}},Xc=new Oe,Wu=new N,Xu=new N,ll=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new kt(512,512),this.mapType=qn,this.map=null,this.mapPass=null,this.matrix=new Oe,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Sr,this._frameExtents=new kt(1,1),this._viewportCount=1,this._viewports=[new qe(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera;Wu.setFromMatrixPosition(t.matrixWorld),e.position.copy(Wu),Xu.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(Xu),e.updateMatrixWorld(),this._updateMatrix(e,this.matrix,this._frustum)}_updateMatrix(t,e,n,s){Xc.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),n.setFromProjectionMatrix(Xc,t.coordinateSystem,t.reversedDepth);let r=this._frameExtents,a=s?s.z/r.x:1,o=s?s.w/r.y:1,c=s?s.x/r.x:0,h=s?s.y/r.y:0;t.coordinateSystem===gr||t.reversedDepth?e.set(.5*a,0,0,.5*a+c,0,.5*o,0,.5*o+h,0,0,1,0,0,0,0,1):e.set(.5*a,0,0,.5*a+c,0,.5*o,0,.5*o+h,0,0,.5,.5,0,0,0,1),e.multiply(Xc)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this.biasNode=t.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return t.intensity=this.intensity,t.bias=this.bias,t.normalBias=this.normalBias,t.radius=this.radius,t.blurSamples=this.blurSamples,t.mapSize=this.mapSize.toArray(),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}},vo=new N,yo=new li,Ri=new N,ya=class extends gn{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Oe,this.projectionMatrix=new Oe,this.projectionMatrixInverse=new Oe,this.coordinateSystem=xi,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorld.decompose(vo,yo,Ri),Ri.x===1&&Ri.y===1&&Ri.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(vo,yo,Ri.set(1,1,1)).invert()}updateWorldMatrix(t,e,n=!1){super.updateWorldMatrix(t,e,n),this.matrixWorld.decompose(vo,yo,Ri),Ri.x===1&&Ri.y===1&&Ri.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(vo,yo,Ri.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},rs=new N,qu=new kt,Yu=new kt,In=class extends ya{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=No*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(xc*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return No*2*Math.atan(Math.tan(xc*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){rs.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(rs.x,rs.y).multiplyScalar(-t/rs.z),rs.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(rs.x,rs.y).multiplyScalar(-t/rs.z)}getViewSize(t,e){return this.getViewBounds(t,qu,Yu),e.subVectors(Yu,qu)}setViewOffset(t,e,n,s,r,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(xc*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let c=a.fullWidth,h=a.fullHeight;r+=a.offsetX*s/c,e-=a.offsetY*n/h,s*=a.width/c,n*=a.height/h}let o=this.filmOffset;o!==0&&(r+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}};var Er=class extends ya{constructor(t=-1,e=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-t,a=n+t,o=s+e,c=s-e;if(this.view!==null&&this.view.enabled){let h=(this.right-this.left)/this.view.fullWidth/this.zoom,d=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=h*this.view.offsetX,a=r+h*this.view.width,o-=d*this.view.offsetY,c=o-d*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},jc=class extends ll{constructor(){super(new Er(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Ma=class extends xa{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(gn.DEFAULT_UP),this.updateMatrix(),this.target=new gn,this.shadow=new jc}dispose(){super.dispose(),this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}toJSON(t){let e=super.toJSON(t);return e.object.shadow=this.shadow.toJSON(),e.object.target=this.target.uuid,e}};var dr=-90,fr=1,cl=class extends gn{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new In(dr,fr,t,e);s.layers=this.layers,this.add(s);let r=new In(dr,fr,t,e);r.layers=this.layers,this.add(r);let a=new In(dr,fr,t,e);a.layers=this.layers,this.add(a);let o=new In(dr,fr,t,e);o.layers=this.layers,this.add(o);let c=new In(dr,fr,t,e);c.layers=this.layers,this.add(c);let h=new In(dr,fr,t,e);h.layers=this.layers,this.add(h)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[n,s,r,a,o,c]=e;for(let h of e)this.remove(h);if(t===xi)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(t===gr)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let h of e)this.add(h),h.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,c,h,d]=this.children,_=t.getRenderTarget(),u=t.getActiveCubeFace(),m=t.getActiveMipmapLevel(),M=t.xr.enabled;t.xr.enabled=!1;let T=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let v=!1;t.isWebGLRenderer===!0?v=t.state.buffers.depth.getReversed():v=t.reversedDepthBuffer,t.setRenderTarget(n,0,s),v&&t.autoClear===!1&&t.clearDepth(),t.render(e,r),t.setRenderTarget(n,1,s),v&&t.autoClear===!1&&t.clearDepth(),t.render(e,a),t.setRenderTarget(n,2,s),v&&t.autoClear===!1&&t.clearDepth(),t.render(e,o),t.setRenderTarget(n,3,s),v&&t.autoClear===!1&&t.clearDepth(),t.render(e,c),t.setRenderTarget(n,4,s),v&&t.autoClear===!1&&t.clearDepth(),t.render(e,h),n.texture.generateMipmaps=T,t.setRenderTarget(n,5,s),v&&t.autoClear===!1&&t.clearDepth(),t.render(e,d),t.setRenderTarget(_,u,m),t.xr.enabled=M,n.texture.needsPMREMUpdate=!0}},hl=class extends In{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}};var Ah="\\[\\]\\.:\\/",Xp=new RegExp("["+Ah+"]","g"),Eh="[^"+Ah+"]",qp="[^"+Ah.replace("\\.","")+"]",Yp=/((?:WC+[\/:])*)/.source.replace("WC",Eh),Zp=/(WCOD+)?/.source.replace("WCOD",qp),$p=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Eh),Jp=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Eh),Kp=new RegExp("^"+Yp+Zp+$p+Jp+"$"),jp=["material","materials","bones","map"],Qc=class{constructor(t,e,n){let s=n||He.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,s)}getValue(t,e){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(t,e)}setValue(t,e){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].unbind()}},He=class i{constructor(t,e,n){this.path=e,this.parsedPath=n||i.parseTrackName(e),this.node=i.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,n){return t&&t.isAnimationObjectGroup?new i.Composite(t,e,n):new i(t,e,n)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(Xp,"")}static parseTrackName(t){let e=Kp.exec(t);if(e===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+t);let n={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);jp.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+t);return n}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let n=t.skeleton.getBoneByName(e);if(n!==void 0)return n}if(t.children){let n=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===e||o.uuid===e)return o;let c=n(o.children);if(c)return c}return null},s=n(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)t[e++]=n[s]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,n=e.objectName,s=e.propertyName,r=e.propertyIndex;if(t||(t=i.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){Qt("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let h=e.objectIndex;switch(n){case"materials":if(!t.material){ne("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){ne("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){ne("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let d=0;d<t.length;d++)if(t[d].name===h){h=d;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){ne("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){ne("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[n]===void 0){ne("PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[n]}if(h!==void 0){if(t[h]===void 0){ne("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[h]}}let a=t[s];if(a===void 0){let h=e.nodeName;ne("PropertyBinding: Trying to update property for track: "+h+"."+s+" but it wasn't found.",t);return}let o=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?o=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){ne("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){ne("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}c=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(c=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};He.Composite=Qc;He.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};He.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};He.prototype.GetterByBindingType=[He.prototype._getValue_direct,He.prototype._getValue_array,He.prototype._getValue_arrayElement,He.prototype._getValue_toArray];He.prototype.SetterByBindingTypeAndVersioning=[[He.prototype._setValue_direct,He.prototype._setValue_direct_setNeedsUpdate,He.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[He.prototype._setValue_array,He.prototype._setValue_array_setNeedsUpdate,He.prototype._setValue_array_setMatrixWorldNeedsUpdate],[He.prototype._setValue_arrayElement,He.prototype._setValue_arrayElement_setNeedsUpdate,He.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[He.prototype._setValue_fromArray,He.prototype._setValue_fromArray_setNeedsUpdate,He.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Jx=new Float32Array(1);var Zu=new Oe,Sa=class{constructor(t,e,n=0,s=1/0){this.ray=new Ns(t,e),this.near=n,this.far=s,this.camera=null,this.layers=new yr,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,e.projectionMatrix.elements[14]).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):ne("Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return Zu.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Zu),this}intersectObject(t,e=!0,n=[]){return th(t,this,n,e),n.sort($u),n}intersectObjects(t,e=!0,n=[]){for(let s=0,r=t.length;s<r;s++)th(t[s],this,n,e);return n.sort($u),n}};function $u(i,t){return i.distance-t.distance}function th(i,t,e,n){let s=!0;if(i.layers.test(t.layers)&&i.raycast(t,e)===!1&&(s=!1),s===!0&&n===!0){let r=i.children;for(let a=0,o=r.length;a<o;a++)th(r[a],t,e,!0)}}var Dh=class Dh{constructor(t,e,n,s){this.elements=[1,0,0,1],t!==void 0&&this.set(t,e,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(t,e=0){for(let n=0;n<4;n++)this.elements[n]=t[n+e];return this}set(t,e,n,s){let r=this.elements;return r[0]=t,r[2]=e,r[1]=n,r[3]=s,this}};Dh.prototype.isMatrix2=!0;var eh=Dh;function Ch(i,t,e,n){let s=Qp(n);switch(e){case vh:return i*t;case Mh:return i*t/s.components*s.byteLength;case vl:return i*t/s.components*s.byteLength;case ws:return i*t*2/s.components*s.byteLength;case yl:return i*t*2/s.components*s.byteLength;case yh:return i*t*3/s.components*s.byteLength;case ui:return i*t*4/s.components*s.byteLength;case Ml:return i*t*4/s.components*s.byteLength;case Aa:case Ea:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Ca:case Ra:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case bl:case Tl:return Math.max(i,16)*Math.max(t,8)/4;case Sl:case wl:return Math.max(i,8)*Math.max(t,8)/2;case Al:case El:case Rl:case Pl:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Cl:case Pa:case Il:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Ll:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Dl:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case Nl:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case Ul:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case Fl:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case Ol:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case Bl:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case kl:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case zl:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case Vl:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case Gl:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case Hl:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case Wl:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case Xl:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case ql:case Yl:case Zl:return Math.ceil(i/4)*Math.ceil(t/4)*16;case $l:case Jl:return Math.ceil(i/4)*Math.ceil(t/4)*8;case Ia:case Kl:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function Qp(i){switch(i){case qn:case mh:return{byteLength:1,components:1};case Rr:case gh:case Ti:return{byteLength:2,components:1};case _l:case xl:return{byteLength:2,components:4};case bi:case gl:case wi:return{byteLength:4,components:1};case _h:case xh:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?Qt("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function af(){let i=null,t=!1,e=null,n=null;function s(r,a){n=i.requestAnimationFrame(s),e(r,a)}return{start:function(){t!==!0&&e!==null&&i!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function em(i){let t=new WeakMap;function e(o,c){let h=o.array,d=o.usage,_=h.byteLength,u=i.createBuffer();i.bindBuffer(c,u),i.bufferData(c,h,d),o.onUploadCallback();let m;if(h instanceof Float32Array)m=i.FLOAT;else if(typeof Float16Array<"u"&&h instanceof Float16Array)m=i.HALF_FLOAT;else if(h instanceof Uint16Array)o.isFloat16BufferAttribute?m=i.HALF_FLOAT:m=i.UNSIGNED_SHORT;else if(h instanceof Int16Array)m=i.SHORT;else if(h instanceof Uint32Array)m=i.UNSIGNED_INT;else if(h instanceof Int32Array)m=i.INT;else if(h instanceof Int8Array)m=i.BYTE;else if(h instanceof Uint8Array)m=i.UNSIGNED_BYTE;else if(h instanceof Uint8ClampedArray)m=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+h);return{buffer:u,type:m,bytesPerElement:h.BYTES_PER_ELEMENT,version:o.version,size:_}}function n(o,c,h){let d=c.array,_=c.updateRanges;if(i.bindBuffer(h,o),_.length===0)i.bufferSubData(h,0,d);else{_.sort((m,M)=>m.start-M.start);let u=0;for(let m=1;m<_.length;m++){let M=_[u],T=_[m];T.start<=M.start+M.count+1?M.count=Math.max(M.count,T.start+T.count-M.start):(++u,_[u]=T)}_.length=u+1;for(let m=0,M=_.length;m<M;m++){let T=_[m];i.bufferSubData(h,T.start*d.BYTES_PER_ELEMENT,d,T.start,T.count)}c.clearUpdateRanges()}c.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let c=t.get(o);c&&(i.deleteBuffer(c.buffer),t.delete(o))}function a(o,c){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let d=t.get(o);(!d||d.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let h=t.get(o);if(h===void 0)t.set(o,e(o,c));else if(h.version<o.version){if(h.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(h.buffer,o,c),h.version=o.version}}return{get:s,remove:r,update:a}}var nm=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,im=`#ifdef USE_ALPHAHASH
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
#endif`,sm=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,rm=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,am=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,om=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,lm=`#ifdef USE_AOMAP
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
#endif`,cm=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,hm=`#ifdef USE_BATCHING
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
#endif`,um=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,dm=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,fm=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,pm=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,mm=`#ifdef USE_IRIDESCENCE
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
#endif`,gm=`#ifdef USE_BUMPMAP
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
#endif`,_m=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,xm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,vm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,ym=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Mm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Sm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,bm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,wm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,Tm=`#define PI 3.141592653589793
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
} // validated`,Am=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,Em=`vec3 transformedNormal = objectNormal;
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
#endif`,Cm=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Rm=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Pm=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Im=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Lm="gl_FragColor = linearToOutputTexel( gl_FragColor );",Dm=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Nm=`#ifdef USE_ENVMAP
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
#endif`,Um=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,Fm=`#ifdef USE_ENVMAP
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
#endif`,Om=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Bm=`#ifdef USE_ENVMAP
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
#endif`,km=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,zm=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Vm=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Gm=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Hm=`#ifdef USE_GRADIENTMAP
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
}`,Wm=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Xm=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,qm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Ym=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,Zm=`#ifdef USE_ENVMAP
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
#endif`,$m=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Jm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Km=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,jm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Qm=`PhysicalMaterial material;
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
#endif`,t0=`uniform sampler2D dfgLUT;
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
}`,e0=`
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
#endif`,n0=`#if defined( RE_IndirectDiffuse )
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
#endif`,i0=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,s0=`#ifdef USE_LIGHT_PROBES_GRID
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
#endif`,r0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,a0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,o0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,l0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,c0=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,h0=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,u0=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,d0=`#if defined( USE_POINTS_UV )
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
#endif`,f0=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,p0=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,m0=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,g0=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,_0=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,x0=`#ifdef USE_MORPHTARGETS
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
#endif`,v0=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,y0=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,M0=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,S0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,b0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,w0=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,T0=`#ifdef USE_NORMALMAP
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
#endif`,A0=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,E0=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,C0=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,R0=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,P0=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,I0=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,L0=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,D0=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,N0=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,U0=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,F0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,O0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,B0=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,k0=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,z0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,V0=`float getShadowMask() {
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
}`,G0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,H0=`#ifdef USE_SKINNING
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
#endif`,W0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,X0=`#ifdef USE_SKINNING
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
#endif`,q0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Y0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Z0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,$0=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,J0=`#ifdef USE_TRANSMISSION
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
#endif`,K0=`#ifdef USE_TRANSMISSION
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
#endif`,j0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Q0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,tg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,eg=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,ng=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,ig=`uniform sampler2D t2D;
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
}`,sg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,rg=`#ifdef ENVMAP_TYPE_CUBE
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
}`,ag=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,og=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,lg=`#include <common>
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
}`,cg=`#if DEPTH_PACKING == 3200
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
}`,hg=`#define DISTANCE
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
}`,ug=`#define DISTANCE
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
}`,dg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,fg=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,pg=`uniform float scale;
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
}`,mg=`uniform vec3 diffuse;
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
}`,gg=`#include <common>
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
}`,_g=`uniform vec3 diffuse;
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
}`,xg=`#define LAMBERT
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
}`,vg=`#define LAMBERT
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
}`,yg=`#define MATCAP
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
}`,Mg=`#define MATCAP
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
}`,Sg=`#define NORMAL
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
}`,bg=`#define NORMAL
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
}`,wg=`#define PHONG
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
}`,Tg=`#define PHONG
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
}`,Ag=`#define STANDARD
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
}`,Eg=`#define STANDARD
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
}`,Cg=`#define TOON
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
}`,Rg=`#define TOON
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
}`,Pg=`uniform float size;
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
}`,Ig=`uniform vec3 diffuse;
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
}`,Lg=`#include <common>
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
}`,Dg=`uniform vec3 color;
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
}`,Ng=`uniform float rotation;
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
}`,Ug=`uniform vec3 diffuse;
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
}`,me={alphahash_fragment:nm,alphahash_pars_fragment:im,alphamap_fragment:sm,alphamap_pars_fragment:rm,alphatest_fragment:am,alphatest_pars_fragment:om,aomap_fragment:lm,aomap_pars_fragment:cm,batching_pars_vertex:hm,batching_vertex:um,begin_vertex:dm,beginnormal_vertex:fm,bsdfs:pm,iridescence_fragment:mm,bumpmap_pars_fragment:gm,clipping_planes_fragment:_m,clipping_planes_pars_fragment:xm,clipping_planes_pars_vertex:vm,clipping_planes_vertex:ym,color_fragment:Mm,color_pars_fragment:Sm,color_pars_vertex:bm,color_vertex:wm,common:Tm,cube_uv_reflection_fragment:Am,defaultnormal_vertex:Em,displacementmap_pars_vertex:Cm,displacementmap_vertex:Rm,emissivemap_fragment:Pm,emissivemap_pars_fragment:Im,colorspace_fragment:Lm,colorspace_pars_fragment:Dm,envmap_fragment:Nm,envmap_common_pars_fragment:Um,envmap_pars_fragment:Fm,envmap_pars_vertex:Om,envmap_physical_pars_fragment:Zm,envmap_vertex:Bm,fog_vertex:km,fog_pars_vertex:zm,fog_fragment:Vm,fog_pars_fragment:Gm,gradientmap_pars_fragment:Hm,lightmap_pars_fragment:Wm,lights_lambert_fragment:Xm,lights_lambert_pars_fragment:qm,lights_pars_begin:Ym,lights_toon_fragment:$m,lights_toon_pars_fragment:Jm,lights_phong_fragment:Km,lights_phong_pars_fragment:jm,lights_physical_fragment:Qm,lights_physical_pars_fragment:t0,lights_fragment_begin:e0,lights_fragment_maps:n0,lights_fragment_end:i0,lightprobes_pars_fragment:s0,logdepthbuf_fragment:r0,logdepthbuf_pars_fragment:a0,logdepthbuf_pars_vertex:o0,logdepthbuf_vertex:l0,map_fragment:c0,map_pars_fragment:h0,map_particle_fragment:u0,map_particle_pars_fragment:d0,metalnessmap_fragment:f0,metalnessmap_pars_fragment:p0,morphinstance_vertex:m0,morphcolor_vertex:g0,morphnormal_vertex:_0,morphtarget_pars_vertex:x0,morphtarget_vertex:v0,normal_fragment_begin:y0,normal_fragment_maps:M0,normal_pars_fragment:S0,normal_pars_vertex:b0,normal_vertex:w0,normalmap_pars_fragment:T0,clearcoat_normal_fragment_begin:A0,clearcoat_normal_fragment_maps:E0,clearcoat_pars_fragment:C0,iridescence_pars_fragment:R0,opaque_fragment:P0,packing:I0,premultiplied_alpha_fragment:L0,project_vertex:D0,dithering_fragment:N0,dithering_pars_fragment:U0,roughnessmap_fragment:F0,roughnessmap_pars_fragment:O0,shadowmap_pars_fragment:B0,shadowmap_pars_vertex:k0,shadowmap_vertex:z0,shadowmask_pars_fragment:V0,skinbase_vertex:G0,skinning_pars_vertex:H0,skinning_vertex:W0,skinnormal_vertex:X0,specularmap_fragment:q0,specularmap_pars_fragment:Y0,tonemapping_fragment:Z0,tonemapping_pars_fragment:$0,transmission_fragment:J0,transmission_pars_fragment:K0,uv_pars_fragment:j0,uv_pars_vertex:Q0,uv_vertex:tg,worldpos_vertex:eg,background_vert:ng,background_frag:ig,backgroundCube_vert:sg,backgroundCube_frag:rg,cube_vert:ag,cube_frag:og,depth_vert:lg,depth_frag:cg,distance_vert:hg,distance_frag:ug,equirect_vert:dg,equirect_frag:fg,linedashed_vert:pg,linedashed_frag:mg,meshbasic_vert:gg,meshbasic_frag:_g,meshlambert_vert:xg,meshlambert_frag:vg,meshmatcap_vert:yg,meshmatcap_frag:Mg,meshnormal_vert:Sg,meshnormal_frag:bg,meshphong_vert:wg,meshphong_frag:Tg,meshphysical_vert:Ag,meshphysical_frag:Eg,meshtoon_vert:Cg,meshtoon_frag:Rg,points_vert:Pg,points_frag:Ig,shadow_vert:Lg,shadow_frag:Dg,sprite_vert:Ng,sprite_frag:Ug},Dt={common:{diffuse:{value:new jt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new ae},alphaMap:{value:null},alphaMapTransform:{value:new ae},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new ae}},envmap:{envMap:{value:null},envMapRotation:{value:new ae},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new ae}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new ae}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new ae},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new ae},normalScale:{value:new kt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new ae},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new ae}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new ae}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new ae}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new jt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new N},probesMax:{value:new N},probesResolution:{value:new N}},points:{diffuse:{value:new jt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new ae},alphaTest:{value:0},uvTransform:{value:new ae}},sprite:{diffuse:{value:new jt(16777215)},opacity:{value:1},center:{value:new kt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new ae},alphaMap:{value:null},alphaMapTransform:{value:new ae},alphaTest:{value:0}}},Bi={basic:{uniforms:Nn([Dt.common,Dt.specularmap,Dt.envmap,Dt.aomap,Dt.lightmap,Dt.fog]),vertexShader:me.meshbasic_vert,fragmentShader:me.meshbasic_frag},lambert:{uniforms:Nn([Dt.common,Dt.specularmap,Dt.envmap,Dt.aomap,Dt.lightmap,Dt.emissivemap,Dt.bumpmap,Dt.normalmap,Dt.displacementmap,Dt.fog,Dt.lights,{emissive:{value:new jt(0)},envMapIntensity:{value:1}}]),vertexShader:me.meshlambert_vert,fragmentShader:me.meshlambert_frag},phong:{uniforms:Nn([Dt.common,Dt.specularmap,Dt.envmap,Dt.aomap,Dt.lightmap,Dt.emissivemap,Dt.bumpmap,Dt.normalmap,Dt.displacementmap,Dt.fog,Dt.lights,{emissive:{value:new jt(0)},specular:{value:new jt(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:me.meshphong_vert,fragmentShader:me.meshphong_frag},standard:{uniforms:Nn([Dt.common,Dt.envmap,Dt.aomap,Dt.lightmap,Dt.emissivemap,Dt.bumpmap,Dt.normalmap,Dt.displacementmap,Dt.roughnessmap,Dt.metalnessmap,Dt.fog,Dt.lights,{emissive:{value:new jt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:me.meshphysical_vert,fragmentShader:me.meshphysical_frag},toon:{uniforms:Nn([Dt.common,Dt.aomap,Dt.lightmap,Dt.emissivemap,Dt.bumpmap,Dt.normalmap,Dt.displacementmap,Dt.gradientmap,Dt.fog,Dt.lights,{emissive:{value:new jt(0)}}]),vertexShader:me.meshtoon_vert,fragmentShader:me.meshtoon_frag},matcap:{uniforms:Nn([Dt.common,Dt.bumpmap,Dt.normalmap,Dt.displacementmap,Dt.fog,{matcap:{value:null}}]),vertexShader:me.meshmatcap_vert,fragmentShader:me.meshmatcap_frag},points:{uniforms:Nn([Dt.points,Dt.fog]),vertexShader:me.points_vert,fragmentShader:me.points_frag},dashed:{uniforms:Nn([Dt.common,Dt.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:me.linedashed_vert,fragmentShader:me.linedashed_frag},depth:{uniforms:Nn([Dt.common,Dt.displacementmap]),vertexShader:me.depth_vert,fragmentShader:me.depth_frag},normal:{uniforms:Nn([Dt.common,Dt.bumpmap,Dt.normalmap,Dt.displacementmap,{opacity:{value:1}}]),vertexShader:me.meshnormal_vert,fragmentShader:me.meshnormal_frag},sprite:{uniforms:Nn([Dt.sprite,Dt.fog]),vertexShader:me.sprite_vert,fragmentShader:me.sprite_frag},background:{uniforms:{uvTransform:{value:new ae},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:me.background_vert,fragmentShader:me.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new ae}},vertexShader:me.backgroundCube_vert,fragmentShader:me.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:me.cube_vert,fragmentShader:me.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:me.equirect_vert,fragmentShader:me.equirect_frag},distance:{uniforms:Nn([Dt.common,Dt.displacementmap,{referencePosition:{value:new N},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:me.distance_vert,fragmentShader:me.distance_frag},shadow:{uniforms:Nn([Dt.lights,Dt.fog,{color:{value:new jt(0)},opacity:{value:1}}]),vertexShader:me.shadow_vert,fragmentShader:me.shadow_frag}};Bi.physical={uniforms:Nn([Bi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new ae},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new ae},clearcoatNormalScale:{value:new kt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new ae},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new ae},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new ae},sheen:{value:0},sheenColor:{value:new jt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new ae},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new ae},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new ae},transmissionSamplerSize:{value:new kt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new ae},attenuationDistance:{value:0},attenuationColor:{value:new jt(0)},specularColor:{value:new jt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new ae},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new ae},anisotropyVector:{value:new kt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new ae}}]),vertexShader:me.meshphysical_vert,fragmentShader:me.meshphysical_frag};var ec={r:0,b:0,g:0},Fg=new Oe,of=new ae;of.set(-1,0,0,0,1,0,0,0,1);function Og(i,t,e,n,s,r){let a=new jt(0),o=s===!0?0:1,c,h,d=null,_=0,u=null;function m(R){let D=R.isScene===!0?R.background:null;if(D&&D.isTexture){let E=R.backgroundBlurriness>0;D=t.get(D,E)}return D}function M(R){let D=!1,E=m(R);E===null?v(a,o):E&&E.isColor&&(v(E,1),D=!0);let I=i.xr.getEnvironmentBlendMode();I==="additive"?e.buffers.color.setClear(0,0,0,1,r):I==="alpha-blend"&&e.buffers.color.setClear(0,0,0,0,r),(i.autoClear||D)&&(e.buffers.depth.setTest(!0),e.buffers.depth.setMask(!0),e.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function T(R,D){let E=m(D);E&&(E.isCubeTexture||E.mapping===wa)?(h===void 0&&(h=new ce(new Mi(1,1,1),new dn({name:"BackgroundCubeMaterial",uniforms:Vs(Bi.backgroundCube.uniforms),vertexShader:Bi.backgroundCube.vertexShader,fragmentShader:Bi.backgroundCube.fragmentShader,side:Sn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(I,P,U){this.matrixWorld.copyPosition(U.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(h)),h.material.uniforms.envMap.value=E,h.material.uniforms.backgroundBlurriness.value=D.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=D.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(Fg.makeRotationFromEuler(D.backgroundRotation)).transpose(),E.isCubeTexture&&E.isRenderTargetTexture===!1&&h.material.uniforms.backgroundRotation.value.premultiply(of),h.material.toneMapped=Se.getTransfer(E.colorSpace)!==Le,(d!==E||_!==E.version||u!==i.toneMapping)&&(h.material.needsUpdate=!0,d=E,_=E.version,u=i.toneMapping),h.layers.enableAll(),R.unshift(h,h.geometry,h.material,0,0,null)):E&&E.isTexture&&(c===void 0&&(c=new ce(new Ui(2,2),new dn({name:"BackgroundMaterial",uniforms:Vs(Bi.background.uniforms),vertexShader:Bi.background.vertexShader,fragmentShader:Bi.background.fragmentShader,side:vs,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(c)),c.material.uniforms.t2D.value=E,c.material.uniforms.backgroundIntensity.value=D.backgroundIntensity,c.material.toneMapped=Se.getTransfer(E.colorSpace)!==Le,E.matrixAutoUpdate===!0&&E.updateMatrix(),c.material.uniforms.uvTransform.value.copy(E.matrix),(d!==E||_!==E.version||u!==i.toneMapping)&&(c.material.needsUpdate=!0,d=E,_=E.version,u=i.toneMapping),c.layers.enableAll(),R.unshift(c,c.geometry,c.material,0,0,null))}function v(R,D){R.getRGB(ec,Th(i)),e.buffers.color.setClear(ec.r,ec.g,ec.b,D,r)}function g(){h!==void 0&&(h.geometry.dispose(),h.material.dispose(),h=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return a},setClearColor:function(R,D=1){a.set(R),o=D,v(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(R){o=R,v(a,o)},render:M,addToRenderList:T,dispose:g}}function Bg(i,t){let e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=u(null),r=s,a=!1;function o(H,Y,Q,z,tt){let dt=!1,ht=_(H,z,Q,Y);r!==ht&&(r=ht,h(r.object)),dt=m(H,z,Q,tt),dt&&M(H,z,Q,tt),tt!==null&&t.update(tt,i.ELEMENT_ARRAY_BUFFER),(dt||a)&&(a=!1,E(H,Y,Q,z),tt!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(tt).buffer))}function c(){return i.createVertexArray()}function h(H){return i.bindVertexArray(H)}function d(H){return i.deleteVertexArray(H)}function _(H,Y,Q,z){let tt=z.wireframe===!0,dt=n[Y.id];dt===void 0&&(dt={},n[Y.id]=dt);let ht=H.isInstancedMesh===!0?H.id:0,yt=dt[ht];yt===void 0&&(yt={},dt[ht]=yt);let rt=yt[Q.id];rt===void 0&&(rt={},yt[Q.id]=rt);let q=rt[tt];return q===void 0&&(q=u(c()),rt[tt]=q),q}function u(H){let Y=[],Q=[],z=[];for(let tt=0;tt<e;tt++)Y[tt]=0,Q[tt]=0,z[tt]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:Y,enabledAttributes:Q,attributeDivisors:z,object:H,attributes:{},index:null}}function m(H,Y,Q,z){let tt=r.attributes,dt=Y.attributes,ht=0,yt=Q.getAttributes();for(let rt in yt)if(yt[rt].location>=0){let _t=tt[rt],qt=dt[rt];if(qt===void 0&&(rt==="instanceMatrix"&&H.instanceMatrix&&(qt=H.instanceMatrix),rt==="instanceColor"&&H.instanceColor&&(qt=H.instanceColor)),_t===void 0||_t.attribute!==qt||qt&&_t.data!==qt.data)return!0;ht++}return r.attributesNum!==ht||r.index!==z}function M(H,Y,Q,z){let tt={},dt=Y.attributes,ht=0,yt=Q.getAttributes();for(let rt in yt)if(yt[rt].location>=0){let _t=dt[rt];_t===void 0&&(rt==="instanceMatrix"&&H.instanceMatrix&&(_t=H.instanceMatrix),rt==="instanceColor"&&H.instanceColor&&(_t=H.instanceColor));let qt={};qt.attribute=_t,_t&&_t.data&&(qt.data=_t.data),tt[rt]=qt,ht++}r.attributes=tt,r.attributesNum=ht,r.index=z}function T(){let H=r.newAttributes;for(let Y=0,Q=H.length;Y<Q;Y++)H[Y]=0}function v(H){g(H,0)}function g(H,Y){let Q=r.newAttributes,z=r.enabledAttributes,tt=r.attributeDivisors;Q[H]=1,z[H]===0&&(i.enableVertexAttribArray(H),z[H]=1),tt[H]!==Y&&(i.vertexAttribDivisor(H,Y),tt[H]=Y)}function R(){let H=r.newAttributes,Y=r.enabledAttributes;for(let Q=0,z=Y.length;Q<z;Q++)Y[Q]!==H[Q]&&(i.disableVertexAttribArray(Q),Y[Q]=0)}function D(H,Y,Q,z,tt,dt,ht){ht===!0?i.vertexAttribIPointer(H,Y,Q,tt,dt):i.vertexAttribPointer(H,Y,Q,z,tt,dt)}function E(H,Y,Q,z){T();let tt=z.attributes,dt=Q.getAttributes(),ht=Y.defaultAttributeValues;for(let yt in dt){let rt=dt[yt];if(rt.location>=0){let q=tt[yt];if(q===void 0&&(yt==="instanceMatrix"&&H.instanceMatrix&&(q=H.instanceMatrix),yt==="instanceColor"&&H.instanceColor&&(q=H.instanceColor)),q!==void 0){let _t=q.normalized,qt=q.itemSize,Zt=t.get(q);if(Zt===void 0)continue;let De=Zt.buffer,xe=Zt.type,ge=Zt.bytesPerElement,lt=xe===i.INT||xe===i.UNSIGNED_INT||q.gpuType===gl;if(q.isInterleavedBufferAttribute){let gt=q.data,Bt=gt.stride,te=q.offset;if(gt.isInstancedInterleavedBuffer){for(let St=0;St<rt.locationSize;St++)g(rt.location+St,gt.meshPerAttribute);H.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=gt.meshPerAttribute*gt.count)}else for(let St=0;St<rt.locationSize;St++)v(rt.location+St);i.bindBuffer(i.ARRAY_BUFFER,De);for(let St=0;St<rt.locationSize;St++)D(rt.location+St,qt/rt.locationSize,xe,_t,Bt*ge,(te+qt/rt.locationSize*St)*ge,lt)}else{if(q.isInstancedBufferAttribute){for(let gt=0;gt<rt.locationSize;gt++)g(rt.location+gt,q.meshPerAttribute);H.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=q.meshPerAttribute*q.count)}else for(let gt=0;gt<rt.locationSize;gt++)v(rt.location+gt);i.bindBuffer(i.ARRAY_BUFFER,De);for(let gt=0;gt<rt.locationSize;gt++)D(rt.location+gt,qt/rt.locationSize,xe,_t,qt*ge,qt/rt.locationSize*gt*ge,lt)}}else if(ht!==void 0){let _t=ht[yt];if(_t!==void 0)switch(_t.length){case 2:i.vertexAttrib2fv(rt.location,_t);break;case 3:i.vertexAttrib3fv(rt.location,_t);break;case 4:i.vertexAttrib4fv(rt.location,_t);break;default:i.vertexAttrib1fv(rt.location,_t)}}}}R()}function I(){C();for(let H in n){let Y=n[H];for(let Q in Y){let z=Y[Q];for(let tt in z){let dt=z[tt];for(let ht in dt)d(dt[ht].object),delete dt[ht];delete z[tt]}}delete n[H]}}function P(H){if(n[H.id]===void 0)return;let Y=n[H.id];for(let Q in Y){let z=Y[Q];for(let tt in z){let dt=z[tt];for(let ht in dt)d(dt[ht].object),delete dt[ht];delete z[tt]}}delete n[H.id]}function U(H){for(let Y in n){let Q=n[Y];for(let z in Q){let tt=Q[z];if(tt[H.id]===void 0)continue;let dt=tt[H.id];for(let ht in dt)d(dt[ht].object),delete dt[ht];delete tt[H.id]}}}function b(H){for(let Y in n){let Q=n[Y],z=H.isInstancedMesh===!0?H.id:0,tt=Q[z];if(tt!==void 0){for(let dt in tt){let ht=tt[dt];for(let yt in ht)d(ht[yt].object),delete ht[yt];delete tt[dt]}delete Q[z],Object.keys(Q).length===0&&delete n[Y]}}}function C(){O(),a=!0,r!==s&&(r=s,h(r.object))}function O(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:C,resetDefaultState:O,dispose:I,releaseStatesOfGeometry:P,releaseStatesOfObject:b,releaseStatesOfProgram:U,initAttributes:T,enableAttribute:v,disableUnusedAttributes:R}}function kg(i,t,e){let n;function s(c){n=c}function r(c,h){i.drawArrays(n,c,h),e.update(h,n,1)}function a(c,h,d){d!==0&&(i.drawArraysInstanced(n,c,h,d),e.update(h,n,d))}function o(c,h,d){if(d===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,d);let u=0;for(let m=0;m<d;m++)u+=h[m];e.update(u,n,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function zg(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){let U=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(U.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(U){return!(U!==ui&&n.convert(U)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(U){let b=U===Ti&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(U!==qn&&U!==wi&&!b&&n.convert(U)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function c(U){if(U==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";U="mediump"}return U==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let h=e.precision!==void 0?e.precision:"highp",d=c(h);d!==h&&(Qt("WebGLRenderer:",h,"not supported, using",d,"instead."),h=d);let _=e.logarithmicDepthBuffer===!0,u=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control");e.reversedDepthBuffer===!0&&u===!1&&Qt("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let m=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),M=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),T=i.getParameter(i.MAX_TEXTURE_SIZE),v=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),g=i.getParameter(i.MAX_VERTEX_ATTRIBS),R=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),D=i.getParameter(i.MAX_VARYING_VECTORS),E=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),I=i.getParameter(i.MAX_SAMPLES),P=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:a,textureTypeReadable:o,precision:h,logarithmicDepthBuffer:_,reversedDepthBuffer:u,maxTextures:m,maxVertexTextures:M,maxTextureSize:T,maxCubemapSize:v,maxAttributes:g,maxVertexUniforms:R,maxVaryings:D,maxFragmentUniforms:E,maxSamples:I,samples:P}}function Vg(i){let t=this,e=null,n=0,s=!1,r=!1,a=new _i,o=new ae,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(_,u){let m=_.length!==0||u||n!==0||s;return s=u,n=_.length,m},this.beginShadows=function(){r=!0,d(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(_,u){e=d(_,u,0)},this.setState=function(_,u,m){let M=_.clippingPlanes,T=_.clipIntersection,v=_.clipShadows,g=i.get(_);if(!s||M===null||M.length===0||r&&!v)r?d(null):h();else{let R=r?0:n,D=R*4,E=g.clippingState||null;c.value=E,E=d(M,u,D,m);for(let I=0;I!==D;++I)E[I]=e[I];g.clippingState=E,this.numIntersection=T?this.numPlanes:0,this.numPlanes+=R}};function h(){c.value!==e&&(c.value=e,c.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function d(_,u,m,M){let T=_!==null?_.length:0,v=null;if(T!==0){if(v=c.value,M!==!0||v===null){let g=m+T*4,R=u.matrixWorldInverse;o.getNormalMatrix(R),(v===null||v.length<g)&&(v=new Float32Array(g));for(let D=0,E=m;D!==T;++D,E+=4)a.copy(_[D]).applyMatrix4(R,o),a.normal.toArray(v,E),v[E+3]=a.constant}c.value=v,c.needsUpdate=!0}return t.numPlanes=T,t.numIntersection=0,v}}var Lr=4,Gg=6,Hg=20,Wg=256,La=new Er,Bd=new jt,Nh=null,Uh=0,Fh=0,Oh=!1,Xg=new N,Gs=new N,ic=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(t,e=0,n=.1,s=100,r={}){let{size:a=256,position:o=Xg}=r;Nh=this._renderer.getRenderTarget(),Uh=this._renderer.getActiveCubeFace(),Fh=this._renderer.getActiveMipmapLevel(),Oh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(t,n,s,c,o),e>0&&this._blur(c,0,0,e),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Vd(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=zd(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodMeshes.length;t++)this._lodMeshes[t].geometry.dispose()}_cleanup(t){this._renderer.setRenderTarget(Nh,Uh,Fh),this._renderer.xr.enabled=Oh,t.scissorTest=!1,Ir(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===Ms||t.mapping===zs?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),Nh=this._renderer.getRenderTarget(),Uh=this._renderer.getActiveCubeFace(),Fh=this._renderer.getActiveMipmapLevel(),Oh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:wn,minFilter:wn,generateMipmaps:!1,type:Ti,format:ui,colorSpace:ta,depthBuffer:!1},s=kd(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=kd(t,e,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=qg(r)),this._blurMaterial=Zg(r,t,e),this._ggxMaterial=Yg(r,t,e)}return s}_compileMaterial(t){let e=new ce(new Ie,t);this._renderer.compile(e,La)}_sceneToCubeUV(t,e,n,s,r){let c=new In(90,1,e,n),h=[1,-1,1,1,1,1],d=[1,1,1,-1,-1,-1],_=this._renderer,u=_.autoClear,m=_.toneMapping;_.getClearColor(Bd),_.toneMapping=Si,_.autoClear=!1,_.state.buffers.depth.getReversed()&&(_.setRenderTarget(s),_.clearDepth(),_.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new ce(new Mi,new rn({name:"PMREM.Background",side:Sn,depthWrite:!1,depthTest:!1})));let T=this._backgroundBox,v=T.material,g=!1,R=t.background;R?R.isColor&&(v.color.copy(R),t.background=null,g=!0):(v.color.copy(Bd),g=!0);for(let D=0;D<6;D++){let E=D%3;E===0?(c.up.set(0,h[D],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x+d[D],r.y,r.z)):E===1?(c.up.set(0,0,h[D]),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y+d[D],r.z)):(c.up.set(0,h[D],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y,r.z+d[D]));let I=this._cubeSize;Ir(s,E*I,D>2?I:0,I,I),_.setRenderTarget(s),g&&_.render(T,c),_.render(t,c)}_.toneMapping=m,_.autoClear=u,t.background=R}_textureToCubeUV(t,e){let n=this._renderer,s=t.mapping===Ms||t.mapping===zs;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Vd()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=zd());let r=s?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;let o=r.uniforms;o.envMap.value=t;let c=this._cubeSize;Ir(e,0,0,3*c,2*c),n.setRenderTarget(e),n.render(a,La)}_applyPMREM(t){let e=this._renderer,n=e.autoClear;e.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(t,r-1,r);e.autoClear=n}_applyGGXFilter(t,e,n){let s=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let c=a.uniforms,h=n/(this._lodMeshes.length-1),d=e/(this._lodMeshes.length-1),_=Math.sqrt(h*h-d*d),u=h*1.25,m=_*u,{_lodMax:M}=this,T=this._sizeLods[n],v=3*T*(n>M-Lr?n-M+Lr:0),g=4*(this._cubeSize-T);c.envMap.value=t.texture,c.roughness.value=m,c.mipInt.value=M-e,Ir(r,v,g,3*T,2*T),s.setRenderTarget(r),s.render(o,La),c.envMap.value=r.texture,c.roughness.value=0,c.mipInt.value=M-n,Ir(t,v,g,3*T,2*T),s.setRenderTarget(t),s.render(o,La)}_blur(t,e,n,s){let r=this._pingPongRenderTarget,a=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(t,r,e,n,a),this._blurPass(r,t,n,n,a)}_blurPass(t,e,n,s,r){let a=this._renderer,o=this._blurMaterial,c=this._lodMeshes[s];c.material=o;let h=o.uniforms;h.envMap.value=t.texture,h.sigma.value=r,h.mipInt.value=this._lodMax-n;let d=this._sizeLods[s],_=3*d*(s>this._lodMax-Lr?s-this._lodMax+Lr:0),u=4*(this._cubeSize-d);Ir(e,_,u,3*d,2*d),a.setRenderTarget(e),a.render(c,La)}};function qg(i){let t=[],e=[],n=i,s=i-Lr+1+Gg;for(let r=0;r<s;r++){let a=Math.pow(2,n);t.push(a);let o=1/(a-2),c=-o,h=1+o,d=[c,c,h,c,h,h,c,c,h,h,c,h],_=6,u=6,m=3,M=new Float32Array(m*u*_),T=new Float32Array(m*u*_);for(let g=0;g<_;g++){let R=g%3*2/3-1,D=g>2?0:-1,E=[R,D,0,R+2/3,D,0,R+2/3,D+1,0,R,D,0,R+2/3,D+1,0,R,D+1,0];M.set(E,m*u*g);for(let I=0;I<u;I++){let P=d[I*2]*2-1,U=d[I*2+1]*2-1;g===0?Gs.set(1,U,P):g===1?Gs.set(-P,1,-U):g===2?Gs.set(-P,U,1):g===3?Gs.set(-1,U,-P):g===4?Gs.set(-P,-1,U):Gs.set(P,U,-1),Gs.toArray(T,(g*u+I)*m)}}let v=new Ie;v.setAttribute("position",new ti(M,m)),v.setAttribute("outputDirection",new ti(T,m)),e.push(new ce(v,null)),n>Lr&&n--}return{lodMeshes:e,sizeLods:t}}function kd(i,t,e){let n=new Wn(i,t,e);return n.texture.mapping=wa,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Ir(i,t,e,n,s){i.viewport.set(t,e,n,s),i.scissor.set(t,e,n,s)}function Yg(i,t,e){return new dn({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:Wg,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:ac(),fragmentShader:`

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
		`,blending:Fi,depthTest:!1,depthWrite:!1})}function Zg(i,t,e){return new dn({name:"SphericalGaussianBlur",defines:{SAMPLES:Hg,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:ac(),fragmentShader:`

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
		`,blending:Fi,depthTest:!1,depthWrite:!1})}function zd(){return new dn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:ac(),fragmentShader:`

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
		`,blending:Fi,depthTest:!1,depthWrite:!1})}function Vd(){return new dn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:ac(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Fi,depthTest:!1,depthWrite:!1})}function ac(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var sc=class extends Wn{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new la(s),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new Mi(5,5,5),r=new dn({name:"CubemapFromEquirect",uniforms:Vs(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Sn,blending:Fi});r.uniforms.tEquirect.value=e;let a=new ce(s,r),o=e.minFilter;return e.minFilter===Ss&&(e.minFilter=wn),new cl(1,10,this).update(t,a),e.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(t,e=!0,n=!0,s=!0){let r=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,n,s);t.setRenderTarget(r)}};function $g(i){let t=new WeakMap,e=new WeakMap,n=null;function s(u,m=!1){return u==null?null:m?a(u):r(u)}function r(u){if(u&&u.isTexture){let m=u.mapping;if(m===fl||m===pl)if(t.has(u)){let M=t.get(u).texture;return o(M,u.mapping)}else{let M=u.image;if(M&&M.height>0){let T=new sc(M.height);return T.fromEquirectangularTexture(i,u),t.set(u,T),u.addEventListener("dispose",h),o(T.texture,u.mapping)}else return null}}return u}function a(u){if(u&&u.isTexture){let m=u.mapping,M=m===fl||m===pl,T=m===Ms||m===zs;if(M||T){let v=e.get(u),g=v!==void 0?v.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==g)return n===null&&(n=new ic(i)),v=M?n.fromEquirectangular(u,v):n.fromCubemap(u,v),v.texture.pmremVersion=u.pmremVersion,e.set(u,v),v.texture;if(v!==void 0)return v.texture;{let R=u.image;return M&&R&&R.height>0||T&&R&&c(R)?(n===null&&(n=new ic(i)),v=M?n.fromEquirectangular(u):n.fromCubemap(u),v.texture.pmremVersion=u.pmremVersion,e.set(u,v),u.addEventListener("dispose",d),v.texture):null}}}return u}function o(u,m){return m===fl?u.mapping=Ms:m===pl&&(u.mapping=zs),u}function c(u){let m=0,M=6;for(let T=0;T<M;T++)u[T]!==void 0&&m++;return m===M}function h(u){let m=u.target;m.removeEventListener("dispose",h);let M=t.get(m);M!==void 0&&(t.delete(m),M.dispose())}function d(u){let m=u.target;m.removeEventListener("dispose",d);let M=e.get(m);M!==void 0&&(e.delete(m),M.dispose())}function _(){t=new WeakMap,e=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:_}}function Jg(i){let t={};function e(n){if(t[n]!==void 0)return t[n];let s=i.getExtension(n);return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){let s=e(n);return s===null&&Ds("WebGLRenderer: "+n+" extension not supported."),s}}}function Kg(i,t,e,n){let s={},r=new WeakMap;function a(_){let u=_.target;u.index!==null&&t.remove(u.index);for(let M in u.attributes)t.remove(u.attributes[M]);u.removeEventListener("dispose",a),delete s[u.id];let m=r.get(u);m&&(t.remove(m),r.delete(u)),n.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,e.memory.geometries--}function o(_,u){return s[u.id]===!0||(u.addEventListener("dispose",a),s[u.id]=!0,e.memory.geometries++),u}function c(_){let u=_.attributes;for(let m in u)t.update(u[m],i.ARRAY_BUFFER)}function h(_){let u=[],m=_.index,M=_.attributes.position,T=0;if(M===void 0)return;if(m!==null){let R=m.array;T=m.version;for(let D=0,E=R.length;D<E;D+=3){let I=R[D+0],P=R[D+1],U=R[D+2];u.push(I,P,P,U,U,I)}}else{let R=M.array;T=M.version;for(let D=0,E=R.length/3-1;D<E;D+=3){let I=D+0,P=D+1,U=D+2;u.push(I,P,P,U,U,I)}}let v=new(M.count>=65535?aa:ra)(u,1);v.version=T;let g=r.get(_);g&&t.remove(g),r.set(_,v)}function d(_){let u=r.get(_);if(u){let m=_.index;m!==null&&u.version<m.version&&h(_)}else h(_);return r.get(_)}return{get:o,update:c,getWireframeAttribute:d}}function jg(i,t,e){let n;function s(_){n=_}let r,a;function o(_){r=_.type,a=_.bytesPerElement}function c(_,u){i.drawElements(n,u,r,_*a),e.update(u,n,1)}function h(_,u,m){m!==0&&(i.drawElementsInstanced(n,u,r,_*a,m),e.update(u,n,m))}function d(_,u,m){if(m===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,u,0,r,_,0,m);let T=0;for(let v=0;v<m;v++)T+=u[v];e.update(T,n,1)}this.setMode=s,this.setIndex=o,this.render=c,this.renderInstances=h,this.renderMultiDraw=d}function Qg(i){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(e.calls++,a){case i.TRIANGLES:e.triangles+=o*(r/3);break;case i.LINES:e.lines+=o*(r/2);break;case i.LINE_STRIP:e.lines+=o*(r-1);break;case i.LINE_LOOP:e.lines+=o*r;break;case i.POINTS:e.points+=o*r;break;default:ne("WebGLInfo: Unknown draw mode:",a);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function t_(i,t,e){let n=new WeakMap,s=new qe;function r(a,o,c){let h=a.morphTargetInfluences,d=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,_=d!==void 0?d.length:0,u=n.get(o);if(u===void 0||u.count!==_){let C=function(){U.dispose(),n.delete(o),o.removeEventListener("dispose",C)};u!==void 0&&u.texture.dispose();let m=o.morphAttributes.position!==void 0,M=o.morphAttributes.normal!==void 0,T=o.morphAttributes.color!==void 0,v=o.morphAttributes.position||[],g=o.morphAttributes.normal||[],R=o.morphAttributes.color||[],D=0;m===!0&&(D=1),M===!0&&(D=2),T===!0&&(D=3);let E=o.attributes.position.count*D,I=1;E>t.maxTextureSize&&(I=Math.ceil(E/t.maxTextureSize),E=t.maxTextureSize);let P=new Float32Array(E*I*4*_),U=new ia(P,E,I,_);U.type=wi,U.needsUpdate=!0;let b=D*4;for(let O=0;O<_;O++){let H=v[O],Y=g[O],Q=R[O],z=E*I*4*O;for(let tt=0;tt<H.count;tt++){let dt=tt*b;m===!0&&(s.fromBufferAttribute(H,tt),P[z+dt+0]=s.x,P[z+dt+1]=s.y,P[z+dt+2]=s.z,P[z+dt+3]=0),M===!0&&(s.fromBufferAttribute(Y,tt),P[z+dt+4]=s.x,P[z+dt+5]=s.y,P[z+dt+6]=s.z,P[z+dt+7]=0),T===!0&&(s.fromBufferAttribute(Q,tt),P[z+dt+8]=s.x,P[z+dt+9]=s.y,P[z+dt+10]=s.z,P[z+dt+11]=Q.itemSize===4?s.w:1)}}u={count:_,texture:U,size:new kt(E,I)},n.set(o,u),o.addEventListener("dispose",C)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)c.getUniforms().setValue(i,"morphTexture",a.morphTexture,e);else{let m=0;for(let T=0;T<h.length;T++)m+=h[T];let M=o.morphTargetsRelative?1:1-m;c.getUniforms().setValue(i,"morphTargetBaseInfluence",M),c.getUniforms().setValue(i,"morphTargetInfluences",h)}c.getUniforms().setValue(i,"morphTargetsTexture",u.texture,e),c.getUniforms().setValue(i,"morphTargetsTextureSize",u.size)}return{update:r}}function e_(i,t,e,n,s){let r=new WeakMap;function a(h){let d=s.render.frame,_=h.geometry,u=t.get(h,_);if(r.get(u)!==d&&(t.update(u),r.set(u,d)),h.isInstancedMesh&&(h.hasEventListener("dispose",c)===!1&&h.addEventListener("dispose",c),r.get(h)!==d&&(e.update(h.instanceMatrix,i.ARRAY_BUFFER),h.instanceColor!==null&&e.update(h.instanceColor,i.ARRAY_BUFFER),r.set(h,d))),h.isSkinnedMesh){let m=h.skeleton;r.get(m)!==d&&(m.update(),r.set(m,d))}return u}function o(){r=new WeakMap}function c(h){let d=h.target;d.removeEventListener("dispose",c),n.releaseStatesOfObject(d),e.remove(d.instanceMatrix),d.instanceColor!==null&&e.remove(d.instanceColor)}return{update:a,dispose:o}}var n_={[oh]:"LINEAR_TONE_MAPPING",[lh]:"REINHARD_TONE_MAPPING",[ch]:"CINEON_TONE_MAPPING",[hh]:"ACES_FILMIC_TONE_MAPPING",[dh]:"AGX_TONE_MAPPING",[fh]:"NEUTRAL_TONE_MAPPING",[uh]:"CUSTOM_TONE_MAPPING"};function i_(i,t,e,n,s,r){let a=new Wn(t,e,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,c=null,h=new Ie;h.setAttribute("position",new se([-1,3,0,-1,-1,0,3,-1,0],3)),h.setAttribute("uv",new se([0,2,0,0,2,0],2));let d=new $o({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),_=new ce(h,d),u=new Er(-1,1,1,-1,0,1),m=null,M=null,T=!1,v,g=null,R=[],D=!1;this.setSize=function(E,I){a.setSize(E,I),o!==null&&o.setSize(E,I),c!==null&&c.setSize(E,I);for(let P=0;P<R.length;P++){let U=R[P];U.setSize&&U.setSize(E,I)}},this.setEffects=function(E){R=E,D=R.length>0&&R[0].isRenderPass===!0;let I=a.width,P=a.height;R.length>0&&o===null&&(o=new Wn(I,P,{type:Ti,depthBuffer:!1,stencilBuffer:!1}),c=new Wn(I,P,{type:Ti,depthBuffer:!1,stencilBuffer:!1}));for(let U=0;U<R.length;U++){let b=R[U];b.setSize&&b.setSize(I,P)}},this.begin=function(E,I){if(T||E.toneMapping===Si&&R.length===0)return!1;if(g=I,I!==null){let P=I.width,U=I.height;(a.width!==P||a.height!==U)&&this.setSize(P,U)}return D===!1&&E.setRenderTarget(a),v=E.toneMapping,E.toneMapping=Si,!0},this.hasRenderPass=function(){return D},this.end=function(E,I){E.toneMapping=v,T=!0;let P=a,U=o;for(let b=0;b<R.length;b++){let C=R[b];C.enabled!==!1&&(C.render(E,U,P,I),C.needsSwap!==!1&&(P=U,U=U===o?c:o))}if(m!==E.outputColorSpace||M!==E.toneMapping){m=E.outputColorSpace,M=E.toneMapping,d.defines={},Se.getTransfer(m)===Le&&(d.defines.SRGB_TRANSFER="");let b=n_[M];b&&(d.defines[b]=""),d.needsUpdate=!0}d.uniforms.tDiffuse.value=P.texture,E.setRenderTarget(g),E.render(_,u),g=null,T=!1},this.isCompositing=function(){return T},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),c!==null&&c.dispose(),h.dispose(),d.dispose()}}var lf=new Ln,zh=new hs(1,1),cf=new ia,hf=new Oo,uf=new la,Gd=[],Hd=[],Wd=new Float32Array(16),Xd=new Float32Array(9),qd=new Float32Array(4);function Nr(i,t,e){let n=i[0];if(n<=0||n>0)return i;let s=t*e,r=Gd[s];if(r===void 0&&(r=new Float32Array(s),Gd[s]=r),t!==0){n.toArray(r,0);for(let a=1,o=0;a!==t;++a)o+=e,i[a].toArray(r,o)}return r}function _n(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function xn(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function oc(i,t){let e=Hd[t];e===void 0&&(e=new Int32Array(t),Hd[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function s_(i,t){let e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function r_(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(_n(e,t))return;i.uniform2fv(this.addr,t),xn(e,t)}}function a_(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(_n(e,t))return;i.uniform3fv(this.addr,t),xn(e,t)}}function o_(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(_n(e,t))return;i.uniform4fv(this.addr,t),xn(e,t)}}function l_(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(_n(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),xn(e,t)}else{if(_n(e,n))return;qd.set(n),i.uniformMatrix2fv(this.addr,!1,qd),xn(e,n)}}function c_(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(_n(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),xn(e,t)}else{if(_n(e,n))return;Xd.set(n),i.uniformMatrix3fv(this.addr,!1,Xd),xn(e,n)}}function h_(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(_n(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),xn(e,t)}else{if(_n(e,n))return;Wd.set(n),i.uniformMatrix4fv(this.addr,!1,Wd),xn(e,n)}}function u_(i,t){let e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function d_(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(_n(e,t))return;i.uniform2iv(this.addr,t),xn(e,t)}}function f_(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(_n(e,t))return;i.uniform3iv(this.addr,t),xn(e,t)}}function p_(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(_n(e,t))return;i.uniform4iv(this.addr,t),xn(e,t)}}function m_(i,t){let e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function g_(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(_n(e,t))return;i.uniform2uiv(this.addr,t),xn(e,t)}}function __(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(_n(e,t))return;i.uniform3uiv(this.addr,t),xn(e,t)}}function x_(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(_n(e,t))return;i.uniform4uiv(this.addr,t),xn(e,t)}}function v_(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(zh.compareFunction=e.isReversedDepthBuffer()?tc:Ql,r=zh):r=lf,e.setTexture2D(t||r,s)}function y_(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||hf,s)}function M_(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTextureCube(t||uf,s)}function S_(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||cf,s)}function b_(i){switch(i){case 5126:return s_;case 35664:return r_;case 35665:return a_;case 35666:return o_;case 35674:return l_;case 35675:return c_;case 35676:return h_;case 5124:case 35670:return u_;case 35667:case 35671:return d_;case 35668:case 35672:return f_;case 35669:case 35673:return p_;case 5125:return m_;case 36294:return g_;case 36295:return __;case 36296:return x_;case 35678:case 36198:case 36298:case 36306:case 35682:return v_;case 35679:case 36299:case 36307:return y_;case 35680:case 36300:case 36308:case 36293:return M_;case 36289:case 36303:case 36311:case 36292:return S_}}function w_(i,t){i.uniform1fv(this.addr,t)}function T_(i,t){let e=Nr(t,this.size,2);i.uniform2fv(this.addr,e)}function A_(i,t){let e=Nr(t,this.size,3);i.uniform3fv(this.addr,e)}function E_(i,t){let e=Nr(t,this.size,4);i.uniform4fv(this.addr,e)}function C_(i,t){let e=Nr(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function R_(i,t){let e=Nr(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function P_(i,t){let e=Nr(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function I_(i,t){i.uniform1iv(this.addr,t)}function L_(i,t){i.uniform2iv(this.addr,t)}function D_(i,t){i.uniform3iv(this.addr,t)}function N_(i,t){i.uniform4iv(this.addr,t)}function U_(i,t){i.uniform1uiv(this.addr,t)}function F_(i,t){i.uniform2uiv(this.addr,t)}function O_(i,t){i.uniform3uiv(this.addr,t)}function B_(i,t){i.uniform4uiv(this.addr,t)}function k_(i,t,e){let n=this.cache,s=t.length,r=oc(e,s);_n(n,r)||(i.uniform1iv(this.addr,r),xn(n,r));let a;this.type===i.SAMPLER_2D_SHADOW?a=zh:a=lf;for(let o=0;o!==s;++o)e.setTexture2D(t[o]||a,r[o])}function z_(i,t,e){let n=this.cache,s=t.length,r=oc(e,s);_n(n,r)||(i.uniform1iv(this.addr,r),xn(n,r));for(let a=0;a!==s;++a)e.setTexture3D(t[a]||hf,r[a])}function V_(i,t,e){let n=this.cache,s=t.length,r=oc(e,s);_n(n,r)||(i.uniform1iv(this.addr,r),xn(n,r));for(let a=0;a!==s;++a)e.setTextureCube(t[a]||uf,r[a])}function G_(i,t,e){let n=this.cache,s=t.length,r=oc(e,s);_n(n,r)||(i.uniform1iv(this.addr,r),xn(n,r));for(let a=0;a!==s;++a)e.setTexture2DArray(t[a]||cf,r[a])}function H_(i){switch(i){case 5126:return w_;case 35664:return T_;case 35665:return A_;case 35666:return E_;case 35674:return C_;case 35675:return R_;case 35676:return P_;case 5124:case 35670:return I_;case 35667:case 35671:return L_;case 35668:case 35672:return D_;case 35669:case 35673:return N_;case 5125:return U_;case 36294:return F_;case 36295:return O_;case 36296:return B_;case 35678:case 36198:case 36298:case 36306:case 35682:return k_;case 35679:case 36299:case 36307:return z_;case 35680:case 36300:case 36308:case 36293:return V_;case 36289:case 36303:case 36311:case 36292:return G_}}var Vh=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=b_(e.type)}},Gh=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=H_(e.type)}},Hh=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(t,e[o.id],n)}}},Bh=/(\w+)(\])?(\[|\.)?/g;function Yd(i,t){i.seq.push(t),i.map[t.id]=t}function W_(i,t,e){let n=i.name,s=n.length;for(Bh.lastIndex=0;;){let r=Bh.exec(n),a=Bh.lastIndex,o=r[1],c=r[2]==="]",h=r[3];if(c&&(o=o|0),h===void 0||h==="["&&a+2===s){Yd(e,h===void 0?new Vh(o,i,t):new Gh(o,i,t));break}else{let _=e.map[o];_===void 0&&(_=new Hh(o),Yd(e,_)),e=_}}}var Dr=class{constructor(t,e){this.seq=[],this.map={};let n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){let o=t.getActiveUniform(e,a),c=t.getUniformLocation(e,o.name);W_(o,c,this)}let s=[],r=[];for(let a of this.seq)a.type===t.SAMPLER_2D_SHADOW||a.type===t.SAMPLER_CUBE_SHADOW||a.type===t.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(t,e,n,s){let r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){let s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,a=e.length;r!==a;++r){let o=e[r],c=n[o.id];c.needsUpdate!==!1&&o.setValue(t,c.value,s)}}static seqWithValue(t,e){let n=[];for(let s=0,r=t.length;s!==r;++s){let a=t[s];a.id in e&&n.push(a)}return n}};function Zd(i,t,e){let n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}var X_=37297,q_=0;function Y_(i,t){let e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let a=s;a<r;a++){let o=a+1;n.push(`${o===t?">":" "} ${o}: ${e[a]}`)}return n.join(`
`)}var $d=new ae;function Z_(i){Se._getMatrix($d,Se.workingColorSpace,i);let t=`mat3( ${$d.elements.map(e=>e.toFixed(4))} )`;switch(Se.getTransfer(i)){case ea:return[t,"LinearTransferOETF"];case Le:return[t,"sRGBTransferOETF"];default:return Qt("WebGLProgram: Unsupported color space: ",i),[t,"LinearTransferOETF"]}}function Jd(i,t,e){let n=i.getShaderParameter(t,i.COMPILE_STATUS),r=(i.getShaderInfoLog(t)||"").trim();if(n&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return e.toUpperCase()+`

`+r+`

`+Y_(i.getShaderSource(t),o)}else return r}function $_(i,t){let e=Z_(t);return[`vec4 ${i}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}var J_={[oh]:"Linear",[lh]:"Reinhard",[ch]:"Cineon",[hh]:"ACESFilmic",[dh]:"AgX",[fh]:"Neutral",[uh]:"Custom"};function K_(i,t){let e=J_[t];return e===void 0?(Qt("WebGLProgram: Unsupported toneMapping:",t),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var nc=new N;function j_(){Se.getLuminanceCoefficients(nc);let i=nc.x.toFixed(4),t=nc.y.toFixed(4),e=nc.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Q_(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Na).join(`
`)}function tx(i){let t=[];for(let e in i){let n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function ex(i,t){let e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(t,s),a=r.name,o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),e[a]={type:r.type,location:i.getAttribLocation(t,a),locationSize:o}}return e}function Na(i){return i!==""}function Kd(i,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,t.numSunLights).replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,t.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function jd(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var nx=/^[ \t]*#include +<([\w\d./]+)>/gm;function Wh(i){return i.replace(nx,sx)}var ix=new Map;function sx(i,t){let e=me[t];if(e===void 0){let n=ix.get(t);if(n!==void 0)e=me[n],Qt('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+t+">")}return Wh(e)}var rx=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function Qd(i){return i.replace(rx,ax)}function ax(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function tf(i){let t=`precision ${i.precision} float;
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
#define LOW_PRECISION`),t}var ox={[ba]:"SHADOWMAP_TYPE_PCF",[Cr]:"SHADOWMAP_TYPE_VSM"};function lx(i){return ox[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var cx={[Ms]:"ENVMAP_TYPE_CUBE",[zs]:"ENVMAP_TYPE_CUBE",[wa]:"ENVMAP_TYPE_CUBE_UV"};function hx(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":cx[i.envMapMode]||"ENVMAP_TYPE_CUBE"}var ux={[zs]:"ENVMAP_MODE_REFRACTION"};function dx(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":ux[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var fx={[dl]:"ENVMAP_BLENDING_MULTIPLY",[_d]:"ENVMAP_BLENDING_MIX",[xd]:"ENVMAP_BLENDING_ADD"};function px(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":fx[i.combine]||"ENVMAP_BLENDING_NONE"}function mx(i){let t=i.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:n,maxMip:e}}function gx(i,t,e,n){let s=i.getContext(),r=e.defines,a=e.vertexShader,o=e.fragmentShader,c=lx(e),h=hx(e),d=dx(e),_=px(e),u=mx(e),m=Q_(e),M=tx(r),T=s.createProgram(),v,g,R=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(v=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,M].filter(Na).join(`
`),v.length>0&&(v+=`
`),g=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,M].filter(Na).join(`
`),g.length>0&&(g+=`
`)):(v=[tf(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,M,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+d:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexNormals?"#define HAS_NORMAL":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Na).join(`
`),g=[tf(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,M,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+h:"",e.envMap?"#define "+d:"",e.envMap?"#define "+_:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.retroreflection?"#define USE_RETROREFLECTION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor?"#define USE_COLOR":"",e.vertexAlphas||e.batchingColor?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+c:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Si?"#define TONE_MAPPING":"",e.toneMapping!==Si?me.tonemapping_pars_fragment:"",e.toneMapping!==Si?K_("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",me.colorspace_pars_fragment,$_("linearToOutputTexel",e.outputColorSpace),j_(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(Na).join(`
`)),a=Wh(a),a=Kd(a,e),a=jd(a,e),o=Wh(o),o=Kd(o,e),o=jd(o,e),a=Qd(a),o=Qd(o),e.isRawShaderMaterial!==!0&&(R=`#version 300 es
`,v=[m,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+v,g=["#define varying in",e.glslVersion===bh?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===bh?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+g);let D=R+v+a,E=R+g+o,I=Zd(s,s.VERTEX_SHADER,D),P=Zd(s,s.FRAGMENT_SHADER,E);s.attachShader(T,I),s.attachShader(T,P),e.index0AttributeName!==void 0?s.bindAttribLocation(T,0,e.index0AttributeName):e.hasPositionAttribute===!0&&s.bindAttribLocation(T,0,"position"),s.linkProgram(T);function U(H){if(i.debug.checkShaderErrors){let Y=s.getProgramInfoLog(T)||"",Q=s.getShaderInfoLog(I)||"",z=s.getShaderInfoLog(P)||"",tt=Y.trim(),dt=Q.trim(),ht=z.trim(),yt=!0,rt=!0;if(s.getProgramParameter(T,s.LINK_STATUS)===!1)if(yt=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,T,I,P);else{let q=Jd(s,I,"vertex"),_t=Jd(s,P,"fragment");ne("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(T,s.VALIDATE_STATUS)+`

Material Name: `+H.name+`
Material Type: `+H.type+`

Program Info Log: `+tt+`
`+q+`
`+_t)}else tt!==""?Qt("WebGLProgram: Program Info Log:",tt):(dt===""||ht==="")&&(rt=!1);rt&&(H.diagnostics={runnable:yt,programLog:tt,vertexShader:{log:dt,prefix:v},fragmentShader:{log:ht,prefix:g}})}s.deleteShader(I),s.deleteShader(P),b=new Dr(s,T),C=ex(s,T)}let b;this.getUniforms=function(){return b===void 0&&U(this),b};let C;this.getAttributes=function(){return C===void 0&&U(this),C};let O=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return O===!1&&(O=s.getProgramParameter(T,X_)),O},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(T),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=q_++,this.cacheKey=t,this.usedTimes=1,this.program=T,this.vertexShader=I,this.fragmentShader=P,this}var _x=0,Xh=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t,e,n){let s=this._getShaderCacheForMaterial(t);return s.has(e)===!1&&(s.add(e),e.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderStage(t){return this._getShaderStage(t.vertexShader)}getFragmentShaderStage(t){return this._getShaderStage(t.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){let e=this.shaderCache,n=e.get(t);return n===void 0&&(n=new qh(t),e.set(t,n)),n}},qh=class{constructor(t){this.id=_x++,this.code=t,this.usedTimes=0}};function xx(i){return i===ws||i===Pa||i===Ia}function vx(i,t,e,n,s,r){let a=new yr,o=new Xh,c=new Set,h=[],d=new Map,_=n.logarithmicDepthBuffer,u=n.precision,m={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function M(b){return c.add(b),b===0?"uv":`uv${b}`}function T(b,C,O,H,Y,Q){let z=H.fog,tt=Y.geometry,dt=b.isMeshStandardMaterial||b.isMeshLambertMaterial||b.isMeshPhongMaterial?H.environment:null,ht=b.isMeshStandardMaterial||b.isMeshLambertMaterial&&!b.envMap||b.isMeshPhongMaterial&&!b.envMap,yt=t.get(b.envMap||dt,ht),rt=yt&&yt.mapping===wa?yt.image.height:null,q=m[b.type];b.precision!==null&&(u=n.getMaxPrecision(b.precision),u!==b.precision&&Qt("WebGLProgram.getParameters:",b.precision,"not supported, using",u,"instead."));let _t=tt.morphAttributes.position||tt.morphAttributes.normal||tt.morphAttributes.color,qt=_t!==void 0?_t.length:0,Zt=0;tt.morphAttributes.position!==void 0&&(Zt=1),tt.morphAttributes.normal!==void 0&&(Zt=2),tt.morphAttributes.color!==void 0&&(Zt=3);let De,xe,ge,lt;if(q){let Ne=Bi[q];De=Ne.vertexShader,xe=Ne.fragmentShader}else{De=b.vertexShader,xe=b.fragmentShader;let Ne=o.getVertexShaderStage(b),Te=o.getFragmentShaderStage(b);o.update(b,Ne,Te),ge=Ne.id,lt=Te.id}let gt=i.getRenderTarget(),Bt=i.state.buffers.depth.getReversed(),te=Y.isInstancedMesh===!0,St=Y.isBatchedMesh===!0,ee=!!b.map,nn=!!b.matcap,oe=!!yt,Ot=!!b.aoMap,Ee=!!b.lightMap,de=!!b.bumpMap&&b.wireframe===!1,pe=!!b.normalMap,$e=!!b.displacementMap,En=!!b.emissiveMap,Ve=!!b.metalnessMap,Je=!!b.roughnessMap,V=b.anisotropy>0,ln=b.clearcoat>0,he=b.dispersion>0,L=b.retroreflectivity>0,S=b.iridescence>0,Z=b.sheen>0,et=b.transmission>0,at=V&&!!b.anisotropyMap,Mt=ln&&!!b.clearcoatMap,At=ln&&!!b.clearcoatNormalMap,st=ln&&!!b.clearcoatRoughnessMap,mt=S&&!!b.iridescenceMap,Et=S&&!!b.iridescenceThicknessMap,Yt=Z&&!!b.sheenColorMap,Rt=Z&&!!b.sheenRoughnessMap,bt=!!b.specularMap,Ht=!!b.specularColorMap,Kt=!!b.specularIntensityMap,re=et&&!!b.transmissionMap,k=et&&!!b.thicknessMap,Ct=!!b.gradientMap,pt=!!b.alphaMap,wt=b.alphaTest>0,Lt=!!b.alphaHash,vt=!!b.extensions,$t=Si;b.toneMapped&&(gt===null||gt.isXRRenderTarget===!0)&&($t=i.toneMapping);let Wt={shaderID:q,shaderType:b.type,shaderName:b.name,vertexShader:De,fragmentShader:xe,defines:b.defines,customVertexShaderID:ge,customFragmentShaderID:lt,isRawShaderMaterial:b.isRawShaderMaterial===!0,glslVersion:b.glslVersion,precision:u,batching:St,batchingColor:St&&Y._colorsTexture!==null,instancing:te,instancingColor:te&&Y.instanceColor!==null,instancingMorph:te&&Y.morphTexture!==null,outputColorSpace:gt===null?i.outputColorSpace:gt.isXRRenderTarget===!0?gt.texture.colorSpace:Se.workingColorSpace,alphaToCoverage:!!b.alphaToCoverage,map:ee,matcap:nn,envMap:oe,envMapMode:oe&&yt.mapping,envMapCubeUVHeight:rt,aoMap:Ot,lightMap:Ee,bumpMap:de,normalMap:pe,displacementMap:$e,emissiveMap:En,normalMapObjectSpace:pe&&b.normalMapType===Md,normalMapTangentSpace:pe&&b.normalMapType===jl,packedNormalMap:pe&&b.normalMapType===jl&&xx(b.normalMap.format),metalnessMap:Ve,roughnessMap:Je,anisotropy:V,anisotropyMap:at,clearcoat:ln,clearcoatMap:Mt,clearcoatNormalMap:At,clearcoatRoughnessMap:st,dispersion:he,retroreflection:L,iridescence:S,iridescenceMap:mt,iridescenceThicknessMap:Et,sheen:Z,sheenColorMap:Yt,sheenRoughnessMap:Rt,specularMap:bt,specularColorMap:Ht,specularIntensityMap:Kt,transmission:et,transmissionMap:re,thicknessMap:k,gradientMap:Ct,opaque:b.transparent===!1&&b.blending===ys&&b.alphaToCoverage===!1,alphaMap:pt,alphaTest:wt,alphaHash:Lt,combine:b.combine,mapUv:ee&&M(b.map.channel),aoMapUv:Ot&&M(b.aoMap.channel),lightMapUv:Ee&&M(b.lightMap.channel),bumpMapUv:de&&M(b.bumpMap.channel),normalMapUv:pe&&M(b.normalMap.channel),displacementMapUv:$e&&M(b.displacementMap.channel),emissiveMapUv:En&&M(b.emissiveMap.channel),metalnessMapUv:Ve&&M(b.metalnessMap.channel),roughnessMapUv:Je&&M(b.roughnessMap.channel),anisotropyMapUv:at&&M(b.anisotropyMap.channel),clearcoatMapUv:Mt&&M(b.clearcoatMap.channel),clearcoatNormalMapUv:At&&M(b.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:st&&M(b.clearcoatRoughnessMap.channel),iridescenceMapUv:mt&&M(b.iridescenceMap.channel),iridescenceThicknessMapUv:Et&&M(b.iridescenceThicknessMap.channel),sheenColorMapUv:Yt&&M(b.sheenColorMap.channel),sheenRoughnessMapUv:Rt&&M(b.sheenRoughnessMap.channel),specularMapUv:bt&&M(b.specularMap.channel),specularColorMapUv:Ht&&M(b.specularColorMap.channel),specularIntensityMapUv:Kt&&M(b.specularIntensityMap.channel),transmissionMapUv:re&&M(b.transmissionMap.channel),thicknessMapUv:k&&M(b.thicknessMap.channel),alphaMapUv:pt&&M(b.alphaMap.channel),vertexTangents:!!tt.attributes.tangent&&(pe||V),vertexNormals:!!tt.attributes.normal,vertexColors:b.vertexColors,vertexAlphas:b.vertexColors===!0&&!!tt.attributes.color&&tt.attributes.color.itemSize===4,pointsUvs:Y.isPoints===!0&&!!tt.attributes.uv&&(ee||pt),fog:!!z,useFog:b.fog===!0,fogExp2:!!z&&z.isFogExp2,flatShading:b.wireframe===!1&&(b.flatShading===!0||tt.attributes.normal===void 0&&pe===!1&&(b.isMeshLambertMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isMeshPhysicalMaterial)),sizeAttenuation:b.sizeAttenuation===!0,logarithmicDepthBuffer:_,reversedDepthBuffer:Bt,skinning:Y.isSkinnedMesh===!0,hasPositionAttribute:tt.attributes.position!==void 0,morphTargets:tt.morphAttributes.position!==void 0,morphNormals:tt.morphAttributes.normal!==void 0,morphColors:tt.morphAttributes.color!==void 0,morphTargetsCount:qt,morphTextureStride:Zt,numSunLights:C.sun.length,numDirLights:C.directional.length,numPointLights:C.point.length,numSpotLights:C.spot.length,numSpotLightMaps:C.spotLightMap.length,numRectAreaLights:C.rectArea.length,numHemiLights:C.hemi.length,numSunLightShadows:C.sunShadowMap.length,numDirLightShadows:C.directionalShadowMap.length,numPointLightShadows:C.pointShadowMap.length,numSpotLightShadows:C.spotShadowMap.length,numSpotLightShadowsWithMaps:C.numSpotLightShadowsWithMaps,numLightProbes:C.numLightProbes,numLightProbeGrids:Q.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:b.dithering,shadowMapEnabled:i.shadowMap.enabled&&O.length>0,shadowMapType:i.shadowMap.type,toneMapping:$t,decodeVideoTexture:ee&&b.map.isVideoTexture===!0&&Se.getTransfer(b.map.colorSpace)===Le,decodeVideoTextureEmissive:En&&b.emissiveMap.isVideoTexture===!0&&Se.getTransfer(b.emissiveMap.colorSpace)===Le,premultipliedAlpha:b.premultipliedAlpha,doubleSided:b.side===Xn,flipSided:b.side===Sn,useDepthPacking:b.depthPacking>=0,depthPacking:b.depthPacking||0,index0AttributeName:b.index0AttributeName,extensionClipCullDistance:vt&&b.extensions.clipCullDistance===!0&&e.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(vt&&b.extensions.multiDraw===!0||St)&&e.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:e.has("KHR_parallel_shader_compile"),customProgramCacheKey:b.customProgramCacheKey()};return Wt.vertexUv1s=c.has(1),Wt.vertexUv2s=c.has(2),Wt.vertexUv3s=c.has(3),c.clear(),Wt}function v(b){let C=[];if(b.shaderID?C.push(b.shaderID):(C.push(b.customVertexShaderID),C.push(b.customFragmentShaderID)),b.defines!==void 0)for(let O in b.defines)C.push(O),C.push(b.defines[O]);return b.isRawShaderMaterial===!1&&(g(C,b),R(C,b),C.push(i.outputColorSpace)),C.push(b.customProgramCacheKey),C.join()}function g(b,C){b.push(C.precision),b.push(C.outputColorSpace),b.push(C.envMapMode),b.push(C.envMapCubeUVHeight),b.push(C.mapUv),b.push(C.alphaMapUv),b.push(C.lightMapUv),b.push(C.aoMapUv),b.push(C.bumpMapUv),b.push(C.normalMapUv),b.push(C.displacementMapUv),b.push(C.emissiveMapUv),b.push(C.metalnessMapUv),b.push(C.roughnessMapUv),b.push(C.anisotropyMapUv),b.push(C.clearcoatMapUv),b.push(C.clearcoatNormalMapUv),b.push(C.clearcoatRoughnessMapUv),b.push(C.iridescenceMapUv),b.push(C.iridescenceThicknessMapUv),b.push(C.sheenColorMapUv),b.push(C.sheenRoughnessMapUv),b.push(C.specularMapUv),b.push(C.specularColorMapUv),b.push(C.specularIntensityMapUv),b.push(C.transmissionMapUv),b.push(C.thicknessMapUv),b.push(C.combine),b.push(C.fogExp2),b.push(C.sizeAttenuation),b.push(C.morphTargetsCount),b.push(C.morphAttributeCount),b.push(C.numSunLights),b.push(C.numDirLights),b.push(C.numPointLights),b.push(C.numSpotLights),b.push(C.numSpotLightMaps),b.push(C.numHemiLights),b.push(C.numRectAreaLights),b.push(C.numSunLightShadows),b.push(C.numDirLightShadows),b.push(C.numPointLightShadows),b.push(C.numSpotLightShadows),b.push(C.numSpotLightShadowsWithMaps),b.push(C.numLightProbes),b.push(C.shadowMapType),b.push(C.toneMapping),b.push(C.numClippingPlanes),b.push(C.numClipIntersection),b.push(C.depthPacking)}function R(b,C){a.disableAll(),C.instancing&&a.enable(0),C.instancingColor&&a.enable(1),C.instancingMorph&&a.enable(2),C.matcap&&a.enable(3),C.envMap&&a.enable(4),C.normalMapObjectSpace&&a.enable(5),C.normalMapTangentSpace&&a.enable(6),C.clearcoat&&a.enable(7),C.iridescence&&a.enable(8),C.alphaTest&&a.enable(9),C.vertexColors&&a.enable(10),C.vertexAlphas&&a.enable(11),C.vertexUv1s&&a.enable(12),C.vertexUv2s&&a.enable(13),C.vertexUv3s&&a.enable(14),C.vertexTangents&&a.enable(15),C.anisotropy&&a.enable(16),C.alphaHash&&a.enable(17),C.batching&&a.enable(18),C.dispersion&&a.enable(19),C.retroreflection&&a.enable(24),C.batchingColor&&a.enable(20),C.gradientMap&&a.enable(21),C.packedNormalMap&&a.enable(22),C.vertexNormals&&a.enable(23),b.push(a.mask),a.disableAll(),C.fog&&a.enable(0),C.useFog&&a.enable(1),C.flatShading&&a.enable(2),C.logarithmicDepthBuffer&&a.enable(3),C.reversedDepthBuffer&&a.enable(4),C.skinning&&a.enable(5),C.morphTargets&&a.enable(6),C.morphNormals&&a.enable(7),C.morphColors&&a.enable(8),C.premultipliedAlpha&&a.enable(9),C.shadowMapEnabled&&a.enable(10),C.doubleSided&&a.enable(11),C.flipSided&&a.enable(12),C.useDepthPacking&&a.enable(13),C.dithering&&a.enable(14),C.transmission&&a.enable(15),C.sheen&&a.enable(16),C.opaque&&a.enable(17),C.pointsUvs&&a.enable(18),C.decodeVideoTexture&&a.enable(19),C.decodeVideoTextureEmissive&&a.enable(20),C.alphaToCoverage&&a.enable(21),C.numLightProbeGrids>0&&a.enable(22),C.hasPositionAttribute&&a.enable(23),b.push(a.mask)}function D(b){let C=m[b.type],O;if(C){let H=Bi[C];O=Ud.clone(H.uniforms)}else O=b.uniforms;return O}function E(b,C){let O=d.get(C);return O!==void 0?++O.usedTimes:(O=new gx(i,C,b,s),h.push(O),d.set(C,O)),O}function I(b){if(--b.usedTimes===0){let C=h.indexOf(b);h[C]=h[h.length-1],h.pop(),d.delete(b.cacheKey),b.destroy()}}function P(b){o.remove(b)}function U(){o.dispose()}return{getParameters:T,getProgramCacheKey:v,getUniforms:D,acquireProgram:E,releaseProgram:I,releaseShaderCache:P,programs:h,dispose:U}}function yx(){let i=new WeakMap;function t(a){return i.has(a)}function e(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,c){i.get(a)[o]=c}function r(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:r}}function Mx(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.materialVariant!==t.materialVariant?i.materialVariant-t.materialVariant:i.z!==t.z?i.z-t.z:i.id-t.id}function ef(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function nf(){let i=[],t=0,e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function a(u){let m=0;return u.isInstancedMesh&&(m+=2),u.isSkinnedMesh&&(m+=1),m}function o(u,m,M,T,v,g){let R=i[t];return R===void 0?(R={id:u.id,object:u,geometry:m,material:M,materialVariant:a(u),groupOrder:T,renderOrder:u.renderOrder,z:v,group:g},i[t]=R):(R.id=u.id,R.object=u,R.geometry=m,R.material=M,R.materialVariant=a(u),R.groupOrder=T,R.renderOrder=u.renderOrder,R.z=v,R.group=g),t++,R}function c(u,m,M,T,v,g,R){R.reversedDepth===!0&&(v=-v);let D=o(u,m,M,T,v,g);M.transmission>0?n.push(D):M.transparent===!0?s.push(D):e.push(D)}function h(u,m,M,T,v,g){let R=o(u,m,M,T,v,g);M.transmission>0?n.unshift(R):M.transparent===!0?s.unshift(R):e.unshift(R)}function d(u,m){e.length>1&&e.sort(u||Mx),n.length>1&&n.sort(m||ef),s.length>1&&s.sort(m||ef)}function _(){for(let u=t,m=i.length;u<m;u++){let M=i[u];if(M.id===null)break;M.id=null,M.object=null,M.geometry=null,M.material=null,M.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:c,unshift:h,finish:_,sort:d}}function Sx(){let i=new WeakMap;function t(n,s){let r=i.get(n),a;return r===void 0?(a=new nf,i.set(n,[a])):s>=r.length?(a=new nf,r.push(a)):a=r[s],a}function e(){i=new WeakMap}return{get:t,dispose:e}}function bx(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={direction:new N,color:new jt};break;case"SpotLight":e={position:new N,direction:new N,color:new jt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new N,color:new jt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new N,skyColor:new jt,groundColor:new jt};break;case"RectAreaLight":e={color:new jt,position:new N,halfWidth:new N,halfHeight:new N};break}return i[t.id]=e,e}}}function wx(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"SunLight":case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new kt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new kt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new kt,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}var Tx=0;function Ax(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function Ex(i){let t=new bx,e=wx(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let h=0;h<9;h++)n.probe.push(new N);let s=new N,r=new Oe,a=new Oe;function o(h){let d=0,_=0,u=0;for(let Y=0;Y<9;Y++)n.probe[Y].set(0,0,0);let m=0,M=0,T=0,v=0,g=0,R=0,D=0,E=0,I=0,P=0,U=0,b=0,C=0,O=0;h.sort(Ax);for(let Y=0,Q=h.length;Y<Q;Y++){let z=h[Y],tt=z.color,dt=z.intensity,ht=z.distance,yt=null;if(z.shadow&&z.shadow.map&&(z.shadow.map.texture.format===ws?yt=z.shadow.map.texture:yt=z.shadow.map.depthTexture||z.shadow.map.texture),z.isAmbientLight)d+=tt.r*dt,_+=tt.g*dt,u+=tt.b*dt;else if(z.isLightProbe){for(let rt=0;rt<9;rt++)n.probe[rt].addScaledVector(z.sh.coefficients[rt],dt);O++}else if(z.isSunLight){let rt=t.get(z);if(rt.color.copy(z.color).multiplyScalar(z.intensity),z.castShadow){let q=z.shadow,_t=e.get(z);_t.shadowIntensity=q.intensity,_t.shadowBias=q.bias,_t.shadowNormalBias=q.normalBias,_t.shadowRadius=q.radius,_t.shadowMapSize.copy(q.mapSize).multiply(q.getFrameExtents()),n.sunShadow[M]=_t,n.sunShadowMap[M]=yt;let qt=q.getViewportCount();for(let Zt=0;Zt<qt;Zt++)n.sunShadowMatrix[T+Zt]=q.getMatrix(Zt),n.sunShadowCascade[T+Zt]=q._cascadeData[Zt];T+=qt,M++}n.sun[m]=rt,m++}else if(z.isDirectionalLight){let rt=t.get(z);if(rt.color.copy(z.color).multiplyScalar(z.intensity),z.castShadow){let q=z.shadow,_t=e.get(z);_t.shadowIntensity=q.intensity,_t.shadowBias=q.bias,_t.shadowNormalBias=q.normalBias,_t.shadowRadius=q.radius,_t.shadowMapSize=q.mapSize,n.directionalShadow[v]=_t,n.directionalShadowMap[v]=yt,n.directionalShadowMatrix[v]=z.shadow.matrix,I++}n.directional[v]=rt,v++}else if(z.isSpotLight){let rt=t.get(z);rt.position.setFromMatrixPosition(z.matrixWorld),rt.color.copy(tt).multiplyScalar(dt),rt.distance=ht,rt.coneCos=Math.cos(z.angle),rt.penumbraCos=Math.cos(z.angle*(1-z.penumbra)),rt.decay=z.decay,n.spot[R]=rt;let q=z.shadow;if(z.map&&(n.spotLightMap[b]=z.map,b++,q.updateMatrices(z),z.castShadow&&C++),n.spotLightMatrix[R]=q.matrix,z.castShadow){let _t=e.get(z);_t.shadowIntensity=q.intensity,_t.shadowBias=q.bias,_t.shadowNormalBias=q.normalBias,_t.shadowRadius=q.radius,_t.shadowMapSize=q.mapSize,n.spotShadow[R]=_t,n.spotShadowMap[R]=yt,U++}R++}else if(z.isRectAreaLight){let rt=t.get(z);rt.color.copy(tt).multiplyScalar(dt),rt.halfWidth.set(z.width*.5,0,0),rt.halfHeight.set(0,z.height*.5,0),n.rectArea[D]=rt,D++}else if(z.isPointLight){let rt=t.get(z);if(rt.color.copy(z.color).multiplyScalar(z.intensity),rt.distance=z.distance,rt.decay=z.decay,z.castShadow){let q=z.shadow,_t=e.get(z);_t.shadowIntensity=q.intensity,_t.shadowBias=q.bias,_t.shadowNormalBias=q.normalBias,_t.shadowRadius=q.radius,_t.shadowMapSize=q.mapSize,_t.shadowCameraNear=q.camera.near,_t.shadowCameraFar=q.camera.far,n.pointShadow[g]=_t,n.pointShadowMap[g]=yt,n.pointShadowMatrix[g]=z.shadow.matrix,P++}n.point[g]=rt,g++}else if(z.isHemisphereLight){let rt=t.get(z);rt.skyColor.copy(z.color).multiplyScalar(dt),rt.groundColor.copy(z.groundColor).multiplyScalar(dt),n.hemi[E]=rt,E++}}D>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=Dt.LTC_FLOAT_1,n.rectAreaLTC2=Dt.LTC_FLOAT_2):(n.rectAreaLTC1=Dt.LTC_HALF_1,n.rectAreaLTC2=Dt.LTC_HALF_2)),n.ambient[0]=d,n.ambient[1]=_,n.ambient[2]=u;let H=n.hash;(H.sunLength!==m||H.directionalLength!==v||H.pointLength!==g||H.spotLength!==R||H.rectAreaLength!==D||H.hemiLength!==E||H.numSunShadows!==M||H.numDirectionalShadows!==I||H.numPointShadows!==P||H.numSpotShadows!==U||H.numSpotMaps!==b||H.numLightProbes!==O)&&(n.sun.length=m,n.directional.length=v,n.spot.length=R,n.rectArea.length=D,n.point.length=g,n.hemi.length=E,n.sunShadow.length=M,n.sunShadowMap.length=M,n.sunShadowMatrix.length=T,n.sunShadowCascade.length=T,n.directionalShadow.length=I,n.directionalShadowMap.length=I,n.directionalShadowMatrix.length=I,n.pointShadow.length=P,n.pointShadowMap.length=P,n.pointShadowMatrix.length=P,n.spotShadow.length=U,n.spotShadowMap.length=U,n.spotLightMatrix.length=U+b-C,n.spotLightMap.length=b,n.numSpotLightShadowsWithMaps=C,n.numLightProbes=O,H.sunLength=m,H.directionalLength=v,H.pointLength=g,H.spotLength=R,H.rectAreaLength=D,H.hemiLength=E,H.numSunShadows=M,H.numDirectionalShadows=I,H.numPointShadows=P,H.numSpotShadows=U,H.numSpotMaps=b,H.numLightProbes=O,n.version=Tx++)}function c(h,d){let _=0,u=0,m=0,M=0,T=0,v=0,g=d.matrixWorldInverse;for(let R=0,D=h.length;R<D;R++){let E=h[R];if(E.isSunLight){let I=n.sun[_];I.direction.setFromMatrixPosition(E.matrixWorld),I.direction.transformDirection(g),_++}else if(E.isDirectionalLight){let I=n.directional[u];I.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),I.direction.sub(s),I.direction.transformDirection(g),u++}else if(E.isSpotLight){let I=n.spot[M];I.position.setFromMatrixPosition(E.matrixWorld),I.position.applyMatrix4(g),I.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),I.direction.sub(s),I.direction.transformDirection(g),M++}else if(E.isRectAreaLight){let I=n.rectArea[T];I.position.setFromMatrixPosition(E.matrixWorld),I.position.applyMatrix4(g),a.identity(),r.copy(E.matrixWorld),r.premultiply(g),a.extractRotation(r),I.halfWidth.set(E.width*.5,0,0),I.halfHeight.set(0,E.height*.5,0),I.halfWidth.applyMatrix4(a),I.halfHeight.applyMatrix4(a),T++}else if(E.isPointLight){let I=n.point[m];I.position.setFromMatrixPosition(E.matrixWorld),I.position.applyMatrix4(g),m++}else if(E.isHemisphereLight){let I=n.hemi[v];I.direction.setFromMatrixPosition(E.matrixWorld),I.direction.transformDirection(g),v++}}}return{setup:o,setupView:c,state:n}}function sf(i){let t=new Ex(i),e=[],n=[],s=[];function r(u){_.camera=u,e.length=0,n.length=0,s.length=0}function a(u){e.push(u)}function o(u){n.push(u)}function c(u){s.push(u)}function h(){t.setup(e)}function d(u){t.setupView(e,u)}let _={lightsArray:e,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:t,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:_,setupLights:h,setupLightsView:d,pushLight:a,pushShadow:o,pushLightProbeGrid:c}}function Cx(i){let t=new WeakMap;function e(s,r=0){let a=t.get(s),o;return a===void 0?(o=new sf(i),t.set(s,[o])):r>=a.length?(o=new sf(i),a.push(o)):o=a[r],o}function n(){t=new WeakMap}return{get:e,dispose:n}}var Rx=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Px=`uniform sampler2D shadow_pass;
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
}`,Ix=[new N(1,0,0),new N(-1,0,0),new N(0,1,0),new N(0,-1,0),new N(0,0,1),new N(0,0,-1)],Lx=[new N(0,-1,0),new N(0,-1,0),new N(0,0,1),new N(0,0,-1),new N(0,-1,0),new N(0,-1,0)],rf=new Oe,Da=new N,kh=new N;function Dx(i,t,e){let n=new Sr,s=new kt,r=new kt,a=new qe,o=new Jo,c=new Ko,h={},d=e.maxTextureSize,_={[vs]:Sn,[Sn]:vs,[Xn]:Xn},u=new dn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new kt},radius:{value:4}},vertexShader:Rx,fragmentShader:Px}),m=u.clone();m.defines.HORIZONTAL_PASS=1;let M=new Ie;M.setAttribute("position",new ti(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let T=new ce(M,u),v=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=ba;let g=this.type;this.render=function(P,U,b){if(v.enabled===!1||v.autoUpdate===!1&&v.needsUpdate===!1||P.length===0)return;this.type===ju&&(Qt("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=ba);let C=i.getRenderTarget(),O=i.getActiveCubeFace(),H=i.getActiveMipmapLevel(),Y=i.state;Y.setBlending(Fi),Y.buffers.depth.getReversed()===!0?Y.buffers.color.setClear(0,0,0,0):Y.buffers.color.setClear(1,1,1,1),Y.buffers.depth.setTest(!0),Y.setScissorTest(!1);let Q=g!==this.type;Q&&U.traverse(function(z){z.material&&(Array.isArray(z.material)?z.material.forEach(tt=>tt.needsUpdate=!0):z.material.needsUpdate=!0)});for(let z=0,tt=P.length;z<tt;z++){let dt=P[z],ht=dt.shadow;if(ht===void 0){Qt("WebGLShadowMap:",dt,"has no shadow.");continue}if(ht.autoUpdate===!1&&ht.needsUpdate===!1)continue;s.copy(ht.mapSize);let yt=ht.getFrameExtents();s.multiply(yt),r.copy(ht.mapSize),(s.x>d||s.y>d)&&(s.x>d&&(r.x=Math.floor(d/yt.x),s.x=r.x*yt.x,ht.mapSize.x=r.x),s.y>d&&(r.y=Math.floor(d/yt.y),s.y=r.y*yt.y,ht.mapSize.y=r.y));let rt=i.state.buffers.depth.getReversed();if(ht.camera._reversedDepth=rt,ht.map===null||Q===!0){if(ht.map!==null&&(ht.map.depthTexture!==null&&(ht.map.depthTexture.dispose(),ht.map.depthTexture=null),ht.map.dispose()),this.type===Cr){if(dt.isPointLight){Qt("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}ht.map=new Wn(s.x,s.y,{format:ws,type:Ti,minFilter:wn,magFilter:wn,generateMipmaps:!1}),ht.map.texture.name=dt.name+".shadowMap",ht.map.depthTexture=new hs(s.x,s.y,wi),ht.map.depthTexture.name=dt.name+".shadowMapDepth",ht.map.depthTexture.format=Li,ht.map.depthTexture.compareFunction=null,ht.map.depthTexture.minFilter=Mn,ht.map.depthTexture.magFilter=Mn}else dt.isPointLight?(ht.map=new sc(s.x),ht.map.depthTexture=new Go(s.x,bi)):(ht.map=new Wn(s.x,s.y),ht.map.depthTexture=new hs(s.x,s.y,bi)),ht.map.depthTexture.name=dt.name+".shadowMap",ht.map.depthTexture.format=Li,this.type===ba?(ht.map.depthTexture.compareFunction=rt?tc:Ql,ht.map.depthTexture.minFilter=wn,ht.map.depthTexture.magFilter=wn):(ht.map.depthTexture.compareFunction=null,ht.map.depthTexture.minFilter=Mn,ht.map.depthTexture.magFilter=Mn);ht.camera.updateProjectionMatrix()}ht.map.isWebGLCubeRenderTarget!==!0&&(ht.map.width!==s.x||ht.map.height!==s.y)&&ht.map.setSize(s.x,s.y);let q=ht.map.isWebGLCubeRenderTarget?6:ht.getViewportCount();dt.isPointLight!==!0&&ht.updateMatrices(dt,b);for(let _t=0;_t<q;_t++){let qt=ht.getCamera(_t);if(dt.isPointLight){let Zt=ht.camera,De=ht.matrix,xe=dt.distance||Zt.far;xe!==Zt.far&&(Zt.far=xe,Zt.updateProjectionMatrix()),Da.setFromMatrixPosition(dt.matrixWorld),Zt.position.copy(Da),kh.copy(Zt.position),kh.add(Ix[_t]),Zt.up.copy(Lx[_t]),Zt.lookAt(kh),Zt.updateMatrixWorld(),De.makeTranslation(-Da.x,-Da.y,-Da.z),rf.multiplyMatrices(Zt.projectionMatrix,Zt.matrixWorldInverse),ht._frustum.setFromProjectionMatrix(rf,Zt.coordinateSystem,Zt.reversedDepth)}if(ht.map.isWebGLCubeRenderTarget)i.setRenderTarget(ht.map,_t),i.clear();else{_t===0&&(i.setRenderTarget(ht.map),i.clear());let Zt=ht.getViewport(_t);a.set(r.x*Zt.x,r.y*Zt.y,r.x*Zt.z,r.y*Zt.w),Y.viewport(a)}n=ht.getFrustum(_t),E(U,b,qt,dt,this.type)}ht.isPointLightShadow!==!0&&this.type===Cr&&R(ht,b),ht.needsUpdate=!1}g=this.type,v.needsUpdate=!1,i.setRenderTarget(C,O,H)};function R(P,U){let b=t.update(T);u.defines.VSM_SAMPLES!==P.blurSamples&&(u.defines.VSM_SAMPLES=P.blurSamples,m.defines.VSM_SAMPLES=P.blurSamples,u.needsUpdate=!0,m.needsUpdate=!0),P.mapPass===null?P.mapPass=new Wn(s.x,s.y,{format:ws,type:Ti}):(P.mapPass.width!==P.map.width||P.mapPass.height!==P.map.height)&&P.mapPass.setSize(P.map.width,P.map.height),u.uniforms.shadow_pass.value=P.map.depthTexture,u.uniforms.resolution.value.set(P.map.width,P.map.height),u.uniforms.radius.value=P.radius,i.setRenderTarget(P.mapPass),i.clear(),i.renderBufferDirect(U,null,b,u,T,null),m.uniforms.shadow_pass.value=P.mapPass.texture,m.uniforms.resolution.value.set(P.map.width,P.map.height),m.uniforms.radius.value=P.radius,i.setRenderTarget(P.map),i.clear(),i.renderBufferDirect(U,null,b,m,T,null)}function D(P,U,b,C){let O=null,H=b.isPointLight===!0?P.customDistanceMaterial:P.customDepthMaterial;if(H!==void 0)O=H;else if(O=b.isPointLight===!0?c:o,i.localClippingEnabled&&U.clipShadows===!0&&Array.isArray(U.clippingPlanes)&&U.clippingPlanes.length!==0||U.displacementMap&&U.displacementScale!==0||U.alphaMap&&U.alphaTest>0||U.map&&U.alphaTest>0||U.alphaToCoverage===!0){let Y=O.uuid,Q=U.uuid,z=h[Y];z===void 0&&(z={},h[Y]=z);let tt=z[Q];tt===void 0&&(tt=O.clone(),z[Q]=tt,U.addEventListener("dispose",I)),O=tt}if(O.visible=U.visible,O.wireframe=U.wireframe,C===Cr?O.side=U.shadowSide!==null?U.shadowSide:U.side:O.side=U.shadowSide!==null?U.shadowSide:_[U.side],O.alphaMap=U.alphaMap,O.alphaTest=U.alphaToCoverage===!0?.5:U.alphaTest,O.map=U.map,O.clipShadows=U.clipShadows,O.clippingPlanes=U.clippingPlanes,O.clipIntersection=U.clipIntersection,O.displacementMap=U.displacementMap,O.displacementScale=U.displacementScale,O.displacementBias=U.displacementBias,O.wireframeLinewidth=U.wireframeLinewidth,O.linewidth=U.linewidth,b.isPointLight===!0&&O.isMeshDistanceMaterial===!0){let Y=i.properties.get(O);Y.light=b}return O}function E(P,U,b,C,O){if(P.visible===!1)return;if(P.layers.test(U.layers)&&(P.isMesh||P.isLine||P.isPoints)&&(P.castShadow||P.receiveShadow&&O===Cr)&&(!P.frustumCulled||P.intersectsFrustum(n))){P.modelViewMatrix.multiplyMatrices(b.matrixWorldInverse,P.matrixWorld);let Q=t.update(P),z=P.material;if(Array.isArray(z)){let tt=Q.groups;for(let dt=0,ht=tt.length;dt<ht;dt++){let yt=tt[dt],rt=z[yt.materialIndex];if(rt&&rt.visible){let q=D(P,rt,C,O);P.onBeforeShadow(i,P,U,b,Q,q,yt),i.renderBufferDirect(b,null,Q,q,P,yt),P.onAfterShadow(i,P,U,b,Q,q,yt)}}}else if(z.visible){let tt=D(P,z,C,O);P.onBeforeShadow(i,P,U,b,Q,tt,null),i.renderBufferDirect(b,null,Q,tt,P,null),P.onAfterShadow(i,P,U,b,Q,tt,null)}}let Y=P.children;for(let Q=0,z=Y.length;Q<z;Q++)E(Y[Q],U,b,C,O)}function I(P){P.target.removeEventListener("dispose",I);for(let b in h){let C=h[b],O=P.target.uuid;O in C&&(C[O].dispose(),delete C[O])}}}function Nx(i,t){function e(){let k=!1,Ct=new qe,pt=null,wt=new qe(0,0,0,0);return{setMask:function(Lt){pt!==Lt&&!k&&(i.colorMask(Lt,Lt,Lt,Lt),pt=Lt)},setLocked:function(Lt){k=Lt},setClear:function(Lt,vt,$t,Wt,Ne){Ne===!0&&(Lt*=Wt,vt*=Wt,$t*=Wt),Ct.set(Lt,vt,$t,Wt),wt.equals(Ct)===!1&&(i.clearColor(Lt,vt,$t,Wt),wt.copy(Ct))},reset:function(){k=!1,pt=null,wt.set(-1,0,0,0)}}}function n(){let k=!1,Ct=!1,pt=null,wt=null,Lt=null;return{setReversed:function(vt){if(Ct!==vt){let $t=t.get("EXT_clip_control");vt?$t.clipControlEXT($t.LOWER_LEFT_EXT,$t.ZERO_TO_ONE_EXT):$t.clipControlEXT($t.LOWER_LEFT_EXT,$t.NEGATIVE_ONE_TO_ONE_EXT),Ct=vt;let Wt=Lt;Lt=null,this.setClear(Wt)}},getReversed:function(){return Ct},setTest:function(vt){vt?gt(i.DEPTH_TEST):Bt(i.DEPTH_TEST)},setMask:function(vt){pt!==vt&&!k&&(i.depthMask(vt),pt=vt)},setFunc:function(vt){if(Ct&&(vt=Ld[vt]),wt!==vt){switch(vt){case wo:i.depthFunc(i.NEVER);break;case To:i.depthFunc(i.ALWAYS);break;case Ao:i.depthFunc(i.LESS);break;case mr:i.depthFunc(i.LEQUAL);break;case Eo:i.depthFunc(i.EQUAL);break;case Co:i.depthFunc(i.GEQUAL);break;case Ro:i.depthFunc(i.GREATER);break;case Po:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}wt=vt}},setLocked:function(vt){k=vt},setClear:function(vt){Lt!==vt&&(Lt=vt,Ct&&(vt=1-vt),i.clearDepth(vt))},reset:function(){k=!1,pt=null,wt=null,Lt=null,Ct=!1}}}function s(){let k=!1,Ct=null,pt=null,wt=null,Lt=null,vt=null,$t=null,Wt=null,Ne=null;return{setTest:function(Te){k||(Te?gt(i.STENCIL_TEST):Bt(i.STENCIL_TEST))},setMask:function(Te){Ct!==Te&&!k&&(i.stencilMask(Te),Ct=Te)},setFunc:function(Te,Zn,si){(pt!==Te||wt!==Zn||Lt!==si)&&(i.stencilFunc(Te,Zn,si),pt=Te,wt=Zn,Lt=si)},setOp:function(Te,Zn,si){(vt!==Te||$t!==Zn||Wt!==si)&&(i.stencilOp(Te,Zn,si),vt=Te,$t=Zn,Wt=si)},setLocked:function(Te){k=Te},setClear:function(Te){Ne!==Te&&(i.clearStencil(Te),Ne=Te)},reset:function(){k=!1,Ct=null,pt=null,wt=null,Lt=null,vt=null,$t=null,Wt=null,Ne=null}}}let r=new e,a=new n,o=new s,c=new WeakMap,h=new WeakMap,d={},_={},u={},m=new WeakMap,M=[],T=null,v=!1,g=null,R=null,D=null,E=null,I=null,P=null,U=null,b=new jt(0,0,0),C=0,O=!1,H=null,Y=null,Q=null,z=null,tt=null,dt=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),ht=!1,yt=0,rt=i.getParameter(i.VERSION);rt.indexOf("WebGL")!==-1?(yt=parseFloat(/^WebGL (\d)/.exec(rt)[1]),ht=yt>=1):rt.indexOf("OpenGL ES")!==-1&&(yt=parseFloat(/^OpenGL ES (\d)/.exec(rt)[1]),ht=yt>=2);let q=null,_t={},qt=i.getParameter(i.SCISSOR_BOX),Zt=i.getParameter(i.VIEWPORT),De=new qe().fromArray(qt),xe=new qe().fromArray(Zt);function ge(k,Ct,pt,wt){let Lt=new Uint8Array(4),vt=i.createTexture();i.bindTexture(k,vt),i.texParameteri(k,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(k,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let $t=0;$t<pt;$t++)k===i.TEXTURE_3D||k===i.TEXTURE_2D_ARRAY?i.texImage3D(Ct,0,i.RGBA,1,1,wt,0,i.RGBA,i.UNSIGNED_BYTE,Lt):i.texImage2D(Ct+$t,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,Lt);return vt}let lt={};lt[i.TEXTURE_2D]=ge(i.TEXTURE_2D,i.TEXTURE_2D,1),lt[i.TEXTURE_CUBE_MAP]=ge(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),lt[i.TEXTURE_2D_ARRAY]=ge(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),lt[i.TEXTURE_3D]=ge(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),gt(i.DEPTH_TEST),a.setFunc(mr),de(!1),pe(nh),gt(i.CULL_FACE),Ot(Fi);function gt(k){d[k]!==!0&&(i.enable(k),d[k]=!0)}function Bt(k){d[k]!==!1&&(i.disable(k),d[k]=!1)}function te(k,Ct){return u[k]!==Ct?(i.bindFramebuffer(k,Ct),u[k]=Ct,k===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=Ct),k===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=Ct),!0):!1}function St(k,Ct){let pt=M,wt=!1;if(k){pt=m.get(Ct),pt===void 0&&(pt=[],m.set(Ct,pt));let Lt=k.textures;if(pt.length!==Lt.length||pt[0]!==i.COLOR_ATTACHMENT0){for(let vt=0,$t=Lt.length;vt<$t;vt++)pt[vt]=i.COLOR_ATTACHMENT0+vt;pt.length=Lt.length,wt=!0}}else pt[0]!==i.BACK&&(pt[0]=i.BACK,wt=!0);wt&&i.drawBuffers(pt)}function ee(k){return T!==k?(i.useProgram(k),T=k,!0):!1}let nn={[ks]:i.FUNC_ADD,[td]:i.FUNC_SUBTRACT,[ed]:i.FUNC_REVERSE_SUBTRACT};nn[nd]=i.MIN,nn[id]=i.MAX;let oe={[sd]:i.ZERO,[rd]:i.ONE,[ad]:i.SRC_COLOR,[rh]:i.SRC_ALPHA,[dd]:i.SRC_ALPHA_SATURATE,[hd]:i.DST_COLOR,[ld]:i.DST_ALPHA,[od]:i.ONE_MINUS_SRC_COLOR,[ah]:i.ONE_MINUS_SRC_ALPHA,[ud]:i.ONE_MINUS_DST_COLOR,[cd]:i.ONE_MINUS_DST_ALPHA,[fd]:i.CONSTANT_COLOR,[pd]:i.ONE_MINUS_CONSTANT_COLOR,[md]:i.CONSTANT_ALPHA,[gd]:i.ONE_MINUS_CONSTANT_ALPHA};function Ot(k,Ct,pt,wt,Lt,vt,$t,Wt,Ne,Te){if(k===Fi){v===!0&&(Bt(i.BLEND),v=!1);return}if(v===!1&&(gt(i.BLEND),v=!0),k!==Qu){if(k!==g||Te!==O){if((R!==ks||I!==ks)&&(i.blendEquation(i.FUNC_ADD),R=ks,I=ks),Te)switch(k){case ys:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Ye:i.blendFunc(i.ONE,i.ONE);break;case ih:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case sh:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:ne("WebGLState: Invalid blending: ",k);break}else switch(k){case ys:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Ye:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case ih:ne("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case sh:ne("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:ne("WebGLState: Invalid blending: ",k);break}D=null,E=null,P=null,U=null,b.set(0,0,0),C=0,g=k,O=Te}return}Lt=Lt||Ct,vt=vt||pt,$t=$t||wt,(Ct!==R||Lt!==I)&&(i.blendEquationSeparate(nn[Ct],nn[Lt]),R=Ct,I=Lt),(pt!==D||wt!==E||vt!==P||$t!==U)&&(i.blendFuncSeparate(oe[pt],oe[wt],oe[vt],oe[$t]),D=pt,E=wt,P=vt,U=$t),(Wt.equals(b)===!1||Ne!==C)&&(i.blendColor(Wt.r,Wt.g,Wt.b,Ne),b.copy(Wt),C=Ne),g=k,O=!1}function Ee(k,Ct){k.side===Xn?Bt(i.CULL_FACE):gt(i.CULL_FACE);let pt=k.side===Sn;Ct&&(pt=!pt),de(pt),k.blending===ys&&k.transparent===!1?Ot(Fi):Ot(k.blending,k.blendEquation,k.blendSrc,k.blendDst,k.blendEquationAlpha,k.blendSrcAlpha,k.blendDstAlpha,k.blendColor,k.blendAlpha,k.premultipliedAlpha),a.setFunc(k.depthFunc),a.setTest(k.depthTest),a.setMask(k.depthWrite),r.setMask(k.colorWrite);let wt=k.stencilWrite;o.setTest(wt),wt&&(o.setMask(k.stencilWriteMask),o.setFunc(k.stencilFunc,k.stencilRef,k.stencilFuncMask),o.setOp(k.stencilFail,k.stencilZFail,k.stencilZPass)),En(k.polygonOffset,k.polygonOffsetFactor,k.polygonOffsetUnits),k.alphaToCoverage===!0?gt(i.SAMPLE_ALPHA_TO_COVERAGE):Bt(i.SAMPLE_ALPHA_TO_COVERAGE)}function de(k){H!==k&&(k?i.frontFace(i.CW):i.frontFace(i.CCW),H=k)}function pe(k){k!==Ju?(gt(i.CULL_FACE),k!==Y&&(k===nh?i.cullFace(i.BACK):k===Ku?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Bt(i.CULL_FACE),Y=k}function $e(k){k!==Q&&(ht&&i.lineWidth(k),Q=k)}function En(k,Ct,pt){k?(gt(i.POLYGON_OFFSET_FILL),(z!==Ct||tt!==pt)&&(z=Ct,tt=pt,a.getReversed()&&(Ct=-Ct),i.polygonOffset(Ct,pt))):Bt(i.POLYGON_OFFSET_FILL)}function Ve(k){k?gt(i.SCISSOR_TEST):Bt(i.SCISSOR_TEST)}function Je(k){k===void 0&&(k=i.TEXTURE0+dt-1),q!==k&&(i.activeTexture(k),q=k)}function V(k,Ct,pt){pt===void 0&&(q===null?pt=i.TEXTURE0+dt-1:pt=q);let wt=_t[pt];wt===void 0&&(wt={type:void 0,texture:void 0},_t[pt]=wt),(wt.type!==k||wt.texture!==Ct)&&(q!==pt&&(i.activeTexture(pt),q=pt),i.bindTexture(k,Ct||lt[k]),wt.type=k,wt.texture=Ct)}function ln(){let k=_t[q];k!==void 0&&k.type!==void 0&&(i.bindTexture(k.type,null),k.type=void 0,k.texture=void 0)}function he(){try{i.compressedTexImage2D(...arguments)}catch(k){ne("WebGLState:",k)}}function L(){try{i.compressedTexImage3D(...arguments)}catch(k){ne("WebGLState:",k)}}function S(){try{i.texSubImage2D(...arguments)}catch(k){ne("WebGLState:",k)}}function Z(){try{i.texSubImage3D(...arguments)}catch(k){ne("WebGLState:",k)}}function et(){try{i.compressedTexSubImage2D(...arguments)}catch(k){ne("WebGLState:",k)}}function at(){try{i.compressedTexSubImage3D(...arguments)}catch(k){ne("WebGLState:",k)}}function Mt(){try{i.texStorage2D(...arguments)}catch(k){ne("WebGLState:",k)}}function At(){try{i.texStorage3D(...arguments)}catch(k){ne("WebGLState:",k)}}function st(){try{i.texImage2D(...arguments)}catch(k){ne("WebGLState:",k)}}function mt(){try{i.texImage3D(...arguments)}catch(k){ne("WebGLState:",k)}}function Et(k){return _[k]!==void 0?_[k]:i.getParameter(k)}function Yt(k,Ct){_[k]!==Ct&&(i.pixelStorei(k,Ct),_[k]=Ct)}function Rt(k){De.equals(k)===!1&&(i.scissor(k.x,k.y,k.z,k.w),De.copy(k))}function bt(k){xe.equals(k)===!1&&(i.viewport(k.x,k.y,k.z,k.w),xe.copy(k))}function Ht(k,Ct){let pt=h.get(Ct);pt===void 0&&(pt=new WeakMap,h.set(Ct,pt));let wt=pt.get(k);wt===void 0&&(wt=i.getUniformBlockIndex(Ct,k.name),pt.set(k,wt))}function Kt(k,Ct){let wt=h.get(Ct).get(k);c.get(Ct)!==wt&&(i.uniformBlockBinding(Ct,wt,k.__bindingPointIndex),c.set(Ct,wt))}function re(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),d={},_={},q=null,_t={},u={},m=new WeakMap,M=[],T=null,v=!1,g=null,R=null,D=null,E=null,I=null,P=null,U=null,b=new jt(0,0,0),C=0,O=!1,H=null,Y=null,Q=null,z=null,tt=null,De.set(0,0,i.canvas.width,i.canvas.height),xe.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:gt,disable:Bt,bindFramebuffer:te,drawBuffers:St,useProgram:ee,setBlending:Ot,setMaterial:Ee,setFlipSided:de,setCullFace:pe,setLineWidth:$e,setPolygonOffset:En,setScissorTest:Ve,activeTexture:Je,bindTexture:V,unbindTexture:ln,compressedTexImage2D:he,compressedTexImage3D:L,texImage2D:st,texImage3D:mt,pixelStorei:Yt,getParameter:Et,updateUBOMapping:Ht,uniformBlockBinding:Kt,texStorage2D:Mt,texStorage3D:At,texSubImage2D:S,texSubImage3D:Z,compressedTexSubImage2D:et,compressedTexSubImage3D:at,scissor:Rt,viewport:bt,reset:re}}function Ux(i,t,e,n,s,r,a){let o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),h=new kt,d=new WeakMap,_=new Set,u,m=new WeakMap,M=!1;try{M=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function T(L,S){return M?new OffscreenCanvas(L,S):_r("canvas")}function v(L,S,Z){let et=1,at=he(L);if((at.width>Z||at.height>Z)&&(et=Z/Math.max(at.width,at.height)),et<1)if(typeof HTMLImageElement<"u"&&L instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&L instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&L instanceof ImageBitmap||typeof VideoFrame<"u"&&L instanceof VideoFrame){let Mt=Math.floor(et*at.width),At=Math.floor(et*at.height);u===void 0&&(u=T(Mt,At));let st=S?T(Mt,At):u;return st.width=Mt,st.height=At,st.getContext("2d").drawImage(L,0,0,Mt,At),Qt("WebGLRenderer: Texture has been resized from ("+at.width+"x"+at.height+") to ("+Mt+"x"+At+")."),st}else return"data"in L&&Qt("WebGLRenderer: Image in DataTexture is too big ("+at.width+"x"+at.height+")."),L;return L}function g(L){return L.generateMipmaps}function R(L){i.generateMipmap(L)}function D(L){return L.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:L.isWebGL3DRenderTarget?i.TEXTURE_3D:L.isWebGLArrayRenderTarget||L.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function E(L,S,Z,et,at,Mt=!1){if(L!==null){if(i[L]!==void 0)return i[L];Qt("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+L+"'")}let At;et&&(At=t.get("EXT_texture_norm16"),At||Qt("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let st=S;if(S===i.RED&&(Z===i.FLOAT&&(st=i.R32F),Z===i.HALF_FLOAT&&(st=i.R16F),Z===i.UNSIGNED_BYTE&&(st=i.R8),Z===i.UNSIGNED_SHORT&&At&&(st=At.R16_EXT),Z===i.SHORT&&At&&(st=At.R16_SNORM_EXT)),S===i.RED_INTEGER&&(Z===i.UNSIGNED_BYTE&&(st=i.R8UI),Z===i.UNSIGNED_SHORT&&(st=i.R16UI),Z===i.UNSIGNED_INT&&(st=i.R32UI),Z===i.BYTE&&(st=i.R8I),Z===i.SHORT&&(st=i.R16I),Z===i.INT&&(st=i.R32I)),S===i.RG&&(Z===i.FLOAT&&(st=i.RG32F),Z===i.HALF_FLOAT&&(st=i.RG16F),Z===i.UNSIGNED_BYTE&&(st=i.RG8),Z===i.UNSIGNED_SHORT&&At&&(st=At.RG16_EXT),Z===i.SHORT&&At&&(st=At.RG16_SNORM_EXT)),S===i.RG_INTEGER&&(Z===i.UNSIGNED_BYTE&&(st=i.RG8UI),Z===i.UNSIGNED_SHORT&&(st=i.RG16UI),Z===i.UNSIGNED_INT&&(st=i.RG32UI),Z===i.BYTE&&(st=i.RG8I),Z===i.SHORT&&(st=i.RG16I),Z===i.INT&&(st=i.RG32I)),S===i.RGB_INTEGER&&(Z===i.UNSIGNED_BYTE&&(st=i.RGB8UI),Z===i.UNSIGNED_SHORT&&(st=i.RGB16UI),Z===i.UNSIGNED_INT&&(st=i.RGB32UI),Z===i.BYTE&&(st=i.RGB8I),Z===i.SHORT&&(st=i.RGB16I),Z===i.INT&&(st=i.RGB32I)),S===i.RGBA_INTEGER&&(Z===i.UNSIGNED_BYTE&&(st=i.RGBA8UI),Z===i.UNSIGNED_SHORT&&(st=i.RGBA16UI),Z===i.UNSIGNED_INT&&(st=i.RGBA32UI),Z===i.BYTE&&(st=i.RGBA8I),Z===i.SHORT&&(st=i.RGBA16I),Z===i.INT&&(st=i.RGBA32I)),S===i.RGB&&(Z===i.UNSIGNED_SHORT&&At&&(st=At.RGB16_EXT),Z===i.SHORT&&At&&(st=At.RGB16_SNORM_EXT),Z===i.UNSIGNED_INT_5_9_9_9_REV&&(st=i.RGB9_E5),Z===i.UNSIGNED_INT_10F_11F_11F_REV&&(st=i.R11F_G11F_B10F)),S===i.RGBA){let mt=Mt?ea:Se.getTransfer(at);Z===i.FLOAT&&(st=i.RGBA32F),Z===i.HALF_FLOAT&&(st=i.RGBA16F),Z===i.UNSIGNED_BYTE&&(st=mt===Le?i.SRGB8_ALPHA8:i.RGBA8),Z===i.UNSIGNED_SHORT&&At&&(st=At.RGBA16_EXT),Z===i.SHORT&&At&&(st=At.RGBA16_SNORM_EXT),Z===i.UNSIGNED_SHORT_4_4_4_4&&(st=i.RGBA4),Z===i.UNSIGNED_SHORT_5_5_5_1&&(st=i.RGB5_A1)}return(st===i.R16F||st===i.R32F||st===i.RG16F||st===i.RG32F||st===i.RGBA16F||st===i.RGBA32F)&&t.get("EXT_color_buffer_float"),st}function I(L,S){let Z;return L?S===null||S===bi||S===Pr?Z=i.DEPTH24_STENCIL8:S===wi?Z=i.DEPTH32F_STENCIL8:S===Rr&&(Z=i.DEPTH24_STENCIL8,Qt("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):S===null||S===bi||S===Pr?Z=i.DEPTH_COMPONENT24:S===wi?Z=i.DEPTH_COMPONENT32F:S===Rr&&(Z=i.DEPTH_COMPONENT16),Z}function P(L,S){return g(L)===!0||L.isFramebufferTexture&&L.minFilter!==Mn&&L.minFilter!==wn?Math.log2(Math.max(S.width,S.height))+1:L.mipmaps!==void 0&&L.mipmaps.length>0?L.mipmaps.length:L.isCompressedTexture&&Array.isArray(L.image)?S.mipmaps.length:1}function U(L){let S=L.target;S.removeEventListener("dispose",U),C(S),S.isVideoTexture&&d.delete(S),S.isHTMLTexture&&_.delete(S)}function b(L){let S=L.target;S.removeEventListener("dispose",b),H(S)}function C(L){let S=n.get(L);if(S.__webglInit===void 0)return;let Z=L.source,et=m.get(Z);if(et){let at=et[S.__cacheKey];at.usedTimes--,at.usedTimes===0&&O(L),Object.keys(et).length===0&&m.delete(Z)}n.remove(L)}function O(L){let S=n.get(L);i.deleteTexture(S.__webglTexture);let Z=L.source,et=m.get(Z);delete et[S.__cacheKey],a.memory.textures--}function H(L){let S=n.get(L);if(L.depthTexture&&(L.depthTexture.dispose(),n.remove(L.depthTexture)),L.isWebGLCubeRenderTarget)for(let et=0;et<6;et++){if(Array.isArray(S.__webglFramebuffer[et]))for(let at=0;at<S.__webglFramebuffer[et].length;at++)i.deleteFramebuffer(S.__webglFramebuffer[et][at]);else i.deleteFramebuffer(S.__webglFramebuffer[et]);S.__webglDepthbuffer&&i.deleteRenderbuffer(S.__webglDepthbuffer[et])}else{if(Array.isArray(S.__webglFramebuffer))for(let et=0;et<S.__webglFramebuffer.length;et++)i.deleteFramebuffer(S.__webglFramebuffer[et]);else i.deleteFramebuffer(S.__webglFramebuffer);if(S.__webglDepthbuffer&&i.deleteRenderbuffer(S.__webglDepthbuffer),S.__webglMultisampledFramebuffer&&i.deleteFramebuffer(S.__webglMultisampledFramebuffer),S.__webglColorRenderbuffer)for(let et=0;et<S.__webglColorRenderbuffer.length;et++)S.__webglColorRenderbuffer[et]&&i.deleteRenderbuffer(S.__webglColorRenderbuffer[et]);S.__webglDepthRenderbuffer&&i.deleteRenderbuffer(S.__webglDepthRenderbuffer)}let Z=L.textures;for(let et=0,at=Z.length;et<at;et++){let Mt=n.get(Z[et]);Mt.__webglTexture&&(i.deleteTexture(Mt.__webglTexture),a.memory.textures--),n.remove(Z[et])}n.remove(L)}let Y=0;function Q(){Y=0}function z(){return Y}function tt(L){Y=L}function dt(){let L=Y;return L>=s.maxTextures&&Qt("WebGLTextures: Trying to use "+(L+1)+" texture units while this GPU supports only "+s.maxTextures),Y+=1,L}function ht(L){let S=[];return S.push(L.wrapS),S.push(L.wrapT),S.push(L.wrapR||0),S.push(L.magFilter),S.push(L.minFilter),S.push(L.anisotropy),S.push(L.internalFormat),S.push(L.format),S.push(L.type),S.push(L.generateMipmaps),S.push(L.premultiplyAlpha),S.push(L.flipY),S.push(L.unpackAlignment),S.push(L.colorSpace),S.join()}function yt(L,S){let Z=n.get(L);if(L.isVideoTexture&&V(L),L.isRenderTargetTexture===!1&&L.isExternalTexture!==!0&&L.version>0&&Z.__version!==L.version){let et=L.image;if(et===null)Qt("WebGLRenderer: Texture marked for update but no image data found.");else if(et.complete===!1)Qt("WebGLRenderer: Texture marked for update but image is incomplete");else{Bt(Z,L,S);return}}else L.isExternalTexture&&(Z.__webglTexture=L.sourceTexture?L.sourceTexture:null);e.bindTexture(i.TEXTURE_2D,Z.__webglTexture,i.TEXTURE0+S)}function rt(L,S){let Z=n.get(L);if(L.isRenderTargetTexture===!1&&L.version>0&&Z.__version!==L.version){Bt(Z,L,S);return}else L.isExternalTexture&&(Z.__webglTexture=L.sourceTexture?L.sourceTexture:null);e.bindTexture(i.TEXTURE_2D_ARRAY,Z.__webglTexture,i.TEXTURE0+S)}function q(L,S){let Z=n.get(L);if(L.isRenderTargetTexture===!1&&L.version>0&&Z.__version!==L.version){Bt(Z,L,S);return}e.bindTexture(i.TEXTURE_3D,Z.__webglTexture,i.TEXTURE0+S)}function _t(L,S){let Z=n.get(L);if(L.isCubeDepthTexture!==!0&&L.version>0&&Z.__version!==L.version){te(Z,L,S);return}e.bindTexture(i.TEXTURE_CUBE_MAP,Z.__webglTexture,i.TEXTURE0+S)}let qt={[Io]:i.REPEAT,[Ii]:i.CLAMP_TO_EDGE,[Lo]:i.MIRRORED_REPEAT},Zt={[Mn]:i.NEAREST,[vd]:i.NEAREST_MIPMAP_NEAREST,[Ta]:i.NEAREST_MIPMAP_LINEAR,[wn]:i.LINEAR,[ml]:i.LINEAR_MIPMAP_NEAREST,[Ss]:i.LINEAR_MIPMAP_LINEAR},De={[bd]:i.NEVER,[Cd]:i.ALWAYS,[wd]:i.LESS,[Ql]:i.LEQUAL,[Td]:i.EQUAL,[tc]:i.GEQUAL,[Ad]:i.GREATER,[Ed]:i.NOTEQUAL};function xe(L,S){if(S.type===wi&&t.has("OES_texture_float_linear")===!1&&(S.magFilter===wn||S.magFilter===ml||S.magFilter===Ta||S.magFilter===Ss||S.minFilter===wn||S.minFilter===ml||S.minFilter===Ta||S.minFilter===Ss)&&Qt("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(L,i.TEXTURE_WRAP_S,qt[S.wrapS]),i.texParameteri(L,i.TEXTURE_WRAP_T,qt[S.wrapT]),(L===i.TEXTURE_3D||L===i.TEXTURE_2D_ARRAY)&&i.texParameteri(L,i.TEXTURE_WRAP_R,qt[S.wrapR]),i.texParameteri(L,i.TEXTURE_MAG_FILTER,Zt[S.magFilter]),i.texParameteri(L,i.TEXTURE_MIN_FILTER,Zt[S.minFilter]),S.compareFunction&&(i.texParameteri(L,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(L,i.TEXTURE_COMPARE_FUNC,De[S.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(S.magFilter===Mn||S.minFilter!==Ta&&S.minFilter!==Ss||S.type===wi&&t.has("OES_texture_float_linear")===!1)return;if(S.anisotropy>1||n.get(S).__currentAnisotropy){let Z=t.get("EXT_texture_filter_anisotropic");i.texParameterf(L,Z.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(S.anisotropy,s.getMaxAnisotropy())),n.get(S).__currentAnisotropy=S.anisotropy}}}function ge(L,S){let Z=!1;L.__webglInit===void 0&&(L.__webglInit=!0,S.addEventListener("dispose",U));let et=S.source,at=m.get(et);at===void 0&&(at={},m.set(et,at));let Mt=ht(S);if(Mt!==L.__cacheKey){at[Mt]===void 0&&(at[Mt]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,Z=!0),at[Mt].usedTimes++;let At=at[L.__cacheKey];At!==void 0&&(at[L.__cacheKey].usedTimes--,At.usedTimes===0&&O(S)),L.__cacheKey=Mt,L.__webglTexture=at[Mt].texture}return Z}function lt(L,S,Z){return Math.floor(Math.floor(L/Z)/S)}function gt(L,S,Z,et){let Mt=L.updateRanges;if(Mt.length===0)e.texSubImage2D(i.TEXTURE_2D,0,0,0,S.width,S.height,Z,et,S.data);else{Mt.sort((Yt,Rt)=>Yt.start-Rt.start);let At=0;for(let Yt=1;Yt<Mt.length;Yt++){let Rt=Mt[At],bt=Mt[Yt],Ht=Rt.start+Rt.count,Kt=lt(bt.start,S.width,4),re=lt(Rt.start,S.width,4);bt.start<=Ht+1&&Kt===re&&lt(bt.start+bt.count-1,S.width,4)===Kt?Rt.count=Math.max(Rt.count,bt.start+bt.count-Rt.start):(++At,Mt[At]=bt)}Mt.length=At+1;let st=e.getParameter(i.UNPACK_ROW_LENGTH),mt=e.getParameter(i.UNPACK_SKIP_PIXELS),Et=e.getParameter(i.UNPACK_SKIP_ROWS);e.pixelStorei(i.UNPACK_ROW_LENGTH,S.width);for(let Yt=0,Rt=Mt.length;Yt<Rt;Yt++){let bt=Mt[Yt],Ht=Math.floor(bt.start/4),Kt=Math.ceil(bt.count/4),re=Ht%S.width,k=Math.floor(Ht/S.width),Ct=Kt,pt=1;e.pixelStorei(i.UNPACK_SKIP_PIXELS,re),e.pixelStorei(i.UNPACK_SKIP_ROWS,k),e.texSubImage2D(i.TEXTURE_2D,0,re,k,Ct,pt,Z,et,S.data)}L.clearUpdateRanges(),e.pixelStorei(i.UNPACK_ROW_LENGTH,st),e.pixelStorei(i.UNPACK_SKIP_PIXELS,mt),e.pixelStorei(i.UNPACK_SKIP_ROWS,Et)}}function Bt(L,S,Z){let et=i.TEXTURE_2D;(S.isDataArrayTexture||S.isCompressedArrayTexture)&&(et=i.TEXTURE_2D_ARRAY),S.isData3DTexture&&(et=i.TEXTURE_3D);let at=ge(L,S),Mt=S.source;e.bindTexture(et,L.__webglTexture,i.TEXTURE0+Z);let At=n.get(Mt);if(Mt.version!==At.__version||at===!0){if(e.activeTexture(i.TEXTURE0+Z),(typeof ImageBitmap<"u"&&S.image instanceof ImageBitmap)===!1){let pt=Se.getPrimaries(Se.workingColorSpace),wt=S.colorSpace===Ji?null:Se.getPrimaries(S.colorSpace),Lt=S.colorSpace===Ji||pt===wt?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,S.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Lt)}e.pixelStorei(i.UNPACK_ALIGNMENT,S.unpackAlignment);let mt=v(S.image,!1,s.maxTextureSize);mt=ln(S,mt);let Et=r.convert(S.format,S.colorSpace),Yt=r.convert(S.type),Rt=E(S.internalFormat,Et,Yt,S.normalized,S.colorSpace,S.isVideoTexture);xe(et,S);let bt,Ht=S.mipmaps,Kt=S.isVideoTexture!==!0,re=At.__version===void 0||at===!0,k=Mt.dataReady,Ct=P(S,mt);if(S.isDepthTexture)Rt=I(S.format===bs,S.type),re&&(Kt?e.texStorage2D(i.TEXTURE_2D,1,Rt,mt.width,mt.height):e.texImage2D(i.TEXTURE_2D,0,Rt,mt.width,mt.height,0,Et,Yt,null));else if(S.isDataTexture)if(Ht.length>0){Kt&&re&&e.texStorage2D(i.TEXTURE_2D,Ct,Rt,Ht[0].width,Ht[0].height);for(let pt=0,wt=Ht.length;pt<wt;pt++)bt=Ht[pt],Kt?k&&e.texSubImage2D(i.TEXTURE_2D,pt,0,0,bt.width,bt.height,Et,Yt,bt.data):e.texImage2D(i.TEXTURE_2D,pt,Rt,bt.width,bt.height,0,Et,Yt,bt.data);S.generateMipmaps=!1}else Kt?(re&&e.texStorage2D(i.TEXTURE_2D,Ct,Rt,mt.width,mt.height),k&&gt(S,mt,Et,Yt)):e.texImage2D(i.TEXTURE_2D,0,Rt,mt.width,mt.height,0,Et,Yt,mt.data);else if(S.isCompressedTexture)if(S.isCompressedArrayTexture){Kt&&re&&e.texStorage3D(i.TEXTURE_2D_ARRAY,Ct,Rt,Ht[0].width,Ht[0].height,mt.depth);for(let pt=0,wt=Ht.length;pt<wt;pt++)if(bt=Ht[pt],S.format!==ui)if(Et!==null)if(Kt){if(k)if(S.layerUpdates.size>0){let Lt=Ch(bt.width,bt.height,S.format,S.type);for(let vt of S.layerUpdates){let $t=bt.data.subarray(vt*Lt/bt.data.BYTES_PER_ELEMENT,(vt+1)*Lt/bt.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,pt,0,0,vt,bt.width,bt.height,1,Et,$t)}}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,pt,0,0,0,bt.width,bt.height,mt.depth,Et,bt.data)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,pt,Rt,bt.width,bt.height,mt.depth,0,bt.data,0,0);else Qt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Kt?k&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,pt,0,0,0,bt.width,bt.height,mt.depth,Et,Yt,bt.data):e.texImage3D(i.TEXTURE_2D_ARRAY,pt,Rt,bt.width,bt.height,mt.depth,0,Et,Yt,bt.data);S.layerUpdates.size>0&&S.clearLayerUpdates()}else{Kt&&re&&e.texStorage2D(i.TEXTURE_2D,Ct,Rt,Ht[0].width,Ht[0].height);for(let pt=0,wt=Ht.length;pt<wt;pt++)bt=Ht[pt],S.format!==ui?Et!==null?Kt?k&&e.compressedTexSubImage2D(i.TEXTURE_2D,pt,0,0,bt.width,bt.height,Et,bt.data):e.compressedTexImage2D(i.TEXTURE_2D,pt,Rt,bt.width,bt.height,0,bt.data):Qt("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Kt?k&&e.texSubImage2D(i.TEXTURE_2D,pt,0,0,bt.width,bt.height,Et,Yt,bt.data):e.texImage2D(i.TEXTURE_2D,pt,Rt,bt.width,bt.height,0,Et,Yt,bt.data)}else if(S.isDataArrayTexture)if(Kt){if(re&&e.texStorage3D(i.TEXTURE_2D_ARRAY,Ct,Rt,mt.width,mt.height,mt.depth),k)if(S.layerUpdates.size>0){let pt=Ch(mt.width,mt.height,S.format,S.type);for(let wt of S.layerUpdates){let Lt=mt.data.subarray(wt*pt/mt.data.BYTES_PER_ELEMENT,(wt+1)*pt/mt.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,wt,mt.width,mt.height,1,Et,Yt,Lt)}S.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,mt.width,mt.height,mt.depth,Et,Yt,mt.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,Rt,mt.width,mt.height,mt.depth,0,Et,Yt,mt.data);else if(S.isData3DTexture)Kt?(re&&e.texStorage3D(i.TEXTURE_3D,Ct,Rt,mt.width,mt.height,mt.depth),k&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,mt.width,mt.height,mt.depth,Et,Yt,mt.data)):e.texImage3D(i.TEXTURE_3D,0,Rt,mt.width,mt.height,mt.depth,0,Et,Yt,mt.data);else if(S.isFramebufferTexture){if(re)if(Kt)e.texStorage2D(i.TEXTURE_2D,Ct,Rt,mt.width,mt.height);else{let pt=mt.width,wt=mt.height;for(let Lt=0;Lt<Ct;Lt++)e.texImage2D(i.TEXTURE_2D,Lt,Rt,pt,wt,0,Et,Yt,null),pt>>=1,wt>>=1}}else if(S.isHTMLTexture){if("texElementImage2D"in i){let pt=i.canvas;if(pt.hasAttribute("layoutsubtree")||pt.setAttribute("layoutsubtree","true"),mt.parentNode!==pt){pt.appendChild(mt),_.add(S),pt.onpaint=wt=>{let Lt=wt.changedElements;for(let vt of _)Lt.includes(vt.image)&&(vt.needsUpdate=!0)},pt.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,mt);else{let Lt=i.RGBA,vt=i.RGBA,$t=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,Lt,vt,$t,mt)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(Ht.length>0){if(Kt&&re){let pt=he(Ht[0]);e.texStorage2D(i.TEXTURE_2D,Ct,Rt,pt.width,pt.height)}for(let pt=0,wt=Ht.length;pt<wt;pt++)bt=Ht[pt],Kt?k&&e.texSubImage2D(i.TEXTURE_2D,pt,0,0,Et,Yt,bt):e.texImage2D(i.TEXTURE_2D,pt,Rt,Et,Yt,bt);S.generateMipmaps=!1}else if(Kt){if(re){let pt=he(mt);e.texStorage2D(i.TEXTURE_2D,Ct,Rt,pt.width,pt.height)}k&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,Et,Yt,mt)}else e.texImage2D(i.TEXTURE_2D,0,Rt,Et,Yt,mt);g(S)&&R(et),At.__version=Mt.version,S.onUpdate&&S.onUpdate(S)}L.__version=S.version}function te(L,S,Z){if(S.image.length!==6)return;let et=ge(L,S),at=S.source;e.bindTexture(i.TEXTURE_CUBE_MAP,L.__webglTexture,i.TEXTURE0+Z);let Mt=n.get(at);if(at.version!==Mt.__version||et===!0){e.activeTexture(i.TEXTURE0+Z);let At=Se.getPrimaries(Se.workingColorSpace),st=S.colorSpace===Ji?null:Se.getPrimaries(S.colorSpace),mt=S.colorSpace===Ji||At===st?i.NONE:i.BROWSER_DEFAULT_WEBGL;e.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,S.flipY),e.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,S.premultiplyAlpha),e.pixelStorei(i.UNPACK_ALIGNMENT,S.unpackAlignment),e.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,mt);let Et=S.isCompressedTexture||S.image[0].isCompressedTexture,Yt=S.image[0]&&S.image[0].isDataTexture,Rt=[];for(let vt=0;vt<6;vt++)!Et&&!Yt?Rt[vt]=v(S.image[vt],!0,s.maxCubemapSize):Rt[vt]=Yt?S.image[vt].image:S.image[vt],Rt[vt]=ln(S,Rt[vt]);let bt=Rt[0],Ht=r.convert(S.format,S.colorSpace),Kt=r.convert(S.type),re=E(S.internalFormat,Ht,Kt,S.normalized,S.colorSpace),k=S.isVideoTexture!==!0,Ct=Mt.__version===void 0||et===!0,pt=at.dataReady,wt=P(S,bt);xe(i.TEXTURE_CUBE_MAP,S);let Lt;if(Et){k&&Ct&&e.texStorage2D(i.TEXTURE_CUBE_MAP,wt,re,bt.width,bt.height);for(let vt=0;vt<6;vt++){Lt=Rt[vt].mipmaps;for(let $t=0;$t<Lt.length;$t++){let Wt=Lt[$t];S.format!==ui?Ht!==null?k?pt&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+vt,$t,0,0,Wt.width,Wt.height,Ht,Wt.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+vt,$t,re,Wt.width,Wt.height,0,Wt.data):Qt("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):k?pt&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+vt,$t,0,0,Wt.width,Wt.height,Ht,Kt,Wt.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+vt,$t,re,Wt.width,Wt.height,0,Ht,Kt,Wt.data)}}}else{if(Lt=S.mipmaps,k&&Ct){Lt.length>0&&wt++;let vt=he(Rt[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,wt,re,vt.width,vt.height)}for(let vt=0;vt<6;vt++)if(Yt){k?pt&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+vt,0,0,0,Rt[vt].width,Rt[vt].height,Ht,Kt,Rt[vt].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+vt,0,re,Rt[vt].width,Rt[vt].height,0,Ht,Kt,Rt[vt].data);for(let $t=0;$t<Lt.length;$t++){let Ne=Lt[$t].image[vt].image;k?pt&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+vt,$t+1,0,0,Ne.width,Ne.height,Ht,Kt,Ne.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+vt,$t+1,re,Ne.width,Ne.height,0,Ht,Kt,Ne.data)}}else{k?pt&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+vt,0,0,0,Ht,Kt,Rt[vt]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+vt,0,re,Ht,Kt,Rt[vt]);for(let $t=0;$t<Lt.length;$t++){let Wt=Lt[$t];k?pt&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+vt,$t+1,0,0,Ht,Kt,Wt.image[vt]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+vt,$t+1,re,Ht,Kt,Wt.image[vt])}}}g(S)&&R(i.TEXTURE_CUBE_MAP),Mt.__version=at.version,S.onUpdate&&S.onUpdate(S)}L.__version=S.version}function St(L,S,Z,et,at,Mt){let At=r.convert(Z.format,Z.colorSpace),st=r.convert(Z.type),mt=E(Z.internalFormat,At,st,Z.normalized,Z.colorSpace),Et=n.get(S),Yt=n.get(Z);if(Yt.__renderTarget=S,!Et.__hasExternalTextures){let Rt=Math.max(1,S.width>>Mt),bt=Math.max(1,S.height>>Mt);at===i.TEXTURE_3D||at===i.TEXTURE_2D_ARRAY?e.texImage3D(at,Mt,mt,Rt,bt,S.depth,0,At,st,null):e.texImage2D(at,Mt,mt,Rt,bt,0,At,st,null)}e.bindFramebuffer(i.FRAMEBUFFER,L),Je(S)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,et,at,Yt.__webglTexture,0,Ve(S)):(at===i.TEXTURE_2D||at>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&at<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,et,at,Yt.__webglTexture,Mt),e.bindFramebuffer(i.FRAMEBUFFER,null)}function ee(L,S,Z){if(i.bindRenderbuffer(i.RENDERBUFFER,L),S.depthBuffer){let et=S.depthTexture,at=et&&et.isDepthTexture?et.type:null,Mt=I(S.stencilBuffer,at),At=S.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;Je(S)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Ve(S),Mt,S.width,S.height):Z?i.renderbufferStorageMultisample(i.RENDERBUFFER,Ve(S),Mt,S.width,S.height):i.renderbufferStorage(i.RENDERBUFFER,Mt,S.width,S.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,At,i.RENDERBUFFER,L)}else{let et=S.textures;for(let at=0;at<et.length;at++){let Mt=et[at],At=r.convert(Mt.format,Mt.colorSpace),st=r.convert(Mt.type),mt=E(Mt.internalFormat,At,st,Mt.normalized,Mt.colorSpace);Je(S)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Ve(S),mt,S.width,S.height):Z?i.renderbufferStorageMultisample(i.RENDERBUFFER,Ve(S),mt,S.width,S.height):i.renderbufferStorage(i.RENDERBUFFER,mt,S.width,S.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function nn(L,S,Z){let et=S.isWebGLCubeRenderTarget===!0;if(e.bindFramebuffer(i.FRAMEBUFFER,L),!(S.depthTexture&&S.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let at=n.get(S.depthTexture);if(at.__renderTarget=S,(!at.__webglTexture||S.depthTexture.image.width!==S.width||S.depthTexture.image.height!==S.height)&&(S.depthTexture.image.width=S.width,S.depthTexture.image.height=S.height,S.depthTexture.needsUpdate=!0),et){if(at.__webglInit===void 0&&(at.__webglInit=!0,S.depthTexture.addEventListener("dispose",U)),at.__webglTexture===void 0){at.__webglTexture=i.createTexture(),e.bindTexture(i.TEXTURE_CUBE_MAP,at.__webglTexture),xe(i.TEXTURE_CUBE_MAP,S.depthTexture);let Et=r.convert(S.depthTexture.format),Yt=r.convert(S.depthTexture.type),Rt;S.depthTexture.format===Li?Rt=i.DEPTH_COMPONENT24:S.depthTexture.format===bs&&(Rt=i.DEPTH24_STENCIL8);for(let bt=0;bt<6;bt++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+bt,0,Rt,S.width,S.height,0,Et,Yt,null)}}else yt(S.depthTexture,0);let Mt=at.__webglTexture,At=Ve(S),st=et?i.TEXTURE_CUBE_MAP_POSITIVE_X+Z:i.TEXTURE_2D,mt=S.depthTexture.format===bs?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(S.depthTexture.format===Li)Je(S)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,mt,st,Mt,0,At):i.framebufferTexture2D(i.FRAMEBUFFER,mt,st,Mt,0);else if(S.depthTexture.format===bs)Je(S)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,mt,st,Mt,0,At):i.framebufferTexture2D(i.FRAMEBUFFER,mt,st,Mt,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function oe(L){let S=n.get(L),Z=L.isWebGLCubeRenderTarget===!0;if(S.__boundDepthTexture!==L.depthTexture){let et=L.depthTexture;if(S.__depthDisposeCallback&&S.__depthDisposeCallback(),et){let at=()=>{delete S.__boundDepthTexture,delete S.__depthDisposeCallback,et.removeEventListener("dispose",at)};et.addEventListener("dispose",at),S.__depthDisposeCallback=at}S.__boundDepthTexture=et}if(L.depthTexture&&!S.__autoAllocateDepthBuffer)if(Z)for(let et=0;et<6;et++)nn(S.__webglFramebuffer[et],L,et);else{let et=L.texture.mipmaps;et&&et.length>0?nn(S.__webglFramebuffer[0],L,0):nn(S.__webglFramebuffer,L,0)}else if(Z){S.__webglDepthbuffer=[];for(let et=0;et<6;et++)if(e.bindFramebuffer(i.FRAMEBUFFER,S.__webglFramebuffer[et]),S.__webglDepthbuffer[et]===void 0)S.__webglDepthbuffer[et]=i.createRenderbuffer(),ee(S.__webglDepthbuffer[et],L,!1);else{let at=L.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Mt=S.__webglDepthbuffer[et];i.bindRenderbuffer(i.RENDERBUFFER,Mt),i.framebufferRenderbuffer(i.FRAMEBUFFER,at,i.RENDERBUFFER,Mt)}}else{let et=L.texture.mipmaps;if(et&&et.length>0?e.bindFramebuffer(i.FRAMEBUFFER,S.__webglFramebuffer[0]):e.bindFramebuffer(i.FRAMEBUFFER,S.__webglFramebuffer),S.__webglDepthbuffer===void 0)S.__webglDepthbuffer=i.createRenderbuffer(),ee(S.__webglDepthbuffer,L,!1);else{let at=L.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Mt=S.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,Mt),i.framebufferRenderbuffer(i.FRAMEBUFFER,at,i.RENDERBUFFER,Mt)}}e.bindFramebuffer(i.FRAMEBUFFER,null)}function Ot(L,S,Z){let et=n.get(L);S!==void 0&&St(et.__webglFramebuffer,L,L.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),Z!==void 0&&oe(L)}function Ee(L){let S=L.texture,Z=n.get(L),et=n.get(S);L.addEventListener("dispose",b);let at=L.textures,Mt=L.isWebGLCubeRenderTarget===!0,At=at.length>1;if(At||(et.__webglTexture===void 0&&(et.__webglTexture=i.createTexture()),et.__version=S.version,a.memory.textures++),Mt){Z.__webglFramebuffer=[];for(let st=0;st<6;st++)if(S.mipmaps&&S.mipmaps.length>0){Z.__webglFramebuffer[st]=[];for(let mt=0;mt<S.mipmaps.length;mt++)Z.__webglFramebuffer[st][mt]=i.createFramebuffer()}else Z.__webglFramebuffer[st]=i.createFramebuffer()}else{if(S.mipmaps&&S.mipmaps.length>0){Z.__webglFramebuffer=[];for(let st=0;st<S.mipmaps.length;st++)Z.__webglFramebuffer[st]=i.createFramebuffer()}else Z.__webglFramebuffer=i.createFramebuffer();if(At)for(let st=0,mt=at.length;st<mt;st++){let Et=n.get(at[st]);Et.__webglTexture===void 0&&(Et.__webglTexture=i.createTexture(),a.memory.textures++)}if(L.samples>0&&Je(L)===!1){Z.__webglMultisampledFramebuffer=i.createFramebuffer(),Z.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,Z.__webglMultisampledFramebuffer);for(let st=0;st<at.length;st++){let mt=at[st];Z.__webglColorRenderbuffer[st]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,Z.__webglColorRenderbuffer[st]);let Et=r.convert(mt.format,mt.colorSpace),Yt=r.convert(mt.type),Rt=E(mt.internalFormat,Et,Yt,mt.normalized,mt.colorSpace,L.isXRRenderTarget===!0),bt=Ve(L);i.renderbufferStorageMultisample(i.RENDERBUFFER,bt,Rt,L.width,L.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+st,i.RENDERBUFFER,Z.__webglColorRenderbuffer[st])}i.bindRenderbuffer(i.RENDERBUFFER,null),L.depthBuffer&&(Z.__webglDepthRenderbuffer=i.createRenderbuffer(),ee(Z.__webglDepthRenderbuffer,L,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(Mt){e.bindTexture(i.TEXTURE_CUBE_MAP,et.__webglTexture),xe(i.TEXTURE_CUBE_MAP,S);for(let st=0;st<6;st++)if(S.mipmaps&&S.mipmaps.length>0)for(let mt=0;mt<S.mipmaps.length;mt++)St(Z.__webglFramebuffer[st][mt],L,S,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+st,mt);else St(Z.__webglFramebuffer[st],L,S,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+st,0);g(S)&&R(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(At){for(let st=0,mt=at.length;st<mt;st++){let Et=at[st],Yt=n.get(Et),Rt=i.TEXTURE_2D;(L.isWebGL3DRenderTarget||L.isWebGLArrayRenderTarget)&&(Rt=L.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(Rt,Yt.__webglTexture),xe(Rt,Et),St(Z.__webglFramebuffer,L,Et,i.COLOR_ATTACHMENT0+st,Rt,0),g(Et)&&R(Rt)}e.unbindTexture()}else{let st=i.TEXTURE_2D;if((L.isWebGL3DRenderTarget||L.isWebGLArrayRenderTarget)&&(st=L.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(st,et.__webglTexture),xe(st,S),S.mipmaps&&S.mipmaps.length>0)for(let mt=0;mt<S.mipmaps.length;mt++)St(Z.__webglFramebuffer[mt],L,S,i.COLOR_ATTACHMENT0,st,mt);else St(Z.__webglFramebuffer,L,S,i.COLOR_ATTACHMENT0,st,0);g(S)&&R(st),e.unbindTexture()}L.depthBuffer&&oe(L)}function de(L){let S=L.textures;for(let Z=0,et=S.length;Z<et;Z++){let at=S[Z];if(g(at)){let Mt=D(L),At=n.get(at).__webglTexture;e.bindTexture(Mt,At),R(Mt),e.unbindTexture()}}}let pe=[],$e=[];function En(L){if(L.samples>0){if(Je(L)===!1){let S=L.textures,Z=L.width,et=L.height,at=i.COLOR_BUFFER_BIT,Mt=L.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,At=n.get(L),st=S.length>1;if(st)for(let Et=0;Et<S.length;Et++)e.bindFramebuffer(i.FRAMEBUFFER,At.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Et,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,At.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Et,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,At.__webglMultisampledFramebuffer);let mt=L.texture.mipmaps;mt&&mt.length>0?e.bindFramebuffer(i.DRAW_FRAMEBUFFER,At.__webglFramebuffer[0]):e.bindFramebuffer(i.DRAW_FRAMEBUFFER,At.__webglFramebuffer);for(let Et=0;Et<S.length;Et++){if(L.resolveDepthBuffer&&(L.depthBuffer&&(at|=i.DEPTH_BUFFER_BIT),L.stencilBuffer&&L.resolveStencilBuffer&&(at|=i.STENCIL_BUFFER_BIT)),st){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,At.__webglColorRenderbuffer[Et]);let Yt=n.get(S[Et]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Yt,0)}i.blitFramebuffer(0,0,Z,et,0,0,Z,et,at,i.NEAREST),c===!0&&(pe.length=0,$e.length=0,pe.push(i.COLOR_ATTACHMENT0+Et),L.depthBuffer&&L.storeMultisampledDepthBuffer===!1&&(pe.push(Mt),$e.push(Mt),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,$e)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,pe))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),st)for(let Et=0;Et<S.length;Et++){e.bindFramebuffer(i.FRAMEBUFFER,At.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Et,i.RENDERBUFFER,At.__webglColorRenderbuffer[Et]);let Yt=n.get(S[Et]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,At.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Et,i.TEXTURE_2D,Yt,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,At.__webglMultisampledFramebuffer)}else if(L.depthBuffer&&L.storeMultisampledDepthBuffer===!1&&c){let S=L.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[S])}}}function Ve(L){return Math.min(s.maxSamples,L.samples)}function Je(L){let S=n.get(L);return L.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&S.__useRenderToTexture!==!1}function V(L){let S=a.render.frame;d.get(L)!==S&&(d.set(L,S),L.update())}function ln(L,S){let Z=L.colorSpace,et=L.format,at=L.type;return L.isCompressedTexture===!0||L.isVideoTexture===!0||Z!==ta&&Z!==Ji&&(Se.getTransfer(Z)===Le?(et!==ui||at!==qn)&&Qt("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):ne("WebGLTextures: Unsupported texture color space:",Z)),S}function he(L){return typeof HTMLImageElement<"u"&&L instanceof HTMLImageElement?(h.width=L.naturalWidth||L.width,h.height=L.naturalHeight||L.height):typeof VideoFrame<"u"&&L instanceof VideoFrame?(h.width=L.displayWidth,h.height=L.displayHeight):(h.width=L.width,h.height=L.height),h}this.allocateTextureUnit=dt,this.resetTextureUnits=Q,this.getTextureUnits=z,this.setTextureUnits=tt,this.setTexture2D=yt,this.setTexture2DArray=rt,this.setTexture3D=q,this.setTextureCube=_t,this.rebindTextures=Ot,this.setupRenderTarget=Ee,this.updateRenderTargetMipmap=de,this.updateMultisampleRenderTarget=En,this.setupDepthRenderbuffer=oe,this.setupFrameBufferTexture=St,this.useMultisampledRTT=Je,this.isReversedDepthBuffer=function(){return e.buffers.depth.getReversed()}}function Fx(i,t){function e(n,s=Ji){let r,a=Se.getTransfer(s);if(n===qn)return i.UNSIGNED_BYTE;if(n===_l)return i.UNSIGNED_SHORT_4_4_4_4;if(n===xl)return i.UNSIGNED_SHORT_5_5_5_1;if(n===_h)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===xh)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===mh)return i.BYTE;if(n===gh)return i.SHORT;if(n===Rr)return i.UNSIGNED_SHORT;if(n===gl)return i.INT;if(n===bi)return i.UNSIGNED_INT;if(n===wi)return i.FLOAT;if(n===Ti)return i.HALF_FLOAT;if(n===vh)return i.ALPHA;if(n===yh)return i.RGB;if(n===ui)return i.RGBA;if(n===Li)return i.DEPTH_COMPONENT;if(n===bs)return i.DEPTH_STENCIL;if(n===Mh)return i.RED;if(n===vl)return i.RED_INTEGER;if(n===ws)return i.RG;if(n===yl)return i.RG_INTEGER;if(n===Ml)return i.RGBA_INTEGER;if(n===Aa||n===Ea||n===Ca||n===Ra)if(a===Le)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Aa)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Ea)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Ca)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Ra)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Aa)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Ea)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Ca)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Ra)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Sl||n===bl||n===wl||n===Tl)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Sl)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===bl)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===wl)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Tl)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Al||n===El||n===Cl||n===Rl||n===Pl||n===Pa||n===Il)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Al||n===El)return a===Le?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Cl)return a===Le?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===Rl)return r.COMPRESSED_R11_EAC;if(n===Pl)return r.COMPRESSED_SIGNED_R11_EAC;if(n===Pa)return r.COMPRESSED_RG11_EAC;if(n===Il)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Ll||n===Dl||n===Nl||n===Ul||n===Fl||n===Ol||n===Bl||n===kl||n===zl||n===Vl||n===Gl||n===Hl||n===Wl||n===Xl)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Ll)return a===Le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Dl)return a===Le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Nl)return a===Le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Ul)return a===Le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Fl)return a===Le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Ol)return a===Le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Bl)return a===Le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===kl)return a===Le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===zl)return a===Le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Vl)return a===Le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Gl)return a===Le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Hl)return a===Le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Wl)return a===Le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Xl)return a===Le?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===ql||n===Yl||n===Zl)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===ql)return a===Le?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Yl)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Zl)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===$l||n===Jl||n===Ia||n===Kl)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===$l)return r.COMPRESSED_RED_RGTC1_EXT;if(n===Jl)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Ia)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Kl)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Pr?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}var Ox=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Bx=`
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

}`,Yh=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let n=new ca(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=n}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,n=new dn({vertexShader:Ox,fragmentShader:Bx,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new ce(new Ui(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Zh=class extends Di{constructor(t,e){super();let n=this,s=null,r=1,a=null,o="local-floor",c=1,h=null,d=null,_=null,u=null,m=null,M=null,T=typeof XRWebGLBinding<"u",v=new Yh,g={},R=e.getContextAttributes(),D=null,E=null,I=[],P=[],U=new kt,b=null,C=null,O=new In;O.viewport=new qe;let H=new In;H.viewport=new qe;let Y=[O,H],Q=new hl,z=null,tt=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(lt){let gt=I[lt];return gt===void 0&&(gt=new Mr,I[lt]=gt),gt.getTargetRaySpace()},this.getControllerGrip=function(lt){let gt=I[lt];return gt===void 0&&(gt=new Mr,I[lt]=gt),gt.getGripSpace()},this.getHand=function(lt){let gt=I[lt];return gt===void 0&&(gt=new Mr,I[lt]=gt),gt.getHandSpace()};function dt(lt){let gt=P.indexOf(lt.inputSource);if(gt===-1)return;let Bt=I[gt];Bt!==void 0&&(Bt.update(lt.inputSource,lt.frame,h||a),Bt.dispatchEvent({type:lt.type,data:lt.inputSource}))}function ht(){s.removeEventListener("select",dt),s.removeEventListener("selectstart",dt),s.removeEventListener("selectend",dt),s.removeEventListener("squeeze",dt),s.removeEventListener("squeezestart",dt),s.removeEventListener("squeezeend",dt),s.removeEventListener("end",ht),s.removeEventListener("inputsourceschange",yt);for(let lt=0;lt<I.length;lt++){let gt=P[lt];gt!==null&&(P[lt]=null,I[lt].disconnect(gt))}z=null,tt=null,v.reset();for(let lt in g)delete g[lt];if(t.setRenderTarget(D),m=null,u=null,_=null,s=null,E=null,ge.stop(),n.isPresenting=!1,t.setPixelRatio(b),t.setSize(U.width,U.height,!1),C!==null){let lt=C.camera;lt.fov=C.fov,lt.zoom=C.zoom,lt.updateProjectionMatrix(),C=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(lt){r=lt,n.isPresenting===!0&&Qt("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(lt){o=lt,n.isPresenting===!0&&Qt("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return h||a},this.setReferenceSpace=function(lt){h=lt},this.getBaseLayer=function(){return u!==null?u:m},this.getBinding=function(){return _===null&&T&&(_=new XRWebGLBinding(s,e)),_},this.getFrame=function(){return M},this.getSession=function(){return s},this.setSession=async function(lt){if(s=lt,s!==null){if(D=t.getRenderTarget(),s.addEventListener("select",dt),s.addEventListener("selectstart",dt),s.addEventListener("selectend",dt),s.addEventListener("squeeze",dt),s.addEventListener("squeezestart",dt),s.addEventListener("squeezeend",dt),s.addEventListener("end",ht),s.addEventListener("inputsourceschange",yt),R.xrCompatible!==!0&&await e.makeXRCompatible(),b=t.getPixelRatio(),t.getSize(U),T&&"createProjectionLayer"in XRWebGLBinding.prototype){let Bt=null,te=null,St=null;R.depth&&(St=R.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,Bt=R.stencil?bs:Li,te=R.stencil?Pr:bi);let ee={colorFormat:e.RGBA8,depthFormat:St,scaleFactor:r};_=this.getBinding(),u=_.createProjectionLayer(ee),s.updateRenderState({layers:[u]}),t.setPixelRatio(1),t.setSize(u.textureWidth,u.textureHeight,!1),E=new Wn(u.textureWidth,u.textureHeight,{format:ui,type:qn,depthTexture:new hs(u.textureWidth,u.textureHeight,te,void 0,void 0,void 0,void 0,void 0,void 0,Bt),stencilBuffer:R.stencil,colorSpace:t.outputColorSpace,samples:R.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1,storeMultisampledDepthBuffer:u.ignoreDepthValues===!1,storeMultisampledStencilBuffer:u.ignoreDepthValues===!1})}else{let Bt={antialias:R.antialias,alpha:!0,depth:R.depth,stencil:R.stencil,framebufferScaleFactor:r};m=new XRWebGLLayer(s,e,Bt),s.updateRenderState({baseLayer:m}),t.setPixelRatio(1),t.setSize(m.framebufferWidth,m.framebufferHeight,!1),E=new Wn(m.framebufferWidth,m.framebufferHeight,{format:ui,type:qn,colorSpace:t.outputColorSpace,stencilBuffer:R.stencil,resolveDepthBuffer:m.ignoreDepthValues===!1,resolveStencilBuffer:m.ignoreDepthValues===!1,storeMultisampledDepthBuffer:m.ignoreDepthValues===!1,storeMultisampledStencilBuffer:m.ignoreDepthValues===!1})}E.isXRRenderTarget=!0,this.setFoveation(c),h=null,a=await s.requestReferenceSpace(o),ge.setContext(s),ge.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return v.getDepthTexture()};function yt(lt){for(let gt=0;gt<lt.removed.length;gt++){let Bt=lt.removed[gt],te=P.indexOf(Bt);te>=0&&(P[te]=null,I[te].disconnect(Bt))}for(let gt=0;gt<lt.added.length;gt++){let Bt=lt.added[gt],te=P.indexOf(Bt);if(te===-1){for(let ee=0;ee<I.length;ee++)if(ee>=P.length){P.push(Bt),te=ee;break}else if(P[ee]===null){P[ee]=Bt,te=ee;break}if(te===-1)break}let St=I[te];St&&St.connect(Bt)}}let rt=new N,q=new N;function _t(lt,gt,Bt){rt.setFromMatrixPosition(gt.matrixWorld),q.setFromMatrixPosition(Bt.matrixWorld);let te=rt.distanceTo(q),St=gt.projectionMatrix.elements,ee=Bt.projectionMatrix.elements,nn=St[14]/(St[10]-1),oe=St[14]/(St[10]+1),Ot=(St[9]+1)/St[5],Ee=(St[9]-1)/St[5],de=(St[8]-1)/St[0],pe=(ee[8]+1)/ee[0],$e=nn*de,En=nn*pe,Ve=te/(-de+pe),Je=Ve*-de;if(gt.matrixWorld.decompose(lt.position,lt.quaternion,lt.scale),lt.translateX(Je),lt.translateZ(Ve),lt.matrixWorld.compose(lt.position,lt.quaternion,lt.scale),lt.matrixWorldInverse.copy(lt.matrixWorld).invert(),St[10]===-1)lt.projectionMatrix.copy(gt.projectionMatrix),lt.projectionMatrixInverse.copy(gt.projectionMatrixInverse);else{let V=nn+Ve,ln=oe+Ve,he=$e-Je,L=En+(te-Je),S=Ot*oe/ln*V,Z=Ee*oe/ln*V;lt.projectionMatrix.makePerspective(he,L,S,Z,V,ln),lt.projectionMatrixInverse.copy(lt.projectionMatrix).invert()}}function qt(lt,gt){gt===null?lt.matrixWorld.copy(lt.matrix):lt.matrixWorld.multiplyMatrices(gt.matrixWorld,lt.matrix),lt.matrixWorldInverse.copy(lt.matrixWorld).invert()}this.updateCamera=function(lt){if(s===null)return;let gt=lt.near,Bt=lt.far;v.texture!==null&&(v.depthNear>0&&(gt=v.depthNear),v.depthFar>0&&(Bt=v.depthFar)),Q.near=H.near=O.near=gt,Q.far=H.far=O.far=Bt,(z!==Q.near||tt!==Q.far)&&(s.updateRenderState({depthNear:Q.near,depthFar:Q.far}),z=Q.near,tt=Q.far),Q.layers.mask=lt.layers.mask|6,O.layers.mask=Q.layers.mask&-5,H.layers.mask=Q.layers.mask&-3;let te=lt.parent,St=Q.cameras;qt(Q,te);for(let ee=0;ee<St.length;ee++)qt(St[ee],te);St.length===2?_t(Q,O,H):Q.projectionMatrix.copy(O.projectionMatrix),C===null&&lt.isPerspectiveCamera&&(C={camera:lt,fov:lt.fov,zoom:lt.zoom}),Zt(lt,Q,te)};function Zt(lt,gt,Bt){Bt===null?lt.matrix.copy(gt.matrixWorld):(lt.matrix.copy(Bt.matrixWorld),lt.matrix.invert(),lt.matrix.multiply(gt.matrixWorld)),lt.matrix.decompose(lt.position,lt.quaternion,lt.scale),lt.updateMatrixWorld(!0),lt.projectionMatrix.copy(gt.projectionMatrix),lt.projectionMatrixInverse.copy(gt.projectionMatrixInverse),lt.isPerspectiveCamera&&(lt.fov=No*2*Math.atan(1/lt.projectionMatrix.elements[5]),lt.zoom=1)}this.getCamera=function(){return Q},this.getFoveation=function(){if(!(u===null&&m===null))return c},this.setFoveation=function(lt){c=lt,u!==null&&(u.fixedFoveation=lt),m!==null&&m.fixedFoveation!==void 0&&(m.fixedFoveation=lt)},this.hasDepthSensing=function(){return v.texture!==null},this.getDepthSensingMesh=function(){return v.getMesh(Q)},this.getCameraTexture=function(lt){return g[lt]};let De=null;function xe(lt,gt){if(d=gt.getViewerPose(h||a),M=gt,d!==null){let Bt=d.views;m!==null&&(t.setRenderTargetFramebuffer(E,m.framebuffer),t.setRenderTarget(E));let te=!1;Bt.length!==Q.cameras.length&&(Q.cameras.length=0,te=!0);for(let oe=0;oe<Bt.length;oe++){let Ot=Bt[oe],Ee=null;if(m!==null)Ee=m.getViewport(Ot);else{let pe=_.getViewSubImage(u,Ot);Ee=pe.viewport,oe===0&&(t.setRenderTargetTextures(E,pe.colorTexture,pe.depthStencilTexture),t.setRenderTarget(E))}let de=Y[oe];de===void 0&&(de=new In,de.layers.enable(oe),de.viewport=new qe,Y[oe]=de),de.matrix.fromArray(Ot.transform.matrix),de.matrix.decompose(de.position,de.quaternion,de.scale),de.projectionMatrix.fromArray(Ot.projectionMatrix),de.projectionMatrixInverse.copy(de.projectionMatrix).invert(),de.viewport.set(Ee.x,Ee.y,Ee.width,Ee.height),oe===0&&(Q.matrix.copy(de.matrix),Q.matrix.decompose(Q.position,Q.quaternion,Q.scale)),te===!0&&Q.cameras.push(de)}let St=s.enabledFeatures;if(St&&St.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&T){_=n.getBinding();let oe=_.getDepthInformation(Bt[0]);oe&&oe.isValid&&oe.texture&&v.init(oe,s.renderState)}if(St&&St.includes("camera-access")&&T){t.state.unbindTexture(),_=n.getBinding();for(let oe=0;oe<Bt.length;oe++){let Ot=Bt[oe].camera;if(Ot){let Ee=g[Ot];Ee||(Ee=new ca,g[Ot]=Ee);let de=_.getCameraImage(Ot);Ee.sourceTexture=de}}}}for(let Bt=0;Bt<I.length;Bt++){let te=P[Bt],St=I[Bt];te!==null&&St!==void 0&&St.update(te,gt,h||a)}De&&De(lt,gt),gt.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:gt}),M=null}let ge=new af;ge.setAnimationLoop(xe),this.setAnimationLoop=function(lt){De=lt},this.dispose=function(){}}},kx=new Oe,df=new ae;df.set(-1,0,0,0,1,0,0,0,1);function zx(i,t){function e(v,g){v.matrixAutoUpdate===!0&&v.updateMatrix(),g.value.copy(v.matrix)}function n(v,g){g.color.getRGB(v.fogColor.value,Th(i)),g.isFog?(v.fogNear.value=g.near,v.fogFar.value=g.far):g.isFogExp2&&(v.fogDensity.value=g.density)}function s(v,g,R,D,E){g.isNodeMaterial?g.uniformsNeedUpdate=!1:g.isMeshBasicMaterial?r(v,g):g.isMeshLambertMaterial?(r(v,g),g.envMap&&(v.envMapIntensity.value=g.envMapIntensity)):g.isMeshToonMaterial?(r(v,g),_(v,g)):g.isMeshPhongMaterial?(r(v,g),d(v,g),g.envMap&&(v.envMapIntensity.value=g.envMapIntensity)):g.isMeshStandardMaterial?(r(v,g),u(v,g),g.isMeshPhysicalMaterial&&m(v,g,E)):g.isMeshMatcapMaterial?(r(v,g),M(v,g)):g.isMeshDepthMaterial?r(v,g):g.isMeshDistanceMaterial?(r(v,g),T(v,g)):g.isMeshNormalMaterial?r(v,g):g.isLineBasicMaterial?(a(v,g),g.isLineDashedMaterial&&o(v,g)):g.isPointsMaterial?c(v,g,R,D):g.isSpriteMaterial?h(v,g):g.isShadowMaterial?(v.color.value.copy(g.color),v.opacity.value=g.opacity):g.isShaderMaterial&&(g.uniformsNeedUpdate=!1)}function r(v,g){v.opacity.value=g.opacity,g.color&&v.diffuse.value.copy(g.color),g.emissive&&v.emissive.value.copy(g.emissive).multiplyScalar(g.emissiveIntensity),g.map&&(v.map.value=g.map,e(g.map,v.mapTransform)),g.alphaMap&&(v.alphaMap.value=g.alphaMap,e(g.alphaMap,v.alphaMapTransform)),g.bumpMap&&(v.bumpMap.value=g.bumpMap,e(g.bumpMap,v.bumpMapTransform),v.bumpScale.value=g.bumpScale,g.side===Sn&&(v.bumpScale.value*=-1)),g.normalMap&&(v.normalMap.value=g.normalMap,e(g.normalMap,v.normalMapTransform),v.normalScale.value.copy(g.normalScale),g.side===Sn&&v.normalScale.value.negate()),g.displacementMap&&(v.displacementMap.value=g.displacementMap,e(g.displacementMap,v.displacementMapTransform),v.displacementScale.value=g.displacementScale,v.displacementBias.value=g.displacementBias),g.emissiveMap&&(v.emissiveMap.value=g.emissiveMap,e(g.emissiveMap,v.emissiveMapTransform)),g.specularMap&&(v.specularMap.value=g.specularMap,e(g.specularMap,v.specularMapTransform)),g.alphaTest>0&&(v.alphaTest.value=g.alphaTest);let R=t.get(g),D=R.envMap,E=R.envMapRotation;D&&(v.envMap.value=D,v.envMapRotation.value.setFromMatrix4(kx.makeRotationFromEuler(E)).transpose(),D.isCubeTexture&&D.isRenderTargetTexture===!1&&v.envMapRotation.value.premultiply(df),v.reflectivity.value=g.reflectivity,v.ior.value=g.ior,v.refractionRatio.value=g.refractionRatio),g.lightMap&&(v.lightMap.value=g.lightMap,v.lightMapIntensity.value=g.lightMapIntensity,e(g.lightMap,v.lightMapTransform)),g.aoMap&&(v.aoMap.value=g.aoMap,v.aoMapIntensity.value=g.aoMapIntensity,e(g.aoMap,v.aoMapTransform))}function a(v,g){v.diffuse.value.copy(g.color),v.opacity.value=g.opacity,g.map&&(v.map.value=g.map,e(g.map,v.mapTransform))}function o(v,g){v.dashSize.value=g.dashSize,v.totalSize.value=g.dashSize+g.gapSize,v.scale.value=g.scale}function c(v,g,R,D){v.diffuse.value.copy(g.color),v.opacity.value=g.opacity,v.size.value=g.size*R,v.scale.value=D*.5,g.map&&(v.map.value=g.map,e(g.map,v.uvTransform)),g.alphaMap&&(v.alphaMap.value=g.alphaMap,e(g.alphaMap,v.alphaMapTransform)),g.alphaTest>0&&(v.alphaTest.value=g.alphaTest)}function h(v,g){v.diffuse.value.copy(g.color),v.opacity.value=g.opacity,v.rotation.value=g.rotation,g.map&&(v.map.value=g.map,e(g.map,v.mapTransform)),g.alphaMap&&(v.alphaMap.value=g.alphaMap,e(g.alphaMap,v.alphaMapTransform)),g.alphaTest>0&&(v.alphaTest.value=g.alphaTest)}function d(v,g){v.specular.value.copy(g.specular),v.shininess.value=Math.max(g.shininess,1e-4)}function _(v,g){g.gradientMap&&(v.gradientMap.value=g.gradientMap)}function u(v,g){v.metalness.value=g.metalness,g.metalnessMap&&(v.metalnessMap.value=g.metalnessMap,e(g.metalnessMap,v.metalnessMapTransform)),v.roughness.value=g.roughness,g.roughnessMap&&(v.roughnessMap.value=g.roughnessMap,e(g.roughnessMap,v.roughnessMapTransform)),g.envMap&&(v.envMapIntensity.value=g.envMapIntensity)}function m(v,g,R){v.ior.value=g.ior,g.sheen>0&&(v.sheenColor.value.copy(g.sheenColor).multiplyScalar(g.sheen),v.sheenRoughness.value=g.sheenRoughness,g.sheenColorMap&&(v.sheenColorMap.value=g.sheenColorMap,e(g.sheenColorMap,v.sheenColorMapTransform)),g.sheenRoughnessMap&&(v.sheenRoughnessMap.value=g.sheenRoughnessMap,e(g.sheenRoughnessMap,v.sheenRoughnessMapTransform))),g.clearcoat>0&&(v.clearcoat.value=g.clearcoat,v.clearcoatRoughness.value=g.clearcoatRoughness,g.clearcoatMap&&(v.clearcoatMap.value=g.clearcoatMap,e(g.clearcoatMap,v.clearcoatMapTransform)),g.clearcoatRoughnessMap&&(v.clearcoatRoughnessMap.value=g.clearcoatRoughnessMap,e(g.clearcoatRoughnessMap,v.clearcoatRoughnessMapTransform)),g.clearcoatNormalMap&&(v.clearcoatNormalMap.value=g.clearcoatNormalMap,e(g.clearcoatNormalMap,v.clearcoatNormalMapTransform),v.clearcoatNormalScale.value.copy(g.clearcoatNormalScale),g.side===Sn&&v.clearcoatNormalScale.value.negate())),g.dispersion>0&&(v.dispersion.value=g.dispersion),g.retroreflectivity>0&&(v.retroreflectivity.value=g.retroreflectivity),g.iridescence>0&&(v.iridescence.value=g.iridescence,v.iridescenceIOR.value=g.iridescenceIOR,v.iridescenceThicknessMinimum.value=g.iridescenceThicknessRange[0],v.iridescenceThicknessMaximum.value=g.iridescenceThicknessRange[1],g.iridescenceMap&&(v.iridescenceMap.value=g.iridescenceMap,e(g.iridescenceMap,v.iridescenceMapTransform)),g.iridescenceThicknessMap&&(v.iridescenceThicknessMap.value=g.iridescenceThicknessMap,e(g.iridescenceThicknessMap,v.iridescenceThicknessMapTransform))),g.transmission>0&&(v.transmission.value=g.transmission,v.transmissionSamplerMap.value=R.texture,v.transmissionSamplerSize.value.set(R.width,R.height),g.transmissionMap&&(v.transmissionMap.value=g.transmissionMap,e(g.transmissionMap,v.transmissionMapTransform)),v.thickness.value=g.thickness,g.thicknessMap&&(v.thicknessMap.value=g.thicknessMap,e(g.thicknessMap,v.thicknessMapTransform)),v.attenuationDistance.value=g.attenuationDistance,v.attenuationColor.value.copy(g.attenuationColor)),g.anisotropy>0&&(v.anisotropyVector.value.set(g.anisotropy*Math.cos(g.anisotropyRotation),g.anisotropy*Math.sin(g.anisotropyRotation)),g.anisotropyMap&&(v.anisotropyMap.value=g.anisotropyMap,e(g.anisotropyMap,v.anisotropyMapTransform))),v.specularIntensity.value=g.specularIntensity,v.specularColor.value.copy(g.specularColor),g.specularColorMap&&(v.specularColorMap.value=g.specularColorMap,e(g.specularColorMap,v.specularColorMapTransform)),g.specularIntensityMap&&(v.specularIntensityMap.value=g.specularIntensityMap,e(g.specularIntensityMap,v.specularIntensityMapTransform))}function M(v,g){g.matcap&&(v.matcap.value=g.matcap)}function T(v,g){let R=t.get(g).light;v.referencePosition.value.setFromMatrixPosition(R.matrixWorld),v.nearDistance.value=R.shadow.camera.near,v.farDistance.value=R.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function Vx(i,t,e,n){let s={},r={},a=[],o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function c(E,I){let P=I.program;n.uniformBlockBinding(E,P)}function h(E,I){let P=s[E.id];P===void 0&&(v(E),P=d(E),s[E.id]=P,E.addEventListener("dispose",R));let U=I.program;n.updateUBOMapping(E,U);let b=t.render.frame;r[E.id]!==b&&(u(E),r[E.id]=b)}function d(E){let I=_();E.__bindingPointIndex=I;let P=i.createBuffer(),U=E.__size,b=E.usage;return i.bindBuffer(i.UNIFORM_BUFFER,P),i.bufferData(i.UNIFORM_BUFFER,U,b),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,I,P),P}function _(){for(let E=0;E<o;E++)if(a.indexOf(E)===-1)return a.push(E),E;return ne("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(E){let I=s[E.id],P=E.uniforms,U=E.__cache;i.bindBuffer(i.UNIFORM_BUFFER,I);for(let b=0,C=P.length;b<C;b++){let O=P[b];if(Array.isArray(O))for(let H=0,Y=O.length;H<Y;H++)m(O[H],b,H,U);else m(O,b,0,U)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function m(E,I,P,U){if(T(E,I,P,U)===!0){let b=E.__offset,C=E.value;if(Array.isArray(C)){let O=0;for(let H=0;H<C.length;H++){let Y=C[H],Q=g(Y);M(Y,E.__data,O),typeof Y!="number"&&typeof Y!="boolean"&&!Y.isMatrix3&&!ArrayBuffer.isView(Y)&&(O+=Q.storage/Float32Array.BYTES_PER_ELEMENT)}}else M(C,E.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,b,E.__data)}}function M(E,I,P){typeof E=="number"||typeof E=="boolean"?I[0]=E:E.isMatrix3?(I[0]=E.elements[0],I[1]=E.elements[1],I[2]=E.elements[2],I[3]=0,I[4]=E.elements[3],I[5]=E.elements[4],I[6]=E.elements[5],I[7]=0,I[8]=E.elements[6],I[9]=E.elements[7],I[10]=E.elements[8],I[11]=0):ArrayBuffer.isView(E)?I.set(new E.constructor(E.buffer,E.byteOffset,I.length)):E.toArray(I,P)}function T(E,I,P,U){let b=E.value,C=I+"_"+P;if(U[C]===void 0)return typeof b=="number"||typeof b=="boolean"?U[C]=b:ArrayBuffer.isView(b)?U[C]=b.slice():U[C]=b.clone(),!0;{let O=U[C];if(typeof b=="number"||typeof b=="boolean"){if(O!==b)return U[C]=b,!0}else{if(ArrayBuffer.isView(b))return!0;if(O.equals(b)===!1)return O.copy(b),!0}}return!1}function v(E){let I=E.uniforms,P=0,U=16;for(let C=0,O=I.length;C<O;C++){let H=Array.isArray(I[C])?I[C]:[I[C]];for(let Y=0,Q=H.length;Y<Q;Y++){let z=H[Y],tt=Array.isArray(z.value)?z.value:[z.value];for(let dt=0,ht=tt.length;dt<ht;dt++){let yt=tt[dt],rt=g(yt),q=P%U,_t=q%rt.boundary,qt=q+_t;P+=_t,qt!==0&&U-qt<rt.storage&&(P+=U-qt),z.__data=new Float32Array(rt.storage/Float32Array.BYTES_PER_ELEMENT),z.__offset=P,P+=rt.storage}}}let b=P%U;return b>0&&(P+=U-b),E.__size=P,E.__cache={},this}function g(E){let I={boundary:0,storage:0};return typeof E=="number"||typeof E=="boolean"?(I.boundary=4,I.storage=4):E.isVector2?(I.boundary=8,I.storage=8):E.isVector3||E.isColor?(I.boundary=16,I.storage=12):E.isVector4?(I.boundary=16,I.storage=16):E.isMatrix3?(I.boundary=48,I.storage=48):E.isMatrix4?(I.boundary=64,I.storage=64):E.isTexture?Qt("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(E)?(I.boundary=16,I.storage=E.byteLength):Qt("WebGLRenderer: Unsupported uniform value type.",E),I}function R(E){let I=E.target;I.removeEventListener("dispose",R);let P=a.indexOf(I.__bindingPointIndex);a.splice(P,1),i.deleteBuffer(s[I.id]),delete s[I.id],delete r[I.id]}function D(){for(let E in s)i.deleteBuffer(s[E]);a=[],s={},r={}}return{bind:c,update:h,dispose:D}}var Gx=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),Oi=null;function Hx(){return Oi===null&&(Oi=new ko(Gx,16,16,ws,Ti),Oi.name="DFG_LUT",Oi.minFilter=wn,Oi.magFilter=wn,Oi.wrapS=Ii,Oi.wrapT=Ii,Oi.generateMipmaps=!1,Oi.needsUpdate=!0),Oi}var rc=class{constructor(t={}){let{canvas:e=Rd(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:h=!1,powerPreference:d="default",failIfMajorPerformanceCaveat:_=!1,reversedDepthBuffer:u=!1,outputBufferType:m=qn}=t;this.isWebGLRenderer=!0;let M;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");M=n.getContextAttributes().alpha}else M=a;let T=m,v=new Set([Ml,yl,vl]),g=new Set([qn,bi,Rr,Pr,_l,xl]),R=new Uint32Array(4),D=new Int32Array(4),E=new N,I=null,P=null,U=[],b=[],C=null;this.domElement=e,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Si,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let O=this,H=!1,Y=null,Q=null,z=null,tt=null;this._outputColorSpace=mn;let dt=0,ht=0,yt=null,rt=-1,q=null,_t=new qe,qt=new qe,Zt=null,De=new jt(0),xe=0,ge=e.width,lt=e.height,gt=1,Bt=null,te=null,St=new qe(0,0,ge,lt),ee=new qe(0,0,ge,lt),nn=!1,oe=new Sr,Ot=!1,Ee=!1,de=new Oe,pe=new N,$e=new qe,En={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Ve=!1;function Je(){return yt===null?gt:1}let V=n;function ln(w,B){return e.getContext(w,B)}let he,L,S,Z,et,at,Mt,At,st,mt,Et,Yt,Rt,bt,Ht,Kt,re,k,Ct,pt,wt,Lt,vt;try{let w={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:c,preserveDrawingBuffer:h,powerPreference:d,failIfMajorPerformanceCaveat:_};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${"186"}`),e.addEventListener("webglcontextlost",Ne,!1),e.addEventListener("webglcontextrestored",Te,!1),e.addEventListener("webglcontextcreationerror",Zn,!1),V===null){let B="webgl2";if(V=ln(B,w),V===null)throw ln(B)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}$t()}catch(w){throw e.removeEventListener("webglcontextlost",Ne,!1),e.removeEventListener("webglcontextrestored",Te,!1),e.removeEventListener("webglcontextcreationerror",Zn,!1),ne("WebGLRenderer: "+w.message),w}function $t(){he=new Jg(V),he.init(),wt=new Fx(V,he),L=new zg(V,he,t,wt),S=new Nx(V,he),L.reversedDepthBuffer&&u&&S.buffers.depth.setReversed(!0),Q=V.createFramebuffer(),z=V.createFramebuffer(),tt=V.createFramebuffer(),Z=new Qg(V),et=new yx,at=new Ux(V,he,S,et,L,wt,Z),Mt=new $g(O),At=new em(V),Lt=new Bg(V,At),st=new Kg(V,At,Z,Lt),mt=new e_(V,st,At,Lt,Z),k=new t_(V,L,at),Ht=new Vg(et),Et=new vx(O,Mt,he,L,Lt,Ht),Yt=new zx(O,et),Rt=new Sx,bt=new Cx(he),re=new Og(O,Mt,S,mt,M,c),Kt=new Dx(O,mt,L),vt=new Vx(V,Z,L,S),Ct=new kg(V,he,Z),pt=new jg(V,he,Z),Z.programs=Et.programs,O.capabilities=L,O.extensions=he,O.properties=et,O.renderLists=Rt,O.shadowMap=Kt,O.state=S,O.info=Z}T!==qn&&(C=new i_(T,e.width,e.height,o,s,r));let Wt=new Zh(O,V);this.xr=Wt,this.getContext=function(){return V},this.getContextAttributes=function(){return V.getContextAttributes()},this.forceContextLoss=function(){let w=he.get("WEBGL_lose_context");w&&w.loseContext()},this.forceContextRestore=function(){let w=he.get("WEBGL_lose_context");w&&w.restoreContext()},this.getPixelRatio=function(){return gt},this.setPixelRatio=function(w){w!==void 0&&(gt=w,this.setSize(ge,lt,!1))},this.getSize=function(w){return w.set(ge,lt)},this.setSize=function(w,B,it=!0){if(Wt.isPresenting){Qt("WebGLRenderer: Can't change size while VR device is presenting.");return}ge=w,lt=B,e.width=Math.floor(w*gt),e.height=Math.floor(B*gt),it===!0&&(e.style.width=w+"px",e.style.height=B+"px"),C!==null&&C.setSize(e.width,e.height),this.setViewport(0,0,w,B)},this.getDrawingBufferSize=function(w){return w.set(ge*gt,lt*gt).floor()},this.setDrawingBufferSize=function(w,B,it){ge=w,lt=B,gt=it,e.width=Math.floor(w*it),e.height=Math.floor(B*it),this.setViewport(0,0,w,B)},this.setEffects=function(w){if(T===qn){ne("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(w){for(let B=0;B<w.length;B++)if(w[B].isOutputPass===!0){Qt("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}C.setEffects(w||[])},this.getCurrentViewport=function(w){return w.copy(_t)},this.getViewport=function(w){return w.copy(St)},this.setViewport=function(w,B,it,K){w.isVector4?St.set(w.x,w.y,w.z,w.w):St.set(w,B,it,K),S.viewport(_t.copy(St).multiplyScalar(gt).round())},this.getScissor=function(w){return w.copy(ee)},this.setScissor=function(w,B,it,K){w.isVector4?ee.set(w.x,w.y,w.z,w.w):ee.set(w,B,it,K),S.scissor(qt.copy(ee).multiplyScalar(gt).round())},this.getScissorTest=function(){return nn},this.setScissorTest=function(w){S.setScissorTest(nn=w)},this.setOpaqueSort=function(w){Bt=w},this.setTransparentSort=function(w){te=w},this.getClearColor=function(w){return w.copy(re.getClearColor())},this.setClearColor=function(){re.setClearColor(...arguments)},this.getClearAlpha=function(){return re.getClearAlpha()},this.setClearAlpha=function(){re.setClearAlpha(...arguments)},this.clear=function(w=!0,B=!0,it=!0){let K=0;if(w){let j=!1;if(yt!==null){let It=yt.texture.format;j=v.has(It)}if(j){let It=yt.texture.type,Ft=g.has(It),Pt=re.getClearColor(),zt=re.getClearAlpha(),Xt=Pt.r,ot=Pt.g,ue=Pt.b;Ft?(R[0]=Xt,R[1]=ot,R[2]=ue,R[3]=zt,V.clearBufferuiv(V.COLOR,0,R)):(D[0]=Xt,D[1]=ot,D[2]=ue,D[3]=zt,V.clearBufferiv(V.COLOR,0,D))}else K|=V.COLOR_BUFFER_BIT}B&&(K|=V.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),it&&(K|=V.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),K!==0&&V.clear(K)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(w){w.setRenderer(this),Y=w},this.dispose=function(){e.removeEventListener("webglcontextlost",Ne,!1),e.removeEventListener("webglcontextrestored",Te,!1),e.removeEventListener("webglcontextcreationerror",Zn,!1),re.dispose(),Rt.dispose(),bt.dispose(),et.dispose(),Mt.dispose(),mt.dispose(),Lt.dispose(),vt.dispose(),Et.dispose(),Wt.dispose(),Wt.removeEventListener("sessionstart",Nt),Wt.removeEventListener("sessionend",Fr),Ei.stop()};function Ne(w){w.preventDefault(),na("WebGLRenderer: Context Lost."),H=!0}function Te(){na("WebGLRenderer: Context Restored."),H=!1;let w=Z.autoReset,B=Kt.enabled,it=Kt.autoUpdate,K=Kt.needsUpdate,j=Kt.type;$t(),Z.autoReset=w,Kt.enabled=B,Kt.autoUpdate=it,Kt.needsUpdate=K,Kt.type=j}function Zn(w){ne("WebGLRenderer: A WebGL context could not be created. Reason: ",w.statusMessage)}function si(w){let B=w.target;B.removeEventListener("dispose",si),Ts(B)}function Ts(w){Ur(w),et.remove(w)}function Ur(w){let B=et.get(w).programs;B!==void 0&&(B.forEach(function(it){Et.releaseProgram(it)}),w.isShaderMaterial&&Et.releaseShaderCache(w))}this.renderBufferDirect=function(w,B,it,K,j,It){B===null&&(B=En);let Ft=j.isMesh&&j.matrixWorld.determinantAffine()<0,Pt=cc(w,B,it,K,j);S.setMaterial(K,Ft);let zt=it.index,Xt=1;if(K.wireframe===!0){if(zt=st.getWireframeAttribute(it),zt===void 0)return;Xt=2}let ot=it.drawRange,ue=it.attributes.position,Vt=ot.start*Xt,Ae=(ot.start+ot.count)*Xt;It!==null&&(Vt=Math.max(Vt,It.start*Xt),Ae=Math.min(Ae,(It.start+It.count)*Xt)),zt!==null?(Vt=Math.max(Vt,0),Ae=Math.min(Ae,zt.count)):ue!=null&&(Vt=Math.max(Vt,0),Ae=Math.min(Ae,ue.count));let Ke=Ae-Vt;if(Ke<0||Ke===1/0)return;Lt.setup(j,K,Pt,it,zt);let be,Ce=Ct;if(zt!==null&&(be=At.get(zt),Ce=pt,Ce.setIndex(be)),j.isMesh)K.wireframe===!0?(S.setLineWidth(K.wireframeLinewidth*Je()),Ce.setMode(V.LINES)):Ce.setMode(V.TRIANGLES);else if(j.isLine){let fn=K.linewidth;fn===void 0&&(fn=1),S.setLineWidth(fn*Je()),j.isLineSegments?Ce.setMode(V.LINES):j.isLineLoop?Ce.setMode(V.LINE_LOOP):Ce.setMode(V.LINE_STRIP)}else j.isPoints?Ce.setMode(V.POINTS):j.isSprite&&Ce.setMode(V.TRIANGLES);if(j.isBatchedMesh)if(he.get("WEBGL_multi_draw"))Ce.renderMultiDraw(j._multiDrawStarts,j._multiDrawCounts,j._multiDrawCount);else{let fn=j._multiDrawStarts,Ut=j._multiDrawCounts,vn=j._multiDrawCount,ve=zt?At.get(zt).bytesPerElement:1,Cn=et.get(K).currentProgram.getUniforms();for(let Bn=0;Bn<vn;Bn++)Cn.setValue(V,"_gl_DrawID",Bn),Ce.render(fn[Bn]/ve,Ut[Bn])}else if(j.isInstancedMesh)Ce.renderInstances(Vt,Ke,j.count);else if(it.isInstancedBufferGeometry){let fn=it._maxInstanceCount!==void 0?it._maxInstanceCount:1/0,Ut=Math.min(it.instanceCount,fn);Ce.renderInstances(Vt,Ke,Ut)}else Ce.render(Vt,Ke)};function As(w,B,it,K){Y!==null&&w.isNodeMaterial&&Y.setObject(K,w),Ot===!0&&Ht.setState(w,it,!1),w.transparent===!0&&w.side===Xn&&w.forceSinglePass===!1?(w.side=Sn,w.needsUpdate=!0,Ki(w,B,K),w.side=vs,w.needsUpdate=!0,Ki(w,B,K),w.side=Xn):Ki(w,B,K)}this.compile=function(w,B,it=null){it===null&&(it=w),Y!==null&&Y.renderStart(w,B,it),P=bt.get(it),P.init(B),b.push(P),it.traverseVisible(function(j){j.isLight&&j.layers.test(B.layers)&&(P.pushLight(j),j.castShadow&&P.pushShadow(j))}),w!==it&&w.traverseVisible(function(j){j.isLight&&j.layers.test(B.layers)&&(P.pushLight(j),j.castShadow&&P.pushShadow(j))}),P.setupLights(),Y!==null&&Y.updateLights(P.state.lightsArray),Ee=this.localClippingEnabled,Ot=Ht.init(this.clippingPlanes,Ee),Ot===!0&&Ht.setGlobalState(this.clippingPlanes,B),Y!==null&&Kt.render(P.state.shadowsArray,it,B);let K=new Set;return w.traverse(function(j){if(!(j.isMesh||j.isPoints||j.isLine||j.isSprite))return;let It=j.material;if(It)if(Array.isArray(It))for(let Ft=0;Ft<It.length;Ft++){let Pt=It[Ft];As(Pt,it,B,j),K.add(Pt)}else As(It,it,B,j),K.add(It)}),P=b.pop(),Y!==null&&Y.renderEnd(),K},this.compileAsync=function(w,B,it=null){let K=this.compile(w,B,it);return new Promise(j=>{function It(){if(K.forEach(function(Ft){let zt=et.get(Ft).currentProgram;(zt===void 0||zt.isReady())&&K.delete(Ft)}),K.size===0){j(w);return}setTimeout(It,10)}he.get("KHR_parallel_shader_compile")!==null?It():setTimeout(It,10)})};let Hs=null;function lc(w){Hs&&Hs(w)}function Nt(){Ei.stop()}function Fr(){Ei.start()}let Ei=new af;Ei.setAnimationLoop(lc),typeof self<"u"&&Ei.setContext(self),this.setAnimationLoop=function(w){Hs=w,Wt.setAnimationLoop(w),w===null?Ei.stop():Ei.start()},Wt.addEventListener("sessionstart",Nt),Wt.addEventListener("sessionend",Fr),this.render=function(w,B){if(B!==void 0&&B.isCamera!==!0){ne("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(H===!0)return;Y!==null&&Y.renderStart(w,B);let it=Wt.enabled===!0&&Wt.isPresenting===!0,K=C!==null&&(yt===null||it)&&C.begin(O,yt);if(w.matrixWorldAutoUpdate===!0&&w.updateMatrixWorld(),B.parent===null&&B.matrixWorldAutoUpdate===!0&&B.updateMatrixWorld(),Wt.enabled===!0&&Wt.isPresenting===!0&&(C===null||C.isCompositing()===!1)&&(Wt.cameraAutoUpdate===!0&&Wt.updateCamera(B),B=Wt.getCamera()),w.isScene===!0&&w.onBeforeRender(O,w,B,yt),P=bt.get(w,b.length),P.init(B),P.state.textureUnits=at.getTextureUnits(),b.push(P),de.multiplyMatrices(B.projectionMatrix,B.matrixWorldInverse),oe.setFromProjectionMatrix(de,xi,B.reversedDepth),Ee=this.localClippingEnabled,Ot=Ht.init(this.clippingPlanes,Ee),I=Rt.get(w,U.length),I.init(),U.push(I),Wt.enabled===!0&&Wt.isPresenting===!0){let Ft=O.xr.getDepthSensingMesh();Ft!==null&&Or(Ft,B,-1/0,O.sortObjects)}Or(w,B,0,O.sortObjects),I.finish(),Y!==null&&Y.updateLights(P.state.lightsArray),O.sortObjects===!0&&I.sort(Bt,te),Ve=Wt.enabled===!1||Wt.isPresenting===!1||Wt.hasDepthSensing()===!1,Ve&&re.addToRenderList(I,w),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),Ot===!0&&Ht.beginShadows();let j=P.state.shadowsArray;if(Kt.render(j,w,B),Ot===!0&&Ht.endShadows(),(K&&C.hasRenderPass())===!1){let Ft=I.opaque,Pt=I.transmissive;if(P.setupLights(),B.isArrayCamera){let zt=B.cameras;if(Pt.length>0)for(let Xt=0,ot=zt.length;Xt<ot;Xt++){let ue=zt[Xt];Ba(Ft,Pt,w,ue)}Ve&&re.render(w);for(let Xt=0,ot=zt.length;Xt<ot;Xt++){let ue=zt[Xt];Oa(I,w,ue,ue.viewport)}}else Pt.length>0&&Ba(Ft,Pt,w,B),Ve&&re.render(w),Oa(I,w,B)}yt!==null&&ht===0&&(at.updateMultisampleRenderTarget(yt),at.updateRenderTargetMipmap(yt)),K&&C.end(O),w.isScene===!0&&w.onAfterRender(O,w,B),Lt.resetDefaultState(),rt=-1,q=null,b.pop(),b.length>0?(P=b[b.length-1],at.setTextureUnits(P.state.textureUnits),Ot===!0&&Ht.setGlobalState(O.clippingPlanes,P.state.camera)):P=null,U.pop(),U.length>0?I=U[U.length-1]:I=null,Y!==null&&Y.renderEnd()};function Or(w,B,it,K){if(w.visible===!1)return;if(w.layers.test(B.layers)){if(w.isGroup)it=w.renderOrder;else if(w.isLOD)w.autoUpdate===!0&&w.update(B);else if(w.isLightProbeGrid)P.pushLightProbeGrid(w);else if(w.isLight)P.pushLight(w),w.castShadow&&P.pushShadow(w);else if(w.isSprite){if(!w.frustumCulled||w.intersectsFrustum(oe)){K&&$e.setFromMatrixPosition(w.matrixWorld).applyMatrix4(de);let Ft=mt.update(w),Pt=w.material;Pt.visible&&I.push(w,Ft,Pt,it,$e.z,null,B)}}else if((w.isMesh||w.isLine||w.isPoints)&&(!w.frustumCulled||w.intersectsFrustum(oe))){let Ft=mt.update(w),Pt=w.material;if(K&&(w.boundingSphere!==void 0?(w.boundingSphere===null&&w.computeBoundingSphere(),$e.copy(w.boundingSphere.center)):(Ft.boundingSphere===null&&Ft.computeBoundingSphere(),$e.copy(Ft.boundingSphere.center)),$e.applyMatrix4(w.matrixWorld).applyMatrix4(de)),Array.isArray(Pt)){let zt=Ft.groups;for(let Xt=0,ot=zt.length;Xt<ot;Xt++){let ue=zt[Xt],Vt=Pt[ue.materialIndex];Vt&&Vt.visible&&I.push(w,Ft,Vt,it,$e.z,ue,B)}}else Pt.visible&&I.push(w,Ft,Pt,it,$e.z,null,B)}}let It=w.children;for(let Ft=0,Pt=It.length;Ft<Pt;Ft++)Or(It[Ft],B,it,K)}function Oa(w,B,it,K){let{opaque:j,transmissive:It,transparent:Ft}=w;P.setupLightsView(it),Ot===!0&&Ht.setGlobalState(O.clippingPlanes,it),K&&S.viewport(_t.copy(K)),j.length>0&&xt(j,B,it),It.length>0&&xt(It,B,it),Ft.length>0&&xt(Ft,B,it),S.buffers.depth.setTest(!0),S.buffers.depth.setMask(!0),S.buffers.color.setMask(!0),S.setPolygonOffset(!1)}function Ba(w,B,it,K){if((it.isScene===!0?it.overrideMaterial:null)!==null)return;if(P.state.transmissionRenderTarget[K.id]===void 0){let Vt=he.has("EXT_color_buffer_half_float")||he.has("EXT_color_buffer_float");P.state.transmissionRenderTarget[K.id]=new Wn(1,1,{generateMipmaps:!0,type:Vt?Ti:qn,minFilter:Ss,samples:Math.max(4,L.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:Se.workingColorSpace})}let It=P.state.transmissionRenderTarget[K.id],Ft=K.viewport||_t;It.setSize(Ft.z*O.transmissionResolutionScale,Ft.w*O.transmissionResolutionScale);let Pt=O.getRenderTarget(),zt=O.getActiveCubeFace(),Xt=O.getActiveMipmapLevel();O.setRenderTarget(It),O.getClearColor(De),xe=O.getClearAlpha(),xe<1&&O.setClearColor(16777215,.5),O.clear(),Ve&&re.render(it);let ot=O.toneMapping;O.toneMapping=Si;let ue=K.viewport;if(K.viewport!==void 0&&(K.viewport=void 0),P.setupLightsView(K),Ot===!0&&Ht.setGlobalState(O.clippingPlanes,K),xt(w,it,K),at.updateMultisampleRenderTarget(It),at.updateRenderTargetMipmap(It),he.has("WEBGL_multisampled_render_to_texture")===!1){let Vt=!1;for(let Ae=0,Ke=B.length;Ae<Ke;Ae++){let be=B[Ae],{object:Ce,geometry:fn,material:Ut,group:vn}=be;if(Ut.side===Xn&&Ce.layers.test(K.layers)){let ve=Ut.side;Ut.side=Sn,Ut.needsUpdate=!0,Br(Ce,it,K,fn,Ut,vn),Ut.side=ve,Ut.needsUpdate=!0,Vt=!0}}Vt===!0&&(at.updateMultisampleRenderTarget(It),at.updateRenderTargetMipmap(It))}O.setRenderTarget(Pt,zt,Xt),O.setClearColor(De,xe),ue!==void 0&&(K.viewport=ue),O.toneMapping=ot}function xt(w,B,it){let K=B.isScene===!0?B.overrideMaterial:null;for(let j=0,It=w.length;j<It;j++){let Ft=w[j],{object:Pt,geometry:zt,group:Xt}=Ft,ot=Ft.material;ot.allowOverride===!0&&K!==null&&(ot=K),Pt.layers.test(it.layers)&&Br(Pt,B,it,zt,ot,Xt)}}function Br(w,B,it,K,j,It){Y!==null&&j.isNodeMaterial&&Y.setObject(w,j),w.onBeforeRender(O,B,it,K,j,It),w.modelViewMatrix.multiplyMatrices(it.matrixWorldInverse,w.matrixWorld),w.normalMatrix.getNormalMatrix(w.modelViewMatrix),j.onBeforeRender(O,B,it,K,w,It),j.transparent===!0&&j.side===Xn&&j.forceSinglePass===!1?(j.side=Sn,j.needsUpdate=!0,O.renderBufferDirect(it,B,K,j,w,It),j.side=vs,j.needsUpdate=!0,O.renderBufferDirect(it,B,K,j,w,It),j.side=Xn):O.renderBufferDirect(it,B,K,j,w,It),w.onAfterRender(O,B,it,K,j,It)}function Ki(w,B,it){B.isScene!==!0&&(B=En);let K=et.get(w),j=P.state.lights,It=P.state.shadowsArray,Ft=j.state.version,Pt=Et.getParameters(w,j.state,It,B,it,P.state.lightProbeGridArray),zt=Et.getProgramCacheKey(Pt),Xt=K.programs;K.environment=w.isMeshStandardMaterial||w.isMeshLambertMaterial||w.isMeshPhongMaterial?B.environment:null,K.fog=B.fog;let ot=w.isMeshStandardMaterial||w.isMeshLambertMaterial&&!w.envMap||w.isMeshPhongMaterial&&!w.envMap;K.envMap=Mt.get(w.envMap||K.environment,ot),K.envMapRotation=K.environment!==null&&w.envMap===null?B.environmentRotation:w.envMapRotation,Xt===void 0&&(w.addEventListener("dispose",si),Xt=new Map,K.programs=Xt);let ue=Xt.get(zt);if(ue!==void 0){if(K.currentProgram===ue&&K.lightsStateVersion===Ft)return di(w,Pt),ue}else Pt.uniforms=Et.getUniforms(w),Y!==null&&w.isNodeMaterial&&Y.build(w,it,Pt),w.onBeforeCompile(Pt,O),ue=Et.acquireProgram(Pt,zt),Xt.set(zt,ue),K.uniforms=Pt.uniforms;let Vt=K.uniforms;return(!w.isShaderMaterial&&!w.isRawShaderMaterial||w.clipping===!0)&&(Vt.clippingPlanes=Ht.uniform),di(w,Pt),K.needsLights=Va(w),K.lightsStateVersion=Ft,K.needsLights&&(Vt.ambientLightColor.value=j.state.ambient,Vt.lightProbe.value=j.state.probe,Vt.sunLights.value=j.state.sun,Vt.sunLightShadows.value=j.state.sunShadow,Vt.directionalLights.value=j.state.directional,Vt.directionalLightShadows.value=j.state.directionalShadow,Vt.spotLights.value=j.state.spot,Vt.spotLightShadows.value=j.state.spotShadow,Vt.rectAreaLights.value=j.state.rectArea,Vt.ltc_1.value=j.state.rectAreaLTC1,Vt.ltc_2.value=j.state.rectAreaLTC2,Vt.pointLights.value=j.state.point,Vt.pointLightShadows.value=j.state.pointShadow,Vt.hemisphereLights.value=j.state.hemi,Vt.sunShadowMatrix.value=j.state.sunShadowMatrix,Vt.sunShadowCascade.value=j.state.sunShadowCascade,Vt.directionalShadowMatrix.value=j.state.directionalShadowMatrix,Vt.spotLightMatrix.value=j.state.spotLightMatrix,Vt.spotLightMap.value=j.state.spotLightMap,Vt.pointShadowMatrix.value=j.state.pointShadowMatrix),K.lightProbeGrid=P.state.lightProbeGridArray.length>0,K.currentProgram=ue,K.uniformsList=null,ue}function ka(w){if(w.uniformsList===null){let B=w.currentProgram.getUniforms();w.uniformsList=Dr.seqWithValue(B.seq,w.uniforms)}return w.uniformsList}function di(w,B){let it=et.get(w);it.outputColorSpace=B.outputColorSpace,it.batching=B.batching,it.batchingColor=B.batchingColor,it.instancing=B.instancing,it.instancingColor=B.instancingColor,it.instancingMorph=B.instancingMorph,it.skinning=B.skinning,it.morphTargets=B.morphTargets,it.morphNormals=B.morphNormals,it.morphColors=B.morphColors,it.morphTargetsCount=B.morphTargetsCount,it.numClippingPlanes=B.numClippingPlanes,it.numIntersection=B.numClipIntersection,it.vertexAlphas=B.vertexAlphas,it.vertexTangents=B.vertexTangents,it.toneMapping=B.toneMapping}function za(w,B){if(w.length===0)return null;if(w.length===1)return w[0].texture!==null?w[0]:null;E.setFromMatrixPosition(B.matrixWorld);for(let it=0,K=w.length;it<K;it++){let j=w[it];if(j.texture!==null&&j.boundingBox.containsPoint(E))return j}return null}function cc(w,B,it,K,j){B.isScene!==!0&&(B=En),at.resetTextureUnits();let It=B.fog,Ft=K.isMeshStandardMaterial||K.isMeshLambertMaterial||K.isMeshPhongMaterial?B.environment:null,Pt=yt===null?O.outputColorSpace:yt.isXRRenderTarget===!0?yt.texture.colorSpace:Se.workingColorSpace,zt=K.isMeshStandardMaterial||K.isMeshLambertMaterial&&!K.envMap||K.isMeshPhongMaterial&&!K.envMap,Xt=Mt.get(K.envMap||Ft,zt),ot=K.vertexColors===!0&&!!it.attributes.color&&it.attributes.color.itemSize===4,ue=!!it.attributes.tangent&&(!!K.normalMap||K.anisotropy>0),Vt=!!it.morphAttributes.position,Ae=!!it.morphAttributes.normal,Ke=!!it.morphAttributes.color,be=Si;K.toneMapped&&(yt===null||yt.isXRRenderTarget===!0)&&(be=O.toneMapping);let Ce=it.morphAttributes.position||it.morphAttributes.normal||it.morphAttributes.color,fn=Ce!==void 0?Ce.length:0,Ut=et.get(K),vn=P.state.lights;if(Ot===!0&&(Ee===!0||w!==q)){let Ue=w===q&&K.id===rt;Ht.setState(K,w,Ue)}let ve=!1;K.version===Ut.__version?(Ut.needsLights&&Ut.lightsStateVersion!==vn.state.version||Ut.outputColorSpace!==Pt||j.isBatchedMesh&&Ut.batching===!1||!j.isBatchedMesh&&Ut.batching===!0||j.isBatchedMesh&&Ut.batchingColor===!0&&j._colorsTexture===null||j.isBatchedMesh&&Ut.batchingColor===!1&&j._colorsTexture!==null||j.isInstancedMesh&&Ut.instancing===!1||!j.isInstancedMesh&&Ut.instancing===!0||j.isSkinnedMesh&&Ut.skinning===!1||!j.isSkinnedMesh&&Ut.skinning===!0||j.isInstancedMesh&&Ut.instancingColor===!0&&j.instanceColor===null||j.isInstancedMesh&&Ut.instancingColor===!1&&j.instanceColor!==null||j.isInstancedMesh&&Ut.instancingMorph===!0&&j.morphTexture===null||j.isInstancedMesh&&Ut.instancingMorph===!1&&j.morphTexture!==null||Ut.envMap!==Xt||K.fog===!0&&Ut.fog!==It||Ut.numClippingPlanes!==void 0&&(Ut.numClippingPlanes!==Ht.numPlanes||Ut.numIntersection!==Ht.numIntersection)||Ut.vertexAlphas!==ot||Ut.vertexTangents!==ue||Ut.morphTargets!==Vt||Ut.morphNormals!==Ae||Ut.morphColors!==Ke||Ut.toneMapping!==be||Ut.morphTargetsCount!==fn||!!Ut.lightProbeGrid!=P.state.lightProbeGridArray.length>0)&&(ve=!0):(ve=!0,Ut.__version=K.version);let Cn=Ut.currentProgram;ve===!0&&(Cn=Ki(K,B,j),Y&&K.isNodeMaterial&&Y.onUpdateProgram(K,Cn,Ut));let Bn=!1,$n=!1,ki=!1,ut=Cn.getUniforms(),Xe=Ut.uniforms;if(S.useProgram(Cn.program)&&(Bn=!0,$n=!0,ki=!0),K.id!==rt&&(rt=K.id,$n=!0),Ut.needsLights){let Ue=za(P.state.lightProbeGridArray,j);Ut.lightProbeGrid!==Ue&&(Ut.lightProbeGrid=Ue,$n=!0)}if(Bn||q!==w){S.buffers.depth.getReversed()&&w.reversedDepth!==!0&&(w._reversedDepth=!0,w.updateProjectionMatrix()),ut.setValue(V,"projectionMatrix",w.projectionMatrix),ut.setValue(V,"viewMatrix",w.matrixWorldInverse);let bn=ut.map.cameraPosition;bn!==void 0&&bn.setValue(V,pe.setFromMatrixPosition(w.matrixWorld)),L.logarithmicDepthBuffer&&ut.setValue(V,"logDepthBufFC",2/(Math.log(w.far+1)/Math.LN2)),(K.isMeshPhongMaterial||K.isMeshToonMaterial||K.isMeshLambertMaterial||K.isMeshBasicMaterial||K.isMeshStandardMaterial||K.isShaderMaterial)&&ut.setValue(V,"isOrthographic",w.isOrthographicCamera===!0),q!==w&&(q=w,$n=!0,ki=!0)}if(Ut.needsLights&&(vn.state.sunShadowMap.length>0&&ut.setValue(V,"sunShadowMap",vn.state.sunShadowMap,at),vn.state.directionalShadowMap.length>0&&ut.setValue(V,"directionalShadowMap",vn.state.directionalShadowMap,at),vn.state.spotShadowMap.length>0&&ut.setValue(V,"spotShadowMap",vn.state.spotShadowMap,at),vn.state.pointShadowMap.length>0&&ut.setValue(V,"pointShadowMap",vn.state.pointShadowMap,at)),j.isSkinnedMesh){ut.setOptional(V,j,"bindMatrix"),ut.setOptional(V,j,"bindMatrixInverse");let Ue=j.skeleton;Ue&&(Ue.boneTexture===null&&Ue.computeBoneTexture(),ut.setValue(V,"boneTexture",Ue.boneTexture,at))}j.isBatchedMesh&&(ut.setOptional(V,j,"batchingTexture"),ut.setValue(V,"batchingTexture",j._matricesTexture,at),ut.setOptional(V,j,"batchingIdTexture"),ut.setValue(V,"batchingIdTexture",j._indirectTexture,at),ut.setOptional(V,j,"batchingColorTexture"),j._colorsTexture!==null&&ut.setValue(V,"batchingColorTexture",j._colorsTexture,at));let ri=it.morphAttributes;if((ri.position!==void 0||ri.normal!==void 0||ri.color!==void 0)&&k.update(j,it,Cn),($n||Ut.receiveShadow!==j.receiveShadow)&&(Ut.receiveShadow=j.receiveShadow,ut.setValue(V,"receiveShadow",j.receiveShadow)),(K.isMeshStandardMaterial||K.isMeshLambertMaterial||K.isMeshPhongMaterial)&&K.envMap===null&&B.environment!==null&&(Xe.envMapIntensity.value=B.environmentIntensity),Xe.dfgLUT!==void 0&&(Xe.dfgLUT.value=Hx()),$n){if(ut.setValue(V,"toneMappingExposure",O.toneMappingExposure),Ut.needsLights&&hc(Xe,ki),It&&K.fog===!0&&Yt.refreshFogUniforms(Xe,It),Yt.refreshMaterialUniforms(Xe,K,gt,lt,P.state.transmissionRenderTarget[w.id]),Ut.needsLights&&Ut.lightProbeGrid){let Ue=Ut.lightProbeGrid;Xe.probesSH.value=Ue.texture,Xe.probesMin.value.copy(Ue.boundingBox.min),Xe.probesMax.value.copy(Ue.boundingBox.max),Xe.probesResolution.value.copy(Ue.resolution)}Dr.upload(V,ka(Ut),Xe,at)}if(K.isShaderMaterial&&K.uniformsNeedUpdate===!0&&(Dr.upload(V,ka(Ut),Xe,at),K.uniformsNeedUpdate=!1),K.isSpriteMaterial&&ut.setValue(V,"center",j.center),ut.setValue(V,"modelViewMatrix",j.modelViewMatrix),ut.setValue(V,"normalMatrix",j.normalMatrix),ut.setValue(V,"modelMatrix",j.matrixWorld),K.uniformsGroups!==void 0){let Ue=K.uniformsGroups;for(let bn=0,zi=Ue.length;bn<zi;bn++){let ji=Ue[bn];vt.update(ji,Cn),vt.bind(ji,Cn)}}return Cn}function hc(w,B){w.ambientLightColor.needsUpdate=B,w.lightProbe.needsUpdate=B,w.sunLights.needsUpdate=B,w.sunLightShadows.needsUpdate=B,w.directionalLights.needsUpdate=B,w.directionalLightShadows.needsUpdate=B,w.pointLights.needsUpdate=B,w.pointLightShadows.needsUpdate=B,w.spotLights.needsUpdate=B,w.spotLightShadows.needsUpdate=B,w.rectAreaLights.needsUpdate=B,w.hemisphereLights.needsUpdate=B}function Va(w){return w.isMeshLambertMaterial||w.isMeshToonMaterial||w.isMeshPhongMaterial||w.isMeshStandardMaterial||w.isShadowMaterial||w.isShaderMaterial&&w.lights===!0}this.getActiveCubeFace=function(){return dt},this.getActiveMipmapLevel=function(){return ht},this.getRenderTarget=function(){return yt},this.setRenderTargetTextures=function(w,B,it){let K=et.get(w);K.__autoAllocateDepthBuffer=w.resolveDepthBuffer===!1,K.__autoAllocateDepthBuffer===!1&&(K.__useRenderToTexture=!1),et.get(w.texture).__webglTexture=B,et.get(w.depthTexture).__webglTexture=K.__autoAllocateDepthBuffer?void 0:it,K.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(w,B){let it=et.get(w);it.__webglFramebuffer=B,it.__useDefaultFramebuffer=B===void 0},this.setRenderTarget=function(w,B=0,it=0){yt=w,dt=B,ht=it;let K=null,j=!1,It=!1;if(w){let Pt=et.get(w);if(Pt.__useDefaultFramebuffer!==void 0){S.bindFramebuffer(V.FRAMEBUFFER,Pt.__webglFramebuffer),_t.copy(w.viewport),qt.copy(w.scissor),Zt=w.scissorTest,S.viewport(_t),S.scissor(qt),S.setScissorTest(Zt),rt=-1;return}else if(Pt.__webglFramebuffer===void 0)at.setupRenderTarget(w);else if(Pt.__hasExternalTextures)at.rebindTextures(w,et.get(w.texture).__webglTexture,et.get(w.depthTexture).__webglTexture);else if(w.depthBuffer){let ot=w.depthTexture;if(Pt.__boundDepthTexture!==ot){if(ot!==null&&et.has(ot)&&(w.width!==ot.image.width||w.height!==ot.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");at.setupDepthRenderbuffer(w)}}let zt=w.texture;(zt.isData3DTexture||zt.isDataArrayTexture||zt.isCompressedArrayTexture)&&(It=!0);let Xt=et.get(w).__webglFramebuffer;w.isWebGLCubeRenderTarget?(Array.isArray(Xt[B])?K=Xt[B][it]:K=Xt[B],j=!0):w.samples>0&&at.useMultisampledRTT(w)===!1?K=et.get(w).__webglMultisampledFramebuffer:Array.isArray(Xt)?K=Xt[it]:K=Xt,_t.copy(w.viewport),qt.copy(w.scissor),Zt=w.scissorTest}else _t.copy(St).multiplyScalar(gt).floor(),qt.copy(ee).multiplyScalar(gt).floor(),Zt=nn;if(it!==0&&(K=Q),S.bindFramebuffer(V.FRAMEBUFFER,K)&&S.drawBuffers(w,K),S.viewport(_t),S.scissor(qt),S.setScissorTest(Zt),j){let Pt=et.get(w.texture);V.framebufferTexture2D(V.FRAMEBUFFER,V.COLOR_ATTACHMENT0,V.TEXTURE_CUBE_MAP_POSITIVE_X+B,Pt.__webglTexture,it)}else if(It){let Pt=B;for(let zt=0;zt<w.textures.length;zt++){let Xt=et.get(w.textures[zt]);V.framebufferTextureLayer(V.FRAMEBUFFER,V.COLOR_ATTACHMENT0+zt,Xt.__webglTexture,it,Pt)}}else if(w!==null&&it!==0){let Pt=et.get(w.texture);V.framebufferTexture2D(V.FRAMEBUFFER,V.COLOR_ATTACHMENT0,V.TEXTURE_2D,Pt.__webglTexture,it)}rt=-1};function Es(w){let B=et.get(w);return(B.__readFormat!==w.format||B.__readType!==w.type)&&(B.__readFormat=w.format,B.__readType=w.type,B.__formatReadable=L.textureFormatReadable(w.format),B.__typeReadable=L.textureTypeReadable(w.type)),B}this.readRenderTargetPixels=function(w,B,it,K,j,It,Ft,Pt=0){if(!(w&&w.isWebGLRenderTarget)){ne("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let zt=et.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&Ft!==void 0&&(zt=zt[Ft]),zt){S.bindFramebuffer(V.FRAMEBUFFER,zt);try{let Xt=w.textures[Pt],ot=Xt.format,ue=Xt.type;w.textures.length>1&&V.readBuffer(V.COLOR_ATTACHMENT0+Pt);let Vt=Es(Xt);if(Vt.__formatReadable===!1){ne("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Vt.__typeReadable===!1){ne("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}B>=0&&B<=w.width-K&&it>=0&&it<=w.height-j&&V.readPixels(B,it,K,j,wt.convert(ot),wt.convert(ue),It)}finally{let Xt=yt!==null?et.get(yt).__webglFramebuffer:null;S.bindFramebuffer(V.FRAMEBUFFER,Xt)}}},this.readRenderTargetPixelsAsync=async function(w,B,it,K,j,It,Ft,Pt=0){if(!(w&&w.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let zt=et.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&Ft!==void 0&&(zt=zt[Ft]),zt)if(B>=0&&B<=w.width-K&&it>=0&&it<=w.height-j){S.bindFramebuffer(V.FRAMEBUFFER,zt);let Xt=w.textures[Pt],ot=Xt.format,ue=Xt.type;w.textures.length>1&&V.readBuffer(V.COLOR_ATTACHMENT0+Pt);let Vt=Es(Xt);if(Vt.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Vt.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Ae=V.createBuffer();V.bindBuffer(V.PIXEL_PACK_BUFFER,Ae),V.bufferData(V.PIXEL_PACK_BUFFER,It.byteLength,V.STREAM_READ),V.readPixels(B,it,K,j,wt.convert(ot),wt.convert(ue),0),V.bindBuffer(V.PIXEL_PACK_BUFFER,null);let Ke=yt!==null?et.get(yt).__webglFramebuffer:null;S.bindFramebuffer(V.FRAMEBUFFER,Ke);let be=V.fenceSync(V.SYNC_GPU_COMMANDS_COMPLETE,0);return V.flush(),await Id(V,be,4),V.bindBuffer(V.PIXEL_PACK_BUFFER,Ae),V.getBufferSubData(V.PIXEL_PACK_BUFFER,0,It),V.bindBuffer(V.PIXEL_PACK_BUFFER,null),V.deleteBuffer(Ae),V.deleteSync(be),It}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(w,B=null,it=0){let K=Math.pow(2,-it),j=Math.floor(w.image.width*K),It=Math.floor(w.image.height*K),Ft=B!==null?B.x:0,Pt=B!==null?B.y:0;at.setTexture2D(w,0),V.copyTexSubImage2D(V.TEXTURE_2D,it,0,0,Ft,Pt,j,It),S.unbindTexture()},this.copyTextureToTexture=function(w,B,it=null,K=null,j=0,It=0){let Ft,Pt,zt,Xt,ot,ue,Vt,Ae,Ke,be=w.isCompressedTexture?w.mipmaps[It]:w.image;if(it!==null)Ft=it.max.x-it.min.x,Pt=it.max.y-it.min.y,zt=it.isBox3?it.max.z-it.min.z:1,Xt=it.min.x,ot=it.min.y,ue=it.isBox3?it.min.z:0;else{let Xe=Math.pow(2,-j);Ft=Math.floor(be.width*Xe),Pt=Math.floor(be.height*Xe),w.isDataArrayTexture?zt=be.depth:w.isData3DTexture?zt=Math.floor(be.depth*Xe):zt=1,Xt=0,ot=0,ue=0}K!==null?(Vt=K.x,Ae=K.y,Ke=K.z):(Vt=0,Ae=0,Ke=0);let Ce=wt.convert(B.format),fn=wt.convert(B.type),Ut;B.isData3DTexture?(at.setTexture3D(B,0),Ut=V.TEXTURE_3D):B.isDataArrayTexture||B.isCompressedArrayTexture?(at.setTexture2DArray(B,0),Ut=V.TEXTURE_2D_ARRAY):(at.setTexture2D(B,0),Ut=V.TEXTURE_2D),S.activeTexture(V.TEXTURE0),S.pixelStorei(V.UNPACK_FLIP_Y_WEBGL,B.flipY),S.pixelStorei(V.UNPACK_PREMULTIPLY_ALPHA_WEBGL,B.premultiplyAlpha),S.pixelStorei(V.UNPACK_ALIGNMENT,B.unpackAlignment);let vn=S.getParameter(V.UNPACK_ROW_LENGTH),ve=S.getParameter(V.UNPACK_IMAGE_HEIGHT),Cn=S.getParameter(V.UNPACK_SKIP_PIXELS),Bn=S.getParameter(V.UNPACK_SKIP_ROWS),$n=S.getParameter(V.UNPACK_SKIP_IMAGES);S.pixelStorei(V.UNPACK_ROW_LENGTH,be.width),S.pixelStorei(V.UNPACK_IMAGE_HEIGHT,be.height),S.pixelStorei(V.UNPACK_SKIP_PIXELS,Xt),S.pixelStorei(V.UNPACK_SKIP_ROWS,ot),S.pixelStorei(V.UNPACK_SKIP_IMAGES,ue);let ki=w.isDataArrayTexture||w.isData3DTexture,ut=B.isDataArrayTexture||B.isData3DTexture;if(w.isDepthTexture){let Xe=et.get(w),ri=et.get(B),Ue=et.get(Xe.__renderTarget),bn=et.get(ri.__renderTarget);S.bindFramebuffer(V.READ_FRAMEBUFFER,Ue.__webglFramebuffer),S.bindFramebuffer(V.DRAW_FRAMEBUFFER,bn.__webglFramebuffer);for(let zi=0;zi<zt;zi++)ki&&(V.framebufferTextureLayer(V.READ_FRAMEBUFFER,V.COLOR_ATTACHMENT0,et.get(w).__webglTexture,j,ue+zi),V.framebufferTextureLayer(V.DRAW_FRAMEBUFFER,V.COLOR_ATTACHMENT0,et.get(B).__webglTexture,It,Ke+zi)),V.blitFramebuffer(Xt,ot,Ft,Pt,Vt,Ae,Ft,Pt,V.DEPTH_BUFFER_BIT,V.NEAREST);S.bindFramebuffer(V.READ_FRAMEBUFFER,null),S.bindFramebuffer(V.DRAW_FRAMEBUFFER,null)}else if(j!==0||w.isRenderTargetTexture||et.has(w)){let Xe=et.get(w),ri=et.get(B);S.bindFramebuffer(V.READ_FRAMEBUFFER,z),S.bindFramebuffer(V.DRAW_FRAMEBUFFER,tt);for(let Ue=0;Ue<zt;Ue++)ki?V.framebufferTextureLayer(V.READ_FRAMEBUFFER,V.COLOR_ATTACHMENT0,Xe.__webglTexture,j,ue+Ue):V.framebufferTexture2D(V.READ_FRAMEBUFFER,V.COLOR_ATTACHMENT0,V.TEXTURE_2D,Xe.__webglTexture,j),ut?V.framebufferTextureLayer(V.DRAW_FRAMEBUFFER,V.COLOR_ATTACHMENT0,ri.__webglTexture,It,Ke+Ue):V.framebufferTexture2D(V.DRAW_FRAMEBUFFER,V.COLOR_ATTACHMENT0,V.TEXTURE_2D,ri.__webglTexture,It),j!==0?V.blitFramebuffer(Xt,ot,Ft,Pt,Vt,Ae,Ft,Pt,V.COLOR_BUFFER_BIT,V.NEAREST):ut?V.copyTexSubImage3D(Ut,It,Vt,Ae,Ke+Ue,Xt,ot,Ft,Pt):V.copyTexSubImage2D(Ut,It,Vt,Ae,Xt,ot,Ft,Pt);S.bindFramebuffer(V.READ_FRAMEBUFFER,null),S.bindFramebuffer(V.DRAW_FRAMEBUFFER,null)}else ut?w.isDataTexture||w.isData3DTexture?V.texSubImage3D(Ut,It,Vt,Ae,Ke,Ft,Pt,zt,Ce,fn,be.data):B.isCompressedArrayTexture?V.compressedTexSubImage3D(Ut,It,Vt,Ae,Ke,Ft,Pt,zt,Ce,be.data):V.texSubImage3D(Ut,It,Vt,Ae,Ke,Ft,Pt,zt,Ce,fn,be):w.isDataTexture?V.texSubImage2D(V.TEXTURE_2D,It,Vt,Ae,Ft,Pt,Ce,fn,be.data):w.isCompressedTexture?V.compressedTexSubImage2D(V.TEXTURE_2D,It,Vt,Ae,be.width,be.height,Ce,be.data):V.texSubImage2D(V.TEXTURE_2D,It,Vt,Ae,Ft,Pt,Ce,fn,be);S.pixelStorei(V.UNPACK_ROW_LENGTH,vn),S.pixelStorei(V.UNPACK_IMAGE_HEIGHT,ve),S.pixelStorei(V.UNPACK_SKIP_PIXELS,Cn),S.pixelStorei(V.UNPACK_SKIP_ROWS,Bn),S.pixelStorei(V.UNPACK_SKIP_IMAGES,$n),It===0&&B.generateMipmaps&&V.generateMipmap(Ut),S.unbindTexture()},this.initRenderTarget=function(w){et.get(w).__webglFramebuffer===void 0&&at.setupRenderTarget(w)},this.initTexture=function(w){w.isCubeTexture?at.setTextureCube(w,0):w.isData3DTexture?at.setTexture3D(w,0):w.isDataArrayTexture||w.isCompressedArrayTexture?at.setTexture2DArray(w,0):at.setTexture2D(w,0),S.unbindTexture()},this.resetState=function(){dt=0,ht=0,yt=null,S.reset(),Lt.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return xi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=Se._getDrawingBufferColorSpace(t),e.unpackColorSpace=Se._getUnpackColorSpace()}};var ff={idle:0,listening:1,thinking:2,speaking:3,working:4};var pf=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,mf=`
precision highp float;
varying vec2 vUv;
uniform float uTime;
uniform float uEnergy;
uniform float uPulse;
uniform float uState;
uniform float uAspect;
uniform float uOpacity;
uniform vec3 uA;
uniform vec3 uB;
uniform vec3 uC;

float hash(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453123); }
float noise(vec2 p) {
  vec2 i = floor(p), f = fract(p);
  f = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2(1.0, 0.0)), f.x),
             mix(hash(i + vec2(0.0, 1.0)), hash(i + vec2(1.0, 1.0)), f.x), f.y);
}
float fbm(vec2 p) {
  float v = 0.0, a = 0.55;
  for (int i = 0; i < 4; i++) { v += a * noise(p); p = p * 2.03 + 11.7; a *= 0.5; }
  return v;
}

void main() {
  vec2 uv = vUv - 0.5;
  uv.x *= uAspect;
  float t = uTime;
  float listen  = step(0.5, uState) * (1.0 - step(1.5, uState));
  float think   = step(1.5, uState) * (1.0 - step(2.5, uState));
  float speak   = step(2.5, uState) * (1.0 - step(3.5, uState));
  float work    = step(3.5, uState);
  float r = length(uv);
  float ang = atan(uv.y, uv.x);
  float mic = uEnergy * (0.45 + listen * 0.75 + speak * 0.95);

  // Where the noise is sampled: a slow drift, a swirl while it thinks, a
  // sideways stream while it works. Everything else stays where it was.
  vec2 q = uv * 12.0 + vec2(cos(t * 0.11), sin(t * 0.13)) * 0.8;
  q += think * vec2(cos(t * 0.55 + ang), sin(t * 0.55 + ang)) * 1.6;
  q.y += work * t * 1.4;

  float warp = fbm(q * 0.3 + t * 0.06);
  float w = fbm(q + warp * 1.1);
  float fine = fbm(q * 2.1 - t * 0.18 + warp);
  // Filaments, not a wash: a narrow band of the noise, lit up.
  float veins = smoothstep(0.50, 0.70, w);
  float thread = smoothstep(0.55, 0.78, fine) * veins;
  float glow = pow(max(0.0, 1.0 - r * 0.98), 1.5);
  float breathe = 0.9 + 0.1 * sin(t * (1.1 + listen * 0.7));
  float pulse = 1.0 + uPulse * 0.9;

  vec3 col = mix(uA, uB, smoothstep(0.30, 0.85, w));
  col = mix(col, uC, smoothstep(0.72, 0.98, w) * (0.55 + 0.35 * sin(ang * 2.0 + t * 0.4)));
  // A scan crossing the field is what "thinking" looks like from the outside.
  float scan = 1.0 - smoothstep(0.0, 0.05, abs(fract(uv.y * 0.9 - t * 0.16) - 0.5));
  col += uC * (thread * 1.0 + scan * think * 0.4 + veins * 0.2);
  col *= breathe * pulse * (0.85 + 0.55 * mic);
  // Fine grain: keeps the gradients from banding on a cheap panel.
  col += (hash(vUv * 917.0) - 0.5) * 0.02;

  // A soft shoulder instead of a hard clip: the peaks glow without turning
  // into flat white, so the filaments stay readable.
  col = col / (1.0 + col);
  float alpha = glow * (0.16 + veins * 0.55 + thread * 0.5 + mic * 0.35) * uOpacity;
  gl_FragColor = vec4(col, clamp(alpha, 0.0, 0.95));
}`;var ze='"Sora", "Manrope", system-ui, sans-serif',an='"Manrope", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',Be="#F4F6FA",en="#A7B0C0",Tn="#5EEAD4",Ua="#FBBF24",Wx={listening:"Listening",thinking:"Thinking"},$h=1;async function Xx(){if(typeof FontFace>"u"||!document.fonts)return;let i=[new FontFace("Sora","url(../fonts/sora.woff2)",{weight:"300 800"}),new FontFace("Manrope","url(../fonts/manrope.woff2)",{weight:"400 700"})],t=Promise.all(i.map(async e=>{await e.load(),document.fonts.add(e)}));await Promise.race([t,new Promise(e=>setTimeout(e,2500))]).catch(()=>{})}var xf=`
float hash3(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise3(vec3 x) {
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash3(i), hash3(i + vec3(1.0, 0.0, 0.0)), f.x), mix(hash3(i + vec3(0.0, 1.0, 0.0)), hash3(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
             mix(mix(hash3(i + vec3(0.0, 0.0, 1.0)), hash3(i + vec3(1.0, 0.0, 1.0)), f.x), mix(hash3(i + vec3(0.0, 1.0, 1.0)), hash3(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);
}`,qx=`
uniform float uTime; uniform float uEnergy;
varying vec3 vN; varying vec3 vV; varying vec3 vP;
${xf}
void main() {
  vec3 p = position;
  float d = noise3(p * 22.0 + vec3(0.0, uTime * 0.9, uTime * 0.6));
  p += normal * (d - 0.5) * (0.004 + uEnergy * 0.016);
  vP = p * 11.0;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`,Yx=`
uniform float uTime; uniform float uEnergy; uniform float uThink;
uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform vec3 uGlow;
varying vec3 vN; varying vec3 vV; varying vec3 vP;
${xf}
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
}`;function Ze(i,t,e=2400){let n=document.createElement("canvas");n.width=Math.max(8,Math.round(i*e)),n.height=Math.max(8,Math.round(t*e));let s=n.getContext("2d"),r=new Os(n);r.colorSpace=mn,r.anisotropy=$h;let a=new rn({map:r,transparent:!0,depthWrite:!1}),o=new ce(new Ui(i,t),a);return{canvas:n,ctx:s,tex:r,mesh:o,w:n.width,h:n.height,update(){r.needsUpdate=!0}}}function Yn(i,t,e,n,s,r){r=Math.min(r,n/2,s/2),i.beginPath(),i.moveTo(t+r,e),i.arcTo(t+n,e,t+n,e+s,r),i.arcTo(t+n,e+s,t,e+s,r),i.arcTo(t,e+s,t,e,r),i.arcTo(t,e,t+n,e,r),i.closePath()}function Un(i,t,e,n,s={}){i.clearRect(0,0,t,e);let r=3,a=r;Yn(i,a,a,t-a*2,e-a*2,n);let o=i.createLinearGradient(0,0,0,e);if(o.addColorStop(0,s.fill0||"rgba(24, 27, 36, 0.94)"),o.addColorStop(1,s.fill1||"rgba(13, 15, 21, 0.95)"),i.fillStyle=o,i.fill(),i.lineWidth=s.hot?r*1.6:r,i.strokeStyle=s.hot?"rgba(94, 234, 212, 0.9)":"rgba(255, 255, 255, 0.13)",i.stroke(),!s.hot){let c=i.createLinearGradient(a+n,0,t-a-n,0);c.addColorStop(0,"rgba(255,255,255,0)"),c.addColorStop(.5,"rgba(255,255,255,0.34)"),c.addColorStop(1,"rgba(255,255,255,0)"),i.fillStyle=c,i.fillRect(a+n,a-r/2,t-2*(a+n),r)}}function _e(i,t,e,n,s,r,a=500,o="left",c=an,h="0px"){i.font=`${a} ${s}px ${c}`,i.fillStyle=r,i.textAlign=o,i.textBaseline="alphabetic","letterSpacing"in i&&(i.letterSpacing=h),i.fillText(t,e,n),"letterSpacing"in i&&(i.letterSpacing="0px")}function An(i,t,e){if(t=String(t||""),i.measureText(t).width<=e)return t;for(;t&&i.measureText(t+"\u2026").width>e;)t=t.slice(0,-1);return t+"\u2026"}function gf(){let i=document.createElement("canvas");i.width=i.height=128;let t=i.getContext("2d"),e=t.createRadialGradient(64,64,0,64,64,64);e.addColorStop(0,"rgba(255,255,255,0.9)"),e.addColorStop(.35,"rgba(255,255,255,0.32)"),e.addColorStop(1,"rgba(255,255,255,0)"),t.fillStyle=e,t.fillRect(0,0,128,128);let n=new Os(i);return n.colorSpace=mn,n}var Zx={mic(i){i.beginPath(),Yn(i,39,16,22,42,11),i.stroke(),i.beginPath(),i.arc(50,48,22,.12*Math.PI,.88*Math.PI),i.stroke(),i.beginPath(),i.moveTo(50,70),i.lineTo(50,84),i.stroke()},done(i){i.beginPath(),i.moveTo(27,52),i.lineTo(43,68),i.lineTo(74,35),i.stroke()},quiet(i){i.beginPath(),Yn(i,32,32,36,36,7),i.stroke()},end(i){i.beginPath(),i.moveTo(20,60),i.quadraticCurveTo(50,32,80,60),i.lineTo(72,69),i.lineTo(61,61),i.lineTo(61,53),i.quadraticCurveTo(50,48,39,53),i.lineTo(39,61),i.lineTo(28,69),i.closePath(),i.stroke()},eye(i){i.beginPath(),i.moveTo(14,50),i.quadraticCurveTo(50,16,86,50),i.quadraticCurveTo(50,84,14,50),i.stroke(),i.beginPath(),i.arc(50,50,11,0,Math.PI*2),i.stroke()},pc(i){i.beginPath(),Yn(i,16,22,68,44,6),i.stroke(),i.beginPath(),i.moveTo(36,82),i.lineTo(64,82),i.moveTo(50,66),i.lineTo(50,82),i.stroke()},pin(i){i.beginPath(),i.moveTo(50,86),i.lineTo(50,62),i.stroke(),i.beginPath(),i.moveTo(31,62),i.lineTo(69,62),i.lineTo(62,46),i.lineTo(62,20),i.lineTo(38,20),i.lineTo(38,46),i.closePath(),i.stroke()},leave(i){i.beginPath(),i.moveTo(32,32),i.lineTo(68,68),i.moveTo(68,32),i.lineTo(32,68),i.stroke()},think(i){for(let t=0;t<3;t++)i.beginPath(),i.arc(30+t*20,50,4.5,0,Math.PI*2),i.stroke()},photos(i){i.beginPath(),Yn(i,16,24,68,52,8),i.stroke(),i.beginPath(),i.moveTo(23,69),i.lineTo(42,49),i.lineTo(56,62),i.lineTo(65,54),i.lineTo(78,69),i.stroke(),i.beginPath(),i.arc(64,38,5,0,Math.PI*2),i.stroke()},style(i){let t=(e,n,s)=>{i.beginPath(),i.moveTo(e,n-s),i.quadraticCurveTo(e,n,e+s,n),i.quadraticCurveTo(e,n,e,n+s),i.quadraticCurveTo(e,n,e-s,n),i.quadraticCurveTo(e,n,e,n-s),i.stroke()};t(44,56,26),t(74,28,12)},folder(i){i.beginPath(),i.moveTo(14,30),i.lineTo(40,30),i.lineTo(48,38),i.lineTo(86,38),i.lineTo(86,78),i.lineTo(14,78),i.closePath(),i.stroke()},doc(i){i.beginPath(),i.moveTo(28,14),i.lineTo(60,14),i.lineTo(76,30),i.lineTo(76,86),i.lineTo(28,86),i.closePath(),i.stroke(),i.beginPath(),i.moveTo(38,50),i.lineTo(66,50),i.moveTo(38,62),i.lineTo(66,62),i.moveTo(38,74),i.lineTo(56,74),i.stroke()},close(i){i.beginPath(),i.moveTo(34,34),i.lineTo(66,66),i.moveTo(66,34),i.lineTo(34,66),i.stroke()},back(i){i.beginPath(),i.moveTo(58,30),i.lineTo(38,50),i.lineTo(58,70),i.stroke()},next(i){i.beginPath(),i.moveTo(42,30),i.lineTo(62,50),i.lineTo(42,70),i.stroke()},up(i){i.beginPath(),i.moveTo(30,56),i.lineTo(50,36),i.lineTo(70,56),i.moveTo(50,36),i.lineTo(50,74),i.stroke()},search(i){i.beginPath(),i.arc(44,44,20,0,Math.PI*2),i.stroke(),i.beginPath(),i.moveTo(59,59),i.lineTo(76,76),i.stroke()},pause(i){i.beginPath(),i.moveTo(40,32),i.lineTo(40,68),i.moveTo(60,32),i.lineTo(60,68),i.stroke()},holo(i){i.beginPath(),i.moveTo(50,22),i.lineTo(76,36),i.lineTo(76,64),i.lineTo(50,78),i.lineTo(24,64),i.lineTo(24,36),i.closePath(),i.stroke(),i.beginPath(),i.moveTo(24,36),i.lineTo(50,50),i.lineTo(76,36),i.moveTo(50,50),i.lineTo(50,78),i.stroke()}};function _f(i,t){let{ctx:e,w:n,h:s}=i;e.clearRect(0,0,n,s),e.beginPath(),e.arc(n/2,s/2,n/2-4,0,Math.PI*2),e.fillStyle="rgba(20, 23, 31, 0.95)",e.fill(),e.lineWidth=3,e.strokeStyle="rgba(255,255,255,0.18)",e.stroke(),Ai(e,t,n/2,s/2,n*.62,Be,7),i.update()}function Ai(i,t,e,n,s,r=Be,a=6){i.save();let o=s/100;i.translate(e-50*o,n-50*o),i.scale(o,o),i.strokeStyle=r,i.fillStyle=r,i.lineWidth=a,i.lineCap="round",i.lineJoin="round",Zx[t]?.(i),i.restore()}async function nS({mode:i,session:t,api:e,tint:n}){let s=i==="flat",r=i==="immersive-ar",a=e.util;await Xx();let o=new rc({antialias:!0,alpha:!0,powerPreference:"high-performance"});o.setClearColor(0,0),o.outputColorSpace=mn,o.setPixelRatio(s?Math.min(2,window.devicePixelRatio||1):1),$h=Math.max(1,o.capabilities.getMaxAnisotropy?.()||1),o.setSize(window.innerWidth,window.innerHeight);let c=o.domElement;Object.assign(c.style,{position:"fixed",inset:"0",width:"100vw",height:"100vh",zIndex:"2147483000",touchAction:"none",display:s?"block":"none"}),document.body.appendChild(c);let h=new sa,d=new In(70,window.innerWidth/window.innerHeight,.01,100);d.position.set(0,1.6,0),h.add(d);let _=[],u=l=>(_.push(l),l),m=[],M=0,T=(()=>{try{return matchMedia("(prefers-reduced-motion: reduce)").matches}catch{return!1}})(),v=l=>1-Math.pow(1-Math.min(1,Math.max(0,l)),4),g=!1,R={a:new jt,b:new jt,c:new jt},D=null,E=0,I=8246268,P=!1;try{E=Math.max(0,Fa.findIndex(l=>l.name===localStorage.getItem("izuki.vr.theme")))}catch{}function U(l){let p=Fa[l];if(R.a.setRGB(...p.orb[0]),R.b.setRGB(...p.orb[1]),R.c.setRGB(...p.orb[2]),l===0&&n){let y=parseInt(n.slice(1),16),f=new jt((y>>16&255)/255,(y>>8&255)/255,(y&255)/255);R.a.lerp(f,.6),R.b.lerp(f,.35),R.c.lerp(f,.45)}I=p.halo,D&&(D.uniforms.uA.value.copy(R.a),D.uniforms.uB.value.copy(R.b),D.uniforms.uC.value.copy(R.c)),Yt?.set(p);let x=!!p.light&&!!Yt;if(x!==P){P=x;for(let y of lt)y.draw()}}function b(){E=(E+1)%Fa.length,U(E);try{localStorage.setItem("izuki.vr.theme",Fa[E].name)}catch{}return"This is "+Fa[E].name+(r?".":", with its own sky.")+" Say \u201Cchange your look\u201D again for the next one."}let C=new We;C.visible=!1,h.add(C);let O=u(new dn({uniforms:{uTime:{value:0},uEnergy:{value:0},uThink:{value:0},uA:{value:R.a},uB:{value:R.b},uC:{value:R.c},uGlow:{value:new jt(.82,.95,1)}},vertexShader:qx,fragmentShader:Yx,transparent:!0})),H=new ce(u(new Dn(.085,64,48)),O);H.renderOrder=2;let Y=u(new ci({map:u(gf()),color:6220500,transparent:!0,blending:Ye,depthWrite:!1,opacity:.3})),Q=new yi(Y);Q.scale.setScalar(.42),Q.renderOrder=1;let z=u(new rn({color:6220500,transparent:!0,opacity:0,blending:Ye,depthWrite:!1})),tt=new ce(u(new ms(.118,.003,8,120,Math.PI*1.4)),z),dt=u(new rn({color:6220500,transparent:!0,opacity:0,blending:Ye,depthWrite:!1})),ht=new ce(u(new ms(.1,.0016,8,160)),dt);ht.visible=!1,C.add(Q,H,tt,ht),D=u(new dn({uniforms:{uTime:{value:0},uEnergy:{value:0},uPulse:{value:0},uState:{value:0},uAspect:{value:1.6},uOpacity:{value:.55},uA:{value:R.a.clone()},uB:{value:R.b.clone()},uC:{value:R.c.clone()}},vertexShader:pf,fragmentShader:mf,transparent:!0,depthWrite:!1,blending:Ye}));let yt=new ce(u(new Ui(.86,.54)),D);yt.position.set(0,.01,-.14),yt.renderOrder=0,C.add(yt);let rt=Ze(.56,.19);rt.mesh.position.set(0,-.2,.01),C.add(rt.mesh),u(rt.tex),u(rt.mesh.material),u(rt.mesh.geometry),m.push(rt.mesh.material);let q={state:"",you:"",reply:"",stage:"",mic:0,energy:0,think:0,hovered:!1,hint:s?"Click the orb to talk. Drag to look around.":"Point at the orb and pull the trigger (or pinch) to talk."};function _t(){let{ctx:l,w:p,h:x}=rt;Un(l,p,x,52);let y=56,f=30,A=Wx[q.state]||q.stage||"";A?(l.beginPath(),l.arc(y+9,f+34,9,0,Math.PI*2),l.fillStyle=Tn,l.fill(),l.font=`600 30px ${ze}`,_e(l,An(l,A,p-y*2-40),y+34,f+45,30,Tn,600,"left",ze,"0.02em"),f+=62):f+=14,q.you&&(l.font=`500 34px ${an}`,_e(l,An(l,q.you,p-y*2),y,f+=40,34,en,500),f+=10);let G=q.reply||(q.you?"":q.hint),F=(X,nt)=>(l.font=`500 ${nt}px ${an}`,l.measureText(X).width),$=q.notice?a.fitLines(q.notice,p-y*2,2,30,26,F):null,W=$?$.lines.length*$.size*1.3+22:0;if(G){let X=x-f-36-W,nt=Math.max(1,Math.floor(X/(32*1.32))),ct=a.fitLines(G,p-y*2,Math.min(nt,5),50,32,F),Tt=ct.size*1.32;f+=6;for(let ft of ct.lines)_e(l,ft,y,f+=Tt,ct.size,q.reply?Be:en,500)}if(De(q.notice||q.reply),$){let X=x-32-($.lines.length-1)*$.size*1.3;for(let nt of $.lines)_e(l,nt,y,X,$.size,q.noticeWarn?Ua:en,500),X+=$.size*1.3}rt.update()}let qt=null,Zt=!1,De=l=>{Zt&&qt&&l&&qt.textContent!==l&&(qt.textContent=l)},xe=0;function ge(l,p=12e3,x=!1){q.notice=String(l||""),q.noticeWarn=!!x,clearTimeout(xe),xe=setTimeout(()=>{q.notice="",_t()},p),_t()}let lt=[];function gt(l,p,x){let y=Ze(.088,.112,2400);u(y.tex),u(y.mesh.material),u(y.mesh.geometry),m.push(y.mesh.material);let f={c:y,icon:l,label:p,hot:!1,on:!1,shown:!0};return f.draw=()=>{let{ctx:A,w:G,h:F}=y;A.clearRect(0,0,G,F);let $=G*.38,W=G/2,X=$+10;A.beginPath(),A.arc(W,X,$,0,Math.PI*2);let nt=A.createLinearGradient(0,X-$,0,X+$);nt.addColorStop(0,f.hot?"rgba(44, 50, 64, 0.97)":"rgba(26, 29, 38, 0.95)"),nt.addColorStop(1,f.hot?"rgba(26, 30, 40, 0.97)":"rgba(14, 16, 22, 0.95)"),A.fillStyle=nt,A.fill(),A.lineWidth=f.hot||f.on?5:3,A.strokeStyle=f.on?Tn:f.hot?"rgba(255,255,255,0.55)":"rgba(255,255,255,0.16)",A.stroke(),Ai(A,f.icon,W,X,$*1.05,f.on?Tn:Be,6.5);let ct=P?{on:"#0F766E",hot:"#11151C",rest:"#2A303B"}:{on:Tn,hot:Be,rest:en};_e(A,f.label,W,F-12,30,f.on?ct.on:f.hot?ct.hot:ct.rest,600,"center",ze,"0.01em"),y.update()},f.set=(A,G)=>{A===f.icon&&G===f.label||(f.icon=A,f.label=G,f.draw())},f.setOn=A=>{!!A!==f.on&&(f.on=!!A,f.draw())},f.draw(),St(y.mesh,{tap:x,hover:A=>{f.hot=A,f.draw(),y.mesh.position.z=A?.026:.02}}),C.add(y.mesh),lt.push(f),f}function Bt(){let l=lt.filter(x=>x.shown),p=l.length>6?.088:.1;l.forEach((x,y)=>{x.c.mesh.visible=!0,x.c.mesh.position.set((y-(l.length-1)/2)*p,-.375,.02)});for(let x of lt)x.shown||(x.c.mesh.visible=!1)}let te=[];function St(l,p){return l.userData.ui=p,te.push(l),l}function ee(l){let p=te.indexOf(l);p>=0&&te.splice(p,1)}let nn=l=>{for(let p=l;p;p=p.parent)if(!p.visible)return!1;return!0},oe=new Sa;oe.far=10;let Ot=new N,Ee=new N,de=new li,pe=0,$e=[],En=u(new Bs(.006,20)),Ve=u(new Ie().setAttribute("position",new se([0,0,0,0,0,-1],3)));function Je(l,p){let x={kind:l,ctrl:p,source:null,hit:null,hover:null,press:null,origin:new N,dir:new N,buttons:[],scrollAt:0};return x.dot=new ce(En,u(new rn({color:16777215,transparent:!0,opacity:.9,depthTest:!1}))),x.dot.renderOrder=999,x.dot.visible=!1,h.add(x.dot),p&&(x.line=new Ni(Ve,u(new ei({color:10482666,transparent:!0,opacity:.5}))),x.line.visible=!1,p.add(x.line)),$e.push(x),x}let V=(l,p=.25,x=16)=>{try{l.source?.gamepad?.hapticActuators?.[0]?.pulse?.(p,x)}catch{}};function ln(l,p=!1){if(!l.hit)return;let x=l.hit.object.userData.ui,y=x.drag?x.drag():null;if(l.press={u:x,obj:l.hit.object,hit:l.hit,drag:y,grabOnly:p,dist:l.hit.distance,start:l.hit.point.clone(),offset:y?y.position.clone().sub(l.hit.point):null,moved:!1,t0:performance.now()},!y&&x.turn&&(l.press.turn=tu(x.turn())),V(l,.35,20),!p)try{x.down?.(l)}catch(f){console.warn("vr down",f)}}let he=new N,L=new N,S=new N;function Z(l,p){let x=l.source?.hand?o.xr.getHand(l.index):null,y=x?.joints?.["index-finger-tip"],f=x?.joints?.["thumb-tip"];return y&&f?(y.getWorldPosition(p),f.getWorldPosition(L),p.add(L).multiplyScalar(.5)):l.ctrl.getWorldPosition(p)}function et(l){if(s||!l.source)return!1;Z(l,he);let p=null,x=1/0;for(let f of te){let A=f.userData.ui;if(!(A.drag||A.grab||A.turn)||!nn(f))continue;let G=f.geometry;G.boundingBox||G.computeBoundingBox(),f.updateWorldMatrix(!0,!1),S.copy(he),f.worldToLocal(S);let F=G.boundingBox,$=f.getWorldScale(L),W=(f===H?.07:.03)/Math.max(.001,$.x),X=Math.max(F.min.x-S.x,0,S.x-F.max.x),nt=Math.max(F.min.y-S.y,0,S.y-F.max.y),ct=Math.max(F.min.z-S.z,0,S.z-F.max.z);if(X>W||nt>W||ct>W+.05/Math.max(.001,$.x))continue;let Tt=Math.hypot(X,nt,ct);Tt<x&&(x=Tt,p={m:f,u:A})}if(!p)return!1;if(!(p.u.drag||p.u.grab)&&p.u.turn)return l.press={u:p.u,obj:p.m,hit:null,drag:null,turn:tu(p.u.turn()),direct:!0,grabOnly:!1,start:he.clone(),moved:!1,t0:performance.now()},V(l,.5,28),!0;let y=(p.u.drag||p.u.grab)();return y?(l.press={u:p.u,obj:p.m,hit:null,drag:y,direct:!0,grabOnly:!1,offset:y.position.clone().sub(he),start:he.clone(),moved:!1,t0:performance.now()},V(l,.5,28),!0):!1}function at(l,p=!0){let x=l.press;if(l.press=null,!!x){if(!x.grabOnly)try{x.u.up?.(performance.now()-x.t0,p&&!x.moved)}catch(y){console.warn("vr up",y)}if(x.moved&&x.turn){J.view.spin=Math.max(-4,Math.min(4,x.turn.vel));return}if(x.moved){x.u.dropped?.();return}if(x.direct){if(!p)return;let y=null,f=x.obj.geometry?.parameters;if(f?.width&&f?.height){Z(l,he);let A=x.obj.worldToLocal(he.clone());y={uv:{x:Math.max(0,Math.min(1,A.x/f.width+.5)),y:Math.max(0,Math.min(1,A.y/f.height+.5))},point:he.clone()}}try{x.u.tap?.(y,l)}catch(A){console.warn("vr tap",A)}return}if(!(x.grabOnly||!p)&&!(!l.hit||l.hit.object!==x.obj))try{x.u.tap?.(l.hit,l)}catch(y){console.warn("vr tap",y)}}}function Mt(l){l.lookAt(Ot.x,l.position.y,Ot.z)}let At=[],st=(l,p,x,y)=>{l.addEventListener(p,x,y),At.push(()=>l.removeEventListener(p,x,y))},mt=null;if(!s){for(let l=0;l<2;l++){let p=o.xr.getController(l);h.add(p);let x=Je("xr",p);x.index=l,st(p,"connected",y=>{x.source=y.data,x.line.visible=!0}),st(p,"disconnected",()=>{x.source=null,x.line.visible=!1,x.dot.visible=!1,x.press=null}),st(p,"selectstart",()=>{x.selected=!1,!et(x)&&(k(x),ln(x))}),st(p,"select",()=>{x.selected=!0}),st(p,"selectend",()=>{k(x),at(x,x.selected),x.selected=!1}),st(p,"squeezestart",()=>{et(x)||(k(x),ln(x,!0))}),st(p,"squeezeend",()=>at(x,!1))}for(let l=0;l<2;l++)h.add(o.xr.getHand(l));if(!r){let l=u(new Dn(.006,8,6)),p=u(new rn({color:13496317,transparent:!0,opacity:.85}));mt={jointGeo:l,jointMat:p}}}let Et=0;if(!s)try{o.xr.enabled=!0;let l=t.enabledFeatures,p=!l||l.includes("local-floor")?"local-floor":"local";p==="local"&&(Et=-1.6),o.xr.setReferenceSpaceType(p);try{o.xr.setFramebufferScaleFactor(1.25)}catch{}await o.xr.setSession(t);try{o.xr.setFoveation(.2)}catch{}let x=[...t.inputSources||[]].filter(y=>!$e.some(f=>f.source===y));if(x.length){let y=new Event("inputsourceschange");Object.assign(y,{session:t,added:x,removed:[]}),t.dispatchEvent(y)}}catch(l){for(let p of At)try{p()}catch{}c.remove(),o.dispose();try{await t.end()}catch{}throw l}let Yt=r?null:$x(h,Et);U(E);let Rt=new kt,bt=s?Je("mouse",null):null,Ht=null,Kt=-.2,re=0;if(s){bt.source={};let l=p=>{Rt.set(p.clientX/window.innerWidth*2-1,-(p.clientY/window.innerHeight)*2+1)};st(c,"pointermove",p=>{l(p),Ht&&(re-=(p.clientX-Ht.x)*.004,Kt-=(p.clientY-Ht.y)*.004,Kt=Math.max(-1.2,Math.min(1.2,Kt)),Ht={x:p.clientX,y:p.clientY})}),st(c,"pointerdown",p=>{l(p),k(bt),bt.hit?ln(bt):Ht={x:p.clientX,y:p.clientY},c.setPointerCapture?.(p.pointerId)}),st(c,"pointerup",p=>{l(p),Ht=null,k(bt),at(bt)}),st(c,"pointercancel",()=>{Ht=null,bt.press=null}),st(c,"wheel",p=>{let x=bt.hit?.object.userData.ui;x?.scroll&&(p.preventDefault(),x.scroll(Math.sign(p.deltaY)*Math.min(5,Math.ceil(Math.abs(p.deltaY)/60))))},{passive:!1}),st(window,"keydown",p=>{p.key==="Escape"?Gr():p.key===" "&&p.target===document.body&&(p.preventDefault(),e.tapOrb())}),st(window,"resize",()=>{d.aspect=window.innerWidth/window.innerHeight,d.updateProjectionMatrix(),o.setSize(window.innerWidth,window.innerHeight)})}function k(l){if(l.kind==="mouse")oe.setFromCamera(Rt,d),l.origin.copy(oe.ray.origin),l.dir.copy(oe.ray.direction);else{if(!l.source)return!1;l.ctrl.getWorldPosition(l.origin),l.ctrl.getWorldQuaternion(de),l.dir.set(0,0,-1).applyQuaternion(de)}oe.set(l.origin,l.dir);let p=oe.intersectObjects(te,!1);return l.hit=p.find(x=>nn(x.object))||null,!0}function Ct(l){l.holdAt=performance.now(),l.holdListening=q.state==="listening",l.holdListening||e.tapOrb()}function pt(l,p){let x=l.holdListening;l.holdListening=!1,(x||p>600)&&e.tapOrb()}St(H,{tap:()=>e.tapOrb(),drag:()=>C,dropped:()=>{C.userData.placed=!0},hover:l=>{q.hovered=l}}),St(rt.mesh,{drag:()=>C,dropped:()=>{C.userData.placed=!0}});let wt=gt("mic","Talk",null);Object.assign(wt.c.mesh.userData.ui,{tap:null,down:()=>Ct(wt),up:(l,p)=>{p&&pt(wt,l)}});let Lt=gt("pause","Pause",()=>e.hangUp()),vt=gt("eye","Look",()=>{Oa(),e.look()}),$t=()=>{xt.open?Es():Va().then(l=>{l&&e.speak(l)})},Wt=()=>{let l=e.lastReply();l?ru(l):e.speak("There's nothing to pin yet. Ask me something first.")},Ne=()=>{if(ot.open)return ve();if(!e.pc.current())return ge("Your photos are on your PC: pair this headset with it once (leave the room, Remote, Pair).",12e3,!0);vn("Pictures").then(l=>{l&&ge(l,12e3,!0)})},Te=()=>ge(b(),5e3),Zn=gt("photos","Photos",Ne),si=gt("pc","My PC",$t);gt("pin","Pin",Wt),gt("style","Style",Te),gt("leave","Leave",()=>Gr()),Lt.shown=!1,vt.shown=!1,Bt();let Ts=[];function Ur(l,p,x){let y=Ze(.205,.054,2400);u(y.tex),u(y.mesh.material),u(y.mesh.geometry),g||m.push(y.mesh.material);let f={c:y,hot:!1};return f.draw=()=>{let{ctx:A,w:G,h:F}=y;Un(A,G,F,(F-6)/2,{hot:f.hot}),Ai(A,l,58,F/2,50,Tn,7),A.font=`500 37px ${an}`,_e(A,An(A,p,G-124),98,F/2+13,37,Be,500),y.update()},f.draw(),St(y.mesh,{tap:()=>{Hs(),e.ask(x)},hover:A=>{f.hot=A,f.draw()}}),C.add(y.mesh),Ts.push(f),f}let As=!1;try{As=localStorage.getItem("izuki.vr.tried")!=="1"}catch{}function Hs(){As=!1;for(let l of Ts)l.c.mesh.visible=!1;try{localStorage.setItem("izuki.vr.tried","1")}catch{}}function lc(){Ts.forEach((l,p)=>{l.c.mesh.position.set((p-(Ts.length-1)/2)*.218,.17,.01)}),gc()}e.hasCamera().then(l=>{vt.shown=!!l,Bt(),Ur(l?"eye":"mic",l?"\u201CWhat's this?\u201D":"\u201CWhat can you do?\u201D",l?"What's this?":"What can you do?"),Ur("photos","\u201CShow my photos\u201D","Show my photos"),Ur("style","\u201CChange your look\u201D","Change your look"),lc()});let Nt={group:new We,photo:null,text:Ze(.5,.15),img:null,url:"",want:"",closed:"",seq:0,marks:[],say:"",t0:0,anim:!1,close:Ze(.05,.05)};Nt.group.visible=!1,h.add(Nt.group),St(Nt.text.mesh,{drag:()=>Nt.group}),u(Nt.text.tex),u(Nt.close.tex),Nt.group.add(Nt.text.mesh,Nt.close.mesh),_f(Nt.close,"close"),St(Nt.close.mesh,{tap:()=>{Nt.seq++,Nt.closed=Nt.want,Nt.group.visible=!1}});function Fr(){let{ctx:l,w:p,h:x}=Nt.text;Un(l,p,x,44);let y=(G,F)=>(l.font=`500 ${F}px ${an}`,l.measureText(G).width),f=a.fitLines(Nt.say,p-96,4,38,26,y),A=22;for(let G of f.lines)_e(l,G,48,A+=f.size*1.32,f.size,Be,500);Nt.text.update(),De(Nt.say)}function Ei(l){let p=Nt.photo;if(!p||!Nt.img)return;let{ctx:x,w:y,h:f}=p;x.clearRect(0,0,y,f),x.save(),Yn(x,0,0,y,f,28),x.clip(),x.drawImage(Nt.img,0,0,y,f),x.restore();let A=Nt.marks.length,G=y*(Nt.steps?.03:.065),F=$=>({x:$.x/1e3*y,y:$.y/1e3*f});Nt.marks.forEach(($,W)=>{let X=Math.max(0,Math.min(1,l*A-W));if(X<=0)return;let{x:nt,y:ct}=F($);if(Nt.steps&&W>0&&Or(x,F(Nt.marks[W-1]),{x:nt,y:ct},G,Math.min(1,X*2)),x.save(),x.shadowColor="rgba(0,0,0,0.55)",x.shadowBlur=10,x.shadowOffsetY=3,x.strokeStyle=Tn,x.lineWidth=6,x.lineCap="round",x.beginPath(),x.arc(nt,ct,G,-Math.PI/2,-Math.PI/2+Math.PI*2*X),x.stroke(),x.restore(),Nt.steps&&A>1&&X>.3){let Tt=Math.min(y-26,Math.max(26,nt-G*.75)),ft=Math.min(f-26,Math.max(26,ct-G*.75));x.save(),x.shadowColor="rgba(0,0,0,0.5)",x.shadowBlur=8,x.fillStyle=Tn,x.beginPath(),x.arc(Tt,ft,22,0,Math.PI*2),x.fill(),x.restore(),x.font=`700 26px ${an}`;let Jt=String(W+1);_e(x,Jt,Tt-x.measureText(Jt).width/2,ft+9,26,"#0b1016",700)}if(X>.85&&$.label){x.font=`600 28px ${an}`;let Tt=x.measureText($.label).width,ft=Math.min(y-Tt-40,Math.max(10,nt-Tt/2-16)),Jt=ct+G+12>f-50?ct-G-56:ct+G+12;Nt.steps&&(ft=nt+G+16+Tt+32<=y-10?nt+G+16:Math.max(10,nt-G-16-Tt-32),Jt=Math.min(f-54,Math.max(10,ct-22))),Yn(x,ft,Jt,Tt+32,44,22),x.fillStyle="rgba(14,16,22,0.88)",x.fill(),_e(x,$.label,ft+16,Jt+31,28,Be,600)}}),p.update()}function Or(l,p,x,y,f){let A=x.x-p.x,G=x.y-p.y,F=Math.hypot(A,G);if(F<=2*y+12)return;let $=A/F,W=G/F,X=p.x+$*(y+6),nt=p.y+W*(y+6),ct=(F-2*y-12)*f,Tt=X+$*ct,ft=nt+W*ct;if(l.save(),l.shadowColor="rgba(0,0,0,0.5)",l.shadowBlur=8,l.strokeStyle=Tn,l.lineWidth=5,l.lineCap="round",l.setLineDash([16,12]),l.beginPath(),l.moveTo(X,nt),l.lineTo(Tt,ft),l.stroke(),l.setLineDash([]),f>=1){let ie=-W,fe=$;l.fillStyle=Tn,l.beginPath(),l.moveTo(Tt+$*4,ft+W*4),l.lineTo(Tt-$*18+ie*18*.6,ft-W*18+fe*18*.6),l.lineTo(Tt-$*18-ie*18*.6,ft-W*18-fe*18*.6),l.closePath(),l.fill()}l.restore()}function Oa(){Nt.group.visible&&(Nt.say="Looking\u2026",Fr())}async function Ba({url:l,w:p,h:x,marks:y,say:f,picked:A,steps:G}){if(A)Nt.closed="";else if(l===Nt.closed)return;let F=++Nt.seq;if(Nt.want=l,l!==Nt.url){let $=new Image;$.src=l;try{await $.decode()}catch{return}if(F!==Nt.seq)return;Nt.img=$,Nt.url=l;let W=x/Math.max(1,p),X=Math.min(.42,.5*W),nt=X/W;Nt.photo&&(ee(Nt.photo.mesh),Nt.group.remove(Nt.photo.mesh),Nt.photo.tex.dispose(),Nt.photo.mesh.geometry.dispose(),Nt.photo.mesh.material.dispose()),Nt.photo=Ze(nt,X,2048),Nt.group.add(Nt.photo.mesh),St(Nt.photo.mesh,{drag:()=>Nt.group}),Nt.photo.mesh.position.set(0,.1,0),Nt.text.mesh.position.set(0,.1-X/2-.09,0),Nt.close.mesh.position.set(nt/2-.01,.1+X/2-.01,.005)}if(Nt.marks=Array.isArray(y)?y:[],Nt.steps=!!G,Nt.say=String(f||""),Nt.t0=performance.now(),Nt.anim=Nt.marks.length>0,!Nt.group.visible){let $=pe-.6,W=.85;Nt.group.position.set(Ot.x-Math.sin($)*W,Ot.y-.08,Ot.z-Math.cos($)*W),Mt(Nt.group)}Nt.group.visible=!0,Ei(Nt.anim?0:1),Fr()}let xt={group:new We,open:!1,live:!1,gen:0,target:null,err:"",clicks:Promise.resolve(),doing:"",busy:!1,screen:null,bar:Ze(1.6,.09),handle:Ze(.32,.035),aspect:9/16};xt.group.visible=!1,h.add(xt.group),u(xt.bar.tex),u(xt.handle.tex);function Br(l,p){xt.screen&&(ee(xt.screen.mesh),xt.group.remove(xt.screen.mesh),xt.screen.tex.dispose(),xt.screen.mesh.geometry.dispose(),xt.screen.mesh.material.dispose());let x=p/l,y=Math.min(1.6,1.1/x),f=Ze(y,y*x,l/y);f.mesh.material.transparent=!1,f.mesh.material.depthWrite=!0,xt.screen=f,xt.aspect=x,xt.group.add(f.mesh);let A=y*x/2;return xt.bar.mesh.position.set(0,-A-.06,0),xt.handle.mesh.position.set(0,A+.04,0),St(f.mesh,{tap:G=>{if(!G?.uv||!xt.live)return;let{nx:F,ny:$}=a.pcPoint(G.uv.x,G.uv.y),W=xt.gen;K(G.point);let X=()=>xt.open&&W===xt.gen&&xt.live;xt.clicks=xt.clicks.then(async()=>{if(!X())return;let nt=await e.pc.send({op:"point",nx:F,ny:$},xt.target);if(nt?.ok===!1){W===xt.gen&&(xt.err=nt.error||"",di());return}X()&&await e.pc.send({op:"click",button:"left"},xt.target)}).catch(()=>{})},scroll:G=>{xt.live&&e.pc.send({op:"scroll",dy:G},xt.target)}}),f}Br(1280,720),xt.group.add(xt.bar.mesh,xt.handle.mesh);{let{ctx:l,w:p,h:x}=xt.handle;l.clearRect(0,0,p,x),Yn(l,4,4,p-8,x-8,(x-8)/2),l.fillStyle="rgba(255,255,255,0.34)",l.fill(),xt.handle.update()}St(xt.handle.mesh,{drag:()=>xt.group});function Ki(l){xt.live=!1;let p=xt.screen,{ctx:x,w:y,h:f}=p;Un(x,y,f,24),x.font=`500 ${Math.round(f*.05)}px ${an}`;let A=a.wrapLines(l,y*.7,G=>x.measureText(G).width);A.forEach((G,F)=>_e(x,G,y/2,f/2+(F-(A.length-1)/2)*f*.075,Math.round(f*.05),en,500,"center")),p.update()}function ka(l){(Math.abs(l.height/l.width-xt.aspect)>.01||xt.screen.w!==l.width)&&Br(l.width,l.height);let p=xt.screen;p.ctx.drawImage(l,0,0,p.w,p.h),p.update(),xt.live=!0}function di(){let{ctx:l,w:p,h:x}=xt.bar;Un(l,p,x,48),l.beginPath(),l.arc(72,x/2,13,0,Math.PI*2),l.fillStyle=xt.err?Ua:Tn,l.fill();let y=xt.err||(xt.doing?"Izuki: "+xt.doing:(xt.target?.name||e.pc.name())+" \xB7 point and click, thumbstick to scroll");l.font=`500 60px ${an}`,_e(l,An(l,y,p-800),116,x/2+21,60,xt.err?Ua:Be,500);let f=(A,G,F)=>{Yn(l,A,30,280,x-60,(x-60)/2),l.fillStyle=F?"rgba(220, 38, 38, 0.82)":"rgba(255, 255, 255, 0.07)",l.fill(),F||(l.lineWidth=3,l.strokeStyle="rgba(255,255,255,0.16)",l.stroke()),_e(l,G,A+140,x/2+19,52,Be,600,"center",ze,"0.02em")};xt.busy&&f(p-620,"Stop",!0),f(p-310,"Close",!1),xt.bar.update()}St(xt.bar.mesh,{tap:l=>{let p=(l?.uv?.x??0)*xt.bar.w;if(p>xt.bar.w-320)Es();else if(xt.busy&&p>xt.bar.w-630){let x=xt.gen;e.pc.send({op:"stop"},xt.target).then(y=>{!xt.open||x!==xt.gen||(y?.ok===!1?xt.err=y.error||"Your PC didn't confirm it stopped.":(xt.busy=!1,xt.err=""),di())})}},drag:()=>xt.group});let za=l=>new Promise(p=>setTimeout(p,l));async function cc(l){for(;xt.open&&l===xt.gen;){let p=performance.now(),x=await e.pc.shot(1280,xt.target);if(!xt.open||l!==xt.gen)break;if(x.blob){let y=()=>xt.open&&l===xt.gen,f=null;try{f=await createImageBitmap(x.blob),y()&&(ka(f),xt.err&&(xt.err="",di()))}catch{y()&&(xt.err="A picture from your PC didn't come through.",Ki(xt.err),di())}finally{f?.close?.()}}else xt.err=x.error||"Your PC didn't answer.",Ki(xt.err),di();await za(x.blob?Math.max(120,320-(performance.now()-p)):3e3)}}async function hc(l){for(;xt.open&&l===xt.gen;){let p=await e.pc.status(xt.target);if(!xt.open||l!==xt.gen)break;p.error||(xt.doing=p.doing,xt.busy=p.busy,di()),await za(3e3)}}async function Va(){if(!e.pc.current())return"This headset isn't paired with your PC yet. Leave VR, open Remote in Izuki and pair your PC once.";let l=1.55;xt.group.position.set(Ot.x-Math.sin(pe)*l,Ot.y-.02,Ot.z-Math.cos(pe)*l),Mt(xt.group),xt.group.visible=!0,xt.open=!0,xt.err="",xt.target=e.pc.current(),w("pc");let p=++xt.gen;return Ki("Connecting to "+(xt.target?.name||e.pc.name())+"\u2026"),di(),cc(p),hc(p),""}function Es(){xt.open=!1,xt.gen++,xt.group.visible=!1,C.userData.placed==="pc"&&(ot?.open?C.userData.placed="files":ut?.open?C.userData.placed="web":J?.open?C.userData.placed="holo":Zs())}function w(l){if(C.userData.placed!==!0){if(!C.userData.placed){let p=pe+.7;Kn={x:Ot.x-Math.sin(p)*.7,y:Ot.y-.17,z:Ot.z-Math.cos(p)*.7}}C.userData.placed=l}}let B=[],it=u(new ps(.012,.018,32));function K(l){let p=new ce(it,new rn({color:6220500,transparent:!0,opacity:.9,depthTest:!1}));p.position.copy(l),p.lookAt(Ot),p.renderOrder=998,h.add(p),B.push({m:p,t0:performance.now()})}let j=1,It=.74,Ft=4,Pt=3,zt=Ft*Pt,Xt=.12,ot={group:new We,card:Ze(j,It),handle:Ze(.3,.035),open:!1,gen:0,path:"",up:"",items:[],page:0,title:"",err:"",loading:!1,thumbs:new Map,pending:new Set,btns:[]};ot.group.visible=!1,h.add(ot.group),ot.group.add(ot.card.mesh,ot.handle.mesh),ot.handle.mesh.position.set(0,It/2+.035,0),u(ot.card.tex),u(ot.handle.tex);{let{ctx:l,w:p,h:x}=ot.handle;Yn(l,4,4,p-8,x-8,(x-8)/2),l.fillStyle="rgba(255,255,255,0.34)",l.fill(),ot.handle.update()}St(ot.handle.mesh,{drag:()=>ot.group});let ue=()=>ot.items.slice(ot.page*zt,ot.page*zt+zt),Vt=()=>Math.max(1,Math.ceil(ot.items.length/zt)),Ae=l=>ot.path+"|"+l.name;function Ke(l){let{w:p,h:x}=ot.card,y=x*Xt,f=p*.018,A=(p-f*(Ft+1))/Ft,G=(x-y-f*(Pt+1))/Pt;return{x:f+l%Ft*(A+f),y:y+f+Math.floor(l/Ft)*(G+f),w:A,h:G}}function be(){let{ctx:l,w:p,h:x}=ot.card;Un(l,p,x,56);let y=x*Xt;ot.btns=[];let f=y*.62,A=y*.56,G=p-44,F=(W,X)=>{let nt=G-f/2;l.beginPath(),l.arc(nt,A,f/2,0,Math.PI*2),l.fillStyle="rgba(255,255,255,0.06)",l.fill(),l.lineWidth=3,l.strokeStyle="rgba(255,255,255,0.16)",l.stroke(),Ai(l,W,nt,A,f*.62,Be,7),ot.btns.push({x0:G-f,x1:G,act:X}),G-=f+20};F("close",()=>ve()),ot.page+1<Vt()&&F("next",()=>{ot.page++,be(),Ce(ot.gen)}),ot.page>0&&F("back",()=>{ot.page--,be(),Ce(ot.gen)}),ot.path&&F("up",()=>{Ut(ot.up,"")}),l.font=`600 50px ${ze}`;let $=An(l,ot.title||"Your folders",G-220);if(_e(l,$,56,A+18,50,Be,600,"left",ze,"-0.01em"),Vt()>1){l.font=`600 50px ${ze}`;let W=l.measureText($).width;_e(l,`${ot.page+1} / ${Vt()}`,56+W+28,A+16,34,en,500)}if(ot.loading||ot.err||!ot.items.length){let W=ot.loading?"Opening\u2026":ot.err||"This folder is empty.";l.font=`500 46px ${an}`;let X=a.wrapLines(W,p*.7,nt=>l.measureText(nt).width);X.forEach((nt,ct)=>_e(l,nt,p/2,x*.55+(ct-(X.length-1)/2)*64,46,ot.err?Ua:en,500,"center")),ot.card.update();return}ue().forEach((W,X)=>{let nt=Ke(X);l.save(),Yn(l,nt.x,nt.y,nt.w,nt.h,26),l.fillStyle="rgba(255,255,255,0.045)",l.fill(),l.clip();let ct=ot.thumbs.get(Ae(W));if(ct){let ft=Math.max(nt.w/ct.width,nt.h/ct.height);l.drawImage(ct,nt.x+(nt.w-ct.width*ft)/2,nt.y+(nt.h-ct.height*ft)/2,ct.width*ft,ct.height*ft)}else Ai(l,W.dir?"folder":e.isPicture(W.name)?"photos":"doc",nt.x+nt.w/2,nt.y+nt.h*.42,Math.min(nt.w,nt.h)*.4,W.dir?Be:en,4);let Tt=l.createLinearGradient(0,nt.y+nt.h-92,0,nt.y+nt.h);Tt.addColorStop(0,"rgba(10,12,18,0)"),Tt.addColorStop(1,"rgba(10,12,18,0.86)"),l.fillStyle=Tt,l.fillRect(nt.x,nt.y+nt.h-92,nt.w,92),l.font=`500 30px ${an}`,_e(l,An(l,W.name,nt.w-36),nt.x+18,nt.y+nt.h-20,30,Be,500),l.restore()}),ot.card.update()}async function Ce(l){for(let p of ue()){if(l!==ot.gen||!ot.open)return;let x=Ae(p);if(p.dir||!e.isPicture(p.name)||ot.thumbs.has(x)||ot.pending.has(x))continue;ot.pending.add(x);let y=null;try{y=await e.thumb(ot.path,p)}finally{l===ot.gen&&ot.pending.delete(x)}if(l!==ot.gen||!ot.open){y?.close?.();return}if(ot.thumbs.has(x)){y?.close?.();continue}ot.thumbs.set(x,y||null),y&&be()}}function fn(){for(let l of ot.thumbs.values())l?.close?.();ot.thumbs.clear(),ot.pending.clear()}async function Ut(l,p){let x=++ot.gen;fn(),Object.assign(ot,{loading:!0,err:"",items:[],page:0,title:p||ot.title}),be();let y;if(l)y=await e.pc.list(l);else{let f=await e.pc.roots();y=f.error?f:{path:"",up:"",items:f.roots.map(A=>({name:A.name,dir:!0,at:A.path}))}}return x!==ot.gen||!ot.open?"":(ot.loading=!1,y.error?(ot.err=y.error,be(),y.error):(Object.assign(ot,{path:y.path,up:y.up,items:y.items}),p||(ot.title=y.path?String(y.path).split(/[\\/]/).filter(Boolean).slice(-2).join(" \u203A "):"Your folders"),be(),Ce(x),""))}St(ot.card.mesh,{tap:l=>{if(!l?.uv)return;let{w:p,h:x}=ot.card,y=l.uv.x*p,f=(1-l.uv.y)*x;if(f<x*Xt){ot.btns.find(F=>y>=F.x0&&y<=F.x1)?.act();return}if(ot.loading)return;let A=ue().findIndex((F,$)=>{let W=Ke($);return y>=W.x&&y<=W.x+W.w&&f>=W.y&&f<=W.y+W.h}),G=ue()[A];G&&(G.dir?Ut(G.at||e.joinPath(ot.path,G.name),G.name):e.openPhoto(ot.path,G).then(F=>{F&&ge(F,12e3,!0)}))},scroll:l=>{let p=Math.max(0,Math.min(Vt()-1,ot.page+Math.sign(l)));p!==ot.page&&(ot.page=p,be(),Ce(ot.gen))}});async function vn(l){if(!ot.open){let f=pe-(xt.open?.85:.05),A=1.15;ot.group.position.set(Ot.x-Math.sin(f)*A,Ot.y-.04,Ot.z-Math.cos(f)*A),Mt(ot.group),w("files")}if(ot.open=!0,ot.group.visible=!0,!l)return Ut("","Your folders");let p=++ot.gen;Object.assign(ot,{loading:!0,err:""}),be();let x=await e.pc.roots();if(!ot.open||p!==ot.gen)return"";if(x.error)return ot.loading=!1,ot.err=x.error,be(),x.error;let y=x.roots.find(f=>String(f.name).toLowerCase()===l.toLowerCase());return y?Ut(y.path,y.name):(await Ut("","Your folders"),"I couldn't find a "+l+" folder on your PC, so here are all your folders.")}function ve(){ot.open=!1,ot.gen++,ot.group.visible=!1,fn(),C.userData.placed==="files"&&(xt.open?C.userData.placed="pc":ut.open?C.userData.placed="web":J.open?C.userData.placed="holo":Zs())}let Cn=1,Bn=.1,$n=.62,ki=5,ut={group:new We,head:Ze(Cn,Bn),body:Ze(Cn,$n),handle:Ze(.3,.035),open:!1,gen:0,q:"",typed:"",mode:"",results:[],page:null,title:"",paras:[],first:0,more:!1,err:"",btns:[],rows:[]};ut.group.visible=!1,h.add(ut.group),ut.group.add(ut.head.mesh,ut.body.mesh,ut.handle.mesh),ut.head.mesh.position.set(0,$n/2+.008+Bn/2,0),ut.handle.mesh.position.set(0,$n/2+.016+Bn+.02,0),u(ut.head.tex),u(ut.body.tex),u(ut.handle.tex);{let{ctx:l,w:p,h:x}=ut.handle;Yn(l,4,4,p-8,x-8,(x-8)/2),l.fillStyle="rgba(255,255,255,0.34)",l.fill(),ut.handle.update()}St(ut.handle.mesh,{drag:()=>ut.group});let Xe=()=>ut.mode==="reading"||ut.mode==="page-loading"||ut.mode==="page-error";function ri(){let{ctx:l,w:p,h:x}=ut.head;Un(l,p,x,48);let y=x/2,f=x*.6;ut.btns=[];let A=p-36,G=(Tt,ft)=>{let Jt=A-f/2;l.beginPath(),l.arc(Jt,y,f/2,0,Math.PI*2),l.fillStyle="rgba(255,255,255,0.06)",l.fill(),l.lineWidth=3,l.strokeStyle="rgba(255,255,255,0.16)",l.stroke(),Ai(l,Tt,Jt,y,f*.62,Be,7),ut.btns.push({x0:A-f,x1:A,act:ft}),A-=f+18};G("close",()=>uc()),Xe()&&G("back",()=>{ut.gen++,ut.mode="results",bn()});let F=30,$=A-12-F,W=x*.66;Yn(l,F,y-W/2,$,W,W/2),l.fillStyle="rgba(255,255,255,0.06)",l.fill(),l.lineWidth=3,l.strokeStyle=ut.mode==="typing"||ut.mode==="searching"?"rgba(94,234,212,0.75)":"rgba(255,255,255,0.16)",l.stroke(),Ai(l,"search",F+W*.58,y,W*.6,en,7);let X=Xe()?ut.page?.site||"":ut.typed;l.font=`500 40px ${an}`;let nt=An(l,X||"Search Google",$-W*1.4-24),ct=F+W*1.1;_e(l,nt,ct,y+14,40,X?Be:en,500),ut.mode==="typing"&&(l.font=`500 40px ${an}`,l.fillStyle=Tn,l.fillRect(ct+(X?l.measureText(nt).width:0)+6,y-22,4,44)),ut.head.update()}function Ue(){let{ctx:l,w:p,h:x}=ut.body;Un(l,p,x,48),ut.rows=[];let y=56,f=(G,F=en)=>{l.font=`500 44px ${an}`;let $=a.wrapLines(G,p*.76,W=>l.measureText(W).width);$.forEach((W,X)=>_e(l,W,p/2,x*.5+(X-($.length-1)/2)*62,44,F,500,"center"))},A=ut.mode;if(A==="")f("Say \u201Csearch the web for\u2026\u201D and anything you want to know. I'll look it up right here.");else if(A==="typing")f("");else if(A==="searching")f("Searching Google\u2026");else if(A==="error"||A==="page-error")f(ut.err,Ua);else if(A==="page-loading")f("Reading "+(ut.page?.site||"the page")+"\u2026");else if(A==="results"){ut.results.length||f("Google didn't return any pages for that. Try other words.");let G=(x-40)/ki;ut.results.slice(0,ki).forEach((F,$)=>{let W=20+$*G;$&&(l.fillStyle="rgba(255,255,255,0.08)",l.fillRect(y,W,p-y*2,2)),l.font=`600 40px ${ze}`,_e(l,An(l,F.site,p-y*2),y,W+66,40,Tn,600,"left",ze),l.font=`500 34px ${an}`;let X=a.wrapLines(F.snippet||"Tap to read this page.",p-y*2,nt=>l.measureText(nt).width).slice(0,2);X.length===2&&(F.snippet||"").length>0&&a.wrapLines(F.snippet,p-y*2,ct=>l.measureText(ct).width).length>2&&(X[1]=An(l,X[1]+" \u2026",p-y*2)),X.forEach((nt,ct)=>_e(l,nt,y,W+122+ct*46,34,en,500)),ut.rows.push({y0:W,y1:W+G,r:F})})}else if(A==="reading"){l.font=`600 46px ${ze}`;let G=a.wrapLines(ut.title,p-y*2,X=>l.measureText(X).width).slice(0,2),F=30;for(let X of G)_e(l,X,y,F+=60,46,Be,600,"left",ze);F+=30,l.font=`500 36px ${an}`;let $=x-70;ut.more=!1;for(let X=ut.first;X<ut.paras.length;X++){let nt=a.wrapLines(ut.paras[X],p-y*2,ct=>l.measureText(ct).width);if(F+nt.length*50>$&&X>ut.first){ut.more=!0;break}for(let ct of nt){if((F+=50)>$){ut.more=!0;break}_e(l,ct,y,F,36,Be,500)}F+=20}let W=`${ut.first+1} / ${ut.paras.length}`+(ut.more?"  \xB7  thumbstick or tap for more":"");_e(l,W,p-y,x-28,26,en,500,"right")}ut.body.update()}function bn(){ri(),Ue()}St(ut.head.mesh,{tap:l=>{if(!l?.uv)return;let p=l.uv.x*ut.head.w;ut.btns.find(x=>p>=x.x0&&p<=x.x1)?.act()},grab:()=>ut.group}),St(ut.body.mesh,{tap:l=>{if(!l?.uv)return;let p=(1-l.uv.y)*ut.body.h;if(ut.mode==="results"){let x=ut.rows.find(y=>p>=y.y0&&p<y.y1);x&&bf(x.r)}else ut.mode==="reading"&&zi(1)},scroll:l=>zi(l),grab:()=>ut.group});function zi(l){if(ut.mode!=="reading")return;let p=Math.max(0,Math.min(ut.paras.length-1,ut.first+Math.sign(l)));p===ut.first||l>0&&!ut.more||(ut.first=p,Ue())}let ji=new N;function vf(){C.userData.placed!==!0&&(ut.group.updateWorldMatrix(!0,!1),ji.set(-Cn/2-.36,$n/2-.02,.06),ut.group.localToWorld(ji),Kn={x:ji.x,y:ji.y,z:ji.z},C.userData.placed="web")}function yf(){if(!ut.open){let l=pe-(xt.open||ot.open?.85:.08),p=1.2;ut.group.position.set(Ot.x-Math.sin(l)*p,Ot.y-.02,Ot.z-Math.cos(l)*p),Mt(ut.group)}ut.open=!0,ut.group.visible=!0}function Mf(l,p){return T?(ut.typed=l,ri(),Promise.resolve()):new Promise(x=>{let y=0,f=()=>{if(p!==ut.gen||!ut.open)return x();if(y=Math.min(l.length,y+(l.length>36?2:1)),ut.typed=l.slice(0,y),ri(),y>=l.length)return setTimeout(x,220);setTimeout(f,45+Math.random()*35)};f()})}async function Sf(l){l=String(l||"").trim(),yf();let p=++ut.gen;if(Object.assign(ut,{q:l,typed:"",results:[],page:null,err:"",mode:l?"typing":""}),bn(),!l)return"What should I search for? Say search the web for, and what you want to know.";if(vf(),await Mf(l,p),p!==ut.gen||!ut.open)return"";ut.mode="searching",bn();let x;try{x=await e.search(l)}catch(y){x={error:String(y?.message||y)}}return p!==ut.gen||!ut.open?"":!x||x.error?(Object.assign(ut,{mode:"error",err:x?.error||"The search didn't work."}),bn(),ut.err):(Object.assign(ut,{mode:"results",results:Array.isArray(x.results)?x.results:[]}),bn(),x.answer||(ut.results.length?"Here's what Google found. Point at one and I'll read it to you.":"Google didn't find anything for that."))}async function bf(l){let p=++ut.gen;Object.assign(ut,{mode:"page-loading",page:l,paras:[],first:0,title:"",err:""}),bn();let x;try{x=await e.read(l,ut.q)}catch(y){x={error:String(y?.message||y)}}if(!(p!==ut.gen||!ut.open)){if(!x||x.error){Object.assign(ut,{mode:"page-error",err:x?.error||"I couldn't read that page."}),bn();return}Object.assign(ut,{mode:"reading",title:x.title||l.site,paras:Array.isArray(x.paras)&&x.paras.length?x.paras:["That page gave me nothing to read."]}),bn(),e.speak?.(ut.paras[0])}}function uc(){ut.open=!1,ut.gen++,ut.group.visible=!1,C.userData.placed==="web"&&(xt.open?(C.userData.placed=!1,w("pc")):J.open?(C.userData.placed=!1,w("holo")):Zs())}let on={teal:6220500,sky:8246268,violet:12891645,rose:16622767,amber:16569165,lime:12513892,white:15331063},wf=l=>"#"+(on[l]??on.teal).toString(16).padStart(6,"0"),J={group:new We,stage:new We,open:!1,spec:null,nodes:[],links:[],bar:Ze(.86,.1),t0:0,focus:null,step:-1,building:null,btns:[],view:null},Jh=()=>({spin:0,spinT:0,size:1,sizeT:1,turnT:null,ex:0,exT:0});J.view=Jh(),J.group.visible=!1,J.group.add(J.stage,J.bar.mesh),J.bar.mesh.position.set(0,-.42,.02),h.add(J.group),u(J.bar.tex);let Ws=u(gf()),Tf=u(new Dn(1,32,24)),Af=u(new Mi(1,1,1)),Ef=(()=>{let l=new fs(1,1),p=u(new Tr(l));return l.dispose(),p})(),Kh={value:0};function Xs(l){return new dn({uniforms:{color:{value:new jt(l)},opacity:{value:.82},time:Kh},vertexShader:`varying vec3 vN; varying vec3 vV; varying float vY;
void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
  vY = (modelMatrix * vec4(position, 1.0)).y; gl_Position = projectionMatrix * mv; }`,fragmentShader:`uniform vec3 color; uniform float opacity; uniform float time; varying vec3 vN; varying vec3 vV; varying float vY;
void main(){ float rim = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.0);
  float lines = 0.8 + 0.2 * step(0.5, fract(vY * 150.0 - time * 0.9));
  gl_FragColor = vec4(color * (0.5 + rim * 1.5) * lines, opacity * (0.45 + rim * 0.55));
  #include <colorspace_fragment>
}`,transparent:!0,depthWrite:!1})}let we={group:new We,rings:[],beam:null,dots:null,scan:null,scanT0:-1,speed:[]};{let l=y=>new rn({color:on.teal,transparent:!0,opacity:y,blending:Ye,depthWrite:!1,side:Xn});for(let[y,f,A,G,F]of[[.985,1,.32,96,.25],[.7,.71,.24,96,-.4],[.4,.44,.14,6,.6]]){let $=new ce(u(new ps(y,f,G)),u(l(A)));$.rotation.x=-Math.PI/2,we.group.add($),we.rings.push($),we.speed.push(F)}we.beam=new ce(u(new hi(.85,1,1,48,1,!0)),u(new dn({uniforms:{color:{value:new jt(on.teal)},strength:{value:.14}},vertexShader:"varying float vY; void main(){ vY = position.y + 0.5; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`uniform vec3 color; uniform float strength; varying float vY;
void main(){ float a = strength * pow(1.0 - vY, 2.2); gl_FragColor = vec4(color * a, a);
  #include <colorspace_fragment>
}`,transparent:!0,blending:Ye,depthWrite:!1,side:Xn}))),we.beam.position.y=.5,we.group.add(we.beam);let p=70,x=new Float32Array(p*3);we.rise=[];for(let y=0;y<p;y++){let f=Math.random()*Math.PI*2,A=Math.sqrt(Math.random())*.88;x.set([Math.cos(f)*A,Math.random(),Math.sin(f)*A],y*3),we.rise.push(.05+Math.random()*.1)}we.dots=new Fs(u(new Ie().setAttribute("position",new se(x,3))),u(new cs({color:on.teal,size:.006,transparent:!0,opacity:.75,blending:Ye,depthWrite:!1}))),we.group.add(we.dots),we.scan=new ce(u(new ps(.95,1,96)),u(l(0))),we.scan.rotation.x=-Math.PI/2,we.group.add(we.scan),we.group.visible=!1,J.group.add(we.group)}function kr(l,p){let x=Math.max(.24,Math.min(.7,l));we.group.scale.set(x,.68,x),we.group.position.set(0,-.34,0),we.group.visible=!0,we.scanT0=p&&!T?performance.now():-1,we.scan.material.opacity=0}function Cf(l,p){if(!we.group.visible||T)return;we.rings.forEach((y,f)=>{y.rotation.z+=l*we.speed[f]});let x=we.dots.geometry.attributes.position;for(let y=0;y<x.count;y++){let f=x.getY(y)+l*we.rise[y];f>1&&(f-=1),x.setY(y,f)}if(x.needsUpdate=!0,we.scanT0>=0){let y=(p-we.scanT0)/1100;y>=1?(we.scanT0=-1,we.scan.material.opacity=0):(we.scan.position.y=y,we.scan.material.opacity=.9*Math.sin(Math.PI*y))}}function zr(){for(let l of J.nodes){for(let p of[l.mat,l.glow.material,l.label.mesh.material])p.dispose();l.label.tex.dispose(),l.label.mesh.geometry.dispose(),l.ring?.geometry.dispose(),l.ring?.material.dispose(),l.shell?.material.dispose(),ee(l.body),ee(l.label.mesh)}for(let l of J.links)l.line.geometry.dispose(),l.line.material.dispose(),l.pulse?.material.dispose();J.building&&(J.building.geometry.dispose(),J.building.material.dispose()),Df(),Of(),Vf(),J.stage.clear(),J.nodes=[],J.links=[],J.building=null,J.view=Jh(),J.stage.rotation.set(0,0,0),J.stage.scale.setScalar(1),J.stage.position.set(0,0,0)}function Ga(){let l=pe-(xt.open?.9:0),p=1.35;J.group.position.set(Ot.x-Math.sin(l)*p,Ot.y+.02,Ot.z-Math.cos(l)*p),Mt(J.group)}function qs(l){let{ctx:p,w:x,h:y}=J.bar;Un(p,x,y,48);let f=y/2,A=y*.6;J.btns=[];let G=x-36,F=(nt,ct)=>{let Tt=G-A/2;p.beginPath(),p.arc(Tt,f,A/2,0,Math.PI*2),p.fillStyle="rgba(255,255,255,0.06)",p.fill(),p.lineWidth=3,p.strokeStyle="rgba(255,255,255,0.16)",p.stroke(),Ai(p,nt,Tt,f,A*.62,Be,7),J.btns.push({x0:G-A,x1:G,act:ct}),G-=A+18};F("close",()=>dc());let $=J.spec,W=$?.steps?.length||0;$&&W&&(J.step<W-1&&F("next",()=>e.holoStep?.(1)),J.step>0&&F("back",()=>e.holoStep?.(-1))),Ai(p,"holo",30+A/2,f,A*.7,Tn,6);let X=30+A+16;if(p.font=`600 38px ${ze}`,p.font=`600 44px ${ze}`,_e(p,An(p,l||$?.title||"",G-X-190),X,f+15,44,Be,600,"left",ze),$&&W){let nt=J.step<0?`${W} steps \xB7 say next`:`Step ${J.step+1} of ${W}`;_e(p,nt,G-8,f+12,32,en,500,"right")}J.bar.update()}St(J.bar.mesh,{tap:l=>{if(!l?.uv)return;let p=l.uv.x*J.bar.w;J.btns.find(x=>p>=x.x0&&p<=x.x1)?.act()},drag:()=>J.group});function Rf(l){zr(),J.spec=null,J.step=-1,J.focus=null,J.open||Ga(),J.open=!0,J.group.visible=!0;let p=new ce(new ms(.16,.0025,8,96),new rn({color:on.teal,transparent:!0,opacity:.7,depthWrite:!1}));J.stage.add(p),J.building=p,kr(.3,!1),qs("Building "+(l?"\u201C"+String(l).slice(0,48)+"\u201D":"a hologram")+"\u2026"),w("holo")}function Pf(l,p,x,y){let f=on[l.color]??on.teal,A=new We,G=x==="chart"?new rn({color:f,transparent:!0,opacity:.82,depthWrite:!0}):Xs(f),F,$;x==="chart"?(F=new ce(Af,G),$=.04):($=x==="model"?.022+l.size*.016:x==="map"&&p===0?.055:.03,F=new ce(Tf,G),F.scale.setScalar($));let W=new yi(new ci({map:Ws,color:f,transparent:!0,opacity:.5,blending:Ye,depthWrite:!1}));W.scale.setScalar($*(x==="chart"?3:5.5));let X=x==="steps"||x==="map"&&p===0,nt=x==="model",ct=Ze(nt?.15:X?.26:.24,nt?.05:X?.13:.085);{let{ctx:ie,w:fe,h:Re}=ct;Un(ie,fe,Re,30,{fill0:"rgba(16,19,27,0.82)",fill1:"rgba(10,12,18,0.86)"});let tn=nt?-2:16,Gt=nt?"":x==="timeline"&&l.when?l.when:x==="steps"?String(p+1):x==="chart"&&Number.isFinite(l.value)?String(l.value)+(y.unit?" "+y.unit:""):"";if(Gt&&(_e(ie,Gt,26,tn+=34,30,wf(l.color),700,"left",ze),tn+=4),ie.font=`600 36px ${ze}`,_e(ie,An(ie,l.label,fe-52),26,tn+=40,36,Be,600,"left",ze),l.note&&!nt){ie.font=`500 26px ${an}`;let le=a.wrapLines(l.note,fe-52,ke=>ie.measureText(ke).width).slice(0,X?3:1);for(let ke of le)_e(ie,ke,26,tn+=34,26,en,500)}ct.update()}ct.mesh.material.opacity=1,A.add(F,W,ct.mesh);let Tt=null;x!=="chart"&&(Tt=new Us(Ef,new ei({color:f,transparent:!0,opacity:.3,blending:Ye,depthWrite:!1})),Tt.scale.setScalar($*1.45),Tt.rotation.set(p*.7,p*1.3,0),A.add(Tt));let ft={it:l,i:p,g:A,body:F,mat:G,glow:W,label:ct,shell:Tt,r:$,kind:x,base:new N,angle:0,speed:0,orbitR:0,parent:null,shown:0,emph:1},Jt=()=>e.ask?.(`Tell me more about ${l.label}`+(y.title?`, in ${y.title}`:"")+".");return St(F,{tap:Jt,hover:ie=>{ft.hot=ie},turn:()=>J.stage}),St(ct.mesh,{tap:Jt,hover:ie=>{ft.hot=ie}}),ft}function If(l,p){let x=p.length,y=(A,G)=>x>1?(A/(x-1)-.5)*G:0;if(l.kind==="model"){let A=p.filter(F=>F.it.orbit<0);A.forEach((F,$)=>{F.base.set(A.length>1?($/(A.length-1)-.5)*Math.min(.95,.32*A.length):0,.02,0)});let G=new Map;for(let F of p)if(F.it.orbit>=0){let $=p[F.it.orbit],W=G.get($)||0;G.set($,W+1),F.parent=$,F.orbitR=$.r+F.r+.07+W*.075,F.angle=W*2.1+.6,F.speed=.45/(1+W*.55);let X=[];for(let nt=0;nt<=64;nt++){let ct=nt/64*Math.PI*2;X.push(Math.cos(ct)*F.orbitR,Math.sin(ct)*F.orbitR*.22,Math.sin(ct)*F.orbitR*.85)}F.ring=new Ni(new Ie().setAttribute("position",new se(X,3)),new ei({color:on[$.it.color]??on.teal,transparent:!0,opacity:.28,depthWrite:!1})),J.stage.add(F.ring)}for(let F of p)F.label.mesh.position.set(0,-(F.r+.06),.01)}else if(l.kind==="map"){p[0].base.set(0,.02,0),p[0].label.mesh.position.set(0,-.14,.01);let A=p.slice(1);A.forEach((G,F)=>{let $=-Math.PI/2+(F+.5)/A.length*Math.PI*2;G.base.set(Math.cos($)*.46,Math.sin($)*.27+.02,.03+F%2*.05),G.label.mesh.position.set(0,-.075,.01)})}else if(l.kind==="steps")p.forEach((A,G)=>{let F=y(G,Math.min(1.1,.28*x));A.base.set(F,.13,.16*(1-(F/.6)**2)),A.label.mesh.position.set(0,-.12,.01)});else if(l.kind==="timeline"){p.forEach((F,$)=>{F.base.set(y($,Math.min(1.15,.27*x)),0,0),F.label.mesh.position.set(0,$%2?-.1:.1,.01)});let A=[-.62,0,0,.62,0,0],G=new Ni(new Ie().setAttribute("position",new se(A,3)),new ei({color:on.white,transparent:!0,opacity:.35,depthWrite:!1}));J.stage.add(G),J.links.push({line:G,a:null,b:null})}else if(l.kind==="chart"){let A=Math.max(...p.map(W=>Math.abs(W.it.value)||0),1e-9),G=p.some(W=>W.it.value<0),F=G?-.02:-.26,$=G?.24:.46;p.forEach((W,X)=>{let nt=Number.isFinite(W.it.value)?W.it.value:0,ct=Math.max(.01,$*Math.abs(nt)/A),Tt=nt<0;W.body.scale.set(.075,ct,.075),W.base.set(y(X,Math.min(1.05,.22*x)),F+(Tt?-ct/2:ct/2),0),W.glow.position.set(0,Tt?-ct/2:ct/2,0),W.label.mesh.position.set(0,Tt?ct/2+.06:-ct/2-.06,.05)})}let f=[];for(let A of p)for(let G of A.it.link)p[G]&&G!==A.i&&f.push([A,p[G]]);if(l.kind==="map"&&!f.length)for(let A of p.slice(1))f.push([p[0],A]);if(l.kind==="steps")for(let A=1;A<x;A++)f.push([p[A-1],p[A]]);for(let[A,G]of f){let F=new Ni(new Ie().setAttribute("position",new se([0,0,0,0,0,0],3)),new ei({color:on.teal,transparent:!0,opacity:0,depthWrite:!1}));J.stage.add(F);let $=new yi(new ci({map:Ws,color:on[G.it.color]??on.teal,transparent:!0,opacity:0,blending:Ye,depthWrite:!1}));$.scale.setScalar(.05),J.stage.add($),J.links.push({line:F,a:A,b:G,pulse:$,off:J.links.length*.37})}}function Lf(l){if(zr(),Vr(),J.spec=l,J.step=-1,J.focus=null,J.t0=performance.now(),J.open||Ga(),J.open=!0,J.group.visible=!0,l.kind==="sketch"){kr(Nf(l)+.06,!0),qs(),w("holo");return}J.nodes=l.items.map((x,y)=>Pf(x,y,l.kind,l));for(let x of J.nodes)J.stage.add(x.g);If(l,J.nodes);for(let x of J.nodes)x.g.position.copy(x.base),x.g.scale.setScalar(T?1:.001);let p=Math.max(.2,...J.nodes.map(x=>Math.abs(x.base.x)+x.r+(x.parent?x.orbitR+Math.abs(x.parent.base.x):0)));J.reach=p,kr(p+.06,!0),qs(),w("holo")}let sn=.32,kn={parts:[],made:[],turnables:[]};function Df(){for(let l of kn.made)try{l.dispose()}catch{}for(let l of kn.turnables)ee(l);kn.parts=[],kn.made=[],kn.turnables=[]}function Nf(l){let p=A=>(kn.made.push(A),A),x=A=>new N(A[0]*sn,A[1]*sn+.04,A[2]*sn),y=(A,G)=>{G==="x"?A.rotation.z=-Math.PI/2:G==="z"&&(A.rotation.x=Math.PI/2)},f=.2;return l.shapes.forEach((A,G)=>{let F=on[A.color]??on.teal,$=new We,W=p(new rn({color:F,transparent:!0,opacity:.95,blending:Ye,depthWrite:!1})),X=null,nt=null,ct=null,Tt=(Gt,le=!1)=>{let ke=p(new ma(Gt,96,.0045,6,le));nt=new ce(ke,W),$.add(nt),X=Gt},ft=x(A.center),Jt=(Gt,le,ke,ye=48)=>{let hn=[];for(let Pe=0;Pe<ye;Pe++){let fi=Pe/ye*Math.PI*2,Gn=Math.cos(fi)*le,Hn=Math.sin(fi)*le;hn.push(ke==="y"?new N(Gt.x+Gn,Gt.y,Gt.z+Hn):ke==="x"?new N(Gt.x,Gt.y+Gn,Gt.z+Hn):new N(Gt.x+Gn,Gt.y+Hn,Gt.z))}return new ds(hn,!0)};if(A.type==="line"||A.type==="arrow"){let Gt=new fa;for(let le=1;le<A.points.length;le++)Gt.add(new wr(x(A.points[le-1]),x(A.points[le])));if(Tt(Gt),A.type==="arrow"){let le=x(A.points[A.points.length-1]),ke=x(A.points[A.points.length-2]),ye=new ce(p(new us(.016,.04,10)),W);ye.position.copy(le),ye.quaternion.setFromUnitVectors(new N(0,1,0),le.clone().sub(ke).normalize()),$.add(ye)}}else if(A.type==="curve")Tt(new ds(A.points.map(x)));else if(A.type==="circle")Tt(Jt(ft,A.radius*sn,A.axis),!0);else if(A.type==="spiral"||A.type==="wave"){let Gt=[];for(let ke=0;ke<=120;ke++){let ye=ke/120;if(A.type==="spiral"){let hn=ye*A.turns*Math.PI*2,Pe=(ye-.5)*A.height*sn,fi=Math.cos(hn)*A.radius*sn,Gn=Math.sin(hn)*A.radius*sn;Gt.push(A.axis==="x"?new N(ft.x+Pe,ft.y+fi,ft.z+Gn):A.axis==="z"?new N(ft.x+fi,ft.y+Gn,ft.z+Pe):new N(ft.x+fi,ft.y+Pe,ft.z+Gn))}else{let hn=(ye-.5)*2*A.radius*sn*2,Pe=Math.sin(ye*Math.PI*2*A.turns)*A.height*sn*.25;Gt.push(new N(ft.x+hn,ft.y+Pe,ft.z))}}Tt(new ds(Gt))}else{let Gt;A.type==="sphere"?Gt=new Dn(A.radius*sn,20,14):A.type==="cone"?Gt=new us(A.radius*sn,A.height*sn,20,1,!0):A.type==="cylinder"?Gt=new hi(A.radius*sn,A.radius*sn,A.height*sn,20,1,!0):Gt=new Mi(A.size[0]*sn,A.size[1]*sn,A.size[2]*sn),p(Gt);let le=new ce(Gt,p(Xs(F)));le.material.uniforms.opacity.value=.35;let ke=new Us(p(new Tr(Gt)),p(new ei({color:F,transparent:!0,opacity:.55,blending:Ye,depthWrite:!1}))),ye=new We;ye.add(le,ke),ct={body:le.material,wire:ke.material},y(ye,A.axis),ye.position.copy(ft),$.add(ye),A.flow&&(X=Jt(ft,(A.type==="box"?Math.max(A.size[0],A.size[2])/2:A.radius)*sn*1.08,A.axis==="y"?"y":A.axis==="x"?"x":"z"))}let ie=[];if(A.flow&&X)for(let Gt=0;Gt<6;Gt++){let le=new yi(p(new ci({map:Ws,color:F,transparent:!0,opacity:0,blending:Ye,depthWrite:!1})));le.scale.setScalar(.04),$.add(le),ie.push({sp:le,off:Gt/6})}let fe=null;if(A.label){fe=Ze(.16,.045),p(fe.tex),p(fe.mesh.geometry),p(fe.mesh.material);let{ctx:Gt,w:le,h:ke}=fe;Un(Gt,le,ke,26,{fill0:"rgba(16,19,27,0.82)",fill1:"rgba(10,12,18,0.86)"}),Gt.font=`600 34px ${ze}`,_e(Gt,An(Gt,A.label,le-40),20,ke/2+12,34,Be,600,"left",ze),fe.update();let ye=X&&(A.type==="line"||A.type==="curve"||A.type==="arrow"||A.type==="spiral"||A.type==="wave")?X.getPointAt(.55,new N):ft.clone().add(new N((A.type==="box"?A.size[0]/2:A.radius)*sn*.7,0,0)),hn=G%2?-1:1;fe.mesh.position.set(ye.x+hn*.1,ye.y,ye.z+.03),$.add(fe.mesh),St(fe.mesh,{tap:()=>e.ask?.(`Tell me more about the ${A.label}`+(l.title?`, in ${l.title}`:"")+".")})}$.visible=T,J.stage.add($);let Re=nt?nt.geometry.index.count:0;nt&&!T&&nt.geometry.setDrawRange(0,0),kn.parts.push({s:A,i:G,g:$,tube:nt,count:Re,path:X,flows:ie,label:fe,lineMat:W,solid:ct,emph:1});for(let Gt of[nt,ct&&$.children.find(le=>le.isGroup)?.children[0]])Gt&&(St(Gt,{turn:()=>J.stage}),kn.turnables.push(Gt));let tn=A.points.length?A.points:[A.center];for(let Gt of tn)f=Math.max(f,Math.abs(Gt[0]*sn)+(A.type==="line"||A.type==="curve"||A.type==="arrow"?0:A.radius*sn))}),f}let jh=new N;function Uf(l,p){let x=p-J.t0,y=kn.parts.length;kn.parts.forEach(f=>{let A=T?1:Math.max(0,Math.min(1,(x-250-f.i*(1600/Math.max(1,y)))/700));A>0&&(f.g.visible=!0),f.tube&&f.count&&f.tube.geometry.setDrawRange(0,Math.floor(f.count*A/3)*3),f.tube||f.g.scale.setScalar(Math.max(.001,1-(1-A)**3));let G=J.focus?J.focus.has(f.i)?1.15:.25:1;f.emph+=(G-f.emph)*Math.min(1,l*6);let F=f.s.pulse&&!T?.75+.25*Math.sin(p/380+f.i):1;if(f.lineMat.opacity=.95*Math.min(1,f.emph)*F,f.solid&&(f.solid.body.uniforms.opacity.value=.35*Math.min(1,f.emph)*F,f.solid.wire.opacity=.55*Math.min(1,f.emph)*F),f.label&&(f.label.mesh.material.opacity=Math.max(.3,Math.min(1,f.emph))),f.s.spin&&!T&&(f.g.rotation.y+=l*.35),f.path&&f.flows.length)for(let $ of f.flows){let W=T?$.off:(p/2400+$.off)%1;f.path.getPointAt(W,jh),$.sp.position.copy(jh),$.sp.material.opacity=A>=1?.9*Math.min(1,f.emph)*(T?.6:Math.sin(Math.PI*W)*.6+.4):0}})}let Ci={card:null};function Vr(){Ci.card&&(ee(Ci.card.mesh),J.group.remove(Ci.card.mesh),Ci.card.tex.dispose(),Ci.card.mesh.geometry.dispose(),Ci.card.mesh.material.dispose(),Ci.card=null)}async function Ff({url:l,title:p,note:x}){if(!J.open)return;let y=new Image;y.crossOrigin="anonymous",y.src=l;try{await y.decode()}catch{return}if(!J.open)return;Vr();let f=Ze(.34,.3,1024),{ctx:A,w:G,h:F}=f;Un(A,G,F,36);let $=G-40,W=F-150,X=y.width/y.height,nt=$/W,ct=X>nt?y.height*nt:y.width,Tt=X>nt?y.height:y.width/nt;A.save(),Yn(A,20,20,$,W,22),A.clip(),A.drawImage(y,(y.width-ct)/2,(y.height-Tt)/2,ct,Tt,20,20,$,W),A.restore(),A.font=`600 40px ${ze}`,_e(A,An(A,p,G-60),30,F-82,40,Be,600,"left",ze),A.font=`500 26px ${an}`,_e(A,An(A,(x?x+" \xB7 ":"")+"Photo: Wikipedia",G-60),30,F-36,26,en,500),f.update(),f.mesh.position.set(Math.max(.62,(J.reach||.4)+.26),.06,.04),f.mesh.rotation.y=-.35,J.group.add(f.mesh),Ci.card=f,St(f.mesh,{tap:()=>e.ask?.(`Tell me more about ${p}.`),drag:()=>J.group})}let cn={mesh:null,mark:null,made:[],credit:null};function Of(){for(let l of cn.made)try{l.dispose()}catch{}cn.credit&&ee(cn.credit.mesh),cn.turnable&&ee(cn.turnable),Object.assign(cn,{mesh:null,mark:null,made:[],credit:null,turnable:null})}function Bf({title:l,map:p,rings:x,glow:y}){zr(),Vr(),J.spec={title:l,kind:"globe",steps:[],items:[]},J.step=-1,J.focus=null,J.t0=performance.now(),J.open||Ga(),J.open=!0,J.group.visible=!0;let f=X=>(cn.made.push(X),X),A=f(new _a().setCrossOrigin("anonymous").load(p));A.colorSpace=mn,A.anisotropy=4;let G=.2,F=new ce(f(new Dn(G,64,40)),f(new rn({map:A})));F.position.set(0,.12,0),F.rotation.x=.41,J.stage.add(F);let $=new yi(f(new ci({map:Ws,color:y?16757575:10475775,transparent:!0,opacity:y?.9:.35,blending:Ye,depthWrite:!1})));if($.scale.setScalar(G*(y?4.2:2.7)),$.position.copy(F.position),J.stage.add($),x){let X=new ce(f(new ps(G*1.25,G*2.1,96)),f(new rn({color:14272416,transparent:!0,opacity:.55,side:Xn,depthWrite:!1})));X.rotation.x=-Math.PI/2+.45,X.position.copy(F.position),J.stage.add(X)}let W=Ze(.26,.04);f(W.tex),f(W.mesh.geometry),f(W.mesh.material);{let{ctx:X,w:nt,h:ct}=W;Un(X,nt,ct,22,{fill0:"rgba(16,19,27,0.7)",fill1:"rgba(10,12,18,0.75)"}),_e(X,"Map: Solar System Scope \xB7 CC BY 4.0",20,ct/2+9,26,en,500),W.update()}W.mesh.position.set(0,-.15,.05),J.stage.add(W.mesh),cn.mesh=F,cn.credit=W,St(F,{turn:()=>J.stage,tap:()=>e.ask?.("Tell me something amazing about "+l+".")}),cn.turnable=F,J.reach=G*(x?2.1:1.3),kr(J.reach+.06,!0),qs(),w("holo")}function kf(l,p){if(!cn.mesh)return;let x=.2*1.01,y=(Number(p)+180)/360*Math.PI*2,f=(90-Number(l))/180*Math.PI;if(!cn.mark){let A=new yi(new ci({map:Ws,color:16734810,transparent:!0,opacity:1,blending:Ye,depthWrite:!1}));cn.made.push(A.material),A.scale.setScalar(.08),cn.mesh.add(A),cn.mark=A}cn.mark.position.set(-x*Math.cos(y)*Math.sin(f),x*Math.cos(f),x*Math.sin(y)*Math.sin(f))}function zf(l,p){cn.mesh&&(T||(cn.mesh.rotation.y+=l*.12),cn.mark&&!T&&cn.mark.scale.setScalar(.07+.03*Math.abs(Math.sin(p/300))))}let zn=-.22,Qi=.36,Vn=.34,je={spec:null,made:[],st:null,card:null,readAt:0,parts:null};function Vf(){for(let l of je.made)try{l.dispose()}catch{}je.card&&ee(je.card.mesh),Object.assign(je,{spec:null,made:[],st:null,card:null,readAt:0,parts:null})}let pn=l=>(je.made.push(l),l);function ts(l,p){let x=new We,y=new ce(pn(new Dn(p,20,14)),pn(Xs(l)));y.material.uniforms.opacity.value=.95;let f=new yi(pn(new ci({map:Ws,color:l,transparent:!0,opacity:.8,blending:Ye,depthWrite:!1})));return f.scale.setScalar(p*5),x.add(y,f),x}function ai(l,p,x=.9){let y=pn(new Ie().setAttribute("position",new se(new Float32Array(l*3),3))),f=y.attributes.position.array;y.setDrawRange(0,0);let A=new Ni(y,pn(new ei({color:p,transparent:!0,opacity:x,blending:Ye,depthWrite:!1})));return A.frustumCulled=!1,{line:A,pos:f,geo:y,n:l,used:0,set(G,F,$,W=0){f[G*3]=F,f[G*3+1]=$,f[G*3+2]=W},draw(G){this.used=G,y.setDrawRange(0,G),y.attributes.position.needsUpdate=!0},push(G,F,$=0){this.used>=l&&(f.copyWithin(0,3),this.used=l-1),this.set(this.used,G,F,$),this.draw(this.used+1)},clear(){this.draw(0)}}}function Ha(l){let p=ai(2,on.white,.35);if(p.set(0,-Vn,zn),p.set(1,Vn,zn),p.draw(2),J.stage.add(p.line),!l)return;let x=Ze(.16,.036);pn(x.tex),pn(x.mesh.geometry),pn(x.mesh.material),_e(x.ctx,l,x.w-8,x.h/2+10,30,en,500,"right"),x.update(),x.mesh.position.set(Vn-.08,zn-.025,.01),J.stage.add(x.mesh)}let Qe=(l,p)=>Number.isFinite(l)?(Math.abs(l)>=100?Math.round(l):Math.abs(l)>=10?l.toFixed(1):l.toFixed(2))+(p?" "+p:""):"\u2014";function Qh(l){let p=je.card;if(!p)return;let{ctx:x,w:y,h:f}=p;Un(x,y,f,30,{fill0:"rgba(16,19,27,0.86)",fill1:"rgba(10,12,18,0.9)"}),_e(x,An(x,l[0],y-60),30,58,40,Tn,600,"left",ze),x.font=`500 34px ${an}`,_e(x,An(x,l[1]||"",y-60),30,112,34,Be,500),p.update()}function Gf(l,p){zr(),Vr(),J.spec={title:l.title,kind:"sim",steps:[],items:[]},J.step=-1,J.focus=null,J.t0=performance.now(),J.open||Ga(),J.open=!0,J.group.visible=!0,je.spec=l;let x=Ze(.6,.06);pn(x.tex),pn(x.mesh.geometry),pn(x.mesh.material),x.mesh.position.set(0,zn-.085,.04),J.stage.add(x.mesh),je.card=x,St(x.mesh,{tap:()=>e.ask?.("Explain why the "+l.type+" moves like that, simply.")});let y=l.g,f=on.teal,A=on.amber,G=on.sky,F=on.white,$={};if(l.type==="pendulum"){let W=new N(0,Qi,0),X=Qi-zn-.08,nt=new ce(pn(new hi(.0032,.0032,1,8)),pn(new rn({color:F,transparent:!0,opacity:.85,blending:Ye,depthWrite:!1}))),ct=ai(90,f,.55),Tt=ai(49,F,.18),ft=l.angle*Math.PI/180;for(let fe=0;fe<=48;fe++){let Re=-ft+2*ft*fe/48;Tt.set(fe,Math.sin(Re)*X,Qi-Math.cos(Re)*X)}Tt.draw(49);let Jt=ts(f,.026),ie=ts(F,.008);ie.position.copy(W),J.stage.add(nt,ct.line,Tt.line,Jt,ie),Object.assign($,{pivot:W,Ld:X,bar:nt,trail:ct,bob:Jt}),je.st={th:ft,w:0,t:0,lastCross:-1,period:NaN,dir:0},Ha("")}else if(l.type==="projectile"){let W=l.angle*Math.PI/180,X=l.speed,nt=y>0?X*X*Math.sin(2*W)/y:X*3,ct=y>0?X*X*Math.sin(W)**2/(2*y):X*3*Math.sin(W),Tt=0,ft=0;if(p?.type==="projectile"&&p.g>0){let ye=p.angle*Math.PI/180;Tt=p.speed**2*Math.sin(2*ye)/p.g,ft=p.speed**2*Math.sin(ye)**2/(2*p.g)}let Jt=Math.min((2*Vn-.04)/Math.max(nt,Tt,.5),(Qi-zn-.04)/Math.max(ct,ft,.25)),ie=-Vn+.02,fe=(ye,hn,Pe)=>{let fi=ye.g>0?2*ye.speed*Math.sin(ye.angle*Math.PI/180)/ye.g:3;for(let Gn=0;Gn<Pe;Gn++){let Hn=fi*Gn/(Pe-1),$s=ye.angle*Math.PI/180;hn.set(Gn,ie+ye.speed*Math.cos($s)*Hn*Jt,zn+(ye.speed*Math.sin($s)*Hn-ye.g*Hn*Hn/2)*Jt)}hn.draw(Pe)},Re=ai(64,F,.16);if(fe(l,Re,64),J.stage.add(Re.line),Tt){let ye=ai(64,G,.28);fe(p,ye,64),J.stage.add(ye.line)}let tn=ts(A,.016),Gt=ai(200,A,.85),le=ai(2,f,.9),ke=ts(f,.009);ke.visible=!1,J.stage.add(tn,Gt.line,le.line,ke),Object.assign($,{scale:Jt,x0:ie,th:W,v:X,ball:tn,trail:Gt,arrow:le,mark:ke,R:nt}),je.st={t:0,rest:0},Ha(Qe(2*Vn/Jt,"m"))}else if(l.type==="drop"){let W=(Qi-zn-.04)/l.length,X=zn+l.length*W,nt=ts(A,.02);nt.position.set(l.feather?-.09:0,X,0),J.stage.add(nt);let ct=null;if(l.feather){ct=new We;let ft=new ce(pn(new Dn(1,16,10)),pn(Xs(F)));ft.scale.set(.011,.034,.004),ct.add(ft),ct.position.set(.09,X,0),J.stage.add(ct)}let Tt=ai(2,F,.25);Tt.set(0,-Vn+.03,zn),Tt.set(1,-Vn+.03,X),Tt.draw(2),J.stage.add(Tt.line),Object.assign($,{scale:W,top:X,hammer:nt,feather:ct}),je.st={t:0,y:l.length,v:0,fy:l.length,fv:0,landed:-1,fLanded:-1,rest:0},Ha(Qe(l.length,"m")+" drop")}else if(l.type==="orbit"){let W=new ce(pn(new Dn(.05,32,20)),pn(Xs(G)));W.position.set(0,.07,0);let X=.13,nt=6,ct=2*Math.PI*X/nt,Tt=ct*ct*X,ft=ts(F,.014),Jt=ai(420,f,.6);J.stage.add(W,ft,Jt.line),Object.assign($,{planet:W,moon:ft,trail:Jt,GM:Tt,r0:X}),je.st={x:X,y:0,vx:0,vy:ct*l.rate,t:0,rest:0}}else if(l.type==="spring"){let W=Qi,X=.06,nt=ai(160,f,.85),ct=ai(2,F,.6);ct.set(0,-.06,W),ct.set(1,.06,W),ct.draw(2);let Tt=new ce(pn(new Mi(.06,.05,.06)),pn(Xs(A)));J.stage.add(nt.line,ct.line,Tt);let ft=20,Jt=Math.sqrt(ft/l.mass);Object.assign($,{top:W,rest:X,coil:nt,box:Tt,omega:Jt}),je.st={t:0},Ha("")}else if(l.type==="wave"){let X=ai(96,f,.9),nt=[];for(let Tt=0;Tt<16;Tt++){let ft=ts(Tt===7?A:F,Tt===7?.011:.006);nt.push(ft),J.stage.add(ft)}let ct=ts(f,.012);J.stage.add(X.line,ct),Object.assign($,{n:96,line:X,beads:nt,crest:ct,perM:2*Vn/2}),je.st={t:0}}je.parts=$,J.reach=Vn,kr(Vn+.06,!0),qs(),w("holo"),Qh([l.title,"\u2026"])}function Hf(l,p){let x=je.spec,y=je.parts,f=je.st;if(!x||!y||!f)return;l=Math.min(l,.05);let A=x.g,G=null;if(x.type==="pendulum"){let F=x.length;for(let X=0;X<4;X++){let nt=l/4,ct=f.th;f.w+=-(A/F)*Math.sin(f.th)*nt,f.th+=f.w*nt,f.t+=nt,ct<0&&f.th>=0&&(f.lastCross>=0&&(f.period=f.t-f.lastCross),f.lastCross=f.t)}let $=Math.sin(f.th)*y.Ld,W=Qi-Math.cos(f.th)*y.Ld;y.bob.position.set($,W,0),y.bar.position.set($/2,(Qi+W)/2,0),y.bar.scale.set(1,y.Ld,1),y.bar.rotation.z=f.th,y.trail.push($,W),y.trail.used>40&&(y.trail.pos.copyWithin(0,3),y.trail.draw(40)),G=()=>[A>0?"T = 2\u03C0\u221A(L/g) \u2248 "+Qe(2*Math.PI*Math.sqrt(F/A),"s"):"No gravity: no swing","angle "+Math.round(f.th*180/Math.PI)+"\xB0   speed "+Qe(Math.abs(f.w)*F,"m/s")+"   measured swing "+(Number.isFinite(f.period)?Qe(f.period,"s"):"\u2026")]}else if(x.type==="projectile"){if(f.rest>0)f.rest-=l,f.rest<=0&&(f.t=0,y.trail.clear(),y.mark.visible=!1);else{f.t+=l;let F=y.v*Math.cos(y.th)*f.t,$=y.v*Math.sin(y.th)*f.t-A*f.t*f.t/2,W=A>0?2*y.v*Math.sin(y.th)/A:3;f.t>=W&&(f.t=W,F=y.v*Math.cos(y.th)*W,$=A>0?0:$,f.rest=1.6,y.mark.visible=A>0,y.mark.position.set(y.x0+F*y.scale,zn,0)),y.ball.position.set(y.x0+F*y.scale,zn+Math.max(0,$)*y.scale,0),y.trail.push(y.ball.position.x,y.ball.position.y);let X=y.v*Math.cos(y.th),nt=y.v*Math.sin(y.th)-A*f.t,ct=.06/Math.max(1,y.v);y.arrow.set(0,y.ball.position.x,y.ball.position.y),y.arrow.set(1,y.ball.position.x+X*ct,y.ball.position.y+nt*ct),y.arrow.draw(2),f.x=F,f.y=Math.max(0,$),f.sp=Math.hypot(X,nt)}G=()=>["range = v\xB2\xB7sin 2\u03B8 / g = "+Qe(y.R,"m"),"time "+Qe(f.t,"s")+"   height "+Qe(f.y??0,"m")+"   distance "+Qe(f.x??0,"m")+"   speed "+Qe(f.sp??x.speed,"m/s")]}else if(x.type==="drop")f.rest>0?(f.rest-=l,f.rest<=0&&Object.assign(f,{t:0,y:x.length,v:0,fy:x.length,fv:0,landed:-1,fLanded:-1})):A>0&&(f.t+=l,f.landed<0&&(f.v+=A*l,f.y-=f.v*l,f.y<=0&&(f.y=0,f.landed=f.t)),y.feather&&f.fLanded<0&&(f.fv+=(x.air?A*(1-f.fv*f.fv/(.5*.5)):A)*l,f.fy-=f.fv*l,f.fy<=0&&(f.fy=0,f.fLanded=f.t)),f.landed>=0&&(!y.feather||f.fLanded>=0||f.t-f.landed>6)&&(f.rest=2)),y.hammer.position.y=zn+f.y*y.scale+.02,y.feather&&(y.feather.position.y=zn+f.fy*y.scale+.02,y.feather.position.x=.09+(x.air&&f.fLanded<0?Math.sin(f.t*3)*.02:0),y.feather.rotation.z=x.air&&f.fLanded<0?Math.sin(f.t*3)*.5:0),G=()=>[A>0?"t = \u221A(2h/g) = "+Qe(Math.sqrt(2*x.length/A),"s"):"No gravity: nothing falls","time "+Qe(f.landed>=0?f.landed:f.t,"s")+"   fallen "+Qe(x.length-f.y,"m")+"   speed "+Qe(f.landed>=0?Math.sqrt(2*A*x.length):f.v,"m/s")+(y.feather?"   feather "+(f.fLanded>=0?"landed at "+Qe(f.fLanded,"s"):Qe(x.length-f.fy,"m")+" down"):"")];else if(x.type==="orbit"){if(f.rest>0)f.rest-=l,f.rest<=0&&(Object.assign(f,{x:y.r0,y:0,vx:0,vy:Math.sqrt(y.GM/y.r0)*x.rate,t:0}),y.trail.clear(),y.moon.visible=!0);else{for(let $=0;$<8;$++){let W=l/8,X=Math.hypot(f.x,f.y),nt=-y.GM/(X*X*X);f.vx+=.5*nt*f.x*W,f.vy+=.5*nt*f.y*W,f.x+=f.vx*W,f.y+=f.vy*W;let ct=Math.hypot(f.x,f.y),Tt=-y.GM/(ct*ct*ct);f.vx+=.5*Tt*f.x*W,f.vy+=.5*Tt*f.y*W}f.t+=l;let F=Math.hypot(f.x,f.y);(F<.055||F>.9)&&(f.rest=1.2,y.moon.visible=!1),y.moon.position.set(f.x,.07+f.y,0),y.trail.push(f.x,.07+f.y)}G=()=>{let F=Math.hypot(f.x,f.y),$=Math.hypot(f.vx,f.vy),W=Math.sqrt(2*y.GM/Math.max(F,.001));return["gravity pulls in \xB7 speed carries it round","speed "+Qe(x.rate,"\xD7")+" a circle's   "+($>=W?"escaping":x.rate>1.02||x.rate<.98?"an ellipse":"a circle")+"   distance "+Qe(F/y.r0,"\xD7")]}}else if(x.type==="spring"){f.t+=l;let F=.07,$=y.top-.2,W=$+F*Math.cos(y.omega*f.t);y.box.position.set(0,W-.025,0);let X=y.coil.n,nt=12;for(let ct=0;ct<X;ct++){let Tt=ct/(X-1),ft=Tt*nt*Math.PI*2,Jt=y.top+(W-y.top)*Tt,ie=Tt<.04||Tt>.96?0:1;y.coil.set(ct,Math.cos(ft)*.025*ie,Jt,Math.sin(ft)*.025*ie)}y.coil.draw(X),G=()=>["T = 2\u03C0\u221A(m/k) = "+Qe(2*Math.PI/y.omega,"s"),"mass "+Qe(x.mass,"kg")+"   spring 20 N/m   speed "+Qe(Math.abs(F*y.omega*Math.sin(y.omega*f.t))*1,"m/s")+"   gravity doesn't change the pace"]}else if(x.type==="wave"){f.t+=l;let F=x.rate,$=1/F,W=2*Math.PI/$,X=2*Math.PI*F,nt=.06,ct=.07;for(let ft=0;ft<y.n;ft++){let Jt=ft/(y.n-1)*2;y.line.set(ft,-Vn+Jt*y.perM,ct+nt*Math.sin(W*Jt-X*f.t))}y.line.draw(y.n),y.beads.forEach((ft,Jt)=>{let ie=Jt/15*2;ft.position.set(-Vn+ie*y.perM,ct+nt*Math.sin(W*ie-X*f.t),0)});let Tt=((X*f.t/W+$/4)%2+2)%2;y.crest.position.set(-Vn+Tt*y.perM,ct+nt+.02,0),G=()=>["speed = frequency \xD7 wavelength = 1 m/s","frequency "+Qe(F,"Hz")+"   wavelength "+Qe($,"m")+"   the gold bead only moves up and down"]}G&&p-je.readAt>160&&(je.readAt=p,Qh(G()))}function tu(l){return{obj:l,yaw0:l.rotation.y,vel:0,lastYaw:l.rotation.y,lastT:performance.now()}}let eu=new N;function Wf(l,p,x){let y=l.turn;eu.set(1,0,0).applyQuaternion(J.group.quaternion);let f=y.yaw0+p.clone().sub(l.start).dot(eu)*7,A=Math.max(1,x-y.lastT)/1e3;y.vel=y.vel*.6+(f-y.lastYaw)/A*.4,y.lastYaw=f,y.lastT=x,y.obj.rotation.y=f,J.view.spin=0,J.view.turnT=null}function Xf(l){let p=J.view,x=J.stage;if(p.size+=(p.sizeT-p.size)*Math.min(1,l*5),x.scale.setScalar(p.size),x.position.y=(p.size-1)*.12,p.spin+=(p.spinT-p.spin)*Math.min(1,l*1.2),Math.abs(p.spin)>.001&&(x.rotation.y+=l*p.spin),p.turnT!=null){let y=p.turnT-x.rotation.y;x.rotation.y+=y*Math.min(1,l*3.5),Math.abs(y)<.003&&(x.rotation.y=p.turnT,p.turnT=null)}p.ex+=(p.exT-p.ex)*Math.min(1,l*(T?20:3)),Ci.card&&(Ci.card.mesh.position.x=Math.max(.62,((J.reach||.4)+p.ex*.2)*p.size+.26))}function qf(){let l=(y,f)=>{let A=y.clone();return A.length()<.02&&A.set(Math.cos(f*2.4),.35,Math.sin(f*2.4)),A.normalize().add(new N(0,.3*Math.sin(f*2.4+1),.55*Math.cos(f*2.4))),A.y=Math.max(-.2,A.y),A.normalize()};if(J.spec?.kind==="sketch"){if(kn.parts.length<2)return!1;let y=new N,f=kn.parts.map(A=>new N(...A.s.points.length?A.s.points.reduce((G,F)=>[G[0]+F[0]/A.s.points.length,G[1]+F[1]/A.s.points.length,G[2]+F[2]/A.s.points.length],[0,0,0]):A.s.center));return f.forEach(A=>y.add(A)),y.multiplyScalar(1/f.length),kn.parts.forEach((A,G)=>{A.exDir=l(f[G].sub(y),G)}),!0}let p=J.nodes.filter(y=>!y.parent);if(p.length<2||!["model","map"].includes(J.spec?.kind))return!1;let x=new N;return p.forEach(y=>x.add(y.base)),x.multiplyScalar(1/p.length),p.forEach(y=>{y.exDir=l(y.base.clone().sub(x),y.i)}),!0}function Yf(l){if(!J.open||!J.spec)return"";let p=J.view;return l==="spin"?(p.spinT=.7,p.turnT=null,"spin"):l==="still"?(p.spinT=0,p.spin=0,"still"):l==="around"?(p.spinT=0,p.spin=0,p.turnT=J.stage.rotation.y+Math.PI,"around"):l==="bigger"?(p.sizeT=Math.min(2.4,p.sizeT*1.4),p.sizeT>=2.4?"biggest":"bigger"):l==="smaller"?(p.sizeT=Math.max(.45,p.sizeT/1.4),p.sizeT<=.45?"smallest":"smaller"):l==="apart"?qf()?(p.exT=1,"apart"):"no-parts":l==="together"?(p.exT=0,"together"):""}function Zf(l,p){J.step=p??J.step,J.focus=Array.isArray(l)&&l.length?new Set(l):null,qs()}function dc(){zr(),Vr(),we.group.visible=!1,J.open=!1,J.spec=null,J.group.visible=!1,e.holoClosed?.(),C.userData.placed==="holo"&&(xt.open?(C.userData.placed=!1,w("pc")):Zs())}let Fn={group:null,sky:null,parts:null,dots:null,kind:"none",made:[],t0:0,spec:null};function fc(){if(!Fn.group)return!1;h.remove(Fn.group);for(let l of Fn.made)try{l.dispose()}catch{}return Object.assign(Fn,{group:null,sky:null,parts:null,dots:null,made:[],spec:null}),!0}function $f(l){fc();let p=ft=>(Fn.made.push(ft),ft),x=ft=>new jt(ft),y=new We;y.position.set(Ot.x,Et,Ot.z),y.rotation.y=pe;let f=new ce(p(new Dn(36,48,24)),p(new dn({side:Sn,transparent:!0,depthWrite:!0,uniforms:{top:{value:x(l.sky.top)},mid:{value:x(l.sky.horizon)},low:{value:x(l.sky.bottom)},fade:{value:T?1:0}},vertexShader:"varying vec3 vW; void main(){ vW = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`uniform vec3 top; uniform vec3 mid; uniform vec3 low; uniform float fade; varying vec3 vW;
void main(){ float h = vW.y; vec3 c = h < 0.0 ? mix(mid, low, clamp(-h * 3.0, 0.0, 1.0)) : mix(mid, top, clamp(pow(h, 0.7) * 1.3, 0.0, 1.0));
  gl_FragColor = vec4(c, fade);
  #include <colorspace_fragment>
}`})));f.renderOrder=-9,y.add(f);let A=new va(x(l.sky.top),x(l.ground.color),1.1),G=new Ma(x(l.light),1.4);G.position.set(6,10,4),y.add(A,G);let F=l.ground.kind;if(F!=="none"){let ft;if(F==="dunes"||F==="rock"||F==="snow"){ft=new Ui(68,68,64,64);let fe=ft.attributes.position;for(let Re=0;Re<fe.count;Re++){let tn=fe.getX(Re),Gt=fe.getY(Re),le=Math.hypot(tn,Gt),ke=F==="dunes"?.55:F==="rock"?.35:.2;fe.setZ(Re,le<3?0:ke*Math.min(1,(le-3)/6)*(Math.sin(tn*.45)*Math.cos(Gt*.38)+.5*Math.sin((tn+Gt)*.9)))}ft.computeVertexNormals()}else ft=new Bs(34,72);p(ft);let Jt=p(F==="water"?new $i({color:x(l.ground.color),transparent:!0,opacity:.92,emissive:x(l.ground.color),emissiveIntensity:.25}):F==="clouds"?new $i({color:x(l.ground.color),transparent:!0,opacity:.85}):new $i({color:x(l.ground.color),flatShading:F!=="grass"&&F!=="grid"})),ie=new ce(ft,Jt);if(ie.rotation.x=-Math.PI/2,ie.position.y=F==="clouds"?-.4:.002,ie.renderOrder=-8,y.add(ie),F==="grid"){let fe=[];for(let Re=-30;Re<=30;Re+=1.5)fe.push(Re,.01,-30,Re,.01,30,-30,.01,Re,30,.01,Re);y.add(new Us(p(new Ie().setAttribute("position",new se(fe,3))),p(new ei({color:x(l.light),transparent:!0,opacity:.55}))))}}let $=new We,W={},X=(ft,Jt)=>W[ft]||(W[ft]=p(Jt())),nt={near:[4,9],mid:[9,17],far:[18,30]};for(let ft of l.shapes){let Jt=p(new $i({color:x(ft.color),flatShading:!0})),ie=p(new rn({color:x(ft.color)})),fe=p(new $i({color:x(ft.color).multiplyScalar(.35),flatShading:!0})),Re=ft.kind==="mountain"?nt.far:ft.kind==="planet"||ft.kind==="moon"?[22,30]:nt[ft.spread];for(let tn=0;tn<ft.count;tn++){let Gt=tn/ft.count*Math.PI*2+Math.random()*.9,le=Re[0]+Math.random()*(Re[1]-Re[0]);Math.abs(Math.atan2(Math.sin(Gt),Math.cos(Gt)))<.65&&le<12&&ft.kind!=="lantern"&&(le+=7);let ye=ft.size*(.75+Math.random()*.5),hn=new We,Pe=(Hn,$s,_c=0,cp=1,hp=1,up=1)=>{let Ya=new ce(Hn,$s);return Ya.position.y=_c,Ya.scale.set(cp,hp,up),hn.add(Ya),Ya};if(ft.kind==="tree")Pe(X("trunk",()=>new hi(.06,.09,.7,6)),fe,.35),Pe(X("blob",()=>new fs(.45,0)),Jt,.95);else if(ft.kind==="pine")Pe(X("trunk",()=>new hi(.06,.09,.7,6)),fe,.3),Pe(X("cone",()=>new us(.42,1.3,7)),Jt,1.05);else if(ft.kind==="palm")Pe(X("stem",()=>new hi(.04,.07,1.9,6)),fe,.95),Pe(X("blob",()=>new fs(.45,0)),Jt,1.95,1.4,.35,1.4);else if(ft.kind==="rock")Pe(X("rock",()=>new ha(.4,0)),Jt,.15,1,.6,1);else if(ft.kind==="crystal")Pe(X("crystal",()=>new pa(.3,0)),ie,.7,.8,2.3,.8);else if(ft.kind==="pillar")Pe(X("pillar",()=>new hi(.25,.3,3,10)),Jt,1.5);else if(ft.kind==="tower")Pe(X("tower",()=>new Mi(1,6,1)),Jt,3);else if(ft.kind==="mountain")Pe(X("mountain",()=>new us(6,8,7)),Jt,4);else if(ft.kind==="arch")Pe(X("arch",()=>new ms(1.2,.15,8,24,Math.PI)),Jt,0);else if(ft.kind==="lantern")Pe(X("lantern",()=>new Dn(.12,12,8)),ie,1.3);else if(ft.kind==="cloud"){let Hn=X("puff",()=>new fs(.7,1));Pe(Hn,Jt,0,1.4,.8,1);let $s=Pe(Hn,Jt,.15,1,.7,1);$s.position.x=.9;let _c=Pe(Hn,Jt,.1,1.1,.75,1);_c.position.x=-.9}else(ft.kind==="planet"||ft.kind==="moon")&&Pe(X(ft.kind,()=>new Dn(ft.kind==="planet"?3:1.5,32,20)),ft.kind==="moon"?ie:Jt,0);hn.scale.setScalar(ye);let fi=ft.kind==="planet"||ft.kind==="moon"?10+Math.random()*10:ft.kind==="cloud"?6+Math.random()*5:0,Gn=ft.float&&fi===0?.8+Math.random()*2.5:0;hn.position.set(Math.sin(Gt)*le,fi+Gn,-Math.cos(Gt)*le),hn.rotation.y=Math.random()*Math.PI*2,hn.userData={bob:ft.float||ft.kind==="cloud"||ft.kind==="lantern"?Math.random()*6:-1,y:hn.position.y},$.add(hn)}}T||$.scale.setScalar(.001),y.add($);let ct=l.particles.kind,Tt=null;if(ct!=="none"){let ft=Math.round(ct==="stars"?500+700*l.particles.amount:150+900*l.particles.amount),Jt=new Float32Array(ft*3),ie=new Float32Array(ft);for(let Re=0;Re<ft;Re++){if(ct==="stars"){let tn=Math.random()*Math.PI*2,Gt=Math.random()*.9+.08,le=33;Jt.set([Math.cos(tn)*Math.sqrt(1-Gt*Gt)*le,Gt*le,Math.sin(tn)*Math.sqrt(1-Gt*Gt)*le],Re*3)}else{let tn=Math.random()*Math.PI*2,Gt=1.2+Math.sqrt(Math.random())*13;Jt.set([Math.cos(tn)*Gt,Math.random()*9,Math.sin(tn)*Gt],Re*3)}ie[Re]=Math.random()*100}let fe={stars:.09,snow:.05,rain:.03,fireflies:.07,embers:.05,bubbles:.08,petals:.06,dust:.03}[ct];Tt=new Fs(p(new Ie().setAttribute("position",new se(Jt,3))),p(new cs({color:x(l.particles.color),size:fe,transparent:!0,opacity:ct==="dust"?.5:.9,depthWrite:!1,blending:ct==="fireflies"||ct==="embers"||ct==="stars"?Ye:ys}))),Tt.userData.seed=ie,y.add(Tt)}h.add(y),Object.assign(Fn,{group:y,sky:f,parts:$,dots:Tt,kind:ct,t0:performance.now(),spec:l}),ge(l.title,5e3)}function Jf(l,p){if(!Fn.group)return;let x=(p-Fn.t0)/1e3;if(!T){Fn.sky.material.uniforms.fade.value=Math.min(1,x/1.2);let W=Math.max(0,Math.min(1,(x-.5)/1.4));Fn.parts.scale.setScalar(Math.max(.001,1-(1-W)**3));for(let X of Fn.parts.children)X.userData.bob>=0&&(X.position.y=X.userData.y+Math.sin(p/1600+X.userData.bob)*.15)}let y=Fn.dots;if(!y||T||Fn.kind==="stars")return;let f=y.geometry.attributes.position,A=y.userData.seed,G=Fn.kind,F=p/1e3,$={snow:-.5,rain:-7,fireflies:0,embers:.7,bubbles:.45,petals:-.35,dust:.03}[G]??0;for(let W=0;W<f.count;W++){let X=f.getY(W)+$*l*(.7+A[W]%1*.6);if(X<0?X+=9:X>9&&(X-=9),f.setY(W,X),G!=="rain"){let nt=A[W];f.setX(W,f.getX(W)+Math.sin(F*.6+nt)*l*(G==="fireflies"?.35:.12)),f.setZ(W,f.getZ(W)+Math.cos(F*.5+nt*1.3)*l*(G==="fireflies"?.35:.12))}}f.needsUpdate=!0,G==="fireflies"&&(y.material.opacity=.6+.35*Math.sin(F*2.1))}let Ge={card:Ze(.2,.09),until:0,total:0,words:"",shown:"",doneAt:0};Ge.card.mesh.visible=!1,Ge.card.mesh.position.set(.36,.1,.01),C.add(Ge.card.mesh),u(Ge.card.tex);function pc(l){let{ctx:p,w:x,h:y}=Ge.card,f=l<=0;Un(p,x,y,40,f?{hot:!0}:{});let A=Math.max(0,Math.ceil(l/1e3)),G=Math.floor(A/3600),F=Math.floor(A%3600/60),$=A%60,W=f?"Time's up":(G?G+":"+String(F).padStart(2,"0"):String(F))+":"+String($).padStart(2,"0");_e(p,"Timer \xB7 "+Ge.words,34,56,26,en,600,"left",ze,"0.02em"),_e(p,W,34,y-40,f?56:72,f?Tn:Be,600,"left",ze);let X=Ge.total?Math.max(0,Math.min(1,l/Ge.total)):0;p.fillStyle="rgba(255,255,255,0.1)",p.fillRect(34,y-22,x-68,4),p.fillStyle=Tn,p.fillRect(34,y-22,(x-68)*X,4),Ai(p,"close",x-52,52,40,en,7),Ge.card.update()}function Kf(l,p){Object.assign(Ge,{until:performance.now()+l,total:l,words:p||"",shown:"",doneAt:0}),Ge.card.mesh.visible=!0,pc(l)}function mc(){let l=Ge.until>0;return Ge.until=0,Ge.doneAt=0,Ge.card.mesh.visible=!1,l}St(Ge.card.mesh,{tap:()=>mc(),drag:()=>C,dropped:()=>{C.userData.placed=!0}});function jf(l){if(!Ge.until)return;let p=Ge.until-l;if(p>0){let x=String(Math.ceil(p/1e3));x!==Ge.shown&&(Ge.shown=x,pc(p));return}Ge.doneAt?l-Ge.doneAt>15e3&&mc():(Ge.doneAt=l,pc(0),ge("Time's up: your "+Ge.words+" timer.",12e3),e.speak?.("Time's up! Your "+Ge.words+" timer is done."))}let Wa=[["Breathe in\u2026",4e3],["Hold\u2026",4e3],["Breathe out\u2026",6e3]],Jn={on:!1,t0:0,rounds:0,phase:-1,grow:0};function Qf(l=4){Object.assign(Jn,{on:!0,t0:performance.now(),rounds:l,phase:-1})}function nu(l){Jn.on&&(Jn.on=!1,q.reply=l||"",_t())}function tp(l){if(!Jn.on){Jn.grow+=(0-Jn.grow)*.08;return}let p=14e3,x=l-Jn.t0,y=Math.floor(x/p);if(y>=Jn.rounds){nu("Nicely done. How do you feel?"),e.speak?.("Nicely done. How do you feel?");return}let f=x%p,A=0;for(;f>Wa[A][1];)f-=Wa[A][1],A++;let G=f/Wa[A][1],F=W=>.5-Math.cos(Math.PI*W)/2;Jn.grow=A===0?F(G):A===1?1:1-F(G);let $=y*3+A;$!==Jn.phase&&(Jn.phase=$,q.reply=Wa[A][0]+"  "+(y+1)+" of "+Jn.rounds,q.stage="",_t())}let iu=new N;function ep(l,p){if(!J.open)return;if(Cf(l,p),Kh.value=p/1e3,J.building){J.building.rotation.y+=l*1.4,J.building.rotation.x=.5;return}if(Xf(l),J.spec?.kind==="sketch"){Uf(l,p);let f=J.view.ex;for(let A of kn.parts)A.exDir&&A.g.position.copy(A.exDir).multiplyScalar(f*.17);return}if(J.spec?.kind==="globe"){zf(l,p);return}if(J.spec?.kind==="sim"){Hf(l,p);return}let x=p-J.t0;for(let f of J.nodes){let A=T?1:Math.max(0,Math.min(1,(x-f.i*110)/520));f.shown=T?1:1-(1-A)**3,f.parent?(T||(f.angle+=l*f.speed),iu.set(Math.cos(f.angle)*f.orbitR,Math.sin(f.angle)*f.orbitR*.22,Math.sin(f.angle)*f.orbitR*.85),f.g.position.copy(f.parent.g.position).add(iu),f.ring.position.copy(f.parent.g.position)):(f.g.position.set(f.base.x,f.base.y+(T?0:Math.sin(p/1400+f.i)*.004),f.base.z),f.exDir&&J.view.ex>.001&&f.g.position.addScaledVector(f.exDir,J.view.ex*.2));let G=J.focus?J.focus.has(f.i)?1.18:.32:f.hot?1.1:1;f.emph+=(G-f.emph)*Math.min(1,l*6);let F=Math.min(1,f.emph);f.g.scale.setScalar(Math.max(.001,f.shown*(f.emph>1?f.emph:1))),f.mat.uniforms?f.mat.uniforms.opacity.value=.82*F:f.mat.opacity=.82*F,f.shell&&(f.shell.material.opacity=.3*F*(f.hot?1.6:1),T||(f.shell.rotation.y+=l*.5,f.shell.rotation.x+=l*.17)),f.glow.material.opacity=.5*F*(f.hot?1.4:1),f.label.mesh.material.opacity=Math.max(.25,F)}let y=T?1:Math.max(0,Math.min(1,(x-J.nodes.length*110)/500));for(let f of J.links){if(!f.a)continue;let A=f.line.geometry.attributes.position;A.setXYZ(0,f.a.g.position.x,f.a.g.position.y,f.a.g.position.z),A.setXYZ(1,f.b.g.position.x,f.b.g.position.y,f.b.g.position.z),A.needsUpdate=!0;let G=J.focus?J.focus.has(f.a.i)&&J.focus.has(f.b.i)?.7:.12:.45;if(f.line.material.opacity=G*y,f.pulse){let F=T?.5:(p/1200+f.off)%1;f.pulse.position.lerpVectors(f.a.g.position,f.b.g.position,F);let $=J.focus?G>.5?1:.1:.55;f.pulse.material.opacity=(T?.4:Math.sin(Math.PI*F))*$*y,f.pulse.scale.setScalar(J.focus&&G>.5?.075:.05)}}}function np(){if(!xt.open||!xt.live)return null;let l=xt.screen,p=Math.min(1,1600/Math.max(l.w,l.h)),x=document.createElement("canvas");x.width=Math.max(1,Math.round(l.w*p)),x.height=Math.max(1,Math.round(l.h*p)),x.getContext("2d").drawImage(l.canvas,0,0,x.width,x.height);let y=x.toDataURL("image/jpeg",.85);return{b64:y.slice(y.indexOf(",")+1),url:y,w:x.width,h:x.height}}let Ys=[];function su(l){ee(l.c.mesh),ee(l.x.mesh),h.remove(l.group);for(let x of[l.c,l.x])x.tex.dispose(),x.mesh.geometry.dispose(),x.mesh.material.dispose();let p=Ys.indexOf(l);p>=0&&Ys.splice(p,1)}function ru(l,p,x=!1,y=""){if(!x){let X=e.notes.add(l,y);p=X[X.length-1]?.at??Date.now();let nt=new Set(X.map(ct=>ct.at));for(let ct of[...Ys])nt.has(ct.at)||su(ct)}let f=new We,A=Ze(.3,.19),G=Ze(.04,.04);{let{ctx:X,w:nt,h:ct}=A;Un(X,nt,ct,44),Ai(X,"pin",62,66,34,en,7),X.font=`600 28px ${ze}`,_e(X,y?An(X,"Pinned \xB7 "+y,nt-140):"Pinned",88,76,28,en,600,"left",ze,"0.02em");let Tt=(ie,fe)=>(X.font=`500 ${fe}px ${an}`,X.measureText(ie).width),ft=a.fitLines(l,nt-96,6,34,22,Tt),Jt=92;for(let ie of ft.lines)_e(X,ie,48,Jt+=ft.size*1.32,ft.size,Be,500);A.update(),_f(G,"close")}G.mesh.position.set(.135,.08,.004),f.add(A.mesh,G.mesh),h.add(f);let F=new Set(Ys.map(X=>X.slot)),$=0;for(;F.has($);)$++;let W={group:f,c:A,x:G,at:p,text:l,slot:$};Ys.push(W),St(A.mesh,{tap:()=>e.resume?e.resume({text:l,ask:y}):e.speak(l),drag:()=>f}),St(G.mesh,{tap:()=>{su(W),e.notes.remove(p)}}),Xa?au(W):f.visible=!1}function au(l){let p=l.slot,x=pe-1.1-p%4*.42,y=.95,f=Math.floor(p/4);l.group.position.set(Ot.x-Math.sin(x)*y,Ot.y-.05+f*.24-p%2*.05,Ot.z-Math.cos(x)*y),Mt(l.group),l.group.visible=!0}let Xa=!1;function ip(){let l=s?d:o.xr.getCamera();Ot.setFromMatrixPosition(l.matrixWorld),de.setFromRotationMatrix(l.matrixWorld),Ee.set(0,0,-1).applyQuaternion(de),Math.hypot(Ee.x,Ee.z)>.15&&(pe=Math.atan2(-Ee.x,-Ee.z))}function sp(){C.position.set(Ot.x-Math.sin(pe)*.75,Ot.y-.1,Ot.z-Math.cos(pe)*.75),Mt(C),C.visible=!0,Xa=!0,M=performance.now(),Ys.forEach(au)}function rp(l){if(!M||g)return;let p=T?1:v((l-M)/1100),x=T?1:v((l-M-350)/600);H.scale.multiplyScalar(.3+.7*p),Y.opacity+=(1-p)*.45;let y=T?1:Math.min(1,(l-M)/1500);ht.visible=y<1,y<1&&(dt.opacity=.8*(1-y)*(1-y),ht.scale.setScalar(.9+v(y)*1.6));for(let f of m)f.opacity=x;p>=1&&x>=1&&y>=1&&(g=!0)}let Kn=null;function ap(l){if($e.some(p=>p.press?.drag===C)){Kn=null;return}if(!C.userData.placed){let p=a.followTarget({x:Ot.x,y:Ot.y,z:Ot.z,yaw:pe},C.position);p&&(Kn=p)}if(Kn){let p=1-Math.exp(-l*2.6);C.position.x+=(Kn.x-C.position.x)*p,C.position.y+=(Kn.y-C.position.y)*p,C.position.z+=(Kn.z-C.position.z)*p,Math.hypot(Kn.x-C.position.x,Kn.y-C.position.y,Kn.z-C.position.z)<.02&&(Kn=null)}Mt(C)}function Zs(){C.userData.placed=!1,Kn={x:Ot.x-Math.sin(pe)*.75,y:Ot.y-.1,z:Ot.z-Math.cos(pe)*.75}}let ou={listening:6220500,thinking:10980346,speaking:16020150};function op(l,p){let x=.06+Math.sin(p*1.4)*.02;q.state==="listening"?x=Math.max(.12,q.mic):q.state==="thinking"?x=.28:q.state==="speaking"&&(x=.34+.36*Math.abs(Math.sin(p*7.3)*Math.sin(p*3.1+1))),q.energy+=(x-q.energy)*Math.min(1,l*8),q.think+=((q.state==="thinking"?1:0)-q.think)*Math.min(1,l*3),O.uniforms.uTime.value=p,O.uniforms.uEnergy.value=q.energy,O.uniforms.uThink.value=q.think,D.uniforms.uTime.value=T?.6:p,D.uniforms.uEnergy.value=q.energy,D.uniforms.uState.value=ff[q.state]??0,D.uniforms.uPulse.value=q.state==="thinking"?.22+q.energy*.3:0;let y=(1+Math.sin(p*1.7)*.012+q.energy*.1)*(q.hovered?1.06:1)*(1+Jn.grow*.45);H.scale.setScalar(y),Y.opacity=.1+q.energy*.36,Y.color.setHex(ou[q.state]||I),Q.scale.setScalar(.4+q.energy*.12);let f=q.state==="listening"||q.state==="thinking";z.opacity+=((f?.6:0)-z.opacity)*Math.min(1,l*6),z.color.setHex(ou[q.state]||6220500),tt.rotation.z-=l*(q.state==="thinking"?4:.8),tt.scale.setScalar(1+(q.state==="listening"?q.mic*.25:0)),lp(l,p)}let qa=(()=>{let l=u(new Ui(.008,1)),p=u(new rn({color:6220500,transparent:!0,opacity:0,depthWrite:!1,blending:Ye})),x=[];for(let y of[-1,1])for(let f=0;f<4;f++){let A=new ce(l,p);A.position.set(y*(.142+f*.016),0,.01),A.userData={k:f,phase:Math.random()*6,h:.004},A.scale.y=.004,C.add(A),x.push(A)}return{bars:x,mat:p}})();function lp(l,p){let x=q.state==="listening";if(qa.mat.opacity+=((x?.9:0)-qa.mat.opacity)*Math.min(1,l*8),!(qa.mat.opacity<.01))for(let y of qa.bars){let{k:f,phase:A}=y.userData,G=T?.6:.55+.45*Math.abs(Math.sin(p*(7+f*1.7)+A)),F=x?.006+q.mic*.07*(1-f*.18)*G:.004;y.userData.h+=(F-y.userData.h)*Math.min(1,l*14),y.scale.y=Math.max(.004,y.userData.h)}}function gc(){let l=q.state;l==="listening"?wt.set("done","Done"):l==="speaking"?wt.set("quiet","Quiet"):l==="thinking"?wt.set("think","Working"):wt.set("mic","Talk");let p=!!e.calling?.();p!==Lt.shown&&(Lt.shown=p,Bt()),Zn.setOn(ot.open),si.setOn(xt.open);let x=As&&(l===""||l==="listening")&&!!e.ready?.();for(let y of Ts)y.c.mesh.visible=x}let lu=performance.now(),cu=0,hu=0,uu=!1,du=0,fu=new Map;o.setAnimationLoop(()=>{let l=performance.now(),p=Math.min(.05,(l-lu)/1e3);lu=l,cu+=p,hu++,s&&(d.rotation.set(Kt,re,0,"YXZ"),d.updateMatrixWorld()),ip(),!Xa&&hu>3&&sp(),Xa&&ap(p),op(p,cu),rp(l),ep(p,l),Jf(p,l),jf(l),tp(l);for(let x of $e){if(!k(x))continue;let y=x.hit,f=y?.object.userData.ui||null;f!==x.hover&&(x.hover?.hover?.(!1),f?.hover?.(!0),f&&V(x,.12,10),x.hover=f),x.dot.visible=!!y,y&&(x.dot.position.copy(y.point).addScaledVector(x.dir,-.003),x.dot.lookAt(x.origin)),x.line&&(x.line.scale.z=y?y.distance:1.2);let A=x.press;if(A?.turn){let F=A.direct?Z(x,he):x.origin.clone().addScaledVector(x.dir,A.dist);!A.moved&&F.distanceTo(A.start)>(A.direct?.012:.03)&&(A.moved=!0),A.moved&&Wf(A,F,l)}else if(A?.direct)Z(x,he),!A.moved&&he.distanceTo(A.start)>.012&&(A.moved=!0),A.moved&&(A.drag.position.copy(he).add(A.offset),Mt(A.drag));else if(A?.drag){let F=x.origin.clone().addScaledVector(x.dir,A.dist);!A.moved&&F.distanceTo(A.start)>.03&&(A.moved=!0),A.moved&&(A.drag.position.copy(F).add(A.offset),Mt(A.drag))}let G=x.source?.gamepad;if(G){let F=G.axes[3]??0;Math.abs(F)>.45&&f?.scroll&&l-x.scrollAt>140&&(f.scroll(Math.sign(F)*(Math.abs(F)>.85?3:1)),x.scrollAt=l);let $=fu.get(x)||[],W=!!G.buttons[4]?.pressed,X=!!G.buttons[5]?.pressed;W&&!$[0]&&Ct(x),!W&&$[0]&&pt(x,l-(x.holdAt||l)),X&&!$[1]&&Zs(),fu.set(x,[W,X])}}if(mt)for(let x=0;x<2;x++){let y=o.xr.getHand(x);for(let f of Object.values(y.joints||{}))if(!f.userData.dot){let A=new ce(mt.jointGeo,mt.jointMat);f.add(A),f.userData.dot=A}}if(Nt.anim){let x=(l-Nt.t0)/(650*Math.max(1,Nt.marks.length));Ei(Math.min(1,x)),x>=1&&(Nt.anim=!1)}for(let x=B.length-1;x>=0;x--){let y=B[x],f=(l-y.t0)/350;y.m.scale.setScalar(1+f*1.6),y.m.material.opacity=Math.max(0,.9*(1-f)),f>=1&&(h.remove(y.m),y.m.material.dispose(),B.splice(x,1))}l-du>200&&(du=l,gc()),o.render(h,d)});let Cs=null;if(s){Zt=!0,Cs=document.createElement("div"),Cs.setAttribute("role","status"),Object.assign(Cs.style,{position:"fixed",top:"max(12px, env(safe-area-inset-top))",left:"50%",transform:"translateX(-50%)",zIndex:"2147483001",display:"flex",flexWrap:"wrap",justifyContent:"center",gap:"8px 10px",alignItems:"center",padding:"8px 8px 8px 16px",borderRadius:"24px",background:"rgba(18,20,27,.9)",color:Be,font:`500 14px ${an}`,border:"1px solid rgba(255,255,255,.14)",width:"max-content",maxWidth:"calc(100vw - 32px)",boxSizing:"border-box"});let l=document.createElement("span");l.textContent="3D preview \xB7 click the orb to talk, drag to look",Object.assign(l.style,{color:en,textAlign:"center",flex:"1 1 auto"});let p=(x,y)=>{let f=document.createElement("button");return f.type="button",f.textContent=x,Object.assign(f.style,{font:`600 14px ${an}`,color:Be,background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.12)",borderRadius:"999px",padding:"8px 14px",cursor:"pointer",whiteSpace:"nowrap"}),f.onclick=y,f};Cs.append(l,p("Talk",()=>e.tapOrb()),p("Photos",Ne),p("My PC",$t),p("Pin",Wt),p("Style",Te),p("Leave",()=>Gr())),qt=document.createElement("span"),qt.setAttribute("aria-live","polite"),Object.assign(qt.style,{position:"absolute",width:"1px",height:"1px",overflow:"hidden",clip:"rect(0 0 0 0)",whiteSpace:"nowrap"}),Cs.append(qt),document.body.appendChild(Cs)}else st(t,"end",()=>Gr());function Gr(){if(!uu){if(uu=!0,Es(),ve(),uc(),dc(),fc(),clearTimeout(xe),o.setAnimationLoop(null),!s)try{t.end()}catch{}for(let l of At)try{l()}catch{}Cs?.remove(),c.remove(),h.traverse(l=>{l.geometry?.dispose?.();let p=l.material;if(p)for(let x of Array.isArray(p)?p:[p])x.map?.dispose?.(),x.dispose?.()});for(let l of _)try{l.dispose?.()}catch{}o.dispose(),e.exited()}}return _t(),di(),{orb(l){let p=l||"";p!==q.state&&(q.state=p,p==="listening"&&(q.hint="",q.stage=""),p===""&&(q.stage=""),_t(),gc())},heard(l){let p=String(l||"");p!==q.you&&(q.you=p,p&&p!=="\u2026"&&(q.reply=""),q.hint="",_t())},said(l){let p=String(l||"");!p||p===q.reply||(q.reply=p,q.stage="",_t())},line(l,p,x){let y=String(p||"");y&&(l==="me"?(q.you=y,q.reply="",q.hint="",As&&Hs()):l==="izuki"&&(x?.thinking?q.stage=y:(q.reply=y,q.stage="")),_t())},level(l){q.mic=Math.max(0,Math.min(1,Number(l)||0))},showLook:Ba,lookShown:()=>Nt.group.visible,pin:ru,comeHere:Zs,pcOpen:Va,pcTarget:()=>xt.open?xt.target:null,pcClose:Es,pcShown:()=>xt.open,pcFrame:np,filesOpen:vn,filesClose:ve,webSearch:Sf,webClose:uc,webShown:()=>ut.open,holoBuilding:Rf,holoShow:Lf,holoFocus:Zf,holoClose:dc,holoShown:()=>J.open,holoPhoto:Ff,globeShow:Bf,globeMark:kf,simShow:Gf,holoView:Yf,holoViewNow:()=>({...J.view,yaw:J.stage.rotation.y}),simShown:()=>J.open&&J.spec?.kind==="sim",simProbe:()=>je.st?{...je.st,type:je.spec?.type}:null,dreamShow:$f,dreamClose:fc,dreamShown:()=>!!Fn.group,timerStart:Kf,timerStop:mc,breathe:Qf,breatheStop:()=>nu(""),nextTheme:b,notice:ge,stop:Gr}}function $x(i,t){let e={uLow:{value:new jt},uMid:{value:new jt},uTop:{value:new jt},uBand:{value:new jt},uBandAmt:{value:0}},n=new ce(new Dn(40,48,24),new dn({side:Sn,depthWrite:!1,uniforms:e,vertexShader:"varying vec3 vW; void main(){ vW = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`varying vec3 vW;
      uniform vec3 uLow; uniform vec3 uMid; uniform vec3 uTop; uniform vec3 uBand; uniform float uBandAmt;
      void main(){
        float h = vW.y;
        vec3 c = h < 0.0 ? mix(uMid, uLow, clamp(-h * 2.5, 0.0, 1.0)) : mix(uMid, uTop, clamp(h * 1.6, 0.0, 1.0));
        // The horizon glow: brightest at eye level, fading up and down.
        c += uBand * exp(-abs(h) * 7.0) * uBandAmt;
        gl_FragColor = vec4(c, 1.0);
      }`}));n.renderOrder=-10,i.add(n);let s=320,r=new Float32Array(s*3);for(let M=0;M<s;M++){let T=Math.random()*Math.PI*2,v=Math.random()*.85+.12,g=30;r[M*3]=Math.cos(T)*Math.sqrt(1-v*v)*g,r[M*3+1]=v*g,r[M*3+2]=Math.sin(T)*Math.sqrt(1-v*v)*g}let a=new Fs(new Ie().setAttribute("position",new se(r,3)),new cs({color:14674165,size:.05,transparent:!0,opacity:.5,depthWrite:!1}));i.add(a);let o=document.createElement("canvas");o.width=o.height=2048;let c=o.getContext("2d"),h=1024,d=1024/3.2,_=c.createRadialGradient(h,h,0,h,h,1024);_.addColorStop(0,"rgba(255,255,255,0.10)"),_.addColorStop(.5,"rgba(255,255,255,0.03)"),_.addColorStop(1,"rgba(255,255,255,0)"),c.fillStyle=_,c.fillRect(0,0,2048,2048);for(let M=.4;M<=3.2+1e-6;M+=.4){let T=M/3.2;c.beginPath(),c.arc(h,h,M*d,0,Math.PI*2),c.lineWidth=2.2-T,c.strokeStyle=`rgba(255,255,255,${(.34*(1-T)+.04).toFixed(3)})`,c.stroke()}let u=new Os(o);u.colorSpace=mn,u.anisotropy=$h;let m=new ce(new Bs(3.2,128),new rn({map:u,transparent:!0,depthWrite:!1}));return m.rotation.x=-Math.PI/2,m.position.y=t,i.add(m),{set(M){e.uLow.value.setRGB(...M.low),e.uMid.value.setRGB(...M.mid),e.uTop.value.setRGB(...M.top),e.uBand.value.setRGB(...M.band),e.uBandAmt.value=M.bandAmt,a.material.opacity=M.stars,a.visible=M.stars>.02,m.material.color.setRGB(...M.floor)}}}var Fa=[{name:"Nova",orb:[[.18,.83,.75],[.55,.36,.96],[.96,.45,.71]],halo:8246268,low:[.008,.01,.014],mid:[.03,.036,.05],top:[.012,.014,.022],band:[.08,.2,.2],bandAmt:.55,stars:.5,floor:[.6,1,.95]},{name:"Midnight",orb:[[.25,.5,1],[.4,.75,1],[.75,.85,1]],halo:9684477,low:[.006,.01,.02],mid:[.02,.04,.08],top:[.008,.014,.03],band:[.1,.16,.32],bandAmt:.6,stars:.6,floor:[.7,.82,1]},{name:"Aurora",orb:[[.25,.92,.6],[.2,.75,.9],[.55,.45,.95]],halo:7268279,low:[.006,.012,.012],mid:[.02,.045,.045],top:[.01,.018,.022],band:[.08,.3,.18],bandAmt:.7,stars:.5,floor:[.6,1,.8]},{name:"Dawn",orb:[[1,.7,.52],[.92,.55,.62],[1,.86,.66]],halo:16701354,low:[.012,.009,.01],mid:[.06,.04,.045],top:[.02,.016,.026],band:[.32,.16,.1],bandAmt:.55,stars:.2,floor:[1,.85,.75]},{name:"Pearl",light:!0,orb:[[.86,.88,.96],[.7,.76,.92],[.94,.88,.92]],halo:14870768,low:[.42,.44,.48],mid:[.66,.68,.73],top:[.8,.81,.85],band:[.06,.06,.07],bandAmt:.4,stars:0,floor:[.2,.22,.28]}];export{nS as start};
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
