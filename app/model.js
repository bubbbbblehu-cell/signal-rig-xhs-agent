import {Group,Mesh,BufferGeometry,BufferAttribute,MeshStandardMaterial,Color} from 'three';
import {refineRig} from './refine-rig';
export const CHANNELS=['KELI','POETRY','WORKSHOP','SIGNAL','BUBBLE_OS','PHOTO','PLAYGROUND','ABOUT'];
export function restoreRig(){
 const asset=window.RIG_ASSET, buffers=window.RIG_BUFFERS;
 const arrays=buffers.map(value=>{const raw=atob(value),bytes=new Uint8Array(raw.length);for(let i=0;i<raw.length;i++)bytes[i]=raw.charCodeAt(i);return bytes.buffer;});
 const types={5126:Float32Array,5125:Uint32Array,5123:Uint16Array,5121:Uint8Array};
 const attrs=asset.accessors.map(a=>new BufferAttribute(new types[a.type](arrays[a.chunk]),a.size,a.normalized));
 const materials=asset.materials.map(m=>{const v=new MeshStandardMaterial({color:new Color().fromArray(m.color),metalness:m.metalness,roughness:m.roughness,transparent:m.color[3]<1,opacity:m.color[3]});v.name=m.name;return v;});
 const meshes=asset.meshes.map(m=>m.primitives.map(p=>{const g=new BufferGeometry();for(const key in p.attributes){const name={POSITION:'position',NORMAL:'normal',TEXCOORD_0:'uv'}[key];if(name)g.setAttribute(name,attrs[p.attributes[key]]);}g.setIndex(attrs[p.indices]);g.computeBoundingBox();return new Mesh(g,materials[p.material]);}));
 const nodes=asset.nodes.map(n=>{let o=n.mesh===undefined?new Group():meshes[n.mesh][0];o.name=n.name||'';if(n.translation)o.position.fromArray(n.translation);if(n.rotation)o.quaternion.fromArray(n.rotation);if(n.scale)o.scale.fromArray(n.scale);return o;});
 asset.nodes.forEach((n,i)=>(n.children||[]).forEach(c=>nodes[i].add(nodes[c])));
 const scene=new Group();asset.roots.forEach(i=>scene.add(nodes[i]));
 refineRig(scene);
 scene.traverse(o=>{if(o.isMesh&&['Satin aluminum','Machined structural aluminum','Silver circuit traces'].includes(o.material.name)){o.material.metalness=.6;o.material.roughness=.43;}});
 window.RIG_ASSET=null;window.RIG_BUFFERS=null;
 return scene;
}
