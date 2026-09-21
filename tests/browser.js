return await (async()=>{
  const $=id=>document.getElementById(id),results=[],KEY='jjal-studio-v1';
  const {readWorkspace}=await import('/storage.js');
  const savedData=async()=>{await wait();return await readWorkspace()};
  const savedText=async()=>JSON.stringify(await savedData());
  const assert=(label,condition,detail='')=>{results.push({label,result:condition?'PASS':'FAIL',detail});if(!condition)throw new Error(label+': '+detail)};
  const wait=async()=>{for(let i=0;i<200;i++){if(!$('download').disabled&&!$('save-status').textContent.includes('중'))return;await new Promise(r=>setTimeout(r,25))}throw new Error('busy timeout')};
  const input=(id,value)=>{$(id).value=value;$(id).dispatchEvent(new Event('input',{bubbles:true}))};
  const upload=async(file,id='upload')=>{const transfer=new DataTransfer();transfer.items.add(file);$(id).files=transfer.files;$(id).dispatchEvent(new Event('change',{bubbles:true}));await wait()};
  const fixture=async(w,h,type='image/png',transparent=false)=>{const c=document.createElement('canvas');c.width=w;c.height=h;const x=c.getContext('2d');if(!transparent){x.fillStyle='#d8eff6';x.fillRect(0,0,w,h)}x.fillStyle='#d67c52';x.fillRect(w*.15,h*.15,w*.7,h*.7);x.strokeStyle='#171d4b';x.lineWidth=Math.max(1,w*.02);x.strokeRect(0,0,w,h);x.font=`${Math.max(12,w*.05)}px sans-serif`;x.fillStyle='#171d4b';x.fillText('TOP / 위',w*.1,h*.1);return new File([await new Promise(r=>c.toBlob(r,type,.95))],type==='image/png'?'synthetic.png':'synthetic.jpg',{type})};
  const decode=blob=>new Promise((resolve,reject)=>{const im=new Image(),u=URL.createObjectURL(blob);im.onload=()=>{URL.revokeObjectURL(u);resolve(im)};im.onerror=reject;im.src=u});
  const pixels=im=>{const c=document.createElement('canvas');c.width=im.width;c.height=im.height;c.getContext('2d').drawImage(im,0,0);return c.getContext('2d').getImageData(0,0,c.width,c.height).data};
  let lastBlob=null,lastDownload=null;const originalCreate=URL.createObjectURL.bind(URL),originalClick=HTMLAnchorElement.prototype.click,originalConfirm=window.confirm;
  URL.createObjectURL=function(blob){if(blob instanceof Blob)lastBlob=blob;return originalCreate(blob)};
  HTMLAnchorElement.prototype.click=function(){lastDownload={name:this.download,blob:lastBlob}};
  window.confirm=()=>true;
  try {
    assert('C03 첫 화면 편집 도구',!!$('upload')&&!!$('headline'));
    const c=$('canvas');
    for(const [label,text] of [
      ['E01 긴 한글 160자','한글문구'.repeat(40)],
      ['E02 한글 영문 혼합','지금은 TEST 2026 / Hello, 안녕! '.repeat(4)],
      ['E03 명시적 줄바꿈','첫 번째 줄\n두 번째 줄\nThird line\n마지막 줄'],
      ['E04 복합 이모지','👨‍👩‍👧‍👦👨‍👩‍👧‍👦 ❤️ 👍🏽 🇰🇷 '.repeat(4)],
      ['E05 빈 문구',''],
      ['E06 공백 없는 긴 영문','W'.repeat(160)]
    ]){input('headline',text);const png=await new Promise(r=>c.toBlob(r));const im=await decode(png);assert(label,im.width===1080&&im.height===1080&&(await savedData()).current.headline===text,`문구 ${text.length}자 보존, PNG 디코딩 성공`)}
    input('headline','가장자리 검사\nHello 한글 🌿');input('caption','아래 문구 · 줄바꿈\n두 번째 줄');
    for(const [label,w,h,type,alpha] of [['E07 세로 PNG',400,1200,'image/png',false],['E08 가로 JPEG',1600,400,'image/jpeg',false],['E09 투명 PNG',600,600,'image/png',true]]){
      await upload(await fixture(w,h,type,alpha));assert(label,(await savedData()).current.image?.startsWith('data:image/png')&&$('status').textContent.includes('불러왔어요'),`${w}×${h} ${type} 업로드 성공`)
    }
    for(const [label,file] of [
      ['E10 확장자 위장 파일',new File(['<svg onload="alert(1)"></svg>'],'fake.png',{type:'image/png'})],
      ['E11 빈 파일',new File([],'empty.jpg',{type:'image/jpeg'})],
      ['E12 12MB 초과 파일',new File([new Uint8Array(12*1024*1024+1)],'huge.png',{type:'image/png'})]
    ]){const before=(await savedText()),preview=c.toDataURL();await upload(file);assert(label,before===(await savedText())&&preview===c.toDataURL()&&$('status').classList.contains('error'),$('status').textContent)}
    let before=c.toDataURL();input('top','27');assert('C06 위치 즉시 반영',before!==c.toDataURL());before=c.toDataURL();input('size','105');assert('C07 크기 즉시 반영',before!==c.toDataURL());before=c.toDataURL();input('color','#ee2244');assert('C08 색 즉시 반영',before!==c.toDataURL());
    input('top','0');input('bottom','100');input('align','right');
    for(const [ratio,w,h] of [['square',1080,1080],['portrait',1080,1350],['story',1080,1920]]){
      document.querySelector(`[data-ratio="${ratio}"]`).click();const expected=c.getContext('2d').getImageData(0,0,w,h).data;
      $('format').value='png';$('download').click();await wait();const file=lastDownload,im=await decode(file.blob),actual=pixels(im);
      assert('화면/PNG 완전 일치 '+ratio,im.width===w&&im.height===h&&actual.every((v,i)=>v===expected[i]),`${w}×${h}, RGBA 전체 픽셀 동일, ${file.name}`);
      $('format').value='jpeg';$('download').click();await wait();const jpg=await decode(lastDownload.blob);assert('JPEG 파일 정상 '+ratio,jpg.width===w&&jpg.height===h);
    }
    for(let i=1;i<=3;i++){input('headline','테스트 카드 '+i);input('template-name','템플릿 '+i);$('save-template').click();await wait()}
    let saved=(await savedData());assert('C17 템플릿 3개 생성',saved.templates.length===3);
    document.querySelectorAll('.template .load')[0].click();await wait();assert('C18 첫 템플릿 불러오기',$('headline').value==='테스트 카드 1');
    input('headline','수정한 첫 카드');input('template-name','수정됨');$('update-template').click();saved=(await savedData());assert('C19 안정된 ID로 수정',saved.templates[0].name==='수정됨'&&saved.templates[0].state.headline==='수정한 첫 카드');
    document.querySelectorAll('.template .delete')[1].click();saved=(await savedData());assert('C20 두 번째 템플릿 삭제',saved.templates.length===2&&saved.templates[1].name==='템플릿 3');
    $('backup').click();await wait();const backup=lastDownload.blob;const beforeBackup=(await savedText());
    for(const [label,raw] of [['C23 문법 손상 JSON','{"version":'],['C24 필수 항목 누락 JSON',JSON.stringify({version:1,current:saved.current,templates:[{id:'missing',state:saved.current}]})]]){
      await upload(new File([raw],'bad.json',{type:'application/json'}),'restore');assert(label,(await savedText())===beforeBackup&&$('backup-status').classList.contains('error'),$('backup-status').textContent)
    }
    input('headline','복원 전에 바꾼 문구');await upload(new File([backup],'good.json',{type:'application/json'}),'restore');$('restore-apply').click();await wait();saved=(await savedData());assert('C22 JSON 전체 복원',saved.templates.length===2&&$('headline').value==='수정한 첫 카드');
    const net=performance.getEntriesByType('resource').filter(r=>!r.name.startsWith(location.origin)&&!r.name.startsWith('blob:')&&!r.name.startsWith('data:'));
    assert('외부 네트워크 전송 0건',net.length===0,JSON.stringify(net.map(r=>r.name)));
    return {at:new Date().toISOString(),results,reloadExpected:{names:saved.templates.map(t=>t.name),headline:saved.current.headline}};
  }catch(e){return {at:new Date().toISOString(),results,error:e.message}}finally{URL.createObjectURL=originalCreate;HTMLAnchorElement.prototype.click=originalClick;window.confirm=originalConfirm}
})()
