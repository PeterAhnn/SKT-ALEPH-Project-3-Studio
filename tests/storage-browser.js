return await (async()=>{
  const $=id=>document.getElementById(id),results=[];
  const {readWorkspace,readRawWorkspace,unpackBackup}=await import('/storage.js');
  const {DEFAULT}=await import('/core.js');
  const check=(label,pass,detail='')=>{results.push({label,result:pass?'PASS':'FAIL',detail});if(!pass)throw Error(label)};
  const wait=async()=>{for(let i=0;i<1600;i++){if(!$('download').disabled&&!/저장 중|대기 중/.test($('save-status').textContent))return;await new Promise(r=>setTimeout(r,25))}throw Error('save timeout')};
  const upload=async(file,id)=>{const dt=new DataTransfer();dt.items.add(file);$(id).files=dt.files;$(id).dispatchEvent(new Event('change',{bubbles:true}));await wait()};
  const restore=async raw=>{await upload(new File([raw],'audit.json',{type:'application/json'}),'restore');$('restore-apply').click();await wait()};
  const input=(id,value)=>{$(id).value=value;$(id).dispatchEvent(new Event('input',{bubbles:true}))};
  const oldURL=URL.createObjectURL,oldClick=HTMLAnchorElement.prototype.click,oldConfirm=window.confirm;let lastBlob;
  URL.createObjectURL=b=>{lastBlob=b;return oldURL.call(URL,b)};HTMLAnchorElement.prototype.click=function(){};window.confirm=()=>true;
  try{
    await wait();await restore(JSON.stringify({version:1,current:{...DEFAULT},templates:[]}));
    for(let n=1;n<=3;n++){
      const c=document.createElement('canvas');c.width=1200;c.height=1200;const x=c.getContext('2d'),d=x.createImageData(1200,1200);let seed=n*123;
      for(let i=0;i<d.data.length;i+=4){for(let k=0;k<3;k++){seed=(Math.imul(seed,1664525)+1013904223)>>>0;d.data[i+k]=seed>>>24}d.data[i+3]=255}x.putImageData(d,0,0);
      const blob=await new Promise(r=>c.toBlob(r,'image/jpeg',.92));await upload(new File([blob],'photo.jpg',{type:'image/jpeg'}),'upload');
      input('template-name','사진 '+n);$('save-template').click();await wait();
      check('큰 JPEG 템플릿 '+n+' 저장',(await readWorkspace()).templates.length===n,`${blob.size} bytes / 1200x1200`);
    }
    let raw=await readRawWorkspace();check('사진 3개가 별도 자산으로 저장',raw.images.length===3&&raw.current.image.startsWith('image-'));
    input('template-name','같은 사진 재사용');$('save-template').click();await wait();raw=await readRawWorkspace();
    check('같은 사진 중복 저장 없음',raw.templates.length===4&&raw.images.length===3);
    document.querySelectorAll('.template .load')[0].click();await wait();input('headline','사진 템플릿 수정');input('template-name','수정한 사진');$('update-template').click();await wait();
    check('사진 템플릿 수정 유지',(await readWorkspace()).templates[0].state.headline==='사진 템플릿 수정');
    document.querySelectorAll('.template .delete')[3].click();await wait();check('선택한 항목만 삭제',(await readWorkspace()).templates.length===3);
    const expected=$('canvas').getContext('2d').getImageData(0,0,1080,1080).data;
    for(let round=1;round<=2;round++){
      $('backup').click();await wait();const backup=await lastBlob.text(),packed=JSON.parse(backup);
      check('백업 '+round+'도 사진 중복 제거',packed.version===2&&packed.images.length===3);
      await restore(backup);const actual=$('canvas').getContext('2d').getImageData(0,0,1080,1080).data;
      check('JPEG 출발 이미지 복원 '+round+' 전체 픽셀 일치',actual.length===expected.length&&actual.every((v,i)=>v===expected[i]));
    }
    check('작업 이미지 무손실 PNG 보관',(await readWorkspace()).current.image.startsWith('data:image/png;'));
    input('headline','가\n'.repeat(80));await wait();check('극단 문구 보존과 실제 크기 경고',(await readWorkspace()).current.headline.length===160&&!$('text-warning').hidden&&$('text-warning').textContent.includes('3px')&&$('text-warning').textContent.includes('읽기 어려워요'));
    input('headline','사진 템플릿 수정');await wait();
    return {at:new Date().toISOString(),url:location.href,results,reloadExpected:{headline:'사진 템플릿 수정',templates:3,images:3}};
  }catch(e){return {at:new Date().toISOString(),url:location.href,results,error:e.message}}finally{URL.createObjectURL=oldURL;HTMLAnchorElement.prototype.click=oldClick;window.confirm=oldConfirm}
})()
