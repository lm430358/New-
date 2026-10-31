import json
from wk import prop_scenes, vo_len, MINT, CORAL, GREEN, CYAN, CREAM, RED, YEL
C="clips3/"
def cl(f,s=0,l=10,vf="eq=brightness=-0.1"): return [C+f,s,l,vf]
specs=[]

# Mon 11/9 10am: win-back text (chat, rnb)
specs.append(dict(name="w3-winback",style="chat",dur=17,music=["rnb",-2,1.0,151],clips={"a":cl("text1.mp4",1,10)},
 opt={"who":"Lisa (last clean: August)","msgs":[["r","Hi Lisa! It's been a while. I have a few openings before the holidays. Want me to save one for you?",-0.3],
        ["l","Yes!! I was just thinking about calling you.",4.6],["r","Perfect! Does Tuesday morning work?",7.4]]},
 scenes=[[0,4.6,["THE WIN-BACK TEXT"]],[4.6,9.5,["Send it to clients who stopped booking"]],[9.5,13.5,["Friendly. Specific. A real opening."]],[13.5,17,["Save this · Follow for more scripts"]]],
 cover=dict(lines=["Clients stopped booking? Send this text"],frame=40)))

# Mon 11/9 6pm: Google review rules (bar, afro)
specs.append(dict(name="w3-rules",style="bar",dur=20,music=["afro",3,1.03,152],clips={"a":cl("laptop.mp4",2,12)},opt={"hl":YEL,"size":84},
 scenes=[[0,3.5,["GOOGLE'S REVIEW","*RULES SAY:"]],[3.5,7,["DON'T ASK FOR","*SPECIFIC WORDS"]],[7,10.5,["LIKE YOUR","*CLEANER'S NAME"]],
         [10.5,14,["NO DISCOUNTS","*FOR REVIEWS"]],[14,17.5,["ASK EVERY CUSTOMER,","*NOT JUST HAPPY ONES"]],[17.5,20,["SAVE THIS","*FOLLOW FOR MORE"]]],
 cover=dict(lines=["DON'T ASK CLIENTS TO","*NAME YOUR CLEANER","in Google reviews"],frame=60,opt={"size":88})))

# Tue 11/10 10am VO: 3 follow-up texts (subs, lofi)
d=vo_len("vo/followup.mp3")+0.8
specs.append(dict(name="w3-followup",style="subs",dur=round(d,2),music=["lofi",2,0.98,153],vo="vo/followup.mp3",clips={"a":cl("text2.mp4",0,10)},opt={"y":1080,"size":60},
 scenes=prop_scenes([["Your quote went quiet?","Send these"],["Day 1: \"Any questions about the quote?","I have Thursday morning open.\""],
   ["Day 3: \"Want me to hold Thursday,","or is next week better?\""],["Day 7: \"No worries if the timing","isn't right. Text me anytime.\""],["Then stop."],["Save this for your next quote"]],0,d-0.6),
 cover=dict(lines=["Quote went quiet?","Send these 3 texts"],frame=60,opt={"size":84,"y":780})))

# Tue 11/10 6pm: service area (block coral, pop)
specs.append(dict(name="w3-area",style="block",dur=17,music=["pop",4,1.06,154],clips={"a":cl("mop.mp4",8,12,"eq=brightness=0")},opt={"bgc":CORAL},
 scenes=[[0,3.5,["CLEAN AT","CLIENTS' HOMES?"]],[3.5,7,["SET YOUR GOOGLE","SERVICE AREA"]],[7,10.5,["LIST THE CITIES","YOU REALLY SERVE"]],
         [10.5,14,["HIDE YOUR ADDRESS","IF CLIENTS DON'T","COME TO YOU"]],[14,17,["SAVE THIS","~FOLLOW FOR MORE GOOGLE TIPS"]]],
 cover=dict(lines=["CLEAN AT CLIENTS' HOMES?","SET THIS ON GOOGLE"],frame=90)))

# Wed 11/11 10am: 3 questions before quoting (stack, house)
specs.append(dict(name="w3-questions",style="stack",dur=16,music=["house",-4,0.95,155],clips={"a":cl("vacuum.mp4",1,10,"eq=brightness=-0.22")},opt={"acc":(46,160,120)},
 scenes=[[0,3,["BEFORE YOU","QUOTE, ASK","3 THINGS."]],[3,6,["1. HOW MANY","BEDS + BATHS?"]],[6,9,["2. ONE-TIME","OR RECURRING?"]],
         [9,12,["3. PETS OR","PROBLEM AREAS?"]],[12,16,["THEN GIVE A","REAL PRICE.","~SAVE THIS • FOLLOW FOR MORE"]]],
 cover=dict(lines=["BEFORE YOU","QUOTE, ASK","3 THINGS."],frame=60)))

# FLAGSHIP Wed 11/11 6pm VO: what Google removes (subs, funk)
d=vo_len("vo/review.mp3")+0.8
specs.append(dict(name="f-review",style="subs",dur=round(d,2),music=["funk",5,1.06,156],vo="vo/review.mp3",
 clips={"a":cl("laptop.mp4",0,12,"eq=brightness=-0.15"),"b":cl("text1.mp4",11,10,"eq=brightness=-0.15")},opt={"y":1040,"size":64},
 scenes=[[a,b,l,("a" if i%2==0 else "b")] for i,(a,b,l) in enumerate(prop_scenes([["IF YOU OWN A CLEANING BUSINESS","Fake 1-star review?"],["Here's what Google actually removes"],
   ["Only reviews that break its rules,","not ones you disagree with"],["Not based on a real experience"],["From a competitor, or a","current or former employee"],
   ["Paid for, or given for a discount"],["Harassment, hate or private info"],["To report: Business Profile »","Read reviews » Report"],["Pick the reason » Send"],
   ["Check the status in the","Reviews Management Tool"],["Takes several days.","No violation found? Appeal once."],["Either way, reply politely"],["Save this · Follow for more"]],0,d-0.6))],
 cover=dict(lines=["IF YOU OWN A CLEANING BUSINESS","Fake 1-star review?","What Google removes"],frame=50,opt={"size":76,"y":700})))

# Thu 11/12 10am: night-before reminder (notif, marimba)
specs.append(dict(name="w3-reminder",style="notif",dur=16,music=["marimba",-3,1.05,157],clips={"a":cl("coffee.mp4",0,9,"eq=brightness=-0.2")},
 opt={"notifs":[["Text the night before","See you tomorrow, 9-10 AM! Reply YES",-0.3]],"y":1180,"size":78},
 scenes=[[0,4,["Send this the night before every clean"]],[4,9,["\"See you tomorrow, 9-10 AM! Gate code still 1234? Reply YES.\""]],[9,13,["Confirm the time + how you get in"]],[13,16,["Save this · Follow for more"]]],
 cover=dict(lines=["Send this the night","before every clean"],frame=40)))

# Thu 11/13 6pm: don't ask family for reviews (polaroid, pop variant)
specs.append(dict(name="w3-family",style="polaroid",dur=17,music=["pop",-1,0.93,158],clips={"a":cl("pen.mp4",2,12,"eq=brightness=0")},opt={"label":"real customers only"},
 scenes=[[0,3.5,["Don't ask your mom","for a Google review"]],[3.5,7.5,["Google's rules count family","as a conflict of interest"]],
         [7.5,11,["Same for employees","and competitors"]],[11,14,["Ask real customers","after a real clean"]],[14,17,["Save this","Follow for more"]]],
 cover=dict(lines=["Don't ask your mom","for a Google review"],frame=60)))

# Fri 11/13 10am: one link in bio (shadow, dreamy)
specs.append(dict(name="w3-onelink",style="shadow",dur=17,music=["dreamy",-2,1.0,159],clips={"a":cl("planner.mp4",0,10)},opt={"size":84},
 scenes=[[0,3.5,["Your bio link should","go to ONE place"],{"tag":"IF YOU OWN A CLEANING BUSINESS"}],[3.5,7,["where they can book","or get a quote"]],
         [7,10.5,["Not 6 buttons.","Not \"DM for info.\""]],[10.5,14,["One link.","One next step."]],[14,17,["Save this","Follow for more"],{"tag":"SAVE THIS"}]],
 cover=dict(lines=["Your bio link should","go to ONE place"],frame=50,opt={"tag":"IF YOU OWN A CLEANING BUSINESS","size":92})))

# Fri 11/13 6pm: invoice + review text (chat, folk)
specs.append(dict(name="w3-invoice",style="chat",dur=17,music=["folk",4,1.04,160],clips={"a":cl("mop.mp4",20,10)},
 opt={"who":"Lisa (deep clean, Fri)","msgs":[["r","All done! Here's your invoice + pay link: [link]. Thank you for having us!",-0.3],
        ["l","Paid! The kitchen looks amazing.",4.2],["r","So glad! If you have a sec, an honest Google review would mean a lot: [link]",7.2]]},
 scenes=[[0,4.2,["SEND THIS BEFORE YOU LEAVE"]],[4.2,9,["Invoice + pay link in one text"]],[9,13,["Then ask for the review"]],[13,17,["Save this · Follow for more"]]],
 cover=dict(lines=["Send this before you leave every clean"],frame=30)))

# FLAGSHIP Sat 11/14 10am VO: stop chasing payments (topcap, house variant -> use 'afro' variant? keep distinct: lofi variant)
d=vo_len("vo/latepay.mp3")+0.8
specs.append(dict(name="f-latepay",style="topcap",dur=round(d,2),music=["dreamy",6,1.12,161],vo="vo/latepay.mp3",
 clips={"card":cl("card.mp4",0,10,"eq=brightness=-0.12"),"term":cl("terminal.mp4",0,8,"eq=brightness=-0.12"),"pen":cl("writing.mp4",2,12,"eq=brightness=-0.12")},opt={"size":68},
 scenes=[[a,b,l,k] for (a,b,l),k in zip(prop_scenes([["IF YOU OWN A CLEANING BUSINESS:","stop chasing payments after the clean"],["Set it up BEFORE the clean"],
   ["1. Deposit or card on file when they book"],["2. In writing: payment is due the day of the clean"],["3. Send the invoice + pay link before you leave"],
   ["4. Late? Send ONE friendly text:"],["\"Hi Sarah, today's invoice is still open. Here's the link to pay. Thank you!\""],
   ["5. Late fee ONLY if it was in your policy before they booked"],["You're not begging to get paid. You're running a business."],["Save this · Follow for Part 2: the cancellation policy text"]],0,d-0.6),
   ["card","pen","card","pen","term","card","term","pen","card","term"])],
 cover=dict(clip="card",lines=["IF YOU OWN A CLEANING BUSINESS:","Stop chasing payments.","Do this BEFORE the clean."],frame=60,opt={"size":78})))

# Sat 11/14 6pm: Thanksgiving schedule (stack, funk variant)
specs.append(dict(name="w3-tday",style="stack",dur=16,music=["funk",-5,1.08,162],clips={"a":cl("dinner.mp4",0,12,"eq=brightness=-0.25")},opt={"acc":(214,120,40)},
 scenes=[[0,3,["CLOSED ON","THANKSGIVING?"]],[3,6,["TELL CLIENTS","NOW."]],[6,9.5,["SET HOLIDAY","HOURS ON","GOOGLE."]],[9.5,13,["TEXT RECURRING","CLIENTS THE","NEW DATES."]],
         [13,16,["NO SURPRISES.","~SAVE THIS • FOLLOW FOR MORE"]]],
 cover=dict(lines=["CLOSED ON","THANKSGIVING?","TELL CLIENTS NOW."],frame=60)))

# Sun 11/15 10am: 5 texts to save (block cream, marimba variant)
specs.append(dict(name="w3-5texts",style="block",dur=19,music=["marimba",6,1.1,163],clips={"a":cl("text2.mp4",0,10,"eq=brightness=0")},opt={"bgc":CREAM},
 scenes=[[0,3.5,["5 TEXTS TO SAVE","IN YOUR PHONE"]],[3.5,6.5,["1. MISSED-CALL","TEXT-BACK"]],[6.5,9.5,["2. THE PRICE","RANGE REPLY"]],[9.5,12.5,["3. THE QUOTE","FOLLOW-UP"]],
         [12.5,15.5,["4. THE REVIEW ASK","5. THE REFERRAL ASK"]],[15.5,19,["SAVE THIS","~FOLLOW FOR ALL 5 SCRIPTS"]]],
 cover=dict(lines=["5 TEXTS EVERY","CLEANING BUSINESS","SHOULD SAVE"],frame=60)))

# Sun 11/15 6pm: Monday 10-minute checklist (subs no VO, house variant)
specs.append(dict(name="w3-monday",style="subs",dur=18,music=["house",7,1.12,164],clips={"a":cl("writing.mp4",4,12)},opt={"y":1120,"size":64},
 scenes=[[0,3.5,["Your Monday 10-minute","business checklist"]],[3.5,6.5,["1. Reply to new Google reviews"]],[6.5,9.5,["2. Follow up on open quotes"]],
         [9.5,12.5,["3. Confirm this week's cleans"]],[12.5,15.5,["4. Post 1 real photo"]],[15.5,18,["Save this · Follow for more"]]],
 cover=dict(lines=["Your Monday 10-minute","business checklist"],frame=60,opt={"size":84,"y":780})))

json.dump(specs,open("specs_w3.json","w"),indent=1)
json.dump([x for x in specs if x["name"] in ("w3-winback","w3-invoice","w3-reminder")],open("specs_w3_fix.json","w"),indent=1)
print(len(specs))
