return await (async()=>{
  const $=id=>document.getElementById(id),results=[],canvas=$('canvas'),key='jjal-studio-v1';
  const {readWorkspace}=await import('/storage.js');
  const savedData=async()=>{await wait();return await readWorkspace()};
  const savedText=async()=>JSON.stringify(await savedData());
  const check=(label,pass)=>{results.push({label,result:pass?'PASS':'FAIL'});if(!pass)throw Error(label)};
  const wait=async()=>{for(let i=0;i<700;i++){if(!$('download').disabled&&!$('save-status').textContent.includes('중'))return;await new Promise(r=>setTimeout(r,25))}throw Error('font timeout')};
  const input=(id,value)=>{$(id).value=value;$(id).dispatchEvent(new Event('input',{bubbles:true}))};
  const choose=async id=>{$('font').value=id;$('font').dispatchEvent(new Event('change',{bubbles:true}));await wait()};
  const {FONT_OPTIONS}=await import('/fonts.js');
  const originalFace=window.FontFace,originalURL=URL.createObjectURL.bind(URL),originalClick=HTMLAnchorElement.prototype.click,originalConfirm=window.confirm;
  let blob,lastDownload;
  URL.createObjectURL=b=>{blob=b;return originalURL(b)};HTMLAnchorElement.prototype.click=function(){lastDownload=blob};window.confirm=()=>true;
  try {
    await choose('sans');const before=(await savedText()),beforeCanvas=canvas.toDataURL();
    window.FontFace=class{load(){return Promise.reject(Error('simulated font network failure'))}};
    await choose('pretendard');
    check('폰트 전송 실패 시 현재 글꼴·작업·미리보기 보존',$('font').value==='sans'&&(await savedText())===before&&canvas.toDataURL()===beforeCanvas&&$('status').classList.contains('error'));
    window.FontFace=originalFace;
    input('headline','오늘의 한 장\n한글 ABC 123 🌿');input('caption','나만의 문구로 만드는 카드');
    const samples=[];
    for(const font of FONT_OPTIONS.filter(f=>f.file)){
      await choose(font.id);
      check(font.id+' 실제 폰트 로드',document.fonts.check(`${font.weight} 80px "${font.family}"`,'오늘의 한 장 ABC')&&[...document.fonts].some(f=>f.family.replace(/^"|"$/g,'')===font.family&&f.status==='loaded'));
      for(const ratio of ['square','portrait','story']){
        document.querySelector(`[data-ratio="${ratio}"]`).click();
        const expected=canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height).data;
        if(ratio==='square')samples.push({name:font.label.split(' · ')[0],data:canvas.toDataURL()});
        $('format').value='png';$('download').click();await wait();
        const bitmap=await createImageBitmap(lastDownload),copy=document.createElement('canvas');copy.width=bitmap.width;copy.height=bitmap.height;copy.getContext('2d').drawImage(bitmap,0,0);bitmap.close();
        const actual=copy.getContext('2d').getImageData(0,0,copy.width,copy.height).data;
        check(font.id+' '+ratio+' PNG 전체 픽셀 일치',copy.width===canvas.width&&copy.height===canvas.height&&actual.length===expected.length&&actual.every((v,i)=>v===expected[i]));
      }
      $('format').value='jpeg';$('download').click();await wait();const jpeg=await createImageBitmap(lastDownload);check(font.id+' JPEG 정상 디코딩',jpeg.width===1080&&jpeg.height===1920);jpeg.close();
    }
    check('7종이 서로 다른 실제 글자 모양',new Set(samples.map(s=>s.data)).size===7);
    const board=document.createElement('canvas');board.width=1200;board.height=700;const c=board.getContext('2d');c.fillStyle='#f8f8f5';c.fillRect(0,0,1200,700);
    for(let i=0;i<samples.length;i++){const im=new Image();im.src=samples[i].data;await im.decode();const x=(i%4)*300+15,y=Math.floor(i/4)*350+15;c.drawImage(im,x,y,270,270);c.fillStyle='#262238';c.font='bold 18px sans-serif';c.fillText(samples[i].name,x,y+305)}
    window.fontContact=board;
    const count=(await savedData()).templates.length;
    input('template-name','무료폰트 복원 검사');$('save-template').click();await wait();check('폰트 ID 포함 템플릿 저장',(await savedData()).templates.at(-1).state.font==='nanum-pen');
    await choose('serif');document.querySelectorAll('.template .load')[count].click();await wait();check('템플릿 폰트 복원',$('font').value==='nanum-pen');
    $('backup').click();await wait();const backup=lastDownload;await choose('sans');
    const transfer=new DataTransfer();transfer.items.add(new File([backup],'font-backup.json',{type:'application/json'}));$('restore').files=transfer.files;$('restore').dispatchEvent(new Event('change',{bubbles:true}));await wait();
    $('restore-apply').click();await wait();
    check('JSON 폰트 복원',$('font').value==='nanum-pen'&&(await savedData()).current.font==='nanum-pen');
    check('폰트는 동일 출처로만 요청',performance.getEntriesByType('resource').filter(r=>/\.(ttf|woff2)/.test(r.name)).every(r=>r.name.startsWith(location.origin+'/fonts/')));
    return {at:new Date().toISOString(),results};
  }catch(e){return {at:new Date().toISOString(),results,error:e.message}}finally{window.FontFace=originalFace;URL.createObjectURL=originalURL;HTMLAnchorElement.prototype.click=originalClick;window.confirm=originalConfirm}
})()
