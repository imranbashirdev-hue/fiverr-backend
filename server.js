require('dotenv').config();
const express = require('express');
const cors = require('cors');
const axios = require('axios');
const app = express();

app.use(cors());
app.use(express.json());

// Groq and Gemini API endpoints
const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';
const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

// Helper: Call Groq
async function callGroq(prompt) {
  const res = await axios.post(GROQ_API, {
    model: 'llama-3.3-70b-versatile',
    messages: [{ role: 'user', content: prompt }],
    temperature: 0.7
  }, {
    headers: {
      Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
      'Content-Type': 'application/json'
    }
  });
  return res.data.choices[0].message.content;
}

// Helper: Call Gemini
async function callGemini(prompt) {
  const res = await axios.post(`${GEMINI_API}?key=${process.env.GEMINI_API_KEY}`, {
    contents: [{ parts: [{ text: prompt }] }]
  });
  return res.data.candidates[0].content.parts[0].text;
}

// AI Debate for a gig
async function aiDebateForGig(gigDetails) {
  const initialPrompt = `You are a Fiverr gig optimization expert. Analyze this competitor gig: ${JSON.stringify(gigDetails)}. Provide strengths, weaknesses, and specific improvements for title, description, pricing, tags. Keep under 500 words.`;
  const groqAnalysis = await callGroq(initialPrompt);
  const geminiImprovement = await callGemini(`Review this analysis and produce a final optimized gig structure (title, description, pricing, tags). ${groqAnalysis}`);
  return { analysis: groqAnalysis, optimizedData: geminiImprovement };
}

// Dummy scraper (no real HTTP calls – avoids 403)
async function scrapeDummyGigs(keyword) {
  const gigs = [];
  for (let i = 0; i < 20; i++) {
    gigs.push({
      title: `${keyword} – Gig ${i+1} by top seller`,
      description: 'Professional service with fast delivery and high quality. Includes unlimited revisions and source files.',
      price: i % 2 === 0 ? '$50' : '$75',
      sellerName: `seller_${i+1}`,
      rating: (4.5 + (i % 5) * 0.1).toFixed(1),
      deliveryTime: i % 3 === 0 ? '1 day' : '2 days',
      revisions: i % 2 === 0 ? '2 revisions' : '5 revisions',
      tags: [keyword, 'professional', 'top rated'],
      url: `https://fiverr.com/dummy-gig-${i+1}`
    });
  }
  return gigs;
}

// Main endpoint
app.post('/api/analyze/fiverr', async (req, res) => {
  try {
    const { keyword } = req.body;
    const gigs = await scrapeDummyGigs(keyword);
    const results = [];
    for (let i = 0; i < gigs.length; i++) {
      try {
        const optimized = await aiDebateForGig(gigs[i]);
        results.push({ original: gigs[i], optimized });
      } catch (err) {
        console.error(`Gig ${i} AI failed:`, err.message);
        // Fallback dummy analysis
        results.push({
          original: gigs[i],
          optimized: { analysis: "AI analysis failed (check API keys)", optimizedData: "Fallback optimization" }
        });
      }
    }
    // Generate CSV
    const csvRows = ['originalTitle,optimizedTitle,originalDescription,optimizedDescription,originalPrice,suggestedPrice,aiSummary'];
    results.forEach(r => {
      const optTitle = extractField(r.optimized.optimizedData, 'title');
      const optDesc = extractField(r.optimized.optimizedData, 'description');
      const optPrice = extractField(r.optimized.optimizedData, 'price');
      csvRows.push(`"${r.original.title}","${optTitle}","${r.original.description}","${optDesc}","${r.original.price}","${optPrice}","${r.optimized.analysis}"`);
    });
    const csv = csvRows.join('\n');
    res.json({ success: true, results, csv });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: err.message });
  }
});

// Helper to extract fields from AI text
function extractField(text, fieldName) {
  const regex = new RegExp(`${fieldName}:\\s*(.+?)(\\n|$)`, 'i');
  const match = text.match(regex);
  return match ? match[1].trim() : '';
}

app.post('/api/generate-proposal', async (req, res) => {
  try {
    const { jobUrl } = req.body;
    const proposal = await callGroq(`Write an Upwork proposal for this job: ${jobUrl}. Include a hook, past results, and 2 smart questions. Max 500 chars.`);
    const improved = await callGemini(`Improve this proposal: ${proposal}`);
    res.json({ success: true, proposal: improved });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/', (req, res) => res.json({ status: 'ok', message: 'Backend alive' }));

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));