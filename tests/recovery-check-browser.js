return await (async()=>{
  const $=id=>document.getElementById(id),{readRawWorkspace,readWorkspace}=await import('/storage.js');
  const wait=async()=>{for(let i=0;i<700;i++){if(!$('download').disabled)return;await new Promise(r=>setTimeout(r,25))}throw Error('timeout')};
  await wait();const results=[],damaged=JSON.parse(sessionStorage.getItem('audit-damaged-v2'));
  const originalURL=URL.createObjectURL,originalClick=HTMLAnchorElement.prototype.click;let blob;
  try{
    URL.createObjectURL=b=>{blob=b;return originalURL.call(URL,b)};HTMLAnchorElement.prototype.click=function(){};
    results.push({label:'손상 시 정상 백업 차단·복구 안내',pass:$('backup').disabled&&!$('recovery-note').hidden&&!$('recovery-download').disabled});
    $('recovery-download').click();const recovered=JSON.parse(await blob.text());
    results.push({label:'손상 원본의 템플릿·사진 그대로 다운로드',pass:JSON.stringify(recovered)===JSON.stringify(damaged)&&recovered.templates.length===3});
    results.push({label:'원본 저장 자료 무변경',pass:JSON.stringify(await readRawWorkspace())===JSON.stringify(damaged)});
    const dt=new DataTransfer();dt.items.add(new File([sessionStorage.getItem('audit-good-v2')],'recovery.json',{type:'application/json'}));$('restore').files=dt.files;$('restore').dispatchEvent(new Event('change',{bubbles:true}));await wait();$('restore-apply').click();await wait();
    results.push({label:'정상 백업으로 복구 후 저장·백업 재개',pass:(await readWorkspace()).templates.length===3&&!$('backup').disabled&&$('recovery-note').hidden});
    return {at:new Date().toISOString(),url:location.href,results};
  }finally{URL.createObjectURL=originalURL;HTMLAnchorElement.prototype.click=originalClick}
})()
