import {validateBackup} from './core.js';
export const DB_NAME='jjal-studio-v2';
export const LEGACY_KEY='jjal-studio-v1';
export const MAX_BACKUP_BYTES=80*1024*1024;
const MAX_LIBRARY_CHARS=64*1024*1024;
let connection,queue=Promise.resolve();
const hashes=new Map();
function openDB(){
  if(!connection)connection=new Promise((resolve,reject)=>{
    const request=indexedDB.open(DB_NAME,1);
    request.onupgradeneeded=()=>{request.result.createObjectStore('workspace');request.result.createObjectStore('images',{keyPath:'id'})};
    request.onsuccess=()=>{request.result.onversionchange=()=>{request.result.close();connection=null};resolve(request.result)};
    request.onerror=()=>{connection=null;reject(request.error)};
    request.onblocked=()=>{connection=null;reject(new Error('다른 편집기 탭을 닫고 다시 열어 주세요.'))};
  });
  return connection;
}
function bytes(data){const raw=atob(data.split(',')[1]);return Uint8Array.from(raw,c=>c.charCodeAt(0))}
function dataURL(blob){return new Promise((resolve,reject)=>{const r=new FileReader();r.onload=()=>resolve(r.result);r.onerror=()=>reject(r.error);r.readAsDataURL(blob)})}
export async function packBackup(input){
  const doc=validateBackup(input),assets=new Map();
  async function packState(state){
    if(!state.image)return {...state};
    let id=hashes.get(state.image);
    if(!id){const hash=await crypto.subtle.digest('SHA-256',bytes(state.image));id='image-'+Array.from(new Uint8Array(hash),b=>b.toString(16).padStart(2,'0')).join('');hashes.set(state.image,id)}
    assets.set(id,state.image);return {...state,image:id};
  }
  const current=await packState(doc.current),templates=[];
  for(const t of doc.templates)templates.push({...t,state:await packState(t.state)});
  const images=Array.from(assets,([id,data])=>({id,data}));
  if(images.reduce((sum,i)=>sum+i.data.length,0)>MAX_LIBRARY_CHARS)throw new Error('사진 보관 용량이 64MB를 넘어요. 백업 후 쓰지 않는 사진 템플릿을 정리해 주세요.');
  for(const [data,id] of hashes)if(!assets.has(id))hashes.delete(data);
  return {version:2,current,templates,images};
}
export function unpackBackup(raw){
  if(raw?.version===1)return validateBackup(raw);
  if(raw?.version!==2||!Array.isArray(raw.images)||raw.images.length>13||!Array.isArray(raw.templates)||raw.templates.length>12)throw new Error('백업 버전 또는 이미지 목록이 올바르지 않아요.');
  const images=new Map();let total=0;
  for(const asset of raw.images){
    if(!asset||typeof asset.id!=='string'||!/^image-[a-f0-9]{64}$/.test(asset.id)||images.has(asset.id)||typeof asset.data!=='string')throw new Error('백업 이미지 ID가 없거나 중복돼요.');
    total+=asset.data.length;if(total>MAX_LIBRARY_CHARS)throw new Error('백업 사진 보관 용량이 64MB를 넘어요.');images.set(asset.id,asset.data);
  }
  const used=new Set();
  function unpackState(state){
    if(!state||typeof state!=='object')throw new Error('편집 데이터가 올바르지 않아요.');
    if(state.image===null)return {...state};
    if(!images.has(state.image))throw new Error('백업에 필요한 사진이 빠져 있어요.');
    used.add(state.image);return {...state,image:images.get(state.image)};
  }
  const doc=validateBackup({version:1,current:unpackState(raw.current),templates:raw.templates.map(t=>({...t,state:unpackState(t?.state)}))});
  if(used.size!==images.size)throw new Error('사용하지 않는 사진이 백업에 포함되어 있어요.');
  return doc;
}
export async function readRawWorkspace(){
  const db=await openDB();
  const record=await new Promise((resolve,reject)=>{
    const tx=db.transaction(['workspace','images'],'readonly'),meta=tx.objectStore('workspace').get('current'),images=tx.objectStore('images').getAll();
    tx.oncomplete=()=>resolve({meta:meta.result,images:images.result});tx.onerror=()=>reject(tx.error);tx.onabort=()=>reject(tx.error);
  });
  if(record.meta===undefined)return null;
  const images=[];for(const asset of record.images)images.push({id:asset.id,data:await dataURL(asset.blob)});
  return {...record.meta,images};
}
export async function readWorkspace(){const raw=await readRawWorkspace();return raw?unpackBackup(raw):null}
export function saveWorkspace(input){
  // Capture the document before a later input changes the live state.
  const snapshot=validateBackup(input);
  const task=queue.catch(()=>{}).then(async()=>{
    const packed=await packBackup(snapshot),db=await openDB(),{images,...meta}=packed;
    const assets=images.map(i=>({id:i.id,blob:new Blob([bytes(i.data)],{type:i.data.startsWith('data:image/png;')?'image/png':'image/jpeg'})}));
    await new Promise((resolve,reject)=>{
      const tx=db.transaction(['workspace','images'],'readwrite'),store=tx.objectStore('images'),keys=store.getAllKeys();let cause;
      keys.onsuccess=()=>{
        try{
        const existing=new Set(keys.result),wanted=new Set(assets.map(a=>a.id));
        for(const asset of assets)if(!existing.has(asset.id))store.put(asset);
        for(const id of existing)if(!wanted.has(id))store.delete(id);
        tx.objectStore('workspace').put(meta,'current');
        }catch(error){cause=error;tx.abort()}
      };
      tx.oncomplete=()=>resolve();tx.onerror=()=>reject(cause||tx.error);tx.onabort=()=>reject(cause||tx.error||new Error('저장 작업이 취소됐어요.'));
    });
  });
  queue=task;return task;
}
