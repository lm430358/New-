from build_reels import *
im=frame("bg/map",50); d=ImageDraw.Draw(im)
d.rounded_rectangle([W//2-300,420,W//2+300,490],35,fill=YEL); d.text((W//2,455),"IF YOU OWN A CLEANING BUSINESS",font=F("popb",32),fill=BLACK,anchor="mm")
d.text((W//2,620),"CLAIM THESE",font=F("anton",170),fill=WHITE,anchor="mm",stroke_width=4,stroke_fill=BLACK)
d.text((W//2,800),"5 FREE LISTINGS",font=F("anton",130),fill=YEL,anchor="mm",stroke_width=4,stroke_fill=BLACK)
y=930
for name in ["Google Business Profile","Apple Business Connect","Bing Places"]:
    d.rounded_rectangle([140,y,940,y+110],30,fill=WHITE); d.ellipse([165,y+25,225,y+85],fill=(46,160,67)); d.text((250,y+55),name,font=F("popb",46),fill=BLACK,anchor="lm"); y+=130
d.text((W//2,y+40),"+ 2 more",font=F("popb",50),fill=WHITE,anchor="mm",stroke_width=4,stroke_fill=BLACK)
im.save("out/cover-listings.jpg",quality=93)
im=frame("bg/stove",30); d=ImageDraw.Draw(im); im=shade(im,60,120,.0); d=ImageDraw.Draw(im)
d.rounded_rectangle([W//2-310,470,W//2+310,544],37,fill=YEL); d.text((W//2,507),"IF YOU OWN A CLEANING BUSINESS",font=F("popb",34),fill=BLACK,anchor="mm")
d.text((W//2,660),"One-time clean",font=F("pop",108),fill=WHITE,anchor="mm",stroke_width=6,stroke_fill=BLACK)
d.text((W//2,790),"↓",font=F("interb",110),fill=YEL,anchor="mm")
d.text((W//2,930),"MONTHLY client",font=F("pop",116),fill=YEL,anchor="mm",stroke_width=6,stroke_fill=BLACK)
d.text((W//2,1090),"Leave these 4 things on the counter",font=F("popb",48),fill=WHITE,anchor="mm",stroke_width=4,stroke_fill=BLACK)
im.save("out/cover-monthly.jpg",quality=93)
