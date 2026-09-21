import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {FONT_OPTIONS,canvasFont} from '../public/fonts.js';
import {DEFAULT,validateState,validateBackup} from '../public/core.js';
test('추가 폰트 7종에 실제 원본 바이너리와 OFL 고지가 동봉된다',()=>{
  const fonts=FONT_OPTIONS.filter(f=>f.file);assert.equal(fonts.length,7);
  for(const font of fonts){const bytes=readFileSync(new URL('../public/fonts/'+font.file,import.meta.url));assert.ok(bytes.length>1000);assert.ok(bytes.readUInt32BE(0)===0x10000||bytes.toString('ascii',0,4)==='wOF2');const license=readFileSync(new URL('../public/fonts/'+font.license,import.meta.url),'utf8');assert.match(license,/SIL OPEN FONT LICENSE\s+Version 1\.1/);assert.match(license,/Copyright/i)}
});
test('새 폰트와 기존 폰트 10종이 템플릿 JSON을 왕복한다',()=>{
  for(const font of FONT_OPTIONS){const state={...DEFAULT,font:font.id};const backup={version:1,current:state,templates:[{id:'sample',name:'예시',state}]};assert.deepEqual(validateBackup(JSON.parse(JSON.stringify(backup))),backup);assert.ok(canvasFont(font.id,80).startsWith(`${font.weight} 80px `))}
});
test('외부 폰트 URL이나 미등록 폰트는 복원하지 않는다',()=>{for(const font of ['https://example.com/font.ttf','url(evil)','unknown'])assert.throws(()=>validateState({...DEFAULT,font}))});
test('폰트 읽기 실패는 재시도 가능하고 성공한 폰트는 한 번만 로드한다',async()=>{
  const oldFace=globalThis.FontFace,oldDocument=globalThis.document;let loads=0,added=0,fail=true;
  globalThis.FontFace=class{async load(){loads++;if(fail)throw Error('network');return this}};
  globalThis.document={fonts:{add(){added++}}};
  try{const {ensureFont}=await import('../public/fonts.js?loader-test');await assert.rejects(ensureFont('jua'));assert.equal(added,0);fail=false;await Promise.all([ensureFont('jua'),ensureFont('jua')]);assert.equal(loads,2);assert.equal(added,1);await ensureFont('jua');assert.equal(loads,2)}finally{globalThis.FontFace=oldFace;globalThis.document=oldDocument}
});
