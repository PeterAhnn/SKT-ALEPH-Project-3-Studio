return await (async()=>{
  const {readWorkspace,readRawWorkspace}=await import('/storage.js');
  for(let i=0;i<500&&document.getElementById('download').disabled;i++)await new Promise(r=>setTimeout(r,25));
  const doc=await readWorkspace(),raw=await readRawWorkspace();
  const results=[
    {label:'이전 템플릿 3개·문구 자동 이전',pass:doc?.templates.length===3&&doc.current.headline==='이전 작업 유지'},
    {label:'이전 원본 문자열 그대로 보존',pass:localStorage.getItem('jjal-studio-v1')===sessionStorage.getItem('audit-legacy-original')},
    {label:'사진 중복 제거 및 PNG 정규화',pass:raw.images.length===1&&doc.current.image.startsWith('data:image/png;')},
    {label:'편집기 복원 완료',pass:document.getElementById('headline').value==='이전 작업 유지'&&!document.getElementById('backup').disabled}
  ];
  return {at:new Date().toISOString(),url:location.href,results};
})()
