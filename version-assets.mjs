import {readFile,writeFile} from 'node:fs/promises';
import {createHash} from 'node:crypto';
const root=new URL('./dist/',import.meta.url);
export async function versionAssets(){
  for(const name of ['index.html','resume.html']){
    const page=new URL(name,root);
    let html=await readFile(page,'utf8');
    const files=[...html.matchAll(/(?:src|href)="([^"?]+\.(?:js|css))(?:\?[^"\s]*)?"/g)].map(m=>m[1]);
    for(const file of new Set(files)){
      const hash=createHash('sha256').update(await readFile(new URL(file,root))).digest('hex').slice(0,12);
      const escaped=file.replace(/[.*+?^${}()|[\]\\]/g,'\\$&');
      html=html.replace(new RegExp('((?:src|href)=")'+escaped+'(?:\\?[^"\\s]*)?"','g'),'$1'+file+'?v='+hash+'"');
    }
    await writeFile(page,html);
  }
}
