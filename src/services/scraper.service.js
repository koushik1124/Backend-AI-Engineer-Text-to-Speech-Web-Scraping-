const axios = require('axios');
const cheerio = require('cheerio');

class ScraperService {
    /**
     * Fetches raw content with stealth headers to bypass anti-scraping measures.
     * Designed to handle production websites by mimicking a real browser session.
     */
    async getRawContent(url) {
        try {
            const { data } = await axios.get(url, {
                // Full Header Stack (Fingerprinting)
                headers: {
                    'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/121.0.0.0 Safari/537.36',
                    'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/ *;q=0.8',
                    'Accept-Language': 'en-US,en;q=0.5',
                    'Accept-Encoding': 'gzip, deflate, br',
                    'Referer': 'https://www.google.com/',
                    'DNT': '1',
                    'Connection': 'keep-alive',
                    'Upgrade-Insecure-Requests': '1',
                    'Sec-Fetch-Dest': 'document',
                    'Sec-Fetch-Mode': 'navigate',
                    'Sec-Fetch-Site': 'cross-site'
                },
                timeout: 15000, // Increased timeout for heavy production sites
                maxRedirects: 5,
                validateStatus: (status) => status >= 200 && status < 300
            });

            const $ = cheerio.load(data);

            // 1. Clean DOM: Remove irrelevant elements to optimize token usage
            $('script, style, nav, footer, header, noscript, iframe, link, svg').remove();

            // 2. Metadata Extraction: Help the LLM identify the page context
            const pageTitle = $('title').text();
            const metaDescription = $('meta[name="description"]').attr('content') || '';
            
            // 3. Content Extraction: Focus on the main content area if possible
            // We use common "main" selectors but fallback to body
            const mainContent = $('main, #content, .main, article').first().text() || $('body').text();

            // Return a clean, context-rich string for the LLM
            return `
                Context: ${pageTitle} | ${metaDescription}
                Content: ${mainContent.replace(/\s+/g, ' ').trim().substring(0, 15000)}
            `;
        } catch (error) {
            // Senior Move: Informative error handling for debugging blocks
            if (error.response) {
                const status = error.response.status;
                if (status === 403) throw new Error(`Access Forbidden (403): ${url} likely has strong Anti-Bot protection.`);
                if (status === 429) throw new Error(`Rate Limited (429): Too many requests to ${url}.`);
                throw new Error(`Server Error (${status}) when fetching ${url}`);
            }
            throw new Error(`Network/Request Error: ${error.message}`);
        }
    }
}

module.exports = new ScraperService();