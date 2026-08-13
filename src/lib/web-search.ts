/**
 * 实时网络搜索 — 替代静态知识库假数据。
 * 每次用户提问时现场搜索，返回带真实 URL 的结果。
 *
 * 优先级：Brave Search API > DuckDuckGo（免费）
 */

interface SearchResult {
  title: string;
  snippet: string;
  url: string;
}

const SEARCH_TIMEOUT = 8000; // ms per provider

/** DuckDuckGo HTML 搜索（免费，无需 API key） */
async function searchDuckDuckGo(query: string): Promise<SearchResult[]> {
  try {
    const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(query)}`;
    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), SEARCH_TIMEOUT);

    const response = await fetch(url, {
      headers: { 'User-Agent': 'Mingdao/1.0 (career-planning-tool)' },
      signal: controller.signal,
    });
    clearTimeout(timer);

    if (!response.ok) {
      console.error(`[web-search] DuckDuckGo returned HTTP ${response.status}`);
      return [];
    }

    const html = await response.text();

    // 解析 DuckDuckGo HTML 结果
    const results: SearchResult[] = [];
    const linkRegex = /<a[^>]*class="result__a"[^>]*href="([^"]*)"[^>]*>([^<]*)<\/a>/gi;
    const snippetRegex = /<a[^>]*class="result__snippet"[^>]*>([\s\S]*?)<\/a>/gi;

    let linkMatch: RegExpExecArray | null;
    const links: { url: string; title: string }[] = [];
    while ((linkMatch = linkRegex.exec(html)) !== null && links.length < 10) {
      const rawUrl = linkMatch[1];
      // DuckDuckGo wraps URLs in redirect — extract real URL
      try {
        const urlMatch = rawUrl.match(/uddg=(https?%3A.*?)(?:&|$)/);
        const realUrl = urlMatch ? decodeURIComponent(urlMatch[1]) : rawUrl;
        const title = linkMatch[2].replace(/<[^>]*>/g, '').trim();
        if (realUrl.startsWith('http') && title) {
          links.push({ url: realUrl, title });
        }
      } catch {
        // skip malformed URL
      }
    }

    const snippets: string[] = [];
    while ((linkMatch = snippetRegex.exec(html)) !== null && snippets.length < links.length) {
      snippets.push(linkMatch[1].replace(/<[^>]*>/g, '').trim());
    }

    for (let i = 0; i < links.length; i++) {
      results.push({
        title: links[i].title,
        url: links[i].url,
        snippet: snippets[i] || '',
      });
    }

    return results;
  } catch (err) {
    console.error('[web-search] DuckDuckGo search failed:', err instanceof Error ? err.message : err);
    return [];
  }
}

/** Brave Search API（需要 BRAVE_SEARCH_API_KEY） */
async function searchBrave(query: string): Promise<SearchResult[]> {
  try {
    const apiKey = process.env.BRAVE_SEARCH_API_KEY;
    if (!apiKey) return [];

    const controller = new AbortController();
    const timer = setTimeout(() => controller.abort(), SEARCH_TIMEOUT);

    const response = await fetch(
      `https://api.search.brave.com/res/v1/web/search?q=${encodeURIComponent(query)}&count=10`,
      {
        headers: {
          'Accept': 'application/json',
          'Accept-Encoding': 'gzip',
          'X-Subscription-Token': apiKey,
        },
        signal: controller.signal,
      }
    );
    clearTimeout(timer);

    if (!response.ok) {
      console.error(`[web-search] Brave returned HTTP ${response.status}`);
      return [];
    }

    const data = await response.json();
    return (data.web?.results || []).map((r: { title: string; description: string; url: string }) => ({
      title: r.title,
      snippet: r.description || '',
      url: r.url,
    }));
  } catch (err) {
    console.error('[web-search] Brave search failed:', err instanceof Error ? err.message : err);
    return [];
  }
}

/** 实时网络搜索 */
export async function searchWeb(query: string): Promise<SearchResult[]> {
  try {
    // 优先 Brave（质量更好）
    const braveResults = await searchBrave(query);
    if (braveResults.length > 0) return braveResults;

    // 回退 DuckDuckGo
    return searchDuckDuckGo(query);
  } catch (err) {
    console.error('[web-search] search failed:', err);
    return [];
  }
}
