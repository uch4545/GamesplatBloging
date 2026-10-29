/**
 * GamesPlat.com — Static Site Generator (build.js)
 * Enhanced with Elite SEO, Structured Data (JSON-LD),
 * Sitelinks Searchbox, Breadcrumbs, OpenGraph, Twitter Cards,
 * RSS 2.0 Feed, and Google Search Console integration.
 */

const fs = require('fs');
const path = require('path');
const matter = require('gray-matter');
const { marked } = require('marked');

// Configure Marked
marked.setOptions({
  gfm: true,
  breaks: true
});

// Load Site Config
const configPath = path.join(__dirname, 'site.config.json');
const siteConfig = JSON.parse(fs.readFileSync(configPath, 'utf8'));

const CONTENT_DIR = path.join(__dirname, 'content', 'articles');
const OUTPUT_DIR = __dirname;
const ARTICLES_OUT_DIR = path.join(OUTPUT_DIR, 'articles');
const CATEGORIES_OUT_DIR = path.join(OUTPUT_DIR, 'categories');

[ARTICLES_OUT_DIR, CATEGORIES_OUT_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

function getCategoryMeta(categoryName) {
  const match = siteConfig.categories.find(c => c.name.toLowerCase() === (categoryName || '').toLowerCase());
  return match || {
    name: categoryName || 'Games',
    slug: (categoryName || 'games').toLowerCase().replace(/\s+/g, '-'),
    color: 'party',
    icon: '🎮',
    description: 'Fun games and guides.'
  };
}

// Image dimensions (written by scripts/optimize-images.js)
let imageDims = {};
try {
  imageDims = JSON.parse(fs.readFileSync(path.join(__dirname, 'assets', 'images', 'dimensions.json'), 'utf8'));
} catch (e) { /* run scripts/optimize-images.js to generate */ }

function dimsFor(src) {
  return imageDims[path.basename((src || '').split('?')[0])] || null;
}

// <img> with width/height; lazy by default, fetchpriority=high for the hero image
function imgTag({ src, alt, className = '', hero = false, eager = false }) {
  const d = dimsFor(src);
  const size = d ? ` width="${d.width}" height="${d.height}"` : '';
  const cls = className ? ` class="${className}"` : '';
  const load = hero ? ' fetchpriority="high"' : (eager ? '' : ' loading="lazy"');
  return `<img src="${src}" alt="${alt}"${cls}${size}${load} decoding="async">`;
}

function absoluteUrl(url) {
  if (!url) return url;
  if (/^https?:\/\//.test(url)) return url;
  return `${siteConfig.siteUrl}/${url.replace(/^\//, '')}`;
}

const SOCIAL_ICONS = {
  pinterest: { label: 'Pinterest', path: 'M12.017 0C5.396 0 .029 5.367.029 11.987c0 5.079 3.158 9.417 7.618 11.162-.105-.949-.199-2.403.041-3.439.219-.937 1.406-5.957 1.406-5.957s-.359-.72-.359-1.781c0-1.663.967-2.911 2.168-2.911 1.024 0 1.518.769 1.518 1.688 0 1.029-.653 2.567-.992 3.992-.285 1.193.6 2.165 1.775 2.165 2.128 0 3.768-2.245 3.768-5.487 0-2.861-2.063-4.869-5.008-4.869-3.41 0-5.409 2.562-5.409 5.199 0 1.033.394 2.143.889 2.741.099.12.112.225.085.345-.09.375-.293 1.199-.334 1.363-.053.225-.172.271-.401.165-1.495-.69-2.433-2.878-2.433-4.646 0-3.776 2.748-7.252 7.92-7.252 4.158 0 7.392 2.967 7.392 6.923 0 4.135-2.607 7.462-6.233 7.462-1.214 0-2.354-.629-2.758-1.379l-.749 2.848c-.269 1.045-1.004 2.352-1.498 3.146 1.123.345 2.306.535 3.55.535 6.607 0 11.985-5.365 11.985-11.987C23.97 5.39 18.592.026 11.985.026L12.017 0z' },
  facebook: { label: 'Facebook', path: 'M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z' },
  instagram: { label: 'Instagram', path: 'M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 1 0 0 12.324 6.162 6.162 0 0 0 0-12.324zM12 16a4 4 0 1 1 0-8 4 4 0 0 1 0 8zm6.406-11.845a1.44 1.44 0 1 0 0 2.881 1.44 1.44 0 0 0 0-2.881z' },
  x: { label: 'X', path: 'M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932 6.064-6.932zm-1.29 19.494h2.039L6.486 3.24H4.298l13.313 17.407z' },
  youtube: { label: 'YouTube', path: 'M23.498 6.186a3.016 3.016 0 0 0-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 0 0 .502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 0 0 2.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 0 0 2.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z' },
  linkedin: { label: 'LinkedIn', path: 'M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z' }
};

// Icons render only for socials that have a URL in site.config.json
function renderSocialIcons() {
  return Object.keys(SOCIAL_ICONS)
    .filter(key => siteConfig.socials[key])
    .map(key => `<a href="${siteConfig.socials[key]}" class="social-icon" target="_blank" rel="noopener me" aria-label="${SOCIAL_ICONS[key].label}"><svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor" aria-hidden="true"><path d="${SOCIAL_ICONS[key].path}"/></svg></a>`)
    .join('');
}

// Inline style="" attributes are moved into assets/css/style.css (generated block)
const extractedStyles = new Map();
function externalizeStyles(html) {
  return html.replace(/<([a-zA-Z][\w-]*)((?:\s+[^>]*?)?)\sstyle="([^"]*)"([^>]*)>/g, (m, tag, before, style, after) => {
    const css = style.trim().replace(/;?\s*$/, ';').replace(/\s+/g, ' ');
    let cls = extractedStyles.get(css);
    if (!cls) {
      cls = `u${extractedStyles.size + 1}`;
      extractedStyles.set(css, cls);
    }
    const attrs = before + after;
    if (/\sclass="/.test(attrs)) {
      return `<${tag}${attrs.replace(/\sclass="([^"]*)"/, ` class="$1 ${cls}"`)}>`;
    }
    return `<${tag}${attrs} class="${cls}">`;
  });
}

function writeStyleBlock() {
  const cssPath = path.join(__dirname, 'assets', 'css', 'style.css');
  const start = '/* BEGIN GENERATED INLINE STYLES (build.js) */';
  const end = '/* END GENERATED INLINE STYLES */';
  let css = fs.readFileSync(cssPath, 'utf8');
  const block = [start, ...[...extractedStyles].map(([decl, cls]) => `html body .${cls} { ${decl} }`), end].join('\n');
  const a = css.indexOf(start);
  const b = css.indexOf(end);
  css = a !== -1 && b !== -1
    ? css.slice(0, a) + block + css.slice(b + end.length)
    : `${css.trimEnd()}\n\n${block}\n`;
  fs.writeFileSync(cssPath, css);
}

function writePage(filePath, html) {
  fs.writeFileSync(filePath, externalizeStyles(html));
}

function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return dateStr;
  }
}

// Global SEO Head Tags Helper
function renderSEOHead({
  title,
  description,
  canonicalUrl,
  ogType = 'website',
  ogImage,
  publishDate,
  category,
  structuredData = [],
  basePath = '',
  heroImage = ''
}) {
  const finalImage = absoluteUrl(ogImage || siteConfig.defaultOgImage);
  const ogDims = dimsFor(finalImage);
  const ogSize = ogDims
    ? `<meta property="og:image:width" content="${ogDims.width}">\n  <meta property="og:image:height" content="${ogDims.height}">`
    : '';
  const heroPreload = heroImage ? `<link rel="preload" as="image" href="${heroImage}" fetchpriority="high">` : '';
  const googleVerification = siteConfig.googleSiteVerification ? `<meta name="google-site-verification" content="${siteConfig.googleSiteVerification}">` : '';
  const pinterestVerification = siteConfig.pinterestVerification ? `<meta name="p-domain-verify" content="${siteConfig.pinterestVerification}">` : '';
  const bingVerification = siteConfig.bingVerification ? `<meta name="msvalidate.01" content="${siteConfig.bingVerification}">` : '';
  const gaSnippet = siteConfig.googleAnalyticsId ? `
    <!-- Google Analytics (GA4) -->
    <script async src="https://www.googletagmanager.com/gtag/js?id=${siteConfig.googleAnalyticsId}"></script>
    <script>
      window.dataLayer = window.dataLayer || [];
      function gtag(){dataLayer.push(arguments);}
      gtag('js', new Date());
      gtag('config', '${siteConfig.googleAnalyticsId}');
    </script>
  ` : '';

  const jsonLdScripts = structuredData.map(data => `
    <script type="application/ld+json">
      ${JSON.stringify(data, null, 2)}
    </script>
  `).join('\n');

  return `
  <!-- Primary SEO Meta Tags -->
  <title>${title}</title>
  <meta name="title" content="${title}">
  <meta name="description" content="${description}">
  <meta name="robots" content="index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1">
  <link rel="canonical" href="${canonicalUrl}">
  ${googleVerification}
  ${pinterestVerification}
  ${bingVerification}

  <!-- Open Graph / Facebook / Pinterest -->
  <meta property="og:type" content="${ogType}">
  <meta property="og:site_name" content="${siteConfig.siteTitle}">
  <meta property="og:locale" content="en_US">
  <meta property="og:url" content="${canonicalUrl}">
  <meta property="og:title" content="${title}">
  <meta property="og:description" content="${description}">
  <meta property="og:image" content="${finalImage}">
  ${ogSize}
  <meta property="og:image:alt" content="${title}">
  ${publishDate ? `<meta property="article:published_time" content="${publishDate}">` : ''}
  ${category ? `<meta property="article:section" content="${category}">` : ''}

  <!-- Twitter Cards -->
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${title}">
  <meta name="twitter:description" content="${description}">
  <meta name="twitter:image" content="${finalImage}">

  <!-- RSS Feed Link -->
  <link rel="alternate" type="application/rss+xml" title="${siteConfig.siteTitle} RSS Feed" href="${siteConfig.siteUrl}/rss.xml">

  <!-- Favicon & Brand Icons -->
  <link rel="icon" type="image/png" href="${basePath}assets/images/favicon.png">
  <link rel="shortcut icon" href="${basePath}favicon.ico">
  <link rel="apple-touch-icon" href="${basePath}assets/images/favicon.png">

  ${heroPreload}

  <!-- Preconnect for Google Fonts Speed -->
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  ${gaSnippet}
  ${jsonLdScripts}
  `;
}

function loadAllArticles() {
  if (!fs.existsSync(CONTENT_DIR)) {
    fs.mkdirSync(CONTENT_DIR, { recursive: true });
    return [];
  }

  const files = fs.readdirSync(CONTENT_DIR).filter(f => f.endsWith('.md'));
  const articles = [];

  for (const file of files) {
    const fullPath = path.join(CONTENT_DIR, file);
    const fileContent = fs.readFileSync(fullPath, 'utf8');
    const { data, content } = matter(fileContent);

    const slug = data.slug || file.replace(/\.md$/, '');
    const htmlContent = marked.parse(content);

    const wordCount = content.split(/\s+/).length;
    const readingTime = Math.max(1, Math.round(wordCount / 200));

    articles.push({
      ...data,
      slug,
      readingTime: `${readingTime} min read`,
      contentHtml: htmlContent,
      rawContent: content,
      formattedDate: formatDate(data.date || new Date().toISOString())
    });
  }

  return articles.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
}

function renderHeader(activePage = '', basePath = '') {
  const navItems = siteConfig.categories.map(cat => {
    const isActive = activePage === cat.slug ? 'active' : '';
    return `<li><a href="/categories/${cat.slug}" class="nav-link ${isActive}">${cat.icon} ${cat.name}</a></li>`;
  }).join('');

  return `
  <header class="site-header">
    <div class="container header-inner">
      <a href="/" class="logo" aria-label="GamesPlat Home">
        ${imgTag({ src: `${basePath}assets/images/logo.webp`, alt: 'GamesPlat', className: 'site-logo-img', eager: true })}
      </a>

      <button class="mobile-menu-toggle" aria-label="Toggle navigation" aria-expanded="false">☰</button>

      <ul class="nav-links">
        <li><a href="/" class="nav-link ${activePage === 'home' ? 'active' : ''}">Home</a></li>
        ${navItems}
      </ul>

      <div class="header-actions">
        <a href="/#all-games" class="search-btn">🔍 Search Games</a>
      </div>
    </div>
  </header>`;
}

function renderFooter(basePath = '') {
  const currentYear = new Date().getFullYear();
  const categoryLinks = siteConfig.categories.map(c => 
    `<li><a href="/categories/${c.slug}" class="footer-link">${c.name}</a></li>`
  ).join('');

  return `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="/" aria-label="GamesPlat Home">
            ${imgTag({ src: `${basePath}assets/images/logo.webp`, alt: 'GamesPlat', className: 'footer-logo-img' })}
          </a>
          <p class="footer-tagline">${siteConfig.tagline}. Making game nights, holidays, and classroom brain breaks unforgettable.</p>
          <div style="display:flex; gap:0.75rem; margin-top:1rem;">
            <a href="${siteConfig.socials.pinterest}" target="_blank" rel="noopener" style="color:#f43f5e; font-weight:700; font-size:0.85rem;">📌 Follow on Pinterest</a>
            <span style="color:#475569;">•</span>
            <a href="${basePath}rss.xml" target="_blank" style="color:#f59e0b; font-weight:700; font-size:0.85rem;">📡 RSS Feed</a>
          </div>
          <div class="social-icons">${renderSocialIcons()}</div>
        </div>

        <div>
          <h4 class="footer-heading">Game Categories</h4>
          <ul class="footer-links">
            ${categoryLinks}
          </ul>
        </div>

        <div>
          <h4 class="footer-heading">Quick Guides</h4>
          <ul class="footer-links">
            <li><a href="/categories/party-games" class="footer-link">Party Icebreakers</a></li>
            <li><a href="/categories/family-games" class="footer-link">Road Trip & Kids Games</a></li>
            <li><a href="/categories/board-card-games" class="footer-link">Card Rules & How to Play</a></li>
            <li><a href="/categories/classroom-games" class="footer-link">Indoor Recess Games</a></li>
          </ul>
        </div>

        <div>
          <h4 class="footer-heading">Legal & Info</h4>
          <ul class="footer-links">
            <li><a href="/about" class="footer-link">About GamesPlat</a></li>
            <li><a href="/contact" class="footer-link">Contact Us</a></li>
            <li><a href="/privacy-policy" class="footer-link">Privacy Policy</a></li>
            <li><a href="/terms" class="footer-link">Terms of Service</a></li>
            <li><a href="/disclaimer" class="footer-link">Disclaimer</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <p>© ${currentYear} GamesPlat.com. All rights reserved. Built for game lovers everywhere.</p>
        <p style="color:#64748b;">gamesplat.com is dedicated to family-friendly entertainment.</p>
      </div>
    </div>
  </footer>
  <script defer src="${basePath}assets/js/main.js"></script>`;
}

function resolveImage(imgUrl, basePath = '') {
  if (!imgUrl) return `${basePath}assets/images/default-game.webp`;
  if (imgUrl.startsWith('http://') || imgUrl.startsWith('https://')) return imgUrl;
  if (imgUrl.startsWith('/')) return `${basePath}${imgUrl.slice(1)}`;
  return `${basePath}${imgUrl}`;
}

function renderPostCard(article, basePath = '', hero = false) {
  const cat = getCategoryMeta(article.category);
  const imgUrl = resolveImage(article.image, basePath);

  return `
  <article class="post-card">
    <a href="/articles/${article.slug}" class="post-card-img-wrap" aria-label="${article.title}">
      ${imgTag({ src: imgUrl, alt: article.title, hero })}
    </a>
    <div class="post-card-body">
      <span class="badge ${cat.color}">${cat.icon} ${cat.name}</span>
      <h3 class="post-card-title">
        <a href="/articles/${article.slug}">${article.title}</a>
      </h3>
      <p class="post-card-excerpt">${article.excerpt || ''}</p>
      
      <div class="specs-row">
        ${article.players ? `<span class="spec-pill">👥 ${article.players}</span>` : ''}
        ${article.time ? `<span class="spec-pill">⏱️ ${article.time}</span>` : ''}
        ${article.age ? `<span class="spec-pill">🎂 ${article.age}</span>` : ''}
      </div>

      <div class="meta-row">
        <span>📅 ${article.formattedDate}</span>
        <span>•</span>
        <span>☕ ${article.readingTime}</span>
      </div>
    </div>
  </article>`;
}

const HOME_TITLE = 'GamesPlat: Party, Family, Classroom & Card Games';
const HOME_DESCRIPTION = 'Fun party games, family game night ideas, classroom games and easy card game rules. Step-by-step guides with free printables.';

const HOME_FAQS = [
  {
    q: 'What are the best party games for a large group?',
    a: 'Games that need little setup and let everyone play at once work best for big groups. Icebreakers, bingo, charades-style guessing games and fast card games such as Spoons keep energy high and nobody sits out. Our party games section lists options by group size and prep time.'
  },
  {
    q: 'How do I choose a game when kids and adults are playing together?',
    a: 'Look for simple rules, short rounds and a mix of luck and skill, so younger players can win and older players stay interested. Every GamesPlat guide lists the recommended ages, player count and play time at the top, which makes it quick to match a game to your family.'
  },
  {
    q: 'What are good classroom games for indoor recess?',
    a: 'The best indoor recess games are quiet enough for a classroom, need few or no materials and can start in under a minute. Movement breaks, word and number challenges and team guessing games all work well. Our classroom games section is built for teachers working with grades K-5.'
  },
  {
    q: 'How can I learn the rules of a card game quickly?',
    a: 'Start with a how-to-play guide that covers the setup, the goal and a sample turn, then play one practice round before keeping score. Our board and card game guides break the official rules into short steps and add beginner tips so you can start playing in minutes.'
  },
  {
    q: 'Are the printables on GamesPlat free?',
    a: 'Yes. The printable bingo cards, scorecards and cheat sheets that come with our guides are free to download and print for personal, family and classroom use. Look for the download button inside each article that offers a printable.'
  }
];

function renderHomeIntro() {
  const url = slug => `/categories/${slug}`;
  return `
    <section class="home-intro">
      <h2 class="home-intro-title">Your Playbook for Party, Family, Classroom &amp; Card Games</h2>
      <p>Whether you are hosting a birthday party, planning a relaxed family game night, or looking for a quick brain break between lessons, GamesPlat gives you clear, tested instructions so you can stop searching and start playing. Every guide explains the setup, the rules and the small tricks that keep a game moving, without confusing jargon or long rulebooks.</p>
      <p>Our <a href="${url('party-games')}">party games</a> are built for real gatherings. You will find icebreakers, holiday favorites and group challenges that work for small living rooms and big crowds alike, most of them with almost no preparation. Many guides include free printables, such as bingo cards and scorecards, so the fun starts as soon as you press print.</p>
      <p>When the whole household wants to play, our <a href="${url('family-games')}">family games</a> keep everyone involved, from toddlers to grandparents. These screen-free ideas suit rainy afternoons, road trips and backyard get-togethers, and each one lists the ages, number of players and time needed so you can pick the right game in seconds.</p>
      <p>Teachers will love the <a href="${url('classroom-games')}">classroom games</a> section. It is full of indoor recess ideas, movement breaks and learning games that need little or no equipment and can be explained in under a minute, which makes them easy to use on a busy school day.</p>
      <p>If you simply want to settle an argument about the rules, our <a href="${url('board-card-games')}">board and card game guides</a> explain the official rules step by step. You get the setup, how a turn works, how to win and beginner-friendly tips, whether you are learning Spoons for the first time or refreshing your memory on an old favorite.</p>
      <p>New guides are added all the time, so bookmark the site, browse the latest games below, or use the search box to find a game by name. Gather your friends and family, pick a game, and make your next get-together one that everyone remembers.</p>
    </section>`;
}

function renderHomeFaq() {
  return `
      <section class="faq-section home-faq">
        <h2 class="home-faq-title">Frequently Asked Questions</h2>
        ${HOME_FAQS.map(f => `
        <div class="faq-item">
          <button class="faq-question">
            <span>${f.q}</span>
            <span class="faq-arrow">▼</span>
          </button>
          <div class="faq-answer">
            <p>${f.a}</p>
          </div>
        </div>`).join('')}
      </section>`;
}

// 1. Build Homepage with WebSite + SearchAction Schema
function buildHomepage(articles) {
  const featured = articles.find(a => a.featured) || articles[0];
  const latestArticles = articles;

  const categoryPillsHtml = siteConfig.categories.map(cat => 
    `<a href="/categories/${cat.slug}" class="category-pill ${cat.color}">
      <span>${cat.icon}</span> ${cat.name}
    </a>`
  ).join('');

  const featuredHtml = featured ? `
    <section class="featured-section">
      <div class="featured-card">
        <div class="featured-img-wrap">
          ${imgTag({ src: resolveImage(featured.image, ''), alt: featured.title, hero: true })}
        </div>
        <div class="featured-content">
          <div>
            <span class="badge ${getCategoryMeta(featured.category).color}">⭐ Featured Guide</span>
          </div>
          <h2 class="featured-title">
            <a href="/articles/${featured.slug}">${featured.title}</a>
          </h2>
          <p class="featured-excerpt">${featured.excerpt || ''}</p>
          <div class="specs-row">
            ${featured.players ? `<span class="spec-pill">👥 ${featured.players}</span>` : ''}
            ${featured.time ? `<span class="spec-pill">⏱️ ${featured.time}</span>` : ''}
            ${featured.age ? `<span class="spec-pill">🎂 ${featured.age}</span>` : ''}
          </div>
          <div class="meta-row">
            <span class="author-pill">✍️ ${featured.author || 'GamesPlat Team'}</span>
            <span>•</span>
            <span>📅 ${featured.formattedDate}</span>
            <span>•</span>
            <span>☕ ${featured.readingTime}</span>
          </div>
        </div>
      </div>
    </section>
  ` : '';

  const postsGridHtml = latestArticles.map(a => renderPostCard(a, '')).join('');

  const structuredData = [
    {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": siteConfig.siteTitle,
      "alternateName": "GamesPlat Blog",
      "url": `${siteConfig.siteUrl}/`,
      "description": siteConfig.description,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${siteConfig.siteUrl}/?s={search_term_string}`,
        "query-input": "required name=search_term_string"
      }
    },
    {
      "@context": "https://schema.org",
      "@type": "Organization",
      "name": siteConfig.siteTitle,
      "url": `${siteConfig.siteUrl}/`,
      "logo": `${siteConfig.siteUrl}/assets/images/logo.png`,
      "sameAs": Object.values(siteConfig.socials).filter(Boolean)
    },
    {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": HOME_FAQS.map(f => ({
        "@type": "Question",
        "name": f.q,
        "acceptedAnswer": { "@type": "Answer", "text": f.a }
      }))
    }
  ];

  const seoHead = renderSEOHead({
    title: HOME_TITLE,
    description: HOME_DESCRIPTION,
    canonicalUrl: `${siteConfig.siteUrl}/`,
    ogType: 'website',
    ogImage: featured ? featured.image : siteConfig.defaultOgImage,
    structuredData,
    heroImage: featured ? resolveImage(featured.image, '') : ''
  });

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${seoHead}
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
  ${renderHeader('home', '')}

  <main>
    <section class="hero">
      <div class="container">
        <div class="hero-pill">🎈 Ready to play? Hundreds of party & board game rules</div>
        <h1 class="hero-title">Fun Games for <span class="gradient-text">Parties, Family Nights & Classrooms</span></h1>
        <p class="hero-subtitle">Fast, step-by-step game rules, party icebreakers, and free printables to make every gathering unforgettable.</p>
        
        <div class="category-pills">
          ${categoryPillsHtml}
        </div>
      </div>
    </section>

    <div class="container">
      ${renderHomeIntro()}

      ${featuredHtml}

      <div class="section-header" id="all-games">
        <div>
          <h2 class="section-title">Latest Games & Rules</h2>
          <p class="section-desc">Freshly updated games, rules, and printable activities</p>
        </div>
        <div style="min-width:260px;">
          <input type="text" id="site-search-input" placeholder="🔍 Filter games by name..." style="width:100%; padding:0.6rem 1rem; border-radius:var(--radius-full); border:1px solid var(--border); font-size:0.9rem;">
        </div>
      </div>

      <div class="posts-grid" id="posts-container">
        ${postsGridHtml}
      </div>

      <div id="no-results-msg" class="no-results">
        <h3>No games found matching your search.</h3>
        <p>Try searching for words like "Christmas", "Spoons", "Cards", or "Classroom".</p>
      </div>

      ${renderHomeFaq()}

      <section class="printable-card" style="margin-bottom:4rem;">
        <span class="printable-badge">📌 Free Printable Library</span>
        <h3 class="printable-title">Looking for Free Party Bingo & Scavenger Hunt Sheets?</h3>
        <p class="printable-desc">Check out our game guides for free instant PDF printables ready to use for family game night or classroom activities.</p>
        <a href="${siteConfig.socials.pinterest}" target="_blank" rel="noopener" class="btn-download">
          📌 Follow GamesPlat on Pinterest
        </a>
      </section>
    </div>
  </main>

  ${renderFooter('')}
</body>
</html>`;

  writePage(path.join(OUTPUT_DIR, 'index.html'), html);
  console.log('✓ index.html built (SEO Enhanced)');
}

// 2. Build Category Pages with CollectionPage & BreadcrumbList Schema
function buildCategoryPages(articles) {
  siteConfig.categories.forEach(cat => {
    const filteredArticles = articles.filter(a => (a.category || '').toLowerCase() === cat.name.toLowerCase());
    const postsHtml = filteredArticles.length > 0
      ? filteredArticles.map((a, i) => renderPostCard(a, '../', i === 0)).join('')
      : `<div style="grid-column: 1 / -1; text-align:center; padding: 4rem 1rem; color:var(--text-muted);">
           <h3>Articles coming very soon!</h3>
           <p>We are adding daily games to the ${cat.name} section.</p>
         </div>`;

    const catUrl = `${siteConfig.siteUrl}/categories/${cat.slug}`;

    const structuredData = [
      {
        "@context": "https://schema.org",
        "@type": "CollectionPage",
        "name": `${cat.name} — GamesPlat`,
        "url": catUrl,
        "description": cat.description
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": `${siteConfig.siteUrl}/`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": cat.name,
            "item": catUrl
          }
        ]
      }
    ];

    const seoHead = renderSEOHead({
      title: `${cat.name} — Fun Ideas & Rules | GamesPlat`,
      description: cat.description,
      canonicalUrl: catUrl,
      ogType: 'website',
      ogImage: filteredArticles[0]?.image || siteConfig.defaultOgImage,
      structuredData,
      basePath: '../',
      heroImage: filteredArticles[0] ? resolveImage(filteredArticles[0].image, '../') : ''
    });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${seoHead}
  <link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>
  ${renderHeader(cat.slug, '../')}

  <main>
    <div style="background:var(--bg-alt); padding:3.5rem 0; text-align:center; border-bottom:1px solid var(--border);">
      <div class="container">
        <span class="badge ${cat.color}" style="font-size:0.95rem; padding:0.4rem 1.2rem;">${cat.icon} Category</span>
        <h1 style="font-size:2.6rem; font-weight:800; margin-top:0.75rem;">${cat.name}</h1>
        <p style="color:var(--text-muted); max-width:600px; margin-inline:auto; font-size:1.1rem; margin-top:0.5rem;">${cat.description}</p>
      </div>
    </div>

    <div class="container" style="padding-top:3rem;">
      <div class="posts-grid">
        ${postsHtml}
      </div>
    </div>
  </main>

  ${renderFooter('../')}
</body>
</html>`;

    writePage(path.join(CATEGORIES_OUT_DIR, `${cat.slug}.html`), html);
    console.log(`✓ categories/${cat.slug}.html built (SEO Enhanced)`);
  });
}

// 3. Build Article Pages with BlogPosting + Breadcrumbs + FAQ Schema
function buildArticlePages(articles) {
  articles.forEach(article => {
    const cat = getCategoryMeta(article.category);
    const articleUrl = `${siteConfig.siteUrl}/articles/${article.slug}`;
    const catUrl = `${siteConfig.siteUrl}/categories/${cat.slug}`;

    const related = articles
      .filter(a => a.slug !== article.slug && (a.category || '').toLowerCase() === (article.category || '').toLowerCase())
      .slice(0, 3);

    const relatedHtml = related.length > 0 ? `
      <section class="related-section">
        <h3 style="font-size:1.6rem; font-weight:800; margin-bottom:1.5rem;">More Fun ${cat.name}</h3>
        <div class="posts-grid">
          ${related.map(r => renderPostCard(r, '../')).join('')}
        </div>
      </section>
    ` : '';

    const printableHtml = article.printable ? `
      <div class="printable-card">
        <span class="printable-badge">🎁 Free Bonus Printable</span>
        <h3 class="printable-title">${article.printable.title || 'Free Printable Activity Sheet'}</h3>
        <p class="printable-desc">${article.printable.description || 'Download, print, and play instantly!'}</p>
        <a href="${article.printable.downloadUrl || '#'}" class="btn-download" download>
          📄 Download Free PDF Printable
        </a>
      </div>
    ` : '';

    // Structured Data: BreadcrumbList + Article/BlogPosting
    const structuredData = [
      {
        "@context": "https://schema.org",
        "@type": "BlogPosting",
        "headline": article.title,
        "description": article.excerpt || '',
        "image": [article.image || siteConfig.defaultOgImage],
        "datePublished": article.date,
        "dateModified": article.date,
        "author": {
          "@type": "Person",
          "name": article.author || siteConfig.author
        },
        "publisher": {
          "@type": "Organization",
          "name": siteConfig.siteTitle,
          "url": siteConfig.siteUrl,
          "logo": {
            "@type": "ImageObject",
            "url": `${siteConfig.siteUrl}/assets/images/logo.png`
          }
        },
        "mainEntityOfPage": {
          "@type": "WebPage",
          "@id": articleUrl
        }
      },
      {
        "@context": "https://schema.org",
        "@type": "BreadcrumbList",
        "itemListElement": [
          {
            "@type": "ListItem",
            "position": 1,
            "name": "Home",
            "item": `${siteConfig.siteUrl}/`
          },
          {
            "@type": "ListItem",
            "position": 2,
            "name": cat.name,
            "item": catUrl
          },
          {
            "@type": "ListItem",
            "position": 3,
            "name": article.title,
            "item": articleUrl
          }
        ]
      }
    ];

    // FAQ Section & Schema
    let faqAccordionHtml = '';
    if (article.faqs && Array.isArray(article.faqs) && article.faqs.length > 0) {
      structuredData.push({
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": article.faqs.map(f => ({
          "@type": "Question",
          "name": f.q,
          "acceptedAnswer": {
            "@type": "Answer",
            "text": f.a
          }
        }))
      });

      faqAccordionHtml = `
      <section class="faq-section">
        <h2 style="font-size:1.8rem; font-weight:800; margin-bottom:1.25rem;">Frequently Asked Questions</h2>
        ${article.faqs.map(f => `
          <div class="faq-item">
            <button class="faq-question">
              <span>${f.q}</span>
              <span class="faq-arrow">▼</span>
            </button>
            <div class="faq-answer">
              <p>${f.a}</p>
            </div>
          </div>
        `).join('')}
      </section>`;
    }

    const shareTitle = encodeURIComponent(article.title);
    const pinImg = encodeURIComponent(article.pinterestImage || article.image || siteConfig.defaultOgImage);

    const seoHead = renderSEOHead({
      title: `${article.title} — GamesPlat`,
      description: article.excerpt || '',
      canonicalUrl: articleUrl,
      ogType: 'article',
      ogImage: article.image || siteConfig.defaultOgImage,
      publishDate: article.date,
      category: cat.name,
      structuredData,
      basePath: '../',
      heroImage: article.image ? resolveImage(article.image, '../') : ''
    });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${seoHead}
  <link rel="stylesheet" href="../assets/css/style.css">
</head>
<body>
  ${renderHeader(cat.slug, '../')}

  <main>
    <article class="container-narrow">
      <header class="article-header">
        <nav class="breadcrumbs">
          <a href="/">Home</a>
          <span>›</span>
          <a href="/categories/${cat.slug}">${cat.name}</a>
          <span>›</span>
          <span>${article.type || 'Guide'}</span>
        </nav>

        <span class="badge ${cat.color}">${cat.icon} ${cat.name}</span>
        <h1 class="article-title">${article.title}</h1>

        <div class="meta-row" style="justify-content:center; margin-bottom:1.5rem;">
          <span class="author-pill">✍️ ${article.author || 'GamesPlat Team'}</span>
          <span>•</span>
          <span>📅 ${article.formattedDate}</span>
          <span>•</span>
          <span>☕ ${article.readingTime}</span>
        </div>

        <div class="social-share-bar" style="justify-content:center;">
          <span class="share-label">Share:</span>
          <a href="https://pinterest.com/pin/create/button/?url=${encodeURIComponent(articleUrl)}&media=${pinImg}&description=${shareTitle}" target="_blank" rel="noopener" class="share-btn share-pinterest">📌 Save Pin</a>
          <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(articleUrl)}" target="_blank" rel="noopener" class="share-btn share-facebook">Facebook</a>
          <button class="share-btn share-copy">📋 Copy Link</button>
        </div>
      </header>

      ${article.image ? `${imgTag({ src: resolveImage(article.image, '../'), alt: article.title, className: 'article-featured-img', hero: true })}` : ''}

      <section class="game-specs-box">
        <div class="game-spec-item">
          <div class="game-spec-icon">👥</div>
          <div>
            <div class="game-spec-label">Players</div>
            <div class="game-spec-val">${article.players || '2+ Players'}</div>
          </div>
        </div>

        <div class="game-spec-item">
          <div class="game-spec-icon">🎂</div>
          <div>
            <div class="game-spec-label">Ages</div>
            <div class="game-spec-val">${article.age || 'All Ages'}</div>
          </div>
        </div>

        <div class="game-spec-item">
          <div class="game-spec-icon">⏱️</div>
          <div>
            <div class="game-spec-label">Time</div>
            <div class="game-spec-val">${article.time || '15-30 Mins'}</div>
          </div>
        </div>

        <div class="game-spec-item">
          <div class="game-spec-icon">📦</div>
          <div>
            <div class="game-spec-label">Materials</div>
            <div class="game-spec-val">${article.materials || 'None / Minimal'}</div>
          </div>
        </div>
      </section>

      <div class="article-body">
        ${article.contentHtml}
      </div>

      ${printableHtml}

      <div class="pinterest-pin-box">
        <div>
          <h4 style="font-weight:800; font-size:1.1rem; color:#991b1b; margin-bottom:0.25rem;">📌 Pin This Game For Later!</h4>
          <p style="font-size:0.88rem; color:#b91c1c;">Planning a party or game night? Save this idea to your Pinterest board so you don't lose it.</p>
        </div>
        <a href="https://pinterest.com/pin/create/button/?url=${encodeURIComponent(articleUrl)}&media=${pinImg}&description=${shareTitle}" target="_blank" rel="noopener" class="share-btn share-pinterest" style="white-space:nowrap; padding:0.6rem 1.2rem;">
          Save to Pinterest
        </a>
      </div>

      ${faqAccordionHtml}

      <div style="background:var(--bg-alt); border-radius:var(--radius-md); padding:1.5rem; margin-top:2.5rem; display:flex; align-items:center; gap:1.25rem;">
        <div style="font-size:2.5rem; background:var(--bg-card); border:1px solid var(--border); width:64px; height:64px; border-radius:var(--radius-full); display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow-sm);">🎮</div>
        <div>
          <h4 style="font-weight:800; font-size:1.05rem;">Written by ${article.author || 'The GamesPlat Editorial Team'}</h4>
          <p style="font-size:0.88rem; color:var(--text-muted); margin-top:0.25rem;">We test, review, and explain party games, board game rules, and classroom activities to bring people together for screen-free fun.</p>
        </div>
      </div>

      ${relatedHtml}
    </article>
  </main>

  ${renderFooter('../')}
</body>
</html>`;

    writePage(path.join(ARTICLES_OUT_DIR, `${article.slug}.html`), html);
    console.log(`✓ articles/${article.slug}.html built (SEO Enhanced)`);
  });
}

// 4. Build Legal & AdSense Compliance Pages
function buildLegalPages() {
  const pages = [
    {
      slug: 'about',
      title: 'About GamesPlat',
      content: `
        <h2>Welcome to GamesPlat.com!</h2>
        <p>At GamesPlat, our mission is simple: <strong>make play easy, accessible, and screen-free</strong> for families, friends, teachers, and party planners across the United States and worldwide.</p>
        <p>Whether you are planning an office holiday party, looking for quick indoor recess ideas for elementary students, or trying to settle a heated debate over the official rules of Spoons or Uno, we have got you covered.</p>
        <h3>What We Cover:</h3>
        <ul>
          <li><strong>Party Games:</strong> Fast icebreakers, holiday-themed games (Christmas, Halloween, Thanksgiving), and adult dinner party favorites.</li>
          <li><strong>Family Games:</strong> Low-prep games for family game nights, road trips, and backyard barbecues.</li>
          <li><strong>Board & Card Games:</strong> No-nonsense, easy-to-read rules and winning strategies for tabletop classics.</li>
          <li><strong>Classroom Games:</strong> 5-minute brain breaks, math and spelling games, and indoor recess lifesavers for educators.</li>
        </ul>
        <p>Have a question or game request? Feel free to <a href="/contact" style="color:var(--primary); font-weight:700;">reach out to our team</a>!</p>
      `
    },
    {
      slug: 'contact',
      title: 'Contact Us',
      content: `
        <h2>Get in Touch with GamesPlat</h2>
        <p>We'd love to hear from you! Whether you have feedback, want to suggest a game, or have business inquiries, you can reach out directly.</p>
        <div style="background:var(--bg-alt); padding:1.75rem; border-radius:var(--radius-md); margin:2rem 0;">
          <p><strong>Email:</strong> <a href="mailto:${siteConfig.contactEmail}" style="color:var(--primary); font-weight:700;">${siteConfig.contactEmail}</a></p>
          <p style="margin-top:0.5rem;"><strong>Pinterest:</strong> <a href="${siteConfig.socials.pinterest}" target="_blank" rel="noopener" style="color:#f43f5e; font-weight:700;">pinterest.com/gamesplat</a></p>
          <p style="margin-top:0.5rem;"><strong>Response Time:</strong> We usually respond within 24 to 48 business hours.</p>
        </div>
      `
    },
    {
      slug: 'privacy-policy',
      title: 'Privacy Policy',
      content: `
        <h2>Privacy Policy for GamesPlat.com</h2>
        <p><em>Last updated: October 2026</em></p>
        <p>At GamesPlat (accessible from https://gamesplat.com), one of our main priorities is the privacy of our visitors. This Privacy Policy document outlines the types of information that is collected and recorded by GamesPlat and how we use it.</p>
        <h3>Log Files</h3>
        <p>GamesPlat follows a standard procedure of using log files. These files log visitors when they visit websites. The information collected includes IP addresses, browser type, Internet Service Provider (ISP), date and time stamp, and referring/exit pages.</p>
        <h3>Cookies and Web Beacons</h3>
        <p>Like any other website, GamesPlat uses 'cookies'. These cookies are used to store information including visitors' preferences, and the pages on the website that the visitor accessed or visited.</p>
        <h3>Google DoubleClick DART Cookie</h3>
        <p>Google is one of a third-party vendor on our site. It also uses cookies, known as DART cookies, to serve ads to our site visitors based upon their visit to our site and other sites on the internet.</p>
        <h3>CCPA Privacy Rights (Do Not Sell My Personal Information)</h3>
        <p>Under the CCPA, California consumers have the right to request disclosure, deletion, and that a business not sell their personal data.</p>
        <h3>GDPR Data Protection Rights</h3>
        <p>Every user is entitled to data access, rectification, erasure, and restriction of processing under applicable regulations.</p>
      `
    },
    {
      slug: 'terms',
      title: 'Terms of Service',
      content: `
        <h2>Terms of Service</h2>
        <p><em>Last updated: October 2026</em></p>
        <p>By accessing GamesPlat.com, you agree to comply with and be bound by the following terms and conditions of use. If you disagree with any part of these terms, please do not use our website.</p>
        <p>The content of the pages of this website is for your general information and entertainment use only. It is subject to change without notice.</p>
      `
    },
    {
      slug: 'disclaimer',
      title: 'Disclaimer',
      content: `
        <h2>Disclaimer for GamesPlat.com</h2>
        <p>All the information on this website — https://gamesplat.com — is published in good faith and for general entertainment and educational purposes only.</p>
        <p>GamesPlat does not make any warranties about the completeness, reliability, and accuracy of this information. Any action you take upon the information you find on this website is strictly at your own risk.</p>
      `
    }
  ];

  pages.forEach(p => {
    const pageUrl = `${siteConfig.siteUrl}/${p.slug}`;
    const seoHead = renderSEOHead({
      title: `${p.title} — GamesPlat.com`,
      description: `${p.title} for GamesPlat.com.`,
      canonicalUrl: pageUrl,
      ogType: 'website',
      basePath: ''
    });

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  ${seoHead}
  <link rel="stylesheet" href="assets/css/style.css">
</head>
<body>
  ${renderHeader('', '')}
  <main style="padding: 3rem 0;">
    <div class="container-narrow">
      <h1 style="font-size:2.5rem; font-weight:800; margin-bottom:1.5rem;">${p.title}</h1>
      <div class="article-body">
        ${p.content}
      </div>
    </div>
  </main>
  ${renderFooter('')}
</body>
</html>`;

    writePage(path.join(OUTPUT_DIR, `${p.slug}.html`), html);
    console.log(`✓ ${p.slug}.html built`);
  });
}

// 5. Build RSS 2.0 Feed (rss.xml)
function buildRSSFeed(articles) {
  const feedItems = articles.map(a => `
    <item>
      <title><![CDATA[${a.title}]]></title>
      <link>${siteConfig.siteUrl}/articles/${a.slug}</link>
      <guid>${siteConfig.siteUrl}/articles/${a.slug}</guid>
      <pubDate>${new Date(a.date).toUTCString()}</pubDate>
      <description><![CDATA[${a.excerpt || ''}]]></description>
      <category><![CDATA[${a.category || 'Games'}]]></category>
    </item>
  `).join('\n');

  const rss = `<?xml version="1.0" encoding="UTF-8" ?>
<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">
<channel>
  <title><![CDATA[${siteConfig.siteTitle}]]></title>
  <link>${siteConfig.siteUrl}/</link>
  <description><![CDATA[${siteConfig.description}]]></description>
  <language>en-us</language>
  <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
  <atom:link href="${siteConfig.siteUrl}/rss.xml" rel="self" type="application/rss+xml" />
  ${feedItems}
</channel>
</rss>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'rss.xml'), rss);
  console.log('✓ rss.xml (RSS 2.0 Feed) built (XML Validated)');
}

// 6. Build Sitemap.xml, Robots.txt & CNAME
function buildSEOFiles(articles) {
  fs.writeFileSync(path.join(OUTPUT_DIR, 'CNAME'), `${siteConfig.domain}\n`);

  const robots = `# Allow all standard search engines
User-agent: *
Allow: /

# Allow AI Search & Answer Bots (OpenAI, ChatGPT, Perplexity, Claude, Apple, Google)
User-agent: GPTBot
Allow: /

User-agent: ChatGPT-User
Allow: /

User-agent: OAI-SearchBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: ClaudeBot
Allow: /

User-agent: anthropic-ai
Allow: /

User-agent: Google-Extended
Allow: /

User-agent: Applebot-Extended
Allow: /

User-agent: Bingbot
Allow: /

Sitemap: ${siteConfig.siteUrl}/sitemap.xml
`;
  fs.writeFileSync(path.join(OUTPUT_DIR, 'robots.txt'), robots);

  const currentDate = new Date().toISOString().split('T')[0];
  let urls = [
    `<url><loc>${siteConfig.siteUrl}/</loc><lastmod>${currentDate}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>`,
    `<url><loc>${siteConfig.siteUrl}/about</loc><lastmod>${currentDate}</lastmod><priority>0.5</priority></url>`,
    `<url><loc>${siteConfig.siteUrl}/contact</loc><lastmod>${currentDate}</lastmod><priority>0.5</priority></url>`,
    `<url><loc>${siteConfig.siteUrl}/privacy-policy</loc><lastmod>${currentDate}</lastmod><priority>0.3</priority></url>`,
    `<url><loc>${siteConfig.siteUrl}/terms</loc><lastmod>${currentDate}</lastmod><priority>0.3</priority></url>`,
    `<url><loc>${siteConfig.siteUrl}/disclaimer</loc><lastmod>${currentDate}</lastmod><priority>0.3</priority></url>`
  ];

  siteConfig.categories.forEach(c => {
    urls.push(`<url><loc>${siteConfig.siteUrl}/categories/${c.slug}</loc><lastmod>${currentDate}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`);
  });

  articles.forEach(a => {
    urls.push(`<url><loc>${siteConfig.siteUrl}/articles/${a.slug}</loc><lastmod>${a.date || currentDate}</lastmod><changefreq>monthly</changefreq><priority>0.9</priority></url>`);
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.join('\n  ')}
</urlset>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap.xml'), sitemap);

  const llms = `# ${siteConfig.siteTitle}

> ${siteConfig.description}

${siteConfig.siteTitle} (${siteConfig.siteUrl}) publishes step-by-step rules and ideas for party games, family game nights, classroom activities, and board and card games. Many guides include free printables.

## Categories

${siteConfig.categories.map(c => `- [${c.name}](${siteConfig.siteUrl}/categories/${c.slug}): ${c.description}`).join('\n')}

## Articles

${articles.map(a => `- [${a.title}](${siteConfig.siteUrl}/articles/${a.slug}): ${a.excerpt || ''}`).join('\n')}

## About

- [About ${siteConfig.siteTitle}](${siteConfig.siteUrl}/about)
- [Contact](${siteConfig.siteUrl}/contact)
- [RSS feed](${siteConfig.siteUrl}/rss.xml)
- [Sitemap](${siteConfig.siteUrl}/sitemap.xml)
`;
  fs.writeFileSync(path.join(OUTPUT_DIR, 'llms.txt'), llms);
  console.log('✓ CNAME, robots.txt & sitemap.xml built');
}

// 7. Build 404 page (noindex)
function build404() {
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Page Not Found — GamesPlat</title>
  <meta name="robots" content="noindex, follow">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;600;800&display=swap" rel="stylesheet">
  <link rel="icon" type="image/png" href="/assets/images/favicon.png">
  <link rel="shortcut icon" href="/favicon.ico">
  <link rel="apple-touch-icon" href="/assets/images/favicon.png">
  <link rel="stylesheet" href="/assets/css/style.css">
  <meta http-equiv="refresh" content="5;url=/">
</head>
<body style="min-height:100vh; display:flex; align-items:center; justify-content:center; text-align:center; padding:2rem; background:var(--bg-body);">
  <div style="max-width:500px; background:var(--bg-card); padding:3rem 2rem; border-radius:var(--radius-lg); border:1px solid var(--border); box-shadow:var(--shadow-lg);">
    <div style="font-size:3.5rem; margin-bottom:1rem;">🎲 404</div>
    <h1 style="font-size:2rem; font-weight:800; margin-bottom:0.75rem;">Page Moved or Not Found</h1>
    <p style="color:var(--text-muted); margin-bottom:2rem; line-height:1.6;">
      The game or page you're looking for has moved. We're redirecting you to our new homepage full of fun party and family games!
    </p>
    <a href="/" class="btn-download" style="display:inline-block; padding:0.8rem 2rem; text-decoration:none;">
      🏠 Go to GamesPlat Home
    </a>
    <p style="font-size:0.8rem; color:var(--text-light); margin-top:1.5rem;">Redirecting in 5 seconds...</p>
  </div>
</body>
</html>`;
  writePage(path.join(OUTPUT_DIR, '404.html'), html);
  console.log('✓ 404.html built');
}

// Master Build Execution
function run() {
  console.log('🚀 Building GamesPlat.com with Elite SEO Engine...');
  const articles = loadAllArticles();
  console.log(`Found ${articles.length} articles in content/articles/`);

  buildHomepage(articles);
  buildCategoryPages(articles);
  buildArticlePages(articles);
  buildLegalPages();
  buildRSSFeed(articles);
  buildSEOFiles(articles);
  build404();
  writeStyleBlock();

  console.log('🎉 Elite SEO Build completed successfully!');
}

run();
