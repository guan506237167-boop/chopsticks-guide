# Chopsticks Guide Launch Checklist

Use this checklist before the site goes live on the new domain.

## 1. Local Build

```bash
npm run build
npm run audit
npm run test:tools
```

Required result:

- Build exits with code 0.
- Audit reports no missing internal links.
- Tool tests pass.
- `/admin/seo-report/` shows `Fix = 0`.

## 2. Core Page Tests

Test these pages on desktop and mobile:

| Page | Test |
|---|---|
| `/` | Home loads, tools render, guide cards render |
| `/how-to-use-chopsticks/` | Search works, article layout is narrow and clean |
| `/types-of-chopsticks/` | Comparison content renders correctly |
| `/chopstick-etiquette/` | Etiquette notes and FAQ open correctly |
| `/best-chopsticks-for-beginners/` | Buying guidance and related links work |
| `/guides/` | Search routes to the correct guide |
| `/materials/chopstick-material-compare/` | Material comparison renders cleanly |

## 3. Indexing Checks

- Sitemap exists at `/sitemap.xml`.
- Robots exists at `/robots.txt`.
- `llms.txt` exists at `/llms.txt`.
- Important pages are linked internally:
  - `/`
  - `/guides/`
  - `/how-to-use-chopsticks/`
  - `/types-of-chopsticks/`
  - `/chopstick-etiquette/`
  - `/best-chopsticks-for-beginners/`

## 4. Google Analytics

This site reads Google Analytics from the build environment variable:

```text
GA_MEASUREMENT_ID=G-XXXXXXXXXX
```

Cloudflare Pages setup:

1. Open the Pages project.
2. Go to Settings -> Environment variables.
3. Add `GA_MEASUREMENT_ID`.
4. Redeploy the site.
5. Check GA Realtime after visiting the live site.

## 5. Google Search Console

Before submitting the site:

1. Place the new Google verification HTML file in `public/`.
2. Rebuild and redeploy.
3. Confirm the verification file opens on the live domain.
4. Submit `/sitemap.xml` in GSC.

## 6. Ahrefs

Preferred setup:

1. Add the project in Ahrefs.
2. Verify through GSC import when possible.
3. Confirm domain is the final live domain.
4. Import GSC data for diagnosis.
5. Check Site Audit after the first crawl.

## 7. Security Checks

Before pushing:

```bash
rg -n "api_key|apikey|secret|token|password|stripe|paypal|dataforseo|openai|ahrefs|semrush|GA_MEASUREMENT_ID" .
```

Rules:

- GitHub repository stays private.
- `.env` is never committed.
- API secrets stay in local `.env` or Cloudflare environment variables.
- Frontend only uses public IDs.

## 8. Launch Decision

The site is ready to push when:

- Tools work.
- No internal 404.
- Core layouts are stable.
- GA variable is ready.
- GSC verification file path is ready.
- No secrets are committed.
