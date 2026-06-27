import { defineConfig } from 'vite';

// Helper — creates a proxy entry that strips the proxyPath prefix
const rss = (proxyPath, targetBase, targetPath) => ({
  [proxyPath]: {
    target: targetBase,
    changeOrigin: true,
    rewrite: p => p.replace(new RegExp(`^${proxyPath}`), targetPath),
  }
});

export default defineConfig({
  build: { target: 'esnext' },
  server: {
    port: 3000,
    proxy: {
      // NewsAPI
      '/api/news': { target: 'https://newsapi.org/v2', changeOrigin: true, rewrite: p => p.replace(/^\/api\/news/, '') },

      // ── General ──────────────────────────────────────────────
      ...rss('/rss/bbc-general',      'https://feeds.bbci.co.uk',          '/news/rss.xml'),
      ...rss('/rss/reuters',          'https://feeds.reuters.com',         '/reuters/topNews'),
      ...rss('/rss/aljazeera',        'https://www.aljazeera.com',         '/xml/rss/all.xml'),
      ...rss('/rss/dw-general',       'https://rss.dw.com',                '/xml/rss-en-all'),
      ...rss('/rss/npr',              'https://feeds.npr.org',             '/1001/rss.xml'),
      ...rss('/rss/guardian-general', 'https://www.theguardian.com',       '/world/rss'),

      // ── Technology ───────────────────────────────────────────
      ...rss('/rss/verge',            'https://www.theverge.com',          '/rss/index.xml'),
      ...rss('/rss/wired',            'https://www.wired.com',             '/feed/rss'),
      ...rss('/rss/techcrunch',       'https://techcrunch.com',            '/feed/'),
      ...rss('/rss/ars',              'https://feeds.arstechnica.com',     '/arstechnica/index'),
      ...rss('/rss/bbc-tech',         'https://feeds.bbci.co.uk',          '/news/technology/rss.xml'),
      ...rss('/rss/mit',              'https://www.technologyreview.com',  '/feed/'),

      // ── Business ─────────────────────────────────────────────
      ...rss('/rss/bbc-business',     'https://feeds.bbci.co.uk',          '/news/business/rss.xml'),
      ...rss('/rss/reuters-biz',      'https://feeds.reuters.com',         '/reuters/businessNews'),
      ...rss('/rss/ft',               'https://www.ft.com',                '/?format=rss'),
      ...rss('/rss/forbes',           'https://www.forbes.com',            '/business/feed/'),
      ...rss('/rss/guardian-biz',     'https://www.theguardian.com',       '/business/rss'),
      ...rss('/rss/marketwatch',      'https://feeds.marketwatch.com',     '/marketwatch/topstories/'),

      // ── Sports ───────────────────────────────────────────────
      ...rss('/rss/bbc-sport',        'https://feeds.bbci.co.uk',          '/sport/rss.xml'),
      ...rss('/rss/espn',             'https://www.espn.com',              '/espn/rss/news'),
      ...rss('/rss/sky-sport',        'https://www.skysports.com',         '/rss/12040'),
      ...rss('/rss/guardian-sport',   'https://www.theguardian.com',       '/sport/rss'),
      ...rss('/rss/bleacher',         'https://bleacherreport.com',        '/articles/feed'),

      // ── Entertainment ─────────────────────────────────────────
      ...rss('/rss/variety',          'https://variety.com',               '/feed/'),
      ...rss('/rss/thr',              'https://www.hollywoodreporter.com', '/feed/'),
      ...rss('/rss/ew',               'https://ew.com',                    '/feed/'),
      ...rss('/rss/bbc-ent',          'https://feeds.bbci.co.uk',          '/news/entertainment_and_arts/rss.xml'),
      ...rss('/rss/deadline',         'https://deadline.com',              '/feed/'),

      // ── Health ───────────────────────────────────────────────
      ...rss('/rss/bbc-health',       'https://feeds.bbci.co.uk',          '/news/health/rss.xml'),
      ...rss('/rss/reuters-health',   'https://feeds.reuters.com',         '/reuters/healthNews'),
      ...rss('/rss/webmd',            'https://rssfeeds.webmd.com',        '/rss/rss.aspx?RSSSource=RSS_PUBLIC'),
      ...rss('/rss/harvard',          'https://www.health.harvard.edu',    '/blog/feed'),
      ...rss('/rss/mnt',              'https://www.medicalnewstoday.com',  '/rss'),

      // ── Science ──────────────────────────────────────────────
      ...rss('/rss/sciencedaily',     'https://www.sciencedaily.com',      '/rss/all.xml'),
      ...rss('/rss/nasa',             'https://www.nasa.gov',              '/rss/dyn/breaking_news.rss'),
      ...rss('/rss/newscientist',     'https://www.newscientist.com',      '/feed/home/'),
      ...rss('/rss/bbc-science',      'https://feeds.bbci.co.uk',          '/news/science_and_environment/rss.xml'),
      ...rss('/rss/nature',           'https://www.nature.com',            '/nature.rss'),
      ...rss('/rss/guardian-sci',     'https://www.theguardian.com',       '/science/rss'),
    },
  },
});
