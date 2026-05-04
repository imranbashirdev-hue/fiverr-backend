const axios = require('axios');
const cheerio = require('cheerio');

async function scrapeJobPost(jobUrl) {
  const response = await axios.get(jobUrl, {
    headers: { 'User-Agent': 'Mozilla/5.0' }
  });
  const $ = cheerio.load(response.data);
  return {
    title: $('h1').first().text().trim(),
    description: $('[data-testid="job-description"]').text().trim() || $('.job-description').text().trim(),
    budget: $('[data-testid="budget"]').text().trim() || $('.budget').text().trim(),
    experienceLevel: $('[data-testid="experience-level"]').text().trim(),
    skills: $('.skills-badge').map((i,el) => $(el).text().trim()).get(),
    clientCountry: $('[data-testid="client-location"]').text().trim(),
    url: jobUrl
  };
}

module.exports = { scrapeJobPost };