# Email Sequence Templates

These AI column prompts generate the 5-email outreach sequence in Step 8 of the LinkedIn Job Scraper pipeline. Add each as a Meerkats AI column.

## Email 1 — Contextual Hook (Day 0)

**AI Column Name**: `Email 1 Draft`

**Prompt**:
```
Write a short, personalized cold email (under 100 words) for {Contact Name} at {Author Company}.

Context: They posted about hiring {Hiring Role} on LinkedIn. Their pain signal is: {Pain Signal}.

Structure:
- Subject line: Reference their hiring post
- Opening: Mention you saw their post about hiring {Hiring Role}
- Middle: Briefly mention you work with teams facing similar hiring challenges
- Close: Ask if filling these roles fast enough is a challenge

Tone: Casual, peer-to-peer, no hard sell. Sign off with "– {{Your Name}}".
```

## Email 2 — Pain Amplification (Day 2)

**AI Column Name**: `Email 2 Draft`

**Prompt**:
```
Write a follow-up email (under 80 words) for {Contact Name} about hiring {Hiring Role}.

Theme: Pain amplification. Mention common hiring struggles in their industry:
- Inconsistent candidate quality
- Delays in screening and interviews
- Candidate drop-offs before start date

Ask if they are experiencing something similar. Keep it conversational.

Subject line: "Re: hiring {Hiring Role}"
Sign off with "– {{Your Name}}".
```

## Email 3 — Value Proposition (Day 4)

**AI Column Name**: `Email 3 Draft`

**Prompt**:
```
Write a value-proposition email (under 80 words) for {Contact Name}.

Theme: How other teams solved hiring challenges by automating parts of sourcing and screening. Benefits: reduced time-to-hire, improved candidate quality, handling higher volumes.

Offer to share what is working. No hard CTA.

Subject line: "How teams are fixing this"
Sign off with "– {{Your Name}}".
```

## Email 4 — Soft CTA (Day 7)

**AI Column Name**: `Email 4 Draft`

**Prompt**:
```
Write a soft-CTA email (under 60 words) for {Contact Name}.

Reference that you have shared some ideas in previous emails. Suggest a 15-minute call to see if there is a fit.

Keep it low-pressure. Frame it as comparing notes, not a sales pitch.

Subject line: "Quick question"
Sign off with "– {{Your Name}}".
```

## Email 5 — Breakup (Day 10)

**AI Column Name**: `Email 5 Draft`

**Prompt**:
```
Write a breakup email (under 50 words) for {Contact Name}.

Theme: Closing the loop. Let them know you will not follow up again unless they are interested. Leave the door open by saying they can reach out anytime.

Keep it friendly and professional.

Subject line: "Closing the loop"
Sign off with "– {{Your Name}}".
```

## Customization Notes

- Replace `{{Your Name}}` with the user's actual name or sender name
- Adjust industry-specific pain points based on the target vertical
- For healthcare-specific templates, see the `healthcare-signal-detection` skill
- Email drafts should be reviewed before sending — AI drafts are starting points
