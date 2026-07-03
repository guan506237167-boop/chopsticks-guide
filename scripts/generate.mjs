import { mkdir, readdir, readFile, rm, writeFile, copyFile } from "node:fs/promises";
import { dirname, join } from "node:path";

const SITE = {
  name: "Chopsticks Guide",
  url: "https://www.chopsticksguide.com",
  description: "Learn how to use chopsticks, compare chopstick materials, understand etiquette, and find quick answers with practical guides and tools.",
  assetVersion: "20260628-commerce-03"
};

const GA_MEASUREMENT_ID = process.env.GA_MEASUREMENT_ID || "G-3QWR0HFBYC";

const keywordRows = parseCsv(await readFile("docs/keyword-library/chopsticks-keyword-library.csv", "utf8"));
const tutorialKeywords = keywordRows.filter((row) => row.category === "tutorial").slice(0, 24);
const productKeywords = keywordRows.filter((row) => row.category === "types-products").slice(0, 18);
const etiquetteKeywords = keywordRows.filter((row) => row.category === "culture-etiquette").slice(0, 12);

const chopstickTypes = [
  {
    slug: "bamboo-chopsticks",
    name: "Bamboo Chopsticks",
    summary: "Lightweight, affordable, and common for daily use.",
    texture: "Light grip and natural feel",
    bestFor: "Beginners, casual home meals, and low-cost sets",
    pros: ["Light and easy to control", "Affordable and common", "Warm surface feel"],
    cautions: ["Can wear faster than metal", "Needs proper drying after washing"]
  },
  {
    slug: "wooden-chopsticks",
    name: "Wooden Chopsticks",
    summary: "Balanced and comfortable with a slightly warmer hand feel.",
    texture: "Natural grip with moderate weight",
    bestFor: "Home use, beginners, and people who want more grip than metal",
    pros: ["Comfortable to hold", "Usually easier to grip food", "Wide design range"],
    cautions: ["Can absorb moisture", "Needs better maintenance than metal"]
  },
  {
    slug: "metal-chopsticks",
    name: "Metal Chopsticks",
    summary: "Durable, reusable, and common in Korean-style sets.",
    texture: "Smooth surface and heavier feel",
    bestFor: "Reusable daily sets, durability-focused buyers, and Korean table settings",
    pros: ["Long-lasting", "Easy to sanitize", "Often sold in durable sets"],
    cautions: ["Slipperier for beginners", "Can feel harder with smooth foods"]
  },
  {
    slug: "fiberglass-chopsticks",
    name: "Fiberglass Chopsticks",
    summary: "A practical reusable option with a more stable grip than polished metal.",
    texture: "Medium weight with firmer control",
    bestFor: "Frequent home use and buyers comparing durable reusable options",
    pros: ["More durable than wood", "Often dishwasher safe", "Usually less slippery than steel"],
    cautions: ["Quality varies by brand", "Cheaper sets can feel plasticky"]
  },
  {
    slug: "training-chopsticks",
    name: "Training Chopsticks",
    summary: "Designed to help beginners and children learn finger placement.",
    texture: "Assisted control with training loops or bridges",
    bestFor: "Kids, beginners, and left-hand learning support",
    pros: ["Reduces early frustration", "Helps build muscle memory", "Useful for guided learning"],
    cautions: ["Not ideal for long-term final technique", "Some models are too child-specific"]
  }
];

const guides = [
  {
    title: "How to Use Chopsticks",
    path: "/how-to-use-chopsticks/",
    category: "Beginner Guides",
    description: "Step-by-step chopsticks basics with finger placement, movement, and common mistakes."
  },
  {
    title: "How to Hold Chopsticks Correctly",
    path: "/guides/how-to-hold-chopsticks/",
    category: "Beginner Guides",
    description: "A detailed finger-placement guide for holding chopsticks with more control."
  },
  {
    title: "How to Eat Rice with Chopsticks",
    path: "/guides/how-to-eat-rice-with-chopsticks/",
    category: "Beginner Guides",
    description: "Practical advice for handling rice, noodles, ramen, and slippery food."
  },
  {
    title: "Chopstick Etiquette Rules",
    path: "/chopstick-etiquette/",
    category: "Etiquette Guides",
    description: "Cultural etiquette basics, what to avoid, and how to place chopsticks on the table."
  },
  {
    title: "Types of Chopsticks",
    path: "/types-of-chopsticks/",
    category: "Buying Guides",
    description: "Compare bamboo, wood, metal, fiberglass, training, and cooking chopsticks."
  },
  {
    title: "Bamboo vs Wooden vs Metal Chopsticks",
    path: "/guides/bamboo-vs-wooden-vs-metal-chopsticks/",
    category: "Buying Guides",
    description: "A practical comparison for grip, comfort, cleaning, and beginner friendliness."
  },
  {
    title: "Best Chopsticks for Beginners",
    path: "/best-chopsticks-for-beginners/",
    category: "Buying Guides",
    description: "What beginners should look for in size, grip, material, and training support."
  },
  {
    title: "Chinese vs Japanese vs Korean Chopsticks",
    path: "/guides/chinese-vs-japanese-vs-korean-chopsticks/",
    category: "Culture Guides",
    description: "How length, shape, and table use differ across common East Asian styles."
  },
  {
    title: "Training Chopsticks for Kids",
    path: "/guides/training-chopsticks-for-kids/",
    category: "Kids Guides",
    description: "How to teach kids and beginners with assisted chopsticks and step practice."
  },
  {
    title: "Chopstick Rest and Holder Guide",
    path: "/guides/chopstick-rest-guide/",
    category: "Accessories Guides",
    description: "What chopstick rests and holders do, how to place them, and what to buy."
  },
  {
    title: "How to Use Chopsticks for Beginners",
    path: "/guides/how-to-use-chopsticks-for-beginners/",
    category: "Beginner Guides",
    description: "A slower beginner guide for first-time chopstick users, hand position, practice food, and mistakes."
  },
  {
    title: "How to Eat Noodles with Chopsticks",
    path: "/guides/how-to-eat-noodles-with-chopsticks/",
    category: "Beginner Guides",
    description: "Practical noodle control tips for ramen, lo mein, long noodles, slippery foods, and beginner practice."
  },
  {
    title: "Stainless Steel Chopsticks",
    path: "/guides/stainless-steel-chopsticks/",
    category: "Buying Guides",
    description: "A buying guide for stainless steel chopsticks, grip, cleaning, durability, and beginner tradeoffs."
  },
  {
    title: "Wooden Chopsticks",
    path: "/guides/wooden-chopsticks/",
    category: "Buying Guides",
    description: "A practical guide to wooden chopsticks for daily meals, gifts, grip, care, and material choice."
  },
  {
    title: "Gold Chopsticks",
    path: "/guides/gold-chopsticks/",
    category: "Gift Guides",
    description: "A buying and symbolism guide for gold chopsticks, gift sets, finishes, care, and practical tradeoffs."
  },
  {
    title: "Disposable vs Reusable Chopsticks",
    path: "/guides/disposable-vs-reusable-chopsticks/",
    category: "Buying Guides",
    description: "Compare disposable, bamboo, wooden, metal, and fiberglass chopsticks for home use, events, and takeout."
  },
  {
    title: "Chinese Chopsticks",
    path: "/guides/chinese-chopsticks/",
    category: "Culture Guides",
    description: "A practical guide to Chinese chopsticks, including shape, length, materials, table use, etiquette, and buying notes."
  },
  {
    title: "Chopsticks Set",
    path: "/guides/chopsticks-set/",
    category: "Buying Guides",
    description: "A buying guide to chopsticks sets, including pair count, materials, rests, gift boxes, care, and table use."
  }
];

const productCategories = [
  {
    title: "Bamboo Chopsticks",
    tag: "Natural daily use",
    text: "Light, warm, affordable, and usually easier for beginners because the surface has more grip.",
    path: "/materials/bamboo-chopsticks/",
    tone: "bamboo",
    image: "/assets/generated/category-bamboo-chopsticks.webp"
  },
  {
    title: "Wooden Chopsticks",
    tag: "Balanced home sets",
    text: "A stronger gift and home-use category with warmer texture, better grip, and many finish styles.",
    path: "/materials/wooden-chopsticks/",
    tone: "wood",
    image: "/assets/generated/category-wooden-chopsticks.webp"
  },
  {
    title: "Metal Chopsticks",
    tag: "Durable Korean style",
    text: "Long-lasting and easy to clean, but smoother and less beginner-friendly than bamboo or wood.",
    path: "/materials/metal-chopsticks/",
    tone: "metal",
    image: "/assets/generated/category-metal-chopsticks.webp"
  },
  {
    title: "Training Chopsticks",
    tag: "Kids and beginners",
    text: "Assisted chopsticks for children or adults who need help learning finger placement.",
    path: "/guides/training-chopsticks-for-kids/",
    tone: "training",
    image: "/assets/generated/category-training-chopsticks.webp"
  },
  {
    title: "Chopstick Rests",
    tag: "Table accessories",
    text: "Small table pieces that make meals cleaner, more formal, and easier to style as gift sets.",
    path: "/guides/chopstick-rest-guide/",
    tone: "rest",
    image: "/assets/generated/category-chopstick-rests.webp"
  },
  {
    title: "Gift Sets",
    tag: "Culture and gifting",
    text: "Decorative boxed sets, regional styles, and dining gifts for people who want something presentable.",
    path: "/types-of-chopsticks/",
    tone: "gift",
    image: "/assets/generated/category-gift-sets.webp"
  }
];

const bestPickCards = [
  {
    title: "Beginner Grip Set",
    text: "Textured bamboo or wooden pairs with moderate length and stable control.",
    path: "/best-chopsticks-for-beginners/",
    label: "View picks",
    meta: "Learning"
  },
  {
    title: "Daily Reusable Set",
    text: "Durable wood or fiberglass sets that balance grip, cleaning, and comfort.",
    path: "/materials/chopstick-material-compare/",
    label: "Compare",
    meta: "Home dining"
  },
  {
    title: "Kids Training Set",
    text: "Training chopsticks and smaller practice sets for guided learning.",
    path: "/guides/training-chopsticks-for-kids/",
    label: "Kids guide",
    meta: "Children"
  },
  {
    title: "Formal Table Set",
    text: "Chopsticks plus rests or holders for cleaner formal dining and gifting.",
    path: "/guides/chopstick-rest-guide/",
    label: "Accessory guide",
    meta: "Gift table"
  }
];

const pages = [];

await rm("dist", { recursive: true, force: true });
await mkdir("dist/assets", { recursive: true });
await copyDir("public/assets", "dist/assets");
await copyFile("public/_headers", "dist/_headers");
for (const file of await readdir("public")) {
  if (file.endsWith(".html")) {
    await copyFile(join("public", file), join("dist", file));
  }
}

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

async function copyDir(from, to) {
  await mkdir(to, { recursive: true });
  const entries = await readdir(from, { withFileTypes: true });
  for (const entry of entries) {
    const source = join(from, entry.name);
    const target = join(to, entry.name);
    if (entry.isDirectory()) {
      await copyDir(source, target);
    } else if (!(from.replaceAll("\\", "/").endsWith("/generated") && entry.name.endsWith(".png"))) {
      await copyFile(source, target);
    }
  }
}

function absolute(path) {
  return `${SITE.url}${path === "/" ? "" : path}`;
}

function slugify(value) {
  return String(value || "")
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function parseCsv(text) {
  const rows = [];
  let row = [];
  let cell = "";
  let quoted = false;
  for (let index = 0; index < text.length; index += 1) {
    const char = text[index];
    const next = text[index + 1];
    if (quoted) {
      if (char === '"' && next === '"') {
        cell += '"';
        index += 1;
      } else if (char === '"') {
        quoted = false;
      } else {
        cell += char;
      }
      continue;
    }
    if (char === '"') {
      quoted = true;
    } else if (char === ",") {
      row.push(cell);
      cell = "";
    } else if (char === "\n") {
      row.push(cell.replace(/\r$/, ""));
      rows.push(row);
      row = [];
      cell = "";
    } else {
      cell += char;
    }
  }
  if (cell || row.length) {
    row.push(cell.replace(/\r$/, ""));
    rows.push(row);
  }
  const headers = rows.shift()?.map((value) => value.replace(/^\uFEFF/, "").trim()) || [];
  return rows
    .filter((current) => current.some((value) => String(value || "").trim()))
    .map((current) => Object.fromEntries(headers.map((header, idx) => [header, current[idx] ?? ""])));
}

function jsonLd(data) {
  return `<script type="application/ld+json">${JSON.stringify(data)}</script>`;
}

function breadcrumbSchema(items) {
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: absolute(item.url)
    }))
  });
}

function faqSchema(faqs) {
  return jsonLd({
    "@context": "https://schema.org",
    "@type": "FAQPage",
    mainEntity: faqs.map((faq) => ({
      "@type": "Question",
      name: faq.q,
      acceptedAnswer: {
        "@type": "Answer",
        text: faq.a
      }
    }))
  });
}

function analyticsSnippet() {
  if (!GA_MEASUREMENT_ID) return "";
  const id = escapeHtml(GA_MEASUREMENT_ID);
  return `<script async src="https://www.googletagmanager.com/gtag/js?id=${id}"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());
    gtag('config', '${id}');
  </script>`;
}

function pageClass(path) {
  if (path === "/") return "page-home";
  return `page-${path.replace(/^\/|\/$/g, "").replace(/[^a-z0-9]+/gi, "-").toLowerCase()}`;
}

function pageLayout({ title, description, path, h1, intro, body, faqs = [], pageType = "WebPage", extraSchema = "", articleSidebar = false, heroLabel = "Chopsticks culture tool" }) {
  const canonical = absolute(path);
  const schema = [
    jsonLd({
      "@context": "https://schema.org",
      "@type": pageType,
      name: title,
      description,
      url: canonical,
      inLanguage: "en"
    }),
    breadcrumbSchema([
      { name: "Home", url: "/" },
      { name: h1, url: path }
    ]),
    faqs.length ? faqSchema(faqs) : "",
    extraSchema
  ].join("\n");

  pages.push({ path, title, description, h1, faqs: faqs.length });

  return `<!doctype html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>${escapeHtml(title)}</title>
  <meta name="description" content="${escapeHtml(description)}">
  <link rel="canonical" href="${canonical}">
  <meta property="og:title" content="${escapeHtml(title)}">
  <meta property="og:description" content="${escapeHtml(description)}">
  <meta property="og:type" content="website">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${SITE.url}/assets/chopsticks-hero.svg">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="stylesheet" href="/styles.css?v=${SITE.assetVersion}">
  ${analyticsSnippet()}
  ${schema}
</head>
<body class="${pageClass(path)}">
  <header class="site-header">
    <a class="brand" href="/" aria-label="${SITE.name} home"><img class="brand-logo" src="/assets/logo.svg" alt="${SITE.name} logo">${SITE.name}</a>
    <nav class="nav" aria-label="Main navigation">
      <a href="/">Home</a>
      <a href="/best-chopsticks-for-beginners/">Best Picks</a>
      <a href="/types-of-chopsticks/">Product Types</a>
      <a href="/materials/chopstick-material-compare/">Materials</a>
      <a href="/how-to-use-chopsticks/">Learn</a>
      <a href="/chopstick-etiquette/">Etiquette</a>
      <a href="/guides/">Guides</a>
    </nav>
  </header>
  <main>
    <section class="page-hero">
      <div>
        <p class="eyebrow">${heroLabel}</p>
        <h1>${h1}</h1>
        <p class="intro">${intro}</p>
      </div>
    </section>
    ${articleSidebar ? articleLayout(body) : body}
  </main>
  <footer class="site-footer">
    <div class="footer-about">
      <strong>${SITE.name}</strong>
      <p>This site explains chopstick use, materials, etiquette, and cultural context for educational reference. It does not provide medical, nutritional, or product safety guarantees.</p>
    </div>
    <nav class="footer-nav" aria-label="Footer navigation">
      <div>
        <span>Learn</span>
        <a href="/how-to-use-chopsticks/">How to use chopsticks</a>
        <a href="/chopstick-etiquette/">Chopstick etiquette</a>
        <a href="/guides/">Guides</a>
      </div>
      <div>
        <span>Compare</span>
        <a href="/types-of-chopsticks/">Types of chopsticks</a>
        <a href="/materials/chopstick-material-compare/">Material comparison</a>
        <a href="/best-chopsticks-for-beginners/">Beginner picks</a>
      </div>
      <div>
        <span>Site</span>
        <a href="/about/">About</a>
        <a href="/contact/">Contact</a>
        <a href="/chopsticks-faq/">FAQ</a>
        <a href="/privacy/">Privacy</a>
        <a href="/terms/">Terms</a>
      </div>
    </nav>
  </footer>
  <script src="/toolkit.js?v=${SITE.assetVersion}" defer></script>
</body>
</html>`;
}

function articleLayout(body) {
  return `<div class="article-shell">
    <div class="article-main">${body}</div>
    ${articleSidebarBlock()}
  </div>`;
}

function articleSidebarBlock() {
  const items = [
    { title: "How to Use Chopsticks", path: "/how-to-use-chopsticks/", description: "The shortest path for first-time learners." },
    { title: "Types of Chopsticks", path: "/types-of-chopsticks/", description: "Compare materials, length, and grip." },
    { title: "Chopstick Etiquette", path: "/chopstick-etiquette/", description: "Cultural do and do not basics." },
    { title: "Best Chopsticks for Beginners", path: "/best-chopsticks-for-beginners/", description: "What to choose when learning." }
  ];
  return `<aside class="article-sidebar" aria-label="Related guides">
    <section class="sidebar-card">
      <p class="eyebrow">Popular Guides</p>
      <h2>Continue reading</h2>
      <div class="sidebar-link-list">${items.map((item) => `<a href="${item.path}">
        <strong>${escapeHtml(item.title)}</strong>
        <span>${escapeHtml(item.description)}</span>
      </a>`).join("")}</div>
    </section>
    <section class="sidebar-card compact">
      <p class="eyebrow">Quick Tools</p>
      <a class="button-link" href="/how-to-use-chopsticks/">Start learning</a>
      <a class="button-link secondary" href="/types-of-chopsticks/">Compare types</a>
    </section>
  </aside>`;
}

function faqBlock(faqs) {
  const grouped = [
    { title: "Basics", hint: "Beginner questions", items: faqs.slice(0, 2) },
    { title: "Use cases", hint: "Eating and grip", items: faqs.slice(2, 4) },
    { title: "Materials", hint: "Buying and care", items: faqs.slice(4) }
  ].filter((group) => group.items.length);
  return `<section class="content-section faq-list">
    <div class="section-heading">
      <p class="eyebrow">FAQ</p>
      <h2>Common chopsticks questions</h2>
    </div>
    <div class="faq-categories">${grouped.map((group) => `<details class="faq-category"${group.title === "Basics" ? " open" : ""}>
      <summary><span>${escapeHtml(group.title)}</span><small>${escapeHtml(group.hint)}</small></summary>
      <div class="faq-grid">${group.items.map((item) => `<div class="faq-item"><h3>${escapeHtml(item.q)}</h3><p>${escapeHtml(item.a)}</p></div>`).join("")}</div>
    </details>`).join("")}</div>
  </section>`;
}

function articleSearchBlock() {
  return `<section class="content-section article-search">
    <div>
      <p class="eyebrow">Site Search</p>
      <h2>Search chopsticks topics</h2>
    </div>
    <form class="site-search-form" data-site-search>
      <label>Search the site
        <input type="text" name="q" placeholder="how to hold chopsticks, bamboo, etiquette" required>
      </label>
      <button type="submit">Search</button>
    </form>
  </section>`;
}

function guideCard(guide) {
  return `<a class="guide-card" href="${guide.path}" data-guide-card data-guide-category="${slugify(guide.category)}">
    <span>${escapeHtml(guide.category)}</span>
    <strong>${escapeHtml(guide.title)}</strong>
    <p>${escapeHtml(guide.description)}</p>
  </a>`;
}

function guideFilterBlock() {
  const categories = [...new Set(guides.map((guide) => guide.category))];
  const buttons = [
    `<button type="button" class="is-active" data-guide-filter="all">All</button>`,
    ...categories.map((category) => `<button type="button" data-guide-filter="${slugify(category)}">${escapeHtml(category.replace(" Guides", ""))}</button>`)
  ].join("");
  return `<nav class="guide-filter-nav" aria-label="Filter guides by category">${buttons}</nav>`;
}

function latestGuidesBlock(items = guides.slice(0, 6)) {
  return `<section class="content-section latest-guides">
    <div class="section-heading">
      <p class="eyebrow">Latest Guides</p>
      <h2>Start with these chopsticks topics</h2>
    </div>
    <div class="guide-grid">${items.map(guideCard).join("")}</div>
    <div class="section-action"><a class="button-link secondary" href="/guides/">Browse all guides</a></div>
  </section>`;
}

function relatedGuidesBlock(title, items) {
  return `<section class="content-section related-guides">
    <div class="section-heading">
      <p class="eyebrow">Related Guides</p>
      <h2>${escapeHtml(title)}</h2>
    </div>
    <div class="guide-grid compact">${items.map(guideCard).join("")}</div>
  </section>`;
}

function articleFigure({ src, alt, title, text }) {
  return `<figure class="content-section article-figure">
    <img src="${src}" alt="${escapeHtml(alt)}" loading="lazy">
    <figcaption>
      <strong>${escapeHtml(title)}</strong>
      <span>${escapeHtml(text)}</span>
    </figcaption>
  </figure>`;
}

function adSlot(position) {
  return `<aside class="ad-slot" data-ad-position="${position}" aria-label="Advertisement area">Advertisement</aside>`;
}

function keywordTable(rows, title, eyebrow = "Keyword Cluster") {
  return `<section class="content-section">
    <div class="section-heading">
      <p class="eyebrow">${eyebrow}</p>
      <h2>${escapeHtml(title)}</h2>
    </div>
    <div class="table-wrap"><table>
      <thead><tr><th>Keyword</th><th>Volume</th><th>Intent</th><th>Page type</th></tr></thead>
      <tbody>${rows.map((row) => `<tr><td>${escapeHtml(row.keyword)}</td><td>${escapeHtml(row.search_volume)}</td><td>${escapeHtml(row.intent)}</td><td>${escapeHtml(row.recommended_asset)}</td></tr>`).join("")}</tbody>
    </table></div>
  </section>`;
}

function materialCard(item) {
  return `<a class="animal-card type-card" href="/materials/${item.slug}/">
    <span class="animal-seal type-seal">${escapeHtml(item.name.slice(0, 1))}</span>
    <span class="animal-order">${escapeHtml(item.bestFor.split(",")[0])}</span>
    <strong>${escapeHtml(item.name)}</strong>
    <span>${escapeHtml(item.texture)}</span>
    <p>${escapeHtml(item.summary)}</p>
  </a>`;
}

function productCategoryCard(item) {
  return `<a class="product-category-card tone-${item.tone}" href="${item.path}">
    <img src="${item.image}" alt="${escapeHtml(item.title)} category image" loading="lazy">
    <span>${escapeHtml(item.tag)}</span>
    <strong>${escapeHtml(item.title)}</strong>
    <p>${escapeHtml(item.text)}</p>
    <em>View guide</em>
  </a>`;
}

function bestPickCard(item, index) {
  return `<article class="best-pick-card">
    <span class="pick-rank">0${index + 1}</span>
    <div>
      <span class="product-meta">${escapeHtml(item.meta)}</span>
      <strong>${escapeHtml(item.title)}</strong>
      <p>${escapeHtml(item.text)}</p>
      <small>Affiliate product slot</small>
    </div>
    <a class="button-link secondary" href="${item.path}">${escapeHtml(item.label)}</a>
  </article>`;
}

function comparisonTable(items) {
  return `<div class="table-wrap"><table>
    <thead><tr><th>Type</th><th>Grip</th><th>Weight</th><th>Best for</th><th>Main caution</th></tr></thead>
    <tbody>${items.map((item) => `<tr><td><a href="/materials/${item.slug}/">${escapeHtml(item.name)}</a></td><td>${escapeHtml(item.texture)}</td><td>${escapeHtml(item.summary)}</td><td>${escapeHtml(item.bestFor)}</td><td>${escapeHtml(item.cautions[0])}</td></tr>`).join("")}</tbody>
  </table></div>`;
}

function standardFaqs() {
  return [
    {
      q: "How do beginners learn chopsticks faster?",
      a: "Start with stable foods, check finger placement first, and use shorter practice sessions instead of forcing long meals."
    },
    {
      q: "Are bamboo or wooden chopsticks better for beginners?",
      a: "Usually yes. Bamboo and wooden chopsticks often offer more grip and less slipping than smooth metal sets."
    },
    {
      q: "Why do chopsticks feel difficult at first?",
      a: "The challenge is finger control, not strength. Most beginners improve after learning which stick stays still and which stick moves."
    },
    {
      q: "Can left-handed users learn chopsticks the same way?",
      a: "Yes. The same mechanics still work, but some learners benefit from slower step practice or training chopsticks at the start."
    },
    {
      q: "Are chopstick etiquette rules the same everywhere?",
      a: "No. There are shared patterns, but exact table habits vary by country, family setting, and restaurant style."
    },
    {
      q: "Which chopsticks are easiest to clean?",
      a: "Metal and many fiberglass chopsticks are easiest to sanitize, while wood and bamboo need better drying and care."
    }
  ];
}

async function writePage(path, html) {
  const file = path === "/" ? join("dist", "index.html") : join("dist", path, "index.html");
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html, "utf8");
}

await writePage("/", pageLayout({
  title: "Chopsticks Guide: Learn, Compare, and Choose Better Chopsticks",
  description: "Compare bamboo, wooden, metal, training, and gift chopsticks, then learn how to use chopsticks with practical guides and buying advice.",
  path: "/",
  h1: "Chopsticks Guide",
  intro: "Learn to use chopsticks, compare bamboo, wood, metal, and gift sets, and choose the right pair for daily meals or cultural table settings.",
  extraSchema: jsonLd({
    "@context": "https://schema.org",
    "@type": "CollectionPage",
    name: "Chopsticks Guide",
    url: absolute("/"),
    description: "A product-oriented chopsticks guide for learning, material comparison, beginner picks, accessories, and gift-style buying support."
  }),
  body: `
    <section class="commerce-hero">
      <div class="commerce-copy">
        <p class="eyebrow">Chopsticks Buying Guide</p>
        <h2>Find the Right Chopsticks for Every Meal and Occasion</h2>
        <p>Compare materials, grip comfort, and table styles before choosing a pair.</p>
        <div class="hero-product-links">
          <a class="button-link" href="/best-chopsticks-for-beginners/">Shop beginner picks</a>
          <a class="button-link secondary" href="/types-of-chopsticks/">Browse product types</a>
        </div>
        <div class="commerce-signals" aria-label="Buying guide highlights">
          <span>Material first</span>
          <span>Beginner friendly</span>
          <span>Gift ready</span>
        </div>
      </div>
      <div class="commerce-showcase" aria-label="Featured chopstick product styles">
        <img class="commerce-hero-image" src="/assets/generated/chopsticks-hero-atmosphere.webp" alt="Bamboo chopsticks and porcelain bowl on a refined tea table">
        <div class="commerce-product-note bamboo-note">
          <strong>Bamboo</strong>
          <span>Light grip for daily meals</span>
        </div>
        <div class="commerce-product-note wood-note">
          <strong>Wood</strong>
          <span>Warmer finish for gifts</span>
        </div>
        <div class="commerce-product-note rest-note">
          <strong>Rest Sets</strong>
          <span>Cleaner formal table layout</span>
        </div>
      </div>
    </section>

    <section class="brand-proof-strip" aria-label="Site strengths">
      <div><strong>Material-led</strong><span>Grip, weight, finish, care</span></div>
      <div><strong>Product-ready</strong><span>Affiliate and direct-sale slots</span></div>
      <div><strong>Culture-aware</strong><span>Dining, gifting, etiquette</span></div>
      <div><strong>Beginner-safe</strong><span>Practical learning support</span></div>
    </section>

    <section class="commerce-section product-categories" aria-label="Product categories">
      <div class="commerce-section-head">
        <p class="eyebrow">Product Categories</p>
        <h2>Shop by material, scene, and gift purpose</h2>
        <p>Turn each category into an affiliate collection later: bamboo, wood, metal, training pairs, rests, and gift sets.</p>
      </div>
      <div class="product-category-grid">${productCategories.map(productCategoryCard).join("")}</div>
    </section>

    <section class="commerce-section featured-products">
      <div class="commerce-section-head">
        <p class="eyebrow">Featured Picks</p>
        <h2>Featured product positions</h2>
        <p>These are product slots first, guide links second. Real affiliate products can replace the placeholders when available.</p>
      </div>
      <div class="best-pick-grid">${bestPickCards.map(bestPickCard).join("")}</div>
    </section>

    <section class="commerce-section scenario-band">
      <div>
        <p class="eyebrow">How People Buy</p>
        <h2>Match the pair to the table scene</h2>
      </div>
      <div class="scenario-grid">
        <a href="/best-chopsticks-for-beginners/"><span>01</span><strong>First pair</strong><small>Grip, length, and easy control</small></a>
        <a href="/materials/bamboo-chopsticks/"><span>02</span><strong>Daily meals</strong><small>Bamboo and wood for home use</small></a>
        <a href="/guides/chopstick-rest-guide/"><span>03</span><strong>Formal dining</strong><small>Rests, holders, and table placement</small></a>
        <a href="/types-of-chopsticks/"><span>04</span><strong>Gift sets</strong><small>Finish, box style, and cultural look</small></a>
      </div>
    </section>

    <section class="commerce-section tutorial-showcase">
      <div class="commerce-section-head">
        <p class="eyebrow">Learning Path</p>
        <h2>Help visitors use the product after they buy it</h2>
        <p>Product pages need support content, but the content should serve the buying and ownership journey instead of turning the homepage into a blog archive.</p>
      </div>
      <div class="tutorial-grid">
        <a href="/how-to-use-chopsticks/"><img src="/assets/generated/guide-how-to-use-chopsticks.webp" alt="Chopsticks learning practice setup" loading="lazy"><span>01</span><strong>Learn the grip</strong><small>Finger placement, movement, and first practice foods</small></a>
        <a href="/guides/how-to-eat-rice-with-chopsticks/"><img src="/assets/generated/guide-material-comparison.webp" alt="Different chopstick materials arranged for comparison" loading="lazy"><span>02</span><strong>Handle real foods</strong><small>Rice, noodles, ramen, and slippery pieces</small></a>
        <a href="/chopstick-etiquette/"><img src="/assets/generated/guide-chopstick-etiquette.webp" alt="Formal table setting with chopsticks on a rest" loading="lazy"><span>03</span><strong>Use them correctly</strong><small>Table manners, placement, and cultural mistakes to avoid</small></a>
      </div>
    </section>

    <section class="commerce-cta">
      <div>
        <p class="eyebrow">Quick Advisor</p>
        <h2>Need help choosing the first pair?</h2>
        <p>Use the advisor when a visitor is not ready to browse products yet. It stays below the commercial blocks so the homepage remains product-led.</p>
      </div>
      <form class="calculator-form match-form" data-starter-form>
        <label>Goal
          <select name="goal">
            <option value="first-time">I am using chopsticks for the first time</option>
            <option value="hold-better">I can use them, but my grip feels unstable</option>
            <option value="eat-rice">I struggle with rice or noodles</option>
            <option value="buy-set">I need to choose a beginner-friendly set</option>
          </select>
        </label>
        <label>Hand
          <select name="hand">
            <option value="right">Right handed</option>
            <option value="left">Left handed</option>
          </select>
        </label>
        <button type="submit">Get recommendation</button>
        <div class="result-card" data-starter-result hidden></div>
      </form>
    </section>

    ${adSlot("mid-home")}
  `
}));

await writePage("/guides/", pageLayout({
  title: "Chopsticks Guides: Beginner Steps, Etiquette, and Materials",
  description: "Browse all chopsticks guides covering how to use chopsticks, etiquette, materials, beginner picks, and cultural differences.",
  path: "/guides/",
  h1: "Chopsticks Guides",
  intro: "Browse beginner, etiquette, buying, material, and culture guides for chopsticks use.",
  body: `
    ${articleSearchBlock()}
    <section class="content-section latest-guides">
      <div class="section-heading">
        <p class="eyebrow">Guide Library</p>
        <h2>Browse all chopsticks guides</h2>
      </div>
      ${guideFilterBlock()}
      <div class="guide-grid">${guides.map(guideCard).join("")}</div>
    </section>
    ${keywordTable(productKeywords.slice(0, 10), "Buying and material keyword cluster", "Buying Intent")}
    <section class="content-section guide-next">
      <div>
        <p class="eyebrow">Best first step</p>
        <h2>New to chopsticks?</h2>
        <p>Start with grip, then compare materials, then read etiquette. That order solves the biggest beginner friction first.</p>
      </div>
      <a class="button-link" href="/how-to-use-chopsticks/">Start with the how-to guide</a>
    </section>
  `
}));

await writePage("/how-to-use-chopsticks/", pageLayout({
  title: "How to Use Chopsticks: Beginner Steps, Grip, and Common Mistakes",
  description: "Learn how to use chopsticks with simple finger placement, movement steps, beginner mistakes, and practical food examples.",
  path: "/how-to-use-chopsticks/",
  h1: "How to Use Chopsticks",
  intro: "The fastest way to learn chopsticks is to understand which stick stays still, which stick moves, and how to practice with stable foods first.",
  faqs: [
    { q: "What is the easiest way to learn chopsticks?", a: "Learn the grip first, practice with larger food pieces, and focus on moving only the top stick." },
    { q: "Why are chopsticks hard at first?", a: "Most beginners move both sticks at once. The lower stick should stay mostly still while the upper stick does the work." },
    { q: "Can adults still learn chopsticks easily?", a: "Yes. Adults usually improve quickly once the finger placement is correct and the first few foods are easy to grip." },
    { q: "What foods should I practice with first?", a: "Start with larger, stable foods such as vegetables, tofu cubes, or thicker noodles before moving to loose rice." },
    { q: "Should beginners use training chopsticks?", a: "They can help early muscle memory, especially for kids or frustrated beginners, but they should support, not replace, normal practice." },
    { q: "Are metal chopsticks harder for beginners?", a: "Usually yes. Smooth metal sets can feel more slippery than bamboo, wood, or textured fiberglass." }
  ],
  articleSidebar: true,
  body: `
    ${articleSearchBlock()}
    <section class="tool-page">
      <section class="tool-panel">
        <div class="tool-copy">
          <p class="eyebrow">Beginner Tool</p>
          <h2>Find your first practice path</h2>
          <p>Use the quick recommender if you are not sure whether to start with grip, food control, or material selection.</p>
        </div>
        <form class="calculator-form match-form" data-starter-form>
          <label>Goal
            <select name="goal">
              <option value="first-time">First-time use</option>
              <option value="hold-better">Improve my grip</option>
              <option value="eat-rice">Eat rice or noodles better</option>
              <option value="buy-set">Choose a beginner set</option>
            </select>
          </label>
          <label>Hand
            <select name="hand">
              <option value="right">Right handed</option>
              <option value="left">Left handed</option>
            </select>
          </label>
          <button type="submit">Show path</button>
        </form>
        <div class="result-card" data-starter-result hidden></div>
      </section>
    </section>
    <section class="content-section article-body">
      <p class="lead-answer">The core rule is simple: keep the lower chopstick steady and move the upper chopstick with your fingers. Most beginners struggle because both sticks move at the same time. Once the lower stick stays still, the grip becomes much easier to control.</p>
      <p>The next thing to check is your practice food. Start with larger, stable pieces before trying slippery noodles or loose rice.</p>
    </section>
    ${articleFigure({
      src: "/assets/chopsticks-grip.svg",
      alt: "Illustration of proper chopsticks finger placement",
      title: "Finger placement visual",
      text: "A simple hand-position illustration helps beginners see which stick stays still and which stick moves."
    })}
    <section class="content-section split">
      <div>
        <p class="eyebrow">Short Answer</p>
        <h2>What is the easiest beginner method?</h2>
        <p>Rest the bottom chopstick against the base of the thumb and the ring finger. Hold the top chopstick like a pencil. Only the top stick should move when picking up food.</p>
      </div>
      <div class="fact-card">
        <strong>Beginner checklist</strong>
        <span>Bottom stick stays still</span>
        <span>Top stick moves</span>
        <span>Start with stable food</span>
        <span>Practice short sessions</span>
      </div>
    </section>
    <section class="content-section">
      <div class="section-heading">
        <p class="eyebrow">Steps</p>
        <h2>How to hold chopsticks step by step</h2>
      </div>
      <ol class="article-list">
        <li>Place the lower chopstick on the base of the thumb and let it rest against the ring finger.</li>
        <li>Hold the upper chopstick the way you hold a pencil, using the thumb, index finger, and middle finger.</li>
        <li>Keep the lower chopstick mostly still.</li>
        <li>Use the index and middle fingers to move the upper chopstick up and down.</li>
        <li>Practice closing the tips evenly before picking up food.</li>
      </ol>
      <p>That lower-stick stability is the real turning point. Once it stops wobbling, control improves quickly.</p>
    </section>
    <section class="content-section">
      <h2>What to practice with first</h2>
      <p>Do not start with loose rice unless that is the food you specifically need to solve. Most people learn faster with larger, stable pieces first, because success comes from repeating clean pickup movement.</p>
      <div class="fact-grid">
        <div><strong>Good first foods</strong><span>Vegetable pieces, tofu cubes, dumplings</span></div>
        <div><strong>Second step foods</strong><span>Noodles, sliced meat, sushi</span></div>
        <div><strong>Later challenge</strong><span>Loose rice and very slippery foods</span></div>
      </div>
    </section>
    <section class="content-section">
      <h2>Common beginner mistakes</h2>
      <p>The most common mistake is gripping too tightly. The second is moving both sticks at once. The third is choosing slick, heavy, or oversized chopsticks too early.</p>
      <p>If the grip feels unstable, fix the hand position before blaming yourself. Bad beginner equipment makes learning harder than it needs to be.</p>
    </section>
    <section class="content-section">
      <h2>What kind of chopsticks help beginners most?</h2>
      <p>Beginners usually do better with bamboo, wood, or textured fiberglass. These materials often give more grip than polished steel. Medium length and moderate weight are usually easier than very long or decorative pairs.</p>
      <a class="button-link" href="/best-chopsticks-for-beginners/">Compare beginner-friendly chopsticks</a>
    </section>
    ${relatedGuidesBlock("Related beginner guides", [
      guides.find((guide) => guide.path === "/guides/how-to-hold-chopsticks/"),
      guides.find((guide) => guide.path === "/guides/how-to-eat-rice-with-chopsticks/"),
      guides.find((guide) => guide.path === "/best-chopsticks-for-beginners/"),
      guides.find((guide) => guide.path === "/guides/training-chopsticks-for-kids/")
    ].filter(Boolean))}
    ${chopsticksDecisionBlock("practice")}
    ${faqBlock(standardFaqs())}
  `
}));

await writePage("/types-of-chopsticks/", pageLayout({
  title: "Types of Chopsticks: Bamboo, Wood, Metal, and Training Sets",
  description: "Compare common types of chopsticks by material, grip, durability, beginner friendliness, and common use cases.",
  path: "/types-of-chopsticks/",
  h1: "Types of Chopsticks",
  intro: "The best chopsticks depend on grip, cleaning needs, and whether you are learning, gifting, or using them every day.",
  faqs: [
    { q: "What type of chopsticks are best for beginners?", a: "Bamboo, wood, and many textured fiberglass sets are usually easier for beginners than smooth steel." },
    { q: "Are metal chopsticks better than wooden chopsticks?", a: "Metal lasts longer and cleans easily, but wood often gives more grip and feels easier for beginners." },
    { q: "What are training chopsticks used for?", a: "They help beginners and children build finger placement and movement habits before switching to regular chopsticks." },
    { q: "Are disposable chopsticks safe for regular daily use?", a: "They are common for convenience, but reusable sets are usually better for long-term use, waste reduction, and consistency." },
    { q: "What chopstick material is easiest to clean?", a: "Metal and many fiberglass chopsticks are the easiest to sanitize and dry quickly." },
    { q: "Do different countries use different chopstick shapes?", a: "Yes. Chinese, Japanese, and Korean chopsticks often differ in length, tip shape, and weight." }
  ],
  articleSidebar: true,
  body: `
    ${articleSearchBlock()}
    <section class="content-section article-body">
      <p class="lead-answer">The main chopstick types people compare are bamboo, wooden, metal, fiberglass, and training chopsticks. Beginners usually do better with more grip and moderate weight, while long-term buyers often care more about durability and cleaning.</p>
      <p>The next question is not just "which type is best?" It is "best for what use case?" Learning, gifting, restaurant style, and daily home use lead to different answers.</p>
    </section>
    <section class="content-section">
      <div class="section-heading">
        <p class="eyebrow">Comparison</p>
        <h2>Quick comparison table</h2>
      </div>
      ${comparisonTable(chopstickTypes)}
    </section>
    <section class="content-section">
      <div class="section-heading">
        <p class="eyebrow">Types</p>
        <h2>Most common chopstick categories</h2>
      </div>
      <div class="animal-grid">${chopstickTypes.map(materialCard).join("")}</div>
    </section>
    ${keywordTable(productKeywords.slice(0, 12), "High-value material and product keywords", "Commercial Intent")}
    ${chopsticksDecisionBlock("types")}
    ${faqBlock(standardFaqs())}
  `
}));

await writePage("/chopstick-etiquette/", pageLayout({
  title: "Chopstick Etiquette: Simple Rules, Table Placement, and What to Avoid",
  description: "Understand chopstick etiquette basics, including table placement, common mistakes, and practical cultural reminders for meals.",
  path: "/chopstick-etiquette/",
  h1: "Chopstick Etiquette",
  intro: "Most etiquette mistakes come from placement, pointing, or leaving chopsticks in positions that look careless or inappropriate.",
  faqs: [
    { q: "What is the biggest chopstick etiquette mistake?", a: "A common mistake is leaving chopsticks stuck upright in rice or pointing them around the table." },
    { q: "Where should chopsticks rest during a meal?", a: "Use a chopstick rest when available, or place them neatly across the bowl or plate edge depending on the setting." },
    { q: "Are etiquette rules identical across all East Asian cultures?", a: "No. Some patterns overlap, but exact customs vary by country, restaurant style, and family setting." },
    { q: "Is chopstick etiquette mainly about respect?", a: "Yes. The practical idea is to keep chopsticks clean, controlled, and respectful within the meal setting." },
    { q: "Can I pass food directly from chopsticks to chopsticks?", a: "That is often discouraged in Japanese contexts and can feel awkward in general dining situations." },
    { q: "Do I need to follow every formal rule at a casual meal?", a: "No. Basic neatness and avoiding the most sensitive gestures usually matters more than memorizing every possible rule." }
  ],
  articleSidebar: true,
  body: `
    ${articleSearchBlock()}
    <section class="content-section article-body">
      <p class="lead-answer">Good chopstick etiquette is mostly about clean handling, respectful placement, and avoiding gestures that feel careless or inappropriate. Most people do not need to memorize dozens of rules. They need a small number of practical reminders that prevent the most visible mistakes.</p>
      <p>That is why simple table habits matter more than trying to perform "perfect" etiquette from memory.</p>
    </section>
    ${keywordTable(etiquetteKeywords.slice(0, 8), "Etiquette keyword cluster", "Etiquette Intent")}
    <section class="content-section split">
      <div>
        <p class="eyebrow">Short Answer</p>
        <h2>What matters most?</h2>
        <p>Do not point with chopsticks, do not stab food, do not leave them standing in food, and place them neatly when resting. These few rules prevent most obvious etiquette problems.</p>
      </div>
      <div class="fact-card">
        <strong>Top etiquette reminders</strong>
        <span>Rest neatly</span>
        <span>Do not point</span>
        <span>Do not stab</span>
        <span>Avoid upright placement in rice</span>
      </div>
    </section>
    <section class="content-section">
      <div class="section-heading">
        <p class="eyebrow">Meal basics</p>
        <h2>Everyday etiquette rules that solve most problems</h2>
      </div>
      <ul class="article-list">
        <li>Use a chopstick rest when available.</li>
        <li>Keep chopsticks together when placing them down.</li>
        <li>Do not wave them while talking.</li>
        <li>Do not spear food unless the setting is extremely casual and informal.</li>
        <li>Avoid leaving them upright in rice or sticking them into food to hold them there.</li>
      </ul>
      <p>These patterns are not about performance. They are about showing steadiness and respect at the table.</p>
    </section>
    ${chopsticksDecisionBlock("etiquette")}
    ${faqBlock(standardFaqs())}
  `
}));

await writePage("/best-chopsticks-for-beginners/", pageLayout({
  title: "Best Chopsticks for Beginners: Grip, Length, and Material",
  description: "Find the best chopsticks for beginners by comparing grip, length, material, weight, training support, and starter-use comfort.",
  path: "/best-chopsticks-for-beginners/",
  h1: "Best Chopsticks for Beginners",
  intro: "For beginners, the best chopsticks are usually stable, not too heavy, not too slippery, and easy to control before speed matters.",
  faqs: standardFaqs(),
  articleSidebar: true,
  body: `
    ${articleSearchBlock()}
    <section class="tool-page">
      <section class="tool-panel">
        <div class="tool-copy">
          <p class="eyebrow">Material Match</p>
          <h2>Find a beginner-friendly type</h2>
          <p>Pick grip and use case to see which material path makes the most sense for a beginner set.</p>
        </div>
        <form class="calculator-form match-form" data-material-form>
          <label>Grip
            <select name="grip">
              <option value="high">Need more grip</option>
              <option value="balanced">Balanced feel</option>
              <option value="durable">Care about durability</option>
            </select>
          </label>
          <label>Use case
            <select name="use">
              <option value="beginner">Beginner learning</option>
              <option value="home">Daily meals</option>
              <option value="gift">Gift or nice set</option>
            </select>
          </label>
          <button type="submit">Get suggestion</button>
        </form>
        <div class="result-card" data-material-result hidden></div>
      </section>
    </section>
    <section class="content-section article-body">
      <p class="lead-answer">Beginners usually learn faster with bamboo, wood, or textured fiberglass chopsticks because they provide more grip than very smooth metal pairs. A moderate length and balanced weight also make control easier.</p>
      <p>The real goal is not "the fanciest set." It is the set that makes the first week of practice easier.</p>
    </section>
    ${comparisonTable(chopstickTypes)}
    ${chopsticksDecisionBlock("buying")}
    ${faqBlock(standardFaqs())}
  `
}));

await writePage("/materials/chopstick-material-compare/", pageLayout({
  title: "Chopstick Material Comparison: Bamboo, Wood, Metal, and More",
  description: "Compare chopstick materials by grip, cleaning, durability, weight, surface texture, and who each option suits best.",
  path: "/materials/chopstick-material-compare/",
  h1: "Chopstick Material Comparison",
  intro: "Material changes grip, maintenance, weight, and the beginner learning curve, so comparison matters before buying.",
  faqs: standardFaqs(),
  articleSidebar: true,
  body: `
    ${articleSearchBlock()}
    <section class="content-section article-body">
      <p class="lead-answer">If you are comparing chopstick materials, the key tradeoff is usually grip versus durability. Bamboo and wood often feel easier at first. Metal lasts longer but can be smoother. Fiberglass often sits between those two ends.</p>
      <p>The best choice depends on whether you are learning, buying for daily meals, or choosing a gift set.</p>
    </section>
    <section class="content-section">
      <div class="section-heading">
        <p class="eyebrow">Material Table</p>
        <h2>Full comparison</h2>
      </div>
      ${comparisonTable(chopstickTypes)}
    </section>
    ${relatedGuidesBlock("Related material guides", [
      guides.find((guide) => guide.path === "/types-of-chopsticks/"),
      guides.find((guide) => guide.path === "/guides/bamboo-vs-wooden-vs-metal-chopsticks/"),
      guides.find((guide) => guide.path === "/best-chopsticks-for-beginners/")
    ].filter(Boolean))}
    ${chopsticksDecisionBlock("materials")}
    ${faqBlock(standardFaqs())}
  `
}));

await writePage("/about/", simpleInfoPage({
  title: "About Chopsticks Guide: Learning, Materials, and Etiquette",
  description: "Learn what Chopsticks Guide covers, how the site is structured, and what kind of practical help it provides for learning, etiquette, and material comparison.",
  path: "/about/",
  h1: "About Chopsticks Guide",
  intro: "This site explains chopsticks use, materials, etiquette, and beginner learning paths in a practical format.",
  body: `
    <section class="content-section article-body">
      <p>Chopsticks Guide is built to answer three kinds of questions clearly: how to use chopsticks, which chopsticks to choose, and what etiquette matters at the table.</p>
      <p>The site focuses on practical explanations first. Cultural notes are included where useful, but the goal is still usability and readability.</p>
    </section>
    <section class="content-section article-body">
      <h2>What the site covers</h2>
      <p>The main content groups are beginner technique, material comparison, etiquette basics, and quick-answer guide pages. That structure makes it easier to move from first learning into product comparison and table use.</p>
      <p>Most pages are written to solve a narrow question directly, not to act like broad encyclopedia entries.</p>
    </section>
    <section class="content-section article-body">
      <h2>What the site does not do</h2>
      <p>This site does not give medical, safety, or product performance guarantees. It also does not treat etiquette as a single universal rule set for every home, country, or restaurant context.</p>
      <p>The goal is practical reference content that helps users make better first decisions and avoid common mistakes.</p>
    </section>
  `
}));

await writePage("/contact/", simpleInfoPage({
  title: "Contact Chopsticks Guide for Corrections, Feedback, and Partnerships",
  description: "Contact Chopsticks Guide for page corrections, factual feedback, content questions, or practical partnership discussions related to the site.",
  path: "/contact/",
  h1: "Contact",
  intro: "Use the contact page for site feedback, corrections, or partnership discussion.",
  body: `
    <section class="content-section article-body">
      <p>Email: <a href="mailto:guan@shanyuegroup.com">guan@shanyuegroup.com</a></p>
      <p>Please include the page URL if you are reporting a correction or wording issue.</p>
    </section>
    <section class="content-section article-body">
      <h2>What to include in your message</h2>
      <p>If you are reporting a factual issue, include the page URL, the sentence in question, and what should be corrected. That makes updates faster and avoids unclear back-and-forth.</p>
      <p>If you are asking about collaboration, keep the request specific so it is easy to review whether it fits the site.</p>
    </section>
    <section class="content-section article-body">
      <h2>Response scope</h2>
      <p>Messages are reviewed for site corrections, practical content suggestions, and relevant business inquiries. General support questions that are already answered on the site may be redirected to the most relevant guide page.</p>
    </section>
  `
}));

await writePage("/privacy/", simpleLegalPage({
  title: "Privacy Policy for Chopsticks Guide Website Visitors and Analytics Use",
  description: "Read the Chopsticks Guide privacy policy covering site analytics, email contact use, and the limited information handled through normal site visits.",
  path: "/privacy/",
  h1: "Privacy Policy",
  intro: "This page explains what data may be collected through analytics or standard site usage.",
  sections: [
    { title: "Analytics", text: "The site may use analytics tools to understand page visits and content usage. No payment or account system is active in the current version." },
    { title: "Contact", text: "If you contact the site by email, the information you send is used only for that communication." },
    { title: "No user account storage", text: "The current site version does not provide public user accounts, subscriptions, or checkout forms, so it does not store that type of account data." }
  ]
}));

await writePage("/terms/", simpleLegalPage({
  title: "Terms of Use for Chopsticks Guide Educational Reference Content",
  description: "Review the terms of use for Chopsticks Guide, including reference-only content scope, limitation of guarantees, and normal site-use expectations.",
  path: "/terms/",
  h1: "Terms of Use",
  intro: "This site provides educational reference content about chopsticks, etiquette, and materials.",
  sections: [
    { title: "Reference use", text: "Content is provided for general educational and informational use only." },
    { title: "No guarantee", text: "The site does not guarantee product performance, safety outcomes, or cultural correctness in every dining context." },
    { title: "Content boundaries", text: "Material comparisons, etiquette notes, and beginner recommendations are intended as practical guidance rather than professional, legal, or safety-certified advice." }
  ]
}));

await writePage("/materials/bamboo-chopsticks/", materialPage(chopstickTypes[0]));
await writePage("/materials/wooden-chopsticks/", materialPage(chopstickTypes[1]));
await writePage("/materials/metal-chopsticks/", materialPage(chopstickTypes[2]));
await writePage("/materials/fiberglass-chopsticks/", materialPage(chopstickTypes[3]));
await writePage("/materials/training-chopsticks/", materialPage(chopstickTypes[4]));

await writePage("/guides/how-to-hold-chopsticks/", supportArticle({
  title: "How to Hold Chopsticks Correctly: Grip Guide",
  description: "A detailed finger-placement guide for better chopstick control, lower-stick stability, smoother movement, and fewer beginner mistakes.",
  path: "/guides/how-to-hold-chopsticks/",
  h1: "How to Hold Chopsticks Correctly",
  intro: "Grip errors create most beginner frustration, so this guide focuses only on placement and control.",
  answer: "Hold the upper chopstick like a pencil and let the lower chopstick rest against the base of the thumb and ring finger. The lower stick should stay mostly still while the upper stick opens and closes.",
  details: [
    "Start by checking the lower stick first. If it slides around, the rest of the grip will keep collapsing.",
    "Once the lower stick feels stable, use the index and middle fingers to move the upper stick in small, controlled motion."
  ],
  related: [guides[0], guides[2], guides[6]].filter(Boolean)
}));

await writePage("/guides/how-to-eat-rice-with-chopsticks/", supportArticle({
  title: "How to Eat Rice with Chopsticks: Food Control Guide",
  description: "Practical ways to handle rice, noodles, ramen, slippery foods, and harder pieces while improving chopstick control.",
  path: "/guides/how-to-eat-rice-with-chopsticks/",
  h1: "How to Eat Rice with Chopsticks",
  intro: "Rice is one of the first foods that makes beginners feel stuck, but the problem is usually technique and food style, not inability.",
  answer: "For loose rice, bring the bowl closer and use smaller controlled bites. For sticky rice or rice mixed with other food, focus on clean grip and short pickup motion rather than squeezing harder.",
  details: [
    "Noodles and rice need slightly different control. Noodles depend on lift and support, while rice depends on smaller motion and bowl positioning.",
    "If rice is the first thing you practice with, progress often feels slower. Stable food pieces usually build confidence faster."
  ],
  related: [guides[0], guides[6], guides[9]].filter(Boolean)
}));

await writePage("/guides/bamboo-vs-wooden-vs-metal-chopsticks/", supportArticle({
  title: "Bamboo vs Wooden vs Metal Chopsticks",
  description: "A practical comparison of common chopstick materials for grip, comfort, cleaning, durability, daily use, and beginner learning.",
  path: "/guides/bamboo-vs-wooden-vs-metal-chopsticks/",
  h1: "Bamboo vs Wooden vs Metal Chopsticks",
  intro: "The best material depends on grip, cleaning, and whether you are learning or buying for long-term use.",
  answer: "Bamboo is usually the easiest low-cost beginner option, wood is comfortable and balanced for home use, and metal is durable but often smoother and harder for first-time learners.",
  details: [
    "Beginners often improve faster when the chopsticks offer more surface grip. That is why bamboo and wood stay strong recommendations.",
    "Metal becomes attractive when durability and cleaning matter more than first-day learning speed."
  ],
  related: [guides[4], guides[6], { title: "Chopstick Material Comparison", path: "/materials/chopstick-material-compare/", category: "Buying Guides", description: "Full material comparison." }]
}));

await writePage("/guides/chinese-vs-japanese-vs-korean-chopsticks/", supportArticle({
  title: "Chinese vs Japanese vs Korean Chopsticks",
  description: "Compare length, shape, material, table use, grip feel, and etiquette differences across Chinese, Japanese, and Korean chopstick styles.",
  path: "/guides/chinese-vs-japanese-vs-korean-chopsticks/",
  h1: "Chinese vs Japanese vs Korean Chopsticks",
  intro: "Style differences affect grip, table setting, and what feels easiest in different food contexts.",
  answer: "Chinese chopsticks are often longer and more neutral in shape, Japanese chopsticks often taper more sharply, and Korean chopsticks are frequently flatter and metal-based in modern sets.",
  details: [
    "These differences matter because food style and table layout change how chopsticks are used.",
    "For beginners, the easiest option is still usually the pair with the best grip and most stable control, not necessarily the most traditional shape."
  ],
  related: [guides[4], guides[5], guides[3]].filter(Boolean)
}));

await writePage("/guides/training-chopsticks-for-kids/", supportArticle({
  title: "Training Chopsticks for Kids and Beginners",
  description: "How training chopsticks help children and first-time learners practice finger placement, grip control, and basic movement more easily.",
  path: "/guides/training-chopsticks-for-kids/",
  h1: "Training Chopsticks for Kids",
  intro: "Training chopsticks can reduce frustration, but they work best when used as a bridge to normal movement.",
  answer: "Training chopsticks help kids and frustrated beginners learn finger position and top-stick movement faster, especially in the first practice stage.",
  details: [
    "The goal is not permanent dependence on assisted tools. It is to build enough hand memory to move into regular chopsticks smoothly.",
    "Choose a model that supports hand placement without locking the user into a rigid, unnatural grip."
  ],
  related: [guides[6], guides[0], guides[1]].filter(Boolean)
}));

await writePage("/guides/chopstick-rest-guide/", supportArticle({
  title: "Chopstick Rest and Holder Guide for Table Settings",
  description: "Learn what chopstick rests and holders do, where to place them, when they help, and how they support cleaner table settings.",
  path: "/guides/chopstick-rest-guide/",
  h1: "Chopstick Rest and Holder Guide",
  intro: "Chopstick rests are a small accessory, but they solve both cleanliness and etiquette problems.",
  answer: "A chopstick rest gives you a clean place to put chopsticks down during a meal. It helps with presentation, hygiene, and neater table handling.",
  details: [
    "A chopstick holder or rest is most useful when you are serving multiple dishes and putting chopsticks down often.",
    "For home use, it can also make the table feel more organized and reduce the habit of laying chopsticks across random surfaces."
  ],
  related: [guides[3], guides[4], guides[6]].filter(Boolean)
}));

await writePage("/guides/how-to-use-chopsticks-for-beginners/", supportArticle({
  title: "How to Use Chopsticks for Beginners: Simple First Steps",
  description: "Learn how to use chopsticks for beginners with simple grip steps, practice foods, common mistakes, and a realistic learning order.",
  path: "/guides/how-to-use-chopsticks-for-beginners/",
  h1: "How to Use Chopsticks for Beginners",
  intro: "Beginners learn faster when the first goal is stable control, not perfect speed or restaurant-level technique.",
  answer: "To use chopsticks as a beginner, stabilize the lower chopstick first, move only the upper chopstick, and practice with larger food pieces before trying rice or slippery noodles.",
  details: [
    "Start with food that is easy to grip, such as tofu cubes, dumpling pieces, or vegetables. Rice and noodles are useful later, but they can make the first practice session feel harder than it needs to be.",
    "A good beginner session is short and repeated. Five minutes of correct grip practice usually helps more than forcing a long meal with a collapsing hand position."
  ],
  related: [guides[0], guides[1], guides[2], guides[6]].filter(Boolean)
}));

await writePage("/guides/how-to-eat-noodles-with-chopsticks/", supportArticle({
  title: "How to Eat Noodles with Chopsticks: Ramen and Long Noodle Tips",
  description: "Learn how to eat noodles with chopsticks, including ramen, lo mein, slippery noodles, lifting technique, bowl support, and beginner mistakes.",
  path: "/guides/how-to-eat-noodles-with-chopsticks/",
  h1: "How to Eat Noodles with Chopsticks",
  intro: "Noodles need lift, support, and portion control, which makes them different from rice or small solid food.",
  answer: "To eat noodles with chopsticks, lift a small bundle, support the strands against the bowl when needed, and avoid grabbing too many noodles at once. Smaller portions give better control and reduce slipping.",
  details: [
    "For ramen or soup noodles, lift fewer strands and let extra broth drip briefly before bringing the bite closer. For dry noodles, grip lower on the bundle and use the bowl edge for support if needed.",
    "If the noodles keep sliding, the problem is usually portion size or chopstick angle. Try a smaller bite and keep the chopstick tips closer together before lifting."
  ],
  related: [guides[0], guides[2], guides[10], guides[6]].filter(Boolean)
}));

await writePage("/guides/stainless-steel-chopsticks/", supportArticle({
  title: "Stainless Steel Chopsticks: Buying Guide, Pros, Cons, and Best Uses",
  description: "Compare stainless steel chopsticks for durability, cleaning, grip, weight, beginner use, Korean-style sets, and daily dining.",
  path: "/guides/stainless-steel-chopsticks/",
  h1: "Stainless Steel Chopsticks",
  intro: "Stainless steel chopsticks are a strong commercial topic because buyers care about durability, cleaning, and long-term daily use.",
  answer: "Stainless steel chopsticks are durable, easy to clean, and reusable, but they can feel smoother and heavier than bamboo or wooden chopsticks. They are best for users who value hygiene and long-term use more than maximum beginner grip.",
  details: [
    "For first-time learners, textured stainless steel is usually easier than very smooth polished metal. Flat Korean-style chopsticks may also feel different from round Chinese or Japanese-style pairs.",
    "Before buying, compare surface texture, tip grip, weight, dishwasher guidance, and whether the set includes rests or a storage case."
  ],
  related: [guides[4], guides[5], guides[6], { title: "Metal Chopsticks", path: "/materials/metal-chopsticks/", category: "Buying Guides", description: "Material profile for metal chopsticks." }]
}));

await writePage("/guides/wooden-chopsticks/", supportArticle({
  title: "Wooden Chopsticks: Daily Use, Gift Sets, Care, and Buying Tips",
  description: "Learn how wooden chopsticks compare for grip, comfort, gift sets, daily meals, cleaning, finish, and beginner-friendly buying choices.",
  path: "/guides/wooden-chopsticks/",
  h1: "Wooden Chopsticks",
  intro: "Wooden chopsticks sit between simple bamboo pairs and polished gift sets, so they work well for daily use and product recommendations.",
  answer: "Wooden chopsticks are comfortable, warm in the hand, and usually easier to grip than smooth metal chopsticks. They are good for home dining, gift sets, and learners who want a nicer pair without losing control.",
  details: [
    "The main tradeoff is maintenance. Some wooden chopsticks need gentler washing, full drying, and occasional replacement if the finish wears down.",
    "When comparing wooden sets, look at wood type, surface texture, tip shape, finish safety, length, and whether the set is meant for daily use or decorative gifting."
  ],
  related: [guides[4], guides[5], guides[6], { title: "Wooden Chopsticks Material Guide", path: "/materials/wooden-chopsticks/", category: "Buying Guides", description: "Material profile for wooden chopsticks." }]
}));

await writePage("/guides/gold-chopsticks/", supportArticle({
  title: "Gold Chopsticks: Gift Meaning, Materials, Finishes, and Buying Notes",
  description: "Learn what gold chopsticks usually mean, when they work as gifts, and how to compare gold-colored, plated, wooden, metal, and decorative chopstick sets.",
  path: "/guides/gold-chopsticks/",
  h1: "Gold Chopsticks",
  intro: "Gold chopsticks are usually bought for gift presentation, festive dining, weddings, and decorative table settings rather than beginner practice.",
  answer: "Gold chopsticks are best understood as a gift and presentation category. Most sets are gold-colored, gold-plated, lacquered, stainless steel, or decorated wood rather than solid gold, so buyers should check material, grip, care instructions, and whether the finish is food-safe.",
  details: [
    "For practical use, surface texture matters more than color. A polished gold finish can look premium but may feel slippery for beginners, especially with noodles, rice, or smooth foods.",
    "For gift use, look for a complete set with a box, clear material description, matching rests, and care instructions. A beautiful set that cannot be cleaned easily will not work well for daily meals.",
    "Gold chopsticks can carry a festive or auspicious look in many gift contexts, but the meaning depends on the occasion and design. Avoid presenting the color as a guaranteed luck symbol."
  ],
  sections: [
    {
      title: "When gold chopsticks make sense",
      paragraphs: [
        "Gold chopsticks work best when the buyer wants a more formal table setting, a wedding or housewarming gift, a Lunar New Year dining accent, or a decorative set that looks more special than plain everyday pairs. They are not automatically better for eating, so the first question should be whether the set is meant for daily meals, occasional hosting, or display. A daily-use pair needs grip, balance, and washable materials. A gift set needs presentation, clear material information, and a box that protects the finish.",
        "For a serious gift, avoid choosing by color alone. Compare the chopstick length, tip shape, surface texture, and total weight. Long chopsticks can look elegant but may be harder for children or beginners. Very smooth metal chopsticks may look premium but can be difficult with noodles, rice, and slippery vegetables. A gold-tone wooden or lacquered pair may feel warmer in the hand, while a stainless steel pair may be easier to clean."
      ]
    },
    {
      title: "Material and finish choices",
      paragraphs: [
        "Most gold chopsticks sold online are not solid gold. Common versions include gold-colored stainless steel, titanium-coated metal, gold-painted wood, lacquered wood with metallic decoration, and decorative gift sets with gold accents. The wording matters because care instructions change by material. Metal sets may tolerate more frequent washing, while painted or lacquered sets need gentler cleaning to protect the finish.",
        "Food-contact clarity is important. A listing should explain the base material and the finish, not only show a shiny product photo. If the product page does not explain whether the surface is food-safe, dishwasher-safe, or decorative only, treat it as a risk. For a product recommendation page later, this is the main filter: attractive sets are easy to find, but trustworthy material descriptions are what make a set worth recommending."
      ]
    },
    {
      title: "Gift buying checklist",
      paragraphs: [
        "A good gold chopstick gift set usually includes more than the chopsticks themselves. A box, matching rests, a clean storage sleeve, or a paired spoon set can make the gift feel complete. The packaging should not do all the work, though. Check whether the chopsticks sit evenly, whether the tips are aligned, and whether the finish looks consistent from handle to tip. Uneven coating can make a set feel cheap even when the color is attractive.",
        "The occasion also changes the best choice. For weddings, paired sets with a clean presentation are usually stronger than novelty designs. For housewarming gifts, a durable daily-use set may be better. For festive decor, red, black, wood, and gold combinations can feel more traditional than a single bright gold finish. The safest page structure is to explain these use cases clearly before recommending any products."
      ]
    },
    {
      title: "Common buying mistakes",
      paragraphs: [
        "The biggest mistake is buying the shiniest pair without checking grip. Chopsticks are tools first. If the tips are too smooth, the pair may look good in photos but perform badly at the table. The second mistake is assuming dishwasher-safe care when the set is actually painted, lacquered, or decorated. Heat and detergent can dull a finish quickly.",
        "Another mistake is treating the color as a universal cultural meaning. Gold can suggest celebration, wealth, or formality in many contexts, but a product page should describe it as visual and symbolic rather than promising luck. That wording keeps the article useful, honest, and safer for future affiliate recommendations."
      ]
    }
  ],
  related: [guides[4], guides[5], guides[6], guides[13]].filter(Boolean)
}));

await writePage("/guides/disposable-vs-reusable-chopsticks/", supportArticle({
  title: "Disposable vs Reusable Chopsticks: Which Type Should You Choose?",
  description: "Compare disposable and reusable chopsticks for takeout, events, home meals, beginner learning, cleaning, cost, and material choice.",
  path: "/guides/disposable-vs-reusable-chopsticks/",
  h1: "Disposable vs Reusable Chopsticks",
  intro: "Disposable chopsticks and reusable chopsticks solve different problems, so the right choice depends on setting, cleaning, budget, and comfort.",
  answer: "Disposable chopsticks are convenient for takeout, events, and one-time serving, while reusable chopsticks are better for home meals, gift sets, repeated practice, and long-term cost. For most homes, bamboo, wood, fiberglass, or metal reusable pairs are more useful than bulk disposable sets.",
  details: [
    "Choose disposable chopsticks when hygiene logistics, large groups, or takeout packaging matter more than long-term comfort. Check whether the product is individually wrapped and whether the surface feels splinter-free.",
    "Choose reusable chopsticks when grip, table presentation, and repeated use matter. Beginners usually do better with bamboo or wooden pairs before moving to smooth metal sets.",
    "For product pages later, this topic can support separate recommendations for takeout supplies, home starter sets, dishwasher-safe sets, and gift-ready reusable chopsticks."
  ],
  sections: [
    {
      title: "Best use cases for disposable chopsticks",
      paragraphs: [
        "Disposable chopsticks make sense for takeout, catered events, food trucks, office lunches, parties, and any situation where washing and collecting utensils would be difficult. The main value is convenience and serving logistics. If a restaurant sends food out the door, individually wrapped disposable pairs are simple, predictable, and easy to include in packaging.",
        "The tradeoff is comfort and consistency. Disposable pairs can vary in smoothness, strength, and splinter risk. Cheap wooden pairs may feel rough, split unevenly, or bend during use. If disposable chopsticks are needed for an event, choose wrapped pairs with clear material information, then test a small pack before buying in bulk."
      ]
    },
    {
      title: "Best use cases for reusable chopsticks",
      paragraphs: [
        "Reusable chopsticks are better for homes, learning, daily meals, gift sets, and anyone who wants a more polished table setting. A good reusable pair can give better balance, smoother finishing, and more reliable grip than a basic disposable pair. Over time, reusable sets also reduce the need to keep buying one-time supplies.",
        "Material choice should match the user. Bamboo and wooden chopsticks often feel easier for beginners because the surface has more grip. Fiberglass sets are popular for durability and easy cleaning. Stainless steel can be hygienic and long-lasting, but smooth metal tips may be harder for new users. A household can reasonably keep more than one type: textured pairs for learning, durable pairs for daily meals, and a nicer set for guests."
      ]
    },
    {
      title: "Cost, waste, and cleaning tradeoffs",
      paragraphs: [
        "Disposable chopsticks look cheap per pair, but the total cost changes when they are used constantly. For a household that eats with chopsticks often, a reusable set usually becomes more practical quickly. For a one-time event, disposable may still be the simplest answer because the cleaning time, storage, and risk of lost utensils are lower.",
        "Cleaning is the strongest argument for choosing reusable materials carefully. Wood and bamboo should dry fully and may need replacement when they crack, smell, or lose finish. Fiberglass and metal are easier to sanitize, but the user still needs to check dishwasher guidance. The best recommendation is not one material for everyone; it is a clear match between cleaning habits and material limits."
      ]
    },
    {
      title: "Buying recommendation framework",
      paragraphs: [
        "For takeout businesses and events, look for wrapped disposable pairs, smooth finishing, bulk pricing, and reliable packaging. For home kitchens, start with a reusable set that is easy to grip and easy to clean. For beginners, avoid extremely slick metal or novelty shapes until the basic hand movement is stable.",
        "For future affiliate pages, this topic can split naturally into four product paths: bulk disposable chopsticks, beginner reusable sets, dishwasher-safe daily sets, and gift-ready chopstick sets. Keeping those paths separate will make recommendations clearer and prevent one page from mixing restaurant supply intent with home dining intent."
      ]
    },
    {
      title: "How to make the final choice",
      paragraphs: [
        "The simplest decision rule is to match the chopsticks to the setting. If the meal is temporary, public, or difficult to clean up after, disposable chopsticks may be practical. If the chopsticks will be used at home every week, reusable pairs usually give better value, better grip choices, and a more pleasant table experience.",
        "For mixed households, keeping both types can make sense. A small pack of wrapped disposable chopsticks covers takeout, guests, and outdoor meals, while a durable reusable set handles normal dining. The important point is not to treat disposable and reusable chopsticks as moral opposites; they solve different use cases, and the better choice depends on convenience, hygiene logistics, comfort, and long-term use."
      ]
    }
  ],
  related: [guides[4], guides[5], guides[6], guides[12]].filter(Boolean)
}));

await writePage("/chopsticks-faq/", pageLayout({
  title: "Chopsticks FAQ: Use, Etiquette, Materials, and Learning",
  description: "Browse frequently asked questions about using chopsticks, etiquette rules, material choices, beginner learning, and practical table use.",
  path: "/chopsticks-faq/",
  h1: "Chopsticks FAQ",
  intro: "Use the FAQ page when you need quick answers about grip, etiquette, or choosing the right kind of chopsticks.",
  faqs: standardFaqs(),
  body: `
    ${articleSearchBlock()}
    ${faqBlock(standardFaqs())}
  `
}));

await writePage("/guides/chinese-chopsticks/", supportArticle({
  title: "Chinese Chopsticks: Shape, Materials, Table Use, and Buying Notes",
  description: "Learn what Chinese chopsticks are like, how they differ from Japanese and Korean chopsticks, and how to choose a practical pair.",
  path: "/guides/chinese-chopsticks/",
  h1: "Chinese Chopsticks: Shape, Materials, Table Use, and Buying Notes",
  intro: "Chinese chopsticks are usually longer and more blunt-tipped than some other East Asian styles, which makes them useful for shared dishes, home meals, and broader table settings.",
  answer: "Chinese chopsticks are commonly longer than Japanese chopsticks and often less sharp at the tip. They are used for shared dishes, rice, noodles, vegetables, hot pot, and daily meals, so the best pair should balance length, grip, material, cleaning, and table setting.",
  details: [
    "The term Chinese chopsticks can refer to everyday bamboo pairs, wooden home sets, restaurant pairs, cooking chopsticks, gift sets, or decorative tableware. The right choice depends on whether the user needs learning support, daily durability, formal presentation, or a cultural gift.",
    "For beginners, the most practical Chinese-style pair is usually medium length, not too smooth, and not too heavy. Bamboo and wood often feel easier than polished metal because they provide more surface grip.",
    "For buying pages later, this topic can connect product categories such as bamboo chopsticks, wooden chopsticks, gift sets, chopstick rests, hot pot chopsticks, and beginner training sets."
  ],
  sections: [
    { title: "What makes Chinese chopsticks different", paragraphs: [
      "Chinese chopsticks are often designed for a table where dishes are shared. Compared with shorter or sharper styles, many Chinese pairs are longer, more blunt at the tip, and simple in shape. That length can make it easier to reach shared plates, hot pot ingredients, and family-style dishes, although very long pairs may feel harder for complete beginners.",
      "The shape varies by region, restaurant, and product type. Some pairs are round, some are square at the handle, and some taper gradually toward the tip. A square upper section can prevent rolling on the table, while a rounder body may feel smoother in the hand. For real use, the tip texture and balance matter more than the label alone."
    ]},
    { title: "Materials used for Chinese chopsticks", paragraphs: [
      "Common materials include bamboo, wood, lacquered wood, melamine-style restaurant pairs, fiberglass, stainless steel, and decorative gift materials. Bamboo is lightweight and affordable. Wood feels warm and often gives better grip. Fiberglass is durable and practical for repeated home meals. Metal is easy to sanitize but can be slippery. Decorative lacquered pairs can look elegant but may require gentler care.",
      "A product recommendation should not simply say one material is best. A learner needs grip. A restaurant needs cleaning convenience. A home cook may want durable reusable pairs. A gift buyer may care about box presentation, color, and matching rests. Separating those use cases is what makes a Chinese chopsticks page useful rather than generic."
    ]},
    { title: "Buying checklist for Chinese chopsticks", paragraphs: [
      "Before buying Chinese chopsticks, check length, tip texture, weight, material, finish, cleaning method, and whether the set includes rests or a storage box. Beginners should avoid very slick tips and overly heavy pairs. Daily home users should consider cleaning and replacement. Gift buyers should check presentation and whether the pair is actually practical for eating.",
      "A good product listing should show the full pair, tip close-up, material description, length, care instructions, and real table context. A polished product photo is not enough. If the listing hides the tip or does not explain the material, the pair may still look attractive but be hard to recommend responsibly."
    ]}
  ],
  related: [guides[0], guides[3], guides[4], guides[7], guides[15]].filter(Boolean)
}));
await writePage("/guides/chopsticks-set/", supportArticle({
  title: "Chopsticks Set: Materials, Pair Count, Gift Boxes, and Buying Checks",
  description: "Choose a chopsticks set by material, pair count, grip, rests, gift packaging, cleaning method, and real table use.",
  path: "/guides/chopsticks-set/",
  h1: "Chopsticks Set: Materials, Pair Count, Gift Boxes, and Buying Checks",
  intro: "A chopsticks set is more than several pairs in a box. The right set depends on material, pair count, table setting, cleaning routine, and whether it is for daily meals, guests, or gifting.",
  answer: "A good chopsticks set should match the user's use case: daily family meals, beginner practice, formal table settings, hot pot, restaurant-style serving, or cultural gifts. Compare material, grip texture, length, weight, pair count, included rests, storage box, and care instructions before buying.",
  details: [
    "For home use, the most practical chopsticks set usually includes enough pairs for the household plus guests, uses a material that is easy to clean, and has tips that are not too slippery.",
    "For gifts, packaging and visual finish matter, but they should not replace practical checks. A decorative box is useful only if the chopsticks themselves are comfortable, balanced, and clearly described.",
    "For future affiliate blocks, this page can separate daily sets, beginner sets, gift sets, reusable family sets, chopstick-and-rest bundles, and premium decorative sets."
  ],
  sections: [
    { title: "How to choose a chopsticks set by use case", paragraphs: [
      "A daily chopsticks set should be durable, easy to wash, and comfortable enough for repeated meals. Bamboo, wood, fiberglass, and some dishwasher-safe reusable materials can all work, but the right choice depends on grip and care habits. A family that uses chopsticks every day needs replacement logic and cleaning convenience more than ornate decoration.",
      "A guest or hosting set has a different job. It should look coordinated on the table, include enough matching pairs, and ideally work with chopstick rests or simple holders. A gift set needs still another evaluation: box presentation, color, cultural meaning, and whether the recipient can actually use the set comfortably. Treating all sets as the same product type leads to weak recommendations."
    ]},
    { title: "Pair count, rests, and packaging", paragraphs: [
      "Pair count should match the setting. Two pairs can work for a couple or small gift. Five pairs are common for family use. Ten or more pairs make sense for gatherings, events, or restaurants. A good listing should make the number of pairs obvious, because buyers often compare price without noticing whether the set includes two pairs or ten pairs.",
      "Chopstick rests, holders, boxes, and sleeves change how the set is used. Rests make table presentation cleaner. A storage box protects gift sets and keeps matched pairs together. Travel sleeves are useful for portable reusable chopsticks. These accessories are valuable when they solve a real use case, not when they only make the listing look fuller."
    ]},
    { title: "Material and care checklist", paragraphs: [
      "Before buying, check material, finish, tip texture, length, weight, whether the set is dishwasher safe, and whether the product page explains care clearly. Wood and bamboo may feel warmer and easier to grip, but they often need gentler drying. Fiberglass can be practical for repeated use. Metal may be durable but can feel slippery for beginners. Lacquered or decorative sets need more care scrutiny.",
      "A strong buying guide should also mention what to avoid: vague material descriptions, overly glossy tips for beginners, photos that hide the tip shape, unclear pair count, and gift boxes that look premium while the chopsticks themselves are generic. This keeps the page useful before specific product recommendations are added."
    ]}
  ],
  related: [guides[4], guides[5], guides[6], guides[15], guides[16]].filter(Boolean)
}));

await writeFile("dist/toolkit.js", clientScript(), "utf8");
await writeFile("dist/styles.css", css() + themeCss(), "utf8");
await writeFile("dist/sitemap.xml", sitemapXml(), "utf8");
await writeFile("dist/robots.txt", robotsTxt(), "utf8");
await writeFile("dist/llms.txt", llmsTxt(), "utf8");

await buildSeoReport();

function simpleInfoPage({ title, description, path, h1, intro, body }) {
  return pageLayout({
    title,
    description,
    path,
    h1,
    intro,
    body,
    heroLabel: "Site information"
  });
}

function simpleLegalPage({ title, description, path, h1, intro, sections }) {
  return pageLayout({
    title,
    description,
    path,
    h1,
    intro,
    heroLabel: "Legal information",
    body: sections.map((section) => `<section class="content-section article-body"><h2>${escapeHtml(section.title)}</h2><p>${escapeHtml(section.text)}</p></section>`).join("")
  });
}

function articleSections(sections = []) {
  return sections.map((section) => `<section class="content-section article-body"><h2>${escapeHtml(section.title)}</h2>${section.paragraphs.map((paragraph) => `<p>${escapeHtml(paragraph)}</p>`).join("")}</section>`).join("");
}

function supportArticle({ title, description, path, h1, intro, answer, details, sections = [], related }) {
  return pageLayout({
    title,
    description,
    path,
    h1,
    intro,
    heroLabel: "Support guide",
    faqs: standardFaqs(),
    articleSidebar: true,
    body: `
      ${articleSearchBlock()}
      <section class="content-section article-body">
        <p class="lead-answer">${escapeHtml(answer)}</p>
        ${details.map((item) => `<p>${escapeHtml(item)}</p>`).join("")}
      </section>
      ${articleSections(sections)}
      <section class="content-section article-body">
        <h2>How to use this guide before buying or practicing</h2>
        <p>The best way to use this page is to match the advice to a real meal, not to choose by appearance alone. Chopsticks used for learning need grip, clear finger placement, and forgiving food practice. Chopsticks used for guests need clean presentation, balanced length, and easy table placement. Chopsticks used every day need a material that fits the way the household washes, dries, and stores utensils.</p>
        <p>That practical context matters because many chopstick problems are not caused by the user's hand skill alone. A pair can be too smooth, too heavy, too long, too short, or shaped in a way that makes food control harder. Before treating a technique as wrong, compare the material, tip shape, surface texture, and food type. A beginner trying to pick up rice with polished metal chopsticks is facing a different problem from someone practicing with textured bamboo and larger food pieces.</p>
        <p>For product research, use this page as a filtering framework. First decide the setting: beginner practice, family dining, restaurant-style service, gift presentation, travel, or child training. Then check the material, grip, cleaning method, and expected lifespan. A good recommendation should explain tradeoffs clearly instead of claiming one pair is best for everyone.</p>
      </section>
      <section class="content-section article-body">
        <h2>Decision checklist and common mistakes</h2>
        <p>Before making a final choice, check five points: who will use the chopsticks, what food they will eat most often, how the pair will be washed, whether grip or appearance matters more, and whether the set needs to work for daily meals or occasional presentation. These questions are more useful than choosing only by country style or product photo.</p>
        <p>For learners, the first mistake is practicing with the hardest material and the hardest food at the same time. Smooth metal chopsticks and loose rice can make a beginner feel as if the hand position is wrong, even when the real problem is surface friction. Start with larger food pieces and a grippier pair, then move to noodles, rice, and slippery foods after the lower stick stays stable.</p>
        <p>For buyers, the common mistake is assuming a premium-looking set is automatically easier to use. Gift sets, lacquered pairs, and polished metal chopsticks can look excellent but still be too slick, too heavy, or too delicate for daily meals. A practical product page should separate appearance, function, care, and cultural setting so the reader can choose the right pair for the real use case.</p>
        <p>When the topic is a technique guide, test the advice with one easy food and one difficult food. When the topic is a buying guide, compare at least two materials before deciding. When the topic is etiquette, focus on visible table behavior rather than memorizing every regional custom. This keeps each guide useful as a practical decision page instead of a short definition.</p>
        <p>The next step should also be clear. A reader who struggles with grip should open the holding guide. A reader comparing products should open material comparison and beginner picks. A reader preparing a table setting should open etiquette and rest guides. Strong internal paths help visitors solve the next problem without returning to search immediately.</p>
        <p>Before leaving the page, the reader should know one recommended action, one common mistake to avoid, one buying or practice check, and one related page to open next. That is the minimum standard for an old guide page to feel complete rather than thin.</p>
        <p>For advertising review, this also matters because a useful guide should show original judgment, practical context, and enough explanation for a visitor to make progress without immediately needing another search result.</p>
      </section>
      ${relatedGuidesBlock("Related guides", related)}
      ${faqBlock(standardFaqs())}
    `
  });
}

function chopsticksDecisionBlock(context = "general") {
  const contextLine = {
    practice: "For practice pages, treat every recommendation as a way to reduce early friction: choose easier food, use a grippier pair, and repeat the same motion before increasing difficulty.",
    types: "For type comparison pages, the right answer depends on whether the user needs learning support, daily durability, a gift presentation, or restaurant-style table use.",
    etiquette: "For etiquette pages, the goal is not to memorize every regional rule; it is to avoid the most visible table mistakes and keep the meal respectful.",
    buying: "For buying pages, prioritize grip, length, material, and cleaning method before decoration, packaging, or novelty design.",
    materials: "For material pages, compare surface texture, weight, cleaning limits, and expected use frequency before deciding which material is better.",
    general: "For chopsticks guides, match the advice to the meal setting, user skill level, and cleaning habits before choosing a pair."
  }[context] || "";
  return `<section class="content-section article-body">
    <h2>Practical decision framework</h2>
    <p>${contextLine}</p>
    <p>A useful chopsticks page should answer three separate questions: who is using the chopsticks, what food or setting they are used for, and what tradeoff matters most. A beginner needs control. A daily home user needs cleaning convenience and comfort. A gift buyer needs presentation without losing function. A restaurant or takeout setting needs predictable serving logistics.</p>
    <p>The biggest mistake is choosing only by appearance. Very polished metal, glossy lacquer, long ceremonial pairs, or decorative gift sets can look impressive but feel difficult during real meals. On the other hand, a plain bamboo or wooden pair may be easier for learning because the surface has more grip and the weight is more forgiving.</p>
    <p>Use this page as a checklist before moving to a product recommendation: check grip, tip shape, length, weight, care instructions, and whether the pair fits the actual meal. That structure keeps the advice practical and prevents one-size-fits-all recommendations.</p>
    <p>When a page compares several options, the final recommendation should explain why one tradeoff matters more than another. Grip matters most for new users. Cleaning matters most for daily household use. Packaging and finish matter more for gifts. Table placement matters for etiquette and hosting. Separating those priorities makes the guide useful for real decisions instead of repeating generic advice.</p>
    <p>If the user is still unsure, the safest starting point is a medium-length pair with moderate weight and visible surface texture. It gives enough control for practice without locking the user into a specialized style. After that, the reader can move toward metal for durability, lacquered wood for presentation, training chopsticks for children, or rests and holders for formal table settings.</p>
    <p>The final step is to connect the current topic to the next decision. If the problem is hand control, move to the holding guide and practice foods. If the problem is buying, compare bamboo, wood, metal, fiberglass, and training sets before choosing a product. If the problem is table behavior, check etiquette and rest placement instead of buying another pair. That path keeps the reader moving through useful pages rather than leaving with a partial answer.</p>
    <p>For search and shopping intent, the page should also make the evaluation criteria visible enough to stand alone in summaries. A reader should be able to understand the recommended user, the likely drawback, and the next comparison without relying on another paragraph. This is especially important for older guide pages because short answers can look useful at first but still fail to help a visitor choose, practice, or buy with confidence.</p>
  </section>`;
}

function materialPage(item) {
  return pageLayout({
    title: `${item.name}: Grip, Use Cases, Pros, and Cautions`,
    description: `Learn when ${item.name.toLowerCase()} make sense, who they help most, what tradeoffs to expect, and how they compare for daily chopstick use.`,
    path: `/materials/${item.slug}/`,
    h1: item.name,
    intro: item.summary,
    heroLabel: "Material guide",
    faqs: standardFaqs(),
    articleSidebar: true,
    body: `
      ${articleSearchBlock()}
      <section class="content-section article-body">
        <p class="lead-answer">${escapeHtml(item.name)} are best for ${escapeHtml(item.bestFor.toLowerCase())}. Their main strength is ${escapeHtml(item.pros[0].toLowerCase())}, while the first caution to check is ${escapeHtml(item.cautions[0].toLowerCase())}.</p>
        <p>${escapeHtml(item.summary)}</p>
      </section>
      <section class="content-section split">
        <div class="fact-card">
          <strong>Best for</strong>
          <span>${escapeHtml(item.bestFor)}</span>
          <span>${escapeHtml(item.texture)}</span>
        </div>
        <div class="fact-card">
          <strong>Main cautions</strong>
          ${item.cautions.map((caution) => `<span>${escapeHtml(caution)}</span>`).join("")}
        </div>
      </section>
      <section class="content-section">
        <div class="section-heading">
          <p class="eyebrow">Pros</p>
          <h2>Why people choose ${escapeHtml(item.name)}</h2>
        </div>
        <ul class="article-list">${item.pros.map((pro) => `<li>${escapeHtml(pro)}</li>`).join("")}</ul>
      </section>
      <section class="content-section article-body">
        <h2>Who should choose ${escapeHtml(item.name)}</h2>
        <p>${escapeHtml(item.name)} make the most sense when the buyer's real use case matches the material. For ${escapeHtml(item.name.toLowerCase())}, that usually means ${escapeHtml(item.bestFor.toLowerCase())}. The surface feel is ${escapeHtml(item.texture.toLowerCase())}, so the reader should compare grip and control before looking only at color, packaging, or product photos.</p>
        <p>A beginner should ask whether the chopsticks make food easier to hold. A daily home user should ask whether the pair fits the washing and drying routine. A gift buyer should ask whether the set still works as a tool after the box is opened. These questions keep the material guide useful for real buying decisions instead of becoming a short product description.</p>
        <p>Material choice also changes the practice path. A grippier material can make larger food pieces feel easier, while a smoother or heavier material may require more control. If the reader is still learning, the safest comparison is not simply which material lasts longest, but which material makes the first month of practice less frustrating.</p>
      </section>
      <section class="content-section article-body">
        <h2>Grip, cleaning, and care checklist</h2>
        <p>Before buying ${escapeHtml(item.name.toLowerCase())}, check the tip shape, surface texture, length, weight, and cleaning instructions. The tips should give enough control for the food the user eats most often. The handle should feel balanced rather than too heavy at one end. If the material needs special care, the product page should say so clearly.</p>
        <p>Cleaning is one of the main reasons chopstick recommendations differ. Some buyers want dishwasher-friendly reusable pairs. Others are comfortable hand-washing wood or bamboo if the grip feels better. A useful material page should make that tradeoff visible. A pair that is easy to sanitize may be less comfortable for beginners; a pair that feels warm and natural may need more careful drying.</p>
        <p>Care also affects lifespan. Replace chopsticks that crack, smell, splinter, lose coating, bend, or become too slippery to control safely. For family use, it is better to choose a reliable everyday material than to keep a decorative pair that is difficult to clean or uncomfortable during normal meals.</p>
      </section>
      <section class="content-section article-body">
        <h2>When not to choose ${escapeHtml(item.name)}</h2>
        <p>Do not choose this material only because it appears in a premium photo or a large online listing. ${escapeHtml(item.cautions.join(" "))} These cautions matter because chopsticks are used with hot food, oily sauces, rice, noodles, vegetables, and shared dishes. A weak match between material and food can make the pair frustrating even if it looks attractive.</p>
        <p>If the user is buying for a child, a complete beginner, or someone with limited hand control, comfort and grip should come before appearance. If the pair is for hosting, presentation and table setting may matter more. If the pair is for repeated daily meals, cleaning and durability usually become the deciding factors.</p>
        <p>The best next step is to compare this material with bamboo, wood, metal, fiberglass, and training styles in the broader material comparison page. That gives the reader a clearer buying path and reduces the risk of choosing a pair that solves the wrong problem.</p>
        <p>For product recommendations, this page should work as a quality filter. A good listing should explain the base material, surface finish, tip texture, length, cleaning method, and intended user. If those details are missing, the product may still look attractive, but it is harder to recommend responsibly.</p>
        <p>Use this material page together with the beginner and comparison guides. The material tells you how the pair feels and cleans; the beginner guide tells you whether it supports learning; the type guide shows how the same material fits different table settings.</p>
      </section>
      ${relatedGuidesBlock("Continue material comparison", [
        { title: "Chopstick Material Comparison", path: "/materials/chopstick-material-compare/", category: "Buying Guides", description: "Compare grip, cleaning, durability, and daily-use tradeoffs." },
        { title: "Best Chopsticks for Beginners", path: "/best-chopsticks-for-beginners/", category: "Buying Guides", description: "Beginner-friendly material and grip choices." },
        { title: "Types of Chopsticks", path: "/types-of-chopsticks/", category: "Buying Guides", description: "Compare common chopstick styles and use cases." }
      ])}
      ${faqBlock(standardFaqs())}
    `
  });
}

function sitemapXml() {
  const urls = pages.map((page) => `  <url><loc>${absolute(page.path)}</loc></url>`).join("\n");
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`;
}

function robotsTxt() {
  return `User-agent: *\nAllow: /\n\nUser-agent: GPTBot\nAllow: /\n\nUser-agent: OAI-SearchBot\nAllow: /\n\nUser-agent: ChatGPT-User\nAllow: /\n\nUser-agent: CCBot\nAllow: /\n\nUser-agent: ClaudeBot\nAllow: /\n\nUser-agent: PerplexityBot\nAllow: /\n\nSitemap: ${SITE.url}/sitemap.xml\n`;
}

function llmsTxt() {
  const lines = [
    "# Chopsticks Guide",
    `- Home: ${SITE.url}/`,
    `- How to use chopsticks: ${SITE.url}/how-to-use-chopsticks/`,
    `- Types of chopsticks: ${SITE.url}/types-of-chopsticks/`,
    `- Chopstick etiquette: ${SITE.url}/chopstick-etiquette/`,
    `- Guides: ${SITE.url}/guides/`,
    `- Sitemap: ${SITE.url}/sitemap.xml`,
  ];
  return `${lines.join("\n")}\n`;
}

async function buildSeoReport() {
  const sitemap = await readFile("dist/sitemap.xml", "utf8");
  const reports = [];
  for (const page of pages) {
    const file = page.path === "/" ? join("dist", "index.html") : join("dist", page.path, "index.html");
    const html = await readFile(file, "utf8");
    reports.push(auditPage(page, html, sitemap));
  }

  const totals = {
    average: Math.round(reports.reduce((sum, item) => sum + item.score, 0) / reports.length),
    pages: reports.length,
    pass: reports.filter((item) => item.score >= 85).length,
    review: reports.filter((item) => item.score >= 70 && item.score < 85).length,
    fix: reports.filter((item) => item.score < 70).length
  };
  const rows = reports.map((item) => `<tr>
    <td><a href="${item.path}">${item.path}</a></td>
    <td>${item.score}</td>
    <td>${item.titleLength}</td>
    <td>${item.descriptionLength}</td>
    <td>${item.wordCount}</td>
    <td>${item.h1}/${item.h2}</td>
    <td>${item.faqs}</td>
    <td>${escapeHtml(item.issues.join("; ") || "None")}</td>
  </tr>`).join("");
  const json = JSON.stringify({ generatedAt: new Date().toISOString(), totals, reports }, null, 2);
  await mkdir("dist/admin", { recursive: true });
  await writeFile("dist/admin/seo-report.json", json, "utf8");
}

function auditPage(page, html, sitemap) {
  const title = (html.match(/<title>(.*?)<\/title>/i) || [])[1] || "";
  const description = (html.match(/<meta name="description" content="([^"]*)"/i) || [])[1] || "";
  const h1 = (html.match(/<h1/g) || []).length;
  const h2 = (html.match(/<h2/g) || []).length;
  const faqCount = (html.match(/"@type":"Question"/g) || []).length;
  const text = html.replace(/<script[\s\S]*?<\/script>/gi, " ").replace(/<style[\s\S]*?<\/style>/gi, " ").replace(/<[^>]+>/g, " ");
  const words = text.trim().split(/\s+/).filter(Boolean);
  const issues = [];
  if (title.length < 35 || title.length > 72) issues.push("title length");
  if (description.length < 90 || description.length > 170) issues.push("description length");
  if (h1 !== 1) issues.push("h1 count");
  if (h2 < 2) issues.push("low h2 count");
  if (!sitemap.includes(`<loc>${absolute(page.path)}</loc>`)) issues.push("missing from sitemap");
  if (page.path.startsWith("/guides/") || page.path === "/how-to-use-chopsticks/" || page.path === "/types-of-chopsticks/" || page.path === "/chopstick-etiquette/" || page.path === "/best-chopsticks-for-beginners/") {
    if (faqCount < 2) issues.push("missing FAQ");
  }
  if (requiresFullArticleDepth(page.path) && words.length < 1000) issues.push("thin content: under 1000 words");
  else if (!requiresFullArticleDepth(page.path) && words.length < 220) issues.push("thin support content");
  let score = 100 - issues.length * 8;
  if (words.length >= 1000) score += 4;
  if (requiresFullArticleDepth(page.path) && words.length < 1000) score = Math.min(score, 69);
  score = Math.max(54, Math.min(100, score));
  return {
    path: page.path,
    score,
    titleLength: title.length,
    descriptionLength: description.length,
    wordCount: words.length,
    h1,
    h2,
    faqs: faqCount,
    issues
  };
}

function requiresFullArticleDepth(path) {
  if (["/", "/about/", "/contact/", "/privacy/", "/terms/", "/guides/", "/chopsticks-faq/"].includes(path)) return false;
  if (path.startsWith("/admin/")) return false;
  return true;
}

function clientScript() {
  return `const guideTargets=${JSON.stringify(guides.map((guide) => ({ title: guide.title, path: guide.path, category: guide.category })))};const materialAdvice={beginner:{high:{title:"Start with bamboo or wooden chopsticks",text:"You asked for more grip, so begin with bamboo or wood. They usually feel steadier than polished metal for first-time learning.",cta:"/best-chopsticks-for-beginners/"},balanced:{title:"Start with wooden or fiberglass chopsticks",text:"Balanced grip and moderate weight usually help beginners learn control without too much slipping.",cta:"/best-chopsticks-for-beginners/"},durable:{title:"Try textured fiberglass before smooth metal",text:"If durability matters, textured fiberglass is often easier than very smooth metal while still being reusable.",cta:"/materials/chopstick-material-compare/"}},home:{high:{title:"Choose bamboo or wood for daily home meals",text:"These materials often feel warmer and easier to control for repeated daily use.",cta:"/types-of-chopsticks/"},balanced:{title:"Wood or fiberglass are strong daily-use choices",text:"They balance comfort, control, and maintenance better than very decorative sets.",cta:"/types-of-chopsticks/"},durable:{title:"Metal or fiberglass fit durability-focused home use",text:"If cleaning and long-term reuse matter most, these materials are practical choices.",cta:"/materials/chopstick-material-compare/"}} ,gift:{high:{title:"Choose textured wooden gift sets",text:"If you want a nicer set without losing grip, wood is usually safer than very slick finishes.",cta:"/guides/bamboo-vs-wooden-vs-metal-chopsticks/"},balanced:{title:"Choose a balanced wood or fiberglass set",text:"This gives better control while still feeling more polished than basic training pairs.",cta:"/guides/bamboo-vs-wooden-vs-metal-chopsticks/"},durable:{title:"Metal gift sets work when durability matters most",text:"They look clean and last well, but are rarely the easiest first pair for complete beginners.",cta:"/guides/bamboo-vs-wooden-vs-metal-chopsticks/"}}};const starterAdvice={\"first-time\":{right:{title:\"Start with the basic how-to guide\",text:\"Use a simple right-hand grip and practice with large food pieces first. The lower stick should stay still.\",cta:\"/how-to-use-chopsticks/\"},left:{title:\"Start with the left-hand beginner path\",text:\"Use the same mechanics, but practice slowly and prioritize lower-stick stability before speed.\",cta:\"/guides/how-to-hold-chopsticks/\"}},\"hold-better\":{right:{title:\"Fix finger placement first\",text:\"Your next step is a grip correction guide, not more practice with hard foods. Stabilize the lower stick before anything else.\",cta:\"/guides/how-to-hold-chopsticks/\"},left:{title:\"Work on left-hand control and spacing\",text:\"Most left-handed learners improve once the lower stick stops collapsing toward the palm.\",cta:\"/guides/how-to-hold-chopsticks/\"}},\"eat-rice\":{right:{title:\"Move to the food-control guide\",text:\"Rice and noodles need a different rhythm from larger food pieces. Use smaller pickup motion and bring the bowl closer.\",cta:\"/guides/how-to-eat-rice-with-chopsticks/\"},left:{title:\"Practice food control with shorter motion\",text:\"For rice and noodles, tighten the movement range before trying to speed up.\",cta:\"/guides/how-to-eat-rice-with-chopsticks/\"}},\"buy-set\":{right:{title:\"Compare beginner-friendly materials first\",text:\"Before buying, check grip, weight, and surface texture. Material matters more than decoration at the start.\",cta:\"/best-chopsticks-for-beginners/\"},left:{title:\"Choose a grippier beginner set\",text:\"If you are learning left-handed, a pair with more surface grip usually reduces early frustration.\",cta:\"/best-chopsticks-for-beginners/\"}}};const etiquetteAdvice={casual:{title:\"Casual meal reminders\",items:[\"Rest chopsticks neatly when pausing.\",\"Do not wave them while talking.\",\"Avoid sticking them upright in food.\"]},restaurant:{title:\"Restaurant meal reminders\",items:[\"Use a chopstick rest if one is provided.\",\"Do not point chopsticks across the table.\",\"Keep them together when setting them down.\"]},formal:{title:\"Formal dinner reminders\",items:[\"Move slowly and place chopsticks neatly.\",\"Avoid passing food in awkward ways.\",\"If unsure, follow the host's table rhythm.\"]}};function htmlLink(path,label){return '<div class=\"result-actions\"><a class=\"button-link\" href=\"'+path+'\">'+label+'</a></div>'}document.querySelectorAll('[data-site-search]').forEach(form=>form.addEventListener('submit',event=>{event.preventDefault();const q=String(new FormData(form).get('q')||'').toLowerCase().trim();if(!q){location.href='/guides/';return}const direct=[{pattern:/etiquette|manners|rules/,path:'/chopstick-etiquette/'},{pattern:/beginner|hold|use|learn/,path:'/how-to-use-chopsticks/'},{pattern:/rice|noodle|ramen|sushi/,path:'/guides/how-to-eat-rice-with-chopsticks/'},{pattern:/bamboo|wood|metal|fiberglass|material/,path:'/materials/chopstick-material-compare/'},{pattern:/types|compare|vs/,path:'/types-of-chopsticks/'},{pattern:/rest|holder/,path:'/guides/chopstick-rest-guide/'},{pattern:/kid|training|child/,path:'/guides/training-chopsticks-for-kids/'}].find(item=>item.pattern.test(q));if(direct){location.href=direct.path;return}const match=guideTargets.find(item=>q.includes(item.title.toLowerCase().replace(/[^a-z0-9]+/g,' '))||item.title.toLowerCase().split(' ').some(word=>word.length>3&&q.includes(word)));location.href=match?match.path:'/guides/';}));document.querySelectorAll('[data-guide-filter]').forEach(button=>button.addEventListener('click',()=>{document.querySelectorAll('[data-guide-filter]').forEach(item=>item.classList.remove('is-active'));button.classList.add('is-active');const value=button.dataset.guideFilter;document.querySelectorAll('[data-guide-card]').forEach(card=>{card.hidden=value!=='all'&&card.dataset.guideCategory!==value;});}));document.querySelectorAll('[data-starter-form]').forEach(form=>form.addEventListener('submit',event=>{event.preventDefault();const data=new FormData(form);const result=starterAdvice[data.get('goal')][data.get('hand')];const box=form.parentElement.querySelector('[data-starter-result]');box.hidden=false;box.innerHTML='<h3>'+result.title+'</h3><p>'+result.text+'</p>'+htmlLink(result.cta,'Open the guide');}));document.querySelectorAll('[data-material-form]').forEach(form=>form.addEventListener('submit',event=>{event.preventDefault();const data=new FormData(form);const result=materialAdvice[data.get('use')][data.get('grip')];const box=form.parentElement.querySelector('[data-material-result]');box.hidden=false;box.innerHTML='<h3>'+result.title+'</h3><p>'+result.text+'</p>'+htmlLink(result.cta,'Compare materials');}));document.querySelectorAll('[data-etiquette-form]').forEach(form=>form.addEventListener('submit',event=>{event.preventDefault();const data=new FormData(form);const result=etiquetteAdvice[data.get('setting')];const box=form.parentElement.querySelector('[data-etiquette-result]');box.hidden=false;box.innerHTML='<h3>'+result.title+'</h3><ul class=\"article-list\">'+result.items.map(item=>'<li>'+item+'</li>').join('')+'</ul>'+htmlLink('/chopstick-etiquette/','Read etiquette guide');}));`;
}

function css() {
  return `:root{--ink:#221d18;--muted:#62594e;--paper:#f7f2ea;--panel:#fffdfa;--line:#e3d6c7;--red:#a63d2d;--red-dark:#873123;--gold:#b88c4a;--jade:#2c6c63;--blue:#2f4f63;--shadow:0 10px 28px rgba(47,37,23,.08)}*{box-sizing:border-box}body{margin:0;font-family:Inter,Segoe UI,Arial,sans-serif;color:var(--ink);background:var(--paper);font-size:16px;line-height:1.62}a{color:inherit}.site-header{position:sticky;top:0;z-index:10;display:flex;align-items:center;justify-content:space-between;gap:24px;padding:13px clamp(18px,4vw,52px);background:rgba(247,242,234,.96);backdrop-filter:blur(12px);border-bottom:1px solid var(--line)}.brand{display:flex;align-items:center;gap:10px;text-decoration:none;font-size:17px;font-weight:780;white-space:nowrap}.brand-logo{display:block;width:34px;height:34px;border-radius:8px;box-shadow:0 8px 18px rgba(166,61,45,.18)}.nav{display:flex;align-items:center;justify-content:flex-end;gap:18px;flex-wrap:wrap}.nav a{text-decoration:none;color:#554d45;font-size:15px;font-weight:720;line-height:1.2;padding:4px 0}.nav a:hover{color:var(--red)}main{min-height:70vh}.page-hero{padding:28px clamp(18px,4vw,52px) 16px;max-width:1160px;margin:auto}.page-hero h1{font-family:Georgia,serif;font-size:clamp(31px,3.6vw,46px);line-height:1.08;margin:9px 0 10px;color:#211b17}.intro{font-size:16px;max-width:760px;color:var(--muted)}.eyebrow{display:inline-flex;align-items:center;min-height:28px;padding:0 11px;border-radius:999px;background:rgba(44,108,99,.08);border:1px solid rgba(44,108,99,.18);text-transform:uppercase;letter-spacing:.05em;color:var(--jade);font-size:12px;line-height:1;font-weight:780;margin:0}.hero-grid,.content-section{max-width:1160px;margin:0 auto 22px;padding:0 clamp(18px,4vw,52px)}.hero-grid{display:grid;grid-template-columns:minmax(0,1.05fr) minmax(300px,.95fr);gap:22px;align-items:stretch}.tool-page{max-width:820px;margin:0 auto 22px;padding:0 clamp(18px,4vw,40px)}.tool-page .tool-panel{max-width:720px;margin:0 auto;padding:20px 22px}.tool-strip{display:grid;grid-template-columns:1fr 1fr;gap:18px;background:transparent!important;border:0!important;box-shadow:none!important}.tool-panel,.visual-panel,.content-section:not(.split),.fact-card{background:var(--panel);border:1px solid var(--line);box-shadow:var(--shadow);border-radius:8px}.tool-panel{padding:22px;border-top:4px solid var(--red)}.compact-tool{height:auto}.tool-copy h2,.section-heading h2,.content-section h2{font-family:Georgia,serif;font-size:clamp(22px,2.2vw,27px);line-height:1.18;margin:8px 0 10px;color:#241f1a}.tool-page .tool-copy h2{font-size:25px}.tool-copy p{max-width:640px}.content-section p{max-width:820px}.calculator-form{display:grid;grid-template-columns:minmax(220px,1fr) auto;gap:12px;align-items:end;margin-top:16px;max-width:560px}.tool-page .calculator-form{max-width:100%}.match-form{grid-template-columns:1fr 1fr;max-width:100%}.match-form button{grid-column:1/-1;width:100%}.calculator-form label{display:grid;gap:7px;font-size:14px;font-weight:720}.calculator-form input,.calculator-form select{height:43px;border:1px solid var(--line);border-radius:8px;padding:0 12px;font:inherit;background:#fff;width:100%;min-width:0}.calculator-form button,.button-link{min-height:43px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:8px;background:var(--red);color:#fff;font-size:14px;font-weight:780;text-decoration:none;padding:0 15px;cursor:pointer;white-space:nowrap}.button-link.secondary{background:#f2eadf;color:#3a3028;border:1px solid #dfd1bd}.calculator-form button:hover,.button-link:hover{background:var(--red-dark);color:#fff}.result-card{margin-top:16px;padding:16px;border-left:4px solid var(--jade);background:#eff7f3;border-radius:8px}.result-card h3{margin:0 0 10px;font-size:20px}.result-actions{display:flex;gap:10px;flex-wrap:wrap;margin-top:12px}.note{color:var(--muted);font-size:14px}.visual-panel{position:relative;margin:0;display:grid;place-items:center;overflow:hidden;background:linear-gradient(145deg,#fffaf0,#f1eadb);padding:18px}.visual-panel::before{content:"";position:absolute;inset:14px;border:1px solid rgba(166,61,45,.14);border-radius:8px;background:repeating-radial-gradient(circle at 50% 50%,rgba(184,140,74,.12) 0 1px,transparent 1px 22px);pointer-events:none}.visual-panel img{position:relative;width:92%;height:92%;object-fit:contain;filter:drop-shadow(0 18px 28px rgba(80,50,25,.12))}.ad-slot{max-width:1056px;margin:0 auto 22px;border:1px dashed #d7c8b5;background:#fffaf1;color:#8a7257;border-radius:8px;min-height:70px;display:grid;place-items:center;font-size:13px;font-weight:720}.section-heading{margin-bottom:14px}.fact-grid,.animal-grid,.step-grid,.guide-grid,.pair-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:14px}.guide-grid.compact{grid-template-columns:repeat(2,minmax(0,1fr))}.fact-grid div,.animal-card,.step-grid div,.guide-card,.pair-card{background:#fff;border:1px solid var(--line);border-radius:8px;padding:16px}.step-grid span{display:grid;place-items:center;width:30px;height:30px;border-radius:50%;background:#edf5f2;color:var(--jade);font-weight:900;margin-bottom:8px}.step-grid strong,.fact-card strong{display:block;font-size:17px}.step-grid p,.fact-card span{margin:6px 0 0;color:var(--muted);font-size:15px}.animal-card{text-decoration:none;min-height:168px;display:grid;gap:7px;position:relative;grid-template-columns:44px minmax(0,1fr);grid-template-rows:auto auto 1fr;column-gap:16px;row-gap:6px;padding:20px 22px;overflow:hidden;isolation:isolate}.animal-card::after{content:"";position:absolute;right:-42px;bottom:-46px;z-index:0;width:90px;height:90px;border-radius:50%;background:rgba(184,140,74,.08);opacity:.26}.animal-card strong,.animal-card p,.animal-card>span{position:relative;z-index:1}.animal-card strong{grid-column:2;grid-row:1;padding-right:34px;margin-top:1px;color:#12100e;font-size:18px;font-weight:740}.animal-card>span:not(.animal-order):not(.animal-seal){grid-column:2;grid-row:2;color:#4d463f;font-size:14px}.animal-card p{grid-column:2;grid-row:3;margin-top:8px;color:var(--muted)}.animal-seal{position:relative!important;left:auto;top:auto;grid-column:1;grid-row:1/3;align-self:start;display:grid;place-items:center;width:44px;height:44px;border-radius:12px;background:#fff2e7;border:1px solid rgba(166,61,45,.24);color:var(--red);font-family:Georgia,serif;font-size:22px;font-weight:850;line-height:1;box-shadow:0 8px 16px rgba(60,40,20,.08)}.type-seal{font-size:18px}.animal-order{position:absolute!important;right:18px;top:18px;z-index:2;color:#4f463d;font-size:13px;font-weight:760}.guide-card{text-decoration:none;display:grid;gap:8px;min-height:172px;background:linear-gradient(180deg,#fffefa,#fffaf2)}.guide-card span{font-size:12px;color:var(--jade);font-weight:780;text-transform:uppercase;letter-spacing:.05em}.guide-card strong{font-size:18px;font-weight:740}.guide-card p{margin:0;color:var(--muted)}.guide-filter-nav{display:flex;flex-wrap:wrap;gap:10px;margin-bottom:18px}.guide-filter-nav button{border:1px solid var(--line);background:#fff;border-radius:999px;min-height:37px;padding:0 14px;font:inherit;font-weight:720;color:#4f463d;cursor:pointer}.guide-filter-nav button.is-active,.guide-filter-nav button:hover{background:#f3ebe0;border-color:#d6b57d;color:#352b22}.section-action{display:flex;justify-content:flex-start;margin-top:16px}.split{display:grid;grid-template-columns:1fr 1fr;gap:22px}.split>div{background:var(--panel);border:1px solid var(--line);box-shadow:var(--shadow);border-radius:8px;padding:22px}.fact-card{display:grid;gap:8px}.fact-card strong{font-size:20px}.fact-card span{display:block;color:var(--muted)}.table-wrap{overflow:auto}.content-section table{width:100%;border-collapse:collapse;background:#fff;font-size:15px}.content-section th,.content-section td{padding:10px 12px;border-bottom:1px solid var(--line);text-align:left}.content-section th{background:#f1eadc;color:#352b22}.article-shell{max-width:1160px;margin:0 auto 22px;padding:0 clamp(18px,4vw,52px);display:grid;grid-template-columns:minmax(0,.96fr) minmax(270px,.44fr);gap:22px;align-items:start}.article-main{min-width:0}.article-sidebar{display:grid;gap:18px;position:sticky;top:92px}.sidebar-card{background:var(--panel);border:1px solid var(--line);box-shadow:var(--shadow);border-radius:8px;padding:18px}.sidebar-card.compact{display:grid;gap:12px}.sidebar-link-list{display:grid;gap:12px}.sidebar-link-list a{text-decoration:none;display:grid;gap:4px;padding-bottom:12px;border-bottom:1px solid #ece2d4}.sidebar-link-list a:last-child{padding-bottom:0;border-bottom:0}.sidebar-link-list strong{font-size:15px}.sidebar-link-list span{font-size:14px;color:var(--muted)}.article-search{display:grid;grid-template-columns:minmax(260px,.9fr) minmax(300px,1.1fr);gap:22px;align-items:end}.article-search h2{margin-bottom:0}.site-search-form{display:grid;grid-template-columns:minmax(220px,1fr) auto;gap:12px;align-items:end}.site-search-form label{display:grid;gap:7px;font-size:14px;font-weight:720}.site-search-form input{height:43px;border:1px solid var(--line);border-radius:8px;padding:0 12px;font:inherit;background:#fff;width:100%;min-width:0}.site-search-form button{min-height:43px;display:inline-flex;align-items:center;justify-content:center;border:0;border-radius:8px;background:var(--jade);color:#fff;font-size:14px;font-weight:780;padding:0 16px;cursor:pointer;white-space:nowrap}.site-search-form button:hover{background:#24594f}.article-body{background:transparent!important;border:0!important;box-shadow:none!important;padding-top:0;padding-bottom:0}.lead-answer{font-size:18px;line-height:1.72;color:#302820}.article-list{margin:0;padding-left:22px}.article-list li{margin-bottom:10px}.article-figure{display:grid;gap:12px}.article-figure img{width:100%;border-radius:8px;border:1px solid var(--line);background:#fff}.article-figure figcaption{display:grid;gap:4px;color:var(--muted)}.faq-list h2{margin-bottom:18px}.faq-categories{display:grid;gap:12px}.faq-category{background:#fff;border:1px solid var(--line);border-radius:8px;overflow:hidden}.faq-category summary{display:flex;align-items:center;justify-content:space-between;gap:18px;padding:15px 18px;cursor:pointer;font-weight:780;color:#2f2922;background:#fbf7ef}.faq-category summary::marker{color:var(--jade)}.faq-category summary small{color:var(--muted);font-size:13px;font-weight:720;white-space:nowrap}.faq-grid{display:grid;gap:12px;border-top:1px solid var(--line);padding:16px 18px 18px;background:#fffdf9}.faq-item{display:grid;grid-template-columns:minmax(260px,.36fr) minmax(0,.64fr);gap:0;overflow:hidden;border:1px solid #e6dac8;border-radius:8px;background:#fff;box-shadow:0 6px 16px rgba(47,37,23,.04)}.faq-item h3{display:flex;align-items:center;margin:0;padding:18px 20px;background:#f5efe5;border-right:1px solid #e2d4c0;font-size:16px;line-height:1.38;color:#211b17}.faq-item p{margin:0;padding:18px 20px;color:var(--muted);max-width:none;border-left:4px solid rgba(44,108,99,.2);background:#fff}.site-footer{display:grid;grid-template-columns:minmax(260px,1.15fr) minmax(420px,.85fr);align-items:start;margin-top:44px;padding:34px clamp(18px,4vw,52px);background:#24201b;color:#fffaf0;gap:28px}.footer-about strong{display:block;font-size:18px;margin-bottom:10px}.footer-about p{margin:0;color:#d7cbbd;line-height:1.72;font-size:14px}.footer-nav{display:grid!important;grid-template-columns:repeat(3,minmax(110px,1fr));gap:24px!important;align-items:start!important}.footer-nav div{display:grid;gap:8px}.footer-nav span{color:#bfae98;font-size:12px;font-weight:780;text-transform:uppercase;letter-spacing:.06em}.footer-nav a{text-decoration:none;font-size:14px;color:#fffaf0}.footer-nav a:hover{text-decoration:underline}.report-hero,.report-rules,.seo-table{background:#fff;border:1px solid var(--line);border-radius:8px;box-shadow:var(--shadow)}.report-hero,.report-rules{padding:22px}.report-summary{display:grid;grid-template-columns:repeat(5,minmax(0,1fr));gap:12px;margin-top:16px}.report-summary div{background:#fbf7ef;border:1px solid var(--line);border-radius:8px;padding:12px}.report-summary strong{display:block;font-size:24px}.report-summary span{color:var(--muted)}body:not(.page-home):not(.page-guides):not(.seo-report-page) .tool-page,body:not(.page-home):not(.page-guides):not(.seo-report-page) .article-body,body:not(.page-home):not(.page-guides):not(.seo-report-page) .article-search,body:not(.page-home):not(.page-guides):not(.seo-report-page) .content-section{max-width:980px;margin-left:auto;margin-right:auto}@media(max-width:980px){.tool-strip{grid-template-columns:1fr}.pair-grid,.guide-grid,.fact-grid,.animal-grid,.step-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.article-shell{grid-template-columns:1fr}.article-sidebar{position:static}}@media(max-width:820px){body{font-size:15px}.site-header{align-items:flex-start;flex-direction:column}.nav{justify-content:flex-start;gap:14px}.nav a{font-size:14px}.hero-grid,.split{grid-template-columns:1fr}.tool-page{max-width:100%;padding:0 16px}.tool-page .tool-panel{max-width:100%;padding:18px}.calculator-form,.match-form,.site-search-form,.article-search{grid-template-columns:1fr}.fact-grid,.animal-grid,.step-grid,.guide-grid,.guide-grid.compact,.report-summary{grid-template-columns:1fr}.page-hero{padding-top:24px}.page-hero h1{font-size:31px}.intro{font-size:16px}.faq-category summary{align-items:flex-start;flex-direction:column;gap:4px}.faq-grid{padding:12px}.faq-item{grid-template-columns:1fr}.faq-item h3{border-right:0;border-bottom:1px solid #e2d4c0}.faq-item p{border-left:0;border-top:4px solid rgba(44,108,99,.16)}.site-footer{grid-template-columns:1fr}.footer-nav{grid-template-columns:1fr 1fr!important}}`;
}

function themeCss() {
  return `
body{background-color:#f4eadc;background-image:linear-gradient(180deg,#271b12 0 390px,#f4eadc 391px 100%)}
body::before{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;background:radial-gradient(circle at 18% 4%,rgba(205,153,82,.28),transparent 28%),radial-gradient(circle at 88% 8%,rgba(130,79,35,.34),transparent 26%),linear-gradient(115deg,rgba(255,255,255,.035) 0 1px,transparent 1px 46px);opacity:.92}
.site-header{background:rgba(34,23,15,.88);border-bottom:1px solid rgba(225,196,154,.22);box-shadow:0 12px 28px rgba(20,12,6,.18)}
.brand{color:#fff8ec}
.brand-logo{box-shadow:0 10px 22px rgba(0,0,0,.24)}
.nav a{color:#e6d6bf}
.nav a:hover{color:#f4c879}
.page-home .page-hero{position:relative;min-height:260px;display:grid;align-content:center;padding-top:34px;padding-bottom:22px;color:#fff8ec;overflow:hidden}
.page-home .page-hero::after{content:"\\7BB8";position:absolute;right:clamp(22px,7vw,90px);top:16px;color:rgba(244,200,121,.12);font-family:Georgia,serif;font-size:clamp(82px,13vw,158px);font-weight:900;line-height:1;pointer-events:none}
.page-home .page-hero h1{position:relative;z-index:1;color:#fff8ec;font-size:clamp(42px,6vw,72px);text-shadow:0 20px 42px rgba(0,0,0,.32)}
.page-home .intro{color:#e3d3bf;max-width:700px}
.page-hero h1{color:#2d2319}
.tool-panel{border-top-color:#8b5727;background:linear-gradient(180deg,#fffdf8,#fbf2e5)}
.button-link,.calculator-form button{background:#7a431c;box-shadow:0 10px 18px rgba(88,45,18,.16)}
.button-link:hover,.calculator-form button:hover{background:#5a2e12}
.eyebrow{background:rgba(196,142,70,.16);border-color:rgba(196,142,70,.34);color:#d8ad69}
.page-home .eyebrow{background:rgba(255,242,211,.1);border-color:rgba(255,224,168,.28);color:#f1c879}
.visual-panel{background:linear-gradient(145deg,#352114,#1f1510)}
.visual-panel::before{border-color:rgba(235,195,126,.18);background:linear-gradient(125deg,rgba(255,255,255,.035),transparent 34%),repeating-linear-gradient(35deg,rgba(212,157,82,.13) 0 2px,transparent 2px 38px)}
.visual-panel img{filter:drop-shadow(0 22px 34px rgba(0,0,0,.28))}
.animal-seal{background:#f2dfbc;border-color:#c39a5c;color:#754116;border-radius:8px}
.animal-card::after{background:rgba(123,79,42,.1);border-radius:8px;transform:rotate(-34deg);right:-26px;bottom:-22px}
.guide-card{background:linear-gradient(180deg,#fffdf7,#f7eddb)}
.guide-card span{color:#7a431c}
.site-footer{background:#20150f}
.product-hero{max-width:1160px;margin:0 auto 18px;padding:0 clamp(18px,4vw,52px);display:grid;grid-template-columns:minmax(360px,.86fr) minmax(340px,1.14fr);gap:24px;align-items:stretch}
.product-tool{display:flex;flex-direction:column;justify-content:center;min-height:430px;padding:30px;border:1px solid rgba(226,195,151,.58);border-left:5px solid #b77a32;border-top:0;background:linear-gradient(180deg,#fffdf8,#f7ead7);box-shadow:0 24px 60px rgba(12,7,3,.26)}
.product-tool .tool-copy h2{font-size:clamp(28px,3vw,38px);line-height:1.08;max-width:520px}
.product-tool .tool-copy p{font-size:15px;color:#5d4b3b;max-width:480px}
.product-tool .calculator-form{margin-top:22px}
.product-visual{min-height:430px;border-color:rgba(226,195,151,.28);box-shadow:0 24px 60px rgba(12,7,3,.28)}
.product-visual::after{content:"\\98DF\\793C";position:absolute;right:24px;bottom:18px;color:rgba(244,200,121,.18);font-family:Georgia,serif;font-size:44px;font-weight:900;letter-spacing:.12em;pointer-events:none}
.product-actions{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:12px;background:transparent!important;border:0!important;box-shadow:none!important;padding-top:0}
.product-actions a{display:grid;gap:6px;min-height:118px;padding:16px;border:1px solid rgba(231,200,151,.42);border-radius:8px;background:rgba(255,253,247,.94);text-decoration:none;box-shadow:0 14px 30px rgba(12,7,3,.18)}
.product-actions a:hover{border-color:#c8954c;background:#fff8e8;transform:translateY(-1px)}
.product-actions span{color:#7a431c;font-size:12px;font-weight:900;letter-spacing:.08em}
.product-actions strong{font-size:17px;color:#2d2319}
.product-actions small{color:#6b5d4e;font-size:13px;line-height:1.45}
.product-showcase{background:linear-gradient(180deg,#fffdf8,#fbf1e2)!important}
@media(max-width:980px){.product-hero{grid-template-columns:1fr}.product-visual{order:-1;min-height:330px}.product-tool{min-height:auto}.product-actions{grid-template-columns:repeat(2,minmax(0,1fr))}}
@media(max-width:640px){.product-actions{grid-template-columns:1fr}.product-visual{min-height:270px}.product-tool{padding:22px}.product-tool .tool-copy h2{font-size:28px}}

body{background-color:#f3eddf;background-image:linear-gradient(180deg,#e6dcc5 0 390px,#f3eddf 391px 100%)}
body::before{content:"";position:fixed;inset:0;z-index:-1;pointer-events:none;background:radial-gradient(circle at 14% 4%,rgba(117,144,95,.22),transparent 28%),radial-gradient(circle at 88% 8%,rgba(202,166,91,.18),transparent 26%),linear-gradient(110deg,rgba(255,255,255,.42) 0 1px,transparent 1px 54px);opacity:.95}
.site-header{background:rgba(73,91,55,.9);border-bottom:1px solid rgba(244,229,185,.36);box-shadow:0 12px 28px rgba(54,61,38,.15)}
.brand{color:#fffaf0}
.nav a{color:#fff2d8}
.nav a:hover{color:#f5cf79}
.page-home .page-hero{color:#2d2c1f}
.page-home .page-hero::after{content:"\\7AF9";color:rgba(92,115,64,.12)}
.page-home .page-hero h1{color:#26301f;text-shadow:none}
.page-home .intro{color:#4b4a3a;max-width:740px}
.page-home .eyebrow{background:rgba(255,250,237,.62);border-color:rgba(119,142,78,.34);color:#5d733f}
.eyebrow{background:rgba(110,132,76,.1);border-color:rgba(110,132,76,.26);color:#5d733f}
.tool-panel{border-top-color:#7d8b4b;background:linear-gradient(180deg,#fffdf7,#f5ebd6);box-shadow:0 22px 48px rgba(105,82,43,.16)}
.button-link,.calculator-form button{background:#7d5529;box-shadow:0 10px 18px rgba(114,78,34,.16)}
.button-link:hover,.calculator-form button:hover{background:#5d3e1d}
.visual-panel{background:linear-gradient(145deg,#f8f0dc,#e1d0aa);border-color:rgba(137,150,83,.32)}
.visual-panel::before{border-color:rgba(116,137,78,.2);background:linear-gradient(125deg,rgba(255,255,255,.35),transparent 34%),repeating-linear-gradient(35deg,rgba(116,137,78,.12) 0 2px,transparent 2px 38px)}
.visual-panel img{filter:drop-shadow(0 20px 30px rgba(105,82,43,.18))}
.product-visual{border-color:rgba(137,150,83,.38);box-shadow:0 22px 54px rgba(105,82,43,.16)}
.product-visual::after{content:"\\7AF9\\7BB8";color:rgba(93,115,63,.16)}
.product-tool{border:1px solid rgba(196,177,126,.64);border-left:5px solid #8a9a54;border-top:0;background:linear-gradient(180deg,#fffdf8,#f3ead5);box-shadow:0 22px 54px rgba(105,82,43,.16)}
.product-actions a{border-color:rgba(184,170,119,.5);background:rgba(255,253,247,.94);box-shadow:0 12px 26px rgba(105,82,43,.11)}
.product-actions a:hover{border-color:#8a9a54;background:#fffbea}
.product-actions span,.guide-card span{color:#6c7f45}
.animal-seal{background:#edf0d8;border-color:#bac37e;color:#596b3b}
.animal-card::after{background:rgba(108,127,69,.1);border-radius:50%;transform:none}
.site-footer{background:#313c29}
.product-intro-card{justify-content:center}
.hero-product-links{display:flex;flex-wrap:wrap;gap:12px;margin-top:22px}
.product-category-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.product-category-card{position:relative;display:grid;align-content:start;gap:10px;min-height:198px;padding:20px;border:1px solid rgba(184,170,119,.48);border-radius:8px;background:#fffdf7;text-decoration:none;overflow:hidden;box-shadow:0 14px 30px rgba(105,82,43,.08)}
.product-category-card::after{content:"";position:absolute;right:-38px;bottom:-44px;width:118px;height:118px;border-radius:50%;background:rgba(108,127,69,.12)}
.product-category-card span,.product-category-card strong,.product-category-card p{position:relative;z-index:1}
.product-category-card em{position:relative;z-index:1;align-self:end;justify-self:start;margin-top:8px;padding:7px 10px;border-radius:999px;background:rgba(255,255,255,.58);border:1px solid rgba(108,127,69,.24);color:#526b3a;font-style:normal;font-size:13px;font-weight:800}
.product-category-card span{font-size:12px;font-weight:820;letter-spacing:.06em;text-transform:uppercase;color:#6c7f45}
.product-category-card strong{font-family:Georgia,serif;font-size:22px;line-height:1.12;color:#242318}
.product-category-card p{margin:0;color:#5d5548;line-height:1.58}
.product-category-card:hover{transform:translateY(-1px);box-shadow:0 18px 38px rgba(105,82,43,.12)}
.tone-bamboo{background:linear-gradient(180deg,#fbfff0,#eef3d6);border-color:#b9c981}
.tone-bamboo::after{background:#c9d797}
.tone-wood{background:linear-gradient(180deg,#fff8ec,#f1dfc3);border-color:#c79b61}
.tone-wood::after{background:#c9864a}
.tone-metal{background:linear-gradient(180deg,#fbfbf7,#e7e5db);border-color:#b9b7a9}
.tone-metal::after{background:#b9b7a9}
.tone-training{background:linear-gradient(180deg,#fff8ec,#f6e6d8);border-color:#d3a077}
.tone-training::after{background:#d6a077}
.tone-rest{background:linear-gradient(180deg,#fbfff7,#e8f0dd);border-color:#9db18a}
.tone-rest::after{background:#9db18a}
.tone-gift{background:linear-gradient(180deg,#fff8f0,#f4e0d3);border-color:#bd6c54}
.tone-gift::after{background:#bd6c54}
.type-card{grid-template-columns:56px minmax(0,1fr);grid-template-rows:auto auto auto;align-items:start;column-gap:18px;row-gap:8px;padding:24px 24px 28px;min-height:220px}
.type-card .animal-seal{grid-column:1;grid-row:1 / 3;width:54px;height:54px}
.type-card .animal-order{position:static!important;grid-column:2;grid-row:1;align-self:start;justify-self:start;max-width:100%;padding:5px 10px;border-radius:999px;background:rgba(255,255,255,.68);border:1px solid rgba(108,127,69,.24);color:#526b3a;font-size:12px;line-height:1.25;white-space:normal}
.type-card strong{grid-column:2;grid-row:2;padding-right:0!important;margin-top:0;font-size:21px;line-height:1.16}
.type-card>span:not(.animal-order):not(.animal-seal){grid-column:1 / -1;grid-row:3;margin-top:8px;color:#4d463f;font-size:16px;line-height:1.45}
.type-card p{grid-column:1 / -1;grid-row:auto;margin-top:8px;line-height:1.62}
.best-pick-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.best-pick-card{display:grid;grid-template-columns:auto minmax(0,1fr) auto;align-items:center;gap:16px;padding:18px;border:1px solid rgba(184,170,119,.5);border-radius:8px;background:linear-gradient(180deg,#fffdf8,#f4ebd8);box-shadow:0 12px 26px rgba(105,82,43,.08)}
.pick-rank{display:grid;place-items:center;width:46px;height:46px;border-radius:50%;background:#566d3d;color:#fff7e5;font-weight:850}
.best-pick-card strong{display:block;font-family:Georgia,serif;font-size:20px;line-height:1.18;color:#242318}
.best-pick-card p{margin:5px 0 0;color:#5d5548;max-width:none}
.affiliate-note{margin:16px 0 0;color:#6d6254;font-size:14px}
.embedded-tool{border-left:5px solid #8a9a54;border-top:0;max-width:900px;box-shadow:0 14px 30px rgba(105,82,43,.1)}
.embedded-tool h3{font-family:Georgia,serif;font-size:clamp(24px,2.2vw,32px);line-height:1.12;margin:8px 0 10px;color:#242318}
body:not(.page-home):not(.page-guides):not(.seo-report-page){background:#f3eddf}
body:not(.page-home):not(.page-guides):not(.seo-report-page) .page-hero{max-width:1180px;padding-top:42px;padding-bottom:24px}
body:not(.page-home):not(.page-guides):not(.seo-report-page) .page-hero h1{color:#26301f;text-shadow:none}
body:not(.page-home):not(.page-guides):not(.seo-report-page) .page-hero .intro{max-width:820px;color:#4d4b3d;font-size:17px;line-height:1.68}
body:not(.page-home):not(.page-guides):not(.seo-report-page) .page-hero .eyebrow{background:rgba(110,132,76,.1);border-color:rgba(110,132,76,.26);color:#5d733f}
body:not(.page-home):not(.page-guides):not(.seo-report-page) .article-shell{max-width:1180px;gap:34px;margin-bottom:38px}
body:not(.page-home):not(.page-guides):not(.seo-report-page) .article-main{display:grid;gap:24px;min-width:0}
body:not(.page-home):not(.page-guides):not(.seo-report-page) .article-main>.content-section{width:100%;max-width:none!important;margin:0!important;padding:34px 40px!important;border-radius:10px;background:rgba(255,253,247,.96)!important;border:1px solid rgba(184,170,119,.5)!important;box-shadow:0 16px 38px rgba(105,82,43,.08)!important}
body:not(.page-home):not(.page-guides):not(.seo-report-page) .article-main>.article-body{background:#fffdf7!important}
body:not(.page-home):not(.page-guides):not(.seo-report-page) .article-body p{max-width:none;margin:0 0 15px;color:#3d342b}
body:not(.page-home):not(.page-guides):not(.seo-report-page) .article-body p:last-child{margin-bottom:0}
body:not(.page-home):not(.page-guides):not(.seo-report-page) .lead-answer{font-size:17px;line-height:1.78;color:#2f2b20}
body:not(.page-home):not(.page-guides):not(.seo-report-page) .article-list li{color:#3d342b}
body:not(.page-home):not(.page-guides):not(.seo-report-page) .article-main>.split{padding:0!important;background:transparent!important;border:0!important;box-shadow:none!important;gap:18px}
body:not(.page-home):not(.page-guides):not(.seo-report-page) .split>div,body:not(.page-home):not(.page-guides):not(.seo-report-page) .sidebar-card{background:#fffdf7;border-color:rgba(184,170,119,.5);color:#2f2b20;box-shadow:0 14px 32px rgba(105,82,43,.08)}
body:not(.page-home):not(.page-guides):not(.seo-report-page) .split>div{padding:24px}
body:not(.page-home):not(.page-guides):not(.seo-report-page) .fact-card span,body:not(.page-home):not(.page-guides):not(.seo-report-page) .sidebar-link-list span{color:#62594e}
body:not(.page-home):not(.page-guides):not(.seo-report-page) .article-search{align-items:center}
body:not(.page-home):not(.page-guides):not(.seo-report-page) .article-search h2{color:#242318}
body:not(.page-home):not(.page-guides):not(.seo-report-page) .article-sidebar{gap:22px;top:104px}
body:not(.page-home):not(.page-guides):not(.seo-report-page) .sidebar-card{padding:22px}
body:not(.page-home):not(.page-guides):not(.seo-report-page) .sidebar-card h2{margin:8px 0 16px;color:#242318;font-size:23px}
body:not(.page-home):not(.page-guides):not(.seo-report-page) .sidebar-link-list{gap:14px}
body:not(.page-home):not(.page-guides):not(.seo-report-page) .sidebar-link-list a{padding:0 0 14px;border-bottom-color:#e6dac8}
.page-guides .content-section:not(.article-search){padding:34px clamp(34px,4.8vw,64px)!important}
.page-guides .section-heading{margin-bottom:20px}
.page-guides .article-search{grid-template-columns:minmax(420px,1.1fr) minmax(420px,.9fr);gap:42px;align-items:center!important;padding:34px clamp(34px,4.8vw,64px)!important}
.page-guides .article-search h2{font-size:clamp(28px,2.7vw,36px);line-height:1.12;margin-top:12px!important}
.page-guides .site-search-form{max-width:650px;justify-self:start}
.page-guides .guide-card{padding:22px 24px;gap:10px}
body:not(.page-guides) .article-search{grid-template-columns:1fr;gap:20px;align-items:start!important;padding:28px 32px!important;overflow:hidden}
body:not(.page-guides) .article-search h2{font-size:clamp(27px,2.5vw,34px);line-height:1.1;margin-top:10px!important;white-space:nowrap}
.site-search-form{grid-template-columns:minmax(0,1fr) minmax(96px,auto);gap:16px}
.site-search-form label{gap:9px;color:#302820}
.site-search-form input{height:54px;border-radius:9px;padding:0 16px;background:#fffdf9}
.site-search-form button{min-height:54px;border-radius:9px;padding:0 24px;font-size:15px}
body:not(.page-home):not(.page-guides):not(.seo-report-page) .article-main>.content-section .eyebrow{margin-bottom:16px}
body:not(.page-home):not(.page-guides):not(.seo-report-page) .article-main>.content-section h2{margin-top:0;margin-bottom:22px}
body:not(.page-home):not(.page-guides):not(.seo-report-page) .table-wrap{margin-top:12px;border:1px solid rgba(184,170,119,.62);border-radius:8px;overflow:auto;background:#fffdf8;box-shadow:0 10px 24px rgba(105,82,43,.06)}
body:not(.page-home):not(.page-guides):not(.seo-report-page) .content-section table{border-collapse:separate;border-spacing:0;background:#fffdf8}
body:not(.page-home):not(.page-guides):not(.seo-report-page) .content-section th,body:not(.page-home):not(.page-guides):not(.seo-report-page) .content-section td{padding:15px 18px;border-right:1px solid rgba(184,170,119,.44);border-bottom:1px solid rgba(184,170,119,.44);vertical-align:top}
body:not(.page-home):not(.page-guides):not(.seo-report-page) .content-section th:last-child,body:not(.page-home):not(.page-guides):not(.seo-report-page) .content-section td:last-child{border-right:0}
body:not(.page-home):not(.page-guides):not(.seo-report-page) .content-section tbody tr:nth-child(even) td{background:#fbf5e8}
body:not(.page-home):not(.page-guides):not(.seo-report-page) .content-section tbody tr:last-child td{border-bottom:0}
@media(max-width:980px){.product-category-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.best-pick-grid{grid-template-columns:1fr}.best-pick-card{grid-template-columns:auto minmax(0,1fr)}.best-pick-card .button-link{grid-column:2;justify-self:start}body:not(.page-guides) .article-search h2{white-space:normal}.page-guides .article-search{grid-template-columns:1fr}}
@media(max-width:640px){.hero-product-links{display:grid}.product-category-grid{grid-template-columns:1fr}.best-pick-card{grid-template-columns:1fr}.best-pick-card .button-link{grid-column:auto}.pick-rank{width:40px;height:40px}.article-search{padding:22px!important;gap:18px}.site-search-form{grid-template-columns:1fr}.site-search-form button{width:100%}.page-guides .content-section:not(.article-search){padding:24px!important}.page-guides .guide-card{padding:20px!important}body:not(.page-home):not(.page-guides):not(.seo-report-page) .article-main>.content-section{padding:24px!important}body:not(.page-home):not(.page-guides):not(.seo-report-page) .article-shell{gap:22px}}

/* Commerce homepage refinement: product-first layout, lighter bamboo palette, and visual anchors. */
.page-home{background:#f1eadb;color:#25231b}
.page-home *{min-width:0}
.page-home img{display:block;max-width:100%;height:auto}
.page-home main>.page-hero{display:none}
.commerce-hero{
  position:relative;
  max-width:none;
  margin:0;
  padding:34px clamp(18px,5vw,40px) 38px;
  display:grid;
  grid-template-columns:minmax(0,1fr);
  gap:24px;
  align-items:center;
  background:
    radial-gradient(circle at 14% 14%,rgba(255,255,255,.58),transparent 28%),
    linear-gradient(135deg,#edf0d5 0%,#fff7df 46%,#d5c091 100%);
  overflow:hidden;
}
.commerce-copy,.commerce-showcase,.commerce-section,.brand-proof-strip,.product-category-grid,.tutorial-grid,.scenario-grid,.commerce-cta{min-width:0;max-width:100%}
.commerce-hero::before{
  content:"";
  position:absolute;
  inset:0;
  background:
    linear-gradient(90deg,rgba(83,110,58,.1) 1px,transparent 1px),
    linear-gradient(0deg,rgba(83,110,58,.08) 1px,transparent 1px);
  background-size:58px 58px;
  -webkit-mask-image:linear-gradient(90deg,transparent,black 15%,black 86%,transparent);
  mask-image:linear-gradient(90deg,transparent,black 15%,black 86%,transparent);
  pointer-events:none;
}
.commerce-hero::after{
  content:"BAMBOO";
  position:absolute;
  right:clamp(22px,6vw,88px);
  top:28px;
  color:rgba(83,110,58,.09);
  font-family:Georgia,serif;
  font-size:clamp(64px,10vw,132px);
  font-weight:900;
  letter-spacing:.08em;
  line-height:1;
  pointer-events:none;
}
.commerce-copy{position:relative;z-index:1;max-width:660px}
.commerce-copy h2{
  margin:16px 0 16px;
  color:#22311e;
  font-family:Georgia,serif;
  font-size:clamp(40px,4.5vw,62px);
  line-height:1.06;
  letter-spacing:0;
}
.commerce-copy>p{max-width:640px;margin:0;color:#4d4b3d;font-size:18px;line-height:1.72}
.commerce-showcase{
  position:relative;
  z-index:1;
  width:100%;
  min-height:0;
  aspect-ratio:4/3;
  border:1px solid rgba(128,113,71,.3);
  border-radius:8px;
  background:rgba(255,253,244,.54);
  box-shadow:0 34px 80px rgba(89,71,35,.2);
  overflow:hidden;
}
.commerce-showcase::before{display:none}
.commerce-hero-image{
  position:absolute;
  inset:18px;
  min-width:0;
  width:calc(100% - 36px);
  height:calc(100% - 36px);
  max-width:none;
  object-fit:cover;
  border-radius:8px;
  filter:drop-shadow(0 30px 38px rgba(91,70,35,.18));
}
.commerce-product-note{
  position:absolute;
  z-index:2;
  display:grid;
  gap:3px;
  min-width:0;
  max-width:calc(100% - 32px);
  padding:12px 14px;
  border:1px solid rgba(255,255,255,.58);
  border-radius:8px;
  background:rgba(255,253,244,.82);
  box-shadow:0 16px 32px rgba(86,65,31,.14);
  backdrop-filter:blur(8px);
}
.commerce-product-note strong{font-family:Georgia,serif;font-size:18px;color:#23311f}
.commerce-product-note span{font-size:13px;color:#5f5a45}
.bamboo-note{left:36px;top:38px}
.wood-note{right:38px;top:118px}
.rest-note{right:54px;bottom:44px}
.commerce-section{
  max-width:1160px;
  margin:0 auto 34px;
  padding:34px clamp(18px,4vw,52px);
  background:rgba(255,253,247,.9);
  border:1px solid rgba(207,190,143,.56);
  border-radius:8px;
  box-shadow:0 16px 40px rgba(105,82,43,.07);
}
.commerce-section-head h2{font-size:clamp(28px,2.8vw,36px)}
.commerce-section-head p{font-size:15px;line-height:1.62}
.commerce-hero+.commerce-section{margin-top:-28px;position:relative;z-index:2}
.brand-proof-strip{
  position:relative;
  z-index:2;
  max-width:1160px;
  margin:-26px auto 34px;
  padding:0 clamp(18px,4vw,52px);
  display:grid;
  grid-template-columns:repeat(4,minmax(0,1fr));
  gap:12px;
}
.brand-proof-strip div{
  display:grid;
  gap:5px;
  min-height:82px;
  padding:16px;
  border:1px solid rgba(207,190,143,.58);
  border-radius:8px;
  background:rgba(255,253,247,.94);
  box-shadow:0 14px 32px rgba(105,82,43,.08);
}
.brand-proof-strip strong{font-family:Georgia,serif;font-size:18px;color:#22311e}
.brand-proof-strip span{color:#5f5a48;font-size:14px;line-height:1.5}
.commerce-hero+.brand-proof-strip+.commerce-section{margin-top:0}
.product-category-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.product-category-card{min-height:210px;padding:22px}
.product-category-card img{position:relative;z-index:1;display:block;width:100%;max-width:100%;height:auto;aspect-ratio:4/3;object-fit:cover;border-radius:7px;margin-bottom:4px;box-shadow:0 12px 24px rgba(105,82,43,.12);overflow:hidden}
.best-pick-card{
  min-height:176px;
  align-items:start;
  background:linear-gradient(180deg,rgba(255,255,255,.58),transparent 46%),linear-gradient(145deg,#fffdf8,#efe3cc);
}
.best-pick-card div{display:grid;gap:6px}
.product-meta{display:inline-flex;justify-self:start;padding:5px 9px;border-radius:999px;background:#eef2dc;color:#536b37;font-size:12px;font-weight:850;letter-spacing:.06em;text-transform:uppercase}
.best-pick-card small{display:inline-flex;justify-self:start;margin-top:5px;color:#7d6d56;font-size:13px;font-weight:720}
.best-pick-card .button-link{align-self:end}
.scenario-band{
  display:grid;
  grid-template-columns:minmax(260px,.36fr) minmax(0,.64fr);
  gap:28px;
  align-items:start;
  background:linear-gradient(135deg,#526b3a,#31442b);
  color:#fff8e8;
  border:0;
}
.scenario-band h2{font-family:Georgia,serif;font-size:clamp(30px,3vw,42px);line-height:1.08;margin:8px 0 0;color:#fff8e8}
.scenario-grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:14px}
.scenario-grid a{display:grid;gap:6px;min-height:132px;padding:18px;border:1px solid rgba(255,248,232,.18);border-radius:8px;background:rgba(255,248,232,.08);text-decoration:none;color:#fff8e8}
.scenario-grid span{color:#f4d58c;font-size:12px;font-weight:850;letter-spacing:.08em}
.scenario-grid strong{font-size:20px}
.scenario-grid small{color:#e4d9bf;line-height:1.5}
.tutorial-showcase{background:linear-gradient(180deg,#fffdf8,#f2ead8)}
.tutorial-grid{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:16px}
.tutorial-grid a{
  display:grid;
  gap:10px;
  min-height:174px;
  padding:22px;
  border:1px solid rgba(184,170,119,.5);
  border-radius:8px;
  background:#fffdf7;
  color:#25231b;
  text-decoration:none;
  box-shadow:0 12px 28px rgba(105,82,43,.07);
}
.tutorial-grid img{display:block;width:100%;max-width:100%;height:auto;aspect-ratio:16/9;object-fit:cover;border-radius:7px;margin-bottom:4px;box-shadow:0 12px 24px rgba(105,82,43,.1);overflow:hidden}
.tutorial-grid span{display:grid;place-items:center;width:40px;height:40px;border-radius:50%;background:#eef2dc;color:#536b37;font-weight:900}
.tutorial-grid strong{font-family:Georgia,serif;font-size:23px;line-height:1.12;color:#22311e}
.tutorial-grid small{color:#5f5a48;font-size:14px;line-height:1.55}
.commerce-cta{
  max-width:1160px;
  margin:0 auto 34px;
  padding:34px clamp(18px,4vw,52px);
  display:grid;
  grid-template-columns:minmax(280px,.44fr) minmax(0,.56fr);
  gap:28px;
  align-items:start;
  border-radius:8px;
  background:linear-gradient(135deg,#31442b,#526b3a);
  color:#fff8e8;
  box-shadow:0 18px 46px rgba(61,75,42,.18);
}
.commerce-cta h2{margin:8px 0 10px;font-family:Georgia,serif;font-size:clamp(28px,3vw,40px);line-height:1.1;color:#fff8e8}
.commerce-cta p{margin:0;max-width:560px;color:#e5ddc8}
.commerce-cta .calculator-form{max-width:none;margin-top:0}
.commerce-cta .calculator-form label{color:#fff8e8}
.commerce-cta .calculator-form input,.commerce-cta .calculator-form select{border-color:rgba(255,248,232,.32);background:#fffdf7;color:#25231b}
.commerce-cta .result-card{grid-column:1/-1;background:rgba(255,253,247,.96);color:#25231b}
@media(min-width:1041px){
  .commerce-hero{padding:62px clamp(22px,7vw,118px) 64px;grid-template-columns:minmax(0,.88fr) minmax(0,1.12fr);gap:56px}
  .commerce-showcase{min-height:520px;aspect-ratio:auto}
}
@media(max-width:1040px){
  .scenario-band{grid-template-columns:1fr}
  .brand-proof-strip{grid-template-columns:repeat(2,minmax(0,1fr))}
  .tutorial-grid{grid-template-columns:1fr}
  .commerce-cta{grid-template-columns:1fr}
}
@media(max-width:760px){
  .page-home{overflow-x:hidden}
  .commerce-hero{padding:28px 18px 32px!important;display:grid!important;grid-template-columns:minmax(0,1fr)!important;width:100%!important;max-width:100%!important;gap:22px!important;overflow:hidden!important}
  .commerce-copy{width:100%!important;max-width:100%!important}
  .commerce-copy h2{font-size:40px}
  .commerce-copy>p{font-size:16px}
  .hero-product-links{display:grid!important;grid-template-columns:1fr!important;gap:10px;width:100%!important;max-width:100%!important}
  .hero-product-links .button-link{width:100%!important;max-width:100%!important;white-space:normal}
  .commerce-signals{width:100%!important;max-width:100%!important;overflow:hidden}
  .commerce-copy{order:0!important}
  .commerce-showcase{order:1!important;position:relative!important;width:100%!important;max-width:100%!important;min-height:0!important;aspect-ratio:4/3!important}
  .commerce-hero-image{position:absolute!important;inset:10px!important;width:calc(100% - 20px)!important;height:calc(100% - 20px)!important;max-width:none!important;object-fit:cover!important}
  .commerce-product-note{position:absolute!important;margin:0!important;width:auto!important;max-width:calc(100% - 24px)!important;padding:9px 10px!important}
  .commerce-product-note strong{font-size:15px}
  .commerce-product-note span{font-size:12px}
  .bamboo-note{left:16px!important;top:16px!important}
  .wood-note{right:16px!important;top:86px!important}
  .rest-note{right:16px!important;bottom:16px!important}
  .brand-proof-strip{grid-template-columns:1fr;margin:-14px auto 24px}
  .product-category-grid,.scenario-grid{grid-template-columns:1fr}
  .product-category-card,.tutorial-grid a{width:100%!important;max-width:100%!important;overflow:hidden}
  .commerce-section{padding:24px 18px}
  .commerce-cta{padding:24px 18px}
}

`; 
}
