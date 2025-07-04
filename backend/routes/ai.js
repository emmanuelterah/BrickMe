const express = require('express');
const OpenAI = require('openai');
const auth = require('../middleware/auth');

const router = express.Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

// POST /api/ai/chat
router.post('/chat', auth, async (req, res) => {
  const { prompt } = req.body;
  if (!prompt) return res.status(400).json({ message: 'Prompt is required' });
  try {
    const completion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo',
      messages: [
        { role: 'system', content: 'You are a helpful assistant for a Lego art app.' },
        { role: 'user', content: prompt },
      ],
      max_tokens: 500,
    });
    res.json({ response: completion.choices[0].message.content });
  } catch (err) {
    res.status(500).json({ message: 'AI request failed', error: err.message });
  }
});

module.exports = router; 