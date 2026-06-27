/**
 * NewsService — NewsAPI.org + category-specific RSS feeds.
 * Each category has dedicated RSS sources for real, relevant news.
 */

const API_KEY = import.meta.env.VITE_NEWS_API_KEY;
// Always use relative proxy path — works via Vite in dev, Netlify function in prod
const API_BASE = '/api/news';

// ─── Category-specific RSS sources ───────────────────────────
// Each category has its own curated, tested feed list.
const CATEGORY_RSS = {
  general: [
    { name: 'BBC News',      proxyPath: '/rss/bbc-general',      directUrl: 'https://feeds.bbci.co.uk/news/rss.xml' },
    { name: 'Reuters',       proxyPath: '/rss/reuters',          directUrl: 'https://feeds.reuters.com/reuters/topNews' },    { name: 'Al Jazeera',    proxyPath: '/rss/aljazeera',        directUrl: 'https://www.aljazeera.com/xml/rss/all.xml' },
    { name: 'DW News',       proxyPath: '/rss/dw-general',       directUrl: 'https://rss.dw.com/xml/rss-en-all' },
    { name: 'NPR News',      proxyPath: '/rss/npr',              directUrl: 'https://feeds.npr.org/1001/rss.xml' },
    { name: 'The Guardian',  proxyPath: '/rss/guardian-general', directUrl: 'https://www.theguardian.com/world/rss' },
  ],
  technology: [
    { name: 'The Verge',     proxyPath: '/rss/verge',            directUrl: 'https://www.theverge.com/rss/index.xml' },
    { name: 'Wired',         proxyPath: '/rss/wired',            directUrl: 'https://www.wired.com/feed/rss' },
    { name: 'TechCrunch',    proxyPath: '/rss/techcrunch',       directUrl: 'https://techcrunch.com/feed/' },
    { name: 'Ars Technica',  proxyPath: '/rss/ars',              directUrl: 'https://feeds.arstechnica.com/arstechnica/index' },
    { name: 'BBC Tech',      proxyPath: '/rss/bbc-tech',         directUrl: 'https://feeds.bbci.co.uk/news/technology/rss.xml' },
    { name: 'MIT Tech Review', proxyPath: '/rss/mit',            directUrl: 'https://www.technologyreview.com/feed/' },
  ],
  business: [
    { name: 'BBC Business',  proxyPath: '/rss/bbc-business',     directUrl: 'https://feeds.bbci.co.uk/news/business/rss.xml' },
    { name: 'Reuters Biz',   proxyPath: '/rss/reuters-biz',      directUrl: 'https://feeds.reuters.com/reuters/businessNews' },
    { name: 'Financial Times', proxyPath: '/rss/ft',             directUrl: 'https://www.ft.com/?format=rss' },
    { name: 'Forbes',        proxyPath: '/rss/forbes',           directUrl: 'https://www.forbes.com/business/feed/' },
    { name: 'The Guardian Biz', proxyPath: '/rss/guardian-biz',  directUrl: 'https://www.theguardian.com/business/rss' },
    { name: 'MarketWatch',   proxyPath: '/rss/marketwatch',      directUrl: 'https://feeds.marketwatch.com/marketwatch/topstories/' },
  ],
  sports: [
    { name: 'BBC Sport',     proxyPath: '/rss/bbc-sport',        directUrl: 'https://feeds.bbci.co.uk/sport/rss.xml' },
    { name: 'ESPN',          proxyPath: '/rss/espn',             directUrl: 'https://www.espn.com/espn/rss/news' },
    { name: 'Sky Sports',    proxyPath: '/rss/sky-sport',        directUrl: 'https://www.skysports.com/rss/12040' },
    { name: 'The Guardian Sport', proxyPath: '/rss/guardian-sport', directUrl: 'https://www.theguardian.com/sport/rss' },
    { name: 'Bleacher Report', proxyPath: '/rss/bleacher',       directUrl: 'https://bleacherreport.com/articles/feed' },
  ],
  entertainment: [
    { name: 'Variety',       proxyPath: '/rss/variety',          directUrl: 'https://variety.com/feed/' },
    { name: 'Hollywood Reporter', proxyPath: '/rss/thr',         directUrl: 'https://www.hollywoodreporter.com/feed/' },
    { name: 'Entertainment Weekly', proxyPath: '/rss/ew',        directUrl: 'https://ew.com/feed/' },
    { name: 'BBC Ent',       proxyPath: '/rss/bbc-ent',          directUrl: 'https://feeds.bbci.co.uk/news/entertainment_and_arts/rss.xml' },
    { name: 'Deadline',      proxyPath: '/rss/deadline',         directUrl: 'https://deadline.com/feed/' },
  ],
  health: [
    { name: 'BBC Health',    proxyPath: '/rss/bbc-health',       directUrl: 'https://feeds.bbci.co.uk/news/health/rss.xml' },
    { name: 'Reuters Health', proxyPath: '/rss/reuters-health',  directUrl: 'https://feeds.reuters.com/reuters/healthNews' },
    { name: 'WebMD',         proxyPath: '/rss/webmd',            directUrl: 'https://rssfeeds.webmd.com/rss/rss.aspx?RSSSource=RSS_PUBLIC' },
    { name: 'Harvard Health', proxyPath: '/rss/harvard',         directUrl: 'https://www.health.harvard.edu/blog/feed' },
    { name: 'Medical News Today', proxyPath: '/rss/mnt',         directUrl: 'https://www.medicalnewstoday.com/rss' },
  ],
  science: [
    { name: 'Science Daily', proxyPath: '/rss/sciencedaily',     directUrl: 'https://www.sciencedaily.com/rss/all.xml' },
    { name: 'NASA',          proxyPath: '/rss/nasa',             directUrl: 'https://www.nasa.gov/rss/dyn/breaking_news.rss' },
    { name: 'New Scientist', proxyPath: '/rss/newscientist',     directUrl: 'https://www.newscientist.com/feed/home/' },
    { name: 'BBC Science',   proxyPath: '/rss/bbc-science',      directUrl: 'https://feeds.bbci.co.uk/news/science_and_environment/rss.xml' },
    { name: 'Nature',        proxyPath: '/rss/nature',           directUrl: 'https://www.nature.com/nature.rss' },
    { name: 'The Guardian Science', proxyPath: '/rss/guardian-sci', directUrl: 'https://www.theguardian.com/science/rss' },
  ],
};

// ─── Normalizers ──────────────────────────────────────────────
function normalizeApiArticle(raw) {
  return {
    headline:    raw.title        || '',
    description: raw.description  || raw.content || '',
    imageUrl:    raw.urlToImage   || null,
    sourceUrl:   raw.url          || '#',
    date:        raw.publishedAt  || null,
    source:      raw.source?.name || 'NewsAPI',
    id:          raw.url          || `${raw.title}-${raw.publishedAt}`,
  };
}

// ─── Image Extraction ─────────────────────────────────────────
function extractImage(item) {
  const mediaNS = 'http://search.yahoo.com/mrss/';
  const mediaContent   = item.getElementsByTagNameNS(mediaNS, 'content')[0];
  const mediaThumbnail = item.getElementsByTagNameNS(mediaNS, 'thumbnail')[0];
  if (mediaContent?.getAttribute('url'))   return mediaContent.getAttribute('url');
  if (mediaThumbnail?.getAttribute('url')) return mediaThumbnail.getAttribute('url');

  const enclosure = item.querySelector('enclosure');
  if (enclosure?.getAttribute('url')) return enclosure.getAttribute('url');

  const imageUrlEl = item.querySelector('image url');
  if (imageUrlEl?.textContent) return imageUrlEl.textContent.trim();

  const descEl   = item.querySelector('description, summary');
  const descText = descEl?.textContent || '';
  const tagMatch = descText.match(/<img[^>]+src=["']([^"']+)["']/i);
  if (tagMatch?.[1]) return tagMatch[1];

  const urlMatch = descText.match(/https?:\/\/[^\s"'<>]+\.(?:jpg|jpeg|png|webp|gif)(?:\?[^\s"'<>]*)?/i);
  if (urlMatch?.[0]) return urlMatch[0];

  return null;
}

// ─── RSS Parser ───────────────────────────────────────────────
function parseRSS(xml, sourceName) {
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  if (doc.querySelector('parsererror')) throw new Error(`RSS parse error: ${sourceName}`);

  return Array.from(doc.querySelectorAll('item, entry')).map(item => {
    const title   = item.querySelector('title')?.textContent?.trim() || '';
    const linkEl  = item.querySelector('link');
    const link    = linkEl?.textContent?.trim() || linkEl?.getAttribute('href') || '#';
    const contentNS     = 'http://purl.org/rss/1.0/modules/content/';
    const contentEncoded = item.getElementsByTagNameNS(contentNS, 'encoded')[0];
    const descRaw = contentEncoded?.textContent
                 || item.querySelector('description, summary')?.textContent || '';
    const descClean = descRaw.replace(/<[^>]+>/g, '').replace(/\s+/g, ' ').trim().slice(0, 300);
    const date     = item.querySelector('pubDate, published, updated')?.textContent?.trim() || null;
    const imageUrl = extractImage(item);
    return { headline: title, description: descClean, imageUrl, sourceUrl: link, date, source: sourceName, id: link || `${title}-${date}` };
  }).filter(a => a.headline);
}

// ─── RSS Fetcher ──────────────────────────────────────────────
async function fetchRSSFeed(source) {
  // Always use proxy path — works on dev (Vite proxy) and prod (Netlify function)
  const url = source.proxyPath;
  try {
    const res = await fetch(url, { signal: AbortSignal.timeout(10000) });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    return parseRSS(await res.text(), source.name).slice(0, 50); // 50 per source for 1000+ total
  } catch (err) {
    console.warn(`[RSS] ${source.name}:`, err.message);
    return [];
  }
}

// ─── Public API ───────────────────────────────────────────────

/** NewsAPI top-headlines */
export async function fetchTopHeadlines({ country, language }, category = 'general', query = '', pageSize = 100) {
  // API key is injected server-side by the Netlify proxy function
  const params = new URLSearchParams({ pageSize: String(pageSize), country, language });
  if (category && category !== 'general') params.set('category', category);
  if (query.trim()) { params.set('q', query.trim()); params.delete('country'); }

  const res  = await fetch(`${API_BASE}/top-headlines?${params}`);
  if (!res.ok) throw new Error(res.status === 429 ? 'RATE_LIMIT' : `API_ERROR:${res.status}`);
  const data = await res.json();
  if (data.status !== 'ok') throw new Error(data.message || 'API error');
  return (data.articles || []).filter(a => a.title && a.title !== '[Removed]').map(normalizeApiArticle);
}

/** NewsAPI everything search */
export async function searchNews(query, language = 'en', pageSize = 100) {
  if (!query.trim()) return [];
  const params = new URLSearchParams({ q: query.trim(), language, pageSize: String(pageSize), sortBy: 'publishedAt' });
  const res  = await fetch(`${API_BASE}/everything?${params}`);
  if (!res.ok) throw new Error(res.status === 429 ? 'RATE_LIMIT' : `API_ERROR:${res.status}`);
  const data = await res.json();
  if (data.status !== 'ok') throw new Error(data.message || 'API error');
  return (data.articles || []).filter(a => a.title && a.title !== '[Removed]').map(normalizeApiArticle);
}

/**
 * Main fetch: NewsAPI (100) + category-specific RSS feeds (30 each).
 * Returns only articles with images, deduplicated, sorted newest first.
 */
export async function fetchAllNews(lang = 'en', country = 'us', category = 'general') {
  const sources = CATEGORY_RSS[category] || CATEGORY_RSS.general;

  const [apiResult, ...rssResults] = await Promise.allSettled([
    fetchTopHeadlines({ country, language: lang }, category),
    ...sources.map(fetchRSSFeed),
  ]);

  const api = apiResult.status === 'fulfilled' ? apiResult.value : [];
  const rss = rssResults.flatMap(r => r.status === 'fulfilled' ? r.value : []);

  const merged = [...api, ...rss]
    .filter(a => a.headline && a.imageUrl)
    .sort((a, b) => (b.date ? new Date(b.date) : 0) - (a.date ? new Date(a.date) : 0));

  const seen = new Set();
  return merged.filter(a => { if (seen.has(a.sourceUrl)) return false; seen.add(a.sourceUrl); return true; });
}
