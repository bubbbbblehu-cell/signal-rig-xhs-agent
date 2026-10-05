import { BoxGeometry, DataTexture, Group, Mesh, MeshStandardMaterial, RepeatWrapping, RGBAFormat, type Object3D } from 'three';


function boardSurface() {
  const size = 128;
  const pixels = new Uint8Array(size * size * 4);
  let seed = 7049;
  for (let y = 0; y < size; y++) for (let x = 0; x < size; x++) {
    seed = (seed * 16807) % 2147483647;
    // Fine woven substrate with small, irregular solder-mask variation.
    const weave = (x % 4 === 0 ? 6 : 0) + (y % 4 === 0 ? 5 : 0);
    const value = Math.round(214 + (seed / 2147483647 - .5) * 24 + weave);
    const offset = (y * size + x) * 4;
    pixels.set([value, value, value, 255], offset);
  }
  const texture = new DataTexture(pixels, size, size, RGBAFormat);
  texture.wrapS = texture.wrapT = RepeatWrapping;
  texture.repeat.set(3, 5);
  texture.needsUpdate = true;
  return texture;
}

// The Blender export is the structural master; this exhibition treatment adds
// small components and sets the opening view without duplicating its textures.
export function refineRig(scene: Object3D) {

  const surface = boardSurface();
  const board = new MeshStandardMaterial({
    color: '#26332d', roughness: .96, metalness: 0,
    roughnessMap: surface, bumpMap: surface, bumpScale: .002,
    envMapIntensity: .22,
  });
  const chip = new MeshStandardMaterial({ color: '#181d20', roughness: .84 });
  const trace = new MeshStandardMaterial({ color: '#857553', roughness: .52, metalness: .7 });
  const solder = new MeshStandardMaterial({ color: '#a7aaa4', roughness: .4, metalness: .85 });
  const silkscreen = new MeshStandardMaterial({ color: '#a5a898', roughness: .95, metalness: 0 });
  const substrate = new MeshStandardMaterial({ color: '#494636', roughness: .9 });
  const box = new BoxGeometry(1, 1, 1);
  const addPart = (parent: Object3D, name: string, position: [number, number, number], size: [number, number, number], material: MeshStandardMaterial) => {
    const part = new Mesh(box, material);
    part.name = name;
    part.position.set(...position);
    part.scale.set(...size);
    parent.add(part);
  };
  scene.traverse((object) => {
    const mesh = object as Mesh;
    if (!mesh.isMesh) return;
    if (mesh.name.endsWith('_label')) mesh.visible = false;
    if (mesh.name.includes('_clip_')) mesh.scale.set(.65, .7, .8);
    if (mesh.name.includes('_clear_lens')) mesh.visible = false;
    const joint = mesh.name.match(/^(.*)_(clear_washer|collar_top|collar_bottom|signal_pin|bolt_.*)$/);
    if (joint) {
      const center = scene.getObjectByName(`${joint[1]}_clear_washer`);
      if (center) {
        const anchor = center.position.clone();
        mesh.position.sub(anchor).multiplyScalar(.6).add(anchor);
        mesh.scale.multiplyScalar(.6);
      }
    }
    if (mesh.name.endsWith('_pcb')) mesh.scale.z = .65;
    const materials = Array.isArray(mesh.material) ? mesh.material : [mesh.material];
    materials.forEach((raw) => {
      const material = raw as MeshStandardMaterial;
      switch (material.name) {
        case 'Pearl silver circuit board':
          material.color.set('#2b3932');
          material.metalness = 0; material.roughness = .96;
          material.roughnessMap = surface; material.bumpMap = surface;
          material.bumpScale = .002; material.envMapIntensity = .22;
          break;
        case 'Matte silver cable jacket':
          material.color.set('#181d20'); material.metalness = .05; material.roughness = .78; break;
        case 'Machined structural aluminum':
          material.color.set('#606a70'); material.metalness = .8; material.roughness = .4; break;
        case 'Optical clear acrylic':
          material.opacity = .045; material.depthWrite = false; material.roughness = .1; break;
        case 'White silver display light':
          material.emissiveIntensity = .35; break;
      }
      if (material.name.endsWith('_project_image')) {

        // Screens retain readable image contrast under the gallery lighting.
        material.color.set('#333333'); material.emissive.set('#ffffff');
        material.emissiveIntensity = .82; material.roughness = .65;
        material.toneMapped = false;
      }
    });
  });
  const openingAngles: Record<string, number> = { KELI: 2.55, POETRY: 2.92, WORKSHOP: 3.35, SIGNAL: 3.7 };
  for (const name of ['KELI', 'POETRY', 'WORKSHOP', 'SIGNAL', 'BUBBLE_OS', 'PHOTO', 'PLAYGROUND', 'ABOUT']) {
    const root = scene.getObjectByName(name);
    if (!root) continue;
    if (openingAngles[name]) root.rotation.set(.05, openingAngles[name], name === 'POETRY' ? -.06 : .035);
    const display = scene.getObjectByName(`${name}_display`) as Mesh;
    display.geometry.computeBoundingBox();
    const bounds = display.geometry.boundingBox!;
    const width = bounds.max.x - bounds.min.x;
    const height = bounds.max.y - bounds.min.y;
    // The rear of each LCD reveals its driver board instead of a blank plate.
    addPart(root, `${name}_driver_board`, [0, 0, -.04], [width * .78, height * .66, .025], board);
    addPart(root, `${name}_processor`, [-width * .12, .08, -.07], [.29, .32, .035], chip);
    for (let i = 0; i < 7; i++) {
      const y = (i - 3) * height * .072;
      addPart(root, `${name}_copper_route_${i}`, [width * .15, y, -.056], [width * .34, .009, .005], trace);
      addPart(root, `${name}_contact_${i}`, [width * .35, y, -.065], [.06, .028, .018], trace);
      addPart(root, `${name}_solder_${i}`, [-width * .22, y, -.065], [.055, .025, .016], solder);
    }
    addPart(root, `${name}_laminate_edge`, [0, -height * .33, -.04], [width * .78, .013, .025], substrate);
    addPart(root, `${name}_board_mark`, [-width * .27, height * .25, -.056], [.14, .012, .003], silkscreen);
    addPart(root, `${name}_board_mark_short`, [-width * .29, height * .22, -.056], [.08, .012, .003], silkscreen);
    // Small connector banks, visible on both sides of the outboard PCB.
    const pcb = scene.getObjectByName(`${name}_pcb`);
    if (pcb) for (let i = 0; i < 5; i++) {
      addPart(root, `${name}_socket_${i}`, [pcb.position.x, pcb.position.y + (i - 2) * .15, -.11], [.16, .08, .04], chip);
      addPart(root, `${name}_pin_${i}`, [pcb.position.x + .17, pcb.position.y + (i - 2) * .15, -.11], [.08, .025, .035], trace);
      addPart(root, `${name}_solder_pad_${i}`, [pcb.position.x - .12, pcb.position.y + (i - 2) * .15, -.12], [.04, .026, .012], solder);
      addPart(root, `${name}_silkscreen_${i}`, [pcb.position.x - .2, pcb.position.y + (i - 2) * .15, -.13], [.06, .009, .004], silkscreen);
    }
    // Scale populated boards as assemblies so their chips and solder stay attached.
    const rearParts = root.children.filter((part) => /_(driver_board|processor|copper_route_\d+|contact_\d+|solder_\d+|laminate_edge|board_mark.*)$/.test(part.name));
    const rear = new Group(); rear.name = `${name}_compact_driver`;
    root.add(rear);
    for (const part of rearParts) rear.add(part);
    rear.scale.set(.72, .72, 1);
    if (pcb) {
      const center = pcb.position.clone();
      const parts = root.children.filter((part) => /_(pcb|chip_\d+|status|socket_\d+|pin_\d+|solder_pad_\d+|silkscreen_\d+)$/.test(part.name));
      const side = new Group(); side.name = `${name}_compact_side_board`;
      side.position.copy(center); root.add(side);
      for (const part of parts) { part.position.sub(center); side.add(part); }
      side.scale.set(.7, .7, 1);
    }
  }
  return scene;
}
