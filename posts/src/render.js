const {chromium}=require('playwright');const fs=require('fs');const path=require('path');
(async()=>{const b=await chromium.launch();const p=await b.newPage({viewport:{width:1080,height:1350}});
for(const f of fs.readdirSync(__dirname).filter(f=>f.endsWith('.html')).sort()){
 await p.goto('file://'+path.join(__dirname,f));await p.waitForTimeout(1500);
 await p.screenshot({path:path.join(__dirname,'..',f.replace('.html','.png'))});console.log(f);}
await b.close();})();
