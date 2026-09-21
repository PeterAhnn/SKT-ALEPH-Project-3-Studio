return await (async()=>{
  const $=id=>document.getElementById(id),key='jjal-studio-v1',results=[];
  const check=(label,ok)=>{results.push({label,result:ok?'PASS':'FAIL'});if(!ok)throw Error(label)};
  const wait=async()=>{for(let i=0;i<700;i++){if(!$('download').disabled)return;await new Promise(r=>setTimeout(r,25))}throw Error('busy timeout')};
  const upload=async raw=>{const dt=new DataTransfer();dt.items.add(new File([raw],'나의 카드 백업.json',{type:'application/json'}));$('restore').files=dt.files;$('restore').dispatchEvent(new Event('change',{bubbles:true}));await wait()};
  const snapshot=()=>({saved:localStorage.getItem(key),canvas:$('canvas').toDataURL(),headline:$('headline').value});
  const same=before=>JSON.stringify(snapshot())===JSON.stringify(before);
  const oldSet=Storage.prototype.setItem;
  try{
    await wait();const {DEFAULT}=await import('/core.js');
    const next={version:1,current:{...DEFAULT,headline:'다른 기기에서 이어 만들기',caption:'복원 전 내용을 확인해요',ratio:'portrait'},templates:[{id:'one',name:'여행 카드',state:{...DEFAULT}},{id:'two',name:'<img src=x onerror=alert(1)>',state:{...DEFAULT}}]};
    const raw=JSON.stringify(next),before=snapshot();
    check('백업은 내 템플릿 영역에 위치',!!$('backup').closest('.library')&&!document.querySelector('.topbar #backup'));
    await upload(raw);
    check('선택만 해서는 기존 작업 변경 없음',!$('restore-review').hidden&&same(before));
    check('파일명·개수·문구·화면비 표시',$('restore-file').textContent==='나의 카드 백업.json'&&$('restore-summary').textContent.includes('2개')&&$('restore-headline').textContent===next.current.headline&&$('restore-ratio').textContent.includes('4:5'));
    check('템플릿 이름은 실행되지 않는 텍스트',!$('restore-names').querySelector('img')&&$('restore-names').textContent.includes(next.templates[1].name));
    check('전체 교체 안내 및 키보드 포커스',document.querySelector('.restore-warning').textContent.includes('목록 전체')&&document.activeElement===$('restore-title'));
    $('restore-cancel').click();check('취소 시 기존 작업 보존',same(before)&&$('restore-review').hidden&&document.activeElement===$('restore'));
    await upload(raw);await upload('{broken');
    check('손상 JSON은 이전 복원 후보도 해제',same(before)&&$('restore-review').hidden&&$('backup-status').classList.contains('error')&&$('backup-status').textContent.includes('유지'));
    $('restore-apply').click();await wait();check('거부 뒤 오래된 후보 적용 불가',same(before));
    const invalid=structuredClone(next);delete invalid.templates[0].name;await upload(JSON.stringify(invalid));
    check('필수 항목 누락 시 기존 작업 보존',same(before)&&$('backup-status').classList.contains('error')&&$('restore-review').hidden);
    await upload(raw);Storage.prototype.setItem=function(k,v){if(k===key)throw new DOMException('full','QuotaExceededError');return oldSet.call(this,k,v)};
    $('restore-apply').click();await wait();Storage.prototype.setItem=oldSet;
    check('저장 공간 오류 시 작업·목록 보존',same(before)&&!$('restore-review').hidden&&$('backup-status').classList.contains('error'));
    $('restore-apply').click();await wait();
    check('명시적 적용 후 전체 복원',JSON.stringify(JSON.parse(localStorage.getItem(key)))===raw&&$('headline').value===next.current.headline&&$('restore-review').hidden);
    const empty={...next,templates:[]};await upload(JSON.stringify(empty));check('템플릿 0개도 교체 범위 표시',$('restore-summary').textContent.includes('0개')&&$('restore-names').hidden);
    $('restore-cancel').click();await upload(raw);
    return {at:new Date().toISOString(),url:location.href,results,reloadExpected:next};
  }catch(e){return {at:new Date().toISOString(),url:location.href,results,error:e.message}}finally{Storage.prototype.setItem=oldSet}
})()
