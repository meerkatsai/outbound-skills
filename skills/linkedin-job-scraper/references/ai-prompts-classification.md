# AI Column Prompts — Classification

These prompts are used in Step 2 of the LinkedIn Job Scraper pipeline. Add each as a Meerkats AI column.

## Intent Type

**Prompt**:
```
Analyze the LinkedIn post text in {Post Text} and classify the hiring intent into exactly one of these categories:

- URGENT_HIRING: Post mentions urgently hiring, immediate joiners, ASAP hiring
- ACTIVE_HIRING: Post says "we are hiring" for specific roles — direct demand
- EXPANSION_HIRING: Post mentions expanding teams, new facility/office hiring, scaling
- AGENCY_HIRING: Recruiter or staffing agency hiring for clients (multiplier signal)
- PIPELINE_BUILDING: Looking to partner, build talent pipeline — longer cycle
- PASSIVE_CONTENT: Thought leadership, generic content — no hiring signal

Return ONLY the category name, nothing else.
```

## Signal Strength

**Prompt**:
```
Based on the post in {Post Text} and the intent type {Intent Type}, assign a signal strength:

- VERY_HIGH: Urgent requirements, immediate openings, ASAP language
- HIGH: Active hiring posts, multi-role hiring, agency hiring for clients
- MEDIUM: Pipeline building, partnership seeking
- LOW: Thought leadership, generic content, no hiring signal

Return ONLY the strength level.
```

## Is Target Vertical

**Prompt**:
```
Does the post in {Post Text} specifically relate to hiring in the target vertical: {target_vertical}?

Look for industry-specific terms, role titles, company types, and context clues that match the vertical.

Return "YES" or "NO" only.
```

**Note**: Replace `{target_vertical}` with the user's configured vertical (e.g., "healthcare", "fintech", "SaaS sales"). When using the healthcare-specific variant, the prompt checks for: nurses, RN, CNA, LPN, GNA, PCA, caregiver, clinical staff, hospital, clinic, patient care.

## Is Target Geo

**Prompt**:
```
Based on {Post Text} and {Author Company}, does this post appear to be about hiring in the target geography: {target_geo}?

Look for location names, cities, states/provinces, country references, or company headquarters that match.

Return "YES", "NO", or "UNCLEAR".
```

**Note**: Replace `{target_geo}` with the user's target geography (e.g., "US-based", "Europe", "UK").

## Company Type

**Prompt**:
```
Based on {Post Text} and {Author Company}, classify the company type:

- STAFFING_AGENCY: Staffing or recruitment agency in the target vertical
- DIRECT_EMPLOYER: Company hiring directly for their own roles
- RECRUITER_INDEPENDENT: Independent recruiter or talent consultant
- OTHER: Not clearly related to the target vertical

Return ONLY the category name.
```

## Pain Signal

**Prompt**:
```
From {Post Text}, extract the core hiring pain or urgency. Examples: "urgent need for engineers", "scaling sales team for new market", "immediate openings for 5+ roles".

If no clear pain signal exists, return "No clear pain signal".

Keep the response under 15 words.
```
