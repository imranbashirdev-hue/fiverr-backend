const express = require('express');
const cors = require('cors');
const app = express();

app.use(cors());
app.use(express.json());

app.get('/', (req, res) => res.json({ status: 'ok', message: 'Backend alive' }));

app.post('/api/analyze/fiverr', (req, res) => {
  const { keyword } = req.body;
  const results = [];
  // Create 20 dummy results
  for (let i = 0; i < 20; i++) {
    results.push({
      original: {
        title: `${keyword} gig example ${i+1}`,
        description: 'This is a sample gig description',
        price: '$50',
        sellerName: 'seller_' + i,
        rating: '4.9',
        deliveryTime: '2 days',
        revisions: '2',
        tags: ['dummy', 'test'],
        url: `https://fiverr.com/gig${i+1}`
      },
      optimized: {
        analysis: `AI suggestion: Improve ${keyword} gig with better keywords and social proof.`,
        optimizedData: `Title: Professional ${keyword} in 24h\nDescription: High-quality custom service\nPrice: $75`
      }
    });
  }
  
  // Generate CSV rows
  const csvRows = ['originalTitle,optimizedTitle,originalDescription,optimizedDescription,originalPrice,suggestedPrice,aiSummary'];
  results.forEach(r => {
    const optTitle = (r.optimized.optimizedData.split('\n')[0] || '').replace('Title: ', '');
    const optDesc = (r.optimized.optimizedData.split('\n')[1] || '').replace('Description: ', '');
    const optPrice = (r.optimized.optimizedData.split('\n')[2] || '').replace('Price: ', '');
    csvRows.push(`"${r.original.title}","${optTitle}","${r.original.description}","${optDesc}","${r.original.price}","${optPrice}","${r.optimized.analysis}"`);
  });
  
  const csv = csvRows.join('\n');
  res.json({ success: true, results, csv });
});

app.post('/api/generate-proposal', (req, res) => {
  res.json({ success: true, proposal: `I can help with this job: ${req.body.jobUrl}` });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log(`Backend running on port ${PORT}`));