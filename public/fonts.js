export const FONT_OPTIONS = [
  {id:'pretendard',label:'프리텐다드 · 깔끔한 고딕',family:'Pretendard',weight:700,file:'Pretendard-Bold.woff2',license:'Pretendard-OFL.txt'},
  {id:'nanum-gothic',label:'나눔고딕 · 편안한 본문',family:'Nanum Gothic',weight:700,file:'NanumGothic-Bold.ttf',license:'NanumGothic-OFL.txt'},
  {id:'nanum-myeongjo',label:'나눔명조 · 차분한 감성',family:'Nanum Myeongjo',weight:700,file:'NanumMyeongjo-Bold.ttf',license:'NanumMyeongjo-OFL.txt'},
  {id:'black-han',label:'검은고딕 · 강렬한 제목',family:'Black Han Sans',weight:400,file:'BlackHanSans-Regular.ttf',license:'BlackHanSans-OFL.txt'},
  {id:'jua',label:'주아체 · 둥글고 귀엽게',family:'Jua',weight:400,file:'Jua-Regular.ttf',license:'Jua-OFL.txt'},
  {id:'dohyeon',label:'도현체 · 또렷한 제목',family:'Do Hyeon',weight:400,file:'DoHyeon-Regular.ttf',license:'DoHyeon-OFL.txt'},
  {id:'nanum-pen',label:'나눔손글씨 펜 · 다정한 손글씨',family:'Nanum Pen Script',weight:400,file:'NanumPenScript-Regular.ttf',license:'NanumPenScript-OFL.txt'},
  {id:'sans',label:'기기 기본 고딕',family:'"Malgun Gothic", "Apple SD Gothic Neo", sans-serif',weight:800},
  {id:'serif',label:'기기 기본 명조',family:'Batang, "Noto Serif CJK KR", serif',weight:800},
  {id:'mono',label:'기기 기본 고정폭',family:'Consolas, "Malgun Gothic", monospace',weight:800},
];
export const FONT_IDS = FONT_OPTIONS.map(font=>font.id);
const pending = new Map();
export function canvasFont(id,size) {
  const font=FONT_OPTIONS.find(font=>font.id===id);
  if(!font)throw new Error('지원하지 않는 글꼴이에요.');
  return `${font.weight} ${size}px ${font.file?'"'+font.family+'", "Malgun Gothic", sans-serif':font.family}`;
}
export async function ensureFont(id) {
  const font=FONT_OPTIONS.find(font=>font.id===id);
  if(!font)throw new Error('지원하지 않는 글꼴이에요.');
  if(!font.file)return;
  if(pending.has(id))return pending.get(id);
  const task=(async()=>{
    let timer;
    try {
      const face=new FontFace(font.family,`url("${new URL('./fonts/'+font.file,import.meta.url).href}")`,{weight:String(font.weight),style:'normal'});
      await Promise.race([face.load(),new Promise((_,reject)=>{timer=setTimeout(()=>reject(new Error('timeout')),15000)})]);
      document.fonts.add(face);
    } catch {
      throw new Error('글꼴을 불러오지 못했어요. 네트워크를 확인하고 다시 선택하거나 이미지 내려받기를 눌러 재시도해 주세요.');
    } finally { clearTimeout(timer); }
  })();
  pending.set(id,task);
  try{await task}catch(error){pending.delete(id);throw error}
}
