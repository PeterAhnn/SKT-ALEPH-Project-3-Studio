return await (async()=>{
  // Run only on a fresh, dedicated QA origin with no v2 workspace.
  const {DEFAULT}=await import('/core.js'),{readRawWorkspace}=await import('/storage.js');
  if(await readRawWorkspace())throw Error('fresh QA origin required');
  const c=document.createElement('canvas');c.width=240;c.height=320;const x=c.getContext('2d');x.fillStyle='#baace3';x.fillRect(0,0,240,320);
  const current={...DEFAULT,headline:'이전 작업 유지',image:c.toDataURL('image/jpeg')};
  const raw=JSON.stringify({version:1,current,templates:[1,2,3].map(n=>({id:'legacy-'+n,name:'이전 템플릿 '+n,state:{...current}}))});
  localStorage.setItem('jjal-studio-v1',raw);sessionStorage.setItem('audit-legacy-original',raw);
  return {seeded:true,next:'reload then run migration-check-browser.js'};
})()
