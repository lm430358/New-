# Booked & Paid — Digital Product Launch Plan

Two parts: **Kelsey** owns the marketing plan, and **Marcus** owns the ad creative.
Budget: **$50 ad spend**.

---

## Part 1 — Kelsey: Marketing Plan

### Goal
Get the first paying customers for the digital products and find out which message
sells best. With $50, the job is to **test and learn**, not to scale.

### Audience
Entrepreneurs with a 9–5 job (roughly age 24–45) who want income they control. They
follow side-hustle, online business and "quit your job" creators.

### Offer structure
| Tier | Example | Price | Job |
|---|---|---|---|
| Free lead magnet | "Booked & Paid Starter Kit" checklist / mini-guide | $0 | Collects emails from ad traffic |
| Entry product | Template or e-book | $9–$27 | First purchase, low risk |
| Core product | Course or bundle | $47–$97 | Main profit |

The ad sends people to the **free Booked & Paid Starter Kit** first. Cold traffic rarely buys on the
first click, but it will give an email. Then the email sequence sells the paid products.

### $50 budget split (7 days)
| Days | Spend | What happens |
|---|---|---|
| 1–3 | $30 ($10/day) | Run the 3D ad on **Instagram + Facebook Reels** (Meta Ads Manager), with 2 hook variations at $5/day each |
| 4–7 | $20 ($5/day) | Turn off the weaker hook. Put all spend on the winner |

- Objective: **Leads** (or Traffic to the Starter Kit page if Leads isn't available).
- Placement: Reels + Stories only (the ad is vertical 9:16).
- Targeting: broad, ages 24–45, interests: entrepreneurship, small business, passive income, side hustle.
- Repost the same video free on **TikTok, Reels and YouTube Shorts** every day. Organic reach is free and stretches the $50.

### What to measure
| Metric | Healthy for a $50 test |
|---|---|
| Hook rate (3-sec views ÷ impressions) | 25%+ |
| Click-through rate | 1%+ |
| Cost per email lead | under $2 |
| Starter Kit → paid product (email) | 2–5% |

If the cost per lead is under $2, $50 should bring in about **25+ emails**.

### Email follow-up (after someone grabs the Starter Kit)
1. **Day 0:** Deliver the Starter Kit and say who you are.
2. **Day 1:** Your story: why you left (or are leaving) your job.
3. **Day 3:** Offer the entry product with a 48-hour discount.
4. **Day 5:** A result or testimonial, then a last call on the discount.
5. **Day 7:** Introduce the core product.

### Weekly content (organic, free)
- 3× short videos (cut-downs of the ad + talking-head versions of each caption)
- 2× carousels ("5 signs your 9–5 is capping you", "Digital products you can make in a weekend")
- Daily stories with a link to the Starter Kit

### Ad-policy guardrails (keeps the account from getting flagged)
- No income promises ("make $10k/month"). Sale pop-ups in the ad say "+$27" and so on, not totals.
- Say "start building your exit," not "quit tomorrow."
- No fake screenshots presented as real earnings. Once real sales come in, swap the demo numbers for real ones.

---

## Part 2 — Marcus: 3D Ad Storyboard

**Format:** 9:16 vertical, 15 seconds, 3D objects, bold pop-in captions, upbeat music.
Each caption has a matching 3D object, so the words and the visuals tell the same story.

| # | Time | Caption (pop-in) | 3D object | Motion |
|---|---|---|---|---|
| 1 | 0–3s | Your 9–5 has a **ceiling.** | Growth bars hitting a glass ceiling | Bars grow, smack the glass, and shards pop off |
| 2 | 3–6s | You trade **hours** for a paycheck. | Ringing alarm clock + one lonely coin | Clock shakes and rings, and one coin drops |
| 3 | 6–9s | Digital products sell while you **sleep.** | Laptop at night with a moon, sale notifications and coins | "New sale" cards pop in one by one, and the graph line draws upward |
| 4 | 9–12s | Make it **once.** Sell it forever. | E-book / Template / Course boxes over an infinity loop | Boxes pop in, and ghost copies multiply behind them |
| 5 | 12–15s | Your exit starts **today.** | Rocket launching from smoke + "Booked & Paid" + "Get the free Starter Kit" | Rocket blasts off and the button bounces in |

**Branding:** Reels already shows the page name (Booked & Paid) at the top of a paid ad, so scenes 1–4 carry
no wordmark. Scene 5 ends on a large "Booked & Paid" lockup above the button.
For the free organic posts, change the button text to "Link in bio".

**Caption style:** Each word pops in with a quick scale-up bounce. The key word sits on a
yellow highlight pill. White Inter Display Black text on a deep purple background.

**Hook variation B (for the A/B test):** "Stop waiting on payday. Get **booked.** Get **paid.**" (see the attention check below).

### Sample frames
See `ad-samples/frame1.png` … `frame5.png` (1080×1920) and `ad-samples/contact.png` for
all five side by side. They are rendered from real 3D scenes (Three.js) in
`ad-samples/frame-source.html`. After approval, the same scenes get animated and exported
as the MP4.

### Attention check (Kelsey)
Checked against what makes a Reel stop the scroll. Fixed items are marked.

| Check | Result |
|---|---|
| Hook in the first second | Pass. A short relatable line plus motion. The bars must already be moving at frame 0, with no slow build |
| Works with sound off | Pass. Every idea is in the captions |
| Readable on a phone | Pass. Heavy white text with a yellow key word on dark purple, at 3–6 words per scene |
| Visuals match the words | Pass. Every caption has its own object |
| Pacing | Pass. A new scene every 3 seconds |
| Reels safe zones (top 14% and bottom 35% are covered by app UI) | **Fixed.** The top wordmark and the bottom CTA were sitting under the UI. All captions, objects and the CTA now sit inside the visible area |
| CTA works for a paid ad | **Fixed.** "Link in bio" doesn't work on a paid ad (the ad has its own button), so it now reads "Get the free Starter Kit ↓" |
| Message matches the brand | **Open.** "Booked & Paid" suggests getting clients booked and paid, but the ad talks about leaving a job. The A/B test should try a brand-led hook |

**Hook B (brand-led):** "Stop waiting on payday. Get **booked.** Get **paid.**"

The real proof is the 3-day test. Keep the hook that gets a **25%+ hook rate**
(3-second views ÷ impressions). If both are under 15% by day 3, change the first scene, not the budget.
