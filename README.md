# 🗺️ Keralam Tracker

A zero-cost, community-driven platform tracking the 2026 UDF Manifesto promises with absolute transparency, verifiable data, and automated schema validation. 

No databases, no servers, no complex hosting fees. The entire infrastructure runs on free tiers of GitHub and Cloudflare Pages.

---

## 🏗️ How the System Works

This project is built to run entirely on file changes (GitOps). Here is what each file does:

*   `promises.json` — **The Entire Database.** There is no MySQL, Firebase, or Supabase. This single file holds all the data. Edit this file, and the website reflects the changes instantly.
*   `validate.js` — **The Gatekeeper.** A Node.js script that automatically checks any data updates to ensure no one breaks the website with typos, missing sources, or malformed dates.
*   `.github/workflows/validate.yml` — **The Automation.** Tells GitHub Actions to run `validate.js` every single time a Pull Request (PR) is opened. If the data has errors, it blocks the merge automatically.
*   `CONTRIBUTING.md` — **The Rulebook.** Defines how data is graded, what sources are acceptable, and how non-technical users can help.
*   `.github/ISSUE_TEMPLATE/promise-update.md` — **The Update Form.** A structured form that appears when someone opens a GitHub Issue. This allows non-developers to submit manifesto updates without touching JSON code.

---

## 🤝 Contributing Data

We rely on the community to keep the tracker accurate. 

### For Non-Developers:
If you spot an update, a missing promise, or a status change, you don't need to touch the code. Just go to the **Issues** tab in this repository, click **New Issue**, choose **Promise Update**, and fill out the simple form.

### For Developers:
1. Fork this repository.
2. Make your data edits strictly inside `public/promises.json`.
3. Open a **Pull Request**. 
4. The automated CI/CD pipeline will validate your JSON structure. Once it passes green, a maintainer will review and merge it.

> ⚠️ **Important Reminder:** All data points must trace back verbatim to the official UDF 2026 Manifesto PDF with exact page numbers. No unsourced claims will be accepted.

---

## 📜 License

This project is open-source and available under the **MIT License**. See the `LICENSE` file for details.
