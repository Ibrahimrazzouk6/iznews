/**
 * AIService — uses Google Gemini to enhance article summaries.
 * Enhances in batches and caches results in sessionStorage.
 * Falls back to original content if API fails or is slow.
 */

const GEMINI_KEY = import.meta.env.VITE_GEMINI_KEY;
const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_KEY}`;
const CACHE_PREFIX = 'ai_summary_';

/**
 * Enhance a single article's description using Gemini.
 * Returns enhanced text, or original description on failure.
 */
export async function enhanceArticle(article) {
  const cacheKey = CACHE_PREFIX + btoa(article.sourceUrl || article.headline).slice(0, 40);

  // Return cached result if available
  const cached = sessionStorage.getItem(cacheKey);
  if (cached) return { ...article, description: cached, aiEnhanced: true };

  const prompt = `You are a professional news editor. Given the following news headline and brief description, write a clear, engaging 2-3 sentence summary in English. Be factual, concise, and informative. Do not add opinions or speculation.

Headline: ${article.headline}
Description: ${article.description || 'No description available.'}

Write only the summary, nothing else.`;

  try {
    const res = await fetch(GEMINI_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        contents: [{ parts: [{ text: prompt }] }],
        generationConfig: { temperature: 0.3, maxOutputTokens: 200 },
      }),
      signal: AbortSignal.timeout(8000),
    });

    if (!res.ok) throw new Error(`Gemini HTTP ${res.status}`);

    const data = await res.json();
    const enhanced = data?.candidates?.[0]?.content?.parts?.[0]?.text?.trim();

    if (enhanced) {
      sessionStorage.setItem(cacheKey, enhanced);
      return { ...article, description: enhanced, aiEnhanced: true };
    }
  } catch (err) {
    console.warn('[AIService] Failed for article:', article.headline?.slice(0, 40), err.message);
  }

  return article; // fallback: return unchanged
}

/**
 * Enhance a batch of articles concurrently (max 5 at a time to avoid rate limits).
 * @param {Array} articles
 * @param {Function} onProgress - called after each article is enhanced
 */
export async function enhanceBatch(articles, onProgress) {
  const CONCURRENCY = 5;
  const results = [...articles];

  for (let i = 0; i < articles.length; i += CONCURRENCY) {
    const batch = articles.slice(i, i + CONCURRENCY);
    const enhanced = await Promise.all(batch.map(enhanceArticle));
    enhanced.forEach((a, j) => {
      results[i + j] = a;
      onProgress?.(i + j, a);
    });
  }

  return results;
}
