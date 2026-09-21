import {mkdir,copyFile,cp} from 'node:fs/promises';
await mkdir(new URL('./dist/',import.meta.url),{recursive:true});
for(const name of ['index.html','style.css','core.js','app.js','theme.js','theme.css','fonts.js','storage.js'])await copyFile(new URL('./public/'+name,import.meta.url),new URL('./dist/'+name,import.meta.url));
await cp(new URL('./public/fonts/',import.meta.url),new URL('./dist/fonts/',import.meta.url),{recursive:true});
console.log('Copied static assets, fonts, and their licenses to dist.');
