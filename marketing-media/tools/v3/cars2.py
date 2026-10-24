"""Generic carousel styles. Slide 1 is always a photo cover with the headline."""
import os, math
from reels import F, tw, wrap
from PIL import Image, ImageDraw, ImageFilter
W,H=1080,1350; HANDLE="@bookedandpaidblueprint"
NAVY=(11,21,48); GOLD=(201,162,39); WHITE=(255,255,255); BLACK=(20,20,20)

def photo(n): return Image.open(f"photos/{n}.jpg").convert("RGB").resize((W,H))
def tb(d,txt,font,x,y,maxw,fill,lh=1.25,center=False):
    p=getattr(font,"path","")
    if not any(k in p for k in ("Inter","Anton","JetBrains")): txt=txt.replace("→","»").replace("↓","")
    for l in wrap(d,txt,font,maxw):
        d.text((W//2 if center else x,y),l,font=font,fill=fill,anchor="ma" if center else "la"); y+=int(font.size*lh)
    return y
def save(name,i,im): os.makedirs(f"out2/car-{name}",exist_ok=True); im.save(f"out2/car-{name}/{i+1}.jpg",quality=93)
def counter(d,i,n,fill): d.text((W-60,60),f"{i+1}/{n}",font=F("popm",34),fill=fill,anchor="ra")
def cover_band(name,ph,kicker,title,band=(255,255,255),fg=BLACK,acc=GOLD,font="pop",y0=820):
    im=photo(ph); d=ImageDraw.Draw(im); d.rectangle([0,y0,W,H],fill=band)
    d.text((70,y0+50),kicker.upper(),font=F("popb",36),fill=acc)
    y=tb(d,title,F(font,82),70,y0+105,940,fg,1.12); d.text((70,H-80),"swipe »",font=F("popb",36),fill=acc); return im

# ---- chat-bubble carousel (scripts)
def bubble(d,im,txt,y,side,col,fg):
    f=F("inter",42); ls=wrap(d,txt,f,640); bw=max(tw(d,l,f) for l in ls)+60; bh=len(ls)*54+36
    x=W-90-bw if side=="r" else 90
    d.rounded_rectangle([x,y,x+bw,y+bh],38,fill=col)
    for k,l in enumerate(ls): d.text((x+30,y+18+k*54),l,font=f,fill=fg)
    return y+bh+30
def chatcar(name,ph,cover,slides):
    n=len(slides)+1; im=cover_band(name,ph,*cover); save(name,0,im)
    for i,s in enumerate(slides,1):
        im=Image.new("RGB",(W,H),(239,242,247)); d=ImageDraw.Draw(im); counter(d,i,n,(120,120,130))
        if s.get("rule"):
            d.rounded_rectangle([70,300,1010,1050],40,fill=NAVY)
            y=tb(d,s["title"],F("pop",70),120,360,840,WHITE,1.15)+30
            for b in s["body"]: y=tb(d,b,F("popm",44),120,y,840,(220,225,240),1.35)+14
            if s.get("cta"): d.rounded_rectangle([120,y+30,620,y+140],55,fill=GOLD); d.text((370,y+85),"Link in bio",font=F("popb",48),fill=NAVY,anchor="mm")
        else:
            d.text((90,150),s["title"].upper(),font=F("popb",40),fill=(90,90,110))
            y=230; y=bubble(d,im,s["them"],y,"l",(255,255,255),BLACK); d.text((W-90,y-10),"YOU REPLY:",font=F("popb",30),fill=(10,132,255),anchor="ra"); y+=40
            y=bubble(d,im,s["you"],y,"r",(10,132,255),WHITE)
            if s.get("why"): tb(d,"Why it works: "+s["why"],F("popm",38),90,y+40,900,(70,70,90),1.35)
        d.text((W//2,H-60),HANDLE,font=F("popm",32),fill=(140,140,150),anchor="mm"); save(name,i,im)

# ---- editorial cream serif
def stars(d,cx,cy,r,col=(176,137,40)):
    for k in range(5):
        x=cx+(k-2)*r*2.4; pts=[]
        for j in range(10):
            rr=r if j%2==0 else r*0.42; a=-math.pi/2+j*math.pi/5; pts.append((x+rr*math.cos(a),cy+rr*math.sin(a)))
        d.polygon(pts,fill=col)
def editorial(name,ph,cover,slides):
    CR=(246,241,231); INK=(30,28,26); GD=(176,137,40); n=len(slides)+1
    im=photo(ph); d=ImageDraw.Draw(im); d.rectangle([0,800,W,H],fill=CR)
    d.text((W//2,860),cover[0].upper(),font=F("popb",36),fill=GD,anchor="mm")
    y=tb(d,cover[1],F("serif",96),0,910,940,INK,1.08,True); save(name,0,im)
    for i,s in enumerate(slides,1):
        im=Image.new("RGB",(W,H),CR); d=ImageDraw.Draw(im); counter(d,i,n,(140,130,115))
        d.line([90,150,990,150],fill=INK,width=2); d.line([90,H-150,990,H-150],fill=INK,width=2)
        if s.get("kicker"): d.text((W//2,250),s["kicker"].upper(),font=F("popb",40),fill=GD,anchor="mm")
        y=tb(d,s["title"],F("serif",104),0,340,900,INK,1.1,True)+40
        for b in s["body"]: y=tb(d,b,F("popm",48),0,y,860,(70,64,58),1.4,True)+16
        if s.get("cta"): d.rounded_rectangle([290,y+30,790,y+140],55,fill=INK); d.text((540,y+85),"Link in bio",font=F("popb",52),fill=CR,anchor="mm")
        d.text((W//2,H-90),HANDLE,font=F("popm",32),fill=(140,130,115),anchor="mm"); save(name,i,im)

# ---- checklist cards on dark green
def checklist(name,ph,cover,slides):
    BG=(16,58,48); CARD=(250,250,246); AC=(120,220,160); n=len(slides)+1
    im=photo(ph); im=Image.blend(im,Image.new("RGB",(W,H),BG),0.35); d=ImageDraw.Draw(im)
    d.rounded_rectangle([70,640,1010,1250],40,fill=CARD)
    d.text((120,690),cover[0].upper(),font=F("popb",36),fill=BG)
    tb(d,cover[1],F("pop",80),120,750,840,BLACK,1.12); save(name,0,im)
    for i,s in enumerate(slides,1):
        im=Image.new("RGB",(W,H),BG); d=ImageDraw.Draw(im); counter(d,i,n,AC)
        d.text((80,160),s.get("kicker","").upper(),font=F("popb",44),fill=AC)
        y=tb(d,s["title"],F("pop",84),80,230,920,WHITE,1.1)+40
        for b in s["body"]:
            d.rounded_rectangle([80,y,1000,y+150],30,fill=CARD)
            d.rounded_rectangle([110,y+45,170,y+105],12,outline=BG,width=6); d.line([122,y+76,138,y+94],fill=(40,160,90),width=9); d.line([138,y+94,166,y+52],fill=(40,160,90),width=9)
            tb(d,b,F("popb",40),200,y+30,770,BLACK,1.2); y+=175
        if s.get("cta"): d.rounded_rectangle([80,y+20,600,y+130],55,fill=AC); d.text((340,y+75),"Link in bio",font=F("popb",50),fill=BG,anchor="mm")
        d.text((80,H-80),HANDLE,font=F("popm",32),fill=AC); save(name,i,im)

# ---- notebook / handwritten
def notebook(name,ph,cover,slides):
    INK=(28,40,90); RD=(214,69,65); n=len(slides)+1
    im=photo(ph); im=Image.blend(im,Image.new("RGB",(W,H),(0,0,0)),0.2)
    note=Image.new("RGB",(860,640),(252,248,236)); nd=ImageDraw.Draw(note)
    for y in range(120,640,64): nd.line([0,y,860,y],fill=(190,210,235),width=2)
    nd.text((60,40),cover[0].upper(),font=F("popb",40),fill=RD)
    tb(nd,cover[1],F("hand",104),60,110,760,INK,0.98); nd.text((60,560),"swipe »",font=F("hand",62),fill=RD)
    m=Image.new("L",note.size,255).rotate(-3,expand=True); note=note.rotate(-3,expand=True,fillcolor=(0,0,0)); im.paste(note,(100,380),m); save(name,0,im)
    for i,s in enumerate(slides,1):
        im=Image.new("RGB",(W,H),(252,248,236)); d=ImageDraw.Draw(im)
        for y in range(200,H,72): d.line([0,y,W,y],fill=(190,210,235),width=2)
        d.line([130,0,130,H],fill=(235,150,150),width=3); counter(d,i,n,(120,130,160))
        if s.get("kicker"): d.text((170,170),s["kicker"],font=F("hand",140),fill=RD)
        y=400 if s.get("kicker") else 300
        y=tb(d,s["title"],F("hand",100),170,y,840,INK,1.02)+30
        for b in s["body"]: y=tb(d,b,F("hand",68),170,y,840,INK,1.04)+18
        if s.get("cta"): d.rounded_rectangle([170,y+30,910,y+150],30,fill=INK); d.text((540,y+90),"Link in bio",font=F("popb",56),fill=(252,248,236),anchor="mm")
        d.text((W//2,H-60),HANDLE,font=F("hand",50),fill=(120,130,160),anchor="mm"); save(name,i,im)

# ---- coral numbers
def coral(name,ph,cover,slides):
    C1=(255,107,87); C2=(255,238,230); DK=(40,18,14); n=len(slides)+1
    im=photo(ph); d=ImageDraw.Draw(im); d.rectangle([0,700,W,H],fill=C1)
    y=tb(d,cover[1].upper(),F("anton",112),70,740,940,(255,255,255),1.08)
    d.text((70,y+20),cover[0],font=F("popb",48),fill=DK); save(name,0,im)
    for i,s in enumerate(slides,1):
        bgc=C1 if i%2 else C2; fg=(255,255,255) if i%2 else DK; ac=DK if i%2 else C1
        im=Image.new("RGB",(W,H),bgc); d=ImageDraw.Draw(im); counter(d,i,n,fg)
        if s.get("num"): d.text((60,60),s["num"],font=F("anton",400),fill=ac); y=620
        else: y=260
        y=tb(d,s["title"].upper(),F("anton",104),70,y,940,fg,1.1)+30
        for b in s["body"]: y=tb(d,b,F("popm",48),70,y,940,fg,1.3)+14
        if s.get("cta"): d.rounded_rectangle([70,y+30,620,y+150],20,fill=ac); d.text((345,y+90),"LINK IN BIO",font=F("anton",64),fill=bgc,anchor="mm")
        d.text((70,H-80),HANDLE,font=F("popb",34),fill=fg); save(name,i,im)

# ---- receipt
def receipt(name,ph,cover,slides):
    MINT=(200,236,222); PAPER=(255,255,252); INK=(30,30,30); M="mono"; n=len(slides)+1
    def dash(d,y,x0=190,x1=890):
        for x in range(x0,x1,24): d.line([x,y,x+12,y],fill=(150,150,150),width=3)
    im=photo(ph); d=ImageDraw.Draw(im); d.rectangle([140,700,940,1250],fill=PAPER)
    for x in range(140,940,30): d.polygon([(x,1250),(x+15,1268),(x+30,1250)],fill=PAPER)
    d.text((W//2,760),"*** "+cover[0].upper()+" ***",font=F(M,34),fill=INK,anchor="mm"); dash(d,800)
    y=tb(d,cover[1],F(M,58),190,840,700,INK,1.2); dash(d,y+10); d.text((W//2,y+60),"swipe »",font=F(M,36),fill=INK,anchor="mm"); save(name,0,im)
    for i,s in enumerate(slides,1):
        im=Image.new("RGB",(W,H),MINT); d=ImageDraw.Draw(im); d.rectangle([150,110,930,1110],fill=PAPER)
        for x in range(150,930,30): d.polygon([(x,1110),(x+15,1128),(x+30,1110)],fill=PAPER)
        counter(d,i,n,(60,90,80)); d.text((W//2,180),"BOOKED & PAID",font=F(M,40),fill=INK,anchor="mm"); dash(d,240); y=290
        if s.get("kicker"): d.text((190,y),s["kicker"].upper(),font=F(M,36),fill=(120,120,120)); y+=70
        y=tb(d,s["title"],F(M,58),190,y,700,INK,1.25)+16; dash(d,y); y+=36
        for row in s.get("rows",[]):
            d.text((190,y),row[0],font=F(M,42),fill=INK); d.text((890,y),row[1],font=F(M,42),fill=INK,anchor="ra"); y+=64
        for b in s.get("body",[]): y=tb(d,b,F(M,38),190,y,700,(70,70,70),1.35)+12
        if s.get("cta"): d.rectangle([190,y+20,890,y+130],fill=INK); d.text((540,y+75),"LINK IN BIO",font=F(M,50),fill=PAPER,anchor="mm")
        d.text((W//2,H-80),HANDLE,font=F("popm",34),fill=(60,90,80),anchor="mm"); save(name,i,im)

# ---- Instagram highlights mock
def highlights(name,ph,cover,slides):
    n=len(slides)+1; im=cover_band(name,ph,*cover,band=(255,255,255),acc=(214,41,118)); save(name,0,im)
    for i,s in enumerate(slides,1):
        im=Image.new("RGB",(W,H),(250,250,251)); d=ImageDraw.Draw(im); counter(d,i,n,(140,140,150))
        if s.get("ring"):
            cx,cy=W//2,420
            for r,c in [(190,(214,41,118)),(176,(255,255,255)),(166,(240,236,246))]: d.ellipse([cx-r,cy-r,cx+r,cy+r],fill=c)
            d.text((cx,cy),s["ring"],font=F("popb",60),fill=(60,60,70),anchor="mm"); y=660
        else: y=300
        y=tb(d,s["title"],F("pop",86),0,y,920,BLACK,1.1,True)+30
        for b in s["body"]: y=tb(d,b,F("popm",46),0,y,880,(70,70,80),1.35,True)+12
        if s.get("cta"): d.rounded_rectangle([290,y+30,790,y+140],55,fill=BLACK); d.text((540,y+85),"Link in bio",font=F("popb",52),fill=WHITE,anchor="mm")
        d.text((W//2,H-60),HANDLE,font=F("popm",34),fill=(150,150,160),anchor="mm"); save(name,i,im)
