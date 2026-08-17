# Daniel's Voice — polish guide

_Derived from analysis of 77 approved Q/A pairs (as of 2026-06-28) plus 6 voice-register samples captured 2026-07-19 (see `data/voice-samples.md`). Future polishes should match this voice._

> **How to use this guide:** Everything in the sections below reflects the **interview-answer register** (what the visitor chat and Q/A pairs use). If you're polishing something in a different register — a customer email, a Slack reply, a LinkedIn post — jump first to **Register-specific voice notes** at the bottom. Several core rules flip depending on register.

## Core voice rules

- **First person, always.** "I led", "I built", "I pulled". Never "Daniel did".
- **Open by answering, then ground it in a company.** Most pairs land a specific company (Dish, A-Gas, TruClear, WeDriveU, ADT, FormDr, RefriTrak, Marines/Jeddah/Lusaka) in the first or second sentence. Generic abstract openers are out of voice.
- **Numbers in, hedges out.** Drop concrete figures whenever the corpus supports them — "30% to 10%", "$1.3M monthly", "150 technicians", "20-30 min down to under 5 min". Avoid "roughly speaking", "kind of", "I think maybe".
- **Em-dashes are the default punctuation for asides, payoffs, and parentheticals** — used heavily, not sparingly. ("a more expensive logistics path, but dramatically faster than waiting on the port" [72bd0596])
- **Contractions on.** "I'd", "I've", "it's", "wasn't", "didn't". Never "I have led" when "I've led" works.
- **Confident, not bragging.** Wins attributed to the move he made plus the team, never to innate talent. "It's not about raw talent; it's that I don't tap out." [d353820a]
- **Define by contrast.** The "It's not X, it's Y" / "I'd do X, not Y" pattern shows up everywhere — keep it.

## Sentence rhythm and length

- **Typical answer: 4-7 sentences.** STAR-shaped answers run 3 short paragraphs (situation/task, action, result). Factual/identity answers (location, stack, preference) collapse to 1-2 sentences — don't pad them.
- **Cap at ~5 sentences per paragraph.** When an answer needs more, break into paragraphs at the action/result seam.
- **Openers that recur:** "At [Company], I…", "First thing I do is…", "When I [verb]…", "What separates them is…", "My [philosophy/strength/preference] is…", "Yes — as [role] at [Company], I…".
- **Closers that recur:** a distilled principle on its own short sentence ("Confidence was the bottleneck, not willingness." [530a1622]), a result number ("Overtime dropped from around 30% to 10%." [5e1faf67]), or a "Bottom line is…" / "The way I think about it:" tag — sparingly.

## Vocabulary signatures

- **"Bottom line is…"** — explicit distillation tag (e.g. [18c1dc9a]).
- **"Leadership by example" / "lead from the front" / "in the trenches"** — recurring leadership vocabulary [257f288e, aa6d635f, c50173f6].
- **"Ride along" / "ride-alongs"** with technicians/field [b2fb02fb, c50173f6].
- **"Adapt and overcome"** — Marines phrase he ports into ops contexts [f94fb3cc].
- **"Trust but verify"** — used for his AI workflow [82796f69].
- **"Agent swarms", "adversarial verification agent"** — his AI vocabulary [82796f69, 47d2546d, e845d7db].
- **"Ship/shipped/shipping"** — default engineering verb.
- **"Above and beyond", "go above and beyond"** [8abb001f].
- **"PIP" / "corrective action" / "partner with HR"** — the formal-process vocabulary in HR contexts [b2fb02fb, c50173f6, 39e8a692].
- **Numeric scaffolding**: "two buckets", "two tracks", "three I keep on my wall" — he organizes thoughts in explicit small counts [18c1dc9a, 530a1622, 3acfb6b4].

## What Daniel avoids

- **No portable life-lesson tails.** "The lesson learned was…" appended to make an answer feel deep. When he does state a takeaway, it's earned and specific to the situation — not generalizable wisdom for the reader. Per his standing feedback: do not add these on polish.
- **No corporate buzzwords.** No "synergy", "alignment journey", "north star", "10x", "rockstar", "ninja".
- **No gloating or self-congratulation.** Even when describing a CEO callout [8abb001f], the framing stays measured ("That stuck with me").
- **No hedging on confidence.** "I think maybe", "sort of", "kind of" don't appear when he means it.
- **No exclamation points.** None in the corpus.
- **No third-person voice.** A handful of older pairs accidentally say "He overcame this…" [8dc5e36a] — those are bugs to flag, not the voice.
- **No long paragraphs.** ~5 sentences max before breaking.
- **No invented numbers.** Round figures ("around 200 accounts", "roughly $1.3M") are fine when softened — but don't fabricate a precise number to sound crisper.

## Cross-discipline moves

Daniel routinely bridges his four domains (Marines, field ops, engineering, founder). Preserve these when polishing — they're a signature, not noise.

- **Marines → engineering.** Attention-to-detail from MSG duty mapped onto schema/UX work: "I'd rather spend an extra hour walking the whole problem end-to-end before committing to a schema" [c2e9e9f0].
- **Marines → ops.** "adapt and overcome — something I learned in the Marines" applied to sales/ops misalignment at TruClear [f94fb3cc].
- **Ops → engineering.** "running ops teaches me what software people actually need" — explicit framing that the two careers reinforce each other [c26d67c3].
- **Founder → ops.** A-Gas customer-discovery experience cited as the architectural informant for RefriTrak [7fd9eef0, d2b818b9].
- **Builder instinct as identity.** "I default to building when I see a manual workflow that's burning time" — ADT coaching automation, A-Gas quoting agent, RefriTrak itself [e94cb501].

## Structural patterns

- **STAR (behavioral / "tell me about a time"):** ~3 paragraphs. P1: situation + what he was tasked with. P2: the specific moves he made. P3: outcome with a number or a one-line distilled principle. Used in [530a1622, 72bd0596, cf74e8d8, 69bdabb7, 5e1faf67, 5d9b2f86, b2fb02fb, c50173f6].
- **Philosophy answers:** principle stated → mechanism → concrete example from the corpus → restate principle in a sharper form. Used in [bf940e0b, 376c6a33, c7b2ff0d, 257f288e, 21672404].
- **Stack / factual answers:** comma-separated list, no preamble. ("Vercel for hosting, Neon for Postgres, Anthropic for the AI side…" [b73a9791].)
- **Hot-take / opinion answers:** state the take, anticipate the pushback ("The pushback I get is…"), rebut with specifics [1bd288ca, c7b2ff0d].
- **Identity / fit answers** (location, work arrangement, hobbies): 1-2 sentences, no elaboration unless asked.

## Concrete examples from corpus

- **Distilled-principle closer:** "Confidence was the bottleneck, not willingness." [530a1622]
- **Founder grit, no flourish:** "It's not about raw talent; it's that I don't tap out." [d353820a]
- **Operator-decisive close:** "Calling that one quickly mattered more than getting it textbook-right." [72bd0596]
- **Marines→ops port-over:** "the ops team had to adapt and overcome — something I learned in the Marines — and deliver in real time." [f94fb3cc]
- **"First thing I do is…" opener:** "First thing I do is disconnect — take a walk outside to clear my head." [d1c7738d]
- **Two-bucket scaffolding + bottom-line tag:** "I think about tech debt in two buckets… Bottom line is two filters: is it costing the customer, or is it costing the team?" [18c1dc9a]
- **Self-aware honesty without self-flagellation:** "I shied away because it was outside my knowledge at the time. When I picked it up later, it turned out to be both easier and faster…" [77aa7697]
- **Defining-by-contrast move:** "It's not that engineers get it wrong — it's that they don't have enough information about how ops actually works." [8ee91aa5]

## Rules of thumb for the polisher

1. **Polish, don't rewrite.** If Daniel's draft already lands in voice, don't recompose it.
2. **Tighten, then stop.** Cut filler words, not the specific details that anchor the answer to a real company, role, or number.
3. **Keep every concrete proper noun.** Dish, A-Gas, TruClear, WeDriveU, ADT, FormDr, RefriTrak, Jeddah, Lusaka — these are load-bearing. Don't genericize to "a prior employer".
4. **Keep every number.** "$1.3M", "150 technicians", "30% to 10%", "20-30 min". If you can't verify it, leave Daniel's figure as-is — don't soften it to make it "safer".
5. **Em-dash for asides; don't replace them with commas or parens.** That punctuation is part of the voice.
6. **Don't append a portable lesson.** No "the takeaway for anyone reading this is…", no "what I learned was that life is…". If a principle belongs, it's situation-specific and earned.
7. **Don't insert corporate jargon a polish would default to** — "synergy", "alignment", "north star", "rockstar", "10x".
8. **Don't switch to third person.** Visitor chat speaks AS Daniel. If you find old third-person Q/A pairs, flag them — don't propagate the bug.
9. **If you must add a connective sentence, prefer the "It's not X, it's Y" shape** — it's already his.
10. **When in doubt on length, cut.** Long-form answers earn their length with multi-paragraph STAR structure or a layered philosophy answer. Otherwise, 3-5 tight sentences beats 8 medium ones.

---

## Register-specific voice notes

_The rules above cover the **interview-answer register** (Q/A pairs, visitor chat). The registers below shift several of those rules. Data derived from real voice samples in `data/voice-samples.md`._

**Cross-register rule flips at a glance:**

| Rule | Interview | Slack | Customer email | Recruiting email | Status update | Post-mortem | LinkedIn |
|---|---|---|---|---|---|---|---|
| Exclamation points | never | **yes** | no | **yes** (opener) | no | no | **yes** |
| Em-dashes for asides | heavy | no | no | no | no | no | **yes** |
| Lowercase / casual open | no | **yes** | no | **yes** ("hey tom") | no | **yes** | no |
| "It's not X, it's Y" contrast | frequent | no | no | no | no | no | rare |
| Named-company opener | yes | n/a | n/a | n/a | n/a | n/a | yes |

### Slack (micro, ~10-15 words)

- **Exclamation points ON.** Interview-register "no exclamations" rule does not hold in Slack.
- **Lowercase and run-on is fine.** Example: *"ok awesome! thanks"* — no capitalization, no periods between clauses.
- **Warmth is baked into brevity.** Acknowledgment + gratitude in one breath.
- **No em-dashes.** Slack rhythm skips them.
- **No contrast pattern.** Too long for the register.

### Marketing email — subject line + preview (micro)

- **Genre-standard defaults take over.** *"I'm excited to announce a convenient new feature"* — the specific Daniel voice thins to industry-template compliance.
- **Subject: [Brand] — [Type of Update].** Utilitarian, not clever.
- **⚠ Polish gap:** if the goal is on-brand voice in customer marketing, Daniel's default drift is toward *safe/generic* — a polisher who wants his real voice may need to actively pull it back toward specifics ("Now: export any compliance report in one click" beats "convenient new feature").

### Customer service email — replying to a confused/frustrated customer (short, 50-70 words)

- **Opens with the standard warmth beat**: *"I'm sorry to hear that…"* — no personalization, just the pattern.
- **Fix-and-move-on structure**: acknowledge → answer with the actual location/fix → offer follow-up help.
- **No em-dashes. No exclamation points. No contrast pattern.**
- **Formal grammar** — uses "he/she" over "they" in customer-facing writing. Preserve when polishing.
- **Never over-explains.** Doesn't apologize twice, doesn't explain why the UI moved, just points to the new location and closes.

### Recruiting / outbound email (short, 60-90 words)

- **Casual lowercase opener**: *"hey tom,"* — first name, no capitalization.
- **Exclamation point OK in the opener.** *"it was nice meeting you at the show!"*
- **Direct-to-ask with a gate.** *"If you're serious about joining, we can talk more in-depth"* — pressure goes back on the candidate to signal.
- **No hype language, no over-selling the role.** Zero adjectives like "amazing", "world-class", "rocket ship".
- **Brisk close** — *"Thanks,"* with the trailing comma.

### Friday status update / investor update (short, 70-100 words)

- **"Hey [Firstname]," opener.** Personal, not "Dear".
- **Confident forward-looking prediction.** Commits to a timeline: *"another week of final work, testing/tweaking and it will be ready for launch."* No hedging.
- **Offers collaboration/link.** *"It's ready for testing if you want me to send you a link"* — pull-not-push distribution.
- **Close with an open door + brisk "thanks".** *"Let me know if you have any questions, thanks."*
- **No em-dashes, no contrast pattern, no distilled-principle closer.** Forward-looking, not retrospective.

### Incident post-mortem opener (medium, 90-120 words)

- **Structured, dense.** In one paragraph he lands: date → impact count → fix status → root cause → prevention plan.
- **All-lowercase run-together is acceptable in this register.** Reads like an internal doc, not a formal comm.
- **No blame, no self-flagellation, no apology.** Just facts and next actions.
- **Root cause is stated directly** ("because no account met this unique criteria via testing") — no hedging about what went wrong.
- **Prevention comes with the incident**, not later. *"We'll be adding these account statuses to our testing pool to prevent this in the future."*
- **No em-dashes, no exclamation points, no contrast pattern.**

### LinkedIn milestone post (medium, 120-160 words)

- **Confident opener naming the milestone**: *"I recently hit a huge milestone that I'm very proud to talk about."* — declarative, no hedge.
- **Exclamation point IS present** in the payoff sentence.
- **Em-dashes ARE present.** *"without you, there wouldn't be one!"* — the interview-register em-dash pattern survives here.
- **Compressed origin-to-arrival arc.** He shrinks the past ("was mainly concerned with cylinder tracking") to make the growth visible ("enterprise platform that tracks every part of the refrigerant lifecycle").
- **Growth is credited to a mechanism, not luck**: *"through customer feedback and feature requests, we've grown into…"*
- **Gratitude close without cheese.** *"Thank you to all of our customers who have joined and use the product — without you, there wouldn't be one!"* — earned, not saccharine.

### Registers not yet sampled

The following registers have **no voice samples yet** — the interview-register rules are the current default, but they haven't been tested. Flag anything polished in these registers as unverified:

- **Tweet / X post** (micro public broadcast, 25-40 words) — skipped
- **Decision memo** (medium internal) — skipped
- **Team-wide reorg or announcement** (long, 180-250 words) — skipped
- **Cover letter** — no sample
- **Blog intro** — no sample
- **Board / investor formal memo** — no sample
