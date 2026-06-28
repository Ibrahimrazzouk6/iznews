import './styles/main.css';
import { fetchAllNews, fetchTopHeadlines, searchNews } from './services/NewsService.js';
import { renderSkeletons } from './components/SkeletonCard.js';
import { createNewsCard, bindCardEvents, initLazyImages } from './components/NewsCard.js';
import { createErrorState } from './components/ErrorState.js';

// ─── Constants ────────────────────────────────────────────────
const AUTO_REFRESH_MS   = 24 * 60 * 60 * 1000; // 24 hours
const AUTO_REFRESH_SECS = AUTO_REFRESH_MS / 1000;
const MAX_ARTICLES      = 1000;
const CATEGORIES = ['general','technology','business','sports','entertainment','health','science'];

// ─── State ────────────────────────────────────────────────────
const state = {
  category:        'general',
  searchQuery:     '',
  theme:           localStorage.getItem('nd-theme') || 'dark',
  articles:        [],
  isLoading:       false,
  countdown:       AUTO_REFRESH_SECS,
  countdownTimer:  null,
  refreshTimer:    null,
};

// ─── DOM ──────────────────────────────────────────────────────
const $  = id => document.getElementById(id);
const newsGrid         = $('news-grid');
const searchInput      = $('search-input');
const searchBtn        = $('search-btn');
const hamburgerBtn     = $('hamburger-btn');
const mobileMenu       = $('mobile-menu');
const mobileMenuClose  = $('mobile-menu-close');
const mobileMenuOverlay= $('mobile-menu-overlay');
const categoryNav      = $('category-nav');
const mobileCategoryNav= $('mobile-category-nav');
const themeToggle      = $('theme-toggle');
const refreshCountdown = $('refresh-countdown');
const refreshBar       = $('refresh-bar');
const toastContainer   = $('toast-container');
const lastUpdated      = $('last-updated');
const articleCount     = $('article-count');

// ─── Theme ────────────────────────────────────────────────────
function applyTheme(t) {
  document.documentElement.setAttribute('data-theme', t);
  const icon = $('theme-icon');
  if (!icon) return;
  icon.innerHTML = t === 'dark'
    ? `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"/>`
    : `<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>`;
}
themeToggle?.addEventListener('click', () => {
  state.theme = state.theme === 'dark' ? 'light' : 'dark';
  localStorage.setItem('nd-theme', state.theme);
  applyTheme(state.theme);
});

// ─── Category Pills ───────────────────────────────────────────
function renderCategoryPills() {
  const html = CATEGORIES.map(cat => `
    <button
      class="category-pill flex-shrink-0 px-4 py-1.5 rounded-full text-sm font-medium border border-white/20
             text-white/70 hover:text-white hover:border-white/40 transition-all duration-200
             ${state.category === cat ? 'active' : ''}"
      data-category="${cat}"
      aria-pressed="${state.category === cat}"
    >${cat.charAt(0).toUpperCase() + cat.slice(1)}</button>
  `).join('');

  if (categoryNav)       categoryNav.innerHTML       = html;
  if (mobileCategoryNav) mobileCategoryNav.innerHTML = html;

  document.querySelectorAll('.category-pill').forEach(btn => {
    btn.addEventListener('click', () => {
      state.category   = btn.dataset.category;
      state.searchQuery = '';
      if (searchInput) searchInput.value = '';
      renderCategoryPills();
      loadNews();
      closeMobileMenu();
    });
  });
}

// ─── Mobile Menu ──────────────────────────────────────────────
function openMobileMenu() {
  mobileMenu?.classList.add('open');
  mobileMenuOverlay?.classList.remove('hidden');
  hamburgerBtn?.setAttribute('aria-expanded', 'true');
  document.body.style.overflow = 'hidden';
}
function closeMobileMenu() {
  mobileMenu?.classList.remove('open');
  mobileMenuOverlay?.classList.add('hidden');
  hamburgerBtn?.setAttribute('aria-expanded', 'false');
  document.body.style.overflow = '';
}

hamburgerBtn?.addEventListener('click', openMobileMenu);
mobileMenuClose?.addEventListener('click', closeMobileMenu);
mobileMenuOverlay?.addEventListener('click', closeMobileMenu);
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMobileMenu(); });

// ─── News Loading ─────────────────────────────────────────────
async function loadNews() {
  if (state.isLoading) return;
  state.isLoading = true;

  renderSkeletons(newsGrid, 16);

  try {
    // ── 1. Fetch raw articles ──────────────────────────────
    let articles;
    if (state.searchQuery.trim()) {
      articles = await searchNews(state.searchQuery, 'en', 100);
    } else {
      articles = await fetchAllNews('en', 'us', state.category);
    }

    // ── 2. Keep only articles with images ─────────────────
    articles = articles.filter(a => a.imageUrl?.trim());

    // ── 3. Cap at MAX_ARTICLES ─────────────────────────────
    articles = articles.slice(0, MAX_ARTICLES);

    if (!articles.length) {
      newsGrid.innerHTML = createErrorState({ t: k => translations[k] || k }, state.searchQuery ? 'no-results' : 'no-news');
      state.isLoading = false;
      return;
    }

    // Render articles
    state.articles = articles;
    renderArticles(articles);
    updateMeta(articles.length);
    resetCountdown();

  } catch (err) {
    console.error('[loadNews]', err.message);
    newsGrid.innerHTML = createErrorState({ t: k => translations[k] || k }, err.message === 'RATE_LIMIT' ? 'rate-limit' : 'error');
    showToast(err.message === 'RATE_LIMIT' ? 'API rate limit reached.' : 'Failed to load news.', 'error');
  } finally {
    state.isLoading = false;
    $('error-refresh-btn')?.addEventListener('click', loadNews);
  }
}

function renderArticles(articles) {
  newsGrid.innerHTML = articles.map(a => createNewsCard(a)).join('');
  initLazyImages();
  bindCardEvents(articles);
  updateTicker(articles);
}

// ─── Update article count + last-updated ─────────────────────
function updateMeta(count) {
  if (articleCount) articleCount.textContent = `${count} articles`;
  if (lastUpdated) {
    lastUpdated.textContent = `Updated: ${new Intl.DateTimeFormat('en', {
      hour: '2-digit', minute: '2-digit'
    }).format(new Date())}`;
  }
}

// ─── Breaking ticker ──────────────────────────────────────────
function updateTicker(articles) {
  const ticker = $('breaking-ticker');
  if (!ticker || !articles.length) return;
  const headlines = articles.slice(0, 8).map(a => a.headline);
  let idx = 0;
  ticker.textContent = headlines[0];
  clearInterval(window._tickerInterval);
  window._tickerInterval = setInterval(() => {
    idx = (idx + 1) % headlines.length;
    ticker.style.opacity = '0';
    setTimeout(() => { ticker.textContent = headlines[idx]; ticker.style.opacity = '1'; }, 300);
  }, 5000);
}

// ─── Countdown ────────────────────────────────────────────────
function resetCountdown() {
  state.countdown = AUTO_REFRESH_SECS;
  clearInterval(state.countdownTimer);
  clearTimeout(state.refreshTimer);

  state.countdownTimer = setInterval(() => {
    state.countdown--;
    const h = Math.floor(state.countdown / 3600);
    const m = Math.floor((state.countdown % 3600) / 60);
    if (refreshCountdown) refreshCountdown.textContent = `Next refresh in ${h}h ${m}m`;
    if (refreshBar) refreshBar.style.transform = `scaleX(${1 - state.countdown / AUTO_REFRESH_SECS})`;
    if (state.countdown <= 0) {
      clearInterval(state.countdownTimer);
      loadNews();
    }
  }, 1000);
}

// ─── Toast ────────────────────────────────────────────────────
function showToast(msg, type = 'info') {
  if (!toastContainer) return;
  const colors = { info: 'bg-slate-700', error: 'bg-red-500/80', success: 'bg-green-500/80' };
  const el = document.createElement('div');
  el.className = `toast ${colors[type]} text-white text-sm px-4 py-3 rounded-xl shadow-lg backdrop-blur-sm max-w-xs`;
  el.textContent = msg;
  el.setAttribute('role', 'alert');
  toastContainer.appendChild(el);
  setTimeout(() => el.remove(), 3200);
}

// ─── Search ───────────────────────────────────────────────────
function handleSearch() {
  const q = searchInput?.value.trim();
  if (!q) return;
  state.searchQuery = q;
  state.category = 'general';
  renderCategoryPills();
  loadNews();
}
searchBtn?.addEventListener('click', handleSearch);
searchInput?.addEventListener('keydown', e => { if (e.key === 'Enter') handleSearch(); });

// ─── Minimal i18n stub (EN only) ─────────────────────────────
const translations = {
  noNews: 'News currently unavailable',
  noNewsDesc: 'Could not fetch the latest news. Please try again.',
  noResults: 'No results found',
  noResultsDesc: 'Try a different search term or category.',
  fetchError: 'Failed to load news.',
  rateLimitError: 'API rate limit reached. Please wait.',
  refresh: 'Refresh',
};

// ─── Init ─────────────────────────────────────────────────────
document.title = 'IzNews';
applyTheme(state.theme);
renderCategoryPills();
loadNews();
