"""Convert original Blender GLB to offline JS data; no runtime file/network loader."""
import base64,json,struct,pathlib,gzip
root=pathlib.Path(__file__).resolve().parents[1]
b=gzip.decompress((root/'references/signal-rig-geometry.glb.gz').read_bytes())
n=struct.unpack_from('<I',b,12)[0];g=json.loads(b[20:20+n]);data=b[28+n:]
# Preserve vertices, hierarchy and UVs, but exclude all original personal images.
access=[];dedup={};chunks=[]
for a in g['accessors']:
 v=g['bufferViews'][a['bufferView']];off=v.get('byteOffset',0)+a.get('byteOffset',0)
 size={'SCALAR':1,'VEC2':2,'VEC3':3,'VEC4':4}[a['type']]
 width={5126:4,5125:4,5123:2,5121:1}[a['componentType']]
 assert 'byteStride' not in v, 'Interleaved data needs unpacking'
 raw=data[off:off+a['count']*size*width]
 key=(a['componentType'],raw)
 if key not in dedup:
  dedup[key]=len(chunks); chunks.append(base64.b64encode(raw).decode())
 access.append({'chunk':dedup[key],'type':a['componentType'],'size':size,'normalized':a.get('normalized',False)})
materials=[]
for m in g['materials']:
 p=m.get('pbrMetallicRoughness',{})
 materials.append({'name':m['name'],'color':p.get('baseColorFactor',[1,1,1,1]),'metalness':p.get('metallicFactor',1),'roughness':p.get('roughnessFactor',1)})
asset={'nodes':g['nodes'],'meshes':g['meshes'],'accessors':access,'materials':materials,'roots':g['scenes'][g.get('scene',0)]['nodes']}
out=root/'dist';out.mkdir(exist_ok=True)
(out/'rig.js').write_text('window.RIG_ASSET='+json.dumps(asset,separators=(',',':'))+';window.RIG_BUFFERS=[];')
parts=[];part='';start=0
for i,c in enumerate(chunks):
 line=f'window.RIG_BUFFERS[{i}]="{c}";\n'
 if len(part)+len(line)>700000 and part:
  name=f'rig-data-{len(parts)}.js';(out/name).write_text(part);parts.append(name);part=''
 part+=line
if part:
 name=f'rig-data-{len(parts)}.js';(out/name).write_text(part);parts.append(name)
(out/'rig-scripts.json').write_text(json.dumps(['rig.js']+parts))
print(f'Original model: {len(g["nodes"])} nodes, {len(chunks)} unique buffers, {len(parts)} offline data chunks')
