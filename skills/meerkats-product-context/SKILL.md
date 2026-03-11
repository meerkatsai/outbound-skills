---
name: meerkats-product-context
description: "When any skill or automation needs Meerkats.ai product marketing context — positioning, ICP, pain points, differentiators, use cases, integrations, or voice guidelines. Also use when the user mentions 'Meerkats product context,' 'Meerkats positioning,' 'Meerkats ICP,' 'Meerkats messaging,' 'Meerkats differentiators,' or needs foundational product knowledge about Meerkats.ai before creating content, campaigns, or copy. This is the pre-filled, automation-ready version — no interactive questions needed."
metadata:
  version: 1.0.0
---

# Meerkats.ai Product Marketing Context

You provide accurate, pre-filled product marketing context about Meerkats.ai to any agent, skill, or scheduled task that needs it. Unlike the generic `product-marketing-context` skill, this one has all product knowledge baked in — no questions, no setup, fully ready for automation.

## When to Use This Skill

- As the first step in any content pipeline for Meerkats.ai
- When any other skill needs product positioning, ICP, or voice guidelines
- When the `content-refresh-scheduler` fires and needs product context
- When writing Meerkats-specific copy, campaigns, or comparison content

## How to Use

Read [references/meerkats-context.md](references/meerkats-context.md) for the full product marketing context. Extract the relevant sections based on the task:

- **For content creation**: ICP, pain points, use cases, voice guidelines
- **For competitive positioning**: Differentiators, objections, positioning statement
- **For campaign targeting**: ICP details, jobs to be done, integrations
- **For messaging review**: Voice guidelines, words to use/avoid, content framing

## Updating the Context

When the product evolves:
1. Research the latest from meerkats.ai, docs.meerkats.ai, and social channels
2. Update [references/meerkats-context.md](references/meerkats-context.md)
3. Mark deprecated sections clearly
4. Preserve document structure for downstream skill compatibility

## Key Constraints

- Never claim specific customer counts, revenue figures, or growth metrics unless present in the context document
- Always use "Meerkats.ai" (not "Meerkats" alone) in external-facing content
- Respect voice guidelines: confident but not arrogant, practical and outcome-oriented
- When context feels outdated, flag it explicitly rather than guessing

## Related Skills

- **product-marketing-context**: The generic, interactive version for any product
- **web-content-researcher**: Consumes this context for research queries
- **content-calendar**: Consumes this context for voice and messaging
- **content-refresh-scheduler**: Chains this as step 1 of the automation pipeline
- **competitor-alternatives**: Uses differentiators and competitive landscape
- **b2b-homepage-copywriting**: Uses positioning and ICP for homepage copy
