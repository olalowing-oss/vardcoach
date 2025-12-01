/* eslint-disable no-console */
const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const fetch = global.fetch || ((...args) => import('node-fetch').then(({ default: fetchFn }) => fetchFn(...args)));

dotenv.config();
dotenv.config({ path: '.env.local', override: true });

const app = express();
const PORT = process.env.PORT || 5001;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY || process.env.REACT_APP_OPENAI_API_KEY;
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

if (!OPENAI_API_KEY) {
  console.warn('⚠️ Ingen OPENAI_API_KEY hittades i serverns miljövariabler.');
}

app.use(cors());
app.use(express.json());

app.post('/api/ai', async (req, res) => {
  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI-nyckel saknas på servern.' });
  }

  const { prompt, options = {} } = req.body || {};
  if (!prompt) {
    return res.status(400).json({ error: 'prompt saknas i begäran.' });
  }

  try {
    const systemPrompt = options.systemPrompt || 'Du är en hjälpsam svensk vårdassistent.';
    const model = options.model || process.env.OPENAI_MODEL || 'gpt-4o-mini';
    const messages = [
      { role: 'system', content: systemPrompt },
      { role: 'user', content: prompt }
    ];

    const response = await fetch(OPENAI_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        Authorization: `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model,
        temperature: options.temperature ?? 0.2,
        max_tokens: options.maxTokens || 600,
        messages,
      }),
    });

    if (!response.ok) {
      const errorBody = await response.text();
      console.error('OpenAI API error:', errorBody);
      return res.status(response.status).json({ error: 'OpenAI error', details: errorBody });
    }

    const data = await response.json();
    return res.json(data);
  } catch (error) {
    console.error('Proxy error:', error);
    return res.status(500).json({ error: 'Kunde inte kontakta OpenAI.' });
  }
});

app.listen(PORT, () => {
  console.log(`🛡 AI-proxy server körs på http://localhost:${PORT}`);
});
