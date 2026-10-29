/* ==========================================================================
   GamesPlat.com — Main Client Script
   Interactive UI: Mobile Menu, Search Filter, FAQ Toggles, Social Share
   ========================================================================== */

document.addEventListener('DOMContentLoaded', () => {
  // Mobile Menu Toggle
  const menuToggle = document.querySelector('.mobile-menu-toggle');
  const navLinks = document.querySelector('.nav-links');

  if (menuToggle && navLinks) {
    menuToggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      menuToggle.setAttribute('aria-expanded', navLinks.classList.contains('open'));
    });
  }

  // FAQ Accordion
  const faqQuestions = document.querySelectorAll('.faq-question');
  faqQuestions.forEach(btn => {
    btn.addEventListener('click', () => {
      const answer = btn.nextElementSibling;
      const isOpen = answer.style.display === 'block';

      // Toggle current
      answer.style.display = isOpen ? 'none' : 'block';
      const arrow = btn.querySelector('.faq-arrow');
      if (arrow) {
        arrow.textContent = isOpen ? '▼' : '▲';
      }
    });
  });

  // Copy Link Button
  const copyBtn = document.querySelector('.share-copy');
  if (copyBtn) {
    copyBtn.addEventListener('click', async () => {
      try {
        await navigator.clipboard.writeText(window.location.href);
        const origText = copyBtn.innerHTML;
        copyBtn.innerHTML = '<span>✓ Copied!</span>';
        setTimeout(() => {
          copyBtn.innerHTML = origText;
        }, 2000);
      } catch (err) {
        console.error('Could not copy URL', err);
      }
    });
  }

  // Live Post Search Filter (if search input exists)
  const searchInput = document.querySelector('#site-search-input');
  if (searchInput) {
    searchInput.addEventListener('input', (e) => {
      const query = e.target.value.toLowerCase().trim();
      const cards = document.querySelectorAll('.post-card');
      let foundCount = 0;

      cards.forEach(card => {
        const title = card.querySelector('.post-card-title')?.textContent.toLowerCase() || '';
        const excerpt = card.querySelector('.post-card-excerpt')?.textContent.toLowerCase() || '';
        const category = card.querySelector('.badge')?.textContent.toLowerCase() || '';

        if (title.includes(query) || excerpt.includes(query) || category.includes(query)) {
          card.style.display = 'flex';
          foundCount++;
        } else {
          card.style.display = 'none';
        }
      });

      const noResultsMsg = document.querySelector('#no-results-msg');
      if (noResultsMsg) {
        noResultsMsg.style.display = (foundCount === 0 && query !== '') ? 'block' : 'none';
      }
    });
  }
});
