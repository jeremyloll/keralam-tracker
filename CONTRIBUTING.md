# Contributing to the Keralam Manifesto Tracker

This is a non-partisan public ledger. We track facts, not opinions.  
We hold no affiliation with any party. We want this UDF government to succeed — which is why we hold it accountable to its own words.

---

## Table of contents

1. [What we track](#what-we-track)
2. [How to submit an update](#how-to-submit-an-update)
3. [Source hierarchy](#source-hierarchy)
4. [Status definitions](#status-definitions)
5. [How to edit promises.json](#how-to-edit-promisesjson)
6. [Schema reference](#schema-reference)
7. [What gets rejected](#what-gets-rejected)
8. [Maintainer review process](#maintainer-review-process)
9. [Code of conduct](#code-of-conduct)

---

## What we track

Every promise in this tracker is sourced **verbatim** from the UDF's official 2026 election manifesto, with a page number reference.

We track:
- Whether the promise has been acted on
- The exact government action taken (or not taken)
- The source document proving it

We do **not** track:
- Government actions not promised in the manifesto (those go in a separate initiatives list)
- Opinions about whether a policy is good or bad
- Rumours, leaks, or unverified claims

---

## How to submit an update

### Option A — GitHub Pull Request (preferred)

This is the gold standard. Your update becomes part of the permanent audit trail.

1. Fork this repository
2. Edit `data/promises.json`
3. Find the correct promise by its `id`
4. Add a new object to its `updates` array (see [schema below](#schema-reference))
5. Open a Pull Request with:
   - The source URL in the PR description
   - A one-line summary of what changed

The validator runs automatically. If it fails, fix the errors it reports.

### Option B — GitHub Issue (for non-developers)

If you don't know how to edit JSON:

1. Go to **Issues → New Issue → Promise update submission**
2. Fill in the template honestly
3. A maintainer will convert it to a PR if the source checks out

**Do not open a blank issue.** Use the template.

---

## Source hierarchy

Every update **must** cite a source. We follow a strict hierarchy:

| Tier | Accepted sources | Required for "Fulfilled"? |
|------|-----------------|--------------------------|
| 1 | Official Kerala Gazette, Government Order (GO), cabinet minutes, official press release from PIB or state government | Yes |
| 2 | PTI/ANI wire reports, The Hindu, Indian Express, Mathrubhumi, Malayala Manorama, Business Standard, Deccan Chronicle | Acceptable with corroboration |
| 3 | Other credible regional press with a direct URL | For "In Progress" only |

**Never accepted:**
- Social media posts (including official party accounts)
- Politician quotes in press conferences (unless carried by Tier 1/2 publication)
- Wikipedia
- Paywalled articles without an archived link
- Anonymous sources

When in doubt: if you cannot link directly to the sentence that proves the claim, do not submit.

---

## Status definitions

| Status | Meaning |
|--------|---------|
| `pending` | No action taken yet. The promise could still be fulfilled. |
| `progress` | A credible source confirms the government has initiated or is actively pursuing this. A gazette is not required. |
| `fulfilled` | A formal document (gazette, enacted bill, official order) or verified on-ground evidence confirms beneficiaries are receiving the benefit. |
| `evaded` | The government has taken action that makes fulfilment **structurally impossible** — e.g. replacing a promised repeal with an 18-month committee. Pending means it could still happen. Evaded means the door has been closed. |

**Important:** "Evaded" is a high bar. Do not mark something evaded because it is delayed. Only use it when the government has taken a specific action that forecloses the promise.

---

## How to edit promises.json

`data/promises.json` is a JSON array. Each item is a promise object.

To add an update to promise #3, find the object with `"id": 3` and add to its `updates` array:

```json
{
  "date": "2026-10-15",
  "prev_status": "progress",
  "new_status": "progress",
  "note_en": "Labour department confirmed gazette notification delayed to Q1 2027.",
  "note_ml": "തൊഴിൽ വകുപ്പ് 2027 ഒന്നാം പാദത്തിലേക്ക് വിജ്ഞാപനം നീട്ടിവെച്ചതായി സ്ഥിരീകരിച്ചു.",
  "source_url": "https://www.mathrubhumi.com/direct-link-to-article",
  "source_label": "Mathrubhumi, 15 October 2026",
  "source_tier": 2,
  "contributed_by": "github:yourusername"
}
```

Updates must be added in **chronological order** (oldest first).

The `new_status` of the **last update** must match the promise's top-level `status` field. The validator will reject your PR if they don't match.

---

## Schema reference

### Promise object

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `id` | integer | ✓ | Unique, never reused |
| `slug` | string | ✓ | Lowercase kebab-case. Used in URLs. |
| `title_en` | string | ✓ | Short English title |
| `title_ml` | string | ✓ | Malayalam translation |
| `verbatim` | string | ✓ | Exact text from manifesto |
| `manifesto_page` | integer | ✓ | Page number in official PDF |
| `category` | string | ✓ | See valid categories below |
| `departments` | string[] | ✓ | Responsible government departments |
| `status` | string | ✓ | `pending` / `progress` / `fulfilled` / `evaded` |
| `timeline_promised` | string | — | e.g. "100 days", "5 years" |
| `updates` | array | ✓ | Use `[]` if no updates yet |

### Update object

| Field | Type | Required | Notes |
|-------|------|----------|-------|
| `date` | string | ✓ | `YYYY-MM-DD` format |
| `prev_status` | string | ✓ | Status before this update |
| `new_status` | string | ✓ | Status after this update |
| `note_en` | string | ✓ | English description of what happened |
| `note_ml` | string | — | Malayalam translation (encouraged) |
| `source_url` | string | ✓ | Must start with `https://` |
| `source_label` | string | ✓ | e.g. "The Hindu, 12 June 2026" |
| `source_tier` | integer | ✓ | `1`, `2`, or `3` |
| `contributed_by` | string | — | e.g. `github:username` |

### Valid categories

`Economy` · `Health` · `Education` · `Infrastructure` · `Governance` · `Labour` · `Environment` · `Social Justice` · `Agriculture` · `Tourism` · `Women & Child` · `IT`

To add a new category, raise it in an issue first.

---

## What gets rejected

Pull requests will be rejected (by the validator or by a maintainer) if:

- `source_url` is missing or not publicly accessible
- The `verbatim` field is edited (we only track what was actually promised)
- `new_status` of the last update doesn't match the top-level `status`
- The source is a social media post, party statement, or politician quote
- The JSON is malformed (run `node scripts/validate.js` locally before submitting)
- The update is a duplicate of one already logged
- The note contains opinion rather than fact (e.g. "the government has shamefully failed to..." — rewrite as "no action has been taken as of DATE")

---

## Maintainer review process

1. PR is opened → validator runs automatically
2. If validator passes, a maintainer checks the source within 72 hours
3. Maintainer may request clarification or a better source
4. If source is verified, PR is merged
5. Cloudflare Pages deploys the update automatically within 60 seconds

Maintainers do not have the right to reject an update because they politically disagree with its framing. Rejection must be based on sourcing standards only.

---

## Code of conduct

- Be factual. Be specific. Be neutral in tone.
- No harassment of maintainers or other contributors.
- No coordinated submissions to push a political narrative.
- If you believe a maintainer is acting in bad faith, open a public issue with evidence.

This tracker exists to serve the people of Kerala, not any political party.
