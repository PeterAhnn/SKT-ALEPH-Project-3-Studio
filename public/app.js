import {DEFAULT,RATIOS,MAX_FILE,validateBackup,validateState,checkImage,wrapText} from './core.js';
const $=id=>document.getElementById(id),canvas=$('canvas'),ctx=canvas.getContext('2d');
const KEY='jjal-studio-v1'; let state={...DEFAULT},templates=[],selected=null,image=null,loading=false,storageBlocked=false;
const fields=['headline','caption','font','align','size','color','outline','fit','shade','top','bottom'];
const fonts={sans:'"Malgun Gothic", "Apple SD Gothic Neo", sans-serif',serif:'Batang, "Noto Serif CJK KR", serif',mono:'Consolas, "Malgun Gothic", monospace'};
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
  if(!text)return false;
  const w=canvas.width,h=canvas.height,margin=w*.065,maxWidth=w-margin*2;
  let n=size,lines=[];
  do {ctx.font=`800 ${n}px ${fonts[state.font]}`;lines=wrapText(ctx,text,maxWidth);if(lines.length*n*1.3<=maxHeight&&lines.every(l=>ctx.measureText(l).width<=maxWidth))break;n=Math.max(.5,n-.5)}while(n>.5);
  ctx.font=`800 ${n}px ${fonts[state.font]}`;
  const blockHeight=lines.length*n*1.3,y=Math.max(margin,Math.min(h-margin-blockHeight,h*yPercent/100));
  ctx.textBaseline='top';ctx.textAlign=state.align;ctx.lineJoin='round';ctx.lineWidth=Math.max(2,n*.08);ctx.strokeStyle=state.color.toLowerCase()==='#ffffff'?'#262238':'#ffffff';ctx.fillStyle=state.color;
  const x=state.align==='left'?margin:state.align==='right'?w-margin:w/2;
  lines.forEach((line,i)=>{if(state.outline)ctx.strokeText(line,x,y+i*n*1.3);ctx.fillText(line,x,y+i*n*1.3)});
  return n<size;
}
function render(){
  const [w,h]=RATIOS[state.ratio];canvas.width=w;canvas.height=h;background(ctx,w,h,state.preset);
  if(image){const scale=(state.fit==='cover'?Math.max:Math.min)(w/image.width,h/image.height),iw=image.width*scale,ih=image.height*scale;ctx.drawImage(image,(w-iw)/2,(h-ih)/2,iw,ih);ctx.fillStyle=`rgba(0,0,0,${state.shade/100})`;ctx.fillRect(0,0,w,h)}
  const shrinkA=drawText(state.headline,state.top,h*.32,state.size),shrinkB=drawText(state.caption,state.bottom,h*.23,Math.round(state.size*.5));
  $('fit-note').textContent=shrinkA||shrinkB?'문구가 잘리지 않도록 글자 크기를 자동 조절했어요.':'긴 문구는 이미지 안에 들어오도록 자동으로 작아져요.';
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
function persist(next=data()){
  if(storageBlocked)throw new Error('기존 저장 데이터가 손상되어 덮어쓰기를 막았어요. JSON 백업 후 정상 JSON을 복원해 주세요.');
  try{localStorage.setItem(KEY,JSON.stringify(next))}catch{throw new Error('브라우저 저장 공간이 부족하거나 저장이 차단됐어요. JSON 백업 후 템플릿을 정리해 주세요. 현재 편집은 유지돼요.')}
}
function saveDraft(){try{persist()}catch(e){status(e.message,true)}}
function decode(url){return new Promise((resolve,reject)=>{const img=new Image();img.onload=()=>resolve(img);img.onerror=()=>reject(new Error('이미지를 읽을 수 없어요. 기존 작업은 유지돼요.'));img.src=url})}
function bytesFromData(url){const b=atob(url.split(',')[1]);return Uint8Array.from(b,x=>x.charCodeAt(0))}
async function cleanImage(bytes){
  const info=checkImage(bytes),url=URL.createObjectURL(new Blob([bytes],{type:info.type}));
  try {const img=await decode(url);if(img.width*img.height>24000000)throw new Error('이미지가 너무 커요.');const c=document.createElement('canvas'),scale=Math.min(1,1600/Math.max(img.width,img.height));c.width=Math.max(1,Math.round(img.width*scale));c.height=Math.max(1,Math.round(img.height*scale));c.getContext('2d').drawImage(img,0,0,c.width,c.height);const src=c.toDataURL(info.type,.92);if(src.length>5*1024*1024)throw new Error('보관할 이미지가 너무 커요. 더 작은 이미지를 골라 주세요.');return {src,img:await decode(src)}}finally{URL.revokeObjectURL(url)}
}
async function busy(task){if(loading)return;loading=true;const controls=[...document.querySelectorAll('input,textarea,select,button')],prior=controls.map(c=>c.disabled);controls.forEach(c=>c.disabled=true);try{await task()}catch(e){status(e.message,true)}finally{controls.forEach((c,i)=>c.disabled=prior[i]);loading=false;$('update-template').disabled=!selected;$('remove-image').disabled=!state.image}}
async function upload(file){if(!file)return;await busy(async()=>{if(file.size>MAX_FILE)throw new Error('12MB 이하 이미지를 골라 주세요. 기존 작업은 유지돼요.');const clean=await cleanImage(new Uint8Array(await file.arrayBuffer()));state={...state,image:clean.src};image=clean.img;sync();status('사진을 불러왔어요. 위치 정보 등 원본 메타데이터는 제거했어요.');saveDraft()})}
for(const field of fields)$(field).addEventListener('input',()=>{state[field]=field==='outline'?$(field).checked:['size','shade','top','bottom'].includes(field)?Number($(field).value):$(field).value;sync();saveDraft()});
document.querySelectorAll('[data-ratio]').forEach(b=>b.onclick=()=>{state.ratio=b.dataset.ratio;sync();saveDraft()});
document.querySelectorAll('[data-preset]').forEach(b=>b.onclick=()=>{state.preset=b.dataset.preset;state.image=null;image=null;sync();saveDraft()});
$('remove-image').onclick=()=>{state.image=null;image=null;sync();saveDraft()};
$('upload').onchange=async e=>{await upload(e.target.files[0]);e.target.value=''};
for(const event of ['dragover','dragleave','drop'])$('dropzone').addEventListener(event,e=>{e.preventDefault();$('dropzone').classList.toggle('drag',event==='dragover');if(event==='drop'){if(e.dataTransfer.files.length!==1)status('이미지 한 개씩 불러와 주세요.',true);else upload(e.dataTransfer.files[0])}});
$('reset').onclick=()=>{if(!confirm('현재 편집을 처음으로 되돌릴까요? 저장한 템플릿은 유지돼요.'))return;state={...DEFAULT};image=null;selected=null;$('template-name').value='';sync();list();status('기본 카드로 되돌렸어요.');saveDraft()};
function download(blob,name){const url=URL.createObjectURL(blob),a=document.createElement('a');a.href=url;a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(url),10000)}
$('download').onclick=()=>busy(async()=>{await document.fonts.ready;render();const type=$('format').value,blob=await new Promise(r=>canvas.toBlob(r,'image/'+type,.95));if(!blob)throw new Error('이미지 저장에 실패했어요. 다시 시도해 주세요.');download(blob,`jjal-${state.ratio}.${type==='jpeg'?'jpg':'png'}`);status(`${type.toUpperCase()} 파일을 준비했어요. 브라우저 다운로드 목록에서 확인하세요.`)});
function list(){
  $('templates').replaceChildren();$('template-count').textContent=`${templates.length} / 12`;$('update-template').disabled=!selected;
  if(!templates.length){const p=document.createElement('p');p.className='empty';p.textContent='아직 보관한 템플릿이 없어요. 첫 번째 한 장을 저장해 볼까요?';$('templates').append(p)}
  for(const t of templates){const row=document.createElement('div');row.className='template'+(t.id===selected?' selected':'');const load=document.createElement('button');load.className='load';load.title=t.name;const name=document.createElement('span');name.className='name';name.textContent=t.name;const mark=document.createElement('span');mark.textContent='▧';load.append(mark,name);load.onclick=()=>busy(async()=>{const next=validateState(t.state),img=next.image?await decode(next.image):null;state={...next};image=img;selected=t.id;$('template-name').value=t.name;sync();list();status('템플릿을 불러왔어요.');saveDraft()});const del=document.createElement('button');del.className='delete';del.textContent='×';del.setAttribute('aria-label',t.name+' 삭제');del.onclick=()=>{if(!confirm(`“${t.name}” 템플릿을 삭제할까요?`))return;try{const next=templates.filter(x=>x.id!==t.id);persist({...data(),templates:next});templates=next;if(selected===t.id)selected=null;list();status('템플릿을 삭제했어요. 현재 편집은 유지돼요.')}catch(e){status(e.message,true)}};row.append(load,del);$('templates').append(row)}
}
function saveTemplate(update=false){try{const name=$('template-name').value.trim();if(!name)throw new Error('템플릿 이름을 입력해 주세요.');if(!update&&templates.length>=12)throw new Error('최대 12개까지 보관할 수 있어요. JSON 백업 후 정리해 주세요.');if(update&&!templates.some(t=>t.id===selected))throw new Error('수정할 템플릿을 먼저 불러와 주세요.');const item={id:update?selected:crypto.randomUUID(),name,state:{...state}},next=update?templates.map(t=>t.id===selected?item:t):[...templates,item];persist({...data(),templates:next});templates=next;selected=item.id;list();status(update?'선택한 템플릿을 수정했어요.':'새 템플릿을 저장했어요.')}catch(e){status(e.message,true)}}
$('save-template').onclick=()=>saveTemplate();$('update-template').onclick=()=>saveTemplate(true);
$('backup').onclick=()=>{download(new Blob([JSON.stringify(data(),null,2)],{type:'application/json'}),'jjal-studio-backup.json');status('현재 편집과 모든 템플릿의 JSON 백업을 준비했어요.')};
$('restore').onchange=e=>{const file=e.target.files[0];e.target.value='';if(!file)return;busy(async()=>{if(file.size>16*1024*1024)throw new Error('JSON은 최대 16MB까지 복원할 수 있어요.');let raw;try{raw=JSON.parse(await file.text())}catch{throw new Error('JSON 문법이 손상됐어요. 현재 편집과 템플릿은 유지돼요.')}const next=validateBackup(raw);for(const s of [next.current,...next.templates.map(t=>t.state)])if(s.image){s.image=(await cleanImage(bytesFromData(s.image))).src}const img=next.current.image?await decode(next.current.image):null;if(!confirm(`현재 편집과 템플릿 목록을 백업의 ${next.templates.length}개로 바꿀까요? 기존 작업이 필요하면 취소 후 JSON 백업을 먼저 받아 주세요.`))return;const blocked=storageBlocked;storageBlocked=false;try{persist(next)}catch(e){storageBlocked=blocked;throw e}state=next.current;templates=next.templates;image=img;selected=null;sync();list();status(`${templates.length}개 템플릿과 편집 내용을 복원했어요.`)})};
async function init(){try{const saved=localStorage.getItem(KEY);if(saved){const d=validateBackup(JSON.parse(saved));for(const s of [d.current,...d.templates.map(t=>t.state)])if(s.image)checkImage(bytesFromData(s.image));image=d.current.image?await decode(d.current.image):null;state=d.current;templates=d.templates}}catch{storageBlocked=true;status('저장 데이터를 읽을 수 없어요. 원본은 덮어쓰지 않았어요. 정상 JSON 백업을 복원해 주세요.',true)}sync();list()}
await init();
