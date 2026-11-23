// Izuki in VR, the 3D room: built from vr-scene.src.js by tools/build-vr.cjs. Includes three.js (MIT, notice at the end).
var eu=0,dc=1,tu=2;var Gr=1,nu=2,er=3,Ji=0,un=1,Vn=2,fi=0,Ki=1,An=2,fc=3,pc=4,iu=5;var gs=100,su=101,ru=102,au=103,ou=104,lu=200,cu=201,hu=202,uu=203,mc=204,gc=205,du=206,fu=207,pu=208,mu=209,gu=210,_u=211,xu=212,vu=213,yu=214,Ga=0,Ha=1,Wa=2,Hs=3,Xa=4,qa=5,Ya=6,Za=7,To=0,Mu=1,Su=2,ni=0,_c=1,xc=2,vc=3,yc=4,Mc=5,Sc=6,bc=7;var wc=300,ji=301,_s=302,Ao=303,Eo=304,Hr=306,$a=1e3,ci=1001,Ja=1002,cn=1003,bu=1004;var Wr=1005;var _n=1006,Co=1007;var Qi=1008;var In=1009,Tc=1010,Ac=1011,tr=1012,Ro=1013,ii=1014,si=1015,ri=1016,Po=1017,Io=1018,nr=1020,Ec=35902,Cc=35899,Rc=1021,Pc=1022,Xn=1023,hi=1026,es=1027,Ic=1028,Lo=1029,ts=1030,Do=1031;var No=1033,Xr=33776,qr=33777,Yr=33778,Zr=33779,Uo=35840,Fo=35841,Oo=35842,Bo=35843,zo=36196,ko=37492,Vo=37496,Go=37488,Ho=37489,$r=37490,Wo=37491,Xo=37808,qo=37809,Yo=37810,Zo=37811,$o=37812,Jo=37813,Ko=37814,jo=37815,Qo=37816,el=37817,tl=37818,nl=37819,il=37820,sl=37821,rl=36492,al=36494,ol=36495,ll=36283,cl=36284,Jr=36285,hl=36286;var Mr=2300,Ka=2301,ka=2302,ic=2303,sc=2400,rc=2401,ac=2402;var wu=3200;var ul=0,Tu=1,Ii="",ln="srgb",Sr="srgb-linear",br="linear",At="srgb";var Va=7680;var Au=519,Eu=512,Cu=513,Ru=514,dl=515,Pu=516,Iu=517,fl=518,Lu=519,Lc=35044;var Dc="300 es",jn=2e3,Ws=2001;function jd(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Qd(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function wr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Du(){let i=wr("canvas");return i.style.display="block",i}var Sh={},Xs=null;function Tr(...i){let e="THREE."+i.shift();Xs?Xs("log",e,...i):console.log(e,...i)}function Nu(i){let e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function $e(...i){i=Nu(i);let e="THREE."+i.shift();if(Xs)Xs("warn",e,...i);else{let t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function Je(...i){i=Nu(i);let e="THREE."+i.shift();if(Xs)Xs("error",e,...i);else{let t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function cs(...i){let e=i.join(" ");e in Sh||(Sh[e]=!0,$e(...i))}function Uu(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}var Fu={[Ga]:Ha,[Wa]:Ya,[Xa]:Za,[Hs]:qa,[Ha]:Ga,[Ya]:Wa,[Za]:Xa,[qa]:Hs},ui=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let s=n[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}},xn=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var Ll=Math.PI/180,ja=180/Math.PI;function zi(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(xn[i&255]+xn[i>>8&255]+xn[i>>16&255]+xn[i>>24&255]+"-"+xn[e&255]+xn[e>>8&255]+"-"+xn[e>>16&15|64]+xn[e>>24&255]+"-"+xn[t&63|128]+xn[t>>8&255]+"-"+xn[t>>16&255]+xn[t>>24&255]+xn[n&255]+xn[n>>8&255]+xn[n>>16&255]+xn[n>>24&255]).toLowerCase()}function xt(i,e,t){return Math.max(e,Math.min(t,i))}function ef(i,e){return(i%e+e)%e}function Dl(i,e,t){return(1-t)*i+t*e}function li(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:case Uint8ClampedArray:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function It(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var Bc=class Bc{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=xt(this.x,e.x,t.x),this.y=xt(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=xt(this.x,e,t),this.y=xt(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(xt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(xt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*s+e.x,this.y=r*s+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};Bc.prototype.isVector2=!0;var Ke=Bc,Wn=class{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,a,o){let c=n[s+0],l=n[s+1],d=n[s+2],p=n[s+3],u=r[a+0],g=r[a+1],v=r[a+2],b=r[a+3];if(p!==b||c!==u||l!==g||d!==v){let m=c*u+l*g+d*v+p*b;m<0&&(u=-u,g=-g,v=-v,b=-b,m=-m);let f=1-o;if(m<.9995){let T=Math.acos(m),L=Math.sin(T);f=Math.sin(f*T)/L,o=Math.sin(o*T)/L,c=c*f+u*o,l=l*f+g*o,d=d*f+v*o,p=p*f+b*o}else{c=c*f+u*o,l=l*f+g*o,d=d*f+v*o,p=p*f+b*o;let T=1/Math.sqrt(c*c+l*l+d*d+p*p);c*=T,l*=T,d*=T,p*=T}}e[t]=c,e[t+1]=l,e[t+2]=d,e[t+3]=p}static multiplyQuaternionsFlat(e,t,n,s,r,a){let o=n[s],c=n[s+1],l=n[s+2],d=n[s+3],p=r[a],u=r[a+1],g=r[a+2],v=r[a+3];return e[t]=o*v+d*p+c*g-l*u,e[t+1]=c*v+d*u+l*p-o*g,e[t+2]=l*v+d*g+o*u-c*p,e[t+3]=d*v-o*p-c*u-l*g,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,c=Math.sin,l=o(n/2),d=o(s/2),p=o(r/2),u=c(n/2),g=c(s/2),v=c(r/2);switch(a){case"XYZ":this._x=u*d*p+l*g*v,this._y=l*g*p-u*d*v,this._z=l*d*v+u*g*p,this._w=l*d*p-u*g*v;break;case"YXZ":this._x=u*d*p+l*g*v,this._y=l*g*p-u*d*v,this._z=l*d*v-u*g*p,this._w=l*d*p+u*g*v;break;case"ZXY":this._x=u*d*p-l*g*v,this._y=l*g*p+u*d*v,this._z=l*d*v+u*g*p,this._w=l*d*p-u*g*v;break;case"ZYX":this._x=u*d*p-l*g*v,this._y=l*g*p+u*d*v,this._z=l*d*v-u*g*p,this._w=l*d*p+u*g*v;break;case"YZX":this._x=u*d*p+l*g*v,this._y=l*g*p+u*d*v,this._z=l*d*v-u*g*p,this._w=l*d*p-u*g*v;break;case"XZY":this._x=u*d*p-l*g*v,this._y=l*g*p-u*d*v,this._z=l*d*v+u*g*p,this._w=l*d*p+u*g*v;break;default:$e("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],s=t[4],r=t[8],a=t[1],o=t[5],c=t[9],l=t[2],d=t[6],p=t[10],u=n+o+p;if(u>0){let g=.5/Math.sqrt(u+1);this._w=.25/g,this._x=(d-c)*g,this._y=(r-l)*g,this._z=(a-s)*g}else if(n>o&&n>p){let g=2*Math.sqrt(1+n-o-p);this._w=(d-c)/g,this._x=.25*g,this._y=(s+a)/g,this._z=(r+l)/g}else if(o>p){let g=2*Math.sqrt(1+o-n-p);this._w=(r-l)/g,this._x=(s+a)/g,this._y=.25*g,this._z=(c+d)/g}else{let g=2*Math.sqrt(1+p-n-o);this._w=(a-s)/g,this._x=(r+l)/g,this._y=(c+d)/g,this._z=.25*g}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(xt(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=t._x,c=t._y,l=t._z,d=t._w;return this._x=n*d+a*o+s*l-r*c,this._y=s*d+a*c+r*o-n*l,this._z=r*d+a*l+n*c-s*o,this._w=a*d-n*o-s*c-r*l,this._onChangeCallback(),this}slerp(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,s=-s,r=-r,a=-a,o=-o);let c=1-t;if(o<.9995){let l=Math.acos(o),d=Math.sin(l);c=Math.sin(c*l)/d,t=Math.sin(t*l)/d,this._x=this._x*c+n*t,this._y=this._y*c+s*t,this._z=this._z*c+r*t,this._w=this._w*c+a*t,this._onChangeCallback()}else this._x=this._x*c+n*t,this._y=this._y*c+s*t,this._z=this._z*c+r*t,this._w=this._w*c+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},zc=class zc{constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(bh.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(bh.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,s=this.z,r=e.x,a=e.y,o=e.z,c=e.w,l=2*(a*s-o*n),d=2*(o*t-r*s),p=2*(r*n-a*t);return this.x=t+c*l+a*p-o*d,this.y=n+c*d+o*l-r*p,this.z=s+c*p+r*d-a*l,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=xt(this.x,e.x,t.x),this.y=xt(this.y,e.y,t.y),this.z=xt(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=xt(this.x,e,t),this.y=xt(this.y,e,t),this.z=xt(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(xt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,s=e.y,r=e.z,a=t.x,o=t.y,c=t.z;return this.x=s*c-r*o,this.y=r*a-n*c,this.z=n*o-s*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Nl.copy(this).projectOnVector(e),this.sub(Nl)}reflect(e){return this.sub(Nl.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(xt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};zc.prototype.isVector3=!0;var B=zc,Nl=new B,bh=new Wn,kc=class kc{constructor(e,t,n,s,r,a,o,c,l){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,c,l)}set(e,t,n,s,r,a,o,c,l){let d=this.elements;return d[0]=e,d[1]=s,d[2]=o,d[3]=t,d[4]=r,d[5]=c,d[6]=n,d[7]=a,d[8]=l,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[3],c=n[6],l=n[1],d=n[4],p=n[7],u=n[2],g=n[5],v=n[8],b=s[0],m=s[3],f=s[6],T=s[1],L=s[4],w=s[7],C=s[2],E=s[5],D=s[8];return r[0]=a*b+o*T+c*C,r[3]=a*m+o*L+c*E,r[6]=a*f+o*w+c*D,r[1]=l*b+d*T+p*C,r[4]=l*m+d*L+p*E,r[7]=l*f+d*w+p*D,r[2]=u*b+g*T+v*C,r[5]=u*m+g*L+v*E,r[8]=u*f+g*w+v*D,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],d=e[8];return t*a*d-t*o*l-n*r*d+n*o*c+s*r*l-s*a*c}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],d=e[8],p=d*a-o*l,u=o*c-d*r,g=l*r-a*c,v=t*p+n*u+s*g;if(v===0)return this.set(0,0,0,0,0,0,0,0,0);let b=1/v;return e[0]=p*b,e[1]=(s*l-d*n)*b,e[2]=(o*n-s*a)*b,e[3]=u*b,e[4]=(d*t-s*c)*b,e[5]=(s*r-o*t)*b,e[6]=g*b,e[7]=(n*c-l*t)*b,e[8]=(a*t-n*r)*b,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,a,o){let c=Math.cos(r),l=Math.sin(r);return this.set(n*c,n*l,-n*(c*a+l*o)+a+e,-s*l,s*c,-s*(-l*a+c*o)+o+t,0,0,1),this}scale(e,t){return cs("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(Ul.makeScale(e,t)),this}rotate(e){return cs("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(Ul.makeRotation(-e)),this}translate(e,t){return cs("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(Ul.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}};kc.prototype.isMatrix3=!0;var tt=kc,Ul=new tt,wh=new tt().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Th=new tt().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function tf(){let i={enabled:!0,workingColorSpace:Sr,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===At&&(s.r=Ti(s.r),s.g=Ti(s.g),s.b=Ti(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===At&&(s.r=Gs(s.r),s.g=Gs(s.g),s.b=Gs(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Ii?br:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return cs("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return cs("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[Sr]:{primaries:e,whitePoint:n,transfer:br,toXYZ:wh,fromXYZ:Th,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:ln},outputColorSpaceConfig:{drawingBufferColorSpace:ln}},[ln]:{primaries:e,whitePoint:n,transfer:At,toXYZ:wh,fromXYZ:Th,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:ln}}}),i}var gt=tf();function Ti(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Gs(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var Ts,Qa=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Ts===void 0&&(Ts=wr("canvas")),Ts.width=e.width,Ts.height=e.height;let s=Ts.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=Ts}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=wr("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=Ti(r[a]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Ti(t[n]/255)*255):t[n]=Ti(t[n]);return{data:t,width:e.width,height:e.height}}else return $e("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},nf=0,qs=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:nf++}),this.uuid=zi(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(Fl(s[a].image)):r.push(Fl(s[a]))}else r=Fl(s);n.url=r}return t||(e.images[this.uuid]=n),n}};function Fl(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Qa.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:($e("Texture: Unable to serialize Texture."),{})}var sf=0,Ol=new B,Tn=class i extends ui{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=ci,s=ci,r=_n,a=Qi,o=Xn,c=In,l=i.DEFAULT_ANISOTROPY,d=Ii){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:sf++}),this.uuid=zi(),this.name="",this.source=new qs(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=l,this.format=o,this.internalFormat=null,this.type=c,this.offset=new Ke(0,0),this.repeat=new Ke(1,1),this.center=new Ke(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new tt,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=d,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(Ol).x}get height(){return this.source.getSize(Ol).y}get depth(){return this.source.getSize(Ol).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){$e(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){$e(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==wc)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case $a:e.x=e.x-Math.floor(e.x);break;case ci:e.x=e.x<0?0:1;break;case Ja:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case $a:e.y=e.y-Math.floor(e.y);break;case ci:e.y=e.y<0?0:1;break;case Ja:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Tn.DEFAULT_IMAGE=null;Tn.DEFAULT_MAPPING=wc;Tn.DEFAULT_ANISOTROPY=1;var Vc=class Vc{constructor(e=0,t=0,n=0,s=1){this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r,c=e.elements,l=c[0],d=c[4],p=c[8],u=c[1],g=c[5],v=c[9],b=c[2],m=c[6],f=c[10];if(Math.abs(d-u)<.01&&Math.abs(p-b)<.01&&Math.abs(v-m)<.01){if(Math.abs(d+u)<.1&&Math.abs(p+b)<.1&&Math.abs(v+m)<.1&&Math.abs(l+g+f-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let L=(l+1)/2,w=(g+1)/2,C=(f+1)/2,E=(d+u)/4,D=(p+b)/4,_=(v+m)/4;return L>w&&L>C?L<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(L),s=E/n,r=D/n):w>C?w<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(w),n=E/s,r=_/s):C<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(C),n=D/r,s=_/r),this.set(n,s,r,t),this}let T=Math.sqrt((m-v)*(m-v)+(p-b)*(p-b)+(u-d)*(u-d));return Math.abs(T)<.001&&(T=1),this.x=(m-v)/T,this.y=(p-b)/T,this.z=(u-d)/T,this.w=Math.acos((l+g+f-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=xt(this.x,e.x,t.x),this.y=xt(this.y,e.y,t.y),this.z=xt(this.z,e.z,t.z),this.w=xt(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=xt(this.x,e,t),this.y=xt(this.y,e,t),this.z=xt(this.z,e,t),this.w=xt(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(xt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Vc.prototype.isVector4=!0;var Gt=Vc,eo=class extends ui{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:_n,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new Gt(0,0,e,t),this.scissorTest=!1,this.viewport=new Gt(0,0,e,t),this.textures=[];let s={width:e,height:t,depth:n.depth},r=new Tn(s),a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:_n,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new qs(s)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Pn=class extends eo{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Ar=class extends Tn{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=cn,this.minFilter=cn,this.wrapR=ci,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var to=class extends Tn{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=cn,this.minFilter=cn,this.wrapR=ci,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}};var wo=class wo{constructor(e,t,n,s,r,a,o,c,l,d,p,u,g,v,b,m){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,c,l,d,p,u,g,v,b,m)}set(e,t,n,s,r,a,o,c,l,d,p,u,g,v,b,m){let f=this.elements;return f[0]=e,f[4]=t,f[8]=n,f[12]=s,f[1]=r,f[5]=a,f[9]=o,f[13]=c,f[2]=l,f[6]=d,f[10]=p,f[14]=u,f[3]=g,f[7]=v,f[11]=b,f[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new wo().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,s=1/As.setFromMatrixColumn(e,0).length(),r=1/As.setFromMatrixColumn(e,1).length(),a=1/As.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,s=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),c=Math.cos(s),l=Math.sin(s),d=Math.cos(r),p=Math.sin(r);if(e.order==="XYZ"){let u=a*d,g=a*p,v=o*d,b=o*p;t[0]=c*d,t[4]=-c*p,t[8]=l,t[1]=g+v*l,t[5]=u-b*l,t[9]=-o*c,t[2]=b-u*l,t[6]=v+g*l,t[10]=a*c}else if(e.order==="YXZ"){let u=c*d,g=c*p,v=l*d,b=l*p;t[0]=u+b*o,t[4]=v*o-g,t[8]=a*l,t[1]=a*p,t[5]=a*d,t[9]=-o,t[2]=g*o-v,t[6]=b+u*o,t[10]=a*c}else if(e.order==="ZXY"){let u=c*d,g=c*p,v=l*d,b=l*p;t[0]=u-b*o,t[4]=-a*p,t[8]=v+g*o,t[1]=g+v*o,t[5]=a*d,t[9]=b-u*o,t[2]=-a*l,t[6]=o,t[10]=a*c}else if(e.order==="ZYX"){let u=a*d,g=a*p,v=o*d,b=o*p;t[0]=c*d,t[4]=v*l-g,t[8]=u*l+b,t[1]=c*p,t[5]=b*l+u,t[9]=g*l-v,t[2]=-l,t[6]=o*c,t[10]=a*c}else if(e.order==="YZX"){let u=a*c,g=a*l,v=o*c,b=o*l;t[0]=c*d,t[4]=b-u*p,t[8]=v*p+g,t[1]=p,t[5]=a*d,t[9]=-o*d,t[2]=-l*d,t[6]=g*p+v,t[10]=u-b*p}else if(e.order==="XZY"){let u=a*c,g=a*l,v=o*c,b=o*l;t[0]=c*d,t[4]=-p,t[8]=l*d,t[1]=u*p+b,t[5]=a*d,t[9]=g*p-v,t[2]=v*p-g,t[6]=o*d,t[10]=b*p+u}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(rf,e,af)}lookAt(e,t,n){let s=this.elements;return On.subVectors(e,t),On.lengthSq()===0&&(On.z=1),On.normalize(),Ni.crossVectors(n,On),Ni.lengthSq()===0&&(Math.abs(n.z)===1?On.x+=1e-4:On.z+=1e-4,On.normalize(),Ni.crossVectors(n,On)),Ni.normalize(),pa.crossVectors(On,Ni),s[0]=Ni.x,s[4]=pa.x,s[8]=On.x,s[1]=Ni.y,s[5]=pa.y,s[9]=On.y,s[2]=Ni.z,s[6]=pa.z,s[10]=On.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[4],c=n[8],l=n[12],d=n[1],p=n[5],u=n[9],g=n[13],v=n[2],b=n[6],m=n[10],f=n[14],T=n[3],L=n[7],w=n[11],C=n[15],E=s[0],D=s[4],_=s[8],R=s[12],N=s[1],V=s[5],G=s[9],$=s[13],z=s[2],K=s[6],ie=s[10],te=s[14],X=s[3],ee=s[7],ce=s[11],ge=s[15];return r[0]=a*E+o*N+c*z+l*X,r[4]=a*D+o*V+c*K+l*ee,r[8]=a*_+o*G+c*ie+l*ce,r[12]=a*R+o*$+c*te+l*ge,r[1]=d*E+p*N+u*z+g*X,r[5]=d*D+p*V+u*K+g*ee,r[9]=d*_+p*G+u*ie+g*ce,r[13]=d*R+p*$+u*te+g*ge,r[2]=v*E+b*N+m*z+f*X,r[6]=v*D+b*V+m*K+f*ee,r[10]=v*_+b*G+m*ie+f*ce,r[14]=v*R+b*$+m*te+f*ge,r[3]=T*E+L*N+w*z+C*X,r[7]=T*D+L*V+w*K+C*ee,r[11]=T*_+L*G+w*ie+C*ce,r[15]=T*R+L*$+w*te+C*ge,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],a=e[1],o=e[5],c=e[9],l=e[13],d=e[2],p=e[6],u=e[10],g=e[14],v=e[3],b=e[7],m=e[11],f=e[15],T=c*g-l*u,L=o*g-l*p,w=o*u-c*p,C=a*g-l*d,E=a*u-c*d,D=a*p-o*d;return t*(b*T-m*L+f*w)-n*(v*T-m*C+f*E)+s*(v*L-b*C+f*D)-r*(v*w-b*E+m*D)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[1],a=e[5],o=e[9],c=e[2],l=e[6],d=e[10];return t*(a*d-o*l)-n*(r*d-o*c)+s*(r*l-a*c)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],c=e[6],l=e[7],d=e[8],p=e[9],u=e[10],g=e[11],v=e[12],b=e[13],m=e[14],f=e[15],T=t*o-n*a,L=t*c-s*a,w=t*l-r*a,C=n*c-s*o,E=n*l-r*o,D=s*l-r*c,_=d*b-p*v,R=d*m-u*v,N=d*f-g*v,V=p*m-u*b,G=p*f-g*b,$=u*f-g*m,z=T*$-L*G+w*V+C*N-E*R+D*_;if(z===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let K=1/z;return e[0]=(o*$-c*G+l*V)*K,e[1]=(s*G-n*$-r*V)*K,e[2]=(b*D-m*E+f*C)*K,e[3]=(u*E-p*D-g*C)*K,e[4]=(c*N-a*$-l*R)*K,e[5]=(t*$-s*N+r*R)*K,e[6]=(m*w-v*D-f*L)*K,e[7]=(d*D-u*w+g*L)*K,e[8]=(a*G-o*N+l*_)*K,e[9]=(n*N-t*G-r*_)*K,e[10]=(v*E-b*w+f*T)*K,e[11]=(p*w-d*E-g*T)*K,e[12]=(o*R-a*V-c*_)*K,e[13]=(t*V-n*R+s*_)*K,e[14]=(b*L-v*C-m*T)*K,e[15]=(d*C-p*L+u*T)*K,this}scale(e){let t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),s=Math.sin(t),r=1-n,a=e.x,o=e.y,c=e.z,l=r*a,d=r*o;return this.set(l*a+n,l*o-s*c,l*c+s*o,0,l*o+s*c,d*o+n,d*c-s*a,0,l*c-s*o,d*c+s*a,r*c*c+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,a){return this.set(1,n,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){let s=this.elements,r=t._x,a=t._y,o=t._z,c=t._w,l=r+r,d=a+a,p=o+o,u=r*l,g=r*d,v=r*p,b=a*d,m=a*p,f=o*p,T=c*l,L=c*d,w=c*p,C=n.x,E=n.y,D=n.z;return s[0]=(1-(b+f))*C,s[1]=(g+w)*C,s[2]=(v-L)*C,s[3]=0,s[4]=(g-w)*E,s[5]=(1-(u+f))*E,s[6]=(m+T)*E,s[7]=0,s[8]=(v+L)*D,s[9]=(m-T)*D,s[10]=(1-(u+b))*D,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){let s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),t.identity(),this;let a=As.set(s[0],s[1],s[2]).length(),o=As.set(s[4],s[5],s[6]).length(),c=As.set(s[8],s[9],s[10]).length();r<0&&(a=-a),Zn.copy(this);let l=1/a,d=1/o,p=1/c;return Zn.elements[0]*=l,Zn.elements[1]*=l,Zn.elements[2]*=l,Zn.elements[4]*=d,Zn.elements[5]*=d,Zn.elements[6]*=d,Zn.elements[8]*=p,Zn.elements[9]*=p,Zn.elements[10]*=p,t.setFromRotationMatrix(Zn),n.x=a,n.y=o,n.z=c,this}makePerspective(e,t,n,s,r,a,o=jn,c=!1){let l=this.elements,d=2*r/(t-e),p=2*r/(n-s),u=(t+e)/(t-e),g=(n+s)/(n-s),v,b;if(c)v=r/(a-r),b=a*r/(a-r);else if(o===jn)v=-(a+r)/(a-r),b=-2*a*r/(a-r);else if(o===Ws)v=-a/(a-r),b=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return l[0]=d,l[4]=0,l[8]=u,l[12]=0,l[1]=0,l[5]=p,l[9]=g,l[13]=0,l[2]=0,l[6]=0,l[10]=v,l[14]=b,l[3]=0,l[7]=0,l[11]=-1,l[15]=0,this}makeOrthographic(e,t,n,s,r,a,o=jn,c=!1){let l=this.elements,d=2/(t-e),p=2/(n-s),u=-(t+e)/(t-e),g=-(n+s)/(n-s),v,b;if(c)v=1/(a-r),b=a/(a-r);else if(o===jn)v=-2/(a-r),b=-(a+r)/(a-r);else if(o===Ws)v=-1/(a-r),b=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return l[0]=d,l[4]=0,l[8]=0,l[12]=u,l[1]=0,l[5]=p,l[9]=0,l[13]=g,l[2]=0,l[6]=0,l[10]=v,l[14]=b,l[3]=0,l[7]=0,l[11]=0,l[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}};wo.prototype.isMatrix4=!0;var Dt=wo,As=new B,Zn=new Dt,rf=new B(0,0,0),af=new B(1,1,1),Ni=new B,pa=new B,On=new B,Ah=new Dt,Eh=new Wn,Ai=class i{constructor(e=0,t=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let s=e.elements,r=s[0],a=s[4],o=s[8],c=s[1],l=s[5],d=s[9],p=s[2],u=s[6],g=s[10];switch(t){case"XYZ":this._y=Math.asin(xt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-d,g),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(u,l),this._z=0);break;case"YXZ":this._x=Math.asin(-xt(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(o,g),this._z=Math.atan2(c,l)):(this._y=Math.atan2(-p,r),this._z=0);break;case"ZXY":this._x=Math.asin(xt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-p,g),this._z=Math.atan2(-a,l)):(this._y=0,this._z=Math.atan2(c,r));break;case"ZYX":this._y=Math.asin(-xt(p,-1,1)),Math.abs(p)<.9999999?(this._x=Math.atan2(u,g),this._z=Math.atan2(c,r)):(this._x=0,this._z=Math.atan2(-a,l));break;case"YZX":this._z=Math.asin(xt(c,-1,1)),Math.abs(c)<.9999999?(this._x=Math.atan2(-d,l),this._y=Math.atan2(-p,r)):(this._x=0,this._y=Math.atan2(o,g));break;case"XZY":this._z=Math.asin(-xt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(u,l),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-d,g),this._y=0);break;default:$e("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return Ah.makeRotationFromQuaternion(e),this.setFromRotationMatrix(Ah,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return Eh.setFromEuler(this),this.setFromQuaternion(Eh,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Ai.DEFAULT_ORDER="XYZ";var Ys=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},of=0,Ch=new B,Es=new Wn,vi=new Dt,ma=new B,fr=new B,lf=new B,cf=new Wn,Rh=new B(1,0,0),Ph=new B(0,1,0),Ih=new B(0,0,1),Lh={type:"added"},hf={type:"removed"},Cs={type:"childadded",child:null},Bl={type:"childremoved",child:null},en=class i extends ui{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:of++}),this.uuid=zi(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new B,t=new Ai,n=new Wn,s=new B(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Dt},normalMatrix:{value:new tt}}),this.matrix=new Dt,this.matrixWorld=new Dt,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new Ys,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return Es.setFromAxisAngle(e,t),this.quaternion.multiply(Es),this}rotateOnWorldAxis(e,t){return Es.setFromAxisAngle(e,t),this.quaternion.premultiply(Es),this}rotateX(e){return this.rotateOnAxis(Rh,e)}rotateY(e){return this.rotateOnAxis(Ph,e)}rotateZ(e){return this.rotateOnAxis(Ih,e)}translateOnAxis(e,t){return Ch.copy(e).applyQuaternion(this.quaternion),this.position.add(Ch.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(Rh,e)}translateY(e){return this.translateOnAxis(Ph,e)}translateZ(e){return this.translateOnAxis(Ih,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(vi.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?ma.copy(e):ma.set(e,t,n);let s=this.parent;this.updateWorldMatrix(!0,!1),fr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?vi.lookAt(fr,ma,this.up):vi.lookAt(ma,fr,this.up),this.quaternion.setFromRotationMatrix(vi),s&&(vi.extractRotation(s.matrixWorld),Es.setFromRotationMatrix(vi),this.quaternion.premultiply(Es.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(Je("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Lh),Cs.child=e,this.dispatchEvent(Cs),Cs.child=null):Je("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(hf),Bl.child=e,this.dispatchEvent(Bl),Bl.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),vi.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),vi.multiply(e.parent.matrixWorld)),e.applyMatrix4(vi),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Lh),Cs.child=e,this.dispatchEvent(Cs),Cs.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){let a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(fr,e,lf),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(fr,cf,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*n-r[8]*s,r[13]+=n-r[1]*t-r[5]*n-r[9]*s,r[14]+=s-r[2]*t-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,c){return o[c.uuid]===void 0&&(o[c.uuid]=c.toJSON(e)),c.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let c=o.shapes;if(Array.isArray(c))for(let l=0,d=c.length;l<d;l++){let p=c[l];r(e.shapes,p)}else r(e.shapes,c)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let c=0,l=this.material.length;c<l;c++)o.push(r(e.materials,this.material[c]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let c=this.animations[o];s.animations.push(r(e.animations,c))}}if(t){let o=a(e.geometries),c=a(e.materials),l=a(e.textures),d=a(e.images),p=a(e.shapes),u=a(e.skeletons),g=a(e.animations),v=a(e.nodes);o.length>0&&(n.geometries=o),c.length>0&&(n.materials=c),l.length>0&&(n.textures=l),d.length>0&&(n.images=d),p.length>0&&(n.shapes=p),u.length>0&&(n.skeletons=u),g.length>0&&(n.animations=g),v.length>0&&(n.nodes=v)}return n.object=s,n;function a(o){let c=[];for(let l in o){let d=o[l];delete d.metadata,c.push(d)}return c}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let s=e.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};en.DEFAULT_UP=new B(0,1,0);en.DEFAULT_MATRIX_AUTO_UPDATE=!0;en.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var Wt=class extends en{constructor(){super(),this.isGroup=!0,this.type="Group"}},uf={type:"move"},Zs=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Wt,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Wt,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new B,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new B),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Wt,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new B,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new B,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,a=null,o=this._targetRay,c=this._grip,l=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(l&&e.hand){a=!0;for(let b of e.hand.values()){let m=t.getJointPose(b,n),f=this._getHandJoint(l,b);m!==null&&(f.matrix.fromArray(m.transform.matrix),f.matrix.decompose(f.position,f.rotation,f.scale),f.matrixWorldNeedsUpdate=!0,f.jointRadius=m.radius),f.visible=m!==null}let d=l.joints["index-finger-tip"],p=l.joints["thumb-tip"],u=d.position.distanceTo(p.position),g=.02,v=.005;l.inputState.pinching&&u>g+v?(l.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!l.inputState.pinching&&u<=g-v&&(l.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else c!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(c.matrix.fromArray(r.transform.matrix),c.matrix.decompose(c.position,c.rotation,c.scale),c.matrixWorldNeedsUpdate=!0,r.linearVelocity?(c.hasLinearVelocity=!0,c.linearVelocity.copy(r.linearVelocity)):c.hasLinearVelocity=!1,r.angularVelocity?(c.hasAngularVelocity=!0,c.angularVelocity.copy(r.angularVelocity)):c.hasAngularVelocity=!1,c.eventsEnabled&&c.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(uf)))}return o!==null&&(o.visible=s!==null),c!==null&&(c.visible=r!==null),l!==null&&(l.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new Wt;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},Ou={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Ui={h:0,s:0,l:0},ga={h:0,s:0,l:0};function zl(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var Ye=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=ln){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,gt.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=gt.workingColorSpace){return this.r=e,this.g=t,this.b=n,gt.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=gt.workingColorSpace){if(e=ef(e,1),t=xt(t,0,1),n=xt(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=zl(a,r,e+1/3),this.g=zl(a,r,e),this.b=zl(a,r,e-1/3)}return gt.colorSpaceToWorking(this,s),this}setStyle(e,t=ln){function n(r){r!==void 0&&parseFloat(r)<1&&$e("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:$e("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);$e("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=ln){let n=Ou[e.toLowerCase()];return n!==void 0?this.setHex(n,t):$e("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Ti(e.r),this.g=Ti(e.g),this.b=Ti(e.b),this}copyLinearToSRGB(e){return this.r=Gs(e.r),this.g=Gs(e.g),this.b=Gs(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=ln){return gt.workingToColorSpace(vn.copy(this),e),Math.round(xt(vn.r*255,0,255))*65536+Math.round(xt(vn.g*255,0,255))*256+Math.round(xt(vn.b*255,0,255))}getHexString(e=ln){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=gt.workingColorSpace){gt.workingToColorSpace(vn.copy(this),t);let n=vn.r,s=vn.g,r=vn.b,a=Math.max(n,s,r),o=Math.min(n,s,r),c,l,d=(o+a)/2;if(o===a)c=0,l=0;else{let p=a-o;switch(l=d<=.5?p/(a+o):p/(2-a-o),a){case n:c=(s-r)/p+(s<r?6:0);break;case s:c=(r-n)/p+2;break;case r:c=(n-s)/p+4;break}c/=6}return e.h=c,e.s=l,e.l=d,e}getRGB(e,t=gt.workingColorSpace){return gt.workingToColorSpace(vn.copy(this),t),e.r=vn.r,e.g=vn.g,e.b=vn.b,e}getStyle(e=ln){gt.workingToColorSpace(vn.copy(this),e);let t=vn.r,n=vn.g,s=vn.b;return e!==ln?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(Ui),this.setHSL(Ui.h+e,Ui.s+t,Ui.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Ui),e.getHSL(ga);let n=Dl(Ui.h,ga.h,t),s=Dl(Ui.s,ga.s,t),r=Dl(Ui.l,ga.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},vn=new Ye;Ye.NAMES=Ou;var Er=class extends en{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Ai,this.environmentIntensity=1,this.environmentRotation=new Ai,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},$n=new B,yi=new B,kl=new B,Mi=new B,Rs=new B,Ps=new B,Dh=new B,Vl=new B,Gl=new B,Hl=new B,Wl=new Gt,Xl=new Gt,ql=new Gt,wi=class i{constructor(e=new B,t=new B,n=new B){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),$n.subVectors(e,t),s.cross($n);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){$n.subVectors(s,t),yi.subVectors(n,t),kl.subVectors(e,t);let a=$n.dot($n),o=$n.dot(yi),c=$n.dot(kl),l=yi.dot(yi),d=yi.dot(kl),p=a*l-o*o;if(p===0)return r.set(0,0,0),null;let u=1/p,g=(l*c-o*d)*u,v=(a*d-o*c)*u;return r.set(1-g-v,v,g)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,Mi)===null?!1:Mi.x>=0&&Mi.y>=0&&Mi.x+Mi.y<=1}static getInterpolation(e,t,n,s,r,a,o,c){return this.getBarycoord(e,t,n,s,Mi)===null?(c.x=0,c.y=0,"z"in c&&(c.z=0),"w"in c&&(c.w=0),null):(c.setScalar(0),c.addScaledVector(r,Mi.x),c.addScaledVector(a,Mi.y),c.addScaledVector(o,Mi.z),c)}static getInterpolatedAttribute(e,t,n,s,r,a){return Wl.setScalar(0),Xl.setScalar(0),ql.setScalar(0),Wl.fromBufferAttribute(e,t),Xl.fromBufferAttribute(e,n),ql.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(Wl,r.x),a.addScaledVector(Xl,r.y),a.addScaledVector(ql,r.z),a}static isFrontFacing(e,t,n,s){return $n.subVectors(n,t),yi.subVectors(e,t),$n.cross(yi).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return $n.subVectors(this.c,this.b),yi.subVectors(this.a,this.b),$n.cross(yi).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return i.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,s=this.b,r=this.c,a,o;Rs.subVectors(s,n),Ps.subVectors(r,n),Vl.subVectors(e,n);let c=Rs.dot(Vl),l=Ps.dot(Vl);if(c<=0&&l<=0)return t.copy(n);Gl.subVectors(e,s);let d=Rs.dot(Gl),p=Ps.dot(Gl);if(d>=0&&p<=d)return t.copy(s);let u=c*p-d*l;if(u<=0&&c>=0&&d<=0)return a=c/(c-d),t.copy(n).addScaledVector(Rs,a);Hl.subVectors(e,r);let g=Rs.dot(Hl),v=Ps.dot(Hl);if(v>=0&&g<=v)return t.copy(r);let b=g*l-c*v;if(b<=0&&l>=0&&v<=0)return o=l/(l-v),t.copy(n).addScaledVector(Ps,o);let m=d*v-g*p;if(m<=0&&p-d>=0&&g-v>=0)return Dh.subVectors(r,s),o=(p-d)/(p-d+(g-v)),t.copy(s).addScaledVector(Dh,o);let f=1/(m+b+u);return a=b*f,o=u*f,t.copy(n).addScaledVector(Rs,a).addScaledVector(Ps,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},ki=class{constructor(e=new B(1/0,1/0,1/0),t=new B(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Jn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Jn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=Jn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,Jn):Jn.fromBufferAttribute(r,a),Jn.applyMatrix4(e.matrixWorld),this.expandByPoint(Jn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),_a.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),_a.copy(n.boundingBox)),_a.applyMatrix4(e.matrixWorld),this.union(_a)}let s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Jn),Jn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(pr),xa.subVectors(this.max,pr),Is.subVectors(e.a,pr),Ls.subVectors(e.b,pr),Ds.subVectors(e.c,pr),Fi.subVectors(Ls,Is),Oi.subVectors(Ds,Ls),rs.subVectors(Is,Ds);let t=[0,-Fi.z,Fi.y,0,-Oi.z,Oi.y,0,-rs.z,rs.y,Fi.z,0,-Fi.x,Oi.z,0,-Oi.x,rs.z,0,-rs.x,-Fi.y,Fi.x,0,-Oi.y,Oi.x,0,-rs.y,rs.x,0];return!Yl(t,Is,Ls,Ds,xa)||(t=[1,0,0,0,1,0,0,0,1],!Yl(t,Is,Ls,Ds,xa))?!1:(va.crossVectors(Fi,Oi),t=[va.x,va.y,va.z],Yl(t,Is,Ls,Ds,xa))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Jn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Jn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Si[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Si[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Si[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Si[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Si[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Si[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Si[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Si[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Si),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Si=[new B,new B,new B,new B,new B,new B,new B,new B],Jn=new B,_a=new ki,Is=new B,Ls=new B,Ds=new B,Fi=new B,Oi=new B,rs=new B,pr=new B,xa=new B,va=new B,as=new B;function Yl(i,e,t,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){as.fromArray(i,r);let o=s.x*Math.abs(as.x)+s.y*Math.abs(as.y)+s.z*Math.abs(as.z),c=e.dot(as),l=t.dot(as),d=n.dot(as);if(Math.max(-Math.max(c,l,d),Math.min(c,l,d))>o)return!1}return!0}var $t=new B,ya=new Ke,df=0,zn=class extends ui{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:df++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=Lc,this.updateRanges=[],this.gpuType=si,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)ya.fromBufferAttribute(this,t),ya.applyMatrix3(e),this.setXY(t,ya.x,ya.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)$t.fromBufferAttribute(this,t),$t.applyMatrix3(e),this.setXYZ(t,$t.x,$t.y,$t.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)$t.fromBufferAttribute(this,t),$t.applyMatrix4(e),this.setXYZ(t,$t.x,$t.y,$t.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)$t.fromBufferAttribute(this,t),$t.applyNormalMatrix(e),this.setXYZ(t,$t.x,$t.y,$t.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)$t.fromBufferAttribute(this,t),$t.transformDirection(e),this.setXYZ(t,$t.x,$t.y,$t.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=li(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=It(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=li(t,this.array)),t}setX(e,t){return this.normalized&&(t=It(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=li(t,this.array)),t}setY(e,t){return this.normalized&&(t=It(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=li(t,this.array)),t}setZ(e,t){return this.normalized&&(t=It(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=li(t,this.array)),t}setW(e,t){return this.normalized&&(t=It(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=It(t,this.array),n=It(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=It(t,this.array),n=It(n,this.array),s=It(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=It(t,this.array),n=It(n,this.array),s=It(s,this.array),r=It(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}};var Cr=class extends zn{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var Rr=class extends zn{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var rt=class extends zn{constructor(e,t,n){super(new Float32Array(e),t,n)}},ff=new ki,mr=new B,Zl=new B,Vi=class{constructor(e=new B,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):ff.setFromPoints(e).getCenter(n);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;mr.subVectors(e,this.center);let t=mr.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(mr,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Zl.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(mr.copy(e.center).add(Zl)),this.expandByPoint(mr.copy(e.center).sub(Zl))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},pf=0,Hn=new Dt,$l=new en,Ns=new B,Bn=new ki,gr=new ki,on=new B,Ct=class i extends ui{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:pf++}),this.uuid=zi(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(jd(e)?Rr:Cr)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new tt().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return Hn.makeRotationFromQuaternion(e),this.applyMatrix4(Hn),this}rotateX(e){return Hn.makeRotationX(e),this.applyMatrix4(Hn),this}rotateY(e){return Hn.makeRotationY(e),this.applyMatrix4(Hn),this}rotateZ(e){return Hn.makeRotationZ(e),this.applyMatrix4(Hn),this}translate(e,t,n){return Hn.makeTranslation(e,t,n),this.applyMatrix4(Hn),this}scale(e,t,n){return Hn.makeScale(e,t,n),this.applyMatrix4(Hn),this}lookAt(e){return $l.lookAt(e),$l.updateMatrix(),this.applyMatrix4($l.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Ns).negate(),this.translate(Ns.x,Ns.y,Ns.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let s=0,r=e.length;s<r;s++){let a=e[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new rt(n,3))}else{let n=Math.min(e.length,t.count);for(let s=0;s<n;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&$e("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ki);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Je("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new B(-1/0,-1/0,-1/0),new B(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){let r=t[n];Bn.setFromBufferAttribute(r),this.morphTargetsRelative?(on.addVectors(this.boundingBox.min,Bn.min),this.boundingBox.expandByPoint(on),on.addVectors(this.boundingBox.max,Bn.max),this.boundingBox.expandByPoint(on)):(this.boundingBox.expandByPoint(Bn.min),this.boundingBox.expandByPoint(Bn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Je('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Vi);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Je("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new B,1/0);return}if(e){let n=this.boundingSphere.center;if(Bn.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){let o=t[r];gr.setFromBufferAttribute(o),this.morphTargetsRelative?(on.addVectors(Bn.min,gr.min),Bn.expandByPoint(on),on.addVectors(Bn.max,gr.max),Bn.expandByPoint(on)):(Bn.expandByPoint(gr.min),Bn.expandByPoint(gr.max))}Bn.getCenter(n);let s=0;for(let r=0,a=e.count;r<a;r++)on.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(on));if(t)for(let r=0,a=t.length;r<a;r++){let o=t[r],c=this.morphTargetsRelative;for(let l=0,d=o.count;l<d;l++)on.fromBufferAttribute(o,l),c&&(Ns.fromBufferAttribute(e,l),on.add(Ns)),s=Math.max(s,n.distanceToSquared(on))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Je('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Je("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,s=t.normal,r=t.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new zn(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));let o=[],c=[];for(let _=0;_<n.count;_++)o[_]=new B,c[_]=new B;let l=new B,d=new B,p=new B,u=new Ke,g=new Ke,v=new Ke,b=new B,m=new B;function f(_,R,N){l.fromBufferAttribute(n,_),d.fromBufferAttribute(n,R),p.fromBufferAttribute(n,N),u.fromBufferAttribute(r,_),g.fromBufferAttribute(r,R),v.fromBufferAttribute(r,N),d.sub(l),p.sub(l),g.sub(u),v.sub(u);let V=1/(g.x*v.y-v.x*g.y);isFinite(V)&&(b.copy(d).multiplyScalar(v.y).addScaledVector(p,-g.y).multiplyScalar(V),m.copy(p).multiplyScalar(g.x).addScaledVector(d,-v.x).multiplyScalar(V),o[_].add(b),o[R].add(b),o[N].add(b),c[_].add(m),c[R].add(m),c[N].add(m))}let T=this.groups;T.length===0&&(T=[{start:0,count:e.count}]);for(let _=0,R=T.length;_<R;++_){let N=T[_],V=N.start,G=N.count;for(let $=V,z=V+G;$<z;$+=3)f(e.getX($+0),e.getX($+1),e.getX($+2))}let L=new B,w=new B,C=new B,E=new B;function D(_){C.fromBufferAttribute(s,_),E.copy(C);let R=o[_];L.copy(R),L.sub(C.multiplyScalar(C.dot(R))).normalize(),w.crossVectors(E,R);let V=w.dot(c[_])<0?-1:1;a.setXYZW(_,L.x,L.y,L.z,V)}for(let _=0,R=T.length;_<R;++_){let N=T[_],V=N.start,G=N.count;for(let $=V,z=V+G;$<z;$+=3)D(e.getX($+0)),D(e.getX($+1)),D(e.getX($+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new zn(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let u=0,g=n.count;u<g;u++)n.setXYZ(u,0,0,0);let s=new B,r=new B,a=new B,o=new B,c=new B,l=new B,d=new B,p=new B;if(e)for(let u=0,g=e.count;u<g;u+=3){let v=e.getX(u+0),b=e.getX(u+1),m=e.getX(u+2);s.fromBufferAttribute(t,v),r.fromBufferAttribute(t,b),a.fromBufferAttribute(t,m),d.subVectors(a,r),p.subVectors(s,r),d.cross(p),o.fromBufferAttribute(n,v),c.fromBufferAttribute(n,b),l.fromBufferAttribute(n,m),o.add(d),c.add(d),l.add(d),n.setXYZ(v,o.x,o.y,o.z),n.setXYZ(b,c.x,c.y,c.z),n.setXYZ(m,l.x,l.y,l.z)}else for(let u=0,g=t.count;u<g;u+=3)s.fromBufferAttribute(t,u+0),r.fromBufferAttribute(t,u+1),a.fromBufferAttribute(t,u+2),d.subVectors(a,r),p.subVectors(s,r),d.cross(p),n.setXYZ(u+0,d.x,d.y,d.z),n.setXYZ(u+1,d.x,d.y,d.z),n.setXYZ(u+2,d.x,d.y,d.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)on.fromBufferAttribute(e,t),on.normalize(),e.setXYZ(t,on.x,on.y,on.z)}toNonIndexed(){function e(o,c){let l=o.array,d=o.itemSize,p=o.normalized,u=new l.constructor(c.length*d),g=0,v=0;for(let b=0,m=c.length;b<m;b++){o.isInterleavedBufferAttribute?g=c[b]*o.data.stride+o.offset:g=c[b]*d;for(let f=0;f<d;f++)u[v++]=l[g++]}return new zn(u,d,p)}if(this.index===null)return $e("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,s=this.attributes;for(let o in s){let c=s[o],l=e(c,n);t.setAttribute(o,l)}let r=this.morphAttributes;for(let o in r){let c=[],l=r[o];for(let d=0,p=l.length;d<p;d++){let u=l[d],g=e(u,n);c.push(g)}t.morphAttributes[o]=c}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,c=a.length;o<c;o++){let l=a[o];t.addGroup(l.start,l.count,l.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let c=this.parameters;for(let l in c)c[l]!==void 0&&(e[l]=c[l]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let c in n){let l=n[c];e.data.attributes[c]=l.toJSON(e.data)}let s={},r=!1;for(let c in this.morphAttributes){let l=this.morphAttributes[c],d=[];for(let p=0,u=l.length;p<u;p++){let g=l[p];d.push(g.toJSON(e.data))}d.length>0&&(s[c]=d,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let s=e.attributes;for(let l in s){let d=s[l];this.setAttribute(l,d.clone(t))}let r=e.morphAttributes;for(let l in r){let d=[],p=r[l];for(let u=0,g=p.length;u<g;u++)d.push(p[u].clone(t));this.morphAttributes[l]=d}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let l=0,d=a.length;l<d;l++){let p=a[l];this.addGroup(p.start,p.count,p.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let c=e.boundingSphere;return c!==null&&(this.boundingSphere=c.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},no=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=Lc,this.updateRanges=[],this.version=0,this.uuid=zi()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let s=0,r=this.stride;s<r;s++)this.array[e+s]=t.array[n+s];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=zi()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=zi()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer)));let t={uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride};return t.usage=this.usage,t}},wn=new B,Pr=class i{constructor(e,t,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)wn.fromBufferAttribute(this,t),wn.applyMatrix4(e),this.setXYZ(t,wn.x,wn.y,wn.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)wn.fromBufferAttribute(this,t),wn.applyNormalMatrix(e),this.setXYZ(t,wn.x,wn.y,wn.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)wn.fromBufferAttribute(this,t),wn.transformDirection(e),this.setXYZ(t,wn.x,wn.y,wn.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=li(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=It(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=It(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=It(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=It(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=It(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=li(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=li(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=li(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=li(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=It(t,this.array),n=It(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=It(t,this.array),n=It(n,this.array),s=It(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=It(t,this.array),n=It(n,this.array),s=It(s,this.array),r=It(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this.data.array[e+3]=r,this}clone(e){if(e===void 0){Tr("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return new zn(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new i(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){Tr("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},Jl=new B,mf=new B,gf=new tt,Kn=class{constructor(e=new B(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let s=Jl.subVectors(n,t).cross(mf.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let s=e.delta(Jl),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(s,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||gf.getNormalMatrix(e),s=this.coplanarPoint(Jl).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},_f=0,Qn=class extends ui{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:_f++}),this.uuid=zi(),this.name="",this.type="Material",this.blending=Ki,this.side=Ji,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=mc,this.blendDst=gc,this.blendEquation=gs,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ye(0,0,0),this.blendAlpha=0,this.depthFunc=Hs,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=Au,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=Va,this.stencilZFail=Va,this.stencilZPass=Va,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){$e(`Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){$e(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let a=[];for(let o in r){let c=r[o];delete c.metadata,a.push(c)}return a}if(t){let r=s(e.textures),a=s(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Ye().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new Kn().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new Ke().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Ke().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},Gi=class extends Qn{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Ye(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Us,_r=new B,Fs=new B,Os=new B,Bs=new Ke,xr=new Ke,Bu=new Dt,Ma=new B,vr=new B,Sa=new B,Nh=new Ke,Kl=new Ke,Uh=new Ke,hs=class extends en{constructor(e=new Gi){if(super(),this.isSprite=!0,this.type="Sprite",Us===void 0){Us=new Ct;let t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new no(t,5);Us.setIndex([0,1,2,0,2,3]),Us.setAttribute("position",new Pr(n,3,0,!1)),Us.setAttribute("uv",new Pr(n,2,3,!1))}this.geometry=Us,this.material=e,this.center=new Ke(.5,.5),this.count=1}intersectsFrustum(e){return e.intersectsSprite(this)}raycast(e,t){e.camera===null&&Je('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Fs.setFromMatrixScale(this.matrixWorld),Bu.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),Os.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Fs.multiplyScalar(-Os.z);let n=this.material.rotation,s,r;n!==0&&(r=Math.cos(n),s=Math.sin(n));let a=this.center;ba(Ma.set(-.5,-.5,0),Os,a,Fs,s,r),ba(vr.set(.5,-.5,0),Os,a,Fs,s,r),ba(Sa.set(.5,.5,0),Os,a,Fs,s,r),Nh.set(0,0),Kl.set(1,0),Uh.set(1,1);let o=e.ray.intersectTriangle(Ma,vr,Sa,!1,_r);if(o===null&&(ba(vr.set(-.5,.5,0),Os,a,Fs,s,r),Kl.set(0,1),o=e.ray.intersectTriangle(Ma,Sa,vr,!1,_r),o===null))return;let c=e.ray.origin.distanceTo(_r);c<e.near||c>e.far||t.push({distance:c,point:_r.clone(),uv:wi.getInterpolation(_r,Ma,vr,Sa,Nh,Kl,Uh,new Ke),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}};function ba(i,e,t,n,s,r){Bs.subVectors(i,t).addScalar(.5).multiply(n),s!==void 0?(xr.x=r*Bs.x-s*Bs.y,xr.y=s*Bs.x+r*Bs.y):xr.copy(Bs),i.copy(e),i.x+=xr.x,i.y+=xr.y,i.applyMatrix4(Bu)}var bi=new B,jl=new B,wa=new B,Ta=new B,us=class{constructor(e=new B,t=new B(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,bi)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=bi.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(bi.copy(this.origin).addScaledVector(this.direction,t),bi.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){jl.copy(e).add(t).multiplyScalar(.5),wa.copy(t).sub(e).normalize(),Ta.copy(this.origin).sub(jl);let r=e.distanceTo(t)*.5,a=-this.direction.dot(wa),o=Ta.dot(this.direction),c=-Ta.dot(wa),l=Ta.lengthSq(),d=Math.abs(1-a*a),p,u,g,v;if(d>0)if(p=a*c-o,u=a*o-c,v=r*d,p>=0)if(u>=-v)if(u<=v){let b=1/d;p*=b,u*=b,g=p*(p+a*u+2*o)+u*(a*p+u+2*c)+l}else u=r,p=Math.max(0,-(a*u+o)),g=-p*p+u*(u+2*c)+l;else u=-r,p=Math.max(0,-(a*u+o)),g=-p*p+u*(u+2*c)+l;else u<=-v?(p=Math.max(0,-(-a*r+o)),u=p>0?-r:Math.min(Math.max(-r,-c),r),g=-p*p+u*(u+2*c)+l):u<=v?(p=0,u=Math.min(Math.max(-r,-c),r),g=u*(u+2*c)+l):(p=Math.max(0,-(a*r+o)),u=p>0?r:Math.min(Math.max(-r,-c),r),g=-p*p+u*(u+2*c)+l);else u=a>0?-r:r,p=Math.max(0,-(a*u+o)),g=-p*p+u*(u+2*c)+l;return n&&n.copy(this.origin).addScaledVector(this.direction,p),s&&s.copy(jl).addScaledVector(wa,u),g}intersectSphere(e,t){if(e.radius<0)return null;bi.subVectors(e.center,this.origin);let n=bi.dot(this.direction),s=bi.dot(bi)-n*n,r=e.radius*e.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=n-a,c=n+a;return c<0?null:o<0?this.at(c,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,a,o,c,l=1/this.direction.x,d=1/this.direction.y,p=1/this.direction.z,u=this.origin;return l>=0?(n=(e.min.x-u.x)*l,s=(e.max.x-u.x)*l):(n=(e.max.x-u.x)*l,s=(e.min.x-u.x)*l),d>=0?(r=(e.min.y-u.y)*d,a=(e.max.y-u.y)*d):(r=(e.max.y-u.y)*d,a=(e.min.y-u.y)*d),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),p>=0?(o=(e.min.z-u.z)*p,c=(e.max.z-u.z)*p):(o=(e.max.z-u.z)*p,c=(e.min.z-u.z)*p),n>c||o>s)||((o>n||n!==n)&&(n=o),(c<s||s!==s)&&(s=c),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,bi)!==null}intersectTriangle(e,t,n,s,r){let a=this.origin,o=this.direction,c=o.x,l=o.y,d=o.z,p=e.x-a.x,u=e.y-a.y,g=e.z-a.z,v=t.x-a.x,b=t.y-a.y,m=t.z-a.z,f=n.x-a.x,T=n.y-a.y,L=n.z-a.z,w=Math.abs(c),C=Math.abs(l),E=Math.abs(d),D,_,R,N,V,G,$,z,K,ie,te,X;if(w>=C&&w>=E?(R=c,G=p,K=v,X=f,c>=0?(D=l,_=d,N=u,V=g,$=b,z=m,ie=T,te=L):(D=d,_=l,N=g,V=u,$=m,z=b,ie=L,te=T)):C>=E?(R=l,G=u,K=b,X=T,l>=0?(D=d,_=c,N=g,V=p,$=m,z=v,ie=L,te=f):(D=c,_=d,N=p,V=g,$=v,z=m,ie=f,te=L)):(R=d,G=g,K=m,X=L,d>=0?(D=c,_=l,N=p,V=u,$=v,z=b,ie=f,te=T):(D=l,_=c,N=u,V=p,$=b,z=v,ie=T,te=f)),R===0)return null;let ee=D/R,ce=_/R,ge=1/R,Xe=N-ee*G,Ve=V-ce*G,vt=$-ee*K,ut=z-ce*K,ot=ie-ee*X,se=te-ce*X,he=ot*ut-se*vt,ve=Xe*se-Ve*ot,Ze=vt*Ve-ut*Xe;if(s){if(he<0||ve<0||Ze<0)return null}else if((he<0||ve<0||Ze<0)&&(he>0||ve>0||Ze>0))return null;let Fe=he+ve+Ze;if(Fe===0)return null;let je=ge*(he*G+ve*K+Ze*X);return(Fe>0?je<0:je>0)?null:this.at(je/Fe,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},hn=class extends Qn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ye(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ai,this.combine=To,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},Fh=new Dt,os=new us,Aa=new Vi,Oh=new B,Ea=new B,Ca=new B,Ra=new B,Ql=new B,Pa=new B,Bh=new B,Ia=new B,bt=class extends en{constructor(e=new Ct,t=new hn){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(s,e);let o=this.morphTargetInfluences;if(r&&o){Pa.set(0,0,0);for(let c=0,l=r.length;c<l;c++){let d=o[c],p=r[c];d!==0&&(Ql.fromBufferAttribute(p,e),a?Pa.addScaledVector(Ql,d):Pa.addScaledVector(Ql.sub(t),d))}t.add(Pa)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Aa.copy(n.boundingSphere),Aa.applyMatrix4(r),os.copy(e.ray).recast(e.near),!(Aa.containsPoint(os.origin)===!1&&(os.intersectSphere(Aa,Oh)===null||os.origin.distanceToSquared(Oh)>(e.far-e.near)**2))&&(Fh.copy(r).invert(),os.copy(e.ray).applyMatrix4(Fh),!(n.boundingBox!==null&&os.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,os)))}_computeIntersections(e,t,n){let s,r=this.geometry,a=this.material,o=r.index,c=r.attributes.position,l=r.attributes.uv,d=r.attributes.uv1,p=r.attributes.normal,u=r.groups,g=r.drawRange;if(o!==null)if(Array.isArray(a))for(let v=0,b=u.length;v<b;v++){let m=u[v],f=a[m.materialIndex],T=Math.max(m.start,g.start),L=Math.min(o.count,Math.min(m.start+m.count,g.start+g.count));for(let w=T,C=L;w<C;w+=3){let E=o.getX(w),D=o.getX(w+1),_=o.getX(w+2);s=La(this,f,e,n,l,d,p,E,D,_),s&&(s.faceIndex=Math.floor(w/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let v=Math.max(0,g.start),b=Math.min(o.count,g.start+g.count);for(let m=v,f=b;m<f;m+=3){let T=o.getX(m),L=o.getX(m+1),w=o.getX(m+2);s=La(this,a,e,n,l,d,p,T,L,w),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}else if(c!==void 0)if(Array.isArray(a))for(let v=0,b=u.length;v<b;v++){let m=u[v],f=a[m.materialIndex],T=Math.max(m.start,g.start),L=Math.min(c.count,Math.min(m.start+m.count,g.start+g.count));for(let w=T,C=L;w<C;w+=3){let E=w,D=w+1,_=w+2;s=La(this,f,e,n,l,d,p,E,D,_),s&&(s.faceIndex=Math.floor(w/3),s.face.materialIndex=m.materialIndex,t.push(s))}}else{let v=Math.max(0,g.start),b=Math.min(c.count,g.start+g.count);for(let m=v,f=b;m<f;m+=3){let T=m,L=m+1,w=m+2;s=La(this,a,e,n,l,d,p,T,L,w),s&&(s.faceIndex=Math.floor(m/3),t.push(s))}}}};function xf(i,e,t,n,s,r,a,o){let c;if(e.side===un?c=n.intersectTriangle(a,r,s,!0,o):c=n.intersectTriangle(s,r,a,e.side===Ji,o),c===null)return null;Ia.copy(o),Ia.applyMatrix4(i.matrixWorld);let l=t.ray.origin.distanceTo(Ia);return l<t.near||l>t.far?null:{distance:l,point:Ia.clone(),object:i}}function La(i,e,t,n,s,r,a,o,c,l){i.getVertexPosition(o,Ea),i.getVertexPosition(c,Ca),i.getVertexPosition(l,Ra);let d=xf(i,e,t,n,Ea,Ca,Ra,Bh);if(d){let p=new B;wi.getBarycoord(Bh,Ea,Ca,Ra,p),s&&(d.uv=wi.getInterpolatedAttribute(s,o,c,l,p,new Ke)),r&&(d.uv1=wi.getInterpolatedAttribute(r,o,c,l,p,new Ke)),a&&(d.normal=wi.getInterpolatedAttribute(a,o,c,l,p,new B),d.normal.dot(n.direction)>0&&d.normal.multiplyScalar(-1));let u={a:o,b:c,c:l,normal:new B,materialIndex:0};wi.getNormal(Ea,Ca,Ra,u.normal),d.face=u,d.barycoord=p}return d}var io=class extends Tn{constructor(e=null,t=1,n=1,s,r,a,o,c,l=cn,d=cn,p,u){super(null,a,o,c,l,d,s,r,p,u),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var ls=new Vi,vf=new Ke(.5,.5),Da=new B,$s=class{constructor(e=new Kn,t=new Kn,n=new Kn,s=new Kn,r=new Kn,a=new Kn){this.planes=[e,t,n,s,r,a]}set(e,t,n,s,r,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=jn,n=!1){let s=this.planes,r=e.elements,a=r[0],o=r[1],c=r[2],l=r[3],d=r[4],p=r[5],u=r[6],g=r[7],v=r[8],b=r[9],m=r[10],f=r[11],T=r[12],L=r[13],w=r[14],C=r[15];if(s[0].setComponents(l-a,g-d,f-v,C-T).normalize(),s[1].setComponents(l+a,g+d,f+v,C+T).normalize(),s[2].setComponents(l+o,g+p,f+b,C+L).normalize(),s[3].setComponents(l-o,g-p,f-b,C-L).normalize(),n)s[4].setComponents(c,u,m,w).normalize(),s[5].setComponents(l-c,g-u,f-m,C-w).normalize();else if(s[4].setComponents(l-c,g-u,f-m,C-w).normalize(),t===jn)s[5].setComponents(l+c,g+u,f+m,C+w).normalize();else if(t===Ws)s[5].setComponents(c,u,m,w).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),ls.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),ls.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(ls)}intersectsSprite(e){ls.center.set(0,0,0);let t=vf.distanceTo(e.center);return ls.radius=.7071067811865476+t,ls.applyMatrix4(e.matrixWorld),this.intersectsSphere(ls)}intersectsSphere(e){let t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let s=t[n];if(Da.x=s.normal.x>0?e.max.x:e.min.x,Da.y=s.normal.y>0?e.max.y:e.min.y,Da.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(Da)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var ei=class extends Qn{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ye(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},so=new B,ro=new B,zh=new Dt,yr=new us,Na=new Vi,ec=new B,kh=new B,Ei=class extends en{constructor(e=new Ct,t=new ei){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)so.fromBufferAttribute(t,s-1),ro.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=so.distanceTo(ro);e.setAttribute("lineDistance",new rt(n,1))}else $e("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Na.copy(n.boundingSphere),Na.applyMatrix4(s),Na.radius+=r,e.ray.intersectsSphere(Na)===!1)return;zh.copy(s).invert(),yr.copy(e.ray).applyMatrix4(zh);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,l=this.isLineSegments?2:1,d=n.index,u=n.attributes.position;if(d!==null){let g=Math.max(0,a.start),v=Math.min(d.count,a.start+a.count);for(let b=g,m=v-1;b<m;b+=l){let f=d.getX(b),T=d.getX(b+1),L=Ua(this,e,yr,c,f,T,b);L&&t.push(L)}if(this.isLineLoop){let b=d.getX(v-1),m=d.getX(g),f=Ua(this,e,yr,c,b,m,v-1);f&&t.push(f)}}else{let g=Math.max(0,a.start),v=Math.min(u.count,a.start+a.count);for(let b=g,m=v-1;b<m;b+=l){let f=Ua(this,e,yr,c,b,b+1,b);f&&t.push(f)}if(this.isLineLoop){let b=Ua(this,e,yr,c,v-1,g,v-1);b&&t.push(b)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function Ua(i,e,t,n,s,r,a){let o=i.geometry.attributes.position;if(so.fromBufferAttribute(o,s),ro.fromBufferAttribute(o,r),t.distanceSqToSegment(so,ro,ec,kh)>n)return;ec.applyMatrix4(i.matrixWorld);let l=e.ray.origin.distanceTo(ec);if(!(l<e.near||l>e.far))return{distance:l,point:kh.clone().applyMatrix4(i.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:i}}var Vh=new B,Gh=new B,Js=class extends Ei{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)Vh.fromBufferAttribute(t,s),Gh.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+Vh.distanceTo(Gh);e.setAttribute("lineDistance",new rt(n,1))}else $e("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}};var Hi=class extends Qn{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Ye(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Hh=new Dt,oc=new us,Fa=new Vi,Oa=new B,ds=class extends en{constructor(e=new Ct,t=new Hi){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Fa.copy(n.boundingSphere),Fa.applyMatrix4(s),Fa.radius+=r,e.ray.intersectsSphere(Fa)===!1)return;Hh.copy(s).invert(),oc.copy(e.ray).applyMatrix4(Hh);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),c=o*o,l=n.index,p=n.attributes.position;if(l!==null){let u=Math.max(0,a.start),g=Math.min(l.count,a.start+a.count);for(let v=u,b=g;v<b;v++){let m=l.getX(v);Oa.fromBufferAttribute(p,m),Wh(Oa,m,c,s,e,t,this)}}else{let u=Math.max(0,a.start),g=Math.min(p.count,a.start+a.count);for(let v=u,b=g;v<b;v++)Oa.fromBufferAttribute(p,v),Wh(Oa,v,c,s,e,t,this)}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function Wh(i,e,t,n,s,r,a){let o=oc.distanceSqToPoint(i);if(o<t){let c=new B;oc.closestPointToPoint(i,c),c.applyMatrix4(n);let l=s.ray.origin.distanceTo(c);if(l<s.near||l>s.far)return;r.push({distance:l,distanceToRay:Math.sqrt(o),point:c,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}var Ir=class extends Tn{constructor(e=[],t=ji,n,s,r,a,o,c,l,d){super(e,t,n,s,r,a,o,c,l,d),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},fs=class extends Tn{constructor(e,t,n,s,r,a,o,c,l){super(e,t,n,s,r,a,o,c,l),this.isCanvasTexture=!0,this.needsUpdate=!0}};var Wi=class extends Tn{constructor(e,t,n=ii,s,r,a,o=cn,c=cn,l,d=hi,p=1){if(d!==hi&&d!==es)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let u={width:e,height:t,depth:p};super(u,s,r,a,o,c,d,n,l),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new qs(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},ao=class extends Wi{constructor(e,t=ii,n=ji,s,r,a=cn,o=cn,c,l=hi){let d={width:e,height:e,depth:1},p=[d,d,d,d,d,d];super(e,e,t,n,s,r,a,o,c,l),this.image=p,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},Lr=class extends Tn{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Ci=class i extends Ct{constructor(e=1,t=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let c=[],l=[],d=[],p=[],u=0,g=0;v("z","y","x",-1,-1,n,t,e,a,r,0),v("z","y","x",1,-1,n,t,-e,a,r,1),v("x","z","y",1,1,e,n,t,s,a,2),v("x","z","y",1,-1,e,n,-t,s,a,3),v("x","y","z",1,-1,e,t,n,s,r,4),v("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(c),this.setAttribute("position",new rt(l,3)),this.setAttribute("normal",new rt(d,3)),this.setAttribute("uv",new rt(p,2));function v(b,m,f,T,L,w,C,E,D,_,R){let N=w/D,V=C/_,G=w/2,$=C/2,z=E/2,K=D+1,ie=_+1,te=0,X=0,ee=new B;for(let ce=0;ce<ie;ce++){let ge=ce*V-$;for(let Xe=0;Xe<K;Xe++){let Ve=Xe*N-G;ee[b]=Ve*T,ee[m]=ge*L,ee[f]=z,l.push(ee.x,ee.y,ee.z),ee[b]=0,ee[m]=0,ee[f]=E>0?1:-1,d.push(ee.x,ee.y,ee.z),p.push(Xe/D),p.push(1-ce/_),te+=1}}for(let ce=0;ce<_;ce++)for(let ge=0;ge<D;ge++){let Xe=u+ge+K*ce,Ve=u+ge+K*(ce+1),vt=u+(ge+1)+K*(ce+1),ut=u+(ge+1)+K*ce;c.push(Xe,Ve,ut),c.push(Ve,vt,ut),X+=6}o.addGroup(g,X,R),g+=X,u+=te}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};var ps=class i extends Ct{constructor(e=1,t=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:s},t=Math.max(3,t);let r=[],a=[],o=[],c=[],l=new B,d=new Ke;a.push(0,0,0),o.push(0,0,1),c.push(.5,.5);for(let p=0,u=3;p<=t;p++,u+=3){let g=n+p/t*s;l.x=e*Math.cos(g),l.y=e*Math.sin(g),a.push(l.x,l.y,l.z),o.push(0,0,1),d.x=(a[u]/e+1)/2,d.y=(a[u+1]/e+1)/2,c.push(d.x,d.y)}for(let p=1;p<=t;p++)r.push(p,p+1,0);this.setIndex(r),this.setAttribute("position",new rt(a,3)),this.setAttribute("normal",new rt(o,3)),this.setAttribute("uv",new rt(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.segments,e.thetaStart,e.thetaLength)}},di=class i extends Ct{constructor(e=1,t=1,n=1,s=32,r=1,a=!1,o=0,c=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:c};let l=this;s=Math.floor(s),r=Math.floor(r);let d=[],p=[],u=[],g=[],v=0,b=[],m=n/2,f=0;T(),a===!1&&(e>0&&L(!0),t>0&&L(!1)),this.setIndex(d),this.setAttribute("position",new rt(p,3)),this.setAttribute("normal",new rt(u,3)),this.setAttribute("uv",new rt(g,2));function T(){let w=new B,C=new B,E=0,D=(t-e)/n;for(let _=0;_<=r;_++){let R=[],N=_/r,V=N*(t-e)+e;for(let G=0;G<=s;G++){let $=G/s,z=$*c+o,K=Math.sin(z),ie=Math.cos(z);C.x=V*K,C.y=-N*n+m,C.z=V*ie,p.push(C.x,C.y,C.z),w.set(K,D,ie).normalize(),u.push(w.x,w.y,w.z),g.push($,1-N),R.push(v++)}b.push(R)}for(let _=0;_<s;_++)for(let R=0;R<r;R++){let N=b[R][_],V=b[R+1][_],G=b[R+1][_+1],$=b[R][_+1];(e>0||R!==0)&&(d.push(N,V,$),E+=3),(t>0||R!==r-1)&&(d.push(V,G,$),E+=3)}l.addGroup(f,E,0),f+=E}function L(w){let C=v,E=new Ke,D=new B,_=0,R=w===!0?e:t,N=w===!0?1:-1;for(let G=1;G<=s;G++)p.push(0,m*N,0),u.push(0,N,0),g.push(.5,.5),v++;let V=v;for(let G=0;G<=s;G++){let z=G/s*c+o,K=Math.cos(z),ie=Math.sin(z);D.x=R*ie,D.y=m*N,D.z=R*K,p.push(D.x,D.y,D.z),u.push(0,N,0),E.x=K*.5+.5,E.y=ie*.5*N+.5,g.push(E.x,E.y),v++}for(let G=0;G<s;G++){let $=C+G,z=V+G;w===!0?d.push(z,z+1,$):d.push(z+1,z,$),_+=3}l.addGroup(f,_,w===!0?1:2),f+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},Ks=class i extends di{constructor(e=1,t=1,n=32,s=1,r=!1,a=0,o=Math.PI*2){super(0,e,t,n,s,r,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(e){return new i(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},js=class i extends Ct{constructor(e=[],t=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:s};let r=[],a=[];o(s),l(n),d(),this.setAttribute("position",new rt(r,3)),this.setAttribute("normal",new rt(r.slice(),3)),this.setAttribute("uv",new rt(a,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function o(T){let L=new B,w=new B,C=new B;for(let E=0;E<t.length;E+=3)g(t[E+0],L),g(t[E+1],w),g(t[E+2],C),c(L,w,C,T)}function c(T,L,w,C){let E=C+1,D=[];for(let _=0;_<=E;_++){D[_]=[];let R=T.clone().lerp(w,_/E),N=L.clone().lerp(w,_/E),V=E-_;for(let G=0;G<=V;G++)G===0&&_===E?D[_][G]=R:D[_][G]=R.clone().lerp(N,G/V)}for(let _=0;_<E;_++)for(let R=0;R<2*(E-_)-1;R++){let N=Math.floor(R/2);R%2===0?(u(D[_][N+1]),u(D[_+1][N]),u(D[_][N])):(u(D[_][N+1]),u(D[_+1][N+1]),u(D[_+1][N]))}}function l(T){let L=new B;for(let w=0;w<r.length;w+=3)L.x=r[w+0],L.y=r[w+1],L.z=r[w+2],L.normalize().multiplyScalar(T),r[w+0]=L.x,r[w+1]=L.y,r[w+2]=L.z}function d(){let T=new B;for(let L=0;L<r.length;L+=3){T.x=r[L+0],T.y=r[L+1],T.z=r[L+2];let w=m(T)/2/Math.PI+.5,C=f(T)/Math.PI+.5;a.push(w,1-C)}v(),p()}function p(){for(let T=0;T<a.length;T+=6){let L=a[T+0],w=a[T+2],C=a[T+4],E=Math.max(L,w,C),D=Math.min(L,w,C);E>.9&&D<.1&&(L<.2&&(a[T+0]+=1),w<.2&&(a[T+2]+=1),C<.2&&(a[T+4]+=1))}}function u(T){r.push(T.x,T.y,T.z)}function g(T,L){let w=T*3;L.x=e[w+0],L.y=e[w+1],L.z=e[w+2]}function v(){let T=new B,L=new B,w=new B,C=new B,E=new Ke,D=new Ke,_=new Ke;for(let R=0,N=0;R<r.length;R+=9,N+=6){T.set(r[R+0],r[R+1],r[R+2]),L.set(r[R+3],r[R+4],r[R+5]),w.set(r[R+6],r[R+7],r[R+8]),E.set(a[N+0],a[N+1]),D.set(a[N+2],a[N+3]),_.set(a[N+4],a[N+5]),C.copy(T).add(L).add(w).divideScalar(3);let V=m(C);b(E,N+0,T,V),b(D,N+2,L,V),b(_,N+4,w,V)}}function b(T,L,w,C){C<0&&T.x===1&&(a[L]=T.x-1),w.x===0&&w.z===0&&(a[L]=C/2/Math.PI+.5)}function m(T){return Math.atan2(T.z,-T.x)}function f(T){return Math.atan2(-T.y,Math.sqrt(T.x*T.x+T.z*T.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.vertices,e.indices,e.radius,e.detail)}},Dr=class i extends js{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,s=1/n,r=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-s,-n,0,-s,n,0,s,-n,0,s,n,-s,-n,0,-s,n,0,s,-n,0,s,n,0,-n,0,-s,n,0,-s,-n,0,s,n,0,s],a=[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9];super(r,a,e,t),this.type="DodecahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new i(e.radius,e.detail)}};var Xi=class i extends js{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,s=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new i(e.radius,e.detail)}};var Nr=class i extends js{constructor(e=1,t=0){let n=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],s=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(n,s,e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new i(e.radius,e.detail)}},Ri=class i extends Ct{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};let r=e/2,a=t/2,o=Math.floor(n),c=Math.floor(s),l=o+1,d=c+1,p=e/o,u=t/c,g=[],v=[],b=[],m=[];for(let f=0;f<d;f++){let T=f*u-a;for(let L=0;L<l;L++){let w=L*p-r;v.push(w,-T,0),b.push(0,0,1),m.push(L/o),m.push(1-f/c)}}for(let f=0;f<c;f++)for(let T=0;T<o;T++){let L=T+l*f,w=T+l*(f+1),C=T+1+l*(f+1),E=T+1+l*f;g.push(L,w,E),g.push(w,C,E)}this.setIndex(g),this.setAttribute("position",new rt(v,3)),this.setAttribute("normal",new rt(b,3)),this.setAttribute("uv",new rt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}},ms=class i extends Ct{constructor(e=.5,t=1,n=32,s=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:s,thetaStart:r,thetaLength:a},n=Math.max(3,n),s=Math.max(1,s);let o=[],c=[],l=[],d=[],p=e,u=(t-e)/s,g=new B,v=new Ke;for(let b=0;b<=s;b++){for(let m=0;m<=n;m++){let f=r+m/n*a;g.x=p*Math.cos(f),g.y=p*Math.sin(f),c.push(g.x,g.y,g.z),l.push(0,0,1),v.x=(g.x/t+1)/2,v.y=(g.y/t+1)/2,d.push(v.x,v.y)}p+=u}for(let b=0;b<s;b++){let m=b*(n+1);for(let f=0;f<n;f++){let T=f+m,L=T,w=T+n+1,C=T+n+2,E=T+1;o.push(L,w,E),o.push(w,C,E)}}this.setIndex(o),this.setAttribute("position",new rt(c,3)),this.setAttribute("normal",new rt(l,3)),this.setAttribute("uv",new rt(d,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}};var ti=class i extends Ct{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let c=Math.min(a+o,Math.PI),l=0,d=[],p=new B,u=new B,g=[],v=[],b=[],m=[];for(let f=0;f<=n;f++){let T=[],L=f/n,w=a+L*o,C=e*Math.cos(w),E=Math.sqrt(e*e-C*C),D=0;f===0&&a===0?D=.5/t:f===n&&c===Math.PI&&(D=-.5/t);for(let _=0;_<=t;_++){let R=_/t,N=s+R*r;p.x=-E*Math.cos(N),p.y=C,p.z=E*Math.sin(N),v.push(p.x,p.y,p.z),u.copy(p).normalize(),b.push(u.x,u.y,u.z),m.push(R+D,1-L),T.push(l++)}d.push(T)}for(let f=0;f<n;f++)for(let T=0;T<t;T++){let L=d[f][T+1],w=d[f][T],C=d[f+1][T],E=d[f+1][T+1];(f!==0||a>0)&&g.push(L,w,E),(f!==n-1||c<Math.PI)&&g.push(w,C,E)}this.setIndex(g),this.setAttribute("position",new rt(v,3)),this.setAttribute("normal",new rt(b,3)),this.setAttribute("uv",new rt(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var qi=class i extends Ct{constructor(e=1,t=.4,n=12,s=48,r=Math.PI*2,a=0,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:s,arc:r,thetaStart:a,thetaLength:o},n=Math.floor(n),s=Math.floor(s);let c=[],l=[],d=[],p=[],u=new B,g=new B,v=new B;for(let b=0;b<=n;b++){let m=a+b/n*o;for(let f=0;f<=s;f++){let T=f/s*r;g.x=(e+t*Math.cos(m))*Math.cos(T),g.y=(e+t*Math.cos(m))*Math.sin(T),g.z=t*Math.sin(m),l.push(g.x,g.y,g.z),u.x=e*Math.cos(T),u.y=e*Math.sin(T),v.subVectors(g,u).normalize(),d.push(v.x,v.y,v.z),p.push(f/s),p.push(b/n)}}for(let b=1;b<=n;b++)for(let m=1;m<=s;m++){let f=(s+1)*b+m-1,T=(s+1)*(b-1)+m-1,L=(s+1)*(b-1)+m,w=(s+1)*b+m;c.push(f,T,w),c.push(T,L,w)}this.setIndex(c),this.setAttribute("position",new rt(l,3)),this.setAttribute("normal",new rt(d,3)),this.setAttribute("uv",new rt(p,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc,e.thetaStart,e.thetaLength)}};var Ur=class extends Ct{constructor(e=null){if(super(),this.type="WireframeGeometry",this.parameters={geometry:e},e!==null){let t=[],n=new Set,s=new B,r=new B;if(e.index!==null){let a=e.attributes.position,o=e.index,c=e.groups;c.length===0&&(c=[{start:0,count:o.count,materialIndex:0}]);for(let l=0,d=c.length;l<d;++l){let p=c[l],u=p.start,g=p.count;for(let v=u,b=u+g;v<b;v+=3)for(let m=0;m<3;m++){let f=o.getX(v+m),T=o.getX(v+(m+1)%3);s.fromBufferAttribute(a,f),r.fromBufferAttribute(a,T),Xh(s,r,n)===!0&&(t.push(s.x,s.y,s.z),t.push(r.x,r.y,r.z))}}}else{let a=e.attributes.position;for(let o=0,c=a.count/3;o<c;o++)for(let l=0;l<3;l++){let d=3*o+l,p=3*o+(l+1)%3;s.fromBufferAttribute(a,d),r.fromBufferAttribute(a,p),Xh(s,r,n)===!0&&(t.push(s.x,s.y,s.z),t.push(r.x,r.y,r.z))}}this.setAttribute("position",new rt(t,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}};function Xh(i,e,t){let n=`${i.x},${i.y},${i.z}-${e.x},${e.y},${e.z}`,s=`${e.x},${e.y},${e.z}-${i.x},${i.y},${i.z}`;return t.has(n)===!0||t.has(s)===!0?!1:(t.add(n),t.add(s),!0)}function xs(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let s=i[t][n];if(qh(s))s.isRenderTargetTexture?($e("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone();else if(Array.isArray(s))if(qh(s[0])){let r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();e[t][n]=r}else e[t][n]=s.slice();else e[t][n]=s}}return e}function Mn(i){let e={};for(let t=0;t<i.length;t++){let n=xs(i[t]);for(let s in n)e[s]=n[s]}return e}function qh(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function yf(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function Nc(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:gt.workingColorSpace}var zu={clone:xs,merge:Mn},Mf=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Sf=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,tn=class extends Qn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Mf,this.fragmentShader=Sf,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=xs(e.uniforms),this.uniformsGroups=yf(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let s=e.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=t[s.value]||null;break;case"c":this.uniforms[n].value=new Ye().setHex(s.value);break;case"v2":this.uniforms[n].value=new Ke().fromArray(s.value);break;case"v3":this.uniforms[n].value=new B().fromArray(s.value);break;case"v4":this.uniforms[n].value=new Gt().fromArray(s.value);break;case"m3":this.uniforms[n].value=new tt().fromArray(s.value);break;case"m4":this.uniforms[n].value=new Dt().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},oo=class extends tn{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}};var Pi=class extends Qn{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Ye(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ye(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=ul,this.normalScale=new Ke(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Ai,this.combine=To,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},lo=class extends Qn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=wu,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},co=class extends Qn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function zs(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function tc(i){return i!==void 0&&i.inTangents!==void 0&&i.outTangents!==void 0}var Yi=class{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,s=t[n],r=t[n-1];n:{e:{let a;t:{i:if(!(e<s)){for(let o=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=s,s=t[++n],e<s)break e}a=t.length;break t}if(!(e>=r)){let o=t[1];e<o&&(n=2,r=o);for(let c=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===c)break;if(s=r,r=t[--n-1],e>=r)break e}a=n,n=0;break t}break n}for(;n<a;){let o=n+a>>>1;e<t[o]?a=o:n=o+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let a=0;a!==s;++a)t[a]=n[r+a];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},ho=class extends Yi{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:sc,endingEnd:sc}}intervalChanged_(e,t,n){let s=this.parameterPositions,r=e-2,a=e+1,o=s[r],c=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case rc:r=e,o=2*t-n;break;case ac:r=s.length-2,o=t+s[r]-s[r+1];break;default:r=e,o=n}if(c===void 0)switch(this.getSettings_().endingEnd){case rc:a=e,c=2*n-t;break;case ac:a=1,c=n+s[1]-s[0];break;default:a=e-1,c=t}let l=(n-t)*.5,d=this.valueSize;this._weightPrev=l/(t-o),this._weightNext=l/(c-n),this._offsetPrev=r*d,this._offsetNext=a*d}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,d=this._offsetPrev,p=this._offsetNext,u=this._weightPrev,g=this._weightNext,v=(n-t)/(s-t),b=v*v,m=b*v,f=-u*m+2*u*b-u*v,T=(1+u)*m+(-1.5-2*u)*b+(-.5+u)*v+1,L=(-1-g)*m+(1.5+g)*b+.5*v,w=g*m-g*b;for(let C=0;C!==o;++C)r[C]=f*a[d+C]+T*a[l+C]+L*a[c+C]+w*a[p+C];return r}},uo=class extends Yi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,d=(n-t)/(s-t),p=1-d;for(let u=0;u!==o;++u)r[u]=a[l+u]*p+a[c+u]*d;return r}},fo=class extends Yi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}},po=class extends Yi{interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=e*o,l=c-o,d=this.inTangents,p=this.outTangents;if(!d||!p){let v=(n-t)/(s-t),b=1-v;for(let m=0;m!==o;++m)r[m]=a[l+m]*b+a[c+m]*v;return r}let u=o*2,g=e-1;for(let v=0;v!==o;++v){let b=a[l+v],m=a[c+v],f=g*u+v*2,T=p[f],L=p[f+1],w=e*u+v*2,C=d[w],E=d[w+1],D=wf(n,t,T,C,s);r[v]=ku(D,b,L,E,m)}return r}};function ku(i,e,t,n,s){let r=1-i;return r*r*r*e+3*r*r*i*t+3*r*i*i*n+i*i*i*s}function bf(i,e,t,n,s){let r=1-i;return 3*r*r*(t-e)+6*r*i*(n-t)+3*i*i*(s-n)}function wf(i,e,t,n,s){let r=(i-e)/(s-e);for(let a=0;a<8;a++){let o=ku(r,e,t,n,s)-i;if(Math.abs(o)<1e-10)break;let c=bf(r,e,t,n,s);if(Math.abs(c)<1e-10)break;r=Math.max(0,Math.min(1,r-o/c))}return r}var kn=class{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=zs(t,this.TimeBufferType),this.values=zs(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:zs(e.times,Array),values:zs(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s),tc(e.settings)&&(n.settings={inTangents:zs(e.settings.inTangents,Array),outTangents:zs(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new fo(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new uo(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new ho(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new po(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case Mr:t=this.InterpolantFactoryMethodDiscrete;break;case Ka:t=this.InterpolantFactoryMethodLinear;break;case ka:t=this.InterpolantFactoryMethodSmooth;break;case ic:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return $e("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Mr;case this.InterpolantFactoryMethodLinear:return Ka;case this.InterpolantFactoryMethodSmooth:return ka;case this.InterpolantFactoryMethodBezier:return ic}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e;tc(this.settings)&&(Yh(this.settings.inTangents,e),Yh(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,s=n.length,r=0,a=s-1;for(;r!==s&&n[r]<e;)++r;for(;a!==-1&&n[a]>t;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(Je("KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,s=this.values,r=n.length;r===0&&(Je("KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){let c=n[o];if(typeof c=="number"&&isNaN(c)){Je("KeyframeTrack: Time is not a valid number.",this,o,c),e=!1;break}if(a!==null&&a>c){Je("KeyframeTrack: Out of order keys.",this,o,c,a),e=!1;break}a=c}if(s!==void 0&&Qd(s))for(let o=0,c=s.length;o!==c;++o){let l=s[o];if(isNaN(l)){Je("KeyframeTrack: Value is not a valid number.",this,o,l),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===ka,r=e.length-1,a=1;for(let o=1;o<r;++o){let c=!1,l=e[o],d=e[o+1];if(l!==d&&(o!==1||l!==e[0]))if(s)c=!0;else{let p=o*n,u=p-n,g=p+n;for(let v=0;v!==n;++v){let b=t[p+v];if(b!==t[u+v]||b!==t[g+v]){c=!0;break}}}if(c){if(o!==a){e[a]=e[o];let p=o*n,u=a*n;for(let g=0;g!==n;++g)t[u+g]=t[p+g]}++a}}if(r>0){e[a]=e[r];for(let o=r*n,c=a*n,l=0;l!==n;++l)t[c+l]=t[o+l];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,tc(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function Yh(i,e){for(let t=0,n=i.length;t!==n;t+=2)i[t]*=e}kn.prototype.ValueTypeName="";kn.prototype.TimeBufferType=Float32Array;kn.prototype.ValueBufferType=Float32Array;kn.prototype.DefaultInterpolation=Ka;var Zi=class extends kn{constructor(e,t,n){super(e,t,n)}};Zi.prototype.ValueTypeName="bool";Zi.prototype.ValueBufferType=Array;Zi.prototype.DefaultInterpolation=Mr;Zi.prototype.InterpolantFactoryMethodLinear=void 0;Zi.prototype.InterpolantFactoryMethodSmooth=void 0;var mo=class extends kn{constructor(e,t,n,s){super(e,t,n,s)}};mo.prototype.ValueTypeName="color";var go=class extends kn{constructor(e,t,n,s){super(e,t,n,s)}};go.prototype.ValueTypeName="number";var _o=class extends Yi{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,c=(n-t)/(s-t),l=e*o;for(let d=l+o;l!==d;l+=4)Wn.slerpFlat(r,0,a,l-o,a,l,c);return r}},Fr=class extends kn{constructor(e,t,n,s){super(e,t,n,s)}InterpolantFactoryMethodLinear(e){return new _o(this.times,this.values,this.getValueSize(),e)}};Fr.prototype.ValueTypeName="quaternion";Fr.prototype.InterpolantFactoryMethodSmooth=void 0;var $i=class extends kn{constructor(e,t,n){super(e,t,n)}};$i.prototype.ValueTypeName="string";$i.prototype.ValueBufferType=Array;$i.prototype.DefaultInterpolation=Mr;$i.prototype.InterpolantFactoryMethodLinear=void 0;$i.prototype.InterpolantFactoryMethodSmooth=void 0;var xo=class extends kn{constructor(e,t,n,s){super(e,t,n,s)}};xo.prototype.ValueTypeName="vector";var vo=class{constructor(e,t,n){let s=this,r=!1,a=0,o=0,c,l=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(d){o++,r===!1&&s.onStart!==void 0&&s.onStart(d,a,o),r=!0},this.itemEnd=function(d){a++,s.onProgress!==void 0&&s.onProgress(d,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(d){s.onError!==void 0&&s.onError(d)},this.resolveURL=function(d){return d=d.normalize("NFC"),c?c(d):d},this.setURLModifier=function(d){return c=d,this},this.addHandler=function(d,p){return l.push(d,p),this},this.removeHandler=function(d){let p=l.indexOf(d);return p!==-1&&l.splice(p,2),this},this.getHandler=function(d){for(let p=0,u=l.length;p<u;p+=2){let g=l[p],v=l[p+1];if(g.global&&(g.lastIndex=0),g.test(d))return v}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},Vu=new vo,yo=class{constructor(e){this.manager=e!==void 0?e:Vu,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};yo.DEFAULT_MATERIAL_NAME="__DEFAULT";var Or=class extends en{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ye(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},Br=class extends Or{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(en.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ye(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},nc=new Dt,Zh=new B,$h=new B,Mo=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Ke(512,512),this.mapType=In,this.map=null,this.mapPass=null,this.matrix=new Dt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new $s,this._frameExtents=new Ke(1,1),this._viewportCount=1,this._viewports=[new Gt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;Zh.setFromMatrixPosition(e.matrixWorld),t.position.copy(Zh),$h.setFromMatrixPosition(e.target.matrixWorld),t.lookAt($h),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,s){nc.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(nc,e.coordinateSystem,e.reversedDepth);let r=this._frameExtents,a=s?s.z/r.x:1,o=s?s.w/r.y:1,c=s?s.x/r.x:0,l=s?s.y/r.y:0;e.coordinateSystem===Ws||e.reversedDepth?t.set(.5*a,0,0,.5*a+c,0,.5*o,0,.5*o+l,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+c,0,.5*o,0,.5*o+l,0,0,.5,.5,0,0,0,1),t.multiply(nc)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},Ba=new B,za=new Wn,oi=new B,zr=class extends en{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Dt,this.projectionMatrix=new Dt,this.projectionMatrixInverse=new Dt,this.coordinateSystem=jn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(Ba,za,oi),oi.x===1&&oi.y===1&&oi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ba,za,oi.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(Ba,za,oi),oi.x===1&&oi.y===1&&oi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(Ba,za,oi.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Bi=new B,Jh=new Ke,Kh=new Ke,yn=class extends zr{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=ja*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(Ll*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return ja*2*Math.atan(Math.tan(Ll*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Bi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Bi.x,Bi.y).multiplyScalar(-e/Bi.z),Bi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Bi.x,Bi.y).multiplyScalar(-e/Bi.z)}getViewSize(e,t){return this.getViewBounds(e,Jh,Kh),t.subVectors(Kh,Jh)}setViewOffset(e,t,n,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(Ll*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let c=a.fullWidth,l=a.fullHeight;r+=a.offsetX*s/c,t-=a.offsetY*n/l,s*=a.width/c,n*=a.height/l}let o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}};var Qs=class extends zr{constructor(e=-1,t=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-e,a=n+e,o=s+t,c=s-t;if(this.view!==null&&this.view.enabled){let l=(this.right-this.left)/this.view.fullWidth/this.zoom,d=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=l*this.view.offsetX,a=r+l*this.view.width,o-=d*this.view.offsetY,c=o-d*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,c,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},lc=class extends Mo{constructor(){super(new Qs(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},kr=class extends Or{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(en.DEFAULT_UP),this.updateMatrix(),this.target=new en,this.shadow=new lc}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}};var ks=-90,Vs=1,So=class extends en{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new yn(ks,Vs,e,t);s.layers=this.layers,this.add(s);let r=new yn(ks,Vs,e,t);r.layers=this.layers,this.add(r);let a=new yn(ks,Vs,e,t);a.layers=this.layers,this.add(a);let o=new yn(ks,Vs,e,t);o.layers=this.layers,this.add(o);let c=new yn(ks,Vs,e,t);c.layers=this.layers,this.add(c);let l=new yn(ks,Vs,e,t);l.layers=this.layers,this.add(l)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,s,r,a,o,c]=t;for(let l of t)this.remove(l);if(e===jn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),c.up.set(0,1,0),c.lookAt(0,0,-1);else if(e===Ws)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),c.up.set(0,-1,0),c.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let l of t)this.add(l),l.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,c,l,d]=this.children,p=e.getRenderTarget(),u=e.getActiveCubeFace(),g=e.getActiveMipmapLevel(),v=e.xr.enabled;e.xr.enabled=!1;let b=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let m=!1;e.isWebGLRenderer===!0?m=e.state.buffers.depth.getReversed():m=e.reversedDepthBuffer,e.setRenderTarget(n,0,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),e.setRenderTarget(n,4,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),n.texture.generateMipmaps=b,e.setRenderTarget(n,5,s),m&&e.autoClear===!1&&e.clearDepth(),e.render(t,d),e.setRenderTarget(p,u,g),e.xr.enabled=v,n.texture.needsPMREMUpdate=!0}},bo=class extends yn{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var Uc="\\[\\]\\.:\\/",Tf=new RegExp("["+Uc+"]","g"),Fc="[^"+Uc+"]",Af="[^"+Uc.replace("\\.","")+"]",Ef=/((?:WC+[\/:])*)/.source.replace("WC",Fc),Cf=/(WCOD+)?/.source.replace("WCOD",Af),Rf=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Fc),Pf=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Fc),If=new RegExp("^"+Ef+Cf+Rf+Pf+"$"),Lf=["material","materials","bones","map"],cc=class{constructor(e,t,n){let s=n||Ot.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},Ot=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Tf,"")}static parseTrackName(e){let t=If.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);Lf.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===t||o.uuid===t)return o;let c=n(o.children);if(c)return c}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){$e("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let l=t.objectIndex;switch(n){case"materials":if(!e.material){Je("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){Je("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){Je("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let d=0;d<e.length;d++)if(e[d].name===l){l=d;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){Je("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){Je("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){Je("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(l!==void 0){if(e[l]===void 0){Je("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[l]}}let a=e[s];if(a===void 0){let l=t.nodeName;Je("PropertyBinding: Trying to update property for track: "+l+"."+s+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let c=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){Je("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){Je("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}c=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(c=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(c=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[c],this.setValue=this.SetterByBindingTypeAndVersioning[c][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Ot.Composite=cc;Ot.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Ot.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Ot.prototype.GetterByBindingType=[Ot.prototype._getValue_direct,Ot.prototype._getValue_array,Ot.prototype._getValue_arrayElement,Ot.prototype._getValue_toArray];Ot.prototype.SetterByBindingTypeAndVersioning=[[Ot.prototype._setValue_direct,Ot.prototype._setValue_direct_setNeedsUpdate,Ot.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Ot.prototype._setValue_array,Ot.prototype._setValue_array_setNeedsUpdate,Ot.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Ot.prototype._setValue_arrayElement,Ot.prototype._setValue_arrayElement_setNeedsUpdate,Ot.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Ot.prototype._setValue_fromArray,Ot.prototype._setValue_fromArray_setNeedsUpdate,Ot.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var P_=new Float32Array(1);var jh=new Dt,Vr=class{constructor(e,t,n=0,s=1/0){this.ray=new us(e,t),this.near=n,this.far=s,this.camera=null,this.layers=new Ys,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):Je("Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return jh.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(jh),this}intersectObject(e,t=!0,n=[]){return hc(e,this,n,t),n.sort(Qh),n}intersectObjects(e,t=!0,n=[]){for(let s=0,r=e.length;s<r;s++)hc(e[s],this,n,t);return n.sort(Qh),n}};function Qh(i,e){return i.distance-e.distance}function hc(i,e,t,n){let s=!0;if(i.layers.test(e.layers)&&i.raycast(e,t)===!1&&(s=!1),s===!0&&n===!0){let r=i.children;for(let a=0,o=r.length;a<o;a++)hc(r[a],e,t,!0)}}var Gc=class Gc{constructor(e,t,n,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,s){let r=this.elements;return r[0]=e,r[2]=t,r[1]=n,r[3]=s,this}};Gc.prototype.isMatrix2=!0;var uc=Gc;function Oc(i,e,t,n){let s=Df(n);switch(t){case Rc:return i*e;case Ic:return i*e/s.components*s.byteLength;case Lo:return i*e/s.components*s.byteLength;case ts:return i*e*2/s.components*s.byteLength;case Do:return i*e*2/s.components*s.byteLength;case Pc:return i*e*3/s.components*s.byteLength;case Xn:return i*e*4/s.components*s.byteLength;case No:return i*e*4/s.components*s.byteLength;case Xr:case qr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Yr:case Zr:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Fo:case Bo:return Math.max(i,16)*Math.max(e,8)/4;case Uo:case Oo:return Math.max(i,8)*Math.max(e,8)/2;case zo:case ko:case Go:case Ho:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case Vo:case $r:case Wo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Xo:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case qo:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case Yo:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case Zo:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case $o:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case Jo:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case Ko:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case jo:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Qo:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case el:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case tl:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case nl:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case il:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case sl:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case rl:case al:case ol:return Math.ceil(i/4)*Math.ceil(e/4)*16;case ll:case cl:return Math.ceil(i/4)*Math.ceil(e/4)*8;case Jr:case hl:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Df(i){switch(i){case In:case Tc:return{byteLength:1,components:1};case tr:case Ac:case ri:return{byteLength:2,components:1};case Po:case Io:return{byteLength:2,components:4};case ii:case Ro:case si:return{byteLength:4,components:1};case Ec:case Cc:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?$e("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function cd(){let i=null,e=!1,t=null,n=null;function s(r,a){n=i.requestAnimationFrame(s),t(r,a)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function Uf(i){let e=new WeakMap;function t(o,c){let l=o.array,d=o.usage,p=l.byteLength,u=i.createBuffer();i.bindBuffer(c,u),i.bufferData(c,l,d),o.onUploadCallback();let g;if(l instanceof Float32Array)g=i.FLOAT;else if(typeof Float16Array<"u"&&l instanceof Float16Array)g=i.HALF_FLOAT;else if(l instanceof Uint16Array)o.isFloat16BufferAttribute?g=i.HALF_FLOAT:g=i.UNSIGNED_SHORT;else if(l instanceof Int16Array)g=i.SHORT;else if(l instanceof Uint32Array)g=i.UNSIGNED_INT;else if(l instanceof Int32Array)g=i.INT;else if(l instanceof Int8Array)g=i.BYTE;else if(l instanceof Uint8Array)g=i.UNSIGNED_BYTE;else if(l instanceof Uint8ClampedArray)g=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+l);return{buffer:u,type:g,bytesPerElement:l.BYTES_PER_ELEMENT,version:o.version,size:p}}function n(o,c,l){let d=c.array,p=c.updateRanges;if(i.bindBuffer(l,o),p.length===0)i.bufferSubData(l,0,d);else{p.sort((g,v)=>g.start-v.start);let u=0;for(let g=1;g<p.length;g++){let v=p[u],b=p[g];b.start<=v.start+v.count+1?v.count=Math.max(v.count,b.start+b.count-v.start):(++u,p[u]=b)}p.length=u+1;for(let g=0,v=p.length;g<v;g++){let b=p[g];i.bufferSubData(l,b.start*d.BYTES_PER_ELEMENT,d,b.start,b.count)}c.clearUpdateRanges()}c.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let c=e.get(o);c&&(i.deleteBuffer(c.buffer),e.delete(o))}function a(o,c){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let d=e.get(o);(!d||d.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let l=e.get(o);if(l===void 0)e.set(o,t(o,c));else if(l.version<o.version){if(l.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(l.buffer,o,c),l.version=o.version}}return{get:s,remove:r,update:a}}var Ff=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Of=`#ifdef USE_ALPHAHASH
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
#endif`,Bf=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,zf=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,kf=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Vf=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Gf=`#ifdef USE_AOMAP
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
#endif`,Hf=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Wf=`#ifdef USE_BATCHING
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
#endif`,Xf=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,qf=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Yf=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Zf=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,$f=`#ifdef USE_IRIDESCENCE
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
#endif`,Jf=`#ifdef USE_BUMPMAP
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
#endif`,Kf=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,jf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Qf=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,ep=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,tp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,np=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,ip=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,sp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,rp=`#define PI 3.141592653589793
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
} // validated`,ap=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,op=`vec3 transformedNormal = objectNormal;
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
#endif`,lp=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,cp=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,hp=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,up=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,dp="gl_FragColor = linearToOutputTexel( gl_FragColor );",fp=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,pp=`#ifdef USE_ENVMAP
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
#endif`,mp=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,gp=`#ifdef USE_ENVMAP
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
#endif`,_p=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,xp=`#ifdef USE_ENVMAP
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
#endif`,vp=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,yp=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Mp=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Sp=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,bp=`#ifdef USE_GRADIENTMAP
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
}`,wp=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Tp=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Ap=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Ep=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,Cp=`#ifdef USE_ENVMAP
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
#endif`,Rp=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Pp=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Ip=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Lp=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Dp=`PhysicalMaterial material;
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
#endif`,Np=`uniform sampler2D dfgLUT;
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
}`,Up=`
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
#endif`,Fp=`#if defined( RE_IndirectDiffuse )
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
#endif`,Op=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Bp=`#ifdef USE_LIGHT_PROBES_GRID
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
#endif`,zp=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,kp=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Vp=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Gp=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Hp=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,Wp=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Xp=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,qp=`#if defined( USE_POINTS_UV )
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
#endif`,Yp=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Zp=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,$p=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Jp=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Kp=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,jp=`#ifdef USE_MORPHTARGETS
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
#endif`,Qp=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,em=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,tm=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,nm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,im=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,sm=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,rm=`#ifdef USE_NORMALMAP
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
#endif`,am=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,om=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,lm=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,cm=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,hm=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,um=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,dm=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,fm=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,pm=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,mm=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,gm=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,_m=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,xm=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,vm=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,ym=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,Mm=`float getShadowMask() {
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
}`,Sm=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,bm=`#ifdef USE_SKINNING
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
#endif`,wm=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Tm=`#ifdef USE_SKINNING
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
#endif`,Am=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Em=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Cm=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,Rm=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,Pm=`#ifdef USE_TRANSMISSION
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
#endif`,Im=`#ifdef USE_TRANSMISSION
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
#endif`,Lm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Dm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Nm=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,Um=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,Fm=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,Om=`uniform sampler2D t2D;
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
}`,Bm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,zm=`#ifdef ENVMAP_TYPE_CUBE
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
}`,km=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,Vm=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Gm=`#include <common>
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
}`,Hm=`#if DEPTH_PACKING == 3200
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
}`,Wm=`#define DISTANCE
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
}`,Xm=`#define DISTANCE
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
}`,qm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,Ym=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,Zm=`uniform float scale;
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
}`,$m=`uniform vec3 diffuse;
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
}`,Jm=`#include <common>
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
}`,Km=`uniform vec3 diffuse;
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
}`,jm=`#define LAMBERT
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
}`,Qm=`#define LAMBERT
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
}`,eg=`#define MATCAP
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
}`,tg=`#define MATCAP
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
}`,ng=`#define NORMAL
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
}`,ig=`#define NORMAL
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
}`,sg=`#define PHONG
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
}`,rg=`#define PHONG
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
}`,ag=`#define STANDARD
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
}`,og=`#define STANDARD
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
}`,lg=`#define TOON
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
}`,cg=`#define TOON
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
}`,hg=`uniform float size;
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
}`,ug=`uniform vec3 diffuse;
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
}`,dg=`#include <common>
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
}`,fg=`uniform vec3 color;
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
}`,pg=`uniform float rotation;
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
}`,mg=`uniform vec3 diffuse;
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
}`,ht={alphahash_fragment:Ff,alphahash_pars_fragment:Of,alphamap_fragment:Bf,alphamap_pars_fragment:zf,alphatest_fragment:kf,alphatest_pars_fragment:Vf,aomap_fragment:Gf,aomap_pars_fragment:Hf,batching_pars_vertex:Wf,batching_vertex:Xf,begin_vertex:qf,beginnormal_vertex:Yf,bsdfs:Zf,iridescence_fragment:$f,bumpmap_pars_fragment:Jf,clipping_planes_fragment:Kf,clipping_planes_pars_fragment:jf,clipping_planes_pars_vertex:Qf,clipping_planes_vertex:ep,color_fragment:tp,color_pars_fragment:np,color_pars_vertex:ip,color_vertex:sp,common:rp,cube_uv_reflection_fragment:ap,defaultnormal_vertex:op,displacementmap_pars_vertex:lp,displacementmap_vertex:cp,emissivemap_fragment:hp,emissivemap_pars_fragment:up,colorspace_fragment:dp,colorspace_pars_fragment:fp,envmap_fragment:pp,envmap_common_pars_fragment:mp,envmap_pars_fragment:gp,envmap_pars_vertex:_p,envmap_physical_pars_fragment:Cp,envmap_vertex:xp,fog_vertex:vp,fog_pars_vertex:yp,fog_fragment:Mp,fog_pars_fragment:Sp,gradientmap_pars_fragment:bp,lightmap_pars_fragment:wp,lights_lambert_fragment:Tp,lights_lambert_pars_fragment:Ap,lights_pars_begin:Ep,lights_toon_fragment:Rp,lights_toon_pars_fragment:Pp,lights_phong_fragment:Ip,lights_phong_pars_fragment:Lp,lights_physical_fragment:Dp,lights_physical_pars_fragment:Np,lights_fragment_begin:Up,lights_fragment_maps:Fp,lights_fragment_end:Op,lightprobes_pars_fragment:Bp,logdepthbuf_fragment:zp,logdepthbuf_pars_fragment:kp,logdepthbuf_pars_vertex:Vp,logdepthbuf_vertex:Gp,map_fragment:Hp,map_pars_fragment:Wp,map_particle_fragment:Xp,map_particle_pars_fragment:qp,metalnessmap_fragment:Yp,metalnessmap_pars_fragment:Zp,morphinstance_vertex:$p,morphcolor_vertex:Jp,morphnormal_vertex:Kp,morphtarget_pars_vertex:jp,morphtarget_vertex:Qp,normal_fragment_begin:em,normal_fragment_maps:tm,normal_pars_fragment:nm,normal_pars_vertex:im,normal_vertex:sm,normalmap_pars_fragment:rm,clearcoat_normal_fragment_begin:am,clearcoat_normal_fragment_maps:om,clearcoat_pars_fragment:lm,iridescence_pars_fragment:cm,opaque_fragment:hm,packing:um,premultiplied_alpha_fragment:dm,project_vertex:fm,dithering_fragment:pm,dithering_pars_fragment:mm,roughnessmap_fragment:gm,roughnessmap_pars_fragment:_m,shadowmap_pars_fragment:xm,shadowmap_pars_vertex:vm,shadowmap_vertex:ym,shadowmask_pars_fragment:Mm,skinbase_vertex:Sm,skinning_pars_vertex:bm,skinning_vertex:wm,skinnormal_vertex:Tm,specularmap_fragment:Am,specularmap_pars_fragment:Em,tonemapping_fragment:Cm,tonemapping_pars_fragment:Rm,transmission_fragment:Pm,transmission_pars_fragment:Im,uv_pars_fragment:Lm,uv_pars_vertex:Dm,uv_vertex:Nm,worldpos_vertex:Um,background_vert:Fm,background_frag:Om,backgroundCube_vert:Bm,backgroundCube_frag:zm,cube_vert:km,cube_frag:Vm,depth_vert:Gm,depth_frag:Hm,distance_vert:Wm,distance_frag:Xm,equirect_vert:qm,equirect_frag:Ym,linedashed_vert:Zm,linedashed_frag:$m,meshbasic_vert:Jm,meshbasic_frag:Km,meshlambert_vert:jm,meshlambert_frag:Qm,meshmatcap_vert:eg,meshmatcap_frag:tg,meshnormal_vert:ng,meshnormal_frag:ig,meshphong_vert:sg,meshphong_frag:rg,meshphysical_vert:ag,meshphysical_frag:og,meshtoon_vert:lg,meshtoon_frag:cg,points_vert:hg,points_frag:ug,shadow_vert:dg,shadow_frag:fg,sprite_vert:pg,sprite_frag:mg},Ie={common:{diffuse:{value:new Ye(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new tt},alphaMap:{value:null},alphaMapTransform:{value:new tt},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new tt}},envmap:{envMap:{value:null},envMapRotation:{value:new tt},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new tt}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new tt}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new tt},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new tt},normalScale:{value:new Ke(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new tt},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new tt}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new tt}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new tt}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ye(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new B},probesMax:{value:new B},probesResolution:{value:new B}},points:{diffuse:{value:new Ye(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new tt},alphaTest:{value:0},uvTransform:{value:new tt}},sprite:{diffuse:{value:new Ye(16777215)},opacity:{value:1},center:{value:new Ke(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new tt},alphaMap:{value:null},alphaMapTransform:{value:new tt},alphaTest:{value:0}}},mi={basic:{uniforms:Mn([Ie.common,Ie.specularmap,Ie.envmap,Ie.aomap,Ie.lightmap,Ie.fog]),vertexShader:ht.meshbasic_vert,fragmentShader:ht.meshbasic_frag},lambert:{uniforms:Mn([Ie.common,Ie.specularmap,Ie.envmap,Ie.aomap,Ie.lightmap,Ie.emissivemap,Ie.bumpmap,Ie.normalmap,Ie.displacementmap,Ie.fog,Ie.lights,{emissive:{value:new Ye(0)},envMapIntensity:{value:1}}]),vertexShader:ht.meshlambert_vert,fragmentShader:ht.meshlambert_frag},phong:{uniforms:Mn([Ie.common,Ie.specularmap,Ie.envmap,Ie.aomap,Ie.lightmap,Ie.emissivemap,Ie.bumpmap,Ie.normalmap,Ie.displacementmap,Ie.fog,Ie.lights,{emissive:{value:new Ye(0)},specular:{value:new Ye(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:ht.meshphong_vert,fragmentShader:ht.meshphong_frag},standard:{uniforms:Mn([Ie.common,Ie.envmap,Ie.aomap,Ie.lightmap,Ie.emissivemap,Ie.bumpmap,Ie.normalmap,Ie.displacementmap,Ie.roughnessmap,Ie.metalnessmap,Ie.fog,Ie.lights,{emissive:{value:new Ye(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ht.meshphysical_vert,fragmentShader:ht.meshphysical_frag},toon:{uniforms:Mn([Ie.common,Ie.aomap,Ie.lightmap,Ie.emissivemap,Ie.bumpmap,Ie.normalmap,Ie.displacementmap,Ie.gradientmap,Ie.fog,Ie.lights,{emissive:{value:new Ye(0)}}]),vertexShader:ht.meshtoon_vert,fragmentShader:ht.meshtoon_frag},matcap:{uniforms:Mn([Ie.common,Ie.bumpmap,Ie.normalmap,Ie.displacementmap,Ie.fog,{matcap:{value:null}}]),vertexShader:ht.meshmatcap_vert,fragmentShader:ht.meshmatcap_frag},points:{uniforms:Mn([Ie.points,Ie.fog]),vertexShader:ht.points_vert,fragmentShader:ht.points_frag},dashed:{uniforms:Mn([Ie.common,Ie.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ht.linedashed_vert,fragmentShader:ht.linedashed_frag},depth:{uniforms:Mn([Ie.common,Ie.displacementmap]),vertexShader:ht.depth_vert,fragmentShader:ht.depth_frag},normal:{uniforms:Mn([Ie.common,Ie.bumpmap,Ie.normalmap,Ie.displacementmap,{opacity:{value:1}}]),vertexShader:ht.meshnormal_vert,fragmentShader:ht.meshnormal_frag},sprite:{uniforms:Mn([Ie.sprite,Ie.fog]),vertexShader:ht.sprite_vert,fragmentShader:ht.sprite_frag},background:{uniforms:{uvTransform:{value:new tt},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ht.background_vert,fragmentShader:ht.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new tt}},vertexShader:ht.backgroundCube_vert,fragmentShader:ht.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ht.cube_vert,fragmentShader:ht.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ht.equirect_vert,fragmentShader:ht.equirect_frag},distance:{uniforms:Mn([Ie.common,Ie.displacementmap,{referencePosition:{value:new B},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ht.distance_vert,fragmentShader:ht.distance_frag},shadow:{uniforms:Mn([Ie.lights,Ie.fog,{color:{value:new Ye(0)},opacity:{value:1}}]),vertexShader:ht.shadow_vert,fragmentShader:ht.shadow_frag}};mi.physical={uniforms:Mn([mi.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new tt},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new tt},clearcoatNormalScale:{value:new Ke(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new tt},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new tt},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new tt},sheen:{value:0},sheenColor:{value:new Ye(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new tt},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new tt},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new tt},transmissionSamplerSize:{value:new Ke},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new tt},attenuationDistance:{value:0},attenuationColor:{value:new Ye(0)},specularColor:{value:new Ye(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new tt},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new tt},anisotropyVector:{value:new Ke},anisotropyMap:{value:null},anisotropyMapTransform:{value:new tt}}]),vertexShader:ht.meshphysical_vert,fragmentShader:ht.meshphysical_frag};var pl={r:0,b:0,g:0},gg=new Dt,hd=new tt;hd.set(-1,0,0,0,1,0,0,0,1);function _g(i,e,t,n,s,r){let a=new Ye(0),o=s===!0?0:1,c,l,d=null,p=0,u=null;function g(T){let L=T.isScene===!0?T.background:null;if(L&&L.isTexture){let w=T.backgroundBlurriness>0;L=e.get(L,w)}return L}function v(T){let L=!1,w=g(T);w===null?m(a,o):w&&w.isColor&&(m(w,1),L=!0);let C=i.xr.getEnvironmentBlendMode();C==="additive"?t.buffers.color.setClear(0,0,0,1,r):C==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(i.autoClear||L)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function b(T,L){let w=g(L);w&&(w.isCubeTexture||w.mapping===Hr)?(l===void 0&&(l=new bt(new Ci(1,1,1),new tn({name:"BackgroundCubeMaterial",uniforms:xs(mi.backgroundCube.uniforms),vertexShader:mi.backgroundCube.vertexShader,fragmentShader:mi.backgroundCube.fragmentShader,side:un,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),l.geometry.deleteAttribute("uv"),l.onBeforeRender=function(C,E,D){this.matrixWorld.copyPosition(D.matrixWorld)},Object.defineProperty(l.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(l)),l.material.uniforms.envMap.value=w,l.material.uniforms.backgroundBlurriness.value=L.backgroundBlurriness,l.material.uniforms.backgroundIntensity.value=L.backgroundIntensity,l.material.uniforms.backgroundRotation.value.setFromMatrix4(gg.makeRotationFromEuler(L.backgroundRotation)).transpose(),w.isCubeTexture&&w.isRenderTargetTexture===!1&&l.material.uniforms.backgroundRotation.value.premultiply(hd),l.material.toneMapped=gt.getTransfer(w.colorSpace)!==At,(d!==w||p!==w.version||u!==i.toneMapping)&&(l.material.needsUpdate=!0,d=w,p=w.version,u=i.toneMapping),l.layers.enableAll(),T.unshift(l,l.geometry,l.material,0,0,null)):w&&w.isTexture&&(c===void 0&&(c=new bt(new Ri(2,2),new tn({name:"BackgroundMaterial",uniforms:xs(mi.background.uniforms),vertexShader:mi.background.vertexShader,fragmentShader:mi.background.fragmentShader,side:Ji,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(c)),c.material.uniforms.t2D.value=w,c.material.uniforms.backgroundIntensity.value=L.backgroundIntensity,c.material.toneMapped=gt.getTransfer(w.colorSpace)!==At,w.matrixAutoUpdate===!0&&w.updateMatrix(),c.material.uniforms.uvTransform.value.copy(w.matrix),(d!==w||p!==w.version||u!==i.toneMapping)&&(c.material.needsUpdate=!0,d=w,p=w.version,u=i.toneMapping),c.layers.enableAll(),T.unshift(c,c.geometry,c.material,0,0,null))}function m(T,L){T.getRGB(pl,Nc(i)),t.buffers.color.setClear(pl.r,pl.g,pl.b,L,r)}function f(){l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return a},setClearColor:function(T,L=1){a.set(T),o=L,m(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(T){o=T,m(a,o)},render:v,addToRenderList:b,dispose:f}}function xg(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=u(null),r=s,a=!1;function o(V,G,$,z,K){let ie=!1,te=p(V,z,$,G);r!==te&&(r=te,l(r.object)),ie=g(V,z,$,K),ie&&v(V,z,$,K),K!==null&&e.update(K,i.ELEMENT_ARRAY_BUFFER),(ie||a)&&(a=!1,w(V,G,$,z),K!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(K).buffer))}function c(){return i.createVertexArray()}function l(V){return i.bindVertexArray(V)}function d(V){return i.deleteVertexArray(V)}function p(V,G,$,z){let K=z.wireframe===!0,ie=n[G.id];ie===void 0&&(ie={},n[G.id]=ie);let te=V.isInstancedMesh===!0?V.id:0,X=ie[te];X===void 0&&(X={},ie[te]=X);let ee=X[$.id];ee===void 0&&(ee={},X[$.id]=ee);let ce=ee[K];return ce===void 0&&(ce=u(c()),ee[K]=ce),ce}function u(V){let G=[],$=[],z=[];for(let K=0;K<t;K++)G[K]=0,$[K]=0,z[K]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:G,enabledAttributes:$,attributeDivisors:z,object:V,attributes:{},index:null}}function g(V,G,$,z){let K=r.attributes,ie=G.attributes,te=0,X=$.getAttributes();for(let ee in X)if(X[ee].location>=0){let ge=K[ee],Xe=ie[ee];if(Xe===void 0&&(ee==="instanceMatrix"&&V.instanceMatrix&&(Xe=V.instanceMatrix),ee==="instanceColor"&&V.instanceColor&&(Xe=V.instanceColor)),ge===void 0||ge.attribute!==Xe||Xe&&ge.data!==Xe.data)return!0;te++}return r.attributesNum!==te||r.index!==z}function v(V,G,$,z){let K={},ie=G.attributes,te=0,X=$.getAttributes();for(let ee in X)if(X[ee].location>=0){let ge=ie[ee];ge===void 0&&(ee==="instanceMatrix"&&V.instanceMatrix&&(ge=V.instanceMatrix),ee==="instanceColor"&&V.instanceColor&&(ge=V.instanceColor));let Xe={};Xe.attribute=ge,ge&&ge.data&&(Xe.data=ge.data),K[ee]=Xe,te++}r.attributes=K,r.attributesNum=te,r.index=z}function b(){let V=r.newAttributes;for(let G=0,$=V.length;G<$;G++)V[G]=0}function m(V){f(V,0)}function f(V,G){let $=r.newAttributes,z=r.enabledAttributes,K=r.attributeDivisors;$[V]=1,z[V]===0&&(i.enableVertexAttribArray(V),z[V]=1),K[V]!==G&&(i.vertexAttribDivisor(V,G),K[V]=G)}function T(){let V=r.newAttributes,G=r.enabledAttributes;for(let $=0,z=G.length;$<z;$++)G[$]!==V[$]&&(i.disableVertexAttribArray($),G[$]=0)}function L(V,G,$,z,K,ie,te){te===!0?i.vertexAttribIPointer(V,G,$,K,ie):i.vertexAttribPointer(V,G,$,z,K,ie)}function w(V,G,$,z){b();let K=z.attributes,ie=$.getAttributes(),te=G.defaultAttributeValues;for(let X in ie){let ee=ie[X];if(ee.location>=0){let ce=K[X];if(ce===void 0&&(X==="instanceMatrix"&&V.instanceMatrix&&(ce=V.instanceMatrix),X==="instanceColor"&&V.instanceColor&&(ce=V.instanceColor)),ce!==void 0){let ge=ce.normalized,Xe=ce.itemSize,Ve=e.get(ce);if(Ve===void 0)continue;let vt=Ve.buffer,ut=Ve.type,ot=Ve.bytesPerElement,se=ut===i.INT||ut===i.UNSIGNED_INT||ce.gpuType===Ro;if(ce.isInterleavedBufferAttribute){let he=ce.data,ve=he.stride,Ze=ce.offset;if(he.isInstancedInterleavedBuffer){for(let Fe=0;Fe<ee.locationSize;Fe++)f(ee.location+Fe,he.meshPerAttribute);V.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=he.meshPerAttribute*he.count)}else for(let Fe=0;Fe<ee.locationSize;Fe++)m(ee.location+Fe);i.bindBuffer(i.ARRAY_BUFFER,vt);for(let Fe=0;Fe<ee.locationSize;Fe++)L(ee.location+Fe,Xe/ee.locationSize,ut,ge,ve*ot,(Ze+Xe/ee.locationSize*Fe)*ot,se)}else{if(ce.isInstancedBufferAttribute){for(let he=0;he<ee.locationSize;he++)f(ee.location+he,ce.meshPerAttribute);V.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=ce.meshPerAttribute*ce.count)}else for(let he=0;he<ee.locationSize;he++)m(ee.location+he);i.bindBuffer(i.ARRAY_BUFFER,vt);for(let he=0;he<ee.locationSize;he++)L(ee.location+he,Xe/ee.locationSize,ut,ge,Xe*ot,Xe/ee.locationSize*he*ot,se)}}else if(te!==void 0){let ge=te[X];if(ge!==void 0)switch(ge.length){case 2:i.vertexAttrib2fv(ee.location,ge);break;case 3:i.vertexAttrib3fv(ee.location,ge);break;case 4:i.vertexAttrib4fv(ee.location,ge);break;default:i.vertexAttrib1fv(ee.location,ge)}}}}T()}function C(){R();for(let V in n){let G=n[V];for(let $ in G){let z=G[$];for(let K in z){let ie=z[K];for(let te in ie)d(ie[te].object),delete ie[te];delete z[K]}}delete n[V]}}function E(V){if(n[V.id]===void 0)return;let G=n[V.id];for(let $ in G){let z=G[$];for(let K in z){let ie=z[K];for(let te in ie)d(ie[te].object),delete ie[te];delete z[K]}}delete n[V.id]}function D(V){for(let G in n){let $=n[G];for(let z in $){let K=$[z];if(K[V.id]===void 0)continue;let ie=K[V.id];for(let te in ie)d(ie[te].object),delete ie[te];delete K[V.id]}}}function _(V){for(let G in n){let $=n[G],z=V.isInstancedMesh===!0?V.id:0,K=$[z];if(K!==void 0){for(let ie in K){let te=K[ie];for(let X in te)d(te[X].object),delete te[X];delete K[ie]}delete $[z],Object.keys($).length===0&&delete n[G]}}}function R(){N(),a=!0,r!==s&&(r=s,l(r.object))}function N(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:R,resetDefaultState:N,dispose:C,releaseStatesOfGeometry:E,releaseStatesOfObject:_,releaseStatesOfProgram:D,initAttributes:b,enableAttribute:m,disableUnusedAttributes:T}}function vg(i,e,t){let n;function s(c){n=c}function r(c,l){i.drawArrays(n,c,l),t.update(l,n,1)}function a(c,l,d){d!==0&&(i.drawArraysInstanced(n,c,l,d),t.update(l,n,d))}function o(c,l,d){if(d===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,l,0,d);let u=0;for(let g=0;g<d;g++)u+=l[g];t.update(u,n,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function yg(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let D=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(D.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(D){return!(D!==Xn&&n.convert(D)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(D){let _=D===ri&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(D!==In&&D!==si&&!_&&n.convert(D)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function c(D){if(D==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";D="mediump"}return D==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let l=t.precision!==void 0?t.precision:"highp",d=c(l);d!==l&&($e("WebGLRenderer:",l,"not supported, using",d,"instead."),l=d);let p=t.logarithmicDepthBuffer===!0,u=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&u===!1&&$e("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let g=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),v=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),b=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),f=i.getParameter(i.MAX_VERTEX_ATTRIBS),T=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),L=i.getParameter(i.MAX_VARYING_VECTORS),w=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),C=i.getParameter(i.MAX_SAMPLES),E=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:c,textureFormatReadable:a,textureTypeReadable:o,precision:l,logarithmicDepthBuffer:p,reversedDepthBuffer:u,maxTextures:g,maxVertexTextures:v,maxTextureSize:b,maxCubemapSize:m,maxAttributes:f,maxVertexUniforms:T,maxVaryings:L,maxFragmentUniforms:w,maxSamples:C,samples:E}}function Mg(i){let e=this,t=null,n=0,s=!1,r=!1,a=new Kn,o=new tt,c={value:null,needsUpdate:!1};this.uniform=c,this.numPlanes=0,this.numIntersection=0,this.init=function(p,u){let g=p.length!==0||u||n!==0||s;return s=u,n=p.length,g},this.beginShadows=function(){r=!0,d(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(p,u){t=d(p,u,0)},this.setState=function(p,u,g){let v=p.clippingPlanes,b=p.clipIntersection,m=p.clipShadows,f=i.get(p);if(!s||v===null||v.length===0||r&&!m)r?d(null):l();else{let T=r?0:n,L=T*4,w=f.clippingState||null;c.value=w,w=d(v,u,L,g);for(let C=0;C!==L;++C)w[C]=t[C];f.clippingState=w,this.numIntersection=b?this.numPlanes:0,this.numPlanes+=T}};function l(){c.value!==t&&(c.value=t,c.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function d(p,u,g,v){let b=p!==null?p.length:0,m=null;if(b!==0){if(m=c.value,v!==!0||m===null){let f=g+b*4,T=u.matrixWorldInverse;o.getNormalMatrix(T),(m===null||m.length<f)&&(m=new Float32Array(f));for(let L=0,w=g;L!==b;++L,w+=4)a.copy(p[L]).applyMatrix4(T,o),a.normal.toArray(m,w),m[w+3]=a.constant}c.value=m,c.needsUpdate=!0}return e.numPlanes=b,e.numIntersection=0,m}}var sr=4,Sg=6,bg=20,wg=256,Kr=new Qs,Gu=new Ye,Hc=null,Wc=0,Xc=0,qc=!1,Tg=new B,vs=new B,gl=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,s=100,r={}){let{size:a=256,position:o=Tg}=r;Hc=this._renderer.getRenderTarget(),Wc=this._renderer.getActiveCubeFace(),Xc=this._renderer.getActiveMipmapLevel(),qc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let c=this._allocateTargets();return c.depthBuffer=!0,this._sceneToCubeUV(e,n,s,c,o),t>0&&this._blur(c,0,0,t),this._applyPMREM(c),this._cleanup(c),c}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Xu(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Wu(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(Hc,Wc,Xc),this._renderer.xr.enabled=qc,e.scissorTest=!1,ir(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===ji||e.mapping===_s?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),Hc=this._renderer.getRenderTarget(),Wc=this._renderer.getActiveCubeFace(),Xc=this._renderer.getActiveMipmapLevel(),qc=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:_n,minFilter:_n,generateMipmaps:!1,type:ri,format:Xn,colorSpace:Sr,depthBuffer:!1},s=Hu(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Hu(e,t,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=Ag(r)),this._blurMaterial=Cg(r,e,t),this._ggxMaterial=Eg(r,e,t)}return s}_compileMaterial(e){let t=new bt(new Ct,e);this._renderer.compile(t,Kr)}_sceneToCubeUV(e,t,n,s,r){let c=new yn(90,1,t,n),l=[1,-1,1,1,1,1],d=[1,1,1,-1,-1,-1],p=this._renderer,u=p.autoClear,g=p.toneMapping;p.getClearColor(Gu),p.toneMapping=ni,p.autoClear=!1,p.state.buffers.depth.getReversed()&&(p.setRenderTarget(s),p.clearDepth(),p.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new bt(new Ci,new hn({name:"PMREM.Background",side:un,depthWrite:!1,depthTest:!1})));let b=this._backgroundBox,m=b.material,f=!1,T=e.background;T?T.isColor&&(m.color.copy(T),e.background=null,f=!0):(m.color.copy(Gu),f=!0);for(let L=0;L<6;L++){let w=L%3;w===0?(c.up.set(0,l[L],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x+d[L],r.y,r.z)):w===1?(c.up.set(0,0,l[L]),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y+d[L],r.z)):(c.up.set(0,l[L],0),c.position.set(r.x,r.y,r.z),c.lookAt(r.x,r.y,r.z+d[L]));let C=this._cubeSize;ir(s,w*C,L>2?C:0,C,C),p.setRenderTarget(s),f&&p.render(b,c),p.render(e,c)}p.toneMapping=g,p.autoClear=u,e.background=T}_textureToCubeUV(e,t){let n=this._renderer,s=e.mapping===ji||e.mapping===_s;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Xu()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Wu());let r=s?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;let o=r.uniforms;o.envMap.value=e;let c=this._cubeSize;ir(t,0,0,3*c,2*c),n.setRenderTarget(t),n.render(a,Kr)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=n}_applyGGXFilter(e,t,n){let s=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let c=a.uniforms,l=n/(this._lodMeshes.length-1),d=t/(this._lodMeshes.length-1),p=Math.sqrt(l*l-d*d),u=l*1.25,g=p*u,{_lodMax:v}=this,b=this._sizeLods[n],m=3*b*(n>v-sr?n-v+sr:0),f=4*(this._cubeSize-b);c.envMap.value=e.texture,c.roughness.value=g,c.mipInt.value=v-t,ir(r,m,f,3*b,2*b),s.setRenderTarget(r),s.render(o,Kr),c.envMap.value=r.texture,c.roughness.value=0,c.mipInt.value=v-n,ir(e,m,f,3*b,2*b),s.setRenderTarget(e),s.render(o,Kr)}_blur(e,t,n,s){let r=this._pingPongRenderTarget,a=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(e,r,t,n,a),this._blurPass(r,e,n,n,a)}_blurPass(e,t,n,s,r){let a=this._renderer,o=this._blurMaterial,c=this._lodMeshes[s];c.material=o;let l=o.uniforms;l.envMap.value=e.texture,l.sigma.value=r,l.mipInt.value=this._lodMax-n;let d=this._sizeLods[s],p=3*d*(s>this._lodMax-sr?s-this._lodMax+sr:0),u=4*(this._cubeSize-d);ir(t,p,u,3*d,2*d),a.setRenderTarget(t),a.render(c,Kr)}};function Ag(i){let e=[],t=[],n=i,s=i-sr+1+Sg;for(let r=0;r<s;r++){let a=Math.pow(2,n);e.push(a);let o=1/(a-2),c=-o,l=1+o,d=[c,c,l,c,l,l,c,c,l,l,c,l],p=6,u=6,g=3,v=new Float32Array(g*u*p),b=new Float32Array(g*u*p);for(let f=0;f<p;f++){let T=f%3*2/3-1,L=f>2?0:-1,w=[T,L,0,T+2/3,L,0,T+2/3,L+1,0,T,L,0,T+2/3,L+1,0,T,L+1,0];v.set(w,g*u*f);for(let C=0;C<u;C++){let E=d[C*2]*2-1,D=d[C*2+1]*2-1;f===0?vs.set(1,D,E):f===1?vs.set(-E,1,-D):f===2?vs.set(-E,D,1):f===3?vs.set(-1,D,-E):f===4?vs.set(-E,-1,D):vs.set(E,D,-1),vs.toArray(b,(f*u+C)*g)}}let m=new Ct;m.setAttribute("position",new zn(v,g)),m.setAttribute("outputDirection",new zn(b,g)),t.push(new bt(m,null)),n>sr&&n--}return{lodMeshes:t,sizeLods:e}}function Hu(i,e,t){let n=new Pn(i,e,t);return n.texture.mapping=Hr,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function ir(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function Eg(i,e,t){return new tn({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:wg,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:vl(),fragmentShader:`

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
		`,blending:fi,depthTest:!1,depthWrite:!1})}function Cg(i,e,t){return new tn({name:"SphericalGaussianBlur",defines:{SAMPLES:bg,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:vl(),fragmentShader:`

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
		`,blending:fi,depthTest:!1,depthWrite:!1})}function Wu(){return new tn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:vl(),fragmentShader:`

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
		`,blending:fi,depthTest:!1,depthWrite:!1})}function Xu(){return new tn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:vl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:fi,depthTest:!1,depthWrite:!1})}function vl(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var _l=class extends Pn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new Ir(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new Ci(5,5,5),r=new tn({name:"CubemapFromEquirect",uniforms:xs(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:un,blending:fi});r.uniforms.tEquirect.value=t;let a=new bt(s,r),o=t.minFilter;return t.minFilter===Qi&&(t.minFilter=_n),new So(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){let r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,s);e.setRenderTarget(r)}};function Rg(i){let e=new WeakMap,t=new WeakMap,n=null;function s(u,g=!1){return u==null?null:g?a(u):r(u)}function r(u){if(u&&u.isTexture){let g=u.mapping;if(g===Ao||g===Eo)if(e.has(u)){let v=e.get(u).texture;return o(v,u.mapping)}else{let v=u.image;if(v&&v.height>0){let b=new _l(v.height);return b.fromEquirectangularTexture(i,u),e.set(u,b),u.addEventListener("dispose",l),o(b.texture,u.mapping)}else return null}}return u}function a(u){if(u&&u.isTexture){let g=u.mapping,v=g===Ao||g===Eo,b=g===ji||g===_s;if(v||b){let m=t.get(u),f=m!==void 0?m.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==f)return n===null&&(n=new gl(i)),m=v?n.fromEquirectangular(u,m):n.fromCubemap(u,m),m.texture.pmremVersion=u.pmremVersion,t.set(u,m),m.texture;if(m!==void 0)return m.texture;{let T=u.image;return v&&T&&T.height>0||b&&T&&c(T)?(n===null&&(n=new gl(i)),m=v?n.fromEquirectangular(u):n.fromCubemap(u),m.texture.pmremVersion=u.pmremVersion,t.set(u,m),u.addEventListener("dispose",d),m.texture):null}}}return u}function o(u,g){return g===Ao?u.mapping=ji:g===Eo&&(u.mapping=_s),u}function c(u){let g=0,v=6;for(let b=0;b<v;b++)u[b]!==void 0&&g++;return g===v}function l(u){let g=u.target;g.removeEventListener("dispose",l);let v=e.get(g);v!==void 0&&(e.delete(g),v.dispose())}function d(u){let g=u.target;g.removeEventListener("dispose",d);let v=t.get(g);v!==void 0&&(t.delete(g),v.dispose())}function p(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:p}}function Pg(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let s=i.getExtension(n);return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let s=t(n);return s===null&&cs("WebGLRenderer: "+n+" extension not supported."),s}}}function Ig(i,e,t,n){let s={},r=new WeakMap;function a(p){let u=p.target;u.index!==null&&e.remove(u.index);for(let v in u.attributes)e.remove(u.attributes[v]);u.removeEventListener("dispose",a),delete s[u.id];let g=r.get(u);g&&(e.remove(g),r.delete(u)),n.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,t.memory.geometries--}function o(p,u){return s[u.id]===!0||(u.addEventListener("dispose",a),s[u.id]=!0,t.memory.geometries++),u}function c(p){let u=p.attributes;for(let g in u)e.update(u[g],i.ARRAY_BUFFER)}function l(p){let u=[],g=p.index,v=p.attributes.position,b=0;if(v===void 0)return;if(g!==null){let T=g.array;b=g.version;for(let L=0,w=T.length;L<w;L+=3){let C=T[L+0],E=T[L+1],D=T[L+2];u.push(C,E,E,D,D,C)}}else{let T=v.array;b=v.version;for(let L=0,w=T.length/3-1;L<w;L+=3){let C=L+0,E=L+1,D=L+2;u.push(C,E,E,D,D,C)}}let m=new(v.count>=65535?Rr:Cr)(u,1);m.version=b;let f=r.get(p);f&&e.remove(f),r.set(p,m)}function d(p){let u=r.get(p);if(u){let g=p.index;g!==null&&u.version<g.version&&l(p)}else l(p);return r.get(p)}return{get:o,update:c,getWireframeAttribute:d}}function Lg(i,e,t){let n;function s(p){n=p}let r,a;function o(p){r=p.type,a=p.bytesPerElement}function c(p,u){i.drawElements(n,u,r,p*a),t.update(u,n,1)}function l(p,u,g){g!==0&&(i.drawElementsInstanced(n,u,r,p*a,g),t.update(u,n,g))}function d(p,u,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,u,0,r,p,0,g);let b=0;for(let m=0;m<g;m++)b+=u[m];t.update(b,n,1)}this.setMode=s,this.setIndex=o,this.render=c,this.renderInstances=l,this.renderMultiDraw=d}function Dg(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(r/3);break;case i.LINES:t.lines+=o*(r/2);break;case i.LINE_STRIP:t.lines+=o*(r-1);break;case i.LINE_LOOP:t.lines+=o*r;break;case i.POINTS:t.points+=o*r;break;default:Je("WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function Ng(i,e,t){let n=new WeakMap,s=new Gt;function r(a,o,c){let l=a.morphTargetInfluences,d=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,p=d!==void 0?d.length:0,u=n.get(o);if(u===void 0||u.count!==p){let R=function(){D.dispose(),n.delete(o),o.removeEventListener("dispose",R)};u!==void 0&&u.texture.dispose();let g=o.morphAttributes.position!==void 0,v=o.morphAttributes.normal!==void 0,b=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],f=o.morphAttributes.normal||[],T=o.morphAttributes.color||[],L=0;g===!0&&(L=1),v===!0&&(L=2),b===!0&&(L=3);let w=o.attributes.position.count*L,C=1;w>e.maxTextureSize&&(C=Math.ceil(w/e.maxTextureSize),w=e.maxTextureSize);let E=new Float32Array(w*C*4*p),D=new Ar(E,w,C,p);D.type=si,D.needsUpdate=!0;let _=L*4;for(let N=0;N<p;N++){let V=m[N],G=f[N],$=T[N],z=w*C*4*N;for(let K=0;K<V.count;K++){let ie=K*_;g===!0&&(s.fromBufferAttribute(V,K),E[z+ie+0]=s.x,E[z+ie+1]=s.y,E[z+ie+2]=s.z,E[z+ie+3]=0),v===!0&&(s.fromBufferAttribute(G,K),E[z+ie+4]=s.x,E[z+ie+5]=s.y,E[z+ie+6]=s.z,E[z+ie+7]=0),b===!0&&(s.fromBufferAttribute($,K),E[z+ie+8]=s.x,E[z+ie+9]=s.y,E[z+ie+10]=s.z,E[z+ie+11]=$.itemSize===4?s.w:1)}}u={count:p,texture:D,size:new Ke(w,C)},n.set(o,u),o.addEventListener("dispose",R)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)c.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let g=0;for(let b=0;b<l.length;b++)g+=l[b];let v=o.morphTargetsRelative?1:1-g;c.getUniforms().setValue(i,"morphTargetBaseInfluence",v),c.getUniforms().setValue(i,"morphTargetInfluences",l)}c.getUniforms().setValue(i,"morphTargetsTexture",u.texture,t),c.getUniforms().setValue(i,"morphTargetsTextureSize",u.size)}return{update:r}}function Ug(i,e,t,n,s){let r=new WeakMap;function a(l){let d=s.render.frame,p=l.geometry,u=e.get(l,p);if(r.get(u)!==d&&(e.update(u),r.set(u,d)),l.isInstancedMesh&&(l.hasEventListener("dispose",c)===!1&&l.addEventListener("dispose",c),r.get(l)!==d&&(t.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,i.ARRAY_BUFFER),r.set(l,d))),l.isSkinnedMesh){let g=l.skeleton;r.get(g)!==d&&(g.update(),r.set(g,d))}return u}function o(){r=new WeakMap}function c(l){let d=l.target;d.removeEventListener("dispose",c),n.releaseStatesOfObject(d),t.remove(d.instanceMatrix),d.instanceColor!==null&&t.remove(d.instanceColor)}return{update:a,dispose:o}}var Fg={[_c]:"LINEAR_TONE_MAPPING",[xc]:"REINHARD_TONE_MAPPING",[vc]:"CINEON_TONE_MAPPING",[yc]:"ACES_FILMIC_TONE_MAPPING",[Sc]:"AGX_TONE_MAPPING",[bc]:"NEUTRAL_TONE_MAPPING",[Mc]:"CUSTOM_TONE_MAPPING"};function Og(i,e,t,n,s,r){let a=new Pn(e,t,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,c=null,l=new Ct;l.setAttribute("position",new rt([-1,3,0,-1,-1,0,3,-1,0],3)),l.setAttribute("uv",new rt([0,2,0,0,2,0],2));let d=new oo({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),p=new bt(l,d),u=new Qs(-1,1,1,-1,0,1),g=null,v=null,b=!1,m,f=null,T=[],L=!1;this.setSize=function(w,C){a.setSize(w,C),o!==null&&o.setSize(w,C),c!==null&&c.setSize(w,C);for(let E=0;E<T.length;E++){let D=T[E];D.setSize&&D.setSize(w,C)}},this.setEffects=function(w){T=w,L=T.length>0&&T[0].isRenderPass===!0;let C=a.width,E=a.height;T.length>0&&o===null&&(o=new Pn(C,E,{type:ri,depthBuffer:!1,stencilBuffer:!1}),c=new Pn(C,E,{type:ri,depthBuffer:!1,stencilBuffer:!1}));for(let D=0;D<T.length;D++){let _=T[D];_.setSize&&_.setSize(C,E)}},this.begin=function(w,C){if(b||w.toneMapping===ni&&T.length===0)return!1;if(f=C,C!==null){let E=C.width,D=C.height;(a.width!==E||a.height!==D)&&this.setSize(E,D)}return L===!1&&w.setRenderTarget(a),m=w.toneMapping,w.toneMapping=ni,!0},this.hasRenderPass=function(){return L},this.end=function(w,C){w.toneMapping=m,b=!0;let E=a,D=o;for(let _=0;_<T.length;_++){let R=T[_];R.enabled!==!1&&(R.render(w,D,E,C),R.needsSwap!==!1&&(E=D,D=D===o?c:o))}if(g!==w.outputColorSpace||v!==w.toneMapping){g=w.outputColorSpace,v=w.toneMapping,d.defines={},gt.getTransfer(g)===At&&(d.defines.SRGB_TRANSFER="");let _=Fg[v];_&&(d.defines[_]=""),d.needsUpdate=!0}d.uniforms.tDiffuse.value=E.texture,w.setRenderTarget(f),w.render(p,u),f=null,b=!1},this.isCompositing=function(){return b},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),c!==null&&c.dispose(),l.dispose(),d.dispose()}}var ud=new Tn,$c=new Wi(1,1),dd=new Ar,fd=new to,pd=new Ir,qu=[],Yu=[],Zu=new Float32Array(16),$u=new Float32Array(9),Ju=new Float32Array(4);function ar(i,e,t){let n=i[0];if(n<=0||n>0)return i;let s=e*t,r=qu[s];if(r===void 0&&(r=new Float32Array(s),qu[s]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(r,o)}return r}function nn(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function sn(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function yl(i,e){let t=Yu[e];t===void 0&&(t=new Int32Array(e),Yu[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function Bg(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function zg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(nn(t,e))return;i.uniform2fv(this.addr,e),sn(t,e)}}function kg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(nn(t,e))return;i.uniform3fv(this.addr,e),sn(t,e)}}function Vg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(nn(t,e))return;i.uniform4fv(this.addr,e),sn(t,e)}}function Gg(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(nn(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),sn(t,e)}else{if(nn(t,n))return;Ju.set(n),i.uniformMatrix2fv(this.addr,!1,Ju),sn(t,n)}}function Hg(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(nn(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),sn(t,e)}else{if(nn(t,n))return;$u.set(n),i.uniformMatrix3fv(this.addr,!1,$u),sn(t,n)}}function Wg(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(nn(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),sn(t,e)}else{if(nn(t,n))return;Zu.set(n),i.uniformMatrix4fv(this.addr,!1,Zu),sn(t,n)}}function Xg(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function qg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(nn(t,e))return;i.uniform2iv(this.addr,e),sn(t,e)}}function Yg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(nn(t,e))return;i.uniform3iv(this.addr,e),sn(t,e)}}function Zg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(nn(t,e))return;i.uniform4iv(this.addr,e),sn(t,e)}}function $g(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function Jg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(nn(t,e))return;i.uniform2uiv(this.addr,e),sn(t,e)}}function Kg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(nn(t,e))return;i.uniform3uiv(this.addr,e),sn(t,e)}}function jg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(nn(t,e))return;i.uniform4uiv(this.addr,e),sn(t,e)}}function Qg(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?($c.compareFunction=t.isReversedDepthBuffer()?fl:dl,r=$c):r=ud,t.setTexture2D(e||r,s)}function e0(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||fd,s)}function t0(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||pd,s)}function n0(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||dd,s)}function i0(i){switch(i){case 5126:return Bg;case 35664:return zg;case 35665:return kg;case 35666:return Vg;case 35674:return Gg;case 35675:return Hg;case 35676:return Wg;case 5124:case 35670:return Xg;case 35667:case 35671:return qg;case 35668:case 35672:return Yg;case 35669:case 35673:return Zg;case 5125:return $g;case 36294:return Jg;case 36295:return Kg;case 36296:return jg;case 35678:case 36198:case 36298:case 36306:case 35682:return Qg;case 35679:case 36299:case 36307:return e0;case 35680:case 36300:case 36308:case 36293:return t0;case 36289:case 36303:case 36311:case 36292:return n0}}function s0(i,e){i.uniform1fv(this.addr,e)}function r0(i,e){let t=ar(e,this.size,2);i.uniform2fv(this.addr,t)}function a0(i,e){let t=ar(e,this.size,3);i.uniform3fv(this.addr,t)}function o0(i,e){let t=ar(e,this.size,4);i.uniform4fv(this.addr,t)}function l0(i,e){let t=ar(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function c0(i,e){let t=ar(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function h0(i,e){let t=ar(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function u0(i,e){i.uniform1iv(this.addr,e)}function d0(i,e){i.uniform2iv(this.addr,e)}function f0(i,e){i.uniform3iv(this.addr,e)}function p0(i,e){i.uniform4iv(this.addr,e)}function m0(i,e){i.uniform1uiv(this.addr,e)}function g0(i,e){i.uniform2uiv(this.addr,e)}function _0(i,e){i.uniform3uiv(this.addr,e)}function x0(i,e){i.uniform4uiv(this.addr,e)}function v0(i,e,t){let n=this.cache,s=e.length,r=yl(t,s);nn(n,r)||(i.uniform1iv(this.addr,r),sn(n,r));let a;this.type===i.SAMPLER_2D_SHADOW?a=$c:a=ud;for(let o=0;o!==s;++o)t.setTexture2D(e[o]||a,r[o])}function y0(i,e,t){let n=this.cache,s=e.length,r=yl(t,s);nn(n,r)||(i.uniform1iv(this.addr,r),sn(n,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||fd,r[a])}function M0(i,e,t){let n=this.cache,s=e.length,r=yl(t,s);nn(n,r)||(i.uniform1iv(this.addr,r),sn(n,r));for(let a=0;a!==s;++a)t.setTextureCube(e[a]||pd,r[a])}function S0(i,e,t){let n=this.cache,s=e.length,r=yl(t,s);nn(n,r)||(i.uniform1iv(this.addr,r),sn(n,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||dd,r[a])}function b0(i){switch(i){case 5126:return s0;case 35664:return r0;case 35665:return a0;case 35666:return o0;case 35674:return l0;case 35675:return c0;case 35676:return h0;case 5124:case 35670:return u0;case 35667:case 35671:return d0;case 35668:case 35672:return f0;case 35669:case 35673:return p0;case 5125:return m0;case 36294:return g0;case 36295:return _0;case 36296:return x0;case 35678:case 36198:case 36298:case 36306:case 35682:return v0;case 35679:case 36299:case 36307:return y0;case 35680:case 36300:case 36308:case 36293:return M0;case 36289:case 36303:case 36311:case 36292:return S0}}var Jc=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=i0(t.type)}},Kc=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=b0(t.type)}},jc=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(e,t[o.id],n)}}},Yc=/(\w+)(\])?(\[|\.)?/g;function Ku(i,e){i.seq.push(e),i.map[e.id]=e}function w0(i,e,t){let n=i.name,s=n.length;for(Yc.lastIndex=0;;){let r=Yc.exec(n),a=Yc.lastIndex,o=r[1],c=r[2]==="]",l=r[3];if(c&&(o=o|0),l===void 0||l==="["&&a+2===s){Ku(t,l===void 0?new Jc(o,i,e):new Kc(o,i,e));break}else{let p=t.map[o];p===void 0&&(p=new jc(o),Ku(t,p)),t=p}}}var rr=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){let o=e.getActiveUniform(t,a),c=e.getUniformLocation(t,o.name);w0(o,c,this)}let s=[],r=[];for(let a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,n,s){let r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){let s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,a=t.length;r!==a;++r){let o=t[r],c=n[o.id];c.needsUpdate!==!1&&o.setValue(e,c.value,s)}}static seqWithValue(e,t){let n=[];for(let s=0,r=e.length;s!==r;++s){let a=e[s];a.id in t&&n.push(a)}return n}};function ju(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var T0=37297,A0=0;function E0(i,e){let t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){let o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}var Qu=new tt;function C0(i){gt._getMatrix(Qu,gt.workingColorSpace,i);let e=`mat3( ${Qu.elements.map(t=>t.toFixed(4))} )`;switch(gt.getTransfer(i)){case br:return[e,"LinearTransferOETF"];case At:return[e,"sRGBTransferOETF"];default:return $e("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function ed(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+E0(i.getShaderSource(e),o)}else return r}function R0(i,e){let t=C0(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}var P0={[_c]:"Linear",[xc]:"Reinhard",[vc]:"Cineon",[yc]:"ACESFilmic",[Sc]:"AgX",[bc]:"Neutral",[Mc]:"Custom"};function I0(i,e){let t=P0[e];return t===void 0?($e("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var ml=new B;function L0(){gt.getLuminanceCoefficients(ml);let i=ml.x.toFixed(4),e=ml.y.toFixed(4),t=ml.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function D0(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Qr).join(`
`)}function N0(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function U0(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(e,s),a=r.name,o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function Qr(i){return i!==""}function td(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function nd(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var F0=/^[ \t]*#include +<([\w\d./]+)>/gm;function Qc(i){return i.replace(F0,B0)}var O0=new Map;function B0(i,e){let t=ht[e];if(t===void 0){let n=O0.get(e);if(n!==void 0)t=ht[n],$e('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return Qc(t)}var z0=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function id(i){return i.replace(z0,k0)}function k0(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function sd(i){let e=`precision ${i.precision} float;
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
#define LOW_PRECISION`),e}var V0={[Gr]:"SHADOWMAP_TYPE_PCF",[er]:"SHADOWMAP_TYPE_VSM"};function G0(i){return V0[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var H0={[ji]:"ENVMAP_TYPE_CUBE",[_s]:"ENVMAP_TYPE_CUBE",[Hr]:"ENVMAP_TYPE_CUBE_UV"};function W0(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":H0[i.envMapMode]||"ENVMAP_TYPE_CUBE"}var X0={[_s]:"ENVMAP_MODE_REFRACTION"};function q0(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":X0[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var Y0={[To]:"ENVMAP_BLENDING_MULTIPLY",[Mu]:"ENVMAP_BLENDING_MIX",[Su]:"ENVMAP_BLENDING_ADD"};function Z0(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":Y0[i.combine]||"ENVMAP_BLENDING_NONE"}function $0(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function J0(i,e,t,n){let s=i.getContext(),r=t.defines,a=t.vertexShader,o=t.fragmentShader,c=G0(t),l=W0(t),d=q0(t),p=Z0(t),u=$0(t),g=D0(t),v=N0(r),b=s.createProgram(),m,f,T=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,v].filter(Qr).join(`
`),m.length>0&&(m+=`
`),f=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,v].filter(Qr).join(`
`),f.length>0&&(f+=`
`)):(m=[sd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,v,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+d:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Qr).join(`
`),f=[sd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,v,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+l:"",t.envMap?"#define "+d:"",t.envMap?"#define "+p:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+c:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==ni?"#define TONE_MAPPING":"",t.toneMapping!==ni?ht.tonemapping_pars_fragment:"",t.toneMapping!==ni?I0("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",ht.colorspace_pars_fragment,R0("linearToOutputTexel",t.outputColorSpace),L0(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Qr).join(`
`)),a=Qc(a),a=td(a,t),a=nd(a,t),o=Qc(o),o=td(o,t),o=nd(o,t),a=id(a),o=id(o),t.isRawShaderMaterial!==!0&&(T=`#version 300 es
`,m=[g,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,f=["#define varying in",t.glslVersion===Dc?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===Dc?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+f);let L=T+m+a,w=T+f+o,C=ju(s,s.VERTEX_SHADER,L),E=ju(s,s.FRAGMENT_SHADER,w);s.attachShader(b,C),s.attachShader(b,E),t.index0AttributeName!==void 0?s.bindAttribLocation(b,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(b,0,"position"),s.linkProgram(b);function D(V){if(i.debug.checkShaderErrors){let G=s.getProgramInfoLog(b)||"",$=s.getShaderInfoLog(C)||"",z=s.getShaderInfoLog(E)||"",K=G.trim(),ie=$.trim(),te=z.trim(),X=!0,ee=!0;if(s.getProgramParameter(b,s.LINK_STATUS)===!1)if(X=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,b,C,E);else{let ce=ed(s,C,"vertex"),ge=ed(s,E,"fragment");Je("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(b,s.VALIDATE_STATUS)+`

Material Name: `+V.name+`
Material Type: `+V.type+`

Program Info Log: `+K+`
`+ce+`
`+ge)}else K!==""?$e("WebGLProgram: Program Info Log:",K):(ie===""||te==="")&&(ee=!1);ee&&(V.diagnostics={runnable:X,programLog:K,vertexShader:{log:ie,prefix:m},fragmentShader:{log:te,prefix:f}})}s.deleteShader(C),s.deleteShader(E),_=new rr(s,b),R=U0(s,b)}let _;this.getUniforms=function(){return _===void 0&&D(this),_};let R;this.getAttributes=function(){return R===void 0&&D(this),R};let N=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return N===!1&&(N=s.getProgramParameter(b,T0)),N},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(b),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=A0++,this.cacheKey=e,this.usedTimes=1,this.program=b,this.vertexShader=C,this.fragmentShader=E,this}var K0=0,eh=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new th(e),t.set(e,n)),n}},th=class{constructor(e){this.id=K0++,this.code=e,this.usedTimes=0}};function j0(i){return i===ts||i===$r||i===Jr}function Q0(i,e,t,n,s,r){let a=new Ys,o=new eh,c=new Set,l=[],d=new Map,p=n.logarithmicDepthBuffer,u=n.precision,g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function v(_){return c.add(_),_===0?"uv":`uv${_}`}function b(_,R,N,V,G,$){let z=V.fog,K=G.geometry,ie=_.isMeshStandardMaterial||_.isMeshLambertMaterial||_.isMeshPhongMaterial?V.environment:null,te=_.isMeshStandardMaterial||_.isMeshLambertMaterial&&!_.envMap||_.isMeshPhongMaterial&&!_.envMap,X=e.get(_.envMap||ie,te),ee=X&&X.mapping===Hr?X.image.height:null,ce=g[_.type];_.precision!==null&&(u=n.getMaxPrecision(_.precision),u!==_.precision&&$e("WebGLProgram.getParameters:",_.precision,"not supported, using",u,"instead."));let ge=K.morphAttributes.position||K.morphAttributes.normal||K.morphAttributes.color,Xe=ge!==void 0?ge.length:0,Ve=0;K.morphAttributes.position!==void 0&&(Ve=1),K.morphAttributes.normal!==void 0&&(Ve=2),K.morphAttributes.color!==void 0&&(Ve=3);let vt,ut,ot,se;if(ce){let Rt=mi[ce];vt=Rt.vertexShader,ut=Rt.fragmentShader}else{vt=_.vertexShader,ut=_.fragmentShader;let Rt=o.getVertexShaderStage(_),Mt=o.getFragmentShaderStage(_);o.update(_,Rt,Mt),ot=Rt.id,se=Mt.id}let he=i.getRenderTarget(),ve=i.state.buffers.depth.getReversed(),Ze=G.isInstancedMesh===!0,Fe=G.isBatchedMesh===!0,je=!!_.map,qe=!!_.matcap,it=!!X,ft=!!_.aoMap,st=!!_.lightMap,at=!!_.bumpMap&&_.wireframe===!1,Nt=!!_.normalMap,qt=!!_.displacementMap,dn=!!_.emissiveMap,Lt=!!_.metalnessMap,zt=!!_.roughnessMap,U=_.anisotropy>0,Yt=_.clearcoat>0,dt=_.dispersion>0,I=_.retroreflectivity>0,x=_.iridescence>0,H=_.sheen>0,q=_.transmission>0,ne=U&&!!_.anisotropyMap,xe=Yt&&!!_.clearcoatMap,Se=Yt&&!!_.clearcoatNormalMap,re=Yt&&!!_.clearcoatRoughnessMap,le=x&&!!_.iridescenceMap,Ee=x&&!!_.iridescenceThicknessMap,Oe=H&&!!_.sheenColorMap,be=H&&!!_.sheenRoughnessMap,we=!!_.specularMap,Ge=!!_.specularColorMap,We=!!_.specularIntensityMap,Qe=q&&!!_.transmissionMap,k=q&&!!_.thicknessMap,ye=!!_.gradientMap,ae=!!_.alphaMap,Ce=_.alphaTest>0,Le=!!_.alphaHash,me=!!_.extensions,He=ni;_.toneMapped&&(he===null||he.isXRRenderTarget===!0)&&(He=i.toneMapping);let ke={shaderID:ce,shaderType:_.type,shaderName:_.name,vertexShader:vt,fragmentShader:ut,defines:_.defines,customVertexShaderID:ot,customFragmentShaderID:se,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:u,batching:Fe,batchingColor:Fe&&G._colorsTexture!==null,instancing:Ze,instancingColor:Ze&&G.instanceColor!==null,instancingMorph:Ze&&G.morphTexture!==null,outputColorSpace:he===null?i.outputColorSpace:he.isXRRenderTarget===!0?he.texture.colorSpace:gt.workingColorSpace,alphaToCoverage:!!_.alphaToCoverage,map:je,matcap:qe,envMap:it,envMapMode:it&&X.mapping,envMapCubeUVHeight:ee,aoMap:ft,lightMap:st,bumpMap:at,normalMap:Nt,displacementMap:qt,emissiveMap:dn,normalMapObjectSpace:Nt&&_.normalMapType===Tu,normalMapTangentSpace:Nt&&_.normalMapType===ul,packedNormalMap:Nt&&_.normalMapType===ul&&j0(_.normalMap.format),metalnessMap:Lt,roughnessMap:zt,anisotropy:U,anisotropyMap:ne,clearcoat:Yt,clearcoatMap:xe,clearcoatNormalMap:Se,clearcoatRoughnessMap:re,dispersion:dt,retroreflection:I,iridescence:x,iridescenceMap:le,iridescenceThicknessMap:Ee,sheen:H,sheenColorMap:Oe,sheenRoughnessMap:be,specularMap:we,specularColorMap:Ge,specularIntensityMap:We,transmission:q,transmissionMap:Qe,thicknessMap:k,gradientMap:ye,opaque:_.transparent===!1&&_.blending===Ki&&_.alphaToCoverage===!1,alphaMap:ae,alphaTest:Ce,alphaHash:Le,combine:_.combine,mapUv:je&&v(_.map.channel),aoMapUv:ft&&v(_.aoMap.channel),lightMapUv:st&&v(_.lightMap.channel),bumpMapUv:at&&v(_.bumpMap.channel),normalMapUv:Nt&&v(_.normalMap.channel),displacementMapUv:qt&&v(_.displacementMap.channel),emissiveMapUv:dn&&v(_.emissiveMap.channel),metalnessMapUv:Lt&&v(_.metalnessMap.channel),roughnessMapUv:zt&&v(_.roughnessMap.channel),anisotropyMapUv:ne&&v(_.anisotropyMap.channel),clearcoatMapUv:xe&&v(_.clearcoatMap.channel),clearcoatNormalMapUv:Se&&v(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:re&&v(_.clearcoatRoughnessMap.channel),iridescenceMapUv:le&&v(_.iridescenceMap.channel),iridescenceThicknessMapUv:Ee&&v(_.iridescenceThicknessMap.channel),sheenColorMapUv:Oe&&v(_.sheenColorMap.channel),sheenRoughnessMapUv:be&&v(_.sheenRoughnessMap.channel),specularMapUv:we&&v(_.specularMap.channel),specularColorMapUv:Ge&&v(_.specularColorMap.channel),specularIntensityMapUv:We&&v(_.specularIntensityMap.channel),transmissionMapUv:Qe&&v(_.transmissionMap.channel),thicknessMapUv:k&&v(_.thicknessMap.channel),alphaMapUv:ae&&v(_.alphaMap.channel),vertexTangents:!!K.attributes.tangent&&(Nt||U),vertexNormals:!!K.attributes.normal,vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!K.attributes.color&&K.attributes.color.itemSize===4,pointsUvs:G.isPoints===!0&&!!K.attributes.uv&&(je||ae),fog:!!z,useFog:_.fog===!0,fogExp2:!!z&&z.isFogExp2,flatShading:_.wireframe===!1&&(_.flatShading===!0||K.attributes.normal===void 0&&Nt===!1&&(_.isMeshLambertMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isMeshPhysicalMaterial)),sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:p,reversedDepthBuffer:ve,skinning:G.isSkinnedMesh===!0,hasPositionAttribute:K.attributes.position!==void 0,morphTargets:K.morphAttributes.position!==void 0,morphNormals:K.morphAttributes.normal!==void 0,morphColors:K.morphAttributes.color!==void 0,morphTargetsCount:Xe,morphTextureStride:Ve,numSunLights:R.sun.length,numDirLights:R.directional.length,numPointLights:R.point.length,numSpotLights:R.spot.length,numSpotLightMaps:R.spotLightMap.length,numRectAreaLights:R.rectArea.length,numHemiLights:R.hemi.length,numSunLightShadows:R.sunShadowMap.length,numDirLightShadows:R.directionalShadowMap.length,numPointLightShadows:R.pointShadowMap.length,numSpotLightShadows:R.spotShadowMap.length,numSpotLightShadowsWithMaps:R.numSpotLightShadowsWithMaps,numLightProbes:R.numLightProbes,numLightProbeGrids:$.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:_.dithering,shadowMapEnabled:i.shadowMap.enabled&&N.length>0,shadowMapType:i.shadowMap.type,toneMapping:He,decodeVideoTexture:je&&_.map.isVideoTexture===!0&&gt.getTransfer(_.map.colorSpace)===At,decodeVideoTextureEmissive:dn&&_.emissiveMap.isVideoTexture===!0&&gt.getTransfer(_.emissiveMap.colorSpace)===At,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===Vn,flipSided:_.side===un,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:me&&_.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(me&&_.extensions.multiDraw===!0||Fe)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return ke.vertexUv1s=c.has(1),ke.vertexUv2s=c.has(2),ke.vertexUv3s=c.has(3),c.clear(),ke}function m(_){let R=[];if(_.shaderID?R.push(_.shaderID):(R.push(_.customVertexShaderID),R.push(_.customFragmentShaderID)),_.defines!==void 0)for(let N in _.defines)R.push(N),R.push(_.defines[N]);return _.isRawShaderMaterial===!1&&(f(R,_),T(R,_),R.push(i.outputColorSpace)),R.push(_.customProgramCacheKey),R.join()}function f(_,R){_.push(R.precision),_.push(R.outputColorSpace),_.push(R.envMapMode),_.push(R.envMapCubeUVHeight),_.push(R.mapUv),_.push(R.alphaMapUv),_.push(R.lightMapUv),_.push(R.aoMapUv),_.push(R.bumpMapUv),_.push(R.normalMapUv),_.push(R.displacementMapUv),_.push(R.emissiveMapUv),_.push(R.metalnessMapUv),_.push(R.roughnessMapUv),_.push(R.anisotropyMapUv),_.push(R.clearcoatMapUv),_.push(R.clearcoatNormalMapUv),_.push(R.clearcoatRoughnessMapUv),_.push(R.iridescenceMapUv),_.push(R.iridescenceThicknessMapUv),_.push(R.sheenColorMapUv),_.push(R.sheenRoughnessMapUv),_.push(R.specularMapUv),_.push(R.specularColorMapUv),_.push(R.specularIntensityMapUv),_.push(R.transmissionMapUv),_.push(R.thicknessMapUv),_.push(R.combine),_.push(R.fogExp2),_.push(R.sizeAttenuation),_.push(R.morphTargetsCount),_.push(R.morphAttributeCount),_.push(R.numSunLights),_.push(R.numDirLights),_.push(R.numPointLights),_.push(R.numSpotLights),_.push(R.numSpotLightMaps),_.push(R.numHemiLights),_.push(R.numRectAreaLights),_.push(R.numSunLightShadows),_.push(R.numDirLightShadows),_.push(R.numPointLightShadows),_.push(R.numSpotLightShadows),_.push(R.numSpotLightShadowsWithMaps),_.push(R.numLightProbes),_.push(R.shadowMapType),_.push(R.toneMapping),_.push(R.numClippingPlanes),_.push(R.numClipIntersection),_.push(R.depthPacking)}function T(_,R){a.disableAll(),R.instancing&&a.enable(0),R.instancingColor&&a.enable(1),R.instancingMorph&&a.enable(2),R.matcap&&a.enable(3),R.envMap&&a.enable(4),R.normalMapObjectSpace&&a.enable(5),R.normalMapTangentSpace&&a.enable(6),R.clearcoat&&a.enable(7),R.iridescence&&a.enable(8),R.alphaTest&&a.enable(9),R.vertexColors&&a.enable(10),R.vertexAlphas&&a.enable(11),R.vertexUv1s&&a.enable(12),R.vertexUv2s&&a.enable(13),R.vertexUv3s&&a.enable(14),R.vertexTangents&&a.enable(15),R.anisotropy&&a.enable(16),R.alphaHash&&a.enable(17),R.batching&&a.enable(18),R.dispersion&&a.enable(19),R.retroreflection&&a.enable(24),R.batchingColor&&a.enable(20),R.gradientMap&&a.enable(21),R.packedNormalMap&&a.enable(22),R.vertexNormals&&a.enable(23),_.push(a.mask),a.disableAll(),R.fog&&a.enable(0),R.useFog&&a.enable(1),R.flatShading&&a.enable(2),R.logarithmicDepthBuffer&&a.enable(3),R.reversedDepthBuffer&&a.enable(4),R.skinning&&a.enable(5),R.morphTargets&&a.enable(6),R.morphNormals&&a.enable(7),R.morphColors&&a.enable(8),R.premultipliedAlpha&&a.enable(9),R.shadowMapEnabled&&a.enable(10),R.doubleSided&&a.enable(11),R.flipSided&&a.enable(12),R.useDepthPacking&&a.enable(13),R.dithering&&a.enable(14),R.transmission&&a.enable(15),R.sheen&&a.enable(16),R.opaque&&a.enable(17),R.pointsUvs&&a.enable(18),R.decodeVideoTexture&&a.enable(19),R.decodeVideoTextureEmissive&&a.enable(20),R.alphaToCoverage&&a.enable(21),R.numLightProbeGrids>0&&a.enable(22),R.hasPositionAttribute&&a.enable(23),_.push(a.mask)}function L(_){let R=g[_.type],N;if(R){let V=mi[R];N=zu.clone(V.uniforms)}else N=_.uniforms;return N}function w(_,R){let N=d.get(R);return N!==void 0?++N.usedTimes:(N=new J0(i,R,_,s),l.push(N),d.set(R,N)),N}function C(_){if(--_.usedTimes===0){let R=l.indexOf(_);l[R]=l[l.length-1],l.pop(),d.delete(_.cacheKey),_.destroy()}}function E(_){o.remove(_)}function D(){o.dispose()}return{getParameters:b,getProgramCacheKey:m,getUniforms:L,acquireProgram:w,releaseProgram:C,releaseShaderCache:E,programs:l,dispose:D}}function e_(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,c){i.get(a)[o]=c}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function t_(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function rd(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function ad(){let i=[],e=0,t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function a(u){let g=0;return u.isInstancedMesh&&(g+=2),u.isSkinnedMesh&&(g+=1),g}function o(u,g,v,b,m,f){let T=i[e];return T===void 0?(T={id:u.id,object:u,geometry:g,material:v,materialVariant:a(u),groupOrder:b,renderOrder:u.renderOrder,z:m,group:f},i[e]=T):(T.id=u.id,T.object=u,T.geometry=g,T.material=v,T.materialVariant=a(u),T.groupOrder=b,T.renderOrder=u.renderOrder,T.z=m,T.group=f),e++,T}function c(u,g,v,b,m,f,T){T.reversedDepth===!0&&(m=-m);let L=o(u,g,v,b,m,f);v.transmission>0?n.push(L):v.transparent===!0?s.push(L):t.push(L)}function l(u,g,v,b,m,f){let T=o(u,g,v,b,m,f);v.transmission>0?n.unshift(T):v.transparent===!0?s.unshift(T):t.unshift(T)}function d(u,g){t.length>1&&t.sort(u||t_),n.length>1&&n.sort(g||rd),s.length>1&&s.sort(g||rd)}function p(){for(let u=e,g=i.length;u<g;u++){let v=i[u];if(v.id===null)break;v.id=null,v.object=null,v.geometry=null,v.material=null,v.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:c,unshift:l,finish:p,sort:d}}function n_(){let i=new WeakMap;function e(n,s){let r=i.get(n),a;return r===void 0?(a=new ad,i.set(n,[a])):s>=r.length?(a=new ad,r.push(a)):a=r[s],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function i_(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new B,color:new Ye};break;case"SpotLight":t={position:new B,direction:new B,color:new Ye,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new B,color:new Ye,distance:0,decay:0};break;case"HemisphereLight":t={direction:new B,skyColor:new Ye,groundColor:new Ye};break;case"RectAreaLight":t={color:new Ye,position:new B,halfWidth:new B,halfHeight:new B};break}return i[e.id]=t,t}}}function s_(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ke};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ke};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Ke,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var r_=0;function a_(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function o_(i){let e=new i_,t=s_(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let l=0;l<9;l++)n.probe.push(new B);let s=new B,r=new Dt,a=new Dt;function o(l){let d=0,p=0,u=0;for(let G=0;G<9;G++)n.probe[G].set(0,0,0);let g=0,v=0,b=0,m=0,f=0,T=0,L=0,w=0,C=0,E=0,D=0,_=0,R=0,N=0;l.sort(a_);for(let G=0,$=l.length;G<$;G++){let z=l[G],K=z.color,ie=z.intensity,te=z.distance,X=null;if(z.shadow&&z.shadow.map&&(z.shadow.map.texture.format===ts?X=z.shadow.map.texture:X=z.shadow.map.depthTexture||z.shadow.map.texture),z.isAmbientLight)d+=K.r*ie,p+=K.g*ie,u+=K.b*ie;else if(z.isLightProbe){for(let ee=0;ee<9;ee++)n.probe[ee].addScaledVector(z.sh.coefficients[ee],ie);N++}else if(z.isSunLight){let ee=e.get(z);if(ee.color.copy(z.color).multiplyScalar(z.intensity),z.castShadow){let ce=z.shadow,ge=t.get(z);ge.shadowIntensity=ce.intensity,ge.shadowBias=ce.bias,ge.shadowNormalBias=ce.normalBias,ge.shadowRadius=ce.radius,ge.shadowMapSize.copy(ce.mapSize).multiply(ce.getFrameExtents()),n.sunShadow[v]=ge,n.sunShadowMap[v]=X;let Xe=ce.getViewportCount();for(let Ve=0;Ve<Xe;Ve++)n.sunShadowMatrix[b+Ve]=ce.getMatrix(Ve),n.sunShadowCascade[b+Ve]=ce._cascadeData[Ve];b+=Xe,v++}n.sun[g]=ee,g++}else if(z.isDirectionalLight){let ee=e.get(z);if(ee.color.copy(z.color).multiplyScalar(z.intensity),z.castShadow){let ce=z.shadow,ge=t.get(z);ge.shadowIntensity=ce.intensity,ge.shadowBias=ce.bias,ge.shadowNormalBias=ce.normalBias,ge.shadowRadius=ce.radius,ge.shadowMapSize=ce.mapSize,n.directionalShadow[m]=ge,n.directionalShadowMap[m]=X,n.directionalShadowMatrix[m]=z.shadow.matrix,C++}n.directional[m]=ee,m++}else if(z.isSpotLight){let ee=e.get(z);ee.position.setFromMatrixPosition(z.matrixWorld),ee.color.copy(K).multiplyScalar(ie),ee.distance=te,ee.coneCos=Math.cos(z.angle),ee.penumbraCos=Math.cos(z.angle*(1-z.penumbra)),ee.decay=z.decay,n.spot[T]=ee;let ce=z.shadow;if(z.map&&(n.spotLightMap[_]=z.map,_++,ce.updateMatrices(z),z.castShadow&&R++),n.spotLightMatrix[T]=ce.matrix,z.castShadow){let ge=t.get(z);ge.shadowIntensity=ce.intensity,ge.shadowBias=ce.bias,ge.shadowNormalBias=ce.normalBias,ge.shadowRadius=ce.radius,ge.shadowMapSize=ce.mapSize,n.spotShadow[T]=ge,n.spotShadowMap[T]=X,D++}T++}else if(z.isRectAreaLight){let ee=e.get(z);ee.color.copy(K).multiplyScalar(ie),ee.halfWidth.set(z.width*.5,0,0),ee.halfHeight.set(0,z.height*.5,0),n.rectArea[L]=ee,L++}else if(z.isPointLight){let ee=e.get(z);if(ee.color.copy(z.color).multiplyScalar(z.intensity),ee.distance=z.distance,ee.decay=z.decay,z.castShadow){let ce=z.shadow,ge=t.get(z);ge.shadowIntensity=ce.intensity,ge.shadowBias=ce.bias,ge.shadowNormalBias=ce.normalBias,ge.shadowRadius=ce.radius,ge.shadowMapSize=ce.mapSize,ge.shadowCameraNear=ce.camera.near,ge.shadowCameraFar=ce.camera.far,n.pointShadow[f]=ge,n.pointShadowMap[f]=X,n.pointShadowMatrix[f]=z.shadow.matrix,E++}n.point[f]=ee,f++}else if(z.isHemisphereLight){let ee=e.get(z);ee.skyColor.copy(z.color).multiplyScalar(ie),ee.groundColor.copy(z.groundColor).multiplyScalar(ie),n.hemi[w]=ee,w++}}L>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=Ie.LTC_FLOAT_1,n.rectAreaLTC2=Ie.LTC_FLOAT_2):(n.rectAreaLTC1=Ie.LTC_HALF_1,n.rectAreaLTC2=Ie.LTC_HALF_2)),n.ambient[0]=d,n.ambient[1]=p,n.ambient[2]=u;let V=n.hash;(V.sunLength!==g||V.directionalLength!==m||V.pointLength!==f||V.spotLength!==T||V.rectAreaLength!==L||V.hemiLength!==w||V.numSunShadows!==v||V.numDirectionalShadows!==C||V.numPointShadows!==E||V.numSpotShadows!==D||V.numSpotMaps!==_||V.numLightProbes!==N)&&(n.sun.length=g,n.directional.length=m,n.spot.length=T,n.rectArea.length=L,n.point.length=f,n.hemi.length=w,n.sunShadow.length=v,n.sunShadowMap.length=v,n.sunShadowMatrix.length=b,n.sunShadowCascade.length=b,n.directionalShadow.length=C,n.directionalShadowMap.length=C,n.directionalShadowMatrix.length=C,n.pointShadow.length=E,n.pointShadowMap.length=E,n.pointShadowMatrix.length=E,n.spotShadow.length=D,n.spotShadowMap.length=D,n.spotLightMatrix.length=D+_-R,n.spotLightMap.length=_,n.numSpotLightShadowsWithMaps=R,n.numLightProbes=N,V.sunLength=g,V.directionalLength=m,V.pointLength=f,V.spotLength=T,V.rectAreaLength=L,V.hemiLength=w,V.numSunShadows=v,V.numDirectionalShadows=C,V.numPointShadows=E,V.numSpotShadows=D,V.numSpotMaps=_,V.numLightProbes=N,n.version=r_++)}function c(l,d){let p=0,u=0,g=0,v=0,b=0,m=0,f=d.matrixWorldInverse;for(let T=0,L=l.length;T<L;T++){let w=l[T];if(w.isSunLight){let C=n.sun[p];C.direction.setFromMatrixPosition(w.matrixWorld),C.direction.transformDirection(f),p++}else if(w.isDirectionalLight){let C=n.directional[u];C.direction.setFromMatrixPosition(w.matrixWorld),s.setFromMatrixPosition(w.target.matrixWorld),C.direction.sub(s),C.direction.transformDirection(f),u++}else if(w.isSpotLight){let C=n.spot[v];C.position.setFromMatrixPosition(w.matrixWorld),C.position.applyMatrix4(f),C.direction.setFromMatrixPosition(w.matrixWorld),s.setFromMatrixPosition(w.target.matrixWorld),C.direction.sub(s),C.direction.transformDirection(f),v++}else if(w.isRectAreaLight){let C=n.rectArea[b];C.position.setFromMatrixPosition(w.matrixWorld),C.position.applyMatrix4(f),a.identity(),r.copy(w.matrixWorld),r.premultiply(f),a.extractRotation(r),C.halfWidth.set(w.width*.5,0,0),C.halfHeight.set(0,w.height*.5,0),C.halfWidth.applyMatrix4(a),C.halfHeight.applyMatrix4(a),b++}else if(w.isPointLight){let C=n.point[g];C.position.setFromMatrixPosition(w.matrixWorld),C.position.applyMatrix4(f),g++}else if(w.isHemisphereLight){let C=n.hemi[m];C.direction.setFromMatrixPosition(w.matrixWorld),C.direction.transformDirection(f),m++}}}return{setup:o,setupView:c,state:n}}function od(i){let e=new o_(i),t=[],n=[],s=[];function r(u){p.camera=u,t.length=0,n.length=0,s.length=0}function a(u){t.push(u)}function o(u){n.push(u)}function c(u){s.push(u)}function l(){e.setup(t)}function d(u){e.setupView(t,u)}let p={lightsArray:t,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:p,setupLights:l,setupLightsView:d,pushLight:a,pushShadow:o,pushLightProbeGrid:c}}function l_(i){let e=new WeakMap;function t(s,r=0){let a=e.get(s),o;return a===void 0?(o=new od(i),e.set(s,[o])):r>=a.length?(o=new od(i),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}var c_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,h_=`uniform sampler2D shadow_pass;
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
}`,u_=[new B(1,0,0),new B(-1,0,0),new B(0,1,0),new B(0,-1,0),new B(0,0,1),new B(0,0,-1)],d_=[new B(0,-1,0),new B(0,-1,0),new B(0,0,1),new B(0,0,-1),new B(0,-1,0),new B(0,-1,0)],ld=new Dt,jr=new B,Zc=new B;function f_(i,e,t){let n=new $s,s=new Ke,r=new Ke,a=new Gt,o=new lo,c=new co,l={},d=t.maxTextureSize,p={[Ji]:un,[un]:Ji,[Vn]:Vn},u=new tn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Ke},radius:{value:4}},vertexShader:c_,fragmentShader:h_}),g=u.clone();g.defines.HORIZONTAL_PASS=1;let v=new Ct;v.setAttribute("position",new zn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let b=new bt(v,u),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Gr;let f=this.type;this.render=function(E,D,_){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||E.length===0)return;this.type===nu&&($e("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=Gr);let R=i.getRenderTarget(),N=i.getActiveCubeFace(),V=i.getActiveMipmapLevel(),G=i.state;G.setBlending(fi),G.buffers.depth.getReversed()===!0?G.buffers.color.setClear(0,0,0,0):G.buffers.color.setClear(1,1,1,1),G.buffers.depth.setTest(!0),G.setScissorTest(!1);let $=f!==this.type;$&&D.traverse(function(z){z.material&&(Array.isArray(z.material)?z.material.forEach(K=>K.needsUpdate=!0):z.material.needsUpdate=!0)});for(let z=0,K=E.length;z<K;z++){let ie=E[z],te=ie.shadow;if(te===void 0){$e("WebGLShadowMap:",ie,"has no shadow.");continue}if(te.autoUpdate===!1&&te.needsUpdate===!1)continue;s.copy(te.mapSize);let X=te.getFrameExtents();s.multiply(X),r.copy(te.mapSize),(s.x>d||s.y>d)&&(s.x>d&&(r.x=Math.floor(d/X.x),s.x=r.x*X.x,te.mapSize.x=r.x),s.y>d&&(r.y=Math.floor(d/X.y),s.y=r.y*X.y,te.mapSize.y=r.y));let ee=i.state.buffers.depth.getReversed();if(te.camera._reversedDepth=ee,te.map===null||$===!0){if(te.map!==null&&(te.map.depthTexture!==null&&(te.map.depthTexture.dispose(),te.map.depthTexture=null),te.map.dispose()),this.type===er){if(ie.isPointLight){$e("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}te.map=new Pn(s.x,s.y,{format:ts,type:ri,minFilter:_n,magFilter:_n,generateMipmaps:!1}),te.map.texture.name=ie.name+".shadowMap",te.map.depthTexture=new Wi(s.x,s.y,si),te.map.depthTexture.name=ie.name+".shadowMapDepth",te.map.depthTexture.format=hi,te.map.depthTexture.compareFunction=null,te.map.depthTexture.minFilter=cn,te.map.depthTexture.magFilter=cn}else ie.isPointLight?(te.map=new _l(s.x),te.map.depthTexture=new ao(s.x,ii)):(te.map=new Pn(s.x,s.y),te.map.depthTexture=new Wi(s.x,s.y,ii)),te.map.depthTexture.name=ie.name+".shadowMap",te.map.depthTexture.format=hi,this.type===Gr?(te.map.depthTexture.compareFunction=ee?fl:dl,te.map.depthTexture.minFilter=_n,te.map.depthTexture.magFilter=_n):(te.map.depthTexture.compareFunction=null,te.map.depthTexture.minFilter=cn,te.map.depthTexture.magFilter=cn);te.camera.updateProjectionMatrix()}te.map.isWebGLCubeRenderTarget!==!0&&(te.map.width!==s.x||te.map.height!==s.y)&&te.map.setSize(s.x,s.y);let ce=te.map.isWebGLCubeRenderTarget?6:te.getViewportCount();ie.isPointLight!==!0&&te.updateMatrices(ie,_);for(let ge=0;ge<ce;ge++){let Xe=te.getCamera(ge);if(ie.isPointLight){let Ve=te.camera,vt=te.matrix,ut=ie.distance||Ve.far;ut!==Ve.far&&(Ve.far=ut,Ve.updateProjectionMatrix()),jr.setFromMatrixPosition(ie.matrixWorld),Ve.position.copy(jr),Zc.copy(Ve.position),Zc.add(u_[ge]),Ve.up.copy(d_[ge]),Ve.lookAt(Zc),Ve.updateMatrixWorld(),vt.makeTranslation(-jr.x,-jr.y,-jr.z),ld.multiplyMatrices(Ve.projectionMatrix,Ve.matrixWorldInverse),te._frustum.setFromProjectionMatrix(ld,Ve.coordinateSystem,Ve.reversedDepth)}if(te.map.isWebGLCubeRenderTarget)i.setRenderTarget(te.map,ge),i.clear();else{ge===0&&(i.setRenderTarget(te.map),i.clear());let Ve=te.getViewport(ge);a.set(r.x*Ve.x,r.y*Ve.y,r.x*Ve.z,r.y*Ve.w),G.viewport(a)}n=te.getFrustum(ge),w(D,_,Xe,ie,this.type)}te.isPointLightShadow!==!0&&this.type===er&&T(te,_),te.needsUpdate=!1}f=this.type,m.needsUpdate=!1,i.setRenderTarget(R,N,V)};function T(E,D){let _=e.update(b);u.defines.VSM_SAMPLES!==E.blurSamples&&(u.defines.VSM_SAMPLES=E.blurSamples,g.defines.VSM_SAMPLES=E.blurSamples,u.needsUpdate=!0,g.needsUpdate=!0),E.mapPass===null?E.mapPass=new Pn(s.x,s.y,{format:ts,type:ri}):(E.mapPass.width!==E.map.width||E.mapPass.height!==E.map.height)&&E.mapPass.setSize(E.map.width,E.map.height),u.uniforms.shadow_pass.value=E.map.depthTexture,u.uniforms.resolution.value.set(E.map.width,E.map.height),u.uniforms.radius.value=E.radius,i.setRenderTarget(E.mapPass),i.clear(),i.renderBufferDirect(D,null,_,u,b,null),g.uniforms.shadow_pass.value=E.mapPass.texture,g.uniforms.resolution.value.set(E.map.width,E.map.height),g.uniforms.radius.value=E.radius,i.setRenderTarget(E.map),i.clear(),i.renderBufferDirect(D,null,_,g,b,null)}function L(E,D,_,R){let N=null,V=_.isPointLight===!0?E.customDistanceMaterial:E.customDepthMaterial;if(V!==void 0)N=V;else if(N=_.isPointLight===!0?c:o,i.localClippingEnabled&&D.clipShadows===!0&&Array.isArray(D.clippingPlanes)&&D.clippingPlanes.length!==0||D.displacementMap&&D.displacementScale!==0||D.alphaMap&&D.alphaTest>0||D.map&&D.alphaTest>0||D.alphaToCoverage===!0){let G=N.uuid,$=D.uuid,z=l[G];z===void 0&&(z={},l[G]=z);let K=z[$];K===void 0&&(K=N.clone(),z[$]=K,D.addEventListener("dispose",C)),N=K}if(N.visible=D.visible,N.wireframe=D.wireframe,R===er?N.side=D.shadowSide!==null?D.shadowSide:D.side:N.side=D.shadowSide!==null?D.shadowSide:p[D.side],N.alphaMap=D.alphaMap,N.alphaTest=D.alphaToCoverage===!0?.5:D.alphaTest,N.map=D.map,N.clipShadows=D.clipShadows,N.clippingPlanes=D.clippingPlanes,N.clipIntersection=D.clipIntersection,N.displacementMap=D.displacementMap,N.displacementScale=D.displacementScale,N.displacementBias=D.displacementBias,N.wireframeLinewidth=D.wireframeLinewidth,N.linewidth=D.linewidth,_.isPointLight===!0&&N.isMeshDistanceMaterial===!0){let G=i.properties.get(N);G.light=_}return N}function w(E,D,_,R,N){if(E.visible===!1)return;if(E.layers.test(D.layers)&&(E.isMesh||E.isLine||E.isPoints)&&(E.castShadow||E.receiveShadow&&N===er)&&(!E.frustumCulled||E.intersectsFrustum(n))){E.modelViewMatrix.multiplyMatrices(_.matrixWorldInverse,E.matrixWorld);let $=e.update(E),z=E.material;if(Array.isArray(z)){let K=$.groups;for(let ie=0,te=K.length;ie<te;ie++){let X=K[ie],ee=z[X.materialIndex];if(ee&&ee.visible){let ce=L(E,ee,R,N);E.onBeforeShadow(i,E,D,_,$,ce,X),i.renderBufferDirect(_,null,$,ce,E,X),E.onAfterShadow(i,E,D,_,$,ce,X)}}}else if(z.visible){let K=L(E,z,R,N);E.onBeforeShadow(i,E,D,_,$,K,null),i.renderBufferDirect(_,null,$,K,E,null),E.onAfterShadow(i,E,D,_,$,K,null)}}let G=E.children;for(let $=0,z=G.length;$<z;$++)w(G[$],D,_,R,N)}function C(E){E.target.removeEventListener("dispose",C);for(let _ in l){let R=l[_],N=E.target.uuid;N in R&&(R[N].dispose(),delete R[N])}}}function p_(i,e){function t(){let k=!1,ye=new Gt,ae=null,Ce=new Gt(0,0,0,0);return{setMask:function(Le){ae!==Le&&!k&&(i.colorMask(Le,Le,Le,Le),ae=Le)},setLocked:function(Le){k=Le},setClear:function(Le,me,He,ke,Rt){Rt===!0&&(Le*=ke,me*=ke,He*=ke),ye.set(Le,me,He,ke),Ce.equals(ye)===!1&&(i.clearColor(Le,me,He,ke),Ce.copy(ye))},reset:function(){k=!1,ae=null,Ce.set(-1,0,0,0)}}}function n(){let k=!1,ye=!1,ae=null,Ce=null,Le=null;return{setReversed:function(me){if(ye!==me){let He=e.get("EXT_clip_control");me?He.clipControlEXT(He.LOWER_LEFT_EXT,He.ZERO_TO_ONE_EXT):He.clipControlEXT(He.LOWER_LEFT_EXT,He.NEGATIVE_ONE_TO_ONE_EXT),ye=me;let ke=Le;Le=null,this.setClear(ke)}},getReversed:function(){return ye},setTest:function(me){me?he(i.DEPTH_TEST):ve(i.DEPTH_TEST)},setMask:function(me){ae!==me&&!k&&(i.depthMask(me),ae=me)},setFunc:function(me){if(ye&&(me=Fu[me]),Ce!==me){switch(me){case Ga:i.depthFunc(i.NEVER);break;case Ha:i.depthFunc(i.ALWAYS);break;case Wa:i.depthFunc(i.LESS);break;case Hs:i.depthFunc(i.LEQUAL);break;case Xa:i.depthFunc(i.EQUAL);break;case qa:i.depthFunc(i.GEQUAL);break;case Ya:i.depthFunc(i.GREATER);break;case Za:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}Ce=me}},setLocked:function(me){k=me},setClear:function(me){Le!==me&&(Le=me,ye&&(me=1-me),i.clearDepth(me))},reset:function(){k=!1,ae=null,Ce=null,Le=null,ye=!1}}}function s(){let k=!1,ye=null,ae=null,Ce=null,Le=null,me=null,He=null,ke=null,Rt=null;return{setTest:function(Mt){k||(Mt?he(i.STENCIL_TEST):ve(i.STENCIL_TEST))},setMask:function(Mt){ye!==Mt&&!k&&(i.stencilMask(Mt),ye=Mt)},setFunc:function(Mt,fn,En){(ae!==Mt||Ce!==fn||Le!==En)&&(i.stencilFunc(Mt,fn,En),ae=Mt,Ce=fn,Le=En)},setOp:function(Mt,fn,En){(me!==Mt||He!==fn||ke!==En)&&(i.stencilOp(Mt,fn,En),me=Mt,He=fn,ke=En)},setLocked:function(Mt){k=Mt},setClear:function(Mt){Rt!==Mt&&(i.clearStencil(Mt),Rt=Mt)},reset:function(){k=!1,ye=null,ae=null,Ce=null,Le=null,me=null,He=null,ke=null,Rt=null}}}let r=new t,a=new n,o=new s,c=new WeakMap,l=new WeakMap,d={},p={},u={},g=new WeakMap,v=[],b=null,m=!1,f=null,T=null,L=null,w=null,C=null,E=null,D=null,_=new Ye(0,0,0),R=0,N=!1,V=null,G=null,$=null,z=null,K=null,ie=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),te=!1,X=0,ee=i.getParameter(i.VERSION);ee.indexOf("WebGL")!==-1?(X=parseFloat(/^WebGL (\d)/.exec(ee)[1]),te=X>=1):ee.indexOf("OpenGL ES")!==-1&&(X=parseFloat(/^OpenGL ES (\d)/.exec(ee)[1]),te=X>=2);let ce=null,ge={},Xe=i.getParameter(i.SCISSOR_BOX),Ve=i.getParameter(i.VIEWPORT),vt=new Gt().fromArray(Xe),ut=new Gt().fromArray(Ve);function ot(k,ye,ae,Ce){let Le=new Uint8Array(4),me=i.createTexture();i.bindTexture(k,me),i.texParameteri(k,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(k,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let He=0;He<ae;He++)k===i.TEXTURE_3D||k===i.TEXTURE_2D_ARRAY?i.texImage3D(ye,0,i.RGBA,1,1,Ce,0,i.RGBA,i.UNSIGNED_BYTE,Le):i.texImage2D(ye+He,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,Le);return me}let se={};se[i.TEXTURE_2D]=ot(i.TEXTURE_2D,i.TEXTURE_2D,1),se[i.TEXTURE_CUBE_MAP]=ot(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),se[i.TEXTURE_2D_ARRAY]=ot(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),se[i.TEXTURE_3D]=ot(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),he(i.DEPTH_TEST),a.setFunc(Hs),at(!1),Nt(dc),he(i.CULL_FACE),ft(fi);function he(k){d[k]!==!0&&(i.enable(k),d[k]=!0)}function ve(k){d[k]!==!1&&(i.disable(k),d[k]=!1)}function Ze(k,ye){return u[k]!==ye?(i.bindFramebuffer(k,ye),u[k]=ye,k===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=ye),k===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=ye),!0):!1}function Fe(k,ye){let ae=v,Ce=!1;if(k){ae=g.get(ye),ae===void 0&&(ae=[],g.set(ye,ae));let Le=k.textures;if(ae.length!==Le.length||ae[0]!==i.COLOR_ATTACHMENT0){for(let me=0,He=Le.length;me<He;me++)ae[me]=i.COLOR_ATTACHMENT0+me;ae.length=Le.length,Ce=!0}}else ae[0]!==i.BACK&&(ae[0]=i.BACK,Ce=!0);Ce&&i.drawBuffers(ae)}function je(k){return b!==k?(i.useProgram(k),b=k,!0):!1}let qe={[gs]:i.FUNC_ADD,[su]:i.FUNC_SUBTRACT,[ru]:i.FUNC_REVERSE_SUBTRACT};qe[au]=i.MIN,qe[ou]=i.MAX;let it={[lu]:i.ZERO,[cu]:i.ONE,[hu]:i.SRC_COLOR,[mc]:i.SRC_ALPHA,[gu]:i.SRC_ALPHA_SATURATE,[pu]:i.DST_COLOR,[du]:i.DST_ALPHA,[uu]:i.ONE_MINUS_SRC_COLOR,[gc]:i.ONE_MINUS_SRC_ALPHA,[mu]:i.ONE_MINUS_DST_COLOR,[fu]:i.ONE_MINUS_DST_ALPHA,[_u]:i.CONSTANT_COLOR,[xu]:i.ONE_MINUS_CONSTANT_COLOR,[vu]:i.CONSTANT_ALPHA,[yu]:i.ONE_MINUS_CONSTANT_ALPHA};function ft(k,ye,ae,Ce,Le,me,He,ke,Rt,Mt){if(k===fi){m===!0&&(ve(i.BLEND),m=!1);return}if(m===!1&&(he(i.BLEND),m=!0),k!==iu){if(k!==f||Mt!==N){if((T!==gs||C!==gs)&&(i.blendEquation(i.FUNC_ADD),T=gs,C=gs),Mt)switch(k){case Ki:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case An:i.blendFunc(i.ONE,i.ONE);break;case fc:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case pc:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:Je("WebGLState: Invalid blending: ",k);break}else switch(k){case Ki:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case An:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case fc:Je("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case pc:Je("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Je("WebGLState: Invalid blending: ",k);break}L=null,w=null,E=null,D=null,_.set(0,0,0),R=0,f=k,N=Mt}return}Le=Le||ye,me=me||ae,He=He||Ce,(ye!==T||Le!==C)&&(i.blendEquationSeparate(qe[ye],qe[Le]),T=ye,C=Le),(ae!==L||Ce!==w||me!==E||He!==D)&&(i.blendFuncSeparate(it[ae],it[Ce],it[me],it[He]),L=ae,w=Ce,E=me,D=He),(ke.equals(_)===!1||Rt!==R)&&(i.blendColor(ke.r,ke.g,ke.b,Rt),_.copy(ke),R=Rt),f=k,N=!1}function st(k,ye){k.side===Vn?ve(i.CULL_FACE):he(i.CULL_FACE);let ae=k.side===un;ye&&(ae=!ae),at(ae),k.blending===Ki&&k.transparent===!1?ft(fi):ft(k.blending,k.blendEquation,k.blendSrc,k.blendDst,k.blendEquationAlpha,k.blendSrcAlpha,k.blendDstAlpha,k.blendColor,k.blendAlpha,k.premultipliedAlpha),a.setFunc(k.depthFunc),a.setTest(k.depthTest),a.setMask(k.depthWrite),r.setMask(k.colorWrite);let Ce=k.stencilWrite;o.setTest(Ce),Ce&&(o.setMask(k.stencilWriteMask),o.setFunc(k.stencilFunc,k.stencilRef,k.stencilFuncMask),o.setOp(k.stencilFail,k.stencilZFail,k.stencilZPass)),dn(k.polygonOffset,k.polygonOffsetFactor,k.polygonOffsetUnits),k.alphaToCoverage===!0?he(i.SAMPLE_ALPHA_TO_COVERAGE):ve(i.SAMPLE_ALPHA_TO_COVERAGE)}function at(k){V!==k&&(k?i.frontFace(i.CW):i.frontFace(i.CCW),V=k)}function Nt(k){k!==eu?(he(i.CULL_FACE),k!==G&&(k===dc?i.cullFace(i.BACK):k===tu?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):ve(i.CULL_FACE),G=k}function qt(k){k!==$&&(te&&i.lineWidth(k),$=k)}function dn(k,ye,ae){k?(he(i.POLYGON_OFFSET_FILL),(z!==ye||K!==ae)&&(z=ye,K=ae,a.getReversed()&&(ye=-ye),i.polygonOffset(ye,ae))):ve(i.POLYGON_OFFSET_FILL)}function Lt(k){k?he(i.SCISSOR_TEST):ve(i.SCISSOR_TEST)}function zt(k){k===void 0&&(k=i.TEXTURE0+ie-1),ce!==k&&(i.activeTexture(k),ce=k)}function U(k,ye,ae){ae===void 0&&(ce===null?ae=i.TEXTURE0+ie-1:ae=ce);let Ce=ge[ae];Ce===void 0&&(Ce={type:void 0,texture:void 0},ge[ae]=Ce),(Ce.type!==k||Ce.texture!==ye)&&(ce!==ae&&(i.activeTexture(ae),ce=ae),i.bindTexture(k,ye||se[k]),Ce.type=k,Ce.texture=ye)}function Yt(){let k=ge[ce];k!==void 0&&k.type!==void 0&&(i.bindTexture(k.type,null),k.type=void 0,k.texture=void 0)}function dt(){try{i.compressedTexImage2D(...arguments)}catch(k){Je("WebGLState:",k)}}function I(){try{i.compressedTexImage3D(...arguments)}catch(k){Je("WebGLState:",k)}}function x(){try{i.texSubImage2D(...arguments)}catch(k){Je("WebGLState:",k)}}function H(){try{i.texSubImage3D(...arguments)}catch(k){Je("WebGLState:",k)}}function q(){try{i.compressedTexSubImage2D(...arguments)}catch(k){Je("WebGLState:",k)}}function ne(){try{i.compressedTexSubImage3D(...arguments)}catch(k){Je("WebGLState:",k)}}function xe(){try{i.texStorage2D(...arguments)}catch(k){Je("WebGLState:",k)}}function Se(){try{i.texStorage3D(...arguments)}catch(k){Je("WebGLState:",k)}}function re(){try{i.texImage2D(...arguments)}catch(k){Je("WebGLState:",k)}}function le(){try{i.texImage3D(...arguments)}catch(k){Je("WebGLState:",k)}}function Ee(k){return p[k]!==void 0?p[k]:i.getParameter(k)}function Oe(k,ye){p[k]!==ye&&(i.pixelStorei(k,ye),p[k]=ye)}function be(k){vt.equals(k)===!1&&(i.scissor(k.x,k.y,k.z,k.w),vt.copy(k))}function we(k){ut.equals(k)===!1&&(i.viewport(k.x,k.y,k.z,k.w),ut.copy(k))}function Ge(k,ye){let ae=l.get(ye);ae===void 0&&(ae=new WeakMap,l.set(ye,ae));let Ce=ae.get(k);Ce===void 0&&(Ce=i.getUniformBlockIndex(ye,k.name),ae.set(k,Ce))}function We(k,ye){let Ce=l.get(ye).get(k);c.get(ye)!==Ce&&(i.uniformBlockBinding(ye,Ce,k.__bindingPointIndex),c.set(ye,Ce))}function Qe(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),d={},p={},ce=null,ge={},u={},g=new WeakMap,v=[],b=null,m=!1,f=null,T=null,L=null,w=null,C=null,E=null,D=null,_=new Ye(0,0,0),R=0,N=!1,V=null,G=null,$=null,z=null,K=null,vt.set(0,0,i.canvas.width,i.canvas.height),ut.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:he,disable:ve,bindFramebuffer:Ze,drawBuffers:Fe,useProgram:je,setBlending:ft,setMaterial:st,setFlipSided:at,setCullFace:Nt,setLineWidth:qt,setPolygonOffset:dn,setScissorTest:Lt,activeTexture:zt,bindTexture:U,unbindTexture:Yt,compressedTexImage2D:dt,compressedTexImage3D:I,texImage2D:re,texImage3D:le,pixelStorei:Oe,getParameter:Ee,updateUBOMapping:Ge,uniformBlockBinding:We,texStorage2D:xe,texStorage3D:Se,texSubImage2D:x,texSubImage3D:H,compressedTexSubImage2D:q,compressedTexSubImage3D:ne,scissor:be,viewport:we,reset:Qe}}function m_(i,e,t,n,s,r,a){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,c=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),l=new Ke,d=new WeakMap,p=new Set,u,g=new WeakMap,v=!1;try{v=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function b(I,x){return v?new OffscreenCanvas(I,x):wr("canvas")}function m(I,x,H){let q=1,ne=dt(I);if((ne.width>H||ne.height>H)&&(q=H/Math.max(ne.width,ne.height)),q<1)if(typeof HTMLImageElement<"u"&&I instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&I instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&I instanceof ImageBitmap||typeof VideoFrame<"u"&&I instanceof VideoFrame){let xe=Math.floor(q*ne.width),Se=Math.floor(q*ne.height);u===void 0&&(u=b(xe,Se));let re=x?b(xe,Se):u;return re.width=xe,re.height=Se,re.getContext("2d").drawImage(I,0,0,xe,Se),$e("WebGLRenderer: Texture has been resized from ("+ne.width+"x"+ne.height+") to ("+xe+"x"+Se+")."),re}else return"data"in I&&$e("WebGLRenderer: Image in DataTexture is too big ("+ne.width+"x"+ne.height+")."),I;return I}function f(I){return I.generateMipmaps}function T(I){i.generateMipmap(I)}function L(I){return I.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:I.isWebGL3DRenderTarget?i.TEXTURE_3D:I.isWebGLArrayRenderTarget||I.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function w(I,x,H,q,ne,xe=!1){if(I!==null){if(i[I]!==void 0)return i[I];$e("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+I+"'")}let Se;q&&(Se=e.get("EXT_texture_norm16"),Se||$e("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let re=x;if(x===i.RED&&(H===i.FLOAT&&(re=i.R32F),H===i.HALF_FLOAT&&(re=i.R16F),H===i.UNSIGNED_BYTE&&(re=i.R8),H===i.UNSIGNED_SHORT&&Se&&(re=Se.R16_EXT),H===i.SHORT&&Se&&(re=Se.R16_SNORM_EXT)),x===i.RED_INTEGER&&(H===i.UNSIGNED_BYTE&&(re=i.R8UI),H===i.UNSIGNED_SHORT&&(re=i.R16UI),H===i.UNSIGNED_INT&&(re=i.R32UI),H===i.BYTE&&(re=i.R8I),H===i.SHORT&&(re=i.R16I),H===i.INT&&(re=i.R32I)),x===i.RG&&(H===i.FLOAT&&(re=i.RG32F),H===i.HALF_FLOAT&&(re=i.RG16F),H===i.UNSIGNED_BYTE&&(re=i.RG8),H===i.UNSIGNED_SHORT&&Se&&(re=Se.RG16_EXT),H===i.SHORT&&Se&&(re=Se.RG16_SNORM_EXT)),x===i.RG_INTEGER&&(H===i.UNSIGNED_BYTE&&(re=i.RG8UI),H===i.UNSIGNED_SHORT&&(re=i.RG16UI),H===i.UNSIGNED_INT&&(re=i.RG32UI),H===i.BYTE&&(re=i.RG8I),H===i.SHORT&&(re=i.RG16I),H===i.INT&&(re=i.RG32I)),x===i.RGB_INTEGER&&(H===i.UNSIGNED_BYTE&&(re=i.RGB8UI),H===i.UNSIGNED_SHORT&&(re=i.RGB16UI),H===i.UNSIGNED_INT&&(re=i.RGB32UI),H===i.BYTE&&(re=i.RGB8I),H===i.SHORT&&(re=i.RGB16I),H===i.INT&&(re=i.RGB32I)),x===i.RGBA_INTEGER&&(H===i.UNSIGNED_BYTE&&(re=i.RGBA8UI),H===i.UNSIGNED_SHORT&&(re=i.RGBA16UI),H===i.UNSIGNED_INT&&(re=i.RGBA32UI),H===i.BYTE&&(re=i.RGBA8I),H===i.SHORT&&(re=i.RGBA16I),H===i.INT&&(re=i.RGBA32I)),x===i.RGB&&(H===i.UNSIGNED_SHORT&&Se&&(re=Se.RGB16_EXT),H===i.SHORT&&Se&&(re=Se.RGB16_SNORM_EXT),H===i.UNSIGNED_INT_5_9_9_9_REV&&(re=i.RGB9_E5),H===i.UNSIGNED_INT_10F_11F_11F_REV&&(re=i.R11F_G11F_B10F)),x===i.RGBA){let le=xe?br:gt.getTransfer(ne);H===i.FLOAT&&(re=i.RGBA32F),H===i.HALF_FLOAT&&(re=i.RGBA16F),H===i.UNSIGNED_BYTE&&(re=le===At?i.SRGB8_ALPHA8:i.RGBA8),H===i.UNSIGNED_SHORT&&Se&&(re=Se.RGBA16_EXT),H===i.SHORT&&Se&&(re=Se.RGBA16_SNORM_EXT),H===i.UNSIGNED_SHORT_4_4_4_4&&(re=i.RGBA4),H===i.UNSIGNED_SHORT_5_5_5_1&&(re=i.RGB5_A1)}return(re===i.R16F||re===i.R32F||re===i.RG16F||re===i.RG32F||re===i.RGBA16F||re===i.RGBA32F)&&e.get("EXT_color_buffer_float"),re}function C(I,x){let H;return I?x===null||x===ii||x===nr?H=i.DEPTH24_STENCIL8:x===si?H=i.DEPTH32F_STENCIL8:x===tr&&(H=i.DEPTH24_STENCIL8,$e("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):x===null||x===ii||x===nr?H=i.DEPTH_COMPONENT24:x===si?H=i.DEPTH_COMPONENT32F:x===tr&&(H=i.DEPTH_COMPONENT16),H}function E(I,x){return f(I)===!0||I.isFramebufferTexture&&I.minFilter!==cn&&I.minFilter!==_n?Math.log2(Math.max(x.width,x.height))+1:I.mipmaps!==void 0&&I.mipmaps.length>0?I.mipmaps.length:I.isCompressedTexture&&Array.isArray(I.image)?x.mipmaps.length:1}function D(I){let x=I.target;x.removeEventListener("dispose",D),R(x),x.isVideoTexture&&d.delete(x),x.isHTMLTexture&&p.delete(x)}function _(I){let x=I.target;x.removeEventListener("dispose",_),V(x)}function R(I){let x=n.get(I);if(x.__webglInit===void 0)return;let H=I.source,q=g.get(H);if(q){let ne=q[x.__cacheKey];ne.usedTimes--,ne.usedTimes===0&&N(I),Object.keys(q).length===0&&g.delete(H)}n.remove(I)}function N(I){let x=n.get(I);i.deleteTexture(x.__webglTexture);let H=I.source,q=g.get(H);delete q[x.__cacheKey],a.memory.textures--}function V(I){let x=n.get(I);if(I.depthTexture&&(I.depthTexture.dispose(),n.remove(I.depthTexture)),I.isWebGLCubeRenderTarget)for(let q=0;q<6;q++){if(Array.isArray(x.__webglFramebuffer[q]))for(let ne=0;ne<x.__webglFramebuffer[q].length;ne++)i.deleteFramebuffer(x.__webglFramebuffer[q][ne]);else i.deleteFramebuffer(x.__webglFramebuffer[q]);x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer[q])}else{if(Array.isArray(x.__webglFramebuffer))for(let q=0;q<x.__webglFramebuffer.length;q++)i.deleteFramebuffer(x.__webglFramebuffer[q]);else i.deleteFramebuffer(x.__webglFramebuffer);if(x.__webglDepthbuffer&&i.deleteRenderbuffer(x.__webglDepthbuffer),x.__webglMultisampledFramebuffer&&i.deleteFramebuffer(x.__webglMultisampledFramebuffer),x.__webglColorRenderbuffer)for(let q=0;q<x.__webglColorRenderbuffer.length;q++)x.__webglColorRenderbuffer[q]&&i.deleteRenderbuffer(x.__webglColorRenderbuffer[q]);x.__webglDepthRenderbuffer&&i.deleteRenderbuffer(x.__webglDepthRenderbuffer)}let H=I.textures;for(let q=0,ne=H.length;q<ne;q++){let xe=n.get(H[q]);xe.__webglTexture&&(i.deleteTexture(xe.__webglTexture),a.memory.textures--),n.remove(H[q])}n.remove(I)}let G=0;function $(){G=0}function z(){return G}function K(I){G=I}function ie(){let I=G;return I>=s.maxTextures&&$e("WebGLTextures: Trying to use "+(I+1)+" texture units while this GPU supports only "+s.maxTextures),G+=1,I}function te(I){let x=[];return x.push(I.wrapS),x.push(I.wrapT),x.push(I.wrapR||0),x.push(I.magFilter),x.push(I.minFilter),x.push(I.anisotropy),x.push(I.internalFormat),x.push(I.format),x.push(I.type),x.push(I.generateMipmaps),x.push(I.premultiplyAlpha),x.push(I.flipY),x.push(I.unpackAlignment),x.push(I.colorSpace),x.join()}function X(I,x){let H=n.get(I);if(I.isVideoTexture&&U(I),I.isRenderTargetTexture===!1&&I.isExternalTexture!==!0&&I.version>0&&H.__version!==I.version){let q=I.image;if(q===null)$e("WebGLRenderer: Texture marked for update but no image data found.");else if(q.complete===!1)$e("WebGLRenderer: Texture marked for update but image is incomplete");else{ve(H,I,x);return}}else I.isExternalTexture&&(H.__webglTexture=I.sourceTexture?I.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,H.__webglTexture,i.TEXTURE0+x)}function ee(I,x){let H=n.get(I);if(I.isRenderTargetTexture===!1&&I.version>0&&H.__version!==I.version){ve(H,I,x);return}else I.isExternalTexture&&(H.__webglTexture=I.sourceTexture?I.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,H.__webglTexture,i.TEXTURE0+x)}function ce(I,x){let H=n.get(I);if(I.isRenderTargetTexture===!1&&I.version>0&&H.__version!==I.version){ve(H,I,x);return}t.bindTexture(i.TEXTURE_3D,H.__webglTexture,i.TEXTURE0+x)}function ge(I,x){let H=n.get(I);if(I.isCubeDepthTexture!==!0&&I.version>0&&H.__version!==I.version){Ze(H,I,x);return}t.bindTexture(i.TEXTURE_CUBE_MAP,H.__webglTexture,i.TEXTURE0+x)}let Xe={[$a]:i.REPEAT,[ci]:i.CLAMP_TO_EDGE,[Ja]:i.MIRRORED_REPEAT},Ve={[cn]:i.NEAREST,[bu]:i.NEAREST_MIPMAP_NEAREST,[Wr]:i.NEAREST_MIPMAP_LINEAR,[_n]:i.LINEAR,[Co]:i.LINEAR_MIPMAP_NEAREST,[Qi]:i.LINEAR_MIPMAP_LINEAR},vt={[Eu]:i.NEVER,[Lu]:i.ALWAYS,[Cu]:i.LESS,[dl]:i.LEQUAL,[Ru]:i.EQUAL,[fl]:i.GEQUAL,[Pu]:i.GREATER,[Iu]:i.NOTEQUAL};function ut(I,x){if(x.type===si&&e.has("OES_texture_float_linear")===!1&&(x.magFilter===_n||x.magFilter===Co||x.magFilter===Wr||x.magFilter===Qi||x.minFilter===_n||x.minFilter===Co||x.minFilter===Wr||x.minFilter===Qi)&&$e("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(I,i.TEXTURE_WRAP_S,Xe[x.wrapS]),i.texParameteri(I,i.TEXTURE_WRAP_T,Xe[x.wrapT]),(I===i.TEXTURE_3D||I===i.TEXTURE_2D_ARRAY)&&i.texParameteri(I,i.TEXTURE_WRAP_R,Xe[x.wrapR]),i.texParameteri(I,i.TEXTURE_MAG_FILTER,Ve[x.magFilter]),i.texParameteri(I,i.TEXTURE_MIN_FILTER,Ve[x.minFilter]),x.compareFunction&&(i.texParameteri(I,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(I,i.TEXTURE_COMPARE_FUNC,vt[x.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(x.magFilter===cn||x.minFilter!==Wr&&x.minFilter!==Qi||x.type===si&&e.has("OES_texture_float_linear")===!1)return;if(x.anisotropy>1||n.get(x).__currentAnisotropy){let H=e.get("EXT_texture_filter_anisotropic");i.texParameterf(I,H.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(x.anisotropy,s.getMaxAnisotropy())),n.get(x).__currentAnisotropy=x.anisotropy}}}function ot(I,x){let H=!1;I.__webglInit===void 0&&(I.__webglInit=!0,x.addEventListener("dispose",D));let q=x.source,ne=g.get(q);ne===void 0&&(ne={},g.set(q,ne));let xe=te(x);if(xe!==I.__cacheKey){ne[xe]===void 0&&(ne[xe]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,H=!0),ne[xe].usedTimes++;let Se=ne[I.__cacheKey];Se!==void 0&&(ne[I.__cacheKey].usedTimes--,Se.usedTimes===0&&N(x)),I.__cacheKey=xe,I.__webglTexture=ne[xe].texture}return H}function se(I,x,H){return Math.floor(Math.floor(I/H)/x)}function he(I,x,H,q){let xe=I.updateRanges;if(xe.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,x.width,x.height,H,q,x.data);else{xe.sort((Oe,be)=>Oe.start-be.start);let Se=0;for(let Oe=1;Oe<xe.length;Oe++){let be=xe[Se],we=xe[Oe],Ge=be.start+be.count,We=se(we.start,x.width,4),Qe=se(be.start,x.width,4);we.start<=Ge+1&&We===Qe&&se(we.start+we.count-1,x.width,4)===We?be.count=Math.max(be.count,we.start+we.count-be.start):(++Se,xe[Se]=we)}xe.length=Se+1;let re=t.getParameter(i.UNPACK_ROW_LENGTH),le=t.getParameter(i.UNPACK_SKIP_PIXELS),Ee=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,x.width);for(let Oe=0,be=xe.length;Oe<be;Oe++){let we=xe[Oe],Ge=Math.floor(we.start/4),We=Math.ceil(we.count/4),Qe=Ge%x.width,k=Math.floor(Ge/x.width),ye=We,ae=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,Qe),t.pixelStorei(i.UNPACK_SKIP_ROWS,k),t.texSubImage2D(i.TEXTURE_2D,0,Qe,k,ye,ae,H,q,x.data)}I.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,re),t.pixelStorei(i.UNPACK_SKIP_PIXELS,le),t.pixelStorei(i.UNPACK_SKIP_ROWS,Ee)}}function ve(I,x,H){let q=i.TEXTURE_2D;(x.isDataArrayTexture||x.isCompressedArrayTexture)&&(q=i.TEXTURE_2D_ARRAY),x.isData3DTexture&&(q=i.TEXTURE_3D);let ne=ot(I,x),xe=x.source;t.bindTexture(q,I.__webglTexture,i.TEXTURE0+H);let Se=n.get(xe);if(xe.version!==Se.__version||ne===!0){if(t.activeTexture(i.TEXTURE0+H),(typeof ImageBitmap<"u"&&x.image instanceof ImageBitmap)===!1){let ae=gt.getPrimaries(gt.workingColorSpace),Ce=x.colorSpace===Ii?null:gt.getPrimaries(x.colorSpace),Le=x.colorSpace===Ii||ae===Ce?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Le)}t.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment);let le=m(x.image,!1,s.maxTextureSize);le=Yt(x,le);let Ee=r.convert(x.format,x.colorSpace),Oe=r.convert(x.type),be=w(x.internalFormat,Ee,Oe,x.normalized,x.colorSpace,x.isVideoTexture);ut(q,x);let we,Ge=x.mipmaps,We=x.isVideoTexture!==!0,Qe=Se.__version===void 0||ne===!0,k=xe.dataReady,ye=E(x,le);if(x.isDepthTexture)be=C(x.format===es,x.type),Qe&&(We?t.texStorage2D(i.TEXTURE_2D,1,be,le.width,le.height):t.texImage2D(i.TEXTURE_2D,0,be,le.width,le.height,0,Ee,Oe,null));else if(x.isDataTexture)if(Ge.length>0){We&&Qe&&t.texStorage2D(i.TEXTURE_2D,ye,be,Ge[0].width,Ge[0].height);for(let ae=0,Ce=Ge.length;ae<Ce;ae++)we=Ge[ae],We?k&&t.texSubImage2D(i.TEXTURE_2D,ae,0,0,we.width,we.height,Ee,Oe,we.data):t.texImage2D(i.TEXTURE_2D,ae,be,we.width,we.height,0,Ee,Oe,we.data);x.generateMipmaps=!1}else We?(Qe&&t.texStorage2D(i.TEXTURE_2D,ye,be,le.width,le.height),k&&he(x,le,Ee,Oe)):t.texImage2D(i.TEXTURE_2D,0,be,le.width,le.height,0,Ee,Oe,le.data);else if(x.isCompressedTexture)if(x.isCompressedArrayTexture){We&&Qe&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ye,be,Ge[0].width,Ge[0].height,le.depth);for(let ae=0,Ce=Ge.length;ae<Ce;ae++)if(we=Ge[ae],x.format!==Xn)if(Ee!==null)if(We){if(k)if(x.layerUpdates.size>0){let Le=Oc(we.width,we.height,x.format,x.type);for(let me of x.layerUpdates){let He=we.data.subarray(me*Le/we.data.BYTES_PER_ELEMENT,(me+1)*Le/we.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ae,0,0,me,we.width,we.height,1,Ee,He)}}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ae,0,0,0,we.width,we.height,le.depth,Ee,we.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,ae,be,we.width,we.height,le.depth,0,we.data,0,0);else $e("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else We?k&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,ae,0,0,0,we.width,we.height,le.depth,Ee,Oe,we.data):t.texImage3D(i.TEXTURE_2D_ARRAY,ae,be,we.width,we.height,le.depth,0,Ee,Oe,we.data);x.layerUpdates.size>0&&x.clearLayerUpdates()}else{We&&Qe&&t.texStorage2D(i.TEXTURE_2D,ye,be,Ge[0].width,Ge[0].height);for(let ae=0,Ce=Ge.length;ae<Ce;ae++)we=Ge[ae],x.format!==Xn?Ee!==null?We?k&&t.compressedTexSubImage2D(i.TEXTURE_2D,ae,0,0,we.width,we.height,Ee,we.data):t.compressedTexImage2D(i.TEXTURE_2D,ae,be,we.width,we.height,0,we.data):$e("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):We?k&&t.texSubImage2D(i.TEXTURE_2D,ae,0,0,we.width,we.height,Ee,Oe,we.data):t.texImage2D(i.TEXTURE_2D,ae,be,we.width,we.height,0,Ee,Oe,we.data)}else if(x.isDataArrayTexture)if(We){if(Qe&&t.texStorage3D(i.TEXTURE_2D_ARRAY,ye,be,le.width,le.height,le.depth),k)if(x.layerUpdates.size>0){let ae=Oc(le.width,le.height,x.format,x.type);for(let Ce of x.layerUpdates){let Le=le.data.subarray(Ce*ae/le.data.BYTES_PER_ELEMENT,(Ce+1)*ae/le.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Ce,le.width,le.height,1,Ee,Oe,Le)}x.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,le.width,le.height,le.depth,Ee,Oe,le.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,be,le.width,le.height,le.depth,0,Ee,Oe,le.data);else if(x.isData3DTexture)We?(Qe&&t.texStorage3D(i.TEXTURE_3D,ye,be,le.width,le.height,le.depth),k&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,le.width,le.height,le.depth,Ee,Oe,le.data)):t.texImage3D(i.TEXTURE_3D,0,be,le.width,le.height,le.depth,0,Ee,Oe,le.data);else if(x.isFramebufferTexture){if(Qe)if(We)t.texStorage2D(i.TEXTURE_2D,ye,be,le.width,le.height);else{let ae=le.width,Ce=le.height;for(let Le=0;Le<ye;Le++)t.texImage2D(i.TEXTURE_2D,Le,be,ae,Ce,0,Ee,Oe,null),ae>>=1,Ce>>=1}}else if(x.isHTMLTexture){if("texElementImage2D"in i){let ae=i.canvas;if(ae.hasAttribute("layoutsubtree")||ae.setAttribute("layoutsubtree","true"),le.parentNode!==ae){ae.appendChild(le),p.add(x),ae.onpaint=Ce=>{let Le=Ce.changedElements;for(let me of p)Le.includes(me.image)&&(me.needsUpdate=!0)},ae.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,le);else{let Le=i.RGBA,me=i.RGBA,He=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,Le,me,He,le)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(Ge.length>0){if(We&&Qe){let ae=dt(Ge[0]);t.texStorage2D(i.TEXTURE_2D,ye,be,ae.width,ae.height)}for(let ae=0,Ce=Ge.length;ae<Ce;ae++)we=Ge[ae],We?k&&t.texSubImage2D(i.TEXTURE_2D,ae,0,0,Ee,Oe,we):t.texImage2D(i.TEXTURE_2D,ae,be,Ee,Oe,we);x.generateMipmaps=!1}else if(We){if(Qe){let ae=dt(le);t.texStorage2D(i.TEXTURE_2D,ye,be,ae.width,ae.height)}k&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,Ee,Oe,le)}else t.texImage2D(i.TEXTURE_2D,0,be,Ee,Oe,le);f(x)&&T(q),Se.__version=xe.version,x.onUpdate&&x.onUpdate(x)}I.__version=x.version}function Ze(I,x,H){if(x.image.length!==6)return;let q=ot(I,x),ne=x.source;t.bindTexture(i.TEXTURE_CUBE_MAP,I.__webglTexture,i.TEXTURE0+H);let xe=n.get(ne);if(ne.version!==xe.__version||q===!0){t.activeTexture(i.TEXTURE0+H);let Se=gt.getPrimaries(gt.workingColorSpace),re=x.colorSpace===Ii?null:gt.getPrimaries(x.colorSpace),le=x.colorSpace===Ii||Se===re?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,x.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,x.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,x.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,le);let Ee=x.isCompressedTexture||x.image[0].isCompressedTexture,Oe=x.image[0]&&x.image[0].isDataTexture,be=[];for(let me=0;me<6;me++)!Ee&&!Oe?be[me]=m(x.image[me],!0,s.maxCubemapSize):be[me]=Oe?x.image[me].image:x.image[me],be[me]=Yt(x,be[me]);let we=be[0],Ge=r.convert(x.format,x.colorSpace),We=r.convert(x.type),Qe=w(x.internalFormat,Ge,We,x.normalized,x.colorSpace),k=x.isVideoTexture!==!0,ye=xe.__version===void 0||q===!0,ae=ne.dataReady,Ce=E(x,we);ut(i.TEXTURE_CUBE_MAP,x);let Le;if(Ee){k&&ye&&t.texStorage2D(i.TEXTURE_CUBE_MAP,Ce,Qe,we.width,we.height);for(let me=0;me<6;me++){Le=be[me].mipmaps;for(let He=0;He<Le.length;He++){let ke=Le[He];x.format!==Xn?Ge!==null?k?ae&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,He,0,0,ke.width,ke.height,Ge,ke.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,He,Qe,ke.width,ke.height,0,ke.data):$e("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):k?ae&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,He,0,0,ke.width,ke.height,Ge,We,ke.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,He,Qe,ke.width,ke.height,0,Ge,We,ke.data)}}}else{if(Le=x.mipmaps,k&&ye){Le.length>0&&Ce++;let me=dt(be[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,Ce,Qe,me.width,me.height)}for(let me=0;me<6;me++)if(Oe){k?ae&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,0,0,0,be[me].width,be[me].height,Ge,We,be[me].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,0,Qe,be[me].width,be[me].height,0,Ge,We,be[me].data);for(let He=0;He<Le.length;He++){let Rt=Le[He].image[me].image;k?ae&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,He+1,0,0,Rt.width,Rt.height,Ge,We,Rt.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,He+1,Qe,Rt.width,Rt.height,0,Ge,We,Rt.data)}}else{k?ae&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,0,0,0,Ge,We,be[me]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,0,Qe,Ge,We,be[me]);for(let He=0;He<Le.length;He++){let ke=Le[He];k?ae&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,He+1,0,0,Ge,We,ke.image[me]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+me,He+1,Qe,Ge,We,ke.image[me])}}}f(x)&&T(i.TEXTURE_CUBE_MAP),xe.__version=ne.version,x.onUpdate&&x.onUpdate(x)}I.__version=x.version}function Fe(I,x,H,q,ne,xe){let Se=r.convert(H.format,H.colorSpace),re=r.convert(H.type),le=w(H.internalFormat,Se,re,H.normalized,H.colorSpace),Ee=n.get(x),Oe=n.get(H);if(Oe.__renderTarget=x,!Ee.__hasExternalTextures){let be=Math.max(1,x.width>>xe),we=Math.max(1,x.height>>xe);ne===i.TEXTURE_3D||ne===i.TEXTURE_2D_ARRAY?t.texImage3D(ne,xe,le,be,we,x.depth,0,Se,re,null):t.texImage2D(ne,xe,le,be,we,0,Se,re,null)}t.bindFramebuffer(i.FRAMEBUFFER,I),zt(x)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,q,ne,Oe.__webglTexture,0,Lt(x)):(ne===i.TEXTURE_2D||ne>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&ne<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,q,ne,Oe.__webglTexture,xe),t.bindFramebuffer(i.FRAMEBUFFER,null)}function je(I,x,H){if(i.bindRenderbuffer(i.RENDERBUFFER,I),x.depthBuffer){let q=x.depthTexture,ne=q&&q.isDepthTexture?q.type:null,xe=C(x.stencilBuffer,ne),Se=x.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;zt(x)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Lt(x),xe,x.width,x.height):H?i.renderbufferStorageMultisample(i.RENDERBUFFER,Lt(x),xe,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,xe,x.width,x.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,Se,i.RENDERBUFFER,I)}else{let q=x.textures;for(let ne=0;ne<q.length;ne++){let xe=q[ne],Se=r.convert(xe.format,xe.colorSpace),re=r.convert(xe.type),le=w(xe.internalFormat,Se,re,xe.normalized,xe.colorSpace);zt(x)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Lt(x),le,x.width,x.height):H?i.renderbufferStorageMultisample(i.RENDERBUFFER,Lt(x),le,x.width,x.height):i.renderbufferStorage(i.RENDERBUFFER,le,x.width,x.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function qe(I,x,H){let q=x.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,I),!(x.depthTexture&&x.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let ne=n.get(x.depthTexture);if(ne.__renderTarget=x,(!ne.__webglTexture||x.depthTexture.image.width!==x.width||x.depthTexture.image.height!==x.height)&&(x.depthTexture.image.width=x.width,x.depthTexture.image.height=x.height,x.depthTexture.needsUpdate=!0),q){if(ne.__webglInit===void 0&&(ne.__webglInit=!0,x.depthTexture.addEventListener("dispose",D)),ne.__webglTexture===void 0){ne.__webglTexture=i.createTexture(),t.bindTexture(i.TEXTURE_CUBE_MAP,ne.__webglTexture),ut(i.TEXTURE_CUBE_MAP,x.depthTexture);let Ee=r.convert(x.depthTexture.format),Oe=r.convert(x.depthTexture.type),be;x.depthTexture.format===hi?be=i.DEPTH_COMPONENT24:x.depthTexture.format===es&&(be=i.DEPTH24_STENCIL8);for(let we=0;we<6;we++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+we,0,be,x.width,x.height,0,Ee,Oe,null)}}else X(x.depthTexture,0);let xe=ne.__webglTexture,Se=Lt(x),re=q?i.TEXTURE_CUBE_MAP_POSITIVE_X+H:i.TEXTURE_2D,le=x.depthTexture.format===es?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(x.depthTexture.format===hi)zt(x)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,le,re,xe,0,Se):i.framebufferTexture2D(i.FRAMEBUFFER,le,re,xe,0);else if(x.depthTexture.format===es)zt(x)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,le,re,xe,0,Se):i.framebufferTexture2D(i.FRAMEBUFFER,le,re,xe,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function it(I){let x=n.get(I),H=I.isWebGLCubeRenderTarget===!0;if(x.__boundDepthTexture!==I.depthTexture){let q=I.depthTexture;if(x.__depthDisposeCallback&&x.__depthDisposeCallback(),q){let ne=()=>{delete x.__boundDepthTexture,delete x.__depthDisposeCallback,q.removeEventListener("dispose",ne)};q.addEventListener("dispose",ne),x.__depthDisposeCallback=ne}x.__boundDepthTexture=q}if(I.depthTexture&&!x.__autoAllocateDepthBuffer)if(H)for(let q=0;q<6;q++)qe(x.__webglFramebuffer[q],I,q);else{let q=I.texture.mipmaps;q&&q.length>0?qe(x.__webglFramebuffer[0],I,0):qe(x.__webglFramebuffer,I,0)}else if(H){x.__webglDepthbuffer=[];for(let q=0;q<6;q++)if(t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer[q]),x.__webglDepthbuffer[q]===void 0)x.__webglDepthbuffer[q]=i.createRenderbuffer(),je(x.__webglDepthbuffer[q],I,!1);else{let ne=I.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,xe=x.__webglDepthbuffer[q];i.bindRenderbuffer(i.RENDERBUFFER,xe),i.framebufferRenderbuffer(i.FRAMEBUFFER,ne,i.RENDERBUFFER,xe)}}else{let q=I.texture.mipmaps;if(q&&q.length>0?t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,x.__webglFramebuffer),x.__webglDepthbuffer===void 0)x.__webglDepthbuffer=i.createRenderbuffer(),je(x.__webglDepthbuffer,I,!1);else{let ne=I.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,xe=x.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,xe),i.framebufferRenderbuffer(i.FRAMEBUFFER,ne,i.RENDERBUFFER,xe)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function ft(I,x,H){let q=n.get(I);x!==void 0&&Fe(q.__webglFramebuffer,I,I.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),H!==void 0&&it(I)}function st(I){let x=I.texture,H=n.get(I),q=n.get(x);I.addEventListener("dispose",_);let ne=I.textures,xe=I.isWebGLCubeRenderTarget===!0,Se=ne.length>1;if(Se||(q.__webglTexture===void 0&&(q.__webglTexture=i.createTexture()),q.__version=x.version,a.memory.textures++),xe){H.__webglFramebuffer=[];for(let re=0;re<6;re++)if(x.mipmaps&&x.mipmaps.length>0){H.__webglFramebuffer[re]=[];for(let le=0;le<x.mipmaps.length;le++)H.__webglFramebuffer[re][le]=i.createFramebuffer()}else H.__webglFramebuffer[re]=i.createFramebuffer()}else{if(x.mipmaps&&x.mipmaps.length>0){H.__webglFramebuffer=[];for(let re=0;re<x.mipmaps.length;re++)H.__webglFramebuffer[re]=i.createFramebuffer()}else H.__webglFramebuffer=i.createFramebuffer();if(Se)for(let re=0,le=ne.length;re<le;re++){let Ee=n.get(ne[re]);Ee.__webglTexture===void 0&&(Ee.__webglTexture=i.createTexture(),a.memory.textures++)}if(I.samples>0&&zt(I)===!1){H.__webglMultisampledFramebuffer=i.createFramebuffer(),H.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,H.__webglMultisampledFramebuffer);for(let re=0;re<ne.length;re++){let le=ne[re];H.__webglColorRenderbuffer[re]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,H.__webglColorRenderbuffer[re]);let Ee=r.convert(le.format,le.colorSpace),Oe=r.convert(le.type),be=w(le.internalFormat,Ee,Oe,le.normalized,le.colorSpace,I.isXRRenderTarget===!0),we=Lt(I);i.renderbufferStorageMultisample(i.RENDERBUFFER,we,be,I.width,I.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+re,i.RENDERBUFFER,H.__webglColorRenderbuffer[re])}i.bindRenderbuffer(i.RENDERBUFFER,null),I.depthBuffer&&(H.__webglDepthRenderbuffer=i.createRenderbuffer(),je(H.__webglDepthRenderbuffer,I,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(xe){t.bindTexture(i.TEXTURE_CUBE_MAP,q.__webglTexture),ut(i.TEXTURE_CUBE_MAP,x);for(let re=0;re<6;re++)if(x.mipmaps&&x.mipmaps.length>0)for(let le=0;le<x.mipmaps.length;le++)Fe(H.__webglFramebuffer[re][le],I,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+re,le);else Fe(H.__webglFramebuffer[re],I,x,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+re,0);f(x)&&T(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(Se){for(let re=0,le=ne.length;re<le;re++){let Ee=ne[re],Oe=n.get(Ee),be=i.TEXTURE_2D;(I.isWebGL3DRenderTarget||I.isWebGLArrayRenderTarget)&&(be=I.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(be,Oe.__webglTexture),ut(be,Ee),Fe(H.__webglFramebuffer,I,Ee,i.COLOR_ATTACHMENT0+re,be,0),f(Ee)&&T(be)}t.unbindTexture()}else{let re=i.TEXTURE_2D;if((I.isWebGL3DRenderTarget||I.isWebGLArrayRenderTarget)&&(re=I.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(re,q.__webglTexture),ut(re,x),x.mipmaps&&x.mipmaps.length>0)for(let le=0;le<x.mipmaps.length;le++)Fe(H.__webglFramebuffer[le],I,x,i.COLOR_ATTACHMENT0,re,le);else Fe(H.__webglFramebuffer,I,x,i.COLOR_ATTACHMENT0,re,0);f(x)&&T(re),t.unbindTexture()}I.depthBuffer&&it(I)}function at(I){let x=I.textures;for(let H=0,q=x.length;H<q;H++){let ne=x[H];if(f(ne)){let xe=L(I),Se=n.get(ne).__webglTexture;t.bindTexture(xe,Se),T(xe),t.unbindTexture()}}}let Nt=[],qt=[];function dn(I){if(I.samples>0){if(zt(I)===!1){let x=I.textures,H=I.width,q=I.height,ne=i.COLOR_BUFFER_BIT,xe=I.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,Se=n.get(I),re=x.length>1;if(re)for(let Ee=0;Ee<x.length;Ee++)t.bindFramebuffer(i.FRAMEBUFFER,Se.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ee,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,Se.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ee,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,Se.__webglMultisampledFramebuffer);let le=I.texture.mipmaps;le&&le.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Se.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Se.__webglFramebuffer);for(let Ee=0;Ee<x.length;Ee++){if(I.resolveDepthBuffer&&(I.depthBuffer&&(ne|=i.DEPTH_BUFFER_BIT),I.stencilBuffer&&I.resolveStencilBuffer&&(ne|=i.STENCIL_BUFFER_BIT)),re){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,Se.__webglColorRenderbuffer[Ee]);let Oe=n.get(x[Ee]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Oe,0)}i.blitFramebuffer(0,0,H,q,0,0,H,q,ne,i.NEAREST),c===!0&&(Nt.length=0,qt.length=0,Nt.push(i.COLOR_ATTACHMENT0+Ee),I.depthBuffer&&I.storeMultisampledDepthBuffer===!1&&(Nt.push(xe),qt.push(xe),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,qt)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Nt))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),re)for(let Ee=0;Ee<x.length;Ee++){t.bindFramebuffer(i.FRAMEBUFFER,Se.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ee,i.RENDERBUFFER,Se.__webglColorRenderbuffer[Ee]);let Oe=n.get(x[Ee]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,Se.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ee,i.TEXTURE_2D,Oe,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,Se.__webglMultisampledFramebuffer)}else if(I.depthBuffer&&I.storeMultisampledDepthBuffer===!1&&c){let x=I.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[x])}}}function Lt(I){return Math.min(s.maxSamples,I.samples)}function zt(I){let x=n.get(I);return I.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&x.__useRenderToTexture!==!1}function U(I){let x=a.render.frame;d.get(I)!==x&&(d.set(I,x),I.update())}function Yt(I,x){let H=I.colorSpace,q=I.format,ne=I.type;return I.isCompressedTexture===!0||I.isVideoTexture===!0||H!==Sr&&H!==Ii&&(gt.getTransfer(H)===At?(q!==Xn||ne!==In)&&$e("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Je("WebGLTextures: Unsupported texture color space:",H)),x}function dt(I){return typeof HTMLImageElement<"u"&&I instanceof HTMLImageElement?(l.width=I.naturalWidth||I.width,l.height=I.naturalHeight||I.height):typeof VideoFrame<"u"&&I instanceof VideoFrame?(l.width=I.displayWidth,l.height=I.displayHeight):(l.width=I.width,l.height=I.height),l}this.allocateTextureUnit=ie,this.resetTextureUnits=$,this.getTextureUnits=z,this.setTextureUnits=K,this.setTexture2D=X,this.setTexture2DArray=ee,this.setTexture3D=ce,this.setTextureCube=ge,this.rebindTextures=ft,this.setupRenderTarget=st,this.updateRenderTargetMipmap=at,this.updateMultisampleRenderTarget=dn,this.setupDepthRenderbuffer=it,this.setupFrameBufferTexture=Fe,this.useMultisampledRTT=zt,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function g_(i,e){function t(n,s=Ii){let r,a=gt.getTransfer(s);if(n===In)return i.UNSIGNED_BYTE;if(n===Po)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Io)return i.UNSIGNED_SHORT_5_5_5_1;if(n===Ec)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===Cc)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===Tc)return i.BYTE;if(n===Ac)return i.SHORT;if(n===tr)return i.UNSIGNED_SHORT;if(n===Ro)return i.INT;if(n===ii)return i.UNSIGNED_INT;if(n===si)return i.FLOAT;if(n===ri)return i.HALF_FLOAT;if(n===Rc)return i.ALPHA;if(n===Pc)return i.RGB;if(n===Xn)return i.RGBA;if(n===hi)return i.DEPTH_COMPONENT;if(n===es)return i.DEPTH_STENCIL;if(n===Ic)return i.RED;if(n===Lo)return i.RED_INTEGER;if(n===ts)return i.RG;if(n===Do)return i.RG_INTEGER;if(n===No)return i.RGBA_INTEGER;if(n===Xr||n===qr||n===Yr||n===Zr)if(a===At)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===Xr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===qr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===Yr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===Zr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===Xr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===qr)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===Yr)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===Zr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Uo||n===Fo||n===Oo||n===Bo)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Uo)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Fo)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Oo)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Bo)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===zo||n===ko||n===Vo||n===Go||n===Ho||n===$r||n===Wo)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===zo||n===ko)return a===At?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Vo)return a===At?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===Go)return r.COMPRESSED_R11_EAC;if(n===Ho)return r.COMPRESSED_SIGNED_R11_EAC;if(n===$r)return r.COMPRESSED_RG11_EAC;if(n===Wo)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Xo||n===qo||n===Yo||n===Zo||n===$o||n===Jo||n===Ko||n===jo||n===Qo||n===el||n===tl||n===nl||n===il||n===sl)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Xo)return a===At?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===qo)return a===At?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Yo)return a===At?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Zo)return a===At?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===$o)return a===At?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Jo)return a===At?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Ko)return a===At?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===jo)return a===At?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Qo)return a===At?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===el)return a===At?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===tl)return a===At?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===nl)return a===At?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===il)return a===At?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===sl)return a===At?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===rl||n===al||n===ol)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===rl)return a===At?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===al)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===ol)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===ll||n===cl||n===Jr||n===hl)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===ll)return r.COMPRESSED_RED_RGTC1_EXT;if(n===cl)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===Jr)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===hl)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===nr?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var __=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,x_=`
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

}`,nh=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new Lr(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new tn({vertexShader:__,fragmentShader:x_,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new bt(new Ri(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},ih=class extends ui{constructor(e,t){super();let n=this,s=null,r=1,a=null,o="local-floor",c=1,l=null,d=null,p=null,u=null,g=null,v=null,b=typeof XRWebGLBinding<"u",m=new nh,f={},T=t.getContextAttributes(),L=null,w=null,C=[],E=[],D=new Ke,_=null,R=null,N=new yn;N.viewport=new Gt;let V=new yn;V.viewport=new Gt;let G=[N,V],$=new bo,z=null,K=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(se){let he=C[se];return he===void 0&&(he=new Zs,C[se]=he),he.getTargetRaySpace()},this.getControllerGrip=function(se){let he=C[se];return he===void 0&&(he=new Zs,C[se]=he),he.getGripSpace()},this.getHand=function(se){let he=C[se];return he===void 0&&(he=new Zs,C[se]=he),he.getHandSpace()};function ie(se){let he=E.indexOf(se.inputSource);if(he===-1)return;let ve=C[he];ve!==void 0&&(ve.update(se.inputSource,se.frame,l||a),ve.dispatchEvent({type:se.type,data:se.inputSource}))}function te(){s.removeEventListener("select",ie),s.removeEventListener("selectstart",ie),s.removeEventListener("selectend",ie),s.removeEventListener("squeeze",ie),s.removeEventListener("squeezestart",ie),s.removeEventListener("squeezeend",ie),s.removeEventListener("end",te),s.removeEventListener("inputsourceschange",X);for(let se=0;se<C.length;se++){let he=E[se];he!==null&&(E[se]=null,C[se].disconnect(he))}z=null,K=null,m.reset();for(let se in f)delete f[se];if(e.setRenderTarget(L),g=null,u=null,p=null,s=null,w=null,ot.stop(),n.isPresenting=!1,e.setPixelRatio(_),e.setSize(D.width,D.height,!1),R!==null){let se=R.camera;se.fov=R.fov,se.zoom=R.zoom,se.updateProjectionMatrix(),R=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(se){r=se,n.isPresenting===!0&&$e("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(se){o=se,n.isPresenting===!0&&$e("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return l||a},this.setReferenceSpace=function(se){l=se},this.getBaseLayer=function(){return u!==null?u:g},this.getBinding=function(){return p===null&&b&&(p=new XRWebGLBinding(s,t)),p},this.getFrame=function(){return v},this.getSession=function(){return s},this.setSession=async function(se){if(s=se,s!==null){if(L=e.getRenderTarget(),s.addEventListener("select",ie),s.addEventListener("selectstart",ie),s.addEventListener("selectend",ie),s.addEventListener("squeeze",ie),s.addEventListener("squeezestart",ie),s.addEventListener("squeezeend",ie),s.addEventListener("end",te),s.addEventListener("inputsourceschange",X),T.xrCompatible!==!0&&await t.makeXRCompatible(),_=e.getPixelRatio(),e.getSize(D),b&&"createProjectionLayer"in XRWebGLBinding.prototype){let ve=null,Ze=null,Fe=null;T.depth&&(Fe=T.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ve=T.stencil?es:hi,Ze=T.stencil?nr:ii);let je={colorFormat:t.RGBA8,depthFormat:Fe,scaleFactor:r};p=this.getBinding(),u=p.createProjectionLayer(je),s.updateRenderState({layers:[u]}),e.setPixelRatio(1),e.setSize(u.textureWidth,u.textureHeight,!1),w=new Pn(u.textureWidth,u.textureHeight,{format:Xn,type:In,depthTexture:new Wi(u.textureWidth,u.textureHeight,Ze,void 0,void 0,void 0,void 0,void 0,void 0,ve),stencilBuffer:T.stencil,colorSpace:e.outputColorSpace,samples:T.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1,storeMultisampledDepthBuffer:u.ignoreDepthValues===!1,storeMultisampledStencilBuffer:u.ignoreDepthValues===!1})}else{let ve={antialias:T.antialias,alpha:!0,depth:T.depth,stencil:T.stencil,framebufferScaleFactor:r};g=new XRWebGLLayer(s,t,ve),s.updateRenderState({baseLayer:g}),e.setPixelRatio(1),e.setSize(g.framebufferWidth,g.framebufferHeight,!1),w=new Pn(g.framebufferWidth,g.framebufferHeight,{format:Xn,type:In,colorSpace:e.outputColorSpace,stencilBuffer:T.stencil,resolveDepthBuffer:g.ignoreDepthValues===!1,resolveStencilBuffer:g.ignoreDepthValues===!1,storeMultisampledDepthBuffer:g.ignoreDepthValues===!1,storeMultisampledStencilBuffer:g.ignoreDepthValues===!1})}w.isXRRenderTarget=!0,this.setFoveation(c),l=null,a=await s.requestReferenceSpace(o),ot.setContext(s),ot.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function X(se){for(let he=0;he<se.removed.length;he++){let ve=se.removed[he],Ze=E.indexOf(ve);Ze>=0&&(E[Ze]=null,C[Ze].disconnect(ve))}for(let he=0;he<se.added.length;he++){let ve=se.added[he],Ze=E.indexOf(ve);if(Ze===-1){for(let je=0;je<C.length;je++)if(je>=E.length){E.push(ve),Ze=je;break}else if(E[je]===null){E[je]=ve,Ze=je;break}if(Ze===-1)break}let Fe=C[Ze];Fe&&Fe.connect(ve)}}let ee=new B,ce=new B;function ge(se,he,ve){ee.setFromMatrixPosition(he.matrixWorld),ce.setFromMatrixPosition(ve.matrixWorld);let Ze=ee.distanceTo(ce),Fe=he.projectionMatrix.elements,je=ve.projectionMatrix.elements,qe=Fe[14]/(Fe[10]-1),it=Fe[14]/(Fe[10]+1),ft=(Fe[9]+1)/Fe[5],st=(Fe[9]-1)/Fe[5],at=(Fe[8]-1)/Fe[0],Nt=(je[8]+1)/je[0],qt=qe*at,dn=qe*Nt,Lt=Ze/(-at+Nt),zt=Lt*-at;if(he.matrixWorld.decompose(se.position,se.quaternion,se.scale),se.translateX(zt),se.translateZ(Lt),se.matrixWorld.compose(se.position,se.quaternion,se.scale),se.matrixWorldInverse.copy(se.matrixWorld).invert(),Fe[10]===-1)se.projectionMatrix.copy(he.projectionMatrix),se.projectionMatrixInverse.copy(he.projectionMatrixInverse);else{let U=qe+Lt,Yt=it+Lt,dt=qt-zt,I=dn+(Ze-zt),x=ft*it/Yt*U,H=st*it/Yt*U;se.projectionMatrix.makePerspective(dt,I,x,H,U,Yt),se.projectionMatrixInverse.copy(se.projectionMatrix).invert()}}function Xe(se,he){he===null?se.matrixWorld.copy(se.matrix):se.matrixWorld.multiplyMatrices(he.matrixWorld,se.matrix),se.matrixWorldInverse.copy(se.matrixWorld).invert()}this.updateCamera=function(se){if(s===null)return;let he=se.near,ve=se.far;m.texture!==null&&(m.depthNear>0&&(he=m.depthNear),m.depthFar>0&&(ve=m.depthFar)),$.near=V.near=N.near=he,$.far=V.far=N.far=ve,(z!==$.near||K!==$.far)&&(s.updateRenderState({depthNear:$.near,depthFar:$.far}),z=$.near,K=$.far),$.layers.mask=se.layers.mask|6,N.layers.mask=$.layers.mask&-5,V.layers.mask=$.layers.mask&-3;let Ze=se.parent,Fe=$.cameras;Xe($,Ze);for(let je=0;je<Fe.length;je++)Xe(Fe[je],Ze);Fe.length===2?ge($,N,V):$.projectionMatrix.copy(N.projectionMatrix),R===null&&se.isPerspectiveCamera&&(R={camera:se,fov:se.fov,zoom:se.zoom}),Ve(se,$,Ze)};function Ve(se,he,ve){ve===null?se.matrix.copy(he.matrixWorld):(se.matrix.copy(ve.matrixWorld),se.matrix.invert(),se.matrix.multiply(he.matrixWorld)),se.matrix.decompose(se.position,se.quaternion,se.scale),se.updateMatrixWorld(!0),se.projectionMatrix.copy(he.projectionMatrix),se.projectionMatrixInverse.copy(he.projectionMatrixInverse),se.isPerspectiveCamera&&(se.fov=ja*2*Math.atan(1/se.projectionMatrix.elements[5]),se.zoom=1)}this.getCamera=function(){return $},this.getFoveation=function(){if(!(u===null&&g===null))return c},this.setFoveation=function(se){c=se,u!==null&&(u.fixedFoveation=se),g!==null&&g.fixedFoveation!==void 0&&(g.fixedFoveation=se)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh($)},this.getCameraTexture=function(se){return f[se]};let vt=null;function ut(se,he){if(d=he.getViewerPose(l||a),v=he,d!==null){let ve=d.views;g!==null&&(e.setRenderTargetFramebuffer(w,g.framebuffer),e.setRenderTarget(w));let Ze=!1;ve.length!==$.cameras.length&&($.cameras.length=0,Ze=!0);for(let it=0;it<ve.length;it++){let ft=ve[it],st=null;if(g!==null)st=g.getViewport(ft);else{let Nt=p.getViewSubImage(u,ft);st=Nt.viewport,it===0&&(e.setRenderTargetTextures(w,Nt.colorTexture,Nt.depthStencilTexture),e.setRenderTarget(w))}let at=G[it];at===void 0&&(at=new yn,at.layers.enable(it),at.viewport=new Gt,G[it]=at),at.matrix.fromArray(ft.transform.matrix),at.matrix.decompose(at.position,at.quaternion,at.scale),at.projectionMatrix.fromArray(ft.projectionMatrix),at.projectionMatrixInverse.copy(at.projectionMatrix).invert(),at.viewport.set(st.x,st.y,st.width,st.height),it===0&&($.matrix.copy(at.matrix),$.matrix.decompose($.position,$.quaternion,$.scale)),Ze===!0&&$.cameras.push(at)}let Fe=s.enabledFeatures;if(Fe&&Fe.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&b){p=n.getBinding();let it=p.getDepthInformation(ve[0]);it&&it.isValid&&it.texture&&m.init(it,s.renderState)}if(Fe&&Fe.includes("camera-access")&&b){e.state.unbindTexture(),p=n.getBinding();for(let it=0;it<ve.length;it++){let ft=ve[it].camera;if(ft){let st=f[ft];st||(st=new Lr,f[ft]=st);let at=p.getCameraImage(ft);st.sourceTexture=at}}}}for(let ve=0;ve<C.length;ve++){let Ze=E[ve],Fe=C[ve];Ze!==null&&Fe!==void 0&&Fe.update(Ze,he,l||a)}vt&&vt(se,he),he.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:he}),v=null}let ot=new cd;ot.setAnimationLoop(ut),this.setAnimationLoop=function(se){vt=se},this.dispose=function(){}}},v_=new Dt,md=new tt;md.set(-1,0,0,0,1,0,0,0,1);function y_(i,e){function t(m,f){m.matrixAutoUpdate===!0&&m.updateMatrix(),f.value.copy(m.matrix)}function n(m,f){f.color.getRGB(m.fogColor.value,Nc(i)),f.isFog?(m.fogNear.value=f.near,m.fogFar.value=f.far):f.isFogExp2&&(m.fogDensity.value=f.density)}function s(m,f,T,L,w){f.isNodeMaterial?f.uniformsNeedUpdate=!1:f.isMeshBasicMaterial?r(m,f):f.isMeshLambertMaterial?(r(m,f),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)):f.isMeshToonMaterial?(r(m,f),p(m,f)):f.isMeshPhongMaterial?(r(m,f),d(m,f),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)):f.isMeshStandardMaterial?(r(m,f),u(m,f),f.isMeshPhysicalMaterial&&g(m,f,w)):f.isMeshMatcapMaterial?(r(m,f),v(m,f)):f.isMeshDepthMaterial?r(m,f):f.isMeshDistanceMaterial?(r(m,f),b(m,f)):f.isMeshNormalMaterial?r(m,f):f.isLineBasicMaterial?(a(m,f),f.isLineDashedMaterial&&o(m,f)):f.isPointsMaterial?c(m,f,T,L):f.isSpriteMaterial?l(m,f):f.isShadowMaterial?(m.color.value.copy(f.color),m.opacity.value=f.opacity):f.isShaderMaterial&&(f.uniformsNeedUpdate=!1)}function r(m,f){m.opacity.value=f.opacity,f.color&&m.diffuse.value.copy(f.color),f.emissive&&m.emissive.value.copy(f.emissive).multiplyScalar(f.emissiveIntensity),f.map&&(m.map.value=f.map,t(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.bumpMap&&(m.bumpMap.value=f.bumpMap,t(f.bumpMap,m.bumpMapTransform),m.bumpScale.value=f.bumpScale,f.side===un&&(m.bumpScale.value*=-1)),f.normalMap&&(m.normalMap.value=f.normalMap,t(f.normalMap,m.normalMapTransform),m.normalScale.value.copy(f.normalScale),f.side===un&&m.normalScale.value.negate()),f.displacementMap&&(m.displacementMap.value=f.displacementMap,t(f.displacementMap,m.displacementMapTransform),m.displacementScale.value=f.displacementScale,m.displacementBias.value=f.displacementBias),f.emissiveMap&&(m.emissiveMap.value=f.emissiveMap,t(f.emissiveMap,m.emissiveMapTransform)),f.specularMap&&(m.specularMap.value=f.specularMap,t(f.specularMap,m.specularMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest);let T=e.get(f),L=T.envMap,w=T.envMapRotation;L&&(m.envMap.value=L,m.envMapRotation.value.setFromMatrix4(v_.makeRotationFromEuler(w)).transpose(),L.isCubeTexture&&L.isRenderTargetTexture===!1&&m.envMapRotation.value.premultiply(md),m.reflectivity.value=f.reflectivity,m.ior.value=f.ior,m.refractionRatio.value=f.refractionRatio),f.lightMap&&(m.lightMap.value=f.lightMap,m.lightMapIntensity.value=f.lightMapIntensity,t(f.lightMap,m.lightMapTransform)),f.aoMap&&(m.aoMap.value=f.aoMap,m.aoMapIntensity.value=f.aoMapIntensity,t(f.aoMap,m.aoMapTransform))}function a(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,f.map&&(m.map.value=f.map,t(f.map,m.mapTransform))}function o(m,f){m.dashSize.value=f.dashSize,m.totalSize.value=f.dashSize+f.gapSize,m.scale.value=f.scale}function c(m,f,T,L){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.size.value=f.size*T,m.scale.value=L*.5,f.map&&(m.map.value=f.map,t(f.map,m.uvTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function l(m,f){m.diffuse.value.copy(f.color),m.opacity.value=f.opacity,m.rotation.value=f.rotation,f.map&&(m.map.value=f.map,t(f.map,m.mapTransform)),f.alphaMap&&(m.alphaMap.value=f.alphaMap,t(f.alphaMap,m.alphaMapTransform)),f.alphaTest>0&&(m.alphaTest.value=f.alphaTest)}function d(m,f){m.specular.value.copy(f.specular),m.shininess.value=Math.max(f.shininess,1e-4)}function p(m,f){f.gradientMap&&(m.gradientMap.value=f.gradientMap)}function u(m,f){m.metalness.value=f.metalness,f.metalnessMap&&(m.metalnessMap.value=f.metalnessMap,t(f.metalnessMap,m.metalnessMapTransform)),m.roughness.value=f.roughness,f.roughnessMap&&(m.roughnessMap.value=f.roughnessMap,t(f.roughnessMap,m.roughnessMapTransform)),f.envMap&&(m.envMapIntensity.value=f.envMapIntensity)}function g(m,f,T){m.ior.value=f.ior,f.sheen>0&&(m.sheenColor.value.copy(f.sheenColor).multiplyScalar(f.sheen),m.sheenRoughness.value=f.sheenRoughness,f.sheenColorMap&&(m.sheenColorMap.value=f.sheenColorMap,t(f.sheenColorMap,m.sheenColorMapTransform)),f.sheenRoughnessMap&&(m.sheenRoughnessMap.value=f.sheenRoughnessMap,t(f.sheenRoughnessMap,m.sheenRoughnessMapTransform))),f.clearcoat>0&&(m.clearcoat.value=f.clearcoat,m.clearcoatRoughness.value=f.clearcoatRoughness,f.clearcoatMap&&(m.clearcoatMap.value=f.clearcoatMap,t(f.clearcoatMap,m.clearcoatMapTransform)),f.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=f.clearcoatRoughnessMap,t(f.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),f.clearcoatNormalMap&&(m.clearcoatNormalMap.value=f.clearcoatNormalMap,t(f.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(f.clearcoatNormalScale),f.side===un&&m.clearcoatNormalScale.value.negate())),f.dispersion>0&&(m.dispersion.value=f.dispersion),f.retroreflectivity>0&&(m.retroreflectivity.value=f.retroreflectivity),f.iridescence>0&&(m.iridescence.value=f.iridescence,m.iridescenceIOR.value=f.iridescenceIOR,m.iridescenceThicknessMinimum.value=f.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=f.iridescenceThicknessRange[1],f.iridescenceMap&&(m.iridescenceMap.value=f.iridescenceMap,t(f.iridescenceMap,m.iridescenceMapTransform)),f.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=f.iridescenceThicknessMap,t(f.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),f.transmission>0&&(m.transmission.value=f.transmission,m.transmissionSamplerMap.value=T.texture,m.transmissionSamplerSize.value.set(T.width,T.height),f.transmissionMap&&(m.transmissionMap.value=f.transmissionMap,t(f.transmissionMap,m.transmissionMapTransform)),m.thickness.value=f.thickness,f.thicknessMap&&(m.thicknessMap.value=f.thicknessMap,t(f.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=f.attenuationDistance,m.attenuationColor.value.copy(f.attenuationColor)),f.anisotropy>0&&(m.anisotropyVector.value.set(f.anisotropy*Math.cos(f.anisotropyRotation),f.anisotropy*Math.sin(f.anisotropyRotation)),f.anisotropyMap&&(m.anisotropyMap.value=f.anisotropyMap,t(f.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=f.specularIntensity,m.specularColor.value.copy(f.specularColor),f.specularColorMap&&(m.specularColorMap.value=f.specularColorMap,t(f.specularColorMap,m.specularColorMapTransform)),f.specularIntensityMap&&(m.specularIntensityMap.value=f.specularIntensityMap,t(f.specularIntensityMap,m.specularIntensityMapTransform))}function v(m,f){f.matcap&&(m.matcap.value=f.matcap)}function b(m,f){let T=e.get(f).light;m.referencePosition.value.setFromMatrixPosition(T.matrixWorld),m.nearDistance.value=T.shadow.camera.near,m.farDistance.value=T.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function M_(i,e,t,n){let s={},r={},a=[],o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function c(w,C){let E=C.program;n.uniformBlockBinding(w,E)}function l(w,C){let E=s[w.id];E===void 0&&(m(w),E=d(w),s[w.id]=E,w.addEventListener("dispose",T));let D=C.program;n.updateUBOMapping(w,D);let _=e.render.frame;r[w.id]!==_&&(u(w),r[w.id]=_)}function d(w){let C=p();w.__bindingPointIndex=C;let E=i.createBuffer(),D=w.__size,_=w.usage;return i.bindBuffer(i.UNIFORM_BUFFER,E),i.bufferData(i.UNIFORM_BUFFER,D,_),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,C,E),E}function p(){for(let w=0;w<o;w++)if(a.indexOf(w)===-1)return a.push(w),w;return Je("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(w){let C=s[w.id],E=w.uniforms,D=w.__cache;i.bindBuffer(i.UNIFORM_BUFFER,C);for(let _=0,R=E.length;_<R;_++){let N=E[_];if(Array.isArray(N))for(let V=0,G=N.length;V<G;V++)g(N[V],_,V,D);else g(N,_,0,D)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function g(w,C,E,D){if(b(w,C,E,D)===!0){let _=w.__offset,R=w.value;if(Array.isArray(R)){let N=0;for(let V=0;V<R.length;V++){let G=R[V],$=f(G);v(G,w.__data,N),typeof G!="number"&&typeof G!="boolean"&&!G.isMatrix3&&!ArrayBuffer.isView(G)&&(N+=$.storage/Float32Array.BYTES_PER_ELEMENT)}}else v(R,w.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,_,w.__data)}}function v(w,C,E){typeof w=="number"||typeof w=="boolean"?C[0]=w:w.isMatrix3?(C[0]=w.elements[0],C[1]=w.elements[1],C[2]=w.elements[2],C[3]=0,C[4]=w.elements[3],C[5]=w.elements[4],C[6]=w.elements[5],C[7]=0,C[8]=w.elements[6],C[9]=w.elements[7],C[10]=w.elements[8],C[11]=0):ArrayBuffer.isView(w)?C.set(new w.constructor(w.buffer,w.byteOffset,C.length)):w.toArray(C,E)}function b(w,C,E,D){let _=w.value,R=C+"_"+E;if(D[R]===void 0)return typeof _=="number"||typeof _=="boolean"?D[R]=_:ArrayBuffer.isView(_)?D[R]=_.slice():D[R]=_.clone(),!0;{let N=D[R];if(typeof _=="number"||typeof _=="boolean"){if(N!==_)return D[R]=_,!0}else{if(ArrayBuffer.isView(_))return!0;if(N.equals(_)===!1)return N.copy(_),!0}}return!1}function m(w){let C=w.uniforms,E=0,D=16;for(let R=0,N=C.length;R<N;R++){let V=Array.isArray(C[R])?C[R]:[C[R]];for(let G=0,$=V.length;G<$;G++){let z=V[G],K=Array.isArray(z.value)?z.value:[z.value];for(let ie=0,te=K.length;ie<te;ie++){let X=K[ie],ee=f(X),ce=E%D,ge=ce%ee.boundary,Xe=ce+ge;E+=ge,Xe!==0&&D-Xe<ee.storage&&(E+=D-Xe),z.__data=new Float32Array(ee.storage/Float32Array.BYTES_PER_ELEMENT),z.__offset=E,E+=ee.storage}}}let _=E%D;return _>0&&(E+=D-_),w.__size=E,w.__cache={},this}function f(w){let C={boundary:0,storage:0};return typeof w=="number"||typeof w=="boolean"?(C.boundary=4,C.storage=4):w.isVector2?(C.boundary=8,C.storage=8):w.isVector3||w.isColor?(C.boundary=16,C.storage=12):w.isVector4?(C.boundary=16,C.storage=16):w.isMatrix3?(C.boundary=48,C.storage=48):w.isMatrix4?(C.boundary=64,C.storage=64):w.isTexture?$e("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(w)?(C.boundary=16,C.storage=w.byteLength):$e("WebGLRenderer: Unsupported uniform value type.",w),C}function T(w){let C=w.target;C.removeEventListener("dispose",T);let E=a.indexOf(C.__bindingPointIndex);a.splice(E,1),i.deleteBuffer(s[C.id]),delete s[C.id],delete r[C.id]}function L(){for(let w in s)i.deleteBuffer(s[w]);a=[],s={},r={}}return{bind:c,update:l,dispose:L}}var S_=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),pi=null;function b_(){return pi===null&&(pi=new io(S_,16,16,ts,ri),pi.name="DFG_LUT",pi.minFilter=_n,pi.magFilter=_n,pi.wrapS=ci,pi.wrapT=ci,pi.generateMipmaps=!1,pi.needsUpdate=!0),pi}var xl=class{constructor(e={}){let{canvas:t=Du(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:c=!0,preserveDrawingBuffer:l=!1,powerPreference:d="default",failIfMajorPerformanceCaveat:p=!1,reversedDepthBuffer:u=!1,outputBufferType:g=In}=e;this.isWebGLRenderer=!0;let v;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");v=n.getContextAttributes().alpha}else v=a;let b=g,m=new Set([No,Do,Lo]),f=new Set([In,ii,tr,nr,Po,Io]),T=new Uint32Array(4),L=new Int32Array(4),w=new B,C=null,E=null,D=[],_=[],R=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=ni,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let N=this,V=!1,G=null,$=null,z=null,K=null;this._outputColorSpace=ln;let ie=0,te=0,X=null,ee=-1,ce=null,ge=new Gt,Xe=new Gt,Ve=null,vt=new Ye(0),ut=0,ot=t.width,se=t.height,he=1,ve=null,Ze=null,Fe=new Gt(0,0,ot,se),je=new Gt(0,0,ot,se),qe=!1,it=new $s,ft=!1,st=!1,at=new Dt,Nt=new B,qt=new Gt,dn={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Lt=!1;function zt(){return X===null?he:1}let U=n;function Yt(S,F){return t.getContext(S,F)}let dt,I,x,H,q,ne,xe,Se,re,le,Ee,Oe,be,we,Ge,We,Qe,k,ye,ae,Ce,Le,me;try{let S={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:c,preserveDrawingBuffer:l,powerPreference:d,failIfMajorPerformanceCaveat:p};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"186"}`),t.addEventListener("webglcontextlost",Rt,!1),t.addEventListener("webglcontextrestored",Mt,!1),t.addEventListener("webglcontextcreationerror",fn,!1),U===null){let F="webgl2";if(U=Yt(F,S),U===null)throw Yt(F)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}He()}catch(S){throw t.removeEventListener("webglcontextlost",Rt,!1),t.removeEventListener("webglcontextrestored",Mt,!1),t.removeEventListener("webglcontextcreationerror",fn,!1),Je("WebGLRenderer: "+S.message),S}function He(){dt=new Pg(U),dt.init(),Ce=new g_(U,dt),I=new yg(U,dt,e,Ce),x=new p_(U,dt),I.reversedDepthBuffer&&u&&x.buffers.depth.setReversed(!0),$=U.createFramebuffer(),z=U.createFramebuffer(),K=U.createFramebuffer(),H=new Dg(U),q=new e_,ne=new m_(U,dt,x,q,I,Ce,H),xe=new Rg(N),Se=new Uf(U),Le=new xg(U,Se),re=new Ig(U,Se,H,Le),le=new Ug(U,re,Se,Le,H),k=new Ng(U,I,ne),Ge=new Mg(q),Ee=new Q0(N,xe,dt,I,Le,Ge),Oe=new y_(N,q),be=new n_,we=new l_(dt),Qe=new _g(N,xe,x,le,v,c),We=new f_(N,le,I),me=new M_(U,H,I,x),ye=new vg(U,dt,H),ae=new Lg(U,dt,H),H.programs=Ee.programs,N.capabilities=I,N.extensions=dt,N.properties=q,N.renderLists=be,N.shadowMap=We,N.state=x,N.info=H}b!==In&&(R=new Og(b,t.width,t.height,o,s,r));let ke=new ih(N,U);this.xr=ke,this.getContext=function(){return U},this.getContextAttributes=function(){return U.getContextAttributes()},this.forceContextLoss=function(){let S=dt.get("WEBGL_lose_context");S&&S.loseContext()},this.forceContextRestore=function(){let S=dt.get("WEBGL_lose_context");S&&S.restoreContext()},this.getPixelRatio=function(){return he},this.setPixelRatio=function(S){S!==void 0&&(he=S,this.setSize(ot,se,!1))},this.getSize=function(S){return S.set(ot,se)},this.setSize=function(S,F,j=!0){if(ke.isPresenting){$e("WebGLRenderer: Can't change size while VR device is presenting.");return}ot=S,se=F,t.width=Math.floor(S*he),t.height=Math.floor(F*he),j===!0&&(t.style.width=S+"px",t.style.height=F+"px"),R!==null&&R.setSize(t.width,t.height),this.setViewport(0,0,S,F)},this.getDrawingBufferSize=function(S){return S.set(ot*he,se*he).floor()},this.setDrawingBufferSize=function(S,F,j){ot=S,se=F,he=j,t.width=Math.floor(S*j),t.height=Math.floor(F*j),this.setViewport(0,0,S,F)},this.setEffects=function(S){if(b===In){Je("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(S){for(let F=0;F<S.length;F++)if(S[F].isOutputPass===!0){$e("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}R.setEffects(S||[])},this.getCurrentViewport=function(S){return S.copy(ge)},this.getViewport=function(S){return S.copy(Fe)},this.setViewport=function(S,F,j,Y){S.isVector4?Fe.set(S.x,S.y,S.z,S.w):Fe.set(S,F,j,Y),x.viewport(ge.copy(Fe).multiplyScalar(he).round())},this.getScissor=function(S){return S.copy(je)},this.setScissor=function(S,F,j,Y){S.isVector4?je.set(S.x,S.y,S.z,S.w):je.set(S,F,j,Y),x.scissor(Xe.copy(je).multiplyScalar(he).round())},this.getScissorTest=function(){return qe},this.setScissorTest=function(S){x.setScissorTest(qe=S)},this.setOpaqueSort=function(S){ve=S},this.setTransparentSort=function(S){Ze=S},this.getClearColor=function(S){return S.copy(Qe.getClearColor())},this.setClearColor=function(){Qe.setClearColor(...arguments)},this.getClearAlpha=function(){return Qe.getClearAlpha()},this.setClearAlpha=function(){Qe.setClearAlpha(...arguments)},this.clear=function(S=!0,F=!0,j=!0){let Y=0;if(S){let W=!1;if(X!==null){let Pe=X.texture.format;W=m.has(Pe)}if(W){let Pe=X.texture.type,Ue=f.has(Pe),Re=Qe.getClearColor(),J=Qe.getClearAlpha(),ze=Re.r,et=Re.g,lt=Re.b;Ue?(T[0]=ze,T[1]=et,T[2]=lt,T[3]=J,U.clearBufferuiv(U.COLOR,0,T)):(L[0]=ze,L[1]=et,L[2]=lt,L[3]=J,U.clearBufferiv(U.COLOR,0,L))}else Y|=U.COLOR_BUFFER_BIT}F&&(Y|=U.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),j&&(Y|=U.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),Y!==0&&U.clear(Y)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(S){S.setRenderer(this),G=S},this.dispose=function(){t.removeEventListener("webglcontextlost",Rt,!1),t.removeEventListener("webglcontextrestored",Mt,!1),t.removeEventListener("webglcontextcreationerror",fn,!1),Qe.dispose(),be.dispose(),we.dispose(),q.dispose(),xe.dispose(),le.dispose(),Le.dispose(),me.dispose(),Ee.dispose(),ke.dispose(),ke.removeEventListener("sessionstart",or),ke.removeEventListener("sessionend",ra),gi.stop()};function Rt(S){S.preventDefault(),Tr("WebGLRenderer: Context Lost."),V=!0}function Mt(){Tr("WebGLRenderer: Context Restored."),V=!1;let S=H.autoReset,F=We.enabled,j=We.autoUpdate,Y=We.needsUpdate,W=We.type;He(),H.autoReset=S,We.enabled=F,We.autoUpdate=j,We.needsUpdate=Y,We.type=W}function fn(S){Je("WebGLRenderer: A WebGL context could not be created. Reason: ",S.statusMessage)}function En(S){let F=S.target;F.removeEventListener("dispose",En),ys(F)}function ys(S){na(S),q.remove(S)}function na(S){let F=q.get(S).programs;F!==void 0&&(F.forEach(function(j){Ee.releaseProgram(j)}),S.isShaderMaterial&&Ee.releaseShaderCache(S))}this.renderBufferDirect=function(S,F,j,Y,W,Pe){F===null&&(F=dn);let Ue=W.isMesh&&W.matrixWorld.determinantAffine()<0,Re=la(S,F,j,Y,W);x.setMaterial(Y,Ue);let J=j.index,ze=1;if(Y.wireframe===!0){if(J=re.getWireframeAttribute(j),J===void 0)return;ze=2}let et=j.drawRange,lt=j.attributes.position,Be=et.start*ze,ct=(et.start+et.count)*ze;Pe!==null&&(Be=Math.max(Be,Pe.start*ze),ct=Math.min(ct,(Pe.start+Pe.count)*ze)),J!==null?(Be=Math.max(Be,0),ct=Math.min(ct,J.count)):lt!=null&&(Be=Math.max(Be,0),ct=Math.min(ct,lt.count));let Ut=ct-Be;if(Ut<0||Ut===1/0)return;Le.setup(W,Y,Re,j,J);let Pt,yt=ye;if(J!==null&&(Pt=Se.get(J),yt=ae,yt.setIndex(Pt)),W.isMesh)Y.wireframe===!0?(x.setLineWidth(Y.wireframeLinewidth*zt()),yt.setMode(U.LINES)):yt.setMode(U.TRIANGLES);else if(W.isLine){let jt=Y.linewidth;jt===void 0&&(jt=1),x.setLineWidth(jt*zt()),W.isLineSegments?yt.setMode(U.LINES):W.isLineLoop?yt.setMode(U.LINE_LOOP):yt.setMode(U.LINE_STRIP)}else W.isPoints?yt.setMode(U.POINTS):W.isSprite&&yt.setMode(U.TRIANGLES);if(W.isBatchedMesh)if(dt.get("WEBGL_multi_draw"))yt.renderMultiDraw(W._multiDrawStarts,W._multiDrawCounts,W._multiDrawCount);else{let jt=W._multiDrawStarts,Ne=W._multiDrawCounts,Qt=W._multiDrawCount,pt=J?Se.get(J).bytesPerElement:1,pn=q.get(Y).currentProgram.getUniforms();for(let Dn=0;Dn<Qt;Dn++)pn.setValue(U,"_gl_DrawID",Dn),yt.render(jt[Dn]/pt,Ne[Dn])}else if(W.isInstancedMesh)yt.renderInstances(Be,Ut,W.count);else if(j.isInstancedBufferGeometry){let jt=j._maxInstanceCount!==void 0?j._maxInstanceCount:1/0,Ne=Math.min(j.instanceCount,jt);yt.renderInstances(Be,Ut,Ne)}else yt.render(Be,Ut)};function ia(S,F,j,Y){G!==null&&S.isNodeMaterial&&G.setObject(Y,S),ft===!0&&Ge.setState(S,j,!1),S.transparent===!0&&S.side===Vn&&S.forceSinglePass===!1?(S.side=un,S.needsUpdate=!0,Ln(S,F,Y),S.side=Ji,S.needsUpdate=!0,Ln(S,F,Y),S.side=Vn):Ln(S,F,Y)}this.compile=function(S,F,j=null){j===null&&(j=S),G!==null&&G.renderStart(S,F,j),E=we.get(j),E.init(F),_.push(E),j.traverseVisible(function(W){W.isLight&&W.layers.test(F.layers)&&(E.pushLight(W),W.castShadow&&E.pushShadow(W))}),S!==j&&S.traverseVisible(function(W){W.isLight&&W.layers.test(F.layers)&&(E.pushLight(W),W.castShadow&&E.pushShadow(W))}),E.setupLights(),G!==null&&G.updateLights(E.state.lightsArray),st=this.localClippingEnabled,ft=Ge.init(this.clippingPlanes,st),ft===!0&&Ge.setGlobalState(this.clippingPlanes,F),G!==null&&We.render(E.state.shadowsArray,j,F);let Y=new Set;return S.traverse(function(W){if(!(W.isMesh||W.isPoints||W.isLine||W.isSprite))return;let Pe=W.material;if(Pe)if(Array.isArray(Pe))for(let Ue=0;Ue<Pe.length;Ue++){let Re=Pe[Ue];ia(Re,j,F,W),Y.add(Re)}else ia(Pe,j,F,W),Y.add(Pe)}),E=_.pop(),G!==null&&G.renderEnd(),Y},this.compileAsync=function(S,F,j=null){let Y=this.compile(S,F,j);return new Promise(W=>{function Pe(){if(Y.forEach(function(Ue){let J=q.get(Ue).currentProgram;(J===void 0||J.isReady())&&Y.delete(Ue)}),Y.size===0){W(S);return}setTimeout(Pe,10)}dt.get("KHR_parallel_shader_compile")!==null?Pe():setTimeout(Pe,10)})};let De=null;function sa(S){De&&De(S)}function or(){gi.stop()}function ra(){gi.start()}let gi=new cd;gi.setAnimationLoop(sa),typeof self<"u"&&gi.setContext(self),this.setAnimationLoop=function(S){De=S,ke.setAnimationLoop(S),S===null?gi.stop():gi.start()},ke.addEventListener("sessionstart",or),ke.addEventListener("sessionend",ra),this.render=function(S,F){if(F!==void 0&&F.isCamera!==!0){Je("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(V===!0)return;G!==null&&G.renderStart(S,F);let j=ke.enabled===!0&&ke.isPresenting===!0,Y=R!==null&&(X===null||j)&&R.begin(N,X);if(S.matrixWorldAutoUpdate===!0&&S.updateMatrixWorld(),F.parent===null&&F.matrixWorldAutoUpdate===!0&&F.updateMatrixWorld(),ke.enabled===!0&&ke.isPresenting===!0&&(R===null||R.isCompositing()===!1)&&(ke.cameraAutoUpdate===!0&&ke.updateCamera(F),F=ke.getCamera()),S.isScene===!0&&S.onBeforeRender(N,S,F,X),E=we.get(S,_.length),E.init(F),E.state.textureUnits=ne.getTextureUnits(),_.push(E),at.multiplyMatrices(F.projectionMatrix,F.matrixWorldInverse),it.setFromProjectionMatrix(at,jn,F.reversedDepth),st=this.localClippingEnabled,ft=Ge.init(this.clippingPlanes,st),C=be.get(S,D.length),C.init(),D.push(C),ke.enabled===!0&&ke.isPresenting===!0){let Ue=N.xr.getDepthSensingMesh();Ue!==null&&lr(Ue,F,-1/0,N.sortObjects)}lr(S,F,0,N.sortObjects),C.finish(),G!==null&&G.updateLights(E.state.lightsArray),N.sortObjects===!0&&C.sort(ve,Ze),Lt=ke.enabled===!1||ke.isPresenting===!1||ke.hasDepthSensing()===!1,Lt&&Qe.addToRenderList(C,S),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),ft===!0&&Ge.beginShadows();let W=E.state.shadowsArray;if(We.render(W,S,F),ft===!0&&Ge.endShadows(),(Y&&R.hasRenderPass())===!1){let Ue=C.opaque,Re=C.transmissive;if(E.setupLights(),F.isArrayCamera){let J=F.cameras;if(Re.length>0)for(let ze=0,et=J.length;ze<et;ze++){let lt=J[ze];cr(Ue,Re,S,lt)}Lt&&Qe.render(S);for(let ze=0,et=J.length;ze<et;ze++){let lt=J[ze];fe(C,S,lt,lt.viewport)}}else Re.length>0&&cr(Ue,Re,S,F),Lt&&Qe.render(S),fe(C,S,F)}X!==null&&te===0&&(ne.updateMultisampleRenderTarget(X),ne.updateRenderTargetMipmap(X)),Y&&R.end(N),S.isScene===!0&&S.onAfterRender(N,S,F),Le.resetDefaultState(),ee=-1,ce=null,_.pop(),_.length>0?(E=_[_.length-1],ne.setTextureUnits(E.state.textureUnits),ft===!0&&Ge.setGlobalState(N.clippingPlanes,E.state.camera)):E=null,D.pop(),D.length>0?C=D[D.length-1]:C=null,G!==null&&G.renderEnd()};function lr(S,F,j,Y){if(S.visible===!1)return;if(S.layers.test(F.layers)){if(S.isGroup)j=S.renderOrder;else if(S.isLOD)S.autoUpdate===!0&&S.update(F);else if(S.isLightProbeGrid)E.pushLightProbeGrid(S);else if(S.isLight)E.pushLight(S),S.castShadow&&E.pushShadow(S);else if(S.isSprite){if(!S.frustumCulled||S.intersectsFrustum(it)){Y&&qt.setFromMatrixPosition(S.matrixWorld).applyMatrix4(at);let Ue=le.update(S),Re=S.material;Re.visible&&C.push(S,Ue,Re,j,qt.z,null,F)}}else if((S.isMesh||S.isLine||S.isPoints)&&(!S.frustumCulled||S.intersectsFrustum(it))){let Ue=le.update(S),Re=S.material;if(Y&&(S.boundingSphere!==void 0?(S.boundingSphere===null&&S.computeBoundingSphere(),qt.copy(S.boundingSphere.center)):(Ue.boundingSphere===null&&Ue.computeBoundingSphere(),qt.copy(Ue.boundingSphere.center)),qt.applyMatrix4(S.matrixWorld).applyMatrix4(at)),Array.isArray(Re)){let J=Ue.groups;for(let ze=0,et=J.length;ze<et;ze++){let lt=J[ze],Be=Re[lt.materialIndex];Be&&Be.visible&&C.push(S,Ue,Be,j,qt.z,lt,F)}}else Re.visible&&C.push(S,Ue,Re,j,qt.z,null,F)}}let Pe=S.children;for(let Ue=0,Re=Pe.length;Ue<Re;Ue++)lr(Pe[Ue],F,j,Y)}function fe(S,F,j,Y){let{opaque:W,transmissive:Pe,transparent:Ue}=S;E.setupLightsView(j),ft===!0&&Ge.setGlobalState(N.clippingPlanes,j),Y&&x.viewport(ge.copy(Y)),W.length>0&&Li(W,F,j),Pe.length>0&&Li(Pe,F,j),Ue.length>0&&Li(Ue,F,j),x.buffers.depth.setTest(!0),x.buffers.depth.setMask(!0),x.buffers.color.setMask(!0),x.setPolygonOffset(!1)}function cr(S,F,j,Y){if((j.isScene===!0?j.overrideMaterial:null)!==null)return;if(E.state.transmissionRenderTarget[Y.id]===void 0){let Be=dt.has("EXT_color_buffer_half_float")||dt.has("EXT_color_buffer_float");E.state.transmissionRenderTarget[Y.id]=new Pn(1,1,{generateMipmaps:!0,type:Be?ri:In,minFilter:Qi,samples:Math.max(4,I.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:gt.workingColorSpace})}let Pe=E.state.transmissionRenderTarget[Y.id],Ue=Y.viewport||ge;Pe.setSize(Ue.z*N.transmissionResolutionScale,Ue.w*N.transmissionResolutionScale);let Re=N.getRenderTarget(),J=N.getActiveCubeFace(),ze=N.getActiveMipmapLevel();N.setRenderTarget(Pe),N.getClearColor(vt),ut=N.getClearAlpha(),ut<1&&N.setClearColor(16777215,.5),N.clear(),Lt&&Qe.render(j);let et=N.toneMapping;N.toneMapping=ni;let lt=Y.viewport;if(Y.viewport!==void 0&&(Y.viewport=void 0),E.setupLightsView(Y),ft===!0&&Ge.setGlobalState(N.clippingPlanes,Y),Li(S,j,Y),ne.updateMultisampleRenderTarget(Pe),ne.updateRenderTargetMipmap(Pe),dt.has("WEBGL_multisampled_render_to_texture")===!1){let Be=!1;for(let ct=0,Ut=F.length;ct<Ut;ct++){let Pt=F[ct],{object:yt,geometry:jt,material:Ne,group:Qt}=Pt;if(Ne.side===Vn&&yt.layers.test(Y.layers)){let pt=Ne.side;Ne.side=un,Ne.needsUpdate=!0,aa(yt,j,Y,jt,Ne,Qt),Ne.side=pt,Ne.needsUpdate=!0,Be=!0}}Be===!0&&(ne.updateMultisampleRenderTarget(Pe),ne.updateRenderTargetMipmap(Pe))}N.setRenderTarget(Re,J,ze),N.setClearColor(vt,ut),lt!==void 0&&(Y.viewport=lt),N.toneMapping=et}function Li(S,F,j){let Y=F.isScene===!0?F.overrideMaterial:null;for(let W=0,Pe=S.length;W<Pe;W++){let Ue=S[W],{object:Re,geometry:J,group:ze}=Ue,et=Ue.material;et.allowOverride===!0&&Y!==null&&(et=Y),Re.layers.test(j.layers)&&aa(Re,F,j,J,et,ze)}}function aa(S,F,j,Y,W,Pe){G!==null&&W.isNodeMaterial&&G.setObject(S,W),S.onBeforeRender(N,F,j,Y,W,Pe),S.modelViewMatrix.multiplyMatrices(j.matrixWorldInverse,S.matrixWorld),S.normalMatrix.getNormalMatrix(S.modelViewMatrix),W.onBeforeRender(N,F,j,Y,S,Pe),W.transparent===!0&&W.side===Vn&&W.forceSinglePass===!1?(W.side=un,W.needsUpdate=!0,N.renderBufferDirect(j,F,Y,W,S,Pe),W.side=Ji,W.needsUpdate=!0,N.renderBufferDirect(j,F,Y,W,S,Pe),W.side=Vn):N.renderBufferDirect(j,F,Y,W,S,Pe),S.onAfterRender(N,F,j,Y,W,Pe)}function Ln(S,F,j){F.isScene!==!0&&(F=dn);let Y=q.get(S),W=E.state.lights,Pe=E.state.shadowsArray,Ue=W.state.version,Re=Ee.getParameters(S,W.state,Pe,F,j,E.state.lightProbeGridArray),J=Ee.getProgramCacheKey(Re),ze=Y.programs;Y.environment=S.isMeshStandardMaterial||S.isMeshLambertMaterial||S.isMeshPhongMaterial?F.environment:null,Y.fog=F.fog;let et=S.isMeshStandardMaterial||S.isMeshLambertMaterial&&!S.envMap||S.isMeshPhongMaterial&&!S.envMap;Y.envMap=xe.get(S.envMap||Y.environment,et),Y.envMapRotation=Y.environment!==null&&S.envMap===null?F.environmentRotation:S.envMapRotation,ze===void 0&&(S.addEventListener("dispose",En),ze=new Map,Y.programs=ze);let lt=ze.get(J);if(lt!==void 0){if(Y.currentProgram===lt&&Y.lightsStateVersion===Ue)return oa(S,Re),lt}else Re.uniforms=Ee.getUniforms(S),G!==null&&S.isNodeMaterial&&G.build(S,j,Re),S.onBeforeCompile(Re,N),lt=Ee.acquireProgram(Re,J),ze.set(J,lt),Y.uniforms=Re.uniforms;let Be=Y.uniforms;return(!S.isShaderMaterial&&!S.isRawShaderMaterial||S.clipping===!0)&&(Be.clippingPlanes=Ge.uniform),oa(S,Re),Y.needsLights=_i(S),Y.lightsStateVersion=Ue,Y.needsLights&&(Be.ambientLightColor.value=W.state.ambient,Be.lightProbe.value=W.state.probe,Be.sunLights.value=W.state.sun,Be.sunLightShadows.value=W.state.sunShadow,Be.directionalLights.value=W.state.directional,Be.directionalLightShadows.value=W.state.directionalShadow,Be.spotLights.value=W.state.spot,Be.spotLightShadows.value=W.state.spotShadow,Be.rectAreaLights.value=W.state.rectArea,Be.ltc_1.value=W.state.rectAreaLTC1,Be.ltc_2.value=W.state.rectAreaLTC2,Be.pointLights.value=W.state.point,Be.pointLightShadows.value=W.state.pointShadow,Be.hemisphereLights.value=W.state.hemi,Be.sunShadowMatrix.value=W.state.sunShadowMatrix,Be.sunShadowCascade.value=W.state.sunShadowCascade,Be.directionalShadowMatrix.value=W.state.directionalShadowMatrix,Be.spotLightMatrix.value=W.state.spotLightMatrix,Be.spotLightMap.value=W.state.spotLightMap,Be.pointShadowMatrix.value=W.state.pointShadowMatrix),Y.lightProbeGrid=E.state.lightProbeGridArray.length>0,Y.currentProgram=lt,Y.uniformsList=null,lt}function hr(S){if(S.uniformsList===null){let F=S.currentProgram.getUniforms();S.uniformsList=rr.seqWithValue(F.seq,S.uniforms)}return S.uniformsList}function oa(S,F){let j=q.get(S);j.outputColorSpace=F.outputColorSpace,j.batching=F.batching,j.batchingColor=F.batchingColor,j.instancing=F.instancing,j.instancingColor=F.instancingColor,j.instancingMorph=F.instancingMorph,j.skinning=F.skinning,j.morphTargets=F.morphTargets,j.morphNormals=F.morphNormals,j.morphColors=F.morphColors,j.morphTargetsCount=F.morphTargetsCount,j.numClippingPlanes=F.numClippingPlanes,j.numIntersection=F.numClipIntersection,j.vertexAlphas=F.vertexAlphas,j.vertexTangents=F.vertexTangents,j.toneMapping=F.toneMapping}function Ml(S,F){if(S.length===0)return null;if(S.length===1)return S[0].texture!==null?S[0]:null;w.setFromMatrixPosition(F.matrixWorld);for(let j=0,Y=S.length;j<Y;j++){let W=S[j];if(W.texture!==null&&W.boundingBox.containsPoint(w))return W}return null}function la(S,F,j,Y,W){F.isScene!==!0&&(F=dn),ne.resetTextureUnits();let Pe=F.fog,Ue=Y.isMeshStandardMaterial||Y.isMeshLambertMaterial||Y.isMeshPhongMaterial?F.environment:null,Re=X===null?N.outputColorSpace:X.isXRRenderTarget===!0?X.texture.colorSpace:gt.workingColorSpace,J=Y.isMeshStandardMaterial||Y.isMeshLambertMaterial&&!Y.envMap||Y.isMeshPhongMaterial&&!Y.envMap,ze=xe.get(Y.envMap||Ue,J),et=Y.vertexColors===!0&&!!j.attributes.color&&j.attributes.color.itemSize===4,lt=!!j.attributes.tangent&&(!!Y.normalMap||Y.anisotropy>0),Be=!!j.morphAttributes.position,ct=!!j.morphAttributes.normal,Ut=!!j.morphAttributes.color,Pt=ni;Y.toneMapped&&(X===null||X.isXRRenderTarget===!0)&&(Pt=N.toneMapping);let yt=j.morphAttributes.position||j.morphAttributes.normal||j.morphAttributes.color,jt=yt!==void 0?yt.length:0,Ne=q.get(Y),Qt=E.state.lights;if(ft===!0&&(st===!0||S!==ce)){let Et=S===ce&&Y.id===ee;Ge.setState(Y,S,Et)}let pt=!1;Y.version===Ne.__version?(Ne.needsLights&&Ne.lightsStateVersion!==Qt.state.version||Ne.outputColorSpace!==Re||W.isBatchedMesh&&Ne.batching===!1||!W.isBatchedMesh&&Ne.batching===!0||W.isBatchedMesh&&Ne.batchingColor===!0&&W._colorsTexture===null||W.isBatchedMesh&&Ne.batchingColor===!1&&W._colorsTexture!==null||W.isInstancedMesh&&Ne.instancing===!1||!W.isInstancedMesh&&Ne.instancing===!0||W.isSkinnedMesh&&Ne.skinning===!1||!W.isSkinnedMesh&&Ne.skinning===!0||W.isInstancedMesh&&Ne.instancingColor===!0&&W.instanceColor===null||W.isInstancedMesh&&Ne.instancingColor===!1&&W.instanceColor!==null||W.isInstancedMesh&&Ne.instancingMorph===!0&&W.morphTexture===null||W.isInstancedMesh&&Ne.instancingMorph===!1&&W.morphTexture!==null||Ne.envMap!==ze||Y.fog===!0&&Ne.fog!==Pe||Ne.numClippingPlanes!==void 0&&(Ne.numClippingPlanes!==Ge.numPlanes||Ne.numIntersection!==Ge.numIntersection)||Ne.vertexAlphas!==et||Ne.vertexTangents!==lt||Ne.morphTargets!==Be||Ne.morphNormals!==ct||Ne.morphColors!==Ut||Ne.toneMapping!==Pt||Ne.morphTargetsCount!==jt||!!Ne.lightProbeGrid!=E.state.lightProbeGridArray.length>0)&&(pt=!0):(pt=!0,Ne.__version=Y.version);let pn=Ne.currentProgram;pt===!0&&(pn=Ln(Y,F,W),G&&Y.isNodeMaterial&&G.onUpdateProgram(Y,pn,Ne));let Dn=!1,pe=!1,xi=!1,St=pn.getUniforms(),kt=Ne.uniforms;if(x.useProgram(pn.program)&&(Dn=!0,pe=!0,xi=!0),Y.id!==ee&&(ee=Y.id,pe=!0),Ne.needsLights){let Et=Ml(E.state.lightProbeGridArray,W);Ne.lightProbeGrid!==Et&&(Ne.lightProbeGrid=Et,pe=!0)}if(Dn||ce!==S){x.buffers.depth.getReversed()&&S.reversedDepth!==!0&&(S._reversedDepth=!0,S.updateProjectionMatrix()),St.setValue(U,"projectionMatrix",S.projectionMatrix),St.setValue(U,"viewMatrix",S.matrixWorldInverse);let Cn=St.map.cameraPosition;Cn!==void 0&&Cn.setValue(U,Nt.setFromMatrixPosition(S.matrixWorld)),I.logarithmicDepthBuffer&&St.setValue(U,"logDepthBufFC",2/(Math.log(S.far+1)/Math.LN2)),(Y.isMeshPhongMaterial||Y.isMeshToonMaterial||Y.isMeshLambertMaterial||Y.isMeshBasicMaterial||Y.isMeshStandardMaterial||Y.isShaderMaterial)&&St.setValue(U,"isOrthographic",S.isOrthographicCamera===!0),ce!==S&&(ce=S,pe=!0,xi=!0)}if(Ne.needsLights&&(Qt.state.sunShadowMap.length>0&&St.setValue(U,"sunShadowMap",Qt.state.sunShadowMap,ne),Qt.state.directionalShadowMap.length>0&&St.setValue(U,"directionalShadowMap",Qt.state.directionalShadowMap,ne),Qt.state.spotShadowMap.length>0&&St.setValue(U,"spotShadowMap",Qt.state.spotShadowMap,ne),Qt.state.pointShadowMap.length>0&&St.setValue(U,"pointShadowMap",Qt.state.pointShadowMap,ne)),W.isSkinnedMesh){St.setOptional(U,W,"bindMatrix"),St.setOptional(U,W,"bindMatrixInverse");let Et=W.skeleton;Et&&(Et.boneTexture===null&&Et.computeBoneTexture(),St.setValue(U,"boneTexture",Et.boneTexture,ne))}W.isBatchedMesh&&(St.setOptional(U,W,"batchingTexture"),St.setValue(U,"batchingTexture",W._matricesTexture,ne),St.setOptional(U,W,"batchingIdTexture"),St.setValue(U,"batchingIdTexture",W._indirectTexture,ne),St.setOptional(U,W,"batchingColorTexture"),W._colorsTexture!==null&&St.setValue(U,"batchingColorTexture",W._colorsTexture,ne));let mn=j.morphAttributes;if((mn.position!==void 0||mn.normal!==void 0||mn.color!==void 0)&&k.update(W,j,pn),(pe||Ne.receiveShadow!==W.receiveShadow)&&(Ne.receiveShadow=W.receiveShadow,St.setValue(U,"receiveShadow",W.receiveShadow)),(Y.isMeshStandardMaterial||Y.isMeshLambertMaterial||Y.isMeshPhongMaterial)&&Y.envMap===null&&F.environment!==null&&(kt.envMapIntensity.value=F.environmentIntensity),kt.dfgLUT!==void 0&&(kt.dfgLUT.value=b_()),pe){if(St.setValue(U,"toneMappingExposure",N.toneMappingExposure),Ne.needsLights&&Ms(kt,xi),Pe&&Y.fog===!0&&Oe.refreshFogUniforms(kt,Pe),Oe.refreshMaterialUniforms(kt,Y,he,se,E.state.transmissionRenderTarget[S.id]),Ne.needsLights&&Ne.lightProbeGrid){let Et=Ne.lightProbeGrid;kt.probesSH.value=Et.texture,kt.probesMin.value.copy(Et.boundingBox.min),kt.probesMax.value.copy(Et.boundingBox.max),kt.probesResolution.value.copy(Et.resolution)}rr.upload(U,hr(Ne),kt,ne)}if(Y.isShaderMaterial&&Y.uniformsNeedUpdate===!0&&(rr.upload(U,hr(Ne),kt,ne),Y.uniformsNeedUpdate=!1),Y.isSpriteMaterial&&St.setValue(U,"center",W.center),St.setValue(U,"modelViewMatrix",W.modelViewMatrix),St.setValue(U,"normalMatrix",W.normalMatrix),St.setValue(U,"modelMatrix",W.matrixWorld),Y.uniformsGroups!==void 0){let Et=Y.uniformsGroups;for(let Cn=0,Di=Et.length;Cn<Di;Cn++){let ca=Et[Cn];me.update(ca,pn),me.bind(ca,pn)}}return pn}function Ms(S,F){S.ambientLightColor.needsUpdate=F,S.lightProbe.needsUpdate=F,S.sunLights.needsUpdate=F,S.sunLightShadows.needsUpdate=F,S.directionalLights.needsUpdate=F,S.directionalLightShadows.needsUpdate=F,S.pointLights.needsUpdate=F,S.pointLightShadows.needsUpdate=F,S.spotLights.needsUpdate=F,S.spotLightShadows.needsUpdate=F,S.rectAreaLights.needsUpdate=F,S.hemisphereLights.needsUpdate=F}function _i(S){return S.isMeshLambertMaterial||S.isMeshToonMaterial||S.isMeshPhongMaterial||S.isMeshStandardMaterial||S.isShadowMaterial||S.isShaderMaterial&&S.lights===!0}this.getActiveCubeFace=function(){return ie},this.getActiveMipmapLevel=function(){return te},this.getRenderTarget=function(){return X},this.setRenderTargetTextures=function(S,F,j){let Y=q.get(S);Y.__autoAllocateDepthBuffer=S.resolveDepthBuffer===!1,Y.__autoAllocateDepthBuffer===!1&&(Y.__useRenderToTexture=!1),q.get(S.texture).__webglTexture=F,q.get(S.depthTexture).__webglTexture=Y.__autoAllocateDepthBuffer?void 0:j,Y.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(S,F){let j=q.get(S);j.__webglFramebuffer=F,j.__useDefaultFramebuffer=F===void 0},this.setRenderTarget=function(S,F=0,j=0){X=S,ie=F,te=j;let Y=null,W=!1,Pe=!1;if(S){let Re=q.get(S);if(Re.__useDefaultFramebuffer!==void 0){x.bindFramebuffer(U.FRAMEBUFFER,Re.__webglFramebuffer),ge.copy(S.viewport),Xe.copy(S.scissor),Ve=S.scissorTest,x.viewport(ge),x.scissor(Xe),x.setScissorTest(Ve),ee=-1;return}else if(Re.__webglFramebuffer===void 0)ne.setupRenderTarget(S);else if(Re.__hasExternalTextures)ne.rebindTextures(S,q.get(S.texture).__webglTexture,q.get(S.depthTexture).__webglTexture);else if(S.depthBuffer){let et=S.depthTexture;if(Re.__boundDepthTexture!==et){if(et!==null&&q.has(et)&&(S.width!==et.image.width||S.height!==et.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");ne.setupDepthRenderbuffer(S)}}let J=S.texture;(J.isData3DTexture||J.isDataArrayTexture||J.isCompressedArrayTexture)&&(Pe=!0);let ze=q.get(S).__webglFramebuffer;S.isWebGLCubeRenderTarget?(Array.isArray(ze[F])?Y=ze[F][j]:Y=ze[F],W=!0):S.samples>0&&ne.useMultisampledRTT(S)===!1?Y=q.get(S).__webglMultisampledFramebuffer:Array.isArray(ze)?Y=ze[j]:Y=ze,ge.copy(S.viewport),Xe.copy(S.scissor),Ve=S.scissorTest}else ge.copy(Fe).multiplyScalar(he).floor(),Xe.copy(je).multiplyScalar(he).floor(),Ve=qe;if(j!==0&&(Y=$),x.bindFramebuffer(U.FRAMEBUFFER,Y)&&x.drawBuffers(S,Y),x.viewport(ge),x.scissor(Xe),x.setScissorTest(Ve),W){let Re=q.get(S.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_CUBE_MAP_POSITIVE_X+F,Re.__webglTexture,j)}else if(Pe){let Re=F;for(let J=0;J<S.textures.length;J++){let ze=q.get(S.textures[J]);U.framebufferTextureLayer(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0+J,ze.__webglTexture,j,Re)}}else if(S!==null&&j!==0){let Re=q.get(S.texture);U.framebufferTexture2D(U.FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,Re.__webglTexture,j)}ee=-1};function ns(S){let F=q.get(S);return(F.__readFormat!==S.format||F.__readType!==S.type)&&(F.__readFormat=S.format,F.__readType=S.type,F.__formatReadable=I.textureFormatReadable(S.format),F.__typeReadable=I.textureTypeReadable(S.type)),F}this.readRenderTargetPixels=function(S,F,j,Y,W,Pe,Ue,Re=0){if(!(S&&S.isWebGLRenderTarget)){Je("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let J=q.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&Ue!==void 0&&(J=J[Ue]),J){x.bindFramebuffer(U.FRAMEBUFFER,J);try{let ze=S.textures[Re],et=ze.format,lt=ze.type;S.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+Re);let Be=ns(ze);if(Be.__formatReadable===!1){Je("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(Be.__typeReadable===!1){Je("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}F>=0&&F<=S.width-Y&&j>=0&&j<=S.height-W&&U.readPixels(F,j,Y,W,Ce.convert(et),Ce.convert(lt),Pe)}finally{let ze=X!==null?q.get(X).__webglFramebuffer:null;x.bindFramebuffer(U.FRAMEBUFFER,ze)}}},this.readRenderTargetPixelsAsync=async function(S,F,j,Y,W,Pe,Ue,Re=0){if(!(S&&S.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let J=q.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&Ue!==void 0&&(J=J[Ue]),J)if(F>=0&&F<=S.width-Y&&j>=0&&j<=S.height-W){x.bindFramebuffer(U.FRAMEBUFFER,J);let ze=S.textures[Re],et=ze.format,lt=ze.type;S.textures.length>1&&U.readBuffer(U.COLOR_ATTACHMENT0+Re);let Be=ns(ze);if(Be.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(Be.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let ct=U.createBuffer();U.bindBuffer(U.PIXEL_PACK_BUFFER,ct),U.bufferData(U.PIXEL_PACK_BUFFER,Pe.byteLength,U.STREAM_READ),U.readPixels(F,j,Y,W,Ce.convert(et),Ce.convert(lt),0),U.bindBuffer(U.PIXEL_PACK_BUFFER,null);let Ut=X!==null?q.get(X).__webglFramebuffer:null;x.bindFramebuffer(U.FRAMEBUFFER,Ut);let Pt=U.fenceSync(U.SYNC_GPU_COMMANDS_COMPLETE,0);return U.flush(),await Uu(U,Pt,4),U.bindBuffer(U.PIXEL_PACK_BUFFER,ct),U.getBufferSubData(U.PIXEL_PACK_BUFFER,0,Pe),U.bindBuffer(U.PIXEL_PACK_BUFFER,null),U.deleteBuffer(ct),U.deleteSync(Pt),Pe}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(S,F=null,j=0){let Y=Math.pow(2,-j),W=Math.floor(S.image.width*Y),Pe=Math.floor(S.image.height*Y),Ue=F!==null?F.x:0,Re=F!==null?F.y:0;ne.setTexture2D(S,0),U.copyTexSubImage2D(U.TEXTURE_2D,j,0,0,Ue,Re,W,Pe),x.unbindTexture()},this.copyTextureToTexture=function(S,F,j=null,Y=null,W=0,Pe=0){let Ue,Re,J,ze,et,lt,Be,ct,Ut,Pt=S.isCompressedTexture?S.mipmaps[Pe]:S.image;if(j!==null)Ue=j.max.x-j.min.x,Re=j.max.y-j.min.y,J=j.isBox3?j.max.z-j.min.z:1,ze=j.min.x,et=j.min.y,lt=j.isBox3?j.min.z:0;else{let kt=Math.pow(2,-W);Ue=Math.floor(Pt.width*kt),Re=Math.floor(Pt.height*kt),S.isDataArrayTexture?J=Pt.depth:S.isData3DTexture?J=Math.floor(Pt.depth*kt):J=1,ze=0,et=0,lt=0}Y!==null?(Be=Y.x,ct=Y.y,Ut=Y.z):(Be=0,ct=0,Ut=0);let yt=Ce.convert(F.format),jt=Ce.convert(F.type),Ne;F.isData3DTexture?(ne.setTexture3D(F,0),Ne=U.TEXTURE_3D):F.isDataArrayTexture||F.isCompressedArrayTexture?(ne.setTexture2DArray(F,0),Ne=U.TEXTURE_2D_ARRAY):(ne.setTexture2D(F,0),Ne=U.TEXTURE_2D),x.activeTexture(U.TEXTURE0),x.pixelStorei(U.UNPACK_FLIP_Y_WEBGL,F.flipY),x.pixelStorei(U.UNPACK_PREMULTIPLY_ALPHA_WEBGL,F.premultiplyAlpha),x.pixelStorei(U.UNPACK_ALIGNMENT,F.unpackAlignment);let Qt=x.getParameter(U.UNPACK_ROW_LENGTH),pt=x.getParameter(U.UNPACK_IMAGE_HEIGHT),pn=x.getParameter(U.UNPACK_SKIP_PIXELS),Dn=x.getParameter(U.UNPACK_SKIP_ROWS),pe=x.getParameter(U.UNPACK_SKIP_IMAGES);x.pixelStorei(U.UNPACK_ROW_LENGTH,Pt.width),x.pixelStorei(U.UNPACK_IMAGE_HEIGHT,Pt.height),x.pixelStorei(U.UNPACK_SKIP_PIXELS,ze),x.pixelStorei(U.UNPACK_SKIP_ROWS,et),x.pixelStorei(U.UNPACK_SKIP_IMAGES,lt);let xi=S.isDataArrayTexture||S.isData3DTexture,St=F.isDataArrayTexture||F.isData3DTexture;if(S.isDepthTexture){let kt=q.get(S),mn=q.get(F),Et=q.get(kt.__renderTarget),Cn=q.get(mn.__renderTarget);x.bindFramebuffer(U.READ_FRAMEBUFFER,Et.__webglFramebuffer),x.bindFramebuffer(U.DRAW_FRAMEBUFFER,Cn.__webglFramebuffer);for(let Di=0;Di<J;Di++)xi&&(U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,q.get(S).__webglTexture,W,lt+Di),U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,q.get(F).__webglTexture,Pe,Ut+Di)),U.blitFramebuffer(ze,et,Ue,Re,Be,ct,Ue,Re,U.DEPTH_BUFFER_BIT,U.NEAREST);x.bindFramebuffer(U.READ_FRAMEBUFFER,null),x.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else if(W!==0||S.isRenderTargetTexture||q.has(S)){let kt=q.get(S),mn=q.get(F);x.bindFramebuffer(U.READ_FRAMEBUFFER,z),x.bindFramebuffer(U.DRAW_FRAMEBUFFER,K);for(let Et=0;Et<J;Et++)xi?U.framebufferTextureLayer(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,kt.__webglTexture,W,lt+Et):U.framebufferTexture2D(U.READ_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,kt.__webglTexture,W),St?U.framebufferTextureLayer(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,mn.__webglTexture,Pe,Ut+Et):U.framebufferTexture2D(U.DRAW_FRAMEBUFFER,U.COLOR_ATTACHMENT0,U.TEXTURE_2D,mn.__webglTexture,Pe),W!==0?U.blitFramebuffer(ze,et,Ue,Re,Be,ct,Ue,Re,U.COLOR_BUFFER_BIT,U.NEAREST):St?U.copyTexSubImage3D(Ne,Pe,Be,ct,Ut+Et,ze,et,Ue,Re):U.copyTexSubImage2D(Ne,Pe,Be,ct,ze,et,Ue,Re);x.bindFramebuffer(U.READ_FRAMEBUFFER,null),x.bindFramebuffer(U.DRAW_FRAMEBUFFER,null)}else St?S.isDataTexture||S.isData3DTexture?U.texSubImage3D(Ne,Pe,Be,ct,Ut,Ue,Re,J,yt,jt,Pt.data):F.isCompressedArrayTexture?U.compressedTexSubImage3D(Ne,Pe,Be,ct,Ut,Ue,Re,J,yt,Pt.data):U.texSubImage3D(Ne,Pe,Be,ct,Ut,Ue,Re,J,yt,jt,Pt):S.isDataTexture?U.texSubImage2D(U.TEXTURE_2D,Pe,Be,ct,Ue,Re,yt,jt,Pt.data):S.isCompressedTexture?U.compressedTexSubImage2D(U.TEXTURE_2D,Pe,Be,ct,Pt.width,Pt.height,yt,Pt.data):U.texSubImage2D(U.TEXTURE_2D,Pe,Be,ct,Ue,Re,yt,jt,Pt);x.pixelStorei(U.UNPACK_ROW_LENGTH,Qt),x.pixelStorei(U.UNPACK_IMAGE_HEIGHT,pt),x.pixelStorei(U.UNPACK_SKIP_PIXELS,pn),x.pixelStorei(U.UNPACK_SKIP_ROWS,Dn),x.pixelStorei(U.UNPACK_SKIP_IMAGES,pe),Pe===0&&F.generateMipmaps&&U.generateMipmap(Ne),x.unbindTexture()},this.initRenderTarget=function(S){q.get(S).__webglFramebuffer===void 0&&ne.setupRenderTarget(S)},this.initTexture=function(S){S.isCubeTexture?ne.setTextureCube(S,0):S.isData3DTexture?ne.setTexture3D(S,0):S.isDataArrayTexture||S.isCompressedArrayTexture?ne.setTexture2DArray(S,0):ne.setTexture2D(S,0),x.unbindTexture()},this.resetState=function(){ie=0,te=0,X=null,x.reset(),Le.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return jn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=gt._getDrawingBufferColorSpace(e),t.unpackColorSpace=gt._getUnpackColorSpace()}};var Xt='"Sora", "Manrope", system-ui, sans-serif',Kt='"Manrope", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',Bt="#F4F6FA",Jt="#A7B0C0",Sn="#5EEAD4",ea="#FBBF24",w_={listening:"Listening",thinking:"Thinking"},sh=1;async function T_(){if(typeof FontFace>"u"||!document.fonts)return;let i=[new FontFace("Sora","url(../fonts/sora.woff2)",{weight:"300 800"}),new FontFace("Manrope","url(../fonts/manrope.woff2)",{weight:"400 700"})],e=Promise.all(i.map(async t=>{await t.load(),document.fonts.add(t)}));await Promise.race([e,new Promise(t=>setTimeout(t,2500))]).catch(()=>{})}var xd=`
float hash3(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise3(vec3 x) {
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash3(i), hash3(i + vec3(1.0, 0.0, 0.0)), f.x), mix(hash3(i + vec3(0.0, 1.0, 0.0)), hash3(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
             mix(mix(hash3(i + vec3(0.0, 0.0, 1.0)), hash3(i + vec3(1.0, 0.0, 1.0)), f.x), mix(hash3(i + vec3(0.0, 1.0, 1.0)), hash3(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);
}`,A_=`
uniform float uTime; uniform float uEnergy;
varying vec3 vN; varying vec3 vV; varying vec3 vP;
${xd}
void main() {
  vec3 p = position;
  float d = noise3(p * 22.0 + vec3(0.0, uTime * 0.9, uTime * 0.6));
  p += normal * (d - 0.5) * (0.004 + uEnergy * 0.016);
  vP = p * 11.0;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`,E_=`
uniform float uTime; uniform float uEnergy; uniform float uThink;
uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform vec3 uGlow;
varying vec3 vN; varying vec3 vV; varying vec3 vP;
${xd}
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
}`;function rn(i,e,t=2400){let n=document.createElement("canvas");n.width=Math.max(8,Math.round(i*t)),n.height=Math.max(8,Math.round(e*t));let s=n.getContext("2d"),r=new fs(n);r.colorSpace=ln,r.anisotropy=sh;let a=new hn({map:r,transparent:!0,depthWrite:!1}),o=new bt(new Ri(i,e),a);return{canvas:n,ctx:s,tex:r,mesh:o,w:n.width,h:n.height,update(){r.needsUpdate=!0}}}function Gn(i,e,t,n,s,r){r=Math.min(r,n/2,s/2),i.beginPath(),i.moveTo(e+r,t),i.arcTo(e+n,t,e+n,t+s,r),i.arcTo(e+n,t+s,e,t+s,r),i.arcTo(e,t+s,e,t,r),i.arcTo(e,t,e+n,t,r),i.closePath()}function qn(i,e,t,n,s={}){i.clearRect(0,0,e,t);let r=3,a=r;Gn(i,a,a,e-a*2,t-a*2,n);let o=i.createLinearGradient(0,0,0,t);if(o.addColorStop(0,s.fill0||"rgba(24, 27, 36, 0.94)"),o.addColorStop(1,s.fill1||"rgba(13, 15, 21, 0.95)"),i.fillStyle=o,i.fill(),i.lineWidth=s.hot?r*1.6:r,i.strokeStyle=s.hot?"rgba(94, 234, 212, 0.9)":"rgba(255, 255, 255, 0.13)",i.stroke(),!s.hot){let c=i.createLinearGradient(a+n,0,e-a-n,0);c.addColorStop(0,"rgba(255,255,255,0)"),c.addColorStop(.5,"rgba(255,255,255,0.34)"),c.addColorStop(1,"rgba(255,255,255,0)"),i.fillStyle=c,i.fillRect(a+n,a-r/2,e-2*(a+n),r)}}function wt(i,e,t,n,s,r,a=500,o="left",c=Kt,l="0px"){i.font=`${a} ${s}px ${c}`,i.fillStyle=r,i.textAlign=o,i.textBaseline="alphabetic","letterSpacing"in i&&(i.letterSpacing=l),i.fillText(e,t,n),"letterSpacing"in i&&(i.letterSpacing="0px")}function Yn(i,e,t){if(e=String(e||""),i.measureText(e).width<=t)return e;for(;e&&i.measureText(e+"\u2026").width>t;)e=e.slice(0,-1);return e+"\u2026"}function gd(){let i=document.createElement("canvas");i.width=i.height=128;let e=i.getContext("2d"),t=e.createRadialGradient(64,64,0,64,64,64);t.addColorStop(0,"rgba(255,255,255,0.9)"),t.addColorStop(.35,"rgba(255,255,255,0.32)"),t.addColorStop(1,"rgba(255,255,255,0)"),e.fillStyle=t,e.fillRect(0,0,128,128);let n=new fs(i);return n.colorSpace=ln,n}var C_={mic(i){i.beginPath(),Gn(i,39,16,22,42,11),i.stroke(),i.beginPath(),i.arc(50,48,22,.12*Math.PI,.88*Math.PI),i.stroke(),i.beginPath(),i.moveTo(50,70),i.lineTo(50,84),i.stroke()},done(i){i.beginPath(),i.moveTo(27,52),i.lineTo(43,68),i.lineTo(74,35),i.stroke()},quiet(i){i.beginPath(),Gn(i,32,32,36,36,7),i.stroke()},end(i){i.beginPath(),i.moveTo(20,60),i.quadraticCurveTo(50,32,80,60),i.lineTo(72,69),i.lineTo(61,61),i.lineTo(61,53),i.quadraticCurveTo(50,48,39,53),i.lineTo(39,61),i.lineTo(28,69),i.closePath(),i.stroke()},eye(i){i.beginPath(),i.moveTo(14,50),i.quadraticCurveTo(50,16,86,50),i.quadraticCurveTo(50,84,14,50),i.stroke(),i.beginPath(),i.arc(50,50,11,0,Math.PI*2),i.stroke()},pc(i){i.beginPath(),Gn(i,16,22,68,44,6),i.stroke(),i.beginPath(),i.moveTo(36,82),i.lineTo(64,82),i.moveTo(50,66),i.lineTo(50,82),i.stroke()},pin(i){i.beginPath(),i.moveTo(50,86),i.lineTo(50,62),i.stroke(),i.beginPath(),i.moveTo(31,62),i.lineTo(69,62),i.lineTo(62,46),i.lineTo(62,20),i.lineTo(38,20),i.lineTo(38,46),i.closePath(),i.stroke()},leave(i){i.beginPath(),i.moveTo(32,32),i.lineTo(68,68),i.moveTo(68,32),i.lineTo(32,68),i.stroke()},think(i){for(let e=0;e<3;e++)i.beginPath(),i.arc(30+e*20,50,4.5,0,Math.PI*2),i.stroke()},photos(i){i.beginPath(),Gn(i,16,24,68,52,8),i.stroke(),i.beginPath(),i.moveTo(23,69),i.lineTo(42,49),i.lineTo(56,62),i.lineTo(65,54),i.lineTo(78,69),i.stroke(),i.beginPath(),i.arc(64,38,5,0,Math.PI*2),i.stroke()},style(i){let e=(t,n,s)=>{i.beginPath(),i.moveTo(t,n-s),i.quadraticCurveTo(t,n,t+s,n),i.quadraticCurveTo(t,n,t,n+s),i.quadraticCurveTo(t,n,t-s,n),i.quadraticCurveTo(t,n,t,n-s),i.stroke()};e(44,56,26),e(74,28,12)},folder(i){i.beginPath(),i.moveTo(14,30),i.lineTo(40,30),i.lineTo(48,38),i.lineTo(86,38),i.lineTo(86,78),i.lineTo(14,78),i.closePath(),i.stroke()},doc(i){i.beginPath(),i.moveTo(28,14),i.lineTo(60,14),i.lineTo(76,30),i.lineTo(76,86),i.lineTo(28,86),i.closePath(),i.stroke(),i.beginPath(),i.moveTo(38,50),i.lineTo(66,50),i.moveTo(38,62),i.lineTo(66,62),i.moveTo(38,74),i.lineTo(56,74),i.stroke()},close(i){i.beginPath(),i.moveTo(34,34),i.lineTo(66,66),i.moveTo(66,34),i.lineTo(34,66),i.stroke()},back(i){i.beginPath(),i.moveTo(58,30),i.lineTo(38,50),i.lineTo(58,70),i.stroke()},next(i){i.beginPath(),i.moveTo(42,30),i.lineTo(62,50),i.lineTo(42,70),i.stroke()},up(i){i.beginPath(),i.moveTo(30,56),i.lineTo(50,36),i.lineTo(70,56),i.moveTo(50,36),i.lineTo(50,74),i.stroke()},search(i){i.beginPath(),i.arc(44,44,20,0,Math.PI*2),i.stroke(),i.beginPath(),i.moveTo(59,59),i.lineTo(76,76),i.stroke()},pause(i){i.beginPath(),i.moveTo(40,32),i.lineTo(40,68),i.moveTo(60,32),i.lineTo(60,68),i.stroke()},holo(i){i.beginPath(),i.moveTo(50,22),i.lineTo(76,36),i.lineTo(76,64),i.lineTo(50,78),i.lineTo(24,64),i.lineTo(24,36),i.closePath(),i.stroke(),i.beginPath(),i.moveTo(24,36),i.lineTo(50,50),i.lineTo(76,36),i.moveTo(50,50),i.lineTo(50,78),i.stroke()}};function _d(i,e){let{ctx:t,w:n,h:s}=i;t.clearRect(0,0,n,s),t.beginPath(),t.arc(n/2,s/2,n/2-4,0,Math.PI*2),t.fillStyle="rgba(20, 23, 31, 0.95)",t.fill(),t.lineWidth=3,t.strokeStyle="rgba(255,255,255,0.18)",t.stroke(),ai(t,e,n/2,s/2,n*.62,Bt,7),i.update()}function ai(i,e,t,n,s,r=Bt,a=6){i.save();let o=s/100;i.translate(t-50*o,n-50*o),i.scale(o,o),i.strokeStyle=r,i.fillStyle=r,i.lineWidth=a,i.lineCap="round",i.lineJoin="round",C_[e]?.(i),i.restore()}async function Jy({mode:i,session:e,api:t,tint:n}){let s=i==="flat",r=i==="immersive-ar",a=t.util;await T_();let o=new xl({antialias:!0,alpha:!0,powerPreference:"high-performance"});o.setClearColor(0,0),o.outputColorSpace=ln,o.setPixelRatio(s?Math.min(2,window.devicePixelRatio||1):1),sh=Math.max(1,o.capabilities.getMaxAnisotropy?.()||1),o.setSize(window.innerWidth,window.innerHeight);let c=o.domElement;Object.assign(c.style,{position:"fixed",inset:"0",width:"100vw",height:"100vh",zIndex:"2147483000",touchAction:"none",display:s?"block":"none"}),document.body.appendChild(c);let l=new Er,d=new yn(70,window.innerWidth/window.innerHeight,.01,100);d.position.set(0,1.6,0),l.add(d);let p=[],u=h=>(p.push(h),h),g=[],v=0,b=(()=>{try{return matchMedia("(prefers-reduced-motion: reduce)").matches}catch{return!1}})(),m=h=>1-Math.pow(1-Math.min(1,Math.max(0,h)),4),f=!1,T={a:new Ye,b:new Ye,c:new Ye},L=0,w=8246268,C=!1;try{L=Math.max(0,ta.findIndex(h=>h.name===localStorage.getItem("izuki.vr.theme")))}catch{}function E(h){let y=ta[h];if(T.a.setRGB(...y.orb[0]),T.b.setRGB(...y.orb[1]),T.c.setRGB(...y.orb[2]),h===0&&n){let P=parseInt(n.slice(1),16),A=new Ye((P>>16&255)/255,(P>>8&255)/255,(P&255)/255);T.a.lerp(A,.6),T.b.lerp(A,.35),T.c.lerp(A,.45)}w=y.halo,le?.set(y);let M=!!y.light&&!!le;if(M!==C){C=M;for(let P of ut)P.draw()}}function D(){L=(L+1)%ta.length,E(L);try{localStorage.setItem("izuki.vr.theme",ta[L].name)}catch{}return"This is "+ta[L].name+(r?".":", with its own sky.")+" Say \u201Cchange your look\u201D again for the next one."}let _=new Wt;_.visible=!1,l.add(_);let R=u(new tn({uniforms:{uTime:{value:0},uEnergy:{value:0},uThink:{value:0},uA:{value:T.a},uB:{value:T.b},uC:{value:T.c},uGlow:{value:new Ye(.82,.95,1)}},vertexShader:A_,fragmentShader:E_,transparent:!0})),N=new bt(u(new ti(.085,64,48)),R);N.renderOrder=2;let V=u(new Gi({map:u(gd()),color:6220500,transparent:!0,blending:An,depthWrite:!1,opacity:.3})),G=new hs(V);G.scale.setScalar(.42),G.renderOrder=1;let $=u(new hn({color:6220500,transparent:!0,opacity:0,blending:An,depthWrite:!1})),z=new bt(u(new qi(.118,.003,8,120,Math.PI*1.4)),$),K=u(new hn({color:6220500,transparent:!0,opacity:0,blending:An,depthWrite:!1})),ie=new bt(u(new qi(.1,.0016,8,160)),K);ie.visible=!1,_.add(G,N,z,ie);let te=rn(.56,.19);te.mesh.position.set(0,-.2,.01),_.add(te.mesh),u(te.tex),u(te.mesh.material),u(te.mesh.geometry),g.push(te.mesh.material);let X={state:"",you:"",reply:"",stage:"",mic:0,energy:0,think:0,hovered:!1,hint:s?"Click the orb to talk. Drag to look around.":"Point at the orb and pull the trigger (or pinch) to talk."};function ee(){let{ctx:h,w:y,h:M}=te;qn(h,y,M,52);let P=56,A=30,O=w_[X.state]||X.stage||"";O?(h.beginPath(),h.arc(P+9,A+34,9,0,Math.PI*2),h.fillStyle=Sn,h.fill(),h.font=`600 30px ${Xt}`,wt(h,Yn(h,O,y-P*2-40),P+34,A+45,30,Sn,600,"left",Xt,"0.02em"),A+=62):A+=14,X.you&&(h.font=`500 34px ${Kt}`,wt(h,Yn(h,X.you,y-P*2),P,A+=40,34,Jt,500),A+=10);let Q=X.reply||(X.you?"":X.hint),Z=(de,_e)=>(h.font=`500 ${_e}px ${Kt}`,h.measureText(de).width),ue=X.notice?a.fitLines(X.notice,y-P*2,2,30,26,Z):null,oe=ue?ue.lines.length*ue.size*1.3+22:0;if(Q){let de=M-A-36-oe,_e=Math.max(1,Math.floor(de/(32*1.32))),Ae=a.fitLines(Q,y-P*2,Math.min(_e,5),50,32,Z),nt=Ae.size*1.32;A+=6;for(let Te of Ae.lines)wt(h,Te,P,A+=nt,Ae.size,X.reply?Bt:Jt,500)}if(Xe(X.notice||X.reply),ue){let de=M-32-(ue.lines.length-1)*ue.size*1.3;for(let _e of ue.lines)wt(h,_e,P,de,ue.size,X.noticeWarn?ea:Jt,500),de+=ue.size*1.3}te.update()}let ce=null,ge=!1,Xe=h=>{ge&&ce&&h&&ce.textContent!==h&&(ce.textContent=h)},Ve=0;function vt(h,y=12e3,M=!1){X.notice=String(h||""),X.noticeWarn=!!M,clearTimeout(Ve),Ve=setTimeout(()=>{X.notice="",ee()},y),ee()}let ut=[];function ot(h,y,M){let P=rn(.088,.112,2400);u(P.tex),u(P.mesh.material),u(P.mesh.geometry),g.push(P.mesh.material);let A={c:P,icon:h,label:y,hot:!1,on:!1,shown:!0};return A.draw=()=>{let{ctx:O,w:Q,h:Z}=P;O.clearRect(0,0,Q,Z);let ue=Q*.38,oe=Q/2,de=ue+10;O.beginPath(),O.arc(oe,de,ue,0,Math.PI*2);let _e=O.createLinearGradient(0,de-ue,0,de+ue);_e.addColorStop(0,A.hot?"rgba(44, 50, 64, 0.97)":"rgba(26, 29, 38, 0.95)"),_e.addColorStop(1,A.hot?"rgba(26, 30, 40, 0.97)":"rgba(14, 16, 22, 0.95)"),O.fillStyle=_e,O.fill(),O.lineWidth=A.hot||A.on?5:3,O.strokeStyle=A.on?Sn:A.hot?"rgba(255,255,255,0.55)":"rgba(255,255,255,0.16)",O.stroke(),ai(O,A.icon,oe,de,ue*1.05,A.on?Sn:Bt,6.5);let Ae=C?{on:"#0F766E",hot:"#11151C",rest:"#2A303B"}:{on:Sn,hot:Bt,rest:Jt};wt(O,A.label,oe,Z-12,30,A.on?Ae.on:A.hot?Ae.hot:Ae.rest,600,"center",Xt,"0.01em"),P.update()},A.set=(O,Q)=>{O===A.icon&&Q===A.label||(A.icon=O,A.label=Q,A.draw())},A.setOn=O=>{!!O!==A.on&&(A.on=!!O,A.draw())},A.draw(),ve(P.mesh,{tap:M,hover:O=>{A.hot=O,A.draw(),P.mesh.position.z=O?.026:.02}}),_.add(P.mesh),ut.push(A),A}function se(){let h=ut.filter(M=>M.shown),y=h.length>6?.088:.1;h.forEach((M,P)=>{M.c.mesh.visible=!0,M.c.mesh.position.set((P-(h.length-1)/2)*y,-.375,.02)});for(let M of ut)M.shown||(M.c.mesh.visible=!1)}let he=[];function ve(h,y){return h.userData.ui=y,he.push(h),h}function Ze(h){let y=he.indexOf(h);y>=0&&he.splice(y,1)}let Fe=h=>{for(let y=h;y;y=y.parent)if(!y.visible)return!1;return!0},je=new Vr;je.far=10;let qe=new B,it=new B,ft=new Wn,st=0,at=[],Nt=u(new ps(.006,20)),qt=u(new Ct().setAttribute("position",new rt([0,0,0,0,0,-1],3)));function dn(h,y){let M={kind:h,ctrl:y,source:null,hit:null,hover:null,press:null,origin:new B,dir:new B,buttons:[],scrollAt:0};return M.dot=new bt(Nt,u(new hn({color:16777215,transparent:!0,opacity:.9,depthTest:!1}))),M.dot.renderOrder=999,M.dot.visible=!1,l.add(M.dot),y&&(M.line=new Ei(qt,u(new ei({color:10482666,transparent:!0,opacity:.5}))),M.line.visible=!1,y.add(M.line)),at.push(M),M}let Lt=(h,y=.25,M=16)=>{try{h.source?.gamepad?.hapticActuators?.[0]?.pulse?.(y,M)}catch{}};function zt(h,y=!1){if(!h.hit)return;let M=h.hit.object.userData.ui,P=M.drag?M.drag():null;if(h.press={u:M,obj:h.hit.object,hit:h.hit,drag:P,grabOnly:y,dist:h.hit.distance,start:h.hit.point.clone(),offset:P?P.position.clone().sub(h.hit.point):null,moved:!1,t0:performance.now()},Lt(h,.35,20),!y)try{M.down?.(h)}catch(A){console.warn("vr down",A)}}let U=new B,Yt=new B,dt=new B;function I(h,y){let M=h.source?.hand?o.xr.getHand(h.index):null,P=M?.joints?.["index-finger-tip"],A=M?.joints?.["thumb-tip"];return P&&A?(P.getWorldPosition(y),A.getWorldPosition(Yt),y.add(Yt).multiplyScalar(.5)):h.ctrl.getWorldPosition(y)}function x(h){if(s||!h.source)return!1;I(h,U);let y=null,M=1/0;for(let A of he){let O=A.userData.ui;if(!(O.drag||O.grab)||!Fe(A))continue;let Q=A.geometry;Q.boundingBox||Q.computeBoundingBox(),A.updateWorldMatrix(!0,!1),dt.copy(U),A.worldToLocal(dt);let Z=Q.boundingBox,ue=A.getWorldScale(Yt),oe=(A===N?.07:.03)/Math.max(.001,ue.x),de=Math.max(Z.min.x-dt.x,0,dt.x-Z.max.x),_e=Math.max(Z.min.y-dt.y,0,dt.y-Z.max.y),Ae=Math.max(Z.min.z-dt.z,0,dt.z-Z.max.z);if(de>oe||_e>oe||Ae>oe+.05/Math.max(.001,ue.x))continue;let nt=Math.hypot(de,_e,Ae);nt<M&&(M=nt,y={m:A,u:O})}if(!y)return!1;let P=(y.u.drag||y.u.grab)();return P?(h.press={u:y.u,obj:y.m,hit:null,drag:P,direct:!0,grabOnly:!1,offset:P.position.clone().sub(U),start:U.clone(),moved:!1,t0:performance.now()},Lt(h,.5,28),!0):!1}function H(h,y=!0){let M=h.press;if(h.press=null,!!M){if(!M.grabOnly)try{M.u.up?.(performance.now()-M.t0,y&&!M.moved)}catch(P){console.warn("vr up",P)}if(M.moved){M.u.dropped?.();return}if(M.direct){if(!y)return;let P=null,A=M.obj.geometry?.parameters;if(A?.width&&A?.height){I(h,U);let O=M.obj.worldToLocal(U.clone());P={uv:{x:Math.max(0,Math.min(1,O.x/A.width+.5)),y:Math.max(0,Math.min(1,O.y/A.height+.5))},point:U.clone()}}try{M.u.tap?.(P,h)}catch(O){console.warn("vr tap",O)}return}if(!(M.grabOnly||!y)&&!(!h.hit||h.hit.object!==M.obj))try{M.u.tap?.(h.hit,h)}catch(P){console.warn("vr tap",P)}}}function q(h){h.lookAt(qe.x,h.position.y,qe.z)}let ne=[],xe=(h,y,M,P)=>{h.addEventListener(y,M,P),ne.push(()=>h.removeEventListener(y,M,P))},Se=null;if(!s){for(let h=0;h<2;h++){let y=o.xr.getController(h);l.add(y);let M=dn("xr",y);M.index=h,xe(y,"connected",P=>{M.source=P.data,M.line.visible=!0}),xe(y,"disconnected",()=>{M.source=null,M.line.visible=!1,M.dot.visible=!1,M.press=null}),xe(y,"selectstart",()=>{M.selected=!1,!x(M)&&(We(M),zt(M))}),xe(y,"select",()=>{M.selected=!0}),xe(y,"selectend",()=>{We(M),H(M,M.selected),M.selected=!1}),xe(y,"squeezestart",()=>{x(M)||(We(M),zt(M,!0))}),xe(y,"squeezeend",()=>H(M,!1))}for(let h=0;h<2;h++)l.add(o.xr.getHand(h));if(!r){let h=u(new ti(.006,8,6)),y=u(new hn({color:13496317,transparent:!0,opacity:.85}));Se={jointGeo:h,jointMat:y}}}let re=0;if(!s)try{o.xr.enabled=!0;let h=e.enabledFeatures,y=!h||h.includes("local-floor")?"local-floor":"local";y==="local"&&(re=-1.6),o.xr.setReferenceSpaceType(y);try{o.xr.setFramebufferScaleFactor(1.25)}catch{}await o.xr.setSession(e);try{o.xr.setFoveation(.2)}catch{}let M=[...e.inputSources||[]].filter(P=>!at.some(A=>A.source===P));if(M.length){let P=new Event("inputsourceschange");Object.assign(P,{session:e,added:M,removed:[]}),e.dispatchEvent(P)}}catch(h){for(let y of ne)try{y()}catch{}c.remove(),o.dispose();try{await e.end()}catch{}throw h}let le=r?null:R_(l,re);E(L);let Ee=new Ke,Oe=s?dn("mouse",null):null,be=null,we=-.2,Ge=0;if(s){Oe.source={};let h=y=>{Ee.set(y.clientX/window.innerWidth*2-1,-(y.clientY/window.innerHeight)*2+1)};xe(c,"pointermove",y=>{h(y),be&&(Ge-=(y.clientX-be.x)*.004,we-=(y.clientY-be.y)*.004,we=Math.max(-1.2,Math.min(1.2,we)),be={x:y.clientX,y:y.clientY})}),xe(c,"pointerdown",y=>{h(y),We(Oe),Oe.hit?zt(Oe):be={x:y.clientX,y:y.clientY},c.setPointerCapture?.(y.pointerId)}),xe(c,"pointerup",y=>{h(y),be=null,We(Oe),H(Oe)}),xe(c,"pointercancel",()=>{be=null,Oe.press=null}),xe(c,"wheel",y=>{let M=Oe.hit?.object.userData.ui;M?.scroll&&(y.preventDefault(),M.scroll(Math.sign(y.deltaY)*Math.min(5,Math.ceil(Math.abs(y.deltaY)/60))))},{passive:!1}),xe(window,"keydown",y=>{y.key==="Escape"?ur():y.key===" "&&y.target===document.body&&(y.preventDefault(),t.tapOrb())}),xe(window,"resize",()=>{d.aspect=window.innerWidth/window.innerHeight,d.updateProjectionMatrix(),o.setSize(window.innerWidth,window.innerHeight)})}function We(h){if(h.kind==="mouse")je.setFromCamera(Ee,d),h.origin.copy(je.ray.origin),h.dir.copy(je.ray.direction);else{if(!h.source)return!1;h.ctrl.getWorldPosition(h.origin),h.ctrl.getWorldQuaternion(ft),h.dir.set(0,0,-1).applyQuaternion(ft)}je.set(h.origin,h.dir);let y=je.intersectObjects(he,!1);return h.hit=y.find(M=>Fe(M.object))||null,!0}function Qe(h){h.holdAt=performance.now(),h.holdListening=X.state==="listening",h.holdListening||t.tapOrb()}function k(h,y){let M=h.holdListening;h.holdListening=!1,(M||y>600)&&t.tapOrb()}ve(N,{tap:()=>t.tapOrb(),drag:()=>_,dropped:()=>{_.userData.placed=!0},hover:h=>{X.hovered=h}}),ve(te.mesh,{drag:()=>_,dropped:()=>{_.userData.placed=!0}});let ye=ot("mic","Talk",null);Object.assign(ye.c.mesh.userData.ui,{tap:null,down:()=>Qe(ye),up:(h,y)=>{y&&k(ye,h)}});let ae=ot("pause","Pause",()=>t.hangUp()),Ce=ot("eye","Look",()=>{gi(),t.look()}),Le=()=>{fe.open?Ms():la().then(h=>{h&&t.speak(h)})},me=()=>{let h=t.lastReply();h?dh(h):t.speak("There's nothing to pin yet. Ask me something first.")},He=()=>{if(J.open)return Ne();if(!t.pc.current())return vt("Your photos are on your PC: pair this headset with it once (leave the room, Remote, Pair).",12e3,!0);jt("Pictures").then(h=>{h&&vt(h,12e3,!0)})},ke=()=>vt(D(),5e3),Rt=ot("photos","Photos",He),Mt=ot("pc","My PC",Le);ot("pin","Pin",me),ot("style","Style",ke),ot("leave","Leave",()=>ur()),ae.shown=!1,Ce.shown=!1,se();let fn=[];function En(h,y,M){let P=rn(.205,.054,2400);u(P.tex),u(P.mesh.material),u(P.mesh.geometry),f||g.push(P.mesh.material);let A={c:P,hot:!1};return A.draw=()=>{let{ctx:O,w:Q,h:Z}=P;qn(O,Q,Z,(Z-6)/2,{hot:A.hot}),ai(O,h,58,Z/2,50,Sn,7),O.font=`500 37px ${Kt}`,wt(O,Yn(O,y,Q-124),98,Z/2+13,37,Bt,500),P.update()},A.draw(),ve(P.mesh,{tap:()=>{na(),t.ask(M)},hover:O=>{A.hot=O,A.draw()}}),_.add(P.mesh),fn.push(A),A}let ys=!1;try{ys=localStorage.getItem("izuki.vr.tried")!=="1"}catch{}function na(){ys=!1;for(let h of fn)h.c.mesh.visible=!1;try{localStorage.setItem("izuki.vr.tried","1")}catch{}}function ia(){fn.forEach((h,y)=>{h.c.mesh.position.set((y-(fn.length-1)/2)*.218,.17,.01)}),Rl()}t.hasCamera().then(h=>{Ce.shown=!!h,se(),En(h?"eye":"mic",h?"\u201CWhat's this?\u201D":"\u201CWhat can you do?\u201D",h?"What's this?":"What can you do?"),En("photos","\u201CShow my photos\u201D","Show my photos"),En("style","\u201CChange your look\u201D","Change your look"),ia()});let De={group:new Wt,photo:null,text:rn(.5,.15),img:null,url:"",want:"",closed:"",seq:0,marks:[],say:"",t0:0,anim:!1,close:rn(.05,.05)};De.group.visible=!1,l.add(De.group),ve(De.text.mesh,{drag:()=>De.group}),u(De.text.tex),u(De.close.tex),De.group.add(De.text.mesh,De.close.mesh),_d(De.close,"close"),ve(De.close.mesh,{tap:()=>{De.seq++,De.closed=De.want,De.group.visible=!1}});function sa(){let{ctx:h,w:y,h:M}=De.text;qn(h,y,M,44);let P=(Q,Z)=>(h.font=`500 ${Z}px ${Kt}`,h.measureText(Q).width),A=a.fitLines(De.say,y-96,4,38,26,P),O=22;for(let Q of A.lines)wt(h,Q,48,O+=A.size*1.32,A.size,Bt,500);De.text.update(),Xe(De.say)}function or(h){let y=De.photo;if(!y||!De.img)return;let{ctx:M,w:P,h:A}=y;M.clearRect(0,0,P,A),M.save(),Gn(M,0,0,P,A,28),M.clip(),M.drawImage(De.img,0,0,P,A),M.restore();let O=De.marks.length,Q=P*(De.steps?.03:.065),Z=ue=>({x:ue.x/1e3*P,y:ue.y/1e3*A});De.marks.forEach((ue,oe)=>{let de=Math.max(0,Math.min(1,h*O-oe));if(de<=0)return;let{x:_e,y:Ae}=Z(ue);if(De.steps&&oe>0&&ra(M,Z(De.marks[oe-1]),{x:_e,y:Ae},Q,Math.min(1,de*2)),M.save(),M.shadowColor="rgba(0,0,0,0.55)",M.shadowBlur=10,M.shadowOffsetY=3,M.strokeStyle=Sn,M.lineWidth=6,M.lineCap="round",M.beginPath(),M.arc(_e,Ae,Q,-Math.PI/2,-Math.PI/2+Math.PI*2*de),M.stroke(),M.restore(),De.steps&&O>1&&de>.3){let nt=Math.min(P-26,Math.max(26,_e-Q*.75)),Te=Math.min(A-26,Math.max(26,Ae-Q*.75));M.save(),M.shadowColor="rgba(0,0,0,0.5)",M.shadowBlur=8,M.fillStyle=Sn,M.beginPath(),M.arc(nt,Te,22,0,Math.PI*2),M.fill(),M.restore(),M.font=`700 26px ${Kt}`;let mt=String(oe+1);wt(M,mt,nt-M.measureText(mt).width/2,Te+9,26,"#0b1016",700)}if(de>.85&&ue.label){M.font=`600 28px ${Kt}`;let nt=M.measureText(ue.label).width,Te=Math.min(P-nt-40,Math.max(10,_e-nt/2-16)),mt=Ae+Q+12>A-50?Ae-Q-56:Ae+Q+12;De.steps&&(Te=_e+Q+16+nt+32<=P-10?_e+Q+16:Math.max(10,_e-Q-16-nt-32),mt=Math.min(A-54,Math.max(10,Ae-22))),Gn(M,Te,mt,nt+32,44,22),M.fillStyle="rgba(14,16,22,0.88)",M.fill(),wt(M,ue.label,Te+16,mt+31,28,Bt,600)}}),y.update()}function ra(h,y,M,P,A){let O=M.x-y.x,Q=M.y-y.y,Z=Math.hypot(O,Q);if(Z<=2*P+12)return;let ue=O/Z,oe=Q/Z,de=y.x+ue*(P+6),_e=y.y+oe*(P+6),Ae=(Z-2*P-12)*A,nt=de+ue*Ae,Te=_e+oe*Ae;if(h.save(),h.shadowColor="rgba(0,0,0,0.5)",h.shadowBlur=8,h.strokeStyle=Sn,h.lineWidth=5,h.lineCap="round",h.setLineDash([16,12]),h.beginPath(),h.moveTo(de,_e),h.lineTo(nt,Te),h.stroke(),h.setLineDash([]),A>=1){let Tt=-oe,Ht=ue;h.fillStyle=Sn,h.beginPath(),h.moveTo(nt+ue*4,Te+oe*4),h.lineTo(nt-ue*18+Tt*18*.6,Te-oe*18+Ht*18*.6),h.lineTo(nt-ue*18-Tt*18*.6,Te-oe*18-Ht*18*.6),h.closePath(),h.fill()}h.restore()}function gi(){De.group.visible&&(De.say="Looking\u2026",sa())}async function lr({url:h,w:y,h:M,marks:P,say:A,picked:O,steps:Q}){if(O)De.closed="";else if(h===De.closed)return;let Z=++De.seq;if(De.want=h,h!==De.url){let ue=new Image;ue.src=h;try{await ue.decode()}catch{return}if(Z!==De.seq)return;De.img=ue,De.url=h;let oe=M/Math.max(1,y),de=Math.min(.42,.5*oe),_e=de/oe;De.photo&&(Ze(De.photo.mesh),De.group.remove(De.photo.mesh),De.photo.tex.dispose(),De.photo.mesh.geometry.dispose(),De.photo.mesh.material.dispose()),De.photo=rn(_e,de,2048),De.group.add(De.photo.mesh),ve(De.photo.mesh,{drag:()=>De.group}),De.photo.mesh.position.set(0,.1,0),De.text.mesh.position.set(0,.1-de/2-.09,0),De.close.mesh.position.set(_e/2-.01,.1+de/2-.01,.005)}if(De.marks=Array.isArray(P)?P:[],De.steps=!!Q,De.say=String(A||""),De.t0=performance.now(),De.anim=De.marks.length>0,!De.group.visible){let ue=st-.6,oe=.85;De.group.position.set(qe.x-Math.sin(ue)*oe,qe.y-.08,qe.z-Math.cos(ue)*oe),q(De.group)}De.group.visible=!0,or(De.anim?0:1),sa()}let fe={group:new Wt,open:!1,live:!1,gen:0,target:null,err:"",clicks:Promise.resolve(),doing:"",busy:!1,screen:null,bar:rn(1.6,.09),handle:rn(.32,.035),aspect:9/16};fe.group.visible=!1,l.add(fe.group),u(fe.bar.tex),u(fe.handle.tex);function cr(h,y){fe.screen&&(Ze(fe.screen.mesh),fe.group.remove(fe.screen.mesh),fe.screen.tex.dispose(),fe.screen.mesh.geometry.dispose(),fe.screen.mesh.material.dispose());let M=y/h,P=Math.min(1.6,1.1/M),A=rn(P,P*M,h/P);A.mesh.material.transparent=!1,A.mesh.material.depthWrite=!0,fe.screen=A,fe.aspect=M,fe.group.add(A.mesh);let O=P*M/2;return fe.bar.mesh.position.set(0,-O-.06,0),fe.handle.mesh.position.set(0,O+.04,0),ve(A.mesh,{tap:Q=>{if(!Q?.uv||!fe.live)return;let{nx:Z,ny:ue}=a.pcPoint(Q.uv.x,Q.uv.y),oe=fe.gen;F(Q.point);let de=()=>fe.open&&oe===fe.gen&&fe.live;fe.clicks=fe.clicks.then(async()=>{if(!de())return;let _e=await t.pc.send({op:"point",nx:Z,ny:ue},fe.target);if(_e?.ok===!1){oe===fe.gen&&(fe.err=_e.error||"",Ln());return}de()&&await t.pc.send({op:"click",button:"left"},fe.target)}).catch(()=>{})},scroll:Q=>{fe.live&&t.pc.send({op:"scroll",dy:Q},fe.target)}}),A}cr(1280,720),fe.group.add(fe.bar.mesh,fe.handle.mesh);{let{ctx:h,w:y,h:M}=fe.handle;h.clearRect(0,0,y,M),Gn(h,4,4,y-8,M-8,(M-8)/2),h.fillStyle="rgba(255,255,255,0.34)",h.fill(),fe.handle.update()}ve(fe.handle.mesh,{drag:()=>fe.group});function Li(h){fe.live=!1;let y=fe.screen,{ctx:M,w:P,h:A}=y;qn(M,P,A,24),M.font=`500 ${Math.round(A*.05)}px ${Kt}`;let O=a.wrapLines(h,P*.7,Q=>M.measureText(Q).width);O.forEach((Q,Z)=>wt(M,Q,P/2,A/2+(Z-(O.length-1)/2)*A*.075,Math.round(A*.05),Jt,500,"center")),y.update()}function aa(h){(Math.abs(h.height/h.width-fe.aspect)>.01||fe.screen.w!==h.width)&&cr(h.width,h.height);let y=fe.screen;y.ctx.drawImage(h,0,0,y.w,y.h),y.update(),fe.live=!0}function Ln(){let{ctx:h,w:y,h:M}=fe.bar;qn(h,y,M,48),h.beginPath(),h.arc(72,M/2,13,0,Math.PI*2),h.fillStyle=fe.err?ea:Sn,h.fill();let P=fe.err||(fe.doing?"Izuki: "+fe.doing:(fe.target?.name||t.pc.name())+" \xB7 point and click, thumbstick to scroll");h.font=`500 60px ${Kt}`,wt(h,Yn(h,P,y-800),116,M/2+21,60,fe.err?ea:Bt,500);let A=(O,Q,Z)=>{Gn(h,O,30,280,M-60,(M-60)/2),h.fillStyle=Z?"rgba(220, 38, 38, 0.82)":"rgba(255, 255, 255, 0.07)",h.fill(),Z||(h.lineWidth=3,h.strokeStyle="rgba(255,255,255,0.16)",h.stroke()),wt(h,Q,O+140,M/2+19,52,Bt,600,"center",Xt,"0.02em")};fe.busy&&A(y-620,"Stop",!0),A(y-310,"Close",!1),fe.bar.update()}ve(fe.bar.mesh,{tap:h=>{let y=(h?.uv?.x??0)*fe.bar.w;if(y>fe.bar.w-320)Ms();else if(fe.busy&&y>fe.bar.w-630){let M=fe.gen;t.pc.send({op:"stop"},fe.target).then(P=>{!fe.open||M!==fe.gen||(P?.ok===!1?fe.err=P.error||"Your PC didn't confirm it stopped.":(fe.busy=!1,fe.err=""),Ln())})}},drag:()=>fe.group});let hr=h=>new Promise(y=>setTimeout(y,h));async function oa(h){for(;fe.open&&h===fe.gen;){let y=performance.now(),M=await t.pc.shot(1280,fe.target);if(!fe.open||h!==fe.gen)break;if(M.blob){let P=()=>fe.open&&h===fe.gen,A=null;try{A=await createImageBitmap(M.blob),P()&&(aa(A),fe.err&&(fe.err="",Ln()))}catch{P()&&(fe.err="A picture from your PC didn't come through.",Li(fe.err),Ln())}finally{A?.close?.()}}else fe.err=M.error||"Your PC didn't answer.",Li(fe.err),Ln();await hr(M.blob?Math.max(120,320-(performance.now()-y)):3e3)}}async function Ml(h){for(;fe.open&&h===fe.gen;){let y=await t.pc.status(fe.target);if(!fe.open||h!==fe.gen)break;y.error||(fe.doing=y.doing,fe.busy=y.busy,Ln()),await hr(3e3)}}async function la(){if(!t.pc.current())return"This headset isn't paired with your PC yet. Leave VR, open Remote in Izuki and pair your PC once.";let h=1.55;fe.group.position.set(qe.x-Math.sin(st)*h,qe.y-.02,qe.z-Math.cos(st)*h),q(fe.group),fe.group.visible=!0,fe.open=!0,fe.err="",fe.target=t.pc.current(),_i("pc");let y=++fe.gen;return Li("Connecting to "+(fe.target?.name||t.pc.name())+"\u2026"),Ln(),oa(y),Ml(y),""}function Ms(){fe.open=!1,fe.gen++,fe.group.visible=!1,_.userData.placed==="pc"&&(J?.open?_.userData.placed="files":pe?.open?_.userData.placed="web":Me?.open?_.userData.placed="holo":bs())}function _i(h){if(_.userData.placed!==!0){if(!_.userData.placed){let y=st+.7;Un={x:qe.x-Math.sin(y)*.7,y:qe.y-.17,z:qe.z-Math.cos(y)*.7}}_.userData.placed=h}}let ns=[],S=u(new ms(.012,.018,32));function F(h){let y=new bt(S,new hn({color:6220500,transparent:!0,opacity:.9,depthTest:!1}));y.position.copy(h),y.lookAt(qe),y.renderOrder=998,l.add(y),ns.push({m:y,t0:performance.now()})}let j=1,Y=.74,W=4,Pe=3,Ue=W*Pe,Re=.12,J={group:new Wt,card:rn(j,Y),handle:rn(.3,.035),open:!1,gen:0,path:"",up:"",items:[],page:0,title:"",err:"",loading:!1,thumbs:new Map,pending:new Set,btns:[]};J.group.visible=!1,l.add(J.group),J.group.add(J.card.mesh,J.handle.mesh),J.handle.mesh.position.set(0,Y/2+.035,0),u(J.card.tex),u(J.handle.tex);{let{ctx:h,w:y,h:M}=J.handle;Gn(h,4,4,y-8,M-8,(M-8)/2),h.fillStyle="rgba(255,255,255,0.34)",h.fill(),J.handle.update()}ve(J.handle.mesh,{drag:()=>J.group});let ze=()=>J.items.slice(J.page*Ue,J.page*Ue+Ue),et=()=>Math.max(1,Math.ceil(J.items.length/Ue)),lt=h=>J.path+"|"+h.name;function Be(h){let{w:y,h:M}=J.card,P=M*Re,A=y*.018,O=(y-A*(W+1))/W,Q=(M-P-A*(Pe+1))/Pe;return{x:A+h%W*(O+A),y:P+A+Math.floor(h/W)*(Q+A),w:O,h:Q}}function ct(){let{ctx:h,w:y,h:M}=J.card;qn(h,y,M,56);let P=M*Re;J.btns=[];let A=P*.62,O=P*.56,Q=y-44,Z=(oe,de)=>{let _e=Q-A/2;h.beginPath(),h.arc(_e,O,A/2,0,Math.PI*2),h.fillStyle="rgba(255,255,255,0.06)",h.fill(),h.lineWidth=3,h.strokeStyle="rgba(255,255,255,0.16)",h.stroke(),ai(h,oe,_e,O,A*.62,Bt,7),J.btns.push({x0:Q-A,x1:Q,act:de}),Q-=A+20};Z("close",()=>Ne()),J.page+1<et()&&Z("next",()=>{J.page++,ct(),Ut(J.gen)}),J.page>0&&Z("back",()=>{J.page--,ct(),Ut(J.gen)}),J.path&&Z("up",()=>{yt(J.up,"")}),h.font=`600 50px ${Xt}`;let ue=Yn(h,J.title||"Your folders",Q-220);if(wt(h,ue,56,O+18,50,Bt,600,"left",Xt,"-0.01em"),et()>1){h.font=`600 50px ${Xt}`;let oe=h.measureText(ue).width;wt(h,`${J.page+1} / ${et()}`,56+oe+28,O+16,34,Jt,500)}if(J.loading||J.err||!J.items.length){let oe=J.loading?"Opening\u2026":J.err||"This folder is empty.";h.font=`500 46px ${Kt}`;let de=a.wrapLines(oe,y*.7,_e=>h.measureText(_e).width);de.forEach((_e,Ae)=>wt(h,_e,y/2,M*.55+(Ae-(de.length-1)/2)*64,46,J.err?ea:Jt,500,"center")),J.card.update();return}ze().forEach((oe,de)=>{let _e=Be(de);h.save(),Gn(h,_e.x,_e.y,_e.w,_e.h,26),h.fillStyle="rgba(255,255,255,0.045)",h.fill(),h.clip();let Ae=J.thumbs.get(lt(oe));if(Ae){let Te=Math.max(_e.w/Ae.width,_e.h/Ae.height);h.drawImage(Ae,_e.x+(_e.w-Ae.width*Te)/2,_e.y+(_e.h-Ae.height*Te)/2,Ae.width*Te,Ae.height*Te)}else ai(h,oe.dir?"folder":t.isPicture(oe.name)?"photos":"doc",_e.x+_e.w/2,_e.y+_e.h*.42,Math.min(_e.w,_e.h)*.4,oe.dir?Bt:Jt,4);let nt=h.createLinearGradient(0,_e.y+_e.h-92,0,_e.y+_e.h);nt.addColorStop(0,"rgba(10,12,18,0)"),nt.addColorStop(1,"rgba(10,12,18,0.86)"),h.fillStyle=nt,h.fillRect(_e.x,_e.y+_e.h-92,_e.w,92),h.font=`500 30px ${Kt}`,wt(h,Yn(h,oe.name,_e.w-36),_e.x+18,_e.y+_e.h-20,30,Bt,500),h.restore()}),J.card.update()}async function Ut(h){for(let y of ze()){if(h!==J.gen||!J.open)return;let M=lt(y);if(y.dir||!t.isPicture(y.name)||J.thumbs.has(M)||J.pending.has(M))continue;J.pending.add(M);let P=null;try{P=await t.thumb(J.path,y)}finally{h===J.gen&&J.pending.delete(M)}if(h!==J.gen||!J.open){P?.close?.();return}if(J.thumbs.has(M)){P?.close?.();continue}J.thumbs.set(M,P||null),P&&ct()}}function Pt(){for(let h of J.thumbs.values())h?.close?.();J.thumbs.clear(),J.pending.clear()}async function yt(h,y){let M=++J.gen;Pt(),Object.assign(J,{loading:!0,err:"",items:[],page:0,title:y||J.title}),ct();let P;if(h)P=await t.pc.list(h);else{let A=await t.pc.roots();P=A.error?A:{path:"",up:"",items:A.roots.map(O=>({name:O.name,dir:!0,at:O.path}))}}return M!==J.gen||!J.open?"":(J.loading=!1,P.error?(J.err=P.error,ct(),P.error):(Object.assign(J,{path:P.path,up:P.up,items:P.items}),y||(J.title=P.path?String(P.path).split(/[\\/]/).filter(Boolean).slice(-2).join(" \u203A "):"Your folders"),ct(),Ut(M),""))}ve(J.card.mesh,{tap:h=>{if(!h?.uv)return;let{w:y,h:M}=J.card,P=h.uv.x*y,A=(1-h.uv.y)*M;if(A<M*Re){J.btns.find(Z=>P>=Z.x0&&P<=Z.x1)?.act();return}if(J.loading)return;let O=ze().findIndex((Z,ue)=>{let oe=Be(ue);return P>=oe.x&&P<=oe.x+oe.w&&A>=oe.y&&A<=oe.y+oe.h}),Q=ze()[O];Q&&(Q.dir?yt(Q.at||t.joinPath(J.path,Q.name),Q.name):t.openPhoto(J.path,Q).then(Z=>{Z&&vt(Z,12e3,!0)}))},scroll:h=>{let y=Math.max(0,Math.min(et()-1,J.page+Math.sign(h)));y!==J.page&&(J.page=y,ct(),Ut(J.gen))}});async function jt(h){if(!J.open){let A=st-(fe.open?.85:.05),O=1.15;J.group.position.set(qe.x-Math.sin(A)*O,qe.y-.04,qe.z-Math.cos(A)*O),q(J.group),_i("files")}if(J.open=!0,J.group.visible=!0,!h)return yt("","Your folders");let y=++J.gen;Object.assign(J,{loading:!0,err:""}),ct();let M=await t.pc.roots();if(!J.open||y!==J.gen)return"";if(M.error)return J.loading=!1,J.err=M.error,ct(),M.error;let P=M.roots.find(A=>String(A.name).toLowerCase()===h.toLowerCase());return P?yt(P.path,P.name):(await yt("","Your folders"),"I couldn't find a "+h+" folder on your PC, so here are all your folders.")}function Ne(){J.open=!1,J.gen++,J.group.visible=!1,Pt(),_.userData.placed==="files"&&(fe.open?_.userData.placed="pc":pe.open?_.userData.placed="web":Me.open?_.userData.placed="holo":bs())}let Qt=1,pt=.1,pn=.62,Dn=5,pe={group:new Wt,head:rn(Qt,pt),body:rn(Qt,pn),handle:rn(.3,.035),open:!1,gen:0,q:"",typed:"",mode:"",results:[],page:null,title:"",paras:[],first:0,more:!1,err:"",btns:[],rows:[]};pe.group.visible=!1,l.add(pe.group),pe.group.add(pe.head.mesh,pe.body.mesh,pe.handle.mesh),pe.head.mesh.position.set(0,pn/2+.008+pt/2,0),pe.handle.mesh.position.set(0,pn/2+.016+pt+.02,0),u(pe.head.tex),u(pe.body.tex),u(pe.handle.tex);{let{ctx:h,w:y,h:M}=pe.handle;Gn(h,4,4,y-8,M-8,(M-8)/2),h.fillStyle="rgba(255,255,255,0.34)",h.fill(),pe.handle.update()}ve(pe.handle.mesh,{drag:()=>pe.group});let xi=()=>pe.mode==="reading"||pe.mode==="page-loading"||pe.mode==="page-error";function St(){let{ctx:h,w:y,h:M}=pe.head;qn(h,y,M,48);let P=M/2,A=M*.6;pe.btns=[];let O=y-36,Q=(nt,Te)=>{let mt=O-A/2;h.beginPath(),h.arc(mt,P,A/2,0,Math.PI*2),h.fillStyle="rgba(255,255,255,0.06)",h.fill(),h.lineWidth=3,h.strokeStyle="rgba(255,255,255,0.16)",h.stroke(),ai(h,nt,mt,P,A*.62,Bt,7),pe.btns.push({x0:O-A,x1:O,act:Te}),O-=A+18};Q("close",()=>Sl()),xi()&&Q("back",()=>{pe.gen++,pe.mode="results",mn()});let Z=30,ue=O-12-Z,oe=M*.66;Gn(h,Z,P-oe/2,ue,oe,oe/2),h.fillStyle="rgba(255,255,255,0.06)",h.fill(),h.lineWidth=3,h.strokeStyle=pe.mode==="typing"||pe.mode==="searching"?"rgba(94,234,212,0.75)":"rgba(255,255,255,0.16)",h.stroke(),ai(h,"search",Z+oe*.58,P,oe*.6,Jt,7);let de=xi()?pe.page?.site||"":pe.typed;h.font=`500 40px ${Kt}`;let _e=Yn(h,de||"Search Google",ue-oe*1.4-24),Ae=Z+oe*1.1;wt(h,_e,Ae,P+14,40,de?Bt:Jt,500),pe.mode==="typing"&&(h.font=`500 40px ${Kt}`,h.fillStyle=Sn,h.fillRect(Ae+(de?h.measureText(_e).width:0)+6,P-22,4,44)),pe.head.update()}function kt(){let{ctx:h,w:y,h:M}=pe.body;qn(h,y,M,48),pe.rows=[];let P=56,A=(Q,Z=Jt)=>{h.font=`500 44px ${Kt}`;let ue=a.wrapLines(Q,y*.76,oe=>h.measureText(oe).width);ue.forEach((oe,de)=>wt(h,oe,y/2,M*.5+(de-(ue.length-1)/2)*62,44,Z,500,"center"))},O=pe.mode;if(O==="")A("Say \u201Csearch the web for\u2026\u201D and anything you want to know. I'll look it up right here.");else if(O==="typing")A("");else if(O==="searching")A("Searching Google\u2026");else if(O==="error"||O==="page-error")A(pe.err,ea);else if(O==="page-loading")A("Reading "+(pe.page?.site||"the page")+"\u2026");else if(O==="results"){pe.results.length||A("Google didn't return any pages for that. Try other words.");let Q=(M-40)/Dn;pe.results.slice(0,Dn).forEach((Z,ue)=>{let oe=20+ue*Q;ue&&(h.fillStyle="rgba(255,255,255,0.08)",h.fillRect(P,oe,y-P*2,2)),h.font=`600 40px ${Xt}`,wt(h,Yn(h,Z.site,y-P*2),P,oe+66,40,Sn,600,"left",Xt),h.font=`500 34px ${Kt}`;let de=a.wrapLines(Z.snippet||"Tap to read this page.",y-P*2,_e=>h.measureText(_e).width).slice(0,2);de.length===2&&(Z.snippet||"").length>0&&a.wrapLines(Z.snippet,y-P*2,Ae=>h.measureText(Ae).width).length>2&&(de[1]=Yn(h,de[1]+" \u2026",y-P*2)),de.forEach((_e,Ae)=>wt(h,_e,P,oe+122+Ae*46,34,Jt,500)),pe.rows.push({y0:oe,y1:oe+Q,r:Z})})}else if(O==="reading"){h.font=`600 46px ${Xt}`;let Q=a.wrapLines(pe.title,y-P*2,de=>h.measureText(de).width).slice(0,2),Z=30;for(let de of Q)wt(h,de,P,Z+=60,46,Bt,600,"left",Xt);Z+=30,h.font=`500 36px ${Kt}`;let ue=M-70;pe.more=!1;for(let de=pe.first;de<pe.paras.length;de++){let _e=a.wrapLines(pe.paras[de],y-P*2,Ae=>h.measureText(Ae).width);if(Z+_e.length*50>ue&&de>pe.first){pe.more=!0;break}for(let Ae of _e){if((Z+=50)>ue){pe.more=!0;break}wt(h,Ae,P,Z,36,Bt,500)}Z+=20}let oe=`${pe.first+1} / ${pe.paras.length}`+(pe.more?"  \xB7  thumbstick or tap for more":"");wt(h,oe,y-P,M-28,26,Jt,500,"right")}pe.body.update()}function mn(){St(),kt()}ve(pe.head.mesh,{tap:h=>{if(!h?.uv)return;let y=h.uv.x*pe.head.w;pe.btns.find(M=>y>=M.x0&&y<=M.x1)?.act()},grab:()=>pe.group}),ve(pe.body.mesh,{tap:h=>{if(!h?.uv)return;let y=(1-h.uv.y)*pe.body.h;if(pe.mode==="results"){let M=pe.rows.find(P=>y>=P.y0&&y<P.y1);M&&Md(M.r)}else pe.mode==="reading"&&Et(1)},scroll:h=>Et(h),grab:()=>pe.group});function Et(h){if(pe.mode!=="reading")return;let y=Math.max(0,Math.min(pe.paras.length-1,pe.first+Math.sign(h)));y===pe.first||h>0&&!pe.more||(pe.first=y,kt())}let Cn=new B;function Di(){_.userData.placed!==!0&&(pe.group.updateWorldMatrix(!0,!1),Cn.set(-Qt/2-.36,pn/2-.02,.06),pe.group.localToWorld(Cn),Un={x:Cn.x,y:Cn.y,z:Cn.z},_.userData.placed="web")}function ca(){if(!pe.open){let h=st-(fe.open||J.open?.85:.08),y=1.2;pe.group.position.set(qe.x-Math.sin(h)*y,qe.y-.02,qe.z-Math.cos(h)*y),q(pe.group)}pe.open=!0,pe.group.visible=!0}function vd(h,y){return b?(pe.typed=h,St(),Promise.resolve()):new Promise(M=>{let P=0,A=()=>{if(y!==pe.gen||!pe.open)return M();if(P=Math.min(h.length,P+(h.length>36?2:1)),pe.typed=h.slice(0,P),St(),P>=h.length)return setTimeout(M,220);setTimeout(A,45+Math.random()*35)};A()})}async function yd(h){h=String(h||"").trim(),ca();let y=++pe.gen;if(Object.assign(pe,{q:h,typed:"",results:[],page:null,err:"",mode:h?"typing":""}),mn(),!h)return"What should I search for? Say search the web for, and what you want to know.";if(Di(),await vd(h,y),y!==pe.gen||!pe.open)return"";pe.mode="searching",mn();let M;try{M=await t.search(h)}catch(P){M={error:String(P?.message||P)}}return y!==pe.gen||!pe.open?"":!M||M.error?(Object.assign(pe,{mode:"error",err:M?.error||"The search didn't work."}),mn(),pe.err):(Object.assign(pe,{mode:"results",results:Array.isArray(M.results)?M.results:[]}),mn(),M.answer||(pe.results.length?"Here's what Google found. Point at one and I'll read it to you.":"Google didn't find anything for that."))}async function Md(h){let y=++pe.gen;Object.assign(pe,{mode:"page-loading",page:h,paras:[],first:0,title:"",err:""}),mn();let M;try{M=await t.read(h,pe.q)}catch(P){M={error:String(P?.message||P)}}if(!(y!==pe.gen||!pe.open)){if(!M||M.error){Object.assign(pe,{mode:"page-error",err:M?.error||"I couldn't read that page."}),mn();return}Object.assign(pe,{mode:"reading",title:M.title||h.site,paras:Array.isArray(M.paras)&&M.paras.length?M.paras:["That page gave me nothing to read."]}),mn(),t.speak?.(pe.paras[0])}}function Sl(){pe.open=!1,pe.gen++,pe.group.visible=!1,_.userData.placed==="web"&&(fe.open?(_.userData.placed=!1,_i("pc")):Me.open?(_.userData.placed=!1,_i("holo")):bs())}let Rn={teal:6220500,sky:8246268,violet:12891645,rose:16622767,amber:16569165,lime:12513892,white:15331063},Sd=h=>"#"+(Rn[h]??Rn.teal).toString(16).padStart(6,"0"),Me={group:new Wt,stage:new Wt,open:!1,spec:null,nodes:[],links:[],bar:rn(.86,.1),t0:0,focus:null,step:-1,building:null,btns:[]};Me.group.visible=!1,Me.group.add(Me.stage,Me.bar.mesh),Me.bar.mesh.position.set(0,-.42,.02),l.add(Me.group),u(Me.bar.tex);let rh=u(gd()),bd=u(new ti(1,32,24)),wd=u(new Ci(1,1,1)),Td=(()=>{let h=new Xi(1,1),y=u(new Ur(h));return h.dispose(),y})(),ah={value:0};function Ad(h){return new tn({uniforms:{color:{value:new Ye(h)},opacity:{value:.82},time:ah},vertexShader:`varying vec3 vN; varying vec3 vV; varying float vY;
void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
  vY = (modelMatrix * vec4(position, 1.0)).y; gl_Position = projectionMatrix * mv; }`,fragmentShader:`uniform vec3 color; uniform float opacity; uniform float time; varying vec3 vN; varying vec3 vV; varying float vY;
void main(){ float rim = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.0);
  float lines = 0.8 + 0.2 * step(0.5, fract(vY * 150.0 - time * 0.9));
  gl_FragColor = vec4(color * (0.5 + rim * 1.5) * lines, opacity * (0.45 + rim * 0.55));
  #include <colorspace_fragment>
}`,transparent:!0,depthWrite:!1})}let _t={group:new Wt,rings:[],beam:null,dots:null,scan:null,scanT0:-1,speed:[]};{let h=P=>new hn({color:Rn.teal,transparent:!0,opacity:P,blending:An,depthWrite:!1,side:Vn});for(let[P,A,O,Q,Z]of[[.985,1,.32,96,.25],[.7,.71,.24,96,-.4],[.4,.44,.14,6,.6]]){let ue=new bt(u(new ms(P,A,Q)),u(h(O)));ue.rotation.x=-Math.PI/2,_t.group.add(ue),_t.rings.push(ue),_t.speed.push(Z)}_t.beam=new bt(u(new di(.85,1,1,48,1,!0)),u(new tn({uniforms:{color:{value:new Ye(Rn.teal)},strength:{value:.14}},vertexShader:"varying float vY; void main(){ vY = position.y + 0.5; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`uniform vec3 color; uniform float strength; varying float vY;
void main(){ float a = strength * pow(1.0 - vY, 2.2); gl_FragColor = vec4(color * a, a);
  #include <colorspace_fragment>
}`,transparent:!0,blending:An,depthWrite:!1,side:Vn}))),_t.beam.position.y=.5,_t.group.add(_t.beam);let y=70,M=new Float32Array(y*3);_t.rise=[];for(let P=0;P<y;P++){let A=Math.random()*Math.PI*2,O=Math.sqrt(Math.random())*.88;M.set([Math.cos(A)*O,Math.random(),Math.sin(A)*O],P*3),_t.rise.push(.05+Math.random()*.1)}_t.dots=new ds(u(new Ct().setAttribute("position",new rt(M,3))),u(new Hi({color:Rn.teal,size:.006,transparent:!0,opacity:.75,blending:An,depthWrite:!1}))),_t.group.add(_t.dots),_t.scan=new bt(u(new ms(.95,1,96)),u(h(0))),_t.scan.rotation.x=-Math.PI/2,_t.group.add(_t.scan),_t.group.visible=!1,Me.group.add(_t.group)}function oh(h,y){let M=Math.max(.24,Math.min(.7,h));_t.group.scale.set(M,.68,M),_t.group.position.set(0,-.34,0),_t.group.visible=!0,_t.scanT0=y&&!b?performance.now():-1,_t.scan.material.opacity=0}function Ed(h,y){if(!_t.group.visible||b)return;_t.rings.forEach((P,A)=>{P.rotation.z+=h*_t.speed[A]});let M=_t.dots.geometry.attributes.position;for(let P=0;P<M.count;P++){let A=M.getY(P)+h*_t.rise[P];A>1&&(A-=1),M.setY(P,A)}if(M.needsUpdate=!0,_t.scanT0>=0){let P=(y-_t.scanT0)/1100;P>=1?(_t.scanT0=-1,_t.scan.material.opacity=0):(_t.scan.position.y=P,_t.scan.material.opacity=.9*Math.sin(Math.PI*P))}}function bl(){for(let h of Me.nodes){for(let y of[h.mat,h.glow.material,h.label.mesh.material])y.dispose();h.label.tex.dispose(),h.label.mesh.geometry.dispose(),h.ring?.geometry.dispose(),h.ring?.material.dispose(),h.shell?.material.dispose(),Ze(h.body),Ze(h.label.mesh)}for(let h of Me.links)h.line.geometry.dispose(),h.line.material.dispose(),h.pulse?.material.dispose();Me.building&&(Me.building.geometry.dispose(),Me.building.material.dispose()),Me.stage.clear(),Me.nodes=[],Me.links=[],Me.building=null}function lh(){let h=st-(fe.open?.9:0),y=1.35;Me.group.position.set(qe.x-Math.sin(h)*y,qe.y+.02,qe.z-Math.cos(h)*y),q(Me.group)}function wl(h){let{ctx:y,w:M,h:P}=Me.bar;qn(y,M,P,48);let A=P/2,O=P*.6;Me.btns=[];let Q=M-36,Z=(_e,Ae)=>{let nt=Q-O/2;y.beginPath(),y.arc(nt,A,O/2,0,Math.PI*2),y.fillStyle="rgba(255,255,255,0.06)",y.fill(),y.lineWidth=3,y.strokeStyle="rgba(255,255,255,0.16)",y.stroke(),ai(y,_e,nt,A,O*.62,Bt,7),Me.btns.push({x0:Q-O,x1:Q,act:Ae}),Q-=O+18};Z("close",()=>Tl());let ue=Me.spec,oe=ue?.steps?.length||0;ue&&oe&&(Me.step<oe-1&&Z("next",()=>t.holoStep?.(1)),Me.step>0&&Z("back",()=>t.holoStep?.(-1))),ai(y,"holo",30+O/2,A,O*.7,Sn,6);let de=30+O+16;if(y.font=`600 38px ${Xt}`,y.font=`600 44px ${Xt}`,wt(y,Yn(y,h||ue?.title||"",Q-de-190),de,A+15,44,Bt,600,"left",Xt),ue&&oe){let _e=Me.step<0?`${oe} steps \xB7 say next`:`Step ${Me.step+1} of ${oe}`;wt(y,_e,Q-8,A+12,32,Jt,500,"right")}Me.bar.update()}ve(Me.bar.mesh,{tap:h=>{if(!h?.uv)return;let y=h.uv.x*Me.bar.w;Me.btns.find(M=>y>=M.x0&&y<=M.x1)?.act()},drag:()=>Me.group});function Cd(h){bl(),Me.spec=null,Me.step=-1,Me.focus=null,Me.open||lh(),Me.open=!0,Me.group.visible=!0;let y=new bt(new qi(.16,.0025,8,96),new hn({color:Rn.teal,transparent:!0,opacity:.7,depthWrite:!1}));Me.stage.add(y),Me.building=y,oh(.3,!1),wl("Building "+(h?"\u201C"+String(h).slice(0,48)+"\u201D":"a hologram")+"\u2026"),_i("holo")}function Rd(h,y,M,P){let A=Rn[h.color]??Rn.teal,O=new Wt,Q=M==="chart"?new hn({color:A,transparent:!0,opacity:.82,depthWrite:!0}):Ad(A),Z,ue;M==="chart"?(Z=new bt(wd,Q),ue=.04):(ue=M==="model"?.022+h.size*.016:M==="map"&&y===0?.055:.03,Z=new bt(bd,Q),Z.scale.setScalar(ue));let oe=new hs(new Gi({map:rh,color:A,transparent:!0,opacity:.5,blending:An,depthWrite:!1}));oe.scale.setScalar(ue*(M==="chart"?3:5.5));let de=M==="steps"||M==="map"&&y===0,_e=M==="model",Ae=rn(_e?.15:de?.26:.24,_e?.05:de?.13:.085);{let{ctx:Tt,w:Ht,h:Vt}=Ae;qn(Tt,Ht,Vt,30,{fill0:"rgba(16,19,27,0.82)",fill1:"rgba(10,12,18,0.86)"});let an=_e?-2:16,Zt=_e?"":M==="timeline"&&h.when?h.when:M==="steps"?String(y+1):M==="chart"&&Number.isFinite(h.value)?String(h.value)+(P.unit?" "+P.unit:""):"";if(Zt&&(wt(Tt,Zt,26,an+=34,30,Sd(h.color),700,"left",Xt),an+=4),Tt.font=`600 36px ${Xt}`,wt(Tt,Yn(Tt,h.label,Ht-52),26,an+=40,36,Bt,600,"left",Xt),h.note&&!_e){Tt.font=`500 26px ${Kt}`;let Fn=a.wrapLines(h.note,Ht-52,ws=>Tt.measureText(ws).width).slice(0,de?3:1);for(let ws of Fn)wt(Tt,ws,26,an+=34,26,Jt,500)}Ae.update()}Ae.mesh.material.opacity=1,O.add(Z,oe,Ae.mesh);let nt=null;M!=="chart"&&(nt=new Js(Td,new ei({color:A,transparent:!0,opacity:.3,blending:An,depthWrite:!1})),nt.scale.setScalar(ue*1.45),nt.rotation.set(y*.7,y*1.3,0),O.add(nt));let Te={it:h,i:y,g:O,body:Z,mat:Q,glow:oe,label:Ae,shell:nt,r:ue,kind:M,base:new B,angle:0,speed:0,orbitR:0,parent:null,shown:0,emph:1},mt=()=>t.ask?.(`Tell me more about ${h.label}`+(P.title?`, in ${P.title}`:"")+".");return ve(Z,{tap:mt,hover:Tt=>{Te.hot=Tt}}),ve(Ae.mesh,{tap:mt,hover:Tt=>{Te.hot=Tt}}),Te}function Pd(h,y){let M=y.length,P=(O,Q)=>M>1?(O/(M-1)-.5)*Q:0;if(h.kind==="model"){let O=y.filter(Z=>Z.it.orbit<0);O.forEach((Z,ue)=>{Z.base.set(O.length>1?(ue/(O.length-1)-.5)*Math.min(.95,.32*O.length):0,.02,0)});let Q=new Map;for(let Z of y)if(Z.it.orbit>=0){let ue=y[Z.it.orbit],oe=Q.get(ue)||0;Q.set(ue,oe+1),Z.parent=ue,Z.orbitR=ue.r+Z.r+.07+oe*.075,Z.angle=oe*2.1+.6,Z.speed=.45/(1+oe*.55);let de=[];for(let _e=0;_e<=64;_e++){let Ae=_e/64*Math.PI*2;de.push(Math.cos(Ae)*Z.orbitR,Math.sin(Ae)*Z.orbitR*.22,Math.sin(Ae)*Z.orbitR*.85)}Z.ring=new Ei(new Ct().setAttribute("position",new rt(de,3)),new ei({color:Rn[ue.it.color]??Rn.teal,transparent:!0,opacity:.28,depthWrite:!1})),Me.stage.add(Z.ring)}for(let Z of y)Z.label.mesh.position.set(0,-(Z.r+.06),.01)}else if(h.kind==="map"){y[0].base.set(0,.02,0),y[0].label.mesh.position.set(0,-.14,.01);let O=y.slice(1);O.forEach((Q,Z)=>{let ue=-Math.PI/2+(Z+.5)/O.length*Math.PI*2;Q.base.set(Math.cos(ue)*.46,Math.sin(ue)*.27+.02,.03+Z%2*.05),Q.label.mesh.position.set(0,-.075,.01)})}else if(h.kind==="steps")y.forEach((O,Q)=>{let Z=P(Q,Math.min(1.1,.28*M));O.base.set(Z,.13,.16*(1-(Z/.6)**2)),O.label.mesh.position.set(0,-.12,.01)});else if(h.kind==="timeline"){y.forEach((Z,ue)=>{Z.base.set(P(ue,Math.min(1.15,.27*M)),0,0),Z.label.mesh.position.set(0,ue%2?-.1:.1,.01)});let O=[-.62,0,0,.62,0,0],Q=new Ei(new Ct().setAttribute("position",new rt(O,3)),new ei({color:Rn.white,transparent:!0,opacity:.35,depthWrite:!1}));Me.stage.add(Q),Me.links.push({line:Q,a:null,b:null})}else if(h.kind==="chart"){let O=Math.max(...y.map(oe=>Math.abs(oe.it.value)||0),1e-9),Q=y.some(oe=>oe.it.value<0),Z=Q?-.02:-.26,ue=Q?.24:.46;y.forEach((oe,de)=>{let _e=Number.isFinite(oe.it.value)?oe.it.value:0,Ae=Math.max(.01,ue*Math.abs(_e)/O),nt=_e<0;oe.body.scale.set(.075,Ae,.075),oe.base.set(P(de,Math.min(1.05,.22*M)),Z+(nt?-Ae/2:Ae/2),0),oe.glow.position.set(0,nt?-Ae/2:Ae/2,0),oe.label.mesh.position.set(0,nt?Ae/2+.06:-Ae/2-.06,.05)})}let A=[];for(let O of y)for(let Q of O.it.link)y[Q]&&Q!==O.i&&A.push([O,y[Q]]);if(h.kind==="map"&&!A.length)for(let O of y.slice(1))A.push([y[0],O]);if(h.kind==="steps")for(let O=1;O<M;O++)A.push([y[O-1],y[O]]);for(let[O,Q]of A){let Z=new Ei(new Ct().setAttribute("position",new rt([0,0,0,0,0,0],3)),new ei({color:Rn.teal,transparent:!0,opacity:0,depthWrite:!1}));Me.stage.add(Z);let ue=new hs(new Gi({map:rh,color:Rn[Q.it.color]??Rn.teal,transparent:!0,opacity:0,blending:An,depthWrite:!1}));ue.scale.setScalar(.05),Me.stage.add(ue),Me.links.push({line:Z,a:O,b:Q,pulse:ue,off:Me.links.length*.37})}}function Id(h){bl(),Me.spec=h,Me.step=-1,Me.focus=null,Me.t0=performance.now(),Me.open||lh(),Me.open=!0,Me.group.visible=!0,Me.nodes=h.items.map((M,P)=>Rd(M,P,h.kind,h));for(let M of Me.nodes)Me.stage.add(M.g);Pd(h,Me.nodes);for(let M of Me.nodes)M.g.position.copy(M.base),M.g.scale.setScalar(b?1:.001);let y=Math.max(.2,...Me.nodes.map(M=>Math.abs(M.base.x)+M.r+(M.parent?M.orbitR+Math.abs(M.parent.base.x):0)));oh(y+.06,!0),wl(),_i("holo")}function Ld(h,y){Me.step=y??Me.step,Me.focus=Array.isArray(h)&&h.length?new Set(h):null,wl()}function Tl(){bl(),_t.group.visible=!1,Me.open=!1,Me.spec=null,Me.group.visible=!1,t.holoClosed?.(),_.userData.placed==="holo"&&(fe.open?(_.userData.placed=!1,_i("pc")):bs())}let bn={group:null,sky:null,parts:null,dots:null,kind:"none",made:[],t0:0,spec:null};function Al(){if(!bn.group)return!1;l.remove(bn.group);for(let h of bn.made)try{h.dispose()}catch{}return Object.assign(bn,{group:null,sky:null,parts:null,dots:null,made:[],spec:null}),!0}function Dd(h){Al();let y=Te=>(bn.made.push(Te),Te),M=Te=>new Ye(Te),P=new Wt;P.position.set(qe.x,re,qe.z),P.rotation.y=st;let A=new bt(y(new ti(36,48,24)),y(new tn({side:un,transparent:!0,depthWrite:!0,uniforms:{top:{value:M(h.sky.top)},mid:{value:M(h.sky.horizon)},low:{value:M(h.sky.bottom)},fade:{value:b?1:0}},vertexShader:"varying vec3 vW; void main(){ vW = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`uniform vec3 top; uniform vec3 mid; uniform vec3 low; uniform float fade; varying vec3 vW;
void main(){ float h = vW.y; vec3 c = h < 0.0 ? mix(mid, low, clamp(-h * 3.0, 0.0, 1.0)) : mix(mid, top, clamp(pow(h, 0.7) * 1.3, 0.0, 1.0));
  gl_FragColor = vec4(c, fade);
  #include <colorspace_fragment>
}`})));A.renderOrder=-9,P.add(A);let O=new Br(M(h.sky.top),M(h.ground.color),1.1),Q=new kr(M(h.light),1.4);Q.position.set(6,10,4),P.add(O,Q);let Z=h.ground.kind;if(Z!=="none"){let Te;if(Z==="dunes"||Z==="rock"||Z==="snow"){Te=new Ri(68,68,64,64);let Ht=Te.attributes.position;for(let Vt=0;Vt<Ht.count;Vt++){let an=Ht.getX(Vt),Zt=Ht.getY(Vt),Fn=Math.hypot(an,Zt),ws=Z==="dunes"?.55:Z==="rock"?.35:.2;Ht.setZ(Vt,Fn<3?0:ws*Math.min(1,(Fn-3)/6)*(Math.sin(an*.45)*Math.cos(Zt*.38)+.5*Math.sin((an+Zt)*.9)))}Te.computeVertexNormals()}else Te=new ps(34,72);y(Te);let mt=y(Z==="water"?new Pi({color:M(h.ground.color),transparent:!0,opacity:.92,emissive:M(h.ground.color),emissiveIntensity:.25}):Z==="clouds"?new Pi({color:M(h.ground.color),transparent:!0,opacity:.85}):new Pi({color:M(h.ground.color),flatShading:Z!=="grass"&&Z!=="grid"})),Tt=new bt(Te,mt);if(Tt.rotation.x=-Math.PI/2,Tt.position.y=Z==="clouds"?-.4:.002,Tt.renderOrder=-8,P.add(Tt),Z==="grid"){let Ht=[];for(let Vt=-30;Vt<=30;Vt+=1.5)Ht.push(Vt,.01,-30,Vt,.01,30,-30,.01,Vt,30,.01,Vt);P.add(new Js(y(new Ct().setAttribute("position",new rt(Ht,3))),y(new ei({color:M(h.light),transparent:!0,opacity:.55}))))}}let ue=new Wt,oe={},de=(Te,mt)=>oe[Te]||(oe[Te]=y(mt())),_e={near:[4,9],mid:[9,17],far:[18,30]};for(let Te of h.shapes){let mt=y(new Pi({color:M(Te.color),flatShading:!0})),Tt=y(new hn({color:M(Te.color)})),Ht=y(new Pi({color:M(Te.color).multiplyScalar(.35),flatShading:!0})),Vt=Te.kind==="mountain"?_e.far:Te.kind==="planet"||Te.kind==="moon"?[22,30]:_e[Te.spread];for(let an=0;an<Te.count;an++){let Zt=an/Te.count*Math.PI*2+Math.random()*.9,Fn=Vt[0]+Math.random()*(Vt[1]-Vt[0]);Math.abs(Math.atan2(Math.sin(Zt),Math.cos(Zt)))<.65&&Fn<12&&Te.kind!=="lantern"&&(Fn+=7);let Yd=Te.size*(.75+Math.random()*.5),ss=new Wt,gn=(dr,Pl,Il=0,$d=1,Jd=1,Kd=1)=>{let fa=new bt(dr,Pl);return fa.position.y=Il,fa.scale.set($d,Jd,Kd),ss.add(fa),fa};if(Te.kind==="tree")gn(de("trunk",()=>new di(.06,.09,.7,6)),Ht,.35),gn(de("blob",()=>new Xi(.45,0)),mt,.95);else if(Te.kind==="pine")gn(de("trunk",()=>new di(.06,.09,.7,6)),Ht,.3),gn(de("cone",()=>new Ks(.42,1.3,7)),mt,1.05);else if(Te.kind==="palm")gn(de("stem",()=>new di(.04,.07,1.9,6)),Ht,.95),gn(de("blob",()=>new Xi(.45,0)),mt,1.95,1.4,.35,1.4);else if(Te.kind==="rock")gn(de("rock",()=>new Dr(.4,0)),mt,.15,1,.6,1);else if(Te.kind==="crystal")gn(de("crystal",()=>new Nr(.3,0)),Tt,.7,.8,2.3,.8);else if(Te.kind==="pillar")gn(de("pillar",()=>new di(.25,.3,3,10)),mt,1.5);else if(Te.kind==="tower")gn(de("tower",()=>new Ci(1,6,1)),mt,3);else if(Te.kind==="mountain")gn(de("mountain",()=>new Ks(6,8,7)),mt,4);else if(Te.kind==="arch")gn(de("arch",()=>new qi(1.2,.15,8,24,Math.PI)),mt,0);else if(Te.kind==="lantern")gn(de("lantern",()=>new ti(.12,12,8)),Tt,1.3);else if(Te.kind==="cloud"){let dr=de("puff",()=>new Xi(.7,1));gn(dr,mt,0,1.4,.8,1);let Pl=gn(dr,mt,.15,1,.7,1);Pl.position.x=.9;let Il=gn(dr,mt,.1,1.1,.75,1);Il.position.x=-.9}else(Te.kind==="planet"||Te.kind==="moon")&&gn(de(Te.kind,()=>new ti(Te.kind==="planet"?3:1.5,32,20)),Te.kind==="moon"?Tt:mt,0);ss.scale.setScalar(Yd);let Mh=Te.kind==="planet"||Te.kind==="moon"?10+Math.random()*10:Te.kind==="cloud"?6+Math.random()*5:0,Zd=Te.float&&Mh===0?.8+Math.random()*2.5:0;ss.position.set(Math.sin(Zt)*Fn,Mh+Zd,-Math.cos(Zt)*Fn),ss.rotation.y=Math.random()*Math.PI*2,ss.userData={bob:Te.float||Te.kind==="cloud"||Te.kind==="lantern"?Math.random()*6:-1,y:ss.position.y},ue.add(ss)}}b||ue.scale.setScalar(.001),P.add(ue);let Ae=h.particles.kind,nt=null;if(Ae!=="none"){let Te=Math.round(Ae==="stars"?500+700*h.particles.amount:150+900*h.particles.amount),mt=new Float32Array(Te*3),Tt=new Float32Array(Te);for(let Vt=0;Vt<Te;Vt++){if(Ae==="stars"){let an=Math.random()*Math.PI*2,Zt=Math.random()*.9+.08,Fn=33;mt.set([Math.cos(an)*Math.sqrt(1-Zt*Zt)*Fn,Zt*Fn,Math.sin(an)*Math.sqrt(1-Zt*Zt)*Fn],Vt*3)}else{let an=Math.random()*Math.PI*2,Zt=1.2+Math.sqrt(Math.random())*13;mt.set([Math.cos(an)*Zt,Math.random()*9,Math.sin(an)*Zt],Vt*3)}Tt[Vt]=Math.random()*100}let Ht={stars:.09,snow:.05,rain:.03,fireflies:.07,embers:.05,bubbles:.08,petals:.06,dust:.03}[Ae];nt=new ds(y(new Ct().setAttribute("position",new rt(mt,3))),y(new Hi({color:M(h.particles.color),size:Ht,transparent:!0,opacity:Ae==="dust"?.5:.9,depthWrite:!1,blending:Ae==="fireflies"||Ae==="embers"||Ae==="stars"?An:Ki}))),nt.userData.seed=Tt,P.add(nt)}l.add(P),Object.assign(bn,{group:P,sky:A,parts:ue,dots:nt,kind:Ae,t0:performance.now(),spec:h}),vt(h.title,5e3)}function Nd(h,y){if(!bn.group)return;let M=(y-bn.t0)/1e3;if(!b){bn.sky.material.uniforms.fade.value=Math.min(1,M/1.2);let oe=Math.max(0,Math.min(1,(M-.5)/1.4));bn.parts.scale.setScalar(Math.max(.001,1-(1-oe)**3));for(let de of bn.parts.children)de.userData.bob>=0&&(de.position.y=de.userData.y+Math.sin(y/1600+de.userData.bob)*.15)}let P=bn.dots;if(!P||b||bn.kind==="stars")return;let A=P.geometry.attributes.position,O=P.userData.seed,Q=bn.kind,Z=y/1e3,ue={snow:-.5,rain:-7,fireflies:0,embers:.7,bubbles:.45,petals:-.35,dust:.03}[Q]??0;for(let oe=0;oe<A.count;oe++){let de=A.getY(oe)+ue*h*(.7+O[oe]%1*.6);if(de<0?de+=9:de>9&&(de-=9),A.setY(oe,de),Q!=="rain"){let _e=O[oe];A.setX(oe,A.getX(oe)+Math.sin(Z*.6+_e)*h*(Q==="fireflies"?.35:.12)),A.setZ(oe,A.getZ(oe)+Math.cos(Z*.5+_e*1.3)*h*(Q==="fireflies"?.35:.12))}}A.needsUpdate=!0,Q==="fireflies"&&(P.material.opacity=.6+.35*Math.sin(Z*2.1))}let Ft={card:rn(.2,.09),until:0,total:0,words:"",shown:"",doneAt:0};Ft.card.mesh.visible=!1,Ft.card.mesh.position.set(.36,.1,.01),_.add(Ft.card.mesh),u(Ft.card.tex);function El(h){let{ctx:y,w:M,h:P}=Ft.card,A=h<=0;qn(y,M,P,40,A?{hot:!0}:{});let O=Math.max(0,Math.ceil(h/1e3)),Q=Math.floor(O/3600),Z=Math.floor(O%3600/60),ue=O%60,oe=A?"Time's up":(Q?Q+":"+String(Z).padStart(2,"0"):String(Z))+":"+String(ue).padStart(2,"0");wt(y,"Timer \xB7 "+Ft.words,34,56,26,Jt,600,"left",Xt,"0.02em"),wt(y,oe,34,P-40,A?56:72,A?Sn:Bt,600,"left",Xt);let de=Ft.total?Math.max(0,Math.min(1,h/Ft.total)):0;y.fillStyle="rgba(255,255,255,0.1)",y.fillRect(34,P-22,M-68,4),y.fillStyle=Sn,y.fillRect(34,P-22,(M-68)*de,4),ai(y,"close",M-52,52,40,Jt,7),Ft.card.update()}function Ud(h,y){Object.assign(Ft,{until:performance.now()+h,total:h,words:y||"",shown:"",doneAt:0}),Ft.card.mesh.visible=!0,El(h)}function Cl(){let h=Ft.until>0;return Ft.until=0,Ft.doneAt=0,Ft.card.mesh.visible=!1,h}ve(Ft.card.mesh,{tap:()=>Cl(),drag:()=>_,dropped:()=>{_.userData.placed=!0}});function Fd(h){if(!Ft.until)return;let y=Ft.until-h;if(y>0){let M=String(Math.ceil(y/1e3));M!==Ft.shown&&(Ft.shown=M,El(y));return}Ft.doneAt?h-Ft.doneAt>15e3&&Cl():(Ft.doneAt=h,El(0),vt("Time's up: your "+Ft.words+" timer.",12e3),t.speak?.("Time's up! Your "+Ft.words+" timer is done."))}let ha=[["Breathe in\u2026",4e3],["Hold\u2026",4e3],["Breathe out\u2026",6e3]],Nn={on:!1,t0:0,rounds:0,phase:-1,grow:0};function Od(h=4){Object.assign(Nn,{on:!0,t0:performance.now(),rounds:h,phase:-1})}function ch(h){Nn.on&&(Nn.on=!1,X.reply=h||"",ee())}function Bd(h){if(!Nn.on){Nn.grow+=(0-Nn.grow)*.08;return}let y=14e3,M=h-Nn.t0,P=Math.floor(M/y);if(P>=Nn.rounds){ch("Nicely done. How do you feel?"),t.speak?.("Nicely done. How do you feel?");return}let A=M%y,O=0;for(;A>ha[O][1];)A-=ha[O][1],O++;let Q=A/ha[O][1],Z=oe=>.5-Math.cos(Math.PI*oe)/2;Nn.grow=O===0?Z(Q):O===1?1:1-Z(Q);let ue=P*3+O;ue!==Nn.phase&&(Nn.phase=ue,X.reply=ha[O][0]+"  "+(P+1)+" of "+Nn.rounds,X.stage="",ee())}let hh=new B;function zd(h,y){if(!Me.open)return;if(Ed(h,y),ah.value=y/1e3,Me.building){Me.building.rotation.y+=h*1.4,Me.building.rotation.x=.5;return}let M=y-Me.t0;for(let A of Me.nodes){let O=b?1:Math.max(0,Math.min(1,(M-A.i*110)/520));A.shown=b?1:1-(1-O)**3,A.parent?(b||(A.angle+=h*A.speed),hh.set(Math.cos(A.angle)*A.orbitR,Math.sin(A.angle)*A.orbitR*.22,Math.sin(A.angle)*A.orbitR*.85),A.g.position.copy(A.parent.g.position).add(hh),A.ring.position.copy(A.parent.g.position)):b||A.g.position.set(A.base.x,A.base.y+Math.sin(y/1400+A.i)*.004,A.base.z);let Q=Me.focus?Me.focus.has(A.i)?1.18:.32:A.hot?1.1:1;A.emph+=(Q-A.emph)*Math.min(1,h*6);let Z=Math.min(1,A.emph);A.g.scale.setScalar(Math.max(.001,A.shown*(A.emph>1?A.emph:1))),A.mat.uniforms?A.mat.uniforms.opacity.value=.82*Z:A.mat.opacity=.82*Z,A.shell&&(A.shell.material.opacity=.3*Z*(A.hot?1.6:1),b||(A.shell.rotation.y+=h*.5,A.shell.rotation.x+=h*.17)),A.glow.material.opacity=.5*Z*(A.hot?1.4:1),A.label.mesh.material.opacity=Math.max(.25,Z)}let P=b?1:Math.max(0,Math.min(1,(M-Me.nodes.length*110)/500));for(let A of Me.links){if(!A.a)continue;let O=A.line.geometry.attributes.position;O.setXYZ(0,A.a.g.position.x,A.a.g.position.y,A.a.g.position.z),O.setXYZ(1,A.b.g.position.x,A.b.g.position.y,A.b.g.position.z),O.needsUpdate=!0;let Q=Me.focus?Me.focus.has(A.a.i)&&Me.focus.has(A.b.i)?.7:.12:.45;if(A.line.material.opacity=Q*P,A.pulse){let Z=b?.5:(y/1200+A.off)%1;A.pulse.position.lerpVectors(A.a.g.position,A.b.g.position,Z);let ue=Me.focus?Q>.5?1:.1:.55;A.pulse.material.opacity=(b?.4:Math.sin(Math.PI*Z))*ue*P,A.pulse.scale.setScalar(Me.focus&&Q>.5?.075:.05)}}}function kd(){if(!fe.open||!fe.live)return null;let h=fe.screen,y=Math.min(1,1600/Math.max(h.w,h.h)),M=document.createElement("canvas");M.width=Math.max(1,Math.round(h.w*y)),M.height=Math.max(1,Math.round(h.h*y)),M.getContext("2d").drawImage(h.canvas,0,0,M.width,M.height);let P=M.toDataURL("image/jpeg",.85);return{b64:P.slice(P.indexOf(",")+1),url:P,w:M.width,h:M.height}}let Ss=[];function uh(h){Ze(h.c.mesh),Ze(h.x.mesh),l.remove(h.group);for(let M of[h.c,h.x])M.tex.dispose(),M.mesh.geometry.dispose(),M.mesh.material.dispose();let y=Ss.indexOf(h);y>=0&&Ss.splice(y,1)}function dh(h,y,M=!1,P=""){if(!M){let de=t.notes.add(h,P);y=de[de.length-1]?.at??Date.now();let _e=new Set(de.map(Ae=>Ae.at));for(let Ae of[...Ss])_e.has(Ae.at)||uh(Ae)}let A=new Wt,O=rn(.3,.19),Q=rn(.04,.04);{let{ctx:de,w:_e,h:Ae}=O;qn(de,_e,Ae,44),ai(de,"pin",62,66,34,Jt,7),de.font=`600 28px ${Xt}`,wt(de,P?Yn(de,"Pinned \xB7 "+P,_e-140):"Pinned",88,76,28,Jt,600,"left",Xt,"0.02em");let nt=(Tt,Ht)=>(de.font=`500 ${Ht}px ${Kt}`,de.measureText(Tt).width),Te=a.fitLines(h,_e-96,6,34,22,nt),mt=92;for(let Tt of Te.lines)wt(de,Tt,48,mt+=Te.size*1.32,Te.size,Bt,500);O.update(),_d(Q,"close")}Q.mesh.position.set(.135,.08,.004),A.add(O.mesh,Q.mesh),l.add(A);let Z=new Set(Ss.map(de=>de.slot)),ue=0;for(;Z.has(ue);)ue++;let oe={group:A,c:O,x:Q,at:y,text:h,slot:ue};Ss.push(oe),ve(O.mesh,{tap:()=>t.resume?t.resume({text:h,ask:P}):t.speak(h),drag:()=>A}),ve(Q.mesh,{tap:()=>{uh(oe),t.notes.remove(y)}}),ua?fh(oe):A.visible=!1}function fh(h){let y=h.slot,M=st-1.1-y%4*.42,P=.95,A=Math.floor(y/4);h.group.position.set(qe.x-Math.sin(M)*P,qe.y-.05+A*.24-y%2*.05,qe.z-Math.cos(M)*P),q(h.group),h.group.visible=!0}let ua=!1;function Vd(){let h=s?d:o.xr.getCamera();qe.setFromMatrixPosition(h.matrixWorld),ft.setFromRotationMatrix(h.matrixWorld),it.set(0,0,-1).applyQuaternion(ft),Math.hypot(it.x,it.z)>.15&&(st=Math.atan2(-it.x,-it.z))}function Gd(){_.position.set(qe.x-Math.sin(st)*.75,qe.y-.1,qe.z-Math.cos(st)*.75),q(_),_.visible=!0,ua=!0,v=performance.now(),Ss.forEach(fh)}function Hd(h){if(!v||f)return;let y=b?1:m((h-v)/1100),M=b?1:m((h-v-350)/600);N.scale.multiplyScalar(.3+.7*y),V.opacity+=(1-y)*.45;let P=b?1:Math.min(1,(h-v)/1500);ie.visible=P<1,P<1&&(K.opacity=.8*(1-P)*(1-P),ie.scale.setScalar(.9+m(P)*1.6));for(let A of g)A.opacity=M;y>=1&&M>=1&&P>=1&&(f=!0)}let Un=null;function Wd(h){if(at.some(y=>y.press?.drag===_)){Un=null;return}if(!_.userData.placed){let y=a.followTarget({x:qe.x,y:qe.y,z:qe.z,yaw:st},_.position);y&&(Un=y)}if(Un){let y=1-Math.exp(-h*2.6);_.position.x+=(Un.x-_.position.x)*y,_.position.y+=(Un.y-_.position.y)*y,_.position.z+=(Un.z-_.position.z)*y,Math.hypot(Un.x-_.position.x,Un.y-_.position.y,Un.z-_.position.z)<.02&&(Un=null)}q(_)}function bs(){_.userData.placed=!1,Un={x:qe.x-Math.sin(st)*.75,y:qe.y-.1,z:qe.z-Math.cos(st)*.75}}let ph={listening:6220500,thinking:10980346,speaking:16020150};function Xd(h,y){let M=.06+Math.sin(y*1.4)*.02;X.state==="listening"?M=Math.max(.12,X.mic):X.state==="thinking"?M=.28:X.state==="speaking"&&(M=.34+.36*Math.abs(Math.sin(y*7.3)*Math.sin(y*3.1+1))),X.energy+=(M-X.energy)*Math.min(1,h*8),X.think+=((X.state==="thinking"?1:0)-X.think)*Math.min(1,h*3),R.uniforms.uTime.value=y,R.uniforms.uEnergy.value=X.energy,R.uniforms.uThink.value=X.think;let P=(1+Math.sin(y*1.7)*.012+X.energy*.1)*(X.hovered?1.06:1)*(1+Nn.grow*.45);N.scale.setScalar(P),V.opacity=.1+X.energy*.36,V.color.setHex(ph[X.state]||w),G.scale.setScalar(.4+X.energy*.12);let A=X.state==="listening"||X.state==="thinking";$.opacity+=((A?.6:0)-$.opacity)*Math.min(1,h*6),$.color.setHex(ph[X.state]||6220500),z.rotation.z-=h*(X.state==="thinking"?4:.8),z.scale.setScalar(1+(X.state==="listening"?X.mic*.25:0)),qd(h,y)}let da=(()=>{let h=u(new Ri(.008,1)),y=u(new hn({color:6220500,transparent:!0,opacity:0,depthWrite:!1,blending:An})),M=[];for(let P of[-1,1])for(let A=0;A<4;A++){let O=new bt(h,y);O.position.set(P*(.142+A*.016),0,.01),O.userData={k:A,phase:Math.random()*6,h:.004},O.scale.y=.004,_.add(O),M.push(O)}return{bars:M,mat:y}})();function qd(h,y){let M=X.state==="listening";if(da.mat.opacity+=((M?.9:0)-da.mat.opacity)*Math.min(1,h*8),!(da.mat.opacity<.01))for(let P of da.bars){let{k:A,phase:O}=P.userData,Q=b?.6:.55+.45*Math.abs(Math.sin(y*(7+A*1.7)+O)),Z=M?.006+X.mic*.07*(1-A*.18)*Q:.004;P.userData.h+=(Z-P.userData.h)*Math.min(1,h*14),P.scale.y=Math.max(.004,P.userData.h)}}function Rl(){let h=X.state;h==="listening"?ye.set("done","Done"):h==="speaking"?ye.set("quiet","Quiet"):h==="thinking"?ye.set("think","Working"):ye.set("mic","Talk");let y=!!t.calling?.();y!==ae.shown&&(ae.shown=y,se()),Rt.setOn(J.open),Mt.setOn(fe.open);let M=ys&&(h===""||h==="listening")&&!!t.ready?.();for(let P of fn)P.c.mesh.visible=M}let mh=performance.now(),gh=0,_h=0,xh=!1,vh=0,yh=new Map;o.setAnimationLoop(()=>{let h=performance.now(),y=Math.min(.05,(h-mh)/1e3);mh=h,gh+=y,_h++,s&&(d.rotation.set(we,Ge,0,"YXZ"),d.updateMatrixWorld()),Vd(),!ua&&_h>3&&Gd(),ua&&Wd(y),Xd(y,gh),Hd(h),zd(y,h),Nd(y,h),Fd(h),Bd(h);for(let M of at){if(!We(M))continue;let P=M.hit,A=P?.object.userData.ui||null;A!==M.hover&&(M.hover?.hover?.(!1),A?.hover?.(!0),A&&Lt(M,.12,10),M.hover=A),M.dot.visible=!!P,P&&(M.dot.position.copy(P.point).addScaledVector(M.dir,-.003),M.dot.lookAt(M.origin)),M.line&&(M.line.scale.z=P?P.distance:1.2);let O=M.press;if(O?.direct)I(M,U),!O.moved&&U.distanceTo(O.start)>.012&&(O.moved=!0),O.moved&&(O.drag.position.copy(U).add(O.offset),q(O.drag));else if(O?.drag){let Z=M.origin.clone().addScaledVector(M.dir,O.dist);!O.moved&&Z.distanceTo(O.start)>.03&&(O.moved=!0),O.moved&&(O.drag.position.copy(Z).add(O.offset),q(O.drag))}let Q=M.source?.gamepad;if(Q){let Z=Q.axes[3]??0;Math.abs(Z)>.45&&A?.scroll&&h-M.scrollAt>140&&(A.scroll(Math.sign(Z)*(Math.abs(Z)>.85?3:1)),M.scrollAt=h);let ue=yh.get(M)||[],oe=!!Q.buttons[4]?.pressed,de=!!Q.buttons[5]?.pressed;oe&&!ue[0]&&Qe(M),!oe&&ue[0]&&k(M,h-(M.holdAt||h)),de&&!ue[1]&&bs(),yh.set(M,[oe,de])}}if(Se)for(let M=0;M<2;M++){let P=o.xr.getHand(M);for(let A of Object.values(P.joints||{}))if(!A.userData.dot){let O=new bt(Se.jointGeo,Se.jointMat);A.add(O),A.userData.dot=O}}if(De.anim){let M=(h-De.t0)/(650*Math.max(1,De.marks.length));or(Math.min(1,M)),M>=1&&(De.anim=!1)}for(let M=ns.length-1;M>=0;M--){let P=ns[M],A=(h-P.t0)/350;P.m.scale.setScalar(1+A*1.6),P.m.material.opacity=Math.max(0,.9*(1-A)),A>=1&&(l.remove(P.m),P.m.material.dispose(),ns.splice(M,1))}h-vh>200&&(vh=h,Rl()),o.render(l,d)});let is=null;if(s){ge=!0,is=document.createElement("div"),is.setAttribute("role","status"),Object.assign(is.style,{position:"fixed",top:"max(12px, env(safe-area-inset-top))",left:"50%",transform:"translateX(-50%)",zIndex:"2147483001",display:"flex",flexWrap:"wrap",justifyContent:"center",gap:"8px 10px",alignItems:"center",padding:"8px 8px 8px 16px",borderRadius:"24px",background:"rgba(18,20,27,.9)",color:Bt,font:`500 14px ${Kt}`,border:"1px solid rgba(255,255,255,.14)",width:"max-content",maxWidth:"calc(100vw - 32px)",boxSizing:"border-box"});let h=document.createElement("span");h.textContent="3D preview \xB7 click the orb to talk, drag to look",Object.assign(h.style,{color:Jt,textAlign:"center",flex:"1 1 auto"});let y=(M,P)=>{let A=document.createElement("button");return A.type="button",A.textContent=M,Object.assign(A.style,{font:`600 14px ${Kt}`,color:Bt,background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.12)",borderRadius:"999px",padding:"8px 14px",cursor:"pointer",whiteSpace:"nowrap"}),A.onclick=P,A};is.append(h,y("Talk",()=>t.tapOrb()),y("Photos",He),y("My PC",Le),y("Pin",me),y("Style",ke),y("Leave",()=>ur())),ce=document.createElement("span"),ce.setAttribute("aria-live","polite"),Object.assign(ce.style,{position:"absolute",width:"1px",height:"1px",overflow:"hidden",clip:"rect(0 0 0 0)",whiteSpace:"nowrap"}),is.append(ce),document.body.appendChild(is)}else xe(e,"end",()=>ur());function ur(){if(!xh){if(xh=!0,Ms(),Ne(),Sl(),Tl(),Al(),clearTimeout(Ve),o.setAnimationLoop(null),!s)try{e.end()}catch{}for(let h of ne)try{h()}catch{}is?.remove(),c.remove(),l.traverse(h=>{h.geometry?.dispose?.();let y=h.material;if(y)for(let M of Array.isArray(y)?y:[y])M.map?.dispose?.(),M.dispose?.()});for(let h of p)try{h.dispose?.()}catch{}o.dispose(),t.exited()}}return ee(),Ln(),{orb(h){let y=h||"";y!==X.state&&(X.state=y,y==="listening"&&(X.hint="",X.stage=""),y===""&&(X.stage=""),ee(),Rl())},heard(h){let y=String(h||"");y!==X.you&&(X.you=y,y&&y!=="\u2026"&&(X.reply=""),X.hint="",ee())},said(h){let y=String(h||"");!y||y===X.reply||(X.reply=y,X.stage="",ee())},line(h,y,M){let P=String(y||"");P&&(h==="me"?(X.you=P,X.reply="",X.hint="",ys&&na()):h==="izuki"&&(M?.thinking?X.stage=P:(X.reply=P,X.stage="")),ee())},level(h){X.mic=Math.max(0,Math.min(1,Number(h)||0))},showLook:lr,lookShown:()=>De.group.visible,pin:dh,comeHere:bs,pcOpen:la,pcTarget:()=>fe.open?fe.target:null,pcClose:Ms,pcShown:()=>fe.open,pcFrame:kd,filesOpen:jt,filesClose:Ne,webSearch:yd,webClose:Sl,webShown:()=>pe.open,holoBuilding:Cd,holoShow:Id,holoFocus:Ld,holoClose:Tl,holoShown:()=>Me.open,dreamShow:Dd,dreamClose:Al,dreamShown:()=>!!bn.group,timerStart:Ud,timerStop:Cl,breathe:Od,breatheStop:()=>ch(""),nextTheme:D,notice:vt,stop:ur}}function R_(i,e){let t={uLow:{value:new Ye},uMid:{value:new Ye},uTop:{value:new Ye},uBand:{value:new Ye},uBandAmt:{value:0}},n=new bt(new ti(40,48,24),new tn({side:un,depthWrite:!1,uniforms:t,vertexShader:"varying vec3 vW; void main(){ vW = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`varying vec3 vW;
      uniform vec3 uLow; uniform vec3 uMid; uniform vec3 uTop; uniform vec3 uBand; uniform float uBandAmt;
      void main(){
        float h = vW.y;
        vec3 c = h < 0.0 ? mix(uMid, uLow, clamp(-h * 2.5, 0.0, 1.0)) : mix(uMid, uTop, clamp(h * 1.6, 0.0, 1.0));
        // The horizon glow: brightest at eye level, fading up and down.
        c += uBand * exp(-abs(h) * 7.0) * uBandAmt;
        gl_FragColor = vec4(c, 1.0);
      }`}));n.renderOrder=-10,i.add(n);let s=320,r=new Float32Array(s*3);for(let v=0;v<s;v++){let b=Math.random()*Math.PI*2,m=Math.random()*.85+.12,f=30;r[v*3]=Math.cos(b)*Math.sqrt(1-m*m)*f,r[v*3+1]=m*f,r[v*3+2]=Math.sin(b)*Math.sqrt(1-m*m)*f}let a=new ds(new Ct().setAttribute("position",new rt(r,3)),new Hi({color:14674165,size:.05,transparent:!0,opacity:.5,depthWrite:!1}));i.add(a);let o=document.createElement("canvas");o.width=o.height=2048;let c=o.getContext("2d"),l=1024,d=1024/3.2,p=c.createRadialGradient(l,l,0,l,l,1024);p.addColorStop(0,"rgba(255,255,255,0.10)"),p.addColorStop(.5,"rgba(255,255,255,0.03)"),p.addColorStop(1,"rgba(255,255,255,0)"),c.fillStyle=p,c.fillRect(0,0,2048,2048);for(let v=.4;v<=3.2+1e-6;v+=.4){let b=v/3.2;c.beginPath(),c.arc(l,l,v*d,0,Math.PI*2),c.lineWidth=2.2-b,c.strokeStyle=`rgba(255,255,255,${(.34*(1-b)+.04).toFixed(3)})`,c.stroke()}let u=new fs(o);u.colorSpace=ln,u.anisotropy=sh;let g=new bt(new ps(3.2,128),new hn({map:u,transparent:!0,depthWrite:!1}));return g.rotation.x=-Math.PI/2,g.position.y=e,i.add(g),{set(v){t.uLow.value.setRGB(...v.low),t.uMid.value.setRGB(...v.mid),t.uTop.value.setRGB(...v.top),t.uBand.value.setRGB(...v.band),t.uBandAmt.value=v.bandAmt,a.material.opacity=v.stars,a.visible=v.stars>.02,g.material.color.setRGB(...v.floor)}}}var ta=[{name:"Nova",orb:[[.18,.83,.75],[.55,.36,.96],[.96,.45,.71]],halo:8246268,low:[.008,.01,.014],mid:[.03,.036,.05],top:[.012,.014,.022],band:[.08,.2,.2],bandAmt:.55,stars:.5,floor:[.6,1,.95]},{name:"Midnight",orb:[[.25,.5,1],[.4,.75,1],[.75,.85,1]],halo:9684477,low:[.006,.01,.02],mid:[.02,.04,.08],top:[.008,.014,.03],band:[.1,.16,.32],bandAmt:.6,stars:.6,floor:[.7,.82,1]},{name:"Aurora",orb:[[.25,.92,.6],[.2,.75,.9],[.55,.45,.95]],halo:7268279,low:[.006,.012,.012],mid:[.02,.045,.045],top:[.01,.018,.022],band:[.08,.3,.18],bandAmt:.7,stars:.5,floor:[.6,1,.8]},{name:"Dawn",orb:[[1,.7,.52],[.92,.55,.62],[1,.86,.66]],halo:16701354,low:[.012,.009,.01],mid:[.06,.04,.045],top:[.02,.016,.026],band:[.32,.16,.1],bandAmt:.55,stars:.2,floor:[1,.85,.75]},{name:"Pearl",light:!0,orb:[[.86,.88,.96],[.7,.76,.92],[.94,.88,.92]],halo:14870768,low:[.42,.44,.48],mid:[.66,.68,.73],top:[.8,.81,.85],band:[.06,.06,.07],bandAmt:.4,stars:0,floor:[.2,.22,.28]}];export{Jy as start};
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
