import os, sys, subprocess, shutil, glob
from PIL import Image, ImageDraw, ImageFont, ImageFilter
W,H,FPS=1080,1920,30
FD=os.path.dirname(os.path.abspath(__file__))+"/fonts/"
I="/usr/share/fonts/opentype/inter/"
FONTS={"anton":FD+"Anton-Regular.ttf","bebas":FD+"BebasNeue-Regular.ttf","pop":FD+"Poppins-ExtraBold.ttf","popb":FD+"Poppins-Bold.ttf","popm":FD+"Poppins-Medium.ttf",
       "serif":FD+"DMSerifDisplay-Regular.ttf","hand":FD+"Caveat.ttf","inter":I+"Inter-SemiBold.otf","interb":I+"Inter-Bold.otf","mono":"/usr/share/fonts/truetype/jetbrains-mono/JetBrainsMono-Bold.ttf"}
_fc={}
def F(n,s):
    if (n,s) not in _fc: _fc[(n,s)]=ImageFont.truetype(FONTS[n],s)
    return _fc[(n,s)]
ease=lambda t:1-(1-max(0,min(1,t)))**3
def extract(clip,start,dur,out,vf=""):
    if os.path.isdir(out) and len(os.listdir(out))>=int(dur*FPS)-2: return
    shutil.rmtree(out,ignore_errors=True); os.makedirs(out)
    f=f"fps={FPS},scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H}"+(","+vf if vf else "")
    subprocess.run(["ffmpeg","-loglevel","error","-y","-ss",str(start),"-i",clip,"-t",str(dur),"-vf",f,"-q:v","3",f"{out}/%04d.jpg"],check=True)
def frame(dirn,i):
    fs=sorted(glob.glob(dirn+"/*.jpg")); return Image.open(fs[min(i,len(fs)-1)]).convert("RGB")
def tw(d,txt,f): b=d.textbbox((0,0),txt,font=f); return b[2]-b[0]
def wrap(d,txt,f,maxw):
    out=[];cur=""
    for w in txt.split():
        t=(cur+" "+w).strip()
        if tw(d,t,f)<=maxw: cur=t
        else: out.append(cur); cur=w
    out.append(cur); return out
def shade(im,top=0,bot=200,start=.35):
    g=Image.linear_gradient("L").resize((W,H))
    g=g.point(lambda v: int(top+(bot-top)*max(0,(v/255-start)/(1-start))) if v/255>start else int(top))
    im.paste((0,0,0),(0,0),g); return im
def encode(frdir,music,out,dur,lufs=-16):
    subprocess.run(["ffmpeg","-y","-loglevel","error","-framerate",str(FPS),"-i",f"{frdir}/%05d.jpg","-i",music,
     "-filter_complex",f"[1:a]atrim=0:{dur},afade=t=out:st={dur-1.2}:d=1.2,loudnorm=I={lufs}:TP=-1.5[a]","-map","0:v","-map","[a]",
     "-c:v","libx264","-pix_fmt","yuv420p","-profile:v","high","-crf","19","-c:a","aac","-b:a","192k","-ar","44100","-movflags","+faststart","-t",str(dur),out],check=True)
