# Keyword Strategy — Healthcare Hiring Signal Detection

Optimized for LinkedIn post scraping via Apify and web search discovery.

## A. Core Hiring Keywords

| Category | Keywords |
|---|---|
| Direct Hiring | "we are hiring", "now hiring", "hiring RN", "hiring nurses" |
| Urgency | "urgent hiring", "immediate joiners", "ASAP hiring", "need nurses urgently" |
| Roles | RN, CNA, LPN, GNA, PCA, caregiver, clinical staff, registered nurse, certified nursing assistant |
| Healthcare Context | hospital hiring, clinic hiring, patient care jobs, healthcare staffing, nurse staffing |
| Hashtags | #hiring, #nowhiring, #nursejobs, #healthcarejobs, #RNjobs, #CNAjobs, #healthcarehiring |

## B. High-Intent Boolean Queries (for Apify LinkedIn Scraper)

### Query 1: General Healthcare Hiring
```
("we are hiring" OR "now hiring" OR "urgent hiring")
AND (nurse OR RN OR CNA OR LPN OR caregiver OR "patient care")
```

### Query 2: Specific Role Hiring
```
("hiring RN" OR "hiring CNA" OR "hiring nurses")
AND (hospital OR clinic OR healthcare)
```

### Query 3: Hashtag-Based Discovery
```
("#hiring" OR "#nowhiring")
AND (nurse OR healthcare OR RN)
```

### Query 4: Urgency Signals
```
("looking for nurses" OR "need nurses urgently")
```

### Query 5: Staffing Agency Posts
```
("healthcare staffing" OR "nurse staffing")
AND (hiring OR recruiting)
```

## C. Negative Keywords (Filter Out)

These indicate non-hiring content — use to exclude noise:
- "healthcare tips"
- "nursing school"
- "student nurse"
- "career advice"
- "day in the life"
- "nursing humor"
- "retired nurse"
- "volunteer"

## D. Apify Configuration Notes

When configuring the LinkedIn Posts Scraper on Apify:
- Use the boolean queries above as search terms
- Set date range to last 7 days for freshest signals (24h posts have highest conversion)
- Filter by US geography when possible
- Capture these fields: post URL, post text, author name, author LinkedIn URL, post date, author headline/info
- Run on a recurring schedule (daily or every 2 days) for continuous signal capture
