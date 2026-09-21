import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {runInNewContext} from 'node:vm';
const script=readFileSync(new URL('../public/theme.js',import.meta.url),'utf8');
function setup({saved=null,dark=false,blocked=false}={}) {
  const listeners={},documentListeners={},mediaListeners={};
  const control={value:'',addEventListener:(type,fn)=>listeners['select:'+type]=fn};
  const notice={textContent:'',classList:{add(){}}};
  const root={dataset:{}};
  const media={matches:dark,addEventListener:(type,fn)=>mediaListeners[type]=fn};
  const storage=new Map(saved===null?[]:[['jjal-studio-theme',saved]]);
  const document={documentElement:root,getElementById:id=>id==='theme-select'?control:notice,addEventListener:(type,fn)=>documentListeners[type]=fn};
  const localStorage={getItem:k=>{if(blocked)throw Error('blocked');return storage.get(k)??null},setItem:(k,v)=>{if(blocked)throw Error('blocked');storage.set(k,v)}};
  runInNewContext(script,{window:{matchMedia:()=>media,addEventListener:(type,fn)=>listeners[type]=fn},document,localStorage});
  return {root,control,storage,notice,ready:()=>documentListeners.DOMContentLoaded(),choose(value){listeners['select:change']({target:{value}})},system(dark){media.matches=dark;mediaListeners.change()},storageEvent(event){listeners.storage(event)}};
}
test('초기 테마는 DOM 준비 전부터 시스템 light/dark를 따른다',()=>{for(const dark of [false,true]){const env=setup({dark});assert.equal(env.root.dataset.theme,dark?'dark':'light');assert.equal(env.root.dataset.themePreference,'system')}});
test('system mode responds immediately to OS changes',()=>{const e=setup();e.ready();e.system(true);assert.equal(e.root.dataset.theme,'dark');e.system(false);assert.equal(e.root.dataset.theme,'light');assert.equal(e.control.value,'system')});
test('manual choice persists and ignores OS until system is selected',()=>{const e=setup();e.ready();e.choose('dark');e.system(false);assert.equal(e.root.dataset.theme,'dark');assert.equal(e.storage.get('jjal-studio-theme'),'dark');e.choose('system');assert.equal(e.root.dataset.theme,'light');e.system(true);assert.equal(e.root.dataset.theme,'dark')});
test('saved choice wins over OS on next load',()=>{assert.equal(setup({saved:'light',dark:true}).root.dataset.theme,'light');assert.equal(setup({saved:'dark',dark:false}).root.dataset.theme,'dark')});
test('unknown stored value safely uses system',()=>assert.equal(setup({saved:'invalid',dark:true}).root.dataset.theme,'dark'));
test('blocked storage still allows changing theme',()=>{const e=setup({blocked:true});e.ready();e.choose('dark');assert.equal(e.root.dataset.theme,'dark');assert.ok(e.notice.textContent.includes('저장이 차단'))});
test('other-tab theme updates and storage clearing synchronize',()=>{const e=setup();e.ready();e.storageEvent({key:'jjal-studio-theme',newValue:'dark'});assert.equal(e.root.dataset.theme,'dark');e.storageEvent({key:'jjal-studio-v1',newValue:'card'});assert.equal(e.root.dataset.theme,'dark');e.storageEvent({key:null,newValue:null});assert.equal(e.root.dataset.theme,'light');assert.equal(e.control.value,'system')});
