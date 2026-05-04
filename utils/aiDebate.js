const axios = require('axios');

const GROQ_API = 'https://api.groq.com/openai/v1/chat/completions';
const GEMINI_API = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent';

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

async function callGemini(prompt) {
  const res = await axios.post(`${GEMINI_API}?key=${process.env.GEMINI_API_KEY}`, {
    contents: [{ parts: [{ text: prompt }] }]
  });
  return res.data.candidates[0].content.parts[0].text;
}

async function aiDebateForGig(gigDetails) {
  const initialPrompt = `You are a Fiverr gig optimization expert. Analyze this competitor gig: ${JSON.stringify(gigDetails)}. Provide: strengths, weaknesses, and specific improvements for title, description, pricing, tags. Keep under 500 words.`;
  const groqFirst = await callGroq(initialPrompt);
  const geminiPrompt = `Review the following analysis and produce a final optimized gig structure (title, description, pricing packages, tags) with a short debate summary. ${groqFirst}`;
  const final = await callGemini(geminiPrompt);
  return { analysis: groqFirst, optimizedData: final };
}

async function aiDebateForFreelancer(profile) {
  const prompt = `Optimize this Upwork profile: ${JSON.stringify(profile)}. Suggest better title, overview, and skills.`;
  const result = await callGroq(prompt);
  return { analysis: result };
}

async function generateProposalFromJob(jobDetails) {
  const groqPrompt = `Generate a personalized Upwork proposal for this job: ${JSON.stringify(jobDetails)}. Include a hook, 2-3 relevant past results, and 2 smart questions. Max 500 chars.`;
  const groqDraft = await callGroq(groqPrompt);
  const geminiImproved = await callGemini(`Improve this proposal to be more concise and compelling: ${groqDraft}`);
  return geminiImproved;
}

module.exports = { aiDebateForGig, aiDebateForFreelancer, generateProposalFromJob };