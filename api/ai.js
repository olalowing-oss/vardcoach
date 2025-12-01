/* eslint-disable no-console */
const fetch = global.fetch || ((...args) => import('node-fetch').then(({ default: fetchFn }) => fetchFn(...args)));

const OPENAI_API_KEY = process.env.OPENAI_API_KEY;
const OPENAI_URL = 'https://api.openai.com/v1/chat/completions';

module.exports = async (req, res) => {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle preflight
  if (req.method === 'OPTIONS') {
    res.status(200).end();
    return;
  }

  // Only POST allowed
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

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
};
