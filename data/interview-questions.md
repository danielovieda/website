# Interview Questions Library

> Curated from parallel web research across engineering IC, engineering management, C-suite executive, operations leadership, and founder / startup categories. Use these as prompts to extend the danielovieda.com Q&A corpus.

## How to use with Claude
1. Pick a question that fills a real gap in the current corpus
2. Write a 2-4 sentence answer with concrete details (numbers, names, dates)
3. Claude polishes into a Q/A pair, dedupes against existing corpus, and saves via `pnpm qa add-file`

## Especially relevant for Daniel's profile
> The blended engineer + operations executive + solo founder cross-section. Visitors interviewing Daniel will reach for these first.

- Why are *you* the right person to build RefriTrak — what unfair insight, scar tissue, or unreasonable obsession do you have that 100 other smart people don't? — *founder-market-fit when you've actually run the operations the software serves*
- Walk me through the exact moment you decided to start this company — what were you doing the week before, and what changed? — *anchors the GM-at-A-Gas to founder leap*
- Why now? What changed in technology, regulation, behavior, or economics in the last 18-36 months that makes this finally possible? — *40 CFR Part 84, AI, and his domain — perfect timing question*
- Refrigerant handling, DOT, EPA Section 608, state contractor licensing — pick the regulatory regime most relevant to your last role and tell us how you ensured every site could pass an unannounced audit. — *direct A-Gas / RefriTrak overlap*
- Take me through your weekly operating rhythm — what meetings, what dashboards, what hits your inbox Monday morning — and how does it differ now as a solo founder vs. when you ran a multi-site P&L? — *bridges operator-past to founder-present*
- How current is your technical depth today? When did you last write production code, and how do you stay close enough to the work to make good calls without taking it from your team? — *Daniel is both lead engineer and CEO; the Charity Majors pendulum is his daily life*
- Walk me through a system you owned or built, the biggest tradeoff you made, and what you'd revisit today with hindsight. — *RefriTrak architecture under solo-founder constraints*
- Tell me about a time you had to make a technical decision with incomplete information. How did you decide when to commit vs. gather more data? — *the solo-founder default state*
- How do you decide between hiring a permanent engineer, contracting, or staying solo? Give me the framework and one decision you've made under it. — *RefriTrak team-of-one reality, adapted from the field-labor question*
- ~~Tell me about how your military background shapes how you operate now — and where it has held you back. — *Marines 2005-2011 is a defining thread; needs the honest counter-side*~~ _(skipped 2026-06-29 — not appropriate)_
- Walk me through how you built the technician/field-team utilization model. What target did you set, what was your baseline, and how did you close the gap? — *core A-Gas / WeDriveU operator skill*
- How do you think about AI and the Anthropic SDK as leverage for a solo founder running a compliance SaaS? Where have you seen real ROI vs. expensive theater? — *Daniel's actual stack and a defensible POV*
- ~~Tell me about the SOC 2 program you led at FormDr. What did you underestimate, and what changed permanently in how the engineering org operated afterward? — *concrete, named, high-credibility story*~~ _(skipped 2026-06-29 — "SOC 2 is nothing")_
- Take me through a P&L you owned end-to-end. What were the unit economics, what were the two or three levers that actually moved the number, and which lever did you misjudge? — *GM at A-Gas verification*
- Describe a time you cut operational cost without cutting service quality. What was the lever, what did you protect, and how did you prove quality held? — *Dish / ADT / WeDriveU multi-site cost work*
- How much cash do you have, how long does it last at current burn, and at what point would you start cutting? — *sole-founder default-alive question, asked plainly*
- What's the role you most need to hire next, and the role you're most afraid to hire — and why aren't those the same? — *forces a real answer on the solo-engineer-CEO trap*
- What outcome would make this whole thing a success for you personally — and would a $50M acquisition in three years be a win or a failure? — *post-A-Gas, post-FormDr, what is the actual goal*
- Tell me about a time you had to give difficult feedback to a peer or a tenured field manager who was hitting numbers but failing on safety or culture. — *operator scar tissue Daniel almost certainly has*
- What's the part of running RefriTrak that you genuinely love, and the part you secretly hate? How are you going to keep doing the second one for the next ten years? — *10-year founder honesty test*
- What's a strong opinion you held two years ago that you no longer hold, and what changed your mind? — *the GM-to-founder transition almost guarantees this exists*
- What's your honest read of the two or three things that could make RefriTrak an unsuccessful tenure for you? — *pre-mortem from a domain expert*
- What's a technical or operational opinion you hold that most of your peers disagree with, and what's the strongest argument against it? — *separates conviction from noise; suits the cross-domain profile*

## Engineering — Individual Contributor

### Behavioral
- Tell me about a recent project you're proud of. What was your specific contribution, and what would you do differently in hindsight?
- Tell me about a time you had a serious disagreement with a teammate or manager about a technical decision. How was it resolved.
- Tell me about a time you shipped something you later regretted. What did you learn, and what's different about how you work now?
- Describe a time you had to make a technical decision with incomplete information. How did you decide when to commit vs. gather more data?
- Tell me about a time you had to learn an unfamiliar codebase, language, or domain quickly. How did you ramp up?
- Tell me about a time you pushed back on a product or business requirement. What happened?
- Tell me about a time you took initiative on something that wasn't assigned to you. What was the outcome?
- Tell me about a project that failed or got cancelled. What was your role, and what would you do differently?
- Tell me about a time you mentored someone or helped a teammate grow. What did you do, and what did they take away?
- Tell me about a time you influenced a decision across teams without having authority over them.
- ~~Describe a multi-quarter initiative you drove. How did you scope it, sequence it, and know it was working?~~ _(skipped 2026-06-30)_
- Tell me about a time you worked with someone whose style was very different from yours. What did you do to make the collaboration work?

### Situational
- You're three days into a two-week sprint and realize the design you committed to won't work. What do you do?
- A production incident is happening right now and you're the on-call. The error rate is 30% and climbing. Walk me through the first 30 minutes.
- You join the team and inherit a critical service with no tests, no docs, and the previous owner has left. What's your first month?
- A teammate's pull request has a design you think is wrong, but they have more context on the system than you do. How do you handle the review?
- Your manager asks you to ship something by Friday that you believe needs another week to be safe. What do you do?
- If you joined and had your first 90 days to spend however you wanted, what would you focus on?

### Technical Discussion
- Describe the hardest bug you've ever debugged. Walk me through your process from first symptom to root cause.
- Pick a system you've worked on. Whiteboard its architecture, then evolve it to handle 100x the traffic. Where does it break first?
- Design the public API for a service that lets developers schedule jobs. Walk me through your endpoint shape, error model, and versioning strategy.
- Talk me through a non-trivial trade-off you made in a recent design. What did you give up, and how did you decide it was worth it?
- How would you diagnose a service that's returning intermittent 500s for ~2% of requests, with no obvious correlation in the logs?
- Pick a piece of technology you've adopted in the last year. Why that one over the alternatives, and what would change your mind?
- Explain a technical concept you know deeply to me as if I were a smart non-engineer. Then explain it again as if I were a skeptical senior engineer.
- How do you decide when a piece of code or system needs to be rewritten vs. incrementally improved?
- How do you balance shipping fast with building things that last? Give me a concrete example where you got that balance wrong.

### Values & Culture Fit
- What kind of work makes you lose track of time, and what kind drains you?
- What's a technical opinion you hold that most of your peers disagree with, and what's the strongest argument against it?
- What does a great engineering culture look like to you, and what does a bad one look like?
- Tell me about a time you raised a concern that was unpopular with your team or leadership. What happened?
- What's the most important thing you've changed your mind about in your engineering career?
- Why this company and this role specifically — and what would make you leave a year in?
- What does a great manager do for you, and what do you need from a team to do your best work?
- What are you hoping to learn or get better at in the next 12-18 months?
- Where do you want your career to go over the next 3-5 years, and how does this role fit that path?
- Tell me about a time you identified a problem nobody else was looking at, and convinced the team to invest in fixing it.
- Tell me about a time you had to give difficult feedback to a peer. How did you approach it and how was it received?
- What's a question you wish I'd asked, and how would you answer it?

## Engineering Management

### Behavioral
- Walk me through how you run a 1:1. What's the cadence, who owns the agenda, and what does a 1:1 with a struggling engineer look like vs. one with a senior staff engineer?
- Tell me about the most recent time you put someone on a performance plan. Walk me through how you diagnosed the gap, what the conversation sounded like, and what the outcome was.
- Describe an engineer you fired or were forced to let go in a layoff. How did you decide, what did you say, and what did the rest of the team take away from how you handled it?
- Give me an example of an engineer you promoted that you would not promote again, and what changed in your calibration after that.
- Tell me about a senior hire who did not work out. How long did it take you to call it, and what would you have caught earlier in the loop?
- How do you decide when an engineer is ready to be promoted to senior or staff? Give me a concrete example where you held the line on the bar, and one where you advanced someone earlier than the rubric suggested.
- Tell me about a time a PM partner of yours was making a decision you thought was wrong. Walk me through exactly what you said to them, to your team, and to your shared exec.
- Tell me about a time you had to disagree with your CEO or CTO. What was the topic, how did you raise it, and what was the outcome?
- Walk me through the last Sev-1 you led or commanded. Who was incident commander, what did you say to customers, what did you say to the exec team, and what changed afterwards?
- Tell me about a reorg you led or were part of. What problem did it solve, who got hurt, and what would you do differently?
- Tell me about a time you protected your team from a bad request from above. Tell me about a time you should have, and didn't.
- Tell me about a quarter where your team missed badly. What did you tell the team, what did you tell your boss, and what changed for the next quarter?
- Why did you leave your last two roles, and what's the pattern you've noticed in the kinds of orgs that get the best out of you vs. the worst?

### Situational
- Your top IC tells you they're bored and thinking about leaving. They are 60% of the team's load-bearing knowledge. Walk me through the next 30 days.
- Describe the operating rhythm between you and your PM and design counterparts. Who runs what meetings, who owns scope, who owns sequencing, and how do you handle it when those lines blur?
- Two senior engineers on your team disagree on an architectural direction and neither is backing down. The team is blocked. What do you do? Walk me through both the conversation and the decision artifact.
- You have 10 engineers and three priorities the CEO refuses to rank. How do you actually resolve that, and what do you say to the CEO?
- Your on-call rotation is burning people out and one engineer just refused to take their shift. What do you do this week, and what do you do this quarter?
- What's your first 30, 60, and 90 days in this role? Be specific about who you'd meet, what you'd commit to, and what you would deliberately not do yet.

### Leadership
- How do you hire? Walk me through your interview loop end-to-end: what each round is for, who you put in each seat, your bar, and how you debrief.
- How do you decide what tech debt is worth paying down and what isn't? Walk me through how you'd defend a 6-week platform investment to a PM whose roadmap it displaces.
- How current is your technical depth today? When did you last write production code or read a real PR carefully, and how do you stay close enough to the work to make good calls without taking it from your team?
- Describe your incident review process. Who runs it, who's in the room, how do you keep it blameless without letting accountability evaporate, and how do action items actually get done?
- How do you make the manager-of-managers transition real? What changes about how you spend your time, what you can no longer know, and how you keep signal from the ground?
- ~~What do your direct reports like least about working for you? What would your last skip-level say if I called them?~~ _(skipped 2026-06-28)_
- What's your philosophy on engineering culture, and what are two concrete artifacts (a doc, a ritual, a ceremony) you've used to make it real?
- How do you decide what to delegate, what to do yourself, and what to actively pull back on once you've delegated it?

### Strategic
- Walk me through a system you owned or built, the biggest tradeoff you made, and what you'd revisit today with hindsight.
- Walk me through how you'd build a 12-month roadmap for an org you just inherited. Where does input come from, where do you make the cuts, and what does the output document look like?
- Pretend it's three years from now and the company has failed. What are the most likely causes, and which ones would have been your job to prevent?
- How do you measure whether your engineering org is healthy? Give me the three to five metrics or signals you actually look at every week, and what action you've taken from them recently.
- How would you structure an engineering org of 30 vs. 80 vs. 200 engineers? Where do platform, infra, and product split out, and what do you regret about the structures you've used?
- Tell me about the most important hire you'll make in your first six months in this role, and how you'd run the search.
- If I gave you 25% more headcount tomorrow, where would you put it, and what wouldn't you do? If I cut 25%, what's the first thing you stop?
- What's a strong technical opinion you've changed in the last two years, and what changed your mind?
- What does this company most likely get wrong in its first year with you as a leader, and what would you do to make that less likely?

## C-Suite Executive

### Strategic & Vision
- Walk me through how you would diagnose this company in your first 90 days. What signals are you looking for, who do you talk to first, and what would make you change your initial thesis?
- Describe the most consequential strategic bet you've made. What were the two or three alternative paths you rejected, and what would have to be true today for you to admit it was the wrong call?
- How do you set the company's long-term direction without becoming captive to the operating plan? Tell me where you have been ahead of, behind, or in step with your market.
- ~~How do you decide what to fund, what to defund, and what to kill in a constrained capital environment? Give me a specific reallocation you led and the internal resistance it generated.~~ _(skipped 2026-06-28)_
- Take me through a major M&A transaction you led or killed. What was the thesis, what surprised you in diligence, and was the post-close integration value capture realistic in hindsight?
- What do you think the next three years look like for this industry, and where would you place the company's biggest bet?
- Why this company, and why now? What's your honest read of the two or three things that could make this an unsuccessful tenure for you?

### Leadership at Scale
- You've inherited a company whose culture is at odds with its strategy. How do you tell which one has to bend, and what's your playbook for the one that has to change?
- Tell me about an organizational transformation you led that did not work as planned. What did you learn about the gap between what executives announce and what middle management actually executes?
- How do you set culture at scale when you can personally only know a few hundred employees? What specific mechanisms have you used, and which ones did you have to retire because they stopped working?
- Describe how you've handled a high-performer who was misaligned with company values. Walk me from the first signal to the final outcome.
- How do you build and maintain your senior team? Tell me about the last three executives you hired into your direct reports — what gap were you closing, and how have they performed?
- Tell me about the executive you had to remove. What did you know when you hired them, what did you learn that changed your mind, and how long did you wait?
- How do you mobilize through your leadership team versus running the business yourself? Where do you intervene, and what's the threshold for taking back direct control of a function?
- What's your method for understanding what's actually happening on the front line — with customers, employees, and the field — versus what your leadership team tells you?
- Describe a meaningful disagreement with your CFO or general counsel. How did it surface, who was right, and what did the resolution change in your operating relationship?
- Take me through a P&L you owned end-to-end. What were the unit economics, what were the two or three levers that actually moved the number, and which lever did you misjudge?

### Board / Investor / External
- Describe your relationship with your last board chair. Where did you disagree, and how was that disagreement resolved? What did the board not know that you wished they had?
- Walk me through how you've structured board communication between meetings. What goes in the pre-read, what's in the executive session, and what do you bring to the board only when you've already decided?
- How do you communicate bad news to investors — a missed quarter, a guidance cut, a strategic reset? Walk me through a specific instance, including how you sequenced the call with your largest holders.
- What's your view on the right relationship between a CEO and the activist or large-block investor? Tell me about a contested interaction and how it ended.
- Walk me through your media presence and public posture. When do you go on the record, when do you let others speak, and what's an instance where you misjudged that call?
- How do you take a position on a politically charged issue — climate, geopolitics, employee activism — without fracturing the company? Give me an instance and the framework you used.
- What questions are you asking us that we haven't asked you? And what would you need to see in the data room and from this board before you would say yes?

### Crisis & Judgment
- ~~Tell me about a crisis you led through where the facts were still emerging. What did you say in the first 24 hours, what did you hold back, and how did you decide?~~ _(skipped 2026-06-28)_
- Describe a time you faced a regulatory action or investigation. How did you balance cooperation with regulators against shareholder and employee interests? What changed permanently in the company afterward?
- Walk me through a security or data incident you've managed. Who did you call first, who did you call last, and what was your personal role in the response?
- Describe a moment your judgment was tested outside your domain expertise. How did you compensate for what you didn't know, and what did you get wrong?
- Describe a time you had to reset compensation, equity, or benefits structures in a way that was unpopular. How did you preserve trust through it?
- How do you manage your own energy, focus, and personal effectiveness as CEO? What have you stopped doing in the last year, and what blind spot have you been working on?
- Tell me about a moment you knew you were holding the organization back — that the company had outgrown your instincts. What did you do?

## Operations Leadership

### Behavioral
- Walk us through the operations org you've built or run — sites, headcount, span of control, P&L size — and tell us where in that org you spent the bulk of your time on the ground vs. in the boardroom.
- Tell me about a time you cut operational cost without cutting service quality. What was the lever, what did you protect, and how did you prove quality held?
- Take me through your weekly operating rhythm at the previous job — what meetings, what dashboards, what hits your inbox Monday morning, and how the cadence rolls up to the leadership team.
- Tell me about the worst audit finding you've ever owned. What was it, what did the corrective action plan look like, and what changed in the operating model afterwards?
- Vendors and subcontractors. How do you score them, when do you fire one, and tell me about the last time you had to terminate a strategic vendor relationship.
- How do you build the relationship between operations and sales? Give me a concrete example where you stopped sales from selling something operations couldn't deliver — without becoming the 'no' person.
- Tell me about a new-market or new-location launch you led end-to-end. Site selection, hiring ramp, training, first-job readiness — walk me through the timeline and what you'd do differently.
- Pick the biggest operations system implementation you've sponsored — ERP, dispatch, WMS, CMMS. What went wrong, what you did about it, and would you do it again with the same vendor?
- Tell me about a serious safety incident on your watch — what happened, what you did in the first 24 hours, the first 30 days, and what changed permanently in your operating model.
- Tell me about a time you had to lay off or RIF part of an operations team. How did you make the cut list, how did you communicate it, and what did you do for the survivors?
- Tell me about a decision you made primarily on data and one you made primarily on instinct. How did each turn out, and what's your read on when to use which?
- Tell me about your relationship with the CEO or owner in your last role. How did you raise hard truths, and tell me about a time you disagreed with them and what you did.

### Situational
- Overtime is running 18% of total field labor and climbing. You have 60 days before the board notices. Walk me through your diagnosis-to-action sequence.
- You arrive at a new region. The branch manager has been there 12 years, hits revenue but the safety scorecard is the worst in the network. How do you handle that conversation and that situation?
- Your largest supplier just announced a 14% price increase effective in 60 days, and they're sole-source for a critical part. What do you do in week one, month one, and quarter one?
- ~~Customer success or service is escalating churn driven by missed install deadlines. How do you decompose that problem and where does ops own the fix vs. push back?~~ _(skipped 2026-06-28)_
- How do you handle a sales leader who keeps overselling capacity? Walk me through the actual conversation, not the org-chart fix.
- If you joined us, what would your first 30, 60, and 90 days look like? Be specific — what would you measure, who would you meet, and what would you not touch yet?
- Describe how you've handled a region or branch that's been underperforming for two consecutive quarters. What's your turnaround playbook — and at what point do you change the leader?

### KPIs & Metrics
- Pick a multi-site operation you led. Which three KPIs sat on your wall every Monday, and what range did 'green' look like for each? Why those three?
- Describe how you built the technician/field-team utilization model at your last company. What target did you set, what was your baseline, and how did you close the gap?
- Tell me about a continuous-improvement program you've stood up — Lean, Six Sigma, Kaizen, your own flavor. What was the catalyst, the structure, and the measurable result a year later?
- Walk us through a DMAIC or A3 you personally ran. Pick a project where the data surprised you — what did you think the root cause was, and what was it actually?
- What does a high-functioning daily huddle look like at the branch level, and how do you make sure that signal rolls up to you cleanly without becoming a status-meeting tower?
- What's the operational metric most people in this industry obsess over that you think is overrated — and what would you track instead?

### Vendor / Supply Chain
- How do you decide between hiring a permanent technician, contracting a subcontractor, and outsourcing to a partner network? Give me the framework and one decision you made under it.
- Describe your dispatch and routing operating model. Manual, semi-automated, AI-assisted — what did you run, why, and what would you upgrade tomorrow?
- How do you think about technology investment in operations — FSM platforms, telematics, IoT on assets, AI dispatch? Where have you seen real ROI and where have you seen expensive theater?
- What's your model for the operations-finance relationship? Walk me through how you'd partner with a CFO on the annual operating plan, monthly close, and capex prioritization.

### Safety & Compliance
- ~~Walk us through how you've run a safety program in a field business. OSHA recordable rate at start, where you got it to, and the two or three specific interventions that moved the number.~~ _(skipped 2026-06-28)_
- Refrigerant handling, DOT, EPA Section 608, state contractor licensing — pick the regulatory regime most relevant to your last role and tell us how you ensured every site could pass an unannounced audit.
- Describe the culture you build inside an operations team. How do you make safety, quality, and speed coexist without one quietly winning?
- How do you balance standardization vs. local autonomy across sites? Give me an example of where you pushed standardization too hard, and one where you gave local managers too much rope.
- ~~Describe how you've scaled an operations team from N sites to 2N or 3N. Where did the model break first, and what did you fix before the next doubling?~~ _(skipped 2026-06-28)_
- How do you build a bench of branch or site managers? Walk me through the development pipeline you've run and name two people you promoted into their first GM role.
- What's your operations philosophy in one paragraph? Then tell me about a decision where you violated it on purpose and why.

## Founder / Startup Leadership

### Vision & Motivation
- Walk me through the exact moment you decided to start this company — what were you doing the week before, and what changed?
- If this company died tomorrow, what would you do next — and how close is that to what you'd do if it 10x'd?
- Why are *you* the right person to build this — what unfair insight, scar tissue, or unreasonable obsession do you have that 100 other smart people don't?
- Why now? What changed in technology, regulation, behavior, or economics in the last 18-36 months that makes this finally possible?
- If you're right about 'why now,' what does the world look like in five years that doesn't exist today — and what's the wedge you own in it?
- What were you doing before this, and what made you stop? Be specific — what was the conversation, the moment, the opportunity cost?
- What do you believe about this market that most smart people in it think is wrong?
- What outcome would make this whole thing a success for you personally — and would a $50M acquisition in three years be a win or a failure?
- What's the part of running this company that you genuinely love, and the part you secretly hate? How are you going to keep doing the second one for the next ten years?

### Customer & Market
- How many potential customers have you talked to in the last 30 days, and what's the most recent thing one of them said that surprised you?
- Walk me through the last time a customer described the problem you solve — without you prompting them. What words did they use?
- Who is the very first customer you can help, and how often do they have this problem — daily, weekly, quarterly?
- What's the single most important metric for this business, and what is it today versus 90 days ago?
- What are you choosing *not* to build right now, and what would have to be true for you to change your mind?
- What's the new product that, if launched against you tomorrow, would terrify you the most? Why aren't you building it?
- ~~What's the moat — and what stops a well-funded incumbent from copying you in 18 months?~~ _(skipped 2026-06-28)_
- How are you actually going to acquire your first 1,000 paying customers — channel by channel, not 'content + paid'?
- Tell me about the biggest pivot you've considered but didn't make. What kept you on the current path?
- What would have to be true — what metric, what customer signal, what timeline — for you to pivot the company?

### Team & Hiring
- ~~Tell me about the co-founder relationship — how did you meet, how long have you worked together, and what's the biggest fight you've already had?~~ _(skipped 2026-06-28 — solo founder)_
- Who was the most painful person you ever had to fire or let go, and what did you learn about your own hiring mistakes from it?
- Describe your first ten hires — what role, and what is the one trait that mattered more than the resume?
- What's the role you most need to hire next, and the role you're most afraid to hire — and why aren't those the same?
- What do you do every week — even now — that a 'manager-mode' CEO would have delegated by now, and why won't you give it up?

### Capital & Runway
- How much cash do you have, how long does it last at current burn, and at what point would you start cutting?
- What's your burn multiple, and what would you need to believe to justify a 3x burn multiple for the next 12 months?
- What's the smallest amount of outside capital that gets this to self-sufficiency, and what's the path that doesn't require another round?
- What's your honest view on raising — are you raising because you need to, or because you can?
- If a strategic acquirer offered to buy you tomorrow at a price your investors would accept but you wouldn't, how would you handle that?
- If we invested today, what's the one thing you'd want to be held accountable to at the next board meeting?
- What do you want from us as investors beyond the money — and what would make you fire us if you could?

### Resilience
- Tell me about a time something went badly wrong in your life or work and you didn't quit. What specifically kept you going?
- What's a time you hacked something to your advantage — bent a rule, gamed a system, found a backdoor that wasn't supposed to exist?
- Tell me about a time you changed your mind on something important based on customer evidence. What was the evidence, and how long did it take you to act?
- What's a strong opinion you held two years ago that you no longer hold, and what changed your mind?
- If we looked back in a year, which decision you're making this quarter is the one most likely to have killed the company?
- What's the conversation you're currently avoiding — with a co-founder, an investor, an employee, or yourself?
- What does a bad week look like for you personally right now, and what's your actual recovery routine — not the aspirational one?
- Who do you call when things are genuinely bad, and how often have you called them in the last 90 days?
- What's the part of your business that, if I dug into it for two hours, would scare me the most?
- Walk me through how you make a hard call when your gut and the data disagree. Give me a recent example.

---

*Last research run: see notes for sources_consulted and stats.*
