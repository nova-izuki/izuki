const TAU = Math.PI * 2;
// A fixed spherical atlas, not a flat spiral of dots. Connections remain
// attached to their stars as the object rotates in depth.
const stars = Array.from({ length: 96 }, (_, i) => {
  const y = 1 - 2 * (i+.5)/96, r = Math.sqrt(1-y*y), a = i*2.399963;
  return [Math.cos(a)*r, y, Math.sin(a)*r];
});
const links = [];
for (let i = 0; i < stars.length; i++) {
  if (i % 3) continue;
  const nearest = stars.map((p,j)=>({j,d:p.reduce((d,v,k)=>d+(v-stars[i][k])**2,0)})).filter(p=>p.j!==i).sort((a,b)=>a.d-b.d).slice(0,2);
  for (const p of nearest) if (p.j > i) links.push([i,p.j]);
}
export function drawConstellationOrb(ctx, size, time, energy) {
  const c = size/2, r = size*.295;
  ctx.save();
  const sphere = ctx.createRadialGradient(c-r*.28,c-r*.38,0,c,c,r);
  sphere.addColorStop(0,'rgba(107,129,160,.12)'); sphere.addColorStop(.72,'rgba(17,26,47,.08)'); sphere.addColorStop(.96,'rgba(91,133,164,.16)'); sphere.addColorStop(1,'rgba(219,239,251,.28)');
  ctx.fillStyle=sphere; ctx.beginPath();ctx.arc(c,c,r,0,TAU);ctx.fill();
  const a=time*.13, ca=Math.cos(a), sa=Math.sin(a), tilt=.34;
  const projected=stars.map(([x,y,z],i)=>{
    const rx=x*ca+z*sa, rz=z*ca-x*sa, ry=y*Math.cos(tilt)-rz*Math.sin(tilt), depth=rz*Math.cos(tilt)+y*Math.sin(tilt);
    const lens=1+depth*.08;
    return { x:c+rx*r*lens, y:c+ry*r*lens, z:depth, i };
  });
  for (const [i,j] of links) {
    const a=projected[i],b=projected[j], depth=(a.z+b.z+2)/4;
    ctx.strokeStyle=`rgba(181,211,225,${.025+depth*.16})`;ctx.lineWidth=Math.max(.45,size*.0018);
    ctx.beginPath();ctx.moveTo(a.x,a.y);ctx.lineTo(b.x,b.y);ctx.stroke();
  }
  // A travelling sound wave lights stars without ballooning the whole sphere.
  const wave=Math.sin(time*2.1)*.8;
  for(const p of [...projected].sort((a,b)=>a.z-b.z)) {
    const depth=(p.z+1)/2, pulse=Math.exp(-(((stars[p.i][1]-wave)*5)**2))*energy;
    const radius=Math.max(.45,size*.0026)*( .45+depth*1.05+pulse*.7 );
    ctx.globalAlpha=.18+depth*.78;
    ctx.fillStyle=p.i%9===0?'#ffe7bd':'#d4eaff';
    if(depth>.65 && (p.i%9===0 || pulse>.5)) {
      const glow=ctx.createRadialGradient(p.x,p.y,0,p.x,p.y,radius*5);
      glow.addColorStop(0,'rgba(220,239,255,.35)');glow.addColorStop(1,'rgba(170,213,255,0)');ctx.fillStyle=glow;ctx.fillRect(p.x-radius*5,p.y-radius*5,radius*10,radius*10);ctx.fillStyle='#f5faff';
      ctx.strokeStyle='rgba(224,242,255,.42)';ctx.lineWidth=.5;ctx.beginPath();ctx.moveTo(p.x-radius*3,p.y);ctx.lineTo(p.x+radius*3,p.y);ctx.moveTo(p.x,p.y-radius*3);ctx.lineTo(p.x,p.y+radius*3);ctx.stroke();
    }
    ctx.beginPath();ctx.arc(p.x,p.y,radius,0,TAU);ctx.fill();
  }
  ctx.globalAlpha=.45;ctx.strokeStyle='#e2f4ff';ctx.lineWidth=Math.max(.6,size*.002);
  ctx.beginPath();ctx.ellipse(c,c,r*.98,r*.98,0,3.65,4.8);ctx.stroke();
  ctx.restore();
}

export function drawRippleOrb(ctx,size,time,energy) {
  const c=size/2, r=size*.245;
  ctx.save();
  // Fine wavefronts on a tilted pool, beneath a luminous nacre lens.
  for(let i=7;i>=0;i--) {
    const phase=(time*.17+i/8)%1, radius=size*(.19+phase*.24);
    ctx.lineWidth=Math.max(.5,size*.002)*(1-phase*.65);
    ctx.strokeStyle=`rgba(197,224,234,${(1-phase)*(.12+energy*.16)})`;
    ctx.beginPath();ctx.ellipse(c,c+r*.63,radius,radius*.33,-.14,0,TAU);ctx.stroke();
  }
  const body=ctx.createRadialGradient(c-r*.3,c-r*.4,r*.02,c,c,r);
  body.addColorStop(0,'rgba(255,252,237,.91)');body.addColorStop(.25,'rgba(202,227,228,.76)');body.addColorStop(.54,'rgba(147,166,186,.66)');body.addColorStop(.76,'rgba(60,81,112,.79)');body.addColorStop(.9,'rgba(199,193,199,.72)');body.addColorStop(.98,'rgba(229,244,247,.94)');body.addColorStop(1,'rgba(97,129,158,.18)');
  ctx.beginPath();ctx.ellipse(c,c,r*(1+energy*.035),r*(1-energy*.025),-.2,0,TAU);ctx.fillStyle=body;ctx.fill();ctx.clip();
  for(let i=0;i<11;i++) {
    ctx.beginPath();
    for(let j=0;j<=64;j++) {
      const x=c-r+j/64*r*2;
      const y=c-r+i*r*.21+Math.sin(j/64*4+time*.35+i*.21)*r*(.12+energy*.07);
      if(!j)ctx.moveTo(x,y);else ctx.lineTo(x,y);
    }
    ctx.strokeStyle=i%3===0?'rgba(255,235,220,.25)':'rgba(211,244,245,.13)';ctx.lineWidth=size*.003;ctx.stroke();
  }
  const highlight=ctx.createRadialGradient(c-r*.36,c-r*.5,0,c-r*.36,c-r*.5,r*.34);
  highlight.addColorStop(0,'rgba(255,255,255,.82)');highlight.addColorStop(.4,'rgba(255,255,255,.16)');highlight.addColorStop(1,'rgba(255,255,255,0)');ctx.fillStyle=highlight;ctx.fillRect(c-r,c-r,2*r,2*r);
  ctx.restore();
}
