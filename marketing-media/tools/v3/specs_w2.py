import json
from wk import prop_scenes, vo_len, MINT, CORAL, GREEN, CYAN, RED, YEL
C="clips2/"
def cl(f,s=0,l=10,vf="eq=brightness=-0.1"): return [C+f,s,l,vf]
specs=[]

# 10/28 10am: POV proof photos (topcap, lofi)
specs.append(dict(name="w2-proof",style="topcap",dur=17,music=["lofi",3,1.04,11],clips={"a":cl("brush.mp4",0,12)},
 scenes=[[0,3.2,["POV: a client says you didn't clean the baseboards"]],[3.2,6.2,["...and you have the before & after photos"]],
         [6.2,9.2,["Take 2 photos every job"]],[9.2,12.4,["BEFORE you start. AFTER you finish. Same angle."]],
         [12.4,15,["Proof if there's ever a question. Content for your page."]],[15,17,["Save this · Follow for more"]]],
 cover=dict(lines=["POV: a client says you didn't clean the baseboards","(and you have the photos)"],frame=60)))

# 10/29 10am VO: 3 numbers (subs, marimba)
d=vo_len("vo/numbers.mp3")+0.8
specs.append(dict(name="w2-numbers",style="subs",dur=round(d,2),music=["marimba",-2,0.95,21],vo="vo/numbers.mp3",clips={"a":cl("calc.mp4",0,12)},
 scenes=prop_scenes([["If you own a cleaning business,","track these 3 numbers"],["1. Your close rate:","out of 10 quotes, how many book?"],
   ["2. Your rebook rate:","how many first-time clients book again?"],["3. Your average job:","revenue / number of jobs"],
   ["Don't know them?","You're guessing."],["Write them down this week.","Save this."]],0,d-0.6),
 cover=dict(lines=["3 numbers every","cleaning business","should track"],frame=80,opt={"size":84,"y":760})))

# 10/29 6pm: Thanksgiving (stack, funk)
specs.append(dict(name="w2-holiday",style="stack",dur=16,music=["funk",2,1.0,31],clips={"a":cl("food.mp4",0,10,"eq=brightness=-0.22")},opt={"acc":(214,120,40)},
 scenes=[[0,3,["THANKSGIVING","IS NOV 26."]],[3,6,["POST YOUR","HOLIDAY","OPENINGS NOW."]],[6,9,["ON GOOGLE.","ON INSTAGRAM.","IN YOUR BIO."]],
         [9,12,["LIST THE","DATES YOU","REALLY HAVE."]],[12,16,["NO FAKE","\"LAST SPOTS.\"","~SAVE THIS • FOLLOW FOR MORE"]]],
 cover=dict(lines=["THANKSGIVING","IS NOV 26.","POST YOUR","OPENINGS NOW."],frame=60)))

# 10/30 10am: answer the phone (block mint, pop)
specs.append(dict(name="w2-phone",style="block",dur=17,music=["pop",-3,0.97,41],clips={"a":cl("answer.mp4",2,12,"eq=brightness=0")},opt={"bgc":MINT},
 scenes=[[0,3,["ANSWER YOUR","PHONE LIKE THIS"]],[3,6,["\"HI, THIS IS [NAME]","WITH [BUSINESS]!\""]],[6,9,["\"WHAT ARE YOU","LOOKING TO","GET CLEANED?\""]],
         [9,12,["GET THEIR NAME","+ ADDRESS FIRST"]],[12,15,["THEN GIVE A RANGE","+ OFFER A TIME"]],[15,17,["SAVE THIS","~FOLLOW FOR MORE SCRIPTS"]]],
 cover=dict(lines=["ANSWER YOUR","PHONE LIKE THIS","~(copy this script)"],frame=90)))

# 10/30 6pm VO: why quotes go quiet (bar, rnb)
d=vo_len("vo/quiet.mp3")+0.8
specs.append(dict(name="w2-quiet",style="bar",dur=round(d,2),music=["rnb",4,1.05,51],vo="vo/quiet.mp3",clips={"a":cl("sadphone.mp4",0,10)},opt={"size":80},
 scenes=prop_scenes([["WHY DO QUOTES","*GO QUIET?"],["1. ONLY A PRICE.","*NO NEXT STEP."],["2. YOU TOOK","*TOO LONG."],["3. THEY CAN'T PICTURE","*WHAT'S INCLUDED."],
   ["DAY 2: OFFER","*A REAL TIME."],["SAVE THIS FOR","*YOUR NEXT QUOTE"]],0,d-0.6),
 cover=dict(lines=["WHY YOUR QUOTES","*GO QUIET","(3 reasons)"],frame=60,opt={"size":96})))

# 10/31 6pm: referral text (chat, house)
specs.append(dict(name="w2-referral",style="chat",dur=17,music=["house",-1,0.97,61],clips={"a":cl("steps.mp4",0,10)},
 opt={"who":"Maria (deep clean, Tue)","msgs":[["r","Hi Maria! So glad you loved the deep clean. If a friend or neighbor ever needs help, feel free to pass along my number.",0.3],
        ["l","Of course! My sister was just asking.",4.5],["r","Thank you! I'll take great care of her.",7.0]]},
 scenes=[[0,4.3,["THE REFERRAL TEXT"]],[4.3,9,["Send it after a happy clean"]],[9,13,["Short. Friendly. No pressure."]],[13,17,["Save this · Follow for more"]]],
 cover=dict(lines=["THE REFERRAL TEXT (copy it)"],frame=30)))

# 11/1 10am VO: after-hours auto reply (notif, folk)
d=vo_len("vo/night.mp3")+0.8
specs.append(dict(name="w2-night",style="notif",dur=round(d,2),music=["folk",2,1.02,71],vo="vo/night.mp3",clips={"a":cl("notif.mp4",0,7,"eq=brightness=-0.25")},
 scenes=prop_scenes([["9 PM: someone asks for a quote"],["If they wait till tomorrow, they may keep shopping"],["Set an after-hours auto-reply:"],
   ["\"I'll send your quote first thing tomorrow. Address + home size?\""],["You answer fast, even while you rest."],["Save this."]],0,d-0.6),
 opt={"notifs":[["New message","Hi! How much for a 3 bed / 2 bath?",0.4]],"y":1180,"size":76},
 cover=dict(lines=["9 PM quote request?","Send this auto-reply"],frame=40)))

# 11/1 6pm: describe your service (shadow, afro)
specs.append(dict(name="w2-describe",style="shadow",dur=19,music=["afro",-4,0.96,81],clips={"a":cl("cabinet.mp4",0,10)},opt={"size":84},
 scenes=[[0,3.5,["Stop saying","\"we clean houses\""],{"tag":"IF YOU OWN A CLEANING BUSINESS"}],[3.5,6.5,["List exactly","what's included:"]],
         [6.5,9.5,["Kitchen: counters,","appliances, sink"]],[9.5,12.5,["Baths: tub, toilet,","mirrors, floors"]],[12.5,15.5,["Every room: dust,","vacuum, mop"]],
         [15.5,19,["Clear lists make it","easy to say yes."],{"tag":"SAVE THIS"}]],
 cover=dict(lines=["Stop saying","\"we clean houses\""],frame=50,opt={"tag":"IF YOU OWN A CLEANING BUSINESS","size":96})))

# 11/2 10am: raise prices the right way (polaroid, dreamy variant)
specs.append(dict(name="w2-raise",style="polaroid",dur=18,music=["dreamy",3,1.08,91],clips={"a":cl("sticky.mp4",0,12,"eq=brightness=0")},opt={"label":"new rates: Jan 1"},
 scenes=[[0,3.5,["Raising your prices?","Do it like this"]],[3.5,7,["1. New clients first","(quote the new rate now)"]],
         [7,10.5,["2. Current clients:","30 days' notice, in writing"]],[10.5,14,["3. Say what's included","(not sorry, just clear)"]],[14,18,["Save this","Follow for the exact text"]]],
 cover=dict(lines=["Raising your prices?","Do it like this"],frame=60)))

# 11/2 6pm VO: review reply (subs, pop variant)
d=vo_len("vo/reply.mp3")+0.8
specs.append(dict(name="w2-reply",style="subs",dur=round(d,2),music=["pop",5,1.1,101],vo="vo/reply.mp3",clips={"a":cl("msg.mp4",0,12)},opt={"y":1100},
 scenes=prop_scenes([["New Google review?","Reply in 10 seconds"],["5 stars: thank them by first name","+ mention the service"],
   ["3 stars or less: thank them,","say sorry, invite them to call"],["Never share private details.","Never argue."],["Future customers read your replies"],["Save this for your next review"]],0,d-0.6),
 cover=dict(lines=["Reply to any Google","review in 10 seconds"],frame=60,opt={"size":80,"y":800})))

# 11/3 10am: 4 posts besides before/after (bar, lofi variant)
specs.append(dict(name="w2-posts",style="bar",dur=18,music=["lofi",-5,0.92,111],clips={"a":cl("window.mp4",0,12)},opt={"hl":CYAN,"size":84},
 scenes=[[0,3.5,["NOT JUST","*BEFORE & AFTERS"]],[3.5,6.5,["1. MEET","*THE OWNER"]],[6.5,9.5,["2. WHAT'S IN","*A STANDARD CLEAN"]],
         [9.5,12.5,["3. YOUR","*SUPPLIES"]],[12.5,15.5,["4. A REAL REVIEW","*(WITH PERMISSION)"]],[15.5,18,["SAVE THIS","*FOLLOW FOR MORE"]]],
 cover=dict(lines=["4 POSTS THAT","*GET YOU BOOKED","(not before/afters)"],frame=60,opt={"size":92})))

# 11/3 6pm: supplies FAQ (chat, house variant -> use funk variant)
specs.append(dict(name="w2-supplies",style="chat",dur=16,music=["funk",-3,0.94,121],clips={"a":cl("caddy.mp4",0,6)},
 opt={"who":"New customer","msgs":[["l","Do you bring your own supplies?",0.3],
        ["r","Yes! We bring everything. If you have products you prefer (or allergies or pets), just tell us and we'll use yours.",2.6]]},
 scenes=[[0,2.6,["ANSWER THIS BEFORE THEY ASK"]],[2.6,8,["Put it in your FAQ + Google profile"]],[8,12,["Fewer questions = faster bookings"]],[12,16,["Save this · Follow for more"]]],
 cover=dict(lines=["\"Do you bring your own supplies?\""],frame=30)))

# FLAGSHIP Nov 4 6pm: Nextdoor part 2 (VO, checklist-like topcap over suburbs, house variant)
d=vo_len("vo/nextdoor.mp3")+0.8
specs.append(dict(name="f-nextdoor",style="subs",dur=round(d,2),music=["house",3,1.04,131],vo="vo/nextdoor.mp3",clips={"a":cl("suburbs.mp4",0,12,"eq=brightness=-0.15")},opt={"y":1050,"size":66},
 scenes=prop_scenes([["IF YOU OWN A CLEANING BUSINESS","Part 2: get recommended on Nextdoor"],["1. Claim your free Business Page"],
   ["2. After a happy clean,","text your Fave link"],["Only ask people who've hired you"],["3. Put your Fave link / QR code","on receipts, emails + Instagram"],
   ["4. Post a short business update","so neighbors see you're local"],["Never pay for recommendations"],["Save this · Follow for more"]],0,d-0.6),
 cover=dict(lines=["PART 2:","Get recommended","on Nextdoor"],frame=90,opt={"size":96,"y":720})))


# FLAGSHIP Nov 7 10am: client welcome packet (silent POV steps, topcap, marimba variant)
specs.append(dict(name="f-welcome",style="topcap",dur=24,music=["marimba",5,0.9,141],
 clips={"card":["clips/card.mp4",0,7.5,"eq=brightness=-0.08"],"counter":["clips/counter.mp4",2,8,"eq=brightness=-0.08"],"dishes":["clips2/dishes.mp4",0,9,"eq=brightness=-0.08"]},opt={"size":72},
 scenes=[[0,3.5,["IF YOU OWN A CLEANING BUSINESS:","make a welcome packet for every new client"],"counter"],
   [3.5,6.5,["1. A welcome note with your name + photo"],"card"],[6.5,9.5,["2. What happens on the first visit (arrival window + how long)"],"counter"],
   [9.5,12.5,["3. How to get ready: pets, parking, entry, valuables"],"dishes"],[12.5,15.5,["4. What's included + what's not"],"counter"],
   [15.5,18.5,["5. Your reschedule + cancellation policy"],"card"],[18.5,21.5,["6. How to reach you + your review link"],"dishes"],
   [21.5,24,["Save this for your next new client"],"counter"]],
 cover=dict(clip="card",lines=["IF YOU OWN A CLEANING BUSINESS:","What to put in a new-client welcome packet"],frame=60,opt={"size":80})))

json.dump(specs,open("specs_w2.json","w"),indent=1)
print(len(specs))
