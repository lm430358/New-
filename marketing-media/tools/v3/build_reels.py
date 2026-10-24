import sys, os, shutil
from reels import *
YEL=(255,214,64); RED=(255,59,48); BLUE=(10,132,255); WHITE=(255,255,255); BLACK=(12,12,14); NAVY=(11,21,48); GOLD=(201,162,39)
def pingpong(dirn,i):
    n=len(os.listdir(dirn)); p=i%(2*n-2) if n>1 else 0; return frame(dirn,p if p<n else 2*n-2-p)
def run(name,dur,draw,music,lufs=-16):
    fr=f"out/{name}.frames"; shutil.rmtree(fr,ignore_errors=True); os.makedirs(fr)
    for i in range(int(dur*FPS)):
        im=draw(i/FPS,i); im.save(f"{fr}/{i:05d}.jpg",quality=92)
    encode(fr,music,f"out/{name}.mp4",dur,lufs); shutil.rmtree(fr)
def scene(S,t):
    for a,b,p in S:
        if a<=t<b: return a,b,p
    return S[-1]
# ---------- R1: bio — lower-third Anton with yellow highlight bars over cafe footage, lofi
def hl_lines(im,lines,y,t,a,size=118,font="anton",fg=WHITE,hlc=YEL,hlfg=BLACK,center=True):
    d=ImageDraw.Draw(im); f=F(font,size); yy=y
    for k,(txt,hl) in enumerate(lines):
        p=ease((t-a-0.1*k)/0.3)
        step=int(size*1.42)
        if p<=0: yy+=step; continue
        w=tw(d,txt,f); x=(W-w)//2; off=int((1-p)*40); bb=d.textbbox((x,yy+off),txt,font=f)
        if hl:
            d.rectangle([bb[0]-24,bb[1]-16,bb[0]-24+int((bb[2]-bb[0]+48)*p),bb[3]+16],fill=hlc); d.text((x,yy+off),txt,font=f,fill=hlfg)
        else: d.text((x,yy+off),txt,font=f,fill=fg,stroke_width=6,stroke_fill=BLACK)
        yy+=step
def R_bio():
    extract("clips/bio.mp4",0,11.5,"bg/bio","eq=brightness=-0.06")
    S=[(0,3,[("YOUR INSTAGRAM BIO",False),("HAS 3 SECONDS.",True)]),(3,5.6,[("IN 3 SECONDS A",False),("CUSTOMER NEEDS",False),("TO KNOW:",True)]),
       (5.6,7.6,[("WHAT",True),("YOU DO",False)]),(7.6,9.6,[("WHERE",True),("YOU DO IT",False)]),(9.6,11.6,[("HOW",True),("TO BOOK",False)]),
       (11.6,14.6,[("EXAMPLE:",True),("HOME & MOVE-OUT",False),("CLEANING IN KENNESAW",False),("& MARIETTA. BOOK BELOW",False)]),
       (14.6,17.6,[("IS YOUR PROFILE",False),("COSTING YOU CALLS?",True),("FREE SCORE • LINK IN BIO",False)])]
    def draw(t,i):
        im=shade(pingpong("bg/bio",i),0,210,.3); a,b,L=scene(S,t)
        sz=118 if len(L)<=2 else 92
        hl_lines(im,L,1380-len(L)*int(sz*1.42),t,a if a>0 else -1,sz); return im
    run("r-bio",17.6,draw,"music/lofi.wav")
# ---------- R2: stock photos — yellow color block typography + footage window, pop
def R_stock():
    extract("clips/camera.mp4",1,16,"bg/camera")
    S=[(0,2.6,["STOP USING","STOCK PHOTOS."]),(2.6,4.6,["CUSTOMERS","CAN TELL."]),(4.6,7.2,["YOUR REAL WORK","IS YOUR BEST AD."]),
       (7.2,10.6,["EVERY JOB:","BEFORE + AFTER","SAME ANGLE.","GOOD LIGHT."]),(10.6,13.2,["POST THEM ON","GOOGLE AND","INSTAGRAM."]),(13.2,16.2,["HOW DOES YOUR","PROFILE SCORE?","FREE AUDIT • LINK IN BIO"])]
    def draw(t,i):
        im=Image.new("RGB",(W,H),YEL); d=ImageDraw.Draw(im)
        a,b,L=scene(S,t); a=a if a>0 else -1
        yy=250
        for k,txt in enumerate(L):
            p=ease((t-a-0.08*k)/0.22); sz=150 if len(L)<=2 else 118
            if k==len(L)-1 and "LINK" in txt: sz=64; yy+=20
            f=F("bebas",int(sz*(1.25-0.25*p)))
            if p>0: d.text((W//2,yy+int(sz/2)),txt,font=f,fill=BLACK,anchor="mm")
            yy+=int(sz*0.98)
        fw=pingpong("bg/camera",i).resize((900,1600)).crop((0,300,900,1100))
        m=Image.new("L",fw.size,0); ImageDraw.Draw(m).rounded_rectangle([0,0,899,799],48,fill=255)
        d.rounded_rectangle([82,872,1006,1696],56,fill=BLACK); im.paste(fw,(90,880),m)
        d.text((W//2,1760),"@bookedandpaidblueprint",font=F("popb",40),fill=BLACK,anchor="mm"); return im
    run("r-stock",16.2,draw,"music/pop.wav")
# ---------- R3: follow-up — iMessage chat over blurred footage, rnb
def bubble(im,txt,y,side,p,f=None):
    d=ImageDraw.Draw(im); f=f or F("inter",50); lines=wrap(d,txt,f,700); lh=64
    bw=max(tw(d,l,f) for l in lines)+70; bh=len(lines)*lh+44
    x=W-80-bw if side=="r" else 80; col=BLUE if side=="r" else (233,233,235); fg=WHITE if side=="r" else BLACK
    sc=0.6+0.4*p; 
    if p<=0: return y
    layer=Image.new("RGBA",(bw,bh),(0,0,0,0)); ld=ImageDraw.Draw(layer)
    ld.rounded_rectangle([0,0,bw-1,bh-1],44,fill=col+(255,))
    for k,l in enumerate(lines): ld.text((35,22+k*lh),l,font=f,fill=fg)
    layer=layer.resize((max(1,int(bw*sc)),max(1,int(bh*sc))))
    im.paste(layer,(x if side=="l" else x+bw-layer.width,y),layer)
    return y+bh+26
def R_follow():
    extract("clips/texting.mp4",0,12.5,"bg/text","boxblur=18:2,eq=brightness=-0.25")
    def draw(t,i):
        im=pingpong("bg/text",i); d=ImageDraw.Draw(im)
        d.rounded_rectangle([60,180,1020,1180],60,fill=(250,250,252))
        d.text((W//2,250),"Sarah (quote sent Mon)",font=F("interb",44),fill=BLACK,anchor="mm"); d.line([60,300,1020,300],fill=(220,220,225),width=3)
        y=340
        if t<6.2:
            y=bubble(im,"Hi Sarah, just following up!",y,"r",ease((t+1)/0.3))
            y=bubble(im,"Hi Sarah, just following up on that quote 😊".replace(" 😊",""),y,"r",ease((t-1.2)/0.3))
            if t>2.6: d.text((W//2,y+40),"Seen. No reply. 👀".replace(" 👀",""),font=F("inter",40),fill=(140,140,150),anchor="mm")
            cap="STOP SENDING \"JUST FOLLOWING UP\"" if t<3.6 else "IT GIVES THEM NOTHING TO ANSWER."
        else:
            y=bubble(im,"Hi Sarah, I still have Thursday morning open. Want me to put you down?",y,"r",ease((t-6.4)/0.3))
            y=bubble(im,"Yes! Thursday works 🙌".replace(" 🙌",""),y,"l",ease((t-8.6)/0.3))
            cap="TRY THIS INSTEAD:" if t<11 else "A REAL TIME + A YES/NO QUESTION."
            if t>=13.2: cap="LOSING QUOTES TO SILENCE?"
        if t>=13.2:
            d.rounded_rectangle([140,840,940,1110],40,fill=NAVY)
            d.text((W//2,920),"Free visibility score",font=F("popb",56),fill=WHITE,anchor="mm"); d.text((W//2,1020),"Link in bio",font=F("pop",64),fill=YEL,anchor="mm")
        f=F("pop",76); lines=wrap(d,cap,f,960)
        for k,l in enumerate(lines): d.text((W//2,1300+k*92),l,font=f,fill=WHITE,anchor="mm",stroke_width=5,stroke_fill=BLACK)
        return im
    run("r-follow",16.2,draw,"music/rnb.wav")
# ---------- R4: review ask — TikTok subtitle boxes over handoff footage, folk
def subbox(im,lines,y,t,a,f):
    d=ImageDraw.Draw(im)
    for k,l in enumerate(lines):
        p=ease((t-a-0.06*k)/0.2)
        if p<=0: continue
        w=tw(d,l,f); h=f.size+30; x=(W-w)//2
        d.rounded_rectangle([x-28,y-8,x+w+28,y+h-8],22,fill=WHITE); d.text((x,y+int((1-p)*10)),l,font=f,fill=BLACK); y+=h+8
def R_review():
    extract("clips/handoff.mp4",0,9.8,"bg/hand","eq=brightness=-0.04")
    S=[(0,2.8,["The 10-second","review ask ⭐".replace(" ⭐","")]),(2.8,5.0,["Send it within","24 hours of the job"]),
       (5.0,9.8,["\"Thanks for having us!","An honest Google review","really helps a small business","like mine: [link]\""]),
       (9.8,12.6,["Ask EVERY customer.","Never offer a reward."]),(12.6,15.6,["How many reviews","do you have?","Free score • link in bio"])]
    def draw(t,i):
        im=pingpong("bg/hand",i); a,b,L=scene(S,t)
        sz=78 if len(L)<=2 else 60
        subbox(im,L,1180,t,a if a>0 else -1,F("popb",sz)); return im
    run("r-review",15.6,draw,"music/folk.wav")
# ---------- R5: speed — giant stacked Anton slides with red bar over van footage, funk
def R_speed():
    extract("clips/van.mp4",0,9,"bg/van","eq=brightness=-0.15:contrast=1.1")
    S=[(0,2.8,["DON'T","COMPETE","ON PRICE."]),(2.8,5.0,["COMPETE","ON","SPEED."]),(5.0,7.8,["FIRST TO","REPLY OFTEN","GETS THE JOB."]),
       (7.8,9.0,["REPLY IN","1 HOUR."]),(9.0,10.2,["TEXT BACK","MISSED CALLS."]),(10.2,11.4,["QUOTE THE","SAME DAY."]),(11.4,14.4,["HOW FAST","ARE YOU?","FREE SCORE • LINK IN BIO"])]
    def draw(t,i):
        im=pingpong("bg/van",i); d=ImageDraw.Draw(im); a,b,L=scene(S,t); a=a if a>0 else -1
        y=430
        for k,txt in enumerate(L):
            p=ease((t-a-0.09*k)/0.25); small="LINK" in txt
            if small: y+=30
            f=F("anton",70 if small else (230 if len(txt)<=8 else 170))
            w=tw(d,txt,f); x=70-int((1-p)*700)
            if p>0:
                if k==len(L)-1 and not small: d.rectangle([0,y+18,x+w+40,y+f.size+20],fill=RED)
                d.text((x,y),txt,font=f,fill=WHITE)
            y+=int(f.size*1.12)
        return im
    run("r-speed",14.4,draw,"music/funk.wav")
# ---------- R6: missed call — iOS notification banners over phone/handyman footage, house
def notif(im,y,title,body,p,icon=(52,199,89)):
    if p<=0: return
    d=ImageDraw.Draw(im); y=y-int((1-p)*120)
    layer=Image.new("RGBA",(960,170),(0,0,0,0)); ld=ImageDraw.Draw(layer)
    ld.rounded_rectangle([0,0,959,169],44,fill=(245,245,247,int(240*p)))
    ld.rounded_rectangle([30,40,120,130],22,fill=icon+(255,)); ld.rounded_rectangle([58,62,92,108],10,outline=WHITE,width=6)
    ld.text((150,38),title,font=F("interb",42),fill=BLACK); ld.text((150,96),body,font=F("inter",40),fill=(60,60,67))
    ld.text((930,40),"now",font=F("inter",36),fill=(120,120,128),anchor="ra"); im.paste(layer,(60,y),layer)
def R_missed():
    extract("clips/handyman.mp4",0,8,"bg/handy","eq=brightness=-0.12")
    extract("clips/ring.mp4",2,9,"bg/ring","eq=brightness=-0.12")
    def draw(t,i):
        im=pingpong("bg/handy",i) if t<8 else frame("bg/ring",i-240); d=ImageDraw.Draw(im)
        def cap(txt,y=1250,sz=96):
            f=F("pop",sz)
            for k,l in enumerate(wrap(d,txt,f,960)): d.text((W//2,y+k*int(sz*1.15)),l,font=f,fill=WHITE,anchor="mm",stroke_width=7,stroke_fill=BLACK)
        if t<3.4:
            for k in range(3): notif(im,260+k*190,"Missed call","(470) 555-01"+str(23+k*11),ease((t-0.2-0.7*k)/0.3))
            cap("Missed a call on a job?")
        elif t<6.0:
            notif(im,260,"Missed call","No voicemail",1); cap("Most callers won't leave a voicemail.",1200,84)
        elif t<12.6:
            notif(im,260,"Missed call","No voicemail",1)
            bubble(im,"Sorry I missed you, I'm on a job! Text me what you need and your area, and I'll send a price today.",520,"r",ease((t-6.2)/0.3))
            cap("Text them back in minutes.",1300,80)
        elif t<15.2: cap("Set it up once. Save every lead.",1000,96)
        else:
            cap("How fast do you respond?",900,90)
            d.rounded_rectangle([170,1220,910,1360],70,fill=(52,199,89)); d.text((W//2,1290),"Free score • link in bio",font=F("popb",54),fill=WHITE,anchor="mm")
        return im
    run("r-missed",18.0,draw,"music/house.wav")
if __name__=="__main__":
    os.makedirs("out",exist_ok=True); globals()["R_"+sys.argv[1]]()
