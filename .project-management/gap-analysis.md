# Q/A Gap Analysis — ranked by reuse potential

_Generated 2026-06-29 from 83 existing pairs vs the open question bank._

The 83 existing Q/A pairs in production were cataloged across themes (A-Gas P&L, RefriTrak founding/stack, Marines MSG duty, ADT regional disagreement, Joe→TruClear mentoring arc, ops-vs-engineering philosophy, hiring contrarian take, AI workflow, tech debt framework, 1:1 cadence, incident review, Monday KPIs, dispatch/utilization, etc.). Each open question in `data/interview-questions.md` (excluding strikethrough/skipped and direct duplicates of existing pairs) was scored on how much existing material could compose a strong answer.

## Tier A — high reuse (score 9-10) — ask these first

1. **"Why are *you* the right person to build RefriTrak — what unfair insight, scar tissue, or unreasonable obsession do you have that 100 other smart people don't?"**
   - Sources: `[d2b818b9, 7fd9eef0, c2e9e9f0, c26d67c3, e94cb501, 9bf7bcdc]`
   - Material is fully there — A-Gas customer discovery + builder instinct + eng/ops blend. Needs Daniel to confirm the one-line "unfair insight" framing.

2. **"Why now? What changed in technology, regulation, behavior, or economics in the last 18-36 months that makes this finally possible?"**
   - Sources: `[d2b818b9, b6b5a638, 1bd288ca, 581e8055, 4eb75e11]`
   - Regulation (40 CFR Part 84) + AI-as-leverage are both covered. Needs Daniel to confirm what to emphasize first — reg or AI.

3. **"What were you doing before this, and what made you stop? Be specific — what was the conversation, the moment, the opportunity cost."**
   - Sources: `[1167bb95, d2b818b9, 7fd9eef0, 8c9ca7de]`
   - GM-at-A-Gas plus the overheard regulation conversation. Needs the literal "moment" framing — week-of detail.

4. **"How do you think about AI and the Anthropic SDK as leverage for a solo founder running a compliance SaaS? Where have you seen real ROI vs. expensive theater?"**
   - Sources: `[82796f69, 4eb75e11, 23016f05, e69bcdc1, 1bd288ca, 581e8055, b6508ce3]`
   - Anthropic in the RefriTrak doc-processing worker, A-Gas AI quoting, hot-take on AI engineering, ROI-vs-theater framework — all there. Just composition.

5. **"Describe a time you cut operational cost without cutting service quality. What was the lever, what did you protect, and how did you prove quality held?"**
   - Sources: `[5e1faf67, 8c9ca7de, 8fe95931]`
   - A-Gas OT 30%→10% via geographic clustering. Needs Daniel to name what specifically he protected (CSAT? on-time?) and how he proved it.

6. **"Overtime is running 18% of total field labor and climbing. You have 60 days before the board notices. Walk me through your diagnosis-to-action sequence."**
   - Sources: `[5e1faf67, 8fe95931, 21672404]`
   - Same OT-reduction playbook, situational frame. Material fully covers it.

7. **"Describe your dispatch and routing operating model. Manual, semi-automated, AI-assisted — what did you run, why, and what would you upgrade tomorrow?"**
   - Sources: `[e69bcdc1, 8fe95931, 8dc5e36a, 43deecf7]`
   - Dish auto-router, A-Gas custom dispatch tool, WeDriveU Angular dispatch app, Via implementation. Just needs the "upgrade tomorrow" angle.

8. **"What's a technical or operational opinion you hold that most of your peers disagree with, and what's the strongest argument against it?"**
   - Sources: `[1bd288ca, c7b2ff0d, bf940e0b]`
   - AI-can-do-most-engineering, hire-for-attitude-not-experience, tech-first ops. Pick one and add the "strongest argument against."

## Tier B — medium-high reuse (score 7-8)

9. **"Walk me through the exact moment you decided to start this company — what were you doing the week before, and what changed?"** · `[d2b818b9, 1167bb95]` · Has the founding moment; needs the literal week-before context.

10. **"Take me through your weekly operating rhythm — how does it differ now as a solo founder vs. when you ran a multi-site P&L?"** · `[6b32708c, 8c9ca7de]` · ADT side covered; needs the solo-founder side described.

11. **"Take me through a P&L you owned end-to-end. What were the unit economics, what were the two or three levers that actually moved the number, and which lever did you misjudge?"** · `[8c9ca7de, 5e1faf67, 8fe95931]` · A-Gas P&L + OT lever + utilization. Needs the "lever you misjudged."

12. **"Tell me about a time you had to give difficult feedback to a peer or a tenured field manager who was hitting numbers but failing on safety or culture."** · `[b2fb02fb, c50173f6, aa6d635f]` · 12-year branch manager scenario is already documented; reframe as the conversation.

13. **"Tell me about a time you shipped something you later regretted. What did you learn, and what's different about how you work now?"** · `[37b9e7b5]` · Production-push-during-hours story is exactly this — just reframe.

14. **"Tell me about a time you had to learn an unfamiliar codebase, language, or domain quickly."** · `[ecf7073b, 9bf7bcdc, 77aa7697]` · TruClear projectors learning model + Angular→React. Pick one lane.

15. **"What's the most important thing you've changed your mind about in your engineering career?"** · `[581e8055, b6b5a638, 77aa7697]` · AI-leverage shift, Postgres adoption, React-over-Angular. Pick the strongest.

16. **"Walk us through the operations org you've built or run — sites, headcount, span of control, P&L size — and where you spent the bulk of your time on the ground vs. in the boardroom."** · `[a085a9b2, 8c9ca7de, 48971781, 6ea90e52]` · 150 employees + $20M projects + $1.3M monthly invoicing all present.

17. **"Tell me about a decision you made primarily on data and one you made primarily on instinct. How did each turn out, and what's your read on when to use which?"** · `[72bd0596, 5e1faf67, 21672404]` · Walmart Mexico (instinct) + A-Gas OT cut (data). Clean pairing.

18. **"Why did you leave your last two roles, and what's the pattern you've noticed in the kinds of orgs that get the best out of you vs. the worst?"** · `[1167bb95, d791a6c0]` · A-Gas → RefriTrak, ADT → WeDriveU. Needs the pattern reflection.

19. **"How do you hire? Walk me through your interview loop end-to-end — what each round is for, your bar, and how you debrief."** · `[d8936f1c, ca3eb2ab, c7b2ff0d]` · STAR interview guide, signals, hire-for-attitude. Needs structure across the rounds.

20. **"How do you think about technology investment in operations — FSM platforms, telematics, IoT on assets, AI dispatch? Where have you seen real ROI and where have you seen expensive theater?"** · `[bf940e0b, e69bcdc1, 43deecf7]` · Tech-first ops + Dish auto-router + Via cutover. Compose.

21. **"Tell me about the SOC 2 program you led at FormDr. What did you underestimate, and what changed permanently in how the engineering org operated afterward?"** · `[2837cf8b, df859d6e]` · SOC 2 story present; needs "what you underestimated" and "what changed permanently."

22. **"Tell me about how your military background shapes how you operate now — and where it has held you back."** · `[c2e9e9f0, dc6778c1, e1f46d17, b8e6c95f, f94fb3cc, 9bf7bcdc]` · Marines→eng + adapt-and-overcome + drill discipline. Needs the "held you back" honest-counter side.

23. **"Tell me about a time you had a serious disagreement with a teammate or manager about a technical decision. How was it resolved?"** · `[aa6d635f, 37b9e7b5]` · ADT pushback + prod-deploy mistake. Pick one and reframe as technical disagreement.

24. **"Tell me about a time you pushed back on a product or business requirement. What happened?"** · `[37b9e7b5, aa6d635f]` · Same material; "pushed back" framing fits aa6d635f directly.

25. **"Describe a multi-quarter initiative you drove. How did you scope it, sequence it, and know it was working?"** · `[8fe95931, 2837cf8b, 23016f05]` · A-Gas utilization model, SOC 2 cert, RefriTrak build-out. Pick one.

26. **"Talk me through a non-trivial trade-off you made in a recent design. What did you give up, and how did you decide it was worth it?"** · `[77aa7697, 993d4ae3, b6b5a638]` · Stack choices for RefriTrak + Postgres adoption. Material is there.

27. **"How do you balance shipping fast with building things that last? Give me a concrete example where you got that balance wrong."** · `[993d4ae3, 8dc5e36a, 37b9e7b5]` · RefriTrak speed-via-familiarity + prod-push mistake. Compose.

28. **"What kind of work makes you lose track of time, and what kind drains you?"** · `[c26d67c3, 7ce6145d]` · "Engineering is just fun for me" + natural-energy answer. Needs the drains-you side.

29. **"Walk me through how you would diagnose this company in your first 90 days. What signals are you looking for?"** · `[c292a2f0, b2fb02fb, c50173f6]` · Front-line method + observe-first playbook. Strong reuse.

30. **"Describe the most consequential strategic bet you've made."** · `[d2b818b9, 1167bb95]` · Leaving A-Gas to build RefriTrak before the regulation. Single best example.

31. **"What does a high-functioning daily huddle look like at the branch level, and how do you make sure that signal rolls up to you cleanly?"** · `[6b32708c, c292a2f0]` · ADT daily 15-min check-ins + skip-level info-flow framework.

32. **"What's the operational metric most people in this industry obsess over that you think is overrated — and what would you track instead?"** · `[21672404, 3acfb6b4, e69bcdc1]` · Sales-per-job-by-job-type + Monday KPI trio + dashboards-as-theater. Compose.

33. **"What's your model for the operations-finance relationship? Walk me through how you'd partner with a CFO on the annual operating plan, monthly close, and capex prioritization."** · `[8c9ca7de, 48971781]` · A-Gas monthly forecasting with VP Ops + WeDriveU $1.3M invoice review. Compose.

34. **"What's your operations philosophy in one paragraph? Then tell me about a decision where you violated it on purpose and why."** · `[bf940e0b]` · Philosophy in hand; needs the "violated it on purpose" example.

35. **"What do you do every week — even now — that a 'manager-mode' CEO would have delegated by now, and why won't you give it up?"** · `[47d2546d, 23016f05]` · Daily prod code + sole-engineer reality. Needs the "why won't you give it up" angle.

36. **"Tell me about a time something went badly wrong in your life or work and you didn't quit. What specifically kept you going?"** · `[d353820a, d791a6c0, 1167bb95]` · Grit identity + ADT misalignment recovery. Pick a story.

## Tier C — medium reuse (score 5-6)

37. **"Refrigerant handling, DOT, EPA Section 608... ensured every site could pass an unannounced audit."** · `[d8936f1c, 2837cf8b, eb8a9861, b6508ce3]` · Has compliance vocabulary; needs a specific unannounced-audit story.

38. **"Describe a time you had to make a technical decision with incomplete information."** · `[72bd0596, 77aa7697, 993d4ae3]` · Walmart Mexico + framework choice. Reframe.

39. **"How do you decide when a piece of code or system needs to be rewritten vs. incrementally improved?"** · `[18c1dc9a, 77aa7697]` · Tech-debt framework adjacent.

40. **"Vendors and subcontractors. How do you score them, when do you fire one, tell me about the last time you had to terminate a strategic vendor."** · `[db1ad963]` · TruClear vendor process covers part; needs a termination story.

41. **"What does a great manager do for you, and what do you need from a team to do your best work?"** · `[f9d363b0, 257f288e]` · Dish boss + lead-by-example. Compose.

42. **"Tell me about the most recent time you put someone on a performance plan."** · `[11eb6f81, cf74e8d8, 39e8a692]` · 1:1 framework + termination process. Needs a real PIP story.

43. **"Tell me about a time you had to disagree with your CEO or CTO."** · `[aa6d635f, 37b9e7b5]` · ADT RM disagreement + prod-push conviction. Reframe.

44. **"Tell me about a time you protected your team from a bad request from above."** · `[aa6d635f, 37b9e7b5]` · Saved ADT manager from termination. Direct fit.

45. **"Describe the operating rhythm between you and your PM and design counterparts."** · `[6b32708c, 11eb6f81]` · ADT cadence + 1:1 model. Reframe to PM/design.

46. **"What's your first 30, 60, and 90 days in this role?" (EM)** · `[c50173f6, 6b32708c, c292a2f0]` · Turnaround playbook + cadence. Compose.

47. **"How do you decide what to delegate, what to do yourself, and what to actively pull back on?"** · `[338f4a58, 47d2546d, 23016f05]` · Joe scope-expansion delegation + sole-engineer reality.

48. **"How do you measure whether your engineering org is healthy?"** · `[21672404, 3acfb6b4, 7650fa09]` · Metrics philosophy + Monday KPI trio adapted.

49. **"Walk me through the last time a customer described the problem you solve — without you prompting them."** · `[ea96237a, d2b818b9, 877927fe]` · Has the "we don't track refrigerant" line; needs a specific recent quote.

50. **"Who is the very first customer you can help, and how often do they have this problem?"** · `[eb8a9861, 877927fe, 7fd9eef0]` · ICP implied; needs explicit ICP framing.

51. **"What do you believe about this market that most smart people in it think is wrong?"** · `[d2b818b9, c7b2ff0d, 1bd288ca]` · Contrarian-take vocabulary present; needs a market-specific belief.

52. **"Walk me through how you make a hard call when your gut and the data disagree."** · `[72bd0596, 21672404]` · Walmart Mexico instinct call.

53. **"Tell me about your relationship with the CEO or owner in your last role."** · `[37b9e7b5, 8abb001f, f9d363b0]` · Multiple boss/mentor stories; pick one.

54. **"Tell me about a project that failed or got cancelled."** · `[d791a6c0, 43deecf7]` · ADT misalignment + Via UI issues.

55. **"A production incident is happening right now and you're the on-call. Walk me through the first 30 minutes."** · `[7650fa09, 37b9e7b5, dc6778c1]` · Incident review + Marines drill react-plan model.

56. **"What does a great engineering culture look like to you, and what does a bad one look like?"** · `[7650fa09, 257f288e, bf940e0b]`

57. **"Tell me about a time you had to give difficult feedback to a peer."** (Eng IC) · `[39e8a692, cf74e8d8]`

58. **"Where do you want your career to go over the next 3-5 years?"** · `[48f05d3a, c26d67c3]` · C-suite ambition + eng/ops blend.

59. **"Walk me through the last Sev-1 you led or commanded."** · `[7650fa09, dc6778c1, 37b9e7b5]`

60. **"What's your philosophy on engineering culture, and what are two concrete artifacts you've used to make it real?"** · `[7650fa09, bf940e0b, 11eb6f81]`

61. **"Walk me through how you'd build a 12-month roadmap for an org you just inherited."** · `[c292a2f0, b2fb02fb, c50173f6]`

62. **"Tell me about the most important hire you'll make in your first six months in this role."** · `[338f4a58, c7b2ff0d, 8288fd2f]`

63. **"Describe how you've handled a high-performer who was misaligned with company values."** · `[cf74e8d8, aa6d635f]`

64. **"Walk me through a security or data incident you've managed."** · `[2837cf8b, 7650fa09, df859d6e]` · FormDr healthtech + incident review.

65. **"How do you manage your own energy, focus, and personal effectiveness as CEO?"** · `[d1c7738d, d5350e5d, 7ce6145d]` · Walk-when-stuck + gardening + natural energy.

66. **"Tell me about a continuous-improvement program you've stood up — Lean, Six Sigma, Kaizen, your own flavor."** · `[5e1faf67, 4e66d29f, 8fe95931]`

67. **"How do you decide between hiring a permanent technician, contracting a subcontractor, and outsourcing to a partner network?"** · `[db1ad963, c7b2ff0d]`

68. **"How are you actually going to acquire your first 1,000 paying customers — channel by channel?"** · `[877927fe]` · SEO-inbound is the only channel he's named.

69. **"Who was the most painful person you ever had to fire or let go?"** · `[cf74e8d8, 39e8a692]`

70. **"Describe your first ten hires — what role, and what is the one trait that mattered more than the resume?"** · `[c7b2ff0d, 8288fd2f, 338f4a58]`

71. **"Tell me about a time you changed your mind on something important based on customer evidence."** · `[ea96237a, 8dc5e36a]`

72. **"What does a bad week look like for you personally right now, and what's your actual recovery routine?"** · `[d1c7738d, d5350e5d]`

73. **"Describe the culture you build inside an operations team. How do you make safety, quality, and speed coexist?"** · `[257f288e, bf940e0b, 376c6a33, 5e1faf67]`

74. **"Tell me about a time you had to lay off or RIF part of an operations team."** · `[cf74e8d8, 39e8a692]`

75. **"How do you build a bench of branch or site managers?"** · `[338f4a58, 8288fd2f, aa6d635f]` · Joe and Dish warehouse promo; needs a second named GM promotion.

76. **"Tell me about an organizational transformation you led that did not work as planned."** · `[43deecf7, 530a1622]`

77. **"Tell me about a time you influenced a decision across teams without having authority over them."** · `[5d9b2f86, f94fb3cc]`

78. **"Tell me about a time you raised a concern that was unpopular with your team or leadership."** · `[37b9e7b5, aa6d635f]`

79. **"Tell me about a time you identified a problem nobody else was looking at."** · `[5d9b2f86, d2b818b9]`

80. **"Describe an engineer you fired or were forced to let go in a layoff."** · `[cf74e8d8, 39e8a692]`

81. **"Your manager asks you to ship something by Friday that you believe needs another week to be safe."** · `[37b9e7b5, aa6d635f]`

## Tier D — low reuse (score 0-4) — skip or revisit later

Names only:

- Give me an example of an engineer you promoted that you would not promote again
- Tell me about a senior hire who did not work out
- How do you decide when an engineer is ready to be promoted to senior or staff
- Tell me about a time a PM partner of yours was making a decision you thought was wrong
- Tell me about a reorg you led or were part of
- Tell me about a quarter where your team missed badly
- Two senior engineers on your team disagree on an architectural direction
- You have 10 engineers and three priorities the CEO refuses to rank
- Your on-call rotation is burning people out
- How do you make the manager-of-managers transition real
- How would you structure an engineering org of 30 vs. 80 vs. 200 engineers
- If I gave you 25% more headcount tomorrow
- What does this company most likely get wrong in its first year with you as a leader
- Pretend it's three years from now and the company has failed
- You're three days into a two-week sprint and realize the design won't work
- You join the team and inherit a critical service with no tests, no docs
- A teammate's pull request has a design you think is wrong
- Describe the hardest bug you've ever debugged
- Pick a system, evolve it to handle 100x the traffic
- Design the public API for a service that lets developers schedule jobs
- How would you diagnose intermittent 500s for ~2% of requests
- Explain a technical concept... as if I were a smart non-engineer, then a skeptical senior engineer
- Tell me about a time you worked with someone whose style was very different from yours
- What's a question you wish I'd asked, and how would you answer it
- Why this company and this role specifically — and what would make you leave a year in
- If you joined and had your first 90 days to spend however you wanted
- How do you set the company's long-term direction without becoming captive to the operating plan
- Take me through a major M&A transaction you led or killed
- What do you think the next three years look like for this industry
- Why this company, and why now? Honest read of two or three things that could make this an unsuccessful tenure
- You've inherited a company whose culture is at odds with its strategy
- How do you set culture at scale when you can personally only know a few hundred employees
- How do you build and maintain your senior team
- Tell me about the executive you had to remove
- How do you mobilize through your leadership team versus running the business yourself
- Describe a meaningful disagreement with your CFO or general counsel
- Describe your relationship with your last board chair
- Walk me through how you've structured board communication between meetings
- How do you communicate bad news to investors
- What's your view on the right relationship between a CEO and the activist or large-block investor
- Walk me through your media presence and public posture
- How do you take a position on a politically charged issue
- What questions are you asking us that we haven't asked you
- Describe a time you faced a regulatory action or investigation
- Describe a time you had to reset compensation, equity, or benefits structures
- Tell me about a moment you knew you were holding the organization back
- Tell me about the worst audit finding you've ever owned
- Tell me about a new-market or new-location launch you led end-to-end
- Tell me about a serious safety incident on your watch
- Your largest supplier just announced a 14% price increase
- Walk us through a DMAIC or A3 you personally ran
- If this company died tomorrow, what would you do next
- If you're right about 'why now,' what does the world look like in five years
- What outcome would make this whole thing a success for you personally (the $50M acquisition variant)
- What's the part of running this company that you genuinely love, and the part you secretly hate
- What's your honest read of the two or three things that could make RefriTrak an unsuccessful tenure
- How many potential customers have you talked to in the last 30 days
- What's the single most important metric for this business, and what is it today vs. 90 days ago
- What are you choosing *not* to build right now
- What's the new product that, if launched against you tomorrow, would terrify you the most
- Tell me about the biggest pivot you've considered but didn't make
- What would have to be true — what metric, what customer signal, what timeline — for you to pivot
- What's the role you most need to hire next, and the role you're most afraid to hire
- How much cash do you have, how long does it last at current burn
- What's your burn multiple
- What's the smallest amount of outside capital that gets this to self-sufficiency
- What's your honest view on raising
- If a strategic acquirer offered to buy you tomorrow
- If we invested today, what's the one thing you'd want to be held accountable to
- What do you want from us as investors beyond the money
- If we looked back in a year, which decision is most likely to have killed the company
- What's the conversation you're currently avoiding
- Who do you call when things are genuinely bad
- What's the part of your business that, if I dug into it for two hours, would scare me the most

## Coverage map

**Saturated topics** (heavy existing pair density — answers can be composed almost entirely from corpus):
- **A-Gas P&L / GM operations** — OT cut, utilization model, customer save, AI quoting, admin app, A-Gas→RefriTrak
- **RefriTrak founding & stack** — origin story, stack choice, customer feedback, first paying customer, hardest feature (compliance engine)
- **ADT regional disagreement** — saving the field manager, coaching automation (Power Automate), ADT weekly rhythm
- **Joe → TruClear mentoring arc** — promotion at Dish, brought to TruClear, scope expansion
- **Ops-vs-engineering philosophy** — tech-first ops, builder instinct, ops teaches eng, automation pattern
- **Marines MSG duty (specific posts)** — Jeddah events ($2K→$7.5K revenue/event), Lusaka assistant detachment commander, chemical-attack drill
- **AI workflow vocabulary** — trust but verify, agent swarms, adversarial verification, Anthropic SDK in RefriTrak/A-Gas quoting
- **Hiring contrarian take** — train-for-attitude vs. hire-for-experience, RM disagreement, interview signals
- **Frameworks already on record** — 1:1 cadence, incident review (blameless+action items), tech debt buckets, Monday KPI trio, branch-mgr safety scenario, turnaround playbook
- **Tech stack defaults** — Next.js + Postgres, AI for migrations, RefriTrak running stack
- **WeDriveU operations** — $1.3M monthly invoicing, Angular dispatching app, zero-downtime route migration, Via cutover failures
- **Self-taught engineering journey** — HTML→Marines→Angular→React→AI-leverage

**Thin topics** (would require fresh content from Daniel):
- **Founder financials** — cash, burn, runway, raise plans, MRR, churn (nothing on record)
- **Board / investor / external posture** — no board comms, no investor relationships, no media
- **C-suite scale stories** — no M&A, no reorgs, no large-org transformation, no exec terminations
- **Specific debugging walkthrough** — no "hardest bug ever debugged" narrative; technical decisions are framed but not bugs
- **Architecture design exercises** — no scaling/API-design/100x-traffic discussion
- **Customer save (engineering side)** — only A-Gas refrigerant buyback exists; no engineering customer save
- **Founder daily routine** — no "day in the life", no recovery routine, no "who do you call when it's bad"
- **Pivot / kill / strategic-bet retrospectives** — no pivots considered, no products killed, no big bets at corporate scale beyond leaving A-Gas
- **Specific recent customer conversations** — only generic customer feedback exists; no recent verbatim quotes
- **Held-back-by-Marines side** — only positive Marines→ops/eng transfers on record
- **PIP stories** — termination process is documented but no real PIP narrative
- **Safety incident on the watch** — safety vocabulary exists (b2fb02fb) but no actual incident response
- **Audit findings** — SOC 2 cert documented but no audit finding story
- **Bench/promotion pipeline** — Joe and the Dish warehouse promo are the only two; need more named GM-track promotions
