import {DEFAULT,RATIOS,MAX_FILE,validateState,checkImage,wrapText} from './core.js';
import {FONT_OPTIONS,canvasFont,ensureFont} from './fonts.js';
import {LEGACY_KEY,MAX_BACKUP_BYTES,packBackup,unpackBackup,readRawWorkspace,saveWorkspace} from './storage.js';
const $=id=>document.getElementById(id),canvas=$('canvas'),ctx=canvas.getContext('2d');
let state={...DEFAULT},templates=[],selected=null,image=null,loading=false,storageBlocked=false,recoveryRaw=null;
let saveTimer,saveVersion=0;
const fields=['headline','caption','font','align','size','color','outline','fit','shade','top','bottom'];
const mobileLayout=matchMedia('(max-width:720px)');
function advancedLayout(){ $('advanced-options').open=!mobileLayout.matches; }
advancedLayout();mobileLayout.addEventListener('change',advancedLayout);
for(const [label,custom] of [['무료 한글 폰트',true],['기기 기본 폰트',false]]){
  const group=document.createElement('optgroup');group.label=label;
  for(const font of FONT_OPTIONS.filter(f=>Boolean(f.file)===custom)){const option=document.createElement('option');option.value=font.id;option.textContent=font.label;group.append(option)}
  $('font').append(group);
}
async function prepareFont(id){
  const font=FONT_OPTIONS.find(f=>f.id===id);
  $('font-status').textContent=font.file?'글꼴을 준비하고 있어요…':'기기에 설치된 기본 글꼴을 사용해요.';
  try{await ensureFont(id);$('font-status').textContent=font.file?'폰트 준비 완료 · 같은 글꼴로 이미지에 저장돼요.':'기기에 설치된 기본 글꼴을 사용해요.'}
  catch(error){$('font-status').textContent='글꼴 준비 실패 · 다시 시도하거나 다른 글꼴을 골라 주세요.';throw error}
}
function status(message,error=false){$('status').textContent=message;$('status').classList.toggle('error',error)}
function background(c,w,h,preset){
  const colors={lilac:['#d9cbed','#b49acd','#ebe4f4'],peach:['#fbd1b7','#e7a280','#ffedd4'],night:['#272f48','#4c5d76','#96ac93']}[preset];
  c.fillStyle=colors[0];c.fillRect(0,0,w,h);
  c.fillStyle=colors[1];c.beginPath();c.arc(w*.84,h*.6,w*.43,0,Math.PI*2);c.fill();
  c.fillStyle=colors[2];c.beginPath();c.ellipse(w*.25,h*.68,w*.32,h*.21,-.45,0,Math.PI*2);c.fill();
  c.save();c.translate(w*.52,h*.55);c.rotate(-.12);
  c.fillStyle=preset==='night'?'#d7e5b2':'#f2f5c9';c.beginPath();
  for(let i=0;i<24;i++){let a=i*Math.PI/12,r=w*(i%2?.16:.24);let x=Math.cos(a)*r,y=Math.sin(a)*r;i?c.lineTo(x,y):c.moveTo(x,y)}c.closePath();c.fill();
  c.fillStyle='#36333d';for(const x of [-.055,.055]){c.beginPath();c.ellipse(w*x,-w*.025,w*.013,w*.024,0,0,Math.PI*2);c.fill()}
  c.strokeStyle='#36333d';c.lineWidth=w*.007;c.lineCap='round';c.beginPath();c.arc(0,w*.012,w*.065,.12*Math.PI,.88*Math.PI);c.stroke();c.restore();
}
function drawText(text,yPercent,maxHeight,size){
  if(!text)return null;
  const w=canvas.width,h=canvas.height,margin=w*.065,maxWidth=w-margin*2;
  let n=size,lines=[];
  do {ctx.font=canvasFont(state.font,n);lines=wrapText(ctx,text,maxWidth);if(lines.length*n*1.3<=maxHeight&&lines.every(l=>ctx.measureText(l).width<=maxWidth))break;n=Math.max(.5,n-.5)}while(n>.5);
  ctx.font=canvasFont(state.font,n);
  const blockHeight=lines.length*n*1.3,y=Math.max(margin,Math.min(h-margin-blockHeight,h*yPercent/100));
  ctx.textBaseline='top';ctx.textAlign=state.align;ctx.lineJoin='round';ctx.lineWidth=Math.max(2,n*.08);ctx.strokeStyle=state.color.toLowerCase()==='#ffffff'?'#262238':'#ffffff';ctx.fillStyle=state.color;
  const x=state.align==='left'?margin:state.align==='right'?w-margin:w/2;
  lines.forEach((line,i)=>{if(state.outline)ctx.strokeText(line,x,y+i*n*1.3);ctx.fillText(line,x,y+i*n*1.3)});
  return {size:n,shrunk:n<size,lines:lines.length};
}
function render(){
  const [w,h]=RATIOS[state.ratio];canvas.width=w;canvas.height=h;background(ctx,w,h,state.preset);
  if(image){const scale=(state.fit==='cover'?Math.max:Math.min)(w/image.width,h/image.height),iw=image.width*scale,ih=image.height*scale;ctx.drawImage(image,(w-iw)/2,(h-ih)/2,iw,ih);ctx.fillStyle=`rgba(0,0,0,${state.shade/100})`;ctx.fillRect(0,0,w,h)}
  const layouts=[drawText(state.headline,state.top,h*.32,state.size),drawText(state.caption,state.bottom,h*.23,Math.round(state.size*.5))];
  const sizes=layouts.map((l,i)=>l?`${i===0?'위':'아래'} ${l.size}px`:'').filter(Boolean).join(' · '),small=layouts.some(l=>l&&l.size<24);
  $('fit-note').textContent=(sizes?`실제 저장 크기: ${sizes}. `:'')+(small?'글자가 너무 작아 읽기 어려워요. 문구나 줄바꿈을 줄여 주세요. 원문은 모두 보존했어요.':layouts.some(l=>l?.shrunk)?'문구가 잘리지 않도록 자동 조절했어요.':'긴 문구는 이미지 안에 맞춰 작아져요.');
  $('fit-note').classList.toggle('readability-warning',small);
  $('text-warning').hidden=!small;$('text-warning').textContent=small?$('fit-note').textContent:'';
  $('dimensions').textContent=`${w} × ${h} px`;
  canvas.setAttribute('aria-label',`미리보기: ${state.headline} ${state.caption}`);
}
function sync(){
  for(const field of fields){if(field==='outline')$(field).checked=state[field];else $(field).value=state[field]}
  $('size-value').textContent=state.size;$('shade-value').textContent=state.shade+'%';
  for(const field of ['headline','caption'])$(field+'-count').textContent=`${state[field].length} / ${field==='headline'?160:240}`;
  document.querySelectorAll('[data-ratio]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.ratio===state.ratio));
  document.querySelectorAll('[data-preset]').forEach(b=>b.setAttribute('aria-pressed',b.dataset.preset===state.preset&&!state.image));
  $('image-name').textContent=state.image?'사진 적용됨 · 메타데이터 제거 후 보관':'사진이 없어도 괜찮아요. 아래 배경으로 시작하세요.';
  $('remove-image').disabled=!state.image;$('image-options').hidden=!state.image;render();
}
function data(){return {version:1,current:state,templates}}
function savedStatus(message,error=false){$('save-status').textContent=message;$('save-status').classList.toggle('error',error)}
async function persist(next=data()){
  clearTimeout(saveTimer);const version=++saveVersion;
  if(storageBlocked)throw new Error('원본 보호 중이에요. 손상 원본을 내려받고 정상 백업을 복원해 주세요.');
  savedStatus('브라우저에 저장 중…');
  try{await saveWorkspace(next);if(version===saveVersion)savedStatus('이 브라우저에 저장됨')}
  catch(error){if(version===saveVersion)savedStatus('저장되지 않았어요. 새로고침 전에 작업 백업을 받아 주세요.',true);throw new Error(error.message?.includes('64MB')?error.message:'브라우저 저장 공간이 부족하거나 저장이 차단됐어요. 현재 편집은 유지되지만 새로고침 전에 작업 백업을 받아 주세요.')}
}
function saveDraft(){clearTimeout(saveTimer);++saveVersion;savedStatus('저장 대기 중…');saveTimer=setTimeout(()=>persist().catch(e=>{savedStatus('저장되지 않았어요. 작업 백업을 받아 주세요.',true);status(e.message,true)}),180)}
function decode(url){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('이미지를 읽을 수 없어요. 기존 작업은 유지돼요.'));img.src=url})}
function bytesFromData(url){const b=atob(url.split(',')[1]);return Uint8Array.from(b,x=>x.charCodeAt(0))}
async function cleanImage(bytes,stored=false){
  const info=checkImage(bytes,stored?20*1024*1024:MAX_FILE),url=URL.createObjectURL(new Blob([bytes],{type:info.type}));
  try {const img=await decode(url);if(img.width*img.height>24000000)throw new Error('이미지가 너무 커요.');const c=document.createElement('canvas'),scale=Math.min(1,1920/Math.max(img.width,img.height));c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));c.getContext('2d').drawImage(img,0,0,c.width,c.height);const src=c.toDataURL('image/png');return {src,img:await decode(src)}}finally{URL.revokeObjectURL(url)}
}
async function normalizeImages(doc){const cache=new Map();for(const s of [doc.current,...doc.templates.map(t=>t.state)])if(s.image){if(!cache.has(s.image))cache.set(s.image,(await cleanImage(bytesFromData(s.image),true)).src);s.image=cache.get(s.image)}return doc}
async function busy(task){if(loading)return;loading=true;const controls=[...document.querySelectorAll('input,textarea,select,button')],prior=controls.map(c=>c.disabled);controls.forEach(c=>c.disabled=true);try{await task()}catch(e){status(e.message,true)}finally{controls.forEach((c,i)=>c.disabled=prior[i]);loading=false;$('update-template').disabled=!selected;$('remove-image').disabled=!state.image;$('backup').disabled=storageBlocked;$('recovery-download').disabled=!recoveryRaw}}
async function upload(file){if(!file)return;await busy(async()=>{if(file.size>MAX_FILE)throw new Error('12MB 이하 이미지를 골라 주세요. 기존 작업은 유지돼요.');const clean=await cleanImage(new Uint8Array(await file.arrayBuffer()));state={...state,image:clean.src};image=clean.img;sync();status('사진을 불러왔어요. 위치 정보 등 원본 메타데이터는 제거했어요.');saveDraft()})}
for(const field of fields.filter(f=>f!=='font'))$(field).addEventListener('input',()=>{state[field]=field==='outline'?$(field).checked:['size','shade','top','bottom'].includes(field)?Number($(field).value):$(field).value;sync();saveDraft()});
$('font').addEventListener('change',()=>{const next=$('font').value;busy(async()=>{try{await prepareFont(next);state.font=next;sync();status('글꼴을 바꿨어요.');saveDraft()}finally{$('font').value=state.font}})});
document.querySelectorAll('[data-ratio]').forEach(b=>b.onclick=()=>{state.ratio=b.dataset.ratio;sync();saveDraft()});
document.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>{state.preset=b.dataset.preset;state.image=null;image=null;sync();saveDraft()});
$('remove-image').onclick=()=>{state.image=null;image=null;sync();saveDraft()};
$('upload').onchange=async e=>{await upload(e.target.files[0]);e.target.value=''};
for(const event of ['dragover','dragleave','drop'])$('dropzone').addEventListener(event,e=>{e.preventDefault();$('dropzone').classList.toggle('drag',event==='dragover');if(event==='drop'){if(e.dataTransfer.files.length!==1)status('이미지 한 개씩 불러와 주세요.',true);else upload(e.dataTransfer.files[0])}});
$('reset').onclick=()=>{if(!confirm('현재 편집을 처음으로 되돌릴까요? 저장한 템플릿은 유지돼요.'))return;state={...DEFAULT};image=null;selected=null;$('template-name').value='';$('font-status').textContent='기기에 설치된 기본 글꼴을 사용해요.';sync();list();status('기본 카드로 되돌렸어요.');saveDraft()};
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000)}
$('download').onclick=()=>busy(async()=>{await prepareFont(state.font);await document.fonts.ready;render();const type=$('format').value,blob=await new Promise(r=>canvas.toBlob(r,'image/'+type,.95));if(!blob)throw new Error('이미지 저장에 실패했어요. 다시 시도해 주세요.');download(blob,`jjal-${state.ratio}.${type==='jpeg'?'jpg':'png'}`);status(`${type.toUpperCase()} 파일을 준비했어요. 브라우저 다운로드 목록에서 확인하세요.`)});
function list(){
  $('templates').replaceChildren();$('template-count').textContent=`${templates.length} / 12`;$('update-template').disabled=!selected;
  if(!templates.length){const p=document.createElement('p');p.className='empty';p.textContent='아직 보관한 템플릿이 없어요. 첫 번째 한 장을 저장해 볼까요?';$('templates').append(p)}
  for(const t of templates){const row=document.createElement('div');row.className='template'+(t.id===selected?' selected':'');const load=document.createElement('button');load.className='load';load.title=t.name;const name=document.createElement('span');name.className='name';name.textContent=t.name;const mark=document.createElement('span');mark.textContent='▧';load.append(mark,name);load.onclick=()=>busy(async()=>{const next=validateState(t.state),img=next.image?await decode(next.image):null;await prepareFont(next.font);state={...next};image=img;selected=t.id;$('template-name').value=t.name;sync();list();status('템플릿을 불러왔어요.');saveDraft()});const del=document.createElement('button');del.className='delete';del.textContent='×';del.setAttribute('aria-label',t.name+' 삭제');del.onclick=()=>{if(!confirm(`“${t.name}” 템플릿을 삭제할까요?`))return;busy(async()=>{const next=templates.filter(x=>x.id!==t.id);await persist({...data(),templates:next});templates=next;if(selected===t.id)selected=null;list();status('템플릿을 삭제했어요. 현재 편집은 유지돼요.')})};row.append(load,del);$('templates').append(row)}
}
function saveTemplate(update=false){return busy(async()=>{const name=$('template-name').value.trim();if(!name)throw new Error('템플릿 이름을 입력해 주세요.');if(!update&&templates.length>=12)throw new Error('최대 12개까지 보관할 수 있어요. JSON 백업 후 정리해 주세요.');if(update&&!templates.some(t=>t.id===selected))throw new Error('수정할 템플릿을 먼저 불러와 주세요.');const item={id:update?selected:crypto.randomUUID(),name,state:{...state}},next=update?templates.map(t=>t.id===selected?item:t):[...templates,item];await persist({...data(),templates:next});templates=next;selected=item.id;list();status(update?'선택한 템플릿을 수정했어요.':'새 템플릿을 저장했어요.')})}
$('save-template').onclick=()=>saveTemplate();$('update-template').onclick=()=>saveTemplate(true);
let pendingRestore=null;
function backupStatus(message,error=false){$('backup-status').textContent=message;$('backup-status').classList.toggle('error',error)}
function clearRestore(){pendingRestore=null;$('restore-review').hidden=true;$('restore-names').replaceChildren()}
function backupTask(task){return busy(async()=>{try{await task()}catch(error){backupStatus(error.message+' 현재 편집과 템플릿은 그대로 유지돼요.',true)}})}
$('backup').onclick=()=>backupTask(async()=>{if(storageBlocked)throw new Error('손상 원본 다운로드를 이용해 주세요.');const packed=await packBackup(data());download(new Blob([JSON.stringify(packed)],{type:'application/json'}),'jjal-studio-backup.json');backupStatus('현재 편집과 템플릿 '+templates.length+'개의 백업 파일을 준비했어요. 브라우저 다운로드 목록을 확인하세요.')});
$('recovery-download').onclick=()=>{if(recoveryRaw){download(new Blob([recoveryRaw],{type:'application/json'}),'jjal-studio-recovery-original.json');backupStatus('손상 원본을 그대로 내려받았어요. 정상 백업과 구분해 보관해 주세요.')}};
$('restore').onchange=e=>{
  const file=e.target.files[0];e.target.value='';if(!file)return;
  backupTask(async()=>{
    clearRestore();backupStatus('백업 파일을 확인하고 있어요…');
    if(file.size>MAX_BACKUP_BYTES)throw new Error('백업 파일은 최대 80MB까지 가져올 수 있어요.');
    let raw;try{raw=JSON.parse(await file.text())}catch{throw new Error('백업 파일의 JSON 형식이 손상됐어요. 정상 백업 파일을 골라 주세요.')}
    const next=await normalizeImages(unpackBackup(raw));
    await packBackup(next);
    const img=next.current.image?await decode(next.current.image):null;
    pendingRestore={next,img};
    $('restore-file').textContent=file.name;
    $('restore-summary').textContent=`현재 편집 1개 · 템플릿 ${next.templates.length}개`;
    for(const t of next.templates){const item=document.createElement('li');item.textContent=t.name;$('restore-names').append(item)}
    $('restore-names').hidden=next.templates.length===0;
    $('restore-headline').textContent=next.current.headline||'(빈 문구)';$('restore-caption').textContent=next.current.caption||'(빈 문구)';
    $('restore-ratio').textContent={square:'정사각 1:1',portrait:'세로 4:5',story:'스토리 9:16'}[next.current.ratio];
    $('restore-review').hidden=false;backupStatus('아직 적용하지 않았어요. 아래 내용을 확인한 뒤 복원해 주세요.');$('restore-title').focus();
  });
};
$('restore-cancel').onclick=()=>{clearRestore();backupStatus('가져오기를 취소했어요. 현재 편집과 템플릿은 그대로예요.');$('restore').focus()};
$('restore-apply').onclick=()=>backupTask(async()=>{
  if(!pendingRestore)return;
  const {next,img}=pendingRestore;await prepareFont(next.current.font);
  const blocked=storageBlocked;storageBlocked=false;try{await persist(next)}catch(error){storageBlocked=blocked;throw error}
  state=next.current;templates=next.templates;image=img;selected=null;$('recovery-note').hidden=true;recoveryRaw=null;$('template-name').value='';sync();list();clearRestore();
  backupStatus(`템플릿 ${templates.length}개와 편집 내용을 복원했어요.`);
}).then(()=>{if($('restore-review').hidden)$('restore').focus()});
async function init(){
  try{
    let raw=await readRawWorkspace(),legacy=null;
    if(raw===null){legacy=localStorage.getItem(LEGACY_KEY);if(legacy!==null){recoveryRaw=legacy;raw=JSON.parse(legacy)}}
    else recoveryRaw=JSON.stringify(raw);
    if(raw){
      const doc=unpackBackup(raw);
      if(legacy!==null)await normalizeImages(doc);
      else for(const src of new Set([doc.current,...doc.templates.map(t=>t.state)].map(s=>s.image).filter(Boolean)))checkImage(bytesFromData(src),20*1024*1024);
      const img=doc.current.image?await decode(doc.current.image):null;
      // Commit migration once; later loads reuse the already normalized images.
      if(legacy!==null)await saveWorkspace(doc);
      state=doc.current;templates=doc.templates;image=img;
      if(legacy!==null)status('기존 작업을 새 저장소로 옮겼어요. 이전 원본도 보관했어요.');
    }
    recoveryRaw=null;savedStatus('이 브라우저에 저장됨');
  }catch(error){
    storageBlocked=true;
    if(recoveryRaw===null){try{recoveryRaw=localStorage.getItem(LEGACY_KEY)}catch{}}
    $('recovery-note').hidden=false;
    $('recovery-message').textContent=recoveryRaw?'기존 자료를 읽거나 옮기지 못했어요. 원본을 먼저 내려받고 정상 백업을 복원해 주세요. 빈 기본 작업으로 백업하지 않아요.':'저장소에 접근하지 못했어요. 원본은 변경하지 않았어요. 브라우저 저장 권한을 확인하고 다시 열어 주세요.';
    savedStatus('원본 보호 중 · 자동 저장 중지',true);status('기존 저장 자료를 변경하지 않았어요. 내 템플릿의 복구 안내를 확인해 주세요.',true);
  }
  sync();list();
}
window.addEventListener('beforeunload',event=>{if($('save-status').textContent.includes('중')||$('save-status').classList.contains('error')){event.preventDefault();event.returnValue=''}});
await busy(async()=>{await init();try{await prepareFont(state.font);render()}catch(error){status(error.message+' 현재 미리보기는 대체 글꼴로 표시될 수 있어요.',true)}});
