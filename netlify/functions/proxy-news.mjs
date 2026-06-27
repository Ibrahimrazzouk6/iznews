/**
 * Netlify Edge Function — proxies NewsAPI.org requests server-side.
 * This avoids CORS issues in production since the browser never
 * hits newsapi.org directly.
 */

const NEWS_API_KEY = process.env.NEWS_API_KEY || '5b5087594fe94ac592af297897eba8f3';
const BASE = 'https://newsapi.org/v2';

export default async (request, context) => {
  const url = new URL(request.url);

  // Strip the /.netlify/functions/proxy-news prefix, keep the rest
  // e.g. /top-headlines?country=us  or  /everything?q=tech
  const path = url.pathname.replace(/^\/.netlify\/functions\/proxy-news/, '');
  const params = url.searchParams;

  // Inject the real API key server-side (never exposed to browser)
  params.set('apiKey', NEWS_API_KEY);

  const target = `${BASE}${path}?${params.toString()}`;

  try {
    const res = await fetch(target, {
      headers: { 'User-Agent': 'IzNews/1.0' },
    });
    const data = await res.text();

    return new Response(data, {
      status: res.status,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*',
        'Cache-Control': 'public, max-age=3600', // cache 1h on CDN
      },
    });
  } catch (err) {
    return new Response(JSON.stringify({ status: 'error', message: err.message }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const config = { path: '/api/news/*' };
