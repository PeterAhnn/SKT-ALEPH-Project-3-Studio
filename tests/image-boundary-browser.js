return await (async()=>{
  const $=id=>document.getElementById(id),{readWorkspace}=await import('/storage.js'),results=[];
  const wait=async()=>{for(let i=0;i<1600;i++){if(!$('download').disabled&&!/저장 중|대기 중/.test($('save-status').textContent))return;await new Promise(r=>setTimeout(r,25))}throw Error('timeout')};
  const upload=async file=>{const dt=new DataTransfer();dt.items.add(file);$('upload').files=dt.files;$('upload').dispatchEvent(new Event('change',{bubbles:true}));await wait()};
  await wait();const c=document.createElement('canvas');c.width=6000;c.height=4000;const x=c.getContext('2d');x.fillStyle='#6b5895';x.fillRect(0,0,c.width,c.height);
  const blob=await new Promise(r=>c.toBlob(r,'image/png')),start=performance.now();await upload(new File([blob],'24mp.png',{type:'image/png'}));const elapsed=performance.now()-start;
  const saved=await readWorkspace(),image=new Image();image.src=saved.current.image;await image.decode();
  results.push({label:'24MP 합성 PNG 허용·긴 변 1920 정규화',pass:image.width===1920&&image.height===1280,elapsedMs:Math.round(elapsed),fileBytes:blob.size});
  const before=JSON.stringify(saved),pixels=$('canvas').toDataURL(),tooLarge=new Uint8Array(await blob.arrayBuffer());new DataView(tooLarge.buffer).setUint32(16,6001);
  await upload(new File([tooLarge],'over24mp.png',{type:'image/png'}));results.push({label:'24MP 초과는 기존 작업·미리보기 보존',pass:JSON.stringify(await readWorkspace())===before&&$('canvas').toDataURL()===pixels&&$('status').classList.contains('error')});
  return {at:new Date().toISOString(),url:location.href,results,note:'이 데스크톱 Chromium의 합성 이미지 측정이며 모바일 성능 보증이 아님'};
})()
