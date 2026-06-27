/**
 * ErrorState — user-friendly error/empty states. English only.
 */
export function createErrorState(i18n, type = 'no-news') {
  const configs = {
    'no-news': {
      icon: `<svg class="w-16 h-16 text-white/25 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"/>
      </svg>`,
      title: 'News currently unavailable',
      desc:  'Could not fetch the latest news. Please try again.',
      showRefresh: true,
    },
    'error': {
      icon: `<svg class="w-16 h-16 text-red-400/50 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
      </svg>`,
      title: 'Something went wrong',
      desc:  'Failed to load news. Check your connection and try again.',
      showRefresh: true,
    },
    'rate-limit': {
      icon: `<svg class="w-16 h-16 text-yellow-400/50 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/>
      </svg>`,
      title: 'API rate limit reached',
      desc:  'Too many requests. The dashboard will auto-refresh shortly.',
      showRefresh: true,
    },
    'no-results': {
      icon: `<svg class="w-16 h-16 text-white/25 mx-auto mb-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"/>
      </svg>`,
      title: 'No results found',
      desc:  'Try a different search term or browse a category.',
      showRefresh: false,
    },
  };

  const cfg = configs[type] || configs['no-news'];

  return `
    <div class="col-span-full flex flex-col items-center justify-center py-24 text-center px-4" role="status">
      ${cfg.icon}
      <h3 class="text-white/80 text-xl font-semibold mb-2">${cfg.title}</h3>
      <p class="text-white/45 text-sm mb-6 max-w-sm">${cfg.desc}</p>
      ${cfg.showRefresh ? `
        <button id="error-refresh-btn"
          class="px-6 py-2.5 bg-sky-500 hover:bg-sky-400 text-white font-semibold rounded-full transition-colors flex items-center gap-2">
          <svg class="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"/>
          </svg>
          Refresh
        </button>` : ''}
    </div>`;
}
