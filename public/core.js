import {FONT_IDS} from './fonts.js';
export const RATIOS={square:[1080,1080],portrait:[1080,1350],story:[1080,1920]};
export const DEFAULT={ratio:'square',preset:'lilac',headline:'오늘도 나는\n제법 괜찮아',caption:'조금 느려도, 내 속도로 가는 중.',font:'sans',align:'center',size:80,color:'#262238',outline:false,fit:'cover',shade:0,top:9,bottom:84,image:null};
export const MAX_FILE=12*1024*1024;
function fail(message){throw new Error(message)}
export function validateState(s){
  if(!s||typeof s!=='object'||Array.isArray(s))fail('편집 데이터가 올바르지 않아요.');
  for(const [key,values] of Object.entries({ratio:Object.keys(RATIOS),preset:['lilac','peach','night'],font:FONT_IDS,align:['left','center','right'],fit:['cover','contain']}))if(!values.includes(s[key]))fail(`${key} 항목이 없거나 올바르지 않아요.`);
  for(const [key,max] of [['headline',160],['caption',240]])if(typeof s[key]!=='string'||s[key].length>max)fail(`${key} 문구가 없거나 너무 길어요.`);
  for(const [key,min,max] of [['size',28,120],['shade',0,70],['top',0,70],['bottom',30,100]])if(!Number.isFinite(s[key])||s[key]<min||s[key]>max)fail(`${key} 값이 허용 범위를 벗어났어요.`);
  if(typeof s.outline!=='boolean'||!/^#[a-f0-9]{6}$/i.test(s.color))fail('글자 색 또는 테두리 값이 올바르지 않아요.');
  if(s.image!==null&&(typeof s.image!=='string'||s.image.length>5*1024*1024||!/^data:image\/(png|jpeg);base64,[A-Za-z0-9+/]+=*$/.test(s.image)))fail('이미지는 PNG·JPEG 데이터만 복원할 수 있어요.');
  return Object.fromEntries(Object.keys(DEFAULT).map(k=>[k,s[k]]));
}
export function validateBackup(raw){
  if(!raw||raw.version!==1||!Array.isArray(raw.templates)||raw.templates.length>12)fail('버전 또는 템플릿 목록이 올바르지 않아요.');
  const ids=new Set(); const templates=raw.templates.map(t=>{
    if(!t||typeof t.id!=='string'||!/^[-a-zA-Z0-9]{1,64}$/.test(t.id)||ids.has(t.id))fail('템플릿 ID가 없거나 중복돼요.');
    ids.add(t.id);
    if(typeof t.name!=='string'||!t.name.trim()||t.name.length>40)fail('템플릿 이름이 없거나 너무 길어요.');
    return {id:t.id,name:t.name.trim(),state:validateState(t.state)};
  });
  return {version:1,current:validateState(raw.current),templates};
}
export function dimensions(bytes){
  if(bytes.length>=24&&[137,80,78,71,13,10,26,10].every((v,i)=>bytes[i]===v)){
    const d=new DataView(bytes.buffer,bytes.byteOffset,bytes.byteLength);
    return {type:'image/png',width:d.getUint32(16),height:d.getUint32(20)};
  }
  if(bytes[0]===255&&bytes[1]===216){
    let p=2;
    while(p+3<bytes.length){
      if(bytes[p++]!==255)fail('JPEG 구조가 손상됐어요.');
      while(bytes[p]===255)p++;
      const marker=bytes[p++];
      if(marker===217||marker===218)break;
      if(marker===1||(marker>=208&&marker<=215))continue;
      const length=(bytes[p]<<8)|bytes[p+1];
      if(length<2||p+length>bytes.length)fail('JPEG 데이터가 손상됐어요.');
      if([192,193,194,195,197,198,199,201,202,203,205,206,207].includes(marker)){
        if(length<8)fail('JPEG 크기 정보가 손상됐어요.');
        return {type:'image/jpeg',width:(bytes[p+5]<<8)|bytes[p+6],height:(bytes[p+3]<<8)|bytes[p+4]};
      }p+=length;
    }
  }
  fail('지원하지 않거나 손상된 파일이에요. 실제 PNG·JPEG 파일을 골라 주세요.');
}
export function checkImage(bytes){
  if(!bytes.length)fail('빈 파일은 불러올 수 없어요.');
  if(bytes.length>MAX_FILE)fail('12MB 이하 이미지를 골라 주세요.');
  const info=dimensions(bytes);
  if(!info.width||!info.height||info.width>16000||info.height>16000||info.width*info.height>24000000)fail('이미지가 너무 크거나 크기 정보가 잘못됐어요. 최대 2,400만 화소예요.');
  return info;
}
export function wrapText(ctx,text,maxWidth){
  const lines=[];
  for(const paragraph of text.split('\n')){
    let line='';
    for(const {segment:char} of new Intl.Segmenter('ko',{granularity:'grapheme'}).segment(paragraph)){
      if(line&&ctx.measureText(line+char).width>maxWidth){lines.push(line);line=char;}else line+=char;
    } lines.push(line);
  }return lines;
}
