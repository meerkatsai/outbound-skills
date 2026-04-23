# Intent Taxonomy — Healthcare Hiring Signal Detection

## Intent Types

| Intent Type | Description | Priority | Why It Matters | Example Patterns |
|---|---|---|---|---|
| Urgent Hiring | Urgently hiring nurses / immediate joiners | HIGH | Strong pain → fastest conversion | "urgent hiring", "immediate openings", "ASAP", "need nurses urgently" |
| Active Hiring | Actively hiring RN / CNA / clinical staff | HIGH | Direct demand, clear budget allocated | "we are hiring RN", "now hiring nurses", "hiring CNA" |
| Expansion Hiring | Expanding teams / new facility hiring | HIGH | Scale-driven demand, multiple roles | "expanding teams", "new facility", "opening new location" |
| Agency Hiring | Recruiters hiring for clients | HIGH | Multipliers — 1 agency = many roles | "hiring for our client", "multiple hospital placements", "staffing for" |
| Pipeline Building | Looking to partner / build talent pipeline | MEDIUM | Slightly longer sales cycle but real need | "build talent pipeline", "looking to partner", "staffing partnership" |
| Passive Content | Thought leadership / generic industry content | LOW | No immediate hiring intent — skip | "healthcare trends", "staffing industry insights", "thought leadership" |

## Signal Strength Scoring

| Signal Strength | Criteria | Action |
|---|---|---|
| VERY HIGH | Urgent language + specific role + location + contact info visible | Immediate outreach — same day |
| HIGH | Direct hiring post with specific roles OR agency posting for clients | Outreach within 24h |
| MEDIUM | Pipeline/partnership language OR generic hiring without specifics | Light outreach — nurture sequence |
| LOW | Thought leadership, industry commentary, no hiring intent | Ignore — do not outreach |

## Post Type → Signal Mapping

| Post Type | Example | Signal Strength |
|---|---|---|
| Direct job post | "We are hiring RNs in Texas" | HIGH |
| Recruiter post | "Hiring nurses for multiple hospitals" | HIGH |
| Urgent requirement | "Immediate openings for CNAs" | VERY HIGH |
| Multi-role hiring | "Hiring across clinical roles" | HIGH |
| Pipeline/collab | "Looking to partner for healthcare staffing" | MEDIUM |
| Content/insight | "Healthcare staffing trends" | LOW |

## Classification Rules for AI Column

When classifying a post, apply these rules in order:
1. If post contains urgency language ("urgent", "immediate", "ASAP", "need now") AND a specific healthcare role → **Urgent Hiring** (VERY HIGH)
2. If post explicitly mentions hiring specific roles (RN, CNA, LPN, etc.) → **Active Hiring** (HIGH)
3. If author is a recruiter/staffing agency posting for clients → **Agency Hiring** (HIGH)
4. If post mentions expansion, new facility, scaling team → **Expansion Hiring** (HIGH)
5. If post mentions partnerships, pipeline building, future hiring → **Pipeline Building** (MEDIUM)
6. If post is general industry content with no hiring action → **Passive Content** (LOW)
