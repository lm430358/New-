from cars2 import *
chatcar("lowball","p_lowball",("Save these replies","Someone lowballs you? Don't defend your price. Say this."),[
 {"title":"\"Can you do it cheaper?\"","them":"Can you do it for $80?","you":"I can't do the full clean for $80, but I can do the kitchen and bathrooms for that. Want that instead?","why":"You keep your price and offer less scope."},
 {"title":"\"Someone quoted less\"","them":"Another company quoted me less.","you":"Totally fair to compare! Ours includes inside the microwave and baseboards. Happy to hold Thursday for you.","why":"You show value instead of arguing."},
 {"title":"\"That's too much\"","them":"That's more than I wanted to spend.","you":"I understand. If every-2-weeks works better for you, I can send that price too.","why":"Only offer this if you have a recurring rate."},
 {"rule":True,"title":"The rule","body":["Don't apologize.","Don't drop your price.","Offer less scope, a different schedule, or a time."]},
 {"rule":True,"title":"Losing quotes to price shoppers?","body":["Get your free visibility score and see what else is costing you bookings."],"cta":True}])
editorial("quote","p_quote",("Save this","What to put in every cleaning quote"),[
 {"kicker":"1","title":"What's included","body":["Room by room. \"Kitchen: counters, appliances, sink.\""]},
 {"kicker":"2","title":"What's not included","body":["Inside the oven? Windows? Say so up front."]},
 {"kicker":"3","title":"Your price","body":["One clear number, or a tight range if you haven't seen the home."]},
 {"kicker":"4","title":"How long it takes","body":["\"About 3 hours for 2 cleaners.\""]},
 {"kicker":"5","title":"Two time options","body":["\"Tuesday 9 AM or Thursday 1 PM?\""]},
 {"kicker":"6","title":"How to book","body":["\"Reply YES and I'll lock it in.\""]},
 {"title":"Free visibility score","body":["See what else is costing you bookings."],"cta":True}])
checklist("routine","p_routine",("10 minutes a week","Keep your Google profile working"),[
 {"kicker":"Monday","title":"Post 1 photo","body":["A real job, a before/after, or your team","Add one line about the service"]},
 {"kicker":"Wednesday","title":"Reply to reviews","body":["Every review, good or bad","Thank them by first name"]},
 {"kicker":"Friday","title":"Ask for reviews","body":["Text every customer from this week","Your review link + a thank-you"]},
 {"kicker":"Once a month","title":"Check the basics","body":["Hours, services, service area","Holiday hours before holidays"]},
 {"kicker":"How does yours score?","title":"Free visibility score","body":["15 checks in 4 minutes"],"cta":True}])
notebook("refsys","p_referral",("Save this","The 3-step referral system"),[
 {"kicker":"1","title":"Ask after a happy clean","body":["\"If a friend or neighbor ever needs help, feel free to pass along my number.\""]},
 {"kicker":"2","title":"Make it easy","body":["Send your number and booking link in one text they can forward."]},
 {"kicker":"3","title":"Say thank you","body":["A handwritten note or a thank-you on their next clean, if you choose to offer one."]},
 {"title":"Track who sends you clients","body":["Write it down. Thank them every time."],"cta":True}])
coral("gphotos","p_photos",("5 to post this month","Google photos that build trust"),[
 {"num":"01","title":"A before & after","body":["Same angle, good light."]},
 {"num":"02","title":"You or your team","body":["People hire people."]},
 {"num":"03","title":"Your supplies","body":["What you bring to every home."]},
 {"num":"04","title":"A finished room","body":["Show the result, not the client's stuff."]},
 {"num":"05","title":"A seasonal touch","body":["A holiday-ready dining room."]},
 {"title":"Always ask permission","body":["Get the client's OK. Leave out house numbers and personal items. Free visibility score:"],"cta":True}])
receipt("addons","p_deep",("Deep clean add-ons","List these on your quote"),[
 {"kicker":"Add-ons","title":"Price these separately","rows":[["Inside oven","+$__"],["Inside fridge","+$__"],["Inside cabinets","+$__"],["Baseboards","+$__"],["Interior windows","+$__"]],
  "body":["Fill in your own prices."]},
 {"kicker":"Why","title":"Add-ons make big jobs clear","body":["Customers see what costs extra before you arrive.","No surprises on the bill."]},
 {"kicker":"How to offer","title":"\"Want to add the inside of the fridge for $__?\"","body":["Ask when you send the quote, not at the door."]},
 {"title":"Free visibility score","body":["15 checks. 4 minutes."],"cta":True}])
highlights("hl","p_highlights",("Save this","4 Instagram highlights you need"),[
 {"ring":"Book","title":"How to book","body":["Your booking link, how quoting works, and your service area."]},
 {"ring":"Reviews","title":"Reviews","body":["Real screenshots, first names only, with permission."]},
 {"ring":"B & A","title":"Before & after","body":["Your best real results. Same angle, good light."]},
 {"ring":"FAQ","title":"FAQ","body":["Supplies, pets, cancellations, payment."]},
 {"title":"Free visibility score","body":["See how your Instagram and Google profiles score."],"cta":True}])
