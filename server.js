require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { scrapeFiverrGigs, scrapeGigDetails } = require('./scrapers/fiverr');
const { scrapeUpworkFreelancers } = require('./scrapers/upwork');
const { scrapeJobPost } = require('./scrapers/jobScraper');
const { aiDebateForGig, aiDebateForFreelancer, generateProposalFromJob } = require('./utils/aiDebate');
const { generateCSV } = require('./utils/csv');

const app = express();
app.use(cors());
app.use(express.json());

// Health check (Render ko pasand hai)
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is running' });
});

// Fiverr: analyze top 20 gigs
app.post('/api/analyze/fiverr', async (req, res) => {
  const { keyword } = req.body;
  try {
    const gigUrls = await scrapeFiverrGigs(keyword);
    if (!gigUrls.length) return res.status(404).json({ error: 'No gigs found' });

    const results = [];
    for (let i = 0; i < Math.min(gigUrls.length, 20); i++) {
      try {
        const gigDetails = await scrapeGigDetails(gigUrls[i]);
        const optimized = await aiDebateForGig(gigDetails);
        results.push({ original: gigDetails, optimized });
      } catch (err) {
        console.error(`Error on gig ${i}:`, err.message);
      }
    }
    const csv = await generateCSV(results, 'fiverr');
    res.json({ success: true, results, csv });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Upwork freelancer analysis
app.post('/api/analyze/upwork/freelancers', async (req, res) => {
  const { keyword } = req.body;
  try {
    const profiles = await scrapeUpworkFreelancers(keyword);
    const results = [];
    for (const profile of profiles) {
      const optimized = await aiDebateForFreelancer(profile);
      results.push({ original: profile, optimized });
    }
    const csv = await generateCSV(results, 'upwork');
    res.json({ success: true, results, csv });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Upwork job post → proposal
app.post('/api/generate-proposal', async (req, res) => {
  const { jobUrl } = req.body;
  try {
    const jobDetails = await scrapeJobPost(jobUrl);
    const proposal = await generateProposalFromJob(jobDetails);
    res.json({ success: true, proposal });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Proxy running on port ${PORT}`));