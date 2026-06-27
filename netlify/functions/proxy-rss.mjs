/**
 * Netlify Edge Function — proxies RSS feeds server-side.
 * Resolves CORS issues since RSS sites block browser requests.
 */

// Map of proxyKey → real RSS URL
const RSS_MAP = {
  // General
  'bbc-general':      'https://feeds.bbci.co.uk/news/rss.xml',
  'aljazeera':        'https://www.aljazeera.com/xml/rss/all.xml',
  'dw-general':       'https://rss.dw.com/xml/rss-en-all',
  'npr':              'https://feeds.npr.org/1001/rss.xml',
  'guardian-general': 'https://www.theguardian.com/world/rss',
  // Technology
  'verge':            'https://www.theverge.com/rss/index.xml',
  'wired':            'https://www.wired.com/feed/rss',
  'techcrunch':       'https://techcrunch.com/feed/',
  'ars':              'https://feeds.arstechnica.com/arstechnica/index',
  'bbc-tech':         'https://feeds.bbci.co.uk/news/technology/rss.xml',
  'mit':              'https://www.technologyreview.com/feed/',
  // Business
  'bbc-business':     'https://feeds.bbci.co.uk/news/business/rss.xml',
  'forbes':           'https://www.forbes.com/business/feed/',
  'guardian-biz':     'https://www.theguardian.com/business/rss',
  'marketwatch':      'https://feeds.marketwatch.com/marketwatch/topstories/',
  // Sports
  'bbc-sport':        'https://feeds.bbci.co.uk/sport/rss.xml',
  'espn':             'https://www.espn.com/espn/rss/news',
  'sky-sport':        'https://www.skysports.com/rss/12040',
  'guardian-sport':   'https://www.theguardian.com/sport/rss',
  'bleacher':         'https://bleacherreport.com/articles/feed',
  // Entertainment
  'variety':          'https://variety.com/feed/',
  'thr':              'https://www.hollywoodreporter.com/feed/',
  'bbc-ent':          'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml',
  'deadline':         'https://deadline.com/feed/',
  // Health
  'bbc-health':       'https://feeds.bbci.co.uk/news/health/rss.xml',
  'webmd':            'https://rssfeeds.webmd.com/rss/rss.aspx?RSSSource=RSS_PUBLIC',
  'harvard':          'https://www.health.harvard.edu/blog/feed',
  'mnt':              'https://www.medicalnewstoday.com/rss',
  // Science
  'sciencedaily':     'https://www.sciencedaily.com/rss/all.xml',
  'nasa':             'https://www.nasa.gov/rss/dyn/breaking_news.rss',
  'newscientist':     'https://www.newscientist.com/feed/home/',
  'bbc-science':      'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml',
  'nature':           'https://www.nature.com/nature.rss',
  'guardian-sci':     'https://www.theguardian.com/science/rss',
};

export default async (request, context) => {
  const url = new URL(request.url);
  // Extract the key: /rss/bbc-general → bbc-general
  const key = url.pathname.replace(/^\/.netlify\/functions\/proxy-rss\//, '').replace(/^\/rss\//, '');
  const target = RSS_MAP[key];

  if (!target) {
    return new Response(`Unknown RSS source: ${key}`, { status: 404 });
  }

  try {
    const res = await fetch(target, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (compatible; IzNews/1.0)',
        'Accept': 'application/rss+xml, application/xml, text/xml, */*',
      },
      signal: AbortSignal.timeout(10000),
    });

    if (!res.ok) throw new Error(`Upstream ${res.status}`);
    const xml = await res.text();

    return new Response(xml, {
      status: 200,
      headers: {
        'Content-Type': 'application/xml; charset=utf-8',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600',
      },
    });
  } catch (err) {
    return new Response(`RSS fetch failed: ${err.message}`, { status: 502 });
  }
};

export const config = { path: '/rss/*' };
