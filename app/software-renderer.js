import {Vector3,Matrix4,Vector2} from 'three';
// Canvas fallback projects the ORIGINAL mesh triangles, preserving the actual rig.
// No network, WebGL, WASM, worker or substitute illustration is needed.
export class SoftwareRenderer {
 constructor(){this.domElement=document.createElement('canvas');this.ctx=this.domElement.getContext('2d');this.ratio=1;this.size=new Vector2(1,1);this.cache=new WeakMap();this.isSoftwareRenderer=true;}
 setPixelRatio(r){this.ratio=r;}
 getPixelRatio(){return this.ratio;}
 getSize(out){return out.copy(this.size);}
 setSize(w,h,style=true){this.size.set(w,h);this.domElement.width=Math.round(w*this.ratio);this.domElement.height=Math.round(h*this.ratio);if(style){this.domElement.style.width=w+'px';this.domElement.style.height=h+'px';}}
 dispose(){}
 render(scene,camera){
  const ctx=this.ctx,w=this.domElement.width,h=this.domElement.height;ctx.clearRect(0,0,w,h);scene.updateMatrixWorld(true);camera.updateMatrixWorld(true);camera.matrixWorldInverse.copy(camera.matrixWorld).invert();
  const vp=new Matrix4().multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse),faces=[];
  scene.traverseVisible(mesh=>{if(!mesh.isMesh)return;const mat=mesh.material;if(mat.transparent&&mat.opacity<.1)return;const geo=mesh.geometry,pos=geo.attributes.position,index=geo.index,uv=geo.attributes.uv;if(!pos)return;
   const matrix=new Matrix4().multiplyMatrices(vp,mesh.matrixWorld),v=new Vector3(),points=[];
   for(let i=0;i<pos.count;i++){v.fromBufferAttribute(pos,i).applyMatrix4(matrix);points.push([(v.x*.5+.5)*w,(-v.y*.5+.5)*h,v.z]);}
   const meshDepth=points.reduce((sum,p)=>sum+p[2],0)/points.length;const n=index?index.count:pos.count;
   for(let i=0;i<n;i+=3){const ia=index?index.getX(i):i,ib=index?index.getX(i+1):i+1,ic=index?index.getX(i+2):i+2,a=points[ia],b=points[ib],c=points[ic];if(a[2]>1||b[2]>1||c[2]>1)continue;const area=(b[0]-a[0])*(c[1]-a[1])-(b[1]-a[1])*(c[0]-a[0]);if(area>=0&&mat.side!==2)continue;
    if(Math.abs(area)<.12)continue;let shade=1;
    if(!mat.isMeshBasicMaterial){const pa=new Vector3().fromBufferAttribute(pos,ia).applyMatrix4(mesh.matrixWorld),pb=new Vector3().fromBufferAttribute(pos,ib).applyMatrix4(mesh.matrixWorld),pc=new Vector3().fromBufferAttribute(pos,ic).applyMatrix4(mesh.matrixWorld);const normal=pb.sub(pa).cross(pc.sub(pa)).normalize();shade=.42+.56*Math.max(0,normal.dot(new Vector3(.4,.7,.6).normalize()))+.22*Math.max(0,normal.dot(new Vector3(-.7,.1,.5).normalize()));}
    const col=mat.color.clone().convertLinearToSRGB();const fill='rgba('+[col.r,col.g,col.b].map(v=>Math.min(255,Math.round(v*255*shade))).join(',')+','+mat.opacity+')';
    const image=mat.map&&mat.map.image;faces.push({a,b,c,z:meshDepth,fill,image,uv:image&&uv?[[uv.getX(ia)*image.width,uv.getY(ia)*image.height],[uv.getX(ib)*image.width,uv.getY(ib)*image.height],[uv.getX(ic)*image.width,uv.getY(ic)*image.height]]:null});
   }
  });
  faces.sort((a,b)=>b.z-a.z);
  for(const f of faces){const [a,b,c]=[f.a,f.b,f.c];ctx.beginPath();ctx.moveTo(a[0],a[1]);ctx.lineTo(b[0],b[1]);ctx.lineTo(c[0],c[1]);ctx.closePath();if(f.image&&f.uv){const [p,q,r]=f.uv,den=p[0]*(q[1]-r[1])+q[0]*(r[1]-p[1])+r[0]*(p[1]-q[1]);if(!den)continue;const A=(a[0]*(q[1]-r[1])+b[0]*(r[1]-p[1])+c[0]*(p[1]-q[1]))/den,B=(a[1]*(q[1]-r[1])+b[1]*(r[1]-p[1])+c[1]*(p[1]-q[1]))/den,C=(a[0]*(r[0]-q[0])+b[0]*(p[0]-r[0])+c[0]*(q[0]-p[0]))/den,D=(a[1]*(r[0]-q[0])+b[1]*(p[0]-r[0])+c[1]*(q[0]-p[0]))/den,E=a[0]-A*p[0]-C*p[1],F=a[1]-B*p[0]-D*p[1];ctx.save();ctx.clip();ctx.setTransform(A,B,C,D,E,F);ctx.drawImage(f.image,0,0);ctx.restore();}else{ctx.fillStyle=f.fill;ctx.fill();}}
 }
}
