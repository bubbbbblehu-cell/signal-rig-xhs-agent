// Official MiniTool bridge only; no publishing and no raw native messages.
export async function saveImage(dataUri,mini){
 if(!mini||typeof mini.saveImageToPhotosAlbum!=='function')return {saved:false,reason:'browser'};
 let filePath=dataUri;
 if(typeof mini.writeTempFile==='function'){
  const result=await mini.writeTempFile({data:dataUri});
  if(!result||typeof result.filePath!=='string'||!result.filePath)throw new Error('Image file was not created');
  filePath=result.filePath;
 }
 await mini.saveImageToPhotosAlbum({filePath});
 return {saved:true};
}
