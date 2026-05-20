#!/usr/bin/env node
/**
 * validate.js
 * Runs on every Pull Request via GitHub Actions.
 * Rejects any PR that breaks the promises.json schema.
 *
 * Run locally: node scripts/validate.js
 */

const fs = require("fs");
const path = require("path");

const VALID_STATUSES = ["pending", "progress", "fulfilled", "evaded"];
const VALID_TIERS = [1, 2, 3];
const VALID_CATEGORIES = [
  "Economy", "Health", "Education", "Infrastructure",
  "Governance", "Labour", "Environment", "Social Justice",
  "Agriculture", "Tourism", "Women & Child", "IT"
];

const SOURCE_TIER_DOCS = `
  Tier 1 = Official government gazette / GO / cabinet order
  Tier 2 = PTI/ANI wire, The Hindu, Indian Express, Mathrubhumi, Malayala Manorama
  Tier 3 = Other credible regional press with a direct URL
`;

let errors = [];
let warnings = [];
let data;

// ── Load file ──────────────────────────────────────────────────────────────
try {
  const raw = fs.readFileSync(
    path.resolve(__dirname, "../data/promises.json"),
    "utf8"
  );
  data = JSON.parse(raw);
} catch (e) {
  console.error("❌ FATAL: Could not parse promises.json — invalid JSON.");
  console.error(e.message);
  process.exit(1);
}

if (!Array.isArray(data)) {
  console.error("❌ FATAL: promises.json must be a JSON array.");
  process.exit(1);
}

// ── Check for duplicate IDs ────────────────────────────────────────────────
const ids = data.map((p) => p.id);
const duplicateIds = ids.filter((id, i) => ids.indexOf(id) !== i);
if (duplicateIds.length) {
  errors.push(`Duplicate promise IDs found: ${duplicateIds.join(", ")}`);
}

const slugs = data.map((p) => p.slug);
const duplicateSlugs = slugs.filter((s, i) => slugs.indexOf(s) !== i);
if (duplicateSlugs.length) {
  errors.push(`Duplicate slugs found: ${duplicateSlugs.join(", ")}`);
}

// ── Validate each promise ──────────────────────────────────────────────────
data.forEach((p, i) => {
  const ref = `Promise #${p.id || i} ("${p.title_en || "NO TITLE"}")`;

  // Required top-level fields
  if (!p.id && p.id !== 0) errors.push(`${ref}: missing "id"`);
  if (!p.slug) errors.push(`${ref}: missing "slug"`);
  if (p.slug && !/^[a-z0-9-]+$/.test(p.slug))
    errors.push(`${ref}: slug must be lowercase kebab-case, got "${p.slug}"`);
  if (!p.title_en) errors.push(`${ref}: missing "title_en"`);
  if (!p.title_ml) warnings.push(`${ref}: missing "title_ml" — Malayalam translation needed`);
  if (!p.verbatim) errors.push(`${ref}: missing "verbatim" — exact manifesto text required`);
  if (!p.manifesto_page) errors.push(`${ref}: missing "manifesto_page" — page number from PDF required`);
  if (!p.category) errors.push(`${ref}: missing "category"`);
  if (p.category && !VALID_CATEGORIES.includes(p.category))
    warnings.push(`${ref}: unknown category "${p.category}" — is this intentional?`);
  if (!p.departments || !p.departments.length)
    errors.push(`${ref}: "departments" must be a non-empty array`);
  if (!p.status) errors.push(`${ref}: missing "status"`);
  if (p.status && !VALID_STATUSES.includes(p.status))
    errors.push(`${ref}: invalid status "${p.status}" — must be one of: ${VALID_STATUSES.join(", ")}`);
  if (!p.timeline_promised) warnings.push(`${ref}: missing "timeline_promised"`);
  if (!Array.isArray(p.updates)) errors.push(`${ref}: "updates" must be an array (use [] if empty)`);

  // Validate each update entry
  if (Array.isArray(p.updates)) {
    p.updates.forEach((u, j) => {
      const uRef = `${ref}, update[${j}]`;

      if (!u.date) errors.push(`${uRef}: missing "date"`);
      if (u.date && !/^\d{4}-\d{2}-\d{2}$/.test(u.date))
        errors.push(`${uRef}: "date" must be YYYY-MM-DD format, got "${u.date}"`);
      if (!u.prev_status) errors.push(`${uRef}: missing "prev_status"`);
      if (!u.new_status) errors.push(`${uRef}: missing "new_status"`);
      if (u.new_status && !VALID_STATUSES.includes(u.new_status))
        errors.push(`${uRef}: invalid "new_status" "${u.new_status}"`);
      if (!u.note_en) errors.push(`${uRef}: missing "note_en"`);
      if (!u.note_ml) warnings.push(`${uRef}: missing "note_ml" — Malayalam note needed`);
      if (!u.source_url) errors.push(`${uRef}: missing "source_url" — every update needs a source`);
      if (u.source_url && !u.source_url.startsWith("https://"))
        errors.push(`${uRef}: "source_url" must start with https://`);
      if (!u.source_label) errors.push(`${uRef}: missing "source_label"`);
      if (!u.source_tier) errors.push(`${uRef}: missing "source_tier"`);
      if (u.source_tier && !VALID_TIERS.includes(u.source_tier))
        errors.push(`${uRef}: invalid source_tier "${u.source_tier}" — must be 1, 2, or 3\n${SOURCE_TIER_DOCS}`);
      if (!u.contributed_by) warnings.push(`${uRef}: missing "contributed_by"`);
    });

    // Check: if status is fulfilled/evaded, there must be at least one update
    if (["fulfilled", "evaded"].includes(p.status) && p.updates.length === 0) {
      errors.push(`${ref}: status is "${p.status}" but "updates" array is empty — source evidence required`);
    }

    // Check: last update's new_status should match top-level status
    if (p.updates.length > 0) {
      const lastUpdate = p.updates[p.updates.length - 1];
      if (lastUpdate.new_status !== p.status) {
        errors.push(
          `${ref}: top-level status "${p.status}" doesn't match last update's new_status "${lastUpdate.new_status}"`
        );
      }
    }
  }
});

// ── Report ─────────────────────────────────────────────────────────────────
console.log(`\nKeralam Tracker — promises.json validation`);
console.log(`${"─".repeat(50)}`);
console.log(`Promises checked: ${data.length}`);

if (warnings.length) {
  console.log(`\n⚠️  Warnings (${warnings.length}) — will not block PR:`);
  warnings.forEach((w) => console.log(`  · ${w}`));
}

if (errors.length) {
  console.log(`\n❌ Errors (${errors.length}) — PR BLOCKED:\n`);
  errors.forEach((e) => console.log(`  ✗ ${e}`));
  console.log(`\nFix the errors above before this PR can be merged.\n`);
  process.exit(1);
} else {
  console.log(`\n✅ All ${data.length} promises valid. PR can be merged.\n`);
  process.exit(0);
}
