// Each selected file occupies one slot; empty slots are preferred for batches.
export function placePhotos(current, photos, target, batch, ratios) {
 const next=current.slice();
 if(!batch){if(photos.length)next[target]=photos[0];return next;}
 const empty=[],filled=[];
 next.forEach((photo,i)=>(photo?filled:empty).push(i));
 for(const photo of photos.slice(0,next.length)){
  const candidates=empty.length?empty:filled;
  let best=0;
  candidates.forEach((slot,i)=>{if(Math.abs(Math.log(photo.width/photo.height/ratios[slot]))<Math.abs(Math.log(photo.width/photo.height/ratios[candidates[best]])))best=i;});
  next[candidates.splice(best,1)[0]]=photo;
 }
 return next;
}
