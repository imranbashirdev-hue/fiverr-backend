const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

// Health check (GET)
app.get('/', (req, res) => {
  res.json({ status: 'ok', message: 'Backend is alive' });
});

// Fiverr analyze endpoint (POST) - returns dummy CSV for testing
app.post('/api/analyze/fiverr', (req, res) => {
  const { keyword } = req.body;
  const dummyCsv = `originalTitle,optimizedTitle,aiSummary\n"${keyword} gig","Optimized ${keyword} gig - high conversion","Test analysis for debugging"`;
  res.json({ success: true, results: [], csv: dummyCsv });
});

// Upwork proposal endpoint (POST) - dummy proposal
app.post('/api/generate-proposal', (req, res) => {
  const { jobUrl } = req.body;
  res.json({ success: true, proposal: `I can help with this job: ${jobUrl}. Let's discuss further.` });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Backend running on port ${PORT}`);
});