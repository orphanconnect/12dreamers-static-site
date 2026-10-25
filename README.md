# 12 Dreamers

A free static learning shelf for children in hard situations, including orphans, children in foster care, and any child who needs a kind place to learn. The words on the page are written to the child: you are loved.

**Live site:** [https://12dreamers.com/](https://12dreamers.com/)

Hosted on **Cloudflare Pages** from the `main` branch of this repo. There is no build step and no framework.

## Deploy

In the Cloudflare Pages project:

- Production branch: `main`
- Build command: leave empty
- Build output directory: `/` (the repository root)

Pushing to `main` publishes the HTML, CSS, JavaScript, and images as they are.

## Privacy

The site has no accounts, cookies, ads, analytics, or third-party scripts. A daily verse and three daily activities are chosen in the browser from files in this repo. If a child taps “I did it!” or picks an age, that note stays in `localStorage` on the device and is never sent anywhere.

## Pages

- `index.html` is the whole shelf: today’s verse, today’s activities, age filters, and the link cards.
- `404.html` is the missing-page message.
- `js/data.js` holds the verse list and the activity pools.
- `js/app.js` picks the day’s verse and activities, filters by age, and saves stars locally.

Bible verses are from the Berean Standard Bible, which is in the public domain. The short note under each verse is a devotional written for a child.

## Link check

`.github/workflows/link-check.yml` runs [lychee](https://github.com/lycheeverse/lychee) on the first day of each month, and when someone starts it by hand. If a link does not return success, the workflow opens an issue titled “Broken links on 12 Dreamers”, or comments on the open issue with that title.

Same-site URLs such as `https://12dreamers.com/og.png` are remapped to the files in the repo so the check does not depend on the live deploy. Root-relative links such as `/css/styles.css` on the missing-page file are checked from the repo root. `tel:` links are skipped.

LearnEnglish Kids (`https://learnenglishkids.britishcouncil.org/`) stays on the page. On 2026-10-25 the public site loaded as the British Council children’s homepage, but Akamai answered this checker with 403 Access Denied, so that one URL is listed in `.lycheeignore` to avoid a false broken-link alarm.
