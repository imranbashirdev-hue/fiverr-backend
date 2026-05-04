const { Parser } = require('json2csv');

async function generateCSV(results, type) {
  let fields, data;
  if (type === 'fiverr') {
    fields = ['originalTitle', 'optimizedTitle', 'originalDescription', 'optimizedDescription', 'originalPrice', 'suggestedPrice', 'aiSummary'];
    data = results.map(r => ({
      originalTitle: r.original.title,
      optimizedTitle: extractOptimizedField(r.optimized.optimizedData, 'title'),
      originalDescription: r.original.description,
      optimizedDescription: extractOptimizedField(r.optimized.optimizedData, 'description'),
      originalPrice: r.original.price,
      suggestedPrice: extractOptimizedField(r.optimized.optimizedData, 'price'),
      aiSummary: r.optimized.analysis
    }));
  } else {
    fields = ['originalName', 'optimizedTitle', 'aiAnalysis'];
    data = results.map(r => ({
      originalName: r.original.name,
      optimizedTitle: r.optimized.analysis,
      aiAnalysis: r.optimized.analysis
    }));
  }
  const parser = new Parser({ fields });
  return parser.parse(data);
}

function extractOptimizedField(optimizedText, fieldName) {
  // Simple extraction – you can improve regex
  if (optimizedText.includes(fieldName + ':')) {
    const match = optimizedText.match(new RegExp(`${fieldName}:\\s*(.+?)(\\n|$)`));
    return match ? match[1] : optimizedText.substring(0, 100);
  }
  return optimizedText.substring(0, 100);
}

module.exports = { generateCSV };