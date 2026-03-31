# AI Column Prompts — Enrichment & Qualification

These prompts are used in Steps 4 and 6 of the LinkedIn Job Scraper pipeline. Add each as a Meerkats AI column.

## Contact Name

**Prompt**:
```
Extract the full name of the person who posted from {Author Name}. Return just the name.
```

## Hiring Role

**Prompt**:
```
From {Post Text}, extract the specific role(s) being hired for. Examples: "Software Engineer", "Sales Rep", "RN", "Data Analyst".

Return a comma-separated list of roles. If unclear, return "Not specified".
```

## Role Hint

**Prompt**:
```
Based on {Author Name} and {Author Company} and {Post Text}, what is the likely job title of the person posting? Examples: "Recruiter", "TA Head", "Staffing Agency Owner", "HR Director", "Ops Leader", "Engineering Manager".

Return the most likely title in 1-3 words.
```

## Email

**Prompt**:
```
Check if {Post Text} contains any email address. If yes, extract it. If no, return "NOT_FOUND".
```

**Note**: For leads where email is NOT_FOUND, use the `email-find-verify` skill to look up emails using the contact name and company domain.

## Outreach Priority

**Prompt**:
```
Based on signal strength {Signal Strength} and company type {Company Type}, assign an outreach priority:

- P1_IMMEDIATE: Signal is VERY_HIGH or HIGH and company is STAFFING_AGENCY or RECRUITER_INDEPENDENT
- P2_STANDARD: Signal is VERY_HIGH or HIGH and company is DIRECT_EMPLOYER
- P3_NURTURE: Signal is MEDIUM
- SKIP: Signal is LOW or company is OTHER

Return ONLY the priority code.
```
