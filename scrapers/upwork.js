const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeUpworkFreelancers(keyword) {
  const url = `https://www.upwork.com/nx/search/freelancers/?q=${encodeURIComponent(keyword)}`;
  const response = await axios.get(url, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const $ = cheerio.load(response.data);
  const profiles = [];
  $('.freelancer-tile').each((i, el) => {
    if (i >= 10) return;
    profiles.push({
      name: $(el).find('.freelancer-name').text().trim(),
      title: $(el).find('.title').text().trim(),
      hourlyRate: $(el).find('.rate').text().trim(),
      jobSuccess: $(el).find('.job-success').text().trim()
    });
  });
  return profiles;
}

module.exports = { scrapeUpworkFreelancers };