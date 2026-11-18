# Cancer Awareness App — Deployment Notes
## Prototype v0.1.0 · November 2024

> **Status: Private prototype only. Not for public release.**
> All content requires clinical, Tamil language, and institutional review before any public deployment.

---

## What is built

A Progressive Web App (PWA) consisting entirely of static HTML, CSS, and JavaScript files. No server-side code or database is required to run the prototype locally or to deploy it on a static hosting platform.

```
Cancer_Awareness/
├── index.html              Homepage with bilingual nav and urgency route
├── manifest.json           PWA manifest (name, icons, theme colour)
├── sw.js                   Service worker (offline caching)
├── icons/
│   ├── icon.svg            Source SVG icon
│   ├── icon-192.png        PWA icon (192×192)
│   └── icon-512.png        PWA icon (512×512)
├── css/
│   └── style.css           Full design system and bilingual layout
├── js/
│   ├── app.js              Core JS (language switcher, quiz engine, text size)
│   └── rag.js              RAG demo (keyword knowledge base, cited answers)
├── pages/
│   ├── understand.html     Module 1 — What is Cancer? (with quiz)
│   ├── body-map.html       Interactive body map (12 cancer types)
│   ├── symptoms.html       Symptoms and when to act
│   ├── risk.html           Risk reduction (inc. betel/areca nut warning)
│   ├── screening.html      NHS screening programmes (England)
│   ├── ask.html            Ask a question (RAG demo chat UI)
│   └── glossary.html       Searchable bilingual glossary
├── data/
│   └── sources.json        Source register (14 verified public sources)
└── review/
    └── dashboard.html      Editorial review dashboard (internal use)
```

---

## Running locally

No build step is required. Open `index.html` in a web browser.

**Recommended for local development (to enable the service worker):**

```bash
# Python 3
cd Cancer_Awareness
python3 -m http.server 8080
# Then open: http://localhost:8080
```

The service worker requires HTTPS or localhost to register. When opened as a local file (file://) the service worker will not activate, but all other functionality works normally.

---

## Deploying for private review (managed hosting)

The prototype is a static site and can be deployed to any static hosting provider. Recommended options for a private prototype:

### Option 1 — Netlify (easiest)
1. Create a free Netlify account at netlify.com
2. Drag the `Cancer_Awareness/` folder onto the Netlify dashboard
3. Configure a password-protected URL under Site settings → Access control
4. Share the URL and password only with reviewers

### Option 2 — GitHub Pages (private repository)
1. Create a private GitHub repository
2. Push the `Cancer_Awareness/` folder contents to the `main` branch
3. Enable GitHub Pages under Settings → Pages → Source: `main`
4. Access is controlled by repository collaborator settings

### Option 3 — Any web server
Upload the `Cancer_Awareness/` folder to a web server root and ensure:
- HTTPS is configured (required for PWA install and service worker)
- Directory listings are disabled
- Access is restricted by HTTP authentication or IP allow-list

---

## PWA installation

Once hosted on HTTPS, users can install the app to their home screen.

### Android (Chrome)
1. Open the site URL in Chrome on Android
2. Tap the three-dot menu → "Add to Home screen"
3. Confirm installation
4. The app will appear as a standalone app icon

### iPhone (Safari)
1. Open the site URL in Safari on iPhone
2. Tap the Share button (box with arrow at the bottom)
3. Scroll down and tap "Add to Home Screen"
4. Tap "Add" to confirm
5. The app appears on the home screen

**Note:** iOS Safari does not support the full Web App Manifest for splash screens and some PWA features. The app will still work correctly as a home-screen shortcut.

---

## Offline behaviour

The service worker caches the following pages for offline use:
- Homepage (index.html)
- All six content pages (understand, body-map, symptoms, risk, screening, ask)
- Core CSS and JS files
- Sources register (sources.json)

When offline, a yellow banner informs the user that the page may not be current. For medical emergencies, users are directed to call 999.

**The Ask a Question (RAG) page works offline** using the embedded `QA_BANK` knowledge base in `rag.js`. It will not have access to the internet, but the 8 curated question-and-answer pairs remain available.

---

## Estimated costs for a production service

These are order-of-magnitude estimates assuming a small-to-medium UK Tamil community outreach deployment.

| Item | Estimate | Notes |
|------|----------|-------|
| Managed static hosting | £5–£20/month | Netlify Pro, Vercel Pro, or AWS S3+CloudFront |
| Domain name | £10–£20/year | .org.uk or .nhs.uk (NHS domain requires approval) |
| CDN (if separate) | £0–£50/month | Included in most managed hosting tiers |
| LLM API (if upgrading RAG to live model) | £50–£500/month | Depends on query volume; Claude or GPT-4 class |
| Tamil voice recordings | £500–£2,000 one-off | Professional Tamil voice talent, studio time |
| Clinical review | Institutional resource | Prof Anguraj Sadanandam / contracted clinician |
| Tamil language review | £500–£2,000 | Per content iteration |
| Community readability testing | £500–£1,500 | Per round |
| Accessibility audit | £1,000–£3,000 | Formal WCAG 2.2 AA audit and remediation |
| Annual content review | Ongoing | Screening rules, drug approvals, NHS changes |

**The current static prototype has zero ongoing hosting cost** if deployed on a free tier (Netlify/GitHub Pages with private access).

---

## Content update procedure

1. Edit the relevant HTML file in the `pages/` directory
2. Update `data/sources.json` if the source register changes
3. Update the version number in `manifest.json` and `sw.js` CACHE_NAME
4. Update the version history in `review/dashboard.html`
5. Flag affected Tamil content in the review dashboard as requiring re-review
6. Deploy updated files to the hosting provider
7. The service worker will update automatically on the next user visit (network-first strategy)

---

## Content that remains mocked or pending

| Feature | Status |
|---------|--------|
| English audio | UI controls present; audio files not recorded |
| Tamil audio | UI controls present; audio files not recorded |
| Captioned animations | Described in brief; not yet produced |
| Institutional logo | Pending approval from Prof Anguraj Sadanandam |
| Collaborating institution logo (if applicable) | Pending |
| Joint programme name | Deliberately omitted — pending approval |
| Scotland/Wales/NI screening rules | Labelled England only; other nations pending |
| RAG live model (server-side) | Demo is client-side keyword; production upgrade path noted |
| Childhood/young adult content (separate pathway) | Not yet built |
| Additional learning modules (beyond Module 1) | Planned |

---

## Security notes

- No user accounts, passwords, or personal data are collected
- Language preference and text size are stored in `localStorage` only (device-local)
- Health questions in the Ask page are processed client-side only; they are not transmitted to any server in this prototype version
- If a live LLM API is added in production, questions will be transmitted to the model provider; this must be disclosed accurately in a privacy notice
- API keys must remain server-side in any production deployment; never embed them in client-side JS
- Input is sanitised with `escHtml()` in `rag.js` to prevent XSS

---

## Before public release — required sign-offs

- [ ] Clinical accuracy review (all pages) — by an appropriate clinician
- [ ] Tamil bilingual clinical review — by a bilingual clinician
- [ ] Tamil language review — by a Tamil language reviewer
- [ ] Community readability testing — by Tamil-speaking community members
- [ ] Approval from Prof Anguraj Sadanandam
- [ ] Collaborating institution approval (if applicable)
- [ ] Formal WCAG 2.2 AA audit — by an accessibility specialist
- [ ] Privacy notice finalised — accurate data handling disclosure
- [ ] Source reuse permissions confirmed — for CRUK, Macmillan, NICE content
- [ ] Hosting, domain, and content update procedures in place

---

*This document is part of the Cancer Awareness App prototype, developed by Prof Anguraj Sadanandam.*
