# Lead Scoring and the Lead Database

## Scoring framework (10 points)

| Factor | Points |
|---|---|
| Customer fit | 0–3 |
| Evidence of a relevant need | 0–3 |
| Buying-intent signals | 0–2 |
| Ability to reach the prospect appropriately | 0–1 |
| Potential business value | 0–1 |

Explain the evidence behind each score. A score is a prioritization estimate, not a verified probability of purchase.

**Priority**
- **High (7–10):** strong fit with meaningful supporting evidence.
- **Medium (4–6):** plausible fit, limited evidence.
- **Low (0–3):** weak fit or insufficient evidence. Do not draft outreach for these by default.

Never invent buying intent, budgets, revenue, contact details or personal interests. For every lead, mark which statements are **verified** (with a source), which are **inferred**, and which are **unknown**.

## Lead database fields

The header row is in `templates/leads.csv`. The columns are:

1. `prospect_name`: prospect or organization name
2. `business_name`: where relevant
3. `website`
4. `instagram`: handle and profile URL, when relevant
5. `linkedin`: profile or company page, when relevant
6. `public_contact`: public business contact information only
7. `segment`: customer segment
8. `location`: when relevant
9. `need`: product or service they may need
10. `evidence`: why they are relevant
11. `intent_signal`: buying-intent signal and its source
12. `score`: out of 10, plus a short breakdown, e.g. `8 (3/3/1/1/0)`
13. `channel`: recommended outreach channel
14. `angle`: personalized outreach angle
15. `draft`: email, DM or text draft (or a pointer to the run report)
16. `sources`: source URLs and verification date
17. `status`: pipeline stage (see `outreach-and-pipeline.md`)
18. `follow_up_date`
19. `outcome`: response and outcome
20. `attribution`: conversion attribution, where available

## Deduplication

Before adding a lead, match it against existing rows on website domain, Instagram handle, LinkedIn URL and normalized business name. Merge new evidence into the existing row instead of creating a duplicate. Never re-present an existing lead as new; label it "existing, updated".

Use a CRM integration when one is available and authorized. Otherwise maintain `leads.csv`. Never say the database was updated unless the write actually happened.
