import json, os, shutil, subprocess
V='v3/out2'; cap=json.load(open('v3/captions_w3.json'))
plan=[
 ('Nov09-Mon',[('10am','w3-winback'),('6pm','w3-rules')]),
 ('Nov10-Tue',[('10am','w3-followup'),('6pm','w3-area')]),
 ('Nov11-Wed',[('10am','w3-questions'),('6pm','f-review')]),
 ('Nov12-Thu',[('10am','w3-reminder'),('6pm','w3-family')]),
 ('Nov13-Fri',[('10am','w3-onelink'),('6pm','w3-invoice')]),
 ('Nov14-Sat',[('10am','f-latepay'),('6pm','w3-tday')]),
 ('Nov15-Sun',[('10am','w3-5texts'),('6pm','w3-monday')]),
]
out='posts_w3'; shutil.rmtree(out,ignore_errors=True); os.makedirs(out)
txt=["BOOKED & PAID: POSTS FOR NOV 9-15 (copy each caption exactly)","",
"This week is all Reels (2 a day, 10 AM + 6 PM). Carousels were only reaching about 3 people each, so Reels get the slots.",
"FLAGSHIPS: Wed 6 PM (fake Google reviews) and Sat 10 AM (stop chasing payments).","",
"HOW: + > Reel > pick the video > Edit cover > Add from camera roll > pick the COVER image. Keep 'Also share to feed' on.",""]
for day,items in plan:
    dd=f'{out}/{day}'; os.makedirs(dd)
    txt+=['#'*44,day.replace('-',' '),'#'*44]
    for t,name in items:
        slug=name.replace('w3-','').replace('f-','FLAGSHIP-')
        shutil.copy(f'{V}/{name}.mp4',f'{dd}/{t}-{slug}-REEL.mp4'); shutil.copy(f'{V}/cover-{name}.jpg',f'{dd}/{t}-{slug}-COVER.jpg')
        txt+=['',f'{t.upper()}  |  REEL{"  |  FLAGSHIP" if name.startswith("f-") else ""}  |  Files: {t}-{slug}-REEL.mp4 + {t}-{slug}-COVER.jpg','-'*40,cap[name],'']
open(f'{out}/CAPTIONS-NOV9-15.txt','w').write('\n'.join(txt))
for day,_ in plan: subprocess.run(['zip','-qr',f'{day}.zip',day],cwd=out,check=True)
print('ok')
