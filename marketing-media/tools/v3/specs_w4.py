import json
from wk import prop_scenes, vo_len, MINT, CORAL, GREEN, CYAN, CREAM, RED, YEL
C="clips3/"
def cl(f,s=0,l=10,vf="eq=brightness=-0.1"): return [C+f,s,l,vf]
specs=[]

# Mon 11/16 6pm: Thanksgiving reschedule text (chat, afro)
specs.append(dict(name="w4-holidaytext",style="chat",dur=17,music=["afro",-1,0.97,165],clips={"a":cl("dinner.mp4",4,10,"eq=brightness=-0.2")},
 opt={"who":"Lisa (every other Thursday)","msgs":[["r","Hi Lisa! I'm closed Thanksgiving (Thu 11/26). Want me to move your clean to Tue 11/24 so the house is ready for guests?",-0.3],
        ["l","Yes please!! Perfect timing.",4.6],["r","Done! See you Tuesday at 9.",7.4]]},
 scenes=[[0,4.6,["TEXT THIS BEFORE THANKSGIVING"]],[4.6,9.5,["Move recurring clients before the holiday"]],[9.5,13.5,["They get a clean house for guests. You keep the booking."]],[13.5,17,["Save this · Follow for more scripts"]]],
 cover=dict(lines=["Text this to clients before Thanksgiving"],frame=40)))

# Tue 11/17 6pm: what to leave after a first clean (polaroid, rnb)
specs.append(dict(name="w4-leavebehind",style="polaroid",dur=17,music=["rnb",5,1.07,166],clips={"a":cl("planner.mp4",2,10,"eq=brightness=0")},opt={"label":"after the first clean"},
 scenes=[[0,3.5,["What to leave after","a first clean"]],[3.5,7,["A handwritten thank-you","with your name"]],[7,10.5,["A card with your","Google review QR code"]],
         [10.5,14,["Their next date,","already offered"]],[14,17,["Save this","Follow for more"]]],
 cover=dict(lines=["What to leave after","a first clean"],frame=60)))

# FLAGSHIP Wed 11/18 6pm VO: Part 2 cancellation policy text (bar, house variant)
d=vo_len("vo/cancel.mp3")+0.8
specs.append(dict(name="f-cancel",style="bar",dur=round(d,2),music=["house",-6,0.94,167],vo="vo/cancel.mp3",
 clips={"a":cl("text1.mp4",2,12,"eq=brightness=-0.2"),"b":cl("planner.mp4",0,10,"eq=brightness=-0.2")},opt={"hl":CORAL,"size":80},
 scenes=[[a,b,l,("a" if i%2==0 else "b")] for i,(a,b,l) in enumerate(prop_scenes([["CLEANING BUSINESS?","*PART 2: COPY THIS","*CANCELLATION TEXT"],
   ["SEND IT BEFORE","*THE FIRST CLEAN"],["\"NEED TO RESCHEDULE?","*48 HOURS' NOTICE\""],["\"WITHIN 24 HOURS, OR","*A LOCKED DOOR = A FEE\""],
   ["PICK YOUR FEE","*(E.G. HALF THE CLEAN)"],["SEND IT WITH","*EVERY CONFIRMATION"],["THEY REPLY YES","*BEFORE THE CALENDAR"],["APPLY IT","*EVERY TIME"],
   ["GRACE EVERY TIME =","*\"YOUR TIME IS FREE\""],["SAVE THIS","*SEND IT TO A CLEANER"]],0,d-0.6))],
 cover=dict(lines=["PART 2:","*THE CANCELLATION","*POLICY TEXT","(copy it)"],frame=60,opt={"size":92})))

# Thu 11/19 6pm: Black Friday gift cards (stack, pop variant)
specs.append(dict(name="w4-giftcards",style="stack",dur=16,music=["pop",6,1.12,168],clips={"a":cl("gift.mp4",0,12,"eq=brightness=-0.28")},opt={"acc":(200,40,60)},
 scenes=[[0,3,["BLACK","FRIDAY?"]],[3,6,["DON'T","DISCOUNT."]],[6,9.5,["SELL","GIFT CARDS."]],[9.5,13,["A CLEAN IS","A GIFT PEOPLE","WANT."]],
         [13,16,["TRY IT.","~SAVE THIS • FOLLOW FOR MORE"]]],
 cover=dict(lines=["BLACK FRIDAY?","DON'T DISCOUNT.","SELL GIFT CARDS."],frame=60)))

# Fri 11/20 6pm: price vs explanation (shadow, lofi variant)
specs.append(dict(name="w4-explain",style="shadow",dur=17,music=["lofi",-3,1.03,169],clips={"a":cl("coffee.mp4",1,9)},opt={"size":86},
 scenes=[[0,3.5,["Your price isn't","too high"],{"tag":"IF YOU OWN A CLEANING BUSINESS"}],[3.5,7,["Your explanation","is too short"]],
         [7,10.5,["Say what's included","and how long it takes"]],[10.5,14,["and what's","not included"]],[14,17,["Clear quotes","get booked"],{"tag":"SAVE THIS"}]],
 cover=dict(lines=["Your price isn't too high.","Your explanation","is too short."],frame=50,opt={"tag":"IF YOU OWN A CLEANING BUSINESS","size":84})))

# FLAGSHIP Sat 11/21 10am (silent, music only): Facebook groups (topcap, folk variant)
specs.append(dict(name="f-facebook",style="topcap",dur=26,music=["folk",-4,1.1,170],
 clips={"s":cl("scroll.mp4",0,12,"eq=brightness=-0.12"),"t":cl("text2.mp4",0,10,"eq=brightness=-0.12"),"l":cl("laptop.mp4",4,10,"eq=brightness=-0.12")},opt={"size":70},
 scenes=[[0,4,["IF YOU OWN A CLEANING BUSINESS:","get clients from local Facebook groups (no spam)"],"s"],
   [4,7.5,["1. Join 3-5 groups for your town"],"t"],[7.5,11,["2. Read the rules. Many allow business posts only on set days"],"s"],
   [11,14.5,["3. Someone asks for a cleaner? Reply fast: one friendly line, your area, how to book"],"l"],
   [14.5,18,["4. Once a week: a real before & after + a short intro"],"t"],[18,21.5,["5. Ask happy clients to tag you when someone asks"],"s"],
   [21.5,24,["No fake reviews. No copy-paste spam."],"l"],[24,26,["Save this · Follow for more"],"t"]],
 cover=dict(clip="s",lines=["IF YOU OWN A CLEANING BUSINESS:","5 steps to get clients from Facebook groups"],frame=60,opt={"size":80})))

# Sun 11/22 6pm: booking form 4 questions (block light blue, marimba variant)
specs.append(dict(name="w4-booklink",style="block",dur=18,music=["marimba",2,0.92,171],clips={"a":cl("text1.mp4",14,8,"eq=brightness=0")},opt={"bgc":[186,214,255]},
 scenes=[[0,3.5,["YOUR BOOKING FORM","SHOULD ASK 4 THINGS"]],[3.5,6.5,["1. ADDRESS","+ ZIP CODE"]],[6.5,9.5,["2. BEDS","+ BATHS"]],
         [9.5,12.5,["3. PETS?","~ANY ALLERGIES TOO"]],[12.5,15.5,["4. PREFERRED","DAY + TIME"]],[15.5,18,["SAVE THIS","~FOLLOW FOR MORE"]]],
 cover=dict(lines=["YOUR BOOKING FORM","SHOULD ASK 4 THINGS"],frame=60)))

json.dump(specs,open("specs_w4.json","w"),indent=1)
print(len(specs))
