import sys, os, json, subprocess, shutil
from PIL import Image, ImageDraw, ImageFont
W,H,FPS=1080,1920,30
C={"navy":(11,21,48),"gold":(201,162,39),"cream":(247,243,236),"muted":(170,180,205)}
F="/usr/share/fonts/opentype/inter/"
FN={"bold":"Inter-Bold.otf","black":"Inter-Black.otf","semi":"Inter-SemiBold.otf"}
_fc={}
def font(n,s):
    k=(n,s)
    if k not in _fc: _fc[k]=ImageFont.truetype(F+FN[n],s)
    return _fc[k]
spec=json.load(open(sys.argv[1])); out=sys.argv[2]
fr=out+".frames"; shutil.rmtree(fr,ignore_errors=True); os.makedirs(fr)
S=spec["scenes"]; DUR=S[-1][1]; N=int(DUR*FPS)
ease=lambda t:1-(1-t)**3
for i in range(N):
    t=i/FPS; im=Image.new("RGB",(W,H),C["navy"]); d=ImageDraw.Draw(im)
    d.rectangle([90,150,90+int(160*min(1,t/0.6)),160],fill=C["gold"])
    d.text((W//2,H-200),"@bookedandpaidblueprint",font=font("semi",44),fill=C["muted"],anchor="mm")
    for a,b,lines in S:
        if not (a<=t<b): continue
        for k,(txt,fn,sz,col,yo) in enumerate(lines):
            p=ease(max(0,min(1,(t-(a+0.12*k))/0.45)))
            fo=1-max(0,min(1,(t-(b-0.25))/0.25)) if b<DUR else 1
            al=p*fo
            if al<=0: continue
            cc=tuple(int(C["navy"][j]+(C[col][j]-C["navy"][j])*al) for j in range(3))
            d.text((W//2,H//2+yo+int((1-p)*40)),txt,font=font(fn,sz),fill=cc,anchor="mm")
    im.save(f"{fr}/{i:05d}.png")
subprocess.run(["ffmpeg","-y","-loglevel","error","-framerate",str(FPS),"-i",f"{fr}/%05d.png","-f","lavfi","-t",str(DUR),"-i","anullsrc=r=44100:cl=stereo","-shortest","-c:v","libx264","-pix_fmt","yuv420p","-profile:v","high","-crf","20","-c:a","aac","-b:a","128k","-movflags","+faststart",out],check=True)
shutil.rmtree(fr)
