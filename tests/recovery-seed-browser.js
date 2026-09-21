return await (async()=>{
  const {DB_NAME,readRawWorkspace}=await import('/storage.js');
  const original=await readRawWorkspace();sessionStorage.setItem('audit-good-v2',JSON.stringify(original));
  delete original.templates[0].state.caption;
  sessionStorage.setItem('audit-damaged-v2',JSON.stringify(original));
  const {images,...meta}=original;
  await new Promise((resolve,reject)=>{const r=indexedDB.open(DB_NAME,1);r.onsuccess=()=>{const db=r.result,tx=db.transaction('workspace','readwrite');tx.objectStore('workspace').put(meta,'current');tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>reject(tx.error)}});
  return {seeded:true,next:'reload then run recovery-check-browser.js'};
})()
