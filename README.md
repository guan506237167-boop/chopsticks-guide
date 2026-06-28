# Chopsticks Guide

Static chopsticks guide site for a future custom domain.

## Content update workflow

This site is generated from source files, not edited directly in `dist/`.

- Update page templates, tools, navigation, and SEO layout in `scripts/generate.mjs`.
- Update keyword library inputs in `docs/keyword-library/`.
- Run `npm run build` to regenerate `dist/`.
- Run audits before pushing.

Do not manually edit files inside `dist/`; they are rebuilt every time.

## Commands

```bash
npm run build
npm run audit
npm run dev
```

Cloudflare build settings:

- Build command: `npm run build`
- Build output directory: `dist`
