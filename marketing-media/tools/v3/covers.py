from build_reels import *
def save(im,n): im.save(f"out/cover-{n}.jpg",quality=93)
def big(d,lines,y,font,size,fill,stroke=0,sc=BLACK,hl=None):
    for k,(txt,h) in enumerate(lines):
        f=F(font,size); w=tw(d,txt,f); x=(W-w)//2; bb=d.textbbox((x,y),txt,font=f)
        if h and hl: d.rectangle([bb[0]-26,bb[1]-18,bb[2]+26,bb[3]+18],fill=hl); d.text((x,y),txt,font=f,fill=BLACK)
        else: d.text((x,y),txt,font=f,fill=fill,stroke_width=stroke,stroke_fill=sc)
        y+=int(size*1.4)
# 1 bio
im=shade(frame("bg/bio",60),40,200,.0); d=ImageDraw.Draw(im)
big(d,[("YOUR INSTAGRAM BIO",False),("HAS 3 SECONDS.",True)],700,"anton",120,WHITE,6,hl=YEL)
d.text((W//2,1150),"Here's what it needs to say →",font=F("interb",56),fill=WHITE,anchor="mm",stroke_width=4,stroke_fill=BLACK); save(im,"bio")
# 2 stock
im=Image.open("bg/camera_cover.jpg").convert("RGB"); d=ImageDraw.Draw(im)
d.rectangle([0,560,W,1060],fill=YEL)
d.text((W//2,700),"STOP USING",font=F("bebas",190),fill=BLACK,anchor="mm"); d.text((W//2,900),"STOCK PHOTOS.",font=F("bebas",190),fill=BLACK,anchor="mm"); save(im,"stock")
# 3 follow
im=frame("bg/text",40); d=ImageDraw.Draw(im)
bubble(im,"Hi Sarah, just following up!",520,"r",1,F("inter",62))
d.text((W//2,860),"STOP SENDING",font=F("pop",120),fill=WHITE,anchor="mm",stroke_width=8,stroke_fill=BLACK)
d.text((W//2,1010),"THIS TEXT.",font=F("pop",120),fill=YEL,anchor="mm",stroke_width=8,stroke_fill=BLACK)
d.text((W//2,1180),"Send this instead →",font=F("interb",60),fill=WHITE,anchor="mm",stroke_width=5,stroke_fill=BLACK); save(im,"follow")
# 4 review ask
im=frame("bg/hand",150); d=ImageDraw.Draw(im); im=shade(im,30,120,.0); d=ImageDraw.Draw(im)
subbox(im,["The 10-second","Google review ask","(copy & paste it)"],700,10,0,F("pop",96)); save(im,"review")
# 5 speed
im=frame("bg/van",100); d=ImageDraw.Draw(im); y=560
for k,txt in enumerate(["DON'T COMPETE","ON PRICE.","COMPETE ON","SPEED."]):
    f=F("anton",150 if k<3 else 220); w=tw(d,txt,f)
    if k==3: d.rectangle([0,y+20,70+w+40,y+f.size+24],fill=RED)
    d.text((70,y),txt,font=f,fill=WHITE,stroke_width=0); y+=int(f.size*1.15)
save(im,"speed")
# 6 missed
im=frame("bg/ring",60); d=ImageDraw.Draw(im)
for k in range(3): notif(im,380+k*190,"Missed call","(470) 555-01"+str(23+k*11),1)
d.text((W//2,1080),"Missed a call",font=F("pop",116),fill=WHITE,anchor="mm",stroke_width=8,stroke_fill=BLACK)
d.text((W//2,1220),"on a job?",font=F("pop",116),fill=(52,199,89),anchor="mm",stroke_width=8,stroke_fill=BLACK)
d.text((W//2,1370),"Text them this →",font=F("interb",62),fill=WHITE,anchor="mm",stroke_width=5,stroke_fill=BLACK); save(im,"missed")
# 7 fake review
im=Image.open("bg/fake.jpg").convert("RGB").resize((W,H)).filter(ImageFilter.GaussianBlur(28)); im=shade(im,110,170,.0); d=ImageDraw.Draw(im)
d.text((W//2,560),"★☆☆☆☆".replace("☆","★"),font=F("inter",1),fill=WHITE)
for k in range(5): 
    cx=W//2-260+k*130; col=(255,193,7) if k==0 else (110,110,120)
    pts=[]; import math
    for j in range(10):
        r=58 if j%2==0 else 24; a=-math.pi/2+j*math.pi/5; pts.append((cx+r*math.cos(a),640+r*math.sin(a)))
    d.polygon(pts,fill=col)
d.text((W//2,830),"Got a FAKE",font=F("serif",150),fill=WHITE,anchor="mm")
d.text((W//2,990),"1-star review?",font=F("serif",130),fill=(255,193,7),anchor="mm")
d.rounded_rectangle([190,1110,890,1230],60,fill=WHITE); d.text((W//2,1170),"How to report it",font=F("popb",62),fill=BLACK,anchor="mm"); save(im,"fakereview")
