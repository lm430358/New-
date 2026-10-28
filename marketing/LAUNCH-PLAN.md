# Booked & Paid — Launch Plan

Two parts: **Kelsey** owns the marketing plan, and **Marcus** owns the ad creative.
Budget: **$50 ad spend**. Source of truth for products and brand: the Booked & Paid
Blueprint site (Lovable project "Bookedandpaidblueprint").

---

## Part 1 — Kelsey: Marketing Plan

### Who we're selling to
Skilled service pros who already do the work, often for someone else: stylists, barbers,
nail & lash techs, cleaners, mechanics, welders, detailers, home services.
The site's own line: **"Good at the work. Tired of the chase."**

This is a sharper audience than "entrepreneurs." The ad talks to people with a trade who
are building someone else's business.

### Products (from the site)
| Product | Price | Role in the ad funnel |
|---|---|---|
| **Go Solo Plan** | $37 | **Ad offer.** It's the "leave your job and start your own service business" product, so it matches the ad's message exactly |
| Get Booked Script Pack | $17 | Lower-priced option on the site for people not ready to leave yet |
| Booked & Paid Blueprint | $67 | Upgrade. The complete system, including the Script Pack. Pitch it to Go Solo buyers |

The ad sends people straight to the **Go Solo Plan** product page.

### $50 budget split (7 days)
| Days | Spend | What happens |
|---|---|---|
| 1–3 | $30 ($10/day) | Instagram + Facebook Reels (Meta Ads Manager). Two hooks at $5/day each (see Part 2) |
| 4–7 | $20 ($5/day) | Turn off the weaker hook. Put all spend on the winner |

- Objective: **Sales** if the Meta pixel is on the site, otherwise **Traffic** to the Go Solo Plan page.
- Placement: Reels + Stories only (the ad is vertical 9:16).
- Targeting: ages 21–45, **local area first** (the site's north star is local service businesses).
  Interests: cosmetology, barbering, nail technician, auto repair, welding, auto detailing, cleaning
  services, small business.
- Repost the same video free on **TikTok, Reels and YouTube Shorts** every day. Change the ending
  button to "Link in bio" for those posts.

### Honest expectations for $50
$50 of cold traffic to a $37 product usually means **0–3 sales**. That's normal. The real value of
this test is learning which hook makes service pros stop, click and buy, before spending more.

| Metric | Healthy for a $50 test |
|---|---|
| Hook rate (3-sec views ÷ impressions) | 25%+ |
| Click-through rate (link) | 1%+ |
| Cost per landing-page view | under $0.75 |
| Landing page → purchase | 1–3% |

If clicks are good but nobody buys, the problem is the product page, not the ad. If the hook rate
is low, change the first scene, not the budget.

### Before turning the ads on
1. **Turn off Stripe test mode.** The site has a `PaymentTestModeBanner`, so make sure live
   payments are on, or ad clicks can't buy.
2. **Add the Meta pixel** to the site so Meta can optimise for purchases and you can see which ad sold.
3. **Give the Go Solo Plan its own page** that the ad can link to directly, not just the homepage.

### After the sale (email, since buyers get the PDF by email)
1. **Day 0:** Download link + "start with the Readiness checklist."
2. **Day 2:** "Your first 10 clients", with one tip from the plan.
3. **Day 4:** Offer the **Blueprint ($67)**: "You've got the plan to go solo. Here's the system to stay booked."
4. **Day 7:** Ask for a review or testimonial. Use it in the next round of ads.

### Weekly content (organic, free)
- 3× short videos: cut-downs of the ad + one trade-specific version per week
  ("Barbers: still renting a chair in someone else's shop?").
- 2× carousels, one from each product: "5 replies to 'how much?'" (Script Pack) and
  "What to set up before you leave your job" (Go Solo Plan).
- Daily stories pointing to the products.

### Ad-policy guardrails
- No income promises. The pop-ups show single deposits ("+$40"), not monthly totals.
- "Go solo" and "your business," not "quit tomorrow."
- Keep the site's disclaimer for Go Solo: general education, not legal or tax advice.

---

## Part 2 — Marcus: 3D Ad Storyboard

**Format:** 9:16 vertical, 15 seconds, 3D objects, bold pop-in captions, upbeat music.
**Brand:** navy, gold and cream; Playfair Display serif headlines; the gold B&P medallion from the
site. Each caption has a matching 3D object.

| # | Time | Caption (pop-in) | 3D object | Motion |
|---|---|---|---|---|
| 1 | 0–3s | Still building **someone else's** business? | Your scissors sending gold coins into "The Boss's Shop" | Coins arc from the tools into the shop door. Already moving at frame 0 |
| 2 | 3–6s | Go **solo.** | Go Solo Plan clipboard: Licensed / Insured / Priced right / First 10 clients | Green checks pop into each box one by one |
| 3 | 6–9s | Get **booked.** | "This week" calendar | Gold BOOKED tiles pop out and fill the week |
| 4 | 9–12s | Get **paid.** | Phone with notifications | "Deposit received +$40", "Paid in full +$120" and "New booking Sat 10:00" pop in |
| 5 | 12–15s | Your skill. Your **business.** | Spinning gold B&P medallion + "Go Solo Plan · $37" | Coin spins in, then the "Get the plan ↓" button bounces in |

**Caption style:** Playfair Display Black in cream. The key word sits on a gold italic pill and pops
in with a bounce. This matches the site's "Get booked. Get paid. Or go solo." headline.

**Hook B (A/B test):** scene 1 caption becomes "Good at the work. **Tired** of the chase."
(the site's own line). The rest of the ad stays the same.

### Attention check (Kelsey)
| Check | Result |
|---|---|
| Hook in the first second | Pass. It asks a question aimed straight at people who work for someone else, and coins are already moving |
| Works with sound off | Pass. Every idea is in the captions |
| Readable on a phone | Pass. 2–4 words per scene for scenes 2–5, in cream and gold on navy |
| Visuals match the words | Pass. Every caption has its own object |
| Matches the brand | Pass. Same colours, font, medallion and "Get booked. Get paid." wording as the site |
| Reels safe zones (top 14% and bottom 35% are covered by app UI) | Pass. All captions, objects and the button sit in the visible middle |
| CTA works for a paid ad | Pass. "Get the plan ↓" points at Meta's own button. Organic posts use "Link in bio" |

### Sample frames
`ad-samples/frame1.png` … `frame5.png` (1080×1920) and `ad-samples/contact.png` (all five).
They are rendered from real 3D scenes (Three.js) in `ad-samples/frame-source.html`. After approval,
the same scenes get animated and exported as the MP4.
