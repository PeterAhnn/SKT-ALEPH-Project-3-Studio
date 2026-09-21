import test from 'node:test';
import assert from 'node:assert/strict';
import {DEFAULT} from '../public/core.js';
import {packBackup,unpackBackup} from '../public/storage.js';
const image='data:image/png;base64,AQIDBA==';
const doc=()=>({version:1,current:{...DEFAULT,image},templates:['one','two','three'].map(id=>({id,name:id,state:{...DEFAULT,image}}))});
test('같은 사진은 백업에 한 번만 포함하고 3개 템플릿을 정확히 복원한다',async()=>{const d=doc(),packed=await packBackup(d);assert.equal(packed.images.length,1);assert.deepEqual(unpackBackup(packed),d)});
test('이전 v1 JSON 백업은 계속 읽는다',()=>assert.deepEqual(unpackBackup(doc()),doc()));
test('빠진 이미지와 중복 ID 및 숨은 미사용 이미지를 거부한다',async()=>{
  const packed=await packBackup(doc());
  for(const alter of [x=>x.images=[],x=>x.images.push(x.images[0]),x=>x.images.push({...x.images[0],id:'image-'+'a'.repeat(64)})]){const bad=structuredClone(packed);alter(bad);assert.throws(()=>unpackBackup(bad))}
});
test('v2에서도 필수 문구 누락과 원격 사진 데이터를 거부한다',async()=>{const packed=await packBackup(doc());const bad=structuredClone(packed);delete bad.current.caption;assert.throws(()=>unpackBackup(bad));packed.images[0].data='https://example.com/image.png';assert.throws(()=>unpackBackup(packed))});
