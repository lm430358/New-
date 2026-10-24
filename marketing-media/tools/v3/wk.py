"""Generic weekly Reel + cover builder. Each reel spec picks a style, clips, scenes and a music track."""
import os, sys, json, math, shutil, subprocess
from build_reels import *
from PIL import ImageFilter

MINT=(167,232,208); CORAL=(255,107,87); CYAN=(46,230,245); GREEN=(52,199,89); CREAM=(246,241,231); INK=(30,28,26)

def mk_music(path, genre, dur, shift=0, tempo=1.0, seed=1):
    subprocess.run([sys.executable, "music4.py", path, genre, str(dur), str(shift), str(tempo), str(seed)], check=True)

def vo_len(p):
    return float(subprocess.run(["ffprobe","-v","error","-show_entries","format=duration","-of","csv=p=0",p],capture_output=True,text=True).stdout)

def prop_scenes(chunks, start, end, tail=None):
    """Split [start,end] across caption chunks proportional to their length (for voiceover sync)."""
    total=sum(len(" ".join(c if isinstance(c,list) else [c])) for c in chunks); t=start; out=[]
    for c in chunks:
        n=len(" ".join(c if isinstance(c,list) else [c])); d=(end-start)*n/total
        out.append((t,t+d,c)); t+=d
    if tail: out.append((end,end+tail[0],tail[1]))
    return out

def bg(name, clip, start, length, vf="eq=brightness=-0.1"):
    d=f"bg/{name}"; extract(clip,start,length,d,vf); return d

# ---------- styles: each returns an image for time t ----------
def st_topcap(im,t,a,lines,o):
    d=ImageDraw.Draw(im); f=F("popb",o.get("size",70)); y=330
    for k,l in enumerate([w for line in lines for w in wrap(d,line,f,960)]):
        p=ease((t-a-0.06*k)/0.25) if a>0 else 1
        if p<=0: continue
        d.text((W//2,y),l,font=f,fill=WHITE,anchor="ma",stroke_width=8,stroke_fill=BLACK); y+=int(f.size*1.2)
    return im

def st_subs(im,t,a,lines,o):
    f=F("popb",o.get("size",62)); d=ImageDraw.Draw(im)
    ls=[w for line in lines for w in wrap(d,line,f,900)]
    subbox(im,ls,o.get("y",1150),t,a if a>0 else -1,f); return im

def st_stack(im,t,a,lines,o):
    d=ImageDraw.Draw(im); y=o.get("y",440); acc=o.get("acc",RED)
    for k,txt in enumerate(lines):
        p=ease((t-a-0.09*k)/0.25) if a>0 else 1; small=txt.startswith("~"); txt=txt.lstrip("~")
        if small: y+=30
        f=F("anton",70 if small else (220 if len(txt)<=8 else 160 if len(txt)<=12 else 120))
        w=tw(d,txt,f); x=70-int((1-p)*700)
        if p>0:
            if k==len(lines)-1 and not small: d.rectangle([0,y+18,x+w+40,y+f.size+20],fill=acc)
            d.text((x,y),txt,font=f,fill=WHITE)
        y+=int(f.size*1.12)
    return im

def st_block(im,t,a,lines,o,win=None):
    base=Image.new("RGB",(W,H),o.get("bgc",MINT)); d=ImageDraw.Draw(base); yy=250
    for k,txt in enumerate(lines):
        p=ease((t-a-0.08*k)/0.22) if a>0 else 1; small=txt.startswith("~"); txt=txt.lstrip("~")
        sz=64 if small else (140 if len(lines)<=2 else 108)
        f=F("bebas",int(sz*(1.25-0.25*p)))
        while tw(d,txt,f)>980: sz-=6; f=F("bebas",sz)
        if p>0: d.text((W//2,yy+sz//2),txt,font=f,fill=BLACK,anchor="mm")
        yy+=int(sz*0.98)
    fw=im.resize((900,1600)).crop((0,300,900,1100)); m=Image.new("L",fw.size,0); ImageDraw.Draw(m).rounded_rectangle([0,0,899,799],48,fill=255)
    d.rounded_rectangle([82,872,1006,1696],56,fill=BLACK); base.paste(fw,(90,880),m)
    d.text((W//2,1760),"@bookedandpaidblueprint",font=F("popb",40),fill=BLACK,anchor="mm"); return base

def st_bar(im,t,a,lines,o):
    im=shade(im,0,210,.3); sz=o.get("size",104 if len(lines)<=2 else 84)
    hl_lines(im,[(l.lstrip("*"),l.startswith("*")) for l in lines],1380-len(lines)*int(sz*1.42),t,a if a>0 else -1,sz,hlc=o.get("hl",YEL)); return im

def st_shadow(im,t,a,lines,o):
    shadow_text(im,lines,o.get("y",720),t,a,o.get("size",92),tag=o.get("tag")); return im

def st_notif(im,t,a,lines,o):
    d=ImageDraw.Draw(im)
    for k,(ti,bo,ts) in enumerate(o.get("notifs",[])):
        notif(im,260+k*190,ti,bo,ease((t-ts)/0.3) if ts>0 else 1)
    f=F("pop",o.get("size",84)); y=o.get("y",1150)
    for l in [w for line in lines for w in wrap(d,line,f,960)]:
        d.text((W//2,y),l,font=f,fill=WHITE,anchor="mm",stroke_width=7,stroke_fill=BLACK); y+=int(f.size*1.15)
    return im

def st_chat(im,t,a,lines,o):
    im=im.filter(ImageFilter.GaussianBlur(14)); im=Image.eval(im,lambda v:int(v*0.7)); d=ImageDraw.Draw(im)
    d.rounded_rectangle([60,180,1020,1180],60,fill=(250,250,252))
    d.text((W//2,250),o.get("who","Customer"),font=F("interb",44),fill=BLACK,anchor="mm"); d.line([60,300,1020,300],fill=(220,220,225),width=3)
    y=340
    for side,txt,ts in o.get("msgs",[]):
        if t>=ts-0.01: y=bubble(im,txt,y,side,ease((t-ts)/0.3))
    f=F("pop",76)
    for k,l in enumerate(wrap(d," ".join(lines),f,960)): d.text((W//2,1300+k*92),l,font=f,fill=WHITE,anchor="mm",stroke_width=5,stroke_fill=BLACK)
    return im

def st_polaroid(im,t,a,lines,o):
    base=Image.new("RGB",(W,H),(244,236,220)); d=ImageDraw.Draw(base)
    for y in range(0,H,64): d.line([0,y,W,y],fill=(232,222,203),width=2)
    ph=im.resize((700,1244)).crop((0,220,700,920)); fr=Image.new("RGB",(760,860),(255,255,255)); fr.paste(ph,(30,30))
    ImageDraw.Draw(fr).text((380,800),o.get("label",""),font=F("hand",54),fill=INK,anchor="mm")
    fr=fr.rotate(-4,expand=True,fillcolor=(244,236,220)); base.paste(fr,(150,780))
    ImageDraw.Draw(base).rectangle([440,770,640,820],fill=(250,226,140))
    yy=230
    for k,l in enumerate(lines):
        p=ease((t-a-0.1*k)/0.3) if a>0 else 1
        if p<=0: yy+=110; continue
        f=F("hand",112 if k==0 else 92)
        for w2 in wrap(d,l,f,980): d.text((W//2,yy),w2,font=f,fill=INK if k else (200,60,50),anchor="ma"); yy+=int(f.size*1.0)
    d.text((W//2,1780),"@bookedandpaidblueprint",font=F("hand",52),fill=(120,110,95),anchor="mm"); return base

STYLES=dict(topcap=st_topcap,subs=st_subs,stack=st_stack,block=st_block,bar=st_bar,shadow=st_shadow,notif=st_notif,chat=st_chat,polaroid=st_polaroid)

def tup(o):
    return {k:(tuple(v) if isinstance(v,list) and len(v)==3 and all(isinstance(x,int) for x in v) else v) for k,v in o.items()}

def build(spec):
    name=spec["name"]; os.makedirs("out2",exist_ok=True); fr=f"out2/{name}.frames"; shutil.rmtree(fr,ignore_errors=True); os.makedirs(fr)
    clips={k:bg(f"{name}_{k}",*v) for k,v in spec["clips"].items()}
    S=spec["scenes"]; dur=spec["dur"]; style=STYLES[spec["style"]]; o=spec.get("opt",{})
    for i in range(int(dur*FPS)):
        t=i/FPS; sc=next((s for s in S if s[0]<=t<s[1]),S[-1]); a,b,lines=sc[0],sc[1],sc[2]
        extra=sc[3:]; ck=next((x for x in extra if isinstance(x,str)),next(iter(clips))); im=pingpong(clips[ck],i)
        lines=lines if isinstance(lines,list) else [lines]
        oo=dict(o)
        for x in extra:
            if isinstance(x,dict): oo.update(x)
        oo=tup(oo)
        im=style(im,t,a,lines,oo); im.save(f"{fr}/{i:05d}.jpg",quality=92)
    g,sh,tp,sd=spec["music"]; mus=f"out2/{name}.wav"; mk_music(mus,g,dur+1,sh,tp,sd)
    if spec.get("vo"):
        fc=f"[1:a]apad[v];[2:a]volume=0.17[m];[v][m]amix=inputs=2:duration=longest:normalize=0,atrim=0:{dur},afade=t=out:st={dur-1}:d=1,loudnorm=I=-15:TP=-1.5[a]"
        ins=["-i",spec["vo"],"-i",mus]
    else:
        fc=f"[1:a]atrim=0:{dur},afade=t=out:st={dur-1.2}:d=1.2,loudnorm=I=-16:TP=-1.5[a]"; ins=["-i",mus]
    subprocess.run(["ffmpeg","-y","-loglevel","error","-framerate",str(FPS),"-i",f"{fr}/%05d.jpg",*ins,"-filter_complex",fc,"-map","0:v","-map","[a]",
        "-c:v","libx264","-pix_fmt","yuv420p","-profile:v","high","-crf","19","-c:a","aac","-b:a","192k","-ar","44100","-movflags","+faststart","-t",str(dur),f"out2/{name}.mp4"],check=True)
    shutil.rmtree(fr)
    # cover: first scene drawn fully, on a mid-clip frame
    c=spec.get("cover",{}); ck=c.get("clip",next(iter(clips))); im=frame(clips[ck],c.get("frame",45))
    co=dict(o); co.update(c.get("opt",{})); co=tup(co)
    im=STYLES[c.get("style",spec["style"])](im,99,0,c["lines"],co); im.save(f"out2/cover-{name}.jpg",quality=93)

if __name__=="__main__":
    specs=json.load(open(sys.argv[1]))
    for s in specs:
        if len(sys.argv)<3 or s["name"] in sys.argv[2:]: build(s)
