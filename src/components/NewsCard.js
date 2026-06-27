/**
 * NewsCard — clean card + full modal. No ads, no redirects.
 */

function formatDate(d) {
  if (!d) return '';
  try {
    return new Intl.DateTimeFormat('en', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }).format(new Date(d));
  } catch { return ''; }
}

function safeId(article) {
  return (article.id || article.sourceUrl || article.headline).replace(/[^a-zA-Z0-9]/g, '_').slice(0, 64);
}

export function createNewsCard(article) {
  const { headline, description, imageUrl, date, source } = article;
  const id = safeId(article);
  const time = formatDate(date);
  const snippet = description ? (description.length > 140 ? description.slice(0, 140) + '…' : description) : '';

  return `
    <article class="news-card" data-article-id="${id}" tabindex="0" role="article" aria-label="${headline.replace(/"/g, '&quot;')}">
      <div class="news-card__image">
        <img src="${imageUrl}" alt="${headline.replace(/"/g, '&quot;')}" class="lazy-img" loading="lazy" onerror="this.parentElement.style.display='none'"/>
        <div class="news-card__image-overlay"></div>
        ${source ? `<span class="news-card__source">${source}</span>` : ''}
      </div>
      <div class="news-card__body">
        ${time ? `<time class="news-card__time">${time}</time>` : ''}
        <h2 class="news-card__title">${headline}</h2>
        ${snippet ? `<p class="news-card__desc">${snippet}</p>` : '<div style="flex:1"></div>'}
        <button class="news-card__read-more read-more-btn" data-article-id="${id}" aria-label="Read more: ${headline.replace(/"/g, '&quot;')}">
          Read more
          <svg width="13" height="13" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M17 8l4 4m0 0l-4 4m4-4H3"/>
          </svg>
        </button>
      </div>
    </article>`;
}

export function openArticleModal(article) {
  document.getElementById('iz-modal')?.remove();

  const { headline, description, imageUrl, sourceUrl, date, source } = article;
  const time = formatDate(date);

  const wrap = document.createElement('div');
  wrap.id = 'iz-modal';
  wrap.className = 'iz-modal-backdrop';
  wrap.setAttribute('role', 'dialog');
  wrap.setAttribute('aria-modal', 'true');
  wrap.setAttribute('aria-label', headline);

  wrap.innerHTML = `
    <div class="iz-modal">
      <div class="iz-modal__hero">
        <img src="${imageUrl}" alt="${headline.replace(/"/g, '&quot;')}" onerror="this.parentElement.style.minHeight='80px';this.style.display='none'"/>
        <div class="iz-modal__hero-overlay"></div>
        <button id="iz-modal-close" class="iz-modal__close" aria-label="Close">
          <svg width="16" height="16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
        ${source ? `<span class="iz-modal__source">${source}</span>` : ''}
      </div>
      <div class="iz-modal__body">
        ${time ? `<time class="iz-modal__time">${time}</time>` : ''}
        <h1 class="iz-modal__title">${headline}</h1>
        <p class="iz-modal__desc">${description || 'No description available.'}</p>
        <div class="iz-modal__footer">
          <a href="${sourceUrl}" target="_blank" rel="noopener noreferrer" class="iz-modal__cta">
            Read Full Article
            <svg width="14" height="14" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2.5" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"/>
            </svg>
          </a>
        </div>
      </div>
    </div>`;

  document.body.appendChild(wrap);
  document.body.style.overflow = 'hidden';

  const close = () => { wrap.remove(); document.body.style.overflow = ''; };
  document.getElementById('iz-modal-close').addEventListener('click', close);
  wrap.addEventListener('click', e => { if (e.target === wrap) close(); });
  const onKey = e => { if (e.key === 'Escape') { close(); document.removeEventListener('keydown', onKey); } };
  document.addEventListener('keydown', onKey);
}

export function bindCardEvents(articles) {
  const map = new Map(articles.map(a => [safeId(a), a]));

  document.querySelectorAll('.read-more-btn').forEach(btn => {
    btn.addEventListener('click', e => {
      e.stopPropagation();
      const a = map.get(btn.dataset.articleId);
      if (a) openArticleModal(a);
    });
  });

  document.querySelectorAll('.news-card[data-article-id]').forEach(card => {
    const open = () => { const a = map.get(card.dataset.articleId); if (a) openArticleModal(a); };
    card.addEventListener('click', open);
    card.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(); } });
  });
}

export function initLazyImages() {
  const imgs = document.querySelectorAll('img.lazy-img');
  if (!imgs.length) return;
  if (!('IntersectionObserver' in window)) { imgs.forEach(i => i.classList.remove('lazy-img')); return; }
  const obs = new IntersectionObserver(entries => {
    entries.forEach(e => {
      if (e.isIntersecting) { e.target.classList.remove('lazy-img'); obs.unobserve(e.target); }
    });
  }, { rootMargin: '400px' });
  imgs.forEach(i => obs.observe(i));
}
