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

For each focus topic (in ranked order), use `WebSearch` to surface stories from the **last 48 hours**. Append "news", "announcement", or "released" + current date to queries. Aim for 2–4 results per topic, max 20 candidates total.

### Trusted source tiers (strict — do not deviate)

**Tier 1 — Primary sources (always prefer)**
- Official company blogs: anthropic.com/news, openai.com/blog, blog.google, mistral.ai/news, huggingface.co/blog, meta.ai/blog, deepmind.google/discover/blog
- arXiv.org (preprints — always accessible, no paywall)
- GitHub.com (model/framework releases, changelogs)

**Tier 2 — Reputable tech publications (Vietnam-accessible)**
- techcrunch.com, venturebeat.com, the-decoder.com, arstechnica.com
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

## Step 4: Dedup and rank

- Dedup by URL hash against `seen`. Skip already-seen stories.
- Same-event dedup: if multiple sources cover the same announcement, keep primary source only.
- **Rank by topic priority:** stories matching the #1 ranked focus topic get highest placement. Work down the ranked list.
- Secondary ranking within topic: Concrete release/launch/paper > opinion > roundup.
- Tertiary: Source tier (Tier 1 > Tier 2 > Tier 3).
- Cap final report at top 10–15 stories. Mark up to 3 as "Top reads."

## Step 5: Produce the HTML report

**Filename:** Write directly to `/Users/macbook/Working/Vulcan Labs/AI News/news/daily-ai-news-<YYYY-MM-DD>.html` (always inside the `news/` subfolder).

**Design:** Follow `/Users/macbook/Working/Vulcan Labs/AI News/memory/preferences/digest-format.md` exactly:
- Brand: "AI Intelligence · Vulcan Labs Daily", issue number sequential
- Layout: **1120px wide, multi-column grid** — NEVER use 760px single-column
- Design tokens: `--bg:#07070a --s1:#0f0f14 --gold:#c8a76a --blue:#5d8dee --teal:#3ecf8e --purple:#9d78f0 --red:#e55252`
- Sections: Masthead → Focus chips (ranked order, top topic = leftmost) → Ticker (breaking) → "Breaking This Week" hero grid → "Tin tuần này" 3-col cards → "Đáng đọc" 2-col briefing → "Technical Deep-dive" 2-col tech cards → "Đọc thêm" 3-col notes → Footer
- Section labels Vietnamese; story titles/descriptions mix Vietnamese + English technical terms
- Reference yesterday's `news/daily-ai-news-<prev-date>.html` for issue number (increment by 1)
- Story count target: 10–15 total (Hero 1 + Watch 1 + Mini 1–2 + Cards 3 + Briefing 6 + Deep-dive 4 + Notes 3)

After writing the HTML, append new story URLs to `focus.json`'s `seen` array, prune entries >14 days old, and save.

## Step 6: Update manifest.json

Update `/Users/macbook/Working/Vulcan Labs/AI News/manifest.json` — prepend today's entry:
```json
{ "date": "YYYY-MM-DD", "file": "news/daily-ai-news-YYYY-MM-DD.html", "issue": <N>, "headline": "<3–5 word summary of top story>" }
```
Keep all existing entries. Cap array at 90 entries. Save.

## Step 7: Deploy to Netlify

```bash
cd "/Users/macbook/Working/Vulcan Labs/AI News"
netlify deploy --dir . --prod 2>&1
```

If `netlify` is not installed or not authenticated, skip silently and note: "Netlify not configured — run `npm i -g netlify-cli && netlify login && netlify init` once to enable auto-deploy."

If deploy succeeds, include the Netlify URL in the chat summary.

## Step 8: Deliver

Present the HTML file with a `computer://` link and a 2-sentence chat summary highlighting the single most relevant story. Include the Netlify URL if deploy succeeded.

Do not paste the digest body into chat.

## Guardrails
- Never fabricate news. If a topic has no fresh results, write "No fresh news on <topic>" under that section.
- If `WebSearch` is rate-limited or unavailable, write a stub report explaining this and stop.
- **Hard rule: no story older than 14 days.** Main stories prefer ≤48h.
- **Hard rule: every link must be verified via WebFetch before inclusion.** Drop broken/paywalled/404 links entirely.
- Never include links from thenextweb.com or wired.com under any circumstances.
- Focus chips in the masthead reflect the **ranked** topic order (top topic = leftmost chip).