const axios = require('axios');
const cheerio = require('cheerio');

class ScraperService {
    async getRawContent(url) {
        try {
            const { data } = await axios.get(url, {
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
            });
            const $ = cheerio.load(data);
            
            //To Remove noise like scripts, styles, and nav to save tokens
            $('script, style, nav, footer, header, noscript').remove();
            
            // Return the body text—this contains the product info regardless of the site structure
            return $('body').text().replace(/\s+/g, ' ').trim();
        } catch (error) {
            throw new Error(`Failed to fetch ${url}: ${error.message}`);
        }
    }
}

module.exports = new ScraperService();