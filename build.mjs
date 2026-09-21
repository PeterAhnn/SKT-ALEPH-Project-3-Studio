import {mkdir,copyFile} from 'node:fs/promises';
await mkdir(new URL('./dist/',import.meta.url),{recursive:true});
for(const name of ['index.html','style.css','core.js','app.js'])await copyFile(new URL('./public/'+name,import.meta.url),new URL('./dist/'+name,import.meta.url));
console.log('Copied four static assets to dist.');
