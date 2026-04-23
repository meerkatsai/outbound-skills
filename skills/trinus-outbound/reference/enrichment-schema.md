# Enrichment Schema — Trinus Outbound Meerkats Table

## Table Structure

**Table Name:** Trinus Outbound Pipeline
**Purpose:** Master contact database for Trinus Corporation outbound — sourced from Excel/Dynamics imports and SalesProspect searches, enriched with signal detection and AI-driven prioritization.

---

## Input Columns

| Column Name | Type | Description |
|---|---|---|
| First Name | text | Contact first name |
| Last Name | text | Contact last name |
| Full Name | text | First + Last (auto-filled or imported) |
| Title | text | Job title as imported |
| Company | text | Company name |
| Industry | text | Industry — use standard: Healthcare, Financial Services, Technology, Manufacturing, Government, Telecom, Retail, Life Sciences |
| Email | text | Primary business email |
| Phone | text | Direct phone or office |
| LinkedIn URL | url | Contact LinkedIn profile URL |
| Company Website | url | Company homepage URL |
| Company Size | text | Employee count range: "200-500", "500-2000", "2000-10000", "10000+" |
| City | text | Contact's city |
| State | text | Contact's state (US) |
| Source | text | "Excel Import", "Dynamics 365", "SalesProspect Search", "Manual" |
| Date Added | date | Date contact was added to the pipeline |
| Last Contacted | date | Date of most recent outreach |
| Sequence Status | text | "Not Started", "Email 1 Ready", "Email 1 Sent", "Email 2 Sent", "Email 3 Sent", "Email 4 Sent", "Replied - Positive", "Replied - Not Interested", "Disqualified", "Nurture" |
| Notes | text | Free-text notes on conversations, context |
| Raw Signal | text | Pasted news headline or signal event text |

---

## AI Columns (in dependency order)

### Batch 1 — Independent (no cross-column dependencies)

#### Persona Tier
```
Classify the seniority of the job title "{Title}" at {Company} into one of:
- "C-Suite" (CEO, CTO, CIO, CDO, CISO, COO, CFO, or Chief [anything])
- "VP" (Vice President, SVP, EVP, or any VP-level title)
- "Director" (Director of, Head of, Global Director)
- "Manager" (Manager, Senior Manager, Lead)
- "IC" (Engineer, Analyst, Developer, Specialist, Consultant — individual contributor)

Output only the tier label with no explanation.
```

#### Service Fit
```
Based on the job title "{Title}" and industry "{Industry}", which ONE Trinus service is the best fit for this contact?

Trinus services:
- "BI/Analytics" — for BI, analytics, reporting, data science, insights roles
- "Data Management" — for data governance, MDM, data quality, data engineering roles
- "Cloud Engineering" — for cloud architecture, DevOps, infrastructure, platform engineering roles
- "IT Consulting" — for IT strategy, CIO/CTO-level, IT operations, enterprise architecture roles
- "Managed Services" — for IT operations, NOC/SOC, managed infrastructure, outsourcing roles
- "Staffing" — for HR, talent acquisition, or when title suggests capacity gap (e.g., multiple open roles context)
- "IoT/AI" — for AI, ML, data science, IoT, computer vision roles
- "Unknown" — cannot determine from available information

Output only the service name with no explanation.
```

#### Industry Priority
```
Based on the industry "{Industry}", classify the priority for Trinus outreach:
- "Tier 1" — Life Sciences, Healthcare, Financial Services, Banking, Insurance, Pharma
- "Tier 2" — Technology, Manufacturing, Government, Utilities, Telecom, Entertainment
- "Tier 3" — Retail, Consumer Goods, Real Estate, Education, Nonprofit, Other

Output only the tier label with no explanation.
```

#### Signal Type
```
Classify the following signal text into ONE of these categories:
Signal: "{Raw Signal}"

Categories:
- "M&A" — merger, acquisition, divestiture, spin-off, joint venture
- "Leadership Change" — new C-suite, VP, or Director hire or departure
- "Digital Transformation" — announced transformation program, modernization initiative
- "Cloud Migration" — announced cloud migration, cloud deployment, cloud-first strategy
- "Hiring Signal" — company is actively hiring data engineers, cloud architects, BI developers, IT consultants at scale
- "Compliance Pressure" — regulatory requirement, audit, FDA, HIPAA, SOX, data governance mandate
- "Funding" — funding round, IPO, SPAC
- "None" — no signal, empty, or not applicable

Output only the category label with no explanation.
```

---

### Batch 2 — Depends on Batch 1

#### Engagement Score
```
Score this contact's engagement priority for Trinus outbound from 1 to 10.

Inputs:
- Persona Tier: {Persona Tier}
- Industry Priority: {Industry Priority}
- Signal Type: {Signal Type}
- Title: {Title}
- Company Size: {Company Size}

Scoring rules:
- Persona Tier: C-Suite = +3, VP = +2, Director = +2, Manager = +1, IC = 0
- Industry Priority: Tier 1 = +3, Tier 2 = +2, Tier 3 = +1
- Signal Type: M&A = +3, Leadership Change = +2, Digital Transformation = +2, Cloud Migration = +2, Hiring Signal = +1, Compliance Pressure = +2, Funding = +1, None = 0
- Company Size: 10000+ = +2, 2000-10000 = +1, 500-2000 = 0, 200-500 = -1

Cap at 10. Output only the numeric score (integer) with no explanation.
```

#### Outreach Angle
```
Write a ONE sentence outreach angle for a Trinus sales email to this contact.

The angle must:
1. Reference their specific Signal Type: {Signal Type}
2. Connect to their Service Fit: {Service Fit}
3. Be written from Trinus's perspective (IT consulting / data analytics / managed services firm)
4. Be specific to their Industry: {Industry}
5. Never use generic phrases like "digital transformation", "leverage AI", "innovative solutions"

Format: "[Signal implication] → [specific Trinus service relevance for their industry]"

Examples:
- "Post-merger data integration in healthcare usually surfaces governance gaps — Trinus helps unify clinical data environments across merged entities."
- "New CDOs at financial firms typically need a fast baseline on data maturity — Trinus has run those assessments for Bank of America and KPMG."
- "Cloud migration at manufacturing companies tends to stall on the data pipeline side — Trinus has built cloud-native data platforms for Intel and Siemens."

Output only the one-sentence angle.
```

---

### Batch 3 — Depends on Batch 2

#### Priority
```
Based on the Engagement Score of {Engagement Score} and Signal Type of {Signal Type}, classify the outreach priority:

- "Immediate" — Engagement Score ≥ 8 AND Signal Type is M&A, Leadership Change, or Digital Transformation
- "This Week" — Engagement Score ≥ 6 AND Signal Type is not "None"
- "This Month" — Engagement Score ≥ 4 OR Signal Type is "None" but Industry Priority is Tier 1
- "Nurture" — Engagement Score < 4 OR contact is IC-level

Output only the priority label with no explanation.
```

---

## Table Sheets

### "Active Outreach"
Contacts currently in an email sequence. Filtered by Sequence Status ∈ {"Email 1 Ready", "Email 1 Sent", "Email 2 Sent", "Email 3 Sent", "Email 4 Sent"}.

### "Signal Queue"
High-priority contacts with detected signals not yet contacted. Filter: Priority ∈ {"Immediate", "This Week"} AND Signal Type ≠ "None" AND Sequence Status = "Not Started".

### "Replied"
Contacts who responded. Sequence Status ∈ {"Replied - Positive", "Replied - Not Interested"}.

### "Disqualified"
Contacts removed from pipeline. Sequence Status = "Disqualified".

---

## Dynamics 365 → Meerkats Field Mapping

| Dynamics 365 Export Column | Meerkats Column | Notes |
|---|---|---|
| First Name | First Name | Direct map |
| Last Name | Last Name | Direct map |
| Full Name | Full Name | Use if First/Last not separate |
| Job Title | Title | Direct map |
| Parent Customer / Account Name | Company | Use "Account Name" if available |
| Email / Business Email | Email | Prefer Business Email |
| Business Phone / Main Phone | Phone | Direct map |
| LinkedIn | LinkedIn URL | May need manual lookup |
| Website | Company Website | May be on Account record |
| Industry | Industry | Normalize to standard values |
| Address 1: City | City | Direct map |
| Address 1: State/Province | State | Direct map |
| Created On | Date Added | Map creation date |

**Common Dynamics export variants to watch for:**
- "Account Name" vs "Parent Account" vs "Company Name" — all mean company
- "Business Email" vs "Email Address 1" vs "Email" — all mean email
- "Title" vs "Job Title" vs "Function" — all mean role

---

## Excel Import Template

If the user provides a custom Excel file, map columns using best-match logic. Ask for confirmation when mapping is ambiguous. Required fields: First Name OR Full Name, Company, Email.

**Minimum viable import:** First Name, Company, Email — all other fields can be enriched later.

**Fields that MUST be present to trigger AI enrichment:** Title and Industry (needed for Persona Tier, Service Fit, Industry Priority columns).
