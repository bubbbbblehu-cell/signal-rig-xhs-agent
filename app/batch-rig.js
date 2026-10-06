import {Mesh} from 'three';
import {mergeGeometries} from 'three/examples/jsm/utils/BufferGeometryUtils.js';

// Bake stationary hardware into material batches; keep the original hierarchy
// for hit testing, and keep the eight photo surfaces independently editable.
export function batchStaticRig(model){
 model.updateMatrixWorld(true);
 const groups=new Map();
 model.traverseVisible(mesh=>{
  if(!mesh.isMesh||mesh.name.endsWith('_project_photo'))return;
  const material=mesh.material;
  if(!groups.has(material))groups.set(material,[]);
  groups.get(material).push(mesh);
 });
 for(const [material,meshes] of groups){
  if(meshes.length<2)continue;
  const parts=meshes.map(mesh=>{
   const g=mesh.geometry.index?mesh.geometry.toNonIndexed():mesh.geometry.clone();
   g.applyMatrix4(mesh.matrixWorld);
   // All hardware uses positions/normals/UVs; remove optional export attributes.
   for(const key of Object.keys(g.attributes))if(!['position','normal','uv'].includes(key))g.deleteAttribute(key);
   return g;
  });
  const geometry=mergeGeometries(parts,false);
  parts.forEach(g=>g.dispose());
  if(!geometry)continue;
  // Matrices above are world-space; convert back into the model's local space.
  geometry.applyMatrix4(model.matrixWorld.clone().invert());
  const batch=new Mesh(geometry,material);batch.name='hardware_batch';batch.userData.renderBatch=true;
  model.add(batch);
  meshes.forEach(mesh=>{mesh.visible=false;mesh.userData.batchSource=true;});
 }
}
