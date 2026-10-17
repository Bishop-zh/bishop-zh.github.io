import { createRequire } from 'node:module';
import { stat } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
const require=createRequire(import.meta.url);
const sharp=require('C:/Users/zhuji/.cache/codex-runtimes/codex-primary-runtime/dependencies/node/node_modules/sharp');
for(const name of ['rust-menu-preview','rust-levels-preview','rust-settings-preview']){
  const source=fileURLToPath(new URL('../'+name+'.png',import.meta.url));
  const destination=fileURLToPath(new URL('./dist/assets/'+name+'.webp',import.meta.url));
  await sharp(source).webp({quality:86,effort:5}).toFile(destination);
  console.log(JSON.stringify({asset:name,originalBytes:(await stat(source)).size,webpBytes:(await stat(destination)).size}));
}
