import json, os, math
from reels import F, tw, wrap
from PIL import Image, ImageDraw, ImageFilter
W,H=1080,1350; SP="/home/user/New-/marketing-media/specs/carousels/"
HANDLE="@bookedandpaidblueprint"
def spec(n): return json.load(open(SP+n+".json"))["slides"]
def photo(n): return Image.open(f"photos/{n}.jpg").convert("RGB").resize((W,H))
def text_block(d,txt,font,x,y,maxw,fill,lh=1.25,anchor="l"):
    p=getattr(font,"path","")
    if not any(k in p for k in ("Inter","Anton","JetBrains")): txt=txt.replace(" ↓","").replace("↓","").replace("→","»")
    for l in wrap(d,txt,font,maxw):
        if anchor=="c": d.text((W//2,y),l,font=font,fill=fill,anchor="ma")
        else: d.text((x,y),l,font=font,fill=fill)
        y+=int(font.size*lh)
    return y
def out(name,i,im):
    os.makedirs(f"out/car-{name}",exist_ok=True); im.save(f"out/car-{name}/{i+1}.jpg",quality=93)
def counter(d,i,n,fill,font="popm"): d.text((W-60,60),f"{i+1}/{n}",font=F(font,34),fill=fill,anchor="ra")
# ---- 1 GBP checklist: notebook paper + handwriting
def notebook():
    S=spec("c1"); n=len(S); INK=(28,40,90); RED_=(214,69,65)
    def paper():
        im=Image.new("RGB",(W,H),(252,248,236)); d=ImageDraw.Draw(im)
        for y in range(200,H,72): d.line([0,y,W,y],fill=(190,210,235),width=2)
        d.line([130,0,130,H],fill=(235,150,150),width=3); return im,d
    for i,s in enumerate(S):
        if i==0:
            im=photo("c_gbp"); im=Image.blend(im,Image.new("RGB",(W,H),(0,0,0)),0.25)
            note=Image.new("RGB",(860,700),(252,248,236)); nd=ImageDraw.Draw(note)
            for y in range(120,700,64): nd.line([0,y,860,y],fill=(190,210,235),width=2)
            nd.text((60,40),"SAVE THIS ✔".replace(" ✔",""),font=F("popb",40),fill=RED_)
            nd.text((60,120),"Google Business",font=F("hand",120),fill=INK); nd.text((60,250),"Profile checklist",font=F("hand",120),fill=INK)
            nd.text((60,420),"7 fixes so local customers",font=F("hand",72),fill=INK); nd.text((60,500),"can actually find you",font=F("hand",72),fill=INK)
            nd.text((60,600),"swipe »",font=F("hand",64),fill=RED_)
            note=note.rotate(-3,expand=True,fillcolor=(0,0,0)); m=Image.new("L",(860,700),255).rotate(-3,expand=True)
            sh=Image.new("RGB",note.size,(0,0,0)); im.paste(sh,(120,360),m.filter(ImageFilter.GaussianBlur(20)).point(lambda v:v//2))
            im.paste(note,(100,330),m)
        else:
            im,d=paper(); counter(d,i,n,(120,130,160))
            if "kicker" in s:
                d.text((170,180),s["kicker"],font=F("hand",150),fill=RED_)
            y=400 if "kicker" in s else 300
            # checkbox
            d.rectangle([170,y+20,240,y+90],outline=INK,width=6); d.line([180,y+55,200,y+82],fill=(46,160,67),width=10); d.line([200,y+82,240,y+20],fill=(46,160,67),width=10)
            y=text_block(d,s["title"],F("hand",104),270,y-5,760,INK,1.05)+40
            for b in s["body"]: y=text_block(d,b,F("hand",70),170,y,840,INK,1.03)+20
            if i==n-1:
                d.rounded_rectangle([170,y+30,910,y+150],30,fill=INK); d.text((540,y+90),"Link in bio",font=F("popb",56),fill=(252,248,236),anchor="mm")
            d.text((W//2,H-60),HANDLE,font=F("hand",50),fill=(120,130,160),anchor="mm")
        out("gbp",i,im)
# ---- 2 bio before/after: Instagram-UI mock, white
def biomock():
    S=spec("c3"); n=len(S); GR=(46,160,67); RD=(229,57,53)
    def profile(d,y,bio,good):
        d.rounded_rectangle([90,y,990,y+420],36,fill=(255,255,255),outline=(225,225,230),width=3)
        d.ellipse([130,y+40,290,y+200],fill=(230,230,236)); d.text((210,y+120),"SH",font=F("popb",56),fill=(150,150,160),anchor="mm")
        for k,(num,lab) in enumerate([("48","posts"),("312","followers"),("190","following")]):
            cx=420+k*190; d.text((cx,y+90),num,font=F("popb",48),fill=(20,20,20),anchor="mm"); d.text((cx,y+145),lab,font=F("popm",30),fill=(110,110,120),anchor="mm")
        d.text((130,y+230),"Sparkle Home Co.",font=F("popb",40),fill=(20,20,20))
        text_block(d,bio,F("popm",38),130,y+285,820,(40,40,40),1.3)
    for i,s in enumerate(S):
        im=Image.new("RGB",(W,H),(250,250,251)); d=ImageDraw.Draw(im)
        if i==0:
            im=photo("c_bio"); im=Image.blend(im,Image.new("RGB",(W,H),(0,0,0)),0.15); d=ImageDraw.Draw(im)
            d.rounded_rectangle([60,770,1020,1270],44,fill=(255,255,255))
            d.rounded_rectangle([110,820,330,890],35,fill=RD); d.text((220,855),"BEFORE",font=F("popb",36),fill=(255,255,255),anchor="mm")
            d.text((370,855),"vs",font=F("popm",40),fill=(90,90,100),anchor="lm")
            d.rounded_rectangle([440,820,640,890],35,fill=GR); d.text((540,855),"AFTER",font=F("popb",36),fill=(255,255,255),anchor="mm")
            d.text((110,930),"Same business.",font=F("pop",84),fill=(20,20,20)); d.text((110,1035),"Better bio.",font=F("pop",84),fill=GR)
            d.text((110,1165),"Illustrative example · swipe →",font=F("inter",36),fill=(110,110,120))
        else:
            counter(d,i,n,(140,140,150))
            k=s.get("kicker","")
            col=RD if k=="Before" else GR if k in("After","The rule") else (20,20,20)
            if k: d.rounded_rectangle([90,120,90+tw(d,k.upper(),F("popb",40))+60,190],35,fill=col); d.text((120,155),k.upper(),font=F("popb",40),fill=(255,255,255),anchor="lm")
            if k in("Before","After"):
                profile(d,240,s["title"].strip('"'),k=="After"); y=720
                for b in s["body"]:
                    mark="✕" if k=="Before" else "✓"
                    d.text((110,y),mark,font=F("interb",54),fill=col); y=text_block(d,b.lstrip("• "),F("popb",50),180,y,820,(30,30,30),1.2)+24
            else:
                y=300; y=text_block(d,s["title"],F("pop",96 if i<n-1 else 90),90,y,900,(20,20,20),1.12)+40
                for b in s["body"]: y=text_block(d,b,F("popm",52),90,y,900,(70,70,80),1.3)+20
                if i==n-1: d.rounded_rectangle([90,y+30,700,y+150],60,fill=(20,20,20)); d.text((395,y+90),"Link in bio",font=F("popb",56),fill=(255,255,255),anchor="mm")
            d.text((W//2,H-60),HANDLE,font=F("popm",34),fill=(150,150,160),anchor="mm")
        out("bio",i,im)
# ---- 3 missed calls: coral color blocks + giant numbers
def coral():
    S=spec("c6"); n=len(S); C1=(255,107,87); C2=(255,238,230); DK=(40,18,14)
    for i,s in enumerate(S):
        if i==0:
            im=photo("c_calls"); d=ImageDraw.Draw(im)
            d.rectangle([0,700,W,H],fill=C1)
            d.text((70,740),"MISSED CALLS =",font=F("anton",120),fill=(255,255,255)); d.text((70,890),"MISSED MONEY.",font=F("anton",120),fill=DK)
            d.text((70,1060),"4 fixes for when you're on a job",font=F("popb",52),fill=(255,255,255))
            d.text((70,1150),"swipe →",font=F("interb",44),fill=DK)
        else:
            bgc=C1 if i%2 else C2; fg=(255,255,255) if i%2 else DK; ac=DK if i%2 else C1
            im=Image.new("RGB",(W,H),bgc); d=ImageDraw.Draw(im); counter(d,i,n,fg)
            k=s.get("kicker","")
            if k.startswith("Fix"): d.text((60,60),"0"+k.split()[-1],font=F("anton",420),fill=ac); y=640
            else: y=260
            y=text_block(d,s["title"].upper(),F("anton",110),70,y,940,fg,1.1)+30
            for b in s["body"]: y=text_block(d,b,F("popm",50),70,y,940,fg,1.3)+16
            if i==n-1: d.rounded_rectangle([70,y+30,620,y+150],20,fill=ac); d.text((345,y+90),"LINK IN BIO",font=F("anton",64),fill=bgc,anchor="mm")
            d.text((70,H-80),HANDLE,font=F("popb",34),fill=fg)
        out("calls",i,im)
# ---- 4 reviews: cream editorial serif + gold stars
def stars(d,cx,cy,r,count=5,col=(201,162,39)):
    for k in range(count):
        x=cx+(k-(count-1)/2)*r*2.4; pts=[]
        for j in range(10):
            rr=r if j%2==0 else r*0.42; a=-math.pi/2+j*math.pi/5; pts.append((x+rr*math.cos(a),cy+rr*math.sin(a)))
        d.polygon(pts,fill=col)
def editorial():
    S=spec("c4"); n=len(S); CR=(246,241,231); INK=(30,28,26); GD=(176,137,40)
    for i,s in enumerate(S):
        if i==0:
            im=photo("c_reviews"); d=ImageDraw.Draw(im)
            d.rectangle([0,780,W,H],fill=CR); stars(d,W//2,850,34,col=GD)
            d.text((W//2,960),"10 Google reviews",font=F("serif",104),fill=INK,anchor="mm"); d.text((W//2,1080),"in 30 days",font=F("serif",104),fill=GD,anchor="mm")
            d.text((W//2,1190),"THE RULE-FOLLOWING WAY",font=F("popb",36),fill=INK,anchor="mm")
        else:
            im=Image.new("RGB",(W,H),CR); d=ImageDraw.Draw(im); counter(d,i,n,(140,130,115))
            d.line([90,150,990,150],fill=INK,width=2); d.line([90,H-150,990,H-150],fill=INK,width=2)
            k=s.get("kicker","")
            if k: d.text((W//2,250),k.upper(),font=F("popb",40),fill=GD,anchor="mm")
            y=360; y=text_block(d,s["title"],F("serif",110),90,y,900,INK,1.1,"c")+30
            stars(d,W//2,y+30,20,col=GD); y+=110
            for b in s["body"]: y=text_block(d,b,F("popm",50),90,y,880,(70,64,58),1.4,"c")+20
            if i==n-1: d.rounded_rectangle([290,y+30,790,y+140],55,fill=INK); d.text((540,y+85),"Link in bio",font=F("popb",52),fill=CR,anchor="mm")
            d.text((W//2,H-90),HANDLE,font=F("popm",32),fill=(140,130,115),anchor="mm")
        out("reviews",i,im)
# ---- 5 recurring: receipt on mint
def receipt():
    S=spec("c5"); n=len(S); MINT=(200,236,222); PAPER=(255,255,252); INK=(30,30,30); M="mono"
    def slip(h):
        im=Image.new("RGB",(W,H),MINT); d=ImageDraw.Draw(im)
        d.rectangle([150,110,930,110+h],fill=PAPER)
        for x in range(150,930,30): d.polygon([(x,110+h),(x+15,110+h+18),(x+30,110+h)],fill=PAPER)
        return im,d
    def dash(d,y): 
        for x in range(190,890,24): d.line([x,y,x+12,y],fill=(150,150,150),width=3)
    for i,s in enumerate(S):
        if i==0:
            im=photo("c_recur"); d=ImageDraw.Draw(im)
            d.rectangle([140,700,940,1250],fill=PAPER)
            for x in range(140,940,30): d.polygon([(x,1250),(x+15,1268),(x+30,1250)],fill=PAPER)
            d.text((W//2,760),"*** EXAMPLE MATH ***",font=F(M,36),fill=INK,anchor="mm"); dash(d,800)
            d.text((190,840),"1 client",font=F(M,46),fill=INK); d.text((890,840),"$150",font=F(M,46),fill=INK,anchor="ra")
            d.text((190,910),"x 26 visits",font=F(M,46),fill=INK); dash(d,990)
            d.text((190,1020),"TOTAL/YR",font=F(M,60),fill=INK); d.text((890,1020),"$3,900",font=F(M,60),fill=(20,130,90),anchor="ra")
            d.text((W//2,1160),"Why recurring clients",font=F("popb",44),fill=INK,anchor="mm"); d.text((W//2,1215),"change everything →",font=F("interb",44),fill=INK,anchor="mm")
        else:
            im,d=slip(1000); counter(d,i,n,(60,90,80),M)
            d.text((W//2,180),"BOOKED & PAID",font=F(M,40),fill=INK,anchor="mm"); d.text((W//2,230),"illustrative example",font=F(M,30),fill=(120,120,120),anchor="mm"); dash(d,280)
            y=330
            if s.get("kicker"): d.text((190,y),s["kicker"].upper(),font=F(M,40),fill=(120,120,120)); y+=80
            y=text_block(d,s["title"],F(M,64),190,y,700,INK,1.25)+20; dash(d,y); y+=40
            for b in s["body"]: y=text_block(d,b,F(M,40),190,y,700,(70,70,70),1.35)+16
            if i==n-1: d.rectangle([190,y+20,890,y+130],fill=INK); d.text((540,y+75),"LINK IN BIO",font=F(M,52),fill=PAPER,anchor="mm")
            d.text((W//2,1060),"THANK YOU · COME AGAIN",font=F(M,32),fill=(120,120,120),anchor="mm")
            d.text((W//2,H-80),HANDLE,font=F("popm",34),fill=(60,90,80),anchor="mm")
        out("recur",i,im)
for fn in [notebook,biomock,coral,editorial,receipt]: fn()
