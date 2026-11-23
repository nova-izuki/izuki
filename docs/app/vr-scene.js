// Izuki in VR, the 3D room: built from vr-scene.src.js by tools/build-vr.cjs. Includes three.js (MIT, notice at the end).
var Ou=0,qc=1,Bu=2;var ca=1,zu=2,mr=3,hs=0,_n=1,zn=2,bi=0,us=1,on=2,Yc=3,Zc=4,ku=5;var Rs=100,Vu=101,Gu=102,Hu=103,Wu=104,Xu=200,qu=201,Yu=202,Zu=203,$c=204,Jc=205,$u=206,Ju=207,Ku=208,ju=209,Qu=210,ed=211,td=212,nd=213,id=214,po=0,mo=1,go=2,nr=3,_o=4,xo=5,vo=6,yo=7,nl=0,sd=1,rd=2,ui=0,Kc=1,jc=2,Qc=3,eh=4,th=5,nh=6,ih=7;var sh=300,ds=301,Ps=302,il=303,sl=304,ha=306,Mo=1e3,xi=1001,So=1002,gn=1003,ad=1004;var ua=1005;var wn=1006,rl=1007;var fs=1008;var kn=1009,rh=1010,ah=1011,gr=1012,al=1013,di=1014,fi=1015,pi=1016,ol=1017,ll=1018,_r=1020,oh=35902,lh=35899,ch=1021,hh=1022,ti=1023,vi=1026,ps=1027,uh=1028,cl=1029,ms=1030,hl=1031;var ul=1033,da=33776,fa=33777,pa=33778,ma=33779,dl=35840,fl=35841,pl=35842,ml=35843,gl=36196,_l=37492,xl=37496,vl=37488,yl=37489,ga=37490,Ml=37491,Sl=37808,bl=37809,wl=37810,Tl=37811,Al=37812,El=37813,Cl=37814,Rl=37815,Pl=37816,Il=37817,Ll=37818,Dl=37819,Nl=37820,Ul=37821,Fl=36492,Ol=36494,Bl=36495,zl=36283,kl=36284,_a=36285,Vl=36286;var zr=2300,bo=2301,ho=2302,Fc=2303,Oc=2400,Bc=2401,zc=2402;var od=3200;var Gl=0,ld=1,Gi="",hn="srgb",kr="srgb-linear",Vr="linear",Rt="srgb";var uo=7680;var cd=519,hd=512,ud=513,dd=514,Hl=515,fd=516,pd=517,Wl=518,md=519,dh=35044;var fh="300 es",oi=2e3,ir=2001;function Vf(i){for(let e=i.length-1;e>=0;--e)if(i[e]>=65535)return!0;return!1}function Gf(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}function sr(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function gd(){let i=sr("canvas");return i.style.display="block",i}var tu={},rr=null;function Gr(...i){let e="THREE."+i.shift();rr?rr("log",e,...i):console.log(e,...i)}function _d(i){let e=i[0];if(typeof e=="string"&&e.startsWith("TSL:")){let t=i[1];t&&t.isStackTrace?i[0]+=" "+t.getLocation():i[1]='Stack trace not available. Enable "THREE.Node.captureStackTrace" to capture stack traces.'}return i}function je(...i){i=_d(i);let e="THREE."+i.shift();if(rr)rr("warn",e,...i);else{let t=i[0];t&&t.isStackTrace?console.warn(t.getError(e)):console.warn(e,...i)}}function Qe(...i){i=_d(i);let e="THREE."+i.shift();if(rr)rr("error",e,...i);else{let t=i[0];t&&t.isStackTrace?console.error(t.getError(e)):console.error(e,...i)}}function bs(...i){let e=i.join(" ");e in tu||(tu[e]=!0,je(...i))}function xd(i,e,t){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(e,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}var vd={[po]:mo,[go]:vo,[_o]:yo,[nr]:xo,[mo]:po,[vo]:go,[yo]:_o,[xo]:nr},yi=class{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){let n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){let n=this._listeners;if(n===void 0)return;let s=n[e];if(s!==void 0){let r=s.indexOf(t);r!==-1&&s.splice(r,1)}}dispatchEvent(e){let t=this._listeners;if(t===void 0)return;let n=t[e.type];if(n!==void 0){e.target=this;let s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,e);e.target=null}}},An=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];var lc=Math.PI/180,wo=180/Math.PI;function Ki(){let i=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(An[i&255]+An[i>>8&255]+An[i>>16&255]+An[i>>24&255]+"-"+An[e&255]+An[e>>8&255]+"-"+An[e>>16&15|64]+An[e>>24&255]+"-"+An[t&63|128]+An[t>>8&255]+"-"+An[t>>16&255]+An[t>>24&255]+An[n&255]+An[n>>8&255]+An[n>>16&255]+An[n>>24&255]).toLowerCase()}function xt(i,e,t){return Math.max(e,Math.min(t,i))}function Hf(i,e){return(i%e+e)%e}function cc(i,e,t){return(1-t)*i+t*e}function _i(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:case Uint8ClampedArray:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("THREE.MathUtils: Invalid component type.")}}function Nt(i,e){switch(e.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:case Uint8ClampedArray:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("THREE.MathUtils: Invalid component type.")}}var vh=class vh{constructor(e=0,t=0){this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("THREE.Vector2: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("THREE.Vector2: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){let t=this.x,n=this.y,s=e.elements;return this.x=s[0]*t+s[3]*n+s[6],this.y=s[1]*t+s[4]*n+s[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=xt(this.x,e.x,t.x),this.y=xt(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=xt(this.x,e,t),this.y=xt(this.y,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(xt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(xt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){let n=Math.cos(t),s=Math.sin(t),r=this.x-e.x,a=this.y-e.y;return this.x=r*n-a*s+e.x,this.y=r*s+a*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}};vh.prototype.isVector2=!0;var Oe=vh,Qn=class{constructor(e=0,t=0,n=0,s=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=s}static slerpFlat(e,t,n,s,r,a,o){let l=n[s+0],c=n[s+1],d=n[s+2],m=n[s+3],u=r[a+0],f=r[a+1],x=r[a+2],b=r[a+3];if(m!==b||l!==u||c!==f||d!==x){let g=l*u+c*f+d*x+m*b;g<0&&(u=-u,f=-f,x=-x,b=-b,g=-g);let p=1-o;if(g<.9995){let A=Math.acos(g),D=Math.sin(A);p=Math.sin(p*A)/D,o=Math.sin(o*A)/D,l=l*p+u*o,c=c*p+f*o,d=d*p+x*o,m=m*p+b*o}else{l=l*p+u*o,c=c*p+f*o,d=d*p+x*o,m=m*p+b*o;let A=1/Math.sqrt(l*l+c*c+d*d+m*m);l*=A,c*=A,d*=A,m*=A}}e[t]=l,e[t+1]=c,e[t+2]=d,e[t+3]=m}static multiplyQuaternionsFlat(e,t,n,s,r,a){let o=n[s],l=n[s+1],c=n[s+2],d=n[s+3],m=r[a],u=r[a+1],f=r[a+2],x=r[a+3];return e[t]=o*x+d*m+l*f-c*u,e[t+1]=l*x+d*u+c*m-o*f,e[t+2]=c*x+d*f+o*u-l*m,e[t+3]=d*x-o*m-l*u-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,s){return this._x=e,this._y=t,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){let n=e._x,s=e._y,r=e._z,a=e._order,o=Math.cos,l=Math.sin,c=o(n/2),d=o(s/2),m=o(r/2),u=l(n/2),f=l(s/2),x=l(r/2);switch(a){case"XYZ":this._x=u*d*m+c*f*x,this._y=c*f*m-u*d*x,this._z=c*d*x+u*f*m,this._w=c*d*m-u*f*x;break;case"YXZ":this._x=u*d*m+c*f*x,this._y=c*f*m-u*d*x,this._z=c*d*x-u*f*m,this._w=c*d*m+u*f*x;break;case"ZXY":this._x=u*d*m-c*f*x,this._y=c*f*m+u*d*x,this._z=c*d*x+u*f*m,this._w=c*d*m-u*f*x;break;case"ZYX":this._x=u*d*m-c*f*x,this._y=c*f*m+u*d*x,this._z=c*d*x-u*f*m,this._w=c*d*m+u*f*x;break;case"YZX":this._x=u*d*m+c*f*x,this._y=c*f*m+u*d*x,this._z=c*d*x-u*f*m,this._w=c*d*m-u*f*x;break;case"XZY":this._x=u*d*m-c*f*x,this._y=c*f*m-u*d*x,this._z=c*d*x+u*f*m,this._w=c*d*m+u*f*x;break;default:je("Quaternion: .setFromEuler() encountered an unknown order: "+a)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){let n=t/2,s=Math.sin(n);return this._x=e.x*s,this._y=e.y*s,this._z=e.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){let t=e.elements,n=t[0],s=t[4],r=t[8],a=t[1],o=t[5],l=t[9],c=t[2],d=t[6],m=t[10],u=n+o+m;if(u>0){let f=.5/Math.sqrt(u+1);this._w=.25/f,this._x=(d-l)*f,this._y=(r-c)*f,this._z=(a-s)*f}else if(n>o&&n>m){let f=2*Math.sqrt(1+n-o-m);this._w=(d-l)/f,this._x=.25*f,this._y=(s+a)/f,this._z=(r+c)/f}else if(o>m){let f=2*Math.sqrt(1+o-n-m);this._w=(r-c)/f,this._x=(s+a)/f,this._y=.25*f,this._z=(l+d)/f}else{let f=2*Math.sqrt(1+m-n-o);this._w=(a-s)/f,this._x=(r+c)/f,this._y=(l+d)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(xt(this.dot(e),-1,1)))}rotateTowards(e,t){let n=this.angleTo(e);if(n===0)return this;let s=Math.min(1,t/n);return this.slerp(e,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=t._x,l=t._y,c=t._z,d=t._w;return this._x=n*d+a*o+s*c-r*l,this._y=s*d+a*l+r*o-n*c,this._z=r*d+a*c+n*l-s*o,this._w=a*d-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(e,t){let n=e._x,s=e._y,r=e._z,a=e._w,o=this.dot(e);o<0&&(n=-n,s=-s,r=-r,a=-a,o=-o);let l=1-t;if(o<.9995){let c=Math.acos(o),d=Math.sin(c);l=Math.sin(l*c)/d,t=Math.sin(t*c)/d,this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this._onChangeCallback()}else this._x=this._x*l+n*t,this._y=this._y*l+s*t,this._z=this._z*l+r*t,this._w=this._w*l+a*t,this.normalize();return this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){let e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(e),s*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},yh=class yh{constructor(e=0,t=0,n=0){this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("THREE.Vector3: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("THREE.Vector3: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(nu.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(nu.setFromAxisAngle(e,t))}applyMatrix3(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*s,this.y=r[1]*t+r[4]*n+r[7]*s,this.z=r[2]*t+r[5]*n+r[8]*s,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=e.elements,a=1/(r[3]*t+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*t+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*t+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(e){let t=this.x,n=this.y,s=this.z,r=e.x,a=e.y,o=e.z,l=e.w,c=2*(a*s-o*n),d=2*(o*t-r*s),m=2*(r*n-a*t);return this.x=t+l*c+a*m-o*d,this.y=n+l*d+o*c-r*m,this.z=s+l*m+r*d-a*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){let t=this.x,n=this.y,s=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*s,this.y=r[1]*t+r[5]*n+r[9]*s,this.z=r[2]*t+r[6]*n+r[10]*s,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=xt(this.x,e.x,t.x),this.y=xt(this.y,e.y,t.y),this.z=xt(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=xt(this.x,e,t),this.y=xt(this.y,e,t),this.z=xt(this.z,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(xt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){let n=e.x,s=e.y,r=e.z,a=t.x,o=t.y,l=t.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(e){let t=e.lengthSq();if(t===0)return this.set(0,0,0);let n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return hc.copy(this).projectOnVector(e),this.sub(hc)}reflect(e){return this.sub(hc.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){let t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;let n=this.dot(e)/t;return Math.acos(xt(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){let t=this.x-e.x,n=this.y-e.y,s=this.z-e.z;return t*t+n*n+s*s}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){let s=Math.sin(t)*e;return this.x=s*Math.sin(n),this.y=Math.cos(t)*e,this.z=s*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){let t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),s=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=s,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}};yh.prototype.isVector3=!0;var N=yh,hc=new N,nu=new Qn,Mh=class Mh{constructor(e,t,n,s,r,a,o,l,c){this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c)}set(e,t,n,s,r,a,o,l,c){let d=this.elements;return d[0]=e,d[1]=s,d[2]=o,d[3]=t,d[4]=r,d[5]=l,d[6]=n,d[7]=a,d[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){let t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],d=n[4],m=n[7],u=n[2],f=n[5],x=n[8],b=s[0],g=s[3],p=s[6],A=s[1],D=s[4],T=s[7],P=s[2],R=s[5],U=s[8];return r[0]=a*b+o*A+l*P,r[3]=a*g+o*D+l*R,r[6]=a*p+o*T+l*U,r[1]=c*b+d*A+m*P,r[4]=c*g+d*D+m*R,r[7]=c*p+d*T+m*U,r[2]=u*b+f*A+x*P,r[5]=u*g+f*D+x*R,r[8]=u*p+f*T+x*U,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],d=e[8];return t*a*d-t*o*c-n*r*d+n*o*l+s*r*c-s*a*l}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],d=e[8],m=d*a-o*c,u=o*l-d*r,f=c*r-a*l,x=t*m+n*u+s*f;if(x===0)return this.set(0,0,0,0,0,0,0,0,0);let b=1/x;return e[0]=m*b,e[1]=(s*c-d*n)*b,e[2]=(o*n-s*a)*b,e[3]=u*b,e[4]=(d*t-s*l)*b,e[5]=(s*r-o*t)*b,e[6]=f*b,e[7]=(n*l-c*t)*b,e[8]=(a*t-n*r)*b,this}transpose(){let e,t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){let t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,s,r,a,o){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+e,-s*c,s*l,-s*(-c*a+l*o)+o+t,0,0,1),this}scale(e,t){return bs("Matrix3: .scale() is deprecated. Use .makeScale() instead."),this.premultiply(uc.makeScale(e,t)),this}rotate(e){return bs("Matrix3: .rotate() is deprecated. Use .makeRotation() instead."),this.premultiply(uc.makeRotation(-e)),this}translate(e,t){return bs("Matrix3: .translate() is deprecated. Use .makeTranslation() instead."),this.premultiply(uc.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<9;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}};Mh.prototype.isMatrix3=!0;var st=Mh,uc=new st,iu=new st().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),su=new st().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function Wf(){let i={enabled:!0,workingColorSpace:kr,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===Rt&&(s.r=Oi(s.r),s.g=Oi(s.g),s.b=Oi(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===Rt&&(s.r=tr(s.r),s.g=tr(s.g),s.b=tr(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Gi?Vr:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return bs("ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return bs("ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[kr]:{primaries:e,whitePoint:n,transfer:Vr,toXYZ:iu,fromXYZ:su,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:hn},outputColorSpaceConfig:{drawingBufferColorSpace:hn}},[hn]:{primaries:e,whitePoint:n,transfer:Rt,toXYZ:iu,fromXYZ:su,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:hn}}}),i}var yt=Wf();function Oi(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function tr(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var Os,To=class{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{Os===void 0&&(Os=sr("canvas")),Os.width=e.width,Os.height=e.height;let s=Os.getContext("2d");e instanceof ImageData?s.putImageData(e,0,0):s.drawImage(e,0,0,e.width,e.height),n=Os}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){let t=sr("canvas");t.width=e.width,t.height=e.height;let n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);let s=n.getImageData(0,0,e.width,e.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=Oi(r[a]/255)*255;return n.putImageData(s,0,0),t}else if(e.data){let t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(Oi(t[n]/255)*255):t[n]=Oi(t[n]);return{data:t,width:e.width,height:e.height}}else return je("ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}},Xf=0,ar=class{constructor(e=null){this.isTextureSource=!0,Object.defineProperty(this,"id",{value:Xf++}),this.uuid=Ki(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){let t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):typeof VideoFrame<"u"&&t instanceof VideoFrame?e.set(t.displayWidth,t.displayHeight,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(dc(s[a].image)):r.push(dc(s[a]))}else r=dc(s);n.url=r}return t||(e.images[this.uuid]=n),n}};function dc(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?To.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(je("Texture: Unable to serialize Texture."),{})}var qf=0,fc=new N,Rn=class i extends yi{constructor(e=i.DEFAULT_IMAGE,t=i.DEFAULT_MAPPING,n=xi,s=xi,r=wn,a=fs,o=ti,l=kn,c=i.DEFAULT_ANISOTROPY,d=Gi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:qf++}),this.uuid=Ki(),this.name="",this.source=new ar(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Oe(0,0),this.repeat=new Oe(1,1),this.center=new Oe(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new st,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=d,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0,this.normalized=!1}get width(){return this.source.getSize(fc).x}get height(){return this.source.getSize(fc).y}get depth(){return this.source.getSize(fc).z}get image(){return this.source.data}set image(e){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.normalized=e.normalized,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(let t in e){let n=e[t];if(n===void 0){je(`Texture.setValues(): parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){je(`Texture.setValues(): property '${t}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,normalized:this.normalized,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==sh)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Mo:e.x=e.x-Math.floor(e.x);break;case xi:e.x=e.x<0?0:1;break;case So:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Mo:e.y=e.y-Math.floor(e.y);break;case xi:e.y=e.y<0?0:1;break;case So:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}};Rn.DEFAULT_IMAGE=null;Rn.DEFAULT_MAPPING=sh;Rn.DEFAULT_ANISOTROPY=1;var Sh=class Sh{constructor(e=0,t=0,n=0,s=1){this.x=e,this.y=t,this.z=n,this.w=s}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,s){return this.x=e,this.y=t,this.z=n,this.w=s,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("THREE.Vector4: index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("THREE.Vector4: index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){let t=this.x,n=this.y,s=this.z,r=this.w,a=e.elements;return this.x=a[0]*t+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*t+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*t+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*t+a[7]*n+a[11]*s+a[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);let t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,s,r,l=e.elements,c=l[0],d=l[4],m=l[8],u=l[1],f=l[5],x=l[9],b=l[2],g=l[6],p=l[10];if(Math.abs(d-u)<.01&&Math.abs(m-b)<.01&&Math.abs(x-g)<.01){if(Math.abs(d+u)<.1&&Math.abs(m+b)<.1&&Math.abs(x+g)<.1&&Math.abs(c+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;let D=(c+1)/2,T=(f+1)/2,P=(p+1)/2,R=(d+u)/4,U=(m+b)/4,_=(x+g)/4;return D>T&&D>P?D<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(D),s=R/n,r=U/n):T>P?T<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(T),n=R/s,r=_/s):P<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(P),n=U/r,s=_/r),this.set(n,s,r,t),this}let A=Math.sqrt((g-x)*(g-x)+(m-b)*(m-b)+(u-d)*(u-d));return Math.abs(A)<.001&&(A=1),this.x=(g-x)/A,this.y=(m-b)/A,this.z=(u-d)/A,this.w=Math.acos((c+f+p-1)/2),this}setFromMatrixPosition(e){let t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=xt(this.x,e.x,t.x),this.y=xt(this.y,e.y,t.y),this.z=xt(this.z,e.z,t.z),this.w=xt(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=xt(this.x,e,t),this.y=xt(this.y,e,t),this.z=xt(this.z,e,t),this.w=xt(this.w,e,t),this}clampLength(e,t){let n=this.length();return this.divideScalar(n||1).multiplyScalar(xt(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}};Sh.prototype.isVector4=!0;var Yt=Sh,Ao=class extends yi{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:wn,depthBuffer:!0,stencilBuffer:!1,resolveColorBuffer:!0,resolveDepthBuffer:!0,resolveStencilBuffer:!0,storeMultisampledColorBuffer:!0,storeMultisampledDepthBuffer:!0,storeMultisampledStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1,useArrayDepthTexture:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new Yt(0,0,e,t),this.scissorTest=!1,this.viewport=new Yt(0,0,e,t),this.textures=[];let s={width:e,height:t,depth:n.depth},r=new Rn(s),a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveColorBuffer=n.resolveColorBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this.storeMultisampledColorBuffer=n.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=n.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=n.storeMultisampledStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview,this.useArrayDepthTexture=n.useArrayDepthTexture}_setTextureOptions(e={}){let t={minFilter:wn,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&this._depthTexture.renderTarget===this&&(this._depthTexture.renderTarget=null),e!==null&&e.renderTarget===null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=e,this.textures[s].image.height=t,this.textures[s].image.depth=n,this.textures[s].isData3DTexture!==!0&&(this.textures[s].isArrayTexture=this.textures[s].image.depth>1);this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;let s=Object.assign({},e.textures[t].image);this.textures[t].source=new ar(s)}if(this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveColorBuffer=e.resolveColorBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,this.storeMultisampledColorBuffer=e.storeMultisampledColorBuffer,this.storeMultisampledDepthBuffer=e.storeMultisampledDepthBuffer,this.storeMultisampledStencilBuffer=e.storeMultisampledStencilBuffer,e.depthTexture!==null)if(e.depthTexture.renderTarget===e){let t=e.depthTexture.clone();t.renderTarget=null,this.depthTexture=t}else this.depthTexture=e.depthTexture;return this.samples=e.samples,this.multiview=e.multiview,this.useArrayDepthTexture=e.useArrayDepthTexture,this}dispose(){this.dispatchEvent({type:"dispose"})}},Bn=class extends Ao{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}},Hr=class extends Rn{constructor(e=null,t=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=gn,this.minFilter=gn,this.wrapR=xi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}};var Eo=class extends Rn{constructor(e=null,t=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:s},this.magFilter=gn,this.minFilter=gn,this.wrapR=xi,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}copy(e){return super.copy(e),this.wrapR=e.wrapR,this}};var tl=class tl{constructor(e,t,n,s,r,a,o,l,c,d,m,u,f,x,b,g){this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,s,r,a,o,l,c,d,m,u,f,x,b,g)}set(e,t,n,s,r,a,o,l,c,d,m,u,f,x,b,g){let p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=s,p[1]=r,p[5]=a,p[9]=o,p[13]=l,p[2]=c,p[6]=d,p[10]=m,p[14]=u,p[3]=f,p[7]=x,p[11]=b,p[15]=g,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new tl().fromArray(this.elements)}copy(e){let t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){let t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){let t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return this.determinantAffine()===0?(e.set(1,0,0),t.set(0,1,0),n.set(0,0,1),this):(e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this)}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){if(e.determinantAffine()===0)return this.identity();let t=this.elements,n=e.elements,s=1/Bs.setFromMatrixColumn(e,0).length(),r=1/Bs.setFromMatrixColumn(e,1).length(),a=1/Bs.setFromMatrixColumn(e,2).length();return t[0]=n[0]*s,t[1]=n[1]*s,t[2]=n[2]*s,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*a,t[9]=n[9]*a,t[10]=n[10]*a,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){let t=this.elements,n=e.x,s=e.y,r=e.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),d=Math.cos(r),m=Math.sin(r);if(e.order==="XYZ"){let u=a*d,f=a*m,x=o*d,b=o*m;t[0]=l*d,t[4]=-l*m,t[8]=c,t[1]=f+x*c,t[5]=u-b*c,t[9]=-o*l,t[2]=b-u*c,t[6]=x+f*c,t[10]=a*l}else if(e.order==="YXZ"){let u=l*d,f=l*m,x=c*d,b=c*m;t[0]=u+b*o,t[4]=x*o-f,t[8]=a*c,t[1]=a*m,t[5]=a*d,t[9]=-o,t[2]=f*o-x,t[6]=b+u*o,t[10]=a*l}else if(e.order==="ZXY"){let u=l*d,f=l*m,x=c*d,b=c*m;t[0]=u-b*o,t[4]=-a*m,t[8]=x+f*o,t[1]=f+x*o,t[5]=a*d,t[9]=b-u*o,t[2]=-a*c,t[6]=o,t[10]=a*l}else if(e.order==="ZYX"){let u=a*d,f=a*m,x=o*d,b=o*m;t[0]=l*d,t[4]=x*c-f,t[8]=u*c+b,t[1]=l*m,t[5]=b*c+u,t[9]=f*c-x,t[2]=-c,t[6]=o*l,t[10]=a*l}else if(e.order==="YZX"){let u=a*l,f=a*c,x=o*l,b=o*c;t[0]=l*d,t[4]=b-u*m,t[8]=x*m+f,t[1]=m,t[5]=a*d,t[9]=-o*d,t[2]=-c*d,t[6]=f*m+x,t[10]=u-b*m}else if(e.order==="XZY"){let u=a*l,f=a*c,x=o*l,b=o*c;t[0]=l*d,t[4]=-m,t[8]=c*d,t[1]=u*m+b,t[5]=a*d,t[9]=f*m-x,t[2]=x*m-f,t[6]=o*d,t[10]=b*m+u}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(Yf,e,Zf)}lookAt(e,t,n){let s=this.elements;return qn.subVectors(e,t),qn.lengthSq()===0&&(qn.z=1),qn.normalize(),qi.crossVectors(n,qn),qi.lengthSq()===0&&(Math.abs(n.z)===1?qn.x+=1e-4:qn.z+=1e-4,qn.normalize(),qi.crossVectors(n,qn)),qi.normalize(),Ba.crossVectors(qn,qi),s[0]=qi.x,s[4]=Ba.x,s[8]=qn.x,s[1]=qi.y,s[5]=Ba.y,s[9]=qn.y,s[2]=qi.z,s[6]=Ba.z,s[10]=qn.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){let n=e.elements,s=t.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],d=n[1],m=n[5],u=n[9],f=n[13],x=n[2],b=n[6],g=n[10],p=n[14],A=n[3],D=n[7],T=n[11],P=n[15],R=s[0],U=s[4],_=s[8],I=s[12],F=s[1],V=s[5],G=s[9],J=s[13],z=s[2],j=s[6],ae=s[10],se=s[14],q=s[3],ne=s[7],de=s[11],xe=s[15];return r[0]=a*R+o*F+l*z+c*q,r[4]=a*U+o*V+l*j+c*ne,r[8]=a*_+o*G+l*ae+c*de,r[12]=a*I+o*J+l*se+c*xe,r[1]=d*R+m*F+u*z+f*q,r[5]=d*U+m*V+u*j+f*ne,r[9]=d*_+m*G+u*ae+f*de,r[13]=d*I+m*J+u*se+f*xe,r[2]=x*R+b*F+g*z+p*q,r[6]=x*U+b*V+g*j+p*ne,r[10]=x*_+b*G+g*ae+p*de,r[14]=x*I+b*J+g*se+p*xe,r[3]=A*R+D*F+T*z+P*q,r[7]=A*U+D*V+T*j+P*ne,r[11]=A*_+D*G+T*ae+P*de,r[15]=A*I+D*J+T*se+P*xe,this}multiplyScalar(e){let t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[12],a=e[1],o=e[5],l=e[9],c=e[13],d=e[2],m=e[6],u=e[10],f=e[14],x=e[3],b=e[7],g=e[11],p=e[15],A=l*f-c*u,D=o*f-c*m,T=o*u-l*m,P=a*f-c*d,R=a*u-l*d,U=a*m-o*d;return t*(b*A-g*D+p*T)-n*(x*A-g*P+p*R)+s*(x*D-b*P+p*U)-r*(x*T-b*R+g*U)}determinantAffine(){let e=this.elements,t=e[0],n=e[4],s=e[8],r=e[1],a=e[5],o=e[9],l=e[2],c=e[6],d=e[10];return t*(a*d-o*c)-n*(r*d-o*l)+s*(r*c-a*l)}transpose(){let e=this.elements,t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){let s=this.elements;return e.isVector3?(s[12]=e.x,s[13]=e.y,s[14]=e.z):(s[12]=e,s[13]=t,s[14]=n),this}invert(){let e=this.elements,t=e[0],n=e[1],s=e[2],r=e[3],a=e[4],o=e[5],l=e[6],c=e[7],d=e[8],m=e[9],u=e[10],f=e[11],x=e[12],b=e[13],g=e[14],p=e[15],A=t*o-n*a,D=t*l-s*a,T=t*c-r*a,P=n*l-s*o,R=n*c-r*o,U=s*c-r*l,_=d*b-m*x,I=d*g-u*x,F=d*p-f*x,V=m*g-u*b,G=m*p-f*b,J=u*p-f*g,z=A*J-D*G+T*V+P*F-R*I+U*_;if(z===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let j=1/z;return e[0]=(o*J-l*G+c*V)*j,e[1]=(s*G-n*J-r*V)*j,e[2]=(b*U-g*R+p*P)*j,e[3]=(u*R-m*U-f*P)*j,e[4]=(l*F-a*J-c*I)*j,e[5]=(t*J-s*F+r*I)*j,e[6]=(g*T-x*U-p*D)*j,e[7]=(d*U-u*T+f*D)*j,e[8]=(a*G-o*F+c*_)*j,e[9]=(n*F-t*G-r*_)*j,e[10]=(x*R-b*T+p*A)*j,e[11]=(m*T-d*R-f*A)*j,e[12]=(o*I-a*V-l*_)*j,e[13]=(t*V-n*I+s*_)*j,e[14]=(b*D-x*P-g*A)*j,e[15]=(d*P-m*D+u*A)*j,this}scale(e){let t=this.elements,n=e.x,s=e.y,r=e.z;return t[0]*=n,t[4]*=s,t[8]*=r,t[1]*=n,t[5]*=s,t[9]*=r,t[2]*=n,t[6]*=s,t[10]*=r,t[3]*=n,t[7]*=s,t[11]*=r,this}getMaxScaleOnAxis(){let e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],s=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,s))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){let t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){let t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){let n=Math.cos(t),s=Math.sin(t),r=1-n,a=e.x,o=e.y,l=e.z,c=r*a,d=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,d*o+n,d*l-s*a,0,c*l-s*o,d*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,s,r,a){return this.set(1,n,r,0,e,1,a,0,t,s,1,0,0,0,0,1),this}compose(e,t,n){let s=this.elements,r=t._x,a=t._y,o=t._z,l=t._w,c=r+r,d=a+a,m=o+o,u=r*c,f=r*d,x=r*m,b=a*d,g=a*m,p=o*m,A=l*c,D=l*d,T=l*m,P=n.x,R=n.y,U=n.z;return s[0]=(1-(b+p))*P,s[1]=(f+T)*P,s[2]=(x-D)*P,s[3]=0,s[4]=(f-T)*R,s[5]=(1-(u+p))*R,s[6]=(g+A)*R,s[7]=0,s[8]=(x+D)*U,s[9]=(g-A)*U,s[10]=(1-(u+b))*U,s[11]=0,s[12]=e.x,s[13]=e.y,s[14]=e.z,s[15]=1,this}decompose(e,t,n){let s=this.elements;e.x=s[12],e.y=s[13],e.z=s[14];let r=this.determinantAffine();if(r===0)return n.set(1,1,1),t.identity(),this;let a=Bs.set(s[0],s[1],s[2]).length(),o=Bs.set(s[4],s[5],s[6]).length(),l=Bs.set(s[8],s[9],s[10]).length();r<0&&(a=-a),ii.copy(this);let c=1/a,d=1/o,m=1/l;return ii.elements[0]*=c,ii.elements[1]*=c,ii.elements[2]*=c,ii.elements[4]*=d,ii.elements[5]*=d,ii.elements[6]*=d,ii.elements[8]*=m,ii.elements[9]*=m,ii.elements[10]*=m,t.setFromRotationMatrix(ii),n.x=a,n.y=o,n.z=l,this}makePerspective(e,t,n,s,r,a,o=oi,l=!1){let c=this.elements,d=2*r/(t-e),m=2*r/(n-s),u=(t+e)/(t-e),f=(n+s)/(n-s),x,b;if(l)x=r/(a-r),b=a*r/(a-r);else if(o===oi)x=-(a+r)/(a-r),b=-2*a*r/(a-r);else if(o===ir)x=-a/(a-r),b=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=d,c[4]=0,c[8]=u,c[12]=0,c[1]=0,c[5]=m,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=x,c[14]=b,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,s,r,a,o=oi,l=!1){let c=this.elements,d=2/(t-e),m=2/(n-s),u=-(t+e)/(t-e),f=-(n+s)/(n-s),x,b;if(l)x=1/(a-r),b=a/(a-r);else if(o===oi)x=-2/(a-r),b=-(a+r)/(a-r);else if(o===ir)x=-1/(a-r),b=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=d,c[4]=0,c[8]=0,c[12]=u,c[1]=0,c[5]=m,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=x,c[14]=b,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){let t=this.elements,n=e.elements;for(let s=0;s<16;s++)if(t[s]!==n[s])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){let n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}};tl.prototype.isMatrix4=!0;var Ut=tl,Bs=new N,ii=new Ut,Yf=new N(0,0,0),Zf=new N(1,1,1),qi=new N,Ba=new N,qn=new N,ru=new Ut,au=new Qn,Bi=class i{constructor(e=0,t=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=s}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,s=this._order){return this._x=e,this._y=t,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){let s=e.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],d=s[9],m=s[2],u=s[6],f=s[10];switch(t){case"XYZ":this._y=Math.asin(xt(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-d,f),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(u,c),this._z=0);break;case"YXZ":this._x=Math.asin(-xt(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-m,r),this._z=0);break;case"ZXY":this._x=Math.asin(xt(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(-m,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-xt(m,-1,1)),Math.abs(m)<.9999999?(this._x=Math.atan2(u,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(xt(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-d,c),this._y=Math.atan2(-m,r)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-xt(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(u,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-d,f),this._y=0);break;default:je("Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return ru.makeRotationFromQuaternion(e),this.setFromRotationMatrix(ru,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return au.setFromEuler(this),this.setFromQuaternion(au,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};Bi.DEFAULT_ORDER="XYZ";var or=class{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}},$f=0,ou=new N,zs=new Qn,Ii=new Ut,za=new N,Rr=new N,Jf=new N,Kf=new Qn,lu=new N(1,0,0),cu=new N(0,1,0),hu=new N(0,0,1),uu={type:"added"},jf={type:"removed"},ks={type:"childadded",child:null},pc={type:"childremoved",child:null},un=class i extends yi{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:$f++}),this.uuid=Ki(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let e=new N,t=new Bi,n=new Qn,s=new N(1,1,1);function r(){n.setFromEuler(t,!1)}function a(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Ut},normalMatrix:{value:new st}}),this.matrix=new Ut,this.matrixWorld=new Ut,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new or,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.static=!1,this.userData={},this.pivot=null}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return zs.setFromAxisAngle(e,t),this.quaternion.multiply(zs),this}rotateOnWorldAxis(e,t){return zs.setFromAxisAngle(e,t),this.quaternion.premultiply(zs),this}rotateX(e){return this.rotateOnAxis(lu,e)}rotateY(e){return this.rotateOnAxis(cu,e)}rotateZ(e){return this.rotateOnAxis(hu,e)}translateOnAxis(e,t){return ou.copy(e).applyQuaternion(this.quaternion),this.position.add(ou.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(lu,e)}translateY(e){return this.translateOnAxis(cu,e)}translateZ(e){return this.translateOnAxis(hu,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(Ii.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?za.copy(e):za.set(e,t,n);let s=this.parent;this.updateWorldMatrix(!0,!1),Rr.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Ii.lookAt(Rr,za,this.up):Ii.lookAt(za,Rr,this.up),this.quaternion.setFromRotationMatrix(Ii),s&&(Ii.extractRotation(s.matrixWorld),zs.setFromRotationMatrix(Ii),this.quaternion.premultiply(zs.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(Qe("Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(uu),ks.child=e,this.dispatchEvent(ks),ks.child=null):Qe("Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(jf),pc.child=e,this.dispatchEvent(pc),pc.child=null),this}removeFromParent(){let e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),Ii.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),Ii.multiply(e.parent.matrixWorld)),e.applyMatrix4(Ii),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(uu),ks.child=e,this.dispatchEvent(ks),ks.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,s=this.children.length;n<s;n++){let a=this.children[n].getObjectByProperty(e,t);if(a!==void 0)return a}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Rr,e,Jf),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Rr,Kf,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);let t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}intersectsFrustum(){}traverse(e){e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].traverseVisible(e)}traverseAncestors(e){let t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale);let e=this.pivot;if(e!==null){let t=e.x,n=e.y,s=e.z,r=this.matrix.elements;r[12]+=t-r[0]*t-r[4]*n-r[8]*s,r[13]+=n-r[1]*t-r[5]*n-r[9]*s,r[14]+=s-r[2]*t-r[6]*n-r[10]*s}this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);let t=this.children;for(let n=0,s=t.length;n<s;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t,n=!1){let s=this.parent;if(e===!0&&s!==null&&s.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||n)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,n=!0),t===!0){let r=this.children;for(let a=0,o=r.length;a<o;a++)r[a].updateWorldMatrix(!1,!0,n)}}toJSON(e){let t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,s.name=this.name,s.castShadow=this.castShadow,s.receiveShadow=this.receiveShadow,s.visible=this.visible,s.frustumCulled=this.frustumCulled,s.renderOrder=this.renderOrder,s.static=this.static,s.matrixAutoUpdate=this.matrixAutoUpdate,Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.pivot!==null&&(s.pivot=this.pivot.toArray()),this.morphTargetDictionary!==void 0&&(s.morphTargetDictionary=Object.assign({},this.morphTargetDictionary)),this.morphTargetInfluences!==void 0&&(s.morphTargetInfluences=this.morphTargetInfluences.slice()),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(e),s.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(e.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,d=l.length;c<d;c++){let m=l[c];r(e.shapes,m)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(e.materials,this.material[l]));s.material=o}else s.material=r(e.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(e).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];s.animations.push(r(e.animations,l))}}if(t){let o=a(e.geometries),l=a(e.materials),c=a(e.textures),d=a(e.images),m=a(e.shapes),u=a(e.skeletons),f=a(e.animations),x=a(e.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),d.length>0&&(n.images=d),m.length>0&&(n.shapes=m),u.length>0&&(n.skeletons=u),f.length>0&&(n.animations=f),x.length>0&&(n.nodes=x)}return n.object=s,n;function a(o){let l=[];for(let c in o){let d=o[c];delete d.metadata,l.push(d)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.pivot=e.pivot!==null?e.pivot.clone():null,this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.static=e.static,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){let s=e.children[n];this.add(s.clone())}return this}dispose(){this.dispatchEvent({type:"dispose"})}};un.DEFAULT_UP=new N(0,1,0);un.DEFAULT_MATRIX_AUTO_UPDATE=!0;un.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var $t=class extends un{constructor(){super(),this.isGroup=!0,this.type="Group"}},Qf={type:"move"},lr=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new $t,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new $t,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new N,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new N),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new $t,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new N,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new N,this._grip.eventsEnabled=!1),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){let t=this._hand;if(t)for(let n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let s=null,r=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){a=!0;for(let b of e.hand.values()){let g=t.getJointPose(b,n),p=this._getHandJoint(c,b);g!==null&&(p.matrix.fromArray(g.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=g.radius),p.visible=g!==null}let d=c.joints["index-finger-tip"],m=c.joints["thumb-tip"],u=d.position.distanceTo(m.position),f=.02,x=.005;c.inputState.pinching&&u>f+x?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&u<=f-x&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1,l.eventsEnabled&&l.dispatchEvent({type:"gripUpdated",data:e,target:this})));o!==null&&(s=t.getPose(e.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Qf)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){let n=new $t;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}},yd={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},Yi={h:0,s:0,l:0},ka={h:0,s:0,l:0};function mc(i,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?i+(e-i)*6*t:t<1/2?e:t<2/3?i+(e-i)*6*(2/3-t):i}var Je=class{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){let s=e;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=hn){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,yt.colorSpaceToWorking(this,t),this}setRGB(e,t,n,s=yt.workingColorSpace){return this.r=e,this.g=t,this.b=n,yt.colorSpaceToWorking(this,s),this}setHSL(e,t,n,s=yt.workingColorSpace){if(e=Hf(e,1),t=xt(t,0,1),n=xt(n,0,1),t===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+t):n+t-n*t,a=2*n-r;this.r=mc(a,r,e+1/3),this.g=mc(a,r,e),this.b=mc(a,r,e-1/3)}return yt.colorSpaceToWorking(this,s),this}setStyle(e,t=hn){function n(r){r!==void 0&&parseFloat(r)<1&&je("Color: Alpha component of "+e+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(e)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:je("Color: Unknown color model "+e)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(e)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(a===6)return this.setHex(parseInt(r,16),t);je("Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=hn){let n=yd[e.toLowerCase()];return n!==void 0?this.setHex(n,t):je("Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=Oi(e.r),this.g=Oi(e.g),this.b=Oi(e.b),this}copyLinearToSRGB(e){return this.r=tr(e.r),this.g=tr(e.g),this.b=tr(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=hn){return yt.workingToColorSpace(En.copy(this),e),Math.round(xt(En.r*255,0,255))*65536+Math.round(xt(En.g*255,0,255))*256+Math.round(xt(En.b*255,0,255))}getHexString(e=hn){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=yt.workingColorSpace){yt.workingToColorSpace(En.copy(this),t);let n=En.r,s=En.g,r=En.b,a=Math.max(n,s,r),o=Math.min(n,s,r),l,c,d=(o+a)/2;if(o===a)l=0,c=0;else{let m=a-o;switch(c=d<=.5?m/(a+o):m/(2-a-o),a){case n:l=(s-r)/m+(s<r?6:0);break;case s:l=(r-n)/m+2;break;case r:l=(n-s)/m+4;break}l/=6}return e.h=l,e.s=c,e.l=d,e}getRGB(e,t=yt.workingColorSpace){return yt.workingToColorSpace(En.copy(this),t),e.r=En.r,e.g=En.g,e.b=En.b,e}getStyle(e=hn){yt.workingToColorSpace(En.copy(this),e);let t=En.r,n=En.g,s=En.b;return e!==hn?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(e,t,n){return this.getHSL(Yi),this.setHSL(Yi.h+e,Yi.s+t,Yi.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(Yi),e.getHSL(ka);let n=cc(Yi.h,ka.h,t),s=cc(Yi.s,ka.s,t),r=cc(Yi.l,ka.l,t);return this.setHSL(n,s,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){let t=this.r,n=this.g,s=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*s,this.g=r[1]*t+r[4]*n+r[7]*s,this.b=r[2]*t+r[5]*n+r[8]*s,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},En=new Je;Je.NAMES=yd;var Wr=class extends un{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Bi,this.environmentIntensity=1,this.environmentRotation=new Bi,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){let t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),t.object.backgroundBlurriness=this.backgroundBlurriness,t.object.backgroundIntensity=this.backgroundIntensity,t.object.backgroundRotation=this.backgroundRotation.toArray(),t.object.environmentIntensity=this.environmentIntensity,t.object.environmentRotation=this.environmentRotation.toArray(),t}},si=new N,Li=new N,gc=new N,Di=new N,Vs=new N,Gs=new N,du=new N,_c=new N,xc=new N,vc=new N,yc=new Yt,Mc=new Yt,Sc=new Yt,Fi=class i{constructor(e=new N,t=new N,n=new N){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,s){s.subVectors(n,t),si.subVectors(e,t),s.cross(si);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(e,t,n,s,r){si.subVectors(s,t),Li.subVectors(n,t),gc.subVectors(e,t);let a=si.dot(si),o=si.dot(Li),l=si.dot(gc),c=Li.dot(Li),d=Li.dot(gc),m=a*c-o*o;if(m===0)return r.set(0,0,0),null;let u=1/m,f=(c*l-o*d)*u,x=(a*d-o*l)*u;return r.set(1-f-x,x,f)}static containsPoint(e,t,n,s){return this.getBarycoord(e,t,n,s,Di)===null?!1:Di.x>=0&&Di.y>=0&&Di.x+Di.y<=1}static getInterpolation(e,t,n,s,r,a,o,l){return this.getBarycoord(e,t,n,s,Di)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Di.x),l.addScaledVector(a,Di.y),l.addScaledVector(o,Di.z),l)}static getInterpolatedAttribute(e,t,n,s,r,a){return yc.setScalar(0),Mc.setScalar(0),Sc.setScalar(0),yc.fromBufferAttribute(e,t),Mc.fromBufferAttribute(e,n),Sc.fromBufferAttribute(e,s),a.setScalar(0),a.addScaledVector(yc,r.x),a.addScaledVector(Mc,r.y),a.addScaledVector(Sc,r.z),a}static isFrontFacing(e,t,n,s){return si.subVectors(n,t),Li.subVectors(e,t),si.cross(Li).dot(s)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,s){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[s]),this}setFromAttributeAndIndices(e,t,n,s){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,s),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return si.subVectors(this.c,this.b),Li.subVectors(this.a,this.b),si.cross(Li).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return i.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return i.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,s,r){return i.getInterpolation(e,this.a,this.b,this.c,t,n,s,r)}containsPoint(e){return i.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return i.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){let n=this.a,s=this.b,r=this.c,a,o;Vs.subVectors(s,n),Gs.subVectors(r,n),_c.subVectors(e,n);let l=Vs.dot(_c),c=Gs.dot(_c);if(l<=0&&c<=0)return t.copy(n);xc.subVectors(e,s);let d=Vs.dot(xc),m=Gs.dot(xc);if(d>=0&&m<=d)return t.copy(s);let u=l*m-d*c;if(u<=0&&l>=0&&d<=0)return a=l/(l-d),t.copy(n).addScaledVector(Vs,a);vc.subVectors(e,r);let f=Vs.dot(vc),x=Gs.dot(vc);if(x>=0&&f<=x)return t.copy(r);let b=f*c-l*x;if(b<=0&&c>=0&&x<=0)return o=c/(c-x),t.copy(n).addScaledVector(Gs,o);let g=d*x-f*m;if(g<=0&&m-d>=0&&f-x>=0)return du.subVectors(r,s),o=(m-d)/(m-d+(f-x)),t.copy(s).addScaledVector(du,o);let p=1/(g+b+u);return a=b*p,o=u*p,t.copy(n).addScaledVector(Vs,a).addScaledVector(Gs,o)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}},ji=class{constructor(e=new N(1/0,1/0,1/0),t=new N(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(ri.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(ri.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){let n=ri.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);let n=e.geometry;if(n!==void 0){let r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)e.isMesh===!0?e.getVertexPosition(a,ri):ri.fromBufferAttribute(r,a),ri.applyMatrix4(e.matrixWorld),this.expandByPoint(ri);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),Va.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Va.copy(n.boundingBox)),Va.applyMatrix4(e.matrixWorld),this.union(Va)}let s=e.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,ri),ri.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Pr),Ga.subVectors(this.max,Pr),Hs.subVectors(e.a,Pr),Ws.subVectors(e.b,Pr),Xs.subVectors(e.c,Pr),Zi.subVectors(Ws,Hs),$i.subVectors(Xs,Ws),vs.subVectors(Hs,Xs);let t=[0,-Zi.z,Zi.y,0,-$i.z,$i.y,0,-vs.z,vs.y,Zi.z,0,-Zi.x,$i.z,0,-$i.x,vs.z,0,-vs.x,-Zi.y,Zi.x,0,-$i.y,$i.x,0,-vs.y,vs.x,0];return!bc(t,Hs,Ws,Xs,Ga)||(t=[1,0,0,0,1,0,0,0,1],!bc(t,Hs,Ws,Xs,Ga))?!1:(Ha.crossVectors(Zi,$i),t=[Ha.x,Ha.y,Ha.z],bc(t,Hs,Ws,Xs,Ga))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,ri).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(ri).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Ni[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Ni[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Ni[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Ni[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Ni[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Ni[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Ni[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Ni[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Ni),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}},Ni=[new N,new N,new N,new N,new N,new N,new N,new N],ri=new N,Va=new ji,Hs=new N,Ws=new N,Xs=new N,Zi=new N,$i=new N,vs=new N,Pr=new N,Ga=new N,Ha=new N,ys=new N;function bc(i,e,t,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){ys.fromArray(i,r);let o=s.x*Math.abs(ys.x)+s.y*Math.abs(ys.y)+s.z*Math.abs(ys.z),l=e.dot(ys),c=t.dot(ys),d=n.dot(ys);if(Math.max(-Math.max(l,c,d),Math.min(l,c,d))>o)return!1}return!0}var an=new N,Wa=new Oe,ep=0,Zn=class extends yi{constructor(e,t,n=!1){if(super(),Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:ep++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=dh,this.updateRanges=[],this.gpuType=fi,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[e+s]=t.array[n+s];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Wa.fromBufferAttribute(this,t),Wa.applyMatrix3(e),this.setXY(t,Wa.x,Wa.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)an.fromBufferAttribute(this,t),an.applyMatrix3(e),this.setXYZ(t,an.x,an.y,an.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)an.fromBufferAttribute(this,t),an.applyMatrix4(e),this.setXYZ(t,an.x,an.y,an.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)an.fromBufferAttribute(this,t),an.applyNormalMatrix(e),this.setXYZ(t,an.x,an.y,an.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)an.fromBufferAttribute(this,t),an.transformDirection(e),this.setXYZ(t,an.x,an.y,an.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=_i(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Nt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=_i(t,this.array)),t}setX(e,t){return this.normalized&&(t=Nt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=_i(t,this.array)),t}setY(e,t){return this.normalized&&(t=Nt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=_i(t,this.array)),t}setZ(e,t){return this.normalized&&(t=Nt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=_i(t,this.array)),t}setW(e,t){return this.normalized&&(t=Nt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=Nt(t,this.array),n=Nt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,s){return e*=this.itemSize,this.normalized&&(t=Nt(t,this.array),n=Nt(n,this.array),s=Nt(s,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e*=this.itemSize,this.normalized&&(t=Nt(t,this.array),n=Nt(n,this.array),s=Nt(s,this.array),r=Nt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=s,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return e.name=this.name,e.usage=this.usage,e.gpuType=this.gpuType,e}dispose(){this.dispatchEvent({type:"dispose"})}};var Xr=class extends Zn{constructor(e,t,n){super(new Uint16Array(e),t,n)}};var qr=class extends Zn{constructor(e,t,n){super(new Uint32Array(e),t,n)}};var it=class extends Zn{constructor(e,t,n){super(new Float32Array(e),t,n)}},tp=new ji,Ir=new N,wc=new N,Qi=class{constructor(e=new N,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){let n=this.center;t!==void 0?n.copy(t):tp.setFromPoints(e).getCenter(n);let s=0;for(let r=0,a=e.length;r<a;r++)s=Math.max(s,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(s),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){let t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){let n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Ir.subVectors(e,this.center);let t=Ir.lengthSq();if(t>this.radius*this.radius){let n=Math.sqrt(t),s=(n-this.radius)*.5;this.center.addScaledVector(Ir,s/n),this.radius+=s}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(wc.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Ir.copy(e.center).add(wc)),this.expandByPoint(Ir.copy(e.center).sub(wc))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}},np=0,jn=new Ut,Tc=new un,qs=new N,Yn=new ji,Lr=new ji,mn=new N,Pt=class i extends yi{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:np++}),this.uuid=Ki(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.indirectOffset=0,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={},this._transformed=!1}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Vf(e)?qr:Xr)(e,1):this.index=e,this}setIndirect(e,t=0){return this.indirect=e,this.indirectOffset=t,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){let t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new st().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(e),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this._transformed=!0,this}applyQuaternion(e){return jn.makeRotationFromQuaternion(e),this.applyMatrix4(jn),this}rotateX(e){return jn.makeRotationX(e),this.applyMatrix4(jn),this}rotateY(e){return jn.makeRotationY(e),this.applyMatrix4(jn),this}rotateZ(e){return jn.makeRotationZ(e),this.applyMatrix4(jn),this}translate(e,t,n){return jn.makeTranslation(e,t,n),this.applyMatrix4(jn),this}scale(e,t,n){return jn.makeScale(e,t,n),this.applyMatrix4(jn),this}lookAt(e){return Tc.lookAt(e),Tc.updateMatrix(),this.applyMatrix4(Tc.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(qs).negate(),this.translate(qs.x,qs.y,qs.z),this}setFromPoints(e){let t=this.getAttribute("position");if(t===void 0){let n=[];for(let s=0,r=e.length;s<r;s++){let a=e[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new it(n,3))}else{let n=Math.min(e.length,t.count);for(let s=0;s<n;s++){let r=e[s];t.setXYZ(s,r.x,r.y,r.z||0)}e.length>t.count&&je("BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new ji);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Qe("BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new N(-1/0,-1/0,-1/0),new N(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,s=t.length;n<s;n++){let r=t[n];Yn.setFromBufferAttribute(r),this.morphTargetsRelative?(mn.addVectors(this.boundingBox.min,Yn.min),this.boundingBox.expandByPoint(mn),mn.addVectors(this.boundingBox.max,Yn.max),this.boundingBox.expandByPoint(mn)):(this.boundingBox.expandByPoint(Yn.min),this.boundingBox.expandByPoint(Yn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&Qe('BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new Qi);let e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){Qe("BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new N,1/0);return}if(e){let n=this.boundingSphere.center;if(Yn.setFromBufferAttribute(e),t)for(let r=0,a=t.length;r<a;r++){let o=t[r];Lr.setFromBufferAttribute(o),this.morphTargetsRelative?(mn.addVectors(Yn.min,Lr.min),Yn.expandByPoint(mn),mn.addVectors(Yn.max,Lr.max),Yn.expandByPoint(mn)):(Yn.expandByPoint(Lr.min),Yn.expandByPoint(Lr.max))}Yn.getCenter(n);let s=0;for(let r=0,a=e.count;r<a;r++)mn.fromBufferAttribute(e,r),s=Math.max(s,n.distanceToSquared(mn));if(t)for(let r=0,a=t.length;r<a;r++){let o=t[r],l=this.morphTargetsRelative;for(let c=0,d=o.count;c<d;c++)mn.fromBufferAttribute(o,c),l&&(qs.fromBufferAttribute(e,c),mn.add(qs)),s=Math.max(s,n.distanceToSquared(mn))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&Qe('BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){Qe("BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=t.position,s=t.normal,r=t.uv,a=this.getAttribute("tangent");(a===void 0||a.count!==n.count)&&(a=new Zn(new Float32Array(4*n.count),4),this.setAttribute("tangent",a));let o=[],l=[];for(let _=0;_<n.count;_++)o[_]=new N,l[_]=new N;let c=new N,d=new N,m=new N,u=new Oe,f=new Oe,x=new Oe,b=new N,g=new N;function p(_,I,F){c.fromBufferAttribute(n,_),d.fromBufferAttribute(n,I),m.fromBufferAttribute(n,F),u.fromBufferAttribute(r,_),f.fromBufferAttribute(r,I),x.fromBufferAttribute(r,F),d.sub(c),m.sub(c),f.sub(u),x.sub(u);let V=1/(f.x*x.y-x.x*f.y);isFinite(V)&&(b.copy(d).multiplyScalar(x.y).addScaledVector(m,-f.y).multiplyScalar(V),g.copy(m).multiplyScalar(f.x).addScaledVector(d,-x.x).multiplyScalar(V),o[_].add(b),o[I].add(b),o[F].add(b),l[_].add(g),l[I].add(g),l[F].add(g))}let A=this.groups;A.length===0&&(A=[{start:0,count:e.count}]);for(let _=0,I=A.length;_<I;++_){let F=A[_],V=F.start,G=F.count;for(let J=V,z=V+G;J<z;J+=3)p(e.getX(J+0),e.getX(J+1),e.getX(J+2))}let D=new N,T=new N,P=new N,R=new N;function U(_){P.fromBufferAttribute(s,_),R.copy(P);let I=o[_];D.copy(I),D.sub(P.multiplyScalar(P.dot(I))).normalize(),T.crossVectors(R,I);let V=T.dot(l[_])<0?-1:1;a.setXYZW(_,D.x,D.y,D.z,V)}for(let _=0,I=A.length;_<I;++_){let F=A[_],V=F.start,G=F.count;for(let J=V,z=V+G;J<z;J+=3)U(e.getX(J+0)),U(e.getX(J+1)),U(e.getX(J+2))}this._transformed=!0}computeVertexNormals(){let e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0||n.count!==t.count)n=new Zn(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let u=0,f=n.count;u<f;u++)n.setXYZ(u,0,0,0);let s=new N,r=new N,a=new N,o=new N,l=new N,c=new N,d=new N,m=new N;if(e)for(let u=0,f=e.count;u<f;u+=3){let x=e.getX(u+0),b=e.getX(u+1),g=e.getX(u+2);s.fromBufferAttribute(t,x),r.fromBufferAttribute(t,b),a.fromBufferAttribute(t,g),d.subVectors(a,r),m.subVectors(s,r),d.cross(m),o.fromBufferAttribute(n,x),l.fromBufferAttribute(n,b),c.fromBufferAttribute(n,g),o.add(d),l.add(d),c.add(d),n.setXYZ(x,o.x,o.y,o.z),n.setXYZ(b,l.x,l.y,l.z),n.setXYZ(g,c.x,c.y,c.z)}else for(let u=0,f=t.count;u<f;u+=3)s.fromBufferAttribute(t,u+0),r.fromBufferAttribute(t,u+1),a.fromBufferAttribute(t,u+2),d.subVectors(a,r),m.subVectors(s,r),d.cross(m),n.setXYZ(u+0,d.x,d.y,d.z),n.setXYZ(u+1,d.x,d.y,d.z),n.setXYZ(u+2,d.x,d.y,d.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)mn.fromBufferAttribute(e,t),mn.normalize(),e.setXYZ(t,mn.x,mn.y,mn.z)}toNonIndexed(){function e(o,l){let c=o.array,d=o.itemSize,m=o.normalized,u=new c.constructor(l.length*d),f=0,x=0;for(let b=0,g=l.length;b<g;b++){o.isInterleavedBufferAttribute?f=l[b]*o.data.stride+o.offset:f=l[b]*d;for(let p=0;p<d;p++)u[x++]=c[f++]}return new Zn(u,d,m)}if(this.index===null)return je("BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let t=new i,n=this.index.array,s=this.attributes;for(let o in s){let l=s[o],c=e(l,n);t.setAttribute(o,c)}let r=this.morphAttributes;for(let o in r){let l=[],c=r[o];for(let d=0,m=c.length;d<m;d++){let u=c[d],f=e(u,n);l.push(f)}t.morphAttributes[o]=l}t.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){let e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.parameters!==void 0&&this._transformed===!0?"BufferGeometry":this.type,e.name=this.name,Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0&&this._transformed!==!0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};let t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});let n=this.attributes;for(let l in n){let c=n[l];e.data.attributes[l]=c.toJSON(e.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],d=[];for(let m=0,u=c.length;m<u;m++){let f=c[m];d.push(f.toJSON(e.data))}d.length>0&&(s[l]=d,r=!0)}r&&(e.data.morphAttributes=s,e.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(e.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(e.data.boundingSphere=o.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let t={};this.name=e.name;let n=e.index;n!==null&&this.setIndex(n.clone());let s=e.attributes;for(let c in s){let d=s[c];this.setAttribute(c,d.clone(t))}let r=e.morphAttributes;for(let c in r){let d=[],m=r[c];for(let u=0,f=m.length;u<f;u++)d.push(m[u].clone(t));this.morphAttributes[c]=d}this.morphTargetsRelative=e.morphTargetsRelative;let a=e.groups;for(let c=0,d=a.length;c<d;c++){let m=a[c];this.addGroup(m.start,m.count,m.materialIndex)}let o=e.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this._transformed=e._transformed,this}dispose(){this.dispatchEvent({type:"dispose"})}},Co=class{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=dh,this.updateRanges=[],this.version=0,this.uuid=Ki()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let s=0,r=this.stride;s<r;s++)this.array[e+s]=t.array[n+s];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Ki()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);let t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Ki()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer)));let t={uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride};return t.usage=this.usage,t}},Dn=new N,Yr=class i{constructor(e,t,n,s=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=s}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)Dn.fromBufferAttribute(this,t),Dn.applyMatrix4(e),this.setXYZ(t,Dn.x,Dn.y,Dn.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Dn.fromBufferAttribute(this,t),Dn.applyNormalMatrix(e),this.setXYZ(t,Dn.x,Dn.y,Dn.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Dn.fromBufferAttribute(this,t),Dn.transformDirection(e),this.setXYZ(t,Dn.x,Dn.y,Dn.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=_i(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=Nt(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=Nt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=Nt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=Nt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=Nt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=_i(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=_i(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=_i(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=_i(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=Nt(t,this.array),n=Nt(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,s){return e=e*this.data.stride+this.offset,this.normalized&&(t=Nt(t,this.array),n=Nt(n,this.array),s=Nt(s,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this}setXYZW(e,t,n,s,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=Nt(t,this.array),n=Nt(n,this.array),s=Nt(s,this.array),r=Nt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=s,this.data.array[e+3]=r,this}clone(e){if(e===void 0){Gr("InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return new Zn(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new i(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){Gr("InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");let t=[];for(let n=0;n<this.count;n++){let s=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[s+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}},Ac=new N,ip=new N,sp=new st,ai=class{constructor(e=new N(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,s){return this.normal.set(e,t,n),this.constant=s,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){let s=Ac.subVectors(n,t).cross(ip.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(s,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){let e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t,n=!0){let s=e.delta(Ac),r=this.normal.dot(s);if(r===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;let a=-(e.start.dot(this.normal)+this.constant)/r;return n===!0&&(a<0||a>1)?null:t.copy(e.start).addScaledVector(s,a)}intersectsLine(e){let t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){let n=t||sp.getNormalMatrix(e),s=this.coplanarPoint(Ac).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}toJSON(){return{normal:this.normal.toArray(),constant:this.constant}}fromJSON(e){return this.normal.fromArray(e.normal),this.constant=e.constant,this}},rp=0,li=class extends yi{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:rp++}),this.uuid=Ki(),this.name="",this.type="Material",this.blending=us,this.side=hs,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=$c,this.blendDst=Jc,this.blendEquation=Rs,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Je(0,0,0),this.blendAlpha=0,this.depthFunc=nr,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=cd,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=uo,this.stencilZFail=uo,this.stencilZPass=uo,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(let t in e){let n=e[t];if(n===void 0){je(`Material: parameter '${t}' has value of undefined.`);continue}let s=this[t];if(s===void 0){je(`Material: '${t}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector2&&n&&n.isVector2||s&&s.isEuler&&n&&n.isEuler||s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[t]=n}}toJSON(e){let t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,n.blending=this.blending,n.side=this.side,n.shadowSide=this.shadowSide,n.vertexColors=this.vertexColors,n.opacity=this.opacity,n.transparent=this.transparent,n.blendSrc=this.blendSrc,n.blendDst=this.blendDst,n.blendEquation=this.blendEquation,n.blendSrcAlpha=this.blendSrcAlpha,n.blendDstAlpha=this.blendDstAlpha,n.blendEquationAlpha=this.blendEquationAlpha,n.blendColor=this.blendColor.getHex(),n.blendAlpha=this.blendAlpha,n.depthFunc=this.depthFunc,n.depthTest=this.depthTest,n.depthWrite=this.depthWrite,n.colorWrite=this.colorWrite,n.clipIntersection=this.clipIntersection,n.clipShadows=this.clipShadows,n.stencilWriteMask=this.stencilWriteMask,n.stencilFunc=this.stencilFunc,n.stencilRef=this.stencilRef,n.stencilFuncMask=this.stencilFuncMask,n.stencilFail=this.stencilFail,n.stencilZFail=this.stencilZFail,n.stencilZPass=this.stencilZPass,n.stencilWrite=this.stencilWrite,n.polygonOffset=this.polygonOffset,n.polygonOffsetFactor=this.polygonOffsetFactor,n.polygonOffsetUnits=this.polygonOffsetUnits,n.dithering=this.dithering,n.alphaTest=this.alphaTest,n.alphaHash=this.alphaHash,n.alphaToCoverage=this.alphaToCoverage,n.premultipliedAlpha=this.premultipliedAlpha,n.forceSinglePass=this.forceSinglePass,n.allowOverride=this.allowOverride,n.visible=this.visible,n.toneMapped=this.toneMapped,n.name=this.name,this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.retroreflectivity!==void 0&&(n.retroreflectivity=this.retroreflectivity),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),Array.isArray(this.clippingPlanes)&&this.clippingPlanes.length>0&&(n.clippingPlanes=this.clippingPlanes.map(r=>r.toJSON())),this.rotation!==void 0&&(n.rotation=this.rotation),this.depthPacking!==void 0&&(n.depthPacking=this.depthPacking),this.linewidth!==void 0&&(n.linewidth=this.linewidth),this.linecap!==void 0&&(n.linecap=this.linecap),this.linejoin!==void 0&&(n.linejoin=this.linejoin),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.wireframe!==void 0&&(n.wireframe=this.wireframe),this.wireframeLinewidth!==void 0&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!==void 0&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!==void 0&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading!==void 0&&(n.flatShading=this.flatShading),this.fog!==void 0&&(n.fog=this.fog),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let a=[];for(let o in r){let l=r[o];delete l.metadata,a.push(l)}return a}if(t){let r=s(e.textures),a=s(e.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}fromJSON(e,t){if(e.uuid!==void 0&&(this.uuid=e.uuid),e.name!==void 0&&(this.name=e.name),e.color!==void 0&&this.color!==void 0&&this.color.setHex(e.color),e.roughness!==void 0&&(this.roughness=e.roughness),e.metalness!==void 0&&(this.metalness=e.metalness),e.sheen!==void 0&&(this.sheen=e.sheen),e.sheenColor!==void 0&&(this.sheenColor=new Je().setHex(e.sheenColor)),e.sheenRoughness!==void 0&&(this.sheenRoughness=e.sheenRoughness),e.emissive!==void 0&&this.emissive!==void 0&&this.emissive.setHex(e.emissive),e.specular!==void 0&&this.specular!==void 0&&this.specular.setHex(e.specular),e.specularIntensity!==void 0&&(this.specularIntensity=e.specularIntensity),e.specularColor!==void 0&&this.specularColor!==void 0&&this.specularColor.setHex(e.specularColor),e.shininess!==void 0&&(this.shininess=e.shininess),e.clearcoat!==void 0&&(this.clearcoat=e.clearcoat),e.clearcoatRoughness!==void 0&&(this.clearcoatRoughness=e.clearcoatRoughness),e.dispersion!==void 0&&(this.dispersion=e.dispersion),e.retroreflectivity!==void 0&&(this.retroreflectivity=e.retroreflectivity),e.iridescence!==void 0&&(this.iridescence=e.iridescence),e.iridescenceIOR!==void 0&&(this.iridescenceIOR=e.iridescenceIOR),e.iridescenceThicknessRange!==void 0&&(this.iridescenceThicknessRange=e.iridescenceThicknessRange),e.transmission!==void 0&&(this.transmission=e.transmission),e.thickness!==void 0&&(this.thickness=e.thickness),e.attenuationDistance!==void 0&&(this.attenuationDistance=e.attenuationDistance),e.attenuationColor!==void 0&&this.attenuationColor!==void 0&&this.attenuationColor.setHex(e.attenuationColor),e.anisotropy!==void 0&&(this.anisotropy=e.anisotropy),e.anisotropyRotation!==void 0&&(this.anisotropyRotation=e.anisotropyRotation),e.fog!==void 0&&(this.fog=e.fog),e.flatShading!==void 0&&(this.flatShading=e.flatShading),e.blending!==void 0&&(this.blending=e.blending),e.combine!==void 0&&(this.combine=e.combine),e.side!==void 0&&(this.side=e.side),e.shadowSide!==void 0&&(this.shadowSide=e.shadowSide),e.opacity!==void 0&&(this.opacity=e.opacity),e.transparent!==void 0&&(this.transparent=e.transparent),e.alphaTest!==void 0&&(this.alphaTest=e.alphaTest),e.alphaHash!==void 0&&(this.alphaHash=e.alphaHash),e.depthFunc!==void 0&&(this.depthFunc=e.depthFunc),e.depthTest!==void 0&&(this.depthTest=e.depthTest),e.depthWrite!==void 0&&(this.depthWrite=e.depthWrite),e.colorWrite!==void 0&&(this.colorWrite=e.colorWrite),e.clippingPlanes!==void 0&&(this.clippingPlanes=e.clippingPlanes.map(n=>new ai().fromJSON(n))),e.clipIntersection!==void 0&&(this.clipIntersection=e.clipIntersection),e.clipShadows!==void 0&&(this.clipShadows=e.clipShadows),e.depthPacking!==void 0&&(this.depthPacking=e.depthPacking),e.blendSrc!==void 0&&(this.blendSrc=e.blendSrc),e.blendDst!==void 0&&(this.blendDst=e.blendDst),e.blendEquation!==void 0&&(this.blendEquation=e.blendEquation),e.blendSrcAlpha!==void 0&&(this.blendSrcAlpha=e.blendSrcAlpha),e.blendDstAlpha!==void 0&&(this.blendDstAlpha=e.blendDstAlpha),e.blendEquationAlpha!==void 0&&(this.blendEquationAlpha=e.blendEquationAlpha),e.blendColor!==void 0&&this.blendColor!==void 0&&this.blendColor.setHex(e.blendColor),e.blendAlpha!==void 0&&(this.blendAlpha=e.blendAlpha),e.stencilWriteMask!==void 0&&(this.stencilWriteMask=e.stencilWriteMask),e.stencilFunc!==void 0&&(this.stencilFunc=e.stencilFunc),e.stencilRef!==void 0&&(this.stencilRef=e.stencilRef),e.stencilFuncMask!==void 0&&(this.stencilFuncMask=e.stencilFuncMask),e.stencilFail!==void 0&&(this.stencilFail=e.stencilFail),e.stencilZFail!==void 0&&(this.stencilZFail=e.stencilZFail),e.stencilZPass!==void 0&&(this.stencilZPass=e.stencilZPass),e.stencilWrite!==void 0&&(this.stencilWrite=e.stencilWrite),e.wireframe!==void 0&&(this.wireframe=e.wireframe),e.wireframeLinewidth!==void 0&&(this.wireframeLinewidth=e.wireframeLinewidth),e.wireframeLinecap!==void 0&&(this.wireframeLinecap=e.wireframeLinecap),e.wireframeLinejoin!==void 0&&(this.wireframeLinejoin=e.wireframeLinejoin),e.rotation!==void 0&&(this.rotation=e.rotation),e.linewidth!==void 0&&(this.linewidth=e.linewidth),e.linecap!==void 0&&(this.linecap=e.linecap),e.linejoin!==void 0&&(this.linejoin=e.linejoin),e.dashSize!==void 0&&(this.dashSize=e.dashSize),e.gapSize!==void 0&&(this.gapSize=e.gapSize),e.scale!==void 0&&(this.scale=e.scale),e.polygonOffset!==void 0&&(this.polygonOffset=e.polygonOffset),e.polygonOffsetFactor!==void 0&&(this.polygonOffsetFactor=e.polygonOffsetFactor),e.polygonOffsetUnits!==void 0&&(this.polygonOffsetUnits=e.polygonOffsetUnits),e.dithering!==void 0&&(this.dithering=e.dithering),e.alphaToCoverage!==void 0&&(this.alphaToCoverage=e.alphaToCoverage),e.premultipliedAlpha!==void 0&&(this.premultipliedAlpha=e.premultipliedAlpha),e.forceSinglePass!==void 0&&(this.forceSinglePass=e.forceSinglePass),e.allowOverride!==void 0&&(this.allowOverride=e.allowOverride),e.visible!==void 0&&(this.visible=e.visible),e.toneMapped!==void 0&&(this.toneMapped=e.toneMapped),e.userData!==void 0&&(this.userData=e.userData),e.vertexColors!==void 0&&(typeof e.vertexColors=="number"?this.vertexColors=e.vertexColors>0:this.vertexColors=e.vertexColors),e.size!==void 0&&(this.size=e.size),e.sizeAttenuation!==void 0&&(this.sizeAttenuation=e.sizeAttenuation),e.map!==void 0&&(this.map=t[e.map]||null),e.matcap!==void 0&&(this.matcap=t[e.matcap]||null),e.alphaMap!==void 0&&(this.alphaMap=t[e.alphaMap]||null),e.bumpMap!==void 0&&(this.bumpMap=t[e.bumpMap]||null),e.bumpScale!==void 0&&(this.bumpScale=e.bumpScale),e.normalMap!==void 0&&(this.normalMap=t[e.normalMap]||null),e.normalMapType!==void 0&&(this.normalMapType=e.normalMapType),e.normalScale!==void 0){let n=e.normalScale;Array.isArray(n)===!1&&(n=[n,n]),this.normalScale=new Oe().fromArray(n)}return e.displacementMap!==void 0&&(this.displacementMap=t[e.displacementMap]||null),e.displacementScale!==void 0&&(this.displacementScale=e.displacementScale),e.displacementBias!==void 0&&(this.displacementBias=e.displacementBias),e.roughnessMap!==void 0&&(this.roughnessMap=t[e.roughnessMap]||null),e.metalnessMap!==void 0&&(this.metalnessMap=t[e.metalnessMap]||null),e.emissiveMap!==void 0&&(this.emissiveMap=t[e.emissiveMap]||null),e.emissiveIntensity!==void 0&&(this.emissiveIntensity=e.emissiveIntensity),e.specularMap!==void 0&&(this.specularMap=t[e.specularMap]||null),e.specularIntensityMap!==void 0&&(this.specularIntensityMap=t[e.specularIntensityMap]||null),e.specularColorMap!==void 0&&(this.specularColorMap=t[e.specularColorMap]||null),e.envMap!==void 0&&(this.envMap=t[e.envMap]||null),e.envMapRotation!==void 0&&this.envMapRotation.fromArray(e.envMapRotation),e.envMapIntensity!==void 0&&(this.envMapIntensity=e.envMapIntensity),e.reflectivity!==void 0&&(this.reflectivity=e.reflectivity),e.refractionRatio!==void 0&&(this.refractionRatio=e.refractionRatio),e.lightMap!==void 0&&(this.lightMap=t[e.lightMap]||null),e.lightMapIntensity!==void 0&&(this.lightMapIntensity=e.lightMapIntensity),e.aoMap!==void 0&&(this.aoMap=t[e.aoMap]||null),e.aoMapIntensity!==void 0&&(this.aoMapIntensity=e.aoMapIntensity),e.gradientMap!==void 0&&(this.gradientMap=t[e.gradientMap]||null),e.clearcoatMap!==void 0&&(this.clearcoatMap=t[e.clearcoatMap]||null),e.clearcoatRoughnessMap!==void 0&&(this.clearcoatRoughnessMap=t[e.clearcoatRoughnessMap]||null),e.clearcoatNormalMap!==void 0&&(this.clearcoatNormalMap=t[e.clearcoatNormalMap]||null),e.clearcoatNormalScale!==void 0&&(this.clearcoatNormalScale=new Oe().fromArray(e.clearcoatNormalScale)),e.iridescenceMap!==void 0&&(this.iridescenceMap=t[e.iridescenceMap]||null),e.iridescenceThicknessMap!==void 0&&(this.iridescenceThicknessMap=t[e.iridescenceThicknessMap]||null),e.transmissionMap!==void 0&&(this.transmissionMap=t[e.transmissionMap]||null),e.thicknessMap!==void 0&&(this.thicknessMap=t[e.thicknessMap]||null),e.anisotropyMap!==void 0&&(this.anisotropyMap=t[e.anisotropyMap]||null),e.sheenColorMap!==void 0&&(this.sheenColorMap=t[e.sheenColorMap]||null),e.sheenRoughnessMap!==void 0&&(this.sheenRoughnessMap=t[e.sheenRoughnessMap]||null),this}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;let t=e.clippingPlanes,n=null;if(t!==null){let s=t.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.allowOverride=e.allowOverride,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}},ci=class extends li{constructor(e){super(),this.isSpriteMaterial=!0,this.type="SpriteMaterial",this.color=new Je(16777215),this.map=null,this.alphaMap=null,this.rotation=0,this.sizeAttenuation=!0,this.transparent=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.rotation=e.rotation,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Ys,Dr=new N,Zs=new N,$s=new N,Js=new Oe,Nr=new Oe,Md=new Ut,Xa=new N,Ur=new N,qa=new N,fu=new Oe,Ec=new Oe,pu=new Oe,Mi=class extends un{constructor(e=new ci){if(super(),this.isSprite=!0,this.type="Sprite",Ys===void 0){Ys=new Pt;let t=new Float32Array([-.5,-.5,0,0,0,.5,-.5,0,1,0,.5,.5,0,1,1,-.5,.5,0,0,1]),n=new Co(t,5);Ys.setIndex([0,1,2,0,2,3]),Ys.setAttribute("position",new Yr(n,3,0,!1)),Ys.setAttribute("uv",new Yr(n,2,3,!1))}this.geometry=Ys,this.material=e,this.center=new Oe(.5,.5),this.count=1}intersectsFrustum(e){return e.intersectsSprite(this)}raycast(e,t){e.camera===null&&Qe('Sprite: "Raycaster.camera" needs to be set in order to raycast against sprites.'),Zs.setFromMatrixScale(this.matrixWorld),Md.copy(e.camera.matrixWorld),this.modelViewMatrix.multiplyMatrices(e.camera.matrixWorldInverse,this.matrixWorld),$s.setFromMatrixPosition(this.modelViewMatrix),e.camera.isPerspectiveCamera&&this.material.sizeAttenuation===!1&&Zs.multiplyScalar(-$s.z);let n=this.material.rotation,s,r;n!==0&&(r=Math.cos(n),s=Math.sin(n));let a=this.center;Ya(Xa.set(-.5,-.5,0),$s,a,Zs,s,r),Ya(Ur.set(.5,-.5,0),$s,a,Zs,s,r),Ya(qa.set(.5,.5,0),$s,a,Zs,s,r),fu.set(0,0),Ec.set(1,0),pu.set(1,1);let o=e.ray.intersectTriangle(Xa,Ur,qa,!1,Dr);if(o===null&&(Ya(Ur.set(-.5,.5,0),$s,a,Zs,s,r),Ec.set(0,1),o=e.ray.intersectTriangle(Xa,qa,Ur,!1,Dr),o===null))return;let l=e.ray.origin.distanceTo(Dr);l<e.near||l>e.far||t.push({distance:l,point:Dr.clone(),uv:Fi.getInterpolation(Dr,Xa,Ur,qa,fu,Ec,pu,new Oe),face:null,object:this})}copy(e,t){return super.copy(e,t),e.center!==void 0&&this.center.copy(e.center),this.material=e.material,this}};function Ya(i,e,t,n,s,r){Js.subVectors(i,t).addScalar(.5).multiply(n),s!==void 0?(Nr.x=r*Js.x-s*Js.y,Nr.y=s*Js.x+r*Js.y):Nr.copy(Js),i.copy(e),i.x+=Nr.x,i.y+=Nr.y,i.applyMatrix4(Md)}var Ui=new N,Cc=new N,Za=new N,$a=new N,ws=class{constructor(e=new N,t=new N(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Ui)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);let n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){let t=Ui.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Ui.copy(this.origin).addScaledVector(this.direction,t),Ui.distanceToSquared(e))}distanceSqToSegment(e,t,n,s){Cc.copy(e).add(t).multiplyScalar(.5),Za.copy(t).sub(e).normalize(),$a.copy(this.origin).sub(Cc);let r=e.distanceTo(t)*.5,a=-this.direction.dot(Za),o=$a.dot(this.direction),l=-$a.dot(Za),c=$a.lengthSq(),d=Math.abs(1-a*a),m,u,f,x;if(d>0)if(m=a*l-o,u=a*o-l,x=r*d,m>=0)if(u>=-x)if(u<=x){let b=1/d;m*=b,u*=b,f=m*(m+a*u+2*o)+u*(a*m+u+2*l)+c}else u=r,m=Math.max(0,-(a*u+o)),f=-m*m+u*(u+2*l)+c;else u=-r,m=Math.max(0,-(a*u+o)),f=-m*m+u*(u+2*l)+c;else u<=-x?(m=Math.max(0,-(-a*r+o)),u=m>0?-r:Math.min(Math.max(-r,-l),r),f=-m*m+u*(u+2*l)+c):u<=x?(m=0,u=Math.min(Math.max(-r,-l),r),f=u*(u+2*l)+c):(m=Math.max(0,-(a*r+o)),u=m>0?r:Math.min(Math.max(-r,-l),r),f=-m*m+u*(u+2*l)+c);else u=a>0?-r:r,m=Math.max(0,-(a*u+o)),f=-m*m+u*(u+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,m),s&&s.copy(Cc).addScaledVector(Za,u),f}intersectSphere(e,t){if(e.radius<0)return null;Ui.subVectors(e.center,this.origin);let n=Ui.dot(this.direction),s=Ui.dot(Ui)-n*n,r=e.radius*e.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,t):this.at(o,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){let t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){let n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){let t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,s,r,a,o,l,c=1/this.direction.x,d=1/this.direction.y,m=1/this.direction.z,u=this.origin;return c>=0?(n=(e.min.x-u.x)*c,s=(e.max.x-u.x)*c):(n=(e.max.x-u.x)*c,s=(e.min.x-u.x)*c),d>=0?(r=(e.min.y-u.y)*d,a=(e.max.y-u.y)*d):(r=(e.max.y-u.y)*d,a=(e.min.y-u.y)*d),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),m>=0?(o=(e.min.z-u.z)*m,l=(e.max.z-u.z)*m):(o=(e.max.z-u.z)*m,l=(e.min.z-u.z)*m),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,t)}intersectsBox(e){return this.intersectBox(e,Ui)!==null}intersectTriangle(e,t,n,s,r){let a=this.origin,o=this.direction,l=o.x,c=o.y,d=o.z,m=e.x-a.x,u=e.y-a.y,f=e.z-a.z,x=t.x-a.x,b=t.y-a.y,g=t.z-a.z,p=n.x-a.x,A=n.y-a.y,D=n.z-a.z,T=Math.abs(l),P=Math.abs(c),R=Math.abs(d),U,_,I,F,V,G,J,z,j,ae,se,q;if(T>=P&&T>=R?(I=l,G=m,j=x,q=p,l>=0?(U=c,_=d,F=u,V=f,J=b,z=g,ae=A,se=D):(U=d,_=c,F=f,V=u,J=g,z=b,ae=D,se=A)):P>=R?(I=c,G=u,j=b,q=A,c>=0?(U=d,_=l,F=f,V=m,J=g,z=x,ae=D,se=p):(U=l,_=d,F=m,V=f,J=x,z=g,ae=p,se=D)):(I=d,G=f,j=g,q=D,d>=0?(U=l,_=c,F=m,V=u,J=x,z=b,ae=p,se=A):(U=c,_=l,F=u,V=m,J=b,z=x,ae=A,se=p)),I===0)return null;let ne=U/I,de=_/I,xe=1/I,Ye=F-ne*G,Ge=V-de*G,bt=J-ne*j,dt=z-de*j,lt=ae-ne*q,oe=se-de*q,fe=lt*dt-oe*bt,Se=Ye*oe-Ge*lt,$e=bt*Ge-dt*Ye;if(s){if(fe<0||Se<0||$e<0)return null}else if((fe<0||Se<0||$e<0)&&(fe>0||Se>0||$e>0))return null;let Fe=fe+Se+$e;if(Fe===0)return null;let et=xe*(fe*G+Se*j+$e*q);return(Fe>0?et<0:et>0)?null:this.at(et/Fe,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},en=class extends li{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Je(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Bi,this.combine=nl,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}},mu=new Ut,Ms=new ws,Ja=new Qi,gu=new N,Ka=new N,ja=new N,Qa=new N,Rc=new N,eo=new N,_u=new N,to=new N,vt=class extends un{constructor(e=new Pt,t=new en){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(e,t){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;t.fromBufferAttribute(s,e);let o=this.morphTargetInfluences;if(r&&o){eo.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let d=o[l],m=r[l];d!==0&&(Rc.fromBufferAttribute(m,e),a?eo.addScaledVector(Rc,d):eo.addScaledVector(Rc.sub(t),d))}t.add(eo)}return t}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Ja.copy(n.boundingSphere),Ja.applyMatrix4(r),Ms.copy(e.ray).recast(e.near),!(Ja.containsPoint(Ms.origin)===!1&&(Ms.intersectSphere(Ja,gu)===null||Ms.origin.distanceToSquared(gu)>(e.far-e.near)**2))&&(mu.copy(r).invert(),Ms.copy(e.ray).applyMatrix4(mu),!(n.boundingBox!==null&&Ms.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,Ms)))}_computeIntersections(e,t,n){let s,r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,d=r.attributes.uv1,m=r.attributes.normal,u=r.groups,f=r.drawRange;if(o!==null)if(Array.isArray(a))for(let x=0,b=u.length;x<b;x++){let g=u[x],p=a[g.materialIndex],A=Math.max(g.start,f.start),D=Math.min(o.count,Math.min(g.start+g.count,f.start+f.count));for(let T=A,P=D;T<P;T+=3){let R=o.getX(T),U=o.getX(T+1),_=o.getX(T+2);s=no(this,p,e,n,c,d,m,R,U,_),s&&(s.faceIndex=Math.floor(T/3),s.face.materialIndex=g.materialIndex,t.push(s))}}else{let x=Math.max(0,f.start),b=Math.min(o.count,f.start+f.count);for(let g=x,p=b;g<p;g+=3){let A=o.getX(g),D=o.getX(g+1),T=o.getX(g+2);s=no(this,a,e,n,c,d,m,A,D,T),s&&(s.faceIndex=Math.floor(g/3),t.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let x=0,b=u.length;x<b;x++){let g=u[x],p=a[g.materialIndex],A=Math.max(g.start,f.start),D=Math.min(l.count,Math.min(g.start+g.count,f.start+f.count));for(let T=A,P=D;T<P;T+=3){let R=T,U=T+1,_=T+2;s=no(this,p,e,n,c,d,m,R,U,_),s&&(s.faceIndex=Math.floor(T/3),s.face.materialIndex=g.materialIndex,t.push(s))}}else{let x=Math.max(0,f.start),b=Math.min(l.count,f.start+f.count);for(let g=x,p=b;g<p;g+=3){let A=g,D=g+1,T=g+2;s=no(this,a,e,n,c,d,m,A,D,T),s&&(s.faceIndex=Math.floor(g/3),t.push(s))}}}};function ap(i,e,t,n,s,r,a,o){let l;if(e.side===_n?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,e.side===hs,o),l===null)return null;to.copy(o),to.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(to);return c<t.near||c>t.far?null:{distance:c,point:to.clone(),object:i}}function no(i,e,t,n,s,r,a,o,l,c){i.getVertexPosition(o,Ka),i.getVertexPosition(l,ja),i.getVertexPosition(c,Qa);let d=ap(i,e,t,n,Ka,ja,Qa,_u);if(d){let m=new N;Fi.getBarycoord(_u,Ka,ja,Qa,m),s&&(d.uv=Fi.getInterpolatedAttribute(s,o,l,c,m,new Oe)),r&&(d.uv1=Fi.getInterpolatedAttribute(r,o,l,c,m,new Oe)),a&&(d.normal=Fi.getInterpolatedAttribute(a,o,l,c,m,new N),d.normal.dot(n.direction)>0&&d.normal.multiplyScalar(-1));let u={a:o,b:l,c,normal:new N,materialIndex:0};Fi.getNormal(Ka,ja,Qa,u.normal),d.face=u,d.barycoord=m}return d}var Ro=class extends Rn{constructor(e=null,t=1,n=1,s,r,a,o,l,c=gn,d=gn,m,u){super(null,a,o,l,c,d,s,r,m,u),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Ss=new Qi,op=new Oe(.5,.5),io=new N,cr=class{constructor(e=new ai,t=new ai,n=new ai,s=new ai,r=new ai,a=new ai){this.planes=[e,t,n,s,r,a]}set(e,t,n,s,r,a){let o=this.planes;return o[0].copy(e),o[1].copy(t),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(e){let t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=oi,n=!1){let s=this.planes,r=e.elements,a=r[0],o=r[1],l=r[2],c=r[3],d=r[4],m=r[5],u=r[6],f=r[7],x=r[8],b=r[9],g=r[10],p=r[11],A=r[12],D=r[13],T=r[14],P=r[15];if(s[0].setComponents(c-a,f-d,p-x,P-A).normalize(),s[1].setComponents(c+a,f+d,p+x,P+A).normalize(),s[2].setComponents(c+o,f+m,p+b,P+D).normalize(),s[3].setComponents(c-o,f-m,p-b,P-D).normalize(),n)s[4].setComponents(l,u,g,T).normalize(),s[5].setComponents(c-l,f-u,p-g,P-T).normalize();else if(s[4].setComponents(c-l,f-u,p-g,P-T).normalize(),t===oi)s[5].setComponents(c+l,f+u,p+g,P+T).normalize();else if(t===ir)s[5].setComponents(l,u,g,T).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Ss.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{let t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Ss.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Ss)}intersectsSprite(e){Ss.center.set(0,0,0);let t=op.distanceTo(e.center);return Ss.radius=.7071067811865476+t,Ss.applyMatrix4(e.matrixWorld),this.intersectsSphere(Ss)}intersectsSphere(e){let t=this.planes,n=e.center,s=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(e){let t=this.planes;for(let n=0;n<6;n++){let s=t[n];if(io.x=s.normal.x>0?e.max.x:e.min.x,io.y=s.normal.y>0?e.max.y:e.min.y,io.z=s.normal.z>0?e.max.z:e.min.z,s.distanceToPoint(io)<0)return!1}return!0}containsPoint(e){let t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var ei=class extends li{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Je(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}},Po=new N,Io=new N,xu=new Ut,Fr=new ws,so=new Qi,Pc=new N,vu=new N,zi=class extends un{constructor(e=new Pt,t=new ei){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[0];for(let s=1,r=t.count;s<r;s++)Po.fromBufferAttribute(t,s-1),Io.fromBufferAttribute(t,s),n[s]=n[s-1],n[s]+=Po.distanceTo(Io);e.setAttribute("lineDistance",new it(n,1))}else je("Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),so.copy(n.boundingSphere),so.applyMatrix4(s),so.radius+=r,e.ray.intersectsSphere(so)===!1)return;xu.copy(s).invert(),Fr.copy(e.ray).applyMatrix4(xu);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,d=n.index,u=n.attributes.position;if(d!==null){let f=Math.max(0,a.start),x=Math.min(d.count,a.start+a.count);for(let b=f,g=x-1;b<g;b+=c){let p=d.getX(b),A=d.getX(b+1),D=ro(this,e,Fr,l,p,A,b);D&&t.push(D)}if(this.isLineLoop){let b=d.getX(x-1),g=d.getX(f),p=ro(this,e,Fr,l,b,g,x-1);p&&t.push(p)}}else{let f=Math.max(0,a.start),x=Math.min(u.count,a.start+a.count);for(let b=f,g=x-1;b<g;b+=c){let p=ro(this,e,Fr,l,b,b+1,b);p&&t.push(p)}if(this.isLineLoop){let b=ro(this,e,Fr,l,x-1,f,x-1);b&&t.push(b)}}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function ro(i,e,t,n,s,r,a){let o=i.geometry.attributes.position;if(Po.fromBufferAttribute(o,s),Io.fromBufferAttribute(o,r),t.distanceSqToSegment(Po,Io,Pc,vu)>n)return;Pc.applyMatrix4(i.matrixWorld);let c=e.ray.origin.distanceTo(Pc);if(!(c<e.near||c>e.far))return{distance:c,point:vu.clone().applyMatrix4(i.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:i}}var yu=new N,Mu=new N,Ts=class extends zi{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let e=this.geometry;if(e.index===null){let t=e.attributes.position,n=[];for(let s=0,r=t.count;s<r;s+=2)yu.fromBufferAttribute(t,s),Mu.fromBufferAttribute(t,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+yu.distanceTo(Mu);e.setAttribute("lineDistance",new it(n,1))}else je("LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}};var es=class extends li{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Je(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}},Su=new Ut,kc=new ws,ao=new Qi,oo=new N,As=class extends un{constructor(e=new Pt,t=new es){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}intersectsFrustum(e){return e.intersectsObject(this)}raycast(e,t){let n=this.geometry,s=this.matrixWorld,r=e.params.Points.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),ao.copy(n.boundingSphere),ao.applyMatrix4(s),ao.radius+=r,e.ray.intersectsSphere(ao)===!1)return;Su.copy(s).invert(),kc.copy(e.ray).applyMatrix4(Su);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=n.index,m=n.attributes.position;if(c!==null){let u=Math.max(0,a.start),f=Math.min(c.count,a.start+a.count);for(let x=u,b=f;x<b;x++){let g=c.getX(x);oo.fromBufferAttribute(m,g),bu(oo,g,l,s,e,t,this)}}else{let u=Math.max(0,a.start),f=Math.min(m.count,a.start+a.count);for(let x=u,b=f;x<b;x++)oo.fromBufferAttribute(m,x),bu(oo,x,l,s,e,t,this)}}updateMorphTargets(){let t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){let s=t[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function bu(i,e,t,n,s,r,a){let o=kc.distanceSqToPoint(i);if(o<t){let l=new N;kc.closestPointToPoint(i,l),l.applyMatrix4(n);let c=s.ray.origin.distanceTo(l);if(c<s.near||c>s.far)return;r.push({distance:c,distanceToRay:Math.sqrt(o),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:a})}}var Zr=class extends Rn{constructor(e=[],t=ds,n,s,r,a,o,l,c,d){super(e,t,n,s,r,a,o,l,c,d),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}},Es=class extends Rn{constructor(e,t,n,s,r,a,o,l,c){super(e,t,n,s,r,a,o,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}};var ts=class extends Rn{constructor(e,t,n=di,s,r,a,o=gn,l=gn,c,d=vi,m=1){if(d!==vi&&d!==ps)throw new Error("THREE.DepthTexture: format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let u={width:e,height:t,depth:m};super(u,s,r,a,o,l,d,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new ar(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){let t=super.toJSON(e);return t.compareFunction=this.compareFunction,t}},Lo=class extends ts{constructor(e,t=di,n=ds,s,r,a=gn,o=gn,l,c=vi){let d={width:e,height:e,depth:1},m=[d,d,d,d,d,d];super(e,e,t,n,s,r,a,o,l,c),this.image=m,this.isCubeDepthTexture=!0,this.isCubeTexture=!0}get images(){return this.image}set images(e){this.image=e}},$r=class extends Rn{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}},Si=class i extends Pt{constructor(e=1,t=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let l=[],c=[],d=[],m=[],u=0,f=0;x("z","y","x",-1,-1,n,t,e,a,r,0),x("z","y","x",1,-1,n,t,-e,a,r,1),x("x","z","y",1,1,e,n,t,s,a,2),x("x","z","y",1,-1,e,n,-t,s,a,3),x("x","y","z",1,-1,e,t,n,s,r,4),x("x","y","z",-1,-1,e,t,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new it(c,3)),this.setAttribute("normal",new it(d,3)),this.setAttribute("uv",new it(m,2));function x(b,g,p,A,D,T,P,R,U,_,I){let F=T/U,V=P/_,G=T/2,J=P/2,z=R/2,j=U+1,ae=_+1,se=0,q=0,ne=new N;for(let de=0;de<ae;de++){let xe=de*V-J;for(let Ye=0;Ye<j;Ye++){let Ge=Ye*F-G;ne[b]=Ge*A,ne[g]=xe*D,ne[p]=z,c.push(ne.x,ne.y,ne.z),ne[b]=0,ne[g]=0,ne[p]=R>0?1:-1,d.push(ne.x,ne.y,ne.z),m.push(Ye/U),m.push(1-de/_),se+=1}}for(let de=0;de<_;de++)for(let xe=0;xe<U;xe++){let Ye=u+xe+j*de,Ge=u+xe+j*(de+1),bt=u+(xe+1)+j*(de+1),dt=u+(xe+1)+j*de;l.push(Ye,Ge,dt),l.push(Ge,bt,dt),q+=6}o.addGroup(f,q,I),f+=q,u+=se}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}};var Cs=class i extends Pt{constructor(e=1,t=32,n=0,s=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:s},t=Math.max(3,t);let r=[],a=[],o=[],l=[],c=new N,d=new Oe;a.push(0,0,0),o.push(0,0,1),l.push(.5,.5);for(let m=0,u=3;m<=t;m++,u+=3){let f=n+m/t*s;c.x=e*Math.cos(f),c.y=e*Math.sin(f),a.push(c.x,c.y,c.z),o.push(0,0,1),d.x=(a[u]/e+1)/2,d.y=(a[u+1]/e+1)/2,l.push(d.x,d.y)}for(let m=1;m<=t;m++)r.push(m,m+1,0);this.setIndex(r),this.setAttribute("position",new it(a,3)),this.setAttribute("normal",new it(o,3)),this.setAttribute("uv",new it(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.segments,e.thetaStart,e.thetaLength)}},hi=class i extends Pt{constructor(e=1,t=1,n=1,s=32,r=1,a=!1,o=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:s,heightSegments:r,openEnded:a,thetaStart:o,thetaLength:l};let c=this;s=Math.floor(s),r=Math.floor(r);let d=[],m=[],u=[],f=[],x=0,b=[],g=n/2,p=0;A(),a===!1&&(e>0&&D(!0),t>0&&D(!1)),this.setIndex(d),this.setAttribute("position",new it(m,3)),this.setAttribute("normal",new it(u,3)),this.setAttribute("uv",new it(f,2));function A(){let T=new N,P=new N,R=0,U=(t-e)/n;for(let _=0;_<=r;_++){let I=[],F=_/r,V=F*(t-e)+e;for(let G=0;G<=s;G++){let J=G/s,z=J*l+o,j=Math.sin(z),ae=Math.cos(z);P.x=V*j,P.y=-F*n+g,P.z=V*ae,m.push(P.x,P.y,P.z),T.set(j,U,ae).normalize(),u.push(T.x,T.y,T.z),f.push(J,1-F),I.push(x++)}b.push(I)}for(let _=0;_<s;_++)for(let I=0;I<r;I++){let F=b[I][_],V=b[I+1][_],G=b[I+1][_+1],J=b[I][_+1];(e>0||I!==0)&&(d.push(F,V,J),R+=3),(t>0||I!==r-1)&&(d.push(V,G,J),R+=3)}c.addGroup(p,R,0),p+=R}function D(T){let P=x,R=new Oe,U=new N,_=0,I=T===!0?e:t,F=T===!0?1:-1;for(let G=1;G<=s;G++)m.push(0,g*F,0),u.push(0,F,0),f.push(.5,.5),x++;let V=x;for(let G=0;G<=s;G++){let z=G/s*l+o,j=Math.cos(z),ae=Math.sin(z);U.x=I*ae,U.y=g*F,U.z=I*j,m.push(U.x,U.y,U.z),u.push(0,F,0),R.x=j*.5+.5,R.y=ae*.5*F+.5,f.push(R.x,R.y),x++}for(let G=0;G<s;G++){let J=P+G,z=V+G;T===!0?d.push(z,z+1,J):d.push(z+1,z,J),_+=3}c.addGroup(p,_,T===!0?1:2),p+=_}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},ns=class i extends hi{constructor(e=1,t=1,n=32,s=1,r=!1,a=0,o=Math.PI*2){super(0,e,t,n,s,r,a,o),this.type="ConeGeometry",this.parameters={radius:e,height:t,radialSegments:n,heightSegments:s,openEnded:r,thetaStart:a,thetaLength:o}}static fromJSON(e){return new i(e.radius,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}},hr=class i extends Pt{constructor(e=[],t=[],n=1,s=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:s};let r=[],a=[];o(s),c(n),d(),this.setAttribute("position",new it(r,3)),this.setAttribute("normal",new it(r.slice(),3)),this.setAttribute("uv",new it(a,2)),s===0?this.computeVertexNormals():this.normalizeNormals();function o(A){let D=new N,T=new N,P=new N;for(let R=0;R<t.length;R+=3)f(t[R+0],D),f(t[R+1],T),f(t[R+2],P),l(D,T,P,A)}function l(A,D,T,P){let R=P+1,U=[];for(let _=0;_<=R;_++){U[_]=[];let I=A.clone().lerp(T,_/R),F=D.clone().lerp(T,_/R),V=R-_;for(let G=0;G<=V;G++)G===0&&_===R?U[_][G]=I:U[_][G]=I.clone().lerp(F,G/V)}for(let _=0;_<R;_++)for(let I=0;I<2*(R-_)-1;I++){let F=Math.floor(I/2);I%2===0?(u(U[_][F+1]),u(U[_+1][F]),u(U[_][F])):(u(U[_][F+1]),u(U[_+1][F+1]),u(U[_+1][F]))}}function c(A){let D=new N;for(let T=0;T<r.length;T+=3)D.x=r[T+0],D.y=r[T+1],D.z=r[T+2],D.normalize().multiplyScalar(A),r[T+0]=D.x,r[T+1]=D.y,r[T+2]=D.z}function d(){let A=new N;for(let D=0;D<r.length;D+=3){A.x=r[D+0],A.y=r[D+1],A.z=r[D+2];let T=g(A)/2/Math.PI+.5,P=p(A)/Math.PI+.5;a.push(T,1-P)}x(),m()}function m(){for(let A=0;A<a.length;A+=6){let D=a[A+0],T=a[A+2],P=a[A+4],R=Math.max(D,T,P),U=Math.min(D,T,P);R>.9&&U<.1&&(D<.2&&(a[A+0]+=1),T<.2&&(a[A+2]+=1),P<.2&&(a[A+4]+=1))}}function u(A){r.push(A.x,A.y,A.z)}function f(A,D){let T=A*3;D.x=e[T+0],D.y=e[T+1],D.z=e[T+2]}function x(){let A=new N,D=new N,T=new N,P=new N,R=new Oe,U=new Oe,_=new Oe;for(let I=0,F=0;I<r.length;I+=9,F+=6){A.set(r[I+0],r[I+1],r[I+2]),D.set(r[I+3],r[I+4],r[I+5]),T.set(r[I+6],r[I+7],r[I+8]),R.set(a[F+0],a[F+1]),U.set(a[F+2],a[F+3]),_.set(a[F+4],a[F+5]),P.copy(A).add(D).add(T).divideScalar(3);let V=g(P);b(R,F+0,A,V),b(U,F+2,D,V),b(_,F+4,T,V)}}function b(A,D,T,P){P<0&&A.x===1&&(a[D]=A.x-1),T.x===0&&T.z===0&&(a[D]=P/2/Math.PI+.5)}function g(A){return Math.atan2(A.z,-A.x)}function p(A){return Math.atan2(-A.y,Math.sqrt(A.x*A.x+A.z*A.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.vertices,e.indices,e.radius,e.detail)}},Jr=class i extends hr{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,s=1/n,r=[-1,-1,-1,-1,-1,1,-1,1,-1,-1,1,1,1,-1,-1,1,-1,1,1,1,-1,1,1,1,0,-s,-n,0,-s,n,0,s,-n,0,s,n,-s,-n,0,-s,n,0,s,-n,0,s,n,0,-n,0,-s,n,0,-s,-n,0,s,n,0,s],a=[3,11,7,3,7,15,3,15,13,7,19,17,7,17,6,7,6,15,17,4,8,17,8,10,17,10,6,8,0,16,8,16,2,8,2,10,0,12,1,0,1,18,0,18,16,6,10,2,6,2,13,6,13,15,2,16,18,2,18,3,2,3,13,18,1,9,18,9,11,18,11,3,4,14,12,4,12,0,4,0,8,11,9,5,11,5,19,11,19,7,19,5,14,19,14,4,19,4,17,1,12,14,1,14,5,1,5,9];super(r,a,e,t),this.type="DodecahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new i(e.radius,e.detail)}};var $n=class{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){je("Curve: .getPoint() not implemented.")}getPointAt(e,t){let n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){let t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){let e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;let t=[],n,s=this.getPoint(0),r=0;t.push(0);for(let a=1;a<=e;a++)n=this.getPoint(a/e),r+=n.distanceTo(s),t.push(r),s=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){let n=this.getLengths(),s=0,r=n.length,a;t?a=t:a=e*n[r-1];let o=0,l=r-1,c;for(;o<=l;)if(s=Math.floor(o+(l-o)/2),c=n[s]-a,c<0)o=s+1;else if(c>0)l=s-1;else{l=s;break}if(s=l,n[s]===a)return s/(r-1);let d=n[s],u=n[s+1]-d,f=(a-d)/u;return(s+f)/(r-1)}getTangent(e,t){let s=e-1e-4,r=e+1e-4;s<0&&(s=0),r>1&&(r=1);let a=this.getPoint(s),o=this.getPoint(r),l=t||(a.isVector2?new Oe:new N);return l.copy(o).sub(a).normalize(),l}getTangentAt(e,t){let n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){let n=new N,s=[],r=[],a=[],o=new N,l=new Ut;for(let f=0;f<=e;f++){let x=f/e;s[f]=this.getTangentAt(x,new N)}r[0]=new N,a[0]=new N;let c=Number.MAX_VALUE,d=Math.abs(s[0].x),m=Math.abs(s[0].y),u=Math.abs(s[0].z);d<=c&&(c=d,n.set(1,0,0)),m<=c&&(c=m,n.set(0,1,0)),u<=c&&n.set(0,0,1),o.crossVectors(s[0],n).normalize(),r[0].crossVectors(s[0],o),a[0].crossVectors(s[0],r[0]);for(let f=1;f<=e;f++){if(r[f]=r[f-1].clone(),a[f]=a[f-1].clone(),o.crossVectors(s[f-1],s[f]),o.length()>Number.EPSILON){o.normalize();let x=Math.acos(xt(s[f-1].dot(s[f]),-1,1));r[f].applyMatrix4(l.makeRotationAxis(o,x))}a[f].crossVectors(s[f],r[f])}if(t===!0){let f=Math.acos(xt(r[0].dot(r[e]),-1,1));f/=e,s[0].dot(o.crossVectors(r[0],r[e]))>0&&(f=-f);for(let x=1;x<=e;x++)r[x].applyMatrix4(l.makeRotationAxis(s[x],f*x)),a[x].crossVectors(s[x],r[x])}return{tangents:s,normals:r,binormals:a}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){let e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}},Kr=class extends $n{constructor(e=0,t=0,n=1,s=1,r=0,a=Math.PI*2,o=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=s,this.aStartAngle=r,this.aEndAngle=a,this.aClockwise=o,this.aRotation=l}getPoint(e,t=new Oe){let n=t,s=Math.PI*2,r=this.aEndAngle-this.aStartAngle,a=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=s;for(;r>s;)r-=s;r<Number.EPSILON&&(a?r=0:r=s),this.aClockwise===!0&&!a&&(r===s?r=-s:r=r-s);let o=this.aStartAngle+e*r,l=this.aX+this.xRadius*Math.cos(o),c=this.aY+this.yRadius*Math.sin(o);if(this.aRotation!==0){let d=Math.cos(this.aRotation),m=Math.sin(this.aRotation),u=l-this.aX,f=c-this.aY;l=u*d-f*m+this.aX,c=u*m+f*d+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){let e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}},Do=class extends Kr{constructor(e,t,n,s,r,a){super(e,t,n,n,s,r,a),this.isArcCurve=!0,this.type="ArcCurve"}};function ph(){let i=0,e=0,t=0,n=0;function s(r,a,o,l){i=r,e=o,t=-3*r+3*a-2*o-l,n=2*r-2*a+o+l}return{initCatmullRom:function(r,a,o,l,c){s(a,o,c*(o-r),c*(l-a))},initNonuniformCatmullRom:function(r,a,o,l,c,d,m){let u=(a-r)/c-(o-r)/(c+d)+(o-a)/d,f=(o-a)/d-(l-a)/(d+m)+(l-o)/m;u*=d,f*=d,s(a,o,u,f)},calc:function(r){let a=r*r,o=a*r;return i+e*r+t*a+n*o}}}var wu=new N,Tu=new N,Ic=new ph,Lc=new ph,Dc=new ph,is=class extends $n{constructor(e=[],t=!1,n="centripetal",s=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=s}getPoint(e,t=new N){let n=t,s=this.points,r=s.length,a=(r-(this.closed?0:1))*e,o=Math.floor(a),l=a-o;this.closed?o+=o>0?0:(Math.floor(Math.abs(o)/r)+1)*r:l===0&&o===r-1&&(o=r-2,l=1);let c,d;this.closed||o>0?c=s[(o-1)%r]:(Tu.subVectors(s[0],s[1]).add(s[0]),c=Tu);let m=s[o%r],u=s[(o+1)%r];if(this.closed||o+2<r?d=s[(o+2)%r]:(wu.subVectors(s[r-1],s[r-2]).add(s[r-1]),d=wu),this.curveType==="centripetal"||this.curveType==="chordal"){let f=this.curveType==="chordal"?.5:.25,x=Math.pow(c.distanceToSquared(m),f),b=Math.pow(m.distanceToSquared(u),f),g=Math.pow(u.distanceToSquared(d),f);b<1e-4&&(b=1),x<1e-4&&(x=b),g<1e-4&&(g=b),Ic.initNonuniformCatmullRom(c.x,m.x,u.x,d.x,x,b,g),Lc.initNonuniformCatmullRom(c.y,m.y,u.y,d.y,x,b,g),Dc.initNonuniformCatmullRom(c.z,m.z,u.z,d.z,x,b,g)}else this.curveType==="catmullrom"&&(Ic.initCatmullRom(c.x,m.x,u.x,d.x,this.tension),Lc.initCatmullRom(c.y,m.y,u.y,d.y,this.tension),Dc.initCatmullRom(c.z,m.z,u.z,d.z,this.tension));return n.set(Ic.calc(l),Lc.calc(l),Dc.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new N().fromArray(s))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}};function Au(i,e,t,n,s){let r=(n-e)*.5,a=(s-t)*.5,o=i*i,l=i*o;return(2*t-2*n+r+a)*l+(-3*t+3*n-2*r-a)*o+r*i+t}function lp(i,e){let t=1-i;return t*t*e}function cp(i,e){return 2*(1-i)*i*e}function hp(i,e){return i*i*e}function Or(i,e,t,n){return lp(i,e)+cp(i,t)+hp(i,n)}function up(i,e){let t=1-i;return t*t*t*e}function dp(i,e){let t=1-i;return 3*t*t*i*e}function fp(i,e){return 3*(1-i)*i*i*e}function pp(i,e){return i*i*i*e}function Br(i,e,t,n,s){return up(i,e)+dp(i,t)+fp(i,n)+pp(i,s)}var No=class extends $n{constructor(e=new Oe,t=new Oe,n=new Oe,s=new Oe){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new Oe){let n=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(Br(e,s.x,r.x,a.x,o.x),Br(e,s.y,r.y,a.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Uo=class extends $n{constructor(e=new N,t=new N,n=new N,s=new N){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=s}getPoint(e,t=new N){let n=t,s=this.v0,r=this.v1,a=this.v2,o=this.v3;return n.set(Br(e,s.x,r.x,a.x,o.x),Br(e,s.y,r.y,a.y,o.y),Br(e,s.z,r.z,a.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}},Fo=class extends $n{constructor(e=new Oe,t=new Oe){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new Oe){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new Oe){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},ur=class extends $n{constructor(e=new N,t=new N){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new N){let n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new N){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Oo=class extends $n{constructor(e=new Oe,t=new Oe,n=new Oe){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new Oe){let n=t,s=this.v0,r=this.v1,a=this.v2;return n.set(Or(e,s.x,r.x,a.x),Or(e,s.y,r.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},jr=class extends $n{constructor(e=new N,t=new N,n=new N){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new N){let n=t,s=this.v0,r=this.v1,a=this.v2;return n.set(Or(e,s.x,r.x,a.x),Or(e,s.y,r.y,a.y),Or(e,s.z,r.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){let e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}},Bo=class extends $n{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new Oe){let n=t,s=this.points,r=(s.length-1)*e,a=Math.floor(r),o=r-a,l=s[a===0?a:a-1],c=s[a],d=s[a>s.length-2?s.length-1:a+1],m=s[a>s.length-3?s.length-1:a+2];return n.set(Au(o,l.x,c.x,d.x,m.x),Au(o,l.y,c.y,d.y,m.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(s.clone())}return this}toJSON(){let e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){let s=this.points[t];e.points.push(s.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){let s=e.points[t];this.points.push(new Oe().fromArray(s))}return this}},Vc=Object.freeze({__proto__:null,ArcCurve:Do,CatmullRomCurve3:is,CubicBezierCurve:No,CubicBezierCurve3:Uo,EllipseCurve:Kr,LineCurve:Fo,LineCurve3:ur,QuadraticBezierCurve:Oo,QuadraticBezierCurve3:jr,SplineCurve:Bo}),Qr=class extends $n{constructor(){super(),this.type="CurvePath",this.curves=[],this.autoClose=!1}add(e){this.curves.push(e)}closePath(){let e=this.curves[0].getPoint(0),t=this.curves[this.curves.length-1].getPoint(1);if(!e.equals(t)){let n=e.isVector2===!0?"LineCurve":"LineCurve3";this.curves.push(new Vc[n](t,e))}return this}getPoint(e,t){let n=e*this.getLength(),s=this.getCurveLengths(),r=0;for(;r<s.length;){if(s[r]>=n){let a=s[r]-n,o=this.curves[r],l=o.getLength(),c=l===0?0:1-a/l;return o.getPointAt(c,t)}r++}return null}getLength(){let e=this.getCurveLengths();return e[e.length-1]}updateArcLengths(){this.needsUpdate=!0,this.cacheLengths=null,this.getCurveLengths()}getCurveLengths(){if(this.cacheLengths&&this.cacheLengths.length===this.curves.length)return this.cacheLengths;let e=[],t=0;for(let n=0,s=this.curves.length;n<s;n++)t+=this.curves[n].getLength(),e.push(t);return this.cacheLengths=e,e}getSpacedPoints(e=40){let t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return this.autoClose&&t.push(t[0]),t}getPoints(e=12){let t=[],n;for(let s=0,r=this.curves;s<r.length;s++){let a=r[s],o=a.isEllipseCurve?e*2:a.isLineCurve||a.isLineCurve3?1:a.isSplineCurve?e*a.points.length:e,l=a.getPoints(o);for(let c=0;c<l.length;c++){let d=l[c];n&&n.equals(d)||(t.push(d),n=d)}}return this.autoClose&&t.length>1&&!t[t.length-1].equals(t[0])&&t.push(t[0]),t}copy(e){super.copy(e),this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let s=e.curves[t];this.curves.push(s.clone())}return this.autoClose=e.autoClose,this}toJSON(){let e=super.toJSON();e.autoClose=this.autoClose,e.curves=[];for(let t=0,n=this.curves.length;t<n;t++){let s=this.curves[t];e.curves.push(s.toJSON())}return e}fromJSON(e){super.fromJSON(e),this.autoClose=e.autoClose,this.curves=[];for(let t=0,n=e.curves.length;t<n;t++){let s=e.curves[t];this.curves.push(new Vc[s.type]().fromJSON(s))}return this}};var ss=class i extends hr{constructor(e=1,t=0){let n=(1+Math.sqrt(5))/2,s=[-1,n,0,1,n,0,-1,-n,0,1,-n,0,0,-1,n,0,1,n,0,-1,-n,0,1,-n,n,0,-1,n,0,1,-n,0,-1,-n,0,1],r=[0,11,5,0,5,1,0,1,7,0,7,10,0,10,11,1,5,9,5,11,4,11,10,2,10,7,6,7,1,8,3,9,4,3,4,2,3,2,6,3,6,8,3,8,9,4,9,5,2,4,11,6,2,10,8,6,7,9,8,1];super(s,r,e,t),this.type="IcosahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new i(e.radius,e.detail)}};var ea=class i extends hr{constructor(e=1,t=0){let n=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],s=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(n,s,e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new i(e.radius,e.detail)}},ki=class i extends Pt{constructor(e=1,t=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:s};let r=e/2,a=t/2,o=Math.floor(n),l=Math.floor(s),c=o+1,d=l+1,m=e/o,u=t/l,f=[],x=[],b=[],g=[];for(let p=0;p<d;p++){let A=p*u-a;for(let D=0;D<c;D++){let T=D*m-r;x.push(T,-A,0),b.push(0,0,1),g.push(D/o),g.push(1-p/l)}}for(let p=0;p<l;p++)for(let A=0;A<o;A++){let D=A+c*p,T=A+c*(p+1),P=A+1+c*(p+1),R=A+1+c*p;f.push(D,T,R),f.push(T,P,R)}this.setIndex(f),this.setAttribute("position",new it(x,3)),this.setAttribute("normal",new it(b,3)),this.setAttribute("uv",new it(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.width,e.height,e.widthSegments,e.heightSegments)}},rs=class i extends Pt{constructor(e=.5,t=1,n=32,s=1,r=0,a=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:s,thetaStart:r,thetaLength:a},n=Math.max(3,n),s=Math.max(1,s);let o=[],l=[],c=[],d=[],m=e,u=(t-e)/s,f=new N,x=new Oe;for(let b=0;b<=s;b++){for(let g=0;g<=n;g++){let p=r+g/n*a;f.x=m*Math.cos(p),f.y=m*Math.sin(p),l.push(f.x,f.y,f.z),c.push(0,0,1),x.x=(f.x/t+1)/2,x.y=(f.y/t+1)/2,d.push(x.x,x.y)}m+=u}for(let b=0;b<s;b++){let g=b*(n+1);for(let p=0;p<n;p++){let A=p+g,D=A,T=A+n+1,P=A+n+2,R=A+1;o.push(D,T,R),o.push(T,P,R)}}this.setIndex(o),this.setAttribute("position",new it(l,3)),this.setAttribute("normal",new it(c,3)),this.setAttribute("uv",new it(d,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}};var Jn=class i extends Pt{constructor(e=1,t=32,n=16,s=0,r=Math.PI*2,a=0,o=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:s,phiLength:r,thetaStart:a,thetaLength:o},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));let l=Math.min(a+o,Math.PI),c=0,d=[],m=new N,u=new N,f=[],x=[],b=[],g=[];for(let p=0;p<=n;p++){let A=[],D=p/n,T=a+D*o,P=e*Math.cos(T),R=Math.sqrt(e*e-P*P),U=0;p===0&&a===0?U=.5/t:p===n&&l===Math.PI&&(U=-.5/t);for(let _=0;_<=t;_++){let I=_/t,F=s+I*r;m.x=-R*Math.cos(F),m.y=P,m.z=R*Math.sin(F),x.push(m.x,m.y,m.z),u.copy(m).normalize(),b.push(u.x,u.y,u.z),g.push(I+U,1-D),A.push(c++)}d.push(A)}for(let p=0;p<n;p++)for(let A=0;A<t;A++){let D=d[p][A+1],T=d[p][A],P=d[p+1][A],R=d[p+1][A+1];(p!==0||a>0)&&f.push(D,T,R),(p!==n-1||l<Math.PI)&&f.push(T,P,R)}this.setIndex(f),this.setAttribute("position",new it(x,3)),this.setAttribute("normal",new it(b,3)),this.setAttribute("uv",new it(g,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}};var as=class i extends Pt{constructor(e=1,t=.4,n=12,s=48,r=Math.PI*2,a=0,o=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:s,arc:r,thetaStart:a,thetaLength:o},n=Math.floor(n),s=Math.floor(s);let l=[],c=[],d=[],m=[],u=new N,f=new N,x=new N;for(let b=0;b<=n;b++){let g=a+b/n*o;for(let p=0;p<=s;p++){let A=p/s*r;f.x=(e+t*Math.cos(g))*Math.cos(A),f.y=(e+t*Math.cos(g))*Math.sin(A),f.z=t*Math.sin(g),c.push(f.x,f.y,f.z),u.x=e*Math.cos(A),u.y=e*Math.sin(A),x.subVectors(f,u).normalize(),d.push(x.x,x.y,x.z),m.push(p/s),m.push(b/n)}}for(let b=1;b<=n;b++)for(let g=1;g<=s;g++){let p=(s+1)*b+g-1,A=(s+1)*(b-1)+g-1,D=(s+1)*(b-1)+g,T=(s+1)*b+g;l.push(p,A,T),l.push(A,D,T)}this.setIndex(l),this.setAttribute("position",new it(c,3)),this.setAttribute("normal",new it(d,3)),this.setAttribute("uv",new it(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new i(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc,e.thetaStart,e.thetaLength)}};var ta=class i extends Pt{constructor(e=new jr(new N(-1,-1,0),new N(-1,1,0),new N(1,1,0)),t=64,n=1,s=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:s,closed:r};let a=e.computeFrenetFrames(t,r);this.tangents=a.tangents,this.normals=a.normals,this.binormals=a.binormals;let o=new N,l=new N,c=new Oe,d=new N,m=[],u=[],f=[],x=[];b(),this.setIndex(x),this.setAttribute("position",new it(m,3)),this.setAttribute("normal",new it(u,3)),this.setAttribute("uv",new it(f,2));function b(){for(let D=0;D<t;D++)g(D);g(r===!1?t:0),A(),p()}function g(D){d=e.getPointAt(D/t,d);let T=a.normals[D],P=a.binormals[D];for(let R=0;R<=s;R++){let U=R/s*Math.PI*2,_=Math.sin(U),I=-Math.cos(U);l.x=I*T.x+_*P.x,l.y=I*T.y+_*P.y,l.z=I*T.z+_*P.z,l.normalize(),u.push(l.x,l.y,l.z),o.x=d.x+n*l.x,o.y=d.y+n*l.y,o.z=d.z+n*l.z,m.push(o.x,o.y,o.z)}}function p(){for(let D=1;D<=t;D++)for(let T=1;T<=s;T++){let P=(s+1)*(D-1)+(T-1),R=(s+1)*D+(T-1),U=(s+1)*D+T,_=(s+1)*(D-1)+T;x.push(P,R,_),x.push(R,U,_)}}function A(){for(let D=0;D<=t;D++)for(let T=0;T<=s;T++)c.x=D/t,c.y=T/s,f.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){let e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new i(new Vc[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}},dr=class extends Pt{constructor(e=null){if(super(),this.type="WireframeGeometry",this.parameters={geometry:e},e!==null){let t=[],n=new Set,s=new N,r=new N;if(e.index!==null){let a=e.attributes.position,o=e.index,l=e.groups;l.length===0&&(l=[{start:0,count:o.count,materialIndex:0}]);for(let c=0,d=l.length;c<d;++c){let m=l[c],u=m.start,f=m.count;for(let x=u,b=u+f;x<b;x+=3)for(let g=0;g<3;g++){let p=o.getX(x+g),A=o.getX(x+(g+1)%3);s.fromBufferAttribute(a,p),r.fromBufferAttribute(a,A),Eu(s,r,n)===!0&&(t.push(s.x,s.y,s.z),t.push(r.x,r.y,r.z))}}}else{let a=e.attributes.position;for(let o=0,l=a.count/3;o<l;o++)for(let c=0;c<3;c++){let d=3*o+c,m=3*o+(c+1)%3;s.fromBufferAttribute(a,d),r.fromBufferAttribute(a,m),Eu(s,r,n)===!0&&(t.push(s.x,s.y,s.z),t.push(r.x,r.y,r.z))}}this.setAttribute("position",new it(t,3))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}};function Eu(i,e,t){let n=`${i.x},${i.y},${i.z}-${e.x},${e.y},${e.z}`,s=`${e.x},${e.y},${e.z}-${i.x},${i.y},${i.z}`;return t.has(n)===!0||t.has(s)===!0?!1:(t.add(n),t.add(s),!0)}function Is(i){let e={};for(let t in i){e[t]={};for(let n in i[t]){let s=i[t][n];if(Cu(s))s.isRenderTargetTexture?(je("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=s.clone();else if(Array.isArray(s))if(Cu(s[0])){let r=[];for(let a=0,o=s.length;a<o;a++)r[a]=s[a].clone();e[t][n]=r}else e[t][n]=s.slice();else e[t][n]=s}}return e}function Pn(i){let e={};for(let t=0;t<i.length;t++){let n=Is(i[t]);for(let s in n)e[s]=n[s]}return e}function Cu(i){return i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)}function mp(i){let e=[];for(let t=0;t<i.length;t++)e.push(i[t].clone());return e}function mh(i){let e=i.getRenderTarget();return e===null?i.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:yt.workingColorSpace}var Sd={clone:Is,merge:Pn},gp=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,_p=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,dn=class extends li{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=gp,this.fragmentShader=_p,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Is(e.uniforms),this.uniformsGroups=mp(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this.defaultAttributeValues=Object.assign({},e.defaultAttributeValues),this.index0AttributeName=e.index0AttributeName,this.uniformsNeedUpdate=e.uniformsNeedUpdate,this}toJSON(e){let t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?t.uniforms[s]={type:"t",value:a.toJSON(e).uuid}:a&&a.isColor?t.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?t.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?t.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?t.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?t.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?t.uniforms[s]={type:"m4",value:a.toArray()}:t.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}fromJSON(e,t){if(super.fromJSON(e,t),e.uniforms!==void 0)for(let n in e.uniforms){let s=e.uniforms[n];switch(this.uniforms[n]={},s.type){case"t":this.uniforms[n].value=t[s.value]||null;break;case"c":this.uniforms[n].value=new Je().setHex(s.value);break;case"v2":this.uniforms[n].value=new Oe().fromArray(s.value);break;case"v3":this.uniforms[n].value=new N().fromArray(s.value);break;case"v4":this.uniforms[n].value=new Yt().fromArray(s.value);break;case"m3":this.uniforms[n].value=new st().fromArray(s.value);break;case"m4":this.uniforms[n].value=new Ut().fromArray(s.value);break;default:this.uniforms[n].value=s.value}}if(e.defines!==void 0&&(this.defines=e.defines),e.vertexShader!==void 0&&(this.vertexShader=e.vertexShader),e.fragmentShader!==void 0&&(this.fragmentShader=e.fragmentShader),e.glslVersion!==void 0&&(this.glslVersion=e.glslVersion),e.extensions!==void 0)for(let n in e.extensions)this.extensions[n]=e.extensions[n];return e.lights!==void 0&&(this.lights=e.lights),e.clipping!==void 0&&(this.clipping=e.clipping),this}},zo=class extends dn{constructor(e){super(e),this.isRawShaderMaterial=!0,this.type="RawShaderMaterial"}};var Vi=class extends li{constructor(e){super(),this.isMeshLambertMaterial=!0,this.type="MeshLambertMaterial",this.color=new Je(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Je(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Gl,this.normalScale=new Oe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Bi,this.combine=nl,this.reflectivity=1,this.envMapIntensity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.envMapIntensity=e.envMapIntensity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}},ko=class extends li{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=od,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}},Vo=class extends li{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}};function Ks(i,e){return!i||i.constructor===e?i:typeof e.BYTES_PER_ELEMENT=="number"?new e(i):Array.prototype.slice.call(i)}function Nc(i){return i!==void 0&&i.inTangents!==void 0&&i.outTangents!==void 0}var os=class{constructor(e,t,n,s){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){let t=this.parameterPositions,n=this._cachedIndex,s=t[n],r=t[n-1];n:{e:{let a;t:{i:if(!(e<s)){for(let o=n+2;;){if(s===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=s,s=t[++n],e<s)break e}a=t.length;break t}if(!(e>=r)){let o=t[1];e<o&&(n=2,r=o);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=t[--n-1],e>=r)break e}a=n,n=0;break t}break n}for(;n<a;){let o=n+a>>>1;e<t[o]?a=o:n=o+1}if(s=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,e,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){let t=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=e*s;for(let a=0;a!==s;++a)t[a]=n[r+a];return t}interpolate_(){throw new Error("THREE.Interpolant: Call to abstract method.")}intervalChanged_(){}},Go=class extends os{constructor(e,t,n,s){super(e,t,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Oc,endingEnd:Oc}}intervalChanged_(e,t,n){let s=this.parameterPositions,r=e-2,a=e+1,o=s[r],l=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case Bc:r=e,o=2*t-n;break;case zc:r=s.length-2,o=t+s[r]-s[r+1];break;default:r=e,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case Bc:a=e,l=2*n-t;break;case zc:a=1,l=n+s[1]-s[0];break;default:a=e-1,l=t}let c=(n-t)*.5,d=this.valueSize;this._weightPrev=c/(t-o),this._weightNext=c/(l-n),this._offsetPrev=r*d,this._offsetNext=a*d}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,d=this._offsetPrev,m=this._offsetNext,u=this._weightPrev,f=this._weightNext,x=(n-t)/(s-t),b=x*x,g=b*x,p=-u*g+2*u*b-u*x,A=(1+u)*g+(-1.5-2*u)*b+(-.5+u)*x+1,D=(-1-f)*g+(1.5+f)*b+.5*x,T=f*g-f*b;for(let P=0;P!==o;++P)r[P]=p*a[d+P]+A*a[c+P]+D*a[l+P]+T*a[m+P];return r}},Ho=class extends os{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,d=(n-t)/(s-t),m=1-d;for(let u=0;u!==o;++u)r[u]=a[c+u]*m+a[l+u]*d;return r}},Wo=class extends os{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e){return this.copySampleValue_(e-1)}},Xo=class extends os{interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=e*o,c=l-o,d=this.inTangents,m=this.outTangents;if(!d||!m){let x=(n-t)/(s-t),b=1-x;for(let g=0;g!==o;++g)r[g]=a[c+g]*b+a[l+g]*x;return r}let u=o*2,f=e-1;for(let x=0;x!==o;++x){let b=a[c+x],g=a[l+x],p=f*u+x*2,A=m[p],D=m[p+1],T=e*u+x*2,P=d[T],R=d[T+1],U=vp(n,t,A,P,s);r[x]=bd(U,b,D,R,g)}return r}};function bd(i,e,t,n,s){let r=1-i;return r*r*r*e+3*r*r*i*t+3*r*i*i*n+i*i*i*s}function xp(i,e,t,n,s){let r=1-i;return 3*r*r*(t-e)+6*r*i*(n-t)+3*i*i*(s-n)}function vp(i,e,t,n,s){let r=(i-e)/(s-e);for(let a=0;a<8;a++){let o=bd(r,e,t,n,s)-i;if(Math.abs(o)<1e-10)break;let l=xp(r,e,t,n,s);if(Math.abs(l)<1e-10)break;r=Math.max(0,Math.min(1,r-o/l))}return r}var Kn=class{constructor(e,t,n,s){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=Ks(t,this.TimeBufferType),this.values=Ks(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(e){let t=e.constructor,n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:Ks(e.times,Array),values:Ks(e.values,Array)};let s=e.getInterpolation();s!==e.DefaultInterpolation&&(n.interpolation=s),Nc(e.settings)&&(n.settings={inTangents:Ks(e.settings.inTangents,Array),outTangents:Ks(e.settings.outTangents,Array)})}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new Wo(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new Ho(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new Go(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodBezier(e){let t=new Xo(this.times,this.values,this.getValueSize(),e);return this.settings&&(t.inTangents=this.settings.inTangents,t.outTangents=this.settings.outTangents),t}setInterpolation(e){let t;switch(e){case zr:t=this.InterpolantFactoryMethodDiscrete;break;case bo:t=this.InterpolantFactoryMethodLinear;break;case ho:t=this.InterpolantFactoryMethodSmooth;break;case Fc:t=this.InterpolantFactoryMethodBezier;break}if(t===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return je("KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return zr;case this.InterpolantFactoryMethodLinear:return bo;case this.InterpolantFactoryMethodSmooth:return ho;case this.InterpolantFactoryMethodBezier:return Fc}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]+=e}return this}scale(e){if(e!==1){let t=this.times;for(let n=0,s=t.length;n!==s;++n)t[n]*=e;Nc(this.settings)&&(Ru(this.settings.inTangents,e),Ru(this.settings.outTangents,e))}return this}trim(e,t){let n=this.times,s=n.length,r=0,a=s-1;for(;r!==s&&n[r]<e;)++r;for(;a!==-1&&n[a]>t;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let e=!0,t=this.getValueSize();t-Math.floor(t)!==0&&(Qe("KeyframeTrack: Invalid value size in track.",this),e=!1);let n=this.times,s=this.values,r=n.length;r===0&&(Qe("KeyframeTrack: Track is empty.",this),e=!1);let a=null;for(let o=0;o!==r;o++){let l=n[o];if(typeof l=="number"&&isNaN(l)){Qe("KeyframeTrack: Time is not a valid number.",this,o,l),e=!1;break}if(a!==null&&a>l){Qe("KeyframeTrack: Out of order keys.",this,o,l,a),e=!1;break}a=l}if(s!==void 0&&Gf(s))for(let o=0,l=s.length;o!==l;++o){let c=s[o];if(isNaN(c)){Qe("KeyframeTrack: Value is not a valid number.",this,o,c),e=!1;break}}return e}optimize(){let e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===ho,r=e.length-1,a=1;for(let o=1;o<r;++o){let l=!1,c=e[o],d=e[o+1];if(c!==d&&(o!==1||c!==e[0]))if(s)l=!0;else{let m=o*n,u=m-n,f=m+n;for(let x=0;x!==n;++x){let b=t[m+x];if(b!==t[u+x]||b!==t[f+x]){l=!0;break}}}if(l){if(o!==a){e[a]=e[o];let m=o*n,u=a*n;for(let f=0;f!==n;++f)t[u+f]=t[m+f]}++a}}if(r>0){e[a]=e[r];for(let o=r*n,l=a*n,c=0;c!==n;++c)t[l+c]=t[o+c];++a}return a!==e.length?(this.times=e.slice(0,a),this.values=t.slice(0,a*n)):(this.times=e,this.values=t),this}clone(){let e=this.times.slice(),t=this.values.slice(),n=this.constructor,s=new n(this.name,e,t);return s.createInterpolant=this.createInterpolant,Nc(this.settings)&&(s.settings={inTangents:this.settings.inTangents.slice(),outTangents:this.settings.outTangents.slice()}),s}};function Ru(i,e){for(let t=0,n=i.length;t!==n;t+=2)i[t]*=e}Kn.prototype.ValueTypeName="";Kn.prototype.TimeBufferType=Float32Array;Kn.prototype.ValueBufferType=Float32Array;Kn.prototype.DefaultInterpolation=bo;var ls=class extends Kn{constructor(e,t,n){super(e,t,n)}};ls.prototype.ValueTypeName="bool";ls.prototype.ValueBufferType=Array;ls.prototype.DefaultInterpolation=zr;ls.prototype.InterpolantFactoryMethodLinear=void 0;ls.prototype.InterpolantFactoryMethodSmooth=void 0;var qo=class extends Kn{constructor(e,t,n,s){super(e,t,n,s)}};qo.prototype.ValueTypeName="color";var Yo=class extends Kn{constructor(e,t,n,s){super(e,t,n,s)}};Yo.prototype.ValueTypeName="number";var Zo=class extends os{constructor(e,t,n,s){super(e,t,n,s)}interpolate_(e,t,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-t)/(s-t),c=e*o;for(let d=c+o;c!==d;c+=4)Qn.slerpFlat(r,0,a,c-o,a,c,l);return r}},na=class extends Kn{constructor(e,t,n,s){super(e,t,n,s)}InterpolantFactoryMethodLinear(e){return new Zo(this.times,this.values,this.getValueSize(),e)}};na.prototype.ValueTypeName="quaternion";na.prototype.InterpolantFactoryMethodSmooth=void 0;var cs=class extends Kn{constructor(e,t,n){super(e,t,n)}};cs.prototype.ValueTypeName="string";cs.prototype.ValueBufferType=Array;cs.prototype.DefaultInterpolation=zr;cs.prototype.InterpolantFactoryMethodLinear=void 0;cs.prototype.InterpolantFactoryMethodSmooth=void 0;var $o=class extends Kn{constructor(e,t,n,s){super(e,t,n,s)}};$o.prototype.ValueTypeName="vector";var fo={enabled:!1,files:{},add:function(i,e){this.enabled!==!1&&(Pu(i)||(this.files[i]=e))},get:function(i){if(this.enabled!==!1&&!Pu(i))return this.files[i]},remove:function(i){delete this.files[i]},clear:function(){this.files={}}};function Pu(i){try{let e=i.slice(i.indexOf(":")+1);return new URL(e).protocol==="blob:"}catch{return!1}}var Jo=class{constructor(e,t,n){let s=this,r=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this._abortController=null,this.itemStart=function(d){o++,r===!1&&s.onStart!==void 0&&s.onStart(d,a,o),r=!0},this.itemEnd=function(d){a++,s.onProgress!==void 0&&s.onProgress(d,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(d){s.onError!==void 0&&s.onError(d)},this.resolveURL=function(d){return d=d.normalize("NFC"),l?l(d):d},this.setURLModifier=function(d){return l=d,this},this.addHandler=function(d,m){return c.push(d,m),this},this.removeHandler=function(d){let m=c.indexOf(d);return m!==-1&&c.splice(m,2),this},this.getHandler=function(d){for(let m=0,u=c.length;m<u;m+=2){let f=c[m],x=c[m+1];if(f.global&&(f.lastIndex=0),f.test(d))return x}return null},this.abort=function(){return this.abortController.abort(),this._abortController=null,this}}get abortController(){return this._abortController||(this._abortController=new AbortController),this._abortController}},wd=new Jo,fr=class{constructor(e){this.manager=e!==void 0?e:wd,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}load(){}loadAsync(e,t){let n=this;return new Promise(function(s,r){n.load(e,s,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}};fr.DEFAULT_MATERIAL_NAME="__DEFAULT";var js=new WeakMap,Ko=class extends fr{constructor(e){super(e)}load(e,t,n,s){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);let r=this,a=fo.get(`image:${e}`);if(a!==void 0){if(a.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(a),r.manager.itemEnd(e)},0);else{let m=js.get(a);m===void 0&&(m=[],js.set(a,m)),m.push({onLoad:t,onError:s})}return a}let o=sr("img");function l(){d(),t&&t(this);let m=js.get(this)||[];for(let u=0;u<m.length;u++){let f=m[u];f.onLoad&&f.onLoad(this)}js.delete(this),r.manager.itemEnd(e)}function c(m){d(),s&&s(m),fo.remove(`image:${e}`);let u=js.get(this)||[];for(let f=0;f<u.length;f++){let x=u[f];x.onError&&x.onError(m)}js.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function d(){o.removeEventListener("load",l,!1),o.removeEventListener("error",c,!1)}return o.addEventListener("load",l,!1),o.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(o.crossOrigin=this.crossOrigin),fo.add(`image:${e}`,o),r.manager.itemStart(e),o.src=e,o}};var ia=class extends fr{constructor(e){super(e)}load(e,t,n,s){let r=new Rn,a=new Ko(this.manager);return a.setCrossOrigin(this.crossOrigin),a.setPath(this.path),a.load(e,function(o){r.image=o,r.needsUpdate=!0,t!==void 0&&t(r)},n,s),r}},sa=class extends un{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Je(e),this.intensity=t}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){let t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,t}},ra=class extends sa{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(un.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Je(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}toJSON(e){let t=super.toJSON(e);return t.object.groundColor=this.groundColor.getHex(),t}},Uc=new Ut,Iu=new N,Lu=new N,jo=class{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.biasNode=null,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Oe(512,512),this.mapType=kn,this.map=null,this.mapPass=null,this.matrix=new Ut,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new cr,this._frameExtents=new Oe(1,1),this._viewportCount=1,this._viewports=[new Yt(0,0,1,1)]}getViewportCount(){return this._viewportCount}getCamera(){return this.camera}getFrustum(){return this._frustum}updateMatrices(e){let t=this.camera;Iu.setFromMatrixPosition(e.matrixWorld),t.position.copy(Iu),Lu.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Lu),t.updateMatrixWorld(),this._updateMatrix(t,this.matrix,this._frustum)}_updateMatrix(e,t,n,s){Uc.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),n.setFromProjectionMatrix(Uc,e.coordinateSystem,e.reversedDepth);let r=this._frameExtents,a=s?s.z/r.x:1,o=s?s.w/r.y:1,l=s?s.x/r.x:0,c=s?s.y/r.y:0;e.coordinateSystem===ir||e.reversedDepth?t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,1,0,0,0,0,1):t.set(.5*a,0,0,.5*a+l,0,.5*o,0,.5*o+c,0,0,.5,.5,0,0,0,1),t.multiply(Uc)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this.biasNode=e.biasNode,this}clone(){return new this.constructor().copy(this)}toJSON(){let e={};return e.intensity=this.intensity,e.bias=this.bias,e.normalBias=this.normalBias,e.radius=this.radius,e.blurSamples=this.blurSamples,e.mapSize=this.mapSize.toArray(),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}},lo=new N,co=new Qn,gi=new N,aa=class extends un{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ut,this.projectionMatrix=new Ut,this.projectionMatrixInverse=new Ut,this.coordinateSystem=oi,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorld.decompose(lo,co,gi),gi.x===1&&gi.y===1&&gi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(lo,co,gi.set(1,1,1)).invert()}updateWorldMatrix(e,t,n=!1){super.updateWorldMatrix(e,t,n),this.matrixWorld.decompose(lo,co,gi),gi.x===1&&gi.y===1&&gi.z===1?this.matrixWorldInverse.copy(this.matrixWorld).invert():this.matrixWorldInverse.compose(lo,co,gi.set(1,1,1)).invert()}clone(){return new this.constructor().copy(this)}},Ji=new N,Du=new Oe,Nu=new Oe,Cn=class extends aa{constructor(e=50,t=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){let t=.5*this.getFilmHeight()/e;this.fov=wo*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){let e=Math.tan(lc*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return wo*2*Math.atan(Math.tan(lc*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){Ji.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(Ji.x,Ji.y).multiplyScalar(-e/Ji.z),Ji.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Ji.x,Ji.y).multiplyScalar(-e/Ji.z)}getViewSize(e,t){return this.getViewBounds(e,Du,Nu),t.subVectors(Nu,Du)}setViewOffset(e,t,n,s,r,a){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=this.near,t=e*Math.tan(lc*.5*this.fov)/this.zoom,n=2*t,s=this.aspect*n,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,t-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}let o=this.filmOffset;o!==0&&(r+=e*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}};var pr=class extends aa{constructor(e=-1,t=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-e,a=n+e,o=s+t,l=s-t;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,d=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=d*this.view.offsetY,l=o-d*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){let t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}},Gc=class extends jo{constructor(){super(new pr(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},oa=class extends sa{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(un.DEFAULT_UP),this.updateMatrix(),this.target=new un,this.shadow=new Gc}dispose(){super.dispose(),this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}toJSON(e){let t=super.toJSON(e);return t.object.shadow=this.shadow.toJSON(),t.object.target=this.target.uuid,t}};var Qs=-90,er=1,Qo=class extends un{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Cn(Qs,er,e,t);s.layers=this.layers,this.add(s);let r=new Cn(Qs,er,e,t);r.layers=this.layers,this.add(r);let a=new Cn(Qs,er,e,t);a.layers=this.layers,this.add(a);let o=new Cn(Qs,er,e,t);o.layers=this.layers,this.add(o);let l=new Cn(Qs,er,e,t);l.layers=this.layers,this.add(l);let c=new Cn(Qs,er,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let e=this.coordinateSystem,t=this.children.concat(),[n,s,r,a,o,l]=t;for(let c of t)this.remove(c);if(e===oi)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===ir)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(let c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,l,c,d]=this.children,m=e.getRenderTarget(),u=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),x=e.xr.enabled;e.xr.enabled=!1;let b=n.texture.generateMipmaps;n.texture.generateMipmaps=!1;let g=!1;e.isWebGLRenderer===!0?g=e.state.buffers.depth.getReversed():g=e.reversedDepthBuffer,e.setRenderTarget(n,0,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,r),e.setRenderTarget(n,1,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,a),e.setRenderTarget(n,2,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,o),e.setRenderTarget(n,3,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,l),e.setRenderTarget(n,4,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,c),n.texture.generateMipmaps=b,e.setRenderTarget(n,5,s),g&&e.autoClear===!1&&e.clearDepth(),e.render(t,d),e.setRenderTarget(m,u,f),e.xr.enabled=x,n.texture.needsPMREMUpdate=!0}},el=class extends Cn{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}};var gh="\\[\\]\\.:\\/",yp=new RegExp("["+gh+"]","g"),_h="[^"+gh+"]",Mp="[^"+gh.replace("\\.","")+"]",Sp=/((?:WC+[\/:])*)/.source.replace("WC",_h),bp=/(WCOD+)?/.source.replace("WCOD",Mp),wp=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",_h),Tp=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",_h),Ap=new RegExp("^"+Sp+bp+wp+Tp+"$"),Ep=["material","materials","bones","map"],Hc=class{constructor(e,t,n){let s=n||Ht.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,s)}getValue(e,t){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(e,t)}setValue(e,t){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(e,t)}bind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){let e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}},Ht=class i{constructor(e,t,n){this.path=t,this.parsedPath=n||i.parseTrackName(t),this.node=i.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new i.Composite(e,t,n):new i(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(yp,"")}static parseTrackName(e){let t=Ap.exec(e);if(t===null)throw new Error("THREE.PropertyBinding: Cannot parse trackName: "+e);let n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);Ep.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("THREE.PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){let n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){let n=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===t||o.uuid===t)return o;let l=n(o.children);if(l)return l}return null},s=n(e.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)e[t++]=n[s]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++]}_setValue_array_setNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node,t=this.parsedPath,n=t.objectName,s=t.propertyName,r=t.propertyIndex;if(e||(e=i.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){je("PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){Qe("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){Qe("PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){Qe("PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let d=0;d<e.length;d++)if(e[d].name===c){c=d;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){Qe("PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){Qe("PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){Qe("PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){Qe("PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}let a=e[s];if(a===void 0){let c=t.nodeName;Qe("PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",e);return}let o=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?o=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!e.geometry){Qe("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){Qe("PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};Ht.Composite=Hc;Ht.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};Ht.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};Ht.prototype.GetterByBindingType=[Ht.prototype._getValue_direct,Ht.prototype._getValue_array,Ht.prototype._getValue_arrayElement,Ht.prototype._getValue_toArray];Ht.prototype.SetterByBindingTypeAndVersioning=[[Ht.prototype._setValue_direct,Ht.prototype._setValue_direct_setNeedsUpdate,Ht.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[Ht.prototype._setValue_array,Ht.prototype._setValue_array_setNeedsUpdate,Ht.prototype._setValue_array_setMatrixWorldNeedsUpdate],[Ht.prototype._setValue_arrayElement,Ht.prototype._setValue_arrayElement_setNeedsUpdate,Ht.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[Ht.prototype._setValue_fromArray,Ht.prototype._setValue_fromArray_setNeedsUpdate,Ht.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var Tx=new Float32Array(1);var Uu=new Ut,la=class{constructor(e,t,n=0,s=1/0){this.ray=new ws(e,t),this.near=n,this.far=s,this.camera=null,this.layers=new or,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(e,t){this.ray.set(e,t)}setFromCamera(e,t){t.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(e.x,e.y,.5).unproject(t).sub(this.ray.origin).normalize(),this.camera=t):t.isOrthographicCamera?(this.ray.origin.set(e.x,e.y,t.projectionMatrix.elements[14]).unproject(t),this.ray.direction.set(0,0,-1).transformDirection(t.matrixWorld),this.camera=t):Qe("Raycaster: Unsupported camera type: "+t.type)}setFromXRController(e){return Uu.identity().extractRotation(e.matrixWorld),this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(Uu),this}intersectObject(e,t=!0,n=[]){return Wc(e,this,n,t),n.sort(Fu),n}intersectObjects(e,t=!0,n=[]){for(let s=0,r=e.length;s<r;s++)Wc(e[s],this,n,t);return n.sort(Fu),n}};function Fu(i,e){return i.distance-e.distance}function Wc(i,e,t,n){let s=!0;if(i.layers.test(e.layers)&&i.raycast(e,t)===!1&&(s=!1),s===!0&&n===!0){let r=i.children;for(let a=0,o=r.length;a<o;a++)Wc(r[a],e,t,!0)}}var bh=class bh{constructor(e,t,n,s){this.elements=[1,0,0,1],e!==void 0&&this.set(e,t,n,s)}identity(){return this.set(1,0,0,1),this}fromArray(e,t=0){for(let n=0;n<4;n++)this.elements[n]=e[n+t];return this}set(e,t,n,s){let r=this.elements;return r[0]=e,r[2]=t,r[1]=n,r[3]=s,this}};bh.prototype.isMatrix2=!0;var Xc=bh;function xh(i,e,t,n){let s=Cp(n);switch(t){case ch:return i*e;case uh:return i*e/s.components*s.byteLength;case cl:return i*e/s.components*s.byteLength;case ms:return i*e*2/s.components*s.byteLength;case hl:return i*e*2/s.components*s.byteLength;case hh:return i*e*3/s.components*s.byteLength;case ti:return i*e*4/s.components*s.byteLength;case ul:return i*e*4/s.components*s.byteLength;case da:case fa:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case pa:case ma:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case fl:case ml:return Math.max(i,16)*Math.max(e,8)/4;case dl:case pl:return Math.max(i,8)*Math.max(e,8)/2;case gl:case _l:case vl:case yl:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*8;case xl:case ga:case Ml:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case Sl:return Math.floor((i+3)/4)*Math.floor((e+3)/4)*16;case bl:return Math.floor((i+4)/5)*Math.floor((e+3)/4)*16;case wl:return Math.floor((i+4)/5)*Math.floor((e+4)/5)*16;case Tl:return Math.floor((i+5)/6)*Math.floor((e+4)/5)*16;case Al:return Math.floor((i+5)/6)*Math.floor((e+5)/6)*16;case El:return Math.floor((i+7)/8)*Math.floor((e+4)/5)*16;case Cl:return Math.floor((i+7)/8)*Math.floor((e+5)/6)*16;case Rl:return Math.floor((i+7)/8)*Math.floor((e+7)/8)*16;case Pl:return Math.floor((i+9)/10)*Math.floor((e+4)/5)*16;case Il:return Math.floor((i+9)/10)*Math.floor((e+5)/6)*16;case Ll:return Math.floor((i+9)/10)*Math.floor((e+7)/8)*16;case Dl:return Math.floor((i+9)/10)*Math.floor((e+9)/10)*16;case Nl:return Math.floor((i+11)/12)*Math.floor((e+9)/10)*16;case Ul:return Math.floor((i+11)/12)*Math.floor((e+11)/12)*16;case Fl:case Ol:case Bl:return Math.ceil(i/4)*Math.ceil(e/4)*16;case zl:case kl:return Math.ceil(i/4)*Math.ceil(e/4)*8;case _a:case Vl:return Math.ceil(i/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Cp(i){switch(i){case kn:case rh:return{byteLength:1,components:1};case gr:case ah:case pi:return{byteLength:2,components:1};case ol:case ll:return{byteLength:2,components:4};case di:case al:case fi:return{byteLength:4,components:1};case oh:case lh:return{byteLength:4,components:3}}throw new Error(`THREE.TextureUtils: Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"186"}}));typeof window<"u"&&(window.__THREE__?je("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="186");function qd(){let i=null,e=!1,t=null,n=null;function s(r,a){n=i.requestAnimationFrame(s),t(r,a)}return{start:function(){e!==!0&&t!==null&&i!==null&&(n=i.requestAnimationFrame(s),e=!0)},stop:function(){i!==null&&i.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){i=r}}}function Pp(i){let e=new WeakMap;function t(o,l){let c=o.array,d=o.usage,m=c.byteLength,u=i.createBuffer();i.bindBuffer(l,u),i.bufferData(l,c,d),o.onUploadCallback();let f;if(c instanceof Float32Array)f=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=i.SHORT;else if(c instanceof Uint32Array)f=i.UNSIGNED_INT;else if(c instanceof Int32Array)f=i.INT;else if(c instanceof Int8Array)f=i.BYTE;else if(c instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:u,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:m}}function n(o,l,c){let d=l.array,m=l.updateRanges;if(i.bindBuffer(c,o),m.length===0)i.bufferSubData(c,0,d);else{m.sort((f,x)=>f.start-x.start);let u=0;for(let f=1;f<m.length;f++){let x=m[u],b=m[f];b.start<=x.start+x.count+1?x.count=Math.max(x.count,b.start+b.count-x.start):(++u,m[u]=b)}m.length=u+1;for(let f=0,x=m.length;f<x;f++){let b=m[f];i.bufferSubData(c,b.start*d.BYTES_PER_ELEMENT,d,b.start,b.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),e.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=e.get(o);l&&(i.deleteBuffer(l.buffer),e.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let d=e.get(o);(!d||d.version<o.version)&&e.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=e.get(o);if(c===void 0)e.set(o,t(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var Ip=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,Lp=`#ifdef USE_ALPHAHASH
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
#endif`,Dp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Np=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Up=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Fp=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Op=`#ifdef USE_AOMAP
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
#endif`,Bp=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,zp=`#ifdef USE_BATCHING
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
#endif`,kp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Vp=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Gp=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Hp=`float G_BlinnPhong_Implicit( ) {
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
} // validated`,Wp=`#ifdef USE_IRIDESCENCE
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
#endif`,Xp=`#ifdef USE_BUMPMAP
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
#endif`,qp=`#if NUM_CLIPPING_PLANES > 0
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
#endif`,Yp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,Zp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,$p=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,Jp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#endif`,Kp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#endif`,jp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec4 vColor;
#endif`,Qp=`#if defined( USE_COLOR ) || defined( USE_COLOR_ALPHA ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
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
#endif`,em=`#define PI 3.141592653589793
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
} // validated`,tm=`#ifdef ENVMAP_TYPE_CUBE_UV
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
#endif`,nm=`vec3 transformedNormal = objectNormal;
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
#endif`,im=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,sm=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,rm=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,am=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,om="gl_FragColor = linearToOutputTexel( gl_FragColor );",lm=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,cm=`#ifdef USE_ENVMAP
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
#endif`,hm=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
#endif`,um=`#ifdef USE_ENVMAP
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
#endif`,dm=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,fm=`#ifdef USE_ENVMAP
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
#endif`,pm=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,mm=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,gm=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,_m=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,xm=`#ifdef USE_GRADIENTMAP
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
}`,vm=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,ym=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Mm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Sm=`uniform bool receiveShadow;
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
#include <lightprobes_pars_fragment>`,bm=`#ifdef USE_ENVMAP
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
#endif`,wm=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Tm=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Am=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Em=`varying vec3 vViewPosition;
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
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Cm=`PhysicalMaterial material;
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
#endif`,Rm=`uniform sampler2D dfgLUT;
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
}`,Pm=`
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
#endif`,Im=`#if defined( RE_IndirectDiffuse )
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
#endif`,Lm=`#if defined( RE_IndirectDiffuse )
	#if defined( LAMBERT ) || defined( PHONG )
		irradiance += iblIrradiance;
	#endif
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Dm=`#ifdef USE_LIGHT_PROBES_GRID
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
#endif`,Nm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Um=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Fm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Om=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Bm=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,zm=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,km=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
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
#endif`,Vm=`#if defined( USE_POINTS_UV )
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
#endif`,Gm=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Hm=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Wm=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,Xm=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,qm=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,Ym=`#ifdef USE_MORPHTARGETS
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
#endif`,Zm=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,$m=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
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
vec3 nonPerturbedNormal = normal;`,Jm=`#ifdef USE_NORMALMAP_OBJECTSPACE
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
#endif`,Km=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,jm=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,Qm=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
		#ifdef FLIP_SIDED
			vBitangent = - vBitangent;
		#endif
	#endif
#endif`,e0=`#ifdef USE_NORMALMAP
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
#endif`,t0=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,n0=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,i0=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,s0=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,r0=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,a0=`vec3 packNormalToRGB( const in vec3 normal ) {
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
}`,o0=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,l0=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,c0=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,h0=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,u0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,d0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,f0=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,p0=`#if NUM_SPOT_LIGHT_COORDS > 0
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
#endif`,m0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_SUN_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
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
#endif`,g0=`float getShadowMask() {
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
}`,_0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,x0=`#ifdef USE_SKINNING
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
#endif`,v0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,y0=`#ifdef USE_SKINNING
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
#endif`,M0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,S0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,b0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,w0=`#ifndef saturate
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
vec3 CustomToneMapping( vec3 color ) { return color; }`,T0=`#ifdef USE_TRANSMISSION
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
#endif`,A0=`#ifdef USE_TRANSMISSION
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
#endif`,E0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,C0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,R0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
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
#endif`,P0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,I0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,L0=`uniform sampler2D t2D;
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
}`,D0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,N0=`#ifdef ENVMAP_TYPE_CUBE
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
}`,U0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,F0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,O0=`#include <common>
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
}`,B0=`#if DEPTH_PACKING == 3200
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
}`,z0=`#define DISTANCE
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
}`,k0=`#define DISTANCE
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
}`,V0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,G0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,H0=`uniform float scale;
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
}`,W0=`uniform vec3 diffuse;
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
}`,X0=`#include <common>
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
}`,q0=`uniform vec3 diffuse;
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
}`,Y0=`#define LAMBERT
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
}`,Z0=`#define LAMBERT
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
}`,$0=`#define MATCAP
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
}`,J0=`#define MATCAP
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
}`,K0=`#define NORMAL
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
}`,j0=`#define NORMAL
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
}`,Q0=`#define PHONG
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
}`,eg=`#define PHONG
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
}`,tg=`#define STANDARD
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
}`,ng=`#define STANDARD
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
}`,ig=`#define TOON
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
}`,sg=`#define TOON
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
}`,rg=`uniform float size;
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
}`,ag=`uniform vec3 diffuse;
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
}`,og=`#include <common>
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
}`,lg=`uniform vec3 color;
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
}`,cg=`uniform float rotation;
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
}`,hg=`uniform vec3 diffuse;
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
}`,ut={alphahash_fragment:Ip,alphahash_pars_fragment:Lp,alphamap_fragment:Dp,alphamap_pars_fragment:Np,alphatest_fragment:Up,alphatest_pars_fragment:Fp,aomap_fragment:Op,aomap_pars_fragment:Bp,batching_pars_vertex:zp,batching_vertex:kp,begin_vertex:Vp,beginnormal_vertex:Gp,bsdfs:Hp,iridescence_fragment:Wp,bumpmap_pars_fragment:Xp,clipping_planes_fragment:qp,clipping_planes_pars_fragment:Yp,clipping_planes_pars_vertex:Zp,clipping_planes_vertex:$p,color_fragment:Jp,color_pars_fragment:Kp,color_pars_vertex:jp,color_vertex:Qp,common:em,cube_uv_reflection_fragment:tm,defaultnormal_vertex:nm,displacementmap_pars_vertex:im,displacementmap_vertex:sm,emissivemap_fragment:rm,emissivemap_pars_fragment:am,colorspace_fragment:om,colorspace_pars_fragment:lm,envmap_fragment:cm,envmap_common_pars_fragment:hm,envmap_pars_fragment:um,envmap_pars_vertex:dm,envmap_physical_pars_fragment:bm,envmap_vertex:fm,fog_vertex:pm,fog_pars_vertex:mm,fog_fragment:gm,fog_pars_fragment:_m,gradientmap_pars_fragment:xm,lightmap_pars_fragment:vm,lights_lambert_fragment:ym,lights_lambert_pars_fragment:Mm,lights_pars_begin:Sm,lights_toon_fragment:wm,lights_toon_pars_fragment:Tm,lights_phong_fragment:Am,lights_phong_pars_fragment:Em,lights_physical_fragment:Cm,lights_physical_pars_fragment:Rm,lights_fragment_begin:Pm,lights_fragment_maps:Im,lights_fragment_end:Lm,lightprobes_pars_fragment:Dm,logdepthbuf_fragment:Nm,logdepthbuf_pars_fragment:Um,logdepthbuf_pars_vertex:Fm,logdepthbuf_vertex:Om,map_fragment:Bm,map_pars_fragment:zm,map_particle_fragment:km,map_particle_pars_fragment:Vm,metalnessmap_fragment:Gm,metalnessmap_pars_fragment:Hm,morphinstance_vertex:Wm,morphcolor_vertex:Xm,morphnormal_vertex:qm,morphtarget_pars_vertex:Ym,morphtarget_vertex:Zm,normal_fragment_begin:$m,normal_fragment_maps:Jm,normal_pars_fragment:Km,normal_pars_vertex:jm,normal_vertex:Qm,normalmap_pars_fragment:e0,clearcoat_normal_fragment_begin:t0,clearcoat_normal_fragment_maps:n0,clearcoat_pars_fragment:i0,iridescence_pars_fragment:s0,opaque_fragment:r0,packing:a0,premultiplied_alpha_fragment:o0,project_vertex:l0,dithering_fragment:c0,dithering_pars_fragment:h0,roughnessmap_fragment:u0,roughnessmap_pars_fragment:d0,shadowmap_pars_fragment:f0,shadowmap_pars_vertex:p0,shadowmap_vertex:m0,shadowmask_pars_fragment:g0,skinbase_vertex:_0,skinning_pars_vertex:x0,skinning_vertex:v0,skinnormal_vertex:y0,specularmap_fragment:M0,specularmap_pars_fragment:S0,tonemapping_fragment:b0,tonemapping_pars_fragment:w0,transmission_fragment:T0,transmission_pars_fragment:A0,uv_pars_fragment:E0,uv_pars_vertex:C0,uv_vertex:R0,worldpos_vertex:P0,background_vert:I0,background_frag:L0,backgroundCube_vert:D0,backgroundCube_frag:N0,cube_vert:U0,cube_frag:F0,depth_vert:O0,depth_frag:B0,distance_vert:z0,distance_frag:k0,equirect_vert:V0,equirect_frag:G0,linedashed_vert:H0,linedashed_frag:W0,meshbasic_vert:X0,meshbasic_frag:q0,meshlambert_vert:Y0,meshlambert_frag:Z0,meshmatcap_vert:$0,meshmatcap_frag:J0,meshnormal_vert:K0,meshnormal_frag:j0,meshphong_vert:Q0,meshphong_frag:eg,meshphysical_vert:tg,meshphysical_frag:ng,meshtoon_vert:ig,meshtoon_frag:sg,points_vert:rg,points_frag:ag,shadow_vert:og,shadow_frag:lg,sprite_vert:cg,sprite_frag:hg},Ie={common:{diffuse:{value:new Je(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new st},alphaMap:{value:null},alphaMapTransform:{value:new st},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new st}},envmap:{envMap:{value:null},envMapRotation:{value:new st},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98},dfgLUT:{value:null}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new st}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new st}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new st},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new st},normalScale:{value:new Oe(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new st},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new st}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new st}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new st}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Je(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},sunLights:{value:[],properties:{direction:{},color:{}}},sunLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},sunShadowMatrix:{value:[]},sunShadowCascade:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null},probesSH:{value:null},probesMin:{value:new N},probesMax:{value:new N},probesResolution:{value:new N}},points:{diffuse:{value:new Je(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new st},alphaTest:{value:0},uvTransform:{value:new st}},sprite:{diffuse:{value:new Je(16777215)},opacity:{value:1},center:{value:new Oe(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new st},alphaMap:{value:null},alphaMapTransform:{value:new st},alphaTest:{value:0}}},Ti={basic:{uniforms:Pn([Ie.common,Ie.specularmap,Ie.envmap,Ie.aomap,Ie.lightmap,Ie.fog]),vertexShader:ut.meshbasic_vert,fragmentShader:ut.meshbasic_frag},lambert:{uniforms:Pn([Ie.common,Ie.specularmap,Ie.envmap,Ie.aomap,Ie.lightmap,Ie.emissivemap,Ie.bumpmap,Ie.normalmap,Ie.displacementmap,Ie.fog,Ie.lights,{emissive:{value:new Je(0)},envMapIntensity:{value:1}}]),vertexShader:ut.meshlambert_vert,fragmentShader:ut.meshlambert_frag},phong:{uniforms:Pn([Ie.common,Ie.specularmap,Ie.envmap,Ie.aomap,Ie.lightmap,Ie.emissivemap,Ie.bumpmap,Ie.normalmap,Ie.displacementmap,Ie.fog,Ie.lights,{emissive:{value:new Je(0)},specular:{value:new Je(1118481)},shininess:{value:30},envMapIntensity:{value:1}}]),vertexShader:ut.meshphong_vert,fragmentShader:ut.meshphong_frag},standard:{uniforms:Pn([Ie.common,Ie.envmap,Ie.aomap,Ie.lightmap,Ie.emissivemap,Ie.bumpmap,Ie.normalmap,Ie.displacementmap,Ie.roughnessmap,Ie.metalnessmap,Ie.fog,Ie.lights,{emissive:{value:new Je(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:ut.meshphysical_vert,fragmentShader:ut.meshphysical_frag},toon:{uniforms:Pn([Ie.common,Ie.aomap,Ie.lightmap,Ie.emissivemap,Ie.bumpmap,Ie.normalmap,Ie.displacementmap,Ie.gradientmap,Ie.fog,Ie.lights,{emissive:{value:new Je(0)}}]),vertexShader:ut.meshtoon_vert,fragmentShader:ut.meshtoon_frag},matcap:{uniforms:Pn([Ie.common,Ie.bumpmap,Ie.normalmap,Ie.displacementmap,Ie.fog,{matcap:{value:null}}]),vertexShader:ut.meshmatcap_vert,fragmentShader:ut.meshmatcap_frag},points:{uniforms:Pn([Ie.points,Ie.fog]),vertexShader:ut.points_vert,fragmentShader:ut.points_frag},dashed:{uniforms:Pn([Ie.common,Ie.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:ut.linedashed_vert,fragmentShader:ut.linedashed_frag},depth:{uniforms:Pn([Ie.common,Ie.displacementmap]),vertexShader:ut.depth_vert,fragmentShader:ut.depth_frag},normal:{uniforms:Pn([Ie.common,Ie.bumpmap,Ie.normalmap,Ie.displacementmap,{opacity:{value:1}}]),vertexShader:ut.meshnormal_vert,fragmentShader:ut.meshnormal_frag},sprite:{uniforms:Pn([Ie.sprite,Ie.fog]),vertexShader:ut.sprite_vert,fragmentShader:ut.sprite_frag},background:{uniforms:{uvTransform:{value:new st},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:ut.background_vert,fragmentShader:ut.background_frag},backgroundCube:{uniforms:{envMap:{value:null},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new st}},vertexShader:ut.backgroundCube_vert,fragmentShader:ut.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:ut.cube_vert,fragmentShader:ut.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:ut.equirect_vert,fragmentShader:ut.equirect_frag},distance:{uniforms:Pn([Ie.common,Ie.displacementmap,{referencePosition:{value:new N},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:ut.distance_vert,fragmentShader:ut.distance_frag},shadow:{uniforms:Pn([Ie.lights,Ie.fog,{color:{value:new Je(0)},opacity:{value:1}}]),vertexShader:ut.shadow_vert,fragmentShader:ut.shadow_frag}};Ti.physical={uniforms:Pn([Ti.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new st},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new st},clearcoatNormalScale:{value:new Oe(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new st},dispersion:{value:0},retroreflectivity:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new st},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new st},sheen:{value:0},sheenColor:{value:new Je(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new st},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new st},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new st},transmissionSamplerSize:{value:new Oe},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new st},attenuationDistance:{value:0},attenuationColor:{value:new Je(0)},specularColor:{value:new Je(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new st},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new st},anisotropyVector:{value:new Oe},anisotropyMap:{value:null},anisotropyMapTransform:{value:new st}}]),vertexShader:ut.meshphysical_vert,fragmentShader:ut.meshphysical_frag};var Xl={r:0,b:0,g:0},ug=new Ut,Yd=new st;Yd.set(-1,0,0,0,1,0,0,0,1);function dg(i,e,t,n,s,r){let a=new Je(0),o=s===!0?0:1,l,c,d=null,m=0,u=null;function f(A){let D=A.isScene===!0?A.background:null;if(D&&D.isTexture){let T=A.backgroundBlurriness>0;D=e.get(D,T)}return D}function x(A){let D=!1,T=f(A);T===null?g(a,o):T&&T.isColor&&(g(T,1),D=!0);let P=i.xr.getEnvironmentBlendMode();P==="additive"?t.buffers.color.setClear(0,0,0,1,r):P==="alpha-blend"&&t.buffers.color.setClear(0,0,0,0,r),(i.autoClear||D)&&(t.buffers.depth.setTest(!0),t.buffers.depth.setMask(!0),t.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function b(A,D){let T=f(D);T&&(T.isCubeTexture||T.mapping===ha)?(c===void 0&&(c=new vt(new Si(1,1,1),new dn({name:"BackgroundCubeMaterial",uniforms:Is(Ti.backgroundCube.uniforms),vertexShader:Ti.backgroundCube.vertexShader,fragmentShader:Ti.backgroundCube.fragmentShader,side:_n,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),c.geometry.deleteAttribute("uv"),c.onBeforeRender=function(P,R,U){this.matrixWorld.copyPosition(U.matrixWorld)},Object.defineProperty(c.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),n.update(c)),c.material.uniforms.envMap.value=T,c.material.uniforms.backgroundBlurriness.value=D.backgroundBlurriness,c.material.uniforms.backgroundIntensity.value=D.backgroundIntensity,c.material.uniforms.backgroundRotation.value.setFromMatrix4(ug.makeRotationFromEuler(D.backgroundRotation)).transpose(),T.isCubeTexture&&T.isRenderTargetTexture===!1&&c.material.uniforms.backgroundRotation.value.premultiply(Yd),c.material.toneMapped=yt.getTransfer(T.colorSpace)!==Rt,(d!==T||m!==T.version||u!==i.toneMapping)&&(c.material.needsUpdate=!0,d=T,m=T.version,u=i.toneMapping),c.layers.enableAll(),A.unshift(c,c.geometry,c.material,0,0,null)):T&&T.isTexture&&(l===void 0&&(l=new vt(new ki(2,2),new dn({name:"BackgroundMaterial",uniforms:Is(Ti.background.uniforms),vertexShader:Ti.background.vertexShader,fragmentShader:Ti.background.fragmentShader,side:hs,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),l.geometry.deleteAttribute("normal"),Object.defineProperty(l.material,"map",{get:function(){return this.uniforms.t2D.value}}),n.update(l)),l.material.uniforms.t2D.value=T,l.material.uniforms.backgroundIntensity.value=D.backgroundIntensity,l.material.toneMapped=yt.getTransfer(T.colorSpace)!==Rt,T.matrixAutoUpdate===!0&&T.updateMatrix(),l.material.uniforms.uvTransform.value.copy(T.matrix),(d!==T||m!==T.version||u!==i.toneMapping)&&(l.material.needsUpdate=!0,d=T,m=T.version,u=i.toneMapping),l.layers.enableAll(),A.unshift(l,l.geometry,l.material,0,0,null))}function g(A,D){A.getRGB(Xl,mh(i)),t.buffers.color.setClear(Xl.r,Xl.g,Xl.b,D,r)}function p(){c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0),l!==void 0&&(l.geometry.dispose(),l.material.dispose(),l=void 0)}return{getClearColor:function(){return a},setClearColor:function(A,D=1){a.set(A),o=D,g(a,o)},getClearAlpha:function(){return o},setClearAlpha:function(A){o=A,g(a,o)},render:x,addToRenderList:b,dispose:p}}function fg(i,e){let t=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=u(null),r=s,a=!1;function o(V,G,J,z,j){let ae=!1,se=m(V,z,J,G);r!==se&&(r=se,c(r.object)),ae=f(V,z,J,j),ae&&x(V,z,J,j),j!==null&&e.update(j,i.ELEMENT_ARRAY_BUFFER),(ae||a)&&(a=!1,T(V,G,J,z),j!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,e.get(j).buffer))}function l(){return i.createVertexArray()}function c(V){return i.bindVertexArray(V)}function d(V){return i.deleteVertexArray(V)}function m(V,G,J,z){let j=z.wireframe===!0,ae=n[G.id];ae===void 0&&(ae={},n[G.id]=ae);let se=V.isInstancedMesh===!0?V.id:0,q=ae[se];q===void 0&&(q={},ae[se]=q);let ne=q[J.id];ne===void 0&&(ne={},q[J.id]=ne);let de=ne[j];return de===void 0&&(de=u(l()),ne[j]=de),de}function u(V){let G=[],J=[],z=[];for(let j=0;j<t;j++)G[j]=0,J[j]=0,z[j]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:G,enabledAttributes:J,attributeDivisors:z,object:V,attributes:{},index:null}}function f(V,G,J,z){let j=r.attributes,ae=G.attributes,se=0,q=J.getAttributes();for(let ne in q)if(q[ne].location>=0){let xe=j[ne],Ye=ae[ne];if(Ye===void 0&&(ne==="instanceMatrix"&&V.instanceMatrix&&(Ye=V.instanceMatrix),ne==="instanceColor"&&V.instanceColor&&(Ye=V.instanceColor)),xe===void 0||xe.attribute!==Ye||Ye&&xe.data!==Ye.data)return!0;se++}return r.attributesNum!==se||r.index!==z}function x(V,G,J,z){let j={},ae=G.attributes,se=0,q=J.getAttributes();for(let ne in q)if(q[ne].location>=0){let xe=ae[ne];xe===void 0&&(ne==="instanceMatrix"&&V.instanceMatrix&&(xe=V.instanceMatrix),ne==="instanceColor"&&V.instanceColor&&(xe=V.instanceColor));let Ye={};Ye.attribute=xe,xe&&xe.data&&(Ye.data=xe.data),j[ne]=Ye,se++}r.attributes=j,r.attributesNum=se,r.index=z}function b(){let V=r.newAttributes;for(let G=0,J=V.length;G<J;G++)V[G]=0}function g(V){p(V,0)}function p(V,G){let J=r.newAttributes,z=r.enabledAttributes,j=r.attributeDivisors;J[V]=1,z[V]===0&&(i.enableVertexAttribArray(V),z[V]=1),j[V]!==G&&(i.vertexAttribDivisor(V,G),j[V]=G)}function A(){let V=r.newAttributes,G=r.enabledAttributes;for(let J=0,z=G.length;J<z;J++)G[J]!==V[J]&&(i.disableVertexAttribArray(J),G[J]=0)}function D(V,G,J,z,j,ae,se){se===!0?i.vertexAttribIPointer(V,G,J,j,ae):i.vertexAttribPointer(V,G,J,z,j,ae)}function T(V,G,J,z){b();let j=z.attributes,ae=J.getAttributes(),se=G.defaultAttributeValues;for(let q in ae){let ne=ae[q];if(ne.location>=0){let de=j[q];if(de===void 0&&(q==="instanceMatrix"&&V.instanceMatrix&&(de=V.instanceMatrix),q==="instanceColor"&&V.instanceColor&&(de=V.instanceColor)),de!==void 0){let xe=de.normalized,Ye=de.itemSize,Ge=e.get(de);if(Ge===void 0)continue;let bt=Ge.buffer,dt=Ge.type,lt=Ge.bytesPerElement,oe=dt===i.INT||dt===i.UNSIGNED_INT||de.gpuType===al;if(de.isInterleavedBufferAttribute){let fe=de.data,Se=fe.stride,$e=de.offset;if(fe.isInstancedInterleavedBuffer){for(let Fe=0;Fe<ne.locationSize;Fe++)p(ne.location+Fe,fe.meshPerAttribute);V.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=fe.meshPerAttribute*fe.count)}else for(let Fe=0;Fe<ne.locationSize;Fe++)g(ne.location+Fe);i.bindBuffer(i.ARRAY_BUFFER,bt);for(let Fe=0;Fe<ne.locationSize;Fe++)D(ne.location+Fe,Ye/ne.locationSize,dt,xe,Se*lt,($e+Ye/ne.locationSize*Fe)*lt,oe)}else{if(de.isInstancedBufferAttribute){for(let fe=0;fe<ne.locationSize;fe++)p(ne.location+fe,de.meshPerAttribute);V.isInstancedMesh!==!0&&z._maxInstanceCount===void 0&&(z._maxInstanceCount=de.meshPerAttribute*de.count)}else for(let fe=0;fe<ne.locationSize;fe++)g(ne.location+fe);i.bindBuffer(i.ARRAY_BUFFER,bt);for(let fe=0;fe<ne.locationSize;fe++)D(ne.location+fe,Ye/ne.locationSize,dt,xe,Ye*lt,Ye/ne.locationSize*fe*lt,oe)}}else if(se!==void 0){let xe=se[q];if(xe!==void 0)switch(xe.length){case 2:i.vertexAttrib2fv(ne.location,xe);break;case 3:i.vertexAttrib3fv(ne.location,xe);break;case 4:i.vertexAttrib4fv(ne.location,xe);break;default:i.vertexAttrib1fv(ne.location,xe)}}}}A()}function P(){I();for(let V in n){let G=n[V];for(let J in G){let z=G[J];for(let j in z){let ae=z[j];for(let se in ae)d(ae[se].object),delete ae[se];delete z[j]}}delete n[V]}}function R(V){if(n[V.id]===void 0)return;let G=n[V.id];for(let J in G){let z=G[J];for(let j in z){let ae=z[j];for(let se in ae)d(ae[se].object),delete ae[se];delete z[j]}}delete n[V.id]}function U(V){for(let G in n){let J=n[G];for(let z in J){let j=J[z];if(j[V.id]===void 0)continue;let ae=j[V.id];for(let se in ae)d(ae[se].object),delete ae[se];delete j[V.id]}}}function _(V){for(let G in n){let J=n[G],z=V.isInstancedMesh===!0?V.id:0,j=J[z];if(j!==void 0){for(let ae in j){let se=j[ae];for(let q in se)d(se[q].object),delete se[q];delete j[ae]}delete J[z],Object.keys(J).length===0&&delete n[G]}}}function I(){F(),a=!0,r!==s&&(r=s,c(r.object))}function F(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:I,resetDefaultState:F,dispose:P,releaseStatesOfGeometry:R,releaseStatesOfObject:_,releaseStatesOfProgram:U,initAttributes:b,enableAttribute:g,disableUnusedAttributes:A}}function pg(i,e,t){let n;function s(l){n=l}function r(l,c){i.drawArrays(n,l,c),t.update(c,n,1)}function a(l,c,d){d!==0&&(i.drawArraysInstanced(n,l,c,d),t.update(c,n,d))}function o(l,c,d){if(d===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,l,0,c,0,d);let u=0;for(let f=0;f<d;f++)u+=c[f];t.update(u,n,1)}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o}function mg(i,e,t,n){let s;function r(){if(s!==void 0)return s;if(e.has("EXT_texture_filter_anisotropic")===!0){let U=e.get("EXT_texture_filter_anisotropic");s=i.getParameter(U.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(U){return!(U!==ti&&n.convert(U)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(U){let _=U===pi&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(U!==kn&&U!==fi&&!_&&n.convert(U)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE))}function l(U){if(U==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";U="mediump"}return U==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp",d=l(c);d!==c&&(je("WebGLRenderer:",c,"not supported, using",d,"instead."),c=d);let m=t.logarithmicDepthBuffer===!0,u=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control");t.reversedDepthBuffer===!0&&u===!1&&je("WebGLRenderer: Unable to use reversed depth buffer due to missing EXT_clip_control extension. Fallback to default depth buffer.");let f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),x=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),b=i.getParameter(i.MAX_TEXTURE_SIZE),g=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),p=i.getParameter(i.MAX_VERTEX_ATTRIBS),A=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),D=i.getParameter(i.MAX_VARYING_VECTORS),T=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),P=i.getParameter(i.MAX_SAMPLES),R=i.getParameter(i.SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:m,reversedDepthBuffer:u,maxTextures:f,maxVertexTextures:x,maxTextureSize:b,maxCubemapSize:g,maxAttributes:p,maxVertexUniforms:A,maxVaryings:D,maxFragmentUniforms:T,maxSamples:P,samples:R}}function gg(i){let e=this,t=null,n=0,s=!1,r=!1,a=new ai,o=new st,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(m,u){let f=m.length!==0||u||n!==0||s;return s=u,n=m.length,f},this.beginShadows=function(){r=!0,d(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(m,u){t=d(m,u,0)},this.setState=function(m,u,f){let x=m.clippingPlanes,b=m.clipIntersection,g=m.clipShadows,p=i.get(m);if(!s||x===null||x.length===0||r&&!g)r?d(null):c();else{let A=r?0:n,D=A*4,T=p.clippingState||null;l.value=T,T=d(x,u,D,f);for(let P=0;P!==D;++P)T[P]=t[P];p.clippingState=T,this.numIntersection=b?this.numPlanes:0,this.numPlanes+=A}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function d(m,u,f,x){let b=m!==null?m.length:0,g=null;if(b!==0){if(g=l.value,x!==!0||g===null){let p=f+b*4,A=u.matrixWorldInverse;o.getNormalMatrix(A),(g===null||g.length<p)&&(g=new Float32Array(p));for(let D=0,T=f;D!==b;++D,T+=4)a.copy(m[D]).applyMatrix4(A,o),a.normal.toArray(g,T),g[T+3]=a.constant}l.value=g,l.needsUpdate=!0}return e.numPlanes=b,e.numIntersection=0,g}}var vr=4,_g=6,xg=20,vg=256,xa=new pr,Td=new Je,wh=null,Th=0,Ah=0,Eh=!1,yg=new N,Ls=new N,Yl=class{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._sizeLods=[],this._lodMeshes=[],this._backgroundBox=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._blurMaterial=null,this._ggxMaterial=null}fromScene(e,t=0,n=.1,s=100,r={}){let{size:a=256,position:o=yg}=r;wh=this._renderer.getRenderTarget(),Th=this._renderer.getActiveCubeFace(),Ah=this._renderer.getActiveMipmapLevel(),Eh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,s,l,o),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=Cd(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Ed(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose(),this._backgroundBox!==null&&(this._backgroundBox.geometry.dispose(),this._backgroundBox.material.dispose())}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._ggxMaterial!==null&&this._ggxMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodMeshes.length;e++)this._lodMeshes[e].geometry.dispose()}_cleanup(e){this._renderer.setRenderTarget(wh,Th,Ah),this._renderer.xr.enabled=Eh,e.scissorTest=!1,xr(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===ds||e.mapping===Ps?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),wh=this._renderer.getRenderTarget(),Th=this._renderer.getActiveCubeFace(),Ah=this._renderer.getActiveMipmapLevel(),Eh=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:wn,minFilter:wn,generateMipmaps:!1,type:pi,format:ti,colorSpace:kr,depthBuffer:!1},s=Ad(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Ad(e,t,n);let{_lodMax:r}=this;({lodMeshes:this._lodMeshes,sizeLods:this._sizeLods}=Mg(r)),this._blurMaterial=bg(r,e,t),this._ggxMaterial=Sg(r,e,t)}return s}_compileMaterial(e){let t=new vt(new Pt,e);this._renderer.compile(t,xa)}_sceneToCubeUV(e,t,n,s,r){let l=new Cn(90,1,t,n),c=[1,-1,1,1,1,1],d=[1,1,1,-1,-1,-1],m=this._renderer,u=m.autoClear,f=m.toneMapping;m.getClearColor(Td),m.toneMapping=ui,m.autoClear=!1,m.state.buffers.depth.getReversed()&&(m.setRenderTarget(s),m.clearDepth(),m.setRenderTarget(null)),this._backgroundBox===null&&(this._backgroundBox=new vt(new Si,new en({name:"PMREM.Background",side:_n,depthWrite:!1,depthTest:!1})));let b=this._backgroundBox,g=b.material,p=!1,A=e.background;A?A.isColor&&(g.color.copy(A),e.background=null,p=!0):(g.color.copy(Td),p=!0);for(let D=0;D<6;D++){let T=D%3;T===0?(l.up.set(0,c[D],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+d[D],r.y,r.z)):T===1?(l.up.set(0,0,c[D]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+d[D],r.z)):(l.up.set(0,c[D],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+d[D]));let P=this._cubeSize;xr(s,T*P,D>2?P:0,P,P),m.setRenderTarget(s),p&&m.render(b,l),m.render(e,l)}m.toneMapping=f,m.autoClear=u,e.background=A}_textureToCubeUV(e,t){let n=this._renderer,s=e.mapping===ds||e.mapping===Ps;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=Cd()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Ed());let r=s?this._cubemapMaterial:this._equirectMaterial,a=this._lodMeshes[0];a.material=r;let o=r.uniforms;o.envMap.value=e;let l=this._cubeSize;xr(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(a,xa)}_applyPMREM(e){let t=this._renderer,n=t.autoClear;t.autoClear=!1;let s=this._lodMeshes.length;for(let r=1;r<s;r++)this._applyGGXFilter(e,r-1,r);t.autoClear=n}_applyGGXFilter(e,t,n){let s=this._renderer,r=this._pingPongRenderTarget,a=this._ggxMaterial,o=this._lodMeshes[n];o.material=a;let l=a.uniforms,c=n/(this._lodMeshes.length-1),d=t/(this._lodMeshes.length-1),m=Math.sqrt(c*c-d*d),u=c*1.25,f=m*u,{_lodMax:x}=this,b=this._sizeLods[n],g=3*b*(n>x-vr?n-x+vr:0),p=4*(this._cubeSize-b);l.envMap.value=e.texture,l.roughness.value=f,l.mipInt.value=x-t,xr(r,g,p,3*b,2*b),s.setRenderTarget(r),s.render(o,xa),l.envMap.value=r.texture,l.roughness.value=0,l.mipInt.value=x-n,xr(e,g,p,3*b,2*b),s.setRenderTarget(e),s.render(o,xa)}_blur(e,t,n,s){let r=this._pingPongRenderTarget,a=Math.min(s,Math.PI)/Math.SQRT2;this._blurPass(e,r,t,n,a),this._blurPass(r,e,n,n,a)}_blurPass(e,t,n,s,r){let a=this._renderer,o=this._blurMaterial,l=this._lodMeshes[s];l.material=o;let c=o.uniforms;c.envMap.value=e.texture,c.sigma.value=r,c.mipInt.value=this._lodMax-n;let d=this._sizeLods[s],m=3*d*(s>this._lodMax-vr?s-this._lodMax+vr:0),u=4*(this._cubeSize-d);xr(t,m,u,3*d,2*d),a.setRenderTarget(t),a.render(l,xa)}};function Mg(i){let e=[],t=[],n=i,s=i-vr+1+_g;for(let r=0;r<s;r++){let a=Math.pow(2,n);e.push(a);let o=1/(a-2),l=-o,c=1+o,d=[l,l,c,l,c,c,l,l,c,c,l,c],m=6,u=6,f=3,x=new Float32Array(f*u*m),b=new Float32Array(f*u*m);for(let p=0;p<m;p++){let A=p%3*2/3-1,D=p>2?0:-1,T=[A,D,0,A+2/3,D,0,A+2/3,D+1,0,A,D,0,A+2/3,D+1,0,A,D+1,0];x.set(T,f*u*p);for(let P=0;P<u;P++){let R=d[P*2]*2-1,U=d[P*2+1]*2-1;p===0?Ls.set(1,U,R):p===1?Ls.set(-R,1,-U):p===2?Ls.set(-R,U,1):p===3?Ls.set(-1,U,-R):p===4?Ls.set(-R,-1,U):Ls.set(R,U,-1),Ls.toArray(b,(p*u+P)*f)}}let g=new Pt;g.setAttribute("position",new Zn(x,f)),g.setAttribute("outputDirection",new Zn(b,f)),t.push(new vt(g,null)),n>vr&&n--}return{lodMeshes:t,sizeLods:e}}function Ad(i,e,t){let n=new Bn(i,e,t);return n.texture.mapping=ha,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function xr(i,e,t,n,s){i.viewport.set(e,t,n,s),i.scissor.set(e,t,n,s)}function Sg(i,e,t){return new dn({name:"PMREMGGXConvolution",defines:{GGX_SAMPLES:vg,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},roughness:{value:0},mipInt:{value:0}},vertexShader:Jl(),fragmentShader:`

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
		`,blending:bi,depthTest:!1,depthWrite:!1})}function bg(i,e,t){return new dn({name:"SphericalGaussianBlur",defines:{SAMPLES:xg,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},sigma:{value:0},mipInt:{value:0}},vertexShader:Jl(),fragmentShader:`

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
		`,blending:bi,depthTest:!1,depthWrite:!1})}function Ed(){return new dn({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Jl(),fragmentShader:`

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
		`,blending:bi,depthTest:!1,depthWrite:!1})}function Cd(){return new dn({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Jl(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:bi,depthTest:!1,depthWrite:!1})}function Jl(){return`

		precision mediump float;
		precision mediump int;

		attribute vec3 outputDirection;

		varying vec3 vOutputDirection;

		void main() {

			vOutputDirection = outputDirection;
			gl_Position = vec4( position, 1.0 );

		}
	`}var Zl=class extends Bn{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;let n={width:e,height:e,depth:1},s=[n,n,n,n,n,n];this.texture=new Zr(s),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

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
			`},s=new Si(5,5,5),r=new dn({name:"CubemapFromEquirect",uniforms:Is(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:_n,blending:bi});r.uniforms.tEquirect.value=t;let a=new vt(s,r),o=t.minFilter;return t.minFilter===fs&&(t.minFilter=wn),new Qo(1,10,this).update(e,a),t.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(e,t=!0,n=!0,s=!0){let r=e.getRenderTarget();for(let a=0;a<6;a++)e.setRenderTarget(this,a),e.clear(t,n,s);e.setRenderTarget(r)}};function wg(i){let e=new WeakMap,t=new WeakMap,n=null;function s(u,f=!1){return u==null?null:f?a(u):r(u)}function r(u){if(u&&u.isTexture){let f=u.mapping;if(f===il||f===sl)if(e.has(u)){let x=e.get(u).texture;return o(x,u.mapping)}else{let x=u.image;if(x&&x.height>0){let b=new Zl(x.height);return b.fromEquirectangularTexture(i,u),e.set(u,b),u.addEventListener("dispose",c),o(b.texture,u.mapping)}else return null}}return u}function a(u){if(u&&u.isTexture){let f=u.mapping,x=f===il||f===sl,b=f===ds||f===Ps;if(x||b){let g=t.get(u),p=g!==void 0?g.texture.pmremVersion:0;if(u.isRenderTargetTexture&&u.pmremVersion!==p)return n===null&&(n=new Yl(i)),g=x?n.fromEquirectangular(u,g):n.fromCubemap(u,g),g.texture.pmremVersion=u.pmremVersion,t.set(u,g),g.texture;if(g!==void 0)return g.texture;{let A=u.image;return x&&A&&A.height>0||b&&A&&l(A)?(n===null&&(n=new Yl(i)),g=x?n.fromEquirectangular(u):n.fromCubemap(u),g.texture.pmremVersion=u.pmremVersion,t.set(u,g),u.addEventListener("dispose",d),g.texture):null}}}return u}function o(u,f){return f===il?u.mapping=ds:f===sl&&(u.mapping=Ps),u}function l(u){let f=0,x=6;for(let b=0;b<x;b++)u[b]!==void 0&&f++;return f===x}function c(u){let f=u.target;f.removeEventListener("dispose",c);let x=e.get(f);x!==void 0&&(e.delete(f),x.dispose())}function d(u){let f=u.target;f.removeEventListener("dispose",d);let x=t.get(f);x!==void 0&&(t.delete(f),x.dispose())}function m(){e=new WeakMap,t=new WeakMap,n!==null&&(n.dispose(),n=null)}return{get:s,dispose:m}}function Tg(i){let e={};function t(n){if(e[n]!==void 0)return e[n];let s=i.getExtension(n);return e[n]=s,s}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){let s=t(n);return s===null&&bs("WebGLRenderer: "+n+" extension not supported."),s}}}function Ag(i,e,t,n){let s={},r=new WeakMap;function a(m){let u=m.target;u.index!==null&&e.remove(u.index);for(let x in u.attributes)e.remove(u.attributes[x]);u.removeEventListener("dispose",a),delete s[u.id];let f=r.get(u);f&&(e.remove(f),r.delete(u)),n.releaseStatesOfGeometry(u),u.isInstancedBufferGeometry===!0&&delete u._maxInstanceCount,t.memory.geometries--}function o(m,u){return s[u.id]===!0||(u.addEventListener("dispose",a),s[u.id]=!0,t.memory.geometries++),u}function l(m){let u=m.attributes;for(let f in u)e.update(u[f],i.ARRAY_BUFFER)}function c(m){let u=[],f=m.index,x=m.attributes.position,b=0;if(x===void 0)return;if(f!==null){let A=f.array;b=f.version;for(let D=0,T=A.length;D<T;D+=3){let P=A[D+0],R=A[D+1],U=A[D+2];u.push(P,R,R,U,U,P)}}else{let A=x.array;b=x.version;for(let D=0,T=A.length/3-1;D<T;D+=3){let P=D+0,R=D+1,U=D+2;u.push(P,R,R,U,U,P)}}let g=new(x.count>=65535?qr:Xr)(u,1);g.version=b;let p=r.get(m);p&&e.remove(p),r.set(m,g)}function d(m){let u=r.get(m);if(u){let f=m.index;f!==null&&u.version<f.version&&c(m)}else c(m);return r.get(m)}return{get:o,update:l,getWireframeAttribute:d}}function Eg(i,e,t){let n;function s(m){n=m}let r,a;function o(m){r=m.type,a=m.bytesPerElement}function l(m,u){i.drawElements(n,u,r,m*a),t.update(u,n,1)}function c(m,u,f){f!==0&&(i.drawElementsInstanced(n,u,r,m*a,f),t.update(u,n,f))}function d(m,u,f){if(f===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,u,0,r,m,0,f);let b=0;for(let g=0;g<f;g++)b+=u[g];t.update(b,n,1)}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=d}function Cg(i){let e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(t.calls++,a){case i.TRIANGLES:t.triangles+=o*(r/3);break;case i.LINES:t.lines+=o*(r/2);break;case i.LINE_STRIP:t.lines+=o*(r-1);break;case i.LINE_LOOP:t.lines+=o*r;break;case i.POINTS:t.points+=o*r;break;default:Qe("WebGLInfo: Unknown draw mode:",a);break}}function s(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:s,update:n}}function Rg(i,e,t){let n=new WeakMap,s=new Yt;function r(a,o,l){let c=a.morphTargetInfluences,d=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,m=d!==void 0?d.length:0,u=n.get(o);if(u===void 0||u.count!==m){let I=function(){U.dispose(),n.delete(o),o.removeEventListener("dispose",I)};u!==void 0&&u.texture.dispose();let f=o.morphAttributes.position!==void 0,x=o.morphAttributes.normal!==void 0,b=o.morphAttributes.color!==void 0,g=o.morphAttributes.position||[],p=o.morphAttributes.normal||[],A=o.morphAttributes.color||[],D=0;f===!0&&(D=1),x===!0&&(D=2),b===!0&&(D=3);let T=o.attributes.position.count*D,P=1;T>e.maxTextureSize&&(P=Math.ceil(T/e.maxTextureSize),T=e.maxTextureSize);let R=new Float32Array(T*P*4*m),U=new Hr(R,T,P,m);U.type=fi,U.needsUpdate=!0;let _=D*4;for(let F=0;F<m;F++){let V=g[F],G=p[F],J=A[F],z=T*P*4*F;for(let j=0;j<V.count;j++){let ae=j*_;f===!0&&(s.fromBufferAttribute(V,j),R[z+ae+0]=s.x,R[z+ae+1]=s.y,R[z+ae+2]=s.z,R[z+ae+3]=0),x===!0&&(s.fromBufferAttribute(G,j),R[z+ae+4]=s.x,R[z+ae+5]=s.y,R[z+ae+6]=s.z,R[z+ae+7]=0),b===!0&&(s.fromBufferAttribute(J,j),R[z+ae+8]=s.x,R[z+ae+9]=s.y,R[z+ae+10]=s.z,R[z+ae+11]=J.itemSize===4?s.w:1)}}u={count:m,texture:U,size:new Oe(T,P)},n.set(o,u),o.addEventListener("dispose",I)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,t);else{let f=0;for(let b=0;b<c.length;b++)f+=c[b];let x=o.morphTargetsRelative?1:1-f;l.getUniforms().setValue(i,"morphTargetBaseInfluence",x),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",u.texture,t),l.getUniforms().setValue(i,"morphTargetsTextureSize",u.size)}return{update:r}}function Pg(i,e,t,n,s){let r=new WeakMap;function a(c){let d=s.render.frame,m=c.geometry,u=e.get(c,m);if(r.get(u)!==d&&(e.update(u),r.set(u,d)),c.isInstancedMesh&&(c.hasEventListener("dispose",l)===!1&&c.addEventListener("dispose",l),r.get(c)!==d&&(t.update(c.instanceMatrix,i.ARRAY_BUFFER),c.instanceColor!==null&&t.update(c.instanceColor,i.ARRAY_BUFFER),r.set(c,d))),c.isSkinnedMesh){let f=c.skeleton;r.get(f)!==d&&(f.update(),r.set(f,d))}return u}function o(){r=new WeakMap}function l(c){let d=c.target;d.removeEventListener("dispose",l),n.releaseStatesOfObject(d),t.remove(d.instanceMatrix),d.instanceColor!==null&&t.remove(d.instanceColor)}return{update:a,dispose:o}}var Ig={[Kc]:"LINEAR_TONE_MAPPING",[jc]:"REINHARD_TONE_MAPPING",[Qc]:"CINEON_TONE_MAPPING",[eh]:"ACES_FILMIC_TONE_MAPPING",[nh]:"AGX_TONE_MAPPING",[ih]:"NEUTRAL_TONE_MAPPING",[th]:"CUSTOM_TONE_MAPPING"};function Lg(i,e,t,n,s,r){let a=new Bn(e,t,{type:i,depthBuffer:s,stencilBuffer:r,samples:n?4:0,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,resolveDepthBuffer:!1,resolveStencilBuffer:!1}),o=null,l=null,c=new Pt;c.setAttribute("position",new it([-1,3,0,-1,-1,0,3,-1,0],3)),c.setAttribute("uv",new it([0,2,0,0,2,0],2));let d=new zo({uniforms:{tDiffuse:{value:null}},vertexShader:`
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
			}`,depthTest:!1,depthWrite:!1}),m=new vt(c,d),u=new pr(-1,1,1,-1,0,1),f=null,x=null,b=!1,g,p=null,A=[],D=!1;this.setSize=function(T,P){a.setSize(T,P),o!==null&&o.setSize(T,P),l!==null&&l.setSize(T,P);for(let R=0;R<A.length;R++){let U=A[R];U.setSize&&U.setSize(T,P)}},this.setEffects=function(T){A=T,D=A.length>0&&A[0].isRenderPass===!0;let P=a.width,R=a.height;A.length>0&&o===null&&(o=new Bn(P,R,{type:pi,depthBuffer:!1,stencilBuffer:!1}),l=new Bn(P,R,{type:pi,depthBuffer:!1,stencilBuffer:!1}));for(let U=0;U<A.length;U++){let _=A[U];_.setSize&&_.setSize(P,R)}},this.begin=function(T,P){if(b||T.toneMapping===ui&&A.length===0)return!1;if(p=P,P!==null){let R=P.width,U=P.height;(a.width!==R||a.height!==U)&&this.setSize(R,U)}return D===!1&&T.setRenderTarget(a),g=T.toneMapping,T.toneMapping=ui,!0},this.hasRenderPass=function(){return D},this.end=function(T,P){T.toneMapping=g,b=!0;let R=a,U=o;for(let _=0;_<A.length;_++){let I=A[_];I.enabled!==!1&&(I.render(T,U,R,P),I.needsSwap!==!1&&(R=U,U=U===o?l:o))}if(f!==T.outputColorSpace||x!==T.toneMapping){f=T.outputColorSpace,x=T.toneMapping,d.defines={},yt.getTransfer(f)===Rt&&(d.defines.SRGB_TRANSFER="");let _=Ig[x];_&&(d.defines[_]=""),d.needsUpdate=!0}d.uniforms.tDiffuse.value=R.texture,T.setRenderTarget(p),T.render(m,u),p=null,b=!1},this.isCompositing=function(){return b},this.dispose=function(){a.dispose(),o!==null&&o.dispose(),l!==null&&l.dispose(),c.dispose(),d.dispose()}}var Zd=new Rn,Ph=new ts(1,1),$d=new Hr,Jd=new Eo,Kd=new Zr,Rd=[],Pd=[],Id=new Float32Array(16),Ld=new Float32Array(9),Dd=new Float32Array(4);function Mr(i,e,t){let n=i[0];if(n<=0||n>0)return i;let s=e*t,r=Rd[s];if(r===void 0&&(r=new Float32Array(s),Rd[s]=r),e!==0){n.toArray(r,0);for(let a=1,o=0;a!==e;++a)o+=t,i[a].toArray(r,o)}return r}function fn(i,e){if(i.length!==e.length)return!1;for(let t=0,n=i.length;t<n;t++)if(i[t]!==e[t])return!1;return!0}function pn(i,e){for(let t=0,n=e.length;t<n;t++)i[t]=e[t]}function Kl(i,e){let t=Pd[e];t===void 0&&(t=new Int32Array(e),Pd[e]=t);for(let n=0;n!==e;++n)t[n]=i.allocateTextureUnit();return t}function Dg(i,e){let t=this.cache;t[0]!==e&&(i.uniform1f(this.addr,e),t[0]=e)}function Ng(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(fn(t,e))return;i.uniform2fv(this.addr,e),pn(t,e)}}function Ug(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(i.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(fn(t,e))return;i.uniform3fv(this.addr,e),pn(t,e)}}function Fg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(fn(t,e))return;i.uniform4fv(this.addr,e),pn(t,e)}}function Og(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(fn(t,e))return;i.uniformMatrix2fv(this.addr,!1,e),pn(t,e)}else{if(fn(t,n))return;Dd.set(n),i.uniformMatrix2fv(this.addr,!1,Dd),pn(t,n)}}function Bg(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(fn(t,e))return;i.uniformMatrix3fv(this.addr,!1,e),pn(t,e)}else{if(fn(t,n))return;Ld.set(n),i.uniformMatrix3fv(this.addr,!1,Ld),pn(t,n)}}function zg(i,e){let t=this.cache,n=e.elements;if(n===void 0){if(fn(t,e))return;i.uniformMatrix4fv(this.addr,!1,e),pn(t,e)}else{if(fn(t,n))return;Id.set(n),i.uniformMatrix4fv(this.addr,!1,Id),pn(t,n)}}function kg(i,e){let t=this.cache;t[0]!==e&&(i.uniform1i(this.addr,e),t[0]=e)}function Vg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(fn(t,e))return;i.uniform2iv(this.addr,e),pn(t,e)}}function Gg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(fn(t,e))return;i.uniform3iv(this.addr,e),pn(t,e)}}function Hg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(fn(t,e))return;i.uniform4iv(this.addr,e),pn(t,e)}}function Wg(i,e){let t=this.cache;t[0]!==e&&(i.uniform1ui(this.addr,e),t[0]=e)}function Xg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(i.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(fn(t,e))return;i.uniform2uiv(this.addr,e),pn(t,e)}}function qg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(i.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(fn(t,e))return;i.uniform3uiv(this.addr,e),pn(t,e)}}function Yg(i,e){let t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(i.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(fn(t,e))return;i.uniform4uiv(this.addr,e),pn(t,e)}}function Zg(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(Ph.compareFunction=t.isReversedDepthBuffer()?Wl:Hl,r=Ph):r=Zd,t.setTexture2D(e||r,s)}function $g(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture3D(e||Jd,s)}function Jg(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTextureCube(e||Kd,s)}function Kg(i,e,t){let n=this.cache,s=t.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),t.setTexture2DArray(e||$d,s)}function jg(i){switch(i){case 5126:return Dg;case 35664:return Ng;case 35665:return Ug;case 35666:return Fg;case 35674:return Og;case 35675:return Bg;case 35676:return zg;case 5124:case 35670:return kg;case 35667:case 35671:return Vg;case 35668:case 35672:return Gg;case 35669:case 35673:return Hg;case 5125:return Wg;case 36294:return Xg;case 36295:return qg;case 36296:return Yg;case 35678:case 36198:case 36298:case 36306:case 35682:return Zg;case 35679:case 36299:case 36307:return $g;case 35680:case 36300:case 36308:case 36293:return Jg;case 36289:case 36303:case 36311:case 36292:return Kg}}function Qg(i,e){i.uniform1fv(this.addr,e)}function e_(i,e){let t=Mr(e,this.size,2);i.uniform2fv(this.addr,t)}function t_(i,e){let t=Mr(e,this.size,3);i.uniform3fv(this.addr,t)}function n_(i,e){let t=Mr(e,this.size,4);i.uniform4fv(this.addr,t)}function i_(i,e){let t=Mr(e,this.size,4);i.uniformMatrix2fv(this.addr,!1,t)}function s_(i,e){let t=Mr(e,this.size,9);i.uniformMatrix3fv(this.addr,!1,t)}function r_(i,e){let t=Mr(e,this.size,16);i.uniformMatrix4fv(this.addr,!1,t)}function a_(i,e){i.uniform1iv(this.addr,e)}function o_(i,e){i.uniform2iv(this.addr,e)}function l_(i,e){i.uniform3iv(this.addr,e)}function c_(i,e){i.uniform4iv(this.addr,e)}function h_(i,e){i.uniform1uiv(this.addr,e)}function u_(i,e){i.uniform2uiv(this.addr,e)}function d_(i,e){i.uniform3uiv(this.addr,e)}function f_(i,e){i.uniform4uiv(this.addr,e)}function p_(i,e,t){let n=this.cache,s=e.length,r=Kl(t,s);fn(n,r)||(i.uniform1iv(this.addr,r),pn(n,r));let a;this.type===i.SAMPLER_2D_SHADOW?a=Ph:a=Zd;for(let o=0;o!==s;++o)t.setTexture2D(e[o]||a,r[o])}function m_(i,e,t){let n=this.cache,s=e.length,r=Kl(t,s);fn(n,r)||(i.uniform1iv(this.addr,r),pn(n,r));for(let a=0;a!==s;++a)t.setTexture3D(e[a]||Jd,r[a])}function g_(i,e,t){let n=this.cache,s=e.length,r=Kl(t,s);fn(n,r)||(i.uniform1iv(this.addr,r),pn(n,r));for(let a=0;a!==s;++a)t.setTextureCube(e[a]||Kd,r[a])}function __(i,e,t){let n=this.cache,s=e.length,r=Kl(t,s);fn(n,r)||(i.uniform1iv(this.addr,r),pn(n,r));for(let a=0;a!==s;++a)t.setTexture2DArray(e[a]||$d,r[a])}function x_(i){switch(i){case 5126:return Qg;case 35664:return e_;case 35665:return t_;case 35666:return n_;case 35674:return i_;case 35675:return s_;case 35676:return r_;case 5124:case 35670:return a_;case 35667:case 35671:return o_;case 35668:case 35672:return l_;case 35669:case 35673:return c_;case 5125:return h_;case 36294:return u_;case 36295:return d_;case 36296:return f_;case 35678:case 36198:case 36298:case 36306:case 35682:return p_;case 35679:case 36299:case 36307:return m_;case 35680:case 36300:case 36308:case 36293:return g_;case 36289:case 36303:case 36311:case 36292:return __}}var Ih=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=jg(t.type)}},Lh=class{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=x_(t.type)}},Dh=class{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(e,t[o.id],n)}}},Ch=/(\w+)(\])?(\[|\.)?/g;function Nd(i,e){i.seq.push(e),i.map[e.id]=e}function v_(i,e,t){let n=i.name,s=n.length;for(Ch.lastIndex=0;;){let r=Ch.exec(n),a=Ch.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){Nd(t,c===void 0?new Ih(o,i,e):new Lh(o,i,e));break}else{let m=t.map[o];m===void 0&&(m=new Dh(o),Nd(t,m)),t=m}}}var yr=class{constructor(e,t){this.seq=[],this.map={};let n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let a=0;a<n;++a){let o=e.getActiveUniform(t,a),l=e.getUniformLocation(t,o.name);v_(o,l,this)}let s=[],r=[];for(let a of this.seq)a.type===e.SAMPLER_2D_SHADOW||a.type===e.SAMPLER_CUBE_SHADOW||a.type===e.SAMPLER_2D_ARRAY_SHADOW?s.push(a):r.push(a);s.length>0&&(this.seq=s.concat(r))}setValue(e,t,n,s){let r=this.map[t];r!==void 0&&r.setValue(e,n,s)}setOptional(e,t,n){let s=t[n];s!==void 0&&this.setValue(e,n,s)}static upload(e,t,n,s){for(let r=0,a=t.length;r!==a;++r){let o=t[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(e,l.value,s)}}static seqWithValue(e,t){let n=[];for(let s=0,r=e.length;s!==r;++s){let a=e[s];a.id in t&&n.push(a)}return n}};function Ud(i,e,t){let n=i.createShader(e);return i.shaderSource(n,t),i.compileShader(n),n}var y_=37297,M_=0;function S_(i,e){let t=i.split(`
`),n=[],s=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let a=s;a<r;a++){let o=a+1;n.push(`${o===e?">":" "} ${o}: ${t[a]}`)}return n.join(`
`)}var Fd=new st;function b_(i){yt._getMatrix(Fd,yt.workingColorSpace,i);let e=`mat3( ${Fd.elements.map(t=>t.toFixed(4))} )`;switch(yt.getTransfer(i)){case Vr:return[e,"LinearTransferOETF"];case Rt:return[e,"sRGBTransferOETF"];default:return je("WebGLProgram: Unsupported color space: ",i),[e,"LinearTransferOETF"]}}function Od(i,e,t){let n=i.getShaderParameter(e,i.COMPILE_STATUS),r=(i.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return t.toUpperCase()+`

`+r+`

`+S_(i.getShaderSource(e),o)}else return r}function w_(i,e){let t=b_(e);return[`vec4 ${i}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}var T_={[Kc]:"Linear",[jc]:"Reinhard",[Qc]:"Cineon",[eh]:"ACESFilmic",[nh]:"AgX",[ih]:"Neutral",[th]:"Custom"};function A_(i,e){let t=T_[e];return t===void 0?(je("WebGLProgram: Unsupported toneMapping:",e),"vec3 "+i+"( vec3 color ) { return LinearToneMapping( color ); }"):"vec3 "+i+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}var ql=new N;function E_(){yt.getLuminanceCoefficients(ql);let i=ql.x.toFixed(4),e=ql.y.toFixed(4),t=ql.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function C_(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(ya).join(`
`)}function R_(i){let e=[];for(let t in i){let n=i[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function P_(i,e){let t={},n=i.getProgramParameter(e,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(e,s),a=r.name,o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),t[a]={type:r.type,location:i.getAttribLocation(e,a),locationSize:o}}return t}function ya(i){return i!==""}function Bd(i,e){let t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return i.replace(/NUM_SUN_LIGHTS/g,e.numSunLights).replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_SUN_LIGHT_SHADOWS/g,e.numSunLightShadows).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function zd(i,e){return i.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}var I_=/^[ \t]*#include +<([\w\d./]+)>/gm;function Nh(i){return i.replace(I_,D_)}var L_=new Map;function D_(i,e){let t=ut[e];if(t===void 0){let n=L_.get(e);if(n!==void 0)t=ut[n],je('WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("THREE.WebGLProgram: Can not resolve #include <"+e+">")}return Nh(t)}var N_=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function kd(i){return i.replace(N_,U_)}function U_(i,e,t,n){let s="";for(let r=parseInt(e);r<parseInt(t);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function Vd(i){let e=`precision ${i.precision} float;
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
#define LOW_PRECISION`),e}var F_={[ca]:"SHADOWMAP_TYPE_PCF",[mr]:"SHADOWMAP_TYPE_VSM"};function O_(i){return F_[i.shadowMapType]||"SHADOWMAP_TYPE_BASIC"}var B_={[ds]:"ENVMAP_TYPE_CUBE",[Ps]:"ENVMAP_TYPE_CUBE",[ha]:"ENVMAP_TYPE_CUBE_UV"};function z_(i){return i.envMap===!1?"ENVMAP_TYPE_CUBE":B_[i.envMapMode]||"ENVMAP_TYPE_CUBE"}var k_={[Ps]:"ENVMAP_MODE_REFRACTION"};function V_(i){return i.envMap===!1?"ENVMAP_MODE_REFLECTION":k_[i.envMapMode]||"ENVMAP_MODE_REFLECTION"}var G_={[nl]:"ENVMAP_BLENDING_MULTIPLY",[sd]:"ENVMAP_BLENDING_MIX",[rd]:"ENVMAP_BLENDING_ADD"};function H_(i){return i.envMap===!1?"ENVMAP_BLENDING_NONE":G_[i.combine]||"ENVMAP_BLENDING_NONE"}function W_(i){let e=i.envMapCubeUVHeight;if(e===null)return null;let t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),112)),texelHeight:n,maxMip:t}}function X_(i,e,t,n){let s=i.getContext(),r=t.defines,a=t.vertexShader,o=t.fragmentShader,l=O_(t),c=z_(t),d=V_(t),m=H_(t),u=W_(t),f=C_(t),x=R_(r),b=s.createProgram(),g,p,A=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(g=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x].filter(ya).join(`
`),g.length>0&&(g+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x].filter(ya).join(`
`),p.length>0&&(p+=`
`)):(g=[Vd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+d:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexNormals?"#define HAS_NORMAL":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(ya).join(`
`),p=[Vd(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,x,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+d:"",t.envMap?"#define "+m:"",u?"#define CUBEUV_TEXEL_WIDTH "+u.texelWidth:"",u?"#define CUBEUV_TEXEL_HEIGHT "+u.texelHeight:"",u?"#define CUBEUV_MAX_MIP "+u.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.packedNormalMap?"#define USE_PACKED_NORMALMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.retroreflection?"#define USE_RETROREFLECTION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor?"#define USE_COLOR":"",t.vertexAlphas||t.batchingColor?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.numLightProbeGrids>0?"#define USE_LIGHT_PROBES_GRID":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==ui?"#define TONE_MAPPING":"",t.toneMapping!==ui?ut.tonemapping_pars_fragment:"",t.toneMapping!==ui?A_("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",ut.colorspace_pars_fragment,w_("linearToOutputTexel",t.outputColorSpace),E_(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(ya).join(`
`)),a=Nh(a),a=Bd(a,t),a=zd(a,t),o=Nh(o),o=Bd(o,t),o=zd(o,t),a=kd(a),o=kd(o),t.isRawShaderMaterial!==!0&&(A=`#version 300 es
`,g=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+g,p=["#define varying in",t.glslVersion===fh?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===fh?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let D=A+g+a,T=A+p+o,P=Ud(s,s.VERTEX_SHADER,D),R=Ud(s,s.FRAGMENT_SHADER,T);s.attachShader(b,P),s.attachShader(b,R),t.index0AttributeName!==void 0?s.bindAttribLocation(b,0,t.index0AttributeName):t.hasPositionAttribute===!0&&s.bindAttribLocation(b,0,"position"),s.linkProgram(b);function U(V){if(i.debug.checkShaderErrors){let G=s.getProgramInfoLog(b)||"",J=s.getShaderInfoLog(P)||"",z=s.getShaderInfoLog(R)||"",j=G.trim(),ae=J.trim(),se=z.trim(),q=!0,ne=!0;if(s.getProgramParameter(b,s.LINK_STATUS)===!1)if(q=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,b,P,R);else{let de=Od(s,P,"vertex"),xe=Od(s,R,"fragment");Qe("WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(b,s.VALIDATE_STATUS)+`

Material Name: `+V.name+`
Material Type: `+V.type+`

Program Info Log: `+j+`
`+de+`
`+xe)}else j!==""?je("WebGLProgram: Program Info Log:",j):(ae===""||se==="")&&(ne=!1);ne&&(V.diagnostics={runnable:q,programLog:j,vertexShader:{log:ae,prefix:g},fragmentShader:{log:se,prefix:p}})}s.deleteShader(P),s.deleteShader(R),_=new yr(s,b),I=P_(s,b)}let _;this.getUniforms=function(){return _===void 0&&U(this),_};let I;this.getAttributes=function(){return I===void 0&&U(this),I};let F=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return F===!1&&(F=s.getProgramParameter(b,y_)),F},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(b),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=M_++,this.cacheKey=e,this.usedTimes=1,this.program=b,this.vertexShader=P,this.fragmentShader=R,this}var q_=0,Uh=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e,t,n){let s=this._getShaderCacheForMaterial(e);return s.has(t)===!1&&(s.add(t),t.usedTimes++),s.has(n)===!1&&(s.add(n),n.usedTimes++),this}remove(e){let t=this.materialCache.get(e);for(let n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderStage(e){return this._getShaderStage(e.vertexShader)}getFragmentShaderStage(e){return this._getShaderStage(e.fragmentShader)}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){let t=this.materialCache,n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){let t=this.shaderCache,n=t.get(e);return n===void 0&&(n=new Fh(e),t.set(e,n)),n}},Fh=class{constructor(e){this.id=q_++,this.code=e,this.usedTimes=0}};function Y_(i){return i===ms||i===ga||i===_a}function Z_(i,e,t,n,s,r){let a=new or,o=new Uh,l=new Set,c=[],d=new Map,m=n.logarithmicDepthBuffer,u=n.precision,f={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distance",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(_){return l.add(_),_===0?"uv":`uv${_}`}function b(_,I,F,V,G,J){let z=V.fog,j=G.geometry,ae=_.isMeshStandardMaterial||_.isMeshLambertMaterial||_.isMeshPhongMaterial?V.environment:null,se=_.isMeshStandardMaterial||_.isMeshLambertMaterial&&!_.envMap||_.isMeshPhongMaterial&&!_.envMap,q=e.get(_.envMap||ae,se),ne=q&&q.mapping===ha?q.image.height:null,de=f[_.type];_.precision!==null&&(u=n.getMaxPrecision(_.precision),u!==_.precision&&je("WebGLProgram.getParameters:",_.precision,"not supported, using",u,"instead."));let xe=j.morphAttributes.position||j.morphAttributes.normal||j.morphAttributes.color,Ye=xe!==void 0?xe.length:0,Ge=0;j.morphAttributes.position!==void 0&&(Ge=1),j.morphAttributes.normal!==void 0&&(Ge=2),j.morphAttributes.color!==void 0&&(Ge=3);let bt,dt,lt,oe;if(de){let Lt=Ti[de];bt=Lt.vertexShader,dt=Lt.fragmentShader}else{bt=_.vertexShader,dt=_.fragmentShader;let Lt=o.getVertexShaderStage(_),Et=o.getFragmentShaderStage(_);o.update(_,Lt,Et),lt=Lt.id,oe=Et.id}let fe=i.getRenderTarget(),Se=i.state.buffers.depth.getReversed(),$e=G.isInstancedMesh===!0,Fe=G.isBatchedMesh===!0,et=!!_.map,Ze=!!_.matcap,rt=!!q,gt=!!_.aoMap,at=!!_.lightMap,ot=!!_.bumpMap&&_.wireframe===!1,zt=!!_.normalMap,nn=!!_.displacementMap,xn=!!_.emissiveMap,Ft=!!_.metalnessMap,Xt=!!_.roughnessMap,O=_.anisotropy>0,sn=_.clearcoat>0,pt=_.dispersion>0,L=_.retroreflectivity>0,y=_.iridescence>0,W=_.sheen>0,Z=_.transmission>0,re=O&&!!_.anisotropyMap,ve=sn&&!!_.clearcoatMap,we=sn&&!!_.clearcoatNormalMap,le=sn&&!!_.clearcoatRoughnessMap,he=y&&!!_.iridescenceMap,Ee=y&&!!_.iridescenceThicknessMap,Be=W&&!!_.sheenColorMap,Te=W&&!!_.sheenRoughnessMap,Ae=!!_.specularMap,He=!!_.specularColorMap,qe=!!_.specularIntensityMap,tt=Z&&!!_.transmissionMap,k=Z&&!!_.thicknessMap,be=!!_.gradientMap,ce=!!_.alphaMap,Ce=_.alphaTest>0,Le=!!_.alphaHash,_e=!!_.extensions,We=ui;_.toneMapped&&(fe===null||fe.isXRRenderTarget===!0)&&(We=i.toneMapping);let Ve={shaderID:de,shaderType:_.type,shaderName:_.name,vertexShader:bt,fragmentShader:dt,defines:_.defines,customVertexShaderID:lt,customFragmentShaderID:oe,isRawShaderMaterial:_.isRawShaderMaterial===!0,glslVersion:_.glslVersion,precision:u,batching:Fe,batchingColor:Fe&&G._colorsTexture!==null,instancing:$e,instancingColor:$e&&G.instanceColor!==null,instancingMorph:$e&&G.morphTexture!==null,outputColorSpace:fe===null?i.outputColorSpace:fe.isXRRenderTarget===!0?fe.texture.colorSpace:yt.workingColorSpace,alphaToCoverage:!!_.alphaToCoverage,map:et,matcap:Ze,envMap:rt,envMapMode:rt&&q.mapping,envMapCubeUVHeight:ne,aoMap:gt,lightMap:at,bumpMap:ot,normalMap:zt,displacementMap:nn,emissiveMap:xn,normalMapObjectSpace:zt&&_.normalMapType===ld,normalMapTangentSpace:zt&&_.normalMapType===Gl,packedNormalMap:zt&&_.normalMapType===Gl&&Y_(_.normalMap.format),metalnessMap:Ft,roughnessMap:Xt,anisotropy:O,anisotropyMap:re,clearcoat:sn,clearcoatMap:ve,clearcoatNormalMap:we,clearcoatRoughnessMap:le,dispersion:pt,retroreflection:L,iridescence:y,iridescenceMap:he,iridescenceThicknessMap:Ee,sheen:W,sheenColorMap:Be,sheenRoughnessMap:Te,specularMap:Ae,specularColorMap:He,specularIntensityMap:qe,transmission:Z,transmissionMap:tt,thicknessMap:k,gradientMap:be,opaque:_.transparent===!1&&_.blending===us&&_.alphaToCoverage===!1,alphaMap:ce,alphaTest:Ce,alphaHash:Le,combine:_.combine,mapUv:et&&x(_.map.channel),aoMapUv:gt&&x(_.aoMap.channel),lightMapUv:at&&x(_.lightMap.channel),bumpMapUv:ot&&x(_.bumpMap.channel),normalMapUv:zt&&x(_.normalMap.channel),displacementMapUv:nn&&x(_.displacementMap.channel),emissiveMapUv:xn&&x(_.emissiveMap.channel),metalnessMapUv:Ft&&x(_.metalnessMap.channel),roughnessMapUv:Xt&&x(_.roughnessMap.channel),anisotropyMapUv:re&&x(_.anisotropyMap.channel),clearcoatMapUv:ve&&x(_.clearcoatMap.channel),clearcoatNormalMapUv:we&&x(_.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:le&&x(_.clearcoatRoughnessMap.channel),iridescenceMapUv:he&&x(_.iridescenceMap.channel),iridescenceThicknessMapUv:Ee&&x(_.iridescenceThicknessMap.channel),sheenColorMapUv:Be&&x(_.sheenColorMap.channel),sheenRoughnessMapUv:Te&&x(_.sheenRoughnessMap.channel),specularMapUv:Ae&&x(_.specularMap.channel),specularColorMapUv:He&&x(_.specularColorMap.channel),specularIntensityMapUv:qe&&x(_.specularIntensityMap.channel),transmissionMapUv:tt&&x(_.transmissionMap.channel),thicknessMapUv:k&&x(_.thicknessMap.channel),alphaMapUv:ce&&x(_.alphaMap.channel),vertexTangents:!!j.attributes.tangent&&(zt||O),vertexNormals:!!j.attributes.normal,vertexColors:_.vertexColors,vertexAlphas:_.vertexColors===!0&&!!j.attributes.color&&j.attributes.color.itemSize===4,pointsUvs:G.isPoints===!0&&!!j.attributes.uv&&(et||ce),fog:!!z,useFog:_.fog===!0,fogExp2:!!z&&z.isFogExp2,flatShading:_.wireframe===!1&&(_.flatShading===!0||j.attributes.normal===void 0&&zt===!1&&(_.isMeshLambertMaterial||_.isMeshPhongMaterial||_.isMeshStandardMaterial||_.isMeshPhysicalMaterial)),sizeAttenuation:_.sizeAttenuation===!0,logarithmicDepthBuffer:m,reversedDepthBuffer:Se,skinning:G.isSkinnedMesh===!0,hasPositionAttribute:j.attributes.position!==void 0,morphTargets:j.morphAttributes.position!==void 0,morphNormals:j.morphAttributes.normal!==void 0,morphColors:j.morphAttributes.color!==void 0,morphTargetsCount:Ye,morphTextureStride:Ge,numSunLights:I.sun.length,numDirLights:I.directional.length,numPointLights:I.point.length,numSpotLights:I.spot.length,numSpotLightMaps:I.spotLightMap.length,numRectAreaLights:I.rectArea.length,numHemiLights:I.hemi.length,numSunLightShadows:I.sunShadowMap.length,numDirLightShadows:I.directionalShadowMap.length,numPointLightShadows:I.pointShadowMap.length,numSpotLightShadows:I.spotShadowMap.length,numSpotLightShadowsWithMaps:I.numSpotLightShadowsWithMaps,numLightProbes:I.numLightProbes,numLightProbeGrids:J.length,numClippingPlanes:r.numPlanes,numClipIntersection:r.numIntersection,dithering:_.dithering,shadowMapEnabled:i.shadowMap.enabled&&F.length>0,shadowMapType:i.shadowMap.type,toneMapping:We,decodeVideoTexture:et&&_.map.isVideoTexture===!0&&yt.getTransfer(_.map.colorSpace)===Rt,decodeVideoTextureEmissive:xn&&_.emissiveMap.isVideoTexture===!0&&yt.getTransfer(_.emissiveMap.colorSpace)===Rt,premultipliedAlpha:_.premultipliedAlpha,doubleSided:_.side===zn,flipSided:_.side===_n,useDepthPacking:_.depthPacking>=0,depthPacking:_.depthPacking||0,index0AttributeName:_.index0AttributeName,extensionClipCullDistance:_e&&_.extensions.clipCullDistance===!0&&t.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(_e&&_.extensions.multiDraw===!0||Fe)&&t.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:t.has("KHR_parallel_shader_compile"),customProgramCacheKey:_.customProgramCacheKey()};return Ve.vertexUv1s=l.has(1),Ve.vertexUv2s=l.has(2),Ve.vertexUv3s=l.has(3),l.clear(),Ve}function g(_){let I=[];if(_.shaderID?I.push(_.shaderID):(I.push(_.customVertexShaderID),I.push(_.customFragmentShaderID)),_.defines!==void 0)for(let F in _.defines)I.push(F),I.push(_.defines[F]);return _.isRawShaderMaterial===!1&&(p(I,_),A(I,_),I.push(i.outputColorSpace)),I.push(_.customProgramCacheKey),I.join()}function p(_,I){_.push(I.precision),_.push(I.outputColorSpace),_.push(I.envMapMode),_.push(I.envMapCubeUVHeight),_.push(I.mapUv),_.push(I.alphaMapUv),_.push(I.lightMapUv),_.push(I.aoMapUv),_.push(I.bumpMapUv),_.push(I.normalMapUv),_.push(I.displacementMapUv),_.push(I.emissiveMapUv),_.push(I.metalnessMapUv),_.push(I.roughnessMapUv),_.push(I.anisotropyMapUv),_.push(I.clearcoatMapUv),_.push(I.clearcoatNormalMapUv),_.push(I.clearcoatRoughnessMapUv),_.push(I.iridescenceMapUv),_.push(I.iridescenceThicknessMapUv),_.push(I.sheenColorMapUv),_.push(I.sheenRoughnessMapUv),_.push(I.specularMapUv),_.push(I.specularColorMapUv),_.push(I.specularIntensityMapUv),_.push(I.transmissionMapUv),_.push(I.thicknessMapUv),_.push(I.combine),_.push(I.fogExp2),_.push(I.sizeAttenuation),_.push(I.morphTargetsCount),_.push(I.morphAttributeCount),_.push(I.numSunLights),_.push(I.numDirLights),_.push(I.numPointLights),_.push(I.numSpotLights),_.push(I.numSpotLightMaps),_.push(I.numHemiLights),_.push(I.numRectAreaLights),_.push(I.numSunLightShadows),_.push(I.numDirLightShadows),_.push(I.numPointLightShadows),_.push(I.numSpotLightShadows),_.push(I.numSpotLightShadowsWithMaps),_.push(I.numLightProbes),_.push(I.shadowMapType),_.push(I.toneMapping),_.push(I.numClippingPlanes),_.push(I.numClipIntersection),_.push(I.depthPacking)}function A(_,I){a.disableAll(),I.instancing&&a.enable(0),I.instancingColor&&a.enable(1),I.instancingMorph&&a.enable(2),I.matcap&&a.enable(3),I.envMap&&a.enable(4),I.normalMapObjectSpace&&a.enable(5),I.normalMapTangentSpace&&a.enable(6),I.clearcoat&&a.enable(7),I.iridescence&&a.enable(8),I.alphaTest&&a.enable(9),I.vertexColors&&a.enable(10),I.vertexAlphas&&a.enable(11),I.vertexUv1s&&a.enable(12),I.vertexUv2s&&a.enable(13),I.vertexUv3s&&a.enable(14),I.vertexTangents&&a.enable(15),I.anisotropy&&a.enable(16),I.alphaHash&&a.enable(17),I.batching&&a.enable(18),I.dispersion&&a.enable(19),I.retroreflection&&a.enable(24),I.batchingColor&&a.enable(20),I.gradientMap&&a.enable(21),I.packedNormalMap&&a.enable(22),I.vertexNormals&&a.enable(23),_.push(a.mask),a.disableAll(),I.fog&&a.enable(0),I.useFog&&a.enable(1),I.flatShading&&a.enable(2),I.logarithmicDepthBuffer&&a.enable(3),I.reversedDepthBuffer&&a.enable(4),I.skinning&&a.enable(5),I.morphTargets&&a.enable(6),I.morphNormals&&a.enable(7),I.morphColors&&a.enable(8),I.premultipliedAlpha&&a.enable(9),I.shadowMapEnabled&&a.enable(10),I.doubleSided&&a.enable(11),I.flipSided&&a.enable(12),I.useDepthPacking&&a.enable(13),I.dithering&&a.enable(14),I.transmission&&a.enable(15),I.sheen&&a.enable(16),I.opaque&&a.enable(17),I.pointsUvs&&a.enable(18),I.decodeVideoTexture&&a.enable(19),I.decodeVideoTextureEmissive&&a.enable(20),I.alphaToCoverage&&a.enable(21),I.numLightProbeGrids>0&&a.enable(22),I.hasPositionAttribute&&a.enable(23),_.push(a.mask)}function D(_){let I=f[_.type],F;if(I){let V=Ti[I];F=Sd.clone(V.uniforms)}else F=_.uniforms;return F}function T(_,I){let F=d.get(I);return F!==void 0?++F.usedTimes:(F=new X_(i,I,_,s),c.push(F),d.set(I,F)),F}function P(_){if(--_.usedTimes===0){let I=c.indexOf(_);c[I]=c[c.length-1],c.pop(),d.delete(_.cacheKey),_.destroy()}}function R(_){o.remove(_)}function U(){o.dispose()}return{getParameters:b,getProgramCacheKey:g,getUniforms:D,acquireProgram:T,releaseProgram:P,releaseShaderCache:R,programs:c,dispose:U}}function $_(){let i=new WeakMap;function e(a){return i.has(a)}function t(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:e,get:t,remove:n,update:s,dispose:r}}function J_(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.material.id!==e.material.id?i.material.id-e.material.id:i.materialVariant!==e.materialVariant?i.materialVariant-e.materialVariant:i.z!==e.z?i.z-e.z:i.id-e.id}function Gd(i,e){return i.groupOrder!==e.groupOrder?i.groupOrder-e.groupOrder:i.renderOrder!==e.renderOrder?i.renderOrder-e.renderOrder:i.z!==e.z?e.z-i.z:i.id-e.id}function Hd(){let i=[],e=0,t=[],n=[],s=[];function r(){e=0,t.length=0,n.length=0,s.length=0}function a(u){let f=0;return u.isInstancedMesh&&(f+=2),u.isSkinnedMesh&&(f+=1),f}function o(u,f,x,b,g,p){let A=i[e];return A===void 0?(A={id:u.id,object:u,geometry:f,material:x,materialVariant:a(u),groupOrder:b,renderOrder:u.renderOrder,z:g,group:p},i[e]=A):(A.id=u.id,A.object=u,A.geometry=f,A.material=x,A.materialVariant=a(u),A.groupOrder=b,A.renderOrder=u.renderOrder,A.z=g,A.group=p),e++,A}function l(u,f,x,b,g,p,A){A.reversedDepth===!0&&(g=-g);let D=o(u,f,x,b,g,p);x.transmission>0?n.push(D):x.transparent===!0?s.push(D):t.push(D)}function c(u,f,x,b,g,p){let A=o(u,f,x,b,g,p);x.transmission>0?n.unshift(A):x.transparent===!0?s.unshift(A):t.unshift(A)}function d(u,f){t.length>1&&t.sort(u||J_),n.length>1&&n.sort(f||Gd),s.length>1&&s.sort(f||Gd)}function m(){for(let u=e,f=i.length;u<f;u++){let x=i[u];if(x.id===null)break;x.id=null,x.object=null,x.geometry=null,x.material=null,x.group=null}}return{opaque:t,transmissive:n,transparent:s,init:r,push:l,unshift:c,finish:m,sort:d}}function K_(){let i=new WeakMap;function e(n,s){let r=i.get(n),a;return r===void 0?(a=new Hd,i.set(n,[a])):s>=r.length?(a=new Hd,r.push(a)):a=r[s],a}function t(){i=new WeakMap}return{get:e,dispose:t}}function j_(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={direction:new N,color:new Je};break;case"SpotLight":t={position:new N,direction:new N,color:new Je,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new N,color:new Je,distance:0,decay:0};break;case"HemisphereLight":t={direction:new N,skyColor:new Je,groundColor:new Je};break;case"RectAreaLight":t={color:new Je,position:new N,halfWidth:new N,halfHeight:new N};break}return i[e.id]=t,t}}}function Q_(){let i={};return{get:function(e){if(i[e.id]!==void 0)return i[e.id];let t;switch(e.type){case"SunLight":case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Oe};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Oe};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Oe,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[e.id]=t,t}}}var ex=0;function tx(i,e){return(e.castShadow?2:0)-(i.castShadow?2:0)+(e.map?1:0)-(i.map?1:0)}function nx(i){let e=new j_,t=Q_(),n={version:0,hash:{sunLength:-1,directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numSunShadows:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],sun:[],sunShadow:[],sunShadowMap:[],sunShadowMatrix:[],sunShadowCascade:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new N);let s=new N,r=new Ut,a=new Ut;function o(c){let d=0,m=0,u=0;for(let G=0;G<9;G++)n.probe[G].set(0,0,0);let f=0,x=0,b=0,g=0,p=0,A=0,D=0,T=0,P=0,R=0,U=0,_=0,I=0,F=0;c.sort(tx);for(let G=0,J=c.length;G<J;G++){let z=c[G],j=z.color,ae=z.intensity,se=z.distance,q=null;if(z.shadow&&z.shadow.map&&(z.shadow.map.texture.format===ms?q=z.shadow.map.texture:q=z.shadow.map.depthTexture||z.shadow.map.texture),z.isAmbientLight)d+=j.r*ae,m+=j.g*ae,u+=j.b*ae;else if(z.isLightProbe){for(let ne=0;ne<9;ne++)n.probe[ne].addScaledVector(z.sh.coefficients[ne],ae);F++}else if(z.isSunLight){let ne=e.get(z);if(ne.color.copy(z.color).multiplyScalar(z.intensity),z.castShadow){let de=z.shadow,xe=t.get(z);xe.shadowIntensity=de.intensity,xe.shadowBias=de.bias,xe.shadowNormalBias=de.normalBias,xe.shadowRadius=de.radius,xe.shadowMapSize.copy(de.mapSize).multiply(de.getFrameExtents()),n.sunShadow[x]=xe,n.sunShadowMap[x]=q;let Ye=de.getViewportCount();for(let Ge=0;Ge<Ye;Ge++)n.sunShadowMatrix[b+Ge]=de.getMatrix(Ge),n.sunShadowCascade[b+Ge]=de._cascadeData[Ge];b+=Ye,x++}n.sun[f]=ne,f++}else if(z.isDirectionalLight){let ne=e.get(z);if(ne.color.copy(z.color).multiplyScalar(z.intensity),z.castShadow){let de=z.shadow,xe=t.get(z);xe.shadowIntensity=de.intensity,xe.shadowBias=de.bias,xe.shadowNormalBias=de.normalBias,xe.shadowRadius=de.radius,xe.shadowMapSize=de.mapSize,n.directionalShadow[g]=xe,n.directionalShadowMap[g]=q,n.directionalShadowMatrix[g]=z.shadow.matrix,P++}n.directional[g]=ne,g++}else if(z.isSpotLight){let ne=e.get(z);ne.position.setFromMatrixPosition(z.matrixWorld),ne.color.copy(j).multiplyScalar(ae),ne.distance=se,ne.coneCos=Math.cos(z.angle),ne.penumbraCos=Math.cos(z.angle*(1-z.penumbra)),ne.decay=z.decay,n.spot[A]=ne;let de=z.shadow;if(z.map&&(n.spotLightMap[_]=z.map,_++,de.updateMatrices(z),z.castShadow&&I++),n.spotLightMatrix[A]=de.matrix,z.castShadow){let xe=t.get(z);xe.shadowIntensity=de.intensity,xe.shadowBias=de.bias,xe.shadowNormalBias=de.normalBias,xe.shadowRadius=de.radius,xe.shadowMapSize=de.mapSize,n.spotShadow[A]=xe,n.spotShadowMap[A]=q,U++}A++}else if(z.isRectAreaLight){let ne=e.get(z);ne.color.copy(j).multiplyScalar(ae),ne.halfWidth.set(z.width*.5,0,0),ne.halfHeight.set(0,z.height*.5,0),n.rectArea[D]=ne,D++}else if(z.isPointLight){let ne=e.get(z);if(ne.color.copy(z.color).multiplyScalar(z.intensity),ne.distance=z.distance,ne.decay=z.decay,z.castShadow){let de=z.shadow,xe=t.get(z);xe.shadowIntensity=de.intensity,xe.shadowBias=de.bias,xe.shadowNormalBias=de.normalBias,xe.shadowRadius=de.radius,xe.shadowMapSize=de.mapSize,xe.shadowCameraNear=de.camera.near,xe.shadowCameraFar=de.camera.far,n.pointShadow[p]=xe,n.pointShadowMap[p]=q,n.pointShadowMatrix[p]=z.shadow.matrix,R++}n.point[p]=ne,p++}else if(z.isHemisphereLight){let ne=e.get(z);ne.skyColor.copy(z.color).multiplyScalar(ae),ne.groundColor.copy(z.groundColor).multiplyScalar(ae),n.hemi[T]=ne,T++}}D>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=Ie.LTC_FLOAT_1,n.rectAreaLTC2=Ie.LTC_FLOAT_2):(n.rectAreaLTC1=Ie.LTC_HALF_1,n.rectAreaLTC2=Ie.LTC_HALF_2)),n.ambient[0]=d,n.ambient[1]=m,n.ambient[2]=u;let V=n.hash;(V.sunLength!==f||V.directionalLength!==g||V.pointLength!==p||V.spotLength!==A||V.rectAreaLength!==D||V.hemiLength!==T||V.numSunShadows!==x||V.numDirectionalShadows!==P||V.numPointShadows!==R||V.numSpotShadows!==U||V.numSpotMaps!==_||V.numLightProbes!==F)&&(n.sun.length=f,n.directional.length=g,n.spot.length=A,n.rectArea.length=D,n.point.length=p,n.hemi.length=T,n.sunShadow.length=x,n.sunShadowMap.length=x,n.sunShadowMatrix.length=b,n.sunShadowCascade.length=b,n.directionalShadow.length=P,n.directionalShadowMap.length=P,n.directionalShadowMatrix.length=P,n.pointShadow.length=R,n.pointShadowMap.length=R,n.pointShadowMatrix.length=R,n.spotShadow.length=U,n.spotShadowMap.length=U,n.spotLightMatrix.length=U+_-I,n.spotLightMap.length=_,n.numSpotLightShadowsWithMaps=I,n.numLightProbes=F,V.sunLength=f,V.directionalLength=g,V.pointLength=p,V.spotLength=A,V.rectAreaLength=D,V.hemiLength=T,V.numSunShadows=x,V.numDirectionalShadows=P,V.numPointShadows=R,V.numSpotShadows=U,V.numSpotMaps=_,V.numLightProbes=F,n.version=ex++)}function l(c,d){let m=0,u=0,f=0,x=0,b=0,g=0,p=d.matrixWorldInverse;for(let A=0,D=c.length;A<D;A++){let T=c[A];if(T.isSunLight){let P=n.sun[m];P.direction.setFromMatrixPosition(T.matrixWorld),P.direction.transformDirection(p),m++}else if(T.isDirectionalLight){let P=n.directional[u];P.direction.setFromMatrixPosition(T.matrixWorld),s.setFromMatrixPosition(T.target.matrixWorld),P.direction.sub(s),P.direction.transformDirection(p),u++}else if(T.isSpotLight){let P=n.spot[x];P.position.setFromMatrixPosition(T.matrixWorld),P.position.applyMatrix4(p),P.direction.setFromMatrixPosition(T.matrixWorld),s.setFromMatrixPosition(T.target.matrixWorld),P.direction.sub(s),P.direction.transformDirection(p),x++}else if(T.isRectAreaLight){let P=n.rectArea[b];P.position.setFromMatrixPosition(T.matrixWorld),P.position.applyMatrix4(p),a.identity(),r.copy(T.matrixWorld),r.premultiply(p),a.extractRotation(r),P.halfWidth.set(T.width*.5,0,0),P.halfHeight.set(0,T.height*.5,0),P.halfWidth.applyMatrix4(a),P.halfHeight.applyMatrix4(a),b++}else if(T.isPointLight){let P=n.point[f];P.position.setFromMatrixPosition(T.matrixWorld),P.position.applyMatrix4(p),f++}else if(T.isHemisphereLight){let P=n.hemi[g];P.direction.setFromMatrixPosition(T.matrixWorld),P.direction.transformDirection(p),g++}}}return{setup:o,setupView:l,state:n}}function Wd(i){let e=new nx(i),t=[],n=[],s=[];function r(u){m.camera=u,t.length=0,n.length=0,s.length=0}function a(u){t.push(u)}function o(u){n.push(u)}function l(u){s.push(u)}function c(){e.setup(t)}function d(u){e.setupView(t,u)}let m={lightsArray:t,shadowsArray:n,lightProbeGridArray:s,camera:null,lights:e,transmissionRenderTarget:{},textureUnits:0};return{init:r,state:m,setupLights:c,setupLightsView:d,pushLight:a,pushShadow:o,pushLightProbeGrid:l}}function ix(i){let e=new WeakMap;function t(s,r=0){let a=e.get(s),o;return a===void 0?(o=new Wd(i),e.set(s,[o])):r>=a.length?(o=new Wd(i),a.push(o)):o=a[r],o}function n(){e=new WeakMap}return{get:t,dispose:n}}var sx=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,rx=`uniform sampler2D shadow_pass;
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
}`,ax=[new N(1,0,0),new N(-1,0,0),new N(0,1,0),new N(0,-1,0),new N(0,0,1),new N(0,0,-1)],ox=[new N(0,-1,0),new N(0,-1,0),new N(0,0,1),new N(0,0,-1),new N(0,-1,0),new N(0,-1,0)],Xd=new Ut,va=new N,Rh=new N;function lx(i,e,t){let n=new cr,s=new Oe,r=new Oe,a=new Yt,o=new ko,l=new Vo,c={},d=t.maxTextureSize,m={[hs]:_n,[_n]:hs,[zn]:zn},u=new dn({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Oe},radius:{value:4}},vertexShader:sx,fragmentShader:rx}),f=u.clone();f.defines.HORIZONTAL_PASS=1;let x=new Pt;x.setAttribute("position",new Zn(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let b=new vt(x,u),g=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=ca;let p=this.type;this.render=function(R,U,_){if(g.enabled===!1||g.autoUpdate===!1&&g.needsUpdate===!1||R.length===0)return;this.type===zu&&(je("WebGLShadowMap: PCFSoftShadowMap has been removed. Using PCFShadowMap instead."),this.type=ca);let I=i.getRenderTarget(),F=i.getActiveCubeFace(),V=i.getActiveMipmapLevel(),G=i.state;G.setBlending(bi),G.buffers.depth.getReversed()===!0?G.buffers.color.setClear(0,0,0,0):G.buffers.color.setClear(1,1,1,1),G.buffers.depth.setTest(!0),G.setScissorTest(!1);let J=p!==this.type;J&&U.traverse(function(z){z.material&&(Array.isArray(z.material)?z.material.forEach(j=>j.needsUpdate=!0):z.material.needsUpdate=!0)});for(let z=0,j=R.length;z<j;z++){let ae=R[z],se=ae.shadow;if(se===void 0){je("WebGLShadowMap:",ae,"has no shadow.");continue}if(se.autoUpdate===!1&&se.needsUpdate===!1)continue;s.copy(se.mapSize);let q=se.getFrameExtents();s.multiply(q),r.copy(se.mapSize),(s.x>d||s.y>d)&&(s.x>d&&(r.x=Math.floor(d/q.x),s.x=r.x*q.x,se.mapSize.x=r.x),s.y>d&&(r.y=Math.floor(d/q.y),s.y=r.y*q.y,se.mapSize.y=r.y));let ne=i.state.buffers.depth.getReversed();if(se.camera._reversedDepth=ne,se.map===null||J===!0){if(se.map!==null&&(se.map.depthTexture!==null&&(se.map.depthTexture.dispose(),se.map.depthTexture=null),se.map.dispose()),this.type===mr){if(ae.isPointLight){je("WebGLShadowMap: VSM shadow maps are not supported for PointLights. Use PCF or BasicShadowMap instead.");continue}se.map=new Bn(s.x,s.y,{format:ms,type:pi,minFilter:wn,magFilter:wn,generateMipmaps:!1}),se.map.texture.name=ae.name+".shadowMap",se.map.depthTexture=new ts(s.x,s.y,fi),se.map.depthTexture.name=ae.name+".shadowMapDepth",se.map.depthTexture.format=vi,se.map.depthTexture.compareFunction=null,se.map.depthTexture.minFilter=gn,se.map.depthTexture.magFilter=gn}else ae.isPointLight?(se.map=new Zl(s.x),se.map.depthTexture=new Lo(s.x,di)):(se.map=new Bn(s.x,s.y),se.map.depthTexture=new ts(s.x,s.y,di)),se.map.depthTexture.name=ae.name+".shadowMap",se.map.depthTexture.format=vi,this.type===ca?(se.map.depthTexture.compareFunction=ne?Wl:Hl,se.map.depthTexture.minFilter=wn,se.map.depthTexture.magFilter=wn):(se.map.depthTexture.compareFunction=null,se.map.depthTexture.minFilter=gn,se.map.depthTexture.magFilter=gn);se.camera.updateProjectionMatrix()}se.map.isWebGLCubeRenderTarget!==!0&&(se.map.width!==s.x||se.map.height!==s.y)&&se.map.setSize(s.x,s.y);let de=se.map.isWebGLCubeRenderTarget?6:se.getViewportCount();ae.isPointLight!==!0&&se.updateMatrices(ae,_);for(let xe=0;xe<de;xe++){let Ye=se.getCamera(xe);if(ae.isPointLight){let Ge=se.camera,bt=se.matrix,dt=ae.distance||Ge.far;dt!==Ge.far&&(Ge.far=dt,Ge.updateProjectionMatrix()),va.setFromMatrixPosition(ae.matrixWorld),Ge.position.copy(va),Rh.copy(Ge.position),Rh.add(ax[xe]),Ge.up.copy(ox[xe]),Ge.lookAt(Rh),Ge.updateMatrixWorld(),bt.makeTranslation(-va.x,-va.y,-va.z),Xd.multiplyMatrices(Ge.projectionMatrix,Ge.matrixWorldInverse),se._frustum.setFromProjectionMatrix(Xd,Ge.coordinateSystem,Ge.reversedDepth)}if(se.map.isWebGLCubeRenderTarget)i.setRenderTarget(se.map,xe),i.clear();else{xe===0&&(i.setRenderTarget(se.map),i.clear());let Ge=se.getViewport(xe);a.set(r.x*Ge.x,r.y*Ge.y,r.x*Ge.z,r.y*Ge.w),G.viewport(a)}n=se.getFrustum(xe),T(U,_,Ye,ae,this.type)}se.isPointLightShadow!==!0&&this.type===mr&&A(se,_),se.needsUpdate=!1}p=this.type,g.needsUpdate=!1,i.setRenderTarget(I,F,V)};function A(R,U){let _=e.update(b);u.defines.VSM_SAMPLES!==R.blurSamples&&(u.defines.VSM_SAMPLES=R.blurSamples,f.defines.VSM_SAMPLES=R.blurSamples,u.needsUpdate=!0,f.needsUpdate=!0),R.mapPass===null?R.mapPass=new Bn(s.x,s.y,{format:ms,type:pi}):(R.mapPass.width!==R.map.width||R.mapPass.height!==R.map.height)&&R.mapPass.setSize(R.map.width,R.map.height),u.uniforms.shadow_pass.value=R.map.depthTexture,u.uniforms.resolution.value.set(R.map.width,R.map.height),u.uniforms.radius.value=R.radius,i.setRenderTarget(R.mapPass),i.clear(),i.renderBufferDirect(U,null,_,u,b,null),f.uniforms.shadow_pass.value=R.mapPass.texture,f.uniforms.resolution.value.set(R.map.width,R.map.height),f.uniforms.radius.value=R.radius,i.setRenderTarget(R.map),i.clear(),i.renderBufferDirect(U,null,_,f,b,null)}function D(R,U,_,I){let F=null,V=_.isPointLight===!0?R.customDistanceMaterial:R.customDepthMaterial;if(V!==void 0)F=V;else if(F=_.isPointLight===!0?l:o,i.localClippingEnabled&&U.clipShadows===!0&&Array.isArray(U.clippingPlanes)&&U.clippingPlanes.length!==0||U.displacementMap&&U.displacementScale!==0||U.alphaMap&&U.alphaTest>0||U.map&&U.alphaTest>0||U.alphaToCoverage===!0){let G=F.uuid,J=U.uuid,z=c[G];z===void 0&&(z={},c[G]=z);let j=z[J];j===void 0&&(j=F.clone(),z[J]=j,U.addEventListener("dispose",P)),F=j}if(F.visible=U.visible,F.wireframe=U.wireframe,I===mr?F.side=U.shadowSide!==null?U.shadowSide:U.side:F.side=U.shadowSide!==null?U.shadowSide:m[U.side],F.alphaMap=U.alphaMap,F.alphaTest=U.alphaToCoverage===!0?.5:U.alphaTest,F.map=U.map,F.clipShadows=U.clipShadows,F.clippingPlanes=U.clippingPlanes,F.clipIntersection=U.clipIntersection,F.displacementMap=U.displacementMap,F.displacementScale=U.displacementScale,F.displacementBias=U.displacementBias,F.wireframeLinewidth=U.wireframeLinewidth,F.linewidth=U.linewidth,_.isPointLight===!0&&F.isMeshDistanceMaterial===!0){let G=i.properties.get(F);G.light=_}return F}function T(R,U,_,I,F){if(R.visible===!1)return;if(R.layers.test(U.layers)&&(R.isMesh||R.isLine||R.isPoints)&&(R.castShadow||R.receiveShadow&&F===mr)&&(!R.frustumCulled||R.intersectsFrustum(n))){R.modelViewMatrix.multiplyMatrices(_.matrixWorldInverse,R.matrixWorld);let J=e.update(R),z=R.material;if(Array.isArray(z)){let j=J.groups;for(let ae=0,se=j.length;ae<se;ae++){let q=j[ae],ne=z[q.materialIndex];if(ne&&ne.visible){let de=D(R,ne,I,F);R.onBeforeShadow(i,R,U,_,J,de,q),i.renderBufferDirect(_,null,J,de,R,q),R.onAfterShadow(i,R,U,_,J,de,q)}}}else if(z.visible){let j=D(R,z,I,F);R.onBeforeShadow(i,R,U,_,J,j,null),i.renderBufferDirect(_,null,J,j,R,null),R.onAfterShadow(i,R,U,_,J,j,null)}}let G=R.children;for(let J=0,z=G.length;J<z;J++)T(G[J],U,_,I,F)}function P(R){R.target.removeEventListener("dispose",P);for(let _ in c){let I=c[_],F=R.target.uuid;F in I&&(I[F].dispose(),delete I[F])}}}function cx(i,e){function t(){let k=!1,be=new Yt,ce=null,Ce=new Yt(0,0,0,0);return{setMask:function(Le){ce!==Le&&!k&&(i.colorMask(Le,Le,Le,Le),ce=Le)},setLocked:function(Le){k=Le},setClear:function(Le,_e,We,Ve,Lt){Lt===!0&&(Le*=Ve,_e*=Ve,We*=Ve),be.set(Le,_e,We,Ve),Ce.equals(be)===!1&&(i.clearColor(Le,_e,We,Ve),Ce.copy(be))},reset:function(){k=!1,ce=null,Ce.set(-1,0,0,0)}}}function n(){let k=!1,be=!1,ce=null,Ce=null,Le=null;return{setReversed:function(_e){if(be!==_e){let We=e.get("EXT_clip_control");_e?We.clipControlEXT(We.LOWER_LEFT_EXT,We.ZERO_TO_ONE_EXT):We.clipControlEXT(We.LOWER_LEFT_EXT,We.NEGATIVE_ONE_TO_ONE_EXT),be=_e;let Ve=Le;Le=null,this.setClear(Ve)}},getReversed:function(){return be},setTest:function(_e){_e?fe(i.DEPTH_TEST):Se(i.DEPTH_TEST)},setMask:function(_e){ce!==_e&&!k&&(i.depthMask(_e),ce=_e)},setFunc:function(_e){if(be&&(_e=vd[_e]),Ce!==_e){switch(_e){case po:i.depthFunc(i.NEVER);break;case mo:i.depthFunc(i.ALWAYS);break;case go:i.depthFunc(i.LESS);break;case nr:i.depthFunc(i.LEQUAL);break;case _o:i.depthFunc(i.EQUAL);break;case xo:i.depthFunc(i.GEQUAL);break;case vo:i.depthFunc(i.GREATER);break;case yo:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}Ce=_e}},setLocked:function(_e){k=_e},setClear:function(_e){Le!==_e&&(Le=_e,be&&(_e=1-_e),i.clearDepth(_e))},reset:function(){k=!1,ce=null,Ce=null,Le=null,be=!1}}}function s(){let k=!1,be=null,ce=null,Ce=null,Le=null,_e=null,We=null,Ve=null,Lt=null;return{setTest:function(Et){k||(Et?fe(i.STENCIL_TEST):Se(i.STENCIL_TEST))},setMask:function(Et){be!==Et&&!k&&(i.stencilMask(Et),be=Et)},setFunc:function(Et,vn,Fn){(ce!==Et||Ce!==vn||Le!==Fn)&&(i.stencilFunc(Et,vn,Fn),ce=Et,Ce=vn,Le=Fn)},setOp:function(Et,vn,Fn){(_e!==Et||We!==vn||Ve!==Fn)&&(i.stencilOp(Et,vn,Fn),_e=Et,We=vn,Ve=Fn)},setLocked:function(Et){k=Et},setClear:function(Et){Lt!==Et&&(i.clearStencil(Et),Lt=Et)},reset:function(){k=!1,be=null,ce=null,Ce=null,Le=null,_e=null,We=null,Ve=null,Lt=null}}}let r=new t,a=new n,o=new s,l=new WeakMap,c=new WeakMap,d={},m={},u={},f=new WeakMap,x=[],b=null,g=!1,p=null,A=null,D=null,T=null,P=null,R=null,U=null,_=new Je(0,0,0),I=0,F=!1,V=null,G=null,J=null,z=null,j=null,ae=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),se=!1,q=0,ne=i.getParameter(i.VERSION);ne.indexOf("WebGL")!==-1?(q=parseFloat(/^WebGL (\d)/.exec(ne)[1]),se=q>=1):ne.indexOf("OpenGL ES")!==-1&&(q=parseFloat(/^OpenGL ES (\d)/.exec(ne)[1]),se=q>=2);let de=null,xe={},Ye=i.getParameter(i.SCISSOR_BOX),Ge=i.getParameter(i.VIEWPORT),bt=new Yt().fromArray(Ye),dt=new Yt().fromArray(Ge);function lt(k,be,ce,Ce){let Le=new Uint8Array(4),_e=i.createTexture();i.bindTexture(k,_e),i.texParameteri(k,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(k,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let We=0;We<ce;We++)k===i.TEXTURE_3D||k===i.TEXTURE_2D_ARRAY?i.texImage3D(be,0,i.RGBA,1,1,Ce,0,i.RGBA,i.UNSIGNED_BYTE,Le):i.texImage2D(be+We,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,Le);return _e}let oe={};oe[i.TEXTURE_2D]=lt(i.TEXTURE_2D,i.TEXTURE_2D,1),oe[i.TEXTURE_CUBE_MAP]=lt(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),oe[i.TEXTURE_2D_ARRAY]=lt(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),oe[i.TEXTURE_3D]=lt(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),fe(i.DEPTH_TEST),a.setFunc(nr),ot(!1),zt(qc),fe(i.CULL_FACE),gt(bi);function fe(k){d[k]!==!0&&(i.enable(k),d[k]=!0)}function Se(k){d[k]!==!1&&(i.disable(k),d[k]=!1)}function $e(k,be){return u[k]!==be?(i.bindFramebuffer(k,be),u[k]=be,k===i.DRAW_FRAMEBUFFER&&(u[i.FRAMEBUFFER]=be),k===i.FRAMEBUFFER&&(u[i.DRAW_FRAMEBUFFER]=be),!0):!1}function Fe(k,be){let ce=x,Ce=!1;if(k){ce=f.get(be),ce===void 0&&(ce=[],f.set(be,ce));let Le=k.textures;if(ce.length!==Le.length||ce[0]!==i.COLOR_ATTACHMENT0){for(let _e=0,We=Le.length;_e<We;_e++)ce[_e]=i.COLOR_ATTACHMENT0+_e;ce.length=Le.length,Ce=!0}}else ce[0]!==i.BACK&&(ce[0]=i.BACK,Ce=!0);Ce&&i.drawBuffers(ce)}function et(k){return b!==k?(i.useProgram(k),b=k,!0):!1}let Ze={[Rs]:i.FUNC_ADD,[Vu]:i.FUNC_SUBTRACT,[Gu]:i.FUNC_REVERSE_SUBTRACT};Ze[Hu]=i.MIN,Ze[Wu]=i.MAX;let rt={[Xu]:i.ZERO,[qu]:i.ONE,[Yu]:i.SRC_COLOR,[$c]:i.SRC_ALPHA,[Qu]:i.SRC_ALPHA_SATURATE,[Ku]:i.DST_COLOR,[$u]:i.DST_ALPHA,[Zu]:i.ONE_MINUS_SRC_COLOR,[Jc]:i.ONE_MINUS_SRC_ALPHA,[ju]:i.ONE_MINUS_DST_COLOR,[Ju]:i.ONE_MINUS_DST_ALPHA,[ed]:i.CONSTANT_COLOR,[td]:i.ONE_MINUS_CONSTANT_COLOR,[nd]:i.CONSTANT_ALPHA,[id]:i.ONE_MINUS_CONSTANT_ALPHA};function gt(k,be,ce,Ce,Le,_e,We,Ve,Lt,Et){if(k===bi){g===!0&&(Se(i.BLEND),g=!1);return}if(g===!1&&(fe(i.BLEND),g=!0),k!==ku){if(k!==p||Et!==F){if((A!==Rs||P!==Rs)&&(i.blendEquation(i.FUNC_ADD),A=Rs,P=Rs),Et)switch(k){case us:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case on:i.blendFunc(i.ONE,i.ONE);break;case Yc:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case Zc:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:Qe("WebGLState: Invalid blending: ",k);break}else switch(k){case us:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case on:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case Yc:Qe("WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case Zc:Qe("WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:Qe("WebGLState: Invalid blending: ",k);break}D=null,T=null,R=null,U=null,_.set(0,0,0),I=0,p=k,F=Et}return}Le=Le||be,_e=_e||ce,We=We||Ce,(be!==A||Le!==P)&&(i.blendEquationSeparate(Ze[be],Ze[Le]),A=be,P=Le),(ce!==D||Ce!==T||_e!==R||We!==U)&&(i.blendFuncSeparate(rt[ce],rt[Ce],rt[_e],rt[We]),D=ce,T=Ce,R=_e,U=We),(Ve.equals(_)===!1||Lt!==I)&&(i.blendColor(Ve.r,Ve.g,Ve.b,Lt),_.copy(Ve),I=Lt),p=k,F=!1}function at(k,be){k.side===zn?Se(i.CULL_FACE):fe(i.CULL_FACE);let ce=k.side===_n;be&&(ce=!ce),ot(ce),k.blending===us&&k.transparent===!1?gt(bi):gt(k.blending,k.blendEquation,k.blendSrc,k.blendDst,k.blendEquationAlpha,k.blendSrcAlpha,k.blendDstAlpha,k.blendColor,k.blendAlpha,k.premultipliedAlpha),a.setFunc(k.depthFunc),a.setTest(k.depthTest),a.setMask(k.depthWrite),r.setMask(k.colorWrite);let Ce=k.stencilWrite;o.setTest(Ce),Ce&&(o.setMask(k.stencilWriteMask),o.setFunc(k.stencilFunc,k.stencilRef,k.stencilFuncMask),o.setOp(k.stencilFail,k.stencilZFail,k.stencilZPass)),xn(k.polygonOffset,k.polygonOffsetFactor,k.polygonOffsetUnits),k.alphaToCoverage===!0?fe(i.SAMPLE_ALPHA_TO_COVERAGE):Se(i.SAMPLE_ALPHA_TO_COVERAGE)}function ot(k){V!==k&&(k?i.frontFace(i.CW):i.frontFace(i.CCW),V=k)}function zt(k){k!==Ou?(fe(i.CULL_FACE),k!==G&&(k===qc?i.cullFace(i.BACK):k===Bu?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):Se(i.CULL_FACE),G=k}function nn(k){k!==J&&(se&&i.lineWidth(k),J=k)}function xn(k,be,ce){k?(fe(i.POLYGON_OFFSET_FILL),(z!==be||j!==ce)&&(z=be,j=ce,a.getReversed()&&(be=-be),i.polygonOffset(be,ce))):Se(i.POLYGON_OFFSET_FILL)}function Ft(k){k?fe(i.SCISSOR_TEST):Se(i.SCISSOR_TEST)}function Xt(k){k===void 0&&(k=i.TEXTURE0+ae-1),de!==k&&(i.activeTexture(k),de=k)}function O(k,be,ce){ce===void 0&&(de===null?ce=i.TEXTURE0+ae-1:ce=de);let Ce=xe[ce];Ce===void 0&&(Ce={type:void 0,texture:void 0},xe[ce]=Ce),(Ce.type!==k||Ce.texture!==be)&&(de!==ce&&(i.activeTexture(ce),de=ce),i.bindTexture(k,be||oe[k]),Ce.type=k,Ce.texture=be)}function sn(){let k=xe[de];k!==void 0&&k.type!==void 0&&(i.bindTexture(k.type,null),k.type=void 0,k.texture=void 0)}function pt(){try{i.compressedTexImage2D(...arguments)}catch(k){Qe("WebGLState:",k)}}function L(){try{i.compressedTexImage3D(...arguments)}catch(k){Qe("WebGLState:",k)}}function y(){try{i.texSubImage2D(...arguments)}catch(k){Qe("WebGLState:",k)}}function W(){try{i.texSubImage3D(...arguments)}catch(k){Qe("WebGLState:",k)}}function Z(){try{i.compressedTexSubImage2D(...arguments)}catch(k){Qe("WebGLState:",k)}}function re(){try{i.compressedTexSubImage3D(...arguments)}catch(k){Qe("WebGLState:",k)}}function ve(){try{i.texStorage2D(...arguments)}catch(k){Qe("WebGLState:",k)}}function we(){try{i.texStorage3D(...arguments)}catch(k){Qe("WebGLState:",k)}}function le(){try{i.texImage2D(...arguments)}catch(k){Qe("WebGLState:",k)}}function he(){try{i.texImage3D(...arguments)}catch(k){Qe("WebGLState:",k)}}function Ee(k){return m[k]!==void 0?m[k]:i.getParameter(k)}function Be(k,be){m[k]!==be&&(i.pixelStorei(k,be),m[k]=be)}function Te(k){bt.equals(k)===!1&&(i.scissor(k.x,k.y,k.z,k.w),bt.copy(k))}function Ae(k){dt.equals(k)===!1&&(i.viewport(k.x,k.y,k.z,k.w),dt.copy(k))}function He(k,be){let ce=c.get(be);ce===void 0&&(ce=new WeakMap,c.set(be,ce));let Ce=ce.get(k);Ce===void 0&&(Ce=i.getUniformBlockIndex(be,k.name),ce.set(k,Ce))}function qe(k,be){let Ce=c.get(be).get(k);l.get(be)!==Ce&&(i.uniformBlockBinding(be,Ce,k.__bindingPointIndex),l.set(be,Ce))}function tt(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),i.pixelStorei(i.PACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_ALIGNMENT,4),i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,!1),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,!1),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,i.BROWSER_DEFAULT_WEBGL),i.pixelStorei(i.PACK_ROW_LENGTH,0),i.pixelStorei(i.PACK_SKIP_PIXELS,0),i.pixelStorei(i.PACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_ROW_LENGTH,0),i.pixelStorei(i.UNPACK_IMAGE_HEIGHT,0),i.pixelStorei(i.UNPACK_SKIP_PIXELS,0),i.pixelStorei(i.UNPACK_SKIP_ROWS,0),i.pixelStorei(i.UNPACK_SKIP_IMAGES,0),d={},m={},de=null,xe={},u={},f=new WeakMap,x=[],b=null,g=!1,p=null,A=null,D=null,T=null,P=null,R=null,U=null,_=new Je(0,0,0),I=0,F=!1,V=null,G=null,J=null,z=null,j=null,bt.set(0,0,i.canvas.width,i.canvas.height),dt.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:fe,disable:Se,bindFramebuffer:$e,drawBuffers:Fe,useProgram:et,setBlending:gt,setMaterial:at,setFlipSided:ot,setCullFace:zt,setLineWidth:nn,setPolygonOffset:xn,setScissorTest:Ft,activeTexture:Xt,bindTexture:O,unbindTexture:sn,compressedTexImage2D:pt,compressedTexImage3D:L,texImage2D:le,texImage3D:he,pixelStorei:Be,getParameter:Ee,updateUBOMapping:He,uniformBlockBinding:qe,texStorage2D:ve,texStorage3D:we,texSubImage2D:y,texSubImage3D:W,compressedTexSubImage2D:Z,compressedTexSubImage3D:re,scissor:Te,viewport:Ae,reset:tt}}function hx(i,e,t,n,s,r,a){let o=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Oe,d=new WeakMap,m=new Set,u,f=new WeakMap,x=!1;try{x=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function b(L,y){return x?new OffscreenCanvas(L,y):sr("canvas")}function g(L,y,W){let Z=1,re=pt(L);if((re.width>W||re.height>W)&&(Z=W/Math.max(re.width,re.height)),Z<1)if(typeof HTMLImageElement<"u"&&L instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&L instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&L instanceof ImageBitmap||typeof VideoFrame<"u"&&L instanceof VideoFrame){let ve=Math.floor(Z*re.width),we=Math.floor(Z*re.height);u===void 0&&(u=b(ve,we));let le=y?b(ve,we):u;return le.width=ve,le.height=we,le.getContext("2d").drawImage(L,0,0,ve,we),je("WebGLRenderer: Texture has been resized from ("+re.width+"x"+re.height+") to ("+ve+"x"+we+")."),le}else return"data"in L&&je("WebGLRenderer: Image in DataTexture is too big ("+re.width+"x"+re.height+")."),L;return L}function p(L){return L.generateMipmaps}function A(L){i.generateMipmap(L)}function D(L){return L.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:L.isWebGL3DRenderTarget?i.TEXTURE_3D:L.isWebGLArrayRenderTarget||L.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function T(L,y,W,Z,re,ve=!1){if(L!==null){if(i[L]!==void 0)return i[L];je("WebGLRenderer: Attempt to use non-existing WebGL internal format '"+L+"'")}let we;Z&&(we=e.get("EXT_texture_norm16"),we||je("WebGLRenderer: Unable to use normalized textures without EXT_texture_norm16 extension"));let le=y;if(y===i.RED&&(W===i.FLOAT&&(le=i.R32F),W===i.HALF_FLOAT&&(le=i.R16F),W===i.UNSIGNED_BYTE&&(le=i.R8),W===i.UNSIGNED_SHORT&&we&&(le=we.R16_EXT),W===i.SHORT&&we&&(le=we.R16_SNORM_EXT)),y===i.RED_INTEGER&&(W===i.UNSIGNED_BYTE&&(le=i.R8UI),W===i.UNSIGNED_SHORT&&(le=i.R16UI),W===i.UNSIGNED_INT&&(le=i.R32UI),W===i.BYTE&&(le=i.R8I),W===i.SHORT&&(le=i.R16I),W===i.INT&&(le=i.R32I)),y===i.RG&&(W===i.FLOAT&&(le=i.RG32F),W===i.HALF_FLOAT&&(le=i.RG16F),W===i.UNSIGNED_BYTE&&(le=i.RG8),W===i.UNSIGNED_SHORT&&we&&(le=we.RG16_EXT),W===i.SHORT&&we&&(le=we.RG16_SNORM_EXT)),y===i.RG_INTEGER&&(W===i.UNSIGNED_BYTE&&(le=i.RG8UI),W===i.UNSIGNED_SHORT&&(le=i.RG16UI),W===i.UNSIGNED_INT&&(le=i.RG32UI),W===i.BYTE&&(le=i.RG8I),W===i.SHORT&&(le=i.RG16I),W===i.INT&&(le=i.RG32I)),y===i.RGB_INTEGER&&(W===i.UNSIGNED_BYTE&&(le=i.RGB8UI),W===i.UNSIGNED_SHORT&&(le=i.RGB16UI),W===i.UNSIGNED_INT&&(le=i.RGB32UI),W===i.BYTE&&(le=i.RGB8I),W===i.SHORT&&(le=i.RGB16I),W===i.INT&&(le=i.RGB32I)),y===i.RGBA_INTEGER&&(W===i.UNSIGNED_BYTE&&(le=i.RGBA8UI),W===i.UNSIGNED_SHORT&&(le=i.RGBA16UI),W===i.UNSIGNED_INT&&(le=i.RGBA32UI),W===i.BYTE&&(le=i.RGBA8I),W===i.SHORT&&(le=i.RGBA16I),W===i.INT&&(le=i.RGBA32I)),y===i.RGB&&(W===i.UNSIGNED_SHORT&&we&&(le=we.RGB16_EXT),W===i.SHORT&&we&&(le=we.RGB16_SNORM_EXT),W===i.UNSIGNED_INT_5_9_9_9_REV&&(le=i.RGB9_E5),W===i.UNSIGNED_INT_10F_11F_11F_REV&&(le=i.R11F_G11F_B10F)),y===i.RGBA){let he=ve?Vr:yt.getTransfer(re);W===i.FLOAT&&(le=i.RGBA32F),W===i.HALF_FLOAT&&(le=i.RGBA16F),W===i.UNSIGNED_BYTE&&(le=he===Rt?i.SRGB8_ALPHA8:i.RGBA8),W===i.UNSIGNED_SHORT&&we&&(le=we.RGBA16_EXT),W===i.SHORT&&we&&(le=we.RGBA16_SNORM_EXT),W===i.UNSIGNED_SHORT_4_4_4_4&&(le=i.RGBA4),W===i.UNSIGNED_SHORT_5_5_5_1&&(le=i.RGB5_A1)}return(le===i.R16F||le===i.R32F||le===i.RG16F||le===i.RG32F||le===i.RGBA16F||le===i.RGBA32F)&&e.get("EXT_color_buffer_float"),le}function P(L,y){let W;return L?y===null||y===di||y===_r?W=i.DEPTH24_STENCIL8:y===fi?W=i.DEPTH32F_STENCIL8:y===gr&&(W=i.DEPTH24_STENCIL8,je("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):y===null||y===di||y===_r?W=i.DEPTH_COMPONENT24:y===fi?W=i.DEPTH_COMPONENT32F:y===gr&&(W=i.DEPTH_COMPONENT16),W}function R(L,y){return p(L)===!0||L.isFramebufferTexture&&L.minFilter!==gn&&L.minFilter!==wn?Math.log2(Math.max(y.width,y.height))+1:L.mipmaps!==void 0&&L.mipmaps.length>0?L.mipmaps.length:L.isCompressedTexture&&Array.isArray(L.image)?y.mipmaps.length:1}function U(L){let y=L.target;y.removeEventListener("dispose",U),I(y),y.isVideoTexture&&d.delete(y),y.isHTMLTexture&&m.delete(y)}function _(L){let y=L.target;y.removeEventListener("dispose",_),V(y)}function I(L){let y=n.get(L);if(y.__webglInit===void 0)return;let W=L.source,Z=f.get(W);if(Z){let re=Z[y.__cacheKey];re.usedTimes--,re.usedTimes===0&&F(L),Object.keys(Z).length===0&&f.delete(W)}n.remove(L)}function F(L){let y=n.get(L);i.deleteTexture(y.__webglTexture);let W=L.source,Z=f.get(W);delete Z[y.__cacheKey],a.memory.textures--}function V(L){let y=n.get(L);if(L.depthTexture&&(L.depthTexture.dispose(),n.remove(L.depthTexture)),L.isWebGLCubeRenderTarget)for(let Z=0;Z<6;Z++){if(Array.isArray(y.__webglFramebuffer[Z]))for(let re=0;re<y.__webglFramebuffer[Z].length;re++)i.deleteFramebuffer(y.__webglFramebuffer[Z][re]);else i.deleteFramebuffer(y.__webglFramebuffer[Z]);y.__webglDepthbuffer&&i.deleteRenderbuffer(y.__webglDepthbuffer[Z])}else{if(Array.isArray(y.__webglFramebuffer))for(let Z=0;Z<y.__webglFramebuffer.length;Z++)i.deleteFramebuffer(y.__webglFramebuffer[Z]);else i.deleteFramebuffer(y.__webglFramebuffer);if(y.__webglDepthbuffer&&i.deleteRenderbuffer(y.__webglDepthbuffer),y.__webglMultisampledFramebuffer&&i.deleteFramebuffer(y.__webglMultisampledFramebuffer),y.__webglColorRenderbuffer)for(let Z=0;Z<y.__webglColorRenderbuffer.length;Z++)y.__webglColorRenderbuffer[Z]&&i.deleteRenderbuffer(y.__webglColorRenderbuffer[Z]);y.__webglDepthRenderbuffer&&i.deleteRenderbuffer(y.__webglDepthRenderbuffer)}let W=L.textures;for(let Z=0,re=W.length;Z<re;Z++){let ve=n.get(W[Z]);ve.__webglTexture&&(i.deleteTexture(ve.__webglTexture),a.memory.textures--),n.remove(W[Z])}n.remove(L)}let G=0;function J(){G=0}function z(){return G}function j(L){G=L}function ae(){let L=G;return L>=s.maxTextures&&je("WebGLTextures: Trying to use "+(L+1)+" texture units while this GPU supports only "+s.maxTextures),G+=1,L}function se(L){let y=[];return y.push(L.wrapS),y.push(L.wrapT),y.push(L.wrapR||0),y.push(L.magFilter),y.push(L.minFilter),y.push(L.anisotropy),y.push(L.internalFormat),y.push(L.format),y.push(L.type),y.push(L.generateMipmaps),y.push(L.premultiplyAlpha),y.push(L.flipY),y.push(L.unpackAlignment),y.push(L.colorSpace),y.join()}function q(L,y){let W=n.get(L);if(L.isVideoTexture&&O(L),L.isRenderTargetTexture===!1&&L.isExternalTexture!==!0&&L.version>0&&W.__version!==L.version){let Z=L.image;if(Z===null)je("WebGLRenderer: Texture marked for update but no image data found.");else if(Z.complete===!1)je("WebGLRenderer: Texture marked for update but image is incomplete");else{Se(W,L,y);return}}else L.isExternalTexture&&(W.__webglTexture=L.sourceTexture?L.sourceTexture:null);t.bindTexture(i.TEXTURE_2D,W.__webglTexture,i.TEXTURE0+y)}function ne(L,y){let W=n.get(L);if(L.isRenderTargetTexture===!1&&L.version>0&&W.__version!==L.version){Se(W,L,y);return}else L.isExternalTexture&&(W.__webglTexture=L.sourceTexture?L.sourceTexture:null);t.bindTexture(i.TEXTURE_2D_ARRAY,W.__webglTexture,i.TEXTURE0+y)}function de(L,y){let W=n.get(L);if(L.isRenderTargetTexture===!1&&L.version>0&&W.__version!==L.version){Se(W,L,y);return}t.bindTexture(i.TEXTURE_3D,W.__webglTexture,i.TEXTURE0+y)}function xe(L,y){let W=n.get(L);if(L.isCubeDepthTexture!==!0&&L.version>0&&W.__version!==L.version){$e(W,L,y);return}t.bindTexture(i.TEXTURE_CUBE_MAP,W.__webglTexture,i.TEXTURE0+y)}let Ye={[Mo]:i.REPEAT,[xi]:i.CLAMP_TO_EDGE,[So]:i.MIRRORED_REPEAT},Ge={[gn]:i.NEAREST,[ad]:i.NEAREST_MIPMAP_NEAREST,[ua]:i.NEAREST_MIPMAP_LINEAR,[wn]:i.LINEAR,[rl]:i.LINEAR_MIPMAP_NEAREST,[fs]:i.LINEAR_MIPMAP_LINEAR},bt={[hd]:i.NEVER,[md]:i.ALWAYS,[ud]:i.LESS,[Hl]:i.LEQUAL,[dd]:i.EQUAL,[Wl]:i.GEQUAL,[fd]:i.GREATER,[pd]:i.NOTEQUAL};function dt(L,y){if(y.type===fi&&e.has("OES_texture_float_linear")===!1&&(y.magFilter===wn||y.magFilter===rl||y.magFilter===ua||y.magFilter===fs||y.minFilter===wn||y.minFilter===rl||y.minFilter===ua||y.minFilter===fs)&&je("WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(L,i.TEXTURE_WRAP_S,Ye[y.wrapS]),i.texParameteri(L,i.TEXTURE_WRAP_T,Ye[y.wrapT]),(L===i.TEXTURE_3D||L===i.TEXTURE_2D_ARRAY)&&i.texParameteri(L,i.TEXTURE_WRAP_R,Ye[y.wrapR]),i.texParameteri(L,i.TEXTURE_MAG_FILTER,Ge[y.magFilter]),i.texParameteri(L,i.TEXTURE_MIN_FILTER,Ge[y.minFilter]),y.compareFunction&&(i.texParameteri(L,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(L,i.TEXTURE_COMPARE_FUNC,bt[y.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(y.magFilter===gn||y.minFilter!==ua&&y.minFilter!==fs||y.type===fi&&e.has("OES_texture_float_linear")===!1)return;if(y.anisotropy>1||n.get(y).__currentAnisotropy){let W=e.get("EXT_texture_filter_anisotropic");i.texParameterf(L,W.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(y.anisotropy,s.getMaxAnisotropy())),n.get(y).__currentAnisotropy=y.anisotropy}}}function lt(L,y){let W=!1;L.__webglInit===void 0&&(L.__webglInit=!0,y.addEventListener("dispose",U));let Z=y.source,re=f.get(Z);re===void 0&&(re={},f.set(Z,re));let ve=se(y);if(ve!==L.__cacheKey){re[ve]===void 0&&(re[ve]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,W=!0),re[ve].usedTimes++;let we=re[L.__cacheKey];we!==void 0&&(re[L.__cacheKey].usedTimes--,we.usedTimes===0&&F(y)),L.__cacheKey=ve,L.__webglTexture=re[ve].texture}return W}function oe(L,y,W){return Math.floor(Math.floor(L/W)/y)}function fe(L,y,W,Z){let ve=L.updateRanges;if(ve.length===0)t.texSubImage2D(i.TEXTURE_2D,0,0,0,y.width,y.height,W,Z,y.data);else{ve.sort((Be,Te)=>Be.start-Te.start);let we=0;for(let Be=1;Be<ve.length;Be++){let Te=ve[we],Ae=ve[Be],He=Te.start+Te.count,qe=oe(Ae.start,y.width,4),tt=oe(Te.start,y.width,4);Ae.start<=He+1&&qe===tt&&oe(Ae.start+Ae.count-1,y.width,4)===qe?Te.count=Math.max(Te.count,Ae.start+Ae.count-Te.start):(++we,ve[we]=Ae)}ve.length=we+1;let le=t.getParameter(i.UNPACK_ROW_LENGTH),he=t.getParameter(i.UNPACK_SKIP_PIXELS),Ee=t.getParameter(i.UNPACK_SKIP_ROWS);t.pixelStorei(i.UNPACK_ROW_LENGTH,y.width);for(let Be=0,Te=ve.length;Be<Te;Be++){let Ae=ve[Be],He=Math.floor(Ae.start/4),qe=Math.ceil(Ae.count/4),tt=He%y.width,k=Math.floor(He/y.width),be=qe,ce=1;t.pixelStorei(i.UNPACK_SKIP_PIXELS,tt),t.pixelStorei(i.UNPACK_SKIP_ROWS,k),t.texSubImage2D(i.TEXTURE_2D,0,tt,k,be,ce,W,Z,y.data)}L.clearUpdateRanges(),t.pixelStorei(i.UNPACK_ROW_LENGTH,le),t.pixelStorei(i.UNPACK_SKIP_PIXELS,he),t.pixelStorei(i.UNPACK_SKIP_ROWS,Ee)}}function Se(L,y,W){let Z=i.TEXTURE_2D;(y.isDataArrayTexture||y.isCompressedArrayTexture)&&(Z=i.TEXTURE_2D_ARRAY),y.isData3DTexture&&(Z=i.TEXTURE_3D);let re=lt(L,y),ve=y.source;t.bindTexture(Z,L.__webglTexture,i.TEXTURE0+W);let we=n.get(ve);if(ve.version!==we.__version||re===!0){if(t.activeTexture(i.TEXTURE0+W),(typeof ImageBitmap<"u"&&y.image instanceof ImageBitmap)===!1){let ce=yt.getPrimaries(yt.workingColorSpace),Ce=y.colorSpace===Gi?null:yt.getPrimaries(y.colorSpace),Le=y.colorSpace===Gi||ce===Ce?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,y.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Le)}t.pixelStorei(i.UNPACK_ALIGNMENT,y.unpackAlignment);let he=g(y.image,!1,s.maxTextureSize);he=sn(y,he);let Ee=r.convert(y.format,y.colorSpace),Be=r.convert(y.type),Te=T(y.internalFormat,Ee,Be,y.normalized,y.colorSpace,y.isVideoTexture);dt(Z,y);let Ae,He=y.mipmaps,qe=y.isVideoTexture!==!0,tt=we.__version===void 0||re===!0,k=ve.dataReady,be=R(y,he);if(y.isDepthTexture)Te=P(y.format===ps,y.type),tt&&(qe?t.texStorage2D(i.TEXTURE_2D,1,Te,he.width,he.height):t.texImage2D(i.TEXTURE_2D,0,Te,he.width,he.height,0,Ee,Be,null));else if(y.isDataTexture)if(He.length>0){qe&&tt&&t.texStorage2D(i.TEXTURE_2D,be,Te,He[0].width,He[0].height);for(let ce=0,Ce=He.length;ce<Ce;ce++)Ae=He[ce],qe?k&&t.texSubImage2D(i.TEXTURE_2D,ce,0,0,Ae.width,Ae.height,Ee,Be,Ae.data):t.texImage2D(i.TEXTURE_2D,ce,Te,Ae.width,Ae.height,0,Ee,Be,Ae.data);y.generateMipmaps=!1}else qe?(tt&&t.texStorage2D(i.TEXTURE_2D,be,Te,he.width,he.height),k&&fe(y,he,Ee,Be)):t.texImage2D(i.TEXTURE_2D,0,Te,he.width,he.height,0,Ee,Be,he.data);else if(y.isCompressedTexture)if(y.isCompressedArrayTexture){qe&&tt&&t.texStorage3D(i.TEXTURE_2D_ARRAY,be,Te,He[0].width,He[0].height,he.depth);for(let ce=0,Ce=He.length;ce<Ce;ce++)if(Ae=He[ce],y.format!==ti)if(Ee!==null)if(qe){if(k)if(y.layerUpdates.size>0){let Le=xh(Ae.width,Ae.height,y.format,y.type);for(let _e of y.layerUpdates){let We=Ae.data.subarray(_e*Le/Ae.data.BYTES_PER_ELEMENT,(_e+1)*Le/Ae.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ce,0,0,_e,Ae.width,Ae.height,1,Ee,We)}}else t.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,ce,0,0,0,Ae.width,Ae.height,he.depth,Ee,Ae.data)}else t.compressedTexImage3D(i.TEXTURE_2D_ARRAY,ce,Te,Ae.width,Ae.height,he.depth,0,Ae.data,0,0);else je("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else qe?k&&t.texSubImage3D(i.TEXTURE_2D_ARRAY,ce,0,0,0,Ae.width,Ae.height,he.depth,Ee,Be,Ae.data):t.texImage3D(i.TEXTURE_2D_ARRAY,ce,Te,Ae.width,Ae.height,he.depth,0,Ee,Be,Ae.data);y.layerUpdates.size>0&&y.clearLayerUpdates()}else{qe&&tt&&t.texStorage2D(i.TEXTURE_2D,be,Te,He[0].width,He[0].height);for(let ce=0,Ce=He.length;ce<Ce;ce++)Ae=He[ce],y.format!==ti?Ee!==null?qe?k&&t.compressedTexSubImage2D(i.TEXTURE_2D,ce,0,0,Ae.width,Ae.height,Ee,Ae.data):t.compressedTexImage2D(i.TEXTURE_2D,ce,Te,Ae.width,Ae.height,0,Ae.data):je("WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):qe?k&&t.texSubImage2D(i.TEXTURE_2D,ce,0,0,Ae.width,Ae.height,Ee,Be,Ae.data):t.texImage2D(i.TEXTURE_2D,ce,Te,Ae.width,Ae.height,0,Ee,Be,Ae.data)}else if(y.isDataArrayTexture)if(qe){if(tt&&t.texStorage3D(i.TEXTURE_2D_ARRAY,be,Te,he.width,he.height,he.depth),k)if(y.layerUpdates.size>0){let ce=xh(he.width,he.height,y.format,y.type);for(let Ce of y.layerUpdates){let Le=he.data.subarray(Ce*ce/he.data.BYTES_PER_ELEMENT,(Ce+1)*ce/he.data.BYTES_PER_ELEMENT);t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Ce,he.width,he.height,1,Ee,Be,Le)}y.clearLayerUpdates()}else t.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,he.width,he.height,he.depth,Ee,Be,he.data)}else t.texImage3D(i.TEXTURE_2D_ARRAY,0,Te,he.width,he.height,he.depth,0,Ee,Be,he.data);else if(y.isData3DTexture)qe?(tt&&t.texStorage3D(i.TEXTURE_3D,be,Te,he.width,he.height,he.depth),k&&t.texSubImage3D(i.TEXTURE_3D,0,0,0,0,he.width,he.height,he.depth,Ee,Be,he.data)):t.texImage3D(i.TEXTURE_3D,0,Te,he.width,he.height,he.depth,0,Ee,Be,he.data);else if(y.isFramebufferTexture){if(tt)if(qe)t.texStorage2D(i.TEXTURE_2D,be,Te,he.width,he.height);else{let ce=he.width,Ce=he.height;for(let Le=0;Le<be;Le++)t.texImage2D(i.TEXTURE_2D,Le,Te,ce,Ce,0,Ee,Be,null),ce>>=1,Ce>>=1}}else if(y.isHTMLTexture){if("texElementImage2D"in i){let ce=i.canvas;if(ce.hasAttribute("layoutsubtree")||ce.setAttribute("layoutsubtree","true"),he.parentNode!==ce){ce.appendChild(he),m.add(y),ce.onpaint=Ce=>{let Le=Ce.changedElements;for(let _e of m)Le.includes(_e.image)&&(_e.needsUpdate=!0)},ce.requestPaint();return}if(i.texElementImage2D.length===3)i.texElementImage2D(i.TEXTURE_2D,i.RGBA8,he);else{let Le=i.RGBA,_e=i.RGBA,We=i.UNSIGNED_BYTE;i.texElementImage2D(i.TEXTURE_2D,0,Le,_e,We,he)}i.texParameteri(i.TEXTURE_2D,i.TEXTURE_MIN_FILTER,i.LINEAR),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_S,i.CLAMP_TO_EDGE),i.texParameteri(i.TEXTURE_2D,i.TEXTURE_WRAP_T,i.CLAMP_TO_EDGE)}}else if(He.length>0){if(qe&&tt){let ce=pt(He[0]);t.texStorage2D(i.TEXTURE_2D,be,Te,ce.width,ce.height)}for(let ce=0,Ce=He.length;ce<Ce;ce++)Ae=He[ce],qe?k&&t.texSubImage2D(i.TEXTURE_2D,ce,0,0,Ee,Be,Ae):t.texImage2D(i.TEXTURE_2D,ce,Te,Ee,Be,Ae);y.generateMipmaps=!1}else if(qe){if(tt){let ce=pt(he);t.texStorage2D(i.TEXTURE_2D,be,Te,ce.width,ce.height)}k&&t.texSubImage2D(i.TEXTURE_2D,0,0,0,Ee,Be,he)}else t.texImage2D(i.TEXTURE_2D,0,Te,Ee,Be,he);p(y)&&A(Z),we.__version=ve.version,y.onUpdate&&y.onUpdate(y)}L.__version=y.version}function $e(L,y,W){if(y.image.length!==6)return;let Z=lt(L,y),re=y.source;t.bindTexture(i.TEXTURE_CUBE_MAP,L.__webglTexture,i.TEXTURE0+W);let ve=n.get(re);if(re.version!==ve.__version||Z===!0){t.activeTexture(i.TEXTURE0+W);let we=yt.getPrimaries(yt.workingColorSpace),le=y.colorSpace===Gi?null:yt.getPrimaries(y.colorSpace),he=y.colorSpace===Gi||we===le?i.NONE:i.BROWSER_DEFAULT_WEBGL;t.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,y.flipY),t.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,y.premultiplyAlpha),t.pixelStorei(i.UNPACK_ALIGNMENT,y.unpackAlignment),t.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,he);let Ee=y.isCompressedTexture||y.image[0].isCompressedTexture,Be=y.image[0]&&y.image[0].isDataTexture,Te=[];for(let _e=0;_e<6;_e++)!Ee&&!Be?Te[_e]=g(y.image[_e],!0,s.maxCubemapSize):Te[_e]=Be?y.image[_e].image:y.image[_e],Te[_e]=sn(y,Te[_e]);let Ae=Te[0],He=r.convert(y.format,y.colorSpace),qe=r.convert(y.type),tt=T(y.internalFormat,He,qe,y.normalized,y.colorSpace),k=y.isVideoTexture!==!0,be=ve.__version===void 0||Z===!0,ce=re.dataReady,Ce=R(y,Ae);dt(i.TEXTURE_CUBE_MAP,y);let Le;if(Ee){k&&be&&t.texStorage2D(i.TEXTURE_CUBE_MAP,Ce,tt,Ae.width,Ae.height);for(let _e=0;_e<6;_e++){Le=Te[_e].mipmaps;for(let We=0;We<Le.length;We++){let Ve=Le[We];y.format!==ti?He!==null?k?ce&&t.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+_e,We,0,0,Ve.width,Ve.height,He,Ve.data):t.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+_e,We,tt,Ve.width,Ve.height,0,Ve.data):je("WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):k?ce&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+_e,We,0,0,Ve.width,Ve.height,He,qe,Ve.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+_e,We,tt,Ve.width,Ve.height,0,He,qe,Ve.data)}}}else{if(Le=y.mipmaps,k&&be){Le.length>0&&Ce++;let _e=pt(Te[0]);t.texStorage2D(i.TEXTURE_CUBE_MAP,Ce,tt,_e.width,_e.height)}for(let _e=0;_e<6;_e++)if(Be){k?ce&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+_e,0,0,0,Te[_e].width,Te[_e].height,He,qe,Te[_e].data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+_e,0,tt,Te[_e].width,Te[_e].height,0,He,qe,Te[_e].data);for(let We=0;We<Le.length;We++){let Lt=Le[We].image[_e].image;k?ce&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+_e,We+1,0,0,Lt.width,Lt.height,He,qe,Lt.data):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+_e,We+1,tt,Lt.width,Lt.height,0,He,qe,Lt.data)}}else{k?ce&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+_e,0,0,0,He,qe,Te[_e]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+_e,0,tt,He,qe,Te[_e]);for(let We=0;We<Le.length;We++){let Ve=Le[We];k?ce&&t.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+_e,We+1,0,0,He,qe,Ve.image[_e]):t.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+_e,We+1,tt,He,qe,Ve.image[_e])}}}p(y)&&A(i.TEXTURE_CUBE_MAP),ve.__version=re.version,y.onUpdate&&y.onUpdate(y)}L.__version=y.version}function Fe(L,y,W,Z,re,ve){let we=r.convert(W.format,W.colorSpace),le=r.convert(W.type),he=T(W.internalFormat,we,le,W.normalized,W.colorSpace),Ee=n.get(y),Be=n.get(W);if(Be.__renderTarget=y,!Ee.__hasExternalTextures){let Te=Math.max(1,y.width>>ve),Ae=Math.max(1,y.height>>ve);re===i.TEXTURE_3D||re===i.TEXTURE_2D_ARRAY?t.texImage3D(re,ve,he,Te,Ae,y.depth,0,we,le,null):t.texImage2D(re,ve,he,Te,Ae,0,we,le,null)}t.bindFramebuffer(i.FRAMEBUFFER,L),Xt(y)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,Z,re,Be.__webglTexture,0,Ft(y)):(re===i.TEXTURE_2D||re>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&re<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,Z,re,Be.__webglTexture,ve),t.bindFramebuffer(i.FRAMEBUFFER,null)}function et(L,y,W){if(i.bindRenderbuffer(i.RENDERBUFFER,L),y.depthBuffer){let Z=y.depthTexture,re=Z&&Z.isDepthTexture?Z.type:null,ve=P(y.stencilBuffer,re),we=y.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;Xt(y)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Ft(y),ve,y.width,y.height):W?i.renderbufferStorageMultisample(i.RENDERBUFFER,Ft(y),ve,y.width,y.height):i.renderbufferStorage(i.RENDERBUFFER,ve,y.width,y.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,we,i.RENDERBUFFER,L)}else{let Z=y.textures;for(let re=0;re<Z.length;re++){let ve=Z[re],we=r.convert(ve.format,ve.colorSpace),le=r.convert(ve.type),he=T(ve.internalFormat,we,le,ve.normalized,ve.colorSpace);Xt(y)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Ft(y),he,y.width,y.height):W?i.renderbufferStorageMultisample(i.RENDERBUFFER,Ft(y),he,y.width,y.height):i.renderbufferStorage(i.RENDERBUFFER,he,y.width,y.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Ze(L,y,W){let Z=y.isWebGLCubeRenderTarget===!0;if(t.bindFramebuffer(i.FRAMEBUFFER,L),!(y.depthTexture&&y.depthTexture.isDepthTexture))throw new Error("THREE.WebGLTextures: renderTarget.depthTexture must be an instance of THREE.DepthTexture.");let re=n.get(y.depthTexture);if(re.__renderTarget=y,(!re.__webglTexture||y.depthTexture.image.width!==y.width||y.depthTexture.image.height!==y.height)&&(y.depthTexture.image.width=y.width,y.depthTexture.image.height=y.height,y.depthTexture.needsUpdate=!0),Z){if(re.__webglInit===void 0&&(re.__webglInit=!0,y.depthTexture.addEventListener("dispose",U)),re.__webglTexture===void 0){re.__webglTexture=i.createTexture(),t.bindTexture(i.TEXTURE_CUBE_MAP,re.__webglTexture),dt(i.TEXTURE_CUBE_MAP,y.depthTexture);let Ee=r.convert(y.depthTexture.format),Be=r.convert(y.depthTexture.type),Te;y.depthTexture.format===vi?Te=i.DEPTH_COMPONENT24:y.depthTexture.format===ps&&(Te=i.DEPTH24_STENCIL8);for(let Ae=0;Ae<6;Ae++)i.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Ae,0,Te,y.width,y.height,0,Ee,Be,null)}}else q(y.depthTexture,0);let ve=re.__webglTexture,we=Ft(y),le=Z?i.TEXTURE_CUBE_MAP_POSITIVE_X+W:i.TEXTURE_2D,he=y.depthTexture.format===ps?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;if(y.depthTexture.format===vi)Xt(y)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,he,le,ve,0,we):i.framebufferTexture2D(i.FRAMEBUFFER,he,le,ve,0);else if(y.depthTexture.format===ps)Xt(y)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,he,le,ve,0,we):i.framebufferTexture2D(i.FRAMEBUFFER,he,le,ve,0);else throw new Error("THREE.WebGLTextures: Unknown depthTexture format.")}function rt(L){let y=n.get(L),W=L.isWebGLCubeRenderTarget===!0;if(y.__boundDepthTexture!==L.depthTexture){let Z=L.depthTexture;if(y.__depthDisposeCallback&&y.__depthDisposeCallback(),Z){let re=()=>{delete y.__boundDepthTexture,delete y.__depthDisposeCallback,Z.removeEventListener("dispose",re)};Z.addEventListener("dispose",re),y.__depthDisposeCallback=re}y.__boundDepthTexture=Z}if(L.depthTexture&&!y.__autoAllocateDepthBuffer)if(W)for(let Z=0;Z<6;Z++)Ze(y.__webglFramebuffer[Z],L,Z);else{let Z=L.texture.mipmaps;Z&&Z.length>0?Ze(y.__webglFramebuffer[0],L,0):Ze(y.__webglFramebuffer,L,0)}else if(W){y.__webglDepthbuffer=[];for(let Z=0;Z<6;Z++)if(t.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer[Z]),y.__webglDepthbuffer[Z]===void 0)y.__webglDepthbuffer[Z]=i.createRenderbuffer(),et(y.__webglDepthbuffer[Z],L,!1);else{let re=L.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ve=y.__webglDepthbuffer[Z];i.bindRenderbuffer(i.RENDERBUFFER,ve),i.framebufferRenderbuffer(i.FRAMEBUFFER,re,i.RENDERBUFFER,ve)}}else{let Z=L.texture.mipmaps;if(Z&&Z.length>0?t.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer[0]):t.bindFramebuffer(i.FRAMEBUFFER,y.__webglFramebuffer),y.__webglDepthbuffer===void 0)y.__webglDepthbuffer=i.createRenderbuffer(),et(y.__webglDepthbuffer,L,!1);else{let re=L.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,ve=y.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,ve),i.framebufferRenderbuffer(i.FRAMEBUFFER,re,i.RENDERBUFFER,ve)}}t.bindFramebuffer(i.FRAMEBUFFER,null)}function gt(L,y,W){let Z=n.get(L);y!==void 0&&Fe(Z.__webglFramebuffer,L,L.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),W!==void 0&&rt(L)}function at(L){let y=L.texture,W=n.get(L),Z=n.get(y);L.addEventListener("dispose",_);let re=L.textures,ve=L.isWebGLCubeRenderTarget===!0,we=re.length>1;if(we||(Z.__webglTexture===void 0&&(Z.__webglTexture=i.createTexture()),Z.__version=y.version,a.memory.textures++),ve){W.__webglFramebuffer=[];for(let le=0;le<6;le++)if(y.mipmaps&&y.mipmaps.length>0){W.__webglFramebuffer[le]=[];for(let he=0;he<y.mipmaps.length;he++)W.__webglFramebuffer[le][he]=i.createFramebuffer()}else W.__webglFramebuffer[le]=i.createFramebuffer()}else{if(y.mipmaps&&y.mipmaps.length>0){W.__webglFramebuffer=[];for(let le=0;le<y.mipmaps.length;le++)W.__webglFramebuffer[le]=i.createFramebuffer()}else W.__webglFramebuffer=i.createFramebuffer();if(we)for(let le=0,he=re.length;le<he;le++){let Ee=n.get(re[le]);Ee.__webglTexture===void 0&&(Ee.__webglTexture=i.createTexture(),a.memory.textures++)}if(L.samples>0&&Xt(L)===!1){W.__webglMultisampledFramebuffer=i.createFramebuffer(),W.__webglColorRenderbuffer=[],t.bindFramebuffer(i.FRAMEBUFFER,W.__webglMultisampledFramebuffer);for(let le=0;le<re.length;le++){let he=re[le];W.__webglColorRenderbuffer[le]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,W.__webglColorRenderbuffer[le]);let Ee=r.convert(he.format,he.colorSpace),Be=r.convert(he.type),Te=T(he.internalFormat,Ee,Be,he.normalized,he.colorSpace,L.isXRRenderTarget===!0),Ae=Ft(L);i.renderbufferStorageMultisample(i.RENDERBUFFER,Ae,Te,L.width,L.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+le,i.RENDERBUFFER,W.__webglColorRenderbuffer[le])}i.bindRenderbuffer(i.RENDERBUFFER,null),L.depthBuffer&&(W.__webglDepthRenderbuffer=i.createRenderbuffer(),et(W.__webglDepthRenderbuffer,L,!0)),t.bindFramebuffer(i.FRAMEBUFFER,null)}}if(ve){t.bindTexture(i.TEXTURE_CUBE_MAP,Z.__webglTexture),dt(i.TEXTURE_CUBE_MAP,y);for(let le=0;le<6;le++)if(y.mipmaps&&y.mipmaps.length>0)for(let he=0;he<y.mipmaps.length;he++)Fe(W.__webglFramebuffer[le][he],L,y,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+le,he);else Fe(W.__webglFramebuffer[le],L,y,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+le,0);p(y)&&A(i.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(we){for(let le=0,he=re.length;le<he;le++){let Ee=re[le],Be=n.get(Ee),Te=i.TEXTURE_2D;(L.isWebGL3DRenderTarget||L.isWebGLArrayRenderTarget)&&(Te=L.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(Te,Be.__webglTexture),dt(Te,Ee),Fe(W.__webglFramebuffer,L,Ee,i.COLOR_ATTACHMENT0+le,Te,0),p(Ee)&&A(Te)}t.unbindTexture()}else{let le=i.TEXTURE_2D;if((L.isWebGL3DRenderTarget||L.isWebGLArrayRenderTarget)&&(le=L.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),t.bindTexture(le,Z.__webglTexture),dt(le,y),y.mipmaps&&y.mipmaps.length>0)for(let he=0;he<y.mipmaps.length;he++)Fe(W.__webglFramebuffer[he],L,y,i.COLOR_ATTACHMENT0,le,he);else Fe(W.__webglFramebuffer,L,y,i.COLOR_ATTACHMENT0,le,0);p(y)&&A(le),t.unbindTexture()}L.depthBuffer&&rt(L)}function ot(L){let y=L.textures;for(let W=0,Z=y.length;W<Z;W++){let re=y[W];if(p(re)){let ve=D(L),we=n.get(re).__webglTexture;t.bindTexture(ve,we),A(ve),t.unbindTexture()}}}let zt=[],nn=[];function xn(L){if(L.samples>0){if(Xt(L)===!1){let y=L.textures,W=L.width,Z=L.height,re=i.COLOR_BUFFER_BIT,ve=L.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,we=n.get(L),le=y.length>1;if(le)for(let Ee=0;Ee<y.length;Ee++)t.bindFramebuffer(i.FRAMEBUFFER,we.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ee,i.RENDERBUFFER,null),t.bindFramebuffer(i.FRAMEBUFFER,we.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ee,i.TEXTURE_2D,null,0);t.bindFramebuffer(i.READ_FRAMEBUFFER,we.__webglMultisampledFramebuffer);let he=L.texture.mipmaps;he&&he.length>0?t.bindFramebuffer(i.DRAW_FRAMEBUFFER,we.__webglFramebuffer[0]):t.bindFramebuffer(i.DRAW_FRAMEBUFFER,we.__webglFramebuffer);for(let Ee=0;Ee<y.length;Ee++){if(L.resolveDepthBuffer&&(L.depthBuffer&&(re|=i.DEPTH_BUFFER_BIT),L.stencilBuffer&&L.resolveStencilBuffer&&(re|=i.STENCIL_BUFFER_BIT)),le){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,we.__webglColorRenderbuffer[Ee]);let Be=n.get(y[Ee]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,Be,0)}i.blitFramebuffer(0,0,W,Z,0,0,W,Z,re,i.NEAREST),l===!0&&(zt.length=0,nn.length=0,zt.push(i.COLOR_ATTACHMENT0+Ee),L.depthBuffer&&L.storeMultisampledDepthBuffer===!1&&(zt.push(ve),nn.push(ve),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,nn)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,zt))}if(t.bindFramebuffer(i.READ_FRAMEBUFFER,null),t.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),le)for(let Ee=0;Ee<y.length;Ee++){t.bindFramebuffer(i.FRAMEBUFFER,we.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ee,i.RENDERBUFFER,we.__webglColorRenderbuffer[Ee]);let Be=n.get(y[Ee]).__webglTexture;t.bindFramebuffer(i.FRAMEBUFFER,we.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Ee,i.TEXTURE_2D,Be,0)}t.bindFramebuffer(i.DRAW_FRAMEBUFFER,we.__webglMultisampledFramebuffer)}else if(L.depthBuffer&&L.storeMultisampledDepthBuffer===!1&&l){let y=L.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[y])}}}function Ft(L){return Math.min(s.maxSamples,L.samples)}function Xt(L){let y=n.get(L);return L.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&y.__useRenderToTexture!==!1}function O(L){let y=a.render.frame;d.get(L)!==y&&(d.set(L,y),L.update())}function sn(L,y){let W=L.colorSpace,Z=L.format,re=L.type;return L.isCompressedTexture===!0||L.isVideoTexture===!0||W!==kr&&W!==Gi&&(yt.getTransfer(W)===Rt?(Z!==ti||re!==kn)&&je("WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):Qe("WebGLTextures: Unsupported texture color space:",W)),y}function pt(L){return typeof HTMLImageElement<"u"&&L instanceof HTMLImageElement?(c.width=L.naturalWidth||L.width,c.height=L.naturalHeight||L.height):typeof VideoFrame<"u"&&L instanceof VideoFrame?(c.width=L.displayWidth,c.height=L.displayHeight):(c.width=L.width,c.height=L.height),c}this.allocateTextureUnit=ae,this.resetTextureUnits=J,this.getTextureUnits=z,this.setTextureUnits=j,this.setTexture2D=q,this.setTexture2DArray=ne,this.setTexture3D=de,this.setTextureCube=xe,this.rebindTextures=gt,this.setupRenderTarget=at,this.updateRenderTargetMipmap=ot,this.updateMultisampleRenderTarget=xn,this.setupDepthRenderbuffer=rt,this.setupFrameBufferTexture=Fe,this.useMultisampledRTT=Xt,this.isReversedDepthBuffer=function(){return t.buffers.depth.getReversed()}}function ux(i,e){function t(n,s=Gi){let r,a=yt.getTransfer(s);if(n===kn)return i.UNSIGNED_BYTE;if(n===ol)return i.UNSIGNED_SHORT_4_4_4_4;if(n===ll)return i.UNSIGNED_SHORT_5_5_5_1;if(n===oh)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===lh)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===rh)return i.BYTE;if(n===ah)return i.SHORT;if(n===gr)return i.UNSIGNED_SHORT;if(n===al)return i.INT;if(n===di)return i.UNSIGNED_INT;if(n===fi)return i.FLOAT;if(n===pi)return i.HALF_FLOAT;if(n===ch)return i.ALPHA;if(n===hh)return i.RGB;if(n===ti)return i.RGBA;if(n===vi)return i.DEPTH_COMPONENT;if(n===ps)return i.DEPTH_STENCIL;if(n===uh)return i.RED;if(n===cl)return i.RED_INTEGER;if(n===ms)return i.RG;if(n===hl)return i.RG_INTEGER;if(n===ul)return i.RGBA_INTEGER;if(n===da||n===fa||n===pa||n===ma)if(a===Rt)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===da)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===fa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===pa)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===ma)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===da)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===fa)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===pa)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===ma)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===dl||n===fl||n===pl||n===ml)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===dl)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===fl)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===pl)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===ml)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===gl||n===_l||n===xl||n===vl||n===yl||n===ga||n===Ml)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===gl||n===_l)return a===Rt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===xl)return a===Rt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC;if(n===vl)return r.COMPRESSED_R11_EAC;if(n===yl)return r.COMPRESSED_SIGNED_R11_EAC;if(n===ga)return r.COMPRESSED_RG11_EAC;if(n===Ml)return r.COMPRESSED_SIGNED_RG11_EAC}else return null;if(n===Sl||n===bl||n===wl||n===Tl||n===Al||n===El||n===Cl||n===Rl||n===Pl||n===Il||n===Ll||n===Dl||n===Nl||n===Ul)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Sl)return a===Rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===bl)return a===Rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===wl)return a===Rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Tl)return a===Rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Al)return a===Rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===El)return a===Rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Cl)return a===Rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Rl)return a===Rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Pl)return a===Rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Il)return a===Rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Ll)return a===Rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===Dl)return a===Rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Nl)return a===Rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===Ul)return a===Rt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===Fl||n===Ol||n===Bl)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===Fl)return a===Rt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===Ol)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===Bl)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===zl||n===kl||n===_a||n===Vl)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===zl)return r.COMPRESSED_RED_RGTC1_EXT;if(n===kl)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===_a)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===Vl)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===_r?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:t}}var dx=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,fx=`
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

}`,Oh=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){let n=new $r(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){let t=e.cameras[0].viewport,n=new dn({vertexShader:dx,fragmentShader:fx,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new vt(new ki(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},Bh=class extends yi{constructor(e,t){super();let n=this,s=null,r=1,a=null,o="local-floor",l=1,c=null,d=null,m=null,u=null,f=null,x=null,b=typeof XRWebGLBinding<"u",g=new Oh,p={},A=t.getContextAttributes(),D=null,T=null,P=[],R=[],U=new Oe,_=null,I=null,F=new Cn;F.viewport=new Yt;let V=new Cn;V.viewport=new Yt;let G=[F,V],J=new el,z=null,j=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(oe){let fe=P[oe];return fe===void 0&&(fe=new lr,P[oe]=fe),fe.getTargetRaySpace()},this.getControllerGrip=function(oe){let fe=P[oe];return fe===void 0&&(fe=new lr,P[oe]=fe),fe.getGripSpace()},this.getHand=function(oe){let fe=P[oe];return fe===void 0&&(fe=new lr,P[oe]=fe),fe.getHandSpace()};function ae(oe){let fe=R.indexOf(oe.inputSource);if(fe===-1)return;let Se=P[fe];Se!==void 0&&(Se.update(oe.inputSource,oe.frame,c||a),Se.dispatchEvent({type:oe.type,data:oe.inputSource}))}function se(){s.removeEventListener("select",ae),s.removeEventListener("selectstart",ae),s.removeEventListener("selectend",ae),s.removeEventListener("squeeze",ae),s.removeEventListener("squeezestart",ae),s.removeEventListener("squeezeend",ae),s.removeEventListener("end",se),s.removeEventListener("inputsourceschange",q);for(let oe=0;oe<P.length;oe++){let fe=R[oe];fe!==null&&(R[oe]=null,P[oe].disconnect(fe))}z=null,j=null,g.reset();for(let oe in p)delete p[oe];if(e.setRenderTarget(D),f=null,u=null,m=null,s=null,T=null,lt.stop(),n.isPresenting=!1,e.setPixelRatio(_),e.setSize(U.width,U.height,!1),I!==null){let oe=I.camera;oe.fov=I.fov,oe.zoom=I.zoom,oe.updateProjectionMatrix(),I=null}n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(oe){r=oe,n.isPresenting===!0&&je("WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(oe){o=oe,n.isPresenting===!0&&je("WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(oe){c=oe},this.getBaseLayer=function(){return u!==null?u:f},this.getBinding=function(){return m===null&&b&&(m=new XRWebGLBinding(s,t)),m},this.getFrame=function(){return x},this.getSession=function(){return s},this.setSession=async function(oe){if(s=oe,s!==null){if(D=e.getRenderTarget(),s.addEventListener("select",ae),s.addEventListener("selectstart",ae),s.addEventListener("selectend",ae),s.addEventListener("squeeze",ae),s.addEventListener("squeezestart",ae),s.addEventListener("squeezeend",ae),s.addEventListener("end",se),s.addEventListener("inputsourceschange",q),A.xrCompatible!==!0&&await t.makeXRCompatible(),_=e.getPixelRatio(),e.getSize(U),b&&"createProjectionLayer"in XRWebGLBinding.prototype){let Se=null,$e=null,Fe=null;A.depth&&(Fe=A.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,Se=A.stencil?ps:vi,$e=A.stencil?_r:di);let et={colorFormat:t.RGBA8,depthFormat:Fe,scaleFactor:r};m=this.getBinding(),u=m.createProjectionLayer(et),s.updateRenderState({layers:[u]}),e.setPixelRatio(1),e.setSize(u.textureWidth,u.textureHeight,!1),T=new Bn(u.textureWidth,u.textureHeight,{format:ti,type:kn,depthTexture:new ts(u.textureWidth,u.textureHeight,$e,void 0,void 0,void 0,void 0,void 0,void 0,Se),stencilBuffer:A.stencil,colorSpace:e.outputColorSpace,samples:A.antialias?4:0,resolveDepthBuffer:u.ignoreDepthValues===!1,resolveStencilBuffer:u.ignoreDepthValues===!1,storeMultisampledDepthBuffer:u.ignoreDepthValues===!1,storeMultisampledStencilBuffer:u.ignoreDepthValues===!1})}else{let Se={antialias:A.antialias,alpha:!0,depth:A.depth,stencil:A.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,t,Se),s.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),T=new Bn(f.framebufferWidth,f.framebufferHeight,{format:ti,type:kn,colorSpace:e.outputColorSpace,stencilBuffer:A.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1,storeMultisampledDepthBuffer:f.ignoreDepthValues===!1,storeMultisampledStencilBuffer:f.ignoreDepthValues===!1})}T.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),lt.setContext(s),lt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return g.getDepthTexture()};function q(oe){for(let fe=0;fe<oe.removed.length;fe++){let Se=oe.removed[fe],$e=R.indexOf(Se);$e>=0&&(R[$e]=null,P[$e].disconnect(Se))}for(let fe=0;fe<oe.added.length;fe++){let Se=oe.added[fe],$e=R.indexOf(Se);if($e===-1){for(let et=0;et<P.length;et++)if(et>=R.length){R.push(Se),$e=et;break}else if(R[et]===null){R[et]=Se,$e=et;break}if($e===-1)break}let Fe=P[$e];Fe&&Fe.connect(Se)}}let ne=new N,de=new N;function xe(oe,fe,Se){ne.setFromMatrixPosition(fe.matrixWorld),de.setFromMatrixPosition(Se.matrixWorld);let $e=ne.distanceTo(de),Fe=fe.projectionMatrix.elements,et=Se.projectionMatrix.elements,Ze=Fe[14]/(Fe[10]-1),rt=Fe[14]/(Fe[10]+1),gt=(Fe[9]+1)/Fe[5],at=(Fe[9]-1)/Fe[5],ot=(Fe[8]-1)/Fe[0],zt=(et[8]+1)/et[0],nn=Ze*ot,xn=Ze*zt,Ft=$e/(-ot+zt),Xt=Ft*-ot;if(fe.matrixWorld.decompose(oe.position,oe.quaternion,oe.scale),oe.translateX(Xt),oe.translateZ(Ft),oe.matrixWorld.compose(oe.position,oe.quaternion,oe.scale),oe.matrixWorldInverse.copy(oe.matrixWorld).invert(),Fe[10]===-1)oe.projectionMatrix.copy(fe.projectionMatrix),oe.projectionMatrixInverse.copy(fe.projectionMatrixInverse);else{let O=Ze+Ft,sn=rt+Ft,pt=nn-Xt,L=xn+($e-Xt),y=gt*rt/sn*O,W=at*rt/sn*O;oe.projectionMatrix.makePerspective(pt,L,y,W,O,sn),oe.projectionMatrixInverse.copy(oe.projectionMatrix).invert()}}function Ye(oe,fe){fe===null?oe.matrixWorld.copy(oe.matrix):oe.matrixWorld.multiplyMatrices(fe.matrixWorld,oe.matrix),oe.matrixWorldInverse.copy(oe.matrixWorld).invert()}this.updateCamera=function(oe){if(s===null)return;let fe=oe.near,Se=oe.far;g.texture!==null&&(g.depthNear>0&&(fe=g.depthNear),g.depthFar>0&&(Se=g.depthFar)),J.near=V.near=F.near=fe,J.far=V.far=F.far=Se,(z!==J.near||j!==J.far)&&(s.updateRenderState({depthNear:J.near,depthFar:J.far}),z=J.near,j=J.far),J.layers.mask=oe.layers.mask|6,F.layers.mask=J.layers.mask&-5,V.layers.mask=J.layers.mask&-3;let $e=oe.parent,Fe=J.cameras;Ye(J,$e);for(let et=0;et<Fe.length;et++)Ye(Fe[et],$e);Fe.length===2?xe(J,F,V):J.projectionMatrix.copy(F.projectionMatrix),I===null&&oe.isPerspectiveCamera&&(I={camera:oe,fov:oe.fov,zoom:oe.zoom}),Ge(oe,J,$e)};function Ge(oe,fe,Se){Se===null?oe.matrix.copy(fe.matrixWorld):(oe.matrix.copy(Se.matrixWorld),oe.matrix.invert(),oe.matrix.multiply(fe.matrixWorld)),oe.matrix.decompose(oe.position,oe.quaternion,oe.scale),oe.updateMatrixWorld(!0),oe.projectionMatrix.copy(fe.projectionMatrix),oe.projectionMatrixInverse.copy(fe.projectionMatrixInverse),oe.isPerspectiveCamera&&(oe.fov=wo*2*Math.atan(1/oe.projectionMatrix.elements[5]),oe.zoom=1)}this.getCamera=function(){return J},this.getFoveation=function(){if(!(u===null&&f===null))return l},this.setFoveation=function(oe){l=oe,u!==null&&(u.fixedFoveation=oe),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=oe)},this.hasDepthSensing=function(){return g.texture!==null},this.getDepthSensingMesh=function(){return g.getMesh(J)},this.getCameraTexture=function(oe){return p[oe]};let bt=null;function dt(oe,fe){if(d=fe.getViewerPose(c||a),x=fe,d!==null){let Se=d.views;f!==null&&(e.setRenderTargetFramebuffer(T,f.framebuffer),e.setRenderTarget(T));let $e=!1;Se.length!==J.cameras.length&&(J.cameras.length=0,$e=!0);for(let rt=0;rt<Se.length;rt++){let gt=Se[rt],at=null;if(f!==null)at=f.getViewport(gt);else{let zt=m.getViewSubImage(u,gt);at=zt.viewport,rt===0&&(e.setRenderTargetTextures(T,zt.colorTexture,zt.depthStencilTexture),e.setRenderTarget(T))}let ot=G[rt];ot===void 0&&(ot=new Cn,ot.layers.enable(rt),ot.viewport=new Yt,G[rt]=ot),ot.matrix.fromArray(gt.transform.matrix),ot.matrix.decompose(ot.position,ot.quaternion,ot.scale),ot.projectionMatrix.fromArray(gt.projectionMatrix),ot.projectionMatrixInverse.copy(ot.projectionMatrix).invert(),ot.viewport.set(at.x,at.y,at.width,at.height),rt===0&&(J.matrix.copy(ot.matrix),J.matrix.decompose(J.position,J.quaternion,J.scale)),$e===!0&&J.cameras.push(ot)}let Fe=s.enabledFeatures;if(Fe&&Fe.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&b){m=n.getBinding();let rt=m.getDepthInformation(Se[0]);rt&&rt.isValid&&rt.texture&&g.init(rt,s.renderState)}if(Fe&&Fe.includes("camera-access")&&b){e.state.unbindTexture(),m=n.getBinding();for(let rt=0;rt<Se.length;rt++){let gt=Se[rt].camera;if(gt){let at=p[gt];at||(at=new $r,p[gt]=at);let ot=m.getCameraImage(gt);at.sourceTexture=ot}}}}for(let Se=0;Se<P.length;Se++){let $e=R[Se],Fe=P[Se];$e!==null&&Fe!==void 0&&Fe.update($e,fe,c||a)}bt&&bt(oe,fe),fe.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:fe}),x=null}let lt=new qd;lt.setAnimationLoop(dt),this.setAnimationLoop=function(oe){bt=oe},this.dispose=function(){}}},px=new Ut,jd=new st;jd.set(-1,0,0,0,1,0,0,0,1);function mx(i,e){function t(g,p){g.matrixAutoUpdate===!0&&g.updateMatrix(),p.value.copy(g.matrix)}function n(g,p){p.color.getRGB(g.fogColor.value,mh(i)),p.isFog?(g.fogNear.value=p.near,g.fogFar.value=p.far):p.isFogExp2&&(g.fogDensity.value=p.density)}function s(g,p,A,D,T){p.isNodeMaterial?p.uniformsNeedUpdate=!1:p.isMeshBasicMaterial?r(g,p):p.isMeshLambertMaterial?(r(g,p),p.envMap&&(g.envMapIntensity.value=p.envMapIntensity)):p.isMeshToonMaterial?(r(g,p),m(g,p)):p.isMeshPhongMaterial?(r(g,p),d(g,p),p.envMap&&(g.envMapIntensity.value=p.envMapIntensity)):p.isMeshStandardMaterial?(r(g,p),u(g,p),p.isMeshPhysicalMaterial&&f(g,p,T)):p.isMeshMatcapMaterial?(r(g,p),x(g,p)):p.isMeshDepthMaterial?r(g,p):p.isMeshDistanceMaterial?(r(g,p),b(g,p)):p.isMeshNormalMaterial?r(g,p):p.isLineBasicMaterial?(a(g,p),p.isLineDashedMaterial&&o(g,p)):p.isPointsMaterial?l(g,p,A,D):p.isSpriteMaterial?c(g,p):p.isShadowMaterial?(g.color.value.copy(p.color),g.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(g,p){g.opacity.value=p.opacity,p.color&&g.diffuse.value.copy(p.color),p.emissive&&g.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(g.map.value=p.map,t(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,t(p.alphaMap,g.alphaMapTransform)),p.bumpMap&&(g.bumpMap.value=p.bumpMap,t(p.bumpMap,g.bumpMapTransform),g.bumpScale.value=p.bumpScale,p.side===_n&&(g.bumpScale.value*=-1)),p.normalMap&&(g.normalMap.value=p.normalMap,t(p.normalMap,g.normalMapTransform),g.normalScale.value.copy(p.normalScale),p.side===_n&&g.normalScale.value.negate()),p.displacementMap&&(g.displacementMap.value=p.displacementMap,t(p.displacementMap,g.displacementMapTransform),g.displacementScale.value=p.displacementScale,g.displacementBias.value=p.displacementBias),p.emissiveMap&&(g.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,g.emissiveMapTransform)),p.specularMap&&(g.specularMap.value=p.specularMap,t(p.specularMap,g.specularMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest);let A=e.get(p),D=A.envMap,T=A.envMapRotation;D&&(g.envMap.value=D,g.envMapRotation.value.setFromMatrix4(px.makeRotationFromEuler(T)).transpose(),D.isCubeTexture&&D.isRenderTargetTexture===!1&&g.envMapRotation.value.premultiply(jd),g.reflectivity.value=p.reflectivity,g.ior.value=p.ior,g.refractionRatio.value=p.refractionRatio),p.lightMap&&(g.lightMap.value=p.lightMap,g.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,g.lightMapTransform)),p.aoMap&&(g.aoMap.value=p.aoMap,g.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,g.aoMapTransform))}function a(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,p.map&&(g.map.value=p.map,t(p.map,g.mapTransform))}function o(g,p){g.dashSize.value=p.dashSize,g.totalSize.value=p.dashSize+p.gapSize,g.scale.value=p.scale}function l(g,p,A,D){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.size.value=p.size*A,g.scale.value=D*.5,p.map&&(g.map.value=p.map,t(p.map,g.uvTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,t(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}function c(g,p){g.diffuse.value.copy(p.color),g.opacity.value=p.opacity,g.rotation.value=p.rotation,p.map&&(g.map.value=p.map,t(p.map,g.mapTransform)),p.alphaMap&&(g.alphaMap.value=p.alphaMap,t(p.alphaMap,g.alphaMapTransform)),p.alphaTest>0&&(g.alphaTest.value=p.alphaTest)}function d(g,p){g.specular.value.copy(p.specular),g.shininess.value=Math.max(p.shininess,1e-4)}function m(g,p){p.gradientMap&&(g.gradientMap.value=p.gradientMap)}function u(g,p){g.metalness.value=p.metalness,p.metalnessMap&&(g.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,g.metalnessMapTransform)),g.roughness.value=p.roughness,p.roughnessMap&&(g.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,g.roughnessMapTransform)),p.envMap&&(g.envMapIntensity.value=p.envMapIntensity)}function f(g,p,A){g.ior.value=p.ior,p.sheen>0&&(g.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),g.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(g.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,g.sheenColorMapTransform)),p.sheenRoughnessMap&&(g.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,g.sheenRoughnessMapTransform))),p.clearcoat>0&&(g.clearcoat.value=p.clearcoat,g.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(g.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,g.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(g.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,g.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(g.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,g.clearcoatNormalMapTransform),g.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===_n&&g.clearcoatNormalScale.value.negate())),p.dispersion>0&&(g.dispersion.value=p.dispersion),p.retroreflectivity>0&&(g.retroreflectivity.value=p.retroreflectivity),p.iridescence>0&&(g.iridescence.value=p.iridescence,g.iridescenceIOR.value=p.iridescenceIOR,g.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],g.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(g.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,g.iridescenceMapTransform)),p.iridescenceThicknessMap&&(g.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,g.iridescenceThicknessMapTransform))),p.transmission>0&&(g.transmission.value=p.transmission,g.transmissionSamplerMap.value=A.texture,g.transmissionSamplerSize.value.set(A.width,A.height),p.transmissionMap&&(g.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,g.transmissionMapTransform)),g.thickness.value=p.thickness,p.thicknessMap&&(g.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,g.thicknessMapTransform)),g.attenuationDistance.value=p.attenuationDistance,g.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(g.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(g.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,g.anisotropyMapTransform))),g.specularIntensity.value=p.specularIntensity,g.specularColor.value.copy(p.specularColor),p.specularColorMap&&(g.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,g.specularColorMapTransform)),p.specularIntensityMap&&(g.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,g.specularIntensityMapTransform))}function x(g,p){p.matcap&&(g.matcap.value=p.matcap)}function b(g,p){let A=e.get(p).light;g.referencePosition.value.setFromMatrixPosition(A.matrixWorld),g.nearDistance.value=A.shadow.camera.near,g.farDistance.value=A.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function gx(i,e,t,n){let s={},r={},a=[],o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(T,P){let R=P.program;n.uniformBlockBinding(T,R)}function c(T,P){let R=s[T.id];R===void 0&&(g(T),R=d(T),s[T.id]=R,T.addEventListener("dispose",A));let U=P.program;n.updateUBOMapping(T,U);let _=e.render.frame;r[T.id]!==_&&(u(T),r[T.id]=_)}function d(T){let P=m();T.__bindingPointIndex=P;let R=i.createBuffer(),U=T.__size,_=T.usage;return i.bindBuffer(i.UNIFORM_BUFFER,R),i.bufferData(i.UNIFORM_BUFFER,U,_),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,P,R),R}function m(){for(let T=0;T<o;T++)if(a.indexOf(T)===-1)return a.push(T),T;return Qe("WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function u(T){let P=s[T.id],R=T.uniforms,U=T.__cache;i.bindBuffer(i.UNIFORM_BUFFER,P);for(let _=0,I=R.length;_<I;_++){let F=R[_];if(Array.isArray(F))for(let V=0,G=F.length;V<G;V++)f(F[V],_,V,U);else f(F,_,0,U)}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(T,P,R,U){if(b(T,P,R,U)===!0){let _=T.__offset,I=T.value;if(Array.isArray(I)){let F=0;for(let V=0;V<I.length;V++){let G=I[V],J=p(G);x(G,T.__data,F),typeof G!="number"&&typeof G!="boolean"&&!G.isMatrix3&&!ArrayBuffer.isView(G)&&(F+=J.storage/Float32Array.BYTES_PER_ELEMENT)}}else x(I,T.__data,0);i.bufferSubData(i.UNIFORM_BUFFER,_,T.__data)}}function x(T,P,R){typeof T=="number"||typeof T=="boolean"?P[0]=T:T.isMatrix3?(P[0]=T.elements[0],P[1]=T.elements[1],P[2]=T.elements[2],P[3]=0,P[4]=T.elements[3],P[5]=T.elements[4],P[6]=T.elements[5],P[7]=0,P[8]=T.elements[6],P[9]=T.elements[7],P[10]=T.elements[8],P[11]=0):ArrayBuffer.isView(T)?P.set(new T.constructor(T.buffer,T.byteOffset,P.length)):T.toArray(P,R)}function b(T,P,R,U){let _=T.value,I=P+"_"+R;if(U[I]===void 0)return typeof _=="number"||typeof _=="boolean"?U[I]=_:ArrayBuffer.isView(_)?U[I]=_.slice():U[I]=_.clone(),!0;{let F=U[I];if(typeof _=="number"||typeof _=="boolean"){if(F!==_)return U[I]=_,!0}else{if(ArrayBuffer.isView(_))return!0;if(F.equals(_)===!1)return F.copy(_),!0}}return!1}function g(T){let P=T.uniforms,R=0,U=16;for(let I=0,F=P.length;I<F;I++){let V=Array.isArray(P[I])?P[I]:[P[I]];for(let G=0,J=V.length;G<J;G++){let z=V[G],j=Array.isArray(z.value)?z.value:[z.value];for(let ae=0,se=j.length;ae<se;ae++){let q=j[ae],ne=p(q),de=R%U,xe=de%ne.boundary,Ye=de+xe;R+=xe,Ye!==0&&U-Ye<ne.storage&&(R+=U-Ye),z.__data=new Float32Array(ne.storage/Float32Array.BYTES_PER_ELEMENT),z.__offset=R,R+=ne.storage}}}let _=R%U;return _>0&&(R+=U-_),T.__size=R,T.__cache={},this}function p(T){let P={boundary:0,storage:0};return typeof T=="number"||typeof T=="boolean"?(P.boundary=4,P.storage=4):T.isVector2?(P.boundary=8,P.storage=8):T.isVector3||T.isColor?(P.boundary=16,P.storage=12):T.isVector4?(P.boundary=16,P.storage=16):T.isMatrix3?(P.boundary=48,P.storage=48):T.isMatrix4?(P.boundary=64,P.storage=64):T.isTexture?je("WebGLRenderer: Texture samplers can not be part of an uniforms group."):ArrayBuffer.isView(T)?(P.boundary=16,P.storage=T.byteLength):je("WebGLRenderer: Unsupported uniform value type.",T),P}function A(T){let P=T.target;P.removeEventListener("dispose",A);let R=a.indexOf(P.__bindingPointIndex);a.splice(R,1),i.deleteBuffer(s[P.id]),delete s[P.id],delete r[P.id]}function D(){for(let T in s)i.deleteBuffer(s[T]);a=[],s={},r={}}return{bind:l,update:c,dispose:D}}var _x=new Uint16Array([12469,15057,12620,14925,13266,14620,13807,14376,14323,13990,14545,13625,14713,13328,14840,12882,14931,12528,14996,12233,15039,11829,15066,11525,15080,11295,15085,10976,15082,10705,15073,10495,13880,14564,13898,14542,13977,14430,14158,14124,14393,13732,14556,13410,14702,12996,14814,12596,14891,12291,14937,11834,14957,11489,14958,11194,14943,10803,14921,10506,14893,10278,14858,9960,14484,14039,14487,14025,14499,13941,14524,13740,14574,13468,14654,13106,14743,12678,14818,12344,14867,11893,14889,11509,14893,11180,14881,10751,14852,10428,14812,10128,14765,9754,14712,9466,14764,13480,14764,13475,14766,13440,14766,13347,14769,13070,14786,12713,14816,12387,14844,11957,14860,11549,14868,11215,14855,10751,14825,10403,14782,10044,14729,9651,14666,9352,14599,9029,14967,12835,14966,12831,14963,12804,14954,12723,14936,12564,14917,12347,14900,11958,14886,11569,14878,11247,14859,10765,14828,10401,14784,10011,14727,9600,14660,9289,14586,8893,14508,8533,15111,12234,15110,12234,15104,12216,15092,12156,15067,12010,15028,11776,14981,11500,14942,11205,14902,10752,14861,10393,14812,9991,14752,9570,14682,9252,14603,8808,14519,8445,14431,8145,15209,11449,15208,11451,15202,11451,15190,11438,15163,11384,15117,11274,15055,10979,14994,10648,14932,10343,14871,9936,14803,9532,14729,9218,14645,8742,14556,8381,14461,8020,14365,7603,15273,10603,15272,10607,15267,10619,15256,10631,15231,10614,15182,10535,15118,10389,15042,10167,14963,9787,14883,9447,14800,9115,14710,8665,14615,8318,14514,7911,14411,7507,14279,7198,15314,9675,15313,9683,15309,9712,15298,9759,15277,9797,15229,9773,15166,9668,15084,9487,14995,9274,14898,8910,14800,8539,14697,8234,14590,7790,14479,7409,14367,7067,14178,6621,15337,8619,15337,8631,15333,8677,15325,8769,15305,8871,15264,8940,15202,8909,15119,8775,15022,8565,14916,8328,14804,8009,14688,7614,14569,7287,14448,6888,14321,6483,14088,6171,15350,7402,15350,7419,15347,7480,15340,7613,15322,7804,15287,7973,15229,8057,15148,8012,15046,7846,14933,7611,14810,7357,14682,7069,14552,6656,14421,6316,14251,5948,14007,5528,15356,5942,15356,5977,15353,6119,15348,6294,15332,6551,15302,6824,15249,7044,15171,7122,15070,7050,14949,6861,14818,6611,14679,6349,14538,6067,14398,5651,14189,5311,13935,4958,15359,4123,15359,4153,15356,4296,15353,4646,15338,5160,15311,5508,15263,5829,15188,6042,15088,6094,14966,6001,14826,5796,14678,5543,14527,5287,14377,4985,14133,4586,13869,4257,15360,1563,15360,1642,15358,2076,15354,2636,15341,3350,15317,4019,15273,4429,15203,4732,15105,4911,14981,4932,14836,4818,14679,4621,14517,4386,14359,4156,14083,3795,13808,3437,15360,122,15360,137,15358,285,15355,636,15344,1274,15322,2177,15281,2765,15215,3223,15120,3451,14995,3569,14846,3567,14681,3466,14511,3305,14344,3121,14037,2800,13753,2467,15360,0,15360,1,15359,21,15355,89,15346,253,15325,479,15287,796,15225,1148,15133,1492,15008,1749,14856,1882,14685,1886,14506,1783,14324,1608,13996,1398,13702,1183]),wi=null;function xx(){return wi===null&&(wi=new Ro(_x,16,16,ms,pi),wi.name="DFG_LUT",wi.minFilter=wn,wi.magFilter=wn,wi.wrapS=xi,wi.wrapT=xi,wi.generateMipmaps=!1,wi.needsUpdate=!0),wi}var $l=class{constructor(e={}){let{canvas:t=gd(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:d="default",failIfMajorPerformanceCaveat:m=!1,reversedDepthBuffer:u=!1,outputBufferType:f=kn}=e;this.isWebGLRenderer=!0;let x;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");x=n.getContextAttributes().alpha}else x=a;let b=f,g=new Set([ul,hl,cl]),p=new Set([kn,di,gr,_r,ol,ll]),A=new Uint32Array(4),D=new Int32Array(4),T=new N,P=null,R=null,U=[],_=[],I=null;this.domElement=t,this.debug={checkShaderErrors:!0,diagnostics:{keywords:!1},onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=ui,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let F=this,V=!1,G=null,J=null,z=null,j=null;this._outputColorSpace=hn;let ae=0,se=0,q=null,ne=-1,de=null,xe=new Yt,Ye=new Yt,Ge=null,bt=new Je(0),dt=0,lt=t.width,oe=t.height,fe=1,Se=null,$e=null,Fe=new Yt(0,0,lt,oe),et=new Yt(0,0,lt,oe),Ze=!1,rt=new cr,gt=!1,at=!1,ot=new Ut,zt=new N,nn=new Yt,xn={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Ft=!1;function Xt(){return q===null?fe:1}let O=n;function sn(S,B){return t.getContext(S,B)}let pt,L,y,W,Z,re,ve,we,le,he,Ee,Be,Te,Ae,He,qe,tt,k,be,ce,Ce,Le,_e;try{let S={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:d,failIfMajorPerformanceCaveat:m};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${"186"}`),t.addEventListener("webglcontextlost",Lt,!1),t.addEventListener("webglcontextrestored",Et,!1),t.addEventListener("webglcontextcreationerror",vn,!1),O===null){let B="webgl2";if(O=sn(B,S),O===null)throw sn(B)?new Error("THREE.WebGLRenderer: Error creating WebGL context with your selected attributes."):new Error("THREE.WebGLRenderer: Error creating WebGL context.")}We()}catch(S){throw t.removeEventListener("webglcontextlost",Lt,!1),t.removeEventListener("webglcontextrestored",Et,!1),t.removeEventListener("webglcontextcreationerror",vn,!1),Qe("WebGLRenderer: "+S.message),S}function We(){pt=new Tg(O),pt.init(),Ce=new ux(O,pt),L=new mg(O,pt,e,Ce),y=new cx(O,pt),L.reversedDepthBuffer&&u&&y.buffers.depth.setReversed(!0),J=O.createFramebuffer(),z=O.createFramebuffer(),j=O.createFramebuffer(),W=new Cg(O),Z=new $_,re=new hx(O,pt,y,Z,L,Ce,W),ve=new wg(F),we=new Pp(O),Le=new fg(O,we),le=new Ag(O,we,W,Le),he=new Pg(O,le,we,Le,W),k=new Rg(O,L,re),He=new gg(Z),Ee=new Z_(F,ve,pt,L,Le,He),Be=new mx(F,Z),Te=new K_,Ae=new ix(pt),tt=new dg(F,ve,y,he,x,l),qe=new lx(F,he,L),_e=new gx(O,W,L,y),be=new pg(O,pt,W),ce=new Eg(O,pt,W),W.programs=Ee.programs,F.capabilities=L,F.extensions=pt,F.properties=Z,F.renderLists=Te,F.shadowMap=qe,F.state=y,F.info=W}b!==kn&&(I=new Lg(b,t.width,t.height,o,s,r));let Ve=new Bh(F,O);this.xr=Ve,this.getContext=function(){return O},this.getContextAttributes=function(){return O.getContextAttributes()},this.forceContextLoss=function(){let S=pt.get("WEBGL_lose_context");S&&S.loseContext()},this.forceContextRestore=function(){let S=pt.get("WEBGL_lose_context");S&&S.restoreContext()},this.getPixelRatio=function(){return fe},this.setPixelRatio=function(S){S!==void 0&&(fe=S,this.setSize(lt,oe,!1))},this.getSize=function(S){return S.set(lt,oe)},this.setSize=function(S,B,Q=!0){if(Ve.isPresenting){je("WebGLRenderer: Can't change size while VR device is presenting.");return}lt=S,oe=B,t.width=Math.floor(S*fe),t.height=Math.floor(B*fe),Q===!0&&(t.style.width=S+"px",t.style.height=B+"px"),I!==null&&I.setSize(t.width,t.height),this.setViewport(0,0,S,B)},this.getDrawingBufferSize=function(S){return S.set(lt*fe,oe*fe).floor()},this.setDrawingBufferSize=function(S,B,Q){lt=S,oe=B,fe=Q,t.width=Math.floor(S*Q),t.height=Math.floor(B*Q),this.setViewport(0,0,S,B)},this.setEffects=function(S){if(b===kn){Qe("WebGLRenderer: setEffects() requires outputBufferType set to HalfFloatType or FloatType.");return}if(S){for(let B=0;B<S.length;B++)if(S[B].isOutputPass===!0){je("WebGLRenderer: OutputPass is not needed in setEffects(). Tone mapping and color space conversion are applied automatically.");break}}I.setEffects(S||[])},this.getCurrentViewport=function(S){return S.copy(xe)},this.getViewport=function(S){return S.copy(Fe)},this.setViewport=function(S,B,Q,$){S.isVector4?Fe.set(S.x,S.y,S.z,S.w):Fe.set(S,B,Q,$),y.viewport(xe.copy(Fe).multiplyScalar(fe).round())},this.getScissor=function(S){return S.copy(et)},this.setScissor=function(S,B,Q,$){S.isVector4?et.set(S.x,S.y,S.z,S.w):et.set(S,B,Q,$),y.scissor(Ye.copy(et).multiplyScalar(fe).round())},this.getScissorTest=function(){return Ze},this.setScissorTest=function(S){y.setScissorTest(Ze=S)},this.setOpaqueSort=function(S){Se=S},this.setTransparentSort=function(S){$e=S},this.getClearColor=function(S){return S.copy(tt.getClearColor())},this.setClearColor=function(){tt.setClearColor(...arguments)},this.getClearAlpha=function(){return tt.getClearAlpha()},this.setClearAlpha=function(){tt.setClearAlpha(...arguments)},this.clear=function(S=!0,B=!0,Q=!0){let $=0;if(S){let X=!1;if(q!==null){let Pe=q.texture.format;X=g.has(Pe)}if(X){let Pe=q.texture.type,Ue=p.has(Pe),Re=tt.getClearColor(),K=tt.getClearAlpha(),ke=Re.r,nt=Re.g,ct=Re.b;Ue?(A[0]=ke,A[1]=nt,A[2]=ct,A[3]=K,O.clearBufferuiv(O.COLOR,0,A)):(D[0]=ke,D[1]=nt,D[2]=ct,D[3]=K,O.clearBufferiv(O.COLOR,0,D))}else $|=O.COLOR_BUFFER_BIT}B&&($|=O.DEPTH_BUFFER_BIT,this.state.buffers.depth.setMask(!0)),Q&&($|=O.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),$!==0&&O.clear($)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.setNodesHandler=function(S){S.setRenderer(this),G=S},this.dispose=function(){t.removeEventListener("webglcontextlost",Lt,!1),t.removeEventListener("webglcontextrestored",Et,!1),t.removeEventListener("webglcontextcreationerror",vn,!1),tt.dispose(),Te.dispose(),Ae.dispose(),Z.dispose(),ve.dispose(),he.dispose(),Le.dispose(),_e.dispose(),Ee.dispose(),Ve.dispose(),Ve.removeEventListener("sessionstart",Sr),Ve.removeEventListener("sessionend",Aa),Ai.stop()};function Lt(S){S.preventDefault(),Gr("WebGLRenderer: Context Lost."),V=!0}function Et(){Gr("WebGLRenderer: Context Restored."),V=!1;let S=W.autoReset,B=qe.enabled,Q=qe.autoUpdate,$=qe.needsUpdate,X=qe.type;We(),W.autoReset=S,qe.enabled=B,qe.autoUpdate=Q,qe.needsUpdate=$,qe.type=X}function vn(S){Qe("WebGLRenderer: A WebGL context could not be created. Reason: ",S.statusMessage)}function Fn(S){let B=S.target;B.removeEventListener("dispose",Fn),Ds(B)}function Ds(S){ba(S),Z.remove(S)}function ba(S){let B=Z.get(S).programs;B!==void 0&&(B.forEach(function(Q){Ee.releaseProgram(Q)}),S.isShaderMaterial&&Ee.releaseShaderCache(S))}this.renderBufferDirect=function(S,B,Q,$,X,Pe){B===null&&(B=xn);let Ue=X.isMesh&&X.matrixWorld.determinantAffine()<0,Re=Ra(S,B,Q,$,X);y.setMaterial($,Ue);let K=Q.index,ke=1;if($.wireframe===!0){if(K=le.getWireframeAttribute(Q),K===void 0)return;ke=2}let nt=Q.drawRange,ct=Q.attributes.position,ze=nt.start*ke,ht=(nt.start+nt.count)*ke;Pe!==null&&(ze=Math.max(ze,Pe.start*ke),ht=Math.min(ht,(Pe.start+Pe.count)*ke)),K!==null?(ze=Math.max(ze,0),ht=Math.min(ht,K.count)):ct!=null&&(ze=Math.max(ze,0),ht=Math.min(ht,ct.count));let Vt=ht-ze;if(Vt<0||Vt===1/0)return;Le.setup(X,$,Re,Q,K);let Dt,Tt=be;if(K!==null&&(Dt=we.get(K),Tt=ce,Tt.setIndex(Dt)),X.isMesh)$.wireframe===!0?(y.setLineWidth($.wireframeLinewidth*Xt()),Tt.setMode(O.LINES)):Tt.setMode(O.TRIANGLES);else if(X.isLine){let ln=$.linewidth;ln===void 0&&(ln=1),y.setLineWidth(ln*Xt()),X.isLineSegments?Tt.setMode(O.LINES):X.isLineLoop?Tt.setMode(O.LINE_LOOP):Tt.setMode(O.LINE_STRIP)}else X.isPoints?Tt.setMode(O.POINTS):X.isSprite&&Tt.setMode(O.TRIANGLES);if(X.isBatchedMesh)if(pt.get("WEBGL_multi_draw"))Tt.renderMultiDraw(X._multiDrawStarts,X._multiDrawCounts,X._multiDrawCount);else{let ln=X._multiDrawStarts,Ne=X._multiDrawCounts,cn=X._multiDrawCount,_t=K?we.get(K).bytesPerElement:1,yn=Z.get($).currentProgram.getUniforms();for(let Hn=0;Hn<cn;Hn++)yn.setValue(O,"_gl_DrawID",Hn),Tt.render(ln[Hn]/_t,Ne[Hn])}else if(X.isInstancedMesh)Tt.renderInstances(ze,Vt,X.count);else if(Q.isInstancedBufferGeometry){let ln=Q._maxInstanceCount!==void 0?Q._maxInstanceCount:1/0,Ne=Math.min(Q.instanceCount,ln);Tt.renderInstances(ze,Vt,Ne)}else Tt.render(ze,Vt)};function wa(S,B,Q,$){G!==null&&S.isNodeMaterial&&G.setObject($,S),gt===!0&&He.setState(S,Q,!1),S.transparent===!0&&S.side===zn&&S.forceSinglePass===!1?(S.side=_n,S.needsUpdate=!0,Gn(S,B,$),S.side=hs,S.needsUpdate=!0,Gn(S,B,$),S.side=zn):Gn(S,B,$)}this.compile=function(S,B,Q=null){Q===null&&(Q=S),G!==null&&G.renderStart(S,B,Q),R=Ae.get(Q),R.init(B),_.push(R),Q.traverseVisible(function(X){X.isLight&&X.layers.test(B.layers)&&(R.pushLight(X),X.castShadow&&R.pushShadow(X))}),S!==Q&&S.traverseVisible(function(X){X.isLight&&X.layers.test(B.layers)&&(R.pushLight(X),X.castShadow&&R.pushShadow(X))}),R.setupLights(),G!==null&&G.updateLights(R.state.lightsArray),at=this.localClippingEnabled,gt=He.init(this.clippingPlanes,at),gt===!0&&He.setGlobalState(this.clippingPlanes,B),G!==null&&qe.render(R.state.shadowsArray,Q,B);let $=new Set;return S.traverse(function(X){if(!(X.isMesh||X.isPoints||X.isLine||X.isSprite))return;let Pe=X.material;if(Pe)if(Array.isArray(Pe))for(let Ue=0;Ue<Pe.length;Ue++){let Re=Pe[Ue];wa(Re,Q,B,X),$.add(Re)}else wa(Pe,Q,B,X),$.add(Pe)}),R=_.pop(),G!==null&&G.renderEnd(),$},this.compileAsync=function(S,B,Q=null){let $=this.compile(S,B,Q);return new Promise(X=>{function Pe(){if($.forEach(function(Ue){let K=Z.get(Ue).currentProgram;(K===void 0||K.isReady())&&$.delete(Ue)}),$.size===0){X(S);return}setTimeout(Pe,10)}pt.get("KHR_parallel_shader_compile")!==null?Pe():setTimeout(Pe,10)})};let De=null;function Ta(S){De&&De(S)}function Sr(){Ai.stop()}function Aa(){Ai.start()}let Ai=new qd;Ai.setAnimationLoop(Ta),typeof self<"u"&&Ai.setContext(self),this.setAnimationLoop=function(S){De=S,Ve.setAnimationLoop(S),S===null?Ai.stop():Ai.start()},Ve.addEventListener("sessionstart",Sr),Ve.addEventListener("sessionend",Aa),this.render=function(S,B){if(B!==void 0&&B.isCamera!==!0){Qe("WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(V===!0)return;G!==null&&G.renderStart(S,B);let Q=Ve.enabled===!0&&Ve.isPresenting===!0,$=I!==null&&(q===null||Q)&&I.begin(F,q);if(S.matrixWorldAutoUpdate===!0&&S.updateMatrixWorld(),B.parent===null&&B.matrixWorldAutoUpdate===!0&&B.updateMatrixWorld(),Ve.enabled===!0&&Ve.isPresenting===!0&&(I===null||I.isCompositing()===!1)&&(Ve.cameraAutoUpdate===!0&&Ve.updateCamera(B),B=Ve.getCamera()),S.isScene===!0&&S.onBeforeRender(F,S,B,q),R=Ae.get(S,_.length),R.init(B),R.state.textureUnits=re.getTextureUnits(),_.push(R),ot.multiplyMatrices(B.projectionMatrix,B.matrixWorldInverse),rt.setFromProjectionMatrix(ot,oi,B.reversedDepth),at=this.localClippingEnabled,gt=He.init(this.clippingPlanes,at),P=Te.get(S,U.length),P.init(),U.push(P),Ve.enabled===!0&&Ve.isPresenting===!0){let Ue=F.xr.getDepthSensingMesh();Ue!==null&&br(Ue,B,-1/0,F.sortObjects)}br(S,B,0,F.sortObjects),P.finish(),G!==null&&G.updateLights(R.state.lightsArray),F.sortObjects===!0&&P.sort(Se,$e),Ft=Ve.enabled===!1||Ve.isPresenting===!1||Ve.hasDepthSensing()===!1,Ft&&tt.addToRenderList(P,S),this.info.render.frame++,this.info.autoReset===!0&&this.info.reset(),gt===!0&&He.beginShadows();let X=R.state.shadowsArray;if(qe.render(X,S,B),gt===!0&&He.endShadows(),($&&I.hasRenderPass())===!1){let Ue=P.opaque,Re=P.transmissive;if(R.setupLights(),B.isArrayCamera){let K=B.cameras;if(Re.length>0)for(let ke=0,nt=K.length;ke<nt;ke++){let ct=K[ke];wr(Ue,Re,S,ct)}Ft&&tt.render(S);for(let ke=0,nt=K.length;ke<nt;ke++){let ct=K[ke];pe(P,S,ct,ct.viewport)}}else Re.length>0&&wr(Ue,Re,S,B),Ft&&tt.render(S),pe(P,S,B)}q!==null&&se===0&&(re.updateMultisampleRenderTarget(q),re.updateRenderTargetMipmap(q)),$&&I.end(F),S.isScene===!0&&S.onAfterRender(F,S,B),Le.resetDefaultState(),ne=-1,de=null,_.pop(),_.length>0?(R=_[_.length-1],re.setTextureUnits(R.state.textureUnits),gt===!0&&He.setGlobalState(F.clippingPlanes,R.state.camera)):R=null,U.pop(),U.length>0?P=U[U.length-1]:P=null,G!==null&&G.renderEnd()};function br(S,B,Q,$){if(S.visible===!1)return;if(S.layers.test(B.layers)){if(S.isGroup)Q=S.renderOrder;else if(S.isLOD)S.autoUpdate===!0&&S.update(B);else if(S.isLightProbeGrid)R.pushLightProbeGrid(S);else if(S.isLight)R.pushLight(S),S.castShadow&&R.pushShadow(S);else if(S.isSprite){if(!S.frustumCulled||S.intersectsFrustum(rt)){$&&nn.setFromMatrixPosition(S.matrixWorld).applyMatrix4(ot);let Ue=he.update(S),Re=S.material;Re.visible&&P.push(S,Ue,Re,Q,nn.z,null,B)}}else if((S.isMesh||S.isLine||S.isPoints)&&(!S.frustumCulled||S.intersectsFrustum(rt))){let Ue=he.update(S),Re=S.material;if($&&(S.boundingSphere!==void 0?(S.boundingSphere===null&&S.computeBoundingSphere(),nn.copy(S.boundingSphere.center)):(Ue.boundingSphere===null&&Ue.computeBoundingSphere(),nn.copy(Ue.boundingSphere.center)),nn.applyMatrix4(S.matrixWorld).applyMatrix4(ot)),Array.isArray(Re)){let K=Ue.groups;for(let ke=0,nt=K.length;ke<nt;ke++){let ct=K[ke],ze=Re[ct.materialIndex];ze&&ze.visible&&P.push(S,Ue,ze,Q,nn.z,ct,B)}}else Re.visible&&P.push(S,Ue,Re,Q,nn.z,null,B)}}let Pe=S.children;for(let Ue=0,Re=Pe.length;Ue<Re;Ue++)br(Pe[Ue],B,Q,$)}function pe(S,B,Q,$){let{opaque:X,transmissive:Pe,transparent:Ue}=S;R.setupLightsView(Q),gt===!0&&He.setGlobalState(F.clippingPlanes,Q),$&&y.viewport(xe.copy($)),X.length>0&&Hi(X,B,Q),Pe.length>0&&Hi(Pe,B,Q),Ue.length>0&&Hi(Ue,B,Q),y.buffers.depth.setTest(!0),y.buffers.depth.setMask(!0),y.buffers.color.setMask(!0),y.setPolygonOffset(!1)}function wr(S,B,Q,$){if((Q.isScene===!0?Q.overrideMaterial:null)!==null)return;if(R.state.transmissionRenderTarget[$.id]===void 0){let ze=pt.has("EXT_color_buffer_half_float")||pt.has("EXT_color_buffer_float");R.state.transmissionRenderTarget[$.id]=new Bn(1,1,{generateMipmaps:!0,type:ze?pi:kn,minFilter:fs,samples:Math.max(4,L.samples),stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,storeMultisampledDepthBuffer:!1,storeMultisampledStencilBuffer:!1,colorSpace:yt.workingColorSpace})}let Pe=R.state.transmissionRenderTarget[$.id],Ue=$.viewport||xe;Pe.setSize(Ue.z*F.transmissionResolutionScale,Ue.w*F.transmissionResolutionScale);let Re=F.getRenderTarget(),K=F.getActiveCubeFace(),ke=F.getActiveMipmapLevel();F.setRenderTarget(Pe),F.getClearColor(bt),dt=F.getClearAlpha(),dt<1&&F.setClearColor(16777215,.5),F.clear(),Ft&&tt.render(Q);let nt=F.toneMapping;F.toneMapping=ui;let ct=$.viewport;if($.viewport!==void 0&&($.viewport=void 0),R.setupLightsView($),gt===!0&&He.setGlobalState(F.clippingPlanes,$),Hi(S,Q,$),re.updateMultisampleRenderTarget(Pe),re.updateRenderTargetMipmap(Pe),pt.has("WEBGL_multisampled_render_to_texture")===!1){let ze=!1;for(let ht=0,Vt=B.length;ht<Vt;ht++){let Dt=B[ht],{object:Tt,geometry:ln,material:Ne,group:cn}=Dt;if(Ne.side===zn&&Tt.layers.test($.layers)){let _t=Ne.side;Ne.side=_n,Ne.needsUpdate=!0,Ea(Tt,Q,$,ln,Ne,cn),Ne.side=_t,Ne.needsUpdate=!0,ze=!0}}ze===!0&&(re.updateMultisampleRenderTarget(Pe),re.updateRenderTargetMipmap(Pe))}F.setRenderTarget(Re,K,ke),F.setClearColor(bt,dt),ct!==void 0&&($.viewport=ct),F.toneMapping=nt}function Hi(S,B,Q){let $=B.isScene===!0?B.overrideMaterial:null;for(let X=0,Pe=S.length;X<Pe;X++){let Ue=S[X],{object:Re,geometry:K,group:ke}=Ue,nt=Ue.material;nt.allowOverride===!0&&$!==null&&(nt=$),Re.layers.test(Q.layers)&&Ea(Re,B,Q,K,nt,ke)}}function Ea(S,B,Q,$,X,Pe){G!==null&&X.isNodeMaterial&&G.setObject(S,X),S.onBeforeRender(F,B,Q,$,X,Pe),S.modelViewMatrix.multiplyMatrices(Q.matrixWorldInverse,S.matrixWorld),S.normalMatrix.getNormalMatrix(S.modelViewMatrix),X.onBeforeRender(F,B,Q,$,S,Pe),X.transparent===!0&&X.side===zn&&X.forceSinglePass===!1?(X.side=_n,X.needsUpdate=!0,F.renderBufferDirect(Q,B,$,X,S,Pe),X.side=hs,X.needsUpdate=!0,F.renderBufferDirect(Q,B,$,X,S,Pe),X.side=zn):F.renderBufferDirect(Q,B,$,X,S,Pe),S.onAfterRender(F,B,Q,$,X,Pe)}function Gn(S,B,Q){B.isScene!==!0&&(B=xn);let $=Z.get(S),X=R.state.lights,Pe=R.state.shadowsArray,Ue=X.state.version,Re=Ee.getParameters(S,X.state,Pe,B,Q,R.state.lightProbeGridArray),K=Ee.getProgramCacheKey(Re),ke=$.programs;$.environment=S.isMeshStandardMaterial||S.isMeshLambertMaterial||S.isMeshPhongMaterial?B.environment:null,$.fog=B.fog;let nt=S.isMeshStandardMaterial||S.isMeshLambertMaterial&&!S.envMap||S.isMeshPhongMaterial&&!S.envMap;$.envMap=ve.get(S.envMap||$.environment,nt),$.envMapRotation=$.environment!==null&&S.envMap===null?B.environmentRotation:S.envMapRotation,ke===void 0&&(S.addEventListener("dispose",Fn),ke=new Map,$.programs=ke);let ct=ke.get(K);if(ct!==void 0){if($.currentProgram===ct&&$.lightsStateVersion===Ue)return Ca(S,Re),ct}else Re.uniforms=Ee.getUniforms(S),G!==null&&S.isNodeMaterial&&G.build(S,Q,Re),S.onBeforeCompile(Re,F),ct=Ee.acquireProgram(Re,K),ke.set(K,ct),$.uniforms=Re.uniforms;let ze=$.uniforms;return(!S.isShaderMaterial&&!S.isRawShaderMaterial||S.clipping===!0)&&(ze.clippingPlanes=He.uniform),Ca(S,Re),$.needsLights=ni(S),$.lightsStateVersion=Ue,$.needsLights&&(ze.ambientLightColor.value=X.state.ambient,ze.lightProbe.value=X.state.probe,ze.sunLights.value=X.state.sun,ze.sunLightShadows.value=X.state.sunShadow,ze.directionalLights.value=X.state.directional,ze.directionalLightShadows.value=X.state.directionalShadow,ze.spotLights.value=X.state.spot,ze.spotLightShadows.value=X.state.spotShadow,ze.rectAreaLights.value=X.state.rectArea,ze.ltc_1.value=X.state.rectAreaLTC1,ze.ltc_2.value=X.state.rectAreaLTC2,ze.pointLights.value=X.state.point,ze.pointLightShadows.value=X.state.pointShadow,ze.hemisphereLights.value=X.state.hemi,ze.sunShadowMatrix.value=X.state.sunShadowMatrix,ze.sunShadowCascade.value=X.state.sunShadowCascade,ze.directionalShadowMatrix.value=X.state.directionalShadowMatrix,ze.spotLightMatrix.value=X.state.spotLightMatrix,ze.spotLightMap.value=X.state.spotLightMap,ze.pointShadowMatrix.value=X.state.pointShadowMatrix),$.lightProbeGrid=R.state.lightProbeGridArray.length>0,$.currentProgram=ct,$.uniformsList=null,ct}function Tr(S){if(S.uniformsList===null){let B=S.currentProgram.getUniforms();S.uniformsList=yr.seqWithValue(B.seq,S.uniforms)}return S.uniformsList}function Ca(S,B){let Q=Z.get(S);Q.outputColorSpace=B.outputColorSpace,Q.batching=B.batching,Q.batchingColor=B.batchingColor,Q.instancing=B.instancing,Q.instancingColor=B.instancingColor,Q.instancingMorph=B.instancingMorph,Q.skinning=B.skinning,Q.morphTargets=B.morphTargets,Q.morphNormals=B.morphNormals,Q.morphColors=B.morphColors,Q.morphTargetsCount=B.morphTargetsCount,Q.numClippingPlanes=B.numClippingPlanes,Q.numIntersection=B.numClipIntersection,Q.vertexAlphas=B.vertexAlphas,Q.vertexTangents=B.vertexTangents,Q.toneMapping=B.toneMapping}function jl(S,B){if(S.length===0)return null;if(S.length===1)return S[0].texture!==null?S[0]:null;T.setFromMatrixPosition(B.matrixWorld);for(let Q=0,$=S.length;Q<$;Q++){let X=S[Q];if(X.texture!==null&&X.boundingBox.containsPoint(T))return X}return null}function Ra(S,B,Q,$,X){B.isScene!==!0&&(B=xn),re.resetTextureUnits();let Pe=B.fog,Ue=$.isMeshStandardMaterial||$.isMeshLambertMaterial||$.isMeshPhongMaterial?B.environment:null,Re=q===null?F.outputColorSpace:q.isXRRenderTarget===!0?q.texture.colorSpace:yt.workingColorSpace,K=$.isMeshStandardMaterial||$.isMeshLambertMaterial&&!$.envMap||$.isMeshPhongMaterial&&!$.envMap,ke=ve.get($.envMap||Ue,K),nt=$.vertexColors===!0&&!!Q.attributes.color&&Q.attributes.color.itemSize===4,ct=!!Q.attributes.tangent&&(!!$.normalMap||$.anisotropy>0),ze=!!Q.morphAttributes.position,ht=!!Q.morphAttributes.normal,Vt=!!Q.morphAttributes.color,Dt=ui;$.toneMapped&&(q===null||q.isXRRenderTarget===!0)&&(Dt=F.toneMapping);let Tt=Q.morphAttributes.position||Q.morphAttributes.normal||Q.morphAttributes.color,ln=Tt!==void 0?Tt.length:0,Ne=Z.get($),cn=R.state.lights;if(gt===!0&&(at===!0||S!==de)){let It=S===de&&$.id===ne;He.setState($,S,It)}let _t=!1;$.version===Ne.__version?(Ne.needsLights&&Ne.lightsStateVersion!==cn.state.version||Ne.outputColorSpace!==Re||X.isBatchedMesh&&Ne.batching===!1||!X.isBatchedMesh&&Ne.batching===!0||X.isBatchedMesh&&Ne.batchingColor===!0&&X._colorsTexture===null||X.isBatchedMesh&&Ne.batchingColor===!1&&X._colorsTexture!==null||X.isInstancedMesh&&Ne.instancing===!1||!X.isInstancedMesh&&Ne.instancing===!0||X.isSkinnedMesh&&Ne.skinning===!1||!X.isSkinnedMesh&&Ne.skinning===!0||X.isInstancedMesh&&Ne.instancingColor===!0&&X.instanceColor===null||X.isInstancedMesh&&Ne.instancingColor===!1&&X.instanceColor!==null||X.isInstancedMesh&&Ne.instancingMorph===!0&&X.morphTexture===null||X.isInstancedMesh&&Ne.instancingMorph===!1&&X.morphTexture!==null||Ne.envMap!==ke||$.fog===!0&&Ne.fog!==Pe||Ne.numClippingPlanes!==void 0&&(Ne.numClippingPlanes!==He.numPlanes||Ne.numIntersection!==He.numIntersection)||Ne.vertexAlphas!==nt||Ne.vertexTangents!==ct||Ne.morphTargets!==ze||Ne.morphNormals!==ht||Ne.morphColors!==Vt||Ne.toneMapping!==Dt||Ne.morphTargetsCount!==ln||!!Ne.lightProbeGrid!=R.state.lightProbeGridArray.length>0)&&(_t=!0):(_t=!0,Ne.__version=$.version);let yn=Ne.currentProgram;_t===!0&&(yn=Gn($,B,X),G&&$.isNodeMaterial&&G.onUpdateProgram($,yn,Ne));let Hn=!1,ge=!1,Ei=!1,Ct=yn.getUniforms(),qt=Ne.uniforms;if(y.useProgram(yn.program)&&(Hn=!0,ge=!0,Ei=!0),$.id!==ne&&(ne=$.id,ge=!0),Ne.needsLights){let It=jl(R.state.lightProbeGridArray,X);Ne.lightProbeGrid!==It&&(Ne.lightProbeGrid=It,ge=!0)}if(Hn||de!==S){y.buffers.depth.getReversed()&&S.reversedDepth!==!0&&(S._reversedDepth=!0,S.updateProjectionMatrix()),Ct.setValue(O,"projectionMatrix",S.projectionMatrix),Ct.setValue(O,"viewMatrix",S.matrixWorldInverse);let On=Ct.map.cameraPosition;On!==void 0&&On.setValue(O,zt.setFromMatrixPosition(S.matrixWorld)),L.logarithmicDepthBuffer&&Ct.setValue(O,"logDepthBufFC",2/(Math.log(S.far+1)/Math.LN2)),($.isMeshPhongMaterial||$.isMeshToonMaterial||$.isMeshLambertMaterial||$.isMeshBasicMaterial||$.isMeshStandardMaterial||$.isShaderMaterial)&&Ct.setValue(O,"isOrthographic",S.isOrthographicCamera===!0),de!==S&&(de=S,ge=!0,Ei=!0)}if(Ne.needsLights&&(cn.state.sunShadowMap.length>0&&Ct.setValue(O,"sunShadowMap",cn.state.sunShadowMap,re),cn.state.directionalShadowMap.length>0&&Ct.setValue(O,"directionalShadowMap",cn.state.directionalShadowMap,re),cn.state.spotShadowMap.length>0&&Ct.setValue(O,"spotShadowMap",cn.state.spotShadowMap,re),cn.state.pointShadowMap.length>0&&Ct.setValue(O,"pointShadowMap",cn.state.pointShadowMap,re)),X.isSkinnedMesh){Ct.setOptional(O,X,"bindMatrix"),Ct.setOptional(O,X,"bindMatrixInverse");let It=X.skeleton;It&&(It.boneTexture===null&&It.computeBoneTexture(),Ct.setValue(O,"boneTexture",It.boneTexture,re))}X.isBatchedMesh&&(Ct.setOptional(O,X,"batchingTexture"),Ct.setValue(O,"batchingTexture",X._matricesTexture,re),Ct.setOptional(O,X,"batchingIdTexture"),Ct.setValue(O,"batchingIdTexture",X._indirectTexture,re),Ct.setOptional(O,X,"batchingColorTexture"),X._colorsTexture!==null&&Ct.setValue(O,"batchingColorTexture",X._colorsTexture,re));let Mn=Q.morphAttributes;if((Mn.position!==void 0||Mn.normal!==void 0||Mn.color!==void 0)&&k.update(X,Q,yn),(ge||Ne.receiveShadow!==X.receiveShadow)&&(Ne.receiveShadow=X.receiveShadow,Ct.setValue(O,"receiveShadow",X.receiveShadow)),($.isMeshStandardMaterial||$.isMeshLambertMaterial||$.isMeshPhongMaterial)&&$.envMap===null&&B.environment!==null&&(qt.envMapIntensity.value=B.environmentIntensity),qt.dfgLUT!==void 0&&(qt.dfgLUT.value=xx()),ge){if(Ct.setValue(O,"toneMappingExposure",F.toneMappingExposure),Ne.needsLights&&Ns(qt,Ei),Pe&&$.fog===!0&&Be.refreshFogUniforms(qt,Pe),Be.refreshMaterialUniforms(qt,$,fe,oe,R.state.transmissionRenderTarget[S.id]),Ne.needsLights&&Ne.lightProbeGrid){let It=Ne.lightProbeGrid;qt.probesSH.value=It.texture,qt.probesMin.value.copy(It.boundingBox.min),qt.probesMax.value.copy(It.boundingBox.max),qt.probesResolution.value.copy(It.resolution)}yr.upload(O,Tr(Ne),qt,re)}if($.isShaderMaterial&&$.uniformsNeedUpdate===!0&&(yr.upload(O,Tr(Ne),qt,re),$.uniformsNeedUpdate=!1),$.isSpriteMaterial&&Ct.setValue(O,"center",X.center),Ct.setValue(O,"modelViewMatrix",X.modelViewMatrix),Ct.setValue(O,"normalMatrix",X.normalMatrix),Ct.setValue(O,"modelMatrix",X.matrixWorld),$.uniformsGroups!==void 0){let It=$.uniformsGroups;for(let On=0,Wi=It.length;On<Wi;On++){let Pa=It[On];_e.update(Pa,yn),_e.bind(Pa,yn)}}return yn}function Ns(S,B){S.ambientLightColor.needsUpdate=B,S.lightProbe.needsUpdate=B,S.sunLights.needsUpdate=B,S.sunLightShadows.needsUpdate=B,S.directionalLights.needsUpdate=B,S.directionalLightShadows.needsUpdate=B,S.pointLights.needsUpdate=B,S.pointLightShadows.needsUpdate=B,S.spotLights.needsUpdate=B,S.spotLightShadows.needsUpdate=B,S.rectAreaLights.needsUpdate=B,S.hemisphereLights.needsUpdate=B}function ni(S){return S.isMeshLambertMaterial||S.isMeshToonMaterial||S.isMeshPhongMaterial||S.isMeshStandardMaterial||S.isShadowMaterial||S.isShaderMaterial&&S.lights===!0}this.getActiveCubeFace=function(){return ae},this.getActiveMipmapLevel=function(){return se},this.getRenderTarget=function(){return q},this.setRenderTargetTextures=function(S,B,Q){let $=Z.get(S);$.__autoAllocateDepthBuffer=S.resolveDepthBuffer===!1,$.__autoAllocateDepthBuffer===!1&&($.__useRenderToTexture=!1),Z.get(S.texture).__webglTexture=B,Z.get(S.depthTexture).__webglTexture=$.__autoAllocateDepthBuffer?void 0:Q,$.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(S,B){let Q=Z.get(S);Q.__webglFramebuffer=B,Q.__useDefaultFramebuffer=B===void 0},this.setRenderTarget=function(S,B=0,Q=0){q=S,ae=B,se=Q;let $=null,X=!1,Pe=!1;if(S){let Re=Z.get(S);if(Re.__useDefaultFramebuffer!==void 0){y.bindFramebuffer(O.FRAMEBUFFER,Re.__webglFramebuffer),xe.copy(S.viewport),Ye.copy(S.scissor),Ge=S.scissorTest,y.viewport(xe),y.scissor(Ye),y.setScissorTest(Ge),ne=-1;return}else if(Re.__webglFramebuffer===void 0)re.setupRenderTarget(S);else if(Re.__hasExternalTextures)re.rebindTextures(S,Z.get(S.texture).__webglTexture,Z.get(S.depthTexture).__webglTexture);else if(S.depthBuffer){let nt=S.depthTexture;if(Re.__boundDepthTexture!==nt){if(nt!==null&&Z.has(nt)&&(S.width!==nt.image.width||S.height!==nt.image.height))throw new Error("THREE.WebGLRenderer: Attached DepthTexture is initialized to the incorrect size.");re.setupDepthRenderbuffer(S)}}let K=S.texture;(K.isData3DTexture||K.isDataArrayTexture||K.isCompressedArrayTexture)&&(Pe=!0);let ke=Z.get(S).__webglFramebuffer;S.isWebGLCubeRenderTarget?(Array.isArray(ke[B])?$=ke[B][Q]:$=ke[B],X=!0):S.samples>0&&re.useMultisampledRTT(S)===!1?$=Z.get(S).__webglMultisampledFramebuffer:Array.isArray(ke)?$=ke[Q]:$=ke,xe.copy(S.viewport),Ye.copy(S.scissor),Ge=S.scissorTest}else xe.copy(Fe).multiplyScalar(fe).floor(),Ye.copy(et).multiplyScalar(fe).floor(),Ge=Ze;if(Q!==0&&($=J),y.bindFramebuffer(O.FRAMEBUFFER,$)&&y.drawBuffers(S,$),y.viewport(xe),y.scissor(Ye),y.setScissorTest(Ge),X){let Re=Z.get(S.texture);O.framebufferTexture2D(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_CUBE_MAP_POSITIVE_X+B,Re.__webglTexture,Q)}else if(Pe){let Re=B;for(let K=0;K<S.textures.length;K++){let ke=Z.get(S.textures[K]);O.framebufferTextureLayer(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0+K,ke.__webglTexture,Q,Re)}}else if(S!==null&&Q!==0){let Re=Z.get(S.texture);O.framebufferTexture2D(O.FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,Re.__webglTexture,Q)}ne=-1};function gs(S){let B=Z.get(S);return(B.__readFormat!==S.format||B.__readType!==S.type)&&(B.__readFormat=S.format,B.__readType=S.type,B.__formatReadable=L.textureFormatReadable(S.format),B.__typeReadable=L.textureTypeReadable(S.type)),B}this.readRenderTargetPixels=function(S,B,Q,$,X,Pe,Ue,Re=0){if(!(S&&S.isWebGLRenderTarget)){Qe("WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let K=Z.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&Ue!==void 0&&(K=K[Ue]),K){y.bindFramebuffer(O.FRAMEBUFFER,K);try{let ke=S.textures[Re],nt=ke.format,ct=ke.type;S.textures.length>1&&O.readBuffer(O.COLOR_ATTACHMENT0+Re);let ze=gs(ke);if(ze.__formatReadable===!1){Qe("WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(ze.__typeReadable===!1){Qe("WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}B>=0&&B<=S.width-$&&Q>=0&&Q<=S.height-X&&O.readPixels(B,Q,$,X,Ce.convert(nt),Ce.convert(ct),Pe)}finally{let ke=q!==null?Z.get(q).__webglFramebuffer:null;y.bindFramebuffer(O.FRAMEBUFFER,ke)}}},this.readRenderTargetPixelsAsync=async function(S,B,Q,$,X,Pe,Ue,Re=0){if(!(S&&S.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let K=Z.get(S).__webglFramebuffer;if(S.isWebGLCubeRenderTarget&&Ue!==void 0&&(K=K[Ue]),K)if(B>=0&&B<=S.width-$&&Q>=0&&Q<=S.height-X){y.bindFramebuffer(O.FRAMEBUFFER,K);let ke=S.textures[Re],nt=ke.format,ct=ke.type;S.textures.length>1&&O.readBuffer(O.COLOR_ATTACHMENT0+Re);let ze=gs(ke);if(ze.__formatReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(ze.__typeReadable===!1)throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let ht=O.createBuffer();O.bindBuffer(O.PIXEL_PACK_BUFFER,ht),O.bufferData(O.PIXEL_PACK_BUFFER,Pe.byteLength,O.STREAM_READ),O.readPixels(B,Q,$,X,Ce.convert(nt),Ce.convert(ct),0),O.bindBuffer(O.PIXEL_PACK_BUFFER,null);let Vt=q!==null?Z.get(q).__webglFramebuffer:null;y.bindFramebuffer(O.FRAMEBUFFER,Vt);let Dt=O.fenceSync(O.SYNC_GPU_COMMANDS_COMPLETE,0);return O.flush(),await xd(O,Dt,4),O.bindBuffer(O.PIXEL_PACK_BUFFER,ht),O.getBufferSubData(O.PIXEL_PACK_BUFFER,0,Pe),O.bindBuffer(O.PIXEL_PACK_BUFFER,null),O.deleteBuffer(ht),O.deleteSync(Dt),Pe}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(S,B=null,Q=0){let $=Math.pow(2,-Q),X=Math.floor(S.image.width*$),Pe=Math.floor(S.image.height*$),Ue=B!==null?B.x:0,Re=B!==null?B.y:0;re.setTexture2D(S,0),O.copyTexSubImage2D(O.TEXTURE_2D,Q,0,0,Ue,Re,X,Pe),y.unbindTexture()},this.copyTextureToTexture=function(S,B,Q=null,$=null,X=0,Pe=0){let Ue,Re,K,ke,nt,ct,ze,ht,Vt,Dt=S.isCompressedTexture?S.mipmaps[Pe]:S.image;if(Q!==null)Ue=Q.max.x-Q.min.x,Re=Q.max.y-Q.min.y,K=Q.isBox3?Q.max.z-Q.min.z:1,ke=Q.min.x,nt=Q.min.y,ct=Q.isBox3?Q.min.z:0;else{let qt=Math.pow(2,-X);Ue=Math.floor(Dt.width*qt),Re=Math.floor(Dt.height*qt),S.isDataArrayTexture?K=Dt.depth:S.isData3DTexture?K=Math.floor(Dt.depth*qt):K=1,ke=0,nt=0,ct=0}$!==null?(ze=$.x,ht=$.y,Vt=$.z):(ze=0,ht=0,Vt=0);let Tt=Ce.convert(B.format),ln=Ce.convert(B.type),Ne;B.isData3DTexture?(re.setTexture3D(B,0),Ne=O.TEXTURE_3D):B.isDataArrayTexture||B.isCompressedArrayTexture?(re.setTexture2DArray(B,0),Ne=O.TEXTURE_2D_ARRAY):(re.setTexture2D(B,0),Ne=O.TEXTURE_2D),y.activeTexture(O.TEXTURE0),y.pixelStorei(O.UNPACK_FLIP_Y_WEBGL,B.flipY),y.pixelStorei(O.UNPACK_PREMULTIPLY_ALPHA_WEBGL,B.premultiplyAlpha),y.pixelStorei(O.UNPACK_ALIGNMENT,B.unpackAlignment);let cn=y.getParameter(O.UNPACK_ROW_LENGTH),_t=y.getParameter(O.UNPACK_IMAGE_HEIGHT),yn=y.getParameter(O.UNPACK_SKIP_PIXELS),Hn=y.getParameter(O.UNPACK_SKIP_ROWS),ge=y.getParameter(O.UNPACK_SKIP_IMAGES);y.pixelStorei(O.UNPACK_ROW_LENGTH,Dt.width),y.pixelStorei(O.UNPACK_IMAGE_HEIGHT,Dt.height),y.pixelStorei(O.UNPACK_SKIP_PIXELS,ke),y.pixelStorei(O.UNPACK_SKIP_ROWS,nt),y.pixelStorei(O.UNPACK_SKIP_IMAGES,ct);let Ei=S.isDataArrayTexture||S.isData3DTexture,Ct=B.isDataArrayTexture||B.isData3DTexture;if(S.isDepthTexture){let qt=Z.get(S),Mn=Z.get(B),It=Z.get(qt.__renderTarget),On=Z.get(Mn.__renderTarget);y.bindFramebuffer(O.READ_FRAMEBUFFER,It.__webglFramebuffer),y.bindFramebuffer(O.DRAW_FRAMEBUFFER,On.__webglFramebuffer);for(let Wi=0;Wi<K;Wi++)Ei&&(O.framebufferTextureLayer(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,Z.get(S).__webglTexture,X,ct+Wi),O.framebufferTextureLayer(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,Z.get(B).__webglTexture,Pe,Vt+Wi)),O.blitFramebuffer(ke,nt,Ue,Re,ze,ht,Ue,Re,O.DEPTH_BUFFER_BIT,O.NEAREST);y.bindFramebuffer(O.READ_FRAMEBUFFER,null),y.bindFramebuffer(O.DRAW_FRAMEBUFFER,null)}else if(X!==0||S.isRenderTargetTexture||Z.has(S)){let qt=Z.get(S),Mn=Z.get(B);y.bindFramebuffer(O.READ_FRAMEBUFFER,z),y.bindFramebuffer(O.DRAW_FRAMEBUFFER,j);for(let It=0;It<K;It++)Ei?O.framebufferTextureLayer(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,qt.__webglTexture,X,ct+It):O.framebufferTexture2D(O.READ_FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,qt.__webglTexture,X),Ct?O.framebufferTextureLayer(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,Mn.__webglTexture,Pe,Vt+It):O.framebufferTexture2D(O.DRAW_FRAMEBUFFER,O.COLOR_ATTACHMENT0,O.TEXTURE_2D,Mn.__webglTexture,Pe),X!==0?O.blitFramebuffer(ke,nt,Ue,Re,ze,ht,Ue,Re,O.COLOR_BUFFER_BIT,O.NEAREST):Ct?O.copyTexSubImage3D(Ne,Pe,ze,ht,Vt+It,ke,nt,Ue,Re):O.copyTexSubImage2D(Ne,Pe,ze,ht,ke,nt,Ue,Re);y.bindFramebuffer(O.READ_FRAMEBUFFER,null),y.bindFramebuffer(O.DRAW_FRAMEBUFFER,null)}else Ct?S.isDataTexture||S.isData3DTexture?O.texSubImage3D(Ne,Pe,ze,ht,Vt,Ue,Re,K,Tt,ln,Dt.data):B.isCompressedArrayTexture?O.compressedTexSubImage3D(Ne,Pe,ze,ht,Vt,Ue,Re,K,Tt,Dt.data):O.texSubImage3D(Ne,Pe,ze,ht,Vt,Ue,Re,K,Tt,ln,Dt):S.isDataTexture?O.texSubImage2D(O.TEXTURE_2D,Pe,ze,ht,Ue,Re,Tt,ln,Dt.data):S.isCompressedTexture?O.compressedTexSubImage2D(O.TEXTURE_2D,Pe,ze,ht,Dt.width,Dt.height,Tt,Dt.data):O.texSubImage2D(O.TEXTURE_2D,Pe,ze,ht,Ue,Re,Tt,ln,Dt);y.pixelStorei(O.UNPACK_ROW_LENGTH,cn),y.pixelStorei(O.UNPACK_IMAGE_HEIGHT,_t),y.pixelStorei(O.UNPACK_SKIP_PIXELS,yn),y.pixelStorei(O.UNPACK_SKIP_ROWS,Hn),y.pixelStorei(O.UNPACK_SKIP_IMAGES,ge),Pe===0&&B.generateMipmaps&&O.generateMipmap(Ne),y.unbindTexture()},this.initRenderTarget=function(S){Z.get(S).__webglFramebuffer===void 0&&re.setupRenderTarget(S)},this.initTexture=function(S){S.isCubeTexture?re.setTextureCube(S,0):S.isData3DTexture?re.setTexture3D(S,0):S.isDataArrayTexture||S.isCompressedArrayTexture?re.setTexture2DArray(S,0):re.setTexture2D(S,0),y.unbindTexture()},this.resetState=function(){ae=0,se=0,q=null,y.reset(),Le.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return oi}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;let t=this.getContext();t.drawingBufferColorSpace=yt._getDrawingBufferColorSpace(e),t.unpackColorSpace=yt._getUnpackColorSpace()}};var Wt='"Sora", "Manrope", system-ui, sans-serif',tn='"Manrope", system-ui, -apple-system, "Segoe UI", Roboto, sans-serif',Bt="#F4F6FA",jt="#A7B0C0",In="#5EEAD4",Ma="#FBBF24",vx={listening:"Listening",thinking:"Thinking"},zh=1;async function yx(){if(typeof FontFace>"u"||!document.fonts)return;let i=[new FontFace("Sora","url(../fonts/sora.woff2)",{weight:"300 800"}),new FontFace("Manrope","url(../fonts/manrope.woff2)",{weight:"400 700"})],e=Promise.all(i.map(async t=>{await t.load(),document.fonts.add(t)}));await Promise.race([e,new Promise(t=>setTimeout(t,2500))]).catch(()=>{})}var tf=`
float hash3(vec3 p) { p = fract(p * 0.3183099 + 0.1); p *= 17.0; return fract(p.x * p.y * p.z * (p.x + p.y + p.z)); }
float noise3(vec3 x) {
  vec3 i = floor(x); vec3 f = fract(x); f = f * f * (3.0 - 2.0 * f);
  return mix(mix(mix(hash3(i), hash3(i + vec3(1.0, 0.0, 0.0)), f.x), mix(hash3(i + vec3(0.0, 1.0, 0.0)), hash3(i + vec3(1.0, 1.0, 0.0)), f.x), f.y),
             mix(mix(hash3(i + vec3(0.0, 0.0, 1.0)), hash3(i + vec3(1.0, 0.0, 1.0)), f.x), mix(hash3(i + vec3(0.0, 1.0, 1.0)), hash3(i + vec3(1.0, 1.0, 1.0)), f.x), f.y), f.z);
}`,Mx=`
uniform float uTime; uniform float uEnergy;
varying vec3 vN; varying vec3 vV; varying vec3 vP;
${tf}
void main() {
  vec3 p = position;
  float d = noise3(p * 22.0 + vec3(0.0, uTime * 0.9, uTime * 0.6));
  p += normal * (d - 0.5) * (0.004 + uEnergy * 0.016);
  vP = p * 11.0;
  vec4 mv = modelViewMatrix * vec4(p, 1.0);
  vN = normalize(normalMatrix * normal);
  vV = normalize(-mv.xyz);
  gl_Position = projectionMatrix * mv;
}`,Sx=`
uniform float uTime; uniform float uEnergy; uniform float uThink;
uniform vec3 uA; uniform vec3 uB; uniform vec3 uC; uniform vec3 uGlow;
varying vec3 vN; varying vec3 vV; varying vec3 vP;
${tf}
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
}`;function Qt(i,e,t=2400){let n=document.createElement("canvas");n.width=Math.max(8,Math.round(i*t)),n.height=Math.max(8,Math.round(e*t));let s=n.getContext("2d"),r=new Es(n);r.colorSpace=hn,r.anisotropy=zh;let a=new en({map:r,transparent:!0,depthWrite:!1}),o=new vt(new ki(i,e),a);return{canvas:n,ctx:s,tex:r,mesh:o,w:n.width,h:n.height,update(){r.needsUpdate=!0}}}function Vn(i,e,t,n,s,r){r=Math.min(r,n/2,s/2),i.beginPath(),i.moveTo(e+r,t),i.arcTo(e+n,t,e+n,t+s,r),i.arcTo(e+n,t+s,e,t+s,r),i.arcTo(e,t+s,e,t,r),i.arcTo(e,t,e+n,t,r),i.closePath()}function Nn(i,e,t,n,s={}){i.clearRect(0,0,e,t);let r=3,a=r;Vn(i,a,a,e-a*2,t-a*2,n);let o=i.createLinearGradient(0,0,0,t);if(o.addColorStop(0,s.fill0||"rgba(24, 27, 36, 0.94)"),o.addColorStop(1,s.fill1||"rgba(13, 15, 21, 0.95)"),i.fillStyle=o,i.fill(),i.lineWidth=s.hot?r*1.6:r,i.strokeStyle=s.hot?"rgba(94, 234, 212, 0.9)":"rgba(255, 255, 255, 0.13)",i.stroke(),!s.hot){let l=i.createLinearGradient(a+n,0,e-a-n,0);l.addColorStop(0,"rgba(255,255,255,0)"),l.addColorStop(.5,"rgba(255,255,255,0.34)"),l.addColorStop(1,"rgba(255,255,255,0)"),i.fillStyle=l,i.fillRect(a+n,a-r/2,e-2*(a+n),r)}}function Mt(i,e,t,n,s,r,a=500,o="left",l=tn,c="0px"){i.font=`${a} ${s}px ${l}`,i.fillStyle=r,i.textAlign=o,i.textBaseline="alphabetic","letterSpacing"in i&&(i.letterSpacing=c),i.fillText(e,t,n),"letterSpacing"in i&&(i.letterSpacing="0px")}function Un(i,e,t){if(e=String(e||""),i.measureText(e).width<=t)return e;for(;e&&i.measureText(e+"\u2026").width>t;)e=e.slice(0,-1);return e+"\u2026"}function Qd(){let i=document.createElement("canvas");i.width=i.height=128;let e=i.getContext("2d"),t=e.createRadialGradient(64,64,0,64,64,64);t.addColorStop(0,"rgba(255,255,255,0.9)"),t.addColorStop(.35,"rgba(255,255,255,0.32)"),t.addColorStop(1,"rgba(255,255,255,0)"),e.fillStyle=t,e.fillRect(0,0,128,128);let n=new Es(i);return n.colorSpace=hn,n}var bx={mic(i){i.beginPath(),Vn(i,39,16,22,42,11),i.stroke(),i.beginPath(),i.arc(50,48,22,.12*Math.PI,.88*Math.PI),i.stroke(),i.beginPath(),i.moveTo(50,70),i.lineTo(50,84),i.stroke()},done(i){i.beginPath(),i.moveTo(27,52),i.lineTo(43,68),i.lineTo(74,35),i.stroke()},quiet(i){i.beginPath(),Vn(i,32,32,36,36,7),i.stroke()},end(i){i.beginPath(),i.moveTo(20,60),i.quadraticCurveTo(50,32,80,60),i.lineTo(72,69),i.lineTo(61,61),i.lineTo(61,53),i.quadraticCurveTo(50,48,39,53),i.lineTo(39,61),i.lineTo(28,69),i.closePath(),i.stroke()},eye(i){i.beginPath(),i.moveTo(14,50),i.quadraticCurveTo(50,16,86,50),i.quadraticCurveTo(50,84,14,50),i.stroke(),i.beginPath(),i.arc(50,50,11,0,Math.PI*2),i.stroke()},pc(i){i.beginPath(),Vn(i,16,22,68,44,6),i.stroke(),i.beginPath(),i.moveTo(36,82),i.lineTo(64,82),i.moveTo(50,66),i.lineTo(50,82),i.stroke()},pin(i){i.beginPath(),i.moveTo(50,86),i.lineTo(50,62),i.stroke(),i.beginPath(),i.moveTo(31,62),i.lineTo(69,62),i.lineTo(62,46),i.lineTo(62,20),i.lineTo(38,20),i.lineTo(38,46),i.closePath(),i.stroke()},leave(i){i.beginPath(),i.moveTo(32,32),i.lineTo(68,68),i.moveTo(68,32),i.lineTo(32,68),i.stroke()},think(i){for(let e=0;e<3;e++)i.beginPath(),i.arc(30+e*20,50,4.5,0,Math.PI*2),i.stroke()},photos(i){i.beginPath(),Vn(i,16,24,68,52,8),i.stroke(),i.beginPath(),i.moveTo(23,69),i.lineTo(42,49),i.lineTo(56,62),i.lineTo(65,54),i.lineTo(78,69),i.stroke(),i.beginPath(),i.arc(64,38,5,0,Math.PI*2),i.stroke()},style(i){let e=(t,n,s)=>{i.beginPath(),i.moveTo(t,n-s),i.quadraticCurveTo(t,n,t+s,n),i.quadraticCurveTo(t,n,t,n+s),i.quadraticCurveTo(t,n,t-s,n),i.quadraticCurveTo(t,n,t,n-s),i.stroke()};e(44,56,26),e(74,28,12)},folder(i){i.beginPath(),i.moveTo(14,30),i.lineTo(40,30),i.lineTo(48,38),i.lineTo(86,38),i.lineTo(86,78),i.lineTo(14,78),i.closePath(),i.stroke()},doc(i){i.beginPath(),i.moveTo(28,14),i.lineTo(60,14),i.lineTo(76,30),i.lineTo(76,86),i.lineTo(28,86),i.closePath(),i.stroke(),i.beginPath(),i.moveTo(38,50),i.lineTo(66,50),i.moveTo(38,62),i.lineTo(66,62),i.moveTo(38,74),i.lineTo(56,74),i.stroke()},close(i){i.beginPath(),i.moveTo(34,34),i.lineTo(66,66),i.moveTo(66,34),i.lineTo(34,66),i.stroke()},back(i){i.beginPath(),i.moveTo(58,30),i.lineTo(38,50),i.lineTo(58,70),i.stroke()},next(i){i.beginPath(),i.moveTo(42,30),i.lineTo(62,50),i.lineTo(42,70),i.stroke()},up(i){i.beginPath(),i.moveTo(30,56),i.lineTo(50,36),i.lineTo(70,56),i.moveTo(50,36),i.lineTo(50,74),i.stroke()},search(i){i.beginPath(),i.arc(44,44,20,0,Math.PI*2),i.stroke(),i.beginPath(),i.moveTo(59,59),i.lineTo(76,76),i.stroke()},pause(i){i.beginPath(),i.moveTo(40,32),i.lineTo(40,68),i.moveTo(60,32),i.lineTo(60,68),i.stroke()},holo(i){i.beginPath(),i.moveTo(50,22),i.lineTo(76,36),i.lineTo(76,64),i.lineTo(50,78),i.lineTo(24,64),i.lineTo(24,36),i.closePath(),i.stroke(),i.beginPath(),i.moveTo(24,36),i.lineTo(50,50),i.lineTo(76,36),i.moveTo(50,50),i.lineTo(50,78),i.stroke()}};function ef(i,e){let{ctx:t,w:n,h:s}=i;t.clearRect(0,0,n,s),t.beginPath(),t.arc(n/2,s/2,n/2-4,0,Math.PI*2),t.fillStyle="rgba(20, 23, 31, 0.95)",t.fill(),t.lineWidth=3,t.strokeStyle="rgba(255,255,255,0.18)",t.stroke(),mi(t,e,n/2,s/2,n*.62,Bt,7),i.update()}function mi(i,e,t,n,s,r=Bt,a=6){i.save();let o=s/100;i.translate(t-50*o,n-50*o),i.scale(o,o),i.strokeStyle=r,i.fillStyle=r,i.lineWidth=a,i.lineCap="round",i.lineJoin="round",bx[e]?.(i),i.restore()}async function RM({mode:i,session:e,api:t,tint:n}){let s=i==="flat",r=i==="immersive-ar",a=t.util;await yx();let o=new $l({antialias:!0,alpha:!0,powerPreference:"high-performance"});o.setClearColor(0,0),o.outputColorSpace=hn,o.setPixelRatio(s?Math.min(2,window.devicePixelRatio||1):1),zh=Math.max(1,o.capabilities.getMaxAnisotropy?.()||1),o.setSize(window.innerWidth,window.innerHeight);let l=o.domElement;Object.assign(l.style,{position:"fixed",inset:"0",width:"100vw",height:"100vh",zIndex:"2147483000",touchAction:"none",display:s?"block":"none"}),document.body.appendChild(l);let c=new Wr,d=new Cn(70,window.innerWidth/window.innerHeight,.01,100);d.position.set(0,1.6,0),c.add(d);let m=[],u=h=>(m.push(h),h),f=[],x=0,b=(()=>{try{return matchMedia("(prefers-reduced-motion: reduce)").matches}catch{return!1}})(),g=h=>1-Math.pow(1-Math.min(1,Math.max(0,h)),4),p=!1,A={a:new Je,b:new Je,c:new Je},D=0,T=8246268,P=!1;try{D=Math.max(0,Sa.findIndex(h=>h.name===localStorage.getItem("izuki.vr.theme")))}catch{}function R(h){let v=Sa[h];if(A.a.setRGB(...v.orb[0]),A.b.setRGB(...v.orb[1]),A.c.setRGB(...v.orb[2]),h===0&&n){let E=parseInt(n.slice(1),16),w=new Je((E>>16&255)/255,(E>>8&255)/255,(E&255)/255);A.a.lerp(w,.6),A.b.lerp(w,.35),A.c.lerp(w,.45)}T=v.halo,he?.set(v);let M=!!v.light&&!!he;if(M!==P){P=M;for(let E of dt)E.draw()}}function U(){D=(D+1)%Sa.length,R(D);try{localStorage.setItem("izuki.vr.theme",Sa[D].name)}catch{}return"This is "+Sa[D].name+(r?".":", with its own sky.")+" Say \u201Cchange your look\u201D again for the next one."}let _=new $t;_.visible=!1,c.add(_);let I=u(new dn({uniforms:{uTime:{value:0},uEnergy:{value:0},uThink:{value:0},uA:{value:A.a},uB:{value:A.b},uC:{value:A.c},uGlow:{value:new Je(.82,.95,1)}},vertexShader:Mx,fragmentShader:Sx,transparent:!0})),F=new vt(u(new Jn(.085,64,48)),I);F.renderOrder=2;let V=u(new ci({map:u(Qd()),color:6220500,transparent:!0,blending:on,depthWrite:!1,opacity:.3})),G=new Mi(V);G.scale.setScalar(.42),G.renderOrder=1;let J=u(new en({color:6220500,transparent:!0,opacity:0,blending:on,depthWrite:!1})),z=new vt(u(new as(.118,.003,8,120,Math.PI*1.4)),J),j=u(new en({color:6220500,transparent:!0,opacity:0,blending:on,depthWrite:!1})),ae=new vt(u(new as(.1,.0016,8,160)),j);ae.visible=!1,_.add(G,F,z,ae);let se=Qt(.56,.19);se.mesh.position.set(0,-.2,.01),_.add(se.mesh),u(se.tex),u(se.mesh.material),u(se.mesh.geometry),f.push(se.mesh.material);let q={state:"",you:"",reply:"",stage:"",mic:0,energy:0,think:0,hovered:!1,hint:s?"Click the orb to talk. Drag to look around.":"Point at the orb and pull the trigger (or pinch) to talk."};function ne(){let{ctx:h,w:v,h:M}=se;Nn(h,v,M,52);let E=56,w=30,C=vx[q.state]||q.stage||"";C?(h.beginPath(),h.arc(E+9,w+34,9,0,Math.PI*2),h.fillStyle=In,h.fill(),h.font=`600 30px ${Wt}`,Mt(h,Un(h,C,v-E*2-40),E+34,w+45,30,In,600,"left",Wt,"0.02em"),w+=62):w+=14,q.you&&(h.font=`500 34px ${tn}`,Mt(h,Un(h,q.you,v-E*2),E,w+=40,34,jt,500),w+=10);let Y=q.reply||(q.you?"":q.hint),H=(ie,ue)=>(h.font=`500 ${ue}px ${tn}`,h.measureText(ie).width),te=q.notice?a.fitLines(q.notice,v-E*2,2,30,26,H):null,ee=te?te.lines.length*te.size*1.3+22:0;if(Y){let ie=M-w-36-ee,ue=Math.max(1,Math.floor(ie/(32*1.32))),Me=a.fitLines(Y,v-E*2,Math.min(ue,5),50,32,H),Ke=Me.size*1.32;w+=6;for(let ye of Me.lines)Mt(h,ye,E,w+=Ke,Me.size,q.reply?Bt:jt,500)}if(Ye(q.notice||q.reply),te){let ie=M-32-(te.lines.length-1)*te.size*1.3;for(let ue of te.lines)Mt(h,ue,E,ie,te.size,q.noticeWarn?Ma:jt,500),ie+=te.size*1.3}se.update()}let de=null,xe=!1,Ye=h=>{xe&&de&&h&&de.textContent!==h&&(de.textContent=h)},Ge=0;function bt(h,v=12e3,M=!1){q.notice=String(h||""),q.noticeWarn=!!M,clearTimeout(Ge),Ge=setTimeout(()=>{q.notice="",ne()},v),ne()}let dt=[];function lt(h,v,M){let E=Qt(.088,.112,2400);u(E.tex),u(E.mesh.material),u(E.mesh.geometry),f.push(E.mesh.material);let w={c:E,icon:h,label:v,hot:!1,on:!1,shown:!0};return w.draw=()=>{let{ctx:C,w:Y,h:H}=E;C.clearRect(0,0,Y,H);let te=Y*.38,ee=Y/2,ie=te+10;C.beginPath(),C.arc(ee,ie,te,0,Math.PI*2);let ue=C.createLinearGradient(0,ie-te,0,ie+te);ue.addColorStop(0,w.hot?"rgba(44, 50, 64, 0.97)":"rgba(26, 29, 38, 0.95)"),ue.addColorStop(1,w.hot?"rgba(26, 30, 40, 0.97)":"rgba(14, 16, 22, 0.95)"),C.fillStyle=ue,C.fill(),C.lineWidth=w.hot||w.on?5:3,C.strokeStyle=w.on?In:w.hot?"rgba(255,255,255,0.55)":"rgba(255,255,255,0.16)",C.stroke(),mi(C,w.icon,ee,ie,te*1.05,w.on?In:Bt,6.5);let Me=P?{on:"#0F766E",hot:"#11151C",rest:"#2A303B"}:{on:In,hot:Bt,rest:jt};Mt(C,w.label,ee,H-12,30,w.on?Me.on:w.hot?Me.hot:Me.rest,600,"center",Wt,"0.01em"),E.update()},w.set=(C,Y)=>{C===w.icon&&Y===w.label||(w.icon=C,w.label=Y,w.draw())},w.setOn=C=>{!!C!==w.on&&(w.on=!!C,w.draw())},w.draw(),Se(E.mesh,{tap:M,hover:C=>{w.hot=C,w.draw(),E.mesh.position.z=C?.026:.02}}),_.add(E.mesh),dt.push(w),w}function oe(){let h=dt.filter(M=>M.shown),v=h.length>6?.088:.1;h.forEach((M,E)=>{M.c.mesh.visible=!0,M.c.mesh.position.set((E-(h.length-1)/2)*v,-.375,.02)});for(let M of dt)M.shown||(M.c.mesh.visible=!1)}let fe=[];function Se(h,v){return h.userData.ui=v,fe.push(h),h}function $e(h){let v=fe.indexOf(h);v>=0&&fe.splice(v,1)}let Fe=h=>{for(let v=h;v;v=v.parent)if(!v.visible)return!1;return!0},et=new la;et.far=10;let Ze=new N,rt=new N,gt=new Qn,at=0,ot=[],zt=u(new Cs(.006,20)),nn=u(new Pt().setAttribute("position",new it([0,0,0,0,0,-1],3)));function xn(h,v){let M={kind:h,ctrl:v,source:null,hit:null,hover:null,press:null,origin:new N,dir:new N,buttons:[],scrollAt:0};return M.dot=new vt(zt,u(new en({color:16777215,transparent:!0,opacity:.9,depthTest:!1}))),M.dot.renderOrder=999,M.dot.visible=!1,c.add(M.dot),v&&(M.line=new zi(nn,u(new ei({color:10482666,transparent:!0,opacity:.5}))),M.line.visible=!1,v.add(M.line)),ot.push(M),M}let Ft=(h,v=.25,M=16)=>{try{h.source?.gamepad?.hapticActuators?.[0]?.pulse?.(v,M)}catch{}};function Xt(h,v=!1){if(!h.hit)return;let M=h.hit.object.userData.ui,E=M.drag?M.drag():null;if(h.press={u:M,obj:h.hit.object,hit:h.hit,drag:E,grabOnly:v,dist:h.hit.distance,start:h.hit.point.clone(),offset:E?E.position.clone().sub(h.hit.point):null,moved:!1,t0:performance.now()},Ft(h,.35,20),!v)try{M.down?.(h)}catch(w){console.warn("vr down",w)}}let O=new N,sn=new N,pt=new N;function L(h,v){let M=h.source?.hand?o.xr.getHand(h.index):null,E=M?.joints?.["index-finger-tip"],w=M?.joints?.["thumb-tip"];return E&&w?(E.getWorldPosition(v),w.getWorldPosition(sn),v.add(sn).multiplyScalar(.5)):h.ctrl.getWorldPosition(v)}function y(h){if(s||!h.source)return!1;L(h,O);let v=null,M=1/0;for(let w of fe){let C=w.userData.ui;if(!(C.drag||C.grab)||!Fe(w))continue;let Y=w.geometry;Y.boundingBox||Y.computeBoundingBox(),w.updateWorldMatrix(!0,!1),pt.copy(O),w.worldToLocal(pt);let H=Y.boundingBox,te=w.getWorldScale(sn),ee=(w===F?.07:.03)/Math.max(.001,te.x),ie=Math.max(H.min.x-pt.x,0,pt.x-H.max.x),ue=Math.max(H.min.y-pt.y,0,pt.y-H.max.y),Me=Math.max(H.min.z-pt.z,0,pt.z-H.max.z);if(ie>ee||ue>ee||Me>ee+.05/Math.max(.001,te.x))continue;let Ke=Math.hypot(ie,ue,Me);Ke<M&&(M=Ke,v={m:w,u:C})}if(!v)return!1;let E=(v.u.drag||v.u.grab)();return E?(h.press={u:v.u,obj:v.m,hit:null,drag:E,direct:!0,grabOnly:!1,offset:E.position.clone().sub(O),start:O.clone(),moved:!1,t0:performance.now()},Ft(h,.5,28),!0):!1}function W(h,v=!0){let M=h.press;if(h.press=null,!!M){if(!M.grabOnly)try{M.u.up?.(performance.now()-M.t0,v&&!M.moved)}catch(E){console.warn("vr up",E)}if(M.moved){M.u.dropped?.();return}if(M.direct){if(!v)return;let E=null,w=M.obj.geometry?.parameters;if(w?.width&&w?.height){L(h,O);let C=M.obj.worldToLocal(O.clone());E={uv:{x:Math.max(0,Math.min(1,C.x/w.width+.5)),y:Math.max(0,Math.min(1,C.y/w.height+.5))},point:O.clone()}}try{M.u.tap?.(E,h)}catch(C){console.warn("vr tap",C)}return}if(!(M.grabOnly||!v)&&!(!h.hit||h.hit.object!==M.obj))try{M.u.tap?.(h.hit,h)}catch(E){console.warn("vr tap",E)}}}function Z(h){h.lookAt(Ze.x,h.position.y,Ze.z)}let re=[],ve=(h,v,M,E)=>{h.addEventListener(v,M,E),re.push(()=>h.removeEventListener(v,M,E))},we=null;if(!s){for(let h=0;h<2;h++){let v=o.xr.getController(h);c.add(v);let M=xn("xr",v);M.index=h,ve(v,"connected",E=>{M.source=E.data,M.line.visible=!0}),ve(v,"disconnected",()=>{M.source=null,M.line.visible=!1,M.dot.visible=!1,M.press=null}),ve(v,"selectstart",()=>{M.selected=!1,!y(M)&&(qe(M),Xt(M))}),ve(v,"select",()=>{M.selected=!0}),ve(v,"selectend",()=>{qe(M),W(M,M.selected),M.selected=!1}),ve(v,"squeezestart",()=>{y(M)||(qe(M),Xt(M,!0))}),ve(v,"squeezeend",()=>W(M,!1))}for(let h=0;h<2;h++)c.add(o.xr.getHand(h));if(!r){let h=u(new Jn(.006,8,6)),v=u(new en({color:13496317,transparent:!0,opacity:.85}));we={jointGeo:h,jointMat:v}}}let le=0;if(!s)try{o.xr.enabled=!0;let h=e.enabledFeatures,v=!h||h.includes("local-floor")?"local-floor":"local";v==="local"&&(le=-1.6),o.xr.setReferenceSpaceType(v);try{o.xr.setFramebufferScaleFactor(1.25)}catch{}await o.xr.setSession(e);try{o.xr.setFoveation(.2)}catch{}let M=[...e.inputSources||[]].filter(E=>!ot.some(w=>w.source===E));if(M.length){let E=new Event("inputsourceschange");Object.assign(E,{session:e,added:M,removed:[]}),e.dispatchEvent(E)}}catch(h){for(let v of re)try{v()}catch{}l.remove(),o.dispose();try{await e.end()}catch{}throw h}let he=r?null:wx(c,le);R(D);let Ee=new Oe,Be=s?xn("mouse",null):null,Te=null,Ae=-.2,He=0;if(s){Be.source={};let h=v=>{Ee.set(v.clientX/window.innerWidth*2-1,-(v.clientY/window.innerHeight)*2+1)};ve(l,"pointermove",v=>{h(v),Te&&(He-=(v.clientX-Te.x)*.004,Ae-=(v.clientY-Te.y)*.004,Ae=Math.max(-1.2,Math.min(1.2,Ae)),Te={x:v.clientX,y:v.clientY})}),ve(l,"pointerdown",v=>{h(v),qe(Be),Be.hit?Xt(Be):Te={x:v.clientX,y:v.clientY},l.setPointerCapture?.(v.pointerId)}),ve(l,"pointerup",v=>{h(v),Te=null,qe(Be),W(Be)}),ve(l,"pointercancel",()=>{Te=null,Be.press=null}),ve(l,"wheel",v=>{let M=Be.hit?.object.userData.ui;M?.scroll&&(v.preventDefault(),M.scroll(Math.sign(v.deltaY)*Math.min(5,Math.ceil(Math.abs(v.deltaY)/60))))},{passive:!1}),ve(window,"keydown",v=>{v.key==="Escape"?Cr():v.key===" "&&v.target===document.body&&(v.preventDefault(),t.tapOrb())}),ve(window,"resize",()=>{d.aspect=window.innerWidth/window.innerHeight,d.updateProjectionMatrix(),o.setSize(window.innerWidth,window.innerHeight)})}function qe(h){if(h.kind==="mouse")et.setFromCamera(Ee,d),h.origin.copy(et.ray.origin),h.dir.copy(et.ray.direction);else{if(!h.source)return!1;h.ctrl.getWorldPosition(h.origin),h.ctrl.getWorldQuaternion(gt),h.dir.set(0,0,-1).applyQuaternion(gt)}et.set(h.origin,h.dir);let v=et.intersectObjects(fe,!1);return h.hit=v.find(M=>Fe(M.object))||null,!0}function tt(h){h.holdAt=performance.now(),h.holdListening=q.state==="listening",h.holdListening||t.tapOrb()}function k(h,v){let M=h.holdListening;h.holdListening=!1,(M||v>600)&&t.tapOrb()}Se(F,{tap:()=>t.tapOrb(),drag:()=>_,dropped:()=>{_.userData.placed=!0},hover:h=>{q.hovered=h}}),Se(se.mesh,{drag:()=>_,dropped:()=>{_.userData.placed=!0}});let be=lt("mic","Talk",null);Object.assign(be.c.mesh.userData.ui,{tap:null,down:()=>tt(be),up:(h,v)=>{v&&k(be,h)}});let ce=lt("pause","Pause",()=>t.hangUp()),Ce=lt("eye","Look",()=>{Ai(),t.look()}),Le=()=>{pe.open?Ns():Ra().then(h=>{h&&t.speak(h)})},_e=()=>{let h=t.lastReply();h?qh(h):t.speak("There's nothing to pin yet. Ask me something first.")},We=()=>{if(K.open)return Ne();if(!t.pc.current())return bt("Your photos are on your PC: pair this headset with it once (leave the room, Remote, Pair).",12e3,!0);ln("Pictures").then(h=>{h&&bt(h,12e3,!0)})},Ve=()=>bt(U(),5e3),Lt=lt("photos","Photos",We),Et=lt("pc","My PC",Le);lt("pin","Pin",_e),lt("style","Style",Ve),lt("leave","Leave",()=>Cr()),ce.shown=!1,Ce.shown=!1,oe();let vn=[];function Fn(h,v,M){let E=Qt(.205,.054,2400);u(E.tex),u(E.mesh.material),u(E.mesh.geometry),p||f.push(E.mesh.material);let w={c:E,hot:!1};return w.draw=()=>{let{ctx:C,w:Y,h:H}=E;Nn(C,Y,H,(H-6)/2,{hot:w.hot}),mi(C,h,58,H/2,50,In,7),C.font=`500 37px ${tn}`,Mt(C,Un(C,v,Y-124),98,H/2+13,37,Bt,500),E.update()},w.draw(),Se(E.mesh,{tap:()=>{ba(),t.ask(M)},hover:C=>{w.hot=C,w.draw()}}),_.add(E.mesh),vn.push(w),w}let Ds=!1;try{Ds=localStorage.getItem("izuki.vr.tried")!=="1"}catch{}function ba(){Ds=!1;for(let h of vn)h.c.mesh.visible=!1;try{localStorage.setItem("izuki.vr.tried","1")}catch{}}function wa(){vn.forEach((h,v)=>{h.c.mesh.position.set((v-(vn.length-1)/2)*.218,.17,.01)}),rc()}t.hasCamera().then(h=>{Ce.shown=!!h,oe(),Fn(h?"eye":"mic",h?"\u201CWhat's this?\u201D":"\u201CWhat can you do?\u201D",h?"What's this?":"What can you do?"),Fn("photos","\u201CShow my photos\u201D","Show my photos"),Fn("style","\u201CChange your look\u201D","Change your look"),wa()});let De={group:new $t,photo:null,text:Qt(.5,.15),img:null,url:"",want:"",closed:"",seq:0,marks:[],say:"",t0:0,anim:!1,close:Qt(.05,.05)};De.group.visible=!1,c.add(De.group),Se(De.text.mesh,{drag:()=>De.group}),u(De.text.tex),u(De.close.tex),De.group.add(De.text.mesh,De.close.mesh),ef(De.close,"close"),Se(De.close.mesh,{tap:()=>{De.seq++,De.closed=De.want,De.group.visible=!1}});function Ta(){let{ctx:h,w:v,h:M}=De.text;Nn(h,v,M,44);let E=(Y,H)=>(h.font=`500 ${H}px ${tn}`,h.measureText(Y).width),w=a.fitLines(De.say,v-96,4,38,26,E),C=22;for(let Y of w.lines)Mt(h,Y,48,C+=w.size*1.32,w.size,Bt,500);De.text.update(),Ye(De.say)}function Sr(h){let v=De.photo;if(!v||!De.img)return;let{ctx:M,w:E,h:w}=v;M.clearRect(0,0,E,w),M.save(),Vn(M,0,0,E,w,28),M.clip(),M.drawImage(De.img,0,0,E,w),M.restore();let C=De.marks.length,Y=E*(De.steps?.03:.065),H=te=>({x:te.x/1e3*E,y:te.y/1e3*w});De.marks.forEach((te,ee)=>{let ie=Math.max(0,Math.min(1,h*C-ee));if(ie<=0)return;let{x:ue,y:Me}=H(te);if(De.steps&&ee>0&&Aa(M,H(De.marks[ee-1]),{x:ue,y:Me},Y,Math.min(1,ie*2)),M.save(),M.shadowColor="rgba(0,0,0,0.55)",M.shadowBlur=10,M.shadowOffsetY=3,M.strokeStyle=In,M.lineWidth=6,M.lineCap="round",M.beginPath(),M.arc(ue,Me,Y,-Math.PI/2,-Math.PI/2+Math.PI*2*ie),M.stroke(),M.restore(),De.steps&&C>1&&ie>.3){let Ke=Math.min(E-26,Math.max(26,ue-Y*.75)),ye=Math.min(w-26,Math.max(26,Me-Y*.75));M.save(),M.shadowColor="rgba(0,0,0,0.5)",M.shadowBlur=8,M.fillStyle=In,M.beginPath(),M.arc(Ke,ye,22,0,Math.PI*2),M.fill(),M.restore(),M.font=`700 26px ${tn}`;let ft=String(ee+1);Mt(M,ft,Ke-M.measureText(ft).width/2,ye+9,26,"#0b1016",700)}if(ie>.85&&te.label){M.font=`600 28px ${tn}`;let Ke=M.measureText(te.label).width,ye=Math.min(E-Ke-40,Math.max(10,ue-Ke/2-16)),ft=Me+Y+12>w-50?Me-Y-56:Me+Y+12;De.steps&&(ye=ue+Y+16+Ke+32<=E-10?ue+Y+16:Math.max(10,ue-Y-16-Ke-32),ft=Math.min(w-54,Math.max(10,Me-22))),Vn(M,ye,ft,Ke+32,44,22),M.fillStyle="rgba(14,16,22,0.88)",M.fill(),Mt(M,te.label,ye+16,ft+31,28,Bt,600)}}),v.update()}function Aa(h,v,M,E,w){let C=M.x-v.x,Y=M.y-v.y,H=Math.hypot(C,Y);if(H<=2*E+12)return;let te=C/H,ee=Y/H,ie=v.x+te*(E+6),ue=v.y+ee*(E+6),Me=(H-2*E-12)*w,Ke=ie+te*Me,ye=ue+ee*Me;if(h.save(),h.shadowColor="rgba(0,0,0,0.5)",h.shadowBlur=8,h.strokeStyle=In,h.lineWidth=5,h.lineCap="round",h.setLineDash([16,12]),h.beginPath(),h.moveTo(ie,ue),h.lineTo(Ke,ye),h.stroke(),h.setLineDash([]),w>=1){let wt=-ee,At=te;h.fillStyle=In,h.beginPath(),h.moveTo(Ke+te*4,ye+ee*4),h.lineTo(Ke-te*18+wt*18*.6,ye-ee*18+At*18*.6),h.lineTo(Ke-te*18-wt*18*.6,ye-ee*18-At*18*.6),h.closePath(),h.fill()}h.restore()}function Ai(){De.group.visible&&(De.say="Looking\u2026",Ta())}async function br({url:h,w:v,h:M,marks:E,say:w,picked:C,steps:Y}){if(C)De.closed="";else if(h===De.closed)return;let H=++De.seq;if(De.want=h,h!==De.url){let te=new Image;te.src=h;try{await te.decode()}catch{return}if(H!==De.seq)return;De.img=te,De.url=h;let ee=M/Math.max(1,v),ie=Math.min(.42,.5*ee),ue=ie/ee;De.photo&&($e(De.photo.mesh),De.group.remove(De.photo.mesh),De.photo.tex.dispose(),De.photo.mesh.geometry.dispose(),De.photo.mesh.material.dispose()),De.photo=Qt(ue,ie,2048),De.group.add(De.photo.mesh),Se(De.photo.mesh,{drag:()=>De.group}),De.photo.mesh.position.set(0,.1,0),De.text.mesh.position.set(0,.1-ie/2-.09,0),De.close.mesh.position.set(ue/2-.01,.1+ie/2-.01,.005)}if(De.marks=Array.isArray(E)?E:[],De.steps=!!Y,De.say=String(w||""),De.t0=performance.now(),De.anim=De.marks.length>0,!De.group.visible){let te=at-.6,ee=.85;De.group.position.set(Ze.x-Math.sin(te)*ee,Ze.y-.08,Ze.z-Math.cos(te)*ee),Z(De.group)}De.group.visible=!0,Sr(De.anim?0:1),Ta()}let pe={group:new $t,open:!1,live:!1,gen:0,target:null,err:"",clicks:Promise.resolve(),doing:"",busy:!1,screen:null,bar:Qt(1.6,.09),handle:Qt(.32,.035),aspect:9/16};pe.group.visible=!1,c.add(pe.group),u(pe.bar.tex),u(pe.handle.tex);function wr(h,v){pe.screen&&($e(pe.screen.mesh),pe.group.remove(pe.screen.mesh),pe.screen.tex.dispose(),pe.screen.mesh.geometry.dispose(),pe.screen.mesh.material.dispose());let M=v/h,E=Math.min(1.6,1.1/M),w=Qt(E,E*M,h/E);w.mesh.material.transparent=!1,w.mesh.material.depthWrite=!0,pe.screen=w,pe.aspect=M,pe.group.add(w.mesh);let C=E*M/2;return pe.bar.mesh.position.set(0,-C-.06,0),pe.handle.mesh.position.set(0,C+.04,0),Se(w.mesh,{tap:Y=>{if(!Y?.uv||!pe.live)return;let{nx:H,ny:te}=a.pcPoint(Y.uv.x,Y.uv.y),ee=pe.gen;B(Y.point);let ie=()=>pe.open&&ee===pe.gen&&pe.live;pe.clicks=pe.clicks.then(async()=>{if(!ie())return;let ue=await t.pc.send({op:"point",nx:H,ny:te},pe.target);if(ue?.ok===!1){ee===pe.gen&&(pe.err=ue.error||"",Gn());return}ie()&&await t.pc.send({op:"click",button:"left"},pe.target)}).catch(()=>{})},scroll:Y=>{pe.live&&t.pc.send({op:"scroll",dy:Y},pe.target)}}),w}wr(1280,720),pe.group.add(pe.bar.mesh,pe.handle.mesh);{let{ctx:h,w:v,h:M}=pe.handle;h.clearRect(0,0,v,M),Vn(h,4,4,v-8,M-8,(M-8)/2),h.fillStyle="rgba(255,255,255,0.34)",h.fill(),pe.handle.update()}Se(pe.handle.mesh,{drag:()=>pe.group});function Hi(h){pe.live=!1;let v=pe.screen,{ctx:M,w:E,h:w}=v;Nn(M,E,w,24),M.font=`500 ${Math.round(w*.05)}px ${tn}`;let C=a.wrapLines(h,E*.7,Y=>M.measureText(Y).width);C.forEach((Y,H)=>Mt(M,Y,E/2,w/2+(H-(C.length-1)/2)*w*.075,Math.round(w*.05),jt,500,"center")),v.update()}function Ea(h){(Math.abs(h.height/h.width-pe.aspect)>.01||pe.screen.w!==h.width)&&wr(h.width,h.height);let v=pe.screen;v.ctx.drawImage(h,0,0,v.w,v.h),v.update(),pe.live=!0}function Gn(){let{ctx:h,w:v,h:M}=pe.bar;Nn(h,v,M,48),h.beginPath(),h.arc(72,M/2,13,0,Math.PI*2),h.fillStyle=pe.err?Ma:In,h.fill();let E=pe.err||(pe.doing?"Izuki: "+pe.doing:(pe.target?.name||t.pc.name())+" \xB7 point and click, thumbstick to scroll");h.font=`500 60px ${tn}`,Mt(h,Un(h,E,v-800),116,M/2+21,60,pe.err?Ma:Bt,500);let w=(C,Y,H)=>{Vn(h,C,30,280,M-60,(M-60)/2),h.fillStyle=H?"rgba(220, 38, 38, 0.82)":"rgba(255, 255, 255, 0.07)",h.fill(),H||(h.lineWidth=3,h.strokeStyle="rgba(255,255,255,0.16)",h.stroke()),Mt(h,Y,C+140,M/2+19,52,Bt,600,"center",Wt,"0.02em")};pe.busy&&w(v-620,"Stop",!0),w(v-310,"Close",!1),pe.bar.update()}Se(pe.bar.mesh,{tap:h=>{let v=(h?.uv?.x??0)*pe.bar.w;if(v>pe.bar.w-320)Ns();else if(pe.busy&&v>pe.bar.w-630){let M=pe.gen;t.pc.send({op:"stop"},pe.target).then(E=>{!pe.open||M!==pe.gen||(E?.ok===!1?pe.err=E.error||"Your PC didn't confirm it stopped.":(pe.busy=!1,pe.err=""),Gn())})}},drag:()=>pe.group});let Tr=h=>new Promise(v=>setTimeout(v,h));async function Ca(h){for(;pe.open&&h===pe.gen;){let v=performance.now(),M=await t.pc.shot(1280,pe.target);if(!pe.open||h!==pe.gen)break;if(M.blob){let E=()=>pe.open&&h===pe.gen,w=null;try{w=await createImageBitmap(M.blob),E()&&(Ea(w),pe.err&&(pe.err="",Gn()))}catch{E()&&(pe.err="A picture from your PC didn't come through.",Hi(pe.err),Gn())}finally{w?.close?.()}}else pe.err=M.error||"Your PC didn't answer.",Hi(pe.err),Gn();await Tr(M.blob?Math.max(120,320-(performance.now()-v)):3e3)}}async function jl(h){for(;pe.open&&h===pe.gen;){let v=await t.pc.status(pe.target);if(!pe.open||h!==pe.gen)break;v.error||(pe.doing=v.doing,pe.busy=v.busy,Gn()),await Tr(3e3)}}async function Ra(){if(!t.pc.current())return"This headset isn't paired with your PC yet. Leave VR, open Remote in Izuki and pair your PC once.";let h=1.55;pe.group.position.set(Ze.x-Math.sin(at)*h,Ze.y-.02,Ze.z-Math.cos(at)*h),Z(pe.group),pe.group.visible=!0,pe.open=!0,pe.err="",pe.target=t.pc.current(),ni("pc");let v=++pe.gen;return Hi("Connecting to "+(pe.target?.name||t.pc.name())+"\u2026"),Gn(),Ca(v),jl(v),""}function Ns(){pe.open=!1,pe.gen++,pe.group.visible=!1,_.userData.placed==="pc"&&(K?.open?_.userData.placed="files":ge?.open?_.userData.placed="web":me?.open?_.userData.placed="holo":Fs())}function ni(h){if(_.userData.placed!==!0){if(!_.userData.placed){let v=at+.7;Xn={x:Ze.x-Math.sin(v)*.7,y:Ze.y-.17,z:Ze.z-Math.cos(v)*.7}}_.userData.placed=h}}let gs=[],S=u(new rs(.012,.018,32));function B(h){let v=new vt(S,new en({color:6220500,transparent:!0,opacity:.9,depthTest:!1}));v.position.copy(h),v.lookAt(Ze),v.renderOrder=998,c.add(v),gs.push({m:v,t0:performance.now()})}let Q=1,$=.74,X=4,Pe=3,Ue=X*Pe,Re=.12,K={group:new $t,card:Qt(Q,$),handle:Qt(.3,.035),open:!1,gen:0,path:"",up:"",items:[],page:0,title:"",err:"",loading:!1,thumbs:new Map,pending:new Set,btns:[]};K.group.visible=!1,c.add(K.group),K.group.add(K.card.mesh,K.handle.mesh),K.handle.mesh.position.set(0,$/2+.035,0),u(K.card.tex),u(K.handle.tex);{let{ctx:h,w:v,h:M}=K.handle;Vn(h,4,4,v-8,M-8,(M-8)/2),h.fillStyle="rgba(255,255,255,0.34)",h.fill(),K.handle.update()}Se(K.handle.mesh,{drag:()=>K.group});let ke=()=>K.items.slice(K.page*Ue,K.page*Ue+Ue),nt=()=>Math.max(1,Math.ceil(K.items.length/Ue)),ct=h=>K.path+"|"+h.name;function ze(h){let{w:v,h:M}=K.card,E=M*Re,w=v*.018,C=(v-w*(X+1))/X,Y=(M-E-w*(Pe+1))/Pe;return{x:w+h%X*(C+w),y:E+w+Math.floor(h/X)*(Y+w),w:C,h:Y}}function ht(){let{ctx:h,w:v,h:M}=K.card;Nn(h,v,M,56);let E=M*Re;K.btns=[];let w=E*.62,C=E*.56,Y=v-44,H=(ee,ie)=>{let ue=Y-w/2;h.beginPath(),h.arc(ue,C,w/2,0,Math.PI*2),h.fillStyle="rgba(255,255,255,0.06)",h.fill(),h.lineWidth=3,h.strokeStyle="rgba(255,255,255,0.16)",h.stroke(),mi(h,ee,ue,C,w*.62,Bt,7),K.btns.push({x0:Y-w,x1:Y,act:ie}),Y-=w+20};H("close",()=>Ne()),K.page+1<nt()&&H("next",()=>{K.page++,ht(),Vt(K.gen)}),K.page>0&&H("back",()=>{K.page--,ht(),Vt(K.gen)}),K.path&&H("up",()=>{Tt(K.up,"")}),h.font=`600 50px ${Wt}`;let te=Un(h,K.title||"Your folders",Y-220);if(Mt(h,te,56,C+18,50,Bt,600,"left",Wt,"-0.01em"),nt()>1){h.font=`600 50px ${Wt}`;let ee=h.measureText(te).width;Mt(h,`${K.page+1} / ${nt()}`,56+ee+28,C+16,34,jt,500)}if(K.loading||K.err||!K.items.length){let ee=K.loading?"Opening\u2026":K.err||"This folder is empty.";h.font=`500 46px ${tn}`;let ie=a.wrapLines(ee,v*.7,ue=>h.measureText(ue).width);ie.forEach((ue,Me)=>Mt(h,ue,v/2,M*.55+(Me-(ie.length-1)/2)*64,46,K.err?Ma:jt,500,"center")),K.card.update();return}ke().forEach((ee,ie)=>{let ue=ze(ie);h.save(),Vn(h,ue.x,ue.y,ue.w,ue.h,26),h.fillStyle="rgba(255,255,255,0.045)",h.fill(),h.clip();let Me=K.thumbs.get(ct(ee));if(Me){let ye=Math.max(ue.w/Me.width,ue.h/Me.height);h.drawImage(Me,ue.x+(ue.w-Me.width*ye)/2,ue.y+(ue.h-Me.height*ye)/2,Me.width*ye,Me.height*ye)}else mi(h,ee.dir?"folder":t.isPicture(ee.name)?"photos":"doc",ue.x+ue.w/2,ue.y+ue.h*.42,Math.min(ue.w,ue.h)*.4,ee.dir?Bt:jt,4);let Ke=h.createLinearGradient(0,ue.y+ue.h-92,0,ue.y+ue.h);Ke.addColorStop(0,"rgba(10,12,18,0)"),Ke.addColorStop(1,"rgba(10,12,18,0.86)"),h.fillStyle=Ke,h.fillRect(ue.x,ue.y+ue.h-92,ue.w,92),h.font=`500 30px ${tn}`,Mt(h,Un(h,ee.name,ue.w-36),ue.x+18,ue.y+ue.h-20,30,Bt,500),h.restore()}),K.card.update()}async function Vt(h){for(let v of ke()){if(h!==K.gen||!K.open)return;let M=ct(v);if(v.dir||!t.isPicture(v.name)||K.thumbs.has(M)||K.pending.has(M))continue;K.pending.add(M);let E=null;try{E=await t.thumb(K.path,v)}finally{h===K.gen&&K.pending.delete(M)}if(h!==K.gen||!K.open){E?.close?.();return}if(K.thumbs.has(M)){E?.close?.();continue}K.thumbs.set(M,E||null),E&&ht()}}function Dt(){for(let h of K.thumbs.values())h?.close?.();K.thumbs.clear(),K.pending.clear()}async function Tt(h,v){let M=++K.gen;Dt(),Object.assign(K,{loading:!0,err:"",items:[],page:0,title:v||K.title}),ht();let E;if(h)E=await t.pc.list(h);else{let w=await t.pc.roots();E=w.error?w:{path:"",up:"",items:w.roots.map(C=>({name:C.name,dir:!0,at:C.path}))}}return M!==K.gen||!K.open?"":(K.loading=!1,E.error?(K.err=E.error,ht(),E.error):(Object.assign(K,{path:E.path,up:E.up,items:E.items}),v||(K.title=E.path?String(E.path).split(/[\\/]/).filter(Boolean).slice(-2).join(" \u203A "):"Your folders"),ht(),Vt(M),""))}Se(K.card.mesh,{tap:h=>{if(!h?.uv)return;let{w:v,h:M}=K.card,E=h.uv.x*v,w=(1-h.uv.y)*M;if(w<M*Re){K.btns.find(H=>E>=H.x0&&E<=H.x1)?.act();return}if(K.loading)return;let C=ke().findIndex((H,te)=>{let ee=ze(te);return E>=ee.x&&E<=ee.x+ee.w&&w>=ee.y&&w<=ee.y+ee.h}),Y=ke()[C];Y&&(Y.dir?Tt(Y.at||t.joinPath(K.path,Y.name),Y.name):t.openPhoto(K.path,Y).then(H=>{H&&bt(H,12e3,!0)}))},scroll:h=>{let v=Math.max(0,Math.min(nt()-1,K.page+Math.sign(h)));v!==K.page&&(K.page=v,ht(),Vt(K.gen))}});async function ln(h){if(!K.open){let w=at-(pe.open?.85:.05),C=1.15;K.group.position.set(Ze.x-Math.sin(w)*C,Ze.y-.04,Ze.z-Math.cos(w)*C),Z(K.group),ni("files")}if(K.open=!0,K.group.visible=!0,!h)return Tt("","Your folders");let v=++K.gen;Object.assign(K,{loading:!0,err:""}),ht();let M=await t.pc.roots();if(!K.open||v!==K.gen)return"";if(M.error)return K.loading=!1,K.err=M.error,ht(),M.error;let E=M.roots.find(w=>String(w.name).toLowerCase()===h.toLowerCase());return E?Tt(E.path,E.name):(await Tt("","Your folders"),"I couldn't find a "+h+" folder on your PC, so here are all your folders.")}function Ne(){K.open=!1,K.gen++,K.group.visible=!1,Dt(),_.userData.placed==="files"&&(pe.open?_.userData.placed="pc":ge.open?_.userData.placed="web":me.open?_.userData.placed="holo":Fs())}let cn=1,_t=.1,yn=.62,Hn=5,ge={group:new $t,head:Qt(cn,_t),body:Qt(cn,yn),handle:Qt(.3,.035),open:!1,gen:0,q:"",typed:"",mode:"",results:[],page:null,title:"",paras:[],first:0,more:!1,err:"",btns:[],rows:[]};ge.group.visible=!1,c.add(ge.group),ge.group.add(ge.head.mesh,ge.body.mesh,ge.handle.mesh),ge.head.mesh.position.set(0,yn/2+.008+_t/2,0),ge.handle.mesh.position.set(0,yn/2+.016+_t+.02,0),u(ge.head.tex),u(ge.body.tex),u(ge.handle.tex);{let{ctx:h,w:v,h:M}=ge.handle;Vn(h,4,4,v-8,M-8,(M-8)/2),h.fillStyle="rgba(255,255,255,0.34)",h.fill(),ge.handle.update()}Se(ge.handle.mesh,{drag:()=>ge.group});let Ei=()=>ge.mode==="reading"||ge.mode==="page-loading"||ge.mode==="page-error";function Ct(){let{ctx:h,w:v,h:M}=ge.head;Nn(h,v,M,48);let E=M/2,w=M*.6;ge.btns=[];let C=v-36,Y=(Ke,ye)=>{let ft=C-w/2;h.beginPath(),h.arc(ft,E,w/2,0,Math.PI*2),h.fillStyle="rgba(255,255,255,0.06)",h.fill(),h.lineWidth=3,h.strokeStyle="rgba(255,255,255,0.16)",h.stroke(),mi(h,Ke,ft,E,w*.62,Bt,7),ge.btns.push({x0:C-w,x1:C,act:ye}),C-=w+18};Y("close",()=>Ql()),Ei()&&Y("back",()=>{ge.gen++,ge.mode="results",Mn()});let H=30,te=C-12-H,ee=M*.66;Vn(h,H,E-ee/2,te,ee,ee/2),h.fillStyle="rgba(255,255,255,0.06)",h.fill(),h.lineWidth=3,h.strokeStyle=ge.mode==="typing"||ge.mode==="searching"?"rgba(94,234,212,0.75)":"rgba(255,255,255,0.16)",h.stroke(),mi(h,"search",H+ee*.58,E,ee*.6,jt,7);let ie=Ei()?ge.page?.site||"":ge.typed;h.font=`500 40px ${tn}`;let ue=Un(h,ie||"Search Google",te-ee*1.4-24),Me=H+ee*1.1;Mt(h,ue,Me,E+14,40,ie?Bt:jt,500),ge.mode==="typing"&&(h.font=`500 40px ${tn}`,h.fillStyle=In,h.fillRect(Me+(ie?h.measureText(ue).width:0)+6,E-22,4,44)),ge.head.update()}function qt(){let{ctx:h,w:v,h:M}=ge.body;Nn(h,v,M,48),ge.rows=[];let E=56,w=(Y,H=jt)=>{h.font=`500 44px ${tn}`;let te=a.wrapLines(Y,v*.76,ee=>h.measureText(ee).width);te.forEach((ee,ie)=>Mt(h,ee,v/2,M*.5+(ie-(te.length-1)/2)*62,44,H,500,"center"))},C=ge.mode;if(C==="")w("Say \u201Csearch the web for\u2026\u201D and anything you want to know. I'll look it up right here.");else if(C==="typing")w("");else if(C==="searching")w("Searching Google\u2026");else if(C==="error"||C==="page-error")w(ge.err,Ma);else if(C==="page-loading")w("Reading "+(ge.page?.site||"the page")+"\u2026");else if(C==="results"){ge.results.length||w("Google didn't return any pages for that. Try other words.");let Y=(M-40)/Hn;ge.results.slice(0,Hn).forEach((H,te)=>{let ee=20+te*Y;te&&(h.fillStyle="rgba(255,255,255,0.08)",h.fillRect(E,ee,v-E*2,2)),h.font=`600 40px ${Wt}`,Mt(h,Un(h,H.site,v-E*2),E,ee+66,40,In,600,"left",Wt),h.font=`500 34px ${tn}`;let ie=a.wrapLines(H.snippet||"Tap to read this page.",v-E*2,ue=>h.measureText(ue).width).slice(0,2);ie.length===2&&(H.snippet||"").length>0&&a.wrapLines(H.snippet,v-E*2,Me=>h.measureText(Me).width).length>2&&(ie[1]=Un(h,ie[1]+" \u2026",v-E*2)),ie.forEach((ue,Me)=>Mt(h,ue,E,ee+122+Me*46,34,jt,500)),ge.rows.push({y0:ee,y1:ee+Y,r:H})})}else if(C==="reading"){h.font=`600 46px ${Wt}`;let Y=a.wrapLines(ge.title,v-E*2,ie=>h.measureText(ie).width).slice(0,2),H=30;for(let ie of Y)Mt(h,ie,E,H+=60,46,Bt,600,"left",Wt);H+=30,h.font=`500 36px ${tn}`;let te=M-70;ge.more=!1;for(let ie=ge.first;ie<ge.paras.length;ie++){let ue=a.wrapLines(ge.paras[ie],v-E*2,Me=>h.measureText(Me).width);if(H+ue.length*50>te&&ie>ge.first){ge.more=!0;break}for(let Me of ue){if((H+=50)>te){ge.more=!0;break}Mt(h,Me,E,H,36,Bt,500)}H+=20}let ee=`${ge.first+1} / ${ge.paras.length}`+(ge.more?"  \xB7  thumbstick or tap for more":"");Mt(h,ee,v-E,M-28,26,jt,500,"right")}ge.body.update()}function Mn(){Ct(),qt()}Se(ge.head.mesh,{tap:h=>{if(!h?.uv)return;let v=h.uv.x*ge.head.w;ge.btns.find(M=>v>=M.x0&&v<=M.x1)?.act()},grab:()=>ge.group}),Se(ge.body.mesh,{tap:h=>{if(!h?.uv)return;let v=(1-h.uv.y)*ge.body.h;if(ge.mode==="results"){let M=ge.rows.find(E=>v>=E.y0&&v<E.y1);M&&rf(M.r)}else ge.mode==="reading"&&It(1)},scroll:h=>It(h),grab:()=>ge.group});function It(h){if(ge.mode!=="reading")return;let v=Math.max(0,Math.min(ge.paras.length-1,ge.first+Math.sign(h)));v===ge.first||h>0&&!ge.more||(ge.first=v,qt())}let On=new N;function Wi(){_.userData.placed!==!0&&(ge.group.updateWorldMatrix(!0,!1),On.set(-cn/2-.36,yn/2-.02,.06),ge.group.localToWorld(On),Xn={x:On.x,y:On.y,z:On.z},_.userData.placed="web")}function Pa(){if(!ge.open){let h=at-(pe.open||K.open?.85:.08),v=1.2;ge.group.position.set(Ze.x-Math.sin(h)*v,Ze.y-.02,Ze.z-Math.cos(h)*v),Z(ge.group)}ge.open=!0,ge.group.visible=!0}function nf(h,v){return b?(ge.typed=h,Ct(),Promise.resolve()):new Promise(M=>{let E=0,w=()=>{if(v!==ge.gen||!ge.open)return M();if(E=Math.min(h.length,E+(h.length>36?2:1)),ge.typed=h.slice(0,E),Ct(),E>=h.length)return setTimeout(M,220);setTimeout(w,45+Math.random()*35)};w()})}async function sf(h){h=String(h||"").trim(),Pa();let v=++ge.gen;if(Object.assign(ge,{q:h,typed:"",results:[],page:null,err:"",mode:h?"typing":""}),Mn(),!h)return"What should I search for? Say search the web for, and what you want to know.";if(Wi(),await nf(h,v),v!==ge.gen||!ge.open)return"";ge.mode="searching",Mn();let M;try{M=await t.search(h)}catch(E){M={error:String(E?.message||E)}}return v!==ge.gen||!ge.open?"":!M||M.error?(Object.assign(ge,{mode:"error",err:M?.error||"The search didn't work."}),Mn(),ge.err):(Object.assign(ge,{mode:"results",results:Array.isArray(M.results)?M.results:[]}),Mn(),M.answer||(ge.results.length?"Here's what Google found. Point at one and I'll read it to you.":"Google didn't find anything for that."))}async function rf(h){let v=++ge.gen;Object.assign(ge,{mode:"page-loading",page:h,paras:[],first:0,title:"",err:""}),Mn();let M;try{M=await t.read(h,ge.q)}catch(E){M={error:String(E?.message||E)}}if(!(v!==ge.gen||!ge.open)){if(!M||M.error){Object.assign(ge,{mode:"page-error",err:M?.error||"I couldn't read that page."}),Mn();return}Object.assign(ge,{mode:"reading",title:M.title||h.site,paras:Array.isArray(M.paras)&&M.paras.length?M.paras:["That page gave me nothing to read."]}),Mn(),t.speak?.(ge.paras[0])}}function Ql(){ge.open=!1,ge.gen++,ge.group.visible=!1,_.userData.placed==="web"&&(pe.open?(_.userData.placed=!1,ni("pc")):me.open?(_.userData.placed=!1,ni("holo")):Fs())}let Tn={teal:6220500,sky:8246268,violet:12891645,rose:16622767,amber:16569165,lime:12513892,white:15331063},af=h=>"#"+(Tn[h]??Tn.teal).toString(16).padStart(6,"0"),me={group:new $t,stage:new $t,open:!1,spec:null,nodes:[],links:[],bar:Qt(.86,.1),t0:0,focus:null,step:-1,building:null,btns:[]};me.group.visible=!1,me.group.add(me.stage,me.bar.mesh),me.bar.mesh.position.set(0,-.42,.02),c.add(me.group),u(me.bar.tex);let Ar=u(Qd()),of=u(new Jn(1,32,24)),lf=u(new Si(1,1,1)),cf=(()=>{let h=new ss(1,1),v=u(new dr(h));return h.dispose(),v})(),kh={value:0};function Vh(h){return new dn({uniforms:{color:{value:new Je(h)},opacity:{value:.82},time:kh},vertexShader:`varying vec3 vN; varying vec3 vV; varying float vY;
void main(){ vec4 mv = modelViewMatrix * vec4(position, 1.0); vN = normalize(normalMatrix * normal); vV = normalize(-mv.xyz);
  vY = (modelMatrix * vec4(position, 1.0)).y; gl_Position = projectionMatrix * mv; }`,fragmentShader:`uniform vec3 color; uniform float opacity; uniform float time; varying vec3 vN; varying vec3 vV; varying float vY;
void main(){ float rim = pow(1.0 - abs(dot(normalize(vN), normalize(vV))), 2.0);
  float lines = 0.8 + 0.2 * step(0.5, fract(vY * 150.0 - time * 0.9));
  gl_FragColor = vec4(color * (0.5 + rim * 1.5) * lines, opacity * (0.45 + rim * 0.55));
  #include <colorspace_fragment>
}`,transparent:!0,depthWrite:!1})}let St={group:new $t,rings:[],beam:null,dots:null,scan:null,scanT0:-1,speed:[]};{let h=E=>new en({color:Tn.teal,transparent:!0,opacity:E,blending:on,depthWrite:!1,side:zn});for(let[E,w,C,Y,H]of[[.985,1,.32,96,.25],[.7,.71,.24,96,-.4],[.4,.44,.14,6,.6]]){let te=new vt(u(new rs(E,w,Y)),u(h(C)));te.rotation.x=-Math.PI/2,St.group.add(te),St.rings.push(te),St.speed.push(H)}St.beam=new vt(u(new hi(.85,1,1,48,1,!0)),u(new dn({uniforms:{color:{value:new Je(Tn.teal)},strength:{value:.14}},vertexShader:"varying float vY; void main(){ vY = position.y + 0.5; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`uniform vec3 color; uniform float strength; varying float vY;
void main(){ float a = strength * pow(1.0 - vY, 2.2); gl_FragColor = vec4(color * a, a);
  #include <colorspace_fragment>
}`,transparent:!0,blending:on,depthWrite:!1,side:zn}))),St.beam.position.y=.5,St.group.add(St.beam);let v=70,M=new Float32Array(v*3);St.rise=[];for(let E=0;E<v;E++){let w=Math.random()*Math.PI*2,C=Math.sqrt(Math.random())*.88;M.set([Math.cos(w)*C,Math.random(),Math.sin(w)*C],E*3),St.rise.push(.05+Math.random()*.1)}St.dots=new As(u(new Pt().setAttribute("position",new it(M,3))),u(new es({color:Tn.teal,size:.006,transparent:!0,opacity:.75,blending:on,depthWrite:!1}))),St.group.add(St.dots),St.scan=new vt(u(new rs(.95,1,96)),u(h(0))),St.scan.rotation.x=-Math.PI/2,St.group.add(St.scan),St.group.visible=!1,me.group.add(St.group)}function Ia(h,v){let M=Math.max(.24,Math.min(.7,h));St.group.scale.set(M,.68,M),St.group.position.set(0,-.34,0),St.group.visible=!0,St.scanT0=v&&!b?performance.now():-1,St.scan.material.opacity=0}function hf(h,v){if(!St.group.visible||b)return;St.rings.forEach((E,w)=>{E.rotation.z+=h*St.speed[w]});let M=St.dots.geometry.attributes.position;for(let E=0;E<M.count;E++){let w=M.getY(E)+h*St.rise[E];w>1&&(w-=1),M.setY(E,w)}if(M.needsUpdate=!0,St.scanT0>=0){let E=(v-St.scanT0)/1100;E>=1?(St.scanT0=-1,St.scan.material.opacity=0):(St.scan.position.y=E,St.scan.material.opacity=.9*Math.sin(Math.PI*E))}}function La(){for(let h of me.nodes){for(let v of[h.mat,h.glow.material,h.label.mesh.material])v.dispose();h.label.tex.dispose(),h.label.mesh.geometry.dispose(),h.ring?.geometry.dispose(),h.ring?.material.dispose(),h.shell?.material.dispose(),$e(h.body),$e(h.label.mesh)}for(let h of me.links)h.line.geometry.dispose(),h.line.material.dispose(),h.pulse?.material.dispose();me.building&&(me.building.geometry.dispose(),me.building.material.dispose()),mf(),vf(),me.stage.clear(),me.nodes=[],me.links=[],me.building=null}function ec(){let h=at-(pe.open?.9:0),v=1.35;me.group.position.set(Ze.x-Math.sin(h)*v,Ze.y+.02,Ze.z-Math.cos(h)*v),Z(me.group)}function Er(h){let{ctx:v,w:M,h:E}=me.bar;Nn(v,M,E,48);let w=E/2,C=E*.6;me.btns=[];let Y=M-36,H=(ue,Me)=>{let Ke=Y-C/2;v.beginPath(),v.arc(Ke,w,C/2,0,Math.PI*2),v.fillStyle="rgba(255,255,255,0.06)",v.fill(),v.lineWidth=3,v.strokeStyle="rgba(255,255,255,0.16)",v.stroke(),mi(v,ue,Ke,w,C*.62,Bt,7),me.btns.push({x0:Y-C,x1:Y,act:Me}),Y-=C+18};H("close",()=>tc());let te=me.spec,ee=te?.steps?.length||0;te&&ee&&(me.step<ee-1&&H("next",()=>t.holoStep?.(1)),me.step>0&&H("back",()=>t.holoStep?.(-1))),mi(v,"holo",30+C/2,w,C*.7,In,6);let ie=30+C+16;if(v.font=`600 38px ${Wt}`,v.font=`600 44px ${Wt}`,Mt(v,Un(v,h||te?.title||"",Y-ie-190),ie,w+15,44,Bt,600,"left",Wt),te&&ee){let ue=me.step<0?`${ee} steps \xB7 say next`:`Step ${me.step+1} of ${ee}`;Mt(v,ue,Y-8,w+12,32,jt,500,"right")}me.bar.update()}Se(me.bar.mesh,{tap:h=>{if(!h?.uv)return;let v=h.uv.x*me.bar.w;me.btns.find(M=>v>=M.x0&&v<=M.x1)?.act()},drag:()=>me.group});function uf(h){La(),me.spec=null,me.step=-1,me.focus=null,me.open||ec(),me.open=!0,me.group.visible=!0;let v=new vt(new as(.16,.0025,8,96),new en({color:Tn.teal,transparent:!0,opacity:.7,depthWrite:!1}));me.stage.add(v),me.building=v,Ia(.3,!1),Er("Building "+(h?"\u201C"+String(h).slice(0,48)+"\u201D":"a hologram")+"\u2026"),ni("holo")}function df(h,v,M,E){let w=Tn[h.color]??Tn.teal,C=new $t,Y=M==="chart"?new en({color:w,transparent:!0,opacity:.82,depthWrite:!0}):Vh(w),H,te;M==="chart"?(H=new vt(lf,Y),te=.04):(te=M==="model"?.022+h.size*.016:M==="map"&&v===0?.055:.03,H=new vt(of,Y),H.scale.setScalar(te));let ee=new Mi(new ci({map:Ar,color:w,transparent:!0,opacity:.5,blending:on,depthWrite:!1}));ee.scale.setScalar(te*(M==="chart"?3:5.5));let ie=M==="steps"||M==="map"&&v===0,ue=M==="model",Me=Qt(ue?.15:ie?.26:.24,ue?.05:ie?.13:.085);{let{ctx:wt,w:At,h:kt}=Me;Nn(wt,At,kt,30,{fill0:"rgba(16,19,27,0.82)",fill1:"rgba(10,12,18,0.86)"});let rn=ue?-2:16,Xe=ue?"":M==="timeline"&&h.when?h.when:M==="steps"?String(v+1):M==="chart"&&Number.isFinite(h.value)?String(h.value)+(E.unit?" "+E.unit:""):"";if(Xe&&(Mt(wt,Xe,26,rn+=34,30,af(h.color),700,"left",Wt),rn+=4),wt.font=`600 36px ${Wt}`,Mt(wt,Un(wt,h.label,At-52),26,rn+=40,36,Bt,600,"left",Wt),h.note&&!ue){wt.font=`500 26px ${tn}`;let mt=a.wrapLines(h.note,At-52,Zt=>wt.measureText(Zt).width).slice(0,ie?3:1);for(let Zt of mt)Mt(wt,Zt,26,rn+=34,26,jt,500)}Me.update()}Me.mesh.material.opacity=1,C.add(H,ee,Me.mesh);let Ke=null;M!=="chart"&&(Ke=new Ts(cf,new ei({color:w,transparent:!0,opacity:.3,blending:on,depthWrite:!1})),Ke.scale.setScalar(te*1.45),Ke.rotation.set(v*.7,v*1.3,0),C.add(Ke));let ye={it:h,i:v,g:C,body:H,mat:Y,glow:ee,label:Me,shell:Ke,r:te,kind:M,base:new N,angle:0,speed:0,orbitR:0,parent:null,shown:0,emph:1},ft=()=>t.ask?.(`Tell me more about ${h.label}`+(E.title?`, in ${E.title}`:"")+".");return Se(H,{tap:ft,hover:wt=>{ye.hot=wt}}),Se(Me.mesh,{tap:ft,hover:wt=>{ye.hot=wt}}),ye}function ff(h,v){let M=v.length,E=(C,Y)=>M>1?(C/(M-1)-.5)*Y:0;if(h.kind==="model"){let C=v.filter(H=>H.it.orbit<0);C.forEach((H,te)=>{H.base.set(C.length>1?(te/(C.length-1)-.5)*Math.min(.95,.32*C.length):0,.02,0)});let Y=new Map;for(let H of v)if(H.it.orbit>=0){let te=v[H.it.orbit],ee=Y.get(te)||0;Y.set(te,ee+1),H.parent=te,H.orbitR=te.r+H.r+.07+ee*.075,H.angle=ee*2.1+.6,H.speed=.45/(1+ee*.55);let ie=[];for(let ue=0;ue<=64;ue++){let Me=ue/64*Math.PI*2;ie.push(Math.cos(Me)*H.orbitR,Math.sin(Me)*H.orbitR*.22,Math.sin(Me)*H.orbitR*.85)}H.ring=new zi(new Pt().setAttribute("position",new it(ie,3)),new ei({color:Tn[te.it.color]??Tn.teal,transparent:!0,opacity:.28,depthWrite:!1})),me.stage.add(H.ring)}for(let H of v)H.label.mesh.position.set(0,-(H.r+.06),.01)}else if(h.kind==="map"){v[0].base.set(0,.02,0),v[0].label.mesh.position.set(0,-.14,.01);let C=v.slice(1);C.forEach((Y,H)=>{let te=-Math.PI/2+(H+.5)/C.length*Math.PI*2;Y.base.set(Math.cos(te)*.46,Math.sin(te)*.27+.02,.03+H%2*.05),Y.label.mesh.position.set(0,-.075,.01)})}else if(h.kind==="steps")v.forEach((C,Y)=>{let H=E(Y,Math.min(1.1,.28*M));C.base.set(H,.13,.16*(1-(H/.6)**2)),C.label.mesh.position.set(0,-.12,.01)});else if(h.kind==="timeline"){v.forEach((H,te)=>{H.base.set(E(te,Math.min(1.15,.27*M)),0,0),H.label.mesh.position.set(0,te%2?-.1:.1,.01)});let C=[-.62,0,0,.62,0,0],Y=new zi(new Pt().setAttribute("position",new it(C,3)),new ei({color:Tn.white,transparent:!0,opacity:.35,depthWrite:!1}));me.stage.add(Y),me.links.push({line:Y,a:null,b:null})}else if(h.kind==="chart"){let C=Math.max(...v.map(ee=>Math.abs(ee.it.value)||0),1e-9),Y=v.some(ee=>ee.it.value<0),H=Y?-.02:-.26,te=Y?.24:.46;v.forEach((ee,ie)=>{let ue=Number.isFinite(ee.it.value)?ee.it.value:0,Me=Math.max(.01,te*Math.abs(ue)/C),Ke=ue<0;ee.body.scale.set(.075,Me,.075),ee.base.set(E(ie,Math.min(1.05,.22*M)),H+(Ke?-Me/2:Me/2),0),ee.glow.position.set(0,Ke?-Me/2:Me/2,0),ee.label.mesh.position.set(0,Ke?Me/2+.06:-Me/2-.06,.05)})}let w=[];for(let C of v)for(let Y of C.it.link)v[Y]&&Y!==C.i&&w.push([C,v[Y]]);if(h.kind==="map"&&!w.length)for(let C of v.slice(1))w.push([v[0],C]);if(h.kind==="steps")for(let C=1;C<M;C++)w.push([v[C-1],v[C]]);for(let[C,Y]of w){let H=new zi(new Pt().setAttribute("position",new it([0,0,0,0,0,0],3)),new ei({color:Tn.teal,transparent:!0,opacity:0,depthWrite:!1}));me.stage.add(H);let te=new Mi(new ci({map:Ar,color:Tn[Y.it.color]??Tn.teal,transparent:!0,opacity:0,blending:on,depthWrite:!1}));te.scale.setScalar(.05),me.stage.add(te),me.links.push({line:H,a:C,b:Y,pulse:te,off:me.links.length*.37})}}function pf(h){if(La(),Da(),me.spec=h,me.step=-1,me.focus=null,me.t0=performance.now(),me.open||ec(),me.open=!0,me.group.visible=!0,h.kind==="sketch"){Ia(gf(h)+.06,!0),Er(),ni("holo");return}me.nodes=h.items.map((M,E)=>df(M,E,h.kind,h));for(let M of me.nodes)me.stage.add(M.g);ff(h,me.nodes);for(let M of me.nodes)M.g.position.copy(M.base),M.g.scale.setScalar(b?1:.001);let v=Math.max(.2,...me.nodes.map(M=>Math.abs(M.base.x)+M.r+(M.parent?M.orbitR+Math.abs(M.parent.base.x):0)));me.reach=v,Ia(v+.06,!0),Er(),ni("holo")}let Jt=.32,_s={parts:[],made:[]};function mf(){for(let h of _s.made)try{h.dispose()}catch{}_s.parts=[],_s.made=[]}function gf(h){let v=C=>(_s.made.push(C),C),M=C=>new N(C[0]*Jt,C[1]*Jt+.04,C[2]*Jt),E=(C,Y)=>{Y==="x"?C.rotation.z=-Math.PI/2:Y==="z"&&(C.rotation.x=Math.PI/2)},w=.2;return h.shapes.forEach((C,Y)=>{let H=Tn[C.color]??Tn.teal,te=new $t,ee=v(new en({color:H,transparent:!0,opacity:.95,blending:on,depthWrite:!1})),ie=null,ue=null,Me=null,Ke=(Xe,mt=!1)=>{let Zt=v(new ta(Xe,96,.0045,6,mt));ue=new vt(Zt,ee),te.add(ue),ie=Xe},ye=M(C.center),ft=(Xe,mt,Zt,Kt=48)=>{let bn=[];for(let Ot=0;Ot<Kt;Ot++){let Ci=Ot/Kt*Math.PI*2,Ri=Math.cos(Ci)*mt,Pi=Math.sin(Ci)*mt;bn.push(Zt==="y"?new N(Xe.x+Ri,Xe.y,Xe.z+Pi):Zt==="x"?new N(Xe.x,Xe.y+Ri,Xe.z+Pi):new N(Xe.x+Ri,Xe.y+Pi,Xe.z))}return new is(bn,!0)};if(C.type==="line"||C.type==="arrow"){let Xe=new Qr;for(let mt=1;mt<C.points.length;mt++)Xe.add(new ur(M(C.points[mt-1]),M(C.points[mt])));if(Ke(Xe),C.type==="arrow"){let mt=M(C.points[C.points.length-1]),Zt=M(C.points[C.points.length-2]),Kt=new vt(v(new ns(.016,.04,10)),ee);Kt.position.copy(mt),Kt.quaternion.setFromUnitVectors(new N(0,1,0),mt.clone().sub(Zt).normalize()),te.add(Kt)}}else if(C.type==="curve")Ke(new is(C.points.map(M)));else if(C.type==="circle")Ke(ft(ye,C.radius*Jt,C.axis),!0);else if(C.type==="spiral"||C.type==="wave"){let Xe=[];for(let Zt=0;Zt<=120;Zt++){let Kt=Zt/120;if(C.type==="spiral"){let bn=Kt*C.turns*Math.PI*2,Ot=(Kt-.5)*C.height*Jt,Ci=Math.cos(bn)*C.radius*Jt,Ri=Math.sin(bn)*C.radius*Jt;Xe.push(C.axis==="x"?new N(ye.x+Ot,ye.y+Ci,ye.z+Ri):C.axis==="z"?new N(ye.x+Ci,ye.y+Ri,ye.z+Ot):new N(ye.x+Ci,ye.y+Ot,ye.z+Ri))}else{let bn=(Kt-.5)*2*C.radius*Jt*2,Ot=Math.sin(Kt*Math.PI*2*C.turns)*C.height*Jt*.25;Xe.push(new N(ye.x+bn,ye.y+Ot,ye.z))}}Ke(new is(Xe))}else{let Xe;C.type==="sphere"?Xe=new Jn(C.radius*Jt,20,14):C.type==="cone"?Xe=new ns(C.radius*Jt,C.height*Jt,20,1,!0):C.type==="cylinder"?Xe=new hi(C.radius*Jt,C.radius*Jt,C.height*Jt,20,1,!0):Xe=new Si(C.size[0]*Jt,C.size[1]*Jt,C.size[2]*Jt),v(Xe);let mt=new vt(Xe,v(Vh(H)));mt.material.uniforms.opacity.value=.35;let Zt=new Ts(v(new dr(Xe)),v(new ei({color:H,transparent:!0,opacity:.55,blending:on,depthWrite:!1}))),Kt=new $t;Kt.add(mt,Zt),Me={body:mt.material,wire:Zt.material},E(Kt,C.axis),Kt.position.copy(ye),te.add(Kt),C.flow&&(ie=ft(ye,(C.type==="box"?Math.max(C.size[0],C.size[2])/2:C.radius)*Jt*1.08,C.axis==="y"?"y":C.axis==="x"?"x":"z"))}let wt=[];if(C.flow&&ie)for(let Xe=0;Xe<6;Xe++){let mt=new Mi(v(new ci({map:Ar,color:H,transparent:!0,opacity:0,blending:on,depthWrite:!1})));mt.scale.setScalar(.04),te.add(mt),wt.push({sp:mt,off:Xe/6})}let At=null;if(C.label){At=Qt(.16,.045),v(At.tex),v(At.mesh.geometry),v(At.mesh.material);let{ctx:Xe,w:mt,h:Zt}=At;Nn(Xe,mt,Zt,26,{fill0:"rgba(16,19,27,0.82)",fill1:"rgba(10,12,18,0.86)"}),Xe.font=`600 34px ${Wt}`,Mt(Xe,Un(Xe,C.label,mt-40),20,Zt/2+12,34,Bt,600,"left",Wt),At.update();let Kt=ie&&(C.type==="line"||C.type==="curve"||C.type==="arrow"||C.type==="spiral"||C.type==="wave")?ie.getPointAt(.55,new N):ye.clone().add(new N((C.type==="box"?C.size[0]/2:C.radius)*Jt*.7,0,0)),bn=Y%2?-1:1;At.mesh.position.set(Kt.x+bn*.1,Kt.y,Kt.z+.03),te.add(At.mesh),Se(At.mesh,{tap:()=>t.ask?.(`Tell me more about the ${C.label}`+(h.title?`, in ${h.title}`:"")+".")})}te.visible=b,me.stage.add(te);let kt=ue?ue.geometry.index.count:0;ue&&!b&&ue.geometry.setDrawRange(0,0),_s.parts.push({s:C,i:Y,g:te,tube:ue,count:kt,path:ie,flows:wt,label:At,lineMat:ee,solid:Me,emph:1});let rn=C.points.length?C.points:[C.center];for(let Xe of rn)w=Math.max(w,Math.abs(Xe[0]*Jt)+(C.type==="line"||C.type==="curve"||C.type==="arrow"?0:C.radius*Jt))}),w}let Gh=new N;function _f(h,v){let M=v-me.t0,E=_s.parts.length;_s.parts.forEach(w=>{let C=b?1:Math.max(0,Math.min(1,(M-250-w.i*(1600/Math.max(1,E)))/700));C>0&&(w.g.visible=!0),w.tube&&w.count&&w.tube.geometry.setDrawRange(0,Math.floor(w.count*C/3)*3),w.tube||w.g.scale.setScalar(Math.max(.001,1-(1-C)**3));let Y=me.focus?me.focus.has(w.i)?1.15:.25:1;w.emph+=(Y-w.emph)*Math.min(1,h*6);let H=w.s.pulse&&!b?.75+.25*Math.sin(v/380+w.i):1;if(w.lineMat.opacity=.95*Math.min(1,w.emph)*H,w.solid&&(w.solid.body.uniforms.opacity.value=.35*Math.min(1,w.emph)*H,w.solid.wire.opacity=.55*Math.min(1,w.emph)*H),w.label&&(w.label.mesh.material.opacity=Math.max(.3,Math.min(1,w.emph))),w.s.spin&&!b&&(w.g.rotation.y+=h*.35),w.path&&w.flows.length)for(let te of w.flows){let ee=b?te.off:(v/2400+te.off)%1;w.path.getPointAt(ee,Gh),te.sp.position.copy(Gh),te.sp.material.opacity=C>=1?.9*Math.min(1,w.emph)*(b?.6:Math.sin(Math.PI*ee)*.6+.4):0}})}let Xi={card:null};function Da(){Xi.card&&($e(Xi.card.mesh),me.group.remove(Xi.card.mesh),Xi.card.tex.dispose(),Xi.card.mesh.geometry.dispose(),Xi.card.mesh.material.dispose(),Xi.card=null)}async function xf({url:h,title:v,note:M}){if(!me.open)return;let E=new Image;E.crossOrigin="anonymous",E.src=h;try{await E.decode()}catch{return}if(!me.open)return;Da();let w=Qt(.34,.3,1024),{ctx:C,w:Y,h:H}=w;Nn(C,Y,H,36);let te=Y-40,ee=H-150,ie=E.width/E.height,ue=te/ee,Me=ie>ue?E.height*ue:E.width,Ke=ie>ue?E.height:E.width/ue;C.save(),Vn(C,20,20,te,ee,22),C.clip(),C.drawImage(E,(E.width-Me)/2,(E.height-Ke)/2,Me,Ke,20,20,te,ee),C.restore(),C.font=`600 40px ${Wt}`,Mt(C,Un(C,v,Y-60),30,H-82,40,Bt,600,"left",Wt),C.font=`500 26px ${tn}`,Mt(C,Un(C,(M?M+" \xB7 ":"")+"Photo: Wikipedia",Y-60),30,H-36,26,jt,500),w.update(),w.mesh.position.set(Math.max(.62,(me.reach||.4)+.26),.06,.04),w.mesh.rotation.y=-.35,me.group.add(w.mesh),Xi.card=w,Se(w.mesh,{tap:()=>t.ask?.(`Tell me more about ${v}.`),drag:()=>me.group})}let Sn={mesh:null,mark:null,made:[],credit:null};function vf(){for(let h of Sn.made)try{h.dispose()}catch{}Sn.credit&&$e(Sn.credit.mesh),Object.assign(Sn,{mesh:null,mark:null,made:[],credit:null})}function yf({title:h,map:v,rings:M,glow:E}){La(),Da(),me.spec={title:h,kind:"globe",steps:[],items:[]},me.step=-1,me.focus=null,me.t0=performance.now(),me.open||ec(),me.open=!0,me.group.visible=!0;let w=ie=>(Sn.made.push(ie),ie),C=w(new ia().setCrossOrigin("anonymous").load(v));C.colorSpace=hn,C.anisotropy=4;let Y=.2,H=new vt(w(new Jn(Y,64,40)),w(new en({map:C})));H.position.set(0,.12,0),H.rotation.x=.41,me.stage.add(H);let te=new Mi(w(new ci({map:Ar,color:E?16757575:10475775,transparent:!0,opacity:E?.9:.35,blending:on,depthWrite:!1})));if(te.scale.setScalar(Y*(E?4.2:2.7)),te.position.copy(H.position),me.stage.add(te),M){let ie=new vt(w(new rs(Y*1.25,Y*2.1,96)),w(new en({color:14272416,transparent:!0,opacity:.55,side:zn,depthWrite:!1})));ie.rotation.x=-Math.PI/2+.45,ie.position.copy(H.position),me.stage.add(ie)}let ee=Qt(.26,.04);w(ee.tex),w(ee.mesh.geometry),w(ee.mesh.material);{let{ctx:ie,w:ue,h:Me}=ee;Nn(ie,ue,Me,22,{fill0:"rgba(16,19,27,0.7)",fill1:"rgba(10,12,18,0.75)"}),Mt(ie,"Map: Solar System Scope \xB7 CC BY 4.0",20,Me/2+9,26,jt,500),ee.update()}ee.mesh.position.set(0,-.15,.05),me.stage.add(ee.mesh),Sn.mesh=H,Sn.credit=ee,me.reach=Y*(M?2.1:1.3),Ia(me.reach+.06,!0),Er(),ni("holo")}function Mf(h,v){if(!Sn.mesh)return;let M=.2*1.01,E=(Number(v)+180)/360*Math.PI*2,w=(90-Number(h))/180*Math.PI;if(!Sn.mark){let C=new Mi(new ci({map:Ar,color:16734810,transparent:!0,opacity:1,blending:on,depthWrite:!1}));Sn.made.push(C.material),C.scale.setScalar(.08),Sn.mesh.add(C),Sn.mark=C}Sn.mark.position.set(-M*Math.cos(E)*Math.sin(w),M*Math.cos(w),M*Math.sin(E)*Math.sin(w))}function Sf(h,v){Sn.mesh&&(b||(Sn.mesh.rotation.y+=h*.12),Sn.mark&&!b&&Sn.mark.scale.setScalar(.07+.03*Math.abs(Math.sin(v/300))))}function bf(h,v){me.step=v??me.step,me.focus=Array.isArray(h)&&h.length?new Set(h):null,Er()}function tc(){La(),Da(),St.group.visible=!1,me.open=!1,me.spec=null,me.group.visible=!1,t.holoClosed?.(),_.userData.placed==="holo"&&(pe.open?(_.userData.placed=!1,ni("pc")):Fs())}let Ln={group:null,sky:null,parts:null,dots:null,kind:"none",made:[],t0:0,spec:null};function nc(){if(!Ln.group)return!1;c.remove(Ln.group);for(let h of Ln.made)try{h.dispose()}catch{}return Object.assign(Ln,{group:null,sky:null,parts:null,dots:null,made:[],spec:null}),!0}function wf(h){nc();let v=ye=>(Ln.made.push(ye),ye),M=ye=>new Je(ye),E=new $t;E.position.set(Ze.x,le,Ze.z),E.rotation.y=at;let w=new vt(v(new Jn(36,48,24)),v(new dn({side:_n,transparent:!0,depthWrite:!0,uniforms:{top:{value:M(h.sky.top)},mid:{value:M(h.sky.horizon)},low:{value:M(h.sky.bottom)},fade:{value:b?1:0}},vertexShader:"varying vec3 vW; void main(){ vW = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`uniform vec3 top; uniform vec3 mid; uniform vec3 low; uniform float fade; varying vec3 vW;
void main(){ float h = vW.y; vec3 c = h < 0.0 ? mix(mid, low, clamp(-h * 3.0, 0.0, 1.0)) : mix(mid, top, clamp(pow(h, 0.7) * 1.3, 0.0, 1.0));
  gl_FragColor = vec4(c, fade);
  #include <colorspace_fragment>
}`})));w.renderOrder=-9,E.add(w);let C=new ra(M(h.sky.top),M(h.ground.color),1.1),Y=new oa(M(h.light),1.4);Y.position.set(6,10,4),E.add(C,Y);let H=h.ground.kind;if(H!=="none"){let ye;if(H==="dunes"||H==="rock"||H==="snow"){ye=new ki(68,68,64,64);let At=ye.attributes.position;for(let kt=0;kt<At.count;kt++){let rn=At.getX(kt),Xe=At.getY(kt),mt=Math.hypot(rn,Xe),Zt=H==="dunes"?.55:H==="rock"?.35:.2;At.setZ(kt,mt<3?0:Zt*Math.min(1,(mt-3)/6)*(Math.sin(rn*.45)*Math.cos(Xe*.38)+.5*Math.sin((rn+Xe)*.9)))}ye.computeVertexNormals()}else ye=new Cs(34,72);v(ye);let ft=v(H==="water"?new Vi({color:M(h.ground.color),transparent:!0,opacity:.92,emissive:M(h.ground.color),emissiveIntensity:.25}):H==="clouds"?new Vi({color:M(h.ground.color),transparent:!0,opacity:.85}):new Vi({color:M(h.ground.color),flatShading:H!=="grass"&&H!=="grid"})),wt=new vt(ye,ft);if(wt.rotation.x=-Math.PI/2,wt.position.y=H==="clouds"?-.4:.002,wt.renderOrder=-8,E.add(wt),H==="grid"){let At=[];for(let kt=-30;kt<=30;kt+=1.5)At.push(kt,.01,-30,kt,.01,30,-30,.01,kt,30,.01,kt);E.add(new Ts(v(new Pt().setAttribute("position",new it(At,3))),v(new ei({color:M(h.light),transparent:!0,opacity:.55}))))}}let te=new $t,ee={},ie=(ye,ft)=>ee[ye]||(ee[ye]=v(ft())),ue={near:[4,9],mid:[9,17],far:[18,30]};for(let ye of h.shapes){let ft=v(new Vi({color:M(ye.color),flatShading:!0})),wt=v(new en({color:M(ye.color)})),At=v(new Vi({color:M(ye.color).multiplyScalar(.35),flatShading:!0})),kt=ye.kind==="mountain"?ue.far:ye.kind==="planet"||ye.kind==="moon"?[22,30]:ue[ye.spread];for(let rn=0;rn<ye.count;rn++){let Xe=rn/ye.count*Math.PI*2+Math.random()*.9,mt=kt[0]+Math.random()*(kt[1]-kt[0]);Math.abs(Math.atan2(Math.sin(Xe),Math.cos(Xe)))<.65&&mt<12&&ye.kind!=="lantern"&&(mt+=7);let Kt=ye.size*(.75+Math.random()*.5),bn=new $t,Ot=(Pi,ac,oc=0,Bf=1,zf=1,kf=1)=>{let Oa=new vt(Pi,ac);return Oa.position.y=oc,Oa.scale.set(Bf,zf,kf),bn.add(Oa),Oa};if(ye.kind==="tree")Ot(ie("trunk",()=>new hi(.06,.09,.7,6)),At,.35),Ot(ie("blob",()=>new ss(.45,0)),ft,.95);else if(ye.kind==="pine")Ot(ie("trunk",()=>new hi(.06,.09,.7,6)),At,.3),Ot(ie("cone",()=>new ns(.42,1.3,7)),ft,1.05);else if(ye.kind==="palm")Ot(ie("stem",()=>new hi(.04,.07,1.9,6)),At,.95),Ot(ie("blob",()=>new ss(.45,0)),ft,1.95,1.4,.35,1.4);else if(ye.kind==="rock")Ot(ie("rock",()=>new Jr(.4,0)),ft,.15,1,.6,1);else if(ye.kind==="crystal")Ot(ie("crystal",()=>new ea(.3,0)),wt,.7,.8,2.3,.8);else if(ye.kind==="pillar")Ot(ie("pillar",()=>new hi(.25,.3,3,10)),ft,1.5);else if(ye.kind==="tower")Ot(ie("tower",()=>new Si(1,6,1)),ft,3);else if(ye.kind==="mountain")Ot(ie("mountain",()=>new ns(6,8,7)),ft,4);else if(ye.kind==="arch")Ot(ie("arch",()=>new as(1.2,.15,8,24,Math.PI)),ft,0);else if(ye.kind==="lantern")Ot(ie("lantern",()=>new Jn(.12,12,8)),wt,1.3);else if(ye.kind==="cloud"){let Pi=ie("puff",()=>new ss(.7,1));Ot(Pi,ft,0,1.4,.8,1);let ac=Ot(Pi,ft,.15,1,.7,1);ac.position.x=.9;let oc=Ot(Pi,ft,.1,1.1,.75,1);oc.position.x=-.9}else(ye.kind==="planet"||ye.kind==="moon")&&Ot(ie(ye.kind,()=>new Jn(ye.kind==="planet"?3:1.5,32,20)),ye.kind==="moon"?wt:ft,0);bn.scale.setScalar(Kt);let Ci=ye.kind==="planet"||ye.kind==="moon"?10+Math.random()*10:ye.kind==="cloud"?6+Math.random()*5:0,Ri=ye.float&&Ci===0?.8+Math.random()*2.5:0;bn.position.set(Math.sin(Xe)*mt,Ci+Ri,-Math.cos(Xe)*mt),bn.rotation.y=Math.random()*Math.PI*2,bn.userData={bob:ye.float||ye.kind==="cloud"||ye.kind==="lantern"?Math.random()*6:-1,y:bn.position.y},te.add(bn)}}b||te.scale.setScalar(.001),E.add(te);let Me=h.particles.kind,Ke=null;if(Me!=="none"){let ye=Math.round(Me==="stars"?500+700*h.particles.amount:150+900*h.particles.amount),ft=new Float32Array(ye*3),wt=new Float32Array(ye);for(let kt=0;kt<ye;kt++){if(Me==="stars"){let rn=Math.random()*Math.PI*2,Xe=Math.random()*.9+.08,mt=33;ft.set([Math.cos(rn)*Math.sqrt(1-Xe*Xe)*mt,Xe*mt,Math.sin(rn)*Math.sqrt(1-Xe*Xe)*mt],kt*3)}else{let rn=Math.random()*Math.PI*2,Xe=1.2+Math.sqrt(Math.random())*13;ft.set([Math.cos(rn)*Xe,Math.random()*9,Math.sin(rn)*Xe],kt*3)}wt[kt]=Math.random()*100}let At={stars:.09,snow:.05,rain:.03,fireflies:.07,embers:.05,bubbles:.08,petals:.06,dust:.03}[Me];Ke=new As(v(new Pt().setAttribute("position",new it(ft,3))),v(new es({color:M(h.particles.color),size:At,transparent:!0,opacity:Me==="dust"?.5:.9,depthWrite:!1,blending:Me==="fireflies"||Me==="embers"||Me==="stars"?on:us}))),Ke.userData.seed=wt,E.add(Ke)}c.add(E),Object.assign(Ln,{group:E,sky:w,parts:te,dots:Ke,kind:Me,t0:performance.now(),spec:h}),bt(h.title,5e3)}function Tf(h,v){if(!Ln.group)return;let M=(v-Ln.t0)/1e3;if(!b){Ln.sky.material.uniforms.fade.value=Math.min(1,M/1.2);let ee=Math.max(0,Math.min(1,(M-.5)/1.4));Ln.parts.scale.setScalar(Math.max(.001,1-(1-ee)**3));for(let ie of Ln.parts.children)ie.userData.bob>=0&&(ie.position.y=ie.userData.y+Math.sin(v/1600+ie.userData.bob)*.15)}let E=Ln.dots;if(!E||b||Ln.kind==="stars")return;let w=E.geometry.attributes.position,C=E.userData.seed,Y=Ln.kind,H=v/1e3,te={snow:-.5,rain:-7,fireflies:0,embers:.7,bubbles:.45,petals:-.35,dust:.03}[Y]??0;for(let ee=0;ee<w.count;ee++){let ie=w.getY(ee)+te*h*(.7+C[ee]%1*.6);if(ie<0?ie+=9:ie>9&&(ie-=9),w.setY(ee,ie),Y!=="rain"){let ue=C[ee];w.setX(ee,w.getX(ee)+Math.sin(H*.6+ue)*h*(Y==="fireflies"?.35:.12)),w.setZ(ee,w.getZ(ee)+Math.cos(H*.5+ue*1.3)*h*(Y==="fireflies"?.35:.12))}}w.needsUpdate=!0,Y==="fireflies"&&(E.material.opacity=.6+.35*Math.sin(H*2.1))}let Gt={card:Qt(.2,.09),until:0,total:0,words:"",shown:"",doneAt:0};Gt.card.mesh.visible=!1,Gt.card.mesh.position.set(.36,.1,.01),_.add(Gt.card.mesh),u(Gt.card.tex);function ic(h){let{ctx:v,w:M,h:E}=Gt.card,w=h<=0;Nn(v,M,E,40,w?{hot:!0}:{});let C=Math.max(0,Math.ceil(h/1e3)),Y=Math.floor(C/3600),H=Math.floor(C%3600/60),te=C%60,ee=w?"Time's up":(Y?Y+":"+String(H).padStart(2,"0"):String(H))+":"+String(te).padStart(2,"0");Mt(v,"Timer \xB7 "+Gt.words,34,56,26,jt,600,"left",Wt,"0.02em"),Mt(v,ee,34,E-40,w?56:72,w?In:Bt,600,"left",Wt);let ie=Gt.total?Math.max(0,Math.min(1,h/Gt.total)):0;v.fillStyle="rgba(255,255,255,0.1)",v.fillRect(34,E-22,M-68,4),v.fillStyle=In,v.fillRect(34,E-22,(M-68)*ie,4),mi(v,"close",M-52,52,40,jt,7),Gt.card.update()}function Af(h,v){Object.assign(Gt,{until:performance.now()+h,total:h,words:v||"",shown:"",doneAt:0}),Gt.card.mesh.visible=!0,ic(h)}function sc(){let h=Gt.until>0;return Gt.until=0,Gt.doneAt=0,Gt.card.mesh.visible=!1,h}Se(Gt.card.mesh,{tap:()=>sc(),drag:()=>_,dropped:()=>{_.userData.placed=!0}});function Ef(h){if(!Gt.until)return;let v=Gt.until-h;if(v>0){let M=String(Math.ceil(v/1e3));M!==Gt.shown&&(Gt.shown=M,ic(v));return}Gt.doneAt?h-Gt.doneAt>15e3&&sc():(Gt.doneAt=h,ic(0),bt("Time's up: your "+Gt.words+" timer.",12e3),t.speak?.("Time's up! Your "+Gt.words+" timer is done."))}let Na=[["Breathe in\u2026",4e3],["Hold\u2026",4e3],["Breathe out\u2026",6e3]],Wn={on:!1,t0:0,rounds:0,phase:-1,grow:0};function Cf(h=4){Object.assign(Wn,{on:!0,t0:performance.now(),rounds:h,phase:-1})}function Hh(h){Wn.on&&(Wn.on=!1,q.reply=h||"",ne())}function Rf(h){if(!Wn.on){Wn.grow+=(0-Wn.grow)*.08;return}let v=14e3,M=h-Wn.t0,E=Math.floor(M/v);if(E>=Wn.rounds){Hh("Nicely done. How do you feel?"),t.speak?.("Nicely done. How do you feel?");return}let w=M%v,C=0;for(;w>Na[C][1];)w-=Na[C][1],C++;let Y=w/Na[C][1],H=ee=>.5-Math.cos(Math.PI*ee)/2;Wn.grow=C===0?H(Y):C===1?1:1-H(Y);let te=E*3+C;te!==Wn.phase&&(Wn.phase=te,q.reply=Na[C][0]+"  "+(E+1)+" of "+Wn.rounds,q.stage="",ne())}let Wh=new N;function Pf(h,v){if(!me.open)return;if(hf(h,v),kh.value=v/1e3,me.building){me.building.rotation.y+=h*1.4,me.building.rotation.x=.5;return}if(me.spec?.kind==="sketch"){_f(h,v);return}if(me.spec?.kind==="globe"){Sf(h,v);return}let M=v-me.t0;for(let w of me.nodes){let C=b?1:Math.max(0,Math.min(1,(M-w.i*110)/520));w.shown=b?1:1-(1-C)**3,w.parent?(b||(w.angle+=h*w.speed),Wh.set(Math.cos(w.angle)*w.orbitR,Math.sin(w.angle)*w.orbitR*.22,Math.sin(w.angle)*w.orbitR*.85),w.g.position.copy(w.parent.g.position).add(Wh),w.ring.position.copy(w.parent.g.position)):b||w.g.position.set(w.base.x,w.base.y+Math.sin(v/1400+w.i)*.004,w.base.z);let Y=me.focus?me.focus.has(w.i)?1.18:.32:w.hot?1.1:1;w.emph+=(Y-w.emph)*Math.min(1,h*6);let H=Math.min(1,w.emph);w.g.scale.setScalar(Math.max(.001,w.shown*(w.emph>1?w.emph:1))),w.mat.uniforms?w.mat.uniforms.opacity.value=.82*H:w.mat.opacity=.82*H,w.shell&&(w.shell.material.opacity=.3*H*(w.hot?1.6:1),b||(w.shell.rotation.y+=h*.5,w.shell.rotation.x+=h*.17)),w.glow.material.opacity=.5*H*(w.hot?1.4:1),w.label.mesh.material.opacity=Math.max(.25,H)}let E=b?1:Math.max(0,Math.min(1,(M-me.nodes.length*110)/500));for(let w of me.links){if(!w.a)continue;let C=w.line.geometry.attributes.position;C.setXYZ(0,w.a.g.position.x,w.a.g.position.y,w.a.g.position.z),C.setXYZ(1,w.b.g.position.x,w.b.g.position.y,w.b.g.position.z),C.needsUpdate=!0;let Y=me.focus?me.focus.has(w.a.i)&&me.focus.has(w.b.i)?.7:.12:.45;if(w.line.material.opacity=Y*E,w.pulse){let H=b?.5:(v/1200+w.off)%1;w.pulse.position.lerpVectors(w.a.g.position,w.b.g.position,H);let te=me.focus?Y>.5?1:.1:.55;w.pulse.material.opacity=(b?.4:Math.sin(Math.PI*H))*te*E,w.pulse.scale.setScalar(me.focus&&Y>.5?.075:.05)}}}function If(){if(!pe.open||!pe.live)return null;let h=pe.screen,v=Math.min(1,1600/Math.max(h.w,h.h)),M=document.createElement("canvas");M.width=Math.max(1,Math.round(h.w*v)),M.height=Math.max(1,Math.round(h.h*v)),M.getContext("2d").drawImage(h.canvas,0,0,M.width,M.height);let E=M.toDataURL("image/jpeg",.85);return{b64:E.slice(E.indexOf(",")+1),url:E,w:M.width,h:M.height}}let Us=[];function Xh(h){$e(h.c.mesh),$e(h.x.mesh),c.remove(h.group);for(let M of[h.c,h.x])M.tex.dispose(),M.mesh.geometry.dispose(),M.mesh.material.dispose();let v=Us.indexOf(h);v>=0&&Us.splice(v,1)}function qh(h,v,M=!1,E=""){if(!M){let ie=t.notes.add(h,E);v=ie[ie.length-1]?.at??Date.now();let ue=new Set(ie.map(Me=>Me.at));for(let Me of[...Us])ue.has(Me.at)||Xh(Me)}let w=new $t,C=Qt(.3,.19),Y=Qt(.04,.04);{let{ctx:ie,w:ue,h:Me}=C;Nn(ie,ue,Me,44),mi(ie,"pin",62,66,34,jt,7),ie.font=`600 28px ${Wt}`,Mt(ie,E?Un(ie,"Pinned \xB7 "+E,ue-140):"Pinned",88,76,28,jt,600,"left",Wt,"0.02em");let Ke=(wt,At)=>(ie.font=`500 ${At}px ${tn}`,ie.measureText(wt).width),ye=a.fitLines(h,ue-96,6,34,22,Ke),ft=92;for(let wt of ye.lines)Mt(ie,wt,48,ft+=ye.size*1.32,ye.size,Bt,500);C.update(),ef(Y,"close")}Y.mesh.position.set(.135,.08,.004),w.add(C.mesh,Y.mesh),c.add(w);let H=new Set(Us.map(ie=>ie.slot)),te=0;for(;H.has(te);)te++;let ee={group:w,c:C,x:Y,at:v,text:h,slot:te};Us.push(ee),Se(C.mesh,{tap:()=>t.resume?t.resume({text:h,ask:E}):t.speak(h),drag:()=>w}),Se(Y.mesh,{tap:()=>{Xh(ee),t.notes.remove(v)}}),Ua?Yh(ee):w.visible=!1}function Yh(h){let v=h.slot,M=at-1.1-v%4*.42,E=.95,w=Math.floor(v/4);h.group.position.set(Ze.x-Math.sin(M)*E,Ze.y-.05+w*.24-v%2*.05,Ze.z-Math.cos(M)*E),Z(h.group),h.group.visible=!0}let Ua=!1;function Lf(){let h=s?d:o.xr.getCamera();Ze.setFromMatrixPosition(h.matrixWorld),gt.setFromRotationMatrix(h.matrixWorld),rt.set(0,0,-1).applyQuaternion(gt),Math.hypot(rt.x,rt.z)>.15&&(at=Math.atan2(-rt.x,-rt.z))}function Df(){_.position.set(Ze.x-Math.sin(at)*.75,Ze.y-.1,Ze.z-Math.cos(at)*.75),Z(_),_.visible=!0,Ua=!0,x=performance.now(),Us.forEach(Yh)}function Nf(h){if(!x||p)return;let v=b?1:g((h-x)/1100),M=b?1:g((h-x-350)/600);F.scale.multiplyScalar(.3+.7*v),V.opacity+=(1-v)*.45;let E=b?1:Math.min(1,(h-x)/1500);ae.visible=E<1,E<1&&(j.opacity=.8*(1-E)*(1-E),ae.scale.setScalar(.9+g(E)*1.6));for(let w of f)w.opacity=M;v>=1&&M>=1&&E>=1&&(p=!0)}let Xn=null;function Uf(h){if(ot.some(v=>v.press?.drag===_)){Xn=null;return}if(!_.userData.placed){let v=a.followTarget({x:Ze.x,y:Ze.y,z:Ze.z,yaw:at},_.position);v&&(Xn=v)}if(Xn){let v=1-Math.exp(-h*2.6);_.position.x+=(Xn.x-_.position.x)*v,_.position.y+=(Xn.y-_.position.y)*v,_.position.z+=(Xn.z-_.position.z)*v,Math.hypot(Xn.x-_.position.x,Xn.y-_.position.y,Xn.z-_.position.z)<.02&&(Xn=null)}Z(_)}function Fs(){_.userData.placed=!1,Xn={x:Ze.x-Math.sin(at)*.75,y:Ze.y-.1,z:Ze.z-Math.cos(at)*.75}}let Zh={listening:6220500,thinking:10980346,speaking:16020150};function Ff(h,v){let M=.06+Math.sin(v*1.4)*.02;q.state==="listening"?M=Math.max(.12,q.mic):q.state==="thinking"?M=.28:q.state==="speaking"&&(M=.34+.36*Math.abs(Math.sin(v*7.3)*Math.sin(v*3.1+1))),q.energy+=(M-q.energy)*Math.min(1,h*8),q.think+=((q.state==="thinking"?1:0)-q.think)*Math.min(1,h*3),I.uniforms.uTime.value=v,I.uniforms.uEnergy.value=q.energy,I.uniforms.uThink.value=q.think;let E=(1+Math.sin(v*1.7)*.012+q.energy*.1)*(q.hovered?1.06:1)*(1+Wn.grow*.45);F.scale.setScalar(E),V.opacity=.1+q.energy*.36,V.color.setHex(Zh[q.state]||T),G.scale.setScalar(.4+q.energy*.12);let w=q.state==="listening"||q.state==="thinking";J.opacity+=((w?.6:0)-J.opacity)*Math.min(1,h*6),J.color.setHex(Zh[q.state]||6220500),z.rotation.z-=h*(q.state==="thinking"?4:.8),z.scale.setScalar(1+(q.state==="listening"?q.mic*.25:0)),Of(h,v)}let Fa=(()=>{let h=u(new ki(.008,1)),v=u(new en({color:6220500,transparent:!0,opacity:0,depthWrite:!1,blending:on})),M=[];for(let E of[-1,1])for(let w=0;w<4;w++){let C=new vt(h,v);C.position.set(E*(.142+w*.016),0,.01),C.userData={k:w,phase:Math.random()*6,h:.004},C.scale.y=.004,_.add(C),M.push(C)}return{bars:M,mat:v}})();function Of(h,v){let M=q.state==="listening";if(Fa.mat.opacity+=((M?.9:0)-Fa.mat.opacity)*Math.min(1,h*8),!(Fa.mat.opacity<.01))for(let E of Fa.bars){let{k:w,phase:C}=E.userData,Y=b?.6:.55+.45*Math.abs(Math.sin(v*(7+w*1.7)+C)),H=M?.006+q.mic*.07*(1-w*.18)*Y:.004;E.userData.h+=(H-E.userData.h)*Math.min(1,h*14),E.scale.y=Math.max(.004,E.userData.h)}}function rc(){let h=q.state;h==="listening"?be.set("done","Done"):h==="speaking"?be.set("quiet","Quiet"):h==="thinking"?be.set("think","Working"):be.set("mic","Talk");let v=!!t.calling?.();v!==ce.shown&&(ce.shown=v,oe()),Lt.setOn(K.open),Et.setOn(pe.open);let M=Ds&&(h===""||h==="listening")&&!!t.ready?.();for(let E of vn)E.c.mesh.visible=M}let $h=performance.now(),Jh=0,Kh=0,jh=!1,Qh=0,eu=new Map;o.setAnimationLoop(()=>{let h=performance.now(),v=Math.min(.05,(h-$h)/1e3);$h=h,Jh+=v,Kh++,s&&(d.rotation.set(Ae,He,0,"YXZ"),d.updateMatrixWorld()),Lf(),!Ua&&Kh>3&&Df(),Ua&&Uf(v),Ff(v,Jh),Nf(h),Pf(v,h),Tf(v,h),Ef(h),Rf(h);for(let M of ot){if(!qe(M))continue;let E=M.hit,w=E?.object.userData.ui||null;w!==M.hover&&(M.hover?.hover?.(!1),w?.hover?.(!0),w&&Ft(M,.12,10),M.hover=w),M.dot.visible=!!E,E&&(M.dot.position.copy(E.point).addScaledVector(M.dir,-.003),M.dot.lookAt(M.origin)),M.line&&(M.line.scale.z=E?E.distance:1.2);let C=M.press;if(C?.direct)L(M,O),!C.moved&&O.distanceTo(C.start)>.012&&(C.moved=!0),C.moved&&(C.drag.position.copy(O).add(C.offset),Z(C.drag));else if(C?.drag){let H=M.origin.clone().addScaledVector(M.dir,C.dist);!C.moved&&H.distanceTo(C.start)>.03&&(C.moved=!0),C.moved&&(C.drag.position.copy(H).add(C.offset),Z(C.drag))}let Y=M.source?.gamepad;if(Y){let H=Y.axes[3]??0;Math.abs(H)>.45&&w?.scroll&&h-M.scrollAt>140&&(w.scroll(Math.sign(H)*(Math.abs(H)>.85?3:1)),M.scrollAt=h);let te=eu.get(M)||[],ee=!!Y.buttons[4]?.pressed,ie=!!Y.buttons[5]?.pressed;ee&&!te[0]&&tt(M),!ee&&te[0]&&k(M,h-(M.holdAt||h)),ie&&!te[1]&&Fs(),eu.set(M,[ee,ie])}}if(we)for(let M=0;M<2;M++){let E=o.xr.getHand(M);for(let w of Object.values(E.joints||{}))if(!w.userData.dot){let C=new vt(we.jointGeo,we.jointMat);w.add(C),w.userData.dot=C}}if(De.anim){let M=(h-De.t0)/(650*Math.max(1,De.marks.length));Sr(Math.min(1,M)),M>=1&&(De.anim=!1)}for(let M=gs.length-1;M>=0;M--){let E=gs[M],w=(h-E.t0)/350;E.m.scale.setScalar(1+w*1.6),E.m.material.opacity=Math.max(0,.9*(1-w)),w>=1&&(c.remove(E.m),E.m.material.dispose(),gs.splice(M,1))}h-Qh>200&&(Qh=h,rc()),o.render(c,d)});let xs=null;if(s){xe=!0,xs=document.createElement("div"),xs.setAttribute("role","status"),Object.assign(xs.style,{position:"fixed",top:"max(12px, env(safe-area-inset-top))",left:"50%",transform:"translateX(-50%)",zIndex:"2147483001",display:"flex",flexWrap:"wrap",justifyContent:"center",gap:"8px 10px",alignItems:"center",padding:"8px 8px 8px 16px",borderRadius:"24px",background:"rgba(18,20,27,.9)",color:Bt,font:`500 14px ${tn}`,border:"1px solid rgba(255,255,255,.14)",width:"max-content",maxWidth:"calc(100vw - 32px)",boxSizing:"border-box"});let h=document.createElement("span");h.textContent="3D preview \xB7 click the orb to talk, drag to look",Object.assign(h.style,{color:jt,textAlign:"center",flex:"1 1 auto"});let v=(M,E)=>{let w=document.createElement("button");return w.type="button",w.textContent=M,Object.assign(w.style,{font:`600 14px ${tn}`,color:Bt,background:"rgba(255,255,255,.1)",border:"1px solid rgba(255,255,255,.12)",borderRadius:"999px",padding:"8px 14px",cursor:"pointer",whiteSpace:"nowrap"}),w.onclick=E,w};xs.append(h,v("Talk",()=>t.tapOrb()),v("Photos",We),v("My PC",Le),v("Pin",_e),v("Style",Ve),v("Leave",()=>Cr())),de=document.createElement("span"),de.setAttribute("aria-live","polite"),Object.assign(de.style,{position:"absolute",width:"1px",height:"1px",overflow:"hidden",clip:"rect(0 0 0 0)",whiteSpace:"nowrap"}),xs.append(de),document.body.appendChild(xs)}else ve(e,"end",()=>Cr());function Cr(){if(!jh){if(jh=!0,Ns(),Ne(),Ql(),tc(),nc(),clearTimeout(Ge),o.setAnimationLoop(null),!s)try{e.end()}catch{}for(let h of re)try{h()}catch{}xs?.remove(),l.remove(),c.traverse(h=>{h.geometry?.dispose?.();let v=h.material;if(v)for(let M of Array.isArray(v)?v:[v])M.map?.dispose?.(),M.dispose?.()});for(let h of m)try{h.dispose?.()}catch{}o.dispose(),t.exited()}}return ne(),Gn(),{orb(h){let v=h||"";v!==q.state&&(q.state=v,v==="listening"&&(q.hint="",q.stage=""),v===""&&(q.stage=""),ne(),rc())},heard(h){let v=String(h||"");v!==q.you&&(q.you=v,v&&v!=="\u2026"&&(q.reply=""),q.hint="",ne())},said(h){let v=String(h||"");!v||v===q.reply||(q.reply=v,q.stage="",ne())},line(h,v,M){let E=String(v||"");E&&(h==="me"?(q.you=E,q.reply="",q.hint="",Ds&&ba()):h==="izuki"&&(M?.thinking?q.stage=E:(q.reply=E,q.stage="")),ne())},level(h){q.mic=Math.max(0,Math.min(1,Number(h)||0))},showLook:br,lookShown:()=>De.group.visible,pin:qh,comeHere:Fs,pcOpen:Ra,pcTarget:()=>pe.open?pe.target:null,pcClose:Ns,pcShown:()=>pe.open,pcFrame:If,filesOpen:ln,filesClose:Ne,webSearch:sf,webClose:Ql,webShown:()=>ge.open,holoBuilding:uf,holoShow:pf,holoFocus:bf,holoClose:tc,holoShown:()=>me.open,holoPhoto:xf,globeShow:yf,globeMark:Mf,dreamShow:wf,dreamClose:nc,dreamShown:()=>!!Ln.group,timerStart:Af,timerStop:sc,breathe:Cf,breatheStop:()=>Hh(""),nextTheme:U,notice:bt,stop:Cr}}function wx(i,e){let t={uLow:{value:new Je},uMid:{value:new Je},uTop:{value:new Je},uBand:{value:new Je},uBandAmt:{value:0}},n=new vt(new Jn(40,48,24),new dn({side:_n,depthWrite:!1,uniforms:t,vertexShader:"varying vec3 vW; void main(){ vW = normalize(position); gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }",fragmentShader:`varying vec3 vW;
      uniform vec3 uLow; uniform vec3 uMid; uniform vec3 uTop; uniform vec3 uBand; uniform float uBandAmt;
      void main(){
        float h = vW.y;
        vec3 c = h < 0.0 ? mix(uMid, uLow, clamp(-h * 2.5, 0.0, 1.0)) : mix(uMid, uTop, clamp(h * 1.6, 0.0, 1.0));
        // The horizon glow: brightest at eye level, fading up and down.
        c += uBand * exp(-abs(h) * 7.0) * uBandAmt;
        gl_FragColor = vec4(c, 1.0);
      }`}));n.renderOrder=-10,i.add(n);let s=320,r=new Float32Array(s*3);for(let x=0;x<s;x++){let b=Math.random()*Math.PI*2,g=Math.random()*.85+.12,p=30;r[x*3]=Math.cos(b)*Math.sqrt(1-g*g)*p,r[x*3+1]=g*p,r[x*3+2]=Math.sin(b)*Math.sqrt(1-g*g)*p}let a=new As(new Pt().setAttribute("position",new it(r,3)),new es({color:14674165,size:.05,transparent:!0,opacity:.5,depthWrite:!1}));i.add(a);let o=document.createElement("canvas");o.width=o.height=2048;let l=o.getContext("2d"),c=1024,d=1024/3.2,m=l.createRadialGradient(c,c,0,c,c,1024);m.addColorStop(0,"rgba(255,255,255,0.10)"),m.addColorStop(.5,"rgba(255,255,255,0.03)"),m.addColorStop(1,"rgba(255,255,255,0)"),l.fillStyle=m,l.fillRect(0,0,2048,2048);for(let x=.4;x<=3.2+1e-6;x+=.4){let b=x/3.2;l.beginPath(),l.arc(c,c,x*d,0,Math.PI*2),l.lineWidth=2.2-b,l.strokeStyle=`rgba(255,255,255,${(.34*(1-b)+.04).toFixed(3)})`,l.stroke()}let u=new Es(o);u.colorSpace=hn,u.anisotropy=zh;let f=new vt(new Cs(3.2,128),new en({map:u,transparent:!0,depthWrite:!1}));return f.rotation.x=-Math.PI/2,f.position.y=e,i.add(f),{set(x){t.uLow.value.setRGB(...x.low),t.uMid.value.setRGB(...x.mid),t.uTop.value.setRGB(...x.top),t.uBand.value.setRGB(...x.band),t.uBandAmt.value=x.bandAmt,a.material.opacity=x.stars,a.visible=x.stars>.02,f.material.color.setRGB(...x.floor)}}}var Sa=[{name:"Nova",orb:[[.18,.83,.75],[.55,.36,.96],[.96,.45,.71]],halo:8246268,low:[.008,.01,.014],mid:[.03,.036,.05],top:[.012,.014,.022],band:[.08,.2,.2],bandAmt:.55,stars:.5,floor:[.6,1,.95]},{name:"Midnight",orb:[[.25,.5,1],[.4,.75,1],[.75,.85,1]],halo:9684477,low:[.006,.01,.02],mid:[.02,.04,.08],top:[.008,.014,.03],band:[.1,.16,.32],bandAmt:.6,stars:.6,floor:[.7,.82,1]},{name:"Aurora",orb:[[.25,.92,.6],[.2,.75,.9],[.55,.45,.95]],halo:7268279,low:[.006,.012,.012],mid:[.02,.045,.045],top:[.01,.018,.022],band:[.08,.3,.18],bandAmt:.7,stars:.5,floor:[.6,1,.8]},{name:"Dawn",orb:[[1,.7,.52],[.92,.55,.62],[1,.86,.66]],halo:16701354,low:[.012,.009,.01],mid:[.06,.04,.045],top:[.02,.016,.026],band:[.32,.16,.1],bandAmt:.55,stars:.2,floor:[1,.85,.75]},{name:"Pearl",light:!0,orb:[[.86,.88,.96],[.7,.76,.92],[.94,.88,.92]],halo:14870768,low:[.42,.44,.48],mid:[.66,.68,.73],top:[.8,.81,.85],band:[.06,.06,.07],bandAmt:.4,stars:0,floor:[.2,.22,.28]}];export{RM as start};
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
