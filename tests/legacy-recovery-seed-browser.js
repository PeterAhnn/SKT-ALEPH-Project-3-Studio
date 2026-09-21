return await (async()=>{
  // Destructive fixture setup: dedicated local QA origin only.
  if(location.hostname!=='127.0.0.1')throw Error('local QA only');
  const {DB_NAME}=await import('/storage.js'),original=localStorage.getItem('jjal-studio-v1');
  if(!original)throw Error('run migration fixture first');
  sessionStorage.setItem('audit-legacy-good',original);const damaged=JSON.parse(original);delete damaged.templates[0].state.caption;
  const raw=JSON.stringify(damaged);sessionStorage.setItem('audit-legacy-damaged',raw);localStorage.setItem('jjal-studio-v1',raw);
  await new Promise((resolve,reject)=>{const r=indexedDB.open(DB_NAME,1);r.onsuccess=()=>{const db=r.result,tx=db.transaction(['workspace','images'],'readwrite');tx.objectStore('workspace').clear();tx.objectStore('images').clear();tx.oncomplete=()=>{db.close();resolve()};tx.onerror=()=>reject(tx.error)}});
  return {seeded:true,next:'reload then run legacy-recovery-check-browser.js'};
})()
