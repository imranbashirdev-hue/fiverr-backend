const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeFiverrGigs(keyword) {
  const searchUrl = `https://www.fiverr.com/search/gigs?query=${encodeURIComponent(keyword)}&search_in=everywhere&source=top-bar`;
  const response = await axios.get(searchUrl, {
    headers: {
      'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
    }
  });
  const $ = cheerio.load(response.data);
  const urls = [];
  $('a[href*="/gigs/"]').each((i, el) => {
    let href = $(el).attr('href');
    if (href && href.startsWith('/')) href = 'https://www.fiverr.com' + href;
    if (href && !urls.includes(href) && urls.length < 20) urls.push(href);
  });
  return urls;
}

async function scrapeGigDetails(gigUrl) {
  const response = await axios.get(gigUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const $ = cheerio.load(response.data);
  return {
    title: $('h1').first().text().trim(),
    description: $('[data-testid="description"]').text().trim() || $('.p-description').text().trim(),
    price: $('.price-for-extra-fast .price-amount').first().text().trim(),
    sellerName: $('.seller-name').first().text().trim(),
    rating: $('.rating-score').first().text().trim(),
    deliveryTime: $('.delivery-time').first().text().trim(),
    revisions: $('.revisions-count').first().text().trim(),
    tags: $('.tags a').map((i,el) => $(el).text().trim()).get(),
    url: gigUrl
  };
}

module.exports = { scrapeFiverrGigs, scrapeGigDetails };