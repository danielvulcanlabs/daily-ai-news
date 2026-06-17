---
name: daily-ai-news
description: Daily AI news digest tuned to Daniel's current work focus. Pulls focus signals from recent activity, web-searches scoped news from the last 24h, outputs a deduped HTML report.
---

Build a daily AI news digest for Daniel (luanle@vulcanlabs.co), filtered to his current professional focus. Output is a single HTML report.

## Step 1: Rank & infer focus topics from connectors

Do not ask Daniel — infer and **rank** topics from live connector signals. Pull all sources in parallel, ordered by signal priority:

1. **Claude memory** *(highest weight — 2.0)* — Read `/Users/macbook/Working/Vulcan Labs/AI News/CLAUDE.md` and all files under `/Users/macbook/Working/Vulcan Labs/AI News/memory/`. Extract explicit project names, technologies, and current focus areas Daniel has recorded. This is the most reliable signal of what he cares about right now.

2. **Slack** *(weight 1.5)* — Search messages Daniel sent in the last 14 days (`from:@luanle after:<14 days ago>`). Extract recurring noun phrases, product names, technical terms. Score by recency × frequency.

3. **Jira** *(weight 1.2)* — `searchJiraIssuesUsingJql` for `assignee = currentUser() AND updated >= -14d`. Extract keywords from issue titles, labels, components. Score by recency × frequency.

4. **Drive** *(weight 0.7)* — `list_recent_files` for the last 14 days. Use doc/sheet titles as weak topic hints.

5. **Gmail** *(weight 0.3)* — `search_threads` for threads sent/received by Daniel in the last 14 days. Extract subject lines only as very weak hints — Gmail is mostly promotional/external noise; treat signals here with heavy skepticism unless the thread is explicitly marked IMPORTANT or is a direct reply chain.

6. **Previous focus.json** — if `outputs/ai-news/focus.json` exists, read it for the prior ranked topic list and `seen` URLs.

**Ranking algorithm:**
- Merge all keyword signals: `score = (memory_weight × memory_freq) + (slack_weight × slack_freq) + (jira_weight × jira_freq) + (drive_weight × drive_freq) + (email_weight × email_freq)`
- **Rerank vs prior run:** topics from last run that still have signal → apply 0.8× decay (already covered recently). Genuinely new topics → apply 1.2× boost.
- Output a **ranked** focus list of 4–7 topics, each a short query-ready phrase. Top topic = most urgent. Bottom = background.

Persist to `outputs/ai-news/focus.json`:
```json
{ "updatedAt": "<ISO>", "topics": ["<ranked 1>", "...", "<ranked N>"], "seen": ["<url>", ...] }
```
**`seen` list rules:** prune any entry older than 14 days on each save. Cap at 500 entries.

Fallback if all connectors return no data: use `["frontier LLM releases", "AI coding assistants", "agent frameworks", "AI product launches"]` and note fallback in the report.

## Step 2: Search news

**Editorial stance: technical-first, ~80/20 technical-to-press.** This digest is for an engineering audience. Strongly prioritize stories with technical substance — model/framework releases, research papers, benchmarks, architecture, APIs, eng deep-dives, open-source — over business/PR coverage. Roughly 80% of included stories should be technical; reserve the remaining ~20% for genuinely significant business/launch news that carries real engineering implications (e.g. a major model launch, a pricing change that affects cost optimization). Aggressively drop pure-press items (funding rounds, exec hires, partnerships, market-share punditry, opinion/hot-takes) unless they have a concrete technical angle.

For each focus topic (in ranked order), use `WebSearch` to surface stories from the **last 48 hours**. Bias queries toward technical depth: append terms like "release", "paper", "arXiv", "benchmark", "open source", "technical report", "model card", "API", "changelog" alongside the topic + current date. Aim for 3–5 results per topic, max 24 candidates total — prefer over-collecting technical candidates so the press filter still leaves enough material.

### Technical-substance test (apply to every candidate)

Before keeping a candidate, ask: *does this story teach an engineer something concrete?* Keep it if it covers at least one of: a model/framework/tool release or version bump, a research paper or technical report, benchmark/eval results, architecture or system design, code/API/SDK changes, performance or cost numbers, or a reproducible method. If the story is primarily about money, people, deals, or market narrative with no technical detail → drop it (or, if it's a top-tier event, demote it to a one-line note in "Đọc thêm").

### Trusted source tiers (strict — do not deviate)

**Tier 1 — Primary & technical sources (always prefer — these should dominate the digest)**
- arXiv.org (preprints — always accessible, no paywall) — **top priority for technical depth**
- GitHub.com (model/framework releases, changelogs, RFCs) — **top priority**
- Official company blogs / research & engineering blogs: anthropic.com/news + research, openai.com/blog + research, blog.google + research.google, mistral.ai/news, huggingface.co/blog + papers, meta.ai/blog + ai.meta.com/research, deepmind.google/discover/blog
- Engineering blogs: model cards, technical reports, framework docs/release notes (LangChain, LlamaIndex, vLLM, etc.)

**Tier 2 — Reputable tech publications (Vietnam-accessible — prefer ones with technical reporting)**
- the-decoder.com, arstechnica.com (lean technical), venturebeat.com (AI/infra coverage), techcrunch.com
- 9to5google.com, 9to5mac.com, androidcentral.com, techtimes.com, letsdatascience.com

**Tier 3 — Use only if Tier 1 & 2 have no coverage**
- techradar.com, zdnet.com, engadget.com, tomsguide.com

**Always skip:**
- thenextweb.com, wired.com — Cloudflare-blocked in Vietnam
- medium.com / substack.com — low reliability
- Any site requiring login, subscription, or paywall
- SEO-bait listicles and aggregator slop

## Step 3: Verify links + age-gate

For **every candidate story URL**, run `WebFetch` to confirm:
1. Page returns real content (not 404, redirect-to-homepage, paywall, or empty shell)
2. Publication date is confirmed on the page — **hard-drop any story older than 14 days**
3. Link resolves to the actual article, not a tag/search page or redirect

Stories failing any check are dropped entirely. Only include URLs that load real, dateable, accessible content.

Main stories: prefer ≤48h. "Recent context" boxes (visually distinct, max 2): ≤14 days.

## Step 4: Dedup, filter press, and rank

**4a. Dedup by URL** — hash against `seen`. Skip already-seen stories.

**4b. Event-level dedup (strict — dedup by topic/event, not by URL).** Group all candidates by the underlying event, not by source or wording. Two stories are the *same event* if they describe the same model release, paper, version bump, feature, or announcement — even if from different sources, different outlets, or worded differently. For each event group, keep exactly **one** representative: prefer the primary/technical source (arXiv or GitHub or official blog > Tier 2 > Tier 3); within the same tier, prefer the one with the most technical detail. **Each distinct event appears at most once across the entire digest** — no event may repeat between sections (e.g. it cannot be both a Hero card and a "Tin tuần này" card). Before finalizing, scan the full selected set and confirm every story is a genuinely distinct event; if two cards are about the same thing, merge them.

**4c. Press filter (enforce the ~80/20 technical stance).** Apply the technical-substance test from Step 2 to the deduped set. Drop pure-press items. Count technical vs press in the final selection — if press exceeds ~20% of stories, drop the weakest press items until technical is the clear majority. Surviving press items must have a concrete technical angle; otherwise demote to a single line under "Đọc thêm."

**4d. Rank.**
- **By topic priority:** stories matching the #1 ranked focus topic get highest placement. Work down the ranked list.
- Secondary ranking within topic: Concrete release/paper/benchmark > technical analysis > launch > opinion > roundup.
- Tertiary: Source tier (Tier 1 > Tier 2 > Tier 3).
- Cap final report at top 10–15 stories. Mark up to 3 as "Top reads" — prefer technical items for these.

## Step 5: Produce the HTML report

**Filename:** Write directly to `/Users/macbook/Working/Vulcan Labs/AI News/news/daily-ai-news-<YYYY-MM-DD>.html` (always inside the `news/` subfolder).

**Design:** Follow `/Users/macbook/Working/Vulcan Labs/AI News/memory/preferences/digest-format.md` exactly:
- Brand: "AI Intelligence · Vulcan Labs Daily", issue number sequential
- Layout: **1120px wide, multi-column grid** — NEVER use 760px single-column
- Design tokens: `--bg:#07070a --s1:#0f0f14 --gold:#c8a76a --blue:#5d8dee --teal:#3ecf8e --purple:#9d78f0 --red:#e55252`
- Sections: Masthead → Focus chips (ranked order, top topic = leftmost) → Ticker (breaking) → "Breaking This Week" hero grid → "Tin tuần này" 3-col cards → "Đáng đọc" 2-col briefing → "Technical Deep-dive" 2-col tech cards → "Đọc thêm" 3-col notes → Footer
- Section labels Vietnamese; story titles/descriptions mix Vietnamese + English technical terms
- Reference yesterday's `news/daily-ai-news-<prev-date>.html` for issue number (increment by 1)
- Story count target: 10–15 total, **technical-weighted**: Hero 1 (technical if possible) + Watch 1 + Mini 1–2 + Cards 3 + Briefing 4–5 (technical-leaning) + **Technical Deep-dive 5–6 (expanded — this is the centerpiece)** + Notes 3. Across the whole digest, ~80% of stories should pass the technical-substance test.

After writing the HTML, append new story URLs to `focus.json`'s `seen` array, prune entries >14 days old, and save.

## Step 6: Update manifest.json

Update `/Users/macbook/Working/Vulcan Labs/AI News/manifest.json` — prepend today's entry:
```json
{ "date": "YYYY-MM-DD", "file": "news/daily-ai-news-YYYY-MM-DD.html", "issue": <N>, "headline": "<3–5 word summary of top story>" }
```
Keep all existing entries. Cap array at 90 entries. Save.

## Step 7: Push to GitHub

Commit today's digest and push — GitHub Pages serves the static site automatically.

```bash
cd "/Users/macbook/Working/Vulcan Labs/AI News"
git add news/daily-ai-news-<YYYY-MM-DD>.html manifest.json index.html
git commit -m "Add daily AI digest <YYYY-MM-DD>"
git push origin main
```

If push fails (auth, dirty tree, etc.), note the error in the chat summary. Do not force-push.

## Step 8: Deliver

Present the HTML file with a `computer://` link and a 2-sentence chat summary highlighting the single most relevant story. Include the GitHub repo URL if push succeeded.

Do not paste the digest body into chat.

## Guardrails
- **Technical-first:** ~80% of included stories must pass the technical-substance test (Step 2). Aggressively drop pure-press items (funding, hires, partnerships, market punditry, opinion) unless they carry a concrete technical angle.
- **No duplicate events:** each distinct event/model/paper/announcement appears at most once across the entire digest. Never let the same story show up in two sections. When in doubt, merge.
- Never fabricate news. If a topic has no fresh results, write "No fresh news on <topic>" under that section.
- If `WebSearch` is rate-limited or unavailable, write a stub report explaining this and stop.
- **Hard rule: no story older than 14 days.** Main stories prefer ≤48h.
- **Hard rule: every link must be verified via WebFetch before inclusion.** Drop broken/paywalled/404 links entirely.
- Never include links from thenextweb.com or wired.com under any circumstances.
- Focus chips in the masthead reflect the **ranked** topic order (top topic = leftmost chip).