import sys, json, os, textwrap
from PIL import Image, ImageDraw, ImageFont
W,H=1080,1350
C={"navy":(11,21,48),"gold":(201,162,39),"cream":(247,243,236),"muted":(170,180,205),"ink":(26,26,26)}
F="/usr/share/fonts/opentype/inter/"
fnt=lambda n,s: ImageFont.truetype(F+{"black":"Inter-Black.otf","bold":"Inter-Bold.otf","semi":"Inter-SemiBold.otf","reg":"Inter-Regular.otf"}[n],s)
def wrap(d,txt,f,maxw):
    words=txt.split(); lines=[]; cur=""
    for w in words:
        t=(cur+" "+w).strip()
        if d.textlength(t,font=f)<=maxw: cur=t
        else: lines.append(cur); cur=w
    if cur: lines.append(cur)
    return lines
spec=json.load(open(sys.argv[1])); outdir=sys.argv[2]; os.makedirs(outdir,exist_ok=True)
slides=spec["slides"]; n=len(slides)
for i,s in enumerate(slides):
    dark = (i==0 or i==n-1)
    bg=C["navy"] if dark else C["cream"]; fg=C["cream"] if dark else C["ink"]
    im=Image.new("RGB",(W,H),bg); d=ImageDraw.Draw(im)
    d.rectangle([90,120,250,130],fill=C["gold"])
    y=230
    if s.get("kicker"):
        d.text((90,y),s["kicker"].upper(),font=fnt("bold",34),fill=C["gold"]); y+=70
    tf=fnt("black",92 if dark else 72)
    for ln in wrap(d,s["title"],tf,900):
        d.text((90,y),ln,font=tf,fill=fg if not s.get("goldtitle") else C["gold"]); y+=int(tf.size*1.15)
    y+=30
    bf=fnt("semi" if dark else "reg",44)
    for para in s.get("body",[]):
        bullet=para.startswith("• ")
        for j,ln in enumerate(wrap(d,para,bf,880 if not bullet else 860)):
            d.text((90 if (not bullet or j==0) else 125,y),ln,font=bf,fill=C["muted"] if dark else fg); y+=int(bf.size*1.4)
        y+=22
    foot="@bookedandpaidblueprint" + (f"   {i+1}/{n}" if n>1 else "")
    d.text((90,H-110),foot,font=fnt("semi",32),fill=C["muted"] if dark else (110,110,120))
    if i<n-1: d.text((W-90,H-110),"swipe →",font=fnt("bold",32),fill=C["gold"],anchor="ra")
    im.save(f"{outdir}/{i+1:02d}.jpg",quality=92)
