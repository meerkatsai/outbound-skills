# Enrichment Schema — Healthcare Hiring Signal Detection

## Meerkats Table Schema

### Table Name: "Healthcare Hiring Signals"

### Input Columns (populated from Apify scrape)

| Column Name | Data Type | Source | Description |
|---|---|---|---|
| Post URL | url | Apify: post_url | LinkedIn post URL |
| Post Content | text | Apify: post_text | Full text of the LinkedIn post |
| Author Name | text | Apify: author_name | Name of the person who posted |
| Author LinkedIn URL | url | Apify: author_linkedin_url | LinkedIn profile URL of the author |
| Post Date | date | Apify: post_date | When the post was published |
| Author Info | text | Apify: author.info / headline | Author's headline/role from LinkedIn |

### AI Columns (Meerkats AI — replaces Clay AI)

Each AI column runs automatically on new rows. They reference other columns via `{Column Name}` syntax.

| Column Name | Data Type | Type | Prompt | Dependencies |
|---|---|---|---|---|
| Intent Type | text | AI | "Classify this LinkedIn post into exactly one intent type: Urgent Hiring, Active Hiring, Expansion Hiring, Agency Hiring, Pipeline Building, or Passive Content. Post content: {Post Content}. Rules: If urgent language (urgent, immediate, ASAP) + healthcare role → Urgent Hiring. If explicitly hiring specific roles → Active Hiring. If recruiter/agency posting for clients → Agency Hiring. If expansion/new facility → Expansion Hiring. If partnership/pipeline → Pipeline Building. Otherwise → Passive Content. Return ONLY the intent type label." | Post Content |
| Signal Strength | text | AI | "Based on the intent type '{Intent Type}' and post content '{Post Content}', assign a signal strength: VERY HIGH (urgent + specific role + location), HIGH (direct hiring or agency post), MEDIUM (pipeline/partnership), LOW (content only). Return ONLY the signal strength label." | Intent Type, Post Content |
| Is Healthcare Hiring | text | AI | "Is this post about hiring for healthcare/clinical roles? Post: {Post Content}. Return only 'Yes' or 'No'." | Post Content |
| Is US Relevant | text | AI | "Does this post indicate US-based hiring? Look for US states, cities, or general US context. Post: {Post Content}. Author info: {Author Info}. Return only 'Yes', 'No', or 'Unclear'." | Post Content, Author Info |
| Company Name | text | AI | "Extract the company name from this post. Post content: {Post Content}. Author name: {Author Name}. Author info: {Author Info}. Return ONLY the company name. If unclear, return 'Unknown'." | Post Content, Author Name, Author Info |
| Company Type | text | AI | "Classify this company as: 'Staffing Agency', 'Healthcare Provider', or 'Other'. Company: {Company Name}. Post: {Post Content}. Author info: {Author Info}. Return ONLY the company type label." | Company Name, Post Content, Author Info |
| Hiring Role | text | AI | "Extract the specific healthcare role(s) being hired from this post. Look for: RN, CNA, LPN, GNA, PCA, caregiver, clinical staff, etc. Post: {Post Content}. Return the role(s) mentioned, comma-separated. If no specific role, return 'General'." | Post Content |
| Pain Signal | text | AI | "Extract urgency/pain indicators from this hiring post. Look for: timeline pressure, volume needs, turnover mentions, desperation language, multiple openings, difficulty filling roles. Post: {Post Content}. Return a brief pain signal summary (1-2 sentences). If no pain signal, return 'None detected'." | Post Content |
| Email | text | AI | "Extract any email address mentioned in this post. Post: {Post Content}. Return ONLY the email address. If none found, return 'N/A'." | Post Content |
| Phone | text | AI | "Extract any phone number mentioned in this post. Post: {Post Content}. Return ONLY the phone number. If none found, return 'N/A'." | Post Content |
| Qualification | text | AI | "Based on signal strength '{Signal Strength}' and company type '{Company Type}', determine the outreach action: 'Immediate Outreach' (HIGH/VERY HIGH + Staffing Agency), 'Outreach' (HIGH/VERY HIGH + Healthcare Provider), 'Light Outreach' (MEDIUM signal), 'Ignore' (LOW signal). Return ONLY the action label." | Signal Strength, Company Type |

### AI Column Execution Order

Due to chained dependencies, AI columns must run in this order:
1. **Batch 1 (independent):** Intent Type, Is Healthcare Hiring, Is US Relevant, Hiring Role, Pain Signal, Email, Phone, Company Name
2. **Batch 2 (depends on Batch 1):** Signal Strength, Company Type
3. **Batch 3 (depends on Batch 2):** Qualification

## Lead Qualification Matrix

| Signal Strength | Company Type | Action |
|---|---|---|
| VERY HIGH | Staffing Agency | Immediate outreach — same day |
| VERY HIGH | Healthcare Provider | Immediate outreach — same day |
| HIGH | Staffing Agency | Immediate outreach — within 24h |
| HIGH | Healthcare Provider | Outreach — within 24h |
| MEDIUM | Any | Light outreach — nurture sequence |
| LOW | Any | Ignore |

## CRM Export Structure

### Company Object
- name (from Company Name column)
- industry: "Healthcare" or "Healthcare Staffing"
- signal_strength (from Signal Strength column)

### Contact Object
- name (from Author Name column)
- linkedin_url (from Author LinkedIn URL column)
- email (from Email column)
- phone (from Phone column)
- role_hint (from Author Info column)

### Deal Object
- hiring_signal (from Intent Type column)
- post_url (from Post URL column)
- pain_signal (from Pain Signal column)
- hiring_role (from Hiring Role column)
- qualification (from Qualification column)

## Deduplication Strategy

Deduplicate on these column combinations:
1. **Primary:** Post URL (exact match — same post scraped twice)
2. **Secondary:** Company Name (prevents multiple outreach to same company from different posts)

Use `check_duplicate_rows` first to audit, then `delete_duplicate_rows` to clean.

## Apify → Meerkats Field Mapping

| Apify Output Field | Meerkats Input Column |
|---|---|
| post_url / url | Post URL |
| post_text / text / content | Post Content |
| author_name / authorName | Author Name |
| author_linkedin_url / authorUrl | Author LinkedIn URL |
| post_date / postedAt / date | Post Date |
| author.info / authorHeadline | Author Info |
