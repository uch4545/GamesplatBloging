/**
 * GamesPlat.com — Static Site Generator (build.js)
 * Automatically builds all pages, category archives, article pages,
 * legal compliance pages, sitemap.xml, and RSS from Markdown.
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
const OUTPUT_DIR = __dirname; // Generates in root for direct GitHub Pages compatibility
const ARTICLES_OUT_DIR = path.join(OUTPUT_DIR, 'articles');
const CATEGORIES_OUT_DIR = path.join(OUTPUT_DIR, 'categories');

// Ensure output directories exist
[ARTICLES_OUT_DIR, CATEGORIES_OUT_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });
});

// Helper: Category styling helper
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

// Helper: Format Date
function formatDate(dateStr) {
  try {
    const d = new Date(dateStr);
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  } catch (e) {
    return dateStr;
  }
}

// 1. Read all articles
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

    // Calculate reading time
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

  // Sort articles by date descending
  return articles.sort((a, b) => new Date(b.date || 0) - new Date(a.date || 0));
}

// Components: Header & Footer
function renderHeader(activePage = '', basePath = '') {
  const navItems = siteConfig.categories.map(cat => {
    const isActive = activePage === cat.slug ? 'active' : '';
    return `<li><a href="${basePath}categories/${cat.slug}.html" class="nav-link ${isActive}">${cat.icon} ${cat.name}</a></li>`;
  }).join('');

  return `
  <header class="site-header">
    <div class="container header-inner">
      <a href="${basePath}index.html" class="logo">
        <div class="logo-badge">🎮</div>
        <span>Games<span class="accent">Plat</span></span>
      </a>

      <button class="mobile-menu-toggle" aria-label="Toggle navigation" aria-expanded="false">☰</button>

      <ul class="nav-links">
        <li><a href="${basePath}index.html" class="nav-link ${activePage === 'home' ? 'active' : ''}">Home</a></li>
        ${navItems}
      </ul>

      <div class="header-actions">
        <a href="${basePath}index.html#all-games" class="search-btn">🔍 Search Games</a>
      </div>
    </div>
  </header>`;
}

function renderFooter(basePath = '') {
  const currentYear = new Date().getFullYear();
  const categoryLinks = siteConfig.categories.map(c => 
    `<li><a href="${basePath}categories/${c.slug}.html" class="footer-link">${c.name}</a></li>`
  ).join('');

  return `
  <footer class="site-footer">
    <div class="container">
      <div class="footer-grid">
        <div class="footer-brand">
          <a href="${basePath}index.html" class="logo">
            <div class="logo-badge">🎮</div>
            <span>Games<span class="accent" style="color:#818cf8;">Plat</span></span>
          </a>
          <p class="footer-tagline">${siteConfig.tagline}. Making game nights, holidays, and classroom brain breaks unforgettable.</p>
          <div style="display:flex; gap:0.75rem; margin-top:1rem;">
            <a href="${siteConfig.socials.pinterest}" target="_blank" rel="noopener" style="color:#f43f5e; font-weight:700; font-size:0.85rem;">📌 Follow on Pinterest</a>
          </div>
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
            <li><a href="${basePath}categories/party-games.html" class="footer-link">Party Icebreakers</a></li>
            <li><a href="${basePath}categories/family-games.html" class="footer-link">Road Trip & Kids Games</a></li>
            <li><a href="${basePath}categories/board-card-games.html" class="footer-link">Card Rules & How to Play</a></li>
            <li><a href="${basePath}categories/classroom-games.html" class="footer-link">Indoor Recess Games</a></li>
          </ul>
        </div>

        <div>
          <h4 class="footer-heading">Legal & Info</h4>
          <ul class="footer-links">
            <li><a href="${basePath}about.html" class="footer-link">About GamesPlat</a></li>
            <li><a href="${basePath}contact.html" class="footer-link">Contact Us</a></li>
            <li><a href="${basePath}privacy-policy.html" class="footer-link">Privacy Policy</a></li>
            <li><a href="${basePath}terms.html" class="footer-link">Terms of Service</a></li>
            <li><a href="${basePath}disclaimer.html" class="footer-link">Disclaimer</a></li>
          </ul>
        </div>
      </div>

      <div class="footer-bottom">
        <p>© ${currentYear} GamesPlat.com. All rights reserved. Built for game lovers everywhere.</p>
        <p style="color:#64748b;">gamesplat.com is dedicated to family-friendly entertainment.</p>
      </div>
    </div>
  </footer>
  <script src="${basePath}assets/js/main.js"></script>`;
}

// Helper: Post Card HTML
function renderPostCard(article, basePath = '') {
  const cat = getCategoryMeta(article.category);
  const imgUrl = article.image || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=800&auto=format&fit=crop&q=80';

  return `
  <article class="post-card">
    <a href="${basePath}articles/${article.slug}.html" class="post-card-img-wrap" aria-label="${article.title}">
      <img src="${imgUrl}" alt="${article.title}" loading="lazy">
    </a>
    <div class="post-card-body">
      <span class="badge ${cat.color}">${cat.icon} ${cat.name}</span>
      <h3 class="post-card-title">
        <a href="${basePath}articles/${article.slug}.html">${article.title}</a>
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

// 2. Build Homepage (index.html)
function buildHomepage(articles) {
  const featured = articles.find(a => a.featured) || articles[0];
  const latestArticles = articles;

  const categoryPillsHtml = siteConfig.categories.map(cat => 
    `<a href="categories/${cat.slug}.html" class="category-pill ${cat.color}">
      <span>${cat.icon}</span> ${cat.name}
    </a>`
  ).join('');

  const featuredHtml = featured ? `
    <section class="featured-section">
      <div class="featured-card">
        <div class="featured-img-wrap">
          <img src="${featured.image || 'https://images.unsplash.com/photo-1511512578047-dfb367046420?w=1000'}" alt="${featured.title}">
        </div>
        <div class="featured-content">
          <div>
            <span class="badge ${getCategoryMeta(featured.category).color}">⭐ Featured Guide</span>
          </div>
          <h2 class="featured-title">
            <a href="articles/${featured.slug}.html">${featured.title}</a>
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

  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${siteConfig.siteTitle} — ${siteConfig.tagline}</title>
  <meta name="description" content="${siteConfig.description}">
  <link rel="canonical" href="${siteConfig.siteUrl}/">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="assets/css/style.css">
  
  <!-- OpenGraph / Pinterest Rich Pins -->
  <meta property="og:type" content="website">
  <meta property="og:url" content="${siteConfig.siteUrl}/">
  <meta property="og:title" content="${siteConfig.siteTitle} — Fun Party, Family & Classroom Games">
  <meta property="og:description" content="${siteConfig.description}">
  <meta property="og:image" content="${featured ? featured.image : ''}">

  <!-- Schema.org Website -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "name": "${siteConfig.siteTitle}",
    "url": "${siteConfig.siteUrl}/",
    "description": "${siteConfig.description}"
  }
  </script>
</head>
<body>
  ${renderHeader('home', '')}

  <main>
    <section class="hero">
      <div class="container">
        <div class="hero-pill">🎈 Ready to play? Hundreds of game rules & ideas</div>
        <h1 class="hero-title">Fun Games for <span class="gradient-text">Parties, Family Nights & Classrooms</span></h1>
        <p class="hero-subtitle">Fast, step-by-step game rules, party icebreakers, and free printables to make every gathering unforgettable.</p>
        
        <div class="category-pills">
          ${categoryPillsHtml}
        </div>
      </div>
    </section>

    <div class="container">
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

      <div id="no-results-msg" style="display:none; text-align:center; padding:3rem; color:var(--text-muted);">
        <h3>No games found matching your search.</h3>
        <p>Try searching for words like "Christmas", "Spoons", "Cards", or "Classroom".</p>
      </div>

      <!-- Pinterest & Printables Callout Banner -->
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

  fs.writeFileSync(path.join(OUTPUT_DIR, 'index.html'), html);
  console.log('✓ index.html built');
}

// 3. Build Category Pages
function buildCategoryPages(articles) {
  siteConfig.categories.forEach(cat => {
    const filteredArticles = articles.filter(a => (a.category || '').toLowerCase() === cat.name.toLowerCase());
    const postsHtml = filteredArticles.length > 0
      ? filteredArticles.map(a => renderPostCard(a, '../')).join('')
      : `<div style="grid-column: 1 / -1; text-align:center; padding: 4rem 1rem; color:var(--text-muted);">
           <h3>Articles coming very soon!</h3>
           <p>We are adding daily games to the ${cat.name} section.</p>
         </div>`;

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${cat.name} — GamesPlat.com</title>
  <meta name="description" content="${cat.description}">
  <link rel="canonical" href="${siteConfig.siteUrl}/categories/${cat.slug}.html">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
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

    fs.writeFileSync(path.join(CATEGORIES_OUT_DIR, `${cat.slug}.html`), html);
    console.log(`✓ categories/${cat.slug}.html built`);
  });
}

// 4. Build Article Pages
function buildArticlePages(articles) {
  articles.forEach(article => {
    const cat = getCategoryMeta(article.category);
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

    // FAQ schema if article.faqs array exists
    let faqSchema = '';
    let faqAccordionHtml = '';
    if (article.faqs && Array.isArray(article.faqs) && article.faqs.length > 0) {
      faqSchema = `
      <script type="application/ld+json">
      {
        "@context": "https://schema.org",
        "@type": "FAQPage",
        "mainEntity": [
          ${article.faqs.map(f => `{
            "@type": "Question",
            "name": ${JSON.stringify(f.q)},
            "acceptedAnswer": {
              "@type": "Answer",
              "text": ${JSON.stringify(f.a)}
            }
          }`).join(',')}
        ]
      }
      </script>`;

      faqAccordionHtml = `
      <section class="faq-section">
        <h2 style="font-size:1.8rem; font-weight:800; margin-bottom:1.25rem;">Frequently Asked Questions</h2>
        ${article.faqs.map(f => `
          <div class="faq-item">
            <button class="faq-question">
              <span>${f.q}</span>
              <span class="faq-arrow">▼</span>
            </button>
            <div class="faq-answer" style="display:none;">
              <p>${f.a}</p>
            </div>
          </div>
        `).join('')}
      </section>`;
    }

    const shareUrl = `${siteConfig.siteUrl}/articles/${article.slug}.html`;
    const shareTitle = encodeURIComponent(article.title);
    const pinImg = encodeURIComponent(article.pinterestImage || article.image || '');

    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${article.title} — GamesPlat</title>
  <meta name="description" content="${article.excerpt || ''}">
  <link rel="canonical" href="${shareUrl}">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
  <link rel="stylesheet" href="../assets/css/style.css">

  <!-- OpenGraph / Pinterest Rich Pin Meta Tags -->
  <meta property="og:type" content="article">
  <meta property="og:url" content="${shareUrl}">
  <meta property="og:title" content="${article.title}">
  <meta property="og:description" content="${article.excerpt || ''}">
  <meta property="og:image" content="${article.image || ''}">
  <meta property="article:published_time" content="${article.date}">
  <meta property="article:section" content="${cat.name}">

  <!-- Schema.org Article Structured Data -->
  <script type="application/ld+json">
  {
    "@context": "https://schema.org",
    "@type": "Article",
    "headline": ${JSON.stringify(article.title)},
    "description": ${JSON.stringify(article.excerpt || '')},
    "image": [${JSON.stringify(article.image || '')}],
    "datePublished": "${article.date}",
    "author": {
      "@type": "Person",
      "name": "${article.author || siteConfig.author}"
    },
    "publisher": {
      "@type": "Organization",
      "name": "${siteConfig.siteTitle}",
      "url": "${siteConfig.siteUrl}"
    }
  }
  </script>
  ${faqSchema}
</head>
<body>
  ${renderHeader(cat.slug, '../')}

  <main>
    <article class="container-narrow">
      <header class="article-header">
        <nav class="breadcrumbs">
          <a href="../index.html">Home</a>
          <span>›</span>
          <a href="../categories/${cat.slug}.html">${cat.name}</a>
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
          <a href="https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${pinImg}&description=${shareTitle}" target="_blank" rel="noopener" class="share-btn share-pinterest">📌 Save Pin</a>
          <a href="https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(shareUrl)}" target="_blank" rel="noopener" class="share-btn share-facebook">Facebook</a>
          <button class="share-btn share-copy">📋 Copy Link</button>
        </div>
      </header>

      ${article.image ? `<img src="${article.image}" alt="${article.title}" class="article-featured-img">` : ''}

      <!-- Game Specs Summary Box -->
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

      <!-- Main Article Body -->
      <div class="article-body">
        ${article.contentHtml}
      </div>

      <!-- Printable Download Box -->
      ${printableHtml}

      <!-- Pinterest Save Callout Box -->
      <div class="pinterest-pin-box">
        <div>
          <h4 style="font-weight:800; font-size:1.1rem; color:#991b1b; margin-bottom:0.25rem;">📌 Pin This Game For Later!</h4>
          <p style="font-size:0.88rem; color:#b91c1c;">Planning a party or game night? Save this idea to your Pinterest board so you don't lose it.</p>
        </div>
        <a href="https://pinterest.com/pin/create/button/?url=${encodeURIComponent(shareUrl)}&media=${pinImg}&description=${shareTitle}" target="_blank" rel="noopener" class="share-btn share-pinterest" style="white-space:nowrap; padding:0.6rem 1.2rem;">
          Save to Pinterest
        </a>
      </div>

      <!-- FAQ Section -->
      ${faqAccordionHtml}

      <!-- Author Box (E-E-A-T Google Requirement) -->
      <div style="background:var(--bg-alt); border-radius:var(--radius-md); padding:1.5rem; margin-top:2.5rem; display:flex; align-items:center; gap:1.25rem;">
        <div style="font-size:2.5rem; background:white; width:64px; height:64px; border-radius:var(--radius-full); display:flex; align-items:center; justify-content:center; box-shadow:var(--shadow-sm);">🎮</div>
        <div>
          <h4 style="font-weight:800; font-size:1.05rem;">Written by ${article.author || 'The GamesPlat Editorial Team'}</h4>
          <p style="font-size:0.88rem; color:var(--text-muted); margin-top:0.25rem;">We test, review, and explain party games, board game rules, and classroom activities to bring people together for screen-free fun.</p>
        </div>
      </div>

      <!-- Related Posts -->
      ${relatedHtml}
    </article>
  </main>

  ${renderFooter('../')}
</body>
</html>`;

    fs.writeFileSync(path.join(ARTICLES_OUT_DIR, `${article.slug}.html`), html);
    console.log(`✓ articles/${article.slug}.html built`);
  });
}

// 5. Build Legal & AdSense Compliance Pages
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
        <p>Have a question or game request? Feel free to <a href="contact.html" style="color:var(--primary); font-weight:700;">reach out to our team</a>!</p>
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
    const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${p.title} — GamesPlat.com</title>
  <link rel="canonical" href="${siteConfig.siteUrl}/${p.slug}.html">
  <link rel="preconnect" href="https://fonts.googleapis.com">
  <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
  <link href="https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&display=swap" rel="stylesheet">
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

    fs.writeFileSync(path.join(OUTPUT_DIR, `${p.slug}.html`), html);
    console.log(`✓ ${p.slug}.html built`);
  });
}

// 6. Build Sitemap.xml, Robots.txt & CNAME
function buildSEOFiles(articles) {
  // CNAME
  fs.writeFileSync(path.join(OUTPUT_DIR, 'CNAME'), `${siteConfig.domain}\n`);

  // Robots.txt
  const robots = `User-agent: *\nAllow: /\n\nSitemap: ${siteConfig.siteUrl}/sitemap.xml\n`;
  fs.writeFileSync(path.join(OUTPUT_DIR, 'robots.txt'), robots);

  // Sitemap.xml
  const currentDate = new Date().toISOString().split('T')[0];
  let urls = [
    `<url><loc>${siteConfig.siteUrl}/</loc><lastmod>${currentDate}</lastmod><changefreq>daily</changefreq><priority>1.0</priority></url>`,
    `<url><loc>${siteConfig.siteUrl}/about.html</loc><lastmod>${currentDate}</lastmod><priority>0.5</priority></url>`,
    `<url><loc>${siteConfig.siteUrl}/contact.html</loc><lastmod>${currentDate}</lastmod><priority>0.5</priority></url>`,
    `<url><loc>${siteConfig.siteUrl}/privacy-policy.html</loc><lastmod>${currentDate}</lastmod><priority>0.3</priority></url>`,
    `<url><loc>${siteConfig.siteUrl}/terms.html</loc><lastmod>${currentDate}</lastmod><priority>0.3</priority></url>`,
    `<url><loc>${siteConfig.siteUrl}/disclaimer.html</loc><lastmod>${currentDate}</lastmod><priority>0.3</priority></url>`
  ];

  siteConfig.categories.forEach(c => {
    urls.push(`<url><loc>${siteConfig.siteUrl}/categories/${c.slug}.html</loc><lastmod>${currentDate}</lastmod><changefreq>weekly</changefreq><priority>0.8</priority></url>`);
  });

  articles.forEach(a => {
    urls.push(`<url><loc>${siteConfig.siteUrl}/articles/${a.slug}.html</loc><lastmod>${a.date || currentDate}</lastmod><changefreq>monthly</changefreq><priority>0.9</priority></url>`);
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  ${urls.join('\n  ')}
</urlset>`;

  fs.writeFileSync(path.join(OUTPUT_DIR, 'sitemap.xml'), sitemap);
  console.log('✓ CNAME, robots.txt & sitemap.xml built');
}

// Master Build Execution
function run() {
  console.log('🚀 Building GamesPlat.com static site...');
  const articles = loadAllArticles();
  console.log(`Found ${articles.length} articles in content/articles/`);

  buildHomepage(articles);
  buildCategoryPages(articles);
  buildArticlePages(articles);
  buildLegalPages();
  buildSEOFiles(articles);

  console.log('🎉 Build completed successfully!');
}

run();
