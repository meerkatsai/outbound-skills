---
name: trinus-outbound
description: Full outbound pipeline for Trinus Corporation — import contacts from Excel/Dynamics 365, find similar contacts by industry, detect M&A and hiring signals, and run personalized multi-touch email sequences with 3-7 day follow-up cadence. Use when the user wants to run outbound for Trinus, import a contact list, find leads in IT consulting target industries, or detect acquisition/merger signals for prospect engagement.
argument-hint: "[--import path/to/file.xlsx] [--find-contacts industry=Healthcare] [--signals company=Amgen] [--sequence contact_name] [--step 1-5] [--setup]"
allowed-tools: Bash, Read, Write, Edit, Glob, Grep, Agent, WebSearch, WebFetch, TodoWrite, mcp__meerkats__*, mcp__d2512da2-dd84-46ab-953e-c52e73adc65c__*
---

# Trinus Outbound Pipeline

You run the full outbound sales pipeline for **Trinus Corporation** — a Pasadena-based IT consulting, data analytics, and managed services firm founded in 1995, serving enterprises like Amgen, AT&T, Bank of America, Cisco, Johnson & Johnson, Intel, and Qualcomm.

**Before doing ANYTHING, read these reference files:**
- `${CLAUDE_SKILL_DIR}/reference/icp-profiles.md` — Target personas, industries, seniority levels, and buying context
- `${CLAUDE_SKILL_DIR}/reference/signal-taxonomy.md` — M&A, hiring, and leadership change signals that indicate buying intent
- `${CLAUDE_SKILL_DIR}/reference/email-templates.md` — Email 1–5 templates, personalization rules, and subject lines
- `${CLAUDE_SKILL_DIR}/reference/enrichment-schema.md` — Meerkats table schema, AI column prompts, field mappings

---

## ARGUMENT PARSING

Parse `$ARGUMENTS` for:
- `--setup` — Create the Meerkats table (Phase 0)
- `--import [file]` — Import contacts from Excel (.xlsx) or Dynamics 365 export (.csv) (Phase 1)
- `--find-contacts [industry=X] [title=Y] [company=Z]` — Prospect for net-new contacts similar to existing targets (Phase 2)
- `--signals [company=X]` — Run M&A, hiring, and leadership signal detection for one or all companies (Phase 3)
- `--sequence [contact_name]` — Generate personalized email sequence for a contact (Phase 4)
- `--step [1-5]` — Run a specific phase only
- No arguments → ask user which phase to run (interactive mode)

---

## THE 5-PHASE PIPELINE

Use `TodoWrite` to track progress through each phase.

---

### Phase 0: Table Setup (`--setup`)

Create the Meerkats master table that stores all contacts, signals, and outreach status.

**Step 1:** Create the table:
```
Name: "Trinus Outbound Pipeline"
Description: "Master contact list for Trinus Corporation outbound — imported from Excel/Dynamics, enriched with signals, and tracked through email sequences."
```

**Step 2:** Add Input columns (type: "Input"):
- "First Name" (text)
- "Last Name" (text)
- "Full Name" (text)
- "Title" (text)
- "Company" (text)
- "Industry" (text)
- "Email" (text)
- "Phone" (text)
- "LinkedIn URL" (url)
- "Company Website" (url)
- "Company Size" (text)
- "City" (text)
- "State" (text)
- "Source" (text) — "Excel Import", "Dynamics 365", "SalesProspect Search", "Manual"
- "Date Added" (date)
- "Last Contacted" (date)
- "Sequence Status" (text) — "Not Started", "Email 1 Sent", "Email 2 Sent", "Email 3 Sent", "Replied", "Disqualified"
- "Notes" (text)
- "Raw Signal" (text) — pasted news headline or signal event

**Step 3:** Add AI columns (type: "AI") in dependency order using prompts from `reference/enrichment-schema.md`:

Batch 1 (independent):
- **Persona Tier** — classify seniority: "C-Suite", "VP", "Director", "Manager", "IC"
- **Service Fit** — which Trinus service maps to this contact: "BI/Analytics", "Data Management", "Cloud Engineering", "IT Consulting", "Managed Services", "Staffing", "IoT/AI", "Unknown"
- **Industry Priority** — score industry fit: "Tier 1" (Healthcare/Life Sciences/Financial), "Tier 2" (Government/Telecom/Manufacturing), "Tier 3" (Other)
- **Signal Type** — classify the Raw Signal: "M&A", "Leadership Change", "Digital Transformation", "Cloud Migration", "Hiring Signal", "Compliance Pressure", "None"

Batch 2 (depends on Batch 1):
- **Engagement Score** — 1-10 score combining Persona Tier + Industry Priority + Signal Type
- **Outreach Angle** — one-sentence angle for personalized email based on Service Fit + Signal Type

Batch 3 (depends on Batch 2):
- **Priority** — "Immediate", "This Week", "This Month", "Nurture"

**Step 4:** Create sheets:
- "Active Outreach" — contacts in sequences
- "Signal Queue" — contacts with M&A or leadership signals, not yet contacted
- "Replied" — contacts who responded

Confirm setup by calling `mcp__meerkats__get_table` and display the schema.

---

### Phase 1: Contact Import (`--import`)

Import contacts from Excel exports (from Dynamics 365 or manual lists) into the Meerkats table.

**Accepted formats:**
- Excel (.xlsx) from Dynamics 365 export
- CSV from Dynamics 365, HubSpot, or manual list
- Pasted contact data (ask user to paste rows)

**Step 1: Parse the file**
- Read the file using Read tool
- Identify column mapping — look for variants of: First Name, Last Name, Job Title, Account Name, Email, Phone, LinkedIn, Website, Industry, City, State
- If columns are ambiguous, display the header row and ask user to confirm mappings before proceeding

**Field mapping (Dynamics 365 → Meerkats):**
```
Dynamics 365 Field        → Meerkats Column
First Name                → First Name
Last Name                 → Last Name
Job Title / Title         → Title
Account Name / Company    → Company
Email / Business Email    → Email
Business Phone / Mobile   → Phone
LinkedIn URL              → LinkedIn URL
Website                   → Company Website
Industry                  → Industry
City                      → City
State / Province          → State
```

**Step 2: Deduplication check**
Before inserting, call `mcp__meerkats__check_duplicate_rows` with `attributeKeys: ["Email"]`.
Report how many would be duplicates. Ask user whether to skip or overwrite.

**Step 3: Bulk insert**
Use `mcp__meerkats__add_table_rows_bulk` with `Source: "Excel Import"` or `Source: "Dynamics 365"` and today's date as "Date Added".

**Step 4: Import summary**
- Total contacts imported
- Breakdown by industry
- Breakdown by title/seniority level
- How many emails are missing (flag for enrichment)

---

### Phase 2: Find Similar Contacts (`--find-contacts`)

Prospect for net-new contacts that match Trinus's ICP using the SalesProspect tools.

**Step 1: Determine search parameters**
Parse `--find-contacts` arguments. If not provided, ask:
1. Which industry? (options from `reference/icp-profiles.md`)
2. Which persona/title? (CDO, VP Analytics, Director IT, CTO, etc.)
3. Which geography? (default: United States)
4. Company size range? (default: 500–50,000 employees — enterprise/mid-market)

**Step 2: Get filter options**
Call in parallel:
- `mcp__d2512da2-dd84-46ab-953e-c52e73adc65c__sp_get_industries` — to map industry names to IDs
- `mcp__d2512da2-dd84-46ab-953e-c52e73adc65c__sp_get_departments` — to get department filters
- `mcp__d2512da2-dd84-46ab-953e-c52e73adc65c__sp_get_levels` — to get seniority levels

**Step 3: Search contacts**
Use `mcp__d2512da2-dd84-46ab-953e-c52e73adc65c__sp_search_contacts` with:
- Industry IDs matching target (Healthcare, Financial Services, Technology, Manufacturing, etc.)
- Seniority: VP, Director, C-Level, Manager
- Department: IT, Engineering, Data, Analytics, Operations
- Geography: United States
- Company headcount: 500+ employees

**Step 4: Review and fetch**
Use `mcp__d2512da2-dd84-46ab-953e-c52e73adc65c__sp_review_contacts` to validate matches against ICP criteria.

Use `mcp__d2512da2-dd84-46ab-953e-c52e73adc65c__sp_fetch_contacts` to retrieve contact details (email, phone, LinkedIn).

**Step 5: Load into Meerkats**
- Dedup against existing table by email
- Insert net-new contacts with `Source: "SalesProspect Search"`
- Flag contacts with missing emails for manual review

**Output:** Count of new contacts found, breakdown by industry/title, how many had verified emails.

---

### Phase 3: Signal Detection (`--signals`)

Detect M&A, leadership change, digital transformation, and hiring signals for companies in the pipeline. Contacts tied to signals get moved to the "Signal Queue" sheet.

**Step 1: Get company list**
- If `--signals company=X` → run for that one company
- Otherwise → pull all unique companies from the Meerkats table via `mcp__meerkats__get_table_rows`

**Step 2: For each company, run signal research in parallel**

**A. M&A Signal Search**
Use `WebSearch` with queries:
- `"[Company Name]" acquisition 2024 OR 2025`
- `"[Company Name]" merger OR acquired OR acquires site:businesswire.com OR prnewswire.com OR reuters.com`
- `"[Company Name]" "strategic partnership" OR "joint venture" 2025`

Look for: completed acquisitions, pending mergers, divested business units, new subsidiaries.
**Why it matters for Trinus:** Post-merger companies need data integration, unified analytics, and IT consolidation — all core Trinus services.

**B. Leadership Change Signal**
Use `WebSearch` with queries:
- `"[Company Name]" "Chief Data Officer" OR "CTO" OR "VP of IT" appointed OR hired OR joins 2024 OR 2025`
- `"[Company Name]" "new CIO" OR "new CDO" OR "new VP" 2025`

Look for: new C-suite or VP hires in IT/data/analytics roles in the past 6 months.
**Why it matters:** New leaders have budget, mandate, and urgency to prove impact in first 90 days. They evaluate vendors quickly.

**C. Digital Transformation / Cloud Signal**
Use `WebSearch` with queries:
- `"[Company Name]" "digital transformation" OR "cloud migration" OR "data modernization" 2025`
- `"[Company Name]" Azure OR AWS OR Snowflake OR Salesforce OR SAP implementation 2025`

Look for: announced cloud initiatives, ERP implementations, BI modernization projects.
**Why it matters:** Companies in active transformation need consulting and staffing support Trinus provides.

**D. Hiring Signal (SalesProspect)**
Use `mcp__d2512da2-dd84-46ab-953e-c52e73adc65c__sp_find_emails` or web search for:
- Is the company actively hiring Data Engineers, BI Developers, Cloud Architects, or IT Consultants?
- Job postings on LinkedIn or company career pages.

**Why it matters:** Hiring = internal capacity gap → opportunity for staffing or managed services.

**E. Compliance/Regulatory Pressure**
For Healthcare and Financial Services contacts, search:
- `"[Company Name]" HIPAA OR SOX OR FDA OR "data governance" compliance 2025`

**Why it matters:** Compliance deadlines create urgent data management and IT consulting needs.

**Step 3: Score and store signals**
For each company:
- Paste the strongest signal headline into the "Raw Signal" column in Meerkats via `mcp__meerkats__update_table_row`
- Tag the Signal Type (M&A / Leadership Change / etc.)
- Run AI enrichment to update Engagement Score and Priority columns

**Step 4: Move high-signal contacts to Signal Queue sheet**
Filter for Engagement Score ≥ 7 and Signal Type ≠ "None":
- Copy rows to "Signal Queue" sheet via `mcp__meerkats__add_table_sheet_row`

**Output:** Signal summary table — company, signal type, signal headline, engagement score, recommended action.

---

### Phase 4: Email Sequence Generation (`--sequence`)

Generate personalized, multi-touch email sequences for contacts based on their persona, industry, and detected signals.

**Step 1: Select contacts**
- If `--sequence "contact name"` → generate for that contact only
- Otherwise → generate for all "Immediate" and "This Week" priority contacts in Signal Queue first, then Active Outreach

**Step 2: Research each contact**
For each contact, pull from the Meerkats table:
- Title, Company, Industry, Signal Type, Raw Signal, Outreach Angle (AI column), Service Fit

Then briefly research via `WebSearch`:
- What does their company do in their specific domain?
- Any recent news about their company (beyond the signal already captured)?
- Their LinkedIn for any recent posts, articles, or activity if URL is available?

**Step 3: Generate the 5-email sequence**

Use the exact templates and rules from `reference/email-templates.md`.

**Sequence cadence:**
- Email 1: Day 0 (initial outreach)
- Email 2: Day 3 (follow-up — add adjacent insight)
- Email 3: Day 7 (final short nudge)
- Email 4: Day 14 (optional — break-up / long play)
- Email 5: Day 30 (optional — re-engage with new signal)

**Personalization rules:**
- Email 1 must reference the specific signal (M&A headline, new leader name, cloud initiative, etc.)
- The question in Email 1 must be specific to their buyer's world — not generic IT
- DO NOT mention "data transformation" generically — reference what Trinus specifically does for that industry
- Service angle must match their detected pain: M&A → data integration; New CDO → BI/analytics; Cloud migration → cloud engineering; Compliance → data management

**Step 4: Update sequence status**
After generating, update the contact's "Sequence Status" to "Email 1 Ready" in the Meerkats table via `mcp__meerkats__update_table_row`.

**Output format:**
```
## Contact: [Full Name] — [Title] at [Company]
**Signal:** [Signal Type] — [Raw Signal headline]
**Service Angle:** [Service Fit]
**Recommended sender:** [ask user for their name on first run]

### Email 1 (Send Today)
Subject: [subject line]
[body]
Word count: X

### Email 2 (Day 3)
Subject: Re: [original subject]
[body]
Word count: X

### Email 3 (Day 7)
Subject: Re: [original subject]
[body]
Word count: X

### Email 4 (Day 14 — optional)
Subject: [fresh subject line]
[body]

### Email 5 (Day 30 — optional, if new signal found)
Subject: [fresh subject line]
[body]

---
Quality Check:
- [ ] Email 1 references specific signal (not generic)
- [ ] Question in Email 1 is specific to their buyer's world
- [ ] Service angle matches detected pain
- [ ] Email 1 is under 80 words
- [ ] Each sentence is its own paragraph
```

---

### Phase 5: Pipeline Reporting

Display a full dashboard of the current pipeline state:

1. **Contact Summary**
   - Total contacts in table
   - By industry
   - By persona tier
   - By sequence status

2. **Signal Summary**
   - Contacts with detected signals (by type)
   - Contacts in Signal Queue
   - Contacts awaiting signal research

3. **Outreach Summary**
   - Email 1 sent / Email 2 sent / Email 3 sent / Replied
   - Reply rate (if user provides reply data)

4. **Recommended Next Actions**
   - Contacts to email today
   - Follow-ups due (Day 3 / Day 7)
   - Companies needing signal refresh (>30 days since last search)

---

## ERROR HANDLING

- **No email found for contact:** Flag and suggest `sp_find_emails` or manual LinkedIn lookup
- **Duplicate emails on import:** Report count, ask user before skipping or merging
- **Signal search returns no results:** Note "No recent signals found" in Raw Signal column; set Signal Type to "None"; still generate a non-signal email sequence using the fallback template
- **Meerkats table not found:** Prompt user to run `--setup` first
- **SalesProspect returns 0 results:** Broaden search (relax title filter or expand geography) and retry once; if still 0, report to user with suggested parameter changes

## IMPORTANT NOTES

- **M&A signals are highest priority.** Post-merger IT and data integration work is a natural Trinus entry point — data consolidation, unified analytics, systems harmonization.
- **New CDO/CTO hires have a 90-day window.** New leaders evaluate and commit to vendors fast. Contact within the first 60 days of their appointment.
- **Trinus is MBE/WBE certified.** This is a genuine differentiator for government and enterprise procurement. Mention it only when the contact is in government/utilities or when MBE compliance is relevant to their procurement process.
- **Never pitch all services at once.** Each email sequence is anchored to ONE Trinus service that matches the contact's pain. Generalist pitches lose.
- **Personalization = signal + service fit + industry reality.** The formula that works is: "I saw [specific event] at [Company] → that usually means [data/IT pain] → here's how Trinus helps [their industry] specifically."
