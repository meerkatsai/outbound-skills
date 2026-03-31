# Classification Reference Tables

Reference data for intent classification and signal strength mapping. Use these tables when configuring AI columns in Step 2.

## Table of Contents

- [Intent Type Reference](#intent-type-reference)
- [Post Types Reference](#post-types-reference)
- [Lead Qualification Matrix](#lead-qualification-matrix)
- [Conversion Factors](#conversion-factors)

---

## Intent Type Reference

| Intent Type | Description | Priority | Why It Matters |
|-------------|-------------|----------|----------------|
| URGENT_HIRING | Urgently hiring nurses / immediate joiners | HIGH | Strong pain — fastest conversion |
| ACTIVE_HIRING | "We are hiring" RN / CNA / staff | HIGH | Direct demand |
| EXPANSION_HIRING | Expanding teams / new facility hiring | HIGH | Scale-driven demand |
| AGENCY_HIRING | Recruiters hiring for clients | HIGH | Multipliers (1 contact → many roles) |
| PIPELINE_BUILDING | Looking to partner / build talent pipeline | MEDIUM | Slightly longer cycle |
| PASSIVE_CONTENT | Thought leadership / generic | LOW | No immediate value |

---

## Post Types Reference

| Post Type | Example Pattern | Signal Strength |
|-----------|----------------|-----------------|
| Direct job post | "We are hiring RNs in Texas" | HIGH |
| Recruiter post | "Hiring nurses for multiple hospitals" | HIGH |
| Urgent requirement | "Immediate openings for CNAs" | VERY_HIGH |
| Multi-role hiring | "Hiring across clinical roles" | HIGH |
| Pipeline/collab | "Looking to partner for healthcare staffing" | MEDIUM |
| Content/insight | "Healthcare staffing trends" | LOW |

---

## Lead Qualification Matrix

| Condition | Action | Priority |
|-----------|--------|----------|
| VERY_HIGH/HIGH signal + STAFFING_AGENCY | Immediate outreach | P1 |
| VERY_HIGH/HIGH signal + HEALTHCARE_PROVIDER | Standard outreach | P2 |
| MEDIUM signal + any company type | Light outreach / nurture | P3 |
| LOW signal | Skip — no outreach | — |

---

## Conversion Factors

| Factor | Impact |
|--------|--------|
| Fresh signals (posts < 14 days old, sourced via Apify) | Very high |
| Personalization (referencing their actual post) | Critical |
| Targeting staffing agencies | Multiplier effect (1 contact → many roles) |
| Speed of outreach | Decisive — first responder wins |
