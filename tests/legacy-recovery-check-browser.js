return await (async()=>{
  const $=id=>document.getElementById(id),{readRawWorkspace}=await import('/storage.js'),originalURL=URL.createObjectURL,originalClick=HTMLAnchorElement.prototype.click;let blob;
  for(let i=0;i<500&&$('download').disabled;i++)await new Promise(r=>setTimeout(r,25));
  try{
    URL.createObjectURL=b=>{blob=b;return originalURL.call(URL,b)};HTMLAnchorElement.prototype.click=function(){};
    $('recovery-download').click();const downloaded=await blob.text(),raw=sessionStorage.getItem('audit-legacy-damaged');
    return {at:new Date().toISOString(),url:location.href,results:[
      {label:'손상된 이전 데이터는 빈 백업 생성 차단',pass:$('backup').disabled&&!$('recovery-download').disabled},
      {label:'이전 손상 원본 정확한 문자열 다운로드',pass:downloaded===raw&&JSON.parse(downloaded).templates.length===3},
      {label:'이전 저장소 원본 보존',pass:localStorage.getItem('jjal-studio-v1')===raw},
      {label:'이전 실패 시 새 저장소에 부분 기록 없음',pass:await readRawWorkspace()===null}
    ]};
  }finally{URL.createObjectURL=originalURL;HTMLAnchorElement.prototype.click=originalClick}
})()
