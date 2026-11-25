// Izuki in VR, the 3D room: built from vr-scene.src.js by tools/build-vr.cjs. Includes three.js (MIT, notice at the end).
var td=0,ah=1,nd=2;var Ta=1,id=2,Cr=3,vs=0,Sn=1,qn=2,Bi=0,ys=1,Yt=2,oh=3,lh=4,sd=5;var ks=100,rd=101,ad=102,od=103,ld=104,cd=200,hd=201,ud=202,dd=203,ch=204,hh=205,fd=206,pd=207,md=208,gd=209,_d=210,xd=211,vd=212,yd=213,Md=214,Co=0,Ro=1,Po=2,mr=3,Io=4,Lo=5,Do=6,No=7,gl=0,Sd=1,bd=2,wi=0,uh=1,dh=2,fh=3,ph=4,mh=5,gh=6,_h=7;var xh=300,Ms=301,zs=302,_l=303,xl=304,Aa=306,Uo=1e3,Di=1001,Fo=1002,Mn=1003,wd=1004;var Ea=1005;var bn=1006,vl=1007;var Ss=1008;var Yn=1009,vh=1010,yh=1011,Rr=1012,yl=1013,Ti=1014,Ai=1015,Ei=1016,Ml=1017,Sl=1018,Pr=1020,Mh=35902,Sh=35899,bh=1021,wh=1022,fi=1023,Ni=1026,bs=1027,Th=1028,bl=1029,ws=1030,wl=1031;var Tl=1033,Ca=33776,Ra=33777,Pa=33778,Ia=33779,Al=35840,El=35841,Cl=35842,Rl=35843,Pl=36196,Il=37492,Ll=37496,Dl=37488,Nl=37489,La=37490,Ul=37491,Fl=37808,Ol=37809,Bl=37810,kl=37811,zl=37812,Vl=37813,Gl=37814,Hl=37815,Wl=37816,Xl=37817,ql=37818,Yl=37819,Zl=37820,$l=37821,Jl=36492,Kl=36494,jl=36495,Ql=36283,ec=36284,Da=36285,tc=36286;var ta=2300,Oo=2301,To=2302,Jc=2303,Kc=2400,jc=2401,Qc=2402;var Td=3200;var nc=0,Ad=1,Ji="",mn="srgb",na="srgb-linear",ia="linear",Nt="srgb";var Ao=7680;var Ed=519,Cd=512,Rd=513,Pd=514,ic=515,Id=516,Ld=517,sc=518,Dd=519,Ah=35044;var Eh="300 es",yi=2e3,gr=2001;function gp(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function _p(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function _r(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Nd(){let i=_r("canvas");return i.style.display="block",i}var vu={},xr=null;function sa(...i){let e="THREE."+i.shift();xr?xr("log",e,...i):console.log(e,...i)}function Ud(i){let e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function Qe(...i){i=Ud(i);let e="THREE."+i.shift();if(xr)xr("warn",e,...i);else{let t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function nt(...i){i=Ud(i);let e="THREE."+i.shift();if(xr)xr("error",e,...i);else{let t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function Ds(...i){let e=i.join(" ");e in vu||(vu[e]=!0,Qe(...i))}function Fd(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}var Od={[Co]:Ro,[Po]:Do,[Io]:No,[mr]:Lo,[Ro]:Co,[Do]:Po,[No]:Io,[Lo]:mr},Ui=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let s=n[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}},Cn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var Sc=Math.PI/180,Bo=180/Math.PI;function as(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Cn[i&255]+Cn[i>>8&255]+Cn[i>>16&255]+Cn[i>>24&255]+"-"+Cn[e&255]+Cn[e>>8&255]+"-"+Cn[e>>16&15|64]+Cn[e>>24&255]+"-"+Cn[t&63|128]+Cn[t>>8&255]+"-"+Cn[t>>16&255]+Cn[t>>24&255]+Cn[n&255]+Cn[n>>8&255]+Cn[n>>16&255]+Cn[n>>24&255]).toLowerCase()}function Mt(i,e,t){return Math.max(e,Math.min(t,i))}function xp(i,e){return(i%e+e)%e}function bc(i,e,t){return(1-t)*i+t*e}function Li(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:case Uint8ClampedArray:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function Ot(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var Dh=class Dh{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=Mt(this.x,e.x,t.x),this.y=Mt(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=Mt(this.x,e,t),this.y=Mt(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Mt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Mt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*s+e.x,this.y=r*s+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};Dh.prototype.isVector2=!0;var ke=Dh,hi=class{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,a,o){let c=n[s+0],h=n[s+1],d=n[s+2],x=n[s+3],u=r[a+0],m=r[a+1],y=r[a+2],T=r[a+3];if(x!==T||c!==u||h!==m||d!==y){let v=c*u+h*m+d*y+x*T;v<0&&(u=-u,m=-m,y=-y,T=-T,v=-v);let _=1-o;if(v<.9995){let R=Math.acos(v),D=Math.sin(R);_=Math.sin(_*R)/D,o=Math.sin(o*R)/D,c=c*_+u*o,h=h*_+m*o,d=d*_+y*o,x=x*_+T*o}else{c=c*_+u*o,h=h*_+m*o,d=d*_+y*o,x=x*_+T*o;let R=1/Math.sqrt(c*c+h*h+d*d+x*x);c*=R,h*=R,d*=R,x*=R}}e[t]=c,e[t+1]=h,e[t+2]=d,e[t+3]=x}static multiplyQuaternionsFlat(e,t,n,s,r,a){let o=n[s],c=n[s+1],h=n[s+2],d=n[s+3],x=r[a],u=r[a+1],m=r[a+2],y=r[a+3];return e[t]=o*y+d*x+c*m-h*u,e[t+1]=c*y+d*u+h*x-o*m,e[t+2]=h*y+d*m+o*u-c*x,e[t+3]=d*y-o*x-c*u-h*m,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,c=Math.sin,h=o(n/2),d=o(s/2),x=o(r/2),u=c(n/2),m=c(s/2),y=c(r/2);switch(a){case"XYZ":this._x=u*d*x+h*m*y,this._y=h*m*x-u*d*y,this._z=h*d*y+u*m*x,this._w=h*d*x-u*m*y;break;case"YXZ":this._x=u*d*x+h*m*y,this._y=h*m*x-u*d*y,this._z=h*d*y-u*m*x,this._w=h*d*x+u*m*y;break;case"ZXY":this._x=u*d*x-h*m*y,this._y=h*m*x+u*d*y,this._z=h*d*y+u*m*x,this._w=h*d*x-u*m*y;break;case"ZYX":this._x=u*d*x-h*m*y,this._y=h*m*x+u*d*y,this._z=h*d*y-u*m*x,this._w=h*d*x+u*m*y;break;case"YZX":this._x=u*d*x+h*m*y,this._y=h*m*x+u*d*y,this._z=h*d*y-u*m*x,this._w=h*d*x-u*m*y;break;case"XZY":this._x=u*d*x-h*m*y,this._y=h*m*x-u*d*y,this._z=h*d*y+u*m*x,this._w=h*d*x+u*m*y;break;default:Qe("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],s=t[4],r=t[8],a=t[1],o=t[5],c=t[9],h=t[2],d=t[6],x=t[10],u=n+o+x;if(u>0){let m=.5/Math.sqrt(u+1);this._w=.25/m,this._x=(d-c)*m,this._y=(r-h)*m,this._z=(a-s)*m}else if(n>o&&n>x){let m=2*Math.sqrt(1+n-o-x);this._w=(d-c)/m,this._x=.25*m,this._y=(s+a)/m,this._z=(r+h)/m}else if(o>x){let m=2*Math.sqrt(1+o-n-x);this._w=(r-h)/m,this._x=(s+a)/m,this._y=.25*m,this._z=(c+d)/m}else{let m=2*Math.sqrt(1+x-n-o);this._w=(a-s)/m,this._x=(r+h)/m,this._y=(c+d)/m,this._z=.25*m}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(Mt(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=t._x,c=t._y,h=t._z,d=t._w;return this._x=n*d+a*o+s*h-r*c,this._y=s*d+a*c+r*o-n*h,this._z=r*d+a*h+n*c-s*o,this._w=a*d-n*o-s*c-r*h,this._onChangeCallback(),this}slerp(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,s=-s,r=-r,a=-a,o=-o);let c=1-t;if(o<.9995){let h=Math.acos(o),d=Math.sin(h);c=Math.sin(c*h)/d,t=Math.sin(t*h)/d,this._x=this._x*c+n*t,this._y=this._y*c+s*t,this._z=this._z*c+r*t,this._w=this._w*c+a*t,this._onChangeCallback()}else this._x=this._x*c+n*t,this._y=this._y*c+s*t,this._z=this._z*c+r*t,this._w=this._w*c+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},Nh=class Nh{constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(yu.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(yu.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,s=this.z,r=e.x,a=e.y,o=e.z,c=e.w,h=2*(a*s-o*n),d=2*(o*t-r*s),x=2*(r*n-a*t);return this.x=t+c*h+a*x-o*d,this.y=n+c*d+o*h-r*x,this.z=s+c*x+r*d-a*h,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=Mt(this.x,e.x,t.x),this.y=Mt(this.y,e.y,t.y),this.z=Mt(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=Mt(this.x,e,t),this.y=Mt(this.y,e,t),this.z=Mt(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Mt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,s=e.y,r=e.z,a=t.x,o=t.y,c=t.z;return this.x=s*c-r*o,this.y=r*a-n*c,this.z=n*o-s*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return wc.copy(this).projectOnVector(e),this.sub(wc)}reflect(e){return this.sub(wc.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(Mt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};Nh.prototype.isVector3=!0;var N=Nh,wc=new N,yu=new hi,Uh=class Uh{constructor(e,t,n,s,r,a,o,c,h){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,c,h)}set(e,t,n,s,r,a,o,c,h){let d=this.elements;return d[0]=e,d[1]=s,d[2]=o,d[3]=t,d[4]=r,d[5]=c,d[6]=n,d[7]=a,d[8]=h,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[3],c=n[6],h=n[1],d=n[4],x=n[7],u=n[2],m=n[5],y=n[8],T=s[0],v=s[3],_=s[6],R=s[1],D=s[4],E=s[7],I=s[2],P=s[5],U=s[8];return r[0]=a*T+o*R+c*I,r[3]=a*v+o*D+c*P,r[6]=a*_+o*E+c*U,r[1]=h*T+d*R+x*I,r[4]=h*v+d*D+x*P,r[7]=h*_+d*E+x*U,r[2]=u*T+m*R+y*I,r[5]=u*v+m*D+y*P,r[8]=u*_+m*E+y*U,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],h=e[7],d=e[8];return t*a*d-t*o*h-n*r*d+n*o*c+s*r*h-s*a*c}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],h=e[7],d=e[8],x=d*a-o*h,u=o*c-d*r,m=h*r-a*c,y=t*x+n*u+s*m;if(y===0)return this.set(0,0,0,0,0,0,0,0,0);let T=1/y;return e[0]=x*T,e[1]=(s*h-d*n)*T,e[2]=(o*n-s*a)*T,e[3]=u*T,e[4]=(d*t-s*c)*T,e[5]=(s*r-o*t)*T,e[6]=m*T,e[7]=(n*c-h*t)*T,e[8]=(a*t-n*r)*T,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,a,o){let c=Math.cos(r),h=Math.sin(r);return this.set(n*c,n*h,-n*(c*a+h*o)+a+e,-s*h,s*c,-s*(-h*a+c*o)+o+t,0,0,1),this}scale(e,t){return Ds("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Tc.makeScale(e,t)),this}rotate(e){return Ds("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Tc.makeRotation(-e)),this}translate(e,t){return Ds("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Tc.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}};Uh.prototype.isMatrix3=!0;var at=Uh,Tc=new at,Mu=new at().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Su=new at().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function vp(){let i={enabled:!0,workingColorSpace:na,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===Nt&&(s.r=Yi(s.r),s.g=Yi(s.g),s.b=Yi(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===Nt&&(s.r=pr(s.r),s.g=pr(s.g),s.b=pr(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Ji?ia:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return Ds("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return Ds("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[na]:{primaries:e,whitePoint:n,transfer:ia,toXYZ:Mu,fromXYZ:Su,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:mn},outputColorSpaceConfig:{drawingBufferColorSpace:mn}},[mn]:{primaries:e,whitePoint:n,transfer:Nt,toXYZ:Mu,fromXYZ:Su,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:mn}}}),i}var St=vp();function Yi(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function pr(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var Js,ko=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Js===void 0&&(Js=_r("canvas")),Js.width=e.width,Js.height=e.height;let s=Js.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=Js}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=_r("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=Yi(r[a]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Yi(t[n]/255)*255):t[n]=Yi(t[n]);return{data:t,width:e.width,height:e.height}}else return Qe("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},yp=0,vr=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:yp++}),this.uuid=as(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Ac(s[a].image)):r.push(Ac(s[a]))}else r=Ac(s);n.url=r}return t||(e.images[this.uuid]=n),n}};function Ac(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?ko.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(Qe("Texture: Unable to serialize Texture."),{})}var Mp=0,Ec=new N,In=class i extends Ui{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=Di,s=Di,r=bn,a=Ss,o=fi,c=Yn,h=i.DEFAULT_ANISOTROPY,d=Ji){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:Mp++}),this.uuid=as(),this.name="",this.source=new vr(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=h,this.format=o,this.internalFormat=null,this.type=c,this.offset=new ke(0,0),this.repeat=new ke(1,1),this.center=new ke(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new at,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=d,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Ec).x}get height(){return this.source.getSize(Ec).y}get depth(){return this.source.getSize(Ec).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){Qe(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Qe(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==xh)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Uo:e.x=e.x-Math.floor(e.x);break;case Di:e.x=e.x<0?0:1;break;case Fo:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Uo:e.y=e.y-Math.floor(e.y);break;case Di:e.y=e.y<0?0:1;break;case Fo:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};In.DEFAULT_IMAGE=null;In.DEFAULT_MAPPING=xh;In.DEFAULT_ANISOTROPY=1;var Fh=class Fh{constructor(e=0,t=0,n=0,s=1){this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r,c=e.elements,h=c[0],d=c[4],x=c[8],u=c[1],m=c[5],y=c[9],T=c[2],v=c[6],_=c[10];if(Math.abs(d-u)<.01&&Math.abs(x-T)<.01&&Math.abs(y-v)<.01){if(Math.abs(d+u)<.1&&Math.abs(x+T)<.1&&Math.abs(y+v)<.1&&Math.abs(h+m+_-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let D=(h+1)/2,E=(m+1)/2,I=(_+1)/2,P=(d+u)/4,U=(x+T)/4,b=(y+v)/4;return D>E&&D>I?D<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(D),s=P/n,r=U/n):E>I?E<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(E),n=P/s,r=b/s):I<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(I),n=U/r,s=b/r),this.set(n,s,r,t),this}let R=Math.sqrt((v-y)*(v-y)+(x-T)*(x-T)+(u-d)*(u-d));return Math.abs(R)<.001&&(R=1),this.x=(v-y)/R,this.y=(x-T)/R,this.z=(u-d)/R,this.w=Math.acos((h+m+_-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=Mt(this.x,e.x,t.x),this.y=Mt(this.y,e.y,t.y),this.z=Mt(this.z,e.z,t.z),this.w=Mt(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=Mt(this.x,e,t),this.y=Mt(this.y,e,t),this.z=Mt(this.z,e,t),this.w=Mt(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Mt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Fh.prototype.isVector4=!0;var qt=Fh,zo=class extends Ui{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:bn,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new qt(0,0,e,t),this.scissorTest=!1,this.viewport=new qt(0,0,e,t),this.textures=[];let s={width:e,height:t,depth:n.depth},r=new In(s),a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:bn,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new vr(s)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Xn=class extends zo{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},ra=class extends In{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Mn,this.minFilter=Mn,this.wrapR=Di,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var Vo=class extends In{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=Mn,this.minFilter=Mn,this.wrapR=Di,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}};var ml=class ml{constructor(e,t,n,s,r,a,o,c,h,d,x,u,m,y,T,v){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,c,h,d,x,u,m,y,T,v)}set(e,t,n,s,r,a,o,c,h,d,x,u,m,y,T,v){let _=this.elements;return _[0]=e,_[4]=t,_[8]=n,_[12]=s,_[1]=r,_[5]=a,_[9]=o,_[13]=c,_[2]=h,_[6]=d,_[10]=x,_[14]=u,_[3]=m,_[7]=y,_[11]=T,_[15]=v,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new ml().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,s=1/Ks.setFromMatrixColumn(e,0).length(),r=1/Ks.setFromMatrixColumn(e,1).length(),a=1/Ks.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,s=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),c=Math.cos(s),h=Math.sin(s),d=Math.cos(r),x=Math.sin(r);if(e.order==="XYZ"){let u=a*d,m=a*x,y=o*d,T=o*x;t[0]=c*d,t[4]=-c*x,t[8]=h,t[1]=m+y*h,t[5]=u-T*h,t[9]=-o*c,t[2]=T-u*h,t[6]=y+m*h,t[10]=a*c}else if(e.order==="YXZ"){let u=c*d,m=c*x,y=h*d,T=h*x;t[0]=u+T*o,t[4]=y*o-m,t[8]=a*h,t[1]=a*x,t[5]=a*d,t[9]=-o,t[2]=m*o-y,t[6]=T+u*o,t[10]=a*c}else if(e.order==="ZXY"){let u=c*d,m=c*x,y=h*d,T=h*x;t[0]=u-T*o,t[4]=-a*x,t[8]=y+m*o,t[1]=m+y*o,t[5]=a*d,t[9]=T-u*o,t[2]=-a*h,t[6]=o,t[10]=a*c}else if(e.order==="ZYX"){let u=a*d,m=a*x,y=o*d,T=o*x;t[0]=c*d,t[4]=y*h-m,t[8]=u*h+T,t[1]=c*x,t[5]=T*h+u,t[9]=m*h-y,t[2]=-h,t[6]=o*c,t[10]=a*c}else if(e.order==="YZX"){let u=a*c,m=a*h,y=o*c,T=o*h;t[0]=c*d,t[4]=T-u*x,t[8]=y*x+m,t[1]=x,t[5]=a*d,t[9]=-o*d,t[2]=-h*d,t[6]=m*x+y,t[10]=u-T*x}else if(e.order==="XZY"){let u=a*c,m=a*h,y=o*c,T=o*h;t[0]=c*d,t[4]=-x,t[8]=h*d,t[1]=u*x+T,t[5]=a*d,t[9]=m*x-y,t[2]=y*x-m,t[6]=o*d,t[10]=T*x+u}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Sp,e,bp)}lookAt(e,t,n){let s=this.elements;return ei.subVectors(e,t),ei.lengthSq()===0&&(ei.z=1),ei.normalize(),ts.crossVectors(n,ei),ts.lengthSq()===0&&(Math.abs(n.z)===1?ei.x+=1e-4:ei.z+=1e-4,ei.normalize(),ts.crossVectors(n,ei)),ts.normalize(),ja.crossVectors(ei,ts),s[0]=ts.x,s[4]=ja.x,s[8]=ei.x,s[1]=ts.y,s[5]=ja.y,s[9]=ei.y,s[2]=ts.z,s[6]=ja.z,s[10]=ei.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[4],c=n[8],h=n[12],d=n[1],x=n[5],u=n[9],m=n[13],y=n[2],T=n[6],v=n[10],_=n[14],R=n[3],D=n[7],E=n[11],I=n[15],P=s[0],U=s[4],b=s[8],C=s[12],O=s[1],H=s[5],Y=s[9],Q=s[13],V=s[2],te=s[6],fe=s[10],ue=s[14],ye=s[3],oe=s[7],q=s[11],xe=s[15];return r[0]=a*P+o*O+c*V+h*ye,r[4]=a*U+o*H+c*te+h*oe,r[8]=a*b+o*Y+c*fe+h*q,r[12]=a*C+o*Q+c*ue+h*xe,r[1]=d*P+x*O+u*V+m*ye,r[5]=d*U+x*H+u*te+m*oe,r[9]=d*b+x*Y+u*fe+m*q,r[13]=d*C+x*Q+u*ue+m*xe,r[2]=y*P+T*O+v*V+_*ye,r[6]=y*U+T*H+v*te+_*oe,r[10]=y*b+T*Y+v*fe+_*q,r[14]=y*C+T*Q+v*ue+_*xe,r[3]=R*P+D*O+E*V+I*ye,r[7]=R*U+D*H+E*te+I*oe,r[11]=R*b+D*Y+E*fe+I*q,r[15]=R*C+D*Q+E*ue+I*xe,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],a=e[1],o=e[5],c=e[9],h=e[13],d=e[2],x=e[6],u=e[10],m=e[14],y=e[3],T=e[7],v=e[11],_=e[15],R=c*m-h*u,D=o*m-h*x,E=o*u-c*x,I=a*m-h*d,P=a*u-c*d,U=a*x-o*d;return t*(T*R-v*D+_*E)-n*(y*R-v*I+_*P)+s*(y*D-T*I+_*U)-r*(y*E-T*P+v*U)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[1],a=e[5],o=e[9],c=e[2],h=e[6],d=e[10];return t*(a*d-o*h)-n*(r*d-o*c)+s*(r*h-a*c)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],h=e[7],d=e[8],x=e[9],u=e[10],m=e[11],y=e[12],T=e[13],v=e[14],_=e[15],R=t*o-n*a,D=t*c-s*a,E=t*h-r*a,I=n*c-s*o,P=n*h-r*o,U=s*h-r*c,b=d*T-x*y,C=d*v-u*y,O=d*_-m*y,H=x*v-u*T,Y=x*_-m*T,Q=u*_-m*v,V=R*Q-D*Y+E*H+I*O-P*C+U*b;if(V===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let te=1/V;return e[0]=(o*Q-c*Y+h*H)*te,e[1]=(s*Y-n*Q-r*H)*te,e[2]=(T*U-v*P+_*I)*te,e[3]=(u*P-x*U-m*I)*te,e[4]=(c*O-a*Q-h*C)*te,e[5]=(t*Q-s*O+r*C)*te,e[6]=(v*E-y*U-_*D)*te,e[7]=(d*U-u*E+m*D)*te,e[8]=(a*Y-o*O+h*b)*te,e[9]=(n*O-t*Y-r*b)*te,e[10]=(y*P-T*E+_*R)*te,e[11]=(x*E-d*P-m*R)*te,e[12]=(o*C-a*H-c*b)*te,e[13]=(t*H-n*C+s*b)*te,e[14]=(T*D-y*I-v*R)*te,e[15]=(d*I-x*D+u*R)*te,this}scale(e){let t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),s=Math.sin(t),r=1-n,a=e.x,o=e.y,c=e.z,h=r*a,d=r*o;return this.set(h*a+n,h*o-s*c,h*c+s*o,0,h*o+s*c,d*o+n,d*c-s*a,0,h*c-s*o,d*c+s*a,r*c*c+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,a){return this.set(1,n,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){let s=this.elements,r=t._x,a=t._y,o=t._z,c=t._w,h=r+r,d=a+a,x=o+o,u=r*h,m=r*d,y=r*x,T=a*d,v=a*x,_=o*x,R=c*h,D=c*d,E=c*x,I=n.x,P=n.y,U=n.z;return s[0]=(1-(T+_))*I,s[1]=(m+E)*I,s[2]=(y-D)*I,s[3]=0,s[4]=(m-E)*P,s[5]=(1-(u+_))*P,s[6]=(v+R)*P,s[7]=0,s[8]=(y+D)*U,s[9]=(v-R)*U,s[10]=(1-(u+T))*U,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){let s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),t.identity(),this;let a=Ks.set(s[0],s[1],s[2]).length(),o=Ks.set(s[4],s[5],s[6]).length(),c=Ks.set(s[8],s[9],s[10]).length();r<0&&(a=-a),gi.copy(this);let h=1/a,d=1/o,x=1/c;return gi.elements[0]*=h,gi.elements[1]*=h,gi.elements[2]*=h,gi.elements[4]*=d,gi.elements[5]*=d,gi.elements[6]*=d,gi.elements[8]*=x,gi.elements[9]*=x,gi.elements[10]*=x,t.setFromRotationMatrix(gi),n.x=a,n.y=o,n.z=c,this}makePerspective(e,t,n,s,r,a,o=yi,c=!1){let h=this.elements,d=2*r/(t-e),x=2*r/(n-s),u=(t+e)/(t-e),m=(n+s)/(n-s),y,T;if(c)y=r/(a-r),T=a*r/(a-r);else if(o===yi)y=-(a+r)/(a-r),T=-2*a*r/(a-r);else if(o===gr)y=-a/(a-r),T=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return h[0]=d,h[4]=0,h[8]=u,h[12]=0,h[1]=0,h[5]=x,h[9]=m,h[13]=0,h[2]=0,h[6]=0,h[10]=y,h[14]=T,h[3]=0,h[7]=0,h[11]=-1,h[15]=0,this}makeOrthographic(e,t,n,s,r,a,o=yi,c=!1){let h=this.elements,d=2/(t-e),x=2/(n-s),u=-(t+e)/(t-e),m=-(n+s)/(n-s),y,T;if(c)y=1/(a-r),T=a/(a-r);else if(o===yi)y=-2/(a-r),T=-(a+r)/(a-r);else if(o===gr)y=-1/(a-r),T=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return h[0]=d,h[4]=0,h[8]=0,h[12]=u,h[1]=0,h[5]=x,h[9]=0,h[13]=m,h[2]=0,h[6]=0,h[10]=y,h[14]=T,h[3]=0,h[7]=0,h[11]=0,h[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}};ml.prototype.isMatrix4=!0;var Bt=ml,Ks=new N,gi=new Bt,Sp=new N(0,0,0),bp=new N(1,1,1),ts=new N,ja=new N,ei=new N,bu=new Bt,wu=new hi,Zi=class i{constructor(e=0,t=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let s=e.elements,r=s[0],a=s[4],o=s[8],c=s[1],h=s[5],d=s[9],x=s[2],u=s[6],m=s[10];switch(t){case"XYZ":this._y=Math.asin(Mt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-d,m),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(u,h),this._z=0);break;case"YXZ":this._x=Math.asin(-Mt(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(o,m),this._z=Math.atan2(c,h)):(this._y=Math.atan2(-x,r),this._z=0);break;case"ZXY":this._x=Math.asin(Mt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-x,m),this._z=Math.atan2(-a,h)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-Mt(x,-1,1)),Math.abs(x)<.9999999?(this._x=Math.atan2(u,m),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-a,h));break;case"YZX":this._z=Math.asin(Mt(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-d,h),this._y=Math.atan2(-x,r)):(this._x=0,this._y=Math.atan2(o,m));break;case"XZY":this._z=Math.asin(-Mt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(u,h),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-d,m),this._y=0);break;default:Qe("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return bu.makeRotationFromQuaternion(e),this.setFromRotationMatrix(bu,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return wu.setFromEuler(this),this.setFromQuaternion(wu,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Zi.DEFAULT_ORDER="XYZ";var yr=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},wp=0,Tu=new N,js=new hi,Vi=new Bt,Qa=new N,Xr=new N,Tp=new N,Ap=new hi,Au=new N(1,0,0),Eu=new N(0,1,0),Cu=new N(0,0,1),Ru={type:"added"},Ep={type:"removed"},Qs={type:"childadded",child:null},Cc={type:"childremoved",child:null},gn=class i extends Ui{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:wp++}),this.uuid=as(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new N,t=new Zi,n=new hi,s=new N(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Bt},normalMatrix:{value:new at}}),this.matrix=new Bt,this.matrixWorld=new Bt,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new yr,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return js.setFromAxisAngle(e,t),this.quaternion.multiply(js),this}rotateOnWorldAxis(e,t){return js.setFromAxisAngle(e,t),this.quaternion.premultiply(js),this}rotateX(e){return this.rotateOnAxis(Au,e)}rotateY(e){return this.rotateOnAxis(Eu,e)}rotateZ(e){return this.rotateOnAxis(Cu,e)}translateOnAxis(e,t){return Tu.copy(e).applyQuaternion(this.quaternion),this.position.add(Tu.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Au,e)}translateY(e){return this.translateOnAxis(Eu,e)}translateZ(e){return this.translateOnAxis(Cu,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Vi.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Qa.copy(e):Qa.set(e,t,n);let s=this.parent;this.updateWorldMatrix(!0,!1),Xr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Vi.lookAt(Xr,Qa,this.up):Vi.lookAt(Qa,Xr,this.up),this.quaternion.setFromRotationMatrix(Vi),s&&(Vi.extractRotation(s.matrixWorld),js.setFromRotationMatrix(Vi),this.quaternion.premultiply(js.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(nt("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Ru),Qs.child=e,this.dispatchEvent(Qs),Qs.child=null):nt("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(Ep),Cc.child=e,this.dispatchEvent(Cc),Cc.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Vi.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Vi.multiply(e.parent.matrixWorld)),e.applyMatrix4(Vi),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Ru),Qs.child=e,this.dispatchEvent(Qs),Qs.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){let a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Xr,e,Tp),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Xr,Ap,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*n-r[8]*s,r[13]+=n-r[1]*t-r[5]*n-r[9]*s,r[14]+=s-r[2]*t-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,c){return o[c.uuid]===void 0&&(o[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let c=o.shapes;if(Array.isArray(c))for(let h=0,d=c.length;h<d;h++){let x=c[h];r(e.shapes,x)}else r(e.shapes,c)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let c=0,h=this.material.length;c<h;c++)o.push(r(e.materials,this.material[c]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let c=this.animations[o];s.animations.push(r(e.animations,c))}}if(t){let o=a(e.geometries),c=a(e.materials),h=a(e.textures),d=a(e.images),x=a(e.shapes),u=a(e.skeletons),m=a(e.animations),y=a(e.nodes);o.length>0&&(n.geometries=o),c.length>0&&(n.materials=c),h.length>0&&(n.textures=h),d.length>0&&(n.images=d),x.length>0&&(n.shapes=x),u.length>0&&(n.skeletons=u),m.length>0&&(n.animations=m),y.length>0&&(n.nodes=y)}return n.object=s,n;function a(o){let c=[];for(let h in o){let d=o[h];delete d.metadata,c.push(d)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let s=e.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};gn.DEFAULT_UP=new N(0,1,0);gn.DEFAULT_MATRIX_AUTO_UPDATE=!0;gn.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Xt=class extends gn{constructor(){super(),this.isGroup=!0,this.type="Group"}},Cp={type:"move"},Mr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Xt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Xt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new N,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new N),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Xt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new N,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new N,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,a=null,o=this._targetRay,c=this._grip,h=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(h&&e.hand){a=!0;for(let T of e.hand.values()){let v=t.getJointPose(T,n),_=this._getHandJoint(h,T);v!==null&&(_.matrix.fromArray(v.transform.matrix),_.matrix.decompose(_.position,_.rotation,_.scale),_.matrixWorldNeedsUpdate=!0,_.jointRadius=v.radius),_.visible=v!==null}let d=h.joints["index-finger-tip"],x=h.joints["thumb-tip"],u=d.position.distanceTo(x.position),m=.02,y=.005;h.inputState.pinching&&u>m+y?(h.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!h.inputState.pinching&&u<=m-y&&(h.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1,c.eventsEnabled&&c.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Cp)))}return o!==null&&(o.visible=s!==null),c!==null&&(c.visible=r!==null),h!==null&&(h.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Xt;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Bd={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},ns={h:0,s:0,l:0},eo={h:0,s:0,l:0};function Rc(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var je=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=mn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,St.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=St.workingColorSpace){return this.r=e,this.g=t,this.b=n,St.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=St.workingColorSpace){if(e=xp(e,1),t=Mt(t,0,1),n=Mt(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=Rc(a,r,e+1/3),this.g=Rc(a,r,e),this.b=Rc(a,r,e-1/3)}return St.colorSpaceToWorking(this,s),this}setStyle(e,t=mn){function n(r){r!==void 0&&parseFloat(r)<1&&Qe("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:Qe("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);Qe("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=mn){let n=Bd[e.toLowerCase()];return n!==void 0?this.setHex(n,t):Qe("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Yi(e.r),this.g=Yi(e.g),this.b=Yi(e.b),this}copyLinearToSRGB(e){return this.r=pr(e.r),this.g=pr(e.g),this.b=pr(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=mn){return St.workingToColorSpace(Rn.copy(this),e),Math.round(Mt(Rn.r*255,0,255))*65536+Math.round(Mt(Rn.g*255,0,255))*256+Math.round(Mt(Rn.b*255,0,255))}getHexString(e=mn){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=St.workingColorSpace){St.workingToColorSpace(Rn.copy(this),t);let n=Rn.r,s=Rn.g,r=Rn.b,a=Math.max(n,s,r),o=Math.min(n,s,r),c,h,d=(o+a)/2;if(o===a)c=0,h=0;else{let x=a-o;switch(h=d<=.5?x/(a+o):x/(2-a-o),a){case n:c=(s-r)/x+(s<r?6:0);break;case s:c=(r-n)/x+2;break;case r:c=(n-s)/x+4;break}c/=6}return e.h=c,e.s=h,e.l=d,e}getRGB(e,t=St.workingColorSpace){return St.workingToColorSpace(Rn.copy(this),t),e.r=Rn.r,e.g=Rn.g,e.b=Rn.b,e}getStyle(e=mn){St.workingToColorSpace(Rn.copy(this),e);let t=Rn.r,n=Rn.g,s=Rn.b;return e!==mn?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(ns),this.setHSL(ns.h+e,ns.s+t,ns.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(ns),e.getHSL(eo);let n=bc(ns.h,eo.h,t),s=bc(ns.s,eo.s,t),r=bc(ns.l,eo.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},Rn=new je;je.NAMES=Bd;var aa=class extends gn{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Zi,this.environmentIntensity=1,this.environmentRotation=new Zi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},_i=new N,Gi=new N,Pc=new N,Hi=new N,er=new N,tr=new N,Pu=new N,Ic=new N,Lc=new N,Dc=new N,Nc=new qt,Uc=new qt,Fc=new qt,qi=class i{constructor(e=new N,t=new N,n=new N){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),_i.subVectors(e,t),s.cross(_i);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){_i.subVectors(s,t),Gi.subVectors(n,t),Pc.subVectors(e,t);let a=_i.dot(_i),o=_i.dot(Gi),c=_i.dot(Pc),h=Gi.dot(Gi),d=Gi.dot(Pc),x=a*h-o*o;if(x===0)return r.set(0,0,0),null;let u=1/x,m=(h*c-o*d)*u,y=(a*d-o*c)*u;return r.set(1-m-y,y,m)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,Hi)===null?!1:Hi.x>=0&&Hi.y>=0&&Hi.x+Hi.y<=1}static getInterpolation(e,t,n,s,r,a,o,c){return this.getBarycoord(e,t,n,s,Hi)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,Hi.x),c.addScaledVector(a,Hi.y),c.addScaledVector(o,Hi.z),c)}static getInterpolatedAttribute(e,t,n,s,r,a){return Nc.setScalar(0),Uc.setScalar(0),Fc.setScalar(0),Nc.fromBufferAttribute(e,t),Uc.fromBufferAttribute(e,n),Fc.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(Nc,r.x),a.addScaledVector(Uc,r.y),a.addScaledVector(Fc,r.z),a}static isFrontFacing(e,t,n,s){return _i.subVectors(n,t),Gi.subVectors(e,t),_i.cross(Gi).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return _i.subVectors(this.c,this.b),Gi.subVectors(this.a,this.b),_i.cross(Gi).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return i.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,s=this.b,r=this.c,a,o;er.subVectors(s,n),tr.subVectors(r,n),Ic.subVectors(e,n);let c=er.dot(Ic),h=tr.dot(Ic);if(c<=0&&h<=0)return t.copy(n);Lc.subVectors(e,s);let d=er.dot(Lc),x=tr.dot(Lc);if(d>=0&&x<=d)return t.copy(s);let u=c*x-d*h;if(u<=0&&c>=0&&d<=0)return a=c/(c-d),t.copy(n).addScaledVector(er,a);Dc.subVectors(e,r);let m=er.dot(Dc),y=tr.dot(Dc);if(y>=0&&m<=y)return t.copy(r);let T=m*h-c*y;if(T<=0&&h>=0&&y<=0)return o=h/(h-y),t.copy(n).addScaledVector(tr,o);let v=d*y-m*x;if(v<=0&&x-d>=0&&m-y>=0)return Pu.subVectors(r,s),o=(x-d)/(x-d+(m-y)),t.copy(s).addScaledVector(Pu,o);let _=1/(v+T+u);return a=T*_,o=u*_,t.copy(n).addScaledVector(er,a).addScaledVector(tr,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},os=class{constructor(e=new N(1/0,1/0,1/0),t=new N(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(xi.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(xi.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=xi.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,xi):xi.fromBufferAttribute(r,a),xi.applyMatrix4(e.matrixWorld),this.expandByPoint(xi);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),to.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),to.copy(n.boundingBox)),to.applyMatrix4(e.matrixWorld),this.union(to)}let s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,xi),xi.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(qr),no.subVectors(this.max,qr),nr.subVectors(e.a,qr),ir.subVectors(e.b,qr),sr.subVectors(e.c,qr),is.subVectors(ir,nr),ss.subVectors(sr,ir),Rs.subVectors(nr,sr);let t=[0,-is.z,is.y,0,-ss.z,ss.y,0,-Rs.z,Rs.y,is.z,0,-is.x,ss.z,0,-ss.x,Rs.z,0,-Rs.x,-is.y,is.x,0,-ss.y,ss.x,0,-Rs.y,Rs.x,0];return!Oc(t,nr,ir,sr,no)||(t=[1,0,0,0,1,0,0,0,1],!Oc(t,nr,ir,sr,no))?!1:(io.crossVectors(is,ss),t=[io.x,io.y,io.z],Oc(t,nr,ir,sr,no))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,xi).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(xi).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Wi[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Wi[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Wi[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Wi[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Wi[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Wi[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Wi[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Wi[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Wi),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Wi=[new N,new N,new N,new N,new N,new N,new N,new N],xi=new N,to=new os,nr=new N,ir=new N,sr=new N,is=new N,ss=new N,Rs=new N,qr=new N,no=new N,io=new N,Ps=new N;function Oc(i,e,t,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){Ps.fromArray(i,r);let o=s.x*Math.abs(Ps.x)+s.y*Math.abs(Ps.y)+s.z*Math.abs(Ps.z),c=e.dot(Ps),h=t.dot(Ps),d=n.dot(Ps);if(Math.max(-Math.max(c,h,d),Math.min(c,h,d))>o)return!1}return!0}var un=new N,so=new ke,Rp=0,ni=class extends Ui{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Rp++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Ah,this.updateRanges=[],this.gpuType=Ai,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)so.fromBufferAttribute(this,t),so.applyMatrix3(e),this.setXY(t,so.x,so.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)un.fromBufferAttribute(this,t),un.applyMatrix3(e),this.setXYZ(t,un.x,un.y,un.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)un.fromBufferAttribute(this,t),un.applyMatrix4(e),this.setXYZ(t,un.x,un.y,un.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)un.fromBufferAttribute(this,t),un.applyNormalMatrix(e),this.setXYZ(t,un.x,un.y,un.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)un.fromBufferAttribute(this,t),un.transformDirection(e),this.setXYZ(t,un.x,un.y,un.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Li(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Ot(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Li(t,this.array)),t}setX(e,t){return this.normalized&&(t=Ot(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Li(t,this.array)),t}setY(e,t){return this.normalized&&(t=Ot(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Li(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Ot(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Li(t,this.array)),t}setW(e,t){return this.normalized&&(t=Ot(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Ot(t,this.array),n=Ot(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=Ot(t,this.array),n=Ot(n,this.array),s=Ot(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=Ot(t,this.array),n=Ot(n,this.array),s=Ot(s,this.array),r=Ot(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}};var oa=class extends ni{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var la=class extends ni{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var st=class extends ni{constructor(e,t,n){super(new Float32Array(e),t,n)}},Pp=new os,Yr=new N,Bc=new N,ls=class{constructor(e=new N,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):Pp.setFromPoints(e).getCenter(n);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Yr.subVectors(e,this.center);let t=Yr.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(Yr,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Bc.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Yr.copy(e.center).add(Bc)),this.expandByPoint(Yr.copy(e.center).sub(Bc))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},Ip=0,ci=new Bt,kc=new gn,rr=new N,ti=new os,Zr=new os,yn=new N,Lt=class i extends Ui{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Ip++}),this.uuid=as(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(gp(e)?la:oa)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new at().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return ci.makeRotationFromQuaternion(e),this.applyMatrix4(ci),this}rotateX(e){return ci.makeRotationX(e),this.applyMatrix4(ci),this}rotateY(e){return ci.makeRotationY(e),this.applyMatrix4(ci),this}rotateZ(e){return ci.makeRotationZ(e),this.applyMatrix4(ci),this}translate(e,t,n){return ci.makeTranslation(e,t,n),this.applyMatrix4(ci),this}scale(e,t,n){return ci.makeScale(e,t,n),this.applyMatrix4(ci),this}lookAt(e){return kc.lookAt(e),kc.updateMatrix(),this.applyMatrix4(kc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(rr).negate(),this.translate(rr.x,rr.y,rr.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let s=0,r=e.length;s<r;s++){let a=e[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new st(n,3))}else{let n=Math.min(e.length,t.count);for(let s=0;s<n;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&Qe("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new os);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){nt("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new N(-1/0,-1/0,-1/0),new N(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){let r=t[n];ti.setFromBufferAttribute(r),this.morphTargetsRelative?(yn.addVectors(this.boundingBox.min,ti.min),this.boundingBox.expandByPoint(yn),yn.addVectors(this.boundingBox.max,ti.max),this.boundingBox.expandByPoint(yn)):(this.boundingBox.expandByPoint(ti.min),this.boundingBox.expandByPoint(ti.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&nt('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new ls);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){nt("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new N,1/0);return}if(e){let n=this.boundingSphere.center;if(ti.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){let o=t[r];Zr.setFromBufferAttribute(o),this.morphTargetsRelative?(yn.addVectors(ti.min,Zr.min),ti.expandByPoint(yn),yn.addVectors(ti.max,Zr.max),ti.expandByPoint(yn)):(ti.expandByPoint(Zr.min),ti.expandByPoint(Zr.max))}ti.getCenter(n);let s=0;for(let r=0,a=e.count;r<a;r++)yn.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(yn));if(t)for(let r=0,a=t.length;r<a;r++){let o=t[r],c=this.morphTargetsRelative;for(let h=0,d=o.count;h<d;h++)yn.fromBufferAttribute(o,h),c&&(rr.fromBufferAttribute(e,h),yn.add(rr)),s=Math.max(s,n.distanceToSquared(yn))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&nt('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){nt("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,s=t.normal,r=t.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new ni(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));let o=[],c=[];for(let b=0;b<n.count;b++)o[b]=new N,c[b]=new N;let h=new N,d=new N,x=new N,u=new ke,m=new ke,y=new ke,T=new N,v=new N;function _(b,C,O){h.fromBufferAttribute(n,b),d.fromBufferAttribute(n,C),x.fromBufferAttribute(n,O),u.fromBufferAttribute(r,b),m.fromBufferAttribute(r,C),y.fromBufferAttribute(r,O),d.sub(h),x.sub(h),m.sub(u),y.sub(u);let H=1/(m.x*y.y-y.x*m.y);isFinite(H)&&(T.copy(d).multiplyScalar(y.y).addScaledVector(x,-m.y).multiplyScalar(H),v.copy(x).multiplyScalar(m.x).addScaledVector(d,-y.x).multiplyScalar(H),o[b].add(T),o[C].add(T),o[O].add(T),c[b].add(v),c[C].add(v),c[O].add(v))}let R=this.groups;R.length===0&&(R=[{start:0,count:e.count}]);for(let b=0,C=R.length;b<C;++b){let O=R[b],H=O.start,Y=O.count;for(let Q=H,V=H+Y;Q<V;Q+=3)_(e.getX(Q+0),e.getX(Q+1),e.getX(Q+2))}let D=new N,E=new N,I=new N,P=new N;function U(b){I.fromBufferAttribute(s,b),P.copy(I);let C=o[b];D.copy(C),D.sub(I.multiplyScalar(I.dot(C))).normalize(),E.crossVectors(P,C);let H=E.dot(c[b])<0?-1:1;a.setXYZW(b,D.x,D.y,D.z,H)}for(let b=0,C=R.length;b<C;++b){let O=R[b],H=O.start,Y=O.count;for(let Q=H,V=H+Y;Q<V;Q+=3)U(e.getX(Q+0)),U(e.getX(Q+1)),U(e.getX(Q+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new ni(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let u=0,m=n.count;u<m;u++)n.setXYZ(u,0,0,0);let s=new N,r=new N,a=new N,o=new N,c=new N,h=new N,d=new N,x=new N;if(e)for(let u=0,m=e.count;u<m;u+=3){let y=e.getX(u+0),T=e.getX(u+1),v=e.getX(u+2);s.fromBufferAttribute(t,y),r.fromBufferAttribute(t,T),a.fromBufferAttribute(t,v),d.subVectors(a,r),x.subVectors(s,r),d.cross(x),o.fromBufferAttribute(n,y),c.fromBufferAttribute(n,T),h.fromBufferAttribute(n,v),o.add(d),c.add(d),h.add(d),n.setXYZ(y,o.x,o.y,o.z),n.setXYZ(T,c.x,c.y,c.z),n.setXYZ(v,h.x,h.y,h.z)}else for(let u=0,m=t.count;u<m;u+=3)s.fromBufferAttribute(t,u+0),r.fromBufferAttribute(t,u+1),a.fromBufferAttribute(t,u+2),d.subVectors(a,r),x.subVectors(s,r),d.cross(x),n.setXYZ(u+0,d.x,d.y,d.z),n.setXYZ(u+1,d.x,d.y,d.z),n.setXYZ(u+2,d.x,d.y,d.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)yn.fromBufferAttribute(e,t),yn.normalize(),e.setXYZ(t,yn.x,yn.y,yn.z)}toNonIndexed(){function e(o,c){let h=o.array,d=o.itemSize,x=o.normalized,u=new h.constructor(c.length*d),m=0,y=0;for(let T=0,v=c.length;T<v;T++){o.isInterleavedBufferAttribute?m=c[T]*o.data.stride+o.offset:m=c[T]*d;for(let _=0;_<d;_++)u[y++]=h[m++]}return new ni(u,d,x)}if(this.index===null)return Qe("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,s=this.attributes;for(let o in s){let c=s[o],h=e(c,n);t.setAttribute(o,h)}let r=this.morphAttributes;for(let o in r){let c=[],h=r[o];for(let d=0,x=h.length;d<x;d++){let u=h[d],m=e(u,n);c.push(m)}t.morphAttributes[o]=c}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,c=a.length;o<c;o++){let h=a[o];t.addGroup(h.start,h.count,h.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let c=this.parameters;for(let h in c)c[h]!==void 0&&(e[h]=c[h]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let c in n){let h=n[c];e.data.attributes[c]=h.toJSON(e.data)}let s={},r=!1;for(let c in this.morphAttributes){let h=this.morphAttributes[c],d=[];for(let x=0,u=h.length;x<u;x++){let m=h[x];d.push(m.toJSON(e.data))}d.length>0&&(s[c]=d,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let s=e.attributes;for(let h in s){let d=s[h];this.setAttribute(h,d.clone(t))}let r=e.morphAttributes;for(let h in r){let d=[],x=r[h];for(let u=0,m=x.length;u<m;u++)d.push(x[u].clone(t));this.morphAttributes[h]=d}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let h=0,d=a.length;h<d;h++){let x=a[h];this.addGroup(x.start,x.count,x.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},Go=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=Ah,this.updateRanges=[],this.version=0,this.uuid=as()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let s=0,r=this.stride;s<r;s++)this.array[e+s]=t.array[n+s];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=as()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=as()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer)));let t={uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride};return t.usage=this.usage,t}},Bn=new N,ca=class i{constructor(e,t,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)Bn.fromBufferAttribute(this,t),Bn.applyMatrix4(e),this.setXYZ(t,Bn.x,Bn.y,Bn.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Bn.fromBufferAttribute(this,t),Bn.applyNormalMatrix(e),this.setXYZ(t,Bn.x,Bn.y,Bn.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Bn.fromBufferAttribute(this,t),Bn.transformDirection(e),this.setXYZ(t,Bn.x,Bn.y,Bn.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=Li(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Ot(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=Ot(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=Ot(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=Ot(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=Ot(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=Li(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=Li(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=Li(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=Li(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=Ot(t,this.array),n=Ot(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=Ot(t,this.array),n=Ot(n,this.array),s=Ot(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=Ot(t,this.array),n=Ot(n,this.array),s=Ot(s,this.array),r=Ot(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this.data.array[e+3]=r,this}clone(e){if(e===void 0){sa("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return new ni(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new i(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){sa("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},zc=new N,Lp=new N,Dp=new at,vi=class{constructor(e=new N(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let s=zc.subVectors(n,t).cross(Lp.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let s=e.delta(zc),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(s,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||Dp.getNormalMatrix(e),s=this.coplanarPoint(zc).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},Np=0,Mi=class extends Ui{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Np++}),this.uuid=as(),this.name="",this.type="Material",this.blending=ys,this.side=vs,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=ch,this.blendDst=hh,this.blendEquation=ks,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new je(0,0,0),this.blendAlpha=0,this.depthFunc=mr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Ed,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Ao,this.stencilZFail=Ao,this.stencilZPass=Ao,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){Qe(`Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){Qe(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let a=[];for(let o in r){let c=r[o];delete c.metadata,a.push(c)}return a}if(t){let r=s(e.textures),a=s(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new je().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new vi().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new ke().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new ke().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},ui=class extends Mi{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new je(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},ar,$r=new N,or=new N,lr=new N,cr=new ke,Jr=new ke,kd=new Bt,ro=new N,Kr=new N,ao=new N,Iu=new ke,Vc=new ke,Lu=new ke,Si=class extends gn{constructor(e=new ui){if(super(),this.isSprite=!0,this.type="Sprite",ar===void 0){ar=new Lt;let t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new Go(t,5);ar.setIndex([0,1,2,0,2,3]),ar.setAttribute("position",new ca(n,3,0,!1)),ar.setAttribute("uv",new ca(n,2,3,!1))}this.geometry=ar,this.material=e,this.center=new ke(.5,.5),this.count=1}intersectsFrustum(e){return e.intersectsSprite(this)}raycast(e,t){e.camera===null&&nt('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),or.setFromMatrixScale(this.matrixWorld),kd.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),lr.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&or.multiplyScalar(-lr.z);let n=this.material.rotation,s,r;n!==0&&(r=Math.cos(n),s=Math.sin(n));let a=this.center;oo(ro.set(-.5,-.5,0),lr,a,or,s,r),oo(Kr.set(.5,-.5,0),lr,a,or,s,r),oo(ao.set(.5,.5,0),lr,a,or,s,r),Iu.set(0,0),Vc.set(1,0),Lu.set(1,1);let o=e.ray.intersectTriangle(ro,Kr,ao,!1,$r);if(o===null&&(oo(Kr.set(-.5,.5,0),lr,a,or,s,r),Vc.set(0,1),o=e.ray.intersectTriangle(ro,ao,Kr,!1,$r),o===null))return;let c=e.ray.origin.distanceTo($r);c<e.near||c>e.far||t.push({distance:c,point:$r.clone(),uv:qi.getInterpolation($r,ro,Kr,ao,Iu,Vc,Lu,new ke),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}};function oo(i,e,t,n,s,r){cr.subVectors(i,t).addScalar(.5).multiply(n),s!==void 0?(Jr.x=r*cr.x-s*cr.y,Jr.y=s*cr.x+r*cr.y):Jr.copy(cr),i.copy(e),i.x+=Jr.x,i.y+=Jr.y,i.applyMatrix4(kd)}var Xi=new N,Gc=new N,lo=new N,co=new N,Ns=class{constructor(e=new N,t=new N(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Xi)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Xi.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Xi.copy(this.origin).addScaledVector(this.direction,t),Xi.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){Gc.copy(e).add(t).multiplyScalar(.5),lo.copy(t).sub(e).normalize(),co.copy(this.origin).sub(Gc);let r=e.distanceTo(t)*.5,a=-this.direction.dot(lo),o=co.dot(this.direction),c=-co.dot(lo),h=co.lengthSq(),d=Math.abs(1-a*a),x,u,m,y;if(d>0)if(x=a*c-o,u=a*o-c,y=r*d,x>=0)if(u>=-y)if(u<=y){let T=1/d;x*=T,u*=T,m=x*(x+a*u+2*o)+u*(a*x+u+2*c)+h}else u=r,x=Math.max(0,-(a*u+o)),m=-x*x+u*(u+2*c)+h;else u=-r,x=Math.max(0,-(a*u+o)),m=-x*x+u*(u+2*c)+h;else u<=-y?(x=Math.max(0,-(-a*r+o)),u=x>0?-r:Math.min(Math.max(-r,-c),r),m=-x*x+u*(u+2*c)+h):u<=y?(x=0,u=Math.min(Math.max(-r,-c),r),m=u*(u+2*c)+h):(x=Math.max(0,-(a*r+o)),u=x>0?r:Math.min(Math.max(-r,-c),r),m=-x*x+u*(u+2*c)+h);else u=a>0?-r:r,x=Math.max(0,-(a*u+o)),m=-x*x+u*(u+2*c)+h;return n&&n.copy(this.origin).addScaledVector(this.direction,x),s&&s.copy(Gc).addScaledVector(lo,u),m}intersectSphere(e,t){if(e.radius<0)return null;Xi.subVectors(e.center,this.origin);let n=Xi.dot(this.direction),s=Xi.dot(Xi)-n*n,r=e.radius*e.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=n-a,c=n+a;return c<0?null:o<0?this.at(c,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,a,o,c,h=1/this.direction.x,d=1/this.direction.y,x=1/this.direction.z,u=this.origin;return h>=0?(n=(e.min.x-u.x)*h,s=(e.max.x-u.x)*h):(n=(e.max.x-u.x)*h,s=(e.min.x-u.x)*h),d>=0?(r=(e.min.y-u.y)*d,a=(e.max.y-u.y)*d):(r=(e.max.y-u.y)*d,a=(e.min.y-u.y)*d),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),x>=0?(o=(e.min.z-u.z)*x,c=(e.max.z-u.z)*x):(o=(e.max.z-u.z)*x,c=(e.min.z-u.z)*x),n>c||o>s)||((o>n||n!==n)&&(n=o),(c<s||s!==s)&&(s=c),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,Xi)!==null}intersectTriangle(e,t,n,s,r){let a=this.origin,o=this.direction,c=o.x,h=o.y,d=o.z,x=e.x-a.x,u=e.y-a.y,m=e.z-a.z,y=t.x-a.x,T=t.y-a.y,v=t.z-a.z,_=n.x-a.x,R=n.y-a.y,D=n.z-a.z,E=Math.abs(c),I=Math.abs(h),P=Math.abs(d),U,b,C,O,H,Y,Q,V,te,fe,ue,ye;if(E>=I&&E>=P?(C=c,Y=x,te=y,ye=_,c>=0?(U=h,b=d,O=u,H=m,Q=T,V=v,fe=R,ue=D):(U=d,b=h,O=m,H=u,Q=v,V=T,fe=D,ue=R)):I>=P?(C=h,Y=u,te=T,ye=R,h>=0?(U=d,b=c,O=m,H=x,Q=v,V=y,fe=D,ue=_):(U=c,b=d,O=x,H=m,Q=y,V=v,fe=_,ue=D)):(C=d,Y=m,te=v,ye=D,d>=0?(U=c,b=h,O=x,H=u,Q=y,V=T,fe=_,ue=R):(U=h,b=c,O=u,H=x,Q=T,V=y,fe=R,ue=_)),C===0)return null;let oe=U/C,q=b/C,xe=1/C,qe=O-oe*Y,Ze=H-q*Y,Ut=Q-oe*te,xt=V-q*te,gt=fe-oe*ye,he=ue-q*ye,ge=gt*xt-he*Ut,Be=qe*he-Ze*gt,tt=Ut*Ze-xt*qe;if(s){if(ge<0||Be<0||tt<0)return null}else if((ge<0||Be<0||tt<0)&&(ge>0||Be>0||tt>0))return null;let Se=ge+Be+tt;if(Se===0)return null;let et=xe*(ge*Y+Be*te+tt*ye);return(Se>0?et<0:et>0)?null:this.at(et/Se,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},rn=class extends Mi{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new je(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Zi,this.combine=gl,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Du=new Bt,Is=new Ns,ho=new ls,Nu=new N,uo=new N,fo=new N,po=new N,Hc=new N,mo=new N,Uu=new N,go=new N,ct=class extends gn{constructor(e=new Lt,t=new rn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(s,e);let o=this.morphTargetInfluences;if(r&&o){mo.set(0,0,0);for(let c=0,h=r.length;c<h;c++){let d=o[c],x=r[c];d!==0&&(Hc.fromBufferAttribute(x,e),a?mo.addScaledVector(Hc,d):mo.addScaledVector(Hc.sub(t),d))}t.add(mo)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),ho.copy(n.boundingSphere),ho.applyMatrix4(r),Is.copy(e.ray).recast(e.near),!(ho.containsPoint(Is.origin)===!1&&(Is.intersectSphere(ho,Nu)===null||Is.origin.distanceToSquared(Nu)>(e.far-e.near)**2))&&(Du.copy(r).invert(),Is.copy(e.ray).applyMatrix4(Du),!(n.boundingBox!==null&&Is.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Is)))}_computeIntersections(e,t,n){let s,r=this.geometry,a=this.material,o=r.index,c=r.attributes.position,h=r.attributes.uv,d=r.attributes.uv1,x=r.attributes.normal,u=r.groups,m=r.drawRange;if(o!==null)if(Array.isArray(a))for(let y=0,T=u.length;y<T;y++){let v=u[y],_=a[v.materialIndex],R=Math.max(v.start,m.start),D=Math.min(o.count,Math.min(v.start+v.count,m.start+m.count));for(let E=R,I=D;E<I;E+=3){let P=o.getX(E),U=o.getX(E+1),b=o.getX(E+2);s=_o(this,_,e,n,h,d,x,P,U,b),s&&(s.faceIndex=Math.floor(E/3),s.face.materialIndex=v.materialIndex,t.push(s))}}else{let y=Math.max(0,m.start),T=Math.min(o.count,m.start+m.count);for(let v=y,_=T;v<_;v+=3){let R=o.getX(v),D=o.getX(v+1),E=o.getX(v+2);s=_o(this,a,e,n,h,d,x,R,D,E),s&&(s.faceIndex=Math.floor(v/3),t.push(s))}}else if(c!==void 0)if(Array.isArray(a))for(let y=0,T=u.length;y<T;y++){let v=u[y],_=a[v.materialIndex],R=Math.max(v.start,m.start),D=Math.min(c.count,Math.min(v.start+v.count,m.start+m.count));for(let E=R,I=D;E<I;E+=3){let P=E,U=E+1,b=E+2;s=_o(this,_,e,n,h,d,x,P,U,b),s&&(s.faceIndex=Math.floor(E/3),s.face.materialIndex=v.materialIndex,t.push(s))}}else{let y=Math.max(0,m.start),T=Math.min(c.count,m.start+m.count);for(let v=y,_=T;v<_;v+=3){let R=v,D=v+1,E=v+2;s=_o(this,a,e,n,h,d,x,R,D,E),s&&(s.faceIndex=Math.floor(v/3),t.push(s))}}}};function Up(i,e,t,n,s,r,a,o){let c;if(e.side===Sn?c=n.intersectTriangle(a,r,s,!0,o):c=n.intersectTriangle(s,r,a,e.side===vs,o),c===null)return null;go.copy(o),go.applyMatrix4(i.matrixWorld);let h=t.ray.origin.distanceTo(go);return h<t.near||h>t.far?null:{distance:h,point:go.clone(),object:i}}function _o(i,e,t,n,s,r,a,o,c,h){i.getVertexPosition(o,uo),i.getVertexPosition(c,fo),i.getVertexPosition(h,po);let d=Up(i,e,t,n,uo,fo,po,Uu);if(d){let x=new N;qi.getBarycoord(Uu,uo,fo,po,x),s&&(d.uv=qi.getInterpolatedAttribute(s,o,c,h,x,new ke)),r&&(d.uv1=qi.getInterpolatedAttribute(r,o,c,h,x,new ke)),a&&(d.normal=qi.getInterpolatedAttribute(a,o,c,h,x,new N),d.normal.dot(n.direction)>0&&d.normal.multiplyScalar(-1));let u={a:o,b:c,c:h,normal:new N,materialIndex:0};qi.getNormal(uo,fo,po,u.normal),d.face=u,d.barycoord=x}return d}var Ho=class extends In{constructor(e=null,t=1,n=1,s,r,a,o,c,h=Mn,d=Mn,x,u){super(null,a,o,c,h,d,s,r,x,u),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Ls=new ls,Fp=new ke(.5,.5),xo=new N,Sr=class{constructor(e=new vi,t=new vi,n=new vi,s=new vi,r=new vi,a=new vi){this.planes=[e,t,n,s,r,a]}set(e,t,n,s,r,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=yi,n=!1){let s=this.planes,r=e.elements,a=r[0],o=r[1],c=r[2],h=r[3],d=r[4],x=r[5],u=r[6],m=r[7],y=r[8],T=r[9],v=r[10],_=r[11],R=r[12],D=r[13],E=r[14],I=r[15];if(s[0].setComponents(h-a,m-d,_-y,I-R).normalize(),s[1].setComponents(h+a,m+d,_+y,I+R).normalize(),s[2].setComponents(h+o,m+x,_+T,I+D).normalize(),s[3].setComponents(h-o,m-x,_-T,I-D).normalize(),n)s[4].setComponents(c,u,v,E).normalize(),s[5].setComponents(h-c,m-u,_-v,I-E).normalize();else if(s[4].setComponents(h-c,m-u,_-v,I-E).normalize(),t===yi)s[5].setComponents(h+c,m+u,_+v,I+E).normalize();else if(t===gr)s[5].setComponents(c,u,v,E).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Ls.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Ls.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Ls)}intersectsSprite(e){Ls.center.set(0,0,0);let t=Fp.distanceTo(e.center);return Ls.radius=.7071067811865476+t,Ls.applyMatrix4(e.matrixWorld),this.intersectsSphere(Ls)}intersectsSphere(e){let t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let s=t[n];if(xo.x=s.normal.x>0?e.max.x:e.min.x,xo.y=s.normal.y>0?e.max.y:e.min.y,xo.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(xo)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var ii=class extends Mi{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new je(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},Wo=new N,Xo=new N,Fu=new Bt,jr=new Ns,vo=new ls,Wc=new N,Ou=new N,Fi=class extends gn{constructor(e=new Lt,t=new ii){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)Wo.fromBufferAttribute(t,s-1),Xo.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=Wo.distanceTo(Xo);e.setAttribute("lineDistance",new st(n,1))}else Qe("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),vo.copy(n.boundingSphere),vo.applyMatrix4(s),vo.radius+=r,e.ray.intersectsSphere(vo)===!1)return;Fu.copy(s).invert(),jr.copy(e.ray).applyMatrix4(Fu);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,h=this.isLineSegments?2:1,d=n.index,u=n.attributes.position;if(d!==null){let m=Math.max(0,a.start),y=Math.min(d.count,a.start+a.count);for(let T=m,v=y-1;T<v;T+=h){let _=d.getX(T),R=d.getX(T+1),D=yo(this,e,jr,c,_,R,T);D&&t.push(D)}if(this.isLineLoop){let T=d.getX(y-1),v=d.getX(m),_=yo(this,e,jr,c,T,v,y-1);_&&t.push(_)}}else{let m=Math.max(0,a.start),y=Math.min(u.count,a.start+a.count);for(let T=m,v=y-1;T<v;T+=h){let _=yo(this,e,jr,c,T,T+1,T);_&&t.push(_)}if(this.isLineLoop){let T=yo(this,e,jr,c,y-1,m,y-1);T&&t.push(T)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function yo(i,e,t,n,s,r,a){let o=i.geometry.attributes.position;if(Wo.fromBufferAttribute(o,s),Xo.fromBufferAttribute(o,r),t.distanceSqToSegment(Wo,Xo,Wc,Ou)>n)return;Wc.applyMatrix4(i.matrixWorld);let h=e.ray.origin.distanceTo(Wc);if(!(h<e.near||h>e.far))return{distance:h,point:Ou.clone().applyMatrix4(i.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:i}}var Bu=new N,ku=new N,Us=class extends Fi{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)Bu.fromBufferAttribute(t,s),ku.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+Bu.distanceTo(ku);e.setAttribute("lineDistance",new st(n,1))}else Qe("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}};var cs=class extends Mi{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new je(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},zu=new Bt,eh=new Ns,Mo=new ls,So=new N,Fs=class extends gn{constructor(e=new Lt,t=new cs){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Mo.copy(n.boundingSphere),Mo.applyMatrix4(s),Mo.radius+=r,e.ray.intersectsSphere(Mo)===!1)return;zu.copy(s).invert(),eh.copy(e.ray).applyMatrix4(zu);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,h=n.index,x=n.attributes.position;if(h!==null){let u=Math.max(0,a.start),m=Math.min(h.count,a.start+a.count);for(let y=u,T=m;y<T;y++){let v=h.getX(y);So.fromBufferAttribute(x,v),Vu(So,v,c,s,e,t,this)}}else{let u=Math.max(0,a.start),m=Math.min(x.count,a.start+a.count);for(let y=u,T=m;y<T;y++)So.fromBufferAttribute(x,y),Vu(So,y,c,s,e,t,this)}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function Vu(i,e,t,n,s,r,a){let o=eh.distanceSqToPoint(i);if(o<t){let c=new N;eh.closestPointToPoint(i,c),c.applyMatrix4(n);let h=s.ray.origin.distanceTo(c);if(h<s.near||h>s.far)return;r.push({distance:h,distanceToRay:Math.sqrt(o),point:c,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}var ha=class extends In{constructor(e=[],t=Ms,n,s,r,a,o,c,h,d){super(e,t,n,s,r,a,o,c,h,d),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Os=class extends In{constructor(e,t,n,s,r,a,o,c,h){super(e,t,n,s,r,a,o,c,h),this.isCanvasTexture=!0,this.needsUpdate=!0}};var hs=class extends In{constructor(e,t,n=Ti,s,r,a,o=Mn,c=Mn,h,d=Ni,x=1){if(d!==Ni&&d!==bs)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let u={width:e,height:t,depth:x};super(u,s,r,a,o,c,d,n,h),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new vr(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},qo=class extends hs{constructor(e,t=Ti,n=Ms,s,r,a=Mn,o=Mn,c,h=Ni){let d={width:e,height:e,depth:1},x=[d,d,d,d,d,d];super(e,e,t,n,s,r,a,o,c,h),this.image=x,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},ua=class extends In{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},bi=class i extends Lt{constructor(e=1,t=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let c=[],h=[],d=[],x=[],u=0,m=0;y("z","y","x",-1,-1,n,t,e,a,r,0),y("z","y","x",1,-1,n,t,-e,a,r,1),y("x","z","y",1,1,e,n,t,s,a,2),y("x","z","y",1,-1,e,n,-t,s,a,3),y("x","y","z",1,-1,e,t,n,s,r,4),y("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(c),this.setAttribute("position",new st(h,3)),this.setAttribute("normal",new st(d,3)),this.setAttribute("uv",new st(x,2));function y(T,v,_,R,D,E,I,P,U,b,C){let O=E/U,H=I/b,Y=E/2,Q=I/2,V=P/2,te=U+1,fe=b+1,ue=0,ye=0,oe=new N;for(let q=0;q<fe;q++){let xe=q*H-Q;for(let qe=0;qe<te;qe++){let Ze=qe*O-Y;oe[T]=Ze*R,oe[v]=xe*D,oe[_]=V,h.push(oe.x,oe.y,oe.z),oe[T]=0,oe[v]=0,oe[_]=P>0?1:-1,d.push(oe.x,oe.y,oe.z),x.push(qe/U),x.push(1-q/b),ue+=1}}for(let q=0;q<b;q++)for(let xe=0;xe<U;xe++){let qe=u+xe+te*q,Ze=u+xe+te*(q+1),Ut=u+(xe+1)+te*(q+1),xt=u+(xe+1)+te*q;c.push(qe,Ze,xt),c.push(Ze,Ut,xt),ye+=6}o.addGroup(m,ye,C),m+=ye,u+=ue}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};var Bs=class i extends Lt{constructor(e=1,t=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:s},t=Math.max(3,t);let r=[],a=[],o=[],c=[],h=new N,d=new ke;a.push(0,0,0),o.push(0,0,1),c.push(.5,.5);for(let x=0,u=3;x<=t;x++,u+=3){let m=n+x/t*s;h.x=e*Math.cos(m),h.y=e*Math.sin(m),a.push(h.x,h.y,h.z),o.push(0,0,1),d.x=(a[u]/e+1)/2,d.y=(a[u+1]/e+1)/2,c.push(d.x,d.y)}for(let x=1;x<=t;x++)r.push(x,x+1,0);this.setIndex(r),this.setAttribute("position",new st(a,3)),this.setAttribute("normal",new st(o,3)),this.setAttribute("uv",new st(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.segments,e.thetaStart,e.thetaLength)}},di=class i extends Lt{constructor(e=1,t=1,n=1,s=32,r=1,a=!1,o=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:c};let h=this;s=Math.floor(s),r=Math.floor(r);let d=[],x=[],u=[],m=[],y=0,T=[],v=n/2,_=0;R(),a===!1&&(e>0&&D(!0),t>0&&D(!1)),this.setIndex(d),this.setAttribute("position",new st(x,3)),this.setAttribute("normal",new st(u,3)),this.setAttribute("uv",new st(m,2));function R(){let E=new N,I=new N,P=0,U=(t-e)/n;for(let b=0;b<=r;b++){let C=[],O=b/r,H=O*(t-e)+e;for(let Y=0;Y<=s;Y++){let Q=Y/s,V=Q*c+o,te=Math.sin(V),fe=Math.cos(V);I.x=H*te,I.y=-O*n+v,I.z=H*fe,x.push(I.x,I.y,I.z),E.set(te,U,fe).normalize(),u.push(E.x,E.y,E.z),m.push(Q,1-O),C.push(y++)}T.push(C)}for(let b=0;b<s;b++)for(let C=0;C<r;C++){let O=T[C][b],H=T[C+1][b],Y=T[C+1][b+1],Q=T[C][b+1];(e>0||C!==0)&&(d.push(O,H,Q),P+=3),(t>0||C!==r-1)&&(d.push(H,Y,Q),P+=3)}h.addGroup(_,P,0),_+=P}function D(E){let I=y,P=new ke,U=new N,b=0,C=E===!0?e:t,O=E===!0?1:-1;for(let Y=1;Y<=s;Y++)x.push(0,v*O,0),u.push(0,O,0),m.push(.5,.5),y++;let H=y;for(let Y=0;Y<=s;Y++){let V=Y/s*c+o,te=Math.cos(V),fe=Math.sin(V);U.x=C*fe,U.y=v*O,U.z=C*te,x.push(U.x,U.y,U.z),u.push(0,O,0),P.x=te*.5+.5,P.y=fe*.5*O+.5,m.push(P.x,P.y),y++}for(let Y=0;Y<s;Y++){let Q=I+Y,V=H+Y;E===!0?d.push(V,V+1,Q):d.push(V+1,V,Q),b+=3}h.addGroup(_,b,E===!0?1:2),_+=b}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},us=class i extends di{constructor(e=1,t=1,n=32,s=1,r=!1,a=0,o=Math.PI*2){super(0,e,t,n,s,r,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(e){return new i(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},br=class i extends Lt{constructor(e=[],t=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:s};let r=[],a=[];o(s),h(n),d(),this.setAttribute("position",new st(r,3)),this.setAttribute("normal",new st(r.slice(),3)),this.setAttribute("uv",new st(a,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function o(R){let D=new N,E=new N,I=new N;for(let P=0;P<t.length;P+=3)m(t[P+0],D),m(t[P+1],E),m(t[P+2],I),c(D,E,I,R)}function c(R,D,E,I){let P=I+1,U=[];for(let b=0;b<=P;b++){U[b]=[];let C=R.clone().lerp(E,b/P),O=D.clone().lerp(E,b/P),H=P-b;for(let Y=0;Y<=H;Y++)Y===0&&b===P?U[b][Y]=C:U[b][Y]=C.clone().lerp(O,Y/H)}for(let b=0;b<P;b++)for(let C=0;C<2*(P-b)-1;C++){let O=Math.floor(C/2);C%2===0?(u(U[b][O+1]),u(U[b+1][O]),u(U[b][O])):(u(U[b][O+1]),u(U[b+1][O+1]),u(U[b+1][O]))}}function h(R){let D=new N;for(let E=0;E<r.length;E+=3)D.x=r[E+0],D.y=r[E+1],D.z=r[E+2],D.normalize().multiplyScalar(R),r[E+0]=D.x,r[E+1]=D.y,r[E+2]=D.z}function d(){let R=new N;for(let D=0;D<r.length;D+=3){R.x=r[D+0],R.y=r[D+1],R.z=r[D+2];let E=v(R)/2/Math.PI+.5,I=_(R)/Math.PI+.5;a.push(E,1-I)}y(),x()}function x(){for(let R=0;R<a.length;R+=6){let D=a[R+0],E=a[R+2],I=a[R+4],P=Math.max(D,E,I),U=Math.min(D,E,I);P>.9&&U<.1&&(D<.2&&(a[R+0]+=1),E<.2&&(a[R+2]+=1),I<.2&&(a[R+4]+=1))}}function u(R){r.push(R.x,R.y,R.z)}function m(R,D){let E=R*3;D.x=e[E+0],D.y=e[E+1],D.z=e[E+2]}function y(){let R=new N,D=new N,E=new N,I=new N,P=new ke,U=new ke,b=new ke;for(let C=0,O=0;C<r.length;C+=9,O+=6){R.set(r[C+0],r[C+1],r[C+2]),D.set(r[C+3],r[C+4],r[C+5]),E.set(r[C+6],r[C+7],r[C+8]),P.set(a[O+0],a[O+1]),U.set(a[O+2],a[O+3]),b.set(a[O+4],a[O+5]),I.copy(R).add(D).add(E).divideScalar(3);let H=v(I);T(P,O+0,R,H),T(U,O+2,D,H),T(b,O+4,E,H)}}function T(R,D,E,I){I<0&&R.x===1&&(a[D]=R.x-1),E.x===0&&E.z===0&&(a[D]=I/2/Math.PI+.5)}function v(R){return Math.atan2(R.z,-R.x)}function _(R){return Math.atan2(-R.y,Math.sqrt(R.x*R.x+R.z*R.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.vertices,e.indices,e.radius,e.detail)}},da=class i extends br{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,s=1/n,r=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-s,-n,0,-s,n,0,s,-n,0,s,n,-s,-n,0,-s,n,0,s,-n,0,s,n,0,-n,0,-s,n,0,-s,-n,0,s,n,0,s],a=[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9];super(r,a,e,t),this.type="DodecahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new i(e.radius,e.detail)}};var si=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){Qe("Curve: .getPoint() not implemented.")}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,s=this.getPoint(0),r=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),r+=n.distanceTo(s),t.push(r),s=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),s=0,r=n.length,a;t?a=t:a=e*n[r-1];let o=0,c=r-1,h;for(;o<=c;)if(s=Math.floor(o+(c-o)/2),h=n[s]-a,h<0)o=s+1;else if(h>0)c=s-1;else{c=s;break}if(s=c,n[s]===a)return s/(r-1);let d=n[s],u=n[s+1]-d,m=(a-d)/u;return(s+m)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);let a=this.getPoint(s),o=this.getPoint(r),c=t||(a.isVector2?new ke:new N);return c.copy(o).sub(a).normalize(),c}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new N,s=[],r=[],a=[],o=new N,c=new Bt;for(let m=0;m<=e;m++){let y=m/e;s[m]=this.getTangentAt(y,new N)}r[0]=new N,a[0]=new N;let h=Number.MAX_VALUE,d=Math.abs(s[0].x),x=Math.abs(s[0].y),u=Math.abs(s[0].z);d<=h&&(h=d,n.set(1,0,0)),x<=h&&(h=x,n.set(0,1,0)),u<=h&&n.set(0,0,1),o.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],o),a[0].crossVectors(s[0],r[0]);for(let m=1;m<=e;m++){if(r[m]=r[m-1].clone(),a[m]=a[m-1].clone(),o.crossVectors(s[m-1],s[m]),o.length()>Number.EPSILON){o.normalize();let y=Math.acos(Mt(s[m-1].dot(s[m]),-1,1));r[m].applyMatrix4(c.makeRotationAxis(o,y))}a[m].crossVectors(s[m],r[m])}if(t===!0){let m=Math.acos(Mt(r[0].dot(r[e]),-1,1));m/=e,s[0].dot(o.crossVectors(r[0],r[e]))>0&&(m=-m);for(let y=1;y<=e;y++)r[y].applyMatrix4(c.makeRotationAxis(s[y],m*y)),a[y].crossVectors(s[y],r[y])}return{tangents:s,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},fa=class extends si{constructor(e=0,t=0,n=1,s=1,r=0,a=Math.PI*2,o=!1,c=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=c}getPoint(e,t=new ke){let n=t,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(a?r=0:r=s),this.aClockwise===!0&&!a&&(r===s?r=-s:r=r-s);let o=this.aStartAngle+e*r,c=this.aX+this.xRadius*Math.cos(o),h=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let d=Math.cos(this.aRotation),x=Math.sin(this.aRotation),u=c-this.aX,m=h-this.aY;c=u*d-m*x+this.aX,h=u*x+m*d+this.aY}return n.set(c,h)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Yo=class extends fa{constructor(e,t,n,s,r,a){super(e,t,n,n,s,r,a),this.isArcCurve=!0,this.type="ArcCurve"}};function Ch(){let i=0,e=0,t=0,n=0;function s(r,a,o,c){i=r,e=o,t=-3*r+3*a-2*o-c,n=2*r-2*a+o+c}return{initCatmullRom:function(r,a,o,c,h){s(a,o,h*(o-r),h*(c-a))},initNonuniformCatmullRom:function(r,a,o,c,h,d,x){let u=(a-r)/h-(o-r)/(h+d)+(o-a)/d,m=(o-a)/d-(c-a)/(d+x)+(c-o)/x;u*=d,m*=d,s(a,o,u,m)},calc:function(r){let a=r*r,o=a*r;return i+e*r+t*a+n*o}}}var Gu=new N,Hu=new N,Xc=new Ch,qc=new Ch,Yc=new Ch,ds=class extends si{constructor(e=[],t=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=s}getPoint(e,t=new N){let n=t,s=this.points,r=s.length,a=(r-(this.closed?0:1))*e,o=Math.floor(a),c=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:c===0&&o===r-1&&(o=r-2,c=1);let h,d;this.closed||o>0?h=s[(o-1)%r]:(Hu.subVectors(s[0],s[1]).add(s[0]),h=Hu);let x=s[o%r],u=s[(o+1)%r];if(this.closed||o+2<r?d=s[(o+2)%r]:(Gu.subVectors(s[r-1],s[r-2]).add(s[r-1]),d=Gu),this.curveType==="centripetal"||this.curveType==="chordal"){let m=this.curveType==="chordal"?.5:.25,y=Math.pow(h.distanceToSquared(x),m),T=Math.pow(x.distanceToSquared(u),m),v=Math.pow(u.distanceToSquared(d),m);T<1e-4&&(T=1),y<1e-4&&(y=T),v<1e-4&&(v=T),Xc.initNonuniformCatmullRom(h.x,x.x,u.x,d.x,y,T,v),qc.initNonuniformCatmullRom(h.y,x.y,u.y,d.y,y,T,v),Yc.initNonuniformCatmullRom(h.z,x.z,u.z,d.z,y,T,v)}else this.curveType==="catmullrom"&&(Xc.initCatmullRom(h.x,x.x,u.x,d.x,this.tension),qc.initCatmullRom(h.y,x.y,u.y,d.y,this.tension),Yc.initCatmullRom(h.z,x.z,u.z,d.z,this.tension));return n.set(Xc.calc(c),qc.calc(c),Yc.calc(c)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new N().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function Wu(i,e,t,n,s){let r=(n-e)*.5,a=(s-t)*.5,o=i*i,c=i*o;return(2*t-2*n+r+a)*c+(-3*t+3*n-2*r-a)*o+r*i+t}function Op(i,e){let t=1-i;return t*t*e}function Bp(i,e){return 2*(1-i)*i*e}function kp(i,e){return i*i*e}function Qr(i,e,t,n){return Op(i,e)+Bp(i,t)+kp(i,n)}function zp(i,e){let t=1-i;return t*t*t*e}function Vp(i,e){let t=1-i;return 3*t*t*i*e}function Gp(i,e){return 3*(1-i)*i*i*e}function Hp(i,e){return i*i*i*e}function ea(i,e,t,n,s){return zp(i,e)+Vp(i,t)+Gp(i,n)+Hp(i,s)}var Zo=class extends si{constructor(e=new ke,t=new ke,n=new ke,s=new ke){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new ke){let n=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(ea(e,s.x,r.x,a.x,o.x),ea(e,s.y,r.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},$o=class extends si{constructor(e=new N,t=new N,n=new N,s=new N){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new N){let n=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(ea(e,s.x,r.x,a.x,o.x),ea(e,s.y,r.y,a.y,o.y),ea(e,s.z,r.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Jo=class extends si{constructor(e=new ke,t=new ke){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new ke){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new ke){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},wr=class extends si{constructor(e=new N,t=new N){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new N){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new N){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Ko=class extends si{constructor(e=new ke,t=new ke,n=new ke){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new ke){let n=t,s=this.v0,r=this.v1,a=this.v2;return n.set(Qr(e,s.x,r.x,a.x),Qr(e,s.y,r.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},pa=class extends si{constructor(e=new N,t=new N,n=new N){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new N){let n=t,s=this.v0,r=this.v1,a=this.v2;return n.set(Qr(e,s.x,r.x,a.x),Qr(e,s.y,r.y,a.y),Qr(e,s.z,r.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},jo=class extends si{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new ke){let n=t,s=this.points,r=(s.length-1)*e,a=Math.floor(r),o=r-a,c=s[a===0?a:a-1],h=s[a],d=s[a>s.length-2?s.length-1:a+1],x=s[a>s.length-3?s.length-1:a+2];return n.set(Wu(o,c.x,h.x,d.x,x.x),Wu(o,c.y,h.y,d.y,x.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new ke().fromArray(s))}return this}},th=Object.freeze({__proto__:null,ArcCurve:Yo,CatmullRomCurve3:ds,CubicBezierCurve:Zo,CubicBezierCurve3:$o,EllipseCurve:fa,LineCurve:Jo,LineCurve3:wr,QuadraticBezierCurve:Ko,QuadraticBezierCurve3:pa,SplineCurve:jo}),ma=class extends si{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new th[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=n){let a=s[r]-n,o=this.curves[r],c=o.getLength(),h=c===0?0:1-a/c;return o.getPointAt(h,t)}r++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,s=this.curves.length;n<s;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let s=0,r=this.curves;s<r.length;s++){let a=r[s],o=a.isEllipseCurve?e*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,c=a.getPoints(o);for(let h=0;h<c.length;h++){let d=c[h];n&&n.equals(d)||(t.push(d),n=d)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let s=e.curves[t];this.curves.push(s.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let s=this.curves[t];e.curves.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let s=e.curves[t];this.curves.push(new th[s.type]().fromJSON(s))}return this}};var fs=class i extends br{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,s=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new i(e.radius,e.detail)}};var ga=class i extends br{constructor(e=1,t=0){let n=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],s=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(n,s,e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new i(e.radius,e.detail)}},Oi=class i extends Lt{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};let r=e/2,a=t/2,o=Math.floor(n),c=Math.floor(s),h=o+1,d=c+1,x=e/o,u=t/c,m=[],y=[],T=[],v=[];for(let _=0;_<d;_++){let R=_*u-a;for(let D=0;D<h;D++){let E=D*x-r;y.push(E,-R,0),T.push(0,0,1),v.push(D/o),v.push(1-_/c)}}for(let _=0;_<c;_++)for(let R=0;R<o;R++){let D=R+h*_,E=R+h*(_+1),I=R+1+h*(_+1),P=R+1+h*_;m.push(D,E,P),m.push(E,I,P)}this.setIndex(m),this.setAttribute("position",new st(y,3)),this.setAttribute("normal",new st(T,3)),this.setAttribute("uv",new st(v,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}},ps=class i extends Lt{constructor(e=.5,t=1,n=32,s=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:s,thetaStart:r,thetaLength:a},n=Math.max(3,n),s=Math.max(1,s);let o=[],c=[],h=[],d=[],x=e,u=(t-e)/s,m=new N,y=new ke;for(let T=0;T<=s;T++){for(let v=0;v<=n;v++){let _=r+v/n*a;m.x=x*Math.cos(_),m.y=x*Math.sin(_),c.push(m.x,m.y,m.z),h.push(0,0,1),y.x=(m.x/t+1)/2,y.y=(m.y/t+1)/2,d.push(y.x,y.y)}x+=u}for(let T=0;T<s;T++){let v=T*(n+1);for(let _=0;_<n;_++){let R=_+v,D=R,E=R+n+1,I=R+n+2,P=R+1;o.push(D,E,P),o.push(E,I,P)}}this.setIndex(o),this.setAttribute("position",new st(c,3)),this.setAttribute("normal",new st(h,3)),this.setAttribute("uv",new st(d,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}};var Ln=class i extends Lt{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let c=Math.min(a+o,Math.PI),h=0,d=[],x=new N,u=new N,m=[],y=[],T=[],v=[];for(let _=0;_<=n;_++){let R=[],D=_/n,E=a+D*o,I=e*Math.cos(E),P=Math.sqrt(e*e-I*I),U=0;_===0&&a===0?U=.5/t:_===n&&c===Math.PI&&(U=-.5/t);for(let b=0;b<=t;b++){let C=b/t,O=s+C*r;x.x=-P*Math.cos(O),x.y=I,x.z=P*Math.sin(O),y.push(x.x,x.y,x.z),u.copy(x).normalize(),T.push(u.x,u.y,u.z),v.push(C+U,1-D),R.push(h++)}d.push(R)}for(let _=0;_<n;_++)for(let R=0;R<t;R++){let D=d[_][R+1],E=d[_][R],I=d[_+1][R],P=d[_+1][R+1];(_!==0||a>0)&&m.push(D,E,P),(_!==n-1||c<Math.PI)&&m.push(E,I,P)}this.setIndex(m),this.setAttribute("position",new st(y,3)),this.setAttribute("normal",new st(T,3)),this.setAttribute("uv",new st(v,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var ms=class i extends Lt{constructor(e=1,t=.4,n=12,s=48,r=Math.PI*2,a=0,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:s,arc:r,thetaStart:a,thetaLength:o},n=Math.floor(n),s=Math.floor(s);let c=[],h=[],d=[],x=[],u=new N,m=new N,y=new N;for(let T=0;T<=n;T++){let v=a+T/n*o;for(let _=0;_<=s;_++){let R=_/s*r;m.x=(e+t*Math.cos(v))*Math.cos(R),m.y=(e+t*Math.cos(v))*Math.sin(R),m.z=t*Math.sin(v),h.push(m.x,m.y,m.z),u.x=e*Math.cos(R),u.y=e*Math.sin(R),y.subVectors(m,u).normalize(),d.push(y.x,y.y,y.z),x.push(_/s),x.push(T/n)}}for(let T=1;T<=n;T++)for(let v=1;v<=s;v++){let _=(s+1)*T+v-1,R=(s+1)*(T-1)+v-1,D=(s+1)*(T-1)+v,E=(s+1)*T+v;c.push(_,R,E),c.push(R,D,E)}this.setIndex(c),this.setAttribute("position",new st(h,3)),this.setAttribute("normal",new st(d,3)),this.setAttribute("uv",new st(x,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc,e.thetaStart,e.thetaLength)}};var _a=class i extends Lt{constructor(e=new pa(new N(-1,-1,0),new N(-1,1,0),new N(1,1,0)),t=64,n=1,s=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:s,closed:r};let a=e.computeFrenetFrames(t,r);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;let o=new N,c=new N,h=new ke,d=new N,x=[],u=[],m=[],y=[];T(),this.setIndex(y),this.setAttribute("position",new st(x,3)),this.setAttribute("normal",new st(u,3)),this.setAttribute("uv",new st(m,2));function T(){for(let D=0;D<t;D++)v(D);v(r===!1?t:0),R(),_()}function v(D){d=e.getPointAt(D/t,d);let E=a.normals[D],I=a.binormals[D];for(let P=0;P<=s;P++){let U=P/s*Math.PI*2,b=Math.sin(U),C=-Math.cos(U);c.x=C*E.x+b*I.x,c.y=C*E.y+b*I.y,c.z=C*E.z+b*I.z,c.normalize(),u.push(c.x,c.y,c.z),o.x=d.x+n*c.x,o.y=d.y+n*c.y,o.z=d.z+n*c.z,x.push(o.x,o.y,o.z)}}function _(){for(let D=1;D<=t;D++)for(let E=1;E<=s;E++){let I=(s+1)*(D-1)+(E-1),P=(s+1)*D+(E-1),U=(s+1)*D+E,b=(s+1)*(D-1)+E;y.push(I,P,b),y.push(P,U,b)}}function R(){for(let D=0;D<=t;D++)for(let E=0;E<=s;E++)h.x=D/t,h.y=E/s,m.push(h.x,h.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new i(new th[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}},Tr=class extends Lt{constructor(e=null){if(super(),this.type="WireframeGeometry",this.parameters={geometry:e},e!==null){let t=[],n=new Set,s=new N,r=new N;if(e.index!==null){let a=e.attributes.position,o=e.index,c=e.groups;c.length===0&&(c=[{start:0,count:o.count,materialIndex:0}]);for(let h=0,d=c.length;h<d;++h){let x=c[h],u=x.start,m=x.count;for(let y=u,T=u+m;y<T;y+=3)for(let v=0;v<3;v++){let _=o.getX(y+v),R=o.getX(y+(v+1)%3);s.fromBufferAttribute(a,_),r.fromBufferAttribute(a,R),Xu(s,r,n)===!0&&(t.push(s.x,s.y,s.z),t.push(r.x,r.y,r.z))}}}else{let a=e.attributes.position;for(let o=0,c=a.count/3;o<c;o++)for(let h=0;h<3;h++){let d=3*o+h,x=3*o+(h+1)%3;s.fromBufferAttribute(a,d),r.fromBufferAttribute(a,x),Xu(s,r,n)===!0&&(t.push(s.x,s.y,s.z),t.push(r.x,r.y,r.z))}}this.setAttribute("position",new st(t,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}};function Xu(i,e,t){let n=`${i.x},${i.y},${i.z}-${e.x},${e.y},${e.z}`,s=`${e.x},${e.y},${e.z}-${i.x},${i.y},${i.z}`;return t.has(n)===!0||t.has(s)===!0?!1:(t.add(n),t.add(s),!0)}function Vs(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let s=i[t][n];if(qu(s))s.isRenderTargetTexture?(Qe("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone();else if(Array.isArray(s))if(qu(s[0])){let r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();e[t][n]=r}else e[t][n]=s.slice();else e[t][n]=s}}return e}function Dn(i){let e={};for(let t=0;t<i.length;t++){let n=Vs(i[t]);for(let s in n)e[s]=n[s]}return e}function qu(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function Wp(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function Rh(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:St.workingColorSpace}var zd={clone:Vs,merge:Dn},Xp=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,qp=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,dn=class extends Mi{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Xp,this.fragmentShader=qp,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Vs(e.uniforms),this.uniformsGroups=Wp(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let s=e.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=t[s.value]||null;break;case"c":this.uniforms[n].value=new je().setHex(s.value);break;case"v2":this.uniforms[n].value=new ke().fromArray(s.value);break;case"v3":this.uniforms[n].value=new N().fromArray(s.value);break;case"v4":this.uniforms[n].value=new qt().fromArray(s.value);break;case"m3":this.uniforms[n].value=new at().fromArray(s.value);break;case"m4":this.uniforms[n].value=new Bt().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},Qo=class extends dn{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}};var $i=class extends Mi{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new je(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new je(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=nc,this.normalScale=new ke(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Zi,this.combine=gl,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},el=class extends Mi{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Td,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},tl=class extends Mi{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function hr(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function Zc(i){return i!==void 0&&i.inTangents!==void 0&&i.outTangents!==void 0}var gs=class{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,s=t[n],r=t[n-1];e:{t:{let a;n:{i:if(!(e<s)){for(let o=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=s,s=t[++n],e<s)break t}a=t.length;break n}if(!(e>=r)){let o=t[1];e<o&&(n=2,r=o);for(let c=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===c)break;if(s=r,r=t[--n-1],e>=r)break t}a=n,n=0;break n}break e}for(;n<a;){let o=n+a>>>1;e<t[o]?a=o:n=o+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let a=0;a!==s;++a)t[a]=n[r+a];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},nl=class extends gs{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Kc,endingEnd:Kc}}intervalChanged_(e,t,n){let s=this.parameterPositions,r=e-2,a=e+1,o=s[r],c=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case jc:r=e,o=2*t-n;break;case Qc:r=s.length-2,o=t+s[r]-s[r+1];break;default:r=e,o=n}if(c===void 0)switch(this.getSettings_().endingEnd){case jc:a=e,c=2*n-t;break;case Qc:a=1,c=n+s[1]-s[0];break;default:a=e-1,c=t}let h=(n-t)*.5,d=this.valueSize;this._weightPrev=h/(t-o),this._weightNext=h/(c-n),this._offsetPrev=r*d,this._offsetNext=a*d}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,h=c-o,d=this._offsetPrev,x=this._offsetNext,u=this._weightPrev,m=this._weightNext,y=(n-t)/(s-t),T=y*y,v=T*y,_=-u*v+2*u*T-u*y,R=(1+u)*v+(-1.5-2*u)*T+(-.5+u)*y+1,D=(-1-m)*v+(1.5+m)*T+.5*y,E=m*v-m*T;for(let I=0;I!==o;++I)r[I]=_*a[d+I]+R*a[h+I]+D*a[c+I]+E*a[x+I];return r}},il=class extends gs{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,h=c-o,d=(n-t)/(s-t),x=1-d;for(let u=0;u!==o;++u)r[u]=a[h+u]*x+a[c+u]*d;return r}},sl=class extends gs{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}},rl=class extends gs{interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,h=c-o,d=this.inTangents,x=this.outTangents;if(!d||!x){let y=(n-t)/(s-t),T=1-y;for(let v=0;v!==o;++v)r[v]=a[h+v]*T+a[c+v]*y;return r}let u=o*2,m=e-1;for(let y=0;y!==o;++y){let T=a[h+y],v=a[c+y],_=m*u+y*2,R=x[_],D=x[_+1],E=e*u+y*2,I=d[E],P=d[E+1],U=Zp(n,t,R,I,s);r[y]=Vd(U,T,D,P,v)}return r}};function Vd(i,e,t,n,s){let r=1-i;return r*r*r*e+3*r*r*i*t+3*r*i*i*n+i*i*i*s}function Yp(i,e,t,n,s){let r=1-i;return 3*r*r*(t-e)+6*r*i*(n-t)+3*i*i*(s-n)}function Zp(i,e,t,n,s){let r=(i-e)/(s-e);for(let a=0;a<8;a++){let o=Vd(r,e,t,n,s)-i;if(Math.abs(o)<1e-10)break;let c=Yp(r,e,t,n,s);if(Math.abs(c)<1e-10)break;r=Math.max(0,Math.min(1,r-o/c))}return r}var ri=class{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=hr(t,this.TimeBufferType),this.values=hr(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:hr(e.times,Array),values:hr(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s),Zc(e.settings)&&(n.settings={inTangents:hr(e.settings.inTangents,Array),outTangents:hr(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new sl(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new il(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new nl(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new rl(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case ta:t=this.InterpolantFactoryMethodDiscrete;break;case Oo:t=this.InterpolantFactoryMethodLinear;break;case To:t=this.InterpolantFactoryMethodSmooth;break;case Jc:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return Qe("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return ta;case this.InterpolantFactoryMethodLinear:return Oo;case this.InterpolantFactoryMethodSmooth:return To;case this.InterpolantFactoryMethodBezier:return Jc}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e;Zc(this.settings)&&(Yu(this.settings.inTangents,e),Yu(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,s=n.length,r=0,a=s-1;for(;r!==s&&n[r]<e;)++r;for(;a!==-1&&n[a]>t;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(nt("KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,s=this.values,r=n.length;r===0&&(nt("KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){let c=n[o];if(typeof c=="number"&&isNaN(c)){nt("KeyframeTrack: Time is not a valid number.",this,o,c),e=!1;break}if(a!==null&&a>c){nt("KeyframeTrack: Out of order keys.",this,o,c,a),e=!1;break}a=c}if(s!==void 0&&_p(s))for(let o=0,c=s.length;o!==c;++o){let h=s[o];if(isNaN(h)){nt("KeyframeTrack: Value is not a valid number.",this,o,h),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===To,r=e.length-1,a=1;for(let o=1;o<r;++o){let c=!1,h=e[o],d=e[o+1];if(h!==d&&(o!==1||h!==e[0]))if(s)c=!0;else{let x=o*n,u=x-n,m=x+n;for(let y=0;y!==n;++y){let T=t[x+y];if(T!==t[u+y]||T!==t[m+y]){c=!0;break}}}if(c){if(o!==a){e[a]=e[o];let x=o*n,u=a*n;for(let m=0;m!==n;++m)t[u+m]=t[x+m]}++a}}if(r>0){e[a]=e[r];for(let o=r*n,c=a*n,h=0;h!==n;++h)t[c+h]=t[o+h];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,Zc(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function Yu(i,e){for(let t=0,n=i.length;t!==n;t+=2)i[t]*=e}ri.prototype.ValueTypeName="";ri.prototype.TimeBufferType=Float32Array;ri.prototype.ValueBufferType=Float32Array;ri.prototype.DefaultInterpolation=Oo;var _s=class extends ri{constructor(e,t,n){super(e,t,n)}};_s.prototype.ValueTypeName="bool";_s.prototype.ValueBufferType=Array;_s.prototype.DefaultInterpolation=ta;_s.prototype.InterpolantFactoryMethodLinear=void 0;_s.prototype.InterpolantFactoryMethodSmooth=void 0;var al=class extends ri{constructor(e,t,n,s){super(e,t,n,s)}};al.prototype.ValueTypeName="color";var ol=class extends ri{constructor(e,t,n,s){super(e,t,n,s)}};ol.prototype.ValueTypeName="number";var ll=class extends gs{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=(n-t)/(s-t),h=e*o;for(let d=h+o;h!==d;h+=4)hi.slerpFlat(r,0,a,h-o,a,h,c);return r}},xa=class extends ri{constructor(e,t,n,s){super(e,t,n,s)}InterpolantFactoryMethodLinear(e){return new ll(this.times,this.values,this.getValueSize(),e)}};xa.prototype.ValueTypeName="quaternion";xa.prototype.InterpolantFactoryMethodSmooth=void 0;var xs=class extends ri{constructor(e,t,n){super(e,t,n)}};xs.prototype.ValueTypeName="string";xs.prototype.ValueBufferType=Array;xs.prototype.DefaultInterpolation=ta;xs.prototype.InterpolantFactoryMethodLinear=void 0;xs.prototype.InterpolantFactoryMethodSmooth=void 0;var cl=class extends ri{constructor(e,t,n,s){super(e,t,n,s)}};cl.prototype.ValueTypeName="vector";var Eo={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(Zu(i)||(this.files[i]=e))},get:function(i){if(this.enabled!==!1&&!Zu(i))return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}};function Zu(i){try{let e=i.slice(i.indexOf(":")+1);return new URL(e).protocol==="blob:"}catch{return!1}}var hl=class{constructor(e,t,n){let s=this,r=!1,a=0,o=0,c,h=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(d){o++,r===!1&&s.onStart!==void 0&&s.onStart(d,a,o),r=!0},this.itemEnd=function(d){a++,s.onProgress!==void 0&&s.onProgress(d,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(d){s.onError!==void 0&&s.onError(d)},this.resolveURL=function(d){return d=d.normalize("NFC"),c?c(d):d},this.setURLModifier=function(d){return c=d,this},this.addHandler=function(d,x){return h.push(d,x),this},this.removeHandler=function(d){let x=h.indexOf(d);return x!==-1&&h.splice(x,2),this},this.getHandler=function(d){for(let x=0,u=h.length;x<u;x+=2){let m=h[x],y=h[x+1];if(m.global&&(m.lastIndex=0),m.test(d))return y}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Gd=new hl,Ar=class{constructor(e){this.manager=e!==void 0?e:Gd,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};Ar.DEFAULT_MATERIAL_NAME="__DEFAULT";var ur=new WeakMap,ul=class extends Ar{constructor(e){super(e)}load(e,t,n,s){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,a=Eo.get(`image:${e}`);if(a!==void 0){if(a.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0);else{let x=ur.get(a);x===void 0&&(x=[],ur.set(a,x)),x.push({onLoad:t,onError:s})}return a}let o=_r("img");function c(){d(),t&&t(this);let x=ur.get(this)||[];for(let u=0;u<x.length;u++){let m=x[u];m.onLoad&&m.onLoad(this)}ur.delete(this),r.manager.itemEnd(e)}function h(x){d(),s&&s(x),Eo.remove(`image:${e}`);let u=ur.get(this)||[];for(let m=0;m<u.length;m++){let y=u[m];y.onError&&y.onError(x)}ur.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function d(){o.removeEventListener("load",c,!1),o.removeEventListener("error",h,!1)}return o.addEventListener("load",c,!1),o.addEventListener("error",h,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),Eo.add(`image:${e}`,o),r.manager.itemStart(e),o.src=e,o}};var va=class extends Ar{constructor(e){super(e)}load(e,t,n,s){let r=new In,a=new ul(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(o){r.image=o,r.needsUpdate=!0,t!==void 0&&t(r)},n,s),r}},ya=class extends gn{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new je(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},Ma=class extends ya{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(gn.DEFAULT_UP),this.updateMatrix(),this.groundColor=new je(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},$c=new Bt,$u=new N,Ju=new N,dl=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new ke(512,512),this.mapType=Yn,this.map=null,this.mapPass=null,this.matrix=new Bt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new Sr,this._frameExtents=new ke(1,1),this._viewportCount=1,this._viewports=[new qt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;$u.setFromMatrixPosition(e.matrixWorld),t.position.copy($u),Ju.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Ju),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,s){$c.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix($c,e.coordinateSystem,e.reversedDepth);let r=this._frameExtents,a=s?s.z/r.x:1,o=s?s.w/r.y:1,c=s?s.x/r.x:0,h=s?s.y/r.y:0;e.coordinateSystem===gr||e.reversedDepth?t.set(.5*a,0,0,.5*a+c,0,.5*o,0,.5*o+h,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+c,0,.5*o,0,.5*o+h,0,0,.5,.5,0,0,0,1),t.multiply($c)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},bo=new N,wo=new hi,Ii=new N,Sa=class extends gn{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Bt,this.projectionMatrix=new Bt,this.projectionMatrixInverse=new Bt,this.coordinateSystem=yi,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(bo,wo,Ii),Ii.x===1&&Ii.y===1&&Ii.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(bo,wo,Ii.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(bo,wo,Ii),Ii.x===1&&Ii.y===1&&Ii.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(bo,wo,Ii.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},rs=new N,Ku=new ke,ju=new ke,Pn=class extends Sa{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=Bo*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Sc*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Bo*2*Math.atan(Math.tan(Sc*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){rs.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(rs.x,rs.y).multiplyScalar(-e/rs.z),rs.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(rs.x,rs.y).multiplyScalar(-e/rs.z)}getViewSize(e,t){return this.getViewBounds(e,Ku,ju),t.subVectors(ju,Ku)}setViewOffset(e,t,n,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Sc*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let c=a.fullWidth,h=a.fullHeight;r+=a.offsetX*s/c,t-=a.offsetY*n/h,s*=a.width/c,n*=a.height/h}let o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}};var Er=class extends Sa{constructor(e=-1,t=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-e,a=n+e,o=s+t,c=s-t;if(this.view!==null&&this.view.enabled){let h=(this.right-this.left)/this.view.fullWidth/this.zoom,d=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=h*this.view.offsetX,a=r+h*this.view.width,o-=d*this.view.offsetY,c=o-d*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},nh=class extends dl{constructor(){super(new Er(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},ba=class extends ya{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(gn.DEFAULT_UP),this.updateMatrix(),this.target=new gn,this.shadow=new nh}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}};var dr=-90,fr=1,fl=class extends gn{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Pn(dr,fr,e,t);s.layers=this.layers,this.add(s);let r=new Pn(dr,fr,e,t);r.layers=this.layers,this.add(r);let a=new Pn(dr,fr,e,t);a.layers=this.layers,this.add(a);let o=new Pn(dr,fr,e,t);o.layers=this.layers,this.add(o);let c=new Pn(dr,fr,e,t);c.layers=this.layers,this.add(c);let h=new Pn(dr,fr,e,t);h.layers=this.layers,this.add(h)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,s,r,a,o,c]=t;for(let h of t)this.remove(h);if(e===yi)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===gr)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let h of t)this.add(h),h.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,c,h,d]=this.children,x=e.getRenderTarget(),u=e.getActiveCubeFace(),m=e.getActiveMipmapLevel(),y=e.xr.enabled;e.xr.enabled=!1;let T=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let v=!1;e.isWebGLRenderer===!0?v=e.state.buffers.depth.getReversed():v=e.reversedDepthBuffer,e.setRenderTarget(n,0,s),v&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,s),v&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,s),v&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,s),v&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),e.setRenderTarget(n,4,s),v&&e.autoClear===!1&&e.clearDepth(),e.render(t,h),n.texture.generateMipmaps=T,e.setRenderTarget(n,5,s),v&&e.autoClear===!1&&e.clearDepth(),e.render(t,d),e.setRenderTarget(x,u,m),e.xr.enabled=y,n.texture.needsPMREMUpdate=!0}},pl=class extends Pn{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var Ph="\\[\\]\\.:\\/",$p=new RegExp("["+Ph+"]","g"),Ih="[^"+Ph+"]",Jp="[^"+Ph.replace("\\.","")+"]",Kp=/((?:WC+[\/:])*)/.source.replace("WC",Ih),jp=/(WCOD+)?/.source.replace("WCOD",Jp),Qp=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Ih),em=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Ih),tm=new RegExp("^"+Kp+jp+Qp+em+"$"),nm=["material","materials","bones","map"],ih=class{constructor(e,t,n){let s=n||Wt.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},Wt=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace($p,"")}static parseTrackName(e){let t=tm.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);nm.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===t||o.uuid===t)return o;let c=n(o.children);if(c)return c}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){Qe("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let h=t.objectIndex;switch(n){case"materials":if(!e.material){nt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){nt("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){nt("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let d=0;d<e.length;d++)if(e[d].name===h){h=d;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){nt("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){nt("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){nt("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(h!==void 0){if(e[h]===void 0){nt("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[h]}}let a=e[s];if(a===void 0){let h=t.nodeName;nt("PropertyBinding: Trying to update property for track: "+h+"."+s+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){nt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){nt("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}c=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(c=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Wt.Composite=ih;Wt.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Wt.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Wt.prototype.GetterByBindingType=[Wt.prototype._getValue_direct,Wt.prototype._getValue_array,Wt.prototype._getValue_arrayElement,Wt.prototype._getValue_toArray];Wt.prototype.SetterByBindingTypeAndVersioning=[[Wt.prototype._setValue_direct,Wt.prototype._setValue_direct_setNeedsUpdate,Wt.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Wt.prototype._setValue_array,Wt.prototype._setValue_array_setNeedsUpdate,Wt.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Wt.prototype._setValue_arrayElement,Wt.prototype._setValue_arrayElement_setNeedsUpdate,Wt.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Wt.prototype._setValue_fromArray,Wt.prototype._setValue_fromArray_setNeedsUpdate,Wt.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var ev=new Float32Array(1);var Qu=new Bt,wa=class{constructor(e,t,n=0,s=1/0){this.ray=new Ns(e,t),this.near=n,this.far=s,this.camera=null,this.layers=new yr,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):nt("Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return Qu.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Qu),this}intersectObject(e,t=!0,n=[]){return sh(e,this,n,t),n.sort(ed),n}intersectObjects(e,t=!0,n=[]){for(let s=0,r=e.length;s<r;s++)sh(e[s],this,n,t);return n.sort(ed),n}};function ed(i,e){return i.distance-e.distance}function sh(i,e,t,n){let s=!0;if(i.layers.test(e.layers)&&i.raycast(e,t)===!1&&(s=!1),s===!0&&n===!0){let r=i.children;for(let a=0,o=r.length;a<o;a++)sh(r[a],e,t,!0)}}var Oh=class Oh{constructor(e,t,n,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,s){let r=this.elements;return r[0]=e,r[2]=t,r[1]=n,r[3]=s,this}};Oh.prototype.isMatrix2=!0;var rh=Oh;function Lh(i,e,t,n){let s=im(n);switch(t){case bh:return i*e;case Th:return i*e/s.components*s.byteLength;case bl:return i*e/s.components*s.byteLength;case ws:return i*e*2/s.components*s.byteLength;case wl:return i*e*2/s.components*s.byteLength;case wh:return i*e*3/s.components*s.byteLength;case fi:return i*e*4/s.components*s.byteLength;case Tl:return i*e*4/s.components*s.byteLength;case Ca:case Ra:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Pa:case Ia:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case El:case Rl:return Math.max(i,16)*Math.max(e,8)/4;case Al:case Cl:return Math.max(i,8)*Math.max(e,8)/2;case Pl:case Il:case Dl:case Nl:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Ll:case La:case Ul:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Fl:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Ol:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Bl:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case kl:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case zl:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case Vl:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case Gl:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case Hl:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Wl:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case Xl:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case ql:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case Yl:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case Zl:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case $l:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case Jl:case Kl:case jl:return Math.ceil(i/4)*Math.ceil(e/4)*16;case Ql:case ec:return Math.ceil(i/4)*Math.ceil(e/4)*8;case Da:case tc:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function im(i){switch(i){case Yn:case vh:return{byteLength:1,components:1};case Rr:case yh:case Ei:return{byteLength:2,components:1};case Ml:case Sl:return{byteLength:2,components:4};case Ti:case yl:case Ai:return{byteLength:4,components:1};case Mh:case Sh:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?Qe("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function uf(){let i=null,e=!1,t=null,n=null;function s(r,a){n=i.requestAnimationFrame(s),t(r,a)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function rm(i){let e=new WeakMap;function t(o,c){let h=o.array,d=o.usage,x=h.byteLength,u=i.createBuffer();i.bindBuffer(c,u),i.bufferData(c,h,d),o.onUploadCallback();let m;if(h instanceof Float32Array)m=i.FLOAT;else if(typeof Float16Array<"u"&&h instanceof Float16Array)m=i.HALF_FLOAT;else if(h instanceof Uint16Array)o.isFloat16BufferAttribute?m=i.HALF_FLOAT:m=i.UNSIGNED_SHORT;else if(h instanceof Int16Array)m=i.SHORT;else if(h instanceof Uint32Array)m=i.UNSIGNED_INT;else if(h instanceof Int32Array)m=i.INT;else if(h instanceof Int8Array)m=i.BYTE;else if(h instanceof Uint8Array)m=i.UNSIGNED_BYTE;else if(h instanceof Uint8ClampedArray)m=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+h);return{buffer:u,type:m,bytesPerElement:h.BYTES_PER_ELEMENT,version:o.version,size:x}}function n(o,c,h){let d=c.array,x=c.updateRanges;if(i.bindBuffer(h,o),x.length===0)i.bufferSubData(h,0,d);else{x.sort((m,y)=>m.start-y.start);let u=0;for(let m=1;m<x.length;m++){let y=x[u],T=x[m];T.start<=y.start+y.count+1?y.count=Math.max(y.count,T.start+T.count-y.start):(++u,x[u]=T)}x.length=u+1;for(let m=0,y=x.length;m<y;m++){let T=x[m];i.bufferSubData(h,T.start*d.BYTES_PER_ELEMENT,d,T.start,T.count)}c.clearUpdateRanges()}c.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let c=e.get(o);c&&(i.deleteBuffer(c.buffer),e.delete(o))}function a(o,c){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let d=e.get(o);(!d||d.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let h=e.get(o);if(h===void 0)e.set(o,t(o,c));else if(h.version<o.version){if(h.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(h.buffer,o,c),h.version=o.version}}return{get:s,remove:r,update:a}}var am=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,om=`#ifdef USE_ALPHAHASH
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
#endif`,lm=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,cm=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,hm=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,um=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,dm=`#ifdef USE_AOMAP
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
#endif`,fm=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,pm=`#ifdef USE_BATCHING
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
#endif`,mm=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,gm=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,_m=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,xm=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,vm=`#ifdef USE_IRIDESCENCE
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
#endif`,ym=`#ifdef USE_BUMPMAP
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
#endif`,Mm=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Sm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,bm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,wm=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Tm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Am=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,Em=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Cm=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,Rm=`#define PI 3.141592653589793
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
} // validated`,Pm=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,Im=`vec3 transformedNormal = objectNormal;
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
#endif`,Lm=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Dm=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Nm=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Um=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Fm="gl_FragColor = linearToOutputTexel( gl_FragColor );",Om=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Bm=`#ifdef USE_ENVMAP
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
#endif`,km=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,zm=`#ifdef USE_ENVMAP
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
#endif`,Vm=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Gm=`#ifdef USE_ENVMAP
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
#endif`,Hm=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Wm=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Xm=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,qm=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,Ym=`#ifdef USE_GRADIENTMAP
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
}`,Zm=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,$m=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Jm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Km=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,jm=`#ifdef USE_ENVMAP
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
#endif`,Qm=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,e0=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,t0=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,n0=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,i0=`PhysicalMaterial material;
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
#endif`,s0=`uniform sampler2D dfgLUT;
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
}`,r0=`
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
#endif`,a0=`#if defined( RE_IndirectDiffuse )
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
#endif`,o0=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,l0=`#ifdef USE_LIGHT_PROBES_GRID
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
#endif`,c0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,h0=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,u0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,d0=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,f0=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,p0=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,m0=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,g0=`#if defined( USE_POINTS_UV )
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
#endif`,_0=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,x0=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,v0=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,y0=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,M0=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,S0=`#ifdef USE_MORPHTARGETS
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
#endif`,b0=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,w0=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,T0=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,A0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,E0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,C0=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,R0=`#ifdef USE_NORMALMAP
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
#endif`,P0=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,I0=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,L0=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,D0=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,N0=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,U0=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,F0=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,O0=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,B0=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,k0=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,z0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,V0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,G0=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,H0=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,W0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,X0=`float getShadowMask() {
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
}`,q0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,Y0=`#ifdef USE_SKINNING
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
#endif`,Z0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,$0=`#ifdef USE_SKINNING
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
#endif`,J0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,K0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,j0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Q0=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,eg=`#ifdef USE_TRANSMISSION
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
#endif`,tg=`#ifdef USE_TRANSMISSION
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
#endif`,ng=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,ig=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,sg=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,rg=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,ag=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,og=`uniform sampler2D t2D;
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
}`,lg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,cg=`#ifdef ENVMAP_TYPE_CUBE
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
}`,hg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,ug=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,dg=`#include <common>
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
}`,fg=`#if DEPTH_PACKING == 3200
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
}`,pg=`#define DISTANCE
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
}`,mg=`#define DISTANCE
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
}`,gg=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,_g=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,xg=`uniform float scale;
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
}`,vg=`uniform vec3 diffuse;
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
}`,yg=`#include <common>
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
}`,Mg=`uniform vec3 diffuse;
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
}`,Sg=`#define LAMBERT
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
}`,bg=`#define LAMBERT
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
}`,wg=`#define MATCAP
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
}`,Tg=`#define MATCAP
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
}`,Ag=`#define NORMAL
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
}`,Eg=`#define NORMAL
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
}`,Cg=`#define PHONG
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
}`,Rg=`#define PHONG
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
}`,Pg=`#define STANDARD
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
}`,Ig=`#define STANDARD
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
}`,Lg=`#define TOON
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
}`,Dg=`#define TOON
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
}`,Ng=`uniform float size;
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
}`,Ug=`uniform vec3 diffuse;
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
}`,Fg=`#include <common>
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
}`,Og=`uniform vec3 color;
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
}`,Bg=`uniform float rotation;
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
}`,kg=`uniform vec3 diffuse;
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
}`,mt={alphahash_fragment:am,alphahash_pars_fragment:om,alphamap_fragment:lm,alphamap_pars_fragment:cm,alphatest_fragment:hm,alphatest_pars_fragment:um,aomap_fragment:dm,aomap_pars_fragment:fm,batching_pars_vertex:pm,batching_vertex:mm,begin_vertex:gm,beginnormal_vertex:_m,bsdfs:xm,iridescence_fragment:vm,bumpmap_pars_fragment:ym,clipping_planes_fragment:Mm,clipping_planes_pars_fragment:Sm,clipping_planes_pars_vertex:bm,clipping_planes_vertex:wm,color_fragment:Tm,color_pars_fragment:Am,color_pars_vertex:Em,color_vertex:Cm,common:Rm,cube_uv_reflection_fragment:Pm,defaultnormal_vertex:Im,displacementmap_pars_vertex:Lm,displacementmap_vertex:Dm,emissivemap_fragment:Nm,emissivemap_pars_fragment:Um,colorspace_fragment:Fm,colorspace_pars_fragment:Om,envmap_fragment:Bm,envmap_common_pars_fragment:km,envmap_pars_fragment:zm,envmap_pars_vertex:Vm,envmap_physical_pars_fragment:jm,envmap_vertex:Gm,fog_vertex:Hm,fog_pars_vertex:Wm,fog_fragment:Xm,fog_pars_fragment:qm,gradientmap_pars_fragment:Ym,lightmap_pars_fragment:Zm,lights_lambert_fragment:$m,lights_lambert_pars_fragment:Jm,lights_pars_begin:Km,lights_toon_fragment:Qm,lights_toon_pars_fragment:e0,lights_phong_fragment:t0,lights_phong_pars_fragment:n0,lights_physical_fragment:i0,lights_physical_pars_fragment:s0,lights_fragment_begin:r0,lights_fragment_maps:a0,lights_fragment_end:o0,lightprobes_pars_fragment:l0,logdepthbuf_fragment:c0,logdepthbuf_pars_fragment:h0,logdepthbuf_pars_vertex:u0,logdepthbuf_vertex:d0,map_fragment:f0,map_pars_fragment:p0,map_particle_fragment:m0,map_particle_pars_fragment:g0,metalnessmap_fragment:_0,metalnessmap_pars_fragment:x0,morphinstance_vertex:v0,morphcolor_vertex:y0,morphnormal_vertex:M0,morphtarget_pars_vertex:S0,morphtarget_vertex:b0,normal_fragment_begin:w0,normal_fragment_maps:T0,normal_pars_fragment:A0,normal_pars_vertex:E0,normal_vertex:C0,normalmap_pars_fragment:R0,clearcoat_normal_fragment_begin:P0,clearcoat_normal_fragment_maps:I0,clearcoat_pars_fragment:L0,iridescence_pars_fragment:D0,opaque_fragment:N0,packing:U0,premultiplied_alpha_fragment:F0,project_vertex:O0,dithering_fragment:B0,dithering_pars_fragment:k0,roughnessmap_fragment:z0,roughnessmap_pars_fragment:V0,shadowmap_pars_fragment:G0,shadowmap_pars_vertex:H0,shadowmap_vertex:W0,shadowmask_pars_fragment:X0,skinbase_vertex:q0,skinning_pars_vertex:Y0,skinning_vertex:Z0,skinnormal_vertex:$0,specularmap_fragment:J0,specularmap_pars_fragment:K0,tonemapping_fragment:j0,tonemapping_pars_fragment:Q0,transmission_fragment:eg,transmission_pars_fragment:tg,uv_pars_fragment:ng,uv_pars_vertex:ig,uv_vertex:sg,worldpos_vertex:rg,background_vert:ag,background_frag:og,backgroundCube_vert:lg,backgroundCube_frag:cg,cube_vert:hg,cube_frag:ug,depth_vert:dg,depth_frag:fg,distance_vert:pg,distance_frag:mg,equirect_vert:gg,equirect_frag:_g,linedashed_vert:xg,linedashed_frag:vg,meshbasic_vert:yg,meshbasic_frag:Mg,meshlambert_vert:Sg,meshlambert_frag:bg,meshmatcap_vert:wg,meshmatcap_frag:Tg,meshnormal_vert:Ag,meshnormal_frag:Eg,meshphong_vert:Cg,meshphong_frag:Rg,meshphysical_vert:Pg,meshphysical_frag:Ig,meshtoon_vert:Lg,meshtoon_frag:Dg,points_vert:Ng,points_frag:Ug,shadow_vert:Fg,shadow_frag:Og,sprite_vert:Bg,sprite_frag:kg},De={common:{diffuse:{value:new je(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new at},alphaMap:{value:null},alphaMapTransform:{value:new at},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new at}},envmap:{envMap:{value:null},envMapRotation:{value:new at},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new at}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new at}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new at},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new at},normalScale:{value:new ke(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new at},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new at}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new at}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new at}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new je(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new N},probesMax:{value:new N},probesResolution:{value:new N}},points:{diffuse:{value:new je(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new at},alphaTest:{value:0},uvTransform:{value:new at}},sprite:{diffuse:{value:new je(16777215)},opacity:{value:1},center:{value:new ke(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new at},alphaMap:{value:null},alphaMapTransform:{value:new at},alphaTest:{value:0}}},zi={basic:{uniforms:Dn([De.common,De.specularmap,De.envmap,De.aomap,De.lightmap,De.fog]),vertexShader:mt.meshbasic_vert,fragmentShader:mt.meshbasic_frag},lambert:{uniforms:Dn([De.common,De.specularmap,De.envmap,De.aomap,De.lightmap,De.emissivemap,De.bumpmap,De.normalmap,De.displacementmap,De.fog,De.lights,{emissive:{value:new je(0)},envMapIntensity:{value:1}}]),vertexShader:mt.meshlambert_vert,fragmentShader:mt.meshlambert_frag},phong:{uniforms:Dn([De.common,De.specularmap,De.envmap,De.aomap,De.lightmap,De.emissivemap,De.bumpmap,De.normalmap,De.displacementmap,De.fog,De.lights,{emissive:{value:new je(0)},specular:{value:new je(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:mt.meshphong_vert,fragmentShader:mt.meshphong_frag},standard:{uniforms:Dn([De.common,De.envmap,De.aomap,De.lightmap,De.emissivemap,De.bumpmap,De.normalmap,De.displacementmap,De.roughnessmap,De.metalnessmap,De.fog,De.lights,{emissive:{value:new je(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:mt.meshphysical_vert,fragmentShader:mt.meshphysical_frag},toon:{uniforms:Dn([De.common,De.aomap,De.lightmap,De.emissivemap,De.bumpmap,De.normalmap,De.displacementmap,De.gradientmap,De.fog,De.lights,{emissive:{value:new je(0)}}]),vertexShader:mt.meshtoon_vert,fragmentShader:mt.meshtoon_frag},matcap:{uniforms:Dn([De.common,De.bumpmap,De.normalmap,De.displacementmap,De.fog,{matcap:{value:null}}]),vertexShader:mt.meshmatcap_vert,fragmentShader:mt.meshmatcap_frag},points:{uniforms:Dn([De.points,De.fog]),vertexShader:mt.points_vert,fragmentShader:mt.points_frag},dashed:{uniforms:Dn([De.common,De.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:mt.linedashed_vert,fragmentShader:mt.linedashed_frag},depth:{uniforms:Dn([De.common,De.displacementmap]),vertexShader:mt.depth_vert,fragmentShader:mt.depth_frag},normal:{uniforms:Dn([De.common,De.bumpmap,De.normalmap,De.displacementmap,{opacity:{value:1}}]),vertexShader:mt.meshnormal_vert,fragmentShader:mt.meshnormal_frag},sprite:{uniforms:Dn([De.sprite,De.fog]),vertexShader:mt.sprite_vert,fragmentShader:mt.sprite_frag},background:{uniforms:{uvTransform:{value:new at},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:mt.background_vert,fragmentShader:mt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new at}},vertexShader:mt.backgroundCube_vert,fragmentShader:mt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:mt.cube_vert,fragmentShader:mt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:mt.equirect_vert,fragmentShader:mt.equirect_frag},distance:{uniforms:Dn([De.common,De.displacementmap,{referencePosition:{value:new N},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:mt.distance_vert,fragmentShader:mt.distance_frag},shadow:{uniforms:Dn([De.lights,De.fog,{color:{value:new je(0)},opacity:{value:1}}]),vertexShader:mt.shadow_vert,fragmentShader:mt.shadow_frag}};zi.physical={uniforms:Dn([zi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new at},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new at},clearcoatNormalScale:{value:new ke(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new at},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new at},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new at},sheen:{value:0},sheenColor:{value:new je(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new at},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new at},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new at},transmissionSamplerSize:{value:new ke},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new at},attenuationDistance:{value:0},attenuationColor:{value:new je(0)},specularColor:{value:new je(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new at},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new at},anisotropyVector:{value:new ke},anisotropyMap:{value:null},anisotropyMapTransform:{value:new at}}]),vertexShader:mt.meshphysical_vert,fragmentShader:mt.meshphysical_frag};var rc={r:0,b:0,g:0},zg=new Bt,df=new at;df.set(-1,0,0,0,1,0,0,0,1);function Vg(i,e,t,n,s,r){let a=new je(0),o=s===!0?0:1,c,h,d=null,x=0,u=null;function m(R){let D=R.isScene===!0?R.background:null;if(D&&D.isTexture){let E=R.backgroundBlurriness>0;D=e.get(D,E)}return D}function y(R){let D=!1,E=m(R);E===null?v(a,o):E&&E.isColor&&(v(E,1),D=!0);let I=i.xr.getEnvironmentBlendMode();I==="additive"?t.buffers.color.setClear(0,0,0,1,r):I==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(i.autoClear||D)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function T(R,D){let E=m(D);E&&(E.isCubeTexture||E.mapping===Aa)?(h===void 0&&(h=new ct(new bi(1,1,1),new dn({name:"BackgroundCubeMaterial",uniforms:Vs(zi.backgroundCube.uniforms),vertexShader:zi.backgroundCube.vertexShader,fragmentShader:zi.backgroundCube.fragmentShader,side:Sn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(I,P,U){this.matrixWorld.copyPosition(U.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(h)),h.material.uniforms.envMap.value=E,h.material.uniforms.backgroundBlurriness.value=D.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=D.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(zg.makeRotationFromEuler(D.backgroundRotation)).transpose(),E.isCubeTexture&&E.isRenderTargetTexture===!1&&h.material.uniforms.backgroundRotation.value.premultiply(df),h.material.toneMapped=St.getTransfer(E.colorSpace)!==Nt,(d!==E||x!==E.version||u!==i.toneMapping)&&(h.material.needsUpdate=!0,d=E,x=E.version,u=i.toneMapping),h.layers.enableAll(),R.unshift(h,h.geometry,h.material,0,0,null)):E&&E.isTexture&&(c===void 0&&(c=new ct(new Oi(2,2),new dn({name:"BackgroundMaterial",uniforms:Vs(zi.background.uniforms),vertexShader:zi.background.vertexShader,fragmentShader:zi.background.fragmentShader,side:vs,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(c)),c.material.uniforms.t2D.value=E,c.material.uniforms.backgroundIntensity.value=D.backgroundIntensity,c.material.toneMapped=St.getTransfer(E.colorSpace)!==Nt,E.matrixAutoUpdate===!0&&E.updateMatrix(),c.material.uniforms.uvTransform.value.copy(E.matrix),(d!==E||x!==E.version||u!==i.toneMapping)&&(c.material.needsUpdate=!0,d=E,x=E.version,u=i.toneMapping),c.layers.enableAll(),R.unshift(c,c.geometry,c.material,0,0,null))}function v(R,D){R.getRGB(rc,Rh(i)),t.buffers.color.setClear(rc.r,rc.g,rc.b,D,r)}function _(){h!==void 0&&(h.geometry.dispose(),h.material.dispose(),h=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return a},setClearColor:function(R,D=1){a.set(R),o=D,v(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(R){o=R,v(a,o)},render:y,addToRenderList:T,dispose:_}}function Gg(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=u(null),r=s,a=!1;function o(H,Y,Q,V,te){let fe=!1,ue=x(H,V,Q,Y);r!==ue&&(r=ue,h(r.object)),fe=m(H,V,Q,te),fe&&y(H,V,Q,te),te!==null&&e.update(te,i.ELEMENT_ARRAY_BUFFER),(fe||a)&&(a=!1,E(H,Y,Q,V),te!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(te).buffer))}function c(){return i.createVertexArray()}function h(H){return i.bindVertexArray(H)}function d(H){return i.deleteVertexArray(H)}function x(H,Y,Q,V){let te=V.wireframe===!0,fe=n[Y.id];fe===void 0&&(fe={},n[Y.id]=fe);let ue=H.isInstancedMesh===!0?H.id:0,ye=fe[ue];ye===void 0&&(ye={},fe[ue]=ye);let oe=ye[Q.id];oe===void 0&&(oe={},ye[Q.id]=oe);let q=oe[te];return q===void 0&&(q=u(c()),oe[te]=q),q}function u(H){let Y=[],Q=[],V=[];for(let te=0;te<t;te++)Y[te]=0,Q[te]=0,V[te]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:Y,enabledAttributes:Q,attributeDivisors:V,object:H,attributes:{},index:null}}function m(H,Y,Q,V){let te=r.attributes,fe=Y.attributes,ue=0,ye=Q.getAttributes();for(let oe in ye)if(ye[oe].location>=0){let xe=te[oe],qe=fe[oe];if(qe===void 0&&(oe==="instanceMatrix"&&H.instanceMatrix&&(qe=H.instanceMatrix),oe==="instanceColor"&&H.instanceColor&&(qe=H.instanceColor)),xe===void 0||xe.attribute!==qe||qe&&xe.data!==qe.data)return!0;ue++}return r.attributesNum!==ue||r.index!==V}function y(H,Y,Q,V){let te={},fe=Y.attributes,ue=0,ye=Q.getAttributes();for(let oe in ye)if(ye[oe].location>=0){let xe=fe[oe];xe===void 0&&(oe==="instanceMatrix"&&H.instanceMatrix&&(xe=H.instanceMatrix),oe==="instanceColor"&&H.instanceColor&&(xe=H.instanceColor));let qe={};qe.attribute=xe,xe&&xe.data&&(qe.data=xe.data),te[oe]=qe,ue++}r.attributes=te,r.attributesNum=ue,r.index=V}function T(){let H=r.newAttributes;for(let Y=0,Q=H.length;Y<Q;Y++)H[Y]=0}function v(H){_(H,0)}function _(H,Y){let Q=r.newAttributes,V=r.enabledAttributes,te=r.attributeDivisors;Q[H]=1,V[H]===0&&(i.enableVertexAttribArray(H),V[H]=1),te[H]!==Y&&(i.vertexAttribDivisor(H,Y),te[H]=Y)}function R(){let H=r.newAttributes,Y=r.enabledAttributes;for(let Q=0,V=Y.length;Q<V;Q++)Y[Q]!==H[Q]&&(i.disableVertexAttribArray(Q),Y[Q]=0)}function D(H,Y,Q,V,te,fe,ue){ue===!0?i.vertexAttribIPointer(H,Y,Q,te,fe):i.vertexAttribPointer(H,Y,Q,V,te,fe)}function E(H,Y,Q,V){T();let te=V.attributes,fe=Q.getAttributes(),ue=Y.defaultAttributeValues;for(let ye in fe){let oe=fe[ye];if(oe.location>=0){let q=te[ye];if(q===void 0&&(ye==="instanceMatrix"&&H.instanceMatrix&&(q=H.instanceMatrix),ye==="instanceColor"&&H.instanceColor&&(q=H.instanceColor)),q!==void 0){let xe=q.normalized,qe=q.itemSize,Ze=e.get(q);if(Ze===void 0)continue;let Ut=Ze.buffer,xt=Ze.type,gt=Ze.bytesPerElement,he=xt===i.INT||xt===i.UNSIGNED_INT||q.gpuType===yl;if(q.isInterleavedBufferAttribute){let ge=q.data,Be=ge.stride,tt=q.offset;if(ge.isInstancedInterleavedBuffer){for(let Se=0;Se<oe.locationSize;Se++)_(oe.location+Se,ge.meshPerAttribute);H.isInstancedMesh!==!0&&V._maxInstanceCount===void 0&&(V._maxInstanceCount=ge.meshPerAttribute*ge.count)}else for(let Se=0;Se<oe.locationSize;Se++)v(oe.location+Se);i.bindBuffer(i.ARRAY_BUFFER,Ut);for(let Se=0;Se<oe.locationSize;Se++)D(oe.location+Se,qe/oe.locationSize,xt,xe,Be*gt,(tt+qe/oe.locationSize*Se)*gt,he)}else{if(q.isInstancedBufferAttribute){for(let ge=0;ge<oe.locationSize;ge++)_(oe.location+ge,q.meshPerAttribute);H.isInstancedMesh!==!0&&V._maxInstanceCount===void 0&&(V._maxInstanceCount=q.meshPerAttribute*q.count)}else for(let ge=0;ge<oe.locationSize;ge++)v(oe.location+ge);i.bindBuffer(i.ARRAY_BUFFER,Ut);for(let ge=0;ge<oe.locationSize;ge++)D(oe.location+ge,qe/oe.locationSize,xt,xe,qe*gt,qe/oe.locationSize*ge*gt,he)}}else if(ue!==void 0){let xe=ue[ye];if(xe!==void 0)switch(xe.length){case 2:i.vertexAttrib2fv(oe.location,xe);break;case 3:i.vertexAttrib3fv(oe.location,xe);break;case 4:i.vertexAttrib4fv(oe.location,xe);break;default:i.vertexAttrib1fv(oe.location,xe)}}}}R()}function I(){C();for(let H in n){let Y=n[H];for(let Q in Y){let V=Y[Q];for(let te in V){let fe=V[te];for(let ue in fe)d(fe[ue].object),delete fe[ue];delete V[te]}}delete n[H]}}function P(H){if(n[H.id]===void 0)return;let Y=n[H.id];for(let Q in Y){let V=Y[Q];for(let te in V){let fe=V[te];for(let ue in fe)d(fe[ue].object),delete fe[ue];delete V[te]}}delete n[H.id]}function U(H){for(let Y in n){let Q=n[Y];for(let V in Q){let te=Q[V];if(te[H.id]===void 0)continue;let fe=te[H.id];for(let ue in fe)d(fe[ue].object),delete fe[ue];delete te[H.id]}}}function b(H){for(let Y in n){let Q=n[Y],V=H.isInstancedMesh===!0?H.id:0,te=Q[V];if(te!==void 0){for(let fe in te){let ue=te[fe];for(let ye in ue)d(ue[ye].object),delete ue[ye];delete te[fe]}delete Q[V],Object.keys(Q).length===0&&delete n[Y]}}}function C(){O(),a=!0,r!==s&&(r=s,h(r.object))}function O(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:C,resetDefaultState:O,dispose:I,releaseStatesOfGeometry:P,releaseStatesOfObject:b,releaseStatesOfProgram:U,initAttributes:T,enableAttribute:v,disableUnusedAttributes:R}}function Hg(i,e,t){let n;function s(c){n=c}function r(c,h){i.drawArrays(n,c,h),t.update(h,n,1)}function a(c,h,d){d!==0&&(i.drawArraysInstanced(n,c,h,d),t.update(h,n,d))}function o(c,h,d){if(d===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,d);let u=0;for(let m=0;m<d;m++)u+=h[m];t.update(u,n,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function Wg(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let U=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(U.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(U){return!(U!==fi&&n.convert(U)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(U){let b=U===Ei&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(U!==Yn&&U!==Ai&&!b&&n.convert(U)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function c(U){if(U==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";U="mediump"}return U==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let h=t.precision!==void 0?t.precision:"highp",d=c(h);d!==h&&(Qe("WebGLRenderer:",h,"not supported, using",d,"instead."),h=d);let x=t.logarithmicDepthBuffer===!0,u=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&u===!1&&Qe("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let m=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),y=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),T=i.getParameter(i.MAX_TEXTURE_SIZE),v=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),_=i.getParameter(i.MAX_VERTEX_ATTRIBS),R=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),D=i.getParameter(i.MAX_VARYING_VECTORS),E=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),I=i.getParameter(i.MAX_SAMPLES),P=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:a,textureTypeReadable:o,precision:h,logarithmicDepthBuffer:x,reversedDepthBuffer:u,maxTextures:m,maxVertexTextures:y,maxTextureSize:T,maxCubemapSize:v,maxAttributes:_,maxVertexUniforms:R,maxVaryings:D,maxFragmentUniforms:E,maxSamples:I,samples:P}}function Xg(i){let e=this,t=null,n=0,s=!1,r=!1,a=new vi,o=new at,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(x,u){let m=x.length!==0||u||n!==0||s;return s=u,n=x.length,m},this.beginShadows=function(){r=!0,d(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(x,u){t=d(x,u,0)},this.setState=function(x,u,m){let y=x.clippingPlanes,T=x.clipIntersection,v=x.clipShadows,_=i.get(x);if(!s||y===null||y.length===0||r&&!v)r?d(null):h();else{let R=r?0:n,D=R*4,E=_.clippingState||null;c.value=E,E=d(y,u,D,m);for(let I=0;I!==D;++I)E[I]=t[I];_.clippingState=E,this.numIntersection=T?this.numPlanes:0,this.numPlanes+=R}};function h(){c.value!==t&&(c.value=t,c.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function d(x,u,m,y){let T=x!==null?x.length:0,v=null;if(T!==0){if(v=c.value,y!==!0||v===null){let _=m+T*4,R=u.matrixWorldInverse;o.getNormalMatrix(R),(v===null||v.length<_)&&(v=new Float32Array(_));for(let D=0,E=m;D!==T;++D,E+=4)a.copy(x[D]).applyMatrix4(R,o),a.normal.toArray(v,E),v[E+3]=a.constant}c.value=v,c.needsUpdate=!0}return e.numPlanes=T,e.numIntersection=0,v}}var Lr=4,qg=6,Yg=20,Zg=256,Na=new Er,Hd=new je,Bh=null,kh=0,zh=0,Vh=!1,$g=new N,Gs=new N,oc=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,s=100,r={}){let{size:a=256,position:o=$g}=r;Bh=this._renderer.getRenderTarget(),kh=this._renderer.getActiveCubeFace(),zh=this._renderer.getActiveMipmapLevel(),Vh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(e,n,s,c,o),t>0&&this._blur(c,0,0,t),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=qd(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Xd(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Bh,kh,zh),this._renderer.xr.enabled=Vh,e.scissorTest=!1,Ir(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===Ms||e.mapping===zs?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Bh=this._renderer.getRenderTarget(),kh=this._renderer.getActiveCubeFace(),zh=this._renderer.getActiveMipmapLevel(),Vh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:bn,minFilter:bn,generateMipmaps:!1,type:Ei,format:fi,colorSpace:na,depthBuffer:!1},s=Wd(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Wd(e,t,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=Jg(r)),this._blurMaterial=jg(r,e,t),this._ggxMaterial=Kg(r,e,t)}return s}_compileMaterial(e){let t=new ct(new Lt,e);this._renderer.compile(t,Na)}_sceneToCubeUV(e,t,n,s,r){let c=new Pn(90,1,t,n),h=[1,-1,1,1,1,1],d=[1,1,1,-1,-1,-1],x=this._renderer,u=x.autoClear,m=x.toneMapping;x.getClearColor(Hd),x.toneMapping=wi,x.autoClear=!1,x.state.buffers.depth.getReversed()&&(x.setRenderTarget(s),x.clearDepth(),x.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new ct(new bi,new rn({name:"PMREM.Background",side:Sn,depthWrite:!1,depthTest:!1})));let T=this._backgroundBox,v=T.material,_=!1,R=e.background;R?R.isColor&&(v.color.copy(R),e.background=null,_=!0):(v.color.copy(Hd),_=!0);for(let D=0;D<6;D++){let E=D%3;E===0?(c.up.set(0,h[D],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x+d[D],r.y,r.z)):E===1?(c.up.set(0,0,h[D]),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y+d[D],r.z)):(c.up.set(0,h[D],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y,r.z+d[D]));let I=this._cubeSize;Ir(s,E*I,D>2?I:0,I,I),x.setRenderTarget(s),_&&x.render(T,c),x.render(e,c)}x.toneMapping=m,x.autoClear=u,e.background=R}_textureToCubeUV(e,t){let n=this._renderer,s=e.mapping===Ms||e.mapping===zs;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=qd()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Xd());let r=s?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;let o=r.uniforms;o.envMap.value=e;let c=this._cubeSize;Ir(t,0,0,3*c,2*c),n.setRenderTarget(t),n.render(a,Na)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=n}_applyGGXFilter(e,t,n){let s=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let c=a.uniforms,h=n/(this._lodMeshes.length-1),d=t/(this._lodMeshes.length-1),x=Math.sqrt(h*h-d*d),u=h*1.25,m=x*u,{_lodMax:y}=this,T=this._sizeLods[n],v=3*T*(n>y-Lr?n-y+Lr:0),_=4*(this._cubeSize-T);c.envMap.value=e.texture,c.roughness.value=m,c.mipInt.value=y-t,Ir(r,v,_,3*T,2*T),s.setRenderTarget(r),s.render(o,Na),c.envMap.value=r.texture,c.roughness.value=0,c.mipInt.value=y-n,Ir(e,v,_,3*T,2*T),s.setRenderTarget(e),s.render(o,Na)}_blur(e,t,n,s){let r=this._pingPongRenderTarget,a=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(e,r,t,n,a),this._blurPass(r,e,n,n,a)}_blurPass(e,t,n,s,r){let a=this._renderer,o=this._blurMaterial,c=this._lodMeshes[s];c.material=o;let h=o.uniforms;h.envMap.value=e.texture,h.sigma.value=r,h.mipInt.value=this._lodMax-n;let d=this._sizeLods[s],x=3*d*(s>this._lodMax-Lr?s-this._lodMax+Lr:0),u=4*(this._cubeSize-d);Ir(t,x,u,3*d,2*d),a.setRenderTarget(t),a.render(c,Na)}};function Jg(i){let e=[],t=[],n=i,s=i-Lr+1+qg;for(let r=0;r<s;r++){let a=Math.pow(2,n);e.push(a);let o=1/(a-2),c=-o,h=1+o,d=[c,c,h,c,h,h,c,c,h,h,c,h],x=6,u=6,m=3,y=new Float32Array(m*u*x),T=new Float32Array(m*u*x);for(let _=0;_<x;_++){let R=_%3*2/3-1,D=_>2?0:-1,E=[R,D,0,R+2/3,D,0,R+2/3,D+1,0,R,D,0,R+2/3,D+1,0,R,D+1,0];y.set(E,m*u*_);for(let I=0;I<u;I++){let P=d[I*2]*2-1,U=d[I*2+1]*2-1;_===0?Gs.set(1,U,P):_===1?Gs.set(-P,1,-U):_===2?Gs.set(-P,U,1):_===3?Gs.set(-1,U,-P):_===4?Gs.set(-P,-1,U):Gs.set(P,U,-1),Gs.toArray(T,(_*u+I)*m)}}let v=new Lt;v.setAttribute("position",new ni(y,m)),v.setAttribute("outputDirection",new ni(T,m)),t.push(new ct(v,null)),n>Lr&&n--}return{lodMeshes:t,sizeLods:e}}function Wd(i,e,t){let n=new Xn(i,e,t);return n.texture.mapping=Aa,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function Ir(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function Kg(i,e,t){return new dn({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:Zg,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:hc(),fragmentShader:`

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
		`,blending:Bi,depthTest:!1,depthWrite:!1})}function jg(i,e,t){return new dn({name:"SphericalGaussianBlur",defines:{SAMPLES:Yg,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:hc(),fragmentShader:`

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
		`,blending:Bi,depthTest:!1,depthWrite:!1})}function Xd(){return new dn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:hc(),fragmentShader:`

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
		`,blending:Bi,depthTest:!1,depthWrite:!1})}function qd(){return new dn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:hc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Bi,depthTest:!1,depthWrite:!1})}function hc(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var lc=class extends Xn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new ha(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new bi(5,5,5),r=new dn({name:"CubemapFromEquirect",uniforms:Vs(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:Sn,blending:Bi});r.uniforms.tEquirect.value=t;let a=new ct(s,r),o=t.minFilter;return t.minFilter===Ss&&(t.minFilter=bn),new fl(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){let r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,s);e.setRenderTarget(r)}};function Qg(i){let e=new WeakMap,t=new WeakMap,n=null;function s(u,m=!1){return u==null?null:m?a(u):r(u)}function r(u){if(u&&u.isTexture){let m=u.mapping;if(m===_l||m===xl)if(e.has(u)){let y=e.get(u).texture;return o(y,u.mapping)}else{let y=u.image;if(y&&y.height>0){let T=new lc(y.height);return T.fromEquirectangularTexture(i,u),e.set(u,T),u.addEventListener("dispose",h),o(T.texture,u.mapping)}else return null}}return u}function a(u){if(u&&u.isTexture){let m=u.mapping,y=m===_l||m===xl,T=m===Ms||m===zs;if(y||T){let v=t.get(u),_=v!==void 0?v.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==_)return n===null&&(n=new oc(i)),v=y?n.fromEquirectangular(u,v):n.fromCubemap(u,v),v.texture.pmremVersion=u.pmremVersion,t.set(u,v),v.texture;if(v!==void 0)return v.texture;{let R=u.image;return y&&R&&R.height>0||T&&R&&c(R)?(n===null&&(n=new oc(i)),v=y?n.fromEquirectangular(u):n.fromCubemap(u),v.texture.pmremVersion=u.pmremVersion,t.set(u,v),u.addEventListener("dispose",d),v.texture):null}}}return u}function o(u,m){return m===_l?u.mapping=Ms:m===xl&&(u.mapping=zs),u}function c(u){let m=0,y=6;for(let T=0;T<y;T++)u[T]!==void 0&&m++;return m===y}function h(u){let m=u.target;m.removeEventListener("dispose",h);let y=e.get(m);y!==void 0&&(e.delete(m),y.dispose())}function d(u){let m=u.target;m.removeEventListener("dispose",d);let y=t.get(m);y!==void 0&&(t.delete(m),y.dispose())}function x(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:x}}function e_(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let s=i.getExtension(n);return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let s=t(n);return s===null&&Ds("WebGLRenderer: "+n+" extension not supported."),s}}}function t_(i,e,t,n){let s={},r=new WeakMap;function a(x){let u=x.target;u.index!==null&&e.remove(u.index);for(let y in u.attributes)e.remove(u.attributes[y]);u.removeEventListener("dispose",a),delete s[u.id];let m=r.get(u);m&&(e.remove(m),r.delete(u)),n.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,t.memory.geometries--}function o(x,u){return s[u.id]===!0||(u.addEventListener("dispose",a),s[u.id]=!0,t.memory.geometries++),u}function c(x){let u=x.attributes;for(let m in u)e.update(u[m],i.ARRAY_BUFFER)}function h(x){let u=[],m=x.index,y=x.attributes.position,T=0;if(y===void 0)return;if(m!==null){let R=m.array;T=m.version;for(let D=0,E=R.length;D<E;D+=3){let I=R[D+0],P=R[D+1],U=R[D+2];u.push(I,P,P,U,U,I)}}else{let R=y.array;T=y.version;for(let D=0,E=R.length/3-1;D<E;D+=3){let I=D+0,P=D+1,U=D+2;u.push(I,P,P,U,U,I)}}let v=new(y.count>=65535?la:oa)(u,1);v.version=T;let _=r.get(x);_&&e.remove(_),r.set(x,v)}function d(x){let u=r.get(x);if(u){let m=x.index;m!==null&&u.version<m.version&&h(x)}else h(x);return r.get(x)}return{get:o,update:c,getWireframeAttribute:d}}function n_(i,e,t){let n;function s(x){n=x}let r,a;function o(x){r=x.type,a=x.bytesPerElement}function c(x,u){i.drawElements(n,u,r,x*a),t.update(u,n,1)}function h(x,u,m){m!==0&&(i.drawElementsInstanced(n,u,r,x*a,m),t.update(u,n,m))}function d(x,u,m){if(m===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,u,0,r,x,0,m);let T=0;for(let v=0;v<m;v++)T+=u[v];t.update(T,n,1)}this.setMode=s,this.setIndex=o,this.render=c,this.renderInstances=h,this.renderMultiDraw=d}function i_(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(r/3);break;case i.LINES:t.lines+=o*(r/2);break;case i.LINE_STRIP:t.lines+=o*(r-1);break;case i.LINE_LOOP:t.lines+=o*r;break;case i.POINTS:t.points+=o*r;break;default:nt("WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function s_(i,e,t){let n=new WeakMap,s=new qt;function r(a,o,c){let h=a.morphTargetInfluences,d=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,x=d!==void 0?d.length:0,u=n.get(o);if(u===void 0||u.count!==x){let C=function(){U.dispose(),n.delete(o),o.removeEventListener("dispose",C)};u!==void 0&&u.texture.dispose();let m=o.morphAttributes.position!==void 0,y=o.morphAttributes.normal!==void 0,T=o.morphAttributes.color!==void 0,v=o.morphAttributes.position||[],_=o.morphAttributes.normal||[],R=o.morphAttributes.color||[],D=0;m===!0&&(D=1),y===!0&&(D=2),T===!0&&(D=3);let E=o.attributes.position.count*D,I=1;E>e.maxTextureSize&&(I=Math.ceil(E/e.maxTextureSize),E=e.maxTextureSize);let P=new Float32Array(E*I*4*x),U=new ra(P,E,I,x);U.type=Ai,U.needsUpdate=!0;let b=D*4;for(let O=0;O<x;O++){let H=v[O],Y=_[O],Q=R[O],V=E*I*4*O;for(let te=0;te<H.count;te++){let fe=te*b;m===!0&&(s.fromBufferAttribute(H,te),P[V+fe+0]=s.x,P[V+fe+1]=s.y,P[V+fe+2]=s.z,P[V+fe+3]=0),y===!0&&(s.fromBufferAttribute(Y,te),P[V+fe+4]=s.x,P[V+fe+5]=s.y,P[V+fe+6]=s.z,P[V+fe+7]=0),T===!0&&(s.fromBufferAttribute(Q,te),P[V+fe+8]=s.x,P[V+fe+9]=s.y,P[V+fe+10]=s.z,P[V+fe+11]=Q.itemSize===4?s.w:1)}}u={count:x,texture:U,size:new ke(E,I)},n.set(o,u),o.addEventListener("dispose",C)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)c.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let m=0;for(let T=0;T<h.length;T++)m+=h[T];let y=o.morphTargetsRelative?1:1-m;c.getUniforms().setValue(i,"morphTargetBaseInfluence",y),c.getUniforms().setValue(i,"morphTargetInfluences",h)}c.getUniforms().setValue(i,"morphTargetsTexture",u.texture,t),c.getUniforms().setValue(i,"morphTargetsTextureSize",u.size)}return{update:r}}function r_(i,e,t,n,s){let r=new WeakMap;function a(h){let d=s.render.frame,x=h.geometry,u=e.get(h,x);if(r.get(u)!==d&&(e.update(u),r.set(u,d)),h.isInstancedMesh&&(h.hasEventListener("dispose",c)===!1&&h.addEventListener("dispose",c),r.get(h)!==d&&(t.update(h.instanceMatrix,i.ARRAY_BUFFER),h.instanceColor!==null&&t.update(h.instanceColor,i.ARRAY_BUFFER),r.set(h,d))),h.isSkinnedMesh){let m=h.skeleton;r.get(m)!==d&&(m.update(),r.set(m,d))}return u}function o(){r=new WeakMap}function c(h){let d=h.target;d.removeEventListener("dispose",c),n.releaseStatesOfObject(d),t.remove(d.instanceMatrix),d.instanceColor!==null&&t.remove(d.instanceColor)}return{update:a,dispose:o}}var a_={[uh]:"LINEAR_TONE_MAPPING",[dh]:"REINHARD_TONE_MAPPING",[fh]:"CINEON_TONE_MAPPING",[ph]:"ACES_FILMIC_TONE_MAPPING",[gh]:"AGX_TONE_MAPPING",[_h]:"NEUTRAL_TONE_MAPPING",[mh]:"CUSTOM_TONE_MAPPING"};function o_(i,e,t,n,s,r){let a=new Xn(e,t,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,c=null,h=new Lt;h.setAttribute("position",new st([-1,3,0,-1,-1,0,3,-1,0],3)),h.setAttribute("uv",new st([0,2,0,0,2,0],2));let d=new Qo({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),x=new ct(h,d),u=new Er(-1,1,1,-1,0,1),m=null,y=null,T=!1,v,_=null,R=[],D=!1;this.setSize=function(E,I){a.setSize(E,I),o!==null&&o.setSize(E,I),c!==null&&c.setSize(E,I);for(let P=0;P<R.length;P++){let U=R[P];U.setSize&&U.setSize(E,I)}},this.setEffects=function(E){R=E,D=R.length>0&&R[0].isRenderPass===!0;let I=a.width,P=a.height;R.length>0&&o===null&&(o=new Xn(I,P,{type:Ei,depthBuffer:!1,stencilBuffer:!1}),c=new Xn(I,P,{type:Ei,depthBuffer:!1,stencilBuffer:!1}));for(let U=0;U<R.length;U++){let b=R[U];b.setSize&&b.setSize(I,P)}},this.begin=function(E,I){if(T||E.toneMapping===wi&&R.length===0)return!1;if(_=I,I!==null){let P=I.width,U=I.height;(a.width!==P||a.height!==U)&&this.setSize(P,U)}return D===!1&&E.setRenderTarget(a),v=E.toneMapping,E.toneMapping=wi,!0},this.hasRenderPass=function(){return D},this.end=function(E,I){E.toneMapping=v,T=!0;let P=a,U=o;for(let b=0;b<R.length;b++){let C=R[b];C.enabled!==!1&&(C.render(E,U,P,I),C.needsSwap!==!1&&(P=U,U=U===o?c:o))}if(m!==E.outputColorSpace||y!==E.toneMapping){m=E.outputColorSpace,y=E.toneMapping,d.defines={},St.getTransfer(m)===Nt&&(d.defines.SRGB_TRANSFER="");let b=a_[y];b&&(d.defines[b]=""),d.needsUpdate=!0}d.uniforms.tDiffuse.value=P.texture,E.setRenderTarget(_),E.render(x,u),_=null,T=!1},this.isCompositing=function(){return T},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),c!==null&&c.dispose(),h.dispose(),d.dispose()}}var ff=new In,Wh=new hs(1,1),pf=new ra,mf=new Vo,gf=new ha,Yd=[],Zd=[],$d=new Float32Array(16),Jd=new Float32Array(9),Kd=new Float32Array(4);function Nr(i,e,t){let n=i[0];if(n<=0||n>0)return i;let s=e*t,r=Yd[s];if(r===void 0&&(r=new Float32Array(s),Yd[s]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(r,o)}return r}function _n(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function xn(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function uc(i,e){let t=Zd[e];t===void 0&&(t=new Int32Array(e),Zd[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function l_(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function c_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(_n(t,e))return;i.uniform2fv(this.addr,e),xn(t,e)}}function h_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(_n(t,e))return;i.uniform3fv(this.addr,e),xn(t,e)}}function u_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(_n(t,e))return;i.uniform4fv(this.addr,e),xn(t,e)}}function d_(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(_n(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),xn(t,e)}else{if(_n(t,n))return;Kd.set(n),i.uniformMatrix2fv(this.addr,!1,Kd),xn(t,n)}}function f_(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(_n(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),xn(t,e)}else{if(_n(t,n))return;Jd.set(n),i.uniformMatrix3fv(this.addr,!1,Jd),xn(t,n)}}function p_(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(_n(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),xn(t,e)}else{if(_n(t,n))return;$d.set(n),i.uniformMatrix4fv(this.addr,!1,$d),xn(t,n)}}function m_(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function g_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(_n(t,e))return;i.uniform2iv(this.addr,e),xn(t,e)}}function __(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(_n(t,e))return;i.uniform3iv(this.addr,e),xn(t,e)}}function x_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(_n(t,e))return;i.uniform4iv(this.addr,e),xn(t,e)}}function v_(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function y_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(_n(t,e))return;i.uniform2uiv(this.addr,e),xn(t,e)}}function M_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(_n(t,e))return;i.uniform3uiv(this.addr,e),xn(t,e)}}function S_(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(_n(t,e))return;i.uniform4uiv(this.addr,e),xn(t,e)}}function b_(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(Wh.compareFunction=t.isReversedDepthBuffer()?sc:ic,r=Wh):r=ff,t.setTexture2D(e||r,s)}function w_(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||mf,s)}function T_(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||gf,s)}function A_(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||pf,s)}function E_(i){switch(i){case 5126:return l_;case 35664:return c_;case 35665:return h_;case 35666:return u_;case 35674:return d_;case 35675:return f_;case 35676:return p_;case 5124:case 35670:return m_;case 35667:case 35671:return g_;case 35668:case 35672:return __;case 35669:case 35673:return x_;case 5125:return v_;case 36294:return y_;case 36295:return M_;case 36296:return S_;case 35678:case 36198:case 36298:case 36306:case 35682:return b_;case 35679:case 36299:case 36307:return w_;case 35680:case 36300:case 36308:case 36293:return T_;case 36289:case 36303:case 36311:case 36292:return A_}}function C_(i,e){i.uniform1fv(this.addr,e)}function R_(i,e){let t=Nr(e,this.size,2);i.uniform2fv(this.addr,t)}function P_(i,e){let t=Nr(e,this.size,3);i.uniform3fv(this.addr,t)}function I_(i,e){let t=Nr(e,this.size,4);i.uniform4fv(this.addr,t)}function L_(i,e){let t=Nr(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function D_(i,e){let t=Nr(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function N_(i,e){let t=Nr(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function U_(i,e){i.uniform1iv(this.addr,e)}function F_(i,e){i.uniform2iv(this.addr,e)}function O_(i,e){i.uniform3iv(this.addr,e)}function B_(i,e){i.uniform4iv(this.addr,e)}function k_(i,e){i.uniform1uiv(this.addr,e)}function z_(i,e){i.uniform2uiv(this.addr,e)}function V_(i,e){i.uniform3uiv(this.addr,e)}function G_(i,e){i.uniform4uiv(this.addr,e)}function H_(i,e,t){let n=this.cache,s=e.length,r=uc(t,s);_n(n,r)||(i.uniform1iv(this.addr,r),xn(n,r));let a;this.type===i.SAMPLER_2D_SHADOW?a=Wh:a=ff;for(let o=0;o!==s;++o)t.setTexture2D(e[o]||a,r[o])}function W_(i,e,t){let n=this.cache,s=e.length,r=uc(t,s);_n(n,r)||(i.uniform1iv(this.addr,r),xn(n,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||mf,r[a])}function X_(i,e,t){let n=this.cache,s=e.length,r=uc(t,s);_n(n,r)||(i.uniform1iv(this.addr,r),xn(n,r));for(let a=0;a!==s;++a)t.setTextureCube(e[a]||gf,r[a])}function q_(i,e,t){let n=this.cache,s=e.length,r=uc(t,s);_n(n,r)||(i.uniform1iv(this.addr,r),xn(n,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||pf,r[a])}function Y_(i){switch(i){case 5126:return C_;case 35664:return R_;case 35665:return P_;case 35666:return I_;case 35674:return L_;case 35675:return D_;case 35676:return N_;case 5124:case 35670:return U_;case 35667:case 35671:return F_;case 35668:case 35672:return O_;case 35669:case 35673:return B_;case 5125:return k_;case 36294:return z_;case 36295:return V_;case 36296:return G_;case 35678:case 36198:case 36298:case 36306:case 35682:return H_;case 35679:case 36299:case 36307:return W_;case 35680:case 36300:case 36308:case 36293:return X_;case 36289:case 36303:case 36311:case 36292:return q_}}var Xh=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=E_(t.type)}},qh=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=Y_(t.type)}},Yh=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(e,t[o.id],n)}}},Gh=/(\w+)(\])?(\[|\.)?/g;function jd(i,e){i.seq.push(e),i.map[e.id]=e}function Z_(i,e,t){let n=i.name,s=n.length;for(Gh.lastIndex=0;;){let r=Gh.exec(n),a=Gh.lastIndex,o=r[1],c=r[2]==="]",h=r[3];if(c&&(o=o|0),h===void 0||h==="["&&a+2===s){jd(t,h===void 0?new Xh(o,i,e):new qh(o,i,e));break}else{let x=t.map[o];x===void 0&&(x=new Yh(o),jd(t,x)),t=x}}}var Dr=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){let o=e.getActiveUniform(t,a),c=e.getUniformLocation(t,o.name);Z_(o,c,this)}let s=[],r=[];for(let a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,n,s){let r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){let s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,a=t.length;r!==a;++r){let o=t[r],c=n[o.id];c.needsUpdate!==!1&&o.setValue(e,c.value,s)}}static seqWithValue(e,t){let n=[];for(let s=0,r=e.length;s!==r;++s){let a=e[s];a.id in t&&n.push(a)}return n}};function Qd(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var $_=37297,J_=0;function K_(i,e){let t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){let o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}var ef=new at;function j_(i){St._getMatrix(ef,St.workingColorSpace,i);let e=`mat3( ${ef.elements.map(t=>t.toFixed(4))} )`;switch(St.getTransfer(i)){case ia:return[e,"LinearTransferOETF"];case Nt:return[e,"sRGBTransferOETF"];default:return Qe("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function tf(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+K_(i.getShaderSource(e),o)}else return r}function Q_(i,e){let t=j_(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}var ex={[uh]:"Linear",[dh]:"Reinhard",[fh]:"Cineon",[ph]:"ACESFilmic",[gh]:"AgX",[_h]:"Neutral",[mh]:"Custom"};function tx(i,e){let t=ex[e];return t===void 0?(Qe("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var ac=new N;function nx(){St.getLuminanceCoefficients(ac);let i=ac.x.toFixed(4),e=ac.y.toFixed(4),t=ac.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function ix(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Fa).join(`
`)}function sx(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function rx(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(e,s),a=r.name,o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function Fa(i){return i!==""}function nf(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function sf(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var ax=/^[ \t]*#include +<([\w\d./]+)>/gm;function Zh(i){return i.replace(ax,lx)}var ox=new Map;function lx(i,e){let t=mt[e];if(t===void 0){let n=ox.get(e);if(n!==void 0)t=mt[n],Qe('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return Zh(t)}var cx=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function rf(i){return i.replace(cx,hx)}function hx(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function af(i){let e=`precision ${i.precision} float;
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
	`;return i.precision==="highp"?e+=`
#define HIGH_PRECISION`:i.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}var ux={[Ta]:"SHADOWMAP_TYPE_PCF",[Cr]:"SHADOWMAP_TYPE_VSM"};function dx(i){return ux[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var fx={[Ms]:"ENVMAP_TYPE_CUBE",[zs]:"ENVMAP_TYPE_CUBE",[Aa]:"ENVMAP_TYPE_CUBE_UV"};function px(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":fx[i.envMapMode]||"ENVMAP_TYPE_CUBE"}var mx={[zs]:"ENVMAP_MODE_REFRACTION"};function gx(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":mx[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var _x={[gl]:"ENVMAP_BLENDING_MULTIPLY",[Sd]:"ENVMAP_BLENDING_MIX",[bd]:"ENVMAP_BLENDING_ADD"};function xx(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":_x[i.combine]||"ENVMAP_BLENDING_NONE"}function vx(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function yx(i,e,t,n){let s=i.getContext(),r=t.defines,a=t.vertexShader,o=t.fragmentShader,c=dx(t),h=px(t),d=gx(t),x=xx(t),u=vx(t),m=ix(t),y=sx(r),T=s.createProgram(),v,_,R=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(v=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,y].filter(Fa).join(`
`),v.length>0&&(v+=`
`),_=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,y].filter(Fa).join(`
`),_.length>0&&(_+=`
`)):(v=[af(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,y,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+d:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Fa).join(`
`),_=[af(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,y,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.envMap?"#define "+d:"",t.envMap?"#define "+x:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==wi?"#define TONE_MAPPING":"",t.toneMapping!==wi?mt.tonemapping_pars_fragment:"",t.toneMapping!==wi?tx("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",mt.colorspace_pars_fragment,Q_("linearToOutputTexel",t.outputColorSpace),nx(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Fa).join(`
`)),a=Zh(a),a=nf(a,t),a=sf(a,t),o=Zh(o),o=nf(o,t),o=sf(o,t),a=rf(a),o=rf(o),t.isRawShaderMaterial!==!0&&(R=`#version 300 es
`,v=[m,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+v,_=["#define varying in",t.glslVersion===Eh?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Eh?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+_);let D=R+v+a,E=R+_+o,I=Qd(s,s.VERTEX_SHADER,D),P=Qd(s,s.FRAGMENT_SHADER,E);s.attachShader(T,I),s.attachShader(T,P),t.index0AttributeName!==void 0?s.bindAttribLocation(T,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(T,0,"position"),s.linkProgram(T);function U(H){if(i.debug.checkShaderErrors){let Y=s.getProgramInfoLog(T)||"",Q=s.getShaderInfoLog(I)||"",V=s.getShaderInfoLog(P)||"",te=Y.trim(),fe=Q.trim(),ue=V.trim(),ye=!0,oe=!0;if(s.getProgramParameter(T,s.LINK_STATUS)===!1)if(ye=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,T,I,P);else{let q=tf(s,I,"vertex"),xe=tf(s,P,"fragment");nt("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(T,s.VALIDATE_STATUS)+`

Material Name: `+H.name+`
Material Type: `+H.type+`

Program Info Log: `+te+`
`+q+`
`+xe)}else te!==""?Qe("WebGLProgram: Program Info Log:",te):(fe===""||ue==="")&&(oe=!1);oe&&(H.diagnostics={runnable:ye,programLog:te,vertexShader:{log:fe,prefix:v},fragmentShader:{log:ue,prefix:_}})}s.deleteShader(I),s.deleteShader(P),b=new Dr(s,T),C=rx(s,T)}let b;this.getUniforms=function(){return b===void 0&&U(this),b};let C;this.getAttributes=function(){return C===void 0&&U(this),C};let O=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return O===!1&&(O=s.getProgramParameter(T,$_)),O},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(T),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=J_++,this.cacheKey=e,this.usedTimes=1,this.program=T,this.vertexShader=I,this.fragmentShader=P,this}var Mx=0,$h=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Jh(e),t.set(e,n)),n}},Jh=class{constructor(e){this.id=Mx++,this.code=e,this.usedTimes=0}};function Sx(i){return i===ws||i===La||i===Da}function bx(i,e,t,n,s,r){let a=new yr,o=new $h,c=new Set,h=[],d=new Map,x=n.logarithmicDepthBuffer,u=n.precision,m={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function y(b){return c.add(b),b===0?"uv":`uv${b}`}function T(b,C,O,H,Y,Q){let V=H.fog,te=Y.geometry,fe=b.isMeshStandardMaterial||b.isMeshLambertMaterial||b.isMeshPhongMaterial?H.environment:null,ue=b.isMeshStandardMaterial||b.isMeshLambertMaterial&&!b.envMap||b.isMeshPhongMaterial&&!b.envMap,ye=e.get(b.envMap||fe,ue),oe=ye&&ye.mapping===Aa?ye.image.height:null,q=m[b.type];b.precision!==null&&(u=n.getMaxPrecision(b.precision),u!==b.precision&&Qe("WebGLProgram.getParameters:",b.precision,"not supported, using",u,"instead."));let xe=te.morphAttributes.position||te.morphAttributes.normal||te.morphAttributes.color,qe=xe!==void 0?xe.length:0,Ze=0;te.morphAttributes.position!==void 0&&(Ze=1),te.morphAttributes.normal!==void 0&&(Ze=2),te.morphAttributes.color!==void 0&&(Ze=3);let Ut,xt,gt,he;if(q){let Ft=zi[q];Ut=Ft.vertexShader,xt=Ft.fragmentShader}else{Ut=b.vertexShader,xt=b.fragmentShader;let Ft=o.getVertexShaderStage(b),Tt=o.getFragmentShaderStage(b);o.update(b,Ft,Tt),gt=Ft.id,he=Tt.id}let ge=i.getRenderTarget(),Be=i.state.buffers.depth.getReversed(),tt=Y.isInstancedMesh===!0,Se=Y.isBatchedMesh===!0,et=!!b.map,nn=!!b.matcap,ot=!!ye,Oe=!!b.aoMap,Ct=!!b.lightMap,dt=!!b.bumpMap&&b.wireframe===!1,pt=!!b.normalMap,$t=!!b.displacementMap,An=!!b.emissiveMap,Gt=!!b.metalnessMap,Jt=!!b.roughnessMap,G=b.anisotropy>0,ln=b.clearcoat>0,ht=b.dispersion>0,L=b.retroreflectivity>0,M=b.iridescence>0,$=b.sheen>0,ne=b.transmission>0,le=G&&!!b.anisotropyMap,Me=ln&&!!b.clearcoatMap,Ae=ln&&!!b.clearcoatNormalMap,se=ln&&!!b.clearcoatRoughnessMap,me=M&&!!b.iridescenceMap,Ee=M&&!!b.iridescenceThicknessMap,Ye=$&&!!b.sheenColorMap,Re=$&&!!b.sheenRoughnessMap,be=!!b.specularMap,He=!!b.specularColorMap,Ke=!!b.specularIntensityMap,rt=ne&&!!b.transmissionMap,z=ne&&!!b.thicknessMap,Ce=!!b.gradientMap,pe=!!b.alphaMap,we=b.alphaTest>0,Le=!!b.alphaHash,ve=!!b.extensions,$e=wi;b.toneMapped&&(ge===null||ge.isXRRenderTarget===!0)&&($e=i.toneMapping);let We={shaderID:q,shaderType:b.type,shaderName:b.name,vertexShader:Ut,fragmentShader:xt,defines:b.defines,customVertexShaderID:gt,customFragmentShaderID:he,isRawShaderMaterial:b.isRawShaderMaterial===!0,glslVersion:b.glslVersion,precision:u,batching:Se,batchingColor:Se&&Y._colorsTexture!==null,instancing:tt,instancingColor:tt&&Y.instanceColor!==null,instancingMorph:tt&&Y.morphTexture!==null,outputColorSpace:ge===null?i.outputColorSpace:ge.isXRRenderTarget===!0?ge.texture.colorSpace:St.workingColorSpace,alphaToCoverage:!!b.alphaToCoverage,map:et,matcap:nn,envMap:ot,envMapMode:ot&&ye.mapping,envMapCubeUVHeight:oe,aoMap:Oe,lightMap:Ct,bumpMap:dt,normalMap:pt,displacementMap:$t,emissiveMap:An,normalMapObjectSpace:pt&&b.normalMapType===Ad,normalMapTangentSpace:pt&&b.normalMapType===nc,packedNormalMap:pt&&b.normalMapType===nc&&Sx(b.normalMap.format),metalnessMap:Gt,roughnessMap:Jt,anisotropy:G,anisotropyMap:le,clearcoat:ln,clearcoatMap:Me,clearcoatNormalMap:Ae,clearcoatRoughnessMap:se,dispersion:ht,retroreflection:L,iridescence:M,iridescenceMap:me,iridescenceThicknessMap:Ee,sheen:$,sheenColorMap:Ye,sheenRoughnessMap:Re,specularMap:be,specularColorMap:He,specularIntensityMap:Ke,transmission:ne,transmissionMap:rt,thicknessMap:z,gradientMap:Ce,opaque:b.transparent===!1&&b.blending===ys&&b.alphaToCoverage===!1,alphaMap:pe,alphaTest:we,alphaHash:Le,combine:b.combine,mapUv:et&&y(b.map.channel),aoMapUv:Oe&&y(b.aoMap.channel),lightMapUv:Ct&&y(b.lightMap.channel),bumpMapUv:dt&&y(b.bumpMap.channel),normalMapUv:pt&&y(b.normalMap.channel),displacementMapUv:$t&&y(b.displacementMap.channel),emissiveMapUv:An&&y(b.emissiveMap.channel),metalnessMapUv:Gt&&y(b.metalnessMap.channel),roughnessMapUv:Jt&&y(b.roughnessMap.channel),anisotropyMapUv:le&&y(b.anisotropyMap.channel),clearcoatMapUv:Me&&y(b.clearcoatMap.channel),clearcoatNormalMapUv:Ae&&y(b.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:se&&y(b.clearcoatRoughnessMap.channel),iridescenceMapUv:me&&y(b.iridescenceMap.channel),iridescenceThicknessMapUv:Ee&&y(b.iridescenceThicknessMap.channel),sheenColorMapUv:Ye&&y(b.sheenColorMap.channel),sheenRoughnessMapUv:Re&&y(b.sheenRoughnessMap.channel),specularMapUv:be&&y(b.specularMap.channel),specularColorMapUv:He&&y(b.specularColorMap.channel),specularIntensityMapUv:Ke&&y(b.specularIntensityMap.channel),transmissionMapUv:rt&&y(b.transmissionMap.channel),thicknessMapUv:z&&y(b.thicknessMap.channel),alphaMapUv:pe&&y(b.alphaMap.channel),vertexTangents:!!te.attributes.tangent&&(pt||G),vertexNormals:!!te.attributes.normal,vertexColors:b.vertexColors,vertexAlphas:b.vertexColors===!0&&!!te.attributes.color&&te.attributes.color.itemSize===4,pointsUvs:Y.isPoints===!0&&!!te.attributes.uv&&(et||pe),fog:!!V,useFog:b.fog===!0,fogExp2:!!V&&V.isFogExp2,flatShading:b.wireframe===!1&&(b.flatShading===!0||te.attributes.normal===void 0&&pt===!1&&(b.isMeshLambertMaterial||b.isMeshPhongMaterial||b.isMeshStandardMaterial||b.isMeshPhysicalMaterial)),sizeAttenuation:b.sizeAttenuation===!0,logarithmicDepthBuffer:x,reversedDepthBuffer:Be,skinning:Y.isSkinnedMesh===!0,hasPositionAttribute:te.attributes.position!==void 0,morphTargets:te.morphAttributes.position!==void 0,morphNormals:te.morphAttributes.normal!==void 0,morphColors:te.morphAttributes.color!==void 0,morphTargetsCount:qe,morphTextureStride:Ze,numSunLights:C.sun.length,numDirLights:C.directional.length,numPointLights:C.point.length,numSpotLights:C.spot.length,numSpotLightMaps:C.spotLightMap.length,numRectAreaLights:C.rectArea.length,numHemiLights:C.hemi.length,numSunLightShadows:C.sunShadowMap.length,numDirLightShadows:C.directionalShadowMap.length,numPointLightShadows:C.pointShadowMap.length,numSpotLightShadows:C.spotShadowMap.length,numSpotLightShadowsWithMaps:C.numSpotLightShadowsWithMaps,numLightProbes:C.numLightProbes,numLightProbeGrids:Q.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:b.dithering,shadowMapEnabled:i.shadowMap.enabled&&O.length>0,shadowMapType:i.shadowMap.type,toneMapping:$e,decodeVideoTexture:et&&b.map.isVideoTexture===!0&&St.getTransfer(b.map.colorSpace)===Nt,decodeVideoTextureEmissive:An&&b.emissiveMap.isVideoTexture===!0&&St.getTransfer(b.emissiveMap.colorSpace)===Nt,premultipliedAlpha:b.premultipliedAlpha,doubleSided:b.side===qn,flipSided:b.side===Sn,useDepthPacking:b.depthPacking>=0,depthPacking:b.depthPacking||0,index0AttributeName:b.index0AttributeName,extensionClipCullDistance:ve&&b.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(ve&&b.extensions.multiDraw===!0||Se)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:b.customProgramCacheKey()};return We.vertexUv1s=c.has(1),We.vertexUv2s=c.has(2),We.vertexUv3s=c.has(3),c.clear(),We}function v(b){let C=[];if(b.shaderID?C.push(b.shaderID):(C.push(b.customVertexShaderID),C.push(b.customFragmentShaderID)),b.defines!==void 0)for(let O in b.defines)C.push(O),C.push(b.defines[O]);return b.isRawShaderMaterial===!1&&(_(C,b),R(C,b),C.push(i.outputColorSpace)),C.push(b.customProgramCacheKey),C.join()}function _(b,C){b.push(C.precision),b.push(C.outputColorSpace),b.push(C.envMapMode),b.push(C.envMapCubeUVHeight),b.push(C.mapUv),b.push(C.alphaMapUv),b.push(C.lightMapUv),b.push(C.aoMapUv),b.push(C.bumpMapUv),b.push(C.normalMapUv),b.push(C.displacementMapUv),b.push(C.emissiveMapUv),b.push(C.metalnessMapUv),b.push(C.roughnessMapUv),b.push(C.anisotropyMapUv),b.push(C.clearcoatMapUv),b.push(C.clearcoatNormalMapUv),b.push(C.clearcoatRoughnessMapUv),b.push(C.iridescenceMapUv),b.push(C.iridescenceThicknessMapUv),b.push(C.sheenColorMapUv),b.push(C.sheenRoughnessMapUv),b.push(C.specularMapUv),b.push(C.specularColorMapUv),b.push(C.specularIntensityMapUv),b.push(C.transmissionMapUv),b.push(C.thicknessMapUv),b.push(C.combine),b.push(C.fogExp2),b.push(C.sizeAttenuation),b.push(C.morphTargetsCount),b.push(C.morphAttributeCount),b.push(C.numSunLights),b.push(C.numDirLights),b.push(C.numPointLights),b.push(C.numSpotLights),b.push(C.numSpotLightMaps),b.push(C.numHemiLights),b.push(C.numRectAreaLights),b.push(C.numSunLightShadows),b.push(C.numDirLightShadows),b.push(C.numPointLightShadows),b.push(C.numSpotLightShadows),b.push(C.numSpotLightShadowsWithMaps),b.push(C.numLightProbes),b.push(C.shadowMapType),b.push(C.toneMapping),b.push(C.numClippingPlanes),b.push(C.numClipIntersection),b.push(C.depthPacking)}function R(b,C){a.disableAll(),C.instancing&&a.enable(0),C.instancingColor&&a.enable(1),C.instancingMorph&&a.enable(2),C.matcap&&a.enable(3),C.envMap&&a.enable(4),C.normalMapObjectSpace&&a.enable(5),C.normalMapTangentSpace&&a.enable(6),C.clearcoat&&a.enable(7),C.iridescence&&a.enable(8),C.alphaTest&&a.enable(9),C.vertexColors&&a.enable(10),C.vertexAlphas&&a.enable(11),C.vertexUv1s&&a.enable(12),C.vertexUv2s&&a.enable(13),C.vertexUv3s&&a.enable(14),C.vertexTangents&&a.enable(15),C.anisotropy&&a.enable(16),C.alphaHash&&a.enable(17),C.batching&&a.enable(18),C.dispersion&&a.enable(19),C.retroreflection&&a.enable(24),C.batchingColor&&a.enable(20),C.gradientMap&&a.enable(21),C.packedNormalMap&&a.enable(22),C.vertexNormals&&a.enable(23),b.push(a.mask),a.disableAll(),C.fog&&a.enable(0),C.useFog&&a.enable(1),C.flatShading&&a.enable(2),C.logarithmicDepthBuffer&&a.enable(3),C.reversedDepthBuffer&&a.enable(4),C.skinning&&a.enable(5),C.morphTargets&&a.enable(6),C.morphNormals&&a.enable(7),C.morphColors&&a.enable(8),C.premultipliedAlpha&&a.enable(9),C.shadowMapEnabled&&a.enable(10),C.doubleSided&&a.enable(11),C.flipSided&&a.enable(12),C.useDepthPacking&&a.enable(13),C.dithering&&a.enable(14),C.transmission&&a.enable(15),C.sheen&&a.enable(16),C.opaque&&a.enable(17),C.pointsUvs&&a.enable(18),C.decodeVideoTexture&&a.enable(19),C.decodeVideoTextureEmissive&&a.enable(20),C.alphaToCoverage&&a.enable(21),C.numLightProbeGrids>0&&a.enable(22),C.hasPositionAttribute&&a.enable(23),b.push(a.mask)}function D(b){let C=m[b.type],O;if(C){let H=zi[C];O=zd.clone(H.uniforms)}else O=b.uniforms;return O}function E(b,C){let O=d.get(C);return O!==void 0?++O.usedTimes:(O=new yx(i,C,b,s),h.push(O),d.set(C,O)),O}function I(b){if(--b.usedTimes===0){let C=h.indexOf(b);h[C]=h[h.length-1],h.pop(),d.delete(b.cacheKey),b.destroy()}}function P(b){o.remove(b)}function U(){o.dispose()}return{getParameters:T,getProgramCacheKey:v,getUniforms:D,acquireProgram:E,releaseProgram:I,releaseShaderCache:P,programs:h,dispose:U}}function wx(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,c){i.get(a)[o]=c}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function Tx(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function of(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function lf(){let i=[],e=0,t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function a(u){let m=0;return u.isInstancedMesh&&(m+=2),u.isSkinnedMesh&&(m+=1),m}function o(u,m,y,T,v,_){let R=i[e];return R===void 0?(R={id:u.id,object:u,geometry:m,material:y,materialVariant:a(u),groupOrder:T,renderOrder:u.renderOrder,z:v,group:_},i[e]=R):(R.id=u.id,R.object=u,R.geometry=m,R.material=y,R.materialVariant=a(u),R.groupOrder=T,R.renderOrder=u.renderOrder,R.z=v,R.group=_),e++,R}function c(u,m,y,T,v,_,R){R.reversedDepth===!0&&(v=-v);let D=o(u,m,y,T,v,_);y.transmission>0?n.push(D):y.transparent===!0?s.push(D):t.push(D)}function h(u,m,y,T,v,_){let R=o(u,m,y,T,v,_);y.transmission>0?n.unshift(R):y.transparent===!0?s.unshift(R):t.unshift(R)}function d(u,m){t.length>1&&t.sort(u||Tx),n.length>1&&n.sort(m||of),s.length>1&&s.sort(m||of)}function x(){for(let u=e,m=i.length;u<m;u++){let y=i[u];if(y.id===null)break;y.id=null,y.object=null,y.geometry=null,y.material=null,y.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:c,unshift:h,finish:x,sort:d}}function Ax(){let i=new WeakMap;function e(n,s){let r=i.get(n),a;return r===void 0?(a=new lf,i.set(n,[a])):s>=r.length?(a=new lf,r.push(a)):a=r[s],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function Ex(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new N,color:new je};break;case"SpotLight":t={position:new N,direction:new N,color:new je,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new N,color:new je,distance:0,decay:0};break;case"HemisphereLight":t={direction:new N,skyColor:new je,groundColor:new je};break;case"RectAreaLight":t={color:new je,position:new N,halfWidth:new N,halfHeight:new N};break}return i[e.id]=t,t}}}function Cx(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ke};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ke};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new ke,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var Rx=0;function Px(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function Ix(i){let e=new Ex,t=Cx(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let h=0;h<9;h++)n.probe.push(new N);let s=new N,r=new Bt,a=new Bt;function o(h){let d=0,x=0,u=0;for(let Y=0;Y<9;Y++)n.probe[Y].set(0,0,0);let m=0,y=0,T=0,v=0,_=0,R=0,D=0,E=0,I=0,P=0,U=0,b=0,C=0,O=0;h.sort(Px);for(let Y=0,Q=h.length;Y<Q;Y++){let V=h[Y],te=V.color,fe=V.intensity,ue=V.distance,ye=null;if(V.shadow&&V.shadow.map&&(V.shadow.map.texture.format===ws?ye=V.shadow.map.texture:ye=V.shadow.map.depthTexture||V.shadow.map.texture),V.isAmbientLight)d+=te.r*fe,x+=te.g*fe,u+=te.b*fe;else if(V.isLightProbe){for(let oe=0;oe<9;oe++)n.probe[oe].addScaledVector(V.sh.coefficients[oe],fe);O++}else if(V.isSunLight){let oe=e.get(V);if(oe.color.copy(V.color).multiplyScalar(V.intensity),V.castShadow){let q=V.shadow,xe=t.get(V);xe.shadowIntensity=q.intensity,xe.shadowBias=q.bias,xe.shadowNormalBias=q.normalBias,xe.shadowRadius=q.radius,xe.shadowMapSize.copy(q.mapSize).multiply(q.getFrameExtents()),n.sunShadow[y]=xe,n.sunShadowMap[y]=ye;let qe=q.getViewportCount();for(let Ze=0;Ze<qe;Ze++)n.sunShadowMatrix[T+Ze]=q.getMatrix(Ze),n.sunShadowCascade[T+Ze]=q._cascadeData[Ze];T+=qe,y++}n.sun[m]=oe,m++}else if(V.isDirectionalLight){let oe=e.get(V);if(oe.color.copy(V.color).multiplyScalar(V.intensity),V.castShadow){let q=V.shadow,xe=t.get(V);xe.shadowIntensity=q.intensity,xe.shadowBias=q.bias,xe.shadowNormalBias=q.normalBias,xe.shadowRadius=q.radius,xe.shadowMapSize=q.mapSize,n.directionalShadow[v]=xe,n.directionalShadowMap[v]=ye,n.directionalShadowMatrix[v]=V.shadow.matrix,I++}n.directional[v]=oe,v++}else if(V.isSpotLight){let oe=e.get(V);oe.position.setFromMatrixPosition(V.matrixWorld),oe.color.copy(te).multiplyScalar(fe),oe.distance=ue,oe.coneCos=Math.cos(V.angle),oe.penumbraCos=Math.cos(V.angle*(1-V.penumbra)),oe.decay=V.decay,n.spot[R]=oe;let q=V.shadow;if(V.map&&(n.spotLightMap[b]=V.map,b++,q.updateMatrices(V),V.castShadow&&C++),n.spotLightMatrix[R]=q.matrix,V.castShadow){let xe=t.get(V);xe.shadowIntensity=q.intensity,xe.shadowBias=q.bias,xe.shadowNormalBias=q.normalBias,xe.shadowRadius=q.radius,xe.shadowMapSize=q.mapSize,n.spotShadow[R]=xe,n.spotShadowMap[R]=ye,U++}R++}else if(V.isRectAreaLight){let oe=e.get(V);oe.color.copy(te).multiplyScalar(fe),oe.halfWidth.set(V.width*.5,0,0),oe.halfHeight.set(0,V.height*.5,0),n.rectArea[D]=oe,D++}else if(V.isPointLight){let oe=e.get(V);if(oe.color.copy(V.color).multiplyScalar(V.intensity),oe.distance=V.distance,oe.decay=V.decay,V.castShadow){let q=V.shadow,xe=t.get(V);xe.shadowIntensity=q.intensity,xe.shadowBias=q.bias,xe.shadowNormalBias=q.normalBias,xe.shadowRadius=q.radius,xe.shadowMapSize=q.mapSize,xe.shadowCameraNear=q.camera.near,xe.shadowCameraFar=q.camera.far,n.pointShadow[_]=xe,n.pointShadowMap[_]=ye,n.pointShadowMatrix[_]=V.shadow.matrix,P++}n.point[_]=oe,_++}else if(V.isHemisphereLight){let oe=e.get(V);oe.skyColor.copy(V.color).multiplyScalar(fe),oe.groundColor.copy(V.groundColor).multiplyScalar(fe),n.hemi[E]=oe,E++}}D>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=De.LTC_FLOAT_1,n.rectAreaLTC2=De.LTC_FLOAT_2):(n.rectAreaLTC1=De.LTC_HALF_1,n.rectAreaLTC2=De.LTC_HALF_2)),n.ambient[0]=d,n.ambient[1]=x,n.ambient[2]=u;let H=n.hash;(H.sunLength!==m||H.directionalLength!==v||H.pointLength!==_||H.spotLength!==R||H.rectAreaLength!==D||H.hemiLength!==E||H.numSunShadows!==y||H.numDirectionalShadows!==I||H.numPointShadows!==P||H.numSpotShadows!==U||H.numSpotMaps!==b||H.numLightProbes!==O)&&(n.sun.length=m,n.directional.length=v,n.spot.length=R,n.rectArea.length=D,n.point.length=_,n.hemi.length=E,n.sunShadow.length=y,n.sunShadowMap.length=y,n.sunShadowMatrix.length=T,n.sunShadowCascade.length=T,n.directionalShadow.length=I,n.directionalShadowMap.length=I,n.directionalShadowMatrix.length=I,n.pointShadow.length=P,n.pointShadowMap.length=P,n.pointShadowMatrix.length=P,n.spotShadow.length=U,n.spotShadowMap.length=U,n.spotLightMatrix.length=U+b-C,n.spotLightMap.length=b,n.numSpotLightShadowsWithMaps=C,n.numLightProbes=O,H.sunLength=m,H.directionalLength=v,H.pointLength=_,H.spotLength=R,H.rectAreaLength=D,H.hemiLength=E,H.numSunShadows=y,H.numDirectionalShadows=I,H.numPointShadows=P,H.numSpotShadows=U,H.numSpotMaps=b,H.numLightProbes=O,n.version=Rx++)}function c(h,d){let x=0,u=0,m=0,y=0,T=0,v=0,_=d.matrixWorldInverse;for(let R=0,D=h.length;R<D;R++){let E=h[R];if(E.isSunLight){let I=n.sun[x];I.direction.setFromMatrixPosition(E.matrixWorld),I.direction.transformDirection(_),x++}else if(E.isDirectionalLight){let I=n.directional[u];I.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),I.direction.sub(s),I.direction.transformDirection(_),u++}else if(E.isSpotLight){let I=n.spot[y];I.position.setFromMatrixPosition(E.matrixWorld),I.position.applyMatrix4(_),I.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),I.direction.sub(s),I.direction.transformDirection(_),y++}else if(E.isRectAreaLight){let I=n.rectArea[T];I.position.setFromMatrixPosition(E.matrixWorld),I.position.applyMatrix4(_),a.identity(),r.copy(E.matrixWorld),r.premultiply(_),a.extractRotation(r),I.halfWidth.set(E.width*.5,0,0),I.halfHeight.set(0,E.height*.5,0),I.halfWidth.applyMatrix4(a),I.halfHeight.applyMatrix4(a),T++}else if(E.isPointLight){let I=n.point[m];I.position.setFromMatrixPosition(E.matrixWorld),I.position.applyMatrix4(_),m++}else if(E.isHemisphereLight){let I=n.hemi[v];I.direction.setFromMatrixPosition(E.matrixWorld),I.direction.transformDirection(_),v++}}}return{setup:o,setupView:c,state:n}}function cf(i){let e=new Ix(i),t=[],n=[],s=[];function r(u){x.camera=u,t.length=0,n.length=0,s.length=0}function a(u){t.push(u)}function o(u){n.push(u)}function c(u){s.push(u)}function h(){e.setup(t)}function d(u){e.setupView(t,u)}let x={lightsArray:t,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:x,setupLights:h,setupLightsView:d,pushLight:a,pushShadow:o,pushLightProbeGrid:c}}function Lx(i){let e=new WeakMap;function t(s,r=0){let a=e.get(s),o;return a===void 0?(o=new cf(i),e.set(s,[o])):r>=a.length?(o=new cf(i),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}var Dx=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,Nx=`uniform sampler2D shadow_pass;
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
}`,Ux=[new N(1,0,0),new N(-1,0,0),new N(0,1,0),new N(0,-1,0),new N(0,0,1),new N(0,0,-1)],Fx=[new N(0,-1,0),new N(0,-1,0),new N(0,0,1),new N(0,0,-1),new N(0,-1,0),new N(0,-1,0)],hf=new Bt,Ua=new N,Hh=new N;function Ox(i,e,t){let n=new Sr,s=new ke,r=new ke,a=new qt,o=new el,c=new tl,h={},d=t.maxTextureSize,x={[vs]:Sn,[Sn]:vs,[qn]:qn},u=new dn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new ke},radius:{value:4}},vertexShader:Dx,fragmentShader:Nx}),m=u.clone();m.defines.HORIZONTAL_PASS=1;let y=new Lt;y.setAttribute("position",new ni(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let T=new ct(y,u),v=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Ta;let _=this.type;this.render=function(P,U,b){if(v.enabled===!1||v.autoUpdate===!1&&v.needsUpdate===!1||P.length===0)return;this.type===id&&(Qe("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Ta);let C=i.getRenderTarget(),O=i.getActiveCubeFace(),H=i.getActiveMipmapLevel(),Y=i.state;Y.setBlending(Bi),Y.buffers.depth.getReversed()===!0?Y.buffers.color.setClear(0,0,0,0):Y.buffers.color.setClear(1,1,1,1),Y.buffers.depth.setTest(!0),Y.setScissorTest(!1);let Q=_!==this.type;Q&&U.traverse(function(V){V.material&&(Array.isArray(V.material)?V.material.forEach(te=>te.needsUpdate=!0):V.material.needsUpdate=!0)});for(let V=0,te=P.length;V<te;V++){let fe=P[V],ue=fe.shadow;if(ue===void 0){Qe("WebGLShadowMap:",fe,"has no shadow.");continue}if(ue.autoUpdate===!1&&ue.needsUpdate===!1)continue;s.copy(ue.mapSize);let ye=ue.getFrameExtents();s.multiply(ye),r.copy(ue.mapSize),(s.x>d||s.y>d)&&(s.x>d&&(r.x=Math.floor(d/ye.x),s.x=r.x*ye.x,ue.mapSize.x=r.x),s.y>d&&(r.y=Math.floor(d/ye.y),s.y=r.y*ye.y,ue.mapSize.y=r.y));let oe=i.state.buffers.depth.getReversed();if(ue.camera._reversedDepth=oe,ue.map===null||Q===!0){if(ue.map!==null&&(ue.map.depthTexture!==null&&(ue.map.depthTexture.dispose(),ue.map.depthTexture=null),ue.map.dispose()),this.type===Cr){if(fe.isPointLight){Qe("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}ue.map=new Xn(s.x,s.y,{format:ws,type:Ei,minFilter:bn,magFilter:bn,generateMipmaps:!1}),ue.map.texture.name=fe.name+".shadowMap",ue.map.depthTexture=new hs(s.x,s.y,Ai),ue.map.depthTexture.name=fe.name+".shadowMapDepth",ue.map.depthTexture.format=Ni,ue.map.depthTexture.compareFunction=null,ue.map.depthTexture.minFilter=Mn,ue.map.depthTexture.magFilter=Mn}else fe.isPointLight?(ue.map=new lc(s.x),ue.map.depthTexture=new qo(s.x,Ti)):(ue.map=new Xn(s.x,s.y),ue.map.depthTexture=new hs(s.x,s.y,Ti)),ue.map.depthTexture.name=fe.name+".shadowMap",ue.map.depthTexture.format=Ni,this.type===Ta?(ue.map.depthTexture.compareFunction=oe?sc:ic,ue.map.depthTexture.minFilter=bn,ue.map.depthTexture.magFilter=bn):(ue.map.depthTexture.compareFunction=null,ue.map.depthTexture.minFilter=Mn,ue.map.depthTexture.magFilter=Mn);ue.camera.updateProjectionMatrix()}ue.map.isWebGLCubeRenderTarget!==!0&&(ue.map.width!==s.x||ue.map.height!==s.y)&&ue.map.setSize(s.x,s.y);let q=ue.map.isWebGLCubeRenderTarget?6:ue.getViewportCount();fe.isPointLight!==!0&&ue.updateMatrices(fe,b);for(let xe=0;xe<q;xe++){let qe=ue.getCamera(xe);if(fe.isPointLight){let Ze=ue.camera,Ut=ue.matrix,xt=fe.distance||Ze.far;xt!==Ze.far&&(Ze.far=xt,Ze.updateProjectionMatrix()),Ua.setFromMatrixPosition(fe.matrixWorld),Ze.position.copy(Ua),Hh.copy(Ze.position),Hh.add(Ux[xe]),Ze.up.copy(Fx[xe]),Ze.lookAt(Hh),Ze.updateMatrixWorld(),Ut.makeTranslation(-Ua.x,-Ua.y,-Ua.z),hf.multiplyMatrices(Ze.projectionMatrix,Ze.matrixWorldInverse),ue._frustum.setFromProjectionMatrix(hf,Ze.coordinateSystem,Ze.reversedDepth)}if(ue.map.isWebGLCubeRenderTarget)i.setRenderTarget(ue.map,xe),i.clear();else{xe===0&&(i.setRenderTarget(ue.map),i.clear());let Ze=ue.getViewport(xe);a.set(r.x*Ze.x,r.y*Ze.y,r.x*Ze.z,r.y*Ze.w),Y.viewport(a)}n=ue.getFrustum(xe),E(U,b,qe,fe,this.type)}ue.isPointLightShadow!==!0&&this.type===Cr&&R(ue,b),ue.needsUpdate=!1}_=this.type,v.needsUpdate=!1,i.setRenderTarget(C,O,H)};function R(P,U){let b=e.update(T);u.defines.VSM_SAMPLES!==P.blurSamples&&(u.defines.VSM_SAMPLES=P.blurSamples,m.defines.VSM_SAMPLES=P.blurSamples,u.needsUpdate=!0,m.needsUpdate=!0),P.mapPass===null?P.mapPass=new Xn(s.x,s.y,{format:ws,type:Ei}):(P.mapPass.width!==P.map.width||P.mapPass.height!==P.map.height)&&P.mapPass.setSize(P.map.width,P.map.height),u.uniforms.shadow_pass.value=P.map.depthTexture,u.uniforms.resolution.value.set(P.map.width,P.map.height),u.uniforms.radius.value=P.radius,i.setRenderTarget(P.mapPass),i.clear(),i.renderBufferDirect(U,null,b,u,T,null),m.uniforms.shadow_pass.value=P.mapPass.texture,m.uniforms.resolution.value.set(P.map.width,P.map.height),m.uniforms.radius.value=P.radius,i.setRenderTarget(P.map),i.clear(),i.renderBufferDirect(U,null,b,m,T,null)}function D(P,U,b,C){let O=null,H=b.isPointLight===!0?P.customDistanceMaterial:P.customDepthMaterial;if(H!==void 0)O=H;else if(O=b.isPointLight===!0?c:o,i.localClippingEnabled&&U.clipShadows===!0&&Array.isArray(U.clippingPlanes)&&U.clippingPlanes.length!==0||U.displacementMap&&U.displacementScale!==0||U.alphaMap&&U.alphaTest>0||U.map&&U.alphaTest>0||U.alphaToCoverage===!0){let Y=O.uuid,Q=U.uuid,V=h[Y];V===void 0&&(V={},h[Y]=V);let te=V[Q];te===void 0&&(te=O.clone(),V[Q]=te,U.addEventListener("dispose",I)),O=te}if(O.visible=U.visible,O.wireframe=U.wireframe,C===Cr?O.side=U.shadowSide!==null?U.shadowSide:U.side:O.side=U.shadowSide!==null?U.shadowSide:x[U.side],O.alphaMap=U.alphaMap,O.alphaTest=U.alphaToCoverage===!0?.5:U.alphaTest,O.map=U.map,O.clipShadows=U.clipShadows,O.clippingPlanes=U.clippingPlanes,O.clipIntersection=U.clipIntersection,O.displacementMap=U.displacementMap,O.displacementScale=U.displacementScale,O.displacementBias=U.displacementBias,O.wireframeLinewidth=U.wireframeLinewidth,O.linewidth=U.linewidth,b.isPointLight===!0&&O.isMeshDistanceMaterial===!0){let Y=i.properties.get(O);Y.light=b}return O}function E(P,U,b,C,O){if(P.visible===!1)return;if(P.layers.test(U.layers)&&(P.isMesh||P.isLine||P.isPoints)&&(P.castShadow||P.receiveShadow&&O===Cr)&&(!P.frustumCulled||P.intersectsFrustum(n))){P.modelViewMatrix.multiplyMatrices(b.matrixWorldInverse,P.matrixWorld);let Q=e.update(P),V=P.material;if(Array.isArray(V)){let te=Q.groups;for(let fe=0,ue=te.length;fe<ue;fe++){let ye=te[fe],oe=V[ye.materialIndex];if(oe&&oe.visible){let q=D(P,oe,C,O);P.onBeforeShadow(i,P,U,b,Q,q,ye),i.renderBufferDirect(b,null,Q,q,P,ye),P.onAfterShadow(i,P,U,b,Q,q,ye)}}}else if(V.visible){let te=D(P,V,C,O);P.onBeforeShadow(i,P,U,b,Q,te,null),i.renderBufferDirect(b,null,Q,te,P,null),P.onAfterShadow(i,P,U,b,Q,te,null)}}let Y=P.children;for(let Q=0,V=Y.length;Q<V;Q++)E(Y[Q],U,b,C,O)}function I(P){P.target.removeEventListener("dispose",I);for(let b in h){let C=h[b],O=P.target.uuid;O in C&&(C[O].dispose(),delete C[O])}}}function Bx(i,e){function t(){let z=!1,Ce=new qt,pe=null,we=new qt(0,0,0,0);return{setMask:function(Le){pe!==Le&&!z&&(i.colorMask(Le,Le,Le,Le),pe=Le)},setLocked:function(Le){z=Le},setClear:function(Le,ve,$e,We,Ft){Ft===!0&&(Le*=We,ve*=We,$e*=We),Ce.set(Le,ve,$e,We),we.equals(Ce)===!1&&(i.clearColor(Le,ve,$e,We),we.copy(Ce))},reset:function(){z=!1,pe=null,we.set(-1,0,0,0)}}}function n(){let z=!1,Ce=!1,pe=null,we=null,Le=null;return{setReversed:function(ve){if(Ce!==ve){let $e=e.get("EXT_clip_control");ve?$e.clipControlEXT($e.LOWER_LEFT_EXT,$e.ZERO_TO_ONE_EXT):$e.clipControlEXT($e.LOWER_LEFT_EXT,$e.NEGATIVE_ONE_TO_ONE_EXT),Ce=ve;let We=Le;Le=null,this.setClear(We)}},getReversed:function(){return Ce},setTest:function(ve){ve?ge(i.DEPTH_TEST):Be(i.DEPTH_TEST)},setMask:function(ve){pe!==ve&&!z&&(i.depthMask(ve),pe=ve)},setFunc:function(ve){if(Ce&&(ve=Od[ve]),we!==ve){switch(ve){case Co:i.depthFunc(i.NEVER);break;case Ro:i.depthFunc(i.ALWAYS);break;case Po:i.depthFunc(i.LESS);break;case mr:i.depthFunc(i.LEQUAL);break;case Io:i.depthFunc(i.EQUAL);break;case Lo:i.depthFunc(i.GEQUAL);break;case Do:i.depthFunc(i.GREATER);break;case No:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}we=ve}},setLocked:function(ve){z=ve},setClear:function(ve){Le!==ve&&(Le=ve,Ce&&(ve=1-ve),i.clearDepth(ve))},reset:function(){z=!1,pe=null,we=null,Le=null,Ce=!1}}}function s(){let z=!1,Ce=null,pe=null,we=null,Le=null,ve=null,$e=null,We=null,Ft=null;return{setTest:function(Tt){z||(Tt?ge(i.STENCIL_TEST):Be(i.STENCIL_TEST))},setMask:function(Tt){Ce!==Tt&&!z&&(i.stencilMask(Tt),Ce=Tt)},setFunc:function(Tt,$n,ai){(pe!==Tt||we!==$n||Le!==ai)&&(i.stencilFunc(Tt,$n,ai),pe=Tt,we=$n,Le=ai)},setOp:function(Tt,$n,ai){(ve!==Tt||$e!==$n||We!==ai)&&(i.stencilOp(Tt,$n,ai),ve=Tt,$e=$n,We=ai)},setLocked:function(Tt){z=Tt},setClear:function(Tt){Ft!==Tt&&(i.clearStencil(Tt),Ft=Tt)},reset:function(){z=!1,Ce=null,pe=null,we=null,Le=null,ve=null,$e=null,We=null,Ft=null}}}let r=new t,a=new n,o=new s,c=new WeakMap,h=new WeakMap,d={},x={},u={},m=new WeakMap,y=[],T=null,v=!1,_=null,R=null,D=null,E=null,I=null,P=null,U=null,b=new je(0,0,0),C=0,O=!1,H=null,Y=null,Q=null,V=null,te=null,fe=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),ue=!1,ye=0,oe=i.getParameter(i.VERSION);oe.indexOf("WebGL")!==-1?(ye=parseFloat(/^WebGL (\d)/.exec(oe)[1]),ue=ye>=1):oe.indexOf("OpenGL ES")!==-1&&(ye=parseFloat(/^OpenGL ES (\d)/.exec(oe)[1]),ue=ye>=2);let q=null,xe={},qe=i.getParameter(i.SCISSOR_BOX),Ze=i.getParameter(i.VIEWPORT),Ut=new qt().fromArray(qe),xt=new qt().fromArray(Ze);function gt(z,Ce,pe,we){let Le=new Uint8Array(4),ve=i.createTexture();i.bindTexture(z,ve),i.texParameteri(z,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(z,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let $e=0;$e<pe;$e++)z===i.TEXTURE_3D||z===i.TEXTURE_2D_ARRAY?i.texImage3D(Ce,0,i.RGBA,1,1,we,0,i.RGBA,i.UNSIGNED_BYTE,Le):i.texImage2D(Ce+$e,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,Le);return ve}let he={};he[i.TEXTURE_2D]=gt(i.TEXTURE_2D,i.TEXTURE_2D,1),he[i.TEXTURE_CUBE_MAP]=gt(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),he[i.TEXTURE_2D_ARRAY]=gt(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),he[i.TEXTURE_3D]=gt(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),ge(i.DEPTH_TEST),a.setFunc(mr),dt(!1),pt(ah),ge(i.CULL_FACE),Oe(Bi);function ge(z){d[z]!==!0&&(i.enable(z),d[z]=!0)}function Be(z){d[z]!==!1&&(i.disable(z),d[z]=!1)}function tt(z,Ce){return u[z]!==Ce?(i.bindFramebuffer(z,Ce),u[z]=Ce,z===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=Ce),z===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=Ce),!0):!1}function Se(z,Ce){let pe=y,we=!1;if(z){pe=m.get(Ce),pe===void 0&&(pe=[],m.set(Ce,pe));let Le=z.textures;if(pe.length!==Le.length||pe[0]!==i.COLOR_ATTACHMENT0){for(let ve=0,$e=Le.length;ve<$e;ve++)pe[ve]=i.COLOR_ATTACHMENT0+ve;pe.length=Le.length,we=!0}}else pe[0]!==i.BACK&&(pe[0]=i.BACK,we=!0);we&&i.drawBuffers(pe)}function et(z){return T!==z?(i.useProgram(z),T=z,!0):!1}let nn={[ks]:i.FUNC_ADD,[rd]:i.FUNC_SUBTRACT,[ad]:i.FUNC_REVERSE_SUBTRACT};nn[od]=i.MIN,nn[ld]=i.MAX;let ot={[cd]:i.ZERO,[hd]:i.ONE,[ud]:i.SRC_COLOR,[ch]:i.SRC_ALPHA,[_d]:i.SRC_ALPHA_SATURATE,[md]:i.DST_COLOR,[fd]:i.DST_ALPHA,[dd]:i.ONE_MINUS_SRC_COLOR,[hh]:i.ONE_MINUS_SRC_ALPHA,[gd]:i.ONE_MINUS_DST_COLOR,[pd]:i.ONE_MINUS_DST_ALPHA,[xd]:i.CONSTANT_COLOR,[vd]:i.ONE_MINUS_CONSTANT_COLOR,[yd]:i.CONSTANT_ALPHA,[Md]:i.ONE_MINUS_CONSTANT_ALPHA};function Oe(z,Ce,pe,we,Le,ve,$e,We,Ft,Tt){if(z===Bi){v===!0&&(Be(i.BLEND),v=!1);return}if(v===!1&&(ge(i.BLEND),v=!0),z!==sd){if(z!==_||Tt!==O){if((R!==ks||I!==ks)&&(i.blendEquation(i.FUNC_ADD),R=ks,I=ks),Tt)switch(z){case ys:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Yt:i.blendFunc(i.ONE,i.ONE);break;case oh:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case lh:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:nt("WebGLState: Invalid blending: ",z);break}else switch(z){case ys:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case Yt:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case oh:nt("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case lh:nt("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:nt("WebGLState: Invalid blending: ",z);break}D=null,E=null,P=null,U=null,b.set(0,0,0),C=0,_=z,O=Tt}return}Le=Le||Ce,ve=ve||pe,$e=$e||we,(Ce!==R||Le!==I)&&(i.blendEquationSeparate(nn[Ce],nn[Le]),R=Ce,I=Le),(pe!==D||we!==E||ve!==P||$e!==U)&&(i.blendFuncSeparate(ot[pe],ot[we],ot[ve],ot[$e]),D=pe,E=we,P=ve,U=$e),(We.equals(b)===!1||Ft!==C)&&(i.blendColor(We.r,We.g,We.b,Ft),b.copy(We),C=Ft),_=z,O=!1}function Ct(z,Ce){z.side===qn?Be(i.CULL_FACE):ge(i.CULL_FACE);let pe=z.side===Sn;Ce&&(pe=!pe),dt(pe),z.blending===ys&&z.transparent===!1?Oe(Bi):Oe(z.blending,z.blendEquation,z.blendSrc,z.blendDst,z.blendEquationAlpha,z.blendSrcAlpha,z.blendDstAlpha,z.blendColor,z.blendAlpha,z.premultipliedAlpha),a.setFunc(z.depthFunc),a.setTest(z.depthTest),a.setMask(z.depthWrite),r.setMask(z.colorWrite);let we=z.stencilWrite;o.setTest(we),we&&(o.setMask(z.stencilWriteMask),o.setFunc(z.stencilFunc,z.stencilRef,z.stencilFuncMask),o.setOp(z.stencilFail,z.stencilZFail,z.stencilZPass)),An(z.polygonOffset,z.polygonOffsetFactor,z.polygonOffsetUnits),z.alphaToCoverage===!0?ge(i.SAMPLE_ALPHA_TO_COVERAGE):Be(i.SAMPLE_ALPHA_TO_COVERAGE)}function dt(z){H!==z&&(z?i.frontFace(i.CW):i.frontFace(i.CCW),H=z)}function pt(z){z!==td?(ge(i.CULL_FACE),z!==Y&&(z===ah?i.cullFace(i.BACK):z===nd?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Be(i.CULL_FACE),Y=z}function $t(z){z!==Q&&(ue&&i.lineWidth(z),Q=z)}function An(z,Ce,pe){z?(ge(i.POLYGON_OFFSET_FILL),(V!==Ce||te!==pe)&&(V=Ce,te=pe,a.getReversed()&&(Ce=-Ce),i.polygonOffset(Ce,pe))):Be(i.POLYGON_OFFSET_FILL)}function Gt(z){z?ge(i.SCISSOR_TEST):Be(i.SCISSOR_TEST)}function Jt(z){z===void 0&&(z=i.TEXTURE0+fe-1),q!==z&&(i.activeTexture(z),q=z)}function G(z,Ce,pe){pe===void 0&&(q===null?pe=i.TEXTURE0+fe-1:pe=q);let we=xe[pe];we===void 0&&(we={type:void 0,texture:void 0},xe[pe]=we),(we.type!==z||we.texture!==Ce)&&(q!==pe&&(i.activeTexture(pe),q=pe),i.bindTexture(z,Ce||he[z]),we.type=z,we.texture=Ce)}function ln(){let z=xe[q];z!==void 0&&z.type!==void 0&&(i.bindTexture(z.type,null),z.type=void 0,z.texture=void 0)}function ht(){try{i.compressedTexImage2D(...arguments)}catch(z){nt("WebGLState:",z)}}function L(){try{i.compressedTexImage3D(...arguments)}catch(z){nt("WebGLState:",z)}}function M(){try{i.texSubImage2D(...arguments)}catch(z){nt("WebGLState:",z)}}function $(){try{i.texSubImage3D(...arguments)}catch(z){nt("WebGLState:",z)}}function ne(){try{i.compressedTexSubImage2D(...arguments)}catch(z){nt("WebGLState:",z)}}function le(){try{i.compressedTexSubImage3D(...arguments)}catch(z){nt("WebGLState:",z)}}function Me(){try{i.texStorage2D(...arguments)}catch(z){nt("WebGLState:",z)}}function Ae(){try{i.texStorage3D(...arguments)}catch(z){nt("WebGLState:",z)}}function se(){try{i.texImage2D(...arguments)}catch(z){nt("WebGLState:",z)}}function me(){try{i.texImage3D(...arguments)}catch(z){nt("WebGLState:",z)}}function Ee(z){return x[z]!==void 0?x[z]:i.getParameter(z)}function Ye(z,Ce){x[z]!==Ce&&(i.pixelStorei(z,Ce),x[z]=Ce)}function Re(z){Ut.equals(z)===!1&&(i.scissor(z.x,z.y,z.z,z.w),Ut.copy(z))}function be(z){xt.equals(z)===!1&&(i.viewport(z.x,z.y,z.z,z.w),xt.copy(z))}function He(z,Ce){let pe=h.get(Ce);pe===void 0&&(pe=new WeakMap,h.set(Ce,pe));let we=pe.get(z);we===void 0&&(we=i.getUniformBlockIndex(Ce,z.name),pe.set(z,we))}function Ke(z,Ce){let we=h.get(Ce).get(z);c.get(Ce)!==we&&(i.uniformBlockBinding(Ce,we,z.__bindingPointIndex),c.set(Ce,we))}function rt(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),d={},x={},q=null,xe={},u={},m=new WeakMap,y=[],T=null,v=!1,_=null,R=null,D=null,E=null,I=null,P=null,U=null,b=new je(0,0,0),C=0,O=!1,H=null,Y=null,Q=null,V=null,te=null,Ut.set(0,0,i.canvas.width,i.canvas.height),xt.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:ge,disable:Be,bindFramebuffer:tt,drawBuffers:Se,useProgram:et,setBlending:Oe,setMaterial:Ct,setFlipSided:dt,setCullFace:pt,setLineWidth:$t,setPolygonOffset:An,setScissorTest:Gt,activeTexture:Jt,bindTexture:G,unbindTexture:ln,compressedTexImage2D:ht,compressedTexImage3D:L,texImage2D:se,texImage3D:me,pixelStorei:Ye,getParameter:Ee,updateUBOMapping:He,uniformBlockBinding:Ke,texStorage2D:Me,texStorage3D:Ae,texSubImage2D:M,texSubImage3D:$,compressedTexSubImage2D:ne,compressedTexSubImage3D:le,scissor:Re,viewport:be,reset:rt}}function kx(i,e,t,n,s,r,a){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),h=new ke,d=new WeakMap,x=new Set,u,m=new WeakMap,y=!1;try{y=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function T(L,M){return y?new OffscreenCanvas(L,M):_r("canvas")}function v(L,M,$){let ne=1,le=ht(L);if((le.width>$||le.height>$)&&(ne=$/Math.max(le.width,le.height)),ne<1)if(typeof HTMLImageElement<"u"&&L instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&L instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&L instanceof ImageBitmap||typeof VideoFrame<"u"&&L instanceof VideoFrame){let Me=Math.floor(ne*le.width),Ae=Math.floor(ne*le.height);u===void 0&&(u=T(Me,Ae));let se=M?T(Me,Ae):u;return se.width=Me,se.height=Ae,se.getContext("2d").drawImage(L,0,0,Me,Ae),Qe("WebGLRenderer: Texture has been resized from ("+le.width+"x"+le.height+") to ("+Me+"x"+Ae+")."),se}else return"data"in L&&Qe("WebGLRenderer: Image in DataTexture is too big ("+le.width+"x"+le.height+")."),L;return L}function _(L){return L.generateMipmaps}function R(L){i.generateMipmap(L)}function D(L){return L.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:L.isWebGL3DRenderTarget?i.TEXTURE_3D:L.isWebGLArrayRenderTarget||L.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function E(L,M,$,ne,le,Me=!1){if(L!==null){if(i[L]!==void 0)return i[L];Qe("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+L+"'")}let Ae;ne&&(Ae=e.get("EXT_texture_norm16"),Ae||Qe("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let se=M;if(M===i.RED&&($===i.FLOAT&&(se=i.R32F),$===i.HALF_FLOAT&&(se=i.R16F),$===i.UNSIGNED_BYTE&&(se=i.R8),$===i.UNSIGNED_SHORT&&Ae&&(se=Ae.R16_EXT),$===i.SHORT&&Ae&&(se=Ae.R16_SNORM_EXT)),M===i.RED_INTEGER&&($===i.UNSIGNED_BYTE&&(se=i.R8UI),$===i.UNSIGNED_SHORT&&(se=i.R16UI),$===i.UNSIGNED_INT&&(se=i.R32UI),$===i.BYTE&&(se=i.R8I),$===i.SHORT&&(se=i.R16I),$===i.INT&&(se=i.R32I)),M===i.RG&&($===i.FLOAT&&(se=i.RG32F),$===i.HALF_FLOAT&&(se=i.RG16F),$===i.UNSIGNED_BYTE&&(se=i.RG8),$===i.UNSIGNED_SHORT&&Ae&&(se=Ae.RG16_EXT),$===i.SHORT&&Ae&&(se=Ae.RG16_SNORM_EXT)),M===i.RG_INTEGER&&($===i.UNSIGNED_BYTE&&(se=i.RG8UI),$===i.UNSIGNED_SHORT&&(se=i.RG16UI),$===i.UNSIGNED_INT&&(se=i.RG32UI),$===i.BYTE&&(se=i.RG8I),$===i.SHORT&&(se=i.RG16I),$===i.INT&&(se=i.RG32I)),M===i.RGB_INTEGER&&($===i.UNSIGNED_BYTE&&(se=i.RGB8UI),$===i.UNSIGNED_SHORT&&(se=i.RGB16UI),$===i.UNSIGNED_INT&&(se=i.RGB32UI),$===i.BYTE&&(se=i.RGB8I),$===i.SHORT&&(se=i.RGB16I),$===i.INT&&(se=i.RGB32I)),M===i.RGBA_INTEGER&&($===i.UNSIGNED_BYTE&&(se=i.RGBA8UI),$===i.UNSIGNED_SHORT&&(se=i.RGBA16UI),$===i.UNSIGNED_INT&&(se=i.RGBA32UI),$===i.BYTE&&(se=i.RGBA8I),$===i.SHORT&&(se=i.RGBA16I),$===i.INT&&(se=i.RGBA32I)),M===i.RGB&&($===i.UNSIGNED_SHORT&&Ae&&(se=Ae.RGB16_EXT),$===i.SHORT&&Ae&&(se=Ae.RGB16_SNORM_EXT),$===i.UNSIGNED_INT_5_9_9_9_REV&&(se=i.RGB9_E5),$===i.UNSIGNED_INT_10F_11F_11F_REV&&(se=i.R11F_G11F_B10F)),M===i.RGBA){let me=Me?ia:St.getTransfer(le);$===i.FLOAT&&(se=i.RGBA32F),$===i.HALF_FLOAT&&(se=i.RGBA16F),$===i.UNSIGNED_BYTE&&(se=me===Nt?i.SRGB8_ALPHA8:i.RGBA8),$===i.UNSIGNED_SHORT&&Ae&&(se=Ae.RGBA16_EXT),$===i.SHORT&&Ae&&(se=Ae.RGBA16_SNORM_EXT),$===i.UNSIGNED_SHORT_4_4_4_4&&(se=i.RGBA4),$===i.UNSIGNED_SHORT_5_5_5_1&&(se=i.RGB5_A1)}return(se===i.R16F||se===i.R32F||se===i.RG16F||se===i.RG32F||se===i.RGBA16F||se===i.RGBA32F)&&e.get("EXT_color_buffer_float"),se}function I(L,M){let $;return L?M===null||M===Ti||M===Pr?$=i.DEPTH24_STENCIL8:M===Ai?$=i.DEPTH32F_STENCIL8:M===Rr&&($=i.DEPTH24_STENCIL8,Qe("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):M===null||M===Ti||M===Pr?$=i.DEPTH_COMPONENT24:M===Ai?$=i.DEPTH_COMPONENT32F:M===Rr&&($=i.DEPTH_COMPONENT16),$}function P(L,M){return _(L)===!0||L.isFramebufferTexture&&L.minFilter!==Mn&&L.minFilter!==bn?Math.log2(Math.max(M.width,M.height))+1:L.mipmaps!==void 0&&L.mipmaps.length>0?L.mipmaps.length:L.isCompressedTexture&&Array.isArray(L.image)?M.mipmaps.length:1}function U(L){let M=L.target;M.removeEventListener("dispose",U),C(M),M.isVideoTexture&&d.delete(M),M.isHTMLTexture&&x.delete(M)}function b(L){let M=L.target;M.removeEventListener("dispose",b),H(M)}function C(L){let M=n.get(L);if(M.__webglInit===void 0)return;let $=L.source,ne=m.get($);if(ne){let le=ne[M.__cacheKey];le.usedTimes--,le.usedTimes===0&&O(L),Object.keys(ne).length===0&&m.delete($)}n.remove(L)}function O(L){let M=n.get(L);i.deleteTexture(M.__webglTexture);let $=L.source,ne=m.get($);delete ne[M.__cacheKey],a.memory.textures--}function H(L){let M=n.get(L);if(L.depthTexture&&(L.depthTexture.dispose(),n.remove(L.depthTexture)),L.isWebGLCubeRenderTarget)for(let ne=0;ne<6;ne++){if(Array.isArray(M.__webglFramebuffer[ne]))for(let le=0;le<M.__webglFramebuffer[ne].length;le++)i.deleteFramebuffer(M.__webglFramebuffer[ne][le]);else i.deleteFramebuffer(M.__webglFramebuffer[ne]);M.__webglDepthbuffer&&i.deleteRenderbuffer(M.__webglDepthbuffer[ne])}else{if(Array.isArray(M.__webglFramebuffer))for(let ne=0;ne<M.__webglFramebuffer.length;ne++)i.deleteFramebuffer(M.__webglFramebuffer[ne]);else i.deleteFramebuffer(M.__webglFramebuffer);if(M.__webglDepthbuffer&&i.deleteRenderbuffer(M.__webglDepthbuffer),M.__webglMultisampledFramebuffer&&i.deleteFramebuffer(M.__webglMultisampledFramebuffer),M.__webglColorRenderbuffer)for(let ne=0;ne<M.__webglColorRenderbuffer.length;ne++)M.__webglColorRenderbuffer[ne]&&i.deleteRenderbuffer(M.__webglColorRenderbuffer[ne]);M.__webglDepthRenderbuffer&&i.deleteRenderbuffer(M.__webglDepthRenderbuffer)}let $=L.textures;for(let ne=0,le=$.length;ne<le;ne++){let Me=n.get($[ne]);Me.__webglTexture&&(i.deleteTexture(Me.__webglTexture),a.memory.textures--),n.remove($[ne])}n.remove(L)}let Y=0;function Q(){Y=0}function V(){return Y}function te(L){Y=L}function fe(){let L=Y;return L>=s.maxTextures&&Qe("WebGLTextures: Trying to use "+(L+1)+" texture units while this GPU supports only "+s.maxTextures),Y+=1,L}function ue(L){let M=[];return M.push(L.wrapS),M.push(L.wrapT),M.push(L.wrapR||0),M.push(L.magFilter),M.push(L.minFilter),M.push(L.anisotropy),M.push(L.internalFormat),M.push(L.format),M.push(L.type),M.push(L.generateMipmaps),M.push(L.premultiplyAlpha),M.push(L.flipY),M.push(L.unpackAlignment),M.push(L.colorSpace),M.join()}function ye(L,M){let $=n.get(L);if(L.isVideoTexture&&G(L),L.isRenderTargetTexture===!1&&L.isExternalTexture!==!0&&L.version>0&&$.__version!==L.version){let ne=L.image;if(ne===null)Qe("WebGLRenderer: Texture marked for update but no image data found.");else if(ne.complete===!1)Qe("WebGLRenderer: Texture marked for update but image is incomplete");else{Be($,L,M);return}}else L.isExternalTexture&&($.__webglTexture=L.sourceTexture?L.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,$.__webglTexture,i.TEXTURE0+M)}function oe(L,M){let $=n.get(L);if(L.isRenderTargetTexture===!1&&L.version>0&&$.__version!==L.version){Be($,L,M);return}else L.isExternalTexture&&($.__webglTexture=L.sourceTexture?L.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,$.__webglTexture,i.TEXTURE0+M)}function q(L,M){let $=n.get(L);if(L.isRenderTargetTexture===!1&&L.version>0&&$.__version!==L.version){Be($,L,M);return}t.bindTexture(i.TEXTURE_3D,$.__webglTexture,i.TEXTURE0+M)}function xe(L,M){let $=n.get(L);if(L.isCubeDepthTexture!==!0&&L.version>0&&$.__version!==L.version){tt($,L,M);return}t.bindTexture(i.TEXTURE_CUBE_MAP,$.__webglTexture,i.TEXTURE0+M)}let qe={[Uo]:i.REPEAT,[Di]:i.CLAMP_TO_EDGE,[Fo]:i.MIRRORED_REPEAT},Ze={[Mn]:i.NEAREST,[wd]:i.NEAREST_MIPMAP_NEAREST,[Ea]:i.NEAREST_MIPMAP_LINEAR,[bn]:i.LINEAR,[vl]:i.LINEAR_MIPMAP_NEAREST,[Ss]:i.LINEAR_MIPMAP_LINEAR},Ut={[Cd]:i.NEVER,[Dd]:i.ALWAYS,[Rd]:i.LESS,[ic]:i.LEQUAL,[Pd]:i.EQUAL,[sc]:i.GEQUAL,[Id]:i.GREATER,[Ld]:i.NOTEQUAL};function xt(L,M){if(M.type===Ai&&e.has("OES_texture_float_linear")===!1&&(M.magFilter===bn||M.magFilter===vl||M.magFilter===Ea||M.magFilter===Ss||M.minFilter===bn||M.minFilter===vl||M.minFilter===Ea||M.minFilter===Ss)&&Qe("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(L,i.TEXTURE_WRAP_S,qe[M.wrapS]),i.texParameteri(L,i.TEXTURE_WRAP_T,qe[M.wrapT]),(L===i.TEXTURE_3D||L===i.TEXTURE_2D_ARRAY)&&i.texParameteri(L,i.TEXTURE_WRAP_R,qe[M.wrapR]),i.texParameteri(L,i.TEXTURE_MAG_FILTER,Ze[M.magFilter]),i.texParameteri(L,i.TEXTURE_MIN_FILTER,Ze[M.minFilter]),M.compareFunction&&(i.texParameteri(L,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(L,i.TEXTURE_COMPARE_FUNC,Ut[M.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(M.magFilter===Mn||M.minFilter!==Ea&&M.minFilter!==Ss||M.type===Ai&&e.has("OES_texture_float_linear")===!1)return;if(M.anisotropy>1||n.get(M).__currentAnisotropy){let $=e.get("EXT_texture_filter_anisotropic");i.texParameterf(L,$.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(M.anisotropy,s.getMaxAnisotropy())),n.get(M).__currentAnisotropy=M.anisotropy}}}function gt(L,M){let $=!1;L.__webglInit===void 0&&(L.__webglInit=!0,M.addEventListener("dispose",U));let ne=M.source,le=m.get(ne);le===void 0&&(le={},m.set(ne,le));let Me=ue(M);if(Me!==L.__cacheKey){le[Me]===void 0&&(le[Me]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,$=!0),le[Me].usedTimes++;let Ae=le[L.__cacheKey];Ae!==void 0&&(le[L.__cacheKey].usedTimes--,Ae.usedTimes===0&&O(M)),L.__cacheKey=Me,L.__webglTexture=le[Me].texture}return $}function he(L,M,$){return Math.floor(Math.floor(L/$)/M)}function ge(L,M,$,ne){let Me=L.updateRanges;if(Me.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,M.width,M.height,$,ne,M.data);else{Me.sort((Ye,Re)=>Ye.start-Re.start);let Ae=0;for(let Ye=1;Ye<Me.length;Ye++){let Re=Me[Ae],be=Me[Ye],He=Re.start+Re.count,Ke=he(be.start,M.width,4),rt=he(Re.start,M.width,4);be.start<=He+1&&Ke===rt&&he(be.start+be.count-1,M.width,4)===Ke?Re.count=Math.max(Re.count,be.start+be.count-Re.start):(++Ae,Me[Ae]=be)}Me.length=Ae+1;let se=t.getParameter(i.UNPACK_ROW_LENGTH),me=t.getParameter(i.UNPACK_SKIP_PIXELS),Ee=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,M.width);for(let Ye=0,Re=Me.length;Ye<Re;Ye++){let be=Me[Ye],He=Math.floor(be.start/4),Ke=Math.ceil(be.count/4),rt=He%M.width,z=Math.floor(He/M.width),Ce=Ke,pe=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,rt),t.pixelStorei(i.UNPACK_SKIP_ROWS,z),t.texSubImage2D(i.TEXTURE_2D,0,rt,z,Ce,pe,$,ne,M.data)}L.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,se),t.pixelStorei(i.UNPACK_SKIP_PIXELS,me),t.pixelStorei(i.UNPACK_SKIP_ROWS,Ee)}}function Be(L,M,$){let ne=i.TEXTURE_2D;(M.isDataArrayTexture||M.isCompressedArrayTexture)&&(ne=i.TEXTURE_2D_ARRAY),M.isData3DTexture&&(ne=i.TEXTURE_3D);let le=gt(L,M),Me=M.source;t.bindTexture(ne,L.__webglTexture,i.TEXTURE0+$);let Ae=n.get(Me);if(Me.version!==Ae.__version||le===!0){if(t.activeTexture(i.TEXTURE0+$),(typeof ImageBitmap<"u"&&M.image instanceof ImageBitmap)===!1){let pe=St.getPrimaries(St.workingColorSpace),we=M.colorSpace===Ji?null:St.getPrimaries(M.colorSpace),Le=M.colorSpace===Ji||pe===we?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,M.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Le)}t.pixelStorei(i.UNPACK_ALIGNMENT,M.unpackAlignment);let me=v(M.image,!1,s.maxTextureSize);me=ln(M,me);let Ee=r.convert(M.format,M.colorSpace),Ye=r.convert(M.type),Re=E(M.internalFormat,Ee,Ye,M.normalized,M.colorSpace,M.isVideoTexture);xt(ne,M);let be,He=M.mipmaps,Ke=M.isVideoTexture!==!0,rt=Ae.__version===void 0||le===!0,z=Me.dataReady,Ce=P(M,me);if(M.isDepthTexture)Re=I(M.format===bs,M.type),rt&&(Ke?t.texStorage2D(i.TEXTURE_2D,1,Re,me.width,me.height):t.texImage2D(i.TEXTURE_2D,0,Re,me.width,me.height,0,Ee,Ye,null));else if(M.isDataTexture)if(He.length>0){Ke&&rt&&t.texStorage2D(i.TEXTURE_2D,Ce,Re,He[0].width,He[0].height);for(let pe=0,we=He.length;pe<we;pe++)be=He[pe],Ke?z&&t.texSubImage2D(i.TEXTURE_2D,pe,0,0,be.width,be.height,Ee,Ye,be.data):t.texImage2D(i.TEXTURE_2D,pe,Re,be.width,be.height,0,Ee,Ye,be.data);M.generateMipmaps=!1}else Ke?(rt&&t.texStorage2D(i.TEXTURE_2D,Ce,Re,me.width,me.height),z&&ge(M,me,Ee,Ye)):t.texImage2D(i.TEXTURE_2D,0,Re,me.width,me.height,0,Ee,Ye,me.data);else if(M.isCompressedTexture)if(M.isCompressedArrayTexture){Ke&&rt&&t.texStorage3D(i.TEXTURE_2D_ARRAY,Ce,Re,He[0].width,He[0].height,me.depth);for(let pe=0,we=He.length;pe<we;pe++)if(be=He[pe],M.format!==fi)if(Ee!==null)if(Ke){if(z)if(M.layerUpdates.size>0){let Le=Lh(be.width,be.height,M.format,M.type);for(let ve of M.layerUpdates){let $e=be.data.subarray(ve*Le/be.data.BYTES_PER_ELEMENT,(ve+1)*Le/be.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,pe,0,0,ve,be.width,be.height,1,Ee,$e)}}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,pe,0,0,0,be.width,be.height,me.depth,Ee,be.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,pe,Re,be.width,be.height,me.depth,0,be.data,0,0);else Qe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else Ke?z&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,pe,0,0,0,be.width,be.height,me.depth,Ee,Ye,be.data):t.texImage3D(i.TEXTURE_2D_ARRAY,pe,Re,be.width,be.height,me.depth,0,Ee,Ye,be.data);M.layerUpdates.size>0&&M.clearLayerUpdates()}else{Ke&&rt&&t.texStorage2D(i.TEXTURE_2D,Ce,Re,He[0].width,He[0].height);for(let pe=0,we=He.length;pe<we;pe++)be=He[pe],M.format!==fi?Ee!==null?Ke?z&&t.compressedTexSubImage2D(i.TEXTURE_2D,pe,0,0,be.width,be.height,Ee,be.data):t.compressedTexImage2D(i.TEXTURE_2D,pe,Re,be.width,be.height,0,be.data):Qe("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):Ke?z&&t.texSubImage2D(i.TEXTURE_2D,pe,0,0,be.width,be.height,Ee,Ye,be.data):t.texImage2D(i.TEXTURE_2D,pe,Re,be.width,be.height,0,Ee,Ye,be.data)}else if(M.isDataArrayTexture)if(Ke){if(rt&&t.texStorage3D(i.TEXTURE_2D_ARRAY,Ce,Re,me.width,me.height,me.depth),z)if(M.layerUpdates.size>0){let pe=Lh(me.width,me.height,M.format,M.type);for(let we of M.layerUpdates){let Le=me.data.subarray(we*pe/me.data.BYTES_PER_ELEMENT,(we+1)*pe/me.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,we,me.width,me.height,1,Ee,Ye,Le)}M.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,me.width,me.height,me.depth,Ee,Ye,me.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,Re,me.width,me.height,me.depth,0,Ee,Ye,me.data);else if(M.isData3DTexture)Ke?(rt&&t.texStorage3D(i.TEXTURE_3D,Ce,Re,me.width,me.height,me.depth),z&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,me.width,me.height,me.depth,Ee,Ye,me.data)):t.texImage3D(i.TEXTURE_3D,0,Re,me.width,me.height,me.depth,0,Ee,Ye,me.data);else if(M.isFramebufferTexture){if(rt)if(Ke)t.texStorage2D(i.TEXTURE_2D,Ce,Re,me.width,me.height);else{let pe=me.width,we=me.height;for(let Le=0;Le<Ce;Le++)t.texImage2D(i.TEXTURE_2D,Le,Re,pe,we,0,Ee,Ye,null),pe>>=1,we>>=1}}else if(M.isHTMLTexture){if("texElementImage2D"in i){let pe=i.canvas;if(pe.hasAttribute("layoutsubtree")||pe.setAttribute("layoutsubtree","true"),me.parentNode!==pe){pe.appendChild(me),x.add(M),pe.onpaint=we=>{let Le=we.changedElements;for(let ve of x)Le.includes(ve.image)&&(ve.needsUpdate=!0)},pe.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,me);else{let Le=i.RGBA,ve=i.RGBA,$e=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,Le,ve,$e,me)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(He.length>0){if(Ke&&rt){let pe=ht(He[0]);t.texStorage2D(i.TEXTURE_2D,Ce,Re,pe.width,pe.height)}for(let pe=0,we=He.length;pe<we;pe++)be=He[pe],Ke?z&&t.texSubImage2D(i.TEXTURE_2D,pe,0,0,Ee,Ye,be):t.texImage2D(i.TEXTURE_2D,pe,Re,Ee,Ye,be);M.generateMipmaps=!1}else if(Ke){if(rt){let pe=ht(me);t.texStorage2D(i.TEXTURE_2D,Ce,Re,pe.width,pe.height)}z&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,Ee,Ye,me)}else t.texImage2D(i.TEXTURE_2D,0,Re,Ee,Ye,me);_(M)&&R(ne),Ae.__version=Me.version,M.onUpdate&&M.onUpdate(M)}L.__version=M.version}function tt(L,M,$){if(M.image.length!==6)return;let ne=gt(L,M),le=M.source;t.bindTexture(i.TEXTURE_CUBE_MAP,L.__webglTexture,i.TEXTURE0+$);let Me=n.get(le);if(le.version!==Me.__version||ne===!0){t.activeTexture(i.TEXTURE0+$);let Ae=St.getPrimaries(St.workingColorSpace),se=M.colorSpace===Ji?null:St.getPrimaries(M.colorSpace),me=M.colorSpace===Ji||Ae===se?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,M.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,M.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,M.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,me);let Ee=M.isCompressedTexture||M.image[0].isCompressedTexture,Ye=M.image[0]&&M.image[0].isDataTexture,Re=[];for(let ve=0;ve<6;ve++)!Ee&&!Ye?Re[ve]=v(M.image[ve],!0,s.maxCubemapSize):Re[ve]=Ye?M.image[ve].image:M.image[ve],Re[ve]=ln(M,Re[ve]);let be=Re[0],He=r.convert(M.format,M.colorSpace),Ke=r.convert(M.type),rt=E(M.internalFormat,He,Ke,M.normalized,M.colorSpace),z=M.isVideoTexture!==!0,Ce=Me.__version===void 0||ne===!0,pe=le.dataReady,we=P(M,be);xt(i.TEXTURE_CUBE_MAP,M);let Le;if(Ee){z&&Ce&&t.texStorage2D(i.TEXTURE_CUBE_MAP,we,rt,be.width,be.height);for(let ve=0;ve<6;ve++){Le=Re[ve].mipmaps;for(let $e=0;$e<Le.length;$e++){let We=Le[$e];M.format!==fi?He!==null?z?pe&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ve,$e,0,0,We.width,We.height,He,We.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ve,$e,rt,We.width,We.height,0,We.data):Qe("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):z?pe&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ve,$e,0,0,We.width,We.height,He,Ke,We.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ve,$e,rt,We.width,We.height,0,He,Ke,We.data)}}}else{if(Le=M.mipmaps,z&&Ce){Le.length>0&&we++;let ve=ht(Re[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,we,rt,ve.width,ve.height)}for(let ve=0;ve<6;ve++)if(Ye){z?pe&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ve,0,0,0,Re[ve].width,Re[ve].height,He,Ke,Re[ve].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ve,0,rt,Re[ve].width,Re[ve].height,0,He,Ke,Re[ve].data);for(let $e=0;$e<Le.length;$e++){let Ft=Le[$e].image[ve].image;z?pe&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ve,$e+1,0,0,Ft.width,Ft.height,He,Ke,Ft.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ve,$e+1,rt,Ft.width,Ft.height,0,He,Ke,Ft.data)}}else{z?pe&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ve,0,0,0,He,Ke,Re[ve]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ve,0,rt,He,Ke,Re[ve]);for(let $e=0;$e<Le.length;$e++){let We=Le[$e];z?pe&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ve,$e+1,0,0,He,Ke,We.image[ve]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+ve,$e+1,rt,He,Ke,We.image[ve])}}}_(M)&&R(i.TEXTURE_CUBE_MAP),Me.__version=le.version,M.onUpdate&&M.onUpdate(M)}L.__version=M.version}function Se(L,M,$,ne,le,Me){let Ae=r.convert($.format,$.colorSpace),se=r.convert($.type),me=E($.internalFormat,Ae,se,$.normalized,$.colorSpace),Ee=n.get(M),Ye=n.get($);if(Ye.__renderTarget=M,!Ee.__hasExternalTextures){let Re=Math.max(1,M.width>>Me),be=Math.max(1,M.height>>Me);le===i.TEXTURE_3D||le===i.TEXTURE_2D_ARRAY?t.texImage3D(le,Me,me,Re,be,M.depth,0,Ae,se,null):t.texImage2D(le,Me,me,Re,be,0,Ae,se,null)}t.bindFramebuffer(i.FRAMEBUFFER,L),Jt(M)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,ne,le,Ye.__webglTexture,0,Gt(M)):(le===i.TEXTURE_2D||le>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&le<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,ne,le,Ye.__webglTexture,Me),t.bindFramebuffer(i.FRAMEBUFFER,null)}function et(L,M,$){if(i.bindRenderbuffer(i.RENDERBUFFER,L),M.depthBuffer){let ne=M.depthTexture,le=ne&&ne.isDepthTexture?ne.type:null,Me=I(M.stencilBuffer,le),Ae=M.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;Jt(M)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Gt(M),Me,M.width,M.height):$?i.renderbufferStorageMultisample(i.RENDERBUFFER,Gt(M),Me,M.width,M.height):i.renderbufferStorage(i.RENDERBUFFER,Me,M.width,M.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,Ae,i.RENDERBUFFER,L)}else{let ne=M.textures;for(let le=0;le<ne.length;le++){let Me=ne[le],Ae=r.convert(Me.format,Me.colorSpace),se=r.convert(Me.type),me=E(Me.internalFormat,Ae,se,Me.normalized,Me.colorSpace);Jt(M)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Gt(M),me,M.width,M.height):$?i.renderbufferStorageMultisample(i.RENDERBUFFER,Gt(M),me,M.width,M.height):i.renderbufferStorage(i.RENDERBUFFER,me,M.width,M.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function nn(L,M,$){let ne=M.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,L),!(M.depthTexture&&M.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let le=n.get(M.depthTexture);if(le.__renderTarget=M,(!le.__webglTexture||M.depthTexture.image.width!==M.width||M.depthTexture.image.height!==M.height)&&(M.depthTexture.image.width=M.width,M.depthTexture.image.height=M.height,M.depthTexture.needsUpdate=!0),ne){if(le.__webglInit===void 0&&(le.__webglInit=!0,M.depthTexture.addEventListener("dispose",U)),le.__webglTexture===void 0){le.__webglTexture=i.createTexture(),t.bindTexture(i.TEXTURE_CUBE_MAP,le.__webglTexture),xt(i.TEXTURE_CUBE_MAP,M.depthTexture);let Ee=r.convert(M.depthTexture.format),Ye=r.convert(M.depthTexture.type),Re;M.depthTexture.format===Ni?Re=i.DEPTH_COMPONENT24:M.depthTexture.format===bs&&(Re=i.DEPTH24_STENCIL8);for(let be=0;be<6;be++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+be,0,Re,M.width,M.height,0,Ee,Ye,null)}}else ye(M.depthTexture,0);let Me=le.__webglTexture,Ae=Gt(M),se=ne?i.TEXTURE_CUBE_MAP_POSITIVE_X+$:i.TEXTURE_2D,me=M.depthTexture.format===bs?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(M.depthTexture.format===Ni)Jt(M)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,me,se,Me,0,Ae):i.framebufferTexture2D(i.FRAMEBUFFER,me,se,Me,0);else if(M.depthTexture.format===bs)Jt(M)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,me,se,Me,0,Ae):i.framebufferTexture2D(i.FRAMEBUFFER,me,se,Me,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function ot(L){let M=n.get(L),$=L.isWebGLCubeRenderTarget===!0;if(M.__boundDepthTexture!==L.depthTexture){let ne=L.depthTexture;if(M.__depthDisposeCallback&&M.__depthDisposeCallback(),ne){let le=()=>{delete M.__boundDepthTexture,delete M.__depthDisposeCallback,ne.removeEventListener("dispose",le)};ne.addEventListener("dispose",le),M.__depthDisposeCallback=le}M.__boundDepthTexture=ne}if(L.depthTexture&&!M.__autoAllocateDepthBuffer)if($)for(let ne=0;ne<6;ne++)nn(M.__webglFramebuffer[ne],L,ne);else{let ne=L.texture.mipmaps;ne&&ne.length>0?nn(M.__webglFramebuffer[0],L,0):nn(M.__webglFramebuffer,L,0)}else if($){M.__webglDepthbuffer=[];for(let ne=0;ne<6;ne++)if(t.bindFramebuffer(i.FRAMEBUFFER,M.__webglFramebuffer[ne]),M.__webglDepthbuffer[ne]===void 0)M.__webglDepthbuffer[ne]=i.createRenderbuffer(),et(M.__webglDepthbuffer[ne],L,!1);else{let le=L.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Me=M.__webglDepthbuffer[ne];i.bindRenderbuffer(i.RENDERBUFFER,Me),i.framebufferRenderbuffer(i.FRAMEBUFFER,le,i.RENDERBUFFER,Me)}}else{let ne=L.texture.mipmaps;if(ne&&ne.length>0?t.bindFramebuffer(i.FRAMEBUFFER,M.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,M.__webglFramebuffer),M.__webglDepthbuffer===void 0)M.__webglDepthbuffer=i.createRenderbuffer(),et(M.__webglDepthbuffer,L,!1);else{let le=L.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Me=M.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,Me),i.framebufferRenderbuffer(i.FRAMEBUFFER,le,i.RENDERBUFFER,Me)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function Oe(L,M,$){let ne=n.get(L);M!==void 0&&Se(ne.__webglFramebuffer,L,L.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),$!==void 0&&ot(L)}function Ct(L){let M=L.texture,$=n.get(L),ne=n.get(M);L.addEventListener("dispose",b);let le=L.textures,Me=L.isWebGLCubeRenderTarget===!0,Ae=le.length>1;if(Ae||(ne.__webglTexture===void 0&&(ne.__webglTexture=i.createTexture()),ne.__version=M.version,a.memory.textures++),Me){$.__webglFramebuffer=[];for(let se=0;se<6;se++)if(M.mipmaps&&M.mipmaps.length>0){$.__webglFramebuffer[se]=[];for(let me=0;me<M.mipmaps.length;me++)$.__webglFramebuffer[se][me]=i.createFramebuffer()}else $.__webglFramebuffer[se]=i.createFramebuffer()}else{if(M.mipmaps&&M.mipmaps.length>0){$.__webglFramebuffer=[];for(let se=0;se<M.mipmaps.length;se++)$.__webglFramebuffer[se]=i.createFramebuffer()}else $.__webglFramebuffer=i.createFramebuffer();if(Ae)for(let se=0,me=le.length;se<me;se++){let Ee=n.get(le[se]);Ee.__webglTexture===void 0&&(Ee.__webglTexture=i.createTexture(),a.memory.textures++)}if(L.samples>0&&Jt(L)===!1){$.__webglMultisampledFramebuffer=i.createFramebuffer(),$.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,$.__webglMultisampledFramebuffer);for(let se=0;se<le.length;se++){let me=le[se];$.__webglColorRenderbuffer[se]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,$.__webglColorRenderbuffer[se]);let Ee=r.convert(me.format,me.colorSpace),Ye=r.convert(me.type),Re=E(me.internalFormat,Ee,Ye,me.normalized,me.colorSpace,L.isXRRenderTarget===!0),be=Gt(L);i.renderbufferStorageMultisample(i.RENDERBUFFER,be,Re,L.width,L.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+se,i.RENDERBUFFER,$.__webglColorRenderbuffer[se])}i.bindRenderbuffer(i.RENDERBUFFER,null),L.depthBuffer&&($.__webglDepthRenderbuffer=i.createRenderbuffer(),et($.__webglDepthRenderbuffer,L,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(Me){t.bindTexture(i.TEXTURE_CUBE_MAP,ne.__webglTexture),xt(i.TEXTURE_CUBE_MAP,M);for(let se=0;se<6;se++)if(M.mipmaps&&M.mipmaps.length>0)for(let me=0;me<M.mipmaps.length;me++)Se($.__webglFramebuffer[se][me],L,M,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+se,me);else Se($.__webglFramebuffer[se],L,M,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+se,0);_(M)&&R(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Ae){for(let se=0,me=le.length;se<me;se++){let Ee=le[se],Ye=n.get(Ee),Re=i.TEXTURE_2D;(L.isWebGL3DRenderTarget||L.isWebGLArrayRenderTarget)&&(Re=L.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(Re,Ye.__webglTexture),xt(Re,Ee),Se($.__webglFramebuffer,L,Ee,i.COLOR_ATTACHMENT0+se,Re,0),_(Ee)&&R(Re)}t.unbindTexture()}else{let se=i.TEXTURE_2D;if((L.isWebGL3DRenderTarget||L.isWebGLArrayRenderTarget)&&(se=L.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(se,ne.__webglTexture),xt(se,M),M.mipmaps&&M.mipmaps.length>0)for(let me=0;me<M.mipmaps.length;me++)Se($.__webglFramebuffer[me],L,M,i.COLOR_ATTACHMENT0,se,me);else Se($.__webglFramebuffer,L,M,i.COLOR_ATTACHMENT0,se,0);_(M)&&R(se),t.unbindTexture()}L.depthBuffer&&ot(L)}function dt(L){let M=L.textures;for(let $=0,ne=M.length;$<ne;$++){let le=M[$];if(_(le)){let Me=D(L),Ae=n.get(le).__webglTexture;t.bindTexture(Me,Ae),R(Me),t.unbindTexture()}}}let pt=[],$t=[];function An(L){if(L.samples>0){if(Jt(L)===!1){let M=L.textures,$=L.width,ne=L.height,le=i.COLOR_BUFFER_BIT,Me=L.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Ae=n.get(L),se=M.length>1;if(se)for(let Ee=0;Ee<M.length;Ee++)t.bindFramebuffer(i.FRAMEBUFFER,Ae.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ee,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,Ae.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ee,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,Ae.__webglMultisampledFramebuffer);let me=L.texture.mipmaps;me&&me.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Ae.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Ae.__webglFramebuffer);for(let Ee=0;Ee<M.length;Ee++){if(L.resolveDepthBuffer&&(L.depthBuffer&&(le|=i.DEPTH_BUFFER_BIT),L.stencilBuffer&&L.resolveStencilBuffer&&(le|=i.STENCIL_BUFFER_BIT)),se){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,Ae.__webglColorRenderbuffer[Ee]);let Ye=n.get(M[Ee]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Ye,0)}i.blitFramebuffer(0,0,$,ne,0,0,$,ne,le,i.NEAREST),c===!0&&(pt.length=0,$t.length=0,pt.push(i.COLOR_ATTACHMENT0+Ee),L.depthBuffer&&L.storeMultisampledDepthBuffer===!1&&(pt.push(Me),$t.push(Me),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,$t)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,pt))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),se)for(let Ee=0;Ee<M.length;Ee++){t.bindFramebuffer(i.FRAMEBUFFER,Ae.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ee,i.RENDERBUFFER,Ae.__webglColorRenderbuffer[Ee]);let Ye=n.get(M[Ee]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,Ae.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ee,i.TEXTURE_2D,Ye,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Ae.__webglMultisampledFramebuffer)}else if(L.depthBuffer&&L.storeMultisampledDepthBuffer===!1&&c){let M=L.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[M])}}}function Gt(L){return Math.min(s.maxSamples,L.samples)}function Jt(L){let M=n.get(L);return L.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&M.__useRenderToTexture!==!1}function G(L){let M=a.render.frame;d.get(L)!==M&&(d.set(L,M),L.update())}function ln(L,M){let $=L.colorSpace,ne=L.format,le=L.type;return L.isCompressedTexture===!0||L.isVideoTexture===!0||$!==na&&$!==Ji&&(St.getTransfer($)===Nt?(ne!==fi||le!==Yn)&&Qe("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):nt("WebGLTextures: Unsupported texture color space:",$)),M}function ht(L){return typeof HTMLImageElement<"u"&&L instanceof HTMLImageElement?(h.width=L.naturalWidth||L.width,h.height=L.naturalHeight||L.height):typeof VideoFrame<"u"&&L instanceof VideoFrame?(h.width=L.displayWidth,h.height=L.displayHeight):(h.width=L.width,h.height=L.height),h}this.allocateTextureUnit=fe,this.resetTextureUnits=Q,this.getTextureUnits=V,this.setTextureUnits=te,this.setTexture2D=ye,this.setTexture2DArray=oe,this.setTexture3D=q,this.setTextureCube=xe,this.rebindTextures=Oe,this.setupRenderTarget=Ct,this.updateRenderTargetMipmap=dt,this.updateMultisampleRenderTarget=An,this.setupDepthRenderbuffer=ot,this.setupFrameBufferTexture=Se,this.useMultisampledRTT=Jt,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function zx(i,e){function t(n,s=Ji){let r,a=St.getTransfer(s);if(n===Yn)return i.UNSIGNED_BYTE;if(n===Ml)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Sl)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Mh)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Sh)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===vh)return i.BYTE;if(n===yh)return i.SHORT;if(n===Rr)return i.UNSIGNED_SHORT;if(n===yl)return i.INT;if(n===Ti)return i.UNSIGNED_INT;if(n===Ai)return i.FLOAT;if(n===Ei)return i.HALF_FLOAT;if(n===bh)return i.ALPHA;if(n===wh)return i.RGB;if(n===fi)return i.RGBA;if(n===Ni)return i.DEPTH_COMPONENT;if(n===bs)return i.DEPTH_STENCIL;if(n===Th)return i.RED;if(n===bl)return i.RED_INTEGER;if(n===ws)return i.RG;if(n===wl)return i.RG_INTEGER;if(n===Tl)return i.RGBA_INTEGER;if(n===Ca||n===Ra||n===Pa||n===Ia)if(a===Nt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Ca)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===Ra)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Pa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Ia)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Ca)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===Ra)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Pa)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Ia)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Al||n===El||n===Cl||n===Rl)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Al)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===El)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Cl)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Rl)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===Pl||n===Il||n===Ll||n===Dl||n===Nl||n===La||n===Ul)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===Pl||n===Il)return a===Nt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Ll)return a===Nt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===Dl)return r.COMPRESSED_R11_EAC;if(n===Nl)return r.COMPRESSED_SIGNED_R11_EAC;if(n===La)return r.COMPRESSED_RG11_EAC;if(n===Ul)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Fl||n===Ol||n===Bl||n===kl||n===zl||n===Vl||n===Gl||n===Hl||n===Wl||n===Xl||n===ql||n===Yl||n===Zl||n===$l)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Fl)return a===Nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Ol)return a===Nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Bl)return a===Nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===kl)return a===Nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===zl)return a===Nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Vl)return a===Nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Gl)return a===Nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Hl)return a===Nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Wl)return a===Nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Xl)return a===Nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===ql)return a===Nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Yl)return a===Nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Zl)return a===Nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===$l)return a===Nt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Jl||n===Kl||n===jl)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===Jl)return a===Nt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Kl)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===jl)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===Ql||n===ec||n===Da||n===tc)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===Ql)return r.COMPRESSED_RED_RGTC1_EXT;if(n===ec)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Da)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===tc)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===Pr?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var Vx=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,Gx=`
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

}`,Kh=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new ua(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new dn({vertexShader:Vx,fragmentShader:Gx,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new ct(new Oi(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},jh=class extends Ui{constructor(e,t){super();let n=this,s=null,r=1,a=null,o="local-floor",c=1,h=null,d=null,x=null,u=null,m=null,y=null,T=typeof XRWebGLBinding<"u",v=new Kh,_={},R=t.getContextAttributes(),D=null,E=null,I=[],P=[],U=new ke,b=null,C=null,O=new Pn;O.viewport=new qt;let H=new Pn;H.viewport=new qt;let Y=[O,H],Q=new pl,V=null,te=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(he){let ge=I[he];return ge===void 0&&(ge=new Mr,I[he]=ge),ge.getTargetRaySpace()},this.getControllerGrip=function(he){let ge=I[he];return ge===void 0&&(ge=new Mr,I[he]=ge),ge.getGripSpace()},this.getHand=function(he){let ge=I[he];return ge===void 0&&(ge=new Mr,I[he]=ge),ge.getHandSpace()};function fe(he){let ge=P.indexOf(he.inputSource);if(ge===-1)return;let Be=I[ge];Be!==void 0&&(Be.update(he.inputSource,he.frame,h||a),Be.dispatchEvent({type:he.type,data:he.inputSource}))}function ue(){s.removeEventListener("select",fe),s.removeEventListener("selectstart",fe),s.removeEventListener("selectend",fe),s.removeEventListener("squeeze",fe),s.removeEventListener("squeezestart",fe),s.removeEventListener("squeezeend",fe),s.removeEventListener("end",ue),s.removeEventListener("inputsourceschange",ye);for(let he=0;he<I.length;he++){let ge=P[he];ge!==null&&(P[he]=null,I[he].disconnect(ge))}V=null,te=null,v.reset();for(let he in _)delete _[he];if(e.setRenderTarget(D),m=null,u=null,x=null,s=null,E=null,gt.stop(),n.isPresenting=!1,e.setPixelRatio(b),e.setSize(U.width,U.height,!1),C!==null){let he=C.camera;he.fov=C.fov,he.zoom=C.zoom,he.updateProjectionMatrix(),C=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(he){r=he,n.isPresenting===!0&&Qe("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(he){o=he,n.isPresenting===!0&&Qe("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return h||a},this.setReferenceSpace=function(he){h=he},this.getBaseLayer=function(){return u!==null?u:m},this.getBinding=function(){return x===null&&T&&(x=new XRWebGLBinding(s,t)),x},this.getFrame=function(){return y},this.getSession=function(){return s},this.setSession=async function(he){if(s=he,s!==null){if(D=e.getRenderTarget(),s.addEventListener("select",fe),s.addEventListener("selectstart",fe),s.addEventListener("selectend",fe),s.addEventListener("squeeze",fe),s.addEventListener("squeezestart",fe),s.addEventListener("squeezeend",fe),s.addEventListener("end",ue),s.addEventListener("inputsourceschange",ye),R.xrCompatible!==!0&&await t.makeXRCompatible(),b=e.getPixelRatio(),e.getSize(U),T&&"createProjectionLayer"in XRWebGLBinding.prototype){let Be=null,tt=null,Se=null;R.depth&&(Se=R.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,Be=R.stencil?bs:Ni,tt=R.stencil?Pr:Ti);let et={colorFormat:t.RGBA8,depthFormat:Se,scaleFactor:r};x=this.getBinding(),u=x.createProjectionLayer(et),s.updateRenderState({layers:[u]}),e.setPixelRatio(1),e.setSize(u.textureWidth,u.textureHeight,!1),E=new Xn(u.textureWidth,u.textureHeight,{format:fi,type:Yn,depthTexture:new hs(u.textureWidth,u.textureHeight,tt,void 0,void 0,void 0,void 0,void 0,void 0,Be),stencilBuffer:R.stencil,colorSpace:e.outputColorSpace,samples:R.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1,storeMultisampledDepthBuffer:u.ignoreDepthValues===!1,storeMultisampledStencilBuffer:u.ignoreDepthValues===!1})}else{let Be={antialias:R.antialias,alpha:!0,depth:R.depth,stencil:R.stencil,framebufferScaleFactor:r};m=new XRWebGLLayer(s,t,Be),s.updateRenderState({baseLayer:m}),e.setPixelRatio(1),e.setSize(m.framebufferWidth,m.framebufferHeight,!1),E=new Xn(m.framebufferWidth,m.framebufferHeight,{format:fi,type:Yn,colorSpace:e.outputColorSpace,stencilBuffer:R.stencil,resolveDepthBuffer:m.ignoreDepthValues===!1,resolveStencilBuffer:m.ignoreDepthValues===!1,storeMultisampledDepthBuffer:m.ignoreDepthValues===!1,storeMultisampledStencilBuffer:m.ignoreDepthValues===!1})}E.isXRRenderTarget=!0,this.setFoveation(c),h=null,a=await s.requestReferenceSpace(o),gt.setContext(s),gt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return v.getDepthTexture()};function ye(he){for(let ge=0;ge<he.removed.length;ge++){let Be=he.removed[ge],tt=P.indexOf(Be);tt>=0&&(P[tt]=null,I[tt].disconnect(Be))}for(let ge=0;ge<he.added.length;ge++){let Be=he.added[ge],tt=P.indexOf(Be);if(tt===-1){for(let et=0;et<I.length;et++)if(et>=P.length){P.push(Be),tt=et;break}else if(P[et]===null){P[et]=Be,tt=et;break}if(tt===-1)break}let Se=I[tt];Se&&Se.connect(Be)}}let oe=new N,q=new N;function xe(he,ge,Be){oe.setFromMatrixPosition(ge.matrixWorld),q.setFromMatrixPosition(Be.matrixWorld);let tt=oe.distanceTo(q),Se=ge.projectionMatrix.elements,et=Be.projectionMatrix.elements,nn=Se[14]/(Se[10]-1),ot=Se[14]/(Se[10]+1),Oe=(Se[9]+1)/Se[5],Ct=(Se[9]-1)/Se[5],dt=(Se[8]-1)/Se[0],pt=(et[8]+1)/et[0],$t=nn*dt,An=nn*pt,Gt=tt/(-dt+pt),Jt=Gt*-dt;if(ge.matrixWorld.decompose(he.position,he.quaternion,he.scale),he.translateX(Jt),he.translateZ(Gt),he.matrixWorld.compose(he.position,he.quaternion,he.scale),he.matrixWorldInverse.copy(he.matrixWorld).invert(),Se[10]===-1)he.projectionMatrix.copy(ge.projectionMatrix),he.projectionMatrixInverse.copy(ge.projectionMatrixInverse);else{let G=nn+Gt,ln=ot+Gt,ht=$t-Jt,L=An+(tt-Jt),M=Oe*ot/ln*G,$=Ct*ot/ln*G;he.projectionMatrix.makePerspective(ht,L,M,$,G,ln),he.projectionMatrixInverse.copy(he.projectionMatrix).invert()}}function qe(he,ge){ge===null?he.matrixWorld.copy(he.matrix):he.matrixWorld.multiplyMatrices(ge.matrixWorld,he.matrix),he.matrixWorldInverse.copy(he.matrixWorld).invert()}this.updateCamera=function(he){if(s===null)return;let ge=he.near,Be=he.far;v.texture!==null&&(v.depthNear>0&&(ge=v.depthNear),v.depthFar>0&&(Be=v.depthFar)),Q.near=H.near=O.near=ge,Q.far=H.far=O.far=Be,(V!==Q.near||te!==Q.far)&&(s.updateRenderState({depthNear:Q.near,depthFar:Q.far}),V=Q.near,te=Q.far),Q.layers.mask=he.layers.mask|6,O.layers.mask=Q.layers.mask&-5,H.layers.mask=Q.layers.mask&-3;let tt=he.parent,Se=Q.cameras;qe(Q,tt);for(let et=0;et<Se.length;et++)qe(Se[et],tt);Se.length===2?xe(Q,O,H):Q.projectionMatrix.copy(O.projectionMatrix),C===null&&he.isPerspectiveCamera&&(C={camera:he,fov:he.fov,zoom:he.zoom}),Ze(he,Q,tt)};function Ze(he,ge,Be){Be===null?he.matrix.copy(ge.matrixWorld):(he.matrix.copy(Be.matrixWorld),he.matrix.invert(),he.matrix.multiply(ge.matrixWorld)),he.matrix.decompose(he.position,he.quaternion,he.scale),he.updateMatrixWorld(!0),he.projectionMatrix.copy(ge.projectionMatrix),he.projectionMatrixInverse.copy(ge.projectionMatrixInverse),he.isPerspectiveCamera&&(he.fov=Bo*2*Math.atan(1/he.projectionMatrix.elements[5]),he.zoom=1)}this.getCamera=function(){return Q},this.getFoveation=function(){if(!(u===null&&m===null))return c},this.setFoveation=function(he){c=he,u!==null&&(u.fixedFoveation=he),m!==null&&m.fixedFoveation!==void 0&&(m.fixedFoveation=he)},this.hasDepthSensing=function(){return v.texture!==null},this.getDepthSensingMesh=function(){return v.getMesh(Q)},this.getCameraTexture=function(he){return _[he]};let Ut=null;function xt(he,ge){if(d=ge.getViewerPose(h||a),y=ge,d!==null){let Be=d.views;m!==null&&(e.setRenderTargetFramebuffer(E,m.framebuffer),e.setRenderTarget(E));let tt=!1;Be.length!==Q.cameras.length&&(Q.cameras.length=0,tt=!0);for(let ot=0;ot<Be.length;ot++){let Oe=Be[ot],Ct=null;if(m!==null)Ct=m.getViewport(Oe);else{let pt=x.getViewSubImage(u,Oe);Ct=pt.viewport,ot===0&&(e.setRenderTargetTextures(E,pt.colorTexture,pt.depthStencilTexture),e.setRenderTarget(E))}let dt=Y[ot];dt===void 0&&(dt=new Pn,dt.layers.enable(ot),dt.viewport=new qt,Y[ot]=dt),dt.matrix.fromArray(Oe.transform.matrix),dt.matrix.decompose(dt.position,dt.quaternion,dt.scale),dt.projectionMatrix.fromArray(Oe.projectionMatrix),dt.projectionMatrixInverse.copy(dt.projectionMatrix).invert(),dt.viewport.set(Ct.x,Ct.y,Ct.width,Ct.height),ot===0&&(Q.matrix.copy(dt.matrix),Q.matrix.decompose(Q.position,Q.quaternion,Q.scale)),tt===!0&&Q.cameras.push(dt)}let Se=s.enabledFeatures;if(Se&&Se.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&T){x=n.getBinding();let ot=x.getDepthInformation(Be[0]);ot&&ot.isValid&&ot.texture&&v.init(ot,s.renderState)}if(Se&&Se.includes("camera-access")&&T){e.state.unbindTexture(),x=n.getBinding();for(let ot=0;ot<Be.length;ot++){let Oe=Be[ot].camera;if(Oe){let Ct=_[Oe];Ct||(Ct=new ua,_[Oe]=Ct);let dt=x.getCameraImage(Oe);Ct.sourceTexture=dt}}}}for(let Be=0;Be<I.length;Be++){let tt=P[Be],Se=I[Be];tt!==null&&Se!==void 0&&Se.update(tt,ge,h||a)}Ut&&Ut(he,ge),ge.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ge}),y=null}let gt=new uf;gt.setAnimationLoop(xt),this.setAnimationLoop=function(he){Ut=he},this.dispose=function(){}}},Hx=new Bt,_f=new at;_f.set(-1,0,0,0,1,0,0,0,1);function Wx(i,e){function t(v,_){v.matrixAutoUpdate===!0&&v.updateMatrix(),_.value.copy(v.matrix)}function n(v,_){_.color.getRGB(v.fogColor.value,Rh(i)),_.isFog?(v.fogNear.value=_.near,v.fogFar.value=_.far):_.isFogExp2&&(v.fogDensity.value=_.density)}function s(v,_,R,D,E){_.isNodeMaterial?_.uniformsNeedUpdate=!1:_.isMeshBasicMaterial?r(v,_):_.isMeshLambertMaterial?(r(v,_),_.envMap&&(v.envMapIntensity.value=_.envMapIntensity)):_.isMeshToonMaterial?(r(v,_),x(v,_)):_.isMeshPhongMaterial?(r(v,_),d(v,_),_.envMap&&(v.envMapIntensity.value=_.envMapIntensity)):_.isMeshStandardMaterial?(r(v,_),u(v,_),_.isMeshPhysicalMaterial&&m(v,_,E)):_.isMeshMatcapMaterial?(r(v,_),y(v,_)):_.isMeshDepthMaterial?r(v,_):_.isMeshDistanceMaterial?(r(v,_),T(v,_)):_.isMeshNormalMaterial?r(v,_):_.isLineBasicMaterial?(a(v,_),_.isLineDashedMaterial&&o(v,_)):_.isPointsMaterial?c(v,_,R,D):_.isSpriteMaterial?h(v,_):_.isShadowMaterial?(v.color.value.copy(_.color),v.opacity.value=_.opacity):_.isShaderMaterial&&(_.uniformsNeedUpdate=!1)}function r(v,_){v.opacity.value=_.opacity,_.color&&v.diffuse.value.copy(_.color),_.emissive&&v.emissive.value.copy(_.emissive).multiplyScalar(_.emissiveIntensity),_.map&&(v.map.value=_.map,t(_.map,v.mapTransform)),_.alphaMap&&(v.alphaMap.value=_.alphaMap,t(_.alphaMap,v.alphaMapTransform)),_.bumpMap&&(v.bumpMap.value=_.bumpMap,t(_.bumpMap,v.bumpMapTransform),v.bumpScale.value=_.bumpScale,_.side===Sn&&(v.bumpScale.value*=-1)),_.normalMap&&(v.normalMap.value=_.normalMap,t(_.normalMap,v.normalMapTransform),v.normalScale.value.copy(_.normalScale),_.side===Sn&&v.normalScale.value.negate()),_.displacementMap&&(v.displacementMap.value=_.displacementMap,t(_.displacementMap,v.displacementMapTransform),v.displacementScale.value=_.displacementScale,v.displacementBias.value=_.displacementBias),_.emissiveMap&&(v.emissiveMap.value=_.emissiveMap,t(_.emissiveMap,v.emissiveMapTransform)),_.specularMap&&(v.specularMap.value=_.specularMap,t(_.specularMap,v.specularMapTransform)),_.alphaTest>0&&(v.alphaTest.value=_.alphaTest);let R=e.get(_),D=R.envMap,E=R.envMapRotation;D&&(v.envMap.value=D,v.envMapRotation.value.setFromMatrix4(Hx.makeRotationFromEuler(E)).transpose(),D.isCubeTexture&&D.isRenderTargetTexture===!1&&v.envMapRotation.value.premultiply(_f),v.reflectivity.value=_.reflectivity,v.ior.value=_.ior,v.refractionRatio.value=_.refractionRatio),_.lightMap&&(v.lightMap.value=_.lightMap,v.lightMapIntensity.value=_.lightMapIntensity,t(_.lightMap,v.lightMapTransform)),_.aoMap&&(v.aoMap.value=_.aoMap,v.aoMapIntensity.value=_.aoMapIntensity,t(_.aoMap,v.aoMapTransform))}function a(v,_){v.diffuse.value.copy(_.color),v.opacity.value=_.opacity,_.map&&(v.map.value=_.map,t(_.map,v.mapTransform))}function o(v,_){v.dashSize.value=_.dashSize,v.totalSize.value=_.dashSize+_.gapSize,v.scale.value=_.scale}function c(v,_,R,D){v.diffuse.value.copy(_.color),v.opacity.value=_.opacity,v.size.value=_.size*R,v.scale.value=D*.5,_.map&&(v.map.value=_.map,t(_.map,v.uvTransform)),_.alphaMap&&(v.alphaMap.value=_.alphaMap,t(_.alphaMap,v.alphaMapTransform)),_.alphaTest>0&&(v.alphaTest.value=_.alphaTest)}function h(v,_){v.diffuse.value.copy(_.color),v.opacity.value=_.opacity,v.rotation.value=_.rotation,_.map&&(v.map.value=_.map,t(_.map,v.mapTransform)),_.alphaMap&&(v.alphaMap.value=_.alphaMap,t(_.alphaMap,v.alphaMapTransform)),_.alphaTest>0&&(v.alphaTest.value=_.alphaTest)}function d(v,_){v.specular.value.copy(_.specular),v.shininess.value=Math.max(_.shininess,1e-4)}function x(v,_){_.gradientMap&&(v.gradientMap.value=_.gradientMap)}function u(v,_){v.metalness.value=_.metalness,_.metalnessMap&&(v.metalnessMap.value=_.metalnessMap,t(_.metalnessMap,v.metalnessMapTransform)),v.roughness.value=_.roughness,_.roughnessMap&&(v.roughnessMap.value=_.roughnessMap,t(_.roughnessMap,v.roughnessMapTransform)),_.envMap&&(v.envMapIntensity.value=_.envMapIntensity)}function m(v,_,R){v.ior.value=_.ior,_.sheen>0&&(v.sheenColor.value.copy(_.sheenColor).multiplyScalar(_.sheen),v.sheenRoughness.value=_.sheenRoughness,_.sheenColorMap&&(v.sheenColorMap.value=_.sheenColorMap,t(_.sheenColorMap,v.sheenColorMapTransform)),_.sheenRoughnessMap&&(v.sheenRoughnessMap.value=_.sheenRoughnessMap,t(_.sheenRoughnessMap,v.sheenRoughnessMapTransform))),_.clearcoat>0&&(v.clearcoat.value=_.clearcoat,v.clearcoatRoughness.value=_.clearcoatRoughness,_.clearcoatMap&&(v.clearcoatMap.value=_.clearcoatMap,t(_.clearcoatMap,v.clearcoatMapTransform)),_.clearcoatRoughnessMap&&(v.clearcoatRoughnessMap.value=_.clearcoatRoughnessMap,t(_.clearcoatRoughnessMap,v.clearcoatRoughnessMapTransform)),_.clearcoatNormalMap&&(v.clearcoatNormalMap.value=_.clearcoatNormalMap,t(_.clearcoatNormalMap,v.clearcoatNormalMapTransform),v.clearcoatNormalScale.value.copy(_.clearcoatNormalScale),_.side===Sn&&v.clearcoatNormalScale.value.negate())),_.dispersion>0&&(v.dispersion.value=_.dispersion),_.retroreflectivity>0&&(v.retroreflectivity.value=_.retroreflectivity),_.iridescence>0&&(v.iridescence.value=_.iridescence,v.iridescenceIOR.value=_.iridescenceIOR,v.iridescenceThicknessMinimum.value=_.iridescenceThicknessRange[0],v.iridescenceThicknessMaximum.value=_.iridescenceThicknessRange[1],_.iridescenceMap&&(v.iridescenceMap.value=_.iridescenceMap,t(_.iridescenceMap,v.iridescenceMapTransform)),_.iridescenceThicknessMap&&(v.iridescenceThicknessMap.value=_.iridescenceThicknessMap,t(_.iridescenceThicknessMap,v.iridescenceThicknessMapTransform))),_.transmission>0&&(v.transmission.value=_.transmission,v.transmissionSamplerMap.value=R.texture,v.transmissionSamplerSize.value.set(R.width,R.height),_.transmissionMap&&(v.transmissionMap.value=_.transmissionMap,t(_.transmissionMap,v.transmissionMapTransform)),v.thickness.value=_.thickness,_.thicknessMap&&(v.thicknessMap.value=_.thicknessMap,t(_.thicknessMap,v.thicknessMapTransform)),v.attenuationDistance.value=_.attenuationDistance,v.attenuationColor.value.copy(_.attenuationColor)),_.anisotropy>0&&(v.anisotropyVector.value.set(_.anisotropy*Math.cos(_.anisotropyRotation),_.anisotropy*Math.sin(_.anisotropyRotation)),_.anisotropyMap&&(v.anisotropyMap.value=_.anisotropyMap,t(_.anisotropyMap,v.anisotropyMapTransform))),v.specularIntensity.value=_.specularIntensity,v.specularColor.value.copy(_.specularColor),_.specularColorMap&&(v.specularColorMap.value=_.specularColorMap,t(_.specularColorMap,v.specularColorMapTransform)),_.specularIntensityMap&&(v.specularIntensityMap.value=_.specularIntensityMap,t(_.specularIntensityMap,v.specularIntensityMapTransform))}function y(v,_){_.matcap&&(v.matcap.value=_.matcap)}function T(v,_){let R=e.get(_).light;v.referencePosition.value.setFromMatrixPosition(R.matrixWorld),v.nearDistance.value=R.shadow.camera.near,v.farDistance.value=R.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function Xx(i,e,t,n){let s={},r={},a=[],o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function c(E,I){let P=I.program;n.uniformBlockBinding(E,P)}function h(E,I){let P=s[E.id];P===void 0&&(v(E),P=d(E),s[E.id]=P,E.addEventListener("dispose",R));let U=I.program;n.updateUBOMapping(E,U);let b=e.render.frame;r[E.id]!==b&&(u(E),r[E.id]=b)}function d(E){let I=x();E.__bindingPointIndex=I;let P=i.createBuffer(),U=E.__size,b=E.usage;return i.bindBuffer(i.UNIFORM_BUFFER,P),i.bufferData(i.UNIFORM_BUFFER,U,b),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,I,P),P}function x(){for(let E=0;E<o;E++)if(a.indexOf(E)===-1)return a.push(E),E;return nt("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(E){let I=s[E.id],P=E.uniforms,U=E.__cache;i.bindBuffer(i.UNIFORM_BUFFER,I);for(let b=0,C=P.length;b<C;b++){let O=P[b];if(Array.isArray(O))for(let H=0,Y=O.length;H<Y;H++)m(O[H],b,H,U);else m(O,b,0,U)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function m(E,I,P,U){if(T(E,I,P,U)===!0){let b=E.__offset,C=E.value;if(Array.isArray(C)){let O=0;for(let H=0;H<C.length;H++){let Y=C[H],Q=_(Y);y(Y,E.__data,O),typeof Y!="number"&&typeof Y!="boolean"&&!Y.isMatrix3&&!ArrayBuffer.isView(Y)&&(O+=Q.storage/Float32Array.BYTES_PER_ELEMENT)}}else y(C,E.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,b,E.__data)}}function y(E,I,P){typeof E=="number"||typeof E=="boolean"?I[0]=E:E.isMatrix3?(I[0]=E.elements[0],I[1]=E.elements[1],I[2]=E.elements[2],I[3]=0,I[4]=E.elements[3],I[5]=E.elements[4],I[6]=E.elements[5],I[7]=0,I[8]=E.elements[6],I[9]=E.elements[7],I[10]=E.elements[8],I[11]=0):ArrayBuffer.isView(E)?I.set(new E.constructor(E.buffer,E.byteOffset,I.length)):E.toArray(I,P)}function T(E,I,P,U){let b=E.value,C=I+"_"+P;if(U[C]===void 0)return typeof b=="number"||typeof b=="boolean"?U[C]=b:ArrayBuffer.isView(b)?U[C]=b.slice():U[C]=b.clone(),!0;{let O=U[C];if(typeof b=="number"||typeof b=="boolean"){if(O!==b)return U[C]=b,!0}else{if(ArrayBuffer.isView(b))return!0;if(O.equals(b)===!1)return O.copy(b),!0}}return!1}function v(E){let I=E.uniforms,P=0,U=16;for(let C=0,O=I.length;C<O;C++){let H=Array.isArray(I[C])?I[C]:[I[C]];for(let Y=0,Q=H.length;Y<Q;Y++){let V=H[Y],te=Array.isArray(V.value)?V.value:[V.value];for(let fe=0,ue=te.length;fe<ue;fe++){let ye=te[fe],oe=_(ye),q=P%U,xe=q%oe.boundary,qe=q+xe;P+=xe,qe!==0&&U-qe<oe.storage&&(P+=U-qe),V.__data=new Float32Array(oe.storage/Float32Array.BYTES_PER_ELEMENT),V.__offset=P,P+=oe.storage}}}let b=P%U;return b>0&&(P+=U-b),E.__size=P,E.__cache={},this}function _(E){let I={boundary:0,storage:0};return typeof E=="number"||typeof E=="boolean"?(I.boundary=4,I.storage=4):E.isVector2?(I.boundary=8,I.storage=8):E.isVector3||E.isColor?(I.boundary=16,I.storage=12):E.isVector4?(I.boundary=16,I.storage=16):E.isMatrix3?(I.boundary=48,I.storage=48):E.isMatrix4?(I.boundary=64,I.storage=64):E.isTexture?Qe("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(E)?(I.boundary=16,I.storage=E.byteLength):Qe("WebGLRenderer: Unsupported uniform value type.",E),I}function R(E){let I=E.target;I.removeEventListener("dispose",R);let P=a.indexOf(I.__bindingPointIndex);a.splice(P,1),i.deleteBuffer(s[I.id]),delete s[I.id],delete r[I.id]}function D(){for(let E in s)i.deleteBuffer(s[E]);a=[],s={},r={}}return{bind:c,update:h,dispose:D}}var qx=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),ki=null;function Yx(){return ki===null&&(ki=new Ho(qx,16,16,ws,Ei),ki.name="DFG_LUT",ki.minFilter=bn,ki.magFilter=bn,ki.wrapS=Di,ki.wrapT=Di,ki.generateMipmaps=!1,ki.needsUpdate=!0),ki}var cc=class{constructor(e={}){let{canvas:t=Nd(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:h=!1,powerPreference:d="default",failIfMajorPerformanceCaveat:x=!1,reversedDepthBuffer:u=!1,outputBufferType:m=Yn}=e;this.isWebGLRenderer=!0;let y;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");y=n.getContextAttributes().alpha}else y=a;let T=m,v=new Set([Tl,wl,bl]),_=new Set([Yn,Ti,Rr,Pr,Ml,Sl]),R=new Uint32Array(4),D=new Int32Array(4),E=new N,I=null,P=null,U=[],b=[],C=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=wi,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let O=this,H=!1,Y=null,Q=null,V=null,te=null;this._outputColorSpace=mn;let fe=0,ue=0,ye=null,oe=-1,q=null,xe=new qt,qe=new qt,Ze=null,Ut=new je(0),xt=0,gt=t.width,he=t.height,ge=1,Be=null,tt=null,Se=new qt(0,0,gt,he),et=new qt(0,0,gt,he),nn=!1,ot=new Sr,Oe=!1,Ct=!1,dt=new Bt,pt=new N,$t=new qt,An={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Gt=!1;function Jt(){return ye===null?ge:1}let G=n;function ln(w,B){return t.getContext(w,B)}let ht,L,M,$,ne,le,Me,Ae,se,me,Ee,Ye,Re,be,He,Ke,rt,z,Ce,pe,we,Le,ve;try{let w={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:c,preserveDrawingBuffer:h,powerPreference:d,failIfMajorPerformanceCaveat:x};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"186"}`),t.addEventListener("webglcontextlost",Ft,!1),t.addEventListener("webglcontextrestored",Tt,!1),t.addEventListener("webglcontextcreationerror",$n,!1),G===null){let B="webgl2";if(G=ln(B,w),G===null)throw ln(B)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}$e()}catch(w){throw t.removeEventListener("webglcontextlost",Ft,!1),t.removeEventListener("webglcontextrestored",Tt,!1),t.removeEventListener("webglcontextcreationerror",$n,!1),nt("WebGLRenderer: "+w.message),w}function $e(){ht=new e_(G),ht.init(),we=new zx(G,ht),L=new Wg(G,ht,e,we),M=new Bx(G,ht),L.reversedDepthBuffer&&u&&M.buffers.depth.setReversed(!0),Q=G.createFramebuffer(),V=G.createFramebuffer(),te=G.createFramebuffer(),$=new i_(G),ne=new wx,le=new kx(G,ht,M,ne,L,we,$),Me=new Qg(O),Ae=new rm(G),Le=new Gg(G,Ae),se=new t_(G,Ae,$,Le),me=new r_(G,se,Ae,Le,$),z=new s_(G,L,le),He=new Xg(ne),Ee=new bx(O,Me,ht,L,Le,He),Ye=new Wx(O,ne),Re=new Ax,be=new Lx(ht),rt=new Vg(O,Me,M,me,y,c),Ke=new Ox(O,me,L),ve=new Xx(G,$,L,M),Ce=new Hg(G,ht,$),pe=new n_(G,ht,$),$.programs=Ee.programs,O.capabilities=L,O.extensions=ht,O.properties=ne,O.renderLists=Re,O.shadowMap=Ke,O.state=M,O.info=$}T!==Yn&&(C=new o_(T,t.width,t.height,o,s,r));let We=new jh(O,G);this.xr=We,this.getContext=function(){return G},this.getContextAttributes=function(){return G.getContextAttributes()},this.forceContextLoss=function(){let w=ht.get("WEBGL_lose_context");w&&w.loseContext()},this.forceContextRestore=function(){let w=ht.get("WEBGL_lose_context");w&&w.restoreContext()},this.getPixelRatio=function(){return ge},this.setPixelRatio=function(w){w!==void 0&&(ge=w,this.setSize(gt,he,!1))},this.getSize=function(w){return w.set(gt,he)},this.setSize=function(w,B,ie=!0){if(We.isPresenting){Qe("WebGLRenderer: Can't change size while VR device is presenting.");return}gt=w,he=B,t.width=Math.floor(w*ge),t.height=Math.floor(B*ge),ie===!0&&(t.style.width=w+"px",t.style.height=B+"px"),C!==null&&C.setSize(t.width,t.height),this.setViewport(0,0,w,B)},this.getDrawingBufferSize=function(w){return w.set(gt*ge,he*ge).floor()},this.setDrawingBufferSize=function(w,B,ie){gt=w,he=B,ge=ie,t.width=Math.floor(w*ie),t.height=Math.floor(B*ie),this.setViewport(0,0,w,B)},this.setEffects=function(w){if(T===Yn){nt("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(w){for(let B=0;B<w.length;B++)if(w[B].isOutputPass===!0){Qe("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}C.setEffects(w||[])},this.getCurrentViewport=function(w){return w.copy(xe)},this.getViewport=function(w){return w.copy(Se)},this.setViewport=function(w,B,ie,K){w.isVector4?Se.set(w.x,w.y,w.z,w.w):Se.set(w,B,ie,K),M.viewport(xe.copy(Se).multiplyScalar(ge).round())},this.getScissor=function(w){return w.copy(et)},this.setScissor=function(w,B,ie,K){w.isVector4?et.set(w.x,w.y,w.z,w.w):et.set(w,B,ie,K),M.scissor(qe.copy(et).multiplyScalar(ge).round())},this.getScissorTest=function(){return nn},this.setScissorTest=function(w){M.setScissorTest(nn=w)},this.setOpaqueSort=function(w){Be=w},this.setTransparentSort=function(w){tt=w},this.getClearColor=function(w){return w.copy(rt.getClearColor())},this.setClearColor=function(){rt.setClearColor(...arguments)},this.getClearAlpha=function(){return rt.getClearAlpha()},this.setClearAlpha=function(){rt.setClearAlpha(...arguments)},this.clear=function(w=!0,B=!0,ie=!0){let K=0;if(w){let j=!1;if(ye!==null){let Ie=ye.texture.format;j=v.has(Ie)}if(j){let Ie=ye.texture.type,Fe=_.has(Ie),Pe=rt.getClearColor(),ze=rt.getClearAlpha(),Xe=Pe.r,ce=Pe.g,ut=Pe.b;Fe?(R[0]=Xe,R[1]=ce,R[2]=ut,R[3]=ze,G.clearBufferuiv(G.COLOR,0,R)):(D[0]=Xe,D[1]=ce,D[2]=ut,D[3]=ze,G.clearBufferiv(G.COLOR,0,D))}else K|=G.COLOR_BUFFER_BIT}B&&(K|=G.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),ie&&(K|=G.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),K!==0&&G.clear(K)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(w){w.setRenderer(this),Y=w},this.dispose=function(){t.removeEventListener("webglcontextlost",Ft,!1),t.removeEventListener("webglcontextrestored",Tt,!1),t.removeEventListener("webglcontextcreationerror",$n,!1),rt.dispose(),Re.dispose(),be.dispose(),ne.dispose(),Me.dispose(),me.dispose(),Le.dispose(),ve.dispose(),Ee.dispose(),We.dispose(),We.removeEventListener("sessionstart",Ne),We.removeEventListener("sessionend",Fr),Ri.stop()};function Ft(w){w.preventDefault(),sa("WebGLRenderer: Context Lost."),H=!0}function Tt(){sa("WebGLRenderer: Context Restored."),H=!1;let w=$.autoReset,B=Ke.enabled,ie=Ke.autoUpdate,K=Ke.needsUpdate,j=Ke.type;$e(),$.autoReset=w,Ke.enabled=B,Ke.autoUpdate=ie,Ke.needsUpdate=K,Ke.type=j}function $n(w){nt("WebGLRenderer: A WebGL context could not be created. Reason: ",w.statusMessage)}function ai(w){let B=w.target;B.removeEventListener("dispose",ai),Ts(B)}function Ts(w){Ur(w),ne.remove(w)}function Ur(w){let B=ne.get(w).programs;B!==void 0&&(B.forEach(function(ie){Ee.releaseProgram(ie)}),w.isShaderMaterial&&Ee.releaseShaderCache(w))}this.renderBufferDirect=function(w,B,ie,K,j,Ie){B===null&&(B=An);let Fe=j.isMesh&&j.matrixWorld.determinantAffine()<0,Pe=fc(w,B,ie,K,j);M.setMaterial(K,Fe);let ze=ie.index,Xe=1;if(K.wireframe===!0){if(ze=se.getWireframeAttribute(ie),ze===void 0)return;Xe=2}let ce=ie.drawRange,ut=ie.attributes.position,Ve=ce.start*Xe,At=(ce.start+ce.count)*Xe;Ie!==null&&(Ve=Math.max(Ve,Ie.start*Xe),At=Math.min(At,(Ie.start+Ie.count)*Xe)),ze!==null?(Ve=Math.max(Ve,0),At=Math.min(At,ze.count)):ut!=null&&(Ve=Math.max(Ve,0),At=Math.min(At,ut.count));let Kt=At-Ve;if(Kt<0||Kt===1/0)return;Le.setup(j,K,Pe,ie,ze);let bt,Rt=Ce;if(ze!==null&&(bt=Ae.get(ze),Rt=pe,Rt.setIndex(bt)),j.isMesh)K.wireframe===!0?(M.setLineWidth(K.wireframeLinewidth*Jt()),Rt.setMode(G.LINES)):Rt.setMode(G.TRIANGLES);else if(j.isLine){let fn=K.linewidth;fn===void 0&&(fn=1),M.setLineWidth(fn*Jt()),j.isLineSegments?Rt.setMode(G.LINES):j.isLineLoop?Rt.setMode(G.LINE_LOOP):Rt.setMode(G.LINE_STRIP)}else j.isPoints?Rt.setMode(G.POINTS):j.isSprite&&Rt.setMode(G.TRIANGLES);if(j.isBatchedMesh)if(ht.get("WEBGL_multi_draw"))Rt.renderMultiDraw(j._multiDrawStarts,j._multiDrawCounts,j._multiDrawCount);else{let fn=j._multiDrawStarts,Ue=j._multiDrawCounts,vn=j._multiDrawCount,vt=ze?Ae.get(ze).bytesPerElement:1,En=ne.get(K).currentProgram.getUniforms();for(let kn=0;kn<vn;kn++)En.setValue(G,"_gl_DrawID",kn),Rt.render(fn[kn]/vt,Ue[kn])}else if(j.isInstancedMesh)Rt.renderInstances(Ve,Kt,j.count);else if(ie.isInstancedBufferGeometry){let fn=ie._maxInstanceCount!==void 0?ie._maxInstanceCount:1/0,Ue=Math.min(ie.instanceCount,fn);Rt.renderInstances(Ve,Kt,Ue)}else Rt.render(Ve,Kt)};function As(w,B,ie,K){Y!==null&&w.isNodeMaterial&&Y.setObject(K,w),Oe===!0&&He.setState(w,ie,!1),w.transparent===!0&&w.side===qn&&w.forceSinglePass===!1?(w.side=Sn,w.needsUpdate=!0,Ki(w,B,K),w.side=vs,w.needsUpdate=!0,Ki(w,B,K),w.side=qn):Ki(w,B,K)}this.compile=function(w,B,ie=null){ie===null&&(ie=w),Y!==null&&Y.renderStart(w,B,ie),P=be.get(ie),P.init(B),b.push(P),ie.traverseVisible(function(j){j.isLight&&j.layers.test(B.layers)&&(P.pushLight(j),j.castShadow&&P.pushShadow(j))}),w!==ie&&w.traverseVisible(function(j){j.isLight&&j.layers.test(B.layers)&&(P.pushLight(j),j.castShadow&&P.pushShadow(j))}),P.setupLights(),Y!==null&&Y.updateLights(P.state.lightsArray),Ct=this.localClippingEnabled,Oe=He.init(this.clippingPlanes,Ct),Oe===!0&&He.setGlobalState(this.clippingPlanes,B),Y!==null&&Ke.render(P.state.shadowsArray,ie,B);let K=new Set;return w.traverse(function(j){if(!(j.isMesh||j.isPoints||j.isLine||j.isSprite))return;let Ie=j.material;if(Ie)if(Array.isArray(Ie))for(let Fe=0;Fe<Ie.length;Fe++){let Pe=Ie[Fe];As(Pe,ie,B,j),K.add(Pe)}else As(Ie,ie,B,j),K.add(Ie)}),P=b.pop(),Y!==null&&Y.renderEnd(),K},this.compileAsync=function(w,B,ie=null){let K=this.compile(w,B,ie);return new Promise(j=>{function Ie(){if(K.forEach(function(Fe){let ze=ne.get(Fe).currentProgram;(ze===void 0||ze.isReady())&&K.delete(Fe)}),K.size===0){j(w);return}setTimeout(Ie,10)}ht.get("KHR_parallel_shader_compile")!==null?Ie():setTimeout(Ie,10)})};let Hs=null;function dc(w){Hs&&Hs(w)}function Ne(){Ri.stop()}function Fr(){Ri.start()}let Ri=new uf;Ri.setAnimationLoop(dc),typeof self<"u"&&Ri.setContext(self),this.setAnimationLoop=function(w){Hs=w,We.setAnimationLoop(w),w===null?Ri.stop():Ri.start()},We.addEventListener("sessionstart",Ne),We.addEventListener("sessionend",Fr),this.render=function(w,B){if(B!==void 0&&B.isCamera!==!0){nt("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(H===!0)return;Y!==null&&Y.renderStart(w,B);let ie=We.enabled===!0&&We.isPresenting===!0,K=C!==null&&(ye===null||ie)&&C.begin(O,ye);if(w.matrixWorldAutoUpdate===!0&&w.updateMatrixWorld(),B.parent===null&&B.matrixWorldAutoUpdate===!0&&B.updateMatrixWorld(),We.enabled===!0&&We.isPresenting===!0&&(C===null||C.isCompositing()===!1)&&(We.cameraAutoUpdate===!0&&We.updateCamera(B),B=We.getCamera()),w.isScene===!0&&w.onBeforeRender(O,w,B,ye),P=be.get(w,b.length),P.init(B),P.state.textureUnits=le.getTextureUnits(),b.push(P),dt.multiplyMatrices(B.projectionMatrix,B.matrixWorldInverse),ot.setFromProjectionMatrix(dt,yi,B.reversedDepth),Ct=this.localClippingEnabled,Oe=He.init(this.clippingPlanes,Ct),I=Re.get(w,U.length),I.init(),U.push(I),We.enabled===!0&&We.isPresenting===!0){let Fe=O.xr.getDepthSensingMesh();Fe!==null&&Or(Fe,B,-1/0,O.sortObjects)}Or(w,B,0,O.sortObjects),I.finish(),Y!==null&&Y.updateLights(P.state.lightsArray),O.sortObjects===!0&&I.sort(Be,tt),Gt=We.enabled===!1||We.isPresenting===!1||We.hasDepthSensing()===!1,Gt&&rt.addToRenderList(I,w),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),Oe===!0&&He.beginShadows();let j=P.state.shadowsArray;if(Ke.render(j,w,B),Oe===!0&&He.endShadows(),(K&&C.hasRenderPass())===!1){let Fe=I.opaque,Pe=I.transmissive;if(P.setupLights(),B.isArrayCamera){let ze=B.cameras;if(Pe.length>0)for(let Xe=0,ce=ze.length;Xe<ce;Xe++){let ut=ze[Xe];za(Fe,Pe,w,ut)}Gt&&rt.render(w);for(let Xe=0,ce=ze.length;Xe<ce;Xe++){let ut=ze[Xe];ka(I,w,ut,ut.viewport)}}else Pe.length>0&&za(Fe,Pe,w,B),Gt&&rt.render(w),ka(I,w,B)}ye!==null&&ue===0&&(le.updateMultisampleRenderTarget(ye),le.updateRenderTargetMipmap(ye)),K&&C.end(O),w.isScene===!0&&w.onAfterRender(O,w,B),Le.resetDefaultState(),oe=-1,q=null,b.pop(),b.length>0?(P=b[b.length-1],le.setTextureUnits(P.state.textureUnits),Oe===!0&&He.setGlobalState(O.clippingPlanes,P.state.camera)):P=null,U.pop(),U.length>0?I=U[U.length-1]:I=null,Y!==null&&Y.renderEnd()};function Or(w,B,ie,K){if(w.visible===!1)return;if(w.layers.test(B.layers)){if(w.isGroup)ie=w.renderOrder;else if(w.isLOD)w.autoUpdate===!0&&w.update(B);else if(w.isLightProbeGrid)P.pushLightProbeGrid(w);else if(w.isLight)P.pushLight(w),w.castShadow&&P.pushShadow(w);else if(w.isSprite){if(!w.frustumCulled||w.intersectsFrustum(ot)){K&&$t.setFromMatrixPosition(w.matrixWorld).applyMatrix4(dt);let Fe=me.update(w),Pe=w.material;Pe.visible&&I.push(w,Fe,Pe,ie,$t.z,null,B)}}else if((w.isMesh||w.isLine||w.isPoints)&&(!w.frustumCulled||w.intersectsFrustum(ot))){let Fe=me.update(w),Pe=w.material;if(K&&(w.boundingSphere!==void 0?(w.boundingSphere===null&&w.computeBoundingSphere(),$t.copy(w.boundingSphere.center)):(Fe.boundingSphere===null&&Fe.computeBoundingSphere(),$t.copy(Fe.boundingSphere.center)),$t.applyMatrix4(w.matrixWorld).applyMatrix4(dt)),Array.isArray(Pe)){let ze=Fe.groups;for(let Xe=0,ce=ze.length;Xe<ce;Xe++){let ut=ze[Xe],Ve=Pe[ut.materialIndex];Ve&&Ve.visible&&I.push(w,Fe,Ve,ie,$t.z,ut,B)}}else Pe.visible&&I.push(w,Fe,Pe,ie,$t.z,null,B)}}let Ie=w.children;for(let Fe=0,Pe=Ie.length;Fe<Pe;Fe++)Or(Ie[Fe],B,ie,K)}function ka(w,B,ie,K){let{opaque:j,transmissive:Ie,transparent:Fe}=w;P.setupLightsView(ie),Oe===!0&&He.setGlobalState(O.clippingPlanes,ie),K&&M.viewport(xe.copy(K)),j.length>0&&_e(j,B,ie),Ie.length>0&&_e(Ie,B,ie),Fe.length>0&&_e(Fe,B,ie),M.buffers.depth.setTest(!0),M.buffers.depth.setMask(!0),M.buffers.color.setMask(!0),M.setPolygonOffset(!1)}function za(w,B,ie,K){if((ie.isScene===!0?ie.overrideMaterial:null)!==null)return;if(P.state.transmissionRenderTarget[K.id]===void 0){let Ve=ht.has("EXT_color_buffer_half_float")||ht.has("EXT_color_buffer_float");P.state.transmissionRenderTarget[K.id]=new Xn(1,1,{generateMipmaps:!0,type:Ve?Ei:Yn,minFilter:Ss,samples:Math.max(4,L.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:St.workingColorSpace})}let Ie=P.state.transmissionRenderTarget[K.id],Fe=K.viewport||xe;Ie.setSize(Fe.z*O.transmissionResolutionScale,Fe.w*O.transmissionResolutionScale);let Pe=O.getRenderTarget(),ze=O.getActiveCubeFace(),Xe=O.getActiveMipmapLevel();O.setRenderTarget(Ie),O.getClearColor(Ut),xt=O.getClearAlpha(),xt<1&&O.setClearColor(16777215,.5),O.clear(),Gt&&rt.render(ie);let ce=O.toneMapping;O.toneMapping=wi;let ut=K.viewport;if(K.viewport!==void 0&&(K.viewport=void 0),P.setupLightsView(K),Oe===!0&&He.setGlobalState(O.clippingPlanes,K),_e(w,ie,K),le.updateMultisampleRenderTarget(Ie),le.updateRenderTargetMipmap(Ie),ht.has("WEBGL_multisampled_render_to_texture")===!1){let Ve=!1;for(let At=0,Kt=B.length;At<Kt;At++){let bt=B[At],{object:Rt,geometry:fn,material:Ue,group:vn}=bt;if(Ue.side===qn&&Rt.layers.test(K.layers)){let vt=Ue.side;Ue.side=Sn,Ue.needsUpdate=!0,Br(Rt,ie,K,fn,Ue,vn),Ue.side=vt,Ue.needsUpdate=!0,Ve=!0}}Ve===!0&&(le.updateMultisampleRenderTarget(Ie),le.updateRenderTargetMipmap(Ie))}O.setRenderTarget(Pe,ze,Xe),O.setClearColor(Ut,xt),ut!==void 0&&(K.viewport=ut),O.toneMapping=ce}function _e(w,B,ie){let K=B.isScene===!0?B.overrideMaterial:null;for(let j=0,Ie=w.length;j<Ie;j++){let Fe=w[j],{object:Pe,geometry:ze,group:Xe}=Fe,ce=Fe.material;ce.allowOverride===!0&&K!==null&&(ce=K),Pe.layers.test(ie.layers)&&Br(Pe,B,ie,ze,ce,Xe)}}function Br(w,B,ie,K,j,Ie){Y!==null&&j.isNodeMaterial&&Y.setObject(w,j),w.onBeforeRender(O,B,ie,K,j,Ie),w.modelViewMatrix.multiplyMatrices(ie.matrixWorldInverse,w.matrixWorld),w.normalMatrix.getNormalMatrix(w.modelViewMatrix),j.onBeforeRender(O,B,ie,K,w,Ie),j.transparent===!0&&j.side===qn&&j.forceSinglePass===!1?(j.side=Sn,j.needsUpdate=!0,O.renderBufferDirect(ie,B,K,j,w,Ie),j.side=vs,j.needsUpdate=!0,O.renderBufferDirect(ie,B,K,j,w,Ie),j.side=qn):O.renderBufferDirect(ie,B,K,j,w,Ie),w.onAfterRender(O,B,ie,K,j,Ie)}function Ki(w,B,ie){B.isScene!==!0&&(B=An);let K=ne.get(w),j=P.state.lights,Ie=P.state.shadowsArray,Fe=j.state.version,Pe=Ee.getParameters(w,j.state,Ie,B,ie,P.state.lightProbeGridArray),ze=Ee.getProgramCacheKey(Pe),Xe=K.programs;K.environment=w.isMeshStandardMaterial||w.isMeshLambertMaterial||w.isMeshPhongMaterial?B.environment:null,K.fog=B.fog;let ce=w.isMeshStandardMaterial||w.isMeshLambertMaterial&&!w.envMap||w.isMeshPhongMaterial&&!w.envMap;K.envMap=Me.get(w.envMap||K.environment,ce),K.envMapRotation=K.environment!==null&&w.envMap===null?B.environmentRotation:w.envMapRotation,Xe===void 0&&(w.addEventListener("dispose",ai),Xe=new Map,K.programs=Xe);let ut=Xe.get(ze);if(ut!==void 0){if(K.currentProgram===ut&&K.lightsStateVersion===Fe)return Jn(w,Pe),ut}else Pe.uniforms=Ee.getUniforms(w),Y!==null&&w.isNodeMaterial&&Y.build(w,ie,Pe),w.onBeforeCompile(Pe,O),ut=Ee.acquireProgram(Pe,ze),Xe.set(ze,ut),K.uniforms=Pe.uniforms;let Ve=K.uniforms;return(!w.isShaderMaterial&&!w.isRawShaderMaterial||w.clipping===!0)&&(Ve.clippingPlanes=He.uniform),Jn(w,Pe),K.needsLights=Ha(w),K.lightsStateVersion=Fe,K.needsLights&&(Ve.ambientLightColor.value=j.state.ambient,Ve.lightProbe.value=j.state.probe,Ve.sunLights.value=j.state.sun,Ve.sunLightShadows.value=j.state.sunShadow,Ve.directionalLights.value=j.state.directional,Ve.directionalLightShadows.value=j.state.directionalShadow,Ve.spotLights.value=j.state.spot,Ve.spotLightShadows.value=j.state.spotShadow,Ve.rectAreaLights.value=j.state.rectArea,Ve.ltc_1.value=j.state.rectAreaLTC1,Ve.ltc_2.value=j.state.rectAreaLTC2,Ve.pointLights.value=j.state.point,Ve.pointLightShadows.value=j.state.pointShadow,Ve.hemisphereLights.value=j.state.hemi,Ve.sunShadowMatrix.value=j.state.sunShadowMatrix,Ve.sunShadowCascade.value=j.state.sunShadowCascade,Ve.directionalShadowMatrix.value=j.state.directionalShadowMatrix,Ve.spotLightMatrix.value=j.state.spotLightMatrix,Ve.spotLightMap.value=j.state.spotLightMap,Ve.pointShadowMatrix.value=j.state.pointShadowMatrix),K.lightProbeGrid=P.state.lightProbeGridArray.length>0,K.currentProgram=ut,K.uniformsList=null,ut}function Va(w){if(w.uniformsList===null){let B=w.currentProgram.getUniforms();w.uniformsList=Dr.seqWithValue(B.seq,w.uniforms)}return w.uniformsList}function Jn(w,B){let ie=ne.get(w);ie.outputColorSpace=B.outputColorSpace,ie.batching=B.batching,ie.batchingColor=B.batchingColor,ie.instancing=B.instancing,ie.instancingColor=B.instancingColor,ie.instancingMorph=B.instancingMorph,ie.skinning=B.skinning,ie.morphTargets=B.morphTargets,ie.morphNormals=B.morphNormals,ie.morphColors=B.morphColors,ie.morphTargetsCount=B.morphTargetsCount,ie.numClippingPlanes=B.numClippingPlanes,ie.numIntersection=B.numClipIntersection,ie.vertexAlphas=B.vertexAlphas,ie.vertexTangents=B.vertexTangents,ie.toneMapping=B.toneMapping}function Ga(w,B){if(w.length===0)return null;if(w.length===1)return w[0].texture!==null?w[0]:null;E.setFromMatrixPosition(B.matrixWorld);for(let ie=0,K=w.length;ie<K;ie++){let j=w[ie];if(j.texture!==null&&j.boundingBox.containsPoint(E))return j}return null}function fc(w,B,ie,K,j){B.isScene!==!0&&(B=An),le.resetTextureUnits();let Ie=B.fog,Fe=K.isMeshStandardMaterial||K.isMeshLambertMaterial||K.isMeshPhongMaterial?B.environment:null,Pe=ye===null?O.outputColorSpace:ye.isXRRenderTarget===!0?ye.texture.colorSpace:St.workingColorSpace,ze=K.isMeshStandardMaterial||K.isMeshLambertMaterial&&!K.envMap||K.isMeshPhongMaterial&&!K.envMap,Xe=Me.get(K.envMap||Fe,ze),ce=K.vertexColors===!0&&!!ie.attributes.color&&ie.attributes.color.itemSize===4,ut=!!ie.attributes.tangent&&(!!K.normalMap||K.anisotropy>0),Ve=!!ie.morphAttributes.position,At=!!ie.morphAttributes.normal,Kt=!!ie.morphAttributes.color,bt=wi;K.toneMapped&&(ye===null||ye.isXRRenderTarget===!0)&&(bt=O.toneMapping);let Rt=ie.morphAttributes.position||ie.morphAttributes.normal||ie.morphAttributes.color,fn=Rt!==void 0?Rt.length:0,Ue=ne.get(K),vn=P.state.lights;if(Oe===!0&&(Ct===!0||w!==q)){let Dt=w===q&&K.id===oe;He.setState(K,w,Dt)}let vt=!1;K.version===Ue.__version?(Ue.needsLights&&Ue.lightsStateVersion!==vn.state.version||Ue.outputColorSpace!==Pe||j.isBatchedMesh&&Ue.batching===!1||!j.isBatchedMesh&&Ue.batching===!0||j.isBatchedMesh&&Ue.batchingColor===!0&&j._colorsTexture===null||j.isBatchedMesh&&Ue.batchingColor===!1&&j._colorsTexture!==null||j.isInstancedMesh&&Ue.instancing===!1||!j.isInstancedMesh&&Ue.instancing===!0||j.isSkinnedMesh&&Ue.skinning===!1||!j.isSkinnedMesh&&Ue.skinning===!0||j.isInstancedMesh&&Ue.instancingColor===!0&&j.instanceColor===null||j.isInstancedMesh&&Ue.instancingColor===!1&&j.instanceColor!==null||j.isInstancedMesh&&Ue.instancingMorph===!0&&j.morphTexture===null||j.isInstancedMesh&&Ue.instancingMorph===!1&&j.morphTexture!==null||Ue.envMap!==Xe||K.fog===!0&&Ue.fog!==Ie||Ue.numClippingPlanes!==void 0&&(Ue.numClippingPlanes!==He.numPlanes||Ue.numIntersection!==He.numIntersection)||Ue.vertexAlphas!==ce||Ue.vertexTangents!==ut||Ue.morphTargets!==Ve||Ue.morphNormals!==At||Ue.morphColors!==Kt||Ue.toneMapping!==bt||Ue.morphTargetsCount!==fn||!!Ue.lightProbeGrid!=P.state.lightProbeGridArray.length>0)&&(vt=!0):(vt=!0,Ue.__version=K.version);let En=Ue.currentProgram;vt===!0&&(En=Ki(K,B,j),Y&&K.isNodeMaterial&&Y.onUpdateProgram(K,En,Ue));let kn=!1,Kn=!1,Pi=!1,re=En.getUniforms(),Et=Ue.uniforms;if(M.useProgram(En.program)&&(kn=!0,Kn=!0,Pi=!0),K.id!==oe&&(oe=K.id,Kn=!0),Ue.needsLights){let Dt=Ga(P.state.lightProbeGridArray,j);Ue.lightProbeGrid!==Dt&&(Ue.lightProbeGrid=Dt,Kn=!0)}if(kn||q!==w){M.buffers.depth.getReversed()&&w.reversedDepth!==!0&&(w._reversedDepth=!0,w.updateProjectionMatrix()),re.setValue(G,"projectionMatrix",w.projectionMatrix),re.setValue(G,"viewMatrix",w.matrixWorldInverse);let pi=re.map.cameraPosition;pi!==void 0&&pi.setValue(G,pt.setFromMatrixPosition(w.matrixWorld)),L.logarithmicDepthBuffer&&re.setValue(G,"logDepthBufFC",2/(Math.log(w.far+1)/Math.LN2)),(K.isMeshPhongMaterial||K.isMeshToonMaterial||K.isMeshLambertMaterial||K.isMeshBasicMaterial||K.isMeshStandardMaterial||K.isShaderMaterial)&&re.setValue(G,"isOrthographic",w.isOrthographicCamera===!0),q!==w&&(q=w,Kn=!0,Pi=!0)}if(Ue.needsLights&&(vn.state.sunShadowMap.length>0&&re.setValue(G,"sunShadowMap",vn.state.sunShadowMap,le),vn.state.directionalShadowMap.length>0&&re.setValue(G,"directionalShadowMap",vn.state.directionalShadowMap,le),vn.state.spotShadowMap.length>0&&re.setValue(G,"spotShadowMap",vn.state.spotShadowMap,le),vn.state.pointShadowMap.length>0&&re.setValue(G,"pointShadowMap",vn.state.pointShadowMap,le)),j.isSkinnedMesh){re.setOptional(G,j,"bindMatrix"),re.setOptional(G,j,"bindMatrixInverse");let Dt=j.skeleton;Dt&&(Dt.boneTexture===null&&Dt.computeBoneTexture(),re.setValue(G,"boneTexture",Dt.boneTexture,le))}j.isBatchedMesh&&(re.setOptional(G,j,"batchingTexture"),re.setValue(G,"batchingTexture",j._matricesTexture,le),re.setOptional(G,j,"batchingIdTexture"),re.setValue(G,"batchingIdTexture",j._indirectTexture,le),re.setOptional(G,j,"batchingColorTexture"),j._colorsTexture!==null&&re.setValue(G,"batchingColorTexture",j._colorsTexture,le));let oi=ie.morphAttributes;if((oi.position!==void 0||oi.normal!==void 0||oi.color!==void 0)&&z.update(j,ie,En),(Kn||Ue.receiveShadow!==j.receiveShadow)&&(Ue.receiveShadow=j.receiveShadow,re.setValue(G,"receiveShadow",j.receiveShadow)),(K.isMeshStandardMaterial||K.isMeshLambertMaterial||K.isMeshPhongMaterial)&&K.envMap===null&&B.environment!==null&&(Et.envMapIntensity.value=B.environmentIntensity),Et.dfgLUT!==void 0&&(Et.dfgLUT.value=Yx()),Kn){if(re.setValue(G,"toneMappingExposure",O.toneMappingExposure),Ue.needsLights&&pc(Et,Pi),Ie&&K.fog===!0&&Ye.refreshFogUniforms(Et,Ie),Ye.refreshMaterialUniforms(Et,K,ge,he,P.state.transmissionRenderTarget[w.id]),Ue.needsLights&&Ue.lightProbeGrid){let Dt=Ue.lightProbeGrid;Et.probesSH.value=Dt.texture,Et.probesMin.value.copy(Dt.boundingBox.min),Et.probesMax.value.copy(Dt.boundingBox.max),Et.probesResolution.value.copy(Dt.resolution)}Dr.upload(G,Va(Ue),Et,le)}if(K.isShaderMaterial&&K.uniformsNeedUpdate===!0&&(Dr.upload(G,Va(Ue),Et,le),K.uniformsNeedUpdate=!1),K.isSpriteMaterial&&re.setValue(G,"center",j.center),re.setValue(G,"modelViewMatrix",j.modelViewMatrix),re.setValue(G,"normalMatrix",j.normalMatrix),re.setValue(G,"modelMatrix",j.matrixWorld),K.uniformsGroups!==void 0){let Dt=K.uniformsGroups;for(let pi=0,Un=Dt.length;pi<Un;pi++){let kr=Dt[pi];ve.update(kr,En),ve.bind(kr,En)}}return En}function pc(w,B){w.ambientLightColor.needsUpdate=B,w.lightProbe.needsUpdate=B,w.sunLights.needsUpdate=B,w.sunLightShadows.needsUpdate=B,w.directionalLights.needsUpdate=B,w.directionalLightShadows.needsUpdate=B,w.pointLights.needsUpdate=B,w.pointLightShadows.needsUpdate=B,w.spotLights.needsUpdate=B,w.spotLightShadows.needsUpdate=B,w.rectAreaLights.needsUpdate=B,w.hemisphereLights.needsUpdate=B}function Ha(w){return w.isMeshLambertMaterial||w.isMeshToonMaterial||w.isMeshPhongMaterial||w.isMeshStandardMaterial||w.isShadowMaterial||w.isShaderMaterial&&w.lights===!0}this.getActiveCubeFace=function(){return fe},this.getActiveMipmapLevel=function(){return ue},this.getRenderTarget=function(){return ye},this.setRenderTargetTextures=function(w,B,ie){let K=ne.get(w);K.__autoAllocateDepthBuffer=w.resolveDepthBuffer===!1,K.__autoAllocateDepthBuffer===!1&&(K.__useRenderToTexture=!1),ne.get(w.texture).__webglTexture=B,ne.get(w.depthTexture).__webglTexture=K.__autoAllocateDepthBuffer?void 0:ie,K.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(w,B){let ie=ne.get(w);ie.__webglFramebuffer=B,ie.__useDefaultFramebuffer=B===void 0},this.setRenderTarget=function(w,B=0,ie=0){ye=w,fe=B,ue=ie;let K=null,j=!1,Ie=!1;if(w){let Pe=ne.get(w);if(Pe.__useDefaultFramebuffer!==void 0){M.bindFramebuffer(G.FRAMEBUFFER,Pe.__webglFramebuffer),xe.copy(w.viewport),qe.copy(w.scissor),Ze=w.scissorTest,M.viewport(xe),M.scissor(qe),M.setScissorTest(Ze),oe=-1;return}else if(Pe.__webglFramebuffer===void 0)le.setupRenderTarget(w);else if(Pe.__hasExternalTextures)le.rebindTextures(w,ne.get(w.texture).__webglTexture,ne.get(w.depthTexture).__webglTexture);else if(w.depthBuffer){let ce=w.depthTexture;if(Pe.__boundDepthTexture!==ce){if(ce!==null&&ne.has(ce)&&(w.width!==ce.image.width||w.height!==ce.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");le.setupDepthRenderbuffer(w)}}let ze=w.texture;(ze.isData3DTexture||ze.isDataArrayTexture||ze.isCompressedArrayTexture)&&(Ie=!0);let Xe=ne.get(w).__webglFramebuffer;w.isWebGLCubeRenderTarget?(Array.isArray(Xe[B])?K=Xe[B][ie]:K=Xe[B],j=!0):w.samples>0&&le.useMultisampledRTT(w)===!1?K=ne.get(w).__webglMultisampledFramebuffer:Array.isArray(Xe)?K=Xe[ie]:K=Xe,xe.copy(w.viewport),qe.copy(w.scissor),Ze=w.scissorTest}else xe.copy(Se).multiplyScalar(ge).floor(),qe.copy(et).multiplyScalar(ge).floor(),Ze=nn;if(ie!==0&&(K=Q),M.bindFramebuffer(G.FRAMEBUFFER,K)&&M.drawBuffers(w,K),M.viewport(xe),M.scissor(qe),M.setScissorTest(Ze),j){let Pe=ne.get(w.texture);G.framebufferTexture2D(G.FRAMEBUFFER,G.COLOR_ATTACHMENT0,G.TEXTURE_CUBE_MAP_POSITIVE_X+B,Pe.__webglTexture,ie)}else if(Ie){let Pe=B;for(let ze=0;ze<w.textures.length;ze++){let Xe=ne.get(w.textures[ze]);G.framebufferTextureLayer(G.FRAMEBUFFER,G.COLOR_ATTACHMENT0+ze,Xe.__webglTexture,ie,Pe)}}else if(w!==null&&ie!==0){let Pe=ne.get(w.texture);G.framebufferTexture2D(G.FRAMEBUFFER,G.COLOR_ATTACHMENT0,G.TEXTURE_2D,Pe.__webglTexture,ie)}oe=-1};function Es(w){let B=ne.get(w);return(B.__readFormat!==w.format||B.__readType!==w.type)&&(B.__readFormat=w.format,B.__readType=w.type,B.__formatReadable=L.textureFormatReadable(w.format),B.__typeReadable=L.textureTypeReadable(w.type)),B}this.readRenderTargetPixels=function(w,B,ie,K,j,Ie,Fe,Pe=0){if(!(w&&w.isWebGLRenderTarget)){nt("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let ze=ne.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&Fe!==void 0&&(ze=ze[Fe]),ze){M.bindFramebuffer(G.FRAMEBUFFER,ze);try{let Xe=w.textures[Pe],ce=Xe.format,ut=Xe.type;w.textures.length>1&&G.readBuffer(G.COLOR_ATTACHMENT0+Pe);let Ve=Es(Xe);if(Ve.__formatReadable===!1){nt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Ve.__typeReadable===!1){nt("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}B>=0&&B<=w.width-K&&ie>=0&&ie<=w.height-j&&G.readPixels(B,ie,K,j,we.convert(ce),we.convert(ut),Ie)}finally{let Xe=ye!==null?ne.get(ye).__webglFramebuffer:null;M.bindFramebuffer(G.FRAMEBUFFER,Xe)}}},this.readRenderTargetPixelsAsync=async function(w,B,ie,K,j,Ie,Fe,Pe=0){if(!(w&&w.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let ze=ne.get(w).__webglFramebuffer;if(w.isWebGLCubeRenderTarget&&Fe!==void 0&&(ze=ze[Fe]),ze)if(B>=0&&B<=w.width-K&&ie>=0&&ie<=w.height-j){M.bindFramebuffer(G.FRAMEBUFFER,ze);let Xe=w.textures[Pe],ce=Xe.format,ut=Xe.type;w.textures.length>1&&G.readBuffer(G.COLOR_ATTACHMENT0+Pe);let Ve=Es(Xe);if(Ve.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Ve.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let At=G.createBuffer();G.bindBuffer(G.PIXEL_PACK_BUFFER,At),G.bufferData(G.PIXEL_PACK_BUFFER,Ie.byteLength,G.STREAM_READ),G.readPixels(B,ie,K,j,we.convert(ce),we.convert(ut),0),G.bindBuffer(G.PIXEL_PACK_BUFFER,null);let Kt=ye!==null?ne.get(ye).__webglFramebuffer:null;M.bindFramebuffer(G.FRAMEBUFFER,Kt);let bt=G.fenceSync(G.SYNC_GPU_COMMANDS_COMPLETE,0);return G.flush(),await Fd(G,bt,4),G.bindBuffer(G.PIXEL_PACK_BUFFER,At),G.getBufferSubData(G.PIXEL_PACK_BUFFER,0,Ie),G.bindBuffer(G.PIXEL_PACK_BUFFER,null),G.deleteBuffer(At),G.deleteSync(bt),Ie}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(w,B=null,ie=0){let K=Math.pow(2,-ie),j=Math.floor(w.image.width*K),Ie=Math.floor(w.image.height*K),Fe=B!==null?B.x:0,Pe=B!==null?B.y:0;le.setTexture2D(w,0),G.copyTexSubImage2D(G.TEXTURE_2D,ie,0,0,Fe,Pe,j,Ie),M.unbindTexture()},this.copyTextureToTexture=function(w,B,ie=null,K=null,j=0,Ie=0){let Fe,Pe,ze,Xe,ce,ut,Ve,At,Kt,bt=w.isCompressedTexture?w.mipmaps[Ie]:w.image;if(ie!==null)Fe=ie.max.x-ie.min.x,Pe=ie.max.y-ie.min.y,ze=ie.isBox3?ie.max.z-ie.min.z:1,Xe=ie.min.x,ce=ie.min.y,ut=ie.isBox3?ie.min.z:0;else{let Et=Math.pow(2,-j);Fe=Math.floor(bt.width*Et),Pe=Math.floor(bt.height*Et),w.isDataArrayTexture?ze=bt.depth:w.isData3DTexture?ze=Math.floor(bt.depth*Et):ze=1,Xe=0,ce=0,ut=0}K!==null?(Ve=K.x,At=K.y,Kt=K.z):(Ve=0,At=0,Kt=0);let Rt=we.convert(B.format),fn=we.convert(B.type),Ue;B.isData3DTexture?(le.setTexture3D(B,0),Ue=G.TEXTURE_3D):B.isDataArrayTexture||B.isCompressedArrayTexture?(le.setTexture2DArray(B,0),Ue=G.TEXTURE_2D_ARRAY):(le.setTexture2D(B,0),Ue=G.TEXTURE_2D),M.activeTexture(G.TEXTURE0),M.pixelStorei(G.UNPACK_FLIP_Y_WEBGL,B.flipY),M.pixelStorei(G.UNPACK_PREMULTIPLY_ALPHA_WEBGL,B.premultiplyAlpha),M.pixelStorei(G.UNPACK_ALIGNMENT,B.unpackAlignment);let vn=M.getParameter(G.UNPACK_ROW_LENGTH),vt=M.getParameter(G.UNPACK_IMAGE_HEIGHT),En=M.getParameter(G.UNPACK_SKIP_PIXELS),kn=M.getParameter(G.UNPACK_SKIP_ROWS),Kn=M.getParameter(G.UNPACK_SKIP_IMAGES);M.pixelStorei(G.UNPACK_ROW_LENGTH,bt.width),M.pixelStorei(G.UNPACK_IMAGE_HEIGHT,bt.height),M.pixelStorei(G.UNPACK_SKIP_PIXELS,Xe),M.pixelStorei(G.UNPACK_SKIP_ROWS,ce),M.pixelStorei(G.UNPACK_SKIP_IMAGES,ut);let Pi=w.isDataArrayTexture||w.isData3DTexture,re=B.isDataArrayTexture||B.isData3DTexture;if(w.isDepthTexture){let Et=ne.get(w),oi=ne.get(B),Dt=ne.get(Et.__renderTarget),pi=ne.get(oi.__renderTarget);M.bindFramebuffer(G.READ_FRAMEBUFFER,Dt.__webglFramebuffer),M.bindFramebuffer(G.DRAW_FRAMEBUFFER,pi.__webglFramebuffer);for(let Un=0;Un<ze;Un++)Pi&&(G.framebufferTextureLayer(G.READ_FRAMEBUFFER,G.COLOR_ATTACHMENT0,ne.get(w).__webglTexture,j,ut+Un),G.framebufferTextureLayer(G.DRAW_FRAMEBUFFER,G.COLOR_ATTACHMENT0,ne.get(B).__webglTexture,Ie,Kt+Un)),G.blitFramebuffer(Xe,ce,Fe,Pe,Ve,At,Fe,Pe,G.DEPTH_BUFFER_BIT,G.NEAREST);M.bindFramebuffer(G.READ_FRAMEBUFFER,null),M.bindFramebuffer(G.DRAW_FRAMEBUFFER,null)}else if(j!==0||w.isRenderTargetTexture||ne.has(w)){let Et=ne.get(w),oi=ne.get(B);M.bindFramebuffer(G.READ_FRAMEBUFFER,V),M.bindFramebuffer(G.DRAW_FRAMEBUFFER,te);for(let Dt=0;Dt<ze;Dt++)Pi?G.framebufferTextureLayer(G.READ_FRAMEBUFFER,G.COLOR_ATTACHMENT0,Et.__webglTexture,j,ut+Dt):G.framebufferTexture2D(G.READ_FRAMEBUFFER,G.COLOR_ATTACHMENT0,G.TEXTURE_2D,Et.__webglTexture,j),re?G.framebufferTextureLayer(G.DRAW_FRAMEBUFFER,G.COLOR_ATTACHMENT0,oi.__webglTexture,Ie,Kt+Dt):G.framebufferTexture2D(G.DRAW_FRAMEBUFFER,G.COLOR_ATTACHMENT0,G.TEXTURE_2D,oi.__webglTexture,Ie),j!==0?G.blitFramebuffer(Xe,ce,Fe,Pe,Ve,At,Fe,Pe,G.COLOR_BUFFER_BIT,G.NEAREST):re?G.copyTexSubImage3D(Ue,Ie,Ve,At,Kt+Dt,Xe,ce,Fe,Pe):G.copyTexSubImage2D(Ue,Ie,Ve,At,Xe,ce,Fe,Pe);M.bindFramebuffer(G.READ_FRAMEBUFFER,null),M.bindFramebuffer(G.DRAW_FRAMEBUFFER,null)}else re?w.isDataTexture||w.isData3DTexture?G.texSubImage3D(Ue,Ie,Ve,At,Kt,Fe,Pe,ze,Rt,fn,bt.data):B.isCompressedArrayTexture?G.compressedTexSubImage3D(Ue,Ie,Ve,At,Kt,Fe,Pe,ze,Rt,bt.data):G.texSubImage3D(Ue,Ie,Ve,At,Kt,Fe,Pe,ze,Rt,fn,bt):w.isDataTexture?G.texSubImage2D(G.TEXTURE_2D,Ie,Ve,At,Fe,Pe,Rt,fn,bt.data):w.isCompressedTexture?G.compressedTexSubImage2D(G.TEXTURE_2D,Ie,Ve,At,bt.width,bt.height,Rt,bt.data):G.texSubImage2D(G.TEXTURE_2D,Ie,Ve,At,Fe,Pe,Rt,fn,bt);M.pixelStorei(G.UNPACK_ROW_LENGTH,vn),M.pixelStorei(G.UNPACK_IMAGE_HEIGHT,vt),M.pixelStorei(G.UNPACK_SKIP_PIXELS,En),M.pixelStorei(G.UNPACK_SKIP_ROWS,kn),M.pixelStorei(G.UNPACK_SKIP_IMAGES,Kn),Ie===0&&B.generateMipmaps&&G.generateMipmap(Ue),M.unbindTexture()},this.initRenderTarget=function(w){ne.get(w).__webglFramebuffer===void 0&&le.setupRenderTarget(w)},this.initTexture=function(w){w.isCubeTexture?le.setTextureCube(w,0):w.isData3DTexture?le.setTexture3D(w,0):w.isDataArrayTexture||w.isCompressedArrayTexture?le.setTexture2DArray(w,0):le.setTexture2D(w,0),M.unbindTexture()},this.resetState=function(){fe=0,ue=0,ye=null,M.reset(),Le.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return yi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=St._getDrawingBufferColorSpace(e),t.unpackColorSpace=St._getUnpackColorSpace()}};var xf={idle:0,listening:1,thinking:2,speaking:3,working:4};var vf=`
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}`,yf=`
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
}`;var Vt='"Sora", "Manrope", system-ui, sans-serif',an='"Manrope", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',kt="#F4F6FA",tn="#A7B0C0",wn="#5EEAD4",Oa="#FBBF24",Zx={listening:"Listening",thinking:"Thinking"},Qh=1;async function $x(){if(typeof FontFace>"u"||!document.fonts)return;let i=[new FontFace("Sora","url(../fonts/sora.woff2)",{weight:"300 800"}),new FontFace("Manrope","url(../fonts/manrope.woff2)",{weight:"400 700"})],e=Promise.all(i.map(async t=>{await t.load(),document.fonts.add(t)}));await Promise.race([e,new Promise(t=>setTimeout(t,2500))]).catch(()=>{})}var bf=`
float hash3(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise3(vec3 x) {
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash3(i), hash3(i + vec3(1.0, 0.0, 0.0)), f.x), mix(hash3(i + vec3(0.0, 1.0, 0.0)), hash3(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
             mix(mix(hash3(i + vec3(0.0, 0.0, 1.0)), hash3(i + vec3(1.0, 0.0, 1.0)), f.x), mix(hash3(i + vec3(0.0, 1.0, 1.0)), hash3(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);
}`,Jx=`
uniform float uTime; uniform float uEnergy;
varying vec3 vN; varying vec3 vV; varying vec3 vP;
${bf}
void main() {
  vec3 p = position;
  float d = noise3(p * 22.0 + vec3(0.0, uTime * 0.9, uTime * 0.6));
  p += normal * (d - 0.5) * (0.004 + uEnergy * 0.016);
  vP = p * 11.0;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`,Kx=`
uniform float uTime; uniform float uEnergy; uniform float uThink;
uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform vec3 uGlow;
varying vec3 vN; varying vec3 vV; varying vec3 vP;
${bf}
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
}`;function Zt(i,e,t=2400){let n=document.createElement("canvas");n.width=Math.max(8,Math.round(i*t)),n.height=Math.max(8,Math.round(e*t));let s=n.getContext("2d"),r=new Os(n);r.colorSpace=mn,r.anisotropy=Qh;let a=new rn({map:r,transparent:!0,depthWrite:!1}),o=new ct(new Oi(i,e),a);return{canvas:n,ctx:s,tex:r,mesh:o,w:n.width,h:n.height,update(){r.needsUpdate=!0}}}function Zn(i,e,t,n,s,r){r=Math.min(r,n/2,s/2),i.beginPath(),i.moveTo(e+r,t),i.arcTo(e+n,t,e+n,t+s,r),i.arcTo(e+n,t+s,e,t+s,r),i.arcTo(e,t+s,e,t,r),i.arcTo(e,t,e+n,t,r),i.closePath()}function Nn(i,e,t,n,s={}){i.clearRect(0,0,e,t);let r=3,a=r;Zn(i,a,a,e-a*2,t-a*2,n);let o=i.createLinearGradient(0,0,0,t);if(o.addColorStop(0,s.fill0||"rgba(24, 27, 36, 0.94)"),o.addColorStop(1,s.fill1||"rgba(13, 15, 21, 0.95)"),i.fillStyle=o,i.fill(),i.lineWidth=s.hot?r*1.6:r,i.strokeStyle=s.hot?"rgba(94, 234, 212, 0.9)":"rgba(255, 255, 255, 0.13)",i.stroke(),!s.hot){let c=i.createLinearGradient(a+n,0,e-a-n,0);c.addColorStop(0,"rgba(255,255,255,0)"),c.addColorStop(.5,"rgba(255,255,255,0.34)"),c.addColorStop(1,"rgba(255,255,255,0)"),i.fillStyle=c,i.fillRect(a+n,a-r/2,e-2*(a+n),r)}}function _t(i,e,t,n,s,r,a=500,o="left",c=an,h="0px"){i.font=`${a} ${s}px ${c}`,i.fillStyle=r,i.textAlign=o,i.textBaseline="alphabetic","letterSpacing"in i&&(i.letterSpacing=h),i.fillText(e,t,n),"letterSpacing"in i&&(i.letterSpacing="0px")}function Tn(i,e,t){if(e=String(e||""),i.measureText(e).width<=t)return e;for(;e&&i.measureText(e+"\u2026").width>t;)e=e.slice(0,-1);return e+"\u2026"}function Mf(){let i=document.createElement("canvas");i.width=i.height=128;let e=i.getContext("2d"),t=e.createRadialGradient(64,64,0,64,64,64);t.addColorStop(0,"rgba(255,255,255,0.9)"),t.addColorStop(.35,"rgba(255,255,255,0.32)"),t.addColorStop(1,"rgba(255,255,255,0)"),e.fillStyle=t,e.fillRect(0,0,128,128);let n=new Os(i);return n.colorSpace=mn,n}var jx={mic(i){i.beginPath(),Zn(i,39,16,22,42,11),i.stroke(),i.beginPath(),i.arc(50,48,22,.12*Math.PI,.88*Math.PI),i.stroke(),i.beginPath(),i.moveTo(50,70),i.lineTo(50,84),i.stroke()},done(i){i.beginPath(),i.moveTo(27,52),i.lineTo(43,68),i.lineTo(74,35),i.stroke()},quiet(i){i.beginPath(),Zn(i,32,32,36,36,7),i.stroke()},end(i){i.beginPath(),i.moveTo(20,60),i.quadraticCurveTo(50,32,80,60),i.lineTo(72,69),i.lineTo(61,61),i.lineTo(61,53),i.quadraticCurveTo(50,48,39,53),i.lineTo(39,61),i.lineTo(28,69),i.closePath(),i.stroke()},eye(i){i.beginPath(),i.moveTo(14,50),i.quadraticCurveTo(50,16,86,50),i.quadraticCurveTo(50,84,14,50),i.stroke(),i.beginPath(),i.arc(50,50,11,0,Math.PI*2),i.stroke()},pc(i){i.beginPath(),Zn(i,16,22,68,44,6),i.stroke(),i.beginPath(),i.moveTo(36,82),i.lineTo(64,82),i.moveTo(50,66),i.lineTo(50,82),i.stroke()},pin(i){i.beginPath(),i.moveTo(50,86),i.lineTo(50,62),i.stroke(),i.beginPath(),i.moveTo(31,62),i.lineTo(69,62),i.lineTo(62,46),i.lineTo(62,20),i.lineTo(38,20),i.lineTo(38,46),i.closePath(),i.stroke()},leave(i){i.beginPath(),i.moveTo(32,32),i.lineTo(68,68),i.moveTo(68,32),i.lineTo(32,68),i.stroke()},think(i){for(let e=0;e<3;e++)i.beginPath(),i.arc(30+e*20,50,4.5,0,Math.PI*2),i.stroke()},photos(i){i.beginPath(),Zn(i,16,24,68,52,8),i.stroke(),i.beginPath(),i.moveTo(23,69),i.lineTo(42,49),i.lineTo(56,62),i.lineTo(65,54),i.lineTo(78,69),i.stroke(),i.beginPath(),i.arc(64,38,5,0,Math.PI*2),i.stroke()},style(i){let e=(t,n,s)=>{i.beginPath(),i.moveTo(t,n-s),i.quadraticCurveTo(t,n,t+s,n),i.quadraticCurveTo(t,n,t,n+s),i.quadraticCurveTo(t,n,t-s,n),i.quadraticCurveTo(t,n,t,n-s),i.stroke()};e(44,56,26),e(74,28,12)},folder(i){i.beginPath(),i.moveTo(14,30),i.lineTo(40,30),i.lineTo(48,38),i.lineTo(86,38),i.lineTo(86,78),i.lineTo(14,78),i.closePath(),i.stroke()},doc(i){i.beginPath(),i.moveTo(28,14),i.lineTo(60,14),i.lineTo(76,30),i.lineTo(76,86),i.lineTo(28,86),i.closePath(),i.stroke(),i.beginPath(),i.moveTo(38,50),i.lineTo(66,50),i.moveTo(38,62),i.lineTo(66,62),i.moveTo(38,74),i.lineTo(56,74),i.stroke()},close(i){i.beginPath(),i.moveTo(34,34),i.lineTo(66,66),i.moveTo(66,34),i.lineTo(34,66),i.stroke()},back(i){i.beginPath(),i.moveTo(58,30),i.lineTo(38,50),i.lineTo(58,70),i.stroke()},next(i){i.beginPath(),i.moveTo(42,30),i.lineTo(62,50),i.lineTo(42,70),i.stroke()},up(i){i.beginPath(),i.moveTo(30,56),i.lineTo(50,36),i.lineTo(70,56),i.moveTo(50,36),i.lineTo(50,74),i.stroke()},search(i){i.beginPath(),i.arc(44,44,20,0,Math.PI*2),i.stroke(),i.beginPath(),i.moveTo(59,59),i.lineTo(76,76),i.stroke()},pause(i){i.beginPath(),i.moveTo(40,32),i.lineTo(40,68),i.moveTo(60,32),i.lineTo(60,68),i.stroke()},holo(i){i.beginPath(),i.moveTo(50,22),i.lineTo(76,36),i.lineTo(76,64),i.lineTo(50,78),i.lineTo(24,64),i.lineTo(24,36),i.closePath(),i.stroke(),i.beginPath(),i.moveTo(24,36),i.lineTo(50,50),i.lineTo(76,36),i.moveTo(50,50),i.lineTo(50,78),i.stroke()}};function Sf(i,e){let{ctx:t,w:n,h:s}=i;t.clearRect(0,0,n,s),t.beginPath(),t.arc(n/2,s/2,n/2-4,0,Math.PI*2),t.fillStyle="rgba(20, 23, 31, 0.95)",t.fill(),t.lineWidth=3,t.strokeStyle="rgba(255,255,255,0.18)",t.stroke(),Ci(t,e,n/2,s/2,n*.62,kt,7),i.update()}function Ci(i,e,t,n,s,r=kt,a=6){i.save();let o=s/100;i.translate(t-50*o,n-50*o),i.scale(o,o),i.strokeStyle=r,i.fillStyle=r,i.lineWidth=a,i.lineCap="round",i.lineJoin="round",jx[e]?.(i),i.restore()}async function aS({mode:i,session:e,api:t,tint:n}){let s=i==="flat",r=i==="immersive-ar",a=t.util;await $x();let o=new cc({antialias:!0,alpha:!0,powerPreference:"high-performance"});o.setClearColor(0,0),o.outputColorSpace=mn,o.setPixelRatio(s?Math.min(2,window.devicePixelRatio||1):1),Qh=Math.max(1,o.capabilities.getMaxAnisotropy?.()||1),o.setSize(window.innerWidth,window.innerHeight);let c=o.domElement;Object.assign(c.style,{position:"fixed",inset:"0",width:"100vw",height:"100vh",zIndex:"2147483000",touchAction:"none",display:s?"block":"none"}),document.body.appendChild(c);let h=new aa,d=new Pn(70,window.innerWidth/window.innerHeight,.01,100);d.position.set(0,1.6,0),h.add(d);let x=[],u=l=>(x.push(l),l),m=[],y=0,T=(()=>{try{return matchMedia("(prefers-reduced-motion: reduce)").matches}catch{return!1}})(),v=l=>1-Math.pow(1-Math.min(1,Math.max(0,l)),4),_=!1,R={a:new je,b:new je,c:new je},D=null,E=0,I=8246268,P=!1;try{E=Math.max(0,Ba.findIndex(l=>l.name===localStorage.getItem("izuki.vr.theme")))}catch{}function U(l){let p=Ba[l];if(R.a.setRGB(...p.orb[0]),R.b.setRGB(...p.orb[1]),R.c.setRGB(...p.orb[2]),l===0&&n){let S=parseInt(n.slice(1),16),f=new je((S>>16&255)/255,(S>>8&255)/255,(S&255)/255);R.a.lerp(f,.6),R.b.lerp(f,.35),R.c.lerp(f,.45)}I=p.halo,D&&(D.uniforms.uA.value.copy(R.a),D.uniforms.uB.value.copy(R.b),D.uniforms.uC.value.copy(R.c)),Ye?.set(p);let g=!!p.light&&!!Ye;if(g!==P){P=g;for(let S of he)S.draw()}}function b(){E=(E+1)%Ba.length,U(E);try{localStorage.setItem("izuki.vr.theme",Ba[E].name)}catch{}return"This is "+Ba[E].name+(r?".":", with its own sky.")+" Say \u201Cchange your look\u201D again for the next one."}let C=new Xt;C.visible=!1,h.add(C);let O=u(new dn({uniforms:{uTime:{value:0},uEnergy:{value:0},uThink:{value:0},uA:{value:R.a},uB:{value:R.b},uC:{value:R.c},uGlow:{value:new je(.82,.95,1)}},vertexShader:Jx,fragmentShader:Kx,transparent:!0})),H=new ct(u(new Ln(.085,64,48)),O);H.renderOrder=2;let Y=u(new ui({map:u(Mf()),color:6220500,transparent:!0,blending:Yt,depthWrite:!1,opacity:.3})),Q=new Si(Y);Q.scale.setScalar(.42),Q.renderOrder=1;let V=u(new rn({color:6220500,transparent:!0,opacity:0,blending:Yt,depthWrite:!1})),te=new ct(u(new ms(.118,.003,8,120,Math.PI*1.4)),V),fe=u(new rn({color:6220500,transparent:!0,opacity:0,blending:Yt,depthWrite:!1})),ue=new ct(u(new ms(.1,.0016,8,160)),fe);ue.visible=!1,C.add(Q,H,te,ue),D=u(new dn({uniforms:{uTime:{value:0},uEnergy:{value:0},uPulse:{value:0},uState:{value:0},uAspect:{value:1.6},uOpacity:{value:.55},uA:{value:R.a.clone()},uB:{value:R.b.clone()},uC:{value:R.c.clone()}},vertexShader:vf,fragmentShader:yf,transparent:!0,depthWrite:!1,blending:Yt}));let ye=new ct(u(new Oi(.86,.54)),D);ye.position.set(0,.01,-.14),ye.renderOrder=0,C.add(ye);let oe=Zt(.56,.19);oe.mesh.position.set(0,-.2,.01),C.add(oe.mesh),u(oe.tex),u(oe.mesh.material),u(oe.mesh.geometry),m.push(oe.mesh.material);let q={state:"",you:"",reply:"",stage:"",mic:0,energy:0,think:0,hovered:!1,hint:s?"Click the orb to talk. Drag to look around.":"Point at the orb and pull the trigger (or pinch) to talk."};function xe(){let{ctx:l,w:p,h:g}=oe;Nn(l,p,g,52);let S=56,f=30,A=Zx[q.state]||q.stage||"";A?(l.beginPath(),l.arc(S+9,f+34,9,0,Math.PI*2),l.fillStyle=wn,l.fill(),l.font=`600 30px ${Vt}`,_t(l,Tn(l,A,p-S*2-40),S+34,f+45,30,wn,600,"left",Vt,"0.02em"),f+=62):f+=14,q.you&&(l.font=`500 34px ${an}`,_t(l,Tn(l,q.you,p-S*2),S,f+=40,34,tn,500),f+=10);let k=q.reply||(q.you?"":q.hint),F=(X,ee)=>(l.font=`500 ${ee}px ${an}`,l.measureText(X).width),Z=q.notice?a.fitLines(q.notice,p-S*2,2,30,26,F):null,W=Z?Z.lines.length*Z.size*1.3+22:0;if(k){let X=g-f-36-W,ee=Math.max(1,Math.floor(X/(32*1.32))),ae=a.fitLines(k,p-S*2,Math.min(ee,5),50,32,F),Te=ae.size*1.32;f+=6;for(let de of ae.lines)_t(l,de,S,f+=Te,ae.size,q.reply?kt:tn,500)}if(Ut(q.notice||q.reply),Z){let X=g-32-(Z.lines.length-1)*Z.size*1.3;for(let ee of Z.lines)_t(l,ee,S,X,Z.size,q.noticeWarn?Oa:tn,500),X+=Z.size*1.3}oe.update()}let qe=null,Ze=!1,Ut=l=>{Ze&&qe&&l&&qe.textContent!==l&&(qe.textContent=l)},xt=0;function gt(l,p=12e3,g=!1){q.notice=String(l||""),q.noticeWarn=!!g,clearTimeout(xt),xt=setTimeout(()=>{q.notice="",xe()},p),xe()}let he=[];function ge(l,p,g){let S=Zt(.088,.112,2400);u(S.tex),u(S.mesh.material),u(S.mesh.geometry),m.push(S.mesh.material);let f={c:S,icon:l,label:p,hot:!1,on:!1,shown:!0};return f.draw=()=>{let{ctx:A,w:k,h:F}=S;A.clearRect(0,0,k,F);let Z=k*.38,W=k/2,X=Z+10;A.beginPath(),A.arc(W,X,Z,0,Math.PI*2);let ee=A.createLinearGradient(0,X-Z,0,X+Z);ee.addColorStop(0,f.hot?"rgba(44, 50, 64, 0.97)":"rgba(26, 29, 38, 0.95)"),ee.addColorStop(1,f.hot?"rgba(26, 30, 40, 0.97)":"rgba(14, 16, 22, 0.95)"),A.fillStyle=ee,A.fill(),A.lineWidth=f.hot||f.on?5:3,A.strokeStyle=f.on?wn:f.hot?"rgba(255,255,255,0.55)":"rgba(255,255,255,0.16)",A.stroke(),Ci(A,f.icon,W,X,Z*1.05,f.on?wn:kt,6.5);let ae=P?{on:"#0F766E",hot:"#11151C",rest:"#2A303B"}:{on:wn,hot:kt,rest:tn};_t(A,f.label,W,F-12,30,f.on?ae.on:f.hot?ae.hot:ae.rest,600,"center",Vt,"0.01em"),S.update()},f.set=(A,k)=>{A===f.icon&&k===f.label||(f.icon=A,f.label=k,f.draw())},f.setOn=A=>{!!A!==f.on&&(f.on=!!A,f.draw())},f.draw(),Se(S.mesh,{tap:g,hover:A=>{f.hot=A,f.draw(),S.mesh.position.z=A?.026:.02}}),C.add(S.mesh),he.push(f),f}function Be(){let l=he.filter(g=>g.shown),p=l.length>6?.088:.1;l.forEach((g,S)=>{g.c.mesh.visible=!0,g.c.mesh.position.set((S-(l.length-1)/2)*p,-.375,.02)});for(let g of he)g.shown||(g.c.mesh.visible=!1)}let tt=[];function Se(l,p){return l.userData.ui=p,tt.push(l),l}function et(l){let p=tt.indexOf(l);p>=0&&tt.splice(p,1)}let nn=l=>{for(let p=l;p;p=p.parent)if(!p.visible)return!1;return!0},ot=new wa;ot.far=10;let Oe=new N,Ct=new N,dt=new hi,pt=0,$t=[],An=u(new Bs(.006,20)),Gt=u(new Lt().setAttribute("position",new st([0,0,0,0,0,-1],3)));function Jt(l,p){let g={kind:l,ctrl:p,source:null,hit:null,hover:null,press:null,origin:new N,dir:new N,buttons:[],scrollAt:0};return g.dot=new ct(An,u(new rn({color:16777215,transparent:!0,opacity:.9,depthTest:!1}))),g.dot.renderOrder=999,g.dot.visible=!1,h.add(g.dot),p&&(g.line=new Fi(Gt,u(new ii({color:10482666,transparent:!0,opacity:.5}))),g.line.visible=!1,p.add(g.line)),$t.push(g),g}let G=(l,p=.25,g=16)=>{try{l.source?.gamepad?.hapticActuators?.[0]?.pulse?.(p,g)}catch{}};function ln(l,p=!1){if(!l.hit)return;let g=l.hit.object.userData.ui,S=g.drag?g.drag():null;if(l.press={u:g,obj:l.hit.object,hit:l.hit,drag:S,grabOnly:p,dist:l.hit.distance,start:l.hit.point.clone(),offset:S?S.position.clone().sub(l.hit.point):null,moved:!1,t0:performance.now()},!S&&g.turn&&(l.press.turn=ru(g.turn())),G(l,.35,20),!p)try{g.down?.(l)}catch(f){console.warn("vr down",f)}}let ht=new N,L=new N,M=new N;function $(l,p){let g=l.source?.hand?o.xr.getHand(l.index):null,S=g?.joints?.["index-finger-tip"],f=g?.joints?.["thumb-tip"];return S&&f?(S.getWorldPosition(p),f.getWorldPosition(L),p.add(L).multiplyScalar(.5)):l.ctrl.getWorldPosition(p)}function ne(l){if(s||!l.source)return!1;$(l,ht);let p=null,g=1/0;for(let f of tt){let A=f.userData.ui;if(!(A.drag||A.grab||A.turn)||!nn(f))continue;let k=f.geometry;k.boundingBox||k.computeBoundingBox(),f.updateWorldMatrix(!0,!1),M.copy(ht),f.worldToLocal(M);let F=k.boundingBox,Z=f.getWorldScale(L),W=(f===H?.07:.03)/Math.max(.001,Z.x),X=Math.max(F.min.x-M.x,0,M.x-F.max.x),ee=Math.max(F.min.y-M.y,0,M.y-F.max.y),ae=Math.max(F.min.z-M.z,0,M.z-F.max.z);if(X>W||ee>W||ae>W+.05/Math.max(.001,Z.x))continue;let Te=Math.hypot(X,ee,ae);Te<g&&(g=Te,p={m:f,u:A})}if(!p)return!1;if(!(p.u.drag||p.u.grab)&&p.u.turn)return l.press={u:p.u,obj:p.m,hit:null,drag:null,turn:ru(p.u.turn()),direct:!0,grabOnly:!1,start:ht.clone(),moved:!1,t0:performance.now()},G(l,.5,28),!0;let S=(p.u.drag||p.u.grab)();return S?(l.press={u:p.u,obj:p.m,hit:null,drag:S,direct:!0,grabOnly:!1,offset:S.position.clone().sub(ht),start:ht.clone(),moved:!1,t0:performance.now()},G(l,.5,28),!0):!1}function le(l,p=!0){let g=l.press;if(l.press=null,!!g){if(!g.grabOnly)try{g.u.up?.(performance.now()-g.t0,p&&!g.moved)}catch(S){console.warn("vr up",S)}if(g.moved&&g.turn){J.view.spin=Math.max(-4,Math.min(4,g.turn.vel));return}if(g.moved){g.u.dropped?.();return}if(g.direct){if(!p)return;let S=null,f=g.obj.geometry?.parameters;if(f?.width&&f?.height){$(l,ht);let A=g.obj.worldToLocal(ht.clone());S={uv:{x:Math.max(0,Math.min(1,A.x/f.width+.5)),y:Math.max(0,Math.min(1,A.y/f.height+.5))},point:ht.clone()}}try{g.u.tap?.(S,l)}catch(A){console.warn("vr tap",A)}return}if(!(g.grabOnly||!p)&&!(!l.hit||l.hit.object!==g.obj))try{g.u.tap?.(l.hit,l)}catch(S){console.warn("vr tap",S)}}}function Me(l){l.lookAt(Oe.x,l.position.y,Oe.z)}let Ae=[],se=(l,p,g,S)=>{l.addEventListener(p,g,S),Ae.push(()=>l.removeEventListener(p,g,S))},me=null;if(!s){for(let l=0;l<2;l++){let p=o.xr.getController(l);h.add(p);let g=Jt("xr",p);g.index=l,se(p,"connected",S=>{g.source=S.data,g.line.visible=!0}),se(p,"disconnected",()=>{g.source=null,g.line.visible=!1,g.dot.visible=!1,g.press=null}),se(p,"selectstart",()=>{g.selected=!1,!ne(g)&&(z(g),ln(g))}),se(p,"select",()=>{g.selected=!0}),se(p,"selectend",()=>{z(g),le(g,g.selected),g.selected=!1}),se(p,"squeezestart",()=>{ne(g)||(z(g),ln(g,!0))}),se(p,"squeezeend",()=>le(g,!1))}for(let l=0;l<2;l++)h.add(o.xr.getHand(l));if(!r){let l=u(new Ln(.006,8,6)),p=u(new rn({color:13496317,transparent:!0,opacity:.85}));me={jointGeo:l,jointMat:p}}}let Ee=0;if(!s)try{o.xr.enabled=!0;let l=e.enabledFeatures,p=!l||l.includes("local-floor")?"local-floor":"local";p==="local"&&(Ee=-1.6),o.xr.setReferenceSpaceType(p);try{o.xr.setFramebufferScaleFactor(1.25)}catch{}await o.xr.setSession(e);try{o.xr.setFoveation(.2)}catch{}let g=[...e.inputSources||[]].filter(S=>!$t.some(f=>f.source===S));if(g.length){let S=new Event("inputsourceschange");Object.assign(S,{session:e,added:g,removed:[]}),e.dispatchEvent(S)}}catch(l){for(let p of Ae)try{p()}catch{}c.remove(),o.dispose();try{await e.end()}catch{}throw l}let Ye=r?null:Qx(h,Ee);U(E);let Re=new ke,be=s?Jt("mouse",null):null,He=null,Ke=-.2,rt=0;if(s){be.source={};let l=p=>{Re.set(p.clientX/window.innerWidth*2-1,-(p.clientY/window.innerHeight)*2+1)};se(c,"pointermove",p=>{l(p),He&&(rt-=(p.clientX-He.x)*.004,Ke-=(p.clientY-He.y)*.004,Ke=Math.max(-1.2,Math.min(1.2,Ke)),He={x:p.clientX,y:p.clientY})}),se(c,"pointerdown",p=>{l(p),z(be),be.hit?ln(be):He={x:p.clientX,y:p.clientY},c.setPointerCapture?.(p.pointerId)}),se(c,"pointerup",p=>{l(p),He=null,z(be),le(be)}),se(c,"pointercancel",()=>{He=null,be.press=null}),se(c,"wheel",p=>{let g=be.hit?.object.userData.ui;g?.scroll&&(p.preventDefault(),g.scroll(Math.sign(p.deltaY)*Math.min(5,Math.ceil(Math.abs(p.deltaY)/60))))},{passive:!1}),se(window,"keydown",p=>{p.key==="Escape"?Wr():p.key===" "&&p.target===document.body&&(p.preventDefault(),t.tapOrb())}),se(window,"resize",()=>{d.aspect=window.innerWidth/window.innerHeight,d.updateProjectionMatrix(),o.setSize(window.innerWidth,window.innerHeight)})}function z(l){if(l.kind==="mouse")ot.setFromCamera(Re,d),l.origin.copy(ot.ray.origin),l.dir.copy(ot.ray.direction);else{if(!l.source)return!1;l.ctrl.getWorldPosition(l.origin),l.ctrl.getWorldQuaternion(dt),l.dir.set(0,0,-1).applyQuaternion(dt)}ot.set(l.origin,l.dir);let p=ot.intersectObjects(tt,!1);return l.hit=p.find(g=>nn(g.object))||null,!0}function Ce(l){l.holdAt=performance.now(),l.holdListening=q.state==="listening",l.holdListening||t.tapOrb()}function pe(l,p){let g=l.holdListening;l.holdListening=!1,(g||p>600)&&t.tapOrb()}Se(H,{tap:()=>t.tapOrb(),drag:()=>C,dropped:()=>{C.userData.placed=!0},hover:l=>{q.hovered=l}}),Se(oe.mesh,{drag:()=>C,dropped:()=>{C.userData.placed=!0}});let we=ge("mic","Talk",null);Object.assign(we.c.mesh.userData.ui,{tap:null,down:()=>Ce(we),up:(l,p)=>{p&&pe(we,l)}});let Le=ge("pause","Pause",()=>t.hangUp()),ve=ge("eye","Look",()=>{ka(),t.look()}),$e=()=>{_e.open?Es():Ha().then(l=>{l&&t.speak(l)})},We=()=>{let l=t.lastReply();l?hu(l):t.speak("There's nothing to pin yet. Ask me something first.")},Ft=()=>{if(ce.open)return vt();if(!t.pc.current())return gt("Your photos are on your PC: pair this headset with it once (leave the room, Remote, Pair).",12e3,!0);vn("Pictures").then(l=>{l&&gt(l,12e3,!0)})},Tt=()=>gt(b(),5e3),$n=ge("photos","Photos",Ft),ai=ge("pc","My PC",$e);ge("pin","Pin",We),ge("style","Style",Tt),ge("leave","Leave",()=>Wr()),Le.shown=!1,ve.shown=!1,Be();let Ts=[];function Ur(l,p,g){let S=Zt(.205,.054,2400);u(S.tex),u(S.mesh.material),u(S.mesh.geometry),_||m.push(S.mesh.material);let f={c:S,hot:!1};return f.draw=()=>{let{ctx:A,w:k,h:F}=S;Nn(A,k,F,(F-6)/2,{hot:f.hot}),Ci(A,l,58,F/2,50,wn,7),A.font=`500 37px ${an}`,_t(A,Tn(A,p,k-124),98,F/2+13,37,kt,500),S.update()},f.draw(),Se(S.mesh,{tap:()=>{Hs(),t.ask(g)},hover:A=>{f.hot=A,f.draw()}}),C.add(S.mesh),Ts.push(f),f}let As=!1;try{As=localStorage.getItem("izuki.vr.tried")!=="1"}catch{}function Hs(){As=!1;for(let l of Ts)l.c.mesh.visible=!1;try{localStorage.setItem("izuki.vr.tried","1")}catch{}}function dc(){Ts.forEach((l,p)=>{l.c.mesh.position.set((p-(Ts.length-1)/2)*.218,.17,.01)}),yc()}t.hasCamera().then(l=>{ve.shown=!!l,Be(),Ur(l?"eye":"mic",l?"\u201CWhat's this?\u201D":"\u201CWhat can you do?\u201D",l?"What's this?":"What can you do?"),Ur("photos","\u201CShow my photos\u201D","Show my photos"),Ur("style","\u201CChange your look\u201D","Change your look"),dc()});let Ne={group:new Xt,photo:null,text:Zt(.5,.15),img:null,url:"",want:"",closed:"",seq:0,marks:[],say:"",t0:0,anim:!1,close:Zt(.05,.05)};Ne.group.visible=!1,h.add(Ne.group),Se(Ne.text.mesh,{drag:()=>Ne.group}),u(Ne.text.tex),u(Ne.close.tex),Ne.group.add(Ne.text.mesh,Ne.close.mesh),Sf(Ne.close,"close"),Se(Ne.close.mesh,{tap:()=>{Ne.seq++,Ne.closed=Ne.want,Ne.group.visible=!1}});function Fr(){let{ctx:l,w:p,h:g}=Ne.text;Nn(l,p,g,44);let S=(k,F)=>(l.font=`500 ${F}px ${an}`,l.measureText(k).width),f=a.fitLines(Ne.say,p-96,4,38,26,S),A=22;for(let k of f.lines)_t(l,k,48,A+=f.size*1.32,f.size,kt,500);Ne.text.update(),Ut(Ne.say)}function Ri(l){let p=Ne.photo;if(!p||!Ne.img)return;let{ctx:g,w:S,h:f}=p;g.clearRect(0,0,S,f),g.save(),Zn(g,0,0,S,f,28),g.clip(),g.drawImage(Ne.img,0,0,S,f),g.restore();let A=Ne.marks.length,k=S*(Ne.steps?.03:.065),F=Z=>({x:Z.x/1e3*S,y:Z.y/1e3*f});Ne.marks.forEach((Z,W)=>{let X=Math.max(0,Math.min(1,l*A-W));if(X<=0)return;let{x:ee,y:ae}=F(Z);if(Ne.steps&&W>0&&Or(g,F(Ne.marks[W-1]),{x:ee,y:ae},k,Math.min(1,X*2)),g.save(),g.shadowColor="rgba(0,0,0,0.55)",g.shadowBlur=10,g.shadowOffsetY=3,g.strokeStyle=wn,g.lineWidth=6,g.lineCap="round",g.beginPath(),g.arc(ee,ae,k,-Math.PI/2,-Math.PI/2+Math.PI*2*X),g.stroke(),g.restore(),Ne.steps&&A>1&&X>.3){let Te=Math.min(S-26,Math.max(26,ee-k*.75)),de=Math.min(f-26,Math.max(26,ae-k*.75));g.save(),g.shadowColor="rgba(0,0,0,0.5)",g.shadowBlur=8,g.fillStyle=wn,g.beginPath(),g.arc(Te,de,22,0,Math.PI*2),g.fill(),g.restore(),g.font=`700 26px ${an}`;let Je=String(W+1);_t(g,Je,Te-g.measureText(Je).width/2,de+9,26,"#0b1016",700)}if(X>.85&&Z.label){g.font=`600 28px ${an}`;let Te=g.measureText(Z.label).width,de=Math.min(S-Te-40,Math.max(10,ee-Te/2-16)),Je=ae+k+12>f-50?ae-k-56:ae+k+12;Ne.steps&&(de=ee+k+16+Te+32<=S-10?ee+k+16:Math.max(10,ee-k-16-Te-32),Je=Math.min(f-54,Math.max(10,ae-22))),Zn(g,de,Je,Te+32,44,22),g.fillStyle="rgba(14,16,22,0.88)",g.fill(),_t(g,Z.label,de+16,Je+31,28,kt,600)}}),p.update()}function Or(l,p,g,S,f){let A=g.x-p.x,k=g.y-p.y,F=Math.hypot(A,k);if(F<=2*S+12)return;let Z=A/F,W=k/F,X=p.x+Z*(S+6),ee=p.y+W*(S+6),ae=(F-2*S-12)*f,Te=X+Z*ae,de=ee+W*ae;if(l.save(),l.shadowColor="rgba(0,0,0,0.5)",l.shadowBlur=8,l.strokeStyle=wn,l.lineWidth=5,l.lineCap="round",l.setLineDash([16,12]),l.beginPath(),l.moveTo(X,ee),l.lineTo(Te,de),l.stroke(),l.setLineDash([]),f>=1){let it=-W,ft=Z;l.fillStyle=wn,l.beginPath(),l.moveTo(Te+Z*4,de+W*4),l.lineTo(Te-Z*18+it*18*.6,de-W*18+ft*18*.6),l.lineTo(Te-Z*18-it*18*.6,de-W*18-ft*18*.6),l.closePath(),l.fill()}l.restore()}function ka(){Ne.group.visible&&(Ne.say="Looking\u2026",Fr())}async function za({url:l,w:p,h:g,marks:S,say:f,picked:A,steps:k}){if(A)Ne.closed="";else if(l===Ne.closed)return;let F=++Ne.seq;if(Ne.want=l,l!==Ne.url){let Z=new Image;Z.src=l;try{await Z.decode()}catch{return}if(F!==Ne.seq)return;Ne.img=Z,Ne.url=l;let W=g/Math.max(1,p),X=Math.min(.42,.5*W),ee=X/W;Ne.photo&&(et(Ne.photo.mesh),Ne.group.remove(Ne.photo.mesh),Ne.photo.tex.dispose(),Ne.photo.mesh.geometry.dispose(),Ne.photo.mesh.material.dispose()),Ne.photo=Zt(ee,X,2048),Ne.group.add(Ne.photo.mesh),Se(Ne.photo.mesh,{drag:()=>Ne.group}),Ne.photo.mesh.position.set(0,.1,0),Ne.text.mesh.position.set(0,.1-X/2-.09,0),Ne.close.mesh.position.set(ee/2-.01,.1+X/2-.01,.005)}if(Ne.marks=Array.isArray(S)?S:[],Ne.steps=!!k,Ne.say=String(f||""),Ne.t0=performance.now(),Ne.anim=Ne.marks.length>0,!Ne.group.visible){let Z=pt-.6,W=.85;Ne.group.position.set(Oe.x-Math.sin(Z)*W,Oe.y-.08,Oe.z-Math.cos(Z)*W),Me(Ne.group)}Ne.group.visible=!0,Ri(Ne.anim?0:1),Fr()}let _e={group:new Xt,open:!1,live:!1,gen:0,target:null,err:"",clicks:Promise.resolve(),doing:"",busy:!1,screen:null,bar:Zt(1.6,.09),handle:Zt(.32,.035),aspect:9/16};_e.group.visible=!1,h.add(_e.group),u(_e.bar.tex),u(_e.handle.tex);function Br(l,p){_e.screen&&(et(_e.screen.mesh),_e.group.remove(_e.screen.mesh),_e.screen.tex.dispose(),_e.screen.mesh.geometry.dispose(),_e.screen.mesh.material.dispose());let g=p/l,S=Math.min(1.6,1.1/g),f=Zt(S,S*g,l/S);f.mesh.material.transparent=!1,f.mesh.material.depthWrite=!0,_e.screen=f,_e.aspect=g,_e.group.add(f.mesh);let A=S*g/2;return _e.bar.mesh.position.set(0,-A-.06,0),_e.handle.mesh.position.set(0,A+.04,0),Se(f.mesh,{tap:k=>{if(!k?.uv||!_e.live)return;let{nx:F,ny:Z}=a.pcPoint(k.uv.x,k.uv.y),W=_e.gen;K(k.point);let X=()=>_e.open&&W===_e.gen&&_e.live;_e.clicks=_e.clicks.then(async()=>{if(!X())return;let ee=await t.pc.send({op:"point",nx:F,ny:Z},_e.target);if(ee?.ok===!1){W===_e.gen&&(_e.err=ee.error||"",Jn());return}if(!X())return;let ae=await t.pc.send({op:"click",button:"left"},_e.target);X()&&(_e.err=ae?.ok===!0?"":ae?.error||"The click wasn't confirmed. Check the PC before trying again.",Jn())}).catch(ee=>{X()&&(_e.err=String(ee?.message||"The click wasn't confirmed. Check the PC before trying again."),Jn())})},scroll:k=>{_e.live&&t.pc.send({op:"scroll",dy:k},_e.target)}}),f}Br(1280,720),_e.group.add(_e.bar.mesh,_e.handle.mesh);{let{ctx:l,w:p,h:g}=_e.handle;l.clearRect(0,0,p,g),Zn(l,4,4,p-8,g-8,(g-8)/2),l.fillStyle="rgba(255,255,255,0.34)",l.fill(),_e.handle.update()}Se(_e.handle.mesh,{drag:()=>_e.group});function Ki(l){_e.live=!1;let p=_e.screen,{ctx:g,w:S,h:f}=p;Nn(g,S,f,24),g.font=`500 ${Math.round(f*.05)}px ${an}`;let A=a.wrapLines(l,S*.7,k=>g.measureText(k).width);A.forEach((k,F)=>_t(g,k,S/2,f/2+(F-(A.length-1)/2)*f*.075,Math.round(f*.05),tn,500,"center")),p.update()}function Va(l){(Math.abs(l.height/l.width-_e.aspect)>.01||_e.screen.w!==l.width)&&Br(l.width,l.height);let p=_e.screen;p.ctx.drawImage(l,0,0,p.w,p.h),p.update(),_e.live=!0}function Jn(){let{ctx:l,w:p,h:g}=_e.bar;Nn(l,p,g,48),l.beginPath(),l.arc(72,g/2,13,0,Math.PI*2),l.fillStyle=_e.err?Oa:wn,l.fill();let S=_e.err||(_e.doing?"Izuki: "+_e.doing:(_e.target?.name||t.pc.name())+" \xB7 point and click, thumbstick to scroll");l.font=`500 60px ${an}`,_t(l,Tn(l,S,p-800),116,g/2+21,60,_e.err?Oa:kt,500);let f=(A,k,F)=>{Zn(l,A,30,280,g-60,(g-60)/2),l.fillStyle=F?"rgba(220, 38, 38, 0.82)":"rgba(255, 255, 255, 0.07)",l.fill(),F||(l.lineWidth=3,l.strokeStyle="rgba(255,255,255,0.16)",l.stroke()),_t(l,k,A+140,g/2+19,52,kt,600,"center",Vt,"0.02em")};_e.busy&&f(p-620,"Stop",!0),f(p-310,"Close",!1),_e.bar.update()}Se(_e.bar.mesh,{tap:l=>{let p=(l?.uv?.x??0)*_e.bar.w;if(p>_e.bar.w-320)Es();else if(_e.busy&&p>_e.bar.w-630){let g=_e.gen;t.pc.send({op:"stop"},_e.target).then(S=>{!_e.open||g!==_e.gen||(S?.ok===!1?_e.err=S.error||"Your PC didn't confirm it stopped.":(_e.busy=!1,_e.err=""),Jn())})}},drag:()=>_e.group});let Ga=l=>new Promise(p=>setTimeout(p,l));async function fc(l){for(;_e.open&&l===_e.gen;){let p=performance.now(),g=await t.pc.shot(1280,_e.target);if(!_e.open||l!==_e.gen)break;if(g.blob){let S=()=>_e.open&&l===_e.gen,f=null;try{f=await createImageBitmap(g.blob),S()&&(Va(f),_e.err&&(_e.err="",Jn()))}catch{S()&&(_e.err="A picture from your PC didn't come through.",Ki(_e.err),Jn())}finally{f?.close?.()}}else _e.err=g.error||"Your PC didn't answer.",Ki(_e.err),Jn();await Ga(g.blob?Math.max(120,320-(performance.now()-p)):3e3)}}async function pc(l){for(;_e.open&&l===_e.gen;){let p=await t.pc.status(_e.target);if(!_e.open||l!==_e.gen)break;p.error||(_e.doing=p.doing,_e.busy=p.busy,Jn()),await Ga(3e3)}}async function Ha(){if(!t.pc.current())return"This headset isn't paired with your PC yet. Leave VR, open Remote in Izuki and pair your PC once.";let l=1.55;_e.group.position.set(Oe.x-Math.sin(pt)*l,Oe.y-.02,Oe.z-Math.cos(pt)*l),Me(_e.group),_e.group.visible=!0,_e.open=!0,_e.err="",_e.target=t.pc.current(),w("pc");let p=++_e.gen;return Ki("Connecting to "+(_e.target?.name||t.pc.name())+"\u2026"),Jn(),fc(p),pc(p),""}function Es(){_e.open=!1,_e.gen++,_e.group.visible=!1,C.userData.placed==="pc"&&(ce?.open?C.userData.placed="files":re?.open?C.userData.placed="web":J?.open?C.userData.placed="holo":Zs())}function w(l){if(C.userData.placed!==!0){if(!C.userData.placed){let p=pt+.7;Qn={x:Oe.x-Math.sin(p)*.7,y:Oe.y-.17,z:Oe.z-Math.cos(p)*.7}}C.userData.placed=l}}let B=[],ie=u(new ps(.012,.018,32));function K(l){let p=new ct(ie,new rn({color:6220500,transparent:!0,opacity:.9,depthTest:!1}));p.position.copy(l),p.lookAt(Oe),p.renderOrder=998,h.add(p),B.push({m:p,t0:performance.now()})}let j=1,Ie=.74,Fe=4,Pe=3,ze=Fe*Pe,Xe=.12,ce={group:new Xt,card:Zt(j,Ie),handle:Zt(.3,.035),open:!1,gen:0,path:"",up:"",items:[],page:0,title:"",err:"",loading:!1,thumbs:new Map,pending:new Set,btns:[]};ce.group.visible=!1,h.add(ce.group),ce.group.add(ce.card.mesh,ce.handle.mesh),ce.handle.mesh.position.set(0,Ie/2+.035,0),u(ce.card.tex),u(ce.handle.tex);{let{ctx:l,w:p,h:g}=ce.handle;Zn(l,4,4,p-8,g-8,(g-8)/2),l.fillStyle="rgba(255,255,255,0.34)",l.fill(),ce.handle.update()}Se(ce.handle.mesh,{drag:()=>ce.group});let ut=()=>ce.items.slice(ce.page*ze,ce.page*ze+ze),Ve=()=>Math.max(1,Math.ceil(ce.items.length/ze)),At=l=>ce.path+"|"+l.name;function Kt(l){let{w:p,h:g}=ce.card,S=g*Xe,f=p*.018,A=(p-f*(Fe+1))/Fe,k=(g-S-f*(Pe+1))/Pe;return{x:f+l%Fe*(A+f),y:S+f+Math.floor(l/Fe)*(k+f),w:A,h:k}}function bt(){let{ctx:l,w:p,h:g}=ce.card;Nn(l,p,g,56);let S=g*Xe;ce.btns=[];let f=S*.62,A=S*.56,k=p-44,F=(W,X)=>{let ee=k-f/2;l.beginPath(),l.arc(ee,A,f/2,0,Math.PI*2),l.fillStyle="rgba(255,255,255,0.06)",l.fill(),l.lineWidth=3,l.strokeStyle="rgba(255,255,255,0.16)",l.stroke(),Ci(l,W,ee,A,f*.62,kt,7),ce.btns.push({x0:k-f,x1:k,act:X}),k-=f+20};F("close",()=>vt()),ce.page+1<Ve()&&F("next",()=>{ce.page++,bt(),Rt(ce.gen)}),ce.page>0&&F("back",()=>{ce.page--,bt(),Rt(ce.gen)}),ce.path&&F("up",()=>{Ue(ce.up,"")}),l.font=`600 50px ${Vt}`;let Z=Tn(l,ce.title||"Your folders",k-220);if(_t(l,Z,56,A+18,50,kt,600,"left",Vt,"-0.01em"),Ve()>1){l.font=`600 50px ${Vt}`;let W=l.measureText(Z).width;_t(l,`${ce.page+1} / ${Ve()}`,56+W+28,A+16,34,tn,500)}if(ce.loading||ce.err||!ce.items.length){let W=ce.loading?"Opening\u2026":ce.err||"This folder is empty.";l.font=`500 46px ${an}`;let X=a.wrapLines(W,p*.7,ee=>l.measureText(ee).width);X.forEach((ee,ae)=>_t(l,ee,p/2,g*.55+(ae-(X.length-1)/2)*64,46,ce.err?Oa:tn,500,"center")),ce.card.update();return}ut().forEach((W,X)=>{let ee=Kt(X);l.save(),Zn(l,ee.x,ee.y,ee.w,ee.h,26),l.fillStyle="rgba(255,255,255,0.045)",l.fill(),l.clip();let ae=ce.thumbs.get(At(W));if(ae){let de=Math.max(ee.w/ae.width,ee.h/ae.height);l.drawImage(ae,ee.x+(ee.w-ae.width*de)/2,ee.y+(ee.h-ae.height*de)/2,ae.width*de,ae.height*de)}else Ci(l,W.dir?"folder":t.isPicture(W.name)?"photos":"doc",ee.x+ee.w/2,ee.y+ee.h*.42,Math.min(ee.w,ee.h)*.4,W.dir?kt:tn,4);let Te=l.createLinearGradient(0,ee.y+ee.h-92,0,ee.y+ee.h);Te.addColorStop(0,"rgba(10,12,18,0)"),Te.addColorStop(1,"rgba(10,12,18,0.86)"),l.fillStyle=Te,l.fillRect(ee.x,ee.y+ee.h-92,ee.w,92),l.font=`500 30px ${an}`,_t(l,Tn(l,W.name,ee.w-36),ee.x+18,ee.y+ee.h-20,30,kt,500),l.restore()}),ce.card.update()}async function Rt(l){for(let p of ut()){if(l!==ce.gen||!ce.open)return;let g=At(p);if(p.dir||!t.isPicture(p.name)||ce.thumbs.has(g)||ce.pending.has(g))continue;ce.pending.add(g);let S=null;try{S=await t.thumb(ce.path,p)}finally{l===ce.gen&&ce.pending.delete(g)}if(l!==ce.gen||!ce.open){S?.close?.();return}if(ce.thumbs.has(g)){S?.close?.();continue}ce.thumbs.set(g,S||null),S&&bt()}}function fn(){for(let l of ce.thumbs.values())l?.close?.();ce.thumbs.clear(),ce.pending.clear()}async function Ue(l,p){let g=++ce.gen;fn(),Object.assign(ce,{loading:!0,err:"",items:[],page:0,title:p||ce.title}),bt();let S;if(l)S=await t.pc.list(l);else{let f=await t.pc.roots();S=f.error?f:{path:"",up:"",items:f.roots.map(A=>({name:A.name,dir:!0,at:A.path}))}}return g!==ce.gen||!ce.open?"":(ce.loading=!1,S.error?(ce.err=S.error,bt(),S.error):(Object.assign(ce,{path:S.path,up:S.up,items:S.items}),p||(ce.title=S.path?String(S.path).split(/[\\/]/).filter(Boolean).slice(-2).join(" \u203A "):"Your folders"),bt(),Rt(g),""))}Se(ce.card.mesh,{tap:l=>{if(!l?.uv)return;let{w:p,h:g}=ce.card,S=l.uv.x*p,f=(1-l.uv.y)*g;if(f<g*Xe){ce.btns.find(F=>S>=F.x0&&S<=F.x1)?.act();return}if(ce.loading)return;let A=ut().findIndex((F,Z)=>{let W=Kt(Z);return S>=W.x&&S<=W.x+W.w&&f>=W.y&&f<=W.y+W.h}),k=ut()[A];k&&(k.dir?Ue(k.at||t.joinPath(ce.path,k.name),k.name):t.openPhoto(ce.path,k).then(F=>{F&&gt(F,12e3,!0)}))},scroll:l=>{let p=Math.max(0,Math.min(Ve()-1,ce.page+Math.sign(l)));p!==ce.page&&(ce.page=p,bt(),Rt(ce.gen))}});async function vn(l){if(!ce.open){let f=pt-(_e.open?.85:.05),A=1.15;ce.group.position.set(Oe.x-Math.sin(f)*A,Oe.y-.04,Oe.z-Math.cos(f)*A),Me(ce.group),w("files")}if(ce.open=!0,ce.group.visible=!0,!l)return Ue("","Your folders");let p=++ce.gen;Object.assign(ce,{loading:!0,err:""}),bt();let g=await t.pc.roots();if(!ce.open||p!==ce.gen)return"";if(g.error)return ce.loading=!1,ce.err=g.error,bt(),g.error;let S=g.roots.find(f=>String(f.name).toLowerCase()===l.toLowerCase());return S?Ue(S.path,S.name):(await Ue("","Your folders"),"I couldn't find a "+l+" folder on your PC, so here are all your folders.")}function vt(){ce.open=!1,ce.gen++,ce.group.visible=!1,fn(),C.userData.placed==="files"&&(_e.open?C.userData.placed="pc":re.open?C.userData.placed="web":J.open?C.userData.placed="holo":Zs())}let En=1,kn=.1,Kn=.62,Pi=5,re={group:new Xt,head:Zt(En,kn),body:Zt(En,Kn),handle:Zt(.3,.035),open:!1,gen:0,q:"",typed:"",mode:"",results:[],page:null,title:"",paras:[],first:0,line:0,next:null,history:[],more:!1,err:"",btns:[],rows:[]},Et=null;re.group.visible=!1,h.add(re.group),re.group.add(re.head.mesh,re.body.mesh,re.handle.mesh),re.head.mesh.position.set(0,Kn/2+.008+kn/2,0),re.handle.mesh.position.set(0,Kn/2+.016+kn+.02,0),u(re.head.tex),u(re.body.tex),u(re.handle.tex);{let{ctx:l,w:p,h:g}=re.handle;Zn(l,4,4,p-8,g-8,(g-8)/2),l.fillStyle="rgba(255,255,255,0.34)",l.fill(),re.handle.update()}Se(re.handle.mesh,{drag:()=>re.group});let oi=()=>re.mode==="reading"||re.mode==="page-loading"||re.mode==="page-error";function Dt(){let{ctx:l,w:p,h:g}=re.head;Nn(l,p,g,48);let S=g/2,f=g*.6;re.btns=[];let A=p-36,k=(Te,de)=>{let Je=A-f/2;l.beginPath(),l.arc(Je,S,f/2,0,Math.PI*2),l.fillStyle="rgba(255,255,255,0.06)",l.fill(),l.lineWidth=3,l.strokeStyle="rgba(255,255,255,0.16)",l.stroke(),Ci(l,Te,Je,S,f*.62,kt,7),re.btns.push({x0:A-f,x1:A,act:de}),A-=f+18};k("close",()=>Xa()),oi()&&k("back",kr);let F=30,Z=A-12-F,W=g*.66;Zn(l,F,S-W/2,Z,W,W/2),l.fillStyle="rgba(255,255,255,0.06)",l.fill(),l.lineWidth=3,l.strokeStyle=re.mode==="typing"||re.mode==="searching"?"rgba(94,234,212,0.75)":"rgba(255,255,255,0.16)",l.stroke(),Ci(l,"search",F+W*.58,S,W*.6,tn,7);let X=oi()?re.page?.site||"":re.typed;l.font=`500 40px ${an}`;let ee=Tn(l,X||"Search Google",Z-W*1.4-24),ae=F+W*1.1;_t(l,ee,ae,S+14,40,X?kt:tn,500),re.mode==="typing"&&(l.font=`500 40px ${an}`,l.fillStyle=wn,l.fillRect(ae+(X?l.measureText(ee).width:0)+6,S-22,4,44)),re.head.update()}function pi(){let{ctx:l,w:p,h:g}=re.body;Nn(l,p,g,48),re.rows=[];let S=56,f=(k,F=tn)=>{l.font=`500 44px ${an}`;let Z=a.wrapLines(k,p*.76,W=>l.measureText(W).width);Z.forEach((W,X)=>_t(l,W,p/2,g*.5+(X-(Z.length-1)/2)*62,44,F,500,"center"))},A=re.mode;if(A==="")f("Say \u201Csearch the web for\u2026\u201D and anything you want to know. I'll look it up right here.");else if(A==="typing")f("");else if(A==="searching")f("Searching Google\u2026");else if(A==="error"||A==="page-error")f(re.err,Oa);else if(A==="page-loading")f("Reading "+(re.page?.site||"the page")+"\u2026");else if(A==="results"){re.results.length||f("Google didn't return any pages for that. Try other words.");let k=(g-40)/Pi;re.results.slice(0,Pi).forEach((F,Z)=>{let W=20+Z*k;Z&&(l.fillStyle="rgba(255,255,255,0.08)",l.fillRect(S,W,p-S*2,2)),l.font=`600 40px ${Vt}`,_t(l,Tn(l,F.site,p-S*2),S,W+66,40,wn,600,"left",Vt),l.font=`500 34px ${an}`;let X=a.wrapLines(F.snippet||"Tap to read this page.",p-S*2,ee=>l.measureText(ee).width).slice(0,2);X.length===2&&(F.snippet||"").length>0&&a.wrapLines(F.snippet,p-S*2,ae=>l.measureText(ae).width).length>2&&(X[1]=Tn(l,X[1]+" \u2026",p-S*2)),X.forEach((ee,ae)=>_t(l,ee,S,W+122+ae*46,34,tn,500)),re.rows.push({y0:W,y1:W+k,r:F})})}else if(A==="reading"){l.font=`600 46px ${Vt}`;let k=a.wrapLines(re.title,p-S*2,X=>l.measureText(X).width).slice(0,2),F=30;for(let X of k)_t(l,X,S,F+=60,46,kt,600,"left",Vt);F+=30,l.font=`500 36px ${an}`;let Z=g-70;re.more=!1,re.next=null;e:for(let X=re.first;X<re.paras.length;X++){let ee=a.wrapLines(re.paras[X],p-S*2,ae=>l.measureText(ae).width);if(F+ee.length*50>Z&&X>re.first){re.next={first:X,line:0};break}for(let ae=X===re.first?re.line:0;ae<ee.length;ae++){if(F+50>Z){re.next={first:X,line:ae};break e}_t(l,ee[ae],S,F+=50,36,kt,500)}F+=20}re.more=!!re.next;let W=`${re.first+1} / ${re.paras.length}`+(re.more?"  \xB7  thumbstick or tap for more":"");_t(l,W,p-S,g-28,26,tn,500,"right")}re.body.update(),mc()}function Un(){Dt(),pi()}function kr(){re.gen++,re.mode="results",Un()}function Cs(l,p){let g=document.createElement("button");return g.type="button",g.textContent=l,Object.assign(g.style,{font:`600 14px ${an}`,color:kt,background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.12)",borderRadius:"999px",padding:"8px 14px",cursor:"pointer",whiteSpace:"normal"}),g.onclick=p,g}function mc(){if(!Et)return;let l=document.activeElement,p=Et.contains(l)?l.dataset.webAction:null;if(Et.replaceChildren(),Et.hidden=!re.open,!re.open)return;let g=(f,A,k,F=!1)=>{let Z=Cs(A,k);return Z.dataset.webAction=f,Z.disabled=F,Et.append(Z),Z};oi()&&g("back","Back to results",kr),re.mode==="results"&&re.results.slice(0,Pi).forEach((f,A)=>g("result-"+A,f.site||"Read result "+(A+1),()=>{eu(f)})),re.mode==="reading"&&(g("previous","Previous page",()=>Wa(-1),!re.history.length),g("next","Next page",()=>Wa(1),!re.more));let S=g("close","Close web",Xa);p&&([...Et.children].find(f=>f.dataset.webAction===p&&!f.disabled)||S).focus()}Se(re.head.mesh,{tap:l=>{if(!l?.uv)return;let p=l.uv.x*re.head.w;re.btns.find(g=>p>=g.x0&&p<=g.x1)?.act()},grab:()=>re.group}),Se(re.body.mesh,{tap:l=>{if(!l?.uv)return;let p=(1-l.uv.y)*re.body.h;if(re.mode==="results"){let g=re.rows.find(S=>p>=S.y0&&p<S.y1);g&&eu(g.r)}else re.mode==="reading"&&Wa(1)},scroll:l=>Wa(l),grab:()=>re.group});function Wa(l){if(re.mode!=="reading"||!l)return;let p=l>0?re.next:re.history.pop();p&&(l>0&&re.history.push({first:re.first,line:re.line}),Object.assign(re,p),pi())}let zr=new N;function wf(){C.userData.placed!==!0&&(re.group.updateWorldMatrix(!0,!1),zr.set(-En/2-.36,Kn/2-.02,.06),re.group.localToWorld(zr),Qn={x:zr.x,y:zr.y,z:zr.z},C.userData.placed="web")}function Tf(){if(!re.open){let l=pt-(_e.open||ce.open?.85:.08),p=1.2;re.group.position.set(Oe.x-Math.sin(l)*p,Oe.y-.02,Oe.z-Math.cos(l)*p),Me(re.group)}re.open=!0,re.group.visible=!0}function Af(l,p){return T?(re.typed=l,Dt(),Promise.resolve()):new Promise(g=>{let S=0,f=()=>{if(p!==re.gen||!re.open)return g();if(S=Math.min(l.length,S+(l.length>36?2:1)),re.typed=l.slice(0,S),Dt(),S>=l.length)return setTimeout(g,220);setTimeout(f,45+Math.random()*35)};f()})}async function Ef(l){l=String(l||"").trim(),Tf();let p=++re.gen;if(Object.assign(re,{q:l,typed:"",results:[],page:null,err:"",mode:l?"typing":""}),Un(),!l)return"What should I search for? Say search the web for, and what you want to know.";if(wf(),await Af(l,p),p!==re.gen||!re.open)return"";re.mode="searching",Un();let g;try{g=await t.search(l)}catch(S){g={error:String(S?.message||S)}}return p!==re.gen||!re.open?"":!g||g.error?(Object.assign(re,{mode:"error",err:g?.error||"The search didn't work."}),Un(),re.err):(Object.assign(re,{mode:"results",results:Array.isArray(g.results)?g.results:[]}),Un(),g.answer||(re.results.length?"Here's what Google found. Point at one and I'll read it to you.":"Google didn't find anything for that."))}async function eu(l){let p=++re.gen;Object.assign(re,{mode:"page-loading",page:l,paras:[],first:0,line:0,next:null,history:[],title:"",err:""}),Un();let g;try{g=await t.read(l,re.q)}catch(S){g={error:String(S?.message||S)}}if(!(p!==re.gen||!re.open)){if(!g||g.error){Object.assign(re,{mode:"page-error",err:g?.error||"I couldn't read that page."}),Un();return}Object.assign(re,{mode:"reading",title:g.title||l.site,paras:Array.isArray(g.paras)&&g.paras.length?g.paras:["That page gave me nothing to read."]}),Un(),t.speak?.(re.paras[0])}}function Xa(){re.open=!1,re.gen++,re.group.visible=!1,mc(),C.userData.placed==="web"&&(_e.open?(C.userData.placed=!1,w("pc")):J.open?(C.userData.placed=!1,w("holo")):Zs())}let on={teal:6220500,sky:8246268,violet:12891645,rose:16622767,amber:16569165,lime:12513892,white:15331063},Cf=l=>"#"+(on[l]??on.teal).toString(16).padStart(6,"0"),J={group:new Xt,stage:new Xt,open:!1,spec:null,nodes:[],links:[],bar:Zt(.86,.1),t0:0,focus:null,step:-1,building:null,btns:[],view:null},tu=()=>({spin:0,spinT:0,size:1,sizeT:1,turnT:null,ex:0,exT:0});J.view=tu(),J.group.visible=!1,J.group.add(J.stage,J.bar.mesh),J.bar.mesh.position.set(0,-.42,.02),h.add(J.group),u(J.bar.tex);let Ws=u(Mf()),Rf=u(new Ln(1,32,24)),Pf=u(new bi(1,1,1)),If=(()=>{let l=new fs(1,1),p=u(new Tr(l));return l.dispose(),p})(),nu={value:0};function Xs(l){return new dn({uniforms:{color:{value:new je(l)},opacity:{value:.82},time:nu},vertexShader:`varying vec3 vN; varying vec3 vV; varying float vY;
void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
  vY = (modelMatrix * vec4(position, 1.0)).y; gl_Position = projectionMatrix * mv; }`,fragmentShader:`uniform vec3 color; uniform float opacity; uniform float time; varying vec3 vN; varying vec3 vV; varying float vY;
void main(){ float rim = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.0);
  float lines = 0.8 + 0.2 * step(0.5, fract(vY * 150.0 - time * 0.9));
  gl_FragColor = vec4(color * (0.5 + rim * 1.5) * lines, opacity * (0.45 + rim * 0.55));
  #include <colorspace_fragment>
}`,transparent:!0,depthWrite:!1})}let wt={group:new Xt,rings:[],beam:null,dots:null,scan:null,scanT0:-1,speed:[]};{let l=S=>new rn({color:on.teal,transparent:!0,opacity:S,blending:Yt,depthWrite:!1,side:qn});for(let[S,f,A,k,F]of[[.985,1,.32,96,.25],[.7,.71,.24,96,-.4],[.4,.44,.14,6,.6]]){let Z=new ct(u(new ps(S,f,k)),u(l(A)));Z.rotation.x=-Math.PI/2,wt.group.add(Z),wt.rings.push(Z),wt.speed.push(F)}wt.beam=new ct(u(new di(.85,1,1,48,1,!0)),u(new dn({uniforms:{color:{value:new je(on.teal)},strength:{value:.14}},vertexShader:"varying float vY; void main(){ vY = position.y + 0.5; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`uniform vec3 color; uniform float strength; varying float vY;
void main(){ float a = strength * pow(1.0 - vY, 2.2); gl_FragColor = vec4(color * a, a);
  #include <colorspace_fragment>
}`,transparent:!0,blending:Yt,depthWrite:!1,side:qn}))),wt.beam.position.y=.5,wt.group.add(wt.beam);let p=70,g=new Float32Array(p*3);wt.rise=[];for(let S=0;S<p;S++){let f=Math.random()*Math.PI*2,A=Math.sqrt(Math.random())*.88;g.set([Math.cos(f)*A,Math.random(),Math.sin(f)*A],S*3),wt.rise.push(.05+Math.random()*.1)}wt.dots=new Fs(u(new Lt().setAttribute("position",new st(g,3))),u(new cs({color:on.teal,size:.006,transparent:!0,opacity:.75,blending:Yt,depthWrite:!1}))),wt.group.add(wt.dots),wt.scan=new ct(u(new ps(.95,1,96)),u(l(0))),wt.scan.rotation.x=-Math.PI/2,wt.group.add(wt.scan),wt.group.visible=!1,J.group.add(wt.group)}function Vr(l,p){let g=Math.max(.24,Math.min(.7,l));wt.group.scale.set(g,.68,g),wt.group.position.set(0,-.34,0),wt.group.visible=!0,wt.scanT0=p&&!T?performance.now():-1,wt.scan.material.opacity=0}function Lf(l,p){if(!wt.group.visible||T)return;wt.rings.forEach((S,f)=>{S.rotation.z+=l*wt.speed[f]});let g=wt.dots.geometry.attributes.position;for(let S=0;S<g.count;S++){let f=g.getY(S)+l*wt.rise[S];f>1&&(f-=1),g.setY(S,f)}if(g.needsUpdate=!0,wt.scanT0>=0){let S=(p-wt.scanT0)/1100;S>=1?(wt.scanT0=-1,wt.scan.material.opacity=0):(wt.scan.position.y=S,wt.scan.material.opacity=.9*Math.sin(Math.PI*S))}}function Gr(){zn.gen++;for(let l of J.nodes){for(let p of[l.mat,l.glow.material,l.label.mesh.material])p.dispose();l.label.tex.dispose(),l.label.mesh.geometry.dispose(),l.ring?.geometry.dispose(),l.ring?.material.dispose(),l.shell?.material.dispose(),et(l.body),et(l.label.mesh)}for(let l of J.links)l.line.geometry.dispose(),l.line.material.dispose(),l.pulse?.material.dispose();J.building&&(J.building.geometry.dispose(),J.building.material.dispose()),Of(),Vf(),Xf(),J.stage.clear(),J.nodes=[],J.links=[],J.building=null,J.view=tu(),J.stage.rotation.set(0,0,0),J.stage.scale.setScalar(1),J.stage.position.set(0,0,0)}function qa(){let l=pt-(_e.open?.9:0),p=1.35;J.group.position.set(Oe.x-Math.sin(l)*p,Oe.y+.02,Oe.z-Math.cos(l)*p),Me(J.group)}function qs(l){let{ctx:p,w:g,h:S}=J.bar;Nn(p,g,S,48);let f=S/2,A=S*.6;J.btns=[];let k=g-36,F=(ee,ae)=>{let Te=k-A/2;p.beginPath(),p.arc(Te,f,A/2,0,Math.PI*2),p.fillStyle="rgba(255,255,255,0.06)",p.fill(),p.lineWidth=3,p.strokeStyle="rgba(255,255,255,0.16)",p.stroke(),Ci(p,ee,Te,f,A*.62,kt,7),J.btns.push({x0:k-A,x1:k,act:ae}),k-=A+18};F("close",()=>gc());let Z=J.spec,W=Z?.steps?.length||0;Z&&W&&(J.step<W-1&&F("next",()=>t.holoStep?.(1)),J.step>0&&F("back",()=>t.holoStep?.(-1))),Ci(p,"holo",30+A/2,f,A*.7,wn,6);let X=30+A+16;if(p.font=`600 38px ${Vt}`,p.font=`600 44px ${Vt}`,_t(p,Tn(p,l||Z?.title||"",k-X-190),X,f+15,44,kt,600,"left",Vt),Z&&W){let ee=J.step<0?`${W} steps \xB7 say next`:`Step ${J.step+1} of ${W}`;_t(p,ee,k-8,f+12,32,tn,500,"right")}J.bar.update()}Se(J.bar.mesh,{tap:l=>{if(!l?.uv)return;let p=l.uv.x*J.bar.w;J.btns.find(g=>p>=g.x0&&p<=g.x1)?.act()},drag:()=>J.group});function Df(l){Gr(),J.spec=null,J.step=-1,J.focus=null,J.open||qa(),J.open=!0,J.group.visible=!0;let p=new ct(new ms(.16,.0025,8,96),new rn({color:on.teal,transparent:!0,opacity:.7,depthWrite:!1}));J.stage.add(p),J.building=p,Vr(.3,!1),qs("Building "+(l?"\u201C"+String(l).slice(0,48)+"\u201D":"a hologram")+"\u2026"),w("holo")}function Nf(l,p,g,S){let f=on[l.color]??on.teal,A=new Xt,k=g==="chart"?new rn({color:f,transparent:!0,opacity:.82,depthWrite:!0}):Xs(f),F,Z;g==="chart"?(F=new ct(Pf,k),Z=.04):(Z=g==="model"?.022+l.size*.016:g==="map"&&p===0?.055:.03,F=new ct(Rf,k),F.scale.setScalar(Z));let W=new Si(new ui({map:Ws,color:f,transparent:!0,opacity:.5,blending:Yt,depthWrite:!1}));W.scale.setScalar(Z*(g==="chart"?3:5.5));let X=g==="steps"||g==="map"&&p===0,ee=g==="model",ae=Zt(ee?.15:X?.26:.24,ee?.05:X?.13:.085);{let{ctx:it,w:ft,h:Pt}=ae;Nn(it,ft,Pt,30,{fill0:"rgba(16,19,27,0.82)",fill1:"rgba(10,12,18,0.86)"});let en=ee?-2:16,Ge=ee?"":g==="timeline"&&l.when?l.when:g==="steps"?String(p+1):g==="chart"&&Number.isFinite(l.value)?String(l.value)+(S.unit?" "+S.unit:""):"";if(Ge&&(_t(it,Ge,26,en+=34,30,Cf(l.color),700,"left",Vt),en+=4),it.font=`600 36px ${Vt}`,_t(it,Tn(it,l.label,ft-52),26,en+=40,36,kt,600,"left",Vt),l.note&&!ee){it.font=`500 26px ${an}`;let lt=a.wrapLines(l.note,ft-52,zt=>it.measureText(zt).width).slice(0,X?3:1);for(let zt of lt)_t(it,zt,26,en+=34,26,tn,500)}ae.update()}ae.mesh.material.opacity=1,A.add(F,W,ae.mesh);let Te=null;g!=="chart"&&(Te=new Us(If,new ii({color:f,transparent:!0,opacity:.3,blending:Yt,depthWrite:!1})),Te.scale.setScalar(Z*1.45),Te.rotation.set(p*.7,p*1.3,0),A.add(Te));let de={it:l,i:p,g:A,body:F,mat:k,glow:W,label:ae,shell:Te,r:Z,kind:g,base:new N,angle:0,speed:0,orbitR:0,parent:null,shown:0,emph:1},Je=()=>t.ask?.(`Tell me more about ${l.label}`+(S.title?`, in ${S.title}`:"")+".");return Se(F,{tap:Je,hover:it=>{de.hot=it},turn:()=>J.stage}),Se(ae.mesh,{tap:Je,hover:it=>{de.hot=it}}),de}function Uf(l,p){let g=p.length,S=(A,k)=>g>1?(A/(g-1)-.5)*k:0;if(l.kind==="model"){let A=p.filter(F=>F.it.orbit<0);A.forEach((F,Z)=>{F.base.set(A.length>1?(Z/(A.length-1)-.5)*Math.min(.95,.32*A.length):0,.02,0)});let k=new Map;for(let F of p)if(F.it.orbit>=0){let Z=p[F.it.orbit],W=k.get(Z)||0;k.set(Z,W+1),F.parent=Z,F.orbitR=Z.r+F.r+.07+W*.075,F.angle=W*2.1+.6,F.speed=.45/(1+W*.55);let X=[];for(let ee=0;ee<=64;ee++){let ae=ee/64*Math.PI*2;X.push(Math.cos(ae)*F.orbitR,Math.sin(ae)*F.orbitR*.22,Math.sin(ae)*F.orbitR*.85)}F.ring=new Fi(new Lt().setAttribute("position",new st(X,3)),new ii({color:on[Z.it.color]??on.teal,transparent:!0,opacity:.28,depthWrite:!1})),J.stage.add(F.ring)}for(let F of p)F.label.mesh.position.set(0,-(F.r+.06),.01)}else if(l.kind==="map"){p[0].base.set(0,.02,0),p[0].label.mesh.position.set(0,-.14,.01);let A=p.slice(1);A.forEach((k,F)=>{let Z=-Math.PI/2+(F+.5)/A.length*Math.PI*2;k.base.set(Math.cos(Z)*.46,Math.sin(Z)*.27+.02,.03+F%2*.05),k.label.mesh.position.set(0,-.075,.01)})}else if(l.kind==="steps")p.forEach((A,k)=>{let F=S(k,Math.min(1.1,.28*g));A.base.set(F,.13,.16*(1-(F/.6)**2)),A.label.mesh.position.set(0,-.12,.01)});else if(l.kind==="timeline"){p.forEach((F,Z)=>{F.base.set(S(Z,Math.min(1.15,.27*g)),0,0),F.label.mesh.position.set(0,Z%2?-.1:.1,.01)});let A=[-.62,0,0,.62,0,0],k=new Fi(new Lt().setAttribute("position",new st(A,3)),new ii({color:on.white,transparent:!0,opacity:.35,depthWrite:!1}));J.stage.add(k),J.links.push({line:k,a:null,b:null})}else if(l.kind==="chart"){let A=Math.max(...p.map(W=>Math.abs(W.it.value)||0),1e-9),k=p.some(W=>W.it.value<0),F=k?-.02:-.26,Z=k?.24:.46;p.forEach((W,X)=>{let ee=Number.isFinite(W.it.value)?W.it.value:0,ae=Math.max(.01,Z*Math.abs(ee)/A),Te=ee<0;W.body.scale.set(.075,ae,.075),W.base.set(S(X,Math.min(1.05,.22*g)),F+(Te?-ae/2:ae/2),0),W.glow.position.set(0,Te?-ae/2:ae/2,0),W.label.mesh.position.set(0,Te?ae/2+.06:-ae/2-.06,.05)})}let f=[];for(let A of p)for(let k of A.it.link)p[k]&&k!==A.i&&f.push([A,p[k]]);if(l.kind==="map"&&!f.length)for(let A of p.slice(1))f.push([p[0],A]);if(l.kind==="steps")for(let A=1;A<g;A++)f.push([p[A-1],p[A]]);for(let[A,k]of f){let F=new Fi(new Lt().setAttribute("position",new st([0,0,0,0,0,0],3)),new ii({color:on.teal,transparent:!0,opacity:0,depthWrite:!1}));J.stage.add(F);let Z=new Si(new ui({map:Ws,color:on[k.it.color]??on.teal,transparent:!0,opacity:0,blending:Yt,depthWrite:!1}));Z.scale.setScalar(.05),J.stage.add(Z),J.links.push({line:F,a:A,b:k,pulse:Z,off:J.links.length*.37})}}function Ff(l){if(Gr(),Hr(),J.spec=l,J.step=-1,J.focus=null,J.t0=performance.now(),J.open||qa(),J.open=!0,J.group.visible=!0,l.kind==="sketch"){Vr(Bf(l)+.06,!0),qs(),w("holo");return}J.nodes=l.items.map((g,S)=>Nf(g,S,l.kind,l));for(let g of J.nodes)J.stage.add(g.g);Uf(l,J.nodes);for(let g of J.nodes)g.g.position.copy(g.base),g.g.scale.setScalar(T?1:.001);let p=Math.max(.2,...J.nodes.map(g=>Math.abs(g.base.x)+g.r+(g.parent?g.orbitR+Math.abs(g.parent.base.x):0)));J.reach=p,Vr(p+.06,!0),qs(),w("holo")}let sn=.32,Fn={parts:[],made:[],turnables:[]};function Of(){for(let l of Fn.parts)l.label&&et(l.label.mesh);for(let l of Fn.made)try{l.dispose()}catch{}for(let l of Fn.turnables)et(l);Fn.parts=[],Fn.made=[],Fn.turnables=[]}function Bf(l){let p=A=>(Fn.made.push(A),A),g=A=>new N(A[0]*sn,A[1]*sn+.04,A[2]*sn),S=(A,k)=>{k==="x"?A.rotation.z=-Math.PI/2:k==="z"&&(A.rotation.x=Math.PI/2)},f=.2;return l.shapes.forEach((A,k)=>{let F=on[A.color]??on.teal,Z=new Xt,W=p(new rn({color:F,transparent:!0,opacity:.95,blending:Yt,depthWrite:!1})),X=null,ee=null,ae=null,Te=(Ge,lt=!1)=>{let zt=p(new _a(Ge,96,.0045,6,lt));ee=new ct(zt,W),Z.add(ee),X=Ge},de=g(A.center),Je=(Ge,lt,zt,yt=48)=>{let hn=[];for(let It=0;It<yt;It++){let mi=It/yt*Math.PI*2,Hn=Math.cos(mi)*lt,Wn=Math.sin(mi)*lt;hn.push(zt==="y"?new N(Ge.x+Hn,Ge.y,Ge.z+Wn):zt==="x"?new N(Ge.x,Ge.y+Hn,Ge.z+Wn):new N(Ge.x+Hn,Ge.y+Wn,Ge.z))}return new ds(hn,!0)};if(A.type==="line"||A.type==="arrow"){let Ge=new ma;for(let lt=1;lt<A.points.length;lt++)Ge.add(new wr(g(A.points[lt-1]),g(A.points[lt])));if(Te(Ge),A.type==="arrow"){let lt=g(A.points[A.points.length-1]),zt=g(A.points[A.points.length-2]),yt=new ct(p(new us(.016,.04,10)),W);yt.position.copy(lt),yt.quaternion.setFromUnitVectors(new N(0,1,0),lt.clone().sub(zt).normalize()),Z.add(yt)}}else if(A.type==="curve")Te(new ds(A.points.map(g)));else if(A.type==="circle")Te(Je(de,A.radius*sn,A.axis),!0);else if(A.type==="spiral"||A.type==="wave"){let Ge=[];for(let zt=0;zt<=120;zt++){let yt=zt/120;if(A.type==="spiral"){let hn=yt*A.turns*Math.PI*2,It=(yt-.5)*A.height*sn,mi=Math.cos(hn)*A.radius*sn,Hn=Math.sin(hn)*A.radius*sn;Ge.push(A.axis==="x"?new N(de.x+It,de.y+mi,de.z+Hn):A.axis==="z"?new N(de.x+mi,de.y+Hn,de.z+It):new N(de.x+mi,de.y+It,de.z+Hn))}else{let hn=(yt-.5)*2*A.radius*sn*2,It=Math.sin(yt*Math.PI*2*A.turns)*A.height*sn*.25;Ge.push(new N(de.x+hn,de.y+It,de.z))}}Te(new ds(Ge))}else{let Ge;A.type==="sphere"?Ge=new Ln(A.radius*sn,20,14):A.type==="cone"?Ge=new us(A.radius*sn,A.height*sn,20,1,!0):A.type==="cylinder"?Ge=new di(A.radius*sn,A.radius*sn,A.height*sn,20,1,!0):Ge=new bi(A.size[0]*sn,A.size[1]*sn,A.size[2]*sn),p(Ge);let lt=new ct(Ge,p(Xs(F)));lt.material.uniforms.opacity.value=.35;let zt=new Us(p(new Tr(Ge)),p(new ii({color:F,transparent:!0,opacity:.55,blending:Yt,depthWrite:!1}))),yt=new Xt;yt.add(lt,zt),ae={body:lt.material,wire:zt.material},S(yt,A.axis),yt.position.copy(de),Z.add(yt),A.flow&&(X=Je(de,(A.type==="box"?Math.max(A.size[0],A.size[2])/2:A.radius)*sn*1.08,A.axis==="y"?"y":A.axis==="x"?"x":"z"))}let it=[];if(A.flow&&X)for(let Ge=0;Ge<6;Ge++){let lt=new Si(p(new ui({map:Ws,color:F,transparent:!0,opacity:0,blending:Yt,depthWrite:!1})));lt.scale.setScalar(.04),Z.add(lt),it.push({sp:lt,off:Ge/6})}let ft=null;if(A.label){ft=Zt(.16,.045),p(ft.tex),p(ft.mesh.geometry),p(ft.mesh.material);let{ctx:Ge,w:lt,h:zt}=ft;Nn(Ge,lt,zt,26,{fill0:"rgba(16,19,27,0.82)",fill1:"rgba(10,12,18,0.86)"}),Ge.font=`600 34px ${Vt}`,_t(Ge,Tn(Ge,A.label,lt-40),20,zt/2+12,34,kt,600,"left",Vt),ft.update();let yt=X&&(A.type==="line"||A.type==="curve"||A.type==="arrow"||A.type==="spiral"||A.type==="wave")?X.getPointAt(.55,new N):de.clone().add(new N((A.type==="box"?A.size[0]/2:A.radius)*sn*.7,0,0)),hn=k%2?-1:1;ft.mesh.position.set(yt.x+hn*.1,yt.y,yt.z+.03),Z.add(ft.mesh),Se(ft.mesh,{tap:()=>t.ask?.(`Tell me more about the ${A.label}`+(l.title?`, in ${l.title}`:"")+".")})}Z.visible=T,J.stage.add(Z);let Pt=ee?ee.geometry.index.count:0;ee&&!T&&ee.geometry.setDrawRange(0,0),Fn.parts.push({s:A,i:k,g:Z,tube:ee,count:Pt,path:X,flows:it,label:ft,lineMat:W,solid:ae,emph:1});for(let Ge of[ee,ae&&Z.children.find(lt=>lt.isGroup)?.children[0]])Ge&&(Se(Ge,{turn:()=>J.stage}),Fn.turnables.push(Ge));let en=A.points.length?A.points:[A.center];for(let Ge of en)f=Math.max(f,Math.abs(Ge[0]*sn)+(A.type==="line"||A.type==="curve"||A.type==="arrow"?0:A.radius*sn))}),f}let iu=new N;function kf(l,p){let g=p-J.t0,S=Fn.parts.length;Fn.parts.forEach(f=>{let A=T?1:Math.max(0,Math.min(1,(g-250-f.i*(1600/Math.max(1,S)))/700));A>0&&(f.g.visible=!0),f.tube&&f.count&&f.tube.geometry.setDrawRange(0,Math.floor(f.count*A/3)*3),f.tube||f.g.scale.setScalar(Math.max(.001,1-(1-A)**3));let k=J.focus?J.focus.has(f.i)?1.15:.25:1;f.emph+=(k-f.emph)*Math.min(1,l*6);let F=f.s.pulse&&!T?.75+.25*Math.sin(p/380+f.i):1;if(f.lineMat.opacity=.95*Math.min(1,f.emph)*F,f.solid&&(f.solid.body.uniforms.opacity.value=.35*Math.min(1,f.emph)*F,f.solid.wire.opacity=.55*Math.min(1,f.emph)*F),f.label&&(f.label.mesh.material.opacity=Math.max(.3,Math.min(1,f.emph))),f.s.spin&&!T&&(f.g.rotation.y+=l*.35),f.path&&f.flows.length)for(let Z of f.flows){let W=T?Z.off:(p/2400+Z.off)%1;f.path.getPointAt(W,iu),Z.sp.position.copy(iu),Z.sp.material.opacity=A>=1?.9*Math.min(1,f.emph)*(T?.6:Math.sin(Math.PI*W)*.6+.4):0}})}let zn={card:null,gen:0};function Hr(){zn.gen++,zn.card&&(et(zn.card.mesh),J.group.remove(zn.card.mesh),zn.card.tex.dispose(),zn.card.mesh.geometry.dispose(),zn.card.mesh.material.dispose(),zn.card=null)}async function zf({url:l,title:p,note:g}){if(!J.open)return;let S=++zn.gen,f=new Image;f.crossOrigin="anonymous",f.src=l;try{await f.decode()}catch{return}if(!J.open||S!==zn.gen)return;Hr();let A=Zt(.34,.3,1024),{ctx:k,w:F,h:Z}=A;Nn(k,F,Z,36);let W=F-40,X=Z-150,ee=f.width/f.height,ae=W/X,Te=ee>ae?f.height*ae:f.width,de=ee>ae?f.height:f.width/ae;k.save(),Zn(k,20,20,W,X,22),k.clip(),k.drawImage(f,(f.width-Te)/2,(f.height-de)/2,Te,de,20,20,W,X),k.restore(),k.font=`600 40px ${Vt}`,_t(k,Tn(k,p,F-60),30,Z-82,40,kt,600,"left",Vt),k.font=`500 26px ${an}`,_t(k,Tn(k,(g?g+" \xB7 ":"")+"Photo: Wikipedia",F-60),30,Z-36,26,tn,500),A.update(),A.mesh.position.set(Math.max(.62,(J.reach||.4)+.26),.06,.04),A.mesh.rotation.y=-.35,J.group.add(A.mesh),zn.card=A,Se(A.mesh,{tap:()=>t.ask?.(`Tell me more about ${p}.`),drag:()=>J.group})}let cn={mesh:null,mark:null,made:[],credit:null};function Vf(){for(let l of cn.made)try{l.dispose()}catch{}cn.credit&&et(cn.credit.mesh),cn.turnable&&et(cn.turnable),Object.assign(cn,{mesh:null,mark:null,made:[],credit:null,turnable:null})}function Gf({title:l,map:p,rings:g,glow:S}){Gr(),Hr(),J.spec={title:l,kind:"globe",steps:[],items:[]},J.step=-1,J.focus=null,J.t0=performance.now(),J.open||qa(),J.open=!0,J.group.visible=!0;let f=X=>(cn.made.push(X),X),A=f(new va().setCrossOrigin("anonymous").load(p));A.colorSpace=mn,A.anisotropy=4;let k=.2,F=new ct(f(new Ln(k,64,40)),f(new rn({map:A})));F.position.set(0,.12,0),F.rotation.x=.41,J.stage.add(F);let Z=new Si(f(new ui({map:Ws,color:S?16757575:10475775,transparent:!0,opacity:S?.9:.35,blending:Yt,depthWrite:!1})));if(Z.scale.setScalar(k*(S?4.2:2.7)),Z.position.copy(F.position),J.stage.add(Z),g){let X=new ct(f(new ps(k*1.25,k*2.1,96)),f(new rn({color:14272416,transparent:!0,opacity:.55,side:qn,depthWrite:!1})));X.rotation.x=-Math.PI/2+.45,X.position.copy(F.position),J.stage.add(X)}let W=Zt(.26,.04);f(W.tex),f(W.mesh.geometry),f(W.mesh.material);{let{ctx:X,w:ee,h:ae}=W;Nn(X,ee,ae,22,{fill0:"rgba(16,19,27,0.7)",fill1:"rgba(10,12,18,0.75)"}),_t(X,"Map: Solar System Scope \xB7 CC BY 4.0",20,ae/2+9,26,tn,500),W.update()}W.mesh.position.set(0,-.15,.05),J.stage.add(W.mesh),cn.mesh=F,cn.credit=W,Se(F,{turn:()=>J.stage,tap:()=>t.ask?.("Tell me something amazing about "+l+".")}),cn.turnable=F,J.reach=k*(g?2.1:1.3),Vr(J.reach+.06,!0),qs(),w("holo")}function Hf(l,p){if(!cn.mesh)return;let g=.2*1.01,S=(Number(p)+180)/360*Math.PI*2,f=(90-Number(l))/180*Math.PI;if(!cn.mark){let A=new Si(new ui({map:Ws,color:16734810,transparent:!0,opacity:1,blending:Yt,depthWrite:!1}));cn.made.push(A.material),A.scale.setScalar(.08),cn.mesh.add(A),cn.mark=A}cn.mark.position.set(-g*Math.cos(S)*Math.sin(f),g*Math.cos(f),g*Math.sin(S)*Math.sin(f))}function Wf(l,p){cn.mesh&&(T||(cn.mesh.rotation.y+=l*.12),cn.mark&&!T&&cn.mark.scale.setScalar(.07+.03*Math.abs(Math.sin(p/300))))}let Vn=-.22,ji=.36,Gn=.34,jt={spec:null,made:[],st:null,card:null,readAt:0,parts:null};function Xf(){for(let l of jt.made)try{l.dispose()}catch{}jt.card&&et(jt.card.mesh),Object.assign(jt,{spec:null,made:[],st:null,card:null,readAt:0,parts:null})}let pn=l=>(jt.made.push(l),l);function Qi(l,p){let g=new Xt,S=new ct(pn(new Ln(p,20,14)),pn(Xs(l)));S.material.uniforms.opacity.value=.95;let f=new Si(pn(new ui({map:Ws,color:l,transparent:!0,opacity:.8,blending:Yt,depthWrite:!1})));return f.scale.setScalar(p*5),g.add(S,f),g}function li(l,p,g=.9){let S=pn(new Lt().setAttribute("position",new st(new Float32Array(l*3),3))),f=S.attributes.position.array;S.setDrawRange(0,0);let A=new Fi(S,pn(new ii({color:p,transparent:!0,opacity:g,blending:Yt,depthWrite:!1})));return A.frustumCulled=!1,{line:A,pos:f,geo:S,n:l,used:0,set(k,F,Z,W=0){f[k*3]=F,f[k*3+1]=Z,f[k*3+2]=W},draw(k){this.used=k,S.setDrawRange(0,k),S.attributes.position.needsUpdate=!0},push(k,F,Z=0){this.used>=l&&(f.copyWithin(0,3),this.used=l-1),this.set(this.used,k,F,Z),this.draw(this.used+1)},clear(){this.draw(0)}}}function Ya(l){let p=li(2,on.white,.35);if(p.set(0,-Gn,Vn),p.set(1,Gn,Vn),p.draw(2),J.stage.add(p.line),!l)return;let g=Zt(.16,.036);pn(g.tex),pn(g.mesh.geometry),pn(g.mesh.material),_t(g.ctx,l,g.w-8,g.h/2+10,30,tn,500,"right"),g.update(),g.mesh.position.set(Gn-.08,Vn-.025,.01),J.stage.add(g.mesh)}let Qt=(l,p)=>Number.isFinite(l)?(Math.abs(l)>=100?Math.round(l):Math.abs(l)>=10?l.toFixed(1):l.toFixed(2))+(p?" "+p:""):"\u2014";function su(l){let p=jt.card;if(!p)return;let{ctx:g,w:S,h:f}=p;Nn(g,S,f,30,{fill0:"rgba(16,19,27,0.86)",fill1:"rgba(10,12,18,0.9)"}),_t(g,Tn(g,l[0],S-60),30,58,40,wn,600,"left",Vt),g.font=`500 34px ${an}`,_t(g,Tn(g,l[1]||"",S-60),30,112,34,kt,500),p.update()}function qf(l,p){Gr(),Hr(),J.spec={title:l.title,kind:"sim",steps:[],items:[]},J.step=-1,J.focus=null,J.t0=performance.now(),J.open||qa(),J.open=!0,J.group.visible=!0,jt.spec=l;let g=Zt(.6,.06);pn(g.tex),pn(g.mesh.geometry),pn(g.mesh.material),g.mesh.position.set(0,Vn-.085,.04),J.stage.add(g.mesh),jt.card=g,Se(g.mesh,{tap:()=>t.ask?.("Explain why the "+l.type+" moves like that, simply.")});let S=l.g,f=on.teal,A=on.amber,k=on.sky,F=on.white,Z={};if(l.type==="pendulum"){let W=new N(0,ji,0),X=ji-Vn-.08,ee=new ct(pn(new di(.0032,.0032,1,8)),pn(new rn({color:F,transparent:!0,opacity:.85,blending:Yt,depthWrite:!1}))),ae=li(90,f,.55),Te=li(49,F,.18),de=l.angle*Math.PI/180;for(let ft=0;ft<=48;ft++){let Pt=-de+2*de*ft/48;Te.set(ft,Math.sin(Pt)*X,ji-Math.cos(Pt)*X)}Te.draw(49);let Je=Qi(f,.026),it=Qi(F,.008);it.position.copy(W),J.stage.add(ee,ae.line,Te.line,Je,it),Object.assign(Z,{pivot:W,Ld:X,bar:ee,trail:ae,bob:Je}),jt.st={th:de,w:0,t:0,lastCross:-1,period:NaN,dir:0},Ya("")}else if(l.type==="projectile"){let W=l.angle*Math.PI/180,X=l.speed,ee=S>0?X*X*Math.sin(2*W)/S:X*3,ae=S>0?X*X*Math.sin(W)**2/(2*S):X*3*Math.sin(W),Te=0,de=0;if(p?.type==="projectile"&&p.g>0){let yt=p.angle*Math.PI/180;Te=p.speed**2*Math.sin(2*yt)/p.g,de=p.speed**2*Math.sin(yt)**2/(2*p.g)}let Je=Math.min((2*Gn-.04)/Math.max(ee,Te,.5),(ji-Vn-.04)/Math.max(ae,de,.25)),it=-Gn+.02,ft=(yt,hn,It)=>{let mi=yt.g>0?2*yt.speed*Math.sin(yt.angle*Math.PI/180)/yt.g:3;for(let Hn=0;Hn<It;Hn++){let Wn=mi*Hn/(It-1),$s=yt.angle*Math.PI/180;hn.set(Hn,it+yt.speed*Math.cos($s)*Wn*Je,Vn+(yt.speed*Math.sin($s)*Wn-yt.g*Wn*Wn/2)*Je)}hn.draw(It)},Pt=li(64,F,.16);if(ft(l,Pt,64),J.stage.add(Pt.line),Te){let yt=li(64,k,.28);ft(p,yt,64),J.stage.add(yt.line)}let en=Qi(A,.016),Ge=li(200,A,.85),lt=li(2,f,.9),zt=Qi(f,.009);zt.visible=!1,J.stage.add(en,Ge.line,lt.line,zt),Object.assign(Z,{scale:Je,x0:it,th:W,v:X,ball:en,trail:Ge,arrow:lt,mark:zt,R:ee}),jt.st={t:0,rest:0},Ya(Qt(2*Gn/Je,"m"))}else if(l.type==="drop"){let W=(ji-Vn-.04)/l.length,X=Vn+l.length*W,ee=Qi(A,.02);ee.position.set(l.feather?-.09:0,X,0),J.stage.add(ee);let ae=null;if(l.feather){ae=new Xt;let de=new ct(pn(new Ln(1,16,10)),pn(Xs(F)));de.scale.set(.011,.034,.004),ae.add(de),ae.position.set(.09,X,0),J.stage.add(ae)}let Te=li(2,F,.25);Te.set(0,-Gn+.03,Vn),Te.set(1,-Gn+.03,X),Te.draw(2),J.stage.add(Te.line),Object.assign(Z,{scale:W,top:X,hammer:ee,feather:ae}),jt.st={t:0,y:l.length,v:0,fy:l.length,fv:0,landed:-1,fLanded:-1,rest:0},Ya(Qt(l.length,"m")+" drop")}else if(l.type==="orbit"){let W=new ct(pn(new Ln(.05,32,20)),pn(Xs(k)));W.position.set(0,.07,0);let X=.13,ee=6,ae=2*Math.PI*X/ee,Te=ae*ae*X,de=Qi(F,.014),Je=li(420,f,.6);J.stage.add(W,de,Je.line),Object.assign(Z,{planet:W,moon:de,trail:Je,GM:Te,r0:X}),jt.st={x:X,y:0,vx:0,vy:ae*l.rate,t:0,rest:0}}else if(l.type==="spring"){let W=ji,X=.06,ee=li(160,f,.85),ae=li(2,F,.6);ae.set(0,-.06,W),ae.set(1,.06,W),ae.draw(2);let Te=new ct(pn(new bi(.06,.05,.06)),pn(Xs(A)));J.stage.add(ee.line,ae.line,Te);let de=20,Je=Math.sqrt(de/l.mass);Object.assign(Z,{top:W,rest:X,coil:ee,box:Te,omega:Je}),jt.st={t:0},Ya("")}else if(l.type==="wave"){let X=li(96,f,.9),ee=[];for(let Te=0;Te<16;Te++){let de=Qi(Te===7?A:F,Te===7?.011:.006);ee.push(de),J.stage.add(de)}let ae=Qi(f,.012);J.stage.add(X.line,ae),Object.assign(Z,{n:96,line:X,beads:ee,crest:ae,perM:2*Gn/2}),jt.st={t:0}}jt.parts=Z,J.reach=Gn,Vr(Gn+.06,!0),qs(),w("holo"),su([l.title,"\u2026"])}function Yf(l,p){let g=jt.spec,S=jt.parts,f=jt.st;if(!g||!S||!f)return;l=Math.min(l,.05);let A=g.g,k=null;if(g.type==="pendulum"){let F=g.length;for(let X=0;X<4;X++){let ee=l/4,ae=f.th;f.w+=-(A/F)*Math.sin(f.th)*ee,f.th+=f.w*ee,f.t+=ee,ae<0&&f.th>=0&&(f.lastCross>=0&&(f.period=f.t-f.lastCross),f.lastCross=f.t)}let Z=Math.sin(f.th)*S.Ld,W=ji-Math.cos(f.th)*S.Ld;S.bob.position.set(Z,W,0),S.bar.position.set(Z/2,(ji+W)/2,0),S.bar.scale.set(1,S.Ld,1),S.bar.rotation.z=f.th,S.trail.push(Z,W),S.trail.used>40&&(S.trail.pos.copyWithin(0,3),S.trail.draw(40)),k=()=>[A>0?"T = 2\u03C0\u221A(L/g) \u2248 "+Qt(2*Math.PI*Math.sqrt(F/A),"s"):"No gravity: no swing","angle "+Math.round(f.th*180/Math.PI)+"\xB0   speed "+Qt(Math.abs(f.w)*F,"m/s")+"   measured swing "+(Number.isFinite(f.period)?Qt(f.period,"s"):"\u2026")]}else if(g.type==="projectile"){if(f.rest>0)f.rest-=l,f.rest<=0&&(f.t=0,S.trail.clear(),S.mark.visible=!1);else{f.t+=l;let F=S.v*Math.cos(S.th)*f.t,Z=S.v*Math.sin(S.th)*f.t-A*f.t*f.t/2,W=A>0?2*S.v*Math.sin(S.th)/A:3;f.t>=W&&(f.t=W,F=S.v*Math.cos(S.th)*W,Z=A>0?0:Z,f.rest=1.6,S.mark.visible=A>0,S.mark.position.set(S.x0+F*S.scale,Vn,0)),S.ball.position.set(S.x0+F*S.scale,Vn+Math.max(0,Z)*S.scale,0),S.trail.push(S.ball.position.x,S.ball.position.y);let X=S.v*Math.cos(S.th),ee=S.v*Math.sin(S.th)-A*f.t,ae=.06/Math.max(1,S.v);S.arrow.set(0,S.ball.position.x,S.ball.position.y),S.arrow.set(1,S.ball.position.x+X*ae,S.ball.position.y+ee*ae),S.arrow.draw(2),f.x=F,f.y=Math.max(0,Z),f.sp=Math.hypot(X,ee)}k=()=>["range = v\xB2\xB7sin 2\u03B8 / g = "+Qt(S.R,"m"),"time "+Qt(f.t,"s")+"   height "+Qt(f.y??0,"m")+"   distance "+Qt(f.x??0,"m")+"   speed "+Qt(f.sp??g.speed,"m/s")]}else if(g.type==="drop")f.rest>0?(f.rest-=l,f.rest<=0&&Object.assign(f,{t:0,y:g.length,v:0,fy:g.length,fv:0,landed:-1,fLanded:-1})):A>0&&(f.t+=l,f.landed<0&&(f.v+=A*l,f.y-=f.v*l,f.y<=0&&(f.y=0,f.landed=f.t)),S.feather&&f.fLanded<0&&(f.fv+=(g.air?A*(1-f.fv*f.fv/(.5*.5)):A)*l,f.fy-=f.fv*l,f.fy<=0&&(f.fy=0,f.fLanded=f.t)),f.landed>=0&&(!S.feather||f.fLanded>=0||f.t-f.landed>6)&&(f.rest=2)),S.hammer.position.y=Vn+f.y*S.scale+.02,S.feather&&(S.feather.position.y=Vn+f.fy*S.scale+.02,S.feather.position.x=.09+(g.air&&f.fLanded<0?Math.sin(f.t*3)*.02:0),S.feather.rotation.z=g.air&&f.fLanded<0?Math.sin(f.t*3)*.5:0),k=()=>[A>0?"t = \u221A(2h/g) = "+Qt(Math.sqrt(2*g.length/A),"s"):"No gravity: nothing falls","time "+Qt(f.landed>=0?f.landed:f.t,"s")+"   fallen "+Qt(g.length-f.y,"m")+"   speed "+Qt(f.landed>=0?Math.sqrt(2*A*g.length):f.v,"m/s")+(S.feather?"   feather "+(f.fLanded>=0?"landed at "+Qt(f.fLanded,"s"):Qt(g.length-f.fy,"m")+" down"):"")];else if(g.type==="orbit"){if(f.rest>0)f.rest-=l,f.rest<=0&&(Object.assign(f,{x:S.r0,y:0,vx:0,vy:Math.sqrt(S.GM/S.r0)*g.rate,t:0}),S.trail.clear(),S.moon.visible=!0);else{for(let Z=0;Z<8;Z++){let W=l/8,X=Math.hypot(f.x,f.y),ee=-S.GM/(X*X*X);f.vx+=.5*ee*f.x*W,f.vy+=.5*ee*f.y*W,f.x+=f.vx*W,f.y+=f.vy*W;let ae=Math.hypot(f.x,f.y),Te=-S.GM/(ae*ae*ae);f.vx+=.5*Te*f.x*W,f.vy+=.5*Te*f.y*W}f.t+=l;let F=Math.hypot(f.x,f.y);(F<.055||F>.9)&&(f.rest=1.2,S.moon.visible=!1),S.moon.position.set(f.x,.07+f.y,0),S.trail.push(f.x,.07+f.y)}k=()=>{let F=Math.hypot(f.x,f.y),Z=Math.hypot(f.vx,f.vy),W=Math.sqrt(2*S.GM/Math.max(F,.001));return["gravity pulls in \xB7 speed carries it round","speed "+Qt(g.rate,"\xD7")+" a circle's   "+(Z>=W?"escaping":g.rate>1.02||g.rate<.98?"an ellipse":"a circle")+"   distance "+Qt(F/S.r0,"\xD7")]}}else if(g.type==="spring"){f.t+=l;let F=.07,Z=S.top-.2,W=Z+F*Math.cos(S.omega*f.t);S.box.position.set(0,W-.025,0);let X=S.coil.n,ee=12;for(let ae=0;ae<X;ae++){let Te=ae/(X-1),de=Te*ee*Math.PI*2,Je=S.top+(W-S.top)*Te,it=Te<.04||Te>.96?0:1;S.coil.set(ae,Math.cos(de)*.025*it,Je,Math.sin(de)*.025*it)}S.coil.draw(X),k=()=>["T = 2\u03C0\u221A(m/k) = "+Qt(2*Math.PI/S.omega,"s"),"mass "+Qt(g.mass,"kg")+"   spring 20 N/m   speed "+Qt(Math.abs(F*S.omega*Math.sin(S.omega*f.t))*1,"m/s")+"   gravity doesn't change the pace"]}else if(g.type==="wave"){f.t+=l;let F=g.rate,Z=1/F,W=2*Math.PI/Z,X=2*Math.PI*F,ee=.06,ae=.07;for(let de=0;de<S.n;de++){let Je=de/(S.n-1)*2;S.line.set(de,-Gn+Je*S.perM,ae+ee*Math.sin(W*Je-X*f.t))}S.line.draw(S.n),S.beads.forEach((de,Je)=>{let it=Je/15*2;de.position.set(-Gn+it*S.perM,ae+ee*Math.sin(W*it-X*f.t),0)});let Te=((X*f.t/W+Z/4)%2+2)%2;S.crest.position.set(-Gn+Te*S.perM,ae+ee+.02,0),k=()=>["speed = frequency \xD7 wavelength = 1 m/s","frequency "+Qt(F,"Hz")+"   wavelength "+Qt(Z,"m")+"   the gold bead only moves up and down"]}k&&p-jt.readAt>160&&(jt.readAt=p,su(k()))}function ru(l){return{obj:l,yaw0:l.rotation.y,vel:0,lastYaw:l.rotation.y,lastT:performance.now()}}let au=new N;function Zf(l,p,g){let S=l.turn;au.set(1,0,0).applyQuaternion(J.group.quaternion);let f=S.yaw0+p.clone().sub(l.start).dot(au)*7,A=Math.max(1,g-S.lastT)/1e3;S.vel=S.vel*.6+(f-S.lastYaw)/A*.4,S.lastYaw=f,S.lastT=g,S.obj.rotation.y=f,J.view.spin=0,J.view.turnT=null}function $f(l){let p=J.view,g=J.stage;if(p.size+=(p.sizeT-p.size)*Math.min(1,l*5),g.scale.setScalar(p.size),g.position.y=(p.size-1)*.12,p.spin+=(p.spinT-p.spin)*Math.min(1,l*1.2),Math.abs(p.spin)>.001&&(g.rotation.y+=l*p.spin),p.turnT!=null){let S=p.turnT-g.rotation.y;g.rotation.y+=S*Math.min(1,l*3.5),Math.abs(S)<.003&&(g.rotation.y=p.turnT,p.turnT=null)}p.ex+=(p.exT-p.ex)*Math.min(1,l*(T?20:3)),zn.card&&(zn.card.mesh.position.x=Math.max(.62,((J.reach||.4)+p.ex*.2)*p.size+.26))}function Jf(){let l=(S,f)=>{let A=S.clone();return A.length()<.02&&A.set(Math.cos(f*2.4),.35,Math.sin(f*2.4)),A.normalize().add(new N(0,.3*Math.sin(f*2.4+1),.55*Math.cos(f*2.4))),A.y=Math.max(-.2,A.y),A.normalize()};if(J.spec?.kind==="sketch"){if(Fn.parts.length<2)return!1;let S=new N,f=Fn.parts.map(A=>new N(...A.s.points.length?A.s.points.reduce((k,F)=>[k[0]+F[0]/A.s.points.length,k[1]+F[1]/A.s.points.length,k[2]+F[2]/A.s.points.length],[0,0,0]):A.s.center));return f.forEach(A=>S.add(A)),S.multiplyScalar(1/f.length),Fn.parts.forEach((A,k)=>{A.exDir=l(f[k].sub(S),k)}),!0}let p=J.nodes.filter(S=>!S.parent);if(p.length<2||!["model","map"].includes(J.spec?.kind))return!1;let g=new N;return p.forEach(S=>g.add(S.base)),g.multiplyScalar(1/p.length),p.forEach(S=>{S.exDir=l(S.base.clone().sub(g),S.i)}),!0}function Kf(l){if(!J.open||!J.spec)return"";let p=J.view;return l==="spin"?(p.spinT=.7,p.turnT=null,"spin"):l==="still"?(p.spinT=0,p.spin=0,"still"):l==="around"?(p.spinT=0,p.spin=0,p.turnT=J.stage.rotation.y+Math.PI,"around"):l==="bigger"?(p.sizeT=Math.min(2.4,p.sizeT*1.4),p.sizeT>=2.4?"biggest":"bigger"):l==="smaller"?(p.sizeT=Math.max(.45,p.sizeT/1.4),p.sizeT<=.45?"smallest":"smaller"):l==="apart"?Jf()?(p.exT=1,"apart"):"no-parts":l==="together"?(p.exT=0,"together"):""}function jf(l,p){J.step=p??J.step,J.focus=Array.isArray(l)&&l.length?new Set(l):null,qs()}function gc(){Gr(),Hr(),wt.group.visible=!1,J.open=!1,J.spec=null,J.group.visible=!1,t.holoClosed?.(),C.userData.placed==="holo"&&(_e.open?(C.userData.placed=!1,w("pc")):Zs())}let On={group:null,sky:null,parts:null,dots:null,kind:"none",made:[],t0:0,spec:null};function _c(){if(!On.group)return!1;h.remove(On.group);for(let l of On.made)try{l.dispose()}catch{}return Object.assign(On,{group:null,sky:null,parts:null,dots:null,made:[],spec:null}),!0}function Qf(l){_c();let p=de=>(On.made.push(de),de),g=de=>new je(de),S=new Xt;S.position.set(Oe.x,Ee,Oe.z),S.rotation.y=pt;let f=new ct(p(new Ln(36,48,24)),p(new dn({side:Sn,transparent:!0,depthWrite:!0,uniforms:{top:{value:g(l.sky.top)},mid:{value:g(l.sky.horizon)},low:{value:g(l.sky.bottom)},fade:{value:T?1:0}},vertexShader:"varying vec3 vW; void main(){ vW = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`uniform vec3 top; uniform vec3 mid; uniform vec3 low; uniform float fade; varying vec3 vW;
void main(){ float h = vW.y; vec3 c = h < 0.0 ? mix(mid, low, clamp(-h * 3.0, 0.0, 1.0)) : mix(mid, top, clamp(pow(h, 0.7) * 1.3, 0.0, 1.0));
  gl_FragColor = vec4(c, fade);
  #include <colorspace_fragment>
}`})));f.renderOrder=-9,S.add(f);let A=new Ma(g(l.sky.top),g(l.ground.color),1.1),k=new ba(g(l.light),1.4);k.position.set(6,10,4),S.add(A,k);let F=l.ground.kind;if(F!=="none"){let de;if(F==="dunes"||F==="rock"||F==="snow"){de=new Oi(68,68,64,64);let ft=de.attributes.position;for(let Pt=0;Pt<ft.count;Pt++){let en=ft.getX(Pt),Ge=ft.getY(Pt),lt=Math.hypot(en,Ge),zt=F==="dunes"?.55:F==="rock"?.35:.2;ft.setZ(Pt,lt<3?0:zt*Math.min(1,(lt-3)/6)*(Math.sin(en*.45)*Math.cos(Ge*.38)+.5*Math.sin((en+Ge)*.9)))}de.computeVertexNormals()}else de=new Bs(34,72);p(de);let Je=p(F==="water"?new $i({color:g(l.ground.color),transparent:!0,opacity:.92,emissive:g(l.ground.color),emissiveIntensity:.25}):F==="clouds"?new $i({color:g(l.ground.color),transparent:!0,opacity:.85}):new $i({color:g(l.ground.color),flatShading:F!=="grass"&&F!=="grid"})),it=new ct(de,Je);if(it.rotation.x=-Math.PI/2,it.position.y=F==="clouds"?-.4:.002,it.renderOrder=-8,S.add(it),F==="grid"){let ft=[];for(let Pt=-30;Pt<=30;Pt+=1.5)ft.push(Pt,.01,-30,Pt,.01,30,-30,.01,Pt,30,.01,Pt);S.add(new Us(p(new Lt().setAttribute("position",new st(ft,3))),p(new ii({color:g(l.light),transparent:!0,opacity:.55}))))}}let Z=new Xt,W={},X=(de,Je)=>W[de]||(W[de]=p(Je())),ee={near:[4,9],mid:[9,17],far:[18,30]};for(let de of l.shapes){let Je=p(new $i({color:g(de.color),flatShading:!0})),it=p(new rn({color:g(de.color)})),ft=p(new $i({color:g(de.color).multiplyScalar(.35),flatShading:!0})),Pt=de.kind==="mountain"?ee.far:de.kind==="planet"||de.kind==="moon"?[22,30]:ee[de.spread];for(let en=0;en<de.count;en++){let Ge=en/de.count*Math.PI*2+Math.random()*.9,lt=Pt[0]+Math.random()*(Pt[1]-Pt[0]);Math.abs(Math.atan2(Math.sin(Ge),Math.cos(Ge)))<.65&&lt<12&&de.kind!=="lantern"&&(lt+=7);let yt=de.size*(.75+Math.random()*.5),hn=new Xt,It=(Wn,$s,Mc=0,fp=1,pp=1,mp=1)=>{let Ka=new ct(Wn,$s);return Ka.position.y=Mc,Ka.scale.set(fp,pp,mp),hn.add(Ka),Ka};if(de.kind==="tree")It(X("trunk",()=>new di(.06,.09,.7,6)),ft,.35),It(X("blob",()=>new fs(.45,0)),Je,.95);else if(de.kind==="pine")It(X("trunk",()=>new di(.06,.09,.7,6)),ft,.3),It(X("cone",()=>new us(.42,1.3,7)),Je,1.05);else if(de.kind==="palm")It(X("stem",()=>new di(.04,.07,1.9,6)),ft,.95),It(X("blob",()=>new fs(.45,0)),Je,1.95,1.4,.35,1.4);else if(de.kind==="rock")It(X("rock",()=>new da(.4,0)),Je,.15,1,.6,1);else if(de.kind==="crystal")It(X("crystal",()=>new ga(.3,0)),it,.7,.8,2.3,.8);else if(de.kind==="pillar")It(X("pillar",()=>new di(.25,.3,3,10)),Je,1.5);else if(de.kind==="tower")It(X("tower",()=>new bi(1,6,1)),Je,3);else if(de.kind==="mountain")It(X("mountain",()=>new us(6,8,7)),Je,4);else if(de.kind==="arch")It(X("arch",()=>new ms(1.2,.15,8,24,Math.PI)),Je,0);else if(de.kind==="lantern")It(X("lantern",()=>new Ln(.12,12,8)),it,1.3);else if(de.kind==="cloud"){let Wn=X("puff",()=>new fs(.7,1));It(Wn,Je,0,1.4,.8,1);let $s=It(Wn,Je,.15,1,.7,1);$s.position.x=.9;let Mc=It(Wn,Je,.1,1.1,.75,1);Mc.position.x=-.9}else(de.kind==="planet"||de.kind==="moon")&&It(X(de.kind,()=>new Ln(de.kind==="planet"?3:1.5,32,20)),de.kind==="moon"?it:Je,0);hn.scale.setScalar(yt);let mi=de.kind==="planet"||de.kind==="moon"?10+Math.random()*10:de.kind==="cloud"?6+Math.random()*5:0,Hn=de.float&&mi===0?.8+Math.random()*2.5:0;hn.position.set(Math.sin(Ge)*lt,mi+Hn,-Math.cos(Ge)*lt),hn.rotation.y=Math.random()*Math.PI*2,hn.userData={bob:de.float||de.kind==="cloud"||de.kind==="lantern"?Math.random()*6:-1,y:hn.position.y},Z.add(hn)}}T||Z.scale.setScalar(.001),S.add(Z);let ae=l.particles.kind,Te=null;if(ae!=="none"){let de=Math.round(ae==="stars"?500+700*l.particles.amount:150+900*l.particles.amount),Je=new Float32Array(de*3),it=new Float32Array(de);for(let Pt=0;Pt<de;Pt++){if(ae==="stars"){let en=Math.random()*Math.PI*2,Ge=Math.random()*.9+.08,lt=33;Je.set([Math.cos(en)*Math.sqrt(1-Ge*Ge)*lt,Ge*lt,Math.sin(en)*Math.sqrt(1-Ge*Ge)*lt],Pt*3)}else{let en=Math.random()*Math.PI*2,Ge=1.2+Math.sqrt(Math.random())*13;Je.set([Math.cos(en)*Ge,Math.random()*9,Math.sin(en)*Ge],Pt*3)}it[Pt]=Math.random()*100}let ft={stars:.09,snow:.05,rain:.03,fireflies:.07,embers:.05,bubbles:.08,petals:.06,dust:.03}[ae];Te=new Fs(p(new Lt().setAttribute("position",new st(Je,3))),p(new cs({color:g(l.particles.color),size:ft,transparent:!0,opacity:ae==="dust"?.5:.9,depthWrite:!1,blending:ae==="fireflies"||ae==="embers"||ae==="stars"?Yt:ys}))),Te.userData.seed=it,S.add(Te)}h.add(S),Object.assign(On,{group:S,sky:f,parts:Z,dots:Te,kind:ae,t0:performance.now(),spec:l}),gt(l.title,5e3)}function ep(l,p){if(!On.group)return;let g=(p-On.t0)/1e3;if(!T){On.sky.material.uniforms.fade.value=Math.min(1,g/1.2);let W=Math.max(0,Math.min(1,(g-.5)/1.4));On.parts.scale.setScalar(Math.max(.001,1-(1-W)**3));for(let X of On.parts.children)X.userData.bob>=0&&(X.position.y=X.userData.y+Math.sin(p/1600+X.userData.bob)*.15)}let S=On.dots;if(!S||T||On.kind==="stars")return;let f=S.geometry.attributes.position,A=S.userData.seed,k=On.kind,F=p/1e3,Z={snow:-.5,rain:-7,fireflies:0,embers:.7,bubbles:.45,petals:-.35,dust:.03}[k]??0;for(let W=0;W<f.count;W++){let X=f.getY(W)+Z*l*(.7+A[W]%1*.6);if(X<0?X+=9:X>9&&(X-=9),f.setY(W,X),k!=="rain"){let ee=A[W];f.setX(W,f.getX(W)+Math.sin(F*.6+ee)*l*(k==="fireflies"?.35:.12)),f.setZ(W,f.getZ(W)+Math.cos(F*.5+ee*1.3)*l*(k==="fireflies"?.35:.12))}}f.needsUpdate=!0,k==="fireflies"&&(S.material.opacity=.6+.35*Math.sin(F*2.1))}let Ht={card:Zt(.2,.09),until:0,total:0,words:"",shown:"",doneAt:0};Ht.card.mesh.visible=!1,Ht.card.mesh.position.set(.36,.1,.01),C.add(Ht.card.mesh),u(Ht.card.tex);function xc(l){let{ctx:p,w:g,h:S}=Ht.card,f=l<=0;Nn(p,g,S,40,f?{hot:!0}:{});let A=Math.max(0,Math.ceil(l/1e3)),k=Math.floor(A/3600),F=Math.floor(A%3600/60),Z=A%60,W=f?"Time's up":(k?k+":"+String(F).padStart(2,"0"):String(F))+":"+String(Z).padStart(2,"0");_t(p,"Timer \xB7 "+Ht.words,34,56,26,tn,600,"left",Vt,"0.02em"),_t(p,W,34,S-40,f?56:72,f?wn:kt,600,"left",Vt);let X=Ht.total?Math.max(0,Math.min(1,l/Ht.total)):0;p.fillStyle="rgba(255,255,255,0.1)",p.fillRect(34,S-22,g-68,4),p.fillStyle=wn,p.fillRect(34,S-22,(g-68)*X,4),Ci(p,"close",g-52,52,40,tn,7),Ht.card.update()}function tp(l,p){Object.assign(Ht,{until:performance.now()+l,total:l,words:p||"",shown:"",doneAt:0}),Ht.card.mesh.visible=!0,xc(l)}function vc(){let l=Ht.until>0;return Ht.until=0,Ht.doneAt=0,Ht.card.mesh.visible=!1,l}Se(Ht.card.mesh,{tap:()=>vc(),drag:()=>C,dropped:()=>{C.userData.placed=!0}});function np(l){if(!Ht.until)return;let p=Ht.until-l;if(p>0){let g=String(Math.ceil(p/1e3));g!==Ht.shown&&(Ht.shown=g,xc(p));return}Ht.doneAt?l-Ht.doneAt>15e3&&vc():(Ht.doneAt=l,xc(0),gt("Time's up: your "+Ht.words+" timer.",12e3),t.speak?.("Time's up! Your "+Ht.words+" timer is done."))}let Za=[["Breathe in\u2026",4e3],["Hold\u2026",4e3],["Breathe out\u2026",6e3]],jn={on:!1,t0:0,rounds:0,phase:-1,grow:0};function ip(l=4){Object.assign(jn,{on:!0,t0:performance.now(),rounds:l,phase:-1})}function ou(l){jn.on&&(jn.on=!1,q.reply=l||"",xe())}function sp(l){if(!jn.on){jn.grow+=(0-jn.grow)*.08;return}let p=14e3,g=l-jn.t0,S=Math.floor(g/p);if(S>=jn.rounds){ou("Nicely done. How do you feel?"),t.speak?.("Nicely done. How do you feel?");return}let f=g%p,A=0;for(;f>Za[A][1];)f-=Za[A][1],A++;let k=f/Za[A][1],F=W=>.5-Math.cos(Math.PI*W)/2;jn.grow=A===0?F(k):A===1?1:1-F(k);let Z=S*3+A;Z!==jn.phase&&(jn.phase=Z,q.reply=Za[A][0]+"  "+(S+1)+" of "+jn.rounds,q.stage="",xe())}let lu=new N;function rp(l,p){if(!J.open)return;if(Lf(l,p),nu.value=p/1e3,J.building){J.building.rotation.y+=l*1.4,J.building.rotation.x=.5;return}if($f(l),J.spec?.kind==="sketch"){kf(l,p);let f=J.view.ex;for(let A of Fn.parts)A.exDir&&A.g.position.copy(A.exDir).multiplyScalar(f*.17);return}if(J.spec?.kind==="globe"){Wf(l,p);return}if(J.spec?.kind==="sim"){Yf(l,p);return}let g=p-J.t0;for(let f of J.nodes){let A=T?1:Math.max(0,Math.min(1,(g-f.i*110)/520));f.shown=T?1:1-(1-A)**3,f.parent?(T||(f.angle+=l*f.speed),lu.set(Math.cos(f.angle)*f.orbitR,Math.sin(f.angle)*f.orbitR*.22,Math.sin(f.angle)*f.orbitR*.85),f.g.position.copy(f.parent.g.position).add(lu),f.ring.position.copy(f.parent.g.position)):(f.g.position.set(f.base.x,f.base.y+(T?0:Math.sin(p/1400+f.i)*.004),f.base.z),f.exDir&&J.view.ex>.001&&f.g.position.addScaledVector(f.exDir,J.view.ex*.2));let k=J.focus?J.focus.has(f.i)?1.18:.32:f.hot?1.1:1;f.emph+=(k-f.emph)*Math.min(1,l*6);let F=Math.min(1,f.emph);f.g.scale.setScalar(Math.max(.001,f.shown*(f.emph>1?f.emph:1))),f.mat.uniforms?f.mat.uniforms.opacity.value=.82*F:f.mat.opacity=.82*F,f.shell&&(f.shell.material.opacity=.3*F*(f.hot?1.6:1),T||(f.shell.rotation.y+=l*.5,f.shell.rotation.x+=l*.17)),f.glow.material.opacity=.5*F*(f.hot?1.4:1),f.label.mesh.material.opacity=Math.max(.25,F)}let S=T?1:Math.max(0,Math.min(1,(g-J.nodes.length*110)/500));for(let f of J.links){if(!f.a)continue;let A=f.line.geometry.attributes.position;A.setXYZ(0,f.a.g.position.x,f.a.g.position.y,f.a.g.position.z),A.setXYZ(1,f.b.g.position.x,f.b.g.position.y,f.b.g.position.z),A.needsUpdate=!0;let k=J.focus?J.focus.has(f.a.i)&&J.focus.has(f.b.i)?.7:.12:.45;if(f.line.material.opacity=k*S,f.pulse){let F=T?.5:(p/1200+f.off)%1;f.pulse.position.lerpVectors(f.a.g.position,f.b.g.position,F);let Z=J.focus?k>.5?1:.1:.55;f.pulse.material.opacity=(T?.4:Math.sin(Math.PI*F))*Z*S,f.pulse.scale.setScalar(J.focus&&k>.5?.075:.05)}}}function ap(){if(!_e.open||!_e.live)return null;let l=_e.screen,p=Math.min(1,1600/Math.max(l.w,l.h)),g=document.createElement("canvas");g.width=Math.max(1,Math.round(l.w*p)),g.height=Math.max(1,Math.round(l.h*p)),g.getContext("2d").drawImage(l.canvas,0,0,g.width,g.height);let S=g.toDataURL("image/jpeg",.85);return{b64:S.slice(S.indexOf(",")+1),url:S,w:g.width,h:g.height}}let Ys=[];function cu(l){et(l.c.mesh),et(l.x.mesh),h.remove(l.group);for(let g of[l.c,l.x])g.tex.dispose(),g.mesh.geometry.dispose(),g.mesh.material.dispose();let p=Ys.indexOf(l);p>=0&&Ys.splice(p,1)}function hu(l,p,g=!1,S=""){if(!g){let X=t.notes.add(l,S);p=X[X.length-1]?.at??Date.now();let ee=new Set(X.map(ae=>ae.at));for(let ae of[...Ys])ee.has(ae.at)||cu(ae)}let f=new Xt,A=Zt(.3,.19),k=Zt(.04,.04);{let{ctx:X,w:ee,h:ae}=A;Nn(X,ee,ae,44),Ci(X,"pin",62,66,34,tn,7),X.font=`600 28px ${Vt}`,_t(X,S?Tn(X,"Pinned \xB7 "+S,ee-140):"Pinned",88,76,28,tn,600,"left",Vt,"0.02em");let Te=(it,ft)=>(X.font=`500 ${ft}px ${an}`,X.measureText(it).width),de=a.fitLines(l,ee-96,6,34,22,Te),Je=92;for(let it of de.lines)_t(X,it,48,Je+=de.size*1.32,de.size,kt,500);A.update(),Sf(k,"close")}k.mesh.position.set(.135,.08,.004),f.add(A.mesh,k.mesh),h.add(f);let F=new Set(Ys.map(X=>X.slot)),Z=0;for(;F.has(Z);)Z++;let W={group:f,c:A,x:k,at:p,text:l,slot:Z};Ys.push(W),Se(A.mesh,{tap:()=>t.resume?t.resume({text:l,ask:S}):t.speak(l),drag:()=>f}),Se(k.mesh,{tap:()=>{cu(W),t.notes.remove(p)}}),$a?uu(W):f.visible=!1}function uu(l){let p=l.slot,g=pt-1.1-p%4*.42,S=.95,f=Math.floor(p/4);l.group.position.set(Oe.x-Math.sin(g)*S,Oe.y-.05+f*.24-p%2*.05,Oe.z-Math.cos(g)*S),Me(l.group),l.group.visible=!0}let $a=!1;function op(){let l=s?d:o.xr.getCamera();Oe.setFromMatrixPosition(l.matrixWorld),dt.setFromRotationMatrix(l.matrixWorld),Ct.set(0,0,-1).applyQuaternion(dt),Math.hypot(Ct.x,Ct.z)>.15&&(pt=Math.atan2(-Ct.x,-Ct.z))}function lp(){C.position.set(Oe.x-Math.sin(pt)*.75,Oe.y-.1,Oe.z-Math.cos(pt)*.75),Me(C),C.visible=!0,$a=!0,y=performance.now(),Ys.forEach(uu)}function cp(l){if(!y||_)return;let p=T?1:v((l-y)/1100),g=T?1:v((l-y-350)/600);H.scale.multiplyScalar(.3+.7*p),Y.opacity+=(1-p)*.45;let S=T?1:Math.min(1,(l-y)/1500);ue.visible=S<1,S<1&&(fe.opacity=.8*(1-S)*(1-S),ue.scale.setScalar(.9+v(S)*1.6));for(let f of m)f.opacity=g;p>=1&&g>=1&&S>=1&&(_=!0)}let Qn=null;function hp(l){if($t.some(p=>p.press?.drag===C)){Qn=null;return}if(!C.userData.placed){let p=a.followTarget({x:Oe.x,y:Oe.y,z:Oe.z,yaw:pt},C.position);p&&(Qn=p)}if(Qn){let p=1-Math.exp(-l*2.6);C.position.x+=(Qn.x-C.position.x)*p,C.position.y+=(Qn.y-C.position.y)*p,C.position.z+=(Qn.z-C.position.z)*p,Math.hypot(Qn.x-C.position.x,Qn.y-C.position.y,Qn.z-C.position.z)<.02&&(Qn=null)}Me(C)}function Zs(){C.userData.placed=!1,Qn={x:Oe.x-Math.sin(pt)*.75,y:Oe.y-.1,z:Oe.z-Math.cos(pt)*.75}}let du={listening:6220500,thinking:10980346,speaking:16020150};function up(l,p){let g=.06+Math.sin(p*1.4)*.02;q.state==="listening"?g=Math.max(.12,q.mic):q.state==="thinking"?g=.28:q.state==="speaking"&&(g=.34+.36*Math.abs(Math.sin(p*7.3)*Math.sin(p*3.1+1))),q.energy+=(g-q.energy)*Math.min(1,l*8),q.think+=((q.state==="thinking"?1:0)-q.think)*Math.min(1,l*3),O.uniforms.uTime.value=p,O.uniforms.uEnergy.value=q.energy,O.uniforms.uThink.value=q.think,D.uniforms.uTime.value=T?.6:p,D.uniforms.uEnergy.value=q.energy,D.uniforms.uState.value=xf[q.state]??0,D.uniforms.uPulse.value=q.state==="thinking"?.22+q.energy*.3:0;let S=(1+Math.sin(p*1.7)*.012+q.energy*.1)*(q.hovered?1.06:1)*(1+jn.grow*.45);H.scale.setScalar(S),Y.opacity=.1+q.energy*.36,Y.color.setHex(du[q.state]||I),Q.scale.setScalar(.4+q.energy*.12);let f=q.state==="listening"||q.state==="thinking";V.opacity+=((f?.6:0)-V.opacity)*Math.min(1,l*6),V.color.setHex(du[q.state]||6220500),te.rotation.z-=l*(q.state==="thinking"?4:.8),te.scale.setScalar(1+(q.state==="listening"?q.mic*.25:0)),dp(l,p)}let Ja=(()=>{let l=u(new Oi(.008,1)),p=u(new rn({color:6220500,transparent:!0,opacity:0,depthWrite:!1,blending:Yt})),g=[];for(let S of[-1,1])for(let f=0;f<4;f++){let A=new ct(l,p);A.position.set(S*(.142+f*.016),0,.01),A.userData={k:f,phase:Math.random()*6,h:.004},A.scale.y=.004,C.add(A),g.push(A)}return{bars:g,mat:p}})();function dp(l,p){let g=q.state==="listening";if(Ja.mat.opacity+=((g?.9:0)-Ja.mat.opacity)*Math.min(1,l*8),!(Ja.mat.opacity<.01))for(let S of Ja.bars){let{k:f,phase:A}=S.userData,k=T?.6:.55+.45*Math.abs(Math.sin(p*(7+f*1.7)+A)),F=g?.006+q.mic*.07*(1-f*.18)*k:.004;S.userData.h+=(F-S.userData.h)*Math.min(1,l*14),S.scale.y=Math.max(.004,S.userData.h)}}function yc(){let l=q.state;l==="listening"?we.set("done","Done"):l==="speaking"?we.set("quiet","Quiet"):l==="thinking"?we.set("think","Working"):we.set("mic","Talk");let p=!!t.calling?.();p!==Le.shown&&(Le.shown=p,Be()),$n.setOn(ce.open),ai.setOn(_e.open);let g=As&&(l===""||l==="listening")&&!!t.ready?.();for(let S of Ts)S.c.mesh.visible=g}let fu=performance.now(),pu=0,mu=0,gu=!1,_u=0,xu=new Map;o.setAnimationLoop(()=>{let l=performance.now(),p=Math.min(.05,(l-fu)/1e3);fu=l,pu+=p,mu++,s&&(d.rotation.set(Ke,rt,0,"YXZ"),d.updateMatrixWorld()),op(),!$a&&mu>3&&lp(),$a&&hp(p),up(p,pu),cp(l),rp(p,l),ep(p,l),np(l),sp(l);for(let g of $t){if(!z(g))continue;let S=g.hit,f=S?.object.userData.ui||null;f!==g.hover&&(g.hover?.hover?.(!1),f?.hover?.(!0),f&&G(g,.12,10),g.hover=f),g.dot.visible=!!S,S&&(g.dot.position.copy(S.point).addScaledVector(g.dir,-.003),g.dot.lookAt(g.origin)),g.line&&(g.line.scale.z=S?S.distance:1.2);let A=g.press;if(A?.turn){let F=A.direct?$(g,ht):g.origin.clone().addScaledVector(g.dir,A.dist);!A.moved&&F.distanceTo(A.start)>(A.direct?.012:.03)&&(A.moved=!0),A.moved&&Zf(A,F,l)}else if(A?.direct)$(g,ht),!A.moved&&ht.distanceTo(A.start)>.012&&(A.moved=!0),A.moved&&(A.drag.position.copy(ht).add(A.offset),Me(A.drag));else if(A?.drag){let F=g.origin.clone().addScaledVector(g.dir,A.dist);!A.moved&&F.distanceTo(A.start)>.03&&(A.moved=!0),A.moved&&(A.drag.position.copy(F).add(A.offset),Me(A.drag))}let k=g.source?.gamepad;if(k){let F=k.axes[3]??0;Math.abs(F)>.45&&f?.scroll&&l-g.scrollAt>140&&(f.scroll(Math.sign(F)*(Math.abs(F)>.85?3:1)),g.scrollAt=l);let Z=xu.get(g)||[],W=!!k.buttons[4]?.pressed,X=!!k.buttons[5]?.pressed;W&&!Z[0]&&Ce(g),!W&&Z[0]&&pe(g,l-(g.holdAt||l)),X&&!Z[1]&&Zs(),xu.set(g,[W,X])}}if(me)for(let g=0;g<2;g++){let S=o.xr.getHand(g);for(let f of Object.values(S.joints||{}))if(!f.userData.dot){let A=new ct(me.jointGeo,me.jointMat);f.add(A),f.userData.dot=A}}if(Ne.anim){let g=(l-Ne.t0)/(650*Math.max(1,Ne.marks.length));Ri(Math.min(1,g)),g>=1&&(Ne.anim=!1)}for(let g=B.length-1;g>=0;g--){let S=B[g],f=(l-S.t0)/350;S.m.scale.setScalar(1+f*1.6),S.m.material.opacity=Math.max(0,.9*(1-f)),f>=1&&(h.remove(S.m),S.m.material.dispose(),B.splice(g,1))}l-_u>200&&(_u=l,yc()),o.render(h,d)});let es=null;if(s){Ze=!0,es=document.createElement("div"),es.setAttribute("role","status"),Object.assign(es.style,{position:"fixed",top:"max(12px, env(safe-area-inset-top))",left:"50%",transform:"translateX(-50%)",zIndex:"2147483001",display:"flex",flexWrap:"wrap",justifyContent:"center",gap:"8px 10px",alignItems:"center",padding:"8px 8px 8px 16px",borderRadius:"24px",background:"rgba(18,20,27,.9)",color:kt,font:`500 14px ${an}`,border:"1px solid rgba(255,255,255,.14)",width:"max-content",maxWidth:"calc(100vw - 32px)",boxSizing:"border-box"});let l=document.createElement("span");l.textContent="3D preview \xB7 click the orb to talk, drag to look",Object.assign(l.style,{color:tn,textAlign:"center",flex:"1 1 auto"}),es.append(l,Cs("Talk",()=>t.tapOrb()),Cs("Photos",Ft),Cs("My PC",$e),Cs("Pin",We),Cs("Style",Tt),Cs("Leave",()=>Wr())),Et=document.createElement("div"),Et.setAttribute("role","group"),Et.setAttribute("aria-label","Web browser"),Object.assign(Et.style,{flexBasis:"100%",maxHeight:"40vh",overflowY:"auto"}),es.append(Et),mc(),qe=document.createElement("span"),qe.setAttribute("aria-live","polite"),Object.assign(qe.style,{position:"absolute",width:"1px",height:"1px",overflow:"hidden",clip:"rect(0 0 0 0)",whiteSpace:"nowrap"}),es.append(qe),document.body.appendChild(es)}else se(e,"end",()=>Wr(!1));function Wr(l=!0){if(!gu){if(gu=!0,Es(),vt(),Xa(),gc(),_c(),clearTimeout(xt),o.setAnimationLoop(null),!s&&l)try{Promise.resolve(e.end()).catch(()=>{})}catch{}for(let p of Ae)try{p()}catch{}es?.remove(),c.remove(),h.traverse(p=>{p.geometry?.dispose?.();let g=p.material;if(g)for(let S of Array.isArray(g)?g:[g])S.map?.dispose?.(),S.dispose?.()});for(let p of x)try{p.dispose?.()}catch{}o.dispose(),t.exited()}}return xe(),Jn(),{orb(l){let p=l||"";p!==q.state&&(q.state=p,p==="listening"&&(q.hint="",q.stage=""),p===""&&(q.stage=""),xe(),yc())},heard(l){let p=String(l||"");p!==q.you&&(q.you=p,p&&p!=="\u2026"&&(q.reply=""),q.hint="",xe())},said(l){let p=String(l||"");!p||p===q.reply||(q.reply=p,q.stage="",xe())},line(l,p,g){let S=String(p||"");S&&(l==="me"?(q.you=S,q.reply="",q.hint="",As&&Hs()):l==="izuki"&&(g?.thinking?q.stage=S:(q.reply=S,q.stage="")),xe())},level(l){q.mic=Math.max(0,Math.min(1,Number(l)||0))},showLook:za,lookShown:()=>Ne.group.visible,pin:hu,comeHere:Zs,pcOpen:Ha,pcTarget:()=>_e.open?_e.target:null,pcClose:Es,pcShown:()=>_e.open,pcFrame:ap,filesOpen:vn,filesClose:vt,webSearch:Ef,webClose:Xa,webShown:()=>re.open,holoBuilding:Df,holoShow:Ff,holoFocus:jf,holoClose:gc,holoShown:()=>J.open,holoPhoto:zf,globeShow:Gf,globeMark:Hf,simShow:qf,holoView:Kf,holoViewNow:()=>({...J.view,yaw:J.stage.rotation.y}),simShown:()=>J.open&&J.spec?.kind==="sim",simProbe:()=>jt.st?{...jt.st,type:jt.spec?.type}:null,dreamShow:Qf,dreamClose:_c,dreamShown:()=>!!On.group,timerStart:tp,timerStop:vc,breathe:ip,breatheStop:()=>ou(""),nextTheme:b,notice:gt,stop:Wr}}function Qx(i,e){let t={uLow:{value:new je},uMid:{value:new je},uTop:{value:new je},uBand:{value:new je},uBandAmt:{value:0}},n=new ct(new Ln(40,48,24),new dn({side:Sn,depthWrite:!1,uniforms:t,vertexShader:"varying vec3 vW; void main(){ vW = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`varying vec3 vW;
      uniform vec3 uLow; uniform vec3 uMid; uniform vec3 uTop; uniform vec3 uBand; uniform float uBandAmt;
      void main(){
        float h = vW.y;
        vec3 c = h < 0.0 ? mix(uMid, uLow, clamp(-h * 2.5, 0.0, 1.0)) : mix(uMid, uTop, clamp(h * 1.6, 0.0, 1.0));
        // The horizon glow: brightest at eye level, fading up and down.
        c += uBand * exp(-abs(h) * 7.0) * uBandAmt;
        gl_FragColor = vec4(c, 1.0);
      }`}));n.renderOrder=-10,i.add(n);let s=320,r=new Float32Array(s*3);for(let y=0;y<s;y++){let T=Math.random()*Math.PI*2,v=Math.random()*.85+.12,_=30;r[y*3]=Math.cos(T)*Math.sqrt(1-v*v)*_,r[y*3+1]=v*_,r[y*3+2]=Math.sin(T)*Math.sqrt(1-v*v)*_}let a=new Fs(new Lt().setAttribute("position",new st(r,3)),new cs({color:14674165,size:.05,transparent:!0,opacity:.5,depthWrite:!1}));i.add(a);let o=document.createElement("canvas");o.width=o.height=2048;let c=o.getContext("2d"),h=1024,d=1024/3.2,x=c.createRadialGradient(h,h,0,h,h,1024);x.addColorStop(0,"rgba(255,255,255,0.10)"),x.addColorStop(.5,"rgba(255,255,255,0.03)"),x.addColorStop(1,"rgba(255,255,255,0)"),c.fillStyle=x,c.fillRect(0,0,2048,2048);for(let y=.4;y<=3.2+1e-6;y+=.4){let T=y/3.2;c.beginPath(),c.arc(h,h,y*d,0,Math.PI*2),c.lineWidth=2.2-T,c.strokeStyle=`rgba(255,255,255,${(.34*(1-T)+.04).toFixed(3)})`,c.stroke()}let u=new Os(o);u.colorSpace=mn,u.anisotropy=Qh;let m=new ct(new Bs(3.2,128),new rn({map:u,transparent:!0,depthWrite:!1}));return m.rotation.x=-Math.PI/2,m.position.y=e,i.add(m),{set(y){t.uLow.value.setRGB(...y.low),t.uMid.value.setRGB(...y.mid),t.uTop.value.setRGB(...y.top),t.uBand.value.setRGB(...y.band),t.uBandAmt.value=y.bandAmt,a.material.opacity=y.stars,a.visible=y.stars>.02,m.material.color.setRGB(...y.floor)}}}var Ba=[{name:"Nova",orb:[[.18,.83,.75],[.55,.36,.96],[.96,.45,.71]],halo:8246268,low:[.008,.01,.014],mid:[.03,.036,.05],top:[.012,.014,.022],band:[.08,.2,.2],bandAmt:.55,stars:.5,floor:[.6,1,.95]},{name:"Midnight",orb:[[.25,.5,1],[.4,.75,1],[.75,.85,1]],halo:9684477,low:[.006,.01,.02],mid:[.02,.04,.08],top:[.008,.014,.03],band:[.1,.16,.32],bandAmt:.6,stars:.6,floor:[.7,.82,1]},{name:"Aurora",orb:[[.25,.92,.6],[.2,.75,.9],[.55,.45,.95]],halo:7268279,low:[.006,.012,.012],mid:[.02,.045,.045],top:[.01,.018,.022],band:[.08,.3,.18],bandAmt:.7,stars:.5,floor:[.6,1,.8]},{name:"Dawn",orb:[[1,.7,.52],[.92,.55,.62],[1,.86,.66]],halo:16701354,low:[.012,.009,.01],mid:[.06,.04,.045],top:[.02,.016,.026],band:[.32,.16,.1],bandAmt:.55,stars:.2,floor:[1,.85,.75]},{name:"Pearl",light:!0,orb:[[.86,.88,.96],[.7,.76,.92],[.94,.88,.92]],halo:14870768,low:[.42,.44,.48],mid:[.66,.68,.73],top:[.8,.81,.85],band:[.06,.06,.07],bandAmt:.4,stars:0,floor:[.2,.22,.28]}];export{aS as start};
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
